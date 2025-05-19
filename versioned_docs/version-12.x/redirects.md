# HTTP 리다이렉트 (HTTP Redirects)

- [리다이렉트 생성하기](#creating-redirects)
- [이름이 지정된 라우트로 리다이렉트하기](#redirecting-named-routes)
- [컨트롤러 액션으로 리다이렉트하기](#redirecting-controller-actions)
- [세션에 데이터를 플래시하고 리다이렉트하기](#redirecting-with-flashed-session-data)

<a name="creating-redirects"></a>
## 리다이렉트 생성하기

리다이렉트 응답은 `Illuminate\Http\RedirectResponse` 클래스의 인스턴스로, 사용자를 다른 URL로 이동시키는 데 필요한 적절한 헤더 정보를 포함합니다. `RedirectResponse` 인스턴스를 생성하는 방법에는 여러 가지가 있습니다. 가장 간단한 방법은 전역 `redirect` 헬퍼를 사용하는 것입니다.

```php
Route::get('/dashboard', function () {
    return redirect('/home/dashboard');
});
```

폼 입력값이 유효하지 않은 경우 등 사용자를 이전 페이지로 다시 보내고 싶을 때가 있습니다. 이럴 때는 전역 `back` 헬퍼 함수를 사용할 수 있습니다. 이 기능은 [세션](/docs/12.x/session)을 활용하므로, `back` 함수를 호출하는 라우트에는 반드시 `web` 미들웨어 그룹이 적용되어 있거나 세션 관련 미들웨어가 모두 포함되어야 합니다.

```php
Route::post('/user/profile', function () {
    // 요청값 유효성 검사...

    return back()->withInput();
});
```

<a name="redirecting-named-routes"></a>
## 이름이 지정된 라우트로 리다이렉트하기

`redirect` 헬퍼를 인수 없이 호출하면 `Illuminate\Routing\Redirector` 인스턴스가 반환되어, 이 인스턴스의 다양한 메서드를 사용할 수 있습니다. 예를 들어, 이름이 지정된 라우트로 리다이렉트하는 `RedirectResponse`를 만들려면 `route` 메서드를 사용하면 됩니다.

```php
return redirect()->route('login');
```

만약 해당 라우트가 파라미터를 필요로 한다면, `route` 메서드의 두 번째 인수로 파라미터를 전달할 수 있습니다.

```php
// 다음과 같은 URI를 가진 라우트: profile/{id}

return redirect()->route('profile', ['id' => 1]);
```

더 편리하게 사용할 수 있도록, Laravel은 전역 `to_route` 함수도 제공합니다.

```php
return to_route('profile', ['id' => 1]);
```

<a name="populating-parameters-via-eloquent-models"></a>
#### Eloquent 모델을 이용한 파라미터 자동 채우기

"ID" 파라미터가 필요한 라우트로 리다이렉트할 때 해당 값을 Eloquent 모델에서 바로 가져오고 싶다면, 모델 인스턴스 자체를 전달하면 됩니다. 그러면 ID 값이 자동으로 추출되어 사용됩니다.

```php
// 다음과 같은 URI를 가진 라우트: profile/{id}

return redirect()->route('profile', [$user]);
```

라우트 파라미터에 들어갈 값을 원하는 방식으로 커스터마이즈하고 싶다면, Eloquent 모델에서 `getRouteKey` 메서드를 오버라이드하면 됩니다.

```php
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

[컨트롤러 액션](/docs/12.x/controllers)으로 바로 리다이렉트할 수도 있습니다. 이 경우, 컨트롤러 클래스와 액션 이름을 `action` 메서드에 전달하세요.

```php
use App\Http\Controllers\HomeController;

return redirect()->action([HomeController::class, 'index']);
```

컨트롤러 라우트에 파라미터가 필요하다면, `action` 메서드의 두 번째 인수로 전달할 수 있습니다.

```php
return redirect()->action(
    [UserController::class, 'profile'], ['id' => 1]
);
```

<a name="redirecting-with-flashed-session-data"></a>
## 세션에 데이터를 플래시하고 리다이렉트하기

일반적으로 새로운 URL로 리다이렉트하는 동시에 [세션에 데이터를 플래시](/docs/12.x/session#flash-data)하는 경우가 많습니다. 예를 들어, 어떤 처리가 성공했을 때 세션에 성공 메시지를 담는 경우입니다. 편리하게, `RedirectResponse` 인스턴스를 메서드 체이닝 방식으로 생성하며 동시에 세션에 데이터를 플래시할 수 있습니다.

```php
Route::post('/user/profile', function () {
    // 사용자의 프로필을 업데이트...

    return redirect('/dashboard')->with('status', 'Profile updated!');
});
```

현재 요청의 입력값을 새로운 위치로 리다이렉트하기 전에 세션에 플래시하려면, `RedirectResponse` 인스턴스가 제공하는 `withInput` 메서드를 사용할 수 있습니다. 이렇게 플래시된 입력값은 다음 요청에서 [쉽게 불러올 수 있습니다](/docs/12.x/requests#retrieving-old-input).

```php
return back()->withInput();
```

사용자가 리다이렉트된 후에는 [세션](/docs/12.x/session)에 플래시된 메시지를 화면에 표시할 수 있습니다. 예를 들어, [Blade 문법](/docs/12.x/blade)을 사용하면 다음과 같이 작성할 수 있습니다.

```blade
@if (session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```