# 업그레이드 가이드 (Upgrade Guide)

- [11.x에서 12.0으로 업그레이드하기](#upgrade-12.0)

<a name="high-impact-changes"></a>
## 영향도가 높은 변경사항

<div class="content-list" markdown="1">

- [의존성 업데이트](#updating-dependencies)
- [라라벨 인스톨러 업데이트](#updating-the-laravel-installer)

</div>

<a name="medium-impact-changes"></a>
## 영향도가 중간인 변경사항

<div class="content-list" markdown="1">

- [모델과 UUIDv7](#models-and-uuidv7)

</div>

<a name="low-impact-changes"></a>
## 영향도가 낮은 변경사항

<div class="content-list" markdown="1">

- [카본 3](#carbon-3)
- [Concurrency 결과 인덱스 매핑](#concurrency-result-index-mapping)
- [컨테이너 클래스 의존성 해결](#container-class-dependency-resolution)
- [이미지 유효성 검증에서 SVG 제외](#image-validation)
- [다중 스키마 데이터베이스 조회](#multi-schema-database-inspecting)
- [중첩 배열 요청 병합](#nested-array-request-merging)

</div>

<a name="upgrade-12.0"></a>
## 11.x에서 12.0으로 업그레이드하기

#### 예상 업그레이드 시간: 5분

> [!NOTE]
> 가능한 모든 변경점과 호환성 문제를 최대한 문서화하고 있습니다. 다만, 일부 변경사항은 프레임워크의 잘 알려지지 않은 부분에 적용되기 때문에 실제로는 전체 변경사항 중 일부만이 여러분의 애플리케이션에 영향을 미칠 수 있습니다. 시간을 절약하고 싶으신가요? [Laravel Shift](https://laravelshift.com/)를 사용하면 애플리케이션 업그레이드를 자동화하는 데 도움이 됩니다.

<a name="updating-dependencies"></a>
### 의존성 업데이트

**영향도: 높음**

애플리케이션의 `composer.json` 파일에서 다음 의존성을 업데이트해야 합니다.

<div class="content-list" markdown="1">

- `laravel/framework`를 `^12.0`으로
- `phpunit/phpunit`을 `^11.0`으로
- `pestphp/pest`를 `^3.0`으로

</div>

<a name="carbon-3"></a>
#### 카본 3

**영향도: 낮음**

[Carbon 2.x](https://carbon.nesbot.com/docs/)에 대한 지원이 제거되었습니다. 이제 모든 Laravel 12 애플리케이션에서 [Carbon 3.x](https://carbon.nesbot.com/docs/#api-carbon-3)가 필요합니다.

<a name="updating-the-laravel-installer"></a>
### 라라벨 인스톨러 업데이트

새로운 라라벨 애플리케이션을 만들 때 Laravel 인스톨러 CLI 도구를 사용하고 있다면, 인스톨러도 Laravel 12.x와 [새로운 라라벨 스타터 킷](https://laravel.com/starter-kits)과 호환되도록 업데이트해야 합니다. `composer global require`로 라라벨 인스톨러를 설치했다면, 아래와 같이 인스톨러를 업데이트할 수 있습니다.

```shell
composer global update laravel/installer
```

만약 PHP와 Laravel을 처음에 `php.new`를 통해 설치했다면, 사용하는 운영체제에 맞는 `php.new` 설치 명령어를 다시 실행하면 최신 버전의 PHP와 라라벨 인스톨러가 설치됩니다.

```shell tab=macOS
/bin/bash -c "$(curl -fsSL https://php.new/install/mac/8.4)"
```

```shell tab=Windows PowerShell
# 관리자 권한으로 실행...
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.4'))
```

```shell tab=Linux
/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.4)"
```

또는, [Laravel Herd](https://herd.laravel.com)에 포함된 라라벨 인스톨러를 사용 중이라면 Herd를 최신 버전으로 업데이트하는 것이 좋습니다.

<a name="authentication"></a>
### 인증

<a name="updated-databasetokenrepository-constructor-signature"></a>
#### `DatabaseTokenRepository` 생성자 시그니처 변경

**영향도: 매우 낮음**

`Illuminate\Auth\Passwords\DatabaseTokenRepository` 클래스의 생성자가 이제 `$expires` 파라미터를 분(minute) 단위 대신 "초(second)" 단위로 받도록 변경되었습니다.

<a name="concurrency"></a>
### 동시성(Concurrency)

<a name="concurrency-result-index-mapping"></a>
#### Concurrency 결과 인덱스 매핑

**영향도: 낮음**

`Concurrency::run` 메서드에서 연관 배열(associative array)로 작업을 실행할 때, 이제 각 작업의 결과가 해당 키와 매핑되어 반환됩니다.

```php
$result = Concurrency::run([
    'task-1' => fn () => 1 + 1,
    'task-2' => fn () => 2 + 2,
]);

// ['task-1' => 2, 'task-2' => 4]
```

<a name="container"></a>
### 컨테이너

<a name="container-class-dependency-resolution"></a>
#### 컨테이너 클래스 의존성 해결

**영향도: 낮음**

의존성 주입 컨테이너가 클래스 인스턴스를 생성할 때, 이제 클래스 속성의 기본값(default value)을 존중하게 되었습니다. 기존에 컨테이너가 기본값 없이 클래스를 반환하는 것에 의존하고 있었다면, 이 변경에 맞게 애플리케이션 코드를 조정해야 할 수 있습니다.

```php
class Example
{
    public function __construct(public ?Carbon $date = null) {}
}

$example = resolve(Example::class);

// <= 11.x
$example->date instanceof Carbon;

// >= 12.x
$example->date === null;
```

<a name="database"></a>
### 데이터베이스

<a name="multi-schema-database-inspecting"></a>
#### 다중 스키마 데이터베이스 조회

**영향도: 낮음**

`Schema::getTables()`, `Schema::getViews()`, `Schema::getTypes()` 메서드는 이제 기본적으로 모든 스키마의 결과를 포함합니다. 특정 스키마의 결과만 얻으려면 `schema` 인수를 전달하면 됩니다.

```php
// 모든 스키마의 테이블 조회
$tables = Schema::getTables();

// 'main' 스키마의 모든 테이블 조회
$table = Schema::getTables(schema: 'main');

// 'main'과 'blog' 스키마의 테이블만 조회
$table = Schema::getTables(schema: ['main', 'blog']);
```

또한, `Schema::getTableListing()` 메서드는 기본적으로 스키마 이름이 포함된 테이블 이름(스키마-테이블)을 반환합니다. 원하는 동작에 맞게 `schemaQualified` 인수를 활용할 수 있습니다.

```php
$tables = Schema::getTableListing();
// ['main.migrations', 'main.users', 'blog.posts']

$table = Schema::getTableListing(schema: 'main');
// ['main.migrations', 'main.users']

$table = Schema::getTableListing(schema: 'main', schemaQualified: false);
// ['migrations', 'users']
```

MySQL, MariaDB, SQLite에서도 이제 `db:table` 및 `db:show` 명령이 PostgreSQL과 SQL Server와 마찬가지로 모든 스키마의 결과를 출력합니다.

<a name="updated-blueprint-constructor-signature"></a>
#### `Blueprint` 생성자 시그니처 변경

**영향도: 매우 낮음**

`Illuminate\Database\Schema\Blueprint` 클래스의 생성자는 이제 첫 번째 인수로 `Illuminate\Database\Connection` 인스턴스를 받도록 변경되었습니다.

<a name="eloquent"></a>
### Eloquent

<a name="models-and-uuidv7"></a>
#### 모델과 UUIDv7

**영향도: 중간**

`HasUuids` 트레이트는 이제 UUID 스펙의 버전 7(정렬 가능한 ordered UUID)에 맞는 UUID를 반환합니다. 기존처럼 UUIDv4 방식의 ordered UUID 문자열을 모델의 ID로 계속 사용하고 싶다면, 이제 `HasVersion4Uuids` 트레이트를 사용해야 합니다.

```php
use Illuminate\Database\Eloquent\Concerns\HasUuids; // [tl! remove]
use Illuminate\Database\Eloquent\Concerns\HasVersion4Uuids as HasUuids; // [tl! add]
```

한편, `HasVersion7Uuids` 트레이트는 제거되었습니다. 이전에 이 트레이트를 사용하고 있던 경우, 이제부터는 `HasUuids` 트레이트를 사용하면 되고, 이 트레이트가 동일한 동작을 제공합니다.

<a name="requests"></a>
### 요청(Request)

<a name="nested-array-request-merging"></a>
#### 중첩 배열 요청 병합

**영향도: 낮음**

`$request->mergeIfMissing()` 메서드가 이제 "dot" 표기법을 이용해 중첩 배열 데이터를 병합할 수 있도록 변경되었습니다. 이전에는 "dot" 표기법 키를 그대로 상위 배열의 키로 추가하는 방식에 의존했다면, 이 변경에 맞춰 애플리케이션을 수정해야 할 수 있습니다.

```php
$request->mergeIfMissing([
    'user.last_name' => 'Otwell',
]);
```

<a name="validation"></a>
### 유효성 검증

<a name="image-validation"></a>
#### 이미지 유효성 검증에서 SVG 제외

`image` 유효성 검증 규칙이 이제 기본적으로 SVG 이미지를 허용하지 않습니다. `image` 규칙에서 SVG를 허용하려면 명시적으로 허용 옵션을 추가해야 합니다.

```php
use Illuminate\Validation\Rules\File;

'photo' => 'required|image:allow_svg'

// 또는...
'photo' => ['required', File::image(allowSvg: true)],
```

<a name="miscellaneous"></a>
### 기타 변경사항

`laravel/laravel` [GitHub 저장소](https://github.com/laravel/laravel)의 변경사항도 참고하는 것을 권장합니다. 이 중 다수는 필수 변경사항이 아니지만, 애플리케이션의 파일을 최신 상태로 유지하고자 할 수 있습니다. 이 업그레이드 가이드에서 다루지 않는 일부 설정 파일, 주석 등도 해당됩니다. [GitHub 비교 도구](https://github.com/laravel/laravel/compare/11.x...12.x)를 사용해 변경사항을 손쉽게 확인하고, 필요한 업데이트만 적용할 수 있습니다.
