# 컨트롤러 (Controllers)

- [소개](#introduction)
- [컨트롤러 작성하기](#writing-controllers)
    - [기본 컨트롤러](#basic-controllers)
    - [단일 액션 컨트롤러](#single-action-controllers)
- [컨트롤러 미들웨어](#controller-middleware)
- [리소스 컨트롤러](#resource-controllers)
    - [부분 리소스 라우트](#restful-partial-resource-routes)
    - [중첩 리소스](#restful-nested-resources)
    - [리소스 라우트 이름 지정](#restful-naming-resource-routes)
    - [리소스 라우트 파라미터 이름 지정](#restful-naming-resource-route-parameters)
    - [리소스 라우트 스코프 적용](#restful-scoping-resource-routes)
    - [리소스 URI 현지화](#restful-localizing-resource-uris)
    - [리소스 컨트롤러 확장](#restful-supplementing-resource-controllers)
    - [싱글턴 리소스 컨트롤러](#singleton-resource-controllers)
- [의존성 주입과 컨트롤러](#dependency-injection-and-controllers)

<a name="introduction"></a>
## 소개

모든 요청 처리 로직을 라우트 파일의 클로저로 작성하는 대신, "컨트롤러" 클래스를 사용해 이러한 동작을 구성할 수 있습니다. 컨트롤러는 서로 관련된 요청 처리 코드를 하나의 클래스로 묶어줄 수 있습니다. 예를 들어, `UserController` 클래스는 사용자와 관련된 모든 요청 처리(조회, 생성, 수정, 삭제 등)를 담당할 수 있습니다. 기본적으로 컨트롤러는 `app/Http/Controllers` 디렉터리에 저장됩니다.

<a name="writing-controllers"></a>
## 컨트롤러 작성하기

<a name="basic-controllers"></a>
### 기본 컨트롤러

새 컨트롤러를 빠르게 생성하려면 `make:controller` Artisan 명령어를 사용할 수 있습니다. 기본적으로 애플리케이션의 모든 컨트롤러는 `app/Http/Controllers` 디렉터리에 저장됩니다.

```shell
php artisan make:controller UserController
```

기본적인 컨트롤러 예시를 살펴보겠습니다. 컨트롤러는 여러 개의 public 메서드를 가질 수 있으며, 각각은 들어오는 HTTP 요청에 응답합니다.

```
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show the profile for a given user.
     */
    public function show(string $id): View
    {
        return view('user.profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

컨트롤러 클래스와 메서드를 작성한 후, 다음과 같이 해당 컨트롤러 메서드와 라우트를 연결할 수 있습니다.

```
use App\Http\Controllers\UserController;

Route::get('/user/{id}', [UserController::class, 'show']);
```

요청이 위에서 지정한 URI와 일치하면, `App\Http\Controllers\UserController` 클래스의 `show` 메서드가 호출되고, 라우트 파라미터가 해당 메서드에 전달됩니다.

> [!NOTE]  
> 컨트롤러는 **반드시** 특정 베이스 클래스를 상속받을 필요는 없습니다. 하지만 여러 컨트롤러에서 공통적으로 사용할 메서드를 베이스 컨트롤러 클래스에 작성해두면 관리가 편리할 수 있습니다.

<a name="single-action-controllers"></a>
### 단일 액션 컨트롤러

특정 컨트롤러의 동작이 특히 복잡하다면, 그 동작을 하나의 컨트롤러 클래스에 전담시키는 방식을 쓸 수 있습니다. 이를 위해 컨트롤러에 단 하나의 `__invoke` 메서드를 정의하면 됩니다.

```
<?php

namespace App\Http\Controllers;

class ProvisionServer extends Controller
{
    /**
     * Provision a new web server.
     */
    public function __invoke()
    {
        // ...
    }
}
```

단일 액션 컨트롤러의 라우트를 등록할 때는, 컨트롤러 메서드 이름을 따로 지정하지 않아도 됩니다. 대신 컨트롤러 클래스 이름만 전달하면 됩니다.

```
use App\Http\Controllers\ProvisionServer;

Route::post('/server', ProvisionServer::class);
```

`make:controller` Artisan 명령어에서 `--invokable` 옵션을 사용하면 바로 호출 가능한(invokable) 컨트롤러를 빠르게 생성할 수 있습니다.

```shell
php artisan make:controller ProvisionServer --invokable
```

> [!NOTE]  
> 컨트롤러 스텁은 [스텁 퍼블리싱](/docs/11.x/artisan#stub-customization)을 통해 커스터마이즈할 수 있습니다.

<a name="controller-middleware"></a>
## 컨트롤러 미들웨어

[미들웨어](/docs/11.x/middleware)는 라우트 파일에서 컨트롤러의 라우트에 할당할 수 있습니다.

```
Route::get('/profile', [UserController::class, 'show'])->middleware('auth');
```

또는, 컨트롤러 클래스 안에서 미들웨어를 지정할 수도 있습니다. 이 경우, 컨트롤러가 `HasMiddleware` 인터페이스를 구현해야 하며, 이 인터페이스는 컨트롤러에 static `middleware` 메서드를 요구합니다. 이 메서드 내에서 컨트롤러의 액션에 적용할 미들웨어 배열을 반환할 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class UserController extends Controller implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
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

컨트롤러 미들웨어를 클로저(Closure)로 정의할 수도 있습니다. 이 방법을 사용하면 별도의 미들웨어 클래스를 만들지 않고도 인라인 미들웨어를 빠르게 작성할 수 있습니다.

```
use Closure;
use Illuminate\Http\Request;

/**
 * Get the middleware that should be assigned to the controller.
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
> `Illuminate\Routing\Controllers\HasMiddleware`를 구현하는 컨트롤러는 `Illuminate\Routing\Controller`를 상속받아서는 안 됩니다.

<a name="resource-controllers"></a>
## 리소스 컨트롤러

애플리케이션에서 각 Eloquent 모델을 "리소스"라고 생각한다면, 보통 각 리소스에 대해 동일한 세트의 작업을 수행하게 됩니다. 예를 들어, `Photo` 모델과 `Movie` 모델이 있다면, 사용자는 이 리소스들을 생성, 조회, 수정, 삭제할 수 있습니다.

이런 일반적인 상황을 위해, 라라벨의 리소스 라우팅은 대표적인 생성, 조회, 수정, 삭제(CRUD) 라우트를 단 한 줄의 코드로 컨트롤러에 할당할 수 있습니다. 먼저, `make:controller` Artisan 명령어의 `--resource` 옵션을 사용해 이 동작을 처리할 컨트롤러를 빠르게 생성할 수 있습니다.

```shell
php artisan make:controller PhotoController --resource
```

이 명령어는 `app/Http/Controllers/PhotoController.php` 위치에 컨트롤러를 생성합니다. 생성된 컨트롤러에는 각 리소스 작업을 위한 메서드가 미리 구현된 형태로 들어있습니다. 이제 다음과 같이 리소스 라우트를 컨트롤러에 매핑할 수 있습니다.

```
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class);
```

이 한 줄의 라우트 선언만으로, 해당 리소스에 대한 다양한 작업을 처리하는 여러 라우트가 자동으로 생성됩니다. 만들어진 컨트롤러에는 이미 각 액션용 스텁 메서드가 포함되어 있습니다. 참고로, `route:list` Artisan 명령어를 실행하면 애플리케이션의 전체 라우트 개요를 빠르게 확인할 수 있습니다.

여러 리소스 컨트롤러를 한 번에 등록할 때는 `resources` 메서드에 배열을 전달할 수 있습니다.

```
Route::resources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

<a name="actions-handled-by-resource-controllers"></a>
#### 리소스 컨트롤러가 처리하는 액션

<div class="overflow-auto">

| 메서드    | URI                          | 액션    | 라우트 이름         |
| --------- | ---------------------------- | ------- | ------------------- |
| GET       | `/photos`                    | index   | photos.index        |
| GET       | `/photos/create`             | create  | photos.create       |
| POST      | `/photos`                    | store   | photos.store        |
| GET       | `/photos/{photo}`            | show    | photos.show         |
| GET       | `/photos/{photo}/edit`       | edit    | photos.edit         |
| PUT/PATCH | `/photos/{photo}`            | update  | photos.update       |
| DELETE    | `/photos/{photo}`            | destroy | photos.destroy      |

</div>

<a name="customizing-missing-model-behavior"></a>
#### 모델을 찾을 수 없을 때 동작 커스터마이징

일반적으로 암묵적 바인딩된 리소스 모델을 찾지 못하면 404 HTTP 응답이 반환됩니다. 그러나, `missing` 메서드를 사용해 라우트 정의 시 이 동작을 원하는 대로 커스터마이즈할 수 있습니다. `missing` 메서드는 암묵적 모델을 바인딩할 수 없을 때 호출할 클로저를 인수로 받습니다.

```
use App\Http\Controllers\PhotoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

Route::resource('photos', PhotoController::class)
    ->missing(function (Request $request) {
        return Redirect::route('photos.index');
    });
```

<a name="soft-deleted-models"></a>
#### 소프트 삭제(Soft Delete) 모델

기본적으로, 암묵적 모델 바인딩은 [소프트 삭제](/docs/11.x/eloquent#soft-deleting)된 모델을 조회하지 않고 404 HTTP 응답을 반환합니다. 그러나, 라우트를 정의할 때 `withTrashed` 메서드를 사용하면 소프트 삭제된 모델도 함께 조회할 수 있습니다.

```
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->withTrashed();
```

인수를 지정하지 않고 `withTrashed`를 호출하면, `show`, `edit`, `update` 리소스 라우트에서 소프트 삭제된 모델을 허용합니다. 배열을 전달하면 허용할 라우트만 골라서 설정할 수도 있습니다.

```
Route::resource('photos', PhotoController::class)->withTrashed(['show']);
```

<a name="specifying-the-resource-model"></a>
#### 리소스 모델 지정하기

[라우트 모델 바인딩](/docs/11.x/routing#route-model-binding)을 사용하는 경우, 컨트롤러 메서드에서 모델 인스턴스를 타입-힌트(type-hint)로 사용할 수 있습니다. 이를 위해 컨트롤러를 생성할 때 `--model` 옵션을 사용할 수 있습니다.

```shell
php artisan make:controller PhotoController --model=Photo --resource
```

<a name="generating-form-requests"></a>
#### 폼 리퀘스트 클래스 자동 생성

리소스 컨트롤러 생성 시 `--requests` 옵션을 추가하면, 저장 및 수정 액션에 대한 [폼 리퀘스트 클래스](/docs/11.x/validation#form-request-validation)도 함께 생성됩니다.

```shell
php artisan make:controller PhotoController --model=Photo --resource --requests
```

<a name="restful-partial-resource-routes"></a>
### 부분 리소스 라우트

리소스 라우트를 선언할 때 컨트롤러가 처리해야 할 액션의 일부만 지정하고 싶다면, 기본 모든 액션을 다 등록하는 대신 필요한 것만 선택할 수 있습니다.

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

API에서 사용할 리소스 라우트는 템플릿을 반환하는 `create`와 `edit` 라우트를 제외하는 경우가 많습니다. 편리하게도, `apiResource` 메서드를 사용하면 두 라우트를 자동으로 빼고 등록할 수 있습니다.

```
use App\Http\Controllers\PhotoController;

Route::apiResource('photos', PhotoController::class);
```

여러 API 리소스 컨트롤러를 한 번에 등록할 때는 `apiResources` 메서드를 사용할 수 있습니다.

```
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\PostController;

Route::apiResources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

`make:controller` 명령어에서 `--api` 옵션을 활용하면, `create`와 `edit` 메서드가 없는 API 리소스 컨트롤러를 바로 생성할 수 있습니다.

```shell
php artisan make:controller PhotoController --api
```

<a name="restful-nested-resources"></a>
### 중첩 리소스

상황에 따라 중첩된 리소스에 대한 라우트가 필요할 수 있습니다. 예를 들어, 포토(photo) 리소스에 여러 개의 코멘트(comment)가 달릴 수 있습니다. "점(dot) 표기법"을 사용해 중첩된 리소스 컨트롤러를 등록할 수 있습니다.

```
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class);
```

이렇게 등록하면 아래와 같은 형태로 중첩된 리소스 접근이 가능합니다.

```
/photos/{photo}/comments/{comment}
```

<a name="scoping-nested-resources"></a>
#### 중첩 리소스 스코프 지정

라라벨의 [암묵적 모델 바인딩](/docs/11.x/routing#implicit-model-binding-scoping) 기능은 중첩된 모델 바인딩시 자식 모델이 반드시 부모 모델에 속해 있는지 자동으로 확인할 수 있습니다. 중첩 리소스를 선언할 때 `scoped` 메서드를 사용하면 이 기능을 활성화할 수 있으며, 자식 리소스를 어떤 필드로 가져올지 지정할 수도 있습니다. 자세한 사용법은 [리소스 라우트의 스코프 적용](#restful-scoping-resource-routes) 문서를 참고하세요.

<a name="shallow-nesting"></a>
#### 얕은 중첩(Shallow Nesting)

실제로는 URI에 부모와 자식의 ID를 모두 포함시키지 않아도 될 때가 있습니다. 예를 들어 자식의 ID(주로 증가형 기본 키)가 유니크하다면, "얕은 중첩(shallow nesting)"을 사용할 수 있습니다.

```
use App\Http\Controllers\CommentController;

Route::resource('photos.comments', CommentController::class)->shallow();
```

이렇게 하면 다음과 같은 라우트가 정의됩니다.

<div class="overflow-auto">

| 메서드    | URI                                    | 액션    | 라우트 이름                |
| --------- | -------------------------------------- | ------- | ------------------------- |
| GET       | `/photos/{photo}/comments`             | index   | photos.comments.index     |
| GET       | `/photos/{photo}/comments/create`      | create  | photos.comments.create    |
| POST      | `/photos/{photo}/comments`             | store   | photos.comments.store     |
| GET       | `/comments/{comment}`                  | show    | comments.show             |
| GET       | `/comments/{comment}/edit`             | edit    | comments.edit             |
| PUT/PATCH | `/comments/{comment}`                  | update  | comments.update           |
| DELETE    | `/comments/{comment}`                  | destroy | comments.destroy          |

</div>

<a name="restful-naming-resource-routes"></a>
### 리소스 라우트 이름 지정

기본적으로 모든 리소스 컨트롤러의 액션에는 라우트 이름이 지정됩니다. 하지만 `names` 배열을 전달하여 원하는 대로 이름을 오버라이드할 수 있습니다.

```
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->names([
    'create' => 'photos.build'
]);
```

<a name="restful-naming-resource-route-parameters"></a>
### 리소스 라우트 파라미터 이름 지정

기본적으로 `Route::resource`는 리소스 이름의 단수형을 사용해 라우트 파라미터를 생성합니다. 파라미터 이름을 변경하고 싶다면 `parameters` 메서드에 연관 배열을 전달해서 지정할 수 있습니다.

```
use App\Http\Controllers\AdminUserController;

Route::resource('users', AdminUserController::class)->parameters([
    'users' => 'admin_user'
]);
```

위 예시에서는 해당 리소스의 `show` 라우트가 다음과 같은 URI를 갖게 됩니다.

```
/users/{admin_user}
```

<a name="restful-scoping-resource-routes"></a>
### 리소스 라우트 스코프 적용

라라벨의 [scoped 암묵적 모델 바인딩](/docs/11.x/routing#implicit-model-binding-scoping) 기능으로, 중첩된 바인딩에서 자식 모델이 부모 모델에 속해 있는지 자동으로 확인할 수 있습니다. 중첩 리소스를 선언할 때 `scoped` 메서드를 사용하면 자동 스코핑을 활성화하고, 자식 리소스를 어떤 필드로 검색할지 지정할 수 있습니다.

```
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class)->scoped([
    'comment' => 'slug',
]);
```

이렇게 하면 아래와 같은 URL에서 스코프가 적용된 중첩 리소스를 조회할 수 있습니다.

```
/photos/{photo}/comments/{comment:slug}
```

커스텀 키가 적용된 암묵적 바인딩을 중첩 라우트 파라미터로 사용할 때, 라라벨은 부모 모델의 연관관계 명(위 예시에서는 route 파라미터 이름의 복수형, 즉 `comments`)로 자식 모델을 검색하는 쿼리를 자동으로 스코프합니다.

<a name="restful-localizing-resource-uris"></a>
### 리소스 URI 현지화

기본적으로 `Route::resource`는 영어 동사와 복수 규칙을 따릅니다. 만약 `create`와 `edit` 등 액션 동사를 현지화해야 한다면, `Route::resourceVerbs` 메서드를 사용할 수 있습니다. 이 설정은 애플리케이션의 `App\Providers\AppServiceProvider`의 `boot` 메서드 시작 부분에 넣어줄 수 있습니다.

```
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Route::resourceVerbs([
        'create' => 'crear',
        'edit' => 'editar',
    ]);
}
```

라라벨의 복수화 기능은 [여러 언어를 지원](/docs/11.x/localization#pluralization-language)하므로, 필요에 따라 언어를 지정하여 사용할 수 있습니다. 동사와 복수화 언어를 커스터마이즈한 경우, 예를 들어 `Route::resource('publicacion', PublicacionController::class)`로 등록하면 다음과 같은 URI가 생성됩니다.

```
/publicacion/crear

/publicacion/{publicaciones}/editar
```

<a name="restful-supplementing-resource-controllers"></a>
### 리소스 컨트롤러 확장

기본 리소스 라우트 외에 추가로 라우트를 더 하고 싶다면, `Route::resource` 메서드보다 먼저 해당 supplemental(보조) 라우트를 정의해야 합니다. 그렇지 않으면, `resource` 메서드에서 생성된 라우트가 보조 라우트보다 우선시될 수 있습니다.

```
use App\Http\Controller\PhotoController;

Route::get('/photos/popular', [PhotoController::class, 'popular']);
Route::resource('photos', PhotoController::class);
```

> [!NOTE]  
> 컨트롤러의 역할이 너무 커지지 않게 주의하세요. 리소스 액션 이외의 메서드를 자주 추가하게 된다면, 컨트롤러를 더 작고 역할이 명확한 두 개 이상의 컨트롤러로 분리하는 것이 좋습니다.

<a name="singleton-resource-controllers"></a>
### 싱글턴 리소스 컨트롤러

애플리케이션에서 한 인스턴스만 존재할 수 있는 리소스가 있을 수 있습니다. 예를 들어, 사용자의 "프로필(profile)" 같은 것은 한 명의 사용자가 여러 개를 가질 수 없습니다. 마찬가지로 이미지에 "썸네일(thumbnail)"이 하나만 있을 수 있습니다. 이러한 경우를 "싱글턴 리소스"라고 하며, 해당 리소스는 오직 하나의 인스턴스만 존재합니다. 이처럼 한 개만 존재하는 리소스를 위해 "싱글턴" 리소스 컨트롤러를 등록할 수 있습니다.

```php
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::singleton('profile', ProfileController::class);
```

위의 싱글턴 리소스 정의는 다음과 같은 라우트를 등록합니다. "생성" 관련 라우트는 등록되지 않으며, 라우트가 식별자를 요구하지 않습니다. 왜냐하면 오직 하나의 인스턴스만 존재하기 때문입니다.

<div class="overflow-auto">

| 메서드    | URI                 | 액션   | 라우트 이름      |
| --------- | ------------------- | ------ | ---------------- |
| GET       | `/profile`          | show   | profile.show     |
| GET       | `/profile/edit`     | edit   | profile.edit     |
| PUT/PATCH | `/profile`          | update | profile.update   |

</div>

싱글턴 리소스는 일반 리소스 내에 중첩시킬 수도 있습니다.

```php
Route::singleton('photos.thumbnail', ThumbnailController::class);
```

이 경우, `photos` 리소스에는 [기본 리소스 라우트](#actions-handled-by-resource-controllers)가 모두 등록되는 한편, `thumbnail`에는 아래와 같은 싱글턴 리소스 라우트만 추가됩니다.

<div class="overflow-auto">

| 메서드    | URI                                 | 액션   | 라우트 이름                   |
| --------- | ----------------------------------- | ------ | ----------------------------- |
| GET       | `/photos/{photo}/thumbnail`         | show   | photos.thumbnail.show         |
| GET       | `/photos/{photo}/thumbnail/edit`    | edit   | photos.thumbnail.edit         |
| PUT/PATCH | `/photos/{photo}/thumbnail`         | update | photos.thumbnail.update       |

</div>

<a name="creatable-singleton-resources"></a>
#### 생성 가능한 싱글턴 리소스

때때로 싱글턴 리소스도 생성 및 저장 라우트를 정의해야 할 수 있습니다. 이 경우, 싱글턴 리소스 라우트 등록 시 `creatable` 메서드를 사용하면 됩니다.

```php
Route::singleton('photos.thumbnail', ThumbnailController::class)->creatable();
```

이 경우, 다음과 같은 라우트가 등록됩니다. 생성 및 저장 뿐만 아니라, 삭제(DELETE) 라우트도 함께 등록되는 것을 볼 수 있습니다.

<div class="overflow-auto">

| 메서드    | URI                                     | 액션    | 라우트 이름                    |
| --------- | --------------------------------------- | ------- | ------------------------------ |
| GET       | `/photos/{photo}/thumbnail/create`      | create  | photos.thumbnail.create        |
| POST      | `/photos/{photo}/thumbnail`             | store   | photos.thumbnail.store         |
| GET       | `/photos/{photo}/thumbnail`             | show    | photos.thumbnail.show          |
| GET       | `/photos/{photo}/thumbnail/edit`        | edit    | photos.thumbnail.edit          |
| PUT/PATCH | `/photos/{photo}/thumbnail`             | update  | photos.thumbnail.update        |
| DELETE    | `/photos/{photo}/thumbnail`             | destroy | photos.thumbnail.destroy       |

</div>

생성 및 저장 라우트는 빼고 DELETE 라우트만 등록하고 싶을 때는 `destroyable` 메서드를 사용할 수 있습니다.

```php
Route::singleton(...)->destroyable();
```

<a name="api-singleton-resources"></a>
#### API 싱글턴 리소스

`apiSingleton` 메서드를 사용하면, API에서 사용할 싱글턴 리소스로 `create` 및 `edit` 라우트가 필요 없는 라우트를 등록할 수 있습니다.

```php
Route::apiSingleton('profile', ProfileController::class);
```

또한 API 싱글턴 리소스도 `creatable` 메서드로 `store` 및 `destroy` 라우트를 등록할 수 있습니다.

```php
Route::apiSingleton('photos.thumbnail', ProfileController::class)->creatable();
```

<a name="dependency-injection-and-controllers"></a>
## 의존성 주입과 컨트롤러

<a name="constructor-injection"></a>
#### 생성자(컨스트럭터) 주입

라라벨의 [서비스 컨테이너](/docs/11.x/container)는 모든 컨트롤러를 자동으로 해결(resolve)합니다. 따라서, 컨트롤러의 생성자에서 필요한 의존성을 타입-힌트로 선언하면 자동으로 주입됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepository;

class UserController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        protected UserRepository $users,
    ) {}
}
```

<a name="method-injection"></a>
#### 메서드 주입

생성자 주입 외에도, 컨트롤러의 메서드에서 의존성을 타입-힌트로 명시할 수도 있습니다. 대표적인 예로, 컨트롤러 메서드에서 `Illuminate\Http\Request` 인스턴스를 주입받는 방식이 많이 사용됩니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Store a new user.
     */
    public function store(Request $request): RedirectResponse
    {
        $name = $request->name;

        // Store the user...

        return redirect('/users');
    }
}
```

컨트롤러 메서드에서 라우트 파라미터도 함께 받는 경우, 다른 의존성 다음에 라우트 인수를 나열하면 됩니다. 예를 들어 라우트가 다음과 같이 정의되어 있을 때,

```
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

`Illuminate\Http\Request`를 타입-힌트로 받고, 두 번째 인수로 라우트의 `id` 파라미터를 받아서 사용할 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Update the given user.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        // Update the user...

        return redirect('/users');
    }
}
```
