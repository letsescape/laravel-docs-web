# URL 생성 (URL Generation)

- [소개](#introduction)
- [기본 사용법](#the-basics)
    - [URL 생성하기](#generating-urls)
    - [현재 URL 접근하기](#accessing-the-current-url)
- [이름이 지정된 라우트의 URL](#urls-for-named-routes)
    - [서명된 URL](#signed-urls)
- [컨트롤러 액션을 위한 URL](#urls-for-controller-actions)
- [기본값 설정](#default-values)

<a name="introduction"></a>
## 소개

라라벨은 애플리케이션에서 URL을 생성하는 데 도움이 되는 다양한 헬퍼를 제공합니다. 이 헬퍼들은 주로 템플릿이나 API 응답에서 링크를 만들거나, 애플리케이션의 다른 위치로 리다이렉트할 때 유용하게 사용할 수 있습니다.

<a name="the-basics"></a>
## 기본 사용법

<a name="generating-urls"></a>
### URL 생성하기

`url` 헬퍼를 이용하면 애플리케이션에서 자유롭게 URL을 생성할 수 있습니다. 생성된 URL은 현재 애플리케이션이 처리 중인 요청의 스킴(HTTP 또는 HTTPS)과 호스트 정보를 자동으로 사용합니다.

```
$post = App\Models\Post::find(1);

echo url("/posts/{$post->id}");

// http://example.com/posts/1
```

<a name="accessing-the-current-url"></a>
### 현재 URL 접근하기

`url` 헬퍼에 경로를 전달하지 않으면, `Illuminate\Routing\UrlGenerator` 인스턴스가 반환됩니다. 이를 통해 현재 URL에 대한 다양한 정보를 얻을 수 있습니다.

```
// 쿼리 스트링을 제외한 현재 URL을 가져옙니다...
echo url()->current();

// 쿼리 스트링을 포함한 현재 전체 URL을 가져옵니다...
echo url()->full();

// 이전 요청의 전체 URL을 가져옵니다...
echo url()->previous();
```

이러한 메서드는 `URL` [파사드](/docs/8.x/facades)를 통해서도 사용할 수 있습니다.

```
use Illuminate\Support\Facades\URL;

echo URL::current();
```

<a name="urls-for-named-routes"></a>
## 이름이 지정된 라우트의 URL

`route` 헬퍼를 사용하면 [이름이 지정된 라우트](/docs/8.x/routing#named-routes)의 URL을 간단하게 생성할 수 있습니다. 이름이 지정된 라우트를 사용하면, 라우트의 실제 URL에 의존하지 않고도 URL을 생성할 수 있기 때문에, 라우트의 URL이 변경되더라도 `route` 함수를 사용하는 부분은 변경할 필요가 없습니다. 예를 들어, 다음과 같이 라우트를 정의했다고 가정해봅니다.

```
Route::get('/post/{post}', function (Post $post) {
    //
})->name('post.show');
```

이 라우트로 이동하는 URL을 생성하려면, 아래와 같이 `route` 헬퍼를 사용할 수 있습니다.

```
echo route('post.show', ['post' => 1]);

// http://example.com/post/1
```

물론, `route` 헬퍼는 여러 개의 파라미터가 필요한 라우트의 URL도 생성할 수 있습니다.

```
Route::get('/post/{post}/comment/{comment}', function (Post $post, Comment $comment) {
    //
})->name('comment.show');

echo route('comment.show', ['post' => 1, 'comment' => 3]);

// http://example.com/post/1/comment/3
```

라우트에 정의되지 않은 추가 배열 요소들은 쿼리 스트링으로 자동 추가됩니다.

```
echo route('post.show', ['post' => 1, 'search' => 'rocket']);

// http://example.com/post/1?search=rocket
```

<a name="eloquent-models"></a>
#### Eloquent 모델

[엘로퀀트 모델](/docs/8.x/eloquent)의 라우트 키(보통 기본키)를 사용해서 URL을 생성하는 경우가 많습니다. 이런 이유로, 엘로퀀트 모델 인스턴스를 파라미터 값으로 그대로 전달할 수 있으며, `route` 헬퍼가 자동으로 모델의 라우트 키를 추출하여 사용합니다.

```
echo route('post.show', ['post' => $post]);
```

<a name="signed-urls"></a>
### 서명된 URL

라라벨을 사용하면 이름이 지정된 라우트에 대해 "서명된(Signed)" URL을 쉽게 만들 수 있습니다. 서명된 URL은 쿼리 스트링에 "signature" 해시가 추가되어 URL이 생성된 이후 변경되지 않았음을 라라벨이 검증할 수 있게 해줍니다. 주로 서명된 URL은 공개적으로 접근 가능한 경로이지만, URL 조작을 방지하고자 추가 보호 계층이 필요할 때 유용하게 사용할 수 있습니다.

예를 들어, 고객에게 이메일로 보내는 공개적인 "구독 해지" 링크를 구현할 때 서명된 URL을 사용할 수 있습니다. 이름이 지정된 라우트로 서명된 URL을 생성하려면 `URL` 파사드의 `signedRoute` 메서드를 사용하세요.

```
use Illuminate\Support\Facades\URL;

return URL::signedRoute('unsubscribe', ['user' => 1]);
```

일정 시간이 지난 후 만료되는 임시 서명 URL을 생성하려면 `temporarySignedRoute` 메서드를 사용할 수 있습니다. 라라벨은 임시 서명 라우트 URL 검증 시, URL에 인코딩된 만료 시간이 아직 지나지 않았는지 확인합니다.

```
use Illuminate\Support\Facades\URL;

return URL::temporarySignedRoute(
    'unsubscribe', now()->addMinutes(30), ['user' => 1]
);
```

<a name="validating-signed-route-requests"></a>
#### 서명 라우트 요청 검증하기

들어오는 요청에 올바른 서명이 있는지 검증하려면, 요청 객체의 `hasValidSignature` 메서드를 호출하면 됩니다.

```
use Illuminate\Http\Request;

Route::get('/unsubscribe/{user}', function (Request $request) {
    if (! $request->hasValidSignature()) {
        abort(401);
    }

    // ...
})->name('unsubscribe');
```

또는 라우트에 `Illuminate\Routing\Middleware\ValidateSignature` [미들웨어](/docs/8.x/middleware)를 지정할 수도 있습니다. 만약 아직 지정하지 않았다면, HTTP 커널의 `routeMiddleware` 배열에 이 미들웨어 키를 추가해야 합니다.

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

커널에 미들웨어를 등록했다면, 이제 해당 미들웨어를 라우트에 적용할 수 있습니다. 들어오는 요청이 올바른 서명을 가지고 있지 않다면, 미들웨어가 자동으로 `403` HTTP 응답을 반환합니다.

```
Route::post('/unsubscribe/{user}', function (Request $request) {
    // ...
})->name('unsubscribe')->middleware('signed');
```

<a name="responding-to-invalid-signed-routes"></a>
#### 잘못된 서명 라우트에 대한 응답 처리

누군가 만료된 서명 URL에 접근하면, 기본적으로 `403` HTTP 상태 코드의 일반적인 에러 페이지가 표시됩니다. 하지만, 이 동작을 직접 커스터마이징할 수도 있습니다. 예외 핸들러에서 `InvalidSignatureException` 예외에 대해 커스텀 "renderable" 클로저를 정의하면 됩니다. 이 클로저는 HTTP 응답을 반환해야 합니다.

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
## 컨트롤러 액션을 위한 URL

`action` 함수를 사용하면 지정한 컨트롤러 액션에 대한 URL을 생성할 수 있습니다.

```
use App\Http\Controllers\HomeController;

$url = action([HomeController::class, 'index']);
```

컨트롤러 메서드가 라우트 파라미터를 받는 경우, 두 번째 인수로 연관 배열 형태의 라우트 파라미터 값을 전달할 수 있습니다.

```
$url = action([UserController::class, 'profile'], ['id' => 1]);
```

<a name="default-values"></a>
## 기본값 설정

어떤 애플리케이션에서는 특정 URL 파라미터에 대해 요청 전체에서 사용할 기본값을 지정하고 싶은 경우가 있습니다. 예를 들어, 여러 라우트에서 `{locale}` 파라미터를 사용하는 경우를 생각해 보겠습니다.

```
Route::get('/{locale}/posts', function () {
    //
})->name('post.index');
```

`route` 헬퍼를 사용할 때마다 매번 `locale`을 전달하는 것은 번거로운 일입니다. 이럴 때는 `URL::defaults` 메서드를 사용해서 해당 파라미터의 기본값을 현재 요청 동안 항상 자동 적용되도록 설정할 수 있습니다. 일반적으로 이 메서드는 [라우트 미들웨어](/docs/8.x/middleware#assigning-middleware-to-routes)에서 호출하여 현재 요청 정보에 접근하는 것이 좋습니다.

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

이렇게 `locale` 파라미터의 기본값을 한 번만 설정해두면, 이후에는 `route` 헬퍼로 URL을 생성할 때마다 해당 값을 따로 전달하지 않아도 됩니다.

<a name="url-defaults-middleware-priority"></a>
#### URL 기본값 & 미들웨어 실행 우선순위

URL의 기본값을 설정하는 미들웨어는 라라벨의 암묵적 모델 바인딩 처리에 영향을 줄 수 있습니다. 따라서, URL 기본값을 설정하는 미들웨어는 반드시 라라벨의 기본 `SubstituteBindings` 미들웨어보다 먼저 실행되어야 합니다. 이를 위해서는 애플리케이션의 HTTP 커널에서 `$middlewarePriority` 속성에 해당 미들웨어가 `SubstituteBindings`보다 앞에 나오도록 설정해야 합니다.

`$middlewarePriority` 속성은 기본적으로 `Illuminate\Foundation\Http\Kernel` 클래스에 정의되어 있습니다. 이 정의를 앱의 HTTP 커널로 복사해서 원하는 대로 수정할 수 있습니다.

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
