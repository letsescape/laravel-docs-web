# HTTP 리다이렉트 (HTTP Redirects)

- [리다이렉트 생성하기](#creating-redirects)
- [이름이 지정된 라우트로 리다이렉트](#redirecting-named-routes)
- [컨트롤러 액션으로 리다이렉트](#redirecting-controller-actions)
- [세션 데이터 플래시와 함께 리다이렉트](#redirecting-with-flashed-session-data)

<a name="creating-redirects"></a>
## 리다이렉트 생성하기

리다이렉트 응답은 `Illuminate\Http\RedirectResponse` 클래스의 인스턴스이며, 사용자를 다른 URL로 리다이렉트하는 데 필요한 올바른 헤더를 포함합니다. `RedirectResponse` 인스턴스를 생성하는 방법은 여러 가지가 있습니다. 가장 간단한 방법은 전역 `redirect` 헬퍼를 사용하는 것입니다.

```php
Route::get('/dashboard', function () {
    return redirect('/home/dashboard');
});
```

때때로 폼 제출이 유효하지 않을 때처럼, 사용자를 이전 위치로 리다이렉트하고 싶을 때가 있습니다. 이럴 때는 전역 `back` 헬퍼 함수를 사용할 수 있습니다. 이 기능은 [세션](/docs/session)을 활용하므로, `back` 함수를 호출하는 라우트는 반드시 `web` 미들웨어 그룹을 사용하거나 모든 세션 관련 미들웨어가 적용되어 있어야 합니다.

```php
Route::post('/user/profile', function () {
    // 요청을 유효성 검사합니다...

    return back()->withInput();
});
```

<a name="redirecting-named-routes"></a>
## 이름이 지정된 라우트로 리다이렉트

`redirect` 헬퍼를 파라미터 없이 호출하면, `Illuminate\Routing\Redirector` 인스턴스가 반환되어 해당 인스턴스의 다양한 메서드를 사용할 수 있습니다. 예를 들어, 이름이 지정된 라우트로 `RedirectResponse`를 생성하려면 `route` 메서드를 사용하면 됩니다.

```php
return redirect()->route('login');
```

만약 라우트에 파라미터가 필요하다면, `route` 메서드의 두 번째 인수로 파라미터를 전달할 수 있습니다.

```php
// 다음과 같은 URI를 가진 라우트: profile/{id}

return redirect()->route('profile', ['id' => 1]);
```

보다 간편하게, 라라벨에서는 전역 함수인 `to_route`도 제공합니다.

```php
return to_route('profile', ['id' => 1]);
```

<a name="populating-parameters-via-eloquent-models"></a>
#### Eloquent 모델로 파라미터 채우기

"ID" 파라미터를 사용하는 라우트로 리다이렉트할 때, Eloquent 모델 인스턴스를 직접 전달하면 ID를 자동으로 추출해서 파라미터로 사용해 줍니다.

```php
// 다음과 같은 URI를 가진 라우트: profile/{id}

return redirect()->route('profile', [$user]);
```

라우트 파라미터에 들어갈 값을 직접 제어하고 싶다면, Eloquent 모델에서 `getRouteKey` 메서드를 오버라이드하면 됩니다.

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
## 컨트롤러 액션으로 리다이렉트

[컨트롤러 액션](/docs/controllers)으로 리다이렉트할 수도 있습니다. 이 경우, 컨트롤러 클래스와 액션 이름을 `action` 메서드에 전달합니다.

```php
use App\Http\Controllers\HomeController;

return redirect()->action([HomeController::class, 'index']);
```

컨트롤러 라우트에 파라미터가 필요한 경우, 두 번째 인수로 파라미터를 배열 형태로 전달하면 됩니다.

```php
return redirect()->action(
    [UserController::class, 'profile'], ['id' => 1]
);
```

<a name="redirecting-with-flashed-session-data"></a>
## 세션 데이터 플래시와 함께 리다이렉트

새로운 URL로 리다이렉트하면서 [세션에 데이터를 플래시](/docs/session#flash-data)하는 작업은 보통 동시에 수행됩니다. 일반적으로 어떤 작업을 성공적으로 마친 후 세션에 성공 메시지를 플래시할 때 사용합니다. 편리하게도, `RedirectResponse` 인스턴스를 생성하면서 메서드 체이닝을 통해 세션에 데이터를 플래시할 수 있습니다.

```php
Route::post('/user/profile', function () {
    // 사용자의 프로필을 업데이트합니다...

    return redirect('/dashboard')->with('status', 'Profile updated!');
});
```

`RedirectResponse` 인스턴스에서 제공하는 `withInput` 메서드를 사용하면, 현재 요청의 입력 데이터를 세션에 플래시한 뒤 새 위치로 리다이렉트할 수 있습니다. 입력값이 세션에 저장된 후, 다음 요청에서 [쉽게 불러올 수 있습니다](/docs/requests#retrieving-old-input).

```php
return back()->withInput();
```

사용자가 리다이렉트된 후에는 [세션](/docs/session)에 플래시된 메시지를 표시할 수 있습니다. 예를 들어, [Blade 문법](/docs/blade)를 활용하면 다음과 같이 작성할 수 있습니다.

```blade
@if (session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```