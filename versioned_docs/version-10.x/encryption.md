# 암호화 (Encryption)

- [소개](#introduction)
- [설정](#configuration)
- [Encrypter 사용하기](#using-the-encrypter)

<a name="introduction"></a>
## 소개

라라벨의 암호화 서비스는 OpenSSL을 기반으로 AES-256과 AES-128 암호화를 통해 텍스트를 암호화하고 복호화할 수 있는 쉽고 편리한 인터페이스를 제공합니다. 라라벨에서 암호화된 모든 값들은 메시지 인증 코드(MAC, Message Authentication Code)로 서명되어, 한 번 암호화된 이후에는 그 값이 외부에서 임의로 변경되거나 위조될 수 없도록 보호합니다.

<a name="configuration"></a>
## 설정

라라벨의 Encrypter를 사용하기 전에, `config/app.php` 설정 파일에서 `key` 설정 옵션을 반드시 지정해야 합니다. 이 설정 값은 `APP_KEY` 환경 변수에 의해 결정됩니다. 이 변수의 값을 생성할 때는 `php artisan key:generate` 명령어를 사용하는 것이 좋습니다. `key:generate` 명령어는 PHP의 보안 랜덤 바이트 생성기를 활용하여, 애플리케이션에 적합한 암호화 키를 안전하게 생성해줍니다. 일반적으로, `APP_KEY` 환경 변수의 값은 [라라벨 설치 과정](/docs/10.x/installation)에서 자동으로 생성됩니다.

<a name="using-the-encrypter"></a>
## Encrypter 사용하기

<a name="encrypting-a-value"></a>
#### 값 암호화하기

`Crypt` 파사드에서 제공하는 `encryptString` 메서드를 사용해 값을 암호화할 수 있습니다. 암호화된 모든 값은 OpenSSL을 사용하고, AES-256-CBC 암호화 방식을 적용합니다. 또한 모든 암호화 값은 메시지 인증 코드(MAC)로 서명됩니다. 내장된 메시지 인증 코드를 통해, 사용자가 악의적으로 값을 변조했다면 해당 값의 복호화가 불가능해지므로 안전하게 보호할 수 있습니다.

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

암호화된 값을 복호화하려면 `Crypt` 파사드에서 제공하는 `decryptString` 메서드를 사용하면 됩니다. 만약 메시지 인증 코드(MAC)가 올바르지 않거나, 다른 이유로 값이 정상적으로 복호화되지 않으면 `Illuminate\Contracts\Encryption\DecryptException` 예외가 발생합니다.

```
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;

try {
    $decrypted = Crypt::decryptString($encryptedValue);
} catch (DecryptException $e) {
    // ...
}
```