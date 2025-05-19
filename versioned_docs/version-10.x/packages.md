# 패키지 개발 (Package Development)

- [소개](#introduction)
    - [파사드에 대한 참고 사항](#a-note-on-facades)
- [패키지 자동 발견](#package-discovery)
- [서비스 프로바이더](#service-providers)
- [리소스](#resources)
    - [설정 파일](#configuration)
    - [마이그레이션](#migrations)
    - [라우트](#routes)
    - [언어 파일](#language-files)
    - [뷰](#views)
    - [뷰 컴포넌트](#view-components)
    - ["About" 아티즌 명령어](#about-artisan-command)
- [명령어](#commands)
- [퍼블릭 에셋](#public-assets)
- [파일 그룹 퍼블리싱](#publishing-file-groups)

<a name="introduction"></a>
## 소개

패키지는 라라벨에 추가 기능을 더하는 주된 방법입니다. 패키지는 [Carbon](https://github.com/briannesbitt/Carbon)처럼 날짜를 다루기 좋은 방법을 제공하거나, Spatie의 [Laravel Media Library](https://github.com/spatie/laravel-medialibrary)처럼 Eloquent 모델에 파일을 연관시킬 수 있게 해 주는 등 다양한 목적을 가질 수 있습니다.

패키지는 여러 종류가 있습니다. 일부 패키지는 독립형(stand-alone)이며, 어떤 PHP 프레임워크에서도 사용할 수 있습니다. Carbon과 PHPUnit이 그 예입니다. 이러한 패키지는 `composer.json` 파일에 추가하기만 하면 라라벨에서도 사용할 수 있습니다.

반면, 라라벨 전용으로 개발된 패키지들도 있습니다. 이러한 패키지는 라라벨 애플리케이션을 확장할 수 있도록 라우트, 컨트롤러, 뷰, 설정 파일 등을 함께 제공합니다. 이 문서는 주로 라라벨에 특화된 그런 패키지 개발 방법을 다룹니다.

<a name="a-note-on-facades"></a>
### 파사드에 대한 참고 사항

라라벨 애플리케이션을 개발할 때는 contracts(계약)나 파사드(facade) 중 어떤 것을 사용해도 테스트 가능성이 거의 동일하기 때문에 큰 차이가 없습니다. 하지만 패키지를 개발할 때는 라라벨의 테스트 헬퍼 전체에 항상 접근할 수 없는 경우가 많습니다. 패키지 테스트도 일반 라라벨 애플리케이션에 설치된 것처럼 작성하고 싶다면, [Orchestral Testbench](https://github.com/orchestral/testbench) 패키지를 사용할 수 있습니다.

<a name="package-discovery"></a>
## 패키지 자동 발견

라라벨 애플리케이션의 `config/app.php` 설정 파일에는 `providers` 옵션이 있으며, 여기에 라라벨이 로드할 서비스 프로바이더 목록을 정의합니다. 사용자가 패키지를 설치할 때, 보통 패키지의 서비스 프로바이더도 이 목록에 포함되기를 원할 것입니다. 사용자가 직접 서비스 프로바이더를 리스트에 추가하도록 요구하지 않고, 패키지의 `composer.json` 파일의 `extra` 섹션에 프로바이더를 정의할 수 있습니다. 또한 서비스 프로바이더 외에도 등록하고 싶은 [파사드](/docs/10.x/facades)도 함께 명시할 수 있습니다:

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

패키지가 자동 발견을 위해 이렇게 설정되면, 라라벨은 패키지가 설치될 때 자동으로 서비스 프로바이더와 파사드를 등록해줍니다. 이를 통해 패키지 사용자에게 더 편리한 설치 경험을 제공할 수 있습니다.

<a name="opting-out-of-package-discovery"></a>
#### 패키지 자동 발견 제외하기

패키지를 사용하는 입장이고 특정 패키지의 자동 발견을 끄고 싶다면, 애플리케이션의 `composer.json` 파일의 `extra` 섹션에서 패키지 이름을 명시할 수 있습니다:

```json
"extra": {
    "laravel": {
        "dont-discover": [
            "barryvdh/laravel-debugbar"
        ]
    }
},
```

애플리케이션의 `dont-discover` 디렉티브에 `*` 문자를 사용하면, 모든 패키지의 자동 발견을 한 번에 비활성화할 수 있습니다:

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

[서비스 프로바이더](/docs/10.x/providers)는 패키지와 라라벨을 연결하는 지점입니다. 서비스 프로바이더는 라라벨의 [서비스 컨테이너](/docs/10.x/container)에 다양한 객체를 바인딩하거나, 뷰, 설정, 언어 파일 등 패키지의 리소스를 어디서 로드할지 라라벨에 알려주는 역할을 합니다.

서비스 프로바이더는 `Illuminate\Support\ServiceProvider` 클래스를 상속하며, `register`와 `boot`라는 두 가지 메서드를 가지고 있습니다. 기본 `ServiceProvider` 클래스는 `illuminate/support` Composer 패키지에 포함되어 있으니, 자신의 패키지 의존성 목록에 추가해야 합니다. 서비스 프로바이더의 구조와 용도에 대한 자세한 내용은 [공식 문서](/docs/10.x/providers)를 참고하세요.

<a name="resources"></a>
## 리소스

<a name="configuration"></a>
### 설정 파일

보통 패키지의 설정 파일은 애플리케이션의 `config` 디렉터리로 퍼블리시(publish)할 필요가 있습니다. 이를 통해 패키지 사용자가 기본 설정 값을 손쉽게 수정할 수 있습니다. 설정 파일을 퍼블리시할 수 있도록 하려면, 서비스 프로바이더의 `boot` 메서드에서 `publishes` 메서드를 호출합니다:

```
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->publishes([
        __DIR__.'/../config/courier.php' => config_path('courier.php'),
    ]);
}
```

이제 패키지 사용자가 라라벨의 `vendor:publish` 명령어를 실행하면, 설정 파일이 지정한 위치로 복사됩니다. 설정 파일이 퍼블리시되고 나면, 일반 설정 파일과 동일하게 값을 참조할 수 있습니다:

```
$value = config('courier.option');
```

> [!WARNING]
> 설정 파일에 클로저(익명 함수)를 정의해서는 안 됩니다. 사용자들이 `config:cache` 아티즌 명령어를 실행할 때 클로저는 올바르게 직렬화(serialize)되지 않습니다.

<a name="default-package-configuration"></a>
#### 기본 패키지 설정 병합

패키지의 기본 설정 파일을 애플리케이션에 퍼블리시된 복사본과 병합할 수도 있습니다. 이를 통해 사용자는 오버라이드하려는 옵션만 직접 설정 파일에 작성하면 됩니다. 설정 파일 값을 병합하려면 서비스 프로바이더의 `register` 메서드에서 `mergeConfigFrom` 메서드를 사용하세요.

`mergeConfigFrom` 메서드는 첫 번째 인수로 패키지 설정 파일 경로를, 두 번째 인수로 애플리케이션 설정 파일의 이름을 받습니다:

```
/**
 * Register any application services.
 */
public function register(): void
{
    $this->mergeConfigFrom(
        __DIR__.'/../config/courier.php', 'courier'
    );
}
```

> [!WARNING]
> 이 방법은 설정 배열의 최상위 레벨만 병합합니다. 사용자가 다차원 배열의 일부만 정의한 경우, 누락된 옵션은 병합되지 않습니다.

<a name="routes"></a>
### 라우트

패키지에 라우트가 포함되어 있다면, `loadRoutesFrom` 메서드를 사용해 라우트를 등록할 수 있습니다. 이 메서드는 애플리케이션의 라우트가 캐시되어 있는지도 자동으로 확인하며, 라우트가 이미 캐시된 경우에는 라우트 파일을 별도로 로드하지 않습니다:

```
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
}
```

<a name="migrations"></a>
### 마이그레이션

패키지에 [데이터베이스 마이그레이션](/docs/10.x/migrations)이 포함되어 있다면, `loadMigrationsFrom` 메서드를 사용해 라라벨에 마이그레이션을 등록할 수 있습니다. `loadMigrationsFrom` 메서드는 패키지의 마이그레이션 경로를 인수로 받습니다:

```
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
}
```

패키지의 마이그레이션이 등록되면, `php artisan migrate` 명령어를 실행할 때 별도의 이동 없이 자동으로 마이그레이션이 실행됩니다. 애플리케이션의 `database/migrations` 디렉터리로 마이그레이션 파일을 내보낼 필요는 없습니다.

<a name="language-files"></a>
### 언어 파일

패키지에 [언어 파일](/docs/10.x/localization)이 포함되어 있다면, `loadTranslationsFrom` 메서드를 사용해 라라벨에 해당 위치를 알려줄 수 있습니다. 예를 들어 패키지 이름이 `courier`라면, 서비스 프로바이더의 `boot` 메서드에 다음과 같이 추가합니다:

```
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadTranslationsFrom(__DIR__.'/../lang', 'courier');
}
```

패키지 내 번역문은 `패키지::파일.라인` 형식의 문법으로 참조합니다. 따라서, `courier` 패키지의 `messages` 파일 안에 있는 `welcome` 번역문을 다음과 같이 불러올 수 있습니다:

```
echo trans('courier::messages.welcome');
```

패키지의 JSON 번역 파일을 등록하려면 `loadJsonTranslationsFrom` 메서드를 사용하세요. 이 메서드는 JSON 번역 파일이 있는 디렉터리 경로를 인수로 받습니다:

```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadJsonTranslationsFrom(__DIR__.'/../lang');
}
```

<a name="publishing-language-files"></a>
#### 언어 파일 퍼블리싱

패키지의 언어 파일을 애플리케이션의 `lang/vendor` 디렉터리로 퍼블리시하려면, 서비스 프로바이더의 `publishes` 메서드를 사용하면 됩니다. `publishes` 메서드는 패키지의 경로와 복사 위치를 배열로 받습니다. 예를 들어 `courier` 패키지의 언어 파일을 퍼블리시하려면 다음과 같이 합니다:

```
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadTranslationsFrom(__DIR__.'/../lang', 'courier');

    $this->publishes([
        __DIR__.'/../lang' => $this->app->langPath('vendor/courier'),
    ]);
}
```

이제 패키지 사용자가 라라벨의 `vendor:publish` 아티즌 명령어를 실행하면, 패키지의 언어 파일이 지정한 퍼블리시 위치로 복사됩니다.

<a name="views"></a>
### 뷰

패키지의 [뷰](/docs/10.x/views)를 라라벨에서 사용할 수 있도록 하려면, 뷰 파일이 위치한 경로를 라라벨에 알려주어야 합니다. 이를 위해 서비스 프로바이더의 `loadViewsFrom` 메서드를 사용합니다. 이 메서드는 뷰 파일의 경로와 패키지 이름, 두 가지 인수를 받습니다. 예를 들어 패키지 이름이 `courier`라면 다음과 같이 서비스 프로바이더의 `boot` 메서드에 추가할 수 있습니다:

```
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadViewsFrom(__DIR__.'/../resources/views', 'courier');
}
```

패키지 뷰는 `package::view` 형식의 문법으로 참조할 수 있습니다. 예를 들어 `courier` 패키지의 `dashboard` 뷰를 사용하려면 다음과 같이 호출합니다:

```
Route::get('/dashboard', function () {
    return view('courier::dashboard');
});
```

<a name="overriding-package-views"></a>
#### 패키지 뷰 오버라이드

`loadViewsFrom` 메서드를 사용하면, 라라벨은 실제로 두 위치에 대해 뷰를 검색하게 됩니다: 애플리케이션의 `resources/views/vendor` 디렉터리와, 지정한 패키지 뷰 디렉터리입니다. 예를 들어 `courier` 패키지의 경우, 라라벨은 먼저 개발자가 `resources/views/vendor/courier` 디렉터리에 커스텀 뷰를 추가했는지 확인하고, 없다면 지정한 패키지 뷰 디렉터리를 참조합니다. 이 방식 덕분에 패키지 사용자는 손쉽게 패키지 뷰를 커스터마이즈하거나 오버라이드할 수 있습니다.

<a name="publishing-views"></a>
#### 뷰 퍼블리싱

패키지의 뷰 파일을 애플리케이션의 `resources/views/vendor` 디렉터리로 퍼블리시할 수 있게 하려면, 서비스 프로바이더의 `publishes` 메서드를 사용하면 됩니다. 이 메서드는 패키지의 뷰 경로와, 복사할 위치를 배열로 받습니다:

```
/**
 * Bootstrap the package services.
 */
public function boot(): void
{
    $this->loadViewsFrom(__DIR__.'/../resources/views', 'courier');

    $this->publishes([
        __DIR__.'/../resources/views' => resource_path('views/vendor/courier'),
    ]);
}
```

이제 패키지 사용자가 `vendor:publish` 아티즌 명령어를 실행하면, 패키지의 뷰가 지정한 위치로 복사됩니다.

<a name="view-components"></a>
### 뷰 컴포넌트

패키지에서 Blade 컴포넌트를 사용하거나, 컴포넌트를 일반적인 디렉터리 이외의 위치에 둘 경우, 컴포넌트 클래스와 HTML 태그 별칭을 직접 등록해야 라라벨이 해당 컴포넌트를 인식할 수 있습니다. 보통 패키지 서비스 프로바이더의 `boot` 메서드에서 컴포넌트를 등록하게 됩니다:

```
use Illuminate\Support\Facades\Blade;
use VendorPackage\View\Components\AlertComponent;

/**
 * Bootstrap your package's services.
 */
public function boot(): void
{
    Blade::component('package-alert', AlertComponent::class);
}
```

컴포넌트를 등록하고 나면, 별칭 태그를 통해 Blade에서 해당 컴포넌트를 사용할 수 있습니다:

```blade
<x-package-alert/>
```

<a name="autoloading-package-components"></a>
#### 패키지 컴포넌트 자동 로드

또는 `componentNamespace` 메서드를 사용해 네임스페이스 별로 컴포넌트 클래스를 자동으로 로드할 수도 있습니다. 예를 들어, `Nightshade` 패키지에 `Calendar`와 `ColorPicker` 컴포넌트가 있고, 이들이 `Nightshade\Views\Components` 네임스페이스에 있다면 다음과 같이 등록합니다:

```
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap your package's services.
 */
public function boot(): void
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

이렇게 하면 `package-name::` 문법을 사용해 벤더 네임스페이스로 패키지 컴포넌트를 사용할 수 있습니다:

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade는 컴포넌트 이름을 파스칼 케이스로 변환해 해당 클래스를 자동으로 찾습니다. 또한, 하위 디렉터리도 "dot" 표기법으로 지원합니다.

<a name="anonymous-components"></a>
#### 익명 컴포넌트

패키지에 익명(anonymous) Blade 컴포넌트가 있다면, 반드시 "views" 디렉터리 내에 `components`라는 하위 디렉터리에 두어야 합니다([`loadViewsFrom` 메서드](#views)에 지정한 경로 기준). 이후 뷰 네임스페이스를 컴포넌트명 앞에 붙여 렌더링할 수 있습니다:

```blade
<x-courier::alert />
```

<a name="about-artisan-command"></a>
### "About" 아티즌 명령어

라라벨의 기본 내장 아티즌 명령어인 `about`은 애플리케이션의 환경 및 설정 요약 정보를 제공합니다. 패키지는 `AboutCommand` 클래스를 통해 이 명령어의 출력에 추가 정보를 표시할 수 있습니다. 일반적으로, 패키지의 서비스 프로바이더 `boot` 메서드 내에서 정보를 등록합니다:

```
use Illuminate\Foundation\Console\AboutCommand;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    AboutCommand::add('My Package', fn () => ['Version' => '1.0.0']);
}
```

<a name="commands"></a>
## 명령어

패키지에서 제공하는 아티즌 명령어를 라라벨에 등록하려면, 서비스 프로바이더의 `commands` 메서드를 사용합니다. 이 메서드는 명령어 클래스 이름이 담긴 배열을 인수로 받습니다. 명령어가 등록되고 나면 [아티즌 CLI](/docs/10.x/artisan)를 통해 명령어를 사용할 수 있습니다:

```
use Courier\Console\Commands\InstallCommand;
use Courier\Console\Commands\NetworkCommand;

/**
 * Bootstrap any package services.
 */
public function boot(): void
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

패키지에 JavaScript, CSS, 이미지와 같은 에셋 파일이 포함되어 있을 수 있습니다. 이런 파일을 애플리케이션의 `public` 디렉터리로 퍼블리시하려면, 서비스 프로바이더의 `publishes` 메서드를 사용하세요. 아래 예시에서는 `public` 에셋 그룹 태그도 추가하는데, 이는 연관된 에셋 그룹을 간편하게 퍼블리시할 때 유용합니다:

```
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->publishes([
        __DIR__.'/../public' => public_path('vendor/courier'),
    ], 'public');
}
```

이제 패키지 사용자가 `vendor:publish` 명령어를 실행하면, 에셋 파일이 지정한 위치로 복사됩니다. 패키지 업데이트마다 사용자가 에셋을 덮어써야 할 경우가 많기 때문에, `--force` 플래그를 사용하면 도움이 됩니다:

```shell
php artisan vendor:publish --tag=public --force
```

<a name="publishing-file-groups"></a>
## 파일 그룹 퍼블리싱

패키지의 에셋과 리소스들을 여러 그룹으로 나누어 각각 따로 퍼블리시 할 수 있도록 할 수도 있습니다. 예를 들어, 패키지의 설정 파일만 따로 퍼블리시할 수 있게 하거나, 모든 에셋을 함께 퍼블리시하지 않아도 되도록 할 수 있습니다. 서비스 프로바이더의 `publishes` 메서드를 호출하면서 "태그"를 지정하여 퍼블리시 그룹을 만들 수 있습니다. 아래는 `courier` 패키지의 설정 파일과 마이그레이션을 퍼블리시하는 각각의 그룹(`courier-config`, `courier-migrations`)을 정의하는 예시입니다:

```
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->publishes([
        __DIR__.'/../config/package.php' => config_path('package.php')
    ], 'courier-config');

    $this->publishes([
        __DIR__.'/../database/migrations/' => database_path('migrations')
    ], 'courier-migrations');
}
```

이제 사용자는 각각의 퍼블리시 그룹 태그를 지정해 특정 리소스만 퍼블리시할 수 있습니다:

```shell
php artisan vendor:publish --tag=courier-config
```
