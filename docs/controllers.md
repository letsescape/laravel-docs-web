# 컨트롤러 (Controllers)

- [소개](#introduction)
- [컨트롤러 작성하기](#writing-controllers)
    - [기본 컨트롤러](#basic-controllers)
    - [단일 액션 컨트롤러](#single-action-controllers)
- [컨트롤러 미들웨어](#controller-middleware)
- [리소스 컨트롤러](#resource-controllers)
    - [부분 리소스 라우트](#restful-partial-resource-routes)
    - [중첩 리소스](#restful-nested-resources)
    - [리소스 라우트 이름 지정하기](#restful-naming-resource-routes)
    - [리소스 라우트 파라미터 이름 지정하기](#restful-naming-resource-route-parameters)
    - [리소스 라우트 스코프 지정하기](#restful-scoping-resource-routes)
    - [리소스 URI 현지화](#restful-localizing-resource-uris)
    - [리소스 컨트롤러 보완하기](#restful-supplementing-resource-controllers)
    - [싱글턴 리소스 컨트롤러](#singleton-resource-controllers)
- [의존성 주입과 컨트롤러](#dependency-injection-and-controllers)

<a name="introduction"></a>
## 소개

라우트 파일 안에 모든 요청 처리 로직을 클로저로 작성하는 대신, 라라벨에서는 이런 동작을 "컨트롤러" 클래스에 정리해둘 수 있습니다. 컨트롤러를 사용하면, 관련된 요청 처리 로직을 하나의 클래스에 그룹화할 수 있습니다. 예를 들어, `UserController` 클래스는 사용자와 관련된 모든 요청 - 사용자 조회, 생성, 수정, 삭제 등 - 을 처리할 수 있습니다. 기본적으로 컨트롤러는 `app/Http/Controllers` 디렉토리에 저장됩니다.

<a name="writing-controllers"></a>
## 컨트롤러 작성하기

<a name="basic-controllers"></a>
### 기본 컨트롤러

새로운 컨트롤러를 빠르게 생성하려면 `make:controller` 아티즌 명령어를 사용할 수 있습니다. 기본적으로, 애플리케이션의 모든 컨트롤러는 `app/Http/Controllers` 디렉토리에 저장됩니다:

```shell
php artisan make:controller UserController
```

기본 컨트롤러 예제를 살펴보겠습니다. 컨트롤러는 원하는 만큼의 public 메서드를 가질 수 있으며, 각 메서드는 들어오는 HTTP 요청에 응답할 수 있습니다:

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * 주어진 사용자의 프로필을 보여줍니다.
     */
    public function show(string $id): View
    {
        return view('user.profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

컨트롤러 클래스와 메서드를 작성한 후, 아래와 같이 해당 컨트롤러 메서드로 라우트를 정의할 수 있습니다:

```php
use App\Http\Controllers\UserController;

Route::get('/user/{id}', [UserController::class, 'show']);
```

들어오는 요청이 위 라우트 URI와 일치하면, `App\Http\Controllers\UserController` 클래스의 `show` 메서드가 호출되며, 라우트 파라미터가 메서드에 전달됩니다.

> [!NOTE]
> 컨트롤러는 **필수**로 베이스 클래스를 상속받을 필요는 없습니다. 그러나, 여러 컨트롤러에서 공유될 메서드를 포함한 기본 컨트롤러 클래스를 상속하는 것이 편리할 때가 많습니다.

<a name="single-action-controllers"></a>
### 단일 액션 컨트롤러

컨트롤러의 특정 액션이 복잡한 경우, 해당 액션만 전담하는 컨트롤러 클래스를 만드는 것이 더 나을 수 있습니다. 이를 위해 컨트롤러 안에 단 하나의 `__invoke` 메서드를 정의할 수 있습니다:

```php
<?php

namespace App\Http\Controllers;

class ProvisionServer extends Controller
{
    /**
     * 새로운 웹 서버를 프로비저닝합니다.
     */
    public function __invoke()
    {
        // ...
    }
}
```

단일 액션 컨트롤러를 위한 라우트를 등록할 때에는, 컨트롤러 메서드를 명시할 필요 없이 컨트롤러 클래스 이름만 라우터에 전달하면 됩니다:

```php
use App\Http\Controllers\ProvisionServer;

Route::post('/server', ProvisionServer::class);
```

`make:controller` 아티즌 명령어 사용 시 `--invokable` 옵션을 추가하면, 단일 액션 컨트롤러를 쉽게 생성할 수 있습니다:

```shell
php artisan make:controller ProvisionServer --invokable
```

> [!NOTE]
> 컨트롤러 스텁은 [스텁 퍼블리싱](/docs/artisan#stub-customization)을 통해 커스터마이즈할 수 있습니다.

<a name="controller-middleware"></a>
## 컨트롤러 미들웨어

[미들웨어](/docs/middleware)는 라우트 파일에서 컨트롤러 라우트에 할당할 수 있습니다:

```php
Route::get('/profile', [UserController::class, 'show'])->middleware('auth');
```

또는, 컨트롤러 클래스 내에서 미들웨어를 지정하는 것이 더 편리할 수 있습니다. 이 경우, 컨트롤러는 `HasMiddleware` 인터페이스를 구현해야 하며, 이 인터페이스는 컨트롤러에 static `middleware` 메서드가 있어야 함을 의미합니다. 해당 메서드에서는 컨트롤러의 액션에 적용할 미들웨어 배열을 반환하면 됩니다:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class UserController extends Controller implements HasMiddleware
{
    /**
     * 컨트롤러에 할당될 미들웨어를 반환합니다.
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('log', only: ['index']),
            new Middleware('subscribed', except: ['store']),
        ];
    }

    // ...
}
```

컨트롤러 미들웨어를 클로저로 정의할 수도 있으며, 이는 별도의 미들웨어 클래스를 작성하지 않고 인라인으로 미들웨어를 정의할 수 있는 편리한 방법입니다:

```php
use Closure;
use Illuminate\Http\Request;

/**
 * 컨트롤러에 할당될 미들웨어를 반환합니다.
 */
public static function middleware(): array
{
    return [
        function (Request $request, Closure $next) {
            return $next($request);
        },
    ];
}
```

> [!WARNING]
> `Illuminate\Routing\Controllers\HasMiddleware`를 구현하는 컨트롤러는 `Illuminate\Routing\Controller`를 상속해서는 안 됩니다.

<a name="resource-controllers"></a>
## 리소스 컨트롤러

애플리케이션에서 각 Eloquent 모델을 "리소스"로 생각할 때, 보통 각 리소스에 대해 생성, 조회, 수정, 삭제 같은 유사한 동작을 수행하게 됩니다. 예를 들어, 애플리케이션에 `Photo` 모델과 `Movie` 모델이 있다면, 사용자들은 이 리소스들을 생성, 조회, 수정, 삭제할 수 있을 것입니다.

이런 공통적인 상황을 위해, 라라벨의 리소스 라우팅은 컨트롤러에 일반적인 생성, 조회, 수정, 삭제(CRUD) 라우트를 한 줄의 코드로 할당할 수 있습니다. 먼저, `make:controller` 아티즌 명령어의 `--resource` 옵션을 사용해 해당 액션을 처리할 컨트롤러를 빠르게 생성할 수 있습니다:

```shell
php artisan make:controller PhotoController --resource
```

이 명령어는 `app/Http/Controllers/PhotoController.php`에 컨트롤러를 생성합니다. 생성된 컨트롤러는 각 리소스 동작에 대응하는 메서드를 포함하고 있습니다. 이제, 컨트롤러를 가리키는 리소스 라우트를 등록할 수 있습니다:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class);
```

위 단일 라우트 선언만으로도, 다양한 리소스 액션을 처리하는 여러 라우트가 한 번에 생성됩니다. 생성된 컨트롤러에는 이미 각각의 기본 액션 메서드가 스텁 형태로 작성되어 있습니다. 애플리케이션의 전체 라우트를 빠르게 확인하려면, `route:list` 아티즌 명령어를 실행해보면 됩니다.

여러 리소스 컨트롤러를 한 번에 등록하려면 `resources` 메서드에 배열을 전달할 수 있습니다:

```php
Route::resources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

<a name="actions-handled-by-resource-controllers"></a>
#### 리소스 컨트롤러가 처리하는 액션

<div class="overflow-auto">

| HTTP 메서드 | URI                      | 액션     | 라우트 이름           |
| ----------- | ------------------------ | -------- | --------------------- |
| GET         | `/photos`                | index    | photos.index          |
| GET         | `/photos/create`         | create   | photos.create         |
| POST        | `/photos`                | store    | photos.store          |
| GET         | `/photos/{photo}`        | show     | photos.show           |
| GET         | `/photos/{photo}/edit`   | edit     | photos.edit           |
| PUT/PATCH   | `/photos/{photo}`        | update   | photos.update         |
| DELETE      | `/photos/{photo}`        | destroy  | photos.destroy        |

</div>

<a name="customizing-missing-model-behavior"></a>
#### 모델 못 찾는 경우 동작 커스터마이징

일반적으로 암묵적으로 바인딩되는 리소스 모델을 찾지 못하면, 404 HTTP 응답이 반환됩니다. 그러나, 라우트 정의 시 `missing` 메서드를 호출하여 동작을 직접 커스터마이징할 수 있습니다. `missing` 메서드는 클로저를 받으며, 바인딩 실패 시 해당 클로저가 호출됩니다:

```php
use App\Http\Controllers\PhotoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

Route::resource('photos', PhotoController::class)
    ->missing(function (Request $request) {
        return Redirect::route('photos.index');
    });
```

<a name="soft-deleted-models"></a>
#### 소프트 삭제된 모델

기본적으로 암묵적 모델 바인딩은 [소프트 삭제](/docs/eloquent#soft-deleting)된 모델을 조회하지 않으며, 대신 404 HTTP 응답을 반환합니다. 하지만 리소스 라우트 정의 시 `withTrashed` 메서드를 호출하여 소프트 삭제된 모델도 포함하도록 지정할 수 있습니다:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->withTrashed();
```

인자를 전달하지 않고 `withTrashed`를 호출하면, `show`, `edit`, `update` 리소스 라우트에서 소프트 삭제된 모델도 허용합니다. 특정 라우트에만 적용하려면 배열로 지정할 수 있습니다:

```php
Route::resource('photos', PhotoController::class)->withTrashed(['show']);
```

<a name="specifying-the-resource-model"></a>
#### 리소스 모델 지정하기

[라우트 모델 바인딩](/docs/routing#route-model-binding)을 사용하고, 리소스 컨트롤러 메서드에서 모델 인스턴스를 타입힌트 하려면, 컨트롤러 생성 시 `--model` 옵션을 사용할 수 있습니다:

```shell
php artisan make:controller PhotoController --model=Photo --resource
```

<a name="generating-form-requests"></a>
#### 폼 리퀘스트 생성하기

리소스 컨트롤러를 생성할 때 `--requests` 옵션을 추가하면, 컨트롤러의 store, update 메서드용 [폼 리퀘스트 클래스](/docs/validation#form-request-validation)를 함께 생성할 수 있습니다:

```shell
php artisan make:controller PhotoController --model=Photo --resource --requests
```

<a name="restful-partial-resource-routes"></a>
### 부분 리소스 라우트

리소스 라우트를 선언할 때, 기본 제공되는 전체 액션이 아닌 원하는 일부 액션만 컨트롤러가 처리하도록 지정할 수 있습니다:

```php
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

API에서 사용할 리소스 라우트를 선언할 때는 보통 `create`, `edit`처럼 HTML 템플릿을 제공하는 라우트는 제외하고 싶을 수 있습니다. 이럴 때는 `apiResource` 메서드를 사용하면 두 라우트가 자동으로 제외됩니다:

```php
use App\Http\Controllers\PhotoController;

Route::apiResource('photos', PhotoController::class);
```

여러 API 리소스 컨트롤러도 배열로 한 번에 등록할 수 있습니다:

```php
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\PostController;

Route::apiResources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

`make:controller` 명령어 실행 시 `--api` 스위치를 추가하면 `create`, `edit` 메서드 없이 API 리소스 컨트롤러를 빠르게 생성할 수 있습니다:

```shell
php artisan make:controller PhotoController --api
```

<a name="restful-nested-resources"></a>
### 중첩 리소스

경우에 따라 중첩된 리소스에 대한 라우트를 정의해야 할 수 있습니다. 예를 들어, photo 리소스에 여러 comment(댓글)를 추가할 수 있습니다. 이런 중첩 리소스 컨트롤러는 라우트 선언 시 "점( . )" 표기법을 사용할 수 있습니다:

```php
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class);
```

이 라우트는 아래와 같이 접근할 수 있는 중첩 리소스를 등록합니다:

```text
/photos/{photo}/comments/{comment}
```

<a name="scoping-nested-resources"></a>
#### 중첩 리소스 스코프 적용

라라벨의 [암묵적 모델 바인딩](/docs/routing#implicit-model-binding-scoping) 기능을 활용하면, 자식 모델이 반드시 부모 모델에 속하는지 자동으로 확인(스코프)할 수 있습니다. 중첩 리소스 정의 시 `scoped` 메서드를 사용하면 자동 스코핑 및 자식 리소스를 어떤 필드로 조회할지 지정할 수 있습니다. 자세한 방법은 [리소스 라우트 스코프 지정하기](#restful-scoping-resource-routes) 문서를 참고하세요.

<a name="shallow-nesting"></a>
#### 얕은 중첩(Shallow Nesting)

대부분의 경우, URI 안에 부모와 자식 ID를 모두 포함시키지 않아도 됩니다. 자식 ID가 이미 고유 식별자 역할을 할 때(예: 자동 증가 프라이머리 키), "얕은 중첩(shallow nesting)" 방식을 사용할 수 있습니다:

```php
use App\Http\Controllers\CommentController;

Route::resource('photos.comments', CommentController::class)->shallow();
```

이렇게 정의하면, 아래와 같은 라우트들이 만들어집니다:

<div class="overflow-auto">

| HTTP 메서드 | URI                                 | 액션     | 라우트 이름                |
| ----------- | ----------------------------------- | -------- | -------------------------- |
| GET         | `/photos/{photo}/comments`          | index    | photos.comments.index      |
| GET         | `/photos/{photo}/comments/create`   | create   | photos.comments.create     |
| POST        | `/photos/{photo}/comments`          | store    | photos.comments.store      |
| GET         | `/comments/{comment}`               | show     | comments.show              |
| GET         | `/comments/{comment}/edit`          | edit     | comments.edit              |
| PUT/PATCH   | `/comments/{comment}`               | update   | comments.update            |
| DELETE      | `/comments/{comment}`               | destroy  | comments.destroy           |

</div>

<a name="restful-naming-resource-routes"></a>
### 리소스 라우트 이름 지정하기

기본적으로, 모든 리소스 컨트롤러 액션에는 라우트 이름이 정해져 있습니다. 그러나 `names` 배열을 전달하여 원하는 라우트 이름으로 직접 지정할 수도 있습니다:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->names([
    'create' => 'photos.build'
]);
```

<a name="restful-naming-resource-route-parameters"></a>
### 리소스 라우트 파라미터 이름 지정하기

`Route::resource`는 자동으로 리소스 이름을 단수형으로 변환해 라우트 파라미터를 생성합니다. 파라미터 이름을 직접 지정하려면 `parameters` 메서드를 사용할 수 있습니다. 배열의 key는 리소스명, value는 파라미터 이름입니다:

```php
use App\Http\Controllers\AdminUserController;

Route::resource('users', AdminUserController::class)->parameters([
    'users' => 'admin_user'
]);
```

위 예제는 `show` 라우트에 대해 아래와 같은 URI를 생성합니다:

```text
/users/{admin_user}
```

<a name="restful-scoping-resource-routes"></a>
### 리소스 라우트 스코프 지정하기

라라벨의 [스코프 암묵적 모델 바인딩](/docs/routing#implicit-model-binding-scoping) 기능을 통해, 자식 모델이 반드시 부모 모델에 속하도록 자동으로 스코프할 수 있습니다. 중첩 리소스 정의 시 `scoped` 메서드를 사용하면 자동 스코핑과 자식 리소스를 어느 필드로 조회할지 지정할 수 있습니다:

```php
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class)->scoped([
    'comment' => 'slug',
]);
```

이 라우트로 아래와 같은 URI가 등록됩니다:

```text
/photos/{photo}/comments/{comment:slug}
```

중첩된 라우트 파라미터에서 커스텀 키 암묵 바인딩을 사용할 때, 라라벨은 부모를 기준으로 자식 모델을 자동으로 스코프합니다. 예를 들어, `Photo` 모델에 `comments`(파라미터 이름의 복수형)라는 관계가 있다고 가정하며, 이를 이용해 `Comment` 모델을 가져오게 됩니다.

<a name="restful-localizing-resource-uris"></a>
### 리소스 URI 현지화

기본적으로, `Route::resource`는 영문 동사와 복수 규칙을 사용해서 리소스 URI를 생성합니다. `create`, `edit` 액션 동사를 현지화하려면, 애플리케이션의 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 `Route::resourceVerbs` 메서드를 사용할 수 있습니다:

```php
/**
 * 애플리케이션 서비스 부트스트랩.
 */
public function boot(): void
{
    Route::resourceVerbs([
        'create' => 'crear',
        'edit' => 'editar',
    ]);
}
```

라라벨의 복수형 변환기는 [여러 언어를 지원하며 원하는 언어로 설정](https://laravel.com/docs/localization#pluralization-language)할 수 있습니다. 동사와 복수화 언어를 커스터마이즈한 후, 예를 들어 `Route::resource('publicacion', PublicacionController::class)`로 등록하면 아래와 같은 URI가 만들어집니다:

```text
/publicacion/crear

/publicacion/{publicaciones}/editar
```

<a name="restful-supplementing-resource-controllers"></a>
### 리소스 컨트롤러 보완하기

기본 리소스 라우트 외에 추가적인 라우트를 리소스 컨트롤러에 정의하고 싶다면, 반드시 `Route::resource` 메서드 호출 **이전**에 그 라우트를 먼저 정의해야 합니다. 그렇지 않으면, `resource` 메서드에서 정의되는 라우트가 여러분의 추가 라우트보다 우선 적용될 수 있습니다:

```php
use App\Http\Controller\PhotoController;

Route::get('/photos/popular', [PhotoController::class, 'popular']);
Route::resource('photos', PhotoController::class);
```

> [!NOTE]
> 컨트롤러의 역할이 너무 많아지는 경우, 일반 리소스 액션 세트에 없는 메서드가 자주 필요하다면 컨트롤러를 좀 더 작은 단위로 분리하는 것을 고려하세요.

<a name="singleton-resource-controllers"></a>
### 싱글턴 리소스 컨트롤러

애플리케이션 내에 오직 하나의 인스턴스만 존재하는 리소스가 있을 수 있습니다. 예를 들어, 사용자의 "프로필"은 한 명의 사용자에게 하나만 존재하며, 이미지는 하나의 "썸네일"만 가질 수 있습니다. 이처럼 단 하나의 리소스 인스턴스만 존재하는 경우, 이를 "싱글턴 리소스"라고 부릅니다. 이런 경우에는 "싱글턴" 리소스 컨트롤러 라우트를 등록할 수 있습니다:

```php
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::singleton('profile', ProfileController::class);
```

위 싱글턴 리소스 정의로 아래와 같은 라우트가 등록됩니다. 보시다시피, 싱글턴 리소스에는 "생성" 관련 라우트가 생성되지 않으며, 등록된 라우트에는 식별자를 포함하지 않습니다. (하나만 존재하므로 ID가 필요 없음)

<div class="overflow-auto">

| HTTP 메서드 | URI             | 액션   | 라우트 이름         |
| ----------- | --------------- | ------ | ------------------- |
| GET         | `/profile`      | show   | profile.show        |
| GET         | `/profile/edit` | edit   | profile.edit        |
| PUT/PATCH   | `/profile`      | update | profile.update      |

</div>

싱글턴 리소스도 일반 리소스 내에서 중첩할 수 있습니다:

```php
Route::singleton('photos.thumbnail', ThumbnailController::class);
```

이 예제에서 `photos` 리소스는 [표준 리소스 라우트](#actions-handled-by-resource-controllers) 전체를 받게 되며, `thumbnail` 리소스는 싱글턴 리소스로 등록되어 아래와 같은 라우트만 만들어집니다:

<div class="overflow-auto">

| HTTP 메서드 | URI                              | 액션   | 라우트 이름                   |
| ----------- | -------------------------------- | ------ | ----------------------------- |
| GET         | `/photos/{photo}/thumbnail`      | show   | photos.thumbnail.show         |
| GET         | `/photos/{photo}/thumbnail/edit` | edit   | photos.thumbnail.edit         |
| PUT/PATCH   | `/photos/{photo}/thumbnail`      | update | photos.thumbnail.update       |

</div>

<a name="creatable-singleton-resources"></a>
#### 생성 가능한(Creatable) 싱글턴 리소스

때로는 싱글턴 리소스에도 생성 및 저장 라우트가 필요할 수 있습니다. 이 경우, 싱글턴 리소스 라우트 등록 시 `creatable` 메서드를 호출하면 됩니다:

```php
Route::singleton('photos.thumbnail', ThumbnailController::class)->creatable();
```

이 예제에서는 아래와 같은 라우트들이 등록됩니다. 생성과 저장뿐 아니라, `DELETE` 라우트 또한 함께 생성됩니다:

<div class="overflow-auto">

| HTTP 메서드 | URI                                | 액션     | 라우트 이름                     |
| ----------- | ---------------------------------- | -------- | ------------------------------- |
| GET         | `/photos/{photo}/thumbnail/create` | create   | photos.thumbnail.create         |
| POST        | `/photos/{photo}/thumbnail`        | store    | photos.thumbnail.store          |
| GET         | `/photos/{photo}/thumbnail`        | show     | photos.thumbnail.show           |
| GET         | `/photos/{photo}/thumbnail/edit`   | edit     | photos.thumbnail.edit           |
| PUT/PATCH   | `/photos/{photo}/thumbnail`        | update   | photos.thumbnail.update         |
| DELETE      | `/photos/{photo}/thumbnail`        | destroy  | photos.thumbnail.destroy        |

</div>

만약 싱글턴 리소스의 `DELETE` 라우트만 등록하고, 생성 및 저장 라우트는 필요하지 않다면, `destroyable` 메서드를 사용할 수 있습니다:

```php
Route::singleton(...)->destroyable();
```

<a name="api-singleton-resources"></a>
#### API용 싱글턴 리소스

API를 통한 조작만 필요한 싱글턴 리소스의 경우, `apiSingleton` 메서드를 사용하면 `create`와 `edit` 라우트가 제외됩니다:

```php
Route::apiSingleton('profile', ProfileController::class);
```

당연히, API 싱글턴 리소스도 `creatable`을 사용할 수 있으며, 이 경우 `store`와 `destroy` 라우트가 추가로 등록됩니다:

```php
Route::apiSingleton('photos.thumbnail', ProfileController::class)->creatable();
```

<a name="dependency-injection-and-controllers"></a>
## 의존성 주입과 컨트롤러

<a name="constructor-injection"></a>
#### 생성자 주입(Constructor Injection)

라라벨의 [서비스 컨테이너](/docs/container)는 모든 컨트롤러의 인스턴스를 생성할 때 사용됩니다. 즉, 컨트롤러에서 필요로 하는 어떤 의존성도 생성자에서 타입힌트로 선언할 수 있으며, 선언된 의존성들은 자동으로 해결되어 컨트롤러 인스턴스에 주입됩니다:

```php
<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepository;

class UserController extends Controller
{
    /**
     * 새 컨트롤러 인스턴스를 생성합니다.
     */
    public function __construct(
        protected UserRepository $users,
    ) {}
}
```

<a name="method-injection"></a>
#### 메서드 주입(Method Injection)

생성자 주입 외에도, 컨트롤러의 메서드에도 의존성을 타입힌트로 선언하여 주입받을 수 있습니다. 메서드 주입의 대표적인 예는 컨트롤러 메서드에 `Illuminate\Http\Request` 인스턴스를 주입하는 경우입니다:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 새 사용자를 저장합니다.
     */
    public function store(Request $request): RedirectResponse
    {
        $name = $request->name;

        // 사용자 저장...

        return redirect('/users');
    }
}
```

컨트롤러 메서드에서 라우트 파라미터 입력값도 함께 받으려면, 의존성 파라미터 뒤에 라우트 인수를 나열하면 됩니다. 예를 들어, 아래처럼 라우트가 정의되어 있다면:

```php
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

컨트롤러 메서드는 다음과 같이 작성할 수 있습니다. 즉, `Illuminate\Http\Request`는 타입힌트로 주입받고, `id`는 그 뒤에 파라미터로 전달받습니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 해당 사용자를 업데이트합니다.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        // 사용자 업데이트...

        return redirect('/users');
    }
}
```
