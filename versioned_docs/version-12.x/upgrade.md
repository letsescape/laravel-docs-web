# 업그레이드 가이드 (Upgrade Guide)

- [11.x에서 12.0으로 업그레이드하기](#upgrade-12.0)

<a name="high-impact-changes"></a>
## 영향이 큰 변경 사항

<div class="content-list" markdown="1">

- [의존성 업데이트](#updating-dependencies)
- [라라벨 인스톨러 업데이트](#updating-the-laravel-installer)

</div>

<a name="medium-impact-changes"></a>
## 중간 영향 변경 사항

<div class="content-list" markdown="1">

- [모델과 UUIDv7](#models-and-uuidv7)

</div>

<a name="low-impact-changes"></a>
## 영향이 적은 변경 사항

<div class="content-list" markdown="1">

- [Carbon 3](#carbon-3)
- [Concurrency 결과 인덱스 매핑](#concurrency-result-index-mapping)
- [컨테이너 클래스 의존성 해결](#container-class-dependency-resolution)
- [이미지 유효성 검증에서 SVG 제외](#image-validation)
- [다중 스키마 데이터베이스 인스펙트](#multi-schema-database-inspecting)
- [중첩 배열 요청 머지](#nested-array-request-merging)

</div>

<a name="upgrade-12.0"></a>
## 11.x에서 12.0으로 업그레이드하기

#### 예상 업그레이드 소요 시간: 5분

> [!NOTE]
> 모든 잠재적인 하위 호환성 파괴(breaking change) 사항을 문서화하려고 노력했습니다. 하지만 이 중 일부는 프레임워크의 드문 부분에 해당하므로 실제로 애플리케이션에 영향을 주는 변경 사항은 제한적일 수 있습니다. 시간을 절약하고 싶으신가요? [Laravel Shift](https://laravelshift.com/)를 사용해 애플리케이션 업그레이드를 자동화할 수 있습니다.

<a name="updating-dependencies"></a>
### 의존성 업데이트

**영향 가능성: 높음**

애플리케이션의 `composer.json` 파일에 다음 의존성들을 반드시 업데이트해야 합니다.

<div class="content-list" markdown="1">

- `laravel/framework`를 `^12.0`으로
- `phpunit/phpunit`을 `^11.0`으로
- `pestphp/pest`를 `^3.0`으로

</div>

<a name="carbon-3"></a>
#### Carbon 3

**영향 가능성: 낮음**

[Carbon 2.x](https://carbon.nesbot.com/docs/) 지원이 제거되었습니다. 이제 모든 라라벨 12 애플리케이션은 [Carbon 3.x](https://carbon.nesbot.com/docs/#api-carbon-3)를 필요로 합니다.

<a name="updating-the-laravel-installer"></a>
### 라라벨 인스톨러 업데이트

새로운 라라벨 애플리케이션을 만들 때 CLI 도구인 라라벨 인스톨러를 사용하는 경우, 라라벨 12.x 및 [새로운 라라벨 스타터 킷](https://laravel.com/starter-kits)과 호환되도록 인스톨러를 반드시 업데이트해야 합니다. `composer global require`로 라라벨 인스톨러를 설치했다면, 다음 명령어로 인스톨러를 업데이트할 수 있습니다.

```shell
composer global update laravel/installer
```

만약 `php.new`를 통해 PHP와 라라벨을 설치했었다면, 운영 체제에 맞는 `php.new` 설치 명령어를 다시 실행해주면 최신 버전의 PHP와 라라벨 인스톨러가 설치됩니다.

```shell tab=macOS
/bin/bash -c "$(curl -fsSL https://php.new/install/mac/8.4)"
```

```shell tab=Windows PowerShell
# 관리자 권한으로 실행하세요...
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.4'))
```

```shell tab=Linux
/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.4)"
```

또는, [Laravel Herd](https://herd.laravel.com)에 번들된 라라벨 인스톨러를 사용하고 있다면, Herd도 최신 릴리스로 업데이트해야 합니다.

<a name="authentication"></a>
### 인증(Authentication)

<a name="updated-databasetokenrepository-constructor-signature"></a>
#### `DatabaseTokenRepository` 생성자 시그니처 변경

**영향 가능성: 매우 낮음**

`Illuminate\Auth\Passwords\DatabaseTokenRepository` 클래스의 생성자는 이제 `$expires` 파라미터를 분 단위가 아닌 초 단위로 입력받도록 변경되었습니다.

<a name="concurrency"></a>
### 동시성(Concurrency)

<a name="concurrency-result-index-mapping"></a>
#### Concurrency 결과 인덱스 매핑

**영향 가능성: 낮음**

`Concurrency::run` 메서드에 연관 배열(associative array)을 전달하면, 이제 각 작업 결과가 입력된 키와 함께 반환됩니다.

```php
$result = Concurrency::run([
    'task-1' => fn () => 1 + 1,
    'task-2' => fn () => 2 + 2,
]);

// ['task-1' => 2, 'task-2' => 4]
```

<a name="container"></a>
### 컨테이너(Container)

<a name="container-class-dependency-resolution"></a>
#### 컨테이너 클래스 의존성 해결

**영향 가능성: 낮음**

의존성 주입 컨테이너가 클래스 인스턴스 생성 시, 이제 클래스의 속성(property)에 지정된 기본값을 존중하도록 동작이 변경되었습니다. 이전에는 컨테이너가 기본값 없이 인스턴스를 생성하던 경우가 있었다면, 이 변경에 따라 애플리케이션 로직을 조정해야 할 수도 있습니다.

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
### 데이터베이스(Database)

<a name="multi-schema-database-inspecting"></a>
#### 다중 스키마 데이터베이스 인스펙트

**영향 가능성: 낮음**

`Schema::getTables()`, `Schema::getViews()`, `Schema::getTypes()` 메서드는 이제 기본적으로 모든 스키마의 결과를 포함합니다. 특정 스키마만 조회하려면 `schema` 인수를 전달할 수 있습니다.

```php
// 모든 스키마에 존재하는 모든 테이블...
$tables = Schema::getTables();

// 'main' 스키마에 있는 모든 테이블...
$table = Schema::getTables(schema: 'main');

// 'main'과 'blog' 스키마에 있는 모든 테이블...
$table = Schema::getTables(schema: ['main', 'blog']);
```

또한 `Schema::getTableListing()` 메서드도, 기본적으로 스키마가 포함된 테이블 이름을 반환합니다. 동작을 변경하려면 `schemaQualified` 인수를 활용할 수 있습니다.

```php
$tables = Schema::getTableListing();
// ['main.migrations', 'main.users', 'blog.posts']

$table = Schema::getTableListing(schema: 'main');
// ['main.migrations', 'main.users']

$table = Schema::getTableListing(schema: 'main', schemaQualified: false);
// ['migrations', 'users']
```

MySQL, MariaDB, SQLite에서도 이제 `db:table`, `db:show` 명령어가 PostgreSQL이나 SQL Server와 동일하게 모든 스키마의 결과를 출력합니다.

<a name="updated-blueprint-constructor-signature"></a>
#### `Blueprint` 생성자 시그니처 변경

**영향 가능성: 매우 낮음**

`Illuminate\Database\Schema\Blueprint` 클래스의 생성자는 이제 첫 번째 인수로 `Illuminate\Database\Connection` 인스턴스를 요구합니다.

<a name="eloquent"></a>
### Eloquent

<a name="models-and-uuidv7"></a>
#### 모델과 UUIDv7

**영향 가능성: 중간**

`HasUuids` 트레이트는 이제 UUID 버전 7(순서가 있는 UUID)에 맞는 값을 반환합니다. 기존에 모델의 ID로 순서가 있는 UUIDv4 문자열을 사용하고 싶다면, 이제 `HasVersion4Uuids` 트레이트를 사용해야 합니다.

```php
use Illuminate\Database\Eloquent\Concerns\HasUuids; // [tl! remove]
use Illuminate\Database\Eloquent\Concerns\HasVersion4Uuids as HasUuids; // [tl! add]
```

`HasVersion7Uuids` 트레이트는 삭제되었습니다. 기존에 이 트레이트를 사용했던 경우, 동일한 기능을 제공하는 `HasUuids` 트레이트를 대신 사용해야 합니다.

<a name="requests"></a>
### 요청(Requests)

<a name="nested-array-request-merging"></a>
#### 중첩 배열 요청 머지

**영향 가능성: 낮음**

`$request->mergeIfMissing()` 메서드는 이제 'dot' 표기법을 사용해 중첩 배열 데이터를 병합할 수 있습니다. 이전에는 이 메서드를 활용해 'dot' 표기법 그대로의 키를 갖는 최상위 배열 키를 생성했다면, 동작 변화에 맞춰 애플리케이션을 조정해야 합니다.

```php
$request->mergeIfMissing([
    'user.last_name' => 'Otwell',
]);
```

<a name="validation"></a>
### 유효성 검증(Validation)

<a name="image-validation"></a>
#### 이미지 유효성 검증에서 SVG 제외

`image` 유효성 검증 규칙은 더 이상 SVG 이미지를 기본적으로 허용하지 않습니다. SVG를 `image` 규칙에서 허용하려면 명시적으로 설정해야 합니다.

```php
use Illuminate\Validation\Rules\File;

'photo' => 'required|image:allow_svg'

// 혹은...
'photo' => ['required', File::image(allowSvg: true)],
```

<a name="miscellaneous"></a>
### 기타

`laravel/laravel`의 [GitHub 저장소](https://github.com/laravel/laravel)에서 변경점을 함께 확인할 것을 권장합니다. 이 중 많은 변경점이 필수는 아니지만, 애플리케이션과 동기화를 유지하고 싶을 수 있습니다. 일부 변경사항은 본 업그레이드 가이드에서 다루고 있지만, 설정 파일이나 주석 등과 같은 다른 변경점들은 다루지 않습니다. [GitHub 비교 도구](https://github.com/laravel/laravel/compare/11.x...12.x)를 활용해 중요한 변경 내역을 쉽게 확인하고, 필요한 업데이트만 선택하면 됩니다.
