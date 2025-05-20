# 릴리즈 노트 (Release Notes)

- [버전 관리 정책](#versioning-scheme)
    - [예외 사항](#exceptions)
- [지원 정책](#support-policy)
- [라라벨 8](#laravel-8)

<a name="versioning-scheme"></a>
## 버전 관리 정책

라라벨 및 공식 서드파티 패키지는 [시맨틱 버저닝(Semantic Versioning)](https://semver.org)을 따릅니다. 프레임워크의 메이저 릴리즈는 매년(대략 2월)에 제공되며, 마이너 및 패치 릴리즈는 매주처럼 자주 나올 수 있습니다. 마이너 및 패치 릴리즈에는 **절대** 하위 호환성을 깨뜨리는 변경 사항이 포함되어서는 안 됩니다.

애플리케이션이나 패키지에서 라라벨 프레임워크 또는 라라벨 컴포넌트를 참조할 때는 항상 `^8.0`과 같은 버전 제약 조건을 사용하는 것이 좋습니다. 라라벨의 메이저 릴리즈에는 하위 호환성을 깨뜨리는 변경이 포함될 수 있기 때문입니다. 물론, 새로운 메이저 릴리즈로 하루 이내에 업데이트할 수 있도록 최대한 노력하고 있습니다.

<a name="exceptions"></a>
### 예외 사항

<a name="named-arguments"></a>
#### 네임드 인수(Named Arguments)

현재 시점에서, PHP의 [네임드 인수](https://www.php.net/manual/en/functions.arguments.php#functions.named-arguments) 기능은 라라벨의 하위 호환성 정책에 포함되어 있지 않습니다. 라라벨 코드베이스의 품질 개선을 위해 필요에 따라 함수 매개변수명을 변경할 수 있습니다. 따라서, 라라벨 메서드를 호출할 때 네임드 인수를 활용하는 경우, 앞으로 매개변수명이 변경될 수 있다는 점을 유의해서 신중하게 사용해야 합니다.

<a name="support-policy"></a>
## 지원 정책

모든 라라벨 릴리즈에 대해 버그 수정은 18개월 동안, 보안 수정은 2년간 제공됩니다. 추가적인 라이브러리(예: Lumen)에는 가장 최신 메이저 릴리즈만 버그가 수정됩니다. 또한, 라라벨에서 [지원하는 데이터베이스 버전](/docs/8.x/database#introduction)도 반드시 확인해 주세요.

| 버전 | PHP (*) | 출시일 | 버그 수정 종료일 | 보안 수정 종료일 |
| --- | --- | --- | --- | --- |
| 6 (LTS) | 7.2 - 8.0 | 2019년 9월 3일 | 2022년 1월 25일 | 2022년 9월 6일 |
| 7 | 7.2 - 8.0 | 2020년 3월 3일 | 2020년 10월 6일 | 2021년 3월 3일 |
| 8 | 7.3 - 8.1 | 2020년 9월 8일 | 2022년 7월 26일 | 2023년 1월 24일 |
| 9 | 8.0 - 8.1 | 2022년 2월 8일 | 2023년 8월 8일 | 2024년 2월 6일 |
| 10 | 8.1 - 8.3 | 2023년 2월 14일 | 2024년 8월 6일 | 2025년 2월 4일 |

(*) 지원되는 PHP 버전

<a name="laravel-8"></a>
## 라라벨 8

라라벨 8은 Laravel 7.x에서 이루어진 개선을 이어가며, Laravel Jetstream, 모델 팩토리 클래스, 마이그레이션 스쿼싱, 작업 배치(job batching), 향상된 요청 속도 제한(rate limiting), 큐(queue) 기능 개선, 동적 Blade 컴포넌트, Tailwind 기반 페이지네이션 뷰, 시간 테스트 헬퍼, `artisan serve` 개선, 이벤트 리스너 개선 및 다양한 버그 수정과 사용성 개선을 제공합니다.

<a name="laravel-jetstream"></a>
### Laravel Jetstream

_Laravel Jetstream은 [Taylor Otwell](https://github.com/taylorotwell)이 작성하였습니다._

[Laravel Jetstream](https://jetstream.laravel.com)은 라라벨을 위한 아름답게 설계된 애플리케이션 시작 템플릿(scaffolding)입니다. Jetstream은 새로운 프로젝트를 시작하기에 완벽한 출발점을 제공하며, 로그인, 회원가입, 이메일 인증, 2단계 인증, 세션 관리, Laravel Sanctum을 활용한 API 지원, 선택 가능한 팀 관리 기능을 기본으로 포함합니다. Laravel Jetstream은 이전 라라벨 버전에서 제공되던 레거시 인증 UI scaffolding을 대체하며 더 발전시켰습니다.

Jetstream은 [Tailwind CSS](https://tailwindcss.com)로 디자인되어 있으며, [Livewire](https://laravel-livewire.com) 또는 [Inertia](https://inertiajs.com) 중 원하는 방식으로 scaffolding을 선택할 수 있습니다.

<a name="models-directory"></a>
### Models 디렉토리

많은 커뮤니티의 요청에 따라, 이제 기본 라라벨 애플리케이션 스캐폴딩에 `app/Models` 디렉토리가 포함됩니다. 이 디렉토리가 여러분의 Eloquent 모델을 위한 새로운 홈이 되길 바랍니다! 관련된 모든 제너레이터 명령어들도 이 디렉토리가 존재하면 모델을 `app/Models` 하위에 생성하도록 반영되었습니다. 만약 해당 디렉토리가 없다면, 프레임워크는 기존과 같이 `app` 디렉토리에 모델을 생성합니다.

<a name="model-factory-classes"></a>
### 모델 팩토리 클래스

_모델 팩토리 클래스는 [Taylor Otwell](https://github.com/taylorotwell)이 기여하였습니다._

Eloquent의 [모델 팩토리](/docs/8.x/database-testing#defining-model-factories)가 완전히 클래스 기반으로 새로 작성되었으며, 연관관계를 1급 시민으로서 지원하도록 개선되었습니다. 예를 들어, Laravel에서 기본 제공하는 `UserFactory`는 다음과 같이 작성됩니다.

```
<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    /**
     * 팩토리와 매칭되는 모델 이름입니다.
     *
     * @var string
     */
    protected $model = User::class;

    /**
     * 모델의 기본 상태를 정의합니다.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            'remember_token' => Str::random(10),
        ];
    }
}
```

생성된 모델에서 사용할 수 있는 새로운 `HasFactory` 트레이트 덕분에, 모델 팩토리는 다음과 같이 손쉽게 사용할 수 있습니다.

```
use App\Models\User;

User::factory()->count(50)->create();
```

모델 팩토리가 이제 단순한 PHP 클래스이므로, 상태(state) 변환(transform)도 클래스 메서드로 작성할 수 있습니다. 그리고 팩토리에서 필요한 경우, 다양한 헬퍼 메서드를 자유롭게 추가할 수 있습니다.

예를 들어, `User` 모델에 기본 속성 값 중 하나를 변경하는 `suspended` 상태가 있다고 가정해봅시다. 이 상태 변환을 팩토리의 `state` 메서드를 활용해 정의할 수 있습니다. 상태 메서드명은 자유롭게 지정할 수 있으며, 결국 일반적인 PHP 메서드일 뿐입니다.

```
/**
 * 사용자가 정지된 상태임을 나타냅니다.
 *
 * @return \Illuminate\Database\Eloquent\Factories\Factory
 */
public function suspended()
{
    return $this->state([
        'account_status' => 'suspended',
    ]);
}
```

이렇게 상태 변환 메서드를 정의한 후에는, 아래와 같이 사용할 수 있습니다.

```
use App\Models\User;

User::factory()->count(5)->suspended()->create();
```

위에서 언급한 것처럼, 라라벨 8의 모델 팩토리는 연관관계에 대한 1급 지원을 제공합니다. 예를 들어, `User` 모델에 `posts` 연관관계 메서드가 있다면, 아래 코드를 실행하여 3개의 포스트를 가진 사용자를 간단히 생성할 수 있습니다.

```
$users = User::factory()
            ->hasPosts(3, [
                'published' => false,
            ])
            ->create();
```

업그레이드를 용이하게 하기 위해 [laravel/legacy-factories](https://github.com/laravel/legacy-factories) 패키지가 공개되어, Laravel 8.x에서도 기존 구식(facade 기반) 모델 팩토리를 사용할 수 있습니다.

라라벨의 새롭게 설계된 팩토리에는 더 많은 기능이 있으며, 분명히 만족하실 것입니다. 모델 팩토리에 대해 더 자세히 알고 싶다면 [데이터베이스 테스트 문서](/docs/8.x/database-testing#defining-model-factories)를 참고해 주세요.

<a name="migration-squashing"></a>
### 마이그레이션 스쿼싱(Migration Squashing)

_마이그레이션 스쿼싱 기능은 [Taylor Otwell](https://github.com/taylorotwell)이 기여하였습니다._

애플리케이션을 개발할수록 마이그레이션 파일이 점점 쌓이게 되어, 디렉토리가 수백 개의 마이그레이션으로 비대해질 수 있습니다. 이제 MySQL 또는 PostgreSQL을 사용할 경우, 여러 마이그레이션 파일을 하나의 SQL 파일로 "스쿼시(squash)"할 수 있습니다. 시작하려면 다음과 같이 `schema:dump` 명령어를 실행하면 됩니다.

```
php artisan schema:dump

// 현재 데이터베이스 구조를 덤프하고 기존 마이그레이션을 모두 정리(prune)합니다...
php artisan schema:dump --prune
```

이 명령어를 실행하면, 라라벨은 `database/schema` 디렉토리에 "schema" 파일을 작성합니다. 이후 데이터베이스를 마이그레이션할 때 아직 실행된 마이그레이션이 없다면, 라라벨은 이 스키마 파일의 SQL을 우선 실행합니다. 스키마 파일이 실행된 후에는 스키마 덤프에 포함되지 않은 나머지 마이그레이션을 순차적으로 실행합니다.

<a name="job-batching"></a>
### 작업 배치(Job Batching)

_작업 배치 기능은 [Taylor Otwell](https://github.com/taylorotwell) & [Mohamed Said](https://github.com/themsaid)가 기여하였습니다._

라라벨의 작업 배치(job batching) 기능을 활용하면, 여러 작업을 묶어서 실행하고 모든 작업 처리가 완료된 후 특정 동작을 수행할 수 있습니다.

`Bus` 파사드의 새로운 `batch` 메서드를 이용해 여러 작업을 한번에 디스패치할 수 있습니다. 배치는 주로 완료 콜백과 함께 사용할 때 유용합니다. 따라서, `then`, `catch`, `finally` 메서드를 통해 배치 처리 완료 시 실행할 콜백을 정의할 수 있습니다. 이들 콜백은 모두 `Illuminate\Bus\Batch` 인스턴스를 인자로 받습니다.

```
use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Bus\Batch;
use Illuminate\Support\Facades\Bus;
use Throwable;

$batch = Bus::batch([
    new ProcessPodcast(Podcast::find(1)),
    new ProcessPodcast(Podcast::find(2)),
    new ProcessPodcast(Podcast::find(3)),
    new ProcessPodcast(Podcast::find(4)),
    new ProcessPodcast(Podcast::find(5)),
])->then(function (Batch $batch) {
    // 모든 작업이 성공적으로 완료됨...
})->catch(function (Batch $batch, Throwable $e) {
    // 첫 번째 작업 실패가 감지됨...
})->finally(function (Batch $batch) {
    // 배치 작업이 모두 종료됨...
})->dispatch();

return $batch->id;
```

작업 배치에 대해 더 자세히 알고 싶다면 [큐 문서](/docs/8.x/queues#job-batching)를 참고해 주세요.

<a name="improved-rate-limiting"></a>
### 향상된 요청 속도 제한

_요청 속도 제한(rate limiting) 기능은 [Taylor Otwell](https://github.com/taylorotwell)이 개선하였습니다._

라라벨의 요청 속도 제한 기능이 더 유연하고 강력해졌으며, 이전 버전의 `throttle` 미들웨어 API와의 하위 호환성도 유지됩니다.

속도 제한기는 `RateLimiter` 파사드의 `for` 메서드로 정의합니다. `for` 메서드는 제한기 이름과, 해당 제한기를 적용할 라우트에 적용될 제한 설정을 반환하는 클로저를 받습니다.

```
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

RateLimiter::for('global', function (Request $request) {
    return Limit::perMinute(1000);
});
```

제한기 콜백은 들어오는 HTTP 요청 인스턴스를 받기 때문에, 요청 내용이나 인증된 사용자에 따라 동적으로 제한을 지정할 수 있습니다.

```
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
                ? Limit::none()
                : Limit::perMinute(100);
});
```

경우에 따라 임의의 값에 따라 제한을 그룹핑하고 싶을 때가 있습니다. 예를 들어, 사용자가 지정한 경로로 분당 100회씩, 각 IP별로 요청하도록 제한하고 싶다면, 제한을 생성할 때 `by` 메서드를 사용할 수 있습니다.

```
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
                ? Limit::none()
                : Limit::perMinute(100)->by($request->ip());
});
```

정의한 속도 제한기는 라우트나 라우트 그룹에서 `throttle` [미들웨어](/docs/8.x/middleware)를 통해 사용할 수 있습니다. 미들웨어의 인자로 제한기명을 전달하면 됩니다.

```
Route::middleware(['throttle:uploads'])->group(function () {
    Route::post('/audio', function () {
        //
    });

    Route::post('/video', function () {
        //
    });
});
```

속도 제한 기능에 대해 더 자세히 알고 싶다면 [라우팅 문서](/docs/8.x/routing#rate-limiting)를 참고해 주세요.

<a name="improved-maintenance-mode"></a>
### 향상된 유지보수 모드

_유지보수 모드 관련 개선은 [Taylor Otwell](https://github.com/taylorotwell)이 기여하였으며, [Spatie](https://spatie.be)에서 영감을 받았습니다._

기존 라라벨 릴리즈에서는 `php artisan down` 유지보수 모드에서 허용된 IP 주소를 "허용 목록(allow list)"으로 지정하여 애플리케이션에 접속할 수 있었습니다. 이제 이 기능은 더 간단한 "시크릿(토큰)" 방식으로 변경되었습니다.

유지보수 모드에서 `secret` 옵션을 사용해 우회 토큰을 지정할 수 있습니다.

```
php artisan down --secret="1630542a-246b-4b66-afa1-dd72a4c43515"
```

애플리케이션을 유지보수 모드로 변경한 후에는, 지정한 토큰이 포함된 애플리케이션 URL로 접속하면 라라벨이 브라우저에 유지보수 모드 우회 쿠키를 발급합니다.

```
https://example.com/1630542a-246b-4b66-afa1-dd72a4c43515
```

이 숨겨진 경로로 접속하면, 애플리케이션의 `/` 경로로 리다이렉션됩니다. 쿠키가 발급되면, 유지보수 모드가 해제된 것처럼 사이트를 정상적으로 탐색할 수 있습니다.

<a name="pre-rendering-the-maintenance-mode-view"></a>
#### 유지보수 모드 뷰 사전 렌더링

배포 중에 `php artisan down` 명령어를 사용한다면, Composer 의존성이나 기타 인프라 구성이 갱신되는 사이에 사용자가 애플리케이션 접속 시 오류를 경험할 수 있습니다. 이는 라라벨 프레임워크의 주요 부분이 부팅되어야만 애플리케이션이 유지보수 모드임을 판별하고, 템플릿 엔진으로 유지보수 뷰를 렌더링하기 때문입니다.

이 문제를 해결하기 위해, 라라벨은 요청 초기에 반환할 유지보수 뷰를 미리 렌더링(pre-render)할 수 있도록 지원합니다. 이 뷰는 애플리케이션의 어떤 의존성도 로드되기 전에 렌더링되어 반환됩니다. 원하는 템플릿을 `down` 명령의 `render` 옵션에 지정하여 사전 렌더할 수 있습니다.

```
php artisan down --render="errors::503"
```

<a name="closure-dispatch-chain-catch"></a>
### 클로저 디스패치/체인 `catch`

_`catch` 개선 기능은 [Mohamed Said](https://github.com/themsaid)가 기여하였습니다._

새로운 `catch` 메서드를 사용하면, 큐 처리 중인 클로저가 모든 재시도 횟수를 소모하고도 성공하지 못했을 때 실행할 클로저를 제공합니다.

```
use Throwable;

dispatch(function () use ($podcast) {
    $podcast->publish();
})->catch(function (Throwable $e) {
    // 해당 작업 실패 처리...
});
```

<a name="dynamic-blade-components"></a>
### 동적 Blade 컴포넌트

_동적 Blade 컴포넌트는 [Taylor Otwell](https://github.com/taylorotwell)이 기여하였습니다._

실행 시점에 어떤 컴포넌트를 렌더링할지 결정해야 할 때가 있습니다. 이런 경우, 내장 `dynamic-component` Blade 컴포넌트를 활용해 런타임 값 또는 변수에 따라 원하는 컴포넌트를 렌더링할 수 있습니다.

```
<x-dynamic-component :component="$componentName" class="mt-4" />
```

Blade 컴포넌트에 대해 더 자세히 알고 싶다면 [Blade 문서](/docs/8.x/blade#components)를 참고해 주세요.

<a name="event-listener-improvements"></a>
### 이벤트 리스너 개선

_이벤트 리스너 개선 기능은 [Taylor Otwell](https://github.com/taylorotwell)이 기여하였습니다._

이제 클로저 기반 이벤트 리스너를 등록할 때, `Event::listen` 메서드에 단순히 클로저만 전달하면 됩니다. 라라벨은 해당 클로저가 어떤 타입의 이벤트를 처리하는지 자동으로 감지합니다.

```
use App\Events\PodcastProcessed;
use Illuminate\Support\Facades\Event;

Event::listen(function (PodcastProcessed $event) {
    //
});
```

또한, 클로저 기반 이벤트 리스너를 `Illuminate\Events\queueable` 함수를 사용해 큐 처리가 가능하도록 등록할 수 있습니다.

```
use App\Events\PodcastProcessed;
use function Illuminate\Events\queueable;
use Illuminate\Support\Facades\Event;

Event::listen(queueable(function (PodcastProcessed $event) {
    //
}));
```

큐에 등록된 작업처럼, `onConnection`, `onQueue`, `delay` 메서드를 활용하여 큐 리스너의 실행 방식을 커스터마이즈할 수 있습니다.

```
Event::listen(queueable(function (PodcastProcessed $event) {
    //
})->onConnection('redis')->onQueue('podcasts')->delay(now()->addSeconds(10)));
```

익명 큐 리스너 실패를 처리하고 싶다면, `queueable` 리스너를 정의할 때 `catch` 메서드에 클로저를 전달하면 됩니다.

```
use App\Events\PodcastProcessed;
use function Illuminate\Events\queueable;
use Illuminate\Support\Facades\Event;
use Throwable;

Event::listen(queueable(function (PodcastProcessed $event) {
    //
})->catch(function (PodcastProcessed $event, Throwable $e) {
    // 큐 리스너가 실패함...
}));
```

<a name="time-testing-helpers"></a>
### 시간 테스트 헬퍼

_시간 테스트 헬퍼 기능은 [Taylor Otwell](https://github.com/taylorotwell)이 개발하였으며, Ruby on Rails에서 영감을 받았습니다._

테스트를 작성하다 보면, `now` 혹은 `Illuminate\Support\Carbon::now()`와 같은 헬퍼가 반환하는 시간을 조작해야 할 경우가 있습니다. 라라벨의 기본 Feature Test 클래스에는 현재 시간을 간편하게 변경할 수 있는 헬퍼가 추가되어 있습니다.

```
public function testTimeCanBeManipulated()
{
    // 미래로 이동...
    $this->travel(5)->milliseconds();
    $this->travel(5)->seconds();
    $this->travel(5)->minutes();
    $this->travel(5)->hours();
    $this->travel(5)->days();
    $this->travel(5)->weeks();
    $this->travel(5)->years();

    // 과거로 이동...
    $this->travel(-5)->hours();

    // 특정 시점으로 이동...
    $this->travelTo(now()->subHours(6));

    // 다시 현재 시점으로 복귀...
    $this->travelBack();
}
```

<a name="artisan-serve-improvements"></a>
### Artisan `serve` 개선 사항

_Artisan `serve` 개선 기능은 [Taylor Otwell](https://github.com/taylorotwell)이 기여하였습니다._

Artisan의 `serve` 명령어가, 로컬 `.env` 파일의 환경 변수 변경 사항을 자동으로 감지해서 서버를 자동 재시작하게 개선되었습니다. 기존에는 수동으로 서버를 중지하고 다시 시작해야 했습니다.

<a name="tailwind-pagination-views"></a>
### Tailwind 페이지네이션 뷰

라라벨의 페이지네이터가 [Tailwind CSS](https://tailwindcss.com) 프레임워크를 기본적으로 사용하도록 업데이트되었습니다. Tailwind CSS는 매우 커스터마이즈가 쉽고, 필요한 디자인 컴포넌트를 자유롭게 조합할 수 있는 저수준 CSS 프레임워크입니다. (Bootstrap 3 및 4 기반의 뷰도 계속해서 사용할 수 있습니다.)

<a name="routing-namespace-updates"></a>
### 라우팅 네임스페이스 관련 변경

기존 라라벨 릴리즈에서는 `RouteServiceProvider`에 `$namespace` 속성이 포함되어 있었으며, 이 값이 컨트롤러 라우트 정의나 `action` 헬퍼/`URL::action` 메서드 호출 시 자동으로 접두사로 추가되었습니다. 라라벨 8.x에서는 이 속성값이 기본적으로 `null`로 세팅되어, 라라벨이 자동으로 네임스페이스를 붙이지 않습니다. 따라서, 새로운 라라벨 8.x 애플리케이션에서는 아래와 같이 표준 PHP 콜러블(callable) 문법으로 컨트롤러 라우트를 정의해야 합니다.

```
use App\Http\Controllers\UserController;

Route::get('/users', [UserController::class, 'index']);
```

`action` 관련 메서드 호출도 동일한 콜러블 문법을 사용해야 합니다.

```
action([UserController::class, 'index']);

return Redirect::action([UserController::class, 'index']);
```

만약, 기존 라라벨 7.x 스타일의 컨트롤러 네임스페이스 접두사를 선호한다면, 애플리케이션의 `RouteServiceProvider`에 `$namespace` 속성을 추가하면 됩니다.

> [!NOTE]
> 이 변경은 새로운 라라벨 8.x 애플리케이션에만 영향을 줍니다. 라라벨 7.x에서 업그레이드하는 애플리케이션은 여전히 `RouteServiceProvider`에 `$namespace` 속성이 존재합니다.
