# 라라벨 Sanctum (Laravel Sanctum)

- [소개](#introduction)
    - [동작 방식](#how-it-works)
- [설치](#installation)
- [설정](#configuration)
    - [기본 모델 덮어쓰기](#overriding-default-models)
- [API 토큰 인증](#api-token-authentication)
    - [API 토큰 발급](#issuing-api-tokens)
    - [토큰 권한(Abilities)](#token-abilities)
    - [라우트 보호](#protecting-routes)
    - [토큰 회수](#revoking-tokens)
    - [토큰 만료](#token-expiration)
- [SPA 인증](#spa-authentication)
    - [설정](#spa-configuration)
    - [인증하기](#spa-authenticating)
    - [라우트 보호](#protecting-spa-routes)
    - [Private 브로드캐스트 채널 인가](#authorizing-private-broadcast-channels)
- [모바일 애플리케이션 인증](#mobile-application-authentication)
    - [API 토큰 발급](#issuing-mobile-api-tokens)
    - [라우트 보호](#protecting-mobile-api-routes)
    - [토큰 회수](#revoking-mobile-api-tokens)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

[Laravel Sanctum](https://github.com/laravel/sanctum)은 싱글 페이지 애플리케이션(SPA), 모바일 애플리케이션, 그리고 간단한 토큰 기반 API를 위한 가볍고 효율적인 인증 시스템을 제공합니다. Sanctum을 사용하면 애플리케이션의 각 사용자가 자신의 계정에 대해 여러 개의 API 토큰을 생성할 수 있습니다. 이 토큰에는 권한(abilities)이나 범위(scopes)를 지정하여, 토큰이 수행할 수 있는 작업을 세밀하게 제어할 수 있습니다.

<a name="how-it-works"></a>
### 동작 방식

Laravel Sanctum은 서로 다른 두 가지 문제를 해결하기 위해 만들어졌습니다. 각 문제에 대해 간단히 살펴본 후, 라이브러리의 세부 사항을 알아보겠습니다.

<a name="how-it-works-api-tokens"></a>
#### API 토큰

Sanctum은 우선 OAuth 같은 복잡한 방식이 아닌, 간단하게 사용자에게 API 토큰을 발급할 수 있도록 도와주는 패키지입니다. 이 기능은 GitHub 등 여러 서비스에서 제공하는 "개인용 접근 토큰"에서 영감을 받아 만들어졌습니다. 예를 들어, 여러분의 애플리케이션 내 "계정 설정" 화면에서 사용자가 자신의 계정용 API 토큰을 직접 생성할 수 있다고 가정해봅시다. Sanctum은 이러한 토큰을 쉽게 생성하고 관리할 수 있게 도와줍니다. 이 토큰들은 보통 매우 긴 만료 기간(수년)을 가지지만, 사용자가 직접 언제든지 토큰을 수동으로 회수(삭제)할 수 있습니다.

Laravel Sanctum은 모든 사용자 API 토큰을 하나의 데이터베이스 테이블에 저장하고, 들어오는 HTTP 요청의 `Authorization` 헤더에 유효한 API 토큰이 포함되어 있는지 확인하여 인증을 처리합니다.

<a name="how-it-works-spa-authentication"></a>
#### SPA 인증

둘째, Sanctum은 라라벨 기반 API와 통신하는 싱글 페이지 애플리케이션(SPA)을 인증하는 간단한 방식을 제공합니다. 이러한 SPA는 라라벨 애플리케이션과 같은 저장소(repo)에 있을 수도 있고, 별도의 저장소(예: Vue CLI로 만든 SPA, Next.js 애플리케이션 등)에 있을 수도 있습니다.

이 기능에서는 별도의 토큰을 사용하지 않습니다. Sanctum은 라라벨의 기본 쿠키 기반 세션 인증 기능을 그대로 활용합니다. 일반적으로 이 방식을 위해 라라벨의 `web` 인증 가드가 사용됩니다. 이 방법은 CSRF 보호, 세션 인증, 그리고 인증 정보가 XSS를 통해 노출되는 위험을 막는 등 여러 보안상 이점을 함께 제공합니다.

Sanctum은 오직 여러분의 SPA 프론트엔드에서 시작된 요청에 대해서만 쿠키 기반 인증을 시도합니다. 들어오는 HTTP 요청을 처리할 때, 먼저 인증 쿠키가 있는지 확인하고(있다면 세션 기반 인증), 쿠키가 없다면 `Authorization` 헤더를 확인해서 유효한 API 토큰이 있는지 검사합니다.

> [!NOTE]
> Sanctum의 단일 기능만 사용해도 전혀 문제 없습니다. 즉, API 토큰 인증만 하거나 SPA 인증만 사용할 수 있습니다. Sanctum을 사용한다고 두 가지 모두 반드시 써야 하는 것은 아닙니다.

<a name="installation"></a>
## 설치

> [!NOTE]
> 최신 버전의 라라벨에는 Sanctum이 이미 포함되어 있습니다. 하지만 애플리케이션의 `composer.json`에 `laravel/sanctum`이 없다면, 아래 설명에 따라 직접 설치하면 됩니다.

Composer 패키지 매니저를 이용해 Laravel Sanctum을 설치할 수 있습니다:

```shell
composer require laravel/sanctum
```

다음으로, `vendor:publish` 아티즌 명령어를 사용해 Sanctum의 설정 파일과 마이그레이션 파일을 발행합니다. `sanctum` 설정 파일은 애플리케이션의 `config` 디렉터리에 생성됩니다.

```shell
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

마지막으로, 데이터베이스 마이그레이션을 실행해야 합니다. Sanctum은 API 토큰을 저장할 하나의 데이터베이스 테이블을 생성합니다:

```shell
php artisan migrate
```

만약 SPA 인증도 함께 사용하려 한다면, `app/Http/Kernel.php` 파일의 `api` 미들웨어 그룹에 아래와 같이 Sanctum 미들웨어를 추가해야 합니다:

```
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

<a name="migration-customization"></a>
#### 마이그레이션 커스터마이징

Sanctum의 기본 마이그레이션을 사용하지 않을 예정이라면, `App\Providers\AppServiceProvider` 클래스의 `register` 메서드에서 `Sanctum::ignoreMigrations` 메서드를 호출해야 합니다. 또는, 아래 명령어로 기본 마이그레이션 파일만 따로 내보낼 수도 있습니다: `php artisan vendor:publish --tag=sanctum-migrations`

<a name="configuration"></a>
## 설정

<a name="overriding-default-models"></a>
### 기본 모델 덮어쓰기

보통은 필요 없지만, Sanctum에서 내부적으로 사용하는 `PersonalAccessToken` 모델을 확장해서 커스터마이즈할 수 있습니다:

```
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    // ...
}
```

그런 다음, Sanctum이 여러분의 커스텀 모델을 사용하도록 `usePersonalAccessTokenModel` 메서드를 호출합니다. 보통 이 코드는 애플리케이션의 서비스 프로바이더 중 하나의 `boot` 메서드 안에 작성합니다.

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

> [!NOTE]
> 여러분이 직접 만든 SPA에서 인증할 때는 API 토큰을 사용해서는 안 됩니다. 이 경우에는 Sanctum의 [SPA 인증 기능](#spa-authentication)을 활용하세요.

<a name="issuing-api-tokens"></a>
### API 토큰 발급

Sanctum을 활용하면, API 요청을 인증하기 위한 API 토큰 또는 개인용 접근 토큰을 손쉽게 발급할 수 있습니다. API 토큰을 사용하는 경우, 해당 토큰을 `Authorization` 헤더의 `Bearer` 토큰 형식으로 포함시켜 요청해야 합니다.

토큰 발급을 시작하려면, User 모델에 `Laravel\Sanctum\HasApiTokens` 트레이트를 추가해야 합니다:

```
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}
```

토큰 발급은 `createToken` 메서드를 사용합니다. 이 메서드는 `Laravel\Sanctum\NewAccessToken` 인스턴스를 반환합니다. 발급된 API 토큰은 SHA-256 해시로 데이터베이스에 저장되지만, 토큰이 생성된 직후 `plainTextToken` 속성을 통해 원본 토큰 값을 얻을 수 있습니다. 이 값은 반드시 토큰 생성 직후 사용자에게 보여주어야 합니다:

```
use Illuminate\Http\Request;

Route::post('/tokens/create', function (Request $request) {
    $token = $request->user()->createToken($request->token_name);

    return ['token' => $token->plainTextToken];
});
```

`HasApiTokens` 트레이트에서 제공하는 Eloquent 연관관계인 `tokens`를 이용해 사용자의 모든 토큰을 조회할 수도 있습니다:

```
foreach ($user->tokens as $token) {
    //
}
```

<a name="token-abilities"></a>
### 토큰 권한(Abilities)

Sanctum에서는 토큰에 "권한(abilities)"을 지정할 수 있습니다. 권한은 OAuth의 "scopes"와 비슷한 역할을 합니다. `createToken` 메서드의 두 번째 인수로 문자열 배열 형태의 권한 리스트를 전달할 수 있습니다:

```
return $user->createToken('token-name', ['server:update'])->plainTextToken;
```

Sanctum 인증된 요청을 처리할 때, 토큰에 특정 권한이 있는지 `tokenCan` 메서드로 확인할 수 있습니다:

```
if ($user->tokenCan('server:update')) {
    //
}
```

<a name="token-ability-middleware"></a>
#### 토큰 권한 미들웨어

Sanctum에는, 요청을 인증할 때 해당 토큰에 특정 권한이 부여되어 있는지 확인할 수 있도록 해주는 두 가지 미들웨어가 포함되어 있습니다. 먼저, 아래 미들웨어를 애플리케이션의 `app/Http/Kernel.php` 파일 내 `$routeMiddleware` 속성에 추가하세요:

```
'abilities' => \Laravel\Sanctum\Http\Middleware\CheckAbilities::class,
'ability' => \Laravel\Sanctum\Http\Middleware\CheckForAnyAbility::class,
```

`abilities` 미들웨어는 지정된 모든 권한을 토큰이 반드시 가지고 있어야 라우트 요청을 허용합니다:

```
Route::get('/orders', function () {
    // 토큰에 "check-status"와 "place-orders" 권한이 모두 있어야 허용...
})->middleware(['auth:sanctum', 'abilities:check-status,place-orders']);
```

`ability` 미들웨어는 지정된 권한 중 하나라도 토큰이 가지고 있으면 라우트 요청을 허용합니다:

```
Route::get('/orders', function () {
    // 토큰에 "check-status" 또는 "place-orders" 권한이 하나라도 있으면 허용...
})->middleware(['auth:sanctum', 'ability:check-status,place-orders']);
```

<a name="first-party-ui-initiated-requests"></a>
#### 자체(1st-party) UI에서 발생한 요청

편의상, 자체 SPA에서 발생한 인증된 요청에 대해 `tokenCan` 메서드는 무조건 `true`를 반환합니다. (즉, 여러분이 Sanctum의 [SPA 인증 기능](#spa-authentication)을 사용하고 있는 경우에 한함)

하지만, 이것이 무조건 사용자가 모든 작업을 수행할 수 있음을 의미하지는 않습니다. 실제로는 [인가 정책](/docs/9.x/authorization#creating-policies)이 해당 권한이 부여되었는지와 함께, 사용자 인스턴스 자체가 해당 작업을 수행할 수 있는지도 함께 검사하게 됩니다.

예를 들어, 서버 관리 애플리케이션이라면 토큰이 서버 업데이트 권한을 가지고 있을 뿐 아니라, 해당 서버가 현재 사용자 소유임도 함께 검사해야 합니다:

```php
return $request->user()->id === $server->user_id &&
       $request->user()->tokenCan('server:update')
```

이처럼 자체(1st-party) UI에서 발생한 요청에 대해 `tokenCan`이 항상 `true`를 반환하는 것이 처음에는 다소 생소할 수 있습니다. 하지만, 이렇게 하면 항상 API 토큰이 존재한다고 가정하고, 언제든지 `tokenCan`을 통해 권한을 검사할 수 있어 정책 코드가 더 간단해집니다. 요청이 UI에서 발생했는지, 외부 API 소비자에서 발생했는지 신경쓰지 않고 `tokenCan`을 호출할 수 있으므로 편리합니다.

<a name="protecting-routes"></a>
### 라우트 보호

모든 들어오는 요청에 대해 인증을 강제하려면, `routes/web.php` 또는 `routes/api.php` 라우트 파일에서 보호하려는 라우트에 `sanctum` 인증 가드를 적용해야 합니다. 이 가드를 사용하면 요청이 상태를 가진(쿠키 기반 인증) 요청이든, 또는 외부에서 오는 API 토큰 인증이든 모두 처리할 수 있습니다.

특히 `routes/web.php` 파일에서 `sanctum` 가드를 직접 사용하도록 안내하는 이유는, Sanctum이 우선적으로 라라벨의 일반적인 세션 인증 쿠키를 통해 인증을 시도하기 때문입니다. 만약 쿠키가 없다면 그 다음에 요청의 `Authorization` 헤더에 토큰이 있는지 확인합니다. 이렇게 모든 요청에 대해 Sanctum으로 인증하면, 언제든지 현재 인증된 사용자 인스턴스에서 `tokenCan` 메서드를 사용할 수 있습니다:

```
use Illuminate\Http\Request;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
```

<a name="revoking-tokens"></a>
### 토큰 회수

토큰을 더이상 사용하지 않게 하려면(=회수), `Laravel\Sanctum\HasApiTokens` 트레이트에서 제공하는 `tokens` 연관관계를 통해 해당 토큰을 데이터베이스에서 삭제하면 됩니다:

```
// 모든 토큰 회수(삭제)...
$user->tokens()->delete();

// 현재 요청을 인증한 토큰만 회수(삭제)...
$request->user()->currentAccessToken()->delete();

// 특정 토큰만 회수(삭제)...
$user->tokens()->where('id', $tokenId)->delete();
```

<a name="token-expiration"></a>
### 토큰 만료

기본적으로 Sanctum의 토큰은 만료되지 않으며, 오직 [토큰을 회수](#revoking-tokens)할 때만 무효화됩니다. 하지만 원한다면 `sanctum` 설정 파일의 `expiration` 옵션을 통해 API 토큰의 만료 시간을 분 단위로 설정할 수 있습니다:

```php
'expiration' => 525600,
```

만약 토큰 만료 시간을 설정했다면, 만료된 토큰을 정기적으로 정리(삭제)하도록 [스케줄러 작업](/docs/9.x/scheduling)을 등록하는 것이 좋습니다. 다행히 Sanctum에선 만료된 토큰을 삭제하는 `sanctum:prune-expired` 아티즌 명령어를 제공합니다. 예시로, 만료된 지 24시간이 지난 토큰 레코드를 매일 삭제하도록 예약할 수 있습니다:

```php
$schedule->command('sanctum:prune-expired --hours=24')->daily();
```

<a name="spa-authentication"></a>
## SPA 인증

Sanctum은 라라벨 기반 API와 통신해야 하는 싱글 페이지 애플리케이션(SPA)을 간단하게 인증하기 위한 메서드도 제공합니다. 이 SPA는 라라벨 애플리케이션과 같은 저장소에 있을 수도, 별도의 저장소일 수도 있습니다.

이 기능에서는 별도 토큰을 사용하지 않고, 라라벨의 내장 쿠키 기반 세션 인증 서비스를 그대로 활용합니다. 이런 접근 방식은 CSRF 보호, 세션 인증, 인증 자격 증명의 XSS(스크립트 삽입 공격)로 인한 유출 방지 등 여러 장점을 제공합니다.

> [!WARNING]
> SPA와 API가 반드시 동일한 최상위 도메인을 공유해야 인증이 가능합니다. 하지만 서로 다른 서브도메인에 위치해 있어도 무방합니다. 또한, 요청 보낼 때 `Accept: application/json` 헤더가 포함되어 있어야 합니다.

<a name="spa-configuration"></a>
### 설정

<a name="configuring-your-first-party-domains"></a>
#### 자신의 도메인 설정

먼저, SPA가 어느 도메인에서 요청을 보낼지 지정해야 합니다. 이는 `sanctum` 설정 파일의 `stateful` 옵션에서 지정할 수 있습니다. 이 옵션 목록에 추가된 도메인에서 들어오는 요청에 대해서는 Laravel 세션 쿠키를 통해 "상태를 유지(stateful)"하며 인증하게 됩니다.

> [!WARNING]
> 포트가 포함된 URL(예: `127.0.0.1:8000`)로 접속 중이라면, 반드시 domain에 포트 번호까지 포함해야 합니다.

<a name="sanctum-middleware"></a>
#### Sanctum 미들웨어 추가

다음으로, `app/Http/Kernel.php` 파일의 `api` 미들웨어 그룹에 Sanctum의 미들웨어를 추가합니다. 이러한 미들웨어를 적용해야 SPA 프론트엔드에서 세션 쿠키 인증을 이용할 수 있으며, 외부나 모바일 앱에서는 계속해서 토큰 인증을 사용할 수 있습니다:

```
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

<a name="cors-and-cookies"></a>
#### CORS 및 쿠키

별도의 서브도메인에서 실행되는 SPA가 인증에 실패한다면, CORS(크로스 도메인) 또는 세션 쿠키 설정이 잘못되었을 가능성이 높습니다.

CORS 설정에서 `Access-Control-Allow-Credentials` 헤더가 `True`로 반환되고 있는지 확인하세요. 이는 `config/cors.php`의 `supports_credentials` 옵션을 `true`로 설정해 처리할 수 있습니다.

또한, 프론트엔드에서 axios를 사용한다면 반드시 전역 인스턴스에서 `withCredentials` 옵션을 활성화해야 합니다. 보통 이 설정은 `resources/js/bootstrap.js` 파일에 작성합니다. axios 대신 다른 HTTP 클라이언트를 쓴다면 해당 방식에 맞게 설정하세요:

```js
axios.defaults.withCredentials = true;
```

마지막으로, 루트 도메인 아래 모든 서브도메인에서 세션 쿠키를 사용할 수 있게 쿠키 도메인 설정을 맞추어야 합니다. `config/session.php` 설정 파일에서 domain 앞에 점(`.`)을 붙여주세요:

```
'domain' => '.domain.com',
```

<a name="spa-authenticating"></a>
### 인증하기

<a name="csrf-protection"></a>
#### CSRF 보호

SPA에서 인증할 때, 먼저 `login` 페이지에서 `/sanctum/csrf-cookie` 엔드포인트로 요청을 보내 CSRF 보호를 활성화해야 합니다:

```js
axios.get('/sanctum/csrf-cookie').then(response => {
    // Login...
});
```

이 요청을 보내면 라라벨에서 현재 CSRF 토큰이 포함된 `XSRF-TOKEN` 쿠키를 설정해줍니다. 이 토큰은 이후 요청 들에서 `X-XSRF-TOKEN` 헤더에 같이 보내야 하며, axios나 Angular HttpClient 등 일부 HTTP 클라이언트는 이를 자동으로 처리합니다. 만약 여러분이 사용하는 자바스크립트 HTTP 라이브러리가 자동으로 처리해주지 않는다면, 반드시 `XSRF-TOKEN` 쿠키 값을 직접 `X-XSRF-TOKEN` 헤더로 넣어야 합니다.

<a name="logging-in"></a>
#### 로그인

CSRF 보호가 설정됐다면, 이제 라라벨 애플리케이션의 `/login` 라우트에 `POST` 요청을 보내 인증할 수 있습니다. `/login` 라우트는 [직접 구현](/docs/9.x/authentication#authenticating-users)하거나 [Laravel Fortify](/docs/9.x/fortify)와 같은 헤드리스 인증 패키지로 제공해도 됩니다.

로그인 요청에 성공하면 인증이 완료되고, 이후의 모든 요청에는 라라벨에서 발급한 세션 쿠키가 자동으로 함께 전송되어 인증이 계속 유지됩니다. 또한, 이미 `/sanctum/csrf-cookie`로 CSRF 토큰을 받아왔기 때문에, 자바스크립트 HTTP 클라이언트가 적절하게 `X-XSRF-TOKEN`를 보내는 한 추가 설정 없이 CSRF 보호가 계속 동작합니다.

물론, 사용자의 세션이 만료된 상태(오랜 시간 활동 없음 등)에서 요청을 보낼 경우 HTTP 401 또는 419 에러가 발생할 수 있습니다. 이때는 SPA의 로그인 페이지로 유저를 다시 이동시키는 등의 처리가 필요합니다.

> [!WARNING]
> 직접 `/login` 엔드포인트를 만들어도 상관 없으나, 반드시 라라벨이 제공하는 표준 [세션 기반 인증 서비스](/docs/9.x/authentication#authenticating-users)로 사용자 인증이 이뤄져야 합니다. 보통 `web` 인증 가드를 사용합니다.

<a name="protecting-spa-routes"></a>
### 라우트 보호

SPA에서 인증된 요청만 허용하려면 `routes/api.php` 내 API 라우트에 `sanctum` 인증 가드를 적용해야 합니다. 이 가드를 사용하면 SPA 프런트엔드에서 오는 상태를 가진(stateful) 인증 요청과 외부에서 오는 토큰 기반 인증 요청을 모두 처리할 수 있습니다:

```
use Illuminate\Http\Request;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
```

<a name="authorizing-private-broadcast-channels"></a>
### Private 브로드캐스트 채널 인가

SPA 앱이 [private/presence 브로드캐스트 채널](/docs/9.x/broadcasting#authorizing-channels)에 인증해야 한다면, `routes/api.php` 파일에 `Broadcast::routes` 호출을 추가해야 합니다:

```
Broadcast::routes(['middleware' => ['auth:sanctum']]);
```

그리고, Pusher의 인가 요청이 제대로 동작하려면 [Laravel Echo](/docs/9.x/broadcasting#client-side-installation)를 초기화할 때 axios가 [도메인 간 요청이 가능하도록](#cors-and-cookies) 세팅되었는지, 그리고 다음 예시처럼 커스텀 Pusher `authorizer`를 지정해야 합니다:

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

Sanctum 토큰을 이용해 모바일 애플리케이션에서도 API 요청 인증이 가능합니다. 모바일 앱의 인증 흐름은 외부 API 소비자 인증과 거의 동일하지만, 토큰 발급 방식에 일부 차이가 있습니다.

<a name="issuing-mobile-api-tokens"></a>
### API 토큰 발급

우선, 사용자의 이메일/유저명, 비밀번호, 디바이스명을 받아 새로운 Sanctum 토큰을 발급해주는 라우트를 만듭니다. 이때 "디바이스명"은 토큰을 식별하기 위한 용도로 사용자에게 의미 있는 값을 넣으면 됩니다. (예: "Nuno의 iPhone 12"와 같이)

일반적으로 모바일 앱의 "로그인" 화면에서 토큰 엔드포인트로 해당 정보를 보내 토큰을 받게 되며, 앱 내에 이 토큰을 저장하고 추가적인 API 요청에 활용합니다:

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

모바일 애플리케이션에서 이 토큰을 이용해 API 요청 할 때는 `Authorization` 헤더에 `Bearer` 토큰 형식으로 포함해 전송하면 됩니다.

> [!NOTE]
> 모바일 앱을 위한 토큰 발급 시에도 [토큰 권한(abilities)](#token-abilities)을 자유롭게 지정할 수 있습니다.

<a name="protecting-mobile-api-routes"></a>
### 라우트 보호

앞서 소개한 대로, 모든 요청에 대해 인증을 강제하려면 해당 라우트에 `sanctum` 인증 가드를 적용하면 됩니다:

```
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
```

<a name="revoking-mobile-api-tokens"></a>
### 토큰 회수

모바일 기기에 발급된 토큰 또한 사용자가 직접 회수하도록, 웹 애플리케이션 내 "계정 설정" 페이지에 토큰 목록 및 "회수" 버튼을 추가할 수 있습니다. 사용자가 버튼을 누르면 해당 토큰을 데이터베이스에서 삭제하게 처리하면 됩니다. 사용자의 API 토큰 목록은 역시 `Laravel\Sanctum\HasApiTokens` 트레이트의 `tokens` 연관관계를 활용하면 됩니다:

```
// 모든 토큰 회수(삭제)...
$user->tokens()->delete();

// 특정 토큰만 회수(삭제)...
$user->tokens()->where('id', $tokenId)->delete();
```

<a name="testing"></a>
## 테스트

테스트 시에는 `Sanctum::actingAs` 메서드를 사용해 특정 사용자로 인증하고, 해당 토큰에 부여할 권한(ability)도 지정할 수 있습니다:

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

토큰에 모든 권한을 부여할 경우, `actingAs` 메서드의 권한 리스트에 `*`를 추가하면 됩니다:

```
Sanctum::actingAs(
    User::factory()->create(),
    ['*']
);
```
