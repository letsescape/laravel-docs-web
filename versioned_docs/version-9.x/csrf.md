# CSRF 보호 (CSRF Protection)

- [소개](#csrf-introduction)
- [CSRF 요청 방지](#preventing-csrf-requests)
    - [URI 제외](#csrf-excluding-uris)
- [X-CSRF-Token](#csrf-x-csrf-token)
- [X-XSRF-Token](#csrf-x-xsrf-token)

<a name="csrf-introduction"></a>
## 소개

크로스 사이트 요청 위조(Cross-site request forgery, CSRF)는 인증된 사용자를 대신하여 무단 명령을 수행하는 악의적인 공격 방식 중 하나입니다. 다행히도, 라라벨은 애플리케이션을 [크로스 사이트 요청 위조](https://en.wikipedia.org/wiki/Cross-site_request_forgery) 공격으로부터 쉽게 보호할 수 있도록 해줍니다.

<a name="csrf-explanation"></a>
#### 취약점에 대한 설명

크로스 사이트 요청 위조에 익숙하지 않은 분들을 위해, 이 취약점이 실제로 어떻게 악용될 수 있는지 예시로 설명하겠습니다. 예를 들어, 여러분의 애플리케이션에 인증된 사용자의 이메일 주소를 변경하는 `POST` 요청용 `/user/email` 라우트가 있다고 가정해보겠습니다. 이 라우트는 대부분 사용자가 사용하고자 하는 이메일 주소를 입력하는 `email` 필드 값을 기대할 것입니다.

CSRF 보호가 없다면, 악의적인 웹사이트는 여러분의 애플리케이션 `/user/email` 라우트로 향하는 HTML 폼을 만들고, 공격자의 이메일 주소로 해당 폼을 제출할 수 있습니다:

```blade
<form action="https://your-application.com/user/email" method="POST">
    <input type="email" value="malicious-email@example.com">
</form>

<script>
    document.forms[0].submit();
</script>
```

 만약 이 악의적인 웹사이트가 페이지가 로드될 때 자동으로 폼을 전송하도록 만들어졌다면, 공격자는 단지 여러분 애플리케이션의 아무런 의심 없는 사용자를 자신의 사이트로 방문하게끔 유도하기만 하면 됩니다. 그러면 그 사용자의 이메일 주소가 여러분의 애플리케이션에서 공격자의 이메일로 변경되어 버립니다.

 이 취약점을 막기 위해서는, 들어오는 모든 `POST`, `PUT`, `PATCH`, `DELETE` 요청에 대해 악의적인 애플리케이션은 알 수 없는 비밀 세션 값을 검사해야 합니다.

<a name="preventing-csrf-requests"></a>
## CSRF 요청 방지

라라벨은 애플리케이션에서 관리하는 각 [사용자 세션](/docs/9.x/session)마다 CSRF "토큰"을 자동으로 생성합니다. 이 토큰은 인증된 사용자가 실제로 요청을 보내고 있는지 확인하는 목적으로 사용됩니다. 이 토큰은 사용자의 세션에 저장되며, 세션이 새로 생성될 때마다 값이 변경되기 때문에, 악의적인 애플리케이션은 접근할 수 없습니다.

현재 세션의 CSRF 토큰은 요청의 세션 객체나 `csrf_token` 헬퍼 함수를 통해 확인할 수 있습니다:

```
use Illuminate\Http\Request;

Route::get('/token', function (Request $request) {
    $token = $request->session()->token();

    $token = csrf_token();

    // ...
});
```

애플리케이션에서 "POST", "PUT", "PATCH", "DELETE" 방식의 HTML 폼을 정의할 때마다, CSRF `_token` 숨김 필드를 반드시 포함시켜야 CSRF 보호 미들웨어가 해당 요청을 정상적으로 검증할 수 있습니다. 이를 더 편리하게 처리하기 위해, `@csrf` Blade 지시어를 사용해서 숨겨진 토큰 입력 필드를 자동으로 생성할 수 있습니다:

```blade
<form method="POST" action="/profile">
    @csrf

    <!-- Equivalent to... -->
    <input type="hidden" name="_token" value="{{ csrf_token() }}" />
</form>
```

기본적으로 `web` 미들웨어 그룹에 포함되어 있는 `App\Http\Middleware\VerifyCsrfToken` [미들웨어](/docs/9.x/middleware)는 요청 입력값의 토큰이 세션에 저장된 토큰과 일치하는지 자동으로 검사합니다. 이 두 값이 일치한다면, 그 요청이 인증된 사용자가 실제로 보낸 것임을 신뢰할 수 있습니다.

<a name="csrf-tokens-and-spas"></a>
### CSRF 토큰과 SPA(싱글 페이지 애플리케이션)

만약 라라벨을 API 백엔드로 사용하는 SPA(싱글 페이지 애플리케이션)를 개발 중이라면, API 인증 및 CSRF 취약점 방지에 대한 자세한 내용은 [Laravel Sanctum 문서](/docs/9.x/sanctum)를 참고하시기 바랍니다.

<a name="csrf-excluding-uris"></a>
### 특정 URI를 CSRF 보호에서 제외하기

특정 URI 경로에 대해 CSRF 보호를 적용하지 않아야 할 상황도 있습니다. 예를 들어, [Stripe](https://stripe.com)를 이용하여 결제를 처리하고, Stripe의 웹훅 시스템을 사용하는 경우라면 Stripe 웹훅 처리 라우트는 CSRF 보호 대상에서 반드시 제외해야 합니다. Stripe는 라라벨 라우트에 어떤 CSRF 토큰을 보내야 할지 알지 못하기 때문입니다.

일반적으로 이런 라우트들은 `routes/web.php` 파일에서 `App\Providers\RouteServiceProvider`가 자동으로 적용하는 `web` 미들웨어 그룹 **밖**에 두는 것이 좋습니다. 그 대신, 해당 라우트를 `VerifyCsrfToken` 미들웨어의 `$except` 속성에 URI를 추가하여 보호 대상에서 제외할 수도 있습니다:

```
<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        'stripe/*',
        'http://example.com/foo/bar',
        'http://example.com/foo/*',
    ];
}
```

> [!NOTE]
> 편의상, [테스트 실행 시](/docs/9.x/testing)에는 모든 라우트에 대해 CSRF 미들웨어가 자동으로 비활성화됩니다.

<a name="csrf-x-csrf-token"></a>
## X-CSRF-TOKEN

POST 파라미터로 CSRF 토큰을 확인하는 것 이외에도, `App\Http\Middleware\VerifyCsrfToken` 미들웨어는 `X-CSRF-TOKEN` 요청 헤더도 함께 검사합니다. 예를 들어, 다음과 같이 HTML의 `meta` 태그에 토큰을 저장할 수 있습니다:

```blade
<meta name="csrf-token" content="{{ csrf_token() }}">
```

그런 다음, jQuery와 같은 라이브러리에게 모든 요청의 헤더에 이 토큰을 자동으로 추가하도록 지시할 수 있습니다. 이렇게 하면 기존 자바스크립트를 사용하는 AJAX 기반 애플리케이션에서도 아주 쉽게 CSRF 보호를 적용할 수 있습니다:

```js
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});
```

<a name="csrf-x-xsrf-token"></a>
## X-XSRF-TOKEN

라라벨은 현재 CSRF 토큰을 암호화된 `XSRF-TOKEN` 쿠키에 저장하여, 프레임워크가 생성하는 모든 응답에 함께 전송합니다. 여러분은 이 쿠키 값을 읽어와서 `X-XSRF-TOKEN` 요청 헤더에 셋팅할 수 있습니다.

이 쿠키는 주로 개발 편의를 위해 제공됩니다. 왜냐하면 Angluar, Axios와 같은 일부 자바스크립트 프레임워크 및 라이브러리는 같은 출처(same-origin) 요청에서 이 쿠키의 값을 자동으로 `X-XSRF-TOKEN` 헤더에 설정해주기 때문입니다.

> [!NOTE]
> 기본적으로, `resources/js/bootstrap.js` 파일에는 Axios HTTP 라이브러리가 포함되어 있으며, 이 라이브러리가 `X-XSRF-TOKEN` 헤더를 자동으로 전송해줍니다.