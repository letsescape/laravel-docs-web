# HTTP 리다이렉트 (HTTP Redirects)

- [리다이렉트 생성하기](#creating-redirects)
- [네임드 라우트로 리다이렉트하기](#redirecting-named-routes)
- [컨트롤러 액션으로 리다이렉트하기](#redirecting-controller-actions)
- [세션 데이터와 함께 리다이렉트하기](#redirecting-with-flashed-session-data)

<a name="creating-redirects"></a>
## 리다이렉트 생성하기

리다이렉트 응답은 `Illuminate\Http\RedirectResponse` 클래스의 인스턴스이며, 사용자를 다른 URL로 이동시키는 데 필요한 올바른 헤더를 포함하고 있습니다. `RedirectResponse` 인스턴스를 생성하는 방법에는 여러 가지가 있습니다. 가장 간단한 방법은 전역 `redirect` 헬퍼를 사용하는 것입니다.

```
Route::get('/dashboard', function () {
    return redirect('/home/dashboard');
});
```

폼 제출이 잘못되어 사용자를 이전 위치로 되돌리고 싶을 때도 있습니다. 이럴 때는 전역 `back` 헬퍼 함수를 사용할 수 있습니다. 이 기능은 [세션](/docs/10.x/session)을 활용하므로, `back` 함수를 호출하는 라우트가 반드시 `web` 미들웨어 그룹을 사용하거나 모든 세션 미들웨어가 적용되어 있어야 합니다.

```
Route::post('/user/profile', function () {
    // 요청을 검증합니다...

    return back()->withInput();
});
```

<a name="redirecting-named-routes"></a>
## 네임드 라우트로 리다이렉트하기

`redirect` 헬퍼를 파라미터 없이 호출하면 `Illuminate\Routing\Redirector` 인스턴스가 반환되어, 이 인스턴스의 다양한 메서드를 사용할 수 있습니다. 예를 들어, 네임드 라우트로 리다이렉트 응답을 만들고 싶다면 `route` 메서드를 사용하면 됩니다.

```
return redirect()->route('login');
```

라우트에 파라미터가 필요한 경우, 두 번째 인수로 파라미터를 배열 형태로 전달할 수 있습니다.

```
// 다음과 같은 URI를 가진 라우트: profile/{id}

return redirect()->route('profile', ['id' => 1]);
```

좀 더 편리하게 사용할 수 있도록, 라라벨에서는 전역 `to_route` 함수도 제공합니다.

```
return to_route('profile', ['id' => 1]);
```

<a name="populating-parameters-via-eloquent-models"></a>
#### Eloquent 모델을 통한 파라미터 자동 설정

만약 "ID" 파라미터가 필요한 라우트로 리다이렉트할 때, Eloquent 모델에서 해당 값을 가져오고 싶다면 모델 자체를 바로 전달할 수 있습니다. 그러면 모델의 ID가 자동으로 추출되어 사용됩니다.

```
// 다음과 같은 URI를 가진 라우트: profile/{id}

return redirect()->route('profile', [$user]);
```

라우트 파라미터로 전달되는 값을 직접 지정하고 싶을 때는, Eloquent 모델에서 `getRouteKey` 메서드를 오버라이드하면 됩니다.

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
## 컨트롤러 액션으로 리다이렉트하기

[컨트롤러 액션](/docs/10.x/controllers)으로 리다이렉트 응답을 생성할 수도 있습니다. 이를 위해, 컨트롤러와 액션명을 `action` 메서드에 전달하세요.

```
use App\Http\Controllers\HomeController;

return redirect()->action([HomeController::class, 'index']);
```

만약 컨트롤러 라우트에 파라미터가 필요하다면, 두 번째 인수로 배열 형태의 파라미터를 넘겨주면 됩니다.

```
return redirect()->action(
    [UserController::class, 'profile'], ['id' => 1]
);
```

<a name="redirecting-with-flashed-session-data"></a>
## 세션 데이터와 함께 리다이렉트하기

새로운 URL로 리다이렉트하면서 동시에 [세션에 데이터를 플래시](/docs/10.x/session#flash-data)하는 경우가 많습니다. 보통 어떤 작업에 성공했을 때, 성공 메시지를 세션에 플래시하고 리다이렉트하곤 합니다. 라라벨에서는 이를 쉽게 할 수 있도록, 하나의 메서드 체인으로 `RedirectResponse` 인스턴스를 생성하고 데이터를 세션에 플래시할 수 있습니다.

```
Route::post('/user/profile', function () {
    // 사용자의 프로필을 업데이트합니다...

    return redirect('/dashboard')->with('status', 'Profile updated!');
});
```

`RedirectResponse` 인스턴스의 `withInput` 메서드를 사용하면, 현재 요청의 입력값을 세션에 플래시한 뒤 사용자를 새로운 위치로 리다이렉트할 수 있습니다. 이렇게 입력값이 세션에 플래시되면, 다음 요청 시 [손쉽게 값을 가져올 수 있습니다](/docs/10.x/requests#retrieving-old-input).

```
return back()->withInput();
```

사용자가 리다이렉트된 이후에는, [세션](/docs/10.x/session)에서 플래시된 메시지를 출력할 수 있습니다. 예를 들어, [Blade 문법](/docs/10.x/blade)을 사용하여 아래와 같이 표시할 수 있습니다.

```
@if (session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```