# Eloquent: API 리소스 (Eloquent: API Resources)

- [소개](#introduction)
- [리소스 생성하기](#generating-resources)
- [개념 개요](#concept-overview)
    - [리소스 컬렉션](#resource-collections)
- [리소스 작성하기](#writing-resources)
    - [데이터 래핑](#data-wrapping)
    - [페이지네이션](#pagination)
    - [조건부 속성](#conditional-attributes)
    - [조건부 관계](#conditional-relationships)
    - [메타데이터 추가하기](#adding-meta-data)
- [리소스 응답](#resource-responses)

<a name="introduction"></a>
## 소개

API를 구축할 때 Eloquent 모델과 실제로 사용자에게 반환되는 JSON 응답 사이에 변환 계층이 필요할 수 있습니다. 예를 들어, 일부 사용자에게만 특정 속성을 보여주고 싶거나, 모든 JSON 표현에서 항상 특정 관계를 포함하고 싶을 수 있습니다. Eloquent의 리소스 클래스(Resource Class)를 활용하면 이러한 요구를 표현력 있고 쉽게 구현하여 모델 및 모델 컬렉션을 JSON으로 변환할 수 있습니다.

물론 Eloquent 모델이나 컬렉션의 `toJson` 메서드를 사용해서 JSON으로 변환할 수도 있지만, Eloquent 리소스를 사용하면 모델 및 그 관계의 JSON 직렬화 과정을 더 세밀하고 강력하게 제어할 수 있습니다.

<a name="generating-resources"></a>
## 리소스 생성하기

리소스 클래스를 생성하려면 `make:resource` Artisan 명령어를 사용할 수 있습니다. 기본적으로 리소스는 애플리케이션의 `app/Http/Resources` 디렉터리에 저장됩니다. 리소스 클래스는 `Illuminate\Http\Resources\Json\JsonResource` 클래스를 상속합니다:

```shell
php artisan make:resource UserResource
```

<a name="generating-resource-collections"></a>
#### 리소스 컬렉션

개별 모델을 변환하는 리소스 외에도, 모델의 컬렉션을 변환하는 전용 리소스를 생성할 수도 있습니다. 이를 통해 컬렉션 전체에 관련된 링크나 기타 메타 정보를 JSON 응답에 포함할 수 있습니다.

리소스 컬렉션을 생성하려면, 생성 시 `--collection` 플래그를 사용하거나, 리소스 이름에 `Collection`을 포함시키면 라라벨이 자동으로 컬렉션 리소스를 만듭니다. 컬렉션 리소스 클래스는 `Illuminate\Http\Resources\Json\ResourceCollection`을 상속합니다:

```shell
php artisan make:resource User --collection

php artisan make:resource UserCollection
```

<a name="concept-overview"></a>
## 개념 개요

> [!NOTE]
> 이 섹션은 리소스와 리소스 컬렉션의 개념에 대한 높은 수준의 개요입니다. 더 깊이 있는 이해와 다양한 커스터마이징 방법을 배우려면 아래의 다른 문서 섹션도 꼭 읽어보시기 바랍니다.

리소스를 작성할 때 제공되는 다양한 기능들을 살펴보기 전에, 먼저 라라벨에서 리소스를 어떻게 사용하는지 기본적인 구조를 살펴보겠습니다. 리소스 클래스는 JSON 구조로 변환되어야 하는 단일 모델을 나타냅니다. 아래는 간단한 `UserResource` 리소스 클래스의 예시입니다:

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

모든 리소스 클래스는 `toArray` 메서드를 정의하며, 이 메서드가 반환하는 배열은 라우트나 컨트롤러에서 리소스를 응답으로 반환할 때 JSON으로 변환됩니다.

여기에서 우리가 `$this`를 통해 모델의 속성에 바로 접근할 수 있다는 점에 주목해야 합니다. 이는 리소스 클래스가 편리하게 모델의 속성과 메서드에 접근할 수 있도록, 내부적으로 모델에 대한 프록시 역할을 하기 때문입니다. 리소스가 정의된 후에는, 라우트나 컨트롤러에서 해당 리소스를 생성하여 반환할 수 있습니다. 생성자에는 변환할 모델 인스턴스를 전달합니다:

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return new UserResource(User::findOrFail($id));
});
```

더 편리하게, 모델의 `toResource` 메서드를 사용할 수도 있습니다. 이 메서드는 프레임워크의 규약에 따라 해당 모델에 맞는 리소스를 자동으로 찾아 사용합니다:

```php
return User::findOrFail($id)->toResource();
```

`toResource` 메서드를 호출하면, 라라벨은 모델 이름과 일치하고, 필요에 따라 `Resource` 접미사가 붙은 리소스 클래스를 모델과 가장 가까운 `Http\Resources` 네임스페이스에서 찾으려고 시도합니다.

<a name="resource-collections"></a>
### 리소스 컬렉션

여러 리소스의 컬렉션이나 페이지네이션된 리소스를 반환해야 할 경우, 라우트나 컨트롤러에서 리소스 클래스의 `collection` 메서드를 사용하여 리소스 인스턴스를 생성할 수 있습니다:

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/users', function () {
    return UserResource::collection(User::all());
});
```

또는 더 편리하게, Eloquent 컬렉션의 `toResourceCollection` 메서드를 사용할 수도 있습니다. 이 메서드 역시 프레임워크의 규약에 따라 해당 모델에 적합한 리소스 컬렉션 클래스를 자동으로 찾아서 사용합니다:

```php
return User::all()->toResourceCollection();
```

`toResourceCollection` 메서드를 호출할 때, 라라벨은 모델 이름과 일치하고 `Collection` 접미사가 붙은 리소스 컬렉션 클래스를 모델과 가장 가까운 `Http\Resources` 네임스페이스에서 찾습니다.

<a name="custom-resource-collections"></a>
#### 커스텀 리소스 컬렉션

기본적으로 리소스 컬렉션에 추가적인 메타데이터를 포함할 수는 없습니다. 만약 컬렉션 응답에 커스텀 메타데이터를 추가하고 싶다면, 컬렉션을 표현하는 전용 리소스 클래스를 직접 생성할 수 있습니다:

```shell
php artisan make:resource UserCollection
```

리소스 컬렉션 클래스가 생성된 후, 응답에 포함할 메타데이터를 자유롭게 정의할 수 있습니다:

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

리소스 컬렉션을 정의한 뒤에는 라우트나 컨트롤러에서 바로 반환할 수 있습니다:

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::all());
});
```

또는 Eloquent 컬렉션의 `toResourceCollection` 메서드를 사용해도 됩니다. 이 방법 역시 프레임워크 규약을 따라 컬렉션 리소스를 자동으로 찾습니다:

```php
return User::all()->toResourceCollection();
```

`toResourceCollection` 메서드를 호출할 때는, 라라벨이 모델명과 일치하고 `Collection` 접미사가 붙은 리소스 컬렉션 클래스를 `Http\Resources` 네임스페이스에서 찾습니다.

<a name="preserving-collection-keys"></a>
#### 컬렉션 키 유지하기

라우트에서 리소스 컬렉션을 반환하면, 라라벨은 기본적으로 컬렉션의 키를 숫자형 순서로 재설정합니다. 하지만 컬렉션의 원본 키를 유지하고 싶다면, 리소스 클래스에 `preserveKeys` 속성을 추가하여 설정할 수 있습니다:

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

`preserveKeys` 속성을 `true`로 설정하면, 라우트나 컨트롤러에서 컬렉션을 반환할 때 키가 유지됩니다:

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/users', function () {
    return UserResource::collection(User::all()->keyBy->id);
});
```

<a name="customizing-the-underlying-resource-class"></a>
#### 기본 리소스 클래스 커스터마이징

일반적으로 리소스 컬렉션의 `$this->collection` 속성은 컬렉션의 각 항목을 단수형 리소스 클래스에 매핑한 결과로 자동 채워집니다. 여기서 단수형 리소스 클래스는 컬렉션 클래스 이름에서 마지막의 `Collection` 부분을 제거한 이름이 기본값입니다. 상황에 따라 단수형 리소스 클래스 이름에 `Resource` 접미사가 붙을 수도, 안 붙을 수도 있습니다.

예를 들어, `UserCollection`은 컬렉션 내 각 유저 인스턴스를 `UserResource` 리소스로 매핑하려 시도합니다. 이 동작을 변경하려면, 리소스 컬렉션의 `$collects` 속성을 오버라이드할 수 있습니다:

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
> 아직 [개념 개요](#concept-overview)를 읽지 않으셨다면, 이 문서를 진행하기 전에 반드시 읽어보시길 권장합니다.

리소스는 단순히 주어진 모델을 배열로 변환하면 충분합니다. 즉, 각 리소스는 `toArray` 메서드를 포함하며, 이 메서드는 모델의 속성을 API에 적합한 배열로 변환하여 라우트나 컨트롤러에서 반환할 수 있도록 합니다:

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

리소스가 정의되면, 라우트나 컨트롤러에서 바로 반환할 수 있습니다:

```php
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return User::findOrFail($id)->toUserResource();
});
```

<a name="relationships"></a>
#### 관계(Relationships)

응답에 관련된 리소스를 함께 포함하고 싶다면, 리소스의 `toArray` 메서드에서 반환하는 배열에 해당 리소스를 추가할 수 있습니다. 아래 예시에서는 `PostResource`의 `collection` 메서드를 이용하여 사용자의 블로그 게시글 데이터를 응답에 포함합니다:

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
> 관계를 이미 로드한 경우에만 응답에 포함하고 싶다면, [조건부 관계](#conditional-relationships) 문서를 참고하세요.

<a name="writing-resource-collections"></a>
#### 리소스 컬렉션

리소스는 단일 모델을 배열로 변환하는 데 사용되는 반면, 리소스 컬렉션은 모델의 컬렉션을 배열로 변환합니다. 각 모델마다 별도의 리소스 컬렉션 클래스를 반드시 만들 필요는 없습니다. 모든 Eloquent 모델 컬렉션에는 **즉석에서** 리소스 컬렉션을 생성해주는 `toResourceCollection` 메서드가 있습니다:

```php
use App\Models\User;

Route::get('/users', function () {
    return User::all()->toResourceCollection();
});
```

하지만 컬렉션에 커스텀 메타데이터를 추가하고 싶다면, 직접 리소스 컬렉션 클래스를 정의해야 합니다:

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

단수형 리소스와 마찬가지로, 리소스 컬렉션도 라우트나 컨트롤러에서 바로 반환할 수 있습니다:

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::all());
});
```

또는 Eloquent 컬렉션의 `toResourceCollection` 메서드를 사용할 수도 있습니다:

```php
return User::all()->toResourceCollection();
```

`toResourceCollection`을 사용할 때는, 라라벨이 모델명과 일치하고 `Collection` 접미사가 붙은 컬렉션 리소스 클래스를 `Http\Resources` 네임스페이스에서 찾게 됩니다.

<a name="data-wrapping"></a>
### 데이터 래핑

기본적으로, 리소스의 최상위 데이터는 응답이 JSON으로 변환될 때 `data` 키로 감싸집니다. 따라서 일반적인 리소스 컬렉션의 응답 예시는 다음과 같습니다:

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

만약 리소스의 최상위 래핑(`data` 키 삽입)을 원하지 않는다면, 기본 `Illuminate\Http\Resources\Json\JsonResource` 클래스의 `withoutWrapping` 메서드를 호출하면 됩니다. 일반적으로 이 메서드는 `AppServiceProvider`나 매 요청마다 로드되는 [서비스 프로바이더](/docs/providers)에서 호출해야 합니다:

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
> `withoutWrapping` 메서드는 최상위 응답에만 영향을 미치며, 직접 추가한 `data` 키는 제거되지 않습니다.

<a name="wrapping-nested-resources"></a>
#### 중첩 리소스 래핑

리소스의 관계가 어떻게 래핑되는지(데이터가 어떤 키로 감싸지는지)는 전적으로 자유롭게 결정할 수 있습니다. 모든 리소스 컬렉션이 중첩 수준과 상관없이 `data` 키로 감싸이길 원한다면, 각 리소스별로 리소스 컬렉션 클래스를 만들고 컬렉션을 `data` 키로 감싸서 반환하면 됩니다.

혹시 이렇게 하면 최상위 리소스에 `data` 키가 두 번 감싸지는 것이 아닌지 걱정할 수 있습니다. 하지만 걱정하실 필요 없습니다. 라라벨은 리소스가 실수로 이중 래핑되는 일이 없도록 항상 방지해주기 때문에, 리소스 컬렉션의 중첩 정도에 대해 신경 쓸 필요가 없습니다:

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
#### 데이터 래핑과 페이지네이션

페이지네이션된(페이지별로 나누어진) 컬렉션을 리소스 응답으로 반환할 때, `withoutWrapping` 메서드를 호출했더라도 라라벨은 최상위 리소스 데이터를 항상 `data` 키로 감싸게 됩니다. 이는 페이지네이션 응답에는 항상 `meta`와 `links` 키가 포함되어, 페이지네이터의 상태 정보를 제공하기 때문입니다:

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
### 페이지네이션

리소스의 `collection` 메서드나 커스텀 리소스 컬렉션에 Laravel 페이지네이터 인스턴스를 전달하면서, 페이지네이션된 응답을 만들 수 있습니다:

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::paginate());
});
```

또는 페이지네이터의 `toResourceCollection` 메서드를 사용할 수도 있습니다. 이 역시 프레임워크 규약에 따라 해당 모델의 리소스 컬렉션을 자동으로 찾아서 사용합니다:

```php
return User::paginate()->toResourceCollection();
```

페이지네이션 응답에는 항상 페이지네이터의 상태를 나타내는 `meta`와 `links` 키가 포함됩니다:

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
#### 페이지네이션 정보 커스터마이징

페이지네이션 응답의 `links` 또는 `meta` 키에 포함될 정보를 커스터마이징하고 싶다면, 리소스에 `paginationInformation` 메서드를 정의할 수 있습니다. 이 메서드는 `$paginated` 데이터와, 기본적으로 `links` 및 `meta` 키가 들어 있는 `$default` 배열을 파라미터로 받습니다:

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

특정 조건이 충족될 때만 리소스 응답에 속성을 포함하고 싶을 때가 있습니다. 예를 들어, 현재 사용자가 "관리자"일 때만 값을 포함하고 싶을 수 있습니다. 라라벨은 이럴 때 유용하게 쓸 수 있는 헬퍼 메서드를 여러 가지 제공합니다. `when` 메서드를 사용하면, 조건을 기준으로 속성을 응답에 포함시킬 수 있습니다:

```php
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
        'secret' => $this->when($request->user()->isAdmin(), 'secret-value'),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

이 예시에서 `secret` 키는 인증된 사용자의 `isAdmin` 메서드가 `true`를 반환할 때만 최종 리소스 응답에 포함됩니다. 만약 `false`이면, `secret` 키는 클라이언트로 전송되기 전에 리소스 응답에서 자동으로 제거됩니다. `when` 메서드를 사용하면 배열 구성 시 if 문 없이도 직관적으로 조건부 속성을 표현할 수 있습니다.

`when` 메서드의 두 번째 인자로 클로저를 넘길 수도 있어, 조건이 `true`일 때만 실제 값을 계산하도록 만들 수도 있습니다:

```php
'secret' => $this->when($request->user()->isAdmin(), function () {
    return 'secret-value';
}),
```

`whenHas` 메서드는 해당 속성이 실제로 모델에 존재할 때만 속성을 포함하도록 해줍니다:

```php
'name' => $this->whenHas('name'),
```

또한 `whenNotNull` 메서드는 속성 값이 null이 아닌 경우에만 응답에 포함시켜줍니다:

```php
'name' => $this->whenNotNull($this->name),
```

<a name="merging-conditional-attributes"></a>
#### 조건부 속성 병합하기

여러 속성이 동일한 조건 하에서만 응답에 포함되어야 한다면, `mergeWhen` 메서드를 사용할 수 있습니다. 이 메서드를 사용하면, 조건이 `true`일 때만 여러 속성들을 한 번에 응답에 포함시킬 수 있습니다:

```php
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
        $this->mergeWhen($request->user()->isAdmin(), [
            'first-secret' => 'value',
            'second-secret' => 'value',
        ]),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

여기서도 조건이 `false`일 경우 해당 속성들은 응답에서 제외됩니다.

> [!WARNING]
> `mergeWhen` 메서드는 문자열 키와 숫자 키가 혼합된 배열이나, 순차적이지 않은 숫자 키가 포함된 배열에서는 사용하면 안 됩니다.

<a name="conditional-relationships"></a>
### 조건부 관계(Conditional Relationships)

속성만이 아니라, 로드된 관계에 따라 조건적으로 데이터에 관계를 포함할 수도 있습니다. 즉, 관계가 모델에서 이미 로드되어 있을 때만 응답에 포함할 수 있습니다. 이를 활용하면 컨트롤러에서 어떤 관계를 로드할지 결정하고, 리소스에서는 실제로 로드된 관계만 포함시킬 수 있어, "N+1" 쿼리 문제를 효과적으로 피할 수 있습니다.

`whenLoaded` 메서드를 사용하면 관계가 로드되어 있을 때만 해당 관계 데이터가 포함되도록 만들 수 있습니다. 불필요한 관계 로드를 피하기 위해, 이 메서드에는 관계 자체가 아니라 관계 이름을 넘깁니다:

```php
use App\Http\Resources\PostResource;

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
        'posts' => PostResource::collection($this->whenLoaded('posts')),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

이 예제에서 만약 해당 관계가 로드되어 있지 않다면, `posts` 키는 응답에서 제거됩니다.

<a name="conditional-relationship-counts"></a>
#### 관계 카운트의 조건부 포함

관계 자체뿐만 아니라, 관계의 개수(카운트)를 조건적으로 포함하고자 할 때도 있습니다. 모델에서 해당 관계의 카운트가 로드되어 있을 때 이를 응답에 포함시킬 수 있습니다:

```php
new UserResource($user->loadCount('posts'));
```

`whenCounted` 메서드는 관계의 카운트가 있을 때만 응답에 포함시켜줍니다. 카운트가 없는 경우에는 속성이 추가되지 않습니다:

```php
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
        'posts_count' => $this->whenCounted('posts'),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

이 예제에서 `posts` 관계의 카운트가 로드되지 않았다면, `posts_count` 키는 응답에서 빠집니다.

`avg`, `sum`, `min`, `max`와 같은 다른 집계(aggregate) 값들은 `whenAggregated` 메서드를 사용해 조건적으로 포함할 수 있습니다:

```php
'words_avg' => $this->whenAggregated('posts', 'words', 'avg'),
'words_sum' => $this->whenAggregated('posts', 'words', 'sum'),
'words_min' => $this->whenAggregated('posts', 'words', 'min'),
'words_max' => $this->whenAggregated('posts', 'words', 'max'),
```

<a name="conditional-pivot-information"></a>
#### 조건부 Pivot(중간 테이블) 정보 포함

관계 정보 외에도, 다대다(many-to-many) 관계의 중간 테이블에서 나오는 데이터를 조건적으로 포함시킬 수도 있습니다. `whenPivotLoaded` 메서드를 사용하면, 첫 번째 인자로 피벗 테이블 명을 전달하고, 두 번째 인자로는 사용할 값을 반환하는 클로저를 넘깁니다. 해당 피벗 정보가 모델에 존재할 때에만 클로저의 값이 응답에 포함됩니다:

```php
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
        'expires_at' => $this->whenPivotLoaded('role_user', function () {
            return $this->pivot->expires_at;
        }),
    ];
}
```

관계가 [커스텀 중간 테이블 모델](/docs/eloquent-relationships#defining-custom-intermediate-table-models)을 사용하는 경우, `whenPivotLoaded`의 첫 번째 인자로 해당 모델 인스턴스를 전달하면 됩니다:

```php
'expires_at' => $this->whenPivotLoaded(new Membership, function () {
    return $this->pivot->expires_at;
}),
```

중간 테이블이 `pivot`이 아닌 다른 접근자(accessor)를 사용하는 경우, `whenPivotLoadedAs` 메서드를 활용할 수 있습니다:

```php
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
        'expires_at' => $this->whenPivotLoadedAs('subscription', 'role_user', function () {
            return $this->subscription->expires_at;
        }),
    ];
}
```

<a name="adding-meta-data"></a>
### 메타데이터 추가하기

일부 JSON API 표준에서는 리소스 또는 리소스 컬렉션 응답에 메타데이터를 추가해야 할 수 있습니다. 예를 들어, 해당 리소스나 관련 리소스의 `links` 정보나 리소스 자체에 대한 메타데이터 등이 있을 수 있습니다. 리소스에 추가적인 메타데이터를 반환하려면, `toArray` 메서드에 포함시키면 됩니다. 예를 들어, 리소스 컬렉션 변환 시 `links` 정보를 다음과 같이 포함할 수 있습니다:

```php
/**
 * Transform the resource into an array.
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

추가적으로 리소스에서 메타데이터를 반환할 때, 라라벨이 페이지네이션 응답에 자동으로 추가하는 `links`나 `meta` 키와 충돌할 걱정을 할 필요는 없습니다. 사용자가 정의한 `links` 정보는 페이지네이터가 제공하는 링크와 병합됩니다.

<a name="top-level-meta-data"></a>
#### 최상위 메타데이터

리소스가 최상위 레벨로 반환될 때만 특정 메타데이터를 포함하고 싶을 때도 있습니다. 일반적으로 응답 전체에 대한 정보를 나타내는 메타데이터가 여기에 해당합니다. 이럴 땐, 리소스 클래스에 `with` 메서드를 추가하여, 해당 리소스가 최상위 리소스일 때에만 함께 반환될 데이터를 정의할 수 있습니다:

```php
<?php

namespace App\Http\Resources;

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
        return parent::toArray($request);
    }

    /**
     * Get additional data that should be returned with the resource array.
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
#### 리소스 생성 시 메타데이터 추가

라우트나 컨트롤러에서 리소스 인스턴스를 생성할 때 최상위 데이터를 추가하고 싶다면, 모든 리소스에서 사용할 수 있는 `additional` 메서드를 활용할 수 있습니다. 이 메서드는 응답에 추가할 데이터를 배열 형태로 받습니다:

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

앞서 보았듯이, 리소스는 라우트나 컨트롤러에서 바로 반환할 수 있습니다:

```php
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return User::findOrFail($id)->toResource();
});
```

그러나 때로는 클라이언트로 응답을 보내기 전에 HTTP 응답을 커스터마이징해야 할 수 있습니다. 이를 위해 두 가지 방법이 제공됩니다. 첫 번째는 리소스에 `response` 메서드를 체인(chain)으로 연결하는 방법입니다. 이 메서드는 `Illuminate\Http\JsonResponse` 인스턴스를 반환하므로, 응답 헤더를 완전히 제어할 수 있습니다:

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

또 다른 방법은, 리소스 클래스 내부에 `withResponse` 메서드를 정의하는 것입니다. 이 메서드는 해당 리소스가 응답에서 최상위로 반환될 때 호출됩니다:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\JsonResponse;
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
        ];
    }

    /**
     * Customize the outgoing response for the resource.
     */
    public function withResponse(Request $request, JsonResponse $response): void
    {
        $response->header('X-Value', 'True');
    }
}
```
