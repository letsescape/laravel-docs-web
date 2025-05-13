# URL 생성 (URL Generation)

- [소개](#introduction)
- [기본 사용법](#the-basics)
    - [URL 생성](#generating-urls)
    - [현재 URL 접근하기](#accessing-the-current-url)
- [이름 있는 라우트의 URL](#urls-for-named-routes)
    - [서명된 URL](#signed-urls)
- [컨트롤러 액션의 URL](#urls-for-controller-actions)
- [플루언트 URI 객체](#fluent-uri-objects)
- [기본값 지정](#default-values)

<a name="introduction"></a>
## 소개

라라벨은 애플리케이션에서 URL을 생성할 때 유용하게 사용할 수 있는 여러 헬퍼 함수를 제공합니다. 이 헬퍼들은 주로 템플릿이나 API 응답에서 링크를 만들거나, 애플리케이션의 다른 부분으로 리다이렉트 응답을 생성할 때 도움이 됩니다.

<a name="the-basics"></a>
## 기본 사용법

<a name="generating-urls"></a>
### URL 생성

`url` 헬퍼를 사용하면 애플리케이션의 임의의 URL을 쉽게 생성할 수 있습니다. 생성된 URL은 현재 애플리케이션이 처리 중인 요청의 스킴(HTTP 또는 HTTPS)과 호스트 정보를 자동으로 사용합니다.

```php
$post = App\Models\Post::find(1);

echo url("/posts/{$post->id}");

// http://example.com/posts/1
```

쿼리 문자열 파라미터가 포함된 URL을 생성하려면 `query` 메서드를 사용할 수 있습니다.

```php
echo url()->query('/posts', ['search' => 'Laravel']);

// https://example.com/posts?search=Laravel

echo url()->query('/posts?sort=latest', ['search' => 'Laravel']);

// http://example.com/posts?sort=latest&search=Laravel
```

이미 경로에 존재하는 쿼리 문자열 파라미터에 새로운 값을 전달하면, 기존 값이 덮어써집니다.

```php
echo url()->query('/posts?sort=latest', ['sort' => 'oldest']);

// http://example.com/posts?sort=oldest
```

쿼리 파라미터 값으로 배열을 전달할 수도 있습니다. 이런 값들은 자동으로 적절한 키와 인코딩을 적용해서 URL에 추가됩니다.

```php
echo $url = url()->query('/posts', ['columns' => ['title', 'body']]);

// http://example.com/posts?columns%5B0%5D=title&columns%5B1%5D=body

echo urldecode($url);

// http://example.com/posts?columns[0]=title&columns[1]=body
```

<a name="accessing-the-current-url"></a>
### 현재 URL 접근하기

`url` 헬퍼에 경로를 전달하지 않으면, `Illuminate\Routing\UrlGenerator` 인스턴스를 반환합니다. 이를 통해 현재 URL 정보에 접근할 수 있습니다.

```php
// 쿼리 문자열을 제외한 현재 URL을 가져옵니다.
echo url()->current();

// 쿼리 문자열을 포함한 현재 URL을 가져옵니다.
echo url()->full();

// 이전 요청의 전체 URL을 가져옵니다.
echo url()->previous();

// 이전 요청의 경로만 가져옵니다.
echo url()->previousPath();
```

이러한 메서드들은 `URL` [파사드](/docs/facades)를 통해서도 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\URL;

echo URL::current();
```

<a name="urls-for-named-routes"></a>
## 이름 있는 라우트의 URL

`route` 헬퍼는 [이름 있는 라우트](/docs/routing#named-routes)의 URL을 생성할 때 사용합니다. 이름 있는 라우트를 사용하면, 실제 라우트에 정의된 URL에 직접 의존하지 않고도 URL을 생성할 수 있습니다. 따라서 라우트의 URL이 변경되어도 `route` 함수를 사용하는 부분을 수정할 필요 없이 그대로 동작합니다. 예를 들어, 다음과 같은 라우트가 있다고 가정해봅니다.

```php
Route::get('/post/{post}', function (Post $post) {
    // ...
})->name('post.show');
```

이 라우트의 URL을 생성하려면 다음과 같이 `route` 헬퍼를 사용할 수 있습니다.

```php
echo route('post.show', ['post' => 1]);

// http://example.com/post/1
```

물론, `route` 헬퍼는 여러 파라미터가 있는 라우트의 URL도 생성할 수 있습니다.

```php
Route::get('/post/{post}/comment/{comment}', function (Post $post, Comment $comment) {
    // ...
})->name('comment.show');

echo route('comment.show', ['post' => 1, 'comment' => 3]);

// http://example.com/post/1/comment/3
```

라우트에서 정의한 파라미터 외에 추가로 배열 요소를 전달하면, 해당 값들은 쿼리 문자열로 URL에 추가됩니다.

```php
echo route('post.show', ['post' => 1, 'search' => 'rocket']);

// http://example.com/post/1?search=rocket
```

<a name="eloquent-models"></a>
#### Eloquent 모델

URL을 생성할 때 [Eloquent 모델](/docs/eloquent)의 라우트 키(일반적으로 기본 키)를 사용하는 경우가 많습니다. 이때는 Eloquent 모델 객체를 파라미터 값으로 넘기면, `route` 헬퍼가 자동으로 모델의 라우트 키 값을 추출합니다.

```php
echo route('post.show', ['post' => $post]);
```

<a name="signed-urls"></a>
### 서명된 URL

라라벨에서는 이름 있는 라우트에 대해 쉽게 "서명된" URL을 생성할 수 있습니다. 서명된 URL은 쿼리 문자열에 "서명" 해시가 추가되어, URL이 생성된 이후 변경되지 않았는지를 라라벨이 검증할 수 있도록 해줍니다. 서명된 URL은 외부에서 접근이 가능하면서도, URL 변조를 막아야 하는 경우에 유용하게 사용할 수 있습니다.

예를 들어, 고객에게 이메일로 발송하는 공개 "구독 취소(unsubscribe)" 링크 등에 서명된 URL을 사용할 수 있습니다. 이름 있는 라우트에 대한 서명된 URL을 생성하려면, `URL` 파사드의 `signedRoute` 메서드를 사용합니다.

```php
use Illuminate\Support\Facades\URL;

return URL::signedRoute('unsubscribe', ['user' => 1]);
```

서명 URL에서 도메인을 해시에서 제외하고 싶다면, `signedRoute` 메서드에 `absolute` 인자를 추가하면 됩니다.

```php
return URL::signedRoute('unsubscribe', ['user' => 1], absolute: false);
```

일정 시간이 지난 후 만료되는 임시 서명 URL을 생성하려면 `temporarySignedRoute` 메서드를 사용할 수 있습니다. 라라벨은 임시 서명 URL을 검증할 때, URL에 포함된 만료 시간이 아직 지나지 않았는지도 함께 확인합니다.

```php
use Illuminate\Support\Facades\URL;

return URL::temporarySignedRoute(
    'unsubscribe', now()->addMinutes(30), ['user' => 1]
);
```

<a name="validating-signed-route-requests"></a>
#### 서명된 라우트 요청 검증

들어오는 요청에 서명이 유효한지 확인하려면, 전달받은 `Illuminate\Http\Request` 인스턴스에서 `hasValidSignature` 메서드를 호출하면 됩니다.

```php
use Illuminate\Http\Request;

Route::get('/unsubscribe/{user}', function (Request $request) {
    if (! $request->hasValidSignature()) {
        abort(401);
    }

    // ...
})->name('unsubscribe');
```

애플리케이션 프론트엔드에서, 클라이언트 사이드 페이지네이션 등으로 인해 서명된 URL에 데이터를 추가해야 할 수도 있습니다. 이 경우, `hasValidSignatureWhileIgnoring` 메서드를 사용하여 서명 검증에서 무시할 쿼리 파라미터를 지정할 수 있습니다. 이때, 무시되는 파라미터는 누구나 변경할 수 있으므로 주의해야 합니다.

```php
if (! $request->hasValidSignatureWhileIgnoring(['page', 'order'])) {
    abort(401);
}
```

요청 인스턴스로 직접 서명 검증을 하지 않고, 라우트에 `signed` (`Illuminate\Routing\Middleware\ValidateSignature`) [미들웨어](/docs/middleware)를 지정해도 됩니다. 이 미들웨어는 서명이 유효하지 않을 경우 자동으로 `403` HTTP 응답을 반환합니다.

```php
Route::post('/unsubscribe/{user}', function (Request $request) {
    // ...
})->name('unsubscribe')->middleware('signed');
```

서명된 URL에 도메인이 해시로 포함되어 있지 않다면, 미들웨어에 `relative` 인자를 추가로 전달해야 합니다.

```php
Route::post('/unsubscribe/{user}', function (Request $request) {
    // ...
})->name('unsubscribe')->middleware('signed:relative');
```

<a name="responding-to-invalid-signed-routes"></a>
#### 잘못된 서명 URL에 대한 응답

만료된 서명 URL에 사용자가 접근하면, 기본적으로 `403` HTTP 상태 코드용 일반 오류 페이지를 받게 됩니다. 하지만, 애플리케이션의 `bootstrap/app.php` 파일에서 `InvalidSignatureException` 예외에 대한 "렌더" 클로저를 정의하여 이 동작을 커스터마이즈할 수 있습니다.

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

`action` 함수는 지정한 컨트롤러 액션에 대한 URL을 생성합니다.

```php
use App\Http\Controllers\HomeController;

$url = action([HomeController::class, 'index']);
```

컨트롤러 메서드가 라우트 파라미터를 받을 경우, 두 번째 인자로 연관 배열을 전달해 파라미터 값을 지정할 수 있습니다.

```php
$url = action([UserController::class, 'profile'], ['id' => 1]);
```

<a name="fluent-uri-objects"></a>
## 플루언트 URI 객체

라라벨의 `Uri` 클래스는 객체를 통해 URI를 손쉽고 유연하게 생성하고 조작할 수 있는 인터페이스를 제공합니다. 이 클래스는 내부적으로 League URI 패키지의 기능을 감싸며, 라라벨의 라우팅 시스템과도 자연스럽게 연동됩니다.

정적 메서드를 사용해 간편하게 `Uri` 인스턴스를 생성할 수 있습니다.

```php
use App\Http\Controllers\UserController;
use App\Http\Controllers\InvokableController;
use Illuminate\Support\Uri;

// 지정한 문자열로부터 URI 인스턴스 생성...
$uri = Uri::of('https://example.com/path');

// 경로, 이름 있는 라우트, 컨트롤러 액션에 대한 URI 인스턴스 생성...
$uri = Uri::to('/dashboard');
$uri = Uri::route('users.show', ['user' => 1]);
$uri = Uri::signedRoute('users.show', ['user' => 1]);
$uri = Uri::temporarySignedRoute('user.index', now()->addMinutes(5));
$uri = Uri::action([UserController::class, 'index']);
$uri = Uri::action(InvokableController::class);

// 현재 요청의 URL로부터 URI 인스턴스 생성...
$uri = $request->uri();
```

URI 인스턴스를 얻은 후에는, 다음과 같이 체이닝 방식으로 다양한 속성을 손쉽게 수정할 수 있습니다.

```php
$uri = Uri::of('https://example.com')
    ->withScheme('http')
    ->withHost('test.com')
    ->withPort(8000)
    ->withPath('/users')
    ->withQuery(['page' => 2])
    ->withFragment('section-1');
```

플루언트 URI 객체 사용 관련 더 자세한 내용은 [URI 문서](/docs/helpers#uri)를 참고하세요.

<a name="default-values"></a>
## 기본값 지정

애플리케이션에 따라 특정 URL 파라미터에 대해 요청 전체에서 기본값을 지정하고 싶을 수 있습니다. 예를 들어 많은 라우트에서 `{locale}` 파라미터를 정의했다고 가정해봅니다.

```php
Route::get('/{locale}/posts', function () {
    // ...
})->name('post.index');
```

이때마다 매번 `locale`을 `route` 헬퍼에 전달하는 일은 번거롭습니다. 이러한 경우, `URL::defaults` 메서드를 사용하면 해당 파라미터에 대해 현재 요청에서 항상 자동으로 적용될 기본값을 지정할 수 있습니다. [라우트 미들웨어](/docs/middleware#assigning-middleware-to-routes)에서 이 메서드를 호출하면, 현재 요청 정보를 활용할 수 있어 좋습니다.

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

이렇게 `locale` 파라미터의 기본값을 지정하면, 이후 `route` 헬퍼를 통해 URL을 생성할 때마다 더는 값을 명시적으로 전달할 필요가 없습니다.

<a name="url-defaults-middleware-priority"></a>
#### URL 기본값과 미들웨어 우선순위

URL 기본값을 설정하면, 라라벨의 암묵적 모델 바인딩 처리에 영향을 줄 수 있습니다. 따라서 URL 기본값을 설정하는 미들웨어는 반드시 라라벨의 `SubstituteBindings` 미들웨어보다 먼저 실행되도록 [미들웨어의 우선순위](/docs/middleware#sorting-middleware)를 조정해야 합니다. 이는 애플리케이션의 `bootstrap/app.php` 파일에서 `priority` 미들웨어 메서드를 사용해 적용할 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->prependToPriorityList(
        before: \Illuminate\Routing\Middleware\SubstituteBindings::class,
        prepend: \App\Http\Middleware\SetDefaultLocaleForUrls::class,
    );
})
```
