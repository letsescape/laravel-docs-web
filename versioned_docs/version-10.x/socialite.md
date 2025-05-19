# 라라벨 소셜라이트 (Laravel Socialite)

- [소개](#introduction)
- [설치](#installation)
- [소셜라이트 업그레이드](#upgrading-socialite)
- [설정](#configuration)
- [인증](#authentication)
    - [라우팅](#routing)
    - [인증 및 저장](#authentication-and-storage)
    - [액세스 스코프](#access-scopes)
    - [Slack 봇 스코프](#slack-bot-scopes)
    - [옵션 파라미터](#optional-parameters)
- [사용자 정보 조회](#retrieving-user-details)

<a name="introduction"></a>
## 소개

일반적인 폼 기반 인증 외에도, 라라벨은 [라라벨 소셜라이트](https://github.com/laravel/socialite)를 사용하여 OAuth 제공자와 쉽게 인증할 수 있는 간편한 방법을 제공합니다. Socialite는 현재 Facebook, Twitter, LinkedIn, Google, GitHub, GitLab, Bitbucket, Slack을 통한 인증을 지원합니다.

> [!NOTE]
> 다른 플랫폼용 어댑터는 커뮤니티가 운영하는 [Socialite Providers](https://socialiteproviders.com/) 웹사이트를 통해 제공됩니다.

<a name="installation"></a>
## 설치

Socialite를 시작하려면 Composer 패키지 매니저를 사용해 프로젝트의 의존성에 패키지를 추가해야 합니다:

```shell
composer require laravel/socialite
```

<a name="upgrading-socialite"></a>
## 소셜라이트 업그레이드

Socialite의 새로운 주요 버전으로 업그레이드할 때는 [업그레이드 가이드](https://github.com/laravel/socialite/blob/master/UPGRADE.md)를 반드시 꼼꼼히 확인하시기 바랍니다.

<a name="configuration"></a>
## 설정

Socialite를 사용하기 전에, 애플리케이션에서 사용하는 OAuth 제공자에 대한 인증 정보를 추가해야 합니다. 일반적으로, 이 인증 정보는 해당 서비스의 대시보드에서 "개발자 애플리케이션"을 생성해 받아올 수 있습니다.

이러한 인증 정보는 애플리케이션의 `config/services.php` 설정 파일에 추가해야 하며, 제공자에 따라 `facebook`, `twitter`(OAuth 1.0), `twitter-oauth-2`(OAuth 2.0), `linkedin-openid`, `google`, `github`, `gitlab`, `bitbucket`, `slack` 중 하나의 키를 사용해야 합니다:

```
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

OAuth 제공자를 사용해 사용자를 인증하려면, 두 개의 라우트가 필요합니다. 하나는 사용자를 OAuth 제공자로 리다이렉트하는 용도, 또 다른 하나는 인증 후 제공자로부터 콜백을 받는 용도입니다. 아래의 예시는 두 가지 라우트 모두를 보여줍니다:

```
use Laravel\Socialite\Facades\Socialite;

Route::get('/auth/redirect', function () {
    return Socialite::driver('github')->redirect();
});

Route::get('/auth/callback', function () {
    $user = Socialite::driver('github')->user();

    // $user->token
});
```

`Socialite` 파사드의 `redirect` 메서드는 사용자를 해당 OAuth 제공자로 리다이렉트하고, `user` 메서드는 인증 승인 후 제공자로부터 사용자의 정보를 가져옵니다.

<a name="authentication-and-storage"></a>
### 인증 및 저장

OAuth 제공자로부터 사용자 정보를 가져온 후에는, 해당 사용자가 애플리케이션에 이미 존재하는지 확인하고 [사용자 인증](/docs/10.x/authentication#authenticate-a-user-instance)을 할 수 있습니다. 만약 사용자가 데이터베이스에 없다면, 보통 새로운 사용자 레코드를 생성하여 저장하는 방식으로 처리합니다:

```
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
> 특정 OAuth 제공자로부터 어떤 사용자 정보를 제공하는지 더 자세한 내용은 [사용자 정보 조회](#retrieving-user-details) 문서를 참고해 주세요.

<a name="access-scopes"></a>
### 액세스 스코프

사용자를 리다이렉트하기 전에, `scopes` 메서드를 사용하여 인증 요청에 포함할 "스코프"를 지정할 수 있습니다. 이 메서드는 이전에 지정된 스코프에 새로 지정한 스코프를 합쳐줍니다:

```
use Laravel\Socialite\Facades\Socialite;

return Socialite::driver('github')
    ->scopes(['read:user', 'public_repo'])
    ->redirect();
```

기존에 지정된 모든 스코프를 새 스코프로 덮어쓰려면, `setScopes` 메서드를 사용하면 됩니다:

```
return Socialite::driver('github')
    ->setScopes(['read:user', 'public_repo'])
    ->redirect();
```

<a name="slack-bot-scopes"></a>
### Slack 봇 스코프

Slack의 API는 [여러 종류의 액세스 토큰](https://api.slack.com/authentication/token-types)을 제공하며, 각각 [고유한 권한 스코프](https://api.slack.com/scopes)를 가집니다. Socialite는 아래 두 가지 Slack 액세스 토큰 종류 모두를 지원합니다:

<div class="content-list" markdown="1">

- 봇(Bot, 접두사 `xoxb-`)
- 사용자(User, 접두사 `xoxp-`)

</div>

기본적으로 `slack` 드라이버는 `user` 토큰을 생성하며, 드라이버의 `user` 메서드를 호출하면 사용자의 상세 정보를 반환합니다.

만약 애플리케이션이 외부 Slack 워크스페이스(여러분의 애플리케이션 사용자 소유)를 대상으로 알림을 발송하고자 한다면, 봇 토큰이 유용합니다. 봇 토큰을 생성하려면, 사용자를 Slack 인증 페이지로 리다이렉트하기 전에 `asBotUser` 메서드를 호출하면 됩니다:

```
return Socialite::driver('slack')
    ->asBotUser()
    ->setScopes(['chat:write', 'chat:write.public', 'chat:write.customize'])
    ->redirect();
```

또한, Slack 인증 후 리다이렉트를 받은 뒤에도, `user` 메서드 실행 전에 반드시 `asBotUser` 메서드를 호출해야 합니다:

```
$user = Socialite::driver('slack')->asBotUser()->user();
```

봇 토큰을 생성할 때는 `user` 메서드가 여전히 `Laravel\Socialite\Two\User` 인스턴스를 반환하지만, 오직 `token` 속성만 채워집니다. 이 토큰을 저장해 두었다가 [외부 Slack 워크스페이스에 알림 메시지를 전송할 때](/docs/10.x/notifications#notifying-external-slack-workspaces) 사용할 수 있습니다.

<a name="optional-parameters"></a>
### 옵션 파라미터

여러 OAuth 제공자들은 리다이렉트 요청에 추가로 선택 가능한 파라미터들을 지원합니다. 요청에 옵션 파라미터를 포함하려면, `with` 메서드에 연관 배열을 넘기면 됩니다:

```
use Laravel\Socialite\Facades\Socialite;

return Socialite::driver('google')
    ->with(['hd' => 'example.com'])
    ->redirect();
```

> [!WARNING]
> `with` 메서드 사용 시, `state`나 `response_type` 등 예약어를 파라미터로 전달하지 않도록 주의해 주세요.

<a name="retrieving-user-details"></a>
## 사용자 정보 조회

사용자가 인증 콜백 라우트로 다시 리다이렉트된 이후에는, Socialite의 `user` 메서드를 사용하여 해당 사용자의 정보를 조회할 수 있습니다. `user` 메서드가 반환하는 객체에는 사용자의 정보를 데이터베이스에 저장하는 데 활용할 수 있는 다양한 속성과 메서드가 제공됩니다.

이 객체에서 사용할 수 있는 속성과 메서드는, 인증하고자 하는 OAuth 제공자가 OAuth 1.0 또는 OAuth 2.0 중 어느 버전을 지원하느냐에 따라 달라집니다:

```
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

    // 모든 제공자 공통...
    $user->getId();
    $user->getNickname();
    $user->getName();
    $user->getEmail();
    $user->getAvatar();
});
```

<a name="retrieving-user-details-from-a-token-oauth2"></a>
#### 토큰으로 사용자 정보 조회 (OAuth2)

이미 유효한 액세스 토큰을 가지고 있다면, Socialite의 `userFromToken` 메서드를 사용해 해당 사용자의 정보를 바로 조회할 수 있습니다:

```
use Laravel\Socialite\Facades\Socialite;

$user = Socialite::driver('github')->userFromToken($token);
```

<a name="retrieving-user-details-from-a-token-and-secret-oauth1"></a>
#### 토큰과 시크릿으로 사용자 정보 조회 (OAuth1)

이미 유효한 토큰과 시크릿을 가지고 있다면, Socialite의 `userFromTokenAndSecret` 메서드를 사용해 해당 사용자의 정보를 조회할 수 있습니다:

```
use Laravel\Socialite\Facades\Socialite;

$user = Socialite::driver('twitter')->userFromTokenAndSecret($token, $secret);
```

<a name="stateless-authentication"></a>
#### 무상태 인증(Stateless Authentication)

`stateless` 메서드를 사용하면 세션 상태 검증을 비활성화할 수 있습니다. 쿠키 기반 세션을 사용하지 않는 무상태 API에 소셜 인증을 도입할 때 유용합니다:

```
use Laravel\Socialite\Facades\Socialite;

return Socialite::driver('google')->stateless()->user();
```

> [!WARNING]
> 무상태 인증은 Twitter OAuth 1.0 드라이버에서는 사용할 수 없습니다.
