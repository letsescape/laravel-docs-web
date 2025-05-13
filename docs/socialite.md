# 라라벨 Socialite (Laravel Socialite)

- [소개](#introduction)
- [설치](#installation)
- [Socialite 업그레이드](#upgrading-socialite)
- [설정](#configuration)
- [인증](#authentication)
    - [라우팅](#routing)
    - [인증 및 데이터 저장](#authentication-and-storage)
    - [액세스 범위 지정](#access-scopes)
    - [Slack 봇 범위](#slack-bot-scopes)
    - [옵션 파라미터](#optional-parameters)
- [사용자 정보 가져오기](#retrieving-user-details)

<a name="introduction"></a>
## 소개

일반적인 폼 기반 인증 외에도, 라라벨은 [Laravel Socialite](https://github.com/laravel/socialite)를 사용하여 OAuth 공급자와 간편하게 인증할 수 있는 기능을 제공합니다. 현재 Socialite는 Facebook, X, LinkedIn, Google, GitHub, GitLab, Bitbucket, Slack을 통한 인증을 지원합니다.

> [!NOTE]
> 기타 플랫폼용 어댑터는 커뮤니티에서 제공하는 [Socialite Providers](https://socialiteproviders.com/) 웹사이트에서 이용할 수 있습니다.

<a name="installation"></a>
## 설치

Socialite를 사용하려면, Composer 패키지 매니저를 이용하여 패키지를 프로젝트의 의존성에 추가합니다.

```shell
composer require laravel/socialite
```

<a name="upgrading-socialite"></a>
## Socialite 업그레이드

Socialite의 새로운 주 버전으로 업그레이드할 때는 반드시 [업그레이드 가이드](https://github.com/laravel/socialite/blob/master/UPGRADE.md)를 꼼꼼히 확인하시기 바랍니다.

<a name="configuration"></a>
## 설정

Socialite를 사용하기 전에, 애플리케이션에서 사용할 OAuth 공급자에 대한 인증 정보를 등록해야 합니다. 일반적으로 이 인증 정보는 인증하고자 하는 서비스의 개발자 대시보드에서 "개발자 애플리케이션"을 생성하면 얻을 수 있습니다.

이러한 인증 정보는 애플리케이션의 `config/services.php` 설정 파일에 저장해야 하며, 사용하려는 공급자에 따라 `facebook`, `x`, `linkedin-openid`, `google`, `github`, `gitlab`, `bitbucket`, `slack`, `slack-openid` 등의 키를 사용해야 합니다.

```php
'github' => [
    'client_id' => env('GITHUB_CLIENT_ID'),
    'client_secret' => env('GITHUB_CLIENT_SECRET'),
    'redirect' => 'http://example.com/callback-url',
],
```

> [!NOTE]
> `redirect` 옵션이 상대 경로인 경우, 자동으로 전체 URL로 변환되어 적용됩니다.

<a name="authentication"></a>
## 인증

<a name="routing"></a>
### 라우팅

OAuth 공급자를 사용해 사용자를 인증하려면 두 개의 라우트가 필요합니다. 하나는 사용자를 OAuth 공급자로 리다이렉트하는 라우트이고, 다른 하나는 인증 후 공급자로부터 콜백을 받는 라우트입니다. 아래는 두 라우트의 구현 예시입니다.

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

`Socialite` 파사드의 `redirect` 메서드는 사용자를 OAuth 공급자로 리다이렉트하는 역할을 하며, `user` 메서드는 인증 요청을 허용한 후, 요청 정보를 분석해 공급자로부터 사용자의 정보를 가져옵니다.

<a name="authentication-and-storage"></a>
### 인증 및 데이터 저장

OAuth 공급자에서 사용자를 받아온 후, 해당 사용자가 애플리케이션의 데이터베이스에 이미 존재하는지 확인하고, 존재하면 [사용자를 인증](/docs/authentication#authenticate-a-user-instance)할 수 있습니다. 사용자가 존재하지 않는 경우, 일반적으로 데이터베이스에 새 사용자 레코드를 생성해줍니다.

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
> 특정 OAuth 공급자에서 어떤 사용자 정보를 제공하는지에 대한 자세한 내용은 [사용자 정보 가져오기](#retrieving-user-details) 문서를 참고하세요.

<a name="access-scopes"></a>
### 액세스 범위 지정

사용자를 리다이렉트하기 전에, `scopes` 메서드를 사용하여 인증 요청에 포함할 "액세스 범위(scope)"를 지정할 수 있습니다. 이 메서드는 기존에 지정된 범위에 추가로 더해지며, 다음과 같이 사용할 수 있습니다.

```php
use Laravel\Socialite\Facades\Socialite;

return Socialite::driver('github')
    ->scopes(['read:user', 'public_repo'])
    ->redirect();
```

기존에 지정된 모든 범위를 덮어쓰고 새로 설정하려면 `setScopes` 메서드를 사용합니다.

```php
return Socialite::driver('github')
    ->setScopes(['read:user', 'public_repo'])
    ->redirect();
```

<a name="slack-bot-scopes"></a>
### Slack 봇 범위

Slack의 API는 [여러 종류의 액세스 토큰](https://api.slack.com/authentication/token-types)을 제공하며, 각각 [권한 범위](https://api.slack.com/scopes)가 다릅니다. Socialite는 다음 두 가지 Slack 액세스 토큰 타입 모두와 호환됩니다.

<div class="content-list" markdown="1">

- Bot (`xoxb-`로 시작)
- User (`xoxp-`로 시작)

</div>

기본적으로 `slack` 드라이버는 `user` 토큰을 생성하며, 드라이버의 `user` 메서드를 호출하면 사용자 정보를 반환합니다.

봇 토큰은 애플리케이션이 외부 Slack 워크스페이스(애플리케이션의 사용자가 소유한)에 알림을 보낼 때 주로 사용됩니다. 봇 토큰을 생성하려면, 사용자를 Slack으로 인증을 위해 리다이렉트하기 전에 `asBotUser` 메서드를 호출하세요.

```php
return Socialite::driver('slack')
    ->asBotUser()
    ->setScopes(['chat:write', 'chat:write.public', 'chat:write.customize'])
    ->redirect();
```

추가로, 인증 후 Slack에서 사용자에게 리다이렉트된 뒤에 다시 `user` 메서드를 호출하기 전에도 `asBotUser` 메서드를 필수로 호출해야 합니다.

```php
$user = Socialite::driver('slack')->asBotUser()->user();
```

봇 토큰을 생성할 때도 `user` 메서드는 여전히 `Laravel\Socialite\Two\User` 인스턴스를 반환하지만, 이때는 오직 `token` 속성만 설정됩니다. 이 토큰은 [인증된 사용자의 Slack 워크스페이스로 알림을 전송](/docs/notifications#notifying-external-slack-workspaces)할 때 활용할 수 있습니다.

<a name="optional-parameters"></a>
### 옵션 파라미터

일부 OAuth 공급자는 리다이렉트 요청에서 추가 옵션 파라미터를 지원합니다. 이런 파라미터를 요청에 포함하려면 `with` 메서드에 연관 배열을 전달하면 됩니다.

```php
use Laravel\Socialite\Facades\Socialite;

return Socialite::driver('google')
    ->with(['hd' => 'example.com'])
    ->redirect();
```

> [!WARNING]
> `with` 메서드를 사용할 때, `state`나 `response_type`과 같은 예약어는 파라미터로 전달하지 않도록 주의하세요.

<a name="retrieving-user-details"></a>
## 사용자 정보 가져오기

사용자가 애플리케이션의 인증 콜백 라우트로 리다이렉트된 후, Socialite의 `user` 메서드를 사용해 사용자의 정보를 가져올 수 있습니다. `user` 메서드가 반환하는 사용자 객체에는 데이터베이스에 저장할 수 있는 다양한 속성과 메서드가 제공됩니다.

인증에 사용한 OAuth 공급자가 OAuth 1.0인지, OAuth 2.0인지에 따라 사용할 수 있는 속성과 메서드가 달라질 수 있습니다.

```php
use Laravel\Socialite\Facades\Socialite;

Route::get('/auth/callback', function () {
    $user = Socialite::driver('github')->user();

    // OAuth 2.0 공급자에서 사용 가능...
    $token = $user->token;
    $refreshToken = $user->refreshToken;
    $expiresIn = $user->expiresIn;

    // OAuth 1.0 공급자에서 사용 가능...
    $token = $user->token;
    $tokenSecret = $user->tokenSecret;

    // 모든 공급자에서 사용 가능...
    $user->getId();
    $user->getNickname();
    $user->getName();
    $user->getEmail();
    $user->getAvatar();
});
```

<a name="retrieving-user-details-from-a-token-oauth2"></a>
#### 토큰으로 사용자 정보 가져오기

만약 이미 사용자에 대한 유효한 액세스 토큰이 있다면, Socialite의 `userFromToken` 메서드를 사용해 해당 사용자의 정보를 바로 불러올 수 있습니다.

```php
use Laravel\Socialite\Facades\Socialite;

$user = Socialite::driver('github')->userFromToken($token);
```

iOS 애플리케이션에서 Facebook Limited Login을 사용하는 경우, Facebook은 액세스 토큰 대신 OIDC 토큰을 반환합니다. OIDC 토큰 역시 `userFromToken` 메서드에 전달하여 사용자 정보를 가져올 수 있습니다.

<a name="stateless-authentication"></a>
#### Stateless 인증

`stateless` 메서드는 세션 상태 검증을 비활성화할 때 사용합니다. 이 기능은 쿠키 기반 세션을 사용하지 않는 Stateless API에 소셜 인증을 추가할 때 유용합니다.

```php
use Laravel\Socialite\Facades\Socialite;

return Socialite::driver('google')->stateless()->user();
```
