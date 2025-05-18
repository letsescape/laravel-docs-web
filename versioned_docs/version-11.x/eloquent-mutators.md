# Eloquent: 접근자 & 캐스팅 (Eloquent: Mutators & Casting)

- [소개](#introduction)
- [접근자와 변조자](#accessors-and-mutators)
    - [접근자 정의하기](#defining-an-accessor)
    - [변조자 정의하기](#defining-a-mutator)
- [속성 캐스팅](#attribute-casting)
    - [배열 및 JSON 캐스팅](#array-and-json-casting)
    - [날짜 캐스팅](#date-casting)
    - [Enum 캐스팅](#enum-casting)
    - [암호화 캐스팅](#encrypted-casting)
    - [쿼리 시점 캐스팅](#query-time-casting)
- [커스텀 캐스팅](#custom-casts)
    - [값 객체 캐스팅](#value-object-casting)
    - [배열 / JSON 직렬화](#array-json-serialization)
    - [입력(inbound) 캐스팅](#inbound-casting)
    - [캐스팅 파라미터](#cast-parameters)
    - [캐스터블(Castables)](#castables)

<a name="introduction"></a>
## 소개

접근자(accessor), 변조자(mutator), 그리고 속성(attribute) 캐스팅을 통해 Eloquent 모델 인스턴스에서 속성 값을 읽거나 쓸 때 자유롭게 변환할 수 있습니다. 예를 들어, [라라벨 암호화 기능](/docs/11.x/encryption)을 사용해 값을 데이터베이스에 저장할 때 암호화하고, 모델에서 해당 속성에 접근할 때 자동으로 복호화되도록 할 수 있습니다. 또는 데이터베이스에 저장된 JSON 문자열을 Eloquent 모델을 통해 접근할 때 배열로 변환할 수도 있습니다.

<a name="accessors-and-mutators"></a>
## 접근자와 변조자

<a name="defining-an-accessor"></a>
### 접근자 정의하기

접근자(accessor)는 Eloquent 속성의 값을 읽을 때 자동으로 변환해주는 메서드입니다. 접근자를 정의하려면, 모델 안에 해당 속성을 나타내는 보호된(protected) 메서드를 생성합니다. 이 메서드의 이름은 가능하다면 실제 모델 속성/데이터베이스 컬럼명을 "카멜 케이스(camel case)"로 표기해야 합니다.

아래 예시에서는 `first_name` 속성에 접근자를 정의합니다. 이 접근자는 Eloquent가 `first_name` 속성 값을 읽으려고 할 때마다 자동으로 호출됩니다. 모든 어트리뷰트 접근자/변조자 메서드는 반드시 `Illuminate\Database\Eloquent\Casts\Attribute` 타입을 반환해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 사용자의 이름 첫 글자를 반환합니다.
     */
    protected function firstName(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => ucfirst($value),
        );
    }
}
```

모든 접근자 메서드는 속성을 접근(읽기), 선택적으로 변조(쓰기)하는 방법을 정의한 `Attribute` 인스턴스를 반환합니다. 위 예시에서는 속성을 읽는(get) 방법만 정의하고 있습니다. `Attribute` 클래스 생성자에 `get` 인자를 전달해 이를 지정합니다.

위 코드에서 볼 수 있듯이, 접근자에는 컬럼의 원래 값이 전달되어 값의 조작 및 반환이 가능합니다. 접근자의 값을 사용하려면, 모델 인스턴스의 `first_name` 속성에 직접 접근하면 됩니다.

```
use App\Models\User;

$user = User::find(1);

$firstName = $user->first_name;
```

> [!NOTE]  
> 이렇게 가공된(computed) 값을 모델의 배열/JSON 표현에 포함하고 싶으면, [직접 속성을 추가(appending)해야 합니다](/docs/11.x/eloquent-serialization#appending-values-to-json).

<a name="building-value-objects-from-multiple-attributes"></a>
#### 여러 속성으로 값 객체(Value Object) 만들기

때로는 접근자에서 여러 모델 속성을 하나의 "값 객체(value object)"로 변환해야 할 수 있습니다. 이를 위해, `get` 클로저에 두 번째 인자 `$attributes`를 지정할 수 있습니다. 이 인자는 모델의 현재 모든 속성 배열이 자동으로 전달됩니다.

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * 사용자의 주소를 다룹니다.
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

접근자에서 값 객체(value object)를 반환하면, 해당 객체의 값이 변경되는 경우 모델이 저장되기 전 자동으로 변경된 내용이 동기화됩니다. 이는 Eloquent가 접근자가 반환한 객체 인스턴스를 재사용(캐싱)하기 때문에 가능합니다. 같은 접근자에 여러 번 접근해도 항상 동일 인스턴스를 반환받습니다.

```
use App\Models\User;

$user = User::find(1);

$user->address->lineOne = 'Updated Address Line 1 Value';
$user->address->lineTwo = 'Updated Address Line 2 Value';

$user->save();
```

하지만 문자열, 불리언 등 기본값(primitive value)에 대해서도, 복잡한 연산이 필요한 경우 캐싱을 활성화하고 싶을 수 있습니다. 이럴 때는 접근자 정의 시 `shouldCache` 메서드를 호출하면 됩니다.

```php
protected function hash(): Attribute
{
    return Attribute::make(
        get: fn (string $value) => bcrypt(gzuncompress($value)),
    )->shouldCache();
}
```

반대로, 객체 인스턴스 캐싱을 비활성화하려면 접근자 정의 시 `withoutObjectCaching` 메서드를 사용할 수 있습니다.

```php
/**
 * 사용자의 주소를 다룹니다.
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
### 변조자 정의하기

변조자(mutator)는 Eloquent 속성에 값을 쓸 때 자동으로 변환해주는 메서드입니다. 변조자를 정의하려면, 속성 정의 시 `set` 인자를 사용하면 됩니다. 아래는 `first_name` 속성에 변조자를 정의한 예시입니다. 이 변조자는 모델의 `first_name` 속성에 값을 대입할 때마다 자동으로 호출됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 사용자의 이름을 다룹니다.
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

변조자 클로저는 대입하려는 값을 인자로 받아, 가공한 값을 반환하면 됩니다. 이 변조자를 사용하려면, Eloquent 모델에서 단순히 `first_name` 속성에 값을 할당하면 됩니다.

```
use App\Models\User;

$user = User::find(1);

$user->first_name = 'Sally';
```

위 예시에서는 `set` 콜백이 `'Sally'` 값을 받아, `strtolower` 함수를 적용한 값을 모델의 내부 `$attributes` 배열에 저장하게 됩니다.

<a name="mutating-multiple-attributes"></a>
#### 여러 속성 동시에 변조하기

경우에 따라 변조자에서 여러 속성을 한 번에 변경해야 할 수 있습니다. 이럴 때는, `set` 클로저에서 배열을 반환하면 됩니다. 배열의 각 키는 모델의 실제 속성/데이터베이스 컬럼명과 일치해야 합니다.

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * 사용자의 주소를 다룹니다.
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

속성 캐스팅은 접근자 및 변조자와 유사한 기능을 제공하지만, 모델에 별도의 메서드를 정의할 필요 없이 간단히 속성을 원하는 데이터 타입으로 변환할 수 있습니다. 모델의 `casts` 메서드를 사용하면 데이터를 쉽게 변환할 수 있습니다.

`casts` 메서드는 캐스팅할 속성명을 키, 변환할 타입을 값으로 갖는 배열을 반환해야 합니다. 지원되는 캐스팅 타입은 다음과 같습니다.

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

속성 캐스팅 예제를 살펴보겠습니다. 데이터베이스에 정수(0 또는 1)로 저장된 `is_admin` 속성을 불리언 값으로 변환해봅니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 캐스팅할 속성 목록을 반환합니다.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_admin' => 'boolean',
        ];
    }
}
```

이렇게 캐스팅을 정의하면, 데이터베이스에 저장된 값이 정수여도 Eloquent에서 `is_admin` 속성을 읽을 때마다 항상 불리언 타입으로 변환됩니다.

```
$user = App\Models\User::find(1);

if ($user->is_admin) {
    // ...
}
```

런타임에 새로운 임시 캐스팅을 추가해야 할 때는, `mergeCasts` 메서드를 사용할 수 있습니다. 이 메서드로 추가한 캐스팅 정보는 기존에 모델에 정의된 캐스팅과 합쳐집니다.

```
$user->mergeCasts([
    'is_admin' => 'integer',
    'options' => 'object',
]);
```

> [!WARNING]  
> 값이 `null`인 속성은 캐스팅되지 않습니다. 또한, 관계명과 동일한 이름의 속성에 캐스트를 정의하거나, 모델 기본키에 캐스트를 지정해서는 안 됩니다.

<a name="stringable-casting"></a>
#### Stringable 캐스팅

모델 속성을 [플루언트 Stringable 객체](/docs/11.x/strings#fluent-strings-method-list)로 변환하려면, `Illuminate\Database\Eloquent\Casts\AsStringable` 캐스트 클래스를 사용할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\AsStringable;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 캐스팅할 속성 목록을 반환합니다.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'directory' => AsStringable::class,
        ];
    }
}
```

<a name="array-and-json-casting"></a>
### 배열 및 JSON 캐스팅

`array` 캐스팅은 직렬화된(serialized) JSON 형태로 저장된 데이터에 특히 유용합니다. 예를 들어, 데이터베이스에 JSON 또는 TEXT 타입 컬럼에 직렬화된 JSON이 저장되어 있다면, 해당 속성에 단순히 `array` 캐스팅을 지정하면 모델에서 해당 속성에 접근할 때 자동으로 PHP 배열로 변환됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 캐스팅할 속성 목록을 반환합니다.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'options' => 'array',
        ];
    }
}
```

캐스팅을 지정하면, `options` 속성에 접근할 때 자동으로 JSON이 PHP 배열로 변환됩니다. 반대로 속성에 배열을 할당하면 자동으로 JSON으로 직렬화되어 저장됩니다.

```
use App\Models\User;

$user = User::find(1);

$options = $user->options;

$options['key'] = 'value';

$user->options = $options;

$user->save();
```

JSON 속성의 특정 필드만 간결하게 업데이트하려면, [해당 속성을 일괄 할당 가능(mass assignable)하게 만든 뒤](/docs/11.x/eloquent#mass-assignment-json-columns) `update` 메서드에서 `->` 연산자를 사용할 수 있습니다.

```
$user = User::find(1);

$user->update(['options->key' => 'value']);
```

<a name="array-object-and-collection-casting"></a>
#### Array Object 및 Collection 캐스팅

일반적인 `array` 캐스팅은 많은 경우에 충분하지만, 배열 오프셋(offset) 값을 직접 수정할 수 없다는 한계가 있습니다. 예를 들어, 아래 코드는 PHP 에러를 발생시킬 수 있습니다.

```
$user = User::find(1);

$user->options['key'] = $value;
```

이 문제를 해결하기 위해, 라라벨은 JSON 속성을 [ArrayObject](https://www.php.net/manual/en/class.arrayobject.php) 클래스 인스턴스로 변환하는 `AsArrayObject` 캐스트를 제공합니다. 이 기능은 라라벨의 [커스텀 캐스팅](#custom-casts) 기능을 활용해 구현됐으며, 변형된 객체를 지능적으로 캐시 및 변환해 배열의 각 오프셋을 자유롭게 수정할 수 있게 해줍니다.

`AsArrayObject` 캐스트를 사용하려면, 해당 속성에 지정해 주면 됩니다.

```
use Illuminate\Database\Eloquent\Casts\AsArrayObject;

/**
 * 캐스팅할 속성 목록을 반환합니다.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'options' => AsArrayObject::class,
    ];
}
```

비슷하게, JSON 속성을 라라벨의 [Collection](/docs/11.x/collections) 인스턴스로 변환해주는 `AsCollection` 캐스트도 제공됩니다.

```
use Illuminate\Database\Eloquent\Casts\AsCollection;

/**
 * 캐스팅할 속성 목록을 반환합니다.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'options' => AsCollection::class,
    ];
}
```

`AsCollection` 캐스트에 라라벨 기본 컬렉션 클래스가 아닌 원하는 커스텀 컬렉션 클래스를 사용하고 싶다면, 캐스트 인자로 해당 클래스명을 전달하면 됩니다.

```
use App\Collections\OptionCollection;
use Illuminate\Database\Eloquent\Casts\AsCollection;

/**
 * 캐스팅할 속성 목록을 반환합니다.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'options' => AsCollection::using(OptionCollection::class),
    ];
}
```

<a name="date-casting"></a>
### 날짜 캐스팅

Eloquent는 기본적으로 `created_at`과 `updated_at` 컬럼을 [Carbon](https://github.com/briannesbitt/Carbon) 인스턴스로 변환합니다. Carbon은 PHP의 `DateTime` 클래스를 확장해 다양한 편리한 메서드를 제공합니다. 추가적인 날짜 속성도 모델의 `casts` 메서드에서 직접 지정해 캐스팅할 수 있습니다. 보통 날짜 관련 속성은 `datetime` 또는 `immutable_datetime` 타입으로 캐스팅합니다.

`date` 또는 `datetime` 캐스팅을 정의할 때, 날짜 형식(format)을 함께 지정할 수도 있습니다. 이 형식은 [모델을 배열이나 JSON으로 직렬화할 때](/docs/11.x/eloquent-serialization) 사용됩니다.

```
/**
 * 캐스팅할 속성 목록을 반환합니다.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'created_at' => 'datetime:Y-m-d',
    ];
}
```

속성이 날짜로 캐스팅된 경우, 해당 모델 속성 값에 UNIX 타임스탬프, 날짜 문자열(`Y-m-d`), 날짜-시간 문자열, 혹은 `DateTime`/`Carbon` 인스턴스를 지정할 수 있습니다. 입력값이 자동으로 올바른 형식으로 변환되어 데이터베이스에 저장됩니다.

모델의 모든 날짜 필드 직렬화 기본 형식을 바꾸고 싶다면, `serializeDate` 메서드를 모델에 정의할 수 있습니다. 이 메서드는 데이터베이스에 실제로 저장되는 값의 형식에는 영향을 주지 않습니다.

```
/**
 * 배열/JSON 직렬화를 위한 날짜 포맷을 지정합니다.
 */
protected function serializeDate(DateTimeInterface $date): string
{
    return $date->format('Y-m-d');
}
```

실제 데이터베이스에 날짜를 저장할 때 사용할 형식을 지정하려면, 모델에 `$dateFormat` 속성을 정의해야 합니다.

```
/**
 * 모델 날짜 컬럼의 저장 포맷입니다.
 *
 * @var string
 */
protected $dateFormat = 'U';
```

<a name="date-casting-and-timezones"></a>
#### 날짜 캐스팅, 직렬화, 그리고 타임존

기본적으로 `date`와 `datetime` 캐스트는 애플리케이션의 `timezone` 설정과 관계없이 항상 UTC ISO-8601 날짜 문자열(`YYYY-MM-DDTHH:MM:SS.uuuuuuZ`)로 직렬화합니다. 이 직렬화 포맷과 UTC 타임존을 모델의 날짜 처리 기본값으로 사용하는 것을 강력히 권장하며, 애플리케이션의 `timezone` 구성 옵션을 기본값인 `UTC`에서 변경하지 않는 것이 좋습니다. 일관되게 UTC를 사용하면 PHP와 JavaScript 등 다양한 라이브러리와의 호환성이 극대화됩니다.

만약 `datetime:Y-m-d H:i:s`와 같이 포맷을 지정했다면, 직렬화 시 Carbon 인스턴스의 내부 타임존이 사용됩니다. 일반적으로 이 타임존은 애플리케이션의 `timezone` 설정을 따라갑니다. 단, `created_at`이나 `updated_at`과 같은 `timestamp` 컬럼은 이 특성의 예외로, 애플리케이션 타임존 설정과 관계없이 항상 UTC로 포맷됩니다.

<a name="enum-casting"></a>
### Enum 캐스팅

Eloquent는 속성 값을 PHP [Enum(열거형)](https://www.php.net/manual/en/language.enumerations.backed.php)으로 캐스팅하는 기능도 제공합니다. 이를 위해, 모델의 `casts` 메서드에 속성과 enum을 지정해주면 됩니다.

```
use App\Enums\ServerStatus;

/**
 * 캐스팅할 속성 목록을 반환합니다.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'status' => ServerStatus::class,
    ];
}
```

이렇게 캐스팅을 정의하면, 해당 속성에 접근하거나 값을 저장하는 과정에서 자동으로 enum 객체로 변환됩니다.

```
if ($server->status == ServerStatus::Provisioned) {
    $server->status = ServerStatus::Ready;

    $server->save();
}
```

<a name="casting-arrays-of-enums"></a>
#### Enum 배열 캐스팅

한 컬럼에 여러 개의 enum 값을 배열로 저장해야 하는 경우도 있습니다. 이럴 때는 라라벨에서 제공하는 `AsEnumArrayObject` 또는 `AsEnumCollection` 캐스트를 사용할 수 있습니다.

```
use App\Enums\ServerStatus;
use Illuminate\Database\Eloquent\Casts\AsEnumCollection;

/**
 * 캐스팅할 속성 목록을 반환합니다.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'statuses' => AsEnumCollection::of(ServerStatus::class),
    ];
}
```

<a name="encrypted-casting"></a>
### 암호화 캐스팅

`encrypted` 캐스트는 라라벨 내장 [암호화 기능](/docs/11.x/encryption)을 이용해 모델 속성 값을 암호화/복호화합니다. `encrypted:array`, `encrypted:collection`, `encrypted:object`, `AsEncryptedArrayObject`, `AsEncryptedCollection` 역시 각각 평문 버전과 동일하게 동작하지만 기본적으로 데이터베이스에 저장할 때 암호화됩니다.

암호화된 텍스트의 길이는 예측할 수 없고 평문보다 훨씬 길어질 수 있으므로, 해당 컬럼은 `TEXT` 타입 또는 더 큰 타입이어야 합니다. 또한 값이 암호화되어 저장되므로, 데이터베이스에서 직접 쿼리하거나 검색할 수 없습니다.

<a name="key-rotation"></a>
#### 키 교체(Key Rotation)

라라벨은 애플리케이션의 설정(app.php)에서 지정한 `key` 값(APP_KEY 환경변수 값 사용)으로 문자열을 암호화합니다. 앱의 암호화 키를 변경(교체)해야 한다면, 기존 암호화된 속성 데이터를 새 키로 수동으로 다시 암호화해야 합니다.

<a name="query-time-casting"></a>
### 쿼리 시점 캐스팅

종종 쿼리를 실행할 때, 직접 셀렉트한(raw) 값을 즉석에서 캐스팅해야 할 때가 있습니다. 아래와 같은 쿼리를 예로 들어보겠습니다.

```
use App\Models\Post;
use App\Models\User;

$users = User::select([
    'users.*',
    'last_posted_at' => Post::selectRaw('MAX(created_at)')
        ->whereColumn('user_id', 'users.id')
])->get();
```

위 쿼리에서 결과로 나오는 `last_posted_at` 속성은 단순 문자열입니다. 쿼리 실행 시점에 이 속성에 `datetime` 캐스팅을 적용할 수 있다면 훨씬 좋을 것입니다. 다행히, `withCasts` 메서드를 사용하면 이를 쉽게 실현할 수 있습니다.

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

## 커스텀 캐스트

라라벨에는 다양한 내장 캐스트 타입이 제공되지만, 때로는 직접 커스텀 캐스트 타입을 정의해야 할 수도 있습니다. 캐스트를 생성하려면 `make:cast` 아티즌 명령어를 실행합니다. 새롭게 생성된 캐스트 클래스는 `app/Casts` 디렉터리에 위치하게 됩니다.

```shell
php artisan make:cast Json
```

모든 커스텀 캐스트 클래스는 `CastsAttributes` 인터페이스를 구현해야 합니다. 이 인터페이스를 구현하는 클래스에서는 반드시 `get`과 `set` 메서드를 정의해야 합니다. `get` 메서드는 데이터베이스에서 가져온 원시 값을 캐스트 값으로 변환하는 역할을 하며, `set` 메서드는 캐스트 값을 데이터베이스에 저장할 수 있는 원시 값으로 변환합니다. 예를 들어, 내장된 `json` 캐스트 타입을 커스텀 캐스트 타입으로 재구현해보겠습니다.

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
     * 주어진 값을 저장용으로 준비합니다.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): string
    {
        return json_encode($value);
    }
}
```

커스텀 캐스트 타입을 정의한 후에는, 해당 클래스명을 이용해 모델 속성에 캐스트를 지정할 수 있습니다.

```
<?php

namespace App\Models;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 캐스팅할 속성 목록을 반환합니다.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'options' => Json::class,
        ];
    }
}
```

<a name="value-object-casting"></a>
### 값 객체 캐스팅

값을 기본 데이터 타입뿐 아니라 객체로도 캐스팅할 수 있습니다. 값을 객체로 캐스팅하는 커스텀 캐스트를 정의하는 방법은 기본 타입을 캐스팅하는 방법과 거의 비슷하지만, `set` 메서드는 모델에 저장될 원시 값을 키/값 쌍의 배열로 반환해야 합니다.

예를 들어, 여러 모델 값을 하나의 `Address` 값 객체로 캐스팅하는 커스텀 캐스트 클래스를 정의해보겠습니다. 여기서는 `Address` 값 객체가 두 개의 public 속성 `lineOne`과 `lineTwo`를 갖고 있다고 가정합니다.

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
     * 주어진 값을 저장용으로 준비합니다.
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

값 객체로 캐스팅할 경우, 값 객체에서 속성이 변경되더라도 모델이 저장되기 전에 자동으로 모델에 반영됩니다.

```
use App\Models\User;

$user = User::find(1);

$user->address->lineOne = 'Updated Address Value';

$user->save();
```

> [!NOTE]  
> 값 객체가 포함된 Eloquent 모델을 JSON이나 배열로 직렬화(serialize)할 계획이 있다면, 해당 값 객체에 `Illuminate\Contracts\Support\Arrayable` 및 `JsonSerializable` 인터페이스를 구현하는 것이 좋습니다.

<a name="value-object-caching"></a>
#### 값 객체 캐싱

값 객체로 캐스팅된 속성이 resolve(해결)될 때, Eloquent에서 이 객체를 캐시합니다. 따라서 동일한 속성에 다시 접근할 경우 항상 같은 객체 인스턴스가 반환됩니다.

커스텀 캐스트 클래스의 객체 캐싱 동작을 비활성화하고 싶다면, 커스텀 캐스트 클래스에 public 속성인 `withoutObjectCaching`을 선언하면 됩니다.

```php
class Address implements CastsAttributes
{
    public bool $withoutObjectCaching = true;

    // ...
}
```

<a name="array-json-serialization"></a>
### 배열 / JSON 직렬화

Eloquent 모델을 `toArray` 혹은 `toJson` 메서드로 배열이나 JSON으로 변환할 때, 커스텀 캐스트 값 객체가 `Illuminate\Contracts\Support\Arrayable` 및 `JsonSerializable` 인터페이스를 구현한다면, 해당 객체도 직렬화되어 출력됩니다. 하지만, 외부 라이브러리에서 제공하는 값 객체를 사용할 경우 이 인터페이스를 직접 추가할 수 없을 수도 있습니다.

이럴 때는 커스텀 캐스트 클래스에서 값 객체의 직렬화를 직접 처리하도록 지정할 수 있습니다. 이를 위해, 커스텀 캐스트 클래스에서 `Illuminate\Contracts\Database\Eloquent\SerializesCastableAttributes` 인터페이스를 구현합니다. 이 인터페이스는 클래스가 `serialize` 메서드를 포함해야 함을 의미하며, 이 메서드는 값 객체의 직렬화된 결과를 반환해야 합니다.

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
### 인바운드 캐스팅

가끔은 모델에 값을 저장할 때에만 변환 처리를 하고, 모델에서 값을 조회할 때는 아무런 처리를 하지 않는 커스텀 캐스트가 필요할 수 있습니다.

인바운드 전용 커스텀 캐스트는 `CastsInboundAttributes` 인터페이스를 구현해야 하며, 이 인터페이스는 오직 `set` 메서드만 정의하면 됩니다. 인바운드 전용 캐스트 클래스를 생성하려면 `make:cast` 아티즌 명령어 사용 시 `--inbound` 옵션을 지정하면 됩니다.

```shell
php artisan make:cast Hash --inbound
```

인바운드 전용 캐스트의 대표적인 예시는 "해시" 캐스트입니다. 예를 들어, 전달받은 값을 지정한 알고리즘으로 해싱하는 캐스트를 만들 수 있습니다.

```
<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsInboundAttributes;
use Illuminate\Database\Eloquent\Model;

class Hash implements CastsInboundAttributes
{
    /**
     * 새로운 캐스트 클래스 인스턴스를 생성합니다.
     */
    public function __construct(
        protected string|null $algorithm = null,
    ) {}

    /**
     * 주어진 값을 저장용으로 준비합니다.
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
### 캐스트 파라미터

모델에 커스텀 캐스트를 지정할 때, 클래스명 뒤에 `:` 문자로 구분하여 파라미터(여러 개라면 쉼표로 구분)를 전달할 수 있습니다. 이렇게 지정한 파라미터는 캐스트 클래스의 생성자로 전달됩니다.

```
/**
 * 캐스팅할 속성 목록을 반환합니다.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'secret' => Hash::class.':sha256',
    ];
}
```

<a name="castables"></a>
### 캐스터블(Castables)

애플리케이션의 값 객체가 스스로 커스텀 캐스트 클래스를 지정하도록 하고 싶을 때가 있습니다. 이럴 때는 커스텀 캐스트 클래스를 모델에 직접 지정하는 대신, `Illuminate\Contracts\Database\Eloquent\Castable` 인터페이스를 구현한 값 객체 클래스를 지정할 수 있습니다.

```
use App\ValueObjects\Address;

protected function casts(): array
{
    return [
        'address' => Address::class,
    ];
}
```

`Castable` 인터페이스를 구현하는 객체는 반드시 `castUsing` 메서드를 정의해야 하며, 이 메서드는 이 값 객체를 캐스팅할 때 사용할 커스텀 캐스터 클래스의 클래스명을 반환해야 합니다.

```
<?php

namespace App\ValueObjects;

use Illuminate\Contracts\Database\Eloquent\Castable;
use App\Casts\Address as AddressCast;

class Address implements Castable
{
    /**
     * 이 캐스팅 대상에 사용할 캐스터 클래스명을 반환합니다.
     *
     * @param  array<string, mixed>  $arguments
     */
    public static function castUsing(array $arguments): string
    {
        return AddressCast::class;
    }
}
```

`Castable` 클래스를 사용할 때도, `casts` 메서드 정의에서 파라미터를 전달할 수 있습니다. 이 파라미터들은 `castUsing` 메서드로 전달됩니다.

```
use App\ValueObjects\Address;

protected function casts(): array
{
    return [
        'address' => Address::class.':argument',
    ];
}
```

<a name="anonymous-cast-classes"></a>
#### 캐스터블 & 익명 캐스트 클래스

"캐스터블"과 PHP의 [익명 클래스](https://www.php.net/manual/en/language.oop5.anonymous.php)를 조합하면, 값 객체의 캐스팅 로직을 하나의 캐스터블 객체로 정의할 수 있습니다. 이를 실현하려면 값 객체의 `castUsing` 메서드에서 익명 클래스를 반환하면 됩니다. 익명 클래스는 반드시 `CastsAttributes` 인터페이스를 구현해야 합니다.

```
<?php

namespace App\ValueObjects;

use Illuminate\Contracts\Database\Eloquent\Castable;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class Address implements Castable
{
    // ...

    /**
     * 이 캐스팅 대상에 사용할 캐스터 클래스를 반환합니다.
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