# 패키지 개발 (Package Development)

- [소개](#introduction)
    - [파사드에 대한 참고](#a-note-on-facades)
- [패키지 자동 발견](#package-discovery)
- [서비스 프로바이더](#service-providers)
- [리소스](#resources)
    - [설정 파일](#configuration)
    - [마이그레이션](#migrations)
    - [라우트](#routes)
    - [번역](#translations)
    - [뷰](#views)
    - [뷰 컴포넌트](#view-components)
    - ["About" 아티즌 명령어](#about-artisan-command)
- [명령어](#commands)
- [퍼블릭 에셋](#public-assets)
- [파일 그룹 퍼블리싱](#publishing-file-groups)

<a name="introduction"></a>
## 소개

패키지는 라라벨에 기능을 추가하는 주요 수단입니다. 패키지는 [Carbon](https://github.com/briannesbitt/Carbon)처럼 날짜를 쉽게 다루게 해주는 라이브러리일 수도 있고, Spatie의 [Laravel Media Library](https://github.com/spatie/laravel-medialibrary)처럼 Eloquent 모델에 파일을 연관시킬 수 있게 해주는 라이브러리처럼 다양할 수 있습니다.

패키지에는 여러 종류가 있습니다. 어떤 패키지는 독립적으로 동작하며, 모든 PHP 프레임워크에서 사용할 수 있습니다. Carbon과 PHPUnit은 독립 패키지의 예시입니다. 이런 패키지들은 여러분의 `composer.json` 파일에 추가만 하면 라라벨에서도 바로 사용할 수 있습니다.

반면, 라라벨에서만 사용하도록 특별히 설계된 패키지도 있습니다. 이런 패키지들은 라우트, 컨트롤러, 뷰, 그리고 설정 파일 등 라라벨 애플리케이션에서 활용할 수 있는 기능을 제공합니다. 이 가이드에서는 주로 라라벨 전용 패키지 개발 방법에 대해 다룹니다.

<a name="a-note-on-facades"></a>
### 파사드에 대한 참고

라라벨 앱을 개발할 때는 contract(계약)이나 파사드(facade) 중 어떤 것을 사용해도 테스트 가능성 측면에서 별다른 차이가 없습니다. 하지만 패키지를 개발할 때는 라라벨의 모든 테스트 도우미를 직접 사용할 수 없습니다. 만약 패키지 내 테스트를 일반적인 라라벨 프로젝트와 동일한 환경에서 작성하고 싶다면, [Orchestral Testbench](https://github.com/orchestral/testbench) 패키지의 활용을 추천합니다.

<a name="package-discovery"></a>
## 패키지 자동 발견

라라벨 애플리케이션의 `config/app.php` 설정 파일에는 라라벨이 로드해야 하는 서비스 프로바이더의 목록이 `providers` 옵션에 정의되어 있습니다. 여러분의 패키지를 누군가 설치했을 때, 보통 여러분의 서비스 프로바이더도 여기에 자동으로 추가되길 원할 것입니다. 사용자가 수동으로 서비스 프로바이더를 등록하지 않아도 되도록, 패키지의 `composer.json` 파일의 `extra` 섹션에 프로바이더를 정의할 수 있습니다. 서비스 프로바이더 뿐만 아니라 자동으로 등록할 [파사드](/docs/9.x/facades)도 지정할 수 있습니다.

```json
"extra": {
    "laravel": {
        "providers": [
            "Barryvdh\\Debugbar\\ServiceProvider"
        ],
        "aliases": {
            "Debugbar": "Barryvdh\\Debugbar\\Facade"
        }
    }
},
```

패키지가 자동 발견에 맞게 설정되면, 사용자가 패키지를 설치할 때 라라벨이 서비스 프로바이더와 파사드를 자동으로 등록해줍니다. 이를 통해 패키지 사용자에게 더욱 편리한 설치 경험을 제공할 수 있습니다.

<a name="opting-out-of-package-discovery"></a>
### 패키지 자동 발견 사용 안 함

특정 패키지의 자동 발견 기능을 비활성화하고 싶을 때는, 애플리케이션의 `composer.json` 파일의 `extra` 섹션에 해당 패키지명을 추가하면 됩니다.

```json
"extra": {
    "laravel": {
        "dont-discover": [
            "barryvdh/laravel-debugbar"
        ]
    }
},
```

모든 패키지의 자동 발견을 비활성화하고 싶을 때는, `dont-discover` 옵션에 `*`를 명시하면 됩니다.

```json
"extra": {
    "laravel": {
        "dont-discover": [
            "*"
        ]
    }
},
```

<a name="service-providers"></a>
## 서비스 프로바이더

[서비스 프로바이더](/docs/9.x/providers)는 여러분의 패키지와 라라벨을 연결하는 매개체 역할을 합니다. 서비스 프로바이더는 라라벨의 [서비스 컨테이너](/docs/9.x/container)에 바인딩을 추가하거나, 패키지의 뷰나 설정 파일, 다국어 파일 등의 리소스 위치를 지정해줍니다.

서비스 프로바이더는 `Illuminate\Support\ServiceProvider` 클래스를 확장하며, `register`와 `boot` 두 개의 메서드를 구현합니다. 기본 `ServiceProvider` 클래스는 `illuminate/support` Composer 패키지에 포함되어 있으므로, 여러분의 패키지 의존성에 추가해야 합니다. 서비스 프로바이더의 구성과 용도에 대한 자세한 내용은 [공식 문서](/docs/9.x/providers)를 참고하시기 바랍니다.

<a name="resources"></a>
## 리소스

<a name="configuration"></a>
### 설정 파일

일반적으로 패키지의 설정 파일을 애플리케이션의 `config` 디렉터리에 퍼블리시(publish)할 필요가 있습니다. 이를 통해 패키지 사용자가 기본 옵션을 쉽게 오버라이드할 수 있습니다. 패키지 설정 파일을 퍼블리시하도록 하려면, 서비스 프로바이더의 `boot` 메서드에서 `publishes` 메서드를 호출합니다.

```
/**
 * 패키지 서비스 부트스트랩
 *
 * @return void
 */
public function boot()
{
    $this->publishes([
        __DIR__.'/../config/courier.php' => config_path('courier.php'),
    ]);
}
```

이제 패키지 사용자가 라라벨의 `vendor:publish` 명령어를 실행하면, 해당 설정 파일이 지정된 위치로 복사됩니다. 퍼블리시된 설정 파일은 일반 설정 파일처럼 값을 참조할 수 있습니다.

```
$value = config('courier.option');
```

> [!WARNING]
> 설정 파일 안에 클로저(익명 함수)를 정의하지 않아야 합니다. 사용자가 `config:cache` 아티즌 명령어를 실행할 때 정상적으로 직렬화되지 않을 수 있습니다.

<a name="default-package-configuration"></a>
#### 기본 패키지 설정 머지

패키지 자체의 설정 파일을 애플리케이션에 퍼블리시된 설정과 병합(merge)할 수도 있습니다. 이렇게 하면 사용자는 변경이 필요한 옵션만 설정 파일에서 오버라이드 하면 됩니다. 설정 파일 병합은 서비스 프로바이더의 `register` 메서드 내에서 `mergeConfigFrom` 메서드를 사용해 처리합니다.

`mergeConfigFrom` 메서드는 첫 번째 인수로 패키지의 설정 파일 경로, 두 번째 인수로 애플리케이션 내 오버라이드할 설정 파일의 이름을 받습니다.

```
/**
 * 애플리케이션 서비스 등록
 *
 * @return void
 */
public function register()
{
    $this->mergeConfigFrom(
        __DIR__.'/../config/courier.php', 'courier'
    );
}
```

> [!WARNING]
> 이 메서드는 설정 배열의 1단계 항목만 병합합니다. 다차원 배열(중첩 배열)에서 일부 옵션만 오버라이드할 경우, 누락된 옵션은 병합되지 않습니다.

<a name="routes"></a>
### 라우트

패키지에 라우트가 포함되어 있다면, `loadRoutesFrom` 메서드를 사용해 라우트 파일을 불러올 수 있습니다. 이 메서드는 라라벨에서 라우트가 이미 캐시되어 있는지 자동으로 감지하여, 캐시된 경우에는 별도로 라우트 파일을 불러오지 않습니다.

```
/**
 * 패키지 서비스 부트스트랩
 *
 * @return void
 */
public function boot()
{
    $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
}
```

<a name="migrations"></a>
### 마이그레이션

패키지에 [데이터베이스 마이그레이션](/docs/9.x/migrations)이 포함되어 있다면, `loadMigrationsFrom` 메서드를 사용해 마이그레이션 파일을 등록할 수 있습니다. 이 메서드는 패키지 내 마이그레이션 경로를 인수로 받습니다.

```
/**
 * 패키지 서비스 부트스트랩
 *
 * @return void
 */
public function boot()
{
    $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
}
```

패키지의 마이그레이션이 등록되면, `php artisan migrate` 명령어 실행 시 자동으로 마이그레이션이 적용됩니다. 사용자가 별도로 `database/migrations` 디렉터리로 복사할 필요는 없습니다.

<a name="translations"></a>
### 번역

패키지에 [번역 파일](/docs/9.x/localization)이 포함되어 있다면, `loadTranslationsFrom` 메서드를 이용해 라라벨에 번역 파일 위치를 알려줄 수 있습니다. 예를 들어, 패키지명이 `courier`라면 다음과 같이 서비스 프로바이더의 `boot` 메서드에 추가합니다.

```
/**
 * 패키지 서비스 부트스트랩
 *
 * @return void
 */
public function boot()
{
    $this->loadTranslationsFrom(__DIR__.'/../lang', 'courier');
}
```

패키지 번역은 `패키지::파일.라인` 형식의 문법으로 사용합니다. 예를 들어 `courier` 패키지의 `messages` 파일 내 `welcome` 라인을 불러오려면 다음과 같이 합니다.

```
echo trans('courier::messages.welcome');
```

<a name="publishing-translations"></a>
#### 번역 파일 퍼블리싱

패키지의 번역 파일을 애플리케이션의 `lang/vendor` 디렉터리에 퍼블리시할 수도 있습니다. 이 때는 서비스 프로바이더의 `publishes` 메서드를 사용하면 됩니다. `publishes` 메서드는 퍼블리시할 경로와 복사 대상을 배열로 받습니다. 예를 들어, `courier` 패키지의 번역 파일을 퍼블리시하려면 다음과 같이 작성합니다.

```
/**
 * 패키지 서비스 부트스트랩
 *
 * @return void
 */
public function boot()
{
    $this->loadTranslationsFrom(__DIR__.'/../lang', 'courier');

    $this->publishes([
        __DIR__.'/../lang' => $this->app->langPath('vendor/courier'),
    ]);
}
```

이제 패키지 사용자가 `vendor:publish` 아티즌 명령어를 실행할 때, 패키지의 번역 파일이 지정된 위치로 퍼블리시됩니다.

<a name="views"></a>
### 뷰

패키지의 [뷰](/docs/9.x/views)를 라라벨에 등록하려면, 뷰 파일이 어디에 있는지 라라벨에 알려주어야 합니다. 이를 위해 서비스 프로바이더의 `loadViewsFrom` 메서드를 사용합니다. 이 메서드는 뷰 템플릿의 경로와 패키지 이름을 인수로 받습니다. 예를 들어, 패키지명이 `courier`라면 다음과 같이 할 수 있습니다.

```
/**
 * 패키지 서비스 부트스트랩
 *
 * @return void
 */
public function boot()
{
    $this->loadViewsFrom(__DIR__.'/../resources/views', 'courier');
}
```

패키지 뷰는 `패키지::뷰` 형식으로 사용할 수 있습니다. 예를 들어 `courier` 패키지의 `dashboard` 뷰를 사용할 경우 다음과 같이 라우트에서 참조할 수 있습니다.

```
Route::get('/dashboard', function () {
    return view('courier::dashboard');
});
```

<a name="overriding-package-views"></a>
#### 패키지 뷰 오버라이드

`loadViewsFrom`을 사용할 때 라라벨은 실제로 두 위치를 뷰 디렉터리로 등록합니다. 하나는 애플리케이션의 `resources/views/vendor` 디렉터리이고, 다른 하나는 패키지 내부에서 지정한 디렉터리입니다. 예를 들어, `courier` 패키지의 경우 라라벨은 먼저 `resources/views/vendor/courier` 디렉터리에 커스텀 뷰가 존재하는지 확인합니다. 만약 해당 뷰가 없다면, 패키지의 뷰 디렉터리에서 찾아 불러옵니다. 이를 통해 패키지 사용자가 뷰를 쉽게 커스터마이즈하거나 오버라이드할 수 있습니다.

<a name="publishing-views"></a>
#### 뷰 퍼블리싱

패키지의 뷰 파일을 애플리케이션의 `resources/views/vendor` 디렉터리로 퍼블리싱할 수도 있습니다. 이 경우 서비스 프로바이더의 `publishes` 메서드를 이용해 뷰 경로와 복사 대상을 배열로 넘깁니다.

```
/**
 * 패키지 서비스 부트스트랩
 *
 * @return void
 */
public function boot()
{
    $this->loadViewsFrom(__DIR__.'/../resources/views', 'courier');

    $this->publishes([
        __DIR__.'/../resources/views' => resource_path('views/vendor/courier'),
    ]);
}
```

이제 패키지 사용자가 `vendor:publish` 명령어를 실행하면, 패키지의 뷰가 지정한 위치로 퍼블리시됩니다.

<a name="view-components"></a>
### 뷰 컴포넌트

패키지에 Blade 컴포넌트를 포함시키거나, 컴포넌트를 표준 경로가 아닌 다른 디렉터리에 둘 계획이라면, 컴포넌트 클래스와 해당 HTML 태그 별칭을 직접 등록해야 합니다. 보통 서비스 프로바이더의 `boot` 메서드에서 컴포넌트를 등록합니다.

```
use Illuminate\Support\Facades\Blade;
use VendorPackage\View\Components\AlertComponent;

/**
 * 패키지 서비스 부트스트랩
 *
 * @return void
 */
public function boot()
{
    Blade::component('package-alert', AlertComponent::class);
}
```

컴포넌트가 등록되면, 다음과 같이 태그 별칭으로 바로 사용할 수 있습니다.

```blade
<x-package-alert/>
```

<a name="autoloading-package-components"></a>
#### 패키지 컴포넌트 자동 로딩

또는, `componentNamespace` 메서드를 사용하면 컴포넌트 클래스를 네임스페이스 규칙에 따라 자동으로 불러올 수 있습니다. 예를 들어 `Nightshade` 패키지에 `Nightshade\Views\Components` 네임스페이스 내에 `Calendar`와 `ColorPicker` 컴포넌트가 있다고 가정해 봅니다.

```
use Illuminate\Support\Facades\Blade;

/**
 * 패키지 서비스 부트스트랩
 *
 * @return void
 */
public function boot()
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

이렇게 하면, 벤더 네임스페이스를 사용하여 `package-name::` 형식으로 패키지 컴포넌트를 사용할 수 있습니다.

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade는 컴포넌트 이름을 파스칼 케이스로 변환하여 자동으로 관련 클래스를 찾습니다. "dot" 표기법을 활용한 하위 디렉터리도 지원됩니다.

<a name="anonymous-components"></a>
#### 익명 컴포넌트

패키지에 익명 컴포넌트가 있다면, 해당 컴포넌트는 반드시 패키지의 "뷰" 디렉터리 내 `components` 폴더 아래에 위치해야 합니다(이 위치는 [`loadViewsFrom` 메서드](#views)에서 지정합니다). 그리고 컴포넌트 사용 시 패키지의 뷰 네임스페이스로 이름을 접두어로 붙여서 사용할 수 있습니다.

```blade
<x-courier::alert />
```

<a name="about-artisan-command"></a>
### "About" 아티즌 명령어

라라벨에 내장된 `about` 아티즌 명령어는 애플리케이션 환경 및 설정 개요를 제공합니다. 패키지는 `AboutCommand` 클래스를 이용해 이 명령어의 출력에 추가적인 정보를 표시할 수 있습니다. 일반적으로 이 작업은 패키지 서비스 프로바이더의 `boot` 메서드에서 처리합니다.

```
use Illuminate\Foundation\Console\AboutCommand;

/**
 * 애플리케이션 서비스 부트스트랩
 *
 * @return void
 */
public function boot()
{
    AboutCommand::add('My Package', fn () => ['Version' => '1.0.0']);
}
```

<a name="commands"></a>
## 명령어

패키지에서 제공하는 아티즌 명령어를 라라벨에 등록하려면 `commands` 메서드를 이용합니다. 이 메서드는 커맨드 클래스 이름 배열을 인수로 받습니다. 커맨드를 등록한 후에는, [Artisan CLI](/docs/9.x/artisan)를 통해 명령어를 실행할 수 있습니다.

```
use Courier\Console\Commands\InstallCommand;
use Courier\Console\Commands\NetworkCommand;

/**
 * 패키지 서비스 부트스트랩
 *
 * @return void
 */
public function boot()
{
    if ($this->app->runningInConsole()) {
        $this->commands([
            InstallCommand::class,
            NetworkCommand::class,
        ]);
    }
}
```

<a name="public-assets"></a>
## 퍼블릭 에셋

패키지에는 JavaScript, CSS, 이미지 등 퍼블릭 에셋이 포함될 수 있습니다. 이런 에셋을 애플리케이션의 `public` 디렉터리로 퍼블리시하려면 서비스 프로바이더의 `publishes` 메서드를 사용합니다. 예시에서는 관련 에셋 그룹 태그 `public`도 함께 추가합니다. 이 태그를 사용하면 관련 에셋들만 쉽게 퍼블리시할 수 있습니다.

```
/**
 * 패키지 서비스 부트스트랩
 *
 * @return void
 */
public function boot()
{
    $this->publishes([
        __DIR__.'/../public' => public_path('vendor/courier'),
    ], 'public');
}
```

이제 패키지 사용자가 `vendor:publish` 명령어를 실행하면 에셋 파일이 지정한 위치로 복사됩니다. 패키지가 업데이트될 때마다 에셋 파일을 덮어써야 할 경우가 많으므로, 명령어에 `--force` 플래그를 추가해서 퍼블리시할 수 있습니다.

```shell
php artisan vendor:publish --tag=public --force
```

<a name="publishing-file-groups"></a>
## 파일 그룹 퍼블리싱

패키지의 리소스와 에셋을 그룹별로 별도로 퍼블리시하고 싶을 수 있습니다. 예를 들어, 패키지의 설정 파일만 퍼블리시하고 에셋은 퍼블리시하지 않도록 할 수도 있습니다. 이런 경우 서비스 프로바이더에서 `publishes` 메서드 사용 시 "태그(tag)"를 붙여 그룹을 나눌 수 있습니다. 아래는 `courier` 패키지에서 (`courier-config`, `courier-migrations`) 두 개의 퍼블리시 그룹을 만드는 예시입니다.

```
/**
 * 패키지 서비스 부트스트랩
 *
 * @return void
 */
public function boot()
{
    $this->publishes([
        __DIR__.'/../config/package.php' => config_path('package.php')
    ], 'courier-config');

    $this->publishes([
        __DIR__.'/../database/migrations/' => database_path('migrations')
    ], 'courier-migrations');
}
```

이제 사용자는 `vendor:publish` 명령어에 해당 태그를 지정하여 각 그룹을 선택적으로 퍼블리시할 수 있습니다.

```shell
php artisan vendor:publish --tag=courier-config
```
