# Eloquent: API 리소스 (Eloquent: API Resources)

- [소개](#introduction)
- [리소스 생성](#generating-resources)
- [개념 개요](#concept-overview)
    - [리소스 컬렉션](#resource-collections)
- [리소스 작성](#writing-resources)
    - [데이터 래핑](#data-wrapping)
    - [페이지네이션](#pagination)
    - [조건부 속성](#conditional-attributes)
    - [조건부 연관관계](#conditional-relationships)
    - [메타데이터 추가](#adding-meta-data)
- [리소스 응답](#resource-responses)

<a name="introduction"></a>
## 소개

API를 구축할 때, Eloquent 모델과 실제로 사용자에게 반환되는 JSON 응답 사이에서 동작하는 변환 계층이 필요할 수 있습니다. 예를 들어, 특정 사용자들에게만 일부 속성을 표시하고 싶거나, 항상 모델의 특정 연관관계를 JSON 표현에 포함시키고 싶을 수 있습니다. Eloquent의 리소스 클래스는 이러한 변환을 명확하고 손쉽게 할 수 있게 해줍니다.

물론, Eloquent 모델 또는 컬렉션의 `toJson` 메서드를 사용해 직접 JSON으로 변환할 수도 있습니다. 하지만 Eloquent 리소스를 사용하면 모델과 그 연관관계의 JSON 직렬화 과정을 더욱 세밀하고 강력하게 제어할 수 있습니다.

<a name="generating-resources"></a>
## 리소스 생성

리소스 클래스를 생성하려면, `make:resource` Artisan 명령어를 사용할 수 있습니다. 기본적으로 리소스는 애플리케이션의 `app/Http/Resources` 디렉터리에 생성됩니다. 리소스 클래스는 `Illuminate\Http\Resources\Json\JsonResource` 클래스를 확장합니다.

```
php artisan make:resource UserResource
```

<a name="generating-resource-collections"></a>
#### 리소스 컬렉션

개별 모델을 변환하는 리소스뿐만 아니라, 모델 컬렉션을 변환하는 데 특화된 리소스도 생성할 수 있습니다. 이를 통해 JSON 응답에 해당 리소스 전체 컬렉션과 관련된 링크나 기타 메타 정보를 포함할 수 있습니다.

컬렉션 리소스를 생성하려면 리소스 생성 시 `--collection` 플래그를 사용하면 됩니다. 또는 리소스 이름에 `Collection`이 포함되어 있으면 라라벨은 해당 리소스가 컬렉션 리소스임을 인식합니다. 컬렉션 리소스는 `Illuminate\Http\Resources\Json\ResourceCollection` 클래스를 확장합니다.

```
php artisan make:resource User --collection

php artisan make:resource UserCollection
```

<a name="concept-overview"></a>
## 개념 개요

> [!TIP]
> 이 섹션은 리소스 및 리소스 컬렉션에 대한 상위 개념을 다룹니다. 리소스의 커스터마이징 및 다양한 기능에 대해 더 깊이 이해하고 싶다면, 문서의 다른 섹션도 꼭 읽어보시기 바랍니다.

리소스를 작성할 때 활용할 수 있는 다양한 옵션을 살펴보기 전에, 먼저 라라벨에서 리소스가 어떻게 사용되는지 살펴보겠습니다. 리소스 클래스는 JSON 구조로 변환이 필요한 단일 모델을 나타냅니다. 예를 들어, 다음은 `UserResource`라는 간단한 리소스 클래스의 예시입니다.

```
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * 리소스를 배열로 변환합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

각 리소스 클래스는 `toArray` 메서드를 정의하며, 이 메서드는 해당 리소스를 라우트나 컨트롤러 메서드에서 응답으로 반환할 때 JSON으로 변환되어야 할 속성들의 배열을 반환합니다.

리소스 클래스 내에서 `$this` 변수로 모델의 속성에 직접 접근할 수 있습니다. 이는 리소스 클래스가 프로퍼티 및 메서드 접근 권한을 자동으로 내부 모델에 전달해주기 때문입니다. 정의한 리소스는 라우트나 컨트롤러에서 다음과 같이 반환할 수 있습니다. 리소스 생성자에는 변환 대상이 되는 모델 인스턴스를 전달합니다.

```
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/user/{id}', function ($id) {
    return new UserResource(User::findOrFail($id));
});
```

<a name="resource-collections"></a>
### 리소스 컬렉션

여러 리소스가 담긴 컬렉션이나 페이지네이션 응답을 반환할 때는 라우트나 컨트롤러에서 리소스 클래스의 `collection` 메서드를 사용하여 인스턴스를 생성하는 것이 좋습니다.

```
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/users', function () {
    return UserResource::collection(User::all());
});
```

이 방법으로는 컬렉션과 함께 반환될 커스텀 메타데이터를 추가할 수 없습니다. 컬렉션 응답에 맞춤형 데이터를 포함시키고 싶다면 컬렉션 전용 리소스 클래스를 따로 생성해야 합니다.

```
php artisan make:resource UserCollection
```

생성된 컬렉션 리소스 클래스에서는 응답과 함께 포함시킬 메타데이터를 쉽게 정의할 수 있습니다.

```
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * 리소스 컬렉션을 배열로 변환합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'data' => $this->collection,
            'links' => [
                'self' => 'link-value',
            ],
        ];
    }
}
```

정의한 컬렉션 리소스는 라우트나 컨트롤러에서 다음과 같이 반환할 수 있습니다.

```
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::all());
});
```

<a name="preserving-collection-keys"></a>
#### 컬렉션 키 유지

라우트에서 리소스 컬렉션을 반환하면, Laravel은 기본적으로 컬렉션의 키를 숫자 순서대로 재정렬합니다. 그러나 컬렉션의 원래 키를 그대로 유지하려면 리소스 클래스에 `preserveKeys` 속성을 추가하면 됩니다.

```
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * 리소스 컬렉션의 키를 유지할지 여부를 나타냅니다.
     *
     * @var bool
     */
    public $preserveKeys = true;
}
```

`preserveKeys` 속성이 `true`로 설정된 경우, 라우트나 컨트롤러에서 컬렉션을 반환할 때 컬렉션의 키가 그대로 반영됩니다.

```
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/users', function () {
    return UserResource::collection(User::all()->keyBy->id);
});
```

<a name="customizing-the-underlying-resource-class"></a>
#### 내부 리소스 클래스 커스터마이징

일반적으로 리소스 컬렉션의 `$this->collection` 속성은 컬렉션의 각 아이템을 단수형 리소스 클래스로 매핑한 결과로 자동 채워집니다. 이때 단수형 리소스 클래스는 컬렉션 클래스의 이름에서 `Collection`을 제거한 이름(또는 필요에 따라 `Resource` 접미사가 붙기도 함)으로 추정합니다.

예를 들어, `UserCollection`은 전달된 각 유저 인스턴스를 `UserResource`로 변환합니다. 이 동작 방식을 커스터마이즈하고 싶다면, 컬렉션 리소스 클래스의 `$collects` 속성을 오버라이드하면 됩니다.

```
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * 이 리소스 컬렉션이 수집하는 리소스 클래스입니다.
     *
     * @var string
     */
    public $collects = Member::class;
}
```

<a name="writing-resources"></a>
## 리소스 작성

> [!TIP]
> [개념 개요](#concept-overview) 섹션을 아직 읽지 않았다면, 이 문서를 계속 진행하기 전에 꼭 읽어보시기를 권장합니다.

리소스의 본질은 매우 단순합니다. 주어진 모델을 배열로 변환하기만 하면 됩니다. 각 리소스는 모델의 속성을 API 친화적인 배열로 변환하는 `toArray` 메서드를 포함합니다. 이 배열은 애플리케이션의 라우트 또는 컨트롤러에서 반환할 수 있습니다.

```
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * 리소스를 배열로 변환합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

