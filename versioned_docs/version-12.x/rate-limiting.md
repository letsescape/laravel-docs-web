# 속도 제한 (Rate Limiting)

- [소개](#introduction)
    - [캐시 설정](#cache-configuration)
- [기본 사용법](#basic-usage)
    - [시도 횟수 수동 증가](#manually-incrementing-attempts)
    - [시도 횟수 초기화](#clearing-attempts)

<a name="introduction"></a>
## 소개

라라벨은 간단하게 사용할 수 있는 속도 제한(rate limiting) 추상화를 제공하며, 애플리케이션의 [캐시](cache)와 함께 지정된 시간 동안 특정 작업의 실행을 쉽게 제한할 수 있습니다.

> [!NOTE]
> 외부에서 들어오는 HTTP 요청에 대한 속도 제한이 궁금하다면, [속도 제한 미들웨어 문서](/docs/12.x/routing#rate-limiting)를 참고하시기 바랍니다.

<a name="cache-configuration"></a>
### 캐시 설정

일반적으로, 속도 제한 기능은 애플리케이션의 `cache` 설정 파일에 정의된 `default` 키를 통해 기본 캐시 드라이버를 사용합니다. 하지만, 애플리케이션의 `cache` 설정 파일에 `limiter` 키를 추가하여 속도 제한에 사용할 캐시 드라이버를 별도로 지정할 수도 있습니다.

```php
'default' => env('CACHE_STORE', 'database'),

'limiter' => 'redis',
```

<a name="basic-usage"></a>
## 기본 사용법

`Illuminate\Support\Facades\RateLimiter` 파사드를 사용하면 속도 제한 기능과 상호작용할 수 있습니다. 속도 제한에서 제공하는 가장 간단한 메서드는 `attempt` 메서드로, 지정한 초 동안 콜백의 실행 횟수를 제한할 수 있습니다.

`attempt` 메서드는 더 이상 실행 가능한 시도가 남아 있지 않으면 `false`를 반환하고, 그렇지 않은 경우 콜백의 결과값이나 `true`를 반환합니다. `attempt` 메서드의 첫 번째 인수는 속도 제한할 작업을 대표하는 임의의 문자열 "키"입니다.

```php
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

필요하다면, 네 번째 인수로 "감쇠 시간(decay rate)"(즉, 제한 횟수가 초기화될 때까지의 초 단위 시간)을 지정할 수 있습니다. 예를 들어, 위 예시를 수정하여 2분마다 5번의 시도가 가능하도록 할 수 있습니다.

```php
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

속도 제한 기능을 더 세밀하게 제어하고 싶다면, 다양한 메서드를 수동으로 사용할 수 있습니다. 예를 들어, `tooManyAttempts` 메서드를 호출하여 특정 rate limiter 키가 분당 허용 최대 시도 횟수를 초과했는지 확인할 수 있습니다.

```php
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::tooManyAttempts('send-message:'.$user->id, $perMinute = 5)) {
    return 'Too many attempts!';
}

RateLimiter::increment('send-message:'.$user->id);

// Send message...
```

또는, `remaining` 메서드를 사용해서 해당 키에 대해 남아 있는 시도 가능 횟수를 확인할 수 있습니다. 만약 시도 가능 횟수가 남아 있다면, `increment` 메서드를 호출하여 실제 시도 횟수를 증가시킬 수 있습니다.

```php
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::remaining('send-message:'.$user->id, $perMinute = 5)) {
    RateLimiter::increment('send-message:'.$user->id);

    // Send message...
}
```

특정 rate limiter 키의 값을 한 번에 여러 번 증가시키고 싶다면, `increment` 메서드에 원하는 증가값을 인수로 전달하면 됩니다.

```php
RateLimiter::increment('send-message:'.$user->id, amount: 5);
```

<a name="determining-limiter-availability"></a>
#### 제한 해제까지 남은 시간 확인

더 이상 시도할 수 없는 경우, `availableIn` 메서드를 사용하면 추가 시도가 가능해질 때까지 남은 시간을 초 단위로 확인할 수 있습니다.

```php
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

특정 rate limiter 키에 대해 시도 횟수를 초기화하려면 `clear` 메서드를 사용할 수 있습니다. 예를 들어, 수신자가 메시지를 읽었을 때 시도 횟수를 리셋할 수 있습니다.

```php
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
