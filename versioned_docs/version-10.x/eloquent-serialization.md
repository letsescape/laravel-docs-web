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

라라벨로 API를 만들다 보면, 모델과 그 연관관계 데이터를 배열이나 JSON 형태로 변환해야 하는 경우가 많습니다. Eloquent는 이런 변환을 쉽게 처리할 수 있는 편리한 메서드들과, 직렬화 결과에 포함될 속성을 제어하는 기능을 제공합니다.

> [!NOTE]
> Eloquent 모델과 컬렉션의 JSON 직렬화를 더욱 강력하게 제어하고 싶다면 [Eloquent API 리소스](/docs/10.x/eloquent-resources) 문서를 참고하시기 바랍니다.

<a name="serializing-models-and-collections"></a>
## 모델 및 컬렉션 직렬화

<a name="serializing-to-arrays"></a>
### 배열로 직렬화하기

모델과 로드된 [연관관계](/docs/10.x/eloquent-relationships)를 배열로 변환하려면 `toArray` 메서드를 사용하면 됩니다. 이 메서드는 재귀적으로 동작하므로, 모든 속성과 모든 연관관계(그리고 연관관계의 연관관계까지 포함)가 배열로 변환됩니다.

```
use App\Models\User;

$user = User::with('roles')->first();

return $user->toArray();
```

`attributesToArray` 메서드는 모델의 속성만 배열로 변환하고, 연관관계는 포함하지 않습니다.

```
$user = User::first();

return $user->attributesToArray();
```

또한 [컬렉션](/docs/10.x/eloquent-collections) 전체를 배열로 변환하려면 컬렉션 인스턴스에서 `toArray` 메서드를 호출하면 됩니다.

```
$users = User::all();

return $users->toArray();
```

<a name="serializing-to-json"></a>
### JSON으로 직렬화하기

모델을 JSON으로 변환하려면 `toJson` 메서드를 사용하면 됩니다. `toArray`와 마찬가지로, `toJson`도 모든 속성과 연관관계를 재귀적으로 JSON 문자열로 변환합니다. 또한, [PHP가 지원하는](https://secure.php.net/manual/en/function.json-encode.php) JSON 인코딩 옵션도 지정할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

return $user->toJson();

return $user->toJson(JSON_PRETTY_PRINT);
```

또는 모델이나 컬렉션을 문자열로 캐스팅할 수도 있는데, 이 경우 `toJson` 메서드가 자동으로 호출되어 JSON 문자열을 반환합니다.

```
return (string) User::find(1);
```

모델과 컬렉션은 문자열로 변환될 때 JSON으로 자동 직렬화되기 때문에, 애플리케이션의 라우트나 컨트롤러에서 Eloquent 객체를 직접 반환할 수 있습니다. 라라벨은 라우트나 컨트롤러에서 Eloquent 모델이나 컬렉션이 반환되면 이를 자동으로 JSON으로 직렬화합니다.

```
Route::get('users', function () {
    return User::all();
});
```

<a name="relationships"></a>
#### 연관관계 처리

Eloquent 모델이 JSON으로 변환될 때, 로드된 연관관계도 JSON 객체의 속성으로 포함됩니다. 참고로, Eloquent 연관관계 메서드는 "카멜케이스"로 정의하지만, JSON에서는 속성명이 "스네이크케이스"로 변환되어 나타납니다.

<a name="hiding-attributes-from-json"></a>
## JSON에서 속성 숨기기

때로는 비밀번호 등 특정 속성을 모델의 배열이나 JSON 표현에서 제외하고 싶을 수 있습니다. 이럴 때는 모델에 `$hidden` 속성을 추가하여, 해당 배열에 나열된 속성들은 직렬화 시 결과에 포함되지 않게 할 수 있습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 배열에서 숨길 속성들.
     *
     * @var array
     */
    protected $hidden = ['password'];
}
```

> [!NOTE]
> 연관관계를 숨기고 싶을 때는, 해당 연관관계의 메서드명을 Eloquent 모델의 `$hidden` 속성에 추가하면 됩니다.

반대로, `visible` 속성을 사용해서 모델의 배열 및 JSON 표현에 포함될 "허용 목록"을 정의할 수도 있습니다. `$visible` 배열에 없는 모든 속성들은 배열이나 JSON으로 변환 시 숨겨집니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 배열에서 보이게 할 속성들.
     *
     * @var array
     */
    protected $visible = ['first_name', 'last_name'];
}
```

<a name="temporarily-modifying-attribute-visibility"></a>
#### 일시적으로 속성 표시/숨김 변경하기

평소에는 숨겨져 있는 속성을 특정 모델 인스턴스에서만 잠깐 보이게 하고 싶다면, `makeVisible` 메서드를 사용할 수 있습니다. 이 메서드는 모델 인스턴스를 반환합니다.

```
return $user->makeVisible('attribute')->toArray();
```

반대로, 평소에는 보이던 속성을 일시적으로 숨기고 싶을 때는 `makeHidden` 메서드를 사용할 수 있습니다.

```
return $user->makeHidden('attribute')->toArray();
```

`setVisible` 또는 `setHidden` 메서드를 사용해서 모델 인스턴스의 보이거나 숨길 속성 전체를 임시로 지정해 줄 수도 있습니다.

```
return $user->setVisible(['id', 'name'])->toArray();

