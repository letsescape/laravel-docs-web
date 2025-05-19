# CSRF 보호 (CSRF Protection)

- [소개](#csrf-introduction)
- [CSRF 요청 방지](#preventing-csrf-requests)
    - [URI 제외 설정](#csrf-excluding-uris)
- [X-CSRF-TOKEN](#csrf-x-csrf-token)
- [X-XSRF-TOKEN](#csrf-x-xsrf-token)

<a name="csrf-introduction"></a>
## 소개

크로스 사이트 요청 위조(CSRF, Cross-site request forgery)는 인증된 사용자를 가장해 무단으로 명령을 실행하는 악의적인 공격의 한 유형입니다. 다행히 라라벨은 [크로스 사이트 요청 위조](https://en.wikipedia.org/wiki/Cross-site_request_forgery) 공격으로부터 애플리케이션을 손쉽게 보호할 수 있도록 지원합니다.

<a name="csrf-explanation"></a>
#### 취약점에 대한 설명

혹시 크로스 사이트 요청 위조 공격에 익숙하지 않으시다면, 이 취약점이 어떻게 악용될 수 있는지 예시로 설명하겠습니다. 예를 들어, 여러분의 애플리케이션에 인증된 사용자의 이메일 주소를 변경하는 `/user/email` 경로가 있다고 가정해보겠습니다. 이 경로는 주로 사용자가 새로 사용하고자 하는 이메일 주소를 담은 `email` 입력 필드를 받아 처리합니다.

CSRF 보호 기능이 없다면, 악의적인 웹사이트는 여러분의 애플리케이션의 `/user/email` 경로로 데이터를 전송하는 HTML 폼을 만들어 자신이 원하는 이메일 주소를 입력해 전송할 수 있습니다:

```blade
<form action="https://your-application.com/user/email" method="POST">
    <input type="email" value="malicious-email@example.com">
</form>

<script>
    document.forms[0].submit();
</script>
```

만약 악의적인 웹사이트가 페이지가 열리자마자 이 폼을 자동 제출하도록 했다면, 공격자는 단지 여러분 애플리케이션의 사용자를 자신의 사이트로 유인하기만 하면 이메일 주소가 여러분의 애플리케이션에서 변경되어 버릴 수 있습니다.

이러한 취약점을 방지하려면, 애플리케이션으로 들어오는 모든 `POST`, `PUT`, `PATCH`, `DELETE` 요청에 대해 악성 애플리케이션이 접근할 수 없는 비밀 세션 값을 포함하고 있는지 확인해야 합니다.

<a name="preventing-csrf-requests"></a>
## CSRF 요청 방지

라라벨은 애플리케이션이 관리하는 각 [사용자 세션](/docs/12.x/session)마다 CSRF "토큰"을 자동으로 생성합니다. 이 토큰은 현재 인증된 사용자가 실제로 요청을 생성했는지 확인하기 위한 용도로 사용됩니다. 토큰은 사용자의 세션에 저장되고, 세션이 새로 만들어질 때마다 값이 변경되므로, 악성 애플리케이션이 해당 값을 알거나 접근할 방법이 없습니다.

현재 세션의 CSRF 토큰은 요청 객체의 세션이나 `csrf_token` 헬퍼 함수를 통해 얻을 수 있습니다:

```php
use Illuminate\Http\Request;

Route::get('/token', function (Request $request) {
    $token = $request->session()->token();

    $token = csrf_token();

    // ...
});
```

애플리케이션에서 "POST", "PUT", "PATCH", "DELETE" 방식의 HTML 폼을 만들 때마다 CSRF `_token` 필드를 폼에 숨겨서 포함해야 합니다. 그래야 CSRF 보호 미들웨어가 해당 요청을 유효한지 검사할 수 있습니다. 편리하게도, `@csrf` Blade 디렉티브를 사용하면 숨겨진 토큰 입력 필드를 쉽게 생성할 수 있습니다:

```blade
<form method="POST" action="/profile">
    @csrf

    <!-- Equivalent to... -->
    <input type="hidden" name="_token" value="{{ csrf_token() }}" />
</form>
```

`Illuminate\Foundation\Http\Middleware\ValidateCsrfToken` [미들웨어](/docs/12.x/middleware)는 기본적으로 `web` 미들웨어 그룹에 포함되어 있으며, 요청 입력값에 포함된 토큰과 세션에 저장된 토큰이 서로 일치하는지 자동으로 검사합니다. 두 토큰이 일치한다면 인증된 사용자가 직접 해당 요청을 보낸 것임을 신뢰할 수 있습니다.

<a name="csrf-tokens-and-spas"></a>
### CSRF 토큰과 SPA

라라벨을 API 백엔드로 사용하는 SPA(싱글 페이지 애플리케이션)를 개발 중이라면, API 인증 및 CSRF 취약점 방지와 관련된 정보를 [Laravel Sanctum 문서](/docs/12.x/sanctum)에서 꼭 확인하시기 바랍니다.

<a name="csrf-excluding-uris"></a>
### CSRF 보호에서 URI 제외하기

특정 URI 경로를 CSRF 보호 대상에서 제외시켜야 하는 경우가 있을 수 있습니다. 예를 들어, [Stripe](https://stripe.com)와 같은 외부 서비스를 연동해 결제를 처리하고 웹훅(webhook) 시스템을 사용할 때, Stripe는 여러분의 경로로 CSRF 토큰 값을 보내줄 수 없습니다. 따라서 Stripe 웹훅 핸들러 경로는 CSRF 보호에서 제외해야 합니다.

일반적으로 이런 경로들은 라라벨이 `routes/web.php` 파일에서 적용하는 `web` 미들웨어 그룹 바깥에 위치시켜야 합니다. 하지만, 애플리케이션의 `bootstrap/app.php` 파일에서 `validateCsrfTokens` 메서드에 제외할 URI를 등록해 특정 경로만 편리하게 제외할 수도 있습니다:

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
> 테스트를 [실행할 때](/docs/12.x/testing)는 모든 라우트에서 CSRF 미들웨어가 자동으로 비활성화되므로 별도의 설정이 필요하지 않습니다.

<a name="csrf-x-csrf-token"></a>
## X-CSRF-TOKEN

CSRF 토큰은 POST 파라미터로만 검사되는 것이 아닙니다. `Illuminate\Foundation\Http\Middleware\ValidateCsrfToken` 미들웨어(기본적으로 `web` 미들웨어 그룹에 포함)는 `X-CSRF-TOKEN` 요청 헤더도 함께 검사합니다. 예를 들어, 토큰 값을 HTML의 `meta` 태그에 저장할 수 있습니다:

```blade
<meta name="csrf-token" content="{{ csrf_token() }}">
```

그런 다음, jQuery 같은 라이브러리를 사용해 모든 요청 헤더에 토큰이 자동으로 추가되도록 설정할 수 있습니다. 이렇게 하면 레거시 자바스크립트 기술 기반의 AJAX 애플리케이션도 간단히 CSRF 보호를 적용할 수 있습니다:

```js
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});
```

<a name="csrf-x-xsrf-token"></a>
## X-XSRF-TOKEN

라라벨은 현재 CSRF 토큰을 암호화된 `XSRF-TOKEN` 쿠키에 담아 프레임워크가 생성하는 모든 응답에 함께 포함시킵니다. 이 쿠키 값을 `X-XSRF-TOKEN` 요청 헤더에 세팅해서 서버에 전달할 수 있습니다.

이 쿠키는 주로 개발 시 편의를 위해 제공됩니다. 예를 들어 Angular, Axios와 같은 일부 자바스크립트 프레임워크 및 라이브러리는 동일 출처(same-origin) 요청 시 이 쿠키 값을 자동으로 `X-XSRF-TOKEN` 헤더에 실어 전송합니다.

> [!NOTE]
> 기본적으로, `resources/js/bootstrap.js` 파일에는 Axios HTTP 라이브러리가 포함되어 있어, 별다른 설정 없이도 자동으로 `X-XSRF-TOKEN` 헤더를 전송합니다.
