# 뷰 (Views)

- [소개](#introduction)
    - [React / Vue로 뷰 작성하기](#writing-views-in-react-or-vue)
- [뷰 생성 및 렌더링](#creating-and-rendering-views)
    - [중첩된 뷰 디렉터리](#nested-view-directories)
    - [첫 번째로 사용 가능한 뷰 생성](#creating-the-first-available-view)
    - [뷰 존재 여부 확인](#determining-if-a-view-exists)
- [뷰에 데이터 전달하기](#passing-data-to-views)
    - [모든 뷰에 데이터 공유](#sharing-data-with-all-views)
- [뷰 컴포저](#view-composers)
    - [뷰 크리에이터](#view-creators)
- [뷰 최적화](#optimizing-views)

<a name="introduction"></a>
## 소개

라우트나 컨트롤러에서 전체 HTML 문서를 문자열로 직접 반환하는 것은 현실적으로 비효율적입니다. 다행히 뷰를 사용하면 모든 HTML 코드를 별도의 파일에 편리하게 분리할 수 있습니다.

뷰는 컨트롤러/애플리케이션의 비즈니스 로직과 화면 표시 로직을 분리해주며, `resources/views` 디렉터리에 저장됩니다. 라라벨에서는 주로 [Blade 템플릿 언어](/docs/12.x/blade)를 이용해 뷰를 작성합니다. 아래는 간단한 뷰의 예시입니다.

```blade
<!-- View stored in resources/views/greeting.blade.php -->

<html>
    <body>
        <h1>Hello, {{ $name }}</h1>
    </body>
</html>
```

위와 같이 `resources/views/greeting.blade.php` 경로에 뷰 파일이 있다면, 글로벌 `view` 헬퍼를 사용해 다음과 같이 반환할 수 있습니다.

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

> [!NOTE]
> Blade 템플릿 작성법이 더 궁금하다면? [Blade 공식 문서](/docs/12.x/blade)를 참고해보세요.

<a name="writing-views-in-react-or-vue"></a>
### React / Vue로 뷰 작성하기

Blade를 이용한 PHP 기반의 프론트엔드 템플릿 대신, 최근에는 많은 개발자들이 React 혹은 Vue로 프론트엔드 템플릿을 작성하는 방식을 선호하기 시작했습니다. 라라벨에서는 [Inertia](https://inertiajs.com/)를 통해 이러한 개발 방식을 매우 쉽게 적용할 수 있습니다. Inertia는 React/Vue 프론트엔드를 라라벨 백엔드와 연결해주는 라이브러리로, 기존 SPA 구조의 복잡함을 대부분 해소해줍니다.

라라벨에서는 [React와 Vue 기반 애플리케이션 스타터 키트](/docs/12.x/starter-kits)를 제공하므로, Inertia를 활용한 새로운 라라벨 프로젝트를 빠르게 시작할 수 있습니다.

<a name="creating-and-rendering-views"></a>
## 뷰 생성 및 렌더링

뷰는 `.blade.php` 확장자를 가진 파일을 애플리케이션의 `resources/views` 디렉터리에 직접 생성하거나, `make:view` 아티즌 명령어를 이용해 만들 수 있습니다.

```shell
php artisan make:view greeting
```

`.blade.php` 확장자는 해당 파일이 [Blade 템플릿](/docs/12.x/blade)임을 프레임워크에 알려줍니다. Blade 템플릿은 HTML 코드와 함께 Blade 지시문을 사용할 수 있어, 값을 출력하거나 if 문을 작성하고, 데이터를 반복 처리하는 등 다양한 기능을 손쉽게 구현할 수 있습니다.

뷰를 만들었다면, 라우트나 컨트롤러에서 글로벌 `view` 헬퍼를 사용해 뷰를 반환할 수 있습니다.

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

또한, `View` 파사드를 활용해 뷰를 반환할 수도 있습니다.

```php
use Illuminate\Support\Facades\View;

return View::make('greeting', ['name' => 'James']);
```

여기서 첫 번째 인수는 `resources/views` 디렉터리 아래에 있는 뷰 파일명을 의미합니다. 두 번째 인수에는 뷰에서 사용할 수 있도록 전달될 데이터를 배열로 넘깁니다. 위 예제에서는 `name` 변수에 값을 전달하고, 이 값을 [Blade 문법](/docs/12.x/blade)으로 뷰에서 출력합니다.

<a name="nested-view-directories"></a>
### 중첩된 뷰 디렉터리

`resources/views` 디렉터리 내에 하위 폴더를 만들어 뷰 파일을 중첩시킬 수도 있습니다. 이때 "dot" 표기법을 사용해 중첩 뷰를 참조할 수 있습니다. 예를 들어, 뷰 파일이 `resources/views/admin/profile.blade.php`에 위치한다면 다음과 같이 사용할 수 있습니다.

```php
return view('admin.profile', $data);
```

> [!WARNING]
> 뷰 디렉터리명에는 `.` 문자를 사용하면 안 됩니다.

<a name="creating-the-first-available-view"></a>
### 첫 번째로 사용 가능한 뷰 생성

`View` 파사드의 `first` 메서드를 이용하면, 여러 뷰 중에서 먼저 존재하는 뷰를 찾아 반환할 수 있습니다. 뷰가 커스터마이징이나 오버라이딩되는 구조(애플리케이션 또는 패키지)에서 유용하게 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\View;

return View::first(['custom.admin', 'admin'], $data);
```

<a name="determining-if-a-view-exists"></a>
### 뷰 존재 여부 확인

특정 뷰가 존재하는지 확인하려면 `View` 파사드의 `exists` 메서드를 사용할 수 있습니다. 해당 뷰가 존재하면 `true`를 반환합니다.

```php
use Illuminate\Support\Facades\View;

if (View::exists('admin.profile')) {
    // ...
}
```

<a name="passing-data-to-views"></a>
## 뷰에 데이터 전달하기

앞선 예제들처럼, 뷰에 데이터를 넘길 때는 배열 형태로 키/값 쌍을 전달하면 됩니다.

```php
return view('greetings', ['name' => 'Victoria']);
```

이처럼 데이터를 전달하면, 뷰 파일 내에서 각 값을 키 이름으로 접근할 수 있습니다. 예를 들어, `<?php echo $name; ?>`처럼 사용할 수 있습니다.

전체 데이터를 배열로 한 번에 전달하는 것 대신, `with` 메서드를 사용해 각각의 데이터를 개별적으로 추가할 수도 있습니다. `with` 메서드는 뷰 객체 인스턴스를 반환하므로, 메서드 체이닝으로 연속해서 값을 추가할 수 있습니다.

```php
return view('greeting')
    ->with('name', 'Victoria')
    ->with('occupation', 'Astronaut');
```

<a name="sharing-data-with-all-views"></a>
### 모든 뷰에 데이터 공유

애플리케이션에서 렌더링되는 모든 뷰에 공통 데이터가 필요할 때도 있습니다. 이럴 때는 `View` 파사드의 `share` 메서드를 사용하면 됩니다. 일반적으로 서비스 프로바이더의 `boot` 메서드 안에서 `share` 메서드를 호출하는 것이 좋습니다. 보통 `App\Providers\AppServiceProvider` 클래스에 추가하거나, 별도의 서비스 프로바이더를 생성해 관리할 수 있습니다.

```php
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

뷰 컴포저(View Composer)는 뷰가 렌더링될 때 호출되는 콜백 또는 클래스 메서드입니다. 뷰가 렌더링될 때마다 특정 데이터를 항상 바인딩해야 할 필요가 있다면, 뷰 컴포저를 이용해 관련 로직을 한 곳에 모아 관리할 수 있습니다. 특히 여러 라우트나 컨트롤러에서 동일한 뷰를 반환하며, 항상 특정 데이터가 필요할 때 유용합니다.

보통 뷰 컴포저는 애플리케이션의 [서비스 프로바이더](/docs/12.x/providers) 중 하나에서 등록합니다. 여기서는 `App\Providers\AppServiceProvider`에 관련 코드를 추가한다고 가정하겠습니다.

`View` 파사드의 `composer` 메서드를 사용해 뷰 컴포저를 등록합니다. 라라벨에서는 클래스 기반 뷰 컴포저의 경우 별도의 디렉터리 규칙이 정해져 있지 않으므로, 원하는 대로 폴더 구조를 만들 수 있습니다. 예를 들어, 모든 뷰 컴포저를 `app/View/Composers` 디렉터리에 둘 수 있습니다.

```php
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
        // 클래스 기반 뷰 컴포저 사용
        Facades\View::composer('profile', ProfileComposer::class);

        // 클로저 기반 뷰 컴포저 사용
        Facades\View::composer('welcome', function (View $view) {
            // ...
        });

        Facades\View::composer('dashboard', function (View $view) {
            // ...
        });
    }
}
```

이렇게 composer를 등록하면, `App\View\Composers\ProfileComposer` 클래스의 `compose` 메서드는 `profile` 뷰가 렌더링될 때마다 실행됩니다. 아래는 composer 클래스의 예시입니다.

```php
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

위 예제에서 알 수 있듯, 모든 뷰 컴포저는 [서비스 컨테이너](/docs/12.x/container)를 통해 의존성이 해결되므로, composer의 생성자에서 필요한 의존성을 타입힌트로 지정할 수 있습니다.

<a name="attaching-a-composer-to-multiple-views"></a>
#### 여러 뷰에 하나의 컴포저 연결하기

`composer` 메서드의 첫 번째 인수로 뷰 배열을 전달하면, 여러 뷰에 동시에 하나의 뷰 컴포저를 연결할 수 있습니다.

```php
use App\Views\Composers\MultiComposer;
use Illuminate\Support\Facades\View;

View::composer(
    ['profile', 'dashboard'],
    MultiComposer::class
);
```

또한, `composer` 메서드에서 `*` 문자를 와일드카드로 사용하면, 모든 뷰에 컴포저를 연결할 수도 있습니다.

```php
use Illuminate\Support\Facades;
use Illuminate\View\View;

Facades\View::composer('*', function (View $view) {
    // ...
});
```

<a name="view-creators"></a>
### 뷰 크리에이터

뷰 "크리에이터(creator)"는 뷰 컴포저와 매우 유사하지만, 차이점은 뷰가 렌더링되기 전에 뷰 인스턴스가 만들어지는 즉시 실행된다는 점입니다. 뷰 크리에이터를 등록할 때는 `creator` 메서드를 사용합니다.

```php
use App\View\Creators\ProfileCreator;
use Illuminate\Support\Facades\View;

View::creator('profile', ProfileCreator::class);
```

<a name="optimizing-views"></a>
## 뷰 최적화

기본적으로 Blade 템플릿 뷰는 필요할 때마다(온디맨드로) 컴파일됩니다. 어떤 요청에서 뷰 렌더링이 필요하면, 라라벨은 해당 뷰의 컴파일된 버전이 이미 존재하는지 먼저 확인합니다. 만약 파일이 존재하면, 원본 뷰 파일이 컴파일된 뷰보다 더 최근에 수정되었는지도 확인합니다. 만약 컴파일된 뷰가 없거나, 원본 뷰가 더 최신이라면, 라라벨은 뷰를 새로 컴파일합니다.

요청 중에 뷰를 컴파일하면 성능 저하가 미세하게 발생할 수 있으므로, 라라벨은 `view:cache` 아티즌 명령어를 제공하여 애플리케이션에서 사용하는 모든 뷰를 미리 컴파일할 수 있습니다. 배포 과정에서 이 명령어를 실행하면 성능 향상에 도움이 됩니다.

```shell
php artisan view:cache
```

뷰 캐시를 비우려면 `view:clear` 명령어를 사용하세요.

```shell
php artisan view:clear
```