# 암호화 (Encryption)

- [소개](#introduction)
- [설정](#configuration)
    - [암호화 키의 안전한 교체](#gracefully-rotating-encryption-keys)
- [Encrypter 사용하기](#using-the-encrypter)

<a name="introduction"></a>
## 소개

라라벨의 암호화 서비스는 OpenSSL을 사용하여 AES-256 및 AES-128 암호화 방식으로 텍스트를 암호화하고 복호화할 수 있는 간단하고 편리한 인터페이스를 제공합니다. 라라벨에서 암호화된 모든 값은 메시지 인증 코드(MAC)로 서명되어, 암호화된 후에는 해당 값이 변경되거나 변조되는 것을 방지합니다.

<a name="configuration"></a>
## 설정

라라벨의 Encrypter를 사용하기 전에, `config/app.php` 설정 파일에서 `key` 설정 옵션을 반드시 지정해야 합니다. 이 설정 값은 `APP_KEY` 환경 변수에 의해 결정됩니다. `php artisan key:generate` 명령어를 사용하여 이 변수의 값을 생성하시기 바랍니다. `key:generate` 명령어는 PHP의 보안 랜덤 바이트 생성기를 이용해 애플리케이션에 암호학적으로 안전한 키를 만들어줍니다. 일반적으로, [라라벨 설치](/docs/12.x/installation) 과정에서 `APP_KEY` 환경 변수는 자동으로 생성됩니다.

<a name="gracefully-rotating-encryption-keys"></a>
### 암호화 키의 안전한 교체

애플리케이션의 암호화 키를 변경하면, 인증된 모든 사용자 세션이 로그아웃됩니다. 이는 모든 쿠키 (세션 쿠키 포함)가 라라벨에 의해 암호화되기 때문입니다. 또한, 이전 암호화 키로 암호화된 데이터를 복호화할 수 없게 됩니다.

이 문제를 완화하기 위해, 라라벨에서는 앱의 `APP_PREVIOUS_KEYS` 환경 변수에 이전 암호화 키들을 콤마(,)로 구분하여 나열할 수 있습니다. 이 변수에는 과거에 사용했던 모든 암호화 키를 입력할 수 있습니다.

```ini
APP_KEY="base64:J63qRTDLub5NuZvP+kb8YIorGS6qFYHKVo6u7179stY="
APP_PREVIOUS_KEYS="base64:2nLsGFGzyoae2ax3EF2Lyq/hH6QghBGLIq5uL+Gp8/w="
```

이 환경 변수를 설정하면, 라라벨은 값을 암호화할 때 항상 "현재" 암호화 키를 사용합니다. 하지만 값을 복호화할 때에는, 우선 현재 키로 복호화를 시도하고, 실패할 경우 이전 키들도 차례로 시도하여 복호화가 성공할 때까지 진행합니다.

이 방식 덕분에, 암호화 키가 교체되더라도 사용자들은 별다른 불편 없이 애플리케이션을 계속 사용할 수 있습니다.

<a name="using-the-encrypter"></a>
## Encrypter 사용하기

<a name="encrypting-a-value"></a>
#### 값 암호화하기

`Crypt` 파사드가 제공하는 `encryptString` 메서드를 사용해 값을 암호화할 수 있습니다. 모든 암호화는 OpenSSL과 AES-256-CBC 알고리즘을 이용해 처리됩니다. 또한 암호화된 값에는 메시지 인증 코드(MAC)가 함께 포함되어, 악의적인 사용자가 값을 변조하면 복호화할 수 없게 됩니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class DigitalOceanTokenController extends Controller
{
    /**
     * Store a DigitalOcean API token for the user.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->user()->fill([
            'token' => Crypt::encryptString($request->token),
        ])->save();

        return redirect('/secrets');
    }
}
```

<a name="decrypting-a-value"></a>
#### 값 복호화하기

`Crypt` 파사드의 `decryptString` 메서드를 사용해 암호화된 값을 복호화할 수 있습니다. 만약 메시지 인증 코드가 유효하지 않아 값을 올바르게 복호화하지 못하면, `Illuminate\Contracts\Encryption\DecryptException` 예외가 발생합니다.

```php
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;

try {
    $decrypted = Crypt::decryptString($encryptedValue);
} catch (DecryptException $e) {
    // ...
}
```
