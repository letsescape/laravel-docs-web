# 뷰 (Views)

- [소개](#introduction)
    - [React / Vue에서 뷰 작성하기](#writing-views-in-react-or-vue)
- [뷰 생성 및 렌더링](#creating-and-rendering-views)
    - [중첩 뷰 디렉터리](#nested-view-directories)
    - [처음으로 존재하는 뷰 생성하기](#creating-the-first-available-view)
    - [뷰 존재 여부 확인하기](#determining-if-a-view-exists)
- [뷰에 데이터 전달하기](#passing-data-to-views)
    - [모든 뷰에 데이터 공유하기](#sharing-data-with-all-views)
- [뷰 컴포저](#view-composers)
    - [뷰 크리에이터](#view-creators)
- [뷰 최적화](#optimizing-views)

<a name="introduction"></a>
## 소개

라우트와 컨트롤러에서 전체 HTML 문서 문자열을 직접 반환하는 것은 현실적으로 비효율적입니다. 다행히도, 뷰를 사용하면 모든 HTML을 별도의 파일에 담아 관리할 수 있어 훨씬 편리합니다.

뷰는 컨트롤러 및 애플리케이션 로직과 화면에 보여지는 프레젠테이션 로직을 분리해줍니다. 뷰 파일은 `resources/views` 디렉터리 안에 저장하며, 라라벨을 사용할 때 뷰 템플릿은 주로 [Blade 템플릿 언어](/docs/9.x/blade)로 작성합니다. 예를 들어, 간단한 뷰는 다음과 같습니다.

```blade
<!-- View stored in resources/views/greeting.blade.php -->

<html>
    <body>
        <h1>Hello, {{ $name }}</h1>
    </body>
</html>
```

이 뷰가 `resources/views/greeting.blade.php`에 저장되어 있으므로, 전역 `view` 헬퍼를 사용해 아래와 같이 반환할 수 있습니다.

```
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

> [!NOTE]
> Blade 템플릿 작성법에 대한 자세한 내용이 궁금하다면, 전체 [Blade 문서](/docs/9.x/blade)를 참고해 시작해 보세요.

<a name="writing-views-in-react-or-vue"></a>
### React / Vue에서 뷰 작성하기

많은 개발자들이 이제 Blade를 통한 PHP 기반 템플릿 대신, 프론트엔드 템플릿을 React나 Vue로 작성하는 것을 선호하기 시작했습니다. 라라벨은 [Inertia](https://inertiajs.com/)라는 라이브러리를 통해, React 또는 Vue 프론트엔드와 라라벨 백엔드를 전통적인 SPA(싱글 페이지 애플리케이션) 개발의 복잡함 없이 쉽게 연결할 수 있도록 지원합니다.

Breeze 및 Jetstream [스타터 키트](/docs/9.x/starter-kits)는 Inertia를 기반으로 한 신규 라라벨 애플리케이션의 훌륭한 출발점을 제공합니다. 또한, [Laravel Bootcamp](https://bootcamp.laravel.com)에서는 Inertia 기반 라라벨 애플리케이션 구축 과정을 Vue와 React 예제 포함하여 자세히 안내하고 있습니다.

<a name="creating-and-rendering-views"></a>
## 뷰 생성 및 렌더링

뷰는 애플리케이션의 `resources/views` 디렉터리에 `.blade.php` 확장자를 가진 파일을 만들어 생성할 수 있습니다. `.blade.php` 확장자는 해당 파일이 [Blade 템플릿](/docs/9.x/blade)임을 프레임워크에 알립니다. Blade 템플릿은 HTML과 Blade 지시문을 함께 활용해 값을 바로 출력하거나 if 문 작성, 반복문 처리 등 다양한 동작을 쉽게 구현할 수 있습니다.

뷰를 만들고 나면, 애플리케이션의 라우트나 컨트롤러에서 전역 `view` 헬퍼로 아래와 같이 렌더링할 수 있습니다.

```
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

또는, `View` 파사드를 사용해 뷰를 반환할 수도 있습니다.

```
use Illuminate\Support\Facades\View;

return View::make('greeting', ['name' => 'James']);
```

여기서 첫 번째 인자는 `resources/views` 디렉터리 내 뷰 파일의 이름에 해당하며, 두 번째 인자는 뷰에 전달할 데이터의 배열입니다. 이 예제에서는 `name` 변수를 전달하고, 뷰 안에서는 [Blade 문법](/docs/9.x/blade)으로 해당 변수를 출력합니다.

<a name="nested-view-directories"></a>
### 중첩 뷰 디렉터리

뷰 파일은 `resources/views` 디렉터리 내에서 서브디렉터리로 중첩해 저장할 수도 있습니다. 이때 뷰 이름을 참조할 때 "닷(dot) 표기법"을 사용할 수 있습니다. 예를 들어 `resources/views/admin/profile.blade.php`에 뷰 파일을 저장했다면, 라우트나 컨트롤러에서 다음과 같이 반환할 수 있습니다.

```
return view('admin.profile', $data);
```

> [!WARNING]
> 뷰 디렉터리 이름에는 `.`(닷) 문자를 사용해서는 안 됩니다.

<a name="creating-the-first-available-view"></a>
### 처음으로 존재하는 뷰 생성하기

`View` 파사드의 `first` 메서드를 사용하면, 여러 뷰 배열 중에서 먼저 존재하는 뷰를 반환할 수 있습니다. 이 기능은 애플리케이션이나 패키지에서 뷰를 커스터마이즈하거나 오버라이드할 수 있도록 지원할 때 유용합니다.

```
use Illuminate\Support\Facades\View;

return View::first(['custom.admin', 'admin'], $data);
```

<a name="determining-if-a-view-exists"></a>
### 뷰 존재 여부 확인하기

특정 뷰가 존재하는지 확인해야 할 경우, `View` 파사드의 `exists` 메서드를 이용할 수 있습니다. 뷰가 존재하면 `true`를 반환합니다.

```
use Illuminate\Support\Facades\View;

if (View::exists('emails.customer')) {
    //
}
```

<a name="passing-data-to-views"></a>
## 뷰에 데이터 전달하기

앞선 예제에서 보았듯이, 뷰에 데이터를 전달해 뷰 내에서 해당 데이터를 사용할 수 있습니다.

```
return view('greetings', ['name' => 'Victoria']);
```

이처럼 데이터를 전달할 때는 키와 값 쌍으로 이루어진 배열을 사용해야 합니다. 뷰에 데이터를 전달한 뒤에는, 뷰 파일 내에서 각 키에 해당하는 값을 변수로 접근할 수 있습니다. (예: `<?php echo $name; ?>`)

뷰 헬퍼에 전체 데이터 배열을 넘기는 대신, `with` 메서드를 사용하여 개별 데이터를 추가할 수도 있습니다. `with` 메서드는 뷰 객체의 인스턴스를 반환하므로, 여러 개의 `with`를 체이닝하여 사용할 수도 있습니다.

```
return view('greeting')
            ->with('name', 'Victoria')
            ->with('occupation', 'Astronaut');
```

<a name="sharing-data-with-all-views"></a>
### 모든 뷰에 데이터 공유하기

때때로 애플리케이션에서 렌더링되는 모든 뷰에 공통 데이터를 공유해야 할 경우가 있습니다. 이런 경우에는 `View` 파사드의 `share` 메서드를 사용할 수 있습니다. 보통 서비스 프로바이더의 `boot` 메서드 안에서 호출하며, `App\Providers\AppServiceProvider` 클래스에 추가하거나, 별도의 서비스 프로바이더를 생성해 그 안에 둘 수도 있습니다.

```
<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        View::share('key', 'value');
    }
}
```

<a name="view-composers"></a>
## 뷰 컴포저

뷰 컴포저(View Composer)는 뷰가 렌더링될 때마다 호출되는 콜백 함수 혹은 클래스 메서드입니다. 특정 뷰가 렌더링될 때마다 항상 특정 데이터를 바인딩하고 싶다면, 뷰 컴포저를 활용해 관련 로직을 한 곳에 정리할 수 있습니다. 특히 동일한 뷰가 여러 라우트나 컨트롤러에서 반환되고, 매번 동일한 데이터가 필요할 때 유용하게 사용할 수 있습니다.

일반적으로 뷰 컴포저 등록은 애플리케이션의 [서비스 프로바이더](/docs/9.x/providers) 중 하나에서 진행합니다. 여기서는 해당 로직만 따로 담을 새로운 `App\Providers\ViewServiceProvider`를 만든다고 가정하겠습니다.

뷰 컴포저를 등록하려면 `View` 파사드의 `composer` 메서드를 사용합니다. 라라벨에서는 클래스 기반 뷰 컴포저를 위한 기본 디렉터리를 제공하지 않으므로, 예를 들어 `app/View/Composers` 디렉터리를 생성해 관련 클래스들을 모아둘 수 있습니다.

```
<?php

namespace App\Providers;

use App\View\Composers\ProfileComposer;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class ViewServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // 클래스 기반 컴포저 등록...
        View::composer('profile', ProfileComposer::class);

        // 클로저 기반 컴포저 등록...
        View::composer('dashboard', function ($view) {
            //
        });
    }
}
```

> [!WARNING]
> 뷰 컴포저 등록을 위한 새로운 서비스 프로바이더를 생성한 경우, 반드시 `config/app.php` 설정 파일의 `providers` 배열에 해당 프로바이더를 추가해야 합니다.

이렇게 컴포저를 등록했다면, 이제부터 `profile` 뷰가 렌더링될 때마다 `App\View\Composers\ProfileComposer` 클래스의 `compose` 메서드가 실행됩니다. 아래는 해당 컴포저 클래스의 예시입니다.

```
<?php

namespace App\View\Composers;

use App\Repositories\UserRepository;
use Illuminate\View\View;

class ProfileComposer
{
    /**
     * The user repository implementation.
     *
     * @var \App\Repositories\UserRepository
     */
    protected $users;

    /**
     * Create a new profile composer.
     *
     * @param  \App\Repositories\UserRepository  $users
     * @return void
     */
    public function __construct(UserRepository $users)
    {
        $this->users = $users;
    }

    /**
     * Bind data to the view.
     *
     * @param  \Illuminate\View\View  $view
     * @return void
     */
    public function compose(View $view)
    {
        $view->with('count', $this->users->count());
    }
}
```

이처럼 모든 뷰 컴포저는 [서비스 컨테이너](/docs/9.x/container)를 통해 의존성이 해결되므로, 컴포저의 생성자에서 필요한 의존성을 타입힌트로 선언할 수 있습니다.

<a name="attaching-a-composer-to-multiple-views"></a>
#### 컴포저를 여러 뷰에 동시에 연결하기

하나의 뷰 컴포저를 여러 뷰에 한꺼번에 연결하고 싶다면, `composer` 메서드의 첫 번째 인자에 뷰 이름 배열을 넘기면 됩니다.

```
use App\Views\Composers\MultiComposer;

View::composer(
    ['profile', 'dashboard'],
    MultiComposer::class
);
```

또한, `composer` 메서드는 `*` 문자를 와일드카드로 받아, 모든 뷰에 컴포저를 적용할 수도 있습니다.

```
View::composer('*', function ($view) {
    //
});
```

<a name="view-creators"></a>
### 뷰 크리에이터

뷰 "크리에이터(creator)"는 뷰 컴포저와 매우 비슷하지만, 뷰가 렌더링되기 직전이 아니라 인스턴스화된 직후에 실행된다는 차이가 있습니다. 뷰 크리에이터를 등록하려면 `creator` 메서드를 사용합니다.

```
use App\View\Creators\ProfileCreator;
use Illuminate\Support\Facades\View;

View::creator('profile', ProfileCreator::class);
```

<a name="optimizing-views"></a>
## 뷰 최적화

기본적으로 Blade 템플릿 뷰는 필요할 때마다 즉시 컴파일됩니다. 뷰를 렌더링하는 요청이 들어오면, 라라벨은 해당 뷰의 컴파일 파일이 존재하는지 확인합니다. 만약 파일이 있다면, Blade 원본 파일이 컴파일 파일보다 더 최근에 수정되었는지도 체크합니다. 컴파일된 파일이 없거나, 원본 뷰 파일이 이후에 수정되었다면, 라라벨은 뷰를 다시 컴파일합니다.

뷰가 요청 시마다 컴파일되면 성능에 약간 영향을 줄 수 있으므로, 라라벨은 `view:cache` Artisan 명령어를 통해 애플리케이션에서 사용되는 모든 뷰를 미리 컴파일할 수 있도록 지원합니다. 더 빠른 퍼포먼스를 위해, 이 명령어를 배포(deploy) 과정의 일부로 실행하는 것을 권장합니다.

```shell
php artisan view:cache
```

뷰 캐시를 지우고 싶다면, `view:clear` 명령어를 사용할 수 있습니다.

```shell
php artisan view:clear
```
