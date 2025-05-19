# 해싱 (Hashing)

- [소개](#introduction)
- [설정](#configuration)
- [기본 사용법](#basic-usage)
    - [비밀번호 해싱하기](#hashing-passwords)
    - [비밀번호와 해시가 일치하는지 검증하기](#verifying-that-a-password-matches-a-hash)
    - [비밀번호 해시를 다시 생성해야 하는지 판단하기](#determining-if-a-password-needs-to-be-rehashed)
- [해시 알고리즘 검증](#hash-algorithm-verification)

<a name="introduction"></a>
## 소개

라라벨의 `Hash` [파사드](/docs/11.x/facades)는 사용자 비밀번호를 저장하기 위해 안전한 Bcrypt 및 Argon2 해싱 기능을 제공합니다. [라라벨 애플리케이션 스타터 키트](/docs/11.x/starter-kits) 중 하나를 사용한다면, 회원가입 및 인증에서는 기본적으로 Bcrypt가 사용됩니다.

Bcrypt는 "work factor"(작업 강도)를 조정할 수 있기 때문에 비밀번호 해싱에 적합한 선택입니다. 이는 하드웨어 성능이 높아질수록 해시 생성에 소요되는 시간을 늘릴 수 있음을 의미합니다. 비밀번호를 해싱할 때는 느릴수록 좋습니다. 해시를 생성하는 데 시간이 오래 걸릴수록, 공격자가 모든 가능한 문자열 해시 값을 미리 계산해 두는 이른바 '레인보우 테이블'을 만드는 데 드는 시간도 함께 늘어나기 때문에, 애플리케이션에 대한 무차별 대입 공격을 방지하는 데 더 효과적입니다.

<a name="configuration"></a>
## 설정

기본적으로 라라벨은 데이터를 해싱할 때 `bcrypt` 해싱 드라이버를 사용합니다. 그러나 [`argon`](https://en.wikipedia.org/wiki/Argon2) 및 [`argon2id`](https://en.wikipedia.org/wiki/Argon2) 등 다른 해싱 드라이버도 지원합니다.

애플리케이션의 해싱 드라이버는 `HASH_DRIVER` 환경 변수로 지정할 수 있습니다. 그러나 라라벨의 해싱 드라이버 옵션 전체를 직접 커스터마이즈하려면, 아래의 `config:publish` Artisan 명령어를 사용해서 전체 `hashing` 설정 파일을 게시해야 합니다.

```bash
php artisan config:publish hashing
```

<a name="basic-usage"></a>
## 기본 사용법

<a name="hashing-passwords"></a>
### 비밀번호 해싱하기

`Hash` 파사드의 `make` 메서드를 호출하여 비밀번호를 해싱할 수 있습니다.

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
#### Bcrypt 작업 강도(work factor) 조정하기

Bcrypt 알고리즘을 사용할 때는, `make` 메서드에 `rounds` 옵션을 지정하여 알고리즘의 작업 강도를 조절할 수 있습니다. 하지만 라라벨이 관리하는 기본 작업 강도 설정(디폴트 값)도 대부분의 애플리케이션에 충분합니다.

```
$hashed = Hash::make('password', [
    'rounds' => 12,
]);
```

<a name="adjusting-the-argon2-work-factor"></a>
#### Argon2 작업 강도(work factor) 조정하기

Argon2 알고리즘을 사용할 때는, `make` 메서드에 `memory`, `time`, `threads` 옵션을 지정하여 작업 강도를 조정할 수 있습니다. 하지만 라라벨이 제공하는 기본 값도 대다수의 애플리케이션에 적합합니다.

```
$hashed = Hash::make('password', [
    'memory' => 1024,
    'time' => 2,
    'threads' => 2,
]);
```

> [!NOTE]  
> 각 옵션에 대한 자세한 설명은 [공식 PHP Argon 해시 관련 문서](https://secure.php.net/manual/en/function.password-hash.php)를 참고해 주세요.

<a name="verifying-that-a-password-matches-a-hash"></a>
### 비밀번호와 해시가 일치하는지 검증하기

`Hash` 파사드가 제공하는 `check` 메서드를 사용해, 주어진 평문 문자열이 해시와 일치하는지 확인할 수 있습니다.

```
if (Hash::check('plain-text', $hashedPassword)) {
    // The passwords match...
}
```

<a name="determining-if-a-password-needs-to-be-rehashed"></a>
### 비밀번호 해시를 다시 생성해야 하는지 판단하기

`Hash` 파사드의 `needsRehash` 메서드를 통해, 기존 비밀번호 해시가 생성된 이후 해싱에 사용된 작업 강도(설정 값)가 변경되었는지를 판별할 수 있습니다. 일부 애플리케이션에서는 이러한 여부를 인증 과정에서 확인한 후, 필요할 경우 해시를 재생성하기도 합니다.

```
if (Hash::needsRehash($hashed)) {
    $hashed = Hash::make('plain-text');
}
```

<a name="hash-algorithm-verification"></a>
## 해시 알고리즘 검증

해시 알고리즘이 조작되는 것을 방지하기 위해, 라라벨의 `Hash::check` 메서드는 전달된 해시가 애플리케이션에서 선택한 해싱 알고리즘으로 생성되었는지 먼저 확인합니다. 만약 알고리즘이 다를 경우, `RuntimeException` 예외가 발생합니다.

이런 방식은 해싱 알고리즘이 변경되지 않는 대부분의 애플리케이션에서는 당연한 동작이며, 서로 다른 알고리즘의 혼용은 악의적인 공격의 신호가 될 수 있습니다. 그러나 한 알고리즘에서 다른 알고리즘으로 마이그레이션하는 등, 여러 해싱 알고리즘을 동시에 지원해야 하는 경우도 있을 수 있습니다. 이럴 때는 `HASH_VERIFY` 환경 변수를 `false`로 설정하여 해시 알고리즘 검증을 비활성화할 수 있습니다.

```ini
HASH_VERIFY=false
```
