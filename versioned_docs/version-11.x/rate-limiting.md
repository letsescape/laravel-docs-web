# 속도 제한 (Rate Limiting)

- [소개](#introduction)
    - [캐시 설정](#cache-configuration)
- [기본 사용법](#basic-usage)
    - [시도 횟수 수동 증가](#manually-incrementing-attempts)
    - [시도 횟수 초기화](#clearing-attempts)

<a name="introduction"></a>
## 소개

라라벨에는 애플리케이션의 [캐시](cache)와 함께 사용할 수 있는 간단한 속도 제한 추상화 기능이 내장되어 있습니다. 이를 활용하면 일정 시간 동안 특정 동작을 손쉽게 제한할 수 있습니다.

> [!NOTE]  
> 들어오는 HTTP 요청을 제한하고 싶으시다면, [속도 제한 미들웨어 문서](/docs/11.x/routing#rate-limiting)를 참고하시기 바랍니다.

<a name="cache-configuration"></a>
### 캐시 설정

일반적으로 속도 제한기는 애플리케이션의 `cache` 설정 파일 내 `default` 키에 정의된 기본 애플리케이션 캐시를 사용합니다. 그러나, 속도 제한기가 사용할 캐시 드라이버를 직접 지정하고 싶다면, 애플리케이션의 `cache` 설정 파일에 `limiter` 키를 추가해 사용할 수 있습니다.

```
'default' => env('CACHE_STORE', 'database'),

'limiter' => 'redis',
```

<a name="basic-usage"></a>
## 기본 사용법

`Illuminate\Support\Facades\RateLimiter` 파사드를 사용해 속도 제한 기능과 상호작용할 수 있습니다. 속도 제한 기능이 제공하는 가장 간단한 메서드는 `attempt` 메서드이며, 주어진 콜백을 주어진 시간(초) 동안에 제한된 횟수만큼 실행하도록 제어합니다.

`attempt` 메서드는 더 이상 남은 시도 가능 횟수가 없을 때 `false`를 반환합니다. 그렇지 않다면 콜백의 실행 결과 또는 `true`를 반환합니다. `attempt` 메서드의 첫 번째 인수는 속도 제한에서 사용할 "키"로, 무엇을 제한할지 나타내는 임의의 문자열이면 됩니다.

```
use Illuminate\Support\Facades\RateLimiter;

$executed = RateLimiter::attempt(
    'send-message:'.$user->id,
    $perMinute = 5,
    function() {
        // Send message...
    }
);

if (! $executed) {
  return 'Too many messages sent!';
}
```

필요하다면, 네 번째 인수로 "감쇠 시간"(decay rate, 즉 시도 가능 횟수가 초기화되기까지 남은 초 단위 시간)을 지정할 수 있습니다. 예를 들어, 위 예시를 2분마다 5번 시도할 수 있게 변경하려면 다음과 같이 설정합니다.

```
$executed = RateLimiter::attempt(
    'send-message:'.$user->id,
    $perTwoMinutes = 5,
    function() {
        // Send message...
    },
    $decayRate = 120,
);
```

<a name="manually-incrementing-attempts"></a>
### 시도 횟수 수동 증가

속도 제한기를 수동으로 제어하고 싶은 경우, 다양한 다른 메서드를 사용할 수 있습니다. 예를 들어, `tooManyAttempts` 메서드를 호출해 특정 속도 제한 키가 분당 허용된 시도 횟수를 초과했는지 확인할 수 있습니다.

```
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::tooManyAttempts('send-message:'.$user->id, $perMinute = 5)) {
    return 'Too many attempts!';
}

RateLimiter::increment('send-message:'.$user->id);

// Send message...
```

또한, `remaining` 메서드를 통해 해당 키의 남은 시도 가능 횟수를 조회할 수 있습니다. 만약 남은 시도 횟수가 있다면, `increment` 메서드를 호출해 총 시도 횟수를 1 증가시킬 수 있습니다.

```
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::remaining('send-message:'.$user->id, $perMinute = 5)) {
    RateLimiter::increment('send-message:'.$user->id);

    // Send message...
}
```

특정 속도 제한 키의 값을 한 번에 1 이상으로 늘리고 싶다면, `increment` 메서드의 인수로 원하는 수치를 지정하면 됩니다.

```
RateLimiter::increment('send-message:'.$user->id, amount: 5);
```

<a name="determining-limiter-availability"></a>
#### 제한 해제까지 남은 시간 확인

만약 키에 대해 더 이상 시도할 수 있는 횟수가 남아 있지 않다면, `availableIn` 메서드는 남은 대기 시간을 초 단위로 반환합니다. 이를 통해 더 시도할 수 있을 때까지 얼마나 기다려야 하는지 알 수 있습니다.

```
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::tooManyAttempts('send-message:'.$user->id, $perMinute = 5)) {
    $seconds = RateLimiter::availableIn('send-message:'.$user->id);

    return 'You may try again in '.$seconds.' seconds.';
}

RateLimiter::increment('send-message:'.$user->id);

// Send message...
```

<a name="clearing-attempts"></a>
### 시도 횟수 초기화

`clear` 메서드를 사용해 특정 속도 제한 키의 시도 횟수를 초기화할 수 있습니다. 예를 들어, 특정 메시지가 수신자에 의해 읽힐 때 시도 횟수를 재설정하고 싶다면 다음과 같이 작성할 수 있습니다.

```
use App\Models\Message;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Mark the message as read.
 */
public function read(Message $message): Message
{
    $message->markAsRead();

    RateLimiter::clear('send-message:'.$message->user_id);

    return $message;
}
```
