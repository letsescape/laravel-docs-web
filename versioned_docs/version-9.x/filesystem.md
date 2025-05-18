# 파일 스토리지 (File Storage)

- [소개](#introduction)
- [구성](#configuration)
    - [로컬 드라이버](#the-local-driver)
    - [퍼블릭 디스크](#the-public-disk)
    - [드라이버 사전 요구사항](#driver-prerequisites)
    - [스코프 및 읽기 전용 파일 시스템](#scoped-and-read-only-filesystems)
    - [Amazon S3 호환 파일 시스템](#amazon-s3-compatible-filesystems)
- [디스크 인스턴스 가져오기](#obtaining-disk-instances)
    - [온디맨드 디스크](#on-demand-disks)
- [파일 가져오기](#retrieving-files)
    - [파일 다운로드](#downloading-files)
    - [파일 URL](#file-urls)
    - [파일 메타데이터](#file-metadata)
- [파일 저장](#storing-files)
    - [파일에 내용 앞뒤로 추가하기](#prepending-appending-to-files)
    - [파일 복사 및 이동](#copying-moving-files)
    - [자동 스트리밍](#automatic-streaming)
    - [파일 업로드](#file-uploads)
    - [파일 공개 여부 설정](#file-visibility)
- [파일 삭제](#deleting-files)
- [디렉터리 다루기](#directories)
- [커스텀 파일 시스템](#custom-filesystems)

<a name="introduction"></a>
## 소개

Laravel은 Frank de Jonge가 만든 훌륭한 [Flysystem](https://github.com/thephpleague/flysystem) PHP 패키지를 통해 강력한 파일 시스템 추상화 기능을 제공합니다. Laravel의 Flysystem 통합은 로컬 파일 시스템, SFTP, Amazon S3와 연동할 수 있는 간단한 드라이버들을 지원합니다. 특히, 개발 환경과 운영 환경 사이에서도 동일한 API를 사용하므로 스토리지 옵션을 쉽게 전환할 수 있다는 점이 큰 장점입니다.

<a name="configuration"></a>
## 구성

Laravel의 파일 시스템 구성 파일은 `config/filesystems.php`에 위치해 있습니다. 이 파일에서는 모든 파일 시스템 "디스크"를 설정할 수 있습니다. 각 디스크는 특정 스토리지 드라이버와 스토리지 위치를 나타냅니다. 이 구성 파일에는 지원되는 각 드라이버의 예시 설정이 포함되어 있으므로, 원하는 저장소 환경과 정보에 맞게 수정하시면 됩니다.

`local` 드라이버는 Laravel 애플리케이션이 실행 중인 서버의 로컬 파일을 다루고, `s3` 드라이버는 Amazon S3 클라우드 스토리지 서비스와 연동할 때 사용합니다.

> [!NOTE]
> 원하는 만큼 많은 디스크를 구성할 수 있으며, 동일한 드라이버를 여러 디스크에 적용하는 것도 가능합니다.

<a name="the-local-driver"></a>
### 로컬 드라이버

`local` 드라이버를 사용할 때, 모든 파일 작업은 `filesystems` 구성 파일에 정의된 `root` 디렉터리를 기준으로 상대 경로로 처리됩니다. 기본적으로 이 값은 `storage/app` 디렉터리로 설정되어 있습니다. 따라서 다음 방식으로 파일을 저장하면 `storage/app/example.txt` 파일이 생성됩니다.

```
use Illuminate\Support\Facades\Storage;

Storage::disk('local')->put('example.txt', 'Contents');
```

<a name="the-public-disk"></a>
### 퍼블릭 디스크

애플리케이션의 `filesystems` 구성 파일에 기본 포함된 `public` 디스크는 외부에 공개 가능한 파일의 저장을 목적으로 합니다. 기본적으로 `public` 디스크는 `local` 드라이버를 사용하며, 파일들을 `storage/app/public` 경로에 저장합니다.

이 파일들을 웹에서 접근 가능하도록 하려면 `public/storage`에서 `storage/app/public`로의 심볼릭 링크를 생성해야 합니다. 이런 디렉터리 구조를 사용하면, [Envoyer](https://envoyer.io)와 같은 서비스의 무중단 배포 환경에서도 공개 파일을 한 폴더에 모아 관리할 수 있습니다.

심볼릭 링크를 생성하려면 아래의 Artisan 명령어를 사용하세요:

```shell
php artisan storage:link
```

파일을 저장하고 심볼릭 링크까지 생성한 후에는 `asset` 헬퍼를 통해 파일의 URL을 만들 수 있습니다:

```
echo asset('storage/file.txt');
```

`filesystems` 구성 파일에서 추가적인 심볼릭 링크를 설정할 수도 있습니다. 설정된 모든 링크들은 `storage:link` 명령어 실행 시 자동으로 생성됩니다:

```
'links' => [
    public_path('storage') => storage_path('app/public'),
    public_path('images') => storage_path('app/images'),
],
```

<a name="driver-prerequisites"></a>
### 드라이버 사전 요구사항

<a name="s3-driver-configuration"></a>
#### S3 드라이버 설정

S3 드라이버를 사용하려면 먼저 Composer를 통해 Flysystem S3 패키지를 설치해야 합니다:

```shell
composer require league/flysystem-aws-s3-v3 "^3.0"
```

S3 드라이버 관련 구성 정보는 `config/filesystems.php` 파일 내에 위치합니다. 이 파일에는 S3 드라이버용 샘플 구성 배열이 포함되어 있으므로, 본인의 S3 정보와 자격 증명에 맞게 자유롭게 수정하면 됩니다. 편의를 위해 이 환경 변수들은 AWS CLI의 네이밍 규칙을 따릅니다.

<a name="ftp-driver-configuration"></a>
#### FTP 드라이버 설정

FTP 드라이버를 사용하려면 Composer를 통해 Flysystem FTP 패키지를 설치해야 합니다:

```shell
composer require league/flysystem-ftp "^3.0"
```

Laravel의 Flysystem 통합은 FTP와도 잘 작동하지만, 프레임워크의 기본 `filesystems.php`에는 FTP 샘플 구성이 포함되어 있지 않습니다. FTP 파일 시스템을 구성하려면 아래와 같이 설정할 수 있습니다:

```
'ftp' => [
    'driver' => 'ftp',
    'host' => env('FTP_HOST'),
    'username' => env('FTP_USERNAME'),
    'password' => env('FTP_PASSWORD'),

    // 선택적 FTP 옵션...
    // 'port' => env('FTP_PORT', 21),
    // 'root' => env('FTP_ROOT'),
    // 'passive' => true,
    // 'ssl' => true,
    // 'timeout' => 30,
],
```

<a name="sftp-driver-configuration"></a>
#### SFTP 드라이버 설정

SFTP 드라이버를 사용하기 전, Composer를 통해 Flysystem SFTP 패키지를 설치해야 합니다:

```shell
composer require league/flysystem-sftp-v3 "^3.0"
```

Laravel의 Flysystem 통합은 SFTP와도 잘 호환되지만, 프레임워크의 기본 `filesystems.php`에는 SFTP 샘플 구성이 포함되어 있지 않습니다. SFTP 파일 시스템을 구성하려면 아래와 같은 예시를 사용할 수 있습니다:

```
'sftp' => [
    'driver' => 'sftp',
    'host' => env('SFTP_HOST'),

    // 기본 인증용 설정...
    'username' => env('SFTP_USERNAME'),
    'password' => env('SFTP_PASSWORD'),

    // 암호화 비밀번호를 사용하는 SSH 키 기반 인증 설정...
    'privateKey' => env('SFTP_PRIVATE_KEY'),
    'passphrase' => env('SFTP_PASSPHRASE'),

    // 선택적 SFTP 설정...
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

스코프 디스크란, 모든 경로가 자동으로 지정한 경로 프리픽스(접두어)로 시작하도록 제한하는 파일 시스템을 말합니다. 스코프 파일 시스템 디스크를 만들려면 Composer를 통해 추가 Flysystem 패키지를 설치해야 합니다:

```shell
composer require league/flysystem-path-prefixing "^3.0"
```

기존 파일 시스템 디스크에 `scoped` 드라이버를 사용하여 경로 스코프 인스턴스를 만들 수 있습니다. 예를 들어, 기존의 `s3` 디스크에 특정 경로 프리픽스를 적용한 디스크를 만들고, 이렇게 만든 스코프 디스크로 파일 작업을 하면 항상 해당 프리픽스가 적용됩니다:

```php
's3-videos' => [
    'driver' => 'scoped',
    'disk' => 's3',
    'prefix' => 'path/to/videos',
],
```

"읽기 전용" 디스크를 사용하면 파일 쓰기 작업이 불가능한 파일 시스템 디스크를 만들 수 있습니다. `read-only` 설정을 사용하려면 다음과 같이 추가 Flysystem 패키지를 설치해야 합니다:

```shell
composer require league/flysystem-read-only "^3.0"
```

설치 후, 디스크 구성 배열에 `read-only` 옵션을 추가할 수 있습니다:

```php
's3-videos' => [
    'driver' => 's3',
    // ...
    'read-only' => true,
],
```

<a name="amazon-s3-compatible-filesystems"></a>
### Amazon S3 호환 파일 시스템

애플리케이션의 `filesystems` 구성 파일에는 기본적으로 `s3` 디스크의 설정이 포함되어 있습니다. 이 디스크를 사용하면 Amazon S3와 연동하는 것뿐만 아니라 [MinIO](https://github.com/minio/minio), [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/) 등 S3 호환 파일 저장 서비스와도 연동할 수 있습니다.

일반적으로 사용하려는 서비스의 자격 증명 정보에 맞게 디스크 설정을 수정했다면, 추가적으로 `endpoint` 구성 옵션의 값을 해당 서비스에 맞게 설정해 주기만 하면 됩니다. 이 값은 보통 `AWS_ENDPOINT` 환경 변수에서 정의합니다:

```
'endpoint' => env('AWS_ENDPOINT', 'https://minio:9000'),
```

<a name="minio"></a>
#### MinIO

Laravel의 Flysystem이 MinIO를 사용할 때 올바른 URL을 생성하려면, `AWS_URL` 환경 변수를 애플리케이션의 로컬 URL과 버킷 이름이 포함된 형태로 지정해야 합니다:

```ini
AWS_URL=http://localhost:9000/local
```

> [!WARNING]
> MinIO를 사용할 때 `temporaryUrl` 메서드로 임시 스토리지 URL을 생성하는 것은 지원되지 않습니다.

<a name="obtaining-disk-instances"></a>
## 디스크 인스턴스 가져오기

`Storage` 파사드는 설정된 모든 디스크와 연동하는 데 사용할 수 있습니다. 예를 들어, 기본 디스크에 아바타 이미지를 저장하려면 파사드의 `put` 메서드를 사용할 수 있습니다. 만약 `Storage` 파사드에서 `disk` 메서드 없이 바로 메서드를 호출하면, 해당 호출은 자동으로 기본 디스크로 전달됩니다:

```
use Illuminate\Support\Facades\Storage;

Storage::put('avatars/1', $content);
```

애플리케이션이 여러 디스크를 사용한다면, `Storage` 파사드의 `disk` 메서드를 활용하여 특정 디스크에 파일을 다룰 수 있습니다:

```
Storage::disk('s3')->put('avatars/1', $content);
```

<a name="on-demand-disks"></a>
### 온디맨드 디스크

가끔 특정 구성을 기반으로 런타임에 디스크를 임시로 생성해야 할 때가 있습니다. 이럴 때는 `Storage` 파사드의 `build` 메서드에 구성 배열을 전달하면 됩니다:

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

`get` 메서드를 사용하면 파일의 내용을 가져올 수 있습니다. 파일의 원본 문자열 데이터가 반환됩니다. 모든 파일 경로는 디스크의 "root" 위치를 기준으로 상대 경로로 지정해야 합니다:

```
$contents = Storage::get('file.jpg');
```

`exists` 메서드는 디스크에 특정 파일이 존재하는지 확인할 때 사용합니다:

```
if (Storage::disk('s3')->exists('file.jpg')) {
    // ...
}
```

`missing` 메서드는 디스크에 특정 파일이 없는지 여부를 확인할 때 사용할 수 있습니다:

```
if (Storage::disk('s3')->missing('file.jpg')) {
    // ...
}
```

<a name="downloading-files"></a>
### 파일 다운로드

`download` 메서드를 사용하면 지정한 경로의 파일을 강제로 브라우저에서 다운로드하도록 하는 HTTP 응답을 생성할 수 있습니다. 두 번째 인자로 파일명을 지정하면 다운로드 시 사용자에게 보이는 파일명이 결정됩니다. 마지막 세 번째 인자로는 HTTP 헤더 배열을 전달할 수 있습니다:

```
return Storage::download('file.jpg');

return Storage::download('file.jpg', $name, $headers);
```

<a name="file-urls"></a>
### 파일 URL

`url` 메서드를 사용하면 지정한 파일의 URL을 가져올 수 있습니다. `local` 드라이버를 사용할 경우, `/storage`가 파일 경로 앞에 붙은 상대 URL이 반환됩니다. 반면, `s3` 드라이버를 사용할 경우 전체 외부 URL이 반환됩니다:

```
use Illuminate\Support\Facades\Storage;

$url = Storage::url('file.jpg');
```

`local` 드라이버를 사용할 때 공개적으로 접근 가능한 모든 파일은 반드시 `storage/app/public` 디렉터리 내에 위치해야 하며, [심볼릭 링크 생성](#the-public-disk)이 필요합니다.

> [!WARNING]
> `local` 드라이버를 사용할 때, `url` 메서드의 반환 값은 URL 인코딩이 적용되지 않습니다. 따라서 웹상에서 유효한 URL을 생성할 수 있는 파일명을 사용하는 것이 좋습니다.

<a name="temporary-urls"></a>
#### 임시 URL

`s3` 드라이버 사용 시, `temporaryUrl` 메서드를 활용해 파일에 대한 일시적인 접근 URL을 만들 수 있습니다. 이 메서드는 파일 경로와 만료 시간을 의미하는 `DateTime` 인스턴스를 받습니다:

```
use Illuminate\Support\Facades\Storage;

$url = Storage::temporaryUrl(
    'file.jpg', now()->addMinutes(5)
);
```

필요하다면 추가적인 [S3 요청 파라미터](https://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectGET.html#RESTObjectGET-requests)를 세 번째 인자로 배열로 전달할 수 있습니다:

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

특정 스토리지 디스크에 대해 임시 URL 생성 방법을 커스터마이징하고 싶다면, `buildTemporaryUrlsUsing` 메서드를 사용할 수 있습니다. 예를 들어, 일반적으로 임시 URL을 지원하지 않는 디스크의 파일 다운로드 컨트롤러에서 이 기능이 필요할 때 사용할 수 있습니다. 보통 이 코드는 서비스 프로바이더의 `boot` 메서드에서 작성합니다:

```
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Storage::disk('local')->buildTemporaryUrlsUsing(function ($path, $expiration, $options) {
            return URL::temporarySignedRoute(
                'files.download',
                $expiration,
                array_merge($options, ['path' => $path])
            );
        });
    }
}
```

<a name="url-host-customization"></a>
#### URL 호스트 커스터마이징

`Storage` 파사드를 통해 생성되는 URL의 호스트 부분을 미리 지정하려면, 디스크 구성 배열에 `url` 옵션을 추가하면 됩니다:

```
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
],
```

<a name="file-metadata"></a>
### 파일 메타데이터

파일을 읽고 쓰는 것 외에도, Laravel은 파일 자체에 대한 정보도 제공할 수 있습니다. 예를 들어, `size` 메서드를 사용하여 파일 크기(바이트 단위)를 가져올 수 있습니다:

```
use Illuminate\Support\Facades\Storage;

$size = Storage::size('file.jpg');
```

`lastModified` 메서드는 파일이 마지막으로 수정된 시간의 UNIX 타임스탬프를 반환합니다:

```
$time = Storage::lastModified('file.jpg');
```

지정한 파일의 MIME 타입은 `mimeType` 메서드를 통해 얻을 수 있습니다:

```
$mime = Storage::mimeType('file.jpg')
```

<a name="file-paths"></a>
#### 파일 경로

`path` 메서드를 사용하면 지정한 파일의 실제 경로를 얻을 수 있습니다. `local` 드라이버를 사용하면 파일의 절대 경로가, `s3` 드라이버를 사용할 경우 S3 버킷 내 파일의 상대 경로가 반환됩니다:

```
use Illuminate\Support\Facades\Storage;

$path = Storage::path('file.jpg');
```

<a name="storing-files"></a>
## 파일 저장

`put` 메서드를 통해 파일 내용을 디스크에 저장할 수 있습니다. 여기에는 PHP `resource` 값도 전달할 수 있는데, 이 경우 Flysystem의 스트림 지원이 사용됩니다. 파일 경로는 항상 디스크 설정의 "root" 위치에 대한 상대 경로로 지정해야 합니다:

```
use Illuminate\Support\Facades\Storage;

Storage::put('file.jpg', $contents);

Storage::put('file.jpg', $resource);
```

<a name="failed-writes"></a>
#### 쓰기 실패 처리

`put` 메서드(및 기타 "쓰기" 작업)에서 파일 저장에 실패하면 `false`가 반환됩니다:

```
if (! Storage::put('file.jpg', $contents)) {
    // 파일을 디스크에 저장할 수 없습니다...
}
```

원한다면, 파일 시스템 디스크의 구성 배열에 `throw` 옵션을 정의할 수 있습니다. 이 옵션을 `true`로 설정하면 "쓰기" 메서드(`put` 등)에서 실패 시 `League\Flysystem\UnableToWriteFile` 예외가 던져집니다:

```
'public' => [
    'driver' => 'local',
    // ...
    'throw' => true,
],
```

<a name="prepending-appending-to-files"></a>
### 파일에 내용 앞뒤로 추가하기

`prepend`와 `append` 메서드를 사용하면 파일의 맨 앞 또는 맨 뒤에 내용을 추가할 수 있습니다:

```
Storage::prepend('file.log', 'Prepended Text');

Storage::append('file.log', 'Appended Text');
```

<a name="copying-moving-files"></a>
### 파일 복사 및 이동

`copy` 메서드는 기존 파일을 디스크 내의 새로운 위치로 복사하며, `move` 메서드는 기존 파일을 이동(혹은 이름 변경)할 때 사용합니다:

```
Storage::copy('old/file.jpg', 'new/file.jpg');

Storage::move('old/file.jpg', 'new/file.jpg');
```

<a name="automatic-streaming"></a>
### 자동 스트리밍

파일을 스트리밍하여 저장하면 메모리 사용량이 크게 줄어듭니다. 파일을 목표 위치로 자동 스트리밍하려면 `putFile` 또는 `putFileAs` 메서드를 사용할 수 있습니다. 이 메서드는 `Illuminate\Http\File` 또는 `Illuminate\Http\UploadedFile` 인스턴스를 인자로 받을 수 있으며, 지정한 위치로 파일을 자동으로 스트리밍합니다:

```
use Illuminate\Http\File;
use Illuminate\Support\Facades\Storage;

// 파일 이름에 고유한 ID 자동 생성...
$path = Storage::putFile('photos', new File('/path/to/photo'));

// 파일명을 수동으로 지정...
$path = Storage::putFileAs('photos', new File('/path/to/photo'), 'photo.jpg');
```

`putFile` 메서드는 중요한 특징이 몇 가지 있습니다. 우선, 디렉터리 이름만 지정했고 파일명은 지정하지 않았는데, 기본적으로 고유한 ID가 자동 생성되어 파일명으로 사용됩니다. 파일 확장자는 MIME 타입을 기반으로 결정됩니다. 메서드는 저장된 파일의 전체 경로(생성된 파일명 포함)를 반환하므로, 이 값을 데이터베이스 등에 저장할 수 있습니다.

`putFile`과 `putFileAs` 메서드에서는 저장 파일의 "공개 여부(visibility)"를 지정하는 추가 인자도 받을 수 있습니다. 특히 Amazon S3 같은 클라우드 디스크에 파일을 공개적으로 저장하려면 유용하게 사용할 수 있습니다:

```
Storage::putFile('photos', new File('/path/to/photo'), 'public');
```

<a name="file-uploads"></a>
### 파일 업로드

웹 애플리케이션에서 가장 흔한 파일 저장 용도 중 하나가 사용자 업로드 파일(예: 사진, 문서) 저장입니다. Laravel은 업로드된 파일 인스턴스의 `store` 메서드를 사용해 파일을 쉽게 저장할 수 있도록 지원합니다. `store` 메서드에 저장 경로만 전달하면 됩니다:

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserAvatarController extends Controller
{
    /**
     * 사용자의 아바타 이미지를 업데이트합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $path = $request->file('avatar')->store('avatars');

        return $path;
    }
}
```

이 예제에서 주의할 점이 몇 가지 있습니다. 디렉터리 이름만 지정하고 파일명을 명시하지 않았지만, 기본적으로 `store` 메서드가 고유한 ID를 파일명으로 생성합니다. 파일 확장자는 MIME 타입 검사로 자동 결정됩니다. 저장 결과로 파일 전체 경로가 반환되며, 이 값을 데이터베이스에 저장해 활용할 수 있습니다.

동일한 작업을 `Storage` 파사드의 `putFile` 메서드로도 수행할 수 있습니다:

```
$path = Storage::putFile('avatars', $request->file('avatar'));
```

<a name="specifying-a-file-name"></a>
#### 파일명 지정하기

저장되는 파일의 파일명을 자동 생성하지 않고 직접 지정하고 싶다면, `storeAs` 메서드를 사용하세요. 이 메서드는 경로, 파일명, (선택 사항) 디스크명을 인자로 받습니다:

```
$path = $request->file('avatar')->storeAs(
    'avatars', $request->user()->id
);
```

또한, `Storage` 파사드의 `putFileAs` 메서드를 사용해도 동일하게 처리할 수 있습니다:

```
$path = Storage::putFileAs(
    'avatars', $request->file('avatar'), $request->user()->id
);
```

> [!WARNING]
> 출력 불가 문자나 유효하지 않은 유니코드 문자는 파일 경로에서 자동으로 제거됩니다. 따라서 파일 경로를 Laravel의 파일 저장 메서드에 전달하기 전, 항상 안전하게 정제(sanitize)하는 것이 좋습니다. 파일 경로는 `League\Flysystem\WhitespacePathNormalizer::normalizePath` 메서드를 통해 정규화됩니다.

<a name="specifying-a-disk"></a>
#### 디스크 지정

기본적으로 업로드된 파일의 `store` 메서드는 기본 디스크를 사용합니다. 다른 디스크를 사용하고 싶다면 디스크명을 두 번째 인자로 전달하면 됩니다:

```
$path = $request->file('avatar')->store(
    'avatars/'.$request->user()->id, 's3'
);
```

`storeAs` 메서드를 사용할 때는 디스크명을 세 번째 인자로 넘기면 됩니다:

```
$path = $request->file('avatar')->storeAs(
    'avatars',
    $request->user()->id,
    's3'
);
```

<a name="other-uploaded-file-information"></a>
#### 기타 업로드 파일 정보

업로드된 파일의 원래 파일명과 확장자를 얻으려면 `getClientOriginalName`, `getClientOriginalExtension` 메서드를 사용할 수 있습니다:

```
$file = $request->file('avatar');

$name = $file->getClientOriginalName();
$extension = $file->getClientOriginalExtension();
```

단, 이 메서드들은 원본 파일명과 확장자가 악의적인 사용자에 의해 조작될 수 있기 때문에 보안상 안전하지 않습니다. 그래서 보통은 업로드된 파일의 이름과 확장자를 구할 땐 `hashName`과 `extension` 메서드를 사용하는 것이 더 안전합니다:

```
$file = $request->file('avatar');

$name = $file->hashName(); // 고유의 랜덤 이름 생성...
$extension = $file->extension(); // MIME 타입 기준으로 확장자 결정...
```

<a name="file-visibility"></a>
### 파일 공개 여부 설정

Laravel의 Flysystem 통합에서 "공개 여부(visibility)"란 여러 플랫폼의 파일 권한 정보를 추상화한 개념입니다. 파일은 `public`(공개) 또는 `private`(비공개)로 설정할 수 있습니다. 파일을 `public`으로 선언하면 다른 사용자도 파일을 접근할 수 있도록 허용한다는 의미입니다. 예를 들어 S3 드라이버 사용 시, `public` 파일에 대해 URL을 발급받을 수 있습니다.

파일 저장 시 `put` 메서드의 인자로 공개 여부를 지정할 수 있습니다:

```
use Illuminate\Support\Facades\Storage;

Storage::put('file.jpg', $contents, 'public');
```

이미 저장된 파일의 공개 여부는 `getVisibility`와 `setVisibility` 메서드로 가져오거나 변경할 수 있습니다:

```
$visibility = Storage::getVisibility('file.jpg');

Storage::setVisibility('file.jpg', 'public');
```

업로드된 파일을 다룰 때는 `storePublicly`, `storePubliclyAs` 메서드를 이용해 `public` 공개 파일로 저장할 수 있습니다:

```
$path = $request->file('avatar')->storePublicly('avatars', 's3');

$path = $request->file('avatar')->storePubliclyAs(
    'avatars',
    $request->user()->id,
    's3'
);
```

<a name="local-files-and-visibility"></a>
#### 로컬 파일 및 공개 여부

`local` 드라이버를 사용할 때, `public` [공개 여부](#file-visibility)는 디렉터리엔 `0755` 권한, 파일엔 `0644` 권한으로 매핑됩니다. 이 매핑은 애플리케이션의 `filesystems` 구성 파일에서 수정할 수 있습니다:

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

`delete` 메서드는 하나의 파일명 또는 파일명 배열을 인자로 받아 파일을 삭제할 수 있습니다:

```
use Illuminate\Support\Facades\Storage;

Storage::delete('file.jpg');

Storage::delete(['file.jpg', 'file2.jpg']);
```

필요하다면 파일이 삭제될 디스크까지 지정할 수 있습니다:

```
use Illuminate\Support\Facades\Storage;

Storage::disk('s3')->delete('path/file.jpg');
```

<a name="directories"></a>
## 디렉터리 다루기

<a name="get-all-files-within-a-directory"></a>
#### 디렉터리 내 모든 파일 가져오기

`files` 메서드는 지정한 디렉터리 내의 모든 파일을 배열로 반환합니다. 하위 폴더의 모든 파일까지 모두 가져오고 싶다면 `allFiles` 메서드를 사용하면 됩니다:

```
use Illuminate\Support\Facades\Storage;

$files = Storage::files($directory);

$files = Storage::allFiles($directory);
```

<a name="get-all-directories-within-a-directory"></a>
#### 디렉터리 내 모든 하위 디렉터리 가져오기

`directories` 메서드는 지정한 디렉터리의 모든 하위 디렉터리 배열을 반환합니다. `allDirectories` 메서드를 사용하면 지정 디렉터리와 모든 하위 디렉터리를 포함한 전체 목록을 얻을 수 있습니다:

```
$directories = Storage::directories($directory);

$directories = Storage::allDirectories($directory);
```

<a name="create-a-directory"></a>
#### 디렉터리 생성

`makeDirectory` 메서드는 지정한 디렉터리(및 필요한 하위 디렉터리 포함)를 생성합니다:

```
Storage::makeDirectory($directory);
```

<a name="delete-a-directory"></a>
#### 디렉터리 삭제

마지막으로, `deleteDirectory` 메서드를 사용하면 해당 디렉터리와 그 안의 모든 파일까지 한 번에 삭제할 수 있습니다:

```
Storage::deleteDirectory($directory);
```

<a name="custom-filesystems"></a>
## 커스텀 파일 시스템

Laravel의 Flysystem 통합은 여러 종류의 "드라이버"를 지원하지만, Flysystem 자체는 다양한 스토리지 시스템용 어댑터를 제공합니다. 만약 Laravel 애플리케이션에서 공식 지원되지 않는 추가 어댑터를 쓰고 싶다면 커스텀 드라이버를 만들 수 있습니다.

커스텀 파일 시스템을 정의하려면 Flysystem 어댑터가 필요합니다. 예시로, 커뮤니티에서 유지 관리하는 Dropbox 어댑터를 프로젝트에 추가해봅니다:

```shell
composer require spatie/flysystem-dropbox
```

그 다음, 애플리케이션의 [서비스 프로바이더](/docs/9.x/providers) 중 하나의 `boot` 메서드에서 드라이버를 등록합니다. 이를 위해 `Storage` 파사드의 `extend` 메서드를 사용합니다:

```
<?php

namespace App\Providers;

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
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Storage::extend('dropbox', function ($app, $config) {
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

`extend` 메서드의 첫 번째 인자는 드라이버 이름이고, 두 번째 인자는 `$app`과 `$config` 변수를 받는 클로저입니다. 이 클로저는 반드시 `Illuminate\Filesystem\FilesystemAdapter` 인스턴스를 반환해야 합니다. `$config` 변수에는 해당 디스크에 대해 `config/filesystems.php`에 정의한 값이 담깁니다.

확장 서비스 프로바이더를 생성 및 등록했다면 이제 `config/filesystems.php`에서 `dropbox` 드라이버를 자유롭게 사용할 수 있습니다.