# 해싱 (Hashing)

- [소개](#introduction)
- [설정](#configuration)
- [기본 사용법](#basic-usage)
    - [비밀번호 해싱하기](#hashing-passwords)
    - [비밀번호와 해시가 일치하는지 확인하기](#verifying-that-a-password-matches-a-hash)
    - [비밀번호를 다시 해시해야 하는지 판단하기](#determining-if-a-password-needs-to-be-rehashed)
- [해시 알고리즘 검증](#hash-algorithm-verification)

<a name="introduction"></a>
## 소개

라라벨의 `Hash` [파사드](/docs/12.x/facades)는 사용자 비밀번호를 안전하게 저장하기 위해 Bcrypt와 Argon2 해싱을 제공합니다. [라라벨 애플리케이션 스타터 키트](/docs/12.x/starter-kits)를 사용하는 경우, 기본적으로 회원가입과 인증에 Bcrypt가 사용됩니다.

Bcrypt는 비밀번호 해싱에 적합한 선택입니다. 그 이유는 "작업 계수(work factor)"를 조절할 수 있기 때문입니다. 즉, 하드웨어 성능이 향상되더라도 해시 생성에 걸리는 시간을 늘릴 수 있습니다. 비밀번호를 해싱할 때는 처리 속도가 느릴수록 오히려 좋습니다. 알고리즘이 비밀번호를 해싱하는 데 더 오래 걸릴수록, 악의적인 사용자가 모든 가능한 문자열 해시 값을 미리 계산해 놓는 "레인보우 테이블"을 만들어 무차별 대입 공격을 시도하는 데 걸리는 시간도 길어지기 때문입니다.

<a name="configuration"></a>
## 설정

라라벨은 기본적으로 데이터를 해싱할 때 `bcrypt` 해싱 드라이버를 사용합니다. 그러나 [argon](https://en.wikipedia.org/wiki/Argon2), [argon2id](https://en.wikipedia.org/wiki/Argon2)와 같은 다른 해싱 드라이버도 지원합니다.

애플리케이션에서 사용할 해싱 드라이버는 `HASH_DRIVER` 환경 변수로 지정할 수 있습니다. 만약 라라벨의 모든 해싱 드라이버 옵션을 직접 설정하고 싶다면, `config:publish` Artisan 명령어를 사용하여 전체 `hashing` 설정 파일을 게시해야 합니다.

```shell
php artisan config:publish hashing
```

<a name="basic-usage"></a>
## 기본 사용법

<a name="hashing-passwords"></a>
### 비밀번호 해싱하기

`Hash` 파사드의 `make` 메서드를 호출하여 비밀번호를 해싱할 수 있습니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PasswordController extends Controller
{
    /**
     * Update the password for the user.
     */
    public function update(Request $request): RedirectResponse
    {
        // Validate the new password length...

        $request->user()->fill([
            'password' => Hash::make($request->newPassword)
        ])->save();

        return redirect('/profile');
    }
}
```

<a name="adjusting-the-bcrypt-work-factor"></a>
#### Bcrypt 작업 계수 조정하기

Bcrypt 알고리즘을 사용하는 경우, `make` 메서드의 `rounds` 옵션을 통해 작업 계수를 직접 조정할 수 있습니다. 하지만 라라벨에서 기본으로 제공하는 작업 계수도 대부분의 애플리케이션에 충분하게 안전합니다.

```php
$hashed = Hash::make('password', [
    'rounds' => 12,
]);
```

<a name="adjusting-the-argon2-work-factor"></a>
#### Argon2 작업 계수 조정하기

Argon2 알고리즘을 사용하는 경우에는, `make` 메서드에 `memory`, `time`, `threads` 옵션을 지정하여 작업 계수를 조정할 수 있습니다. 역시, 라라벨에서 기본으로 사용하는 값도 대부분의 경우에 적합합니다.

```php
$hashed = Hash::make('password', [
    'memory' => 1024,
    'time' => 2,
    'threads' => 2,
]);
```

> [!NOTE]
> 이러한 옵션에 대한 자세한 내용은 [PHP 공식 문서의 Argon 해싱 관련 내용](https://secure.php.net/manual/en/function.password-hash.php)을 참고하시기 바랍니다.

<a name="verifying-that-a-password-matches-a-hash"></a>
### 비밀번호와 해시가 일치하는지 확인하기

`Hash` 파사드에서 제공하는 `check` 메서드를 사용하여, 입력된 평문 문자열이 특정 해시와 일치하는지 확인할 수 있습니다.

```php
if (Hash::check('plain-text', $hashedPassword)) {
    // The passwords match...
}
```

<a name="determining-if-a-password-needs-to-be-rehashed"></a>
### 비밀번호를 다시 해시해야 하는지 판단하기

`Hash` 파사드의 `needsRehash` 메서드를 사용하면, 해당 비밀번호가 해싱된 이후 해셔의 작업 계수나 설정이 변경되었는지를 확인할 수 있습니다. 일부 애플리케이션에서는 인증 처리 과정에서 이 체크를 수행하기도 합니다.

```php
if (Hash::needsRehash($hashed)) {
    $hashed = Hash::make('plain-text');
}
```

<a name="hash-algorithm-verification"></a>
## 해시 알고리즘 검증

해시 알고리즘이 조작되는 것을 방지하기 위해, 라라벨의 `Hash::check` 메서드는 먼저 해당 해시가 현재 애플리케이션에 설정된 해싱 알고리즘으로 생성되었는지 확인합니다. 만약 서로 다른 알고리즘이 사용된 경우, `RuntimeException` 예외가 발생합니다.

이 방식은 대부분의 애플리케이션에서 기대하는 동작이며, 해싱 알고리즘이 바뀔 일이 없고 서로 다른 알고리즘이 사용되는 것은 악의적인 공격의 신호일 수 있습니다. 하지만, 예를 들어 특정 알고리즘에서 다른 알고리즘으로 데이터를 이전하는 과정 등 여러 해싱 알고리즘을 동시에 지원해야 하는 경우가 있다면, `HASH_VERIFY` 환경 변수를 `false`로 설정하여 해시 알고리즘 검증 기능을 비활성화할 수 있습니다.

```ini
HASH_VERIFY=false
```