return $user->setHidden(['email', 'password', 'remember_token'])->toArray();
```

<a name="appending-values-to-json"></a>
## JSON에 값 추가하기

때로는 데이터베이스 컬럼으로 존재하지 않는 속성도, 모델을 배열이나 JSON으로 변환하면서 추가하고 싶을 수 있습니다. 이럴 때는 먼저 해당 값을 위한 [액세서](/docs/10.x/eloquent-mutators)를 정의해 줍니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 사용자가 관리자인지 여부를 반환합니다.
     */
    protected function isAdmin(): Attribute
    {
        return new Attribute(
            get: fn () => 'yes',
        );
    }
}
```

작성한 액세서가 항상 모델의 배열 및 JSON 표현에 포함되도록 하려면, 모델의 `appends` 속성에 해당 속성명을 추가하면 됩니다. 액세서의 PHP 메서드는 카멜케이스(`isAdmin`)로 정의했지만, 속성명은 보통 "스네이크케이스"(`is_admin`)로 사용됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 모델의 배열 표현에 추가할 액세서 목록.
     *
     * @var array
     */
    protected $appends = ['is_admin'];
}
```

`appends` 리스트에 포함된 속성은 모델의 배열 및 JSON 결과에 항상 추가됩니다. 또한, 이 속성들도 모델의 `visible` 또는 `hidden` 설정을 그대로 따릅니다.

<a name="appending-at-run-time"></a>
#### 실행 시점에 속성 추가하기

런타임에서, 모델 인스턴스에 추가 속성을 동적으로 추가하고 싶다면 `append` 메서드를 사용할 수 있습니다. 또는, `setAppends` 메서드로 해당 인스턴스의 appends 전체를 재설정할 수도 있습니다.

```
return $user->append('is_admin')->toArray();

return $user->setAppends(['is_admin'])->toArray();
```

<a name="date-serialization"></a>
## 날짜 직렬화

<a name="customizing-the-default-date-format"></a>
#### 기본 날짜 포맷 커스터마이징

기본 날짜 직렬화 포맷을 바꾸고 싶다면, `serializeDate` 메서드를 오버라이드하면 됩니다. 이 메서드는 데이터베이스에 저장된 날짜 포맷에는 영향을 주지 않습니다.

```
/**
 * 배열/JSON 직렬화를 위한 날짜 준비 메서드.
 */
protected function serializeDate(DateTimeInterface $date): string
{
    return $date->format('Y-m-d');
}
```

<a name="customizing-the-date-format-per-attribute"></a>
#### 개별 속성별 날짜 포맷 지정

모델의 [cast 선언부](/docs/10.x/eloquent-mutators#attribute-casting)에서 각 Eloquent 날짜 속성의 직렬화 포맷을 별도로 지정할 수도 있습니다.

```
protected $casts = [
    'birthday' => 'date:Y-m-d',
    'joined_at' => 'datetime:Y-m-d H:00',
];
```
