# Eloquent: 접근자 & 캐스팅 (Eloquent: Mutators & Casting)

- [소개](#introduction)
- [접근자(Accessors)와 변경자(Mutators)](#accessors-and-mutators)
    - [접근자 정의하기](#defining-an-accessor)
    - [변경자 정의하기](#defining-a-mutator)
- [속성 변환(Attribute Casting)](#attribute-casting)
    - [배열 및 JSON 변환](#array-and-json-casting)
    - [날짜 변환](#date-casting)
    - [열거형 변환](#enum-casting)
    - [암호화 변환](#encrypted-casting)
    - [쿼리 시점 변환](#query-time-casting)
- [사용자 정의 변환(Custom Casts)](#custom-casts)
    - [값 객체 변환(Value Object Casting)](#value-object-casting)
    - [배열/JSON 직렬화](#array-json-serialization)
    - [입력값 변환(Inbound Casting)](#inbound-casting)
    - [변환 파라미터](#cast-parameters)
    - [캐스터블(Castables)](#castables)

<a name="introduction"></a>
## 소개

접근자(accessor), 변경자(mutator), 속성 변환(Attribute Casting)을 사용하면, Eloquent 모델 인스턴스에서 속성 값을 조회하거나 설정할 때 해당 값을 원하는 방식으로 변환할 수 있습니다. 예를 들어, [라라벨 암호화기](/docs/12.x/encryption)를 이용해 데이터베이스에 저장할 때는 값을 암호화하고, Eloquent 모델에서 해당 속성을 가져올 때는 자동으로 복호화할 수 있습니다. 또는 데이터베이스에 저장된 JSON 문자열을 Eloquent 모델을 통해 배열로 자동 변환하여 다루고 싶을 수도 있습니다.

<a name="accessors-and-mutators"></a>
## 접근자(Accessor)와 변경자(Mutator)

<a name="defining-an-accessor"></a>
### 접근자 정의하기

접근자(accessor)는 Eloquent 속성 값을 조회할 때 해당 값을 변환하는 역할을 합니다. 접근자를 정의하려면, 모델 내에 접근하고자 하는 속성의 "카멜케이스(camel case)" 형태를 메서드명으로 하여 protected 메서드를 만듭니다. (이때 메서드명은 실제 모델의 속성, 또는 데이터베이스 컬럼명을 카멜케이스로 변환한 형태여야 합니다.)

예를 들어, `first_name` 속성에 대해 접근자를 정의하겠습니다. 이 접근자는 Eloquent가 `first_name` 속성 값을 조회할 때 자동으로 호출됩니다. 모든 접근자/변경자 메서드는 `Illuminate\Database\Eloquent\Casts\Attribute` 타입을 반환하도록 선언해야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Get the user's first name.
     */
    protected function firstName(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => ucfirst($value),
        );
    }
}
```

모든 접근자 메서드는 속성이 어떻게 조회될지(그리고 필요하다면 어떻게 변경될지)를 정의하는 `Attribute` 인스턴스를 반환합니다. 위 예시에서는 속성이 조회되는 방식을 `get` 인수로 지정해주었습니다.

이렇게 정의하면, 컬럼의 실제 값이 접근자로 전달되므로 값을 원하는 대로 조작할 수 있습니다. 접근자의 값을 가져오려면, 모델 인스턴스에서 해당 속성명을 그대로 사용하면 됩니다.

```php
use App\Models\User;

$user = User::find(1);

$firstName = $user->first_name;
```

> [!NOTE]
> 이렇게 계산된(가공된) 값을 배열이나 JSON 표현에서도 보이도록 하려면, [별도로 해당 값을 추가로 포함하도록 설정해야 합니다](/docs/12.x/eloquent-serialization#appending-values-to-json).

<a name="building-value-objects-from-multiple-attributes"></a>
#### 여러 속성을 결합해 값 객체 만들기

때로는 접근자에서 여러 속성 값을 조합해 하나의 "값 객체(value object)"로 변환해야 할 수 있습니다. 이럴 때는 `get` 클로저의 두 번째 인수로 `$attributes`를 받을 수 있습니다. 이 인수는 해당 모델의 모든 속성 값을 배열로 포함합니다.

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * Interact with the user's address.
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
#### 접근자 캐싱(Accessor Caching)

접근자에서 값 객체를 반환할 경우, 해당 객체에 변경사항이 생기면 모델이 저장될 때 자동으로 모델에 반영됩니다. 이는 Eloquent가 접근자에서 반환된 인스턴스를 보관하고 있다가, 접근자가 호출될 때마다 동일한 인스턴스를 반환하기 때문입니다.

```php
use App\Models\User;

$user = User::find(1);

$user->address->lineOne = 'Updated Address Line 1 Value';
$user->address->lineTwo = 'Updated Address Line 2 Value';

$user->save();
```

하지만 문자열이나 불리언과 같이 단순한 값(프리미티브 값)에 대해서도, 만약 계산 비용이 크다면 캐싱을 활성화하고 싶을 수 있습니다. 이럴 때는 접근자 정의 시 `shouldCache` 메서드를 호출하면 됩니다.

```php
protected function hash(): Attribute
{
    return Attribute::make(
        get: fn (string $value) => bcrypt(gzuncompress($value)),
    )->shouldCache();
}
```

반대로, 속성의 객체 캐싱 기능을 비활성화하고 싶다면, 접근자 정의 시 `withoutObjectCaching` 메서드를 호출하면 됩니다.

```php
/**
 * Interact with the user's address.
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
### 변경자(Mutator) 정의하기

변경자는 Eloquent 속성 값을 설정할 때 그 값을 원하는 방식으로 변환해주는 역할을 합니다. 변경자를 정의하려면, 속성 정의 시 `set` 인수를 넘겨주면 됩니다. 예를 들어 `first_name` 속성의 변경자를 다음과 같이 정의할 수 있습니다. 이 변경자는 모델에서 `first_name` 값을 설정하려고 할 때 자동으로 호출됩니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Interact with the user's first name.
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

변경자 클로저는 속성에 설정하려는 값을 인자로 받아, 이 값을 원하는 대로 변형한 뒤 반환할 수 있습니다. 변경자를 사용하려면 Eloquent 모델의 해당 속성에 값을 할당하면 됩니다.

```php
use App\Models\User;

$user = User::find(1);

$user->first_name = 'Sally';
```

위 예시에서 `set` 콜백은 `Sally` 값을 인자로 받고, 여기에 `strtolower` 함수를 적용해서 소문자로 변환한 뒤 모델의 내부 `$attributes` 배열에 저장합니다.

<a name="mutating-multiple-attributes"></a>
#### 여러 속성 동시 변환하기

경우에 따라 변경자에서 모델의 여러 속성 값을 함께 설정해야 할 수도 있습니다. 이럴 때는 `set` 클로저에서 배열을 반환하면 됩니다. 배열의 각 키는 실제 모델의 속성명/컬럼명이어야 합니다.

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * Interact with the user's address.
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
## 속성 변환(Attribute Casting)

속성 변환(Attribute casting)은 접근자나 변경자처럼 값을 변환하는 기능을 하지만, 별도의 메서드 정의 없이 모델의 `casts` 메서드를 통해 간편하게 속성을 원하는 데이터 타입으로 변환할 수 있도록 도와줍니다.

`casts` 메서드는 변환 대상 속성명을 키로, 변환할 타입을 값으로 하는 배열을 반환해야 합니다. 지원하는 변환 타입은 다음과 같습니다.

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

예시로, 데이터베이스에 정수(`0` 또는 `1`)로 저장된 `is_admin` 속성을 불리언(boolean) 타입으로 변환해보겠습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Get the attributes that should be cast.
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

이렇게 변환을 정의하면, 데이터베이스에 정수로 저장되어 있어도 `is_admin` 속성에 접근할 때는 항상 불리언 타입으로 자동 변환됩니다.

```php
$user = App\Models\User::find(1);

if ($user->is_admin) {
    // ...
}
```

런타임 중 일시적으로 변환을 추가하고 싶다면 `mergeCasts` 메서드를 사용할 수 있습니다. 이때 추가한 변환은 기존의 변환 정의에 합쳐집니다.

```php
$user->mergeCasts([
    'is_admin' => 'integer',
    'options' => 'object',
]);
```

> [!WARNING]
> 값이 `null`인 속성은 변환되지 않습니다. 또한, 관계명과 동일한 이름의 속성(또는 변환)을 정의하거나, 모델의 기본 키에 변환을 적용하면 안 됩니다.

<a name="stringable-casting"></a>
#### Stringable 변환

`Illuminate\Database\Eloquent\Casts\AsStringable` 변환 클래스를 사용하면 모델 속성을 [유연한 Illuminate\Support\Stringable 객체](/docs/12.x/strings#fluent-strings-method-list)로 변환할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\AsStringable;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Get the attributes that should be cast.
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
### 배열 및 JSON 변환

`array` 변환은 직렬화된 JSON 형식으로 저장된 컬럼을 다룰 때 매우 유용합니다. 예를 들어, 데이터베이스에 `JSON` 또는 `TEXT` 타입으로 직렬화된 JSON 데이터가 저장되어 있다면, 해당 속성에 `array` 변환을 지정하면 Eloquent에서 자동으로 PHP 배열로 역직렬화하여 사용할 수 있습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Get the attributes that should be cast.
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

변환을 지정하고 나면, `options` 속성에 접근할 때 해당 값이 JSON에서 PHP 배열로 자동 변환됩니다. 또한 `options` 속성에 배열을 할당하면, 내부적으로 JSON으로 직렬화되어 저장됩니다.

```php
use App\Models\User;

$user = User::find(1);

$options = $user->options;

$options['key'] = 'value';

$user->options = $options;

$user->save();
```

JSON 속성의 특정 필드만 간편하게 수정하려면, [해당 속성을 일괄 할당 가능하도록 지정](/docs/12.x/eloquent#mass-assignment-json-columns)한 뒤, `->` 연산자를 사용해 `update` 메서드를 호출할 수 있습니다.

```php
$user = User::find(1);

$user->update(['options->key' => 'value']);
```

<a name="json-and-unicode"></a>
#### JSON과 유니코드

속성 값을 JSON으로 저장할 때 유니코드 문자도 이스케이프하지 않은 형태로 유지하고 싶다면, `json:unicode` 변환을 사용할 수 있습니다.

```php
/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'options' => 'json:unicode',
    ];
}
```

<a name="array-object-and-collection-casting"></a>
#### ArrayObject 및 Collection 변환

일반적인 `array` 변환도 많은 상황에서 충분하지만, 몇 가지 단점도 있습니다. `array` 변환은 프리미티브 타입을 반환하기 때문에 배열 오프셋을 직접 변환하는 것이 불가능합니다. 예를 들어 아래 코드는 PHP 오류를 발생시킵니다.

```php
$user = User::find(1);

$user->options['key'] = $value;
```

이 문제를 해결하기 위해, 라라벨은 JSON 속성을 [ArrayObject](https://www.php.net/manual/en/class.arrayobject.php) 클래스로 변환하는 `AsArrayObject` 변환 기능을 제공합니다. 이 기능은 내부적으로 [사용자 정의 캐스트](#custom-casts)를 활용해, 객체의 개별 오프셋을 변경해도 오류 없이 정상적으로 동작할 수 있도록 캐싱/변환 처리를 지원합니다. 사용하려면 해당 속성에 `AsArrayObject`를 지정하면 됩니다.

```php
use Illuminate\Database\Eloquent\Casts\AsArrayObject;

/**
 * Get the attributes that should be cast.
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

비슷하게, JSON 속성을 라라벨의 [컬렉션(Collection)](/docs/12.x/collections) 인스턴스로 변환하는 `AsCollection` 변환도 사용할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Casts\AsCollection;

/**
 * Get the attributes that should be cast.
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

`AsCollection` 변환을 사용할 때, 라라벨의 기본 컬렉션 대신에 직접 만든 커스텀 컬렉션 클래스를 사용하고 싶다면 변환 인수로 클래스명을 명시하면 됩니다.

```php
use App\Collections\OptionCollection;
use Illuminate\Database\Eloquent\Casts\AsCollection;

/**
 * Get the attributes that should be cast.
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

컬렉션 아이템을 특정 클래스의 객체로 매핑하고 싶다면 `of` 메서드를 사용해서 매핑 대상을 지정할 수 있습니다. 이때 내부적으로 컬렉션의 [mapInto 메서드](/docs/12.x/collections#method-mapinto)를 사용합니다.

```php
use App\ValueObjects\Option;
use Illuminate\Database\Eloquent\Casts\AsCollection;

/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'options' => AsCollection::of(Option::class)
    ];
}
```

컬렉션을 객체로 매핑하는 경우, 해당 객체는 `Illuminate\Contracts\Support\Arrayable` 및 `JsonSerializable` 인터페이스를 구현해야 데이터베이스에 JSON으로 직렬화할 때의 동작을 정의할 수 있습니다.

```php
<?php

namespace App\ValueObjects;

use Illuminate\Contracts\Support\Arrayable;
use JsonSerializable;

class Option implements Arrayable, JsonSerializable
{
    public string $name;
    public mixed $value;
    public bool $isLocked;

    /**
     * Create a new Option instance.
     */
    public function __construct(array $data)
    {
        $this->name = $data['name'];
        $this->value = $data['value'];
        $this->isLocked = $data['is_locked'];
    }

    /**
     * Get the instance as an array.
     *
     * @return array{name: string, data: string, is_locked: bool}
     */
    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'value' => $this->value,
            'is_locked' => $this->isLocked,
        ];
    }

    /**
     * Specify the data which should be serialized to JSON.
     *
     * @return array{name: string, data: string, is_locked: bool}
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
```

<a name="date-casting"></a>
### 날짜 변환

기본적으로 Eloquent는 `created_at`과 `updated_at` 컬럼을 [Carbon](https://github.com/briannesbitt/Carbon) 인스턴스로 자동 변환합니다. Carbon은 PHP의 `DateTime` 클래스를 확장하여 다양한 날짜 관련 기능을 제공합니다. 추가적인 날짜 속성도 모델의 `casts` 메서드에 날짜 변환을 정의하여 처리할 수 있습니다. 보통 날짜는 `datetime` 또는 `immutable_datetime` 변환 타입으로 지정합니다.

`date` 또는 `datetime` 변환 타입을 지정할 때, 원하는 날짜 포맷을 함께 지정할 수도 있습니다. 이 포맷은 [모델을 배열이나 JSON으로 직렬화](/docs/12.x/eloquent-serialization)할 때 사용됩니다.

```php
/**
 * Get the attributes that should be cast.
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

컬럼이 날짜로 변환되었을 때, 해당 속성에는 UNIX 타임스탬프, 날짜 문자열(`Y-m-d`), 날짜-시간 문자열, 또는 `DateTime`/`Carbon` 인스턴스 등 다양한 값을 할당할 수 있습니다. 변환 지정에 따라 값이 데이터베이스에 올바른 형식으로 저장됩니다.

모든 날짜 속성의 기본 직렬화 포맷을 변경하고 싶다면, 모델에 `serializeDate` 메서드를 정의하면 됩니다. 이 메서드는 데이터베이스에 저장되는 형식에는 영향을 주지 않고, 배열/JSON 직렬화 형식만 변경합니다.

```php
/**
 * Prepare a date for array / JSON serialization.
 */
protected function serializeDate(DateTimeInterface $date): string
{
    return $date->format('Y-m-d');
}
```

모델의 날짜 컬럼이 실제로 데이터베이스에 저장될 때 사용할 포맷을 지정하려면, 모델에 `$dateFormat` 속성을 지정하면 됩니다.

```php
/**
 * The storage format of the model's date columns.
 *
 * @var string
 */
protected $dateFormat = 'U';
```

<a name="date-casting-and-timezones"></a>

#### 날짜 캐스팅, 직렬화 및 타임존

기본적으로, `date` 및 `datetime` 캐스팅은 애플리케이션의 `timezone` 설정 값에 상관없이, 날짜를 UTC ISO-8601 날짜 문자열(`YYYY-MM-DDTHH:MM:SS.uuuuuuZ`)로 직렬화합니다. 이 직렬화 포맷을 항상 사용할 것과, 애플리케이션의 날짜를 UTC 타임존에 저장하기 위해 `timezone` 설정 값을 기본값인 `UTC`에서 변경하지 않을 것을 강력히 권장합니다. 애플리케이션 전반에서 UTC 타임존을 일관성 있게 사용하면, PHP와 JavaScript로 작성된 다른 날짜 조작 라이브러리와도 최고의 호환성을 보장받을 수 있습니다.

만약 `date`나 `datetime` 캐스트에 `datetime:Y-m-d H:i:s`와 같이 커스텀 포맷을 적용하면, 날짜 직렬화 시 Carbon 인스턴스의 내부 타임존이 사용됩니다. 일반적으로 이는 애플리케이션의 `timezone` 설정 값이 됩니다. 하지만 `created_at`, `updated_at`과 같은 `timestamp` 컬럼은 이 동작의 예외이며, 애플리케이션의 타임존 설정에 상관없이 항상 UTC로 포맷됩니다.

<a name="enum-casting"></a>
### Enum 캐스팅

Eloquent에서는 속성 값을 PHP [Enum](https://www.php.net/manual/en/language.enumerations.backed.php)으로 캐스팅할 수도 있습니다. 이를 위해 모델의 `casts` 메서드에서 캐스팅할 속성과 Enum을 지정하면 됩니다.

```php
use App\Enums\ServerStatus;

/**
 * Get the attributes that should be cast.
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

이렇게 모델에서 캐스트를 정의하면, 해당 속성에 접근하거나 값을 저장할 때 자동으로 Enum 타입과 원래 값 간의 변환이 이루어집니다.

```php
if ($server->status == ServerStatus::Provisioned) {
    $server->status = ServerStatus::Ready;

    $server->save();
}
```

<a name="casting-arrays-of-enums"></a>
#### Enum 배열 캐스팅

모델이 하나의 컬럼 내에 Enum 값의 배열을 저장해야 할 때가 있습니다. 이때는 Laravel에서 제공하는 `AsEnumArrayObject` 또는 `AsEnumCollection` 캐스트를 사용할 수 있습니다.

```php
use App\Enums\ServerStatus;
use Illuminate\Database\Eloquent\Casts\AsEnumCollection;

/**
 * Get the attributes that should be cast.
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

`encrypted` 캐스트는 라라벨이 내장한 [암호화](/docs/12.x/encryption) 기능을 활용하여 모델 속성 값을 암호화합니다. 또한, `encrypted:array`, `encrypted:collection`, `encrypted:object`, `AsEncryptedArrayObject`, `AsEncryptedCollection` 캐스트도 제공되며, 동작은 암호화되지 않은 캐스트들과 유사하지만, 저장될 때 값이 암호화된다는 차이가 있습니다.

암호화된 텍스트의 최종 길이는 예측이 불가능하며 평문보다 길어질 수 있으므로, 해당 컬럼의 데이터베이스 타입이 `TEXT`(또는 그보다 큰 타입)인지 반드시 확인해야 합니다. 또한, 값이 데이터베이스에 암호화되어 저장되기 때문에 암호화된 속성 값으로 쿼리하거나 검색할 수 없습니다.

<a name="key-rotation"></a>
#### 키 교체(Key Rotation)

라라벨은 애플리케이션의 `app` 설정 파일에 지정된 `key` 값을 사용하여 문자열을 암호화합니다. 이 값은 일반적으로 `.env`의 `APP_KEY` 환경 변수와 일치합니다. 만약 애플리케이션의 암호화 키를 교체해야 한다면, 새로운 키로 기존 암호화된 속성 값을 수동으로 재암호화해야 합니다.

<a name="query-time-casting"></a>
### 쿼리 타임 캐스팅

때때로, 테이블에서 원시 값을 선택(select)할 때처럼 쿼리를 실행하는 도중에 캐스팅을 적용해야 할 때가 있습니다. 예를 들어, 아래 쿼리를 살펴보십시오.

```php
use App\Models\Post;
use App\Models\User;

$users = User::select([
    'users.*',
    'last_posted_at' => Post::selectRaw('MAX(created_at)')
        ->whereColumn('user_id', 'users.id')
])->get();
```

위 쿼리의 결과로 반환되는 `last_posted_at` 속성은 문자열 형태가 됩니다. 이 속성을 쿼리 실행 시에 `datetime`으로 캐스팅해서 다룰 수 있다면 더욱 편리할 것입니다. 이를 위해 `withCasts` 메서드를 사용할 수 있습니다.

```php
$users = User::select([
    'users.*',
    'last_posted_at' => Post::selectRaw('MAX(created_at)')
        ->whereColumn('user_id', 'users.id')
])->withCasts([
    'last_posted_at' => 'datetime'
])->get();
```

<a name="custom-casts"></a>
## 커스텀 캐스트(Custom Casts)

라라벨은 여러 내장 캐스트 타입을 제공하지만, 때때로 사용자 정의 캐스트 타입이 필요할 수도 있습니다. 커스텀 캐스트를 생성하려면 `make:cast` 아티즌 명령어를 실행하면 됩니다. 새 캐스트 클래스는 `app/Casts` 디렉터리에 생성됩니다.

```shell
php artisan make:cast AsJson
```

모든 커스텀 캐스트 클래스는 `CastsAttributes` 인터페이스를 구현해야 합니다. 이 인터페이스를 구현하는 클래스는 반드시 `get` 메서드와 `set` 메서드를 정의해야 합니다. `get` 메서드는 데이터베이스의 원시 값을 캐스트 값으로 변환할 때 호출되며, `set` 메서드는 캐스트 값을 데이터베이스에 저장 가능한 원시 값으로 변환할 때 사용됩니다. 예시로, 내장된 `json` 캐스트 타입을 커스텀 캐스트 클래스로 재구현해 보겠습니다.

```php
<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

class AsJson implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    public function get(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): array {
        return json_decode($value, true);
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function set(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): string {
        return json_encode($value);
    }
}
```

커스텀 캐스트 타입을 정의한 후에는, 클래스명을 이용해 모델의 속성에 해당 캐스트를 적용할 수 있습니다.

```php
<?php

namespace App\Models;

use App\Casts\AsJson;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'options' => AsJson::class,
        ];
    }
}
```

<a name="value-object-casting"></a>
### 값 객체 캐스팅(Value Object Casting)

캐스트 대상은 반드시 원시값(primitive type)일 필요는 없습니다. 오히려 객체로도 캐스팅할 수 있습니다. 값 객체로 캐스팅하는 커스텀 캐스트 정의는 원시값 캐스팅과 매우 유사하지만, 값 객체가 데이터베이스의 두 개 이상의 컬럼을 다루는 경우, `set` 메서드는 모델에 저장할 수 있는 키/값 쌍의 배열을 반환해야 합니다. 만약 값 객체가 하나의 컬럼만 적용 대상이면, 저장 가능한 단일 값만 반환하면 됩니다.

예를 들어, 여러 모델 속성을 하나의 `Address` 값 객체로 캐스팅하는 커스텀 캐스트 클래스를 만들겠습니다. `Address` 값 객체에는 `lineOne`과 `lineTwo` 두 개의 public 속성이 있다고 가정합니다.

```php
<?php

namespace App\Casts;

use App\ValueObjects\Address;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;

class AsAddress implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function get(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): Address {
        return new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two']
        );
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  array<string, mixed>  $attributes
     * @return array<string, string>
     */
    public function set(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): array {
        if (! $value instanceof Address) {
            throw new InvalidArgumentException('The given value is not an Address instance.');
        }

        return [
            'address_line_one' => $value->lineOne,
            'address_line_two' => $value->lineTwo,
        ];
    }
}
```

값 객체로 캐스팅할 때는, 값 객체 내부에서 값이 변경되면, 모델을 저장하기 전에 자동으로 모델에도 해당 값이 반영됩니다.

```php
use App\Models\User;

$user = User::find(1);

$user->address->lineOne = 'Updated Address Value';

$user->save();
```

> [!NOTE]
> 값 객체를 포함하는 Eloquent 모델을 JSON이나 배열로 직렬화할 계획이 있다면, 값 객체에 `Illuminate\Contracts\Support\Arrayable` 및 `JsonSerializable` 인터페이스를 구현하는 것이 좋습니다.

<a name="value-object-caching"></a>
#### 값 객체 캐싱

값 객체로 캐스팅된 속성이 해석(Resolve)되면, Eloquent에서 해당 객체 인스턴스를 캐싱합니다. 따라서 속성을 다시 접근할 때 동일한 객체 인스턴스가 반환됩니다.

이런 오브젝트 캐싱 동작을 비활성화하려면, 커스텀 캐스트 클래스에 public 속성으로 `withoutObjectCaching`을 선언하면 됩니다.

```php
class AsAddress implements CastsAttributes
{
    public bool $withoutObjectCaching = true;

    // ...
}
```

<a name="array-json-serialization"></a>
### 배열 / JSON 직렬화

Eloquent 모델을 `toArray` 또는 `toJson` 메서드로 배열이나 JSON으로 변환할 때, 커스텀 캐스트 객체도 일반적으로 직렬화됩니다. 단, 해당 객체가 `Illuminate\Contracts\Support\Arrayable` 및 `JsonSerializable` 인터페이스를 구현한 경우에만 그렇습니다. 그러나 서드파티 라이브러리에서 제공한 값 객체처럼 임의의 객체에는 직접 이 인터페이스를 추가할 수 없는 경우가 있을 수 있습니다.

이때는 커스텀 캐스트 클래스가 값 객체의 직렬화 작업을 직접 담당하도록 지정할 수 있습니다. 이를 위해 커스텀 캐스트 클래스가 `Illuminate\Contracts\Database\Eloquent\SerializesCastableAttributes` 인터페이스를 구현해야 합니다. 이 인터페이스는 객체의 직렬화 결과를 반환하는 `serialize` 메서드를 요구합니다.

```php
/**
 * Get the serialized representation of the value.
 *
 * @param  array<string, mixed>  $attributes
 */
public function serialize(
    Model $model,
    string $key,
    mixed $value,
    array $attributes,
): string {
    return (string) $value;
}
```

<a name="inbound-casting"></a>
### 인바운드 캐스팅(Inbound Casting)

때때로, 모델에 값을 저장할 때만 변환이 필요하고, 속성을 조회할 때는 변환이 필요 없는 커스텀 캐스트 클래스를 만들어야 할 수도 있습니다.

이러한 인바운드 전용 커스텀 캐스트는 `CastsInboundAttributes` 인터페이스를 구현해야 하며, 반드시 `set` 메서드만 정의하면 됩니다. 아티즌에서 `--inbound` 옵션을 추가하여 인바운드 전용 캐스트 클래스를 만들 수 있습니다.

```shell
php artisan make:cast AsHash --inbound
```

인바운드 전용 캐스트의 대표적인 예시는 값의 "해시화"입니다. 예를 들어, 다음과 같이 특정 알고리즘으로 저장 전 값을 해시하는 캐스트 클래스를 정의할 수 있습니다.

```php
<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsInboundAttributes;
use Illuminate\Database\Eloquent\Model;

class AsHash implements CastsInboundAttributes
{
    /**
     * Create a new cast class instance.
     */
    public function __construct(
        protected string|null $algorithm = null,
    ) {}

    /**
     * Prepare the given value for storage.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function set(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): string {
        return is_null($this->algorithm)
            ? bcrypt($value)
            : hash($this->algorithm, $value);
    }
}
```

<a name="cast-parameters"></a>
### 캐스트 파라미터(Cast Parameters)

커스텀 캐스트를 모델에 지정할 때, 클래스명 뒤에 `:`를 붙이고 쉼표로 여러 파라미터를 구분하여 캐스트 파라미터를 지정할 수 있습니다. 지정한 파라미터는 캐스트 클래스의 생성자에 전달됩니다.

```php
/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'secret' => AsHash::class.':sha256',
    ];
}
```

<a name="castables"></a>
### Castable

애플리케이션의 값 객체 자체에 커스텀 캐스트 클래스를 정의하도록 할 수도 있습니다. 커스텀 캐스트 클래스를 모델에 직접 지정하는 대신, `Illuminate\Contracts\Database\Eloquent\Castable` 인터페이스를 구현한 값 객체 클래스를 지정할 수 있습니다.

```php
use App\ValueObjects\Address;

protected function casts(): array
{
    return [
        'address' => Address::class,
    ];
}
```

`Castable` 인터페이스를 구현한 객체는, 해당 오브젝트로 캐스팅할 때 사용할 커스텀 캐스터 클래스명을 반환하는 `castUsing` 메서드를 반드시 정의해야 합니다.

```php
<?php

namespace App\ValueObjects;

use Illuminate\Contracts\Database\Eloquent\Castable;
use App\Casts\AsAddress;

class Address implements Castable
{
    /**
     * Get the name of the caster class to use when casting from / to this cast target.
     *
     * @param  array<string, mixed>  $arguments
     */
    public static function castUsing(array $arguments): string
    {
        return AsAddress::class;
    }
}
```

`Castable` 클래스를 사용할 때도, `casts` 메서드 정의 내부에서 파라미터를 전달할 수 있습니다. 전달한 파라미터는 `castUsing` 메서드의 인자로 들어갑니다.

```php
use App\ValueObjects\Address;

protected function casts(): array
{
    return [
        'address' => Address::class.':argument',
    ];
}
```

<a name="anonymous-cast-classes"></a>
#### Castable & 익명 캐스트 클래스

"Castable"과 PHP의 [익명 클래스(anonymous classes)](https://www.php.net/manual/en/language.oop5.anonymous.php)를 결합하여, 값 객체와 그 캐스팅 로직을 하나의 Castable 객체로 정의할 수도 있습니다. 이를 위해 값 객체의 `castUsing` 메서드에서 익명 클래스를 반환하면 됩니다. 이 익명 클래스는 `CastsAttributes` 인터페이스를 구현해야 합니다.

```php
<?php

namespace App\ValueObjects;

use Illuminate\Contracts\Database\Eloquent\Castable;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class Address implements Castable
{
    // ...

    /**
     * Get the caster class to use when casting from / to this cast target.
     *
     * @param  array<string, mixed>  $arguments
     */
    public static function castUsing(array $arguments): CastsAttributes
    {
        return new class implements CastsAttributes
        {
            public function get(
                Model $model,
                string $key,
                mixed $value,
                array $attributes,
            ): Address {
                return new Address(
                    $attributes['address_line_one'],
                    $attributes['address_line_two']
                );
            }

            public function set(
                Model $model,
                string $key,
                mixed $value,
                array $attributes,
            ): array {
                return [
                    'address_line_one' => $value->lineOne,
                    'address_line_two' => $value->lineTwo,
                ];
            }
        };
    }
}
```