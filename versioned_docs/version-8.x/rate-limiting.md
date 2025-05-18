# 속도 제한 (Rate Limiting)

- [소개](#introduction)
    - [캐시 설정](#cache-configuration)
- [기본 사용법](#basic-usage)
    - [시도 횟수 수동 증가](#manually-incrementing-attempts)
    - [시도 횟수 초기화](#clearing-attempts)

<a name="introduction"></a>
## 소개

라라벨은 애플리케이션의 [캐시](cache) 기능과 연동하여, 정해진 시간 동안 특정 작업의 실행 횟수를 간편하게 제한할 수 있는 쉬운 속도 제한(rate limiting) 추상화를 제공합니다.

> [!TIP]
> 만약 외부에서 들어오는 HTTP 요청을 제한하고 싶으시다면, [속도 제한 미들웨어 문서](routing#rate-limiting)를 참고하시기 바랍니다.

<a name="cache-configuration"></a>
### 캐시 설정

일반적으로 속도 제한기는 애플리케이션의 `cache` 설정 파일에서 `default` 키에 지정된 기본 캐시 드라이버를 사용합니다. 하지만, 필요한 경우 `cache` 설정 파일에 `limiter` 키를 추가해서 속도 제한에 사용할 캐시 드라이버를 명시적으로 지정할 수도 있습니다.

```
'default' => 'memcached',

'limiter' => 'redis',
```

<a name="basic-usage"></a>
## 기본 사용법

속도 제한기와 상호작용하려면 `Illuminate\Support\Facades\RateLimiter` 파사드를 사용할 수 있습니다. 속도 제한기에서 제공하는 가장 단순한 메서드는 `attempt` 메서드로, 특정 콜백이 일정 초 동안 정해진 횟수만큼 실행되도록 제한합니다.

`attempt` 메서드는 남은 시도 횟수가 없으면 `false`를 반환하며, 남아 있다면 콜백의 실행 결과(또는 `true`)를 반환합니다. 이 메서드의 첫 번째 인자는 속도 제한을 적용할 "키"로, 제한할 동작을 고유하게 식별할 수 있는 아무 문자열이나 사용할 수 있습니다.

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

속도 제한기와 수동으로 상호작용하려면 다양한 메서드를 활용할 수 있습니다. 예를 들어, `tooManyAttempts` 메서드를 사용하면 특정 키에 대해 1분 내 허용된 최대 시도 횟수를 초과했는지 확인할 수 있습니다.

```
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::tooManyAttempts('send-message:'.$user->id, $perMinute = 5)) {
    return 'Too many attempts!';
}
```

또는, `remaining` 메서드로 해당 키에 남아 있는 시도 횟수를 확인할 수 있습니다. 아직 시도 가능 횟수가 남아 있다면, `hit` 메서드를 사용해 시도 횟수를 직접 1 증가시킬 수 있습니다.

```
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::remaining('send-message:'.$user->id, $perMinute = 5)) {
    RateLimiter::hit('send-message:'.$user->id);

    // Send message...
}
```

<a name="determining-limiter-availability"></a>
#### 제한 해제까지 남은 시간 확인하기

더 이상 시도할 수 없는 경우, `availableIn` 메서드는 추가로 시도할 수 있을 때까지 남은 초(second) 수를 반환합니다.

```
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::tooManyAttempts('send-message:'.$user->id, $perMinute = 5)) {
    $seconds = RateLimiter::availableIn('send-message:'.$user->id);

    return 'You may try again in '.$seconds.' seconds.';
}
```

<a name="clearing-attempts"></a>
### 시도 횟수 초기화

특정 속도 제한 키에 대한 시도 횟수를 `clear` 메서드로 초기화할 수 있습니다. 예를 들어, 메시지가 수신자에 의해 읽힐 때 시도 횟수를 리셋하도록 만들 수 있습니다.

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
