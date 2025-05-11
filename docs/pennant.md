# 라라벨 페넌트 (Laravel Pennant)

- [소개](#introduction)
- [설치](#installation)
- [구성](#configuration)
- [기능 정의](#defining-features)
    - [클래스 기반 기능](#class-based-features)
- [기능 확인](#checking-features)
    - [조건부 실행](#conditional-execution)
    - [`HasFeatures` 트레이트](#the-has-features-trait)
    - [Blade 디렉티브](#blade-directive)
    - [미들웨어](#middleware)
    - [기능 확인 가로채기](#intercepting-feature-checks)
    - [인메모리 캐시](#in-memory-cache)
- [스코프](#scope)
    - [스코프 지정](#specifying-the-scope)
    - [기본 스코프](#default-scope)
    - [Nullable 스코프](#nullable-scope)
    - [스코프 식별](#identifying-scope)
    - [스코프 직렬화](#serializing-scope)
- [리치 기능 값](#rich-feature-values)
- [여러 기능 값 조회](#retrieving-multiple-features)
- [이그너 로딩](#eager-loading)
- [값 업데이트](#updating-values)
    - [대량 업데이트](#bulk-updates)
    - [기능 제거](#purging-features)
- [테스트](#testing)
- [커스텀 페넌트 드라이버 추가](#adding-custom-pennant-drivers)
    - [드라이버 구현](#implementing-the-driver)
    - [드라이버 등록](#registering-the-driver)
    - [외부에서 기능 정의](#defining-features-externally)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

[라라벨 페넌트(Laravel Pennant)](https://github.com/laravel/pennant)는 불필요한 요소 없이 간단하고 가벼운 **기능 플래그(feature flag)** 패키지입니다.  
기능 플래그를 사용하면 새로운 애플리케이션 기능을 점진적으로 안전하게 적용하고, 인터페이스 디자인의 A/B 테스트를 진행하며, trunk 기반 개발 전략을 보완하는 등 다양한 방식으로 활용할 수 있습니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 매니저를 사용하여 Pennant를 프로젝트에 설치합니다.

```shell
composer require laravel/pennant
```

다음으로, `vendor:publish` 아티즌 명령어를 사용하여 Pennant의 설정 파일과 마이그레이션 파일을 배포해야 합니다.

```shell
php artisan vendor:publish --provider="Laravel\Pennant\PennantServiceProvider"
```

마지막으로, 애플리케이션의 데이터베이스 마이그레이션을 실행해야 합니다.  
이 과정을 통해 Pennant에서 `database` 드라이버를 사용할 때 활용하는 `features` 테이블이 생성됩니다.

```shell
php artisan migrate
```

<a name="configuration"></a>
## 구성

Pennant의 에셋을 배포한 후에는, `config/pennant.php` 위치에 설정 파일이 생성됩니다.  
이 설정 파일에서는 Pennant가 기능 플래그의 해석(Resolved) 값을 저장할 때 사용할 기본 저장소 방식을 지정할 수 있습니다.

Pennant는 `array` 드라이버를 통해 해석된 기능 플래그 값을 인메모리 배열에 저장하거나,  
기본값인 `database` 드라이버를 사용해 관계형 데이터베이스에 값을 영구적으로 저장할 수도 있습니다.

<a name="defining-features"></a>
## 기능 정의

기능(Feature)을 정의하려면 `Feature` 파사드에서 제공하는 `define` 메서드를 사용할 수 있습니다.  
기능의 이름과, 기능 플래그의 초깃값을 결정할 클로저를 전달해야 합니다.

일반적으로 서비스 프로바이더에서 `Feature` 파사드를 사용해 기능을 정의합니다.  
클로저에는 해당 기능 체크의 "스코프"(scope)가 인자로 전달됩니다.  
대부분의 경우, 이 스코프는 현재 인증된 사용자입니다.  
예를 들어, 아래 코드는 애플리케이션 사용자에게 새로운 API를 점진적으로 적용하기 위한 기능을 정의하는 방식입니다.

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

위 예시에서 다음과 같은 규칙을 적용하고 있습니다.

- 내부 팀 멤버라면 모두 새로운 API를 사용해야 합니다.
- 트래픽이 많은 고객이라면 새로운 API를 사용하지 않습니다.
- 이 외의 경우 100명 중 1명 비율로 무작위로 기능이 활성화됩니다.

`new-api` 기능이 특정 사용자에 대해 처음 확인될 때, 클로저의 반환값이 저장소 드라이버에 저장됩니다.  
이후 같은 사용자에 대해 다시 기능을 확인하면, 저장된 값이 조회되고 클로저는 호출되지 않습니다.

편의상, 기능 정의가 로터리(lottery)만 반환된다면 클로저 자체를 생략할 수 있습니다.

```
Feature::define('site-redesign', Lottery::odds(1, 1000));
```

<a name="class-based-features"></a>
### 클래스 기반 기능

Pennant에서는 클래스 기반으로 기능을 정의하는 것도 가능합니다.  
클로저 기반 기능 정의와 달리, 클래스 기반 기능은 서비스 프로바이더에 등록할 필요가 없습니다.  
클래스 기반 기능을 생성하려면 `pennant:feature` 아티즌 명령어를 실행할 수 있습니다.  
기본적으로 기능 클래스는 애플리케이션의 `app/Features` 디렉터리에 생성됩니다.

```shell
php artisan pennant:feature NewApi
```

기능 클래스를 작성할 때는, 해당 스코프에 대한 기능의 초깃값을 판별하는 `resolve` 메서드만 정의하면 됩니다.  
여기서도 스코프는 주로 현재 인증된 사용자입니다.

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

클래스 기반 기능의 인스턴스를 수동으로 해석하고 싶을 때는, `Feature` 파사드의 `instance` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\Feature;

$instance = Feature::instance(NewApi::class);
```

> [!NOTE]
> 기능 클래스는 [컨테이너](/docs/container)를 통해 해석되므로, 필요에 따라 생성자에 의존성을 주입할 수 있습니다.

#### 저장되는 기능 이름 커스터마이징

기본적으로 Pennant는 기능 클래스의 전체 네임스페이스가 포함된 클래스명을 저장합니다.  
애플리케이션 내부 구조와 저장되는 기능명을 분리하고 싶다면, 기능 클래스에서 `$name` 프로퍼티를 지정할 수 있습니다.  
이 값을 클래스명 대신 저장에 사용합니다.

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

기능이 활성화되었는지 확인하려면, `Feature` 파사드의 `active` 메서드를 사용하면 됩니다.  
기본적으로, 기능은 현재 인증된 사용자 기준으로 확인됩니다.

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

기본에서는 현재 인증된 사용자로 기능을 판별하지만,  
다른 사용자 또는 [스코프](#scope)로도 쉽게 기능을 확인할 수 있습니다.  
이 경우에는 `Feature` 파사드의 `for` 메서드를 사용하면 됩니다.

```php
return Feature::for($user)->active('new-api')
    ? $this->resolveNewApiResponse($request)
    : $this->resolveLegacyApiResponse($request);
```

Pennant는 기능 활성화 여부를 판단할 때 유용한 다양한 편의 메서드도 제공합니다.

```php
// 주어진 모든 기능이 활성 상태인지 확인...
Feature::allAreActive(['new-api', 'site-redesign']);

// 주어진 기능 중 하나라도 활성 상태인지 확인...
Feature::someAreActive(['new-api', 'site-redesign']);

// 기능이 비활성 상태인지 확인...
Feature::inactive('new-api');

// 모든 기능이 비활성 상태인지 확인...
Feature::allAreInactive(['new-api', 'site-redesign']);

// 기능 중 하나라도 비활성 상태인지 확인...
Feature::someAreInactive(['new-api', 'site-redesign']);
```

> [!NOTE]
> Pennant를 HTTP가 아닌 콘텍스트(예: 아티즌 명령어, 큐 처리 작업 등)에서 사용할 때는,  
> 보통 [기능의 스코프를 명시적으로 지정](#specifying-the-scope)해야 합니다.  
> 또는 인증된 HTTP 콘텍스트/비인증 콘텍스트 모두 처리하는 [기본 스코프](#default-scope)를 정의할 수도 있습니다.

<a name="checking-class-based-features"></a>
#### 클래스 기반 기능 확인

클래스 기반 기능을 확인할 때는, 클래스명을 직접 전달해야 합니다.

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

특정 기능이 활성화되었을 때 클로저를 실행하려면, `when` 메서드를 사용할 수 있습니다.  
또한, 두 번째 클로저를 전달하면 기능이 비활성일 때 해당 클로저가 실행됩니다.

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

`unless` 메서드는 `when`의 반대로 동작합니다. 즉,  
기능이 비활성일 때 첫 번째 클로저를 실행합니다.

```php
return Feature::unless(NewApi::class,
    fn () => $this->resolveLegacyApiResponse($request),
    fn () => $this->resolveNewApiResponse($request),
);
```

<a name="the-has-features-trait"></a>
### `HasFeatures` 트레이트

Pennant의 `HasFeatures` 트레이트를 앱의 `User` 모델(또는 기능 플래그를 갖는 다른 모델)에 추가하면,  
모델에서 직접 기능을 손쉽게 확인할 수 있습니다.

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

트레이트가 모델에 추가되면, `features` 메서드를 사용하여 바로 기능을 확인할 수 있습니다.

```php
if ($user->features()->active('new-api')) {
    // ...
}
```

물론, `features` 메서드를 통해 다양한 편의 기능도 사용할 수 있습니다.

```php
// 값 조회...
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

Blade에서 기능 플래그를 쉽게 확인할 수 있도록, Pennant에서는 `@feature`와 `@featureany` 디렉티브를 제공합니다.

```blade
@feature('site-redesign')
    <!-- 'site-redesign'이 활성화된 경우 -->
@else
    <!-- 'site-redesign'이 비활성화된 경우 -->
@endfeature

@featureany(['site-redesign', 'beta'])
    <!-- 'site-redesign' 또는 `beta`가 활성화된 경우 -->
@endfeatureany
```

<a name="middleware"></a>
### 미들웨어

Pennant에는 [미들웨어](/docs/middleware)도 내장되어 있습니다.  
이 미들웨어로, 특정 라우트 실행 전 현재 인증된 사용자가 특정 기능에 접근할 권한이 있는지 검사할 수 있습니다.  
해당 미들웨어를 라우트에 지정하고, 해당 라우트에 접근하기 위해 필요한 기능을 나열할 수 있습니다.  
지정한 기능 중 비활성 기능이 있다면, 라우트에서는 `400 Bad Request` HTTP 응답을 반환합니다.  
여러 기능을 `using` 메서드에 나열할 수도 있습니다.

```php
use Illuminate\Support\Facades\Route;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

Route::get('/api/servers', function () {
    // ...
})->middleware(EnsureFeaturesAreActive::using('new-api', 'servers-api'));
```

<a name="customizing-the-response"></a>
#### 응답 커스터마이징

지정한 기능 중 하나가 비활성 상태일 때 미들웨어가 반환하는 응답을 커스터마이징하려면,  
`EnsureFeaturesAreActive` 미들웨어의 `whenInactive` 메서드를 사용할 수 있습니다.  
일반적으로 이 메서드는 애플리케이션의 서비스 프로바이더 중 하나의 `boot` 메서드에서 호출합니다.

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

가끔 기능의 저장된 값을 조회하기 전에, 메모리상에서 몇 가지 검사를 먼저 진행하고 싶을 수 있습니다.  
예를 들어, 기능 플래그로 신규 API를 도입하는 과정에서,  
저장소에 이미 해석된 값은 그대로 두고 신규 API만 일시적으로 전체 비활성화하거나,  
내부 팀원만 접근하게 하고 싶을 때가 있습니다.  
이런 경우, 버그 발견 시 내부 팀 멤버를 제외한 모든 사용자에게 기능을 임시로 비활성화하고 버그를 수정한 뒤,  
이전처럼 다시 접근을 허용할 수 있습니다.

이 경우 [클래스 기반 기능](#class-based-features)의 `before` 메서드를 활용할 수 있습니다.  
`before` 메서드가 클래스에 존재할 경우, 항상 메모리에서 먼저 실행되며,  
여기에서 `null`이 아닌 값을 반환하면 저장된 값 대신 해당 값이 사용됩니다.

```php
<?php

namespace App\Features;

use App\Models\User;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Lottery;

class NewApi
{
    /**
     * 저장된 값을 가져오기 전에 항상 인메모리 검사를 실행합니다.
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

이 기능을 활용해 기존에 기능 플래그로 관리하던 기능의 전체 공개 일정을 예약할 수도 있습니다.

```php
<?php

namespace App\Features;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;

class NewApi
{
    /**
     * 저장된 값을 가져오기 전에 항상 인메모리 검사를 실행합니다.
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

기능을 확인할 때 Pennant는 결과값의 인메모리 캐시를 생성합니다.  
`database` 드라이버를 사용하는 경우,  
하나의 요청 내에서 동일한 기능 플래그를 반복 확인할 때 추가적인 데이터베이스 쿼리가 실행되지 않습니다.  
이로 인해 요청 처리 중에 기능 플래그의 결과값이 일관되게 유지됩니다.

인메모리 캐시를 수동으로 초기화해야 할 경우,  
`Feature` 파사드의 `flushCache` 메서드를 사용할 수 있습니다.

```php
Feature::flushCache();
```

<a name="scope"></a>
## 스코프

<a name="specifying-the-scope"></a>
### 스코프 지정

앞서 언급했듯이, 기능은 보통 현재 인증된 사용자를 기준으로 확인합니다.  
하지만 항상 이 방식이 적합하진 않을 수 있습니다.  
따라서 `Feature` 파사드의 `for` 메서드를 통해 원하는 스코프를 명시적으로 지정하여 기능을 확인할 수 있습니다.

```php
return Feature::for($user)->active('new-api')
    ? $this->resolveNewApiResponse($request)
    : $this->resolveLegacyApiResponse($request);
```

물론, 기능 스코프는 "사용자"에 한정되지 않습니다.  
예를 들어, 전체 팀 단위로 새 결제 경험(billing experience)을 점진적으로 제공하고자 한다면,  
오래된 팀은 점진적으로 더 느리게 적용하고, 신규 팀은 더 빠르게 적용하고 싶을 수도 있습니다.  
이럴 때 기능 해석 클로저는 다음과 비슷할 수 있습니다.

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

위 클로저는 `User`가 아니라 `Team` 모델을 인자로 받는다는 점에 주목하세요.  
사용자가 속한 팀에 대해 기능이 활성화됐는지 확인하려면,  
`Feature` 파사드의 `for` 메서드에 팀을 전달하면 됩니다.

```php
if (Feature::for($user->team)->active('billing-v2')) {
    return redirect('/billing/v2');
}

// ...
```

<a name="default-scope"></a>
### 기본 스코프

Pennant가 기능을 확인할 때 사용하는 기본 스코프를 커스터마이징하는 것도 가능합니다.  
예를 들어, 모든 기능을 현재 인증된 사용자 대신 사용자의 팀 기준으로 확인하고 싶다면,  
기능 확인 마다 `Feature::for($user->team)`를 반복하는 대신, 기본 스코프를 팀으로 지정할 수 있습니다.  
보통은 애플리케이션의 서비스 프로바이더 중 하나의 `boot` 메서드에서 이 설정을 합니다.

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

이제 `for` 메서드로 스코프를 명시하지 않으면  
기본적으로 현재 인증된 사용자의 팀이 스코프로 사용됩니다.

```php
Feature::active('billing-v2');

// 위 코드는 내부적으로 아래와 동일하게 동작합니다.

Feature::for($user->team)->active('billing-v2');
```

<a name="nullable-scope"></a>

### 널 허용 범위(Nullable Scope)

기능을 확인할 때 전달하는 범위(scope)가 `null`이고, 해당 기능의 정의에서 nullable 타입이나 유니언 타입 내에 `null`을 포함하는 방식으로 `null`을 지원하지 않는다면, Pennant는 자동으로 이 기능의 결과 값을 `false`로 반환합니다.

따라서 특정 기능에 범위로 전달하는 값이 `null`일 수 있고, 반드시 value resolver(값을 결정하는 함수)를 실행시키고 싶다면, 기능 정의에서 이를 고려해야 합니다. 범위가 `null`이 되는 경우는 주로 Artisan 명령어나 큐 작업, 인증되지 않은 라우트에서 기능을 확인할 때 발생할 수 있습니다. 이처럼 인증된 사용자가 없는 상황에서는 기본 범위(default scope)가 `null`이 되기 때문입니다.

항상 [기능의 범위를 명시적으로 지정](#specifying-the-scope)하지 않는다면, 기능 정의 시 범위 타입을 nullable로 지정하고, 범위 값이 `null`일 때의 처리를 기능 정의 로직에 포함해야 안전합니다.

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
### 범위 식별하기(Identifying Scope)

Pennant가 기본으로 제공하는 `array` 및 `database` 저장 드라이버는 모든 PHP 데이터 타입과 Eloquent 모델에 대해 올바른 범위 식별자(scope identifier)를 저장할 수 있습니다. 그러나, 만약 애플리케이션에서 서드파티 Pennant 드라이버를 사용하는 경우, 해당 드라이버가 Eloquent 모델이나 사용자 정의 타입의 식별자를 적절히 저장하는 방법을 모를 수 있습니다.

이럴 때는, Pennant가 범위로 사용하는 객체에 `FeatureScopeable` 계약(Contract)을 구현해서, 저장용 범위 값을 직접 포맷팅할 수 있습니다.

예를 들어, 하나의 애플리케이션에서 Pennant의 내장 `database` 드라이버와 서드파티 "Flag Rocket" 드라이버를 같이 쓴다고 가정합시다. "Flag Rocket" 드라이버는 Eloquent 모델을 직접 저장할 수 없고, 대신 `FlagRocketUser` 인스턴스를 요구합니다. 이때 `FeatureScopeable` 계약에서 정의한 `toFeatureIdentifier` 메서드를 구현함으로써, 각 드라이버에 맞는 저장용 범위 값을 커스텀하게 제공할 수 있습니다.

```php
<?php

namespace App\Models;

use FlagRocket\FlagRocketUser;
use Illuminate\Database\Eloquent\Model;
use Laravel\Pennant\Contracts\FeatureScopeable;

class User extends Model implements FeatureScopeable
{
    /**
     * 주어진 드라이버에 대해 객체를 기능 범위 식별자로 캐스팅합니다.
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
### 범위 직렬화하기(Serializing Scope)

기본적으로 Pennant는 Eloquent 모델과 연관된 기능을 저장할 때 완전한 클래스 이름(fully qualified class name)을 사용합니다. 이미 [Eloquent morph map](/docs/eloquent-relationships#custom-polymorphic-types)을 사용 중이라면, Pennant도 morph map을 활용하여 저장된 기능이 애플리케이션 내부 구조에 종속되지 않도록 구성할 수 있습니다.

이렇게 하려면, 서비스 프로바이더에서 morph map을 정의한 뒤 `Feature` 파사드의 `useMorphMap` 메서드를 호출하면 됩니다.

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
## 풍부한 기능 값(Rich Feature Values)

지금까지 기능이 켜졌거나(`active`) 꺼진(`inactive`) 이진 상태만을 다뤘지만, Pennant는 이처럼 단순한 값뿐만 아니라 더 풍부한 값(rich value)을 저장할 수도 있습니다.

예를 들어, 애플리케이션의 "지금 구매" 버튼에 대해 세 가지 색상을 실험하고자 할 때, 기능 정의에서 `true`나 `false` 대신 임의의 문자열 값을 반환할 수 있습니다.

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn (User $user) => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

이제 `purchase-button` 기능의 값을 `value` 메서드로 가져올 수 있습니다.

```php
$color = Feature::value('purchase-button');
```

Pennant에서 제공하는 Blade 디렉티브를 사용하면, 기능의 현재 값에 따라 컨텐츠를 조건부로 렌더링하는 것 또한 쉽습니다.

```blade
@feature('purchase-button', 'blue-sapphire')
    <!-- 'blue-sapphire'가 활성 상태일 때 -->
@elsefeature('purchase-button', 'seafoam-green')
    <!-- 'seafoam-green'가 활성 상태일 때 -->
@elsefeature('purchase-button', 'tart-orange')
    <!-- 'tart-orange'가 활성 상태일 때 -->
@endfeature
```

> [!NOTE]
> 풍부한 값을 사용할 때 주의할 점은, 기능의 값이 `false`가 아닌 어떤 값이라도 "활성(active)" 상태로 간주된다는 것입니다.

[조건부 `when` 메서드](#conditional-execution)를 호출할 때, 기능의 실제 값이 첫 번째 클로저에 전달됩니다.

```php
Feature::when('purchase-button',
    fn ($color) => /* ... */,
    fn () => /* ... */,
);
```

같은 방식으로, 조건부 `unless` 메서드를 호출할 때는 기능의 값이 두 번째(선택적) 클로저에 전달됩니다.

```php
Feature::unless('purchase-button',
    fn () => /* ... */,
    fn ($color) => /* ... */,
);
```

<a name="retrieving-multiple-features"></a>
## 여러 기능 한 번에 조회하기(Retrieving Multiple Features)

`values` 메서드를 사용하면, 지정한 범위에 대해 여러 기능의 값을 한 번에 가져올 수 있습니다.

```php
Feature::values(['billing-v2', 'purchase-button']);

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
// ]
```

또는, `all` 메서드로 해당 범위에 대해 정의된 모든 기능 값을 조회할 수 있습니다.

```php
Feature::all();

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
//     'site-redesign' => true,
// ]
```

단, 클래스 기반 기능(class based features)은 동적으로 등록되므로, Pennant는 해당 기능이 현재 요청에서 한 번이라도 체크되지 않은 이상 `all` 메서드 결과에 포함하지 않습니다.

기능 클래스가 항상 `all` 메서드의 결과에 포함되도록 하려면, Pennant의 기능 검색(discovery) 기능을 사용하면 됩니다. 이를 위해, 애플리케이션의 서비스 프로바이더 중 하나에서 `discover` 메서드를 호출하면 됩니다.

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Feature::discover();

        // ...
    }
}
```

`discover` 메서드는 애플리케이션의 `app/Features` 디렉터리 내 기능 클래스를 모두 등록합니다. 이제 `all` 메서드 결과에, 이들 클래스 기반 기능도 현재 요청 중 체크 여부와 상관 없이 포함됩니다.

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
## 기능 미리 불러오기(Eager Loading)

Pennant는 한 번의 요청 내에서는 이미 확인된 기능 값을 메모리에 캐시하지만, 상황에 따라 여전히 퍼포먼스 이슈가 발생할 수 있습니다. 이를 해결하기 위해, Pennant는 기능 값을 미리 불러오는(eager loading) 기능을 제공합니다.

예를 들어, 반복문 안에서 특정 기능의 활성화 여부를 계속 확인한다고 가정해보겠습니다.

```php
use Laravel\Pennant\Feature;

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

데이터베이스 드라이버 사용 시, 위 코드는 사용자의 수 만큼 쿼리가 실행되어 수백 번의 데이터베이스 질의가 발생할 수 있습니다. 하지만 Pennant의 `load` 메서드를 사용하면, 사용자(또는 여러 범위)에 대해 기능 값을 한 번에 미리 조회함으로써 이 문제를 해결할 수 있습니다.

```php
Feature::for($users)->load(['notifications-beta']);

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

이미 불러온 값은 재조회하지 않고 필요한 값만 추가로 불러오길 원한다면 `loadMissing` 메서드를 사용할 수 있습니다.

```php
Feature::for($users)->loadMissing([
    'new-api',
    'purchase-button',
    'notifications-beta',
]);
```

정의된 모든 기능 값을 한 번에 모두 미리 불러오고자 한다면 `loadAll` 메서드를 사용하십시오.

```php
Feature::for($users)->loadAll();
```

<a name="updating-values"></a>
## 값 업데이트하기(Updating Values)

기능 값이 최초로 결정(resolve)될 때, 내부적으로 해당 결과는 저장소에 저장됩니다. 이는 여러 요청 사이에서도 사용자에게 일관된 경험을 보장하기 위해 필요합니다. 하지만, 때로는 기능의 저장된 값을 직접 수동으로 업데이트하고자 할 수 있습니다.

이럴 경우, 기능을 "켜기" 또는 "끄기" 위해 `activate`와 `deactivate` 메서드를 사용할 수 있습니다.

```php
use Laravel\Pennant\Feature;

// 기본 범위에 대해 기능 활성화...
Feature::activate('new-api');

// 지정한 범위에 대해 기능 비활성화...
Feature::for($user->team)->deactivate('billing-v2');
```

또한 `activate` 메서드의 두 번째 인자로 값을 직접 주어, 기능에 풍부한 값을 수동 설정할 수도 있습니다.

```php
Feature::activate('purchase-button', 'seafoam-green');
```

저장된 기능 값을 잊도록(Pennant에 다시 평가받도록) 하려면 `forget` 메서드를 사용할 수 있습니다. 이후 기능을 다시 체크할 때, Pennant는 기능 정의에서 값을 새로 결정합니다.

```php
Feature::forget('purchase-button');
```

<a name="bulk-updates"></a>
### 일괄 업데이트(Bulk Updates)

여러 범위(예: 모든 사용자)에 대해 저장된 기능 값을 일괄로 변경하고자 할 때는 `activateForEveryone` 및 `deactivateForEveryone` 메서드를 사용하면 됩니다.

예를 들어, 이제 `new-api` 기능이 충분히 안정적이고, 최적의 `'purchase-button'` 색상도 결정됐다면 모든 사용자의 해당 기능 값을 일괄 업데이트할 수 있습니다.

```php
use Laravel\Pennant\Feature;

Feature::activateForEveryone('new-api');

Feature::activateForEveryone('purchase-button', 'seafoam-green');
```

반대로, 모든 사용자에 대해 해당 기능을 비활성화하려면 다음과 같이 할 수 있습니다.

```php
Feature::deactivateForEveryone('new-api');
```

> [!NOTE]
> 이 연산은 Pennant의 저장 드라이버에 의해 저장된(캐시된) 기능 값만 일괄 업데이트합니다. 애플리케이션의 기능 정의 또한 업데이트해두어야 일관성이 유지됩니다.

<a name="purging-features"></a>
### 기능 값 삭제(Purging Features)

특정 기능을 애플리케이션에서 제거했거나, 기능 정의에 변경을 가해 모든 사용자에게 새로운 정의를 반영하고자 할 때는 저장소에서 전체 기능 값을 정리(purge)해야 할 수 있습니다.

이럴 때 `purge` 메서드를 사용하여 특정 기능의 저장된 값을 모두 삭제할 수 있습니다.

```php
// 단일 기능 삭제하기...
Feature::purge('new-api');

// 여러 기능 동시 삭제하기...
Feature::purge(['new-api', 'purchase-button']);
```

저장된 *모든* 기능 값을 완전히 삭제하려면 인자를 주지 않고 `purge` 메서드를 호출합니다.

```php
Feature::purge();
```

배포 등과 함께 자동화된 기능 값 삭제가 필요할 수 있으므로 Pennant는 `pennant:purge` Artisan 명령어도 제공합니다. 해당 명령어를 활용해 필요한 기능을 저장소에서 삭제할 수 있습니다.

```shell
php artisan pennant:purge new-api

php artisan pennant:purge new-api purchase-button
```

특정 기능 목록을 *제외*한 나머지 전체 기능을 삭제하고자 한다면, `--except` 옵션으로 기능명을 전달할 수 있습니다. 예를 들어, "new-api"와 "purchase-button" 값을 남기고 나머지는 모두 삭제하길 원할 때 다음과 같이 실행합니다.

```shell
php artisan pennant:purge --except=new-api --except=purchase-button
```

또한, 명시적으로 서비스 프로바이더에 등록된 기능만을 제외하고 나머지를 모두 삭제하고자 한다면 `--except-registered` 플래그를 사용할 수도 있습니다.

```shell
php artisan pennant:purge --except-registered
```

<a name="testing"></a>
## 테스트(Testing)

기능 플래그와 상호작용하는 코드를 테스트할 때, 가장 쉬운 방법은 테스트 코드에서 해당 기능을 직접 다시 정의(re-define)하는 것입니다. 예를 들어, 다음과 같이 서비스 프로바이더에 정의된 기능이 있다고 가정합니다.

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn () => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

테스트 코드에서 반환 값을 결정하고 싶다면, 테스트 시작 부분에 해당 기능을 원하는 값으로 다시 정의하면 됩니다. 아래 테스트는 `Arr::random()` 구현이 실제로 서비스 프로바이더에 존재하더라도 항상 통과합니다.

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

클래스 기반 기능에 대해서도 동일한 방식이 가능합니다.

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

기능 반환 값이 `Lottery` 인스턴스인 경우, 사용할 수 있는 다양한 [테스트 헬퍼](/docs/helpers#testing-lotteries)도 준비되어 있습니다.

<a name="store-configuration"></a>
#### 저장소 설정(Store Configuration)

테스트 중 Pennant가 사용할 저장소를 변경하고 싶다면, 애플리케이션의 `phpunit.xml` 파일에 환경 변수 `PENNANT_STORE`를 정의하면 됩니다.

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
## 커스텀 Pennant 드라이버 추가(Adding Custom Pennant Drivers)

<a name="implementing-the-driver"></a>
#### 드라이버 직접 구현하기(Implementing the Driver)

Pennant의 기존 저장 드라이버가 애플리케이션의 요구를 모두 충족하지 못한다면, 직접 저장 드라이버를 작성할 수 있습니다. 커스텀 드라이버는 반드시 `Laravel\Pennant\Contracts\Driver` 인터페이스를 구현해야 합니다.

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

이제 각 메서드를 Redis 연결을 활용해 구현하면 됩니다. 각 메서드 구현 예시는 [Pennant 소스 코드의 `Laravel\Pennant\Drivers\DatabaseDriver`](https://github.com/laravel/pennant/blob/1.x/src/Drivers/DatabaseDriver.php)에서 참고할 수 있습니다.

> [!NOTE]
> 라라벨은 기본적으로 확장(extension)용 디렉터리를 제공하지 않습니다. 원하는 곳에 자유롭게 만드셔도 됩니다. 여기서는 예시로 `Extensions` 디렉터리 아래에 `RedisFeatureDriver`를 저장했습니다.

<a name="registering-the-driver"></a>
#### 드라이버 등록하기(Registering the Driver)

드라이버 구현을 마쳤다면, Pennant에 등록할 준비가 된 것입니다. 추가 드라이버를 Pennant에 등록하려면 `Feature` 파사드의 `extend` 메서드를 사용하면 됩니다. `extend`는 보통 애플리케이션의 [서비스 프로바이더](/docs/providers) `boot` 메서드 내에서 호출합니다.

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
        Feature::extend('redis', function (Application $app) {
            return new RedisFeatureDriver($app->make('redis'), $app->make('events'), []);
        });
    }
}
```

등록이 끝났다면, 이제 애플리케이션의 `config/pennant.php` 설정 파일에서 `redis` 드라이버를 사용할 수 있습니다.

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
### 외부에서 기능 정의하기(Defining Features Externally)

만약 드라이버가 서드파티 기능 플래그 플랫폼을 감싸는 래퍼라면, Pennant의 `Feature::define` 메서드가 아닌 플랫폼 자체에서 기능을 정의하는 경우가 많습니다. 이런 경우, 커스텀 드라이버는 `Laravel\Pennant\Contracts\DefinesFeaturesExternally` 인터페이스도 함께 구현해야 합니다.

```php
<?php

namespace App\Extensions;

use Laravel\Pennant\Contracts\Driver;
use Laravel\Pennant\Contracts\DefinesFeaturesExternally;

class FeatureFlagServiceDriver implements Driver, DefinesFeaturesExternally
{
    /**
     * 주어진 범위에 정의된 기능 목록을 반환합니다.
     */
    public function definedFeaturesForScope(mixed $scope): array {}

    /* ... */
}
```

`definedFeaturesForScope` 메서드는 인자로 전달된 범위에 대해 정의된 기능 이름 리스트를 반환해야 합니다.

<a name="events"></a>
## 이벤트(Events)

Pennant는 애플리케이션 전반에서 기능 플래그 사용을 추적하는 데 유용한 다양한 이벤트를 디스패치(dispatch)합니다.

### `Laravel\Pennant\Events\FeatureRetrieved`

이 이벤트는 [기능을 체크할 때](#checking-features)마다 발생합니다. 기능 플래그 사용 현황을 메트릭(metric)으로 기록할 때 유용하게 활용할 수 있습니다.

### `Laravel\Pennant\Events\FeatureResolved`

이 이벤트는 특정 범위에 대해 기능의 값이 최초로 결정(resolve)될 때 발생합니다.

### `Laravel\Pennant\Events\UnknownFeatureResolved`

이 이벤트는 특정 범위에 대해 **알 수 없는(unknown) 기능**이 최초로 결정될 때 발생합니다. 만약 기능 플래그를 애플리케이션에서 제거하려고 했으나, 코드 내 일부에 참조가 남아 있을 경우 이 이벤트를 활용할 수 있습니다.

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
     * Bootstrap any application services.
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

이 이벤트는 [클래스 기반 기능](#class-based-features)에 대해 요청 중 처음으로 동적으로 확인될 때 발생합니다.

### `Laravel\Pennant\Events\UnexpectedNullScopeEncountered`

이 이벤트는 [null을 지원하지 않는](#nullable-scope) 기능 정의에 `null` 범위가 전달될 때 발생합니다.

이런 상황이 발생하더라도 Pennant에서는 기본적으로 문제 없이 처리하여 해당 기능의 반환값이 `false`가 됩니다. 그러나 이러한 기본 동작 대신에 직접 제어하고 싶다면, 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 이 이벤트에 대한 리스너를 등록할 수 있습니다.

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

이 이벤트는 범위에 대한 기능을 업데이트할 때(주로 `activate`나 `deactivate`를 호출할 때) 발생합니다.

### `Laravel\Pennant\Events\FeatureUpdatedForAllScopes`

이 이벤트는 모든 범위에 대해 기능을 업데이트할 때(주로 `activateForEveryone` 또는 `deactivateForEveryone`를 호출할 때) 발생합니다.

### `Laravel\Pennant\Events\FeatureDeleted`

이 이벤트는 범위에 대한 기능을 삭제할 때(주로 `forget`을 호출할 때) 발생합니다.

### `Laravel\Pennant\Events\FeaturesPurged`

이 이벤트는 특정 기능을 완전히 제거(purge)할 때 발생합니다.

### `Laravel\Pennant\Events\AllFeaturesPurged`

이 이벤트는 모든 기능을 완전히 제거(purge)할 때 발생합니다.