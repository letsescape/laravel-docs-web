# URL 생성 (URL Generation)

- [소개](#introduction)
- [기본 사항](#the-basics)
    - [URL 생성하기](#generating-urls)
    - [현재 URL 접근하기](#accessing-the-current-url)
- [이름이 지정된 라우트의 URL](#urls-for-named-routes)
    - [서명된 URL](#signed-urls)
- [컨트롤러 액션의 URL](#urls-for-controller-actions)
- [기본값 지정](#default-values)

<a name="introduction"></a>
## 소개

라라벨은 애플리케이션의 URL을 생성할 때 도움을 주는 다양한 헬퍼 함수를 제공합니다. 이러한 헬퍼들은 주로 템플릿이나 API 응답에서 링크를 만들거나, 애플리케이션의 다른 부분으로 리다이렉트 응답을 생성할 때 유용하게 사용할 수 있습니다.

<a name="the-basics"></a>
## 기본 사항

<a name="generating-urls"></a>
### URL 생성하기

`url` 헬퍼를 사용하면 애플리케이션에서 임의의 URL을 생성할 수 있습니다. 이 헬퍼가 반환하는 URL은 현재 애플리케이션이 처리 중인 요청의 스킴(HTTP 또는 HTTPS)과 호스트를 자동으로 사용합니다.

```
$post = App\Models\Post::find(1);

echo url("/posts/{$post->id}");

// http://example.com/posts/1
```

<a name="accessing-the-current-url"></a>
### 현재 URL 접근하기

`url` 헬퍼에 경로를 전달하지 않으면, `Illuminate\Routing\UrlGenerator` 인스턴스가 반환되어 현재 URL에 대한 다양한 정보를 얻을 수 있습니다.

```
// 쿼리 스트링을 제외한 현재 URL을 가져옵니다...
echo url()->current();

// 쿼리 스트링을 포함한 현재 URL을 가져옵니다...
echo url()->full();

// 이전 요청의 전체 URL을 가져옵니다...
echo url()->previous();
```

이러한 메서드들은 `URL` [파사드](/docs/10.x/facades)를 통해서도 사용할 수 있습니다.

```
use Illuminate\Support\Facades\URL;

echo URL::current();
```

<a name="urls-for-named-routes"></a>
## 이름이 지정된 라우트의 URL

`route` 헬퍼를 사용하면 [이름이 지정된 라우트](/docs/10.x/routing#named-routes)의 URL을 생성할 수 있습니다. 이름이 지정된 라우트(named route)를 사용하면 실제 라우트의 URL에 직접 의존하지 않고도 URL을 생성할 수 있습니다. 따라서 라우트의 URL이 변경되어도 `route` 함수 호출 자체는 수정할 필요가 없습니다. 예를 들어, 다음과 같이 라우트가 정의되어 있다고 가정해보겠습니다.

```
Route::get('/post/{post}', function (Post $post) {
    // ...
})->name('post.show');
```

이 라우트에 대한 URL을 생성하려면 아래와 같이 `route` 헬퍼를 사용합니다.

```
echo route('post.show', ['post' => 1]);

// http://example.com/post/1
```

물론, `route` 헬퍼는 여러 개의 파라미터를 가진 라우트의 URL도 생성할 수 있습니다.

```
Route::get('/post/{post}/comment/{comment}', function (Post $post, Comment $comment) {
    // ...
})->name('comment.show');

echo route('comment.show', ['post' => 1, 'comment' => 3]);

// http://example.com/post/1/comment/3
```

라우트에 정의되지 않은 추가 배열 요소들은 자동으로 URL의 쿼리 스트링에 추가됩니다.

```
echo route('post.show', ['post' => 1, 'search' => 'rocket']);

// http://example.com/post/1?search=rocket
```

<a name="eloquent-models"></a>
#### Eloquent 모델

URL을 생성할 때 대부분의 경우 [Eloquent 모델](/docs/10.x/eloquent)의 라우트 키(보통은 기본 키)를 사용하게 됩니다. 이를 위해, Eloquent 모델 인스턴스를 파라미터 값으로 바로 전달할 수 있습니다. `route` 헬퍼가 모델의 라우트 키를 자동으로 추출해 사용합니다.

```
echo route('post.show', ['post' => $post]);
```

<a name="signed-urls"></a>
### 서명된 URL

라라벨에서는 이름이 지정된 라우트에 대해 "서명된" URL을 손쉽게 생성할 수 있습니다. 이러한 URL에는 쿼리 스트링에 "시그니처" 해시가 추가되어 라라벨이 URL이 생성된 이후로 변경되지 않았음을 검증할 수 있습니다. 서명된 URL은 누구나 접근할 수 있는 공개 라우트이면서도, URL 조작에 대한 보호가 필요한 경우에 특히 유용합니다.

예를 들어, 고객에게 이메일로 발송하는 공개 "구독 취소" 링크를 구현할 때 서명된 URL을 사용할 수 있습니다. 이름이 지정된 라우트에 대한 서명된 URL을 생성하려면 `URL` 파사드의 `signedRoute` 메서드를 사용하면 됩니다.

```
use Illuminate\Support\Facades\URL;

return URL::signedRoute('unsubscribe', ['user' => 1]);
```

서명된 URL의 해시에서 도메인을 제외하고 싶다면 `signedRoute` 메서드에 `absolute` 인수를 제공하면 됩니다.

```
return URL::signedRoute('unsubscribe', ['user' => 1], absolute: false);
```

특정 시간 후에 만료되도록 임시 서명 URL을 만들고 싶다면 `temporarySignedRoute` 메서드를 사용할 수 있습니다. 라라벨이 임시 서명 URL을 검증할 때, 서명된 URL에 인코딩된 만료 시간이 아직 지나지 않았는지 확인합니다.

```
use Illuminate\Support\Facades\URL;

return URL::temporarySignedRoute(
    'unsubscribe', now()->addMinutes(30), ['user' => 1]
);
```

<a name="validating-signed-route-requests"></a>
#### 서명된 라우트 요청 검증하기

들어온 요청이 유효한 서명을 가지고 있는지 확인하려면, 전달받은 `Illuminate\Http\Request` 인스턴스에서 `hasValidSignature` 메서드를 호출하면 됩니다.

```
use Illuminate\Http\Request;

Route::get('/unsubscribe/{user}', function (Request $request) {
    if (! $request->hasValidSignature()) {
        abort(401);
    }

    // ...
})->name('unsubscribe');
```

애플리케이션의 프론트엔드에서 클라이언트 측 페이지네이션 등으로 서명된 URL에 추가 데이터를 붙여 보내야 할 때도 있습니다. 이런 경우, `hasValidSignatureWhileIgnoring` 메서드를 사용하여 서명 검증시 무시할 쿼리 파라미터 목록을 지정할 수 있습니다. 단, 무시 목록에 포함된 파라미터는 누구나 요청에서 값을 변경할 수 있으니 주의해야 합니다.

```
if (! $request->hasValidSignatureWhileIgnoring(['page', 'order'])) {
    abort(401);
}
```

요청 인스턴스를 직접 사용하지 않고, 라우트에 `Illuminate\Routing\Middleware\ValidateSignature` [미들웨어](/docs/10.x/middleware)를 할당하여 서명 URL을 검증할 수도 있습니다. 만약 이 미들웨어가 등록되어 있지 않다면, HTTP 커널의 `$middlewareAliases` 배열에 별칭을 추가하세요.

```
/**
 * 애플리케이션의 미들웨어 별칭 목록입니다.
 *
 * 별칭을 사용하면 라우트와 그룹에 미들웨어를 간편하게 지정할 수 있습니다.
 *
 * @var array<string, class-string|string>
 */
protected $middlewareAliases = [
    'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,
];
```

커널에 미들웨어가 등록되었다면, 해당 미들웨어를 라우트에 붙일 수 있습니다. 요청의 시그니처가 유효하지 않을 경우, 미들웨어가 자동으로 `403` HTTP 응답을 반환합니다.

```
Route::post('/unsubscribe/{user}', function (Request $request) {
    // ...
})->name('unsubscribe')->middleware('signed');
```

만약 서명된 URL의 해시에 도메인이 포함되어 있지 않다면, 미들웨어에 `relative` 인수를 전달합니다.

```
Route::post('/unsubscribe/{user}', function (Request $request) {
    // ...
})->name('unsubscribe')->middleware('signed:relative');
```

<a name="responding-to-invalid-signed-routes"></a>
#### 잘못된 서명 URL에 대한 응답 처리

누군가 만료된 서명 URL로 접근하면, 일반적으로 `403` HTTP 상태 코드의 에러 페이지가 표시됩니다. 이 동작은 예외 핸들러에서 `InvalidSignatureException` 예외에 대해 커스텀 "렌더러블(renderable)" 클로저를 정의함으로써 직접 제어할 수 있습니다. 이 클로저는 HTTP 응답을 반환해야 합니다.

```
use Illuminate\Routing\Exceptions\InvalidSignatureException;

/**
 * 애플리케이션의 예외 처리 콜백을 등록합니다.
 */
public function register(): void
{
    $this->renderable(function (InvalidSignatureException $e) {
        return response()->view('error.link-expired', [], 403);
    });
}
```

<a name="urls-for-controller-actions"></a>
## 컨트롤러 액션의 URL

`action` 함수를 사용하면 지정한 컨트롤러 액션에 대한 URL을 생성할 수 있습니다.

```
use App\Http\Controllers\HomeController;

$url = action([HomeController::class, 'index']);
```

컨트롤러 메서드가 라우트 파라미터를 받는 경우, 두 번째 인수로 연관 배열 형태의 파라미터를 전달할 수 있습니다.

```
$url = action([UserController::class, 'profile'], ['id' => 1]);
```

<a name="default-values"></a>
## 기본값 지정

어떤 애플리케이션에서는 특정 URL 파라미터에 대해 요청 전체에 적용되는 기본값을 지정하고 싶을 수 있습니다. 예를 들어, 여러 라우트에서 `{locale}` 파라미터를 사용하는 경우를 생각해봅시다.

```
Route::get('/{locale}/posts', function () {
    // ...
})->name('post.index');
```

`route` 헬퍼를 호출할 때마다 매번 `locale`을 전달하는 것은 불편할 수 있습니다. 이런 경우 `URL::defaults` 메서드를 사용하면, 현재 요청에서 항상 적용되는 기본값을 지정할 수 있습니다. 이 메서드는 [라우트 미들웨어](/docs/10.x/middleware#assigning-middleware-to-routes)에서 호출하여 현재 요청 정보에 접근하도록 하는 것이 일반적입니다.

```
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class SetDefaultLocaleForUrls
{
    /**
     * 들어오는 요청을 처리합니다.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        URL::defaults(['locale' => $request->user()->locale]);

        return $next($request);
    }
}
```

`locale` 파라미터의 기본값이 설정되면, `route` 헬퍼로 URL을 생성할 때 값을 별도로 전달하지 않아도 됩니다.

<a name="url-defaults-middleware-priority"></a>
#### URL 기본값과 미들웨어 우선순위

URL 기본값을 설정하는 미들웨어는 라라벨의 암시적 모델 바인딩 처리와 충돌할 수 있습니다. 따라서 URL 기본값을 설정하는 미들웨어는 라라벨의 `SubstituteBindings` 미들웨어보다 먼저 실행되도록 [미들웨어 우선순위](/docs/10.x/middleware#sorting-middleware)를 지정해야 합니다. 이를 위해 애플리케이션 HTTP 커널의 `$middlewarePriority` 속성에서 해당 미들웨어를 `SubstituteBindings`보다 앞에 위치시키세요.

`$middlewarePriority` 속성은 기본적으로 `Illuminate\Foundation\Http\Kernel` 클래스에 정의되어 있습니다. 이 속성을 애플리케이션의 HTTP 커널로 복사해서 순서를 수정할 수 있습니다.

```
/**
 * 우선순위가 지정된 미들웨어 목록입니다.
 *
 * 이 목록은 글로벌 미들웨어가 아닌 미들웨어의 실행 순서를 강제합니다.
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
