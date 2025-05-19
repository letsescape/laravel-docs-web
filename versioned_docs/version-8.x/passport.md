# 라라벨 패스포트 (Laravel Passport)

- [소개](#introduction)
    - [패스포트와 Sanctum 중 무엇을 사용할까?](#passport-or-sanctum)
- [설치](#installation)
    - [패스포트 배포](#deploying-passport)
    - [마이그레이션 커스터마이즈](#migration-customization)
    - [패스포트 업그레이드](#upgrading-passport)
- [설정](#configuration)
    - [클라이언트 시크릿 해싱](#client-secret-hashing)
    - [토큰 만료 시간 설정](#token-lifetimes)
    - [기본 모델 오버라이드](#overriding-default-models)
- [액세스 토큰 발급](#issuing-access-tokens)
    - [클라이언트 관리](#managing-clients)
    - [토큰 요청](#requesting-tokens)
    - [토큰 갱신](#refreshing-tokens)
    - [토큰 취소](#revoking-tokens)
    - [토큰 정리](#purging-tokens)
- [PKCE를 활용한 권한 코드 그랜트](#code-grant-pkce)
    - [클라이언트 생성](#creating-a-auth-pkce-grant-client)
    - [토큰 요청](#requesting-auth-pkce-grant-tokens)
- [패스워드 그랜트 토큰](#password-grant-tokens)
    - [패스워드 그랜트 클라이언트 생성](#creating-a-password-grant-client)
    - [토큰 요청](#requesting-password-grant-tokens)
    - [모든 스코프 요청](#requesting-all-scopes)
    - [User Provider 커스터마이즈](#customizing-the-user-provider)
    - [Username 필드 커스터마이즈](#customizing-the-username-field)
    - [비밀번호 검증 커스터마이즈](#customizing-the-password-validation)
- [임플리싯 그랜트 토큰](#implicit-grant-tokens)
- [클라이언트 크레덴셜 그랜트 토큰](#client-credentials-grant-tokens)
- [퍼스널 액세스 토큰](#personal-access-tokens)
    - [퍼스널 액세스 클라이언트 생성](#creating-a-personal-access-client)
    - [퍼스널 액세스 토큰 관리](#managing-personal-access-tokens)
- [라우트 보호](#protecting-routes)
    - [미들웨어 사용](#via-middleware)
    - [액세스 토큰 전달](#passing-the-access-token)
- [토큰 스코프](#token-scopes)
    - [스코프 정의](#defining-scopes)
    - [기본 스코프](#default-scope)
    - [토큰에 스코프 할당](#assigning-scopes-to-tokens)
    - [스코프 확인](#checking-scopes)
- [JavaScript로 API 사용하기](#consuming-your-api-with-javascript)
- [이벤트](#events)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

[라라벨 패스포트](https://github.com/laravel/passport)는 라라벨 애플리케이션을 위한 완전한 OAuth2 서버 구현을 몇 분 만에 구축할 수 있도록 해줍니다. Passport는 Andy Millington과 Simon Hamp가 관리하는 [League OAuth2 서버](https://github.com/thephpleague/oauth2-server) 위에 구축되어 있습니다.

> [!NOTE]
> 이 문서는 독자가 이미 OAuth2에 대해 어느 정도 알고 있다는 것을 전제로 작성되었습니다. OAuth2에 대해 전혀 모르실 경우, 계속 읽기 전에 먼저 일반적인 [용어 및 개념](https://oauth2.thephpleague.com/terminology/)을 익히시길 권장합니다.

<a name="passport-or-sanctum"></a>
### 패스포트와 Sanctum 중 무엇을 사용할까?

본격적으로 시작하기 전에, 여러분의 애플리케이션에 라라벨 패스포트와 [라라벨 Sanctum](/docs/8.x/sanctum) 중 어느 것이 더 적합할지 고민해볼 필요가 있습니다. 만약 애플리케이션이 반드시 OAuth2를 지원해야 한다면 Laravel Passport를 사용해야 합니다.

그러나 단일 페이지 애플리케이션(SPA), 모바일 앱, 또는 단순히 API 토큰 발급을 목적으로 인증 기능을 구현하려는 경우에는 [라라벨 Sanctum](/docs/8.x/sanctum)을 사용하는 것이 좋습니다. 라라벨 Sanctum은 OAuth2 프로토콜 자체는 지원하지 않지만, 훨씬 더 간단하게 API 인증을 개발할 수 있게 해줍니다.

<a name="installation"></a>
## 설치

먼저 Composer 패키지 매니저를 이용해 Passport를 설치합니다.

```
composer require laravel/passport
```

Passport의 [서비스 프로바이더](/docs/8.x/providers)는 자체 데이터베이스 마이그레이션 디렉터리를 등록하므로, 패키지 설치 후 데이터베이스 마이그레이션을 수행해야 합니다. Passport 마이그레이션은 애플리케이션이 OAuth2 클라이언트와 액세스 토큰을 저장하는 데 필요한 테이블들을 생성합니다.

```
php artisan migrate
```

다음으로 `passport:install` 아티즌 명령어를 실행합니다. 이 명령어는 보안 액세스 토큰 생성을 위한 암호화 키를 만듭니다. 또, "퍼스널 액세스" 및 "패스워드 그랜트" 클라이언트도 함께 생성되어, 액세스 토큰을 발급할 때 사용됩니다.

```
php artisan passport:install
```

> [!TIP]
> Passport의 `Client` 모델의 기본 키(primary key)를 auto-increment 정수 대신 UUID로 사용하고 싶다면, [아래 `uuids` 옵션](#client-uuids)을 참고해 설치하세요.

`passport:install` 명령어 실행 후, `App\Models\User` 모델에 `Laravel\Passport\HasApiTokens` 트레이트를 추가하세요. 이 트레이트는 인증된 사용자의 토큰 및 스코프를 검사할 수 있는 몇 가지 헬퍼 메서드를 제공합니다. 이미 `Laravel\Sanctum\HasApiTokens` 트레이트를 사용하고 있다면, 이제는 해당 트레이트를 제거해도 됩니다.

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

이제 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드 안에서 `Passport::routes` 메서드를 호출해야 합니다. 이 메서드는 액세스 토큰 발급∙취소, 클라이언트 관리, 퍼스널 액세스 토큰 관련 경로를 자동으로 등록합니다.

```
<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Laravel\Passport\Passport;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        if (! $this->app->routesAreCached()) {
            Passport::routes();
        }
    }
}
```

마지막으로, 애플리케이션의 `config/auth.php` 설정 파일에서 `api` 인증 가드의 `driver` 옵션을 `passport`로 설정합니다. 이제 애플리케이션은 API 요청 인증 시 Passport의 `TokenGuard`를 사용하게 됩니다.

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

`passport:install` 명령어에 `--uuids` 옵션을 붙여 실행하면, Passport의 `Client` 모델 기본 키 값이 auto-increment 정수 대신 UUID로 설정됩니다. 이 옵션과 함께 설치하면, Passport의 기본 마이그레이션 비활성화 관련 추가 지침이 표시됩니다.

```
php artisan passport:install --uuids
```

<a name="deploying-passport"></a>
### 패스포트 배포

애플리케이션 서버에 처음으로 Passport를 배포할 때는 `passport:keys` 명령어를 실행해야 합니다. 이 명령어는 액세스 토큰 생성에 필요한 암호화 키를 생성합니다. 이 키들은 보통 소스 코드 저장소에 커밋하지 않습니다.

```
php artisan passport:keys
```

필요하다면 Passport 키를 불러올 경로를 따로 지정할 수도 있습니다. 이때 `Passport::loadKeysFrom` 메서드를 사용할 수 있으며, 보통 애플리케이션의 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 호출합니다.

```
/**
 * Register any authentication / authorization services.
 *
 * @return void
 */
public function boot()
{
    $this->registerPolicies();

    Passport::routes();

    Passport::loadKeysFrom(__DIR__.'/../secrets/oauth');
}
```

<a name="loading-keys-from-the-environment"></a>
#### 환경변수에서 키 불러오기

또한, `vendor:publish` 아티즌 명령어를 사용해서 Passport의 설정 파일을 퍼블리시할 수도 있습니다.

```
php artisan vendor:publish --tag=passport-config
```

설정 파일을 퍼블리시하고 나면, 애플리케이션의 암호화 키를 환경 변수로 지정해 불러올 수 있습니다.

```bash
PASSPORT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
<private key here>
-----END RSA PRIVATE KEY-----"

PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
<public key here>
-----END PUBLIC KEY-----"
```

<a name="migration-customization"></a>
### 마이그레이션 커스터마이즈

Passport의 기본 마이그레이션을 사용하지 않을 계획이라면, `App\Providers\AppServiceProvider` 클래스의 `register` 메서드에서 `Passport::ignoreMigrations` 메서드를 호출해야 합니다. 기본 마이그레이션 파일들은 `vendor:publish` 아티즌 명령어로 별도 복사(export)할 수 있습니다.

```
php artisan vendor:publish --tag=passport-migrations
```

<a name="upgrading-passport"></a>
### 패스포트 업그레이드

Passport의 새로운 주요 버전으로 업그레이드할 때는, [업그레이드 가이드](https://github.com/laravel/passport/blob/master/UPGRADE.md)를 꼼꼼하게 확인하는 것이 중요합니다.

<a name="configuration"></a>
## 설정

<a name="client-secret-hashing"></a>
### 클라이언트 시크릿 해싱

클라이언트의 시크릿을 데이터베이스에 저장할 때 해시 형태로 저장하고 싶다면, `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 `Passport::hashClientSecrets` 메서드를 호출하세요.

```
use Laravel\Passport\Passport;

Passport::hashClientSecrets();
```

이 설정을 활성화하면, 모든 클라이언트 시크릿은 생성 직후에만 사용자에게 보여지며, 평문(plain-text) 시크릿 값은 데이터베이스에 저장되지 않습니다. 즉, 시크릿을 분실하면 복구가 불가능하게 됩니다.

<a name="token-lifetimes"></a>
### 토큰 만료 시간 설정

기본적으로 Passport에서 발급되는 액세스 토큰의 만료 시한은 1년입니다. 더 긴 또는 더 짧은 만료 기간을 설정하고 싶다면, `tokensExpireIn`, `refreshTokensExpireIn`, `personalAccessTokensExpireIn` 메서드를 사용할 수 있습니다. 이 메서드들은 애플리케이션의 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 호출해야 합니다.

```
/**
 * Register any authentication / authorization services.
 *
 * @return void
 */
public function boot()
{
    $this->registerPolicies();

    Passport::routes();

    Passport::tokensExpireIn(now()->addDays(15));
    Passport::refreshTokensExpireIn(now()->addDays(30));
    Passport::personalAccessTokensExpireIn(now()->addMonths(6));
}
```

> [!NOTE]
> Passport 데이터베이스 테이블의 `expires_at` 컬럼은 읽기 전용이며 단지 표시 목적으로만 사용됩니다. 실제 만료 정보는 서명 및 암호화된 토큰 자체에 저장됩니다. 토큰을 무효화해야 한다면 [토큰을 취소](#revoking-tokens)해야 합니다.

<a name="overriding-default-models"></a>
### 기본 모델 오버라이드

Passport에서 내부적으로 사용하는 모델들을 자유롭게 확장할 수 있습니다. 직접 모델을 정의하고 해당 Passport 모델을 상속(extends)하면 됩니다.

```
use Laravel\Passport\Client as PassportClient;

class Client extends PassportClient
{
    // ...
}
```

모델을 정의한 후에는 `Laravel\Passport\Passport` 클래스를 통해 Passport에 커스텀 모델을 알려야 합니다. 보통 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 지정하면 됩니다.

```
use App\Models\Passport\AuthCode;
use App\Models\Passport\Client;
use App\Models\Passport\PersonalAccessClient;
use App\Models\Passport\Token;

/**
 * Register any authentication / authorization services.
 *
 * @return void
 */
public function boot()
{
    $this->registerPolicies();

    Passport::routes();

    Passport::useTokenModel(Token::class);
    Passport::useClientModel(Client::class);
    Passport::useAuthCodeModel(AuthCode::class);
    Passport::usePersonalAccessClientModel(PersonalAccessClient::class);
}
```

<a name="issuing-access-tokens"></a>
## 액세스 토큰 발급

대부분의 개발자는 OAuth2를 사용할 때 권한 코드(authorization code)를 이용하는 방식에 익숙합니다. 이 방법을 사용하면, 클라이언트 애플리케이션이 사용자를 여러분의 서버로 리디렉션하고, 사용자는 해당 요청을 허용하거나 거부한 뒤 클라이언트에게 액세스 토큰을 발급할 수 있습니다.

<a name="managing-clients"></a>
### 클라이언트 관리

여러분의 API와 연동할 애플리케이션을 개발하는 개발자들은 우선 자신들의 애플리케이션을 여러분의 애플리케이션에 "클라이언트"로 등록해야 합니다. 보통 이때 앱 이름과 인증/인가 완료 후 리디렉션할 URL 정보를 입력받습니다.

<a name="the-passportclient-command"></a>
#### `passport:client` 명령어

가장 간단하게 클라이언트를 생성하는 방법은 `passport:client` 아티즌 명령어를 사용하는 것입니다. 이 명령어로 자체 테스트용 OAuth2 클라이언트를 쉽고 빠르게 만들 수 있습니다. 명령어를 실행하면 Passport는 클라이언트에 대한 추가 정보를 입력받고, 클라이언트 ID 및 시크릿(비밀 키)을 알려줍니다.

```
php artisan passport:client
```

**리디렉션 URL**

클라이언트에 여러 리디렉션 URL을 허용하려면, `passport:client` 명령어에서 URL 입력 시 쉼표(콤마)로 구분해 여러 개를 지정할 수 있습니다. 쉼표가 포함된 URL은 URL 인코딩해야 합니다.

```bash
http://example.com/callback,http://examplefoo.com/callback
```

<a name="clients-json-api"></a>
#### JSON API

애플리케이션의 사용자들은 `client` 명령어를 직접 이용할 수 없으므로, Passport에서는 클라이언트 생성을 위한 JSON API도 제공합니다. 이를 활용하면 별도의 컨트롤러 코드를 구현하지 않아도 클라이언트 생성, 수정, 삭제 기능을 쉽게 만들 수 있습니다.

단, 이 JSON API와 여러분이 개발한 프론트엔드를 연동해, 사용자가 자신의 클라이언트를 관리할 수 있는 대시보드를 직접 구성해야 합니다. 아래는 각 클라이언트 관리 API 엔드포인트를 소개합니다. 참고로 HTTP 요청 예시는 [Axios](https://github.com/axios/axios)를 사용해 설명합니다.

이 JSON API는 `web` 및 `auth` 미들웨어로 보호되기 때문에, 반드시 자체 애플리케이션에서만 호출 가능하며 외부에서는 사용할 수 없습니다.

<a name="get-oauthclients"></a>
#### `GET /oauth/clients`

이 엔드포인트는 인증된 사용자의 모든 클라이언트 목록을 반환합니다. 주된 용도는, 사용자가 클라이언트 목록을 조회한 뒤, 수정 또는 삭제할 수 있도록 돕는 것입니다.

```
axios.get('/oauth/clients')
    .then(response => {
        console.log(response.data);
    });
```

<a name="post-oauthclients"></a>
#### `POST /oauth/clients`

이 엔드포인트는 신규 클라이언트 생성을 위한 것으로, 클라이언트의 `name`과 `redirect` URL 두 개의 데이터가 필요합니다. `redirect` URL은 사용자가 인증 요청을 허용/거부한 뒤 리디렉션될 위치입니다.

클라이언트가 생성되면 클라이언트 ID와 시크릿이 발급됩니다. 이 값들은 이후 액세스 토큰을 요청할 때 사용됩니다. 경로 호출 시 새로운 클라이언트 인스턴스를 반환합니다.

```
const data = {
    name: 'Client Name',
    redirect: 'http://example.com/callback'
};

axios.post('/oauth/clients', data)
    .then(response => {
        console.log(response.data);
    })
    .catch (response => {
        // List errors on response...
    });
```

<a name="put-oauthclientsclient-id"></a>
#### `PUT /oauth/clients/{client-id}`

이 엔드포인트는 기존 클라이언트 정보를 수정할 때 사용합니다. `name`과 `redirect` URL 두 개의 데이터가 필수이며, 호출 시 갱신된 클라이언트 인스턴스를 반환합니다.

```
const data = {
    name: 'New Client Name',
    redirect: 'http://example.com/callback'
};

axios.put('/oauth/clients/' + clientId, data)
    .then(response => {
        console.log(response.data);
    })
    .catch (response => {
        // List errors on response...
    });
```

<a name="delete-oauthclientsclient-id"></a>
#### `DELETE /oauth/clients/{client-id}`

이 엔드포인트는 클라이언트 삭제에 사용됩니다.

```
axios.delete('/oauth/clients/' + clientId)
    .then(response => {
        //
    });
```

<a name="requesting-tokens"></a>
### 토큰 요청

<a name="requesting-tokens-redirecting-for-authorization"></a>
#### 인증(Authorization) 리디렉션

클라이언트가 생성된 이후, 개발자는 자신의 클라이언트 ID와 시크릿을 이용해 여러분의 애플리케이션에서 권한 코드 및 액세스 토큰을 요청할 수 있습니다. 먼저, 외부 애플리케이션은 여러분의 애플리케이션의 `/oauth/authorize` 경로로 리디렉션 요청을 발생시켜야 합니다. 예시는 아래와 같습니다.

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
    ]);

    return redirect('http://passport-app.test/oauth/authorize?'.$query);
});
```

> [!TIP]
> `/oauth/authorize` 경로는 `Passport::routes` 메서드에 의해 이미 정의되어 있습니다. 해당 경로를 별도로 정의할 필요가 없습니다.

<a name="approving-the-request"></a>
#### 요청 승인

인증 요청을 수신하면 Passport가 자동으로 템플릿 화면을 렌더링하여 사용자가 인증 요청을 허용(Approve) 또는 거부(Deny)할 수 있게 해줍니다. 요청을 승인하면, 사용자는 클라이언트가 요청 시 지정한 `redirect_uri`(리디렉션 URL)로 돌아가게 됩니다. 이 URI는 클라이언트 생성 시 지정한 값과 반드시 일치해야 합니다.

인증 승인 화면을 커스터마이즈하고 싶다면 `vendor:publish` 아티즌 명령어로 Passport의 뷰 파일을 퍼블리시할 수 있습니다. 퍼블리시된 뷰들은 `resources/views/vendor/passport` 디렉토리에 위치하게 됩니다.

```
php artisan vendor:publish --tag=passport-views
```

실제 운영에서는, 실제로 신뢰할 만한 1st party 클라이언트를 인증할 경우, 이 승인 알림 단계를 건너뛰고 싶을 수 있습니다. 이럴 때는 [Client 모델을 확장](#overriding-default-models)하고, `skipsAuthorization` 메서드를 정의할 수 있습니다. 만약 이 메서드가 `true`를 반환하면, 사용자는 인증 프롬프트 없이 즉시 `redirect_uri`로 리디렉션됩니다.

```
<?php

namespace App\Models\Passport;

use Laravel\Passport\Client as BaseClient;

class Client extends BaseClient
{
    /**
     * Determine if the client should skip the authorization prompt.
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
#### 권한 코드를 액세스 토큰으로 변환하기

사용자가 인증 요청을 승인하면, 사용자는 외부 애플리케이션으로 다시 리디렉션됩니다. 외부 애플리케이션에서는 우선 리디렉션 전에 저장해두었던 `state` 파라미터와 되돌아온 `state` 값이 일치하는지 확인해야 합니다. 일치하면, 클라이언트는 권한 코드(authorization code)를 포함해 애플리케이션의 `/oauth/token` 엔드포인트로 `POST` 요청을 보내 액세스 토큰을 발급받을 수 있습니다. 다음은 그 예시입니다.

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

`/oauth/token` 경로는 `access_token`, `refresh_token`, `expires_in` 속성을 담은 JSON 응답을 반환합니다. `expires_in`은 액세스 토큰 만료까지의 초(seconds)를 의미합니다.

> [!TIP]
> `/oauth/authorize` 경로와 마찬가지로, `/oauth/token` 경로도 `Passport::routes`에서 자동으로 정의되므로, 별도로 정의할 필요가 없습니다.

<a name="tokens-json-api"></a>
#### JSON API

Passport는 인증된 액세스 토큰 관리용 JSON API도 제공합니다. 여러분이 직접 개발하는 프론트엔드에서 이 API를 활용하면, 사용자가 본인의 액세스 토큰을 일괄 관리하는 대시보드를 구축할 수 있습니다. HTTP 요청 예시는 [Axios](https://github.com/mzabriskie/axios)를 활용합니다. 이 API 역시 `web` 및 `auth` 미들웨어로 보호되어, 애플리케이션 내부에서만 사용할 수 있습니다.

<a name="get-oauthtokens"></a>
#### `GET /oauth/tokens`

이 엔드포인트는 인증된 사용자가 생성한 모든 액세스 토큰 목록을 반환합니다. 주로 사용자에게 자신의 토큰 목록을 보여주고, 필요시 개별적으로 취소(revoke)하도록 할 때 유용합니다.

```
axios.get('/oauth/tokens')
    .then(response => {
        console.log(response.data);
    });
```

<a name="delete-oauthtokenstoken-id"></a>
#### `DELETE /oauth/tokens/{token-id}`

이 엔드포인트를 이용해, 인증된 액세스 토큰과 관련된 리프레시 토큰을 함께 취소할 수 있습니다.

```
axios.delete('/oauth/tokens/' + tokenId);
```

<a name="refreshing-tokens"></a>
### 토큰 갱신

애플리케이션에서 액세스 토큰을 짧은 수명으로 발급한다면, 사용자들은 토큰이 만료될 때 미리 발급받은 리프레시 토큰을 이용해 액세스 토큰을 갱신해야 할 수도 있습니다.

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

이때도 `/oauth/token` 엔드포인트는 `access_token`, `refresh_token`, `expires_in` 속성을 포함한 JSON 형태로 응답합니다. `expires_in`은 새로 발급받은 액세스 토큰 만료까지 남은 시간(초)입니다.

<a name="revoking-tokens"></a>
### 토큰 취소

`Laravel\Passport\TokenRepository` 클래스의 `revokeAccessToken` 메서드를 사용해 액세스 토큰을 취소할 수 있습니다. 액세스 토큰에 연결된 리프레시 토큰들은 `Laravel\Passport\RefreshTokenRepository`의 `revokeRefreshTokensByAccessTokenId` 메서드로 취소할 수 있습니다. 두 클래스 모두 라라벨의 [서비스 컨테이너](/docs/8.x/container)를 통해 주입할 수 있습니다.

```
use Laravel\Passport\TokenRepository;
use Laravel\Passport\RefreshTokenRepository;

$tokenRepository = app(TokenRepository::class);
$refreshTokenRepository = app(RefreshTokenRepository::class);

// 액세스 토큰 취소...
$tokenRepository->revokeAccessToken($tokenId);

// 해당 액세스 토큰의 모든 리프레시 토큰 취소...
$refreshTokenRepository->revokeRefreshTokensByAccessTokenId($tokenId);
```

<a name="purging-tokens"></a>

### 토큰 정리(Purging Tokens)

토큰이 폐기(revoke)되었거나 만료(expired)된 경우, 데이터베이스에서 해당 토큰을 정리하고 싶을 수 있습니다. Passport에서 제공하는 `passport:purge` 아티즌 명령어를 사용하면 이를 손쉽게 처리할 수 있습니다.

```
# 폐기되거나 만료된 토큰과 인증 코드를 정리합니다...
php artisan passport:purge

# 폐기된 토큰과 인증 코드만 정리합니다...
php artisan passport:purge --revoked

# 만료된 토큰과 인증 코드만 정리합니다...
php artisan passport:purge --expired
```

또한, 애플리케이션의 `App\Console\Kernel` 클래스에서 [스케쥴 작업](/docs/8.x/scheduling)을 설정하여 주기적으로 토큰을 자동 관리하도록 할 수 있습니다.

```
/**
 * 애플리케이션의 명령어 스케쥴을 정의합니다.
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
## PKCE를 활용한 인증 코드 그랜트(Authorization Code Grant with PKCE)

"Proof Key for Code Exchange" (PKCE)를 사용하는 인증 코드 그랜트는 싱글 페이지 애플리케이션(SPA)이나 네이티브 애플리케이션이 API에 안전하게 인증할 수 있는 방법입니다. 클라이언트 시크릿을 안전하게 저장할 수 없거나, 인증 코드를 공격자가 가로채는 위험을 줄이고자 할 때 이 방법을 사용하는 것이 좋습니다. 이 방식에서는 클라이언트 시크릿 대신 "코드 검증자(code verifier)"와 "코드 챌린지(code challenge)"의 조합으로 인증 코드와 액세스 토큰을 교환합니다.

<a name="creating-a-auth-pkce-grant-client"></a>
### 클라이언트 생성하기

애플리케이션에서 PKCE를 사용하는 인증 코드 그랜트를 통해 토큰을 발급하려면, PKCE가 활성화된 클라이언트를 먼저 생성해야 합니다. 아래의 `passport:client` 아티즌 명령어에서 `--public` 옵션을 사용하여 생성할 수 있습니다.

```
php artisan passport:client --public
```

<a name="requesting-auth-pkce-grant-tokens"></a>
### 토큰 요청하기

<a name="code-verifier-code-challenge"></a>
#### 코드 검증자 & 코드 챌린지

이 인증 방식에서는 클라이언트 시크릿이 제공되지 않으므로, 토큰을 요청하려면 개발자가 코드 검증자(code verifier)와 코드 챌린지(code challenge)를 직접 생성해야 합니다.

코드 검증자는 알파벳, 숫자, 그리고 `"-"`, `"."`, `"_"`, `"~"` 문자를 포함하여 43~128자 사이의 임의 문자열이어야 하며, 이는 [RFC 7636 명세](https://tools.ietf.org/html/rfc7636)에 따라야 합니다.

코드 챌린지는 URL 및 파일명에 안전한 문자들로 이루어진 Base64 인코딩 문자열이어야 하며, 끝 부분의 `'='` 문자는 제거하고, 줄바꿈, 공백, 기타 불필요한 문자가 없어야 합니다.

```
$encoded = base64_encode(hash('sha256', $code_verifier, true));

$codeChallenge = strtr(rtrim($encoded, '='), '+/', '-_');
```

<a name="code-grant-pkce-redirecting-for-authorization"></a>
#### 인증을 위한 리디렉션

클라이언트를 생성한 후에는 클라이언트 ID, 생성한 코드 검증자와 코드 챌린지를 사용하여 인증 코드와 액세스 토큰을 요청할 수 있습니다. 우선, 이용 애플리케이션에서 `/oauth/authorize` 라우트로 리디렉션 요청을 전송해야 합니다.

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
    ]);

    return redirect('http://passport-app.test/oauth/authorize?'.$query);
});
```

<a name="code-grant-pkce-converting-authorization-codes-to-access-tokens"></a>
#### 인증 코드를 액세스 토큰으로 변환

사용자가 인증 요청을 승인하면, 사용자는 소비 애플리케이션으로 다시 리디렉션됩니다. 이때 표준 인증 코드 그랜트와 마찬가지로, 소비 애플리케이션에서는 이전에 저장한 `state` 값과 리디렉션된 값이 일치하는지 검증해야 합니다.

`state` 값이 일치한다면, 소비 애플리케이션에서는 액세스 토큰을 요청하는 `POST` 요청을 애플리케이션에 전송해야 합니다. 이 요청에는 사용자가 인증 요청을 승인할 때 발급 받은 인증 코드와, 처음에 생성한 코드 검증자(code verifier)를 포함해야 합니다.

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
## 패스워드 그랜트 토큰(Password Grant Tokens)

> [!NOTE]
> 패스워드 그랜트 토큰(password grant tokens)은 더 이상 사용을 권장하지 않습니다. 대신, [OAuth2 Server에서 현재 권장하는 그랜트 타입](https://oauth2.thephpleague.com/authorization-server/which-grant/)을 사용하시기 바랍니다.

OAuth2 패스워드 그랜트는 다른 1st-party 클라이언트(예: 모바일 애플리케이션)에서 이메일 주소/사용자명과 비밀번호로 액세스 토큰을 발급받을 수 있게 해줍니다. 이를 통해, 모든 OAuth2 인증 코드 리디렉션 과정을 거치지 않고도 안전하게 토큰을 발급할 수 있습니다.

<a name="creating-a-password-grant-client"></a>
### 패스워드 그랜트 클라이언트 생성하기

패스워드 그랜트를 통해 토큰을 발급하려면 먼저 패스워드 그랜트 클라이언트를 생성해야 합니다. `passport:client` 아티즌 명령어의 `--password` 옵션을 사용하여 생성할 수 있습니다. **이미 `passport:install`을 실행했다면, 이 명령어를 다시 실행할 필요가 없습니다.**

```
php artisan passport:client --password
```

<a name="requesting-password-grant-tokens"></a>
### 토큰 요청하기

패스워드 그랜트 클라이언트를 생성했으면, 사용자의 이메일 주소와 비밀번호를 포함한 `POST` 요청을 `/oauth/token` 라우트로 전송하여 액세스 토큰을 발급받을 수 있습니다. 이 라우트는 이미 `Passport::routes` 메서드에 의해 등록되어 있으므로, 별도로 정의할 필요가 없습니다. 요청이 성공하면, 서버에서 `access_token`과 `refresh_token`이 담긴 JSON 응답을 받게 됩니다.

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

> [!TIP]
> 액세스 토큰은 기본적으로 긴 유효 기간을 가집니다. 필요하다면 [액세스 토큰의 최대 유효 기간을 설정](#configuration)할 수 있습니다.

<a name="requesting-all-scopes"></a>
### 모든 스코프 요청하기

패스워드 그랜트 또는 클라이언트 크리덴셜 그랜트(Client Credentials Grant)를 사용할 때, 애플리케이션에서 지원하는 모든 스코프(scope)에 대해 토큰을 발급받고 싶을 수 있습니다. 이를 위해 `*` 스코프를 요청하면 됩니다. `*` 스코프를 요청할 경우, 토큰 인스턴스의 `can` 메서드는 항상 `true`를 반환합니다. 이 스코프는 `password` 또는 `client_credentials` 그랜트 유형으로 발급된 토큰에만 부여할 수 있습니다.

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
### 사용자 프로바이더(User Provider) 커스터마이징

애플리케이션에서 2개 이상의 [인증 사용자 프로바이더](/docs/8.x/authentication#introduction)를 사용하는 경우, `artisan passport:client --password` 명령어로 클라이언트를 생성할 때 `--provider` 옵션을 통해 어떤 프로바이더를 사용할 것인지 지정할 수 있습니다. 지정한 프로바이더명은 애플리케이션의 `config/auth.php` 설정 파일에 정의된 유효한 프로바이더와 일치해야 합니다. 이후 [미들웨어를 통해 라우트 보호](#via-middleware)도 할 수 있습니다.

<a name="customizing-the-username-field"></a>
### 사용자명 필드 커스터마이징

패스워드 그랜트로 인증할 때, Passport는 인증 가능한 모델의 `email` 속성을 "사용자명"으로 사용합니다. 다만, 이 동작을 변경하고 싶다면 모델에 `findForPassport` 메서드를 정의할 수 있습니다.

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
     * 지정된 사용자명(username)에 해당하는 유저 인스턴스를 찾음
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
### 비밀번호 검증 커스터마이징

패스워드 그랜트 인증 시 Passport는 모델의 `password` 속성을 이용해 사용자 비밀번호를 검증합니다. 만약 모델에 `password` 속성이 없거나, 비밀번호 검증 로직을 직접 구현하고 싶다면, `validateForPassportPasswordGrant` 메서드를 모델에 정의할 수 있습니다.

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
     * Passport 패스워드 그랜트에 사용할 비밀번호 검증
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
## 임플리시트 그랜트 토큰(Implicit Grant Tokens)

> [!NOTE]
> 임플리시트 그랜트 토큰(implicit grant tokens)은 더 이상 사용을 권장하지 않습니다. 대신, [OAuth2 Server에서 현재 권장하는 그랜트 타입](https://oauth2.thephpleague.com/authorization-server/which-grant/)을 사용하시기 바랍니다.

임플리시트 그랜트는 인증 코드 그랜트와 유사하지만, 인증 코드를 교환하는 절차 없이 바로 토큰이 클라이언트에 전달된다는 점이 다릅니다. 이 방식은 클라이언트 자격증명을 안전하게 저장할 수 없는 JavaScript 또는 모바일 애플리케이션에서 주로 사용됩니다. 임플리시트 그랜트를 활성화하려면, 애플리케이션의 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 `enableImplicitGrant` 메서드를 호출하세요.

```
/**
 * 인증/인가 서비스를 등록합니다.
 *
 * @return void
 */
public function boot()
{
    $this->registerPolicies();

    Passport::routes();

    Passport::enableImplicitGrant();
}
```

임플리시트 그랜트가 활성화되면, 개발자는 해당 클라이언트 ID를 사용해 애플리케이션에서 액세스 토큰을 요청할 수 있습니다. 소비 애플리케이션은 아래 예시처럼 `/oauth/authorize` 라우트에 리디렉션 요청을 하면 됩니다.

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
    ]);

    return redirect('http://passport-app.test/oauth/authorize?'.$query);
});
```

> [!TIP]
> `/oauth/authorize` 라우트는 이미 `Passport::routes` 메서드에 의해 정의되어 있으므로, 별도로 라우트를 등록할 필요가 없습니다.

<a name="client-credentials-grant-tokens"></a>
## 클라이언트 크리덴셜 그랜트 토큰(Client Credentials Grant Tokens)

클라이언트 크리덴셜 그랜트는 머신-투-머신(M2M) 인증에 적합합니다. 예를 들어, API를 통해 유지보수 작업을 수행하는 정기 작업(스케쥴 작업) 등에서 이 그랜트 방식을 사용할 수 있습니다.

클라이언트 크리덴셜 그랜트를 통해 토큰을 발급하려면, 먼저 클라이언트 크리덴셜 그랜트 클라이언트를 생성해야 합니다. `passport:client` 아티즌 명령어의 `--client` 옵션을 사용해 생성할 수 있습니다.

```
php artisan passport:client --client
```

이후, 이 그랜트 유형을 사용하려면 `app/Http/Kernel.php` 파일의 `$routeMiddleware` 속성에 `CheckClientCredentials` 미들웨어를 추가해야 합니다.

```
use Laravel\Passport\Http\Middleware\CheckClientCredentials;

protected $routeMiddleware = [
    'client' => CheckClientCredentials::class,
];
```

그 다음, 해당 미들웨어를 라우트에 적용하면 됩니다.

```
Route::get('/orders', function (Request $request) {
    ...
})->middleware('client');
```

특정 스코프에 요청을 제한하려면, `client` 미들웨어를 라우트에 연결할 때 콤마로 구분된 스코프 목록을 전달하면 됩니다.

```
Route::get('/orders', function (Request $request) {
    ...
})->middleware('client:check-status,your-scope');
```

<a name="retrieving-tokens"></a>
### 토큰 조회하기

이 그랜트 유형을 이용해 토큰을 발급받으려면, `oauth/token` 엔드포인트에 요청을 보내면 됩니다.

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

사용자가 일반적인 인증 코드 리디렉션 과정을 거치지 않고, 직접 자신의 액세스 토큰을 발급 받을 수 있도록 허용해야 할 때가 있습니다. 예를 들어, 사용자가 API를 실험하거나, 액세스 토큰을 보다 단순하게 발급받는 등 다양한 목적으로 이 기능을 제공할 수 있습니다.

> [!TIP]
> 애플리케이션에서 주로 개인 액세스 토큰 발급만 필요하다면, Passport 대신 [Laravel Sanctum](/docs/8.x/sanctum) 사용을 고려해보세요. Sanctum은 라라벨에서 직접 제공하는 경량의 API 토큰 발급 라이브러리입니다.

<a name="creating-a-personal-access-client"></a>
### 개인 액세스 클라이언트 생성하기

개인 액세스 토큰을 발급하려면 먼저 개인 액세스 클라이언트를 생성해야 합니다. `passport:client` 아티즌 명령어의 `--personal` 옵션을 실행하여 생성할 수 있습니다. 이미 `passport:install`을 실행했다면, 별도 명령 실행이 필요 없습니다.

```
php artisan passport:client --personal
```

클라이언트 생성 후에는 클라이언트의 ID와 플레인텍스트 시크릿 값을 애플리케이션의 `.env` 파일에 저장해야 합니다.

```bash
PASSPORT_PERSONAL_ACCESS_CLIENT_ID="client-id-value"
PASSPORT_PERSONAL_ACCESS_CLIENT_SECRET="unhashed-client-secret-value"
```

<a name="managing-personal-access-tokens"></a>
### 개인 액세스 토큰 관리하기

개인 액세스 클라이언트를 생성했다면, 이제 `App\Models\User` 모델 인스턴스의 `createToken` 메서드를 통해 지정된 사용자에게 토큰을 발급할 수 있습니다. `createToken` 메서드는 첫 번째 인수로 토큰 이름, 두 번째 인수(옵션)로 [스코프](#token-scopes) 배열을 받습니다.

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

Passport는 개인 액세스 토큰 관리를 위한 JSON API도 내장하고 있습니다. 프론트엔드와 연동하여 사용자에게 토큰 대시보드를 직접 제공할 수 있습니다. 아래 예제에서는 HTTP 요청에 [Axios](https://github.com/mzabriskie/axios)를 사용합니다.

JSON API는 `web` 및 `auth` 미들웨어로 보호되어 있기 때문에 오직 애플리케이션 내부에서만 호출할 수 있습니다. 외부에서는 호출할 수 없습니다.

<a name="get-oauthscopes"></a>
#### `GET /oauth/scopes`

이 라우트는 애플리케이션에 정의된 [스코프](#token-scopes) 전부를 반환합니다. 사용자가 개인 액세스 토큰에 어떤 스코프를 부여할 수 있는지 목록을 가져올 때 유용합니다.

```
axios.get('/oauth/scopes')
    .then(response => {
        console.log(response.data);
    });
```

<a name="get-oauthpersonal-access-tokens"></a>
#### `GET /oauth/personal-access-tokens`

이 라우트는 인증된 사용자가 생성한 개인 액세스 토큰 전체를 반환합니다. 사용자가 자신의 토큰을 목록으로 확인하고, 편집하거나 폐기할 수 있도록 보여주기에 적합합니다.

```
axios.get('/oauth/personal-access-tokens')
    .then(response => {
        console.log(response.data);
    });
```

<a name="post-oauthpersonal-access-tokens"></a>
#### `POST /oauth/personal-access-tokens`

이 라우트는 새로운 개인 액세스 토큰을 생성합니다. 요청 시 토큰의 `name`(이름)과 토큰에 부여할 `scopes`(스코프) 정보가 필요합니다.

```
const data = {
    name: 'Token Name',
    scopes: []
};

axios.post('/oauth/personal-access-tokens', data)
    .then(response => {
        console.log(response.data.accessToken);
    })
    .catch (response => {
        // 에러 목록 출력...
    });
```

<a name="delete-oauthpersonal-access-tokenstoken-id"></a>
#### `DELETE /oauth/personal-access-tokens/{token-id}`

이 라우트는 개인 액세스 토큰을 폐기(revoke)할 때 사용합니다.

```
axios.delete('/oauth/personal-access-tokens/' + tokenId);
```

<a name="protecting-routes"></a>
## 라우트 보호하기(Protecting Routes)

<a name="via-middleware"></a>
### 미들웨어를 통한 보호

Passport는 [인증 가드](/docs/8.x/authentication#adding-custom-guards)를 제공하여 들어오는 요청의 액세스 토큰을 검증할 수 있습니다. `api` 가드에서 `passport` 드라이버를 사용하도록 구성했다면, 유효한 액세스 토큰이 필요한 라우트에 `auth:api` 미들웨어만 지정해주면 됩니다.

```
Route::get('/user', function () {
    //
})->middleware('auth:api');
```

> [!NOTE]
> [클라이언트 크리덴셜 그랜트](#client-credentials-grant-tokens)를 사용하는 경우에는, 라우트 보호에 `auth:api` 미들웨어 대신 [별도의 `client` 미들웨어](#client-credentials-grant-tokens)를 사용해야 합니다.

<a name="multiple-authentication-guards"></a>
#### 다중 인증 가드(Multiple Authentication Guards)

애플리케이션에서 서로 다른 Eloquent 모델을 사용하는 여러 종류의 사용자를 인증해야 할 경우, 각 사용자 프로바이더에 맞는 가드 설정을 추가해야 할 수 있습니다. 이를 통해 특정 사용자 프로바이더에만 요청을 제한하고 보호할 수 있습니다. 예를 들어, 다음은 `config/auth.php`의 가드 설정 예시입니다.

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

다음과 같은 라우트는 `customers` 사용자 프로바이더를 사용하는 `api-customers` 가드를 활용하여 요청을 인증하게 됩니다.

```
Route::get('/customer', function () {
    //
})->middleware('auth:api-customers');
```

> [!TIP]
> Passport에서 여러 사용자 프로바이더를 사용하는 상세 방법은 [패스워드 그랜트 문서](#customizing-the-user-provider)를 참고하세요.

<a name="passing-the-access-token"></a>
### 액세스 토큰 전달 방식

Passport로 보호된 라우트에 접근할 때, API 소비자는 요청의 `Authorization` 헤더에 액세스 토큰을 `Bearer` 토큰 형태로 명시해야 합니다. 예를 들어, Guzzle HTTP 라이브러리를 사용하는 경우는 다음과 같습니다.

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

스코프(scope)를 통해 API 클라이언트가 계정 접근을 요청할 때, 허용하려는 권한 범위를 제한할 수 있습니다. 예를 들어, 전자상거래 애플리케이션을 만든다면, 모든 API 소비자가 주문을 할 필요는 없을 것입니다. 대신, 주문의 배송 상태만 접근하도록 권한 요청을 제한할 수 있습니다. 즉, 스코프를 활용하면 제3자 애플리케이션이 사용자를 대신해 수행할 수 있는 작업을 제한할 수 있습니다.

<a name="defining-scopes"></a>
### 스코프 정의하기

`App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 `Passport::tokensCan` 메서드를 사용해 API의 스코프를 등록할 수 있습니다. `tokensCan`은 스코프명과 해당 스코프의 설명이 담긴 배열을 인수로 받습니다. 이 설명은 인증 승인 화면에서 사용자에게 표시됩니다.

```
/**
 * 인증/인가 서비스를 등록합니다.
 *
 * @return void
 */
public function boot()
{
    $this->registerPolicies();

    Passport::routes();

    Passport::tokensCan([
        'place-orders' => 'Place orders',
        'check-status' => 'Check order status',
    ]);
}
```

<a name="default-scope"></a>
### 기본 스코프(Default Scope)

특정 스코프를 지정하지 않은 경우, Passport 서버에서 토큰에 기본적으로 부여할 스코프를 `setDefaultScope` 메서드를 통해 설정할 수 있습니다. 일반적으로 이 메서드는 `App\Providers\AuthServiceProvider`의 `boot` 메서드에서 호출합니다.

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

<a name="assigning-scopes-to-tokens"></a>

### 토큰에 범위(Scopes) 할당하기

<a name="when-requesting-authorization-codes"></a>
#### 인가 코드 요청 시

인가 코드 그랜트 방식을 통해 액세스 토큰을 요청할 때, 클라이언트는 원하는 범위를 `scope` 쿼리 문자열 파라미터로 지정해야 합니다. `scope` 파라미터에는 공백 문자로 구분된 범위 목록을 전달합니다:

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
#### 퍼스널 액세스 토큰 발급 시

`App\Models\User` 모델의 `createToken` 메서드를 사용해 퍼스널 액세스 토큰을 발급하는 경우, 원하는 범위 배열을 두 번째 인수로 메서드에 전달할 수 있습니다:

```
$token = $user->createToken('My Token', ['place-orders'])->accessToken;
```

<a name="checking-scopes"></a>
### 범위(Scopes) 확인하기

Passport에는 들어오는 요청이 특정 범위가 부여된 토큰으로 인증되었는지 확인할 수 있는 두 가지 미들웨어가 있습니다. 먼저, 아래 미들웨어들을 `app/Http/Kernel.php` 파일의 `$routeMiddleware` 속성에 추가하세요:

```
'scopes' => \Laravel\Passport\Http\Middleware\CheckScopes::class,
'scope' => \Laravel\Passport\Http\Middleware\CheckForAnyScope::class,
```

<a name="check-for-all-scopes"></a>
#### 모든 범위 확인

`scopes` 미들웨어를 라우트에 할당하면, 해당 요청의 액세스 토큰이 나열된 모든 범위를 가지고 있는지 확인합니다:

```
Route::get('/orders', function () {
    // 액세스 토큰에 "check-status"와 "place-orders" 두 가지 범위가 모두 있어야 합니다...
})->middleware(['auth:api', 'scopes:check-status,place-orders']);
```

<a name="check-for-any-scopes"></a>
#### 하나 이상의 범위 확인

`scope` 미들웨어를 사용하면, 요청의 액세스 토큰에 나열된 범위 중 하나라도 있으면 인증을 허용합니다:

```
Route::get('/orders', function () {
    // 액세스 토큰에 "check-status" 또는 "place-orders" 범위 중 하나라도 있으면 통과합니다...
})->middleware(['auth:api', 'scope:check-status,place-orders']);
```

<a name="checking-scopes-on-a-token-instance"></a>
#### 토큰 인스턴스에서 범위 확인하기

액세스 토큰으로 인증된 요청이 애플리케이션에 진입한 후에도, 인증된 `App\Models\User` 인스턴스의 `tokenCan` 메서드를 사용해 해당 토큰에 특정 범위가 있는지 확인할 수 있습니다:

```
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    if ($request->user()->tokenCan('place-orders')) {
        //
    }
});
```

<a name="additional-scope-methods"></a>
#### 추가 범위 메서드

`scopeIds` 메서드를 사용하면, 정의된 모든 ID/이름이 배열로 반환됩니다:

```
use Laravel\Passport\Passport;

Passport::scopeIds();
```

`scopes` 메서드는 정의된 모든 범위가 `Laravel\Passport\Scope` 인스턴스 배열로 반환됩니다:

```
Passport::scopes();
```

`scopesFor` 메서드는 전달한 ID/이름에 해당하는 `Laravel\Passport\Scope` 인스턴스 배열을 반환합니다:

```
Passport::scopesFor(['place-orders', 'check-status']);
```

특정 범위가 정의되어 있는지 확인하려면 `hasScope` 메서드를 사용할 수 있습니다:

```
Passport::hasScope('place-orders');
```

<a name="consuming-your-api-with-javascript"></a>
## JavaScript에서 API 사용하기

API를 개발할 때, JavaScript 애플리케이션에서 직접 자신이 만든 API를 호출할 수 있으면 매우 유용합니다. 이 방법은 내 애플리케이션이 외부에 공개하는 API를 그대로 내부에서도 사용할 수 있도록 해줍니다. 동일한 API를 웹 애플리케이션, 모바일 애플리케이션, 서드파티 애플리케이션, 그리고 패키지 매니저에 배포하는 각종 SDK 등에서 모두 사용할 수 있습니다.

일반적으로 JavaScript 애플리케이션에서 여러분의 API를 호출하려면 액세스 토큰을 직접 전달하고, 이 토큰을 요청마다 함께 전송해야 합니다. 하지만 Passport는 이러한 과정을 자동으로 처리해주는 미들웨어를 제공합니다. 여러분은 `app/Http/Kernel.php` 파일의 `web` 미들웨어 그룹에 `CreateFreshApiToken` 미들웨어만 추가하면 됩니다:

```
'web' => [
    // 다른 미들웨어...
    \Laravel\Passport\Http\Middleware\CreateFreshApiToken::class,
],
```

> [!NOTE]
> `CreateFreshApiToken` 미들웨어는 미들웨어 스택에서 반드시 가장 마지막에 위치해야 합니다.

이 미들웨어는 응답에 `laravel_token` 쿠키를 추가합니다. 이 쿠키는 Passport가 JavaScript 애플리케이션으로부터 들어오는 API 요청을 인증할 때 사용하는 암호화된 JWT를 담고 있습니다. 이 JWT의 유효기간은 `session.lifetime` 설정값과 동일하게 적용됩니다. 이제 브라우저가 모든 후속 요청에 쿠키를 자동으로 보내므로, 여러분은 액세스 토큰을 직접 전달하지 않고도 API 요청을 보낼 수 있습니다:

```
axios.get('/api/user')
    .then(response => {
        console.log(response.data);
    });
```

<a name="customizing-the-cookie-name"></a>
#### 쿠키 이름 커스터마이징

필요하다면, `Passport::cookie` 메서드를 사용해 `laravel_token` 쿠키의 이름을 변경할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 호출합니다:

```
/**
 * Register any authentication / authorization services.
 *
 * @return void
 */
public function boot()
{
    $this->registerPolicies();

    Passport::routes();

    Passport::cookie('custom_name');
}
```

<a name="csrf-protection"></a>
#### CSRF 보호

이 인증 방식을 쓸 때는 요청에 올바른 CSRF 토큰 헤더가 반드시 포함되어야 합니다. 라라벨 기본 JavaScript 스캐폴딩에는 Axios 인스턴스가 내장되어 있으며, 이 인스턴스는 암호화된 `XSRF-TOKEN` 쿠키 값을 이용해 동일 출처 요청에 자동으로 `X-XSRF-TOKEN` 헤더를 전송합니다.

> [!TIP]
> 만약 `X-XSRF-TOKEN` 대신 `X-CSRF-TOKEN` 헤더를 보내고 싶다면, `csrf_token()`에서 반환된 암호화되지 않은 토큰을 사용해야 합니다.

<a name="events"></a>
## 이벤트

Passport는 액세스 토큰 및 리프레시 토큰이 발급될 때 이벤트를 발생시킵니다. 이러한 이벤트를 활용해 필요하면 데이터베이스 내의 다른 액세스 토큰을 정리하거나 폐기할 수 있습니다. 원한다면, 애플리케이션의 `App\Providers\EventServiceProvider` 클래스에서 이벤트에 리스너를 연결할 수 있습니다:

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

Passport의 `actingAs` 메서드는 현재 인증된 사용자와 부여된 범위도 함께 지정할 수 있습니다. `actingAs` 메서드의 첫 번째 인자는 사용자 인스턴스이고, 두 번째 인자는 사용자 토큰에 부여할 범위 배열입니다:

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

Passport의 `actingAsClient` 메서드는 현재 인증된 클라이언트와 부여된 범위를 함께 지정할 수 있습니다. 이 메서드의 첫 번째 인자는 클라이언트 인스턴스이고, 두 번째 인자는 클라이언트 토큰에 부여할 범위 배열입니다:

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