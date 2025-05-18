# HTTP 리디렉션 (HTTP Redirects)

- [리디렉션 생성하기](#creating-redirects)
- [이름이 지정된 라우트로 리디렉션하기](#redirecting-named-routes)
- [컨트롤러 액션으로 리디렉션하기](#redirecting-controller-actions)
- [세션 데이터 플래시와 함께 리디렉션하기](#redirecting-with-flashed-session-data)

<a name="creating-redirects"></a>
## 리디렉션 생성하기

리디렉션 응답은 `Illuminate\Http\RedirectResponse` 클래스의 인스턴스이며, 사용자를 다른 URL로 이동시키는 데 필요한 적절한 헤더를 포함합니다. `RedirectResponse` 인스턴스를 생성하는 방법에는 여러 가지가 있습니다. 가장 간단한 방법은 전역 `redirect` 헬퍼를 사용하는 것입니다.

```
Route::get('/dashboard', function () {
    return redirect('/home/dashboard');
});
```

때로는 사용자가 이전에 있던 위치로 리디렉션해야 할 때가 있습니다. 예를 들어, 제출된 폼이 유효하지 않을 때가 그렇습니다. 이때는 전역 `back` 헬퍼 함수를 사용할 수 있습니다. 이 기능은 [세션](/docs/11.x/session)을 활용하므로, `back` 함수를 호출하는 라우트가 반드시 `web` 미들웨어 그룹을 사용하거나, 모든 세션 미들웨어가 적용되어 있어야 합니다.

```
Route::post('/user/profile', function () {
    // 요청을 유효성 검사합니다...

    return back()->withInput();
});
```

<a name="redirecting-named-routes"></a>
## 이름이 지정된 라우트로 리디렉션하기

`redirect` 헬퍼를 아무 인수 없이 호출하면 `Illuminate\Routing\Redirector` 인스턴스가 반환됩니다. 이를 이용해 `Redirector` 인스턴스의 다양한 메서드를 호출할 수 있습니다. 예를 들어, 이름이 지정된 라우트로 리디렉션하는 `RedirectResponse`를 생성하려면 `route` 메서드를 사용하면 됩니다.

```
return redirect()->route('login');
```

라우트가 파라미터를 필요로 할 경우, `route` 메서드의 두 번째 인수로 파라미터를 전달할 수 있습니다.

```
// profile/{id}와 같은 URI를 가진 라우트의 경우

return redirect()->route('profile', ['id' => 1]);
```

더 편리하게, 라라벨에서는 전역 `to_route` 함수도 제공합니다.

```
return to_route('profile', ['id' => 1]);
```

<a name="populating-parameters-via-eloquent-models"></a>
#### Eloquent 모델로 파라미터 채우기

"ID" 파라미터가 포함된 라우트로 리디렉션할 때, 해당 파라미터를 Eloquent 모델을 통해 전달할 수도 있습니다. 이 경우 ID 값이 자동으로 추출되어 사용됩니다.

```
// profile/{id}와 같은 URI를 가진 라우트의 경우

return redirect()->route('profile', [$user]);
```

라우트 파라미터로 전달할 값을 직접 지정하고 싶다면, Eloquent 모델에서 `getRouteKey` 메서드를 오버라이드하면 됩니다.

```
/**
 * 모델의 라우트 키 값을 반환합니다.
 */
public function getRouteKey(): mixed
{
    return $this->slug;
}
```

<a name="redirecting-controller-actions"></a>
## 컨트롤러 액션으로 리디렉션하기

[컨트롤러 액션](/docs/11.x/controllers)으로 리디렉션하는 것도 가능합니다. 이를 위해 컨트롤러와 액션명을 `action` 메서드에 전달하면 됩니다.

```
use App\Http\Controllers\HomeController;

return redirect()->action([HomeController::class, 'index']);
```

컨트롤러 라우트에 파라미터가 필요한 경우, 두 번째 인수로 파라미터를 배열 형태로 전달하세요.

```
return redirect()->action(
    [UserController::class, 'profile'], ['id' => 1]
);
```

<a name="redirecting-with-flashed-session-data"></a>
## 세션 데이터 플래시와 함께 리디렉션하기

새로운 URL로 리디렉션을 하면서 [세션에 데이터를 플래시](/docs/11.x/session#flash-data)하는 경우가 많습니다. 보통 어떤 작업이 성공적으로 완료된 뒤, 성공 메시지를 세션에 플래시할 때 사용합니다. 이를 더 편리하게 하기 위해, 리디렉션 응답 인스턴스를 만든 뒤, 플루언트 방식으로 세션에 데이터를 플래시할 수 있습니다.

```
Route::post('/user/profile', function () {
    // 사용자의 프로필을 업데이트합니다...

    return redirect('/dashboard')->with('status', 'Profile updated!');
});
```

`RedirectResponse` 인스턴스에서 제공하는 `withInput` 메서드를 사용하면, 현재 요청의 입력 데이터를 새 위치로 리디렉션하기 전에 세션에 플래시할 수 있습니다. 입력값이 세션에 플래시된 뒤, 다음 요청에서 [간편하게 불러올 수 있습니다](/docs/11.x/requests#retrieving-old-input).

```
return back()->withInput();
```

사용자가 리디렉션된 뒤, [세션](/docs/11.x/session)에서 플래시된 메시지를 표시할 수 있습니다. 예를 들어, [Blade 문법](/docs/11.x/blade)을 활용하면 다음과 같이 구현할 수 있습니다.

```
@if (session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```