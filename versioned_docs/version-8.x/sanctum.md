# 라라벨 Sanctum (Laravel Sanctum)

- [소개](#introduction)
    - [동작 방식](#how-it-works)
- [설치](#installation)
- [설정](#configuration)
    - [기본 모델 오버라이드](#overriding-default-models)
- [API 토큰 인증](#api-token-authentication)
    - [API 토큰 발급](#issuing-api-tokens)
    - [토큰 권한(Abilities)](#token-abilities)
    - [라우트 보호](#protecting-routes)
    - [토큰 폐기](#revoking-tokens)
- [SPA 인증](#spa-authentication)
    - [설정](#spa-configuration)
    - [인증 처리](#spa-authenticating)
    - [라우트 보호](#protecting-spa-routes)
    - [프라이빗 브로드캐스트 채널 인가](#authorizing-private-broadcast-channels)
- [모바일 애플리케이션 인증](#mobile-application-authentication)
    - [API 토큰 발급](#issuing-mobile-api-tokens)
    - [라우트 보호](#protecting-mobile-api-routes)
    - [토큰 폐기](#revoking-mobile-api-tokens)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

[Laravel Sanctum](https://github.com/laravel/sanctum)은 SPA(싱글 페이지 애플리케이션), 모바일 애플리케이션, 그리고 간단한 토큰 기반 API를 위한 가볍고 단순한 인증 시스템을 제공합니다. Sanctum을 사용하면 애플리케이션의 각 사용자가 본인 계정에 대해 여러 개의 API 토큰을 생성할 수 있습니다. 이 토큰에는 특정 권한(abilities/scopes)을 부여하여 해당 토큰으로 허용된 작업을 세분화할 수 있습니다.

<a name="how-it-works"></a>
### 동작 방식

Laravel Sanctum은 두 가지 별개의 문제를 해결하기 위해 만들어졌습니다. 본격적으로 살펴보기 전에 각각의 목적을 먼저 설명합니다.

<a name="how-it-works-api-tokens"></a>
#### API 토큰

첫 번째로, Sanctum은 OAuth 같은 복잡한 방식을 사용하지 않고도 사용자에게 API 토큰을 발급할 수 있게 해 주는 단순한 패키지입니다. 이 기능은 GitHub 등에서 제공하는 "개인 액세스 토큰(Personal Access Token)"에서 영감을 받았습니다. 예를 들어, 애플리케이션의 '계정 설정' 화면에서 사용자가 본인의 API 토큰을 직접 발급받을 수 있는 기능이 있다고 생각해보겠습니다. 이런 경우에 Sanctum을 활용하여 토큰을 생성하고 관리할 수 있습니다. 이러한 토큰은 보통 매우 긴 유효기간(수년 이상)을 가지지만, 사용자가 언제든 직접 폐기(삭제)할 수 있습니다.

Laravel Sanctum은 사용자 API 토큰을 단일 데이터베이스 테이블에 저장하고, 클라이언트의 HTTP 요청에는 `Authorization` 헤더에 유효한 API 토큰을 포함시켜 인증을 처리합니다.

<a name="how-it-works-spa-authentication"></a>
#### SPA 인증

두 번째로, Sanctum은 라라벨 기반 API와 통신해야 하는 SPA(싱글 페이지 애플리케이션)를 인증하는 간단한 방법을 제공합니다. 이러한 SPA는 라라벨 애플리케이션과 같은 저장소(Repository)에 존재할 수도 있고, 예를 들어 Vue CLI나 Next.js로 제작된 별도 저장소의 SPA일 수도 있습니다.

이 기능을 위해 Sanctum은 별도의 토큰을 사용하지 않습니다. 대신, 라라벨이 기본적으로 제공하는 쿠키 기반 세션 인증 방식을 활용합니다. 일반적으로 Sanctum은 라라벨의 `web` 인증 가드를 사용하여 인증을 처리합니다. 이를 통해 CSRF 보호, 세션 기반 인증, 인증 정보가 XSS로 인해 노출되는 것을 방지하는 다양한 보안 혜택을 누릴 수 있습니다.

Sanctum은 클라이언트 요청이 여러분의 SPA 프런트엔드에서 왔을 때에만 쿠키 인증을 시도합니다. 요청을 받으면 우선 인증 쿠키가 있는지 확인하고, 쿠키가 없을 경우 `Authorization` 헤더에 유효한 API 토큰이 있는지 검사합니다.

> [!TIP]
> Sanctum을 오직 API 토큰 인증 목적이나 SPA 인증 중 한 가지 만으로만 사용하는 것도 완전히 정상적입니다. 반드시 두 기능을 모두 쓸 필요는 없습니다.

<a name="installation"></a>
## 설치

> [!TIP]
> 최신 버전의 라라벨에는 Sanctum이 이미 포함되어 있습니다. 하지만 애플리케이션의 `composer.json`에 `laravel/sanctum`이 없다면 아래의 설치 방법을 따라 진행하시면 됩니다.

Composer 패키지 매니저로 Laravel Sanctum을 설치할 수 있습니다.

```
composer require laravel/sanctum
```

다음으로, `vendor:publish` 아티즌 명령어를 이용해 Sanctum의 설정 파일과 마이그레이션을 퍼블리시(publish)해야 합니다. `sanctum` 설정 파일은 애플리케이션의 `config` 디렉터리에 생성됩니다.

```
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

마지막으로 데이터베이스 마이그레이션을 실행합니다. Sanctum은 API 토큰을 저장할 테이블 하나를 생성합니다.

```
php artisan migrate
```

또한 SPA 인증 기능을 사용할 예정이라면, `app/Http/Kernel.php` 파일의 `api` 미들웨어 그룹에 Sanctum의 미들웨어를 추가해야 합니다.

```
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

<a name="migration-customization"></a>
#### 마이그레이션 커스터마이징

Sanctum의 기본 마이그레이션을 사용하지 않을 경우, `App\Providers\AppServiceProvider` 클래스의 `register` 메서드에서 `Sanctum::ignoreMigrations` 메서드를 호출해야 합니다. 기본 마이그레이션 파일을 내보내려면 다음 명령어를 실행하십시오: `php artisan vendor:publish --tag=sanctum-migrations`

<a name="configuration"></a>
## 설정

<a name="overriding-default-models"></a>
### 기본 모델 오버라이드

일반적으로 필요하지는 않지만, Sanctum이 내부적으로 사용하는 `PersonalAccessToken` 모델을 확장하여 직접 커스터마이징할 수 있습니다.

```
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    // ...
}
```

이후 Sanctum에서 커스텀 모델을 사용하도록 `usePersonalAccessTokenModel` 메서드를 호출해야 합니다. 주로 서비스 프로바이더의 `boot` 메서드 내에서 이 메서드를 사용합니다.

```
use App\Models\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
}
```

<a name="api-token-authentication"></a>
## API 토큰 인증

> [!TIP]
> 여러분이 직접 만든 SPA에서는 API 토큰 인증을 사용하지 않아야 합니다. 대신 Sanctum의 [SPA 인증 기능](#spa-authentication)을 사용하세요.

<a name="issuing-api-tokens"></a>
### API 토큰 발급

Sanctum을 사용하면 API 요청을 인증할 수 있도록 API 토큰(개인 액세스 토큰)을 발급할 수 있습니다. API 토큰을 사용할 때는 요청 헤더의 `Authorization`에 `Bearer` 토큰 형식으로 토큰을 포함시켜야 합니다.

사용자를 위한 토큰 발급을 시작하려면, User 모델에 `Laravel\Sanctum\HasApiTokens` 트레이트를 추가해야 합니다.

```
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}
```

토큰을 발급하려면 `createToken` 메서드를 사용하면 됩니다. 이 메서드는 `Laravel\Sanctum\NewAccessToken` 인스턴스를 반환합니다. 생성된 API 토큰은 데이터베이스에 저장되기 전에 SHA-256 해시 처리되지만, 토큰의 원본 값을 `NewAccessToken` 인스턴스의 `plainTextToken` 속성을 통해 바로 확인할 수 있습니다. 반드시 토큰이 생성된 직후 사용자에게 이 값을 보여주어야 합니다.

```
use Illuminate\Http\Request;

Route::post('/tokens/create', function (Request $request) {
    $token = $request->user()->createToken($request->token_name);

    return ['token' => $token->plainTextToken];
});
```

`HasApiTokens` 트레이트가 제공하는 `tokens` Eloquent 연관관계를 사용해 사용자가 가지고 있는 모든 토큰을 조회할 수도 있습니다.

```
foreach ($user->tokens as $token) {
    //
}
```

<a name="token-abilities"></a>
### 토큰 권한(Abilities)

Sanctum을 이용하면 토큰에 '권한(abilities)'을 부여할 수 있습니다. 이는 OAuth의 '스코프(scopes)'와 유사한 역할을 합니다. `createToken` 메서드의 두 번째 인수로 문자열 배열 형태의 권한 목록을 지정할 수 있습니다.

```
return $user->createToken('token-name', ['server:update'])->plainTextToken;
```

이후 Sanctum으로 인증된 요청에서 해당 토큰에 특정 권한이 있는지 확인하려면 `tokenCan` 메서드를 사용합니다.

```
if ($user->tokenCan('server:update')) {
    //
}
```

<a name="token-ability-middleware"></a>
#### 토큰 권한 미들웨어

Sanctum에는 주어진 권한을 가진 토큰으로 요청이 인증되었는지 검증할 수 있는 미들웨어도 두 가지 포함되어 있습니다. 먼저, 아래와 같이 애플리케이션의 `app/Http/Kernel.php` 파일의 `$routeMiddleware` 속성에 미들웨어를 등록하세요.

```
'abilities' => \Laravel\Sanctum\Http\Middleware\CheckAbilities::class,
'ability' => \Laravel\Sanctum\Http\Middleware\CheckForAnyAbility::class,
```

`abilities` 미들웨어는 해당 요청의 토큰이 지정된 모든 권한을 가지고 있는지 확인합니다.

```
Route::get('/orders', function () {
    // 토큰에 "check-status"와 "place-orders" 두 가지 권한이 모두 있어야 함...
})->middleware(['auth:sanctum', 'abilities:check-status,place-orders']);
```

`ability` 미들웨어는 지정된 권한 중 *하나 이상*만 가지고 있으면 허용합니다.

```
Route::get('/orders', function () {
    // 토큰이 "check-status" 또는 "place-orders" 권한 중 하나라도 보유 시 허용...
})->middleware(['auth:sanctum', 'ability:check-status,place-orders']);
```

<a name="first-party-ui-initiated-requests"></a>
#### 1차 UI(First-Party UI)에서 발생한 요청

편의를 위해, 인증된 요청이 여러분의 자체 SPA에서 왔고 Sanctum의 [SPA 인증](#spa-authentication)을 사용한 경우에는 `tokenCan` 메서드는 항상 `true`를 반환합니다.

하지만 이는 해당 사용자가 직접적으로 허용된 작업을 반드시 수행할 수 있다는 의미는 아닙니다. 실제로는 애플리케이션의 [인가 정책](/docs/8.x/authorization#creating-policies)에서 토큰에 주어진 권한 및 해당 사용자 인스턴스가 해당 권한을 행사할 자격이 있는지 별도로 다시 확인해야 합니다.

예를 들어, 서버를 관리하는 애플리케이션에서, 토큰이 서버 업데이트 권한을 가지고 있고, 해당 서버가 실제로 이 사용자에 속하는지도 추가로 검사할 수 있습니다.

```php
return $request->user()->id === $server->user_id &&
       $request->user()->tokenCan('server:update')
```

SPA에서 발생한 요청에 대해 항상 `tokenCan`이 `true`를 반환하는 것에 대해 생소하게 느껴질 수 있습니다. 그러나 이 덕분에 항상 API 토큰이 존재하며, 해당 토큰에 대해 `tokenCan`으로 권한을 검사할 수 있다고 가정할 수 있으므로, 애플리케이션의 인가 정책 내부 어디서든 일관성 있게 권한 체크를 할 수 있습니다.

<a name="protecting-routes"></a>
### 라우트 보호

인증이 반드시 필요한 라우트는 `routes/web.php` 및 `routes/api.php` 파일에서 해당 라우트에 `sanctum` 인증 가드를 적용하여 보호해야 합니다. 이 가드는 stateful(쿠키 인증) 방식이든, 서드파티 요청에서 API 토큰 헤더를 통해서든, 모든 경우에 요청이 인증되었는지 확인합니다.

특히 `routes/web.php` 파일에서도 `sanctum` 가드를 적용하는 이유는, Sanctum이 먼저 라라벨의 세션 인증 쿠키를 우선적으로 사용해 요청을 인증하고, 쿠키가 없으면 요청의 `Authorization` 헤더 내 토큰을 사용하기 때문입니다. 모든 요청에 Sanctum 인증을 통일해서 적용하면, 현재 인증된 사용자 인스턴스에서 언제든지 `tokenCan`을 호출하여 토큰 권한 검증을 일관성 있게 할 수 있습니다.

```
use Illuminate\Http\Request;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
```

<a name="revoking-tokens"></a>
### 토큰 폐기

`Laravel\Sanctum\HasApiTokens` 트레이트가 제공하는 `tokens` 연관관계를 이용해 데이터베이스에서 토큰을 삭제함으로써 토큰을 "폐기"할 수 있습니다.

```
// 모든 토큰 폐기...
$user->tokens()->delete();

// 현재 요청에 사용된 토큰만 폐기...
$request->user()->currentAccessToken()->delete();

// 특정 토큰만 폐기...
$user->tokens()->where('id', $tokenId)->delete();
```

<a name="spa-authentication"></a>
## SPA 인증

Sanctum은 SPA(싱글 페이지 애플리케이션)에서 라라벨 기반 API와 통신해야 하는 경우에도 간단하게 인증을 처리할 수 있는 기능을 제공합니다. 이 SPA는 라라벨 프로젝트 안에 있어도 되고, 외부에 별도로 관리되는 프로젝트일 수도 있습니다.

이 기능에서는 별도의 토큰을 발급하지 않고, 라라벨의 쿠키 기반 세션 인증 서비스를 그대로 사용합니다. 이 방식은 CSRF 보호, 세션 기반 인증, 인증 정보가 XSS 등으로 외부에 노출되는 것을 막는 다양한 보안상의 장점을 제공합니다.

> [!NOTE]
> SPA와 API는 반드시 같은 최상위 도메인을 공유해야 인증이 가능합니다. 단, 서로 다른 서브도메인에서는 사용 가능합니다. 또한, 요청 시 `Accept: application/json` 헤더를 반드시 함께 보내야 합니다.

<a name="spa-configuration"></a>
### 설정

<a name="configuring-your-first-party-domains"></a>
#### 1차 도메인(First-Party Domains) 설정

먼저, SPA가 요청을 보내는 도메인을 지정해야 합니다. Sanctum의 `config/sanctum.php` 파일의 `stateful` 옵션에 도메인을 설정할 수 있습니다. 이 설정은 어떤 도메인이 라라벨 세션 쿠키와 함께 "stateful" 인증을 유지할 수 있을지를 결정합니다.

> [!NOTE]
> URL에 포트 번호(예: `127.0.0.1:8000`)가 포함된 경우 포트 번호까지 포함하여 도메인을 설정해야 합니다.

<a name="sanctum-middleware"></a>
#### Sanctum 미들웨어

그 다음 `app/Http/Kernel.php` 파일에서 `api` 미들웨어 그룹에 Sanctum의 미들웨어를 추가해야 합니다. 이 미들웨어는 SPA가 세션 쿠키를 이용하여 인증할 수 있도록 해주며, 서드파티나 모바일 앱의 토큰 인증도 지원합니다.

```
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

<a name="cors-and-cookies"></a>
#### CORS & 쿠키

SPA가 별도의 서브도메인에서 라라벨 애플리케이션에 인증 요청을 보낼 때 인증이 잘 되지 않는다면, CORS(크로스-오리진 리소스 공유)나 세션 쿠키 설정이 잘못되었을 가능성이 높습니다.

먼저, CORS 설정에서 `Access-Control-Allow-Credentials` 헤더가 `True`로 반환되도록 해야 합니다. 이를 위해, 애플리케이션의 `config/cors.php` 설정 파일에서 `supports_credentials` 옵션을 `true`로 변경해야 합니다.

또한 프런트엔드에서 HTTP 요청을 보낼 때, Axios의 경우 전역 설정에서 `withCredentials` 옵션도 켜야 합니다. 주로 `resources/js/bootstrap.js` 파일에서 다음과 같이 설정합니다. 만약 Axios 대신 다른 HTTP 클라이언트를 사용한다면, 해당 라이브러리의 방법에 맞게 동일하게 설정해야 합니다.

```
axios.defaults.withCredentials = true;
```

마지막으로, 세션 쿠키가 루트 도메인의 모든 서브도메인에서 동작하도록 하려면, 애플리케이션의 `config/session.php`에서 도메인 값을 앞에 점(`.`)을 붙여 설정하십시오.

```
'domain' => '.domain.com',
```

<a name="spa-authenticating"></a>
### 인증 처리

<a name="csrf-protection"></a>
#### CSRF 보호

SPA의 인증을 위해서는, 우선 "로그인" 페이지에서 `/sanctum/csrf-cookie` 엔드포인트로 요청을 보내 애플리케이션의 CSRF 보호를 초기화해야 합니다.

```
axios.get('/sanctum/csrf-cookie').then(response => {
    // 로그인 처리...
});
```

이 요청 시 라라벨은 현재 CSRF 토큰이 들어 있는 `XSRF-TOKEN` 쿠키를 응답에 포함시킵니다. 이 토큰은 이후의 요청에서 `X-XSRF-TOKEN` 헤더에 넣어주어야 하며, Axios나 Angular HttpClient 등 일부 HTTP 라이브러리는 이 과정을 자동으로 처리해줍니다. 만약 직접 사용하는 HTTP 라이브러리에서 자동으로 처리해주지 않는다면, 수동으로 `XSRF-TOKEN` 쿠키의 값을 읽어서 `X-XSRF-TOKEN` 헤더에 넣어주어야 합니다.

<a name="logging-in"></a>
#### 로그인

CSRF 보호가 초기화되면, 이제 Laravel 애플리케이션의 `/login` 라우트에 `POST` 요청을 보내 로그인 처리를 할 수 있습니다. 이 `/login` 라우트는 [수동으로 구현](/docs/8.x/authentication#authenticating-users)할 수도 있고, [Laravel Fortify](/docs/8.x/fortify) 같은 헤드리스 인증 패키지를 사용할 수도 있습니다.

로그인 요청에 성공하면 인증이 완료되고, 이후의 모든 요청에 자동으로 세션 쿠키가 포함되어 있으므로 별도의 작업 없이 인증 상태가 유지됩니다. 또한, 앞서 `/sanctum/csrf-cookie`에 요청한 덕분에 CSRF 보호도 정상적으로 적용됩니다(단, HTTP 클라이언트가 반드시 `XSRF-TOKEN` 쿠키 값을 `X-XSRF-TOKEN` 헤더로 전송해야 함).

만약 일정 시간 활동이 없어 세션이 만료되면, 이후의 요청에 대해 401 또는 419 HTTP 오류가 발생할 수 있습니다. 이 경우 사용자를 SPA의 로그인 페이지로 리다이렉트해야 합니다.

> [!NOTE]
> `/login` 엔드포인트를 직접 작성해도 상관 없습니다. 단, [라라벨이 제공하는 기본 세션 기반 인증 서비스](/docs/8.x/authentication#authenticating-users)를 통해 인증을 처리하도록 구현해야 하며, 대개 `web` 인증 가드를 사용해야 합니다.

<a name="protecting-spa-routes"></a>
### 라우트 보호

API 라우트를 인증이 필요한 상태로 보호하려면, `routes/api.php` 파일의 해당 라우트에 `sanctum` 인증 가드를 적용하세요. 이 가드는 SPA에서 온 stateful 인증 요청에는 세션 쿠키를, 서드파티 요청에는 API 토큰 헤더 인증을 지원합니다.

```
use Illuminate\Http\Request;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
```

<a name="authorizing-private-broadcast-channels"></a>
### 프라이빗 브로드캐스트 채널 인가

SPA에서 [프라이빗/프레즌스 브로드캐스트 채널](/docs/8.x/broadcasting#authorizing-channels) 인증이 필요하다면, `routes/api.php` 파일에 `Broadcast::routes` 메서드를 다음과 같이 작성해야 합니다.

```
Broadcast::routes(['middleware' => ['auth:sanctum']]);
```

그리고 Pusher의 인증 요청이 올바르게 처리되도록, [Laravel Echo 클라이언트](/docs/8.x/broadcasting#client-side-installation)를 초기화할 때 Pusher의 `authorizer` 옵션을 커스텀으로 지정해 주어야 합니다. 이렇게 하면 CORS 및 쿠키 설정이 제대로 적용된 axios 인스턴스를 사용할 수 있습니다.

```
window.Echo = new Echo({
    broadcaster: "pusher",
    cluster: process.env.MIX_PUSHER_APP_CLUSTER,
    encrypted: true,
    key: process.env.MIX_PUSHER_APP_KEY,
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

모바일 애플리케이션의 API 요청을 인증하려면 Sanctum 토큰을 사용할 수 있습니다. 모바일 인증 방식은 서드파티 API 요청 인증 방식과 유사하지만, 토큰 발급 방법에 약간의 차이가 있습니다.

<a name="issuing-mobile-api-tokens"></a>
### API 토큰 발급

먼저, 사용자의 이메일/이름, 비밀번호, 그리고 기기 이름(device name)을 받아서 새로운 Sanctum 토큰을 발급해주는 라우트를 만듭니다. 이때의 "기기 이름" 값은 단순 참고용으로 어떤 문자열이든 지정할 수 있지만, 사용자가 쉽게 식별할 수 있게(예: "민수의 iPhone 12") 지정하는 것이 좋습니다.

보통은 모바일 앱의 "로그인" 화면에서 이 엔드포인트로 요청을 보내 토큰을 받고, 발급된 API 토큰을 디바이스에 저장하여 이후 추가적인 API 요청에 사용합니다.

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

모바일 앱이 API 요청 시에는 토큰을 `Authorization` 헤더에 `Bearer` 토큰 형식으로 포함해 전달해야 합니다.

> [!TIP]
> 모바일 앱에 토큰을 발급할 때도 [토큰 권한](#token-abilities)을 지정할 수 있습니다.

<a name="protecting-mobile-api-routes"></a>
### 라우트 보호

앞서 살펴본 것과 같이, `sanctum` 인증 가드를 라우트에 적용하여 모든 요청이 인증되었는지 확인할 수 있습니다.

```
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
```

<a name="revoking-mobile-api-tokens"></a>
### 토큰 폐기

모바일 기기에 발급된 API 토큰을 사용자가 폐기(무효화)할 수 있도록 하려면, 웹 애플리케이션의 '계정 설정' UI 등에서 토큰 이름과 함께 "폐기" 버튼을 제공하는 것이 좋습니다. 사용자가 폐기 버튼을 누르면 데이터베이스에서 해당 토큰을 삭제하면 됩니다. 토큰 목록은 `Laravel\Sanctum\HasApiTokens` 트레이트의 `tokens` 연관관계를 통해 조회할 수 있습니다.

```
// 모든 토큰 폐기...
$user->tokens()->delete();

// 특정 토큰만 폐기...
$user->tokens()->where('id', $tokenId)->delete();
```

<a name="testing"></a>
## 테스트

테스트 환경에서는, `Sanctum::actingAs` 메서드를 사용해 사용자를 인증하고 해당 토큰에 특정 권한을 지정할 수 있습니다.

```
use App\Models\User;
use Laravel\Sanctum\Sanctum;

public function test_task_list_can_be_retrieved()
{
    Sanctum::actingAs(
        User::factory()->create(),
        ['view-tasks']
    );

    $response = $this->get('/api/task');

    $response->assertOk();
}
```

만약 토큰에 모든 권한을 부여하고 싶다면, `actingAs` 메서드의 권한 목록에 `*`를 포함하면 됩니다.

```
Sanctum::actingAs(
    User::factory()->create(),
    ['*']
);
```
