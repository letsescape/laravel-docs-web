# Eloquent: 접근자 & 타입 캐스팅 (Eloquent: Mutators & Casting)

- [소개](#introduction)
- [접근자와 변경자](#accessors-and-mutators)
    - [접근자 정의하기](#defining-an-accessor)
    - [변경자 정의하기](#defining-a-mutator)
- [속성 타입 캐스팅](#attribute-casting)
    - [배열 & JSON 캐스팅](#array-and-json-casting)
    - [날짜 캐스팅](#date-casting)
    - [Enum 캐스팅](#enum-casting)
    - [암호화된 캐스팅](#encrypted-casting)
    - [쿼리 타임 캐스팅](#query-time-casting)
- [커스텀 타입 캐스팅](#custom-casts)
    - [값 객체 캐스팅](#value-object-casting)
    - [배열 / JSON 직렬화](#array-json-serialization)
    - [입력용(Inbound) 캐스팅](#inbound-casting)
    - [캐스팅 파라미터](#cast-parameters)
    - [캐스터블(Castables)](#castables)

<a name="introduction"></a>
## 소개

접근자(accessor), 변경자(mutator), 그리고 속성 타입 캐스팅(casting)은 Eloquent 모델 인스턴스에서 속성 값을 조회하거나 설정할 때 해당 값을 변환할 수 있도록 해줍니다. 예를 들어, [라라벨 암호화기](/docs/8.x/encryption)를 이용해 값을 데이터베이스에 저장할 때 암호화하고, Eloquent 모델에서 해당 속성을 조회할 때 자동으로 복호화할 수 있습니다. 또는 데이터베이스에 저장된 JSON 문자열을 Eloquent 모델에서 접근할 때 자동으로 배열로 변환하고 싶을 수도 있습니다.

<a name="accessors-and-mutators"></a>
## 접근자와 변경자

<a name="defining-an-accessor"></a>
### 접근자 정의하기

접근자(accessor)는 Eloquent 속성 값을 접근할 때 값을 변환하는 기능입니다. 접근자를 정의하려면 모델에 `get{Attribute}Attribute` 형태의 메서드를 추가합니다. 여기서 `{Attribute}`는 접근하고 싶은 컬럼명을 StudlyCase(첫 글자 대문자, 캐멀케이스와 유사함)로 작성합니다.

아래 예시에서는 `first_name` 속성에 대한 접근자를 정의합니다. 이 접근자는 Eloquent에서 `first_name` 값을 가져오려고 할 때 자동으로 호출됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Get the user's first name.
     *
     * @param  string  $value
     * @return string
     */
    public function getFirstNameAttribute($value)
    {
        return ucfirst($value);
    }
}
```

보시는 것처럼, 컬럼의 원래 값이 접근자로 전달되므로 원하는 대로 가공해서 반환할 수 있습니다. 접근자 값을 사용하려면 단순히 모델 인스턴스에서 해당 속성을 가져오면 됩니다.

```
use App\Models\User;

$user = User::find(1);

$firstName = $user->first_name;
```

접근자는 단일 속성에만 한정되지 않습니다. 여러 속성을 조합하거나 새롭게 결합한 계산 결과를 반환하도록 접근자를 활용할 수 있습니다.

```
/**
 * Get the user's full name.
 *
 * @return string
 */
public function getFullNameAttribute()
{
    return "{$this->first_name} {$this->last_name}";
}
```

> [!TIP]
> 계산된 속성이 모델의 배열 또는 JSON 표현에 포함되게 하려면, [이 값을 추가로 등록해야 합니다](/docs/8.x/eloquent-serialization#appending-values-to-json).

<a name="defining-a-mutator"></a>
### 변경자 정의하기

변경자(mutator)는 Eloquent 속성의 값을 설정(할당)할 때 해당 값을 변환합니다. 변경자를 정의하려면 모델에 `set{Attribute}Attribute` 형태로 메서드를 추가합니다. `{Attribute}`에는 대문자로 시작하는 컬럼명을 사용해야 합니다.

예를 들어, `first_name` 속성에 대해 변경자를 정의하겠습니다. 이 변경자는 모델에서 `first_name` 값을 설정할 때 자동으로 호출됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Set the user's first name.
     *
     * @param  string  $value
     * @return void
     */
    public function setFirstNameAttribute($value)
    {
        $this->attributes['first_name'] = strtolower($value);
    }
}
```

변경자는 속성에 할당하려는 값을 인수로 받아 변환한 후, Eloquent 모델의 내부 `$attributes` 속성에 해당 값을 저장하면 됩니다. 변경자를 활용하려면 단순히 모델의 `first_name` 속성을 할당하면 됩니다.

```
use App\Models\User;

$user = User::find(1);

$user->first_name = 'Sally';
```

위 예시에서 `setFirstNameAttribute` 메서드는 `Sally`를 인수로 받아, `strtolower` 함수를 적용한 후 그 결과를 내부 `$attributes` 배열에 저장합니다.

<a name="attribute-casting"></a>
## 속성 타입 캐스팅

속성 타입 캐스팅은 접근자나 변경자와 유사한 기능을 제공하지만, 별도의 메서드 없이도 모델의 속성 값을 일반적으로 많이 사용하는 데이터 타입으로 간편하게 변환해줍니다.

타입 캐스팅은 모델의 `$casts` 속성(배열)에 정의합니다. 배열의 키는 캐스팅 대상 속성명, 값은 변환하려는 타입입니다. 지원되는 캐스팅 타입은 다음과 같습니다.

<div class="content-list" markdown="1">

- `array`
- `AsStringable::class`
- `boolean`
- `collection`
- `date`
- `datetime`
- `immutable_date`
- `immutable_datetime`
- `decimal:`<code>&lt;digits&gt;</code>
- `double`
- `encrypted`
- `encrypted:array`
- `encrypted:collection`
- `encrypted:object`
- `float`
- `integer`
- `object`
- `real`
- `string`
- `timestamp`

</div>

속성 타입 캐스팅의 예시로, 데이터베이스에 정수(`0` 또는 `1`)로 저장된 `is_admin` 속성을 불리언 값으로 변환해봅니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'is_admin' => 'boolean',
    ];
}
```

이렇게 캐스팅을 정의하면, 데이터베이스에 정수로 저장되어 있어도 `is_admin` 속성에 접근할 때 항상 불리언 타입으로 변환된 값을 받을 수 있습니다.

```
$user = App\Models\User::find(1);

if ($user->is_admin) {
    //
}
```

실행 중에 임시로 새로운 캐스트를 추가해야 할 경우, `mergeCasts` 메서드를 사용하여 기존 캐스팅 정의에 추가할 수 있습니다.

```
$user->mergeCasts([
    'is_admin' => 'integer',
    'options' => 'object',
]);
```

> [!NOTE]
> 값이 `null`인 속성은 캐스팅되지 않습니다. 그리고, 연관관계와 이름이 같은 속성(혹은 캐스트)은 절대 정의하지 않아야 합니다.

<a name="stringable-casting"></a>
#### Stringable 캐스팅

모델 속성을 [fluent `Illuminate\Support\Stringable` 객체](/docs/8.x/helpers#fluent-strings-method-list)로 캐스팅하려면 `Illuminate\Database\Eloquent\Casts\AsStringable` 캐스트 클래스를 사용할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\AsStringable;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'directory' => AsStringable::class,
    ];
}
```

<a name="array-and-json-casting"></a>
### 배열 & JSON 캐스팅

`array` 캐스트는 직렬화된 JSON 문자열로 저장된 컬럼을 사용할 때 매우 유용합니다. 데이터베이스의 `JSON` 또는 `TEXT` 타입 컬럼에 직렬화된 JSON이 저장되어 있다면, `array` 캐스트를 속성에 적용하여 해당 값을 Eloquent 모델에서 접근할 때 자동으로 PHP 배열로 변환할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'options' => 'array',
    ];
}
```

캐스팅을 정의하면, `options` 속성에 접근할 때마다 JSON이 자동으로 PHP 배열로 변환됩니다. 값을 할당하거나 변경하면, 전달한 배열이 자동으로 JSON 문자열로 변환되어 저장됩니다.

```
use App\Models\User;

$user = User::find(1);

$options = $user->options;

$options['key'] = 'value';

$user->options = $options;

$user->save();
```

JSON 속성의 단일 필드를 더 간단하게 업데이트하려면 `update` 메서드 호출 시 `->` 연산자를 사용할 수 있습니다.

```
$user = User::find(1);

$user->update(['options->key' => 'value']);
```

<a name="array-object-and-collection-casting"></a>
#### ArrayObject 및 Collection 캐스팅

기본 `array` 캐스트만으로 충분한 경우가 많지만, 배열의 오프셋(인덱스) 값을 직접 변경하면 PHP 오류가 생길 수 있다는 단점이 있습니다. 예를 들어, 다음 코드에서는 에러가 발생합니다.

```
$user = User::find(1);

$user->options['key'] = $value;
```

이 문제를 해결하기 위해 라라벨에서는 [ArrayObject](https://www.php.net/manual/en/class.arrayobject.php) 클래스로 JSON 속성을 변환해주는 `AsArrayObject` 캐스트를 제공합니다. 이 기능은 [커스텀 캐스팅](#custom-casts) 기능을 이용해 구현되어, 각 인덱스 값을 PHP 오류 없이 자유롭게 변경할 수 있습니다. 사용 방법은 단순히 해당 속성에 캐스트 클래스를 지정하면 됩니다.

```
use Illuminate\Database\Eloquent\Casts\AsArrayObject;

/**
 * The attributes that should be cast.
 *
 * @var array
 */
protected $casts = [
    'options' => AsArrayObject::class,
];
```

마찬가지로, 라라벨에서는 JSON 속성을 [Collection](/docs/8.x/collections) 인스턴스로 변환해주는 `AsCollection` 캐스트도 제공합니다.

```
use Illuminate\Database\Eloquent\Casts\AsCollection;

/**
 * The attributes that should be cast.
 *
 * @var array
 */
protected $casts = [
    'options' => AsCollection::class,
];
```

<a name="date-casting"></a>
### 날짜 캐스팅

기본적으로 Eloquent는 `created_at`, `updated_at` 컬럼을 [Carbon](https://github.com/briannesbitt/Carbon) 객체로 캐스팅합니다. Carbon은 PHP의 `DateTime` 클래스를 확장한 라이브러리로, 다양한 날짜 관련 유틸리티 기능을 제공합니다. 모델의 `$casts` 속성 배열에 추가적으로 다른 날짜 속성들을 등록해서 자동으로 캐스팅하도록 할 수 있습니다. 일반적으로 날짜는 `datetime` 또는 `immutable_datetime` 캐스팅 타입으로 변환하는 것이 권장됩니다.

`date` 또는 `datetime` 캐스트를 정의할 때, 날짜 형식을 지정할 수도 있습니다. 이 형식은 [모델을 배열 또는 JSON으로 변환할 때](/docs/8.x/eloquent-serialization) 적용됩니다.

```
/**
 * The attributes that should be cast.
 *
 * @var array
 */
protected $casts = [
    'created_at' => 'datetime:Y-m-d',
];
```

날짜 타입으로 캐스팅된 컬럼에는 UNIX 타임스탬프, 날짜 문자열(`Y-m-d`), 날짜-시간 문자열, 혹은 `DateTime`/`Carbon` 인스턴스를 직접 할당할 수 있습니다. 각 값은 데이터베이스에 저장되기 전에 올바르게 변환됩니다.

모델의 모든 날짜 컬럼에 대한 기본 직렬화 포맷을 바꾸고 싶다면, 모델에 `serializeDate` 메서드를 정의할 수 있습니다. 이 메서드는 데이터베이스에 실제로 저장될 포맷에는 영향을 주지 않습니다.

```
/**
 * Prepare a date for array / JSON serialization.
 *
 * @param  \DateTimeInterface  $date
 * @return string
 */
protected function serializeDate(DateTimeInterface $date)
{
    return $date->format('Y-m-d');
}
```

모델의 날짜 컬럼이 데이터베이스에 실제로 저장될 때의 형식을 명시하려면 `$dateFormat` 속성을 모델에 정의하세요.

```
/**
 * The storage format of the model's date columns.
 *
 * @var string
 */
protected $dateFormat = 'U';
```

<a name="date-casting-and-timezones"></a>
#### 날짜 캐스팅, 직렬화, 그리고 타임존

기본적으로 `date`와 `datetime` 캐스트는 애플리케이션의 `timezone` 설정값과 관계없이 UTC ISO-8601 날짜 문자열(`1986-05-28T21:05:54.000000Z`)로 직렬화됩니다. 이 포맷과 UTC 타임존 저장 방식을 항상 사용하는 것이 강력히 권장됩니다. 이렇게 하면 PHP, JavaScript 등 다양한 날짜 라이브러리와 최대한 호환성을 확보할 수 있기 때문입니다.

다만, `date` 또는 `datetime` 캐스트에 사용자 지정 포맷(`datetime:Y-m-d H:i:s` 등)을 적용하면, Carbon 인스턴스의 내부 타임존이 직렬화 시 사용됩니다(일반적으로 애플리케이션의 `timezone` 설정값을 따릅니다).

<a name="enum-casting"></a>
### Enum 캐스팅

> [!NOTE]
> Enum 캐스팅 기능은 PHP 8.1 이상에서만 사용할 수 있습니다.

Eloquent에서는 속성 값을 PHP의 enum(열거형) 타입으로 변환해줄 수 있습니다. 이를 위해 모델의 `$casts` 배열에 속성과 enum 클래스를 지정합니다.

```
use App\Enums\ServerStatus;

/**
 * The attributes that should be cast.
 *
 * @var array
 */
protected $casts = [
    'status' => ServerStatus::class,
];
```

캐스팅을 정의하면 해당 속성은 접근/설정할 때 자동으로 enum 타입으로 변환되어 다룰 수 있습니다.

```
if ($server->status == ServerStatus::provisioned) {
    $server->status = ServerStatus::ready;

    $server->save();
}
```

<a name="encrypted-casting"></a>
### 암호화된 캐스팅

`encrypted` 캐스트는 모델의 속성 값을 라라벨 내장 [암호화](/docs/8.x/encryption) 기능으로 암호화해서 데이터베이스에 저장하고, 조회 시 자동 복호화해줍니다. 또한 `encrypted:array`, `encrypted:collection`, `encrypted:object`, `AsEncryptedArrayObject`, `AsEncryptedCollection`과 같은 캐스트들은 암호화되지 않은 캐스트와 동일하게 동작하며, 단지 데이터베이스에는 암호화해서 저장만 합니다.

암호화된 텍스트의 길이는 예측할 수 없으며, 원래 데이터보다 길기 때문에 해당 컬럼의 타입은 반드시 `TEXT` 이상이어야 합니다. 또한, 암호화된 속성 값은 데이터베이스에서 직접 검색하거나 쿼리할 수 없습니다.

<a name="query-time-casting"></a>
### 쿼리 타임 캐스팅

때로는 쿼리를 실행할 때, 예를 들어 테이블에서 직접 계산한 값을 조회한 뒤 타입 캐스팅을 적용하고 싶을 수 있습니다. 아래와 같은 쿼리 예시를 봅시다.

```
use App\Models\Post;
use App\Models\User;

$users = User::select([
    'users.*',
    'last_posted_at' => Post::selectRaw('MAX(created_at)')
            ->whereColumn('user_id', 'users.id')
])->get();
```

이 쿼리의 결과로 반환되는 `last_posted_at` 속성은 단순 문자열이 됩니다. 이럴 땐, 쿼리 실행 시 `datetime` 캐스팅을 적용하면 더 편리합니다. 이를 위해 `withCasts` 메서드를 사용할 수 있습니다.

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
## 커스텀 타입 캐스팅

라라벨은 다양한 기본 제공 캐스팅 타입을 지원하지만, 때로는 직접 원하는 방식의 캐스팅 타입을 정의해야 할 수도 있습니다. 이를 위해 `CastsAttributes` 인터페이스를 구현하는 클래스를 만들면 됩니다.

이 인터페이스를 구현한 클래스는 반드시 `get`과 `set` 메서드를 정의해야 합니다. `get` 메서드는 데이터베이스에서 조회한 원시 값을 캐스팅된 값으로 변환해주고, `set` 메서드는 캐스팅된 값을 원시 값 형태로 변환해 데이터베이스에 저장할 수 있도록 반환합니다. 아래 예시는 내장 `json` 캐스팅 타입을 직접 구현한 예입니다.

```
<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class Json implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  string  $key
     * @param  mixed  $value
     * @param  array  $attributes
     * @return array
     */
    public function get($model, $key, $value, $attributes)
    {
        return json_decode($value, true);
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  string  $key
     * @param  array  $value
     * @param  array  $attributes
     * @return string
     */
    public function set($model, $key, $value, $attributes)
    {
        return json_encode($value);
    }
}
```

커스텀 캐스트 클래스를 만들었으면, 해당 속성에 클래스명을 사용하여 캐스트를 지정할 수 있습니다.

```
<?php

namespace App\Models;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * The attributes that should be cast.
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

속성 값을 항상 원시 타입으로만 변환하는 것은 아닙니다. 값을 객체로도 변환할 수 있습니다. 객체로 캐스팅하는 커스텀 캐스트 클래스를 정의하는 방식은 원시 타입과 거의 동일하지만, 이때 `set` 메서드는 "저장 가능한(원시)" 값들을 키/값 배열로 반환해야 합니다.

예를 들어, 여러 모델 값을 하나의 `Address` 값 객체로 변환하는 커스텀 캐스트 클래스를 만들어봅니다. 여기서는 `Address` 객체에 `lineOne`, `lineTwo`라는 두 개의 공개 속성이 있다고 가정합니다.

```
<?php

namespace App\Casts;

use App\Models\Address as AddressModel;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use InvalidArgumentException;

class Address implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  string  $key
     * @param  mixed  $value
     * @param  array  $attributes
     * @return \App\Models\Address
     */
    public function get($model, $key, $value, $attributes)
    {
        return new AddressModel(
            $attributes['address_line_one'],
            $attributes['address_line_two']
        );
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  string  $key
     * @param  \App\Models\Address  $value
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
}
```

값 객체로 변환할 경우, 해당 값 객체의 속성 변경 사항은 모델 저장 전에 자동으로 모델에 동기화됩니다.

```
use App\Models\User;

$user = User::find(1);

$user->address->lineOne = 'Updated Address Value';

$user->save();
```

> [!TIP]
> 값 객체가 포함된 Eloquent 모델을 JSON이나 배열로 직렬화할 계획이 있다면, 값 객체에 `Illuminate\Contracts\Support\Arrayable`과 `JsonSerializable` 인터페이스를 반드시 구현해야 합니다.

<a name="array-json-serialization"></a>
### 배열 / JSON 직렬화

Eloquent 모델을 `toArray` 혹은 `toJson` 메서드로 배열 또는 JSON으로 변환할 때, 커스텀 캐스트 값 객체도 일반적으로 직렬화됩니다(단, 객체가 `Illuminate\Contracts\Support\Arrayable` 및 `JsonSerializable`을 구현해야 함). 하지만 외부 라이브러리의 값 객체처럼 직접 인터페이스를 구현할 수 없는 경우도 있습니다.

이런 경우, 커스텀 캐스트 클래스가 값 객체의 직렬화까지 담당하게 할 수 있습니다. 이때는 커스텀 캐스트 클래스에서 `Illuminate\Contracts\Database\Eloquent\SerializesCastableAttributes` 인터페이스를 구현해야 합니다. 이 인터페이스는 커스텀 클래스에 `serialize` 메서드를 구현할 것을 요구합니다. 이 메서드는 값 객체를 직렬화 형태로 반환해야 합니다.

```
/**
 * Get the serialized representation of the value.
 *
 * @param  \Illuminate\Database\Eloquent\Model  $model
 * @param  string  $key
 * @param  mixed  $value
 * @param  array  $attributes
 * @return mixed
 */
public function serialize($model, string $key, $value, array $attributes)
{
    return (string) $value;
}
```

<a name="inbound-casting"></a>
### 입력용(Inbound) 캐스팅

간혹 모델의 속성 값을 **입력(할당)**할 때만 변환하고 조회할 때는 별도로 변환을 적용하지 않는 커스텀 캐스트가 필요할 때도 있습니다. 대표적인 예시가 "해싱" 캐스트입니다. 입력 전용 캐스팅을 구현하려면 `CastsInboundAttributes` 인터페이스를 구현하면 됩니다. 이때는 `set` 메서드만 구현하면 됩니다.

```
<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsInboundAttributes;

class Hash implements CastsInboundAttributes
{
    /**
     * The hashing algorithm.
     *
     * @var string
     */
    protected $algorithm;

    /**
     * Create a new cast class instance.
     *
     * @param  string|null  $algorithm
     * @return void
     */
    public function __construct($algorithm = null)
    {
        $this->algorithm = $algorithm;
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  string  $key
     * @param  array  $value
     * @param  array  $attributes
     * @return string
     */
    public function set($model, $key, $value, $attributes)
    {
        return is_null($this->algorithm)
                    ? bcrypt($value)
                    : hash($this->algorithm, $value);
    }
}
```

<a name="cast-parameters"></a>
### 캐스팅 파라미터

커스텀 캐스트를 모델에 연결할 때, 클래스명 뒤에 `:` 문자를 사용해 파라미터를 전달할 수 있습니다. 여러 개의 파라미터는 쉼표(,)로 구분하며, 이 값들은 캐스트 클래스의 생성자에서 받을 수 있습니다.

```
/**
 * The attributes that should be cast.
 *
 * @var array
 */
protected $casts = [
    'secret' => Hash::class.':sha256',
];
```

<a name="castables"></a>
### 캐스터블(Castables)

애플리케이션에서 사용되는 값 객체가 자체적으로 커스텀 캐스트 클래스를 정의해야 할 때가 있습니다. 이런 경우, 모델에 커스텀 캐스트 클래스를 직접 지정하지 않고, 값 객체 클래스 자체가 `Illuminate\Contracts\Database\Eloquent\Castable` 인터페이스를 구현하도록 할 수 있습니다.

```
use App\Models\Address;

protected $casts = [
    'address' => Address::class,
];
```

`Castable` 인터페이스를 구현한 객체는 반드시 `castUsing` 정적 메서드를 정의해야 하며, 이 메서드에서 값 객체와 연관된 커스텀 캐스트 클래스명을 반환해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Contracts\Database\Eloquent\Castable;
use App\Casts\Address as AddressCast;

class Address implements Castable
{
    /**
     * Get the name of the caster class to use when casting from / to this cast target.
     *
     * @param  array  $arguments
     * @return string
     */
    public static function castUsing(array $arguments)
    {
        return AddressCast::class;
    }
}
```

`Castable` 클래스 사용 시에도 `$casts` 속성에 파라미터를 넘길 수 있고, 이 파라미터들은 `castUsing` 메서드로 전달됩니다.

```
use App\Models\Address;

protected $casts = [
    'address' => Address::class.':argument',
];
```

<a name="anonymous-cast-classes"></a>
#### 캐스터블 & 익명(Anonymous) 캐스트 클래스

"캐스터블" 기능과 PHP의 [익명 클래스](https://www.php.net/manual/en/language.oop5.anonymous.php)를 조합해 값 객체와 해당 값 객체의 캐스팅 로직을 하나의 캐스터블 오브젝트로 정의할 수도 있습니다. 이를 위해 값 객체의 `castUsing` 메서드에서 익명 클래스를 반환하면 됩니다. 이 익명 클래스는 `CastsAttributes` 인터페이스를 반드시 구현해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Contracts\Database\Eloquent\Castable;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class Address implements Castable
{
    // ...

    /**
     * Get the caster class to use when casting from / to this cast target.
     *
     * @param  array  $arguments
     * @return object|string
     */
    public static function castUsing(array $arguments)
    {
        return new class implements CastsAttributes
        {
            public function get($model, $key, $value, $attributes)
            {
                return new Address(
                    $attributes['address_line_one'],
                    $attributes['address_line_two']
                );
            }

            public function set($model, $key, $value, $attributes)
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
