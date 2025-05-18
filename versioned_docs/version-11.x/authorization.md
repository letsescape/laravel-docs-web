# 인가 (Authorization)

- [소개](#introduction)
- [게이트(Gates)](#gates)
    - [게이트 작성하기](#writing-gates)
    - [행동 인가하기](#authorizing-actions-via-gates)
    - [게이트 응답](#gate-responses)
    - [게이트 검사 가로채기](#intercepting-gate-checks)
    - [인라인 인가 처리](#inline-authorization)
- [정책 만들기](#creating-policies)
    - [정책 생성](#generating-policies)
    - [정책 등록](#registering-policies)
- [정책 작성하기](#writing-policies)
    - [정책 메서드](#policy-methods)
    - [정책 응답](#policy-responses)
    - [모델 없는 메서드](#methods-without-models)
    - [게스트 사용자](#guest-users)
    - [정책 필터](#policy-filters)
- [정책을 사용한 행동 인가](#authorizing-actions-using-policies)
    - [유저 모델을 통한 인가](#via-the-user-model)
    - [Gate 파사드를 통한 인가](#via-the-gate-facade)
    - [미들웨어를 통한 인가](#via-middleware)
    - [Blade 템플릿을 통한 인가](#via-blade-templates)
    - [추가 컨텍스트 제공](#supplying-additional-context)
- [인가와 Inertia](#authorization-and-inertia)

<a name="introduction"></a>
## 소개

라라벨은 기본적인 [인증](/docs/11.x/authentication) 서비스 외에도, 주어진 리소스에 대해 사용자의 행동을 인가(권한 부여)할 수 있는 간단한 방법을 제공합니다. 예를 들어, 사용자가 인증되었다고 해도, 애플리케이션에서 관리하는 특정 Eloquent 모델이나 데이터베이스 레코드를 업데이트하거나 삭제할 권한이 없을 수 있습니다. 라라벨의 인가 기능은 이러한 인가 검사를 쉽고 체계적으로 관리할 수 있도록 도와줍니다.

라라벨에서는 행동을 인가하는 주요 방법으로 [게이트(Gates)](#gates)와 [정책(Policies)](#creating-policies) 두 가지가 있습니다. 게이트와 정책의 관계를 라우트와 컨트롤러에 비유할 수 있습니다. 게이트는 단순히 클로저 기반의 인가 방식을 제공하며, 정책은 컨트롤러처럼 특정 모델이나 리소스에 관련된 인가 로직을 그룹핑합니다. 이 문서에서는 먼저 게이트를 살펴보고 이후 정책에 대해 설명합니다.

애플리케이션을 구축할 때 반드시 게이트만 사용하거나 정책만 사용해야 하는 것은 아닙니다. 대부분의 애플리케이션은 게이트와 정책이 혼합되어 사용하는 경우가 많으며, 이는 전혀 문제가 되지 않습니다! 게이트는 주로 모델이나 리소스와 직접 관련이 없는 행동(예: 관리자 대시보드 보기 등)에 적합합니다. 반면, 정책은 특정 모델이나 리소스에 대한 행동을 인가하고자 할 때 사용합니다.

<a name="gates"></a>
## 게이트(Gates)

<a name="writing-gates"></a>
### 게이트 작성하기

> [!WARNING]  
> 게이트는 라라벨 인가 기능의 기본을 배우기에 좋은 방법입니다. 하지만 더 견고한 라라벨 애플리케이션을 만들고자 한다면, 인가 규칙을 체계적으로 관리하기 위해 [정책(Policies)](#creating-policies) 사용을 고려하시기 바랍니다.

게이트는 사용자가 특정 행동을 수행할 수 있는지 판단하는 단순한 클로저입니다. 일반적으로 게이트는 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드 안에서 `Gate` 파사드를 사용해 정의합니다. 게이트는 항상 첫 번째 인수로 사용자 인스턴스를 받고, 필요하다면 관련 Eloquent 모델 등 추가적인 인수를 받을 수 있습니다.

다음 예제에서는 사용자가 특정 `App\Models\Post` 모델을 업데이트할 수 있는지 판단하는 게이트를 정의합니다. 이 게이트는 사용자의 `id`와 게시글 작성자의 `user_id`를 비교하여 권한 여부를 정합니다:

```
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Gate::define('update-post', function (User $user, Post $post) {
        return $user->id === $post->user_id;
    });
}
```

컨트롤러처럼, 게이트도 클래스 콜백 배열 방식을 사용할 수 있습니다:

```
use App\Policies\PostPolicy;
use Illuminate\Support\Facades\Gate;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Gate::define('update-post', [PostPolicy::class, 'update']);
}
```

<a name="authorizing-actions-via-gates"></a>
### 행동 인가하기

게이트를 통해 행동을 인가하려면, `Gate` 파사드에서 제공하는 `allows` 또는 `denies` 메서드를 사용하면 됩니다. 이때, 현재 인증된 사용자를 직접 전달할 필요는 없습니다. 라라벨이 자동으로 게이트 클로저에 사용자를 전달합니다. 일반적으로 컨트롤러에서 인가가 필요한 행동을 수행하기 전에 게이트 인가 메서드를 호출합니다:

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
     * Update the given post.
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        if (! Gate::allows('update-post', $post)) {
            abort(403);
        }

        // Update the post...

        return redirect('/posts');
    }
}
```

현재 인증된 사용자가 아닌, 다른 사용자가 특정 행동을 수행할 수 있는지 확인하려면 `Gate` 파사드의 `forUser` 메서드를 사용할 수 있습니다:

```
if (Gate::forUser($user)->allows('update-post', $post)) {
    // The user can update the post...
}

if (Gate::forUser($user)->denies('update-post', $post)) {
    // The user can't update the post...
}
```

`any` 또는 `none` 메서드를 사용하면 한 번에 여러 행동에 대해 인가를 확인할 수 있습니다:

```
if (Gate::any(['update-post', 'delete-post'], $post)) {
    // The user can update or delete the post...
}

if (Gate::none(['update-post', 'delete-post'], $post)) {
    // The user can't update or delete the post...
}
```

<a name="authorizing-or-throwing-exceptions"></a>
#### 인가 실패 시 예외 발생

행동에 대해 인가를 시도하고, 만약 권한이 없을 경우 자동으로 `Illuminate\Auth\Access\AuthorizationException` 예외를 발생시키길 원한다면, `Gate` 파사드의 `authorize` 메서드를 사용할 수 있습니다. 이 예외는 라라벨에 의해 자동으로 403 HTTP 응답으로 변환됩니다.

```
Gate::authorize('update-post', $post);

// The action is authorized...
```

<a name="gates-supplying-additional-context"></a>
#### 추가 컨텍스트 전달하기

인가와 관련된 `allows`, `denies`, `check`, `any`, `none`, `authorize`, `can`, `cannot` 등 다양한 게이트 메서드와, [Blade 인가 디렉티브](#via-blade-templates)(`@can`, `@cannot`, `@canany`)에는 두 번째 인자로 배열을 전달할 수 있습니다. 이 배열 요소들은 게이트 클로저의 매개변수로 전달되어, 인가 결정을 내릴 때 추가적인 컨텍스트로 사용할 수 있습니다:

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
    // The user can create the post...
}
```

<a name="gate-responses"></a>
### 게이트 응답

지금까지는 게이트가 단순히 불리언 값을 반환하는 방식만 살펴보았습니다. 하지만 때로는 더 자세한 응답(에러 메시지 등)이 필요할 때가 있습니다. 이럴 경우, 게이트에서 `Illuminate\Auth\Access\Response`를 반환할 수 있습니다:

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

게이트에서 인가 응답 객체를 반환하더라도, `Gate::allows` 메서드는 단순한 불리언 값을 반환합니다. 하지만, `Gate::inspect` 메서드를 사용하면 게이트가 반환한 전체 인가 응답(Response)을 받아올 수 있습니다:

```
$response = Gate::inspect('edit-settings');

if ($response->allowed()) {
    // The action is authorized...
} else {
    echo $response->message();
}
```

`Gate::authorize` 메서드를 사용할 때, 인가에 실패하면 발생하는 `AuthorizationException`의 에러 메시지는 인가 응답에서 제공한 메시지가 HTTP 응답으로 전달됩니다:

```
Gate::authorize('edit-settings');

// The action is authorized...
```

<a name="customizing-gate-response-status"></a>
#### HTTP 응답 상태 코드 커스터마이즈

게이트에서 행동이 거부될 경우 기본적으로 `403` HTTP 응답이 반환됩니다. 하지만 필요에 따라 다른 HTTP 상태 코드를 반환하고 싶을 때도 있습니다. 이런 경우, `Illuminate\Auth\Access\Response` 클래스의 `denyWithStatus` 정적 생성자를 사용하면 인가 실패 시 반환할 HTTP 상태 코드를 지정할 수 있습니다:

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

웹 애플리케이션에서 자원을 숨기기 위해 `404` 응답을 반환하는 패턴이 매우 흔하므로, 이를 위한 간편한 `denyAsNotFound` 메서드도 제공됩니다:

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

특정 사용자에게 모든 권한을 부여하고 싶은 경우, `before` 메서드를 통해 모든 인가 검사 전에 실행되는 클로저를 정의할 수 있습니다:

```
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::before(function (User $user, string $ability) {
    if ($user->isAdministrator()) {
        return true;
    }
});
```

`before` 클로저에서 null이 아닌 값을 반환하면, 해당 값이 인가 검사 결과로 사용됩니다.

또한, 모든 인가 검사 후에 실행할 수 있는 `after` 메서드도 정의할 수 있습니다:

```
use App\Models\User;

Gate::after(function (User $user, string $ability, bool|null $result, mixed $arguments) {
    if ($user->isAdministrator()) {
        return true;
    }
});
```

`after` 클로저에서 반환된 값은 게이트나 정책에서 `null`이 반환된 경우에만 인가 결과를 덮어씁니다.

<a name="inline-authorization"></a>
### 인라인 인가 처리

가끔은 특정 행동에 대해 전용 게이트를 미리 정의하지 않고, 현재 인증된 사용자가 그 행동을 할 수 있는지만 바로 확인하고 싶을 때가 있습니다. 이런 인라인 인가 처리는 `Gate::allowIf`와 `Gate::denyIf` 메서드를 사용해 간단히 구현할 수 있습니다. 인라인 인가 처리에서는 [before/after 훅](#intercepting-gate-checks)이 실행되지 않습니다.

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::allowIf(fn (User $user) => $user->isAdministrator());

Gate::denyIf(fn (User $user) => $user->banned());
```

만약 해당 행동에 인가되지 않았거나 인증된 사용자가 없는 경우, 라라벨은 자동으로 `Illuminate\Auth\Access\AuthorizationException` 예외를 발생시킵니다. 이 예외 역시 라라벨 예외 처리기에 의해 403 HTTP 응답으로 변환됩니다.

<a name="creating-policies"></a>
## 정책 만들기

<a name="generating-policies"></a>
### 정책 생성

정책(Policy)은 특정 모델이나 리소스를 중심으로 인가 로직을 조직화하는 클래스입니다. 예를 들어 블로그 애플리케이션이 있다면, `App\Models\Post` 모델과 해당 모델의 인가를 담당하는 `App\Policies\PostPolicy`를 만들어, 게시글 생성이나 수정 등의 행동에 대한 인가를 처리할 수 있습니다.

정책 클래스는 `make:policy` 아티즌 명령어로 생성할 수 있습니다. 생성된 정책 클래스는 `app/Policies` 디렉터리에 위치하게 되며, 해당 디렉터리가 없다면 라라벨이 자동으로 생성해 줍니다:

```shell
php artisan make:policy PostPolicy
```

`make:policy` 명령어로 생성된 클래스는 기본적으로 비어 있습니다. 리소스에 대한 보기(view), 생성(create), 수정(update), 삭제(delete) 등의 예시 정책 메서드가 포함된 클래스를 생성하려면, 명령 실행 시 `--model` 옵션을 추가하면 됩니다:

```shell
php artisan make:policy PostPolicy --model=Post
```

<a name="registering-policies"></a>
### 정책 등록

<a name="policy-discovery"></a>
#### 정책 자동 발견

라라벨은 기본적으로 모델과 정책이 표준 네이밍 규칙을 따르고 있으면 정책을 자동으로 발견합니다. 구체적으로 모델과 정책은 같은 계층 구조 안에 있어야 하며(예: models가 `app/Models`에 있고, 정책이 `app/Policies`에 있거나 `app/Models/Policies`에 있는 경우), 정책 이름은 모델 이름 뒤에 `Policy`라는 접미사가 붙어야 합니다. 예를 들어 `User` 모델이라면 관련 정책 클래스는 `UserPolicy`가 됩니다.

정책 자동 발견 로직을 직접 정의하고 싶다면, `Gate::guessPolicyNamesUsing` 메서드를 사용해 커스텀 콜백을 등록할 수 있습니다. 이 메서드는 보통 애플리케이션의 `AppServiceProvider`의 `boot` 메서드 내부에서 호출합니다:

```
use Illuminate\Support\Facades\Gate;

Gate::guessPolicyNamesUsing(function (string $modelClass) {
    // Return the name of the policy class for the given model...
});
```

<a name="manually-registering-policies"></a>
#### 정책 수동 등록

`Gate` 파사드를 사용해 `AppServiceProvider`의 `boot` 메서드에서 정책과 해당 모델을 수동으로 연결할 수도 있습니다:

```
use App\Models\Order;
use App\Policies\OrderPolicy;
use Illuminate\Support\Facades\Gate;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Gate::policy(Order::class, OrderPolicy::class);
}
```

<a name="writing-policies"></a>
## 정책 작성하기

<a name="policy-methods"></a>
### 정책 메서드

정책 클래스가 등록되면, 각 행동 별로 인가를 담당할 메서드를 추가할 수 있습니다. 예시로, `PostPolicy`에 주어진 `App\Models\User` 사용자가 특정 `App\Models\Post` 인스턴스를 수정할 수 있는지 판단하는 `update` 메서드를 정의해 보겠습니다.

`update` 메서드는 `User`와 `Post` 인스턴스를 인자로 받고, 해당 사용자가 게시글을 수정할 권한이 있는지 나타내는 `true` 또는 `false` 값을 반환해야 합니다. 아래 예제에서는 게시글의 `user_id`와 사용자의 `id`가 일치하는지 확인합니다:

```
<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * Determine if the given post can be updated by the user.
     */
    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }
}
```

필요하다면 정책에 추가적인 메서드를 정의해서 다양한 행동(view, delete 등)에 대한 인가를 구현할 수 있습니다. 메서드 이름은 자유롭게 정할 수 있습니다.

아티즌 콘솔에서 정책을 생성할 때 `--model` 옵션을 사용했다면, `viewAny`, `view`, `create`, `update`, `delete`, `restore`, `forceDelete` 행동에 대한 메서드가 이미 포함되어 생성됩니다.

> [!NOTE]  
> 모든 정책은 라라벨 [서비스 컨테이너](/docs/11.x/container)를 통해 resolve되므로, 정책의 생성자에 필요에 따라 의존성을 타입힌트하면 자동으로 주입받아 사용할 수 있습니다.

<a name="policy-responses"></a>
### 정책 응답

지금까지 살펴본 정책 메서드는 불리언을 반환하지만, 때로는 더 자세한 응답(예: 에러 메시지 등)이 필요할 수 있습니다. 이런 경우, 정책 메서드에서 `Illuminate\Auth\Access\Response` 인스턴스를 반환할 수 있습니다:

```
use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Determine if the given post can be updated by the user.
 */
public function update(User $user, Post $post): Response
{
    return $user->id === $post->user_id
        ? Response::allow()
        : Response::deny('You do not own this post.');
}
```

정책에서 인가 응답 객체를 반환하더라도, `Gate::allows`는 항상 단순 불리언 값을 반환합니다. 그러나 `Gate::inspect` 메서드를 사용하면 정책이 반환한 전체 인가 응답(Response)을 받아올 수 있습니다:

```
use Illuminate\Support\Facades\Gate;

$response = Gate::inspect('update', $post);

if ($response->allowed()) {
    // The action is authorized...
} else {
    echo $response->message();
}
```

`Gate::authorize` 메서드를 사용하면, 인가 실패 시 발생하는 `AuthorizationException` 예외에 정책에서 제공한 에러 메시지가 반영되어 HTTP 응답에 포함됩니다:

```
Gate::authorize('update', $post);

// The action is authorized...
```

<a name="customizing-policy-response-status"></a>
#### HTTP 응답 상태 코드 커스터마이즈

정책 메서드를 통해 행동이 거부되면 기본적으로 `403` HTTP 응답이 반환됩니다. 필요하다면, `Illuminate\Auth\Access\Response`의 `denyWithStatus` 정적 생성자를 사용해 인가 실패 시 원하는 HTTP 상태 코드를 반환할 수 있습니다:

```
use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Determine if the given post can be updated by the user.
 */
public function update(User $user, Post $post): Response
{
    return $user->id === $post->user_id
        ? Response::allow()
        : Response::denyWithStatus(404);
}
```

특히, 웹 애플리케이션에서 자원을 숨기기 위해 `404` 응답을 반환하는 경우가 많으므로, 이를 손쉽게 구현할 수 있도록 `denyAsNotFound` 메서드도 제공합니다:

```
use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Determine if the given post can be updated by the user.
 */
public function update(User $user, Post $post): Response
{
    return $user->id === $post->user_id
        ? Response::allow()
        : Response::denyAsNotFound();
}
```

<a name="methods-without-models"></a>
### 모델 없는 메서드

일부 정책 메서드는 현재 인증된 사용자 인스턴스만 받는 경우가 있습니다. 대표적으로 `create` 행동에 대한 인가가 그러합니다. 예를 들어, 블로그에서 사용자가 게시글을 생성할 권한이 있는지 확인하고자 할 때는 정책 메서드에서 사용자 인스턴스만 받게 됩니다:

```
/**
 * Determine if the given user can create posts.
 */
public function create(User $user): bool
{
    return $user->role == 'writer';
}
```

<a name="guest-users"></a>
### 게스트 사용자

기본적으로, 인증되지 않은 사용자가 요청을 보낸 경우 모든 게이트와 정책은 자동으로 `false`를 반환합니다. 하지만, 사용자 인자에 "optional" 타입힌트나 `null` 기본값을 지정하여, 이와 같은 인가 검사가 게이트나 정책까지 통과되도록 할 수 있습니다:

```
<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * Determine if the given post can be updated by the user.
     */
    public function update(?User $user, Post $post): bool
    {
        return $user?->id === $post->user_id;
    }
}
```

<a name="policy-filters"></a>
### 정책 필터

일부 사용자에 대해 해당 정책의 모든 행동을 인가하고 싶을 때가 있습니다. 이럴 땐 정책 클래스에 `before` 메서드를 정의하면 됩니다. `before` 메서드는 정책의 다른 메서드 실행 전에 먼저 호출되므로, 실제 정책 메서드가 실행되기 전 행동을 인가할 기회를 가집니다. 대표적으로, 애플리케이션 관리자에게 모든 행동 권한을 부여할 때 사용합니다:

```
use App\Models\User;

/**
 * Perform pre-authorization checks.
 */
public function before(User $user, string $ability): bool|null
{
    if ($user->isAdministrator()) {
        return true;
    }

    return null;
}
```

특정 유형의 사용자에 대해 모든 인가 검사를 거부하고 싶을 경우 `before` 메서드에서 `false`를 반환하면 됩니다. `null`을 반환하면 이후 실제 정책 메서드에서 인가 검사가 계속 진행됩니다.

> [!WARNING]  
> 정책 클래스의 `before` 메서드는 해당 클래스에 인가하려는 행동 이름에 대응하는 메서드가 실제로 존재해야만 호출됩니다.

<a name="authorizing-actions-using-policies"></a>
## 정책을 사용한 행동 인가

<a name="via-the-user-model"></a>
### 유저 모델을 통한 인가

라라벨 애플리케이션에 기본 포함된 `App\Models\User` 모델에는 행동 인가를 위한 `can` 및 `cannot` 두 가지 주요 메서드가 있습니다. 이 메서드들은 인가하려는 행동의 이름과 관련된 모델을 인수로 받습니다. 예를 들어, 사용자가 주어진 `App\Models\Post` 모델을 수정할 권한이 있는지 확인하려면(주로 컨트롤러 메서드에서 수행):

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
     * Update the given post.
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        if ($request->user()->cannot('update', $post)) {
            abort(403);
        }

        // Update the post...

        return redirect('/posts');
    }
}
```

주어진 모델에 대해 [정책이 등록](#registering-policies)되어 있다면, `can` 메서드는 자동으로 해당 정책을 호출하고, 그 결과에 따라 불리언 값을 반환합니다. 정책이 등록되어 있지 않다면, 해당 행동 이름에 이름이 매칭되는 클로저 기반 게이트가 존재하는지 찾아 호출하려 시도합니다.

<a name="user-model-actions-that-dont-require-models"></a>

#### 모델 인스턴스가 필요 없는 액션

일부 액션은 `create`와 같이 정책(policy) 메서드에 해당하지만, 실제로 모델 인스턴스가 필요하지 않은 경우가 있습니다. 이런 상황에서는 `can` 메서드에 클래스명을 전달할 수 있습니다. 클래스명은 어떤 정책을 사용할지 결정하는 데 활용됩니다.

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

        // 게시글을 생성합니다...

        return redirect('/posts');
    }
}
```

<a name="via-the-gate-facade"></a>
### `Gate` 파사드 사용

`App\Models\User` 모델에서 제공하는 여러 편리한 메서드 외에도, 항상 `Gate` 파사드의 `authorize` 메서드를 사용해 액션을 인가할 수 있습니다.

`can` 메서드와 마찬가지로 이 메서드는 인가하려는 액션의 이름과 관련된 모델을 전달받습니다. 만약 해당 액션이 인가되지 않은 경우, `authorize` 메서드는 `Illuminate\Auth\Access\AuthorizationException` 예외를 던집니다. 라라벨의 예외 핸들러는 이 예외를 자동으로 HTTP 403 상태 코드 응답으로 변환합니다.

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
     * 게시글을 수정합니다.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        Gate::authorize('update', $post);

        // 현재 사용자가 게시글을 수정할 수 있습니다...

        return redirect('/posts');
    }
}
```

<a name="controller-actions-that-dont-require-models"></a>
#### 모델 인스턴스가 필요 없는 컨트롤러 액션

앞서 설명했듯이, `create`와 같은 일부 정책 메서드는 모델 인스턴스를 필요로 하지 않습니다. 이럴 때는 `authorize` 메서드에 클래스명을 전달하면 됩니다. 클래스명은 어떤 정책을 사용할지 결정하는 데 사용됩니다.

```
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * 새 블로그 게시글을 생성합니다.
 *
 * @throws \Illuminate\Auth\Access\AuthorizationException
 */
public function create(Request $request): RedirectResponse
{
    Gate::authorize('create', Post::class);

    // 현재 사용자가 게시글을 생성할 수 있습니다...

    return redirect('/posts');
}
```

<a name="via-middleware"></a>
### 미들웨어를 통한 인가

라라벨은 요청이 라우트나 컨트롤러로 도달하기 전에 액션을 인가할 수 있는 미들웨어를 기본 제공합니다. 기본적으로, `Illuminate\Auth\Middleware\Authorize` 미들웨어는 `can` [미들웨어 별칭](/docs/11.x/middleware#middleware-aliases)을 통해 라우트에 연결할 수 있습니다. 이 별칭은 라라벨에서 자동으로 등록해줍니다. 아래는 사용자가 게시글을 수정할 권한이 있는지를 `can` 미들웨어로 인가하는 예시입니다:

```
use App\Models\Post;

Route::put('/post/{post}', function (Post $post) {
    // 현재 사용자가 해당 게시글을 수정할 수 있습니다...
})->middleware('can:update,post');
```

이 예시에서는 `can` 미들웨어에 두 개의 인수를 전달합니다. 첫 번째는 인가를 원하는 액션의 이름이고, 두 번째는 정책 메서드에 전달할 라우트 파라미터입니다. 여기서는 [암묵적 모델 바인딩](/docs/11.x/routing#implicit-binding)을 사용하므로, `App\Models\Post` 모델이 정책 메서드로 전달됩니다. 만약 사용자가 주어진 액션을 수행할 권한이 없다면, 미들웨어에서 HTTP 403 상태 코드 응답이 반환됩니다.

더욱 편리하게, `can` 미들웨어를 라우트에 붙일 때 `can` 메서드를 사용할 수도 있습니다:

```
use App\Models\Post;

Route::put('/post/{post}', function (Post $post) {
    // 현재 사용자가 해당 게시글을 수정할 수 있습니다...
})->can('update', 'post');
```

<a name="middleware-actions-that-dont-require-models"></a>
#### 모델 인스턴스가 필요 없는 액션

`create`와 같은 일부 정책 메서드는 모델 인스턴스를 요구하지 않습니다. 이런 경우에는 미들웨어에 클래스명을 전달할 수 있습니다. 클래스명은 어떤 정책을 사용할지 결정하는 데 사용됩니다.

```
Route::post('/post', function () {
    // 현재 사용자가 게시글을 생성할 수 있습니다...
})->middleware('can:create,App\Models\Post');
```

문자열로 클래스명을 입력하여 미들웨어를 정의하는 것은 번거로울 수 있습니다. 이런 이유로, 라우트에 `can` 미들웨어를 연결할 때 `can` 메서드를 선택적으로 사용할 수 있습니다:

```
use App\Models\Post;

Route::post('/post', function () {
    // 현재 사용자가 게시글을 생성할 수 있습니다...
})->can('create', Post::class);
```

<a name="via-blade-templates"></a>
### Blade 템플릿을 통한 인가

Blade 템플릿을 작성할 때, 사용자가 특정 액션을 수행할 수 있을 때만 페이지의 일부 내용을 노출하고 싶을 수 있습니다. 예를 들어 사용자가 실제로 게시글을 수정할 수 있을 때만 수정 폼을 보여주고자 한다면, `@can`과 `@cannot` 디렉티브를 사용할 수 있습니다.

```blade
@can('update', $post)
    <!-- 현재 사용자가 게시글을 수정할 수 있습니다... -->
@elsecan('create', App\Models\Post::class)
    <!-- 현재 사용자가 게시글을 새로 생성할 수 있습니다... -->
@else
    <!-- ... -->
@endcan

@cannot('update', $post)
    <!-- 현재 사용자가 게시글을 수정할 수 없습니다... -->
@elsecannot('create', App\Models\Post::class)
    <!-- 현재 사용자가 게시글을 새로 생성할 수 없습니다... -->
@endcannot
```

이러한 디렉티브는 `@if`와 `@unless` 문을 작성하는 것보다 더 간단하게 사용할 수 있는 편리한 단축 문법입니다. 위의 `@can`과 `@cannot` 문은 다음과 같은 문장과 동일합니다.

```blade
@if (Auth::user()->can('update', $post))
    <!-- 현재 사용자가 게시글을 수정할 수 있습니다... -->
@endif

@unless (Auth::user()->can('update', $post))
    <!-- 현재 사용자가 게시글을 수정할 수 없습니다... -->
@endunless
```

또한, 한 사용자에게 여러 액션 중 하나라도 권한이 있는지 확인하려면 `@canany` 디렉티브를 사용할 수 있습니다:

```blade
@canany(['update', 'view', 'delete'], $post)
    <!-- 현재 사용자가 게시글을 수정, 조회, 삭제할 수 있습니다... -->
@elsecanany(['create'], \App\Models\Post::class)
    <!-- 현재 사용자가 게시글을 생성할 수 있습니다... -->
@endcanany
```

<a name="blade-actions-that-dont-require-models"></a>
#### 모델 인스턴스가 필요 없는 액션

다른 인가 방식들과 마찬가지로, 액션이 모델 인스턴스를 필요로 하지 않는 경우, `@can` 및 `@cannot` 디렉티브에 클래스명을 전달할 수 있습니다.

```blade
@can('create', App\Models\Post::class)
    <!-- 현재 사용자가 게시글을 생성할 수 있습니다... -->
@endcan

@cannot('create', App\Models\Post::class)
    <!-- 현재 사용자가 게시글을 생성할 수 없습니다... -->
@endcannot
```

<a name="supplying-additional-context"></a>
### 추가적인 컨텍스트 제공

정책을 통해 액션 인가 시, 다양한 인가 함수와 헬퍼의 두 번째 인수에 배열을 전달할 수 있습니다. 배열의 첫 번째 요소는 어떤 정책을 사용할지 결정하는 데 쓰이고, 나머지는 정책 메서드에 파라미터로 전달되어 인가 판단 시 추가적인 컨텍스트로 활용됩니다. 예를 들어, 다음과 같이 `PostPolicy` 메서드가 `$category`라는 추가 인수를 받을 수 있습니다:

```
/**
 * 해당 게시글을 사용자가 수정할 수 있는지 여부를 결정합니다.
 */
public function update(User $user, Post $post, int $category): bool
{
    return $user->id === $post->user_id &&
           $user->canUpdateCategory($category);
}
```

로그인한 사용자가 특정 게시글을 수정할 수 있는지 판단할 때, 아래와 같이 정책 메서드를 호출할 수 있습니다:

```
/**
 * 주어진 블로그 게시글을 수정합니다.
 *
 * @throws \Illuminate\Auth\Access\AuthorizationException
 */
public function update(Request $request, Post $post): RedirectResponse
{
    Gate::authorize('update', [$post, $request->category]);

    // 현재 사용자가 블로그 게시글을 수정할 수 있습니다...

    return redirect('/posts');
}
```

<a name="authorization-and-inertia"></a>
## 인가와 Inertia

인가(authorization)는 항상 서버에서 처리해야 하지만, 경우에 따라 프론트엔드에서 인가 데이터를 활용해 사용자 인터페이스를 적절하게 렌더링하는 것이 편할 때도 있습니다. 라라벨은 Inertia 기반 프론트엔드에 인가 정보를 노출하는 표준 방식을 따로 정의하지는 않습니다.

하지만, 라라벨의 Inertia 기반 [스타터 키트](/docs/11.x/starter-kits)를 사용한다면 `HandleInertiaRequests` 미들웨어가 이미 내장되어 있습니다. 이 미들웨어의 `share` 메서드에서, 애플리케이션 내 모든 Inertia 페이지에 제공할 공유 데이터를 반환할 수 있습니다. 이 공유 데이터는 사용자에 대한 인가 정보를 정의하는 데 편리하게 활용할 수 있습니다.

```php
<?php

namespace App\Http\Middleware;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    // ...

    /**
     * 기본적으로 공유되는 props를 정의합니다.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request)
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'permissions' => [
                    'post' => [
                        'create' => $request->user()->can('create', Post::class),
                    ],
                ],
            ],
        ];
    }
}
```