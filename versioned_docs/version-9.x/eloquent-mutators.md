# Eloquent: 접근자 & 타입 캐스팅 (Eloquent: Mutators & Casting)

- [소개](#introduction)
- [접근자 & 변이자](#accessors-and-mutators)
    - [접근자 정의하기](#defining-an-accessor)
    - [변이자 정의하기](#defining-a-mutator)
- [속성 캐스팅](#attribute-casting)
    - [배열 & JSON 캐스팅](#array-and-json-casting)
    - [날짜 캐스팅](#date-casting)
    - [Enum 캐스팅](#enum-casting)
    - [암호화 캐스팅](#encrypted-casting)
    - [쿼리 타임 캐스팅](#query-time-casting)
- [커스텀 캐스트](#custom-casts)
    - [값 객체 캐스팅](#value-object-casting)
    - [배열 / JSON 직렬화](#array-json-serialization)
    - [인바운드 캐스팅](#inbound-casting)
    - [캐스트 파라미터](#cast-parameters)
    - [캐스터블(Castables)](#castables)

<a name="introduction"></a>
## 소개

접근자(accessors), 변이자(mutators), 그리고 속성 캐스팅(attribute casting)을 사용하면 Eloquent 모델 인스턴스에서 속성 값을 조회하거나 설정할 때 값을 변환할 수 있습니다. 예를 들어, [라라벨 암호화 기능](/docs/9.x/encryption)을 활용해 데이터를 데이터베이스에 저장할 때는 암호화하고, Eloquent 모델에서 값을 조회할 때는 자동으로 복호화하도록 만들 수 있습니다. 또는, 데이터베이스에 JSON 문자열로 저장된 값을 Eloquent 모델을 통해 접근할 때 배열로 변환하고 싶을 수도 있습니다.

<a name="accessors-and-mutators"></a>
## 접근자 & 변이자

<a name="defining-an-accessor"></a>
### 접근자 정의하기

접근자(accessor)는 Eloquent 속성 값을 조회할 때 값을 변환합니다. 접근자를 정의하려면, 모델에서 해당 가능 속성에 대응하는 보호된(protected) 메서드를 만듭니다. 이 메서드의 이름은 실제 모델 속성이나 데이터베이스 컬럼의 "카멜 케이스(camel case)" 형태와 일치해야 합니다.

아래 예시에서는 `first_name` 속성에 대한 접근자를 정의합니다. 이 접근자는 Eloquent가 `first_name` 속성의 값을 조회할 때 자동으로 호출됩니다. 모든 속성 접근자/변이자 메서드는 반드시 `Illuminate\Database\Eloquent\Casts\Attribute` 타입힌트를 반환형으로 선언해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 사용자의 이름을 반환합니다.
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute
     */
    protected function firstName(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => ucfirst($value),
        );
    }
}
```

모든 접근자 메서드는 `Attribute` 인스턴스를 반환하며, 이 인스턴스는 해당 속성을 어떻게 접근(조회)하고(필요하다면) 변이할지 정의합니다. 위 예시에서는 속성을 어떻게 조회할지만 지정하고 있습니다. 이를 위해 `Attribute` 클래스의 생성자에 `get` 인자를 전달합니다.

위에서 볼 수 있듯 크론 컬럼의 원래 값이 접근자에게 전달되므로, 값을 자유롭게 가공(변경)해서 반환할 수 있습니다. 접근자 값을 사용하려면, 그냥 모델 인스턴스에서 `first_name` 속성에 접근하면 됩니다.

```
use App\Models\User;

$user = User::find(1);

$firstName = $user->first_name;
```

> [!NOTE]
> 이렇게 계산된(가공된) 값들을 모델의 배열/JSON 표현에 포함하고 싶다면, [명시적으로 속성을 추가해야 합니다](/docs/9.x/eloquent-serialization#appending-values-to-json).

<a name="building-value-objects-from-multiple-attributes"></a>
#### 여러 속성을 조합해서 값 객체(Value Object) 만들기

어떤 경우에는 접근자가 여러 모델 속성을 하나의 "값 객체(value object)"로 변환해야 할 수 있습니다. 이럴 때는, `get` 클로저에서 두 번째 인자인 `$attributes`를 받을 수 있으며, 이 인자에는 해당 모델의 현재 모든 속성이 배열로 전달됩니다.

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * 사용자의 주소에 접근합니다.
 *
 * @return  \Illuminate\Database\Eloquent\Casts\Attribute
 */
protected function address(): Attribute
{
    return Attribute::make(
        get: fn ($value, $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
    );
}
```

<a name="accessor-caching"></a>
#### 접근자 캐싱

접근자를 통해 값 객체(value object)가 반환될 때, 해당 객체에서 값이 변경되면 모델을 저장하기 전에 그 내용이 자동으로 모델에 반영됩니다. 이는 Eloquent가 접근자에서 반환된 인스턴스를 내부적으로 보관하여, 접근자를 호출할 때마다 같은 인스턴스를 반환하기 때문에 가능합니다.

```
use App\Models\User;

$user = User::find(1);

$user->address->lineOne = 'Updated Address Line 1 Value';
$user->address->lineTwo = 'Updated Address Line 2 Value';

$user->save();
```

하지만, 문자열이나 불리언과 같은 원시 값(primitive value)도, 연산 비용이 많이 든다면 캐싱하고 싶을 수 있습니다. 이럴 때는 접근자 정의 시 `shouldCache` 메서드를 호출하면 됩니다.

```php
protected function hash(): Attribute
{
    return Attribute::make(
        get: fn ($value) => bcrypt(gzuncompress($value)),
    )->shouldCache();
}
```

반대로 객체 캐싱을 비활성화하고 싶다면, 속성 정의 시 `withoutObjectCaching` 메서드를 호출하면 됩니다.

```php
/**
 * 사용자의 주소에 접근합니다.
 *
 * @return  \Illuminate\Database\Eloquent\Casts\Attribute
 */
protected function address(): Attribute
{
    return Attribute::make(
        get: fn ($value, $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
    )->withoutObjectCaching();
}
```

<a name="defining-a-mutator"></a>
### 변이자 정의하기

변이자(mutator)는 Eloquent 속성 값이 설정될 때 값을 변환(가공)합니다. 변이자를 정의하려면, 속성 정의 시 `set` 인자를 전달하면 됩니다. 아래는 `first_name` 속성에 변이자를 정의하는 예시입니다. 이 변이자는 `first_name` 속성 값을 설정할 때 자동으로 호출됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 사용자의 이름을 제어합니다.
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute
     */
    protected function firstName(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => ucfirst($value),
            set: fn ($value) => strtolower($value),
        );
    }
}
```

변이자 클로저는 속성에 설정하려는 값을 받아서, 원하는 대로 가공하고 그 결과 값을 반환할 수 있습니다. 변이자를 사용하려면, Eloquent 모델에서 해당 속성에 값을 할당하기만 하면 됩니다.

```
use App\Models\User;

$user = User::find(1);

$user->first_name = 'Sally';
```

이 예시에서 `set` 콜백은 값 `Sally`와 함께 호출됩니다. 변이자는 이 값을 `strtolower` 함수로 변환해서, 내부 `$attributes` 배열에 결과 값을 저장합니다.

<a name="mutating-multiple-attributes"></a>
#### 여러 속성을 동시에 변이하기

어떤 경우에는 변이자에서 내부적으로 여러 속성을 동시에 설정해야 할 수도 있습니다. 이럴 때는, `set` 클로저에서 배열을 반환하면 됩니다. 배열의 각 키는 모델에서 대응되는 속성/데이터베이스 컬럼과 일치해야 합니다.

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * 사용자의 주소를 제어합니다.
 *
 * @return  \Illuminate\Database\Eloquent\Casts\Attribute
 */
protected function address(): Attribute
{
    return Attribute::make(
        get: fn ($value, $attributes) => new Address(
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

속성 캐스팅(attribute casting)은 접근자나 변이자를 별도로 정의하지 않고도 유사한 기능을 제공합니다. 모델의 `$casts` 속성을 사용하면 속성을 일반적으로 많이 사용하는 데이터 타입으로 자동 변환할 수 있습니다.

`$casts` 속성은, 속성명을 키로 하고 캐스팅할 타입을 값으로 갖는 배열이어야 합니다. 지원되는 캐스트 타입은 다음과 같습니다.

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
- `integer`
- `object`
- `real`
- `string`
- `timestamp`

</div>

예를 들어, 데이터베이스에 정수(`0` 또는 `1`)로 저장된 `is_admin` 속성을 불리언 값으로 캐스팅해보겠습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 캐스팅할 속성 목록
     *
     * @var array
     */
    protected $casts = [
        'is_admin' => 'boolean',
    ];
}
```

이렇게 캐스트를 정의하면, 데이터베이스에 값이 정수로 저장되어 있더라도 `is_admin` 속성은 항상 불리언으로 변환되어 접근할 수 있습니다.

```
$user = App\Models\User::find(1);

if ($user->is_admin) {
    //
}
```

런타임에 임시로 새로운 캐스트를 추가하고 싶을 때는 `mergeCasts` 메서드를 사용할 수 있습니다. 이렇게 추가된 캐스트는 기존 캐스트에 덧붙여집니다.

```
$user->mergeCasts([
    'is_admin' => 'integer',
    'options' => 'object',
]);
```

> [!WARNING]
> 값이 `null`인 속성은 캐스팅되지 않습니다. 또한, 관계명과 동일한 이름의 속성 또는 캐스트는 절대 정의하지 않아야 합니다.

<a name="stringable-casting"></a>
#### Stringable 캐스팅

`Illuminate\Database\Eloquent\Casts\AsStringable` 캐스트 클래스를 사용하면 모델 속성을 [유연한 `Illuminate\Support\Stringable` 객체](/docs/9.x/helpers#fluent-strings-method-list)로 변환할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\AsStringable;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 캐스팅할 속성 목록
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

`array` 캐스트는 직렬화된 JSON으로 저장된 컬럼을 다룰 때 매우 유용합니다. 예를 들어, 데이터베이스에 `JSON` 또는 `TEXT` 타입 컬럼이 있고 직렬화된 JSON 데이터가 들어있다면, 해당 속성에 `array` 캐스트를 추가하면 Eloquent 모델에서 접근할 때 자동으로 PHP 배열로 역직렬화해줍니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 캐스팅할 속성 목록
     *
     * @var array
     */
    protected $casts = [
        'options' => 'array',
    ];
}
```

이렇게 캐스트를 정의하면, `options` 속성에 접근할 때 JSON에서 PHP 배열로 자동 변환됩니다. 또한, 속성 값을 배열로 변경해서 저장하면 자동으로 JSON으로 직렬화되어 데이터베이스에 저장됩니다.

```
use App\Models\User;

$user = User::find(1);

$options = $user->options;

$options['key'] = 'value';

$user->options = $options;

$user->save();
```

JSON 속성의 개별 필드만 간결하게 업데이트하고 싶을 때는, `update` 메서드 사용 시 `->` 연산자를 활용할 수 있습니다.

```
$user = User::find(1);

$user->update(['options->key' => 'value']);
```

<a name="array-object-and-collection-casting"></a>
#### Array Object & Collection 캐스팅

일반적인 `array` 캐스트로도 충분한 경우가 많지만, 이 방식에는 몇 가지 단점이 있습니다. 배열 캐스트는 단순한 원시 타입을 반환하므로, 다음처럼 배열의 일부 요소만 직접 수정하면 PHP 에러가 발생할 수 있습니다.

```
$user = User::find(1);

$user->options['key'] = $value;
```

이 문제를 해결하기 위해, 라라벨은 `AsArrayObject` 캐스트를 제공합니다. 이 캐스트는 JSON 속성을 [ArrayObject](https://www.php.net/manual/en/class.arrayobject.php) 클래스의 인스턴스로 변환합니다. 이 기능은 라라벨의 [커스텀 캐스트](#custom-casts) 구현을 활용하며, 개별 요소 수정 시 캐싱이나 변환이 자동으로 처리되어 PHP 에러가 발생하지 않습니다. 사용법은 다음과 같습니다.

```
use Illuminate\Database\Eloquent\Casts\AsArrayObject;

/**
 * 캐스팅할 속성 목록
 *
 * @var array
 */
protected $casts = [
    'options' => AsArrayObject::class,
];
```

비슷하게, 라라벨은 `AsCollection` 캐스트도 제공합니다. 이 캐스트는 JSON 속성을 라라벨 [컬렉션](/docs/9.x/collections) 인스턴스로 변환합니다.

```
use Illuminate\Database\Eloquent\Casts\AsCollection;

/**
 * 캐스팅할 속성 목록
 *
 * @var array
 */
protected $casts = [
    'options' => AsCollection::class,
];
```

<a name="date-casting"></a>
### 날짜 캐스팅

기본적으로 Eloquent는 `created_at`과 `updated_at` 컬럼을 [Carbon](https://github.com/briannesbitt/Carbon) 인스턴스로 캐스팅합니다. Carbon은 PHP `DateTime` 클래스를 확장하며, 다양한 유용한 메서드들을 제공합니다. 추가적인 날짜 속성이 있다면, 모델의 `$casts` 배열에 추가로 날짜 캐스트를 정의할 수 있습니다. 보통 `datetime` 또는 `immutable_datetime` 캐스트 타입을 사용합니다.

`date` 또는 `datetime` 캐스트를 정의할 때, 날짜 포맷도 같이 지정할 수 있습니다. 지정한 포맷은 [모델을 배열이나 JSON으로 직렬화할 때](/docs/9.x/eloquent-serialization) 사용됩니다.

```
/**
 * 캐스팅할 속성 목록
 *
 * @var array
 */
protected $casts = [
    'created_at' => 'datetime:Y-m-d',
];
```

날짜로 캐스트된 컬럼에는 유닉스 타임스탬프, 날짜 문자열(`Y-m-d`), 날짜-시간 문자열, 또는 `DateTime`/`Carbon` 인스턴스를 모두 저장할 수 있습니다. 값은 적절하게 변환되어 데이터베이스에 저장됩니다.

모델의 모든 날짜 속성에 대해 기본 직렬화 포맷을 커스터마이징하고 싶다면, 모델에 `serializeDate` 메서드를 정의하면 됩니다. 이 메서드는 데이터베이스 저장 포맷에는 영향을 주지 않습니다.

```
/**
 * 배열/JSON 직렬화를 위한 날짜 포맷 반환
 *
 * @param  \DateTimeInterface  $date
 * @return string
 */
protected function serializeDate(DateTimeInterface $date)
{
    return $date->format('Y-m-d');
}
```

모델의 날짜 속성을 실제로 데이터베이스에 저장할 때 사용할 포맷을 지정하려면, 모델에 `$dateFormat` 속성을 정의해야 합니다.

```
/**
 * 모델 날짜 컬럼의 저장 포맷
 *
 * @var string
 */
protected $dateFormat = 'U';
```

<a name="date-casting-and-timezones"></a>
#### 날짜 캐스팅, 직렬화 및 타임존

기본적으로 `date`와 `datetime` 캐스트는 애플리케이션의 `timezone` 설정과 무관하게, 날짜를 UTC ISO-8601 문자열(`1986-05-28T21:05:54.000000Z`)로 직렬화합니다. 다른 PHP/JavaScript 라이브러리와의 호환성을 극대화하려면 이 형식과 UTC 타임존을 항상 사용하는 것이 권장됩니다. 즉, 애플리케이션의 `timezone` 설정을 기본값인 `UTC`로 유지하는 것이 바람직합니다.

만약 `datetime:Y-m-d H:i:s`와 같이 커스텀 포맷을 사용하면, 직렬화 시 Carbon 인스턴스의 내부 타임존이 적용됩니다. 이는 일반적으로 애플리케이션의 `timezone` 설정을 따릅니다.

<a name="enum-casting"></a>
### Enum 캐스팅

> [!WARNING]
> Enum 캐스팅은 PHP 8.1 이상에서만 사용할 수 있습니다.

Eloquent는 속성 값을 PHP [Enum](https://www.php.net/manual/en/language.enumerations.backed.php) 타입으로도 캐스팅할 수 있습니다. 속성 키와 Enum 클래스를 모델의 `$casts` 배열에 지정하면 됩니다.

```
use App\Enums\ServerStatus;

/**
 * 캐스팅할 속성 목록
 *
 * @var array
 */
protected $casts = [
    'status' => ServerStatus::class,
];
```

이렇게 캐스트를 정의하면, 해당 속성을 조회하거나 설정할 때 자동으로 Enum 타입으로 변환됩니다.

```
if ($server->status == ServerStatus::Provisioned) {
    $server->status = ServerStatus::Ready;

    $server->save();
}
```

<a name="casting-arrays-of-enums"></a>
#### Enum 배열 캐스팅

모델이 하나의 컬럼에 Enum 값들을 배열로 저장해야 하는 경우도 있습니다. 이때는 라라벨에서 제공하는 `AsEnumArrayObject` 또는 `AsEnumCollection` 캐스트를 사용할 수 있습니다.

```
use App\Enums\ServerStatus;
use Illuminate\Database\Eloquent\Casts\AsEnumCollection;

/**
 * 캐스팅할 속성 목록
 *
 * @var array
 */
protected $casts = [
    'statuses' => AsEnumCollection::class.':'.ServerStatus::class,
];
```

<a name="encrypted-casting"></a>
### 암호화 캐스팅

`encrypted` 캐스트를 사용하면 모델의 속성 값을 라라벨의 내장 [암호화 기능](/docs/9.x/encryption)으로 암호화할 수 있습니다. 마찬가지로, `encrypted:array`, `encrypted:collection`, `encrypted:object`, `AsEncryptedArrayObject`, `AsEncryptedCollection` 등은 암호화되지 않은 캐스트와 거의 동일하게 동작하지만, 값이 데이터베이스에 저장될 때 암호화된다는 점이 다릅니다.

암호화된 텍스트는 원본보다 길고, 예측할 수 없는 길이를 갖습니다. 따라서 해당 컬럼은 반드시 `TEXT` 타입 이상으로 만들어야 합니다. 또한, 암호화된 컬럼은 데이터베이스에서 직접 조회하거나 검색할 수 없습니다.

<a name="key-rotation"></a>
#### 암호화 키 교체(선회)하기

라라벨은 애플리케이션의 `app` 설정 파일의 `key` 설정값, 즉 보통 `APP_KEY` 환경 변수로 지정된 값을 이용해서 문자열을 암호화합니다. 만약 암호화 키를 변경해야 한다면, 새 키로 암호화된 속성 값을 직접 다시 암호화해 주어야 합니다.

<a name="query-time-casting"></a>
### 쿼리 타임 캐스팅

때로는 특정 쿼리 실행 시 임시로 캐스팅을 적용해야 할 수 있습니다. 예를 들어, 테이블에서 원시 값을 select할 때 다음과 같은 쿼리를 작성할 수 있습니다.

```
use App\Models\Post;
use App\Models\User;

$users = User::select([
    'users.*',
    'last_posted_at' => Post::selectRaw('MAX(created_at)')
            ->whereColumn('user_id', 'users.id')
])->get();
```

이 쿼리의 결과로 얻은 `last_posted_at` 속성의 값은 단순한 문자열입니다. 이 속성에 쿼리 실행 시점에 `datetime` 캐스트를 적용하고 싶다면, `withCasts` 메서드를 사용하면 됩니다.

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

라라벨은 다양한 내장 캐스트 타입을 제공하지만, 필요에 따라 직접 캐스트 타입을 정의할 수 있습니다. 캐스트 클래스를 만들려면 `make:cast` 아티즌 명령어를 실행하세요. 새 캐스트 클래스는 `app/Casts` 디렉터리에 생성됩니다.

```shell
php artisan make:cast Json
```

모든 커스텀 캐스트 클래스는 `CastsAttributes` 인터페이스를 구현해야 합니다. 이 인터페이스를 구현하는 클래스는 반드시 `get`과 `set` 메서드를 정의해야 합니다. `get` 메서드는 데이터베이스에서 조회한 값을 변환하고, `set` 메서드는 변환된 값을 데이터베이스에 저장 가능한 원시 값으로 가공하는 역할을 합니다. 다음은 내장 `json` 캐스트 타입을 직접 다시 구현하는 예시입니다.

```
<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class Json implements CastsAttributes
{
    /**
     * 값을 캐스팅합니다.
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
     * 저장을 위해 값을 준비합니다.
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

커스텀 캐스트 타입을 정의한 뒤, 해당 클래스명을 사용해 모델 속성에 캐스트를 지정할 수 있습니다.

```
<?php

namespace App\Models;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 캐스팅할 속성 목록
     *
     * @var array
     */
    protected $casts = [
        'options' => Json::class,
    ];
}
```

<a name="value-object-casting"></a>
### 값 객체 캐스팅(Value Object Casting)

값을 단순한 원시 타입으로만 캐스팅할 수 있는 것은 아닙니다. 객체로도 캐스팅할 수 있습니다. 값을 객체로 캐스팅하는 커스텀 캐스트를 정의하는 방법은 원시 타입과 매우 비슷하지만, `set` 메서드는 원시 값의 배열을 반환해야 하며, 이들 값이 모델에 원시 값으로 저장됩니다.

예를 들어, 여러 모델 값을 하나의 `Address` 값 객체로 변환하는 커스텀 캐스트 클래스를 작성하겠습니다. 여기에서 `Address` 값은 `lineOne`과 `lineTwo`라는 두 개의 공개 속성을 가진다고 가정합니다.

```
<?php

namespace App\Casts;

use App\ValueObjects\Address as AddressValueObject;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use InvalidArgumentException;

class Address implements CastsAttributes
{
    /**
     * 값을 캐스팅합니다.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  string  $key
     * @param  mixed  $value
     * @param  array  $attributes
     * @return \App\ValueObjects\Address
     */
    public function get($model, $key, $value, $attributes)
    {
        return new AddressValueObject(
            $attributes['address_line_one'],
            $attributes['address_line_two']
        );
    }

    /**
     * 저장을 위해 값을 준비합니다.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  string  $key
     * @param  \App\ValueObjects\Address  $value
     * @param  array  $attributes
     * @return array
     */
    public function set($model, $key, $value, $attributes)
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

값 객체로 캐스팅하면, 해당 객체의 값 변화가 생길 경우 모델을 저장할 때 자동으로 모델에 적용됩니다.

```
use App\Models\User;

$user = User::find(1);

$user->address->lineOne = 'Updated Address Value';

$user->save();
```

> [!NOTE]
> 값 객체를 포함하는 Eloquent 모델을 JSON이나 배열로 직렬화할 계획이 있다면, 해당 값 객체에 `Illuminate\Contracts\Support\Arrayable` 및 `JsonSerializable` 인터페이스를 구현해야 합니다.

<a name="array-json-serialization"></a>
### 배열 / JSON 직렬화

Eloquent 모델을 `toArray` 또는 `toJson` 메서드로 배열이나 JSON으로 변환할 때, 커스텀 캐스트 값 객체도 보통 직렬화됩니다. 단, 값 객체가 `Illuminate\Contracts\Support\Arrayable` 및 `JsonSerializable` 인터페이스를 구현해야 합니다. 그렇지만, 서드파티 라이브러리에서 제공하는 값을 사용할 경우 이 인터페이스를 직접 구현할 수 없는 경우도 있습니다.

이런 경우, 커스텀 캐스트 클래스에서 값 객체의 직렬화를 직접 처리하도록 할 수 있습니다. 이를 위해서, 커스텀 캐스트 클래스에 `Illuminate\Contracts\Database\Eloquent\SerializesCastableAttributes` 인터페이스를 구현하면 됩니다. 이 인터페이스에서는 `serialize` 메서드를 구현해야 하며, 이 메서드가 직렬화된 형태를 반환하게 됩니다.

```
/**
 * 값의 직렬화 표현을 반환합니다.
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
### 인바운드 캐스팅(Inbound Casting)

때로는 모델에 값을 설정할 때만 값을 변환하는 커스텀 캐스트가 필요할 수 있습니다. 조회할 때는 아무런 변환을 하지 않는 경우입니다.

이런 인바운드 전용 커스텀 캐스트는 `CastsInboundAttributes` 인터페이스만 구현하면 되고, 이 경우 `set` 메서드만 정의하면 됩니다. `make:cast` 아티즌 명령어에 `--inbound` 옵션을 주면 인바운드 전용 캐스트 클래스를 생성할 수 있습니다.

```shell
php artisan make:cast Hash --inbound
```

대표적인 예가 "해싱(hashing)" 캐스트입니다. 아래는 지정된 알고리즘으로 들어오는 값을 해싱하는 캐스트 예시입니다.

```
<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsInboundAttributes;

class Hash implements CastsInboundAttributes
{
    /**
     * 해싱 알고리즘
     *
     * @var string
     */
    protected $algorithm;

    /**
     * 새 캐스트 클래스 인스턴스 생성
     *
     * @param  string|null  $algorithm
     * @return void
     */
    public function __construct($algorithm = null)
    {
        $this->algorithm = $algorithm;
    }

    /**
     * 값을 저장하기 위한 변환
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
### 캐스트 파라미터

모델에 커스텀 캐스트를 지정할 때, 클래스명 뒤에 `:`로 구분해 파라미터를 넘길 수 있으며, 다수의 파라미터는 콤마로 구분합니다. 이 파라미터는 캐스트 클래스의 생성자로 전달됩니다.

```
/**
 * 캐스팅할 속성 목록
 *
 * @var array
 */
protected $casts = [
    'secret' => Hash::class.':sha256',
];
```

<a name="castables"></a>
### 캐스터블(Castables)

애플리케이션의 값 객체가 자체적으로 커스텀 캐스트 클래스를 정의하게 하고 싶을 수도 있습니다. 이 경우, 모델에서 커스텀 캐스트 클래스 대신, `Illuminate\Contracts\Database\Eloquent\Castable` 인터페이스를 구현한 값 객체 클래스를 지정할 수 있습니다.

```
use App\Models\Address;

protected $casts = [
    'address' => Address::class,
];
```

`Castable` 인터페이스를 구현한 객체는 반드시 `castUsing` 정적 메서드를 구현해야 하며, 이 메서드에서 해당 객체를 캐스팅할 등장 클래스명을 반환해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Contracts\Database\Eloquent\Castable;
use App\Casts\Address as AddressCast;

class Address implements Castable
{
    /**
     * 이 캐스트 대상과 변환할 때 사용할 캐스터 클래스명 반환
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

`Castable` 클래스를 사용할 때도 `$casts` 정의에서 인자를 넘길 수 있습니다. 이 인자들은 `castUsing` 메서드로 전달됩니다.

```
use App\Models\Address;

protected $casts = [
    'address' => Address::class.':argument',
];
```

<a name="anonymous-cast-classes"></a>
#### 캐스터블 & 익명(Anonymous) 캐스트 클래스

"캐스터블(Castables)"을 PHP의 [익명 클래스](https://www.php.net/manual/en/language.oop5.anonymous.php)와 결합하면, 값 객체와 그 값의 캐스팅 로직을 한 번에 정의할 수 있습니다. 이렇게 하려면 값 객체의 `castUsing` 메서드에서 익명 클래스를 반환하세요. 이 익명 클래스는 `CastsAttributes` 인터페이스를 구현해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Contracts\Database\Eloquent\Castable;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class Address implements Castable
{
    // ...

    /**
     * 이 캐스트 대상과 변환할 때 사용할 캐스터 클래스 반환
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