# HTTP 리디렉션 (HTTP Redirects)

- [리디렉션 생성하기](#creating-redirects)
- [네임드 라우트로 리디렉션](#redirecting-named-routes)
- [컨트롤러 액션으로 리디렉션](#redirecting-controller-actions)
- [세션 플래시 데이터와 함께 리디렉션](#redirecting-with-flashed-session-data)

<a name="creating-redirects"></a>
## 리디렉션 생성하기

리디렉션 응답은 `Illuminate\Http\RedirectResponse` 클래스의 인스턴스이며, 사용자를 다른 URL로 이동시키는 데 필요한 적절한 헤더를 포함합니다. `RedirectResponse` 인스턴스를 생성하는 방법은 여러 가지가 있습니다. 가장 간단한 방법은 글로벌 헬퍼 함수인 `redirect`를 사용하는 것입니다.

```
Route::get('/dashboard', function () {
    return redirect('/home/dashboard');
});
```

양식(form) 제출이 유효하지 않은 경우처럼, 사용자를 이전 위치로 리디렉션하고 싶은 상황이 있을 수 있습니다. 이럴 때는 글로벌 헬퍼 함수인 `back`을 사용할 수 있습니다. 이 기능은 [세션](/docs/8.x/session)을 사용하므로, `back` 함수를 호출하는 라우트가 반드시 `web` 미들웨어 그룹을 사용하거나 모든 세션 관련 미들웨어가 적용되어 있어야 합니다.

```
Route::post('/user/profile', function () {
    // 요청을 유효성 검사...

    return back()->withInput();
});
```

<a name="redirecting-named-routes"></a>
## 네임드 라우트로 리디렉션

`redirect` 헬퍼를 아무 인자 없이 호출하면, `Illuminate\Routing\Redirector`의 인스턴스가 반환됩니다. 이를 통해 `Redirector` 인스턴스의 다양한 메서드를 호출할 수 있습니다. 예를 들어, 네임드 라우트로 리디렉션 응답을 생성하려면 `route` 메서드를 사용하면 됩니다.

```
return redirect()->route('login');
```

사용하는 라우트에 파라미터가 필요한 경우, `route` 메서드의 두 번째 인자로 파라미터 배열을 전달하면 됩니다.

```
// 아래 URI를 가진 라우트인 경우: profile/{id}

return redirect()->route('profile', ['id' => 1]);
```

<a name="populating-parameters-via-eloquent-models"></a>
#### Eloquent 모델로 파라미터 값 채우기

"ID" 파라미터가 필요한 라우트로 리디렉션할 때, Eloquent 모델 인스턴스를 직접 전달할 수 있습니다. 이 경우 모델의 ID가 자동으로 추출되어 라우트 파라미터로 사용됩니다.

```
// 아래 URI를 가진 라우트인 경우: profile/{id}

return redirect()->route('profile', [$user]);
```

라우트 파라미터에 들어가는 값을 직접 지정하고 싶다면, Eloquent 모델에서 `getRouteKey` 메서드를 오버라이드하면 됩니다.

```
/**
 * 모델의 라우트 키 값을 반환합니다.
 *
 * @return mixed
 */
public function getRouteKey()
{
    return $this->slug;
}
```

<a name="redirecting-controller-actions"></a>
## 컨트롤러 액션으로 리디렉션

[컨트롤러 액션](/docs/8.x/controllers)으로도 리디렉션을 생성할 수 있습니다. 이 경우, 컨트롤러와 액션 이름을 `action` 메서드에 전달하면 됩니다.

```
use App\Http\Controllers\HomeController;

return redirect()->action([HomeController::class, 'index']);
```

만약 컨트롤러 라우트에 파라미터가 필요하다면, 두 번째 인자로 파라미터 배열을 전달하면 됩니다.

```
return redirect()->action(
    [UserController::class, 'profile'], ['id' => 1]
);
```

<a name="redirecting-with-flashed-session-data"></a>
## 세션 플래시 데이터와 함께 리디렉션

새로운 URL로 리디렉션할 때 [세션에 데이터를 플래시](/docs/8.x/session#flash-data)하는 경우가 많습니다. 일반적으로 어떤 작업을 수행한 뒤 성공 메시지를 세션에 플래시해서 리디렉션할 때 주로 사용됩니다. 편리하게도, 한 번의 메서드 체이닝으로 `RedirectResponse` 인스턴스를 생성하고 세션에 데이터를 플래시할 수 있습니다.

```
Route::post('/user/profile', function () {
    // 사용자의 프로필을 업데이트...

    return redirect('/dashboard')->with('status', 'Profile updated!');
});
```

`RedirectResponse` 인스턴스에서 제공하는 `withInput` 메서드를 사용하면, 현재 요청의 입력 데이터를 세션에 플래시(임시 저장)한 후 새로운 위치로 리디렉션할 수 있습니다. 이렇게 입력값을 세션에 플래시하면, 다음 요청에서 [다시 쉽게 꺼내서 사용할 수](/docs/8.x/requests#retrieving-old-input) 있습니다.

```
return back()->withInput();
```

사용자가 리디렉션된 후, [세션](/docs/8.x/session)에 저장된 플래시 메시지를 표시할 수 있습니다. 예를 들어, [Blade 문법](/docs/8.x/blade)을 사용하면 다음과 같이 구현할 수 있습니다.

```
@if (session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```
