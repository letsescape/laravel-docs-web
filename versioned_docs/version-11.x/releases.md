# 릴리즈 노트 (Release Notes)

- [버전 관리 방식](#versioning-scheme)
- [지원 정책](#support-policy)
- [라라벨 11](#laravel-11)

<a name="versioning-scheme"></a>
## 버전 관리 방식

라라벨과 그 외의 공식 패키지들은 [시맨틱 버전 관리(Semantic Versioning)](https://semver.org)을 따릅니다. 주요 프레임워크 릴리즈는 매년(대략 1분기)에, 마이너 및 패치 릴리즈는 매주 나올 수 있습니다. 마이너 버전과 패치 버전에는 **절대로** 하위 호환성이 깨지는 변경 사항이 포함되어서는 안 됩니다.

애플리케이션이나 패키지에서 라라벨 프레임워크 또는 그 구성 요소를 참조할 때는 반드시 `^11.0`과 같이 버전 제약 조건을 사용해야 합니다. 이는 라라벨의 주요 버전 업데이트에는 호환성에 영향을 주는 변경이 포함될 수 있기 때문입니다. 하지만, 새로운 주요 릴리즈로의 마이그레이션이 하루 이내에 끝날 수 있도록 항상 최선을 다하고 있습니다.

<a name="named-arguments"></a>
#### 네임드 인수(Arguments)

[네임드 인수(named arguments)](https://www.php.net/manual/en/functions.arguments.php#functions.named-arguments)는 라라벨의 하위 호환성 가이드라인에 포함되지 않습니다. 라라벨 코드베이스의 개선을 위해 필요하다면 함수 인수명의 변경이 있을 수 있습니다. 따라서, 라라벨 메서드를 호출할 때 네임드 인수를 사용하는 경우 인수명이 향후 변경될 수 있음을 반드시 인지하고 신중히 사용해야 합니다.

<a name="support-policy"></a>
## 지원 정책

모든 라라벨 릴리즈에 대해 버그 수정은 18개월, 보안 패치는 2년 동안 제공됩니다. Lumen을 포함한 추가 라이브러리들은 최신 주요 릴리즈만 버그 수정을 받습니다. 또한, 라라벨이 지원하는 데이터베이스 버전에 대해서는 [데이터베이스 소개](/docs/11.x/database#introduction)에서 반드시 확인하세요.

<div class="overflow-auto">

| 버전 | PHP (*) | 출시일 | 버그 수정 지원 종료 | 보안 패치 지원 종료 |
| --- | --- | --- | --- | --- |
| 9 | 8.0 - 8.2 | 2022년 2월 8일 | 2023년 8월 8일 | 2024년 2월 6일 |
| 10 | 8.1 - 8.3 | 2023년 2월 14일 | 2024년 8월 6일 | 2025년 2월 4일 |
| 11 | 8.2 - 8.4 | 2024년 3월 12일 | 2025년 9월 3일 | 2026년 3월 12일 |
| 12 | 8.2 - 8.4 | 2025년 2월 24일 | 2026년 8월 13일 | 2027년 2월 24일 |

</div>

<div class="version-colors">
```
<div class="end-of-life">
    <div class="color-box"></div>
    <div>End of life</div>
</div>
<div class="security-fixes">
    <div class="color-box"></div>
    <div>Security fixes only</div>
</div>
```
</div>

(*) 지원되는 PHP 버전

<a name="laravel-11"></a>
## 라라벨 11

라라벨 11은 간결해진 애플리케이션 구조, 초 단위의 속도 제한, 헬스 라우팅, 안전한 암호화 키 교체, 큐 테스트 기능 개선, [Resend](https://resend.com) 메일 전송 지원, Prompt 유효성 검증 통합, 새로운 아티즌 명령어 등 다양한 개선을 통해 라라벨 10.x에서 더욱 진화하였습니다. 또한, 공식적으로 확장 가능한 웹소켓 서버인 Laravel Reverb가 도입되어, 애플리케이션에 강력한 실시간 기능을 제공합니다.

<a name="php-8"></a>
### PHP 8.2

라라벨 11.x는 최소 PHP 8.2 버전이 필요합니다.

<a name="structure"></a>
### 간결해진 애플리케이션 구조

_이 간결한 애플리케이션 구조는 [Taylor Otwell](https://github.com/taylorotwell)과 [Nuno Maduro](https://github.com/nunomaduro)가 개발했습니다._

라라벨 11에서는 **새로운** 라라벨 애플리케이션을 위한 더욱 간결한 프로젝트 구조가 도입되었습니다. 기존 애플리케이션의 수정 없이 적용 가능하며, 라라벨 개발자들이 익숙한 주요 개념들을 그대로 유지하면서도 더 현대적이고 가벼운 개발 경험을 제공합니다. 아래에서는 라라벨의 새로운 애플리케이션 구조의 핵심 사항을 살펴봅니다.

#### 애플리케이션 부트스트랩 파일

`bootstrap/app.php` 파일은 코드 기반의 애플리케이션 설정 파일로 새롭게 개선되었습니다. 이제 이 파일에서 라우팅, 미들웨어, 서비스 프로바이더, 예외 처리 등 애플리케이션의 다양한 요소를 직접 구성할 수 있습니다. 이 파일을 통해 기존에는 애플리케이션 파일 구조 곳곳에 분산되어 있던 여러 상위 수준의 설정들을 한 곳에서 관리하게 되었습니다.

```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

<a name="service-providers"></a>
#### 서비스 프로바이더

이전에는 라라벨 기본 애플리케이션 구조에 5개의 서비스 프로바이더가 포함되어 있었으나, 라라벨 11에서는 이제 하나의 `AppServiceProvider`만 포함됩니다. 나머지 프로바이더들의 기능은 `bootstrap/app.php`로 통합되었거나, 프레임워크에서 자동 처리되며, 필요한 경우 `AppServiceProvider`에 직접 작성할 수 있습니다.

예를 들어, 이벤트 디스커버리(event discovery)는 기본적으로 활성화되어 있어, 이벤트와 리스너의 수동 등록이 거의 필요하지 않습니다. 하지만 수동 등록이 필요한 경우에는 `AppServiceProvider`에 추가하면 됩니다. 이와 마찬가지로, 이전에 `AuthServiceProvider`에 등록하던 라우트 모델 바인딩 또는 인가 게이트(Gate)도 이제 `AppServiceProvider`에서 처리할 수 있습니다.

<a name="opt-in-routing"></a>
#### 선택적 API 및 브로드캐스트 라우팅

이제 `api.php`와 `channels.php` 라우트 파일은 기본적으로 포함되지 않으며, 많은 애플리케이션에서 필요하지 않기 때문입니다. 이 파일들이 필요할 경우, 아래와 같이 간단한 아티즌 명령어로 생성할 수 있습니다.

```shell
php artisan install:api

php artisan install:broadcasting
```

<a name="middleware"></a>
#### 미들웨어

이전에는 새 라라벨 애플리케이션에 9개의 미들웨어가 포함되어 있었으며, 이는 인증, 입력 문자열 트림, CSRF 토큰 검증 등 다양한 작업을 수행했습니다.

라라벨 11에서는 이 미들웨어들이 프레임워크 내부로 이동하여, 애플리케이션 구조를 단순화하였습니다. 미들웨어 동작을 커스터마이즈하는 새로운 메서드가 추가되어, 애플리케이션의 `bootstrap/app.php` 파일에서 쉽게 설정할 수 있습니다.

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->validateCsrfTokens(
        except: ['stripe/*']
    );

    $middleware->web(append: [
        EnsureUserIsSubscribed::class,
    ])
})
```

이제 모든 미들웨어를 `bootstrap/app.php`에서 손쉽게 커스터마이즈할 수 있으므로, 별도의 HTTP "커널" 클래스가 필요하지 않습니다.

<a name="scheduling"></a>
#### 스케줄링

새로운 `Schedule` 파사드를 이용하면, 스케줄된 작업을 애플리케이션의 `routes/console.php` 파일에 직접 정의할 수 있게 되어, 별도의 콘솔 "커널" 클래스가 필요 없어졌습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send')->daily();
```

<a name="exception-handling"></a>
#### 예외 처리

라우팅이나 미들웨어와 마찬가지로, 예외 처리 역시 기존의 독립적인 예외 처리기 클래스를 사용하는 대신, 이제 `bootstrap/app.php` 파일에서 직접 커스터마이즈할 수 있어, 새 애플리케이션의 파일 수가 줄어듭니다.

```php
->withExceptions(function (Exceptions $exceptions) {
    $exceptions->dontReport(MissedFlightException::class);

    $exceptions->report(function (InvalidOrderException $e) {
        // ...
    });
})
```

<a name="base-controller-class"></a>
#### 기본 `Controller` 클래스

새로운 라라벨 애플리케이션에 포함되는 기본 컨트롤러가 간소화되었습니다. 더 이상 라라벨 내부의 `Controller` 클래스를 상속하지 않으며, `AuthorizesRequests` 및 `ValidatesRequests` 트레잇도 제거되었습니다. 이 트레잇들은 필요할 경우 개별 컨트롤러에서 직접 사용하면 됩니다.

```
<?php

namespace App\Http\Controllers;

abstract class Controller
{
    //
}
```

<a name="application-defaults"></a>
#### 애플리케이션 기본값

이제 새로 생성하는 라라벨 애플리케이션은 기본적으로 데이터베이스 저장소로 SQLite를, 그리고 세션, 캐시, 큐에는 `database` 드라이버를 사용합니다. 이를 통해 추가 소프트웨어 설치나 별도의 데이터베이스 마이그레이션을 진행하지 않고도 바로 개발을 시작할 수 있습니다.

또한 시간이 흐르면서, 이러한 라라벨 서비스의 `database` 드라이버들도 실제 운영 환경에서 충분히 사용할 수 있을 정도로 견고해졌기 때문에, 로컬 개발 뿐만 아니라 프로덕션에서도 일관된 선택지가 됩니다.

<a name="reverb"></a>
### Laravel Reverb

_Laravel Reverb는 [Joe Dixon](https://github.com/joedixon)이 개발했습니다._

[Laravel Reverb](https://reverb.laravel.com)는 놀라울 정도로 빠르고 확장 가능한 실시간 WebSocket 통신을 라라벨 애플리케이션에 직접 제공하며, 라라벨의 기존 이벤트 브로드캐스팅 도구인 Laravel Echo와도 매끄럽게 통합됩니다.

```shell
php artisan reverb:start
```

또한, Reverb는 Redis의 발행/구독 기능을 이용한 수평 확장(horizontally scaling)을 지원합니다. 이로써 여러 대의 백엔드 Reverb 서버가 하나의 대규모 애플리케이션의 WebSocket 트래픽을 분산 처리할 수 있습니다.

자세한 내용은 [Reverb 공식 문서](/docs/11.x/reverb)를 참고하세요.

<a name="rate-limiting"></a>
### 초 단위 속도 제한

_초 단위 속도 제한 기능은 [Tim MacDonald](https://github.com/timacdonald)가 기여했습니다._

라라벨은 이제 모든 속도 제한기(HTTP 요청, 큐 작업 등)에서 "초 단위" 속도 제한을 지원합니다. 이전까지는 분 단위로만 제한할 수 있었습니다.

```php
RateLimiter::for('invoices', function (Request $request) {
    return Limit::perSecond(1);
});
```

라라벨의 속도 제한에 대한 자세한 내용은 [속도 제한 문서](/docs/11.x/routing#rate-limiting)를 참고하세요.

<a name="health"></a>
### 헬스 라우팅

_헬스 라우팅 기능은 [Taylor Otwell](https://github.com/taylorotwell)이 기여했습니다._

새로운 라라벨 11 애플리케이션에는 `health` 라우팅 지시문이 포함되어, Kubernetes와 같은 오케스트레이션 시스템 또는 외부 애플리케이션 헬스 모니터링 서비스가 호출할 수 있는 간단한 헬스 체크 엔드포인트(`/up` 경로)를 제공합니다.

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)
```

이 라우트에 HTTP 요청이 오면 라라벨은 `DiagnosingHealth` 이벤트도 디스패치하므로, 애플리케이션별로 추가적인 헬스 체크를 수행할 수도 있습니다.

<a name="encryption"></a>
### 안전한 암호화 키 교체

_안전한 암호화 키 교체 기능은 [Taylor Otwell](https://github.com/taylorotwell)이 기여했습니다._

라라벨은 세션 쿠키를 포함해 모든 쿠키를 암호화합니다. 즉, 라라벨 애플리케이션에 들어오는 거의 모든 요청이 암호화에 의존합니다. 이런 구조에서 암호화 키를 교체하면 모든 사용자가 로그아웃되고, 이전 키로 암호화된 데이터는 복호화가 불가능해집니다.

라라벨 11에서는 `APP_PREVIOUS_KEYS` 환경변수에 이전 암호화 키들을 쉼표로 구분해 지정할 수 있습니다.

값을 암호화할 때는 항상 `APP_KEY` 환경변수에 있는 현재 키가 사용됩니다. 값을 복호화할 때는 먼저 현재 키로 시도하고, 실패할 경우 이전 키들을 순차적으로 시도해 복호화가 성공하면 그 값을 사용합니다.

이 방식 덕분에, 암호화 키를 교체하더라도 사용자는 로그아웃되지 않고 기존 데이터를 계속 사용할 수 있습니다.

라라벨의 암호화 기능에 대한 자세한 내용은 [암호화 문서](/docs/11.x/encryption)를 참고하세요.

<a name="automatic-password-rehashing"></a>
### 자동 비밀번호 재해시(재해싱)

_자동 비밀번호 재해시 기능은 [Stephen Rees-Carter](https://github.com/valorin)가 기여했습니다._

라라벨의 기본 비밀번호 해시 알고리즘은 bcrypt입니다. bcrypt 해시의 "work factor"(연산 횟수)는 `config/hashing.php` 파일이나 `BCRYPT_ROUNDS` 환경변수로 조절할 수 있습니다.

보통 CPU나 GPU 성능이 발전함에 따라 bcrypt work factor를 높여 주어야 합니다. 라라벨 11에서는 애플리케이션의 work factor가 변경된 경우, 사용자가 인증할 때마다 자동으로 비밀번호를 재해시합니다.

<a name="prompt-validation"></a>
### Prompt 유효성 검증

_Prompt 유효성 검증 통합은 [Andrea Marco Sartori](https://github.com/cerbero90)가 기여했습니다._

[Laravel Prompts](/docs/11.x/prompts)는 명령줄 애플리케이션에서 아름답고 직관적인 폼을 만들 수 있게 해주는 PHP 패키지로, 플레이스홀더 텍스트 및 유효성 검증 등 브라우저와 유사한 기능을 지원합니다.

라라벨 Prompts는 클로저를 통한 입력값 검증을 지원합니다.

```php
$name = text(
    label: 'What is your name?',
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

하지만 많은 입력값이나 복잡한 유효성 검증이 필요한 경우 이 방식이 번거로울 수 있습니다. 이에 따라, 라라벨 11에서는 프롬프트 입력값 유효성 검증에 [라라벨 validator](/docs/11.x/validation)의 전체 기능을 그대로 사용할 수 있습니다.

```php
$name = text('What is your name?', validate: [
    'name' => 'required|min:3|max:255',
]);
```

<a name="queue-interaction-testing"></a>
### 큐 상호작용 테스트

_큐 상호작용 테스트 기능은 [Taylor Otwell](https://github.com/taylorotwell)이 기여했습니다._

이전에는 큐에 등록된 작업이 릴리스, 삭제, 수동 실패 처리됐는지를 테스트하기 위해 커스텀 큐 페이크(fake)와 스텁을 작성해야 했습니다. 이제 라라벨 11에서는 `withFakeQueueInteractions` 메서드를 통해 이러한 큐 동작을 손쉽게 테스트할 수 있습니다.

```php
use App\Jobs\ProcessPodcast;

$job = (new ProcessPodcast)->withFakeQueueInteractions();

$job->handle();

$job->assertReleased(delay: 30);
```

큐에 등록된 작업 테스트에 대한 더 자세한 정보는 [큐 문서](/docs/11.x/queues#testing)를 참고하세요.

<a name="new-artisan-commands"></a>
### 새로운 아티즌 명령어

_클래스 생성 관련 아티즌 명령어는 [Taylor Otwell](https://github.com/taylorotwell)이 기여했습니다._

아티즌에서 클래스, 열거형(Enum), 인터페이스, 트레잇을 빠르게 생성할 수 있는 새로운 명령어들이 추가되었습니다.

```shell
php artisan make:class
php artisan make:enum
php artisan make:interface
php artisan make:trait
```

<a name="model-cast-improvements"></a>
### 모델 캐스트 개선

_모델 캐스트 개선은 [Nuno Maduro](https://github.com/nunomaduro)가 기여했습니다._

라라벨 11부터는 모델의 캐스트(cast)를 속성이 아니라 메서드로 정의할 수 있습니다. 이를 통해, 특히 인수(arguments)를 사용하는 캐스트 정의가 훨씬 더 간결하고 직관적으로 바뀝니다.

```
/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'options' => AsCollection::using(OptionCollection::class),
                  // AsEncryptedCollection::using(OptionCollection::class),
                  // AsEnumArrayObject::using(OptionEnum::class),
                  // AsEnumCollection::using(OptionEnum::class),
    ];
}
```

속성 캐스팅(attribute casting)에 대한 자세한 내용은 [Eloquent 문서](/docs/11.x/eloquent-mutators#attribute-casting)를 참고하세요.

<a name="the-once-function"></a>
### `once` 함수

_`once` 헬퍼 함수는 [Taylor Otwell](https://github.com/taylorotwell)과 [Nuno Maduro](https://github.com/nunomaduro)가 기여했습니다._

`once` 헬퍼 함수는 주어진 콜백을 한 번 실행한 뒤, 해당 요청(프로세스) 내에서는 메모리에 결과를 캐싱합니다. 같은 콜백으로 해당 함수가 다시 호출되면 이전에 캐시된 결과를 그대로 반환합니다.

```
function random(): int
{
    return once(function () {
        return random_int(1, 1000);
    });
}

random(); // 123
random(); // 123 (캐시된 결과)
random(); // 123 (캐시된 결과)
```

`once` 헬퍼에 대한 자세한 정보는 [헬퍼 문서](/docs/11.x/helpers#method-once)를 참고하세요.

<a name="database-performance"></a>
### 인메모리 데이터베이스 테스트 성능 개선

_인메모리 데이터베이스 테스트 성능 개선은 [Anders Jenbo](https://github.com/AJenbo)가 기여했습니다._

라라벨 11에서는 테스트 시 `:memory:` SQLite 데이터베이스를 사용할 때 성능이 크게 향상되었습니다. 이는 라라벨이 PHP의 PDO 객체 참조를 유지하고, 여러 커넥션 간에 재사용하도록 개선했기 때문입니다. 실제로 전체 테스트 실행 시간이 절반가량 단축되는 경우도 많습니다.

<a name="mariadb"></a>
### MariaDB 지원 향상

_MariaDB 지원 개선은 [Jonas Staudenmeir](https://github.com/staudenmeir)와 [Julius Kiekbusch](https://github.com/Jubeki)가 기여했습니다._

라라벨 11에서는 MariaDB 지원이 더욱 발전했습니다. 이전 버전에서는 MySQL 드라이버를 통해 MariaDB를 사용할 수 있었지만, 이제는 전용 MariaDB 드라이버가 새로 도입되어 해당 데이터베이스에 더 적합한 기본 설정을 제공합니다.

라라벨의 데이터베이스 드라이버에 대해 더 알아보려면 [데이터베이스 문서](/docs/11.x/database)를 참고하세요.

<a name="inspecting-database"></a>
### 데이터베이스 인스펙션 및 스키마 작업 개선

_스키마 작업 및 데이터베이스 인스펙션 개선은 [Hafez Divandari](https://github.com/hafezdivandari)가 기여했습니다._

라라벨 11에는 데이터베이스 스키마 작업과 인스펙션 관련 다양한 새 메서드가 추가되었습니다. 이제 컬럼의 직접 수정/이름 변경/삭제 등이 기본적으로 지원되며, 고급 공간 타입(spatial type), 기본값이 아닌 스키마명, 테이블/뷰/컬럼/인덱스/외래키 등 다양한 객체에 대한 네이티브 스키마 메서드도 사용할 수 있습니다.

```
use Illuminate\Support\Facades\Schema;

$tables = Schema::getTables();
$views = Schema::getViews();
$columns = Schema::getColumns('users');
$indexes = Schema::getIndexes('users');
$foreignKeys = Schema::getForeignKeys('users');
```