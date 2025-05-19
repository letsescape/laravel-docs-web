# 요청 제한 (Rate Limiting)

- [소개](#introduction)
    - [캐시 설정](#cache-configuration)
- [기본 사용법](#basic-usage)
    - [시도 횟수 수동 증가](#manually-incrementing-attempts)
    - [시도 횟수 초기화](#clearing-attempts)

<a name="introduction"></a>
## 소개

라라벨에서는 애플리케이션의 [캐시](cache)와 함께 사용할 수 있는 단순한 요청 제한(rate limiting) 추상화 기능을 제공합니다. 이를 통해 지정한 시간 동안 어떤 작업이 허용되는지 손쉽게 제한할 수 있습니다.

> [!NOTE]
> 만약 외부에서 들어오는 HTTP 요청에 대한 속도 제한이 궁금하다면, [속도 제한 미들웨어 문서](routing#rate-limiting)를 참고하시기 바랍니다.

<a name="cache-configuration"></a>
### 캐시 설정

일반적으로 요청 제한 기능은 애플리케이션의 `cache` 설정 파일 내 `default` 키에 정의된 기본 캐시 드라이버를 사용합니다. 하지만 요청 제한 기능이 사용할 캐시 드라이버를 직접 지정하고 싶다면, 애플리케이션의 `cache` 설정 파일에 `limiter` 키를 정의하면 됩니다.

```
'default' => 'memcached',

'limiter' => 'redis',
```

<a name="basic-usage"></a>
## 기본 사용법

`Illuminate\Support\Facades\RateLimiter` 파사드를 사용하여 요청 제한 기능과 상호작용할 수 있습니다. 요청 제한 기능에서 가장 간단하게 사용할 수 있는 메서드는 `attempt`입니다. 이 메서드는 주어진 콜백을 지정한 초(seconds) 동안 실행 횟수를 제한합니다.

`attempt` 메서드는 해당 콜백에 남아 있는 실행 가능 횟수가 없다면 `false`를, 남아 있다면 콜백의 반환값 혹은 `true`를 반환합니다. `attempt` 메서드의 첫 번째 인수는 제한을 적용할 "키"로, 제한할 동작을 식별할 수 있는 임의의 문자열을 지정할 수 있습니다.

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

필요하다면 `attempt` 메서드에 네 번째 인수를 추가할 수 있습니다. 이 네 번째 인수는 "만료 시간(decay rate)"으로, 사용할 수 있는 시도 횟수가 초기화될 때까지의 초(seconds)를 의미합니다. 예를 들어, 위 예시를 2분(120초)마다 5번 시도 가능한 형태로 수정할 수 있습니다.

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

요청 제한 기능을 직접 제어하고 싶을 때 사용할 수 있는 다양한 메서드가 있습니다. 예를 들어, `tooManyAttempts` 메서드를 사용하면 특정 제한 키가 분당 허용된 최대 시도 횟수를 초과했는지 확인할 수 있습니다.

```
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::tooManyAttempts('send-message:'.$user->id, $perMinute = 5)) {
    return 'Too many attempts!';
}

RateLimiter::increment('send-message:'.$user->id);

// Send message...
```

또는, `remaining` 메서드를 사용해 특정 키의 남은 시도 가능 횟수를 가져올 수 있습니다. 시도 가능 횟수가 있다면, `increment` 메서드를 직접 호출해서 시도 횟수를 증가시킬 수 있습니다.

```
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::remaining('send-message:'.$user->id, $perMinute = 5)) {
    RateLimiter::increment('send-message:'.$user->id);

    // Send message...
}
```

또한, 만약 한 번에 1 이상으로 시도 횟수를 증가시키고 싶다면, `increment` 메서드에 원하는 증가값을 지정할 수 있습니다.

```
RateLimiter::increment('send-message:'.$user->id, amount: 5);
```

<a name="determining-limiter-availability"></a>
#### 제한 재사용 가능 시간 확인

시도 횟수가 모두 소진된 경우에는 `availableIn` 메서드를 사용해 추가 시도가 가능해지기까지 남은 초(seconds)를 확인할 수 있습니다.

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

`clear` 메서드를 사용하면 특정 제한 키의 시도 횟수를 초기화할 수 있습니다. 예를 들어, 메시지를 수신자가 읽었을 때 시도 횟수를 리셋하고 싶다면 다음과 같이 할 수 있습니다.

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
