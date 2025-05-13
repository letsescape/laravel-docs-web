# 컨텍스트 (Context)

- [소개](#introduction)
    - [작동 원리](#how-it-works)
- [컨텍스트 캡처하기](#capturing-context)
    - [스택](#stacks)
- [컨텍스트 조회하기](#retrieving-context)
    - [아이템 존재 여부 판단하기](#determining-item-existence)
- [컨텍스트 제거하기](#removing-context)
- [숨김 컨텍스트](#hidden-context)
- [이벤트](#events)
    - [탈수(Dehydrating)](#dehydrating)
    - [재수화(Hydrated)](#hydrated)

<a name="introduction"></a>
## 소개

라라벨의 "컨텍스트" 기능을 활용하면 애플리케이션 내에서 실행되는 요청, 작업(Job), 명령어 전반에 걸쳐 정보를 캡처하고 가져오며, 이를 쉽게 공유할 수 있습니다. 이렇게 저장된 정보는 애플리케이션에서 기록하는 로그에도 메타데이터로 함께 추가되므로, 로그 엔트리가 작성되기 이전까지의 코드 실행 이력을 더 깊이 이해할 수 있습니다. 또한, 분산 시스템 전체의 실행 흐름을 추적하는 데에도 큰 도움이 됩니다.

<a name="how-it-works"></a>
### 작동 원리

라라벨의 컨텍스트 기능을 가장 쉽게 이해하는 방법은 내장된 로깅 기능과 연동하여 직접 사용하는 모습을 살펴보는 것입니다. 먼저, 내장 `Context` 파사드로 [컨텍스트에 정보를 추가](#capturing-context)할 수 있습니다. 예를 들어, [미들웨어](/docs/middleware)를 이용해 모든 들어오는 요청마다 요청 URL과 고유한 trace ID를 컨텍스트에 추가할 수 있습니다:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AddContext
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        Context::add('url', $request->url());
        Context::add('trace_id', Str::uuid()->toString());

        return $next($request);
    }
}
```

컨텍스트에 추가된 정보는 해당 요청 내에서 작성되는 모든 [로그 엔트리](/docs/logging)에 메타데이터로 자동으로 첨부됩니다. 이처럼 컨텍스트 정보를 메타데이터로 추가하면, 각 로그 엔트리로 넘긴 정보와 컨텍스트를 통해 공유된 정보를 서로 구분해서 관리할 수 있습니다. 예를 들어 아래처럼 로그를 작성한다고 가정해봅시다.

```php
Log::info('User authenticated.', ['auth_id' => Auth::id()]);
```

이때 기록되는 로그는 로그 엔트리에 전달된 `auth_id`뿐만 아니라, 컨텍스트의 `url`과 `trace_id`도 메타데이터로 함께 포함합니다:

```text
User authenticated. {"auth_id":27} {"url":"https://example.com/login","trace_id":"e04e1a11-e75c-4db3-b5b5-cfef4ef56697"}
```

컨텍스트에 추가된 정보는 큐로 디스패치되는 작업(Job)에도 사용됩니다. 예를 들어, 컨텍스트에 정보를 추가한 뒤 `ProcessPodcast` 작업을 큐에 디스패치하는 상황을 생각해봅시다:

```php
// 미들웨어에서...
Context::add('url', $request->url());
Context::add('trace_id', Str::uuid()->toString());

// 컨트롤러에서...
ProcessPodcast::dispatch($podcast);
```

작업이 디스패치되면, 당시 컨텍스트에 저장되어 있던 모든 정보가 함께 캡처되어 작업에 전달됩니다. 이후 해당 작업이 실행될 때, 저장된 정보가 현재 컨텍스트에 복원됩니다(재수화됨). 따라서 작업의 handle 메서드에서 로그를 남긴다면:

```php
class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    // ...

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Processing podcast.', [
            'podcast_id' => $this->podcast->id,
        ]);

        // ...
    }
}
```

결과적으로, 로그 엔트리에는 처음 작업이 디스패치될 때 컨텍스트에 추가된 정보가 포함됩니다:

```text
Processing podcast. {"podcast_id":95} {"url":"https://example.com/login","trace_id":"e04e1a11-e75c-4db3-b5b5-cfef4ef56697"}
```

이렇게 라라벨의 컨텍스트 기능이 내장된 로깅 기능과 어떻게 연동되는지 살펴보았으나, 이후 문서에서 HTTP 요청과 큐 작업 전체에 걸쳐 정보를 공유하는 방법, 그리고 [로그에 기록되지 않는 숨김 컨텍스트 데이터](#hidden-context)를 어떻게 추가하는지 등 다양한 활용법을 안내합니다.

<a name="capturing-context"></a>
## 컨텍스트 캡처하기

현재 컨텍스트에 정보를 저장하려면 `Context` 파사드의 `add` 메서드를 사용합니다:

```php
use Illuminate\Support\Facades\Context;

Context::add('key', 'value');
```

여러 항목을 한 번에 추가하고 싶다면, 연관 배열을 `add` 메서드에 전달할 수 있습니다:

```php
Context::add([
    'first_key' => 'value',
    'second_key' => 'value',
]);
```

`add` 메서드는 동일한 키가 이미 존재하는 경우 해당 값을 덮어씁니다. 만약 키가 아직 없을 때에만 정보를 컨텍스트에 추가하고 싶다면, `addIf` 메서드를 사용할 수 있습니다:

```php
Context::add('key', 'first');

Context::get('key');
// "first"

Context::addIf('key', 'second');

Context::get('key');
// "first"
```

컨텍스트에서는 지정한 키의 값을 간편하게 증가시키거나 감소시키는 메서드도 제공합니다. 이들 메서드는 추적하려는 키를 첫 번째 인수로 받고, 두 번째 인수로 증가/감소시킬 양을 지정할 수 있습니다:

```php
Context::increment('records_added');
Context::increment('records_added', 5);

Context::decrement('records_added');
Context::decrement('records_added', 5);
```

<a name="conditional-context"></a>
#### 조건부 컨텍스트

`when` 메서드를 사용하여 특정 조건에 따라 컨텍스트에 데이터를 추가할 수 있습니다. 전달한 조건이 `true`일 경우 첫 번째 클로저가, `false`일 경우 두 번째 클로저가 실행됩니다:

```php
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Context;

Context::when(
    Auth::user()->isAdmin(),
    fn ($context) => $context->add('permissions', Auth::user()->permissions),
    fn ($context) => $context->add('permissions', []),
);
```

<a name="scoped-context"></a>
#### 스코프 컨텍스트

`scope` 메서드는 주어진 콜백이 실행되는 동안 임시로 컨텍스트를 변경했다가, 콜백 실행이 끝나면 원래 상태로 복원할 수 있는 기능을 제공합니다. 또한 콜백 내에서 사용할 추가 데이터를 (두 번째, 세 번째 인자로) 컨텍스트에 병합해서 전달하고 싶을 때 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Facades\Log;

Context::add('trace_id', 'abc-999');
Context::addHidden('user_id', 123);

Context::scope(
    function () {
        Context::add('action', 'adding_friend');

        $userId = Context::getHidden('user_id');

        Log::debug("Adding user [{$userId}] to friends list.");
        // Adding user [987] to friends list.  {"trace_id":"abc-999","user_name":"taylor_otwell","action":"adding_friend"}
    },
    data: ['user_name' => 'taylor_otwell'],
    hidden: ['user_id' => 987],
);

Context::all();
// [
//     'trace_id' => 'abc-999',
// ]

Context::allHidden();
// [
//     'user_id' => 123,
// ]
```

> [!WARNING]
> 스코프 클로저 안에서 컨텍스트 내의 객체를 변경(mutate)하면, 그 변경이 스코프 밖에도 반영됩니다.

<a name="stacks"></a>
### 스택

컨텍스트에서는 "스택" 기능을 제공합니다. 스택은 추가한 순서대로 데이터가 쌓이는 리스트입니다. 스택에 정보를 추가하려면 `push` 메서드를 사용합니다:

```php
use Illuminate\Support\Facades\Context;

Context::push('breadcrumbs', 'first_value');

Context::push('breadcrumbs', 'second_value', 'third_value');

Context::get('breadcrumbs');
// [
//     'first_value',
//     'second_value',
//     'third_value',
// ]
```

스택은 요청과 관련된 히스토리 정보를 저장할 때 유용합니다. 예를 들어, 애플리케이션에서 쿼리가 실행될 때마다 이벤트 리스너에서 쿼리 SQL과 실행 시간을 스택에 기록할 수 있습니다:

```php
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Facades\DB;

DB::listen(function ($event) {
    Context::push('queries', [$event->time, $event->sql]);
});
```

`stackContains` 및 `hiddenStackContains` 메서드를 사용하면 스택에 특정 값이 있는지 확인할 수 있습니다:

```php
if (Context::stackContains('breadcrumbs', 'first_value')) {
    //
}

if (Context::hiddenStackContains('secrets', 'first_value')) {
    //
}
```

이 메서드들은 두 번째 인수로 클로저도 받을 수 있어, 값 비교 방식을 더 세밀하게 제어할 수 있습니다:

```php
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Str;

return Context::stackContains('breadcrumbs', function ($value) {
    return Str::startsWith($value, 'query_');
});
```

<a name="retrieving-context"></a>
## 컨텍스트 조회하기

컨텍스트에 저장된 정보를 가져올 때는 `Context` 파사드의 `get` 메서드를 사용합니다:

```php
use Illuminate\Support\Facades\Context;

$value = Context::get('key');
```

`only` 메서드는 컨텍스트에서 일부 키만 선택적으로 가져올 수 있습니다:

```php
$data = Context::only(['first_key', 'second_key']);
```

`pull` 메서드는 정보를 컨텍스트에서 가져오면서 즉시 해당 값을 삭제합니다:

```php
$value = Context::pull('key');
```

컨텍스트 데이터가 [스택](#stacks)으로 관리되고 있다면, `pop` 메서드로 스택에서 항목을 꺼낼 수도 있습니다:

```php
Context::push('breadcrumbs', 'first_value', 'second_value');

Context::pop('breadcrumbs');
// second_value

Context::get('breadcrumbs');
// ['first_value']
```

컨텍스트에 저장된 모든 정보를 가져오려면 `all` 메서드를 호출하면 됩니다:

```php
$data = Context::all();
```

<a name="determining-item-existence"></a>
### 아이템 존재 여부 판단하기

지정한 키에 값이 저장되어 있는지 확인하려면 `has`와 `missing` 메서드를 사용할 수 있습니다:

```php
use Illuminate\Support\Facades\Context;

if (Context::has('key')) {
    // ...
}

if (Context::missing('key')) {
    // ...
}
```

`has` 메서드는 값이 무엇이든(예를 들어 `null`이라도) 해당 키가 존재하면 항상 `true`를 반환합니다:

```php
Context::add('key', null);

Context::has('key');
// true
```

<a name="removing-context"></a>
## 컨텍스트 제거하기

현재 컨텍스트에서 특정 키와 그 값을 제거하려면 `forget` 메서드를 사용합니다:

```php
use Illuminate\Support\Facades\Context;

Context::add(['first_key' => 1, 'second_key' => 2]);

Context::forget('first_key');

Context::all();

// ['second_key' => 2]
```

여러 키를 한 번에 제거하려면 배열을 `forget` 메서드에 전달할 수 있습니다:

```php
Context::forget(['first_key', 'second_key']);
```

<a name="hidden-context"></a>
## 숨김 컨텍스트

컨텍스트에는 "숨김(hidden)" 데이터를 저장하는 기능이 있습니다. 이렇게 추가된 정보는 로그에 추가되지 않고, 위에서 설명한 일반 조회 메서드로도 접근할 수 없습니다. 숨김 컨텍스트와 상호작용하는 별도의 메서드들이 제공됩니다:

```php
use Illuminate\Support\Facades\Context;

Context::addHidden('key', 'value');

Context::getHidden('key');
// 'value'

Context::get('key');
// null
```

"숨김" 관련 메서드는 위에서 본 일반 컨텍스트 메서드들과 거의 동일한 동작을 합니다:

```php
Context::addHidden(/* ... */);
Context::addHiddenIf(/* ... */);
Context::pushHidden(/* ... */);
Context::getHidden(/* ... */);
Context::pullHidden(/* ... */);
Context::popHidden(/* ... */);
Context::onlyHidden(/* ... */);
Context::allHidden(/* ... */);
Context::hasHidden(/* ... */);
Context::forgetHidden(/* ... */);
```

<a name="events"></a>
## 이벤트

컨텍스트는 컨텍스트의 탈수(dehydration)와 재수화(hydration) 과정에서 활용할 수 있도록 두 가지 이벤트를 디스패치합니다.

이 이벤트들을 활용하는 방법을 설명하기 위해, 애플리케이션 미들웨어에서 들어오는 HTTP 요청의 `Accept-Language` 헤더 값을 참고하여 `app.locale` 설정 값을 지정한다고 가정해봅시다. 컨텍스트 이벤트를 사용하면, 이 값을 요청 도중에 저장했다가 큐 작업이 실행될 때 복원하여, 큐에서 발송되는 알림이 올바른 `app.locale` 값을 사용하도록 할 수 있습니다. 이후의 안내에서, 컨텍스트 이벤트와 [숨김 데이터](#hidden-context)를 연계해 원하는 효과를 얻는 방법을 설명합니다.

<a name="dehydrating"></a>
### 탈수(Dehydrating)

작업이 큐로 디스패치될 때, 컨텍스트의 데이터는 "탈수(dehydrated)" 단계에서 작업의 페이로드와 함께 저장됩니다. `Context::dehydrating` 메서드로 탈수 과정에서 호출될 클로저를 등록할 수 있습니다. 이 클로저 안에서 큐 작업에 전달할 데이터를 수정할 수 있습니다.

일반적으로, 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드 안에서 `dehydrating` 콜백을 등록합니다:

```php
use Illuminate\Log\Context\Repository;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Context;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Context::dehydrating(function (Repository $context) {
        $context->addHidden('locale', Config::get('app.locale'));
    });
}
```

> [!NOTE]
> `dehydrating` 콜백 안에서는 `Context` 파사드를 사용하면 안 됩니다. 현재 프로세스의 컨텍스트가 변경될 수 있기 때문입니다. 반드시 콜백으로 전달된 저장소(Repository) 객체만 수정해야 합니다.

<a name="hydrated"></a>
### 재수화(Hydrated)

큐 작업이 큐에서 실행되기 시작하면, 작업에 저장되어 있던 컨텍스트 정보가 "재수화(hydrated)" 과정을 거쳐 현재 컨텍스트로 복원됩니다. `Context::hydrated` 메서드를 사용해 재수화 과정에서 호출될 클로저를 등록할 수 있습니다.

이 콜백 역시 보통 애플리케이션의 `AppServiceProvider` 클래스 `boot` 메서드에서 등록합니다:

```php
use Illuminate\Log\Context\Repository;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Context;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Context::hydrated(function (Repository $context) {
        if ($context->hasHidden('locale')) {
            Config::set('app.locale', $context->getHidden('locale'));
        }
    });
}
```

> [!NOTE]
> `hydrated` 콜백 안에서도 `Context` 파사드를 직접 사용하지 말고, 반드시 전달된 저장소(Repository) 객체로만 작업해야 합니다.
