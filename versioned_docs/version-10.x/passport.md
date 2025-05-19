# 라라벨 패스포트 (Laravel Passport)

- [소개](#introduction)
    - [패스포트와 생텀 중 무엇을 사용할까?](#passport-or-sanctum)
- [설치](#installation)
    - [패스포트 배포하기](#deploying-passport)
    - [마이그레이션 커스터마이즈](#migration-customization)
    - [패스포트 업그레이드](#upgrading-passport)
- [설정](#configuration)
    - [클라이언트 시크릿 해싱](#client-secret-hashing)
    - [토큰 유효 기간](#token-lifetimes)
    - [기본 모델 오버라이드](#overriding-default-models)
    - [라우트 오버라이드](#overriding-routes)
- [액세스 토큰 발급](#issuing-access-tokens)
    - [클라이언트 관리](#managing-clients)
    - [토큰 요청](#requesting-tokens)
    - [토큰 갱신](#refreshing-tokens)
    - [토큰 취소](#revoking-tokens)
    - [토큰 정리](#purging-tokens)
- [PKCE를 사용한 인증 코드 그랜트](#code-grant-pkce)
    - [클라이언트 생성](#creating-a-auth-pkce-grant-client)
    - [토큰 요청](#requesting-auth-pkce-grant-tokens)
- [패스워드 그랜트 토큰](#password-grant-tokens)
    - [패스워드 그랜트 클라이언트 생성](#creating-a-password-grant-client)
    - [토큰 요청](#requesting-password-grant-tokens)
    - [모든 스코프 요청하기](#requesting-all-scopes)
    - [사용자 프로바이더 커스터마이즈](#customizing-the-user-provider)
    - [사용자명 필드 커스터마이즈](#customizing-the-username-field)
    - [비밀번호 검증 커스터마이즈](#customizing-the-password-validation)
- [임플리싯 그랜트 토큰](#implicit-grant-tokens)
- [클라이언트 자격증명 그랜트 토큰](#client-credentials-grant-tokens)
- [개인 접근 토큰](#personal-access-tokens)
    - [개인 접근 클라이언트 생성](#creating-a-personal-access-client)
    - [개인 접근 토큰 관리](#managing-personal-access-tokens)
- [라우트 보호](#protecting-routes)
    - [미들웨어 사용](#via-middleware)
    - [액세스 토큰 전달](#passing-the-access-token)
- [토큰 스코프](#token-scopes)
    - [스코프 정의](#defining-scopes)
    - [기본 스코프](#default-scope)
    - [토큰에 스코프 할당](#assigning-scopes-to-tokens)
    - [스코프 확인](#checking-scopes)
- [자바스크립트로 API 활용하기](#consuming-your-api-with-javascript)
- [이벤트](#events)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

[Laravel Passport](https://github.com/laravel/passport)는 라라벨 애플리케이션에 몇 분 만에 완전한 OAuth2 서버를 구축할 수 있도록 해주는 패키지입니다. Passport는 Andy Millington과 Simon Hamp가 관리하는 [League OAuth2 server](https://github.com/thephpleague/oauth2-server)를 기반으로 만들어졌습니다.

> [!NOTE]
> 이 문서는 여러분이 OAuth2에 대해 기본적으로 알고 있다는 전제 하에 작성되었습니다. OAuth2에 대한 지식이 없으시다면, 먼저 [용어](https://oauth2.thephpleague.com/terminology/) 및 기본적인 기능을 익힌 후에 이 문서를 읽으시길 권장합니다.

<a name="passport-or-sanctum"></a>
### 패스포트와 생텀 중 무엇을 사용할까?

시작하기 전에, 애플리케이션에 Laravel Passport와 [Laravel Sanctum](/docs/10.x/sanctum) 중 어떤 것이 더 적합한지 판단하는 것이 좋습니다. 만약 애플리케이션에서 반드시 OAuth2를 지원해야만 한다면, Laravel Passport를 사용하는 것이 맞습니다.

하지만 싱글 페이지 애플리케이션(SPA), 모바일 애플리케이션, 또는 단순한 API 토큰 발급이 필요하다면 [Laravel Sanctum](/docs/10.x/sanctum)을 사용하는 것이 더 나은 선택일 수 있습니다. Laravel Sanctum은 OAuth2를 지원하지 않지만, 훨씬 간단한 방식으로 API 인증 기능을 구현할 수 있습니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 매니저를 통해 Passport를 설치합니다:

```shell
composer require laravel/passport
```

Passport의 [서비스 프로바이더](/docs/10.x/providers)가 자체적으로 데이터베이스 마이그레이션 디렉터리를 등록하기 때문에, 패키지를 설치한 후에는 데이터베이스 마이그레이션을 실행해야 합니다. Passport 마이그레이션은 OAuth2 클라이언트와 액세스 토큰 관련 테이블을 생성합니다:

```shell
php artisan migrate
```

다음으로, `passport:install` 아티즌 명령어를 실행해야 합니다. 이 명령어는 보안 액세스 토큰을 생성할 때 필요한 암호화 키를 만들어줍니다. 또한, 이 명령어는 "personal access"와 "password grant" 클라이언트를 생성해서, 액세스 토큰 발급에 활용할 수 있도록 해줍니다:

```shell
php artisan passport:install
```

> [!NOTE]
> Passport의 `Client` 모델에서 자동 증가 정수(ID) 대신 UUID를 기본키 값으로 사용하고자 한다면, [아래 `uuids` 옵션](#client-uuids)을 참고하여 Passport를 설치하세요.

`passport:install` 명령을 모두 실행한 후, `App\Models\User` 사용자 모델에 `Laravel\Passport\HasApiTokens` 트레잇을 추가하세요. 이 트레잇은 인증된 유저의 토큰 및 스코프를 확인할 수 있는 유용한 메서드들을 제공합니다. 만약 기존에 `Laravel\Sanctum\HasApiTokens` 트레잇을 사용하고 있다면, 해당 트레잇은 제거해도 됩니다.

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

마지막으로, 애플리케이션의 `config/auth.php` 설정 파일에서, `api` 인증 가드를 정의하고 `driver` 옵션을 `passport`로 설정해야 합니다. 이렇게 하면, API 요청 인증 시 Passport의 `TokenGuard`가 사용되도록 지정할 수 있습니다.

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
#### 클라이언트 UUID

`--uuids` 옵션과 함께 `passport:install` 명령어를 사용할 수도 있습니다. 이 옵션을 사용하면 Passport의 `Client` 모델 기본키로 자동 증가 정수 대신 UUID가 사용되도록 설정됩니다. 이 명령어 실행 후에는 Passport의 기본 마이그레이션을 비활성화하는 추가 안내가 나올 수 있습니다:

```shell
php artisan passport:install --uuids
```

<a name="deploying-passport"></a>
### 패스포트 배포하기

처음으로 서버에 Passport를 배포할 때는, `passport:keys` 명령어를 실행해야 할 수도 있습니다. 이 명령어는 토큰 발급과 검증에 필요한 암호화 키를 생성합니다. 보통 이 키들은 버전 관리(소스 컨트롤)에 포함하지 않습니다.

```shell
php artisan passport:keys
```

경우에 따라, Passport의 키 로딩 경로를 직접 지정할 수 있습니다. 이때는 `Passport::loadKeysFrom` 메서드를 사용하면 되며, 보통 애플리케이션의 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 호출합니다.

```
/**
 * Register any authentication / authorization services.
 */
public function boot(): void
{
    Passport::loadKeysFrom(__DIR__.'/../secrets/oauth');
}
```

<a name="loading-keys-from-the-environment"></a>
#### 환경변수로 키 로딩하기

또는, `vendor:publish` 아티즌 명령어로 Passport의 설정 파일을 퍼블리시할 수도 있습니다:

```shell
php artisan vendor:publish --tag=passport-config
```

설정 파일을 퍼블리시한 후, 다음과 같이 애플리케이션의 암호화 키를 환경 변수로 지정해 Passport에서 읽어들이도록 할 수 있습니다:

```ini
PASSPORT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
<private key here>
-----END RSA PRIVATE KEY-----"

PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
<public key here>
-----END PUBLIC KEY-----"
```

<a name="migration-customization"></a>
### 마이그레이션 커스터마이즈

Passport의 기본 마이그레이션을 사용하지 않고 자체 마이그레이션을 정의하고 싶다면, `App\Providers\AppServiceProvider` 클래스의 `register` 메서드에서 `Passport::ignoreMigrations`를 호출하면 됩니다. 기본 마이그레이션은 아래와 같이 `vendor:publish` 명령으로 내보낼 수 있습니다:

```shell
php artisan vendor:publish --tag=passport-migrations
```

<a name="upgrading-passport"></a>
### 패스포트 업그레이드

Passport의 메이저 버전을 업그레이드할 때는, 반드시 [업그레이드 가이드](https://github.com/laravel/passport/blob/master/UPGRADE.md)를 꼼꼼히 확인하시기 바랍니다.

<a name="configuration"></a>
## 설정

<a name="client-secret-hashing"></a>
### 클라이언트 시크릿 해싱

클라이언트 시크릿 값을 데이터베이스에 저장할 때 해싱 처리하고 싶다면, `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 `Passport::hashClientSecrets`를 호출하면 됩니다:

```
use Laravel\Passport\Passport;

Passport::hashClientSecrets();
```

이 기능을 활성화하면, 각 클라이언트 생성 직후에만 해시되지 않은(본문 그대로의) 시크릿 값을 확인할 수 있습니다. 평문 시크릿 값이 데이터베이스에 저장되지 않으므로, 시크릿 값을 분실했을 경우 복구는 불가능합니다.

<a name="token-lifetimes"></a>
### 토큰 유효 기간

기본적으로, Passport는 만료 기간이 1년인 장수명 액세스 토큰을 발급합니다. 토큰의 만료 기간을 더 길거나 짧게 조정하려면, `tokensExpireIn`, `refreshTokensExpireIn`, `personalAccessTokensExpireIn` 메서드를 사용할 수 있습니다. 이 메서드들은 보통 애플리케이션의 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 호출합니다:

```
/**
 * Register any authentication / authorization services.
 */
public function boot(): void
{
    Passport::tokensExpireIn(now()->addDays(15));
    Passport::refreshTokensExpireIn(now()->addDays(30));
    Passport::personalAccessTokensExpireIn(now()->addMonths(6));
}
```

> [!NOTE]
> Passport 데이터베이스 테이블의 `expires_at` 컬럼은 읽기 전용이며, 표시용으로만 사용됩니다. 토큰 발급 시, 만료 정보는 서명되고 암호화된 토큰 내부에 저장됩니다. 토큰을 무효화하려면 [토큰을 취소(폐기)](#revoking-tokens)해야 합니다.

<a name="overriding-default-models"></a>
### 기본 모델 오버라이드

Passport에서 내부적으로 사용하는 모델을 직접 확장(상속)해서 모델을 교체할 수 있습니다. 예를 들어, 여러분만의 모델을 만든 후, Passport가 해당 모델을 사용하도록 할 수 있습니다.

```
use Laravel\Passport\Client as PassportClient;

class Client extends PassportClient
{
    // ...
}
```

모델을 정의한 후, `Laravel\Passport\Passport` 클래스를 통해 커스텀 모델을 Passport에 등록하면 됩니다. 보통은 애플리케이션의 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 Passport에 모델을 등록합니다.

```
use App\Models\Passport\AuthCode;
use App\Models\Passport\Client;
use App\Models\Passport\PersonalAccessClient;
use App\Models\Passport\RefreshToken;
use App\Models\Passport\Token;

/**
 * Register any authentication / authorization services.
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

Passport에서 미리 정의한 라우트를 직접 커스터마이즈하고 싶을 때가 있습니다. 이 경우 먼저, 애플리케이션의 `AppServiceProvider`의 `register` 메서드에 `Passport::ignoreRoutes`를 추가하여 Passport가 라우트를 등록하지 않도록 해야 합니다.

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

그 다음, [Passport의 라우트 파일](https://github.com/laravel/passport/blob/11.x/routes/web.php)에 정의된 라우트를 애플리케이션의 `routes/web.php`로 복사해서 자유롭게 변경할 수 있습니다.

```
Route::group([
    'as' => 'passport.',
    'prefix' => config('passport.path', 'oauth'),
    'namespace' => '\Laravel\Passport\Http\Controllers',
], function () {
    // Passport 라우트...
});
```

<a name="issuing-access-tokens"></a>
## 액세스 토큰 발급

대부분의 개발자들이 OAuth2에서 익숙하게 사용하는 방식이 바로 인증 코드(authorization codes)를 통한 방식입니다. 인증 코드를 사용할 때는, 클라이언트 애플리케이션이 사용자를 여러분의 서버로 리다이렉트 시키고, 사용자는 클라이언트에 액세스 토큰 제공을 승인하거나 거부하게 됩니다.

<a name="managing-clients"></a>
### 클라이언트 관리

여러분의 애플리케이션에 API로 접근하려는 외부 애플리케이션을 개발하는 개발자는, 반드시 자신의 애플리케이션을 여러분의 서비스에 "클라이언트"로 등록해야 합니다. 일반적으로, 애플리케이션 이름과, 사용자가 인가를 승인한 뒤에 리다이렉트될 URL 정보를 제공해야 합니다.

<a name="the-passportclient-command"></a>
#### `passport:client` 명령어

클라이언트를 가장 쉽게 생성하는 방법은 `passport:client` 아티즌 명령어를 사용하는 것입니다. 이 명령어로 OAuth2 기능을 테스트하기 위해 직접 클라이언트를 만들 수 있습니다. 명령어를 실행하면, Passport가 클라이언트에 대한 추가 정보를 물어본 뒤 클라이언트 ID와 시크릿을 발급해줍니다.

```shell
php artisan passport:client
```

**리다이렉트 URL**

클라이언트에 여러 리다이렉트 URL을 허용하고 싶다면, `passport:client` 명령어를 실행할 때 URL 입력란에 콤마(,)로 구분해서 여러 주소를 입력하면 됩니다. 만약 URL 자체에 콤마가 포함되어 있다면, 반드시 URL 인코딩을 해주어야 합니다.

```shell
http://example.com/callback,http://examplefoo.com/callback
```

<a name="clients-json-api"></a>
#### JSON API

애플리케이션의 일반 사용자는 `client` 명령어를 사용할 수 없기 때문에, Passport는 클라이언트 관리에 활용할 수 있는 JSON API도 제공합니다. 이 API를 사용하면, 직접 컨트롤러를 만들어서 생성/수정/삭제 기능을 구현할 필요 없이 클라이언트를 관리할 수 있습니다.

다만, Passport의 JSON API와 프론트엔드를 연동해서, 사용자가 클라이언트를 직접 관리할 수 있는 대시보드를 만들어줘야 합니다. 아래에서는 각 엔드포인트 별로 클라이언트 관리에 사용되는 API를 정리합니다. 예제에서는 [Axios](https://github.com/axios/axios)를 사용해 HTTP 요청 예시를 보여줍니다.

JSON API는 반드시 `web` 미들웨어와 `auth` 미들웨어를 통과해야 하므로, 반드시 여러분의 애플리케이션 내부에서만 호출할 수 있습니다. 외부 애플리케이션이나 사용자는 접근할 수 없습니다.

<a name="get-oauthclients"></a>
#### `GET /oauth/clients`

이 라우트는 인증된 사용자가 생성한 모든 클라이언트 목록을 반환합니다. 클라이언트 관리 대시보드에서 사용자가 클라이언트를 확인, 편집, 삭제할 때 주로 활용됩니다.

```js
axios.get('/oauth/clients')
    .then(response => {
        console.log(response.data);
    });
```

<a name="post-oauthclients"></a>
#### `POST /oauth/clients`

이 엔드포인트는 새로운 클라이언트를 생성할 때 사용합니다. 반드시 클라이언트의 `name`과 `redirect` URL 두 가지 정보가 필요합니다. `redirect` URL은 사용자가 인가 요청을 승인 또는 거부한 뒤에 이동할 주소입니다.

클라이언트가 생성되면, 클라이언트 ID와 시크릿이 발급됩니다. 이 값들은 여러분이 토큰을 요청할 때 사용됩니다. API는 생성된 클라이언트 객체를 반환합니다.

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
        // 오류 목록 표시...
    });
```

<a name="put-oauthclientsclient-id"></a>
#### `PUT /oauth/clients/{client-id}`

클라이언트 정보를 수정할 때 사용하는 엔드포인트입니다. 마찬가지로 `name`과 `redirect` URL이 필요하며, API는 변경된 클라이언트 객체를 반환합니다.

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
        // 오류 목록 표시...
    });
```

<a name="delete-oauthclientsclient-id"></a>
#### `DELETE /oauth/clients/{client-id}`

이 엔드포인트는 클라이언트를 삭제할 때 사용합니다.

```js
axios.delete('/oauth/clients/' + clientId)
    .then(response => {
        // ...
    });
```

<a name="requesting-tokens"></a>
### 토큰 요청

<a name="requesting-tokens-redirecting-for-authorization"></a>
#### 인가를 위한 리다이렉트

클라이언트를 생성한 후, 개발자는 해당 클라이언트의 ID, 시크릿을 사용해 인증 코드 및 액세스 토큰을 요청할 수 있습니다. 우선, 소비 애플리케이션에서 여러분의 애플리케이션 `/oauth/authorize` 라우트로 리다이렉트 요청을 보냅니다.

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
        // 'prompt' => '', // "none", "consent", 혹은 "login"
    ]);

    return redirect('http://passport-app.test/oauth/authorize?'.$query);
});
```

`prompt` 파라미터는 Passport 애플리케이션의 인증 행동 방식을 지정할 때 사용할 수 있습니다.

* `prompt` 값이 `none`이면, 사용자가 아직 Passport에 인증되어 있지 않을 경우 무조건 인증 에러가 발생합니다.
* 값이 `consent`라면, 이미 모든 스코프가 허가된 경우라도 인가 승인 화면을 반드시 표시합니다.
* `login`이면, 기존에 세션이 있어도 무조건 재로그인을 요청합니다.

`prompt` 값을 명시하지 않으면, 사용자가 해당 스코프에 대해 이전에 인가하지 않았다면 인가 화면이 표시되며, 이미 인가했다면 별도의 승인은 필요하지 않습니다.

> [!NOTE]
> `/oauth/authorize` 라우트는 Passport에서 이미 등록되어 있으니, 별도로 정의할 필요가 없습니다.

<a name="approving-the-request"></a>
#### 인가 요청 승인

인가 요청을 수신하면, Passport는 `prompt` 파라미터 값에 따라 동작하며(존재하는 경우), 사용자에게 인가 화면을 보여주거나 자동으로 승인/거부 응답을 처리합니다. 사용자가 요청을 승인하면, 클라이언트가 설정한 `redirect_uri`로 리다이렉트 됩니다. 이때 `redirect_uri`는 클라이언트 생성 시 등록한 `redirect` URL과 일치해야 합니다.

인가 승인 화면을 직접 커스터마이즈하고 싶을 때는, Passport 뷰 파일을 아래 명령어로 퍼블리시할 수 있습니다. 뷰는 `resources/views/vendor/passport` 디렉터리에 복사됩니다.

```shell
php artisan vendor:publish --tag=passport-views
```

일부 상황에서는, 예를 들어 1차 클라이언트(자신이 만든 서비스 등)에 대해 인가 알림을 생략하고 싶을 수도 있습니다. 이 경우 [Client 모델을 확장](#overriding-default-models)한 뒤, `skipsAuthorization` 메서드를 정의해서 true를 반환하도록 설정할 수 있습니다. 단, 인가 시점에 클라이언트에서 `prompt` 파라미터를 명시한 경우라면 이 동작이 무시됩니다.

```
<?php

namespace App\Models\Passport;

use Laravel\Passport\Client as BaseClient;

class Client extends BaseClient
{
    /**
     * 클라이언트가 인가 화면을 건너뛰어도 되는지 여부를 결정합니다.
     */
    public function skipsAuthorization(): bool
    {
        return $this->firstParty();
    }
}
```

<a name="requesting-tokens-converting-authorization-codes-to-access-tokens"></a>
#### 인증 코드를 액세스 토큰으로 변환

사용자가 인가 요청을 승인하면, Passport는 소비 애플리케이션의 `redirect_uri`로 리다이렉트합니다. 소비 애플리케이션에서는 먼저 `state` 파라미터를 리다이렉트 전 저장한 값과 대조(검증)해야 합니다. 상태값이 일치하면, 애플리케이션이 여러분의 서버로 `POST` 요청을 보내 액세스 토큰을 요청할 수 있습니다. 이때, 사용자가 인가 요청을 승인할 때 발급된 인증 코드도 함께 전달해야 합니다.

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

`/oauth/token` 라우트는 `access_token`, `refresh_token`, `expires_in` 속성이 포함된 JSON 응답을 반환합니다. 이 중 `expires_in`은 액세스 토큰이 만료되기까지 남은 초를 의미합니다.

> [!NOTE]
> `/oauth/token` 라우트도 Passport에서 이미 정의되어 있으니, 별도로 추가할 필요가 없습니다.

<a name="tokens-json-api"></a>
#### JSON API

Passport는 인가된 액세스 토큰을 관리할 수 있도록 별도의 JSON API도 제공합니다. 이 API를 이용해 여러분만의 프론트엔드와 연동하여, 사용자가 자신의 액세스 토큰을 직접 관리할 수 있는 대시보드를 구축할 수 있습니다. 아래 예시에서도 [Axios](https://github.com/mzabriskie/axios)로 엔드포인트에 요청을 보내는 방법을 안내합니다. 이 API 역시 `web` 및 `auth` 미들웨어로 보호되므로, 반드시 애플리케이션 내부에서만 호출할 수 있습니다.

<a name="get-oauthtokens"></a>
#### `GET /oauth/tokens`

이 라우트는 인증된 사용자가 생성한 모든 인가된 액세스 토큰의 목록을 반환합니다. 사용자가 자신의 토큰을 확인, 폐기할 수 있도록 리스트를 만드는 데 유용합니다.

```js
axios.get('/oauth/tokens')
    .then(response => {
        console.log(response.data);
    });
```

<a name="delete-oauthtokenstoken-id"></a>
#### `DELETE /oauth/tokens/{token-id}`

이 라우트는 인가된 액세스 토큰과 관련된 리프레시 토큰까지 함께 취소(폐기)할 때 사용할 수 있습니다.

```js
axios.delete('/oauth/tokens/' + tokenId);
```

<a name="refreshing-tokens"></a>
### 토큰 갱신

만약 애플리케이션에서 단기 유효 액세스 토큰(짧은 만료 기간)을 발급한다면, 사용자는 액세스 토큰이 만료될 때마다 발급 시 함께 제공된 리프레시 토큰을 활용해 토큰을 갱신해야 합니다.

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

`/oauth/token` 라우트는 다시 한 번, `access_token`, `refresh_token`, `expires_in` 속성이 포함된 JSON 응답을 반환합니다. `expires_in`은 토큰 만료까지 남은 초를 나타냅니다.

<a name="revoking-tokens"></a>
### 토큰 취소

토큰을 폐기하고 싶을 때는 `Laravel\Passport\TokenRepository`의 `revokeAccessToken` 메서드를 사용할 수 있습니다. 특정 액세스 토큰에 연결된 리프레시 토큰도 같이 폐기하고 싶을 때는, `Laravel\Passport\RefreshTokenRepository`의 `revokeRefreshTokensByAccessTokenId` 메서드를 사용할 수 있습니다. 이 클래스들은 라라벨의 [서비스 컨테이너](/docs/10.x/container)에서 바로 주입받을 수 있습니다.

```
use Laravel\Passport\TokenRepository;
use Laravel\Passport\RefreshTokenRepository;

$tokenRepository = app(TokenRepository::class);
$refreshTokenRepository = app(RefreshTokenRepository::class);

// 액세스 토큰 폐기...
$tokenRepository->revokeAccessToken($tokenId);

// 해당 액세스 토큰의 리프레시 토큰 전부 폐기...
$refreshTokenRepository->revokeRefreshTokensByAccessTokenId($tokenId);
```

<a name="purging-tokens"></a>

### 토큰 정리

토큰이 폐기되었거나 만료된 경우, 데이터베이스에서 해당 토큰을 정리하고 싶을 수 있습니다. Passport에 포함된 `passport:purge` 아티즌 명령어를 사용해 이 작업을 수행할 수 있습니다.

```shell
# 폐기 및 만료된 토큰과 인증 코드를 정리합니다...
php artisan passport:purge

# 6시간 이상 만료된 토큰만 정리합니다...
php artisan passport:purge --hours=6

# 폐기된 토큰과 인증 코드만 정리합니다...
php artisan passport:purge --revoked

# 만료된 토큰과 인증 코드만 정리합니다...
php artisan passport:purge --expired
```

또한, 애플리케이션의 `App\Console\Kernel` 클래스에서 [스케줄러 작업](/docs/10.x/scheduling)을 설정하여 토큰 정리를 자동화할 수 있습니다.

```
/**
 * 애플리케이션의 명령어 스케줄을 정의합니다.
 */
protected function schedule(Schedule $schedule): void
{
    $schedule->command('passport:purge')->hourly();
}
```

<a name="code-grant-pkce"></a>
## PKCE를 활용한 인증 코드 그랜트

"Proof Key for Code Exchange"(PKCE)가 포함된 인증 코드 그랜트는, 싱글 페이지 애플리케이션(SPA)이나 네이티브 애플리케이션처럼 클라이언트 비밀을 안전하게 보관할 수 없는 경우, 또는 인가 코드가 공격자에게 가로채지는 것을 방지하고 싶을 때 안전하게 API를 인증할 수 있는 방식입니다. 이 방식에서는 클라이언트 비밀 대신, "코드 검증자(code verifier)"와 "코드 챌린지(code challenge)"의 조합을 사용하여 인가 코드를 액세스 토큰으로 교환합니다.

<a name="creating-a-auth-pkce-grant-client"></a>
### 클라이언트 생성

애플리케이션에서 PKCE가 적용된 인증 코드 그랜트를 통해 토큰을 발급하려면, 먼저 PKCE를 지원하는 클라이언트를 생성해야 합니다. `passport:client` 아티즌 명령어에 `--public` 옵션을 사용하여 생성할 수 있습니다.

```shell
php artisan passport:client --public
```

<a name="requesting-auth-pkce-grant-tokens"></a>
### 토큰 요청

<a name="code-verifier-code-challenge"></a>
#### 코드 검증자와 코드 챌린지

이 인증 방식은 클라이언트 비밀을 제공하지 않으므로, 개발자는 토큰을 요청할 때 코드 검증자와 코드 챌린지의 조합을 생성해야 합니다.

코드 검증자는 [RFC 7636 명세](https://tools.ietf.org/html/rfc7636)에 정의된 대로, 영문자와 숫자, 그리고 `"-"`, `"."`, `"_"`, `"~"` 문자를 포함한 43~128자 길이의 임의의 문자열이어야 합니다.

코드 챌린지는 URL 및 파일 이름에 안전한 문자로 이루어진 Base64 인코딩 문자열이어야 하며, 끝에 오는 `'='` 문자는 제거하고 줄바꿈, 공백 등 추가 문자가 없어야 합니다.

```
$encoded = base64_encode(hash('sha256', $code_verifier, true));

$codeChallenge = strtr(rtrim($encoded, '='), '+/', '-_');
```

<a name="code-grant-pkce-redirecting-for-authorization"></a>
#### 인가를 위한 리다이렉트

클라이언트가 생성되면, 클라이언트 ID와 위에서 생성한 코드 검증자 및 코드 챌린지를 이용해 인가 코드와 액세스 토큰을 요청할 수 있습니다. 먼저, 사용하는 애플리케이션에서 `/oauth/authorize` 경로로 리다이렉트 요청을 보냅니다.

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
#### 인가 코드를 액세스 토큰으로 변환

사용자가 인가 요청을 승인하면, 사용자는 다시 사용 애플리케이션으로 리다이렉트됩니다. 이때, 표준 인증 코드 그랜트와 마찬가지로, 사용자는 리다이렉트 전에 세션에 저장한 `state` 값을 확인해야 합니다.

`state` 값이 일치하면, 발급받은 인가 코드와 함께 처음 생성한 코드 검증자를 포함하여 애플리케이션에 `POST` 요청을 보내 액세스 토큰을 요청해야 합니다.

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
> 패스워드 그랜트 토큰 사용은 더 이상 권장하지 않습니다. 대신 [OAuth2 서버에서 공식적으로 권장하는 그랜트 타입](https://oauth2.thephpleague.com/authorization-server/which-grant/)을 선택하시기 바랍니다.

OAuth2 패스워드 그랜트를 통해, 모바일 애플리케이션과 같은 1차 애플리케이션에서 이메일 주소/사용자명과 비밀번호로 액세스 토큰을 받을 수 있습니다. 이 방법을 사용하면 사용자가 전체 OAuth2 인증 코드 리다이렉트 과정을 거치지 않고도, 1차 애플리케이션에 안전하게 액세스 토큰을 발급할 수 있습니다.

<a name="creating-a-password-grant-client"></a>
### 패스워드 그랜트 클라이언트 생성

패스워드 그랜트를 통해 토큰을 발급하려면, 먼저 패스워드 그랜트 클라이언트를 만들어야 합니다. `passport:client` 아티즌 명령어에 `--password` 옵션을 사용해 생성할 수 있습니다. **이미 `passport:install` 명령어를 실행했다면 이 명령어는 다시 실행할 필요가 없습니다.**

```shell
php artisan passport:client --password
```

<a name="requesting-password-grant-tokens"></a>
### 토큰 요청

패스워드 그랜트 클라이언트를 생성하였다면, 사용자의 이메일 주소와 비밀번호를 포함하여 `/oauth/token` 경로에 `POST` 요청을 보내 액세스 토큰을 요청할 수 있습니다. 이 경로는 Passport에서 이미 등록되어 있으므로, 별도로 정의할 필요가 없습니다. 요청이 성공하면, 서버의 JSON 응답에서 `access_token`과 `refresh_token`을 받을 수 있습니다.

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
> 액세스 토큰은 기본적으로 만료 기간이 깁니다. 필요한 경우 [최대 액세스 토큰 만료 시간을 직접 설정](#configuration)할 수 있습니다.

<a name="requesting-all-scopes"></a>
### 모든 스코프 요청

패스워드 그랜트나 클라이언트 자격 증명 그랜트(client credentials grant)를 사용할 때, 애플리케이션에서 지원하는 모든 스코프에 대해 토큰을 발급하고 싶을 수 있습니다. 이때는 `*` 스코프를 요청하면 됩니다. `*` 스코프를 요청하면, 토큰 인스턴스의 `can` 메서드는 항상 `true`를 반환하게 됩니다. 이 스코프는 오직 `password` 또는 `client_credentials` 그랜트로 발급된 토큰에만 할당할 수 있습니다.

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
### 사용자 프로바이더 커스터마이징

애플리케이션에서 여러 [인증 사용자 프로바이더](/docs/10.x/authentication#introduction)를 사용하는 경우, `artisan passport:client --password` 명령을 실행할 때 `--provider` 옵션을 지정하여 패스워드 그랜트 클라이언트가 사용할 프로바이더를 정할 수 있습니다. 지정한 프로바이더 이름은 `config/auth.php` 설정 파일에 정의된 올바른 프로바이더와 일치해야 합니다. 그 후, [미들웨어로 라우트를 보호](#via-middleware)하여 해당 guard의 프로바이더로부터 인증된 사용자만 접근할 수 있도록 할 수 있습니다.

<a name="customizing-the-username-field"></a>
### 사용자명 필드 커스터마이징

패스워드 그랜트 인증시, Passport는 기본적으로 인증 가능한 모델의 `email` 속성을 "사용자명"으로 사용합니다. 그러나 이 동작을 커스터마이즈하려면, 모델에 `findForPassport` 메서드를 정의하세요.

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
     * 주어진 사용자명에 해당하는 사용자 인스턴스를 찾습니다.
     */
    public function findForPassport(string $username): User
    {
        return $this->where('username', $username)->first();
    }
}
```

<a name="customizing-the-password-validation"></a>
### 비밀번호 검증 커스터마이징

패스워드 그랜트 인증시 Passport는 모델의 `password` 속성을 사용해 비밀번호를 검증합니다. 모델에 `password` 속성이 없거나, 비밀번호 검증 방식을 커스터마이징하고 싶을 경우, 모델에 `validateForPassportPasswordGrant` 메서드를 정의할 수 있습니다.

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
     * Passport 패스워드 그랜트에서 사용자의 비밀번호를 검증합니다.
     */
    public function validateForPassportPasswordGrant(string $password): bool
    {
        return Hash::check($password, $this->password);
    }
}
```

<a name="implicit-grant-tokens"></a>
## 임플리시트(Implicit) 그랜트 토큰

> [!WARNING]
> 임플리시트 그랜트 토큰 사용은 더 이상 권장하지 않습니다. 대신 [OAuth2 서버에서 공식적으로 권장하는 그랜트 타입](https://oauth2.thephpleague.com/authorization-server/which-grant/)을 사용하세요.

임플리시트(Implicit) 그랜트는 인증 코드 그랜트와 비슷하지만, 인가 코드를 교환하는 절차 없이 바로 토큰이 클라이언트로 반환됩니다. 이 방식은 클라이언트 비밀을 안전하게 저장할 수 없는 JavaScript 또는 모바일 애플리케이션에서 주로 사용됩니다. 이 방식을 활성화하려면, 애플리케이션의 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 `enableImplicitGrant` 메서드를 호출하세요.

```
/**
 * 인증 및 인가 서비스를 등록합니다.
 */
public function boot(): void
{
    Passport::enableImplicitGrant();
}
```

임플리시트 그랜트가 활성화된 후, 개발자는 클라이언트 ID를 활용해 애플리케이션에 액세스 토큰을 요청할 수 있습니다. 사용하는 애플리케이션에서는 `/oauth/authorize` 경로로 리다이렉트 요청을 아래와 같이 보냅니다.

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
> `/oauth/authorize` 경로는 Passport에서 이미 정의되어 있으므로 별도로 정의할 필요가 없습니다.

<a name="client-credentials-grant-tokens"></a>
## 클라이언트 자격 증명 그랜트 토큰(Client Credentials Grant Tokens)

클라이언트 자격 증명 그랜트는 머신끼리의 인증에 적합합니다. 예를 들어, 스케줄된 작업이 API를 통해 유지보수 작업을 수행할 때 이 그랜트를 사용할 수 있습니다.

이 그랜트를 통해 토큰을 발급하려면, 먼저 클라이언트 자격 증명 그랜트 클라이언트를 생성해야 합니다. `passport:client` 아티즌 명령어의 `--client` 옵션을 사용하면 생성할 수 있습니다.

```shell
php artisan passport:client --client
```

다음으로, 이 그랜트 타입을 사용하려면, 애플리케이션의 `app/Http/Kernel.php` 파일의 `$middlewareAliases` 속성에 `CheckClientCredentials` 미들웨어를 등록합니다.

```
use Laravel\Passport\Http\Middleware\CheckClientCredentials;

protected $middlewareAliases = [
    'client' => CheckClientCredentials::class,
];
```

이제 해당 미들웨어를 라우트에 적용합니다.

```
Route::get('/orders', function (Request $request) {
    ...
})->middleware('client');
```

특정 스코프에 대해서만 접근을 허용하고 싶다면, 라우트에 `client` 미들웨어를 적용할 때 쉼표로 구분된 필요한 스코프 목록을 지정할 수 있습니다.

```
Route::get('/orders', function (Request $request) {
    ...
})->middleware('client:check-status,your-scope');
```

<a name="retrieving-tokens"></a>
### 토큰 가져오기

이 그랜트 타입으로 토큰을 받으려면, `oauth/token` 엔드포인트로 요청을 보내면 됩니다.

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

경우에 따라 사용자가 인가 코드 리다이렉트 흐름을 거치지 않고 직접 자신의 액세스 토큰을 발급받고 싶어할 수 있습니다. 사용자에게 애플리케이션의 UI를 통해 직접 토큰을 발급하게 하면, API 테스트 또는 보다 간편하게 액세스 토큰을 발급하고자 할 때 유용할 수 있습니다.

> [!NOTE]
> 애플리케이션이 주로 개인 액세스 토큰 발급 용도로 Passport를 사용한다면, 라라벨의 경량 1차 API 토큰 라이브러리인 [Laravel Sanctum](/docs/10.x/sanctum) 사용을 고려해보세요.

<a name="creating-a-personal-access-client"></a>
### 개인 액세스 클라이언트 생성

개인 액세스 토큰을 발급하려면, 먼저 개인 액세스 클라이언트를 생성해야 합니다. `passport:client` 아티즌 명령어의 `--personal` 옵션을 사용해 생성할 수 있습니다. 이미 `passport:install` 명령어를 실행했다면 이 명령어는 다시 실행할 필요가 없습니다.

```shell
php artisan passport:client --personal
```

개인 액세스 클라이언트를 생성한 후, 해당 클라이언트의 ID와 평문 비밀 값을 애플리케이션의 `.env` 파일에 아래와 같이 설정해 주세요.

```ini
PASSPORT_PERSONAL_ACCESS_CLIENT_ID="client-id-value"
PASSPORT_PERSONAL_ACCESS_CLIENT_SECRET="unhashed-client-secret-value"
```

<a name="managing-personal-access-tokens"></a>
### 개인 액세스 토큰 관리

개인 액세스 클라이언트를 생성했으면, `App\Models\User` 모델 인스턴스의 `createToken` 메서드를 사용해 사용자를 위한 토큰을 발급할 수 있습니다. `createToken` 메서드는 토큰 이름을 첫 번째 인수로, [스코프](#token-scopes) 배열(옵션)을 두 번째 인수로 받을 수 있습니다.

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

Passport는 개인 액세스 토큰을 관리할 수 있는 JSON API도 제공합니다. 이를 프론트엔드와 연동하면, 사용자에게 손쉽게 개인 액세스 토큰을 관리하는 대시보드를 제공할 수 있습니다. 아래에서는 이 API 엔드포인트들을 Axios를 활용한 예시와 함께 소개합니다.

이 JSON API는 `web` 및 `auth` 미들웨어에 의해 보호되므로, 오직 자체 애플리케이션에서만 호출할 수 있습니다. 외부에서 직접 호출할 수는 없습니다.

<a name="get-oauthscopes"></a>
#### `GET /oauth/scopes`

이 경로는 애플리케이션에 정의된 모든 [스코프](#token-scopes)를 반환합니다. 사용자가 개인 액세스 토큰에 부여할 수 있는 스코프 목록을 표시할 때 활용할 수 있습니다.

```js
axios.get('/oauth/scopes')
    .then(response => {
        console.log(response.data);
    });
```

<a name="get-oauthpersonal-access-tokens"></a>
#### `GET /oauth/personal-access-tokens`

이 경로는 인증된 사용자가 생성한 모든 개인 액세스 토큰을 반환합니다. 주로 사용자가 본인의 토큰을 조회하거나, 수정·폐기할 수 있도록 목록을 제공할 때 사용합니다.

```js
axios.get('/oauth/personal-access-tokens')
    .then(response => {
        console.log(response.data);
    });
```

<a name="post-oauthpersonal-access-tokens"></a>
#### `POST /oauth/personal-access-tokens`

이 경로는 새로운 개인 액세스 토큰을 생성합니다. 요청 시 토큰의 `name`과 해당 토큰에 부여할 `scopes` 데이터가 필요합니다.

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
        // 응답에 포함된 에러를 나열...
    });
```

<a name="delete-oauthpersonal-access-tokenstoken-id"></a>
#### `DELETE /oauth/personal-access-tokens/{token-id}`

이 경로는 개인 액세스 토큰을 폐기(삭제)할 때 사용합니다.

```js
axios.delete('/oauth/personal-access-tokens/' + tokenId);
```

<a name="protecting-routes"></a>
## 라우트 보호

<a name="via-middleware"></a>
### 미들웨어를 통한 보호

Passport에는 요청이 들어왓을 때 액세스 토큰을 검증해주는 [인증 가드](/docs/10.x/authentication#adding-custom-guards)가 포함되어 있습니다. `api` 가드를 `passport` 드라이버로 설정한 경우, 유효한 액세스 토큰이 필요한 라우트에 `auth:api` 미들웨어만 지정하면 됩니다.

```
Route::get('/user', function () {
    // ...
})->middleware('auth:api');
```

> [!WARNING]
> [클라이언트 자격 증명 그랜트](#client-credentials-grant-tokens)를 사용하는 경우, 해당 라우트 보호에는 `auth:api` 미들웨어 대신 [클라이언트 미들웨어](#client-credentials-grant-tokens)를 사용해야 합니다.

<a name="multiple-authentication-guards"></a>
#### 복수 인증 가드

애플리케이션에서 서로 다른 Eloquent 모델을 사용하는 여러 종류의 사용자를 인증해야 한다면, 각 사용자 프로바이더 유형별로 가드 설정을 따로 정의해야 할 수 있습니다. 이를 통해 특정 사용자 프로바이더에 맞춘 요청만 보호할 수 있습니다. 예를 들어, `config/auth.php`에 아래와 같이 가드 설정이 있을 때:

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

아래 라우트는 `customers` 사용자 프로바이더를 사용하는 `api-customers` 가드를 통해 인증된 요청만 허용합니다.

```
Route::get('/customer', function () {
    // ...
})->middleware('auth:api-customers');
```

> [!NOTE]
> Passport에서 여러 사용자(providers)를 사용하는 방법에 대한 자세한 내용은 [패스워드 그랜트 문서](#customizing-the-user-provider)를 참고하세요.

<a name="passing-the-access-token"></a>
### 액세스 토큰 전달하기

Passport로 보호된 라우트에 요청을 보낼 때, API 클라이언트는 요청의 `Authorization` 헤더에 액세스 토큰을 `Bearer` 토큰으로 지정해야 합니다. 예를 들어 Guzzle HTTP 라이브러리를 사용할 때는 다음과 같이 요청합니다.

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

스코프는 API 클라이언트가 계정 접근 권한을 요청할 때, 어떤 권한이 필요한지 구체적으로 지정할 수 있게 합니다. 예를 들어, 이커머스 애플리케이션에서 모든 API 소비자가 주문을 생성할 필요는 없습니다. 대신, 주문 발송 상태만 조회할 권한을 요청하도록 제한할 수 있습니다. 즉, 스코프를 활용해 사용자는 제3자 애플리케이션이 자신을 대신해 할 수 있는 작업의 범위를 제한할 수 있습니다.

<a name="defining-scopes"></a>
### 스코프 정의

API의 스코프는 애플리케이션의 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 `Passport::tokensCan` 메서드를 사용해 정의할 수 있습니다. `tokensCan` 메서드에는 스코프 이름과 설명(사용자에게 표시될 내용)을 배열로 지정합니다.

```
/**
 * 인증 및 인가 서비스를 등록합니다.
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
### 기본 스코프 설정

클라이언트에서 특정 스코프를 요청하지 않은 경우, Passport 서버가 토큰에 기본 스코프를 부여하도록 `setDefaultScope` 메서드로 설정할 수 있습니다. 보통 이 메서드는 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 호출합니다.

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
> Passport의 기본 스코프 설정은 사용자가 직접 발급한 개인 액세스 토큰에는 적용되지 않습니다.

<a name="assigning-scopes-to-tokens"></a>

### 토큰에 스코프 할당하기

<a name="when-requesting-authorization-codes"></a>
#### 인가 코드 요청 시

Authorization Code Grant를 사용하여 액세스 토큰을 요청할 때, 소비자는 원하는 스코프를 `scope` 쿼리 문자열 파라미터로 지정해야 합니다. `scope` 파라미터에는 스코프 이름을 공백으로 구분하여 나열해야 합니다.

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

`App\Models\User` 모델의 `createToken` 메서드를 사용해서 개인 액세스 토큰을 발급할 때는, 두 번째 인수로 원하는 스코프들을 배열로 전달할 수 있습니다.

```
$token = $user->createToken('My Token', ['place-orders'])->accessToken;
```

<a name="checking-scopes"></a>
### 스코프 확인하기

Passport에는 들어오는 요청이 주어진 스코프로 발급받은 토큰으로 인증되었는지 확인해주는 두 가지 미들웨어가 포함되어 있습니다. 먼저, 아래와 같이 `app/Http/Kernel.php` 파일의 `$middlewareAliases` 속성에 미들웨어를 등록해야 합니다.

```
'scopes' => \Laravel\Passport\Http\Middleware\CheckScopes::class,
'scope' => \Laravel\Passport\Http\Middleware\CheckForAnyScope::class,
```

<a name="check-for-all-scopes"></a>
#### 모든 스코프 확인

`scopes` 미들웨어를 라우트에 지정하면, 들어오는 요청의 액세스 토큰이 나열된 모든 스코프를 가지고 있는지 확인할 수 있습니다.

```
Route::get('/orders', function () {
    // 액세스 토큰에 "check-status", "place-orders" 스코프 모두가 존재
})->middleware(['auth:api', 'scopes:check-status,place-orders']);
```

<a name="check-for-any-scopes"></a>
#### 어느 하나의 스코프라도 확인

`scope` 미들웨어를 라우트에 지정하면, 들어오는 요청의 액세스 토큰이 나열된 스코프 중 *하나 이상*을 가지고 있는지 확인할 수 있습니다.

```
Route::get('/orders', function () {
    // 액세스 토큰에 "check-status" 또는 "place-orders" 중 하나 이상의 스코프가 존재
})->middleware(['auth:api', 'scope:check-status,place-orders']);
```

<a name="checking-scopes-on-a-token-instance"></a>
#### 토큰 인스턴스에서 스코프 확인

액세스 토큰으로 인증된 요청이 애플리케이션 안으로 들어온 후에도, 인증된 `App\Models\User` 인스턴스의 `tokenCan` 메서드를 사용해 해당 토큰에 특정 스코프가 포함되어 있는지 추가로 확인할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    if ($request->user()->tokenCan('place-orders')) {
        // ...
    }
});
```

<a name="additional-scope-methods"></a>
#### 추가 스코프 관련 메서드

`scopeIds` 메서드는 정의된 모든 ID/이름의 배열을 반환합니다.

```
use Laravel\Passport\Passport;

Passport::scopeIds();
```

`scopes` 메서드는 `Laravel\Passport\Scope` 인스턴스 배열로 모든 정의된 스코프를 반환합니다.

```
Passport::scopes();
```

`scopesFor` 메서드는 전달된 ID/이름에 맞는 `Laravel\Passport\Scope` 인스턴스 배열을 반환합니다.

```
Passport::scopesFor(['place-orders', 'check-status']);
```

특정 스코프가 정의되어 있는지 확인하려면 `hasScope` 메서드를 사용할 수 있습니다.

```
Passport::hasScope('place-orders');
```

<a name="consuming-your-api-with-javascript"></a>
## JavaScript에서 API 사용하기

API를 구축할 때, JavaScript 애플리케이션에서 자신의 API를 직접 소비할 수 있다는 것은 매우 유용한 접근 방식입니다. 이렇게 하면 본인의 웹 애플리케이션, 모바일 앱, 서드파티 앱, 그리고 각종 패키지 관리자에서 배포하는 SDK가 하나의 API를 함께 사용할 수 있게 됩니다.

일반적으로 JavaScript 애플리케이션에서 자신의 API를 호출할 때에는 직접 액세스 토큰을 전달하고, 이 토큰을 모든 요청마다 포함해야 합니다. 하지만 Passport는 이를 자동으로 처리할 수 있는 미들웨어를 제공합니다. 즉, `app/Http/Kernel.php` 파일의 `web` 미들웨어 그룹에 `CreateFreshApiToken` 미들웨어를 추가하면 됩니다.

```
'web' => [
    // 기타 미들웨어...
    \Laravel\Passport\Http\Middleware\CreateFreshApiToken::class,
],
```

> [!NOTE]
> `CreateFreshApiToken` 미들웨어가 반드시 미들웨어 스택의 마지막에 위치해야 합니다.

이 미들웨어는 응답에 `laravel_token`이라는 쿠키를 자동으로 추가합니다. 이 쿠키에는 Passport에서 인증에 사용하는 암호화된 JWT가 들어 있습니다. JWT의 유효 기간은 `session.lifetime` 설정 값과 동일합니다. 브라우저가 이 쿠키를 자동으로 모든 후속 요청에 포함하기 때문에, API를 호출할 때 액세스 토큰을 명시적으로 전달할 필요가 없습니다.

```
axios.get('/api/user')
    .then(response => {
        console.log(response.data);
    });
```

<a name="customizing-the-cookie-name"></a>
#### 쿠키 이름 커스터마이즈

필요하다면, `Passport::cookie` 메서드를 사용하여 `laravel_token` 쿠키 이름을 커스터마이즈할 수 있습니다. 이 메서드는 대개 애플리케이션의 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 호출합니다.

```
/**
 * Register any authentication / authorization services.
 */
public function boot(): void
{
    Passport::cookie('custom_name');
}
```

<a name="csrf-protection"></a>
#### CSRF 보호

이 인증 방식을 이용할 때는, 요청에 유효한 CSRF 토큰 헤더가 반드시 포함되어야 합니다. 기본 라라벨 JavaScript 스캐폴딩은 Axios 인스턴스를 포함하며, 이 인스턴스는 암호화된 `XSRF-TOKEN` 쿠키 값을 자동으로 읽어 같은 도메인 요청의 `X-XSRF-TOKEN` 헤더로 전송합니다.

> [!NOTE]
> 만약 `X-XSRF-TOKEN` 대신 `X-CSRF-TOKEN` 헤더를 보내고 싶다면, `csrf_token()`에서 제공하는 암호화되지 않은 토큰을 사용해야 합니다.

<a name="events"></a>
## 이벤트

Passport는 액세스 토큰 및 리프레시 토큰이 발급될 때 이벤트를 발생시킵니다. 이 이벤트들을 이용해 데이터베이스에 있는 다른 액세스 토큰을 정리하거나 폐기할 수 있습니다. 원한다면, 애플리케이션의 `App\Providers\EventServiceProvider` 클래스에 리스너를 연결할 수 있습니다.

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

Passport의 `actingAs` 메서드는 현재 인증된 사용자와, 그 토큰에 부여할 스코프를 지정할 수 있습니다. `actingAs` 메서드의 첫 번째 인수에는 유저 인스턴스를, 두 번째 인수에는 허용할 스코프 배열을 전달합니다.

```
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

Passport의 `actingAsClient` 메서드는 현재 인증된 클라이언트와, 그 토큰에 부여할 스코프를 지정할 수 있습니다. `actingAsClient` 메서드의 첫 번째 인수에는 클라이언트 인스턴스를, 두 번째 인수에는 허용할 스코프 배열을 전달합니다.

```
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