# 인가 (Authorization)

- [소개](#introduction)
- [게이트(Gates)](#gates)
    - [게이트 정의하기](#writing-gates)
    - [행위 인가하기](#authorizing-actions-via-gates)
    - [게이트 응답](#gate-responses)
    - [게이트 검사 가로채기](#intercepting-gate-checks)
    - [인라인 인가](#inline-authorization)
- [정책 생성하기](#creating-policies)
    - [정책 생성](#generating-policies)
    - [정책 등록](#registering-policies)
- [정책 작성하기](#writing-policies)
    - [정책 메서드](#policy-methods)
    - [정책 응답](#policy-responses)
    - [모델이 없는 메서드](#methods-without-models)
    - [게스트 사용자](#guest-users)
    - [정책 필터](#policy-filters)
- [정책을 사용한 행위 인가](#authorizing-actions-using-policies)
    - [User 모델을 통한 인가](#via-the-user-model)
    - [Gate 파사드를 통한 인가](#via-the-gate-facade)
    - [미들웨어를 통한 인가](#via-middleware)
    - [Blade 템플릿을 통한 인가](#via-blade-templates)
    - [추가 컨텍스트 전달](#supplying-additional-context)
- [인가와 Inertia](#authorization-and-inertia)

<a name="introduction"></a>
## 소개

라라벨은 내장된 [인증](/docs/authentication) 기능 외에도, 특정 리소스에 대해 사용자의 행위를 인가(authorization)할 수 있는 간단한 방법을 제공합니다. 예를 들어, 사용자가 인증은 되어 있더라도 애플리케이션에서 관리되는 특정 Eloquent 모델이나 데이터베이스 레코드를 수정하거나 삭제할 권한이 없을 수 있습니다. 라라벨의 인가 기능은 이런 종류의 권한 검사를 쉽게, 그리고 체계적으로 관리할 수 있도록 도와줍니다.

라라벨에서는 행위를 인가하는 두 가지 주요 방법을 제공합니다: [게이트(Gate)](#gates)와 [정책(Policy)](#creating-policies)입니다. 게이트와 정책은 각각 라우트(Route)와 컨트롤러(Controller)와 비슷하게 생각하시면 됩니다. 게이트는 클로저(익명 함수) 기반의 간단한 인가 방식을 제공하고, 정책은 컨트롤러처럼 특정 모델이나 리소스와 관련된 인가 로직을 묶어서 관리합니다. 이 문서에서는 먼저 게이트를, 이후에 정책을 살펴보겠습니다.

애플리케이션을 만들 때 반드시 게이트만, 또는 정책만 선택해서 사용할 필요는 없습니다. 대부분의 애플리케이션에서는 게이트와 정책이 혼합되어 사용되는 경우가 더 많으며, 이는 전혀 문제가 되지 않습니다! 게이트는 모델이나 리소스와 직접적으로 연결되지 않은 행위(예: 관리자 대시보드 보기 등)에 적합합니다. 반대로, 특정 모델이나 리소스에 대해서 행위를 인가하고 싶다면 정책을 사용하는 것이 바람직합니다.

<a name="gates"></a>
## 게이트(Gates)

<a name="writing-gates"></a>
### 게이트 정의하기

> [!WARNING]
> 게이트는 라라벨의 인가 기능을 익히기에 좋은 출발점이지만, 실제로 견고한 애플리케이션을 개발할 때에는 인가 규칙을 체계적으로 관리할 수 있도록 [정책(Policy)](#creating-policies) 사용을 적극 권장합니다.

게이트는 사용자가 특정 행위를 할 수 있는지 여부를 판단하는 클로저(익명 함수)입니다. 일반적으로 게이트는 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드 내에서 `Gate` 파사드를 사용해 정의합니다. 게이트는 항상 첫 번째 인수로 사용자 인스턴스를 받고, 그 외에도 필요한 경우 관련 모델 등 추가 인수를 받을 수 있습니다.

예를 들어, 사용자가 특정 `App\Models\Post` 모델을 수정할 수 있는지 판단하는 게이트를 정의해보겠습니다. 이 게이트는 사용자의 `id`와 게시글을 작성한 사용자의 `user_id`를 비교하여 인가 여부를 결정합니다.

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

컨트롤러처럼, 게이트도 클래스 콜백 배열 형식으로 정의할 수도 있습니다.

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
### 행위 인가하기

게이트를 사용해 행위를 인가하려면 `Gate` 파사드의 `allows` 또는 `denies` 메서드를 사용하면 됩니다. 현재 인증된 사용자는 직접 전달하지 않아도 라라벨이 자동으로 게이트 클로저에 넘겨줍니다. 일반적으로 인가가 필요한 액션을 수행하기 전에 컨트롤러에서 게이트 메서드를 호출하는 것이 보통입니다.

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

        // Update the post...

        return redirect('/posts');
    }
}
```

현재 인증된 사용자가 아닌 다른 사용자의 행위에 대한 인가를 체크하고자 할 때는 `Gate` 파사드의 `forUser` 메서드를 사용할 수 있습니다.

```php
if (Gate::forUser($user)->allows('update-post', $post)) {
    // The user can update the post...
}

if (Gate::forUser($user)->denies('update-post', $post)) {
    // The user can't update the post...
}
```

`any`, `none` 메서드를 사용해 한 번에 여러 액션에 대한 권한을 검사할 수도 있습니다.

```php
if (Gate::any(['update-post', 'delete-post'], $post)) {
    // The user can update or delete the post...
}

if (Gate::none(['update-post', 'delete-post'], $post)) {
    // The user can't update or delete the post...
}
```

<a name="authorizing-or-throwing-exceptions"></a>
#### 예외 발생과 함께 인가하기

행위 인가를 시도할 때, 만약 사용자가 허용되지 않은 경우 라라벨이 자동으로 `Illuminate\Auth\Access\AuthorizationException` 예외를 던지도록 하려면 `Gate`의 `authorize` 메서드를 사용할 수 있습니다. 이 예외는 라라벨에서 403 HTTP 응답으로 변환됩니다.

```php
Gate::authorize('update-post', $post);

// The action is authorized...
```

<a name="gates-supplying-additional-context"></a>
#### 추가 컨텍스트 전달

행위 인가를 위한 게이트 메서드(`allows`, `denies`, `check`, `any`, `none`, `authorize`, `can`, `cannot`) 및 인가용 [Blade 지시어](#via-blade-templates)(`@can`, `@cannot`, `@canany`)는 두 번째 인수로 배열을 받을 수 있습니다. 이 배열의 요소들은 게이트 클로저에 인자로 전달되어, 인가를 판단할 때 추가적인 컨텍스트로 활용할 수 있습니다.

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
    // The user can create the post...
}
```

<a name="gate-responses"></a>
### 게이트 응답

지금까지는 단순히 불리언 값을 반환하는 게이트만 살펴보았습니다. 하지만 때로는 좀 더 자세한 응답, 예를 들어 에러 메시지가 필요한 경우도 있습니다. 이럴 때는 게이트에서 `Illuminate\Auth\Access\Response`를 반환할 수 있습니다.

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

이렇게 게이트에서 인가 응답을 반환하더라도 `Gate::allows` 메서드는 여전히 단순한 불리언 값만 반환합니다. 다만, 게이트가 반환한 전체 인가 응답을 확인하고 싶으면 `Gate::inspect` 메서드를 사용하면 됩니다.

```php
$response = Gate::inspect('edit-settings');

if ($response->allowed()) {
    // The action is authorized...
} else {
    echo $response->message();
}
```

`Gate::authorize` 메서드를 사용하면, 인가되지 않은 경우 발생하는 `AuthorizationException`에 담긴 에러 메시지가 HTTP 응답에 그대로 노출됩니다.

```php
Gate::authorize('edit-settings');

// The action is authorized...
```

<a name="customizing-gate-response-status"></a>
#### HTTP 응답 상태 코드 커스터마이즈

게이트에서 행위가 거부되면 기본적으로 `403` HTTP 응답이 반환됩니다. 하지만 상황에 따라 다른 상태 코드를 돌려주고 싶을 수도 있습니다. 이럴 때는 `Illuminate\Auth\Access\Response` 클래스의 `denyWithStatus` 정적 생성자를 사용해 실패한 인가 검사에 대한 응답 상태 코드를 지정할 수 있습니다.

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

웹 애플리케이션에서 자주 리소스를 숨기기 위해 `404`를 되돌려주는 패턴이 많은 점을 감안하여, 라라벨에서 `denyAsNotFound` 메서드도 제공합니다.

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

특정 사용자가 모든 권한을 가질 수 있도록 하고 싶을 때도 있을 것입니다. 이럴 때는 모든 인가 검사 전에 실행할 클로저를 `before` 메서드로 정의하면 됩니다.

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::before(function (User $user, string $ability) {
    if ($user->isAdministrator()) {
        return true;
    }
});
```

`before` 클로저가 null이 아닌 값을 반환하면, 그 결과가 인가 검사 결과로 간주됩니다.

모든 인가 검사 이후에 실행할 클로저는 `after` 메서드로 정의할 수 있습니다.

```php
use App\Models\User;

Gate::after(function (User $user, string $ability, bool|null $result, mixed $arguments) {
    if ($user->isAdministrator()) {
        return true;
    }
});
```

`after` 클로저가 반환한 값은, 게이트 혹은 정책이 `null`을 반환하지 않는 한 인가 결과를 덮어쓰지 않습니다.

<a name="inline-authorization"></a>
### 인라인 인가

가끔은 특정 행위에 대해 전용 게이트를 정의하지 않고도, 현재 인증된 사용자가 바로 그 행위를 할 수 있는지 확인하고 싶은 경우가 있습니다. 라라벨은 `Gate::allowIf`와 `Gate::denyIf` 메서드를 통해 이런 "인라인" 인가 검사를 지원합니다. 인라인 인가 검사는 등록된 ["before", "after" 인가 후크](#intercepting-gate-checks)를 실행하지 않습니다.

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::allowIf(fn (User $user) => $user->isAdministrator());

Gate::denyIf(fn (User $user) => $user->banned());
```

행위가 인가되지 않거나 현재 인증된 사용자가 없을 경우, 라라벨은 자동으로 `Illuminate\Auth\Access\AuthorizationException` 예외를 발생시키고, 이는 403 HTTP 응답으로 변환됩니다.

<a name="creating-policies"></a>
## 정책 생성하기

<a name="generating-policies"></a>
### 정책 생성

정책(Policy)은 특정 모델이나 리소스를 둘러싼 인가 로직을 정리하는 클래스입니다. 예를 들어, 블로그 애플리케이션이라면 `App\Models\Post` 모델에 대한 사용자 행위(글 생성, 수정 등)를 인가하기 위해 `App\Policies\PostPolicy` 정책을 둘 수 있습니다.

정책 클래스는 `make:policy` 아티즌 명령어로 생성할 수 있습니다. 생성된 정책 클래스는 `app/Policies` 디렉터리에 위치하게 됩니다. 만약 해당 디렉터리가 없다면 자동으로 만들어집니다.

```shell
php artisan make:policy PostPolicy
```

이 명령은 빈 정책 클래스를 만듭니다. 만약 리소스의 조회, 생성, 수정, 삭제 기능에 대한 정책 예제가 포함된 클래스를 생성하려면 `--model` 옵션도 사용할 수 있습니다.

```shell
php artisan make:policy PostPolicy --model=Post
```

<a name="registering-policies"></a>
### 정책 등록

<a name="policy-discovery"></a>
#### 정책 자동 발견

라라벨은 기본적으로, 모델 및 정책이 표준 라라벨 네이밍 규칙을 따르기만 하면 정책을 자동으로 찾아줍니다. 구체적으로, 정책 클래스는 모델을 포함하는 디렉터리 또는 그 상위의 `Policies` 디렉터리에 있어야 합니다. 예를 들어, 모델이 `app/Models`에 있고 정책이 `app/Policies`에 있다면, 라라벨은 `app/Models/Policies`와 `app/Policies` 순서로 정책을 탐색합니다. 또한, 정책 클래스명은 모델명과 일치하면서 `Policy` 접미사가 붙어야 합니다. 예를 들어, `User` 모델의 정책은 `UserPolicy`가 되어야 합니다.

정책 발견 로직을 직접 정의하고 싶다면, `Gate::guessPolicyNamesUsing` 메서드로 커스텀 콜백을 등록할 수 있습니다. 보통 이 메서드는 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 호출합니다.

```php
use Illuminate\Support\Facades\Gate;

Gate::guessPolicyNamesUsing(function (string $modelClass) {
    // Return the name of the policy class for the given model...
});
```

<a name="manually-registering-policies"></a>
#### 정책 수동 등록

`Gate` 파사드를 이용하여 앱의 `AppServiceProvider`의 `boot` 메서드에서 모델과 대응되는 정책을 수동으로 등록할 수도 있습니다.

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

정책 클래스가 등록되었다면, 이제 각 행위를 인가하는 메서드를 추가할 수 있습니다. 예를 들어, 주어진 `App\Models\User`가 특정 `App\Models\Post` 인스턴스를 수정할 수 있는지 판단하는 `update` 메서드를 정의해보겠습니다.

`update` 메서드는 `User`, `Post` 인스턴스를 인수로 받고, 해당 사용자가 주어진 글을 수정할 권한이 있는지 불리언 값으로 반환해야 합니다. 즉, 사용자의 `id`와 게시글의 `user_id`가 일치하는지 확인합니다.

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

이처럼, 필요한 여러 행위를 위한 추가 메서드(예: `view`, `delete`)도 계속해서 정의할 수 있습니다. 단, 정책 메서드의 이름은 자유롭게 지정할 수 있습니다.

아티즌 콘솔에서 정책을 생성할 때 `--model` 옵션을 사용했다면, `viewAny`, `view`, `create`, `update`, `delete`, `restore`, `forceDelete` 등 주요 행위에 대한 메서드가 미리 포함됩니다.

> [!NOTE]
> 모든 정책 클래스는 라라벨 [서비스 컨테이너](/docs/container)에 의해 resolve(해결)되므로, 생성자에서 필요한 의존성을 타입힌트로 선언하면 자동으로 주입됩니다.

<a name="policy-responses"></a>
### 정책 응답

지금까지는 단순한 불리언 값을 반환하는 정책 메서드만 살펴보았습니다. 하지만 때로는 더 자세한 에러 메시지가 필요할 수 있습니다. 이럴 땐 정책 메서드에서 `Illuminate\Auth\Access\Response` 인스턴스를 반환할 수 있습니다.

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

이렇게 인가 응답을 반환해도, `Gate::allows` 메서드는 여전히 불리언 값만 반환합니다. 다만, `Gate::inspect` 메서드를 사용하면 전체 인가 응답 객체를 확인할 수 있습니다.

```php
use Illuminate\Support\Facades\Gate;

$response = Gate::inspect('update', $post);

if ($response->allowed()) {
    // The action is authorized...
} else {
    echo $response->message();
}
```

`Gate::authorize` 메서드를 사용할 때, 행위가 인가되지 않았다면 정책에서 반환한 에러 메시지가 HTTP 응답에 함께 전달됩니다.

```php
Gate::authorize('update', $post);

// The action is authorized...
```

<a name="customizing-policy-response-status"></a>
#### HTTP 응답 상태 코드 커스터마이즈

정책 메서드에서 인가가 거부된 경우 기본적으로 `403` 상태 코드가 반환됩니다. 하지만 상황에 따라 다른 상태 코드를 반환하고 싶을 때는, `Illuminate\Auth\Access\Response`의 `denyWithStatus` 정적 생성자를 사용할 수 있습니다.

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

웹 애플리케이션에서는 `404`로 리소스를 숨기는 패턴이 많이 사용되므로, `denyAsNotFound`도 편하게 쓸 수 있습니다.

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
### 모델이 없는 메서드

일부 정책 메서드는 현재 인증된 사용자 인스턴스만 받을 때도 있습니다. 이런 상황은 주로 `create` 같은 행위를 인가할 때 자주 발생합니다. 예를 들어, 블로그에서 사용자가 게시글을 생성할 권한이 있는지 확인하고 싶다면, 정책 메서드는 사용자만 받아서 처리하면 됩니다.

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

기본적으로 인증되지 않은 게스트 사용자가 HTTP 요청을 보낸 경우, 모든 게이트와 정책은 자동으로 `false`를 반환합니다. 하지만 게이트나 정책에서 사용자 인수에 "옵셔널 타입힌트"를 지정하거나, null 기본값을 제공해주면 게스트 사용자를 받아들일 수도 있습니다.

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

특정 사용자에게는 해당 정책의 모든 행위를 인가하고 싶은 경우에는 `before` 메서드를 정의해 모든 정책 메서드 전에 실행하도록 할 수 있습니다. 예를 들어, 애플리케이션 관리자는 모든 행위를 인가받도록 하고 싶을 때 가장 많이 사용됩니다.

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

특정 타입의 사용자에 대해 모든 인가 검사를 거부하고 싶다면, `before` 메서드에서 `false`를 반환하면 됩니다. `null`을 반환하면 인가 검사는 계속해서 해당 정책 메서드로 전달됩니다.

> [!WARNING]
> 정책 클래스의 `before` 메서드는, 현재 검사 중인 행위와 이름이 일치하는 메서드가 정책 클래스 내에 없으면 호출되지 않습니다.

<a name="authorizing-actions-using-policies"></a>
## 정책을 사용한 행위 인가

<a name="via-the-user-model"></a>
### User 모델을 통한 인가

라라벨의 `App\Models\User` 모델에는 인가에 도움을 주는 `can`, `cannot` 두 가지 메서드가 포함되어 있습니다. 이 메서드들은 인가하려는 액션 명, 그리고 해당 모델(인스턴스 또는 클래스)을 인수로 받습니다. 예를 들어, 사용자가 특정 `App\Models\Post` 모델을 수정할 수 있는지 컨트롤러에서 다음과 같이 확인할 수 있습니다.

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

        // Update the post...

        return redirect('/posts');
    }
}
```

주어진 모델에 대해 [정책이 등록되어 있다면](#registering-policies), `can` 메서드는 자동으로 해당 정책의 올바른 메서드를 호출해 불리언 값을 반환합니다. 정책이 없으면, 동명의 게이트 클로저가 호출됩니다.

<a name="user-model-actions-that-dont-require-models"></a>
#### 모델 인스턴스가 필요 없는 액션

`create`처럼 모델 인스턴스가 필요 없는 정책 메서드도 있을 수 있습니다. 이 경우, 클래스명을 `can` 메서드에 전달해주면 라라벨이 어떤 정책을 사용할지 결정합니다.

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
### Gate 파사드를 통한 인가

`App\Models\User` 모델의 편리한 메서드 외에도, 언제든지 `Gate` 파사드의 `authorize` 메서드를 사용해 액션을 인가할 수 있습니다.

이 메서드는 `can`과 마찬가지로, 인가하려는 액션명과 해당 모델을 인수로 받습니다. 만일 행위가 인가되지 않은 경우, `Illuminate\Auth\Access\AuthorizationException` 예외가 발생하며, 이는 403 상태 코드의 HTTP 응답으로 처리됩니다.

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
#### 모델 인스턴스가 필요 없는 액션

이미 앞에서 설명한 것처럼, `create`와 같이 모델 인스턴스가 필요 없는 정책 메서드는 클래스명을 `authorize`에 전달하면 됩니다.

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

라라벨에는 들어오는 HTTP 요청이 라우트나 컨트롤러에 도달하기 전에 인가를 미리 체크해주는 미들웨어가 포함되어 있습니다. 기본적으로 `Illuminate\Auth\Middleware\Authorize`는 `can` [미들웨어 별칭](/docs/middleware#middleware-aliases)으로 등록되어 있어, 바로 사용할 수 있습니다. 사용 예시는 다음과 같습니다.

```php
use App\Models\Post;

Route::put('/post/{post}', function (Post $post) {
    // The current user may update the post...
})->middleware('can:update,post');
```

여기서 `can` 미들웨어에는 두 개의 인수를 전달합니다. 첫 번째는 인가하려는 액션명이고, 두 번째는 정책에 전달할 라우트 파라미터입니다. [암시적 모델 바인딩](/docs/routing#implicit-binding)을 사용하고 있으므로, 정책 메서드에는 `App\Models\Post` 인스턴스가 전달됩니다. 만약 인가되지 않은 경우엔 미들웨어에서 403 응답이 반환됩니다.

더 간편하게, `can` 메서드로 라우트에 직접 미들웨어를 붙일 수도 있습니다.

```php
use App\Models\Post;

Route::put('/post/{post}', function (Post $post) {
    // The current user may update the post...
})->can('update', 'post');
```

<a name="middleware-actions-that-dont-require-models"></a>
#### 모델 인스턴스가 필요 없는 액션

역시, `create`와 같이 모델 인스턴스가 필요 없는 정책 메서드는 클래스명을 미들웨어에 넘기면 됩니다. 문자열로 전체 클래스명을 전달하는 방식이 번거로울 수 있기 때문에, `can` 메서드를 활용하면 더 깔끔하게 처리할 수 있습니다.

```php
Route::post('/post', function () {
    // The current user may create posts...
})->middleware('can:create,App\Models\Post');
```

```php
use App\Models\Post;

Route::post('/post', function () {
    // The current user may create posts...
})->can('create', Post::class);
```

<a name="via-blade-templates"></a>
### Blade 템플릿을 통한 인가

Blade 템플릿 작성 시, 사용자 인가 여부에 따라 특정 부분만 보이게 하고 싶을 수 있습니다. 예를 들어, 사용자가 게시글을 수정할 수 있는 경우에만 수정 폼을 보여주고 싶다면 `@can` 및 `@cannot` 지시어를 사용할 수 있습니다.

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

이 지시어들은 일종의 축약어이며, `@if` 및 `@unless` 문으로 다음과 같이도 사용할 수 있습니다.

```blade
@if (Auth::user()->can('update', $post))
    <!-- The current user can update the post... -->
@endif

@unless (Auth::user()->can('update', $post))
    <!-- The current user cannot update the post... -->
@endunless
```

여러 액션 중 하나라도 인가되어 있으면 특정 내용을 출력하고 싶을 때는 `@canany` 지시어를 사용할 수 있습니다.

```blade
@canany(['update', 'view', 'delete'], $post)
    <!-- The current user can update, view, or delete the post... -->
@elsecanany(['create'], \App\Models\Post::class)
    <!-- The current user can create a post... -->
@endcanany
```

<a name="blade-actions-that-dont-require-models"></a>
#### 모델 인스턴스가 필요 없는 액션

대부분의 인가 메서드와 마찬가지로, 모델 인스턴스가 필요 없는 액션에는 클래스명을 `@can`, `@cannot` 지시어에 바로 넘길 수 있습니다.

```blade
@can('create', App\Models\Post::class)
    <!-- The current user can create posts... -->
@endcan

@cannot('create', App\Models\Post::class)
    <!-- The current user can't create posts... -->
@endcannot
```

<a name="supplying-additional-context"></a>
### 추가 컨텍스트 전달

정책을 활용해 행위를 인가할 때도, 두 번째 인수에 배열을 넣어 추가 파라미터를 전달할 수 있습니다. 배열의 첫 번째 요소로 어떤 정책이 호출될지를 결정하고, 나머지는 해당 정책 메서드의 인수로 활용되어 추가 컨텍스트 정보로 쓸 수 있습니다. 다음은 `$category`라는 추가 인자가 있는 `PostPolicy` 예시입니다.

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

인증된 사용자가 해당 글을 수정할 수 있는지 확인할 때는 아래처럼 정책 메서드를 호출할 수 있습니다.

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

비록 인가 로직은 반드시 서버에서 처리되어야 하지만, 프론트엔드에서도 인가 정보를 받아 UI를 적절히 그릴 수 있다면 편리합니다. 라라벨은 Inertia 기반 프론트엔드로 인가 정보 노출을 위한 특정한 규칙을 강제하지는 않습니다.

하지만, 라라벨의 Inertia 기반 [스타터 키트](/docs/starter-kits)를 사용한다면 `HandleInertiaRequests` 미들웨어가 이미 애플리케이션에 포함되어 있습니다. 해당 미들웨어의 `share` 메서드에서, 모든 Inertia 페이지에 공통으로 전달할 데이터를 반환할 수 있습니다. 이렇게 하면 사용자에 대한 인가 정보를 이곳에서 정의해 프론트엔드로 넘길 수 있습니다.

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