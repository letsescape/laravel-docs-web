# URL 생성 (URL Generation)

- [소개](#introduction)
- [기본 사용법](#the-basics)
    - [URL 생성하기](#generating-urls)
    - [현재 URL 접근하기](#accessing-the-current-url)
- [이름이 지정된 라우트의 URL](#urls-for-named-routes)
    - [서명된 URL](#signed-urls)
- [컨트롤러 액션의 URL](#urls-for-controller-actions)
- [기본값 설정](#default-values)

<a name="introduction"></a>
## 소개

라라벨은 애플리케이션에서 URL을 생성할 수 있도록 도와주는 다양한 헬퍼를 제공합니다. 이 헬퍼들은 주로 템플릿에서 링크를 만들거나, API 응답에 링크를 포함시키거나, 애플리케이션의 다른 위치로 리디렉션 응답을 보낼 때 유용하게 사용할 수 있습니다.

<a name="the-basics"></a>
## 기본 사용법

<a name="generating-urls"></a>
### URL 생성하기

`url` 헬퍼를 사용하면 애플리케이션에서 임의의 URL을 쉽게 생성할 수 있습니다. 생성되는 URL은 현재 요청의 스킴(HTTP 또는 HTTPS)과 호스트 정보를 자동으로 사용합니다.

```
$post = App\Models\Post::find(1);

echo url("/posts/{$post->id}");

// http://example.com/posts/1
```

쿼리 문자열 파라미터와 함께 URL을 생성하려면 `query` 메서드를 사용할 수 있습니다.

```
echo url()->query('/posts', ['search' => 'Laravel']);

// https://example.com/posts?search=Laravel

echo url()->query('/posts?sort=latest', ['search' => 'Laravel']);

// http://example.com/posts?sort=latest&search=Laravel
```

쿼리 문자열 파라미터 중 이미 경로에 존재하는 값이 있다면, 전달한 값으로 기존 파라미터가 덮어씌워집니다.

```
echo url()->query('/posts?sort=latest', ['sort' => 'oldest']);

// http://example.com/posts?sort=oldest
```

쿼리 파라미터로 값의 배열도 전달할 수 있습니다. 배열로 전달된 값은 키가 제대로 지정되고 인코딩되어 URL에 포함됩니다.

```
echo $url = url()->query('/posts', ['columns' => ['title', 'body']]);

// http://example.com/posts?columns%5B0%5D=title&columns%5B1%5D=body

echo urldecode($url);

// http://example.com/posts?columns[0]=title&columns[1]=body
```

<a name="accessing-the-current-url"></a>
### 현재 URL 접근하기

`url` 헬퍼에 인수를 전달하지 않으면 `Illuminate\Routing\UrlGenerator` 인스턴스를 반환하므로, 이를 통해 현재 URL에 대한 다양한 정보를 얻을 수 있습니다.

```
// 쿼리 문자열 없이 현재 URL 가져오기...
echo url()->current();

// 쿼리 문자열을 포함한 현재 URL 가져오기...
echo url()->full();

// 이전 요청의 전체 URL 가져오기...
echo url()->previous();

// 이전 요청의 path만 가져오기...
echo url()->previousPath();
```

이러한 메서드들은 [파사드](/docs/11.x/facades)인 `URL`을 통해서도 접근할 수 있습니다.

```
use Illuminate\Support\Facades\URL;

echo URL::current();
```

<a name="urls-for-named-routes"></a>
## 이름이 지정된 라우트의 URL

`route` 헬퍼를 사용하면 [이름이 지정된 라우트](/docs/11.x/routing#named-routes)의 URL을 만들 수 있습니다. 이름이 지정된 라우트는 실제 URL에 의존하지 않고도 URL을 생성할 수 있게 해주므로, 라우트의 URL이 변경되더라도 `route` 함수 호출부를 수정할 필요가 없습니다. 예를 들어, 아래와 같이 라우트를 정의했다고 가정해보겠습니다.

```
Route::get('/post/{post}', function (Post $post) {
    // ...
})->name('post.show');
```

이 라우트에 대한 URL을 생성하려면 다음과 같이 `route` 헬퍼를 사용할 수 있습니다.

```
echo route('post.show', ['post' => 1]);

// http://example.com/post/1
```

물론, `route` 헬퍼는 여러 파라미터가 필요한 라우트의 URL도 생성할 수 있습니다.

```
Route::get('/post/{post}/comment/{comment}', function (Post $post, Comment $comment) {
    // ...
})->name('comment.show');

echo route('comment.show', ['post' => 1, 'comment' => 3]);

// http://example.com/post/1/comment/3
```

라우트 정의에 없는 추가 배열 요소들은 URL의 쿼리 문자열로 포함됩니다.

```
echo route('post.show', ['post' => 1, 'search' => 'rocket']);

// http://example.com/post/1?search=rocket
```

<a name="eloquent-models"></a>
#### Eloquent 모델

주로 [Eloquent 모델](/docs/11.x/eloquent)의 라우트 키(일반적으로 기본 키)를 사용해 URL을 생성하는 경우가 많습니다. 이러한 경우, Eloquent 모델 인스턴스를 파라미터로 그대로 전달할 수 있습니다. 그러면 `route` 헬퍼가 모델의 라우트 키 값을 자동으로 추출해 사용합니다.

```
echo route('post.show', ['post' => $post]);
```

<a name="signed-urls"></a>
### 서명된 URL

라라벨에서는 라우트 이름에 대해 "서명된" URL을 손쉽게 생성할 수 있습니다. 이 URL에는 시그니처(해시값)가 쿼리 문자열에 추가되어, 생성된 이후로 내용이 변경되지 않았는지 라라벨이 검증할 수 있습니다. 서명된 URL은 공개적으로 접근 가능하지만 URL 변조로부터 보호가 필요한 라우트에 특히 유용합니다.

예를 들어, 고객에게 이메일로 발송하는 "구독 해지"와 같은 공개 링크를 구현할 때 서명된 URL을 활용할 수 있습니다. 라우트 이름에 대한 서명된 URL을 만들려면 `URL` 파사드의 `signedRoute` 메서드를 사용합니다.

```
use Illuminate\Support\Facades\URL;

return URL::signedRoute('unsubscribe', ['user' => 1]);
```

서명된 URL 해시에 도메인을 포함하지 않으려면, `signedRoute` 메서드에 `absolute` 인자를 제공하면 됩니다.

```
return URL::signedRoute('unsubscribe', ['user' => 1], absolute: false);
```

지정한 시간 이후 만료되는 임시 서명 URL을 생성하려면 `temporarySignedRoute` 메서드를 사용할 수 있습니다. 라라벨은 임시 서명 URL을 검증할 때 URL에 인코딩된 만료 타임스탬프가 아직 유효한지도 확인합니다.

```
use Illuminate\Support\Facades\URL;

return URL::temporarySignedRoute(
    'unsubscribe', now()->addMinutes(30), ['user' => 1]
);
```

<a name="validating-signed-route-requests"></a>
#### 서명된 라우트 요청 검증

들어오는 요청이 올바른 서명을 가지고 있는지 확인하려면, `Illuminate\Http\Request` 인스턴스에서 `hasValidSignature` 메서드를 호출하면 됩니다.

```
use Illuminate\Http\Request;

Route::get('/unsubscribe/{user}', function (Request $request) {
    if (! $request->hasValidSignature()) {
        abort(401);
    }

    // ...
})->name('unsubscribe');
```

때때로, 프론트엔드에서 클라이언트 측 페이지네이션처럼 서명 URL에 데이터를 추가로 붙여야 할 수도 있습니다. 이럴 경우, `hasValidSignatureWhileIgnoring` 메서드를 사용해 서명 검증 시 무시할 쿼리 파라미터를 지정할 수 있습니다. 단, 무시한 파라미터는 누구나 요청에서 변경할 수 있음을 꼭 명심해야 합니다.

```
if (! $request->hasValidSignatureWhileIgnoring(['page', 'order'])) {
    abort(401);
}
```

들어오는 요청 인스턴스로 직접 서명된 URL을 검증하는 대신, 해당 라우트에 `signed` (`Illuminate\Routing\Middleware\ValidateSignature`) [미들웨어](/docs/11.x/middleware)를 지정할 수 있습니다. 이 경우, 요청이 올바른 서명을 가지고 있지 않으면 미들웨어가 자동으로 `403` HTTP 응답을 반환합니다.

```
Route::post('/unsubscribe/{user}', function (Request $request) {
    // ...
})->name('unsubscribe')->middleware('signed');
```

서명된 URL이 해시에서 도메인을 제외한 경우, 미들웨어에 `relative` 인자를 추가해야 합니다.

```
Route::post('/unsubscribe/{user}', function (Request $request) {
    // ...
})->name('unsubscribe')->middleware('signed:relative');
```

<a name="responding-to-invalid-signed-routes"></a>
#### 잘못된 서명 URL에 대한 응답

서명된 URL에 만료 기간이 지난 후 접근하면 `403` HTTP 코드에 대한 일반 오류 페이지를 보게 됩니다. 이러한 동작을 커스터마이즈하려면, 애플리케이션의 `bootstrap/app.php` 파일에서 `InvalidSignatureException` 예외에 대해 직접 "render" 클로저를 정의할 수 있습니다.

```
use Illuminate\Routing\Exceptions\InvalidSignatureException;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->render(function (InvalidSignatureException $e) {
        return response()->view('errors.link-expired', status: 403);
    });
})
```

<a name="urls-for-controller-actions"></a>
## 컨트롤러 액션의 URL

`action` 함수는 지정된 컨트롤러 액션에 대한 URL을 생성합니다.

```
use App\Http\Controllers\HomeController;

$url = action([HomeController::class, 'index']);
```

컨트롤러 메서드가 라우트 파라미터를 받는다면, 해당 파라미터들로 구성된 연관 배열을 두 번째 인자로 전달할 수 있습니다.

```
$url = action([UserController::class, 'profile'], ['id' => 1]);
```

<a name="default-values"></a>
## 기본값 설정

일부 애플리케이션에서는 특정 URL 파라미터에 대해 전체 요청에 적용되는 기본값을 지정하고 싶을 수 있습니다. 예를 들어, 많은 라우트에서 `{locale}` 파라미터를 정의하는 구조라면 아래와 같습니다.

```
Route::get('/{locale}/posts', function () {
    // ...
})->name('post.index');
```

매번 `route` 헬퍼를 쓸 때마다 `locale` 값을 일일이 전달하는 것은 번거로울 수 있습니다. 이때, `URL::defaults` 메서드를 사용해 파라미터별 기본값을 설정해두면, 현재 요청 처리 내내 자동으로 적용됩니다. 이 메서드는 [라우트 미들웨어](/docs/11.x/middleware#assigning-middleware-to-routes)에서 호출하는 것이 일반적이며, 이렇게 하면 현재 요청정보에도 접근할 수 있습니다.

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
     * Handle an incoming request.
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

`locale` 파라미터의 기본값이 설정되면, 이제부터 URL을 생성할 때 `route` 헬퍼에 별도로 값을 전달하지 않아도 됩니다.

<a name="url-defaults-middleware-priority"></a>
#### URL 기본값과 미들웨어 실행 우선순위

URL 기본값 설정은 라라벨의 암시적 모델 바인딩 처리에 영향을 줄 수 있습니다. 따라서 URL 기본값을 설정하는 미들웨어가 라라벨 기본 미들웨어인 `SubstituteBindings`보다 먼저 실행되도록 [미들웨어 우선순위](/docs/11.x/middleware#sorting-middleware)를 조정해야 합니다. 이를 위해 애플리케이션의 `bootstrap/app.php` 파일에서 `priority` 미들웨어 메서드를 사용하여 순서를 지정할 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->prependToPriorityList(
        before: \Illuminate\Routing\Middleware\SubstituteBindings::class,
        prepend: \App\Http\Middleware\SetDefaultLocaleForUrls::class,
    );
})
```