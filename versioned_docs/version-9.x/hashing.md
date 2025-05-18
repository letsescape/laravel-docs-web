# 해싱 (Hashing)

- [소개](#introduction)
- [설정](#configuration)
- [기본 사용법](#basic-usage)
    - [비밀번호 해싱](#hashing-passwords)
    - [비밀번호와 해시 값의 일치 여부 확인](#verifying-that-a-password-matches-a-hash)
    - [비밀번호 재해싱 필요 여부 판단](#determining-if-a-password-needs-to-be-rehashed)

<a name="introduction"></a>
## 소개

라라벨의 `Hash` [파사드](/docs/9.x/facades)는 사용자 비밀번호를 저장할 때 안전한 Bcrypt 및 Argon2 해싱 기능을 제공합니다. [라라벨 애플리케이션 스타터 키트](/docs/9.x/starter-kits) 중 하나를 사용하고 있다면, 기본적으로 회원 등록과 인증 과정에서 Bcrypt가 사용됩니다.

Bcrypt는 비밀번호 해싱을 위한 훌륭한 선택지입니다. 그 이유는 "작업 인자(work factor)"를 조정할 수 있어서 하드웨어 성능이 향상될수록 해시 생성에 필요한 시간을 늘릴 수 있기 때문입니다. 비밀번호를 해싱할 때는 느릴수록 더 안전합니다. 알고리즘이 비밀번호 해시에 더 많은 시간을 소요할수록, 악의적인 사용자가 일명 "레인보우 테이블"이라고 불리는 모든 가능한 문자열 해시 값을 생성해서 애플리케이션을 무차별 대입 공격(brute force attack)하는 시간이 길어집니다.

<a name="configuration"></a>
## 설정

애플리케이션에서 기본적으로 사용할 해싱 드라이버는 `config/hashing.php` 설정 파일에서 지정할 수 있습니다. 현재 여러 종류의 드라이버를 지원하며, [Bcrypt](https://en.wikipedia.org/wiki/Bcrypt)와 [Argon2](https://en.wikipedia.org/wiki/Argon2) (Argon2i와 Argon2id 변종)를 사용할 수 있습니다.

<a name="basic-usage"></a>
## 기본 사용법

<a name="hashing-passwords"></a>
### 비밀번호 해싱

비밀번호를 해싱하려면 `Hash` 파사드의 `make` 메서드를 호출하면 됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PasswordController extends Controller
{
    /**
     * Update the password for the user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        // Validate the new password length...

        $request->user()->fill([
            'password' => Hash::make($request->newPassword)
        ])->save();
    }
}
```

<a name="adjusting-the-bcrypt-work-factor"></a>
#### Bcrypt 작업 인자(work factor) 조정

Bcrypt 알고리즘을 사용하는 경우, `make` 메서드에서 `rounds` 옵션을 사용해 알고리즘의 작업 인자(work factor)를 조정할 수 있습니다. 하지만 대부분의 애플리케이션에는 라라벨이 기본적으로 제공하는 값이면 충분합니다.

```
$hashed = Hash::make('password', [
    'rounds' => 12,
]);
```

<a name="adjusting-the-argon2-work-factor"></a>
#### Argon2 작업 인자(work factor) 조정

Argon2 알고리즘을 사용하는 경우, `make` 메서드에서 `memory`, `time`, `threads` 옵션을 설정해 작업 인자를 조정할 수 있습니다. 대부분의 애플리케이션에서는 라라벨이 제공하는 기본 값이면 충분합니다.

```
$hashed = Hash::make('password', [
    'memory' => 1024,
    'time' => 2,
    'threads' => 2,
]);
```

> [!NOTE]
> 각 옵션에 대한 더 자세한 내용은 [공식 PHP 문서의 Argon 해싱 설명](https://secure.php.net/manual/en/function.password-hash.php)을 참고하시기 바랍니다.

<a name="verifying-that-a-password-matches-a-hash"></a>
### 비밀번호와 해시 값의 일치 여부 확인

`Hash` 파사드에서 제공하는 `check` 메서드를 사용하면, 주어진 평문 문자열이 저장된 해시 값과 일치하는지 확인할 수 있습니다.

```
if (Hash::check('plain-text', $hashedPassword)) {
    // The passwords match...
}
```

<a name="determining-if-a-password-needs-to-be-rehashed"></a>
### 비밀번호 재해싱 필요 여부 판단

`Hash` 파사드의 `needsRehash` 메서드를 사용하면, 비밀번호가 해싱될 당시 사용된 작업 인자가 이후 변경되었는지, 즉 비밀번호를 다시 해싱해야 할 필요가 있는지 확인할 수 있습니다. 일부 애플리케이션에서는 인증 과정에서 이 검사를 수행하기도 합니다.

```
if (Hash::needsRehash($hashed)) {
    $hashed = Hash::make('plain-text');
}
```
