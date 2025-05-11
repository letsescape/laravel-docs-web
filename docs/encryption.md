# 암호화 (Encryption)

- [소개](#introduction)
- [구성](#configuration)
    - [암호화 키의 안전한 교체](#gracefully-rotating-encryption-keys)
- [Encrypter 사용하기](#using-the-encrypter)

<a name="introduction"></a>
## 소개

라라벨의 암호화 서비스는 OpenSSL을 이용하여 AES-256 및 AES-128 방식으로 텍스트를 암호화하고 복호화할 수 있는 간편한 인터페이스를 제공합니다. 라라벨에서 암호화된 모든 값은 메시지 인증 코드(MAC)로 서명되기 때문에, 한 번 암호화된 이후에는 해당 값이 임의로 변경되거나 변조될 수 없습니다.

<a name="configuration"></a>
## 구성

라라벨의 Encrypter를 사용하기 전에, `config/app.php` 설정 파일에서 `key` 옵션을 반드시 지정해야 합니다. 이 설정 값은 `APP_KEY` 환경 변수에 의해 결정됩니다. 이 변수의 값을 생성하려면 `php artisan key:generate` 명령어를 사용하는 것이 좋습니다. 이 명령어는 PHP의 보안 랜덤 바이트 생성기를 사용하여 애플리케이션에 적합한 암호화 키를 안전하게 만들어 줍니다. 일반적으로 `APP_KEY` 환경 변수의 값은 [라라벨 설치 과정](/docs/installation)에서 자동으로 생성됩니다.

<a name="gracefully-rotating-encryption-keys"></a>
### 암호화 키의 안전한 교체

애플리케이션의 암호화 키를 변경하면 모든 인증된 사용자 세션이 로그아웃됩니다. 이는 모든 쿠키(세션 쿠키 포함)가 라라벨에 의해 암호화되기 때문입니다. 또한, 이전 암호화 키로 저장된 데이터는 더 이상 복호화할 수 없습니다.

이 문제를 완화하기 위해 라라벨에서는 애플리케이션의 `APP_PREVIOUS_KEYS` 환경 변수에 이전에 사용한 암호화 키들을 등록할 수 있도록 지원합니다. 이 변수에는 이전 암호화 키들을 쉼표로 구분하여 나열할 수 있습니다.

```ini
APP_KEY="base64:J63qRTDLub5NuZvP+kb8YIorGS6qFYHKVo6u7179stY="
APP_PREVIOUS_KEYS="base64:2nLsGFGzyoae2ax3EF2Lyq/hH6QghBGLIq5uL+Gp8/w="
```

이 환경 변수를 설정하면, 라라벨은 값을 암호화할 때 항상 최신 암호화 키("current" 키)를 사용합니다. 반면, 복호화 시에는 먼저 현재 키로 복호화를 시도하고, 실패할 경우 나열된 이전 키들로 순차적으로 복호화를 시도하여, 복호화가 가능한 키를 찾을 때까지 시도합니다.

이런 방식의 유연한 복호화 처리 덕분에 암호화 키를 교체해도 사용자는 별다른 불편 없이 애플리케이션을 계속 사용할 수 있습니다.

<a name="using-the-encrypter"></a>
## Encrypter 사용하기

<a name="encrypting-a-value"></a>
#### 값 암호화하기

`Crypt` 파사드에서 제공하는 `encryptString` 메서드를 사용하여 값을 암호화할 수 있습니다. 암호화된 값은 모두 OpenSSL과 AES-256-CBC 알고리즘을 이용해 처리되며, 메시지 인증 코드(MAC)로 서명됩니다. 이 메시지 인증 코드 덕분에 악의적인 사용자가 값을 변조한 경우 복호화가 이루어지지 않습니다.

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

값을 복호화하려면 `Crypt` 파사드에서 제공하는 `decryptString` 메서드를 사용하면 됩니다. 만약 메시지 인증 코드가 유효하지 않아 값을 정상적으로 복호화할 수 없을 경우 `Illuminate\Contracts\Encryption\DecryptException` 예외가 발생합니다.

```php
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;

try {
    $decrypted = Crypt::decryptString($encryptedValue);
} catch (DecryptException $e) {
    // ...
}
```
