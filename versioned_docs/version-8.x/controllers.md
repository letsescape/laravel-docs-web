# 컨트롤러 (Controllers)

- [소개](#introduction)
- [컨트롤러 작성](#writing-controllers)
    - [기본 컨트롤러](#basic-controllers)
    - [단일 액션 컨트롤러](#single-action-controllers)
- [컨트롤러 미들웨어](#controller-middleware)
- [리소스 컨트롤러](#resource-controllers)
    - [부분 리소스 라우트](#restful-partial-resource-routes)
    - [중첩 리소스](#restful-nested-resources)
    - [리소스 라우트 이름 지정](#restful-naming-resource-routes)
    - [리소스 라우트 파라미터 이름 지정](#restful-naming-resource-route-parameters)
    - [리소스 라우트 스코핑](#restful-scoping-resource-routes)
    - [리소스 URI 현지화](#restful-localizing-resource-uris)
    - [리소스 컨트롤러 보완](#restful-supplementing-resource-controllers)
- [의존성 주입과 컨트롤러](#dependency-injection-and-controllers)

<a name="introduction"></a>
## 소개

모든 요청 처리 로직을 라우트 파일에서 클로저로 정의하는 대신, "컨트롤러" 클래스를 사용해 이러한 동작을 체계적으로 관리할 수 있습니다. 컨트롤러는 관련된 요청 처리 로직을 하나의 클래스에 모아둘 수 있습니다. 예를 들어, `UserController` 클래스가 사용자의 조회, 생성, 수정, 삭제 등과 같이 사용자와 관련된 모든 요청을 처리하도록 할 수 있습니다. 기본적으로 컨트롤러는 `app/Http/Controllers` 디렉토리에 저장됩니다.

<a name="writing-controllers"></a>
## 컨트롤러 작성

<a name="basic-controllers"></a>
### 기본 컨트롤러

기본적인 컨트롤러 예제를 살펴보겠습니다. 이 컨트롤러는 라라벨에 내장된 기본 컨트롤러 클래스인 `App\Http\Controllers\Controller`를 확장합니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;

class UserController extends Controller
{
    /**
     * 주어진 사용자의 프로필을 보여줍니다.
     *
     * @param  int  $id
     * @return \Illuminate\View\View
     */
    public function show($id)
    {
        return view('user.profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

아래와 같이 이 컨트롤러 메서드에 대한 라우트를 정의할 수 있습니다.

```
use App\Http\Controllers\UserController;

Route::get('/user/{id}', [UserController::class, 'show']);
```

들어오는 요청이 지정한 라우트 URI와 일치하면, `App\Http\Controllers\UserController` 클래스의 `show` 메서드가 호출되고, 라우트 파라미터가 해당 메서드에 전달됩니다.

> [!TIP]
> 컨트롤러는 반드시 기본 클래스를 **상속할 필요는 없습니다**. 그러나 기본 클래스를 상속하지 않으면 `middleware`, `authorize`와 같은 편리한 기능을 사용할 수 없습니다.

<a name="single-action-controllers"></a>
### 단일 액션 컨트롤러

컨트롤러에서 처리하는 액션이 아주 복잡하다면, 해당 액션만을 위한 전용 컨트롤러 클래스를 만드는 것이 편할 수 있습니다. 이럴 때는 컨트롤러 안에 `__invoke` 메서드만 하나 정의하면 됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;

class ProvisionServer extends Controller
{
    /**
     * 새 웹 서버를 셋업합니다.
     *
     * @return \Illuminate\Http\Response
     */
    public function __invoke()
    {
        // ...
    }
}
```

단일 액션 컨트롤러에 라우트를 등록할 때는, 컨트롤러 메서드명을 따로 지정하지 않고, 컨트롤러 이름만 라우터에 넘기면 됩니다.

```
use App\Http\Controllers\ProvisionServer;

Route::post('/server', ProvisionServer::class);
```

`make:controller` Artisan 명령어의 `--invokable` 옵션을 사용해 인보커블(단일 액션) 컨트롤러를 생성할 수 있습니다.

```
php artisan make:controller ProvisionServer --invokable
```

> [!TIP]
> 컨트롤러 스텁은 [스텁 게시](/docs/8.x/artisan#stub-customization)를 통해 커스터마이즈 할 수 있습니다.

<a name="controller-middleware"></a>
## 컨트롤러 미들웨어

[미들웨어](/docs/8.x/middleware)는 라우트 파일 내 컨트롤러 라우트에 지정할 수 있습니다.

```
Route::get('profile', [UserController::class, 'show'])->middleware('auth');
```

혹은 컨트롤러의 생성자에서 미들웨어를 지정하는 것이 더 편리할 수도 있습니다. 컨트롤러의 생성자 안에서 `middleware` 메서드를 사용하면, 컨트롤러의 특정 액션에 미들웨어를 할당할 수 있습니다.

```
class UserController extends Controller
{
    /**
     * 새 컨트롤러 인스턴스를 생성합니다.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('log')->only('index');
        $this->middleware('subscribed')->except('store');
    }
}
```

컨트롤러에서는 미들웨어를 클로저로도 등록할 수 있습니다. 즉, 하나의 컨트롤러에서만 사용할 인라인 미들웨어를 전체 미들웨어 클래스를 따로 정의하지 않고 쉽게 만들 수 있습니다.

```
$this->middleware(function ($request, $next) {
    return $next($request);
});
```

<a name="resource-controllers"></a>
## 리소스 컨트롤러

애플리케이션의 각 Eloquent 모델을 "리소스"로 생각해 보면, 보통 각 리소스별로 비슷한 작업(생성, 조회, 수정, 삭제 등)을 반복하게 됩니다. 예를 들어, 애플리케이션에 `Photo` 모델과 `Movie` 모델이 있다면, 사용자들은 이 리소스들을 생성, 조회, 수정, 삭제할 가능성이 높습니다.

이처럼 자주 반복되는 경우를 위해, 라라벨의 리소스 라우팅은 한 줄의 코드로 전형적인 생성, 조회, 수정, 삭제("CRUD") 라우트를 컨트롤러에 할당해 줍니다. 먼저, `make:controller` Artisan 명령어에 `--resource` 옵션을 사용해 이러한 동작을 처리할 컨트롤러를 쉽게 생성할 수 있습니다.

```
php artisan make:controller PhotoController --resource
```

위 명령어는 `app/Http/Controllers/PhotoController.php` 경로에 컨트롤러를 생성하며, 리소스별 작업을 위한 메서드가 포함되어 있습니다. 다음으로, 생성한 컨트롤러로 리소스 라우트를 등록합니다.

```
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class);
```

이 한 줄의 라우트 선언으로 해당 리소스에 다양한 작업을 처리하는 여러 라우트가 즉시 생성됩니다. 만들어진 컨트롤러는 각각의 액션에 대한 스텁 메서드를 이미 포함하고 있습니다. 애플리케이션의 전체 라우트를 빠르게 확인하고 싶을 때는 `route:list` Artisan 명령어를 실행하면 됩니다.

아래와 같이 `resources` 메서드에 배열을 넘기면 여러 리소스 컨트롤러를 한 번에 등록할 수도 있습니다.

```
Route::resources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

<a name="actions-handled-by-resource-controller"></a>
#### 리소스 컨트롤러가 처리하는 액션

Verb      | URI                    | 액션         | 라우트 이름
----------|------------------------|--------------|---------------------
GET       | `/photos`              | index        | photos.index
GET       | `/photos/create`       | create       | photos.create
POST      | `/photos`              | store        | photos.store
GET       | `/photos/{photo}`      | show         | photos.show
GET       | `/photos/{photo}/edit` | edit         | photos.edit
PUT/PATCH | `/photos/{photo}`      | update       | photos.update
DELETE    | `/photos/{photo}`      | destroy      | photos.destroy

<a name="customizing-missing-model-behavior"></a>
#### 미존재 모델 처리 동작 커스터마이즈

일반적으로, 암묵적으로 바인딩된 리소스 모델을 찾지 못하면 404 HTTP 응답이 반환됩니다. 하지만, `missing` 메서드를 이용해 리소스 라우트에 대한 이 동작을 커스터마이즈할 수 있습니다. `missing` 메서드는 암묵적으로 바인딩된 모델을 찾을 수 없을 때 호출되는 클로저를 인자로 받습니다.

```
use App\Http\Controllers\PhotoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

Route::resource('photos', PhotoController::class)
        ->missing(function (Request $request) {
            return Redirect::route('photos.index');
        });
```

<a name="specifying-the-resource-model"></a>
#### 리소스 모델 지정

[라우트 모델 바인딩](/docs/8.x/routing#route-model-binding)을 활용하며, 리소스 컨트롤러의 메서드에서 모델 인스턴스를 타입힌트로 지정하고 싶다면, 컨트롤러를 생성할 때 `--model` 옵션을 사용할 수 있습니다.

```
php artisan make:controller PhotoController --model=Photo --resource
```

<a name="generating-form-requests"></a>
#### 폼 리퀘스트 클래스 자동 생성

리소스 컨트롤러를 생성할 때 `--requests` 옵션도 함께 주면, 컨트롤러의 저장 및 수정 메서드에서 사용할 [폼 리퀘스트 클래스](/docs/8.x/validation#form-request-validation)가 Artisan에 의해 자동 생성됩니다.

```
php artisan make:controller PhotoController --model=Photo --resource --requests
```

<a name="restful-partial-resource-routes"></a>
### 부분 리소스 라우트

리소스 라우트를 선언할 때, 컨트롤러가 전체 기본 액션 대신 일부 액션만 처리하도록 지정할 수 있습니다.

```
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->only([
    'index', 'show'
]);

Route::resource('photos', PhotoController::class)->except([
    'create', 'store', 'update', 'destroy'
]);
```

<a name="api-resource-routes"></a>
#### API 리소스 라우트

API에서 사용될 리소스 라우트를 선언할 때는, `create`와 `edit`처럼 HTML 템플릿을 제공하는 라우트를 보통 제외하게 됩니다. 이런 경우를 위해 `apiResource` 메서드를 사용하면 두 라우트가 자동으로 빠집니다.

```
use App\Http\Controllers\PhotoController;

Route::apiResource('photos', PhotoController::class);
```

아래와 같이 여러 API 리소스 컨트롤러도 한 번에 등록할 수 있습니다.

```
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\PostController;

Route::apiResources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

`make:controller` 명령어 실행 시 `--api` 옵션을 사용하면, `create`나 `edit` 메서드 없이 빠르게 API 리소스 컨트롤러를 생성할 수 있습니다.

```
php artisan make:controller PhotoController --api
```

<a name="restful-nested-resources"></a>
### 중첩 리소스

경우에 따라 중첩된 리소스에 대한 라우트가 필요할 수 있습니다. 예를 들어, 포토 리소스에는 여러 개의 댓글이 달릴 수 있습니다. 이런 중첩 리소스 컨트롤러를 라우트 선언에서 "점" 표기법으로 정의할 수 있습니다.

```
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class);
```

이 라우트는 다음과 같은 URI로 중첩 리소스를 접근할 수 있게 됩니다.

```
/photos/{photo}/comments/{comment}
```

<a name="scoping-nested-resources"></a>
#### 중첩 리소스 스코핑

라라벨의 [암묵적 모델 바인딩](/docs/8.x/routing#implicit-model-binding-scoping) 기능을 이용하면, 고유적으로 스코프된 중첩 바인딩이 가능해집니다. 즉, 자식 모델이 반드시 부모 모델에 속해 있는지 확인하는 방식입니다. 중첩 리소스를 정의할 때 `scoped` 메서드를 사용하면 자동 스코핑을 활성화할 수 있고, 자식 리소스를 어떤 필드로 조회할지도 지정할 수 있습니다. 자세한 내용은 [리소스 라우트 스코핑](#restful-scoping-resource-routes) 문서를 참고하세요.

<a name="shallow-nesting"></a>
#### 얕은 중첩(Shallow Nesting)

일반적으로, 자식 리소스의 ID가 이미 고유한 경우 URI에 부모와 자식 ID를 모두 포함할 필요가 없습니다. 예를 들어, 오토 인크리먼트된 기본 키 등 고유 식별자를 URI 세그먼트로 사용하는 경우, "얕은(Shallow) 중첩"을 선택할 수 있습니다.

```
use App\Http\Controllers\CommentController;

Route::resource('photos.comments', CommentController::class)->shallow();
```

해당 라우트 정의는 아래와 같은 라우트를 만듭니다.

Verb      | URI                               | 액션         | 라우트 이름
----------|-----------------------------------|--------------|---------------------
GET       | `/photos/{photo}/comments`        | index        | photos.comments.index
GET       | `/photos/{photo}/comments/create` | create       | photos.comments.create
POST      | `/photos/{photo}/comments`        | store        | photos.comments.store
GET       | `/comments/{comment}`             | show         | comments.show
GET       | `/comments/{comment}/edit`        | edit         | comments.edit
PUT/PATCH | `/comments/{comment}`             | update       | comments.update
DELETE    | `/comments/{comment}`             | destroy      | comments.destroy

<a name="restful-naming-resource-routes"></a>
### 리소스 라우트 이름 지정

기본적으로 리소스 컨트롤러의 모든 액션에는 라우트 이름이 자동으로 지정되지만, `names` 배열을 넘겨 원하는 이름으로 직접 지정할 수도 있습니다.

```
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->names([
    'create' => 'photos.build'
]);
```

<a name="restful-naming-resource-route-parameters"></a>
### 리소스 라우트 파라미터 이름 지정

기본적으로 `Route::resource`는 "단수화된" 리소스 이름을 기준으로 라우트 파라미터를 생성합니다. 이 파라미터 명칭을 리소스별로 변경하려면 `parameters` 메서드를 사용할 수 있습니다. 이 메서드에 넘기는 배열은 리소스명과 파라미터명을 매칭하는 연관 배열이어야 합니다.

```
use App\Http\Controllers\AdminUserController;

Route::resource('users', AdminUserController::class)->parameters([
    'users' => 'admin_user'
]);
```

위 예제는 리소스의 `show` 라우트에 대해 다음과 같은 URI를 생성합니다.

```
/users/{admin_user}
```

<a name="restful-scoping-resource-routes"></a>
### 리소스 라우트 스코핑

라라벨의 [스코프 암묵적 모델 바인딩](/docs/8.x/routing#implicit-model-binding-scoping)는 중첩된 라우트에서 자식 모델이 반드시 부모 모델에 속하는지 자동으로 확인해 줍니다. 중첩 리소스를 정의할 때 `scoped` 메서드로 자동 스코핑을 활성화할 수 있으며, 자식 리소스를 어떤 필드로 조회할지도 간편하게 지정 가능합니다.

```
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class)->scoped([
    'comment' => 'slug',
]);
```

이 라우트는 다음과 같이 스코프된 중첩 리소스를 사용할 수 있게 만듭니다.

```
/photos/{photo}/comments/{comment:slug}
```

커스텀 키를 사용하는 암묵적 바인딩을 중첩 라우트 파라미터로 쓰면, 라라벨은 부모 관계명을 추측해서 쿼리를 자동으로 스코프 처리합니다. 위 예시에서는 `Photo` 모델에 `comments`(파라미터 이름의 복수형)라는 관계가 있다고 간주하여 `Comment` 모델을 조회합니다.

<a name="restful-localizing-resource-uris"></a>
### 리소스 URI 현지화

기본적으로 `Route::resource`는 리소스 URI에 영어 동사를 사용합니다. 만약 `create`와 `edit` 액션의 동사를 현지화(다른 언어로 변경)하려면, 애플리케이션의 `App\Providers\RouteServiceProvider` 클래스의 `boot` 메서드 초입에서 `Route::resourceVerbs` 메서드를 사용할 수 있습니다.

```
/**
 * 라우트 모델 바인딩, 패턴 필터 등을 정의합니다.
 *
 * @return void
 */
public function boot()
{
    Route::resourceVerbs([
        'create' => 'crear',
        'edit' => 'editar',
    ]);

    // ...
}
```

동사를 커스터마이징 한 뒤, 예를 들어 `Route::resource('fotos', PhotoController::class)`를 등록하면, 아래와 같은 URI가 생성됩니다.

```
/fotos/crear

/fotos/{foto}/editar
```

<a name="restful-supplementing-resource-controllers"></a>
### 리소스 컨트롤러 보완

기본 리소스 라우트 외에 추가 라우트가 필요하다면, 반드시 `Route::resource` 호출 **이전**에 보조 라우트를 정의해야 합니다. 그렇지 않으면 `resource` 메서드가 생성하는 라우트가 직접 정의한 추가 라우트보다 우선 적용될 수 있습니다.

```
use App\Http\Controller\PhotoController;

Route::get('/photos/popular', [PhotoController::class, 'popular']);
Route::resource('photos', PhotoController::class);
```

> [!TIP]
> 컨트롤러의 책임을 명확히 하세요. 만약 리소스 기본 액션 외의 메서드가 자주 필요하다면, 컨트롤러를 더 작고 목적별로 분리하는 것이 좋습니다.

<a name="dependency-injection-and-controllers"></a>
## 의존성 주입과 컨트롤러

<a name="constructor-injection"></a>
#### 생성자 인젝션

라라벨의 [서비스 컨테이너](/docs/8.x/container)는 모든 컨트롤러를 자동으로 resolve(해결)합니다. 따라서, 컨트롤러의 생성자에 필요한 의존성을 타입힌트로 지정하면 라라벨이 자동으로 주입해 줍니다. 아래 예제를 참고하세요.

```
<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepository;

class UserController extends Controller
{
    /**
     * UserRepository 인스턴스입니다.
     */
    protected $users;

    /**
     * 새 컨트롤러 인스턴스를 생성합니다.
     *
     * @param  \App\Repositories\UserRepository  $users
     * @return void
     */
    public function __construct(UserRepository $users)
    {
        $this->users = $users;
    }
}
```

<a name="method-injection"></a>
#### 메서드 인젝션

생성자 인젝션 외에도, 컨트롤러의 메서드에 타입힌트로 의존성을 전달받을 수 있습니다. 가장 흔한 예시로, `Illuminate\Http\Request` 인스턴스를 컨트롤러 메서드에 주입할 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 새 유저를 저장합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $name = $request->name;

        //
    }
}
```

컨트롤러 메서드가 라우트 파라미터도 함께 받는 경우, 의존성 뒤에 라우트 인수를 차례로 나열하면 됩니다. 예를 들어, 다음과 같은 라우트가 있다면

```
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

컨트롤러 메서드를 아래와 같이 정의해 `Illuminate\Http\Request`를 타입힌트로 받고, 라우트 인수인 `id`를 뒤에 추가로 받을 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 주어진 유저 정보를 업데이트합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }
}
```