정의한 리소스는 라우트나 컨트롤러에서 직접 반환할 수 있습니다.

```
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/user/{id}', function ($id) {
    return new UserResource(User::findOrFail($id));
});
```

<a name="relationships"></a>
#### 연관관계

응답에 관련 리소스(연관관계된 데이터)를 함께 포함하고 싶다면, `toArray` 메서드의 반환 배열에 해당 리소스를 추가하면 됩니다. 예를 들어, `PostResource`의 `collection` 메서드를 사용해 사용자의 블로그 게시글 정보를 포함시킬 수 있습니다.

```
use App\Http\Resources\PostResource;

/**
 * 리소스를 배열로 변환합니다.
 *
 * @param  \Illuminate\Http\Request  $request
 * @return array
 */
public function toArray($request)
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'posts' => PostResource::collection($this->posts),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

> [!TIP]
> 연관관계를 로드된 경우에만 포함하려면, [조건부 연관관계](#conditional-relationships) 문서를 참고하세요.

<a name="writing-resource-collections"></a>
#### 리소스 컬렉션

단일 리소스는 하나의 모델을 배열로 변환하지만, 리소스 컬렉션은 여러 모델의 컬렉션을 배열로 변환합니다. 모든 모델마다 별도의 리소스 컬렉션 클래스를 정의할 필요는 없습니다. 모든 리소스는 `collection` 메서드를 제공하므로, 해당 리소스를 즉석에서 컬렉션 형태로 쉽게 만들 수 있습니다.

```
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/users', function () {
    return UserResource::collection(User::all());
});
```

하지만 컬렉션과 함께 반환할 메타데이터를 커스터마이즈해야 한다면, 별도의 컬렉션 리소스를 직접 정의해야 합니다.

```
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * 리소스 컬렉션을 배열로 변환합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'data' => $this->collection,
            'links' => [
                'self' => 'link-value',
            ],
        ];
    }
}
```

단수형 리소스와 마찬가지로 컬렉션 리소스 역시 라우트나 컨트롤러에서 직접 반환할 수 있습니다.

```
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::all());
});
```

<a name="data-wrapping"></a>
### 데이터 래핑

기본적으로 최상위 리소스가 JSON으로 변환될 때, 응답은 `data` 키로 감싸져 반환됩니다. 예를 들어, 일반적인 리소스 컬렉션 응답은 다음과 같이 보입니다.

```
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com",
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com",
        }
    ]
}
```

`data` 대신 다른 키를 사용하고 싶으면 리소스 클래스에 `$wrap` 속성을 정의하면 됩니다.

```
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * 적용할 "data" 래퍼입니다.
     *
     * @var string
     */
    public static $wrap = 'user';
}
```

최상위 리소스의 래핑을 아예 비활성화하고 싶으면, 기본 `Illuminate\Http\Resources\Json\JsonResource` 클래스의 `withoutWrapping` 메서드를 호출해야 합니다. 보통 이 메서드는 `AppServiceProvider` 또는 모든 요청에서 로드되는 [서비스 프로바이더](/docs/8.x/providers)에서 호출해야 합니다.

```
<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스를 등록합니다.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * 애플리케이션 서비스 부트스트랩.
     *
     * @return void
     */
    public function boot()
    {
        JsonResource::withoutWrapping();
    }
}
```

> [!NOTE]
> `withoutWrapping` 메서드는 최상위 응답에만 영향을 미치며, 직접 리소스 컬렉션 내에 추가한 `data` 키는 제거되지 않습니다.

<a name="wrapping-nested-resources"></a>
#### 중첩 리소스 래핑

리소스의 연관관계(즉, 중첩된 리소스)가 어떻게 감싸질지는 직접 결정할 수 있습니다. 중첩 여부에 관계없이 모든 리소스 컬렉션을 `data` 키로 감싸고 싶다면, 각 리소스마다 컬렉션 리소스 클래스를 만들어 반환 시 `data` 키로 래핑하면 됩니다.

혹시 최상위 리소스가 `data` 키로 두 번 감싸지게 되지 않을까 걱정할 수도 있겠지만, 라라벨은 리소스가 실수로 중복 감싸짐이 발생하지 않도록 자동으로 처리해 줍니다. 따라서 컬렉션 리소스의 중첩 레벨에 신경 쓸 필요가 없습니다.

```
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class CommentsCollection extends ResourceCollection
{
    /**
     * 리소스 컬렉션을 배열로 변환합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return ['data' => $this->collection];
    }
}
```

<a name="data-wrapping-and-pagination"></a>
#### 데이터 래핑과 페이지네이션

페이지네이션이 적용된 컬렉션을 리소스 응답으로 반환할 때는, 비록 `withoutWrapping` 메서드를 호출했더라도 라라벨은 항상 데이터를 `data` 키로 감싸서 반환합니다. 이는 페이지네이션 응답이 항상 `meta` 와 `links` 키를 포함하기 때문입니다.

```
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com",
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com",
        }
    ],
    "links":{
        "first": "http://example.com/pagination?page=1",
        "last": "http://example.com/pagination?page=1",
        "prev": null,
        "next": null
    },
    "meta":{
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "path": "http://example.com/pagination",
        "per_page": 15,
        "to": 10,
        "total": 10
    }
}
```

<a name="pagination"></a>
### 페이지네이션

라라벨의 페이지네이터 인스턴스를 리소스의 `collection` 메서드나 커스텀 리소스 컬렉션에 건네줄 수 있습니다.

```
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::paginate());
});
```

페이지네이션 응답은 항상 페이지네이터의 상태 정보를 담은 `meta`와 `links` 키를 포함합니다.

```
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com",
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com",
        }
    ],
    "links":{
        "first": "http://example.com/pagination?page=1",
        "last": "http://example.com/pagination?page=1",
        "prev": null,
        "next": null
    },
    "meta":{
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "path": "http://example.com/pagination",
        "per_page": 15,
        "to": 10,
        "total": 10
    }
}
```

<a name="conditional-attributes"></a>
### 조건부 속성

특정 조건이 충족될 때만 리소스 응답에 속성을 포함시키고 싶은 경우가 있습니다. 예를 들어, 현재 사용자가 "관리자"인 경우에만 특정 값을 포함하고 싶을 수 있습니다. 이런 상황에서 사용할 수 있는 다양한 헬퍼 메서드가 제공됩니다. `when` 메서드는 특정 조건이 참일 때만 속성을 리소스 응답에 포함할 수 있도록 해줍니다.

```
use Illuminate\Support\Facades\Auth;

/**
 * 리소스를 배열로 변환합니다.
 *
 * @param  \Illuminate\Http\Request  $request
 * @return array
 */
public function toArray($request)
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'secret' => $this->when(Auth::user()->isAdmin(), 'secret-value'),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

위 예시에서 인증된 사용자의 `isAdmin` 메서드가 `true`를 반환하는 경우에만 최종 리소스 응답에 `secret` 키가 포함됩니다. 만약 `false`를 반환하면, `secret` 키는 클라이언트로 반환되기 전 리소스 응답에서 자동으로 제거됩니다. `when` 메서드를 사용하면 조건문 없이도 더욱 명확하게 속성의 포함 여부를 정의할 수 있습니다.

또한 `when` 메서드의 두 번째 인자로 클로저를 전달할 수도 있는데, 이 경우 조건이 참일 때만 해당 값을 계산합니다.

```
'secret' => $this->when(Auth::user()->isAdmin(), function () {
    return 'secret-value';
}),
```

<a name="merging-conditional-attributes"></a>
#### 조건부 속성 병합

여러 개의 속성이 동일한 조건에서만 응답에 포함되어야 할 때가 있습니다. 이런 경우 `mergeWhen` 메서드를 사용하면, 조건이 참일 때에만 해당 속성들을 한 번에 응답에 추가할 수 있습니다.

```
/**
 * 리소스를 배열로 변환합니다.
 *
 * @param  \Illuminate\Http\Request  $request
 * @return array
 */
public function toArray($request)
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        $this->mergeWhen(Auth::user()->isAdmin(), [
            'first-secret' => 'value',
            'second-secret' => 'value',
        ]),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

조건이 `false`인 경우, 이 속성들은 리소스 응답에서 자동으로 제거되어 클라이언트로 전송되지 않습니다.

> [!NOTE]
> `mergeWhen` 메서드는 문자 키와 숫자 키가 혼합된 배열이나, 순차적으로 정렬되지 않은 숫자 키 배열에서는 사용하지 않는 것이 좋습니다.

<a name="conditional-relationships"></a>
### 조건부 연관관계

속성뿐 아니라, 연관관계를 미리 로드한 경우에만 리소스 응답에 포함시키고 싶을 수도 있습니다. 이렇게 하면 컨트롤러에서 어떤 연관관계를 가져올지 결정하고, 리소스에서는 실제로 로드된 경우에만 응답에 포함할 수 있습니다. 결과적으로 리소스를 사용할 때 N+1 쿼리 문제를 효과적으로 피할 수 있습니다.

`whenLoaded` 메서드를 사용하면 연관관계의 이름을 전달하여, 해당 연관관계가 이미 로드된 경우에만 응답에 포함할 수 있습니다. (연관관계 객체가 아닌 '이름'을 전달해야 불필요하게 쿼리를 실행하지 않습니다.)

```
use App\Http\Resources\PostResource;

/**
 * 리소스를 배열로 변환합니다.
 *
 * @param  \Illuminate\Http\Request  $request
 * @return array
 */
public function toArray($request)
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'posts' => PostResource::collection($this->whenLoaded('posts')),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

이 예시에서 해당 연관관계가 로드되지 않았다면, 클라이언트로 응답이 전송되기 전에 `posts` 키가 리소스 응답에서 제거됩니다.

<a name="conditional-pivot-information"></a>
#### 조건부 피벗(pivot) 정보

연관관계 데이터뿐 아니라 다대다(many-to-many) 연관관계에서 중간 테이블(피벗 테이블) 정보를 조건부로 리소스 응답에 포함할 수도 있습니다. `whenPivotLoaded` 메서드는 첫 번째 인자로 피벗 테이블명을, 두 번째 인자로는 해당 피벗 정보가 모델에 제공된 경우 반환할 값을 전달하는 클로저를 받습니다.

```
/**
 * 리소스를 배열로 변환합니다.
 *
 * @param  \Illuminate\Http\Request  $request
 * @return array
 */
public function toArray($request)
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'expires_at' => $this->whenPivotLoaded('role_user', function () {
            return $this->pivot->expires_at;
        }),
    ];
}
```

[커스텀 중간 테이블 모델](/docs/8.x/eloquent-relationships#defining-custom-intermediate-table-models)를 사용하는 경우, `whenPivotLoaded` 메서드의 첫 번째 인자로 중간 테이블 모델 인스턴스를 전달할 수 있습니다.

```
'expires_at' => $this->whenPivotLoaded(new Membership, function () {
    return $this->pivot->expires_at;
}),
```

중간 테이블의 accessor가 `pivot`이 아닌 다른 이름을 사용하는 경우에는 `whenPivotLoadedAs` 메서드를 활용할 수 있습니다.

```
/**
 * 리소스를 배열로 변환합니다.
 *
 * @param  \Illuminate\Http\Request  $request
 * @return array
 */
public function toArray($request)
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'expires_at' => $this->whenPivotLoadedAs('subscription', 'role_user', function () {
            return $this->subscription->expires_at;
        }),
    ];
}
```

<a name="adding-meta-data"></a>
### 메타데이터 추가

일부 JSON API 표준에서는 리소스 및 리소스 컬렉션 응답에 메타데이터를 추가해야 할 수도 있습니다. 여기에는 리소스나 관련 리소스에 대한 `links`, 또는 리소스 자체에 대한 메타 정보 등이 포함될 수 있습니다. 추가 메타데이터를 반환해야 한다면, `toArray` 메서드 내에 해당 정보를 포함시키면 됩니다. 예를 들어, 리소스 컬렉션을 변환할 때 링크 정보를 포함할 수 있습니다.

```
/**
 * 리소스를 배열로 변환합니다.
 *
 * @param  \Illuminate\Http\Request  $request
 * @return array
 */
public function toArray($request)
{
    return [
        'data' => $this->collection,
        'links' => [
            'self' => 'link-value',
        ],
    ];
}
```

추가 메타데이터를 리소스에서 반환할 때, 페이지네이션 응답에 자동으로 추가되는 `links`나 `meta`를 덮어쓸까 걱정할 필요가 없습니다. 직접 정의한 `links`는 페이지네이터에서 제공하는 링크와 자동으로 병합됩니다.

<a name="top-level-meta-data"></a>
#### 최상위 메타데이터

때로는 리소스가 최상위로 반환되는 경우에만 특정 메타데이터를 응답에 포함시키고 싶을 수 있습니다. 주로 응답 전체에 대한 메타 정보 등이 이에 해당합니다. 이런 메타데이터를 정의하려면 리소스 클래스에 `with` 메서드를 추가하면 됩니다. 이 메서드는 리소스가 최상위로 변환될 때만 함께 반환되는 메타데이터 배열을 반환합니다.

```
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * 리소스 컬렉션을 배열로 변환합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return parent::toArray($request);
    }

    /**
     * 리소스 배열과 함께 반환할 추가 데이터입니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function with($request)
    {
        return [
            'meta' => [
                'key' => 'value',
            ],
        ];
    }
}
```

<a name="adding-meta-data-when-constructing-resources"></a>
#### 리소스 생성 시 메타데이터 추가

라우트나 컨트롤러에서 리소스 인스턴스를 생성할 때 추가적인 최상위 데이터를 넣어줄 수도 있습니다. 모든 리소스에서 사용 가능한 `additional` 메서드는 응답에 함께 추가할 데이터를 배열 형태로 받을 수 있습니다.

```
return (new UserCollection(User::all()->load('roles')))
                ->additional(['meta' => [
                    'key' => 'value',
                ]]);
```

<a name="resource-responses"></a>
## 리소스 응답

앞서 살펴본 것처럼, 리소스는 라우트와 컨트롤러에서 직접 반환할 수 있습니다.

```
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/user/{id}', function ($id) {
    return new UserResource(User::findOrFail($id));
});
```

하지만 경우에 따라, 클라이언트로 전달되기 전에 HTTP 응답을 커스터마이즈해야 할 수 있습니다. 이를 위한 방법은 두 가지가 있습니다. 먼저, 리소스에 `response` 메서드를 체이닝할 수 있습니다. 이 메서드는 `Illuminate\Http\JsonResponse` 인스턴스를 반환하므로, 응답 헤더 등의 세부 설정을 자유롭게 변경할 수 있습니다.

```
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/user', function () {
    return (new UserResource(User::find(1)))
                ->response()
                ->header('X-Value', 'True');
});
```

또는, 리소스 클래스 내에 `withResponse` 메서드를 정의할 수도 있습니다. 이 메서드는 리소스가 최상위 리소스로 응답될 때 호출됩니다.

```
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * 리소스를 배열로 변환합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
        ];
    }

    /**
     * 리소스의 응답을 커스터마이즈합니다.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Illuminate\Http\Response  $response
     * @return void
     */
    public function withResponse($request, $response)
    {
        $response->header('X-Value', 'True');
    }
}
```
