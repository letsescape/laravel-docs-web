# CSRF 보호 (CSRF Protection)

- [소개](#csrf-introduction)
- [CSRF 요청 방지](#preventing-csrf-requests)
    - [URI 제외하기](#csrf-excluding-uris)
- [X-CSRF-Token](#csrf-x-csrf-token)
- [X-XSRF-Token](#csrf-x-xsrf-token)

<a name="csrf-introduction"></a>
## 소개

사이트 간 요청 위조(Cross-site request forgery, CSRF)는 인증된 사용자의 권한으로 원하지 않는 명령을 실행하도록 유도하는 악의적인 공격 방식 중 하나입니다. 다행히 라라벨은 [사이트 간 요청 위조](https://en.wikipedia.org/wiki/Cross-site_request_forgery)(CSRF) 공격으로부터 애플리케이션을 손쉽게 보호할 수 있도록 도와줍니다.

<a name="csrf-explanation"></a>
#### 취약점에 대한 설명

사이트 간 요청 위조에 익숙하지 않은 분들을 위해, 이 취약점이 실제로 어떻게 악용될 수 있는지 예시를 들어 설명하겠습니다. 예를 들어, 여러분의 애플리케이션에 `/user/email` 라우트가 있고, 이 라우트는 인증된 사용자의 이메일 주소를 변경하기 위해 `POST` 요청을 받는다고 가정해봅니다. 일반적으로 이 라우트는 사용자가 새로 사용하고 싶은 이메일 주소가 입력된 `email` 입력 필드를 기대합니다.

만약 CSRF 보호가 없다면, 악의적인 웹사이트는 여러분의 애플리케이션 `/user/email` 경로를 대상으로 하는 HTML 폼을 만들고, 해당 폼에 악성 사용자의 이메일 주소를 담아 제출할 수 있습니다.

```blade
<form action="https://your-application.com/user/email" method="POST">
    <input type="email" value="malicious-email@example.com">
</form>

<script>
    document.forms[0].submit();
</script>
```

만약 이렇게 만든 웹사이트가 페이지가 열리자마자 폼을 자동 제출하게 한다면, 악의적인 사용자는 여러분의 애플리케이션을 이용하는 누군가를 자신의 사이트로 유도하기만 하면, 그 사용자의 이메일 주소가 악성 사용자의 이메일로 변경되어 버립니다.

이런 취약점을 막으려면, 들어오는 모든 `POST`, `PUT`, `PATCH`, `DELETE` 요청에 대해 악성 애플리케이션이 알 수 없는 비밀 세션 값을 검사해야 합니다.

<a name="preventing-csrf-requests"></a>
## CSRF 요청 방지

라라벨은 애플리케이션이 관리하는 활성 [사용자 세션](/docs/session)마다 자동으로 CSRF "토큰"을 생성합니다. 이 토큰은 실제로 요청을 수행하는 사용자가 인증된 사용자 본인임을 확인하는 데 사용됩니다. 이 토큰은 사용자의 세션에 저장되고, 세션이 재생성될 때마다 갱신되기 때문에 악의적인 애플리케이션이 접근할 수 없습니다.

현재 세션의 CSRF 토큰은 요청의 세션 또는 `csrf_token` 헬퍼 함수를 통해 얻을 수 있습니다.

```php
use Illuminate\Http\Request;

Route::get('/token', function (Request $request) {
    $token = $request->session()->token();

    $token = csrf_token();

    // ...
});
```

애플리케이션에서 "POST", "PUT", "PATCH", "DELETE"와 같은 HTML 폼을 만들 때는, 폼에 CSRF 보호를 위한 숨겨진 `_token` 필드를 반드시 추가해야 합니다. 이렇게 하면 CSRF 보호 미들웨어가 해당 요청을 올바르게 검증할 수 있습니다. 편리하게도, `@csrf` Blade 지시어를 이용하면 숨겨진 토큰 입력 필드를 쉽게 생성할 수 있습니다.

```blade
<form method="POST" action="/profile">
    @csrf

    <!-- 아래와 동일한 코드입니다... -->
    <input type="hidden" name="_token" value="{{ csrf_token() }}" />
</form>
```

`Illuminate\Foundation\Http\Middleware\ValidateCsrfToken` [미들웨어](/docs/middleware)는 기본적으로 `web` 미들웨어 그룹에 포함되어 있으며, 요청 입력 값에 포함된 토큰이 세션에 저장된 토큰과 일치하는지 자동으로 확인합니다. 두 토큰이 일치하면, 해당 요청이 인증된 사용자의 실제 요청임을 확실히 알 수 있습니다.

<a name="csrf-tokens-and-spas"></a>
### CSRF 토큰과 SPA

만약 라라벨을 API 백엔드로 사용하는 SPA(Single Page Application)를 개발하고 있다면, API 인증 및 CSRF 취약점 방지와 관련해 [Laravel Sanctum 문서](/docs/sanctum)를 참고하시기 바랍니다.

<a name="csrf-excluding-uris"></a>
### 특정 URI를 CSRF 보호에서 제외하기

특정 URI는 CSRF 보호 대상에서 제외하고 싶을 때가 있습니다. 예를 들어, [Stripe](https://stripe.com)로 결제 처리를 하고 있고, 이들의 웹훅 시스템을 사용하는 경우라면, Stripe가 웹훅 요청을 보낼 때 사용할 CSRF 토큰 값을 알 수 없으므로, 해당 Stripe 웹훅 처리 라우트는 CSRF 보호에서 제외해야 합니다.

일반적으로 이런 라우트는 라라벨이 `routes/web.php` 파일 내의 모든 라우트에 자동 적용하는 `web` 미들웨어 그룹 바깥에 두는 것이 좋습니다. 하지만, 애플리케이션의 `bootstrap/app.php` 파일에서 `validateCsrfTokens` 메서드에 제외할 URI 목록을 전달하여 특정 라우트만 CSRF 보호 대상에서 제외할 수도 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->validateCsrfTokens(except: [
        'stripe/*',
        'http://example.com/foo/bar',
        'http://example.com/foo/*',
    ]);
})
```

> [!NOTE]
> 테스트를 실행할 때는 모든 라우트에 대해 CSRF 미들웨어가 자동으로 비활성화됩니다.

<a name="csrf-x-csrf-token"></a>
## X-CSRF-TOKEN

POST 파라미터로 CSRF 토큰을 확인하는 것 외에도, `Illuminate\Foundation\Http\Middleware\ValidateCsrfToken` 미들웨어(기본적으로 `web` 미들웨어 그룹에 포함됨)는 `X-CSRF-TOKEN` 요청 헤더도 함께 확인합니다. 예를 들어, 토큰을 HTML의 `meta` 태그에 저장할 수 있습니다.

```blade
<meta name="csrf-token" content="{{ csrf_token() }}">
```

그런 다음, jQuery와 같은 라이브러리를 사용해 모든 요청 헤더에 이 토큰이 자동으로 추가되도록 설정할 수 있습니다. 이를 통해 레거시 JavaScript 기술을 사용하는 AJAX 기반 애플리케이션에서도 간단하게 CSRF 보호를 구현할 수 있습니다.

```js
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});
```

<a name="csrf-x-xsrf-token"></a>
## X-XSRF-TOKEN

라라벨은 현재 CSRF 토큰 값을 암호화된 `XSRF-TOKEN` 쿠키로 저장해, 프레임워크가 응답할 때마다 이 쿠키를 함께 보냅니다. 이 쿠키의 값을 이용해 `X-XSRF-TOKEN` 요청 헤더를 설정할 수 있습니다.

이 쿠키는 기본적으로 개발자 편의를 위해 제공됩니다. Angular, Axios와 같은 일부 자바스크립트 프레임워크나 라이브러리는 동일 출처 요청(same-origin request) 시 쿠키 값을 자동으로 `X-XSRF-TOKEN` 헤더에 포함해 보내기도 합니다.

> [!NOTE]
> 기본적으로, `resources/js/bootstrap.js` 파일에는 Axios HTTP 라이브러리가 포함되어 있고, Axios는 자동으로 `X-XSRF-TOKEN` 헤더를 전송해줍니다.
