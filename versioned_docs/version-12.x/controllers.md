# 컨트롤러 (Controllers)

- [소개](#introduction)
- [컨트롤러 작성하기](#writing-controllers)
    - [기본 컨트롤러](#basic-controllers)
    - [단일 액션 컨트롤러](#single-action-controllers)
- [컨트롤러 미들웨어](#controller-middleware)
- [리소스 컨트롤러](#resource-controllers)
    - [일부 리소스 라우트만 등록하기](#restful-partial-resource-routes)
    - [중첩 리소스](#restful-nested-resources)
    - [리소스 라우트 이름 지정하기](#restful-naming-resource-routes)
    - [리소스 라우트의 파라미터 이름 설정하기](#restful-naming-resource-route-parameters)
    - [리소스 라우트 범위 지정하기](#restful-scoping-resource-routes)
    - [리소스 URI 현지화](#restful-localizing-resource-uris)
    - [리소스 컨트롤러 보완하기](#restful-supplementing-resource-controllers)
    - [싱글턴 리소스 컨트롤러](#singleton-resource-controllers)
- [의존성 주입과 컨트롤러](#dependency-injection-and-controllers)

<a name="introduction"></a>
## 소개

모든 요청 처리 로직을 라우트 파일에서 클로저로 정의하는 대신, "컨트롤러" 클래스를 사용해 코드를 체계적으로 정리할 수 있습니다. 컨트롤러는 관련 있는 요청 처리 로직을 하나의 클래스에 모을 수 있는 방법을 제공합니다. 예를 들어, `UserController` 클래스에서는 사용자와 관련된 모든 요청(조회, 생성, 수정, 삭제 등)을 한 곳에서 처리할 수 있습니다. 기본적으로 컨트롤러는 `app/Http/Controllers` 디렉터리에 저장됩니다.

<a name="writing-controllers"></a>
## 컨트롤러 작성하기

<a name="basic-controllers"></a>
### 기본 컨트롤러

새로운 컨트롤러를 빠르게 생성하려면, `make:controller` 아티즌 명령어를 사용할 수 있습니다. 애플리케이션의 모든 컨트롤러는 기본적으로 `app/Http/Controllers` 디렉터리에 저장됩니다:

```shell
php artisan make:controller UserController
```

기본 컨트롤러 예제를 살펴보겠습니다. 컨트롤러는 외부에서 접근 가능한(public) 메서드를 여러 개 가질 수 있으며, 각각의 메서드는 들어오는 HTTP 요청에 응답합니다:

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * 전달받은 사용자에 대한 프로필을 보여줍니다.
     */
    public function show(string $id): View
    {
        return view('user.profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

컨트롤러 클래스와 메서드를 작성했다면, 아래와 같이 해당 컨트롤러 메서드와 연결된 라우트를 정의합니다:

```php
use App\Http\Controllers\UserController;

Route::get('/user/{id}', [UserController::class, 'show']);
```

들어오는 요청이 해당 라우트 URI와 일치하면, `App\Http\Controllers\UserController` 클래스의 `show` 메서드가 호출되고 라우트 파라미터가 해당 메서드로 전달됩니다.

> [!NOTE]
> 컨트롤러는 반드시 상위(기본) 클래스를 상속할 필요는 없습니다. 하지만 여러 컨트롤러에서 공통적으로 사용해야 하는 메서드가 있다면, 그런 로직을 포함한 기본 컨트롤러를 상속하는 것이 편리할 수 있습니다.

<a name="single-action-controllers"></a>
### 단일 액션 컨트롤러

특히 복잡한 작업을 처리해야 하는 경우에는, 하나의 작업을 전담하는 별도의 컨트롤러 클래스를 만들면 편리합니다. 이때는 컨트롤러 안에 `__invoke`라는 단일 메서드만 정의합니다:

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

단일 액션 컨트롤러를 라우트에 등록할 때는, 컨트롤러의 메서드 이름을 명시하지 않고 컨트롤러 클래스 이름만 전달하면 됩니다:

```php
use App\Http\Controllers\ProvisionServer;

Route::post('/server', ProvisionServer::class);
```

`make:controller` 아티즌 명령어에 `--invokable` 옵션을 사용하면, 단일 액션 컨트롤러를 바로 생성할 수 있습니다:

```shell
php artisan make:controller ProvisionServer --invokable
```

> [!NOTE]
> 컨트롤러 스텁 파일은 [스텁 퍼블리싱](/docs/12.x/artisan#stub-customization) 기능을 통해 원하는 형태로 커스터마이즈할 수 있습니다.

<a name="controller-middleware"></a>
## 컨트롤러 미들웨어

[미들웨어](/docs/12.x/middleware)는 라우트 파일에서 컨트롤러 라우트에 할당할 수 있습니다:

```php
Route::get('/profile', [UserController::class, 'show'])->middleware('auth');
```

또는, 컨트롤러 클래스 안에서 미들웨어를 지정할 수도 있습니다. 이 경우, 컨트롤러에 `HasMiddleware` 인터페이스를 구현해야 하며, 이 인터페이스는 컨트롤러가 static `middleware` 메서드를 가져야 함을 의미합니다. 해당 메서드에서 컨트롤러의 액션에 적용할 미들웨어 목록을 배열로 반환할 수 있습니다:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class UserController extends Controller implements HasMiddleware
{
    /**
     * 컨트롤러에 할당할 미들웨어를 반환합니다.
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

또한, 클로저 형태로 인라인 미들웨어를 정의할 수도 있습니다. 이렇게 하면 별도의 미들웨어 클래스를 작성하지 않고도 간단하게 미들웨어를 구현할 수 있습니다:

```php
use Closure;
use Illuminate\Http\Request;

/**
 * 컨트롤러에 할당할 미들웨어를 반환합니다.
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
> `Illuminate\Routing\Controllers\HasMiddleware`를 구현하는 컨트롤러는 `Illuminate\Routing\Controller`를 확장하면 안 됩니다.

<a name="resource-controllers"></a>
## 리소스 컨트롤러

애플리케이션에서 각각의 Eloquent 모델을 "리소스"로 간주한다면, 보통 각 리소스에 대해 비슷한 방식의 작업(CRUD, 즉 생성, 읽기, 수정, 삭제 등)을 수행하게 됩니다. 예를 들어, `Photo` 모델과 `Movie` 모델이 있다면, 사용자들은 이러한 리소스를 생성, 조회, 수정, 삭제할 수 있을 것입니다.

이런 일반적인 상황을 쉽게 처리하기 위해 라라벨의 리소스 라우팅 기능은, 단 한 줄의 코드로 컨트롤러에 전형적인 생성, 조회, 수정, 삭제(CRUD) 라우트를 자동으로 할당해 줍니다. 우선, `make:controller` 아티즌 명령어의 `--resource` 옵션을 이용해 이런 작업을 담당할 컨트롤러를 빠르게 만들 수 있습니다:

```shell
php artisan make:controller PhotoController --resource
```

이 명령어는 `app/Http/Controllers/PhotoController.php`에 컨트롤러 파일을 생성하며, 리소스 작업에 해당하는 메서드들이 기본적으로 포함되어 있습니다. 그 다음, 아래와 같이 해당 컨트롤러를 가리키는 리소스 라우트를 등록합니다:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class);
```

이 한 줄로 다양한 작업에 대한 여러 라우트가 자동으로 생성됩니다. 이렇게 생성된 컨트롤러에는 각 작업별로 미리 준비된 메서드 스텁이 포함되어 있습니다. 참고로, 애플리케이션의 전체 라우트 목록은 `route:list` 아티즌 명령어로 쉽게 확인할 수 있습니다.

`resources` 메서드에 배열을 전달하면 여러 개의 리소스 컨트롤러를 한 번에 등록할 수도 있습니다:

```php
Route::resources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

<a name="actions-handled-by-resource-controllers"></a>
#### 리소스 컨트롤러가 처리하는 액션

<div class="overflow-auto">

| HTTP 메서드 | URI                        | 액션    | 라우트 이름         |
| ----------- | -------------------------  | ------- | ------------------- |
| GET         | `/photos`                  | index   | photos.index        |
| GET         | `/photos/create`           | create  | photos.create       |
| POST        | `/photos`                  | store   | photos.store        |
| GET         | `/photos/{photo}`          | show    | photos.show         |
| GET         | `/photos/{photo}/edit`     | edit    | photos.edit         |
| PUT/PATCH   | `/photos/{photo}`          | update  | photos.update       |
| DELETE      | `/photos/{photo}`          | destroy | photos.destroy      |

</div>

<a name="customizing-missing-model-behavior"></a>
#### 없는 모델에 대한 동작 커스터마이징

일반적으로, 암묵적으로 바인딩된 리소스 모델을 찾지 못하면 404 HTTP 응답이 발생합니다. 하지만, 리소스 라우트를 정의할 때 `missing` 메서드를 사용해 이 동작을 원하는 대로 변경할 수 있습니다. `missing` 메서드는 클로저를 인자로 받으며, 해당 리소스의 어떤 라우트에서도 암묵적으로 바인딩된 모델을 찾지 못할 때 실행됩니다:

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
#### 소프트 삭제된(soft deleted) 모델

기본적으로, 암묵적 모델 바인딩은 [소프트 삭제](/docs/12.x/eloquent#soft-deleting)된 모델을 조회하지 않으며, 모델을 찾지 못한 것으로 간주하고 404 HTTP 응답을 반환합니다. 하지만, 리소스 라우트에서 `withTrashed` 메서드를 호출하면 소프트 삭제된 모델까지 허용할 수 있습니다:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->withTrashed();
```

인자를 없이 `withTrashed`를 호출하면 `show`, `edit`, `update` 리소스 라우트에서 소프트 삭제된 모델을 허용합니다. 특정 라우트만 허용하고 싶다면 배열을 인자로 전달할 수 있습니다:

```php
Route::resource('photos', PhotoController::class)->withTrashed(['show']);
```

<a name="specifying-the-resource-model"></a>
#### 리소스 모델 지정하기

[라우트 모델 바인딩](/docs/12.x/routing#route-model-binding)을 활용하고, 리소스 컨트롤러의 메서드에서 모델 인스턴스를 타입-힌트(type-hint)로 받고 싶다면 컨트롤러 생성 시 `--model` 옵션을 사용할 수 있습니다:

```shell
php artisan make:controller PhotoController --model=Photo --resource
```

<a name="generating-form-requests"></a>
#### 폼 리퀘스트 클래스 생성하기

리소스 컨트롤러 생성 시 `--requests` 옵션을 추가하면, 컨트롤러의 `store` 및 `update` 메서드에 사용할 [폼 리퀘스트 클래스](/docs/12.x/validation#form-request-validation)도 함께 자동으로 생성할 수 있습니다:

```shell
php artisan make:controller PhotoController --model=Photo --resource --requests
```

<a name="restful-partial-resource-routes"></a>
### 일부 리소스 라우트만 등록하기

리소스 라우트를 선언할 때, 모든 기본 액션 대신 컨트롤러가 처리해야 할 특정 액션만 선택적으로 지정할 수 있습니다:

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

API에서 사용되는 리소스 라우트를 정의할 때는, 보통 HTML 템플릿을 출력하는 `create`와 `edit` 액션 라우트를 제외하고 싶을 때가 많습니다. 이를 위해 `apiResource` 메서드를 사용하면 두 액션이 자동으로 제외되어 편리합니다:

```php
use App\Http\Controllers\PhotoController;

Route::apiResource('photos', PhotoController::class);
```

여러 API 리소스 컨트롤러를 한 번에 등록하려면 `apiResources` 메서드에 배열을 전달할 수 있습니다:

```php
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\PostController;

Route::apiResources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

`make:controller` 명령어 실행 시 `--api` 옵션을 추가하면 `create`와 `edit` 메서드가 포함되지 않은 API 전용 리소스 컨트롤러를 빠르게 생성할 수 있습니다:

```shell
php artisan make:controller PhotoController --api
```

<a name="restful-nested-resources"></a>
### 중첩 리소스

경우에 따라 중첩된(nested) 리소스에 대한 라우트를 정의해야 할 때가 있습니다. 예를 들어, 한 사진(photo) 리소스에는 여러 개의 댓글(comment)이 달릴 수 있습니다. 이처럼 리소스 컨트롤러를 중첩하려면, 라우트 선언에서 "도트(.) 표기법"을 사용할 수 있습니다:

```php
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class);
```

이렇게 하면 다음과 같은 형태의 URI에서 중첩 리소스 접근이 가능해집니다:

```text
/photos/{photo}/comments/{comment}
```

<a name="scoping-nested-resources"></a>
#### 중첩 리소스 범위 지정하기

라라벨의 [암묵적 모델 바인딩](/docs/12.x/routing#implicit-model-binding-scoping) 기능은, 하위 리소스가 상위 리소스에 실제로 속해 있는지 자동으로 확인해주는 범위 지정(스코핑)이 가능합니다. 중첩된 리소스를 정의할 때 `scoped` 메서드를 사용하면 자동 스코핑뿐 아니라, 하위 리소스를 어떤 필드로 가져올지 지정할 수 있습니다. 자세한 사용법은 [리소스 라우트 범위 지정하기](#restful-scoping-resource-routes) 문서를 참고하세요.

<a name="shallow-nesting"></a>
#### 얕은 중첩(Shallow Nesting)

대부분 경우, URI에 부모와 자식의 ID를 모두 포함할 필요는 없습니다. 일반적으로 자식 ID 자체가 고유 식별자이기 때문입니다. URI 세그먼트에서 고유 식별자(예: 자동 증가 PK)를 사용하는 경우 "얕은 중첩(shallow nesting)"을 선택할 수 있습니다:

```php
use App\Http\Controllers\CommentController;

Route::resource('photos.comments', CommentController::class)->shallow();
```

이렇게 정의하면 다음과 같은 라우트들이 만들어집니다:

<div class="overflow-auto">

| HTTP 메서드 | URI                                | 액션    | 라우트 이름               |
| ----------- | ---------------------------------- | ------- | ------------------------ |
| GET         | `/photos/{photo}/comments`         | index   | photos.comments.index    |
| GET         | `/photos/{photo}/comments/create`  | create  | photos.comments.create   |
| POST        | `/photos/{photo}/comments`         | store   | photos.comments.store    |
| GET         | `/comments/{comment}`              | show    | comments.show            |
| GET         | `/comments/{comment}/edit`         | edit    | comments.edit            |
| PUT/PATCH   | `/comments/{comment}`              | update  | comments.update          |
| DELETE      | `/comments/{comment}`              | destroy | comments.destroy         |

</div>

<a name="restful-naming-resource-routes"></a>
### 리소스 라우트 이름 지정하기

기본적으로 모든 리소스 컨트롤러 액션에는 라우트 이름이 자동으로 부여됩니다. 하지만, 원한다면 `names` 배열을 통해 원하는 라우트 이름으로 덮어쓸 수도 있습니다:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->names([
    'create' => 'photos.build'
]);
```

<a name="restful-naming-resource-route-parameters"></a>
### 리소스 라우트의 파라미터 이름 설정하기

기본적으로 `Route::resource`는 리소스 이름에서 단수형을 만들어 라우트의 파라미터로 사용합니다. 하지만, 이 값을 직접 지정하려면 `parameters` 메서드를 사용할 수 있습니다. 이때, 연관 배열로 리소스 이름과 원하는 파라미터 이름을 전달해야 합니다:

```php
use App\Http\Controllers\AdminUserController;

Route::resource('users', AdminUserController::class)->parameters([
    'users' => 'admin_user'
]);
```

위 예시는 해당 리소스의 `show` 라우트로 아래와 같은 URI를 생성합니다:

```text
/users/{admin_user}
```

<a name="restful-scoping-resource-routes"></a>
### 리소스 라우트 범위 지정하기

라라벨의 [스코프된 암묵적 모델 바인딩](/docs/12.x/routing#implicit-model-binding-scoping) 기능을 활용해, 하위 리소스가 반드시 상위 리소스의 소유임을 자동으로 검증할 수 있습니다. 중첩 리소스 라우트를 정의할 때 `scoped` 메서드를 사용하면, 하위 리소스를 어떤 필드로 조회할지까지 지정할 수 있습니다:

```php
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class)->scoped([
    'comment' => 'slug',
]);
```

이렇게 하면 다음과 같은 URI로 접근할 수 있는 중첩 리소스가 등록됩니다:

```text
/photos/{photo}/comments/{comment:slug}
```

중첩 라우트 파라미터로 커스텀 키 암묵적 바인딩을 사용할 때, 라라벨은 해당 모델이 실제 부모(상위) 모델에 속한 것인지 자동으로 스코핑합니다. 이때, 상위 리소스(예: `Photo`) 모델에는 라우트 파라미터 이름의 복수형(`comments`)과 같은 이름을 가진 연관관계 메서드가 있다고 간주하여 쿼리를 구성합니다.

<a name="restful-localizing-resource-uris"></a>
### 리소스 URI 현지화

기본적으로 `Route::resource`는 영어 동사와 복수형 규칙에 따라 리소스 URI를 생성합니다. 만약 `create`와 `edit` 동작에 대해 현지화가 필요하다면 `Route::resourceVerbs` 메서드를 사용할 수 있습니다. 이 메서드는 애플리케이션의 `App\Providers\AppServiceProvider`의 `boot` 메서드 초반에 호출해주면 됩니다:

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

라라벨의 Pluralizer는 [여러 언어를 지원](/docs/12.x/localization#pluralization-language)하며, 필요에 따라 언어로 설정할 수 있습니다. 동사와 복수 규칙을 커스터마이즈한 후, 예를 들어 `Route::resource('publicacion', PublicacionController::class)`을 등록하면 다음과 같은 URI가 만들어집니다:

```text
/publicacion/crear

/publicacion/{publicaciones}/editar
```

<a name="restful-supplementing-resource-controllers"></a>
### 리소스 컨트롤러 보완하기

기본적으로 제공되는 리소스 라우트 외에 추가적인 라우트를 컨트롤러에 더하고 싶다면, 추가 라우트를 반드시 `Route::resource` 메서드 호출 **이전**에 선언해야 합니다. 만약 순서를 지키지 않으면, `resource` 메서드에서 생성된 라우트가 우선 적용되어 추가 라우트가 가려질 수 있습니다:

```php
use App\Http\Controller\PhotoController;

Route::get('/photos/popular', [PhotoController::class, 'popular']);
Route::resource('photos', PhotoController::class);
```

> [!NOTE]
> 컨트롤러는 될 수 있으면 한정된 역할에 집중하세요. 리소스 액션 이외의 메서드를 자주 추가하게 된다면, 컨트롤러를 더 작은 단위로 분할하는 것을 고려해 보시기 바랍니다.

<a name="singleton-resource-controllers"></a>
### 싱글턴 리소스 컨트롤러

애플리케이션 내에는 하나의 인스턴스만 존재하는 리소스를 다루는 경우가 있습니다. 예를 들어 사용자의 "프로필"은 생성 및 수정은 가능하지만, 한 명이 "프로필"을 여러 개 가질 수는 없습니다. 이미지의 "썸네일"도 하나만 존재할 수 있습니다. 이런 경우, 한 번에 오직 하나의 인스턴스만 유지되는 리소스를 "싱글턴 리소스"라고 부릅니다. 아래와 같이 "싱글턴" 리소스 컨트롤러를 등록할 수 있습니다:

```php
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::singleton('profile', ProfileController::class);
```

위의 싱글턴 리소스 정의는 아래와 같은 라우트를 등록합니다. 보시는 것처럼, 싱글턴 리소스에는 "생성" 라우트가 만들어지지 않으며, 자원 인식자(식별자)도 필요하지 않습니다(단일 인스턴스이기 때문):

<div class="overflow-auto">

| HTTP 메서드 | URI             | 액션   | 라우트 이름        |
| ----------- | --------------- | ------ | ------------------ |
| GET         | `/profile`      | show   | profile.show       |
| GET         | `/profile/edit` | edit   | profile.edit       |
| PUT/PATCH   | `/profile`      | update | profile.update     |

</div>

싱글턴 리소스는 표준(일반) 리소스의 하위로도 중첩 등록이 가능합니다:

```php
Route::singleton('photos.thumbnail', ThumbnailController::class);
```

이 예시에서는, `photos` 리소스에는 [기본 리소스 라우트](#actions-handled-by-resource-controllers)가 모두 생성되고, `thumbnail` 리소스는 싱글턴 리소스가 되어 다음과 같은 라우트만 생성됩니다:

<div class="overflow-auto">

| HTTP 메서드 | URI                              | 액션   | 라우트 이름                |
| ----------- | -------------------------------- | ------ | ------------------------- |
| GET         | `/photos/{photo}/thumbnail`      | show   | photos.thumbnail.show     |
| GET         | `/photos/{photo}/thumbnail/edit` | edit   | photos.thumbnail.edit     |
| PUT/PATCH   | `/photos/{photo}/thumbnail`      | update | photos.thumbnail.update   |

</div>

<a name="creatable-singleton-resources"></a>
#### 생성 가능한 싱글턴 리소스

가끔은, 싱글턴 리소스에도 "생성" 및 "저장(store)" 라우트를 정의해야 할 수 있습니다. 이 경우, 싱글턴 리소스 라우트 등록 시 `creatable` 메서드를 호출하면 됩니다:

```php
Route::singleton('photos.thumbnail', ThumbnailController::class)->creatable();
```

이렇게 하면 다음과 같은 라우트가 함께 등록됩니다. 또한, "생성 가능"한 싱글턴 리소스에는 `DELETE` 라우트도 생성됩니다:

<div class="overflow-auto">

| HTTP 메서드 | URI                                | 액션    | 라우트 이름                   |
| ----------- | ---------------------------------- | ------- | ---------------------------- |
| GET         | `/photos/{photo}/thumbnail/create` | create  | photos.thumbnail.create      |
| POST        | `/photos/{photo}/thumbnail`        | store   | photos.thumbnail.store       |
| GET         | `/photos/{photo}/thumbnail`        | show    | photos.thumbnail.show        |
| GET         | `/photos/{photo}/thumbnail/edit`   | edit    | photos.thumbnail.edit        |
| PUT/PATCH   | `/photos/{photo}/thumbnail`        | update  | photos.thumbnail.update      |
| DELETE      | `/photos/{photo}/thumbnail`        | destroy | photos.thumbnail.destroy     |

</div>

생성 및 저장 라우트는 필요 없고, 싱글턴 리소스에 대해 `DELETE` 라우트만 추가하고 싶다면 `destroyable` 메서드를 사용할 수 있습니다:

```php
Route::singleton(...)->destroyable();
```

<a name="api-singleton-resources"></a>
#### API 싱글턴 리소스

싱글턴 리소스를 API에서 사용할 때는 `create` 및 `edit` 라우트가 불필요합니다. 이 경우 `apiSingleton` 메서드를 사용하여 등록하면 됩니다:

```php
Route::apiSingleton('profile', ProfileController::class);
```

물론, API 싱글턴 리소스도 `creatable`로 등록하면 `store` 및 `destroy` 라우트가 추가 생성됩니다:

```php
Route::apiSingleton('photos.thumbnail', ProfileController::class)->creatable();
```

<a name="dependency-injection-and-controllers"></a>
## 의존성 주입과 컨트롤러

<a name="constructor-injection"></a>
#### 생성자(컨스트럭터) 주입하기

라라벨의 [서비스 컨테이너](/docs/12.x/container)는 모든 컨트롤러를 인스턴스화할 때 사용됩니다. 따라서, 컨트롤러의 생성자에 타입-힌트로 의존성이 선언되어 있다면 자동으로 해결되어(주입되어) 컨트롤러 인스턴스로 전달됩니다:

```php
<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepository;

class UserController extends Controller
{
    /**
     * 새 컨트롤러 인스턴스 생성.
     */
    public function __construct(
        protected UserRepository $users,
    ) {}
}
```

<a name="method-injection"></a>
#### 메서드 주입하기

생성자 주입 외에도, 컨트롤러 메서드에서 직접 의존성을 타입-힌트로 받을 수도 있습니다. 예를 들어 컨트롤러 메서드에서 `Illuminate\Http\Request` 인스턴스를 주입받아 사용하는 것이 일반적입니다:

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

        // 사용자 저장 ...

        return redirect('/users');
    }
}
```

컨트롤러 메서드에서 라우트 파라미터도 함께 입력 받아야 한다면, 의존성 인자 뒤에 라우트 파라미터를 나열하면 됩니다. 예를 들어 라우트가 아래와 같이 정의되어 있는 경우:

```php
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

메서드에서 `Illuminate\Http\Request`에 이어 `id` 파라미터를 아래처럼 받을 수 있습니다:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * 전달받은 사용자를 업데이트합니다.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        // 사용자 업데이트 ...

        return redirect('/users');
    }
}
```