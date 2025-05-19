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

라라벨을 사용해 API를 개발할 때, 모델과 연관관계를 배열 또는 JSON 형태로 변환해야 하는 경우가 많습니다. Eloquent는 이러한 변환을 쉽게 할 수 있는 편리한 메서드들을 제공하며, 모델의 직렬화 결과에 포함될 속성을 세밀하게 제어할 수 있는 기능도 지원합니다.

> [!NOTE]
> Eloquent 모델과 컬렉션의 JSON 직렬화를 더 강력하게 다루고 싶다면 [Eloquent API 리소스](/docs/9.x/eloquent-resources) 문서를 참고하시기 바랍니다.

<a name="serializing-models-and-collections"></a>
## 모델 및 컬렉션 직렬화

<a name="serializing-to-arrays"></a>
### 배열로 직렬화하기

모델과 함께 로드된 [연관관계](/docs/9.x/eloquent-relationships)를 배열로 변환하려면 `toArray` 메서드를 사용합니다. 이 메서드는 재귀적으로 동작하기 때문에, 모든 속성과 연관관계(연관관계의 또 다른 연관관계까지 포함)까지 전부 배열로 변환됩니다.

```
use App\Models\User;

$user = User::with('roles')->first();

return $user->toArray();
```

`attributesToArray` 메서드는 모델의 속성만 배열로 변환하며, 연관관계는 포함하지 않습니다.

```
$user = User::first();

return $user->attributesToArray();
```

또한, 모델의 전체 [컬렉션](/docs/9.x/eloquent-collections)을 컬렉션 인스턴스에서 `toArray` 메서드를 호출하여 배열로 변환할 수도 있습니다.

```
$users = User::all();

return $users->toArray();
```

<a name="serializing-to-json"></a>
### JSON으로 직렬화하기

모델을 JSON으로 변환하려면 `toJson` 메서드를 사용합니다. `toArray`와 마찬가지로, `toJson` 역시 재귀적으로 모든 속성과 연관관계를 JSON으로 변환합니다. 또한 [PHP에서 지원하는](https://secure.php.net/manual/en/function.json-encode.php) 어떠한 JSON 인코딩 옵션도 함께 지정할 수 있습니다.

```
use App\Models\User;

$user = User::find(1);

return $user->toJson();

return $user->toJson(JSON_PRETTY_PRINT);
```

또는, 모델이나 컬렉션을 문자열로 캐스팅(cast)하면 `toJson` 메서드가 자동으로 호출되어 JSON 문자열이 반환됩니다.

```
return (string) User::find(1);
```

이처럼 모델이나 컬렉션이 문자열로 캐스팅될 때 JSON으로 변환되므로, 애플리케이션의 라우트나 컨트롤러에서 Eloquent 객체를 직접 반환할 수 있습니다. 라라벨은 라우트나 컨트롤러에서 반환된 Eloquent 모델 및 컬렉션을 자동으로 JSON으로 직렬화합니다.

```
Route::get('users', function () {
    return User::all();
});
```

<a name="relationships"></a>
#### 연관관계

Eloquent 모델이 JSON으로 변환될 때, 로드된 연관관계는 JSON 객체의 속성으로 자동 포함됩니다. 또한 Eloquent 연관관계 메서드는 카멜케이스로 정의하지만, JSON의 속성명은 스네이크케이스로 변환되어 사용됩니다.

<a name="hiding-attributes-from-json"></a>
## JSON에서 속성 숨기기

비밀번호처럼 모델의 배열 또는 JSON 표현에 포함하고 싶지 않은 속성이 있을 수 있습니다. 이럴 때는 모델에 `$hidden` 속성을 추가하면 됩니다. `$hidden` 속성에 명시된 배열의 내용은 모델이 직렬화될 때 포함되지 않습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 배열에서 숨겨질 속성.
     *
     * @var array
     */
    protected $hidden = ['password'];
}
```

> [!NOTE]
> 연관관계를 숨기고 싶다면, 해당 연관관계의 메서드 이름을 Eloquent 모델의 `$hidden` 속성에 추가하면 됩니다.

또는, `visible` 속성을 사용하여 배열 및 JSON 표현에 포함될 속성만을 "허용 목록"으로 명시할 수도 있습니다. `$visible` 배열에 포함되지 않은 모든 속성은 배열이나 JSON 변환 시 숨겨집니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 배열에서 표시될 속성.
     *
     * @var array
     */
    protected $visible = ['first_name', 'last_name'];
}
```

