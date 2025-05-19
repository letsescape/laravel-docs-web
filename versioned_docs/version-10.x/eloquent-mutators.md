# Eloquent: 접근자 & 캐스팅 (Eloquent: Mutators & Casting)

- [소개](#introduction)
- [접근자와 변이자](#accessors-and-mutators)
    - [접근자 정의하기](#defining-an-accessor)
    - [변이자 정의하기](#defining-a-mutator)
- [속성 캐스팅](#attribute-casting)
    - [배열 및 JSON 캐스팅](#array-and-json-casting)
    - [날짜 캐스팅](#date-casting)
    - [열거형 캐스팅](#enum-casting)
    - [암호화 캐스팅](#encrypted-casting)
    - [쿼리 타임 캐스팅](#query-time-casting)
- [사용자 정의 캐스팅](#custom-casts)
    - [값 객체 캐스팅](#value-object-casting)
    - [배열 / JSON 직렬화](#array-json-serialization)
    - [입력 전용 캐스팅](#inbound-casting)
    - [캐스팅 파라미터](#cast-parameters)
    - [Castable](#castables)

<a name="introduction"></a>
## 소개

접근자(accessor), 변이자(mutator), 속성 캐스팅(attribute casting)은 Eloquent 모델 인스턴스에서 속성 값을 조회하거나 설정할 때 값을 변환할 수 있게 해줍니다. 예를 들어, [라라벨 인크립터](/docs/10.x/encryption)를 사용해 데이터를 데이터베이스에 저장할 때는 암호화하고, Eloquent 모델에서 해당 속성을 접근할 때 자동으로 복호화할 수 있습니다. 또는, 데이터베이스에 저장된 JSON 문자열을 Eloquent 모델에서 접근할 때 배열로 변환해서 사용할 수 있습니다.

<a name="accessors-and-mutators"></a>
## 접근자와 변이자

<a name="defining-an-accessor"></a>
### 접근자 정의하기

접근자(accessor)는 Eloquent 속성 값을 접근할 때 값을 가공합니다. 접근자를 정의하려면, 모델에서 접근할 속성에 해당하는 protected 메서드를 생성합니다. 이 메서드의 이름은 실제 모델 속성/데이터베이스 컬럼의 "카멜 케이스(camel case)" 형식이어야 합니다.

아래 예시는 `first_name` 속성에 접근자를 정의하는 방법입니다. 이 접근자는 Eloquent에서 `first_name`의 값을 조회하려 할 때 자동으로 호출됩니다. 접근자/변이자 메서드는 반드시 `Illuminate\Database\Eloquent\Casts\Attribute` 타입 힌트를 반환해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 사용자의 이름을 반환합니다.
     */
    protected function firstName(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => ucfirst($value),
        );
    }
}
```

접근자 메서드는 모두 `Attribute` 인스턴스를 반환하며, 이 객체에서 해당 속성을 조회하거나(그리고 선택적으로, 변이할 때) 어떻게 처리할지 정의합니다. 위 예제에서는 속성을 조회할 때만 동작하도록 `Attribute` 클래스의 `get` 인자를 지정했습니다.

이처럼, 컬럼의 원래 값이 접근자로 전달되어 원하는 방식으로 가공할 수 있습니다. 접근자의 값을 읽으려면, 모델 인스턴스에서 `first_name` 속성을 단순히 조회하면 됩니다.

```
use App\Models\User;

$user = User::find(1);

$firstName = $user->first_name;
```

> [!NOTE]
> 접근자나 계산된 값을 모델의 배열/JSON 표현에도 포함하고 싶다면, [직렬화 시 값을 추가하는 방법](/docs/10.x/eloquent-serialization#appending-values-to-json)을 참고해야 합니다.

<a name="building-value-objects-from-multiple-attributes"></a>
#### 여러 속성에서 값 객체(Value Object) 생성하기

때로는 접근자에서 여러 모델 속성을 하나의 "값 객체(value object)"로 합쳐 반환해야 할 때가 있습니다. 이 경우 `get` 클로저의 두 번째 인자로 `$attributes`를 받을 수 있는데, 이 값은 모델의 현재 모든 속성을 담은 배열입니다.

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * 사용자의 주소를 반환합니다.
 */
protected function address(): Attribute
{
    return Attribute::make(
        get: fn (mixed $value, array $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
    );
}
```

<a name="accessor-caching"></a>
#### 접근자 캐싱

접근자에서 값 객체(value object)를 반환할 때, 값 객체에 변경을 가하면 그 변경 내용이 모델이 저장되기 전에 자동으로 모델에 반영됩니다. 이는 Eloquent가 접근자에서 반환된 객체 인스턴스를 유지하여, 접근자가 반복적으로 호출될 때 동일한 객체를 반환하기 때문입니다.

```
use App\Models\User;

$user = User::find(1);

$user->address->lineOne = 'Updated Address Line 1 Value';
$user->address->lineTwo = 'Updated Address Line 2 Value';

$user->save();
```

다만, 문자열이나 불리언과 같은 단순 값(프리미티브 타입)에 대해서도 계산 비용이 크다면 캐싱을 활성화하고 싶을 수 있습니다. 이 경우 접근자 정의 시 `shouldCache` 메서드를 호출하면 됩니다.

```php
protected function hash(): Attribute
{
    return Attribute::make(
        get: fn (string $value) => bcrypt(gzuncompress($value)),
    )->shouldCache();
}
```

반대로, 속성의 객체 캐싱 동작을 비활성화하고 싶다면, 접근자 정의 시 `withoutObjectCaching` 메서드를 호출할 수 있습니다.

```php
/**
 * 사용자의 주소를 반환합니다.
 */
protected function address(): Attribute
{
    return Attribute::make(
        get: fn (mixed $value, array $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
    )->withoutObjectCaching();
}
```

<a name="defining-a-mutator"></a>
### 변이자 정의하기

변이자(mutator)는 Eloquent 속성 값이 설정될 때 값을 가공합니다. 변이자를 정의하려면, 접근자 정의 시 `set` 인자를 추가하면 됩니다. 아래는 `first_name` 속성에 변이자를 정의하는 예시입니다. 이 변이자는 `first_name` 속성에 값을 설정하려 할 때 자동으로 호출됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 사용자의 이름을 조작합니다.
     */
    protected function firstName(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => ucfirst($value),
            set: fn (string $value) => strtolower($value),
        );
    }
}
```

변이자 클로저는 해당 속성에 할당되는 값을 받아, 이를 가공한 후 반환합니다. 실제로 변이자를 사용하려면 Eloquent 모델의 `first_name` 속성에 값을 할당하기만 하면 됩니다.

```
use App\Models\User;

$user = User::find(1);

$user->first_name = 'Sally';
```

이 예제에서 `set` 콜백은 `Sally`라는 값을 입력받습니다. 변이자는 이 값을 `strtolower` 함수로 처리해, 그 결과를 모델 내부의 `$attributes` 배열에 할당합니다.

<a name="mutating-multiple-attributes"></a>
#### 여러 속성 동시 변이하기

변이자에서 여러 속성 값을 동시에 변경해야 할 때도 있습니다. 이럴 땐 `set` 클로저에서 배열을 반환하면 되며, 배열의 각 키는 실제 모델의 속성/데이터베이스 컬럼명을 사용해야 합니다.

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * 사용자의 주소를 조작합니다.
 */
protected function address(): Attribute
{
    return Attribute::make(
        get: fn (mixed $value, array $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
        set: fn (Address $value) => [
            'address_line_one' => $value->lineOne,
            'address_line_two' => $value->lineTwo,
        ],
    );
}
```

<a name="attribute-casting"></a>
## 속성 캐스팅

속성 캐스팅(attribute casting)은 접근자/변이자와 비슷한 기능을 제공하지만, 별도의 메서드를 작성하지 않고도 속성 변환을 쉽게 처리할 수 있습니다. 모델의 `$casts` 프로퍼티를 사용해 데이터 타입 변환을 지정할 수 있습니다.

`$casts` 프로퍼티는 배열이어야 하며, 키는 변환할 속성명, 값은 해당 컬럼에 적용할 캐스팅 타입입니다. 지원되는 캐스팅 타입은 아래와 같습니다.

<div class="content-list" markdown="1">

- `array`
- `AsStringable::class`
- `boolean`
- `collection`
- `date`
- `datetime`
- `immutable_date`
- `immutable_datetime`
- <code>decimal:&lt;precision&gt;</code>
- `double`
- `encrypted`
- `encrypted:array`
- `encrypted:collection`
- `encrypted:object`
- `float`
- `hashed`
- `integer`
- `object`
- `real`
- `string`
- `timestamp`

</div>

예를 들어, 데이터베이스에 정수(`0` 또는 `1`)로 저장된 `is_admin` 속성을 불리언 타입으로 변환하려면 다음과 같이 작성할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 캐스팅할 속성 목록입니다.
     *
     * @var array
     */
    protected $casts = [
        'is_admin' => 'boolean',
    ];
}
```

이렇게 캐스트를 지정하면, 실제 데이터베이스에 정수로 저장되어 있어도 `is_admin` 속성에 접근할 때 항상 불리언 값으로 반환됩니다.

```
$user = App\Models\User::find(1);

if ($user->is_admin) {
    // ...
}
```

런타임에 새로운(임시) 캐스트를 추가해야 한다면 `mergeCasts` 메서드를 사용할 수 있습니다. 이 방법으로 기존에 지정한 캐스트에 추가할 수 있습니다.

```
$user->mergeCasts([
    'is_admin' => 'integer',
    'options' => 'object',
]);
```

> [!WARNING]
> `null` 값인 속성은 캐스팅이 적용되지 않습니다. 또한 모델의 리턴 관계 명칭과 동일한 이름의 캐스트나 속성을 정의해서는 안 되며, 주키(primary key)에 캐스팅을 할당하는 것도 피해야 합니다.

<a name="stringable-casting"></a>
#### Stringable 캐스팅

모델 속성을 [플루언트한 `Illuminate\Support\Stringable` 객체](/docs/10.x/strings#fluent-strings-method-list)로 변환하려면 `Illuminate\Database\Eloquent\Casts\AsStringable` 캐스트 클래스를 사용할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\AsStringable;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 캐스팅할 속성 목록입니다.
     *
     * @var array
     */
    protected $casts = [
        'directory' => AsStringable::class,
    ];
}
```

<a name="array-and-json-casting"></a>
### 배열 및 JSON 캐스팅

`array` 캐스팅 타입은 직렬화된 JSON 컬럼을 다룰 때 특히 유용합니다. 예를 들어, 데이터베이스의 `JSON` 혹은 `TEXT` 타입 필드에 JSON 문자열이 들어 있다면, 해당 속성에 `array` 캐스트를 적용해두면 모델에서 해당 값을 읽을 때 자동으로 PHP 배열로 변환해줍니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 캐스팅할 속성 목록입니다.
     *
     * @var array
     */
    protected $casts = [
        'options' => 'array',
    ];
}
```

캐스트를 지정해두면 `options` 속성에 접근할 때마다 JSON에서 PHP 배열로 역직렬화됩니다. 값을 설정할 때는, 할당한 배열이 자동으로 JSON 문자열로 변환되어 저장됩니다.

```
use App\Models\User;

$user = User::find(1);

$options = $user->options;

$options['key'] = 'value';

$user->options = $options;

$user->save();
```

JSON 속성의 한 필드만 간단한 문법으로 업데이트하려면, [속성을 대량 할당 가능하도록 지정](/docs/10.x/eloquent#mass-assignment-json-columns)한 후 `update` 메서드에서 `->` 연산자를 사용할 수 있습니다.

```
$user = User::find(1);

$user->update(['options->key' => 'value']);
```

<a name="array-object-and-collection-casting"></a>
#### ArrayObject 및 Collection 캐스팅

기본 `array` 캐스팅은 많은 경우에 충분하지만 제약점이 있습니다. `array` 캐스팅 타입으로 반환된 배열(프리미티브 타입)은 배열 오프셋을 직접 변경할 때, 아래와 같이 PHP 에러가 발생할 수 있습니다.

```
$user = User::find(1);

$user->options['key'] = $value;
```

이 문제를 해결하기 위해, Laravel은 `AsArrayObject` 캐스팅 타입을 제공합니다. 이 타입은 JSON 속성을 PHP의 [ArrayObject](https://www.php.net/manual/en/class.arrayobject.php) 클래스로 캐스팅합니다. 이 기능은 [사용자 정의 캐스팅](#custom-casts) 기능을 활용하여, 개별 오프셋을 안전하게 변경할 수 있도록 하고, 객체 상태를 지능적으로 캐싱 및 동기화합니다.

사용하려면 다음과 같이 지정하면 됩니다.

```
use Illuminate\Database\Eloquent\Casts\AsArrayObject;

/**
 * 캐스팅할 속성 목록입니다.
 *
 * @var array
 */
protected $casts = [
    'options' => AsArrayObject::class,
];
```

유사하게, `AsCollection` 캐스팅 타입은 JSON 속성을 라라벨 [Collection](/docs/10.x/collections) 인스턴스로 변환합니다.

```
use Illuminate\Database\Eloquent\Casts\AsCollection;

/**
 * 캐스팅할 속성 목록입니다.
 *
 * @var array
 */
protected $casts = [
    'options' => AsCollection::class,
];
```

`AsCollection` 캐스팅 사용 시, 라라벨의 기본 Collection 대신 커스텀 컬렉션 클래스를 사용하려면 캐스트 인자로 해당 클래스명을 전달합니다.

```
use App\Collections\OptionCollection;
use Illuminate\Database\Eloquent\Casts\AsCollection;

/**
 * 캐스팅할 속성 목록입니다.
 *
 * @var array
 */
protected $casts = [
    'options' => AsCollection::class.':'.OptionCollection::class,
];
```

<a name="date-casting"></a>
### 날짜 캐스팅

기본적으로 Eloquent는 `created_at`, `updated_at` 컬럼을 [Carbon](https://github.com/briannesbitt/Carbon) 인스턴스(이 객체는 PHP의 `DateTime`을 확장하고 다양한 유틸리티 메서드를 제공합니다)로 캐스팅합니다. 그 외에도 더 많은 속성을 모델의 `$casts` 배열에 추가해서 날짜 캐스팅이 가능합니다. 일반적으로 날짜 관련 속성은 `datetime` 또는 `immutable_datetime` 캐스트 타입을 사용합니다.

`date` 또는 `datetime` 캐스팅 타입을 지정할 때, 날짜 포맷을 옵션으로 함께 설정할 수도 있습니다. 이 포맷은 [모델이 배열 또는 JSON으로 직렬화될 때](/docs/10.x/eloquent-serialization) 적용됩니다.

```
/**
 * 캐스팅할 속성 목록입니다.
 *
 * @var array
 */
protected $casts = [
    'created_at' => 'datetime:Y-m-d',
];
```

날짜로 캐스트된 컬럼에는 UNIX 타임스탬프, 날짜 문자열(`Y-m-d`), 날짜-시간 문자열, 또는 `DateTime`/`Carbon` 인스턴스를 직접 할당할 수 있습니다. 이때, 값은 내부적으로 적절한 형식으로 변환되어 저장됩니다.

모든 모델 날짜의 기본 직렬화 포맷을 지정하려면 모델에 `serializeDate` 메서드를 정의하면 됩니다. 이 메서드는 데이터베이스에 저장되는 포맷에는 영향을 주지 않습니다.

```
/**
 * 날짜를 배열/JSON 직렬화용으로 포맷합니다.
 */
protected function serializeDate(DateTimeInterface $date): string
{
    return $date->format('Y-m-d');
}
```

모델의 날짜 컬럼을 데이터베이스에 실제로 저장할 때의 포맷을 지정하려면 `$dateFormat` 프로퍼티를 설정합니다.

```
/**
 * 날짜 컬럼 저장 포맷입니다.
 *
 * @var string
 */
protected $dateFormat = 'U';
```

<a name="date-casting-and-timezones"></a>
#### 날짜 캐스팅, 직렬화, 그리고 타임존

기본적으로 `date`, `datetime` 캐스팅은 UTC 기반의 ISO-8601 문자열(`YYYY-MM-DDTHH:MM:SS.uuuuuuZ`)로 직렬화됩니다. 앱의 `timezone` 설정과 무관하게 UTC로 처리되므로, 앱의 `timezone` 설정을 기본값인 `UTC`로 놔두고, 일관적으로 UTC를 사용하는 것이 좋습니다. 이렇게 하면 PHP, 자바스크립트 등 다양한 날짜 라이브러리와의 호환성이 극대화됩니다.

만약 사용자 지정 포맷(예: `datetime:Y-m-d H:i:s`)을 적용하면, Carbon 인스턴스의 내부 타임존이 직렬화에 사용됩니다. 보통 이 값은 앱의 `timezone` 설정에 따릅니다.

<a name="enum-casting"></a>
### 열거형(ENUM) 캐스팅

Eloquent는 속성 값을 PHP [Enum](https://www.php.net/manual/en/language.enumerations.backed.php)으로도 변환할 수 있습니다. 사용하려면, 캐스팅할 속성과 Enum 클래스를 모델의 `$casts` 배열에 지정합니다.

```
use App\Enums\ServerStatus;

/**
 * 캐스팅할 속성 목록입니다.
 *
 * @var array
 */
protected $casts = [
    'status' => ServerStatus::class,
];
```

캐스트를 지정하면, 해당 속성은 자동으로 Enum 인스턴스로 변환되어 읽고 쓸 수 있습니다.

```
if ($server->status == ServerStatus::Provisioned) {
    $server->status = ServerStatus::Ready;

    $server->save();
}
```

<a name="casting-arrays-of-enums"></a>
#### 열거형 배열 캐스팅

하나의 컬럼에 Enum 값 배열을 저장해야 할 경우도 있습니다. 이럴 때는 Laravel이 제공하는 `AsEnumArrayObject` 또는 `AsEnumCollection` 캐스트를 사용할 수 있습니다.

```
use App\Enums\ServerStatus;
use Illuminate\Database\Eloquent\Casts\AsEnumCollection;

/**
 * 캐스팅할 속성 목록입니다.
 *
 * @var array
 */
protected $casts = [
    'statuses' => AsEnumCollection::class.':'.ServerStatus::class,
];
```

<a name="encrypted-casting"></a>
### 암호화 캐스팅

`encrypted` 캐스팅 타입을 지정하면, 라라벨의 [암호화](/docs/10.x/encryption) 기능을 이용해 속성값을 암호화해 저장합니다. 또한, `encrypted:array`, `encrypted:collection`, `encrypted:object`, `AsEncryptedArrayObject`, `AsEncryptedCollection` 캐스팅 타입도 있습니다. 이들은 각각의 비암호화 버전처럼 동작하지만, 데이터베이스에 저장 시 값을 암호화합니다.

암호화된 텍스트의 최종 길이는 예측이 어렵고 평문보다 훨씬 길 수 있습니다. 따라서, 데이터베이스 컬럼 타입을 반드시 `TEXT` 이상 크기로 지정해야 합니다. 또한, 값이 암호화되어 있으므로 데이터베이스 쿼리나 검색에서 해당 값을 직접 조회할 수 없습니다.

<a name="key-rotation"></a>
#### 키 교체(Key Rotation)

라라벨은 앱 설정 파일의 `key` 값(`APP_KEY` 환경변수)을 사용해 문자열을 암호화합니다. 앱의 암호화 키를 변경해야 한다면, 기존에 암호화된 속성을 새 키로 직접 다시 암호화해야 합니다.

<a name="query-time-casting"></a>
### 쿼리 타임 캐스팅

때로는 쿼리 실행 시점에도 캐스팅을 적용해야 할 때가 있습니다. 예를 들어, 테이블에서 RAW 값을 선택하는 경우가 있습니다.

```
use App\Models\Post;
use App\Models\User;

$users = User::select([
    'users.*',
    'last_posted_at' => Post::selectRaw('MAX(created_at)')
            ->whereColumn('user_id', 'users.id')
])->get();
```

이 쿼리의 결과에 포함된 `last_posted_at` 속성은 일반 문자열로 반환됩니다. 이 속성에 쿼리 실행 시점에 `datetime` 캐스트를 적용하려면 `withCasts` 메서드를 사용하면 됩니다.

```
$users = User::select([
    'users.*',
    'last_posted_at' => Post::selectRaw('MAX(created_at)')
            ->whereColumn('user_id', 'users.id')
])->withCasts([
    'last_posted_at' => 'datetime'
])->get();
```

<a name="custom-casts"></a>
## 사용자 정의 캐스팅

라라벨에서는 많은 내장 캐스팅 타입을 제공하지만, 필요하다면 직접 사용자 정의 캐스팅 타입을 생성할 수 있습니다. 새로운 캐스트 클래스를 만들려면 `make:cast` Artisan 명령어를 실행합니다. 생성된 클래스는 `app/Casts` 디렉터리에 위치합니다.

```shell
php artisan make:cast Json
```

사용자 정의 캐스트 클래스는 모두 `CastsAttributes` 인터페이스를 구현해야 합니다. 이 인터페이스는 `get`과 `set` 메서드 정의를 요구합니다. `get` 메서드는 데이터베이스의 원시 값을 변환하는 역할, `set` 메서드는 변환된 값을 데이터베이스에 저장할 수 있는 원시 값으로 변환하는 역할을 합니다. 아래는 내장된 `json` 캐스트 타입을 직접 구현한 예시입니다.

```
<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

class Json implements CastsAttributes
{
    /**
     * 주어진 값을 캐스팅합니다.
     *
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): array
    {
        return json_decode($value, true);
    }

    /**
     * 저장용 값을 준비합니다.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): string
    {
        return json_encode($value);
    }
}
```

사용자 정의 캐스트 타입을 정의했으면, 클래스명을 속성에 지정해 사용하면 됩니다.

```
<?php

namespace App\Models;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 캐스팅할 속성 목록입니다.
     *
     * @var array
     */
    protected $casts = [
        'options' => Json::class,
    ];
}
```

<a name="value-object-casting"></a>
### 값 객체 캐스팅

캐스팅은 프리미티브 타입에만 제한되지 않습니다. 객체로도 값을 캐스팅할 수 있습니다. 값 객체로 캐스팅하는 사용자 정의 캐스트 클래스도 프리미티브 타입과 유사하게 작성하며, 다만 `set` 메서드에서 원시로 저장할 키-값 쌍의 배열을 반환해야 합니다.

예시로, 여러 모델 값을 하나의 `Address` 값 객체로 취급하는 사용자 정의 캐스트 클래스를 만듭니다. 예시의 `Address` 객체에는 public 프로퍼티 `lineOne`, `lineTwo`가 있다고 가정합니다.

```
<?php

namespace App\Casts;

use App\ValueObjects\Address as AddressValueObject;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;

class Address implements CastsAttributes
{
    /**
     * 주어진 값을 캐스팅합니다.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): AddressValueObject
    {
        return new AddressValueObject(
            $attributes['address_line_one'],
            $attributes['address_line_two']
        );
    }

    /**
     * 저장용 값을 준비합니다.
     *
     * @param  array<string, mixed>  $attributes
     * @return array<string, string>
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): array
    {
        if (! $value instanceof AddressValueObject) {
            throw new InvalidArgumentException('The given value is not an Address instance.');
        }

        return [
            'address_line_one' => $value->lineOne,
            'address_line_two' => $value->lineTwo,
        ];
    }
}
```

값 객체로 캐스팅되어 반환된 속성은 값 객체의 속성을 변경하더라도, 모델이 저장되기 전에 해당 변경 내용이 자동으로 동기화됩니다.

```
use App\Models\User;

$user = User::find(1);

$user->address->lineOne = 'Updated Address Value';

$user->save();
```

> [!NOTE]
> 값 객체를 포함한 Eloquent 모델을 JSON 또는 배열로 직렬화할 계획이라면, 값 객체에 `Illuminate\Contracts\Support\Arrayable` 및 `JsonSerializable` 인터페이스를 구현해야 합니다.

<a name="value-object-caching"></a>
#### 값 객체 캐싱

값 객체로 캐스팅된 속성이 접근될 때 Eloquent에서 해당 객체 인스턴스를 캐싱합니다. 즉, 한 번 접근한 속성은 재접근 시 동일한 인스턴스가 반환됩니다.

사용자 정의 캐스트 클래스에서 객체 캐싱 기능을 비활성화하려면 public `$withoutObjectCaching` 프로퍼티를 `true`로 선언하면 됩니다.

```php
class Address implements CastsAttributes
{
    public bool $withoutObjectCaching = true;

    // ...
}
```

<a name="array-json-serialization"></a>
### 배열 / JSON 직렬화

Eloquent 모델을 배열이나 JSON으로 변환(`toArray`, `toJson` 메서드 사용)하면, 커스텀 캐스트 값 객체도 일반적으로 함께 직렬화됩니다(해당 객체가 `Illuminate\Contracts\Support\Arrayable`과 `JsonSerializable` 인터페이스를 구현한 경우). 하지만, 외부 라이브러리에서 제공하는 값 객체는 이 인터페이스를 추가할 수 없을 수도 있습니다.

이런 경우, 커스텀 캐스트 클래스에서 직접 값 객체의 직렬화 결과를 반환하도록 지정할 수 있습니다. 이를 위해, 커스텀 캐스트 클래스에서 `Illuminate\Contracts\Database\Eloquent\SerializesCastableAttributes` 인터페이스를 구현해야 하며, 직렬화 결과를 반환하는 `serialize` 메서드를 포함해야 합니다.

```
/**
 * 값의 직렬화된 표현을 반환합니다.
 *
 * @param  array<string, mixed>  $attributes
 */
public function serialize(Model $model, string $key, mixed $value, array $attributes): string
{
    return (string) $value;
}
```

<a name="inbound-casting"></a>
### 입력 전용(Inbound) 캐스팅

간혹 모델의 속성 값을 세팅할 때만 동작하고, 값을 읽을 때는 아무런 처리를 하지 않는 "입력 전용" 커스텀 캐스트 클래스를 만들어야 할 경우가 있습니다.

입력 전용 커스텀 캐스트는 `CastsInboundAttributes` 인터페이스를 구현해야 하며, 이 인터페이스에서는 `set` 메서드만 정의하면 됩니다. `make:cast` Artisan 명령어에 `--inbound` 옵션을 추가하면 입력 전용 캐스트 클래스를 손쉽게 생성할 수 있습니다.

```shell
php artisan make:cast Hash --inbound
```

입력 전용 캐스트의 대표적인 예시가 해싱 캐스트입니다. 예를 들어, 특정 알고리즘으로 입력 값을 해싱하는 캐스트를 만들 수 있습니다.

```
<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsInboundAttributes;
use Illuminate\Database\Eloquent\Model;

class Hash implements CastsInboundAttributes
{
    /**
     * 캐스트 클래스 인스턴스 생성자입니다.
     */
    public function __construct(
        protected string|null $algorithm = null,
    ) {}

    /**
     * 저장용으로 값을 준비합니다.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): string
    {
        return is_null($this->algorithm)
                    ? bcrypt($value)
                    : hash($this->algorithm, $value);
    }
}
```

<a name="cast-parameters"></a>
### 캐스팅 파라미터

커스텀 캐스트를 모델에 적용할 때, 클래스명 뒤에 `:` 문자를 사용해서 파라미터를 전달할 수 있습니다. 여러 파라미터는 콤마로 구분되며, 생성자에 인자로 전달됩니다.

```
/**
 * 캐스팅할 속성 목록입니다.
 *
 * @var array
 */
protected $casts = [
    'secret' => Hash::class.':sha256',
];
```

<a name="castables"></a>
### Castable (캐스터 제공 값 객체)

애플리케이션의 값 객체가 자신만의 커스텀 캐스터 클래스를 직접 지정할 수 있도록 하고 싶을 수 있습니다. 이때는 모델에 커스텀 캐스트 클래스 대신, `Illuminate\Contracts\Database\Eloquent\Castable` 인터페이스를 구현한 값 객체 클래스를 직접 지정하면 됩니다.

```
use App\ValueObjects\Address;

protected $casts = [
    'address' => Address::class,
];
```

`Castable` 인터페이스를 구현하는 객체는 해당 객체를 캐스팅할 커스텀 캐스터 클래스명을 반환하는 `castUsing` 메서드를 정의해야 합니다.

```
<?php

namespace App\ValueObjects;

use Illuminate\Contracts\Database\Eloquent\Castable;
use App\Casts\Address as AddressCast;

class Address implements Castable
{
    /**
     * 이 값 객체를 캐스팅할 때 사용할 캐스터 클래스명을 반환합니다.
     *
     * @param  array<string, mixed>  $arguments
     */
    public static function castUsing(array $arguments): string
    {
        return AddressCast::class;
    }
}
```

`Castable` 클래스를 사용할 때도, `$casts` 설정에서 파라미터를 함께 전달할 수 있습니다. 이 값들은 `castUsing` 메서드에 인자로 전달됩니다.

```
use App\ValueObjects\Address;

protected $casts = [
    'address' => Address::class.':argument',
];
```

<a name="anonymous-cast-classes"></a>
#### Castable & 익명(Anonymous) 캐스트 클래스

"Castable" 기능과 PHP의 [익명 클래스](https://www.php.net/manual/en/language.oop5.anonymous.php)를 결합해, 값 객체와 캐스팅 로직을 하나의 Castable 객체로 구현할 수도 있습니다. 이를 위해, 값 객체의 `castUsing` 메서드에서 익명 클래스를 반환하면 됩니다. 이 익명 클래스는 `CastsAttributes` 인터페이스를 구현해야 합니다.

```
<?php

namespace App\ValueObjects;

use Illuminate\Contracts\Database\Eloquent\Castable;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class Address implements Castable
{
    // ...

    /**
     * 이 값 객체를 캐스팅할 때 사용할 캐스터 객체를 반환합니다.
     *
     * @param  array<string, mixed>  $arguments
     */
    public static function castUsing(array $arguments): CastsAttributes
    {
        return new class implements CastsAttributes
        {
            public function get(Model $model, string $key, mixed $value, array $attributes): Address
            {
                return new Address(
                    $attributes['address_line_one'],
                    $attributes['address_line_two']
                );
            }

            public function set(Model $model, string $key, mixed $value, array $attributes): array
            {
                return [
                    'address_line_one' => $value->lineOne,
                    'address_line_two' => $value->lineTwo,
                ];
            }
        };
    }
}
```