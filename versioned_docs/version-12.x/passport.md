# 라라벨 패스포트 (Laravel Passport)

- [소개](#introduction)
    - [패스포트 또는 Sanсtum?](#passport-or-sanctum)
- [설치](#installation)
    - [패스포트 배포하기](#deploying-passport)
    - [패스포트 업그레이드](#upgrading-passport)
- [설정](#configuration)
    - [토큰 수명](#token-lifetimes)
    - [기본 모델 오버라이드](#overriding-default-models)
    - [라우트 오버라이드](#overriding-routes)
- [인가 코드 그랜트](#authorization-code-grant)
    - [클라이언트 관리](#managing-clients)
    - [토큰 요청](#requesting-tokens)
    - [토큰 관리](#managing-tokens)
    - [토큰 갱신](#refreshing-tokens)
    - [토큰 폐기](#revoking-tokens)
    - [토큰 정리](#purging-tokens)
- [PKCE가 포함된 인가 코드 그랜트](#code-grant-pkce)
    - [클라이언트 생성](#creating-a-auth-pkce-grant-client)
    - [토큰 요청](#requesting-auth-pkce-grant-tokens)
- [디바이스 인가 그랜트](#device-authorization-grant)
    - [디바이스 코드 그랜트 클라이언트 생성](#creating-a-device-authorization-grant-client)
    - [토큰 요청](#requesting-device-authorization-grant-tokens)
- [패스워드 그랜트](#password-grant)
    - [패스워드 그랜트 클라이언트 생성](#creating-a-password-grant-client)
    - [토큰 요청](#requesting-password-grant-tokens)
    - [모든 스코프 요청](#requesting-all-scopes)
    - [유저 프로바이더 커스터마이징](#customizing-the-user-provider)
    - [유저네임 필드 커스터마이징](#customizing-the-username-field)
    - [비밀번호 검증 커스터마이징](#customizing-the-password-validation)
- [임플리시트 그랜트](#implicit-grant)
- [클라이언트 크리덴셜 그랜트](#client-credentials-grant)
- [퍼스널 엑세스 토큰](#personal-access-tokens)
    - [퍼스널 엑세스 클라이언트 생성](#creating-a-personal-access-client)
    - [유저 프로바이더 커스터마이징](#customizing-the-user-provider-for-pat)
    - [퍼스널 엑세스 토큰 관리](#managing-personal-access-tokens)
- [라우트 보호하기](#protecting-routes)
    - [미들웨어 사용하기](#via-middleware)
    - [액세스 토큰 전달하기](#passing-the-access-token)
- [토큰 스코프](#token-scopes)
    - [스코프 정의](#defining-scopes)
    - [기본 스코프](#default-scope)
    - [토큰에 스코프 할당하기](#assigning-scopes-to-tokens)
    - [스코프 확인](#checking-scopes)
- [SPA 인증](#spa-authentication)
- [이벤트](#events)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

[Laravel Passport](https://github.com/laravel/passport)는 여러분의 라라벨 애플리케이션에 완전한 OAuth2 서버를 몇 분 만에 구축할 수 있도록 도와주는 패키지입니다. Passport는 Andy Millington과 Simon Hamp가 관리하는 [League OAuth2 server](https://github.com/thephpleague/oauth2-server)를 기반으로 만들어졌습니다.

> [!NOTE]
> 이 문서는 독자가 이미 OAuth2에 대해 익숙하다는 것을 전제로 작성되었습니다. 만약 OAuth2에 전혀 익숙하지 않다면, 계속 읽기 전에 일반적인 [용어](https://oauth2.thephpleague.com/terminology/)와 OAuth2의 주요 기능을 먼저 학습하는 것이 좋습니다.

<a name="passport-or-sanctum"></a>
### 패스포트 또는 Sanctum?

시작하기 전에, 여러분의 애플리케이션에 Laravel Passport와 [Laravel Sanctum](/docs/sanctum) 중 어떤 것이 더 적합한지 판단해보는 것이 좋습니다. 만약 애플리케이션이 반드시 OAuth2를 지원해야 한다면 Laravel Passport를 사용해야 합니다.

하지만 싱글 페이지 애플리케이션(SPA), 모바일 애플리케이션 또는 API 토큰 발급이 필요한 경우라면 [Laravel Sanctum](/docs/sanctum)을 사용하는 것이 더 바람직합니다. Laravel Sanctum은 OAuth2를 지원하지 않지만, 훨씬 간단한 API 인증 개발 경험을 제공합니다.

<a name="installation"></a>
## 설치

라라벨에서 `install:api` 아티즌 명령어를 사용해 Laravel Passport를 설치할 수 있습니다:

```shell
php artisan install:api --passport
```

이 명령어는 OAuth2 클라이언트와 액세스 토큰을 저장하는 데 필요한 데이터베이스 테이블 생성을 위해, 관련 마이그레이션 파일을 발행하고 실행해줍니다. 또한 보안 액세스 토큰 생성을 위한 암호화 키도 자동으로 생성해줍니다.

`install:api` 명령어 실행 후에는, `App\Models\User` 모델에 `Laravel\Passport\HasApiTokens` 트레이트와 `Laravel\Passport\Contracts\OAuthenticatable` 인터페이스를 추가해야 합니다. 이 트레이트를 적용하면 인증된 사용자의 토큰과 스코프를 확인할 수 있는 유용한 헬퍼 메서드들이 모델에 추가됩니다:

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

그리고 애플리케이션의 `config/auth.php` 설정 파일에서 `api` 인증 가드를 정의하고, `driver` 옵션을 `passport`로 설정해야 합니다. 이렇게 하면 API 요청을 인증할 때 Passport의 `TokenGuard`가 사용됩니다:

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
### 패스포트 배포하기

애플리케이션 서버에 Passport를 처음 배포할 때는 `passport:keys` 명령어를 실행해야 할 수 있습니다. 이 명령어는 Passport에서 액세스 토큰을 생성하는 데 필요한 암호화 키를 만들어줍니다. 이렇게 생성된 키는 보통 소스 제어 시스템에는 포함하지 않습니다.

```shell
php artisan passport:keys
```

필요하다면 Passport의 키가 로드될 경로를 직접 지정할 수도 있습니다. 이를 위해 `Passport::loadKeysFrom` 메서드를 사용할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출합니다:

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
#### 환경 변수에서 키 불러오기

또는, `vendor:publish` 아티즌 명령어를 사용해 Passport의 설정 파일을 발행할 수 있습니다:

```shell
php artisan vendor:publish --tag=passport-config
```

설정 파일을 발행한 후, 아래와 같이 환경 변수로 암호화 키를 정의하여 애플리케이션에서 사용할 수 있습니다:

```ini
PASSPORT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
<private key here>
-----END RSA PRIVATE KEY-----"

PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
<public key here>
-----END PUBLIC KEY-----"
```

<a name="upgrading-passport"></a>
### 패스포트 업그레이드

Passport의 주요 버전으로 업그레이드할 때는 반드시 [업그레이드 가이드](https://github.com/laravel/passport/blob/master/UPGRADE.md)를 꼼꼼히 읽고 따라야 합니다.

<a name="configuration"></a>
## 설정

<a name="token-lifetimes"></a>
### 토큰 수명

기본적으로 Passport는 1년의 유효기간을 가진 장기 액세스 토큰을 발급합니다. 토큰 만료 기간을 더 길게 또는 더 짧게 지정하고 싶다면 `tokensExpireIn`, `refreshTokensExpireIn`, `personalAccessTokensExpireIn` 메서드를 사용할 수 있습니다. 이 메서드들은 보통 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출합니다:

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
> Passport의 데이터베이스 테이블에 있는 `expires_at` 컬럼은 읽기 전용이며 단순히 표시 목적입니다. 실제 토큰 발급 시, 만료 정보는 서명되고 암호화된 토큰 내에 저장됩니다. 만약 토큰을 즉시 무효화하고 싶다면 [토큰을 폐기](#revoking-tokens)해야 합니다.

<a name="overriding-default-models"></a>
### 기본 모델 오버라이드

Passport가 내부적으로 사용하는 모델을 직접 확장해 사용할 수도 있습니다. 이를 위해 여러분만의 모델을 정의하고, 해당 Passport 모델을 상속하면 됩니다:

```php
use Laravel\Passport\Client as PassportClient;

class Client extends PassportClient
{
    // ...
}
```

모델을 정의한 후에는 `Laravel\Passport\Passport` 클래스를 통해 Passport가 여러분의 커스텀 모델을 사용하도록 지정할 수 있습니다. 보통 이 과정도 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 처리합니다:

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

가끔 Passport가 등록하는 기본 라우트를 커스터마이즈하고 싶을 때가 있습니다. 이를 위해 먼저 애플리케이션의 `AppServiceProvider`의 `register` 메서드에 `Passport::ignoreRoutes`를 추가해 Passport의 라우트 등록을 무시해야 합니다.

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

그런 뒤, [Passport의 routes 파일](https://github.com/laravel/passport/blob/master/routes/web.php)에 정의된 라우트를 복사해서 여러분의 `routes/web.php` 파일에 추가하고 원하는 대로 수정하면 됩니다:

```php
Route::group([
    'as' => 'passport.',
    'prefix' => config('passport.path', 'oauth'),
    'namespace' => '\Laravel\Passport\Http\Controllers',
], function () {
    // Passport 라우트...
});
```

<a name="authorization-code-grant"></a>
## 인가 코드 그랜트

OAuth2에서 인가 코드(authorization code)를 사용하는 방식은 대부분의 개발자에게 매우 익숙할 것입니다. 인가 코드를 사용할 때, 클라이언트 애플리케이션은 사용자를 여러분의 서버로 리디렉션하여 액세스 토큰 발급 요청을 승인(또는 거부)할 수 있도록 합니다.

시작하기 전에, Passport에게 '인가(authorization)' 뷰를 어떻게 반환할지 지정해야 합니다.

인가 뷰의 렌더링 로직은 `Laravel\Passport\Passport` 클래스에서 제공하는 메서드들을 통해 커스터마이즈할 수 있습니다. 보통 이 메서드 역시 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출합니다:

```php
use Laravel\Passport\Passport;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    // 뷰 이름 지정...
    Passport::authorizationView('auth.oauth.authorize');
    
    // 클로저 제공...
    Passport::authorizationView(fn ($parameters) => Inertia::render('Auth/OAuth/Authorize', [
        'request' => $parameters['request'],
        'authToken' => $parameters['authToken'],
        'client' => $parameters['client'],
        'user' => $parameters['user'],
        'scopes' => $parameters['scopes'],
    ]));
}
```

Passport는 이 뷰를 반환하는 `/oauth/authorize` 라우트를 자동으로 정의합니다. 여러분의 `auth.oauth.authorize` 템플릿에는 인가 승인을 위한 `passport.authorizations.approve` 라우트로 POST 요청을 보내는 폼과, 인가 거부를 위한 `passport.authorizations.deny` 라우트로 DELETE 요청을 보내는 폼이 있어야 합니다. 이 라우트들은 `state`, `client_id`, `auth_token` 필드를 기대합니다.

<a name="managing-clients"></a>
### 클라이언트 관리

여러분의 API와 연동하기를 원하는 외부 애플리케이션 개발자들은 "클라이언트"를 등록해야 합니다. 보통은 애플리케이션 이름과, 인가 요청 승인 이후 리디렉션될 수 있는 URI를 제공하는 식으로 이루어집니다.

<a name="managing-first-party-clients"></a>
#### 퍼스트 파티(자체) 클라이언트

가장 간단하게 클라이언트를 생성하려면 `passport:client` 아티즌 명령어를 사용하는 방법이 있습니다. 이 명령어는 자체(퍼스트 파티) 클라이언트 생성이나 OAuth2 기능 테스트에 사용할 수 있습니다. 명령어를 실행하면 Passport가 추가 정보를 입력하라고 안내하고, 입력이 끝나면 클라이언트 ID와 시크릿(secret)을 제공합니다:

```shell
php artisan passport:client
```

클라이언트에 여러 개의 리디렉션 URI를 허용하고 싶다면, `passport:client` 명령어 실행 중 URI 입력 시 쉼표(,)로 구분하여 여러 개를 지정할 수 있습니다. 만약 URI 문자열 자체에 쉼표가 들어가는 경우에는 URI 인코딩을 적용해야 합니다:

```shell
https://third-party-app.com/callback,https://example.com/oauth/redirect
```

<a name="managing-third-party-clients"></a>
#### 서드 파티(외부) 클라이언트

여러분의 애플리케이션 사용자들은 `passport:client` 명령어를 직접 사용할 수 없으므로, `Laravel\Passport\ClientRepository` 클래스의 `createAuthorizationCodeGrantClient` 메서드를 사용해 특정 사용자에 대한 클라이언트를 등록할 수 있습니다:

```php
use App\Models\User;
use Laravel\Passport\ClientRepository;

$user = User::find($userId);

// 지정한 사용자의 OAuth 앱 클라이언트 생성...
$client = app(ClientRepository::class)->createAuthorizationCodeGrantClient(
    user: $user,
    name: 'Example App',
    redirectUris: ['https://third-party-app.com/callback'],
    confidential: false,
    enableDeviceFlow: true
);

// 사용자가 소유한 모든 OAuth 앱 클라이언트 조회...
$clients = $user->oauthApps()->get();
```

`createAuthorizationCodeGrantClient` 메서드는 `Laravel\Passport\Client` 인스턴스를 반환합니다. 사용자에게는 `$client->id`를 클라이언트 ID로, `$client->plainSecret`를 클라이언트 시크릿으로 안내하면 됩니다.

<a name="requesting-tokens"></a>
### 토큰 요청

<a name="requesting-tokens-redirecting-for-authorization"></a>
#### 인가를 위한 리디렉션

클라이언트가 생성된 후, 개발자들은 자신이 발급받은 클라이언트 ID와 시크릿을 사용하여 인가 코드 및 액세스 토큰을 여러분의 애플리케이션에 요청할 수 있습니다. 먼저, 외부 애플리케이션에서는 여러분 애플리케이션의 `/oauth/authorize` 라우트로 리디렉션 요청을 보내야 합니다:

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
        // 'prompt' => '', // "none", "consent", 또는 "login"
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

`prompt` 파라미터를 사용하면 Passport 애플리케이션이 어떤 인증 동작을 할지 지정할 수 있습니다.

- `prompt` 값이 `none`이면, 사용자가 이미 Passport 애플리케이션에 인증되어 있지 않다면 무조건 인증 오류를 발생시킵니다.
- 값이 `consent`이면, 이전에 해당 스코프에 대해 승인한 적이 있더라도 항상 인가 승인 화면을 표시합니다.
- 값이 `login`이면, 이미 세션이 있어도 항상 재로그인을 요구합니다.

`prompt` 값이 지정되지 않은 경우, 사용자가 해당 스코프에 대해 해당 애플리케이션 접근을 아직 승인하지 않았다면 인가 화면이 표시됩니다.

> [!NOTE]
> `/oauth/authorize` 라우트는 Passport에서 이미 정의되어 있으므로 별도로 라우트를 만들 필요가 없습니다.

<a name="approving-the-request"></a>
#### 요청 승인하기

인가 요청을 수신하면, Passport는(있다면) `prompt` 파라미터 값에 따라 자동응답하거나, 사용자에게 인가 승인/거부를 선택할 수 있는 화면을 표시할 수 있습니다. 사용자가 요청을 승인하면, 애플리케이션은 인가 요청 단계에서 지정한 `redirect_uri`로 사용자를 리디렉션합니다. 이때 `redirect_uri`는 클라이언트 생성 시 등록한 URL과 일치해야 합니다.

특정 상황(예: 자체(퍼스트 파티) 클라이언트)에선 승인 화면을 건너뛰고 자동 승인하고 싶을 수 있습니다. 이를 위해 [클라이언트 모델 오버라이드](#overriding-default-models)를 통해 `skipsAuthorization` 메서드를 정의하면 됩니다. 이 메서드가 `true`를 반환하면, 별도의 승인 과정 없이 바로 인가 승인 후 `redirect_uri`로 이동합니다. 단, 외부 애플리케이션에서 인가 요청 시 `prompt` 값을 명시적으로 지정한 경우는 제외됩니다:

```php
<?php

namespace App\Models\Passport;

use Illuminate\Contracts\Auth\Authenticatable;
use Laravel\Passport\Client as BaseClient;

class Client extends BaseClient
{
    /**
     * 클라이언트가 인가 승인 화면을 건너뛰도록 할지 여부를 결정합니다.
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
#### 인가 코드를 액세스 토큰으로 변환하기

사용자가 인가 요청을 승인하면 클라이언트 애플리케이션으로 리디렉션됩니다. 리디렉션된 곳에서는 우선 `state` 파라미터를 미리 저장해 두었던 값과 비교해야 합니다. 만약 일치한다면, 클라이언트에서는 인가 코드를 포함해 여러분의 애플리케이션에 POST 요청을 보내 액세스 토큰을 발급받을 수 있습니다. 이 요청에는 인가 과정에서 발급받은 인가 코드가 포함되어야 합니다:

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

이 `/oauth/token` 라우트는 `access_token`, `refresh_token`, `expires_in` 속성을 포함하는 JSON 응답을 반환합니다. `expires_in`은 액세스 토큰이 만료되기까지 남은 시간을 초 단위로 나타냅니다.

> [!NOTE]
> `/oauth/authorize` 라우트와 마찬가지로, `/oauth/token` 라우트 역시 Passport에서 이미 정의되어 있습니다. 따로 라우트를 추가할 필요가 없습니다.

<a name="managing-tokens"></a>
### 토큰 관리

`Laravel\Passport\HasApiTokens` 트레이트의 `tokens` 메서드를 활용하면 사용자가 승인한 토큰 목록을 조회할 수 있습니다. 예를 들어, 사용자가 외부 애플리케이션과의 연결 현황을 확인할 수 있는 대시보드 기능에 활용할 수 있습니다:

```php
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Date;
use Laravel\Passport\Token;

$user = User::find($userId);

// 사용자의 유효한 모든 토큰 조회...
$tokens = $user->tokens()
    ->where('revoked', false)
    ->where('expires_at', '>', Date::now())
    ->get();

// 사용자의 외부 OAuth 앱 연결 정보 그룹화...
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

여러분의 애플리케이션이 짧은 수명의 액세스 토큰을 발행하는 경우, 사용자는 액세스 토큰이 만료될 때마다 토큰 발급 시 함께 제공된 리프레시 토큰을 통해 새로운 액세스 토큰을 받아야 합니다:

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'refresh_token',
    'refresh_token' => 'the-refresh-token',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret', // 시크릿은 confidential 클라이언트에서만 필수...
    'scope' => 'user:read orders:create',
]);

return $response->json();
```

이 `/oauth/token` 라우트는 역시 `access_token`, `refresh_token`, `expires_in` 속성을 포함한 JSON 응답을 반환합니다. `expires_in`은 남은 토큰 유효기간(초)입니다.

<a name="revoking-tokens"></a>
### 토큰 폐기

토큰을 무효화(폐기)하려면 `Laravel\Passport\Token` 모델의 `revoke` 메서드를 사용할 수 있습니다. 리프레시 토큰은 `Laravel\Passport\RefreshToken` 모델의 `revoke` 메서드를 이용하면 됩니다:

```php
use Laravel\Passport\Passport;
use Laravel\Passport\Token;

$token = Passport::token()->find($tokenId);

// 액세스 토큰 폐기...
$token->revoke();

// 해당 토큰의 리프레시 토큰도 폐기...
$token->refreshToken?->revoke();

// 사용자의 모든 토큰 폐기...
User::find($userId)->tokens()->each(function (Token $token) {
    $token->revoke();
    $token->refreshToken?->revoke();
});
```

<a name="purging-tokens"></a>
### 토큰 정리

폐기되었거나 만료된 토큰을 데이터베이스에서 완전히 삭제하려는 경우, Passport에 포함된 `passport:purge` 아티즌 명령어를 사용할 수 있습니다:

```shell
# 폐기되거나 만료된 토큰/인가 코드/디바이스 코드 정리
php artisan passport:purge

# 6시간 이상 지난 만료 토큰만 정리
php artisan passport:purge --hours=6

# 폐기된 토큰/인가 코드/디바이스 코드만 정리
php artisan passport:purge --revoked

# 만료된 토큰/인가 코드/디바이스 코드만 정리
php artisan passport:purge --expired
```

또한, 애플리케이션의 `routes/console.php` 파일에서 [스케줄 작업](/docs/scheduling)을 설정해 주기적으로 토큰을 자동 정리할 수도 있습니다:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('passport:purge')->hourly();
```

<a name="code-grant-pkce"></a>
## PKCE가 포함된 인가 코드 그랜트

"Proof Key for Code Exchange(PKCE)"가 포함된 인가 코드 그랜트는 SPA(싱글 페이지 애플리케이션)나 모바일 애플리케이션에서 API 인증을 보다 안전하게 구현할 수 있는 방식입니다. 이 그랜트는 클라이언트 시크릿을 안전하게 보관하기 어려운 환경이나, 인가 코드가 중간자 공격 등에 노출될 위험이 있을 때 활용하면 좋습니다. 일반적인 인가 코드 교환 방식의 '클라이언트 시크릿' 대신, "코드 베리파이어(code verifier)"와 "코드 챌린지(code challenge)" 조합을 사용해 토큰을 안전하게 주고받을 수 있습니다.

<a name="creating-a-auth-pkce-grant-client"></a>
### 클라이언트 생성

PKCE 방식의 인가 코드 그랜트를 통해 토큰을 발행하려면, 우선 PKCE를 지원하는 클라이언트를 생성해야 합니다. 이를 위해 `passport:client` 아티즌 명령어에 `--public` 옵션을 추가하면 됩니다:

```shell
php artisan passport:client --public
```

<a name="requesting-auth-pkce-grant-tokens"></a>
### 토큰 요청

<a name="code-verifier-code-challenge"></a>
#### 코드 베리파이어와 코드 챌린지

PKCE 인가 방식은 클라이언트 시크릿을 제공하지 않으므로, 개발자는 토큰을 요청할 때 코드 베리파이어(code verifier)와 코드 챌린지(code challenge) 조합을 생성해야 합니다.

- 코드 베리파이어는 43~128자 길이의 무작위 문자열(알파벳, 숫자, `-`, `.`, `_`, `~` 기호 포함)이어야 합니다. 자세한 기준은 [RFC 7636 스펙](https://tools.ietf.org/html/rfc7636)을 참고하세요.
- 코드 챌린지는 URL 및 파일 이름에 안전한 문자로만 된 Base64 인코딩 문자열이어야 하며, 끝의 `'='` 문자는 제거하고 줄바꿈, 공백 등은 포함하지 않아야 합니다.

```php
$encoded = base64_encode(hash('sha256', $codeVerifier, true));

$codeChallenge = strtr(rtrim($encoded, '='), '+/', '-_');
```

<a name="code-grant-pkce-redirecting-for-authorization"></a>

#### 인가를 위한 리디렉션

클라이언트가 생성되면, 클라이언트 ID와 생성한 code verifier, code challenge를 사용하여 애플리케이션에서 인가 코드와 액세스 토큰을 요청할 수 있습니다. 우선, 외부 애플리케이션은 애플리케이션의 `/oauth/authorize` 라우트로 리디렉션 요청을 보내야 합니다.

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

사용자가 인가 요청을 승인하면, 사용자는 외부 애플리케이션으로 다시 리디렉션됩니다. 소비자(Consumer)는 표준 Authorization Code Grant 방식과 마찬가지로, `state` 파라미터가 리디렉션 전에 저장한 값과 일치하는지 검증해야 합니다.

`state` 파라미터가 일치하면, 해당 소비자는 애플리케이션에 `POST` 요청을 보내 액세스 토큰을 요청할 수 있습니다. 이 요청은 사용자가 인가 요청을 승인할 때 발급받은 인가 코드와, 최초에 생성한 code verifier를 포함해야 합니다.

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
## 디바이스 인가(Authorization) 그랜트

OAuth2 디바이스 인가 그랜트는 TV, 게임 콘솔 등 브라우저가 없거나 입력 수단이 제한적인 기기에서 "device code"(디바이스 코드)를 이용해 액세스 토큰을 발급받을 수 있도록 합니다. 디바이스 플로우를 사용할 때, 디바이스 클라이언트는 사용자에게 별도의 기기(예: 컴퓨터 또는 스마트폰)로 접속해 서버에 접속한 뒤 제공된 "user code"(사용자 코드)를 입력하고 접근 요청을 승인 또는 거부해달라고 안내합니다.

우선, Passport에서 어떻게 "user code"와 "authorization" 뷰를 반환할 것인지 지정해야 합니다.

인가 화면 렌더링에 필요한 뷰는 `Laravel\Passport\Passport` 클래스에서 제공하는 관련 메서드를 사용해 자유롭게 커스터마이징할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다.

```php
use Laravel\Passport\Passport;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    // 뷰 이름으로 지정하는 방법...
    Passport::deviceUserCodeView('auth.oauth.device.user-code');
    Passport::deviceAuthorizationView('auth.oauth.device.authorize');
    
    // 클로저로 지정하는 방법...
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

Passport는 위 뷰를 반환하는 라우트를 자동으로 정의합니다. `auth.oauth.device.user-code` 템플릿에는 `passport.device.authorizations.authorize` 라우트로 GET 요청을 보내는 폼이 포함되어야 합니다. 이 라우트는 `user_code` 쿼리 파라미터를 필요로 합니다.

`auth.oauth.device.authorize` 템플릿에는 승인 시 `passport.device.authorizations.approve` 라우트로 POST 요청, 거부 시 `passport.device.authorizations.deny` 라우트로 DELETE 요청을 보내는 폼이 각각 들어가야 합니다. 두 라우트 모두 `state`, `client_id`, `auth_token` 필드를 요구합니다.

<a name="creating-a-device-authorization-grant-client"></a>
### 디바이스 인가 그랜트 클라이언트 생성

애플리케이션에서 디바이스 인가 그랜트를 통해 토큰을 발급하려면, 디바이스 플로우를 활성화한 클라이언트를 생성해야 합니다. `passport:client` Artisan 명령어에 `--device` 옵션을 추가해 실행하면, 디바이스 플로우가 적용된 퍼스트 파티 클라이언트가 생성되며, 클라이언트 ID와 시크릿을 확인할 수 있습니다.

```shell
php artisan passport:client --device
```

또한, `ClientRepository` 클래스의 `createDeviceAuthorizationGrantClient` 메서드를 사용해 특정 사용자에 속하는 서드 파티 디바이스 클라이언트도 등록할 수 있습니다.

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
### 토큰 요청하기

<a name="device-code"></a>
#### 디바이스 코드 요청

클라이언트가 생성되면, 개발자는 클라이언트 ID를 사용해 애플리케이션에서 디바이스 코드를 요청할 수 있습니다. 먼저, 외부 디바이스는 애플리케이션의 `/oauth/device/code` 라우트로 `POST` 요청을 보내 디바이스 코드를 받습니다.

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/device/code', [
    'client_id' => 'your-client-id',
    'scope' => 'user:read orders:create',
]);

return $response->json();
```

이 요청의 응답에는 `device_code`, `user_code`, `verification_uri`, `interval`, `expires_in` 속성이 포함된 JSON이 반환됩니다. `expires_in`은 디바이스 코드가 만료되기까지의 초(second)를, `interval`은 `/oauth/token` 라우트 폴링 시 속도 제한 오류를 피하기 위해 요청 간 대기해야 하는 초를 나타냅니다.

> [!NOTE]  
> `/oauth/device/code` 라우트는 Passport가 이미 정의합니다. 직접 라우트를 추가할 필요가 없습니다.

<a name="user-code"></a>
#### Verification URI 및 사용자 코드 안내하기

디바이스 코드 요청을 받은 후, 외부 디바이스는 사용자에게 다른 디바이스(예: 컴퓨터, 스마트폰 등)에서 제공된 `verification_uri`에 접속해 `user_code`를 입력하도록 안내해야 합니다.

<a name="polling-token-request"></a>
#### 토큰 요청 폴링(Polling)

사용자가 별도의 디바이스에서 접근 승인(또는 거부)을 진행하므로, 외부 디바이스는 사용자의 응답 여부를 확인하기 위해 `/oauth/token` 라우트로 주기적으로(폴링) 요청을 보내야 합니다. 이때, 디바이스 코드 요청 응답 시 받은 최소 폴링 `interval` 값을 사용해 속도 제한 오류를 피해야 합니다.

```php
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Sleep;

$interval = 5;

do {
    Sleep::for($interval)->seconds();

    $response = Http::asForm()->post('https://passport-app.test/oauth/token', [
        'grant_type' => 'urn:ietf:params:oauth:grant-type:device_code',
        'client_id' => 'your-client-id',
        'client_secret' => 'your-client-secret', // 비밀 클라이언트의 경우에만 필요
        'device_code' => 'the-device-code',
    ]);
    
    if ($response->json('error') === 'slow_down') {
        $interval += 5;
    }
} while (in_array($response->json('error'), ['authorization_pending', 'slow_down']));

return $response->json();
```

사용자가 인가 요청을 승인했다면, 응답으로 `access_token`, `refresh_token`, `expires_in` 속성이 포함된 JSON이 반환됩니다. 이 중 `expires_in`은 액세스 토큰의 만료까지 남은 초(second)를 의미합니다.

<a name="password-grant"></a>
## 패스워드 그랜트

> [!WARNING]
> 이제 더 이상 패스워드 그랜트 토큰 사용을 권장하지 않습니다. 대신 [OAuth2 서버에서 권장하는 그랜트 타입](https://oauth2.thephpleague.com/authorization-server/which-grant/)을 사용해주세요.

OAuth2 패스워드 그랜트는 모바일 애플리케이션 등 귀하의 기타 퍼스트 파티 클라이언트가 이메일/사용자명과 패스워드로 액세스 토큰을 발급받도록 해줍니다. 이렇게 하면 사용자가 전체 OAuth2 인가 코드 리디렉션 플로우를 거치지 않아도 퍼스트 파티 클라이언트에 안전하게 액세스 토큰을 발급할 수 있습니다.

패스워드 그랜트를 활성화하려면, 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `enablePasswordGrant` 메서드를 호출하세요.

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

패스워드 그랜트를 통해 토큰을 발급하려면, 패스워드 그랜트 전용 클라이언트가 필요합니다. 이는 `passport:client` Artisan 명령어에 `--password` 옵션을 추가해 생성할 수 있습니다.

```shell
php artisan passport:client --password
```

<a name="requesting-password-grant-tokens"></a>
### 토큰 요청하기

그랜트를 활성화하고 패스워드 그랜트 클라이언트를 생성한 후에는, 사용자의 이메일 주소와 패스워드를 포함하여 `/oauth/token` 라우트에 `POST` 요청을 보내 액세스 토큰을 발급받을 수 있습니다. 참고로, 이 라우트는 Passport가 이미 등록하므로 직접 정의할 필요가 없습니다. 요청이 성공하면 서버로부터 JSON 응답으로 `access_token` 및 `refresh_token`을 받을 수 있습니다.

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'password',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret', // 비밀 클라이언트의 경우에만 필요
    'username' => 'taylor@laravel.com',
    'password' => 'my-password',
    'scope' => 'user:read orders:create',
]);

return $response->json();
```

> [!NOTE]
> 기본적으로 액세스 토큰은 수명이 깁니다. 하지만 필요하다면 [액세스 토큰의 최대 유효 기간을 직접 설정](#configuration)할 수 있습니다.

<a name="requesting-all-scopes"></a>
### 모든 스코프 요청하기

패스워드 그랜트나 클라이언트 크리덴셜 그랜트 사용 시, 애플리케이션에서 지원하는 모든 스코프에 대해 토큰을 승인하고 싶을 수 있습니다. 이럴 때는 `*` 스코프를 요청하면 됩니다. `*` 스코프를 사용하면, 토큰 인스턴스의 `can` 메서드는 항상 `true`를 반환합니다. 이 스코프는 반드시 `password` 또는 `client_credentials` 그랜트로 발급되는 토큰에만 적용됩니다.

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'password',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret', // 비밀 클라이언트의 경우에만 필요
    'username' => 'taylor@laravel.com',
    'password' => 'my-password',
    'scope' => '*',
]);
```

<a name="customizing-the-user-provider"></a>
### User Provider 커스터마이징

애플리케이션에서 [여러 인증 user provider](/docs/authentication#introduction)를 사용하는 경우, `artisan passport:client --password` 명령어로 클라이언트를 생성할 때 `--provider` 옵션을 지정해 해당 패스워드 그랜트 클라이언트가 사용할 user provider를 정할 수 있습니다. 이때 provider 이름은 `config/auth.php` 설정 파일에 정의된 값이어야 합니다. 이후 [미들웨어를 이용해 라우트를 보호](#multiple-authentication-guards)하여 guard에 지정된 provider의 사용자만 접근할 수 있도록 할 수 있습니다.

<a name="customizing-the-username-field"></a>
### 사용자명(Username) 필드 커스터마이징

패스워드 그랜트로 인증할 때 Passport는 기본적으로 인증 가능한 모델의 `email` 속성을 "username"으로 사용합니다. 하지만, 모델에 `findForPassport` 메서드를 정의해 이 동작을 커스터마이징할 수 있습니다.

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
     * Find the user instance for the given username.
     */
    public function findForPassport(string $username): User
    {
        return $this->where('username', $username)->first();
    }
}
```

<a name="customizing-the-password-validation"></a>
### 패스워드 유효성 검증 커스터마이징

패스워드 그랜트 인증 시, Passport는 기본적으로 모델의 `password` 속성을 사용해 전달받은 비밀번호를 검증합니다. 만약 모델에 `password` 속성이 없거나, 패스워드 검증 방식을 커스터마이징하고 싶다면 모델에 `validateForPassportPasswordGrant` 메서드를 정의하면 됩니다.

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
     * Validate the password of the user for the Passport password grant.
     */
    public function validateForPassportPasswordGrant(string $password): bool
    {
        return Hash::check($password, $this->password);
    }
}
```

<a name="implicit-grant"></a>
## 임플리시트(Implicit) 그랜트

> [!WARNING]
> 이제 더 이상 임플리시트 그랜트 토큰 사용을 권장하지 않습니다. 대신 [OAuth2 서버에서 권장하는 그랜트 타입](https://oauth2.thephpleague.com/authorization-server/which-grant/)을 사용해주세요.

임플리시트 그랜트는 인가 코드 그랜트 방식과 비슷하지만, 인가 코드를 따로 교환하지 않고 토큰이 바로 클라이언트에 전달됩니다. 이 방식은 클라이언트 크리덴셜을 안전하게 저장할 수 없는 JavaScript 또는 모바일 애플리케이션에서 주로 활용됩니다. 임플리시트 그랜트를 활성화하려면, `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `enableImplicitGrant` 메서드를 호출하면 됩니다.

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::enableImplicitGrant();
}
```

임플리시트 그랜트로 토큰을 발급하려면, `passport:client` Artisan 명령어에 `--implicit` 옵션을 추가해 전용 클라이언트를 생성해야 합니다.

```shell
php artisan passport:client --implicit
```

그랜트를 활성화하고 임플리시트 클라이언트를 생성한 후에는, 개발자는 클라이언트 ID를 사용해 애플리케이션에 액세스 토큰을 요청할 수 있습니다. 외부 애플리케이션은 아래와 같이 `/oauth/authorize` 라우트로 리디렉션 요청을 보내면 됩니다.

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
> `/oauth/authorize` 라우트 역시 Passport가 이미 정의하므로, 직접 추가하지 않아도 됩니다.

<a name="client-credentials-grant"></a>
## 클라이언트 크리덴셜(Client Credentials) 그랜트

클라이언트 크리덴셜 그랜트 방식은 머신-투-머신 인증에 적합합니다. 예를 들어, 주기적으로 실행되는 잡에서 API를 통해 유지보수 작업을 수행할 때 이 그랜트를 사용할 수 있습니다.

클라이언트 크리덴셜 그랜트로 토큰을 발급하려면, 우선 전용 클라이언트를 만들어야 합니다. `passport:client` Artisan 명령어에 `--client` 옵션을 추가해 실행하세요.

```shell
php artisan passport:client --client
```

다음으로, `Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner` 미들웨어를 특정 라우트에 할당합니다.

```php
use Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner;

Route::get('/orders', function (Request $request) {
    // 액세스 토큰이 유효하고, 클라이언트가 리소스 소유자인 경우만 접근 가능...
})->middleware(EnsureClientIsResourceOwner::class);
```

특정 스코프가 필요하도록 라우트 접근을 제한하려면, `using` 메서드에 필요한 스코프 목록을 전달할 수 있습니다.

```php
Route::get('/orders', function (Request $request) {
    // 액세스 토큰이 유효하고, 클라이언트가 리소스 소유자이며 "servers:read", "servers:create" 두 스코프를 모두 가진 경우만 접근 가능...
})->middleware(EnsureClientIsResourceOwner::using('servers:read', 'servers:create');
```

<a name="retrieving-tokens"></a>
### 토큰 조회하기

이 그랜트 방식으로 토큰을 조회하려면, `oauth/token` 엔드포인트로 요청을 보냅니다.

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
## 개인 액세스 토큰(Personal Access Tokens)

경우에 따라, 사용자가 일반적인 인가 코드 리디렉션 과정을 거치지 않고 자신에게 직접 액세스 토큰을 발급하고 싶을 수 있습니다. 애플리케이션 UI에서 사용자가 직접 토큰을 발급하도록 허용하면, API를 테스트하거나 더 간단한 방식으로 액세스 토큰 발급을 제공하는 데 유용할 수 있습니다.

> [!NOTE]
> 애플리케이션에서 개인 액세스 토큰 발급만 주로 사용할 계획이라면, API 액세스 토큰 발급을 위해 라라벨이 제공하는 경량 라이브러리 [Laravel Sanctum](/docs/sanctum) 사용을 고려해보세요.

<a name="creating-a-personal-access-client"></a>
### 개인 액세스 클라이언트 생성

개인 액세스 토큰을 발급하려면, 먼저 전용 클라이언트를 생성해야 합니다. `passport:client` Artisan 명령어에 `--personal` 옵션을 추가해 실행하면 됩니다. 이미 `passport:install` 명령어를 실행했다면, 추가로 실행할 필요는 없습니다.

```shell
php artisan passport:client --personal
```

<a name="customizing-the-user-provider-for-pat"></a>
### User Provider 커스터마이징

여러 [인증 user provider](/docs/authentication#introduction)를 사용하는 경우, `artisan passport:client --personal` 명령어로 클라이언트를 생성할 때 `--provider` 옵션을 지정해 해당 개인 액세스 그랜트 클라이언트가 사용할 user provider를 지정할 수 있습니다. 이름은 `config/auth.php` 설정 파일에 나오는 provider 중 하나여야 합니다. 이후 [미들웨어로 라우트 보호](#multiple-authentication-guards) 시, 해당 guard의 provider 사용자만 접근 가능하게 만들 수 있습니다.

<a name="managing-personal-access-tokens"></a>
### 개인 액세스 토큰 관리

개인 액세스 클라이언트를 생성한 후에는, `App\Models\User` 모델 인스턴스의 `createToken` 메서드를 통해 해당 사용자에 대해 토큰을 발급할 수 있습니다. `createToken` 메서드는 첫 번째 인자로 토큰명을, 두 번째(선택) 인자로 [스코프](#token-scopes) 배열을 받습니다.

```php
use App\Models\User;
use Illuminate\Support\Facades\Date;
use Laravel\Passport\Token;

$user = User::find($userId);

// 스코프 없이 토큰 생성...
$token = $user->createToken('My Token')->accessToken;

// 스코프와 함께 토큰 생성...
$token = $user->createToken('My Token', ['user:read', 'orders:create'])->accessToken;

// 모든 스코프를 가진 토큰 생성...
$token = $user->createToken('My Token', ['*'])->accessToken;

// 사용자에게 속한 모든 유효한 개인 액세스 토큰 조회...
$tokens = $user->tokens()
    ->with('client')
    ->where('revoked', false)
    ->where('expires_at', '>', Date::now())
    ->get()
    ->filter(fn (Token $token) => $token->client->hasGrantType('personal_access'));
```

<a name="protecting-routes"></a>
## 라우트 보호하기

<a name="via-middleware"></a>
### 미들웨어 이용

Passport는 [인증 가드](/docs/authentication#adding-custom-guards)를 제공하며, 해당 가드는 들어오는 요청의 액세스 토큰을 검증합니다. `api` 가드를 `passport` 드라이버로 설정했다면, 액세스 토큰이 필요한 라우트에 `auth:api` 미들웨어만 추가하면 됩니다.

```php
Route::get('/user', function () {
    // API 인증된 사용자만 접근 가능한 라우트...
})->middleware('auth:api');
```

> [!WARNING]
> [클라이언트 크리덴셜 그랜트](#client-credentials-grant)를 사용하는 경우, 라우트 보호에 반드시 [`Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner` 미들웨어](#client-credentials-grant)를 사용해야 하며 `auth:api` 미들웨어를 사용해서는 안 됩니다.

<a name="multiple-authentication-guards"></a>
#### 다중 인증 가드 사용

애플리케이션에서 여러 사용자 타입(서로 완전히 다른 Eloquent 모델 등)을 인증한다면, user provider마다 각기 다른 가드 구성이 필요할 수 있습니다. 이를 통해 특정 user provider 전용 요청에 대해 보호할 수 있습니다. 예를 들어, `config/auth.php` 설정 파일에 다음과 같은 가드 구성이 있을 때:

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

아래 라우트는 `customers` user provider를 사용하는 `api-customers` 가드를 이용해 요청을 인증합니다.

```php
Route::get('/customer', function () {
    // ...
})->middleware('auth:api-customers');
```

> [!NOTE]
> Passport에서 여러 user provider를 사용하는 방법에 대한 자세한 내용은 [개인 액세스 토큰 관련 문서](#customizing-the-user-provider-for-pat)와 [패스워드 그랜트 관련 문서](#customizing-the-user-provider)를 참고하세요.

<a name="passing-the-access-token"></a>
### 액세스 토큰 전달 방식

Passport로 보호된 라우트를 호출할 때, API 소비자는 요청의 `Authorization` 헤더에 그들의 액세스 토큰을 `Bearer` 토큰으로 지정해야 합니다. 예를 들어, `Http` 파사드를 사용할 때 아래와 같이 전달합니다.

```php
use Illuminate\Support\Facades\Http;

$response = Http::withHeaders([
    'Accept' => 'application/json',
    'Authorization' => "Bearer $accessToken",
])->get('https://passport-app.test/api/user');

return $response->json();
```

<a name="token-scopes"></a>
## 토큰 스코프(Token Scopes)

스코프는 API 클라이언트가 계정 접근을 요청할 때 필요한 권한 집합을 세분화해 요청할 수 있도록 해줍니다. 예를 들어, 이커머스 애플리케이션을 개발 중이라면 모든 API 소비자가 주문 생성 권한까지 필요하지 않을 수 있습니다. 대신, 일부 소비자에게는 주문 배송 상태 조회만 허용할 수도 있습니다. 즉, 스코프를 사용하면 사용자가 외부 애플리케이션에 대신 허용할 수 있는 행동 범위를 제한할 수 있습니다.

<a name="defining-scopes"></a>
### 스코프 정의하기

API의 스코프는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `Passport::tokensCan` 메서드를 통해 정의할 수 있습니다. 이 메서드는 스코프 이름과 설명을 배열 형태로 받으며, 설명은 원하는 대로 지정할 수 있고 인가 승인 화면에 표시됩니다.

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
### 기본 스코프(Default Scope)

클라이언트가 특정 스코프를 요청하지 않았을 때, `defaultScopes` 메서드를 사용해 Passport 서버에서 토큰에 기본 스코프를 추가할 수 있습니다. 이 역시 일반적으로 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출합니다.

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

인가 코드 그랜트 방식을 사용하여 액세스 토큰을 요청할 때, 클라이언트는 원하는 스코프를 `scope` 쿼리 문자열 파라미터로 지정해야 합니다. `scope` 파라미터에는 공백으로 구분된 스코프 목록을 입력해야 합니다.

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

`App\Models\User` 모델의 `createToken` 메서드를 사용해 개인 액세스 토큰을 발급할 경우, 두 번째 인수로 원하는 스코프 배열을 전달할 수 있습니다.

```php
$token = $user->createToken('My Token', ['orders:create'])->accessToken;
```

<a name="checking-scopes"></a>
### 스코프 확인하기

Passport에는 들어오는 요청이 특정 스코프가 부여된 토큰으로 인증되었는지 확인할 수 있는 두 개의 미들웨어가 포함되어 있습니다.

<a name="check-for-all-scopes"></a>
#### 모든 스코프 확인

`Laravel\Passport\Http\Middleware\CheckToken` 미들웨어를 라우트에 할당하면, 해당 액세스 토큰에 나열한 모든 스코프가 포함되어 있는지 확인할 수 있습니다.

```php
use Laravel\Passport\Http\Middleware\CheckToken;

Route::get('/orders', function () {
    // 액세스 토큰에 "orders:read"와 "orders:create" 스코프가 모두 포함되어 있습니다...
})->middleware(['auth:api', CheckToken::using('orders:read', 'orders:create');
```

<a name="check-for-any-scopes"></a>
#### 하나 이상의 스코프 확인

`Laravel\Passport\Http\Middleware\CheckTokenForAnyScope` 미들웨어를 라우트에 할당하면, 해당 액세스 토큰에 나열한 스코프 중 *하나 이상*이 포함되어 있는지 확인할 수 있습니다.

```php
use Laravel\Passport\Http\Middleware\CheckTokenForAnyScope;

Route::get('/orders', function () {
    // 액세스 토큰에 "orders:read" 혹은 "orders:create" 스코프가 포함되어 있습니다...
})->middleware(['auth:api', CheckTokenForAnyScope::using('orders:read', 'orders:create');
```

<a name="checking-scopes-on-a-token-instance"></a>
#### 토큰 인스턴스에서 스코프 확인하기

액세스 토큰으로 인증된 요청이 애플리케이션에 도달한 후에도, 인증된 `App\Models\User` 인스턴스의 `tokenCan` 메서드를 사용해 해당 토큰이 특정 스코프를 가지고 있는지 추가로 확인할 수 있습니다.

```php
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    if ($request->user()->tokenCan('orders:create')) {
        // ...
    }
});
```

<a name="additional-scope-methods"></a>
#### 추가 스코프 관련 메서드

`scopeIds` 메서드는 정의된 모든 스코프의 ID 또는 이름이 담긴 배열을 반환합니다.

```php
use Laravel\Passport\Passport;

Passport::scopeIds();
```

`scopes` 메서드는 정의된 모든 스코프를 `Laravel\Passport\Scope` 인스턴스의 배열로 반환합니다.

```php
Passport::scopes();
```

`scopesFor` 메서드는 전달된 ID/이름과 일치하는 `Laravel\Passport\Scope` 인스턴스의 배열을 반환합니다.

```php
Passport::scopesFor(['user:read', 'orders:create']);
```

특정 스코프가 정의되어 있는지 확인하려면 `hasScope` 메서드를 사용할 수 있습니다.

```php
Passport::hasScope('orders:create');
```

<a name="spa-authentication"></a>
## SPA 인증

API를 구축하다 보면 자바스크립트 애플리케이션에서 직접 자신의 API를 사용할 수 있으면 매우 편리합니다. 이 접근 방식은 여러분의 웹 애플리케이션, 모바일 애플리케이션, 써드파티 애플리케이션, 혹은 배포하는 다양한 SDK 등에서도 동일한 API를 활용할 수 있게 해줍니다.

일반적으로 자바스크립트 애플리케이션에서 API를 사용하려면 액세스 토큰을 직접 전달하고, 각 요청에 토큰을 포함시켜야 합니다. 하지만 Passport에는 이 과정을 쉽게 처리할 수 있는 미들웨어가 포함되어 있습니다. 애플리케이션의 `bootstrap/app.php` 파일에서 `web` 미들웨어 그룹에 `CreateFreshApiToken` 미들웨어를 추가하기만 하면 됩니다.

```php
use Laravel\Passport\Http\Middleware\CreateFreshApiToken;

->withMiddleware(function (Middleware $middleware) {
    $middleware->web(append: [
        CreateFreshApiToken::class,
    ]);
})
```

> [!WARNING]
> `CreateFreshApiToken` 미들웨어가 미들웨어 스택에서 마지막에 위치하도록 반드시 설정해야 합니다.

이 미들웨어는 응답에 `laravel_token` 쿠키를 자동으로 추가합니다. 이 쿠키에는 Passport가 자바스크립트 애플리케이션의 API 요청을 인증하는 데 사용할 암호화된 JWT가 담겨 있습니다. 이 JWT의 유효 기간은 `session.lifetime` 설정값과 동일합니다. 이제 브라우저가 해당 쿠키를 이후 모든 요청에 자동으로 포함시켜 전달하므로, 액세스 토큰을 명시적으로 전달하지 않아도 API 요청을 할 수 있습니다.

```js
axios.get('/api/user')
    .then(response => {
        console.log(response.data);
    });
```

<a name="customizing-the-cookie-name"></a>
#### 쿠키 이름 커스터마이징

필요하다면, `Passport::cookie` 메서드를 사용해 `laravel_token` 쿠키의 이름을 원하는 값으로 변경할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드 내에서 호출합니다.

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

이 방식의 인증을 사용할 때에는 요청마다 유효한 CSRF 토큰 헤더가 반드시 포함되어야 합니다. 라라벨 스켈레톤 및 모든 Starter Kit에 기본 포함된 [Axios](https://github.com/axios/axios) 인스턴스는 암호화된 `XSRF-TOKEN` 쿠키 값을 사용해 동일 출처 요청 시 자동으로 `X-XSRF-TOKEN` 헤더를 전송합니다.

> [!NOTE]
> 만약 `X-XSRF-TOKEN` 대신 `X-CSRF-TOKEN` 헤더를 전송하려면, 암호화되지 않은 `csrf_token()`의 값을 사용해야 합니다.

<a name="events"></a>
## 이벤트

Passport는 액세스 토큰과 리프레시 토큰이 발급될 때 이벤트를 발생시킵니다. 이러한 이벤트를 [수신(Listen)](/docs/events)하여 데이터베이스에서 다른 액세스 토큰을 제거(Prune)하거나 무효화(리보크)할 수 있습니다.

<div class="overflow-auto">

| 이벤트명 |
| --- |
| `Laravel\Passport\Events\AccessTokenCreated` |
| `Laravel\Passport\Events\RefreshTokenCreated` |

</div>

<a name="testing"></a>
## 테스트

Passport의 `actingAs` 메서드를 사용해 현재 인증된 사용자와 그 토큰에 부여할 스코프를 지정할 수 있습니다. `actingAs` 메서드의 첫 번째 인수는 사용자 인스턴스, 두 번째 인수는 사용자 토큰에 부여할 스코프 배열입니다.

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

Passport의 `actingAsClient` 메서드를 이용하면 현재 인증된 클라이언트와 그 토큰에 부여할 스코프를 지정할 수 있습니다. 첫 번째 인수로 클라이언트 인스턴스를, 두 번째 인수로 클라이언트 토큰에 부여할 스코프 배열을 전달합니다.

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