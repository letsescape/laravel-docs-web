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
    - [리소스 컨트롤러 보충](#restful-supplementing-resource-controllers)
    - [싱글턴 리소스 컨트롤러](#singleton-resource-controllers)
- [의존성 주입과 컨트롤러](#dependency-injection-and-controllers)

<a name="introduction"></a>
## 소개

모든 요청 처리 로직을 라우트 파일에 클로저로 직접 작성하는 대신, 이 동작을 "컨트롤러" 클래스에 정리할 수 있습니다. 컨트롤러를 사용하면 관련된 요청 처리 로직을 하나의 클래스로 그룹화할 수 있습니다. 예를 들어, `UserController` 클래스는 사용자와 관련된 모든 요청(조회, 생성, 수정, 삭제 등)을 처리하도록 만들 수 있습니다. 기본적으로 컨트롤러 파일은 `app/Http/Controllers` 디렉토리에 저장됩니다.

<a name="writing-controllers"></a>
## 컨트롤러 작성

<a name="basic-controllers"></a>
### 기본 컨트롤러

새 컨트롤러를 빠르게 생성하려면 `make:controller` 아티즌(Artisan) 명령어를 사용할 수 있습니다. 기본적으로 애플리케이션의 모든 컨트롤러는 `app/Http/Controllers` 디렉토리에 저장됩니다:

```shell
php artisan make:controller UserController
```

기본적인 컨트롤러의 예제를 살펴보겠습니다. 컨트롤러는 요청을 처리할 공개(public) 메서드를 원하는 만큼 가질 수 있으며, 각각 HTTP 요청에 응답하게 됩니다.

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

컨트롤러 클래스와 메서드를 작성한 후에는, 아래와 같이 해당 컨트롤러 메서드로 라우트를 지정할 수 있습니다.

```
use App\Http\Controllers\UserController;

Route::get('/user/{id}', [UserController::class, 'show']);
```

요청이 지정한 URI 라우트와 일치하면, `App\Http\Controllers\UserController` 클래스의 `show` 메서드가 호출되며, 라우트 파라미터가 해당 메서드에 전달됩니다.

> [!NOTE]
> 컨트롤러가 반드시 특정 베이스 클래스를 상속해야 하는 것은 아닙니다. 그러나 베이스 클래스를 상속하지 않으면 `middleware`, `authorize`와 같은 편리한 기능을 사용할 수 없습니다.

<a name="single-action-controllers"></a>
### 단일 액션 컨트롤러

특정 컨트롤러 액션이 매우 복잡하다면, 하나의 컨트롤러 클래스를 해당 액션만을 위해 전담시키는 것도 좋은 방법입니다. 이를 위해 컨트롤러 내에 `__invoke`라는 단일 메서드만 정의하면 됩니다.

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

단일 액션 컨트롤러를 라우트에 등록할 때는 컨트롤러 메서드를 명시하지 않고, 컨트롤러 클래스명만 전달해주면 됩니다.

```
use App\Http\Controllers\ProvisionServer;

Route::post('/server', ProvisionServer::class);
```

`make:controller` 아티즌 명령어에서 `--invokable` 옵션을 사용하면, 단일 액션 컨트롤러(즉, `__invoke` 메서드만 갖는 컨트롤러)를 빠르게 생성할 수 있습니다.

```shell
php artisan make:controller ProvisionServer --invokable
```

> [!NOTE]
> 컨트롤러 스텁 파일은 [stub 게시](/docs/10.x/artisan#stub-customization) 기능을 통해 커스텀할 수 있습니다.

<a name="controller-middleware"></a>
## 컨트롤러 미들웨어

[미들웨어](/docs/10.x/middleware)는 라우트 파일에서 컨트롤러의 라우트에 직접 할당할 수 있습니다.

```
Route::get('profile', [UserController::class, 'show'])->middleware('auth');
```

또는 컨트롤러의 생성자에서 미들웨어를 지정해주는 것도 편리합니다. 생성자 내에서 `middleware` 메서드를 사용하면 컨트롤러의 특정 액션에 미들웨어를 지정할 수 있습니다.

```
class UserController extends Controller
{
    /**
     * Instantiate a new controller instance.
     */
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('log')->only('index');
        $this->middleware('subscribed')->except('store');
    }
}
```

컨트롤러에서는 미들웨어를 클로저(익명 함수) 형태로 간편하게 등록할 수도 있습니다. 이를 통해, 별도의 미들웨어 클래스를 만들지 않고 컨트롤러 하나에만 적용되는 인라인 미들웨어를 정의할 수 있습니다.

```
use Closure;
use Illuminate\Http\Request;

$this->middleware(function (Request $request, Closure $next) {
    return $next($request);
});
```

<a name="resource-controllers"></a>
## 리소스 컨트롤러

애플리케이션의 각 Eloquent 모델을 "리소스"로 생각할 때, 보통 각 리소스에 대해 동일한 동작(생성, 조회, 수정, 삭제 등)을 반복해서 수행하게 됩니다. 예를 들어, 애플리케이션에 `Photo` 모델과 `Movie` 모델이 있다면, 사용자들은 이 리소스들을 생성, 읽기, 수정, 삭제할 가능성이 높습니다.

이런 흔한 상황을 위해, 라라벨 리소스 라우팅은 리소스에 대한 일반적인 CRUD(생성, 읽기, 수정, 삭제) 라우트를 한 줄의 코드로 컨트롤러에 할당해줍니다. 먼저, `make:controller` 아티즌 명령어의 `--resource` 옵션을 사용해, 이런 동작을 처리할 컨트롤러를 빠르게 생성할 수 있습니다:

```shell
php artisan make:controller PhotoController --resource
```

이 명령어는 `app/Http/Controllers/PhotoController.php` 위치에 컨트롤러 파일을 생성합니다. 컨트롤러에는 각 리소스 작업에 맞는 메서드가 이미 포함되어 생성됩니다. 이후에는, 컨트롤러로 연결되는 리소스 라우트를 다음과 같이 등록할 수 있습니다.

```
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class);
```

이 단 한 줄의 라우트 선언으로, 해당 리소스에 대해 다양한 동작을 처리하는 여러 개의 라우트가 한 번에 생성됩니다. 생성된 컨트롤러는 이 모든 동작을 위한 스텁 메서드를 이미 가지고 있습니다. 참고로, 아티즌의 `route:list` 명령어로 애플리케이션의 라우트 구조를 빠르게 확인할 수 있습니다.

여러 개의 리소스 컨트롤러를 한 번에 등록하고 싶을 때는 `resources` 메서드에 배열을 전달하면 됩니다.

```
Route::resources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

<a name="actions-handled-by-resource-controllers"></a>
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
#### 모델 누락 시 동작 커스터마이즈

일반적으로, 암묵적으로 바인딩된 리소스 모델을 찾지 못하면 404 HTTP 응답이 반환됩니다. 하지만, 리소스 라우트를 정의할 때 `missing` 메서드를 호출해 이 동작을 원하는 대로 정의할 수 있습니다. `missing` 메서드는 클로저를 받으며, 리소스의 어떤 라우트에서든 암묵적으로 바인딩된 모델을 찾을 수 없는 경우 호출됩니다.

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

기본적으로 암묵적 모델 바인딩은 [소프트 삭제](/docs/10.x/eloquent#soft-deleting)된 모델을 조회하지 않으며, 이런 경우에도 404 HTTP 응답을 반환합니다. 그러나, 라우트 정의 시에 `withTrashed` 메서드를 호출하면 소프트 삭제된 모델도 허용할 수 있습니다.

```
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->withTrashed();
```

특정 라우트에서만 소프트 삭제 모델을 허용하고 싶다면, `withTrashed` 메서드에 라우트 액션 이름 배열을 전달하면 됩니다.

```
Route::resource('photos', PhotoController::class)->withTrashed(['show']);
```

<a name="specifying-the-resource-model"></a>
#### 리소스 모델 지정

[라우트 모델 바인딩](/docs/10.x/routing#route-model-binding)을 사용할 때, 리소스 컨트롤러의 메서드가 모델 인스턴스를 타입힌트로 받을 수 있도록 하려면, 컨트롤러를 생성할 때 `--model` 옵션을 사용할 수 있습니다.

```shell
php artisan make:controller PhotoController --model=Photo --resource
```

<a name="generating-form-requests"></a>
#### 폼 리퀘스트 생성

리소스 컨트롤러를 생성하면서 `--requests` 옵션을 추가하면, 컨트롤러의 저장 및 수정 메서드를 위한 [폼 리퀘스트 클래스](/docs/10.x/validation#form-request-validation)도 함께 생성해줍니다.

```shell
php artisan make:controller PhotoController --model=Photo --resource --requests
```

<a name="restful-partial-resource-routes"></a>
### 부분 리소스 라우트

리소스 라우트를 선언할 때, 컨트롤러가 기본 제공되는 전체 액션 집합이 아니라 일부 액션만 처리하도록 지정할 수도 있습니다.

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

API에서 사용할 리소스 라우트의 경우, 보통 HTML 템플릿을 제공하는 `create`와 `edit` 라우트가 불필요합니다. 이럴 때는 `apiResource` 메서드를 사용하면 이 두 라우트를 자동으로 제외할 수 있습니다.

```
use App\Http\Controllers\PhotoController;

Route::apiResource('photos', PhotoController::class);
```

여러 개의 API 리소스 컨트롤러를 한 번에 등록하려면 `apiResources` 메서드에 배열로 전달하세요.

```
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\PostController;

Route::apiResources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

`make:controller` 명령을 실행할 때 `--api` 옵션을 주면, `create` 또는 `edit` 메서드 없이 API 용 리소스 컨트롤러를 빠르게 생성할 수 있습니다.

```shell
php artisan make:controller PhotoController --api
```

<a name="restful-nested-resources"></a>
### 중첩 리소스

때로는 중첩된 리소스에 대한 라우트를 정의해야 할 때가 있습니다. 예를 들어, 사진 하나에 여러 개의 댓글이 달릴 수 있습니다. 이런 경우, 라우트 선언에 "닷(dot) 표기법"을 사용해 중첩 리소스 컨트롤러를 지정할 수 있습니다.

```
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class);
```

이렇게 하면 다음과 같은 형태의 URI를 통한 중첩 리소스 접근이 가능합니다.

```
/photos/{photo}/comments/{comment}
```

<a name="scoping-nested-resources"></a>
#### 중첩 리소스 스코핑

라라벨의 [암묵적 모델 바인딩의 스코핑](/docs/10.x/routing#implicit-model-binding-scoping) 기능을 사용하면, 자식 모델이 지정된 부모 모델에 속하는지 자동으로 확인하고 바인딩할 수 있습니다. 중첩 리소스를 정의할 때 `scoped` 메서드를 사용하면 자동 스코핑을 활성화할 수 있고, 어떤 필드로 자식 리소스를 조회할지도 지정할 수 있습니다. 자세한 방법은 [리소스 라우트 스코핑](#restful-scoping-resource-routes) 문서를 참고하세요.

<a name="shallow-nesting"></a>
#### 단순(Shallow) 중첩

대부분의 경우, URI 내에 부모 ID와 자식 ID를 모두 포함하는 것까지 필요하지 않습니다. 자식 ID(예: 자동 증가 기본키)만으로도 모델을 고유하게 식별할 수 있다면 "단순 중첩(shallow nesting)"을 사용할 수 있습니다.

```
use App\Http\Controllers\CommentController;

Route::resource('photos.comments', CommentController::class)->shallow();
```

이렇게 정의하면 다음과 같은 라우트가 생성됩니다.

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

기본적으로, 모든 리소스 컨트롤러 액션은 라우트 이름이 자동으로 지정됩니다. 하지만 `names` 배열을 전달해 원하는 대로 이름을 재정의할 수 있습니다.

```
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->names([
    'create' => 'photos.build'
]);
```

<a name="restful-naming-resource-route-parameters"></a>
### 리소스 라우트 파라미터 이름 지정

기본적으로 `Route::resource`는 리소스 이름의 "단수형"을 기준으로 라우트 파라미터를 생성합니다. 이를 리소스별로 쉽게 변경할 수 있으며, `parameters` 메서드로 전달하는 배열은 리소스명과 원하는 파라미터명을 대응시키는 연관 배열이어야 합니다.

```
use App\Http\Controllers\AdminUserController;

Route::resource('users', AdminUserController::class)->parameters([
    'users' => 'admin_user'
]);
```

 위 예시는 해당 리소스의 `show` 라우트를 다음과 같은 URI로 만듭니다:

```
/users/{admin_user}
```

<a name="restful-scoping-resource-routes"></a>
### 리소스 라우트 스코핑

라라벨의 [스코프 암묵적 모델 바인딩](/docs/10.x/routing#implicit-model-binding-scoping) 기능은, 자식 모델이 지정된 부모 모델에 속하는지 자동으로 확인하는 역할을 합니다. 중첩 리소스를 정의할 때 `scoped` 메서드를 사용하면 이 자동 스코핑이 활성화되고, 자식 리소스를 어떤 필드로 검색할 지도 설정할 수 있습니다.

```
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class)->scoped([
    'comment' => 'slug',
]);
```

이 라우트는 다음의 URI 형태로 스코프된 중첩 리소스를 등록합니다.

```
/photos/{photo}/comments/{comment:slug}
```

중첩 라우트 파라미터로 커스텀 키를 사용하는 암시적 바인딩의 경우에도, 라라벨은 부모 모델에 연결된 자식 모델만 검색하도록 쿼리를 자동으로 스코프합니다. 이때, 예시의 경우 `Photo` 모델에 `comments`(파라미터 이름의 복수형)라는 연관관계가 있다고 가정하고 해당 관계를 사용해 `Comment` 모델을 조회합니다.

<a name="restful-localizing-resource-uris"></a>
### 리소스 URI 현지화

기본적으로 `Route::resource`는 영어 동사, 영어 복수화 규칙을 사용해 리소스 URI를 생성합니다. `create`와 `edit` 등 액션에 사용되는 동사만 현지화(다른 언어로 변경)하려면, 애플리케이션의 `App\Providers\RouteServiceProvider` 클래스의 `boot` 메서드에서 `Route::resourceVerbs` 메서드를 사용하면 됩니다.

```
/**
 * Define your route model bindings, pattern filters, etc.
 */
public function boot(): void
{
    Route::resourceVerbs([
        'create' => 'crear',
        'edit' => 'editar',
    ]);

    // ...
}
```

라라벨의 복수화(pluralizer) 기능은 [여러 언어를 지원](/docs/10.x/localization#pluralization-language)하며, 필요에 따라 설정할 수 있습니다. 동사 및 복수화 언어를 변경하면, 아래와 같이 리소스 라우트 등록시 URI가 바뀝니다.

```
/publicacion/crear

/publicacion/{publicaciones}/editar
```

<a name="restful-supplementing-resource-controllers"></a>
### 리소스 컨트롤러 보충

기본 리소스 라우트 외에 특정 컨트롤러에 추가적인 라우트를 등록하려면, 반드시 `Route::resource`를 호출하기 전에 추가 라우트를 먼저 정의해야 합니다. 그렇지 않으면, `resource` 메서드가 만드는 라우트가 보충 라우트를 덮어쓸 수 있습니다.

```
use App\Http\Controller\PhotoController;

Route::get('/photos/popular', [PhotoController::class, 'popular']);
Route::resource('photos', PhotoController::class);
```

> [!NOTE]
> 컨트롤러는 한 가지 목적에 집중되게 작성하는 것이 좋습니다. 자주 추가적인 메서드가 필요하다면, 컨트롤러를 두 개 이상의 작은 컨트롤러로 나누는 것도 고려하세요.

<a name="singleton-resource-controllers"></a>
### 싱글턴 리소스 컨트롤러

때때로, 애플리케이션 내에는 한 인스턴스만 존재할 수 있는 리소스가 있습니다. 예를 들어, 사용자의 "프로필"은 한 명의 사용자마다 하나만 존재하며, 이미지의 "썸네일(Thumbnail)" 리소스도 마찬가지입니다. 이렇게 반드시 하나만 존재하는 리소스를 "싱글턴(Singleton) 리소스"라고 하며, 이 경우에는 "싱글턴 리소스 컨트롤러"를 등록할 수 있습니다.

```php
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::singleton('profile', ProfileController::class);
```

위의 싱글턴 리소스 라우트 정의는 다음과 같은 라우트를 등록합니다. 보시다시피, 생성용(create) 라우트는 등록되지 않고, 단순히 인스턴스 하나만 표시/수정/업데이트만 가능합니다(식별자 파라미터 없음).

Verb      | URI                               | 액션         | 라우트 이름
----------|-----------------------------------|--------------|---------------------
GET       | `/profile`                        | show         | profile.show
GET       | `/profile/edit`                   | edit         | profile.edit
PUT/PATCH | `/profile`                        | update       | profile.update

싱글턴 리소스는 표준 리소스 내부에 중첩해서 등록할 수도 있습니다.

```php
Route::singleton('photos.thumbnail', ThumbnailController::class);
```

이 예제에서는 `photos` 리소스는 [표준 리소스 라우트](#actions-handled-by-resource-controller)를 모두 갖지만, `thumbnail` 리소스는 다음과 같이 싱글턴 리소스로 등록됩니다.

| Verb      | URI                              | 액션    | 라우트 이름               |
|-----------|----------------------------------|---------|--------------------------|
| GET       | `/photos/{photo}/thumbnail`      | show    | photos.thumbnail.show    |
| GET       | `/photos/{photo}/thumbnail/edit` | edit    | photos.thumbnail.edit    |
| PUT/PATCH | `/photos/{photo}/thumbnail`      | update  | photos.thumbnail.update  |

<a name="creatable-singleton-resources"></a>
#### 생성 가능한 싱글턴 리소스

때로는 싱글턴 리소스에 대해 생성 및 저장 라우트까지 정의하고 싶을 수 있습니다. 이럴 때는 싱글턴 리소스 등록 시 `creatable` 메서드를 덧붙여 주면 됩니다.

```php
Route::singleton('photos.thumbnail', ThumbnailController::class)->creatable();
```

이렇게 하면, 아래와 같이 `DELETE` 라우트도 포함해 더 많은 라우트가 등록됩니다.

| Verb      | URI                                | 액션    | 라우트 이름               |
|-----------|------------------------------------|---------|--------------------------|
| GET       | `/photos/{photo}/thumbnail/create` | create  | photos.thumbnail.create  |
| POST      | `/photos/{photo}/thumbnail`        | store   | photos.thumbnail.store   |
| GET       | `/photos/{photo}/thumbnail`        | show    | photos.thumbnail.show    |
| GET       | `/photos/{photo}/thumbnail/edit`   | edit    | photos.thumbnail.edit    |
| PUT/PATCH | `/photos/{photo}/thumbnail`        | update  | photos.thumbnail.update  |
| DELETE    | `/photos/{photo}/thumbnail`        | destroy | photos.thumbnail.destroy |

싱글턴 리소스에 대해 `DELETE` 라우트만 등록하고 싶고, 생성이나 저장 라우트는 굳이 필요 없으면, `destroyable` 메서드를 사용할 수 있습니다.

```php
Route::singleton(...)->destroyable();
```

<a name="api-singleton-resources"></a>
#### API 싱글턴 리소스

`apiSingleton` 메서드는 API를 통해 제어할 싱글턴 리소스를 등록할 때 사용할 수 있으며, 이 경우에는 `create`, `edit` 라우트가 포함되지 않습니다.

```php
Route::apiSingleton('profile', ProfileController::class);
```

API 싱글턴 리소스 역시 `creatable` 메서드를 추가해주면 `store`와 `destroy` 라우트까지 등록할 수 있습니다.

```php
Route::apiSingleton('photos.thumbnail', ProfileController::class)->creatable();
```

<a name="dependency-injection-and-controllers"></a>
## 의존성 주입과 컨트롤러

<a name="constructor-injection"></a>
#### 생성자 주입

라라벨의 [서비스 컨테이너](/docs/10.x/container)는 모든 컨트롤러를 해결(resolve)하는 데 사용됩니다. 덕분에, 컨트롤러의 생성자에서 필요한 의존성을 타입힌트로 선언해주면, 자동으로 인스턴스가 주입됩니다.

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

생성자 주입 외에도, 컨트롤러의 메서드에서 필요한 의존성을 타입힌트로 선언해 메서드 주입을 사용할 수 있습니다. 가장 대표적인 예시가 `Illuminate\Http\Request` 인스턴스를 컨트롤러 메서드에 주입하는 경우입니다.

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

컨트롤러 메서드에서 라우트 파라미터 값을 함께 받아야 한다면, 의존성 인자 다음에 라우트 파라미터 인수를 위치시키면 됩니다. 예를 들어, 다음과 같이 라우트가 정의되어 있다면,

```
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

아래와 같이 `Illuminate\Http\Request`와 라우트 파라미터인 `id`를 함께 컨트롤러 메서드에서 받을 수 있습니다.

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
