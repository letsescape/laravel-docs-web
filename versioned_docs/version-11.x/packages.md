# 패키지 개발 (Package Development)

- [소개](#introduction)
    - [파사드에 관한 참고 사항](#a-note-on-facades)
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
    - [Optimize 명령어](#optimize-commands)
- [퍼블릭 자산](#public-assets)
- [파일 그룹 퍼블리싱](#publishing-file-groups)

<a name="introduction"></a>
## 소개

패키지는 라라벨에 기능을 추가하는 주요 방법입니다. 패키지는 [Carbon](https://github.com/briannesbitt/Carbon)처럼 날짜를 다루는 유용한 도구일 수도 있고, Spatie의 [Laravel Media Library](https://github.com/spatie/laravel-medialibrary)처럼 파일을 Eloquent 모델에 연동할 수 있도록 해주는 패키지일 수도 있습니다.

패키지는 크게 두 가지 유형이 있습니다. 어떤 패키지는 독립형 패키지로, 모든 PHP 프레임워크에서 사용할 수 있습니다. Carbon이나 Pest가 그 예입니다. 이러한 패키지 중 어떤 것이든 `composer.json` 파일에 추가(require)하여 라라벨에서 사용할 수 있습니다.

한편, 일부 패키지는 라라벨만을 위해 특별히 설계된 경우가 있습니다. 이러한 패키지는 라라벨 애플리케이션에서만 동작을 강화하기 위한 라우트, 컨트롤러, 뷰, 설정 파일 등을 포함할 수 있습니다. 이 가이드에서는 주로 라라벨 전용 패키지를 개발하는 방법에 대해 다룹니다.

<a name="a-note-on-facades"></a>
### 파사드에 관한 참고 사항

라라벨 애플리케이션을 개발할 때는 contract(컨트랙트)와 facade(파사드) 중 어떤 것을 사용해도 테스트 가능성 측면에서 거의 차이가 없습니다. 하지만 패키지를 개발할 때는 라라벨의 모든 테스트 헬퍼에 접근할 수 없을 수 있습니다. 만약 여러분의 패키지 테스트를 일반적인 라라벨 애플리케이션에 설치된 것처럼 작성하고 싶다면, [Orchestral Testbench](https://github.com/orchestral/testbench) 패키지를 사용할 수 있습니다.

<a name="package-discovery"></a>
## 패키지 자동 발견

라라벨 애플리케이션의 `bootstrap/providers.php` 파일에는 라라벨이 불러올 서비스 프로바이더 목록이 포함되어 있습니다. 하지만 패키지 사용자가 직접 서비스 프로바이더를 목록에 추가하지 않도록, 패키지의 `composer.json` 파일 `extra` 섹션에 프로바이더를 정의해서 라라벨이 자동으로 불러오도록 할 수 있습니다. 서비스 프로바이더뿐만 아니라, 등록하고 싶은 [파사드](/docs/11.x/facades)도 함께 지정할 수 있습니다.

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

패키지에서 자동 발견 설정을 마치면, 라라벨은 패키지가 설치될 때 해당 서비스 프로바이더와 파사드를 자동으로 등록합니다. 이를 통해 패키지 사용자는 보다 손쉽게 패키지를 설치할 수 있습니다.

<a name="opting-out-of-package-discovery"></a>
#### 패키지 자동 발견 비활성화

패키지를 사용하는 입장에서 패키지 자동 발견을 비활성화하고 싶을 때는, 애플리케이션의 `composer.json` 파일 `extra` 섹션에 패키지 이름을 추가하면 됩니다.

```json
"extra": {
    "laravel": {
        "dont-discover": [
            "barryvdh/laravel-debugbar"
        ]
    }
},
```

애플리케이션의 `dont-discover` 지시문에 `*` 문자를 사용하면 모든 패키지의 자동 발견을 끌 수도 있습니다.

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

[서비스 프로바이더](/docs/11.x/providers)는 여러분의 패키지와 라라벨 사이의 연결 지점입니다. 서비스 프로바이더는 라라벨의 [서비스 컨테이너](/docs/11.x/container)에 다양한 기능을 바인딩하거나, 뷰, 설정, 언어 파일 등 패키지의 리소스를 어디에서 불러올지 알려주는 역할을 합니다.

서비스 프로바이더는 `Illuminate\Support\ServiceProvider` 클래스를 상속하며, `register`와 `boot`라는 두 개의 메서드를 가집니다. 기본 `ServiceProvider` 클래스는 `illuminate/support` Composer 패키지에 있으니, 여러분의 패키지 의존성에 해당 패키지를 추가해야 합니다. 서비스 프로바이더의 구조와 목적에 대해 더 자세히 알고 싶다면 [관련 문서](/docs/11.x/providers)를 참고하시기 바랍니다.

<a name="resources"></a>
## 리소스

<a name="configuration"></a>
### 설정 파일

대부분의 경우, 패키지의 설정 파일을 애플리케이션의 `config` 디렉터리로 퍼블리싱할 필요가 있습니다. 이렇게 하면 패키지 사용자가 제공한 기본 설정을 쉽게 덮어쓸 수 있습니다. 설정 파일을 퍼블리시하려면, 서비스 프로바이더의 `boot` 메서드에서 `publishes` 메서드를 호출합니다.

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

이제 패키지 사용자가 라라벨의 `vendor:publish` 명령어를 실행하면, 해당 파일이 지정된 위치로 복사됩니다. 설정이 퍼블리시된 후에는, 일반 설정 파일처럼 값을 사용할 수 있습니다.

```
$value = config('courier.option');
```

> [!WARNING]  
> 설정 파일 내에 클로저를 정의하면 안 됩니다. 사용자가 `config:cache` 아티즌 명령어를 실행할 때 클로저가 올바르게 직렬화되지 않습니다.

<a name="default-package-configuration"></a>
#### 기본 패키지 설정 병합

패키지의 설정 파일을 애플리케이션에 퍼블리시했더라도, 기본 값을 병합해서 사용자가 오버라이드하고 싶은 옵션만 덮어쓸 수 있도록 할 수도 있습니다. 이를 위해서는 서비스 프로바이더의 `register` 메서드에서 `mergeConfigFrom` 메서드를 사용합니다.

`mergeConfigFrom` 메서드는 첫 번째 인자로 패키지 설정 파일 경로를, 두 번째 인자로 애플리케이션 설정 파일명을 받습니다.

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
> 이 방법은 설정 배열의 1차원(최상위) 배열만 병합됩니다. 사용자가 다차원 설정 배열을 부분적으로 정의하면, 빠진 옵션은 병합되지 않습니다.

<a name="routes"></a>
### 라우트

패키지에 라우트가 포함되어 있다면, `loadRoutesFrom` 메서드를 사용해서 로드할 수 있습니다. 이 메서드는 애플리케이션의 라우트 캐시 여부를 자동으로 확인해서, 이미 캐시되어 있으면 패키지 라우트 파일을 로드하지 않습니다.

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

패키지에 [데이터베이스 마이그레이션](/docs/11.x/migrations)이 포함되어 있다면, `publishesMigrations` 메서드를 사용해 해당 디렉터리나 파일에 마이그레이션이 있음을 라라벨에 알릴 수 있습니다. 라라벨이 마이그레이션을 퍼블리시할 때는 파일명에 현재 날짜와 시간이 자동으로 반영됩니다.

```
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->publishesMigrations([
        __DIR__.'/../database/migrations' => database_path('migrations'),
    ]);
}
```

<a name="language-files"></a>
### 언어 파일

패키지에 [언어 파일](/docs/11.x/localization)이 포함되어 있다면, `loadTranslationsFrom` 메서드를 사용해 라라벨에서 해당 파일을 어떻게 불러올지 지정할 수 있습니다. 예를 들어, 패키지 이름이 `courier`라면, 서비스 프로바이더의 `boot` 메서드에 아래와 같이 추가하면 됩니다.

```
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadTranslationsFrom(__DIR__.'/../lang', 'courier');
}
```

패키지 번역 문구는 `패키지::파일.문구` 형식으로 참조할 수 있습니다. 예를 들어, `courier` 패키지의 `messages` 파일에 있는 `welcome` 문구를 불러올 때는 다음과 같이 사용합니다.

```
echo trans('courier::messages.welcome');
```

패키지용 JSON 번역 파일을 등록하려면 `loadJsonTranslationsFrom` 메서드를 사용할 수 있습니다. 이 메서드는 패키지의 JSON 번역 파일이 들어 있는 디렉터리 경로를 인자로 받습니다.

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

패키지의 언어 파일을 애플리케이션의 `lang/vendor` 디렉터리로 퍼블리싱하고 싶다면, 서비스 프로바이더의 `publishes` 메서드를 사용할 수 있습니다. `publishes` 메서드는 패키지 파일 경로와 원하는 퍼블리시 위치를 배열로 받습니다. 예를 들어, `courier` 패키지의 언어 파일을 퍼블리싱하려면 다음과 같이 합니다.

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

이제 패키지 사용자가 라라벨의 `vendor:publish` 아티즌 명령어를 실행하면, 패키지의 언어 파일이 지정한 위치로 퍼블리시됩니다.

<a name="views"></a>
### 뷰

패키지의 [뷰](/docs/11.x/views)를 라라벨에 등록하려면, 뷰가 어디에 있는지 라라벨에 알려줘야 합니다. 서비스 프로바이더의 `loadViewsFrom` 메서드를 사용하면 됩니다. `loadViewsFrom`는 두 개의 인자를 받으며, 하나는 뷰 템플릿 경로이고 다른 하나는 패키지 이름입니다. 패키지 이름이 `courier`라면 아래 예시와 같이 작성합니다.

```
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadViewsFrom(__DIR__.'/../resources/views', 'courier');
}
```

패키지 뷰는 `패키지::뷰` 형식으로 참조할 수 있습니다. 서비스 프로바이더에서 뷰 경로가 등록되면, 예를 들어 `courier` 패키지의 `dashboard` 뷰를 불러올 때는 아래와 같이 할 수 있습니다.

```
Route::get('/dashboard', function () {
    return view('courier::dashboard');
});
```

<a name="overriding-package-views"></a>
#### 패키지 뷰 오버라이드

`loadViewsFrom` 메서드를 사용하면, 라라벨은 실제로 두 개의 경로를 뷰 위치로 등록합니다. 첫 번째는 애플리케이션의 `resources/views/vendor` 디렉터리이고, 두 번째는 여러분이 지정한 디렉터리입니다. 예를 들어, `courier` 패키지라면 라라벨은 먼저 개발자가 `resources/views/vendor/courier` 디렉터리에 커스텀 뷰를 두었는지 확인하고, 없으면 패키지의 뷰 디렉터리를 사용합니다. 이 방식 덕분에 패키지 사용자는 패키지 뷰를 손쉽게 커스터마이즈/오버라이드할 수 있습니다.

<a name="publishing-views"></a>
#### 뷰 퍼블리싱

패키지의 뷰를 애플리케이션 `resources/views/vendor` 디렉터리로 퍼블리싱할 수 있도록 하려면, 서비스 프로바이더의 `publishes` 메서드를 사용합니다. `publishes` 메서드는 패키지 뷰 경로와 원하는 퍼블리시 위치를 배열로 받습니다.

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

이제 패키지 사용자가 라라벨의 `vendor:publish` 아티즌 명령어를 실행하면, 패키지의 뷰가 지정된 위치로 복사됩니다.

<a name="view-components"></a>
### 뷰 컴포넌트

패키지에 Blade 컴포넌트를 포함하거나, 표준이 아닌 디렉터리 위치에 컴포넌트를 두는 경우에는 컴포넌트 클래스와 HTML 태그 별칭을 직접 등록해야 라라벨이 해당 컴포넌트를 올바르게 사용할 수 있습니다. 일반적으로 서비스 프로바이더의 `boot` 메서드에서 컴포넌트를 등록합니다.

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

등록이 완료되면, 지정한 태그 별칭을 사용해 컴포넌트를 렌더링할 수 있습니다.

```blade
<x-package-alert/>
```

<a name="autoloading-package-components"></a>
#### 패키지 컴포넌트 자동 로딩

또 다른 방법으로, `componentNamespace` 메서드를 사용해 컴포넌트 클래스를 관례적으로 자동 로딩할 수도 있습니다. 예를 들어, `Nightshade` 패키지에 `Nightshade\Views\Components` 네임스페이스 아래에 `Calendar`, `ColorPicker` 컴포넌트가 있다면 다음과 같이 등록할 수 있습니다.

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

이렇게 하면, 패키지 벤더 네임스페이스를 활용한 `package-name::` 문법으로 컴포넌트를 사용할 수 있습니다.

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade는 컴포넌트 이름을 파스칼 케이스로 변환해 자동으로 해당 클래스와 연결합니다. 서브디렉터리도 "dot" 표기법을 사용해서 지원됩니다.

<a name="anonymous-components"></a>
#### 익명 컴포넌트

패키지에 익명 컴포넌트가 포함되어 있다면, 컴포넌트는 반드시 패키지 "views" 디렉터리의 `components` 폴더 안에 배치해야 합니다([`loadViewsFrom` 메서드](#views)에서 지정한 경로 기준). 렌더링 시에는 패키지 뷰 네임스페이스를 접두사로 붙이면 됩니다.

```blade
<x-courier::alert />
```

<a name="about-artisan-command"></a>
### "About" 아티즌 명령어

라라벨에 내장된 `about` 아티즌 명령어는 애플리케이션 환경과 설정에 대한 요약 정보를 제공합니다. 패키지에서 `AboutCommand` 클래스를 통해 이 명령어에 추가 정보를 덧붙일 수 있습니다. 보통, 이 정보는 패키지 서비스 프로바이더의 `boot` 메서드에서 추가합니다.

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

패키지의 아티즌 명령어를 라라벨에 등록하려면 `commands` 메서드를 사용할 수 있습니다. 이 메서드는 명령어 클래스명 배열을 받습니다. 등록된 후에는 [아티즌 CLI](/docs/11.x/artisan)로 해당 명령어를 실행할 수 있습니다.

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

<a name="optimize-commands"></a>
### Optimize 명령어

라라벨의 [`optimize` 명령어](/docs/11.x/deployment#optimization)는 애플리케이션의 설정, 이벤트, 라우트, 뷰를 캐싱합니다. `optimizes` 메서드를 사용해, 패키지 자체적인 아티즌 명령어를 `optimize` 및 `optimize:clear` 명령 실행 시 함께 실행하도록 등록할 수 있습니다.

```
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    if ($this->app->runningInConsole()) {
        $this->optimizes(
            optimize: 'package:optimize',
            clear: 'package:clear-optimizations',
        );
    }
}
```

<a name="public-assets"></a>
## 퍼블릭 자산

패키지에 JavaScript, CSS, 이미지 등 퍼블릭 자산이 포함되어 있다면, 서비스 프로바이더의 `publishes` 메서드를 사용하여 애플리케이션의 `public` 디렉터리로 퍼블리싱할 수 있습니다. 아래 예시에서는 `public` 자산 그룹 태그도 함께 지정했는데, 이를 통해 관련 자산 그룹을 한 번에 쉽게 퍼블리시할 수 있습니다.

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

패키지 사용자가 `vendor:publish` 명령어를 실행하면 자산이 지정된 위치로 복사됩니다. 일반적으로 패키지 업데이트 시마다 자산을 덮어써야 하므로, `--force` 플래그를 사용할 수 있습니다.

```shell
php artisan vendor:publish --tag=public --force
```

<a name="publishing-file-groups"></a>
## 파일 그룹 퍼블리싱

패키지의 자산 및 리소스를 그룹별로 따로 퍼블리싱하고 싶을 때가 있습니다. 예를 들어, 사용자가 설정 파일만 따로 퍼블리싱하도록 할 수도 있습니다. 이럴 때는 서비스 프로바이더의 `publishes` 메서드를 사용할 때 "태그(tag)"를 지정하여 퍼블리시 그룹을 나눌 수 있습니다. 다음은 `courier` 패키지에서 `courier-config`와 `courier-migrations`라는 두 퍼블리시 그룹을 만드는 예시입니다.

```
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->publishes([
        __DIR__.'/../config/package.php' => config_path('package.php')
    ], 'courier-config');

    $this->publishesMigrations([
        __DIR__.'/../database/migrations/' => database_path('migrations')
    ], 'courier-migrations');
}
```

이제 사용자는 퍼블리시 명령어에서 태그를 지정해 해당 그룹만 별도로 퍼블리싱할 수 있습니다.

```shell
php artisan vendor:publish --tag=courier-config
```
