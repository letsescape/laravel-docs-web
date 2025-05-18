# HTTP 리디렉션 (HTTP Redirects)

- [리디렉션 생성하기](#creating-redirects)
- [이름이 지정된 라우트로 리디렉션하기](#redirecting-named-routes)
- [컨트롤러 액션으로 리디렉션하기](#redirecting-controller-actions)
- [세션 데이터와 함께 리디렉션하기](#redirecting-with-flashed-session-data)

<a name="creating-redirects"></a>
## 리디렉션 생성하기

리디렉션 응답은 `Illuminate\Http\RedirectResponse` 클래스의 인스턴스이며, 사용자를 다른 URL로 이동시키는 데 필요한 적절한 헤더를 포함합니다. `RedirectResponse` 인스턴스를 생성하는 방법은 여러 가지가 있지만, 가장 간단한 방법은 전역 `redirect` 헬퍼 함수를 사용하는 것입니다.

```
Route::get('/dashboard', function () {
    return redirect('/home/dashboard');
});
```

폼 제출이 유효하지 않은 경우처럼, 사용자를 이전 페이지로 되돌리고 싶을 때가 있습니다. 이때는 전역 `back` 헬퍼 함수를 사용할 수 있습니다. 이 기능은 [세션](/docs/9.x/session)을 사용하므로, `back` 함수를 호출하는 라우트가 반드시 `web` 미들웨어 그룹을 사용하거나, 모든 세션 관련 미들웨어가 적용되어 있어야 합니다.

```
Route::post('/user/profile', function () {
    // 요청 검증 수행...

    return back()->withInput();
});
```

<a name="redirecting-named-routes"></a>
## 이름이 지정된 라우트로 리디렉션하기

매개변수 없이 `redirect` 헬퍼를 호출하면 `Illuminate\Routing\Redirector` 인스턴스가 반환되며, 이를 통해 `Redirector`의 모든 메서드를 사용할 수 있습니다. 예를 들어, 이름이 지정된 라우트로 리디렉션하려면 `route` 메서드를 사용하면 됩니다.

```
return redirect()->route('login');
```

라우트에 파라미터가 필요한 경우, `route` 메서드의 두 번째 인수로 파라미터를 전달할 수 있습니다.

```
// 예시 라우트 URI: profile/{id}

return redirect()->route('profile', ['id' => 1]);
```

편의를 위해 라라벨에서는 전역 `to_route` 함수도 제공합니다.

```
return to_route('profile', ['id' => 1]);
```

<a name="populating-parameters-via-eloquent-models"></a>
#### Eloquent 모델을 통한 파라미터 값 자동 주입

만약 "ID" 파라미터를 요구하는 라우트로 이동할 때, 파라미터 값을 Eloquent 모델에서 가져오고 싶다면, 단순히 모델 인스턴스 자체를 전달하면 됩니다. 라라벨이 내부적으로 해당 모델의 ID 값을 자동으로 추출해 사용합니다.

```
// 예시 라우트 URI: profile/{id}

return redirect()->route('profile', [$user]);
```

라우트 파라미터에 들어갈 값을 커스터마이즈하고 싶다면, Eloquent 모델에서 `getRouteKey` 메서드를 오버라이드하면 됩니다.

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
## 컨트롤러 액션으로 리디렉션하기

[컨트롤러 액션](/docs/9.x/controllers)으로 리디렉션을 생성할 수도 있습니다. 이때는 `action` 메서드에 컨트롤러 클래스와 액션명을 전달하세요.

```
use App\Http\Controllers\HomeController;

return redirect()->action([HomeController::class, 'index']);
```

컨트롤러 라우트에 파라미터가 필요한 경우, 파라미터를 두 번째 인수로 전달할 수 있습니다.

```
return redirect()->action(
    [UserController::class, 'profile'], ['id' => 1]
);
```

<a name="redirecting-with-flashed-session-data"></a>
## 세션 데이터와 함께 리디렉션하기

리디렉션하면서 [세션에 데이터를 플래시](/docs/9.x/session#flash-data)하는 작업은 보통 한 번에 처리됩니다. 예를 들어, 어떤 동작이 성공적으로 수행된 후 성공 메시지를 세션에 저장하고 리디렉션하는 경우가 일반적입니다. 보다 편리하게, `RedirectResponse` 인스턴스를 생성한 후 플루언트 방식으로 메서드 체이닝을 통해 세션에 데이터를 플래시할 수 있습니다.

```
Route::post('/user/profile', function () {
    // 사용자 프로필 업데이트...

    return redirect('/dashboard')->with('status', 'Profile updated!');
});
```

현재 요청의 입력값을 세션에 플래시하여, 사용자가 새로운 위치로 리디렉션되기 전에 `RedirectResponse` 인스턴스의 `withInput` 메서드를 사용할 수도 있습니다. 이 방식으로 입력값이 세션에 플래시되면, 다음 요청에서 쉽게 [해당 값을 조회](/docs/9.x/requests#retrieving-old-input)할 수 있습니다.

```
return back()->withInput();
```

사용자가 리디렉션된 후, [세션](/docs/9.x/session)에 저장된 플래시 메시지를 화면에 출력할 수 있습니다. 예를 들어, [Blade 문법](/docs/9.x/blade)을 사용하는 방법은 다음과 같습니다.

```
@if (session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```