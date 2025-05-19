# 업그레이드 가이드 (Upgrade Guide)

- [9.x에서 10.0으로 업그레이드](#upgrade-10.0)

<a name="high-impact-changes"></a>
## 영향도가 큰 변경사항

<div class="content-list" markdown="1">

- [의존성 업데이트](#updating-dependencies)
- [최소 안정화(stability) 설정 변경](#updating-minimum-stability)

</div>

<a name="medium-impact-changes"></a>
## 영향도가 중간인 변경사항

<div class="content-list" markdown="1">

- [데이터베이스 표현식](#database-expressions)
- [모델의 "dates" 속성](#model-dates-property)
- [Monolog 3](#monolog-3)
- [Redis 캐시 태그](#redis-cache-tags)
- [서비스 모킹(mocking)](#service-mocking)
- [언어 디렉터리](#language-directory)

</div>

<a name="low-impact-changes"></a>
## 영향도가 낮은 변경사항

<div class="content-list" markdown="1">

- [클로저 유효성 검증 규칙 메시지](#closure-validation-rule-messages)
- [폼 요청의 `after` 메서드](#form-request-after-method)
- [Public 경로 바인딩](#public-path-binding)
- [쿼리 예외 생성자](#query-exception-constructor)
- [Rate Limiter 반환값](#rate-limiter-return-values)
- [`Redirect::home` 메서드](#redirect-home)
- [`Bus::dispatchNow` 메서드](#dispatch-now)
- [`registerPolicies` 메서드](#register-policies)
- [ULID 컬럼](#ulid-columns)

</div>

<a name="upgrade-10.0"></a>
## 9.x에서 10.0으로 업그레이드

<a name="estimated-upgrade-time-??-minutes"></a>
#### 예상 업그레이드 소요 시간: 10분

> [!NOTE]
> 가능한 모든 주요 변경사항을 문서화하려 노력했습니다. 다만, 일부 변경사항은 프레임워크의 드물게 쓰이는 부분에 해당하므로 실제로 여러분의 애플리케이션에 영향을 주는 경우는 일부일 수 있습니다. 시간을 절약하고 싶으시다면 [Laravel Shift](https://laravelshift.com/)를 이용해 애플리케이션 업그레이드를 자동화하실 수 있습니다.

<a name="updating-dependencies"></a>
### 의존성 업데이트

**영향도: 높음**

#### PHP 8.1.0 이상 필요

이제 라라벨은 PHP 8.1.0 이상이 필요합니다.

#### Composer 2.2.0 이상 필요

이제 라라벨은 [Composer](https://getcomposer.org) 2.2.0 이상을 요구합니다.

#### Composer 의존성

애플리케이션의 `composer.json` 파일에서 아래 의존성들을 업데이트해야 합니다:

<div class="content-list" markdown="1">

- `laravel/framework`를 `^10.0`으로
- `laravel/sanctum`을 `^3.2`로
- `doctrine/dbal`을 `^3.0`으로
- `spatie/laravel-ignition`을 `^2.0`으로
- `laravel/passport`를 `^11.0`으로 ([업그레이드 가이드](https://github.com/laravel/passport/blob/11.x/UPGRADE.md) 참고)
- `laravel/ui`를 `^4.0`으로

</div>

만약 Sanctum 2.x에서 3.x로 업그레이드하시는 경우, [Sanctum 업그레이드 가이드](https://github.com/laravel/sanctum/blob/3.x/UPGRADE.md)를 반드시 참고하시기 바랍니다.

또한, [PHPUnit 10](https://phpunit.de/announcements/phpunit-10.html)을 사용하고 싶은 경우, 애플리케이션의 `phpunit.xml` 설정 파일에서 `<coverage>` 섹션의 `processUncoveredFiles` 속성을 삭제해야 합니다. 이후, 다음 의존성도 `composer.json`에서 업데이트해주시기 바랍니다:

<div class="content-list" markdown="1">

- `nunomaduro/collision`을 `^7.0`으로
- `phpunit/phpunit`을 `^10.0`으로

</div>

그리고, 애플리케이션에서 사용하는 기타 서드파티 패키지들도 라라벨 10을 지원하는 버전을 사용하고 있는지 반드시 확인해야 합니다.

<a name="updating-minimum-stability"></a>
#### 최소 안정화 설정(minimum-stability)

애플리케이션의 `composer.json` 파일 내 `minimum-stability` 설정값을 `stable`로 변경해야 합니다. 또는, `minimum-stability`의 기본값이 `stable`이므로 이 설정 자체를 삭제해도 무방합니다.

```json
"minimum-stability": "stable",
```

### 애플리케이션

<a name="public-path-binding"></a>
#### Public 경로 바인딩

**영향도: 낮음**

애플리케이션에서 `path.public` 을 컨테이너에 바인딩하여 "public 경로"를 커스터마이즈하고 있다면, 이제는 `Illuminate\Foundation\Application` 객체에서 제공하는 `usePublicPath` 메서드를 사용하는 방식으로 코드를 수정해야 합니다.

```php
app()->usePublicPath(__DIR__.'/public');
```

### 인증, 인가

<a name="register-policies"></a>
### `registerPolicies` 메서드

**영향도: 낮음**

`AuthServiceProvider`의 `registerPolicies` 메서드는 이제 프레임워크에서 자동으로 호출됩니다. 따라서, 여러분의 애플리케이션의 `AuthServiceProvider`의 `boot` 메서드에서 해당 메서드 호출을 제거해도 됩니다.

### 캐시

<a name="redis-cache-tags"></a>
#### Redis 캐시 태그

**영향도: 중간**

`Cache::tags()` 기능은 Memcached를 사용하는 애플리케이션에서만 권장합니다. 애플리케이션이 Redis를 캐시 드라이버로 사용하고 있다면, Memcached로의 이전이나 다른 대체 솔루션 사용을 고려해야 합니다.

### 데이터베이스

<a name="database-expressions"></a>
#### 데이터베이스 표현식

**영향도: 중간**

데이터베이스의 "표현식(Expressions)"(주로 `DB::raw`로 생성됨)은 향후 더 많은 기능을 제공하기 위해 라라벨 10.x에서 내부적으로 다시 설계되었습니다. 중요한 변경점으로, 이제 표현식의 원시 문자열 값을 얻으려면 해당 표현식의 `getValue(Grammar $grammar)` 메서드를 호출해야 합니다. `(string)` 캐스팅으로 문자열을 얻는 방식은 더 이상 지원하지 않습니다.

**이 변경은 일반적인 사용 환경에는 보통 영향을 주지 않습니다.** 다만, 애플리케이션 코드에서 데이터베이스 표현식을 `(string)` 으로 직접 캐스팅하거나, `__toString` 메서드를 직접 호출하고 있다면, 반드시 `getValue` 메서드를 사용하도록 수정해야 합니다.

```php
use Illuminate\Support\Facades\DB;

$expression = DB::raw('select 1');

$string = $expression->getValue(DB::connection()->getQueryGrammar());
```

<a name="query-exception-constructor"></a>
#### 쿼리 예외 생성자

**영향도: 매우 낮음**

`Illuminate\Database\QueryException` 생성자는 이제 첫 번째 인수로 문자열 타입의 커넥션 이름을 받습니다. 만약 해당 예외를 직접 발생시키는 경우, 이 변경에 맞추어 코드를 수정해야 합니다.

<a name="ulid-columns"></a>
#### ULID 컬럼

**영향도: 낮음**

마이그레이션에서 `ulid` 메서드를 인수 없이 호출할 경우, 이제 컬럼명이 `ulid`로 지정됩니다. 이전 라라벨 버전에서는 인수 없이 호출 시 컬럼명이 잘못하여 `uuid`로 지정되었습니다.

```
$table->ulid();
```

`ulid` 메서드 호출 시 명시적으로 컬럼명을 지정하고 싶다면, 인수로 컬럼명을 전달하면 됩니다.

```
$table->ulid('ulid');
```

### Eloquent

<a name="model-dates-property"></a>
#### 모델의 "dates" 속성

**영향도: 중간**

Eloquent 모델에서 사용되던 `$dates` 속성은 더 이상 지원되지 않습니다. 이제는 `$casts` 속성을 사용해야 합니다.

```php
protected $casts = [
    'deployed_at' => 'datetime',
];
```

### 로컬라이제이션

<a name="language-directory"></a>
#### 언어 디렉터리

**영향도: 없음**

기존 애플리케이션에는 해당되지 않지만, 라라벨 애플리케이션 스켈레톤에는 이제 기본적으로 `lang` 디렉터리가 포함되어 있지 않습니다. 신규 라라벨 프로젝트에서는 필요시 `lang:publish` 아티즌 명령어로 해당 디렉터리를 생성할 수 있습니다.

```shell
php artisan lang:publish
```

### 로깅

<a name="monolog-3"></a>
#### Monolog 3

**영향도: 중간**

라라벨의 Monolog 의존성은 Monolog 3.x로 업데이트되었습니다. 애플리케이션 코드에서 Monolog을 직접 사용하는 경우, Monolog의 [업그레이드 가이드](https://github.com/Seldaek/monolog/blob/main/UPGRADE.md)를 반드시 참고하시기 바랍니다.

버그스냅(BugSnag)이나 롤바(Rollbar)처럼 서드파티 로깅 서비스를 사용하는 경우, 해당 패키지 역시 Monolog 3.x 및 라라벨 10.x를 지원하는 버전으로 업그레이드해야 할 수 있습니다.

### 큐

<a name="dispatch-now"></a>
#### `Bus::dispatchNow` 메서드

**영향도: 낮음**

더 이상 지원되지 않는 `Bus::dispatchNow` 및 `dispatch_now` 메서드는 삭제되었습니다. 대신 각각 `Bus::dispatchSync` 및 `dispatch_sync` 메서드를 사용해야 합니다.

<a name="dispatch-return"></a>
#### `dispatch()` 헬퍼의 반환값

**영향도: 낮음**

이전에는 `Illuminate\Contracts\Queue`를 구현하지 않은 클래스를 dispatch할 때 해당 클래스의 `handle` 메서드 반환값을 그대로 반환받았습니다. 이제는 `Illuminate\Foundation\Bus\PendingBatch` 인스턴스를 반환합니다. 이전과 같이 동기 방식의 반환값을 얻고 싶다면, `dispatch_sync()`를 사용해야 합니다.

### 라우팅

<a name="middleware-aliases"></a>
#### 미들웨어 별칭

**영향도: 선택적 적용**

신규 라라벨 애플리케이션에서는 `App\Http\Kernel` 클래스의 `$routeMiddleware` 속성이 `$middlewareAliases`로 이름이 변경되었습니다. 기존 애플리케이션에서 해당 속성명을 변경해도 되고, 변경하지 않아도 무방합니다.

<a name="rate-limiter-return-values"></a>
#### Rate Limiter 반환값

**영향도: 낮음**

`RateLimiter::attempt` 메서드를 호출할 때, 클로저에서 반환한 값이 이제 메서드의 반환값으로 그대로 사용됩니다. 아무것도 반환하지 않거나 `null`을 반환하면, `attempt` 메서드는 `true`를 반환합니다.

```php
$value = RateLimiter::attempt('key', 10, fn () => ['example'], 1);

$value; // ['example']
```

<a name="redirect-home"></a>
#### `Redirect::home` 메서드

**영향도: 매우 낮음**

더 이상 지원되지 않는 `Redirect::home` 메서드는 삭제되었습니다. 대신, 명시적으로 이름이 지정된 라우트로 리다이렉트 하시면 됩니다.

```php
return Redirect::route('home');
```

### 테스트

<a name="service-mocking"></a>
#### 서비스 모킹

**영향도: 중간**

프레임워크에서 `MocksApplicationServices` 트레이트는 더 이상 제공되지 않습니다. 이 트레이트는 `expectsEvents`, `expectsJobs`, `expectsNotifications`와 같은 테스트 용도 메서드를 제공했습니다.

이제는 각각 `Event::fake`, `Bus::fake`, `Notification::fake`를 사용하기를 권장합니다. 각 컴포넌트의 문서에서 fakes를 활용한 모킹 방법에 대해 더 확인할 수 있습니다.

### 유효성 검증

<a name="closure-validation-rule-messages"></a>
#### 클로저 유효성 검증 규칙 메시지

**영향도: 매우 낮음**

클로저 기반의 커스텀 유효성 검증 규칙에서 `$fail` 콜백을 여러 번 호출할 경우, 이제 메시지를 덮어쓰는 대신 메시지 배열에 추가됩니다. 일반적으로는 애플리케이션에 영향을 주지 않습니다.

또한, `$fail` 콜백이 이제 객체를 반환하게 변경되었습니다. 만약 이전에 유효성 검증 클로저의 반환값 타입을 명시하고 있었다면 타입힌트 업데이트가 필요할 수 있습니다.

```php
public function rules()
{
    'name' => [
        function ($attribute, $value, $fail) {
            $fail('validation.translation.key')->translate();
        },
    ],
}
```

<a name="validation-messages-and-closure-rules"></a>
#### 유효성 검증 메시지와 클로저 규칙

**영향도: 매우 낮음**

이전에는 유효성 검증 클로저에서, `$fail` 콜백에 배열을 전달하여 실패 메시지를 다른 키로 할당할 수 있었습니다. 이제는 첫 번째 인자로 키, 두 번째 인자로 실패 메시지를 전달하는 방식으로 변경해야 합니다.

```php
Validator::make([
    'foo' => 'string',
    'bar' => [function ($attribute, $value, $fail) {
        $fail('foo', 'Something went wrong!');
    }],
]);
```

<a name="form-request-after-method"></a>
#### 폼 요청의 After 메서드

**영향도: 매우 낮음**

폼 요청 클래스에서 정의할 수 있는 `after` 메서드는 이제 [라라벨에서 예약된 메서드](https://github.com/laravel/framework/pull/46757)입니다. 이미 `after` 메서드를 사용하는 경우, 메서드명을 변경하거나 라라벨의 새로운 "after validation" 기능을 이용해 코드를 변환해야 합니다.

<a name="miscellaneous"></a>
### 기타

`laravel/laravel` [GitHub 저장소](https://github.com/laravel/laravel)의 변경사항도 함께 참고하는 것을 권장합니다. 이 변경사항 중 상당수는 선택적으로 적용할 수 있으나, 애플리케이션의 파일과 동기화를 맞추고 싶을 수 있습니다. 이 가이드에서 다루는 변경사항 외에도 구성 파일이나 주석 등 다양한 변경점이 포함되어 있으니 참고하시기 바랍니다.

[GitHub 비교 도구](https://github.com/laravel/laravel/compare/9.x...10.x)를 사용하면 변경사항을 쉽게 확인하고, 중요한 업데이트만 선택적으로 반영할 수 있습니다. 다만, 대부분의 변경점은 PHP 네이티브 타입 도입에 따른 것으로, 이 변경들은 하위 호환성이 보장되므로 라라벨 10 마이그레이션 시 필수 반영 사항은 아닙니다.

