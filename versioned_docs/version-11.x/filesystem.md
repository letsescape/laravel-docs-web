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
    - [파일 앞뒤로 내용 추가하기](#prepending-appending-to-files)
    - [파일 복사 및 이동](#copying-moving-files)
    - [자동 스트리밍](#automatic-streaming)
    - [파일 업로드](#file-uploads)
    - [파일 공개 범위(가시성)](#file-visibility)
- [파일 삭제](#deleting-files)
- [디렉터리](#directories)
- [테스트](#testing)
- [커스텀 파일시스템](#custom-filesystems)

<a name="introduction"></a>
## 소개

라라벨은 Frank de Jonge가 만든 훌륭한 [Flysystem](https://github.com/thephpleague/flysystem) PHP 패키지 덕분에 매우 강력한 파일시스템 추상화를 제공합니다. 라라벨의 Flysystem 통합 기능을 활용하면 로컬 파일시스템, SFTP, Amazon S3 등 다양한 스토리지를 간편하게 사용할 수 있습니다. 무엇보다도, 이 API는 모든 시스템에서 동일하게 동작하므로, 로컬 개발 환경과 운영 서버 간에도 저장소 옵션을 아주 쉽게 전환할 수 있습니다.

<a name="configuration"></a>
## 설정

라라벨의 파일시스템 설정 파일은 `config/filesystems.php`에 위치합니다. 이 파일에서 모든 파일시스템 "디스크(disk)"를 설정할 수 있습니다. 각 디스크는 특정 스토리지 드라이버와 스토리지 위치를 나타냅니다. 모든 지원 드라이버에 대한 예시 설정이 이 파일에 기본 포함되어 있으므로, 여러분의 저장소 환경에 맞게 수정해서 사용할 수 있습니다.

`local` 드라이버는 라라벨 애플리케이션이 실행되는 서버에 실제로 저장된 파일과 상호작용하며, `s3` 드라이버는 Amazon의 S3 클라우드 스토리지 서비스에 파일을 저장하는 데 사용합니다.

> [!NOTE]  
> 원하는 만큼 여러 개의 디스크를 설정할 수 있으며, 동일한 드라이버를 사용하는 디스크도 여러 개 생성할 수 있습니다.

<a name="the-local-driver"></a>
### 로컬 드라이버

`local` 드라이버를 사용할 때는, 모든 파일 작업이 `filesystems` 설정 파일에 정의된 `root` 디렉터리를 기준으로 상대 경로로 처리됩니다. 기본적으로 `root`는 `storage/app/private`로 설정되어 있습니다. 따라서, 아래의 메서드는 `storage/app/private/example.txt` 경로에 파일을 작성합니다.

```
use Illuminate\Support\Facades\Storage;

Storage::disk('local')->put('example.txt', 'Contents');
```

<a name="the-public-disk"></a>
### 퍼블릭 디스크

애플리케이션의 `filesystems` 설정 파일에 포함된 `public` 디스크는 외부에 공개적으로 접근 가능한 파일을 저장할 목적으로 사용합니다. 기본적으로 `public` 디스크는 `local` 드라이버를 사용하며, 파일을 `storage/app/public` 경로에 저장합니다.

만약 여러분의 `public` 디스크가 `local` 드라이버를 사용하고 있고, 이 파일들을 웹에서 접근 가능하게 하려면, 소스 디렉터리 `storage/app/public`에서 대상 디렉터리 `public/storage`로 심볼릭 링크를 생성해야 합니다.

심볼릭 링크를 만들려면, `storage:link` Artisan 명령어를 사용하면 됩니다.

```shell
php artisan storage:link
```

파일을 저장하고 심볼릭 링크를 생성하면, `asset` 헬퍼 함수를 사용해 해당 파일의 URL을 생성할 수 있습니다.

```
echo asset('storage/file.txt');
```

추가적으로 심볼릭 링크를 더 만들고 싶을 때는, `filesystems` 설정 파일에서 링크를 추가할 수 있습니다. 설정된 각 링크는 `storage:link` 명령어 실행 시 자동으로 생성됩니다.

```
'links' => [
    public_path('storage') => storage_path('app/public'),
    public_path('images') => storage_path('app/images'),
],
```

설정해둔 심볼릭 링크를 제거하고 싶을 때는 `storage:unlink` 명령어를 사용할 수 있습니다.

```shell
php artisan storage:unlink
```

<a name="driver-prerequisites"></a>
### 드라이버 사전 준비 사항

<a name="s3-driver-configuration"></a>
#### S3 드라이버 설정

S3 드라이버를 사용하려면, Composer 패키지 매니저를 통해 Flysystem S3 패키지를 먼저 설치해야 합니다.

```shell
composer require league/flysystem-aws-s3-v3 "^3.0" --with-all-dependencies
```

S3 디스크 설정 배열은 `config/filesystems.php` 설정 파일에 포함되어 있습니다. 보통, 아래와 같은 환경변수를 통해 S3 관련 정보와 자격증명을 설정하고, 이 환경변수 값은 `config/filesystems.php`에서 참조됩니다.

```
AWS_ACCESS_KEY_ID=<your-key-id>
AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=<your-bucket-name>
AWS_USE_PATH_STYLE_ENDPOINT=false
```

이 환경변수들은 AWS CLI에서 사용하는 규칙과 이름이 동일해, 관리하기 편리합니다.

<a name="ftp-driver-configuration"></a>
#### FTP 드라이버 설정

FTP 드라이버를 사용하려면 먼저 Composer 패키지 매니저를 사용해서 Flysystem FTP 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-ftp "^3.0"
```

라라벨의 Flysystem 통합은 FTP와도 잘 작동합니다. 다만, 프레임워크 기본 `config/filesystems.php` 파일에는 예시 설정이 포함되어 있지 않으므로, FTP 파일시스템을 사용하려면 아래 예시를 참고해 직접 구성할 수 있습니다.

```
'ftp' => [
    'driver' => 'ftp',
    'host' => env('FTP_HOST'),
    'username' => env('FTP_USERNAME'),
    'password' => env('FTP_PASSWORD'),

    // 선택적인 FTP 설정...
    // 'port' => env('FTP_PORT', 21),
    // 'root' => env('FTP_ROOT'),
    // 'passive' => true,
    // 'ssl' => true,
    // 'timeout' => 30,
],
```

<a name="sftp-driver-configuration"></a>
#### SFTP 드라이버 설정

SFTP 드라이버를 사용하려면 Composer 패키지 매니저를 통해 Flysystem SFTP 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-sftp-v3 "^3.0"
```

라라벨의 Flysystem 통합은 SFTP와도 훌륭하게 연동됩니다. 기본 `config/filesystems.php` 설정 파일에는 SFTP 설정 예시가 없으므로, SFTP 파일시스템이 필요하다면 아래와 같이 구성할 수 있습니다.

```
'sftp' => [
    'driver' => 'sftp',
    'host' => env('SFTP_HOST'),

    // 기본 인증을 위한 설정...
    'username' => env('SFTP_USERNAME'),
    'password' => env('SFTP_PASSWORD'),

    // SSH 키 기반 인증(암호 사용)을 위한 설정...
    'privateKey' => env('SFTP_PRIVATE_KEY'),
    'passphrase' => env('SFTP_PASSPHRASE'),

    // 파일/디렉터리 권한 설정...
    'visibility' => 'private', // `private` = 0600, `public` = 0644
    'directory_visibility' => 'private', // `private` = 0700, `public` = 0755

    // 선택적인 SFTP 설정...
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

스코프 디스크(scoped disk)는 파일 경로 앞에 지정한 경로(prefix)를 자동으로 붙이는 파일시스템을 만들 수 있게 해줍니다. 스코프 파일시스템을 만들려면 먼저 Composer 패키지 매니저를 사용해서 추가적인 Flysystem 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-path-prefixing "^3.0"
```

이미 존재하는 파일시스템 디스크를 기반으로, `scoped` 드라이버를 이용해서 경로 스코프 인스턴스를 만들 수 있습니다. 예를 들어, 기존의 `s3` 디스크를 특정 경로(prefix)로 제한하는 스코프 디스크를 만들면, 이 디스크로 하는 모든 파일 작업이 지정된 prefix를 자동으로 사용합니다.

```php
's3-videos' => [
    'driver' => 'scoped',
    'disk' => 's3',
    'prefix' => 'path/to/videos',
],
```

"읽기 전용(read-only)" 디스크는 파일을 쓸 수 없는 파일시스템 디스크를 만듭니다. `read-only` 설정을 사용하기 전에 Composer 패키지 매니저를 통해 추가 Flysystem 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-read-only "^3.0"
```

이제 디스크의 설정 배열에 `read-only` 옵션을 추가하면 됩니다.

```php
's3-videos' => [
    'driver' => 's3',
    // ...
    'read-only' => true,
],
```

<a name="amazon-s3-compatible-filesystems"></a>
### Amazon S3 호환 파일시스템

애플리케이션의 `filesystems` 설정 파일에는 기본적으로 `s3` 디스크 설정이 포함되어 있습니다. [Amazon S3](https://aws.amazon.com/s3/)와 연동하는 것 외에도, [MinIO](https://github.com/minio/minio), [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/), [Vultr Object Storage](https://www.vultr.com/products/object-storage/), [Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/), [Hetzner Cloud Storage](https://www.hetzner.com/storage/object-storage/) 등 다양한 S3 호환 스토리지 서비스와 연동할 수 있습니다.

보통, 사용하려는 서비스의 자격증명 정보에 맞게 디스크의 설정을 변경한 후, `endpoint` 설정값만 알맞게 바꿔주면 됩니다. 이 값은 보통 `AWS_ENDPOINT` 환경변수를 통해 지정합니다.

```
'endpoint' => env('AWS_ENDPOINT', 'https://minio:9000'),
```

<a name="minio"></a>
#### MinIO

MinIO와 함께 라라벨의 Flysystem 통합 기능을 사용할 때, 올바른 URL이 생성되도록 `AWS_URL` 환경변수를 아래처럼 애플리케이션의 로컬 URL과 버킷 이름을 포함하여 설정해야 합니다.

```ini
AWS_URL=http://localhost:9000/local
```

> [!WARNING]  
> MinIO에서 `temporaryUrl` 메서드를 사용해 임시 스토리지 URL을 만들 때, 만약 `endpoint`가 클라이언트에서 접근 불가하면 임시 URL이 정상적으로 동작하지 않을 수 있습니다.

<a name="obtaining-disk-instances"></a>
## 디스크 인스턴스 얻기

`Storage` 파사드를 사용하여 설정된 모든 디스크와 상호작용할 수 있습니다. 예를 들어, `put` 메서드를 사용하여 기본 디스크에 아바타 이미지를 저장할 수 있습니다. `Storage` 파사드에서 `disk` 메서드를 사용하지 않고 바로 메서드를 호출하면, 자동으로 기본 디스크에 동작이 위임됩니다.

```
use Illuminate\Support\Facades\Storage;

Storage::put('avatars/1', $content);
```

애플리케이션이 여러 디스크를 다룰 경우, `Storage` 파사드의 `disk` 메서드를 사용해 특정 디스크에서 파일 작업을 할 수 있습니다.

```
Storage::disk('s3')->put('avatars/1', $content);
```

<a name="on-demand-disks"></a>
### 온디맨드 디스크

종종, 애플리케이션의 `filesystems` 설정 파일에 미리 정의하지 않은 구성을 기반으로 런타임에 디스크를 만들어야 할 때가 있습니다. 이럴 때는 설정 배열을 `Storage` 파사드의 `build` 메서드에 전달하면 됩니다.

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

`get` 메서드를 사용하면 파일의 내용을 가져올 수 있습니다. 이 메서드는 파일의 원본 문자열 내용을 반환합니다. 모든 파일 경로는 디스크의 "root" 위치를 기준으로 상대 경로로 지정해야 한다는 점을 꼭 기억하십시오.

```
$contents = Storage::get('file.jpg');
```

만약 가져오려는 파일이 JSON 형태라면, 파일을 가져온 뒤 바로 디코딩할 수 있도록 `json` 메서드를 사용할 수 있습니다.

```
$orders = Storage::json('orders.json');
```

`exists` 메서드는 디스크에 특정 파일이 존재하는지 확인할 때 사용합니다.

```
if (Storage::disk('s3')->exists('file.jpg')) {
    // ...
}
```

`missing` 메서드는 디스크에 특정 파일이 없는지 확인할 때 사용합니다.

```
if (Storage::disk('s3')->missing('file.jpg')) {
    // ...
}
```

<a name="downloading-files"></a>
### 파일 다운로드

`download` 메서드를 사용하면 주어진 경로의 파일을 사용자의 브라우저가 강제로 다운로드하도록 하는 응답을 생성할 수 있습니다. 두 번째 인수로 파일 이름을 지정하면, 사용자가 다운로드 받을 때 보이는 이름을 지정할 수 있습니다. 마지막 인수로는 HTTP 헤더 배열을 추가로 전달할 수 있습니다.

```
return Storage::download('file.jpg');

return Storage::download('file.jpg', $name, $headers);
```

<a name="file-urls"></a>
### 파일 URL

`url` 메서드를 사용하여 특정 파일의 URL을 가져올 수 있습니다. `local` 드라이버를 사용할 경우, 보통 `/storage`가 경로 앞에 붙어서 파일의 상대 URL을 반환합니다. 만약 `s3` 드라이버를 사용한다면 완전한 원격 URL이 반환됩니다.

```
use Illuminate\Support\Facades\Storage;

$url = Storage::url('file.jpg');
```

`local` 드라이버를 사용할 때, 공개적으로 접근 가능한 모든 파일은 반드시 `storage/app/public` 디렉터리에 저장해야 합니다. 또한, `public/storage` 경로에 [심볼릭 링크를 생성](#the-public-disk)하여 `storage/app/public`을 가리키게 해야 합니다.

> [!WARNING]  
> `local` 드라이버를 사용할 때, `url`에서 반환되는 값은 URL 인코딩이 적용되지 않습니다. 따라서, 항상 올바른 URL이 생성될 수 있도록 파일명을 지정해서 저장하시는 것을 권장합니다.

<a name="url-host-customization"></a>
#### URL 호스트 커스터마이징

`Storage` 파사드를 사용해 생성되는 URL의 호스트를 변경하고 싶을 때는, 디스크 설정 배열에서 `url` 옵션을 추가하거나 변경하면 됩니다.

```
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

`temporaryUrl` 메서드를 이용하면 `local`, `s3` 드라이버로 저장된 파일에 대해 임시로 접근 가능한 URL을 만들 수 있습니다. 메서드에는 경로와, URL 만료 시점을 지정하는 `DateTime` 인스턴스를 넘겨줍니다.

```
use Illuminate\Support\Facades\Storage;

$url = Storage::temporaryUrl(
    'file.jpg', now()->addMinutes(5)
);
```

<a name="enabling-local-temporary-urls"></a>
#### 로컬 임시 URL 활성화

`local` 드라이버에서 임시 URL 지원이 도입되기 전에 애플리케이션을 개발했다면, 로컬 임시 URL 기능을 따로 활성화해야 할 수 있습니다. `config/filesystems.php` 설정 파일의 `local` 디스크 배열에 `serve` 옵션을 추가하면 효과를 볼 수 있습니다.

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

추가적인 [S3 요청 파라미터](https://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectGET.html#RESTObjectGET-requests)가 필요할 경우, request 파라미터 배열을 `temporaryUrl` 메서드의 세 번째 인수로 전달할 수 있습니다.

```
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
#### 임시 URL 커스터마이징

특정 스토리지 디스크에서 임시 URL을 만드는 방식을 맞춤화해야 하는 경우, `buildTemporaryUrlsUsing` 메서드를 사용할 수 있습니다. 예를 들어, 별도의 컨트롤러로 파일 다운로드를 지원해야 하거나 일반적으로 임시 URL을 지원하지 않는 디스크에서 임시 URL이 필요할 때 유용합니다. 일반적으로 이 메서드는 서비스 프로바이더의 `boot` 메서드에서 호출해야 합니다.

```
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
> 임시 업로드 URL 생성 기능은 `s3` 드라이버에서만 지원됩니다.

클라이언트 사이드 애플리케이션에서 파일을 직접 업로드할 수 있도록 임시 업로드 URL을 만들려면, `temporaryUploadUrl` 메서드를 사용하면 됩니다. 이 메서드에는 파일 경로와 URL이 만료되는 시점을 나타내는 `DateTime` 인스턴스를 전달합니다. `temporaryUploadUrl` 메서드는 업로드에 사용할 URL과 HTTP 헤더가 포함된 연관 배열을 반환하며, 이를 각각 변수로 분해할 수 있습니다.

```
use Illuminate\Support\Facades\Storage;

['url' => $url, 'headers' => $headers] = Storage::temporaryUploadUrl(
    'file.jpg', now()->addMinutes(5)
);
```

이 기능은 주로 서버리스 환경에서, 클라이언트 쪽에서 Amazon S3와 같은 클라우드 스토리지로 직접 파일 업로드가 필요한 경우 유용하게 쓰입니다.

<a name="file-metadata"></a>
### 파일 메타데이터

파일의 읽기와 쓰기 이외에도, 라라벨은 파일 자체에 대한 정보를 제공할 수 있습니다. 예를 들어, `size` 메서드는 파일의 크기를 바이트 단위로 반환합니다.

```
use Illuminate\Support\Facades\Storage;

$size = Storage::size('file.jpg');
```

`lastModified` 메서드는 해당 파일이 마지막으로 수정된 시점의 UNIX 타임스탬프를 반환합니다.

```
$time = Storage::lastModified('file.jpg');
```

지정한 파일의 MIME 타입은 `mimeType` 메서드로 알아낼 수 있습니다.

```
$mime = Storage::mimeType('file.jpg');
```

<a name="file-paths"></a>
#### 파일 경로

`path` 메서드를 사용하면 파일의 전체 경로를 얻을 수 있습니다. `local` 드라이버를 쓰는 경우에는 파일의 절대 경로를, `s3` 드라이버를 쓰는 경우에는 S3 버킷 내의 상대 경로를 반환합니다.

```
use Illuminate\Support\Facades\Storage;

$path = Storage::path('file.jpg');
```

<a name="storing-files"></a>
## 파일 저장

`put` 메서드를 사용하면 특정 디스크에 파일 내용을 저장할 수 있습니다. 또한 PHP의 `resource`를 `put` 메서드에 전달하여 Flysystem이 스트림 기능을 그대로 활용할 수 있습니다. 모든 파일 경로는 디스크의 "root" 위치를 기준으로 상대경로로 지정하는 것을 잊지 마세요.

```
use Illuminate\Support\Facades\Storage;

Storage::put('file.jpg', $contents);

Storage::put('file.jpg', $resource);
```

<a name="failed-writes"></a>
#### 쓰기 실패

만약 `put` 메서드(또는 다른 "쓰기" 작업)가 파일을 디스크에 쓸 수 없다면, `false`를 반환합니다.

```
if (! Storage::put('file.jpg', $contents)) {
    // 파일을 디스크에 쓸 수 없습니다...
}
```

원한다면, 파일시스템 디스크의 설정 배열에서 `throw` 옵션을 정의할 수 있습니다. 이 옵션이 `true`로 되어 있으면, `put`과 같은 "쓰기" 메서드가 실패할 때 `League\Flysystem\UnableToWriteFile` 예외를 발생시키게 됩니다.

```
'public' => [
    'driver' => 'local',
    // ...
    'throw' => true,
],
```

<a name="prepending-appending-to-files"></a>
### 파일 앞뒤로 내용 추가하기

`prepend`와 `append` 메서드를 이용하면 파일의 맨 앞이나 맨 뒤에 내용을 추가할 수 있습니다.

```
Storage::prepend('file.log', 'Prepended Text');

Storage::append('file.log', 'Appended Text');
```

<a name="copying-moving-files"></a>
### 파일 복사 및 이동

`copy` 메서드는 기존 파일을 디스크 내의 새 위치로 복사할 때 사용하며, `move` 메서드는 기존 파일의 이름을 바꾸거나 위치를 변경할 때 사용합니다.

```
Storage::copy('old/file.jpg', 'new/file.jpg');

Storage::move('old/file.jpg', 'new/file.jpg');
```

<a name="automatic-streaming"></a>
### 자동 스트리밍

파일을 스트림 방식으로 스토리지에 저장하면 메모리 사용량을 크게 줄일 수 있습니다. 라라벨이 파일을 자동으로 스트리밍 방식으로 저장하도록 하려면, `putFile` 또는 `putFileAs` 메서드를 사용하세요. 이 메서드는 `Illuminate\Http\File` 또는 `Illuminate\Http\UploadedFile` 인스턴스를 받아서 파일을 원하는 위치로 자동 스트리밍합니다.

```
use Illuminate\Http\File;
use Illuminate\Support\Facades\Storage;

// 파일명에 대한 고유 ID를 자동 생성...
$path = Storage::putFile('photos', new File('/path/to/photo'));

// 파일명을 직접 명시...
$path = Storage::putFileAs('photos', new File('/path/to/photo'), 'photo.jpg');
```

`putFile` 메서드와 관련해 중요한 점이 몇 가지 있습니다. 먼저, 디렉터리 이름만 지정하고 파일명을 따로 지정하지 않아도 된다는 점입니다. 기본적으로 `putFile` 메서드는 고유 ID로 파일명을 자동 생성합니다. 파일의 확장자는 파일의 MIME 타입을 확인해서 결정됩니다. 이 메서드는 파일의 전체 경로(자동 생성된 파일명 포함)를 반환하므로, 데이터베이스 등에 해당 경로를 저장해 둘 수 있습니다.

`putFile` 및 `putFileAs` 메서드는 저장되는 파일의 "가시성(visibility)"을 지정하는 인수도 받을 수 있습니다. 예를 들어 Amazon S3와 같은 클라우드 디스크에 파일을 저장하고, 해당 파일이 생성된 URL로 공개적으로 접근 가능하게 하고 싶을 때 특히 유용합니다.

```
Storage::putFile('photos', new File('/path/to/photo'), 'public');
```

<a name="file-uploads"></a>
### 파일 업로드

웹 애플리케이션에서 파일 저장의 가장 흔한 예는 사용자 업로드 파일(사진, 문서 등)을 저장하는 경우입니다. 라라벨에서는 업로드 파일 인스턴스의 `store` 메서드를 사용하여 사용자 파일 저장을 매우 쉽게 처리할 수 있습니다. 파일을 저장할 경로만 지정해서 `store` 메서드를 호출하면 됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserAvatarController extends Controller
{
    /**
     * 사용자의 아바타 이미지를 업데이트합니다.
     */
    public function update(Request $request): string
    {
        $path = $request->file('avatar')->store('avatars');

        return $path;
    }
}
```

이 예제에 관해 중요한 점이 몇 가지 있습니다. 디렉터리 이름만 명시했고, 파일명은 지정하지 않았다는 점을 주목하세요. 기본적으로 `store` 메서드는 고유 ID를 자동으로 생성하여 파일명으로 사용합니다. 파일의 확장자는 MIME 타입을 통해 결정되며, 실제 저장된 전체 경로(파일명 포함)는 `store` 메서드가 반환하므로, 데이터베이스 등에 이 값을 저장해두면 됩니다.

동일한 파일 저장 작업을 `Storage` 파사드의 `putFile` 메서드로도 할 수 있습니다.

```
$path = Storage::putFile('avatars', $request->file('avatar'));
```

<a name="specifying-a-file-name"></a>

#### 파일 이름 지정하기

저장된 파일에 자동으로 파일 이름이 할당되는 것을 원하지 않는 경우, `storeAs` 메서드를 사용할 수 있습니다. 이 메서드는 경로, 파일 이름, 그리고 (선택 사항으로) 디스크명을 인수로 받습니다:

```
$path = $request->file('avatar')->storeAs(
    'avatars', $request->user()->id
);
```

또한, `Storage` 파사드의 `putFileAs` 메서드를 사용해서 위와 동일한 파일 저장 작업을 수행할 수 있습니다:

```
$path = Storage::putFileAs(
    'avatars', $request->file('avatar'), $request->user()->id
);
```

> [!WARNING]  
> 출력이 불가능하거나 유효하지 않은 유니코드 문자는 파일 경로에서 자동으로 제거됩니다. 따라서 파일 경로를 라라벨의 파일 저장 메서드에 전달하기 전에 미리 정제(필요 없는 문자 제거)하는 것을 권장합니다. 파일 경로는 `League\Flysystem\WhitespacePathNormalizer::normalizePath` 메서드를 사용하여 정규화됩니다.

<a name="specifying-a-disk"></a>
#### 디스크 지정하기

기본적으로, 업로드된 파일의 `store` 메서드는 기본 디스크를 사용합니다. 다른 디스크를 지정하고 싶다면, 디스크 이름을 `store` 메서드의 두 번째 인수로 전달하면 됩니다:

```
$path = $request->file('avatar')->store(
    'avatars/'.$request->user()->id, 's3'
);
```

`storeAs` 메서드를 사용할 때는 디스크 이름을 세 번째 인수로 전달할 수 있습니다:

```
$path = $request->file('avatar')->storeAs(
    'avatars',
    $request->user()->id,
    's3'
);
```

<a name="other-uploaded-file-information"></a>
#### 업로드된 파일의 추가 정보 확인

업로드된 파일의 원래 이름과 확장자를 가져오고 싶다면, `getClientOriginalName` 및 `getClientOriginalExtension` 메서드를 사용할 수 있습니다:

```
$file = $request->file('avatar');

$name = $file->getClientOriginalName();
$extension = $file->getClientOriginalExtension();
```

하지만 `getClientOriginalName`과 `getClientOriginalExtension` 메서드는 안전하지 않은 방법입니다. 악의적인 사용자가 파일 이름이나 확장자를 조작할 수 있기 때문입니다. 따라서 보통은 파일 이름과 확장자를 얻을 때 `hashName`과 `extension` 메서드를 사용하는 것이 좋습니다:

```
$file = $request->file('avatar');

$name = $file->hashName(); // 고유하고 무작위로 생성된 이름을 반환합니다...
$extension = $file->extension(); // 파일의 MIME 타입을 기반으로 확장자를 결정합니다...
```

<a name="file-visibility"></a>
### 파일 공개 범위(Visibility)

라라벨의 Flysystem 통합에서 "공개 범위(visibility)"란 여러 플랫폼에서 파일 권한을 추상화한 개념입니다. 파일은 `public` 또는 `private`으로 설정할 수 있습니다. `public`으로 선언하면 해당 파일은 일반적으로 다른 사람이 접근할 수 있음을 의미하며, 예를 들어 S3 드라이버를 사용할 때는 `public` 파일의 URL을 가져올 수 있습니다.

파일을 쓸 때 `put` 메서드를 사용해서 공개 범위를 지정할 수 있습니다:

```
use Illuminate\Support\Facades\Storage;

Storage::put('file.jpg', $contents, 'public');
```

이미 저장된 파일의 공개 범위는 `getVisibility` 및 `setVisibility` 메서드를 통해 확인하거나 변경할 수 있습니다:

```
$visibility = Storage::getVisibility('file.jpg');

Storage::setVisibility('file.jpg', 'public');
```

업로드된 파일을 다룰 때는 `storePublicly` 및 `storePubliclyAs` 메서드를 사용해서 `public` 공개 범위로 파일을 저장할 수 있습니다:

```
$path = $request->file('avatar')->storePublicly('avatars', 's3');

$path = $request->file('avatar')->storePubliclyAs(
    'avatars',
    $request->user()->id,
    's3'
);
```

<a name="local-files-and-visibility"></a>
#### 로컬 파일과 공개 범위

`local` 드라이버를 사용할 때 `public` [공개 범위](#file-visibility)는 디렉터리에는 `0755`, 파일에는 `0644` 권한으로 변환됩니다. 이 권한 매핑은 애플리케이션의 `filesystems` 설정 파일에서 수정할 수 있습니다:

```
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
## 파일 삭제하기

`delete` 메서드는 하나의 파일명 또는 삭제할 파일들의 배열을 인수로 받을 수 있습니다:

```
use Illuminate\Support\Facades\Storage;

Storage::delete('file.jpg');

Storage::delete(['file.jpg', 'file2.jpg']);
```

필요하다면, 파일을 삭제할 디스크를 지정할 수도 있습니다:

```
use Illuminate\Support\Facades\Storage;

Storage::disk('s3')->delete('path/file.jpg');
```

<a name="directories"></a>
## 디렉터리(폴더)

<a name="get-all-files-within-a-directory"></a>
#### 디렉터리 내 모든 파일 가져오기

`files` 메서드는 주어진 디렉터리 내 모든 파일의 배열을 반환합니다. 하위 디렉터리까지 포함한 모든 파일을 가져오고 싶다면 `allFiles` 메서드를 사용할 수 있습니다:

```
use Illuminate\Support\Facades\Storage;

$files = Storage::files($directory);

$files = Storage::allFiles($directory);
```

<a name="get-all-directories-within-a-directory"></a>
#### 디렉터리 내 모든 하위 디렉터리 가져오기

`directories` 메서드는 주어진 디렉터리 내 모든 하위 디렉터리의 배열을 반환합니다. 또한, `allDirectories` 메서드를 사용하면 지정한 디렉터리와 그 하위 디렉터리 전체의 모든 디렉터리 목록을 가져올 수 있습니다:

```
$directories = Storage::directories($directory);

$directories = Storage::allDirectories($directory);
```

<a name="create-a-directory"></a>
#### 디렉터리 생성하기

`makeDirectory` 메서드는 필요한 하위 디렉터리를 포함하여 지정한 디렉터리를 생성합니다:

```
Storage::makeDirectory($directory);
```

<a name="delete-a-directory"></a>
#### 디렉터리 삭제하기

마지막으로, `deleteDirectory` 메서드를 사용하면 해당 디렉터리와 그 안의 모든 파일을 제거할 수 있습니다:

```
Storage::deleteDirectory($directory);
```

<a name="testing"></a>
## 테스트

`Storage` 파사드의 `fake` 메서드를 사용하면 임시 디스크를 손쉽게 생성할 수 있습니다. 이를 `Illuminate\Http\UploadedFile` 클래스의 파일 생성 도구와 함께 사용하면 파일 업로드 테스트가 훨씬 간편해집니다. 예시:

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

    // 하나 이상의 파일이 저장되었는지 확인...
    Storage::disk('photos')->assertExists('photo1.jpg');
    Storage::disk('photos')->assertExists(['photo1.jpg', 'photo2.jpg']);

    // 하나 이상의 파일이 저장되지 않았는지 확인...
    Storage::disk('photos')->assertMissing('missing.jpg');
    Storage::disk('photos')->assertMissing(['missing.jpg', 'non-existing.jpg']);

    // 특정 디렉터리 내 파일 수가 기대한 값과 일치하는지 확인...
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

        // 하나 이상의 파일이 저장되었는지 확인...
        Storage::disk('photos')->assertExists('photo1.jpg');
        Storage::disk('photos')->assertExists(['photo1.jpg', 'photo2.jpg']);

        // 하나 이상의 파일이 저장되지 않았는지 확인...
        Storage::disk('photos')->assertMissing('missing.jpg');
        Storage::disk('photos')->assertMissing(['missing.jpg', 'non-existing.jpg']);

        // 특정 디렉터리 내 파일 수가 기대한 값과 일치하는지 확인...
        Storage::disk('photos')->assertCount('/wallpapers', 2);

        // 특정 디렉터리가 비어 있는지 확인...
        Storage::disk('photos')->assertDirectoryEmpty('/wallpapers');
    }
}
```

기본적으로 `fake` 메서드는 임시 디렉터리의 모든 파일을 삭제합니다. 이러한 파일을 유지하고 싶다면 `"persistentFake"` 메서드를 사용할 수 있습니다. 파일 업로드 테스트에 대한 자세한 내용은 [HTTP 테스트 문서의 파일 업로드 관련 부분](/docs/11.x/http-tests#testing-file-uploads)을 참고하세요.

> [!WARNING]  
> `image` 메서드를 사용하려면 [GD 확장 기능](https://www.php.net/manual/en/book.image.php)이 필요합니다.

<a name="custom-filesystems"></a>
## 커스텀 파일 시스템

라라벨의 Flysystem 통합은 여러 종류의 "드라이버"를 기본적으로 지원합니다. 하지만 Flysystem은 이 드라이버들에만 한정되지 않고, 다양한 스토리지 시스템용 어댑터를 추가로 제공합니다. 이러한 어댑터 중 하나를 라라벨 애플리케이션에서 사용하고 싶다면 커스텀 드라이버를 직접 생성할 수 있습니다.

커스텀 파일 시스템을 정의하려면 Flysystem 어댑터가 필요합니다. 예를 들어, 커뮤니티에서 관리하는 Dropbox 어댑터를 프로젝트에 추가해 보겠습니다:

```shell
composer require spatie/flysystem-dropbox
```

다음으로, 애플리케이션의 [서비스 프로바이더](/docs/11.x/providers) 중 하나의 `boot` 메서드에서 드라이버를 등록할 수 있습니다. 이 작업을 위해서는 `Storage` 파사드의 `extend` 메서드를 사용합니다:

```
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

`extend` 메서드의 첫 번째 인수는 드라이버의 이름이고, 두 번째 인수는 `$app`과 `$config` 변수를 받는 클로저입니다. 이 클로저는 반드시 `Illuminate\Filesystem\FilesystemAdapter`의 인스턴스를 반환해야 합니다. `$config` 변수에는 지정한 디스크에 대해 `config/filesystems.php`에서 정의한 값이 들어 있습니다.

이 확장 서비스 프로바이더를 생성 및 등록한 후에는, `config/filesystems.php` 설정 파일에서 `dropbox` 드라이버를 사용할 수 있습니다.