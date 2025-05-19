# 라우팅 (Routing)

- [기본 라우팅](#basic-routing)
    - [리디렉션 라우트](#redirect-routes)
    - [뷰 라우트](#view-routes)
- [라우트 파라미터](#route-parameters)
    - [필수 파라미터](#required-parameters)
    - [선택적 파라미터](#parameters-optional-parameters)
    - [정규식 제약조건](#parameters-regular-expression-constraints)
- [네임드 라우트](#named-routes)
- [라우트 그룹](#route-groups)
    - [미들웨어](#route-group-middleware)
    - [컨트롤러](#route-group-controllers)
    - [서브도메인 라우팅](#route-group-subdomain-routing)
    - [라우트 프리픽스](#route-group-prefixes)
    - [라우트 이름 프리픽스](#route-group-name-prefixes)
- [라우트 모델 바인딩](#route-model-binding)
    - [암묵적 바인딩](#implicit-binding)
    - [명시적 바인딩](#explicit-binding)
- [폴백 라우트](#fallback-routes)
- [요청 제한 (Rate Limiting)](#rate-limiting)
    - [요청 제한자 정의](#defining-rate-limiters)
    - [라우트에 요청 제한자 적용](#attaching-rate-limiters-to-routes)
- [폼 메서드 속이기](#form-method-spoofing)
- [현재 라우트 정보 접근](#accessing-the-current-route)
- [교차 출처 리소스 공유(CORS)](#cors)
- [라우트 캐싱](#route-caching)

<a name="basic-routing"></a>
## 기본 라우팅

라라벨에서 가장 기본적인 라우트는 URI와 클로저(익명 함수)를 받아, 복잡한 라우팅 설정 파일 없이도 매우 간단하고 직관적으로 라우트와 동작을 정의할 수 있도록 해줍니다.

```
use Illuminate\Support\Facades\Route;

Route::get('/greeting', function () {
    return 'Hello World';
});
```

<a name="the-default-route-files"></a>
#### 기본 라우트 파일

모든 라라벨 라우트는 `routes` 디렉토리 내의 라우트 파일에 정의됩니다. 이 파일들은 애플리케이션의 `App\Providers\RouteServiceProvider`에 의해 자동으로 로드됩니다. `routes/web.php` 파일은 웹 인터페이스를 위한 라우트를 정의하며, 이 파일의 라우트는 세션 상태, CSRF 보호와 같은 기능을 제공하는 `web` 미들웨어 그룹이 할당됩니다. 반면, `routes/api.php`의 라우트는 상태를 보관하지 않으며, `api` 미들웨어 그룹이 할당됩니다.

대부분의 애플리케이션에서는 `routes/web.php` 파일에 라우트 정의를 시작합니다. 여기에 정의된 라우트는 브라우저에서 해당 URL로 접속하여 접근할 수 있습니다. 예를 들어, 아래 라우트는 브라우저에서 `http://example.com/user`로 접속하면 동작합니다.

```
use App\Http\Controllers\UserController;

Route::get('/user', [UserController::class, 'index']);
```

`routes/api.php` 파일에 정의된 라우트는 `RouteServiceProvider`에 의해 라우트 그룹 내부에 중첩됩니다. 이 그룹 내에서는 `/api` URI 프리픽스가 자동으로 적용되므로, 파일 내의 모든 라우트에 별도로 프리픽스를 붙일 필요가 없습니다. 프리픽스 및 기타 라우트 그룹 옵션은 `RouteServiceProvider` 클래스를 수정하여 변경할 수 있습니다.

<a name="available-router-methods"></a>
#### 사용 가능한 라우터 메서드

라우터에서는 모든 HTTP 메서드에 대응하는 라우트를 등록할 수 있습니다.

```
Route::get($uri, $callback);
Route::post($uri, $callback);
Route::put($uri, $callback);
Route::patch($uri, $callback);
Route::delete($uri, $callback);
Route::options($uri, $callback);
```

여러 HTTP 메서드에 동시에 반응하는 라우트를 등록해야 할 때는 `match` 메서드를 사용할 수 있고, 모든 HTTP 메서드에 반응하도록 하려면 `any` 메서드를 사용할 수 있습니다.

```
Route::match(['get', 'post'], '/', function () {
    //
});

Route::any('/', function () {
    //
});
```

> [!TIP]
> 동일한 URI에 여러 라우트를 정의할 때, `get`, `post`, `put`, `patch`, `delete`, `options` 메서드를 사용하는 라우트를 `any`, `match`, `redirect` 메서드를 사용하는 라우트보다 먼저 정의해야 올바른 라우트에 요청이 매칭됩니다.

<a name="dependency-injection"></a>
#### 의존성 주입

라우트의 콜백 시그니처에서 필요한 의존성(디펜던시)을 타입힌트로 지정하면, 라라벨 [서비스 컨테이너](/docs/8.x/container)가 자동으로 해당 의존성을 해결하여 콜백에 주입합니다. 예를 들어, `Illuminate\Http\Request` 클래스를 타입힌트로 지정하면 현재 HTTP 요청 객체가 자동으로 라우트 콜백에 주입됩니다.

```
use Illuminate\Http\Request;

Route::get('/users', function (Request $request) {
    // ...
});
```

<a name="csrf-protection"></a>
#### CSRF 보호

`web` 라우트 파일에 정의된 `POST`, `PUT`, `PATCH`, `DELETE` 방식의 라우트로 동작하는 모든 HTML 양식에는 반드시 CSRF 토큰 필드를 포함해야 하며, 그렇지 않으면 요청이 거부됩니다. CSRF 보호에 대한 자세한 내용은 [CSRF 문서](/docs/8.x/csrf)에서 확인할 수 있습니다.

```
<form method="POST" action="/profile">
    @csrf
    ...
</form>
```

<a name="redirect-routes"></a>
### 리디렉션 라우트

다른 URI로 리디렉션하는 라우트를 정의하려면 `Route::redirect` 메서드를 사용할 수 있습니다. 이 메서드는 단순한 리디렉션을 위해 전체 라우트나 컨트롤러를 별도로 정의하지 않아도 되는 간편한 방법입니다.

```
Route::redirect('/here', '/there');
```

`Route::redirect`는 기본적으로 `302` 상태 코드를 반환합니다. 세 번째 매개변수로 상태 코드를 직접 지정할 수도 있습니다.

```
Route::redirect('/here', '/there', 301);
```

또는, `Route::permanentRedirect` 메서드를 사용하면 항상 `301` 상태 코드를 반환하도록 할 수 있습니다.

```
Route::permanentRedirect('/here', '/there');
```

> [!NOTE]
> 리디렉션 라우트에서 라우트 파라미터를 사용할 때, `destination`과 `status`라는 파라미터 이름은 라라벨에서 예약되어 있어 사용할 수 없습니다.

<a name="view-routes"></a>
### 뷰 라우트

라우트에서 단순히 [뷰](/docs/8.x/views)를 반환하면 되는 경우, `Route::view` 메서드를 사용할 수 있습니다. 이 메서드는 전체 라우트나 컨트롤러를 정의하지 않고도 간단하게 뷰를 반환할 수 있도록 해줍니다. 첫 번째 인자는 URI, 두 번째 인자는 뷰 이름이며, 세 번째(선택) 인자로 뷰에 전달할 데이터를 배열로 넘길 수 있습니다.

```
Route::view('/welcome', 'welcome');

Route::view('/welcome', 'welcome', ['name' => 'Taylor']);
```

> [!NOTE]
> 뷰 라우트에서 파라미터를 사용할 경우, `view`, `data`, `status`, `headers`라는 파라미터 이름은 라라벨에서 예약되어 있어 사용할 수 없습니다.

<a name="route-parameters"></a>
## 라우트 파라미터

<a name="required-parameters"></a>
### 필수 파라미터

때로는 URI의 일부 세그먼트를 라우팅에서 받아와야 할 때가 있습니다. 예를 들어, URL에서 사용자의 ID를 받아와야 한다면 아래와 같이 라우트 파라미터를 정의할 수 있습니다.

```
Route::get('/user/{id}', function ($id) {
    return 'User '.$id;
});
```

라우트에서는 필요한 만큼 파라미터를 정의할 수 있습니다.

```
Route::get('/posts/{post}/comments/{comment}', function ($postId, $commentId) {
    //
});
```

라우트 파라미터는 항상 `{}` 중괄호로 감싸며, 알파벳 문자로 구성하는 것이 좋습니다. 파라미터 이름에 밑줄(`_`)도 사용할 수 있습니다. 라우트 콜백/컨트롤러에 파라미터가 주입되는 순서는 정의된 라우트 파라미터의 순서에 따릅니다. 파라미터 변수명은 일치하지 않아도 순서대로 주입됩니다.

<a name="parameters-and-dependency-injection"></a>
#### 파라미터와 의존성 주입

라우트에서 서비스 컨테이너로 자동 의존성 주입이 필요한 경우, 라우트 파라미터는 의존성 뒤에 나열해야 합니다.

```
use Illuminate\Http\Request;

Route::get('/user/{id}', function (Request $request, $id) {
    return 'User '.$id;
});
```

<a name="parameters-optional-parameters"></a>
### 선택적 파라미터

때로는 라우트 파라미터가 항상 URI에 존재하지 않도록 하고 싶을 수 있습니다. 이럴 때는 파라미터 이름 뒤에 `?`를 붙이면 됩니다. 또한, 해당 변수를 받는 인자에 기본값을 지정해야 합니다.

```
Route::get('/user/{name?}', function ($name = null) {
    return $name;
});

Route::get('/user/{name?}', function ($name = 'John') {
    return $name;
});
```

<a name="parameters-regular-expression-constraints"></a>
### 정규식 제약조건

라우트 인스턴스의 `where` 메서드를 이용해서 라우트 파라미터의 형식을 정규식으로 제한할 수 있습니다. 이 메서드는 파라미터 이름과, 파라미터를 제한할 정규식을 인자로 받습니다.

```
Route::get('/user/{name}', function ($name) {
    //
})->where('name', '[A-Za-z]+');

Route::get('/user/{id}', function ($id) {
    //
})->where('id', '[0-9]+');

Route::get('/user/{id}/{name}', function ($id, $name) {
    //
})->where(['id' => '[0-9]+', 'name' => '[a-z]+']);
```

자주 쓰이는 정규식 패턴을 위해 라우트에는 여러 헬퍼 메서드가 제공되어, 패턴 제약을 쉽고 빠르게 추가할 수 있습니다.

```
Route::get('/user/{id}/{name}', function ($id, $name) {
    //
})->whereNumber('id')->whereAlpha('name');

Route::get('/user/{name}', function ($name) {
    //
})->whereAlphaNumeric('name');

Route::get('/user/{id}', function ($id) {
    //
})->whereUuid('id');
```

요청이 라우트 패턴 제약조건에 일치하지 않는 경우, 404 HTTP 응답이 반환됩니다.

<a name="parameters-global-constraints"></a>
#### 글로벌 제약조건

특정 라우트 파라미터에 항상 같은 정규식 제약조건을 적용하고 싶다면, `pattern` 메서드를 사용할 수 있습니다. 이 패턴은 `App\Providers\RouteServiceProvider` 클래스의 `boot` 메서드에서 정의해야 합니다.

```
/**
 * Define your route model bindings, pattern filters, etc.
 *
 * @return void
 */
public function boot()
{
    Route::pattern('id', '[0-9]+');
}
```

이렇게 패턴을 지정하면, 해당 파라미터 이름이 사용되는 모든 라우트에 자동으로 적용됩니다.

```
Route::get('/user/{id}', function ($id) {
    // {id}가 숫자일 때만 동작합니다...
});
```

<a name="parameters-encoded-forward-slashes"></a>
#### 인코딩된 슬래시(`/`)

라라벨 라우팅 컴포넌트는 라우트 파라미터 값으로 `/`를 제외한 모든 문자를 허용합니다. 만약 슬래시(`/`)도 파라미터 값에 포함하고 싶다면, 정규식 조건에서 명시적으로 허용해줘야 합니다.

```
Route::get('/search/{search}', function ($search) {
    return $search;
})->where('search', '.*');
```

> [!NOTE]
> 인코딩된 슬래시는 오직 마지막 라우트 세그먼트에서만 지원됩니다.

<a name="named-routes"></a>
## 네임드 라우트

네임드 라우트를 사용하면 특정 라우트에 대해 URL을 생성하거나 리디렉션하는 작업을 편리하게 할 수 있습니다. 라우트 정의에 `name` 메서드를 체이닝하여 라우트에 이름을 지정할 수 있습니다.

```
Route::get('/user/profile', function () {
    //
})->name('profile');
```

컨트롤러 액션에도 라우트 이름을 지정할 수 있습니다.

```
Route::get(
    '/user/profile',
    [UserProfileController::class, 'show']
)->name('profile');
```

> [!NOTE]
> 라우트 이름은 반드시 고유해야 합니다.

<a name="generating-urls-to-named-routes"></a>
#### 네임드 라우트로 URL 생성하기

특정 라우트에 이름을 지정한 뒤에는 `route` 및 `redirect` 헬퍼 함수를 통해 해당 라우트의 이름으로 URL 생성이나 리디렉션이 가능합니다.

```
// URL 생성...
$url = route('profile');

// 리디렉션 생성...
return redirect()->route('profile');
```

네임드 라우트에 파라미터가 있다면, 두 번째 인자로 파라미터 배열을 넘기면 지정한 위치에 값이 자동으로 삽입되어 URL이 생성됩니다.

```
Route::get('/user/{id}/profile', function ($id) {
    //
})->name('profile');

$url = route('profile', ['id' => 1]);
```

파라미터 배열에 추가로 더 많은 값을 전달하면, 이 값들은 자동으로 URL의 쿼리 스트링 형태로 추가됩니다.

```
Route::get('/user/{id}/profile', function ($id) {
    //
})->name('profile');

$url = route('profile', ['id' => 1, 'photos' => 'yes']);

// /user/1/profile?photos=yes
```

> [!TIP]
> 요청 전체에 대해 URL 파라미터의 기본값(예: 현재 로케일 등)을 지정하고 싶을 때는 [`URL::defaults` 메서드](/docs/8.x/urls#default-values)를 사용할 수 있습니다.

<a name="inspecting-the-current-route"></a>
#### 현재 라우트 검사하기

현재 요청이 특정 네임드 라우트로 매칭됐는지 확인하려면, `Route` 인스턴스의 `named` 메서드를 사용할 수 있습니다. 예를 들어, 라우트 미들웨어 내에서 현재 라우트 이름을 체크할 수 있습니다.

```
/**
 * Handle an incoming request.
 *
 * @param  \Illuminate\Http\Request  $request
 * @param  \Closure  $next
 * @return mixed
 */
public function handle($request, Closure $next)
{
    if ($request->route()->named('profile')) {
        //
    }

    return $next($request);
}
```

<a name="route-groups"></a>
## 라우트 그룹

라우트 그룹을 사용하면 여러 라우트에 대해 미들웨어와 같은 라우트 속성을 개별적으로 반복해서 지정하지 않고, 그룹 단위로 한번에 공유할 수 있습니다.

중첩된 그룹은 상위 그룹의 속성을 자동으로 '병합'하여 적용합니다. 미들웨어 및 `where` 조건은 병합되고, 이름(name)과 프리픽스(prefix)는 덧붙여집니다. 네임스페이스 구분자와 URI 프리픽스의 슬래시는 적절하게 자동 추가됩니다.

<a name="route-group-middleware"></a>
### 미들웨어

라우트 그룹 내의 모든 라우트에 [미들웨어](/docs/8.x/middleware)를 적용하려면, 그룹 정의 전에 `middleware` 메서드를 사용하면 됩니다. 배열에 나열하는 순서대로 미들웨어가 실행됩니다.

```
Route::middleware(['first', 'second'])->group(function () {
    Route::get('/', function () {
        // first와 second 미들웨어가 적용됩니다...
    });

    Route::get('/user/profile', function () {
        // first와 second 미들웨어가 적용됩니다...
    });
});
```

<a name="route-group-controllers"></a>
### 컨트롤러

여러 라우트가 동일한 [컨트롤러](/docs/8.x/controllers)를 사용할 때는, `controller` 메서드를 사용하여 그룹 내 전체 라우트에 공통 컨트롤러를 지정할 수 있습니다. 이후 각각의 라우트 정의에서는 호출할 컨트롤러 메서드명만 적어주면 됩니다.

```
use App\Http\Controllers\OrderController;

Route::controller(OrderController::class)->group(function () {
    Route::get('/orders/{id}', 'show');
    Route::post('/orders', 'store');
});
```

<a name="route-group-subdomain-routing"></a>
### 서브도메인 라우팅

라우트 그룹은 서브도메인 라우팅에도 사용할 수 있습니다. 서브도메인에도 라우트 파라미터를 지정할 수 있어, 서브도메인의 일부를 라우트나 컨트롤러에서 사용할 수 있습니다. `domain` 메서드를 이용해 그룹 정의 전에 서브도메인을 설정합니다.

```
Route::domain('{account}.example.com')->group(function () {
    Route::get('user/{id}', function ($account, $id) {
        //
    });
});
```

> [!NOTE]
> 서브도메인 라우트가 올바르게 동작하려면, 반드시 루트 도메인 라우트보다 먼저 서브도메인 라우트를 등록해야 합니다. 그래야 루트 도메인 라우트가 같은 URI 경로를 가진 서브도메인 라우트를 덮어쓰지 않습니다.

<a name="route-group-prefixes"></a>
### 라우트 프리픽스

`prefix` 메서드를 사용하면, 그룹 내의 모든 라우트 URI 앞에 특정 문자열 프리픽스를 붙일 수 있습니다. 예를 들어, 모든 그룹 내 라우트의 URI를 `admin`으로 시작하도록 할 수 있습니다.

```
Route::prefix('admin')->group(function () {
    Route::get('/users', function () {
        // "/admin/users" URL과 매칭됩니다.
    });
});
```

<a name="route-group-name-prefixes"></a>
### 라우트 이름 프리픽스

`name` 메서드를 사용하면, 그룹 내 모든 라우트 이름에 지정한 문자열을 프리픽스로 붙일 수 있습니다. 예시에서는 그룹의 모든 라우트 이름에 `admin.`을 붙입니다. 반드시 접미사로 `.`(점)을 붙여야 원하는 결과를 얻을 수 있습니다.

```
Route::name('admin.')->group(function () {
    Route::get('/users', function () {
        // 이 라우트는 "admin.users"라는 이름을 가지게 됩니다...
    })->name('users');
});
```

<a name="route-model-binding"></a>
## 라우트 모델 바인딩

모델 ID를 라우트나 컨트롤러 액션에 주입하는 경우, 일반적으로 해당 ID로 데이터베이스에서 모델을 조회해야 합니다. 라라벨의 라우트 모델 바인딩을 사용하면, 모델 인스턴스를 자동으로 라우트에 주입할 수 있어 편리합니다. 예를 들어, 사용자의 ID를 주입하는 대신 해당 ID와 일치하는 전체 `User` 모델 인스턴스를 자동으로 받아올 수 있습니다.

<a name="implicit-binding"></a>
### 암묵적 바인딩

라우트나 컨트롤러 액션의 파라미터가 Eloquent 모델로 타입힌트되어 있고, 변수명과 라우트 세그먼트가 일치하면 라라벨이 자동으로 Eloquent 모델을 주입합니다. 예를 들어:

```
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
});
```

위와 같이 `$user` 변수가 `App\Models\User` 모델로 타입힌트되어 있고, 변수명과 `{user}` 세그먼트가 일치하면 라라벨은 해당 ID와 일치하는 모델 인스턴스를 자동으로 라우트에 주입합니다. 데이터베이스에서 일치하는 모델 인스턴스를 찾지 못하면 자동으로 404 HTTP 응답이 반환됩니다.

암묵적 바인딩은 컨트롤러 메서드에서도 동일하게 동작합니다. 마찬가지로 `{user}` 세그먼트와 컨트롤러의 `$user` 파라미터가 일치합니다.

```
use App\Http\Controllers\UserController;
use App\Models\User;

// 라우트 정의...
Route::get('/users/{user}', [UserController::class, 'show']);

// 컨트롤러 메서드 정의...
public function show(User $user)
{
    return view('user.profile', ['user' => $user]);
}
```

<a name="implicit-soft-deleted-models"></a>
#### 소프트 삭제된 모델

기본적으로 암묵적 모델 바인딩은 [소프트 삭제](/docs/8.x/eloquent#soft-deleting)된 모델을 조회하지 않습니다. 하지만 라우트 정의에 `withTrashed` 메서드를 체이닝하면 소프트 삭제된 모델도 함께 조회할 수 있습니다.

```
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
})->withTrashed();
```

<a name="customizing-the-default-key-name"></a>
#### 기본 키 변경하기

때로는 Eloquent 모델을 조회할 때 `id`가 아닌 다른 컬럼으로 조회하고 싶을 수 있습니다. 이럴 때, 라우트 파라미터 정의에 컬럼명을 명시할 수 있습니다.

```
use App\Models\Post;

Route::get('/posts/{post:slug}', function (Post $post) {
    return $post;
});
```

특정 모델 클래스에 대해 항상 특정 컬럼을 바인딩 키로 사용하려면, Eloquent 모델에서 `getRouteKeyName` 메서드를 오버라이드하면 됩니다.

```
/**
 * Get the route key for the model.
 *
 * @return string
 */
public function getRouteKeyName()
{
    return 'slug';
}
```

<a name="implicit-model-binding-scoping"></a>
#### 커스텀 키 및 스코프 바인딩

하나의 라우트에서 여러 Eloquent 모델을 암묵적으로 바인딩할 때, 두 번째 모델이 반드시 첫 번째 모델의 자식이어야 하는 상황이 있을 수 있습니다. 예를 들어, 특정 사용자의 게시글을 슬러그로 조회하는 아래의 라우트 정의를 보겠습니다.

```
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
});
```

이처럼 커스텀 키를 사용하는 중첩 바인딩의 경우, 라라벨은 두 번째 모델을 자동으로 첫 번째(상위) 모델의 자식 관계로 스코프해 쿼리를 수행합니다. 이때 `User` 모델에 `posts`라는(라우트 파라미터 복수형) 관계가 정의되어 있다고 가정합니다.

커스텀 키가 없어도(기본 `id` 사용) 자식 모델 바인딩의 스코프 적용을 원한다면, 라우트 정의 시 `scopeBindings` 메서드를 체이닝하세요.

```
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
    return $post;
})->scopeBindings();
```

여러 라우트를 그룹으로 묶어 모두 스코프 바인딩을 적용할 수도 있습니다.

```
Route::scopeBindings()->group(function () {
    Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
        return $post;
    });
});
```

<a name="customizing-missing-model-behavior"></a>
#### 모델을 찾지 못한 경우 동작 커스터마이즈

기본적으로 암묵적 바인딩에서 모델을 찾지 못하면 404 HTTP 응답이 반환됩니다. 하지만 라우트 정의 시 `missing` 메서드를 통해 커스텀 동작을 지정할 수 있습니다. `missing` 메서드에는 콜백을 지정할 수 있고, 모델을 찾지 못했을 때 이 콜백이 실행됩니다.

```
use App\Http\Controllers\LocationsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

Route::get('/locations/{location:slug}', [LocationsController::class, 'show'])
        ->name('locations.view')
        ->missing(function (Request $request) {
            return Redirect::route('locations.index');
        });
```

<a name="explicit-binding"></a>
### 명시적 바인딩

암묵적(관례 기반) 모델 바인딩 대신, 어떻게 라우트 파라미터가 모델과 매핑될지 직접 명시할 수도 있습니다. 명시적 바인딩은 라우터의 `model` 메서드를 사용하며, 특정 파라미터에 대한 클래스를 지정합니다. 보통 `RouteServiceProvider`의 `boot` 메서드 시작 부분에 바인딩을 등록합니다.

```
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * Define your route model bindings, pattern filters, etc.
 *
 * @return void
 */
public function boot()
{
    Route::model('user', User::class);

    // ...
}
```

이후 `{user}` 파라미터를 포함하는 라우트를 정의할 수 있습니다.

```
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    //
});
```

이렇게 바인딩하면, `users/1` 요청 시 데이터베이스에서 ID가 1인 User 인스턴스가 주입됩니다.

일치하는 모델을 찾지 못하면, 자동으로 404 응답이 반환됩니다.

<a name="customizing-the-resolution-logic"></a>
#### 바인딩 인스턴스 조회 로직 커스터마이즈

직접 바인딩 인스턴스 조회 로직을 정의하고 싶다면, `Route::bind` 메서드를 사용할 수 있습니다. 이 메서드에 전달하는 클로저는 URI 세그먼트 값을 받아, 라우트에 주입할 인스턴스를 반환하면 됩니다. 역시 애플리케이션의 `RouteServiceProvider`의 `boot` 메서드에서 정의하세요.

```
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * Define your route model bindings, pattern filters, etc.
 *
 * @return void
 */
public function boot()
{
    Route::bind('user', function ($value) {
        return User::where('name', $value)->firstOrFail();
    });

    // ...
}
```

또는, Eloquent 모델에 `resolveRouteBinding` 메서드를 오버라이드하여 모델 내에서 바인딩 인스턴스 조회 로직을 정의할 수도 있습니다.

```
/**
 * Retrieve the model for a bound value.
 *
 * @param  mixed  $value
 * @param  string|null  $field
 * @return \Illuminate\Database\Eloquent\Model|null
 */
public function resolveRouteBinding($value, $field = null)
{
    return $this->where('name', $value)->firstOrFail();
}
```

[암묵적 바인딩 스코프](#implicit-model-binding-scoping)가 적용되는 라우트의 경우, `resolveChildRouteBinding` 메서드가 호출되어 자식 모델 바인딩이 처리됩니다.

```
/**
 * Retrieve the child model for a bound value.
 *
 * @param  string  $childType
 * @param  mixed  $value
 * @param  string|null  $field
 * @return \Illuminate\Database\Eloquent\Model|null
 */
public function resolveChildRouteBinding($childType, $value, $field)
{
    return parent::resolveChildRouteBinding($childType, $value, $field);
}
```

<a name="fallback-routes"></a>
## 폴백 라우트

`Route::fallback` 메서드를 사용하면, 다른 어떤 라우트와도 매칭되지 않을 때 실행되는 라우트를 정의할 수 있습니다. 처리되지 않은 요청은 기본적으로 예외 핸들러에 의해 "404" 페이지가 렌더링됩니다. 하지만 일반적으로 `routes/web.php`에 `fallback` 라우트를 정의하므로, 이 라우트에도 `web` 미들웨어 그룹의 모든 미들웨어가 적용됩니다. 필요한 경우 이 라우트에 추가 미들웨어도 자유롭게 지정할 수 있습니다.

```
Route::fallback(function () {
    //
});
```

> [!NOTE]
> 폴백 라우트는 반드시 애플리케이션의 마지막 라우트로 등록해야 합니다.

<a name="rate-limiting"></a>
## 요청 제한 (Rate Limiting)

<a name="defining-rate-limiters"></a>
### 요청 제한자 정의

라라벨은 특정 라우트나 라우트 그룹에 대해 트래픽을 제한할 수 있는 강력하고 유연한 요청 제한 기능을 제공합니다. 먼저, 애플리케이션에 필요한 요청 제한자 설정을 정의해야 합니다. 주로 `App\Providers\RouteServiceProvider` 클래스의 `configureRateLimiting` 메서드 내에서 정의합니다.

요청 제한자는 `RateLimiter` 파사드의 `for` 메서드를 사용하여 정의합니다. `for` 메서드는 제한자 이름과, 제한 설정을 반환하는 클로저를 인자로 받습니다. 제한 설정은 `Illuminate\Cache\RateLimiting\Limit` 클래스의 인스턴스여야 하며, 이 클래스에는 요청 제한을 빠르게 정의할 수 있는 다양한 빌더 메서드가 포함되어 있습니다. 제한자 이름은 원하는 아무 문자열이나 쓸 수 있습니다.

```
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Configure the rate limiters for the application.
 *
 * @return void
 */
protected function configureRateLimiting()
{
    RateLimiter::for('global', function (Request $request) {
        return Limit::perMinute(1000);
    });
}
```

요청이 지정한 제한을 초과하면, 라라벨은 자동으로 429 HTTP 상태 코드로 응답합니다. 요청 제한을 초과했을 때 반환되는 응답을 직접 정의하고 싶을 때는 `response` 메서드를 사용할 수 있습니다.

```
RateLimiter::for('global', function (Request $request) {
    return Limit::perMinute(1000)->response(function () {
        return response('Custom response...', 429);
    });
});
```

요청 제한자 클로저 안에서는 들어온 HTTP 요청 인스턴스를 받기 때문에, 요청이나 인증 사용자에 따라 동적으로 제한을 구성할 수도 있습니다.

```
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
                ? Limit::none()
                : Limit::perMinute(100);
});
```

<a name="segmenting-rate-limits"></a>
#### 요청 제한 분할(Segmenting)

특정한 기준에 따라 요청 제한을 분리해서 적용하고 싶을 때가 있습니다. 예를 들어, 한 IP 주소당 1분에 100회씩 라우트에 접근하도록 제한하려면, 제한 빌더에서 `by` 메서드를 사용할 수 있습니다.

```
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
                ? Limit::none()
                : Limit::perMinute(100)->by($request->ip());
});
```

또 다른 예시로, 인증된 사용자는 1분에 100회, 비회원(게스트)은 IP별로 1분에 10회만 접근하도록 제한할 수도 있습니다.

```
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()
                ? Limit::perMinute(100)->by($request->user()->id)
                : Limit::perMinute(10)->by($request->ip());
});
```

<a name="multiple-rate-limits"></a>
#### 다중 요청 제한

필요하다면, 하나의 제한자 설정에서 여러 개의 요청 제한을 배열로 반환할 수 있습니다. 배열에 나열된 순서대로 각 제한이 적용됩니다.

```
RateLimiter::for('login', function (Request $request) {
    return [
        Limit::perMinute(500),
        Limit::perMinute(3)->by($request->input('email')),
    ];
});
```

<a name="attaching-rate-limiters-to-routes"></a>
### 라우트에 요청 제한 적용하기

요청 제한자는 `throttle` [미들웨어](/docs/8.x/middleware)로 라우트 또는 라우트 그룹에 적용할 수 있습니다. 미들웨어에 제한자 이름을 지정하면 해당 제한이 적용됩니다.

```
Route::middleware(['throttle:uploads'])->group(function () {
    Route::post('/audio', function () {
        //
    });

    Route::post('/video', function () {
        //
    });
});
```

<a name="throttling-with-redis"></a>
#### Redis를 사용한 요청 제한

일반적으로 `throttle` 미들웨어는 `Illuminate\Routing\Middleware\ThrottleRequests` 클래스에 매핑되어 있습니다. 이 매핑은 애플리케이션의 HTTP 커널(`App\Http\Kernel`)에서 정의됩니다. 하지만 애플리케이션의 캐시 드라이버로 Redis를 사용한다면, 더 효율적인 제한 관리를 위해 `Illuminate\Routing\Middleware\ThrottleRequestsWithRedis` 클래스로 매핑을 변경할 수 있습니다.

```
'throttle' => \Illuminate\Routing\Middleware\ThrottleRequestsWithRedis::class,
```

<a name="form-method-spoofing"></a>
## 폼 메서드 속이기

HTML 폼은 `PUT`, `PATCH`, `DELETE` 메서드를 지원하지 않습니다. 따라서 폼에서 이 메서드를 사용하는 라우트로 요청하려면, 숨겨진 필드 `_method`를 추가해야 합니다. 이 필드에 전달된 값이 HTTP 요청 메서드로 사용됩니다.

```
<form action="/example" method="POST">
    <input type="hidden" name="_method" value="PUT">
    <input type="hidden" name="_token" value="{{ csrf_token() }}">
</form>
```

더 간편하게, [Blade 디렉티브](/docs/8.x/blade)인 `@method`를 이용해 `_method` 필드를 생성할 수 있습니다.

```
<form action="/example" method="POST">
    @method('PUT')
    @csrf
</form>
```

<a name="accessing-the-current-route"></a>
## 현재 라우트 정보 접근

`Route` 파사드의 `current`, `currentRouteName`, `currentRouteAction` 메서드를 사용하여 현재 요청을 처리하는 라우트 정보를 가져올 수 있습니다.

```
use Illuminate\Support\Facades\Route;

$route = Route::current(); // Illuminate\Routing\Route 인스턴스
$name = Route::currentRouteName(); // string
$action = Route::currentRouteAction(); // string
```

라우터 및 라우트 클래스에서 사용할 수 있는 모든 메서드는 [Route 파사드의 클래스 API 문서](https://laravel.com/api/8.x/Illuminate/Routing/Router.html)와 [Route 인스턴스 API 문서](https://laravel.com/api/8.x/Illuminate/Routing/Route.html)에서 참조할 수 있습니다.

<a name="cors"></a>
## 교차 출처 리소스 공유(CORS)

라라벨은 설정에 따라 CORS(교차 출처 리소스 공유) `OPTIONS` HTTP 요청에 자동으로 응답할 수 있습니다. 모든 CORS 설정은 애플리케이션의 `config/cors.php` 설정 파일에서 구성할 수 있습니다. 옵션 요청은 글로벌 미들웨어 스택(애플리케이션의 `App\Http\Kernel`)에 기본으로 포함된 `HandleCors` [미들웨어](/docs/8.x/middleware)에 의해 자동으로 처리됩니다.

> [!TIP]
> CORS와 CORS 헤더에 대해 더 알고 싶다면 [MDN 웹 문서의 CORS 관련 문서](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers)를 참고하세요.

<a name="route-caching"></a>
## 라우트 캐싱

애플리케이션을 운영 환경에 배포할 때에는 라라벨의 라우트 캐시를 적극적으로 활용해야 합니다. 라우트 캐싱을 사용하면 전체 라우트 등록 시간(부트 타임)이 크게 단축됩니다. 라우트 캐시를 생성하려면 `route:cache` 아티즌 명령어를 실행하세요.

```
php artisan route:cache
```

이 명령어 실행 후에는, 모든 요청에서 캐시된 라우트 파일이 사용됩니다. 새 라우트를 추가했다면 반드시 라우트 캐시를 재생성해야 합니다. 따라서, `route:cache`는 프로젝트 배포 시에만 실행하는 것이 좋습니다.

라우트 캐시는 다음 명령어로 삭제할 수 있습니다.

```
php artisan route:clear
```
