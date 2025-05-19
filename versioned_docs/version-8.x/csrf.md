# CSRF 보호 (CSRF Protection)

- [소개](#csrf-introduction)
- [CSRF 요청 방지](#preventing-csrf-requests)
    - [CSRF 보호에서 URI 제외하기](#csrf-excluding-uris)
- [X-CSRF-Token](#csrf-x-csrf-token)
- [X-XSRF-Token](#csrf-x-xsrf-token)

<a name="csrf-introduction"></a>
## 소개

크로스 사이트 요청 위조(Cross-site request forgery, CSRF)는 인증된 사용자를 대신해 인가되지 않은 명령을 실행하도록 하는 공격입니다. 다행히도 라라벨은 [크로스 사이트 요청 위조](https://en.wikipedia.org/wiki/Cross-site_request_forgery) (CSRF) 공격으로부터 애플리케이션을 쉽게 보호할 수 있는 기능을 제공합니다.

<a name="csrf-explanation"></a>
#### 취약점 설명

크로스 사이트 요청 위조(CSRF)에 익숙하지 않으신 분들을 위해, 이 취약점이 어떻게 악용될 수 있는지 예시로 설명하겠습니다. 예를 들어, 여러분의 애플리케이션에 인증된 사용자의 이메일 주소를 변경하는 `/user/email` 경로가 있고, 이 경로는 `POST` 요청과 함께 사용자가 새로 사용할 이메일 주소를 `email` 입력 필드로 받는다고 가정해봅시다.

CSRF 보호가 없다면, 악의적인 웹사이트가 아래와 같이 여러분의 애플리케이션의 `/user/email` 경로로 데이터를 전송하는 HTML 폼을 만들어 자신의 이메일 주소를 여러분 애플리케이션에 제출할 수 있습니다.

```
<form action="https://your-application.com/user/email" method="POST">
    <input type="email" value="malicious-email@example.com">
</form>

<script>
    document.forms[0].submit();
</script>
```

만약 이 악의적인 웹사이트가 페이지가 로드될 때 위 폼을 자동으로 제출하도록 만들어 둔다면, 공격자는 여러분 애플리케이션의 사용자가 본인도 모르게 그 사이트에 접속하게만 하면 이메일 주소를 자신의 것으로 바꿔버릴 수 있습니다.

이러한 취약점을 방지하려면, 들어오는 모든 `POST`, `PUT`, `PATCH`, `DELETE` 요청에 대해 악의적인 애플리케이션이 접근할 수 없는 비밀 세션 값을 확인해야 합니다.

<a name="preventing-csrf-requests"></a>
## CSRF 요청 방지

라라벨은 애플리케이션이 관리하는 각 [사용자 세션](/docs/8.x/session)마다 자동으로 CSRF “토큰”을 생성합니다. 이 토큰은 인증된 사용자가 실제로 요청을 보낸 당사자인지 확인하는 데 사용됩니다. 이 토큰은 사용자의 세션에 저장되며, 세션이 재생성될 때마다 변경되기 때문에 악의적인 애플리케이션이 이 값을 알아내는 것은 불가능합니다.

현재 세션의 CSRF 토큰은 요청의 세션이나 `csrf_token` 헬퍼 함수를 통해 가져올 수 있습니다.

```
use Illuminate\Http\Request;

Route::get('/token', function (Request $request) {
    $token = $request->session()->token();

    $token = csrf_token();

    // ...
});
```

애플리케이션에서 "POST", "PUT", "PATCH", "DELETE" 방식의 HTML 폼을 정의할 때는 반드시 폼 안에 숨겨진 CSRF `_token` 필드를 포함해야 CSRF 보호 미들웨어가 요청을 검증할 수 있습니다. 편리하게도, `@csrf` Blade 지시어를 사용하면 이런 숨겨진 토큰 입력 필드가 자동으로 생성됩니다.

```
<form method="POST" action="/profile">
    @csrf

    <!-- 아래와 동일합니다... -->
    <input type="hidden" name="_token" value="{{ csrf_token() }}" />
</form>
```

기본적으로 `web` 미들웨어 그룹에 포함되어 있는 `App\Http\Middleware\VerifyCsrfToken` [미들웨어](/docs/8.x/middleware)는 요청의 입력값에 포함된 토큰이 세션에 저장된 토큰과 일치하는지 자동으로 확인합니다. 두 토큰이 일치한다면, 요청한 사람이 실제로 인증된 사용자임을 신뢰할 수 있습니다.

<a name="csrf-tokens-and-spas"></a>
### CSRF 토큰과 SPA

만약 여러분이 라라벨을 API 백엔드로 활용하고 있는 SPA(Single Page Application)를 개발 중이라면, API 인증 및 CSRF 취약점 방지에 관한 자세한 내용은 [Laravel Sanctum 문서](/docs/8.x/sanctum)를 참고하시기 바랍니다.

<a name="csrf-excluding-uris"></a>
### CSRF 보호에서 URI 제외하기

특정 경로나 URI의 CSRF 보호를 제외해야 하는 경우가 있습니다. 예를 들어, 결제 처리를 위해 [Stripe](https://stripe.com)와 같은 서비스를 사용하고, Stripe의 웹훅 시스템을 적용한다면, Stripe가 여러분의 애플리케이션으로 웹훅을 보낼 때 어떤 CSRF 토큰을 전달해야 하는지 알 수 없기 때문에 해당 라우트는 CSRF 보호 대상에서 제외해야 합니다.

이런 종류의 라우트는 일반적으로 `App\Providers\RouteServiceProvider`가 `routes/web.php` 파일의 모든 라우트에 적용하는 `web` 미들웨어 그룹 밖에 위치시키는 것이 좋습니다. 하지만, 다음과 같이 `VerifyCsrfToken` 미들웨어의 `$except` 속성에 해당 URI를 등록해서도 CSRF 보호를 해제할 수 있습니다.

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

> [!TIP]
> 편의를 위해, [테스트를 실행할 때](/docs/8.x/testing)는 모든 라우트에 대해 CSRF 미들웨어가 자동으로 비활성화됩니다.

<a name="csrf-x-csrf-token"></a>
## X-CSRF-TOKEN

CSRF 토큰을 POST 파라미터로 검사하는 것 외에도, `App\Http\Middleware\VerifyCsrfToken` 미들웨어는 `X-CSRF-TOKEN` 요청 헤더도 함께 확인합니다. 예를 들어 HTML의 `meta` 태그에 토큰을 저장할 수 있습니다.

```
<meta name="csrf-token" content="{{ csrf_token() }}">
```

그런 다음, jQuery와 같은 라이브러리를 이용해 모든 요청 헤더에 자동으로 토큰을 추가하도록 할 수 있습니다. 이렇게 하면 레거시 자바스크립트 기반 애플리케이션의 AJAX 요청에도 편리하게 CSRF 보호를 적용할 수 있습니다.

```
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});
```

<a name="csrf-x-xsrf-token"></a>
## X-XSRF-TOKEN

라라벨은 현재 CSRF 토큰을 암호화된 `XSRF-TOKEN` 쿠키에 저장하여, 프레임워크가 생성하는 각 응답에 자동으로 포함시킵니다. 여러분은 이 쿠키 값을 사용해서 `X-XSRF-TOKEN` 요청 헤더를 설정할 수 있습니다.

이 쿠키는 주로 개발자 편의성을 위해 제공됩니다. 예를 들어 Angular, Axios와 같은 일부 자바스크립트 프레임워크 및 라이브러리는 동일 출처(same-origin) 요청에서 이 쿠키 값을 자동으로 `X-XSRF-TOKEN` 헤더에 넣어 전송해줍니다.

> [!TIP]
> 기본적으로, `resources/js/bootstrap.js` 파일에는 Axios HTTP 라이브러리가 포함되어 있으며, 이 라이브러리는 `X-XSRF-TOKEN` 헤더를 자동으로 전송합니다.
