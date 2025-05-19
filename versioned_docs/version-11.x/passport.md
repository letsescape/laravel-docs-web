# 라라벨 패스포트 (Laravel Passport)

- [소개](#introduction)
    - [Passport와 Sanctum 중 무엇을 선택해야 할까요?](#passport-or-sanctum)
- [설치](#installation)
    - [패스포트 배포하기](#deploying-passport)
    - [패스포트 업그레이드](#upgrading-passport)
- [설정](#configuration)
    - [클라이언트 시크릿 해싱](#client-secret-hashing)
    - [토큰 수명](#token-lifetimes)
    - [기본 모델 오버라이드](#overriding-default-models)
    - [라우트 오버라이드](#overriding-routes)
- [액세스 토큰 발급](#issuing-access-tokens)
    - [클라이언트 관리](#managing-clients)
    - [토큰 요청하기](#requesting-tokens)
    - [토큰 갱신하기](#refreshing-tokens)
    - [토큰 폐기하기](#revoking-tokens)
    - [토큰 정리하기](#purging-tokens)
- [PKCE가 적용된 인증 코드 그랜트](#code-grant-pkce)
    - [클라이언트 생성](#creating-a-auth-pkce-grant-client)
    - [토큰 요청하기](#requesting-auth-pkce-grant-tokens)
- [패스워드 그랜트 토큰](#password-grant-tokens)
    - [패스워드 그랜트 클라이언트 생성](#creating-a-password-grant-client)
    - [토큰 요청하기](#requesting-password-grant-tokens)
    - [모든 스코프 요청하기](#requesting-all-scopes)
    - [사용자 프로바이더 커스터마이징](#customizing-the-user-provider)
    - [사용자명 필드 커스터마이징](#customizing-the-username-field)
    - [패스워드 유효성 검증 커스터마이징](#customizing-the-password-validation)
- [임플리싯 그랜트 토큰](#implicit-grant-tokens)
- [클라이언트 크리덴셜 그랜트 토큰](#client-credentials-grant-tokens)
- [개인 액세스 토큰](#personal-access-tokens)
    - [개인 액세스 클라이언트 생성](#creating-a-personal-access-client)
    - [개인 액세스 토큰 관리](#managing-personal-access-tokens)
- [라우트 보호하기](#protecting-routes)
    - [미들웨어로 보호](#via-middleware)
    - [액세스 토큰 전달](#passing-the-access-token)
- [토큰 스코프](#token-scopes)
    - [스코프 정의하기](#defining-scopes)
    - [기본 스코프](#default-scope)
    - [토큰에 스코프 할당](#assigning-scopes-to-tokens)
    - [스코프 체크](#checking-scopes)
- [JavaScript로 API 소비하기](#consuming-your-api-with-javascript)
- [이벤트](#events)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

[Laravel Passport](https://github.com/laravel/passport)는 라라벨 애플리케이션에서 몇 분 만에 사용할 수 있는 완전한 OAuth2 서버 구현체를 제공합니다. Passport는 Andy Millington과 Simon Hamp가 관리하는 [League OAuth2 server](https://github.com/thephpleague/oauth2-server)를 기반으로 구축되었습니다.

> [!WARNING]  
> 이 문서에서는 OAuth2에 대해 이미 알고 있다고 가정합니다. OAuth2에 대해 전혀 모른다면, 계속 읽기 전에 [용어](https://oauth2.thephpleague.com/terminology/) 및 OAuth2의 주요 기능들을 먼저 숙지하시기 바랍니다.

<a name="passport-or-sanctum"></a>
### Passport와 Sanctum 중 무엇을 선택해야 할까요?

시작하기 전, 라라벨 패스포트가 여러분의 애플리케이션에 더 적합한지, 아니면 [Laravel Sanctum](/docs/11.x/sanctum)이 더 나은지 판단해보는 것이 좋습니다. 만약 애플리케이션에서 반드시 OAuth2 프로토콜을 지원해야 한다면 Laravel Passport를 사용해야 합니다.

반면, SPA(싱글 페이지 애플리케이션)나 모바일 애플리케이션에서 인증을 하거나, 단순히 API 토큰을 발급하면 충분하다면 [Laravel Sanctum](/docs/11.x/sanctum)을 사용하는 것이 더 적합합니다. Laravel Sanctum은 OAuth2를 지원하지 않지만, 훨씬 단순한 API 인증 개발 환경을 제공합니다.

<a name="installation"></a>
## 설치

`install:api` 아티즌 명령어를 통해 Laravel Passport를 설치할 수 있습니다:

```shell
php artisan install:api --passport
```

이 명령어는 필요한 데이터베이스 마이그레이션을 게시 및 실행하여, OAuth2 클라이언트와 액세스 토큰을 저장하는 데 필요한 테이블을 생성합니다. 또한, 보안 액세스 토큰 생성을 위한 암호화 키도 생성합니다.

추가로, 이 명령을 실행하면 Passport의 `Client` 모델의 기본 키에 auto-increment 정수 대신 UUID를 사용할지 묻게 됩니다.

`install:api` 명령을 실행한 후에는 `App\Models\User` 모델에 `Laravel\Passport\HasApiTokens` 트레이트를 추가해야 합니다. 이 트레이트를 추가하면, 인증된 사용자의 토큰 및 스코프를 확인할 수 있는 몇 가지 헬퍼 메서드가 모델에 제공됩니다:

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}
```

마지막으로, 애플리케이션의 `config/auth.php` 설정 파일에서 `api` 인증 가드를 정의하고, `driver` 옵션을 `passport`로 설정해야 합니다. 이렇게 하면, API 요청을 인증할 때 라라벨이 Passport의 `TokenGuard`를 사용하도록 지정됩니다:

```
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

애플리케이션 서버에 Passport를 처음 배포할 때는 `passport:keys` 명령어를 실행해야 할 필요가 있습니다. 이 명령은 Passport가 액세스 토큰을 생성하는 데 필요한 암호화 키를 생성하며, 생성된 키는 보통 소스 제어에 포함하지 않습니다:

```shell
php artisan passport:keys
```

필요하다면 Passport의 키를 로드할 경로를 직접 지정할 수도 있습니다. 이를 위해서는 `Passport::loadKeysFrom` 메서드를 사용할 수 있습니다. 보통 이 메서드는 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출합니다:

```
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

또는, `vendor:publish` 아티즌 명령어를 사용하여 Passport의 설정 파일을 게시할 수 있습니다:

```shell
php artisan vendor:publish --tag=passport-config
```

설정 파일을 게시한 후에는 아래와 같이 환경 변수에 암호화 키를 정의하여 애플리케이션이 해당 키를 로드하도록 할 수 있습니다:

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

Passport의 주요 버전을 업그레이드할 때는 반드시 [업그레이드 가이드](https://github.com/laravel/passport/blob/master/UPGRADE.md)를 꼼꼼히 확인해야 합니다.

<a name="configuration"></a>
## 설정

<a name="client-secret-hashing"></a>
### 클라이언트 시크릿 해싱

클라이언트의 시크릿을 데이터베이스에 저장할 때 해싱하여 보관하고 싶다면, `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `Passport::hashClientSecrets` 메서드를 호출하면 됩니다:

```
use Laravel\Passport\Passport;

Passport::hashClientSecrets();
```

이 기능을 활성화하면, 모든 클라이언트 시크릿은 생성 직후에만 사용자에게 표시되며, 일반 텍스트 값은 데이터베이스에 저장되지 않습니다. 따라서 시크릿 값을 분실했다면 복구할 수 없습니다.

<a name="token-lifetimes"></a>
### 토큰 수명

기본적으로 Passport가 발급하는 액세스 토큰은 1년 뒤에 만료되는 장기 토큰입니다. 더 길거나 짧은 토큰 수명을 설정하려면 `tokensExpireIn`, `refreshTokensExpireIn`, `personalAccessTokensExpireIn` 메서드를 사용할 수 있습니다. 이 메서드들도 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다:

```
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::tokensExpireIn(now()->addDays(15));
    Passport::refreshTokensExpireIn(now()->addDays(30));
    Passport::personalAccessTokensExpireIn(now()->addMonths(6));
}
```

> [!WARNING]  
> Passport의 데이터베이스 테이블에 있는 `expires_at` 컬럼은 읽기 전용이며, 단순히 만료 정보를 표시하기 위해서만 사용됩니다. 토큰 발급 시, 실제 만료 정보는 서명되고 암호화된 토큰 안에 저장됩니다. 토큰을 무효화하려면 [토큰 폐기](#revoking-tokens)를 수행해야 합니다.

<a name="overriding-default-models"></a>
### 기본 모델 오버라이드

Passport가 내부적으로 사용하는 모델을 확장하여 여러분만의 모델을 정의할 수도 있습니다. 이를 위해서는 Passport의 해당 모델을 상속받는 새로운 모델 클래스를 만들면 됩니다:

```
use Laravel\Passport\Client as PassportClient;

class Client extends PassportClient
{
    // ...
}
```

커스텀 모델을 정의한 후에는, `Laravel\Passport\Passport` 클래스를 이용해 Passport가 해당 모델을 사용하도록 지정해야 합니다. 보통 이 작업도 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 처리합니다:

```
use App\Models\Passport\AuthCode;
use App\Models\Passport\Client;
use App\Models\Passport\PersonalAccessClient;
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
    Passport::usePersonalAccessClientModel(PersonalAccessClient::class);
}
```

<a name="overriding-routes"></a>
### 라우트 오버라이드

Passport가 기본으로 등록하는 라우트를 커스터마이즈하고 싶은 경우, 먼저 애플리케이션의 `AppServiceProvider`의 `register` 메서드에 `Passport::ignoreRoutes`를 추가하여 Passport의 라우트 등록을 무시해야 합니다:

```
use Laravel\Passport\Passport;

/**
 * Register any application services.
 */
public function register(): void
{
    Passport::ignoreRoutes();
}
```

그 다음, [Passport의 라우트 파일](https://github.com/laravel/passport/blob/11.x/routes/web.php)에 정의된 라우트를 애플리케이션의 `routes/web.php` 파일로 복사해서 원하는 대로 수정하여 사용할 수 있습니다:

```
Route::group([
    'as' => 'passport.',
    'prefix' => config('passport.path', 'oauth'),
    'namespace' => '\Laravel\Passport\Http\Controllers',
], function () {
    // Passport routes...
});
```

<a name="issuing-access-tokens"></a>
## 액세스 토큰 발급

OAuth2를 사용할 때 대다수 개발자들에게 가장 익숙한 방식은 인증 코드(authorization code)를 이용하는 방법입니다. 이 방식을 사용하면, 클라이언트 애플리케이션이 사용자를 여러분의 서버로 리디렉션시키고, 사용자는 해당 클라이언트에게 액세스 토큰 발급을 허용하거나 거부하게 됩니다.

<a name="managing-clients"></a>
### 클라이언트 관리

먼저, 여러분의 API와 통신해야 하는 애플리케이션을 개발하는 개발자는 "클라이언트"를 생성하여 자신의 애플리케이션을 등록해야 합니다. 일반적으로 클라이언트 등록을 위해 애플리케이션 이름과, 사용자 승인이 완료되었을 때 리디렉션될 URL만 제공하면 충분합니다.

<a name="the-passportclient-command"></a>
#### `passport:client` 명령어

클라이언트를 가장 간단하게 생성하는 방법은 `passport:client` 아티즌 명령어를 사용하는 것입니다. 이 명령은 OAuth2 기능 테스트용으로 여러분이 직접 클라이언트를 생성할 때에도 사용할 수 있습니다. 명령어를 실행하면, Passport가 클라이언트에 대한 추가 정보를 입력받으며, 클라이언트 ID와 시크릿을 제공합니다:

```shell
php artisan passport:client
```

**리디렉트 URL**

한 클라이언트에 여러 개의 리디렉트 URL을 허용하고 싶다면, `passport:client` 명령어에서 URL 입력 시 쉼표로 구분된 리스트 형태로 지정할 수 있습니다. 만약 URL에 쉼표가 포함되어 있다면 URL 인코딩을 사용해야 합니다:

```shell
http://example.com/callback,http://examplefoo.com/callback
```

<a name="clients-json-api"></a>
#### JSON API

여러분의 애플리케이션 사용자들은 직접 `client` 명령을 사용할 수 없으므로, Passport는 클라이언트 생성을 위한 JSON API도 제공합니다. 이 API를 이용하면 클라이언트 생성·수정·삭제 기능을 컨트롤러로 수동 구현할 필요가 없습니다.

단, Passport의 JSON API만 단독으로 사용하는 것이 아니라, 여러분만의 프론트엔드와 함께 대시보드 형태로 사용자에게 클라이언트 관리를 제공해야 합니다. 아래에선 모든 클라이언트 관리 API 엔드포인트를 살펴보며, 실제 HTTP 요청은 [Axios](https://github.com/axios/axios)로 예시를 들었습니다.

이 JSON API는 `web` 및 `auth` 미들웨어로 보호되므로, 여러분 애플리케이션 내부에서만 호출할 수 있고 외부에서는 호출할 수 없습니다.

<a name="get-oauthclients"></a>
#### `GET /oauth/clients`

이 라우트는 인증된 사용자가 소유한 모든 클라이언트 목록을 반환합니다. 주로 사용자가 자신의 클라이언트를 편집하거나 삭제할 수 있도록 리스트를 보여줄 때 사용합니다:

```js
axios.get('/oauth/clients')
    .then(response => {
        console.log(response.data);
    });
```

<a name="post-oauthclients"></a>
#### `POST /oauth/clients`

이 라우트는 새로운 클라이언트를 생성할 때 사용합니다. 클라이언트의 `name`과 `redirect` URL, 두 가지 데이터가 필수로 필요합니다. `redirect` URL은 사용자가 권한 부여를 승인 또는 거부했을 때 리디렉트될 위치입니다.

클라이언트가 생성되면 새로운 클라이언트 ID와 시크릿을 발급받게 되며, 이 값들은 애플리케이션에서 액세스 토큰을 요청할 때 사용합니다. 생성 API는 생성된 클라이언트 객체를 반환합니다:

```js
const data = {
    name: 'Client Name',
    redirect: 'http://example.com/callback'
};

axios.post('/oauth/clients', data)
    .then(response => {
        console.log(response.data);
    })
    .catch (response => {
        // 에러 목록 처리...
    });
```

<a name="put-oauthclientsclient-id"></a>
#### `PUT /oauth/clients/{client-id}`

이 라우트는 클라이언트 정보를 수정할 때 사용합니다. 역시 `name`과 `redirect` URL, 두 가지 데이터가 필요하며, 요청 후에는 수정된 클라이언트 객체를 반환합니다:

```js
const data = {
    name: 'New Client Name',
    redirect: 'http://example.com/callback'
};

axios.put('/oauth/clients/' + clientId, data)
    .then(response => {
        console.log(response.data);
    })
    .catch (response => {
        // 에러 목록 처리...
    });
```

<a name="delete-oauthclientsclient-id"></a>
#### `DELETE /oauth/clients/{client-id}`

이 라우트는 클라이언트를 삭제하는 데 사용합니다:

```js
axios.delete('/oauth/clients/' + clientId)
    .then(response => {
        // ...
    });
```

<a name="requesting-tokens"></a>
### 토큰 요청하기

<a name="requesting-tokens-redirecting-for-authorization"></a>
#### 인증을 위한 리디렉션

클라이언트가 생성된 후, 개발자는 클라이언트 ID와 시크릿을 이용해 인증 코드 및 액세스 토큰을 요청할 수 있습니다. 우선, 클라이언트 애플리케이션은 여러분의 애플리케이션 `/oauth/authorize` 라우트로 리디렉트 요청을 보내야 합니다:

```
use Illuminate\Http\Request;
use Illuminate\Support\Str;

Route::get('/redirect', function (Request $request) {
    $request->session()->put('state', $state = Str::random(40));

    $query = http_build_query([
        'client_id' => 'client-id',
        'redirect_uri' => 'http://third-party-app.com/callback',
        'response_type' => 'code',
        'scope' => '',
        'state' => $state,
        // 'prompt' => '', // "none", "consent", 또는 "login"
    ]);

    return redirect('http://passport-app.test/oauth/authorize?'.$query);
});
```

`prompt` 파라미터를 사용하면 Passport 애플리케이션의 인증 동작 방식을 지정할 수 있습니다.

- `prompt` 값이 `none`이면, 사용자가 Passport 애플리케이션에 이미 로그인하지 않은 경우 항상 인증 오류가 발생합니다.
- 값이 `consent`이면, 사용자가 이미 요청한 모든 스코프에 대해 인가를 완료했더라도 항상 승인 화면이 표시됩니다.
- `login`으로 지정하면, 이미 세션이 있더라도 항상 로그인 화면으로 이동하게 됩니다.

`prompt` 값이 없는 경우, 사용자는 아직 요청한 스코프에 대해 인가하지 않았을 때에만 승인 화면이 나타납니다.

> [!NOTE]  
> `/oauth/authorize` 라우트는 Passport에서 이미 정의되어 있으므로, 따로 라우트를 수동 등록할 필요가 없습니다.

<a name="approving-the-request"></a>
#### 요청 승인하기

인가 요청을 받으면, Passport는 `prompt` 파라미터의 값에 따라 자동으로 응답하고, 필요하다면 승인/거부하는 화면을 사용자에게 표시합니다. 사용자가 승인을 선택하면, 설정된 `redirect_uri`(클라이언트 생성 시 지정한 URL)로 리디렉션됩니다.

인가 승인 화면을 커스터마이징하고 싶은 경우, `vendor:publish` 아티즌 명령어로 Passport의 뷰 파일을 게시할 수 있습니다. 해당 뷰들은 `resources/views/vendor/passport` 폴더에 저장됩니다:

```shell
php artisan vendor:publish --tag=passport-views
```

승인 화면을 생략하고 싶을 때(예: 1st-party 클라이언트를 인가할 때)는 [Client 모델 확장](#overriding-default-models) 후 `skipsAuthorization` 메서드를 정의하면 됩니다. `skipsAuthorization`이 `true`를 반환하면 사용자는 승인 화면을 건너뛰고 즉시 `redirect_uri`로 이동합니다(단, 소비자 애플리케이션이 리디렉션 시 별도로 `prompt` 파라미터를 준 경우에는 예외입니다):

```
<?php

namespace App\Models\Passport;

use Laravel\Passport\Client as BaseClient;

class Client extends BaseClient
{
    /**
     * 이 클라이언트에 대해 승인 프롬프트를 건너뛸지 여부
     */
    public function skipsAuthorization(): bool
    {
        return $this->firstParty();
    }
}
```

<a name="requesting-tokens-converting-authorization-codes-to-access-tokens"></a>
#### 인증 코드를 액세스 토큰으로 변환하기

사용자가 인가 요청을 승인하면, 사용자는 소비자 애플리케이션으로 리디렉션됩니다. 소비자 측에서는 우선 리디렉션 전에 저장했던 `state` 값과 반환받은 파라미터의 값을 비교하여 검증해야 합니다. 값이 일치하면, 이제 POST 방식으로 액세스 토큰을 요청할 수 있습니다. 요청 내역에는 사용자가 승인한 인증 코드가 포함되어야 합니다:

```
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

Route::get('/callback', function (Request $request) {
    $state = $request->session()->pull('state');

    throw_unless(
        strlen($state) > 0 && $state === $request->state,
        InvalidArgumentException::class,
        'Invalid state value.'
    );

    $response = Http::asForm()->post('http://passport-app.test/oauth/token', [
        'grant_type' => 'authorization_code',
        'client_id' => 'client-id',
        'client_secret' => 'client-secret',
        'redirect_uri' => 'http://third-party-app.com/callback',
        'code' => $request->code,
    ]);

    return $response->json();
});
```

이 `/oauth/token` 엔드포인트는 `access_token`, `refresh_token`, `expires_in` 속성이 포함된 JSON 응답을 반환합니다. `expires_in` 값은 액세스 토큰이 만료되기까지의 초(second) 단위 시간입니다.

> [!NOTE]  
> `/oauth/authorize`와 마찬가지로 `/oauth/token` 라우트도 Passport에서 이미 자동으로 생성되므로, 직접 등록할 필요가 없습니다.

<a name="tokens-json-api"></a>
#### JSON API

Passport에는 인가된 액세스 토큰을 관리하는 JSON API도 포함되어 있습니다. 이를 여러분만의 프론트엔드와 결합해 사용자 대시보드를 제공할 수 있습니다. HTTP 요청 예시는 [Axios](https://github.com/axios/axios)를 사용했습니다. JSON API 역시 `web` 및 `auth` 미들웨어로 보호되어 있으므로 애플리케이션 내부에서만 사용할 수 있습니다.

<a name="get-oauthtokens"></a>
#### `GET /oauth/tokens`

이 라우트는 인증된 사용자가 생성한 모든 인가된 액세스 토큰의 목록을 반환합니다. 주로 사용자에게 자신의 토큰을 나열하고, 원하면 토큰을 폐기하도록 할 때 사용합니다:

```js
axios.get('/oauth/tokens')
    .then(response => {
        console.log(response.data);
    });
```

<a name="delete-oauthtokenstoken-id"></a>
#### `DELETE /oauth/tokens/{token-id}`

이 라우트는 인가된 액세스 토큰과 해당 토큰의 리프레시 토큰을 폐기하는 데 사용합니다:

```js
axios.delete('/oauth/tokens/' + tokenId);
```

<a name="refreshing-tokens"></a>
### 토큰 갱신하기

애플리케이션이 단기간만 유효한 액세스 토큰을 발급하는 경우, 사용자는 액세스 토큰이 만료될 때마다 함께 발급받은 리프레시 토큰을 이용해 새 액세스 토큰을 요청할 수 있습니다:

```
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('http://passport-app.test/oauth/token', [
    'grant_type' => 'refresh_token',
    'refresh_token' => 'the-refresh-token',
    'client_id' => 'client-id',
    'client_secret' => 'client-secret',
    'scope' => '',
]);

return $response->json();
```

이 `/oauth/token` 엔드포인트는 `access_token`, `refresh_token`, `expires_in` 값을 담은 JSON 응답을 반환합니다. `expires_in`은 새로 발급된 액세스 토큰의 만료까지 남은 초 단위 시간입니다.

<a name="revoking-tokens"></a>
### 토큰 폐기하기

토큰을 폐기하려면, `Laravel\Passport\TokenRepository`의 `revokeAccessToken` 메서드를 사용하면 됩니다. 리프레시 토큰만 폐기하려면 `Laravel\Passport\RefreshTokenRepository`의 `revokeRefreshTokensByAccessTokenId` 메서드를 사용할 수 있습니다. 이 클래스들은 라라벨의 [서비스 컨테이너](/docs/11.x/container)를 통해 resolve할 수 있습니다:

```
use Laravel\Passport\TokenRepository;
use Laravel\Passport\RefreshTokenRepository;

$tokenRepository = app(TokenRepository::class);
$refreshTokenRepository = app(RefreshTokenRepository::class);

// 액세스 토큰 폐기
$tokenRepository->revokeAccessToken($tokenId);

// 해당 토큰의 모든 리프레시 토큰 폐기
$refreshTokenRepository->revokeRefreshTokensByAccessTokenId($tokenId);
```

<a name="purging-tokens"></a>
### 토큰 정리하기

토큰이 폐기되거나 만료된 후에는 데이터베이스에서 완전히 삭제(정리)할 수도 있습니다. Passport에는 이를 위한 `passport:purge` 아티즌 명령어가 포함되어 있습니다:

```shell
# 폐기되거나 만료된 토큰, 인증 코드 모두 삭제
php artisan passport:purge

# 6시간 이상 만료된 토큰만 삭제
php artisan passport:purge --hours=6

# 폐기된 토큰, 인증 코드만 삭제
php artisan passport:purge --revoked

# 만료된 토큰, 인증 코드만 삭제
php artisan passport:purge --expired
```

또한, 애플리케이션의 `routes/console.php` 파일에서 [스케줄러 작업](/docs/11.x/scheduling)을 설정하여 정기적으로 토큰 정리를 자동화할 수 있습니다:

```
use Illuminate\Support\Facades\Schedule;

Schedule::command('passport:purge')->hourly();
```

<a name="code-grant-pkce"></a>
## PKCE가 적용된 인증 코드 그랜트

"Proof Key for Code Exchange(PKCE)"가 적용된 인증 코드 그랜트 방식은, 단일 페이지 애플리케이션(SPA)이나 네이티브 애플리케이션에서 안전하게 API를 인증할 수 있는 방법입니다. 클라이언트 시크릿을 안전하게 관리하기 어렵거나, 인증 코드가 공격자에게 탈취되는 것을 방지할 필요가 있을 때 추천합니다. 이 방식에서는 "코드 검증자(code verifier)"와 "코드 챌린지(code challenge)"의 조합이 클라이언트 시크릿을 대신하여 인증 코드와 액세스 토큰을 교환할 때 사용됩니다.

<a name="creating-a-auth-pkce-grant-client"></a>

### 클라이언트 생성

애플리케이션에서 PKCE를 사용하는 인가 코드 그랜트를 통해 토큰을 발급하려면, PKCE를 지원하는 클라이언트를 먼저 생성해야 합니다. Artisan의 `passport:client` 명령어에 `--public` 옵션을 사용하여 클라이언트를 생성할 수 있습니다.

```shell
php artisan passport:client --public
```

<a name="requesting-auth-pkce-grant-tokens"></a>
### 토큰 요청하기

<a name="code-verifier-code-challenge"></a>
#### 코드 검증기(code verifier)와 코드 챌린지(code challenge)

이 인가 방식은 클라이언트 시크릿을 제공하지 않으므로, 토큰을 요청하려면 개발자가 코드 검증기와 코드 챌린지를 생성해야 합니다.

코드 검증기는 [RFC 7636 스펙](https://tools.ietf.org/html/rfc7636)에서 정의한 대로, 영문자, 숫자, 그리고  `"-"`, `"."`, `"_"`, `"~"` 문자를 포함해 43~128자 사이의 임의의 문자열이어야 합니다.

코드 챌린지는 URL과 파일명에 안전한 문자들로 이루어진 Base64 인코딩 문자열이어야 합니다. 끝에 붙는 `'='` 문자들은 제거되어야 하며, 줄바꿈, 공백, 기타 추가 문자는 들어가면 안 됩니다.

```
$encoded = base64_encode(hash('sha256', $code_verifier, true));

$codeChallenge = strtr(rtrim($encoded, '='), '+/', '-_');
```

<a name="code-grant-pkce-redirecting-for-authorization"></a>
#### 인가 리다이렉트 처리

클라이언트가 생성된 후에는, 클라이언트 ID와 미리 생성한 코드 검증기, 코드 챌린지를 사용하여 애플리케이션에서 인가 코드와 엑세스 토큰을 요청할 수 있습니다. 우선, 외부 애플리케이션에서 애플리케이션의 `/oauth/authorize` 경로로 리다이렉트 요청을 해야 합니다.

```
use Illuminate\Http\Request;
use Illuminate\Support\Str;

Route::get('/redirect', function (Request $request) {
    $request->session()->put('state', $state = Str::random(40));

    $request->session()->put(
        'code_verifier', $code_verifier = Str::random(128)
    );

    $codeChallenge = strtr(rtrim(
        base64_encode(hash('sha256', $code_verifier, true))
    , '='), '+/', '-_');

    $query = http_build_query([
        'client_id' => 'client-id',
        'redirect_uri' => 'http://third-party-app.com/callback',
        'response_type' => 'code',
        'scope' => '',
        'state' => $state,
        'code_challenge' => $codeChallenge,
        'code_challenge_method' => 'S256',
        // 'prompt' => '', // "none", "consent", or "login"
    ]);

    return redirect('http://passport-app.test/oauth/authorize?'.$query);
});
```

<a name="code-grant-pkce-converting-authorization-codes-to-access-tokens"></a>
#### 인가 코드를 엑세스 토큰으로 교환

사용자가 인가 요청을 승인하면, 외부 애플리케이션으로 다시 리다이렉트됩니다. 소비자는 `state` 파라미터가 리다이렉트 이전에 저장했던 값과 일치하는지 반드시 확인해야 합니다. (일반적인 인가 코드 그랜트와 동일)

`state` 값이 일치하면, 소비자 애플리케이션은 엑세스 토큰을 요청하기 위해 애플리케이션에 `POST` 요청을 보내야 합니다. 이 요청에는 사용자가 인가 요청을 승인할 때 발급된 인가 코드와, 최초에 생성했던 코드 검증기가 포함되어야 합니다.

```
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

Route::get('/callback', function (Request $request) {
    $state = $request->session()->pull('state');

    $codeVerifier = $request->session()->pull('code_verifier');

    throw_unless(
        strlen($state) > 0 && $state === $request->state,
        InvalidArgumentException::class
    );

    $response = Http::asForm()->post('http://passport-app.test/oauth/token', [
        'grant_type' => 'authorization_code',
        'client_id' => 'client-id',
        'redirect_uri' => 'http://third-party-app.com/callback',
        'code_verifier' => $codeVerifier,
        'code' => $request->code,
    ]);

    return $response->json();
});
```

<a name="password-grant-tokens"></a>
## 패스워드 그랜트 토큰

> [!WARNING]  
> 패스워드 그랜트 토큰은 더 이상 권장하지 않습니다. 대신, [OAuth2 서버에서 현재 권장하는 그랜트 타입](https://oauth2.thephpleague.com/authorization-server/which-grant/)을 사용하시기 바랍니다.

OAuth2 패스워드 그랜트는 모바일 애플리케이션 등과 같은 다른 1st-party(자사) 클라이언트가 이메일/아이디와 비밀번호로 액세스 토큰을 얻을 수 있도록 해줍니다. 이를 통해 사용자가 전체 OAuth2 인가 코드 리다이렉트 플로우를 거치지 않고도, 1st-party 클라이언트에 안전하게 액세스 토큰을 발급할 수 있습니다.

패스워드 그랜트를 활성화하려면, 애플리케이션의 `App\Providers\AppServiceProvider` 클래스 내의 `boot` 메서드에서 `enablePasswordGrant` 메서드를 호출하세요.

```
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

패스워드 그랜트를 통해 토큰을 발급하려면, 먼저 패스워드 그랜트 클라이언트를 생성해야 합니다. Artisan에서 `passport:client` 명령어와 `--password` 옵션을 사용하여 생성할 수 있습니다. **이미 `passport:install` 명령어를 실행했다면, 이 명령어를 다시 실행할 필요는 없습니다.**

```shell
php artisan passport:client --password
```

<a name="requesting-password-grant-tokens"></a>
### 토큰 요청하기

패스워드 그랜트 클라이언트를 생성한 후에는, 사용자의 이메일/아이디와 비밀번호를 포함하여 `/oauth/token` 경로로 `POST` 요청을 보내 엑세스 토큰을 요청할 수 있습니다. 이 경로는 Passport가 이미 등록해두었으므로 별도의 라우트 정의는 필요하지 않습니다. 요청이 성공하면, 서버의 JSON 응답에서 `access_token`과 `refresh_token`을 받게 됩니다.

```
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('http://passport-app.test/oauth/token', [
    'grant_type' => 'password',
    'client_id' => 'client-id',
    'client_secret' => 'client-secret',
    'username' => 'taylor@laravel.com',
    'password' => 'my-password',
    'scope' => '',
]);

return $response->json();
```

> [!NOTE]  
> 엑세스 토큰은 기본적으로 유효 기간이 깁니다. 필요하다면 [엑세스 토큰의 최대 유효 기간을 설정](#configuration)할 수 있습니다.

<a name="requesting-all-scopes"></a>
### 모든 스코프 요청하기

패스워드 그랜트나 클라이언트 크리덴셜 그랜트를 사용할 때, 애플리케이션이 지원하는 모든 스코프에 대해 토큰을 발급받고 싶을 수 있습니다. 이때는 `*` 스코프를 요청하면 됩니다. `*` 스코프를 가진 토큰에서는 token 인스턴스의 `can` 메서드가 항상 `true`를 반환합니다. 이 스코프는 `password` 또는 `client_credentials` 그랜트를 사용하여 발급된 토큰에만 할당할 수 있습니다.

```
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('http://passport-app.test/oauth/token', [
    'grant_type' => 'password',
    'client_id' => 'client-id',
    'client_secret' => 'client-secret',
    'username' => 'taylor@laravel.com',
    'password' => 'my-password',
    'scope' => '*',
]);
```

<a name="customizing-the-user-provider"></a>
### 사용자 공급자(User Provider) 커스터마이징

애플리케이션이 두 개 이상의 [인증 사용자 공급자](/docs/11.x/authentication#introduction)를 사용하는 경우, `artisan passport:client --password` 명령어를 실행할 때 `--provider` 옵션을 통해 어떤 사용자 공급자를 패스워드 그랜트 클라이언트가 사용할지 지정할 수 있습니다. 지정한 공급자 이름은 애플리케이션의 `config/auth.php` 설정 파일에 정의된 공급자와 일치해야 합니다. 그리고 이후에 [미들웨어로 라우트를 보호](#via-middleware)하여 가드의 해당 공급자에 속한 사용자만 인가할 수 있도록 할 수 있습니다.

<a name="customizing-the-username-field"></a>
### 사용자명(Username) 필드 커스터마이징

패스워드 그랜트로 인증할 때 Passport는 인증 가능한 모델의 `email` 속성을 기본 사용자명으로 사용합니다. 하지만 모델에 `findForPassport` 메서드를 정의하여 이 동작을 원하는 대로 변경할 수 있습니다.

```
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
### 비밀번호 검증 커스터마이징

패스워드 그랜트로 인증할 때 Passport는 모델의 `password` 속성을 사용하여 비밀번호를 검증합니다. 만약 모델에 `password` 속성이 없거나 비밀번호 검증 방식을 커스터마이즈하고 싶다면, 모델에 `validateForPassportPasswordGrant` 메서드를 정의할 수 있습니다.

```
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

<a name="implicit-grant-tokens"></a>
## 임플리싯 그랜트 토큰(Implicit Grant Tokens)

> [!WARNING]  
> 임플리싯 그랜트 토큰 사용은 더 이상 권장되지 않습니다. 대신 [OAuth2 서버에서 현재 권장하는 그랜트 타입](https://oauth2.thephpleague.com/authorization-server/which-grant/)을 사용하세요.

임플리싯 그랜트는 인가 코드 그랜트와 비슷하지만, 인가 코드를 교환하지 않고 바로 클라이언트에게 토큰이 반환됩니다. 이 방식은 클라이언트 시크릿을 안전하게 저장할 수 없는 JavaScript 또는 모바일 애플리케이션에서 주로 사용됩니다. 이 그랜트를 사용하려면, 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `enableImplicitGrant` 메서드를 호출하세요.

```
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::enableImplicitGrant();
}
```

그랜트가 활성화되면 개발자는 클라이언트 ID를 사용하여 애플리케이션에서 액세스 토큰을 요청할 수 있습니다. 외부 애플리케이션은 `/oauth/authorize` 경로로 다음과 같이 리다이렉트 요청을 보내야 합니다.

```
use Illuminate\Http\Request;

Route::get('/redirect', function (Request $request) {
    $request->session()->put('state', $state = Str::random(40));

    $query = http_build_query([
        'client_id' => 'client-id',
        'redirect_uri' => 'http://third-party-app.com/callback',
        'response_type' => 'token',
        'scope' => '',
        'state' => $state,
        // 'prompt' => '', // "none", "consent", or "login"
    ]);

    return redirect('http://passport-app.test/oauth/authorize?'.$query);
});
```

> [!NOTE]  
> `/oauth/authorize` 경로는 이미 Passport에 의해 정의되어 있습니다. 따로 라우트를 직접 정의할 필요는 없습니다.

<a name="client-credentials-grant-tokens"></a>
## 클라이언트 크리덴셜 그랜트 토큰

클라이언트 크리덴셜 그랜트는 머신-투-머신 인증에 적합합니다. 예를 들어, 스케줄러로 등록된 작업 등에서 API를 통해 유지보수 작업을 수행할 때 이 그랜트를 활용할 수 있습니다.

클라이언트 크리덴셜 그랜트를 통해 토큰을 발급하려면, 먼저 클라이언트 크리덴셜 그랜트 클라이언트를 생성해야 합니다. `passport:client` Artisan 명령어의 `--client` 옵션을 사용하세요.

```shell
php artisan passport:client --client
```

다음으로, 이 그랜트 타입을 사용하려면 `CheckClientCredentials` 미들웨어의 별칭을 애플리케이션에 등록해야 합니다. 별칭은 `bootstrap/app.php` 파일에서 정의할 수 있습니다.

```
use Laravel\Passport\Http\Middleware\CheckClientCredentials;

->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'client' => CheckClientCredentials::class
    ]);
})
```

그런 다음, 해당 미들웨어를 라우트에 적용하세요.

```
Route::get('/orders', function (Request $request) {
    ...
})->middleware('client');
```

라우트 접근 시 특정 스코프만 허용하려면, `client` 미들웨어를 라우트에 적용할 때 쉼표로 구분된 스코프 목록을 전달할 수 있습니다.

```
Route::get('/orders', function (Request $request) {
    ...
})->middleware('client:check-status,your-scope');
```

<a name="retrieving-tokens"></a>
### 토큰 조회하기

이 그랜트 타입을 이용해 토큰을 조회하려면 `oauth/token` 엔드포인트로 요청을 보내면 됩니다.

```
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('http://passport-app.test/oauth/token', [
    'grant_type' => 'client_credentials',
    'client_id' => 'client-id',
    'client_secret' => 'client-secret',
    'scope' => 'your-scope',
]);

return $response->json()['access_token'];
```

<a name="personal-access-tokens"></a>
## 개인 액세스 토큰(Personal Access Tokens)

때로는 사용자가 전형적인 인가 코드 리다이렉트 과정을 거치지 않고, 직접 자신의 액세스 토큰을 발급받고 싶어할 수 있습니다. 애플리케이션의 UI를 통해 사용자가 직접 토큰을 발급받을 수 있도록 하는 것은 API 사용 테스트나, 보다 단순한 토큰 발급 방식으로도 유용할 수 있습니다.

> [!NOTE]  
> 애플리케이션에서 주로 개인 액세스 토큰 발급을 위해 Passport를 사용한다면, [Laravel Sanctum](/docs/11.x/sanctum)도 함께 고려해보세요. Sanctum은 첫파티에서 제공되는 API 액세스 토큰 발급용 경량 라이브러리입니다.

<a name="creating-a-personal-access-client"></a>
### 개인 액세스 클라이언트 생성

개인 액세스 토큰을 발급하려면, 먼저 개인 액세스 클라이언트를 생성해야 합니다. Artisan의 `passport:client` 명령어에 `--personal` 옵션을 사용하여 생성하세요. 이미 `passport:install` 명령어를 실행한 적이 있다면, 이 명령어는 다시 실행하지 않아도 됩니다.

```shell
php artisan passport:client --personal
```

개인 액세스 클라이언트를 생성한 후, 클라이언트 ID 와 평문 시크릿 값을 애플리케이션의 `.env` 파일에 추가하세요.

```ini
PASSPORT_PERSONAL_ACCESS_CLIENT_ID="client-id-value"
PASSPORT_PERSONAL_ACCESS_CLIENT_SECRET="unhashed-client-secret-value"
```

<a name="managing-personal-access-tokens"></a>
### 개인 액세스 토큰 관리

개인 액세스 클라이언트를 생성한 후에는, `App\Models\User` 모델 인스턴스의 `createToken` 메서드를 이용해 원하는 사용자에 대해 토큰을 발급할 수 있습니다. `createToken` 메서드는 토큰 이름(필수)과 스코프 배열(선택)을 인수로 받습니다.

```
use App\Models\User;

$user = User::find(1);

// 스코프 없이 토큰 생성
$token = $user->createToken('Token Name')->accessToken;

// 스코프 지정 토큰 생성
$token = $user->createToken('My Token', ['place-orders'])->accessToken;
```

<a name="personal-access-tokens-json-api"></a>
#### JSON API

Passport에는 개인 액세스 토큰을 관리할 수 있는 JSON API도 포함되어 있습니다. 이를 직접 프론트엔드와 연동하여, 사용자들에게 개인 액세스 토큰 대시보드를 제공할 수 있습니다. 아래에는 개인 액세스 토큰을 관리할 수 있는 API 엔드포인트들을 모두 안내합니다. 편의를 위해 [Axios](https://github.com/axios/axios)를 사용한 HTTP 요청 예시를 제공합니다.

이 JSON API는 `web` 및 `auth` 미들웨어로 보호되므로, 반드시 자체 애플리케이션 내부에서만 호출할 수 있습니다. 외부에서는 호출할 수 없습니다.

<a name="get-oauthscopes"></a>
#### `GET /oauth/scopes`

이 라우트는 애플리케이션에 정의된 모든 [스코프](#token-scopes)를 반환합니다. 사용자가 개인 액세스 토큰에 할당할 수 있는 스코프를 보여주고자 할 때 활용할 수 있습니다.

```js
axios.get('/oauth/scopes')
    .then(response => {
        console.log(response.data);
    });
```

<a name="get-oauthpersonal-access-tokens"></a>
#### `GET /oauth/personal-access-tokens`

이 라우트는 인증된 사용자가 생성한 모든 개인 액세스 토큰을 반환합니다. 사용자의 토큰 목록을 보여주고, 편집하거나 폐기하도록 할 때 유용합니다.

```js
axios.get('/oauth/personal-access-tokens')
    .then(response => {
        console.log(response.data);
    });
```

<a name="post-oauthpersonal-access-tokens"></a>
#### `POST /oauth/personal-access-tokens`

이 라우트는 새로운 개인 액세스 토큰을 만듭니다. 토큰의 `name`과 할당할 `scopes` 두 가지 정보를 반드시 제공해야 합니다.

```js
const data = {
    name: 'Token Name',
    scopes: []
};

axios.post('/oauth/personal-access-tokens', data)
    .then(response => {
        console.log(response.data.accessToken);
    })
    .catch (response => {
        // 응답상의 오류를 나열
    });
```

<a name="delete-oauthpersonal-access-tokenstoken-id"></a>
#### `DELETE /oauth/personal-access-tokens/{token-id}`

이 라우트는 개인 액세스 토큰을 폐기(revoke)할 때 사용할 수 있습니다.

```js
axios.delete('/oauth/personal-access-tokens/' + tokenId);
```

<a name="protecting-routes"></a>
## 라우트 보호하기

<a name="via-middleware"></a>
### 미들웨어로 보호하기

Passport는 들어오는 요청의 액세스 토큰을 검증하는 [인증 가드](/docs/11.x/authentication#adding-custom-guards)를 제공합니다. `api` 가드를 `passport` 드라이버로 설정한 후, 유효한 액세스 토큰이 반드시 필요한 라우트에 `auth:api` 미들웨어만 지정하면 됩니다.

```
Route::get('/user', function () {
    // ...
})->middleware('auth:api');
```

> [!WARNING]  
> [클라이언트 크리덴셜 그랜트](#client-credentials-grant-tokens)를 사용하는 경우, 해당 라우트 보호에는 `auth:api` 미들웨어 대신 [클라이언트 미들웨어(`client`)](#client-credentials-grant-tokens)를 사용해야 합니다.

<a name="multiple-authentication-guards"></a>
#### 다중 인증 가드 활용

애플리케이션에서 서로 다른 Eloquent 모델을 사용하는 여러 유형의 사용자 인증이 필요한 경우, 각 사용자 공급자 타입별로 별도의 가드 설정을 추가해야 합니다. 이를 통해 특정 사용자 공급자 전용 요청을 별도로 보호할 수 있습니다. 예를 들어, `config/auth.php` 설정 파일에 다음과 같이 가드를 설정할 수 있습니다.

```
'api' => [
    'driver' => 'passport',
    'provider' => 'users',
],

'api-customers' => [
    'driver' => 'passport',
    'provider' => 'customers',
],
```

아래와 같은 라우트에서는 `api-customers` 가드(즉, `customers` 사용자 공급자)를 사용하여 들어오는 요청을 인증하게 됩니다.

```
Route::get('/customer', function () {
    // ...
})->middleware('auth:api-customers');
```

> [!NOTE]  
> 패스워드 그랜트에서 다중 사용자 공급자와 Passport 사용하는 방법은 [password grant 문서](#customizing-the-user-provider)를 참고하세요.

<a name="passing-the-access-token"></a>
### 액세스 토큰 전달 방법

Passport로 보호된 라우트 호출 시, API 소비자(클라이언트)는 `Authorization` 헤더에 `Bearer` 토큰 형태로 자신의 액세스 토큰을 지정해야 합니다. 예를 들어, Guzzle HTTP 라이브러리 사용 예시는 다음과 같습니다.

```
use Illuminate\Support\Facades\Http;

$response = Http::withHeaders([
    'Accept' => 'application/json',
    'Authorization' => 'Bearer '.$accessToken,
])->get('https://passport-app.test/api/user');

return $response->json();
```

<a name="token-scopes"></a>
## 토큰 스코프(Scopes)

스코프를 활용하면, API 클라이언트가 계정 접근 권한을 요청할 때 특정 권한 집합만 요구할 수 있습니다. 예를 들어, 이커머스 애플리케이션에서는 모든 API 소비자가 주문 생성 권한을 가질 필요가 없습니다. 대신, 주문 배송 상태만 조회하는 권한만 요청할 수 있도록 허용할 수 있습니다. 즉, 스코프는 서드파티 애플리케이션이 사용자를 대신해서 할 수 있는 작업을 제한할 수 있게 합니다.

<a name="defining-scopes"></a>
### 스코프 정의하기

애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `Passport::tokensCan` 메서드를 사용해 API의 사용 가능한 스코프를 정의할 수 있습니다. `tokensCan` 메서드는 스코프 이름과 스코프 설명의 배열을 인수로 받습니다. 스코프 설명은 자유롭게 지정할 수 있으며, 인가 화면에서 사용자에게 표시됩니다.

```
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::tokensCan([
        'place-orders' => 'Place orders',
        'check-status' => 'Check order status',
    ]);
}
```

<a name="default-scope"></a>
### 기본 스코프

클라이언트가 별도로 요청한 스코프가 없다면, `setDefaultScope` 메서드로 Passport 서버가 기본적으로 토큰에 스코프를 할당하도록 설정할 수 있습니다. 보통은 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드 내에서 이 메서드를 호출합니다.

```
use Laravel\Passport\Passport;

Passport::tokensCan([
    'place-orders' => 'Place orders',
    'check-status' => 'Check order status',
]);

Passport::setDefaultScope([
    'check-status',
    'place-orders',
]);
```

> [!NOTE]  
> Passport의 기본 스코프는 사용자가 직접 생성하는 개인 액세스 토큰에는 적용되지 않습니다.

<a name="assigning-scopes-to-tokens"></a>
### 토큰에 스코프 할당하기

<a name="when-requesting-authorization-codes"></a>
#### 인가 코드 요청 시

인가 코드 그랜트로 액세스 토큰을 요청할 때, 소비자는 `scope` 쿼리스트링 파라미터로 원하는 스코프를 지정할 수 있습니다. `scope` 파라미터 값에는 스코프들을 공백으로 구분하여 나열합니다.

```
Route::get('/redirect', function () {
    $query = http_build_query([
        'client_id' => 'client-id',
        'redirect_uri' => 'http://example.com/callback',
        'response_type' => 'code',
        'scope' => 'place-orders check-status',
    ]);

    return redirect('http://passport-app.test/oauth/authorize?'.$query);
});
```

<a name="when-issuing-personal-access-tokens"></a>
#### 개인 액세스 토큰 발급 시

`App\Models\User` 모델의 `createToken` 메서드를 이용해 개인 액세스 토큰을 발급할 때는, 두 번째 인수로 원하는 스코프 배열을 전달할 수 있습니다.

```
$token = $user->createToken('My Token', ['place-orders'])->accessToken;
```

<a name="checking-scopes"></a>

### 스코프(범위) 확인하기

Passport에는, 요청이 특정 스코프가 부여된 토큰을 사용하여 인증되었는지 확인할 수 있는 두 가지 미들웨어가 포함되어 있습니다. 먼저, 아래와 같이 애플리케이션의 `bootstrap/app.php` 파일에 미들웨어 별칭을 정의합니다.

```
use Laravel\Passport\Http\Middleware\CheckForAnyScope;
use Laravel\Passport\Http\Middleware\CheckScopes;

->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'scopes' => CheckScopes::class,
        'scope' => CheckForAnyScope::class,
    ]);
})
```

<a name="check-for-all-scopes"></a>
#### 모든 스코프 확인하기

`scopes` 미들웨어를 라우트에 할당하면, 들어오는 요청의 액세스 토큰이 목록에 있는 모든 스코프를 가지고 있는지 확인합니다.

```
Route::get('/orders', function () {
    // 액세스 토큰에 "check-status"와 "place-orders" 스코프 둘 다 있어야 합니다...
})->middleware(['auth:api', 'scopes:check-status,place-orders']);
```

<a name="check-for-any-scopes"></a>
#### 하나라도 스코프가 있는지 확인하기

`scope` 미들웨어를 라우트에 할당하면, 들어오는 요청의 액세스 토큰이 나열된 스코프 중 *적어도 하나*를 가지고 있는지 확인합니다.

```
Route::get('/orders', function () {
    // 액세스 토큰에 "check-status" 또는 "place-orders" 스코프 중 하나라도 있으면 통과...
})->middleware(['auth:api', 'scope:check-status,place-orders']);
```

<a name="checking-scopes-on-a-token-instance"></a>
#### 토큰 인스턴스에서 스코프 확인하기

액세스 토큰으로 인증된 요청이 애플리케이션에 들어온 후에도, 해당 토큰이 특정 스코프를 갖고 있는지 인증된 `App\Models\User` 인스턴스에서 `tokenCan` 메서드를 사용해 확인할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    if ($request->user()->tokenCan('place-orders')) {
        // ...
    }
});
```

<a name="additional-scope-methods"></a>
#### 추가 스코프 메서드

`scopeIds` 메서드는 정의된 모든 ID(혹은 이름)의 배열을 반환합니다.

```
use Laravel\Passport\Passport;

Passport::scopeIds();
```

`scopes` 메서드는 정의된 모든 스코프를 `Laravel\Passport\Scope` 인스턴스 배열로 반환합니다.

```
Passport::scopes();
```

`scopesFor` 메서드는 전달한 ID(혹은 이름)와 일치하는 `Laravel\Passport\Scope` 인스턴스 배열을 반환합니다.

```
Passport::scopesFor(['place-orders', 'check-status']);
```

`hasScope` 메서드를 사용하면, 특정 스코프가 정의되어 있는지 확인할 수 있습니다.

```
Passport::hasScope('place-orders');
```

<a name="consuming-your-api-with-javascript"></a>
## JavaScript에서 API 사용하기

API를 구축할 때, 자바스크립트 애플리케이션에서 직접 자신의 API를 소비(호출)할 수 있다는 점은 매우 유용합니다. 이 방식은 여러분의 웹 애플리케이션, 모바일 애플리케이션, 외부 서드파티 애플리케이션, 그리고 각종 패키지 매니저에 배포될 수 있는 SDK 등에서 동일한 API를 사용할 수 있게 해줍니다.

일반적으로 자바스크립트 애플리케이션에서 API를 사용하려면, 액세스 토큰을 직접 애플리케이션에 전송하고, 각 요청마다 이 토큰을 전달해야 합니다. 하지만 Passport는 이 작업을 자동화해 줄 수 있는 미들웨어를 제공합니다. `CreateFreshApiToken` 미들웨어를 애플리케이션의 `bootstrap/app.php` 파일에서 `web` 미들웨어 그룹에 추가하면 됩니다.

```
use Laravel\Passport\Http\Middleware\CreateFreshApiToken;

->withMiddleware(function (Middleware $middleware) {
    $middleware->web(append: [
        CreateFreshApiToken::class,
    ]);
})
```

> [!WARNING]  
> 반드시 `CreateFreshApiToken` 미들웨어가 미들웨어 스택의 마지막에 오도록 설정해야 합니다.

이 미들웨어는 응답에 `laravel_token` 쿠키를 추가합니다. 이 쿠키에는 Passport가 자바스크립트 애플리케이션의 API 요청을 인증하는 데 사용할 암호화된 JWT가 담겨 있습니다. 이 JWT의 만료 시간은 `session.lifetime` 설정값과 동일합니다. 브라우저에서 이 쿠키를 자동으로 모든 후속 요청에 전송하므로, 별도로 액세스 토큰을 명시적으로 전달하지 않아도 API를 호출할 수 있습니다.

```
axios.get('/api/user')
    .then(response => {
        console.log(response.data);
    });
```

<a name="customizing-the-cookie-name"></a>
#### 쿠키 이름 커스터마이즈하기

필요하다면, `Passport::cookie` 메서드를 사용하여 `laravel_token` 쿠키의 이름을 변경할 수 있습니다. 이 메서드는 일반적으로 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 호출하는 것이 좋습니다.

```
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

이 인증 방식을 사용할 때는, 요청에 유효한 CSRF 토큰 헤더가 반드시 포함되어야 합니다. 라라벨의 기본 자바스크립트 스캐폴딩에는 Axios 인스턴스가 포함되어 있는데, 이 인스턴스는 암호화된 `XSRF-TOKEN` 쿠키 값을 이용해 동일 출처 요청 시 자동으로 `X-XSRF-TOKEN` 헤더를 전송합니다.

> [!NOTE]  
> 만약 `X-XSRF-TOKEN` 대신 `X-CSRF-TOKEN` 헤더를 직접 전송하고자 한다면, `csrf_token()`이 제공하는 암호화되지 않은 토큰을 사용해야 합니다.

<a name="events"></a>
## 이벤트

Passport는 액세스 토큰 및 리프레시 토큰을 발급할 때 이벤트를 발생시킵니다. [이벤트를 수신(listen)](/docs/11.x/events)하여 데이터베이스의 다른 액세스 토큰을 정리하거나(삭제) 또는 취소(revoke)할 수 있습니다.

<div class="overflow-auto">

| 이벤트 이름 |
| --- |
| `Laravel\Passport\Events\AccessTokenCreated` |
| `Laravel\Passport\Events\RefreshTokenCreated` |

</div>

<a name="testing"></a>
## 테스트

Passport의 `actingAs` 메서드는 현재 인증된 사용자와, 그 사용자의 토큰에 부여할 스코프를 지정하는 데 사용할 수 있습니다. 첫 번째 인수는 사용자 인스턴스, 두 번째 인수는 사용자 토큰에 부여할 스코프들의 배열입니다.

```php tab=Pest
use App\Models\User;
use Laravel\Passport\Passport;

test('servers can be created', function () {
    Passport::actingAs(
        User::factory()->create(),
        ['create-servers']
    );

    $response = $this->post('/api/create-server');

    $response->assertStatus(201);
});
```

```php tab=PHPUnit
use App\Models\User;
use Laravel\Passport\Passport;

public function test_servers_can_be_created(): void
{
    Passport::actingAs(
        User::factory()->create(),
        ['create-servers']
    );

    $response = $this->post('/api/create-server');

    $response->assertStatus(201);
}
```

Passport의 `actingAsClient` 메서드는 현재 인증된 클라이언트와, 해당 클라이언트의 토큰에 부여할 스코프를 지정할 수 있습니다. 첫 번째 인수는 클라이언트 인스턴스, 두 번째 인수는 클라이언트 토큰에 부여할 스코프들의 배열입니다.

```php tab=Pest
use Laravel\Passport\Client;
use Laravel\Passport\Passport;

test('orders can be retrieved', function () {
    Passport::actingAsClient(
        Client::factory()->create(),
        ['check-status']
    );

    $response = $this->get('/api/orders');

    $response->assertStatus(200);
});
```

```php tab=PHPUnit
use Laravel\Passport\Client;
use Laravel\Passport\Passport;

public function test_orders_can_be_retrieved(): void
{
    Passport::actingAsClient(
        Client::factory()->create(),
        ['check-status']
    );

    $response = $this->get('/api/orders');

    $response->assertStatus(200);
}
```