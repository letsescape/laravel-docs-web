# 라라벨 Socialite (Laravel Socialite)

- [소개](#introduction)
- [설치](#installation)
- [Socialite 업그레이드](#upgrading-socialite)
- [구성](#configuration)
- [인증](#authentication)
    - [라우팅](#routing)
    - [인증 및 저장](#authentication-and-storage)
    - [액세스 스코프](#access-scopes)
    - [선택적 파라미터](#optional-parameters)
- [사용자 정보 가져오기](#retrieving-user-details)

<a name="introduction"></a>
## 소개

일반적인 폼 기반 인증 외에도, 라라벨은 [Laravel Socialite](https://github.com/laravel/socialite)를 사용하여 OAuth 공급자를 통한 인증 기능을 간편하게 제공합니다. Socialite는 현재 Facebook, Twitter, LinkedIn, Google, GitHub, GitLab, Bitbucket 인증을 지원합니다.

> [!NOTE]
> 기타 플랫폼에 대한 어댑터는 커뮤니티 주도의 [Socialite Providers](https://socialiteproviders.com/) 웹사이트에서 확인하실 수 있습니다.

<a name="installation"></a>
## 설치

Socialite를 사용하려면, Composer 패키지 매니저로 해당 패키지를 프로젝트의 의존성에 추가하세요.

```shell
composer require laravel/socialite
```

<a name="upgrading-socialite"></a>
## Socialite 업그레이드

Socialite의 새로운 메이저 버전으로 업그레이드할 때는 반드시 [업그레이드 가이드](https://github.com/laravel/socialite/blob/master/UPGRADE.md)를 꼼꼼히 확인해야 합니다.

<a name="configuration"></a>
## 구성

Socialite를 사용하기 전에, 애플리케이션에서 사용할 OAuth 공급자별 인증 정보를 추가해야 합니다. 일반적으로 이러한 정보는 해당 서비스의 대시보드에서 "개발자 애플리케이션"을 생성하여 받을 수 있습니다.

해당 인증 정보는 애플리케이션의 `config/services.php` 설정 파일에 추가하며, 사용하는 공급자에 따라 `facebook`, `twitter`(OAuth 1.0), `twitter-oauth-2`(OAuth 2.0), `linkedin`, `google`, `github`, `gitlab`, `bitbucket` 중 하나의 키를 사용해야 합니다:

```
'github' => [
    'client_id' => env('GITHUB_CLIENT_ID'),
    'client_secret' => env('GITHUB_CLIENT_SECRET'),
    'redirect' => 'http://example.com/callback-url',
],
```

> [!NOTE]
> `redirect` 옵션에 상대 경로가 포함되어 있다면, 자동으로 전체 URL로 변환됩니다.

<a name="authentication"></a>
## 인증

<a name="routing"></a>
### 라우팅

OAuth 공급자를 이용해 사용자를 인증하려면, 두 개의 라우트가 필요합니다. 하나는 사용자를 OAuth 공급자로 리디렉트하기 위한 라우트이고, 다른 하나는 인증 후 공급자에서 콜백을 받는 라우트입니다. 아래 예제는 두 라우트 모두 구현하는 방법을 보여줍니다.

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

`Socialite` 파사드의 `redirect` 메서드는 사용자를 OAuth 공급자로 리디렉트하는 역할을 하며, `user` 메서드는 콜백 요청을 받아 인증이 승인된 후 공급자로부터 사용자 정보를 가져옵니다.

<a name="authentication-and-storage"></a>
### 인증 및 저장

OAuth 공급자에서 사용자를 받아온 후, 해당 사용자가 이미 애플리케이션 데이터베이스에 존재하는지 확인하고 [사용자를 인증](/docs/9.x/authentication#authenticate-a-user-instance)할 수 있습니다. 만약 사용자가 데이터베이스에 없다면, 보통 새로운 사용자 레코드를 생성하여 저장하게 됩니다.

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
> 특정 OAuth 공급자에서 제공하는 사용자 정보에 대한 자세한 내용은 [사용자 정보 가져오기](#retrieving-user-details) 문서를 참고하세요.

<a name="access-scopes"></a>
### 액세스 스코프

사용자를 리디렉트하기 전에, `scopes` 메서드를 사용하여 인증 요청에 포함할 "스코프" 목록을 지정할 수 있습니다. 이 메서드는 기존에 지정한 스코프와 함께, 추가로 지정하는 스코프를 합쳐줍니다.

```
use Laravel\Socialite\Facades\Socialite;

return Socialite::driver('github')
    ->scopes(['read:user', 'public_repo'])
    ->redirect();
```

인증 요청에서 이미 지정된 스코프를 모두 덮어쓰려면, `setScopes` 메서드를 사용할 수 있습니다.

```
return Socialite::driver('github')
    ->setScopes(['read:user', 'public_repo'])
    ->redirect();
```

<a name="optional-parameters"></a>
### 선택적 파라미터

여러 OAuth 공급자들은 인증 요청 시 추가적인 선택적 파라미터를 지원합니다. 이러한 파라미터를 포함하려면, `with` 메서드에 연관 배열을 전달하면 됩니다.

```
use Laravel\Socialite\Facades\Socialite;

return Socialite::driver('google')
    ->with(['hd' => 'example.com'])
    ->redirect();
```

> [!WARNING]
> `with` 메서드를 사용할 때는 `state`, `response_type`과 같은 예약어를 전달하지 않도록 주의하세요.

<a name="retrieving-user-details"></a>
## 사용자 정보 가져오기

사용자가 애플리케이션의 인증 콜백 라우트로 리디렉트된 뒤, Socialite의 `user` 메서드를 통해 사용자의 상세 정보를 받아올 수 있습니다. `user` 메서드가 반환하는 이용자 객체에는 사용자의 정보를 데이터베이스에 저장할 때 활용할 수 있는 여러 속성과 메서드가 제공됩니다.

해당 객체에 제공되는 속성과 메서드는, 해당 OAuth 공급자가 OAuth 1.0 또는 OAuth 2.0을 지원하는지에 따라 다소 차이가 있습니다.

```
use Laravel\Socialite\Facades\Socialite;

Route::get('/auth/callback', function () {
    $user = Socialite::driver('github')->user();

    // OAuth 2.0 공급자에서 사용 가능한 속성
    $token = $user->token;
    $refreshToken = $user->refreshToken;
    $expiresIn = $user->expiresIn;

    // OAuth 1.0 공급자에서 사용 가능한 속성
    $token = $user->token;
    $tokenSecret = $user->tokenSecret;

    // 모든 공급자에서 사용 가능한 메서드
    $user->getId();
    $user->getNickname();
    $user->getName();
    $user->getEmail();
    $user->getAvatar();
});
```

<a name="retrieving-user-details-from-a-token-oauth2"></a>
#### 토큰으로 사용자 정보 가져오기 (OAuth2)

이미 해당 사용자의 유효한 액세스 토큰이 있다면, Socialite의 `userFromToken` 메서드를 사용하여 사용자 정보를 가져올 수 있습니다.

```
use Laravel\Socialite\Facades\Socialite;

$user = Socialite::driver('github')->userFromToken($token);
```

<a name="retrieving-user-details-from-a-token-and-secret-oauth1"></a>
#### 토큰과 시크릿으로 사용자 정보 가져오기 (OAuth1)

이미 사용자의 유효한 토큰과 시크릿이 있다면, Socialite의 `userFromTokenAndSecret` 메서드를 통해 사용자 정보를 조회할 수 있습니다.

```
use Laravel\Socialite\Facades\Socialite;

$user = Socialite::driver('twitter')->userFromTokenAndSecret($token, $secret);
```

<a name="stateless-authentication"></a>
#### Stateless 인증

`stateless` 메서드를 사용하면 세션 상태 검증을 비활성화할 수 있습니다. 이 방법은 쿠키 기반 세션을 사용하지 않는 stateless API에 소셜 인증을 추가할 때 유용합니다.

```
use Laravel\Socialite\Facades\Socialite;

return Socialite::driver('google')->stateless()->user();
```

> [!WARNING]
> Stateless 인증은 Twitter OAuth 1.0 드라이버에서는 사용할 수 없습니다.
