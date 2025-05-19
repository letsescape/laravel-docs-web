# 컨텍스트 (Context)

- [소개](#introduction)
    - [작동 방식](#how-it-works)
- [컨텍스트 캡처하기](#capturing-context)
    - [스택](#stacks)
- [컨텍스트 조회하기](#retrieving-context)
    - [항목 존재 여부 확인](#determining-item-existence)
- [컨텍스트 제거하기](#removing-context)
- [숨겨진 컨텍스트](#hidden-context)
- [이벤트](#events)
    - [디하이드레이팅(Dehydrating)](#dehydrating)
    - [하이드레이티드(Hydrated)](#hydrated)

<a name="introduction"></a>
## 소개

라라벨의 "컨텍스트" 기능을 사용하면 애플리케이션 내부에서 실행되는 요청, 작업(job), 명령어 전반에 걸쳐 정보를 캡처(저장), 조회, 공유할 수 있습니다. 이렇게 저장된 정보는 애플리케이션에서 기록하는 로그에도 메타데이터로 포함되어, 로그가 작성되기 전 실행된 코드의 히스토리를 더 깊이 이해하고, 분산 시스템 전체의 실행 흐름을 추적할 수 있도록 도와줍니다.

<a name="how-it-works"></a>
### 작동 방식

라라벨의 컨텍스트 기능을 가장 잘 이해하는 방법은 내장된 로깅 기능과 함께 직접 사용해 보는 것입니다. 먼저, `Context` 파사드(facade)를 사용해 [컨텍스트에 정보를 추가](#capturing-context)할 수 있습니다. 예를 들어, 모든 요청마다 요청 URL과 고유한 트레이스 ID(trace ID)를 컨텍스트에 저장하는 [미들웨어](/docs/12.x/middleware)를 구현해 보겠습니다.

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

컨텍스트에 추가된 정보는 요청 처리 도중 작성되는 [로그 기록](/docs/12.x/logging)에 자동으로 메타데이터로 첨부됩니다. 컨텍스트의 정보는 개별 로그 항목에 전달된 데이터와 구분되어 저장되므로, 각 로깅에서 전달한 정보와 별도로, `Context`를 통해 공유된 정보도 함께 확인할 수 있습니다. 예를 들어, 다음과 같이 로그를 기록했다면:

```php
Log::info('User authenticated.', ['auth_id' => Auth::id()]);
```

이때 작성되는 로그에는 로그 항목별로 전달한 `auth_id`와 함께, 컨텍스트의 `url`, `trace_id`가 메타데이터로 포함됩니다.

```text
User authenticated. {"auth_id":27} {"url":"https://example.com/login","trace_id":"e04e1a11-e75c-4db3-b5b5-cfef4ef56697"}
```

컨텍스트에 추가한 정보는 큐로 디스패치(dispatch)되는 작업(job)에도 자동으로 전달됩니다. 예를 들어, 일부 정보를 컨텍스트에 추가한 뒤 `ProcessPodcast` 작업을 큐에 올리면:

```php
// 미들웨어에서...
Context::add('url', $request->url());
Context::add('trace_id', Str::uuid()->toString());

// 컨트롤러에서...
ProcessPodcast::dispatch($podcast);
```

작업이 큐에 디스패치될 때, 컨텍스트에 저장되어 있던 모든 정보가 함께 캡처되어 작업에 전달됩니다. 작업이 실행되는 동안 이 정보는 다시 현재 컨텍스트에 하이드레이션(hydration) 됩니다. 예를 들어 작업 클래스의 handle 메서드에서 로그를 남기면:

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

이때 작성되는 로그에는 작업이 디스패치될 당시 컨텍스트에 추가되어 있던 정보가 함께 포함됩니다.

```text
Processing podcast. {"podcast_id":95} {"url":"https://example.com/login","trace_id":"e04e1a11-e75c-4db3-b5b5-cfef4ef56697"}
```

여기서는 주로 라라벨 기본 제공 로깅 기능과 관련된 컨텍스트의 특성에 집중했지만, 이 문서에서는 HTTP 요청과 큐 작업 간에 정보를 어떻게 안전하게 공유할 수 있는지, 그리고 [로그에 첨부되지 않는 숨겨진 컨텍스트 데이터](#hidden-context)까지 활용하는 방법도 함께 설명합니다.

<a name="capturing-context"></a>
## 컨텍스트 캡처하기

현재 컨텍스트에 정보를 저장하려면 `Context` 파사드의 `add` 메서드를 사용하면 됩니다.

```php
use Illuminate\Support\Facades\Context;

Context::add('key', 'value');
```

여러 항목을 한 번에 추가하고 싶다면, 연관 배열(associative array)을 `add` 메서드에 넘길 수 있습니다.

```php
Context::add([
    'first_key' => 'value',
    'second_key' => 'value',
]);
```

만약 동일한 키가 이미 존재한다면 `add` 메서드는 해당 값을 덮어씁니다. 만약 해당 키가 존재하지 않을 때만 값을 추가하고 싶다면, `addIf` 메서드를 사용하면 됩니다.

```php
Context::add('key', 'first');

Context::get('key');
// "first"

Context::addIf('key', 'second');

Context::get('key');
// "first"
```

컨텍스트에는 특정 키의 값을 쉽고 빠르게 증가(increment) 또는 감소(decrement)시키는 메서드도 제공됩니다. 이때 첫 번째 인수로는 값을 추적할 키를, 두 번째 인수로는 값을 얼마만큼 변경할지 지정할 수 있습니다(두 번째 인수는 옵션).

```php
Context::increment('records_added');
Context::increment('records_added', 5);

Context::decrement('records_added');
Context::decrement('records_added', 5);
```

<a name="conditional-context"></a>
#### 조건부 컨텍스트

`when` 메서드를 이용하면 특정 조건에 따라 컨텍스트에 데이터를 추가할 수 있습니다. 첫 번째로 넘기는 클로저는 주어진 조건이 `true`일 때 실행되고, 두 번째 클로저는 조건이 `false`일 때 실행됩니다.

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

`scope` 메서드는 주어진 콜백이 실행되는 동안에만 일시적으로 컨텍스트 값을 변경하고, 콜백이 끝나면 원래 상태로 복원합니다. 또한, 클로저가 실행되는 동안 추가적으로 컨텍스트 데이터를 합쳐 사용할 수도 있습니다(두 번째, 세 번째 인수).

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
> 스코프 클로저 내부에서 컨텍스트에 들어 있는 객체를 수정하면, 이 변경사항은 스코프 바깥(원래 컨텍스트)에서도 그대로 반영됩니다.

<a name="stacks"></a>
### 스택

컨텍스트에서는 "스택"이라는 데이터를 사용할 수 있는데, 이는 데이터를 추가한 순서대로 차곡차곡 쌓는 리스트 구조입니다. 스택에 값을 추가하려면 `push` 메서드를 사용합니다.

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

스택은 한 요청에 대해 발생한 각종 이벤트나 작업의 히스토리를 저장하는 데 유용합니다. 예를 들어, 쿼리가 실행될 때마다 해당 쿼리의 SQL문과 실행 시간을 스택에 저장하는 리스너(event listener)를 구현할 수도 있습니다.

```php
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Facades\DB;

DB::listen(function ($event) {
    Context::push('queries', [$event->time, $event->sql]);
});
```

스택에 특정 값이 포함되어 있는지 확인하려면 `stackContains` 또는 `hiddenStackContains` 메서드를 사용할 수 있습니다.

```php
if (Context::stackContains('breadcrumbs', 'first_value')) {
    //
}

if (Context::hiddenStackContains('secrets', 'first_value')) {
    //
}
```

`stackContains`나 `hiddenStackContains`에는 두 번째 인수로 클로저를 전달할 수도 있어서, 값 비교 방식에 더 많은 유연성을 가질 수 있습니다.

```php
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Str;

return Context::stackContains('breadcrumbs', function ($value) {
    return Str::startsWith($value, 'query_');
});
```

<a name="retrieving-context"></a>
## 컨텍스트 조회하기

컨텍스트에 저장된 정보를 조회하려면 `Context` 파사드의 `get` 메서드를 사용합니다.

```php
use Illuminate\Support\Facades\Context;

$value = Context::get('key');
```

컨텍스트에서 일부 정보만 추출하고 싶다면, `only` 및 `except` 메서드를 사용할 수 있습니다.

```php
$data = Context::only(['first_key', 'second_key']);

$data = Context::except(['first_key']);
```

`pull` 메서드를 사용하면 컨텍스트의 값을 불러오면서 동시에 해당 값을 컨텍스트에서 제거할 수 있습니다.

```php
$value = Context::pull('key');
```

컨텍스트 데이터가 [스택](#stacks)에 저장되어 있다면 `pop` 메서드를 사용해 스택에서 값을 꺼낼 수 있습니다.

```php
Context::push('breadcrumbs', 'first_value', 'second_value');

Context::pop('breadcrumbs');
// second_value

Context::get('breadcrumbs');
// ['first_value']
```

컨텍스트에 저장된 모든 정보를 한 번에 조회하고 싶다면 `all` 메서드를 호출하면 됩니다.

```php
$data = Context::all();
```

<a name="determining-item-existence"></a>
### 항목 존재 여부 확인

지정한 키에 해당하는 값이 컨텍스트에 저장되어 있는지 확인하려면 `has`와 `missing` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\Context;

if (Context::has('key')) {
    // ...
}

if (Context::missing('key')) {
    // ...
}
```

`has` 메서드는 실제 저장된 값에 상관없이 해당 키가 존재한다면 항상 `true`를 반환합니다. 예를 들어, 값이 `null`이어도 키가 있으면 `true`가 반환됩니다.

```php
Context::add('key', null);

Context::has('key');
// true
```

<a name="removing-context"></a>
## 컨텍스트 제거하기

현재 컨텍스트에서 특정 키와 값을 제거하려면 `forget` 메서드를 사용합니다.

```php
use Illuminate\Support\Facades\Context;

Context::add(['first_key' => 1, 'second_key' => 2]);

Context::forget('first_key');

Context::all();

// ['second_key' => 2]
```

여러 개의 키를 한 번에 제거하고 싶다면 배열로 전달하면 됩니다.

```php
Context::forget(['first_key', 'second_key']);
```

<a name="hidden-context"></a>
## 숨겨진 컨텍스트

컨텍스트는 "숨겨진" 데이터도 저장할 수 있습니다. 숨겨진 컨텍스트는 로그에 첨부되지 않으며, 앞서 설명한 조회 메서드로도 접근할 수 없습니다. 숨겨진 데이터에 접근하기 위한 별도의 메서드들이 제공됩니다.

```php
use Illuminate\Support\Facades\Context;

Context::addHidden('key', 'value');

Context::getHidden('key');
// 'value'

Context::get('key');
// null
```

숨겨진 컨텍스트 관련 메서드는 기본 컨텍스트 메서드와 거의 동일한 형태로 제공합니다.

```php
Context::addHidden(/* ... */);
Context::addHiddenIf(/* ... */);
Context::pushHidden(/* ... */);
Context::getHidden(/* ... */);
Context::pullHidden(/* ... */);
Context::popHidden(/* ... */);
Context::onlyHidden(/* ... */);
Context::exceptHidden(/* ... */);
Context::allHidden(/* ... */);
Context::hasHidden(/* ... */);
Context::forgetHidden(/* ... */);
```

<a name="events"></a>
## 이벤트

컨텍스트는 하이드레이션(hydration), 디하이드레이션(dehydration) 처리 과정에 훅(hook)을 걸 수 있도록 두 개의 이벤트를 발생시킵니다.

예를 들어, 미들웨어에서 들어오는 HTTP 요청의 `Accept-Language` 헤더를 읽어 `app.locale` 설정값을 지정한다고 가정해봅시다. 컨텍스트의 이벤트를 활용하면 요청 시점의 로케일 값을 캡처해서 큐에서 작업이 실행될 때 원래의 `app.locale` 값을 복원할 수 있습니다. 이 문서에서는 컨텍스트 이벤트와 [숨겨진](#hidden-context) 데이터를 함께 사용해 이 과정을 구현하는 방법을 소개합니다.

<a name="dehydrating"></a>
### 디하이드레이팅(Dehydrating)

작업이 큐로 디스패치될 때, 컨텍스트의 데이터가 "디하이드레이션"되어(직렬화되어) 작업 페이로드와 함께 저장됩니다. `Context::dehydrating` 메서드를 사용하면 디하이드레이션 과정에서 호출될 클로저를 등록할 수 있습니다. 이 클로저 내부에서 큐 작업에 함께 전달할 데이터를 변경할 수 있습니다.

일반적으로, `dehydrating` 콜백은 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 등록합니다.

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
> `dehydrating` 콜백 내부에서는 `Context` 파사드를 사용하지 마세요. 현재 프로세스의 컨텍스트가 바뀔 수 있으므로, 콜백으로 전달되는 `$context` 저장소만 변경해야 합니다.

<a name="hydrated"></a>
### 하이드레이티드(Hydrated)

큐 작업이 실제로 실행(큐에서 꺼내 실행)되면, 작업에 함께 전달된 컨텍스트가 현재 컨텍스트에 "하이드레이션"되어 복원됩니다. `Context::hydrated` 메서드를 이용하면 하이드레이션 과정에서 실행될 클로저를 등록할 수 있습니다.

일반적으로, `hydrated` 콜백도 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 등록합니다.

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
> `hydrated` 콜백에서도 `Context` 파사드는 사용하지 말고, 반드시 전달받은 저장소 인스턴스만 수정해야 합니다.