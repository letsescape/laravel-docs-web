# 뷰 (Views)

- [소개](#introduction)
    - [React / Vue로 뷰 작성하기](#writing-views-in-react-or-vue)
- [뷰 생성 및 렌더링](#creating-and-rendering-views)
    - [중첩 뷰 디렉토리](#nested-view-directories)
    - [첫 번째로 존재하는 뷰 생성](#creating-the-first-available-view)
    - [뷰 존재 여부 확인](#determining-if-a-view-exists)
- [뷰에 데이터 전달하기](#passing-data-to-views)
    - [모든 뷰에 데이터 공유하기](#sharing-data-with-all-views)
- [뷰 컴포저](#view-composers)
    - [뷰 크리에이터](#view-creators)
- [뷰 최적화하기](#optimizing-views)

<a name="introduction"></a>
## 소개

라우트나 컨트롤러에서 전체 HTML 문서 문자열을 직접 반환하는 것은 현실적으로 비효율적입니다. 이런 문제를 해결하기 위해 뷰(View)는 모든 HTML을 별도의 파일로 분리해서 관리할 수 있는 편리한 방법을 제공합니다.

뷰는 컨트롤러/애플리케이션의 로직과 화면 출력(표현) 로직을 분리하는 역할을 하며, `resources/views` 디렉토리에 저장됩니다. 라라벨을 사용할 때, 뷰 템플릿은 보통 [Blade 템플릿 언어](/docs/blade)를 이용해 작성합니다. 간단한 뷰 예시는 다음과 같습니다.

```blade
<!-- View stored in resources/views/greeting.blade.php -->

<html>
    <body>
        <h1>Hello, {{ $name }}</h1>
    </body>
</html>
```

이 뷰가 `resources/views/greeting.blade.php`에 저장되어 있다면, 아래처럼 전역 `view` 헬퍼로 쉽게 반환할 수 있습니다.

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

> [!NOTE]
> Blade 템플릿 작성에 대해 더 자세히 알고 싶으신가요? [Blade 공식 문서](/docs/blade)를 참고해 시작해보시기 바랍니다.

<a name="writing-views-in-react-or-vue"></a>
### React / Vue로 뷰 작성하기

PHP의 Blade 대신 React 또는 Vue를 이용해 프론트엔드 템플릿을 작성하는 개발자들도 많아졌습니다. 라라벨에서는 [Inertia](https://inertiajs.com/)라는 라이브러리를 통해 SPA를 새로 구축할 때 복잡한 작업 없이 React/Vue 프론트엔드와 라라벨 백엔드를 손쉽게 연동할 수 있습니다.

[React 및 Vue 스타터 키트](/docs/starter-kits)는 Inertia를 활용하는 차세대 라라벨 애플리케이션을 손쉽게 시작할 수 있도록 도와줍니다.

<a name="creating-and-rendering-views"></a>
## 뷰 생성 및 렌더링

애플리케이션의 `resources/views` 디렉토리에 `.blade.php` 확장자를 가진 파일을 직접 생성하거나, `make:view` 아티즌 명령어를 사용하여 뷰를 만들 수 있습니다.

```shell
php artisan make:view greeting
```

`.blade.php` 확장자는 해당 파일이 [Blade 템플릿](/docs/blade)임을 라라벨에 알려줍니다. Blade 템플릿은 HTML 뿐만 아니라 값을 출력하거나 if문 작성, 데이터 반복 등 다양한 Blade 지시문도 함께 사용할 수 있습니다.

뷰를 만들었다면, 애플리케이션의 라우트 또는 컨트롤러에서 전역 `view` 헬퍼를 이용해 반환할 수 있습니다.

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

또는 `View` 파사드를 사용해서 뷰를 반환할 수도 있습니다.

```php
use Illuminate\Support\Facades\View;

return View::make('greeting', ['name' => 'James']);
```

위 예시에서 볼 수 있듯, `view` 헬퍼의 첫 번째 인자는 `resources/views` 디렉토리 내 뷰 파일 이름을 의미합니다. 두 번째 인자는 뷰에 전달할 데이터의 배열입니다. 이 예시는 `name` 변수를 전달했으며, 뷰에서 [Blade 문법](/docs/blade)으로 출력합니다.

<a name="nested-view-directories"></a>
### 중첩 뷰 디렉토리

뷰 파일은 `resources/views` 디렉토리 내에서 하위 폴더로도 정리할 수 있습니다. 이럴 때는 "점(.) 표기법"을 사용해 중첩된 뷰를 참조할 수 있습니다. 예를 들어, 뷰가 `resources/views/admin/profile.blade.php`에 있다면, 라우트나 컨트롤러에서 아래처럼 반환할 수 있습니다.

```php
return view('admin.profile', $data);
```

> [!WARNING]
> 뷰 디렉토리 이름에는 `.`(점) 문자를 사용해서는 안 됩니다.

<a name="creating-the-first-available-view"></a>
### 첫 번째로 존재하는 뷰 생성

`View` 파사드의 `first` 메서드를 사용하면, 여러 뷰 이름 중 첫 번째로 존재하는 뷰를 반환할 수 있습니다. 애플리케이션이나 패키지에서 뷰를 커스터마이즈하거나 덮어쓸 수 있게 하고 싶을 때 유용합니다.

```php
use Illuminate\Support\Facades\View;

return View::first(['custom.admin', 'admin'], $data);
```

<a name="determining-if-a-view-exists"></a>
### 뷰 존재 여부 확인

특정 뷰 파일이 존재하는지 확인해야 하는 경우, `View` 파사드의 `exists` 메서드를 사용할 수 있습니다. 이 메서드는 뷰가 있으면 `true`를 반환합니다.

```php
use Illuminate\Support\Facades\View;

if (View::exists('admin.profile')) {
    // ...
}
```

<a name="passing-data-to-views"></a>
## 뷰에 데이터 전달하기

앞선 예시에서 보았듯, 뷰에 데이터를 전달하려면 배열 형태로 데이터를 넘기면 됩니다.

```php
return view('greetings', ['name' => 'Victoria']);
```

이 방식으로 데이터를 전달하면, 배열의 키/값 쌍으로 구성된 데이터를 뷰에서 해당 키 이름으로 사용할 수 있습니다. 예를 들어 `<?php echo $name; ?>`와 같이 값을 사용할 수 있습니다.

`view` 헬퍼 함수에 전체 배열을 넘기는 대신, `with` 메서드를 사용해 개별 데이터를 뷰에 추가할 수도 있습니다. 이 방법을 사용하면, 반환 전에도 추가적으로 메서드를 체인 형태로 연이어 호출할 수 있습니다.

```php
return view('greeting')
    ->with('name', 'Victoria')
    ->with('occupation', 'Astronaut');
```

<a name="sharing-data-with-all-views"></a>
### 모든 뷰에 데이터 공유하기

가끔 애플리케이션에서 렌더링되는 모든 뷰에 공통 데이터를 항상 전달해야 하는 경우가 있습니다. 이럴 때는 `View` 파사드의 `share` 메서드를 사용하면 됩니다. 일반적으로 이 메서드는 서비스 프로바이더의 `boot` 메서드에서 호출하는 것이 좋습니다. 보통 `App\Providers\AppServiceProvider`의 `boot` 메서드에 추가하거나, 별도의 서비스 프로바이더를 만들어 관리할 수도 있습니다.

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

뷰 컴포저(View Composer)는 뷰가 렌더링될 때마다 호출되는 콜백 함수 또는 클래스 메서드입니다. 특정 뷰가 렌더링될 때마다 항상 데이터를 전달해야 한다면, 뷰 컴포저를 사용해 관련 로직을 한 곳에 정리할 수 있습니다. 여러 라우트나 컨트롤러에서 동일한 뷰가 자주 사용되고, 공통으로 필요한 데이터가 있다면 뷰 컴포저가 특히 유용합니다.

일반적으로 뷰 컴포저는 애플리케이션의 [서비스 프로바이더](/docs/providers)에서 등록합니다. 예시에서는 `App\Providers\AppServiceProvider`에 로직을 작성한다고 가정합니다.

`View` 파사드의 `composer` 메서드를 이용해 뷰 컴포저를 등록할 수 있습니다. 라라벨에서는 컴포저용 기본 디렉토리를 제공하지 않으므로, `app/View/Composers` 디렉토리 등에 자유롭게 클래스를 생성해 관리할 수 있습니다.

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
        // 클래스 기반 컴포저 등록...
        Facades\View::composer('profile', ProfileComposer::class);

        // 클로저 기반 컴포저 등록...
        Facades\View::composer('welcome', function (View $view) {
            // ...
        });

        Facades\View::composer('dashboard', function (View $view) {
            // ...
        });
    }
}
```

뷰 컴포저 등록이 완료되면, `App\View\Composers\ProfileComposer` 클래스의 `compose` 메서드가 `profile` 뷰가 렌더링될 때마다 호출됩니다. 아래는 컴포저 클래스 예시입니다.

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

모든 뷰 컴포저 클래스는 [서비스 컨테이너](/docs/container)를 통해 의존성 주입이 가능하므로, 생성자에서 필요한 의존 객체를 타입힌트로 지정할 수 있습니다.

<a name="attaching-a-composer-to-multiple-views"></a>
#### 여러 뷰에 한 번에 컴포저 연결하기

`composer` 메서드의 첫 번째 인자로 뷰 이름 배열을 전달하면, 여러 뷰에 동시에 뷰 컴포저를 연결할 수 있습니다.

```php
use App\Views\Composers\MultiComposer;
use Illuminate\Support\Facades\View;

View::composer(
    ['profile', 'dashboard'],
    MultiComposer::class
);
```

또한 `composer` 메서드는 `*` 문자를 와일드카드로 허용하므로, 모든 뷰에 컴포저를 연결할 수도 있습니다.

```php
use Illuminate\Support\Facades;
use Illuminate\View\View;

Facades\View::composer('*', function (View $view) {
    // ...
});
```

<a name="view-creators"></a>
### 뷰 크리에이터

뷰 "크리에이터(creators)"는 뷰 컴포저와 매우 유사하지만, 뷰가 렌더링될 때가 아니라 뷰 인스턴스가 생성되는 즉시 실행됩니다. 뷰 크리에이터를 등록하려면 `creator` 메서드를 사용하면 됩니다.

```php
use App\View\Creators\ProfileCreator;
use Illuminate\Support\Facades\View;

View::creator('profile', ProfileCreator::class);
```

<a name="optimizing-views"></a>
## 뷰 최적화하기

기본적으로 Blade 템플릿 뷰는 요청이 있을 때마다 필요에 따라 컴파일됩니다. 즉, 뷰를 렌더링해야 할 때 라라벨은 해당 뷰의 컴파일된 파일이 이미 존재하는지 먼저 확인합니다. 만약 파일이 존재하지 않거나, 원본 뷰 파일이 최신으로 수정됐다면, 라라벨은 뷰를 다시 컴파일합니다.

컴파일 작업이 실제 요청 중에 반복되면 성능에 약간의 영향이 있을 수 있습니다. 이를 방지하기 위해 라라벨은 `view:cache` 아티즌 명령어로 애플리케이션에서 사용하는 모든 뷰를 미리 컴파일할 수 있게 해줍니다. 보다 나은 성능을 위해 배포 프로세스에 이 명령어 실행을 포함하는 것이 좋습니다.

```shell
php artisan view:cache
```

뷰 캐시를 비우려면 `view:clear` 명령어를 사용하면 됩니다.

```shell
php artisan view:clear
```