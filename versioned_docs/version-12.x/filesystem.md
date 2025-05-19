# 파일 스토리지 (File Storage)

- [소개](#introduction)
- [설정](#configuration)
    - [로컬 드라이버](#the-local-driver)
    - [퍼블릭 디스크](#the-public-disk)
    - [드라이버 사전 준비 사항](#driver-prerequisites)
    - [스코프 및 읽기 전용 파일시스템](#scoped-and-read-only-filesystems)
    - [Amazon S3 호환 파일시스템](#amazon-s3-compatible-filesystems)
- [디스크 인스턴스 얻기](#obtaining-disk-instances)
    - [온디맨드 디스크](#on-demand-disks)
- [파일 가져오기](#retrieving-files)
    - [파일 다운로드](#downloading-files)
    - [파일 URL](#file-urls)
    - [임시 URL](#temporary-urls)
    - [파일 메타데이터](#file-metadata)
- [파일 저장](#storing-files)
    - [파일에 내용 추가 및 앞/뒤로 쓰기](#prepending-appending-to-files)
    - [파일 복사 및 이동](#copying-moving-files)
    - [자동 스트리밍](#automatic-streaming)
    - [파일 업로드](#file-uploads)
    - [파일 공개 여부](#file-visibility)
- [파일 삭제](#deleting-files)
- [디렉터리](#directories)
- [테스트](#testing)
- [커스텀 파일시스템](#custom-filesystems)

<a name="introduction"></a>
## 소개

라라벨은 Frank de Jonge가 만든 훌륭한 [Flysystem](https://github.com/thephpleague/flysystem) PHP 패키지 덕분에 강력한 파일시스템 추상화 기능을 제공합니다. 라라벨의 Flysystem 통합을 통해 로컬 파일시스템, SFTP, Amazon S3를 쉽게 사용할 수 있는 드라이버들이 제공됩니다. 각각의 시스템에 대한 API 방식이 동일하기 때문에, 로컬 개발 환경에서 운영 환경으로 저장소 옵션을 자유롭게 전환할 수 있다는 점도 매우 큰 장점입니다.

<a name="configuration"></a>
## 설정

라라벨의 파일시스템 설정 파일은 `config/filesystems.php`에 위치합니다. 이 파일에서 모든 파일시스템 "디스크"를 설정할 수 있습니다. 각각의 디스크는 특정 스토리지 드라이버 및 저장소 위치를 의미합니다. 지원되는 각 드라이버에 대한 예시 설정이 기본적으로 포함되어 있으므로, 여러분의 저장소 환경과 자격 증명에 맞게 구성만 변경하시면 됩니다.

`local` 드라이버는 라라벨 애플리케이션이 동작하는 서버의 로컬 파일에 접근할 때 사용하며, `s3` 드라이버는 Amazon S3 클라우드 스토리지 서비스에 파일을 쓸 때 사용합니다.

> [!NOTE]
> 설정할 수 있는 디스크의 개수에는 제한이 없으며, 동일한 드라이버를 여러 디스크에서 동시에 사용할 수도 있습니다.

<a name="the-local-driver"></a>
### 로컬 드라이버

`local` 드라이버를 사용할 때, 모든 파일 작업은 `filesystems` 설정 파일에 지정된 `root` 디렉터리를 기준으로 상대 경로가 됩니다. 기본적으로 이 값은 `storage/app/private` 디렉터리로 설정되어 있습니다. 따라서 아래의 메서드는 `storage/app/private/example.txt` 경로에 파일을 씁니다.

```php
use Illuminate\Support\Facades\Storage;

Storage::disk('local')->put('example.txt', 'Contents');
```

<a name="the-public-disk"></a>
### 퍼블릭 디스크

애플리케이션의 `filesystems` 설정 파일에 포함된 `public` 디스크는 외부에서 공개 접근이 필요한 파일을 위한 용도입니다. 기본적으로 `public` 디스크는 `local` 드라이버를 사용하며, 파일은 `storage/app/public`에 저장됩니다.

`public` 디스크가 `local` 드라이버를 사용하는 경우, 웹에서 해당 파일에 접근하려면 소스 디렉터리인 `storage/app/public`에서 타겟 디렉터리인 `public/storage`로 심볼릭 링크를 만들어야 합니다.

심볼릭 링크를 생성하려면 `storage:link` 아티즌 명령어를 사용할 수 있습니다.

```shell
php artisan storage:link
```

파일이 저장되고 심볼릭 링크가 만들어지면, `asset` 헬퍼를 사용하여 파일의 URL을 생성할 수 있습니다.

```php
echo asset('storage/file.txt');
```

`filesystems` 설정 파일에서 추가로 심볼릭 링크를 구성할 수도 있습니다. 구성된 링크들은 `storage:link` 명령어 실행 시 모두 생성됩니다.

```php
'links' => [
    public_path('storage') => storage_path('app/public'),
    public_path('images') => storage_path('app/images'),
],
```

`storage:unlink` 명령어를 사용하면 설정된 심볼릭 링크를 삭제할 수 있습니다.

```shell
php artisan storage:unlink
```

<a name="driver-prerequisites"></a>
### 드라이버 사전 준비 사항

<a name="s3-driver-configuration"></a>
#### S3 드라이버 설정

S3 드라이버를 사용하기 전에 Composer 패키지 매니저를 이용해 Flysystem S3 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-aws-s3-v3 "^3.0" --with-all-dependencies
```

S3 디스크 설정 배열은 `config/filesystems.php` 설정 파일에 들어 있습니다. 일반적으로 S3 정보와 자격 증명은 아래의 환경 변수들을 사용해 설정하며, 이 값들은 `config/filesystems.php` 파일에서 참조됩니다.

```ini
AWS_ACCESS_KEY_ID=<your-key-id>
AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=<your-bucket-name>
AWS_USE_PATH_STYLE_ENDPOINT=false
```

이 환경 변수들은 AWS CLI에서 사용하는 네이밍 컨벤션과 동일합니다.

<a name="ftp-driver-configuration"></a>
#### FTP 드라이버 설정

FTP 드라이버를 사용하기 전에 Composer 패키지 매니저를 통해 Flysystem FTP 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-ftp "^3.0"
```

라라벨의 Flysystem 통합은 FTP에서도 잘 작동하지만, 프레임워크의 기본 `config/filesystems.php` 파일에는 FTP용 예시 설정이 들어있지 않습니다. FTP 파일시스템을 따로 설정해야 할 경우, 아래 예시를 참조하실 수 있습니다.

```php
'ftp' => [
    'driver' => 'ftp',
    'host' => env('FTP_HOST'),
    'username' => env('FTP_USERNAME'),
    'password' => env('FTP_PASSWORD'),

    // Optional FTP Settings...
    // 'port' => env('FTP_PORT', 21),
    // 'root' => env('FTP_ROOT'),
    // 'passive' => true,
    // 'ssl' => true,
    // 'timeout' => 30,
],
```

<a name="sftp-driver-configuration"></a>
#### SFTP 드라이버 설정

SFTP 드라이버를 사용하기 전에 Composer 패키지 매니저를 통해 Flysystem SFTP 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-sftp-v3 "^3.0"
```

라라벨의 Flysystem 통합은 SFTP에서도 잘 작동하지만, 프레임워크의 기본 `config/filesystems.php` 파일에는 SFTP용 예시 설정이 들어있지 않습니다. SFTP 파일시스템을 추가로 설정해야 할 경우, 아래의 예시를 사용할 수 있습니다.

```php
'sftp' => [
    'driver' => 'sftp',
    'host' => env('SFTP_HOST'),

    // 기본 인증을 위한 설정...
    'username' => env('SFTP_USERNAME'),
    'password' => env('SFTP_PASSWORD'),

    // 암호화 비밀번호가 있는 SSH 키 기반 인증을 위한 설정...
    'privateKey' => env('SFTP_PRIVATE_KEY'),
    'passphrase' => env('SFTP_PASSPHRASE'),

    // 파일/디렉터리 권한 설정...
    'visibility' => 'private', // `private` = 0600, `public` = 0644
    'directory_visibility' => 'private', // `private` = 0700, `public` = 0755

    // 선택 사항 SFTP 설정...
    // 'hostFingerprint' => env('SFTP_HOST_FINGERPRINT'),
    // 'maxTries' => 4,
    // 'passphrase' => env('SFTP_PASSPHRASE'),
    // 'port' => env('SFTP_PORT', 22),
    // 'root' => env('SFTP_ROOT', ''),
    // 'timeout' => 30,
    // 'useAgent' => true,
],
```

<a name="scoped-and-read-only-filesystems"></a>
### 스코프 및 읽기 전용 파일시스템

스코프 디스크를 사용하면, 모든 경로가 자동으로 지정된 경로 접두사로 시작되는 파일시스템을 만들 수 있습니다. 스코프 파일시스템 디스크를 생성하기 전, 추가적인 Flysystem 패키지를 Composer로 설치해야 합니다.

```shell
composer require league/flysystem-path-prefixing "^3.0"
```

이미 존재하는 파일시스템 디스크에 대해 `scoped` 드라이버를 지정하여 경로 범위가 적용된 인스턴스를 만들 수 있습니다. 예를 들어, 기존의 `s3` 디스크를 특정 경로 접두사로 설정해 두면, 이 스코프 디스크로 수행하는 모든 파일 작업이 해당 접두사를 사용합니다.

```php
's3-videos' => [
    'driver' => 'scoped',
    'disk' => 's3',
    'prefix' => 'path/to/videos',
],
```

"읽기 전용" 디스크를 사용하면 파일을 쓸 수 없는 읽기 전용 파일시스템 디스크를 만들 수 있습니다. `read-only` 옵션을 사용하기 전에 Composer로 추가적인 Flysystem 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-read-only "^3.0"
```

그 다음, 디스크 설정 배열에 `read-only` 옵션을 포함시킬 수 있습니다.

```php
's3-videos' => [
    'driver' => 's3',
    // ...
    'read-only' => true,
],
```

<a name="amazon-s3-compatible-filesystems"></a>
### Amazon S3 호환 파일시스템

기본적으로 애플리케이션의 `filesystems` 설정 파일에는 `s3` 디스크에 대한 설정이 들어 있습니다. 이 디스크를 [Amazon S3](https://aws.amazon.com/s3/)와 연동할 수 있을 뿐 아니라, [MinIO](https://github.com/minio/minio), [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/), [Vultr Object Storage](https://www.vultr.com/products/object-storage/), [Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/), [Hetzner Cloud Storage](https://www.hetzner.com/storage/object-storage/) 등 모든 S3 호환 파일 스토리지 서비스와도 연동할 수 있습니다.

일반적으로 사용할 서비스에 맞게 디스크의 자격 증명을 업데이트한 후, `endpoint` 설정 옵션의 값을 변경하면 대부분의 경우 바로 사용할 수 있습니다. 이 옵션 값은 보통 `AWS_ENDPOINT` 환경 변수에서 정의하게 됩니다.

```php
'endpoint' => env('AWS_ENDPOINT', 'https://minio:9000'),
```

<a name="minio"></a>
#### MinIO

라라벨의 Flysystem 통합이 MinIO와 연동하여 올바른 URL을 생성하려면 `AWS_URL` 환경 변수를 애플리케이션의 로컬 URL과 버킷 이름이 경로에 포함되도록 설정해야 합니다.

```ini
AWS_URL=http://localhost:9000/local
```

> [!WARNING]
> 클라이언트가 사용할 수 없는 `endpoint` 값을 사용할 경우 MinIO에서 `temporaryUrl` 메서드를 통한 임시 저장소 URL 생성이 정상적으로 동작하지 않을 수 있습니다.

<a name="obtaining-disk-instances"></a>
## 디스크 인스턴스 얻기

`Storage` 파사드를 사용하면 여러분이 설정한 어떤 디스크와도 상호작용할 수 있습니다. 예를 들어, `put` 메서드를 이용하여 기본 디스크에 아바타 파일을 저장할 수 있습니다. `disk` 메서드를 먼저 호출하지 않고 `Storage` 파사드의 메서드를 직접 부르면, 자동으로 기본 디스크에 전달됩니다.

```php
use Illuminate\Support\Facades\Storage;

Storage::put('avatars/1', $content);
```

애플리케이션에서 여러 개의 디스크를 다루어야 할 경우 `Storage` 파사드의 `disk` 메서드를 이용해 특정 디스크에 파일을 저장할 수 있습니다.

```php
Storage::disk('s3')->put('avatars/1', $content);
```

<a name="on-demand-disks"></a>
### 온디맨드 디스크

실행 중에 특정 설정으로 디스크를 만들고 싶은데, 굳이 애플리케이션의 `filesystems` 설정 파일에 추가하지 않아도 된다면, `Storage` 파사드의 `build` 메서드에 설정 배열을 전달하면 됩니다.

```php
use Illuminate\Support\Facades\Storage;

$disk = Storage::build([
    'driver' => 'local',
    'root' => '/path/to/root',
]);

$disk->put('image.jpg', $content);
```

<a name="retrieving-files"></a>
## 파일 가져오기

`get` 메서드를 사용해 파일의 내용을 가져올 수 있습니다. 이 메서드는 파일의 원본 문자열 데이터를 반환합니다. 모든 파일 경로는 반드시 디스크의 "root" 위치를 기준으로 한 상대 경로를 지정해야 함을 기억하세요.

```php
$contents = Storage::get('file.jpg');
```

가져오려는 파일이 JSON을 포함하고 있다면 `json` 메서드를 이용해 파일을 읽고 내용을 디코딩할 수 있습니다.

```php
$orders = Storage::json('orders.json');
```

`exists` 메서드는 파일이 해당 디스크에 존재하는지 확인할 때 사용합니다.

```php
if (Storage::disk('s3')->exists('file.jpg')) {
    // ...
}
```

`missing` 메서드는 파일이 해당 디스크에 없는지 확인할 때 사용할 수 있습니다.

```php
if (Storage::disk('s3')->missing('file.jpg')) {
    // ...
}
```

<a name="downloading-files"></a>
### 파일 다운로드

`download` 메서드를 사용하면 사용자의 브라우저가 지정된 경로의 파일을 바로 다운로드하도록 응답을 생성할 수 있습니다. 두 번째 인자로 파일명을 전달하면, 사용자에게 보이는 파일명을 지정할 수 있습니다. 마지막 세 번째 인자로 HTTP 헤더 배열도 전달할 수 있습니다.

```php
return Storage::download('file.jpg');

return Storage::download('file.jpg', $name, $headers);
```

<a name="file-urls"></a>
### 파일 URL

`url` 메서드를 이용해 지정한 파일의 URL을 얻을 수 있습니다. `local` 드라이버를 사용할 경우, 기본적으로 `/storage`를 해당 경로에 앞에 붙여 상대 URL을 반환합니다. `s3` 드라이버를 사용할 경우에는 완전한 원격 URL이 반환됩니다.

```php
use Illuminate\Support\Facades\Storage;

$url = Storage::url('file.jpg');
```

`local` 드라이버를 사용할 때, 외부에서 접근 가능한 파일은 항상 `storage/app/public` 디렉터리에 위치해야 합니다. 또한, [`public/storage`](#the-public-disk)에 [심볼릭 링크를 생성](#the-public-disk)하여 `storage/app/public` 디렉터리를 가리키도록 해야 합니다.

> [!WARNING]
> `local` 드라이버를 사용할 때, `url` 메서드의 반환 값은 URL 인코딩이 적용되지 않습니다. 따라서 항상 올바른 URL이 생성될 수 있도록 파일명을 지정하는 것이 좋습니다.

<a name="url-host-customization"></a>
#### URL 호스트 사용자 정의

`Storage` 파사드를 사용할 때 생성되는 URL의 호스트를 수정하고 싶다면 디스크 설정 배열에서 `url` 옵션을 추가하거나 수정하면 됩니다.

```php
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
    'throw' => false,
],
```

<a name="temporary-urls"></a>
### 임시 URL

`temporaryUrl` 메서드를 이용하면 `local` 및 `s3` 드라이버로 저장된 파일에 대한 임시 URL을 만들 수 있습니다. 이 메서드는 경로와, URL의 만료 시점을 지정하는 `DateTime` 인스턴스를 인자로 받습니다.

```php
use Illuminate\Support\Facades\Storage;

$url = Storage::temporaryUrl(
    'file.jpg', now()->addMinutes(5)
);
```

<a name="enabling-local-temporary-urls"></a>
#### 로컬 임시 URL 활성화

애플리케이션 개발을 `local` 드라이버의 임시 URL 지원 도입 이전에 시작한 경우, 임시 URL을 사용하려면 따로 활성화해야 할 수 있습니다. 이를 위해 `config/filesystems.php`의 `local` 디스크 설정 배열에 `serve` 옵션을 추가하면 됩니다.

```php
'local' => [
    'driver' => 'local',
    'root' => storage_path('app/private'),
    'serve' => true, // [tl! add]
    'throw' => false,
],
```

<a name="s3-request-parameters"></a>
#### S3 요청 파라미터

[S3 요청 파라미터](https://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectGET.html#RESTObjectGET-requests)를 추가로 지정해야 한다면, `temporaryUrl` 메서드의 세 번째 인자로 요청 파라미터 배열을 전달할 수 있습니다.

```php
$url = Storage::temporaryUrl(
    'file.jpg',
    now()->addMinutes(5),
    [
        'ResponseContentType' => 'application/octet-stream',
        'ResponseContentDisposition' => 'attachment; filename=file2.jpg',
    ]
);
```

<a name="customizing-temporary-urls"></a>
#### 임시 URL 커스터마이즈

특정 저장소 디스크에 대해 임시 URL 생성 방식을 커스터마이즈해야 할 경우, `buildTemporaryUrlsUsing` 메서드를 사용할 수 있습니다. 예컨대 직접적으로 임시 URL을 지원하지 않는 디스크로 저장된 파일을 다운로드할 수 있도록 별도 컨트롤러가 있는 경우에 유용하게 사용할 수 있습니다. 이 메서드는 일반적으로 서비스 프로바이더의 `boot` 메서드에서 호출해야 합니다.

```php
<?php

namespace App\Providers;

use DateTime;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Storage::disk('local')->buildTemporaryUrlsUsing(
            function (string $path, DateTime $expiration, array $options) {
                return URL::temporarySignedRoute(
                    'files.download',
                    $expiration,
                    array_merge($options, ['path' => $path])
                );
            }
        );
    }
}
```

<a name="temporary-upload-urls"></a>
#### 임시 업로드 URL

> [!WARNING]
> 임시 업로드 URL은 `s3` 드라이버에서만 지원됩니다.

클라이언트 사이드 애플리케이션에서 파일을 바로 업로드할 수 있는 임시 URL이 필요한 경우, `temporaryUploadUrl` 메서드를 사용할 수 있습니다. 이 메서드는 경로와 URL 만료 시점을 지정하는 `DateTime` 인스턴스를 받으며, 업로드 요청 시 함께 보내야 할 업로드 URL과 헤더가 담긴 연관 배열 형태로 반환합니다.

```php
use Illuminate\Support\Facades\Storage;

['url' => $url, 'headers' => $headers] = Storage::temporaryUploadUrl(
    'file.jpg', now()->addMinutes(5)
);
```

이 기능은 주로, 클라이언트가 Amazon S3 같은 클라우드 저장소에 직접 파일을 업로드해야 하는 서버리스 환경에서 유용하게 활용됩니다.

<a name="file-metadata"></a>
### 파일 메타데이터

파일을 읽고 쓰는 것 외에도, 라라벨은 파일 자체에 대한 정보도 제공합니다. 예를 들어, `size` 메서드를 이용하면 파일의 크기(바이트 단위)를 알 수 있습니다.

```php
use Illuminate\Support\Facades\Storage;

$size = Storage::size('file.jpg');
```

`lastModified` 메서드는 해당 파일이 마지막으로 수정된 시간의 UNIX 타임스탬프를 반환합니다.

```php
$time = Storage::lastModified('file.jpg');
```

특정 파일의 MIME 타입은 `mimeType` 메서드로 구할 수 있습니다.

```php
$mime = Storage::mimeType('file.jpg');
```

<a name="file-paths"></a>
#### 파일 경로

`path` 메서드를 사용하면 지정한 파일의 경로를 얻을 수 있습니다. `local` 드라이버를 사용할 경우 절대 경로가 반환되고, `s3` 드라이버를 사용할 경우 S3 버킷 내 상대 경로가 반환됩니다.

```php
use Illuminate\Support\Facades\Storage;

$path = Storage::path('file.jpg');
```

<a name="storing-files"></a>
## 파일 저장

`put` 메서드를 사용해 디스크에 파일 내용을 저장할 수 있습니다. 이때 PHP `resource`를 `put` 메서드에 전달해 Flysystem의 스트림 기능을 사용할 수도 있습니다. 파일 경로는 반드시 디스크의 "root" 위치 기준의 상대 경로여야 함을 잊지 마세요.

```php
use Illuminate\Support\Facades\Storage;

Storage::put('file.jpg', $contents);

Storage::put('file.jpg', $resource);
```

<a name="failed-writes"></a>
#### 파일 저장 실패 처리

`put` 메서드(또는 다른 "쓰기" 작업)가 파일을 디스크에 기록하지 못한 경우, `false`를 반환합니다.

```php
if (! Storage::put('file.jpg', $contents)) {
    // 파일을 디스크에 쓸 수 없습니다...
}
```

원한다면, 파일시스템 디스크의 설정 배열에 `throw` 옵션을 추가할 수 있습니다. 이 옵션이 `true`로 지정되면, `put` 같은 "쓰기" 메서드에서 실패가 발생할 경우 `League\Flysystem\UnableToWriteFile` 예외가 발생합니다.

```php
'public' => [
    'driver' => 'local',
    // ...
    'throw' => true,
],
```

<a name="prepending-appending-to-files"></a>
### 파일에 내용 추가 및 앞/뒤로 쓰기

`prepend` 및 `append` 메서드를 사용하면 파일의 맨 앞이나 맨 뒤에 새로운 내용을 쓸 수 있습니다.

```php
Storage::prepend('file.log', 'Prepended Text');

Storage::append('file.log', 'Appended Text');
```

<a name="copying-moving-files"></a>
### 파일 복사 및 이동

`copy` 메서드를 사용해 기존 파일을 디스크 내의 다른 위치로 복사할 수 있습니다. `move` 메서드는 파일의 이름을 수정하거나 다른 위치로 이동할 때 사용합니다.

```php
Storage::copy('old/file.jpg', 'new/file.jpg');

Storage::move('old/file.jpg', 'new/file.jpg');
```

<a name="automatic-streaming"></a>
### 자동 스트리밍

파일을 스트리밍 방식으로 저장하면 메모리 사용량을 크게 줄일 수 있습니다. 파일을 저장하고자 하는 경우 라라벨이 자동으로 스트리밍을 관리해 주도록 하려면 `putFile` 또는 `putFileAs` 메서드를 사용할 수 있습니다. 이 메서드는 `Illuminate\Http\File` 또는 `Illuminate\Http\UploadedFile` 인스턴스를 인자로 받아, 파일을 원하는 위치에 자동으로 스트리밍하여 저장합니다.

```php
use Illuminate\Http\File;
use Illuminate\Support\Facades\Storage;

// 파일명을 자동으로 고유하게 생성...
$path = Storage::putFile('photos', new File('/path/to/photo'));

// 파일명을 직접 지정하는 경우...
$path = Storage::putFileAs('photos', new File('/path/to/photo'), 'photo.jpg');
```

`putFile` 메서드와 관련해 중요한 몇 가지 사항이 있습니다. 위 예시처럼 디렉터리명만 지정하고 파일명은 지정하지 않으면, 기본적으로 `putFile` 메서드가 고유한 ID를 생성하여 파일명을 정하게 됩니다. 파일 확장자는 MIME 타입을 참조해 자동으로 결정합니다. 반환되는 값은 파일의 전체 경로(즉, 자동 생성된 파일명 포함)이며, 데이터베이스에 이 값을 저장하면 됩니다.

`putFile` 및 `putFileAs` 메서드는 파일 저장 시 "공개 여부(visibility)" 인자도 받을 수 있습니다. 특히 Amazon S3 같은 클라우드 디스크에 파일을 저장하고 URL을 통해 공개해야 하는 경우 유용합니다.

```php
Storage::putFile('photos', new File('/path/to/photo'), 'public');
```

<a name="file-uploads"></a>
### 파일 업로드

웹 애플리케이션에서는 사용자가 업로드한 사진이나 문서 등 다양한 파일을 저장하는 경우가 많습니다. 라라벨은 업로드된 파일 인스턴스의 `store` 메서드를 사용해 이를 아주 쉽게 저장할 수 있도록 해줍니다. 저장할 경로만 지정하여 `store` 메서드를 호출하면 됩니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserAvatarController extends Controller
{
    /**
     * 사용자의 아바타를 업데이트합니다.
     */
    public function update(Request $request): string
    {
        $path = $request->file('avatar')->store('avatars');

        return $path;
    }
}
```

이 예시에서 주의할 점은, 단지 디렉터리명만 지정했고 파일명을 따로 지정하지 않았다는 점입니다. 기본적으로 `store` 메서드는 고유한 ID로 파일명을 자동 생성합니다. 파일 확장자는 파일의 MIME 타입을 검사해 자동으로 결정됩니다. 반환되는 값은 파일 경로(생성된 파일명 포함)이므로, 이 경로를 데이터베이스에 저장할 수 있습니다.

위와 동일한 파일 저장 작업을 `Storage` 파사드의 `putFile` 메서드를 사용해 구현할 수도 있습니다.

```php
$path = Storage::putFile('avatars', $request->file('avatar'));
```

<a name="specifying-a-file-name"></a>

#### 파일명 지정하기

저장되는 파일의 이름이 자동으로 지정되는 것을 원하지 않는 경우, `storeAs` 메서드를 사용할 수 있습니다. 이 메서드는 경로, 파일명, 그리고 (선택적으로) 디스크명을 인수로 받습니다.

```php
$path = $request->file('avatar')->storeAs(
    'avatars', $request->user()->id
);
```

위와 동일한 파일 저장 작업을 수행하려면, `Storage` 파사드의 `putFileAs` 메서드를 사용할 수도 있습니다.

```php
$path = Storage::putFileAs(
    'avatars', $request->file('avatar'), $request->user()->id
);
```

> [!WARNING]
> 출력이 불가능한 문자(unprintable character)나 올바르지 않은 유니코드 문자는 파일 경로에서 자동으로 제거됩니다. 따라서, 라라벨 파일 저장 메서드에 파일 경로를 전달하기 전에 파일 경로를 미리 정제(sanitize)할 것을 권장합니다. 파일 경로는 `League\Flysystem\WhitespacePathNormalizer::normalizePath` 메서드를 사용해 정규화 처리됩니다.

<a name="specifying-a-disk"></a>
#### 디스크 지정하기

기본적으로 업로드된 파일의 `store` 메서드는 기본 디스크를 사용합니다. 만약 다른 디스크를 사용하려면, `store` 메서드의 두 번째 인수로 디스크명을 전달하면 됩니다.

```php
$path = $request->file('avatar')->store(
    'avatars/'.$request->user()->id, 's3'
);
```

`storeAs` 메서드를 사용하는 경우에는, 세 번째 인수로 디스크명을 지정하면 됩니다.

```php
$path = $request->file('avatar')->storeAs(
    'avatars',
    $request->user()->id,
    's3'
);
```

<a name="other-uploaded-file-information"></a>
#### 기타 업로드된 파일 정보 조회

업로드된 파일의 원래 이름이나 확장자를 알고 싶을 때는, `getClientOriginalName`과 `getClientOriginalExtension` 메서드를 사용할 수 있습니다.

```php
$file = $request->file('avatar');

$name = $file->getClientOriginalName();
$extension = $file->getClientOriginalExtension();
```

하지만, `getClientOriginalName`이나 `getClientOriginalExtension` 메서드는 사용자에 의해 파일명이나 확장자가 악의적으로 변경될 수 있으므로 안전하지 않은 메서드라는 점을 유의해야 합니다. 이러한 이유로, 일반적으로 업로드된 파일의 이름과 확장자를 구할 때는 `hashName`과 `extension` 메서드를 사용하는 것이 더 안전합니다.

```php
$file = $request->file('avatar');

$name = $file->hashName(); // 고유하고 랜덤한 이름을 생성합니다.
$extension = $file->extension(); // 파일의 MIME 타입을 기준으로 파일 확장자를 구합니다.
```

<a name="file-visibility"></a>
### 파일 공개 범위(Visibility)

라라벨의 Flysystem 연동에서는 "visibility(공개 범위)"가 여러 플랫폼에 걸친 파일 권한을 추상화한 개념입니다. 파일은 `public`(공개) 또는 `private`(비공개)로 선언할 수 있습니다. 파일이 `public`으로 선언되면, 일반적으로 다른 사용자도 접근 가능해야 함을 의미합니다. 예를 들어 S3 드라이버를 사용할 때 `public` 파일의 URL을 쉽게 가져올 수 있습니다.

파일을 저장할 때는 `put` 메서드의 세 번째 인수로 visibility를 설정할 수 있습니다.

```php
use Illuminate\Support\Facades\Storage;

Storage::put('file.jpg', $contents, 'public');
```

이미 저장된 파일의 visibility 값을 조회하거나 변경하려면, `getVisibility`와 `setVisibility` 메서드를 사용하면 됩니다.

```php
$visibility = Storage::getVisibility('file.jpg');

Storage::setVisibility('file.jpg', 'public');
```

업로드된 파일을 다룰 때 `storePublicly` 및 `storePubliclyAs` 메서드를 사용하면, `public` 공개 범위로 파일을 저장할 수 있습니다.

```php
$path = $request->file('avatar')->storePublicly('avatars', 's3');

$path = $request->file('avatar')->storePubliclyAs(
    'avatars',
    $request->user()->id,
    's3'
);
```

<a name="local-files-and-visibility"></a>
#### 로컬 파일과 공개 범위

`local` 드라이버를 사용할 때, [공개 범위(visibility)](#file-visibility)가 `public`이면 디렉터리는 `0755` 권한, 파일은 `0644` 권한으로 지정됩니다. 이러한 권한 맵핑은 애플리케이션의 `filesystems` 설정 파일에서 자유롭게 수정할 수 있습니다.

```php
'local' => [
    'driver' => 'local',
    'root' => storage_path('app'),
    'permissions' => [
        'file' => [
            'public' => 0644,
            'private' => 0600,
        ],
        'dir' => [
            'public' => 0755,
            'private' => 0700,
        ],
    ],
    'throw' => false,
],
```

<a name="deleting-files"></a>
## 파일 삭제

`delete` 메서드는 삭제할 파일명을 하나 또는 여러 개(배열)로 받을 수 있습니다.

```php
use Illuminate\Support\Facades\Storage;

Storage::delete('file.jpg');

Storage::delete(['file.jpg', 'file2.jpg']);
```

필요하다면, 파일을 삭제할 디스크를 직접 지정할 수도 있습니다.

```php
use Illuminate\Support\Facades\Storage;

Storage::disk('s3')->delete('path/file.jpg');
```

<a name="directories"></a>
## 디렉터리(폴더) 다루기

<a name="get-all-files-within-a-directory"></a>
#### 디렉터리 내 모든 파일 가져오기

`files` 메서드는 주어진 디렉터리 내의 모든 파일 목록 배열을 반환합니다. 하위 디렉터리를 포함하여 모든 파일을 가져오고 싶다면, `allFiles` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\Storage;

$files = Storage::files($directory);

$files = Storage::allFiles($directory);
```

<a name="get-all-directories-within-a-directory"></a>
#### 디렉터리 내 모든 하위 디렉터리 가져오기

`directories` 메서드는 특정 디렉터리 안의 모든 하위 디렉터리 목록을 배열로 반환합니다. 또한 `allDirectories` 메서드를 사용하면, 하위 디렉터리를 재귀적으로 모두 탐색하여 반환합니다.

```php
$directories = Storage::directories($directory);

$directories = Storage::allDirectories($directory);
```

<a name="create-a-directory"></a>
#### 디렉터리 생성하기

`makeDirectory` 메서드는 지정한 디렉터리를 생성하며, 필요한 경우 하위 디렉터리까지 자동으로 생성합니다.

```php
Storage::makeDirectory($directory);
```

<a name="delete-a-directory"></a>
#### 디렉터리 삭제하기

마지막으로, `deleteDirectory` 메서드를 사용하면 지정한 디렉터리와 그 안의 모든 파일을 한 번에 삭제할 수 있습니다.

```php
Storage::deleteDirectory($directory);
```

<a name="testing"></a>
## 테스트하기

`Storage` 파사드의 `fake` 메서드를 이용하면 가짜 디스크를 매우 쉽게 만들 수 있습니다. 이는 `Illuminate\Http\UploadedFile` 클래스의 파일 생성 유틸리티와 함께 사용하면 파일 업로드 테스트를 훨씬 간편하게 만들어줍니다. 예를 들면 다음과 같습니다.

```php tab=Pest
<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('albums can be uploaded', function () {
    Storage::fake('photos');

    $response = $this->json('POST', '/photos', [
        UploadedFile::fake()->image('photo1.jpg'),
        UploadedFile::fake()->image('photo2.jpg')
    ]);

    // 하나 또는 여러 파일이 실제로 저장되었는지 확인...
    Storage::disk('photos')->assertExists('photo1.jpg');
    Storage::disk('photos')->assertExists(['photo1.jpg', 'photo2.jpg']);

    // 하나 또는 여러 파일이 저장되지 않았는지 확인...
    Storage::disk('photos')->assertMissing('missing.jpg');
    Storage::disk('photos')->assertMissing(['missing.jpg', 'non-existing.jpg']);

    // 특정 디렉터리 내 파일 개수가 기대한 값과 일치하는지 확인...
    Storage::disk('photos')->assertCount('/wallpapers', 2);

    // 특정 디렉터리가 비어 있는지 확인...
    Storage::disk('photos')->assertDirectoryEmpty('/wallpapers');
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_albums_can_be_uploaded(): void
    {
        Storage::fake('photos');

        $response = $this->json('POST', '/photos', [
            UploadedFile::fake()->image('photo1.jpg'),
            UploadedFile::fake()->image('photo2.jpg')
        ]);

        // 하나 또는 여러 파일이 실제로 저장되었는지 확인...
        Storage::disk('photos')->assertExists('photo1.jpg');
        Storage::disk('photos')->assertExists(['photo1.jpg', 'photo2.jpg']);

        // 하나 또는 여러 파일이 저장되지 않았는지 확인...
        Storage::disk('photos')->assertMissing('missing.jpg');
        Storage::disk('photos')->assertMissing(['missing.jpg', 'non-existing.jpg']);

        // 특정 디렉터리 내 파일 개수가 기대한 값과 일치하는지 확인...
        Storage::disk('photos')->assertCount('/wallpapers', 2);

        // 특정 디렉터리가 비어 있는지 확인...
        Storage::disk('photos')->assertDirectoryEmpty('/wallpapers');
    }
}
```

기본적으로 `fake` 메서드는 해당 임시 디렉터리 내 모든 파일을 자동으로 삭제합니다. 만약 파일을 유지하고 싶다면 "persistentFake" 메서드를 사용하면 됩니다. 파일 업로드 테스트에 대한 자세한 내용은 [HTTP 테스트 문서의 파일 업로드 테스트](/docs/12.x/http-tests#testing-file-uploads) 부분을 참고하세요.

> [!WARNING]
> `image` 메서드를 사용하려면 [GD 확장 모듈](https://www.php.net/manual/en/book.image.php)이 필요합니다.

<a name="custom-filesystems"></a>
## 커스텀 파일 시스템

라라벨의 Flysystem 연동은 여러 가지 "드라이버"를 기본으로 지원하지만, Flysystem 자체는 다양한 저장소 시스템에 대한 어댑터가 제공되고 있습니다. 이 중 추가 어댑터를 라라벨 애플리케이션에서 사용하려면 커스텀 드라이버를 직접 만들어야 합니다.

커스텀 파일 시스템을 정의하려면 Flysystem 어댑터가 필요합니다. 예를 들어, 커뮤니티에서 유지 관리하는 Dropbox 어댑터를 프로젝트에 추가한다고 가정해봅니다.

```shell
composer require spatie/flysystem-dropbox
```

그 다음, 애플리케이션의 [서비스 프로바이더](/docs/12.x/providers) 중 하나의 `boot` 메서드에서 드라이버를 등록할 수 있습니다. 이를 위해서는 `Storage` 파사드의 `extend` 메서드를 사용하면 됩니다.

```php
<?php

namespace App\Providers;

use Illuminate\Contracts\Foundation\Application;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ServiceProvider;
use League\Flysystem\Filesystem;
use Spatie\Dropbox\Client as DropboxClient;
use Spatie\FlysystemDropbox\DropboxAdapter;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Storage::extend('dropbox', function (Application $app, array $config) {
            $adapter = new DropboxAdapter(new DropboxClient(
                $config['authorization_token']
            ));

            return new FilesystemAdapter(
                new Filesystem($adapter, $config),
                $adapter,
                $config
            );
        });
    }
}
```

`extend` 메서드의 첫 번째 인수는 드라이버 이름입니다. 두 번째 인수는 `$app`과 `$config` 변수를 인자로 받는 클로저이며, 이 클로저는 반드시 `Illuminate\Filesystem\FilesystemAdapter` 인스턴스를 반환해야 합니다. `$config` 변수에는 지정한 디스크에 대해 `config/filesystems.php`에 정의된 설정값들이 담겨 있습니다.

이 확장의 서비스 프로바이더를 생성 및 등록한 후에는, 이제 `config/filesystems.php` 설정 파일에서 `dropbox` 드라이버를 사용할 수 있습니다.