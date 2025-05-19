# 해싱 (Hashing)

- [소개](#introduction)
- [설정](#configuration)
- [기본 사용법](#basic-usage)
    - [비밀번호 해싱](#hashing-passwords)
    - [비밀번호가 해시와 일치하는지 검증하기](#verifying-that-a-password-matches-a-hash)
    - [비밀번호를 다시 해싱해야 하는지 확인하기](#determining-if-a-password-needs-to-be-rehashed)
- [해시 알고리즘 검증](#hash-algorithm-verification)

<a name="introduction"></a>
## 소개

라라벨의 `Hash` [파사드](/docs/facades)는 사용자 비밀번호를 저장할 때 안전하게 Bcrypt와 Argon2 해싱을 제공합니다. [라라벨 애플리케이션 스타터 키트](/docs/starter-kits) 중 하나를 사용하면, 회원가입과 인증 시 기본적으로 Bcrypt가 사용됩니다.

Bcrypt는 "작업 인자(work factor)"를 조정할 수 있기 때문에 비밀번호 해싱에 적합합니다. 즉, 하드웨어 성능이 향상되더라도 해시를 생성하는 데 걸리는 시간을 늘릴 수 있습니다. 비밀번호를 해싱할 때는 느린 것이 좋습니다. 해시 알고리즘이 비밀번호를 해싱하는 데 시간이 오래 걸릴수록, 악의적인 사용자가 모든 가능한 문자열 해시 값을 모은 "레인보우 테이블"을 만들어 무차별 대입 공격을 시도하는 데 더 많은 시간이 필요합니다.

<a name="configuration"></a>
## 설정

기본적으로 라라벨은 데이터를 해싱할 때 `bcrypt` 해싱 드라이버를 사용합니다. 하지만, [argon](https://en.wikipedia.org/wiki/Argon2)이나 [argon2id](https://en.wikipedia.org/wiki/Argon2) 등 여러 가지 해싱 드라이버도 지원합니다.

애플리케이션에서 사용할 해싱 드라이버는 `HASH_DRIVER` 환경 변수로 지정할 수 있습니다. 다만, 라라벨의 해싱 드라이버 옵션 전체를 직접 수정하려면, `config:publish` Artisan 명령어를 사용해 `hashing` 설정 파일을 전체 발행(publish)해야 합니다.

```shell
php artisan config:publish hashing
```

<a name="basic-usage"></a>
## 기본 사용법

<a name="hashing-passwords"></a>
### 비밀번호 해싱

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
     * 사용자의 비밀번호를 업데이트합니다.
     */
    public function update(Request $request): RedirectResponse
    {
        // 새로운 비밀번호의 길이를 검증합니다.

        $request->user()->fill([
            'password' => Hash::make($request->newPassword)
        ])->save();

        return redirect('/profile');
    }
}
```

<a name="adjusting-the-bcrypt-work-factor"></a>
#### Bcrypt 작업 인자 조정하기

Bcrypt 알고리즘을 사용할 경우, `make` 메서드에서 `rounds` 옵션을 이용해 알고리즘의 작업 인자(work factor)를 조정할 수 있습니다. 하지만, 라라벨의 기본 값도 대부분의 애플리케이션에는 충분합니다.

```php
$hashed = Hash::make('password', [
    'rounds' => 12,
]);
```

<a name="adjusting-the-argon2-work-factor"></a>
#### Argon2 작업 인자 조정하기

Argon2 알고리즘을 사용할 경우, `make` 메서드에서 `memory`, `time`, `threads` 옵션으로 작업 인자를 조정할 수 있습니다. 역시, 라라벨이 관리하는 기본 값도 대부분의 애플리케이션에 적합합니다.

```php
$hashed = Hash::make('password', [
    'memory' => 1024,
    'time' => 2,
    'threads' => 2,
]);
```

> [!NOTE]
> 이 옵션들에 대한 더 자세한 내용은 [공식 PHP Argon 해싱 관련 문서](https://secure.php.net/manual/en/function.password-hash.php)를 참고하시기 바랍니다.

<a name="verifying-that-a-password-matches-a-hash"></a>
### 비밀번호가 해시와 일치하는지 검증하기

`Hash` 파사드의 `check` 메서드를 사용하면 지정한 평문 문자열이 주어진 해시와 일치하는지 확인할 수 있습니다.

```php
if (Hash::check('plain-text', $hashedPassword)) {
    // 비밀번호가 일치합니다.
}
```

<a name="determining-if-a-password-needs-to-be-rehashed"></a>
### 비밀번호를 다시 해싱해야 하는지 확인하기

`Hash` 파사드의 `needsRehash` 메서드를 사용하면, 해싱에 사용한 작업 인자가 비밀번호를 해싱할 당시 이후 변경되었는지 확인할 수 있습니다. 일부 애플리케이션은 인증 처리 과정 중에 이 검사를 수행하기도 합니다.

```php
if (Hash::needsRehash($hashed)) {
    $hashed = Hash::make('plain-text');
}
```

<a name="hash-algorithm-verification"></a>
## 해시 알고리즘 검증

해시 알고리즘이 조작되는 것을 방지하기 위해, 라라벨의 `Hash::check` 메서드는 먼저 주어진 해시가 애플리케이션에서 선택한 해싱 알고리즘으로 생성되었는지 검사합니다. 만약 알고리즘이 다르다면, `RuntimeException` 예외가 발생합니다.

이 동작은 대부분의 애플리케이션에서 기대되는 기본 동작이며, 해싱 알고리즘이 변경되지 않고 그대로 유지되는 것이 일반적입니다. 만약 다른 알고리즘이 사용된다면 악의적인 공격을 의심할 수 있습니다. 하지만 한 알고리즘에서 다른 알고리즘으로 마이그레이션하는 등 여러 해싱 알고리즘을 지원해야 하는 경우, `HASH_VERIFY` 환경 변수를 `false`로 설정하여 해시 알고리즘 검증을 비활성화할 수 있습니다.

```ini
HASH_VERIFY=false
```