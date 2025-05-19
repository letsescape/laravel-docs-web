# 라라벨 소셜라이트 (Laravel Socialite)

- [소개](#introduction)
- [설치](#installation)
- [소셜라이트 업그레이드](#upgrading-socialite)
- [설정](#configuration)
- [인증](#authentication)
    - [라우팅](#routing)
    - [인증 및 저장](#authentication-and-storage)
    - [엑세스 범위(스코프)](#access-scopes)
    - [Slack 봇 스코프](#slack-bot-scopes)
    - [옵션 파라미터](#optional-parameters)
- [유저 정보 조회](#retrieving-user-details)

<a name="introduction"></a>
## 소개

기본 폼 기반 인증 외에도, 라라벨은 [Laravel Socialite](https://github.com/laravel/socialite)를 사용하여 여러 OAuth 제공자를 통한 간편하고 편리한 인증 방식도 제공합니다. 현재 Socialite는 Facebook, X, LinkedIn, Google, GitHub, GitLab, Bitbucket, 그리고 Slack 인증을 지원합니다.

> [!NOTE]
> 다른 플랫폼에 대한 어댑터는 커뮤니티 기반 [Socialite Providers](https://socialiteproviders.com/) 웹사이트에서 확인할 수 있습니다.

<a name="installation"></a>
## 설치

Socialite를 사용하려면 Composer 패키지 관리자를 통해 프로젝트에 패키지를 추가하면 됩니다:

```shell
composer require laravel/socialite
```

<a name="upgrading-socialite"></a>
## 소셜라이트 업그레이드

Socialite의 주요 버전을 업그레이드할 때에는 반드시 [업그레이드 가이드](https://github.com/laravel/socialite/blob/master/UPGRADE.md)를 꼼꼼히 확인하시기 바랍니다.

<a name="configuration"></a>
## 설정

Socialite를 사용하기 전에, 애플리케이션에서 사용하려는 각 OAuth 제공자에 대한 자격 증명을 추가해야 합니다. 일반적으로, 해당 서비스의 "개발자 애플리케이션"을 생성한 뒤, 대시보드에서 자격 증명을 발급받을 수 있습니다.

이 자격 증명 정보는 애플리케이션의 `config/services.php` 설정 파일에 입력해야 하며, `facebook`, `x`, `linkedin-openid`, `google`, `github`, `gitlab`, `bitbucket`, `slack`, 또는 `slack-openid` 등 애플리케이션에서 필요한 제공자 키를 사용합니다:

```php
'github' => [
    'client_id' => env('GITHUB_CLIENT_ID'),
    'client_secret' => env('GITHUB_CLIENT_SECRET'),
    'redirect' => 'http://example.com/callback-url',
],
```

> [!NOTE]
> `redirect` 옵션에 상대 경로가 지정된 경우, 자동으로 전체 URL로 변환됩니다.

<a name="authentication"></a>
## 인증

<a name="routing"></a>
### 라우팅

OAuth 제공자를 사용해 사용자를 인증하려면 두 개의 라우트가 필요합니다. 하나는 사용자를 해당 OAuth 제공자로 리디렉션하고, 다른 하나는 인증 이후 제공자로부터 콜백을 받는 역할을 합니다. 아래 예시 라우트는 두 가지 모두를 보여줍니다:

```php
use Laravel\Socialite\Facades\Socialite;

Route::get('/auth/redirect', function () {
    return Socialite::driver('github')->redirect();
});

Route::get('/auth/callback', function () {
    $user = Socialite::driver('github')->user();

    // $user->token
});
```

`Socialite` 파사드의 `redirect` 메서드는 사용자를 OAuth 제공자로 리디렉션하는 역할을 하며, `user` 메서드는 인증 승인 후 들어온 요청에서 사용자 정보를 받아옵니다.

<a name="authentication-and-storage"></a>
### 인증 및 저장

OAuth 제공자에서 사용자를 받아온 뒤에는, 해당 사용자가 애플리케이션 데이터베이스에 존재하는지 확인한 후 [사용자를 인증](/docs/12.x/authentication#authenticate-a-user-instance)할 수 있습니다. 만약 사용자가 데이터베이스에 없다면, 일반적으로 신규 사용자 레코드를 생성하여 저장합니다:

```php
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

Route::get('/auth/callback', function () {
    $githubUser = Socialite::driver('github')->user();

    $user = User::updateOrCreate([
        'github_id' => $githubUser->id,
    ], [
        'name' => $githubUser->name,
        'email' => $githubUser->email,
        'github_token' => $githubUser->token,
        'github_refresh_token' => $githubUser->refreshToken,
    ]);

    Auth::login($user);

    return redirect('/dashboard');
});
```

> [!NOTE]
> 각 OAuth 제공자별로 어떤 사용자 정보를 제공하는지에 관한 자세한 내용은 [유저 정보 조회](#retrieving-user-details) 문서를 참고하세요.

<a name="access-scopes"></a>
### 엑세스 범위(스코프)

사용자를 리디렉션하기 전에, `scopes` 메서드를 사용하여 인증 요청에 포함할 "스코프"를 지정할 수 있습니다. 이 메서드는 기존에 지정된 스코프에 새로 지정한 스코프를 병합합니다:

```php
use Laravel\Socialite\Facades\Socialite;

return Socialite::driver('github')
    ->scopes(['read:user', 'public_repo'])
    ->redirect();
```

인증 요청에 기존에 지정된 모든 스코프를 덮어쓰고 싶을 때는 `setScopes` 메서드를 사용합니다:

```php
return Socialite::driver('github')
    ->setScopes(['read:user', 'public_repo'])
    ->redirect();
```

<a name="slack-bot-scopes"></a>
### Slack 봇 스코프

Slack의 API는 [여러 종류의 액세스 토큰](https://api.slack.com/authentication/token-types)을 제공하며, 각각 [고유한 권한 스코프](https://api.slack.com/scopes)를 가집니다. Socialite는 아래 두 가지 Slack 토큰 타입 모두에 대응합니다.

<div class="content-list" markdown="1">

- 봇(Bot) 토큰 (`xoxb-`로 시작)
- 사용자(User) 토큰 (`xoxp-`로 시작)

</div>

기본적으로 `slack` 드라이버는 `user` 토큰을 생성하며, 드라이버의 `user` 메서드를 호출하면 사용자 정보를 반환합니다.

봇 토큰은 주로 애플리케이션이 외부 Slack 워크스페이스(애플리케이션 사용자 소유)에 알림을 전송해야 할 경우에 사용됩니다. 봇 토큰을 생성하려면, Slack 인증을 위해 사용자를 리디렉션하기 전에 `asBotUser` 메서드를 호출해야 합니다:

```php
return Socialite::driver('slack')
    ->asBotUser()
    ->setScopes(['chat:write', 'chat:write.public', 'chat:write.customize'])
    ->redirect();
```

또한, Slack이 인증 후 애플리케이션으로 사용자를 다시 리디렉션하면, `user` 메서드를 호출하기 전에 반드시 `asBotUser`를 호출해야 합니다:

```php
$user = Socialite::driver('slack')->asBotUser()->user();
```

봇 토큰이 생성될 때, `user` 메서드는 여전히 `Laravel\Socialite\Two\User` 인스턴스를 반환하지만, `token` 속성만 채워집니다. 이 토큰은 인증된 사용자의 Slack 워크스페이스로 [알림을 전송](/docs/12.x/notifications#notifying-external-slack-workspaces)할 때 저장해둘 수 있습니다.

<a name="optional-parameters"></a>
### 옵션 파라미터

일부 OAuth 제공자는 리디렉션 요청에 추가 옵션 파라미터를 지원합니다. 이러한 옵션 파라미터를 포함하려면 `with` 메서드에 연관 배열을 전달하면 됩니다:

```php
use Laravel\Socialite\Facades\Socialite;

return Socialite::driver('google')
    ->with(['hd' => 'example.com'])
    ->redirect();
```

> [!WARNING]
> `with` 메서드를 사용할 때는 `state`, `response_type` 등 예약어 키워드는 전달하지 않도록 주의하세요.

<a name="retrieving-user-details"></a>
## 유저 정보 조회

사용자가 애플리케이션의 인증 콜백 라우트로 리디렉션된 후, Socialite의 `user` 메서드를 사용해 사용자 정보를 받아올 수 있습니다. `user` 메서드가 반환하는 사용자 객체에는 데이터베이스에 저장할 때 활용할 수 있는 다양한 속성과 메서드가 포함되어 있습니다.

어떤 OAuth 제공자와 연동하는지에 따라, OAuth 1.0 또는 OAuth 2.0 지원 여부에 따라 객체의 속성과 메서드가 다를 수 있습니다:

```php
use Laravel\Socialite\Facades\Socialite;

Route::get('/auth/callback', function () {
    $user = Socialite::driver('github')->user();

    // OAuth 2.0 제공자...
    $token = $user->token;
    $refreshToken = $user->refreshToken;
    $expiresIn = $user->expiresIn;

    // OAuth 1.0 제공자...
    $token = $user->token;
    $tokenSecret = $user->tokenSecret;

    // 모든 제공자에서 사용 가능...
    $user->getId();
    $user->getNickname();
    $user->getName();
    $user->getEmail();
    $user->getAvatar();
});
```

<a name="retrieving-user-details-from-a-token-oauth2"></a>
#### 토큰으로부터 유저 정보 조회

이미 사용자의 유효한 액세스 토큰이 있는 경우, Socialite의 `userFromToken` 메서드를 활용해 사용자 정보를 받아올 수 있습니다:

```php
use Laravel\Socialite\Facades\Socialite;

$user = Socialite::driver('github')->userFromToken($token);
```

iOS 애플리케이션에서 Facebook Limited Login을 사용하는 경우, Facebook은 액세스 토큰 대신 OIDC 토큰을 반환합니다. OIDC 토큰 역시 `userFromToken` 메서드에 전달하면 사용자 정보를 조회할 수 있습니다.

<a name="stateless-authentication"></a>
#### 상태 비저장(Stateless) 인증

`stateless` 메서드를 사용하면 세션 상태 검증 기능을 비활성화할 수 있습니다. 쿠키 기반 세션을 사용하지 않는 상태 비저장 API에 소셜 인증을 적용할 경우에 유용합니다:

```php
use Laravel\Socialite\Facades\Socialite;

return Socialite::driver('google')->stateless()->user();
```
