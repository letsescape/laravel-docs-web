# Eloquent: 직렬화 (Eloquent: Serialization)

- [소개](#introduction)
- [모델 및 컬렉션 직렬화](#serializing-models-and-collections)
    - [배열로 직렬화하기](#serializing-to-arrays)
    - [JSON으로 직렬화하기](#serializing-to-json)
- [JSON에서 속성 숨기기](#hiding-attributes-from-json)
- [JSON에 값 추가하기](#appending-values-to-json)
- [날짜 직렬화](#date-serialization)

<a name="introduction"></a>
## 소개

라라벨로 API를 만들다 보면 모델과 연관관계 데이터를 배열이나 JSON으로 변환해야 할 일이 많습니다. Eloquent는 이러한 변환을 도와주는 편리한 메서드를 제공하며, 모델의 직렬화 결과에 포함되는 속성을 제어할 수 있는 다양한 기능도 지원합니다.

> [!NOTE]
> Eloquent 모델 및 컬렉션의 JSON 직렬화를 보다 유연하게 제어하고 싶다면 [Eloquent API 리소스](/docs/12.x/eloquent-resources) 문서도 참고하시기 바랍니다.

<a name="serializing-models-and-collections"></a>
## 모델 및 컬렉션 직렬화

<a name="serializing-to-arrays"></a>
### 배열로 직렬화하기

모델과 로드된 [연관관계](/docs/12.x/eloquent-relationships)를 배열로 변환하려면 `toArray` 메서드를 사용하면 됩니다. 이 메서드는 재귀적으로 동작하므로, 모든 속성과 연관관계(그리고 그 안의 연관관계까지)까지 모두 배열로 변환됩니다.

```php
use App\Models\User;

$user = User::with('roles')->first();

return $user->toArray();
```

`attributesToArray` 메서드를 사용하면, 모델의 속성만 배열로 변환할 수 있으며 연관관계 데이터는 포함되지 않습니다.

```php
$user = User::first();

return $user->attributesToArray();
```

또한, 모델 [컬렉션](/docs/12.x/eloquent-collections) 전체도 컬렉션 인스턴스에서 `toArray` 메서드를 호출하여 배열로 변환할 수 있습니다.

```php
$users = User::all();

return $users->toArray();
```

<a name="serializing-to-json"></a>
### JSON으로 직렬화하기

모델을 JSON으로 변환하려면 `toJson` 메서드를 사용합니다. `toArray` 메서드와 마찬가지로, `toJson` 메서드는 모든 속성과 연관관계를 재귀적으로 JSON으로 변환합니다. 또한, PHP에서 [지원하는 JSON 인코딩 옵션](https://secure.php.net/manual/en/function.json-encode.php)을 추가로 지정할 수도 있습니다.

```php
use App\Models\User;

$user = User::find(1);

return $user->toJson();

return $user->toJson(JSON_PRETTY_PRINT);
```

또 다른 방법으로, 모델이나 컬렉션을 문자열로 캐스팅하면 자동으로 `toJson` 메서드가 호출되어 JSON 문자열로 반환됩니다.

```php
return (string) User::find(1);
```

모델이나 컬렉션 객체는 문자열로 변환될 때 자동으로 JSON으로 직렬화되므로, 애플리케이션의 라우트나 컨트롤러에서 Eloquent 객체를 그대로 반환해도 됩니다. 라라벨은 이런 경우 Eloquent 모델과 컬렉션을 자동으로 JSON으로 변환하여 반환합니다.

```php
Route::get('/users', function () {
    return User::all();
});
```

<a name="relationships"></a>
#### 연관관계

Eloquent 모델이 JSON으로 직렬화되면, 로드된 연관관계도 자동으로 JSON 객체의 속성으로 포함됩니다. 또한, Eloquent에서 연관관계 메서드는 "camel case(카멜 케이스)"로 정의하지만, JSON에서는 연관관계의 속성명이 "snake case(스네이크 케이스)"로 변환됩니다.

<a name="hiding-attributes-from-json"></a>
## JSON에서 속성 숨기기

모델을 배열이나 JSON으로 변환할 때, 비밀번호와 같이 특정 속성은 포함하지 않고 싶을 때가 있습니다. 이럴 때는 모델에 `$hidden` 속성을 추가하면 됩니다. `$hidden` 배열에 등록된 속성들은 직렬화 결과(배열, JSON)에 포함되지 않습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 직렬화 시 숨길 속성들
     *
     * @var array<string>
     */
    protected $hidden = ['password'];
}
```

> [!NOTE]
> 연관관계를 숨기려면, 연관관계 메서드명을 모델의 `$hidden` 속성에 추가하면 됩니다.

또는, 반대로 `$visible` 속성을 사용하여 직렬화 시 포함하고 싶은 속성만 "허용 리스트(allow list)"로 지정할 수도 있습니다. `$visible` 배열에 없는 속성은 배열이나 JSON 변환 시 숨겨집니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 배열로 변환 시 노출될 속성들
     *
     * @var array
     */
    protected $visible = ['first_name', 'last_name'];
}
```

<a name="temporarily-modifying-attribute-visibility"></a>
#### 일시적으로 속성 노출/숨김 상태 변경하기

일반적으로 숨겨져 있는 속성을 일시적으로 특정 모델 인스턴스에서만 노출하고 싶을 때는 `makeVisible` 메서드를 사용할 수 있습니다. 이 메서드는 모델 인스턴스를 반환합니다.

```php
return $user->makeVisible('attribute')->toArray();
```

마찬가지로, 평소에는 노출되는 속성을 일시적으로 숨기고 싶을 때는 `makeHidden` 메서드를 사용하면 됩니다.

```php
return $user->makeHidden('attribute')->toArray();
```

또한, `setVisible`이나 `setHidden` 메서드로 표시/숨김 속성 전체를 임시로 지정할 수도 있습니다.

```php
return $user->setVisible(['id', 'name'])->toArray();

return $user->setHidden(['email', 'password', 'remember_token'])->toArray();
```

<a name="appending-values-to-json"></a>
## JSON에 값 추가하기

때로는 모델을 배열 또는 JSON으로 변환할 때, 실제 데이터베이스 컬럼에는 없지만 추가적인 속성도 함께 포함하고 싶을 수 있습니다. 이럴 때는 먼저 해당 값을 위한 [접근자(accessor)](/docs/12.x/eloquent-mutators)를 정의해야 합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 사용자가 관리자(admin)인지 여부 반환
     */
    protected function isAdmin(): Attribute
    {
        return new Attribute(
            get: fn () => 'yes',
        );
    }
}
```

이 접근자를 모델의 배열 및 JSON 변환 결과에 항상 추가하고 싶다면, 모델의 `$appends` 속성에 속성명을 추가하면 됩니다. 참고로, 속성명은 PHP에서는 "camel case"로 정의하지만, 시리얼라이즈 시에는 일반적으로 "snake case"로 작성합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 모델 배열 형태에 추가할 접근자들
     *
     * @var array
     */
    protected $appends = ['is_admin'];
}
```

이렇게 속성을 `$appends` 리스트에 추가하면 모델의 배열, JSON 변환 모두에서 해당 속성이 함께 추가됩니다. `$appends` 배열에 등록한 속성도 모델에 설정된 `visible` 및 `hidden` 설정을 그대로 따릅니다.

<a name="appending-at-run-time"></a>
#### 실행 중에 동적으로 값 추가하기

실행 중에 모델 인스턴스에 추가 속성을 동적으로 붙이고 싶을 때는 `append` 메서드를 사용할 수 있습니다. 또는 `setAppends` 메서드를 통해 추가될 속성 전체 배열을 지정할 수도 있습니다.

```php
return $user->append('is_admin')->toArray();

return $user->setAppends(['is_admin'])->toArray();
```

<a name="date-serialization"></a>
## 날짜 직렬화

<a name="customizing-the-default-date-format"></a>
#### 기본 날짜 직렬화 형식 커스터마이즈

기본 날짜 직렬화 형식을 바꾸고 싶다면, `serializeDate` 메서드를 오버라이드하면 됩니다. 이 메서드는 데이터베이스에 저장되는 날짜 형식에는 영향을 주지 않습니다.

```php
/**
 * 배열/JSON 직렬화 시 날짜 변환 처리
 */
protected function serializeDate(DateTimeInterface $date): string
{
    return $date->format('Y-m-d');
}
```

<a name="customizing-the-date-format-per-attribute"></a>
#### 속성마다 다른 날짜 형식 사용하기

Eloquent의 날짜 속성마다 개별적으로 직렬화 형식을 다르게 지정하고 싶을 때는, 모델의 [cast 설정](/docs/12.x/eloquent-mutators#attribute-casting)에서 날짜 포맷을 명시하면 됩니다.

```php
protected function casts(): array
{
    return [
        'birthday' => 'date:Y-m-d',
        'joined_at' => 'datetime:Y-m-d H:00',
    ];
}
```
