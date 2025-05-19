# 뷰 (Views)

- [소개](#introduction)
- [뷰 생성 및 렌더링](#creating-and-rendering-views)
    - [중첩 뷰 디렉터리](#nested-view-directories)
    - [사용 가능한 첫 번째 뷰 생성](#creating-the-first-available-view)
    - [뷰 존재 여부 확인](#determining-if-a-view-exists)
- [뷰에 데이터 전달](#passing-data-to-views)
    - [모든 뷰에 데이터 공유](#sharing-data-with-all-views)
- [뷰 컴포저](#view-composers)
    - [뷰 크리에이터](#view-creators)
- [뷰 최적화](#optimizing-views)

<a name="introduction"></a>
## 소개

라우트와 컨트롤러에서 전체 HTML 문서를 문자열로 직접 반환하는 것은 현실적으로 비효율적입니다. 다행히도, 뷰(View)를 사용하면 모든 HTML을 별도의 파일로 분리하여 관리할 수 있습니다. 뷰는 컨트롤러 및 애플리케이션의 로직과 화면 표시 로직을 분리하며, `resources/views` 디렉터리에 저장됩니다. 간단한 뷰 예시는 다음과 같습니다.

```html
<!-- View stored in resources/views/greeting.blade.php -->

<html>
    <body>
        <h1>Hello, {{ $name }}</h1>
    </body>
</html>
```

이 뷰는 `resources/views/greeting.blade.php`에 저장되어 있으므로, 다음과 같이 전역 `view` 헬퍼를 사용해 반환할 수 있습니다.

```
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

> [!TIP]
> Blade 템플릿 작성법에 대해 더 알아보고 싶으신가요? 전체 [Blade 문서](/docs/8.x/blade)를 참고해 시작해 보세요.

<a name="creating-and-rendering-views"></a>
## 뷰 생성 및 렌더링

애플리케이션의 `resources/views` 디렉터리에 `.blade.php` 확장자를 가진 파일을 생성하여 뷰를 만들 수 있습니다. `.blade.php` 확장자는 해당 파일이 [Blade 템플릿](/docs/8.x/blade)임을 프레임워크에 알립니다. Blade 템플릿에는 일반 HTML뿐만 아니라 Blade 지시문을 포함하여 값을 손쉽게 출력하거나, if 문을 작성하거나, 데이터를 반복 출력하는 등 다양한 기능을 사용할 수 있습니다.

뷰를 생성한 후에는 라우트나 컨트롤러에서 전역 `view` 헬퍼를 사용해 반환할 수 있습니다.

```
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

또는 `View` 파사드를 사용하여 반환할 수도 있습니다.

```
use Illuminate\Support\Facades\View;

return View::make('greeting', ['name' => 'James']);
```

보시면, `view` 헬퍼의 첫 번째 인수는 `resources/views` 디렉터리에 있는 뷰 파일의 이름과 일치해야 합니다. 두 번째 인수는 뷰에 사용할 데이터를 배열 형태로 전달합니다. 예제의 경우, `name` 변수를 전달해 뷰에서 [Blade 문법](/docs/8.x/blade)으로 출력하고 있습니다.

<a name="nested-view-directories"></a>
### 중첩 뷰 디렉터리

뷰는 `resources/views` 디렉터리 안의 하위 폴더(서브 디렉터리)에 중첩시켜 저장할 수도 있습니다. 이때 "점(dot) 표기법"을 사용하여 중첩 뷰를 참조하면 됩니다. 예를 들어, 뷰가 `resources/views/admin/profile.blade.php`에 위치한다면, 라우트나 컨트롤러에서 다음과 같이 반환할 수 있습니다.

```
return view('admin.profile', $data);
```

> [!NOTE]
> 뷰 디렉터리의 이름에는 `.`(점) 문자를 포함하면 안 됩니다.

<a name="creating-the-first-available-view"></a>
### 사용 가능한 첫 번째 뷰 생성

`View` 파사드의 `first` 메서드를 사용하면, 여러 뷰 이름의 배열 중에서 존재하는 첫 번째 뷰를 반환할 수 있습니다. 애플리케이션이나 패키지에서 뷰를 커스터마이즈하거나 덮어쓸 수 있도록 할 때 유용합니다.

```
use Illuminate\Support\Facades\View;

return View::first(['custom.admin', 'admin'], $data);
```

<a name="determining-if-a-view-exists"></a>
### 뷰 존재 여부 확인

특정 뷰가 존재하는지 확인해야 한다면, `View` 파사드의 `exists` 메서드를 사용할 수 있습니다. 이 메서드는 뷰가 존재하면 `true`를 반환합니다.

```
use Illuminate\Support\Facades\View;

if (View::exists('emails.customer')) {
    //
}
```

<a name="passing-data-to-views"></a>
## 뷰에 데이터 전달

앞서 본 예시처럼, 뷰에 데이터를 전달하려면 배열 형태로 데이터를 넘겨주면 됩니다.

```
return view('greetings', ['name' => 'Victoria']);
```

이처럼 배열로 전달할 때, 각 데이터는 키/값 쌍이어야 합니다. 뷰로 데이터를 제공하면 뷰 파일 내부에서 키를 통해 해당 값을 사용할 수 있습니다. 예시에서 `<?php echo $name; ?>`와 같이 접근할 수 있습니다.

전체 배열을 `view` 헬퍼 함수에 전달하는 대신, `with` 메서드를 연달아 사용하여 개별 데이터를 추가하는 방법도 있습니다. `with` 메서드는 뷰 객체의 인스턴스를 반환하므로, 반환 전에 연속적으로 메서드 체이닝을 할 수 있습니다.

```
return view('greeting')
            ->with('name', 'Victoria')
            ->with('occupation', 'Astronaut');
```

<a name="sharing-data-with-all-views"></a>
### 모든 뷰에 데이터 공유

때로는 애플리케이션에서 렌더링되는 모든 뷰에 공통 데이터를 공유해야 할 때가 있습니다. 이 경우 `View` 파사드의 `share` 메서드를 사용하면 됩니다. 보통 이 메서드는 서비스 프로바이더의 `boot` 메서드 내에서 호출하는 것이 좋습니다. `App\Providers\AppServiceProvider` 클래스에 직접 추가해도 되고, 별도의 서비스 프로바이더를 생성해 등록해도 무방합니다.

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

뷰 컴포저(View Composer)는 뷰가 렌더링될 때마다 호출되는 콜백이나 클래스 메서드입니다. 만약 특정 뷰가 렌더링될 때마다 항상 동일한 데이터를 전달하고 싶다면, 뷰 컴포저를 활용해 관련 로직을 한 곳에 정리할 수 있습니다. 뷰 컴포저는 같은 뷰가 여러 라우트나 컨트롤러에서 반환될 때, 특정 데이터를 항상 바인딩해야 할 때 특히 유용합니다.

일반적으로 뷰 컴포저는 애플리케이션의 [서비스 프로바이더](/docs/8.x/providers) 중 하나에 등록합니다. 예시에서는 관련 코드를 위한 `App\Providers\ViewServiceProvider` 를 새로 만들었다고 가정하겠습니다.

`View` 파사드의 `composer` 메서드를 사용해 뷰 컴포저를 등록할 수 있습니다. Laravel은 클래스 기반 뷰 컴포저를 위한 기본 디렉터리를 제공하지 않으므로, 원하시는 위치에 자유롭게 생성하셔도 됩니다. 예를 들어, 모든 뷰 컴포저를 `app/View/Composers` 디렉터리에 두는 식입니다.

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
        // 클래스 기반 컴포저 사용...
        View::composer('profile', ProfileComposer::class);

        // 클로저 기반 컴포저 사용...
        View::composer('dashboard', function ($view) {
            //
        });
    }
}
```

> [!NOTE]
> 뷰 컴포저 등록을 위한 새로운 서비스 프로바이더를 생성했다면, 반드시 `config/app.php` 설정 파일의 `providers` 배열에 해당 프로바이더를 추가해야 합니다.

컴포저가 등록된 후에는, `App\View\Composers\ProfileComposer` 클래스의 `compose` 메서드가 `profile` 뷰가 렌더링될 때마다 실행됩니다. 컴포저 클래스의 예시는 아래와 같습니다.

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
        // 의존성은 서비스 컨테이너가 자동 해결합니다...
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

모든 뷰 컴포저는 [서비스 컨테이너](/docs/8.x/container)를 통해 resolve되므로, 컴포저의 생성자에서 필요한 의존성을 타입힌트로 지정해 주입받을 수 있습니다.

<a name="attaching-a-composer-to-multiple-views"></a>
#### 여러 뷰에 컴포저 연결하기

`composer` 메서드의 첫 번째 인수로 뷰 이름의 배열을 전달하면, 한 번에 여러 뷰에 컴포저를 연결할 수 있습니다.

```
use App\Views\Composers\MultiComposer;

View::composer(
    ['profile', 'dashboard'],
    MultiComposer::class
);
```

또한 `composer` 메서드는 `*` 문자를 와일드카드로 지원하여, 모든 뷰에 동일한 컴포저를 적용할 수도 있습니다.

```
View::composer('*', function ($view) {
    //
});
```

<a name="view-creators"></a>
### 뷰 크리에이터

뷰 "크리에이터(View Creator)"는 뷰 컴포저와 매우 유사하지만, 뷰가 렌더링되기 직전이 아니라 인스턴스화된 직후 바로 실행됩니다. 뷰 크리에이터를 등록하려면 `creator` 메서드를 사용합니다.

```
use App\View\Creators\ProfileCreator;
use Illuminate\Support\Facades\View;

View::creator('profile', ProfileCreator::class);
```

<a name="optimizing-views"></a>
## 뷰 최적화

기본적으로 Blade 템플릿 뷰는 요청 시점에 필요할 때마다 컴파일됩니다. 즉, 특정 뷰를 렌더링하는 요청이 들어오면, 라라벨은 해당 뷰의 컴파일된 버전이 존재하는지 먼저 확인합니다. 만약 존재한다면 컴파일되지 않은 원본 뷰 파일이 더 최근에 수정되었는지도 검사합니다. 컴파일된 뷰가 없거나, 원본 뷰가 더 최신이라면, 라라벨은 해당 뷰를 다시 컴파일하여 사용합니다.

요청 처리 중 뷰를 컴파일하면 성능에 약간의 부담이 있을 수 있으므로, 라라벨에서는 애플리케이션에서 사용되는 모든 뷰를 미리 한 번에 컴파일해두는 `view:cache` 아티즌 명령어를 제공합니다. 성능 향상을 위해 배포 자동화 과정 일부로 이 명령어를 실행하는 것이 좋습니다.

```
php artisan view:cache
```

뷰 캐시를 비우고 싶다면 `view:clear` 명령어를 사용하면 됩니다.

```
php artisan view:clear
```