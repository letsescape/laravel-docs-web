# 라우팅 (Routing)

- [기본 라우팅](#basic-routing)
    - [리디렉션 라우트](#redirect-routes)
    - [뷰 라우트](#view-routes)
    - [라우트 목록](#the-route-list)
- [라우트 파라미터](#route-parameters)
    - [필수 파라미터](#required-parameters)
    - [옵셔널 파라미터](#parameters-optional-parameters)
    - [정규 표현식 제약 조건](#parameters-regular-expression-constraints)
- [이름이 지정된 라우트](#named-routes)
- [라우트 그룹](#route-groups)
    - [미들웨어](#route-group-middleware)
    - [컨트롤러](#route-group-controllers)
    - [서브도메인 라우팅](#route-group-subdomain-routing)
    - [라우트 접두사](#route-group-prefixes)
    - [라우트 이름 접두사](#route-group-name-prefixes)
- [라우트 모델 바인딩](#route-model-binding)
    - [암묵적 바인딩](#implicit-binding)
    - [암묵적 Enum 바인딩](#implicit-enum-binding)
    - [명시적 바인딩](#explicit-binding)
- [폴백 라우트](#fallback-routes)
- [속도 제한](#rate-limiting)
    - [속도 제한자 정의](#defining-rate-limiters)
    - [라우트에 속도 제한자 적용](#attaching-rate-limiters-to-routes)
- [폼 메서드 스푸핑](#form-method-spoofing)
- [현재 라우트 정보 접근](#accessing-the-current-route)
- [교차 출처 리소스 공유(CORS)](#cors)
- [라우트 캐싱](#route-caching)

<a name="basic-routing"></a>
## 기본 라우팅

가장 기본적인 라라벨 라우트는 URI와 클로저를 받아, 복잡한 라우팅 설정 파일 없이도 매우 간단하고 직관적으로 라우트와 동작을 정의할 수 있습니다.

```
use Illuminate\Support\Facades\Route;

Route::get('/greeting', function () {
    return 'Hello World';
});
```

<a name="the-default-route-files"></a>
#### 기본 라우트 파일

라라벨의 모든 라우트는 `routes` 디렉터리에 위치한 라우트 파일에 정의합니다. 이 파일들은 애플리케이션의 `App\Providers\RouteServiceProvider`에 의해 자동으로 로드됩니다. `routes/web.php` 파일은 웹 인터페이스용 라우트를 정의하는 파일입니다. 이 라우트에는 세션 상태와 CSRF 보호와 같은 기능을 제공하는 `web` 미들웨어 그룹이 기본으로 적용됩니다. 반면, `routes/api.php`에 정의된 라우트는 상태를 저장하지 않는 API용 라우트이며, `api` 미들웨어 그룹이 적용됩니다.

대부분의 애플리케이션에서는 `routes/web.php` 파일에 라우트를 정의하는 것부터 시작합니다. `routes/web.php`에 정의된 라우트는 브라우저에서 해당 URL을 입력해 접근할 수 있습니다. 예를 들어, 다음과 같은 라우트는 브라우저에서 `http://example.com/user`로 접속해 확인할 수 있습니다.

```
use App\Http\Controllers\UserController;

Route::get('/user', [UserController::class, 'index']);
```

`routes/api.php` 파일에 정의된 라우트는 `RouteServiceProvider`에서 라우트 그룹으로 감싸져 `/api` URI 접두사가 자동으로 적용됩니다. 따라서 파일 내의 각 라우트마다 접두사를 수동으로 추가할 필요가 없습니다. 필요하다면 `RouteServiceProvider` 클래스를 수정해 접두사나 기타 그룹 옵션을 변경할 수 있습니다.

<a name="available-router-methods"></a>
#### 사용 가능한 라우터 메서드

라우터는 모든 HTTP 메서드에 응답하는 라우트를 등록할 수 있도록 다양한 메서드를 제공합니다.

```
Route::get($uri, $callback);
Route::post($uri, $callback);
Route::put($uri, $callback);
Route::patch($uri, $callback);
Route::delete($uri, $callback);
Route::options($uri, $callback);
```

여러 HTTP 메서드에 동시에 대응하는 라우트가 필요한 경우 `match` 메서드를 사용할 수 있습니다. 또는, 모든 HTTP 메서드에 응답하는 라우트를 `any` 메서드로 등록할 수도 있습니다.

```
Route::match(['get', 'post'], '/', function () {
    // ...
});

Route::any('/', function () {
    // ...
});
```

> [!NOTE]
> 동일한 URI에 대해 여러 라우트를 정의할 때, `get`, `post`, `put`, `patch`, `delete`, `options`와 같은 개별 메서드 기반의 라우트를 `any`, `match`, `redirect` 기반 라우트보다 먼저 정의해야 합니다. 그래야 요청이 올바른 라우트와 일치하게 됩니다.

<a name="dependency-injection"></a>
#### 의존성 주입

라우트의 콜백 시그니처에 필요한 의존성을 타입힌트로 지정할 수 있습니다. 라라벨의 [서비스 컨테이너](/docs/10.x/container)가 이를 자동으로 해결해 콜백에 주입해 줍니다. 예를 들어, `Illuminate\Http\Request` 클래스를 타입힌트로 지정하면 현재 HTTP 요청 객체가 라우트 콜백에 자동으로 전달됩니다.

```
use Illuminate\Http\Request;

Route::get('/users', function (Request $request) {
    // ...
});
```

<a name="csrf-protection"></a>
#### CSRF 보호

`web` 라우트 파일에 정의된 `POST`, `PUT`, `PATCH`, `DELETE` 요청을 처리하는 모든 HTML 폼에는 반드시 CSRF 토큰 필드가 포함되어야 합니다. 그렇지 않으면 요청이 거부됩니다. CSRF 보호에 관한 자세한 내용은 [CSRF 문서](/docs/10.x/csrf)에서 확인할 수 있습니다.

```
<form method="POST" action="/profile">
    @csrf
    ...
</form>
```

<a name="redirect-routes"></a>
### 리디렉션 라우트

다른 URI로 리디렉션하는 라우트를 정의할 때는 `Route::redirect` 메서드를 사용할 수 있습니다. 이 메서드는 전체 라우트나 컨트롤러를 정의하지 않고도 간편하게 리디렉션 처리를 할 수 있게 해 줍니다.

```
Route::redirect('/here', '/there');
```

기본적으로 `Route::redirect`는 `302` 상태 코드를 반환합니다. 선택적 세 번째 인수를 통해 상태 코드를 직접 지정할 수 있습니다.

```
Route::redirect('/here', '/there', 301);
```

또는, 영구적인 리디렉션(상태 코드 301)에 대해선 `Route::permanentRedirect` 메서드를 사용할 수도 있습니다.

```
Route::permanentRedirect('/here', '/there');
```

> [!NOTE]
> 리디렉션 라우트에서 라우트 파라미터를 사용할 때, 라라벨에서는 `destination` 및 `status` 파라미터명을 예약어로 사용하므로 사용할 수 없습니다.

<a name="view-routes"></a>
### 뷰 라우트

라우트가 [뷰](/docs/10.x/views)만 반환하면 되도록 할 경우 `Route::view` 메서드를 사용하면 됩니다. `redirect`와 마찬가지로, 전체 라우트나 컨트롤러를 생성하지 않고도 뷰를 반환할 수 있습니다. 첫 번째 인수는 URI, 두 번째 인수는 뷰 이름이고, 필요하다면 세 번째 인수로 뷰에 전달될 데이터를 배열로 넘길 수 있습니다.

```
Route::view('/welcome', 'welcome');

Route::view('/welcome', 'welcome', ['name' => 'Taylor']);
```

> [!NOTE]
> 뷰 라우트에서 라우트 파라미터를 사용할 경우 `view`, `data`, `status`, `headers` 파라미터명은 라라벨에서 예약되어 있으므로 사용할 수 없습니다.

<a name="the-route-list"></a>
### 라우트 목록

`route:list` 아티즌 명령어를 사용하면 애플리케이션에 정의된 모든 라우트의 개요를 간편하게 확인할 수 있습니다.

```shell
php artisan route:list
```

기본적으로 각 라우트에 할당된 미들웨어는 `route:list` 출력에 표시되지 않지만, 명령어에 `-v` 옵션을 추가하면 미들웨어 및 미들웨어 그룹명도 확인할 수 있습니다.

```shell
php artisan route:list -v

# 미들웨어 그룹을 펼치려면...
php artisan route:list -vv
```

특정 URI로 시작하는 라우트만 표시하고 싶을 때는 다음과 같이 `--path` 옵션을 사용할 수 있습니다.

```shell
php artisan route:list --path=api
```

또한, 서드파티 패키지에서 정의된 라우트를 숨기고 싶다면 `route:list` 명령 실행 시 `--except-vendor` 옵션을 사용할 수 있습니다.

```shell
php artisan route:list --except-vendor
```

반대로, 서드파티 패키지에서 정의된 라우트만 표시하려면 `--only-vendor` 옵션을 사용합니다.

```shell
php artisan route:list --only-vendor
```

<a name="route-parameters"></a>
## 라우트 파라미터

<a name="required-parameters"></a>
### 필수 파라미터

라우트에서 URI의 일부 값을 동적으로 받아와야 할 때가 있습니다. 예를 들어 URL에서 사용자의 ID를 받아와야 할 경우, 라우트 파라미터를 정의하면 됩니다.

```
Route::get('/user/{id}', function (string $id) {
    return 'User '.$id;
});
```

필요하다면 라우트에 여러 개의 파라미터를 정의할 수도 있습니다.

```
Route::get('/posts/{post}/comments/{comment}', function (string $postId, string $commentId) {
    // ...
});
```

라우트 파라미터는 항상 `{}` 중괄호로 감싸야 하며, 알파벳 문자만 사용할 수 있습니다. 파라미터명에는 밑줄(`_`)도 사용할 수 있습니다. 라우트 파라미터는 등록 순서대로 콜백이나 컨트롤러에 주입되므로 변수명은 중요하지 않습니다.

<a name="parameters-and-dependency-injection"></a>
#### 파라미터와 의존성 주입

라우트에 의존성을 주입받으면서 라우트 파라미터도 함께 받고 싶을 때는, 의존성을 먼저 나열한 다음에 라우트 파라미터를 나열하면 됩니다.

```
use Illuminate\Http\Request;

Route::get('/user/{id}', function (Request $request, string $id) {
    return 'User '.$id;
});
```

<a name="parameters-optional-parameters"></a>
### 옵셔널 파라미터

경우에 따라 URI에 파라미터가 항상 존재하지 않을 수도 있습니다. 이럴 때는 파라미터명 뒤에 `?`를 붙이면 됩니다. 그리고 콜백 함수에서 해당 변수에 기본값을 반드시 지정해 주세요.

```
Route::get('/user/{name?}', function (?string $name = null) {
    return $name;
});

Route::get('/user/{name?}', function (?string $name = 'John') {
    return $name;
});
```

<a name="parameters-regular-expression-constraints"></a>
### 정규 표현식 제약 조건

라우트 파라미터의 형식을 정규 표현식으로 제한하려면, 라우트 인스턴스에서 `where` 메서드를 사용할 수 있습니다. 파라미터명과 정규식 패턴을 지정하면 됩니다.

```
Route::get('/user/{name}', function (string $name) {
    // ...
})->where('name', '[A-Za-z]+');

Route::get('/user/{id}', function (string $id) {
    // ...
})->where('id', '[0-9]+');

Route::get('/user/{id}/{name}', function (string $id, string $name) {
    // ...
})->where(['id' => '[0-9]+', 'name' => '[a-z]+']);
```

자주 사용하는 정규식 패턴은 헬퍼 메서드로 더 간편하게 추가할 수 있습니다.

```
Route::get('/user/{id}/{name}', function (string $id, string $name) {
    // ...
})->whereNumber('id')->whereAlpha('name');

Route::get('/user/{name}', function (string $name) {
    // ...
})->whereAlphaNumeric('name');

Route::get('/user/{id}', function (string $id) {
    // ...
})->whereUuid('id');

Route::get('/user/{id}', function (string $id) {
    //
})->whereUlid('id');

Route::get('/category/{category}', function (string $category) {
    // ...
})->whereIn('category', ['movie', 'song', 'painting']);
```

요청이 라우트의 패턴 제약 조건에 맞지 않으면 404 HTTP 응답이 반환됩니다.

<a name="parameters-global-constraints"></a>
#### 전역 제약 조건

특정 파라미터명을 가진 라우트에 항상 특정 정규 표현식 제약을 적용하고 싶다면, `App\Providers\RouteServiceProvider`의 `boot` 메서드에서 `pattern` 메서드를 사용할 수 있습니다.

```
/**
 * Define your route model bindings, pattern filters, etc.
 */
public function boot(): void
{
    Route::pattern('id', '[0-9]+');
}
```

한 번 패턴을 지정하면 해당 파라미터명을 사용하는 모든 라우트에 자동으로 적용됩니다.

```
Route::get('/user/{id}', function (string $id) {
    // {id}가 숫자인 경우에만 실행됩니다...
});
```

<a name="parameters-encoded-forward-slashes"></a>
#### 인코딩된 슬래시(/) 문자

라라벨의 라우팅 컴포넌트는 파라미터 값으로 `/`를 제외한 모든 문자를 허용합니다. 만약 `/` 문자를 파라미터 값에 포함시키고 싶다면, 정규 표현식 제약에서 허용 범위를 명시해야 합니다.

```
Route::get('/search/{search}', function (string $search) {
    return $search;
})->where('search', '.*');
```

> [!NOTE]
> 인코딩된 슬래시(`/`)는 반드시 마지막 라우트 세그먼트에서만 허용됩니다.

<a name="named-routes"></a>
## 이름이 지정된 라우트

이름이 지정된 라우트는 특정 라우트에 대해 URL 생성이나 리디렉션을 간편하게 할 수 있도록 해줍니다. 라우트 정의 시 `name` 메서드를 체이닝해 라우트 이름을 지정할 수 있습니다.

```
Route::get('/user/profile', function () {
    // ...
})->name('profile');
```

컨트롤러 액션에 대해서도 라우트 이름을 지정할 수 있습니다.

```
Route::get(
    '/user/profile',
    [UserProfileController::class, 'show']
)->name('profile');
```

> [!NOTE]
> 라우트 이름은 반드시 고유해야 합니다.

<a name="generating-urls-to-named-routes"></a>
#### 이름이 지정된 라우트로 URL 생성

이름이 지정된 라우트가 있으면, `route`와 `redirect` 헬퍼 함수를 사용해 해당 라우트의 URL이나 리디렉션을 간편하게 생성할 수 있습니다.

```
// URL 생성
$url = route('profile');

// 리디렉션 생성
return redirect()->route('profile');

return to_route('profile');
```

만약 이름이 지정된 라우트가 파라미터를 필요로 한다면, `route` 함수의 두 번째 인수로 파라미터를 배열로 넘기면 됩니다. 전달한 파라미터들은 URL에서 올바른 위치에 자동으로 들어갑니다.

```
Route::get('/user/{id}/profile', function (string $id) {
    // ...
})->name('profile');

$url = route('profile', ['id' => 1]);
```

추가 파라미터를 배열에 포함시키면, key/value 쌍이 쿼리 스트링으로 URL에 자동 추가됩니다.

```
Route::get('/user/{id}/profile', function (string $id) {
    // ...
})->name('profile');

$url = route('profile', ['id' => 1, 'photos' => 'yes']);

// /user/1/profile?photos=yes
```

> [!NOTE]
> URL 파라미터에 대해 현재 로케일과 같은 요청 전체에 적용할 기본값을 지정하고 싶을 수 있습니다. 이 경우 [`URL::defaults` 메서드](/docs/10.x/urls#default-values)를 사용할 수 있습니다.

<a name="inspecting-the-current-route"></a>
#### 현재 라우트 검사

현재 요청이 특정 이름의 라우트로 처리되었는지 확인하고 싶다면, 라우트 인스턴스에서 `named` 메서드를 사용할 수 있습니다. 예를 들어, 라우트 미들웨어에서 현재 라우트명을 확인할 수 있습니다.

```
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Handle an incoming request.
 *
 * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
 */
public function handle(Request $request, Closure $next): Response
{
    if ($request->route()->named('profile')) {
        // ...
    }

    return $next($request);
}
```

<a name="route-groups"></a>
## 라우트 그룹

라우트 그룹을 사용하면 미들웨어와 같은 속성을 여러 라우트에 손쉽게 공유할 수 있습니다. 각 라우트에 개별적으로 속성을 명시하지 않아도 됩니다.

중첩된 그룹은 부모 그룹과 속성 병합이 지능적으로 이루어집니다. 미들웨어와 `where` 조건은 병합되고, 이름과 URI 접두사는 이어 붙여집니다. 네임스페이스 구분자 및 슬래시는 상황에 따라 자동으로 추가됩니다.

<a name="route-group-middleware"></a>
### 미들웨어

그룹 내 모든 라우트에 [미들웨어](/docs/10.x/middleware)를 지정하려면 라우트 그룹 정의 전에 `middleware` 메서드를 사용합니다. 배열에 나열한 순서대로 미들웨어가 실행됩니다.

```
Route::middleware(['first', 'second'])->group(function () {
    Route::get('/', function () {
        // first, second 미들웨어가 적용됩니다...
    });

    Route::get('/user/profile', function () {
        // first, second 미들웨어가 적용됩니다...
    });
});
```

<a name="route-group-controllers"></a>
### 컨트롤러

여러 라우트가 모두 같은 [컨트롤러](/docs/10.x/controllers)를 사용할 경우 `controller` 메서드를 호출해 그룹 전체에 공통 컨트롤러를 지정할 수 있습니다. 개별 라우트에서는 컨트롤러의 메서드명만 지정하면 됩니다.

```
use App\Http\Controllers\OrderController;

Route::controller(OrderController::class)->group(function () {
    Route::get('/orders/{id}', 'show');
    Route::post('/orders', 'store');
});
```

<a name="route-group-subdomain-routing"></a>
### 서브도메인 라우팅

라우트 그룹은 서브도메인 라우팅에도 사용할 수 있습니다. 서브도메인에도 라우트 파라미터를 지정할 수 있으며, 이를 라우트나 컨트롤러에서 그대로 사용할 수 있습니다. 서브도메인은 그룹 정의 전에 `domain` 메서드를 호출해 지정합니다.

```
Route::domain('{account}.example.com')->group(function () {
    Route::get('user/{id}', function (string $account, string $id) {
        // ...
    });
});
```

> [!NOTE]
> 서브도메인 라우트가 정상적으로 동작하려면, 반드시 루트 도메인 라우트 등록보다 서브도메인 라우트를 먼저 등록해야 합니다. 그래야 루트 도메인 라우트가 동일 경로의 서브도메인 라우트를 덮어쓰지 않습니다.

<a name="route-group-prefixes"></a>
### 라우트 접두사

`prefix` 메서드를 사용해 그룹 내 모든 라우트의 URI에 같은 접두사를 붙일 수 있습니다. 예를 들어, 그룹 내 모든 URI 앞에 `admin` 접두사를 붙이고 싶다면 다음과 같이 정의합니다.

```
Route::prefix('admin')->group(function () {
    Route::get('/users', function () {
        // "/admin/users" URL과 매칭됩니다
    });
});
```

<a name="route-group-name-prefixes"></a>
### 라우트 이름 접두사

`name` 메서드를 활용해 그룹 내 모든 라우트 이름에 특정 문자열을 접두사로 붙일 수 있습니다. 일반적으로, 그룹 내 라우트 이름 앞에 `admin.`과 같이 점(`.`)을 포함한 문자열을 접두사로 붙입니다.

```
Route::name('admin.')->group(function () {
    Route::get('/users', function () {
        // "admin.users"라는 이름이 할당됩니다...
    })->name('users');
});
```

<a name="route-model-binding"></a>
## 라우트 모델 바인딩

라우트나 컨트롤러 액션에 모델 ID를 주입받는 경우, 그 ID와 일치하는 모델을 데이터베이스에서 직접 조회하는 코드를 작성하는 경우가 많습니다. 라라벨의 라우트 모델 바인딩을 사용하면, 이런 반복적인 쿼리 작업 없이 일치하는 모델 인스턴스를 라우트에 자동으로 주입받을 수 있습니다. 즉, 단순히 사용자 ID 대신 해당하는 전체 `User` 모델 인스턴스를 바로 받을 수 있습니다.

<a name="implicit-binding"></a>
### 암묵적 바인딩

라우트나 컨트롤러 액션의 파라미터 변수명이 라우트 세그먼트명과 일치하고, 타입힌트가 Eloquent 모델로 지정되면 라라벨이 자동으로 모델 인스턴스를 찾아서 주입해 줍니다. 예를 들면 다음과 같습니다.

```
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
});
```

위 예시에서 `$user`가 `App\Models\User` Eloquent 모델로 타입힌트 되어 있고, URI 세그먼트 `{user}`와 이름이 일치하므로 라라벨은 요청된 값과 일치하는 ID를 가진 모델 인스턴스를 자동으로 주입합니다. 만약 해당하는 모델이 데이터베이스에 없다면 404 HTTP 응답이 자동으로 반환됩니다.

암묵적 바인딩은 컨트롤러 메서드에서도 사용할 수 있습니다. 이때도 `{user}` URI 세그먼트와 컨트롤러의 `$user` 변수명이 일치해야 합니다.

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
#### 소프트 딜리트된 모델

일반적으로, 암묵적 모델 바인딩은 [소프트 딜리트](/docs/10.x/eloquent#soft-deleting)된 모델을 조회하지 않습니다. 그러나 라우트 정의 시 `withTrashed` 메서드를 체이닝하면, 소프트 딜리트된 모델도 바인딩 대상으로 조회할 수 있습니다.

```
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
})->withTrashed();
```

<a name="customizing-the-default-key-name"></a>
#### 키 커스터마이즈

기본적으로 바인딩은 `id` 컬럼을 사용하지만, 다른 컬럼을 사용하고 싶다면 라우트 파라미터 정의에서 컬럼명을 지정하면 됩니다.

```
use App\Models\Post;

Route::get('/posts/{post:slug}', function (Post $post) {
    return $post;
});
```

특정 모델 클래스를 항상 `id` 외의 다른 컬럼으로 바인딩하고 싶다면, Eloquent 모델에서 `getRouteKeyName` 메서드를 오버라이드하면 됩니다.

```
/**
 * Get the route key for the model.
 */
public function getRouteKeyName(): string
{
    return 'slug';
}
```

<a name="implicit-model-binding-scoping"></a>
#### 커스텀 키 및 스코프 지정

한 라우트 정의에서 복수 개의 Eloquent 모델을 암묵적 바인딩으로 주입받을 때, 두 번째 모델은 첫 번째 모델(부모)의 하위(자식)인 경우에만 조회하도록 스코프 범위를 제한할 수 있습니다. 예를 들어, 다음 라우트는 특정 사용자의 블로그 글을 slug로 조회합니다.

```
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
});
```

커스텀 키 값에 대한 암묵적 바인딩이 중첩 파라미터로 사용될 때, 라라벨은 해당 모델이 반드시 상위 모델의 자식(연관관계 기반)인지 자동으로 쿼리를 스코핑합니다. 이 예시에서는 `User` 모델에 `posts`(파라미터명의 복수형)라는 연관관계가 있다고 가정하고, 이를 활용해 `Post` 모델을 조회합니다.

커스텀 키를 지정하지 않은 경우에도 자식 바인딩을 적용하고 싶음면, 라우트 정의 시 `scopeBindings` 메서드를 체이닝하면 됩니다.

```
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
    return $post;
})->scopeBindings();
```

또는, 라우트 그룹 전체에 스코프 바인딩을 적용할 수도 있습니다.

```
Route::scopeBindings()->group(function () {
    Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
        return $post;
    });
});
```

반대로 스코프 바인딩을 비활성화하려면 `withoutScopedBindings` 메서드를 사용할 수 있습니다.

```
Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
})->withoutScopedBindings();
```

<a name="customizing-missing-model-behavior"></a>
#### 모델이 없을 때 동작 커스터마이즈

기본적으로, 암묵적 바인딩 결과로 모델이 존재하지 않을 경우 404 HTTP 응답이 반환됩니다. 그러나, `missing` 메서드를 사용하면 이런 상황에서 실행할 커스텀 클로저를 등록할 수 있습니다.

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

PHP 8.1부터는 [Enum](https://www.php.net/manual/en/language.enumerations.backed.php)을 지원합니다. 라라벨도 이를 활용해, 라우트 정의에서 [string 기반 Enum](https://www.php.net/manual/en/language.enumerations.backed.php)을 타입힌트로 지정할 수 있고, 해당 세그먼트가 유효한 Enum 값일 때만 라우트가 동작합니다. 그렇지 않으면 자동으로 404 HTTP 응답이 반환됩니다. 예를 들어 아래와 같은 Enum이 있을 때,

```php
<?php

namespace App\Enums;

enum Category: string
{
    case Fruits = 'fruits';
    case People = 'people';
}
```

`{category}` 라우트 세그먼트가 `fruits` 또는 `people`일 때만 라우트가 동작합니다. 그렇지 않으면 404 에러가 반환됩니다.

```php
use App\Enums\Category;
use Illuminate\Support\Facades\Route;

Route::get('/categories/{category}', function (Category $category) {
    return $category->value;
});
```

<a name="explicit-binding"></a>
### 명시적 바인딩

라라벨의 암묵적, 규약 기반 모델 바인딩 이외에도, 라우트 파라미터와 모델 대응 방식을 개발자가 명시적으로 정의할 수 있습니다. 명시적 바인딩을 등록하려면, 라우터의 `model` 메서드를 사용해 해당 파라미터명과 클래스명을 등록하면 됩니다. 이 작업은 `RouteServiceProvider` 클래스의 `boot` 메서드 초입부에 정의하는 것이 좋습니다.

```
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * Define your route model bindings, pattern filters, etc.
 */
public function boot(): void
{
    Route::model('user', User::class);

    // ...
}
```

이후 `{user}` 파라미터를 포함한 라우트를 정의합니다.

```
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    // ...
});
```

이렇게 하면 모든 `{user}` 파라미터가 `App\Models\User` 모델 인스턴스로 주입됩니다. 예를 들어 `users/1` 요청 시 ID가 1인 User 인스턴스가 데이터베이스에서 조회되어 라우트에 주입됩니다.

만약 해당 모델 인스턴스가 없을 경우 404 HTTP 응답이 자동 반환됩니다.

<a name="customizing-the-resolution-logic"></a>
#### 바인딩 해석 로직 커스터마이즈

모델 바인딩 동작을 더욱 세밀하게 제어하고 싶을 때는 `Route::bind` 메서드를 사용하면 됩니다. 이 메서드에 전달하는 클로저는 URI 세그먼트 값을 받아 해당 파라미터에 주입할 클래스 인스턴스를 반환해야 합니다. 이 처리는 애플리케이션의 `RouteServiceProvider`의 `boot` 메서드에서 해 주어야 합니다.

```
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * Define your route model bindings, pattern filters, etc.
 */
public function boot(): void
{
    Route::bind('user', function (string $value) {
        return User::where('name', $value)->firstOrFail();
    });

    // ...
}
```

또는, Eloquent 모델에서 `resolveRouteBinding` 메서드를 오버라이드해도 됩니다. 이 메서드는 URI 세그먼트 값을 받아 해당 인스턴스를 반환해야 합니다.

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

[암묵적 바인딩 스코프](#implicit-model-binding-scoping)를 사용하는 라우트에서는 `resolveChildRouteBinding` 메서드를 통해 자식 바인딩 모델 해석 로직을 정의할 수 있습니다.

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

`Route::fallback` 메서드를 사용하면, 어떤 라우트에도 매칭되지 않은 요청을 처리하는 라우트를 정의할 수 있습니다. 일반적으로 이런 처리는 애플리케이션의 예외 핸들러를 통해 "404" 페이지를 렌더링합니다. 그러나 `routes/web.php` 파일에서 `fallback` 라우트를 정의할 경우, `web` 미들웨어 그룹의 모든 미들웨어가 해당 라우트에도 적용됩니다. 필요한 경우 추가 미들웨어를 지정할 수도 있습니다.

```
Route::fallback(function () {
    // ...
});
```

> [!NOTE]
> 폴백 라우트는 반드시 애플리케이션에서 마지막에 등록해야 합니다.

<a name="rate-limiting"></a>
## 속도 제한

<a name="defining-rate-limiters"></a>
### 속도 제한자 정의

라라벨은 특정 라우트 또는 라우트 그룹에 대한 트래픽 양을 제한할 수 있도록 강력하고 커스터마이즈 가능한 속도 제한 서비스를 제공합니다. 먼저, 애플리케이션에 맞는 속도 제한자 구성을 정의해야 합니다.

일반적으로 속도 제한자는 애플리케이션의 `App\Providers\RouteServiceProvider` 클래스의 `boot` 메서드 내에 정의합니다. 실제로 이 클래스는 이미 `routes/api.php`에 적용되는 속도 제한자 정의를 내장하고 있습니다.

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Define your route model bindings, pattern filters, and other route configuration.
 */
protected function boot(): void
{
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
    });

    // ...
}
```

속도 제한자는 `RateLimiter` 파사드의 `for` 메서드로 정의합니다. 이 메서드는 제한자 이름과 해당 라우트 또는 그룹에 적용할 제한 규칙을 반환하는 클로저를 인수로 받습니다. 제한 규칙은 `Illuminate\Cache\RateLimiting\Limit` 클래스의 인스턴스로, 여러 빌더 메서드를 통해 빠르게 구성이 가능합니다. 제한자 이름은 원하는 임의의 문자열을 사용할 수 있습니다.

```
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Define your route model bindings, pattern filters, and other route configuration.
 */
protected function boot(): void
{
    RateLimiter::for('global', function (Request $request) {
        return Limit::perMinute(1000);
    });

    // ...
}
```

요청이 해당 속도 제한을 초과하면, 라라벨은 자동으로 429 HTTP 상태 코드로 응답합니다. 특정한 속도 제한 응답을 커스터마이즈하고 싶다면 `response` 메서드를 사용하면 됩니다.

```
RateLimiter::for('global', function (Request $request) {
    return Limit::perMinute(1000)->response(function (Request $request, array $headers) {
        return response('Custom response...', 429, $headers);
    });
});
```

속도 제한자 콜백에는 HTTP 요청 인스턴스가 전달되므로, 요청 정보나 인증 사용자에 따라 동적으로 다양한 제한을 적용할 수도 있습니다.

```
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
                ? Limit::none()
                : Limit::perMinute(100);
});
```

<a name="segmenting-rate-limits"></a>
#### 속도 제한 세분화

경우에 따라 속도 제한을 어떤 임의의 값에 따라 세분화하고 싶을 수 있습니다. 예를 들어, 특정 라우트에 대해 IP별로 분 당 100회로 제한하고 싶다면, 제한 규칙 작성 시 `by` 메서드를 사용할 수 있습니다.

```
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
                ? Limit::none()
                : Limit::perMinute(100)->by($request->ip());
});
```

또 다른 예시로, 인증된 사용자는 사용자 ID 기준으로 분당 100회, 비회원이라면 IP 기준으로 분당 10회로 제한할 수 있습니다.

```
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()
                ? Limit::perMinute(100)->by($request->user()->id)
                : Limit::perMinute(10)->by($request->ip());
});
```

<a name="multiple-rate-limits"></a>
#### 다중 속도 제한

필요하다면 한 속도 제한자에 대해 제한 규칙을 배열로 반환할 수 있습니다. 이 경우, 배열에 배치한 순서대로 각 제한 조건이 모두 평가됩니다.

```
RateLimiter::for('login', function (Request $request) {
    return [
        Limit::perMinute(500),
        Limit::perMinute(3)->by($request->input('email')),
    ];
});
```

<a name="attaching-rate-limiters-to-routes"></a>
### 라우트에 속도 제한자 적용

속도 제한자는 해당 라우트 또는 라우트 그룹에 `throttle` [미들웨어](/docs/10.x/middleware)를 사용해 지정할 수 있습니다. `throttle` 미들웨어에는 사용할 속도 제한자 이름을 인수로 넘깁니다.

```
Route::middleware(['throttle:uploads'])->group(function () {
    Route::post('/audio', function () {
        // ...
    });

    Route::post('/video', function () {
        // ...
    });
});
```

<a name="throttling-with-redis"></a>
#### Redis 기반 제한

일반적으로, `throttle` 미들웨어는 `Illuminate\Routing\Middleware\ThrottleRequests` 클래스에 매핑됩니다. 이 매핑은 애플리케이션의 HTTP 커널(`App\Http\Kernel`)에 정의되어 있습니다. 그러나 캐시 드라이버로 Redis를 사용할 때는, 해당 매핑을 `Illuminate\Routing\Middleware\ThrottleRequestsWithRedis` 클래스로 변경하면, Redis를 활용한 속도 제한이 더 효율적으로 처리됩니다.

```
'throttle' => \Illuminate\Routing\Middleware\ThrottleRequestsWithRedis::class,
```

<a name="form-method-spoofing"></a>
## 폼 메서드 스푸핑

HTML 폼은 실제로 `PUT`, `PATCH`, `DELETE` 요청을 직접 지원하지 않습니다. 따라서 폼에서 이러한 요청을 처리해야 할 때에는, 숨겨진 필드 `_method`를 추가해 HTTP 메서드 정보를 전달해야 합니다. 폼에서 `_method` 필드의 값으로 원하는 HTTP 메서드를 지정하면, 해당 메서드로 요청이 처리됩니다.

```
<form action="/example" method="POST">
    <input type="hidden" name="_method" value="PUT">
    <input type="hidden" name="_token" value="{{ csrf_token() }}">
</form>
```

간편하게 `_method` 입력 필드를 생성하려면 [Blade 디렉티브](/docs/10.x/blade)인 `@method`를 사용할 수 있습니다.

```
<form action="/example" method="POST">
    @method('PUT')
    @csrf
</form>
```

<a name="accessing-the-current-route"></a>
## 현재 라우트 정보 접근

`Route` 파사드의 `current`, `currentRouteName`, `currentRouteAction` 메서드를 사용해, 현재 요청을 처리하는 라우트의 정보를 확인할 수 있습니다.

```
use Illuminate\Support\Facades\Route;

$route = Route::current(); // Illuminate\Routing\Route
$name = Route::currentRouteName(); // string
$action = Route::currentRouteAction(); // string
```

라우터와 라우트 클래스에서 사용 가능한 전체 메서드 목록은 각각 [Route 파사드의 기반 클래스](https://laravel.com/api/10.x/Illuminate/Routing/Router.html) 및 [라우트 인스턴스](https://laravel.com/api/10.x/Illuminate/Routing/Route.html) API 문서를 참고하십시오.

<a name="cors"></a>
## 교차 출처 리소스 공유(CORS)

라라벨은 CORS `OPTIONS` HTTP 요청에 대해, 설정한 값으로 자동으로 응답할 수 있습니다. 모든 CORS 설정은 애플리케이션의 `config/cors.php` 설정 파일에서 지정할 수 있습니다. `OPTIONS` 요청은 글로벌 미들웨어 스택에 기본 포함된 `HandleCors` [미들웨어](/docs/10.x/middleware)에 의해 자동 처리됩니다. 글로벌 미들웨어 스택은 애플리케이션의 HTTP 커널(`App\Http\Kernel`)에 정의되어 있습니다.

> [!NOTE]
> CORS와 CORS 헤더에 관한 자세한 정보는 [MDN 웹 문서의 CORS 설명](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers)을 참고하세요.

<a name="route-caching"></a>
## 라우트 캐싱

애플리케이션을 운영(프로덕션) 환경에 배포할 때에는 라라벨의 라우트 캐시 기능을 꼭 활용하는 것이 좋습니다. 라우트 캐시를 사용하면 전체 라우트 등록 시간이 크게 단축됩니다. 라우트 캐시 파일을 생성하려면 다음과 같이 `route:cache` 아티즌 명령어를 실행하면 됩니다.

```shell
php artisan route:cache
```

이 명령어를 실행하면, 모든 요청에서 캐시된 라우트 파일이 자동 로드됩니다. 새 라우트를 추가하면 반드시 다시 라우트 캐시를 생성해야 하므로, 라우트 캐시는 실제 배포(디플로이) 과정에서만 실행해야 합니다.

라우트 캐시를 삭제하려면 다음 명령어를 사용합니다.

```shell
php artisan route:clear
```