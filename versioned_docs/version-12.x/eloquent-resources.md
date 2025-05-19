# Eloquent: API 리소스 (Eloquent: API Resources)

- [소개](#introduction)
- [리소스 생성하기](#generating-resources)
- [개념 개요](#concept-overview)
    - [리소스 컬렉션](#resource-collections)
- [리소스 작성하기](#writing-resources)
    - [데이터 래핑](#data-wrapping)
    - [페이징 처리](#pagination)
    - [조건부 속성](#conditional-attributes)
    - [조건부 연관관계](#conditional-relationships)
    - [메타 데이터 추가](#adding-meta-data)
- [리소스 응답](#resource-responses)

<a name="introduction"></a>
## 소개

API를 개발할 때, Eloquent 모델과 실제로 애플리케이션 사용자에게 반환되는 JSON 응답 사이에 변환 계층이 필요할 수 있습니다. 예를 들어, 특정 사용자 그룹에는 일부 속성만 표시하고 싶거나, 항상 모델의 특정 연관관계를 JSON 표현에 포함하고 싶을 수도 있습니다. Eloquent의 리소스 클래스는 여러분의 모델 및 모델 컬렉션을 JSON으로 변환하는 과정을 더 표현력 있고 간편하게 만들어줍니다.

물론, Eloquent 모델이나 컬렉션의 `toJson` 메서드를 사용해 손쉽게 JSON으로 변환할 수도 있지만, Eloquent 리소스는 모델과 그 연관관계의 JSON 직렬화 과정을 더 세밀하고 견고하게 제어할 수 있도록 도와줍니다.

<a name="generating-resources"></a>
## 리소스 생성하기

리소스 클래스를 생성하려면 `make:resource` Artisan 명령어를 사용할 수 있습니다. 기본적으로 리소스는 애플리케이션의 `app/Http/Resources` 디렉토리에 생성됩니다. 각 리소스 클래스는 `Illuminate\Http\Resources\Json\JsonResource` 클래스를 확장합니다.

```shell
php artisan make:resource UserResource
```

<a name="generating-resource-collections"></a>
#### 리소스 컬렉션

개별 모델을 변환하는 리소스 외에도, 모델 컬렉션을 변환하는 역할을 하는 리소스 컬렉션 또한 생성할 수 있습니다. 이렇게 하면, JSON 응답에 해당 전체 컬렉션과 관련된 링크 등 추가적인 메타 정보를 포함시킬 수 있습니다.

리소스 컬렉션을 만들려면 리소스 생성 시 `--collection` 플래그를 사용하세요. 또는 리소스 이름에 `Collection`이라는 단어를 포함시키면 라라벨이 컬렉션 리소스임을 자동으로 인식합니다. 컬렉션 리소스는 `Illuminate\Http\Resources\Json\ResourceCollection` 클래스를 확장합니다.

```shell
php artisan make:resource User --collection

php artisan make:resource UserCollection
```

<a name="concept-overview"></a>
## 개념 개요

> [!NOTE]
> 이 부분은 리소스 및 리소스 컬렉션에 대한 상위 개념 설명입니다. 리소스의 다양한 커스터마이징 방법과 강력한 기능에 대해 더 깊이 이해하고 싶다면, 본 문서의 다른 섹션도 반드시 읽어보시기 바랍니다.

리소스를 작성할 때 사용할 수 있는 다양한 옵션을 모두 살펴보기 전에, 먼저 라라벨에서 리소스가 어떻게 사용되는지 전체적인 흐름을 이해해봅시다. 하나의 리소스 클래스는 JSON 구조로 변환되어야 하는 단일 모델을 나타냅니다. 예를 들어, 다음은 간단한 `UserResource` 클래스의 예시입니다.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
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

모든 리소스 클래스는 `toArray` 메서드를 정의하며, 이 메서드는 라우트나 컨트롤러에서 리소스를 응답할 때 JSON으로 변환되어야 하는 속성 배열을 반환합니다.

여기서 `$this` 변수를 통해 모델의 프로퍼티에 직접 접근할 수 있는데, 이는 리소스 클래스가 속성이나 메서드 접근을 자동으로 내부의 모델로 위임(proxied)하기 때문에 매우 편리합니다. 리소스를 정의했다면, 라우트나 컨트롤러에서 인스턴스를 생성하여 바로 반환할 수 있습니다. 리소스는 생성자에서 해당 모델 인스턴스를 받도록 되어 있습니다.

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return new UserResource(User::findOrFail($id));
});
```

좀 더 편하게 사용하려면 모델의 `toResource` 메서드를 활용할 수도 있으며, 이 경우 라라벨의 규칙에 따라 자동으로 적합한 리소스 클래스를 찾아줍니다.

```php
return User::findOrFail($id)->toResource();
```

`toResource` 메서드를 호출하면, 라라벨은 해당 모델 이름과 일치하며, 선택적으로 `Resource`로 끝나는 클래스를 `Http\Resources` 네임스페이스 내에서 가까운 순서대로 찾아 사용합니다.

<a name="resource-collections"></a>
### 리소스 컬렉션

리소스의 컬렉션이나 페이지네이션된 결과를 반환할 경우, 라우트 또는 컨트롤러에서 리소스 클래스의 `collection` 메서드를 활용해야 합니다.

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/users', function () {
    return UserResource::collection(User::all());
});
```

또는 좀 더 간편하게, Eloquent 컬렉션의 `toResourceCollection` 메서드를 사용할 수도 있습니다. 이 메서드는 라라벨의 규칙에 따라 자동으로 해당 모델의 리소스 컬렉션을 찾아서 적용합니다.

```php
return User::all()->toResourceCollection();
```

`toResourceCollection` 메서드를 사용할 때, 라라벨은 모델 이름과 일치하며 `Collection`으로 끝나는 리소스 컬렉션 클래스를 `Http\Resources` 네임스페이스 내에서 자동으로 찾아 사용합니다.

<a name="custom-resource-collections"></a>
#### 커스텀 리소스 컬렉션

기본적으로 리소스 컬렉션은 컬렉션에 포함되어야 할 커스텀 메타 데이터를 직접 추가할 수 없습니다. 컬렉션 결과에 메타 데이터 등을 포함하여 응답을 커스터마이즈하고 싶을 때는, 해당 컬렉션을 담당할 별도의 리소스 클래스를 생성하면 됩니다.

```shell
php artisan make:resource UserCollection
```

이렇게 리소스 컬렉션 클래스가 만들어지면, 응답에 포함할 메타 데이터를 간편하게 정의할 수 있습니다.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
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

이렇게 정의한 리소스 컬렉션은 라우트나 컨트롤러에서 다음과 같이 바로 반환할 수 있습니다.

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::all());
});
```

또는, Eloquent 컬렉션의 `toResourceCollection` 메서드를 사용해 자동으로 해당 리소스 컬렉션을 찾아 응답할 수도 있습니다.

```php
return User::all()->toResourceCollection();
```

`toResourceCollection` 메서드를 사용할 때, 라라벨은 모델 이름과 일치하며 `Collection`으로 끝나는 리소스 컬렉션 클래스를 `Http\Resources` 네임스페이스 내에서 자동으로 찾아 사용합니다.

<a name="preserving-collection-keys"></a>
#### 컬렉션 키 유지하기

라우트에서 리소스 컬렉션을 반환할 때, 라라벨은 컬렉션의 키를 0부터 시작하는 숫자로 재설정합니다. 하지만, 컬렉션의 원래 키를 유지하고 싶다면 리소스 클래스에 `preserveKeys` 프로퍼티를 추가하면 됩니다.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Indicates if the resource's collection keys should be preserved.
     *
     * @var bool
     */
    public $preserveKeys = true;
}
```

`preserveKeys` 프로퍼티가 `true`로 설정되면, 컬렉션이 라우트나 컨트롤러에서 반환될 때 원래 키가 유지됩니다.

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/users', function () {
    return UserResource::collection(User::all()->keyBy->id);
});
```

<a name="customizing-the-underlying-resource-class"></a>
#### 컬렉션에서 사용하는 기본 리소스 클래스 커스터마이즈

일반적으로 리소스 컬렉션의 `$this->collection` 프로퍼티는, 컬렉션의 각 항목이 해당하는 개별 리소스 클래스로 자동 매핑되어 채워집니다. 여기서 단수 리소스 클래스는 컬렉션 클래스의 이름에서 마지막에 붙은 `Collection`을 제거한 이름으로 간주됩니다. 취향에 따라, 단수 리소스 클래스 이름 뒤에 `Resource`를 붙이거나 생략할 수도 있습니다.

예를 들어, `UserCollection`은 해당 user 인스턴스들을 `UserResource` 리소스로 매핑하게 됩니다. 이 동작을 변경하려면 리소스 컬렉션 클래스에서 `$collects` 프로퍼티를 오버라이드하면 됩니다.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * The resource that this resource collects.
     *
     * @var string
     */
    public $collects = Member::class;
}
```

<a name="writing-resources"></a>
## 리소스 작성하기

> [!NOTE]
> [개념 개요](#concept-overview) 섹션을 아직 읽지 않았다면, 이 문서를 계속 읽기 전에 꼭 확인하길 권장합니다.

리소스의 역할은 주어진 모델을 배열로 변환하는 것뿐입니다. 따라서 각 리소스 클래스에는 모델의 속성들을 API 환경에 적합한 배열로 변환하는 `toArray` 메서드가 포함되어 있습니다. 이 배열은 애플리케이션의 라우트나 컨트롤러에서 바로 반환할 수 있습니다.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
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

리소스를 정의했다면, 라우트나 컨트롤러에서 바로 다음과 같이 반환할 수 있습니다.

```php
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return User::findOrFail($id)->toUserResource();
});
```

<a name="relationships"></a>
#### 연관관계

응답에 관련 리소스를 함께 포함하고 싶다면, 리소스의 `toArray` 메서드에서 반환하는 배열에 해당 연관관계를 추가하면 됩니다. 예를 들어, 아래에서는 사용자의 블로그 포스트들을 `PostResource`의 `collection` 메서드를 사용해 응답에 포함시키는 예시입니다.

```php
use App\Http\Resources\PostResource;
use Illuminate\Http\Request;

/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
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

> [!NOTE]
> 로드된 경우에만 연관관계를 포함하는 방법에 대해서는 [조건부 연관관계](#conditional-relationships) 문서를 참고하세요.

<a name="writing-resource-collections"></a>
#### 리소스 컬렉션

리소스가 단일 모델을 배열로 변환한다면, 리소스 컬렉션은 여러 모델의 컬렉션을 배열로 변환합니다. 하지만 모델마다 각각 리소스 컬렉션 클래스를 정의할 필요는 없습니다. 모든 Eloquent 모델 컬렉션은 `toResourceCollection` 메서드를 제공하므로, 즉석에서 리소스 컬렉션을 쉽게 만들 수 있습니다.

```php
use App\Models\User;

Route::get('/users', function () {
    return User::all()->toResourceCollection();
});
```

하지만 컬렉션에 포함하여 반환할 메타 데이터를 커스터마이즈하고자 한다면 직접 리소스 컬렉션 클래스를 정의해야 합니다.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
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

개별 리소스와 마찬가지로, 리소스 컬렉션도 라우트나 컨트롤러에서 직접 반환할 수 있습니다.

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::all());
});
```

또는 Eloquent 컬렉션의 `toResourceCollection` 메서드를 사용해 라라벨이 적절한 리소스 컬렉션을 자동으로 찾도록 할 수 있습니다.

```php
return User::all()->toResourceCollection();
```

`toResourceCollection` 메서드를 사용할 때, 라라벨은 모델 이름과 일치하며 `Collection`으로 끝나는 리소스 컬렉션 클래스를 `Http\Resources` 네임스페이스 내에서 자동으로 찾아 사용합니다.

<a name="data-wrapping"></a>
### 데이터 래핑

기본적으로, 최상위 리소스가 JSON으로 변환될 때는 `data` 키로 감싸집니다. 예를 들어, 일반적인 리소스 컬렉션 응답은 다음과 같이 반환됩니다.

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ]
}
```

최상위 리소스의 래핑을 비활성화하려면, 기본 `Illuminate\Http\Resources\Json\JsonResource` 클래스에서 `withoutWrapping` 메서드를 호출하면 됩니다. 보통은 애플리케이션에서 매 요청마다 로드되는 `AppServiceProvider` 또는 [서비스 프로바이더](/docs/12.x/providers) 내에서 해당 메서드를 호출하는 것이 좋습니다.

```php
<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        JsonResource::withoutWrapping();
    }
}
```

> [!WARNING]
> `withoutWrapping` 메서드는 최상위 응답에만 영향을 주며, 여러분이 직접 리소스 컬렉션에 추가한 `data` 키는 제거되지 않습니다.

<a name="wrapping-nested-resources"></a>
#### 중첩 리소스 래핑

리소스의 연관관계(relationship)가 어떻게 래핑되는지는 여러분이 자유롭게 결정할 수 있습니다. 모든 리소스 컬렉션이 중첩 여부에 관계 없이 항상 `data` 키로 감싸지길 원한다면, 각 리소스별로 리소스 컬렉션 클래스를 생성하고, 반환하는 배열에 반드시 `data` 키를 포함하세요.

이렇게 하면 최상위 리소스가 두 번 `data`로 감싸지는 것 아닌지 걱정할 수도 있는데, 걱정하지 않으셔도 됩니다. 라라벨은 절대 리소스가 실수로 중첩 래핑되는 것을 허용하지 않습니다. 즉, 리소스 컬렉션의 변환 깊이에 관계없이 항상 한 번만 래핑됩니다.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class CommentsCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return ['data' => $this->collection];
    }
}
```

<a name="data-wrapping-and-pagination"></a>
#### 데이터 래핑과 페이징 처리

리소스 응답을 통해 페이지네이션된(페이징 처리된) 컬렉션을 반환할 때, `withoutWrapping` 메서드를 호출했다 하더라도 라라벨은 리소스 데이터를 반드시 `data` 키로 감쌉니다. 이는 페이지네이션된 응답에는 항상 페이지네이터의 상태를 나타내는 `meta`, `links` 키가 함께 포함되기 때문입니다.

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ],
    "links":{
        "first": "http://example.com/users?page=1",
        "last": "http://example.com/users?page=1",
        "prev": null,
        "next": null
    },
    "meta":{
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "path": "http://example.com/users",
        "per_page": 15,
        "to": 10,
        "total": 10
    }
}
```

<a name="pagination"></a>
### 페이징 처리

라라벨 페이지네이터 인스턴스를 리소스의 `collection` 메서드나 커스텀 리소스 컬렉션에 전달할 수 있습니다.

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::paginate());
});
```

