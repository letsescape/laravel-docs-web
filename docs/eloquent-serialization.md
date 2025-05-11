# 일러퀀트: 직렬화 (Eloquent: Serialization)

- [소개](#introduction)
- [모델 및 컬렉션 직렬화하기](#serializing-models-and-collections)
    - [배열로 직렬화](#serializing-to-arrays)
    - [JSON으로 직렬화](#serializing-to-json)
- [JSON에서 속성 숨기기](#hiding-attributes-from-json)
- [JSON에 값 추가하기](#appending-values-to-json)
- [날짜 직렬화](#date-serialization)

<a name="introduction"></a>
## 소개

라라벨로 API를 개발할 때, 모델 및 관계 데이터를 배열이나 JSON 형식으로 변환해야 할 때가 많습니다. 일러퀀트(Eloquent)에서는 이러한 변환을 편리하게 처리할 수 있는 메서드들을 제공하며, 직렬화 시 모델에서 어떤 속성들이 포함될지 세밀하게 제어할 수 있습니다.

> [!NOTE]
> 일러퀀트 모델 및 컬렉션의 JSON 직렬화를 더 견고하게 관리하고 싶다면 [Eloquent API 리소스](/docs/eloquent-resources) 문서를 참고하시기 바랍니다.

<a name="serializing-models-and-collections"></a>
## 모델 및 컬렉션 직렬화하기

<a name="serializing-to-arrays"></a>
### 배열로 직렬화

모델과 로드된 [관계](/docs/eloquent-relationships)를 배열로 변환하려면 `toArray` 메서드를 사용하면 됩니다. 이 메서드는 재귀적으로 동작하여, 모델의 모든 속성과 모든 관계(하위 관계까지 모두) 역시 배열로 변환됩니다.

```php
use App\Models\User;

$user = User::with('roles')->first();

return $user->toArray();
```

`attributesToArray` 메서드는 모델의 *속성*만 배열로 변환하며, 관계는 포함하지 않습니다.

```php
$user = User::first();

return $user->attributesToArray();
```

또한, 모델의 [컬렉션](/docs/eloquent-collections) 전체도 컬렉션 인스턴스에 `toArray` 메서드를 호출해서 배열로 변환할 수 있습니다.

```php
$users = User::all();

return $users->toArray();
```

<a name="serializing-to-json"></a>
### JSON으로 직렬화

모델을 JSON으로 변환하려면 `toJson` 메서드를 사용하면 됩니다. `toJson` 역시 `toArray`와 마찬가지로 재귀적으로 동작하여, 모든 속성과 관계들이 JSON으로 함께 변환됩니다. 또한 [PHP에서 지원하는](https://secure.php.net/manual/en/function.json-encode.php) JSON 인코딩 옵션도 지정할 수 있습니다.

```php
use App\Models\User;

$user = User::find(1);

return $user->toJson();

return $user->toJson(JSON_PRETTY_PRINT);
```

또는, 모델이나 컬렉션을 문자열(string)로 캐스팅하면 자동으로 해당 객체의 `toJson` 메서드가 호출됩니다.

```php
return (string) User::find(1);
```

모델과 컬렉션은 문자열로 변환될 때 자동으로 JSON으로 변환되므로, 라라벨의 라우트나 컨트롤러에서 일러퀀트 객체를 직접 반환할 수 있습니다. 이 경우 라라벨이 자동으로 해당 모델이나 컬렉션을 JSON으로 직렬화해서 응답합니다.

```php
Route::get('/users', function () {
    return User::all();
});
```

<a name="relationships"></a>
#### 관계(Relationships)

일러퀀트 모델이 JSON으로 변환될 때, 로드된 관계 데이터도 자동으로 JSON 객체의 속성으로 함께 포함됩니다. 또한, 일러퀀트의 관계 메서드는 보통 "카멜 케이스(camel case)"로 정의되어 있지만, JSON으로 직렬화될 때는 "스네이크 케이스(snake case)" 속성명으로 변환되어 포함됩니다.

<a name="hiding-attributes-from-json"></a>
## JSON에서 속성 숨기기

때로는 모델의 배열 또는 JSON 표현에 비밀번호처럼 일부 속성을 포함하지 않고 싶을 수 있습니다. 이럴 땐 모델에 `$hidden` 프로퍼티를 추가하면 됩니다. `$hidden` 배열에 추가한 속성은 직렬화 결과에서 제외됩니다.

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
> 관계(relationship)를 숨기고 싶다면, 해당 관계의 메서드명을 모델의 `$hidden` 프로퍼티에 추가하면 됩니다.

반대로, `$visible` 프로퍼티를 사용해 배열 및 JSON 직렬화시에 "허용할" 속성 목록만 지정할 수도 있습니다. `$visible` 배열에 없는 속성들은 직렬화 결과에 포함되지 않습니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 배열 형식에서 노출할 속성들
     *
     * @var array
     */
    protected $visible = ['first_name', 'last_name'];
}
```

<a name="temporarily-modifying-attribute-visibility"></a>
#### 속성 노출 여부 임시 변경하기

일반적으로 숨겨진 속성을 특정 모델 인스턴스에서만 일시적으로 공개하고 싶다면, `makeVisible` 메서드를 사용할 수 있습니다. 이 메서드는 모델 인스턴스를 반환합니다.

```php
return $user->makeVisible('attribute')->toArray();
```

마찬가지로, 평소에는 보이는 속성을 임시로 숨기고 싶을 때는 `makeHidden` 메서드를 사용할 수 있습니다.

```php
return $user->makeHidden('attribute')->toArray();
```

모든 visible 또는 hidden 속성을 임시로 완전히 덮어쓰고 싶다면 `setVisible`, `setHidden` 메서드를 각각 사용할 수 있습니다.

```php
return $user->setVisible(['id', 'name'])->toArray();

return $user->setHidden(['email', 'password', 'remember_token'])->toArray();
```

<a name="appending-values-to-json"></a>
## JSON에 값 추가하기

모델을 배열이나 JSON으로 변환할 때, 실제 데이터베이스에 존재하지 않는 가상 속성(예: 연산된 값)을 추가하고 싶을 때가 있습니다. 이 경우, 먼저 해당 값을 위한 [접근자(accessor)](/docs/eloquent-mutators)를 정의합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 사용자가 관리자(administrator)인지 여부 반환
     */
    protected function isAdmin(): Attribute
    {
        return new Attribute(
            get: fn () => 'yes',
        );
    }
}
```

이 접근자를 모델의 배열/JSON 표현에 항상 포함시키고 싶으면, 모델의 `appends` 프로퍼티에 속성명을 추가하면 됩니다. 이때 속성명은 보통 "스네이크 케이스" 형태로 입력하며, 접근자 메서드는 PHP에서 "카멜 케이스"로 정의합니다.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 배열로 변환 시 모델에 추가할 접근자(들)
     *
     * @var array
     */
    protected $appends = ['is_admin'];
}
```

`appends` 리스트에 속성을 추가하면, 해당 속성은 배열 및 JSON 표현 모두에 포함됩니다. `appends` 배열에 들어있는 속성들 역시 `visible` 및 `hidden` 설정과 함께 적용됩니다.

<a name="appending-at-run-time"></a>
#### 런타임에서 동적으로 속성 추가하기

코드를 실행하는 시점에, 추가적인 속성을 일시적으로 지정하고 싶을 땐 `append` 메서드를 사용할 수 있습니다. 또는, `setAppends` 메서드를 이용해 아예 전체 appends 속성 배열을 지정할 수도 있습니다.

```php
return $user->append('is_admin')->toArray();

return $user->setAppends(['is_admin'])->toArray();
```

<a name="date-serialization"></a>
## 날짜 직렬화

<a name="customizing-the-default-date-format"></a>
#### 기본 날짜 포맷 커스터마이즈

기본 날짜 직렬화 포맷을 변경하고 싶을 때는 `serializeDate` 메서드를 오버라이드하면 됩니다. 이 메서드는 데이터베이스에 저장되는 날짜 포맷에는 영향을 주지 않습니다.

```php
/**
 * 배열/JSON 직렬화용 날짜 포맷 지정
 */
protected function serializeDate(DateTimeInterface $date): string
{
    return $date->format('Y-m-d');
}
```

<a name="customizing-the-date-format-per-attribute"></a>
#### 속성별로 날짜 포맷 커스터마이즈

특정 일러퀀트 날짜 속성별로 직렬화 포맷을 따로 지정하고 싶다면, 모델의 [캐스팅 선언](/docs/eloquent-mutators#attribute-casting)에서 각 속성별로 데이터 포맷을 지정할 수 있습니다.

```php
protected function casts(): array
{
    return [
        'birthday' => 'date:Y-m-d',
        'joined_at' => 'datetime:Y-m-d H:00',
    ];
}
```
