# 뷰 (Views)

- [소개](#introduction)
    - [React / Vue로 뷰 작성하기](#writing-views-in-react-or-vue)
- [뷰 생성 및 렌더링](#creating-and-rendering-views)
    - [중첩 뷰 디렉터리](#nested-view-directories)
    - [첫 번째 사용 가능한 뷰 생성하기](#creating-the-first-available-view)
    - [뷰 존재 여부 확인하기](#determining-if-a-view-exists)
- [뷰에 데이터 전달하기](#passing-data-to-views)
    - [모든 뷰에 데이터 공유하기](#sharing-data-with-all-views)
- [뷰 컴포저](#view-composers)
    - [뷰 크리에이터](#view-creators)
- [뷰 최적화](#optimizing-views)

<a name="introduction"></a>
## 소개

라우트나 컨트롤러에서 완전한 HTML 문서 문자열을 직접 반환하는 것은 현실적으로 효율적이지 않습니다. 다행히도 뷰(View)를 사용하면 모든 HTML을 별도의 파일에 손쉽게 분리하여 관리할 수 있습니다.

뷰는 컨트롤러 또는 애플리케이션의 로직과 화면 표시(프레젠테이션) 로직을 분리해주며, `resources/views` 디렉터리에 저장됩니다. 라라벨에서는 뷰 템플릿을 주로 [Blade 템플릿 언어](/docs/11.x/blade)로 작성합니다. 간단한 뷰의 예시는 다음과 같습니다.

```blade
<!-- View stored in resources/views/greeting.blade.php -->

<html>
    <body>
        <h1>Hello, {{ $name }}</h1>
    </body>
</html>
```

이 뷰가 `resources/views/greeting.blade.php`에 저장되어 있다면, 글로벌 `view` 헬퍼를 사용하여 다음과 같이 반환할 수 있습니다.

```
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

> [!NOTE]  
> Blade 템플릿 작성에 대한 더 자세한 정보가 궁금하다면 [Blade 문서](/docs/11.x/blade)에서 시작해 보세요.

<a name="writing-views-in-react-or-vue"></a>
### React / Vue로 뷰 작성하기

많은 개발자들은 Blade를 사용한 PHP 기반 프론트엔드 템플릿 대신, React나 Vue를 활용해 템플릿을 작성하는 방식을 선호하기 시작했습니다. 라라벨에서는 [Inertia](https://inertiajs.com/) 라이브러리를 통해 이러한 방식의 프론트엔드-백엔드 연동이 매우 간편하게 이루어집니다. Inertia는 일반적으로 SPA(싱글 페이지 애플리케이션)를 구축할 때 발생하는 복잡함 없이, React/Vue 프론트엔드를 라라벨 백엔드와 쉽게 연결해줍니다.

브리즈(Breeze)와 제트스트림(Jetstream) [스타터 키트](/docs/11.x/starter-kits)는 Inertia 기반의 새로운 라라벨 애플리케이션을 시작할 때 훌륭한 출발점을 제공합니다. 또한, [라라벨 부트캠프](https://bootcamp.laravel.com)에서는 Vue와 React 예제를 포함해 Inertia 기반 라라벨 애플리케이션을 구축하는 과정을 전체적으로 안내합니다.

<a name="creating-and-rendering-views"></a>
## 뷰 생성 및 렌더링

애플리케이션의 `resources/views` 디렉터리에 `.blade.php` 확장자를 가진 파일을 직접 생성하거나, `make:view` 아티즌 명령어를 사용해 뷰를 만들 수 있습니다.

```shell
php artisan make:view greeting
```

`.blade.php` 확장자는 해당 파일이 [Blade 템플릿](/docs/11.x/blade)임을 프레임워크에 알립니다. Blade 템플릿은 HTML뿐 아니라 값을 쉽게 출력하거나, 조건문을 작성하고, 데이터를 반복 처리하는 등 다양한 Blade 지시어(디렉티브)를 포함할 수 있습니다.

뷰를 생성한 후에는 애플리케이션의 라우트나 컨트롤러에서 글로벌 `view` 헬퍼를 활용해 반환할 수 있습니다.

```
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

또는 `View` 파사드를 통해서도 뷰를 반환할 수 있습니다.

```
use Illuminate\Support\Facades\View;

return View::make('greeting', ['name' => 'James']);
```

위 예시에서 볼 수 있듯이, `view` 헬퍼의 첫 번째 인수는 `resources/views` 디렉터리 내의 뷰 파일 이름과 일치해야 합니다. 두 번째 인수로는 뷰에서 사용할 수 있도록 데이터를 배열 형태로 전달합니다. 이 예시에서 `name` 변수는 [Blade 구문](/docs/11.x/blade)을 통해 뷰 내에 표시됩니다.

<a name="nested-view-directories"></a>
### 중첩 뷰 디렉터리

뷰는 `resources/views` 디렉터리의 하위 폴더(서브디렉터리)에 중첩해 저장할 수도 있습니다. 이때 중첩된 뷰 파일을 참조할 때는 "점(·) 표기법(dot notation)"을 사용할 수 있습니다. 예를 들어, 뷰가 `resources/views/admin/profile.blade.php`에 위치한다면, 아래와 같이 해당 뷰를 반환할 수 있습니다.

```
return view('admin.profile', $data);
```

> [!WARNING]  
> 뷰 디렉터리 이름에는 `.` 문자(점)를 포함하면 안 됩니다.

<a name="creating-the-first-available-view"></a>
### 첫 번째 사용 가능한 뷰 생성하기

`View` 파사드의 `first` 메서드를 사용하면, 여러 뷰 중에서 첫 번째로 존재하는 뷰를 반환할 수 있습니다. 애플리케이션 또는 패키지에서 뷰를 커스터마이징하거나 덮어쓰는 경우에 유용하게 사용할 수 있습니다.

```
use Illuminate\Support\Facades\View;

return View::first(['custom.admin', 'admin'], $data);
```

<a name="determining-if-a-view-exists"></a>
### 뷰 존재 여부 확인하기

특정 뷰 파일이 존재하는지 확인하고 싶다면 `View` 파사드의 `exists` 메서드를 사용하면 됩니다. 이 메서드는 뷰가 존재하면 `true`를 반환합니다.

```
use Illuminate\Support\Facades\View;

if (View::exists('admin.profile')) {
    // ...
}
```

<a name="passing-data-to-views"></a>
## 뷰에 데이터 전달하기

앞선 예시처럼, 뷰에 데이터를 전달할 때는 배열 형태로 전달하여 뷰 내부에서 해당 데이터를 사용할 수 있게 합니다.

```
return view('greetings', ['name' => 'Victoria']);
```

이 방식을 사용할 때 전달하는 데이터는 반드시 키-값 쌍의 배열이어야 합니다. 뷰에 데이터를 제공한 후에는, 뷰 내부에서 해당 키 이름을 사용해 값을 가져올 수 있습니다. 예를 들어 `<?php echo $name; ?>`와 같이 사용할 수 있습니다.

`view` 헬퍼 함수에 전체 배열을 전달하는 대신, `with` 메서드를 활용해 개별 데이터를 뷰에 추가할 수도 있습니다. `with` 메서드는 뷰 객체의 인스턴스를 반환하므로, 데이터를 체이닝 방식으로 추가하여 반환할 수 있습니다.

```
return view('greeting')
    ->with('name', 'Victoria')
    ->with('occupation', 'Astronaut');
```

<a name="sharing-data-with-all-views"></a>
### 모든 뷰에 데이터 공유하기

애플리케이션에서 렌더링되는 모든 뷰에 공통 데이터를 공유해야 할 때가 있습니다. 이런 경우 `View` 파사드의 `share` 메서드를 사용하면 됩니다. 일반적으로는 서비스 프로바이더의 `boot` 메서드 내부에서 공유 데이터를 등록합니다. `App\Providers\AppServiceProvider`에 직접 추가하거나, 별도의 서비스 프로바이더를 만들어서 사용할 수도 있습니다.

```
<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        View::share('key', 'value');
    }
}
```

<a name="view-composers"></a>
## 뷰 컴포저

뷰 컴포저(View Composer)는 뷰가 렌더링될 때 호출되는 콜백이나 클래스 메서드입니다. 특정 뷰를 렌더링할 때마다 항상 필요한 데이터를 뷰에 바인딩하고 싶다면, 뷰 컴포저를 통해 해당 로직을 한 곳에 정리할 수 있습니다. 특히 동일한 뷰가 여러 라우트나 컨트롤러에서 반복적으로 반환되고, 항상 특정 데이터가 반드시 전달되어야 한다면 뷰 컴포저가 매우 유용합니다.

일반적으로 뷰 컴포저는 애플리케이션의 [서비스 프로바이더](/docs/11.x/providers) 중 한 곳에 등록합니다. 이 예시에서는 `App\Providers\AppServiceProvider`에 로직을 추가한다고 가정하겠습니다.

뷰 컴포저를 등록할 때는 `View` 파사드의 `composer` 메서드를 사용합니다. 라라벨은 기본적으로 클래스 기반 뷰 컴포저를 위한 디렉터리를 제공하지 않으므로, 원하는 방식대로 디렉터리를 구성하면 됩니다. 예를 들어, `app/View/Composers` 디렉터리를 생성해 모든 뷰 컴포저 클래스를 보관할 수 있습니다.

```
<?php

namespace App\Providers;

use App\View\Composers\ProfileComposer;
use Illuminate\Support\Facades;
use Illuminate\Support\ServiceProvider;
use Illuminate\View\View;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // 클래스 기반 컴포저 등록 예시
        Facades\View::composer('profile', ProfileComposer::class);

        // 클로저 기반 컴포저 등록 예시
        Facades\View::composer('welcome', function (View $view) {
            // ...
        });

        Facades\View::composer('dashboard', function (View $view) {
            // ...
        });
    }
}
```

이렇게 컴포저를 등록하면, `App\View\Composers\ProfileComposer` 클래스의 `compose` 메서드는 `profile` 뷰가 렌더링될 때마다 실행됩니다. 다음은 컴포저 클래스 예시입니다.

```
<?php

namespace App\View\Composers;

use App\Repositories\UserRepository;
use Illuminate\View\View;

class ProfileComposer
{
    /**
     * Create a new profile composer.
     */
    public function __construct(
        protected UserRepository $users,
    ) {}

    /**
     * Bind data to the view.
     */
    public function compose(View $view): void
    {
        $view->with('count', $this->users->count());
    }
}
```

모든 뷰 컴포저는 [서비스 컨테이너](/docs/11.x/container)를 통해 해석( resolve )되므로, 생성자에서 필요한 의존성도 자유롭게 타입힌트로 주입받을 수 있습니다.

<a name="attaching-a-composer-to-multiple-views"></a>
#### 하나의 컴포저를 여러 뷰에 연결하기

`composer` 메서드의 첫 번째 인수로 뷰 배열을 전달하면, 해당 컴포저를 여러 뷰에 한 번에 연결할 수 있습니다.

```
use App\Views\Composers\MultiComposer;
use Illuminate\Support\Facades\View;

View::composer(
    ['profile', 'dashboard'],
    MultiComposer::class
);
```

또한, `composer` 메서드는 `*` 문자를 와일드카드로 지원하므로, 모든 뷰에 컴포저를 연결할 수도 있습니다.

```
use Illuminate\Support\Facades;
use Illuminate\View\View;

Facades\View::composer('*', function (View $view) {
    // ...
});
```

<a name="view-creators"></a>
### 뷰 크리에이터

뷰 "크리에이터"(creator)는 뷰 컴포저와 매우 비슷하지만, 렌더링 직전에 실행되는 컴포저와 달리, 뷰 인스턴스가 생성된 직후 즉시 실행됩니다. 뷰 크리에이터를 등록하려면 `creator` 메서드를 사용하세요.

```
use App\View\Creators\ProfileCreator;
use Illuminate\Support\Facades\View;

View::creator('profile', ProfileCreator::class);
```

<a name="optimizing-views"></a>
## 뷰 최적화

기본적으로 Blade 템플릿 뷰는 요청이 들어올 때마다 필요 시 컴파일됩니다. 뷰를 렌더링해야 할 때, 라라벨은 해당 뷰의 컴파일된 파일이 존재하는지 먼저 확인합니다. 만약 해당 파일이 존재하면, 원본 뷰 파일이 컴파일된 뷰 파일보다 최신인지 추가로 확인합니다. 컴파일된 뷰가 없거나, 원본 뷰가 이후에 수정된 경우 컴파일이 다시 이루어집니다.

요청 처리 중 즉석에서 뷰를 컴파일하면 성능에 약간의 영향을 줄 수 있으므로, 라라벨은 미리 모든 뷰를 컴파일해두는 `view:cache` 아티즌 명령어를 제공합니다. 더 나은 성능을 위해 이 명령어를 배포 과정 중에 실행하는 것이 좋습니다.

```shell
php artisan view:cache
```

뷰 캐시를 비우려면 `view:clear` 명령어를 사용할 수 있습니다.

```shell
php artisan view:clear
```