또는 더 간단하게, 페이지네이터의 `toResourceCollection` 메서드를 사용할 수도 있습니다. 이 역시 라라벨이 적합한 리소스 컬렉션을 자동으로 찾아 할당해줍니다.

```php
return User::paginate()->toResourceCollection();
```

페이지네이션 응답에는 항상 페이지네이터의 상태를 나타내는 `meta`, `links` 키가 포함됩니다.

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ],
    "links":{
        "first": "http://example.com/users?page=1",
        "last": "http://example.com/users?page=1",
        "prev": null,
        "next": null
    },
    "meta":{
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "path": "http://example.com/users",
        "per_page": 15,
        "to": 10,
        "total": 10
    }
}
```

<a name="customizing-the-pagination-information"></a>
#### 페이지네이션 정보 커스터마이즈

페이지네이션 응답에서 `links`나 `meta` 키에 포함된 정보를 커스터마이즈하고 싶다면, 리소스에 `paginationInformation` 메서드를 정의하면 됩니다. 이 메서드는 `$paginated` 데이터와 기본 값이 담긴 `$default` 배열(여기에는 `links`와 `meta` 키가 포함됨)을 인자로 받습니다.

```php
/**
 * Customize the pagination information for the resource.
 *
 * @param  \Illuminate\Http\Request  $request
 * @param  array $paginated
 * @param  array $default
 * @return array
 */
