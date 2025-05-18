# 해싱 (Hashing)

- [소개](#introduction)
- [설정](#configuration)
- [기본 사용법](#basic-usage)
    - [비밀번호 해싱](#hashing-passwords)
    - [비밀번호가 해시와 일치하는지 확인하기](#verifying-that-a-password-matches-a-hash)
    - [비밀번호를 다시 해싱해야 하는지 확인하기](#determining-if-a-password-needs-to-be-rehashed)

<a name="introduction"></a>
## 소개

라라벨의 `Hash` [파사드](/docs/10.x/facades)는 사용자의 비밀번호를 안전하게 저장할 수 있도록 Bcrypt와 Argon2 해싱 기능을 제공합니다. [라라벨 애플리케이션 스타터 키트](/docs/10.x/starter-kits) 중 하나를 사용하고 있다면, 기본적으로 Bcrypt가 회원가입과 인증 과정에 사용됩니다.

Bcrypt는 비밀번호를 해싱하는 데 있어서 매우 적합한 선택입니다. 그 이유는 "워크 팩터(work factor)"를 조절할 수 있기 때문입니다. 워크 팩터는 해시를 생성하는 데 걸리는 시간을 의미하며, 하드웨어 성능이 향상됨에 따라 이 값을 증가시켜 보안을 강화할 수 있습니다. 비밀번호를 해싱할 때는 속도가 느릴수록 오히려 좋습니다. 해시 생성에 시간이 많이 걸릴수록, 악의적인 사용자가 가능한 모든 문자열 해시 값을 미리 생성해 두는 "레인보우 테이블"을 만드는 데 시간이 더 많이 걸리기 때문에, 무차별 대입 공격에 강해집니다.

<a name="configuration"></a>
## 설정

애플리케이션에서 사용할 기본 해싱 드라이버는 `config/hashing.php` 설정 파일에서 지정할 수 있습니다. 현재 지원되는 드라이버는 [Bcrypt](https://en.wikipedia.org/wiki/Bcrypt)와 [Argon2](https://en.wikipedia.org/wiki/Argon2) (Argon2i, Argon2id 변형 포함)입니다.

<a name="basic-usage"></a>
## 기본 사용법

<a name="hashing-passwords"></a>
### 비밀번호 해싱

`Hash` 파사드의 `make` 메서드를 사용해 비밀번호를 해싱할 수 있습니다.

```
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
#### Bcrypt 워크 팩터 조정하기

Bcrypt 알고리즘을 사용할 경우, `make` 메서드의 `rounds` 옵션을 통해 워크 팩터를 직접 조정할 수 있습니다. 다만, 라라벨에서 기본으로 제공하는 워크 팩터 값도 대부분의 애플리케이션에서 충분합니다.

```
$hashed = Hash::make('password', [
    'rounds' => 12,
]);
```

<a name="adjusting-the-argon2-work-factor"></a>
#### Argon2 워크 팩터 조정하기

Argon2 알고리즘을 사용할 경우, `make` 메서드에서 `memory`, `time`, `threads` 등의 옵션으로 워크 팩터를 조정할 수 있습니다. 이 역시 라라벨에서 관리하는 기본값이 대부분의 상황에서 적절합니다.

```
$hashed = Hash::make('password', [
    'memory' => 1024,
    'time' => 2,
    'threads' => 2,
]);
```

> [!NOTE]
> 이 옵션들에 대한 더 자세한 내용은 [공식 PHP Argon 해싱 문서](https://secure.php.net/manual/en/function.password-hash.php)를 참고하시기 바랍니다.

<a name="verifying-that-a-password-matches-a-hash"></a>
### 비밀번호가 해시와 일치하는지 확인하기

`Hash` 파사드의 `check` 메서드를 사용하면, 주어진 평문 문자열이 특정 해시 값과 일치하는지 확인할 수 있습니다.

```
if (Hash::check('plain-text', $hashedPassword)) {
    // The passwords match...
}
```

<a name="determining-if-a-password-needs-to-be-rehashed"></a>
### 비밀번호를 다시 해싱해야 하는지 확인하기

`Hash` 파사드의 `needsRehash` 메서드를 사용하면, 기존 해시가 현재의 워크 팩터와 다른지(즉, 재해싱이 필요한지) 확인할 수 있습니다. 일부 애플리케이션에서는 인증 과정에서 이 검사를 수행하기도 합니다.

```
if (Hash::needsRehash($hashed)) {
    $hashed = Hash::make('plain-text');
}
```