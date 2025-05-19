# 라라벨 페넌트 (Laravel Pennant)

- [소개](#introduction)
- [설치](#installation)
- [설정](#configuration)
- [기능(Feature) 정의](#defining-features)
    - [클래스 기반 기능](#class-based-features)
- [기능 확인](#checking-features)
    - [조건부 실행](#conditional-execution)
    - [`HasFeatures` 트레이트](#the-has-features-trait)
    - [Blade 디렉티브](#blade-directive)
    - [미들웨어](#middleware)
    - [기능 확인 가로채기](#intercepting-feature-checks)
    - [인메모리 캐시](#in-memory-cache)
- [스코프(범위)](#scope)
    - [스코프 지정](#specifying-the-scope)
    - [기본 스코프](#default-scope)
    - [nullable 스코프](#nullable-scope)
    - [스코프 식별](#identifying-scope)
    - [스코프 직렬화](#serializing-scope)
- [리치 기능 값](#rich-feature-values)
- [여러 기능 조회](#retrieving-multiple-features)
- [Eager 로딩](#eager-loading)
- [값 업데이트](#updating-values)
    - [대량 업데이트](#bulk-updates)
    - [기능 제거](#purging-features)
- [테스트](#testing)
- [사용자 정의 Pennant 드라이버 추가](#adding-custom-pennant-drivers)
    - [드라이버 구현](#implementing-the-driver)
    - [드라이버 등록](#registering-the-driver)
    - [외부에서 기능 정의](#defining-features-externally)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

[Laravel Pennant](https://github.com/laravel/pennant)는 불필요한 부분을 걷어낸 단순하고 가벼운 기능 플래그(feature flag) 패키지입니다. 기능 플래그를 사용하면 새로운 애플리케이션 기능을 점진적으로 안정적으로 배포할 수 있고, 인터페이스 디자인 A/B 테스트, 트렁크 기반 개발 전략 지원 등 다양한 활용이 가능합니다.

<a name="installation"></a>
## 설치

먼저 Composer 패키지 관리자를 사용하여 Pennant를 프로젝트에 설치하세요.

```shell
composer require laravel/pennant
```

다음으로, `vendor:publish` Artisan 명령어를 사용하여 Pennant의 설정 파일과 마이그레이션 파일을 발행합니다.

```shell
php artisan vendor:publish --provider="Laravel\Pennant\PennantServiceProvider"
```

이제 애플리케이션의 데이터베이스 마이그레이션을 실행해야 합니다. 이를 통해 Pennant에서 `database` 드라이버에 사용하는 `features` 테이블이 생성됩니다.

```shell
php artisan migrate
```

<a name="configuration"></a>
## 설정

Pennant의 에셋을 발행한 후에는 설정 파일이 `config/pennant.php`에 생성됩니다. 이 설정 파일에서는 Pennant가 기능 플래그의 값을 저장할 때 사용할 기본 저장 방식을 지정할 수 있습니다.

Pennant는 `array` 드라이버를 통해 인메모리(메모리 내) 배열에 기능 플래그의 값을 저장하는 방식을 지원합니다. 또는 `database` 드라이버를 통해 관계형 데이터베이스에 값을 영구적으로 저장할 수도 있으며, 이 방식이 Pennant의 기본 저장 메커니즘입니다.

<a name="defining-features"></a>
## 기능(Feature) 정의

기능을 정의하려면 `Feature` 파사드에서 제공하는 `define` 메서드를 사용합니다. 여기에는 기능의 이름과, 기능의 초깃값을 판별하는 클로저를 전달해야 합니다.

보통 기능은 서비스 프로바이더에서 `Feature` 파사드를 사용해 정의하게 됩니다. 클로저에는 기능 확인 시의 "스코프"가 전달되며, 대부분의 경우 스코프는 현재 인증된 사용자입니다. 아래 예시에서는 애플리케이션 사용자에게 새로운 API를 점진적으로 배포하는 기능 플래그를 정의하고 있습니다.

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

위 예시에서 기능의 동작 규칙은 다음과 같습니다.

- 내부 팀 구성원들은 모두 새로운 API를 사용하도록 합니다.
- 트래픽이 많은 고객은 새로운 API를 사용하지 않도록 합니다.
- 그 외의 사용자는 100명 중 1명 확률로 랜덤하게 기능이 활성화되도록 지정합니다.

특정 사용자에 대해 `new-api` 기능이 처음 확인될 때, 클로저의 반환값이 저장 드라이버에 저장됩니다. 이후 동일한 사용자에 대해 같은 기능을 확인할 경우 저장된 값이 사용되며, 클로저가 다시 호출되지 않습니다.

간편하게, 기능 정의가 오직 Lottery만을 반환하는 경우에는 클로저 없이도 기능을 정의할 수 있습니다.

```
Feature::define('site-redesign', Lottery::odds(1, 1000));
```

<a name="class-based-features"></a>
### 클래스 기반 기능

Pennant는 클래스 기반으로 기능을 정의하는 것도 지원합니다. 클로저 기반 기능과 달리, 클래스 기반 기능은 서비스 프로바이더에서 별도로 등록할 필요가 없습니다. 클래스 기반 기능을 생성하려면 `pennant:feature` Artisan 명령어를 실행하면 됩니다. 기본적으로 기능 클래스는 애플리케이션의 `app/Features` 디렉터리에 생성됩니다.

```shell
php artisan pennant:feature NewApi
```

기능 클래스를 작성할 때는, 해당 스코프에 대한 기능의 초깃값을 판별하는 `resolve` 메서드만 정의하면 충분합니다. 여기서도 스코프는 주로 현재 인증된 사용자입니다.

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

클래스 기반 기능 인스턴스를 직접 resolve(생성)하고 싶다면, `Feature` 파사드의 `instance` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\Feature;

$instance = Feature::instance(NewApi::class);
```

> [!NOTE]
> 기능 클래스는 [서비스 컨테이너](/docs/12.x/container)를 통해 resolve되므로, 필요하다면 생성자에 의존성을 주입할 수도 있습니다.

#### 저장되는 기능 이름 커스터마이징

기본적으로 Pennant는 기능 클래스의 전체 네임스페이스 클래스명을 이름으로 저장합니다. 내부 구조와 저장되는 기능 이름을 분리하고 싶다면, 기능 클래스 내에 `$name` 속성을 지정할 수 있습니다. 이 속성의 값이 클래스 이름 대신 저장됩니다.

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
## 기능 확인

특정 기능이 활성화되어 있는지 확인하려면, `Feature` 파사드의 `active` 메서드를 사용합니다. 기본적으로 기능 확인은 현재 인증된 사용자를 기준으로 이루어집니다.

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

기본적으로는 현재 인증된 사용자 별로 기능을 확인하지만, 다른 사용자 또는 [스코프](#scope)에 대해서도 쉽게 기능을 확인할 수 있습니다. 이를 위해 `Feature` 파사드에서 제공하는 `for` 메서드를 사용하세요.

```php
return Feature::for($user)->active('new-api')
    ? $this->resolveNewApiResponse($request)
    : $this->resolveLegacyApiResponse($request);
```

Pennant는 기능 활성 상태를 판별할 때 유용하게 쓸 수 있는 여러 추가 메서드도 제공합니다.

```php
// 주어진 모든 기능이 활성화되어 있는가?
Feature::allAreActive(['new-api', 'site-redesign']);

// 주어진 기능 중 하나라도 활성화되어 있는가?
Feature::someAreActive(['new-api', 'site-redesign']);

// 특정 기능이 비활성화되어 있는가?
Feature::inactive('new-api');

// 주어진 모든 기능이 비활성화되어 있는가?
Feature::allAreInactive(['new-api', 'site-redesign']);

// 주어진 기능 중 하나라도 비활성화되어 있는가?
Feature::someAreInactive(['new-api', 'site-redesign']);
```

> [!NOTE]
> Artisan 명령어나 큐 작업 등 HTTP 컨텍스트가 아닌 환경에서 Pennant를 사용할 때는 [기능의 스코프를 명시적으로 지정하는 것](#specifying-the-scope)이 일반적입니다. 또는 인증된 HTTP 컨텍스트와 비인증 컨텍스트 양쪽 모두를 고려하는 [기본 스코프](#default-scope)를 정의할 수도 있습니다.

<a name="checking-class-based-features"></a>
#### 클래스 기반 기능 확인

클래스 기반 기능에 대해서는, 기능을 확인할 때 클래스 이름을 전달해야 합니다.

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

`when` 메서드를 사용하면, 특정 기능이 활성화된 경우 지정한 클로저를 실행할 수 있습니다. 또한, 두 번째 클로저를 전달하면 기능이 비활성화된 경우 해당 클로저가 실행됩니다.

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
        return Feature::when(NewApi::class,
            fn () => $this->resolveNewApiResponse($request),
            fn () => $this->resolveLegacyApiResponse($request),
        );
    }

    // ...
}
```

`unless` 메서드는 `when` 메서드의 반대 역할을 하며, 기능이 비활성화된 경우 첫 번째 클로저를 실행합니다.

```php
return Feature::unless(NewApi::class,
    fn () => $this->resolveLegacyApiResponse($request),
    fn () => $this->resolveNewApiResponse($request),
);
```

<a name="the-has-features-trait"></a>
### `HasFeatures` 트레이트

Pennant의 `HasFeatures` 트레이트를 애플리케이션의 `User` 모델(혹은 기능을 사용하는 다른 모델)에 추가하면, 모델에서 직접 기능을 간단하고 직관적으로 확인할 수 있습니다.

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

이 트레이트를 모델에 추가하면, `features` 메서드를 호출하여 쉽게 기능을 확인할 수 있습니다.

```php
if ($user->features()->active('new-api')) {
    // ...
}
```

물론, `features` 메서드는 기능을 다루기 위한 여러 편리한 메서드도 제공합니다.

```php
// 값 확인
$value = $user->features()->value('purchase-button')
$values = $user->features()->values(['new-api', 'purchase-button']);

// 상태 확인
$user->features()->active('new-api');
$user->features()->allAreActive(['new-api', 'server-api']);
$user->features()->someAreActive(['new-api', 'server-api']);

$user->features()->inactive('new-api');
$user->features()->allAreInactive(['new-api', 'server-api']);
$user->features()->someAreInactive(['new-api', 'server-api']);

// 조건부 실행
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

Blade에서 기능 플래그를 쉽게 확인할 수 있도록, Pennant는 `@feature`와 `@featureany` 디렉티브를 제공합니다.

```blade
@feature('site-redesign')
    <!-- 'site-redesign' 기능이 활성화됨 -->
@else
    <!-- 'site-redesign' 기능이 비활성화됨 -->
@endfeature

@featureany(['site-redesign', 'beta'])
    <!-- 'site-redesign' 또는 `beta` 기능이 활성화됨 -->
@endfeatureany
```

<a name="middleware"></a>
### 미들웨어

Pennant는 [미들웨어](/docs/12.x/middleware)도 제공하며, 이 미들웨어를 사용하여 현재 인증된 사용자가 기능을 사용할 수 있는지 라우트 실행 전에 미리 검증할 수 있습니다. 미들웨어를 라우트에 할당하고 해당 라우트 접근에 필요한 기능을 지정하세요. 지정한 기능 중 하나라도 현재 사용자에게 비활성화된 경우, 해당 라우트는 `400 Bad Request` HTTP 응답을 반환합니다. 여러 기능은 static `using` 메서드에 나열할 수 있습니다.

```php
use Illuminate\Support\Facades\Route;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

Route::get('/api/servers', function () {
    // ...
})->middleware(EnsureFeaturesAreActive::using('new-api', 'servers-api'));
```

<a name="customizing-the-response"></a>
#### 미들웨어 응답 커스터마이징

지정한 기능 중 하나라도 비활성화되어 있을 때 미들웨어가 반환하는 응답을 원하는 대로 변경하고 싶다면, `EnsureFeaturesAreActive` 미들웨어에서 제공하는 `whenInactive` 메서드를 사용할 수 있습니다. 보통 이 메서드는 애플리케이션 서비스 프로바이더의 `boot` 메서드에서 호출합니다.

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
### 기능 확인 가로채기

기능 플래그의 저장된 값을 가져오기 전에 자체적으로 메모리 내에서 체크를 먼저 실행하고 싶을 때도 있습니다. 예를 들어, 새 API를 기능 플래그 뒤에서 개발하다가 예상치 못한 버그를 발견한다면, 저장된 기능 값에 영향을 주지 않고 내부 팀원만 새 API를 계속 사용할 수 있도록, 나머지 사용자에 대해서는 기능을 일시적으로 비활성화할 수 있습니다. 버그를 수정한 뒤에는 다시 원래대로 돌릴 수 있습니다.

이런 동작은 [클래스 기반 기능](#class-based-features)의 `before` 메서드로 쉽게 달성할 수 있습니다. `before` 메서드가 존재하면, 저장된 값을 조회하기 전에 항상 메모리 내에서 먼저 실행됩니다. 이 메서드가 `null`이 아닌 값을 반환하면, 해당 요청에 한해 기능의 저장값 대신 그 값을 사용합니다.

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

또한, 이전에 기능 플래그로 제한했던 기능을 전체적으로 공개 배포하도록 일정 시점부터 자동 전환하는 스케줄도 이 방식으로 구현할 수 있습니다.

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
### 인메모리 캐시

Pennant로 기능을 확인할 때 Pennant는 결과를 인메모리(메모리 내)로 캐싱합니다. 예를 들어 `database` 드라이버를 사용할 경우, 동일한 기능 플래그를 한 요청 내에서 다시 확인할 때 추가적인 데이터베이스 쿼리가 발생하지 않게 됩니다. 또한 요청이 끝날 때까지 기능의 결과가 일관되게 유지됩니다.

캐시를 수동으로 비우고 싶다면, `Feature` 파사드에서 제공하는 `flushCache` 메서드를 사용하세요.

```php
Feature::flushCache();
```

<a name="scope"></a>
## 스코프(범위)

<a name="specifying-the-scope"></a>
### 스코프 지정

앞서 설명한 것처럼, Pennant에서 기능 확인은 일반적으로 현재 인증된 사용자를 스코프로 수행합니다. 하지만 모든 상황에 적합하지 않을 수 있으므로, `Feature` 파사드의 `for` 메서드를 통해 기능을 확인할 때 사용할 스코프를 직접 지정할 수 있습니다.

```php
return Feature::for($user)->active('new-api')
    ? $this->resolveNewApiResponse($request)
    : $this->resolveLegacyApiResponse($request);
```

기능의 스코프는 반드시 "사용자"일 필요는 없습니다. 예를 들어, 개별 사용자가 아니라 팀 단위로 새로운 결제 환경을 배포하고 싶을 때, 오래된 팀에는 점진적으로 느리게, 새로운 팀에는 빠르게 배포하는 상황을 상상해볼 수 있습니다. 이 경우 기능 확인 클로저는 다음과 같이 작성될 수 있습니다.

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

여기서 주목해야 할 점은, 클로저가 `User`가 아니라 `Team` 모델을 받는다는 것입니다. 사용자의 소속 팀에 대해 기능 활성 여부를 확인하려면, `Feature` 파사드의 `for` 메서드에 팀을 전달하면 됩니다.

```php
if (Feature::for($user->team)->active('billing-v2')) {
    return redirect('/billing/v2');
}

// ...
```

<a name="default-scope"></a>
### 기본 스코프

Pennant가 내부적으로 기능을 확인할 때 사용하는 기본 스코프도 직접 지정할 수 있습니다. 예를 들어, 모든 기능이 항상 현재 인증된 사용자의 팀을 기준으로 확인되는 경우, 기능 확인 때마다 `Feature::for($user->team)`을 매번 호출하는 대신, 팀을 기본 스코프로 설정하면 됩니다. 보통 애플리케이션 서비스 프로바이더에서 아래와 같이 설정합니다.

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

이후 `for` 메서드로 스코프를 명확하게 지정하지 않는 경우, Pennant는 기능 확인 시 자동으로 현재 인증된 사용자의 팀을 기본 스코프로 사용합니다.

```php
Feature::active('billing-v2');

// 다음과 동등합니다.

Feature::for($user->team)->active('billing-v2');
```

<a name="nullable-scope"></a>

### Nullable Scope

특정 기능을 확인할 때 전달하는 스코프(scope)가 `null`이고, 해당 기능의 정의에서 nullable 타입(예: `?User`)이나 `null`을 포함하는 유니언 타입 등으로 `null`을 지원하지 않는다면, Pennant는 해당 기능의 결과값을 자동으로 `false`로 반환합니다.

따라서 기능에 전달하는 스코프가 `null`일 가능성이 있고 그럴 때에도 feature의 value resolver(값을 결정하는 함수)가 호출되길 원한다면, 기능 정의에서 이를 미리 고려해야 합니다. Artisan 명령어, 대기열 작업(queued job), 인증되지 않은 라우트 등에서 feature를 체크하면 스코프가 `null`이 될 수 있습니다. 이런 상황에서는 보통 인증된 사용자가 없으므로 기본 스코프가 `null`이 됩니다.

항상 [기능 스코프를 명시적으로 지정](#specifying-the-scope)하지 않는다면, 스코프 타입을 "nullable"로 지정하고 feature 정의 로직에서 `null` 스코프 값을 처리하도록 해야 합니다.

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
### 스코프 식별자 정의하기

Pennant의 기본 `array` 및 `database` 저장소 드라이버는 모든 PHP 데이터 타입뿐 아니라 Eloquent 모델도 적절하게 스코프 식별자로 저장하는 방법을 알고 있습니다. 하지만, 애플리케이션에서 서드 파티 Pennant 드라이버를 사용하는 경우, 해당 드라이버가 Eloquent 모델이나 여러분이 정의한 타입에 대한 식별자를 적절히 저장하는 방법을 모를 수 있습니다.

이런 상황을 대비해서 Pennant는, Pennant 스코프로 사용하는 애플리케이션의 객체에서 `FeatureScopeable` 계약을 구현하여 스코프 값을 저장에 적합한 형태로 포맷할 수 있습니다.

예를 들어, 한 애플리케이션에서 두 가지 다른 feature 드라이버, 즉 기본 제공 `database` 드라이버와 서드 파티 "Flag Rocket" 드라이버를 같이 사용한다고 가정해봅니다. "Flag Rocket" 드라이버는 Eloquent 모델을 바로 저장하는 방법을 모르고, 대신 `FlagRocketUser` 인스턴스를 필요로 합니다. 이때 `FeatureScopeable` 계약에 정의된 `toFeatureIdentifier`를 구현하면, 각 드라이버에 맞게 저장 가능한 스코프 값을 커스터마이즈하여 제공할 수 있습니다.

```php
<?php

namespace App\Models;

use FlagRocket\FlagRocketUser;
use Illuminate\Database\Eloquent\Model;
use Laravel\Pennant\Contracts\FeatureScopeable;

class User extends Model implements FeatureScopeable
{
    /**
     * 주어진 드라이버에 대해 객체를 feature 스코프 식별자로 변환합니다.
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

기본적으로 Pennant는 Eloquent 모델에 연결된 feature를 저장할 때 '완전히 네임스페이스가 포함된 클래스명'을 사용합니다. 만약 이미 [Eloquent morph map](/docs/12.x/eloquent-relationships#custom-polymorphic-types)을 사용 중이라면, Pennant가 이 morph map을 사용하도록 하여 저장되는 feature가 애플리케이션의 구조에 종속되지 않게 만들 수 있습니다.

이를 위해, 서비스 프로바이더에서 Eloquent morph map을 정의한 다음, `Feature` 파사드의 `useMorphMap` 메서드를 호출하면 됩니다.

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
## 다양한(리치) 기능 값

지금까지는 기능이 "활성" 또는 "비활성" 상태, 즉 2진 상태로만 예시를 들어 설명했지만, Pennant에서는 다양한(리치) 값을 저장하는 것도 가능합니다.

예를 들어, 애플리케이션의 "지금 구매" 버튼에 대해 세 가지 새로운 색상을 테스트한다고 가정해보겠습니다. 이럴 때는 feature 정의에서 `true`나 `false` 대신 문자열 값을 반환할 수 있습니다.

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn (User $user) => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

`purchase-button` feature의 값을 가져오려면 `value` 메서드를 사용합니다.

```php
$color = Feature::value('purchase-button');
```

Pennant에서 제공하는 Blade 디렉티브를 이용하면, feature의 현재 값에 따라 콘텐츠를 손쉽게 조건부로 렌더링할 수 있습니다.

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
> 리치 값을 사용할 때 주의할 점은, `false`가 아닌 어떤 값이든 feature가 "active(활성화됨)"으로 간주된다는 점입니다.

[조건부 `when`](#conditional-execution) 메서드를 호출할 때는, feature의 리치 값이 첫 번째 클로저로 전달됩니다.

```php
Feature::when('purchase-button',
    fn ($color) => /* ... */,
    fn () => /* ... */,
);
```

마찬가지로, 조건부 `unless` 메서드를 사용할 때는, feature의 리치 값이 선택적으로 두 번째 클로저로 전달됩니다.

```php
Feature::unless('purchase-button',
    fn () => /* ... */,
    fn ($color) => /* ... */,
);
```

<a name="retrieving-multiple-features"></a>
## 여러 기능 값 조회하기

`values` 메서드를 사용하면 한 번에 여러 개의 feature 값을 조회할 수 있습니다.

```php
Feature::values(['billing-v2', 'purchase-button']);

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
// ]
```

또는, `all` 메서드를 사용해 해당 스코프에 대해 정의된 모든 feature의 값을 가져올 수도 있습니다.

```php
Feature::all();

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
//     'site-redesign' => true,
// ]
```

단, 클래스 기반 feature는 동적으로 등록되기 때문에 Pennant가 명시적으로 확인되기 전까지는 해당 feature를 알지 못합니다. 즉, 현재 요청에서 한 번이라도 체크되지 않았다면, `all` 메서드의 결과에 애플리케이션의 클래스 기반 feature가 나타나지 않을 수 있습니다.

클래스 기반 feature도 항상 `all` 메서드의 결과에 포함되도록 하려면, Pennant가 제공하는 feature 디스커버리(discovery) 기능을 사용할 수 있습니다. 먼저, 애플리케이션의 서비스 프로바이더 중 한 곳에서 `discover` 메서드를 호출합니다.

```php
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

`discover` 메서드는 애플리케이션의 `app/Features` 디렉터리에 있는 모든 feature 클래스를 등록합니다. 이제 `all` 메서드를 호출하면 해당 feature들을 체크하지 않았더라도 결과에 포함됩니다.

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
## 이른 로딩(Eager Loading)

Pennant는 모든 요청에 대해 resolve(결정)된 feature들을 메모리 캐시에 저장하지만, 요청 처리 과정에서 성능 저하가 발생할 수 있습니다. 이를 개선하기 위해 Pennant는 feature 값을 "이른 로딩"(eager load)하는 기능을 제공합니다.

예를 들어, 루프 내에서 feature가 활성화되어 있는지 체크하는 코드가 있다고 가정해봅시다.

```php
use Laravel\Pennant\Feature;

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

database 드라이버를 사용한다면, 위 코드는 루프에 있는 사용자마다 데이터베이스 쿼리를 실행하게 되어, 수백 번의 쿼리가 발생할 수 있습니다. 이 문제를 해결하기 위해 Pennant의 `load` 메서드를 사용하면, 미리 feature 값을 여러 사용자(혹은 스코프)에 대해 한 번에 이른 로딩할 수 있습니다.

```php
Feature::for($users)->load(['notifications-beta']);

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

이미 로드되지 않은 경우에만 feature 값을 로드하려면, `loadMissing` 메서드를 사용할 수 있습니다.

```php
Feature::for($users)->loadMissing([
    'new-api',
    'purchase-button',
    'notifications-beta',
]);
```

모든 feature 값을 한 번에 이른 로딩하려면, `loadAll` 메서드를 사용하세요.

```php
Feature::for($users)->loadAll();
```

<a name="updating-values"></a>
## 값 업데이트

feature의 값이 처음 resolve(결정)될 때, 사용 중인 드라이버는 해당 결과를 스토리지에 저장합니다. 이는 여러 요청에 걸쳐 사용자에게 일관된 경험을 제공하기 위함입니다. 하지만, 때로는 직접 저장된 feature 값을 수동으로 업데이트해야 할 수도 있습니다.

이럴 때, `activate` 및 `deactivate` 메서드를 사용해 feature를 "켜고" 또는 "끄는" 식으로 토글(toggle)할 수 있습니다.

```php
use Laravel\Pennant\Feature;

// 기본 스코프에서 feature 활성화
Feature::activate('new-api');

// 특정 스코프에서 feature 비활성화
Feature::for($user->team)->deactivate('billing-v2');
```

또한, `activate` 메서드에 두 번째 인수를 전달하여 feature에 원하는 리치 값을 직접 저장할 수도 있습니다.

```php
Feature::activate('purchase-button', 'seafoam-green');
```

Pennant에 저장된 feature 값을 잊도록(삭제하도록) 하려면, `forget` 메서드를 사용하세요. 이후 해당 feature를 다시 체크할 때는 feature 정의에서 값을 다시 resolve합니다.

```php
Feature::forget('purchase-button');
```

<a name="bulk-updates"></a>
### 일괄 업데이트

저장된 feature 값을 여러 건 한꺼번에 업데이트하려면, `activateForEveryone` 및 `deactivateForEveryone` 메서드를 사용할 수 있습니다.

예를 들어, 이제 `new-api` 기능이 충분히 안정적이고, 결제 플로우에서 `'purchase-button'`의 최적 색상을 결정했다고 가정합시다. 모든 사용자에 대해 저장된 값을 다음과 같이 일괄 업데이트할 수 있습니다.

```php
use Laravel\Pennant\Feature;

Feature::activateForEveryone('new-api');

Feature::activateForEveryone('purchase-button', 'seafoam-green');
```

반대로, 모든 사용자에 대해 feature를 비활성화하고 싶다면 아래와 같이 처리할 수 있습니다.

```php
Feature::deactivateForEveryone('new-api');
```

> [!NOTE]
> 이 메서드는 Pennant의 저장 드라이버에 의해 이미 저장된 feature 값만 업데이트합니다. 애플리케이션의 feature 정의도 직접 업데이트해야 합니다.

<a name="purging-features"></a>
### 기능 전체 삭제(퍼지)

때로는 전체 feature 자체를 저장소에서 삭제(퍼지, purge)해야 할 때도 있습니다. 보통 feature를 애플리케이션에서 제거했거나, 정의를 변경해서 모든 사용자에게 새로운 동작을 적용하고 싶을 때 그렇습니다.

이럴 때는 `purge` 메서드를 이용해 feature의 저장된 값을 모두 제거할 수 있습니다.

```php
// 단일 feature 퍼지
Feature::purge('new-api');

// 여러 feature 퍼지
Feature::purge(['new-api', 'purchase-button']);
```

모든 feature를 통째로 퍼지(삭제)하고 싶다면, 인자 없이 `purge` 메서드를 호출할 수 있습니다.

```php
Feature::purge();
```

애플리케이션의 배포 파이프라인 등에서 feature 데이터 퍼지가 필요한 경우, Pennant는 지정한 feature를 저장소에서 삭제하는 `pennant:purge` Artisan 명령어도 제공합니다.

```shell
php artisan pennant:purge new-api

php artisan pennant:purge new-api purchase-button
```

특정 feature 목록을 제외한 나머지 모든 feature 데이터를 퍼지하려면, `--except` 옵션을 사용합니다. 예를 들어 "new-api"와 "purchase-button"만 남겨두고 나머지 feature는 다 지우고 싶다면 아래처럼 실행할 수 있습니다.

```shell
php artisan pennant:purge --except=new-api --except=purchase-button
```

편의를 위해 `--except-registered` 플래그도 지원합니다. 이 플래그를 사용하면 서비스 프로바이더에 명시적으로 등록된 feature를 제외한 모든 feature가 퍼지됩니다.

```shell
php artisan pennant:purge --except-registered
```

<a name="testing"></a>
## 테스트

feature flag와 상호작용하는 코드를 테스트할 때 테스트 환경에서 feature flag의 반환 값을 쉽게 제어하는 가장 간단한 방법은 feature를 재정의하는 것입니다. 예를 들어, 아래처럼 애플리케이션의 서비스 프로바이더에서 feature를 정의했다고 가정합시다.

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn () => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

이 feature의 반환 값을 테스트에서 변경하려면, 테스트 초반에 feature를 재정의해주면 됩니다. 아래 예시는 `Arr::random()` 구현이 서비스 프로바이더에 그대로 있어도 항상 통과합니다.

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

동일한 방식으로 클래스 기반 feature에 대해서도 제어가 가능합니다.

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

feature가 `Lottery` 인스턴스를 반환하는 경우, 여러 유용한 [테스트 헬퍼](/docs/12.x/helpers#testing-lotteries)를 사용할 수 있습니다.

<a name="store-configuration"></a>
#### 저장소 설정

Pennant가 테스트 중 사용할 저장소(store)를 지정하려면, 애플리케이션의 `phpunit.xml` 파일에서 `PENNANT_STORE` 환경 변수를 설정하면 됩니다.

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
#### 드라이버 구현하기

Pennant의 기존 저장소 드라이버가 애플리케이션의 요구를 충족하지 못한다면, 직접 저장소 드라이버를 작성할 수 있습니다. 커스텀 드라이버는 `Laravel\Pennant\Contracts\Driver` 인터페이스를 구현해야 합니다.

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

이제 Redis 커넥션을 활용해 각 메서드를 구현하면 됩니다. 구현 예시는 [Pennant 소스코드의 `Laravel\Pennant\Drivers\DatabaseDriver`](https://github.com/laravel/pennant/blob/1.x/src/Drivers/DatabaseDriver.php)에서 참고할 수 있습니다.

> [!NOTE]
> 라라벨은 확장 기능을 담을 디렉터리를 기본 제공하지 않습니다. 어디에 두든 자유이며, 위 예시에서는 `Extensions` 디렉터리를 만들어 `RedisFeatureDriver`를 넣었습니다.

<a name="registering-the-driver"></a>
#### 드라이버 등록하기

드라이버 구현이 끝났다면, 이제 라라벨에 등록하면 됩니다. Pennant에 새로운 드라이버를 추가하려면 `Feature` 파사드가 제공하는 `extend` 메서드를 사용할 수 있습니다. 이 메서드는 애플리케이션의 [서비스 프로바이더](/docs/12.x/providers) 내 `boot` 메서드에서 호출하면 됩니다.

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

드라이버 등록이 완료되면, 애플리케이션의 `config/pennant.php` 설정 파일에서 `redis` 드라이버를 사용할 수 있습니다.

```php
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

만약 작성한 드라이버가 서드 파티 feature flag 플랫폼을 감싼 래퍼(wrapper)라면, Pennant의 `Feature::define`이 아닌 해당 플랫폼에서 feature를 정의할 가능성이 높습니다. 이 경우 커스텀 드라이버는 추가로 `Laravel\Pennant\Contracts\DefinesFeaturesExternally` 인터페이스도 구현해야 합니다.

```php
<?php

namespace App\Extensions;

use Laravel\Pennant\Contracts\Driver;
use Laravel\Pennant\Contracts\DefinesFeaturesExternally;

class FeatureFlagServiceDriver implements Driver, DefinesFeaturesExternally
{
    /**
     * 주어진 스코프에 대해 정의된 feature 목록 반환
     */
    public function definedFeaturesForScope(mixed $scope): array {}

    /* ... */
}
```

`definedFeaturesForScope` 메서드는, 지정된 스코프에 대해 정의된 feature 이름의 리스트를 반환해야 합니다.

<a name="events"></a>
## 이벤트

Pennant는 애플리케이션 내에서 feature flag 추적에 도움이 되는 다양한 이벤트를 디스패치합니다.

### `Laravel\Pennant\Events\FeatureRetrieved`

이 이벤트는 [feature를 체크할 때](#checking-features)마다 디스패치됩니다. feature flag의 사용 현황에 대해 메트릭을 집계하고 추적하는 데 유용하게 활용할 수 있습니다.

### `Laravel\Pennant\Events\FeatureResolved`

이 이벤트는 한 스코프에 대해 feature 값이 처음 resolve(결정)될 때 발생합니다.

### `Laravel\Pennant\Events\UnknownFeatureResolved`

이 이벤트는 한 스코프에 대해 아직 등록되지 않은(unknown) feature가 처음 resolve될 때 발생합니다. feature flag를 제거하려 했으나, 애플리케이션 상에 남은 참조를 실수로 남겼을 때 이 이벤트를 활용하면 문제 추적이 용이합니다.

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

이 이벤트는 요청 처리 중 [클래스 기반 기능](#class-based-features)이 처음으로 동적으로 체크될 때 발생합니다.

### `Laravel\Pennant\Events\UnexpectedNullScopeEncountered`

이 이벤트는 [null을 허용하지 않는](#nullable-scope) 기능 정의에 `null` 스코프가 전달될 때 발생합니다.

이 상황은 Pennant가 자동으로 예외 없이 처리하며, 해당 기능은 `false`를 반환합니다. 하지만 이 기능의 기본적인 예외 없는 처리 방식을 사용하고 싶지 않다면, 애플리케이션의 `AppServiceProvider`에서 `boot` 메서드에 이 이벤트에 대한 리스너를 등록할 수 있습니다.

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

이 이벤트는 특정 스코프에 대해서 기능을 업데이트할 때 발생하며, 주로 `activate` 또는 `deactivate`를 호출할 때 발생합니다.

### `Laravel\Pennant\Events\FeatureUpdatedForAllScopes`

이 이벤트는 모든 스코프에 대해 기능을 업데이트할 때 발생하며, 주로 `activateForEveryone` 또는 `deactivateForEveryone`을 호출할 때 발생합니다.

### `Laravel\Pennant\Events\FeatureDeleted`

이 이벤트는 특정 스코프에 대한 기능을 삭제할 때 발생하며, 보통 `forget`을 호출할 때 발생합니다.

### `Laravel\Pennant\Events\FeaturesPurged`

이 이벤트는 특정 기능들을 전체적으로 삭제(purge)할 때 발생합니다.

### `Laravel\Pennant\Events\AllFeaturesPurged`

이 이벤트는 모든 기능을 전체적으로 삭제(purge)할 때 발생합니다.