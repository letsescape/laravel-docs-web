# 암호화 (Encryption)

- [소개](#introduction)
- [설정](#configuration)
    - [암호화 키 무중단 교체](#gracefully-rotating-encryption-keys)
- [암호화기 사용하기](#using-the-encrypter)

<a name="introduction"></a>
## 소개

라라벨의 암호화 서비스는 OpenSSL을 활용하여 AES-256 및 AES-128 알고리즘으로 텍스트를 암호화하고 복호화할 수 있는 단순하고 편리한 인터페이스를 제공합니다. 라라벨에서 암호화된 모든 값은 메시지 인증 코드(MAC)를 이용해 서명되므로, 암호화된 이후에는 해당 값이 임의로 변조되거나 수정될 수 없습니다.

<a name="configuration"></a>
## 설정

라라벨의 암호화기를 사용하기 전에 먼저 `config/app.php` 설정 파일의 `key` 설정 옵션을 지정해야 합니다. 이 설정 값은 `APP_KEY` 환경 변수에 의해 결정됩니다. `php artisan key:generate` 명령어를 사용하여 이 변수의 값을 생성하는 것이 좋습니다. 이 명령어는 PHP의 보안 난수 생성기를 활용하여 안전한 암호화 키를 만들어주기 때문입니다. 보통은 [라라벨 설치 과정](/docs/11.x/installation)에서 `APP_KEY` 환경 변수 값이 자동으로 생성됩니다.

<a name="gracefully-rotating-encryption-keys"></a>
### 암호화 키 무중단 교체

애플리케이션의 암호화 키를 변경하면, 인증된 모든 사용자 세션이 강제로 로그아웃됩니다. 이는 모든 쿠키, 세션 쿠키를 포함해, 라라벨이 암호화해서 저장하기 때문입니다. 또한, 이전 암호화 키로 암호화된 데이터는 더 이상 복호화할 수 없게 됩니다.

이 문제를 완화하기 위해, 라라벨에서는 이전에 사용하던 암호화 키들을 애플리케이션의 `APP_PREVIOUS_KEYS` 환경 변수에 나열할 수 있도록 지원합니다. 이 변수에는 이전에 사용했던 모든 암호화 키를 콤마(,)로 구분하여 나열하면 됩니다.

```ini
APP_KEY="base64:J63qRTDLub5NuZvP+kb8YIorGS6qFYHKVo6u7179stY="
APP_PREVIOUS_KEYS="base64:2nLsGFGzyoae2ax3EF2Lyq/hH6QghBGLIq5uL+Gp8/w="
```

이 환경 변수를 지정하면, 라라벨은 값을 암호화할 때 항상 "현재" 암호화 키를 사용합니다. 반면, 값을 복호화할 때는 우선 현재 키를 시도하고, 복호화에 실패하면 나열된 이전 키들을 차례대로 시도하여 정상적으로 복호화할 수 있을 때까지 진행합니다.

이런 방식으로 암호화 키를 무중단으로 교체하면, 암호화 키를 변경해도 사용자 입장에서는 별다른 불편 없이 애플리케이션을 계속 사용할 수 있습니다.

<a name="using-the-encrypter"></a>
## 암호화기 사용하기

<a name="encrypting-a-value"></a>
#### 값 암호화하기

`Crypt` 파사드에서 제공하는 `encryptString` 메서드를 사용하여 값을 암호화할 수 있습니다. 저장되는 모든 값은 OpenSSL의 AES-256-CBC 암호화 방식을 사용하여 보호되고, 메시지 인증 코드(MAC)로 서명됩니다. 통합된 메시지 인증 기능 덕분에 악의적인 사용자가 값을 변조했다면, 해당 값의 복호화가 불가능해집니다.

```
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

`Crypt` 파사드의 `decryptString` 메서드를 사용해 암호화된 값을 복호화할 수 있습니다. 만약 메시지 인증 코드가 유효하지 않거나 값이 올바르게 복호화될 수 없는 경우, `Illuminate\Contracts\Encryption\DecryptException` 예외가 발생합니다.

```
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;

try {
    $decrypted = Crypt::decryptString($encryptedValue);
} catch (DecryptException $e) {
    // ...
}
```
