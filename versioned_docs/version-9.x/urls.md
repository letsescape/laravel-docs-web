# URL 생성 (URL Generation)

- [소개](#introduction)
- [기본 사항](#the-basics)
    - [URL 생성하기](#generating-urls)
    - [현재 URL 가져오기](#accessing-the-current-url)
- [이름이 지정된 라우트의 URL](#urls-for-named-routes)
    - [서명된 URL](#signed-urls)
- [컨트롤러 액션의 URL](#urls-for-controller-actions)
- [기본값 지정](#default-values)

<a name="introduction"></a>
## 소개

라라벨은 애플리케이션에서 URL을 생성할 때 편리하게 사용할 수 있는 여러 헬퍼 함수를 제공합니다. 이 헬퍼들은 주로 템플릿과 API 응답에서의 링크 생성이나, 애플리케이션 내 다른 위치로 리디렉션을 할 때 유용하게 사용됩니다.

<a name="the-basics"></a>
## 기본 사항

<a name="generating-urls"></a>
### URL 생성하기

`url` 헬퍼 함수를 사용하여 애플리케이션의 임의의 URL을 생성할 수 있습니다. 이 때 생성되는 URL은 처리 중인 현재 요청의 스킴(HTTP 또는 HTTPS)과 호스트 정보를 자동으로 반영합니다.

```
$post = App\Models\Post::find(1);

echo url("/posts/{$post->id}");

// http://example.com/posts/1
```

<a name="accessing-the-current-url"></a>
### 현재 URL 가져오기

`url` 헬퍼에 경로를 전달하지 않으면 `Illuminate\Routing\UrlGenerator` 인스턴스가 반환되어, 현재 URL에 관한 정보를 조회할 수 있습니다.

```
// 쿼리 문자열을 제외한 현재 URL 가져오기...
echo url()->current();

// 쿼리 문자열을 포함한 전체 현재 URL 가져오기...
echo url()->full();

// 이전 요청의 전체 URL 가져오기...
echo url()->previous();
```

이러한 메서드들은 [파사드](/docs/9.x/facades)인 `URL`을 통해서도 사용할 수 있습니다.

```
use Illuminate\Support\Facades\URL;

echo URL::current();
```

<a name="urls-for-named-routes"></a>
## 이름이 지정된 라우트의 URL

`route` 헬퍼는 [이름이 지정된 라우트](/docs/9.x/routing#named-routes)로 이동하는 URL을 생성할 때 사용합니다. 이름이 지정된 라우트를 사용하면 실제 라우트의 URL에 직접 의존하지 않아도 되어, 라우트 URL이 변경되더라도 `route` 함수 호출 코드를 수정할 필요가 없습니다. 예를 들어, 아래와 같은 라우트가 있다고 가정해보겠습니다.

```
Route::get('/post/{post}', function (Post $post) {
    //
})->name('post.show');
```

이 라우트로 이동하는 URL을 생성하려면 다음과 같이 `route` 헬퍼를 사용하면 됩니다.

```
echo route('post.show', ['post' => 1]);

// http://example.com/post/1
```

물론, `route` 헬퍼는 여러 개의 파라미터를 가지는 라우트에 대해서도 URL을 생성할 수 있습니다.

```
Route::get('/post/{post}/comment/{comment}', function (Post $post, Comment $comment) {
    //
})->name('comment.show');

echo route('comment.show', ['post' => 1, 'comment' => 3]);

// http://example.com/post/1/comment/3
```

라우트 정의에 없는 추가 배열 요소들은 URL의 쿼리 문자열로 자동으로 추가됩니다.

```
echo route('post.show', ['post' => 1, 'search' => 'rocket']);

// http://example.com/post/1?search=rocket
```

<a name="eloquent-models"></a>
#### Eloquent 모델

[Eloquent 모델](/docs/9.x/eloquent)의 라우트 키(보통 기본 키 값)를 이용해 URL을 생성하는 경우가 많습니다. 이런 경우, 파라미터 값으로 Eloquent 모델을 직접 전달할 수 있으며, `route` 헬퍼가 모델의 라우트 키를 자동으로 추출하여 사용합니다.

```
echo route('post.show', ['post' => $post]);
```

<a name="signed-urls"></a>
### 서명된 URL

라라벨은 이름이 지정된 라우트에 대해 "서명된" URL을 손쉽게 만들 수 있도록 지원합니다. 서명된 URL은 쿼리 문자열에 "서명(signature)" 해시값이 추가되어, 생성 이후 URL이 변경되지 않았음을 라라벨이 검증할 수 있도록 해줍니다. 서명된 URL은 외부에 공개되지만 URL 변조로부터 보호해야 하는 라우트에서 특히 유용합니다.

예를 들어, 이메일로 전송하는 공개 "구독 해지" 링크를 구현할 때 서명된 URL을 사용할 수 있습니다. 이름이 지정된 라우트의 서명된 URL을 생성하려면 `URL` 파사드의 `signedRoute` 메서드를 사용하세요.

```
use Illuminate\Support\Facades\URL;

return URL::signedRoute('unsubscribe', ['user' => 1]);
```

지정한 시간 후 만료되는 임시 서명 URL을 만들고 싶다면 `temporarySignedRoute` 메서드를 사용할 수 있습니다. 이 경우 라라벨은 서명된 URL 안에 암호화된 만료 타임스탬프가 아직 유효한지 확인합니다.

```
use Illuminate\Support\Facades\URL;

return URL::temporarySignedRoute(
    'unsubscribe', now()->addMinutes(30), ['user' => 1]
);
```

<a name="validating-signed-route-requests"></a>
#### 서명된 라우트 요청 검증

들어오는 요청이 유효한 서명을 가지고 있는지 확인하려면, 요청 객체(`Illuminate\Http\Request`)에서 `hasValidSignature` 메서드를 호출해야 합니다.

```
use Illuminate\Http\Request;

Route::get('/unsubscribe/{user}', function (Request $request) {
    if (! $request->hasValidSignature()) {
        abort(401);
    }

    // ...
})->name('unsubscribe');
```

때로는, 프론트엔드에서 페이지네이션 등으로 URL에 데이터를 추가해야 할 수도 있습니다. 이럴 경우, 인증에서 무시해야 할 쿼리 파라미터를 `hasValidSignatureWhileIgnoring` 메서드에 지정할 수 있습니다. 단, 무시된 파라미터는 누구나 자유롭게 수정할 수 있다는 점을 주의하세요.

```
if (! $request->hasValidSignatureWhileIgnoring(['page', 'order'])) {
    abort(401);
}
```

서명된 URL을 직접 검증하는 대신, 라우트에 `Illuminate\Routing\Middleware\ValidateSignature` [미들웨어](/docs/9.x/middleware)를 부여할 수도 있습니다. 만약 이 미들웨어가 등록되어 있지 않다면 HTTP 커널의 `routeMiddleware` 배열에 키를 할당해 추가합니다.

```
/**
 * The application's route middleware.
 *
 * These middleware may be assigned to groups or used individually.
 *
 * @var array
 */
protected $routeMiddleware = [
    'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,
];
```

미들웨어 등록을 마쳤다면, 라우트에 해당 미들웨어를 적용할 수 있습니다. 요청이 유효한 서명을 포함하지 않은 경우 미들웨어는 자동으로 `403` HTTP 응답을 반환합니다.

```
Route::post('/unsubscribe/{user}', function (Request $request) {
    // ...
})->name('unsubscribe')->middleware('signed');
```

<a name="responding-to-invalid-signed-routes"></a>
#### 잘못된 서명 라우트에 대한 응답

사용자가 만료된 서명 URL에 접근하면, 기본적으로 `403` HTTP 상태 코드에 해당하는 일반적인 에러 페이지가 표시됩니다. 하지만 예외 처리기에서 `InvalidSignatureException` 예외에 대한 커스텀 "renderable" 클로저를 정의하여 이 동작을 원하는 대로 맞춤 설정할 수 있습니다. 이 클로저는 HTTP 응답을 반환해야 합니다.

```
use Illuminate\Routing\Exceptions\InvalidSignatureException;

/**
 * Register the exception handling callbacks for the application.
 *
 * @return void
 */
public function register()
{
    $this->renderable(function (InvalidSignatureException $e) {
        return response()->view('error.link-expired', [], 403);
    });
}
```

<a name="urls-for-controller-actions"></a>
## 컨트롤러 액션의 URL

`action` 함수는 지정한 컨트롤러 액션에 해당하는 URL을 생성합니다.

```
use App\Http\Controllers\HomeController;

$url = action([HomeController::class, 'index']);
```

만약 컨트롤러 메서드가 라우트 파라미터를 받는 경우, 두 번째 인수로 연관 배열 형태의 파라미터를 전달할 수 있습니다.

```
$url = action([UserController::class, 'profile'], ['id' => 1]);
```

<a name="default-values"></a>
## 기본값 지정

일부 애플리케이션에서는 특정 URL 파라미터에 대해 요청마다 기본값을 지정하고 싶을 수도 있습니다. 예를 들어, 여러 라우트에서 `{locale}` 파라미터를 사용하는 경우를 가정해보세요.

```
Route::get('/{locale}/posts', function () {
    //
})->name('post.index');
```

매번 `route` 헬퍼를 호출할 때마다 `locale` 값을 일일이 전달하는 것은 번거로운 일입니다. 이때는 `URL::defaults` 메서드를 이용해 해당 파라미터의 기본값을 설정할 수 있습니다. 이렇게 하면 현재 요청에 한해 항상 이 기본값이 자동으로 적용됩니다. 보통 [라우트 미들웨어](/docs/9.x/middleware#assigning-middleware-to-routes) 내에서 현재 요청 정보를 활용하여 호출하는 것이 좋습니다.

```
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\URL;

class SetDefaultLocaleForUrls
{
    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return \Illuminate\Http\Response
     */
    public function handle($request, Closure $next)
    {
        URL::defaults(['locale' => $request->user()->locale]);

        return $next($request);
    }
}
```

`locale` 파라미터의 기본값을 설정한 후에는, 이후 `route` 헬퍼를 사용할 때 더 이상 별도로 값을 전달하지 않아도 됩니다.

<a name="url-defaults-middleware-priority"></a>
#### URL 기본값과 미들웨어 우선순위

URL 기본값을 지정하면 라라벨의 암묵적 모델 바인딩 처리에 영향을 줄 수 있습니다. 따라서 URL 기본값을 설정하는 미들웨어가 라라벨의 `SubstituteBindings` 미들웨어보다 먼저 실행되도록 [미들웨어 우선순위](/docs/9.x/middleware#sorting-middleware)를 반드시 조정해야 합니다. 이를 위해서는 애플리케이션 HTTP 커널의 `$middlewarePriority` 프로퍼티에서, 해당 미들웨어가 `SubstituteBindings` 미들웨어보다 앞서 위치하도록 설정하면 됩니다.

`$middlewarePriority` 프로퍼티는 기본적으로 `Illuminate\Foundation\Http\Kernel` 클래스에 정의되어 있습니다. 정의를 복사하여 애플리케이션의 HTTP 커널에 덮어쓰고, 필요한 순서로 수정하면 됩니다.

```
/**
 * The priority-sorted list of middleware.
 *
 * This forces non-global middleware to always be in the given order.
 *
 * @var array
 */
protected $middlewarePriority = [
    // ...
     \App\Http\Middleware\SetDefaultLocaleForUrls::class,
     \Illuminate\Routing\Middleware\SubstituteBindings::class,
     // ...
];
```