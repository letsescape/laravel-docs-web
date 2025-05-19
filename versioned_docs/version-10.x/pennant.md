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
    - [메모리 내 캐시](#in-memory-cache)
- [스코프](#scope)
    - [스코프 지정](#specifying-the-scope)
    - [기본 스코프](#default-scope)
    - [Nullable 스코프](#nullable-scope)
    - [스코프 식별](#identifying-scope)
    - [스코프 직렬화](#serializing-scope)
- [고급 기능 값](#rich-feature-values)
- [여러 기능 조회](#retrieving-multiple-features)
- [Eager 로딩](#eager-loading)
- [값 업데이트](#updating-values)
    - [일괄 업데이트](#bulk-updates)
    - [기능 정리](#purging-features)
- [테스트](#testing)
- [커스텀 페넌트 드라이버 추가](#adding-custom-pennant-drivers)
    - [드라이버 구현](#implementing-the-driver)
    - [드라이버 등록](#registering-the-driver)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

[라라벨 페넌트](https://github.com/laravel/pennant)는 불필요한 요소 없이 간편하고 가벼운 기능 플래그(feature flag) 패키지입니다. 기능 플래그를 통해 새로운 애플리케이션 기능을 점진적으로 배포할 수 있으며, A/B 테스트, 트렁크 기반 개발 전략 보완 등 다양한 상황에 자신 있게 활용할 수 있습니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 매니저를 사용하여 프로젝트에 Pennant를 설치합니다.

```shell
composer require laravel/pennant
```

다음으로, `vendor:publish` 아티즌 명령어를 사용하여 Pennant의 설정 파일과 마이그레이션 파일을 공개합니다.

```shell
php artisan vendor:publish --provider="Laravel\Pennant\PennantServiceProvider"
```

마지막으로, 애플리케이션의 데이터베이스 마이그레이션을 실행해야 합니다. 이 작업은 Pennant의 `database` 드라이버에서 사용하는 `features` 테이블을 생성합니다.

```shell
php artisan migrate
```

<a name="configuration"></a>
## 구성

Pennant의 자산을 공개하면 설정 파일이 `config/pennant.php`에 위치하게 됩니다. 이 설정 파일을 통해 Pennant가 기능 플래그 값을 저장할 때 사용할 기본 저장소 방식을 지정할 수 있습니다.

Pennant는 `array` 드라이버를 통해 메모리 내 배열에 기능 플래그 값을 저장하는 방법을 지원합니다. 또는 `database` 드라이버를 사용하여 관계형 데이터베이스에 기능 플래그 값을 영구적으로 저장할 수도 있으며, Pennant의 기본 저장소 방식도 바로 이 `database` 드라이버입니다.

<a name="defining-features"></a>
## 기능 정의

기능을 정의하려면 `Feature` 파사드에서 제공하는 `define` 메서드를 사용하면 됩니다. 기능의 이름과 해당 기능의 초기 값을 판별하는 클로저를 전달해야 합니다.

일반적으로 서비스 프로바이더 내에서 `Feature` 파사드를 사용하여 기능을 정의합니다. 클로저에서는 "기능 체크의 스코프"를 인수로 받게 되며, 보통은 현재 인증된 사용자가 이 스코프가 됩니다. 예시에서는 새로운 API를 점진적으로 사용자들에게 배포하는 기능을 정의해보겠습니다.

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
     * 애플리케이션 서비스를 부트스트랩합니다.
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

위의 예시처럼, 해당 기능에는 다음과 같은 규칙을 적용하고 있습니다.

- 모든 내부 팀원은 새로운 API를 사용하도록 지정합니다.
- 트래픽이 많은 고객에게는 새 API가 적용되지 않습니다.
- 그 외의 사용자는 1/100 확률로 무작위 활성화됩니다.

`new-api` 기능이 특정 사용자에 대해 처음 조회되는 시점에, 해당 클로저의 반환값이 저장 드라이버를 통해 저장됩니다. 같은 사용자에 대해 이후 다시 기능을 체크할 때는, 저장된 값이 조회되며 클로저는 더 이상 실행되지 않습니다.

간편하게, 만약 기능의 정의가 단순히 로터리(Lottery)만 반환한다면, 클로저 없이 아래처럼 작성할 수도 있습니다.

```
Feature::define('site-redesign', Lottery::odds(1, 1000));
```

<a name="class-based-features"></a>
### 클래스 기반 기능

Pennant는 클래스 기반 기능도 정의할 수 있도록 지원합니다. 클로저 기반과 달리, 클래스 기반 기능 정의는 서비스 프로바이더에 따로 등록할 필요가 없습니다. 클래스 기반 기능을 생성하려면 `pennant:feature` 아티즌 명령어를 실행하세요. 기본적으로 기능 클래스는 애플리케이션의 `app/Features` 디렉토리에 생성됩니다.

```shell
php artisan pennant:feature NewApi
```

기능 클래스를 작성할 때는 `resolve` 메서드만 정의하면 됩니다. 이 메서드는 특정 스코프(보통은 현재 인증된 사용자)에 대해 기능의 초기 값을 판별하는 역할을 합니다.

```php
<?php

namespace App\Features;

use Illuminate\Support\Lottery;

class NewApi
{
    /**
     * 기능의 초기 값을 판별합니다.
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

> [!NOTE]
> 기능 클래스는 [컨테이너](/docs/10.x/container)를 통해 해결(resolved)되므로, 필요한 경우 생성자에 의존성을 주입할 수 있습니다.

#### 저장되는 기능 이름 커스터마이징

기본적으로 Pennant는 기능 클래스의 전체 네임스페이스를 포함한 클래스명을 저장합니다. 만약 저장되는 기능 이름을 애플리케이션 내부 구조와 분리하고 싶다면, 기능 클래스에 `$name` 속성을 지정할 수 있습니다. 이 속성값이 클래스명 대신 저장됩니다.

```php
<?php

namespace App\Features;

class NewApi
{
    /**
     * 저장될 기능 이름입니다.
     *
     * @var string
     */
    public $name = 'new-api';

    // ...
}
```

<a name="checking-features"></a>
## 기능 확인

특정 기능이 활성화되어 있는지 확인하려면 `Feature` 파사드의 `active` 메서드를 사용하면 됩니다. 기본적으로 이 동작은 현재 인증된 사용자에 대해 기능을 체크합니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * 리소스 목록을 표시합니다.
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

기본적으로는 현재 인증된 사용자 기준으로 기능을 체크하지만, 다른 사용자나 [스코프](#scope)에 대해 기능을 확인할 수도 있습니다. 이를 위해서는 `Feature` 파사드의 `for` 메서드를 사용하면 됩니다.

```php
return Feature::for($user)->active('new-api')
        ? $this->resolveNewApiResponse($request)
        : $this->resolveLegacyApiResponse($request);
```

Pennant는 기능의 활성화 여부를 확인하는 데 유용한 몇 가지 추가 메서드도 제공합니다.

```php
// 주어진 모든 기능이 활성화되어 있는지 확인...
Feature::allAreActive(['new-api', 'site-redesign']);

// 주어진 기능 중 하나라도 활성화되어 있는지 확인...
Feature::someAreActive(['new-api', 'site-redesign']);

// 특정 기능이 비활성화되어 있는지 확인...
Feature::inactive('new-api');

// 주어진 모든 기능이 비활성화되어 있는지 확인...
Feature::allAreInactive(['new-api', 'site-redesign']);

// 주어진 기능 중 하나라도 비활성화되어 있는지 확인...
Feature::someAreInactive(['new-api', 'site-redesign']);
```

> [!NOTE]
> Artisan 명령어, 큐 처리 작업 등 HTTP 컨텍스트 외의 환경에서 Pennant를 사용할 때는 [기능의 스코프를 명시적으로 지정](#specifying-the-scope)하는 것이 일반적입니다. 또는 인증된 HTTP 컨텍스트와 비인증 상황 모두를 고려할 수 있는 [기본 스코프](#default-scope)를 정의할 수도 있습니다.

<a name="checking-class-based-features"></a>
#### 클래스 기반 기능 확인

클래스 기반 기능을 확인하려면 체크할 때 클래스 이름을 전달해야 합니다.

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
     * 리소스 목록을 표시합니다.
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

`when` 메서드는 기능이 활성화되어 있을 때 지정한 클로저를 실행할 수 있도록 해줍니다. 추가로, 기능이 비활성화된 경우 실행할 두 번째 클로저를 함께 전달할 수도 있습니다.

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
     * 리소스 목록을 표시합니다.
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

`unless` 메서드는 `when`과 반대로, 기능이 비활성화되어 있을 때 첫 번째 클로저를 실행합니다.

```
return Feature::unless(NewApi::class,
    fn () => $this->resolveLegacyApiResponse($request),
    fn () => $this->resolveNewApiResponse($request),
);
```

<a name="the-has-features-trait"></a>
### `HasFeatures` 트레이트

Pennant의 `HasFeatures` 트레이트를 애플리케이션의 `User` 모델(또는 기능 플래그가 필요한 다른 모델)에 추가하면, 모델 인스턴스에서 직접 기능을 손쉽게 확인할 수 있습니다.

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

트레이트를 모델에 추가하면, `features` 메서드를 사용해 간단하게 기능을 체크할 수 있습니다.

```php
if ($user->features()->active('new-api')) {
    // ...
}
```

물론, `features` 메서드를 통해 기능과 관련된 다양한 편의 메서드도 사용할 수 있습니다.

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

Blade에서 기능을 손쉽게 체크할 수 있도록, Pennant는 `@feature` 디렉티브를 제공합니다.

```blade
@feature('site-redesign')
    <!-- 'site-redesign' 기능이 활성화된 경우 -->
@else
    <!-- 'site-redesign' 기능이 비활성화된 경우 -->
@endfeature
```

<a name="middleware"></a>
### 미들웨어

Pennant에는 [미들웨어](/docs/10.x/middleware)도 포함되어 있어, 라우트가 실행되기 전에 현재 인증된 사용자가 특정 기능을 활성 상태로 갖고 있는지 검증할 수 있습니다. 원하는 라우트에 미들웨어를 할당하고, 접근을 요구하는 기능을 지정하면 됩니다. 만약 지정한 기능 중 하나라도 현재 인증된 사용자에게 비활성화되어 있다면, 해당 라우트는 `400 Bad Request` HTTP 응답을 반환합니다. 여러 기능을 지정하려면 static `using` 메서드를 활용할 수 있습니다.

```php
use Illuminate\Support\Facades\Route;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

Route::get('/api/servers', function () {
    // ...
})->middleware(EnsureFeaturesAreActive::using('new-api', 'servers-api'));
```

<a name="customizing-the-response"></a>
#### 응답 커스터마이징

기능이 비활성화된 경우 미들웨어가 반환할 응답을 원하는 대로 커스터마이징하려면 `EnsureFeaturesAreActive` 미들웨어에서 제공하는 `whenInactive` 메서드를 사용할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 서비스 프로바이더 중 한 곳의 `boot` 메서드 내에서 호출하면 됩니다.

```php
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

/**
 * 애플리케이션 서비스를 부트스트랩합니다.
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

<a name="in-memory-cache"></a>
### 메모리 내 캐시

기능을 체크할 때마다 Pennant는 해당 결과를 메모리 내에 캐싱합니다. 예를 들어 `database` 드라이버를 사용할 경우, 하나의 요청 내에서 같은 기능 플래그를 반복적으로 체크해도 추가적인 데이터베이스 쿼리가 발생하지 않습니다. 그리고 요청이 끝날 때까지 기능의 결과가 일관적으로 유지됩니다.

메모리 내 캐시를 직접 초기화(플러시)해야 할 경우, `Feature` 파사드에서 제공하는 `flushCache` 메서드를 사용할 수 있습니다.

```
Feature::flushCache();
```

<a name="scope"></a>
## 스코프

<a name="specifying-the-scope"></a>
### 스코프 지정

위에서 살펴본 것처럼, 기능은 기본적으로 현재 인증된 사용자 기준으로 체크합니다. 그러나 상황에 따라 다른 기준이 필요할 수도 있습니다. 이 경우 `Feature` 파사드의 `for` 메서드를 통해 원하는 스코프를 지정하여 해당 기능을 체크할 수 있습니다.

```php
return Feature::for($user)->active('new-api')
        ? $this->resolveNewApiResponse($request)
        : $this->resolveLegacyApiResponse($request);
```

스코프는 꼭 "사용자"만 될 필요는 없습니다. 예를 들어, 신규 빌링 경험을 전체 팀 단위로 점진적으로 배포하는 상황을 생각해볼 수 있습니다. 특정 팀이 오래된 순서에 따라 더 천천히 롤아웃되기를 원한다면, 다음처럼 기능 해석 클로저를 정의할 수 있습니다.

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

위와 같이, 클로저에서 `User` 대신 `Team` 모델로 타입이 지정되어 있습니다. 사용자 팀에 대해 이 기능이 활성화되어 있는지 확인하려면 `Feature` 파사드의 `for` 메서드에 해당 팀을 넘겨서 체크하면 됩니다.

```php
if (Feature::for($user->team)->active('billing-v2')) {
    return redirect()->to('/billing/v2');
}

// ...
```

<a name="default-scope"></a>
### 기본 스코프

Pennant가 기능을 체크할 때 사용하는 기본 스코프를 커스터마이징할 수도 있습니다. 예를 들어, 모든 기능을 항상 "현재 인증된 사용자의 팀"을 기준으로 체크하고 싶을 때, 기능을 체크할 때마다 매번 `Feature::for($user->team)`를 호출하지 않고, 기본 스코프로 팀을 지정할 수 있습니다. 이 작업은 보통 애플리케이션의 서비스 프로바이더 중 한 곳에서 처리하면 됩니다.

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스를 부트스트랩합니다.
     */
    public function boot(): void
    {
        Feature::resolveScopeUsing(fn ($driver) => Auth::user()?->team);

        // ...
    }
}
```

이제 `for` 메서드로 직접 스코프를 지정하지 않은 경우, 기능 체크는 자동으로 현재 인증된 사용자의 팀을 기준으로 동작합니다.

```php
Feature::active('billing-v2');

// 위 코드는 아래와 동등하게 동작합니다.

Feature::for($user->team)->active('billing-v2');
```

<a name="nullable-scope"></a>
### Nullable 스코프

기능을 체크할 때 전달하는 스코프가 `null`이고, 기능 정의에서 이를 nullable 타입이나 union 타입으로 허용하지 않은 경우, Pennant는 자동으로 해당 기능의 결과를 `false`로 반환합니다.

따라서, 기능을 체크할 때 스코프가 `null`이 될 수 있고 실제로 기능 값 해석 클로저가 실행되길 원한다면, 기능 정의에서 이를 반영해 nullable 타입을 명시하고, `null` 스코프에 대한 로직을 추가해야 합니다. Artisan 명령어, 큐 작업, 인증되지 않은 라우트 등에서는 대부분 인증 사용자가 없으므로 기본 스코프가 `null`이 될 수 있습니다.

항상 [스코프를 명시적으로 지정](#specifying-the-scope)하지 않는 경우, 기능 정의에서 스코프 타입을 "nullable"로 지정하고, `null`인 경우를 적절히 처리해야 합니다.

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
### 스코프 식별

Pennant의 기본 `array` 및 `database` 저장소 드라이버는 모든 PHP 데이터 타입과 Eloquent 모델에 대해 올바르게 스코프 식별자를 저장할 수 있습니다. 하지만, 애플리케이션에서 서드파티 Pennant 드라이버를 사용할 경우, 해당 드라이버가 Eloquent 모델이나 다른 커스텀 타입을 어떻게 저장해야 할지 모를 수도 있습니다.

이런 상황에서는, 애플리케이션에서 Pennant 스코프로 사용하는 객체에 `FeatureScopeable` 계약을 구현(implements)하여, 스토리지에 저장할 수 있는 형태로 스코프 값을 포맷할 수 있습니다.

예를 들어, 하나의 애플리케이션에서 기본 `database` 드라이버와 써드파티 "Flag Rocket" 드라이버를 모두 사용하는 상황을 생각해봅시다. "Flag Rocket" 드라이버는 Eloquent 모델을 저장하는 방법을 알지 못하고, 대신 `FlagRocketUser` 인스턴스가 필요합니다. 이때 `FeatureScopeable` 계약에서 정의된 `toFeatureIdentifier` 메서드를 구현함으로써, 애플리케이션에서 사용하는 각 드라이버별로 저장 가능한 스코프 값을 반환할 수 있습니다.

```php
<?php

namespace App\Models;

use FlagRocket\FlagRocketUser;
use Illuminate\Database\Eloquent\Model;
use Laravel\Pennant\Contracts\FeatureScopeable;

class User extends Model implements FeatureScopeable
{
    /**
     * 주어진 드라이버에 맞게 객체를 기능 스코프 식별자로 변환합니다.
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

### 스코프 직렬화(Serializing Scope)

기본적으로 Pennant는 Eloquent 모델과 연결된 기능(feature)을 저장할 때 완전히 수식된 클래스 이름(fully qualified class name)을 사용합니다. 이미 [Eloquent morph map](/docs/10.x/eloquent-relationships#custom-polymorphic-types)을 사용 중인 경우, Pennant도 이 morph map을 이용하여 저장된 기능이 애플리케이션 구조에 종속되지 않도록 할 수 있습니다.

이를 위해, 서비스 프로바이더에서 Eloquent morph map을 정의한 후 `Feature` 파사드의 `useMorphMap` 메서드를 호출하면 됩니다.

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
## 다양한(feature-rich) 값 저장

지금까지는 기능(feature)을 "활성" 또는 "비활성" 두 가지 상태로만 다루었지만, Pennant는 이진 상태 외에 더 다양한 값도 저장할 수 있습니다.

예를 들어, 애플리케이션의 "지금 구매" 버튼에 대해 세 가지 새로운 색상을 실험한다고 가정해 봅시다. 기능 정의에서 `true`나 `false` 대신 문자열을 반환할 수 있습니다.

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn (User $user) => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

`purchase-button` 기능의 값을 `value` 메서드로 가져올 수 있습니다.

```php
$color = Feature::value('purchase-button');
```

Pennant에 포함된 Blade 디렉티브를 이용하면, 현재 기능의 값에 따라 조건부로 콘텐츠를 쉽게 렌더링할 수 있습니다.

```blade
@feature('purchase-button', 'blue-sapphire')
    <!-- 'blue-sapphire'가 활성 상태일 때 -->
@elsefeature('purchase-button', 'seafoam-green')
    <!-- 'seafoam-green'이 활성 상태일 때 -->
@elsefeature('purchase-button', 'tart-orange')
    <!-- 'tart-orange'가 활성 상태일 때 -->
@endfeature
```

> [!NOTE]
> 리치 값(여러 값을 가질 수 있는 상태)을 사용할 때는, 기능 값이 `false`가 아니면 "활성"으로 간주된다는 점을 꼭 유의해야 합니다.

[조건부 `when`](#conditional-execution) 메서드를 사용할 때, 기능의 값이 첫 번째 클로저로 전달됩니다.

```
Feature::when('purchase-button',
    fn ($color) => /* ... */,
    fn () => /* ... */,
);
```

마찬가지로, 조건부 `unless` 메서드를 호출할 때도 기능의 리치 값이 선택적으로 두 번째 클로저로 전달됩니다.

```
Feature::unless('purchase-button',
    fn () => /* ... */,
    fn ($color) => /* ... */,
);
```

<a name="retrieving-multiple-features"></a>
## 여러 기능 값 가져오기

`values` 메서드를 사용하면, 특정 스코프(범위)에 대해 여러 기능의 값을 한 번에 조회할 수 있습니다.

```php
Feature::values(['billing-v2', 'purchase-button']);

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
// ]
```

또는 `all` 메서드를 사용하면, 정의된 모든 기능 값을 한 번에 조회할 수 있습니다.

```php
Feature::all();

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
//     'site-redesign' => true,
// ]
```

단, 클래스 기반 기능(class based features)은 동적으로 등록되기 때문에, 현재 요청에서 명시적으로 한 번이라도 조회되지 않았다면 `all` 메서드 결과에 포함되지 않을 수 있습니다.

항상 클래스 기반 기능이 `all` 메서드 반환 결과에 나타나길 원한다면, Pennant의 기능 탐색(discovery) 기능을 사용할 수 있습니다. 우선, 애플리케이션의 서비스 프로바이더에서 `discover` 메서드를 호출하세요.

```
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

`discover` 메서드는 애플리케이션의 `app/Features` 디렉터리에 있는 모든 기능 클래스를 등록합니다. 이제 `all` 메서드 결과에는, 해당 기능이 현재 요청에서 한 번이라도 조회되었는지 여부와 관계없이 이러한 클래스가 모두 포함됩니다.

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
## 이거 로딩(Eager Loading)

Pennant는 한 요청(request) 동안 해석된 모든 기능 값을 메모리에 캐싱하지만, 여전히 성능 문제가 생길 수 있습니다. 이러한 상황을 줄이기 위해, Pennant는 기능 값을 미리 로딩(eager loading)하는 기능을 제공합니다.

예를 들어, 반복문 내에서 기능 활성 여부를 반복적으로 확인하는 경우를 생각해봅시다.

```php
use Laravel\Pennant\Feature;

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

데이터베이스 드라이버를 사용할 경우, 이 코드는 반복문 내의 각 사용자에 대해 데이터베이스 쿼리를 실행하므로 쿼리 수가 많아질 수 있습니다. 하지만 Pennant의 `load` 메서드를 사용하면, 여러 사용자(혹은 스코프)의 기능 값을 미리 불러와서 이런 성능 문제를 해결할 수 있습니다.

```php
Feature::for($users)->load(['notifications-beta']);

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

이미 로딩되지 않은 값만 미리 불러오고 싶다면 `loadMissing` 메서드를 사용할 수 있습니다.

```php
Feature::for($users)->loadMissing([
    'new-api',
    'purchase-button',
    'notifications-beta',
]);
```

<a name="updating-values"></a>
## 값 업데이트하기

기능 값이 처음 해석되었을 때, Pennant의 저장 드라이버는 해당 결과를 저장소에 기록합니다. 이렇게 해야 여러 번의 요청 간에도 사용자에게 일관된 경험을 제공할 수 있기 때문입니다. 하지만 때로는 저장된 기능 값을 수동으로 업데이트할 필요가 있습니다.

기능을 "켜기/끄기"할 때는 `activate`, `deactivate` 메서드를 사용할 수 있습니다.

```php
use Laravel\Pennant\Feature;

// 기본 스코프의 기능 활성화
Feature::activate('new-api');

// 특정 스코프의 기능 비활성화
Feature::for($user->team)->deactivate('billing-v2');
```

`activate` 메서드에 두 번째 인자로 값을 전달하면, 리치 값을 수동으로 지정할 수도 있습니다.

```php
Feature::activate('purchase-button', 'seafoam-green');
```

기능의 저장된 값을 잊게 하고 싶다면 `forget` 메서드를 사용하세요. 이 기능이 다시 확인될 때는 feature 정의에 따라 값이 새로 해석됩니다.

```php
Feature::forget('purchase-button');
```

<a name="bulk-updates"></a>
### 대량 업데이트(Bulk Updates)

여러 사용자에 대한 기능 값 저장을 대량으로 갱신하려면 `activateForEveryone`과 `deactivateForEveryone` 메서드를 사용할 수 있습니다.

예를 들어, `new-api` 기능의 안정성이 확인되어 체크아웃(flow)의 'purchase-button' 색상도 확정했다면, 모든 사용자에 대해 값을 일괄로 업데이트할 수 있습니다.

```php
use Laravel\Pennant\Feature;

Feature::activateForEveryone('new-api');

Feature::activateForEveryone('purchase-button', 'seafoam-green');
```

반대로, 모든 사용자에 대해 기능을 비활성화하려면 다음과 같이 하면 됩니다.

```php
Feature::deactivateForEveryone('new-api');
```

> [!NOTE]
> 이 동작은 Pennant 저장 드라이버에 저장되어 있는 기능 값만 업데이트합니다. 애플리케이션의 feature 정의도 함께 변경해야 원하는 효과를 얻을 수 있습니다.

<a name="purging-features"></a>
### 기능 삭제(Purging Features)

때로는 기능 전체를 저장소에서 완전히 삭제하는 것이 유용합니다. 일반적으로 기능 자체를 애플리케이션에서 제거했거나, 기능 정의를 수정하여 모든 사용자에게 즉시 반영하고 싶을 때 사용됩니다.

`purge` 메서드를 통해 특정 기능의 저장된 모든 값을 제거할 수 있습니다.

```php
// 단일 기능 삭제
Feature::purge('new-api');

// 여러 기능 동시 삭제
Feature::purge(['new-api', 'purchase-button']);
```

인수 없이 `purge` 메서드를 호출하면 **모든 기능**을 한 번에 삭제할 수도 있습니다.

```php
Feature::purge();
```

기능 삭제 작업을 배포 파이프라인의 일부로 사용할 수 있게, Pennant는 아티즌 명령어 `pennant:purge`를 제공합니다. 해당 명령어로 원하는 기능들을 저장소에서 삭제할 수 있습니다.

```sh
php artisan pennant:purge new-api

php artisan pennant:purge new-api purchase-button
```

특정 기능만 남기고 나머지 모든 기능을 삭제하려면, `--except` 옵션에 해당 기능 이름들을 전달하면 됩니다. 예를 들어 "new-api"와 "purchase-button"을 제외하고 모든 기능을 삭제하려면 아래와 같이 실행할 수 있습니다.

```sh
php artisan pennant:purge --except=new-api --except=purchase-button
```

또한, 편리하게 사용할 수 있도록 `--except-registered` 플래그도 지원합니다. 이 옵션을 사용하면 서비스 프로바이더에 명시적으로 등록된 기능만 남기고 나머지는 모두 삭제할 수 있습니다.

```sh
php artisan pennant:purge --except-registered
```

<a name="testing"></a>
## 테스트

기능 플래그(feature flag)와 상호작용하는 코드를 테스트할 때, 테스트 내에서 원하는 값을 쉽게 제어할 수 있는 가장 간단한 방법은 해당 기능을 재정의하는 것입니다. 예를 들어, 다음과 같이 기능이 서비스 프로바이더에서 정의되어 있다고 가정해 봅시다.

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn () => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

테스트에서 반환 값을 다르게 만들고 싶다면, 테스트의 앞부분에서 기능을 재정의하면 됩니다. 아래 테스트는 서비스 프로바이더에 여전히 `Arr::random()` 구현이 남아 있더라도 항상 통과합니다.

```php
use Laravel\Pennant\Feature;

public function test_it_can_control_feature_values()
{
    Feature::define('purchase-button', 'seafoam-green');

    $this->assertSame('seafoam-green', Feature::value('purchase-button'));
}
```

클래스 기반 기능도 동일한 방식으로 제어할 수 있습니다.

```php
use App\Features\NewApi;
use Laravel\Pennant\Feature;

public function test_it_can_control_feature_values()
{
    Feature::define(NewApi::class, true);

    $this->assertTrue(Feature::value(NewApi::class));
}
```

기능에서 `Lottery` 인스턴스를 반환한다면, [테스트용 헬퍼](/docs/10.x/helpers#testing-lotteries)를 사용할 수 있습니다.

<a name="store-configuration"></a>
#### 저장소 설정(Store Configuration)

테스트 중에 Pennant가 사용할 저장소를 변경하고 싶다면, 애플리케이션의 `phpunit.xml` 파일에서 `PENNANT_STORE` 환경 변수를 설정하면 됩니다.

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
## 커스텀 Pennant 드라이버 추가하기

<a name="implementing-the-driver"></a>
#### 드라이버 직접 구현하기

Pennant에서 기본으로 제공하는 저장 드라이버가 애플리케이션 요구에 맞지 않는 경우, 직접 저장 드라이버를 작성할 수 있습니다. 커스텀 드라이버 클래스는 `Laravel\Pennant\Contracts\Driver` 인터페이스를 구현해야 합니다.

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

각 메서드는 Redis 연결을 이용해 직접 구현하면 됩니다. 구체적인 예시는 [Pennant 소스 코드](https://github.com/laravel/pennant/blob/1.x/src/Drivers/DatabaseDriver.php)의 `Laravel\Pennant\Drivers\DatabaseDriver`를 참고하세요.

> [!NOTE]
> 라라벨은 커스텀 확장을 저장할 폴더를 기본 제공하지 않습니다. 원하는 위치에 저장하셔도 무방합니다. 여기 예시에서는 확장 확장 드라이버를 보관하기 위해 `Extensions` 디렉터리를 사용합니다.

<a name="registering-the-driver"></a>
#### 드라이버 등록

드라이버 구현이 끝났으면, 이제 이를 라라벨에 등록할 차례입니다. Pennant에 추가 드라이버를 등록하려면, `Feature` 파사드의 `extend` 메서드를 사용하세요. 이 메서드는 애플리케이션의 [서비스 프로바이더](/docs/10.x/providers) 중 하나의 `boot` 메서드에서 호출해야 합니다.

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

드라이버를 등록한 후, 애플리케이션의 `config/pennant.php` 설정 파일에서 `redis` 드라이버를 사용할 수 있습니다.

```
'stores' => [

    'redis' => [
        'driver' => 'redis',
        'connection' => null,
    ],

    // ...

],
```

<a name="events"></a>
## 이벤트(Events)

Pennant는 애플리케이션 전반에서 기능 플래그(feature flag)를 추적할 때 유용한 다양한 이벤트를 발생시킵니다.

### `Laravel\Pennant\Events\RetrievingKnownFeature`

이 이벤트는 특정 스코프 내에서 이미 알려진(정의된) 기능을 처음으로 조회할 때 발생합니다. 기능 플래그 사용에 대한 메트릭을 생성/추적하려는 경우 유용하게 활용할 수 있습니다.

### `Laravel\Pennant\Events\RetrievingUnknownFeature`

이 이벤트는 특정 스코프 내에서 아직 알려지지 않은(정의되지 않은) 기능을 처음으로 조회할 때 발생합니다. 기능 플래그를 삭제했지만, 애플리케이션 곳곳에 남아 있는 사용 흔적을 감지/디버깅할 때 유용합니다.

예를 들어, 이 이벤트를 감지해 `report`하거나 예외를 발생시키도록 할 수 있습니다.

```php
<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;
use Laravel\Pennant\Events\RetrievingUnknownFeature;

class EventServiceProvider extends ServiceProvider
{
    /**
     * Register any other events for your application.
     */
    public function boot(): void
    {
        Event::listen(function (RetrievingUnknownFeature $event) {
            report("Resolving unknown feature [{$event->feature}].");
        });
    }
}
```

### `Laravel\Pennant\Events\DynamicallyDefiningFeature`

이 이벤트는 클래스 기반 기능을 특정 요청에서 처음 동적으로 확인(검사)할 때 발생합니다.