public function paginationInformation($request, $paginated, $default)
{
    $default['links']['custom'] = 'https://example.com';

    return $default;
}
```

<a name="conditional-attributes"></a>

### 조건부 속성

특정 조건이 충족될 때만 리소스 응답에 속성을 포함하고 싶을 때가 있습니다. 예를 들어, 현재 사용자가 "관리자"일 때만 값을 포함하고 싶을 수 있습니다. 라라벨은 이러한 상황을 도와주는 다양한 헬퍼 메서드를 제공합니다. `when` 메서드를 사용하면 조건에 따라 리소스 응답에 속성을 추가할 수 있습니다.

```php
/**
 * 리소스를 배열로 변환합니다.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'secret' => $this->when($request->user()->isAdmin(), 'secret-value'),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

이 예시에서 인증된 사용자의 `isAdmin` 메서드가 `true`를 반환할 경우에만 `secret` 키가 최종 리소스 응답에 포함됩니다. 만약 `false`를 반환한다면, 클라이언트에 응답이 전달되기 전에 `secret` 키는 리소스 응답에서 제거됩니다. `when` 메서드를 사용하면 배열을 만들 때 조건문을 사용하지 않고도 리소스를 더욱 명확하게 정의할 수 있습니다.

`when` 메서드는 두 번째 인수로 클로저를 받을 수도 있습니다. 이 경우 주어진 조건이 `true`일 때만 결과 값을 계산합니다.

```php
'secret' => $this->when($request->user()->isAdmin(), function () {
    return 'secret-value';
}),
```

`whenHas` 메서드는 모델의 실제 속성이 존재할 때만 해당 속성을 리소스 응답에 포함하고 싶을 때 사용할 수 있습니다.

```php
'name' => $this->whenHas('name'),
```

또한, `whenNotNull` 메서드는 속성이 `null`이 아닐 때만 리소스 응답에 포함하고 싶을 때 사용할 수 있습니다.

```php
'name' => $this->whenNotNull($this->name),
```

<a name="merging-conditional-attributes"></a>
#### 조건부 속성 병합

여러 속성을 동일한 조건에 따라 리소스 응답에 포함하고 싶을 때가 있습니다. 이런 경우에는 `mergeWhen` 메서드를 사용하여, 주어진 조건이 `true`일 때만 여러 속성을 한 번에 응답에 병합할 수 있습니다.

```php
/**
 * 리소스를 배열로 변환합니다.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        $this->mergeWhen($request->user()->isAdmin(), [
            'first-secret' => 'value',
            'second-secret' => 'value',
        ]),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

마찬가지로, 주어진 조건이 `false`라면 이러한 속성들은 클라이언트에 응답을 보내기 전에 리소스 응답에서 제거됩니다.

> [!WARNING]
> `mergeWhen` 메서드는 문자열 키와 숫자 키가 혼합된 배열에서 사용해서는 안 됩니다. 또한, 순차적이지 않은 숫자 키가 사용된 배열에서도 사용하지 않아야 합니다.

<a name="conditional-relationships"></a>
### 조건부 연관관계

속성의 조건부 로딩뿐만 아니라, 모델에서 이미 연관관계가 로드되어 있는 경우에만 리소스 응답에 연관관계를 포함시킬 수도 있습니다. 이를 통해 컨트롤러에서 어떤 연관관계를 로딩할지 결정할 수 있고, 리소스에서는 실제로 로드된 경우에만 간단하게 포함시킬 수 있습니다. 궁극적으로, 리소스 내에서 "N+1" 쿼리 문제를 쉽게 피할 수 있습니다.

`whenLoaded` 메서드를 사용하면 연관관계를 조건부로 로드할 수 있습니다. 필요하지 않은 연관관계 로딩을 방지하기 위해, 이 메서드는 실제 연관관계 객체가 아닌 연관관계의 이름만 받습니다.

```php
use App\Http\Resources\PostResource;

/**
 * 리소스를 배열로 변환합니다.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
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

이 예시에서 연관관계가 로드되지 않았다면, `posts` 키는 클라이언트에 응답이 전달되기 전에 리소스 응답에서 제거됩니다.

<a name="conditional-relationship-counts"></a>
#### 조건부 연관관계 개수 포함

연관관계를 조건부로 포함하는 것뿐만 아니라, 연관관계의 개수(`count`)가 모델에 로드되어 있을 때만 해당 개수를 조건부로 리소스 응답에 포함할 수도 있습니다.

```php
new UserResource($user->loadCount('posts'));
```

`whenCounted` 메서드는 연관관계의 개수가 존재할 때만 이를 리소스 응답에 포함할 수 있게 해줍니다. 이 메서드는 연관관계 개수가 존재하지 않을 경우 불필요하게 속성이 추가되는 것을 방지합니다.

```php
/**
 * 리소스를 배열로 변환합니다.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'posts_count' => $this->whenCounted('posts'),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

이 예시에서 `posts` 연관관계의 개수가 로드되지 않았다면, `posts_count` 키 역시 클라이언트에 응답이 전달되기 전에 리소스 응답에서 제거됩니다.

`avg`, `sum`, `min`, `max`와 같은 기타 집계 함수들도 `whenAggregated` 메서드를 사용해 조건부로 포함시킬 수 있습니다.

```php
'words_avg' => $this->whenAggregated('posts', 'words', 'avg'),
'words_sum' => $this->whenAggregated('posts', 'words', 'sum'),
'words_min' => $this->whenAggregated('posts', 'words', 'min'),
'words_max' => $this->whenAggregated('posts', 'words', 'max'),
```

<a name="conditional-pivot-information"></a>
#### 조건부 피벗(pivot) 정보 포함

리소스 응답에 조건부로 연관관계 정보를 포함시키는 것 외에도, `whenPivotLoaded` 메서드를 사용해 다대다(many-to-many) 연관관계의 중간 테이블(pivot 테이블)에서 오는 데이터 역시 조건에 따라 포함할 수 있습니다. `whenPivotLoaded` 메서드는 첫 번째 인수로 피벗 테이블의 이름을 받고, 두 번째 인수로는 피벗 정보가 모델에 있을 때 반환할 값을 제공하는 클로저를 받습니다.

```php
/**
 * 리소스를 배열로 변환합니다.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
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

만약 [커스텀 중간 테이블 모델](/docs/12.x/eloquent-relationships#defining-custom-intermediate-table-models)을 연관관계에서 사용하고 있다면, `whenPivotLoaded`의 첫 번째 인수로 중간 테이블 모델 인스턴스를 전달할 수 있습니다.

```php
'expires_at' => $this->whenPivotLoaded(new Membership, function () {
    return $this->pivot->expires_at;
}),
```

만약 중간 테이블이 `pivot`이 아닌 다른 접근자(accessor)를 사용 중이라면, `whenPivotLoadedAs` 메서드를 활용할 수 있습니다.

```php
/**
 * 리소스를 배열로 변환합니다.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
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

일부 JSON API 표준에서는 리소스 및 리소스 컬렉션 응답에 메타데이터 추가를 요구하기도 합니다. 여기에는 리소스나 관련 리소스로의 `links`, 혹은 리소스 자체에 대한 다양한 메타 정보가 포함될 수 있습니다. 리소스에 추가적인 메타데이터를 반환해야 한다면, 이를 `toArray` 메서드 내에 포함하면 됩니다. 예를 들어, 리소스 컬렉션을 변환할 때 `links` 정보를 넣을 수 있습니다.

```php
/**
 * 리소스를 배열로 변환합니다.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'data' => $this->collection,
        'links' => [
            'self' => 'link-value',
        ],
    ];
}
```

자원에서 추가적인 메타데이터를 반환할 때는 라라벨에서 페이징이 적용된 응답에 자동으로 추가하는 `links` 또는 `meta` 키를 실수로 덮어쓸까 걱정할 필요가 없습니다. 여러분이 직접 정의하는 모든 추가 `links`는 페이지네이터에서 제공하는 링크와 자동으로 병합됩니다.

<a name="top-level-meta-data"></a>
#### 최상위 메타데이터

특정 메타데이터를 리소스 응답 중에서도 가장 바깥, 즉 최상위 리소스에만 포함하고 싶을 때가 있습니다. 보통 이런 메타 데이터에는 전체 응답에 대한 정보를 담기도 합니다. 이러한 메타데이터를 정의하려면 리소스 클래스에 `with` 메서드를 추가합니다. 이 메서드는 최상위 리소스가 변환될 때만 리소스 응답에 포함되어야 할 메타 데이터의 배열을 반환해야 합니다.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * 리소스 컬렉션을 배열로 변환합니다.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }

    /**
     * 리소스 배열과 함께 반환되어야 할 추가 데이터를 가져옵니다.
     *
     * @return array<string, mixed>
     */
    public function with(Request $request): array
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
#### 리소스 인스턴스 생성 시 메타데이터 추가

