# 라라벨 생텀 (Laravel Sanctum)

- [소개](#introduction)
    - [동작 방식](#how-it-works)
- [설치](#installation)
- [설정](#configuration)
    - [기본 모델 오버라이드](#overriding-default-models)
- [API 토큰 인증](#api-token-authentication)
    - [API 토큰 발급](#issuing-api-tokens)
    - [토큰 권한(Ability)](#token-abilities)
    - [라우트 보호](#protecting-routes)
    - [토큰 폐기](#revoking-tokens)
    - [토큰 만료](#token-expiration)
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

[Laravel Sanctum](https://github.com/laravel/sanctum)은 SPA(싱글 페이지 애플리케이션), 모바일 애플리케이션, 그리고 단순한 토큰 기반 API를 위한 가벼운 인증 시스템을 제공합니다. Sanctum을 사용하면 애플리케이션의 각 사용자가 자신의 계정에 대해 여러 개의 API 토큰을 생성할 수 있습니다. 이 토큰들은 각각 수행할 수 있는 작업을 정의하는 권한(Ability) 또는 스코프(Scope)를 부여받을 수 있습니다.

<a name="how-it-works"></a>
### 동작 방식

라라벨 Sanctum은 두 가지 별도의 문제를 해결하기 위해 만들어졌습니다. 본격적으로 라이브러리에 대해 살펴보기 전에 이 두 가지 문제를 각각 설명하겠습니다.

<a name="how-it-works-api-tokens"></a>
#### API 토큰

우선, Sanctum은 OAuth처럼 복잡하지 않으면서 사용자에게 API 토큰을 발급할 수 있는 단순한 패키지입니다. 이 기능은 GitHub나 그 외 애플리케이션에서 제공하는 "개인 접근 토큰"에서 영감을 얻었습니다. 예를 들어, 여러분의 애플리케이션의 "계정 설정" 화면에서 사용자가 자신의 계정에 대해 API 토큰을 직접 생성할 수 있는 화면을 만들 수 있습니다. Sanctum을 이용하면 이러한 토큰을 손쉽게 생성하고 관리할 수 있습니다. 이러한 토큰은 대개 유효기간이 매우 길게(수년 이상) 설정되지만, 사용자가 언제든 직접 토큰을 폐기(취소)할 수도 있습니다.

라라벨 Sanctum에서는 사용자 API 토큰을 하나의 데이터베이스 테이블에 저장하고, HTTP 요청의 `Authorization` 헤더에 존재하는 유효한 API 토큰을 이용해 인증을 처리합니다.

<a name="how-it-works-spa-authentication"></a>
#### SPA 인증

두 번째로, Sanctum은 라라벨 기반 API와 통신해야 하는 SPA(싱글 페이지 애플리케이션)를 인증하는 간단한 방법을 제공합니다. 이러한 SPA는 라라벨 애플리케이션과 동일한 저장소에 위치할 수도 있고, Vue CLI나 Next.js 등으로 별도의 저장소에 만들어졌을 수도 있습니다.

이 기능을 위해 Sanctum은 어떤 종류의 토큰도 사용하지 않습니다. 대신, 라라벨의 내장 쿠키 기반 세션 인증 서비스를 이용합니다. 일반적으로 Sanctum은 라라벨의 `web` 인증 가드를 사용해 이 작업을 수행합니다. 이 방식은 CSRF 보호, 세션 기반 인증, 및 XSS를 통한 인증 정보 노출 방지 등 다양한 장점을 제공합니다.

Sanctum은 요청이 여러분의 SPA 프론트엔드에서 시작된 경우에만 쿠키 기반 인증을 시도합니다. Sanctum은 들어오는 HTTP 요청을 처리할 때 우선 인증 쿠키가 있는지 확인하며, 만약 쿠키가 없다면 그 다음으로 `Authorization` 헤더에 유효한 API 토큰이 있는지 확인합니다.

> [!NOTE]
> Sanctum을 오직 API 토큰 인증 용도로만 사용하거나, 오직 SPA 인증 용도로만 사용하는 것 모두 문제없습니다. Sanctum을 도입했다고 해서 반드시 두 가지 방식을 모두 써야 하는 것은 아닙니다.

<a name="installation"></a>
## 설치

> [!NOTE]
> 최신 버전의 라라벨은 이미 Laravel Sanctum이 포함되어 있습니다. 하지만, 애플리케이션의 `composer.json` 파일에 `laravel/sanctum`이 없다면 아래 설치 방법을 따라 추가할 수 있습니다.

Composer 패키지 매니저를 통해 Laravel Sanctum을 설치할 수 있습니다.

```shell
composer require laravel/sanctum
```

다음으로, `vendor:publish` Artisan 명령어를 실행하여 Sanctum의 설정 파일과 마이그레이션 파일을 배포해야 합니다. 이렇게 하면 `sanctum` 설정 파일이 애플리케이션의 `config` 디렉터리에 생성됩니다.

```shell
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

마지막으로, 데이터베이스 마이그레이션을 실행하세요. Sanctum은 API 토큰을 저장하기 위한 하나의 테이블을 생성합니다.

```shell
php artisan migrate
```

그리고, SPA 인증에 Sanctum을 활용할 계획이라면, 애플리케이션의 `app/Http/Kernel.php` 파일 내 `api` 미들웨어 그룹에 Sanctum의 미들웨어를 추가해야 합니다.

```
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

<a name="migration-customization"></a>
#### 마이그레이션 커스터마이징

Sanctum의 기본 마이그레이션을 사용하지 않을 경우, `App\Providers\AppServiceProvider` 클래스의 `register` 메서드에서 `Sanctum::ignoreMigrations` 메서드를 호출해야 합니다. 기본 마이그레이션을 내보내려면, 다음 명령어를 실행하면 됩니다: `php artisan vendor:publish --tag=sanctum-migrations`

<a name="configuration"></a>
## 설정

<a name="overriding-default-models"></a>
### 기본 모델 오버라이드

일반적으로 필요 없지만, 원한다면 Sanctum이 내부적으로 사용하는 `PersonalAccessToken` 모델을 확장할 수도 있습니다.

```
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    // ...
}
```

그런 다음, Sanctum에게 여러분이 만든 커스텀 모델을 사용하도록 지시할 수 있습니다. 보통 이 코드는 애플리케이션의 서비스 프로바이더 중 하나의 `boot` 메서드에서 호출하는 것이 좋습니다.

```
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
> 여러분의 1차 서비스(1st-party) SPA를 API 토큰으로 인증하면 안 됩니다. 대신 Sanctum의 내장 [SPA 인증 기능](#spa-authentication)을 사용하십시오.

<a name="issuing-api-tokens"></a>
### API 토큰 발급

Sanctum을 사용하면 API 요청 인증에 사용할 수 있는 API 토큰/개인 액세스 토큰을 발급할 수 있습니다. API 토큰을 사용할 때, 토큰은 `Authorization` 헤더의 `Bearer` 토큰 형식으로 포함되어야 합니다.

토큰 발급을 시작하려면, 사용자(User) 모델에 `Laravel\Sanctum\HasApiTokens` 트레이트를 사용해야 합니다.

```
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}
```

토큰을 발급하려면, `createToken` 메서드를 사용할 수 있습니다. 이 메서드는 `Laravel\Sanctum\NewAccessToken` 인스턴스를 반환합니다. API 토큰은 데이터베이스에 저장되기 전에 SHA-256 해시로 암호화되지만, `NewAccessToken` 인스턴스의 `plainTextToken` 속성을 통해 평문 토큰 값을 얻을 수 있습니다. 이 값은 토큰 생성 직후 사용자에게 반드시 보여주어야 합니다.

```
use Illuminate\Http\Request;

Route::post('/tokens/create', function (Request $request) {
    $token = $request->user()->createToken($request->token_name);

    return ['token' => $token->plainTextToken];
});
```

사용자의 모든 토큰은 `HasApiTokens` 트레이트가 제공하는 `tokens` Eloquent 연관관계를 통해 확인할 수 있습니다.

```
foreach ($user->tokens as $token) {
    // ...
}
```

<a name="token-abilities"></a>
### 토큰 권한(Ability)

Sanctum을 사용하면 토큰에 "권한(Ability)"을 부여할 수 있습니다. 이 권한은 OAuth의 "스코프"와 비슷한 개념입니다. `createToken` 메서드의 두 번째 인수로 문자열 배열 형태의 권한을 전달할 수 있습니다.

```
return $user->createToken('token-name', ['server:update'])->plainTextToken;
```

Sanctum을 통해 인증된 요청을 처리할 때, 토큰이 특정 권한을 가지고 있는지 `tokenCan` 메서드를 통해 확인할 수 있습니다.

```
if ($user->tokenCan('server:update')) {
    // ...
}
```

<a name="token-ability-middleware"></a>
#### 토큰 권한 미들웨어

Sanctum에는 요청의 토큰이 특정 권한을 보유하고 있는지 확인해 주는 두 가지 미들웨어가 포함되어 있습니다. 우선, 다음 미들웨어를 애플리케이션의 `app/Http/Kernel.php` 파일의 `$middlewareAliases` 프로퍼티에 추가하세요.

```
'abilities' => \Laravel\Sanctum\Http\Middleware\CheckAbilities::class,
'ability' => \Laravel\Sanctum\Http\Middleware\CheckForAnyAbility::class,
```

`abilities` 미들웨어는 요청의 토큰이 지정한 모든 권한을 가지고 있는지 검증합니다.

```
Route::get('/orders', function () {
    // 토큰이 "check-status"와 "place-orders" 권한 모두를 가지고 있어야 합니다...
})->middleware(['auth:sanctum', 'abilities:check-status,place-orders']);
```

`ability` 미들웨어는 요청의 토큰이 지정한 권한(들) 중 *하나 이상*을 가지고 있으면 통과시킵니다.

```
Route::get('/orders', function () {
    // 토큰이 "check-status" 또는 "place-orders" 권한 중 하나 이상을 가지고 있으면 됩니다...
})->middleware(['auth:sanctum', 'ability:check-status,place-orders']);
```

<a name="first-party-ui-initiated-requests"></a>
#### 1차 서비스(First-Party) UI에서 시작된 요청

편의를 위해, 리뷰에서 요청이 여러분의 1차 서비스 SPA로부터 오고, 내장 [SPA 인증](#spa-authentication)을 사용 중이라면, `tokenCan` 메서드는 항상 `true`를 반환합니다.

하지만, 이것이 해당 사용자가 실제로 해당 작업을 수행할 수 있다는 의미는 아닙니다. 실제 권한 부여 여부는 일반적으로 [인가 정책(authorization policies)](/docs/10.x/authorization#creating-policies)에서 판단하게 됩니다. 즉, 토큰이 필요한 권한을 가지고 있는지와 동시에, 사용자가 해당 리소스에 대해 실제로 작업할 수 있는지도 확인해야 합니다.

예를 들어 서버 관리 애플리케이션이라면, 토큰이 "서버 업데이트" 권한을 가지고 있고, 서버가 실제로 해당 사용자 소유인지 확인해야 합니다.

```php
return $request->user()->id === $server->user_id &&
       $request->user()->tokenCan('server:update')
```

처음에는 1차 서비스 UI에서 온 요청에 대해 항상 `tokenCan`가 `true`를 반환하는 것이 어색해 보일 수 있습니다. 하지만, 이 방식 덕분에 "항상 API 토큰이 있다고 가정하고 `tokenCan` 메서드를 호출할 수 있다"고 믿을 수 있습니다. 이로 인해, 요청이 여러분의 UI에서 오든, 외부 타사 API 클라이언트에서 오든 관계없이, 인가 정책 내부에서 `tokenCan`과 같은 메서드를 항상 동일하게 호출할 수 있다는 장점이 있습니다.

<a name="protecting-routes"></a>
### 라우트 보호

모든 들어오는 요청이 인증되도록 라우트를 보호하려면, 보호가 필요한 라우트를 `routes/web.php` 혹은 `routes/api.php` 파일에서 `sanctum` 인증 가드를 사용하도록 설정하면 됩니다. 이 가드는 요청이 세션 기반 쿠키 인증이든, 혹은 외부에서 오는 유효한 API 토큰이든 모두 처리합니다.

왜 `routes/web.php`에서도 `sanctum` 가드로 인증하라고 권장하는지 궁금할 수 있습니다. 그 이유는, Sanctum이 먼저 라라벨 기본 세션 인증 쿠키로 인증을 시도하고, 쿠키가 없으면 요청의 `Authorization` 헤더에 토큰이 있는지 확인하기 때문입니다. 이 방식 덕분에 언제든 현재 인증된 사용자 인스턴스에서 `tokenCan` 메서드를 호출할 수 있습니다.

```
use Illuminate\Http\Request;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
```

<a name="revoking-tokens"></a>
### 토큰 폐기

발급된 토큰을 폐기(차단)하려면, `Laravel\Sanctum\HasApiTokens` 트레이트가 제공하는 `tokens` 연관관계를 사용해 데이터베이스에서 토큰을 직접 삭제하면 됩니다.

```
// 모든 토큰 폐기...
$user->tokens()->delete();

// 현재 요청에 사용된 토큰만 폐기...
$request->user()->currentAccessToken()->delete();

// 특정 토큰만 폐기...
$user->tokens()->where('id', $tokenId)->delete();
```

<a name="token-expiration"></a>
### 토큰 만료

기본적으로 Sanctum 토큰은 만료되지 않으며, [토큰 폐기](#revoking-tokens)를 통해서만 무효화할 수 있습니다. 하지만, 애플리케이션의 API 토큰에 만료시간을 설정하고 싶다면, `sanctum` 설정 파일의 `expiration` 옵션을 이용할 수 있습니다. 이 값에는 토큰이 발급된 후 만료될 때까지의 "분" 단위 시간을 설정합니다.

```php
'expiration' => 525600,
```

각 토큰마다 만료시간을 따로 지정하려면, `createToken` 메서드의 세 번째 인자로 만료시간을 개별적으로 지정할 수 있습니다.

```php
return $user->createToken(
    'token-name', ['*'], now()->addWeek()
)->plainTextToken;
```

토큰에 만료시간을 설정한 경우, 애플리케이션의 만료된 토큰들을 정기적으로 삭제하는 [스케줄러 작업](/docs/10.x/scheduling)을 추가하는 것이 좋습니다. Sanctum에는 이를 위한 `sanctum:prune-expired` Artisan 명령어가 제공됩니다. 예를 들어, 24시간 동안 만료된 토큰을 매일 한 번 삭제하려면 아래와 같이 스케줄을 구성할 수 있습니다.

```php
$schedule->command('sanctum:prune-expired --hours=24')->daily();
```

<a name="spa-authentication"></a>
## SPA 인증

Sanctum은 라라벨 기반 API와 통신해야 하는 싱글 페이지 애플리케이션(SPA)을 손쉽게 인증할 수 있도록 기능을 제공합니다. 이 SPA는 라라벨 애플리케이션과 같은 저장소에서 관리될 수도 있고, 완전히 별개 저장소일 수도 있습니다.

이 기능의 경우, Sanctum은 토큰을 전혀 사용하지 않습니다. 대신 라라벨의 내장 쿠키 기반 세션 인증 서비스를 사용합니다. 이렇게 하면 CSRF 보호, 세션 인증, 그리고 XSS에 의한 인증 정보 유출 방지 등의 장점이 있습니다.

> [!WARNING]
> 인증이 제대로 동작하려면 SPA와 API가 같은 최상위 도메인(Top-level Domain)을 공유해야 합니다. 단, 서로 다른 서브도메인에 위치하는 것은 괜찮습니다. 그리고 요청 시 `Accept: application/json` 헤더와, `Referer` 또는 `Origin` 헤더를 반드시 함께 전송해야 합니다.


<a name="spa-configuration"></a>
### 설정

<a name="configuring-your-first-party-domains"></a>
#### 1차 도메인 설정

먼저, SPA가 어떤 도메인에서 API 요청을 할지 지정해야 합니다. `sanctum` 설정 파일의 `stateful` 구성 옵션을 이용해 도메인(들)을 등록할 수 있습니다. 이 설정에 포함된 도메인들은 라라벨 세션 쿠키를 사용해서 API와 "stateful" 인증을 유지할 수 있게 됩니다.

> [!WARNING]
> 만약 포트가 포함된 주소(`127.0.0.1:8000` 등)로 애플리케이션에 접근한다면, 반드시 도메인 값에 포트번호도 함께 포함해야 합니다.

<a name="sanctum-middleware"></a>
#### Sanctum 미들웨어

다음으로, `app/Http/Kernel.php` 파일의 `api` 미들웨어 그룹에 Sanctum의 미들웨어를 추가하세요. 이 미들웨어는 SPA에서 온 요청이 라라벨의 세션 쿠키를 통해 인증될 수 있도록 하며, 동시에 외부 혹은 모바일 앱에서 온 요청은 여전히 API 토큰으로 인증될 수 있게 해줍니다.

```
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

<a name="cors-and-cookies"></a>
#### CORS 및 쿠키 설정

별도의 서브도메인에서 실행되는 SPA에서 인증이 잘 되지 않는다면, CORS(교차 출처 리소스 공유) 또는 세션 쿠키 설정에 문제가 있을 가능성이 높습니다.

CORS 설정에서 반드시 `Access-Control-Allow-Credentials` 헤더가 `True`로 반환되는지 확인하세요. 이는 애플리케이션의 `config/cors.php` 설정 파일에서 `supports_credentials` 옵션을 `true`로 설정하면 됩니다.

또한, 프론트엔드에서 HTTP 요청에 Axios를 사용한다면, 전역 Axios 인스턴스에 `withCredentials`와 `withXSRFToken` 옵션을 활성화해야 합니다. 일반적으로 이 코드는 `resources/js/bootstrap.js` 파일에서 설정합니다. 만약 Axios가 아니라 다른 HTTP 클라이언트를 쓰고 있다면, 해당 라이브러리에 맞게 설정을 해주어야 합니다.

```js
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
```

마지막으로, 세션 쿠키의 도메인 설정도 반드시 루트 도메인의 하위 모든 서브도메인을 지원하도록 작성해야 합니다. 이를 위해 `config/session.php` 파일에서 도메인 값을 앞에 점(`.`)을 붙여 지정하세요.

```
'domain' => '.domain.com',
```

<a name="spa-authenticating"></a>
### 인증 처리

<a name="csrf-protection"></a>
#### CSRF 보호

SPA 인증을 위해서는, SPA의 "로그인" 페이지에서 먼저 `/sanctum/csrf-cookie` 엔드포인트로 요청을 보내 애플리케이션의 CSRF 보호를 초기화해야 합니다.

```js
axios.get('/sanctum/csrf-cookie').then(response => {
    // 이 후 로그인 요청 수행...
});
```

이 요청이 정상적으로 처리되면, 라라벨은 현재 CSRF 토큰을 담은 `XSRF-TOKEN` 쿠키를 설정합니다. 이 토큰은 이후의 요청에서 `X-XSRF-TOKEN` 헤더로 같이 전송되어야 하며, Axios나 Angular HttpClient와 같은 일부 HTTP 클라이언트들은 이를 자동으로 처리해줍니다. 만약 사용 중인 자바스크립트 HTTP 라이브러리가 이를 자동으로 처리하지 않는다면, 반드시 직접 `X-XSRF-TOKEN` 헤더에 `XSRF-TOKEN` 쿠키 값을 넣어주어야 합니다.

<a name="logging-in"></a>
#### 로그인

CSRF 보호가 초기화된 후, 이제 라라벨 애플리케이션의 `/login` 라우트로 `POST` 요청을 보내 인증을 진행하면 됩니다. 이 `/login` 라우트는 [직접 구현](/docs/10.x/authentication#authenticating-users)할 수도 있고, [Laravel Fortify](/docs/10.x/fortify) 같은 헤드리스 인증 패키지를 사용할 수도 있습니다.

로그인 요청이 성공하면 인증된 상태가 되며, 이후의 모든 요청은 라라벨이 발급한 세션 쿠키를 통해 자동으로 인증이 처리됩니다. 그리고 이미 `/sanctum/csrf-cookie` 라우트로 요청을 보냈으므로, 이 후의 요청은 Javascript HTTP 클라이언트가 `XSRF-TOKEN` 쿠키 값을 `X-XSRF-TOKEN` 헤더에 포함해서 CSRF 보호도 계속 유지됩니다.

사용자의 세션이 만료(예: 장시간 미활동 등)되면 이후 요청에 대해 401 또는 419 HTTP 오류가 반환될 수 있습니다. 이 경우 사용자를 다시 SPA 로그인 페이지로 리다이렉트해야 합니다.

> [!WARNING]
> 직접 `/login` 엔드포인트를 구현할 수도 있지만, 반드시 [라라벨이 제공하는 표준 세션 기반 인증 서비스](/docs/10.x/authentication#authenticating-users)로 사용자를 인증해야 합니다. 보통은 `web` 인증 가드를 사용한다는 뜻입니다.

<a name="protecting-spa-routes"></a>
### 라우트 보호

SPA의 모든 요청이 인증 상태를 요구하도록 보호하려면, 애플리케이션의 `routes/api.php` 파일에서 해당 API 라우트에 `sanctum` 인증 가드를 적용해야 합니다. 이 가드는, SPA의 세션 기반 요청이든, 외부의 토큰 기반 요청이든 모두 인증을 처리해줍니다.

```
use Illuminate\Http\Request;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
```

<a name="authorizing-private-broadcast-channels"></a>
### 프라이빗 브로드캐스트 채널 인가

SPA에서 [프라이빗/프레즌스 브로드캐스트 채널](/docs/10.x/broadcasting#authorizing-channels)에 인증이 필요한 경우, `Broadcast::routes` 메서드를 `routes/api.php` 파일 내에서 아래와 같이 사용하세요.

```
Broadcast::routes(['middleware' => ['auth:sanctum']]);
```

이후, Pusher의 인가 요청이 정상 동작하려면 [Laravel Echo](/docs/10.x/broadcasting#client-side-installation) 초기화 시 커스텀 Pusher `authorizer`를 구현해야 합니다. 이렇게 하면 앞서 설명한 cross-domain 요청 설정을 적용한 `axios` 인스턴스를 사용하도록 Pusher를 구성할 수 있습니다.

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

Sanctum 토큰을 사용해 모바일 애플리케이션의 API 요청도 인증할 수 있습니다. 모바일 앱 인증 방식은 타사 API 인증과 거의 유사하지만, API 토큰 발급 과정에 약간의 차이가 있습니다.

<a name="issuing-mobile-api-tokens"></a>
### API 토큰 발급

먼저, 사용자의 이메일 또는 사용자명, 비밀번호, 그리고 디바이스 이름을 받아 Sanctum 토큰을 발급해주는 엔드포인트를 만들어야 합니다. 여기서 "디바이스 이름"은 주로 나중에 관리 편의와 정보 제공을 위해 사용되며 아무 값이나 지정해도 됩니다. 보통 "Nuno의 iPhone 12"와 같이 사용자가 인식하기 편한 이름으로 지정합니다.

일반적으로 모바일 앱의 "로그인" 화면에서 이 엔드포인트로 요청을 보내어, 사용자 인증에 성공하면 평문 API 토큰을 반환받아 모바일 기기에 저장하고, 이후 추가적인 API 요청 시 이 토큰을 사용하면 됩니다.

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

모바일 애플리케이션이 API 요청을 보낼 때는, 토큰을 반드시 `Authorization` 헤더의 `Bearer` 토큰 형태로 전달해야 합니다.

> [!NOTE]
> 모바일 애플리케이션 토큰 발급 시, [토큰 권한(Ability)](#token-abilities)도 자유롭게 추가할 수 있습니다.

<a name="protecting-mobile-api-routes"></a>
### 라우트 보호

앞서 설명한 대로, 모든 들어오는 요청이 인증되도록 라우트를 보호하려면 `sanctum` 인증 가드를 라우트에 적용하면 됩니다.

```
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
```

<a name="revoking-mobile-api-tokens"></a>
### 토큰 폐기

모바일 기기에 발급된 API 토큰을 사용자가 직접 폐기할 수 있도록, 웹 애플리케이션의 "계정 설정" 화면 등에서 발급한 각 토큰을 이름과 함께 나열하고, "폐기" 버튼을 제공할 수 있습니다. 사용자가 버튼을 클릭하면 해당 토큰을 데이터베이스에서 삭제하면 됩니다. 토큰 목록은 `Laravel\Sanctum\HasApiTokens` 트레이트가 제공하는 `tokens` 연관관계를 통해 얻을 수 있습니다.

```
// 모든 토큰 폐기...
$user->tokens()->delete();

// 특정 토큰만 폐기...
$user->tokens()->where('id', $tokenId)->delete();
```

<a name="testing"></a>
## 테스트

테스트 코드에서 `Sanctum::actingAs` 메서드를 사용해 인증된 유저를 지정하고, 해당 유저의 토큰에 어떤 권한(Ability)을 부여할지 같이 지정할 수 있습니다.

```
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

토큰에 모든 권한을 부여하고 싶다면, `actingAs` 메서드의 권한 목록에 `*` 을 포함하면 됩니다.

```
Sanctum::actingAs(
    User::factory()->create(),
    ['*']
);
```
