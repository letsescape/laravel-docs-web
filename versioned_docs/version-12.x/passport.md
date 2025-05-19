# 라라벨 패스포트 (Laravel Passport)

- [소개](#introduction)
    - [Passport와 Sanctum 중 어떤 것을 선택할까?](#passport-or-sanctum)
- [설치](#installation)
    - [Passport 배포](#deploying-passport)
    - [Passport 업그레이드](#upgrading-passport)
- [설정](#configuration)
    - [토큰 수명](#token-lifetimes)
    - [기본 모델 오버라이드](#overriding-default-models)
    - [라우트 오버라이드](#overriding-routes)
- [Authorization Code Grant](#authorization-code-grant)
    - [클라이언트 관리](#managing-clients)
    - [토큰 요청하기](#requesting-tokens)
    - [토큰 관리](#managing-tokens)
    - [토큰 갱신](#refreshing-tokens)
    - [토큰 폐기](#revoking-tokens)
    - [토큰 정리](#purging-tokens)
- [Authorization Code Grant With PKCE](#code-grant-pkce)
    - [PKCE 클라이언트 생성](#creating-a-auth-pkce-grant-client)
    - [토큰 요청하기](#requesting-auth-pkce-grant-tokens)
- [Device Authorization Grant](#device-authorization-grant)
    - [Device Code Grant 클라이언트 생성](#creating-a-device-authorization-grant-client)
    - [토큰 요청하기](#requesting-device-authorization-grant-tokens)
- [Password Grant](#password-grant)
    - [Password Grant 클라이언트 생성](#creating-a-password-grant-client)
    - [토큰 요청하기](#requesting-password-grant-tokens)
    - [모든 스코프 요청하기](#requesting-all-scopes)
    - [User Provider 커스터마이징](#customizing-the-user-provider)
    - [Username 필드 커스터마이징](#customizing-the-username-field)
    - [비밀번호 검증 커스터마이징](#customizing-the-password-validation)
- [Implicit Grant](#implicit-grant)
- [Client Credentials Grant](#client-credentials-grant)
- [Personal Access Tokens](#personal-access-tokens)
    - [Personal Access 클라이언트 생성](#creating-a-personal-access-client)
    - [User Provider 커스터마이징](#customizing-the-user-provider-for-pat)
    - [Personal Access Token 관리](#managing-personal-access-tokens)
- [라우트 보호하기](#protecting-routes)
    - [미들웨어로 보호](#via-middleware)
    - [액세스 토큰 전달](#passing-the-access-token)
- [토큰 스코프](#token-scopes)
    - [스코프 정의](#defining-scopes)
    - [기본 스코프](#default-scope)
    - [토큰에 스코프 할당](#assigning-scopes-to-tokens)
    - [스코프 확인](#checking-scopes)
- [SPA 인증](#spa-authentication)
- [이벤트](#events)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

[Laravel Passport](https://github.com/laravel/passport)는 라라벨 애플리케이션을 위한 완전한 OAuth2 서버 구현체를 몇 분 만에 구축할 수 있도록 제공합니다. Passport는 Andy Millington과 Simon Hamp가 관리하는 [League OAuth2 서버](https://github.com/thephpleague/oauth2-server)를 기반으로 만들어졌습니다.

> [!NOTE]
> 이 문서에서는 여러분이 이미 OAuth2에 대해 익숙하다고 가정합니다. 만약 OAuth2에 대해 잘 모른다면, 계속 읽기 전에 [용어](https://oauth2.thephpleague.com/terminology/)와 주요 특징을 먼저 숙지할 것을 권장합니다.

<a name="passport-or-sanctum"></a>
### Passport와 Sanctum 중 어떤 것을 선택할까?

시작하기 전에, 여러분의 애플리케이션에 Laravel Passport와 [Laravel Sanctum](/docs/12.x/sanctum) 중 어떤 것이 더 적합한지 선택하는 것이 좋습니다. 만약 애플리케이션에 반드시 OAuth2를 지원해야 한다면 Laravel Passport를 사용해야 합니다.

하지만 단일 페이지 애플리케이션(SPA), 모바일 앱 인증, 또는 API 토큰 발급 등이 목적이라면 [Laravel Sanctum](/docs/12.x/sanctum)을 사용하는 것이 더 적합합니다. Laravel Sanctum은 OAuth2를 지원하지 않지만, 훨씬 간단한 API 인증 개발경험을 제공합니다.

<a name="installation"></a>
## 설치

라라벨 패스포트는 `install:api` 아티즌 명령어를 통해 설치할 수 있습니다:

```shell
php artisan install:api --passport
```

이 명령어를 실행하면, OAuth2 클라이언트 및 액세스 토큰을 저장할 테이블 생성을 위한 데이터베이스 마이그레이션이 퍼블리시 및 실행됩니다. 또한, 보안 액세스 토큰 생성을 위한 암호화 키도 함께 생성됩니다.

`install:api` 명령 실행 후, `App\Models\User` 모델에 `Laravel\Passport\HasApiTokens` 트레이트와 `Laravel\Passport\Contracts\OAuthenticatable` 인터페이스를 추가해야 합니다. 이 트레이트는 인증된 사용자의 토큰과 스코프를 확인할 수 있는 몇 가지 헬퍼 메서드를 제공합니다:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\Contracts\OAuthenticatable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable implements OAuthenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}
```

마지막으로, 애플리케이션의 `config/auth.php` 설정 파일에서 `api` 인증 가드를 정의하고, 해당 `driver` 옵션을 `passport`로 설정해야 합니다. 이렇게 하면, API 요청을 인증할 때 Passport의 `TokenGuard`를 사용하도록 애플리케이션에 지시하게 됩니다:

```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],

    'api' => [
        'driver' => 'passport',
        'provider' => 'users',
    ],
],
```

<a name="deploying-passport"></a>
### Passport 배포

Passport를 실서버에 처음 배포할 때에는 `passport:keys` 명령어를 실행해야 하는 경우가 많습니다. 이 명령어는 Passport가 액세스 토큰을 생성할 때 사용하는 암호화 키를 생성해 줍니다. 생성된 키 파일들은 일반적으로 소스 컨트롤에 포함시키지 않습니다.

```shell
php artisan passport:keys
```

필요에 따라 Passport 키 파일을 로드할 경로도 지정할 수 있습니다. 이를 위해서는 `Passport::loadKeysFrom` 메서드를 사용할 수 있는데, 일반적으로 이 메서드는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출합니다:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::loadKeysFrom(__DIR__.'/../secrets/oauth');
}
```

<a name="loading-keys-from-the-environment"></a>
#### 환경변수에서 키 로드하기

또는, 아래처럼 `vendor:publish` 아티즌 명령어를 통해 Passport의 설정 파일을 퍼블리시할 수도 있습니다:

```shell
php artisan vendor:publish --tag=passport-config
```

설정 파일이 퍼블리시된 이후에는 환경 변수로 암호화 키를 지정해 Passport가 해당 키를 사용하게 할 수 있습니다:

```ini
PASSPORT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
<private key here>
-----END RSA PRIVATE KEY-----"

PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
<public key here>
-----END PUBLIC KEY-----"
```

<a name="upgrading-passport"></a>
### Passport 업그레이드

Passport를 새로운 주요 버전으로 업그레이드할 때에는 반드시 [업그레이드 가이드](https://github.com/laravel/passport/blob/master/UPGRADE.md)를 꼼꼼히 확인해야 합니다.

<a name="configuration"></a>
## 설정

<a name="token-lifetimes"></a>
### 토큰 수명

기본적으로 Passport에서는 1년 동안 유효한 장기 액세스 토큰을 발급합니다. 토큰 수명을 더 길게 또는 짧게 설정하려면, `tokensExpireIn`, `refreshTokensExpireIn`, `personalAccessTokensExpireIn` 메서드를 사용할 수 있습니다. 이 메서드들은 보통 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다:

```php
use Carbon\CarbonInterval;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::tokensExpireIn(CarbonInterval::days(15));
    Passport::refreshTokensExpireIn(CarbonInterval::days(30));
    Passport::personalAccessTokensExpireIn(CarbonInterval::months(6));
}
```

> [!WARNING]
> Passport 데이터베이스 테이블의 `expires_at` 컬럼은 읽기 전용이며, 단지 표시 목적에만 사용됩니다. 토큰 발급 시 Passport는 만료 정보를 서명 및 암호화된 토큰 내부에 저장합니다. 토큰을 무효화(폐기)할 필요가 있다면 [토큰 폐기](#revoking-tokens)를 참고하세요.

<a name="overriding-default-models"></a>
### 기본 모델 오버라이드

Passport 내부적으로 사용하는 모델을 자신이 정의한 모델로 확장하고 싶다면, 해당 Passport 모델을 상속받아 작성할 수 있습니다:

```php
use Laravel\Passport\Client as PassportClient;

class Client extends PassportClient
{
    // ...
}
```

모델을 정의한 뒤에는, `Laravel\Passport\Passport` 클래스를 통해 Passport가 여러분의 커스텀 모델을 사용하도록 지정해야 합니다. 보통 이 설정도 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드 내에서 처리합니다:

```php
use App\Models\Passport\AuthCode;
use App\Models\Passport\Client;
use App\Models\Passport\DeviceCode;
use App\Models\Passport\RefreshToken;
use App\Models\Passport\Token;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::useTokenModel(Token::class);
    Passport::useRefreshTokenModel(RefreshToken::class);
    Passport::useAuthCodeModel(AuthCode::class);
    Passport::useClientModel(Client::class);
    Passport::useDeviceCodeModel(DeviceCode::class)
}
```

<a name="overriding-routes"></a>
### 라우트 오버라이드

Passport가 정의하는 라우트를 커스터마이즈하고 싶은 경우, 먼저 애플리케이션의 `AppServiceProvider`의 `register` 메서드에 `Passport::ignoreRoutes`를 추가하여 Passport가 기본 라우트를 등록하지 않도록 설정해야 합니다:

```php
use Laravel\Passport\Passport;

/**
 * Register any application services.
 */
public function register(): void
{
    Passport::ignoreRoutes();
}
```

그런 다음, [Passport 라우트 파일](https://github.com/laravel/passport/blob/master/routes/web.php)에 정의된 라우트를 여러분의 애플리케이션의 `routes/web.php` 파일로 복사해서 원하는 대로 수정할 수 있습니다:

```php
Route::group([
    'as' => 'passport.',
    'prefix' => config('passport.path', 'oauth'),
    'namespace' => '\Laravel\Passport\Http\Controllers',
], function () {
    // Passport routes...
});
```

<a name="authorization-code-grant"></a>
## Authorization Code Grant

OAuth2를 Authorization Code 방식으로 사용하는 것은 대부분의 개발자들이 가장 익숙하게 접하는 방식입니다. 이 방식에서는 클라이언트 애플리케이션이 사용자를 여러분의 서버로 리디렉션 시키고, 사용자는 액세스 토큰을 해당 클라이언트에 발급해도 되는지 승인 또는 거부하게 됩니다.

먼저, Passport가 "인가(authorization)" 뷰를 어떻게 반환해야 할지 지정해야 합니다.

인가 뷰를 렌더링하는 모든 로직은 `Laravel\Passport\Passport` 클래스에서 제공하는 적절한 메서드를 사용하여 커스터마이징할 수 있습니다. 보통 이 메서드는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출합니다:

```php
use Laravel\Passport\Passport;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    // 뷰 이름을 직접 지정하는 방법...
    Passport::authorizationView('auth.oauth.authorize');
    
    // 클로저를 사용하는 방법...
    Passport::authorizationView(fn ($parameters) => Inertia::render('Auth/OAuth/Authorize', [
        'request' => $parameters['request'],
        'authToken' => $parameters['authToken'],
        'client' => $parameters['client'],
        'user' => $parameters['user'],
        'scopes' => $parameters['scopes'],
    ]));
}
```

Passport는 `/oauth/authorize` 라우트를 자동으로 등록하며, 이 라우트가 위에서 정의한 뷰를 반환합니다. 여러분이 사용할 `auth.oauth.authorize` 템플릿에는, 인가를 승인하기 위해 `passport.authorizations.approve` 라우트로 POST 요청을 보내는 폼과, 인가를 거부하기 위해 `passport.authorizations.deny` 라우트로 DELETE 요청을 보내는 폼을 포함해야 합니다. 이 두 라우트는 각각 `state`, `client_id`, `auth_token` 필드를 기대합니다.

<a name="managing-clients"></a>
### 클라이언트 관리

여러분의 API와 상호작용하려는 애플리케이션을 만드는 개발자들은 자신들의 애플리케이션(클라이언트)을 여러분의 서비스에 등록해야 합니다. 보통은 애플리케이션의 이름과, 사용자가 인가를 승인한 후 리디렉트될 URI를 제공하게 됩니다.

<a name="managing-first-party-clients"></a>
#### 퍼스트파티(1st-party) 클라이언트

가장 간단하게 클라이언트를 생성하려면 `passport:client` 아티즌 명령어를 사용하면 됩니다. 이 명령어는 퍼스트파티 클라이언트 생성이나 OAuth2 기능 테스트에 유용합니다. 명령 실행 시, Passport는 클라이언트 정보들을 입력받고, 클라이언트 ID 및 시크릿을 출력해줍니다:

```shell
php artisan passport:client
```

여러 개의 리디렉트 URI를 허용하고자 한다면, 클라이언트 생성시 `passport:client` 명령어에서 URI를 입력할 때 쉼표로 구분하여 여러 URI를 지정할 수 있습니다. 만약 URI에 쉼표가 포함된다면, URI 인코딩을 반드시 적용해야 합니다:

```shell
https://third-party-app.com/callback,https://example.com/oauth/redirect
```

<a name="managing-third-party-clients"></a>
#### 서드파티(3rd-party) 클라이언트

여러분의 애플리케이션 사용자는 `passport:client` 명령어를 직접 실행할 수 없으므로, `Laravel\Passport\ClientRepository` 클래스의 `createAuthorizationCodeGrantClient` 메서드를 사용해 사용자를 위한 클라이언트를 등록할 수 있습니다:

```php
use App\Models\User;
use Laravel\Passport\ClientRepository;

$user = User::find($userId);

// 주어진 사용자에 속하는 OAuth 앱 클라이언트 생성...
$client = app(ClientRepository::class)->createAuthorizationCodeGrantClient(
    user: $user,
    name: 'Example App',
    redirectUris: ['https://third-party-app.com/callback'],
    confidential: false,
    enableDeviceFlow: true
);

// 사용자의 OAuth 앱 클라이언트 전체 조회...
$clients = $user->oauthApps()->get();
```

`createAuthorizationCodeGrantClient` 메서드는 `Laravel\Passport\Client` 인스턴스를 반환합니다. 이때 `$client->id`를 클라이언트 ID로, `$client->plainSecret`을 클라이언트 시크릿으로 사용자에게 제공하면 됩니다.

<a name="requesting-tokens"></a>
### 토큰 요청하기

<a name="requesting-tokens-redirecting-for-authorization"></a>
#### 인가 (Authorization) 요청을 위한 리디렉션

클라이언트가 생성되면, 개발자는 클라이언트 ID와 시크릿을 이용해 여러분의 애플리케이션에서 인가 코드와 액세스 토큰을 요청할 수 있습니다. 처음에는, 외부 애플리케이션이 여러분의 애플리케이션에 `/oauth/authorize` 경로로 다음과 같이 리디렉션 요청을 보내야 합니다:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Str;

Route::get('/redirect', function (Request $request) {
    $request->session()->put('state', $state = Str::random(40));

    $query = http_build_query([
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'response_type' => 'code',
        'scope' => 'user:read orders:create',
        'state' => $state,
        // 'prompt' => '', // "none", "consent", or "login"
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

`prompt` 파라미터는 Passport 애플리케이션의 인증 동작 방식을 지정할 때 사용합니다.

만약 `prompt` 값이 `none`이면, 사용자가 Passport 앱에 이미 인증돼 있지 않을 경우 Passport는 항상 인증 오류를 발생시킵니다. `consent`로 지정하면 모든 스코프가 이전에 해당 애플리케이션에 승인된 경우라도 무조건 승인 화면을 계속 출력합니다. `login`으로 지정하면 이미 세션이 있더라도 무조건 로그인을 다시 요구합니다.

별도의 `prompt` 값이 없다면, 사용자가 요청된 스코프에 대해 해당 애플리케이션에 아직 접근 권한을 부여하지 않은 경우에만 인가(승인) 화면이 나타납니다.

> [!NOTE]
> `/oauth/authorize` 라우트는 Passport가 이미 정의해 두었으므로 직접 정의할 필요가 없습니다.

<a name="approving-the-request"></a>
#### 요청 승인하기

인가 요청을 받을 때 Passport는 `prompt` 파라미터의 값에 따라(존재할 경우) 자동으로 동작하며, 사용자가 인가 요청을 승인하거나 거부할 수 있도록 템플릿을 표시할 수 있습니다. 사용자가 요청을 승인하면, 등록된 `redirect_uri` 값으로 리디렉션됩니다. 이 `redirect_uri`는 클라이언트 생성 시 명시한 값과 반드시 일치해야 합니다.

퍼스트파티 클라이언트처럼 경우에 따라 인가 승인 화면을 건너뛰고 싶을 때가 있습니다. 이럴 땐 [Client 모델을 오버라이드](#overriding-default-models)하고 `skipsAuthorization` 메서드를 정의하면 됩니다. 이 메서드가 `true`를 반환하면, 인가 화면 없이 즉시 승인되고, 사용자도 곧바로 `redirect_uri`로 이동됩니다(단, consuming 애플리케이션이 인가 요청 시 `prompt` 파라미터를 명시하지 않았을 경우):

```php
<?php

namespace App\Models\Passport;

use Illuminate\Contracts\Auth\Authenticatable;
use Laravel\Passport\Client as BaseClient;

class Client extends BaseClient
{
    /**
     * 이 클라이언트에 대해 인가 화면을 생략할지 여부를 결정합니다.
     *
     * @param  \Laravel\Passport\Scope[]  $scopes 
     */
    public function skipsAuthorization(Authenticatable $user, array $scopes): bool
    {
        return $this->firstParty();
    }
}
```

<a name="requesting-tokens-converting-authorization-codes-to-access-tokens"></a>
#### 인가 코드를 액세스 토큰으로 교환하기

사용자가 인가 요청을 승인하면 클라이언트(외부 앱)는 다시 `redirect_uri`로 리디렉션됩니다. 이때 소비자는 먼저 전달받은 `state` 파라미터가 리디렉션 전 세션에 저장했던 값과 일치하는지 확인해야 합니다. 값이 일치하면, 애플리케이션에 `POST` 요청을 보내 액세스 토큰을 교환 요청하게 됩니다. 이 요청에는 인가(authorization) 승인 과정에서 부여된 authorization code도 포함해야 합니다:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

Route::get('/callback', function (Request $request) {
    $state = $request->session()->pull('state');

    throw_unless(
        strlen($state) > 0 && $state === $request->state,
        InvalidArgumentException::class,
        'Invalid state value.'
    );

    $response = Http::asForm()->post('https://passport-app.test/oauth/token', [
        'grant_type' => 'authorization_code',
        'client_id' => 'your-client-id',
        'client_secret' => 'your-client-secret',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'code' => $request->code,
    ]);

    return $response->json();
});
```

이 `/oauth/token` 라우트는 `access_token`, `refresh_token`, `expires_in` 속성이 포함된 JSON 응답을 반환합니다. `expires_in`에는 액세스 토큰 만료까지 남은 초(second) 단위의 시간이 담겨 있습니다.

> [!NOTE]
> `/oauth/authorize` 라우트와 마찬가지로 `/oauth/token` 라우트 역시 Passport에서 자동 정의하므로 별도 정의가 필요 없습니다.

<a name="managing-tokens"></a>
### 토큰 관리

`Laravel\Passport\HasApiTokens` 트레이트에서 제공하는 `tokens` 메서드를 사용하면 사용자의 인가된 토큰 목록을 조회할 수 있습니다. 예를 들어, 여러분의 사용자들이 외부 앱(서드파티 앱)과의 연결 현황을 대시보드 형태로 확인할 수 있도록 처리할 수 있습니다:

```php
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Date;
use Laravel\Passport\Token;

$user = User::find($userId);

// 사용자에 대한 유효(valid) 토큰 전체 조회...
$tokens = $user->tokens()
    ->where('revoked', false)
    ->where('expires_at', '>', Date::now())
    ->get();

// 사용자의 서드파티 OAuth 앱 연결 전체 조회...
$connections = $tokens->load('client')
    ->reject(fn (Token $token) => $token->client->firstParty())
    ->groupBy('client_id')
    ->map(fn (Collection $tokens) => [
        'client' => $tokens->first()->client,
        'scopes' => $tokens->pluck('scopes')->flatten()->unique()->values()->all(),
        'tokens_count' => $tokens->count(),
    ])
    ->values();
```

<a name="refreshing-tokens"></a>
### 토큰 갱신

애플리케이션에서 단기 만료 액세스 토큰을 발급하는 경우, 사용자는 기존에 받았던 refresh token을 이용해 액세스 토큰을 갱신해야 합니다:

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'refresh_token',
    'refresh_token' => 'the-refresh-token',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret', // confidential 클라이언트만 필요...
    'scope' => 'user:read orders:create',
]);

return $response->json();
```

이 `/oauth/token` 라우트는 `access_token`, `refresh_token`, `expires_in` 속성이 포함된 JSON 응답을 반환합니다. `expires_in`에는 액세스 토큰이 만료될 때까지의 초(second) 단위 시간이 담겨 있습니다.

<a name="revoking-tokens"></a>
### 토큰 폐기

`Laravel\Passport\Token` 모델의 `revoke` 메서드를 사용하면 토큰을 폐기할 수 있습니다. 토큰의 refresh token을 폐기하려면 `Laravel\Passport\RefreshToken` 모델의 `revoke` 메서드를 사용하면 됩니다:

```php
use Laravel\Passport\Passport;
use Laravel\Passport\Token;

$token = Passport::token()->find($tokenId);

// 액세스 토큰 폐기...
$token->revoke();

// 토큰의 refresh token도 폐기...
$token->refreshToken?->revoke();

// 사용자의 모든 토큰 폐기...
User::find($userId)->tokens()->each(function (Token $token) {
    $token->revoke();
    $token->refreshToken?->revoke();
});
```

<a name="purging-tokens"></a>
### 토큰 정리

토큰이 폐기되었거나 만료된 후에는 데이터베이스에서 이를 정리하고 싶을 수 있습니다. Passport에 내장된 `passport:purge` 아티즌 명령어를 사용하면 관련 토큰을 쉽게 정리할 수 있습니다:

```shell
# 폐기되거나 만료된 토큰, 인가 코드, 디바이스 코드 정리...
php artisan passport:purge

# 6시간 이상 만료된 토큰만 정리...
php artisan passport:purge --hours=6

# 오직 폐기된 토큰, 인가 코드, 디바이스 코드만 정리...
php artisan passport:purge --revoked

# 오직 만료된 토큰, 인가 코드, 디바이스 코드만 정리...
php artisan passport:purge --expired
```

또한, 애플리케이션의 `routes/console.php` 파일에 [스케줄 작업](/docs/12.x/scheduling)을 추가해 정기적으로 토큰을 자동 정리하도록 설정할 수도 있습니다:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('passport:purge')->hourly();
```

<a name="code-grant-pkce"></a>
## Authorization Code Grant With PKCE

"Proof Key for Code Exchange"(PKCE)가 적용된 Authorization Code Grant는, 단일 페이지 애플리케이션(SPA) 또는 모바일 앱이 API에 안전하게 인증하도록 돕는 방식입니다. 클라이언트 시크릿을 비밀리에 안전하게 저장할 수 없는 상황이거나(예: 브라우저, 모바일), 인가 코드가 공격자에게 탈취되는 위험을 줄이고자 할 때 PKCE를 사용해야 합니다. 이때는 "code verifier"와 "code challenge" 조합이 클라이언트 시크릿을 대체해, 토큰 교환 시 보안을 강화합니다.

<a name="creating-a-auth-pkce-grant-client"></a>
### PKCE 클라이언트 생성

Authorization Code Grant with PKCE를 사용해 토큰을 발급하기 전에, 반드시 PKCE를 지원하는 클라이언트를 생성해야 합니다. 아래처럼 `passport:client` 아티즌 명령어에 `--public` 옵션을 추가해 클라이언트를 생성하면 됩니다:

```shell
php artisan passport:client --public
```

<a name="requesting-auth-pkce-grant-tokens"></a>
### 토큰 요청하기

<a name="code-verifier-code-challenge"></a>
#### Code Verifier와 Code Challenge

이 인증 방식에서는 클라이언트 시크릿을 사용하지 않으므로, 개발자는 토큰을 요청할 때 code verifier와 code challenge 조합을 만들어야 합니다.

code verifier는 [RFC 7636 사양](https://tools.ietf.org/html/rfc7636)에 정의된 대로, 영문/숫자 및 `"-"`, `"."`, `"_"`, `"~"` 문자가 포함된 43~128자 사이의 랜덤 문자열이어야 합니다.

code challenge는 URL 및 파일명에 안전한(즉, URL-safe) Base64 인코딩 문자열로 생성되어야 하며, 끝의 `'='` 문자는 제거하고 줄바꿈이나 공백, 기타 문자가 포함되어서는 안 됩니다.

```php
$encoded = base64_encode(hash('sha256', $codeVerifier, true));

$codeChallenge = strtr(rtrim($encoded, '='), '+/', '-_');
```

<a name="code-grant-pkce-redirecting-for-authorization"></a>

#### 인가 요청을 위한 리다이렉트

클라이언트가 생성된 후에는, 클라이언트 ID와 생성된 코드 검증자(code verifier), 코드 챌린지(code challenge)를 이용해 애플리케이션에서 인가 코드와 액세스 토큰을 요청할 수 있습니다. 먼저, 외부 애플리케이션은 여러분의 애플리케이션의 `/oauth/authorize` 경로로 리다이렉트 요청을 보내야 합니다.

```php
use Illuminate\Http\Request;
use Illuminate\Support\Str;

Route::get('/redirect', function (Request $request) {
    $request->session()->put('state', $state = Str::random(40));

    $request->session()->put(
        'code_verifier', $codeVerifier = Str::random(128)
    );

    $codeChallenge = strtr(rtrim(
        base64_encode(hash('sha256', $codeVerifier, true))
    , '='), '+/', '-_');

    $query = http_build_query([
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'response_type' => 'code',
        'scope' => 'user:read orders:create',
        'state' => $state,
        'code_challenge' => $codeChallenge,
        'code_challenge_method' => 'S256',
        // 'prompt' => '', // "none", "consent", or "login"
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

<a name="code-grant-pkce-converting-authorization-codes-to-access-tokens"></a>
#### 인가 코드를 액세스 토큰으로 변환하기

사용자가 인가 요청을 승인하면, 소비자 애플리케이션으로 리다이렉트됩니다. 이때 소비자 애플리케이션에서는 표준 Authorization Code Grant와 마찬가지로 `state` 파라미터의 값을 미리 저장했던 값과 비교하여 검증해야 합니다.

만약 state 파라미터가 일치한다면, 소비자 애플리케이션은 액세스 토큰을 요청하기 위해 여러분의 애플리케이션에 `POST` 요청을 보내야 합니다. 이 요청에는 사용자가 인가 요청을 승인할 때 애플리케이션에서 발급한 인가 코드와, 처음 생성했던 code verifier를 함께 포함해야 합니다.

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

Route::get('/callback', function (Request $request) {
    $state = $request->session()->pull('state');

    $codeVerifier = $request->session()->pull('code_verifier');

    throw_unless(
        strlen($state) > 0 && $state === $request->state,
        InvalidArgumentException::class
    );

    $response = Http::asForm()->post('https://passport-app.test/oauth/token', [
        'grant_type' => 'authorization_code',
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'code_verifier' => $codeVerifier,
        'code' => $request->code,
    ]);

    return $response->json();
});
```

<a name="device-authorization-grant"></a>
## 디바이스 인가 그랜트 (Device Authorization Grant)

OAuth2 디바이스 인가 그랜트는 TV나 게임 콘솔과 같이 브라우저가 없거나 입력 장치가 제한된 기기에서, "디바이스 코드(device code)"를 교환하여 액세스 토큰을 얻을 수 있도록 해줍니다. 디바이스 플로우를 사용할 때, 기기 클라이언트는 사용자가 별도의 2차 기기(예: 컴퓨터나 스마트폰)를 사용해 서버에 접속하여 제공된 "유저 코드(user code)"를 입력하고 액세스 요청을 승인 또는 거부하도록 안내합니다.

우선, Passport가 "유저 코드"와 "인가" 뷰를 어떻게 반환할지 지정해야 합니다.

모든 인가 뷰의 렌더링 로직은 `Laravel\Passport\Passport` 클래스에서 제공되는 적절한 메서드를 사용해 자유롭게 커스터마이즈할 수 있습니다. 일반적으로, 이 메서드는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다.

```php
use Laravel\Passport\Passport;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    // 뷰 이름을 직접 지정하는 경우...
    Passport::deviceUserCodeView('auth.oauth.device.user-code');
    Passport::deviceAuthorizationView('auth.oauth.device.authorize');
    
    // 클로저를 사용하는 경우...
    Passport::deviceUserCodeView(fn ($parameters) => Inertia::render('Auth/OAuth/Device/UserCode'));

    Passport::deviceAuthorizationView(fn ($parameters) => Inertia::render('Auth/OAuth/Device/Authorize', [
        'request' => $parameters['request'],
        'authToken' => $parameters['authToken'],
        'client' => $parameters['client'],
        'user' => $parameters['user'],
        'scopes' => $parameters['scopes'],
    ]));

    // ...
}
```

Passport는 이러한 뷰를 반환하는 라우트를 자동으로 정의해줍니다. 여러분의 `auth.oauth.device.user-code` 템플릿에는 `passport.device.authorizations.authorize` 라우트로 GET 요청을 보내는 폼이 포함되어야 합니다. 이 라우트는 `user_code` 쿼리 파라미터를 기대합니다.

`auth.oauth.device.authorize` 템플릿에는 인가를 승인하는 `passport.device.authorizations.approve` 라우트로 POST 요청을 보내는 폼과 거부하는 `passport.device.authorizations.deny` 라우트로 DELETE 요청을 보내는 폼을 각각 포함해야 합니다. 이 두 라우트 모두 `state`, `client_id`, `auth_token` 필드를 기대합니다.

<a name="creating-a-device-authorization-grant-client"></a>
### 디바이스 인가 그랜트 클라이언트 생성

애플리케이션이 디바이스 인가 그랜트를 통해 토큰을 발급하려면, 먼저 디바이스 플로우를 지원하는 클라이언트를 생성해야 합니다. 이를 위해 `passport:client` Artisan 명령어에 `--device` 옵션을 추가해 실행할 수 있습니다. 이 명령어는 1st-party 디바이스 플로우 지원 클라이언트를 만들고, 클라이언트 ID와 시크릿을 제공합니다.

```shell
php artisan passport:client --device
```

또는, `ClientRepository` 클래스의 `createDeviceAuthorizationGrantClient` 메서드를 사용해 지정한 사용자에게 속한 서드파티 클라이언트를 등록할 수도 있습니다.

```php
use App\Models\User;
use Laravel\Passport\ClientRepository;

$user = User::find($userId);

$client = app(ClientRepository::class)->createDeviceAuthorizationGrantClient(
    user: $user,
    name: 'Example Device',
    confidential: false,
);
```

<a name="requesting-device-authorization-grant-tokens"></a>
### 토큰 발급 요청

<a name="device-code"></a>
#### 디바이스 코드 요청

클라이언트가 생성되면, 개발자는 클라이언트 ID를 사용하여 애플리케이션에서 디바이스 코드를 요청할 수 있습니다. 먼저, 디바이스(소비자 기기)는 `/oauth/device/code` 경로에 `POST` 요청을 보내 디바이스 코드를 요청해야 합니다.

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/device/code', [
    'client_id' => 'your-client-id',
    'scope' => 'user:read orders:create',
]);

return $response->json();
```

이 요청의 응답으로는 `device_code`, `user_code`, `verification_uri`, `interval`, `expires_in` 속성을 포함한 JSON 데이터가 반환됩니다. `expires_in`은 디바이스 코드의 만료(초 단위)까지 남은 시간을 나타내며, `interval`은 `/oauth/token` 경로로 폴링 시 소비자 기기가 요청 간 대기해야 하는 최소 초 단위 간격입니다. 이 값은 너무 자주 요청하여 rate limit 에러가 발생하지 않도록 사용해야 합니다.

> [!NOTE]  
> `/oauth/device/code` 경로는 Passport에서 이미 정의되어 있습니다. 별도로 추가로 정의할 필요가 없습니다.

<a name="user-code"></a>
#### Verification URI 및 유저 코드 안내

디바이스 코드가 발급되면, 소비자 기기는 사용자에게 또 다른 기기를 통해 `verification_uri`에 접속하여 `user_code`를 입력하라는 안내를 해야 합니다. 사용자는 이 과정을 통해 인가 요청을 승인하게 됩니다.

<a name="polling-token-request"></a>
#### 토큰 요청 폴링

사용자가 별도의 기기를 통해 인가를 승인(또는 거부)하므로, 소비자 기기는 애플리케이션의 `/oauth/token` 경로로 폴링하여 사용자가 요청에 응답했는지 확인해야 합니다. 디바이스 코드를 요청할 때 JSON 응답으로 받은 최소 폴링 간격 `interval` 만큼 대기한 후 요청을 보내야 하며, 이 값보다 더 자주 보내면 rate limit 에러가 발생할 수 있습니다.

```php
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Sleep;

$interval = 5;

do {
    Sleep::for($interval)->seconds();

    $response = Http::asForm()->post('https://passport-app.test/oauth/token', [
        'grant_type' => 'urn:ietf:params:oauth:grant-type:device_code',
        'client_id' => 'your-client-id',
        'client_secret' => 'your-client-secret', // confidential 클라이언트에만 필요
        'device_code' => 'the-device-code',
    ]);
    
    if ($response->json('error') === 'slow_down') {
        $interval += 5;
    }
} while (in_array($response->json('error'), ['authorization_pending', 'slow_down']));

return $response->json();
```

사용자가 인가 요청을 승인한 경우, 이 폴링 요청의 응답으로는 `access_token`, `refresh_token`, `expires_in` 속성을 포함하는 JSON 데이터가 반환됩니다. `expires_in`은 액세스 토큰의 만료까지 남은 초를 나타냅니다.

<a name="password-grant"></a>
## 패스워드 그랜트 (Password Grant)

> [!WARNING]
> 이제는 패스워드 그랜트 토큰 사용을 권장하지 않습니다. 대신 [OAuth2 서버에서 현재 권장하는 그랜트 유형](https://oauth2.thephpleague.com/authorization-server/which-grant/)을 선택하십시오.

OAuth2 패스워드 그랜트는 모바일 애플리케이션 등 여러분의 1st-party 클라이언트가 이메일/사용자명과 비밀번호로 액세스 토큰을 발급받을 수 있도록 합니다. 즉, 전체 OAuth2 인가 코드 리다이렉트 플로우를 거칠 필요 없이 1st-party 클라이언트에 안전하게 액세스 토큰을 발급할 수 있습니다.

패스워드 그랜트를 활성화하려면, 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `enablePasswordGrant` 메서드를 호출하십시오.

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::enablePasswordGrant();
}
```

<a name="creating-a-password-grant-client"></a>
### 패스워드 그랜트 클라이언트 생성

애플리케이션이 패스워드 그랜트를 통해 토큰을 발급하려면, 우선 패스워드 그랜트 클라이언트를 생성해야 합니다. 이를 위해 `passport:client` Artisan 명령어에 `--password` 옵션을 사용합니다.

```shell
php artisan passport:client --password
```

<a name="requesting-password-grant-tokens"></a>
### 토큰 발급 요청

패스워드 그랜트를 활성화하고 패스워드 그랜트 클라이언트를 생성한 후에는, 해당 클라이언트를 이용해 사용자의 이메일 주소와 비밀번호를 포함하여 `/oauth/token` 경로에 `POST` 요청을 보내 액세스 토큰을 요청할 수 있습니다. 이 라우트는 Passport에서 이미 등록되어 있으므로 별도로 정의할 필요가 없습니다. 요청이 성공하면, 서버로부터 JSON 응답으로 `access_token` 및 `refresh_token`을 받을 수 있습니다.

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'password',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret', // confidential 클라이언트에만 필요
    'username' => 'taylor@laravel.com',
    'password' => 'my-password',
    'scope' => 'user:read orders:create',
]);

return $response->json();
```

> [!NOTE]
> 액세스 토큰은 기본적으로 장기간 유효합니다. 원한다면 [액세스 토큰의 최대 수명](#configuration)을 직접 설정할 수 있습니다.

<a name="requesting-all-scopes"></a>
### 모든 Scope 요청하기

패스워드 그랜트나 클라이언트 크리덴셜 그랜트를 사용할 때, 애플리케이션이 지원하는 모든 scope에 대해 토큰을 발급받고 싶을 수 있습니다. 이럴 때는 `*` scope를 요청하면 됩니다. `*` scope로 발급된 토큰의 인스턴스에서 `can` 메서드를 호출하면 항상 `true`를 반환합니다. 이 scope는 오직 `password` 또는 `client_credentials` 그랜트로 발급된 토큰에만 부여할 수 있습니다.

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'password',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret', // confidential 클라이언트에만 필요
    'username' => 'taylor@laravel.com',
    'password' => 'my-password',
    'scope' => '*',
]);
```

<a name="customizing-the-user-provider"></a>
### 사용자 프로바이더 사용자화

애플리케이션에서 [여러 인증 user provider](/docs/12.x/authentication#introduction)를 사용하는 경우, `artisan passport:client --password` 명령어로 클라이언트를 생성할 때 `--provider` 옵션을 제공하여 패스워드 그랜트 클라이언트가 사용할 user provider를 지정할 수 있습니다. 지정한 provider 이름은 `config/auth.php` 설정 파일에 정의된 유효한 provider 이름이어야 합니다. 그리고 [라우트에 미들웨어를 적용하여](#multiple-authentication-guards) 해당 provider의 사용자만 인가되도록 보호할 수 있습니다.

<a name="customizing-the-username-field"></a>
### 사용자명 필드 사용자화

패스워드 그랜트 인증 시, Passport는 인증 모델의 `email` 속성을 "username"으로 사용합니다. 이 동작을 변경하려면 모델에 `findForPassport` 메서드를 정의하면 됩니다.

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    /**
     * 주어진 사용자명으로 User 인스턴스를 찾습니다.
     */
    public function findForPassport(string $username): User
    {
        return $this->where('username', $username)->first();
    }
}
```

<a name="customizing-the-password-validation"></a>
### 비밀번호 검증 방식 사용자화

패스워드 그랜트 인증 시, Passport는 모델의 `password` 속성을 사용해 입력한 비밀번호를 검증합니다. 만약 모델에 `password` 속성이 없거나, 비밀번호 검증 로직을 커스터마이즈하고 싶다면, 모델에 `validateForPassportPasswordGrant` 메서드를 직접 정의할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    /**
     * Passport 패스워드 그랜트용 비밀번호를 검증합니다.
     */
    public function validateForPassportPasswordGrant(string $password): bool
    {
        return Hash::check($password, $this->password);
    }
}
```

<a name="implicit-grant"></a>
## 임플리시트 그랜트 (Implicit Grant)

> [!WARNING]
> 이제는 임플리시트 그랜트 토큰 사용을 권장하지 않습니다. 대신 [OAuth2 서버에서 현재 권장하는 그랜트 유형](https://oauth2.thephpleague.com/authorization-server/which-grant/)을 선택하십시오.

임플리시트 그랜트는 인가 코드 그랜트와 비슷하지만, 인가 코드를 별도로 교환하지 않고 바로 클라이언트로 토큰이 반환됩니다. 일반적으로 클라이언트 크리덴셜을 안전하게 저장할 수 없는 자바스크립트 또는 모바일 애플리케이션에서 가장 많이 사용합니다. 이 그랜트를 활성화하려면 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `enableImplicitGrant` 메서드를 호출하십시오.

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::enableImplicitGrant();
}
```

임플리시트 그랜트로 토큰을 발급하기 전에 먼저 임플리시트 그랜트 클라이언트를 생성해야 합니다. 이를 위해 `passport:client` Artisan 명령어에 `--implicit` 옵션을 사용합니다.

```shell
php artisan passport:client --implicit
```

그랜트가 활성화되고 임플리시트 클라이언트가 생성되면, 개발자는 클라이언트 ID를 이용하여 애플리케이션에서 액세스 토큰을 요청할 수 있습니다. 외부 애플리케이션에서는 다음과 같이 `/oauth/authorize` 경로로 리다이렉트 요청을 보내면 됩니다.

```php
use Illuminate\Http\Request;

Route::get('/redirect', function (Request $request) {
    $request->session()->put('state', $state = Str::random(40));

    $query = http_build_query([
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'response_type' => 'token',
        'scope' => 'user:read orders:create',
        'state' => $state,
        // 'prompt' => '', // "none", "consent", or "login"
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

> [!NOTE]
> `/oauth/authorize` 라우트는 이미 Passport가 정의하므로 별도로 추가할 필요가 없습니다.

<a name="client-credentials-grant"></a>
## 클라이언트 크리덴셜 그랜트 (Client Credentials Grant)

클라이언트 크리덴셜 그랜트는 서버 간 인증(Machine-to-Machine)에 적합한 방식입니다. 예를 들어, 예약된 작업(스케줄러)이 API를 통해 유지보수 작업을 수행할 때 사용할 수 있습니다.

애플리케이션에서 이 그랜트를 통해 토큰을 발급하려면, 먼저 클라이언트 크리덴셜 그랜트 클라이언트를 생성해야 합니다. 이를 위해 `passport:client` Artisan 명령어에 `--client` 옵션을 사용합니다.

```shell
php artisan passport:client --client
```

그 다음, `Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner` 미들웨어를 라우트에 할당하십시오.

```php
use Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner;

Route::get('/orders', function (Request $request) {
    // 토큰이 유효하고, 클라이언트가 리소스 소유자인 경우...
})->middleware(EnsureClientIsResourceOwner::class);
```

특정 scope에만 접근을 제한하고자 한다면, `using` 메서드에 필요한 scope 목록을 나열할 수 있습니다.

```php
Route::get('/orders', function (Request $request) {
    // 토큰이 유효하고, 클라이언트가 리소스 소유자이며 "servers:read"와 "servers:create" scope를 모두 가지고 있는 경우...
})->middleware(EnsureClientIsResourceOwner::using('servers:read', 'servers:create');
```

<a name="retrieving-tokens"></a>
### 토큰 조회

이 그랜트 타입으로 토큰을 발급받으려면, `oauth/token` 엔드포인트로 요청을 보내면 됩니다.

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'client_credentials',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret',
    'scope' => 'servers:read servers:create',
]);

return $response->json()['access_token'];
```

<a name="personal-access-tokens"></a>
## 개인 액세스 토큰 (Personal Access Tokens)

때때로, 사용자가 일반적인 인가 코드 리다이렉트 플로우를 거치지 않고 직접 액세스 토큰을 발급받고 싶어할 때가 있습니다. 애플리케이션의 UI를 통해 직접 토큰을 발급받을 수 있도록 허용하면, 사용자가 API를 실험해볼 때 유용하거나 보다 간단하게 액세스 토큰을 발급하는 데 활용할 수 있습니다.

> [!NOTE]
> 만약 애플리케이션에서 주로 개인 액세스 토큰 발급만 사용하고 있다면, [Laravel Sanctum](/docs/12.x/sanctum) 사용을 고려하세요. Sanctum은 라라벨에서 공식적으로 제공하는 경량화된 API 액세스 토큰 발급 라이브러리입니다.

<a name="creating-a-personal-access-client"></a>
### 개인 액세스 클라이언트 생성

애플리케이션이 개인 액세스 토큰을 발급하려면, 먼저 개인 액세스 클라이언트를 생성해야 합니다. 이를 위해 `passport:client` Artisan 명령어에 `--personal` 옵션을 사용하면 됩니다. 이미 `passport:install` 명령어를 한 번 실행한 경우라면, 별도로 이 명령어를 실행할 필요가 없습니다.

```shell
php artisan passport:client --personal
```

<a name="customizing-the-user-provider-for-pat"></a>
### 사용자 프로바이더 사용자화

만약 [여러 인증 user provider](/docs/12.x/authentication#introduction)를 사용한다면, `artisan passport:client --personal` 명령어로 클라이언트를 생성할 때 `--provider` 옵션을 통해 개인 액세스 그랜트 클라이언트가 사용할 user provider를 지정할 수 있습니다. 해당 provider 이름은 반드시 `config/auth.php` 파일에 정의되어 있어야 합니다. 또한 [라우트를 미들웨어로 보호하여](#multiple-authentication-guards) 해당 provider의 사용자만 인가할 수 있도록 할 수 있습니다.

<a name="managing-personal-access-tokens"></a>
### 개인 액세스 토큰 관리

개인 액세스 클라이언트를 생성한 후에는, `App\Models\User` 모델 인스턴스에서 `createToken` 메서드를 사용해 특정 사용자에게 토큰을 발급할 수 있습니다. `createToken` 메서드는 첫 번째 인수로 토큰 이름, 두 번째 인수로 [scope](#token-scopes) 배열(생략 가능)을 받습니다.

```php
use App\Models\User;
use Illuminate\Support\Facades\Date;
use Laravel\Passport\Token;

$user = User::find($userId);

// scope 없이 토큰 생성...
$token = $user->createToken('My Token')->accessToken;

// scope를 지정하여 토큰 생성...
$token = $user->createToken('My Token', ['user:read', 'orders:create'])->accessToken;

// 전체 scope를 포함하여 토큰 생성...
$token = $user->createToken('My Token', ['*'])->accessToken;

// 해당 사용자의 모든 유효한 개인 액세스 토큰 조회...
$tokens = $user->tokens()
    ->with('client')
    ->where('revoked', false)
    ->where('expires_at', '>', Date::now())
    ->get()
    ->filter(fn (Token $token) => $token->client->hasGrantType('personal_access'));
```

<a name="protecting-routes"></a>
## 라우트 보호

<a name="via-middleware"></a>
### 미들웨어를 통한 보호

Passport는 [인증 가드](/docs/12.x/authentication#adding-custom-guards)를 제공하여, 요청에 포함된 액세스 토큰을 검증할 수 있습니다. `api` 가드를 `passport` 드라이버로 사용하도록 설정을 마친 뒤, 유효한 액세스 토큰이 필요한 라우트에 `auth:api` 미들웨어만 적용하면 됩니다.

```php
Route::get('/user', function () {
    // API 인증된 사용자만 접근할 수 있는 라우트...
})->middleware('auth:api');
```

> [!WARNING]
> [클라이언트 크리덴셜 그랜트](#client-credentials-grant)를 사용하는 경우, 라우트 보호를 위해 `auth:api` 미들웨어 대신 [Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner 미들웨어](#client-credentials-grant)를 사용해야 합니다.

<a name="multiple-authentication-guards"></a>
#### 다중 인증 가드 사용

애플리케이션이 서로 다른 Eloquent 모델을 사용하는 다양한 사용자 타입을 인증한다면, 각 user provider 타입마다 별도의 가드 구성을 정의해야 할 수 있습니다. 이렇게 하면 특정 user provider 대상의 요청만 별도로 보호할 수 있습니다. 예를 들어, `config/auth.php` 설정 파일에 다음과 같은 가드 설정이 있을 수 있습니다.

```php
'guards' => [
    'api' => [
        'driver' => 'passport',
        'provider' => 'users',
    ],

    'api-customers' => [
        'driver' => 'passport',
        'provider' => 'customers',
    ],
],
```

아래와 같은 라우트에서는 `api-customers` 가드(즉, `customers` user provider)를 사용하여 요청 인증을 수행하게 됩니다.

```php
Route::get('/customer', function () {
    // ...
})->middleware('auth:api-customers');
```

> [!NOTE]
> Passport에서 여러 user provider를 사용하는 방법에 대한 자세한 내용은 [개인 액세스 토큰 문서](#customizing-the-user-provider-for-pat)와 [패스워드 그랜트 문서](#customizing-the-user-provider)를 참고하세요.

<a name="passing-the-access-token"></a>
### 액세스 토큰 전달 방식

Passport로 보호된 라우트에 호출할 때, API 소비자 애플리케이션은 요청의 `Authorization` 헤더에 반드시 `Bearer` 토큰 형태로 액세스 토큰을 포함해야 합니다. 예를 들어, `Http` 파사드를 사용할 경우 아래와 같이 지정할 수 있습니다.

```php
use Illuminate\Support\Facades\Http;

$response = Http::withHeaders([
    'Accept' => 'application/json',
    'Authorization' => "Bearer $accessToken",
])->get('https://passport-app.test/api/user');

return $response->json();
```

<a name="token-scopes"></a>
## 토큰 Scope

Scope는 API 클라이언트가 계정 접근 권한을 요청할 때, 필요한 권한 집합만 요청할 수 있도록 도와주는 기능입니다. 예를 들어, 이커머스 애플리케이션을 만든다면 모든 API 소비자가 주문 등록 권한을 필요로 하지는 않을 수 있습니다. 대신, 일부 소비자에게는 주문 배송 상태만 확인할 수 있도록 제한적으로 권한을 부여할 수 있습니다. 즉, scope를 활용하면 사용자가 써드파티 애플리케이션이 자신의 대신 수행할 수 있는 범위를 제한할 수 있습니다.

<a name="defining-scopes"></a>
### Scope 정의하기

`App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `Passport::tokensCan` 메서드를 사용해 API의 scope를 정의할 수 있습니다. `tokensCan` 메서드는 scope 이름과 scope 설명이 담긴 배열을 인수로 받습니다. scope 설명은 자유롭게 지정할 수 있으며, 인가 승인 화면에서 사용자에게 표시됩니다.

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::tokensCan([
        'user:read' => 'Retrieve the user info',
        'orders:create' => 'Place orders',
        'orders:read:status' => 'Check order status',
    ]);
}
```

<a name="default-scope"></a>
### 기본 Scope 설정

클라이언트가 별도로 특정 scope를 요청하지 않을 때, Passport 서버에서 기본 scope를 토큰에 자동으로 부여할 수 있습니다. 이를 위해 `defaultScopes` 메서드를 사용할 수 있습니다. 일반적으로, 이 메서드는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다.

```php
use Laravel\Passport\Passport;

Passport::tokensCan([
        'user:read' => 'Retrieve the user info',
        'orders:create' => 'Place orders',
        'orders:read:status' => 'Check order status',
]);

Passport::defaultScopes([
    'user:read',
    'orders:create',
]);
```

<a name="assigning-scopes-to-tokens"></a>

### 토큰에 스코프 할당하기

<a name="when-requesting-authorization-codes"></a>
#### 인가 코드 요청 시

인가 코드 그랜트를 사용하여 액세스 토큰을 요청할 때, 소비자(클라이언트)는 원하는 스코프를 `scope` 쿼리 문자열 파라미터로 지정해야 합니다. `scope` 파라미터에는 공백으로 구분된 스코프 목록을 전달합니다:

```php
Route::get('/redirect', function () {
    $query = http_build_query([
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'response_type' => 'code',
        'scope' => 'user:read orders:create',
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

<a name="when-issuing-personal-access-tokens"></a>
#### 개인 액세스 토큰 발급 시

`App\Models\User` 모델의 `createToken` 메서드를 사용하여 개인 액세스 토큰을 발급하는 경우, 두 번째 인수에 원하는 스코프의 배열을 전달할 수 있습니다:

```php
$token = $user->createToken('My Token', ['orders:create'])->accessToken;
```

<a name="checking-scopes"></a>
### 스코프 확인하기

Passport에는 들어오는 요청이 특정 스코프를 가진 토큰으로 인증되었는지 확인할 수 있는 두 가지 미들웨어가 포함되어 있습니다.

<a name="check-for-all-scopes"></a>
#### 모든 스코프 확인하기

`Laravel\Passport\Http\Middleware\CheckToken` 미들웨어를 경로에 등록하면, 해당 요청의 액세스 토큰이 지정된 모든 스코프를 가지고 있는지 검증할 수 있습니다:

```php
use Laravel\Passport\Http\Middleware\CheckToken;

Route::get('/orders', function () {
    // 액세스 토큰이 "orders:read"와 "orders:create" 두 스코프를 모두 가지고 있는 경우...
})->middleware(['auth:api', CheckToken::using('orders:read', 'orders:create');
```

<a name="check-for-any-scopes"></a>
#### 하나 이상의 스코프 확인하기

`Laravel\Passport\Http\Middleware\CheckTokenForAnyScope` 미들웨어를 경로에 등록하면, 해당 요청의 액세스 토큰이 명시된 스코프 중 **하나 이상**을 가지고 있는지 검증할 수 있습니다:

```php
use Laravel\Passport\Http\Middleware\CheckTokenForAnyScope;

Route::get('/orders', function () {
    // 액세스 토큰이 "orders:read" 또는 "orders:create" 중 하나의 스코프를 가지고 있는 경우...
})->middleware(['auth:api', CheckTokenForAnyScope::using('orders:read', 'orders:create');
```

<a name="checking-scopes-on-a-token-instance"></a>
#### 토큰 인스턴스에서 스코프 확인하기

액세스 토큰으로 인증된 요청이 애플리케이션에 도달한 후에도, 인증된 `App\Models\User` 인스턴스의 `tokenCan` 메서드를 사용해서 해당 토큰이 특정 스코프를 가지고 있는지 확인할 수 있습니다:

```php
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    if ($request->user()->tokenCan('orders:create')) {
        // ...
    }
});
```

<a name="additional-scope-methods"></a>
#### 추가적인 스코프 관련 메서드

`scopeIds` 메서드는 정의된 모든 ID/이름의 배열을 반환합니다:

```php
use Laravel\Passport\Passport;

Passport::scopeIds();
```

`scopes` 메서드는 정의된 모든 스코프를 `Laravel\Passport\Scope` 인스턴스 배열로 반환합니다:

```php
Passport::scopes();
```

`scopesFor` 메서드는 전달된 ID/이름에 해당하는 `Laravel\Passport\Scope` 인스턴스의 배열을 반환합니다:

```php
Passport::scopesFor(['user:read', 'orders:create']);
```

`hasScope` 메서드를 사용하면 특정 스코프가 정의되어 있는지 확인할 수 있습니다:

```php
Passport::hasScope('orders:create');
```

<a name="spa-authentication"></a>
## SPA 인증

API를 구축할 때, JavaScript 애플리케이션에서 자체 API를 소비할 수 있다면 매우 유용합니다. 이렇게 하면 여러분이 공개하는 API를 여러분의 애플리케이션에서도 직접 사용할 수 있습니다. 동일한 API는 웹 애플리케이션, 모바일 애플리케이션, 서드파티 애플리케이션, 그리고 여러 패키지 매니저에 퍼블리시하는 SDK 등에서도 활용될 수 있습니다.

보통은 JavaScript 애플리케이션에서 API를 사용하려면, 직접 액세스 토큰을 발급받아 요청마다 전달해야 합니다. 그러나 Passport에는 이를 자동으로 처리해주는 미들웨어가 제공됩니다. 애플리케이션의 `bootstrap/app.php` 파일에서 `web` 미들웨어 그룹에 `CreateFreshApiToken` 미들웨어를 추가하기만 하면 됩니다:

```php
use Laravel\Passport\Http\Middleware\CreateFreshApiToken;

->withMiddleware(function (Middleware $middleware) {
    $middleware->web(append: [
        CreateFreshApiToken::class,
    ]);
})
```

> [!WARNING]
> `CreateFreshApiToken` 미들웨어가 미들웨어 스택에서 반드시 마지막에 위치하도록 해야 합니다.

이 미들웨어는 응답에 `laravel_token` 쿠키를 자동으로 추가합니다. 이 쿠키에는 Passport가 JavaScript 애플리케이션의 API 요청을 인증하는 데 사용할 암호화된 JWT가 들어 있습니다. JWT의 유효기간은 `session.lifetime` 설정값과 동일합니다. 브라우저는 이후의 모든 요청에 이 쿠키를 자동으로 포함해서 전송하므로, 별도로 액세스 토큰을 헤더로 전달하지 않아도 API를 사용할 수 있습니다:

```js
axios.get('/api/user')
    .then(response => {
        console.log(response.data);
    });
```

<a name="customizing-the-cookie-name"></a>
#### 쿠키 이름 커스터마이징

필요하다면, `Passport::cookie` 메서드를 사용해서 `laravel_token` 쿠키의 이름을 직접 지정할 수 있습니다. 보통 이 메서드는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출하는 것이 좋습니다:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::cookie('custom_name');
}
```

<a name="csrf-protection"></a>
#### CSRF 보호

이 인증 방식을 사용할 때는 요청에 유효한 CSRF 토큰 헤더가 포함되어야 합니다. 기본적으로 라라벨의 JavaScript 스캐폴딩(기본 템플릿) 및 모든 스타터 키트에는 [Axios](https://github.com/axios/axios) 인스턴스가 포함되어 있으며, 이 인스턴스는 암호화된 `XSRF-TOKEN` 쿠키 값을 이용하여 동일 출처 요청 시 자동으로 `X-XSRF-TOKEN` 헤더를 추가해 보냅니다.

> [!NOTE]
> 만약 `X-XSRF-TOKEN` 대신 `X-CSRF-TOKEN` 헤더를 사용하고자 한다면, 반드시 `csrf_token()`에서 제공하는 암호화되지 않은 토큰을 사용해야 합니다.

<a name="events"></a>
## 이벤트

Passport는 액세스 토큰 및 리프레시 토큰을 발급할 때 이벤트를 발생시킵니다. 이 이벤트들을 [리스닝](/docs/12.x/events)해서 데이터베이스 내의 다른 액세스 토큰을 정리(삭제)하거나, 토큰을 폐기(revoke)할 수 있습니다.

<div class="overflow-auto">

| 이벤트 이름 |
| --- |
| `Laravel\Passport\Events\AccessTokenCreated` |
| `Laravel\Passport\Events\RefreshTokenCreated` |

</div>

<a name="testing"></a>
## 테스트

Passport의 `actingAs` 메서드를 사용하면 현재 인증된 사용자와 토큰에 부여할 스코프를 지정할 수 있습니다. 첫 번째 인자는 사용자 인스턴스를, 두 번째 인자는 사용자의 토큰에 할당할 스코프 배열을 전달합니다:

```php tab=Pest
use App\Models\User;
use Laravel\Passport\Passport;

test('orders can be created', function () {
    Passport::actingAs(
        User::factory()->create(),
        ['orders:create']
    );

    $response = $this->post('/api/orders');

    $response->assertStatus(201);
});
```

```php tab=PHPUnit
use App\Models\User;
use Laravel\Passport\Passport;

public function test_orders_can_be_created(): void
{
    Passport::actingAs(
        User::factory()->create(),
        ['orders:create']
    );

    $response = $this->post('/api/orders');

    $response->assertStatus(201);
}
```

Passport의 `actingAsClient` 메서드를 사용하면 현재 인증된 클라이언트 인스턴스와 토큰에 할당할 스코프를 지정할 수 있습니다. 첫 번째 인자는 클라이언트 인스턴스를, 두 번째 인자는 해당 클라이언트의 토큰에 부여할 스코프 배열을 전달합니다:

```php tab=Pest
use Laravel\Passport\Client;
use Laravel\Passport\Passport;

test('servers can be retrieved', function () {
    Passport::actingAsClient(
        Client::factory()->create(),
        ['servers:read']
    );

    $response = $this->get('/api/servers');

    $response->assertStatus(200);
});
```

```php tab=PHPUnit
use Laravel\Passport\Client;
use Laravel\Passport\Passport;

public function test_servers_can_be_retrieved(): void
{
    Passport::actingAsClient(
        Client::factory()->create(),
        ['servers:read']
    );

    $response = $this->get('/api/servers');

    $response->assertStatus(200);
}
```