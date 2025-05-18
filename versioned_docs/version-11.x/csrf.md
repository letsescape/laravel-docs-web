# CSRF 보호 (CSRF Protection)

- [소개](#csrf-introduction)
- [CSRF 요청 방지](#preventing-csrf-requests)
    - [URI 제외하기](#csrf-excluding-uris)
- [X-CSRF-Token](#csrf-x-csrf-token)
- [X-XSRF-Token](#csrf-x-xsrf-token)

<a name="csrf-introduction"></a>
## 소개

크로스 사이트 요청 위조(Cross-site request forgery, CSRF)는 인증된 사용자를 가장하여 무단 명령을 실행하게 만드는 악의적인 공격 기법 중 하나입니다. 다행히도 라라벨은 [크로스 사이트 요청 위조](https://en.wikipedia.org/wiki/Cross-site_request_forgery) 공격으로부터 애플리케이션을 쉽고 안전하게 보호할 수 있도록 관련 기능을 제공합니다.

<a name="csrf-explanation"></a>
#### 취약점 설명

크로스 사이트 요청 위조가 익숙하지 않은 분들을 위해 이 취약점이 어떻게 악용될 수 있는지 예시로 설명하겠습니다. 예를 들어, 여러분의 애플리케이션에 인증된 사용자의 이메일을 변경하는 `POST` 요청용 `/user/email` 경로가 있다고 가정해봅니다. 이 경로는 아마도 사용자가 새로 사용하고자 하는 이메일 주소를 담은 `email` 입력 필드를 기대할 것입니다.

만약 CSRF 보호가 없다면, 악의적인 사용자는 여러분의 애플리케이션의 `/user/email` 경로로 자신의 이메일 주소를 제출하는 HTML 폼을 만들어 공격에 사용할 수 있습니다:

```blade
<form action="https://your-application.com/user/email" method="POST">
    <input type="email" value="malicious-email@example.com">
</form>

<script>
    document.forms[0].submit();
</script>
```

이 악성 웹사이트는 페이지가 로드됨과 동시에 폼을 자동으로 전송하므로, 공격자는 단지 여러분의 애플리케이션을 이용하는 사용자가 자신의 사이트를 방문하도록 유도하기만 하면 해당 사용자의 이메일 주소가 여러분의 애플리케이션에서 바뀌게 됩니다.

이러한 취약점을 방지하기 위해서는 모든 `POST`, `PUT`, `PATCH`, `DELETE` 요청이 전달될 때마다 공격자가 임의로 알 수 없는 비밀 세션 값을 확인해야 합니다.

<a name="preventing-csrf-requests"></a>
## CSRF 요청 방지

라라벨은 애플리케이션이 관리하는 각 [사용자 세션](/docs/11.x/session)마다 자동으로 CSRF "토큰"을 생성합니다. 이 토큰은 인증된 사용자가 실제로 요청을 보내는 주체임을 검증하는데 사용됩니다. 이 토큰은 사용자의 세션에 저장되며, 세션이 다시 생성될 때마다 값이 변경되기 때문에 악의적인 애플리케이션에서는 접근할 수 없습니다.

현재 세션의 CSRF 토큰은 요청 객체의 세션이나 `csrf_token` 헬퍼 함수를 통해 얻을 수 있습니다:

```
use Illuminate\Http\Request;

Route::get('/token', function (Request $request) {
    $token = $request->session()->token();

    $token = csrf_token();

    // ...
});
```

애플리케이션에서 "POST", "PUT", "PATCH", "DELETE" 방식의 HTML 폼을 정의할 때마다, 숨겨진 CSRF `_token` 필드를 반드시 포함시켜야 CSRF 보호 미들웨어가 해당 요청을 검증할 수 있습니다. 편리하게 사용하려면 `@csrf` Blade 디렉티브를 이용해 숨겨진 토큰 입력 필드를 자동으로 생성할 수 있습니다:

```blade
<form method="POST" action="/profile">
    @csrf

    <!-- 아래와 동일함 -->
    <input type="hidden" name="_token" value="{{ csrf_token() }}" />
</form>
```

`Illuminate\Foundation\Http\Middleware\ValidateCsrfToken` [미들웨어](/docs/11.x/middleware)는 기본적으로 `web` 미들웨어 그룹에 포함되어 있으며, 요청 안의 입력값에 담긴 토큰과 세션에 저장된 토큰이 일치하는지 자동으로 확인합니다. 이 두 토큰이 일치하면, 인증된 사용자가 실제로 요청을 보낸 것임을 신뢰할 수 있습니다.

<a name="csrf-tokens-and-spas"></a>
### CSRF 토큰과 SPA

만약 라라벨을 API 백엔드로 활용하는 SPA(싱글 페이지 애플리케이션)를 구축 중이라면, API 인증 및 CSRF 취약점 보호에 대한 자세한 내용은 [Laravel Sanctum 문서](/docs/11.x/sanctum)를 참고하시기 바랍니다.

<a name="csrf-excluding-uris"></a>
### URI를 CSRF 보호에서 제외하기

특정 URI들을 CSRF 보호 대상에서 제외하고 싶을 때도 있습니다. 예를 들어, [Stripe](https://stripe.com)를 이용해 결제를 처리하면서 Stripe의 웹훅 시스템을 사용하는 경우, Stripe는 여러분의 라우트에 어떤 CSRF 토큰을 전달해야 하는지 알 수 없으므로, 웹훅 핸들러 경로는 CSRF 보호에서 제외해야 합니다.

이런 종류의 라우트는 일반적으로 라라벨이 `routes/web.php` 파일에서 모든 라우트에 적용하는 `web` 미들웨어 그룹 바깥에 배치하는 것이 좋습니다. 그러나, 애플리케이션의 `bootstrap/app.php` 파일에서 URIs를 `validateCsrfTokens` 메서드에 전달하여 특정 라우트만 선택적으로 제외할 수도 있습니다:

```
->withMiddleware(function (Middleware $middleware) {
    $middleware->validateCsrfTokens(except: [
        'stripe/*',
        'http://example.com/foo/bar',
        'http://example.com/foo/*',
    ]);
})
```

> [!NOTE]  
> 편의상, [테스트 실행](/docs/11.x/testing) 시에는 모든 라우트의 CSRF 미들웨어가 자동으로 비활성화됩니다.

<a name="csrf-x-csrf-token"></a>
## X-CSRF-TOKEN

POST 파라미터로 전달된 CSRF 토큰을 검사하는 것에 더해, `Illuminate\Foundation\Http\Middleware\ValidateCsrfToken` 미들웨어는(기본적으로 `web` 미들웨어 그룹에 포함되어 있음) `X-CSRF-TOKEN` 요청 헤더도 함께 검사합니다. 예를 들어, 아래와 같이 HTML의 `meta` 태그에 토큰을 저장할 수도 있습니다:

```blade
<meta name="csrf-token" content="{{ csrf_token() }}">
```

그리고 jQuery 같은 라이브러리에 아래와 같이 설정하면, 모든 요청 헤더에 해당 토큰을 자동으로 추가할 수 있습니다. 이를 통해 레거시 자바스크립트 기술을 사용하는 애플리케이션에서도 간편하게 CSRF 보호를 적용할 수 있습니다:

```js
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});
```

<a name="csrf-x-xsrf-token"></a>
## X-XSRF-TOKEN

라라벨은 현재 CSRF 토큰을 암호화된 `XSRF-TOKEN` 쿠키에 저장하여, 프레임워크가 응답을 생성할 때마다 자동으로 전송합니다. 여러분은 이 쿠키의 값을 `X-XSRF-TOKEN` 요청 헤더에 설정할 수 있습니다.

이 쿠키는 주로 개발자의 편의성을 위해 제공되는 것으로, Angular, Axios와 같은 일부 자바스크립트 프레임워크 및 라이브러리는 동일 출처 요청(same-origin request)에서 이 쿠키 값을 자동으로 `X-XSRF-TOKEN` 헤더에 할당해 전송하기 때문입니다.

> [!NOTE]  
> 기본적으로, `resources/js/bootstrap.js` 파일에는 Axios HTTP 라이브러리가 포함되어 있으며, 이를 통해 `X-XSRF-TOKEN` 헤더가 자동으로 전송됩니다.