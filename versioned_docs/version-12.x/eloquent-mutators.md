# Eloquent: 변경자(Mutators) & 캐스팅(Casting)

- [소개](#introduction)
- [접근자(Accessors)와 변경자(Mutators)](#accessors-and-mutators)
    - [접근자 정의하기](#defining-an-accessor)
    - [변경자 정의하기](#defining-a-mutator)
- [속성 캐스팅](#attribute-casting)
    - [배열 및 JSON 캐스팅](#array-and-json-casting)
    - [날짜 캐스팅](#date-casting)
    - [Enum 캐스팅](#enum-casting)
    - [암호화 캐스팅](#encrypted-casting)
    - [쿼리 시점 캐스팅](#query-time-casting)
- [커스텀 캐스트](#custom-casts)
    - [값 객체 캐스팅](#value-object-casting)
    - [배열/JSON 직렬화](#array-json-serialization)
    - [입력값(Inbound) 캐스팅](#inbound-casting)
    - [캐스트 파라미터](#cast-parameters)
    - [캐스터블(Castables)](#castables)

<a name="introduction"></a>
## 소개

접근자, 변경자, 그리고 속성 캐스팅은 Eloquent 모델 인스턴스에서 속성을 조회하거나 설정할 때 속성 값을 변환할 수 있도록 도와주는 기능입니다. 예를 들어, [Laravel의 암호화기](/docs/encryption)를 사용해 값을 데이터베이스에 저장할 때 암호화하고, Eloquent 모델에서 해당 속성을 읽을 때 자동으로 복호화할 수도 있습니다. 또는 데이터베이스에 저장된 JSON 문자열을 Eloquent 모델을 통해 접근할 때 배열로 자동 변환할 수도 있습니다.

<a name="accessors-and-mutators"></a>
## 접근자(Accessor)와 변경자(Mutator)

<a name="defining-an-accessor"></a>
### 접근자 정의하기

접근자는 Eloquent 속성 값을 조회할 때 해당 값을 변환해줍니다. 접근자를 정의하려면, 모델에 접근 가능한 속성을 나타내는 protected 메서드를 만듭니다. 메서드명은 실제 모델 속성명(컬럼명)을 "카멜 케이스"로 변환한 형태여야 합니다.

예를 들어, `first_name` 속성에 대한 접근자를 만들겠습니다. 이 접근자는 `first_name` 속성 값을 조회하려고 할 때 Eloquent가 자동으로 호출하게 됩니다. 모든 접근자/변경자 메서드는 반드시 `Illuminate\Database\Eloquent\Casts\Attribute` 타입으로 반환해야 합니다:

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

모든 접근자 메서드는 속성을 어떻게 조회(그리고 필요하다면 변경)할지 정의하는 `Attribute` 인스턴스를 반환해야 합니다. 위 예에서는 속성을 어떻게 '조회'할지에 대해서만 정의하고 있습니다. 이를 위해 `Attribute` 클래스 생성자에 `get` 인자를 전달합니다.

보시는 것처럼, 컬럼의 원래 값이 접근자로 전달되어, 원하는 대로 값을 변환해 반환할 수 있습니다. 접근자 메서드로 값을 얻으려면, 단순히 모델 인스턴스의 해당 속성에 접근하면 됩니다:

```php
use App\Models\User;

$user = User::find(1);

$firstName = $user->first_name;
```

> [!NOTE]
> 이런 방식으로 계산된(custom) 값들을 모델의 배열/JSON 표현에 포함하려면, [별도로 속성을 추가(APPEND)해야 합니다](/docs/eloquent-serialization#appending-values-to-json).

<a name="building-value-objects-from-multiple-attributes"></a>
#### 여러 속성으로 값 객체(Value Object) 만들기

때때로, 접근자에서 여러 모델 속성을 하나의 "값 객체"로 변환해야 할 수 있습니다. 이 경우, `get` 클로저에 두 번째 인자인 `$attributes`를 받을 수 있으며, 이 값에는 모델의 모든 현재 속성이 배열로 전달됩니다:

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
#### 접근자 캐싱

접근자에서 값 객체(Value Object)를 반환할 때, 해당 객체에 변경이 생기면 모델을 저장하기 전 자동으로 모델에 동기화됩니다. 이렇게 할 수 있는 이유는 Eloquent가 한 번 반환한 접근자 인스턴스를 재사용해, 해당 접근자를 여러 번 호출해도 동일한 인스턴스를 반환하기 때문입니다:

```php
use App\Models\User;

$user = User::find(1);

$user->address->lineOne = 'Updated Address Line 1 Value';
$user->address->lineTwo = 'Updated Address Line 2 Value';

$user->save();
```

하지만 문자열이나 불린과 같은 단순 데이터(primitive)의 값들이 계산 비용이 크다면, 캐싱을 활성화하고 싶을 수도 있습니다. 이 경우, 접근자를 정의할 때 `shouldCache` 메서드를 호출하면 됩니다:

```php
protected function hash(): Attribute
{
    return Attribute::make(
        get: fn (string $value) => bcrypt(gzuncompress($value)),
    )->shouldCache();
}
```

속성의 객체 캐싱 동작을 비활성화하고 싶다면, 접근자 정의 시 `withoutObjectCaching` 메서드를 사용할 수 있습니다:

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
### 변경자 정의하기

변경자는 Eloquent 모델 속성값이 설정될 때, 해당 값을 변환해줍니다. 변경자를 정의하려면, 속성을 정의할 때 `set` 인자를 제공하면 됩니다. 아래는 `first_name` 속성에 대한 변경자 예시입니다. 이 변경자는 모델의 `first_name` 속성값을 설정할 때 자동으로 호출됩니다:

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

변경자 클로저에는 속성에 저장하려는 값이 전달되며, 이 값을 원하는 대로 가공한 후 반환하면 됩니다. 변경자를 사용하려면, Eloquent 모델의 해당 속성에 값을 할당하면 됩니다:

```php
use App\Models\User;

$user = User::find(1);

$user->first_name = 'Sally';
```

위 예제에서, `set` 콜백은 `Sally`라는 값을 인자로 받아 `strtolower` 함수를 적용한 값을 모델의 내부 `$attributes` 배열에 저장하게 됩니다.

<a name="mutating-multiple-attributes"></a>
#### 여러 속성 변경하기

때로는 변경자가 모델의 여러 속성을 한 번에 설정해야 할 때도 있습니다. 이럴 때는 `set` 클로저에서 배열을 반환하면 됩니다. 배열의 각 키는 모델의 실제 속성/컬럼명에 대응해야 합니다:

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
## 속성 캐스팅

속성 캐스팅은 접근자, 변경자와 유사한 기능을 제공하지만, 모델에 별도의 메서드를 추가로 정의하지 않아도 사용할 수 있습니다. 대신, 모델의 `casts` 메서드를 활용해 속성을 자주 사용하는 데이터 타입으로 쉽게 변환할 수 있습니다.

`casts` 메서드는 키가 캐스팅할 속성명, 값이 변환하고자 하는 타입인 배열을 반환해야 합니다. 지원하는 캐스팅 타입은 다음과 같습니다.

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

속성 캐스팅을 예시로 살펴보면, 데이터베이스에 정수(0 또는 1)로 저장된 `is_admin` 속성을 불린으로 캐스팅할 수 있습니다:

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

캐스팅을 정의하면, 데이터베이스에 실제 정수로 저장되어 있더라도 `is_admin` 속성에 접근할 때는 항상 불린 타입으로 변환됩니다:

```php
$user = App\Models\User::find(1);

if ($user->is_admin) {
    // ...
}
```

실행 중에 새로운 임시 캐스트를 추가하고 싶다면, `mergeCasts` 메서드를 사용할 수 있습니다. 이 방식으로 추가한 캐스트 정의는 이미 모델에 정의된 캐스트와 병합됩니다:

```php
$user->mergeCasts([
    'is_admin' => 'integer',
    'options' => 'object',
]);
```

> [!WARNING]
> 값이 `null`인 속성은 캐스팅되지 않습니다. 또한, 관계명과 동일한 이름이나 모델의 기본 키(primary key)에 캐스트를 정의(또는 속성을 추가)해서는 안 됩니다.

<a name="stringable-casting"></a>
#### Stringable 캐스팅

`Illuminate\Database\Eloquent\Casts\AsStringable` 캐스트 클래스를 사용해 모델 속성을 [유연한 Illuminate\Support\Stringable 객체](/docs/strings#fluent-strings-method-list)로 캐스팅할 수 있습니다:

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
### 배열 및 JSON 캐스팅

`array` 캐스트는 직렬화된 JSON 컬럼을 다룰 때 매우 유용합니다. 데이터베이스에 JSON이나 TEXT 타입 컬럼에 직렬화된 JSON 문자열이 저장되어 있다면, 해당 속성에 `array` 캐스트를 추가하는 것만으로 Eloquent 모델에서 접근할 때 PHP 배열로 자동 변환할 수 있습니다:

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

이렇게 캐스트를 정의하면, `options` 속성에 접근할 때 자동으로 JSON에서 PHP 배열로 역직렬화됩니다. 또한, `options` 속성의 값을 설정할 때는 해당 배열이 자동으로 JSON으로 직렬화되어 저장됩니다:

```php
use App\Models\User;

$user = User::find(1);

$options = $user->options;

$options['key'] = 'value';

$user->options = $options;

$user->save();
```

JSON 속성의 단일 필드만 간단한 문법으로 업데이트하려면, [속성을 대량 할당 가능(mass assignable) 하게 지정한 뒤](/docs/eloquent#mass-assignment-json-columns) `update` 메서드를 사용할 때 `->` 연산자를 사용할 수 있습니다:

```php
$user = User::find(1);

$user->update(['options->key' => 'value']);
```

<a name="json-and-unicode"></a>
#### JSON과 유니코드

배열 속성을 JSON으로 저장할 때, 유니코드 문자가 이스케이프되지 않은 형태로 저장하고 싶다면 `json:unicode` 캐스트를 사용할 수 있습니다:

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
#### ArrayObject 및 컬렉션 캐스팅

기본 `array` 캐스트는 많은 경우 충분히 쓸 수 있지만, 몇 가지 단점이 있습니다. 예를 들어, 배열 오프셋(혹은 키)에 직접 값을 할당하면 PHP 에러가 발생할 수 있습니다:

```php
$user = User::find(1);

$user->options['key'] = $value;
```

이 문제를 해결하기 위해, Laravel은 JSON 속성을 [ArrayObject](https://www.php.net/manual/en/class.arrayobject.php) 클래스로 캐스트하는 `AsArrayObject` 캐스트를 제공합니다. 이 기능은 Laravel의 [커스텀 캐스트](#custom-casts)를 기반으로 동작하며, 변경된 객체를 지능적으로 캐싱·변환하여 개별 값을 에러 없이 수정할 수 있게 해줍니다. 사용하려면 속성에 캐스트 클래스를 할당하기만 하면 됩니다:

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

마찬가지로, Laravel은 JSON 속성을 Laravel [컬렉션](/docs/collections) 인스턴스로 변환하는 `AsCollection` 캐스트도 제공합니다:

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

`AsCollection` 캐스트를 사용할 때, Laravel 기본 컬렉션 대신 커스텀 컬렉션 클래스를 사용하고 싶다면 클래스명을 캐스트 인자로 전달하면 됩니다:

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

`of` 메서드를 사용해 컬렉션의 각 아이템을 특정 클래스로 매핑하려면, 컬렉션의 [mapInto 메서드](/docs/collections#method-mapinto)를 활용할 수 있습니다:

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

컬렉션 아이템을 객체로 매핑할 때, 객체는 데이터베이스로 JSON 직렬화가 가능하도록 `Illuminate\Contracts\Support\Arrayable` 과 `JsonSerializable` 인터페이스를 구현해야 합니다:

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
### 날짜 캐스팅

기본적으로 Eloquent는 `created_at`과 `updated_at` 컬럼을 [Carbon](https://github.com/briannesbitt/Carbon) 객체로 캐스팅하며, Carbon은 PHP의 `DateTime` 클래스를 확장해 여러 유용한 메서드를 제공합니다. 추가로 날짜 속성을 더 캐스팅하고 싶다면, 모델의 `casts` 메서드에 추가로 날짜 캐스트를 정의하면 됩니다. 일반적으로 날짜는 `datetime`이나 `immutable_datetime` 타입으로 캐스팅하는 것이 좋습니다.

`date` 또는 `datetime` 캐스트를 정의할 때, 원하는 날짜 형식을 지정할 수도 있습니다. 이 형식은 [모델이 배열이나 JSON으로 직렬화](/docs/eloquent-serialization)될 때 사용됩니다:

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

컬럼을 날짜로 캐스팅하면, 해당 모델 속성에는 UNIX 타임스탬프, 날짜 문자열(`Y-m-d`), 날짜/시간 문자열, 또는 `DateTime`/`Carbon` 인스턴스 등 다양한 값을 할당할 수 있으며, 올바른 형식으로 데이터베이스에 저장됩니다.

모델의 모든 날짜에 대한 기본 직렬화 형식을 커스텀하고 싶다면 모델에 `serializeDate` 메서드를 정의하면 됩니다. 이 메서드는 데이터베이스에 어떻게 저장되는지에는 영향을 주지 않고, 배열/JSON 직렬화 형식에만 영향을 줍니다:

```php
/**
 * Prepare a date for array / JSON serialization.
 */
protected function serializeDate(DateTimeInterface $date): string
{
    return $date->format('Y-m-d');
}
```

모델의 날짜가 실제로 데이터베이스에 저장되는 형식을 지정하려면, 모델에 `$dateFormat` 속성을 정의해야 합니다:

```php
/**
 * The storage format of the model's date columns.
 *
 * @var string
 */
protected $dateFormat = 'U';
```

<a name="date-casting-and-timezones"></a>

#### 날짜 캐스팅, 직렬화, 그리고 타임존

기본적으로, `date` 및 `datetime` 캐스팅은 애플리케이션의 `timezone` 설정 옵션에 지정된 타임존과 관계없이 날짜를 항상 UTC ISO-8601 날짜 문자열(`YYYY-MM-DDTHH:MM:SS.uuuuuuZ`)로 직렬화합니다. 라라벨에서는 이 직렬화 형식과, 애플리케이션의 날짜를 UTC 타임존으로 저장하는 방식(즉, `timezone` 설정 옵션을 기본값인 `UTC`에서 변경하지 않는 것)의 사용을 강력히 권장합니다. 애플리케이션 전반에서 UTC 타임존을 일관되게 사용하면, PHP 및 JavaScript로 작성된 다양한 날짜 조작 라이브러리와의 상호운용성이 극대화됩니다.

만약 `date` 혹은 `datetime` 캐스팅에 `datetime:Y-m-d H:i:s`와 같은 커스텀 포맷을 적용하면, 이 시점의 날짜 직렬화에는 Carbon 인스턴스 내부의 타임존이 사용됩니다. 일반적으로 이는 애플리케이션의 `timezone` 설정값이 될 것입니다. 단, `created_at`, `updated_at` 등과 같은 `timestamp` 컬럼은 이러한 방식의 예외로, 애플리케이션의 타임존 설정과 관계없이 항상 UTC로 포맷됩니다.

<a name="enum-casting"></a>
### 열거형(Enum) 캐스팅

Eloquent는 속성 값을 PHP [Enum(열거형)](https://www.php.net/manual/en/language.enumerations.backed.php)으로 캐스팅하는 기능도 제공합니다. 이를 위해, 모델의 `casts` 메서드 안에서 캐스팅할 속성과 Enum을 지정하면 됩니다.

```php
use App\Enums\ServerStatus;

/**
 * 어떤 속성들을 캐스팅할지 반환합니다.
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

이렇게 모델에 캐스팅 설정을 정의하면, 해당 속성을 가져오거나 설정할 때 자동으로 Enum 타입으로 변환됩니다.

```php
if ($server->status == ServerStatus::Provisioned) {
    $server->status = ServerStatus::Ready;

    $server->save();
}
```

<a name="casting-arrays-of-enums"></a>
#### 열거형 배열 캐스팅

때로는 모델에서 하나의 컬럼에 여러 개의 Enum 값을 배열로 저장해야 할 필요가 있습니다. 이런 경우 Laravel에서 제공하는 `AsEnumArrayObject` 또는 `AsEnumCollection` 캐스트를 사용할 수 있습니다.

```php
use App\Enums\ServerStatus;
use Illuminate\Database\Eloquent\Casts\AsEnumCollection;

/**
 * 어떤 속성들을 캐스팅할지 반환합니다.
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

`encrypted` 캐스트는 모델의 속성 값을 라라벨의 [암호화](/docs/encryption) 기능을 사용하여 암호화합니다. 또한, `encrypted:array`, `encrypted:collection`, `encrypted:object`, `AsEncryptedArrayObject`, `AsEncryptedCollection` 캐스트 역시 기존 비암호화 버전과 거의 동일하게 동작합니다. 단, 데이터를 저장할 때 값이 암호화된다는 점만 다릅니다.

암호화된 텍스트의 최종 길이는 예측하기 어렵고 일반 텍스트보다 더 길어지므로, 관련된 데이터베이스 컬럼의 타입을 반드시 `TEXT` 이상으로 지정해야 합니다. 그리고 값이 데이터베이스 내에서 암호화되어 저장되기 때문에, 암호화된 속성 값 기준으로는 쿼리나 검색을 할 수 없습니다.

<a name="key-rotation"></a>
#### 키 교체

라라벨은 애플리케이션의 `app` 설정 파일에 있는 `key` 설정값(일반적으로 환경 변수 `APP_KEY` 값)을 사용해 문자열을 암호화합니다. 만약 암호화 키를 변경해야 할 경우, 새 키로 기존 암호화된 속성들을 직접 재암호화(re-encrypt)해야 함을 명심하세요.

<a name="query-time-casting"></a>
### 쿼리 시점 캐스팅

가끔은 쿼리를 실행하면서 바로 값에 캐스팅을 적용하고 싶을 수 있습니다. 예를 들어, 테이블에서 가공된(raw) 값을 선택(select)할 때가 있습니다. 아래 예제를 살펴보세요.

```php
use App\Models\Post;
use App\Models\User;

$users = User::select([
    'users.*',
    'last_posted_at' => Post::selectRaw('MAX(created_at)')
        ->whereColumn('user_id', 'users.id')
])->get();
```

이 쿼리 결과에서 `last_posted_at` 속성은 단순한 문자열이 됩니다. 이 속성에 바로 `datetime` 캐스트를 적용할 수 있다면 훨씬 편리할 것입니다. 이런 경우를 위해 `withCasts` 메서드를 사용할 수 있습니다.

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
## 커스텀 캐스트

라라벨에는 다양한 내장 캐스트 타입이 준비되어 있지만, 필요에 따라 직접 자신만의 캐스트 타입을 정의할 수도 있습니다. 캐스트 클래스를 만들려면 `make:cast` Artisan 명령어를 실행하세요. 새로 생성된 캐스트 클래스는 `app/Casts` 디렉토리에 저장됩니다.

```shell
php artisan make:cast AsJson
```

커스텀 캐스트 클래스는 모두 `CastsAttributes` 인터페이스를 구현해야 합니다. 이 인터페이스를 구현하는 클래스는 반드시 `get`, `set` 두 메서드를 정의해야 하며, 각각은 데이터베이스의 원본 값을 캐스트 값으로 변환하거나, 그 반대로 캐스트 값을 데이터베이스에 저장 가능한 원본 값으로 변환하는 역할을 합니다. 예시로, 내장 `json` 캐스트 타입을 커스텀 방식으로 다시 구현해보겠습니다.

```php
<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

class AsJson implements CastsAttributes
{
    /**
     * 주어진 값을 캐스팅합니다.
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
     * 저장할 수 있는 값으로 변환합니다.
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

커스텀 캐스트 타입을 정의했다면, 이제 모델의 속성에 해당 클래스 이름을 붙여서 사용할 수 있습니다.

```php
<?php

namespace App\Models;

use App\Casts\AsJson;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 어떤 속성들을 캐스팅할지 반환합니다.
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
### 값 객체 캐스팅

캐스트는 기본 타입(숫자, 문자열 등)뿐만 아니라 객체로도 수행할 수 있습니다. 값 객체로 캐스팅되는 커스텀 캐스트를 정의하는 방식은 기본 타입과 거의 비슷하지만, 값 객체가 데이터베이스의 여러 컬럼에 관련된 값이라면, `set` 메서드는 원시값(저장 가능한 값)들의 키/값 배열을 반환해야 합니다. 만약 하나의 컬럼만에 영향이 있다면, 단일 값을 반환하면 충분합니다.

예시로, 여러 모델 값을 하나의 `Address` 값 객체로 캐스팅하는 커스텀 캐스트 클래스를 정의해보겠습니다. 여기서 `Address` 값 객체는 `lineOne`, `lineTwo` 두 개의 public 속성을 갖는다고 가정합니다.

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
     * 주어진 값을 캐스팅합니다.
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
     * 저장할 수 있는 값으로 변환합니다.
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

값 객체로 캐스팅했을 때, 값 객체의 내용을 변경하면 모델이 저장되기 전 자동으로 모델에 반영됩니다.

```php
use App\Models\User;

$user = User::find(1);

$user->address->lineOne = 'Updated Address Value';

$user->save();
```

> [!NOTE]
> 값 객체를 포함하는 Eloquent 모델을 JSON 또는 배열로 직렬화하고 싶다면, 해당 값 객체에 `Illuminate\Contracts\Support\Arrayable` 및 `JsonSerializable` 인터페이스를 구현하는 것이 좋습니다.

<a name="value-object-caching"></a>
#### 값 객체 캐싱

값 객체로 캐스팅된 속성들을 Eloquent가 해석하면, 내부적으로 캐시가 됩니다. 즉, 동일 속성에 재접근하면 항상 같은 객체 인스턴스가 반환됩니다.

커스텀 캐스트 클래스의 이런 객체 캐싱 동작을 비활성화하고 싶다면, 클래스에 public 속성 `withoutObjectCaching`을 선언하고 `true`로 지정하면 됩니다.

```php
class AsAddress implements CastsAttributes
{
    public bool $withoutObjectCaching = true;

    // ...
}
```

<a name="array-json-serialization"></a>
### 배열 / JSON 직렬화

Eloquent 모델을 `toArray` 또는 `toJson` 메서드로 배열 또는 JSON으로 변환할 때, 커스텀 캐스트 값 객체도 보통 함께 직렬화됩니다(단, `Illuminate\Contracts\Support\Arrayable` 및 `JsonSerializable` 인터페이스를 구현한 경우). 하지만, 외부 라이브러리에서 제공하는 값 객체라서 이 인터페이스들을 추가할 수 없다면, 커스텀 캐스트 클래스에서 직접 직렬화 로직을 구현할 수 있습니다.

이 경우, 커스텀 캐스트 클래스에서 `Illuminate\Contracts\Database\Eloquent\SerializesCastableAttributes` 인터페이스를 구현하면 됩니다. 해당 인터페이스에서는 반드시 `serialize` 메서드를 구현해야 하며, 이 메서드는 값 객체의 직렬화된 데이터를 반환합니다.

```php
/**
 * 값의 직렬화 형태를 반환합니다.
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
### 입력(Inbound) 캐스팅

커스텀 캐스트 클래스가 모델에 '설정(입력)'되는 값만 변환하고, 속성을 '읽을 때'는 아무 작업도 하지 않기를 원할 수도 있습니다.

이 경우, 입력용 커스텀 캐스트는 `CastsInboundAttributes` 인터페이스를 구현해야 합니다. 이 인터페이스는 반드시 `set` 메서드만 구현하면 됩니다. Artisan의 `make:cast` 명령에 `--inbound` 옵션을 사용하면 입력 전용 캐스트 클래스를 생성할 수 있습니다.

```shell
php artisan make:cast AsHash --inbound
```

입력 전용 캐스트의 대표적인 예시는 "해시" 캐스트입니다. 아래 예시는 특정 알고리즘으로 값(예: 비밀번호 등)을 해싱하여 저장하는 캐스트입니다.

```php
<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsInboundAttributes;
use Illuminate\Database\Eloquent\Model;

class AsHash implements CastsInboundAttributes
{
    /**
     * 캐스트 클래스 인스턴스 생성자
     */
    public function __construct(
        protected string|null $algorithm = null,
    ) {}

    /**
     * 저장할 수 있는 값으로 변환합니다.
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
### 캐스트 파라미터

커스텀 캐스트를 모델에 적용할 때, 클래스명 뒤에 `:`을 붙이고 여러 파라미터를 콤마(,)로 구분하여 전달할 수 있습니다. 이렇게 지정한 파라미터들은 캐스트 클래스의 생성자에 넘겨집니다.

```php
/**
 * 어떤 속성들을 캐스팅할지 반환합니다.
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
### Castable(캐스터 구현 가능한) 값 객체

애플리케이션의 값 객체에서 직접 커스텀 캐스트 클래스를 지정(내장)하는 것도 가능합니다. 즉, 커스텀 캐스트 클래스를 모델에 직접 지정하지 않고, 대신 `Illuminate\Contracts\Database\Eloquent\Castable` 인터페이스를 구현한 값 객체 클래스 자체를 모델에 지정할 수 있습니다.

```php
use App\ValueObjects\Address;

protected function casts(): array
{
    return [
        'address' => Address::class,
    ];
}
```

`Castable` 인터페이스를 구현한 객체는 반드시 커스텀 캐스터 클래스명을 반환하는 `castUsing` 메서드를 정의해야 합니다. 이 클래스가 실제로 값 객체를 캐스팅할 로직을 담당합니다.

```php
<?php

namespace App\ValueObjects;

use Illuminate\Contracts\Database\Eloquent\Castable;
use App\Casts\AsAddress;

class Address implements Castable
{
    /**
     * 해당 값 객체로 캐스팅할 때 사용할 캐스터 클래스명을 반환합니다.
     *
     * @param  array<string, mixed>  $arguments
     */
    public static function castUsing(array $arguments): string
    {
        return AsAddress::class;
    }
}
```

`Castable` 클래스를 사용할 때에도 `casts` 메서드 정의에서 추가 인자를 전달할 수 있습니다. 이 파라미터들은 `castUsing` 메서드로 전달됩니다.

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
#### Castable과 익명 캐스트 클래스

"Castable" 기능과 PHP의 [익명 클래스](https://www.php.net/manual/en/language.oop5.anonymous.php)를 결합하면, 값 객체와 캐스팅 로직을 하나의 캐스터 객체로 정의할 수도 있습니다. 이를 위해, 값 객체의 `castUsing` 메서드에서 익명 클래스를 반환하도록 하면 됩니다. 이 익명 클래스는 `CastsAttributes` 인터페이스를 구현해야 합니다.

```php
<?php

namespace App\ValueObjects;

use Illuminate\Contracts\Database\Eloquent\Castable;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class Address implements Castable
{
    // ...

    /**
     * 해당 값 객체로 캐스팅할 때 사용할 캐스터 클래스를 반환합니다.
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