# 컨트롤러 (Controllers)

- [소개](#introduction)
- [컨트롤러 작성하기](#writing-controllers)
    - [기본 컨트롤러](#basic-controllers)
    - [단일 액션 컨트롤러](#single-action-controllers)
- [컨트롤러 미들웨어](#controller-middleware)
- [리소스 컨트롤러](#resource-controllers)
    - [일부 리소스 라우트만 지정하기](#restful-partial-resource-routes)
    - [중첩 리소스](#restful-nested-resources)
    - [리소스 라우트 이름 지정](#restful-naming-resource-routes)
    - [리소스 라우트 파라미터 이름 지정](#restful-naming-resource-route-parameters)
    - [리소스 라우트 범위 지정](#restful-scoping-resource-routes)
    - [리소스 URI 로컬라이즈](#restful-localizing-resource-uris)
    - [리소스 컨트롤러 보완](#restful-supplementing-resource-controllers)
    - [싱글턴 리소스 컨트롤러](#singleton-resource-controllers)
- [의존성 주입과 컨트롤러](#dependency-injection-and-controllers)

<a name="introduction"></a>
## 소개

모든 요청 처리 로직을 라우트 파일의 클로저로 작성하기보다, "컨트롤러" 클래스를 사용해 이 로직을 더 체계적으로 정리할 수 있습니다. 컨트롤러는 관련된 요청 처리 로직을 하나의 클래스로 묶어 관리할 수 있습니다. 예를 들어, `UserController` 클래스는 사용자와 관련된 모든 요청(조회, 생성, 수정, 삭제 등)을 처리할 수 있습니다. 기본적으로 컨트롤러는 `app/Http/Controllers` 디렉터리에 저장됩니다.

<a name="writing-controllers"></a>
## 컨트롤러 작성하기

<a name="basic-controllers"></a>
### 기본 컨트롤러

기본 컨트롤러의 예제를 살펴보겠습니다. 컨트롤러는 라라벨에서 제공하는 기본 컨트롤러 클래스인 `App\Http\Controllers\Controller`를 확장합니다.

```
<?php

namespace App\Http\Controllers;

use App\Models\User;

class UserController extends Controller
{
    /**
     * 지정한 사용자의 프로필을 보여줍니다.
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

이 컨트롤러 메서드로 라우트를 정의하려면 다음과 같이 작성합니다.

```
use App\Http\Controllers\UserController;

Route::get('/user/{id}', [UserController::class, 'show']);
```

요청이 해당 라우트 URI와 일치하면 `App\Http\Controllers\UserController` 클래스의 `show` 메서드가 호출되고, 라우트 파라미터가 해당 메서드로 전달됩니다.

> [!NOTE]
> 컨트롤러가 **반드시** 기본 클래스를 상속해야 하는 것은 아닙니다. 하지만 상속하지 않으면 `middleware`나 `authorize`와 같은 편리한 기능을 사용할 수 없습니다.

<a name="single-action-controllers"></a>
### 단일 액션 컨트롤러

컨트롤러의 액션이 특히 복잡하다면, 그 액션만을 위한 별도의 컨트롤러 클래스를 만들 수도 있습니다. 이를 위해 컨트롤러에 `__invoke` 메서드 하나만 정의하면 됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Models\User;

class ProvisionServer extends Controller
{
    /**
     * 새 웹 서버를 프로비저닝합니다.
     *
     * @return \Illuminate\Http\Response
     */
    public function __invoke()
    {
        // ...
    }
}
```

단일 액션 컨트롤러를 라우트에 등록할 때는 메서드명을 따로 지정하지 않고, 컨트롤러 이름만 전달하면 됩니다.

```
use App\Http\Controllers\ProvisionServer;

Route::post('/server', ProvisionServer::class);
```

`make:controller` Artisan 명령어에서 `--invokable` 옵션을 사용하면 단일 액션 컨트롤러를 쉽게 생성할 수 있습니다.

```shell
php artisan make:controller ProvisionServer --invokable
```

> [!NOTE]
> 컨트롤러 스텁은 [스텁 커스터마이징](/docs/9.x/artisan#stub-customization)을 통해 사용자 정의가 가능합니다.

<a name="controller-middleware"></a>
## 컨트롤러 미들웨어

[미들웨어](/docs/9.x/middleware)는 라우트 파일에서 해당 컨트롤러의 라우트에 직접 지정할 수 있습니다.

```
Route::get('profile', [UserController::class, 'show'])->middleware('auth');
```

또는, 컨트롤러의 생성자에서 미들웨어를 지정할 수도 있습니다. 컨트롤러 생성자에서 `middleware` 메서드를 사용하면 컨트롤러의 액션에 미들웨어를 할당할 수 있습니다.

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

컨트롤러에서는 미들웨어를 클로저(익명 함수)로도 등록할 수 있습니다. 이를 통해 컨트롤러 내에서만 사용하는 간단한 미들웨어를 별도의 클래스 없이 정의할 수 있습니다.

```
$this->middleware(function ($request, $next) {
    return $next($request);
});
```

<a name="resource-controllers"></a>
## 리소스 컨트롤러

애플리케이션의 각 Eloquent 모델을 "리소스"로 생각할 수 있다면, 일반적으로 각각의 리소스에 대해 비슷한 작업(생성, 조회, 수정, 삭제 등)을 수행하게 됩니다. 예를 들어, 애플리케이션에 `Photo` 모델과 `Movie` 모델이 있다면, 사용자는 이 리소스들을 생성, 조회, 수정, 삭제할 수 있을 것입니다.

이처럼 반복해서 사용되는 작업을 위해, 라라벨의 리소스 라우팅은 이러한 CRUD(생성, 조회, 수정, 삭제) 작업을 단 한 줄의 코드로 컨트롤러에 할당할 수 있게 해줍니다. 먼저, `make:controller` Artisan 명령어의 `--resource` 옵션을 사용해 이런 작업을 담당할 컨트롤러를 빠르게 만들 수 있습니다.

```shell
php artisan make:controller PhotoController --resource
```

이 명령어는 `app/Http/Controllers/PhotoController.php` 경로에 컨트롤러를 생성합니다. 생성된 컨트롤러에는 각각의 리소스 작업에 해당하는 메서드가 포함되어 있습니다. 이후, 해당 컨트롤러에 연결되는 리소스 라우트를 다음과 같이 등록할 수 있습니다.

```
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class);
```

이렇게 선언된 한 줄의 라우트는 해당 리소스에 대한 다양한 작업을 처리하는 여러 개의 라우트를 자동으로 생성합니다. 컨트롤러에는 각 작업에 대한 메서드가 이미 기본으로 작성되어 있으며, `route:list` Artisan 명령어를 통해 애플리케이션의 모든 라우트를 빠르게 확인할 수 있습니다.

여러 개의 리소스 컨트롤러를 한 번에 등록하려면 `resources` 메서드에 배열을 전달하면 됩니다.

```
Route::resources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

<a name="actions-handled-by-resource-controller"></a>
#### 리소스 컨트롤러가 처리하는 액션

Verb      | URI                    | 액션        | 라우트 이름
----------|------------------------|-------------|---------------------
GET       | `/photos`              | index       | photos.index
GET       | `/photos/create`       | create      | photos.create
POST      | `/photos`              | store       | photos.store
GET       | `/photos/{photo}`      | show        | photos.show
GET       | `/photos/{photo}/edit` | edit        | photos.edit
PUT/PATCH | `/photos/{photo}`      | update      | photos.update
DELETE    | `/photos/{photo}`      | destroy     | photos.destroy

<a name="customizing-missing-model-behavior"></a>
#### 모델이 없을 때 동작 커스터마이징

일반적으로 암묵적 모델 바인딩에서 리소스 모델을 찾지 못하면 404 HTTP 응답이 반환됩니다. 하지만 `missing` 메서드를 사용하면 이 동작을 직접 정의할 수 있습니다. `missing` 메서드는 모델을 찾을 수 없는 경우에 실행될 클로저를 받아들입니다.

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
#### 소프트 삭제된 모델

기본적으로 암묵적 모델 바인딩은 [소프트 삭제](/docs/9.x/eloquent#soft-deleting)된 모델을 조회하지 않고, 대신 404 HTTP 응답을 반환합니다. 하지만 라우트 정의 시 `withTrashed` 메서드를 호출하여 소프트 삭제된 모델도 허용하도록 할 수 있습니다.

```
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->withTrashed();
```

`withTrashed`에 인자를 전달하지 않으면 `show`, `edit`, `update` 리소스 라우트에서 소프트 삭제된 모델도 허용하게 됩니다. 인자에 배열을 전달하면 허용할 라우트만 선택할 수 있습니다.

```
Route::resource('photos', PhotoController::class)->withTrashed(['show']);
```

<a name="specifying-the-resource-model"></a>
#### 리소스 모델 지정하기

[라우트 모델 바인딩](/docs/9.x/routing#route-model-binding)을 사용하며, 리소스 컨트롤러의 메서드에서 모델 인스턴스를 타입힌트로 받고 싶을 때는 컨트롤러 생성 시 `--model` 옵션을 사용할 수 있습니다.

```shell
php artisan make:controller PhotoController --model=Photo --resource
```

<a name="generating-form-requests"></a>
#### 폼 리퀘스트 생성하기

리소스 컨트롤러를 생성할 때 `--requests` 옵션을 추가하면, 저장 및 업데이트 메서드용 [폼 리퀘스트 클래스](/docs/9.x/validation#form-request-validation)도 자동 생성됩니다.

```shell
php artisan make:controller PhotoController --model=Photo --resource --requests
```

<a name="restful-partial-resource-routes"></a>
### 일부 리소스 라우트만 지정하기

리소스 라우트를 선언할 때 기본 액션 전체가 아닌, 일부 액션만 컨트롤러에서 처리하도록 지정할 수 있습니다.

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

API에서 사용할 리소스 라우트를 선언할 때는, 일반적으로 `create`, `edit`처럼 HTML 템플릿을 제공하는 라우트는 제외하는 것이 일반적입니다. `apiResource` 메서드를 사용하면 이 두 라우트를 자동으로 제외할 수 있습니다.

```
use App\Http\Controllers\PhotoController;

Route::apiResource('photos', PhotoController::class);
```

여러 API 리소스 컨트롤러를 함께 등록하려면 `apiResources` 메서드를 사용하세요.

```
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\PostController;

Route::apiResources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

`make:controller` 명령어 실행 시 `--api` 옵션을 사용하면 `create` 및 `edit` 메서드를 제외한 API 전용 리소스 컨트롤러가 생성됩니다.

```shell
php artisan make:controller PhotoController --api
```

<a name="restful-nested-resources"></a>
### 중첩 리소스

때로는 리소스 내부에 또 다른 중첩 리소스의 라우트를 정의해야 할 수 있습니다. 예를 들어 포토 리소스(`Photo`)에 여러 개의 코멘트(`Comment`)를 달 수 있는 경우, 다음과 같이 "dot" 표기법을 사용해 중첩 리소스 컨트롤러를 지정할 수 있습니다.

```
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class);
```

이 라우트는 다음과 같이 접근할 수 있는 중첩 리소스를 등록합니다.

```
/photos/{photo}/comments/{comment}
```

<a name="scoping-nested-resources"></a>
#### 중첩 리소스 범위 지정

라라벨의 [암묵적 모델 바인딩](/docs/9.x/routing#implicit-model-binding-scoping) 기능을 활용해, 중첩 리소스의 하위 모델이 반드시 상위 모델에 속하는지 자동으로 확인(스코핑)할 수 있습니다. 중첩 리소스를 정의할 때 `scoped` 메서드를 사용하여 자동 범위 지정을 활성화하거나, 하위 리소스를 어떤 필드로 조회할지 지정할 수 있습니다. 자세한 방법은 [리소스 라우트 범위 지정 문서](#restful-scoping-resource-routes)를 참고하세요.

<a name="shallow-nesting"></a>
#### 얕은 중첩(Shallow Nesting)

때로는 URI에 상위와 하위 ID 둘 다 있을 필요가 없습니다. 예를 들어, 하위 리소스의 ID가 고유하다면, "shallow nesting"을 사용할 수 있습니다.

```
use App\Http\Controllers\CommentController;

Route::resource('photos.comments', CommentController::class)->shallow();
```

이 정의는 다음과 같은 라우트를 만듭니다.

Verb      | URI                               | 액션        | 라우트 이름
----------|-----------------------------------|-------------|---------------------
GET       | `/photos/{photo}/comments`        | index       | photos.comments.index
GET       | `/photos/{photo}/comments/create` | create      | photos.comments.create
POST      | `/photos/{photo}/comments`        | store       | photos.comments.store
GET       | `/comments/{comment}`             | show        | comments.show
GET       | `/comments/{comment}/edit`        | edit        | comments.edit
PUT/PATCH | `/comments/{comment}`             | update      | comments.update
DELETE    | `/comments/{comment}`             | destroy     | comments.destroy

<a name="restful-naming-resource-routes"></a>
### 리소스 라우트 이름 지정

리소스 컨트롤러의 각 액션은 기본적으로 라우트 이름이 지정되어 있지만, `names` 배열을 전달해 원하는 라우트 이름으로 덮어쓸 수 있습니다.

```
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->names([
    'create' => 'photos.build'
]);
```

<a name="restful-naming-resource-route-parameters"></a>
### 리소스 라우트 파라미터 이름 지정

기본적으로 `Route::resource`는 리소스 이름의 단수형을 이용해 라우트 파라미터를 생성합니다. 원하는 이름으로 변경하려면 `parameters` 메서드에 연관 배열을 전달해서 각각의 파라미터명을 직접 지정할 수 있습니다.

```
use App\Http\Controllers\AdminUserController;

Route::resource('users', AdminUserController::class)->parameters([
    'users' => 'admin_user'
]);
```

위 예제의 경우, 해당 리소스의 `show` 라우트 URI는 다음과 같이 생성됩니다.

```
/users/{admin_user}
```

<a name="restful-scoping-resource-routes"></a>
### 리소스 라우트 범위 지정

라라벨의 [스코프된 암묵적 모델 바인딩](/docs/9.x/routing#implicit-model-binding-scoping) 기능을 이용해, 중첩 모델의 범위가 상위 모델에 속하는지를 자동으로 확인할 수 있습니다. 중첩 리소스를 정의할 때 `scoped` 메서드를 사용하면 자동 스코핑과 함께 하위 리소스가 어떤 필드로 조회되는지 지정할 수 있습니다.

```
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class)->scoped([
    'comment' => 'slug',
]);
```

이렇게 하면, 다음과 같이 접근 가능한 스코프된 중첩 리소스가 등록됩니다.

```
/photos/{photo}/comments/{comment:slug}
```

커스텀 키를 사용하는 암묵적 바인딩이 중첩 라우트 파라미터로 사용될 때, 라라벨은 해당 중첩 모델을 상위 모델의 관계를 통해 범위(스코프)로 제한합니다. 즉, 위 예제에서는 `Photo` 모델이 `comments`라는 관계를 가지고 있다고 가정하여 `Comment` 모델을 조회하게 됩니다.

<a name="restful-localizing-resource-uris"></a>
### 리소스 URI 로컬라이즈

기본적으로 `Route::resource`는 리소스 URI를 영어 동사와 복수 규칙으로 생성합니다. `create`와 `edit` 같은 액션 동사를 현지화하려면, 애플리케이션의 `App\Providers\RouteServiceProvider` 내에서 `Route::resourceVerbs` 메서드를 사용할 수 있습니다. 보통 `boot` 메서드에 작성합니다.

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

라라벨의 복수화 기능은 [여러 언어를 지원](/docs/9.x/localization#pluralization-language)하며, 필요에 따라 설정할 수 있습니다. 동사와 복수화 언어를 변경한 뒤에는, 예를 들어 `Route::resource('publicacion', PublicacionController::class)`와 같이 등록하면 다음과 같은 URI가 생성됩니다.

```
/publicacion/crear

/publicacion/{publicaciones}/editar
```

<a name="restful-supplementing-resource-controllers"></a>
### 리소스 컨트롤러 보완

기본 리소스 라우트 외에 추가적인 라우트를 컨트롤러에 등록해야 할 경우, `Route::resource`를 호출하기 **이전에** 직접 추가 라우트를 정의해야 합니다. 그렇지 않으면 `resource` 메서드로 정의된 라우트가 의도치 않게 덮어쓸 수 있습니다.

```
use App\Http\Controller\PhotoController;

Route::get('/photos/popular', [PhotoController::class, 'popular']);
Route::resource('photos', PhotoController::class);
```

> [!NOTE]
> 컨트롤러는 한 가지 책임에 집중하도록 설계하는 것이 좋습니다. 만약 자주 기본 리소스 액션 외의 별도 메서드가 필요하다면, 컨트롤러를 더 작고 여러 개로 분리하는 것을 고려해보세요.

<a name="singleton-resource-controllers"></a>
### 싱글턴 리소스 컨트롤러

애플리케이션에 하나의 인스턴스만 존재할 수 있는 리소스도 있을 수 있습니다. 예를 들어 한 사용자의 "프로필"은 하나만 존재하며, 이미지를 대표하는 "썸네일"도 마찬가지입니다. 이처럼 하나만 존재할 수 있는 자원을 "싱글턴 리소스"라고 하며, 이런 경우 "싱글턴" 리소스 컨트롤러를 등록할 수 있습니다.

```php
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::singleton('profile', ProfileController::class);
```

위의 싱글턴 리소스 등록은 다음과 같은 라우트를 생성합니다. "생성" 라우트는 등록되지 않으며, 해당 리소스는 한 개만 존재하기 때문에 식별자를 따로 받지 않습니다.

Verb      | URI                               | 액션       | 라우트 이름
----------|-----------------------------------|------------|---------------------
GET       | `/profile`                        | show       | profile.show
GET       | `/profile/edit`                   | edit       | profile.edit
PUT/PATCH | `/profile`                        | update     | profile.update

싱글턴 리소스는 표준 리소스 내부에 중첩시킬 수도 있습니다.

```php
Route::singleton('photos.thumbnail', ThumbnailController::class);
```

이 예시에서는, `photos` 리소스는 [표준 리소스 라우트](#actions-handled-by-resource-controller)를 모두 가지게 되고, `thumbnail`은 아래와 같은 싱글턴 리소스로 제공됩니다.

| Verb      | URI                              | 액션   | 라우트 이름                |
|-----------|----------------------------------|--------|----------------------------|
| GET       | `/photos/{photo}/thumbnail`      | show   | photos.thumbnail.show      |
| GET       | `/photos/{photo}/thumbnail/edit` | edit   | photos.thumbnail.edit      |
| PUT/PATCH | `/photos/{photo}/thumbnail`      | update | photos.thumbnail.update    |

<a name="creatable-singleton-resources"></a>
#### 생성 가능한 싱글턴 리소스

때로는 싱글턴 리소스에 대해 생성 및 저장 라우트도 필요할 수 있습니다. 이럴 때는 싱글턴 리소스 라우트 등록 시 `creatable` 메서드를 사용하면 됩니다.

```php
Route::singleton('photos.thumbnail', ThumbnailController::class)->creatable();
```

이 예제에서는 다음과 같은 라우트가 추가로 등록됩니다. 생성/저장의 라우트 외에도, `DELETE` 라우트 또한 등록됩니다.

| Verb      | URI                                | 액션    | 라우트 이름                |
|-----------|------------------------------------|---------|----------------------------|
| GET       | `/photos/{photo}/thumbnail/create` | create  | photos.thumbnail.create    |
| POST      | `/photos/{photo}/thumbnail`        | store   | photos.thumbnail.store     |
| GET       | `/photos/{photo}/thumbnail`        | show    | photos.thumbnail.show      |
| GET       | `/photos/{photo}/thumbnail/edit`   | edit    | photos.thumbnail.edit      |
| PUT/PATCH | `/photos/{photo}/thumbnail`        | update  | photos.thumbnail.update    |
| DELETE    | `/photos/{photo}/thumbnail`        | destroy | photos.thumbnail.destroy   |

만약 싱글턴 리소스에 대해 `DELETE` 라우트만 등록하고 생성/저장 라우트는 등록하지 않으려면, `destroyable` 메서드를 사용할 수 있습니다.

```php
Route::singleton(...)->destroyable();
```

<a name="api-singleton-resources"></a>
#### API 싱글턴 리소스

`apiSingleton` 메서드를 사용하면 API를 통해 조작할 싱글턴 리소스를 등록할 수 있으며, 이 경우 `create`와 `edit` 라우트는 생성되지 않습니다.

```php
Route::apiSingleton('profile', ProfileController::class);
```

또한 API 싱글턴 리소스에서도 `creatable` 메서드를 적용해 `store`와 `destroy` 라우트를 등록할 수 있습니다.

```php
Route::apiSingleton('photos.thumbnail', ProfileController::class)->creatable();
```

<a name="dependency-injection-and-controllers"></a>
## 의존성 주입과 컨트롤러

<a name="constructor-injection"></a>
#### 생성자 주입

라라벨의 [서비스 컨테이너](/docs/9.x/container)는 모든 컨트롤러를 자동으로 해석(resolve)해줍니다. 따라서 컨트롤러 생성자에 필요로 하는 의존성 타입을 지정(타입힌트)하면, 서비스 컨테이너가 자동으로 주입해줍니다.

```
<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepository;

class UserController extends Controller
{
    /**
     * 유저 리포지토리 인스턴스.
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
#### 메서드 주입

생성자 주입 외에도 컨트롤러 메서드의 인자로 의존성을 타입힌트로 지정할 수 있습니다. 가장 일반적인 예로는, 컨트롤러 메서드에서 `Illuminate\Http\Request` 인스턴스를 주입받는 경우가 많습니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 새 사용자를 저장합니다.
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

컨트롤러 메서드에서 라우트 파라미터의 값도 함께 전달받아야 할 경우, 의존성 인자 뒤에 라우트 인수를 나열하면 됩니다. 예를 들어 라우트가 다음과 같이 정의되어 있다면,

```
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

컨트롤러 메서드에서 `Illuminate\Http\Request`와 함께 `id` 파라미터도 다음과 같이 받을 수 있습니다.

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 지정된 사용자를 업데이트합니다.
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