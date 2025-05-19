# 뷰 (Views)

- [소개](#introduction)
    - [React / Vue로 뷰 작성하기](#writing-views-in-react-or-vue)
- [뷰 생성 및 렌더링](#creating-and-rendering-views)
    - [중첩 뷰 디렉터리](#nested-view-directories)
    - [첫 번째로 사용 가능한 뷰 생성하기](#creating-the-first-available-view)
    - [뷰 존재 여부 확인하기](#determining-if-a-view-exists)
- [뷰에 데이터 전달하기](#passing-data-to-views)
    - [모든 뷰에 데이터 공유하기](#sharing-data-with-all-views)
- [뷰 컴포저](#view-composers)
    - [뷰 크리에이터](#view-creators)
- [뷰 최적화하기](#optimizing-views)

<a name="introduction"></a>
## 소개

라우트나 컨트롤러에서 전체 HTML 문서 문자열을 직접 반환하는 것은 비효율적입니다. 다행히 라라벨은 모든 HTML을 별도의 파일에 보관할 수 있도록 뷰(View) 기능을 제공합니다.

뷰는 컨트롤러/애플리케이션 로직과 프레젠테이션(화면) 로직을 분리해주며, `resources/views` 디렉터리에 저장됩니다. 라라벨을 사용할 때는 주로 [Blade 템플릿 언어](/docs/10.x/blade)를 사용하여 뷰 템플릿을 작성합니다. 간단한 뷰는 다음과 같이 작성할 수 있습니다.

```blade
<!-- View stored in resources/views/greeting.blade.php -->

<html>
    <body>
        <h1>Hello, {{ $name }}</h1>
    </body>
</html>
```

이 뷰 파일이 `resources/views/greeting.blade.php`에 저장되어 있으므로, 아래와 같이 전역 `view` 헬퍼를 사용해 반환할 수 있습니다.

```
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

> [!NOTE]
> Blade 템플릿 작성에 대해 더 자세한 정보가 필요하다면 [Blade 공식 문서](/docs/10.x/blade)를 참고하시기 바랍니다.

<a name="writing-views-in-react-or-vue"></a>
### React / Vue로 뷰 작성하기

많은 개발자들이 Blade를 활용한 PHP 기반 프론트엔드 템플릿 대신 React나 Vue를 사용하여 템플릿을 작성하는 것을 선호합니다. 라라벨은 [Inertia](https://inertiajs.com/)라는 라이브러리를 통해 이러한 작업을 쉽게 할 수 있도록 지원합니다. Inertia를 사용하면 복잡한 SPA를 직접 구축할 필요 없이 React / Vue 프론트엔드를 라라벨 백엔드와 자연스럽게 연결할 수 있습니다.

Breeze와 Jetstream [스타터 키트](/docs/10.x/starter-kits)는 Inertia 기반 라라벨 애플리케이션을 빠르게 시작할 수 있도록 도와줍니다. 또한, [Laravel Bootcamp](https://bootcamp.laravel.com)에서는 Inertia를 활용한 라라벨 애플리케이션 구축 방법을 Vue와 React 예제와 함께 자세히 안내하고 있습니다.

<a name="creating-and-rendering-views"></a>
## 뷰 생성 및 렌더링

`.blade.php` 확장자를 가진 파일을 애플리케이션의 `resources/views` 디렉터리에 생성하거나, `make:view` 아티즌 명령어를 사용해 뷰를 만들 수 있습니다.

```shell
php artisan make:view greeting
```

`.blade.php` 확장자는 해당 파일이 [Blade 템플릿](/docs/10.x/blade)임을 프레임워크에 알려줍니다. Blade 템플릿 파일에는 HTML과 함께, 값을 출력하거나 if문을 만들고, 데이터를 반복 출력하는 등의 작업을 쉽게 할 수 있는 Blade 지시문(Directive)을 포함할 수 있습니다.

뷰를 생성한 후에는, 아래와 같이 전역 `view` 헬퍼를 사용해 라우트나 컨트롤러에서 뷰를 반환할 수 있습니다.

```
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

또는 `View` 파사드를 이용해 뷰를 반환할 수도 있습니다.

```
use Illuminate\Support\Facades\View;

return View::make('greeting', ['name' => 'James']);
```

위 예시에서 `view` 헬퍼의 첫 번째 인수는 `resources/views` 디렉터리 내 뷰 파일의 이름을 의미합니다. 두 번째 인수는 뷰에서 사용할 데이터 배열입니다. 여기서는 `name` 변수를 전달하고, 이 값이 [Blade 문법](/docs/10.x/blade)으로 뷰에 표시됩니다.

<a name="nested-view-directories"></a>
### 중첩 뷰 디렉터리

뷰 파일은 `resources/views` 디렉터리 내의 하위 폴더(서브디렉터리)에도 저장할 수 있습니다. 이때 중첩된 뷰는 "닷(dot) 표기법"으로 참조합니다. 예를 들어, 뷰 파일이 `resources/views/admin/profile.blade.php`에 있다면, 아래와 같이 해당 뷰를 반환할 수 있습니다.

```
return view('admin.profile', $data);
```

> [!WARNING]
> 뷰 디렉터리 이름에는 `.`(닷) 문자를 사용하면 안 됩니다.

<a name="creating-the-first-available-view"></a>
### 첫 번째로 사용 가능한 뷰 생성하기

`View` 파사드의 `first` 메서드를 사용하면, 여러 뷰 중에 존재하는 첫 번째 뷰를 반환할 수 있습니다. 뷰를 커스터마이징하거나 덮어써야 하는 경우에 유용하게 활용할 수 있습니다.

```
use Illuminate\Support\Facades\View;

return View::first(['custom.admin', 'admin'], $data);
```

<a name="determining-if-a-view-exists"></a>
### 뷰 존재 여부 확인하기

특정 뷰 파일이 존재하는지 확인할 필요가 있을 때는, `View` 파사드의 `exists` 메서드를 사용할 수 있습니다. 이 메서드는 뷰가 존재하면 `true`를 반환합니다.

```
use Illuminate\Support\Facades\View;

if (View::exists('admin.profile')) {
    // ...
}
```

<a name="passing-data-to-views"></a>
## 뷰에 데이터 전달하기

앞서 살펴본 것처럼, 뷰에 데이터를 배열 형태로 전달하여 뷰 내부에서 해당 데이터를 사용할 수 있습니다.

```
return view('greetings', ['name' => 'Victoria']);
```

이렇게 정보를 전달하는 경우, 데이터는 키-값 쌍의 배열이어야 합니다. 뷰에 데이터를 전달한 이후에는, PHP의 변수명(`$name` 등)으로 데이터를 뷰에서 참조하면 됩니다. 예: `<?php echo $name; ?>`

전체 데이터 배열을 `view` 헬퍼에 전달하는 대신, 각각의 데이터를 `with` 메서드로 추가할 수도 있습니다. `with` 메서드는 뷰 객체 인스턴스를 반환하므로, 반환하기 전에 여러 메서드를 체이닝해서 사용할 수 있습니다.

```
return view('greeting')
            ->with('name', 'Victoria')
            ->with('occupation', 'Astronaut');
```

<a name="sharing-data-with-all-views"></a>
### 모든 뷰에 데이터 공유하기

애플리케이션에서 렌더링되는 모든 뷰에 데이터를 공유해야 하는 경우가 있습니다. 이럴 때는 `View` 파사드의 `share` 메서드를 사용할 수 있습니다. 보통 이 코드는 서비스 프로바이더의 `boot` 메서드 안에 작성하는 것이 일반적입니다. `App\Providers\AppServiceProvider` 클래스에 추가하거나, 별도의 서비스 프로바이더를 생성해도 좋습니다.

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

뷰 컴포저(View Composer)는 뷰가 렌더링될 때마다 실행되는 콜백 또는 클래스 메서드입니다. 특정 뷰가 렌더링될 때마다 반드시 전달해야 하는 데이터가 있다면, 뷰 컴포저를 활용해 관련 로직을 한 곳에 정리할 수 있습니다. 뷰 컴포저는 하나의 뷰가 여러 라우트나 컨트롤러에서 반환되며, 항상 특정 데이터를 필요로 할 때 특히 유용합니다.

일반적으로 뷰 컴포저 등록은 애플리케이션의 [서비스 프로바이더](/docs/10.x/providers)에서 진행합니다. 여기서는 해당 로직을 담을 새 `App\Providers\ViewServiceProvider`를 생성했다고 가정하겠습니다.

`View` 파사드의 `composer` 메서드를 사용해 뷰 컴포저를 등록합니다. 라라벨은 클래스 기반 뷰 컴포저에 대한 기본 디렉터리를 제공하지 않으므로, 앱 구조에 맞게 자유롭게 구성하면 됩니다. 예를 들어, 전체 뷰 컴포저를 관리할 `app/View/Composers` 디렉터리를 만들어 사용할 수 있습니다.

```
<?php

namespace App\Providers;

use App\View\Composers\ProfileComposer;
use Illuminate\Support\Facades;
use Illuminate\Support\ServiceProvider;
use Illuminate\View\View;

class ViewServiceProvider extends ServiceProvider
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
        // 클래스 기반 컴포저 등록...
        Facades\View::composer('profile', ProfileComposer::class);

        // 클로저(Closure) 기반 컴포저 등록...
        Facades\View::composer('welcome', function (View $view) {
            // ...
        });

        Facades\View::composer('dashboard', function (View $view) {
            // ...
        });
    }
}
```

> [!WARNING]
> 뷰 컴포저 등록을 위해 새 서비스 프로바이더를 생성했다면, 반드시 `config/app.php` 설정 파일의 `providers` 배열에 해당 프로바이더를 추가해야 합니다.

이제 컴포저가 등록되었으므로, `profile` 뷰가 렌더링될 때마다 `App\View\Composers\ProfileComposer` 클래스의 `compose` 메서드가 실행됩니다. 아래는 컴포저 클래스의 예시입니다.

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

보시는 것처럼, 모든 뷰 컴포저는 [서비스 컨테이너](/docs/10.x/container)를 통해 의존성 주입이 가능하므로, 컴포저 생성자에서 필요한 의존성을 타입힌트로 선언할 수 있습니다.

<a name="attaching-a-composer-to-multiple-views"></a>
#### 여러 뷰에 하나의 컴포저 등록하기

`composer` 메서드의 첫 번째 인수에 뷰 이름 배열을 전달하면, 여러 뷰에 동시에 뷰 컴포저를 적용할 수 있습니다.

```
use App\Views\Composers\MultiComposer;
use Illuminate\Support\Facades\View;

View::composer(
    ['profile', 'dashboard'],
    MultiComposer::class
);
```

또한, `composer` 메서드는 `*`(애스터리스크) 와일드카드를 사용하여 모든 뷰에 컴포저를 등록할 수도 있습니다.

```
use Illuminate\Support\Facades;
use Illuminate\View\View;

Facades\View::composer('*', function (View $view) {
    // ...
});
```

<a name="view-creators"></a>
### 뷰 크리에이터

뷰 "크리에이터(View Creator)"는 뷰 컴포저와 매우 유사하지만, 뷰가 렌더링되기 직전이 아니라 인스턴스가 만들어진 즉시 실행된다는 점이 다릅니다. 뷰 크리에이터를 등록하려면 `creator` 메서드를 사용합니다.

```
use App\View\Creators\ProfileCreator;
use Illuminate\Support\Facades\View;

View::creator('profile', ProfileCreator::class);
```

<a name="optimizing-views"></a>
## 뷰 최적화하기

기본적으로 Blade 템플릿 뷰는 요청이 들어올 때마다 필요에 따라 컴파일됩니다. 라라벨은 뷰 렌더링 요청이 있을 경우, 먼저 컴파일된 뷰 파일이 존재하는지 확인합니다. 파일이 존재하면, 원본 뷰 파일이 최근에 변경되었는지 여부를 검사합니다. 컴파일된 뷰가 없거나, 원본 뷰가 더 최근에 수정된 경우에는 라라벨이 해당 뷰를 새로 컴파일합니다.

요청 중에 뷰를 컴파일하는 과정은 약간의 성능 저하를 유발할 수 있으므로, 라라벨은 `view:cache` 아티즌 명령어를 제공해 전체 뷰를 미리 컴파일할 수 있도록 지원합니다. 성능 향상이 필요하다면, 이 명령어를 배포(deployment) 과정 중에 실행하는 것을 권장합니다.

```shell
php artisan view:cache
```

`view:clear` 명령어를 이용하여 뷰 캐시를 비울 수도 있습니다.

```shell
php artisan view:clear
```
