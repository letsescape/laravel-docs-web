# Eloquent: 직렬화 (Eloquent: Serialization)

- [소개](#introduction)
- [모델과 컬렉션 직렬화](#serializing-models-and-collections)
    - [배열로 직렬화하기](#serializing-to-arrays)
    - [JSON으로 직렬화하기](#serializing-to-json)
- [JSON에서 속성 숨기기](#hiding-attributes-from-json)
- [JSON에 값 추가하기](#appending-values-to-json)
- [날짜 직렬화](#date-serialization)

<a name="introduction"></a>
## 소개

라라벨로 API를 개발할 때에는 모델과 연관관계 데이터를 배열이나 JSON 형태로 변환해야 할 때가 많습니다. Eloquent는 이러한 변환 작업을 매우 간편하게 해주는 여러 메서드들을 제공할 뿐만 아니라, 직렬화된 모델에 어떤 속성을 포함할지 제어할 수 있는 기능도 함께 제공합니다.

> [!NOTE]  
> Eloquent 모델과 컬렉션을 JSON으로 더욱 정교하게 변환·제어하고 싶다면 [Eloquent API 리소스](/docs/11.x/eloquent-resources) 문서를 참고하시기 바랍니다.

<a name="serializing-models-and-collections"></a>
## 모델과 컬렉션 직렬화

<a name="serializing-to-arrays"></a>
### 배열로 직렬화하기

모델과, 미리 로드된 [연관관계](/docs/11.x/eloquent-relationships)까지 배열로 변환하고 싶다면 `toArray` 메서드를 사용하면 됩니다. 이 메서드는 재귀적으로 동작하므로, 모델의 모든 속성뿐만 아니라 모든 연관관계(그리고 그 연관관계의 하위 관계까지)도 모두 배열로 변환됩니다.

```
use App\Models\User;

$user = User::with('roles')->first();

return $user->toArray();
```

`attributesToArray` 메서드를 사용하면 모델의 속성만 배열로 변환하고, 연관관계는 포함하지 않습니다.

```
$user = User::first();

return $user->attributesToArray();
```

또한 전체 [컬렉션](/docs/11.x/eloquent-collections) 자체를 배열로 변환하려면, 컬렉션 인스턴스에서 `toArray` 메서드를 호출하면 됩니다.

```
$users = User::all();

return $users->toArray();
```

<a name="serializing-to-json"></a>
### JSON으로 직렬화하기

모델을 JSON으로 변환하려면 `toJson` 메서드를 사용합니다. `toArray`처럼 `toJson`도 재귀적으로 작동하여 모든 속성과 연관관계가 JSON으로 변환됩니다. 필요하다면 [PHP에서 지원하는 JSON 인코딩 옵션](https://secure.php.net/manual/en/function.json-encode.php)을 지정할 수도 있습니다.

```
use App\Models\User;

$user = User::find(1);

return $user->toJson();

return $user->toJson(JSON_PRETTY_PRINT);
```

또는, 모델이나 컬렉션을 문자열로 캐스팅하면 자동으로 `toJson` 메서드가 호출되어 JSON 문자열로 변환됩니다.

```
return (string) User::find(1);
```

모델과 컬렉션은 문자열로 캐스팅될 때 자동으로 JSON으로 변환되기 때문에, 애플리케이션의 라우트나 컨트롤러에서 Eloquent 객체를 직접 반환할 수도 있습니다. 라라벨은 라우트 또는 컨트롤러에서 반환된 Eloquent 모델과 컬렉션을 자동으로 JSON으로 직렬화합니다.

```
Route::get('/users', function () {
    return User::all();
});
```

<a name="relationships"></a>
#### 연관관계

Eloquent 모델이 JSON으로 변환될 때, 미리 로드된 연관관계도 자동으로 JSON 객체의 속성(attribute)으로 포함됩니다. 참고로, Eloquent의 연관관계 메서드는 일반적으로 "카멜 케이스(camel case)"로 정의하지만, JSON에서는 "스네이크 케이스(snake case)" 형태로 속성 이름이 변환됩니다.

<a name="hiding-attributes-from-json"></a>
## JSON에서 속성 숨기기

비밀번호와 같이, 모델의 배열 혹은 JSON 표현에서 특정 속성(예: 보안 민감 정보 등)을 제외하고 싶은 경우가 있습니다. 이럴 때는 모델에 `$hidden` 속성을 추가하면 됩니다. `$hidden` 배열에 기재된 속성들은 직렬화된 결과에서 제외됩니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 직렬화 시 숨길 속성 배열입니다.
     *
     * @var array<string>
     */
    protected $hidden = ['password'];
}
```

> [!NOTE]  
> 만약 연관관계를 숨기고 싶다면, 해당 연관관계 메서드명을 Eloquent 모델의 `$hidden` 배열에 추가하면 됩니다.

반대로, `$visible` 속성을 이용해 모델의 배열, JSON 표현에서 **반드시 포함되어야 하는** 속성만 "화이트리스트" 방식으로 지정할 수도 있습니다. `$visible` 배열에 없는 모든 속성은 직렬화 시 숨겨집니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 배열에서 보이도록 할 속성 목록입니다.
     *
     * @var array
     */
    protected $visible = ['first_name', 'last_name'];
}
```

<a name="temporarily-modifying-attribute-visibility"></a>
#### 속성 공개/비공개 임시 변경

특정 모델 인스턴스에서 기본적으로 숨겨진 속성을 일시적으로 보이게 하고 싶다면 `makeVisible` 메서드를 사용할 수 있습니다. 이 메서드는 모델 인스턴스를 반환합니다.

```
return $user->makeVisible('attribute')->toArray();
```

반대로, 평소에 노출되는 속성을 임시로 숨기고 싶다면 `makeHidden` 메서드를 사용합니다.

```
return $user->makeHidden('attribute')->toArray();
```

그리고 공개 또는 비공개 속성 목록 전체를 임시로 재정의하고 싶을 때는 각각 `setVisible`, `setHidden` 메서드를 사용할 수 있습니다.

```
return $user->setVisible(['id', 'name'])->toArray();

return $user->setHidden(['email', 'password', 'remember_token'])->toArray();
```

<a name="appending-values-to-json"></a>
## JSON에 값 추가하기

모델을 배열이나 JSON으로 변환할 때, 데이터베이스 컬럼에는 없는 추가 정보를 포함시키고 싶을 때가 있습니다. 이럴 때는 [어세서(accessor)](/docs/11.x/eloquent-mutators)를 먼저 정의합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 사용자가 관리자 여부를 반환합니다.
     */
    protected function isAdmin(): Attribute
    {
        return new Attribute(
            get: fn () => 'yes',
        );
    }
}
```

이 어세서가 모델의 배열/JSON 표현에 항상 추가로 포함되길 원한다면, 해당 속성명을 모델의 `appends` 속성에 추가하면 됩니다. 참고로 메서드는 "카멜 케이스"로 작성하지만, `appends` 배열에는 "스네이크 케이스"로 기입해야 합니다.

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * 배열 형태로 변환할 때 포함할 어세서의 목록입니다.
     *
     * @var array
     */
    protected $appends = ['is_admin'];
}
```

이렇게 `appends`에 추가된 속성은 모델의 배열과 JSON 표현 모두에 포함됩니다. 그리고 `appends` 배열에 있는 속성도 모델에서 설정한 `visible`과 `hidden` 속성의 영향을 받습니다.

<a name="appending-at-run-time"></a>
#### 실행 시점에 값 추가하기

실행 중에 모델 인스턴스에 추가 속성을 포함시키고 싶다면 `append` 메서드를 사용할 수 있습니다. 그리고 `setAppends` 메서드를 이용하면 해당 인스턴스의 전체 추가 속성 목록을 한 번에 지정할 수 있습니다.

```
return $user->append('is_admin')->toArray();

return $user->setAppends(['is_admin'])->toArray();
```

<a name="date-serialization"></a>
## 날짜 직렬화

<a name="customizing-the-default-date-format"></a>
#### 기본 날짜 형식 커스터마이즈

날짜의 직렬화 기본 포맷을 바꾸고 싶을 때는, `serializeDate` 메서드를 오버라이드(재정의)하면 됩니다. 이 메서드는 데이터베이스에 저장되는 날짜 포맷에는 영향을 주지 않습니다.

```
/**
 * 배열 / JSON 직렬화를 위한 날짜 준비.
 */
protected function serializeDate(DateTimeInterface $date): string
{
    return $date->format('Y-m-d');
}
```

<a name="customizing-the-date-format-per-attribute"></a>
#### 개별 속성의 날짜 형식 지정

특정한 Eloquent 날짜 속성마다 별도의 직렬화 형식을 지정하고 싶을 때는, 모델의 [캐스트 선언](/docs/11.x/eloquent-mutators#attribute-casting)에서 직접 날짜 형식을 지정할 수 있습니다.

```
protected function casts(): array
{
    return [
        'birthday' => 'date:Y-m-d',
        'joined_at' => 'datetime:Y-m-d H:00',
    ];
}
```
