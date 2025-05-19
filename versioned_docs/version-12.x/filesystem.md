# 파일 스토리지 (File Storage)

- [소개](#introduction)
- [구성](#configuration)
    - [로컬 드라이버](#the-local-driver)
    - [퍼블릭 디스크](#the-public-disk)
    - [드라이버 사전 준비사항](#driver-prerequisites)
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
    - [파일 앞/뒤에 내용 추가하기](#prepending-appending-to-files)
    - [파일 복사 및 이동](#copying-moving-files)
    - [자동 스트리밍](#automatic-streaming)
    - [파일 업로드](#file-uploads)
    - [파일 공개 범위(Visibility)](#file-visibility)
- [파일 삭제](#deleting-files)
- [디렉터리 작업](#directories)
- [테스트](#testing)
- [커스텀 파일시스템](#custom-filesystems)

<a name="introduction"></a>
## 소개

라라벨은 Frank de Jonge가 제작한 훌륭한 [Flysystem](https://github.com/thephpleague/flysystem) PHP 패키지를 통해 강력한 파일시스템 추상화 레이어를 제공합니다. 라라벨의 Flysystem 통합 기능을 이용하면 로컬 파일시스템, SFTP, Amazon S3와 손쉽게 연동할 수 있습니다. 이 API는 각 시스템마다 동일하게 동작하기 때문에, 개발 환경과 운영 환경 사이에서 스토리지 옵션을 매우 쉽게 전환할 수 있습니다.

<a name="configuration"></a>
## 구성

라라벨의 파일시스템 구성 파일은 `config/filesystems.php`에 위치합니다. 이 파일에서는 모든 파일시스템 "디스크"를 설정할 수 있습니다. 각 디스크는 특정 스토리지 드라이버와 저장 위치를 나타냅니다. 구성 파일에는 지원되는 각 드라이버에 대한 예시 설정이 포함되어 있으므로, 본인 환경에 맞춰 저장 방식과 인증 정보를 쉽게 변경할 수 있습니다.

`local` 드라이버는 라라벨 애플리케이션이 실행 중인 서버의 로컬 파일을 다룰 때 사용하며, `s3` 드라이버는 Amazon S3 클라우드 스토리지 서비스를 이용할 때 사용합니다.

> [!NOTE]
> 원하는 만큼 디스크를 추가로 설정할 수 있으며, 동일한 드라이버를 사용하는 여러 디스크도 자유롭게 구성할 수 있습니다.

<a name="the-local-driver"></a>
### 로컬 드라이버

`local` 드라이버를 사용할 경우, 모든 파일 작업은 `filesystems` 설정 파일 내에서 정의된 `root` 디렉터리를 기준으로 상대 경로로 처리됩니다. 기본적으로 이 값은 `storage/app/private` 디렉터리로 설정되어 있습니다. 따라서 아래 메서드는 `storage/app/private/example.txt` 파일에 내용을 작성하게 됩니다.

```php
use Illuminate\Support\Facades\Storage;

Storage::disk('local')->put('example.txt', 'Contents');
```

<a name="the-public-disk"></a>
### 퍼블릭 디스크

애플리케이션의 `filesystems` 설정 파일에 포함되어 있는 `public` 디스크는 사용자 접근이 공개적으로 허용되는 파일을 저장하기 위해 마련되어 있습니다. 기본적으로 `public` 디스크는 `local` 드라이버를 사용하며, 파일은 `storage/app/public` 디렉터리에 저장됩니다.

`public` 디스크가 `local` 드라이버를 사용할 때, 웹에서 이 파일들에 접근 가능하도록 하려면 소스 디렉터리 `storage/app/public`에서 대상 디렉터리 `public/storage`로 심볼릭 링크를 생성해야 합니다.

심볼릭 링크를 생성하려면 아래와 같이 `storage:link` 아티즌 명령어를 사용합니다.

```shell
php artisan storage:link
```

파일이 저장되고 심볼릭 링크가 생성된 후에는 `asset` 헬퍼를 사용해 파일의 URL을 생성할 수 있습니다.

```php
echo asset('storage/file.txt');
```

추가로, `filesystems` 설정 파일 내에서 더 많은 심볼릭 링크를 구성할 수 있습니다. 구성한 각 링크는 `storage:link` 명령어 실행 시 생성됩니다.

```php
'links' => [
    public_path('storage') => storage_path('app/public'),
    public_path('images') => storage_path('app/images'),
],
```

생성된 심볼릭 링크를 삭제하려면 `storage:unlink` 명령어를 사용할 수 있습니다.

```shell
php artisan storage:unlink
```

<a name="driver-prerequisites"></a>
### 드라이버 사전 준비사항

<a name="s3-driver-configuration"></a>
#### S3 드라이버 설정

S3 드라이버를 사용하기 전에 Composer 패키지 매니저를 통해 Flysystem S3 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-aws-s3-v3 "^3.0" --with-all-dependencies
```

S3 디스크 구성 배열은 `config/filesystems.php` 설정 파일에 포함되어 있습니다. 보통 아래와 같은 환경 변수들을 이용해 S3 정보와 인증 정보를 등록하면, `config/filesystems.php`에서 이 값을 자동으로 참조합니다.

```ini
AWS_ACCESS_KEY_ID=<your-key-id>
AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=<your-bucket-name>
AWS_USE_PATH_STYLE_ENDPOINT=false
```

이 환경 변수들은 AWS CLI에서 사용하는 이름 규칙과 동일하여 편리하게 사용할 수 있습니다.

<a name="ftp-driver-configuration"></a>
#### FTP 드라이버 설정

FTP 드라이버를 사용하기 전에 Composer 패키지 매니저로 Flysystem FTP 패키지를 먼저 설치해야 합니다.

```shell
composer require league/flysystem-ftp "^3.0"
```

라라벨의 Flysystem 통합은 FTP와도 잘 호환됩니다. 다만, 프레임워크의 기본 `config/filesystems.php` 설정 파일에는 FTP 구성 예시가 포함되어 있지 않습니다. FTP 파일시스템을 설정하려면 아래의 예시 구성을 참고하십시오.

```php
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

SFTP 드라이버를 사용하려면 먼저 Composer 패키지 매니저로 Flysystem SFTP 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-sftp-v3 "^3.0"
```

라라벨의 Flysystem 통합은 SFTP와도 잘 호환되지만, 프레임워크의 기본 `config/filesystems.php` 파일에 SFTP 예시가 포함되어 있지 않습니다. SFTP 파일시스템을 구성할 때는 아래 예시 구성을 참고하면 됩니다.

```php
'sftp' => [
    'driver' => 'sftp',
    'host' => env('SFTP_HOST'),

    // 기본 인증 정보
    'username' => env('SFTP_USERNAME'),
    'password' => env('SFTP_PASSWORD'),

    // 암호화된 패스워드와 SSH 키 기반 인증
    'privateKey' => env('SFTP_PRIVATE_KEY'),
    'passphrase' => env('SFTP_PASSPHRASE'),

    // 파일/디렉터리 권한 설정
    'visibility' => 'private', // `private` = 0600, `public` = 0644
    'directory_visibility' => 'private', // `private` = 0700, `public` = 0755

    // 선택적 SFTP 옵션...
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

스코프 디스크는 모든 경로가 자동으로 특정 경로 접두사로 시작하도록 만들어 주는 파일시스템을 구성할 수 있게 합니다. 스코프 파일시스템 디스크를 만들기 전에는 Composer를 통해 추가적인 Flysystem 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-path-prefixing "^3.0"
```

기존 파일시스템 디스크 중 하나를 지정해서 `scoped` 드라이버를 사용하면 경로 접두사가 적용된 스코프 인스턴스를 만들 수 있습니다. 예를 들어, 기존 `s3` 디스크를 특정 경로 아래로 제한한 별도 디스크를 정의하면, 해당 스코프 디스크를 사용할 때마다 지정한 접두사가 자동으로 적용됩니다.

```php
's3-videos' => [
    'driver' => 'scoped',
    'disk' => 's3',
    'prefix' => 'path/to/videos',
],
```

"읽기 전용(read-only)" 디스크는 쓰기 작업이 불가능한 파일시스템 디스크를 만들 수 있습니다. 이 기능을 사용하려면, 아래처럼 추가 Flysystem 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-read-only "^3.0"
```

이제 한 개 이상의 디스크 설정 배열에 `read-only` 옵션을 넣으면 됩니다.

```php
's3-videos' => [
    'driver' => 's3',
    // ...
    'read-only' => true,
],
```

<a name="amazon-s3-compatible-filesystems"></a>
### Amazon S3 호환 파일시스템

기본적으로 애플리케이션의 `filesystems` 설정 파일에는 `s3` 디스크 구성이 포함되어 있습니다. [Amazon S3](https://aws.amazon.com/s3/)와의 연동뿐만 아니라, [MinIO](https://github.com/minio/minio), [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/), [Vultr Object Storage](https://www.vultr.com/products/object-storage/), [Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/), [Hetzner Cloud Storage](https://www.hetzner.com/storage/object-storage/) 등 S3 호환 파일 스토리지 서비스와도 사용할 수 있습니다.

사용하려는 서비스의 인증 정보로 디스크 설정을 변경한 뒤에는, 대부분 `endpoint` 옵션 값만 바꿔주면 됩니다. 이 옵션은 일반적으로 `AWS_ENDPOINT` 환경 변수로 정의됩니다.

```php
'endpoint' => env('AWS_ENDPOINT', 'https://minio:9000'),
```

<a name="minio"></a>
#### MinIO

라라벨의 Flysystem 연동에서 MinIO 사용 시 올바른 URL을 생성하려면, 아래처럼 `AWS_URL` 환경 변수를 애플리케이션의 로컬 URL에 버킷이 포함된 형식으로 지정해야 합니다.

```ini
AWS_URL=http://localhost:9000/local
```

> [!WARNING]
> `endpoint`가 클라이언트에서 접근 불가능하면, MinIO 사용 시 `temporaryUrl` 메서드로 임시 저장소 URL 생성 기능이 동작하지 않을 수 있습니다.

<a name="obtaining-disk-instances"></a>
## 디스크 인스턴스 얻기

`Storage` 파사드를 사용하면 설정한 모든 디스크와 쉽게 상호작용할 수 있습니다. 예를 들어 `put` 메서드로 기본 디스크에 아바타 파일을 저장할 수 있습니다. 만약 `disk` 메서드를 사용하지 않고 `Storage` 파사드의 메서드를 호출하면, 기본 디스크가 자동으로 사용됩니다.

```php
use Illuminate\Support\Facades\Storage;

Storage::put('avatars/1', $content);
```

여러 디스크를 사용하는 경우, `disk` 메서드를 통해 특정 디스크의 파일을 다룰 수 있습니다.

```php
Storage::disk('s3')->put('avatars/1', $content);
```

<a name="on-demand-disks"></a>
### 온디맨드 디스크

애플리케이션의 `filesystems` 설정 파일에 별도로 등록하지 않은 설정 정보를 사용해서 런타임에 디스크를 임시로 생성해야 할 때가 있습니다. 이럴 땐 `Storage` 파사드의 `build` 메서드에 설정 배열을 전달하여 디스크 인스턴스를 생성할 수 있습니다.

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

`get` 메서드는 파일의 전체 내용을 읽어 문자열로 반환합니다. 모든 파일 경로는 디스크의 "root" 위치를 기준으로 상대 경로로 지정해야 합니다.

```php
$contents = Storage::get('file.jpg');
```

만약 JSON 파일을 읽고 싶다면, `json` 메서드를 써서 파일을 가져오고 자동으로 디코딩할 수 있습니다.

```php
$orders = Storage::json('orders.json');
```

`exists` 메서드는 디스크에 파일이 존재하는지 확인할 때 사용합니다.

```php
if (Storage::disk('s3')->exists('file.jpg')) {
    // ...
}
```

`missing` 메서드는 디스크에서 파일이 존재하지 않는지 확인할 때 사용합니다.

```php
if (Storage::disk('s3')->missing('file.jpg')) {
    // ...
}
```

<a name="downloading-files"></a>
### 파일 다운로드

`download` 메서드는 사용자의 브라우저에서 강제로 파일을 다운로드하도록 하는 응답을 생성합니다. 두 번째 인수로 파일명을 지정해 다운로드 시 표시되는 파일명을 바꿀 수 있으며, 세 번째 인수로 HTTP 헤더 배열을 추가할 수 있습니다.

```php
return Storage::download('file.jpg');

return Storage::download('file.jpg', $name, $headers);
```

<a name="file-urls"></a>
### 파일 URL

`url` 메서드를 쓰면 파일의 URL을 쉽게 얻을 수 있습니다. `local` 드라이버인 경우 `/storage`가 경로 앞에 붙어 상대 URL이 만들어지고, `s3` 드라이버인 경우에는 외부 접근이 가능한 전체 URL이 반환됩니다.

```php
use Illuminate\Support\Facades\Storage;

$url = Storage::url('file.jpg');
```

`local` 드라이버를 사용할 때는 공개적으로 접근해야 하는 모든 파일을 `storage/app/public` 디렉터리에 저장해야 하며, [퍼블릭 디스크 항목](#the-public-disk)의 안내대로 `public/storage` 위치에 심볼릭 링크를 만들어야 합니다.

> [!WARNING]
> `local` 드라이버에서 `url`의 반환값은 URL 인코딩이 적용되지 않습니다. 따라서 항상 유효한 URL 경로가 되도록 파일명을 짓는 것이 좋습니다.

<a name="url-host-customization"></a>
#### URL 호스트 커스터마이징

`Storage` 파사드를 통해 생성되는 URL의 호스트를 변경하고 싶다면 디스크 설정 배열에 `url` 옵션을 추가하거나 수정하면 됩니다.

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

`temporaryUrl` 메서드를 이용해 `local` 또는 `s3` 드라이버에 저장한 파일에 임시 접근할 수 있는 URL을 생성할 수 있습니다. 이 메서드는 경로와, URL이 만료될 시점을 나타내는 `DateTime` 인스턴스를 받습니다.

```php
use Illuminate\Support\Facades\Storage;

$url = Storage::temporaryUrl(
    'file.jpg', now()->addMinutes(5)
);
```

<a name="enabling-local-temporary-urls"></a>
#### 로컬 임시 URL 활성화

애플리케이션을 개발할 때 `local` 드라이버의 임시 URL 기능이 등장하기 전 프로젝트를 만들었다면, 임시 URL 기능을 별도로 활성화해야 할 수 있습니다. 이를 위해서는 `config/filesystems.php` 내 `local` 디스크 설정 배열에 `serve` 옵션을 추가해주면 됩니다.

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

[S3 요청 파라미터](https://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectGET.html#RESTObjectGET-requests)가 추가로 필요하다면, `temporaryUrl` 메서드의 세 번째 인수로 파라미터 배열을 전달할 수 있습니다.

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
#### 임시 URL 커스터마이징

특정 스토리지 디스크에 대해 임시 URL 생성 방식을 직접 커스터마이즈하고 싶을 때는 `buildTemporaryUrlsUsing` 메서드를 활용할 수 있습니다. 예를 들어, 임시 URL을 지원하지 않는 디스크에 저장된 파일을 컨트롤러를 통해 다운로드하게 하고 싶을 때 유용합니다. 이 메서드는 보통 서비스 프로바이더의 `boot` 메서드 안에서 호출하면 됩니다.

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
     * 부트스트랩 애플리케이션 서비스.
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

클라이언트 측 애플리케이션에서 직접 파일을 업로드할 수 있는 임시 URL이 필요하다면 `temporaryUploadUrl` 메서드를 사용하세요. 이 메서드는 경로와 만료 시점의 `DateTime` 인스턴스를 받으며, 업로드용 URL과 요청 시 포함해야 할 헤더가 들어있는 연관 배열을 반환합니다.

```php
use Illuminate\Support\Facades\Storage;

['url' => $url, 'headers' => $headers] = Storage::temporaryUploadUrl(
    'file.jpg', now()->addMinutes(5)
);
```

이 기능은 주로 Amazon S3 같은 클라우드 스토리지 시스템으로 클라이언트 측이 직접 업로드해야 하는 서버리스 환경에서 유용합니다.

<a name="file-metadata"></a>
### 파일 메타데이터

읽고 쓰는 기본 작업 외에도, 라라벨은 파일 자체에 대한 다양한 정보를 제공할 수 있습니다. 예를 들어, `size` 메서드를 사용하면 파일 크기(바이트 단위)를 알 수 있습니다.

```php
use Illuminate\Support\Facades\Storage;

$size = Storage::size('file.jpg');
```

`lastModified` 메서드는 파일이 마지막으로 수정된 시점의 UNIX 타임스탬프를 반환합니다.

```php
$time = Storage::lastModified('file.jpg');
```

지정한 파일의 MIME 타입 정보도 `mimeType` 메서드로 확인할 수 있습니다.

```php
$mime = Storage::mimeType('file.jpg');
```

<a name="file-paths"></a>
#### 파일 경로

`path` 메서드를 사용하면 파일의 경로 정보를 얻을 수 있습니다. `local` 드라이버인 경우에는 파일의 절대 경로가 반환되고, `s3` 드라이버인 경우에는 S3 버킷 내의 상대 경로가 반환됩니다.

```php
use Illuminate\Support\Facades\Storage;

$path = Storage::path('file.jpg');
```

<a name="storing-files"></a>
## 파일 저장

`put` 메서드는 파일 내용을 디스크에 저장할 때 사용합니다. 또한 PHP의 `resource`를 전달할 수도 있으며, 이 경우 Flysystem의 스트림 기능이 자동으로 사용됩니다. 모든 파일 경로는 각 디스크의 "root" 설정을 기준으로 상대 경로로 지정해야 합니다.

```php
use Illuminate\Support\Facades\Storage;

Storage::put('file.jpg', $contents);

Storage::put('file.jpg', $resource);
```

<a name="failed-writes"></a>
#### 저장 실패 처리

`put` 메서드(또는 기타 "쓰기" 작업)가 파일 저장에 실패하면 `false`를 반환합니다.

```php
if (! Storage::put('file.jpg', $contents)) {
    // 파일을 디스크에 저장하지 못한 경우...
}
```

원한다면 디스크 설정 배열에 `throw` 옵션을 지정할 수 있습니다. 이 옵션이 `true`로 설정되어 있을 때는 `put` 등 쓰기 관련 작업이 실패하면 `League\Flysystem\UnableToWriteFile` 예외가 발생합니다.

```php
'public' => [
    'driver' => 'local',
    // ...
    'throw' => true,
],
```

<a name="prepending-appending-to-files"></a>
### 파일 앞/뒤에 내용 추가하기

`prepend` 및 `append` 메서드를 사용하면 파일 앞이나 뒤에 텍스트를 추가할 수 있습니다.

```php
Storage::prepend('file.log', 'Prepended Text');

Storage::append('file.log', 'Appended Text');
```

<a name="copying-moving-files"></a>
### 파일 복사 및 이동

`copy` 메서드는 기존 파일을 디스크 내 새로운 위치로 복사합니다. `move` 메서드는 파일의 이름을 변경하거나, 새로운 위치로 이동시킬 때 사용합니다.

```php
Storage::copy('old/file.jpg', 'new/file.jpg');

Storage::move('old/file.jpg', 'new/file.jpg');
```

<a name="automatic-streaming"></a>
### 자동 스트리밍

파일을 스트리밍 방식으로 저장하면 메모리 사용량을 크게 줄일 수 있습니다. 라라벨에서 파일을 저장 경로로 자동 스트리밍하려면 `putFile` 또는 `putFileAs` 메서드를 사용하면 됩니다. 이 메서드에는 `Illuminate\Http\File` 혹은 `Illuminate\Http\UploadedFile` 인스턴스를 전달할 수 있고, 파일은 자동으로 원하는 경로에 저장됩니다.

```php
use Illuminate\Http\File;
use Illuminate\Support\Facades\Storage;

// 파일명을 자동으로 유니크하게 생성...
$path = Storage::putFile('photos', new File('/path/to/photo'));

// 파일명을 직접 지정...
$path = Storage::putFileAs('photos', new File('/path/to/photo'), 'photo.jpg');
```

여기서 `putFile` 메서드는 디렉터리만 지정하면 파일명은 자동으로 유니크한 값이 생성됩니다. 파일 확장자는 MIME 타입을 기준으로 결정되고, 실제 저장 경로(생성된 파일명을 포함한 전체 경로)가 반환됩니다. 따라서 데이터베이스에 해당 경로를 저장할 때 활용할 수 있습니다.

추가로, `putFile`과 `putFileAs`는 저장 파일의 "공개 범위(visibility)" 옵션을 전달받을 수 있습니다. 예를 들어 Amazon S3와 같은 클라우드 디스크에 파일을 저장하고, URL을 통해 공개적으로 접근하려 할 때 유용합니다.

```php
Storage::putFile('photos', new File('/path/to/photo'), 'public');
```

<a name="file-uploads"></a>
### 파일 업로드

웹 애플리케이션에서 가장 흔한 파일 저장 시나리오는 사용자가 업로드한 사진, 문서 같은 파일을 저장하는 것입니다. 라라벨에서는 업로드된 파일 인스턴스의 `store` 메서드를 사용해 매우 간편하게 업로드 파일을 저장할 수 있습니다. 저장 경로(디렉터리)를 지정하여 `store` 메서드를 호출하면 됩니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserAvatarController extends Controller
{
    /**
     * 사용자 아바타 업데이트
     */
    public function update(Request $request): string
    {
        $path = $request->file('avatar')->store('avatars');

        return $path;
    }
}
```

이 예시의 중요한 부분은 디렉터리명만 지정했고, 파일명은 직접 넣지 않았다는 점입니다. 기본적으로 `store` 메서드는 자동으로 유니크한 식별자로 파일명을 만들어 저장합니다. 파일 확장자도 MIME 타입을 토대로 결정됩니다. 실제 저장 경로(파일명 포함)는 `store` 메서드의 반환값이므로, 이를 데이터베이스에 저장할 수 있습니다.

위와 같은 작업을 `Storage` 파사드의 `putFile` 메서드를 통해서도 구현할 수 있습니다.

```php
$path = Storage::putFile('avatars', $request->file('avatar'));
```

<a name="specifying-a-file-name"></a>
#### 파일명 직접 지정하기

자동으로 파일명이 부여되는 것을 원하지 않을 경우, `storeAs` 메서드를 사용할 수 있습니다. 이 메서드는 저장 경로, 파일명, (선택적으로) 디스크명을 인수로 받습니다.

```php
$path = $request->file('avatar')->storeAs(
    'avatars', $request->user()->id
);
```

동일한 작업은 `Storage` 파사드의 `putFileAs` 메서드로도 할 수 있습니다.

```php
$path = Storage::putFileAs(
    'avatars', $request->file('avatar'), $request->user()->id
);
```

> [!WARNING]
> 출력할 수 없는 문자, 유효하지 않은 유니코드 문자는 파일 경로에서 자동으로 제거됩니다. 따라서 파일스토리지 메서드에 경로를 전달하기 전에 미리 검증/정제하는 것이 좋습니다. 경로 정규화는 `League\Flysystem\WhitespacePathNormalizer::normalizePath` 메서드로 처리됩니다.

<a name="specifying-a-disk"></a>
#### 디스크명 직접 지정하기

기본적으로 업로드된 파일의 `store` 메서드는 기본 디스크를 이용합니다. 별도의 디스크를 지정하려면 두 번째 인수로 디스크명을 전달하십시오.

```php
$path = $request->file('avatar')->store(
    'avatars/'.$request->user()->id, 's3'
);
```

`storeAs` 메서드를 쓸 경우에는 세 번째 인수에 디스크명을 넣을 수 있습니다.

```php
$path = $request->file('avatar')->storeAs(
    'avatars',
    $request->user()->id,
    's3'
);
```

<a name="other-uploaded-file-information"></a>
#### 기타 업로드 파일 정보

업로드한 파일의 원본 파일명 및 확장자가 필요하다면 아래와 같이 `getClientOriginalName` 및 `getClientOriginalExtension` 메서드를 사용할 수 있습니다.

```php
$file = $request->file('avatar');

$name = $file->getClientOriginalName();
$extension = $file->getClientOriginalExtension();
```

하지만, 이 메서드들은 사용자가 원본 파일명과 확장자를 조작할 수 있으므로 안전하지 않습니다. 따라서 일반적으로 업로드 파일의 이름, 확장자를 구할 때는 `hashName`과 `extension` 메서드를 사용하는 것이 더 안전합니다.

```php
$file = $request->file('avatar');

$name = $file->hashName(); // 유니크한 랜덤 파일명 생성
$extension = $file->extension(); // MIME 타입을 기반으로 확장자 결정
```

<a name="file-visibility"></a>
### 파일 공개 범위(Visibility)

라라벨 Flysystem 통합에서 "public"과 "private"은 여러 플랫폼의 파일 권한 개념을 통합해서 추상화한 것입니다. 파일이 `public`으로 설정되면, 외부에서 접근 가능하다는 의미입니다. 예를 들어 S3 드라이버에서 `public` 파일의 URL을 쉽게 가져올 수 있습니다.

파일 저장 시 `put` 메서드에서 공개 범위를 설정할 수 있습니다.

```php
use Illuminate\Support\Facades\Storage;

Storage::put('file.jpg', $contents, 'public');
```

이미 저장된 파일의 공개 범위는 `getVisibility`와 `setVisibility` 메서드로 가져오거나 설정할 수 있습니다.

```php
$visibility = Storage::getVisibility('file.jpg');

Storage::setVisibility('file.jpg', 'public');
```

업로드된 파일에도 `storePublicly`, `storePubliclyAs` 메서드로 `public` 공개 범위를 지정할 수 있습니다.

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

`local` 드라이버에서 `public` [공개 범위](#file-visibility)는 디렉터리 권한은 `0755`, 파일 권한은 `0644`로 매핑됩니다. 파일/디렉터리 권한 매핑은 애플리케이션의 `filesystems` 설정 파일에서 변경할 수 있습니다.

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

`delete` 메서드는 파일명 하나 또는 파일명 배열을 인수로 받아 해당 파일을 삭제합니다.

```php
use Illuminate\Support\Facades\Storage;

Storage::delete('file.jpg');

Storage::delete(['file.jpg', 'file2.jpg']);
```

필요하다면, 파일을 삭제할 디스크를 추가로 지정할 수도 있습니다.

```php
use Illuminate\Support\Facades\Storage;

Storage::disk('s3')->delete('path/file.jpg');
```

<a name="directories"></a>
## 디렉터리 작업

<a name="get-all-files-within-a-directory"></a>
#### 디렉터리 내 모든 파일 가져오기

`files` 메서드는 지정한 디렉터리 내의 파일 목록을 배열로 반환합니다. 모든 하위 디렉터리를 포함해 전체 파일 목록을 가져오고자 할 때는 `allFiles` 메서드를 사용하면 됩니다.

```php
use Illuminate\Support\Facades\Storage;

$files = Storage::files($directory);

$files = Storage::allFiles($directory);
```

<a name="get-all-directories-within-a-directory"></a>
#### 디렉터리 내 모든 디렉터리 가져오기

`directories` 메서드는 지정한 디렉터리의 하위 디렉터리 목록을 반환합니다. 모든 하위 디렉터리까지 포함한 전체 디렉터리 목록이 필요하다면 `allDirectories` 메서드를 사용합니다.

```php
$directories = Storage::directories($directory);

$directories = Storage::allDirectories($directory);
```

<a name="create-a-directory"></a>
#### 디렉터리 생성

`makeDirectory` 메서드는 지정한 디렉터리와 필요한 모든 하위 디렉터리를 생성합니다.

```php
Storage::makeDirectory($directory);
```

<a name="delete-a-directory"></a>
#### 디렉터리 삭제

마지막으로, `deleteDirectory` 메서드는 지정한 디렉터리와 그 안의 모든 파일을 삭제합니다.

```php
Storage::deleteDirectory($directory);
```

<a name="testing"></a>
## 테스트

`Storage` 파사드의 `fake` 메서드를 이용하면 임시 디스크를 손쉽게 생성하고, `Illuminate\Http\UploadedFile` 클래스의 파일 생성 유틸리티와 연계하여 파일 업로드 테스트를 매우 간단하게 할 수 있습니다. 예시는 다음과 같습니다.

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

    // 하나 이상의 파일이 저장되었는지 검증...
    Storage::disk('photos')->assertExists('photo1.jpg');
    Storage::disk('photos')->assertExists(['photo1.jpg', 'photo2.jpg']);

    // 하나 이상의 파일이 없는지 검증...
    Storage::disk('photos')->assertMissing('missing.jpg');
    Storage::disk('photos')->assertMissing(['missing.jpg', 'non-existing.jpg']);

    // 지정한 디렉터리 내 파일 개수가 예상과 일치하는지 검증...
    Storage::disk('photos')->assertCount('/wallpapers', 2);

    // 지정한 디렉터리가 비어있는지 검증...
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

        // 하나 이상의 파일이 저장되었는지 검증...
        Storage::disk('photos')->assertExists('photo1.jpg');
        Storage::disk('photos')->assertExists(['photo1.jpg', 'photo2.jpg']);

        // 하나 이상의 파일이 없는지 검증...
        Storage::disk('photos')->assertMissing('missing.jpg');
        Storage::disk('photos')->assertMissing(['missing.jpg', 'non-existing.jpg']);

        // 지정한 디렉터리 내 파일 개수가 예상과 일치하는지 검증...
        Storage::disk('photos')->assertCount('/wallpapers', 2);

        // 지정한 디렉터리가 비어있는지 검증...
        Storage::disk('photos')->assertDirectoryEmpty('/wallpapers');
    }
}
```

기본적으로 `fake` 메서드는 임시 디렉터리 내의 모든 파일을 삭제합니다. 이 파일들을 유지하고 싶다면 `persistentFake` 메서드를 사용할 수도 있습니다. 파일 업로드 테스트에 대한 자세한 내용은 [HTTP 테스트 문서의 파일 업로드 관련 정보](/docs/http-tests#testing-file-uploads)를 참고하십시오.

> [!WARNING]
> `image` 메서드 사용을 위해서는 [GD 확장 모듈](https://www.php.net/manual/en/book.image.php)이 필요합니다.

<a name="custom-filesystems"></a>
## 커스텀 파일시스템

라라벨의 Flysystem 통합은 여러 "드라이버"를 기본 지원하지만, Flysystem에는 다양한 스토리지 시스템용 어댑터가 존재합니다. 추가 어댑터를 활용하려면 커스텀 드라이버를 만들 수 있습니다.

커스텀 파일시스템을 정의하려면 우선 해당 Flysystem 어댑터가 필요합니다. 예를 들어, 커뮤니티에서 유지관리하는 Dropbox 어댑터를 프로젝트에 추가하는 절차는 다음과 같습니다.

```shell
composer require spatie/flysystem-dropbox
```

그 다음, [서비스 프로바이더](/docs/providers)의 `boot` 메서드에서 드라이버를 등록해줍니다. 이를 위해 `Storage` 파사드의 `extend` 메서드를 사용합니다.

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
     * 애플리케이션 서비스 등록
     */
    public function register(): void
    {
        // ...
    }

    /**
     * 애플리케이션 서비스 부트스트랩
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

`extend` 메서드의 첫 번째 인수는 드라이버 이름이고, 두 번째는 `$app`과 `$config`를 전달받는 클로저입니다. 클로저는 반드시 `Illuminate\Filesystem\FilesystemAdapter` 인스턴스를 반환해야 합니다. `$config` 변수에는 지정한 디스크의 `config/filesystems.php` 설정 값이 담깁니다.

확장 서비스 프로바이더를 만들고 등록을 마치면 `config/filesystems.php` 설정 파일에서 `dropbox` 드라이버를 사용할 수 있게 됩니다.
