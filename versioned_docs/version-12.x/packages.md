# 패키지 개발 (Package Development)

- [소개](#introduction)
    - [파사드에 대한 참고](#a-note-on-facades)
- [패키지 디스커버리](#package-discovery)
- [서비스 프로바이더](#service-providers)
- [리소스](#resources)
    - [설정](#configuration)
    - [마이그레이션](#migrations)
    - [라우트](#routes)
    - [언어 파일](#language-files)
    - [뷰](#views)
    - [뷰 컴포넌트](#view-components)
    - ["About" 아티즌 명령어](#about-artisan-command)
- [명령어](#commands)
    - [최적화 명령어](#optimize-commands)
- [퍼블릭 에셋](#public-assets)
- [파일 그룹 퍼블리싱](#publishing-file-groups)

<a name="introduction"></a>
## 소개

패키지는 라라벨에 기능을 추가하는 주요 방법입니다. 예를 들어 [Carbon](https://github.com/briannesbitt/Carbon)과 같이 날짜를 다루는 뛰어난 도구이거나, Spatie의 [Laravel Media Library](https://github.com/spatie/laravel-medialibrary)처럼 Eloquent 모델에 파일을 연관시킬 수 있게 해주는 패키지 등이 있습니다.

패키지에는 종류가 여러 가지가 있습니다. 어떤 패키지는 '스탠드얼론(stand-alone)'으로, 어떤 PHP 프레임워크와도 함께 동작합니다. Carbon이나 Pest가 그러한 예시입니다. 이들 패키지는 `composer.json` 파일에 추가(require)해서 라라벨에서 바로 사용할 수 있습니다.

반면, 라라벨에서만 사용하도록 특별히 만들어진 패키지도 있습니다. 이러한 패키지들은 라라벨 애플리케이션을 확장하기 위한 전용 라우트, 컨트롤러, 뷰, 설정 등을 제공하기도 합니다. 이 가이드에서는 주로 라라벨에 특화된 패키지를 개발하는 과정을 설명합니다.

<a name="a-note-on-facades"></a>
### 파사드에 대한 참고

라라벨 애플리케이션을 개발할 때는 contract(계약)나 파사드(facade) 중 어떤 것을 사용하든 테스트 가능성 측면에서는 거의 동일합니다. 하지만 패키지를 개발할 때는 라라벨의 다양한 테스트 헬퍼를 바로 사용할 수 없는 경우가 많습니다. 만약 패키지가 일반적인 라라벨 애플리케이션 안에 설치된 것과 마찬가지로 테스트를 작성하고 싶다면, [Orchestral Testbench](https://github.com/orchestral/testbench) 패키지를 사용할 수 있습니다.

<a name="package-discovery"></a>
## 패키지 디스커버리

라라벨 애플리케이션의 `bootstrap/providers.php` 파일에는 라라벨이 로드해야 하는 서비스 프로바이더 목록이 들어 있습니다. 하지만 사용자가 직접 이 목록에 서비스 프로바이더를 추가하지 않아도 되도록, 패키지의 `composer.json` 파일의 `extra` 섹션에 프로바이더를 정의할 수 있습니다. 서비스 프로바이더뿐만 아니라, 등록하고 싶은 [파사드](/docs/12.x/facades)도 함께 지정할 수 있습니다.

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

패키지의 디스커버리 설정이 완료되면, 사용자가 패키지를 설치할 때 라라벨이 해당 패키지의 서비스 프로바이더와 파사드를 자동으로 등록해 줍니다. 덕분에 패키지 사용자에게 매우 편리한 설치 경험을 제공할 수 있습니다.

<a name="opting-out-of-package-discovery"></a>
#### 패키지 디스커버리 비활성화하기

사용자 입장에서 특정 패키지의 디스커버리 기능을 끄고 싶다면, 애플리케이션의 `composer.json` 파일의 `extra` 섹션에 해당 패키지 이름을 나열하면 됩니다.

```json
"extra": {
    "laravel": {
        "dont-discover": [
            "barryvdh/laravel-debugbar"
        ]
    }
},
```

애플리케이션의 `dont-discover` 옵션에 `*` 문자를 사용하면 모든 패키지의 자동 디스커버리를 비활성화할 수도 있습니다.

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

[서비스 프로바이더](/docs/12.x/providers)는 패키지와 라라벨을 연결해 주는 지점입니다. 서비스 프로바이더의 역할은 라라벨의 [서비스 컨테이너](/docs/12.x/container)에 바인딩을 등록하고, 라라벨에 패키지의 뷰, 설정, 언어 파일 등 리소스를 어디에서 불러올지 알려주는 것입니다.

서비스 프로바이더는 `Illuminate\Support\ServiceProvider` 클래스를 상속하며, `register`와 `boot` 두 가지 메서드를 포함합니다. 기본 ServiceProvider 클래스는 `illuminate/support` Composer 패키지 안에 들어 있으니, 패키지의 의존성 목록에 추가해야 합니다. 서비스 프로바이더의 구조 및 역할에 대해 더 알고 싶다면, [관련 공식 문서](/docs/12.x/providers)를 참고하세요.

<a name="resources"></a>
## 리소스

<a name="configuration"></a>
### 설정

일반적으로 패키지의 설정 파일은 애플리케이션의 `config` 디렉터리에 퍼블리싱(publish)되어야 합니다. 이를 통해 사용자는 기본 설정값을 손쉽게 오버라이드할 수 있습니다. 설정 파일을 퍼블리시하려면, 서비스 프로바이더의 `boot` 메서드에서 `publishes` 메서드를 호출합니다.

```php
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

이제 패키지 사용자가 라라벨의 `vendor:publish` 명령어를 실행하면, 설정 파일이 지정된 위치로 복사됩니다. 퍼블리시된 설정값은 다른 설정 파일처럼 접근할 수 있습니다.

```php
$value = config('courier.option');
```

> [!WARNING]
> 설정 파일 안에 익명 함수(클로저)를 정의하면 안 됩니다. 이런 경우 사용자가 `config:cache` 아티즌 명령어를 실행할 때 직렬화가 제대로 되지 않습니다.

<a name="default-package-configuration"></a>
#### 패키지 기본 설정 병합하기

패키지의 설정 파일을 애플리케이션에 퍼블리시된 설정 파일과 병합할 수도 있습니다. 이렇게 하면, 사용자는 오버라이드하고 싶은 옵션만 설정 파일에 정의하면 되고, 나머지는 패키지의 기본값이 자동 적용됩니다. 설정 파일을 병합하려면, 서비스 프로바이더의 `register` 메서드에서 `mergeConfigFrom` 메서드를 사용합니다.

`mergeConfigFrom` 메서드는 첫 번째 인수로 패키지의 설정 파일 경로, 두 번째 인수로 애플리케이션 설정 파일의 이름을 받습니다.

```php
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
> 이 메서드는 설정 배열의 1단계(최상위) 값만 병합합니다. 만약 사용자가 다차원(2차원 이상) 배열의 일부만 정의할 경우, 누락된 항목은 병합되지 않으니 주의하세요.

<a name="routes"></a>
### 라우트

패키지에 라우트가 포함되어 있다면, `loadRoutesFrom` 메서드를 사용해 라우트를 등록할 수 있습니다. 이 메서드는 애플리케이션의 라우트가 캐시되어 있는지 확인하며, 이미 라우트 캐시가 존재하면 패키지 라우트 파일을 로드하지 않습니다.

```php
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

패키지가 [데이터베이스 마이그레이션](/docs/12.x/migrations)을 포함하고 있다면, `publishesMigrations` 메서드를 사용해 지정한 디렉터리 또는 파일에 마이그레이션 파일이 있음을 라라벨에 알릴 수 있습니다. 라라벨이 마이그레이션 파일을 퍼블리시할 때는 파일 이름에 붙는 타임스탬프를 현재 날짜와 시간으로 자동 변경해 줍니다.

```php
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

패키지에 [언어 파일](/docs/12.x/localization)이 포함되어 있다면, `loadTranslationsFrom` 메서드를 사용해 라라벨에 언어 파일 경로와 네임스페이스를 알려야 합니다. 예를 들어, 패키지 이름이 `courier`라면, 서비스 프로바이더의 `boot` 메서드에 아래와 같이 추가합니다.

```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadTranslationsFrom(__DIR__.'/../lang', 'courier');
}
```

패키지의 번역 라인은 `패키지네임::파일.문자열` 형태로 참조합니다. 예를 들면, `courier` 패키지의 `messages` 파일 안에 있는 `welcome` 항목을 이렇게 불러올 수 있습니다.

```php
echo trans('courier::messages.welcome');
```

JSON 번역 파일을 등록하려면 `loadJsonTranslationsFrom` 메서드를 사용합니다. 이 메서드는 패키지의 JSON 번역 파일들이 저장된 디렉터리 경로를 받습니다.

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

패키지의 언어 파일을 애플리케이션의 `lang/vendor` 디렉터리로 퍼블리시하고 싶다면, 서비스 프로바이더의 `publishes` 메서드를 사용하면 됩니다. `publishes` 메서드는 여러 경로와 그 대상 위치의 배열을 받습니다. 예를 들어, `courier` 패키지의 언어 파일을 퍼블리시하려면 아래와 같이 작성합니다.

```php
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

이제 패키지 사용자가 라라벨의 `vendor:publish` 아티즌 명령어를 실행하면, 패키지 언어 파일이 지정된 위치로 복사됩니다.

<a name="views"></a>
### 뷰

패키지의 [뷰](/docs/12.x/views)를 라라벨에 등록하려면, 뷰가 어디에 위치하는지 라라벨에 알려주어야 합니다. 이를 위해 서비스 프로바이더의 `loadViewsFrom` 메서드를 사용합니다. 첫 번째 인수로 뷰 템플릿의 경로, 두 번째 인수로 패키지 이름을 전달합니다. 예를 들어, 패키지 이름이 `courier`라면 아래와 같이 설정합니다.

```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadViewsFrom(__DIR__.'/../resources/views', 'courier');
}
```

패키지의 뷰는 `패키지명::뷰명` 형태로 참조합니다. 예를 들어 `courier` 패키지의 `dashboard` 뷰를 등록했다면 아래처럼 사용할 수 있습니다.

```php
Route::get('/dashboard', function () {
    return view('courier::dashboard');
});
```

<a name="overriding-package-views"></a>
#### 패키지 뷰 오버라이드

`loadViewsFrom` 메서드를 사용하면, 라라벨은 실제로 두 곳을 뷰 탐색 경로로 등록합니다. 애플리케이션의 `resources/views/vendor/패키지명` 디렉터리와, `loadViewsFrom`에 지정한 디렉터리입니다. 예를 들어 `courier` 패키지의 뷰를 사용할 경우, 먼저 개발자가 `resources/views/vendor/courier` 디렉터리에 커스텀 뷰를 두었는지 확인하고, 없으면 패키지의 뷰 디렉터리에서 뷰를 로드합니다. 이를 통해 패키지 사용자는 패키지의 뷰를 자유롭게 오버라이드/수정할 수 있습니다.

<a name="publishing-views"></a>
#### 뷰 퍼블리싱

패키지의 뷰 파일을 애플리케이션의 `resources/views/vendor` 디렉터리로 퍼블리시할 수 있게 하려면, 서비스 프로바이더에서 `publishes` 메서드를 사용하세요. 배열로 패키지 뷰 경로와 대상 위치를 지정합니다.

```php
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

이제 패키지 사용자가 `vendor:publish` 아티즌 명령어를 실행하면, 패키지의 뷰가 지정된 위치로 복사됩니다.

<a name="view-components"></a>
### 뷰 컴포넌트

패키지에서 Blade 컴포넌트를 사용하거나 컴포넌트를 비표준 디렉터리에 제공한다면, 컴포넌트 클래스와 HTML 태그 에일리어스를 직접 등록해야 라라벨이 어디에서 컴포넌트를 찾을 수 있는지 인식합니다. 보통 서비스 프로바이더의 `boot` 메서드에서 컴포넌트를 등록합니다.

```php
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

컴포넌트가 등록되면 태그 에일리어스를 사용해 렌더링할 수 있습니다.

```blade
<x-package-alert/>
```

<a name="autoloading-package-components"></a>
#### 패키지 컴포넌트 자동 로딩

또는, `componentNamespace` 메서드를 사용해 명명 규칙에 따라 컴포넌트 클래스를 자동 로딩할 수도 있습니다. 예를 들어, `Nightshade` 패키지가 `Calendar`, `ColorPicker` 컴포넌트를 `Nightshade\Views\Components` 네임스페이스에 제공한다고 하면,

```php
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap your package's services.
 */
public function boot(): void
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

이렇게 하면, `package-name::` 네임스페이스 문법으로 패키지 컴포넌트를 사용할 수 있습니다.

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade는 컴포넌트 이름을 pascal-case로 변환해 자동으로 클래스와 연결합니다. 하위 디렉터리도 "dot" 표기법을 통해 지원합니다.

<a name="anonymous-components"></a>
#### 익명 컴포넌트

패키지에 익명 Blade 컴포넌트가 있다면, 반드시 패키지의 "views" 디렉터리(예: [loadViewsFrom 메서드](#views)에서 지정한 위치) 하위의 `components` 디렉터리에 위치시켜야 합니다. 이후 컴포넌트 이름 앞에 패키지 뷰 네임스페이스를 붙여 사용할 수 있습니다.

```blade
<x-courier::alert />
```

<a name="about-artisan-command"></a>
### "About" 아티즌 명령어

라라벨의 기본 제공 `about` 아티즌 명령어는 애플리케이션의 환경과 설정을 요약해서 보여줍니다. 패키지 역시 `AboutCommand` 클래스를 통해 이 명령어 출력 내용에 추가 정보를 제공할 수 있습니다. 일반적으로 서비스 프로바이더의 `boot` 메서드에서 다음과 같이 등록합니다.

```php
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

패키지의 아티즌 명령어를 라라벨에 등록하려면, `commands` 메서드를 사용합니다. 이 메서드는 명령어 클래스명 배열을 인수로 받습니다. 등록이 완료되면 [아티즌 CLI](/docs/12.x/artisan)에서 해당 명령어를 실행할 수 있습니다.

```php
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
### 최적화 명령어

라라벨의 [최적화 명령어](/docs/12.x/deployment#optimization)는 애플리케이션의 설정, 이벤트, 라우트, 뷰를 캐시합니다. `optimizes` 메서드를 사용하면, 패키지 고유의 아티즌 명령어를 `optimize` 및 `optimize:clear` 명령어 실행 시 함께 동작하도록 지정할 수 있습니다.

```php
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
## 퍼블릭 에셋

패키지에서 JavaScript, CSS, 이미지와 같은 에셋 파일을 제공한다면, 서비스 프로바이더의 `publishes` 메서드를 사용해 패키지 에셋을 애플리케이션의 `public` 디렉터리로 퍼블리싱할 수 있습니다. 아래 예시에서는 관련 에셋을 그룹 태그('public')로도 함께 등록해 두었습니다. 이렇게 하면 관련 에셋들만 쉽게 개별적으로 퍼블리시할 수 있습니다.

```php
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

패키지 사용자가 `vendor:publish` 명령어를 실행하면 에셋이 지정된 위치로 복사됩니다. 패키지 업데이트 시마다 에셋을 덮어써야 하는 상황이 많으므로, `--force` 플래그 사용을 권장합니다.

```shell
php artisan vendor:publish --tag=public --force
```

<a name="publishing-file-groups"></a>
## 파일 그룹 퍼블리싱

패키지의 에셋과 리소스를 개별적으로 나눠 원하는 그룹만 퍼블리시할 수 있게 하는 것이 좋을 때가 있습니다. 예를 들어, 사용자가 패키지의 설정 파일만 퍼블리시하고 에셋 파일은 원하지 않을 수도 있습니다. 이런 경우, 서비스 프로바이더의 `publishes` 메서드에서 '태그(tag)'를 지정해 퍼블리시 그룹을 만들 수 있습니다. 아래 예시는 `courier` 패키지에서 두 가지 퍼블리시 그룹(`courier-config`와 `courier-migrations`)을 boot 메서드에서 지정하는 방식입니다.

```php
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

이제 사용자는 아래처럼 태그 이름을 지정해서 각각의 그룹만 퍼블리싱할 수 있습니다.

```shell
php artisan vendor:publish --tag=courier-config
```

또는, 서비스 프로바이더에서 지정한 모든 퍼블리시 가능한 파일을 한 번에 복사하려면 `--provider` 플래그를 사용할 수 있습니다.

```shell
php artisan vendor:publish --provider="Your\Package\ServiceProvider"
```
