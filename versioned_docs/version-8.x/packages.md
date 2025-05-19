# 패키지 개발 (Package Development)

- [소개](#introduction)
    - [파사드에 대한 참고 사항](#a-note-on-facades)
- [패키지 자동 등록](#package-discovery)
- [서비스 프로바이더](#service-providers)
- [리소스](#resources)
    - [설정 파일](#configuration)
    - [마이그레이션](#migrations)
    - [라우트](#routes)
    - [번역 파일](#translations)
    - [뷰](#views)
    - [뷰 컴포넌트](#view-components)
- [아티즌 명령어](#commands)
- [퍼블릭 에셋](#public-assets)
- [파일 그룹 퍼블리싱](#publishing-file-groups)

<a name="introduction"></a>
## 소개

패키지는 라라벨에 기능을 추가하는 기본적인 방법입니다. 패키지는 [Carbon](https://github.com/briannesbitt/Carbon)과 같이 날짜를 편리하게 다루는 라이브러리일 수도 있고, Spatie의 [Laravel Media Library](https://github.com/spatie/laravel-medialibrary)처럼 Eloquent 모델에 파일을 쉽게 연결할 수 있게 해주는 패키지일 수도 있습니다.

패키지에는 여러 종류가 있습니다. 일부 패키지는 독립형(stand-alone)으로, 모든 PHP 프레임워크에서 사용할 수 있습니다. Carbon과 PHPUnit이 대표적인 독립형 패키지이며, 이러한 패키지는 `composer.json` 파일에 추가해서 라라벨 프로젝트에서 그대로 사용할 수 있습니다.

반면, 라라벨에 특화되어 만들어진 패키지도 있습니다. 이런 패키지는 라우트, 컨트롤러, 뷰, 설정 파일 등을 포함해 라라벨 애플리케이션의 기능을 확장하는 데 집중합니다. 이 가이드에서는 라라벨 전용 패키지 개발 방법을 중심으로 설명합니다.

<a name="a-note-on-facades"></a>
### 파사드에 대한 참고 사항

라라벨 애플리케이션을 작성할 때는 contract나 파사드를 사용하는 것에 큰 차이가 없습니다. 두 방식 모두 테스트 코드 작성에 있어서 거의 동일한 수준의 효율성을 제공합니다. 그러나 패키지를 작성할 때에는 라라벨의 테스트 관련 도우미(헬퍼)에 모두 접근할 수 없을 수도 있습니다. 만약 패키지를 일반적인 라라벨 애플리케이션 안에 설치한 것처럼 테스트하고 싶다면, [Orchestral Testbench](https://github.com/orchestral/testbench) 패키지를 사용하면 됩니다.

<a name="package-discovery"></a>
## 패키지 자동 등록

라라벨 애플리케이션의 `config/app.php` 파일에서 `providers` 옵션은 로딩되어야 할 서비스 프로바이더 목록을 정의합니다. 누군가 여러분의 패키지를 설치하면, 일반적으로 서비스 프로바이더도 이 목록에 포함되길 원할 것입니다. 사용자에게 이 과정을 직접 맡기는 대신, 패키지의 `composer.json` 파일의 `extra` 섹션에 서비스 프로바이더를 정의할 수 있습니다. 서비스 프로바이더 외에도, 등록하고 싶은 [파사드](/docs/8.x/facades)가 있다면 aliases 항목에 추가할 수도 있습니다:

```
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

이렇게 패키지에 자동 등록 설정을 해두면, 유저가 패키지를 설치할 때 라라벨이 자동으로 서비스 프로바이더와 파사드를 등록해 줍니다. 덕분에 패키지를 설치하는 과정이 훨씬 간편해집니다.

<a name="opting-out-of-package-discovery"></a>
### 패키지 자동 등록 해제

패키지 사용자가 패키지 자동 등록(package discovery)을 비활성화하고 싶을 때는, 애플리케이션의 `composer.json` 파일 `extra` 섹션에 해당 패키지명을 나열하면 됩니다:

```
"extra": {
    "laravel": {
        "dont-discover": [
            "barryvdh/laravel-debugbar"
        ]
    }
},
```

모든 패키지의 자동 등록을 비활성화 하고 싶다면, `dont-discover` 지시어에 `*`를 추가하세요:

```
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

[서비스 프로바이더](/docs/8.x/providers)는 패키지와 라라벨을 연결하는 지점입니다. 서비스 프로바이더는 라라벨의 [서비스 컨테이너](/docs/8.x/container)에 다양한 기능을 바인딩하고, 설정 파일, 뷰, 번역 파일 등 패키지 리소스가 어디에 있는지 라라벨에 알려주는 역할을 합니다.

서비스 프로바이더는 `Illuminate\Support\ServiceProvider` 클래스를 확장(extends)하며 `register`와 `boot` 두 가지 메서드를 가집니다. 기본 `ServiceProvider` 클래스는 `illuminate/support` Composer 패키지에 포함되어 있으므로, 패키지의 의존성에 추가해야 합니다. 서비스 프로바이더의 구조와 목적에 대해 더 알고 싶다면 [관련 문서](/docs/8.x/providers)를 참고하세요.

<a name="resources"></a>
## 리소스

<a name="configuration"></a>
### 설정 파일

일반적으로, 패키지의 설정 파일을 애플리케이션의 `config` 디렉터리로 복사해서 배포해야 합니다. 이를 통해 패키지 사용자는 기본 설정 값을 쉽게 재정의할 수 있습니다. 설정 파일 배포를 지원하려면, 서비스 프로바이더의 `boot` 메서드에서 `publishes` 메서드를 호출하세요:

```
/**
 * Bootstrap any package services.
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

이제 패키지 사용자가 라라벨의 `vendor:publish` 명령어를 실행하면, 설정 파일이 지정한 위치로 복사됩니다. 설정 파일이 복사된 후에는 다른 설정 파일과 동일하게 값을 불러올 수 있습니다:

```
$value = config('courier.option');
```

> [!NOTE]
> 설정 파일에서 클로저(익명 함수)는 정의하지 않아야 합니다. `config:cache` 아티즌 명령어를 실행할 때 직렬화가 올바르게 동작하지 않기 때문입니다.

<a name="default-package-configuration"></a>
#### 기본 패키지 설정 병합

패키지의 설정 파일을 애플리케이션에 배포한 복사본과 병합할 수도 있습니다. 이를 통해 사용자는 변경하고 싶은 옵션만 설정 파일에서 오버라이드(재정의)할 수 있습니다. 설정 파일의 값을 병합하려면, 서비스 프로바이더의 `register` 메서드 안에서 `mergeConfigFrom` 메서드를 사용하세요.

`mergeConfigFrom` 메서드의 첫 번째 인자는 패키지의 설정 파일 경로, 두 번째 인자는 애플리케이션에 복사될 설정 파일의 이름입니다:

```
/**
 * Register any application services.
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

> [!NOTE]
> 이 메서드는 설정 배열의 1단계만 병합합니다. 사용자가 여러 단계로 구성된 설정 배열을 일부만 정의한 경우, 누락된 옵션은 병합되지 않습니다.

<a name="routes"></a>
### 라우트

패키지에 라우트가 포함되어 있다면, `loadRoutesFrom` 메서드로 라우트를 불러올 수 있습니다. 이 메서드는 애플리케이션의 라우트가 캐시되어 있으면 자동으로 추가 라우트를 불러오지 않습니다:

```
/**
 * Bootstrap any package services.
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

패키지에 [데이터베이스 마이그레이션](/docs/8.x/migrations)이 포함되어 있다면, `loadMigrationsFrom` 메서드로 라라벨에 알려줄 수 있습니다. 이 메서드는 패키지의 마이그레이션 디렉터리 경로만 인자로 받습니다:

```
/**
 * Bootstrap any package services.
 *
 * @return void
 */
public function boot()
{
    $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
}
```

이제 패키지의 마이그레이션이 등록되어, 사용자가 `php artisan migrate` 명령어를 실행하면 자동으로 적용됩니다. 별도로 애플리케이션의 `database/migrations` 디렉터리로 복사할 필요가 없습니다.

<a name="translations"></a>
### 번역 파일

패키지에 [번역 파일](/docs/8.x/localization)이 포함되어 있다면, `loadTranslationsFrom` 메서드로 라라벨에 경로를 등록할 수 있습니다. 예를 들어, 패키지 이름이 `courier`라면, 서비스 프로바이더의 `boot` 메서드에 아래와 같이 추가합니다:

```
/**
 * Bootstrap any package services.
 *
 * @return void
 */
public function boot()
{
    $this->loadTranslationsFrom(__DIR__.'/../resources/lang', 'courier');
}
```

패키지 번역은 `package::file.line` 문법을 사용해 참조하게 됩니다. 예를 들어 `courier` 패키지의 `messages` 파일 내 `welcome` 문구를 불러오려면 다음과 같이 사용할 수 있습니다:

```
echo trans('courier::messages.welcome');
```

<a name="publishing-translations"></a>
#### 번역 파일 배포

패키지의 번역 파일을 애플리케이션의 `resources/lang/vendor` 디렉터리로 복사해서 배포하고 싶다면, 서비스 프로바이더의 `publishes` 메서드를 사용합니다. 이 메서드는 패키지 경로와 배포할 위치의 배열을 인자로 받습니다. 예를 들어 `courier` 패키지의 번역 파일을 배포하려면 다음과 같이 합니다:

```
/**
 * Bootstrap any package services.
 *
 * @return void
 */
public function boot()
{
    $this->loadTranslationsFrom(__DIR__.'/../resources/lang', 'courier');

    $this->publishes([
        __DIR__.'/../resources/lang' => resource_path('lang/vendor/courier'),
    ]);
}
```

이제 패키지 사용자가 라라벨의 `vendor:publish` 아티즌 명령어를 실행하면, 번역 파일이 지정한 위치로 복사됩니다.

<a name="views"></a>
### 뷰

패키지의 [뷰](/docs/8.x/views)를 라라벨에서 사용할 수 있도록 등록하려면, 뷰 파일이 어디에 있는지 라라벨에 알려야 합니다. 서비스 프로바이더의 `loadViewsFrom` 메서드를 이용하여 뷰 경로와 패키지 이름을 입력합니다. 예를 들어, 패키지명이 `courier`라면 `boot` 메서드에 아래 코드를 추가하세요:

```
/**
 * Bootstrap any package services.
 *
 * @return void
 */
public function boot()
{
    $this->loadViewsFrom(__DIR__.'/../resources/views', 'courier');
}
```

패키지 뷰는 `package::view` 문법으로 참조합니다. 뷰 경로를 등록한 후에는 아래와 같이 `courier` 패키지의 `dashboard` 뷰를 사용할 수 있습니다:

```
Route::get('/dashboard', function () {
    return view('courier::dashboard');
});
```

<a name="overriding-package-views"></a>
#### 패키지 뷰 오버라이드

`loadViewsFrom` 메서드를 사용하면, 라라벨은 내부적으로 두 곳을 뷰 탐색 경로로 등록합니다: 애플리케이션의 `resources/views/vendor` 디렉터리와 패키지 뷰 디렉터리입니다. 예를 들어, 개발자가 `resources/views/vendor/courier` 디렉터리에 뷰 파일을 직접 만들어 두었다면, 라라벨은 이 파일부터 우선적으로 불러옵니다. 해당 뷰 파일이 없으면 패키지 내부 뷰 디렉터리에서 찾게 됩니다. 이를 통해 패키지 사용자가 뷰를 쉽게 커스터마이즈/오버라이드할 수 있습니다.

<a name="publishing-views"></a>
#### 뷰 파일 배포

패키지의 뷰 파일을 애플리케이션의 `resources/views/vendor` 디렉터리로 배포하려면, 서비스 프로바이더의 `publishes` 메서드를 사용합니다. 이 메서드는 패키지 뷰 경로와 복사할 위치의 경로 배열을 받습니다:

```
/**
 * Bootstrap the package services.
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

이제 패키지 사용자가 라라벨의 `vendor:publish` 명령어를 실행하면, 뷰 파일이 지정한 위치로 복사됩니다.

<a name="view-components"></a>
### 뷰 컴포넌트

패키지에 [뷰 컴포넌트](/docs/8.x/blade#components)가 포함되어 있다면, `loadViewComponentsAs` 메서드를 통해 라라벨에 등록할 수 있습니다. 이 메서드는 컴포넌트 태그의 접두사, 그리고 컴포넌트 클래스명을 담은 배열을 받습니다. 예를 들어, 접두사가 `courier`이고 `Alert`, `Button` 컴포넌트가 있다면, 서비스 프로바이더의 `boot` 메서드에 아래처럼 추가합니다:

```
use Courier\Components\Alert;
use Courier\Components\Button;

/**
 * Bootstrap any package services.
 *
 * @return void
 */
public function boot()
{
    $this->loadViewComponentsAs('courier', [
        Alert::class,
        Button::class,
    ]);
}
```

뷰 컴포넌트를 등록했다면, 뷰 파일에서 아래와 같이 사용할 수 있습니다:

```
<x-courier-alert />

<x-courier-button />
```

<a name="anonymous-components"></a>
#### 익명 컴포넌트

패키지에 익명 뷰 컴포넌트가 있다면, 반드시 패키지 "뷰" 디렉터리의 `components` 폴더 안에 위치해야 합니다 (`loadViewsFrom`에서 지정한 경로 내). 그런 다음, 컴포넌트 이름 앞에 패키지의 뷰 네임스페이스를 붙여서 아래와 같이 사용할 수 있습니다:

```
<x-courier::alert />
```

<a name="commands"></a>
## 아티즌 명령어

패키지의 아티즌 명령어를 라라벨에 등록하려면, `commands` 메서드를 사용하세요. 이 메서드는 명령어 클래스명 배열을 인자로 받습니다. 등록이 완료된 후에는 [Artisan CLI](/docs/8.x/artisan)로 명령어를 실행할 수 있습니다:

```
use Courier\Console\Commands\InstallCommand;
use Courier\Console\Commands\NetworkCommand;

/**
 * Bootstrap any package services.
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

패키지에 JavaScript, CSS, 이미지 등 에셋 파일이 있다면, 서비스 프로바이더의 `publishes` 메서드를 사용해 애플리케이션의 `public` 디렉터리로 배포할 수 있습니다. 아래 예제에서는 `public` 에셋 그룹 태그도 함께 지정했는데, 이를 통해 관련 에셋들을 쉽게 함께 배포할 수 있습니다:

```
/**
 * Bootstrap any package services.
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

이제 패키지 사용자가 `vendor:publish` 명령어를 실행하면, 에셋이 지정한 위치로 복사됩니다. 패키지를 업데이트할 때마다 에셋을 덮어써야 할 경우가 많으므로, 아래처럼 `--force` 옵션을 사용할 수 있습니다:

```
php artisan vendor:publish --tag=public --force
```

<a name="publishing-file-groups"></a>
## 파일 그룹 퍼블리싱

패키지의 여러 에셋과 리소스를 원하는 그룹별로 따로 배포할 수 있습니다. 예를 들어, 사용자가 설정 파일만 배포하고 에셋은 따로 배포하지 않게 하고 싶을 수 있습니다. 이럴 때 패키지의 서비스 프로바이더에서 `publishes` 메서드를 호출할 때 "태그(tag)"를 지정해 여러 그룹을 정의할 수 있습니다. 아래는 `courier` 패키지에서 `courier-config`와 `courier-migrations`라는 두 배포 그룹을 `boot` 메서드에서 정의하는 예시입니다:

```
/**
 * Bootstrap any package services.
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

이제 사용자들은 `vendor:publish` 명령어를 실행할 때 원하는 태그를 지정해 그룹별로 선택적으로 배포할 수 있습니다:

```
php artisan vendor:publish --tag=courier-config
```
