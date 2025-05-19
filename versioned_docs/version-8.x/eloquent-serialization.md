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

라라벨로 API를 구축할 때는 모델 및 연관관계를 배열 또는 JSON으로 변환해야 하는 경우가 많습니다. Eloquent는 이러한 변환을 손쉽게 처리할 수 있는 메서드를 제공하며, 직렬화된 모델 표현에서 포함할 속성을 제어할 수 있는 기능도 지원합니다.

> [!TIP]
> Eloquent 모델 및 컬렉션의 JSON 직렬화를 보다 강력하게 다루고 싶다면 [Eloquent API 리소스](/docs/8.x/eloquent-resources) 문서도 참고하시기 바랍니다.

<a name="serializing-models-and-collections"></a>
## 모델 및 컬렉션 직렬화

<a name="serializing-to-arrays"></a>
### 배열로 직렬화하기

모델과 로드된 [연관관계](/docs/8.x/eloquent-relationships)를 배열로 변환하려면 `toArray` 메서드를 사용하면 됩니다. 이 메서드는 재귀적으로 동작하므로, 모든 속성과 연관관계(심지어 연관관계의 연관관계까지)도 배열로 변환됩니다.

```
use App\Models\User;

$user = User::with('roles')->first();

return $user->toArray();
```

`attributesToArray` 메서드를 사용하면, 모델의 속성만 배열로 변환할 수 있으며 연관관계는 배열에 포함되지 않습니다.

```
$user = User::first();

return $user->attributesToArray();
```

또한, 모델 [컬렉션](/docs/8.x/eloquent-collections) 전체를 컬렉션 인스턴스에서 `toArray`를 호출하여 배열로 변환할 수도 있습니다.

```
$users = User::all();

return $users->toArray();
```

<a name="serializing-to-json"></a>
### JSON으로 직렬화하기

모델을 JSON으로 변환하려면 `toJson` 메서드를 사용하면 됩니다. `toArray`와 마찬가지로, `toJson`도 재귀적으로 동작하여 모든 속성과 연관관계를 JSON으로 변환합니다. 또한 [PHP에서 지원하는](https://secure.php.net/manual/en/function.json-encode.php) JSON 인코딩 옵션도 지정할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

return $user->toJson();

return $user->toJson(JSON_PRETTY_PRINT);
```

또는, 모델이나 컬렉션을 문자열로 형변환하면 자동으로 해당 객체의 `toJson` 메서드가 호출됩니다.

```
return (string) User::find(1);
```

모델이나 컬렉션을 문자열로 변환할 때 자동으로 JSON으로 변환되므로, 애플리케이션의 라우트나 컨트롤러에서 Eloquent 객체를 직접 반환할 수 있습니다. 라라벨은 라우트 혹은 컨트롤러에서 반환된 Eloquent 모델과 컬렉션을 자동으로 JSON으로 직렬화하여 반환합니다.

```
Route::get('users', function () {
    return User::all();
});
```

<a name="relationships"></a>
#### 연관관계

Eloquent 모델이 JSON으로 변환될 때, 로드된 연관관계는 자동으로 JSON 객체의 속성으로 포함됩니다. 참고로, Eloquent 연관관계 메서드는 "카멜 케이스"로 정의되지만, JSON으로 직렬화된 속성명은 "스네이크 케이스"로 변환됩니다.

<a name="hiding-attributes-from-json"></a>
## JSON에서 속성 숨기기

때로는 비밀번호와 같이 모델의 배열 또는 JSON 표현에서 일부 속성을 제외하고 싶을 수 있습니다. 이 경우, 모델에 `$hidden` 속성을 추가하면 됩니다. `$hidden` 배열에 나열된 속성들은 직렬화된 모델에서 포함되지 않습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 배열에서 숨길 속성들
     *
     * @var array
     */
    protected $hidden = ['password'];
}
```

> [!TIP]
> 연관관계를 숨기고 싶다면, `$hidden` 속성 배열에 해당 연관관계의 메서드명을 추가하면 됩니다.

반대로, `$visible` 속성을 사용해 배열 및 JSON 표현에 포함될 속성의 "허용 목록"을 정의할 수도 있습니다. `$visible` 배열에 나열되지 않은 모든 속성은 배열이나 JSON 변환 시 숨겨집니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 배열에서 보이게 할 속성들
     *
     * @var array
     */
    protected $visible = ['first_name', 'last_name'];
}
```

<a name="temporarily-modifying-attribute-visibility"></a>
#### 속성 가시성 임시 수정하기

일반적으로 숨겨져 있는 특정 속성을 일시적으로 보이도록 하려면 `makeVisible` 메서드를 사용할 수 있습니다. 이 메서드는 모델 인스턴스를 반환합니다.

```
return $user->makeVisible('attribute')->toArray();
```

반대로, 일반적으로 보이는 속성을 일시적으로 숨기고 싶다면 `makeHidden` 메서드를 사용할 수 있습니다.

```
return $user->makeHidden('attribute')->toArray();
```

<a name="appending-values-to-json"></a>
## JSON에 값 추가하기

모델을 배열 또는 JSON으로 변환할 때, 데이터베이스 컬럼에는 존재하지 않는 속성을 추가하고 싶을 때가 있습니다. 이 경우, 먼저 해당 값을 위한 [접근자(Accessor)](/docs/8.x/eloquent-mutators)를 정의하십시오.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 사용자가 관리자(administrator)인지 여부를 반환
     *
     * @return bool
     */
    public function getIsAdminAttribute()
    {
        return $this->attributes['admin'] === 'yes';
    }
}
```

