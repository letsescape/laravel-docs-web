# 패키지 개발 (Package Development)

- [소개](#introduction)
    - [파사드에 대한 참고 사항](#a-note-on-facades)
- [패키지 자동 발견](#package-discovery)
- [서비스 프로바이더](#service-providers)
- [리소스](#resources)
    - [구성 파일](#configuration)
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

패키지는 라라벨에 기능을 추가하는 기본적인 방법입니다. 패키지는 [Carbon](https://github.com/briannesbitt/Carbon)처럼 날짜를 다루는 훌륭한 도구일 수도 있고, Spatie의 [Laravel Media Library](https://github.com/spatie/laravel-medialibrary)처럼 Eloquent 모델과 파일을 연동할 수 있도록 도와주는 패키지일 수도 있습니다.

패키지는 여러 종류가 있습니다. 어떤 패키지는 독립적으로 동작하여 모든 PHP 프레임워크에서 사용할 수 있습니다. Carbon과 Pest가 대표적인 독립형 패키지입니다. 이러한 패키지들은 단순히 `composer.json` 파일에 추가(Require)해서 라라벨에서 사용할 수 있습니다.

반면에, 라라벨 전용으로 만들어진 패키지도 있습니다. 이런 패키지는 라라벨 애플리케이션의 기능을 확장하기 위해 모듈별로 라우트, 컨트롤러, 뷰, 구성 파일 등을 포함할 수 있습니다. 이 가이드에서는 주로 라라벨 전용 패키지 개발에 대해 다룹니다.

<a name="a-note-on-facades"></a>
### 파사드에 대한 참고 사항

라라벨 애플리케이션을 개발할 때는 컨트랙트(contract)나 파사드(facade) 중 어느 것을 사용하든 테스트 측면에서 큰 차이 없이 활용할 수 있습니다. 그러나 패키지를 개발할 때는, 여러분의 패키지에는 라라벨의 모든 테스트 헬퍼가 포함되어 있지 않을 수 있습니다. 만약 패키지 테스트를 마치 일반 라라벨 애플리케이션에 설치된 것처럼 작성하고 싶다면, [Orchestral Testbench](https://github.com/orchestral/testbench) 패키지를 사용하면 됩니다.

<a name="package-discovery"></a>
## 패키지 자동 발견

라라벨 애플리케이션의 `bootstrap/providers.php` 파일에는 라라벨이 로드해야 할 서비스 프로바이더 목록이 포함되어 있습니다. 하지만 사용자가 직접 이 파일에 여러분의 서비스 프로바이더를 추가해야 하는 번거로움을 줄이기 위해, 패키지의 `composer.json` 파일 `extra` 섹션에 프로바이더를 정의하면 라라벨이 자동으로 해당 프로바이더를 로드합니다. 또한 서비스 프로바이더뿐 아니라, 등록하고 싶은 [파사드](/docs/facades)도 함께 지정할 수 있습니다.

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

패키지의 자동 발견이 이렇게 설정되면, 해당 패키지를 설치할 때 라라벨이 서비스 프로바이더와 파사드를 자동으로 등록하므로, 사용자는 더욱 간편하게 패키지를 설치할 수 있습니다.

<a name="opting-out-of-package-discovery"></a>
#### 패키지 자동 발견 비활성화

패키지 사용자가 특정 패키지의 자동 발견 기능을 비활성화하고 싶을 경우, 애플리케이션의 `composer.json` 파일 `extra` 섹션에 패키지 이름을 지정하면 됩니다.

```json
"extra": {
    "laravel": {
        "dont-discover": [
            "barryvdh/laravel-debugbar"
        ]
    }
},
```

애플리케이션의 `dont-discover` 옵션에서 `*`를 사용하면 모든 패키지에 대한 자동 발견을 비활성화할 수도 있습니다.

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

[서비스 프로바이더](/docs/providers)는 여러분의 패키지와 라라벨 사이의 연결점입니다. 서비스 프로바이더는 라라벨의 [서비스 컨테이너](/docs/container)에 다양한 항목을 바인딩하거나, 뷰, 구성, 언어 파일 등 패키지 리소스가 어디에 위치하는지 라라벨에 알려주는 역할을 합니다.

서비스 프로바이더는 `Illuminate\Support\ServiceProvider` 클래스를 상속하며, `register`와 `boot` 메서드를 구현합니다. 기본 `ServiceProvider` 클래스는 `illuminate/support` Composer 패키지에 포함되어 있으니, 여러분의 패키지에도 이를 의존성에 추가해야 합니다. 서비스 프로바이더의 구조와 역할에 대해 더 자세히 알고 싶다면, [별도의 문서](/docs/providers)를 참고하십시오.

<a name="resources"></a>
## 리소스

<a name="configuration"></a>
### 구성 파일

일반적으로 여러분의 패키지 구성 파일을 애플리케이션의 `config` 디렉터리로 퍼블리시(publish)할 필요가 있습니다. 이를 통해 패키지 사용자는 기본 설정 값을 쉽게 덮어써서 사용할 수 있습니다. 구성 파일을 퍼블리시할 수 있도록 하려면 서비스 프로바이더의 `boot` 메서드 안에서 `publishes` 메서드를 호출합니다.

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

이제 패키지 사용자가 라라벨의 `vendor:publish` 명령어를 실행하면, 해당 파일이 지정된 위치로 복사됩니다. 구성 파일이 퍼블리시되고 나면, 다른 구성 파일처럼 값을 읽어올 수 있습니다.

```php
$value = config('courier.option');
```

> [!WARNING]
> 구성 파일에 클로저(Closure)를 정의하지 마십시오. 사용자가 `config:cache` 아티즌 명령어를 실행할 때 올바르게 직렬화되지 않습니다.

<a name="default-package-configuration"></a>
#### 패키지 기본 구성 설정

패키지의 구성 파일을 애플리케이션에 퍼블리시된 사본과 병합(merge)할 수도 있습니다. 이렇게 하면 사용자는 구성 파일에서 변경하고 싶은 옵션만 선택적으로 정의할 수 있습니다. 구성 값 병합은 서비스 프로바이더의 `register` 메서드에서 `mergeConfigFrom` 메서드를 사용합니다.

`mergeConfigFrom`의 첫 번째 인수는 패키지의 구성 파일 경로, 두 번째 인수는 애플리케이션에서 참조할 구성 파일명입니다.

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
> 이 방식은 구성 배열의 첫 번째(최상위) 레벨만 병합합니다. 만약 사용자가 다차원 배열의 일부만 정의한다면, 누락된 옵션은 병합되지 않습니다.

<a name="routes"></a>
### 라우트

패키지에 라우트가 포함되어 있다면, `loadRoutesFrom` 메서드로 해당 파일을 로드할 수 있습니다. 이 메서드는 애플리케이션의 라우트가 이미 캐시되어 있는지 자동으로 확인하며, 캐시된 경우에는 라우트 파일을 다시 불러오지 않습니다.

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

패키지에 [데이터베이스 마이그레이션](/docs/migrations)가 포함되어 있다면, `publishesMigrations` 메서드를 통해 해당 디렉터리나 파일이 마이그레이션임을 라라벨에 알릴 수 있습니다. 마이그레이션을 퍼블리시할 때, 파일명에 포함된 타임스탬프는 현재 날짜와 시간으로 자동으로 갱신됩니다.

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

패키지에 [언어 파일](/docs/localization)이 포함되어 있다면, `loadTranslationsFrom` 메서드를 활용해 라라벨이 해당 파일들을 올바르게 불러올 수 있도록 해야 합니다. 예를 들어, 패키지 이름이 `courier`라면 서비스 프로바이더의 `boot` 메서드에 다음처럼 추가합니다.

```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadTranslationsFrom(__DIR__.'/../lang', 'courier');
}
```

패키지의 번역 문구는 `package::file.line` 형식으로 참조합니다. 예를 들어, `courier` 패키지의 `messages` 파일 안의 `welcome` 항목을 불러오려면 다음과 같이 사용할 수 있습니다.

```php
echo trans('courier::messages.welcome');
```

패키지에서 JSON 번역 파일을 등록하고 싶다면, `loadJsonTranslationsFrom` 메서드를 사용하면 됩니다. 이 메서드는 패키지의 JSON 번역 파일들이 들어있는 디렉터리 경로를 받습니다.

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

패키지의 언어 파일을 애플리케이션의 `lang/vendor` 디렉터리로 퍼블리시(publish)하고 싶다면, 서비스 프로바이더의 `publishes` 메서드를 활용할 수 있습니다. 이 메서드는 패키지 경로와 퍼블리시할 위치를 배열로 받습니다. 예를 들어, `courier` 패키지의 언어 파일을 퍼블리시하려면 다음처럼 작성합니다.

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

이제 패키지 사용자가 `vendor:publish` 아티즌 명령어를 실행하면, 언어 파일이 퍼블리시 위치로 복사됩니다.

<a name="views"></a>
### 뷰

패키지의 [뷰](/docs/views)를 라라벨에 등록하려면, 라라벨에 뷰 파일의 위치를 알려줘야 합니다. 이를 위해 서비스 프로바이더의 `loadViewsFrom` 메서드를 사용합니다. 이 메서드는 첫 번째 인수로 뷰 템플릿 경로, 두 번째 인수로 패키지의 이름을 받습니다. 예를 들어, 패키지 이름이 `courier`라면, 서비스 프로바이더의 `boot` 메서드에 다음과 같이 추가합니다.

```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadViewsFrom(__DIR__.'/../resources/views', 'courier');
}
```

패키지의 뷰는 `package::view` 형식으로 참조합니다. 즉, 뷰 경로가 등록되면, `courier` 패키지의 `dashboard` 뷰를 다음과 같이 불러올 수 있습니다.

```php
Route::get('/dashboard', function () {
    return view('courier::dashboard');
});
```

<a name="overriding-package-views"></a>
#### 패키지 뷰 오버라이드(덮어쓰기)

`loadViewsFrom` 메서드를 사용하면, 라라벨은 실제로 두 군데의 뷰 경로를 등록합니다. 하나는 애플리케이션의 `resources/views/vendor` 디렉터리이고, 또 하나는 패키지를 통해 지정한 디렉터리입니다. 즉, 위 예시에서 개발자가 `resources/views/vendor/courier` 경로에 같은 이름의 뷰를 직접 만들어 두었다면, 라라벨은 우선 그 뷰를 사용합니다. 만약 뷰가 직접 커스터마이징되지 않았다면 패키지 뷰 디렉터리에서 불러옵니다. 이를 통해 패키지 사용자는 뷰 파일을 쉽게 커스터마이징하거나 오버라이드할 수 있습니다.

<a name="publishing-views"></a>
#### 뷰 퍼블리싱

패키지의 뷰 파일을 애플리케이션의 `resources/views/vendor` 디렉터리로 퍼블리시하고 싶다면, 서비스 프로바이더의 `publishes` 메서드를 사용하면 됩니다. 이 메서드는 뷰 파일 경로와 퍼블리시 위치를 배열로 받습니다.

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

이제 사용자가 `vendor:publish` 아티즌 명령어를 실행하면 패키지의 뷰 파일이 지정된 위치로 복사됩니다.

<a name="view-components"></a>
### 뷰 컴포넌트

패키지에서 Blade 컴포넌트를 제공하거나, 컴포넌트 클래스를 비표준 디렉터리에 둘 경우, 라라벨이 해당 컴포넌트 클래스와 HTML 태그 별칭을 알아볼 수 있도록 수동 등록해야 합니다. 보통 이런 등록 작업은 패키지 서비스 프로바이더의 `boot` 메서드에서 수행합니다.

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

컴포넌트가 등록되면, 아래와 같이 태그 별칭을 사용해 렌더링할 수 있습니다.

```blade
<x-package-alert/>
```

<a name="autoloading-package-components"></a>
#### 패키지 컴포넌트 자동 로드

또는, `componentNamespace` 메서드를 사용하여 네임스페이스 규칙에 따라 자동으로 컴포넌트 클래스를 로드할 수도 있습니다. 예를 들어, `Nightshade` 패키지에 `Nightshade\Views\Components` 네임스페이스 아래 `Calendar`와 `ColorPicker` 컴포넌트가 있다고 가정해 보겠습니다.

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

이렇게 하면, 패키지의 벤더 네임스페이스를 `package-name::` 형식으로 사용할 수 있습니다.

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade는 컴포넌트 이름을 파스칼 케이스로 변환한 뒤, 자동으로 해당 클래스를 찾아 연결합니다. 하위 디렉터리(서브디렉터리)도 "dot" 표기법을 사용해 지원됩니다.

<a name="anonymous-components"></a>
#### 익명 컴포넌트

패키지에 익명 컴포넌트가 있다면, 이들은 `[뷰 디렉터리]/components` 하위에 위치해야 합니다([loadViewsFrom 메서드](#views)에서 지정한 뷰 디렉터리를 의미). 그런 후, 컴포넌트 이름 앞에 패키지의 뷰 네임스페이스를 붙여서 렌더링할 수 있습니다.

```blade
<x-courier::alert />
```

<a name="about-artisan-command"></a>
### "About" 아티즌 명령어

라라벨의 기본 `about` 아티즌 명령어는 애플리케이션의 환경 구성 정보를 요약해서 보여줍니다. 패키지는 `AboutCommand` 클래스를 통해 이 명령어의 출력에 추가 정보를 넣을 수 있습니다. 보통 서비스 프로바이더의 `boot` 메서드에서 정보를 추가합니다.

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

패키지의 아티즌(Artisan) 명령어를 라라벨에 등록하려면, `commands` 메서드를 사용합니다. 이 메서드는 명령어 클래스 이름으로 이루어진 배열을 받습니다. 명령어가 등록되면, [Artisan CLI](/docs/artisan)를 통해 실행할 수 있습니다.

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

라라벨의 [optimize 명령어](/docs/deployment#optimization)는 애플리케이션의 구성, 이벤트, 라우트, 뷰 파일을 캐시합니다. `optimizes` 메서드를 사용하면, 여러분의 패키지에서 `optimize` 또는 `optimize:clear` 명령어가 실행될 때 같이 호출할 아티즌 명령어를 지정할 수 있습니다.

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

패키지에 JavaScript, CSS, 이미지 등 에셋이 포함되어 있을 수 있습니다. 이러한 에셋을 애플리케이션의 `public` 디렉터리로 배포하려면 서비스 프로바이더의 `publishes` 메서드를 사용하세요. 아래 예시에서는 `public` 에셋 그룹 태그도 함께 사용하여 관련 에셋 그룹을 손쉽게 퍼블리시할 수 있도록 합니다.

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

이제 패키지 사용자가 `vendor:publish` 명령어를 실행하면, 지정된 위치로 에셋 파일이 복사됩니다. 패키지 업데이트 시마다 에셋을 덮어쓰는 경우가 많으므로, `--force` 플래그를 사용할 수 있습니다.

```shell
php artisan vendor:publish --tag=public --force
```

<a name="publishing-file-groups"></a>
## 파일 그룹 퍼블리싱

패키지 내 여러 에셋이나 리소스를 서로 다른 그룹으로 나눠서 각각 퍼블리시할 수 있습니다. 예를 들어, 사용자에게 구성 파일만 별도로 퍼블리시할 수 있게 하거나, 에셋과는 별개로 마이그레이션 파일만 퍼블리시할 수 있게 만들 수 있습니다. 이런 구분은 서비스 프로바이더에서 `publishes` 메서드에 태그(tag)를 지정하여 구현합니다. 아래는 `courier` 패키지에서 `courier-config`와 `courier-migrations`라는 두 개의 퍼블리싱 그룹을 만드는 예시입니다.

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

이제 사용자는 `vendor:publish` 명령어 실행 시 퍼블리시 그룹의 태그를 참조하여 해당 그룹만 퍼블리시할 수 있습니다.

```shell
php artisan vendor:publish --tag=courier-config
```

모든 퍼블리시 가능한 파일을 한 번에 퍼블리시하려면 `--provider` 플래그를 사용할 수도 있습니다.

```shell
php artisan vendor:publish --provider="Your\Package\ServiceProvider"
```