<a name="temporarily-modifying-attribute-visibility"></a>
#### 속성 가시성 일시적으로 변경하기

일반적으로 숨겨진 속성을 일시적으로 보이게 하고 싶다면 `makeVisible` 메서드를 사용할 수 있습니다. `makeVisible` 메서드는 모델 인스턴스를 반환합니다.

```
return $user->makeVisible('attribute')->toArray();
```

반대로, 평소에 보이는 속성을 일시적으로 숨기고 싶다면 `makeHidden` 메서드를 사용할 수 있습니다.

```
return $user->makeHidden('attribute')->toArray();
```

모델의 visible 또는 hidden 속성 전체를 일시적으로 덮어쓰려면 각각 `setVisible`과 `setHidden` 메서드를 사용하세요.

```
return $user->setVisible(['id', 'name'])->toArray();

return $user->setHidden(['email', 'password', 'remember_token'])->toArray();
```

<a name="appending-values-to-json"></a>
## JSON에 값 추가하기

모델을 배열이나 JSON으로 변환할 때, 데이터베이스 컬럼에 해당하지 않는 속성을 추가하고 싶을 때가 있습니다. 이럴 때는 먼저 해당 값에 대한 [accessor(접근자)](/docs/9.x/eloquent-mutators)를 정의합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 사용자가 관리자인지 판별.
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute
     */
    protected function isAdmin(): Attribute
    {
        return new Attribute(
            get: fn () => 'yes',
        );
    }
}
```

그리고 나서, 생성한 속성명을 모델의 `appends` 속성에 추가합니다. 일반적으로 속성명은 직렬화된 "스네이크케이스"로 명시해야 하며, 접근자의 PHP 메서드는 카멜케이스로 정의하더라도 상관없습니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 모델 배열 형태에 추가할 접근자 목록.
     *
     * @var array
     */
    protected $appends = ['is_admin'];
}
```

이렇게 `appends` 목록에 속성을 추가하면, 그 속성이 모델의 배열 및 JSON 표현에 함께 포함됩니다. `appends` 배열의 속성도 모델에 설정된 `visible` 또는 `hidden` 옵션을 함께 따릅니다.

<a name="appending-at-run-time"></a>
#### 런타임에 속성 추가하기

실행 중에 모델 인스턴스에서 추가로 속성을 붙이고 싶을 때는 `append` 메서드를 사용할 수 있습니다. 또는, `setAppends` 메서드를 통해 해당 모델 인스턴스의 추가 속성 목록 전체를 덮어쓸 수도 있습니다.

```
return $user->append('is_admin')->toArray();

return $user->setAppends(['is_admin'])->toArray();
```

<a name="date-serialization"></a>
## 날짜 직렬화

<a name="customizing-the-default-date-format"></a>
#### 기본 날짜 포맷 커스터마이징

기본 날짜 직렬화 포맷을 변경하고 싶다면 `serializeDate` 메서드를 오버라이드하면 됩니다. 이 메서드는 데이터베이스에 저장되는 날짜 포맷에는 영향을 주지 않습니다.

```
/**
 * 배열/JSON 직렬화를 위한 날짜 포맷 지정.
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
#### 개별 속성별 날짜 포맷 커스터마이즈

특정 Eloquent 날짜 속성만 직렬화 포맷을 다르게 지정하고 싶다면, 모델의 [캐스트 선언](/docs/9.x/eloquent-mutators#attribute-casting)에서 날짜 포맷을 지정할 수 있습니다.

```
protected $casts = [
    'birthday' => 'date:Y-m-d',
    'joined_at' => 'datetime:Y-m-d H:00',
];
```