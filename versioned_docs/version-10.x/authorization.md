# 인가 (Authorization)

- [소개](#introduction)
- [게이트](#gates)
    - [게이트 작성하기](#writing-gates)
    - [동작 인가하기](#authorizing-actions-via-gates)
    - [게이트 응답](#gate-responses)
    - [게이트 검사 가로채기](#intercepting-gate-checks)
    - [인라인 인가](#inline-authorization)
- [정책 만들기](#creating-policies)
    - [정책 생성하기](#generating-policies)
    - [정책 등록하기](#registering-policies)
- [정책 작성하기](#writing-policies)
    - [정책 메서드](#policy-methods)
    - [정책 응답](#policy-responses)
    - [모델이 필요 없는 메서드](#methods-without-models)
    - [게스트 사용자](#guest-users)
    - [정책 필터](#policy-filters)
- [정책을 이용한 인가](#authorizing-actions-using-policies)
    - [유저 모델을 통한 인가](#via-the-user-model)
    - [컨트롤러 헬퍼를 통한 인가](#via-controller-helpers)
    - [미들웨어를 통한 인가](#via-middleware)
    - [블레이드 템플릿을 통한 인가](#via-blade-templates)
    - [추가적인 컨텍스트 전달](#supplying-additional-context)

<a name="introduction"></a>
## 소개

라라벨은 기본 [인증](/docs/10.x/authentication) 기능 외에도, 특정 리소스에 대해 사용자의 동작을 인가(Authorization)할 수 있는 간단한 방법을 제공합니다. 예를 들어, 사용자가 인증은 되었지만, 애플리케이션이 관리하는 특정 Eloquent 모델이나 데이터베이스 레코드를 수정하거나 삭제할 권한이 없을 수 있습니다. 라라벨의 인가 기능은 이런 종류의 권한 검사를 쉽고 체계적으로 관리할 수 있도록 도와줍니다.

라라벨은 주로 두 가지 방법으로 동작을 인가할 수 있습니다: [게이트(Gate)](#gates)와 [정책(Policy)](#creating-policies)입니다. 게이트와 정책은 각각 라우트와 컨트롤러처럼 생각할 수 있습니다. 게이트는 클로저(익명 함수) 기반의 간단한 인가 방식을 제공하며, 정책은 컨트롤러처럼 특정 모델이나 리소스에 대한 인가 로직을 그룹화할 수 있습니다. 이 문서에서는 먼저 게이트를 다루고, 이어서 정책을 살펴보겠습니다.

애플리케이션을 만들 때 게이트만 사용하거나 정책만 사용해야 하는 것은 아닙니다. 대부분의 애플리케이션에서는 게이트와 정책을 혼합해 사용하는 경우가 많으며, 이는 전혀 문제가 되지 않습니다! 게이트는 관리자 대시보드 보기처럼 특정 모델이나 리소스와 직접 관련이 없는 동작의 인가에 가장 적합합니다. 반면, 특정 모델이나 리소스에 대한 동작을 인가하고 싶다면 정책을 사용하는 것이 좋습니다.

<a name="gates"></a>
## 게이트

<a name="writing-gates"></a>
### 게이트 작성하기

> [!NOTE]
> 게이트는 라라벨의 인가 기능의 기본 개념을 배우기에 좋은 방법입니다. 그러나 확장 가능한 라라벨 애플리케이션을 개발할 때는 인가 규칙을 [정책](#creating-policies)으로 체계적으로 관리하는 것을 권장합니다.

게이트는 사용자가 특정 동작을 수행할 수 있는지 판단하는 클로저(익명 함수)입니다. 일반적으로 게이트는 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드 안에서 `Gate` 파사드를 사용해 정의합니다. 게이트는 항상 첫 번째 인수로 사용자 인스턴스를 받고, 선택적으로 관련된 Eloquent 모델 등 추가 인수를 받을 수 있습니다.

아래 예시는 사용자가 주어진 `App\Models\Post` 모델을 수정할 수 있는지 판단하는 게이트를 정의하는 코드입니다. 이 게이트는 사용자의 `id`와 게시글을 작성한 사용자의 `user_id`를 비교해서 권한을 결정합니다.

```
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

/**
 * 인증 및 인가 서비스 등록.
 */
public function boot(): void
{
    Gate::define('update-post', function (User $user, Post $post) {
        return $user->id === $post->user_id;
    });
}
```

컨트롤러처럼, 게이트도 클래스 콜백 배열로 정의할 수 있습니다.

```
use App\Policies\PostPolicy;
use Illuminate\Support\Facades\Gate;

/**
 * 인증 및 인가 서비스 등록.
 */
public function boot(): void
{
    Gate::define('update-post', [PostPolicy::class, 'update']);
}
```

<a name="authorizing-actions-via-gates"></a>
### 동작 인가하기

게이트를 사용하여 동작을 인가하려면, `Gate` 파사드에서 제공하는 `allows` 또는 `denies` 메서드를 사용하면 됩니다. 이때 현재 인증된 사용자를 따로 전달할 필요는 없습니다. 라라벨이 자동으로 사용자를 게이트 클로저에 전달해줍니다. 일반적으로 인가가 필요한 동작을 수행하기 전에 컨트롤러 내부에서 게이트 인가 메서드를 호출합니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    /**
     * 주어진 게시글을 수정합니다.
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        if (! Gate::allows('update-post', $post)) {
            abort(403);
        }

        // 게시글 수정...

        return redirect('/posts');
    }
}
```

현재 인증된 사용자 이외의 다른 사용자가 동작을 수행할 수 있는지 확인하고 싶다면, `Gate` 파사드의 `forUser` 메서드를 사용하면 됩니다.

```
if (Gate::forUser($user)->allows('update-post', $post)) {
    // 해당 사용자는 게시글을 수정할 수 있습니다...
}

if (Gate::forUser($user)->denies('update-post', $post)) {
    // 해당 사용자는 게시글을 수정할 수 없습니다...
}
```

여러 동작을 한 번에 인가하고 싶다면, `any` 또는 `none` 메서드를 사용할 수 있습니다.

```
if (Gate::any(['update-post', 'delete-post'], $post)) {
    // 사용자는 게시글을 수정하거나 삭제할 수 있습니다...
}

if (Gate::none(['update-post', 'delete-post'], $post)) {
    // 사용자는 게시글을 수정하거나 삭제할 수 없습니다...
}
```

<a name="authorizing-or-throwing-exceptions"></a>
#### 인가 또는 예외 발생

동작 인가 시, 사용자가 해당 동작을 수행할 권한이 없을 경우 자동으로 `Illuminate\Auth\Access\AuthorizationException` 예외를 던지고 싶다면, `Gate` 파사드의 `authorize` 메서드를 사용할 수 있습니다. `AuthorizationException`이 발생하면 라라벨의 예외 핸들러가 자동으로 403 HTTP 응답으로 변환해줍니다.

```
Gate::authorize('update-post', $post);

// 동작이 인가되었습니다...
```

<a name="gates-supplying-additional-context"></a>
#### 추가적인 컨텍스트 제공

게이트의 인가 메서드들(`allows`, `denies`, `check`, `any`, `none`, `authorize`, `can`, `cannot`)과 [Blade 지시어](#via-blade-templates)(`@can`, `@cannot`, `@canany`)는 두 번째 인수로 배열을 받을 수 있습니다. 배열의 각 요소는 게이트 클로저의 파라미터로 전달되며, 인가 판단 시 추가 컨텍스트로 활용할 수 있습니다.

```
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::define('create-post', function (User $user, Category $category, bool $pinned) {
    if (! $user->canPublishToGroup($category->group)) {
        return false;
    } elseif ($pinned && ! $user->canPinPosts()) {
        return false;
    }

    return true;
});

if (Gate::check('create-post', [$category, $pinned])) {
    // 사용자가 게시글을 생성할 수 있습니다...
}
```

<a name="gate-responses"></a>
### 게이트 응답

지금까지는 게이트에서 단순히 불리언 값을 반환하는 경우만 살펴보았습니다. 하지만 경우에 따라 오류 메시지 등 좀 더 상세한 응답을 반환하고 싶을 때가 있습니다. 이럴 때는 게이트에서 `Illuminate\Auth\Access\Response`를 반환할 수 있습니다.

```
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Gate;

Gate::define('edit-settings', function (User $user) {
    return $user->isAdmin
                ? Response::allow()
                : Response::deny('You must be an administrator.');
});
```

게이트에서 인가 응답을 반환하더라도, `Gate::allows` 메서드는 여전히 단순 불리언 값만 반환합니다. 하지만 `Gate::inspect` 메서드를 사용하면 게이트에서 반환한 전체 인가 응답(메시지 등)을 확인할 수 있습니다.

```
$response = Gate::inspect('edit-settings');

if ($response->allowed()) {
    // 동작이 인가됨...
} else {
    echo $response->message();
}
```

`Gate::authorize` 메서드를 사용하면, 인가되지 않을 경우 `AuthorizationException`이 발생하며, 게이트에서 정의한 에러 메시지가 HTTP 응답에도 반영됩니다.

```
Gate::authorize('edit-settings');

// 동작이 인가됨...
```

<a name="customising-gate-response-status"></a>
#### HTTP 응답 상태 커스터마이즈

게이트를 통해 동작 인가에 실패하면 기본적으로 `403` HTTP 응답이 반환됩니다. 하지만 경우에 따라 다른 HTTP 상태 코드를 반환해야 할 수도 있습니다. 이때는 `Illuminate\Auth\Access\Response` 클래스의 `denyWithStatus` 정적 생성 메서드를 통해 실패 시 반환할 HTTP 상태 코드를 지정할 수 있습니다.

```
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Gate;

Gate::define('edit-settings', function (User $user) {
    return $user->isAdmin
                ? Response::allow()
                : Response::denyWithStatus(404);
});
```

리소스를 `404`로 숨기는 패턴은 웹 애플리케이션에서 매우 흔하므로, `denyAsNotFound` 메서드도 제공됩니다.

```
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Gate;

Gate::define('edit-settings', function (User $user) {
    return $user->isAdmin
                ? Response::allow()
                : Response::denyAsNotFound();
});
```

<a name="intercepting-gate-checks"></a>
### 게이트 검사 가로채기

특정 사용자에게는 모든 권한을 부여하고 싶을 수 있습니다. 이럴 때는 `before` 메서드를 사용해, 모든 게이트 인가 검사 전에 실행되는 클로저를 정의할 수 있습니다.

```
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::before(function (User $user, string $ability) {
    if ($user->isAdministrator()) {
        return true;
    }
});
```

`before` 클로저가 null이 아닌 값을 반환하면, 그 값이 인가 검사 결과로 적용됩니다.

모든 인가 검사 후에 실행되는 클로저를 정의하려면 `after` 메서드를 사용할 수 있습니다.

```
use App\Models\User;

Gate::after(function (User $user, string $ability, bool|null $result, mixed $arguments) {
    if ($user->isAdministrator()) {
        return true;
    }
});
```

`after` 메서드도 마찬가지로 null이 아닌 값을 반환하면, 해당 값이 인가 검사 결과로 사용됩니다.

<a name="inline-authorization"></a>
### 인라인 인가

가끔은 특정 동작을 위한 전용 게이트를 별도로 정의하지 않고, 인증된 사용자가 바로 그 동작을 수행할 권한이 있는지 판단하고 싶을 때가 있습니다. 이런 경우 `Gate::allowIf`와 `Gate::denyIf` 메서드를 사용해 "인라인" 인가 검사를 할 수 있습니다. 인라인 인가 검사에서는 [before/after 후크](#intercepting-gate-checks)가 실행되지 않습니다.

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::allowIf(fn (User $user) => $user->isAdministrator());

Gate::denyIf(fn (User $user) => $user->banned());
```

만약 동작이 인가되지 않았거나, 현재 인증된 사용자가 없다면, 라라벨은 자동으로 `Illuminate\Auth\Access\AuthorizationException` 예외를 발생시킵니다. 이 예외는 라라벨의 예외 핸들러에서 403 HTTP 응답으로 변환됩니다.

<a name="creating-policies"></a>
## 정책 만들기

<a name="generating-policies"></a>
### 정책 생성하기

정책(Policy)은 특정 모델이나 리소스에 대한 인가 로직을 클래스 형태로 체계적으로 관리할 수 있도록 도와줍니다. 예를 들어, 블로그 애플리케이션이라면 `App\Models\Post` 모델에 대해 생성, 수정 같은 사용자 동작을 인가하기 위한 `App\Policies\PostPolicy` 정책 클래스를 만들 수 있습니다.

정책은 Artisan 명령어 `make:policy`를 사용해 생성할 수 있습니다. 생성된 정책 클래스는 `app/Policies` 디렉터리에 위치하며, 해당 디렉터리가 없다면 라라벨이 자동으로 생성합니다.

```shell
php artisan make:policy PostPolicy
```

`make:policy` 명령은 기본적으로 빈 정책 클래스를 만듭니다. 추가로 `--model` 옵션을 주면, 리소스 조회, 생성, 수정, 삭제에 필요한 정책 메서드 예시가 포함된 클래스가 생성됩니다.

```shell
php artisan make:policy PostPolicy --model=Post
```

<a name="registering-policies"></a>
### 정책 등록하기

정책 클래스를 만들었다면, 이제 이를 등록해야 합니다. 정책 등록은 특정 모델 타입에 대해 어떤 정책을 사용할지 라라벨에 알려주는 과정입니다.

라라벨 기본 애플리케이션에는 `App\Providers\AuthServiceProvider`에 `policies` 프로퍼티가 있으며, Eloquent 모델과 그에 대응하는 정책을 매핑합니다. 정책을 등록하면, 해당 모델에 대한 인가 검사를 할 때 어떤 정책을 사용할지 라라벨이 알 수 있습니다.

```
<?php

namespace App\Providers;

use App\Models\Post;
use App\Policies\PostPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * 이 애플리케이션의 정책 매핑.
     *
     * @var array
     */
    protected $policies = [
        Post::class => PostPolicy::class,
    ];

    /**
     * 인증 및 인가 서비스 등록.
     */
    public function boot(): void
    {
        // ...
    }
}
```

<a name="policy-auto-discovery"></a>
#### 정책 자동 발견

모델 정책을 일일이 수동으로 등록하는 대신, 라라벨이 정해진 네이밍 규칙을 따르면 자동으로 정책을 찾아 등록해줄 수 있습니다. 구체적으로, 정책 클래스는 모델이 존재하는 디렉터리의 상위 또는 동일 레벨의 `Policies` 디렉터리에 위치해야 하며, 예를 들어 모델이 `app/Models`에 있다면, 정책은 `app/Policies`에 둘 수 있습니다. 이때 라라벨은 `app/Models/Policies`와 `app/Policies`에서 정책을 찾습니다. 또한 정책 클래스명은 모델명에 `Policy`를 붙인 이름이어야 합니다(예: `User` 모델 ⇒ `UserPolicy`).

자동 검색 방식을 직접 정의하고 싶다면, `Gate::guessPolicyNamesUsing` 메서드에 콜백을 등록하면 됩니다. 이 메서드는 보통 애플리케이션의 `AuthServiceProvider`의 `boot` 메서드에서 호출합니다.

```
use Illuminate\Support\Facades\Gate;

Gate::guessPolicyNamesUsing(function (string $modelClass) {
    // 주어진 모델에 대해 사용할 정책 클래스명을 반환하세요...
});
```

> [!NOTE]
> `AuthServiceProvider`에서 명시적으로 정책을 매핑한 경우, 이 매핑이 자동 검색된 정책보다 항상 우선 적용됩니다.

<a name="writing-policies"></a>
## 정책 작성하기

<a name="policy-methods"></a>
### 정책 메서드

정책 클래스를 등록했다면, 인가할 각 동작(ability)에 대한 메서드를 정책 클래스에 추가할 수 있습니다. 예를 들어, `PostPolicy`에 `update` 메서드를 정의해, 특정 `App\Models\User`가 `App\Models\Post` 인스턴스를 수정할 수 있는지 판단하는 코드를 만들 수 있습니다.

`update` 메서드는 인수로 `User`와 `Post` 인스턴스를 받아, 사용자가 해당 게시글을 수정할 수 있으면 `true`, 아니라면 `false`를 반환하면 됩니다. 즉, 사용자의 `id`와 게시글의 `user_id`를 비교하여 권한을 판단하는 식입니다.

```
<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * 주어진 게시글이 사용자가 수정할 수 있는지 판별합니다.
     */
    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }
}
```

정책에는 이렇게 각 동작을 인가하기 위한 메서드를 필요에 따라 계속 추가할 수 있습니다. 예로 `view`나 `delete` 등 다양한 게시글 관련 동작에 대해 메서드를 정의할 수 있으며, 정책 메서드명은 자유롭게 지정할 수 있습니다.

Artisan 콘솔로 정책을 생성할 때 `--model` 옵션을 사용했다면, 이미 `viewAny`, `view`, `create`, `update`, `delete`, `restore`, `forceDelete`용 메서드가 포함되어 있습니다.

> [!NOTE]
> 모든 정책 클래스는 라라벨 [서비스 컨테이너](/docs/10.x/container)를 통해 해결되므로, 생성자에서 필요한 의존성을 타입힌트하면 자동으로 주입받을 수 있습니다.

<a name="policy-responses"></a>
### 정책 응답

지금까지 살펴본 정책 메서드는 단순히 불리언 값을 반환했습니다. 그러나 때에 따라 오류 메시지 등 좀 더 자세한 응답을 반환하고 싶을 때가 있습니다. 이럴 땐 정책 메서드에서 `Illuminate\Auth\Access\Response` 인스턴스를 반환할 수 있습니다.

```
use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * 주어진 게시글이 사용자가 수정할 수 있는지 판별합니다.
 */
public function update(User $user, Post $post): Response
{
    return $user->id === $post->user_id
                ? Response::allow()
                : Response::deny('You do not own this post.');
}
```

정책에서 인가 응답을 반환해도 `Gate::allows` 메서드는 여전히 불리언 값만 반환합니다. 하지만 `Gate::inspect` 메서드를 사용하면 게이트/정책에서 반환한 상세한 인가 응답(메시지 등)을 확인할 수 있습니다.

```
use Illuminate\Support\Facades\Gate;

$response = Gate::inspect('update', $post);

if ($response->allowed()) {
    // 동작이 인가됨...
} else {
    echo $response->message();
}
```

`Gate::authorize` 메서드를 사용할 때, 인가되지 않은 경우 발생하는 `AuthorizationException`에는 정책 응답에서 정의한 에러 메시지가 HTTP 응답에 포함됩니다.

```
Gate::authorize('update', $post);

// 동작이 인가됨...
```

<a name="customising-policy-response-status"></a>
#### HTTP 응답 상태 커스터마이즈

정책 메서드를 통해 동작 인가에 실패하면 기본적으로 `403` HTTP 응답이 반환됩니다. 하지만 상황에 따라 다른 HTTP 상태 코드를 반환하고 싶을 때는, `Illuminate\Auth\Access\Response`의 `denyWithStatus` 정적 생성 메서드로 실패 시 반환할 상태 코드를 지정할 수 있습니다.

```
use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * 주어진 게시글이 사용자가 수정할 수 있는지 판별합니다.
 */
public function update(User $user, Post $post): Response
{
    return $user->id === $post->user_id
                ? Response::allow()
                : Response::denyWithStatus(404);
}
```

리소스를 `404`로 숨기는 경우가 흔하기 때문에, 더 간편하게 사용할 수 있는 `denyAsNotFound` 메서드도 제공됩니다.

```
use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * 주어진 게시글이 사용자가 수정할 수 있는지 판별합니다.
 */
public function update(User $user, Post $post): Response
{
    return $user->id === $post->user_id
                ? Response::allow()
                : Response::denyAsNotFound();
}
```

<a name="methods-without-models"></a>
### 모델이 필요 없는 메서드

일부 정책 메서드는 현재 인증된 사용자 인스턴스만을 받는 경우도 있습니다. 이런 상황은 대개 `create`처럼 리소스 인스턴스 없이 동작을 인가해야 할 때 발생합니다. 예를 들어, 블로그 애플리케이션에서 사용자가 글을 생성할 권한이 있는지 판단하고자 할 때는 정책 메서드에서 사용자만 인수로 기대하면 됩니다.

```
/**
 * 주어진 사용자가 게시글을 생성할 수 있는지 판별합니다.
 */
public function create(User $user): bool
{
    return $user->role == 'writer';
}
```

<a name="guest-users"></a>
### 게스트 사용자

기본적으로 인증되지 않은 사용자가 보낸 HTTP 요청에 대해 모든 게이트/정책은 자동으로 `false`를 반환합니다. 하지만 사용자 인자 타입힌트에 "옵셔널"하게 선언하거나, 기본값을 `null`로 주면 인증되지 않은(게스트) 사용자도 인가 검사가 게이트/정책 메서드에 전달될 수 있습니다.

```
<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * 주어진 게시글이 사용자가 수정할 수 있는지 판별합니다.
     */
    public function update(?User $user, Post $post): bool
    {
        return $user?->id === $post->user_id;
    }
}
```

<a name="policy-filters"></a>
### 정책 필터

특정 사용자에 대해 해당 정책 내 모든 동작을 인가하고 싶은 경우, 정책 클래스에 `before` 메서드를 정의하면 됩니다. 이 메서드는 정책의 다른 메서드보다 먼저 호출되어, 원래 정책 메서드를 실행하기 전에 추가 인가 검사를 할 수 있습니다. 주로 애플리케이션 관리자에게 모든 동작을 허용하고자 할 때 사용합니다.

```
use App\Models\User;

/**
 * 사전 인가 검사 처리.
 */
public function before(User $user, string $ability): bool|null
{
    if ($user->isAdministrator()) {
        return true;
    }

    return null;
}
```

특정 사용자 유형에 대해 모든 동작을 거부하고 싶다면, `before` 메서드에서 `false`를 반환하면 됩니다. 만약 `null`을 반환하면, 인가 검사는 원래 정책 메서드로 넘어갑니다.

> [!NOTE]
> 정책 클래스의 `before` 메서드는, 정책 클래스에 인가하고자 하는 ability(동작)와 이름이 일치하는 메서드가 있을 때만 호출됩니다.

<a name="authorizing-actions-using-policies"></a>
## 정책을 이용한 인가

<a name="via-the-user-model"></a>
### 유저 모델을 통한 인가

라라벨의 `App\Models\User` 모델에는 두 가지 유용한 인가 메서드가 있습니다: `can`과 `cannot`. 이 메서드들은 인가하려는 동작의 이름과 관련 모델을 인수로 받습니다. 예를 들어, 사용자가 주어진 `App\Models\Post` 모델을 수정할 권한이 있는지 확인하려면, 컨트롤러 등에서 다음처럼 사용할 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * 주어진 게시글을 수정합니다.
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        if ($request->user()->cannot('update', $post)) {
            abort(403);
        }

        // 게시글 수정...

        return redirect('/posts');
    }
}
```

해당 모델에 대해 [정책이 등록되어](#registering-policies) 있다면, `can` 메서드는 자동으로 적절한 정책을 호출해 불리언 결과를 반환합니다. 만약 정책이 등록되어 있지 않다면, 이름이 일치하는 클로저 기반 게이트를 호출하려 시도합니다.

<a name="user-model-actions-that-dont-require-models"></a>
#### 모델 인스턴스가 필요 없는 동작

일부 동작은, 예를 들어 `create`처럼 정책의 실제 리소스 인스턴스가 필요하지 않을 수 있습니다. 이 경우 `can` 메서드에 클래스명을 전달할 수 있습니다. 이 클래스명은 어떤 정책을 사용할지 결정할 때 사용됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * 게시글을 생성합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->cannot('create', Post::class)) {
            abort(403);
        }

        // 게시글 생성...

        return redirect('/posts');
    }
}
```

<a name="via-controller-helpers"></a>
### 컨트롤러 헬퍼를 통한 인가

`App\Models\User` 모델의 유틸리티 메서드들 외에도, 라라벨은 `App\Http\Controllers\Controller`를 상속한 모든 컨트롤러에서 인가를 위한 `authorize` 메서드를 제공합니다.

이 메서드는 인가하고자 하는 동작 이름과 관련 모델을 인수로 받으며, 인가에 실패하면 `Illuminate\Auth\Access\AuthorizationException` 예외를 발생시킵니다. 이 예외는 라라벨의 예외 핸들러에 의해 403 상태 코드의 HTTP 응답으로 자동 변환됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * 주어진 블로그 게시글을 수정합니다.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        $this->authorize('update', $post);

        // 현재 사용자가 게시글을 수정할 수 있습니다...

        return redirect('/posts');
    }
}
```

<a name="controller-actions-that-dont-require-models"></a>
#### 모델 인스턴스가 필요 없는 동작

앞서 설명한 것처럼, `create`처럼 정책의 실제 리소스 인스턴스가 필요 없는 경우, `authorize` 메서드에 클래스명을 전달하면 됩니다. 이 클래스명은 어떤 정책을 사용할지 판단할 때 사용됩니다.

```
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * 새 블로그 게시글을 생성합니다.
 *
 * @throws \Illuminate\Auth\Access\AuthorizationException
 */
public function create(Request $request): RedirectResponse
{
    $this->authorize('create', Post::class);

    // 현재 사용자가 새 게시글을 생성할 수 있습니다...

    return redirect('/posts');
}
```

<a name="authorizing-resource-controllers"></a>
#### 리소스 컨트롤러의 인가

[리소스 컨트롤러](/docs/10.x/controllers#resource-controllers)를 사용할 때, 컨트롤러의 생성자에서 `authorizeResource` 메서드를 활용할 수 있습니다. 이 메서드는 해당 리소스 컨트롤러의 각 메서드에 적절한 `can` 미들웨어를 자동으로 등록해줍니다.

`authorizeResource`의 첫 번째 인수에는 모델 클래스명을, 두 번째 인수에는 라우트/요청 파라미터 명(모델 ID가 들어있는 파라미터 명)을 지정합니다. [리소스 컨트롤러](/docs/10.x/controllers#resource-controllers)를 생성할 때 `--model` 플래그를 사용하면, 필요한 메서드 시그니처와 타입힌트가 자동으로 추가됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Post;

class PostController extends Controller
{
    /**
     * 컨트롤러 인스턴스 생성자.
     */
    public function __construct()
    {
        $this->authorizeResource(Post::class, 'post');
    }
}
```

아래의 컨트롤러 메서드들은 해당 정책 메서드와 매핑됩니다. 요청이 컨트롤러의 해당 메서드로 라우팅되면, 정책 메서드가 먼저 호출되어 인가 검사를 수행합니다.

<div class="overflow-auto">

| 컨트롤러 메서드 | 정책 메서드 |
| --- | --- |
| index | viewAny |
| show | view |
| create | create |
| store | create |
| edit | update |
| update | update |
| destroy | delete |

</div>

> [!NOTE]
> `--model` 옵션으로 `make:policy` 명령을 사용하면, 지정한 모델용 정책 클래스를 신속하게 생성할 수 있습니다: `php artisan make:policy PostPolicy --model=Post`.

<a name="via-middleware"></a>
### 미들웨어를 통한 인가

라라벨에서는 라우트나 컨트롤러가 실행되기 전에 미들웨어에서 동작 인가를 할 수 있는 기능을 제공합니다. 기본적으로, `Illuminate\Auth\Middleware\Authorize` 미들웨어가 `App\Http\Kernel` 클래스에서 `can` 키로 할당되어 있습니다. 예를 들어, 사용자가 게시글을 수정할 수 있는지 확인하기 위해 `can` 미들웨어를 사용하는 방법은 아래와 같습니다.

```
use App\Models\Post;

Route::put('/post/{post}', function (Post $post) {
    // 현재 사용자가 게시글을 수정할 수 있습니다...
})->middleware('can:update,post');
```

여기서 `can` 미들웨어에는 두 개의 인수가 전달됩니다. 첫 번째는 인가할 동작의 이름, 두 번째는 정책 메서드에 전달할 라우트 파라미터입니다. [암시적 모델 바인딩](/docs/10.x/routing#implicit-binding)을 사용하고 있으므로, `App\Models\Post` 모델이 정책 메서드로 전달됩니다. 사용자가 해당 동작을 인가받지 못하면, 미들웨어가 자동으로 403 상태 코드의 HTTP 응답을 반환합니다.

더 편리하게, `can` 미들웨어를 라우트에 직접 `can` 메서드로 붙일 수도 있습니다.

```
use App\Models\Post;

Route::put('/post/{post}', function (Post $post) {
    // 현재 사용자가 게시글을 수정할 수 있습니다...
})->can('update', 'post');
```

<a name="middleware-actions-that-dont-require-models"></a>
#### 모델 인스턴스가 필요 없는 동작

마찬가지로, `create`와 같이 정책의 실제 모델 인스턴스가 필요 없는 경우에는 미들웨어에 클래스명을 전달할 수 있습니다. 이렇게 하면 해당 동작의 인가 검사를 할 때 어떤 정책을 사용할지 결정합니다.

```
Route::post('/post', function () {
    // 현재 사용자가 게시글을 생성할 수 있습니다...
})->middleware('can:create,App\Models\Post');
```

문자열 미들웨어 정의에 전체 클래스 이름을 명시하는 것이 번거로울 수 있으니, `can` 메서드로 더 간단하게 지정할 수도 있습니다.

```
use App\Models\Post;

Route::post('/post', function () {
    // 현재 사용자가 게시글을 생성할 수 있습니다...
})->can('create', Post::class);
```

<a name="via-blade-templates"></a>
### 블레이드 템플릿을 통한 인가

Blade 템플릿을 작성할 때, 사용자가 특정 동작을 수행할 권한이 있을 때만 페이지 일부를 보여주고 싶을 때가 있습니다. 예를 들어, 사용자가 게시글을 수정할 수 있을 때만 게시글 수정 폼을 보여주고 싶을 수 있습니다. 이런 경우 `@can`과 `@cannot` 지시어를 사용할 수 있습니다.

```blade
@can('update', $post)
    <!-- 현재 사용자가 게시글을 수정할 수 있습니다... -->
@elsecan('create', App\Models\Post::class)
    <!-- 현재 사용자가 새 게시글을 생성할 수 있습니다... -->
@else
    <!-- ... -->
@endcan

@cannot('update', $post)
    <!-- 현재 사용자는 게시글을 수정할 수 없습니다... -->
@elsecannot('create', App\Models\Post::class)
    <!-- 현재 사용자는 새 게시글을 생성할 수 없습니다... -->
@endcannot
```

이 지시어들은 `@if`/`@unless`문을 더 간편하게 쓸 수 있도록 도와줍니다. 예를 들어 아래와 같이 쓸 수도 있습니다.

```blade
@if (Auth::user()->can('update', $post))
    <!-- 현재 사용자가 게시글을 수정할 수 있습니다... -->
@endif

@unless (Auth::user()->can('update', $post))
    <!-- 현재 사용자는 게시글을 수정할 수 없습니다... -->
@endunless
```

동작 이름의 배열을 전달해, 사용자가 여러 동작 중 하나라도 권한을 갖고 있는지 판단할 수도 있습니다. 이럴 때는 `@canany` 지시어를 사용합니다.

```blade
@canany(['update', 'view', 'delete'], $post)
    <!-- 현재 사용자가 게시글을 수정/조회/삭제할 수 있습니다... -->
@elsecanany(['create'], \App\Models\Post::class)
    <!-- 현재 사용자가 게시글을 생성할 수 있습니다... -->
@endcanany
```

<a name="blade-actions-that-dont-require-models"></a>
#### 모델 인스턴스가 필요 없는 동작

다른 인가 메서드들처럼, 정책의 실제 리소스 인스턴스가 필요하지 않은 경우, `@can`이나 `@cannot`에 클래스명을 전달할 수 있습니다.

```blade
@can('create', App\Models\Post::class)
    <!-- 현재 사용자가 게시글을 생성할 수 있습니다... -->
@endcan

@cannot('create', App\Models\Post::class)
    <!-- 현재 사용자는 게시글을 생성할 수 없습니다... -->
@endcannot
```

<a name="supplying-additional-context"></a>
### 추가적인 컨텍스트 전달

정책을 사용해 동작을 인가할 때, 두 번째 인수로 배열을 전달할 수 있습니다. 이 배열의 첫 번째 요소는 어떤 정책을 사용할지 판별하는 데 사용되고, 나머지 요소들은 정책 메서드의 파라미터로 전달되어 인가 판단 시 추가 컨텍스트로 사용될 수 있습니다. 예를 들어, 아래와 같이 추가 `$category` 파라미터가 있는 `PostPolicy`의 `update` 메서드를 생각해볼 수 있습니다.

```
/**
 * 주어진 게시글이 사용자가 수정할 수 있는지 판별합니다.
 */
public function update(User $user, Post $post, int $category): bool
{
    return $user->id === $post->user_id &&
           $user->canUpdateCategory($category);
}
```

이제 인증된 사용자가 주어진 게시글을 수정할 수 있는지 확인할 때, 아래처럼 정책 메서드를 호출하면 됩니다.

```
/**
 * 주어진 블로그 게시글을 수정합니다.
 *
 * @throws \Illuminate\Auth\Access\AuthorizationException
 */
public function update(Request $request, Post $post): RedirectResponse
{
    $this->authorize('update', [$post, $request->category]);

    // 현재 사용자가 게시글을 수정할 수 있습니다...

    return redirect('/posts');
}
```