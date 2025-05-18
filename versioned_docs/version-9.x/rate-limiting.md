# 속도 제한 (Rate Limiting)

- [소개](#introduction)
    - [캐시 설정](#cache-configuration)
- [기본 사용 방법](#basic-usage)
    - [시도 횟수 수동 증가](#manually-incrementing-attempts)
    - [시도 횟수 초기화](#clearing-attempts)

<a name="introduction"></a>
## 소개

라라벨은 애플리케이션의 [캐시](cache)와 함께 사용할 수 있는 간단한 속도 제한(rate limiting) 추상화를 제공합니다. 이를 통해, 지정된 시간 동안 특정 동작을 제한하는 기능을 쉽게 구현할 수 있습니다.

> [!NOTE]
> 들어오는 HTTP 요청에 대한 속도 제한이 궁금하다면, [속도 제한 미들웨어 문서](routing#rate-limiting)를 참고해 주세요.

<a name="cache-configuration"></a>
### 캐시 설정

일반적으로, 속도 제한기는 애플리케이션의 `cache` 설정 파일에서 `default` 키에 정의된 기본 캐시 드라이버를 사용합니다. 하지만, 애플리케이션의 `cache` 설정 파일에서 `limiter` 키를 추가로 정의함으로써 속도 제한에 사용할 캐시 드라이버를 직접 지정할 수도 있습니다.

```
'default' => 'memcached',

'limiter' => 'redis',
```

<a name="basic-usage"></a>
## 기본 사용 방법

`Illuminate\Support\Facades\RateLimiter` 파사드를 사용하여 속도 제한 기능을 다룰 수 있습니다. 가장 단순한 방식은 `attempt` 메서드를 사용하는 것입니다. 이 메서드는 지정된 초 동안 특정 콜백의 실행 횟수에 제한을 둡니다.

`attempt` 메서드는 남아있는 시도 가능 횟수가 없다면 `false`를 반환하며, 그렇지 않은 경우에는 콜백 함수의 반환값 또는 `true`를 반환합니다. 이 메서드의 첫 번째 인수는 속도 제한에 적용할 "키"인데, 이는 제한하고자 하는 동작을 대표하는 임의의 문자열을 사용할 수 있습니다.

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

<a name="manually-incrementing-attempts"></a>
### 시도 횟수 수동 증가

속도 제한기를 직접 조작하고 싶다면, 여러 가지 추가 메서드를 사용할 수 있습니다. 예를 들어, `tooManyAttempts` 메서드를 호출하면 특정 키가 분당 허용된 최대 시도 횟수를 초과했는지 확인할 수 있습니다.

```
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::tooManyAttempts('send-message:'.$user->id, $perMinute = 5)) {
    return 'Too many attempts!';
}
```

또한, `remaining` 메서드를 사용하면 해당 키에 대해 남아 있는 시도 횟수를 확인할 수 있습니다. 남은 시도 횟수가 있다면, `hit` 메서드를 호출하여 횟수를 직접 증가시킬 수 있습니다.

```
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::remaining('send-message:'.$user->id, $perMinute = 5)) {
    RateLimiter::hit('send-message:'.$user->id);

    // Send message...
}
```

<a name="determining-limiter-availability"></a>
#### 시도 가능 시간 확인

만약 어떤 키로 더 이상 시도를 할 수 없는 상태라면, `availableIn` 메서드는 다시 시도할 수 있을 때까지 남은 초를 반환합니다.

```
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::tooManyAttempts('send-message:'.$user->id, $perMinute = 5)) {
    $seconds = RateLimiter::availableIn('send-message:'.$user->id);

    return 'You may try again in '.$seconds.' seconds.';
}
```

<a name="clearing-attempts"></a>
### 시도 횟수 초기화

특정 속도 제한 키의 시도 횟수를 `clear` 메서드를 통해 초기화할 수 있습니다. 예를 들어, 메시지가 수신자에 의해 읽혔을 때 시도 횟수를 리셋하고 싶을 때 사용할 수 있습니다.

```
use App\Models\Message;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Mark the message as read.
 *
 * @param  \App\Models\Message  $message
 * @return \App\Models\Message
 */
public function read(Message $message)
{
    $message->markAsRead();

    RateLimiter::clear('send-message:'.$message->user_id);

    return $message;
}
```
