# 라우팅 (Routing)

- [기본 라우팅](#basic-routing)
    - [리다이렉트 라우트](#redirect-routes)
    - [뷰 라우트](#view-routes)
    - [라우트 목록](#the-route-list)
- [라우트 파라미터](#route-parameters)
    - [필수 파라미터](#required-parameters)
    - [옵션 파라미터](#parameters-optional-parameters)
    - [정규 표현식 제약](#parameters-regular-expression-constraints)
- [이름이 있는 라우트](#named-routes)
- [라우트 그룹](#route-groups)
    - [미들웨어](#route-group-middleware)
    - [컨트롤러](#route-group-controllers)
    - [서브도메인 라우팅](#route-group-subdomain-routing)
    - [라우트 프리픽스](#route-group-prefixes)
    - [라우트 이름 프리픽스](#route-group-name-prefixes)
- [라우트 모델 바인딩](#route-model-binding)
    - [암묵적 바인딩](#implicit-binding)
    - [암묵적 Enum 바인딩](#implicit-enum-binding)
    - [명시적 바인딩](#explicit-binding)
- [폴백 라우트](#fallback-routes)
- [속도 제한](#rate-limiting)
    - [속도 제한자 정의하기](#defining-rate-limiters)
    - [라우트에 속도 제한자 적용하기](#attaching-rate-limiters-to-routes)
- [폼 메서드 스푸핑](#form-method-spoofing)
- [현재 라우트 접근하기](#accessing-the-current-route)
- [교차 출처 리소스 공유(CORS)](#cors)
- [라우트 캐싱](#route-caching)

<a name="basic-routing"></a>
## 기본 라우팅

라라벨의 가장 기본적인 라우트는 URI와 클로저를 전달받아, 복잡한 라우팅 설정 파일 없이도 매우 간단하고 직관적으로 라우트와 동작을 정의할 수 있습니다.

```
use Illuminate\Support\Facades\Route;

Route::get('/greeting', function () {
    return 'Hello World';
});
```

<a name="the-default-route-files"></a>
#### 기본 라우트 파일

모든 라라벨 라우트는 `routes` 디렉터리에 위치한 라우트 파일에 정의합니다. 이 파일들은 애플리케이션의 `App\Providers\RouteServiceProvider`에 의해 자동으로 로드됩니다. `routes/web.php` 파일은 웹 인터페이스를 위한 라우트를 정의하며, 이 라우트들은 세션 상태 관리와 CSRF 보호와 같은 기능을 제공하는 `web` 미들웨어 그룹이 자동으로 적용됩니다. 반면 `routes/api.php`의 라우트들은 상태 비저장(stateless)이므로 `api` 미들웨어 그룹이 지정됩니다.

일반적으로 대부분의 애플리케이션은 `routes/web.php` 파일에서 라우트 정의를 시작하게 됩니다. 여기에 정의된 라우트는 해당 URL을 브라우저에 입력하여 접근할 수 있습니다. 예를 들어, 다음과 같이 라우트를 등록하면 브라우저에서 `http://example.com/user`로 접속할 수 있습니다.

```
use App\Http\Controllers\UserController;

Route::get('/user', [UserController::class, 'index']);
```

`routes/api.php` 파일에 정의된 라우트는 `RouteServiceProvider`에 의해 라우트 그룹 내에 중첩되어 적용됩니다. 이 그룹 내에서는 `/api` URI 프리픽스가 자동으로 붙으므로, 파일 내의 각 라우트에 일일이 프리픽스를 추가할 필요가 없습니다. 프리픽스나 기타 라우트 그룹 옵션은 `RouteServiceProvider` 클래스를 수정하여 변경할 수 있습니다.

<a name="available-router-methods"></a>
#### 사용 가능한 라우터 메서드

라우터는 다양한 HTTP 메서드(GET, POST 등)에 응답하는 라우트를 등록할 수 있도록 지원합니다.

```
Route::get($uri, $callback);
Route::post($uri, $callback);
Route::put($uri, $callback);
Route::patch($uri, $callback);
Route::delete($uri, $callback);
Route::options($uri, $callback);
```

한 라우트가 여러 HTTP 메서드에 응답해야 할 때는 `match` 메서드를 사용할 수 있습니다. 또한, 모든 HTTP 메서드를 처리해야 한다면 `any` 메서드를 사용할 수도 있습니다.

```
Route::match(['get', 'post'], '/', function () {
    //
});

Route::any('/', function () {
    //
});
```

> [!NOTE]
> 동일한 URI에 여러 라우트를 정의할 경우, `get`, `post`, `put`, `patch`, `delete`, `options` 메서드를 사용하는 라우트를 `any`, `match`, `redirect` 메서드를 사용하는 라우트보다 먼저 정의해야 합니다. 이렇게 하면 요청이 올바른 라우트에 매칭됩니다.

<a name="dependency-injection"></a>
#### 의존성 주입

라우트의 콜백 시그니처에 필요한 의존성을 타입힌트로 명시할 수 있습니다. 선언한 의존성은 라라벨 [서비스 컨테이너](/docs/9.x/container)에 의해 자동으로 해결되어 콜백에 주입됩니다. 예를 들어, 현재 HTTP 요청 인스턴스를 자동으로 받아오려면 `Illuminate\Http\Request` 클래스를 타입힌트로 지정할 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/users', function (Request $request) {
    // ...
});
```

<a name="csrf-protection"></a>
#### CSRF 보호

`web` 라우트 파일에서 정의된 모든 `POST`, `PUT`, `PATCH`, `DELETE` 라우트로 향하는 HTML 폼에는 반드시 CSRF 토큰 필드를 포함해야 합니다. 그렇지 않으면 요청이 거부됩니다. CSRF 보호에 대한 더 자세한 내용은 [CSRF 문서](/docs/9.x/csrf)를 참고하세요.

```
<form method="POST" action="/profile">
    @csrf
    ...
</form>
```

<a name="redirect-routes"></a>
### 리다이렉트 라우트

다른 URI로 리다이렉트하는 라우트를 정의해야 할 경우, `Route::redirect` 메서드를 사용할 수 있습니다. 이 방법을 사용하면 간단한 리디렉션을 위해 별도의 라우트나 컨트롤러를 직접 작성할 필요 없이 손쉽게 구현할 수 있습니다.

```
Route::redirect('/here', '/there');
```

기본적으로 `Route::redirect`는 `302` 상태 코드를 반환합니다. 필요하다면 선택적으로 세 번째 인자로 상태 코드를 지정할 수 있습니다.

```
Route::redirect('/here', '/there', 301);
```

또는, `Route::permanentRedirect` 메서드를 사용하여 항상 `301` 상태 코드를 반환할 수 있습니다.

```
Route::permanentRedirect('/here', '/there');
```

> [!WARNING]
> 리다이렉트 라우트에서 라우트 파라미터를 사용할 때, `destination`과 `status`라는 이름의 파라미터는 라라벨에서 예약되어 있으므로 사용할 수 없습니다.

<a name="view-routes"></a>
### 뷰 라우트

라우트가 단순히 [뷰](/docs/9.x/views)만 반환해야 하는 경우, `Route::view` 메서드를 사용할 수 있습니다. 이 메서드 역시 별도의 라우트나 컨트롤러를 전체적으로 작성하지 않고도 편리하게 구현할 수 있도록 도와줍니다. 첫 번째 인자에는 URI, 두 번째 인자에는 뷰 이름을 넣으면 됩니다. 세 번째 인자로 뷰에 전달할 데이터 배열을 선택적으로 추가할 수도 있습니다.

```
Route::view('/welcome', 'welcome');

Route::view('/welcome', 'welcome', ['name' => 'Taylor']);
```

> [!WARNING]
> 뷰 라우트에서 라우트 파라미터를 사용할 때, `view`, `data`, `status`, `headers`라는 파라미터명은 라라벨에서 예약되어 있으므로 사용할 수 없습니다.

<a name="the-route-list"></a>
### 라우트 목록

`route:list` Artisan 명령어를 사용하면 애플리케이션에 정의된 모든 라우트의 개요를 쉽게 확인할 수 있습니다.

```shell
php artisan route:list
```

기본적으로 각 라우트에 할당된 미들웨어는 출력에 표시되지 않지만, 커맨드에 `-v` 옵션을 추가하면 라우트별 미들웨어도 확인할 수 있습니다.

```shell
php artisan route:list -v
```

특정 URI로 시작하는 라우트만 표시하고 싶다면, `--path` 옵션을 사용할 수 있습니다.

```shell
php artisan route:list --path=api
```

또한, `--except-vendor` 옵션을 사용하면 외부(서드파티) 패키지에서 정의한 라우트를 숨길 수 있습니다.

```shell
php artisan route:list --except-vendor
```

반대로, `--only-vendor` 옵션을 사용하면 외부 패키지에서 정의한 라우트만 볼 수 있습니다.

```shell
php artisan route:list --only-vendor
```

<a name="route-parameters"></a>
## 라우트 파라미터

<a name="required-parameters"></a>
### 필수 파라미터

때때로 URI의 일부를 변수로 캡처해야 할 필요가 있습니다. 예를 들어, 사용자 ID와 같은 값을 URL 경로로부터 받아와야 할 때 라우트 파라미터를 정의할 수 있습니다.

```
Route::get('/user/{id}', function ($id) {
    return 'User '.$id;
});
```

필요하다면 여러 개의 라우트 파라미터도 정의할 수 있습니다.

```
Route::get('/posts/{post}/comments/{comment}', function ($postId, $commentId) {
    //
});
```

라우트 파라미터는 항상 `{}` 중괄호로 감싸주어야 하며, 파라미터 이름에는 영문자와 밑줄(`_`)만 사용할 수 있습니다. 파라미터는 라우트 콜백/컨트롤러로 순서대로 주입되며, 인자 이름은 상관하지 않습니다.

<a name="parameters-and-dependency-injection"></a>
#### 파라미터와 의존성 주입

라우트에 서비스 컨테이너의 의존성을 자동 주입받으려면, 라우트 파라미터를 의존성 인자 다음에 선언해야 합니다.

```
use Illuminate\Http\Request;

Route::get('/user/{id}', function (Request $request, $id) {
    return 'User '.$id;
});
```

<a name="parameters-optional-parameters"></a>
### 옵션 파라미터

URI에 항상 존재하지는 않을 수도 있는 라우트 파라미터가 필요할 때는 파라미터명 뒤에 `?`를 붙여서 정의할 수 있습니다. 또한 해당 변수에 기본값을 지정해주어야 합니다.

```
Route::get('/user/{name?}', function ($name = null) {
    return $name;
});

Route::get('/user/{name?}', function ($name = 'John') {
    return $name;
});
```

<a name="parameters-regular-expression-constraints"></a>
### 정규 표현식 제약

라우트 파라미터의 값을 정규 표현식을 이용해서 제한하려면 라우트 인스턴스에서 `where` 메서드를 사용할 수 있습니다. `where` 메서드는 파라미터명과 파라미터를 제한할 정규식 패턴을 인자로 받습니다.

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

자주 사용하는 정규 표현식 패턴은 헬퍼 메서드를 통해 더욱 빠르게 적용할 수 있습니다.

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

Route::get('/user/{id}', function ($id) {
    //
})->whereUlid('id');

Route::get('/category/{category}', function ($category) {
    //
})->whereIn('category', ['movie', 'song', 'painting']);
```

요청이 라우트의 패턴 제약 조건과 일치하지 않을 경우, 자동으로 404 HTTP 응답이 반환됩니다.

<a name="parameters-global-constraints"></a>
#### 전역 제약 조건

특정 라우트 파라미터에 대해 항상 동일한 정규 표현식 패턴을 적용하고 싶다면 `Route::pattern` 메서드를 사용할 수 있습니다. 이 패턴은 `App\Providers\RouteServiceProvider` 클래스의 `boot` 메서드에서 정의하는 것이 좋습니다.

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

한 번 패턴을 정의하면 동일한 파라미터명을 사용하는 모든 라우트에 자동으로 적용됩니다.

```
Route::get('/user/{id}', function ($id) {
    // {id}가 숫자일 때만 실행됨
});
```

<a name="parameters-encoded-forward-slashes"></a>
#### 인코딩된 슬래시

라라벨 라우팅에서는 라우트 파라미터 값 안에 `/`(슬래시)를 제외한 모든 문자를 허용합니다. 만약 슬래시도 파라미터로 허용해야 한다면, `where` 조건의 정규식을 통해 직접 허용해주어야 합니다.

```
Route::get('/search/{search}', function ($search) {
    return $search;
})->where('search', '.*');
```

> [!WARNING]
> 인코딩된 슬래시는 반드시 마지막 라우트 세그먼트에서만 지원됩니다.

<a name="named-routes"></a>
## 이름이 있는 라우트

이름이 있는(named) 라우트를 사용하면 특정 라우트에 대해 편리하게 URL이나 리다이렉트를 생성할 수 있습니다. 라우트 정의에서 `name` 메서드를 이어서 호출하여 라우트 이름을 지정합니다.

```
Route::get('/user/profile', function () {
    //
})->name('profile');
```

컨트롤러 액션 라우트에도 마찬가지로 라우트 이름을 지정할 수 있습니다.

```
Route::get(
    '/user/profile',
    [UserProfileController::class, 'show']
)->name('profile');
```

> [!WARNING]
> 라우트 이름은 반드시 고유해야 합니다.

<a name="generating-urls-to-named-routes"></a>
#### 이름이 있는 라우트의 URL 생성하기

지정된 라우트 이름은 라라벨의 `route` 및 `redirect` 헬퍼 함수를 통해 URL 생성이나 리다이렉트 시 사용할 수 있습니다.

```
// URL 생성...
$url = route('profile');

// 리다이렉트 생성...
return redirect()->route('profile');

return to_route('profile');
```

만약 이름이 있는 라우트가 파라미터를 요구한다면, 두 번째 인자로 파라미터를 배열로 전달할 수 있습니다. 전달된 파라미터는 URL의 해당 위치에 자동으로 삽입됩니다.

```
Route::get('/user/{id}/profile', function ($id) {
    //
})->name('profile');

$url = route('profile', ['id' => 1]);
```

필요하다면 추가 파라미터를 배열에 포함시켜, URL의 쿼리스트링으로 자동 추가할 수 있습니다.

```
Route::get('/user/{id}/profile', function ($id) {
    //
})->name('profile');

$url = route('profile', ['id' => 1, 'photos' => 'yes']);

// /user/1/profile?photos=yes
```

> [!NOTE]
> 전체 요청에서 URL 파라미터의 기본값(예: 현재 언어 설정 등)을 지정하고 싶다면, [`URL::defaults` 메서드](/docs/9.x/urls#default-values)를 사용할 수 있습니다.

<a name="inspecting-the-current-route"></a>
#### 현재 라우트가 특정 이름인지 판별하기

현재 요청이 지정된 이름의 라우트로 라우팅되었는지 확인하고 싶다면, Route 인스턴스의 `named` 메서드를 사용할 수 있습니다. 예를 들어, 미들웨어에서 현재 라우트 이름을 확인할 수 있습니다.

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

라우트 그룹을 사용하면 미들웨어와 같은 라우트 속성을 여러 라우트에 반복적으로 설정할 필요 없이 한 번에 공유할 수 있습니다.

중첩된 그룹은 부모 그룹의 속성과 지능적으로 "병합"됩니다. 미들웨어, `where` 제약 등은 병합되며, 이름과 프리픽스는 이어 붙여집니다. 네임스페이스 구분자나 URI 프리픽스 슬래시는 자동으로 적절히 추가됩니다.

<a name="route-group-middleware"></a>
### 미들웨어

라우트 그룹 내 모든 라우트에 [미들웨어](/docs/9.x/middleware)를 지정하려면 `middleware` 메서드를 사용하면 됩니다. 미들웨어는 배열에 명시한 순서대로 실행됩니다.

```
Route::middleware(['first', 'second'])->group(function () {
    Route::get('/', function () {
        // first, second 미들웨어가 적용됨
    });

    Route::get('/user/profile', function () {
        // first, second 미들웨어가 적용됨
    });
});
```

<a name="route-group-controllers"></a>
### 컨트롤러

라우트 그룹 내 라우트들이 동일한 [컨트롤러](/docs/9.x/controllers)를 사용할 경우, `controller` 메서드로 공통 컨트롤러를 지정할 수 있습니다. 이후 각 라우트에서는 호출할 컨트롤러 메서드명만 넘기면 됩니다.

```
use App\Http\Controllers\OrderController;

Route::controller(OrderController::class)->group(function () {
    Route::get('/orders/{id}', 'show');
    Route::post('/orders', 'store');
});
```

<a name="route-group-subdomain-routing"></a>
### 서브도메인 라우팅

라우트 그룹은 서브도메인 라우팅에도 사용할 수 있습니다. 서브도메인에도 라우트 파라미터를 정의할 수 있어, 서브도메인의 일부 영역을 라우트에서 변수로 사용할 수 있습니다. 서브도메인은 `domain` 메서드를 통해 지정합니다.

```
Route::domain('{account}.example.com')->group(function () {
    Route::get('user/{id}', function ($account, $id) {
        //
    });
});
```

> [!WARNING]
> 서브도메인 라우트가 정상적으로 동작하려면, 루트 도메인 라우트보다 먼저 등록해야 합니다. 동일한 URI 경로가 있는 경우 루트 도메인 라우트가 서브도메인 라우트를 덮어쓸 수 있기 때문입니다.

<a name="route-group-prefixes"></a>
### 라우트 프리픽스

`prefix` 메서드를 사용하면 그룹 내 모든 라우트의 URI 앞에 지정한 프리픽스를 붙일 수 있습니다. 예를 들어, admin으로 시작하는 관리용 URI들을 한 번에 그룹화할 수 있습니다.

```
Route::prefix('admin')->group(function () {
    Route::get('/users', function () {
        // "/admin/users" URL과 매칭됨
    });
});
```

<a name="route-group-name-prefixes"></a>
### 라우트 이름 프리픽스

`name` 메서드를 사용하면 그룹 내 라우트의 이름 앞에 특정 문자열을 프리픽스 형태로 붙일 수 있습니다. 예를 들어, `admin.`으로 시작하는 라우트 이름을 한번에 생성할 수 있습니다. 지정한 문자열이 그대로 붙으므로, 보통 뒤에 점(`.`)을 붙이는 것이 좋습니다.

```
Route::name('admin.')->group(function () {
    Route::get('/users', function () {
        // "admin.users"라는 이름이 지정됨
    })->name('users');
});
```

<a name="route-model-binding"></a>
## 라우트 모델 바인딩

라우트나 컨트롤러 액션에 모델 ID를 주입했을 때, 해당 ID에 해당하는 모델을 데이터베이스에서 조회하는 코드가 반복적으로 필요하곤 합니다. 라라벨의 라우트 모델 바인딩은 이런 과정을 자동화하여 해당 모델 인스턴스를 즉시 주입해주는 편리한 방식을 제공합니다. 즉, ID 대신 해당 모델 인스턴스를 바로 받아올 수 있습니다.

<a name="implicit-binding"></a>
### 암묵적 바인딩

Eloquent 모델을 타입힌트로 지정하고, 변수명이 라우트 세그먼트와 일치할 경우 라라벨은 자동으로 적절한 모델 인스턴스를 주입합니다. 예를 들어:

```
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
});
```

여기서 `$user` 변수는 `App\Models\User` Eloquent 모델로 타입힌트 되어 있고, 변수명이 `{user}` URI 세그먼트와 일치하기 때문에 라라벨이 자동으로 주입해줍니다. 만약 데이터베이스에 일치하는 모델 인스턴스가 없다면 404 응답이 반환됩니다.

암묵적 바인딩은 컨트롤러 메서드에서도 동일하게 쓸 수 있습니다. 마찬가지로 URI 세그먼트와 타입힌트 변수명이 일치해야 합니다.

```
use App\Http\Controllers\UserController;
use App\Models\User;

// 라우트 정의 예시
Route::get('/users/{user}', [UserController::class, 'show']);

// 컨트롤러 메서드 예시
public function show(User $user)
{
    return view('user.profile', ['user' => $user]);
}
```

<a name="implicit-soft-deleted-models"></a>
#### 소프트 삭제된 모델 포함하기

기본적으로 암묵적 모델 바인딩은 [소프트 삭제](/docs/9.x/eloquent#soft-deleting)된 모델을 조회하지 않습니다. 그러나 `withTrashed` 메서드를 체이닝하면 소프트 삭제된 모델도 조회할 수 있습니다.

```
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
})->withTrashed();
```

<a name="customizing-the-default-key-name"></a>
#### 조회 키 커스터마이징

경우에 따라 모델의 기본 키(`id`)가 아닌 다른 컬럼으로 바인딩하고 싶을 수 있습니다. 이때는 라우트 파라미터 정의 시 해당 컬럼명을 지정할 수 있습니다.

```
use App\Models\Post;

Route::get('/posts/{post:slug}', function (Post $post) {
    return $post;
});
```

특정 모델 클래스에 대해서 항상 `id`가 아닌 다른 컬럼으로 바인딩하도록 하려면, Eloquent 모델의 `getRouteKeyName` 메서드를 오버라이드할 수 있습니다.

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
#### 커스텀 키 & 스코핑

한 번에 여러 Eloquent 모델을 암묵적으로 바인딩할 때, 두 번째 모델이 첫 번째 모델의 자식이어야만 조회되게 스코핑하고 싶을 수 있습니다. 예를 들면, 특정 사용자의 슬러그로 블로그 포스트를 조회하는 경우입니다.

```
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
});
```

이처럼 중첩된 라우트 파라미터에서 커스텀 키가 사용될 때, 라라벨은 부모 모델과 연관관계가 있는지 자동으로 스코프를 제한합니다. 위의 예시에서는 `User` 모델이 복수형의 `posts` 연관관계를 갖는 것으로 가정하고, 이를 통해 `Post` 모델을 찾습니다.

만약 커스텀 키 없이도 "자식" 바인딩이 항상 스코프되길 원한다면, 라우트 정의 시 `scopeBindings` 메서드를 사용할 수 있습니다.

```
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
    return $post;
})->scopeBindings();
```

또한, 라우트 그룹 전체에도 스코프 바인딩을 적용할 수 있습니다.

```
Route::scopeBindings()->group(function () {
    Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
        return $post;
    });
});
```

반대로, 스코프 바인딩이 적용되지 않도록 명시하려면 `withoutScopedBindings` 메서드를 사용할 수 있습니다.

```
Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
})->withoutScopedBindings();
```

<a name="customizing-missing-model-behavior"></a>
#### 바인딩 실패 시 동작 커스터마이징

기본적으로 암묵적 모델 바인딩에 실패했을 때는 404 응답이 반환됩니다. 그러나 `missing` 메서드를 통해 이 동작을 원하는 대로 커스터마이징할 수 있습니다. `missing` 메서드는 암묵적 바인딩에 실패했을 때 실행할 클로저를 인자로 받습니다.

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

<a name="implicit-enum-binding"></a>
### 암묵적 Enum 바인딩

PHP 8.1에서 [Enum](https://www.php.net/manual/en/language.enumerations.backed.php)이 지원됨에 따라, 라라벨은 [문자열 기반 Enum](https://www.php.net/manual/en/language.enumerations.backed.php)을 라우트에서 타입힌트로 사용하면 해당 세그먼트가 Enum 값에 일치할 때만 라우트를 실행합니다. 그렇지 않으면 자동으로 404 응답을 반환합니다. 예를 들어 다음과 같은 Enum이 있다면,

```php
<?php

namespace App\Enums;

enum Category: string
{
    case Fruits = 'fruits';
    case People = 'people';
}
```

다음과 같이 라우트를 정의할 수 있습니다. 이 경우 `{category}` 세그먼트가 `fruits` 또는 `people`일 때만 라우트가 실행되고, 아닌 경우 404가 반환됩니다.

```php
use App\Enums\Category;
use Illuminate\Support\Facades\Route;

Route::get('/categories/{category}', function (Category $category) {
    return $category->value;
});
```

<a name="explicit-binding"></a>
### 명시적 바인딩

암묵적(컨벤션 기반) 모델 바인딩을 굳이 쓸 필요 없이, 직접 모델 바인딩을 원하는 방식으로 정의할 수도 있습니다. 명시적 모델 바인딩은 라우터의 `model` 메서드를 사용하여 파라미터명을 해당 모델 클래스로 지정합니다. 보통은 `RouteServiceProvider` 클래스의 `boot` 메서드에서 등록하는 것이 좋습니다.

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

이제 `{user}` 파라미터가 포함된 라우트를 정의하면,

```
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    //
});
```

앞에서 모든 `{user}` 파라미터를 `App\Models\User` 모델과 바인딩했으므로, 예를 들면 `/users/1`로 요청이 오면 데이터베이스에서 ID가 1인 `User` 인스턴스가 주입됩니다.

일치하는 모델을 찾을 수 없을 경우 404 응답이 자동으로 반환됩니다.

<a name="customizing-the-resolution-logic"></a>
#### 모델 바인딩 로직 커스터마이징

모델 바인딩시 고유한 바인딩 로직을 지정하고 싶다면, `Route::bind` 메서드를 사용할 수 있습니다. 이때 넘기는 클로저에는 URI 세그먼트 값이 전달되며, 반환하는 클래스 인스턴스가 라우트에 주입됩니다. 역시 `RouteServiceProvider`의 `boot` 메서드에 정의하면 좋습니다.

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

이 대신 Eloquent 모델의 `resolveRouteBinding` 메서드를 오버라이드해서 커스텀 로직을 정의할 수도 있습니다. 이 메서드에서는 URI 세그먼트의 값을 받아, 주입할 인스턴스를 반환하면 됩니다.

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

라우트가 [암묵적 바인딩 스코프](#implicit-model-binding-scoping)를 사용하는 경우에는, `resolveChildRouteBinding` 메서드가 부모 모델의 자식 바인딩을 해결할 때 사용됩니다.

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

`Route::fallback` 메서드를 사용하여, 어떤 라우트와도 매칭되지 않는 요청에 대해 실행할 라우트를 정의할 수 있습니다. 처리되지 않은 요청은 기본적으로 예외 핸들러에 의해 “404" 페이지를 렌더링하지만, `routes/web.php`에 폴백 라우트를 정의하면 `web` 미들웨어 그룹이 자동으로 적용됩니다. 필요하다면 추가 미들웨어도 적용할 수 있습니다.

```
Route::fallback(function () {
    //
});
```

> [!WARNING]
> 폴백 라우트는 반드시 애플리케이션에서 마지막으로 등록되어야 합니다.

<a name="rate-limiting"></a>
## 속도 제한

<a name="defining-rate-limiters"></a>
### 속도 제한자 정의하기

라라벨에는 라우트 또는 라우트 그룹별로 트래픽을 제한할 수 있는 강력하고 커스터마이즈 가능한 속도 제한 기능이 내장되어 있습니다. 먼저, 애플리케이션에 맞게 속도 제한자(rate limiter)를 정의해주어야 합니다. 일반적으로 이는 `App\Providers\RouteServiceProvider` 클래스 내의 `configureRateLimiting` 메서드에서 진행합니다. 이 메서드에는 이미 `routes/api.php` 파일의 라우트에 적용될 기본적인 제한자가 포함되어 있습니다.

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Configure the rate limiters for the application.
 */
protected function configureRateLimiting(): void
{
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
    });
}
```

속도 제한자는 `RateLimiter` 파사드의 `for` 메서드를 사용해서 정의합니다. `for` 메서드는 제한자 이름과 이를 적용할 라우트별 제한(config)을 반환하는 클로저를 인자로 받습니다. 제한은 `Illuminate\Cache\RateLimiting\Limit` 클래스의 인스턴스로 정의하며, 다양한 "빌더" 메서드를 통해 빠르게 제한 조건을 지정할 수 있습니다. 제한자 이름은 임의의 문자열을 사용할 수 있습니다.

```
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
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

요청 횟수가 지정된 속도 제한을 초과하면, 라라벨이 429 HTTP 상태코드를 가진 응답을 자동으로 반환합니다. 만약 제한에 걸렸을 때 별도의 응답을 반환하고 싶다면, `response` 메서드를 사용할 수 있습니다.

```
RateLimiter::for('global', function (Request $request) {
    return Limit::perMinute(1000)->response(function (Request $request, array $headers) {
        return response('Custom response...', 429, $headers);
    });
});
```

콜백에는 현재 HTTP 요청 인스턴스가 전달되므로, 인증된 사용자나 요청 상황에 따라 동적으로 제한 조건을 구성할 수도 있습니다.

```
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
                ? Limit::none()
                : Limit::perMinute(100);
});
```

<a name="segmenting-rate-limits"></a>
#### 속도 제한 세분화하기

경우에 따라 IP 주소 등 임의의 값별로 요청 제한을 세분화하고 싶을 수 있습니다. 이럴 때는 제한 빌더에 `by` 메서드를 체이닝하여 구현할 수 있습니다.

```
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
                ? Limit::none()
                : Limit::perMinute(100)->by($request->ip());
});
```

다른 예시로, 인증 사용자는 1분에 100회, 비인증 사용자는 1분에 10회로 제한할 수도 있습니다.

```
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()
                ? Limit::perMinute(100)->by($request->user()->id)
                : Limit::perMinute(10)->by($request->ip());
});
```

<a name="multiple-rate-limits"></a>
#### 다중 속도 제한 조건

필요하다면 하나의 제한자에 여러 개의 제한 조건을 배열로 반환할 수도 있습니다. 각 제한 조건은 배열에 지정된 순서대로 평가됩니다.

```
RateLimiter::for('login', function (Request $request) {
    return [
        Limit::perMinute(500),
        Limit::perMinute(3)->by($request->input('email')),
    ];
});
```

<a name="attaching-rate-limiters-to-routes"></a>
### 라우트에 속도 제한자 적용하기

속도 제한자는 `throttle` [미들웨어](/docs/9.x/middleware)를 통해 라우트 또는 라우트 그룹에 적용할 수 있습니다. 미들웨어에서 제한자 이름을 인자로 지정합니다.

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
#### Redis를 활용한 속도 제한

기본적으로 `throttle` 미들웨어는 `Illuminate\Routing\Middleware\ThrottleRequests` 클래스에 매핑되어 있습니다. 이 매핑은 애플리케이션의 HTTP 커널(`App\Http\Kernel`)에 정의되어 있습니다. 만약 Redis를 캐시 드라이버로 사용할 경우, 이 매핑을 `Illuminate\Routing\Middleware\ThrottleRequestsWithRedis` 클래스로 변경하는 것이 성능상 더 효율적입니다.

```
'throttle' => \Illuminate\Routing\Middleware\ThrottleRequestsWithRedis::class,
```

<a name="form-method-spoofing"></a>
## 폼 메서드 스푸핑

HTML 폼은 `PUT`, `PATCH`, `DELETE` 메서드를 직접 지원하지 않습니다. 따라서 이러한 메서드를 사용하는 라우트를 호출하는 HTML 폼에는 숨겨진 `_method` 필드를 추가해주어야 합니다. 해당 필드의 값이 실제 HTTP 요청 메서드로 간주됩니다.

```
<form action="/example" method="POST">
    <input type="hidden" name="_method" value="PUT">
    <input type="hidden" name="_token" value="{{ csrf_token() }}">
</form>
```

더 편리하게는 [Blade 디렉티브](/docs/9.x/blade)인 `@method`를 사용해서 `_method` 입력 필드를 생성할 수 있습니다.

```
<form action="/example" method="POST">
    @method('PUT')
    @csrf
</form>
```

<a name="accessing-the-current-route"></a>
## 현재 라우트 접근하기

`Route` 파사드의 `current`, `currentRouteName`, `currentRouteAction` 메서드를 사용하여 현재 요청을 처리하는 라우트 정보를 조회할 수 있습니다.

```
use Illuminate\Support\Facades\Route;

$route = Route::current(); // Illuminate\Routing\Route 인스턴스
$name = Route::currentRouteName(); // string
$action = Route::currentRouteAction(); // string
```

라우터와 라우트 클래스에서 제공하는 전체 메서드는 [Route 파사드의 기본 클래스 API 문서](https://laravel.com/api/9.x/Illuminate/Routing/Router.html)와 [Route 인스턴스 API 문서](https://laravel.com/api/9.x/Illuminate/Routing/Route.html)에서 확인할 수 있습니다.

<a name="cors"></a>
## 교차 출처 리소스 공유(CORS)

라라벨은 설정에 따라 CORS 옵션(`OPTIONS`) HTTP 요청에도 자동으로 응답할 수 있습니다. 모든 CORS 관련 설정은 애플리케이션의 `config/cors.php` 설정 파일에서 지정할 수 있습니다. `OPTIONS` 요청은 글로벌 미들웨어 스택에 기본 포함된 `HandleCors` [미들웨어](/docs/9.x/middleware)에 의해 자동으로 처리됩니다. 글로벌 미들웨어 스택은 `App\Http\Kernel`에 정의되어 있습니다.

> [!NOTE]
> CORS와 CORS 헤더에 대해 더 자세한 정보가 필요하다면, [MDN의 CORS 문서](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers)를 참고하시기 바랍니다.

<a name="route-caching"></a>
## 라우트 캐싱

애플리케이션을 운영 환경에 배포할 때는 라라벨의 라우트 캐시 기능을 적극 활용하는 것이 좋습니다. 라우트 캐시를 사용하면 모든 라우트를 등록하는 시간이 획기적으로 단축됩니다. 라우트 캐시는 `route:cache` Artisan 명령어로 생성할 수 있습니다.

```shell
php artisan route:cache
```

이 명령어를 실행하면 생성된 캐시 파일이 모든 요청에서 로드됩니다. 새로운 라우트를 추가했다면 반드시 라우트 캐시를 새로 생성해주어야 하므로, 보통은 프로젝트를 배포할 때만 `route:cache`를 실행하는 것이 좋습니다.

라우트 캐시를 비우려면 다음 명령어를 사용하세요.

```shell
php artisan route:clear
```
