# 파일 스토리지 (File Storage)

- [소개](#introduction)
- [구성](#configuration)
    - [로컬 드라이버](#the-local-driver)
    - [public 디스크](#the-public-disk)
    - [드라이버 필수 조건](#driver-prerequisites)
    - [Amazon S3 호환 파일 시스템](#amazon-s3-compatible-filesystems)
    - [캐싱](#caching)
- [디스크 인스턴스 획득](#obtaining-disk-instances)
    - [온디맨드 디스크](#on-demand-disks)
- [파일 가져오기](#retrieving-files)
    - [파일 다운로드](#downloading-files)
    - [파일 URL](#file-urls)
    - [파일 메타데이터](#file-metadata)
- [파일 저장](#storing-files)
    - [파일 업로드](#file-uploads)
    - [파일 공개 범위(Visibility)](#file-visibility)
- [파일 삭제](#deleting-files)
- [디렉터리](#directories)
- [커스텀 파일 시스템](#custom-filesystems)

<a name="introduction"></a>
## 소개

라라벨은 Frank de Jonge가 만든 훌륭한 [Flysystem](https://github.com/thephpleague/flysystem) PHP 패키지를 통해 강력한 파일 시스템 추상화를 제공합니다. 라라벨의 Flysystem 통합 기능을 사용하면 로컬 파일 시스템, SFTP, Amazon S3 등 다양한 스토리지 시스템을 손쉽게 다룰 수 있습니다. 더 나아가, 각 스토리지 시스템의 API가 동일하게 유지되므로, 로컬 개발 환경과 운영 서버(프로덕션) 간에 스토리지 옵션을 손쉽게 전환할 수 있습니다.

<a name="configuration"></a>
## 구성

라라벨의 파일 시스템 구성 파일은 `config/filesystems.php`에 위치해 있습니다. 이 파일에서 모든 파일 시스템 "디스크"를 설정할 수 있습니다. 각 디스크는 특정 스토리지 드라이버와 저장 위치를 의미합니다. 지원되는 각 드라이버의 예시 구성도 포함되어 있으므로, 이를 참고하여 자신의 저장소 환경과 인증 정보에 맞게 설정을 변경하시면 됩니다.

`local` 드라이버는 라라벨 애플리케이션이 실행 중인 서버의 로컬 파일을 다루는 데 사용하며, `s3` 드라이버는 Amazon의 S3 클라우드 스토리지 서비스에 파일을 쓰는 데 사용됩니다.

> [!TIP]
> 여러 개의 디스크를 원하는 만큼 설정할 수 있으며, 동일한 드라이버를 사용하는 여러 디스크도 생성할 수 있습니다.

<a name="the-local-driver"></a>
### 로컬 드라이버

`local` 드라이버를 사용할 때는, 모든 파일 작업이 `filesystems` 구성 파일에서 정의한 `root` 디렉터리 기준으로 상대 경로로 처리됩니다. 기본적으로 이 값은 `storage/app` 디렉터리로 설정되어 있습니다. 따라서, 아래 예시는 `storage/app/example.txt` 파일에 데이터를 기록합니다.

```
use Illuminate\Support\Facades\Storage;

Storage::disk('local')->put('example.txt', 'Contents');
```

<a name="the-public-disk"></a>
### public 디스크

애플리케이션의 `filesystems` 구성 파일에 포함된 `public` 디스크는 일반적으로 외부에 공개할 파일을 저장하는 데 사용합니다. 기본적으로 `public` 디스크는 `local` 드라이버를 사용하며, 파일은 `storage/app/public` 디렉터리에 저장됩니다.

이 파일들을 웹에서 접근할 수 있도록 하려면, `public/storage`에서 `storage/app/public`으로 연결되는 심볼릭 링크를 생성해야 합니다. 이러한 폴더 관리 방식을 사용하면, 무중단 배포처럼 여러 번 배포하더라도 공개 파일을 한 디렉터리에서 깔끔하게 관리하고 쉽게 공유할 수 있습니다.

심볼릭 링크를 생성하려면, `storage:link` Artisan 명령어를 사용하면 됩니다.

```
php artisan storage:link
```

파일을 저장하고 심볼릭 링크를 생성한 후에는, `asset` 헬퍼를 사용해 해당 파일의 URL을 만들 수 있습니다.

```
echo asset('storage/file.txt');
```

추가로 심볼릭 링크가 더 필요하다면, `filesystems` 구성 파일의 `links` 옵션에 원하는 경로들을 추가할 수 있으며, `storage:link` 명령 실행 시 해당 링크들도 함께 생성됩니다.

```
'links' => [
    public_path('storage') => storage_path('app/public'),
    public_path('images') => storage_path('app/images'),
],
```

<a name="driver-prerequisites"></a>
### 드라이버 필수 조건

<a name="composer-packages"></a>
#### Composer 패키지

S3 또는 SFTP 드라이버를 사용하기 전에는 Composer 패키지 매니저를 통해 해당 패키지를 설치해야 합니다.

- Amazon S3: `composer require --with-all-dependencies league/flysystem-aws-s3-v3 "^1.0"`
- SFTP: `composer require league/flysystem-sftp "~1.0"`

또한, 퍼포먼스를 높이고 싶다면 캐시 어댑터를 추가로 설치할 수 있습니다.

- CachedAdapter: `composer require league/flysystem-cached-adapter "~1.0"`

<a name="s3-driver-configuration"></a>
#### S3 드라이버 구성

S3 드라이버의 구성 정보는 `config/filesystems.php` 구성 파일에 있습니다. 이 파일에는 S3 드라이버를 위한 예시 배열이 포함되어 있으므로, 본인의 S3 설정값과 인증 정보에 맞게 자유롭게 수정할 수 있습니다. 참고로, 관련 환경 변수는 AWS CLI에서 사용되는 작명 규칙과 일치합니다.

<a name="ftp-driver-configuration"></a>
#### FTP 드라이버 구성

라라벨의 Flysystem 통합 기능은 FTP와도 잘 호환됩니다만, 프레임워크의 기본 `filesystems.php` 구성 파일에는 FTP 설정 예시가 포함되어 있지 않습니다. 만약 FTP 파일 시스템을 구성해야 한다면 아래 예시를 참고하세요.

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
#### SFTP 드라이버 구성

마찬가지로, SFTP 드라이버도 Flysystem과 잘 호환되며, 기본 `filesystems.php` 구성 파일에는 SFTP 설정 예시가 포함되어 있지 않습니다. 아래 예시를 참고하여 SFTP 파일 시스템을 추가로 설정할 수 있습니다.

```
'sftp' => [
    'driver' => 'sftp',
    'host' => env('SFTP_HOST'),
    
    // Settings for basic authentication...
    'username' => env('SFTP_USERNAME'),
    'password' => env('SFTP_PASSWORD'),

    // Settings for SSH key based authentication with encryption password...
    'privateKey' => env('SFTP_PRIVATE_KEY'),
    'password' => env('SFTP_PASSWORD'),

    // Optional SFTP Settings...
    // 'port' => env('SFTP_PORT', 22),
    // 'root' => env('SFTP_ROOT'),
    // 'timeout' => 30,
],
```

<a name="amazon-s3-compatible-filesystems"></a>
### Amazon S3 호환 파일 시스템

기본적으로, 애플리케이션의 `filesystems` 구성 파일에는 `s3` 디스크에 대한 설정이 들어 있습니다. Amazon S3뿐만 아니라, [MinIO](https://github.com/minio/minio)나 [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/)와 같은 S3 호환 파일 스토리지 서비스와도 연동이 가능합니다.

일반적으로, 서비스에 맞는 자격증명으로 값들을 변경한 후에는 `url` 설정 값을 업데이트해야 합니다. 이 값은 보통 `AWS_ENDPOINT` 환경 변수로 정의됩니다.

```
'endpoint' => env('AWS_ENDPOINT', 'https://minio:9000'),
```

<a name="caching"></a>
### 캐싱

특정 디스크에 캐싱을 활성화하려면, 디스크의 설정 옵션에 `cache` 지시어를 추가할 수 있습니다. `cache` 옵션은 캐시 `store` 이름, 만료 시간(`expire`, 초 단위), 캐시 `prefix` 등을 포함하는 배열이어야 합니다.

```
's3' => [
    'driver' => 's3',

    // 기타 디스크 옵션...

    'cache' => [
        'store' => 'memcached',
        'expire' => 600,
        'prefix' => 'cache-prefix',
    ],
],
```

<a name="obtaining-disk-instances"></a>
## 디스크 인스턴스 획득

`Storage` 파사드를 사용해 구성된 모든 디스크와 상호작용할 수 있습니다. 예를 들어, 기본 디스크에 아바타를 저장하려면 파사드의 `put` 메서드를 사용할 수 있습니다. 만약 `disk` 메서드를 먼저 호출하지 않고 `Storage` 파사드에서 메서드를 호출하면, 메서드는 자동으로 기본 디스크를 사용합니다.

```
use Illuminate\Support\Facades\Storage;

Storage::put('avatars/1', $content);
```

여러 디스크를 다루는 경우에는, `Storage` 파사드의 `disk` 메서드로 특정 디스크를 지정해서 파일을 저장할 수도 있습니다.

```
Storage::disk('s3')->put('avatars/1', $content);
```

<a name="on-demand-disks"></a>
### 온디맨드 디스크

가끔 필요에 따라, 애플리케이션의 `filesystems` 구성 파일에는 없는 설정을 사용해 실행 중에 디스크를 생성하고 싶을 수 있습니다. 이럴 때는 `Storage` 파사드의 `build` 메서드에 설정 배열을 전달하면 됩니다.

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

`get` 메서드를 사용해 파일의 내용을 가져올 수 있습니다. 이 메서드는 파일의 원시 문자열 데이터를 반환합니다. 모든 파일 경로는 반드시 디스크의 "root" 위치를 기준으로 한 상대 경로여야 합니다.

```
$contents = Storage::get('file.jpg');
```

`exists` 메서드를 사용하면, 디스크에 파일이 존재하는지 확인할 수 있습니다.

```
if (Storage::disk('s3')->exists('file.jpg')) {
    // ...
}
```

`missing` 메서드를 사용하면, 디스크에 파일이 없는지 확인할 수 있습니다.

```
if (Storage::disk('s3')->missing('file.jpg')) {
    // ...
}
```

<a name="downloading-files"></a>
### 파일 다운로드

`download` 메서드는 사용자의 브라우저가 해당 경로의 파일을 강제로 다운로드하도록 하는 응답을 생성합니다. `download` 메서드는 두 번째 인수로 파일 다운로드 시 표시될 파일명을 지정할 수 있으며, 세 번째 인수에 HTTP 헤더 배열도 전달 가능합니다.

```
return Storage::download('file.jpg');

return Storage::download('file.jpg', $name, $headers);
```

<a name="file-urls"></a>
### 파일 URL

`url` 메서드를 사용해 특정 파일의 URL을 가져올 수 있습니다. `local` 드라이버를 사용할 경우, 주로 `/storage`를 경로 앞에 덧붙여 해당 파일의 상대 URL을 반환합니다. `s3` 드라이버를 사용하는 경우, 완전한 원격 URL이 반환됩니다.

```
use Illuminate\Support\Facades\Storage;

$url = Storage::url('file.jpg');
```

로컬 드라이버를 사용할 때, 공개적으로 접근 가능한 모든 파일은 `storage/app/public` 디렉터리에 위치해야 합니다. 또한, [심볼릭 링크를 생성](#the-public-disk)하여 `public/storage`가 `storage/app/public`을 가리키도록 설정해야 합니다.

> [!NOTE]
> 로컬 드라이버 사용 시 `url` 메서드의 반환값은 URL 인코딩이 적용되지 않습니다. 따라서, 항상 유효한 URL이 생성될 수 있는 파일 이름을 사용하여 파일을 저장하는 것을 권장합니다.

<a name="temporary-urls"></a>
#### 임시 URL

`temporaryUrl` 메서드를 사용하면 `s3` 드라이버로 저장된 파일에 대해 임시로 접근 가능한 URL을 생성할 수 있습니다. 이 메서드는 파일 경로와, URL 만료 시점을 지정하는 `DateTime` 인스턴스를 받습니다.

```
use Illuminate\Support\Facades\Storage;

$url = Storage::temporaryUrl(
    'file.jpg', now()->addMinutes(5)
);
```

추가로 [S3 요청 파라미터](https://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectGET.html#RESTObjectGET-requests)를 더 지정해야 한다면, 세 번째 인수로 파라미터 배열을 전달할 수 있습니다.

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

특정 스토리지 디스크에 대해 임시 URL 생성 방식을 커스터마이즈해야 한다면, `buildTemporaryUrlsUsing` 메서드를 활용할 수 있습니다. 예를 들어, 임시 URL을 기본적으로 지원하지 않는 디스크에 저장된 파일을 다운로드할 수 있도록 컨트롤러에서 이 기능을 활용할 수 있습니다. 보통 이 메서드는 서비스 프로바이더의 `boot` 메서드에서 호출하는 것이 좋습니다.

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

`Storage` 파사드를 사용해 생성되는 URL의 호스트를 미리 지정하고 싶다면, 디스크 설정 배열에 `url` 옵션을 추가하면 됩니다.

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

파일의 읽기 및 쓰기뿐만 아니라, 라라벨은 파일 자체에 대한 정보도 제공합니다. 예를 들어, `size` 메서드는 파일의 바이트 단위 크기를 반환합니다.

```
use Illuminate\Support\Facades\Storage;

$size = Storage::size('file.jpg');
```

`lastModified` 메서드는 파일이 마지막으로 수정된 시점의 UNIX 타임스탬프를 반환합니다.

```
$time = Storage::lastModified('file.jpg');
```

<a name="file-paths"></a>
#### 파일 경로

`path` 메서드를 사용하면 특정 파일의 경로를 얻을 수 있습니다. `local` 드라이버를 사용할 경우, 해당 파일의 절대 경로를 반환합니다. `s3` 드라이버를 사용할 경우, S3 버킷 내에서의 상대 경로가 반환됩니다.

```
use Illuminate\Support\Facades\Storage;

$path = Storage::path('file.jpg');
```

<a name="storing-files"></a>
## 파일 저장

`put` 메서드를 이용해 파일 내용물을 디스크에 저장할 수 있습니다. PHP의 `resource`를 `put` 메서드에 전달할 수도 있으며, 이 경우 Flysystem의 스트림 지원 기능을 사용할 수 있습니다. 모든 파일 경로는 반드시 디스크에 설정한 "root" 기반의 상대 경로임을 기억하세요.

```
use Illuminate\Support\Facades\Storage;

Storage::put('file.jpg', $contents);

Storage::put('file.jpg', $resource);
```

<a name="automatic-streaming"></a>
#### 파일 자동 스트리밍

파일을 저장할 때 스트리밍을 활용하면 메모리 사용량을 크게 줄일 수 있습니다. 라라벨이 파일 스트리밍을 자동으로 관리하도록 하려면 `putFile` 또는 `putFileAs` 메서드를 사용할 수 있습니다. 이 메서드들은 `Illuminate\Http\File` 또는 `Illuminate\Http\UploadedFile` 인스턴스를 받은 뒤, 해당 파일을 지정된 위치로 자동 스트림 전송합니다.

```
use Illuminate\Http\File;
use Illuminate\Support\Facades\Storage;

// 파일명에 고유 ID가 자동 생성됨...
$path = Storage::putFile('photos', new File('/path/to/photo'));

// 파일명을 직접 지정...
$path = Storage::putFileAs('photos', new File('/path/to/photo'), 'photo.jpg');
```

`putFile` 메서드와 관련해 몇 가지 중요한 점이 있습니다. 디렉터리명만 지정하고 파일명을 지정하지 않아도, 기본적으로 `putFile`이 고유 ID를 생성하여 파일 이름으로 사용합니다. 파일 확장자는 파일의 MIME 타입을 기반으로 결정됩니다. `putFile` 메서드는 실제 경로(생성된 파일명 포함)를 반환하므로, 데이터베이스 등에 해당 경로를 저장할 수 있습니다.

또한, `putFile` 및 `putFileAs` 메서드는 저장하는 파일의 "공개 범위(visibility)"를 지정하는 인수를 받을 수 있습니다. 예를 들어, Amazon S3 등 클라우드 디스크에 저장하고 퍼블릭 URL로 공개하고 싶을 때 유용합니다.

```
Storage::putFile('photos', new File('/path/to/photo'), 'public');
```

<a name="prepending-appending-to-files"></a>
#### 파일에 내용 앞쪽/뒷쪽 추가

`prepend` 및 `append` 메서드는 파일 앞쪽이나 뒷쪽에 데이터를 추가할 수 있습니다.

```
Storage::prepend('file.log', 'Prepended Text');

Storage::append('file.log', 'Appended Text');
```

<a name="copying-moving-files"></a>
#### 파일 복사 및 이동

`copy` 메서드는 기존 파일을 디스크 내 새로운 위치로 복사할 때 사용하며, `move` 메서드는 기존 파일의 이름을 변경하거나 위치를 옮길 때 사용할 수 있습니다.

```
Storage::copy('old/file.jpg', 'new/file.jpg');

Storage::move('old/file.jpg', 'new/file.jpg');
```

<a name="file-uploads"></a>
### 파일 업로드

웹 애플리케이션에서 가장 흔히 파일 저장이 필요한 경우는 사용자 업로드(사진, 문서 등)입니다. 라라벨에서는 업로드된 파일 인스턴스의 `store` 메서드를 통해 손쉽게 파일을 저장할 수 있습니다. 저장할 경로만 지정해 메서드를 호출하면 됩니다.

```
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserAvatarController extends Controller
{
    /**
     * Update the avatar for the user.
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

이 예시에서 몇 가지 중요한 점은, 디렉터리명만 지정했지만 파일명은 지정하지 않았다는 것입니다. 기본적으로 `store` 메서드는 고유 ID를 파일명으로 자동 생성합니다. 파일 확장자는 파일의 MIME 타입을 기준으로 결정됩니다. 실제 파일의 전체 경로(생성된 파일명 포함)는 `store` 메서드가 반환하므로, 데이터베이스에 쉽게 저장할 수 있습니다.

위와 동일한 저장을 `Storage` 파사드의 `putFile` 메서드를 통해서도 구현할 수 있습니다.

```
$path = Storage::putFile('avatars', $request->file('avatar'));
```

<a name="specifying-a-file-name"></a>
#### 파일명 직접 지정

저장된 파일에 자동으로 이름이 지정되길 원하지 않는 경우, `storeAs` 메서드를 사용해 직접 파일명을 설정할 수 있습니다. 이때는 경로와 파일명, 그리고 (옵션) 디스크명을 인수로 전달합니다.

```
$path = $request->file('avatar')->storeAs(
    'avatars', $request->user()->id
);
```

`Storage` 파사드의 `putFileAs` 메서드를 사용해 동일한 작업을 할 수도 있습니다.

```
$path = Storage::putFileAs(
    'avatars', $request->file('avatar'), $request->user()->id
);
```

> [!NOTE]
> 출력 불가하거나 잘못된 유니코드 문자는 파일 경로에서 자동으로 제거됩니다. 따라서 파일 경로를 라라벨의 파일 저장 메서드에 전달하기 전 미리 정제하는 것을 권장합니다. 파일 경로는 `League\Flysystem\Util::normalizePath` 메서드로 정규화 처리됩니다.

<a name="specifying-a-disk"></a>
#### 디스크 지정

기본적으로, 업로드 파일의 `store` 메서드는 설정한 기본 디스크를 사용합니다. 만약 다른 디스크에 파일을 저장하고 싶다면, 두 번째 인수로 디스크 이름을 전달하면 됩니다.

```
$path = $request->file('avatar')->store(
    'avatars/'.$request->user()->id, 's3'
);
```

`storeAs` 메서드를 사용할 경우, 디스크 이름을 세 번째 인수로 전달하면 됩니다.

```
$path = $request->file('avatar')->storeAs(
    'avatars',
    $request->user()->id,
    's3'
);
```

<a name="other-uploaded-file-information"></a>
#### 업로드 파일의 기타 정보

업로드된 파일의 원래 이름과 확장자를 알고 싶다면, `getClientOriginalName` 및 `getClientOriginalExtension` 메서드를 사용할 수 있습니다.

```
$file = $request->file('avatar');

$name = $file->getClientOriginalName();
$extension = $file->getClientOriginalExtension();
```

단, `getClientOriginalName`과 `getClientOriginalExtension` 메서드는 사용자가 심어놓은 악성 파일명, 확장자일 수 있으므로 안전하지 않습니다. 보통은 `hashName`과 `extension` 메서드를 사용해 안전하게 무작위 파일명, 확장자를 구하는 것이 좋습니다.

```
$file = $request->file('avatar');

$name = $file->hashName(); // 고유하고 랜덤한 파일명 생성...
$extension = $file->extension(); // MIME 타입 기준 확장자 반환...
```

<a name="file-visibility"></a>
### 파일 공개 범위(Visibility)

라라벨의 Flysystem 통합에서 "공개 범위(visibility)"는 다양한 플랫폼에서의 파일 권한을 추상화한 개념입니다. 파일은 `public`(공개) 또는 `private`(비공개) 중 하나로 선언할 수 있습니다. `public`으로 선언된 파일은 기본적으로 외부에서 접근할 수 있음을 의미합니다. 예를 들어, S3 드라이버에서는 `public` 파일에 대해 URL을 가져올 수 있습니다.

파일을 저장할 때 `put` 메서드의 인수로 공개 범위를 설정할 수 있습니다.

```
use Illuminate\Support\Facades\Storage;

Storage::put('file.jpg', $contents, 'public');
```

이미 저장된 파일의 공개 범위는 `getVisibility`, 변경은 `setVisibility` 메서드로 처리할 수 있습니다.

```
$visibility = Storage::getVisibility('file.jpg');

Storage::setVisibility('file.jpg', 'public');
```

업로드된 파일과 함께 작업할 때는, `storePublicly` 및 `storePubliclyAs` 메서드를 사용해 파일을 바로 `public` 공개 범위로 저장할 수 있습니다.

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

로컬 드라이버를 사용할 때, `public` [공개 범위](#file-visibility)는 디렉터리에는 0755, 파일에는 0644 퍼미션으로 적용됩니다. 이 권한 매핑은 애플리케이션의 `filesystems` 구성 파일에서 변경할 수 있습니다.

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

`delete` 메서드는 파일명 하나 또는 삭제할 파일명 배열을 받을 수 있습니다.

```
use Illuminate\Support\Facades\Storage;

Storage::delete('file.jpg');

Storage::delete(['file.jpg', 'file2.jpg']);
```

필요하다면, 파일을 삭제할 디스크를 지정할 수도 있습니다.

```
use Illuminate\Support\Facades\Storage;

Storage::disk('s3')->delete('path/file.jpg');
```

<a name="directories"></a>
## 디렉터리

<a name="get-all-files-within-a-directory"></a>
#### 디렉터리 내 모든 파일 가져오기

`files` 메서드는 지정한 디렉터리 내 모든 파일의 배열을 반환합니다. 하위 디렉터리를 포함해 전체 디렉터리 트리의 모든 파일을 가져오고 싶다면, `allFiles` 메서드를 사용할 수 있습니다.

```
use Illuminate\Support\Facades\Storage;

$files = Storage::files($directory);

$files = Storage::allFiles($directory);
```

<a name="get-all-directories-within-a-directory"></a>
#### 디렉터리 내 모든 폴더 가져오기

`directories` 메서드는 지정한 디렉터리 내 모든 폴더의 배열을 반환합니다. 추가로, `allDirectories` 메서드를 사용하면 하위 디렉터리를 포함한 모든 디렉터리 리스트도 얻을 수 있습니다.

```
$directories = Storage::directories($directory);

$directories = Storage::allDirectories($directory);
```

<a name="create-a-directory"></a>
#### 디렉터리 생성

`makeDirectory` 메서드는 지정한 디렉터리 및 필요시 하위 디렉터리까지 생성해줍니다.

```
Storage::makeDirectory($directory);
```

<a name="delete-a-directory"></a>
#### 디렉터리 삭제

마지막으로, `deleteDirectory` 메서드를 사용해 해당 디렉터리와 그 안의 모든 파일을 삭제할 수 있습니다.

```
Storage::deleteDirectory($directory);
```

<a name="custom-filesystems"></a>
## 커스텀 파일 시스템

라라벨 Flysystem 통합은 여러 종류의 "드라이버"를 기본 지원하지만, Flysystem 자체는 이 외에도 다양한 스토리지 시스템용 어댑터를 제공합니다. 라라벨 애플리케이션에서 이러한 어댑터를 활용하려면 커스텀 드라이버를 생성할 수 있습니다.

커스텀 파일 시스템을 정의하려면 Flysystem 어댑터가 필요합니다. 예를 들어, 커뮤니티가 유지보수하는 Dropbox 어댑터를 프로젝트에 추가해보겠습니다.

```
composer require spatie/flysystem-dropbox
```

그 다음, 애플리케이션의 [서비스 프로바이더](/docs/8.x/providers) 중 하나의 `boot` 메서드에서 드라이버를 등록합니다. 이를 위해서는 `Storage` 파사드의 `extend` 메서드를 사용해야 합니다.

```
<?php

namespace App\Providers;

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
            $client = new DropboxClient(
                $config['authorization_token']
            );

            return new Filesystem(new DropboxAdapter($client));
        });
    }
}
```

`extend` 메서드의 첫 번째 인수는 드라이버 이름이며, 두 번째는 `$app`과 `$config` 변수를 받는 클로저입니다. 클로저는 반드시 `League\Flysystem\Filesystem` 인스턴스를 반환해야 하며, `$config` 변수에는 지정한 디스크에 대해 `config/filesystems.php`에 정의한 값들이 담깁니다.

확장 서비스 프로바이더를 직접 생성 및 등록한 후에는, 이제 `config/filesystems.php` 파일에서 `dropbox` 드라이버를 사용할 수 있습니다.

