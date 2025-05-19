# 암호화 (Encryption)

- [소개](#introduction)
- [설정](#configuration)
- [Encrypter 사용하기](#using-the-encrypter)

<a name="introduction"></a>
## 소개

라라벨의 암호화 서비스는 OpenSSL을 사용해 AES-256 및 AES-128 암호화를 통해 텍스트를 암호화하고 복호화할 수 있는 간단하고 편리한 인터페이스를 제공합니다. 라라벨에서 암호화된 모든 값은 메시지 인증 코드(MAC, Message Authentication Code)로 서명되기 때문에, 한 번 암호화된 값은 기반 데이터가 변경되거나 변조될 수 없습니다.

<a name="configuration"></a>
## 설정

라라벨의 encrypter를 사용하기 전에, 먼저 `config/app.php` 설정 파일에서 `key` 옵션을 반드시 설정해야 합니다. 이 설정 값은 `APP_KEY` 환경 변수에 의해 결정됩니다. `php artisan key:generate` 명령어를 사용해 이 환경 변수 값을 생성하는 것이 좋습니다. `key:generate` 명령어는 PHP의 보안 무작위 바이트 생성기를 사용해, 암호적으로 안전한 키를 애플리케이션에 맞게 생성합니다. 보통 [라라벨 설치](/docs/8.x/installation) 과정에서 `APP_KEY` 환경 변수 값이 자동으로 생성됩니다.

<a name="using-the-encrypter"></a>
## Encrypter 사용하기

<a name="encrypting-a-value"></a>
#### 값 암호화하기

`Crypt` 파사드에서 제공하는 `encryptString` 메서드를 이용해 원하는 값을 암호화할 수 있습니다. 암호화 작업은 모두 OpenSSL과 AES-256-CBC 알고리즘을 사용하여 처리됩니다. 또한, 모든 암호화된 값에는 메시지 인증 코드(MAC)가 적용되어 있습니다. 이 내장된 MAC은 악의적인 사용자가 값을 변조한 경우 복호화(해독)를 차단합니다.

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

`Crypt` 파사드에서 제공하는 `decryptString` 메서드를 사용해 암호화된 값을 복호화할 수 있습니다. 만약 메시지 인증 코드가 유효하지 않아 값을 올바르게 복호화할 수 없는 경우, `Illuminate\Contracts\Encryption\DecryptException` 예외가 발생합니다.

```
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;

try {
    $decrypted = Crypt::decryptString($encryptedValue);
} catch (DecryptException $e) {
    //
}
```