접근자를 만들었다면, 모델의 `appends` 속성에 해당 속성명을 추가합니다. 참고로, 접근자의 PHP 메서드는 "카멜 케이스"로 정의하지만, 직렬화 시에는 "스네이크 케이스" 이름으로 지정하는 것이 일반적입니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 배열 형태에 추가할 접근자 목록
     *
     * @var array
     */
    protected $appends = ['is_admin'];
}
```

`appends` 목록에 속성이 추가되면, 모델을 배열이나 JSON으로 변환할 때 해당 속성이 포함됩니다. `appends` 배열에 포함된 속성도 모델의 `visible` 및 `hidden` 설정을 따라 동작합니다.

<a name="appending-at-run-time"></a>
#### 런타임에 값 추가하기

실행 중 특정 모델 인스턴스에 추가적인 속성을 포함하고 싶다면 `append` 메서드를 사용할 수 있습니다. 또는 `setAppends` 메서드를 사용하여 추가 속성 배열 전체를 지정할 수도 있습니다.

```
return $user->append('is_admin')->toArray();

return $user->setAppends(['is_admin'])->toArray();
```

<a name="date-serialization"></a>
## 날짜 직렬화

<a name="customizing-the-default-date-format"></a>
#### 기본 날짜 포맷 커스터마이징

기본 직렬화 날짜 포맷을 변경하고 싶다면, `serializeDate` 메서드를 오버라이드하면 됩니다. 이 메서드는 데이터베이스에 저장되는 날짜의 포맷에는 영향을 주지 않습니다.

```
/**
 * 배열/JSON 직렬화를 위한 날짜 변환
 *
 * @param  \DateTimeInterface  $date
 * @return string
 */
protected function serializeDate(DateTimeInterface $date)
{
    return $date->format('Y-m-d');
}
```

<a name="customizing-the-date-format-per-attribute"></a>
#### 속성별 날짜 포맷 커스터마이징

개별 Eloquent 날짜 속성의 직렬화 포맷을 변경하고 싶다면, 모델의 [캡스팅 선언](/docs/8.x/eloquent-mutators#attribute-casting)에서 날짜 포맷을 지정할 수 있습니다.

```
protected $casts = [
    'birthday' => 'date:Y-m-d',
    'joined_at' => 'datetime:Y-m-d H:00',
];
```
