# 라라벨 페넌트 (Laravel Pennant)

- [소개](#introduction)
- [설치](#installation)
- [구성](#configuration)
- [기능 플래그 정의하기](#defining-features)
    - [클래스 기반 기능 플래그](#class-based-features)
- [기능 플래그 확인하기](#checking-features)
    - [조건부 실행](#conditional-execution)
    - [`HasFeatures` 트레이트](#the-has-features-trait)
    - [Blade 디렉티브](#blade-directive)
    - [미들웨어](#middleware)
    - [기능 플래그 체크 가로채기](#intercepting-feature-checks)
    - [메모리 내 캐시](#in-memory-cache)
- [스코프](#scope)
    - [스코프 지정하기](#specifying-the-scope)
    - [기본 스코프](#default-scope)
    - [널 스코프](#nullable-scope)
    - [스코프 식별](#identifying-scope)
    - [스코프 직렬화](#serializing-scope)
- [리치 피처 값](#rich-feature-values)
- [여러 기능 플래그 가져오기](#retrieving-multiple-features)
- [이거 로딩(Eager Loading)](#eager-loading)
- [값 업데이트하기](#updating-values)
    - [대량 업데이트](#bulk-updates)
    - [기능 플래그 정리(Purging)](#purging-features)
- [테스트](#testing)
- [커스텀 페넌트 드라이버 추가하기](#adding-custom-pennant-drivers)
    - [드라이버 구현하기](#implementing-the-driver)
    - [드라이버 등록하기](#registering-the-driver)
    - [외부에서 기능 플래그 정의하기](#defining-features-externally)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

[Laravel Pennant](https://github.com/laravel/pennant)는 불필요한 복잡함 없이 간편하고 가벼운 기능 플래그(Feature Flag) 패키지입니다. 기능 플래그를 사용하면 새로운 애플리케이션 기능을 점진적으로 사용자에게 제공하면서도 신뢰성 있게 적용할 수 있고, 새로운 UI 디자인에 대한 A/B 테스트, trunk 기반 개발 전략을 보완하는 등 다양한 시나리오에 활용할 수 있습니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 관리자를 이용해 Pennant를 프로젝트에 설치합니다.

```shell
composer require laravel/pennant
```

그 다음, `vendor:publish` 아티즌 명령어를 사용해 Pennant 설정 및 마이그레이션 파일을 게시해야 합니다.

```shell
php artisan vendor:publish --provider="Laravel\Pennant\PennantServiceProvider"
```

마지막으로, 애플리케이션의 데이터베이스 마이그레이션을 실행합니다. 이 작업은 Pennant의 `database` 드라이버가 사용하는 `features` 테이블을 생성합니다.

```shell
php artisan migrate
```

<a name="configuration"></a>
## 구성

Pennant의 에셋을 게시한 후, 설정 파일은 `config/pennant.php` 위치에 생성됩니다. 이 설정 파일을 통해 Pennant가 기능 플래그 값을 저장할 때 사용할 기본 저장소 방식(storage driver)을 지정할 수 있습니다.

Pennant는 두 가지 방식으로 플래그 값을 저장할 수 있습니다. 첫째, `array` 드라이버를 사용하면 메모리 내 배열로 플래그 값을 저장할 수 있고, 둘째로 `database` 드라이버를 사용하면 관계형 데이터베이스에 영구적으로 기능 플래그 값을 저장할 수 있습니다. Pennant의 기본 저장 방식은 `database`입니다.

<a name="defining-features"></a>
## 기능 플래그 정의하기

기능 플래그를 정의하려면 `Feature` 파사드의 `define` 메서드를 사용할 수 있습니다. 이때 기능 플래그의 이름과, 기능의 초기 값을 결정할 클로저를 전달해야 합니다.

일반적으로 서비스 프로바이더에서 `Feature` 파사드를 사용하여 기능 플래그를 정의합니다. 이 클로저는 기능 체크를 위한 "스코프(scope)"를 인수로 받게 되는데, 대부분의 경우 현재 인증된 사용자가 이 스코프가 됩니다. 아래 예시에선 애플리케이션 사용자를 대상으로 새로운 API를 점진적으로 적용하는 기능 플래그를 정의합니다.

```php
<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Lottery;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Feature::define('new-api', fn (User $user) => match (true) {
            $user->isInternalTeamMember() => true,
            $user->isHighTrafficCustomer() => false,
            default => Lottery::odds(1 / 100),
        });
    }
}
```

위 코드에서 기능 플래그에 적용된 규칙은 다음과 같습니다.

- 모든 내부 팀 구성원은 반드시 새로운 API를 사용합니다.
- 대량 트래픽 고객은 새로운 API를 사용하지 않습니다.
- 그 외의 경우에는, 100명 중 1명 비율로 무작위로 새로운 API가 활성화됩니다.

`new-api` 기능 플래그가 어떤 사용자에게 처음 체크될 때, 해당 클로저의 실행 결과가 저장소 드라이버에 저장됩니다. 이후 동일 사용자에 대해 기능 플래그를 다시 체크할 경우에는 저장된 값이 바로 반환되며, 클로저는 다시 실행되지 않습니다.

만약 기능 플래그의 정의가 단순히 로터리(Lottery)를 반환한다면, 클로저조차 생략할 수 있습니다.

```
Feature::define('site-redesign', Lottery::odds(1, 1000));
```

<a name="class-based-features"></a>
### 클래스 기반 기능 플래그

Pennant는 클래스 기반으로 기능 플래그를 정의할 수도 있습니다. 클로저 기반 정의와는 달리, 클래스 기반 기능은 서비스 프로바이더에서 별도로 등록할 필요가 없습니다. 기능 플래그 클래스를 생성하려면, `pennant:feature` 아티즌 명령어를 실행합니다. 기본적으로 생성된 기능 플래그 클래스는 `app/Features` 디렉터리에 위치하게 됩니다.

```shell
php artisan pennant:feature NewApi
```

기능 플래그 클래스를 작성할 때는, 해당 스코프에 대해 기능의 초기 값을 결정할 `resolve` 메서드만 구현하면 됩니다. 이때 스코프는 마찬가지로 현재 인증된 사용자일 가능성이 높습니다.

```php
<?php

namespace App\Features;

use App\Models\User;
use Illuminate\Support\Lottery;

class NewApi
{
    /**
     * Resolve the feature's initial value.
     */
    public function resolve(User $user): mixed
    {
        return match (true) {
            $user->isInternalTeamMember() => true,
            $user->isHighTrafficCustomer() => false,
            default => Lottery::odds(1 / 100),
        };
    }
}
```

클래스 기반 기능 플래그의 인스턴스를 직접 사용해서 값을 확인하고 싶다면, `Feature` 파사드의 `instance` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\Feature;

$instance = Feature::instance(NewApi::class);
```

> [!NOTE]   
> 기능 플래그 클래스는 [서비스 컨테이너](/docs/11.x/container)를 통해 의존성 주입이 가능하므로, 필요에 따라 생성자에서 의존성을 주입받을 수 있습니다.

#### 저장되는 기능 플래그 이름 커스터마이즈하기

기본적으로 Pennant는 해당 기능 플래그 클래스의 전체 경로가 포함된 클래스명을 기능 이름으로 저장합니다. 만약 기능 플래그 이름을 애플리케이션 내부 구조에서 분리해서 관리하고 싶다면, 클래스 내에 `$name` 속성을 지정할 수 있습니다. 이 속성의 값이 클래스명이 아닌 저장소에 기록됩니다.

```php
<?php

namespace App\Features;

class NewApi
{
    /**
     * The stored name of the feature.
     *
     * @var string
     */
    public $name = 'new-api';

    // ...
}
```

<a name="checking-features"></a>
## 기능 플래그 확인하기

기능 플래그가 활성 상태인지를 확인하려면 `Feature` 파사드의 `active` 메서드를 사용합니다. 기본적으로 현재 인증된 사용자에 대해 플래그가 체크됩니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        return Feature::active('new-api')
            ? $this->resolveNewApiResponse($request)
            : $this->resolveLegacyApiResponse($request);
    }

    // ...
}
```

비록 기본으로는 현재 인증된 사용자를 기준으로 체크하지만, 다른 사용자나 [다른 스코프](#scope)를 기준으로 기능 플래그를 확인하고 싶다면 `Feature` 파사드의 `for` 메서드를 사용할 수 있습니다.

```php
return Feature::for($user)->active('new-api')
    ? $this->resolveNewApiResponse($request)
    : $this->resolveLegacyApiResponse($request);
```

Pennant는 이 외에도 기능 플래그의 활성화 여부를 보다 쉽게 확인할 수 있는 다양한 편의 메서드를 제공합니다.

```php
// 지정한 모든 기능 플래그가 활성 상태인지 확인...
Feature::allAreActive(['new-api', 'site-redesign']);

// 지정한 기능 플래그 중 하나라도 활성 상태인지 확인...
Feature::someAreActive(['new-api', 'site-redesign']);

// 특정 기능 플래그가 비활성 상태인지 확인...
Feature::inactive('new-api');

// 지정한 모든 기능 플래그가 비활성 상태인지 확인...
Feature::allAreInactive(['new-api', 'site-redesign']);

// 지정한 기능 플래그 중 하나라도 비활성 상태인지 확인...
Feature::someAreInactive(['new-api', 'site-redesign']);
```

> [!NOTE]  
> 아티즌 명령어나 큐 처리 작업 등 HTTP 컨텍스트 외부에서 Pennant를 사용할 땐, 보통 [명시적으로 기능 플래그의 스코프를 지정](#specifying-the-scope)해야 합니다. 또는, 인증된 HTTP와 비인증 컨텍스트를 모두 고려하는 [기본 스코프](#default-scope)를 미리 정의해 둘 수도 있습니다.

<a name="checking-class-based-features"></a>
#### 클래스 기반 기능 플래그 상태 확인하기

클래스 기반 기능 플래그의 상태를 확인할 땐, 해당 클래스명을 전달해야 합니다.

```php
<?php

namespace App\Http\Controllers;

use App\Features\NewApi;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        return Feature::active(NewApi::class)
            ? $this->resolveNewApiResponse($request)
            : $this->resolveLegacyApiResponse($request);
    }

    // ...
}
```

<a name="conditional-execution"></a>
### 조건부 실행

`when` 메서드를 사용하면 어떤 기능 플래그가 활성 상태일 때 클로저를 실행할 수 있습니다. 추가로, 두 번째 클로저를 전달하면 기능이 비활성 상태일 때 해당 클로저가 실행됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Features\NewApi;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        return Feature::when(NewApi::class,
            fn () => $this->resolveNewApiResponse($request),
            fn () => $this->resolveLegacyApiResponse($request),
        );
    }

    // ...
}
```

`unless` 메서드는 `when` 메서드의 반대 역할을 하며, 기능 플래그가 비활성 상태일 때 첫 번째 클로저가 실행됩니다.

```
return Feature::unless(NewApi::class,
    fn () => $this->resolveLegacyApiResponse($request),
    fn () => $this->resolveNewApiResponse($request),
);
```

<a name="the-has-features-trait"></a>
### `HasFeatures` 트레이트

Pennant의 `HasFeatures` 트레이트는 애플리케이션의 `User` 모델(또는 기능 플래그를 사용하는 어떤 모델)에 추가할 수 있습니다. 이를 통해 해당 모델 인스턴스에서 직접 기능 플래그를 편리하게 확인할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Pennant\Concerns\HasFeatures;

class User extends Authenticatable
{
    use HasFeatures;

    // ...
}
```

트레이트를 모델에 추가한 후에는, 아래와 같이 `features` 메서드를 사용해 바로 기능 플래그 상태를 확인할 수 있습니다.

```php
if ($user->features()->active('new-api')) {
    // ...
}
```

물론, `features` 메서드를 사용해서 다양한 편의 메서드도 이용할 수 있습니다.

```php
// 값 가져오기...
$value = $user->features()->value('purchase-button')
$values = $user->features()->values(['new-api', 'purchase-button']);

// 상태 확인...
$user->features()->active('new-api');
$user->features()->allAreActive(['new-api', 'server-api']);
$user->features()->someAreActive(['new-api', 'server-api']);

$user->features()->inactive('new-api');
$user->features()->allAreInactive(['new-api', 'server-api']);
$user->features()->someAreInactive(['new-api', 'server-api']);

// 조건부 실행...
$user->features()->when('new-api',
    fn () => /* ... */,
    fn () => /* ... */,
);

$user->features()->unless('new-api',
    fn () => /* ... */,
    fn () => /* ... */,
);
```

<a name="blade-directive"></a>
### Blade 디렉티브

Blade 템플릿에서 기능 플래그 체크를 더욱 편리하게 할 수 있도록, Pennant는 `@feature`와 `@featureany` 디렉티브를 제공합니다.

```blade
@feature('site-redesign')
    <!-- 'site-redesign'가 활성 상태임 -->
@else
    <!-- 'site-redesign'가 비활성 상태임 -->
@endfeature

@featureany(['site-redesign', 'beta'])
    <!-- 'site-redesign' 또는 `beta`가 활성 상태임 -->
@endfeatureany
```

<a name="middleware"></a>
### 미들웨어

Pennant에는 [미들웨어](/docs/11.x/middleware)도 포함되어 있습니다. 이 미들웨어를 사용하면, 지정한 기능 플래그가 활성화되어 있는 현재 인증된 사용자만 해당 라우트에 접근할 수 있습니다. 만약 지정한 기능들 중 하나라도 비활성 상태라면 해당 라우트에서는 `400 Bad Request` HTTP 응답을 반환합니다. 여러 기능 플래그를 `using` 메서드로 전달할 수 있습니다.

```php
use Illuminate\Support\Facades\Route;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

Route::get('/api/servers', function () {
    // ...
})->middleware(EnsureFeaturesAreActive::using('new-api', 'servers-api'));
```

<a name="customizing-the-response"></a>
#### 미들웨어 응답 커스터마이즈하기

만약 미들웨어에서 필요한 기능 플래그가 비활성화된 경우 반환되는 응답을 직접 지정하고 싶다면, `EnsureFeaturesAreActive` 미들웨어의 `whenInactive` 메서드를 사용할 수 있습니다. 주로 애플리케이션 서비스 프로바이더의 `boot` 메서드에서 설정합니다.

```php
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    EnsureFeaturesAreActive::whenInactive(
        function (Request $request, array $features) {
            return new Response(status: 403);
        }
    );

    // ...
}
```

<a name="intercepting-feature-checks"></a>
### 기능 플래그 체크 가로채기

경우에 따라, 저장된 기능 값에 접근하기 전에 별도의 메모리 내 체크를 먼저 실행하고 싶을 수 있습니다. 예를 들어, 새로운 API를 기능 플래그로 관리하고 있는데, 치명적인 버그가 발생하면 누적된 플래그 값은 그대로 두고 모든 사용자에게 일괄적으로 일시 정지(disable)하고 싶을 수 있습니다. 이럴 때는, 내부 팀원만 사용하도록 잠시 한정했다가, 버그를 고친 후 다시 다른 사용자에게 접근을 개방할 수도 있습니다.

이러한 요구는 [클래스 기반 기능 플래그](#class-based-features)의 `before` 메서드를 사용하여 처리할 수 있습니다. `before` 메서드는 항상 메모리 내에서 먼저 실행되며, 만약 이 메서드가 `null`이 아닌 값을 반환하면, 해당 요청 동안에는 저장된 기능 값 대신 그 값을 사용하게 됩니다.

```php
<?php

namespace App\Features;

use App\Models\User;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Lottery;

class NewApi
{
    /**
     * Run an always-in-memory check before the stored value is retrieved.
     */
    public function before(User $user): mixed
    {
        if (Config::get('features.new-api.disabled')) {
            return $user->isInternalTeamMember();
        }
    }

    /**
     * Resolve the feature's initial value.
     */
    public function resolve(User $user): mixed
    {
        return match (true) {
            $user->isInternalTeamMember() => true,
            $user->isHighTrafficCustomer() => false,
            default => Lottery::odds(1 / 100),
        };
    }
}
```

위 방식은, 이전에는 기능 플래그로 관리하던 기능의 전역 공개 일정을 자동화할 때도 사용할 수 있습니다.

```php
<?php

namespace App\Features;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;

class NewApi
{
    /**
     * Run an always-in-memory check before the stored value is retrieved.
     */
    public function before(User $user): mixed
    {
        if (Config::get('features.new-api.disabled')) {
            return $user->isInternalTeamMember();
        }

        if (Carbon::parse(Config::get('features.new-api.rollout-date'))->isPast()) {
            return true;
        }
    }

    // ...
}
```

<a name="in-memory-cache"></a>
### 메모리 내 캐시

Pennant로 기능 플래그를 확인할 때, 결과 값은 메모리 내에 캐시됩니다. `database` 드라이버를 사용하는 환경이라면, 동일 기능 플래그를 한 요청 내에서 여러 번 확인해도 추가 데이터베이스 쿼리가 발생하지 않습니다. 이로 인해, 요청이 종료될 때까지 기능 플래그의 결과가 항상 일관성 있게 유지됩니다.

메모리 내 캐시를 직접 비우고 싶을 때는, `Feature` 파사드의 `flushCache` 메서드를 사용할 수 있습니다.

```
Feature::flushCache();
```

<a name="scope"></a>
## 스코프

<a name="specifying-the-scope"></a>
### 스코프 지정하기

앞서 설명했듯이, 기능 플래그는 보통 현재 인증된 사용자를 기준으로 체크합니다. 하지만, 항상 이 방식이 최적은 아닐 수 있습니다. 이런 경우엔 `Feature` 파사드의 `for` 메서드로 직접 확인하고 싶은 "스코프"를 지정할 수 있습니다.

```php
return Feature::for($user)->active('new-api')
    ? $this->resolveNewApiResponse($request)
    : $this->resolveLegacyApiResponse($request);
```

스코프는 "사용자"에만 국한되지 않습니다. 예를 들어, 팀 단위로 새로운 결제 경험을 단계적으로 적용하려고 할 수 있습니다. 이때 오래된 팀부터 순차적으로 적용 속도를 조절하고 싶다면, 다음과 같이 플래그 해석 클로저를 작성할 수 있습니다.

```php
use App\Models\Team;
use Carbon\Carbon;
use Illuminate\Support\Lottery;
use Laravel\Pennant\Feature;

Feature::define('billing-v2', function (Team $team) {
    if ($team->created_at->isAfter(new Carbon('1st Jan, 2023'))) {
        return true;
    }

    if ($team->created_at->isAfter(new Carbon('1st Jan, 2019'))) {
        return Lottery::odds(1 / 100);
    }

    return Lottery::odds(1 / 1000);
});
```

이 예시처럼, 클로저가 `User`가 아닌 `Team` 모델을 기대하고 있습니다. 특정 사용자의 소속 팀에 대해 해당 기능이 활성화되어 있는지 확인하려면, `Feature` 파사드의 `for` 메서드에 팀 객체를 전달하면 됩니다.

```php
if (Feature::for($user->team)->active('billing-v2')) {
    return redirect('/billing/v2');
}

// ...
```

<a name="default-scope"></a>
### 기본 스코프

Pennant가 기능 플래그를 확인할 때 사용할 기본 스코프도 커스터마이즈할 수 있습니다. 예를 들어, 모든 기능 플래그를 '사용자'가 아닌, 인증된 사용자의 '팀'을 기준으로 체크하고 싶다면 일일이 `Feature::for($user->team)`을 사용할 필요 없이 기본 스코프를 팀으로 지정해 둘 수 있습니다. 일반적으로 이 설정은 애플리케이션의 서비스 프로바이더에서 적용합니다.

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Feature::resolveScopeUsing(fn ($driver) => Auth::user()?->team);

        // ...
    }
}
```

이렇게 기본 스코프를 지정하면, `for` 메서드로 스코프를 별도로 지정하지 않는 경우에도 자동으로 현재 인증된 사용자의 팀을 기준으로 기능 플래그를 확인하게 됩니다.

```php
Feature::active('billing-v2');

// 위 코드는 다음과 동일하게 동작합니다...

Feature::for($user->team)->active('billing-v2');
```

<a name="nullable-scope"></a>

### Nullable Scope

특정 기능의 사용 여부를 확인할 때 전달하는 스코프(scope)가 `null`이고, 해당 기능 정의에서 nullable 타입으로 `null`을 지원하지 않거나 union 타입에 `null`이 포함되어 있지 않다면, Pennant는 자동으로 해당 기능의 결과값을 `false`로 반환합니다.

따라서, 기능의 스코프가 상황에 따라 `null`이 될 수 있고, 기능 값 해결(resolver)을 꼭 실행하고 싶다면, 기능 정의에서 이를 고려해주어야 합니다. 예를 들어 Artisan 명령어, 큐에 등록된 작업, 인증되지 않은 라우트에서 기능 체크를 수행하는 경우에는 일반적으로 인증된 사용자가 없어, 기본 스코프가 `null`이 됩니다.

항상 [기능 스코프를 명시적으로 지정](#specifying-the-scope)하지 않는다면, 스코프의 타입을 nullable로 처리하고, 기능 정의 로직에서 `null` 스코프 값을 처리하도록 해야 합니다.

```php
use App\Models\User;
use Illuminate\Support\Lottery;
use Laravel\Pennant\Feature;

Feature::define('new-api', fn (User $user) => match (true) {// [tl! remove]
Feature::define('new-api', fn (User|null $user) => match (true) {// [tl! add]
    $user === null => true,// [tl! add]
    $user->isInternalTeamMember() => true,
    $user->isHighTrafficCustomer() => false,
    default => Lottery::odds(1 / 100),
});
```

<a name="identifying-scope"></a>
### 스코프 식별하기

Pennant의 기본 `array` 및 `database` 저장 드라이버는 모든 PHP 데이터 타입과 Eloquent 모델에 대해 스코프 식별자를 올바르게 저장할 수 있습니다. 하지만, 애플리케이션에서 써드파티 Pennant 드라이버를 사용하는 경우, 해당 드라이버는 Eloquent 모델이나 애플리케이션의 커스텀 타입에 대한 식별자를 제대로 저장하지 못할 수도 있습니다.

이러한 상황을 고려해, Pennant에서는 애플리케이션에서 Pennant 스코프로 사용할 객체에 `FeatureScopeable` 인터페이스를 구현하여 스코프 값을 저장용으로 포맷할 수 있도록 지원합니다.

예를 들어, 하나의 애플리케이션에서 내장 `database` 드라이버와 써드파티 "Flag Rocket" 드라이버를 함께 사용한다고 가정해보겠습니다. "Flag Rocket" 드라이버는 Eloquent 모델을 제대로 저장하지 못하고, 대신 `FlagRocketUser` 인스턴스를 요구합니다. 이럴 때 `FeatureScopeable` 인터페이스의 `toFeatureIdentifier` 메서드를 구현하여, 각 드라이버가 요구하는 스코프 값을 원하는 형태로 커스텀할 수 있습니다.

```php
<?php

namespace App\Models;

use FlagRocket\FlagRocketUser;
use Illuminate\Database\Eloquent\Model;
use Laravel\Pennant\Contracts\FeatureScopeable;

class User extends Model implements FeatureScopeable
{
    /**
     * 지정된 드라이버용으로 스코프 식별자를 반환합니다.
     */
    public function toFeatureIdentifier(string $driver): mixed
    {
        return match($driver) {
            'database' => $this,
            'flag-rocket' => FlagRocketUser::fromId($this->flag_rocket_id),
        };
    }
}
```

<a name="serializing-scope"></a>
### 스코프 직렬화

기본적으로 Pennant는 Eloquent 모델과 연결된 기능 정보를 저장할 때, 완전히 수식된 클래스 이름(fully qualified class name)을 사용합니다. 만약 이미 [Eloquent morph map](/docs/11.x/eloquent-relationships#custom-polymorphic-types)을 사용 중이라면, Pennant 또한 morph map을 활용해 저장되는 기능이 애플리케이션 구조에서 분리되도록 할 수 있습니다.

이를 위해 서비스 프로바이더에서 Eloquent morph map을 설정한 뒤, `Feature` 파사드의 `useMorphMap` 메서드를 호출하면 됩니다.

```php
use Illuminate\Database\Eloquent\Relations\Relation;
use Laravel\Pennant\Feature;

Relation::enforceMorphMap([
    'post' => 'App\Models\Post',
    'video' => 'App\Models\Video',
]);

Feature::useMorphMap();
```

<a name="rich-feature-values"></a>
## 리치(rich) 값 사용 기능

지금까지는 기능이 "활성/비활성"의 이진(boolean) 상태인 것으로만 설명했지만, Pennant는 더 복합적인(리치) 값을 저장하는 것도 지원합니다.

예를 들어, 애플리케이션의 "Buy now" 버튼 색상을 A/B 테스트한다고 가정하면, 기능 정의에서 `true` 혹은 `false` 값을 반환하는 대신 문자열 값을 반환할 수 있습니다.

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn (User $user) => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

`purchase-button` 기능의 값을 가져오려면 `value` 메서드를 사용하면 됩니다.

```php
$color = Feature::value('purchase-button');
```

Pennant의 Blade 지시문을 사용하면, 기능의 현재 값에 따라 조건부로 뷰를 렌더링할 수 있습니다.

```blade
@feature('purchase-button', 'blue-sapphire')
    <!-- 'blue-sapphire'가 활성화된 경우 -->
@elsefeature('purchase-button', 'seafoam-green')
    <!-- 'seafoam-green'이 활성화된 경우 -->
@elsefeature('purchase-button', 'tart-orange')
    <!-- 'tart-orange'가 활성화된 경우 -->
@endfeature
```

> [!NOTE]   
> 리치 값 사용 시 기능의 값이 `false`가 아니기만 하면 "활성"으로 간주된다는 점을 꼭 알고 있어야 합니다.

[조건부 `when` 메서드](#conditional-execution)를 호출하면, 해당 기능의 리치 값이 첫 번째 클로저로 전달됩니다.

```
Feature::when('purchase-button',
    fn ($color) => /* ... */,
    fn () => /* ... */,
);
```

마찬가지로 조건부 `unless` 메서드를 사용할 때는, 리치 값이 두 번째(선택적) 클로저로 전달됩니다.

```
Feature::unless('purchase-button',
    fn () => /* ... */,
    fn ($color) => /* ... */,
);
```

<a name="retrieving-multiple-features"></a>
## 다수 기능의 값 가져오기

`values` 메서드를 사용하면, 주어진 스코프에 대해 여러 기능의 값을 한 번에 가져올 수 있습니다.

```php
Feature::values(['billing-v2', 'purchase-button']);

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
// ]
```

혹은, `all` 메서드를 사용해 현재 스코프에 대해 정의된 모든 기능 값을 가져올 수도 있습니다.

```php
Feature::all();

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
//     'site-redesign' => true,
// ]
```

단, 클래스 기반 기능은 동적으로 등록되며, Pennant에서 해당 기능을 명시적으로 체크하기 전까지는 인식하지 못합니다. 즉, 현재 요청에서 아직 체크되지 않은 클래스 기반 기능은 `all` 메서드 결과에 나타나지 않을 수 있습니다.

항상 `all` 메서드에 기능 클래스들이 포함되게 하려면, Pennant의 기능 자동 검색 기능(Feature Discovery)을 사용할 수 있습니다. 애플리케이션의 서비스 프로바이더에서 `discover` 메서드를 호출하면 됩니다.

```
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스를 부트스트랩합니다.
     */
    public function boot(): void
    {
        Feature::discover();

        // ...
    }
}
```

`discover` 메서드는 애플리케이션의 `app/Features` 디렉터리에 있는 모든 기능 클래스를 등록합니다. 이제 `all` 메서드는 해당 기능들이 현재 요청에서 한 번도 체크되지 않았더라도 결과에 포함하게 됩니다.

```php
Feature::all();

// [
//     'App\Features\NewApi' => true,
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
//     'site-redesign' => true,
// ]
```

<a name="eager-loading"></a>
## 이그저 로딩(Eager Loading)

Pennant는 한 번의 요청 동안 모든 기능 값을 인메모리로 캐시하지만, 상황에 따라 성능 이슈가 발생할 수 있습니다. 이를 개선하기 위해 Pennant는 이그저 로딩(Eager loading) 기능 값 선불러오기 기능을 제공합니다.

예를 들어, 반복문 내에서 각 사용자마다 해당 기능 활성 여부를 체크한다고 가정해 보겠습니다.

```php
use Laravel\Pennant\Feature;

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

만약 데이터베이스 드라이버를 사용하고 있다면, 이 코드는 반복문 내의 모든 사용자에 대해 데이터베이스 쿼리를 실행하게 되어 비효율적일 수 있습니다. 이럴 경우, Pennant의 `load` 메서드를 사용해 여러 사용자(혹은 스코프)에 대해 기능 값을 미리 로딩할 수 있습니다.

```php
Feature::for($users)->load(['notifications-beta']);

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

이미 로딩된 기능 값은 제외하고 필요한 값만 불러오고 싶을 때는 `loadMissing` 메서드를 사용할 수 있습니다.

```php
Feature::for($users)->loadMissing([
    'new-api',
    'purchase-button',
    'notifications-beta',
]);
```

정의된 모든 기능을 로드하려면 `loadAll` 메서드를 사용하면 됩니다.

```php
Feature::for($users)->loadAll();
```

<a name="updating-values"></a>
## 기능 값 업데이트

기능의 값이 최초로 해석(resolved)될 때, Pennant의 드라이버는 해당 결과를 저장소에 저장합니다. 이는 여러 요청 간에 사용자에게 일관된 결과를 제공하기 위해 필요합니다. 다만, 경우에 따라 개발자가 직접 저장된 기능 값을 변경하고 싶을 수도 있습니다.

이럴 땐 `activate`와 `deactivate` 메서드를 사용해 기능을 "켜기/끄기" 할 수 있습니다.

```php
use Laravel\Pennant\Feature;

// 기본 스코프에 대해 기능 활성화...
Feature::activate('new-api');

// 주어진 스코프에 대해 기능 비활성화...
Feature::for($user->team)->deactivate('billing-v2');
```

`activate` 메서드에 두 번째 인자를 전달하면, 기능에 대한 리치 값을 수동으로 지정할 수도 있습니다.

```php
Feature::activate('purchase-button', 'seafoam-green');
```

저장된 기능 값을 Pennant가 잊게(삭제) 하고, 다음 체크 시 기능 정의에서 다시 값을 가져오게 하려면 `forget` 메서드를 사용하면 됩니다.

```php
Feature::forget('purchase-button');
```

<a name="bulk-updates"></a>
### 대량(Bulk) 업데이트

여러 스코프에 걸쳐 저장된 기능 값을 한 번에 업데이트하려면, `activateForEveryone` 및 `deactivateForEveryone` 메서드를 사용할 수 있습니다.

예를 들어, 이제 `new-api` 기능이 충분히 안정적이고, 체크아웃 플로우에서 'purchase-button' 색상을 확정했다면, 모든 사용자에 대해 저장된 값을 한 번에 업데이트할 수 있습니다.

```php
use Laravel\Pennant\Feature;

Feature::activateForEveryone('new-api');

Feature::activateForEveryone('purchase-button', 'seafoam-green');
```

반대로 모든 사용자에 대해 해당 기능을 비활성화할 수도 있습니다.

```php
Feature::deactivateForEveryone('new-api');
```

> [!NOTE]   
> 이 메서드는 Pennant 저장소 드라이버에 저장되어 있는 기능 값만 업데이트합니다. 애플리케이션의 기능 정의 변경도 필요하다면 함께 처리해 주어야 합니다.

<a name="purging-features"></a>
### 기능 값 삭제(Purging Features)

상황에 따라 기능 전체를 저장소에서 완전히 삭제(purge)해야 할 때가 있습니다. 이는 기능을 애플리케이션에서 제거한 경우나, 모든 사용자에게 기능 정의 변경을 즉시 반영하고자 할 때 주로 사용됩니다.

특정 기능의 저장된 모든 값은 `purge` 메서드로 삭제할 수 있습니다.

```php
// 단일 기능 삭제...
Feature::purge('new-api');

// 여러 기능 삭제...
Feature::purge(['new-api', 'purchase-button']);
```

저장소에서 _모든_ 기능을 삭제하려면 인자 없이 `purge` 메서드를 호출하면 됩니다.

```php
Feature::purge();
```

애플리케이션의 배포 파이프라인 중 기능 삭제를 자동화할 수 있도록, Pennant는 명령어 `pennant:purge`를 제공합니다. 이 명령어는 지정한 기능들을 저장소에서 삭제합니다.

```sh
php artisan pennant:purge new-api

php artisan pennant:purge new-api purchase-button
```

특정 기능 목록을 제외한 _모든_ 기능을 삭제하고자 한다면, `--except` 옵션을 사용해 해당 기능명들을 전달하면 됩니다.

```sh
php artisan pennant:purge --except=new-api --except=purchase-button
```

또한, `pennant:purge` 명령어는 `--except-registered` 플래그를 지원합니다. 이 플래그를 사용하면 서비스 프로바이더에 명시적으로 등록된 기능을 제외한 나머지 기능이 삭제됩니다.

```sh
php artisan pennant:purge --except-registered
```

<a name="testing"></a>
## 테스트

기능 플래그와 상호작용하는 코드를 테스트할 때, 테스트 내에서 기능 플래그가 반환하는 값을 쉽게 제어하려면 기능을 다시 정의(re-define)하면 됩니다. 예를 들어, 다음과 같이 서비스 프로바이더에 기능이 정의되어 있다고 가정해보십시오.

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn () => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

테스트 코드에서 반환 값을 임의로 변경하려면, 테스트 시작 시점에 기능을 다시 정의하면 됩니다. 아래의 테스트는 서비스 프로바이더에서 여전히 `Arr::random()`을 사용하고 있더라도 항상 성공합니다.

```php tab=Pest
use Laravel\Pennant\Feature;

test('it can control feature values', function () {
    Feature::define('purchase-button', 'seafoam-green');

    expect(Feature::value('purchase-button'))->toBe('seafoam-green');
});
```

```php tab=PHPUnit
use Laravel\Pennant\Feature;

public function test_it_can_control_feature_values()
{
    Feature::define('purchase-button', 'seafoam-green');

    $this->assertSame('seafoam-green', Feature::value('purchase-button'));
}
```

클래스 기반 기능에 대해서도 동일한 방법을 사용할 수 있습니다.

```php tab=Pest
use Laravel\Pennant\Feature;

test('it can control feature values', function () {
    Feature::define(NewApi::class, true);

    expect(Feature::value(NewApi::class))->toBeTrue();
});
```

```php tab=PHPUnit
use App\Features\NewApi;
use Laravel\Pennant\Feature;

public function test_it_can_control_feature_values()
{
    Feature::define(NewApi::class, true);

    $this->assertTrue(Feature::value(NewApi::class));
}
```

기능이 `Lottery` 인스턴스를 반환하는 경우, Pennant는 [여러 테스트 헬퍼](/docs/11.x/helpers#testing-lotteries)도 제공합니다.

<a name="store-configuration"></a>
#### 저장소(Store) 설정

Pennant가 테스트 중 사용할 저장소는 애플리케이션의 `phpunit.xml` 파일에서 `PENNANT_STORE` 환경 변수를 정의해 지정할 수 있습니다.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit colors="true">
    <!-- ... -->
    <php>
        <env name="PENNANT_STORE" value="array"/>
        <!-- ... -->
    </php>
</phpunit>
```

<a name="adding-custom-pennant-drivers"></a>
## 커스텀 Pennant 드라이버 추가

<a name="implementing-the-driver"></a>
#### 드라이버 구현

Pennant의 기존 저장소 드라이버가 애플리케이션의 요구사항에 맞지 않는다면, 직접 저장소 드라이버를 구현할 수 있습니다. 커스텀 드라이버는 `Laravel\Pennant\Contracts\Driver` 인터페이스를 구현해야 합니다.

```php
<?php

namespace App\Extensions;

use Laravel\Pennant\Contracts\Driver;

class RedisFeatureDriver implements Driver
{
    public function define(string $feature, callable $resolver): void {}
    public function defined(): array {}
    public function getAll(array $features): array {}
    public function get(string $feature, mixed $scope): mixed {}
    public function set(string $feature, mixed $scope, mixed $value): void {}
    public function setForAllScopes(string $feature, mixed $value): void {}
    public function delete(string $feature, mixed $scope): void {}
    public function purge(array|null $features): void {}
}
```

이제 Redis 연결을 사용해 각 메서드를 실제로 구현하면 됩니다. 각 메서드 구현 예시는 [Pennant 소스의 DatabaseDriver](https://github.com/laravel/pennant/blob/1.x/src/Drivers/DatabaseDriver.php)를 참고하면 도움이 됩니다.

> [!NOTE]
> 라라벨은 확장 기능을 위해 기본적으로 별도의 디렉터리를 제공하지 않습니다. 원하는 위치에 자유롭게 파일을 둘 수 있습니다. 본 예제에서는 `Extensions` 디렉터리에 `RedisFeatureDriver`를 위치시켰습니다.

<a name="registering-the-driver"></a>
#### 드라이버 등록

드라이버 구현이 완료되면, 라라벨에 해당 드라이버를 등록해 사용 준비가 끝납니다. Pennant에 커스텀 드라이버를 추가하려면 `Feature` 파사드의 `extend` 메서드를 사용하면 됩니다. 이 메서드는 서비스 프로바이더의 `boot` 메서드에서 호출해야 합니다. ([서비스 프로바이더 문서 참고](/docs/11.x/providers))

```php
<?php

namespace App\Providers;

use App\Extensions\RedisFeatureDriver;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스 등록
     */
    public function register(): void
    {
        // ...
    }

    /**
     * 애플리케이션 서비스 부트스트랩
     */
    public function boot(): void
    {
        Feature::extend('redis', function (Application $app) {
            return new RedisFeatureDriver($app->make('redis'), $app->make('events'), []);
        });
    }
}
```

드라이버가 정상적으로 등록되었다면, 애플리케이션의 `config/pennant.php` 설정 파일에서 `redis` 드라이버를 사용할 수 있습니다.

```
'stores' => [

    'redis' => [
        'driver' => 'redis',
        'connection' => null,
    ],

    // ...

],
```

<a name="defining-features-externally"></a>
### 외부에서 기능 정의하기

커스텀 드라이버가 외부 써드파티 기능 플래그 플랫폼의 래퍼인 경우, 기능을 Pennant의 `Feature::define`을 통해 정의하는 것이 아니라, 플랫폼에서 직접 관리하게 될 것입니다. 이때는 커스텀 드라이버가 반드시 `Laravel\Pennant\Contracts\DefinesFeaturesExternally` 인터페이스도 함께 구현해야 합니다.

```php
<?php

namespace App\Extensions;

use Laravel\Pennant\Contracts\Driver;
use Laravel\Pennant\Contracts\DefinesFeaturesExternally;

class FeatureFlagServiceDriver implements Driver, DefinesFeaturesExternally
{
    /**
     * 주어진 스코프에 대해 정의된 기능 목록을 반환합니다.
     */
    public function definedFeaturesForScope(mixed $scope): array {}

    /* ... */
}
```

`definedFeaturesForScope` 메서드는, 주어진 스코프에 대해 정의된 기능명 리스트를 반환해야 합니다.

<a name="events"></a>
## 이벤트

Pennant는 기능 플래그를 추적하는 데 유용한 다양한 이벤트를 디스패치(dispatch)합니다.

### `Laravel\Pennant\Events\FeatureRetrieved`

이벤트는 [기능이 체크될 때](#checking-features)마다 발생합니다. 이 이벤트는 기능 플래그의 사용에 대한 측정 및 모니터링 메트릭을 수집할 때 유용합니다.

### `Laravel\Pennant\Events\FeatureResolved`

이벤트는 특정 스코프에 대해 기능 값이 처음 결정(resolved)될 때 발생합니다.

### `Laravel\Pennant\Events\UnknownFeatureResolved`

이벤트는 특정 스코프에서 알 수 없는(정의되지 않은) 기능이 처음 해석(resolved)될 때 발생합니다. 만약 기능 플래그를 제거하고자 했으나, 애플리케이션 내 여기저기에 해당 기능의 호출이 남아 있다면, 이 이벤트를 통해 이를 감지할 수 있습니다.

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Laravel\Pennant\Events\UnknownFeatureResolved;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스 부트스트랩
     */
    public function boot(): void
    {
        Event::listen(function (UnknownFeatureResolved $event) {
            Log::error("Resolving unknown feature [{$event->feature}].");
        });
    }
}
```

### `Laravel\Pennant\Events\DynamicallyRegisteringFeatureClass`

이 이벤트는 [클래스 기반 기능](#class-based-features)이 요청 중에 처음으로 동적으로 체크될 때 발생합니다.

### `Laravel\Pennant\Events\UnexpectedNullScopeEncountered`

이 이벤트는 [null을 지원하지 않는](#nullable-scope) 기능 정의에 `null` 스코프가 전달될 때 발생합니다.

이 상황은 시스템이 문제 없이 적절하게 처리하며, 기능은 `false`를 반환합니다. 하지만, 만약 해당 기능의 기본적인 예외 처리 동작을 사용하고 싶지 않다면, 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 이 이벤트의 리스너를 등록할 수 있습니다.

```php
use Illuminate\Support\Facades\Log;
use Laravel\Pennant\Events\UnexpectedNullScopeEncountered;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(UnexpectedNullScopeEncountered::class, fn () => abort(500));
}

```

### `Laravel\Pennant\Events\FeatureUpdated`

이 이벤트는 특정 스코프에 대해 기능을 업데이트할 때, 일반적으로 `activate` 또는 `deactivate`를 호출할 때 발생합니다.

### `Laravel\Pennant\Events\FeatureUpdatedForAllScopes`

이 이벤트는 모든 스코프에 대해 기능을 업데이트할 때, 주로 `activateForEveryone` 또는 `deactivateForEveryone`을 호출할 때 발생합니다.

### `Laravel\Pennant\Events\FeatureDeleted`

이 이벤트는 특정 스코프에 대해 기능을 삭제할 때, 주로 `forget`을 호출할 때 발생합니다.

### `Laravel\Pennant\Events\FeaturesPurged`

이 이벤트는 특정 기능들을 완전히 삭제(purge)할 때 발생합니다.

### `Laravel\Pennant\Events\AllFeaturesPurged`

이 이벤트는 모든 기능을 완전히 삭제(purge)할 때 발생합니다.