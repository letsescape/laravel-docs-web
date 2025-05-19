# 암호화 (Encryption)

- [소개](#introduction)
- [설정](#configuration)
- [Encrypter 사용하기](#using-the-encrypter)

<a name="introduction"></a>
## 소개

라라벨의 암호화 서비스는 OpenSSL을 활용하여 AES-256 및 AES-128 암호화를 통해 텍스트를 손쉽게 암호화·복호화할 수 있는 간편한 인터페이스를 제공합니다. 라라벨에서 암호화된 모든 값에는 메시지 인증 코드(MAC)가 함께 서명되어, 암호화 이후에는 데이터의 실질적인 값이 수정되거나 변조될 수 없도록 보호합니다.

<a name="configuration"></a>
## 설정

라라벨의 Encrypter를 사용하기 전에, 반드시 `config/app.php` 설정 파일 내의 `key` 옵션을 설정해야 합니다. 이 설정 값은 `APP_KEY` 환경 변수에 의해 지정됩니다. `php artisan key:generate` 명령어를 사용하여 해당 변수의 값을 생성하는 것이 좋습니다. 이 명령어는 PHP의 보안 난수 생성기를 활용해 애플리케이션에 암호적으로 안전한 키를 만들어 줍니다. 일반적으로 [라라벨 설치 과정](/docs/9.x/installation) 중에 `APP_KEY` 환경 변수의 값이 자동으로 생성됩니다.

<a name="using-the-encrypter"></a>
## Encrypter 사용하기

<a name="encrypting-a-value"></a>
#### 값 암호화하기

`Crypt` 파사드에서 제공하는 `encryptString` 메서드를 이용해 값을 암호화할 수 있습니다. 암호화된 값은 모두 OpenSSL과 AES-256-CBC 암호화 알고리즘을 사용하며, 메시지 인증 코드(MAC)로 서명됩니다. 이 메시지 인증 코드 덕분에 악의적인 사용자가 변조한 값에 대해서는 복호화가 차단됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class DigitalOceanTokenController extends Controller
{
    /**
     * Store a DigitalOcean API token for the user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function storeSecret(Request $request)
    {
        $request->user()->fill([
            'token' => Crypt::encryptString($request->token),
        ])->save();
    }
}
```

<a name="decrypting-a-value"></a>
#### 값 복호화하기

암호화된 값은 `Crypt` 파사드의 `decryptString` 메서드로 복호화할 수 있습니다. 만약 메시지 인증 코드가 올바르지 않거나 복호화에 실패할 경우, `Illuminate\Contracts\Encryption\DecryptException` 예외가 발생합니다.

```
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;

try {
    $decrypted = Crypt::decryptString($encryptedValue);
} catch (DecryptException $e) {
    //
}
```
