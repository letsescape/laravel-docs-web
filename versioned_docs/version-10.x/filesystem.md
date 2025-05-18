# 파일 스토리지 (File Storage)

- [소개](#introduction)
- [설정](#configuration)
    - [로컬 드라이버](#the-local-driver)
    - [퍼블릭 디스크](#the-public-disk)
    - [드라이버 사전 준비 사항](#driver-prerequisites)
    - [스코프 및 읽기 전용 파일 시스템](#scoped-and-read-only-filesystems)
    - [Amazon S3 호환 파일 시스템](#amazon-s3-compatible-filesystems)
- [디스크 인스턴스 얻기](#obtaining-disk-instances)
    - [온디맨드 디스크](#on-demand-disks)
- [파일 가져오기](#retrieving-files)
    - [파일 다운로드](#downloading-files)
    - [파일 URL](#file-urls)
    - [임시 URL](#temporary-urls)
    - [파일 메타데이터](#file-metadata)
- [파일 저장](#storing-files)
    - [파일에 내용 추가 및 덧붙이기](#prepending-appending-to-files)
    - [파일 복사 및 이동](#copying-moving-files)
    - [자동 스트리밍](#automatic-streaming)
    - [파일 업로드](#file-uploads)
    - [파일 공개 여부(Visibility)](#file-visibility)
- [파일 삭제](#deleting-files)
- [디렉터리](#directories)
- [테스트](#testing)
- [커스텀 파일 시스템](#custom-filesystems)

<a name="introduction"></a>
## 소개

Laravel은 Frank de Jonge의 훌륭한 [Flysystem](https://github.com/thephpleague/flysystem) PHP 패키지를 이용해 강력한 파일 시스템 추상화 기능을 제공합니다. Laravel의 Flysystem 통합을 통해 로컬 파일 시스템, SFTP, Amazon S3와 손쉽게 연동할 수 있습니다. 더 좋은 점은, 로컬 개발 환경이든 서버든 같은 API로 다양한 스토리지 옵션을 손쉽게 전환할 수 있다는 점입니다.

<a name="configuration"></a>
## 설정

Laravel의 파일 시스템 설정 파일은 `config/filesystems.php`에 위치합니다. 이 파일에서 모든 파일 시스템 "디스크"를 설정할 수 있습니다. 각 디스크는 특정 스토리지 드라이버와 저장 위치를 의미합니다. 각 지원 드라이버에 대한 예시 설정이 포함되어 있으니, 이를 참고하여 원하는 스토리지 및 인증 정보를 반영하면 됩니다.

`local` 드라이버는 라라벨 애플리케이션이 실행 중인 서버의 로컬 파일을 다룰 때 사용하고, `s3` 드라이버는 Amazon의 S3 클라우드 스토리지 서비스에 파일을 쓸 때 사용합니다.

> [!NOTE]
> 원하는 만큼 디스크를 설정할 수 있으며, 동일한 드라이버를 사용하는 여러 디스크도 문제없이 구성할 수 있습니다.

<a name="the-local-driver"></a>
### 로컬 드라이버

`local` 드라이버를 사용할 때, 모든 파일 작업은 `filesystems` 설정 파일에 정의된 `root` 디렉터리를 기준으로 상대 경로로 처리됩니다. 기본적으로 이 값은 `storage/app` 디렉터리로 지정되어 있습니다. 따라서 아래 메서드는 `storage/app/example.txt`에 파일을 기록합니다.

```
use Illuminate\Support\Facades\Storage;

Storage::disk('local')->put('example.txt', 'Contents');
```

<a name="the-public-disk"></a>
### 퍼블릭 디스크

애플리케이션의 `filesystems` 설정 파일에 포함된 `public` 디스크는 외부에서 접근할 수 있어야 하는 파일을 위한 디스크입니다. 기본적으로 `public` 디스크는 `local` 드라이버를 사용하고, 파일을 `storage/app/public`에 저장합니다.

이 파일들을 웹에서 접근 가능하도록 하려면, `public/storage`와 `storage/app/public` 사이에 심볼릭 링크를 생성해야 합니다. 이런 폴더 구조를 사용하면, [Envoyer](https://envoyer.io)와 같은 무중단 배포 시스템을 이용할 때도 공개 파일 관리를 훨씬 효율적으로 할 수 있습니다.

심볼릭 링크를 생성하려면, `storage:link` Artisan 명령어를 사용하세요.

```shell
php artisan storage:link
```

파일이 저장되고 심볼릭 링크가 생성되면, `asset` 헬퍼를 이용해 파일의 URL을 만들 수 있습니다.

```
echo asset('storage/file.txt');
```

추가로 심볼릭 링크가 필요하다면, `filesystems` 설정 파일에 원하는 링크를 추가할 수 있습니다. 설정된 링크는 `storage:link` 명령 실행 시 자동으로 생성됩니다.

```
'links' => [
    public_path('storage') => storage_path('app/public'),
    public_path('images') => storage_path('app/images'),
],
```

설정한 심볼릭 링크를 삭제하려면 `storage:unlink` 명령을 사용할 수 있습니다.

```shell
php artisan storage:unlink
```

<a name="driver-prerequisites"></a>
### 드라이버 사전 준비 사항

<a name="s3-driver-configuration"></a>
#### S3 드라이버 설정

S3 드라이버를 사용하기 전에, Composer 패키지 매니저를 이용해 Flysystem S3 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-aws-s3-v3 "^3.0" --with-all-dependencies
```

S3 드라이버 설정 정보는 `config/filesystems.php` 파일에 있습니다. 이 파일에는 S3 드라이버를 위한 예시 설정 배열이 포함되어 있으므로, 자신의 S3 정보와 자격 증명으로 수정해서 사용하면 됩니다. 참고로, 이 환경 변수들은 AWS CLI와 동일한 명명 규칙을 따릅니다.

<a name="ftp-driver-configuration"></a>
#### FTP 드라이버 설정

FTP 드라이버를 사용하기 전에, Composer를 통해 Flysystem FTP 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-ftp "^3.0"
```

Laravel의 Flysystem 통합은 FTP 환경에서도 잘 작동하지만, 기본 `filesystems.php` 설정 파일에는 FTP 설정 예제가 포함되어 있지 않습니다. FTP 파일 시스템을 설정하려면 아래 예시 설정을 참고해 추가할 수 있습니다.

```
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

SFTP 드라이버를 사용하기 전에, Composer로 Flysystem SFTP 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-sftp-v3 "^3.0"
```

Laravel Flysystem 통합은 SFTP 환경에서도 아주 잘 작동합니다. 다만, 기본 `filesystems.php`에는 샘플 설정이 들어있지 않습니다. SFTP 파일 시스템을 설정하려면 아래 예시를 참고하시기 바랍니다.

```
'sftp' => [
    'driver' => 'sftp',
    'host' => env('SFTP_HOST'),

    // 기본 인증용 설정...
    'username' => env('SFTP_USERNAME'),
    'password' => env('SFTP_PASSWORD'),

    // SSH 키 기반 인증 + 암호화 패스워드 설정...
    'privateKey' => env('SFTP_PRIVATE_KEY'),
    'passphrase' => env('SFTP_PASSPHRASE'),

    // 파일/디렉터리 권한 설정...
    'visibility' => 'private', // `private` = 0600, `public` = 0644
    'directory_visibility' => 'private', // `private` = 0700, `public` = 0755

    // Optional SFTP Settings...
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
### 스코프 및 읽기 전용 파일 시스템

스코프 디스크(Scoped Disk)를 사용하면, 모든 경로에 지정한 경로 접두사가 자동으로 붙는 파일 시스템을 만들 수 있습니다. 스코프 파일 시스템 디스크를 생성하려면 Composer에서 별도의 Flysystem 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-path-prefixing "^3.0"
```

기존 파일 시스템 디스크에 대해 `scoped` 드라이버를 사용하는 방식으로 경로 스코프 인스턴스를 만들 수 있습니다. 예를 들어, 기존 `s3` 디스크에 특정 경로 접두사로 스코프된 디스크를 정의하면, 이 디스크를 사용하는 모든 파일 작업에 접두사가 자동 적용됩니다.

```php
's3-videos' => [
    'driver' => 'scoped',
    'disk' => 's3',
    'prefix' => 'path/to/videos',
],
```

"읽기 전용(Read-only)" 디스크란, 쓰기 작업이 불가능한 파일 시스템 디스크를 의미합니다. `read-only` 설정을 사용하기 전에 Composer로 별도의 Flysystem 패키지를 추가해야 합니다.

```shell
composer require league/flysystem-read-only "^3.0"
```

그 다음, 디스크의 설정 배열에 `read-only` 설정을 포함시키면 됩니다.

```php
's3-videos' => [
    'driver' => 's3',
    // ...
    'read-only' => true,
],
```

<a name="amazon-s3-compatible-filesystems"></a>
### Amazon S3 호환 파일 시스템

애플리케이션의 `filesystems` 설정 파일은 기본적으로 `s3` 디스크 구성을 포함하고 있습니다. 이 디스크를 Amazon S3와 연동하는 데 사용할 수도 있지만, [MinIO](https://github.com/minio/minio) 나 [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/) 와 같은 S3 호환 파일 스토리지 서비스와 연동하는 데도 사용할 수 있습니다.

보통, 사용할 서비스의 자격 증명에 맞춰 설정을 변경한 후에는 `endpoint` 설정 값만 수정하면 됩니다. 이 값은 일반적으로 `AWS_ENDPOINT` 환경 변수로 지정됩니다.

```
'endpoint' => env('AWS_ENDPOINT', 'https://minio:9000'),
```

<a name="minio"></a>
#### MinIO

MinIO를 사용할 때 Laravel Flysystem 통합이 올바른 URL을 생성하려면, `AWS_URL` 환경 변수를 애플리케이션의 로컬 URL과 버킷 이름을 포함하는 경로로 지정해야 합니다.

```ini
AWS_URL=http://localhost:9000/local
```

> [!NOTE]
> MinIO를 사용할 때는 `temporaryUrl` 메서드를 통한 임시 저장소 URL 생성이 지원되지 않습니다.

<a name="obtaining-disk-instances"></a>
## 디스크 인스턴스 얻기

`Storage` 파사드를 사용해서 구성한 디스크와 상호작용할 수 있습니다. 예를 들어, 파사드의 `put` 메서드를 이용해 기본 디스크에 아바타 이미지를 저장할 수 있습니다. `disk` 메서드 호출 없이 바로 `Storage` 파사드의 메서드를 사용할 경우 자동으로 기본 디스크에 명령이 전달됩니다.

```
use Illuminate\Support\Facades\Storage;

Storage::put('avatars/1', $content);
```

애플리케이션에서 여러 디스크를 다루어야 한다면, `Storage` 파사드의 `disk` 메서드를 이용해 특정 디스크에 파일을 저장하거나 다룰 수 있습니다.

```
Storage::disk('s3')->put('avatars/1', $content);
```

<a name="on-demand-disks"></a>
### 온디맨드 디스크

실행 중에 애플리케이션의 `filesystems` 설정 파일에 없는 구성으로 임의의 디스크를 즉시 만들고 싶을 때는, 구성 배열을 `Storage` 파사드의 `build` 메서드에 전달하면 됩니다.

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

`get` 메서드를 이용해 파일의 내용을 가져올 수 있습니다. 이 메서드는 파일의 원본 문자열 내용을 반환합니다. 모든 파일 경로는 디스크의 "root" 위치 기준으로 상대 경로를 지정해야 한다는 점을 기억하세요.

```
$contents = Storage::get('file.jpg');
```

만약 읽어오는 파일이 JSON이라면, `json` 메서드를 사용해서 파일을 읽고 내용을 해석할 수도 있습니다.

```
$orders = Storage::json('orders.json');
```

`exists` 메서드를 사용하면 디스크에 해당 파일이 존재하는지 확인할 수 있습니다.

```
if (Storage::disk('s3')->exists('file.jpg')) {
    // ...
}
```

파일이 디스크에 없는지 확인하려면 `missing` 메서드를 사용할 수 있습니다.

```
if (Storage::disk('s3')->missing('file.jpg')) {
    // ...
}
```

<a name="downloading-files"></a>
### 파일 다운로드

`download` 메서드는 사용자의 브라우저에서 지정된 경로에 있는 파일을 강제로 다운로드하도록 응답을 생성합니다. 두 번째 인수로 사용할 파일 이름을, 세 번째 인수로는 추가 HTTP 헤더 배열을 전달할 수 있습니다.

```
return Storage::download('file.jpg');

return Storage::download('file.jpg', $name, $headers);
```

<a name="file-urls"></a>
### 파일 URL

`url` 메서드를 사용하면 주어진 파일의 URL을 얻을 수 있습니다. `local` 드라이버를 사용할 때는 일반적으로 `/storage`가 파일 경로 앞에 붙어서 상대 URL을 반환합니다. `s3` 드라이버를 사용한다면, 완전한 원격 URL이 반환됩니다.

```
use Illuminate\Support\Facades\Storage;

$url = Storage::url('file.jpg');
```

`local` 드라이버를 사용할 때, 외부에서 접근 가능한 파일은 반드시 `storage/app/public` 디렉터리에 저장해야 하며, 추가로 [심볼릭 링크 생성](#the-public-disk)을 통해 `public/storage`가 `storage/app/public`을 가리키도록 해야 합니다.

> [!NOTE]
> `local` 드라이버에서 `url`의 반환값은 URL 인코딩이 되어 있지 않습니다. 그러므로, URL로 사용할 수 없는 형식의 파일명을 사용하지 말고, 항상 URL에 적합한 파일명으로 저장하는 것을 권장합니다.

<a name="url-host-customization"></a>
#### URL 호스트 커스터마이징

`Storage` 파사드에서 생성되는 URL에 호스트를 미리 지정하고 싶다면, 디스크 설정 배열에 `url` 옵션을 추가할 수 있습니다.

```
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
],
```

<a name="temporary-urls"></a>
### 임시 URL

`s3` 드라이버를 사용해 저장한 파일에 대해서는 `temporaryUrl` 메서드를 통해 제한 시간 동안만 접근 가능한 임시 URL을 만들 수 있습니다. 이 메서드는 첫 번째 인수로 파일 경로, 두 번째 인수로 만료 시점을 지정하는 `DateTime` 인스턴스를 받습니다.

```
use Illuminate\Support\Facades\Storage;

$url = Storage::temporaryUrl(
    'file.jpg', now()->addMinutes(5)
);
```

필요에 따라 [S3 요청 파라미터](https://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectGET.html#RESTObjectGET-requests) 배열을 세 번째 인수로 전달할 수도 있습니다.

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

특정 디스크에서 임시 URL 생성 방식을 사용자 정의하고 싶을 때는 `buildTemporaryUrlsUsing` 메서드를 사용할 수 있습니다. 예를 들어, 해당 디스크가 기본적으로 임시 URL을 지원하지 않을 때, 컨트롤러에서 파일 다운로드를 제공하기 위해 사용할 수 있습니다. 보통 이 메서드는 서비스 프로바이더의 `boot` 메서드에서 호출하는 것이 가장 좋습니다.

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

> [!NOTE]
> 임시 업로드 URL 기능은 `s3` 드라이버만 지원합니다.

클라이언트 측 애플리케이션에서 직접 파일을 업로드할 수 있도록 임시 URL이 필요하다면, `temporaryUploadUrl` 메서드를 사용할 수 있습니다. 이 메서드는 업로드 경로와 만료 시점을 받아들입니다. 반환값은 업로드 URL과 업로드 요청에 포함해야 하는 헤더를 포함하는 연관 배열입니다.

```
use Illuminate\Support\Facades\Storage;

['url' => $url, 'headers' => $headers] = Storage::temporaryUploadUrl(
    'file.jpg', now()->addMinutes(5)
);
```

이 기능은 주로 무서버(serverless) 환경에서 클라이언트가 직접 Amazon S3와 같은 클라우드 스토리지에 파일을 업로드해야 할 때 유용합니다.

<a name="file-metadata"></a>
### 파일 메타데이터

파일을 읽고 쓰는 것 외에도, Laravel은 파일 자체에 대한 정보도 제공합니다. 예를 들어, `size` 메서드를 사용해 파일의 크기(바이트 단위)를 얻을 수 있습니다.

```
use Illuminate\Support\Facades\Storage;

$size = Storage::size('file.jpg');
```

`lastModified` 메서드는 해당 파일이 마지막으로 수정된 UNIX 타임스탬프를 반환합니다.

```
$time = Storage::lastModified('file.jpg');
```

지정한 파일의 MIME 타입은 `mimeType` 메서드로 알 수 있습니다.

```
$mime = Storage::mimeType('file.jpg');
```

<a name="file-paths"></a>
#### 파일 경로

`path` 메서드를 사용하면 주어진 파일의 경로를 알 수 있습니다. `local` 드라이버일 경우에는 절대 경로가 반환되고, `s3` 드라이버일 때는 S3 버킷 내의 상대 경로를 반환합니다.

```
use Illuminate\Support\Facades\Storage;

$path = Storage::path('file.jpg');
```

<a name="storing-files"></a>
## 파일 저장

`put` 메서드를 이용해 디스크에 파일 내용을 저장할 수 있습니다. 또한, 이 메서드에 PHP `resource`를 전달하면 Flysystem의 스트림 기능을 사용할 수 있습니다. 모든 파일 경로는 디스크에 설정된 "root" 경로에 대해 상대적으로 지정해야 합니다.

```
use Illuminate\Support\Facades\Storage;

Storage::put('file.jpg', $contents);

Storage::put('file.jpg', $resource);
```

<a name="failed-writes"></a>
#### 파일 쓰기 실패 처리

`put` 메서드(혹은 기타 "쓰기" 작업)에서 파일을 디스크에 기록하지 못하면, `false`가 반환됩니다.

```
if (! Storage::put('file.jpg', $contents)) {
    // 파일을 디스크에 쓸 수 없습니다...
}
```

원한다면, 파일 시스템 디스크의 설정 배열에 `throw` 옵션을 추가할 수 있습니다. 이 옵션이 `true`로 설정되면, `put` 메서드와 같은 "쓰기" 작업 실패 시 `League\Flysystem\UnableToWriteFile` 예외가 발생합니다.

```
'public' => [
    'driver' => 'local',
    // ...
    'throw' => true,
],
```

<a name="prepending-appending-to-files"></a>
### 파일에 내용 추가 및 덧붙이기

`prepend`와 `append` 메서드를 사용해 파일의 앞/뒤에 내용을 쓸 수 있습니다.

```
Storage::prepend('file.log', 'Prepended Text');

Storage::append('file.log', 'Appended Text');
```

<a name="copying-moving-files"></a>
### 파일 복사 및 이동

`copy` 메서드는 기존 파일을 새로운 위치에 복사하고, `move` 메서드는 파일을 이름 변경 또는 이동할 때 사용할 수 있습니다.

```
Storage::copy('old/file.jpg', 'new/file.jpg');

Storage::move('old/file.jpg', 'new/file.jpg');
```

<a name="automatic-streaming"></a>
### 자동 스트리밍

파일을 스트리밍 방식으로 저장하면 메모리 사용량을 크게 줄일 수 있습니다. Laravel이 파일 스트리밍 처리를 자동으로 하도록 하려면, `putFile` 또는 `putFileAs` 메서드를 사용할 수 있습니다. 이 메서드는 `Illuminate\Http\File` 혹은 `Illuminate\Http\UploadedFile` 인스턴스를 전달받아 지정한 위치로 파일을 자동 스트리밍합니다.

```
use Illuminate\Http\File;
use Illuminate\Support\Facades\Storage;

// 파일 이름을 자동으로 유니크하게 생성...
$path = Storage::putFile('photos', new File('/path/to/photo'));

// 파일 이름을 직접 지정...
$path = Storage::putFileAs('photos', new File('/path/to/photo'), 'photo.jpg');
```

`putFile` 메서드와 관련해서 알아둘 점들이 있습니다. 디렉터리 이름만 지정하고 파일명은 지정하지 않는 경우, `putFile` 메서드는 자동으로 고유한 ID를 파일명으로 생성합니다. 파일 확장자는 MIME 타입을 분석해 결정합니다. 메서드는 전체 경로(생성된 파일명 포함)를 반환하므로, 데이터베이스 등에 저장하기에 용이합니다.

`putFile` 및 `putFileAs` 메서드는 저장 파일의 "visibility"를 지정하는 인수를 받을 수도 있습니다. 이 기능은 Amazon S3와 같은 클라우드 디스크에 파일을 저장할 때, URL로 공개 접근이 가능한지 여부를 정할 때 유용합니다.

```
Storage::putFile('photos', new File('/path/to/photo'), 'public');
```

<a name="file-uploads"></a>
### 파일 업로드

웹 애플리케이션에서는 사진이나 문서 같은, 사용자가 업로드하는 파일을 저장하는 기능이 아주 흔합니다. Laravel은 업로드된 파일 인스턴스의 `store` 메서드를 사용하여 파일을 손쉽게 저장할 수 있도록 지원합니다. 파일을 저장할 경로를 지정해 `store` 메서드를 호출하면 됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserAvatarController extends Controller
{
    /**
     * 사용자 아바타 업데이트.
     */
    public function update(Request $request): string
    {
        $path = $request->file('avatar')->store('avatars');

        return $path;
    }
}
```

이 예제에서 주의할 점은, 디렉터리 이름만 지정하고 파일 이름은 지정하지 않았다는 것입니다. 기본적으로 `store` 메서드는 자동으로 고유한 ID를 파일명으로 생성하고, 파일 확장자는 MIME 타입에서 결정합니다. 반환값으로 경로(생성된 파일명 포함)를 받으니 데이터베이스 등에 쉽게 저장 가능합니다.

위와 동일한 파일 저장 작업은 `Storage` 파사드의 `putFile` 메서드를 사용해서도 할 수 있습니다.

```
$path = Storage::putFile('avatars', $request->file('avatar'));
```

<a name="specifying-a-file-name"></a>
#### 파일 이름 직접 지정

저장된 파일에 파일 이름을 자동으로 할당하지 않고 싶다면, `storeAs` 메서드를 사용할 수 있습니다. 이 메서드는 경로, 파일명, (선택사항) 디스크명을 인수로 받습니다.

```
$path = $request->file('avatar')->storeAs(
    'avatars', $request->user()->id
);
```

`Storage` 파사드의 `putFileAs` 메서드를 사용해서도 같은 작업을 할 수 있습니다.

```
$path = Storage::putFileAs(
    'avatars', $request->file('avatar'), $request->user()->id
);
```

> [!NOTE]
> 인쇄할 수 없는 문자, 잘못된 유니코드가 포함된 파일 경로는 자동으로 제거됩니다. 따라서 파일 경로를 Laravel 파일 저장 메서드에 전달하기 전에 미리 정제(sanitize)하는 것이 좋습니다. 파일 경로는 `League\Flysystem\WhitespacePathNormalizer::normalizePath`로 정규화됩니다.

<a name="specifying-a-disk"></a>
#### 디스크 지정

업로드된 파일의 `store` 메서드는 기본적으로 애플리케이션의 기본 디스크를 사용합니다. 다른 디스크에 저장하려면, 두 번째 인수로 디스크 이름을 전달하면 됩니다.

```
$path = $request->file('avatar')->store(
    'avatars/'.$request->user()->id, 's3'
);
```

`storeAs` 메서드를 사용할 때는 세 번째 인수에 디스크 이름을 넘길 수 있습니다.

```
$path = $request->file('avatar')->storeAs(
    'avatars',
    $request->user()->id,
    's3'
);
```

<a name="other-uploaded-file-information"></a>
#### 기타 업로드 파일 정보

업로드 파일의 원래 이름과 확장자를 얻으려면, `getClientOriginalName`, `getClientOriginalExtension` 메서드를 사용할 수 있습니다.

```
$file = $request->file('avatar');

$name = $file->getClientOriginalName();
$extension = $file->getClientOriginalExtension();
```

하지만, 이러한 메서드는 파일 이름과 확장자가 악의적인 사용자에 의해 임의로 변경될 수 있으므로 안전하지 않습니다. 일반적으로는 `hashName`과 `extension` 메서드를 사용해 업로드 파일에 대해 고유 이름과 확장자를 얻는 것이 더 안전합니다.

```
$file = $request->file('avatar');

$name = $file->hashName(); // 고유 랜덤 이름 생성...
$extension = $file->extension(); // MIME 타입 기반 파일 확장자 결정...
```

<a name="file-visibility"></a>
### 파일 공개 여부(Visibility)

Laravel의 Flysystem 통합에서 "visibility(공개 여부)"는 여러 플랫폼의 파일 권한을 추상화한 개념입니다. 파일의 visibility는 `public`(공개) 또는 `private`(비공개)로 선언할 수 있습니다. 파일이 `public`으로 선언되면, 보통 다른 사람이 접근할 수 있도록 허용한다고 볼 수 있습니다. 예를 들어, S3 드라이버를 사용할 때 `public` 파일의 경우 URL을 통해 접근할 수 있습니다.

파일을 저장할 때 `put` 메서드의 세 번째 인수로 visibility를 지정할 수 있습니다.

```
use Illuminate\Support\Facades\Storage;

Storage::put('file.jpg', $contents, 'public');
```

이미 저장된 파일의 visibility를 조회하거나 변경할 때는 `getVisibility`, `setVisibility` 메서드를 사용하면 됩니다.

```
$visibility = Storage::getVisibility('file.jpg');

Storage::setVisibility('file.jpg', 'public');
```

업로드 파일과 작업할 때는, `storePublicly`, `storePubliclyAs` 메서드를 활용해 `public` 파일로 저장할 수 있습니다.

```
$path = $request->file('avatar')->storePublicly('avatars', 's3');

$path = $request->file('avatar')->storePubliclyAs(
    'avatars',
    $request->user()->id,
    's3'
);
```

<a name="local-files-and-visibility"></a>
#### 로컬 파일과 공개 여부

`local` 드라이버 사용 시, `public` [visibility](#file-visibility)는 디렉터리에 `0755`, 파일에 `0644` 권한으로 적용됩니다. 이 권한 매핑은 애플리케이션의 `filesystems` 설정 파일에서 수정할 수 있습니다.

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
],
```

<a name="deleting-files"></a>
## 파일 삭제

`delete` 메서드는 단일 파일명 또는 여러 파일명을 배열로 받아 파일을 삭제할 수 있습니다.

```
use Illuminate\Support\Facades\Storage;

Storage::delete('file.jpg');

Storage::delete(['file.jpg', 'file2.jpg']);
```

필요하다면 파일이 삭제될 디스크를 직접 지정해서 사용할 수도 있습니다.

```
use Illuminate\Support\Facades\Storage;

Storage::disk('s3')->delete('path/file.jpg');
```

<a name="directories"></a>
## 디렉터리

<a name="get-all-files-within-a-directory"></a>
#### 디렉터리 내 모든 파일 가져오기

`files` 메서드는 지정한 디렉터리 내의 모든 파일 목록이 담긴 배열을 반환합니다. 하위 디렉터리까지 포함한 전체 파일 목록을 얻으려면 `allFiles` 메서드를 사용하세요.

```
use Illuminate\Support\Facades\Storage;

$files = Storage::files($directory);

$files = Storage::allFiles($directory);
```

<a name="get-all-directories-within-a-directory"></a>
#### 디렉터리 내 모든 디렉터리 가져오기

`directories` 메서드는 지정한 디렉터리 내 모든 하위 디렉터리의 배열을 반환합니다. 여기에 더해, `allDirectories` 메서드를 사용하면 하위 디렉터리까지 포함한 전체 목록을 얻을 수 있습니다.

```
$directories = Storage::directories($directory);

$directories = Storage::allDirectories($directory);
```

<a name="create-a-directory"></a>
#### 디렉터리 생성

`makeDirectory` 메서드를 사용하면, 필요한 하위 디렉터리까지 포함해 지정한 디렉터리를 한 번에 생성할 수 있습니다.

```
Storage::makeDirectory($directory);
```

<a name="delete-a-directory"></a>
#### 디렉터리 삭제

마지막으로, `deleteDirectory` 메서드는 디렉터리와 해당 디렉터리 내 모든 파일을 제거할 때 사용합니다.

```
Storage::deleteDirectory($directory);
```

<a name="testing"></a>
## 테스트

`Storage` 파사드의 `fake` 메서드를 이용하면, 임시로 사용할 가짜 디스크(fake disk)를 쉽게 생성할 수 있습니다. 이는 `Illuminate\Http\UploadedFile` 클래스의 파일 생성 유틸리티와 함께 사용하면 파일 업로드 기능 테스트가 매우 간단해집니다.

```
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

        // 파일이 하나 또는 여러 개 저장되었는지 확인...
        Storage::disk('photos')->assertExists('photo1.jpg');
        Storage::disk('photos')->assertExists(['photo1.jpg', 'photo2.jpg']);

        // 특정 파일이 저장되지 않았는지 확인...
        Storage::disk('photos')->assertMissing('missing.jpg');
        Storage::disk('photos')->assertMissing(['missing.jpg', 'non-existing.jpg']);

        // 특정 디렉터리가 비어 있는지 확인...
        Storage::disk('photos')->assertDirectoryEmpty('/wallpapers');
    }
}
```

기본적으로 `fake` 메서드는 임시 디렉터리 내 모든 파일을 삭제합니다. 이 파일들을 유지하고 싶을 땐 `persistentFake` 메서드를 사용할 수 있습니다. 파일 업로드 테스트에 관한 더 자세한 내용은 [HTTP 테스트 문서의 파일 업로드 부분](/docs/10.x/http-tests#testing-file-uploads)을 참고하세요.

> [!NOTE]
> `image` 메서드는 [GD 확장](https://www.php.net/manual/en/book.image.php)이 필요합니다.

<a name="custom-filesystems"></a>
## 커스텀 파일 시스템

Laravel의 Flysystem 통합은 여러 "드라이버"에 기본적으로 대응하지만, Flysystem 자체는 이외에도 많은 스토리지 시스템용 어댑터를 지원합니다. 이 추가 어댑터를 활용해 Laravel 애플리케이션에서 커스텀 드라이버를 만들어 사용할 수도 있습니다.

커스텀 파일 시스템을 정의하려면 Flysystem 어댑터가 필요합니다. 예를 들어, 커뮤니티에서 관리하는 Dropbox 어댑터를 프로젝트에 추가해보겠습니다.

```shell
composer require spatie/flysystem-dropbox
```

그 다음, 애플리케이션의 [service providers](/docs/10.x/providers) 중 하나의 `boot` 메서드에서 드라이버를 등록할 수 있습니다. 이때 `Storage` 파사드의 `extend` 메서드를 사용하면 됩니다.

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

`extend` 메서드의 첫 번째 인수는 드라이버 이름, 두 번째 인수는 `$app`과 `$config`를 받는 클로저입니다. 클로저에서는 반드시 `Illuminate\Filesystem\FilesystemAdapter` 인스턴스를 반환해야 합니다. `$config` 변수에는 해당 디스크의 `config/filesystems.php` 설정 값이 담겨 있습니다.

이렇게 확장 서비스 프로바이더를 생성해 등록한 후, `config/filesystems.php` 설정 파일에서 `dropbox` 드라이버를 사용할 수 있게 됩니다.