라우트나 컨트롤러에서 리소스 인스턴스를 생성할 때도 최상위 데이터를 추가할 수 있습니다. 모든 리소스에서 사용할 수 있는 `additional` 메서드는 리소스 응답에 추가로 포함시킬 데이터를 배열로 받습니다.

```php
return User::all()
    ->load('roles')
    ->toResourceCollection()
    ->additional(['meta' => [
        'key' => 'value',
    ]]);
```

<a name="resource-responses"></a>
## 리소스 응답

앞서 설명했듯이, 리소스는 라우트나 컨트롤러에서 직접 반환할 수 있습니다.

```php
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return User::findOrFail($id)->toResource();
});
```

하지만 때로는 클라이언트로 전송되기 전, HTTP 응답을 추가로 커스터마이징해야 할 때가 있습니다. 이럴 때는 두 가지 방법이 있습니다. 첫 번째로, 리소스에 `response` 메서드를 체이닝할 수 있습니다. 이 메서드는 `Illuminate\Http\JsonResponse` 인스턴스를 반환하므로, 응답 헤더를 포함한 전체 응답을 자유롭게 제어할 수 있습니다.

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/user', function () {
    return User::find(1)
        ->toResource()
        ->response()
        ->header('X-Value', 'True');
});
```

또는, 리소스 내에 `withResponse` 메서드를 정의할 수도 있습니다. 이 메서드는 리소스가 응답의 최상위 리소스일 때 호출됩니다.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * 리소스를 배열로 변환합니다.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
        ];
    }

    /**
     * 리소스의 HTTP 응답을 커스터마이즈합니다.
     */
    public function withResponse(Request $request, JsonResponse $response): void
    {
        $response->header('X-Value', 'True');
    }
}
```