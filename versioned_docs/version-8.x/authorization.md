# 인가 (Authorization)

- [소개](#introduction)
- [게이트](#gates)
    - [게이트 작성하기](#writing-gates)
    - [행위 인가](#authorizing-actions-via-gates)
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
    - [User 모델에서](#via-the-user-model)
    - [컨트롤러 헬퍼에서](#via-controller-helpers)
    - [미들웨어에서](#via-middleware)
    - [Blade 템플릿에서](#via-blade-templates)
    - [추가 컨텍스트 전달](#supplying-additional-context)

<a name="introduction"></a>
## 소개

라라벨은 내장 [인증](/docs/8.x/authentication) 서비스 외에도, 특정 리소스에 대해 사용자의 행위를 인가(authorization)할 수 있는 간단한 방법을 제공합니다. 예를 들어, 사용자가 인증되었더라도 애플리케이션이 관리하는 특정 Eloquent 모델이나 데이터베이스 레코드를 수정 또는 삭제할 권한이 없을 수 있습니다. 라라벨의 인가 기능은 이러한 인가 검사를 쉽고 체계적으로 관리할 수 있도록 도와줍니다.

라라벨은 주로 두 가지 주요 방식으로 행위 인가를 제공합니다: [게이트](#gates)와 [정책](#creating-policies)입니다. 게이트와 정책은 각각 라우트와 컨트롤러와 비슷하다고 생각하시면 이해가 쉽습니다. 게이트는 클로저 기반의 간단한 인가 방법을 제공하며, 정책은 컨트롤러처럼 특정 모델이나 리소스에 인가 로직을 집중시킬 수 있습니다. 이 문서에서는 먼저 게이트를 살펴보고, 이후에 정책을 다루겠습니다.

애플리케이션을 개발할 때 반드시 게이트만 사용하거나, 정책만 사용해야 하는 것은 아닙니다. 대부분의 애플리케이션은 두 방식을 혼합해서 사용하게 되며, 전혀 문제되지 않습니다! 게이트는 모델이나 리소스와는 직접적으로 관련 없는 행위(예: 관리자 대시보드 보기 등)에 적합합니다. 반면, 정책은 특정 모델이나 리소스에 대해 인가를 해야 할 때 사용하는 것이 일반적입니다.

<a name="gates"></a>
## 게이트

<a name="writing-gates"></a>
### 게이트 작성하기

> [!NOTE]
> 게이트는 라라벨 인가 기능의 기본을 익히기에 좋은 방법입니다. 하지만 대규모의 견고한 라라벨 애플리케이션을 개발할 때에는 인가 규칙을 더 잘 정리할 수 있도록 [정책](#creating-policies) 사용을 고려하시기 바랍니다.

게이트는 사용자가 특정 행위를 수행할 수 있는지 판별하는 단순한 클로저입니다. 일반적으로 게이트는 `App\Providers\AuthServiceProvider` 클래스의 `boot` 메서드에서 `Gate` 파사드를 통해 정의합니다. 게이트는 항상 첫 번째 인수로 사용자 인스턴스를 받고, 두 번째 또는 추가 인수로는 관련된 Eloquent 모델 등 다른 인자를 받을 수도 있습니다.

아래 예시에서는 사용자가 주어진 `App\Models\Post` 모델을 수정할 수 있는지 판별하는 게이트를 정의해 보겠습니다. 이 게이트는 사용자의 `id`와 게시글을 생성한 사용자의 `user_id`를 비교해서 판별합니다:

```
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

/**
 * Register any authentication / authorization services.
 *
 * @return void
 */
public function boot()
{
    $this->registerPolicies();

    Gate::define('update-post', function (User $user, Post $post) {
        return $user->id === $post->user_id;
    });
}
```

컨트롤러와 마찬가지로, 게이트도 클래스 콜백 배열을 이용해 정의할 수 있습니다:

```
use App\Policies\PostPolicy;
use Illuminate\Support\Facades\Gate;

/**
 * Register any authentication / authorization services.
 *
 * @return void
 */
public function boot()
{
    $this->registerPolicies();

    Gate::define('update-post', [PostPolicy::class, 'update']);
}
```

<a name="authorizing-actions-via-gates"></a>
### 행위 인가

게이트를 통해 행위를 인가하려면 `Gate` 파사드에서 제공하는 `allows` 또는 `denies` 메서드를 사용하면 됩니다. 현재 인증된 사용자를 명시적으로 넘길 필요는 없습니다. 라라벨이 자동으로 게이트 클로저에 사용자를 전달해줍니다. 일반적으로 이 인가 메서드는 컨트롤러에서, 인가가 필요한 로직 전에 호출합니다:

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    /**
     * Update the given post.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Post $post)
    {
        if (! Gate::allows('update-post', $post)) {
            abort(403);
        }

        // Update the post...
    }
}
```

현재 인증된 사용자가 아닌 다른 사용자가 특정 행위를 할 수 있는지 확인하려면, `Gate` 파사드의 `forUser` 메서드를 사용할 수 있습니다:

```
if (Gate::forUser($user)->allows('update-post', $post)) {
    // The user can update the post...
}

if (Gate::forUser($user)->denies('update-post', $post)) {
    // The user can't update the post...
}
```

여러 행위에 대해 한 번에 인가를 검사하고 싶다면, `any` 또는 `none` 메서드를 사용할 수 있습니다:

```
if (Gate::any(['update-post', 'delete-post'], $post)) {
    // The user can update or delete the post...
}

if (Gate::none(['update-post', 'delete-post'], $post)) {
    // The user can't update or delete the post...
}
```

<a name="authorizing-or-throwing-exceptions"></a>
#### 예외를 던지는 인가

행위를 인가할 때 사용자가 허용되지 않은 경우 자동으로 `Illuminate\Auth\Access\AuthorizationException` 예외를 던지도록 하려면, `Gate` 파사드의 `authorize` 메서드를 사용할 수 있습니다. 이 예외는 라라벨의 예외 핸들러에 의해 자동으로 403 HTTP 응답으로 변환됩니다:

```
Gate::authorize('update-post', $post);

// The action is authorized...
```

<a name="gates-supplying-additional-context"></a>
#### 추가 컨텍스트 전달하기

인가 능력을 판별하는 게이트 메서드(`allows`, `denies`, `check`, `any`, `none`, `authorize`, `can`, `cannot`)와 [Blade 인가 지시문](#via-blade-templates)(`@can`, `@cannot`, `@canany`)에는 두 번째 인자로 배열을 전달할 수 있습니다. 이 배열의 요소들은 게이트 클로저의 파라미터로 전달되어, 인가 로직에서 추가 컨텍스트를 활용할 수 있습니다:

```
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::define('create-post', function (User $user, Category $category, $pinned) {
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

지금까지는 단순히 불리언 값을 반환하는 게이트만 살펴보았습니다. 하지만 때로는 보다 자세한 응답, 예를 들어 에러 메시지도 함께 반환하고 싶을 수 있습니다. 이럴 때는 게이트에서 `Illuminate\Auth\Access\Response`를 반환하면 됩니다:

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

이렇게 게이트에서 인가 응답을 반환하더라도, `Gate::allows` 메서드는 여전히 단순한 불리언 값을 반환합니다. 하지만 `Gate::inspect` 메서드를 사용하면 게이트에서 반환된 전체 인가 응답 값을 확인할 수 있습니다:

```
$response = Gate::inspect('edit-settings');

if ($response->allowed()) {
    // The action is authorized...
} else {
    echo $response->message();
}
```

`Gate::authorize` 메서드를 사용해 인가되지 않은 경우 예외를 발생시키면, 게이트 응답에서 지정한 에러 메시지가 HTTP 응답으로 전달됩니다:

```
Gate::authorize('edit-settings');

// The action is authorized...
```

<a name="intercepting-gate-checks"></a>
### 게이트 검사 가로채기

특정 사용자에게 모든 권한을 부여하고 싶을 때가 있습니다. 이럴 때는 모든 인가 검사 전에 실행되는 클로저를 `before` 메서드로 정의할 수 있습니다:

```
use Illuminate\Support\Facades\Gate;

Gate::before(function ($user, $ability) {
    if ($user->isAdministrator()) {
        return true;
    }
});
```

`before` 클로저가 `null`이 아닌 값을 반환하면, 해당 값이 인가 검사 결과로 사용됩니다.

모든 인가 검사 이후에 클로저를 실행하고 싶다면 `after` 메서드를 사용할 수 있습니다:

```
Gate::after(function ($user, $ability, $result, $arguments) {
    if ($user->isAdministrator()) {
        return true;
    }
});
```

`after` 메서드 또한 `null`이 아닌 값을 반환하면, 그 값이 인가 검사 결과로 사용됩니다.

<a name="inline-authorization"></a>
### 인라인 인가

간혹 별도의 게이트를 작성하지 않고, 현재 인증된 사용자가 특정 행위를 할 수 있는지 간단하게 판단하고 싶을 때가 있습니다. 이럴 때 라라벨은 `Gate::allowIf`와 `Gate::denyIf` 메서드를 통한 "인라인" 인가 체크를 지원합니다:

```php
use Illuminate\Support\Facades\Auth;

Gate::allowIf(fn ($user) => $user->isAdministrator());

Gate::denyIf(fn ($user) => $user->banned());
```

인가되지 않았거나 인증된 사용자가 없는 경우, 라라벨은 자동으로 `Illuminate\Auth\Access\AuthorizationException` 예외를 발생시킵니다. 이 예외 또한 라라벨의 예외 핸들러에 의해 403 HTTP 응답으로 변환됩니다.

<a name="creating-policies"></a>
## 정책 생성하기

<a name="generating-policies"></a>
### 정책 생성

정책(Policy)은 특정 모델이나 리소스에 대한 인가 로직을 정리하는 클래스입니다. 예를 들어, 애플리케이션이 블로그라면, `App\Models\Post` 모델과, 해당 모델의 글 생성, 수정 등을 인가하기 위한 `App\Policies\PostPolicy` 정책을 가질 수 있습니다.

정책 클래스는 `make:policy` 아티즌 명령어로 생성할 수 있습니다. 생성된 정책 클래스는 `app/Policies` 디렉터리에 저장됩니다. 해당 디렉터리가 없다면 라라벨이 자동으로 생성합니다:

```
php artisan make:policy PostPolicy
```

`make:policy` 명령어는 기본적으로 빈 정책 클래스를 생성합니다. 만약 보기, 생성, 수정, 삭제 등 리소스에 관련된 예제 정책 메서드가 포함된 클래스를 만들고 싶다면 명령어 실행 시 `--model` 옵션을 추가합니다:

```
php artisan make:policy PostPolicy --model=Post
```

<a name="registering-policies"></a>
### 정책 등록

정책 클래스를 생성했다면, 이를 등록해야 합니다. 정책을 등록하는 것은 라라벨에게 "어떤 모델에 대해 어떤 정책을 사용할지" 알려주는 과정입니다.

새로운 라라벨 애플리케이션에 기본 포함된 `App\Providers\AuthServiceProvider` 파일에는, Eloquent 모델과 해당 정책을 연결하는 `policies` 속성이 있습니다. 정책을 명시적으로 등록함으로써, 해당 Eloquent 모델에 관련된 행위 인가 시 어떤 정책을 사용할지 라라벨이 알 수 있게 됩니다:

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
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        Post::class => PostPolicy::class,
    ];

    /**
     * Register any application authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        //
    }
}
```

<a name="policy-auto-discovery"></a>
#### 정책 자동 탐색

정책을 직접 등록하지 않고도, 라라벨은 (일정한 네이밍 규칙을 따를 경우) 정책을 자동으로 탐색해서 연결할 수 있습니다. 구체적으로, 정책이 해당 모델을 포함하는 디렉터리와 같거나 상위에 있는 `Policies` 디렉터리에 위치해야 합니다. 예를 들어, 모델은 `app/Models`에, 정책은 `app/Policies`에 둘 수 있습니다. 이런 경우 라라벨은 정책을 `app/Models/Policies`에서 먼저, 이후 `app/Policies`에서 찾습니다. 그리고 정책 클래스명은 모델명과 같고 뒤에 `Policy`가 붙어야 합니다. 예로, `User` 모델에는 `UserPolicy`라는 정책 클래스가 연결됩니다.

직접 정책 자동 탐색 로직을 정의하고 싶다면, `Gate::guessPolicyNamesUsing` 메서드로 커스텀 콜백을 등록하면 됩니다. 이 메서드는 보통 앱의 `AuthServiceProvider`의 `boot` 메서드에서 호출합니다:

```
use Illuminate\Support\Facades\Gate;

Gate::guessPolicyNamesUsing(function ($modelClass) {
    // Return the name of the policy class for the given model...
});
```

> [!NOTE]
> `AuthServiceProvider`에서 명시적으로 매핑한 정책은 자동 탐색 정책보다 우선 적용됩니다.

<a name="writing-policies"></a>
## 정책 작성하기

<a name="policy-methods"></a>
### 정책 메서드

정책 클래스를 등록했다면, 이제 각 행위에 해당하는 메서드를 자유롭게 추가할 수 있습니다. 예를 들어, `PostPolicy`에 주어진 `App\Models\User`가 특정 `App\Models\Post` 인스턴스를 업데이트할 수 있는지 판별하는 `update` 메서드를 정의해 보겠습니다.

`update` 메서드는 `User`와 `Post` 인스턴스를 인수로 받아, 사용자가 해당 게시글을 업데이트할 수 있으면 `true`, 아니면 `false`를 반환해야 합니다. 아래 코드에서는 사용자의 `id`와 게시글의 `user_id`가 일치하는지 확인하여 인가합니다:

```
<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * Determine if the given post can be updated by the user.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Post  $post
     * @return bool
     */
    public function update(User $user, Post $post)
    {
        return $user->id === $post->user_id;
    }
}
```

필요에 따라 추가로 다양한 메서드를 정의해 여러 행위에 대한 인가를 구현할 수 있습니다. 예를 들어, `view`나 `delete` 같이 여러 게시글 관련 행위를 위한 메서드를 추가할 수 있습니다. 메서드명은 자유롭게 정할 수 있습니다.

정책을 생성할 때 아티즌 콘솔에서 `--model` 옵션을 사용했다면, `viewAny`, `view`, `create`, `update`, `delete`, `restore`, `forceDelete` 행위에 대한 메서드가 미리 포함되어 생성됩니다.

> [!TIP]
> 모든 정책 클래스는 라라벨의 [서비스 컨테이너](/docs/8.x/container)로부터 주입받아 생성되므로, 생성자에 필요한 의존성을 타입힌트하면 자동으로 주입받을 수 있습니다.

<a name="policy-responses"></a>
### 정책 응답

지금까지는 정책 메서드에서 단순한 불리언 값만 반환했습니다. 그러나 보다 자세한 응답, 예를 들어 에러 메시지 등도 필요할 수 있습니다. 이럴 때는 정책 메서드에서 `Illuminate\Auth\Access\Response` 인스턴스를 반환하면 됩니다:

```
use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Determine if the given post can be updated by the user.
 *
 * @param  \App\Models\User  $user
 * @param  \App\Models\Post  $post
 * @return \Illuminate\Auth\Access\Response
 */
public function update(User $user, Post $post)
{
    return $user->id === $post->user_id
                ? Response::allow()
                : Response::deny('You do not own this post.');
}
```

이렇게 정책에서 인가 응답을 반환해도, `Gate::allows` 메서드는 여전히 단순 불리언 값을 반환합니다. 하지만 `Gate::inspect` 메서드를 사용하면 게이트에서 반환되는 전체 인가 응답을 확인할 수 있습니다:

```
use Illuminate\Support\Facades\Gate;

$response = Gate::inspect('update', $post);

if ($response->allowed()) {
    // The action is authorized...
} else {
    echo $response->message();
}
```

`Gate::authorize` 메서드를 사용해 인가되지 않을 경우 예외가 발생하며, 정책 응답에서 지정한 에러 메시지는 HTTP 응답으로 전달됩니다:

```
Gate::authorize('update', $post);

// The action is authorized...
```

<a name="methods-without-models"></a>
### 모델이 없는 메서드

일부 정책 메서드는 현재 인증된 사용자 인스턴스만 받으며, 모델 인스턴스를 받지 않는 경우가 있습니다. 대표적으로 `create` 행위를 인가할 때 그렇습니다. 예를 들어 블로그에서 사용자가 글을 작성할 수 있는지 여부를 확인하고 싶을 때입니다. 이 경우 정책 메서드는 사용자 인스턴스만 받도록 구현해야 합니다:

```
/**
 * Determine if the given user can create posts.
 *
 * @param  \App\Models\User  $user
 * @return bool
 */
public function create(User $user)
{
    return $user->role == 'writer';
}
```

<a name="guest-users"></a>
### 게스트 사용자

기본적으로, 인증되지 않은 사용자가 요청하면 모든 게이트와 정책은 자동으로 `false`를 반환합니다. 그러나 이러한 인가 검사가 게이트나 정책까지 넘어가도록 하고 싶다면, 사용자 인자에 "옵셔널" 타입힌트나 `null` 기본값을 선언하면 됩니다:

```
<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * Determine if the given post can be updated by the user.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Post  $post
     * @return bool
     */
    public function update(?User $user, Post $post)
    {
        return optional($user)->id === $post->user_id;
    }
}
```

<a name="policy-filters"></a>
### 정책 필터

특정 사용자에게 한 정책 내의 모든 권한을 부여(또는 거부)하고 싶다면, 정책에 `before` 메서드를 정의하면 됩니다. `before` 메서드는 정책의 다른 메서드보다 먼저 실행되어, 해당 행위의 정책 메서드가 호출되기 전에 인가 결과를 정할 기회를 제공합니다. 주로 애플리케이션의 관리자가 모든 행위를 할 수 있도록 허용할 때 사용됩니다:

```
use App\Models\User;

/**
 * Perform pre-authorization checks.
 *
 * @param  \App\Models\User  $user
 * @param  string  $ability
 * @return void|bool
 */
public function before(User $user, $ability)
{
    if ($user->isAdministrator()) {
        return true;
    }
}
```

특정 유형의 사용자에게 모든 인가를 거부하고 싶다면 `before` 메서드에서 `false`를 반환하면 됩니다. 만약 `null`을 반환한다면, 인가 검사는 해당 정책 메서드로 넘어갑니다.

> [!NOTE]
> 정책 클래스의 `before` 메서드는, 그 클래스에 인가 검사 대상이 되는 메서드가 실제로 있어야만 호출됩니다.

<a name="authorizing-actions-using-policies"></a>
## 정책을 사용한 행위 인가

<a name="via-the-user-model"></a>
### User 모델에서

라라벨의 기본 `App\Models\User` 모델에는 행위 인가를 위한 유용한 메서드 `can`과 `cannot`이 포함되어 있습니다. 이 메서드들은 인가하고자 하는 행위의 이름과, 관련된 모델을 인수로 받습니다. 예를 들어, 사용자가 특정 `App\Models\Post` 모델을 업데이트할 수 있는지 보통 컨트롤러에서 판별할 수 있습니다:

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Update the given post.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Post $post)
    {
        if ($request->user()->cannot('update', $post)) {
            abort(403);
        }

        // Update the post...
    }
}
```

해당 모델에 대해 [정책이 등록되어](#registering-policies) 있다면, `can` 메서드는 자동으로 적절한 정책 메서드를 호출해서 결과를 반환합니다. 등록된 정책이 없다면, `can` 메서드는 클로저 기반 게이트에 해당하는 행위 이름이 있는지 찾아 호출합니다.

<a name="user-model-actions-that-dont-require-models"></a>
#### 모델이 필요 없는 행위

일부 행위는 `create` 메서드처럼 모델 인스턴스가 필요 없을 수 있습니다. 이런 경우에는 클래스명을 `can` 메서드에 전달할 수 있으며, 이 클래스명을 토대로 어떤 정책을 사용할지 라라벨이 판단합니다:

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Create a post.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        if ($request->user()->cannot('create', Post::class)) {
            abort(403);
        }

        // Create the post...
    }
}
```

<a name="via-controller-helpers"></a>
### 컨트롤러 헬퍼에서

`App\Models\User` 모델이 제공하는 편리한 인가 메서드 외에도, `App\Http\Controllers\Controller`를 상속받는 모든 컨트롤러에서는 `authorize` 메서드를 사용할 수 있습니다.

이 메서드 역시 인가할 행위명과 해당 모델을 인수로 받습니다. 만약 인가되지 않으면, `authorize` 메서드는 `Illuminate\Auth\Access\AuthorizationException` 예외를 발생시키며, 라라벨 예외 핸들러가 이를 자동으로 403 상태 코드의 HTTP 응답으로 변환합니다:

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Update the given blog post.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\Response
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function update(Request $request, Post $post)
    {
        $this->authorize('update', $post);

        // The current user can update the blog post...
    }
}
```

<a name="controller-actions-that-dont-require-models"></a>
#### 모델이 필요 없는 행위

앞서 설명한 것과 같이, 일부 정책 메서드(`create` 등)는 모델 인스턴스를 필요로 하지 않습니다. 이런 경우에는 `authorize` 메서드에 클래스명을 전달하세요. 이는 어떤 정책을 사용할지 판단하는 데 쓰입니다:

```
use App\Models\Post;
use Illuminate\Http\Request;

/**
 * Create a new blog post.
 *
 * @param  \Illuminate\Http\Request  $request
 * @return \Illuminate\Http\Response
 *
 * @throws \Illuminate\Auth\Access\AuthorizationException
 */
public function create(Request $request)
{
    $this->authorize('create', Post::class);

    // The current user can create blog posts...
}
```

<a name="authorizing-resource-controllers"></a>
#### 리소스 컨트롤러에서 인가 적용

[리소스 컨트롤러](/docs/8.x/controllers#resource-controllers)를 사용할 때, 컨트롤러의 생성자에 `authorizeResource` 메서드를 활용할 수 있습니다. 이 메서드는 적절한 `can` 미들웨어 정의를 리소스 컨트롤러의 각 메서드에 자동으로 적용합니다.

`authorizeResource` 메서드는 첫 번째 인수로 모델의 클래스명, 두 번째 인수로는 라우트/요청 파라미터 이름을 받습니다. 필요에 따라 [리소스 컨트롤러](/docs/8.x/controllers#resource-controllers) 생성 시 `--model` 플래그를 사용하면, 필수 시그니처와 타입힌트가 자동으로 생성됩니다:

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Create the controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->authorizeResource(Post::class, 'post');
    }
}
```

아래 컨트롤러 메서드들이 각각 정책 메서드와 매핑됩니다. 라우트에 요청이 오면, 해당 메서드 실행 전 정책 메서드가 자동으로 호출되어 인가를 수행합니다:

| 컨트롤러 메서드 | 정책 메서드 |
| --- | --- |
| index | viewAny |
| show | view |
| create | create |
| store | create |
| edit | update |
| update | update |
| destroy | delete |

> [!TIP]
> `php artisan make:policy PostPolicy --model=Post`와 같이 `--model` 옵션을 사용해 주어진 모델의 정책 클래스를 빠르게 생성할 수 있습니다.

<a name="via-middleware"></a>
### 미들웨어에서

라라벨은 들어오는 요청이 라우트나 컨트롤러에 도달하기 전에 행위 인가를 수행할 수 있는 미들웨어를 내장하고 있습니다. 기본적으로 `Illuminate\Auth\Middleware\Authorize` 미들웨어는 앱의 `App\Http\Kernel`에서 `can` 키로 등록되어 있습니다. 아래는 사용자가 게시글을 수정할 수 있는지 미들웨어로 인가하는 예시입니다:

```
use App\Models\Post;

Route::put('/post/{post}', function (Post $post) {
    // The current user may update the post...
})->middleware('can:update,post');
```

여기서는 `can` 미들웨어에 인가 대상 행위명과, 정책 메서드에 전달할 라우트 파라미터(여기선 `post`)를 인수로 넘깁니다. [암시적 모델 바인딩](/docs/8.x/routing#implicit-binding)을 사용하기 때문에, `App\Models\Post` 모델 인스턴스가 자동으로 정책 메서드에 전달됩니다. 사용자가 행위를 인가받지 못할 경우 403 상태 코드의 HTTP 응답이 반환됩니다.

편의상, `can` 메서드로 미들웨어를 라우트에 붙일 수도 있습니다:

```
use App\Models\Post;

Route::put('/post/{post}', function (Post $post) {
    // The current user may update the post...
})->can('update', 'post');
```

<a name="middleware-actions-that-dont-require-models"></a>
#### 모델이 필요 없는 행위

`create`와 같은 일부 정책 메서드는 모델 인스턴스가 필요 없습니다. 이런 경우에는 미들웨어에 클래스명을 전달하면 됩니다. 이 클래스명으로 어떤 정책을 사용할지 판단이 이뤄집니다:

```
Route::post('/post', function () {
    // The current user may create posts...
})->middleware('can:create,App\Models\Post');
```

미들웨어 정의 문자열에 전체 클래스명을 입력하는 것이 번거로울 수 있으니, 라우트에 `can` 메서드를 붙여 더 간단하게 지정할 수도 있습니다:

```
use App\Models\Post;

Route::post('/post', function () {
    // The current user may create posts...
})->can('create', Post::class);
```

<a name="via-blade-templates"></a>
### Blade 템플릿에서

Blade 템플릿을 작성할 때, 사용자가 특정 행위를 인가받았을 때만 페이지의 일부를 보여주고 싶을 수 있습니다. 예를 들어, 사용자가 게시글을 수정할 수 있는 경우에만 수정 폼을 표시하고 싶은 경우입니다. 이런 상황에서는 `@can`, `@cannot` 지시문을 사용할 수 있습니다:

```html
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

이 지시문들은 사실상 `@if`/`@unless` 문에 대한 편리한 단축 표기입니다. 위의 `@can` 및 `@cannot` 문은 아래와 같습니다:

```html
@if (Auth::user()->can('update', $post))
    <!-- The current user can update the post... -->
@endif

@unless (Auth::user()->can('update', $post))
    <!-- The current user cannot update the post... -->
@endunless
```

여러 행위 중 어떤 것이든 사용자가 인가받았는지 확인하고 싶다면, `@canany` 지시문을 사용하세요:

```html
@canany(['update', 'view', 'delete'], $post)
    <!-- The current user can update, view, or delete the post... -->
@elsecanany(['create'], \App\Models\Post::class)
    <!-- The current user can create a post... -->
@endcanany
```

<a name="blade-actions-that-dont-require-models"></a>
#### 모델이 필요 없는 행위

다른 인가 방식과 마찬가지로, 모델 인스턴스가 필요 없는 행위에는 클래스명을 `@can`, `@cannot` 지시문에 넘길 수 있습니다:

```html
@can('create', App\Models\Post::class)
    <!-- The current user can create posts... -->
@endcan

@cannot('create', App\Models\Post::class)
    <!-- The current user can't create posts... -->
@endcannot
```

<a name="supplying-additional-context"></a>
### 추가 컨텍스트 전달

정책을 사용해 행위를 인가할 때, 두 번째 인수에 배열을 전달할 수 있으며, 배열의 첫 번째 요소는 어떤 정책을 사용할지 판단에 쓰이고, 나머지는 정책 메서드의 파라미터로 전달되어 인가 판단 시 추가 컨텍스트로 사용할 수 있습니다. 아래 예제는 `PostPolicy`의 정책 메서드가 추가적으로 `$category` 파라미터를 받는 경우입니다:

```
/**
 * Determine if the given post can be updated by the user.
 *
 * @param  \App\Models\User  $user
 * @param  \App\Models\Post  $post
 * @param  int  $category
 * @return bool
 */
public function update(User $user, Post $post, int $category)
{
    return $user->id === $post->user_id &&
           $user->canUpdateCategory($category);
}
```

이제 인증된 사용자가 주어진 게시글을 업데이트할 수 있는지 검사할 때, 아래와 같이 호출하면 됩니다:

```
/**
 * Update the given blog post.
 *
 * @param  \Illuminate\Http\Request  $request
 * @param  \App\Models\Post  $post
 * @return \Illuminate\Http\Response
 *
 * @throws \Illuminate\Auth\Access\AuthorizationException
 */
public function update(Request $request, Post $post)
{
    $this->authorize('update', [$post, $request->category]);

    // The current user can update the blog post...
}
```
