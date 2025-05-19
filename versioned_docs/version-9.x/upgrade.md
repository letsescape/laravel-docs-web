# 업그레이드 가이드 (Upgrade Guide)

- [8.x에서 9.0으로 업그레이드하기](#upgrade-9.0)

<a name="high-impact-changes"></a>
## 영향도가 큰 변경 사항

<div class="content-list" markdown="1">

- [의존성 업데이트](#updating-dependencies)
- [Flysystem 3.x](#flysystem-3)
- [Symfony Mailer](#symfony-mailer)

</div>

<a name="medium-impact-changes"></a>
## 영향도가 중간인 변경 사항

<div class="content-list" markdown="1">

- [Belongs To Many의 `firstOrNew`, `firstOrCreate`, `updateOrCreate` 메서드](#belongs-to-many-first-or-new)
- [커스텀 캐스트와 `null`](#custom-casts-and-null)
- [기본 HTTP 클라이언트 타임아웃](#http-client-default-timeout)
- [PHP 반환 타입(Return Types)](#php-return-types)
- [Postgres "Schema" 설정](#postgres-schema-configuration)
- [`assertDeleted` 메서드](#the-assert-deleted-method)
- [`lang` 디렉터리](#the-lang-directory)
- [`password` 규칙](#the-password-rule)
- [`when` / `unless` 메서드](#when-and-unless-methods)
- [검증되지 않은 배열 키](#unvalidated-array-keys)

</div>

<a name="upgrade-9.0"></a>
## 8.x에서 9.0으로 업그레이드하기

<a name="estimated-upgrade-time-30-minutes"></a>
#### 예상 소요 시간: 약 30분

> [!NOTE]
> 가능한 모든 중요한 변경 사항(breaking change)을 문서화하려고 노력했으나, 일부 변경 사항은 프레임워크의 잘 사용하지 않는 부분에 영향을 줄 수 있으므로 실제로는 일부만이 여러분의 애플리케이션에 영향을 줄 수 있습니다. 시간을 절약하고 싶다면, [Laravel Shift](https://laravelshift.com/)를 활용하여 업그레이드 작업을 자동화할 수 있습니다.

<a name="updating-dependencies"></a>
### 의존성 업데이트

**영향 가능성: 높음**

#### PHP 8.0.2 이상 요구

라라벨은 이제 PHP 8.0.2 이상 버전이 필요합니다.

#### Composer 의존성

애플리케이션의 `composer.json` 파일에서 다음 의존성들을 업데이트해야 합니다.

<div class="content-list" markdown="1">

- `laravel/framework`를 `^9.0`으로
- `nunomaduro/collision`을 `^6.1`로

</div>

또한, `facade/ignition`을 `"spatie/laravel-ignition": "^1.0"`으로, 그리고(사용 중이라면) `pusher/pusher-php-server`를 `"pusher/pusher-php-server": "^5.0"`으로 교체해 주시기 바랍니다.

추가적으로, 아래와 같은 라라벨 9.x 지원을 위해 새로운 주요 버전(major release)이 배포된 1차 제공 패키지들이 있습니다. 해당 패키지들을 사용 중이라면, 업그레이드 전 각 패키지의 업그레이드 가이드를 참고해 주세요.

<div class="content-list" markdown="1">

- [Vonage Notification Channel (v3.0)](https://github.com/laravel/vonage-notification-channel/blob/3.x/UPGRADE.md) (Nexmo를 대체)

</div>

마지막으로, 애플리케이션에서 사용하는 기타 써드파티 패키지들의 버전도 확인하여 라라벨 9 지원 버전이 맞는지 검토하시기 바랍니다.

<a name="php-return-types"></a>
#### PHP 반환 타입(Return Types)

PHP는 이제 `offsetGet`, `offsetSet` 등과 같은 일부 메서드에서 반환 타입 명시를 점진적으로 요구하고 있습니다. 이에 따라 라라벨 9에서도 해당 메서드들에 반환 타입이 추가되었습니다. 일반적으로 사용자 코드에는 영향을 주지 않으나, 만약 라라벨의 코어 클래스를 확장(extends)하여 해당 메서드를 오버라이딩하고 있다면, 동일한 반환 타입 명시를 코드에 추가해야 합니다.

<div class="content-list" markdown="1">

- `count(): int`
- `getIterator(): Traversable`
- `getSize(): int`
- `jsonSerialize(): array`
- `offsetExists($key): bool`
- `offsetGet($key): mixed`
- `offsetSet($key, $value): void`
- `offsetUnset($key): void`

</div>

또한, PHP의 `SessionHandlerInterface`를 구현하는 메서드에도 반환 타입이 추가되었습니다. 일반 애플리케이션이나 패키지 코드에는 영향을 주지 않겠지만, 혹시 오버라이딩 중인 경우에만 아래 타입을 반영해야 합니다.

<div class="content-list" markdown="1">

- `open($savePath, $sessionName): bool`
- `close(): bool`
- `read($sessionId): string|false`
- `write($sessionId, $data): bool`
- `destroy($sessionId): bool`
- `gc($lifetime): int`

</div>

<a name="application"></a>
### 애플리케이션

<a name="the-application-contract"></a>
#### `Application` 컨트랙트

**영향 가능성: 낮음**

`Illuminate\Contracts\Foundation\Application` 인터페이스의 `storagePath` 메서드는 `$path` 인수를 받도록 변경되었습니다. 이 인터페이스를 직접 구현하고 있다면, 구현체도 아래와 같이 변경해야 합니다.

```
public function storagePath($path = '');
```
마찬가지로, `Illuminate\Foundation\Application` 클래스의 `langPath` 메서드도 `$path` 인수를 받도록 변경되었습니다.

```
public function langPath($path = '');
```

#### 예외 핸들러 `ignore` 메서드

**영향 가능성: 낮음**

예외 핸들러의 `ignore` 메서드는 이제 `protected`가 아니라 `public`으로 선언되어야 합니다. 이 메서드는 기본 애플리케이션 스켈레톤에는 포함되어 있지 않지만, 직접 구현한 경우 `public` 가시성으로 변경해 주세요.

```php
public function ignore(string $class);
```

#### 예외 핸들러 컨트랙트 바인딩

**영향 가능성: 아주 낮음**

기존에는 라라벨의 기본 예외 핸들러를 오버라이드할 때, `\App\Exceptions\Handler::class` 타입으로 서비스 컨테이너에 바인딩하였습니다. 이제는 `\Illuminate\Contracts\Debug\ExceptionHandler::class` 타입으로 바인딩해야 합니다.

### Blade

#### Lazy 컬렉션과 `$loop` 변수

**영향 가능성: 낮음**

Blade 템플릿 내에서 `LazyCollection` 인스턴스를 반복(iterate)할 때, 더 이상 `$loop` 변수를 사용할 수 없습니다. `$loop` 변수에 접근하면 전체 `LazyCollection`이 메모리로 로드되어, 원래의 lazy 처리 목적이 사라지기 때문입니다.

#### Checked / Disabled / Selected Blade 디렉티브

**영향 가능성: 낮음**

새로운 `@checked`, `@disabled`, `@selected` Blade 디렉티브는 동일한 이름의 Vue 이벤트와 충돌할 수 있습니다. 충돌을 피하려면 디렉티브 앞에 `@@`를 붙여 이스케이프 해주세요: `@@selected`.

### 컬렉션

#### `Enumerable` 컨트랙트

**영향 가능성: 낮음**

`Illuminate\Support\Enumerable` 인터페이스에 `sole` 메서드가 추가되었습니다. 이 인터페이스를 직접 구현하는 경우, 반드시 해당 메서드를 추가해주세요.

```php
public function sole($key = null, $operator = null, $value = null);
```

#### `reduceWithKeys` 메서드

`reduceWithKeys` 메서드는 삭제되었습니다. `reduce` 메서드가 동일한 기능을 제공하므로, 기존 코드를 `reduce`로 교체해 주시면 됩니다.

#### `reduceMany` 메서드

`reduceMany` 메서드가 `reduceSpread`로 이름이 바뀌었습니다. 비슷한 역할의 다른 메서드들과 네이밍 일관성을 맞추기 위함입니다.

### 컨테이너

#### `Container` 컨트랙트

**영향 가능성: 아주 낮음**

`Illuminate\Contracts\Container\Container` 인터페이스에 `scoped`, `scopedIf`라는 메서드가 추가되었습니다. 만약 이 컨트랙트를 직접 구현 중이라면, 해당 메서드들도 추가해주셔야 합니다.

#### `ContextualBindingBuilder` 컨트랙트

**영향 가능성: 아주 낮음**

`Illuminate\Contracts\Container\ContextualBindingBuilder` 인터페이스에 `giveConfig`라는 메서드가 추가되었습니다. 직접 구현한다면 아래와 같이 메서드를 추가해주세요.

```php
public function giveConfig($key, $default = null);
```

### 데이터베이스

<a name="postgres-schema-configuration"></a>
#### Postgres "Schema" 설정

**영향 가능성: 중간**

애플리케이션의 `config/database.php`에서 Postgres 연결의 검색 경로(search path)를 설정하는 `schema` 옵션의 이름이 `search_path`로 변경되었습니다.

<a name="schema-builder-doctrine-method"></a>
#### 스키마 빌더의 `registerCustomDoctrineType` 메서드

**영향 가능성: 낮음**

`Illuminate\Database\Schema\Builder` 클래스의 `registerCustomDoctrineType` 메서드는 제거되었습니다. 대신, `DB` 파사드의 `registerDoctrineType` 메서드를 사용하거나, `config/database.php`의 설정 파일에서 커스텀 Doctrine 타입을 등록할 수 있습니다.

### Eloquent

<a name="custom-casts-and-null"></a>
#### 커스텀 캐스트와 `null`

**영향 가능성: 중간**

기존 라라벨에서는 커스텀 캐스트 클래스의 `set` 메서드는 해당 속성(attribute)에 `null`이 할당될 때 호출되지 않았습니다. 그러나 이 동작은 라라벨 공식문서의 설명과 일치하지 않았습니다. 라라벨 9.x부터는 `set` 메서드가 항상 호출되며, 이때 `$value` 인자는 `null`이 전달될 수 있습니다. 따라서 커스텀 캐스트 클래스를 작성할 때 `null`을 올바르게 처리하도록 주의해야 합니다.

```php
/**
 * 주어진 값을 저장용으로 준비합니다.
 *
 * @param  \Illuminate\Database\Eloquent\Model  $model
 * @param  string  $key
 * @param  AddressModel  $value
 * @param  array  $attributes
 * @return array
 */
public function set($model, $key, $value, $attributes)
{
    if (! $value instanceof AddressModel) {
        throw new InvalidArgumentException('The given value is not an Address instance.');
    }

    return [
        'address_line_one' => $value->lineOne,
        'address_line_two' => $value->lineTwo,
    ];
}
```

<a name="belongs-to-many-first-or-new"></a>
#### Belongs To Many의 `firstOrNew`, `firstOrCreate`, `updateOrCreate` 메서드

**영향 가능성: 중간**

`belongsToMany` 관계의 `firstOrNew`, `firstOrCreate`, `updateOrCreate` 메서드는 첫 번째 인수로 속성 배열을 받습니다. 기존 라라벨에서는 이 배열을 연결 테이블(피벗 테이블)과 비교하여 기존 레코드를 확인했으나, 이는 개발자가 기대한 동작과 맞지 않는 경우가 많았습니다. 이제부터는 **관계된 모델 테이블**과 비교합니다.

```php
$user->roles()->updateOrCreate([
    'name' => 'Administrator',
]);
```

또한, `firstOrCreate` 메서드는 두 번째 인수로 `$values` 배열을 받을 수 있게 되었습니다. 해당 모델이 존재하지 않을 때 모델 생성 시 첫 번째 인수(`$attributes`)와 두 번째 인수(`$values`)가 병합되어 사용됩니다. 이 방식은 다른 관계에서의 `firstOrCreate`와 일관성을 맞추기 위함입니다.

```php
$user->roles()->firstOrCreate([
    'name' => 'Administrator',
], [
    'created_by' => $user->id,
]);
```

#### `touch` 메서드

**영향 가능성: 낮음**

`touch` 메서드는 이제 업데이트할 속성명을 인수로 받을 수 있습니다. 만약 이 메서드를 오버라이딩하고 있었다면 시그니처를 아래와 같이 바꿔야 합니다.

```php
public function touch($attribute = null);
```

### 암호화(Encryption)

#### Encrypter 컨트랙트

**영향 가능성: 낮음**

`Illuminate\Contracts\Encryption\Encrypter` 인터페이스에 `getKey` 메서드가 추가되었습니다. 해당 인터페이스를 직접 구현 중이라면 다음과 같이 메서드를 추가하세요.

```php
public function getKey();
```

### 파사드(Facades)

#### `getFacadeAccessor` 메서드

**영향 가능성: 낮음**

`getFacadeAccessor` 메서드는 반드시 컨테이너 바인딩 키(문자열)를 반환해야 합니다. 이전 버전에서는 객체 인스턴스를 반환해도 동작했지만, 이제는 지원되지 않습니다. 커스텀 파사드를 직접 작성했다면, 반환값이 반드시 문자열인지 확인해야 합니다.

```php
/**
 * 컴포넌트의 등록 이름을 반환합니다.
 *
 * @return string
 */
protected static function getFacadeAccessor()
{
    return Example::class;
}
```

### 파일 시스템

#### `FILESYSTEM_DRIVER` 환경 변수

**영향 가능성: 낮음**

`FILESYSTEM_DRIVER` 환경 변수명이 `FILESYSTEM_DISK`로 변경되어 더 정확한 의미를 표현합니다. 이 변경은 라라벨 기본 스켈레톤에만 영향을 미치며, 원한다면 자신의 애플리케이션 환경 변수도 동일하게 바꿀 수 있습니다.

#### "Cloud" 디스크

**영향 가능성: 낮음**

`cloud` 디스크 설정 옵션은 2020년 11월부터 기본 애플리케이션 스켈레톤에서 삭제되었습니다. 만약 애플리케이션에서 `cloud` 디스크를 사용하고 있다면, 해당 설정을 계속 유지하셔야 합니다.

<a name="flysystem-3"></a>
### Flysystem 3.x

**영향 가능성: 높음**

라라벨 9.x는 [Flysystem](https://flysystem.thephpleague.com/v2/docs/) 1.x에서 3.x로 업그레이드되었습니다. 파일 조작 메서드들은 모두 Flysystem을 기반으로 하므로, 아래 변경점들에 주의하여 코드를 점검해 주시기 바랍니다.

#### 드라이버 사용 전 선행 패키지 설치

S3, FTP, SFTP 드라이버를 사용하려면 Composer로 아래 패키지를 설치해야 합니다.

- Amazon S3: `composer require -W league/flysystem-aws-s3-v3 "^3.0"`
- FTP: `composer require league/flysystem-ftp "^3.0"`
- SFTP: `composer require league/flysystem-sftp-v3 "^3.0"`

#### 기존 파일 덮어쓰기

`put`, `write`, `writeStream` 등 파일 저장 계열 메서드는 이제 기존 파일을 기본적으로 **덮어씁니다**. 기존 파일을 덮어쓰기 싫다면 직접 파일 존재 여부를 체크 후 쓰기 작업을 수행해야 합니다.

#### 쓰기 실패 시 예외 처리

`put`, `write`, `writeStream` 등의 쓰기 작업이 실패할 때 더 이상 예외가 발생하지 않고, **`false`를 반환**합니다. 기존처럼 예외 발생을 원한다면 디스크 설정 배열에 `throw` 옵션을 추가하세요.

```php
'public' => [
    'driver' => 'local',
    // ...
    'throw' => true,
],
```

#### 존재하지 않는 파일 읽기

존재하지 않는 파일을 읽으려고 하면 예외(`Illuminate\Contracts\Filesystem\FileNotFoundException`) 대신 `null`이 반환됩니다.

#### 존재하지 않는 파일 삭제

존재하지 않는 파일을 `delete`할 때, 이제는 항상 `true`를 반환합니다.

#### 캐시 어댑터 제거

Flysystem 3.x부터는 **캐시 어댑터** 기능이 지원되지 않습니다. 따라서 라라벨과 설정 파일에서도 관련된 옵션(예: 디스크 설정 내 `cache` 키)은 제거할 수 있습니다.

#### 커스텀 파일 시스템

커스텀 파일 시스템 드라이버를 등록하는 방식에 약간의 변경이 있습니다. 직접 커스텀 드라이버를 구현하거나, 해당 기능을 가진 패키지를 사용하는 경우 아래 가이드를 참고하여 코드 및 의존성을 수정해 주세요.

라라벨 8.x에서의 예시:

```php
use Illuminate\Support\Facades\Storage;
use League\Flysystem\Filesystem;
use Spatie\Dropbox\Client as DropboxClient;
use Spatie\FlysystemDropbox\DropboxAdapter;

Storage::extend('dropbox', function ($app, $config) {
    $client = new DropboxClient(
        $config['authorization_token']
    );

    return new Filesystem(new DropboxAdapter($client));
});
```

라라벨 9.x에서는 `Storage::extend` 콜백에서 반드시 `Illuminate\Filesystem\FilesystemAdapter` 인스턴스를 직접 반환해야 합니다.

```php
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use League\Flysystem\Filesystem;
use Spatie\Dropbox\Client as DropboxClient;
use Spatie\FlysystemDropbox\DropboxAdapter;

Storage::extend('dropbox', function ($app, $config) {
    $adapter = new DropboxAdapter(
        new DropboxClient($config['authorization_token'])
    );

    return new FilesystemAdapter(
        new Filesystem($adapter, $config),
        $adapter,
        $config
    );
});
```

#### SFTP 개인-공개 키 비밀번호(passphrase)

애플리케이션에서 Flysystem의 SFTP 어댑터와 개인-공개 키 인증을 사용한다면, 프라이빗 키를 복호화할 때 쓰는 `password` 설정 항목의 이름이 `passphrase`로 변경되었습니다.

### 헬퍼(Helpers)

<a name="data-get-function"></a>
#### `data_get` 헬퍼와 이터러블 객체

**영향 가능성: 아주 낮음**

`data_get` 헬퍼는 기존엔 배열과 `Collection` 인스턴스에서만 중첩 데이터 접근이 가능했습니다. 이제는 **모든 이터러블 객체**에서 중첩 데이터에 접근할 수 있습니다.

<a name="str-function"></a>
#### `str` 헬퍼

**영향 가능성: 아주 낮음**

라라벨 9.x에 글로벌 `str` [헬퍼 함수](/docs/9.x/helpers#method-str)가 추가되었습니다. 만약 애플리케이션에서 동일한 이름의 글로벌 `str` 헬퍼를 정의해두었다면, 충돌을 피하기 위해 이름을 변경하거나 제거해야 합니다.

<a name="when-and-unless-methods"></a>
#### `when` / `unless` 메서드

**영향 가능성: 중간**

`when`과 `unless` 메서드는 프레임워크 전반 다양한 클래스에서 조건부 동작을 위해 제공됩니다. 이 메서드의 첫 번째 인수의 불리언 값이 `true` 또는 `false`일 때만 해당 함수를 실행합니다.

```php
$collection->when(true, function ($collection) {
    $collection->merge([1, 2, 3]);
});
```

기존에는 `when`이나 `unless`의 첫 번째 인수로 클로저(익명 함수)를 전달할 경우, 클로저 객체는 항상 truthy로 평가되어 항상 함수가 실행되는 문제가 있었습니다. 라라벨 9.x에서는 **첫 번째 인수로 전달된 클로저는 실제로 실행되고, 그 반환값이 조건 평가에 사용**됩니다.

```php
$collection->when(function ($collection) {
    // 이 클로저가 실제로 실행됨
    return false;
}, function ($collection) {
    // 첫 번째 클로저가 false를 반환했으므로 여기는 실행되지 않음
    $collection->merge([1, 2, 3]);
});
```

### HTTP 클라이언트

<a name="http-client-default-timeout"></a>
#### 기본 타임아웃

**영향 가능성: 중간**

[HTTP 클라이언트](/docs/9.x/http-client)에 기본 타임아웃이 **30초**로 설정되었습니다. 즉, 서버가 30초 내로 응답하지 않으면 예외가 발생합니다. 이전에는 별도 제한이 없어 요청이 무한정 "멈춤" 상태가 되는 경우가 있었습니다.

더 긴 타임아웃이 필요하다면 `timeout` 메서드로 개별 요청마다 지정 가능합니다.

```
$response = Http::timeout(120)->get(/* ... */);
```

#### HTTP Fake와 미들웨어

**영향 가능성: 낮음**

기존에는 HTTP 클라이언트가 "faked"될 때 Guzzle HTTP 미들웨어가 실행되지 않았지만, 9.x에서는 **faked 상태에서도 Guzzle 미들웨어가 실행**됩니다.

#### HTTP Fake와 의존성 주입

**영향 가능성: 낮음**

이전에는 `Http::fake()` 호출 후에도 생성자(inject) 등을 통해 주입된 `Illuminate\Http\Client\Factory` 인스턴스에는 영향을 주지 않았지만, 이제는 **의존성 주입된 클라이언트에도 fake 응답이 동작**합니다. 이는 다른 파사드 및 fake 객체와 일관성을 맞춘 동작입니다.

<a name="symfony-mailer"></a>
### Symfony Mailer

**영향 가능성: 높음**

라라벨 9.x의 가장 큰 변화 중 하나는, 2021년 12월 이후로 유지보수가 중단된 SwiftMailer 대신 Symfony Mailer로 전환되었다는 점입니다. 이 변화는 최대한 사용자 입장에서 매끄럽게 진행되도록 노력했으나, 아래 내용을 꼼꼼히 확인하여 호환성 문제를 예방하시길 권장합니다.

#### 드라이버 사용 전 선행 패키지 설치

Mailgun 전송 방식을 계속 사용하려면 아래 Composer 패키지들을 설치해야 합니다.

```shell
composer require symfony/mailgun-mailer symfony/http-client
```

`wildbit/swiftmailer-postmark` Composer 패키지는 제거해야 하며, 대신 아래 패키지들을 설치해야 합니다.

```shell
composer require symfony/postmark-mailer symfony/http-client
```

#### 반환 타입 변경

`Illuminate\Mail\Mailer`의 `send`, `html`, `raw`, `plain` 메서드는 이제 **`void`가 아니라 `Illuminate\Mail\SentMessage` 인스턴스**를 반환합니다. 이 객체에는 `getSymfonySentMessage` 메서드 또는 다이내믹 메서드로 접근할 수 있는 `Symfony\Component\Mailer\SentMessage` 인스턴스가 포함되어 있습니다.

#### "Swift" 관련 메서드명 변경

SwiftMailer와 관련된 다양한 메서드들은 Symfony Mailer 네이밍으로 변경되었습니다. 예를 들어, `withSwiftMessage`는 `withSymfonyMessage`로 이름이 바뀌었습니다.

```
// 라라벨 8.x...
$this->withSwiftMessage(function ($message) {
    $message->getHeaders()->addTextHeader(
        'Custom-Header', 'Header Value'
    );
});

// 라라벨 9.x...
use Symfony\Component\Mime\Email;

$this->withSymfonyMessage(function (Email $message) {
    $message->getHeaders()->addTextHeader(
        'Custom-Header', 'Header Value'
    );
});
```

> [!WARNING]
> 모든 가능한 `Symfony\Component\Mime\Email` 객체의 인터랙션을 위해 [Symfony Mailer 공식 문서](https://symfony.com/doc/6.0/mailer.html#creating-sending-messages)를 반드시 확인하세요.

아래는 이름이 변경된 주요 메서드 목록입니다. 대부분 SwiftMailer 혹은 Symfony Mailer와 직접 연동하는 저수준 메서드이므로, 일반적인 라라벨 애플리케이션은 크게 영향 없을 수 있습니다.

```
Message::getSwiftMessage();
Message::getSymfonyMessage();

Mailable::withSwiftMessage($callback);
Mailable::withSymfonyMessage($callback);

MailMessage::withSwiftMessage($callback);
MailMessage::withSymfonyMessage($callback);

Mailer::getSwiftMailer();
Mailer::getSymfonyTransport();

Mailer::setSwiftMailer($swift);
Mailer::setSymfonyTransport(TransportInterface $transport);

MailManager::createTransport($config);
MailManager::createSymfonyTransport($config);
```

#### `Illuminate\Mail\Message`의 프락시(Proxy) 메서드

이전에는 `Illuminate\Mail\Message` 클래스가 undefined(정의되지 않은) 메서드를 `Swift_Message` 인스턴스에 프락시 하였으나, 이제는 `Symfony\Component\Mime\Email`에 프락시합니다. 따라서 해당 방식에 의존한 코드가 있다면 Symfony Mailer 방식에 맞게 수정해야 합니다.

```
// 라라벨 8.x...
$message
    ->setFrom('taylor@laravel.com')
    ->setTo('example@example.org')
    ->setSubject('Order Shipped')
    ->setBody('<h1>HTML</h1>', 'text/html')
    ->addPart('Plain Text', 'text/plain');

// 라라벨 9.x...
$message
    ->from('taylor@laravel.com')
    ->to('example@example.org')
    ->subject('Order Shipped')
    ->html('<h1>HTML</h1>')
    ->text('Plain Text');
```

#### 메시지 ID 생성 방식 변경

SwiftMailer는 생성되는 메시지 ID에 사용되는 도메인을 설정할 수 있도록 `mime.idgenerator.idright` 옵션을 제공했으나, Symfony Mailer에서는 해당 기능을 지원하지 않습니다. 대신, 메시지 ID는 자동으로 **발신자(sender)** 정보를 기반으로 생성됩니다.

#### `MessageSent` 이벤트 변경

`Illuminate\Mail\Events\MessageSent` 이벤트의 `message` 속성에는 이제 `Swift_Message` 대신 **`Symfony\Component\Mime\Email` 인스턴스**가 저장됩니다. 이 객체는 메일 전송 **이전**의 이메일을 나타냅니다.

또한, 새로 추가된 `sent` 속성에는 `Illuminate\Mail\SentMessage` 인스턴스가 저장되어, 보낸 이메일의 Message ID 등 추가 정보도 확인할 수 있습니다.

#### 강제 재연결(Forced Reconnections) 불가

메일러가 데몬 프로세스 등에서 동작할 때 **트랜스포트의 강제 재연결**이 더 이상 불가능합니다. 대신, Symfony Mailer가 자동으로 재연결을 시도하고, 실패하면 예외를 발생시킵니다.

#### SMTP 스트림 옵션

SMTP 트랜스포트의 스트림 관련 옵션 설정이 더 이상 지원되지 않습니다. 지원되는 옵션만 설정 파일에 직접 명시해주어야 합니다. 예를 들어, TLS 피어 검증 비활성화는 아래와 같이 설정할 수 있습니다.

```
'smtp' => [
    // 라라벨 8.x...
    'stream' => [
        'ssl' => [
            'verify_peer' => false,
        ],
    ],

    // 라라벨 9.x...
    'verify_peer' => false,
],
```

자세한 옵션은 [Symfony Mailer 공식 문서](https://symfony.com/doc/6.0/mailer.html#transport-setup)를 참고하세요.

> [!WARNING]
> 위 예시(SSL 검증 비활성화)는 보안상 안전하지 않으므로, "중간자 공격" 위험이 있으니 실사용 시 권장하지 않습니다.

#### SMTP `auth_mode`

`mail` 설정 파일에서 SMTP의 `auth_mode`를 명시적으로 지정할 필요가 없어졌습니다. 인증 방식은 Symfony Mailer가 SMTP 서버와 자동으로 협상합니다.

#### 전송 실패 수신자(failed recipients)

이제 메일 전송 후 실패한 수신자 목록을 조회할 수 없습니다. 만약 메시지 전송이 실패하면 `Symfony\Component\Mailer\Exception\TransportExceptionInterface` 예외가 발생합니다. 실패한 이메일을 확인하려면, 메일 전송 전 수신자 이메일 주소의 유효성을 반드시 검증하는 것을 권장합니다.

### 패키지(Packages)

<a name="the-lang-directory"></a>
#### `lang` 디렉터리

**영향 가능성: 중간**

새로운 라라벨 애플리케이션에서는 `resources/lang` 디렉터리가 루트 프로젝트 디렉터리(`lang`)로 옮겨졌습니다. 패키지에서 언어 파일을 배포하는 경우, 하드코딩된 경로 대신 반드시 `app()->langPath()` 메서드를 사용해 새로운 경로에 파일을 배포하도록 수정해야 합니다.

<a name="queue"></a>
### 큐(Queue)

<a name="the-opis-closure-library"></a>
#### `opis/closure` 라이브러리

**영향 가능성: 낮음**

라라벨의 `opis/closure` 의존성이 `laravel/serializable-closure`로 대체되었습니다. 기존 코드를 그대로 사용하는 대부분의 경우 특별한 문제는 없습니다. 단, 직접 `opis/closure` 라이브러리를 직접적으로 사용하거나, 기존에 deprecated된 `Illuminate\Queue\SerializableClosureFactory` 또는 `Illuminate\Queue\SerializableClosure` 클래스를 사용 중이라면, [Laravel Serializable Closure](https://github.com/laravel/serializable-closure)로 전환해 주셔야 합니다.

#### 실패한 작업 제공자(Provider) `flush` 메서드

**영향 가능성: 낮음**

`Illuminate\Queue\Failed\FailedJobProviderInterface` 인터페이스의 `flush` 메서드는 이제 `$hours` 인수를 받아, 실패한 작업을 `queue:flush` 명령으로 삭제할 때 해당 작업이 **몇 시간 이상 된 것인지(시간 단위)**를 지정할 수 있습니다. 직접 구현 중이라면 아래와 같이 시그니처를 변경해 주세요.

```php
public function flush($hours = null);
```

### 세션(Session)

#### `getSession` 메서드

**영향 가능성: 낮음**

라라벨의 `Illuminate\Http\Request` 클래스가 확장한 `Symfony\Component\HttpFoundation\Request` 클래스에는 현재 세션 스토리지를 가져오는 `getSession` 메서드가 존재합니다. 이는 라라벨 공식 문서에는 언급되지 않으며, 대부분의 사용자는 Laravel 자체의 `session` 메서드를 사용할 것입니다.

이제 `getSession`은 `Illuminate\Session\Store` 또는 `null`을 반환하는 대신, **`Symfony\Component\HttpFoundation\Session\SessionInterface` 구현체**를 반환하거나, 세션이 없을 경우 `\Symfony\Component\HttpFoundation\Exception\SessionNotFoundException` 예외를 던집니다.

### 테스트(Testing)

<a name="the-assert-deleted-method"></a>
#### `assertDeleted` 메서드

**영향 가능성: 중간**

모든 `assertDeleted` 호출을 **`assertModelMissing`으로 바꿔야** 합니다.

### 신뢰된 프록시(Trusted Proxies)

**영향 가능성: 낮음**

라라벨 8 프로젝트의 코드를 새 라라벨 9 애플리케이션 스켈레톤으로 이전하는 경우, **신뢰된 프록시 미들웨어**를 업데이트해야 할 수 있습니다.

`app/Http/Middleware/TrustProxies.php`에서, 

`use Fideloper\Proxy\TrustProxies as Middleware`를  
`use Illuminate\Http\Middleware\TrustProxies as Middleware`로 변경하세요.

그리고 같은 파일의 `$headers` 프로퍼티를 아래와 같이 수정합니다.

```php
// 변경 전...
protected $headers = Request::HEADER_X_FORWARDED_ALL;

// 변경 후...
protected $headers =
    Request::HEADER_X_FORWARDED_FOR |
    Request::HEADER_X_FORWARDED_HOST |
    Request::HEADER_X_FORWARDED_PORT |
    Request::HEADER_X_FORWARDED_PROTO |
    Request::HEADER_X_FORWARDED_AWS_ELB;
```

마지막으로, 아래 명령어로 `fideloper/proxy` Composer 의존성을 제거할 수 있습니다.

```shell
composer remove fideloper/proxy
```

### 유효성 검증(Validation)

#### Form Request의 `validated` 메서드

**영향 가능성: 낮음**

폼 리퀘스트에서 제공하는 `validated` 메서드는 이제 `$key`, `$default` 인수를 받을 수 있게 되었습니다. 직접 오버라이딩하는 경우 시그니처를 아래와 같이 수정해야 합니다.

```php
public function validated($key = null, $default = null)
```

<a name="the-password-rule"></a>
#### `password` 규칙

**영향 가능성: 중간**

입력값이 현재 인증된 사용자의 비밀번호와 일치하는지 검사하는 `password` 규칙의 이름이 **`current_password`**로 변경되었습니다.

<a name="unvalidated-array-keys"></a>
#### 검증되지 않은 배열 키

**영향 가능성: 중간**

기존 라라벨에서는 validator가 반환하는 "validated" 데이터에서, 검증되지 않은 배열 키를 직접 제외(exclude)하도록 별도의 설정이 필요했습니다. 9.x부터는, **명시적으로 허용된 키를 지정하지 않아도** 검증되지 않은 배열 키는 기본적으로 제외됩니다. 이전 동작 방식에 의존하던 코드를 9.x로 업그레이드해도 대부분 영향이 없겠지만, 기존 8.x 방식을 그대로 사용하고 싶다면 서비스 프로바이더의 `boot` 메서드에서 아래 메서드를 호출하면 됩니다.

```php
use Illuminate\Support\Facades\Validator;

/**
 * 모든 애플리케이션 서비스 등록
 *
 * @return void
 */
public function boot()
{
    Validator::includeUnvalidatedArrayKeys();
}
```

<a name="miscellaneous"></a>
### 기타(Miscellaneous)

`laravel/laravel` [GitHub 저장소](https://github.com/laravel/laravel)의 변경점도 확인해보시길 바랍니다. 이들 중 다수는 필수 항목은 아니지만, 필요에 따라 애플리케이션의 설정 파일이나 주석 등도 동기화할 수 있습니다. [GitHub 비교 도구](https://github.com/laravel/laravel/compare/8.x...9.x)를 이용하면 어떤 변경 사항이 있는지 한눈에 비교할 수 있습니다.