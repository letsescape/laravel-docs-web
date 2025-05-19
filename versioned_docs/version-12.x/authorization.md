# 인가 (Authorization)

- [소개](#introduction)
- [게이트(Gates)](#gates)
    - [게이트 작성하기](#writing-gates)
    - [행동 인가하기](#authorizing-actions-via-gates)
    - [게이트 응답](#gate-responses)
    - [게이트 검사 가로채기](#intercepting-gate-checks)
    - [인라인 인가](#inline-authorization)
- [정책(Policies) 생성하기](#creating-policies)
    - [정책 생성](#generating-policies)
    - [정책 등록하기](#registering-policies)
- [정책 작성하기](#writing-policies)
    - [정책 메서드](#policy-methods)
    - [정책 응답](#policy-responses)
    - [모델 없는 메서드](#methods-without-models)
    - [게스트 사용자](#guest-users)
    - [정책 필터](#policy-filters)
- [정책을 이용한 행동 인가](#authorizing-actions-using-policies)
    - [User 모델을 통한 인가](#via-the-user-model)
    - [Gate 파사드를 통한 인가](#via-the-gate-facade)
    - [미들웨어를 통한 인가](#via-middleware)
    - [Blade 템플릿을 통한 인가](#via-blade-templates)
    - [추가 컨텍스트 전달하기](#supplying-additional-context)
- [Authorization & Inertia](#authorization-and-inertia)

<a name="introduction"></a>
## 소개

라라벨은 기본 제공 [인증](/docs/12.x/authentication) 기능 외에도, 사용자가 특정 리소스에 대해 어떤 행동을 할 수 있는지를 인가(authorization)하는 쉬운 방법을 제공합니다. 예를 들어, 사용자가 인증은 완료했지만, 애플리케이션이 관리하는 특정 Eloquent 모델이나 데이터베이스 레코드를 수정하거나 삭제할 권한이 없을 수도 있습니다. 라라벨의 인가 기능을 활용하면 이러한 권한 확인을 손쉽고 체계적으로 관리할 수 있습니다.

라라벨에서는 행동을 인가하는 두 가지 주요 방식, 즉 [게이트(Gates)](#gates)와 [정책(Policies)](#creating-policies)를 제공합니다. 게이트와 정책은 각각 라우트와 컨트롤러에 비유할 수 있습니다. 게이트는 클로저(익명 함수)를 기반으로 간단하게 인가를 처리하며, 정책은 컨트롤러처럼 특정 모델이나 리소스와 관련된 인가 로직을 묶어서 관리합니다. 이 문서에서는 먼저 게이트를 살펴보고, 이어서 정책에 대해 설명하겠습니다.

애플리케이션을 개발할 때 게이트만 사용하거나, 정책만 사용해야 하는 것은 아닙니다. 대부분의 애플리케이션에서는 게이트와 정책을 적절히 조합해서 사용하게 되며, 이는 전혀 문제되지 않습니다! 게이트는 특정 모델이나 리소스와 직접적으로 관련 없는 행동(예: 관리자 대시보드 보기 등)에 적합하게 사용할 수 있습니다. 반면, 특정 모델이나 리소스와 관련된 행동을 인가하려면 정책을 사용하는 것이 좋습니다.

<a name="gates"></a>
## 게이트(Gates)

<a name="writing-gates"></a>
### 게이트 작성하기

> [!WARNING]
> 게이트는 라라벨의 인가 기능의 기초를 배우기에 좋은 방법이지만, 실제로 탄탄한 라라벨 애플리케이션을 개발하려면 인가 규칙을 [정책(Policies)](#creating-policies)으로 구성하는 것을 권장합니다.

게이트란, 사용자가 특정 행동을 할 수 있는지 여부를 판단하는 클로저(익명 함수)입니다. 일반적으로 게이트는 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드 안에서 `Gate` 파사드를 사용하여 정의합니다. 게이트는 항상 사용자 인스턴스를 첫 번째 인수로 받고, 그 외에 관계 있는 Eloquent 모델 등 추가 인수를 받을 수도 있습니다.

아래는 사용자가 특정 `App\Models\Post` 모델을 수정할 수 있는지 판단하는 게이트의 예시입니다. 이 게이트는 사용자의 `id`와 해당 게시글의 생성자 `user_id`가 같은지 비교하여 인가 여부를 결정합니다.

```php
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

컨트롤러처럼, 게이트도 클래스 콜백 배열 문법을 사용해 정의할 수 있습니다.

```php
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

게이트를 이용해 행동을 인가하려면, `Gate` 파사드에서 제공하는 `allows` 또는 `denies` 메서드를 사용하면 됩니다. 이때, 현재 인증된 사용자를 직접 넘길 필요는 없습니다. 라라벨이 자동으로 게이트 클로저에 인증된 사용자를 전달해줍니다. 일반적으로 인가가 필요한 행동을 수행하기 전에 컨트롤러 내부에서 게이트 인가 메서드를 호출합니다.

```php
<?php

namespace App\Http\Controllers;

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

        // 게시글 업데이트 실행...

        return redirect('/posts');
    }
}
```

현재 인증된 사용자가 아니라 다른 사용자가 특정 행동을 할 수 있는지 확인하고 싶다면, `Gate` 파사드의 `forUser` 메서드를 사용할 수 있습니다.

```php
if (Gate::forUser($user)->allows('update-post', $post)) {
    // 해당 사용자는 게시글을 수정할 수 있습니다...
}

if (Gate::forUser($user)->denies('update-post', $post)) {
    // 해당 사용자는 게시글을 수정할 수 없습니다...
}
```

`any` 또는 `none` 메서드를 사용해 여러 행동에 대한 인가를 한 번에 확인할 수도 있습니다.

```php
if (Gate::any(['update-post', 'delete-post'], $post)) {
    // 사용자가 게시글을 수정하거나 삭제할 수 있습니다...
}

if (Gate::none(['update-post', 'delete-post'], $post)) {
    // 사용자가 게시글을 수정하거나 삭제할 수 없습니다...
}
```

<a name="authorizing-or-throwing-exceptions"></a>
#### 인가 시도 및 예외 발생

행동 인가를 시도한 후, 사용자가 해당 행동을 할 수 없다면 자동으로 `Illuminate\Auth\Access\AuthorizationException` 예외를 발생시키고 싶다면 `Gate` 파사드의 `authorize` 메서드를 사용하면 됩니다. `AuthorizationException`이 발생하면 라라벨이 이를 자동으로 403 HTTP 응답으로 변환합니다.

```php
Gate::authorize('update-post', $post);

// 행동이 인가되었습니다...
```

<a name="gates-supplying-additional-context"></a>
#### 추가 컨텍스트 전달하기

행동 인가용 게이트 메서드들(`allows`, `denies`, `check`, `any`, `none`, `authorize`, `can`, `cannot` 등)과 인가 [Blade 지시문](#via-blade-templates)(`@can`, `@cannot`, `@canany`)에서는 두 번째 인수에 배열을 전달할 수 있습니다. 이 배열의 요소들은 게이트 클로저의 매개변수로 전달되어, 인가 판단 시 추가 컨텍스트로 활용할 수 있습니다.

```php
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

지금까지는 게이트에서 단순히 불리언 값만 반환하는 예시를 살펴봤습니다. 하지만 때로는 좀 더 세부적인 응답(예: 에러 메시지도 함께 전달)을 원할 수도 있습니다. 이럴 때는 게이트에서 `Illuminate\Auth\Access\Response`를 반환할 수 있습니다.

```php
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Gate;

Gate::define('edit-settings', function (User $user) {
    return $user->isAdmin
        ? Response::allow()
        : Response::deny('You must be an administrator.');
});
```

이렇게 게이트에서 인가 응답(Response 객체)을 반환하더라도, `Gate::allows` 메서드는 여전히 단순 불리언값만 반환합니다. 하지만 `Gate::inspect` 메서드를 사용하면, 게이트가 반환한 전체 인가 응답 객체를 받을 수 있습니다.

```php
$response = Gate::inspect('edit-settings');

if ($response->allowed()) {
    // 행동이 인가되었습니다...
} else {
    echo $response->message();
}
```

`Gate::authorize` 메서드를 사용할 때(인가가 거부되면 `AuthorizationException` 예외를 던짐), 인가 응답에 지정한 에러 메시지도 HTTP 응답에 그대로 전파됩니다.

```php
Gate::authorize('edit-settings');

// 행동이 인가되었습니다...
```

<a name="customizing-gate-response-status"></a>
#### HTTP 응답 상태 코드 커스터마이징

게이트에서 인가가 거부된 경우, 기본적으로 `403` HTTP 응답이 반환됩니다. 하지만 상황에 따라 다른 상태 코드를 반환하고 싶을 때는, `Illuminate\Auth\Access\Response` 클래스의 `denyWithStatus` 정적 생성자를 사용하면 됩니다.

```php
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Gate;

Gate::define('edit-settings', function (User $user) {
    return $user->isAdmin
        ? Response::allow()
        : Response::denyWithStatus(404);
});
```

웹 애플리케이션에서 `404` 응답으로 리소스 자체를 숨기는 패턴이 자주 사용되므로, 이를 쉽게 사용할 수 있도록 `denyAsNotFound` 메서드도 제공합니다.

```php
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

특정 사용자에게 모든 인가를 부여하고 싶은 경우가 있다면, 모든 게이트 인가 검사 전에 실행되는 클로저를 `before` 메서드로 정의할 수 있습니다.

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::before(function (User $user, string $ability) {
    if ($user->isAdministrator()) {
        return true;
    }
});
```

`before` 클로저에서 `null`이 아닌 값을 반환하면, 해당 값이 인가 체크의 최종 결과로 간주됩니다.

모든 인가 검사 이후에 실행할 클로저는 `after` 메서드로 정의할 수 있습니다.

```php
use App\Models\User;

Gate::after(function (User $user, string $ability, bool|null $result, mixed $arguments) {
    if ($user->isAdministrator()) {
        return true;
    }
});
```

`after` 클로저가 반환하는 값은 게이트나 정책이 `null`을 반환한 경우가 아니라면, 인가 결과를 덮어쓰지 않습니다.

<a name="inline-authorization"></a>
### 인라인 인가

때로는 어떤 행동에 대해 별도의 게이트를 정의하지 않고, 현재 인증된 사용자가 그 행동을 할 수 있는지 즉석에서 판단하고 싶을 때가 있습니다. 이런 경우 `Gate::allowIf`, `Gate::denyIf` 메서드를 통해 "인라인 인가(authorization)"를 할 수 있습니다. 인라인 인가는 정의된 ["before", "after" 인가 훅](#intercepting-gate-checks)은 실행하지 않습니다.

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::allowIf(fn (User $user) => $user->isAdministrator());

Gate::denyIf(fn (User $user) => $user->banned());
```

해당 행동이 인가되지 않거나 현재 인증된 사용자가 없는 경우, 라라벨은 자동으로 `Illuminate\Auth\Access\AuthorizationException` 예외를 던집니다. 이 예외 역시 라라벨의 예외 핸들러에서 자동으로 403 HTTP 응답으로 변환됩니다.

<a name="creating-policies"></a>
## 정책(Policies) 생성하기

<a name="generating-policies"></a>
### 정책 생성

정책(Policy)은 특정 모델이나 리소스에 대한 인가 로직을 한 클래스에 체계적으로 구성하는 용도입니다. 예를 들어, 애플리케이션이 블로그라면, `App\Models\Post` 모델을 위한 인가 정책으로 `App\Policies\PostPolicy`를 만들고, 게시글 생성, 수정 등 행동을 사용자에게 인가할 수 있도록 관리할 수 있습니다.

정책은 `make:policy` 아티즌 명령어로 생성할 수 있습니다. 생성된 정책 클래스는 `app/Policies` 디렉터리에 생성됩니다. 해당 디렉터리가 현재 존재하지 않으면, 라라벨이 자동으로 생성해줍니다.

```shell
php artisan make:policy PostPolicy
```

`make:policy` 명령어로 생성하면 기본적으로 비어있는 정책 클래스가 만들어집니다. 만약 리소스의 읽기, 생성, 수정, 삭제 등과 관련된 정책 메서드 예시가 포함된 클래스를 만들고 싶다면, 명령 실행 시 `--model` 옵션을 추가하면 됩니다.

```shell
php artisan make:policy PostPolicy --model=Post
```

<a name="registering-policies"></a>
### 정책 등록하기

<a name="policy-discovery"></a>
#### 정책 자동 매칭

기본적으로, 라라벨은 모델과 정책이 라라벨의 표준 네이밍 규칙을 따르면, 정책을 자동으로 찾아서 적용합니다. 구체적으로, 정책 클래스는 모델을 포함하는 디렉터리와 동일하거나, 그보다 상위 디렉터리에 반드시 `Policies` 디렉터리로 존재해야 합니다. 예를 들어, 모델이 `app/Models`에 있고, 정책이 `app/Policies` 디렉터리에 있다면 라라벨은 우선 `app/Models/Policies`, 다음으로 `app/Policies` 디렉터리에서 정책을 찾습니다. 그리고 정책 클래스 이름은 반드시 모델 이름과 같고, 뒤에 `Policy`가 붙어야 합니다. 예를 들어, `User` 모델이라면 `UserPolicy` 클래스가 대응됩니다.

직접 정책 매칭(디스커버리) 로직을 정의하고 싶다면, `Gate::guessPolicyNamesUsing` 메서드를 활용해 콜백을 등록할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 호출합니다.

```php
use Illuminate\Support\Facades\Gate;

Gate::guessPolicyNamesUsing(function (string $modelClass) {
    // 해당 모델에 대한 정책 클래스를 반환합니다...
});
```

<a name="manually-registering-policies"></a>
#### 정책 수동 등록

`Gate` 파사드를 사용해, 애플리케이션의 `AppServiceProvider`의 `boot` 메서드 안에서 직접 정책과 모델을 수동으로 등록할 수도 있습니다.

```php
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

정책 클래스가 등록되면, 인가하려는 각각의 행동에 대해 대응하는 메서드를 추가할 수 있습니다. 예를 들어, 사용자가 주어진 `App\Models\Post` 인스턴스를 수정할 수 있을지 결정하는 `update` 메서드를 `PostPolicy`에 정의해 보겠습니다.

`update` 메서드는 `User`와 `Post` 인스턴스를 인수로 받아, 사용자가 지정된 게시글을 수정할 권한이 있는지 불리언 값을 반환해야 합니다. 아래 예시는 사용자의 `id`와 게시글의 `user_id`가 일치하는지 검사합니다.

```php
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

정책이 인가하는 여러 행동별로 필요한 만큼 메서드를 계속 추가할 수 있습니다. 예를 들어, `view`나 `delete`와 같이 게시글 관련 다양한 행동에 대응하는 메서드를 추가해도 되고, 반드시 메서드 명칭이 특정 방식이어야 하는 것은 아닙니다. 정책 메서드의 이름은 자유롭게 지정할 수 있습니다.

콘솔에서 정책을 생성할 때 `--model` 옵션을 사용했다면, 생성된 클래스에 이미 `viewAny`, `view`, `create`, `update`, `delete`, `restore`, `forceDelete` 등의 메서드가 포함되어 있을 것입니다.

> [!NOTE]
> 모든 정책 클래스는 라라벨 [서비스 컨테이너](/docs/12.x/container)를 통해 해석(resolved)되기 때문에, 필요한 의존성을 생성자에 타입힌트하면 자동 주입을 받을 수 있습니다.

<a name="policy-responses"></a>
### 정책 응답

지금까지는 정책 메서드에서 불리언 값을 반환하는 경우만 살펴봤습니다. 하지만 보다 자세한 응답(예: 에러 메시지 포함)이 필요하다면, 정책 메서드에서 `Illuminate\Auth\Access\Response` 인스턴스를 반환할 수 있습니다.

```php
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

정책에서 인가 응답(Response 객체)을 반환할 경우에도, `Gate::allows` 메서드는 단순 불리언 값만 반환합니다. 전체 인가 응답 객체를 사용하려면 `Gate::inspect` 메서드를 활용합니다.

```php
use Illuminate\Support\Facades\Gate;

$response = Gate::inspect('update', $post);

if ($response->allowed()) {
    // 행동이 인가되었습니다...
} else {
    echo $response->message();
}
```

`Gate::authorize` 메서드를 사용하는 경우(인가가 거부되면 `AuthorizationException` 발생), 정책 응답에서 지정한 에러 메시지도 HTTP 응답에 그대로 반영됩니다.

```php
Gate::authorize('update', $post);

// 행동이 인가되었습니다...
```

<a name="customizing-policy-response-status"></a>
#### HTTP 응답 상태 코드 커스터마이징

정책 메서드에서 인가가 거부되면 기본적으로 `403` HTTP 응답이 반환되지만, 다른 상태 코드로 반환하고 싶다면, `Illuminate\Auth\Access\Response` 클래스의 `denyWithStatus` 정적 생성자를 사용할 수 있습니다.

```php
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

`404` 응답으로 리소스를 감추는 패턴도 흔히 사용되므로, 이를 쉽게 적용할 수 있도록 `denyAsNotFound` 메서드도 제공합니다.

```php
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

정책 메서드 중에는 현재 인증된 사용자 인스턴스만 인수로 받고, 모델 인스턴스는 받지 않는 경우도 있습니다. 이런 케이스는 주로 `create`와 같은 '생성' 행동을 인가할 때 많이 발생합니다. 예를 들어, 블로그에서 사용자가 게시글을 생성할 수 있는 권한이 있는지 확인하고 싶으면 모델 인스턴스 없이 사용자만 인수로 받으면 됩니다.

```php
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

기본적으로, 요청한 사용자가 인증되지 않은 경우 라라벨의 모든 게이트와 정책은 자동으로 `false`를 반환합니다. 하지만, 원하는 경우 인가 검사 시 게이트나 정책까지 실제로 로직을 전달(통과)하도록, 사용자 인수에 "옵셔널" 타입힌트 또는 `null` 기본값을 설정할 수 있습니다.

```php
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

특정 사용자에게는 해당 정책 내의 모든 행동을 인가하고 싶을 수도 있습니다. 이럴 때는 정책 클래스에 `before` 메서드를 정의하면 됩니다. `before` 메서드는 정책의 다른 어떤 메서드보다 먼저 실행되어, 인가 로직에 앞서 인가 여부를 사전에 결정할 수 있습니다. 이 기능은 주로 애플리케이션 관리자가 모든 행동을 할 수 있도록 허용하는 데 사용됩니다.

```php
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

특정 사용자 유형에 대해 모든 인가를 거부하려면, `before` 메서드에서 `false`를 반환하면 됩니다. `null`을 반환하면 인가 검사는 일반 정책 메서드로 이어집니다.

> [!WARNING]
> 정책 클래스의 `before` 메서드는, 해당 클래스에 인가하려는 행동 이름과 동일한 이름의 메서드가 있어야만 호출됩니다.

<a name="authorizing-actions-using-policies"></a>
## 정책을 이용한 행동 인가

<a name="via-the-user-model"></a>
### User 모델을 통한 인가

라라벨의 기본 `App\Models\User` 모델에는 행동 인가에 유용한 두 가지 메서드, `can`과 `cannot`이 포함되어 있습니다. 이 두 메서드는 인가하려는 행동 이름과 해당 모델을 인수로 받습니다. 예를 들어, 사용자가 특정 `App\Models\Post` 모델을 수정할 수 있는지 확인하는 방법을 컨트롤러 내부 코드로 살펴봅니다.

```php
<?php

namespace App\Http\Controllers;

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

        // 게시글 업데이트...

        return redirect('/posts');
    }
}
```

해당 모델에 대해 [정책이 등록](#registering-policies)되어 있다면, `can` 메서드는 자동으로 정책을 호출해서 불리언 결과를 반환합니다. 만약 모델에 정책이 등록되어 있지 않은 경우, 해당 행동 이름과 일치하는 클로저 기반의 게이트를 호출하려 시도합니다.

<a name="user-model-actions-that-dont-require-models"></a>

#### 모델 인스턴스가 필요 없는 액션

정책 메서드 중에는 `create`처럼 모델 인스턴스가 필요 없는 경우도 있습니다. 이런 상황에서는 클래스명을 `can` 메서드에 전달하면 됩니다. 클래스명을 전달하면 해당 액션을 인가할 때 어떤 정책을 사용할지 결정하는 데 사용됩니다.

```php
<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Create a post.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->cannot('create', Post::class)) {
            abort(403);
        }

        // Create the post...

        return redirect('/posts');
    }
}
```

<a name="via-the-gate-facade"></a>
### Gate 파사드를 이용한 인가

`App\Models\User` 모델에 제공되는 다양한 편의 메서드 외에도, 항상 `Gate` 파사드의 `authorize` 메서드를 사용해 액션을 인가할 수 있습니다.

`can` 메서드처럼, 이 메서드는 인가하려는 액션의 이름과 관련 모델을 인자로 받습니다. 만약 해당 액션에 대한 인가가 이루어지지 않을 경우, `authorize` 메서드는 `Illuminate\Auth\Access\AuthorizationException` 예외를 던지며, 라라벨의 예외 핸들러가 자동으로 이 예외를 HTTP 403 상태 코드 응답으로 변환합니다.

```php
<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    /**
     * Update the given blog post.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        Gate::authorize('update', $post);

        // The current user can update the blog post...

        return redirect('/posts');
    }
}
```

<a name="controller-actions-that-dont-require-models"></a>
#### 모델 인스턴스가 필요 없는 컨트롤러 액션

앞에서 설명했듯이, `create`와 같이 모델 인스턴스를 필요로 하지 않는 정책 메서드도 있습니다. 이 경우, `authorize` 메서드에 클래스명을 전달하면 됩니다. 클래스명은 해당 액션을 인가할 때 사용할 정책을 결정하는 데 사용됩니다.

```php
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * Create a new blog post.
 *
 * @throws \Illuminate\Auth\Access\AuthorizationException
 */
public function create(Request $request): RedirectResponse
{
    Gate::authorize('create', Post::class);

    // The current user can create blog posts...

    return redirect('/posts');
}
```

<a name="via-middleware"></a>
### 미들웨어를 통한 인가

라라벨에는 요청이 라우트나 컨트롤러에 도달하기 전에 액션을 미리 인가할 수 있는 미들웨어가 내장되어 있습니다. 기본적으로, `Illuminate\Auth\Middleware\Authorize` 미들웨어는 라라벨에서 자동으로 등록되는 `can` [미들웨어 별칭](/docs/12.x/middleware#middleware-aliases)을 사용하여 라우트에 연결할 수 있습니다. 예를 들어, 사용자가 게시글을 수정할 수 있는지 확인하도록 `can` 미들웨어를 사용하는 방법은 다음과 같습니다.

```php
use App\Models\Post;

Route::put('/post/{post}', function (Post $post) {
    // The current user may update the post...
})->middleware('can:update,post');
```

이 예시에서는 `can` 미들웨어에 두 가지 인자를 전달합니다. 첫 번째는 인가하고자 하는 액션의 이름이고, 두 번째는 정책 메서드에 전달할 라우트 파라미터입니다. 여기서 [암묵적 모델 바인딩](/docs/12.x/routing#implicit-binding)을 사용하고 있으므로, `App\Models\Post` 모델 인스턴스가 정책 메서드에 전달됩니다. 만약 사용자가 해당 액션을 수행할 권한이 없다면, 미들웨어가 HTTP 403 상태 코드로 응답을 반환합니다.

더 편리하게는, `can` 미들웨어를 라우트에 직접 연결하는 `can` 메서드를 사용할 수도 있습니다.

```php
use App\Models\Post;

Route::put('/post/{post}', function (Post $post) {
    // The current user may update the post...
})->can('update', 'post');
```

<a name="middleware-actions-that-dont-require-models"></a>
#### 모델 인스턴스가 필요 없는 미들웨어 액션

다시 한 번, `create`와 같이 모델 인스턴스가 필요 없는 정책 메서드도 있습니다. 이런 경우에는 클래스명을 미들웨어에 전달할 수 있습니다. 클래스명은 인가할 정책을 결정하는 데 사용됩니다.

```php
Route::post('/post', function () {
    // The current user may create posts...
})->middleware('can:create,App\Models\Post');
```

문자열 형태의 미들웨어 정의에 전체 클래스명을 직접 지정하는 것은 번거로울 수도 있습니다. 이런 상황에서는 `can` 미들웨어를 라우트에 직접 연결하는 `can` 메서드를 사용할 수 있습니다.

```php
use App\Models\Post;

Route::post('/post', function () {
    // The current user may create posts...
})->can('create', Post::class);
```

<a name="via-blade-templates"></a>
### Blade 템플릿에서의 인가

Blade 템플릿을 작성할 때, 사용자가 특정 액션을 수행할 수 있는 경우에만 페이지의 일부만을 표시하고 싶을 수 있습니다. 예를 들어, 사용자가 실제로 게시글을 수정할 수 있을 때에만 블로그 게시글 수정 폼을 보여주고자 할 수 있습니다. 이런 경우 `@can` 및 `@cannot` 지시문을 사용할 수 있습니다.

```blade
@can('update', $post)
    <!-- The current user can update the post... -->
@elsecan('create', App\Models\Post::class)
    <!-- The current user can create new posts... -->
@else
    <!-- ... -->
@endcan

@cannot('update', $post)
    <!-- The current user cannot update the post... -->
@elsecannot('create', App\Models\Post::class)
    <!-- The current user cannot create new posts... -->
@endcannot
```

이 지시문들은 `@if` 및 `@unless` 문을 작성하는 것을 더 간단하게 해주는 편리한 방법입니다. 위의 `@can` 및 `@cannot` 문은 아래와 같은 코드와 동등합니다.

```blade
@if (Auth::user()->can('update', $post))
    <!-- The current user can update the post... -->
@endif

@unless (Auth::user()->can('update', $post))
    <!-- The current user cannot update the post... -->
@endunless
```

사용자가 주어진 여러 액션 중 하나라도 인가되었는지 확인하고 싶다면, `@canany` 지시문을 사용할 수 있습니다.

```blade
@canany(['update', 'view', 'delete'], $post)
    <!-- The current user can update, view, or delete the post... -->
@elsecanany(['create'], \App\Models\Post::class)
    <!-- The current user can create a post... -->
@endcanany
```

<a name="blade-actions-that-dont-require-models"></a>
#### 모델 인스턴스가 필요 없는 경우

다른 인가 방식들처럼, 액션이 모델 인스턴스를 필요로 하지 않을 때에는 `@can` 및 `@cannot` 지시문에 클래스명을 전달하면 됩니다.

```blade
@can('create', App\Models\Post::class)
    <!-- The current user can create posts... -->
@endcan

@cannot('create', App\Models\Post::class)
    <!-- The current user can't create posts... -->
@endcannot
```

<a name="supplying-additional-context"></a>
### 추가적인 컨텍스트 제공

정책을 사용해 액션을 인가할 때, 두 번째 인자로 배열을 전달하면 각종 인가 함수 및 헬퍼에서 추가 정보를 사용할 수 있습니다. 이 배열의 첫 번째 요소는 어떤 정책이 실행될지를 결정하는 데 사용되고, 나머지 요소들은 정책 메서드의 인자로 전달되어 인가 시 추가적인 컨텍스트로 활용할 수 있습니다. 예를 들어, 아래와 같이 `$category`라는 추가 파라미터를 가진 `PostPolicy` 메서드를 생각해 볼 수 있습니다.

```php
/**
 * Determine if the given post can be updated by the user.
 */
public function update(User $user, Post $post, int $category): bool
{
    return $user->id === $post->user_id &&
           $user->canUpdateCategory($category);
}
```

인증된 사용자가 주어진 게시글을 수정할 수 있는지를 확인하려면, 다음과 같이 정책 메서드를 호출할 수 있습니다.

```php
/**
 * Update the given blog post.
 *
 * @throws \Illuminate\Auth\Access\AuthorizationException
 */
public function update(Request $request, Post $post): RedirectResponse
{
    Gate::authorize('update', [$post, $request->category]);

    // The current user can update the blog post...

    return redirect('/posts');
}
```

<a name="authorization-and-inertia"></a>
## 인가와 Inertia

인가(Authorization)는 항상 서버에서 처리해야 하지만, 종종 프런트엔드 애플리케이션에서 인가 관련 데이터를 받아와 애플리케이션 UI를 제대로 렌더링하는 것이 편리할 때가 있습니다. 라라벨에서는 Inertia를 사용하는 프런트엔드로 인가 정보를 노출하는 데 반드시 따라야 할 컨벤션을 정의하지는 않습니다.

하지만, 라라벨의 Inertia 기반 [스타터 킷](/docs/12.x/starter-kits) 중 하나를 사용한다면 애플리케이션에 이미 `HandleInertiaRequests` 미들웨어가 포함되어 있을 것입니다. 이 미들웨어의 `share` 메서드에서 원하는 데이터를 정의하여 모든 Inertia 페이지에 전달할 수 있습니다. 이 공유 데이터에 인가 정보를 정의하면 사용자를 위한 편리한 위치가 될 수 있습니다.

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
     * Define the props that are shared by default.
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