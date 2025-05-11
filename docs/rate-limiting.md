# 요청 제한 (Rate Limiting)

- [소개](#introduction)
    - [캐시 설정](#cache-configuration)
- [기본 사용법](#basic-usage)
    - [시도 횟수 수동 증가](#manually-incrementing-attempts)
    - [시도 횟수 초기화](#clearing-attempts)

<a name="introduction"></a>
## 소개

라라벨은 애플리케이션의 [캐시](cache)와 함께 사용할 수 있는 간단한 요청 제한 추상화 기능을 제공합니다. 이를 통해 특정 동작을 지정한 시간 동안 손쉽게 제한할 수 있습니다.

> [!NOTE]
> 들어오는 HTTP 요청에 대한 요청 제한을 적용하려는 경우, [요청 제한 미들웨어 문서](/docs/routing#rate-limiting)를 참고하시기 바랍니다.

<a name="cache-configuration"></a>
### 캐시 설정

일반적으로 요청 제한기는 애플리케이션의 `cache` 설정 파일에 있는 `default` 키로 지정된 기본 캐시를 사용합니다. 그러나 요청 제한기에 사용할 캐시 드라이버를 별도로 지정하고 싶다면, 애플리케이션의 `cache` 설정 파일에 `limiter` 키를 추가하여 사용할 캐시 드라이버를 지정할 수 있습니다.

```php
'default' => env('CACHE_STORE', 'database'),

'limiter' => 'redis',
```

<a name="basic-usage"></a>
## 기본 사용법

`Illuminate\Support\Facades\RateLimiter` 파사드를 사용하면 요청 제한 기능과 상호작용할 수 있습니다. 요청 제한기가 제공하는 가장 단순한 메서드는 `attempt` 메서드로, 지정한 콜백을 몇 초 동안 지정한 횟수까지만 실행하도록 제한합니다.

`attempt` 메서드는 추가로 시도할 수 있는 횟수가 남아 있지 않은 경우 `false`를 반환합니다. 그렇지 않으면 콜백의 반환값 또는 `true`를 반환합니다. `attempt` 메서드의 첫 번째 인수는 요청 제한을 적용할 "키"로, 제한하고자 하는 동작을 나타내는 임의의 문자열을 지정할 수 있습니다.

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

필요하다면 `attempt` 메서드에 네 번째 인수(“감쇠 시간”, 즉 횟수 제한이 초기화되기까지의 초 단위 시간)를 전달할 수 있습니다. 예를 들어, 아래와 같이 2분마다 5번의 시도를 허용하도록 설정할 수 있습니다.

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

요청 제한기를 직접 더 세밀하게 제어하고 싶다면 여러 가지 메서드를 사용할 수 있습니다. 예를 들어, `tooManyAttempts` 메서드를 호출하면 특정 요청 제한 키가 허용된 시도 횟수를 분당 초과했는지 확인할 수 있습니다.

```php
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::tooManyAttempts('send-message:'.$user->id, $perMinute = 5)) {
    return 'Too many attempts!';
}

RateLimiter::increment('send-message:'.$user->id);

// Send message...
```

또한 `remaining` 메서드를 사용해 해당 키로 남아 있는 시도 횟수를 가져올 수 있습니다. 시도 횟수가 남아 있다면 `increment` 메서드로 총 시도 횟수를 직접 증가시킬 수 있습니다.

```php
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::remaining('send-message:'.$user->id, $perMinute = 5)) {
    RateLimiter::increment('send-message:'.$user->id);

    // Send message...
}
```

특정 요청 제한 키의 값을 한 번에 1보다 더 크게 증가시키고 싶다면, 원하는 증가 값을 `increment` 메서드에 전달할 수 있습니다.

```php
RateLimiter::increment('send-message:'.$user->id, amount: 5);
```

<a name="determining-limiter-availability"></a>
#### 제한 가능 여부 확인

어떤 키에 더 이상 시도 가능 횟수가 남아 있지 않을 때는, `availableIn` 메서드를 사용해 추가 시도를 할 수 있게 되기까지 남은 초(second) 단위 시간을 확인할 수 있습니다.

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

특정 요청 제한 키에 대한 시도 횟수를 `clear` 메서드로 초기화할 수 있습니다. 예를 들어, 사용자가 특정 메시지를 읽었을 때(수신자가 메시지를 확인했을 때) 시도 횟수를 초기화할 수 있습니다.

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