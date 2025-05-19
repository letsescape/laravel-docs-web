# URL 생성 (URL Generation)

- [소개](#introduction)
- [기본 사항](#the-basics)
    - [URL 생성하기](#generating-urls)
    - [현재 URL 가져오기](#accessing-the-current-url)
- [이름이 지정된 라우트의 URL](#urls-for-named-routes)
    - [서명된 URL](#signed-urls)
- [컨트롤러 액션의 URL](#urls-for-controller-actions)
- [플루언트 URI 객체](#fluent-uri-objects)
- [기본 값 설정](#default-values)

<a name="introduction"></a>
## 소개

라라벨은 애플리케이션에서 URL을 생성할 수 있도록 여러 가지 헬퍼를 제공합니다. 이러한 헬퍼는 주로 템플릿이나 API 응답에서 링크를 만들거나, 애플리케이션의 다른 부분으로 리다이렉트 응답을 생성할 때 유용하게 사용됩니다.

<a name="the-basics"></a>
## 기본 사항

<a name="generating-urls"></a>
### URL 생성하기

`url` 헬퍼를 사용하면 애플리케이션의 임의의 URL을 생성할 수 있습니다. 생성된 URL은 현재 애플리케이션에서 처리 중인 요청의 스킴(HTTP 또는 HTTPS)과 호스트를 자동으로 사용합니다.

```php
$post = App\Models\Post::find(1);

echo url("/posts/{$post->id}");

// http://example.com/posts/1
```

쿼리 문자열 파라미터가 포함된 URL을 만들고 싶다면, `query` 메서드를 사용할 수 있습니다.

```php
echo url()->query('/posts', ['search' => 'Laravel']);

// https://example.com/posts?search=Laravel

echo url()->query('/posts?sort=latest', ['search' => 'Laravel']);

// http://example.com/posts?sort=latest&search=Laravel
```

경로에 이미 존재하는 쿼리 문자열 파라미터에 값을 전달하면 기존 값이 덮어쓰기 됩니다.

```php
echo url()->query('/posts?sort=latest', ['sort' => 'oldest']);

// http://example.com/posts?sort=oldest
```

값의 배열을 쿼리 파라미터로 전달할 수도 있습니다. 이때 값은 생성된 URL에서 올바르게 키가 매겨지고 인코딩됩니다.

```php
echo $url = url()->query('/posts', ['columns' => ['title', 'body']]);

// http://example.com/posts?columns%5B0%5D=title&columns%5B1%5D=body

echo urldecode($url);

// http://example.com/posts?columns[0]=title&columns[1]=body
```

<a name="accessing-the-current-url"></a>
### 현재 URL 가져오기

`url` 헬퍼에 경로를 전달하지 않으면, `Illuminate\Routing\UrlGenerator` 인스턴스가 반환되어 현재 URL에 대한 정보를 얻을 수 있습니다.

```php
// 쿼리 문자열을 제외한 현재 URL 가져오기...
echo url()->current();

// 쿼리 문자열을 포함한 현재 URL 가져오기...
echo url()->full();

// 이전 요청의 전체 URL 가져오기...
echo url()->previous();

// 이전 요청의 경로만 가져오기...
echo url()->previousPath();
```

이러한 메서드는 [파사드](/docs/12.x/facades) `URL`을 통해서도 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\URL;

echo URL::current();
```

<a name="urls-for-named-routes"></a>
## 이름이 지정된 라우트의 URL

`route` 헬퍼를 사용하면 [이름이 지정된 라우트](/docs/12.x/routing#named-routes)로의 URL을 생성할 수 있습니다. 이름이 지정된 라우트를 활용하면 실제 라우트의 URL에 의존하지 않고 URL을 만들 수 있으므로, 라우트 URL이 변경되더라도 `route` 함수 호출 부분을 수정할 필요가 없습니다. 예를 들어, 다음과 같이 라우트를 정의했다고 가정해보겠습니다.

```php
Route::get('/post/{post}', function (Post $post) {
    // ...
})->name('post.show');
```

이 라우트로 URL을 생성하려면 다음과 같이 `route` 헬퍼를 사용할 수 있습니다.

```php
echo route('post.show', ['post' => 1]);

// http://example.com/post/1
```

물론, `route` 헬퍼는 여러 개의 파라미터가 있는 라우트에 대해서도 사용할 수 있습니다.

```php
Route::get('/post/{post}/comment/{comment}', function (Post $post, Comment $comment) {
    // ...
})->name('comment.show');

echo route('comment.show', ['post' => 1, 'comment' => 3]);

// http://example.com/post/1/comment/3
```

라우트에 정의된 파라미터와 일치하지 않는 추가 배열 요소는 쿼리 문자열로 URL에 자동 추가됩니다.

```php
echo route('post.show', ['post' => 1, 'search' => 'rocket']);

// http://example.com/post/1?search=rocket
```

<a name="eloquent-models"></a>
#### Eloquent 모델

대부분의 경우 [Eloquent 모델](/docs/12.x/eloquent)의 라우트 키(보통 기본 키)를 사용하여 URL을 생성합니다. 이런 상황에서는 파라미터 값으로 Eloquent 모델을 직접 전달할 수 있습니다. 그러면 `route` 헬퍼가 자동으로 모델의 라우트 키를 추출해서 사용합니다.

```php
echo route('post.show', ['post' => $post]);
```

<a name="signed-urls"></a>
### 서명된 URL

라라벨에서는 이름이 지정된 라우트에 대해 "서명된(signed)" URL을 쉽게 생성할 수 있습니다. 이 서명된 URL은 쿼리 문자열에 "signature" 해시가 추가되며, 라라벨이 해당 URL이 생성된 이후로 수정되지 않았는지 검증할 수 있게 합니다. 서명된 URL은 누구나 접근할 수 있지만 URL 위조, 변조에 대한 방어가 필요한 라우트에 특히 유용합니다.

예를 들어, 가입자에게 이메일로 "구독 취소" 링크를 보낼 때 서명된 URL을 활용할 수 있습니다. 이름이 지정된 라우트에 대한 서명된 URL을 생성하려면 `URL` 파사드의 `signedRoute` 메서드를 사용하세요.

```php
use Illuminate\Support\Facades\URL;

return URL::signedRoute('unsubscribe', ['user' => 1]);
```

서명된 URL 해시에서 도메인을 제외하려면 `signedRoute` 메서드의 `absolute` 인자에 `false`를 전달하면 됩니다.

```php
return URL::signedRoute('unsubscribe', ['user' => 1], absolute: false);
```

서명된 라우트 URL에 만료 시간을 추가해서, 일정 시간 후에 더 이상 사용할 수 없도록 하고 싶을 때는 `temporarySignedRoute` 메서드를 사용할 수 있습니다. 라라벨이 일시적인 서명 라우트 URL을 검증할 때는 서명된 URL에 인코딩된 만료 시간이 아직 남아있는지 확인합니다.

```php
use Illuminate\Support\Facades\URL;

return URL::temporarySignedRoute(
    'unsubscribe', now()->addMinutes(30), ['user' => 1]
);
```

<a name="validating-signed-route-requests"></a>
#### 서명된 라우트 요청 검증하기

들어오는 요청이 올바른 서명을 가지고 있는지 확인하려면, 전달받은 `Illuminate\Http\Request` 인스턴스에서 `hasValidSignature` 메서드를 호출해야 합니다.

```php
use Illuminate\Http\Request;

Route::get('/unsubscribe/{user}', function (Request $request) {
    if (! $request->hasValidSignature()) {
        abort(401);
    }

    // ...
})->name('unsubscribe');
```

때로는 프론트엔드에서 클라이언트 측 페이지네이션 등과 같이 추가 데이터를 서명된 URL에 붙여야 할 수도 있습니다. 이럴 때는, `hasValidSignatureWhileIgnoring` 메서드를 사용해서 검증 시 무시할 쿼리 파라미터를 지정할 수 있습니다. 단, 무시된 파라미터는 누구나 요청에서 수정할 수 있다는 점에 유의하세요.

```php
if (! $request->hasValidSignatureWhileIgnoring(['page', 'order'])) {
    abort(401);
}
```

요청 인스턴스를 이용한 서명된 URL 검증 대신, 해당 라우트에 `signed` (`Illuminate\Routing\Middleware\ValidateSignature`) [미들웨어](/docs/12.x/middleware)를 지정할 수도 있습니다. 유효한 서명이 없는 요청이 오면, 미들웨어가 자동으로 `403` HTTP 응답을 반환합니다.

```php
Route::post('/unsubscribe/{user}', function (Request $request) {
    // ...
})->name('unsubscribe')->middleware('signed');
```

서명된 URL의 해시에 도메인이 포함되지 않는 경우에는, 미들웨어에 `relative` 인자를 전달해야 합니다.

```php
Route::post('/unsubscribe/{user}', function (Request $request) {
    // ...
})->name('unsubscribe')->middleware('signed:relative');
```

<a name="responding-to-invalid-signed-routes"></a>
#### 유효하지 않은 서명 라우트 응답 처리

만료된 서명된 URL에 접근하면 `403` HTTP 상태 코드에 대한 일반적인 오류 페이지가 표시됩니다. 그러나, 애플리케이션의 `bootstrap/app.php` 파일에서 `InvalidSignatureException` 예외에 대한 사용자 정의 "render" 클로저를 정의함으로써 이 동작을 원하는 대로 커스터마이즈할 수 있습니다.

```php
use Illuminate\Routing\Exceptions\InvalidSignatureException;

->withExceptions(function (Exceptions $exceptions) {
    $exceptions->render(function (InvalidSignatureException $e) {
        return response()->view('errors.link-expired', status: 403);
    });
})
```

<a name="urls-for-controller-actions"></a>
## 컨트롤러 액션의 URL

`action` 함수는 지정된 컨트롤러 액션에 해당하는 URL을 생성합니다.

```php
use App\Http\Controllers\HomeController;

$url = action([HomeController::class, 'index']);
```

컨트롤러 메서드가 라우트 파라미터를 받는 경우, 두 번째 인수로 연관 배열 형태의 라우트 파라미터를 전달할 수 있습니다.

```php
$url = action([UserController::class, 'profile'], ['id' => 1]);
```

<a name="fluent-uri-objects"></a>
## 플루언트 URI 객체

라라벨의 `Uri` 클래스는 객체 방식으로 URI를 쉽게 생성하고 다룰 수 있는 편리하며 플루언트한 인터페이스를 제공합니다. 이 클래스는 내부적으로 League URI 패키지의 기능을 감싸고, 라라벨의 라우팅 시스템과 매끄럽게 연동됩니다.

정적 메서드를 이용해 손쉽게 `Uri` 인스턴스를 만들 수 있습니다.

```php
use App\Http\Controllers\UserController;
use App\Http\Controllers\InvokableController;
use Illuminate\Support\Uri;

// 주어진 문자열로 URI 인스턴스 생성...
$uri = Uri::of('https://example.com/path');

// 경로, 이름이 지정된 라우트, 컨트롤러 액션 등으로 URI 인스턴스 생성...
$uri = Uri::to('/dashboard');
$uri = Uri::route('users.show', ['user' => 1]);
$uri = Uri::signedRoute('users.show', ['user' => 1]);
$uri = Uri::temporarySignedRoute('user.index', now()->addMinutes(5));
$uri = Uri::action([UserController::class, 'index']);
$uri = Uri::action(InvokableController::class);

// 현재 요청의 URL에서 URI 인스턴스 생성...
$uri = $request->uri();
```

URI 인스턴스를 얻은 다음에는 다음과 같이 플루언트하게 값을 수정할 수 있습니다.

```php
$uri = Uri::of('https://example.com')
    ->withScheme('http')
    ->withHost('test.com')
    ->withPort(8000)
    ->withPath('/users')
    ->withQuery(['page' => 2])
    ->withFragment('section-1');
```

플루언트 URI 객체에 대해 더 자세한 내용은 [URI 문서](/docs/12.x/helpers#uri)를 참고하세요.

<a name="default-values"></a>
## 기본 값 설정

일부 애플리케이션에서는 특정 URL 파라미터에 대해 요청 전체에서 사용할 기본 값을 지정하고 싶을 수 있습니다. 예를 들어, 여러 라우트가 `{locale}` 파라미터를 정의하고 있다고 가정해봅시다.

```php
Route::get('/{locale}/posts', function () {
    // ...
})->name('post.index');
```

매번 `route` 헬퍼를 사용할 때마다 항상 `locale` 값을 전달하는 것은 번거롭습니다. 이런 경우에는 `URL::defaults` 메서드를 이용하여 해당 파라미터의 기본 값을 현재 요청 동안 항상 적용되도록 할 수 있습니다. 일반적으로 [라우트 미들웨어](/docs/12.x/middleware#assigning-middleware-to-routes) 내에서 이 메서드를 호출해 현재 요청 정보를 활용하는 것이 좋습니다.

```php
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

`locale` 파라미터에 대한 기본 값이 한 번 설정되면, `route` 헬퍼로 URL을 만들 때 더 이상 직접 값을 전달하지 않아도 됩니다.

<a name="url-defaults-middleware-priority"></a>
#### URL 기본 값 미들웨어의 우선 순위

URL 기본 값 설정은 라라벨의 암묵적 모델 바인딩 처리 흐름에 영향을 줄 수 있습니다. 따라서, URL 기본 값을 설정하는 미들웨어는 반드시 라라벨의 `SubstituteBindings` 미들웨어보다 먼저 실행되도록 [미들웨어 우선순위](/docs/12.x/middleware#sorting-middleware)를 조정해야 합니다. 애플리케이션의 `bootstrap/app.php` 파일에서 `priority` 미들웨어 메서드를 사용해 아래와 같이 지정할 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->prependToPriorityList(
        before: \Illuminate\Routing\Middleware\SubstituteBindings::class,
        prepend: \App\Http\Middleware\SetDefaultLocaleForUrls::class,
    );
})
```