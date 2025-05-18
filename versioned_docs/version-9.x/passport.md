# 라라벨 패스포트 (Laravel Passport)

- [소개](#introduction)
    - [Passport 또는 Sanctum?](#passport-or-sanctum)
- [설치](#installation)
    - [Passport 배포](#deploying-passport)
    - [마이그레이션 커스텀](#migration-customization)
    - [Passport 업그레이드](#upgrading-passport)
- [설정](#configuration)
    - [클라이언트 시크릿 해싱](#client-secret-hashing)
    - [토큰 유효 기간](#token-lifetimes)
    - [기본 모델 오버라이드](#overriding-default-models)
    - [라우트 오버라이드](#overriding-routes)
- [액세스 토큰 발급](#issuing-access-tokens)
    - [클라이언트 관리](#managing-clients)
    - [토큰 요청](#requesting-tokens)
    - [토큰 갱신](#refreshing-tokens)
    - [토큰 폐기](#revoking-tokens)
    - [토큰 정리](#purging-tokens)
- [PKCE가 적용된 인증 코드 그랜트](#code-grant-pkce)
    - [클라이언트 생성](#creating-a-auth-pkce-grant-client)
    - [토큰 요청](#requesting-auth-pkce-grant-tokens)
- [패스워드 그랜트 토큰](#password-grant-tokens)
    - [패스워드 그랜트 클라이언트 생성](#creating-a-password-grant-client)
    - [토큰 요청](#requesting-password-grant-tokens)
    - [모든 스코프 요청](#requesting-all-scopes)
    - [사용자 제공자 커스텀](#customizing-the-user-provider)
    - [사용자명 필드 커스텀](#customizing-the-username-field)
    - [비밀번호 검증 커스텀](#customizing-the-password-validation)
- [암시적 그랜트 토큰](#implicit-grant-tokens)
- [클라이언트 자격 증명 그랜트 토큰](#client-credentials-grant-tokens)
- [개인 액세스 토큰](#personal-access-tokens)
    - [개인 액세스 클라이언트 생성](#creating-a-personal-access-client)
    - [개인 액세스 토큰 관리](#managing-personal-access-tokens)
- [라우트 보호](#protecting-routes)
    - [미들웨어를 통한 보호](#via-middleware)
    - [액세스 토큰 전달](#passing-the-access-token)
- [토큰 스코프](#token-scopes)
    - [스코프 정의](#defining-scopes)
    - [기본 스코프](#default-scope)
    - [토큰에 스코프 할당](#assigning-scopes-to-tokens)
    - [스코프 확인](#checking-scopes)
- [JavaScript로 API 활용](#consuming-your-api-with-javascript)
- [이벤트](#events)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

[Laravel Passport](https://github.com/laravel/passport)는 라라벨 애플리케이션을 위한 완전한 OAuth2 서버 구현을 몇 분 만에 제공하는 패키지입니다. Passport는 Andy Millington과 Simon Hamp가 유지 관리하는 [League OAuth2 server](https://github.com/thephpleague/oauth2-server) 위에 구축되어 있습니다.

> [!WARNING]
> 이 문서는 여러분이 이미 OAuth2에 대해 어느 정도 알고 있다는 것을 전제로 하고 있습니다. 만약 OAuth2에 대해 전혀 모른다면, 계속 읽기 전에 [용어](https://oauth2.thephpleague.com/terminology/)와 OAuth2의 기본 개념을 먼저 익히시기 바랍니다.

<a name="passport-or-sanctum"></a>
### Passport 또는 Sanctum?

시작하기 전에, 여러분이 개발 중인 애플리케이션에 Laravel Passport와 [Laravel Sanctum](/docs/9.x/sanctum) 중 어떤 것이 더 적합한지 먼저 결정하는 것이 좋습니다. 여러분의 애플리케이션이 반드시 OAuth2를 지원해야 한다면 Laravel Passport를 선택해야 합니다.

반면, 싱글 페이지 애플리케이션(SPA), 모바일 애플리케이션, 또는 간단한 API 토큰 발급만이 필요하다면 [Laravel Sanctum](/docs/9.x/sanctum)을 사용하는 것이 좋습니다. Laravel Sanctum은 OAuth2를 지원하지 않지만, 훨씬 더 간단한 API 인증 개발 경험을 제공합니다.

<a name="installation"></a>
## 설치

시작하려면 Composer 패키지 관리자를 통해 Passport를 설치하세요:

```shell
composer require laravel/passport
```

Passport의 [서비스 프로바이더](/docs/9.x/providers)는 자체 데이터베이스 마이그레이션 디렉토리를 등록하므로, 패키지 설치 후 데이터베이스 마이그레이션을 수행해야 합니다. Passport 마이그레이션은 OAuth2 클라이언트와 액세스 토큰을 저장하기 위한 테이블을 생성합니다:

```shell
php artisan migrate
```

다음으로, `passport:install` 아티즌 명령어를 실행해야 합니다. 이 명령어는 안전한 액세스 토큰을 생성하는 데 필요한 암호화 키를 만들어 줍니다. 추가로, "personal access"와 "password grant" 클라이언트도 생성되어 액세스 토큰 발급에 사용됩니다:

```shell
php artisan passport:install
```

> [!NOTE]
> Passport의 `Client` 모델이 기본값인 자동 증가 정수 대신 UUID를 기본키로 사용하고 싶다면, [`uuids` 옵션](#client-uuids)을 참고하여 Passport를 설치하세요.

`passport:install` 명령어를 실행한 후에는, 여러분의 `App\Models\User` 모델에 `Laravel\Passport\HasApiTokens` 트레이트를 추가해야 합니다. 이 트레이트는 인증된 사용자의 토큰과 스코프를 확인할 수 있는 여러 유틸리티 메서드를 제공합니다. 만약 이미 `Laravel\Sanctum\HasApiTokens` 트레이트를 사용하고 있다면 해당 트레이트를 제거해도 됩니다:

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

마지막으로, 애플리케이션의 `config/auth.php` 설정 파일에서 `api` 인증 가드를 정의하고, `driver` 옵션 값을 `passport`로 설정하세요. 이렇게 하면, 입력되는 API 요청을 인증할 때 Passport의 `TokenGuard`를 사용하게 됩니다:

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

<a name="client-uuids"></a>
#### 클라이언트 UUID 사용

`passport:install` 명령어를 `--uuids` 옵션과 함께 실행하면, Passport의 `Client` 모델 기본키를 자동 증가 정수 대신 UUID로 사용할 수 있습니다. `--uuids` 옵션으로 `passport:install` 명령어를 실행하면 Passport의 기본 마이그레이션 비활성화에 대한 추가 안내가 표시됩니다:

```shell
php artisan passport:install --uuids
```

<a name="deploying-passport"></a>
### Passport 배포

Passport를 애플리케이션 서버에 처음 배포할 때, `passport:keys` 명령어를 실행해야 할 수 있습니다. 이 명령어는 Passport가 액세스 토큰을 생성하는 데 필요한 암호화 키를 생성합니다. 생성된 키는 일반적으로 소스 컨트롤에 저장하지 않습니다:

```shell
php artisan passport:keys
```

필요하다면, Passport의 키가 로딩될 경로를 지정할 수 있습니다. `Passport::loadKeysFrom` 메서드를 활용하면 됩니다. 일반적으로 이 메서드는 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 호출합니다:

```
/**
 * 인증 및 인가 서비스 등록
 *
 * @return void
 */
public function boot()
{
    $this->registerPolicies();

    Passport::loadKeysFrom(__DIR__.'/../secrets/oauth');
}
```

<a name="loading-keys-from-the-environment"></a>
#### 환경 변수에서 키 로드하기

또한, `vendor:publish` 아티즌 명령어를 사용하여 Passport의 설정 파일을 퍼블리시할 수 있습니다:

```shell
php artisan vendor:publish --tag=passport-config
```

설정 파일이 퍼블리시된 후에는 아래와 같이 애플리케이션의 암호화 키를 환경 변수에 정의함으로써 로드할 수 있습니다:

```ini
PASSPORT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
<private key here>
-----END RSA PRIVATE KEY-----"

PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
<public key here>
-----END PUBLIC KEY-----"
```

<a name="migration-customization"></a>
### 마이그레이션 커스텀

Passport의 기본 마이그레이션을 사용하지 않을 예정이라면, `App\Providers\AppServiceProvider` 클래스의 `register` 메서드에서 `Passport::ignoreMigrations`를 호출해야 합니다. 기본 마이그레이션을 퍼블리시하려면 아래 명령어를 사용하세요:

```shell
php artisan vendor:publish --tag=passport-migrations
```

<a name="upgrading-passport"></a>
### Passport 업그레이드

Passport의 메이저 버전을 업그레이드할 때에는 [업그레이드 가이드](https://github.com/laravel/passport/blob/master/UPGRADE.md)를 꼼꼼하게 검토하는 것이 매우 중요합니다.

<a name="configuration"></a>
## 설정

<a name="client-secret-hashing"></a>
### 클라이언트 시크릿 해싱

클라이언트 시크릿을 데이터베이스에 저장할 때 해싱 처리하고 싶다면, `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 `Passport::hashClientSecrets` 메서드를 호출하세요:

```
use Laravel\Passport\Passport;

Passport::hashClientSecrets();
```

이 기능을 활성화하면, 모든 클라이언트 시크릿은 생성 직후에만 사용자에게 표시됩니다. 평문 시크릿 값은 데이터베이스에 저장되지 않기 때문에, 유실 시 복구가 불가능합니다.

<a name="token-lifetimes"></a>
### 토큰 유효 기간

기본적으로 Passport는 1년 동안 유효한 장기 액세스 토큰을 발급합니다. 토큰의 수명을 더 길거나 짧게 변경하고 싶다면, `tokensExpireIn`, `refreshTokensExpireIn`, `personalAccessTokensExpireIn` 메서드를 사용할 수 있습니다. 이 메서드들은 일반적으로 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다:

```
/**
 * 인증 및 인가 서비스 등록
 *
 * @return void
 */
public function boot()
{
    $this->registerPolicies();

    Passport::tokensExpireIn(now()->addDays(15));
    Passport::refreshTokensExpireIn(now()->addDays(30));
    Passport::personalAccessTokensExpireIn(now()->addMonths(6));
}
```

> [!WARNING]
> Passport의 데이터베이스 테이블에 있는 `expires_at` 컬럼은 읽기 전용으로, 단순히 표시 용도로만 사용됩니다. 토큰 발급 시 Passport는 만료 정보를 서명 및 암호화된 토큰 안에 저장합니다. 토큰을 무효로 만들어야 한다면 [폐기(revoke)](#revoking-tokens) 처리를 해야 합니다.

<a name="overriding-default-models"></a>
### 기본 모델 오버라이드

Passport에서 내부적으로 사용하는 모델을 직접 확장하여 정의할 수 있습니다. 별도의 모델을 만들고, Passport의 해당 모델을 상속받아 구현하면 됩니다:

```
use Laravel\Passport\Client as PassportClient;

class Client extends PassportClient
{
    // ...
}
```

모델을 정의한 후에는, `Laravel\Passport\Passport` 클래스를 통해 Passport에 커스텀 모델을 사용하라고 알려야 합니다. 일반적으로 이 작업은 애플리케이션의 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 이뤄집니다:

```
use App\Models\Passport\AuthCode;
use App\Models\Passport\Client;
use App\Models\Passport\PersonalAccessClient;
use App\Models\Passport\RefreshToken;
use App\Models\Passport\Token;

/**
 * 인증 및 인가 서비스 등록
 *
 * @return void
 */
public function boot()
{
    $this->registerPolicies();

    Passport::useTokenModel(Token::class);
    Passport::useRefreshTokenModel(RefreshToken::class);
    Passport::useAuthCodeModel(AuthCode::class);
    Passport::useClientModel(Client::class);
    Passport::usePersonalAccessClientModel(PersonalAccessClient::class);
}
```

<a name="overriding-routes"></a>
### 라우트 오버라이드

때때로 Passport에서 미리 정의한 라우트를 커스텀하고 싶을 수 있습니다. 이 경우 먼저 애플리케이션의 `AppServiceProvider`의 `register` 메서드에서 `Passport::ignoreRoutes`를 호출하여 Passport가 기본 라우트를 등록하지 않도록 해야 합니다:

```
use Laravel\Passport\Passport;

/**
 * 애플리케이션 서비스 등록
 *
 * @return void
 */
public function register()
{
    Passport::ignoreRoutes();
}
```

그런 다음, [Passport의 routes 파일](https://github.com/laravel/passport/blob/11.x/routes/web.php)에 정의된 라우트를 복사하여 애플리케이션의 `routes/web.php` 파일에 붙여넣고 원하는 대로 변경할 수 있습니다:

```
Route::group([
    'as' => 'passport.',
    'prefix' => config('passport.path', 'oauth'),
    'namespace' => 'Laravel\Passport\Http\Controllers',
], function () {
    // Passport 라우트...
});
```

<a name="issuing-access-tokens"></a>
## 액세스 토큰 발급

대부분의 개발자들은 OAuth2를 이용할 때 인가 코드(authorization code)를 사용하는 방식에 익숙합니다. 인가 코드를 사용할 경우, 클라이언트 애플리케이션이 사용자를 여러분의 서버로 리다이렉트하고, 사용자는 클라이언트에 대해 액세스 토큰 발급 요청을 승인 또는 거부하게 됩니다.

<a name="managing-clients"></a>
### 클라이언트 관리

여러분의 애플리케이션 API와 연동이 필요한 애플리케이션을 만드는 개발자들은 우선 자신의 애플리케이션을 "클라이언트"로 등록해야 합니다. 일반적으로는 애플리케이션 이름과, 인가 요청 승인 후 사용자를 리다이렉트 할 URL 정보를 제공하면 됩니다.

<a name="the-passportclient-command"></a>
#### `passport:client` 명령어

클라이언트를 가장 손쉽게 생성하는 방법은 `passport:client` 아티즌 명령어를 이용하는 것입니다. 이 명령어를 사용하면 여러분이 직접 OAuth2 테스트용 클라이언트를 만들 수 있습니다. `client` 명령어를 실행하면 Passport가 클라이언트에 대한 추가 정보를 입력받고, 클라이언트 ID와 시크릿을 발급해줍니다:

```shell
php artisan passport:client
```

**리다이렉트 URL**

클라이언트에 여러 리다이렉트 URL을 허용하고 싶다면, `passport:client` 명령어에서 URL을 입력할 때 쉼표(,)로 구분하여 여러 개를 지정할 수 있습니다. 만약 URL 자체에 쉼표가 포함되어 있다면 URL 인코딩을 사용해야 합니다:

```shell
http://example.com/callback,http://examplefoo.com/callback
```

<a name="clients-json-api"></a>
#### JSON API

여러분의 애플리케이션 사용자들은 직접 `client` 명령어를 사용할 수 없으므로, Passport에서는 클라이언트 생성을 위한 JSON API를 제공합니다. 이를 활용하면 클라이언트 생성, 수정, 삭제 처리용 컨트롤러를 따로 작성하지 않아도 됩니다.

단, 사용자에게 클라이언트 관리 대시보드를 제공하려면 Passport의 JSON API와 여러분만의 프론트엔드를 연동해야 합니다. 아래는 클라이언트 관리용 API 엔드포인트를 정리한 것으로, 예시로는 [Axios](https://github.com/axios/axios)를 활용해 HTTP 요청을 보내는 방식을 사용합니다.

JSON API는 `web`과 `auth` 미들웨어로 보호되고 있으므로, 여러분의 애플리케이션 내에서만 호출이 가능하며 외부에서 직접 호출할 수 없습니다.

<a name="get-oauthclients"></a>
#### `GET /oauth/clients`

이 라우트는 인증된 사용자의 모든 클라이언트 정보를 반환합니다. 주로 사용자의 클라이언트 목록을 표시하거나, 수정/삭제 기능을 제공할 때 활용할 수 있습니다:

```js
axios.get('/oauth/clients')
    .then(response => {
        console.log(response.data);
    });
```

<a name="post-oauthclients"></a>
#### `POST /oauth/clients`

이 라우트는 새로운 클라이언트를 생성하는 데 사용됩니다. 클라이언트의 `name`과 `redirect` URL 두 가지 정보가 필요합니다. 인가 요청을 승인 또는 거부한 뒤에 리다이렉트할 URL이 `redirect` 값입니다.

클라이언트가 생성되면 클라이언트 ID와 시크릿이 발급됩니다. 이 값들은 여러분의 애플리케이션으로부터 액세스 토큰을 발급받는 데 사용됩니다. 클라이언트 생성 라우트는 새 클라이언트 인스턴스를 반환합니다:

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
        // 응답의 에러 목록 출력 등...
    });
```

<a name="put-oauthclientsclient-id"></a>
#### `PUT /oauth/clients/{client-id}`

이 라우트는 클라이언트 정보를 업데이트하는 데 사용됩니다. 클라이언트의 `name`과 `redirect` URL 정보가 필요하며, 여기서도 사용자가 인가 후 리다이렉트될 URL이 `redirect`입니다. 라우트는 변경된 클라이언트 인스턴스를 반환합니다:

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
        // 응답의 에러 목록 출력 등...
    });
```

<a name="delete-oauthclientsclient-id"></a>
#### `DELETE /oauth/clients/{client-id}`

이 라우트는 클라이언트를 제거할 때 사용합니다:

```js
axios.delete('/oauth/clients/' + clientId)
    .then(response => {
        //
    });
```

<a name="requesting-tokens"></a>
### 토큰 요청

<a name="requesting-tokens-redirecting-for-authorization"></a>
#### 인가를 위한 리다이렉트

클라이언트가 생성되면, 개발자는 클라이언트 ID와 시크릿을 사용해 인가 코드와 액세스 토큰을 요청할 수 있습니다. 먼저, 사용하는 애플리케이션에서 여러분의 애플리케이션의 `/oauth/authorize` 라우트로 리다이렉트 요청을 보내야 합니다:

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

`prompt` 매개변수는 Passport 애플리케이션의 인증 행동을 지정할 때 사용할 수 있습니다.

`prompt` 값이 `none`이면, 사용자가 Passport 애플리케이션에 이미 인증되어 있지 않으면 Passport는 항상 인증 에러를 발생시킵니다. 값이 `consent`라면, 모든 스코프가 이전에 허용된 상태여도 반드시 인가 승인 화면을 보여줍니다. `login` 값이면, 사용자가 이미 세션이 있더라도 항상 다시 로그인하라는 프롬프트를 노출합니다.

`prompt` 값이 지정되지 않은 경우, 해당 스코프에 대해 이전에 인가가 이루어진 적이 없다면 사용자에게 인가 승인 요청 프롬프트가 표시됩니다.

> [!NOTE]
> `/oauth/authorize` 라우트는 Passport에서 이미 지정돼 있으므로, 따로 직접 라우트를 추가할 필요가 없습니다.

<a name="approving-the-request"></a>
#### 요청 승인하기

인가 요청을 받으면 Passport는 `prompt` 매개변수 값에 따라 자동으로 응답 동작을 결정하고, 사용자가 인가 요청을 승인/거부할 수 있는 템플릿 화면을 표시할 수 있습니다. 사용자가 요청을 승인하면, consume(연동)하는 애플리케이션에서 지정한 `redirect_uri`로 해당 사용자가 리다이렉트됩니다. 이 `redirect_uri`는 클라이언트 생성 시 지정했던 `redirect` URL과 반드시 일치해야 합니다.

인가 승인 화면을 커스텀하고 싶다면, `vendor:publish` 아티즌 명령어를 사용해 Passport의 뷰 파일을 퍼블리시할 수 있습니다. 퍼블리시된 뷰는 `resources/views/vendor/passport` 디렉토리에 위치합니다:

```shell
php artisan vendor:publish --tag=passport-views
```

어떤 경우에는, 예를 들어 1st-party(본인 소유) 클라이언트와 같이 인가 프롬프트를 건너뛰고 싶을 수 있습니다. 이 경우 [클라이언트 모델을 확장](#overriding-default-models)하여 `skipsAuthorization` 메서드를 오버라이드하면 됩니다. `skipsAuthorization`가 `true`를 반환하면, consume하는 애플리케이션에서 `prompt`를 명시적으로 지정한 경우가 아니라면, 인가 프롬프트 없이 바로 `redirect_uri`로 사용자가 리다이렉트됩니다:

```
<?php

namespace App\Models\Passport;

use Laravel\Passport\Client as BaseClient;

class Client extends BaseClient
{
    /**
     * 인가 프롬프트를 건너뛸지 여부를 판단합니다.
     *
     * @return bool
     */
    public function skipsAuthorization()
    {
        return $this->firstParty();
    }
}
```

<a name="requesting-tokens-converting-authorization-codes-to-access-tokens"></a>
#### 인가 코드를 액세스 토큰으로 변환

사용자가 인가 요청을 승인하면, consume하는 애플리케이션으로 리다이렉트됩니다. 이때, consume 애플리케이션에서는 리다이렉트 전에 저장한 `state` 값과 반환받은 `state` 값을 비교해 검증해야 합니다. 값이 일치하면, 이제 아래와 같이 여러분의 애플리케이션에 `POST` 요청을 보내 액세스 토큰을 요청할 수 있습니다. 이때 인가 승인 시 발급된 인가 코드(authorization code)를 함께 전달해야 합니다:

```
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

Route::get('/callback', function (Request $request) {
    $state = $request->session()->pull('state');

    throw_unless(
        strlen($state) > 0 && $state === $request->state,
        InvalidArgumentException::class
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

`/oauth/token` 라우트는 `access_token`, `refresh_token`, `expires_in` 속성을 포함하는 JSON 응답을 반환합니다. `expires_in` 값은 액세스 토큰 만료까지 남은 시간을 초 단위로 나타냅니다.

> [!NOTE]
> `/oauth/authorize` 라우트와 마찬가지로, `/oauth/token` 라우트 또한 Passport에서 이미 정의되어 있으므로, 직접 별도로 정의할 필요가 없습니다.

<a name="tokens-json-api"></a>
#### JSON API

Passport는 인가된 액세스 토큰을 관리할 수 있는 JSON API도 제공합니다. 이를 여러분의 프론트엔드와 연동하면, 사용자에게 액세스 토큰 관리 대시보드를 제공할 수 있습니다. 예시에서는 [Axios](https://github.com/mzabriskie/axios)를 활용해 HTTP 요청을 보내는 방법을 사용합니다. JSON API는 `web`과 `auth` 미들웨어로 보호되므로, 애플리케이션 내부에서만 호출이 가능합니다.

<a name="get-oauthtokens"></a>
#### `GET /oauth/tokens`

이 라우트는 인증된 사용자가 만든 모든 인가된 액세스 토큰을 반환합니다. 주로 사용자의 토큰 목록을 표시하고, 토큰 폐기 기능을 제공할 때 사용합니다:

```js
axios.get('/oauth/tokens')
    .then(response => {
        console.log(response.data);
    });
```

<a name="delete-oauthtokenstoken-id"></a>
#### `DELETE /oauth/tokens/{token-id}`

이 라우트는 액세스 토큰과 관련된 refresh 토큰도 함께 폐기할 때 사용합니다:

```js
axios.delete('/oauth/tokens/' + tokenId);
```

<a name="refreshing-tokens"></a>
### 토큰 갱신

애플리케이션에서 단기 액세스 토큰을 발급할 경우, 사용자는 액세스 토큰이 발급될 때 함께 받은 refresh 토큰을 사용하여 아래와 같이 토큰을 갱신해야 합니다:

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

이 `/oauth/token` 라우트 역시 `access_token`, `refresh_token`, `expires_in` 속성을 포함한 JSON 응답을 반환합니다. `expires_in`은 액세스 토큰 만료까지 남은 시간을 초 단위로 나타냅니다.

<a name="revoking-tokens"></a>
### 토큰 폐기

`Laravel\Passport\TokenRepository`에서 제공하는 `revokeAccessToken` 메서드를 이용해 토큰을 폐기할 수 있습니다. 또한 `Laravel\Passport\RefreshTokenRepository`의 `revokeRefreshTokensByAccessTokenId` 메서드를 사용해 해당 액세스 토큰과 연결된 모든 refresh 토큰도 폐기할 수 있습니다. 이 클래스들은 라라벨의 [서비스 컨테이너](/docs/9.x/container)를 통해 resolve할 수 있습니다:

```
use Laravel\Passport\TokenRepository;
use Laravel\Passport\RefreshTokenRepository;

$tokenRepository = app(TokenRepository::class);
$refreshTokenRepository = app(RefreshTokenRepository::class);

// 액세스 토큰 폐기
$tokenRepository->revokeAccessToken($tokenId);

// 해당 액세스 토큰의 모든 refresh 토큰 폐기
$refreshTokenRepository->revokeRefreshTokensByAccessTokenId($tokenId);
```

<a name="purging-tokens"></a>

### 토큰 정리(Purging Tokens)

토큰이 폐기(revoke)되거나 만료(expired)된 경우, 데이터베이스에서 해당 토큰을 삭제하고 싶을 수 있습니다. Passport가 제공하는 `passport:purge` 아티즌 명령어를 사용하면 이를 손쉽게 처리할 수 있습니다.

```shell
# 폐기되거나 만료된 토큰 및 인증 코드를 삭제합니다...
php artisan passport:purge

# 6시간 이상 만료된 토큰만 삭제합니다...
php artisan passport:purge --hours=6

# 폐기된 토큰 및 인증 코드만 삭제합니다...
php artisan passport:purge --revoked

# 만료된 토큰 및 인증 코드만 삭제합니다...
php artisan passport:purge --expired
```

또한, 애플리케이션의 `App\Console\Kernel` 클래스에서 [스케줄 작업](/docs/9.x/scheduling)을 설정해 주기적으로 토큰을 자동으로 정리(프루닝)할 수 있습니다.

```
/**
 * 애플리케이션의 명령어 스케줄을 정의합니다.
 *
 * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
 * @return void
 */
protected function schedule(Schedule $schedule)
{
    $schedule->command('passport:purge')->hourly();
}
```

<a name="code-grant-pkce"></a>
## PKCE를 활용한 인가 코드 그랜트(Authorization Code Grant with PKCE)

"코드 교환 증명(Proof Key for Code Exchange, PKCE)" 기반의 인가 코드 그랜트는 싱글 페이지 애플리케이션이나 네이티브 앱이 API에 안전하게 인증할 수 있는 방식을 제공합니다. 클라이언트 시크릿을 안전하게 보관할 수 없거나, 인증 코드가 공격자에 의해 가로채질 위험이 있는 상황에서는 반드시 이 그랜트를 사용해야 합니다. 인가 코드를 엑세스 토큰으로 교환할 때 "코드 검증자(code verifier)"와 "코드 챌린지(code challenge)"의 조합이 클라이언트 시크릿의 역할을 대신합니다.

<a name="creating-a-auth-pkce-grant-client"></a>
### 클라이언트 생성하기

PKCE를 지원하는 인가 코드 그랜트로 토큰을 발급하기 전에, 먼저 PKCE를 지원하는 클라이언트를 생성해야 합니다. `passport:client` 아티즌 명령어에 `--public` 옵션을 추가하여 클라이언트를 만들 수 있습니다.

```shell
php artisan passport:client --public
```

<a name="requesting-auth-pkce-grant-tokens"></a>
### 토큰 요청하기

<a name="code-verifier-code-challenge"></a>
#### 코드 검증자 & 코드 챌린지

이 방식에서는 클라이언트 시크릿을 제공하지 않으므로, 토큰을 요청하기 위해서 개발자는 코드 검증자(code verifier)와 코드 챌린지(code challenge)의 조합을 생성해야 합니다.

코드 검증자는 [RFC 7636 명세](https://tools.ietf.org/html/rfc7636)에 따라, 영문자, 숫자, 그리고 `"-"`, `"."`, `"_"`, `"~"` 문자를 포함하는 43자에서 128자 사이의 랜덤 문자열이어야 합니다.

코드 챌린지는 URL 및 파일 이름에 안전한(Base64 인코딩) 문자열이어야 하며, 마지막에 붙는 `'='` 문자는 제거되어야 하고, 줄 바꿈이나 공백 등의 문자가 포함되지 않아야 합니다.

```
$encoded = base64_encode(hash('sha256', $code_verifier, true));

$codeChallenge = strtr(rtrim($encoded, '='), '+/', '-_');
```

<a name="code-grant-pkce-redirecting-for-authorization"></a>
#### 인가를 위한 리다이렉트

클라이언트가 생성되면, 클라이언트 ID와 생성한 코드 검증자, 코드 챌리지를 사용하여 애플리케이션에서 인가 코드와 엑세스 토큰을 요청할 수 있습니다. 먼저, 클라이언트를 사용하는 애플리케이션에서 `/oauth/authorize` 경로로 리다이렉트 요청을 보냅니다.

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
        // 'prompt' => '', // "none", "consent", 또는 "login"
    ]);

    return redirect('http://passport-app.test/oauth/authorize?'.$query);
});
```

<a name="code-grant-pkce-converting-authorization-codes-to-access-tokens"></a>
#### 인가 코드를 엑세스 토큰으로 변환하기

사용자가 인가 요청을 승인하면, 사용자는 다시 클라이언트(컨슈밍 애플리케이션)로 리다이렉트됩니다. 이때 클라이언트에서는 표준 인가 코드 그랜트와 마찬가지로, `state` 파라미터를 리다이렉트 이전에 저장했던 값과 비교해야 합니다.

`state` 값이 일치한다면, 클라이언트는 애플리케이션으로 `POST` 요청을 보내 엑세스 토큰을 요청할 수 있습니다. 이 요청에는 애플리케이션이 인가 요청 승인 후 제공한 인가 코드와, 원래 생성한 코드 검증자가 포함되어야 합니다.

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
## 비밀번호 그랜트 토큰(Password Grant Tokens)

> [!WARNING]
> 이제는 비밀번호 그랜트 토큰 사용을 더 이상 권장하지 않습니다. 대신 [OAuth2 Server에서 현재 권장하는 그랜트 타입](https://oauth2.thephpleague.com/authorization-server/which-grant/) 을 선택해야 합니다.

OAuth2 비밀번호 그랜트는 모바일 애플리케이션 같은 기타 1st-party 클라이언트가 이메일/사용자명과 비밀번호를 사용하여 직접 엑세스 토큰을 얻을 수 있게 해줍니다. 덕분에 전체 OAuth2 인가 코드 리다이렉트 플로우를 거치지 않아도 사용자를 직접 인증하여 안전하게 토큰을 발급할 수 있습니다.

<a name="creating-a-password-grant-client"></a>
### 비밀번호 그랜트 클라이언트 생성

비밀번호 그랜트를 통해 토큰을 발급하기 전에, 해당 용도의 클라이언트를 만들어야 합니다. `passport:client` 아티즌 명령어에 `--password` 옵션을 사용하세요. **이미 `passport:install` 명령어를 실행했다면, 이 명령을 다시 실행할 필요는 없습니다.**

```shell
php artisan passport:client --password
```

<a name="requesting-password-grant-tokens"></a>
### 토큰 요청하기

비밀번호 그랜트 클라이언트가 생성되면, 사용자의 이메일 주소와 비밀번호를 포함해 `/oauth/token` 경로로 `POST` 요청을 보내 토큰을 요청할 수 있습니다. 이 라우트는 Passport가 이미 등록하여 별도로 정의할 필요가 없습니다. 요청이 성공하면 서버의 JSON 응답에서 `access_token`과 `refresh_token`을 받게 됩니다.

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
> 엑세스 토큰은 기본적으로 수명이 깁니다. 필요하다면 [엑세스 토큰의 최대 유효 기간을 설정](#configuration)할 수 있습니다.

<a name="requesting-all-scopes"></a>
### 모든 스코프 요청하기

비밀번호 그랜트나 클라이언트 자격 증명 그랜트(client credentials grant)를 사용할 때, 애플리케이션에서 지원하는 모든 스코프에 대해 토큰을 승인받을 수 있습니다. 이를 위해 `*` 스코프를 요청하면 됩니다. `*` 스코프가 지정된 토큰은 인스턴스의 `can` 메서드가 항상 `true`를 반환하게 됩니다. 이 스코프는 `password` 또는 `client_credentials` 그랜트 방식으로 발급된 토큰에서만 사용할 수 있습니다.

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
### 사용자 프로바이더 커스터마이즈

애플리케이션에서 [여러 인증 사용자 프로바이더](/docs/9.x/authentication#introduction)를 사용한다면, `artisan passport:client --password` 명령어로 클라이언트 생성 시 `--provider` 옵션을 추가해 사용할 프로바이더를 지정할 수 있습니다. 이때 지정하는 프로바이더 이름은 `config/auth.php`에 정의된 유효한 프로바이더여야 합니다. 이후 해당 가드의 프로바이더에 속한 사용자만 접근할 수 있도록 [미들웨어로 라우트를 보호](#via-middleware)할 수 있습니다.

<a name="customizing-the-username-field"></a>
### 사용자명 필드 커스터마이즈

비밀번호 그랜트 인증을 사용할 때, Passport는 인증 가능한 모델의 `email` 속성을 "사용자명"으로 간주합니다. 하지만, 이 동작을 커스터마이즈하려면 모델에 `findForPassport` 메서드를 정의하면 됩니다.

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
     * 주어진 사용자명으로 사용자 인스턴스를 찾습니다.
     *
     * @param  string  $username
     * @return \App\Models\User
     */
    public function findForPassport($username)
    {
        return $this->where('username', $username)->first();
    }
}
```

<a name="customizing-the-password-validation"></a>
### 비밀번호 검증 커스터마이즈

비밀번호 그랜트 인증을 사용할 때, Passport는 모델의 `password` 속성을 사용해 주어진 비밀번호를 검증합니다. 만약 모델에 `password` 속성이 없거나, 별도의 커스텀 로직으로 비밀번호를 검증하고 싶다면, `validateForPassportPasswordGrant` 메서드를 모델에 정의할 수 있습니다.

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
     * Passport 비밀번호 그랜트용 비밀번호를 검증합니다.
     *
     * @param  string  $password
     * @return bool
     */
    public function validateForPassportPasswordGrant($password)
    {
        return Hash::check($password, $this->password);
    }
}
```

<a name="implicit-grant-tokens"></a>
## 임플리싯 그랜트 토큰(Implicit Grant Tokens)

> [!WARNING]
> 임플리싯 그랜트 토큰 사용 역시 더 이상 권장하지 않습니다. [OAuth2 Server에서 현재 권장하는 그랜트 타입](https://oauth2.thephpleague.com/authorization-server/which-grant/)을 선택해야 합니다.

임플리싯 그랜트는 인가 코드 그랜트와 비슷하지만, 인가 코드 교환 과정 없이 곧바로 토큰이 클라이언트에 반환됩니다. 이 방식은 보통 JavaScript 애플리케이션 또는 클라이언트 시크릿을 안전하게 저장할 수 없는 모바일 앱에서 사용됩니다. 임플리싯 그랜트를 활성화하려면, 애플리케이션의 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 `enableImplicitGrant` 메서드를 호출하면 됩니다.

```
/**
 * 인증/인가 서비스를 등록합니다.
 *
 * @return void
 */
public function boot()
{
    $this->registerPolicies();

    Passport::enableImplicitGrant();
}
```

임플리싯 그랜트가 활성화된 뒤에는, 클라이언트 ID로 토큰을 요청할 수 있습니다. 사용 클라이언트(컨슈머 애플리케이션)는 아래와 같이 `/oauth/authorize` 경로로 리다이렉트 요청을 보냅니다.

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
        // 'prompt' => '', // "none", "consent", 또는 "login"
    ]);

    return redirect('http://passport-app.test/oauth/authorize?'.$query);
});
```

> [!NOTE]
> `/oauth/authorize` 라우트는 Passport가 이미 정의해주므로, 직접 별도로 정의할 필요가 없습니다.

<a name="client-credentials-grant-tokens"></a>
## 클라이언트 자격 증명 그랜트 토큰(Client Credentials Grant Tokens)

클라이언트 자격 증명 그랜트는 머신 간 인증(m2m, machine-to-machine)에 적합합니다. 예를 들어, API를 통해 유지보수 작업을 수행하는 예약 작업에서 이 그랜트를 사용할 수 있습니다.

클라이언트 자격 증명 그랜트를 통해 토큰을 발급하려면, 클라이언트 자격 증명 그랜트 클라이언트부터 생성해야 합니다. `passport:client` 아티즌 명령어에 `--client` 옵션을 사용하세요.

```shell
php artisan passport:client --client
```

다음으로, 이 그랜트 타입을 사용하려면 `CheckClientCredentials` 미들웨어를 `app/Http/Kernel.php` 파일의 `$routeMiddleware` 속성에 추가해야 합니다.

```
use Laravel\Passport\Http\Middleware\CheckClientCredentials;

protected $routeMiddleware = [
    'client' => CheckClientCredentials::class,
];
```

그리고 해당 미들웨어를 라우트에 적용합니다.

```
Route::get('/orders', function (Request $request) {
    ...
})->middleware('client');
```

특정 스코프가 필요한 경우, 라우트에 `client` 미들웨어를 지정할 때 콤마(,)로 구분한 스코프 목록을 함께 지정할 수 있습니다.

```
Route::get('/orders', function (Request $request) {
    ...
})->middleware('client:check-status,your-scope');
```

<a name="retrieving-tokens"></a>
### 토큰 가져오기

이 그랜트 타입으로 토큰을 가져오려면, `oauth/token` 엔드포인트에 요청을 보내면 됩니다.

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

사용자가 전형적인 인가 코드 리다이렉트 흐름을 거치지 않고, 직접 자신에게 엑세스 토큰을 발급하고 싶은 경우가 있습니다. UI 상에서 사용자가 직접 토큰을 발급할 수 있도록 하면, API 실험 또는 일반적인 엑세스 토큰 발급 시 보다 간단한 접근 방식을 제공할 수 있습니다.

> [!NOTE]
> 만약 애플리케이션이 주로 개인 액세스 토큰을 발급하는 용도로 Passport를 사용한다면, API 액세스 토큰 발급을 위한 라라벨의 경량 1st-party 라이브러리인 [Laravel Sanctum](/docs/9.x/sanctum)을 사용하는 것을 고려해보세요.

<a name="creating-a-personal-access-client"></a>
### 개인 액세스 클라이언트 생성

개인 액세스 토큰을 발급하려면, 먼저 전용 클라이언트를 생성해야 합니다. `passport:client` 아티즌 명령어에 `--personal` 옵션을 사용하세요. 이미 `passport:install`을 실행했다면, 다시 실행할 필요가 없습니다.

```shell
php artisan passport:client --personal
```

개인 액세스 클라이언트를 생성한 후, 클라이언트의 ID와 평문 시크릿을 애플리케이션의 `.env` 파일에 다음처럼 저장합니다.

```ini
PASSPORT_PERSONAL_ACCESS_CLIENT_ID="client-id-value"
PASSPORT_PERSONAL_ACCESS_CLIENT_SECRET="unhashed-client-secret-value"
```

<a name="managing-personal-access-tokens"></a>
### 개인 액세스 토큰 관리하기

개인 액세스 클라이언트가 준비되면, `App\Models\User` 모델 인스턴스의 `createToken` 메서드를 사용해 해당 사용자용 토큰을 발급할 수 있습니다. `createToken` 메서드는 첫 번째 인수로 토큰의 이름, 두 번째(선택) 인수로 [스코프](#token-scopes) 배열을 받습니다.

```
use App\Models\User;

$user = User::find(1);

// 스코프 없이 토큰 생성...
$token = $user->createToken('Token Name')->accessToken;

// 스코프를 지정하여 토큰 생성...
$token = $user->createToken('My Token', ['place-orders'])->accessToken;
```

<a name="personal-access-tokens-json-api"></a>
#### JSON API

Passport는 개인 액세스 토큰 관리를 위한 JSON API도 제공합니다. 이를 프론트엔드에 연동하면, 사용자가 대시보드에서 직접 발급·관리가 가능합니다. 아래에서는 개인 액세스 토큰 관리를 위한 모든 API 엔드포인트를 살펴봅니다. 예시에서는 HTTP 요청을 위해 [Axios](https://github.com/mzabriskie/axios)를 사용합니다.

이 JSON API는 `web`과 `auth` 미들웨어로 보호되어 있으므로, 반드시 자체 애플리케이션에서만 호출 가능하며 외부에서는 접근할 수 없습니다.

<a name="get-oauthscopes"></a>
#### `GET /oauth/scopes`

이 라우트는 애플리케이션에 정의된 모든 [스코프](#token-scopes)를 반환합니다. 사용자가 개인 액세스 토큰을 생성할 때 할당 가능한 스코프 목록을 표시하는 데 사용할 수 있습니다.

```js
axios.get('/oauth/scopes')
    .then(response => {
        console.log(response.data);
    });
```

<a name="get-oauthpersonal-access-tokens"></a>
#### `GET /oauth/personal-access-tokens`

현재 인증된 사용자가 생성한 모든 개인 액세스 토큰을 반환합니다. 이 API는 사용자가 자신이 발급한 토큰을 목록화하고 편집하거나 폐기할 수 있도록 할 때 유용합니다.

```js
axios.get('/oauth/personal-access-tokens')
    .then(response => {
        console.log(response.data);
    });
```

<a name="post-oauthpersonal-access-tokens"></a>
#### `POST /oauth/personal-access-tokens`

이 라우트는 새로운 개인 액세스 토큰을 생성합니다. 토큰의 `name`과 할당할 `scopes` 두 가지 데이터가 필요합니다.

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
        // 에러 목록...
    });
```

<a name="delete-oauthpersonal-access-tokenstoken-id"></a>
#### `DELETE /oauth/personal-access-tokens/{token-id}`

이 라우트는 개인 액세스 토큰을 폐기하는 데 사용할 수 있습니다.

```js
axios.delete('/oauth/personal-access-tokens/' + tokenId);
```

<a name="protecting-routes"></a>
## 라우트 보호하기(Protecting Routes)

<a name="via-middleware"></a>
### 미들웨어를 통한 보호

Passport에는 들어오는 요청의 엑세스 토큰을 검증하는 [인증 가드](/docs/9.x/authentication#adding-custom-guards)가 포함되어 있습니다. `api` 가드를 `passport` 드라이버로 설정한 후, 엑세스 토큰이 필요한 라우트에는 `auth:api` 미들웨어만 지정하면 됩니다.

```
Route::get('/user', function () {
    //
})->middleware('auth:api');
```

> [!WARNING]
> [클라이언트 자격 증명 그랜트](#client-credentials-grant-tokens)를 사용한다면, 해당 라우트 보호에는 `auth:api` 미들웨어가 아닌 [별도의 `client` 미들웨어](#client-credentials-grant-tokens)를 사용해야 합니다.

<a name="multiple-authentication-guards"></a>
#### 다중 인증 가드

애플리케이션에서 서로 완전히 다른 Eloquent 모델을 사용하는 여러 유형의 사용자를 인증하고자 한다면, 각 사용자 프로바이더 타입별로 가드 구성을 정의해야 할 수 있습니다. 이를 통해 특정 사용자 프로바이더를 대상으로 요청을 보호할 수 있습니다. 예를 들어, 아래와 같이 `config/auth.php`에서 가드를 구성할 수 있습니다.

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

다음 라우트에서는 `customers` 사용자 프로바이더를 사용하는 `api-customers` 가드를 통해 인증이 이루어집니다.

```
Route::get('/customer', function () {
    //
})->middleware('auth:api-customers');
```

> [!NOTE]
> Passport에서 여러 사용자 프로바이더를 사용하는 방법에 대한 자세한 내용은 [비밀번호 그랜트 문서](#customizing-the-user-provider)를 참고하세요.

<a name="passing-the-access-token"></a>
### 엑세스 토큰 전달 방식

Passport로 보호된 라우트를 호출할 때, API 클라이언트는 요청 헤더 중 `Authorization`에 `Bearer` 토큰으로 엑세스 토큰을 지정해야 합니다. 예를 들어, Guzzle HTTP 라이브러리를 사용할 때는 다음과 같이 요청할 수 있습니다.

```
use Illuminate\Support\Facades\Http;

$response = Http::withHeaders([
    'Accept' => 'application/json',
    'Authorization' => 'Bearer '.$accessToken,
])->get('https://passport-app.test/api/user');

return $response->json();
```

<a name="token-scopes"></a>
## 토큰 스코프(Token Scopes)

스코프는 API 클라이언트가 계정 접근 권한을 요청할 때, 필요한 권한(permit)의 범위를 지정할 수 있게 해줍니다. 예를 들어, 이커머스 애플리케이션에서는 모든 API 소비자에게 주문 권한이 반드시 필요하지 않을 수 있습니다. 대신 사용자가 원하는 주요 기능(예: 주문의 배송 상태 조회)만 권한을 요청할 수 있습니다. 즉, 스코프를 통해 외부 애플리케이션이 사용자 대신 수행할 수 있는 작업을 제한할 수 있습니다.

<a name="defining-scopes"></a>
### 스코프 정의하기

애플리케이션의 `App\Providers\AuthServiceProvider` 클래스에 있는 `boot` 메서드 내부에서 `Passport::tokensCan` 메서드를 사용해 API의 스코프를 정의할 수 있습니다. `tokensCan` 메서드는 스코프 이름과 스코프 설명이 포함된 배열을 받습니다. 설명은 원하는 어떤 텍스트도 쓸 수 있으며, 인가 승인 화면에서 최종 사용자에게 보여집니다.

```
/**
 * 인증/인가 서비스를 등록합니다.
 *
 * @return void
 */
public function boot()
{
    $this->registerPolicies();

    Passport::tokensCan([
        'place-orders' => 'Place orders',
        'check-status' => 'Check order status',
    ]);
}
```

<a name="default-scope"></a>
### 기본 스코프(Default Scope)

클라이언트가 별도의 스코프를 요청하지 않은 경우, Passport 서버에서 기본적으로 토큰에 지정할 스코프를 `setDefaultScope` 메서드로 설정할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 호출합니다.

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
> Passport의 기본 스코프는 사용자가 직접 생성한 개인 엑세스 토큰에는 적용되지 않습니다.

<a name="assigning-scopes-to-tokens"></a>

### 토큰에 스코프 할당하기

<a name="when-requesting-authorization-codes"></a>
#### 권한 부여 코드 요청 시

Authorization code grant 방식을 사용하여 액세스 토큰을 요청할 때, 사용자는 자신이 원하는 스코프(scope)를 `scope` 쿼리 스트링 파라미터로 지정해야 합니다. `scope` 파라미터 값은 스코프 이름을 공백으로 구분하여 나열합니다.

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
#### Personal Access Token 발급 시

`App\Models\User` 모델의 `createToken` 메서드를 사용하여 personal access token을 발급할 때, 두 번째 인수로 원하는 스코프의 배열을 전달할 수 있습니다.

```
$token = $user->createToken('My Token', ['place-orders'])->accessToken;
```

<a name="checking-scopes"></a>
### 스코프 확인하기

Passport에는 요청에 사용된 토큰이 주어진 스코프를 가지고 있는지 검사할 수 있는 두 가지 미들웨어가 포함되어 있습니다. 먼저, `app/Http/Kernel.php` 파일의 `$routeMiddleware` 속성에 다음 미들웨어를 추가해 주십시오.

```
'scopes' => \Laravel\Passport\Http\Middleware\CheckScopes::class,
'scope' => \Laravel\Passport\Http\Middleware\CheckForAnyScope::class,
```

<a name="check-for-all-scopes"></a>
#### 모든 스코프를 체크

`scopes` 미들웨어를 라우트에 할당하면, 해당 라우트에 대한 요청에 사용된 액세스 토큰이 지정된 모든 스코프를 반드시 가지고 있는지 확인할 수 있습니다.

```
Route::get('/orders', function () {
    // 액세스 토큰이 "check-status"와 "place-orders" 스코프를 모두 가지고 있어야 합니다...
})->middleware(['auth:api', 'scopes:check-status,place-orders']);
```

<a name="check-for-any-scopes"></a>
#### 하나 이상의 스코프를 체크

`scope` 미들웨어를 라우트에 할당하면, 액세스 토큰이 나열된 스코프 중 *하나 이상*을 가지고 있는지 확인할 수 있습니다.

```
Route::get('/orders', function () {
    // 액세스 토큰이 "check-status" 또는 "place-orders" 스코프 중 하나를 가지고 있으면 동작합니다...
})->middleware(['auth:api', 'scope:check-status,place-orders']);
```

<a name="checking-scopes-on-a-token-instance"></a>
#### 토큰 인스턴스에서 스코프 확인하기

액세스 토큰이 인증된 요청이 애플리케이션에 들어오면, 인증된 `App\Models\User` 인스턴스의 `tokenCan` 메서드를 사용하여 해당 토큰이 특정 스코프를 가지고 있는지 추가로 확인할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    if ($request->user()->tokenCan('place-orders')) {
        //
    }
});
```

<a name="additional-scope-methods"></a>
#### 추가적인 스코프 관련 메서드

`scopeIds` 메서드는 정의된 모든 스코프의 ID/이름 배열을 반환합니다.

```
use Laravel\Passport\Passport;

Passport::scopeIds();
```

`scopes` 메서드는 정의된 모든 스코프를 `Laravel\Passport\Scope` 인스턴스 배열로 반환합니다.

```
Passport::scopes();
```

`scopesFor` 메서드는 지정한 ID/이름에 해당하는 `Laravel\Passport\Scope` 인스턴스 배열을 반환합니다.

```
Passport::scopesFor(['place-orders', 'check-status']);
```

특정 스코프가 정의되어 있는지 확인하려면 `hasScope` 메서드를 사용할 수 있습니다.

```
Passport::hasScope('place-orders');
```

<a name="consuming-your-api-with-javascript"></a>
## 자바스크립트로 API 활용하기

API를 개발할 때, 자바스크립트 애플리케이션에서 직접 자신의 API를 소비할 수 있다면 매우 편리합니다. 이 방식의 API 개발은, 여러분이 직접 배포하는 웹 애플리케이션, 모바일 앱, 서드파티 앱, 각종 패키지 매니저에 공개한 SDK 등 모두가 동일한 API를 활용할 수 있게 해줍니다.

일반적으로 자바스크립트 애플리케이션에서 API를 사용하려면 액세스 토큰을 수동으로 전달하고, 매 요청마다 토큰을 포함시켜야 합니다. 하지만 Passport에서는 이러한 과정을 대신 처리해 주는 미들웨어를 제공합니다. `app/Http/Kernel.php` 파일의 `web` 미들웨어 그룹에 `CreateFreshApiToken` 미들웨어를 추가해 주세요.

```
'web' => [
    // 다른 미들웨어...
    \Laravel\Passport\Http\Middleware\CreateFreshApiToken::class,
],
```

> [!WARNING]
> 반드시 `CreateFreshApiToken` 미들웨어를 미들웨어 스택의 마지막에 위치시켜야 합니다.

이 미들웨어는 응답에 `laravel_token`이라는 쿠키를 자동으로 추가합니다. 이 쿠키에는 암호화된 JWT가 포함되어 있으며, Passport가 자바스크립트 애플리케이션의 API 요청을 인증하는 데 사용합니다. 이 JWT의 수명은 `session.lifetime` 설정 값과 동일합니다. 이제 브라우저가 자동으로 쿠키를 모든 API 요청에 포함시키므로, 더 이상 액세스 토큰을 명시적으로 전달하지 않고도 자유롭게 API를 사용할 수 있습니다.

```
axios.get('/api/user')
    .then(response => {
        console.log(response.data);
    });
```

<a name="customizing-the-cookie-name"></a>
#### 쿠키 이름 커스터마이즈

필요하다면, `Passport::cookie` 메서드를 사용해 `laravel_token` 쿠키의 이름을 변경할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 호출합니다.

```
/**
 * Register any authentication / authorization services.
 *
 * @return void
 */
public function boot()
{
    $this->registerPolicies();

    Passport::cookie('custom_name');
}
```

<a name="csrf-protection"></a>
#### CSRF 보호

이 인증 방식을 사용할 경우, 요청마다 유효한 CSRF 토큰 헤더가 반드시 포함되어야 합니다. 라라벨의 기본 자바스크립트 스캐폴딩에는 Axios 인스턴스가 포함되어 있는데, 이 인스턴스는 암호화된 `XSRF-TOKEN` 쿠키 값을 이용해 동일 출처 요청에 자동으로 `X-XSRF-TOKEN` 헤더를 전송합니다.

> [!NOTE]
> 만약 `X-XSRF-TOKEN` 대신 `X-CSRF-TOKEN` 헤더를 보내고자 한다면, 반드시 `csrf_token()`이 반환하는 암호화되지 않은 토큰을 사용해야 합니다.

<a name="events"></a>
## 이벤트

Passport는 액세스 토큰 또는 리프레시 토큰이 발급될 때 관련 이벤트를 발생시킵니다. 이를 활용해 데이터베이스에서 다른 액세스 토큰을 정리(삭제)하거나 취소(폐기)할 수 있습니다. 원한다면 애플리케이션의 `App\Providers\EventServiceProvider` 클래스에서 이러한 이벤트에 대한 리스너(listener)를 등록할 수 있습니다.

```
/**
 * The event listener mappings for the application.
 *
 * @var array
 */
protected $listen = [
    'Laravel\Passport\Events\AccessTokenCreated' => [
        'App\Listeners\RevokeOldTokens',
    ],

    'Laravel\Passport\Events\RefreshTokenCreated' => [
        'App\Listeners\PruneOldTokens',
    ],
];
```

<a name="testing"></a>
## 테스트

Passport의 `actingAs` 메서드는 현재 인증된 사용자와 해당 사용자의 토큰에 부여할 스코프를 지정할 수 있습니다. `actingAs` 메서드의 첫 번째 인수는 사용자 인스턴스이고, 두 번째 인수는 토큰에 부여할 스코프 배열입니다.

```
use App\Models\User;
use Laravel\Passport\Passport;

public function test_servers_can_be_created()
{
    Passport::actingAs(
        User::factory()->create(),
        ['create-servers']
    );

    $response = $this->post('/api/create-server');

    $response->assertStatus(201);
}
```

Passport의 `actingAsClient` 메서드는 현재 인증된 클라이언트와 해당 클라이언트 토큰에 부여할 스코프를 지정할 수 있습니다. 첫 번째 인수는 클라이언트 인스턴스이며, 두 번째 인수는 토큰에 부여할 스코프 배열입니다.

```
use Laravel\Passport\Client;
use Laravel\Passport\Passport;

public function test_orders_can_be_retrieved()
{
    Passport::actingAsClient(
        Client::factory()->create(),
        ['check-status']
    );

    $response = $this->get('/api/orders');

    $response->assertStatus(200);
}
```