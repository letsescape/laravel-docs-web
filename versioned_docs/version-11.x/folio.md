# 라라벨 폴리오 (Laravel Folio)

- [소개](#introduction)
- [설치](#installation)
    - [페이지 경로 / URI](#page-paths-uris)
    - [서브도메인 라우팅](#subdomain-routing)
- [라우트 생성](#creating-routes)
    - [중첩 라우트](#nested-routes)
    - [인덱스 라우트](#index-routes)
- [라우트 파라미터](#route-parameters)
- [라우트 모델 바인딩](#route-model-binding)
    - [소프트 삭제된 모델](#soft-deleted-models)
- [렌더 후크](#render-hooks)
- [네임드 라우트](#named-routes)
- [미들웨어](#middleware)
- [라우트 캐싱](#route-caching)

<a name="introduction"></a>
## 소개

[Laravel Folio](https://github.com/laravel/folio)는 라라벨 애플리케이션에서 라우팅을 더욱 쉽게 만들어주는 강력한 페이지 기반 라우터입니다. Laravel Folio를 사용하면, 단순히 애플리케이션의 `resources/views/pages` 디렉터리에 Blade 템플릿을 생성하는 것만으로도 쉽고 빠르게 라우트를 추가할 수 있습니다.

예를 들어, `/greeting` 경로에서 접근할 수 있는 페이지를 만들고 싶다면, `resources/views/pages` 디렉터리에 `greeting.blade.php` 파일을 만들어 주세요.

```php
<div>
    Hello World
</div>
```

<a name="installation"></a>
## 설치

우선, Composer 패키지 관리자를 이용해 Folio를 프로젝트에 설치합니다.

```bash
composer require laravel/folio
```

Folio 설치 후, `folio:install` 아티즌 명령어를 실행하면 Folio의 서비스 프로바이더가 애플리케이션에 등록됩니다. 이 서비스 프로바이더는 Folio가 라우트/페이지를 탐색할 디렉터리를 설정합니다.

```bash
php artisan folio:install
```

<a name="page-paths-uris"></a>
### 페이지 경로 / URI

기본적으로 Folio는 애플리케이션의 `resources/views/pages` 디렉터리에서 페이지를 제공합니다. 하지만 이 디렉터리는 Folio의 서비스 프로바이더 `boot` 메서드에서 자유롭게 커스터마이즈할 수 있습니다.

예를 들어, 하나의 라라벨 애플리케이션에서 여러 Folio 경로를 지정하고 싶을 때가 있습니다. 예를 들어, 애플리케이션의 "admin" 영역을 위한 별도의 Folio 페이지 디렉터리를 만들고, 나머지 페이지용 디렉터리와 분리할 수 있습니다.

이럴 때는 `Folio::path`와 `Folio::uri` 메서드를 활용합니다. `path` 메서드는 Folio가 HTTP 요청을 라우팅할 때 페이지를 탐색하는 디렉터리를 등록하며, `uri` 메서드는 해당 페이지 디렉터리가 사용할 "기본 URI"를 지정합니다.

```php
use Laravel\Folio\Folio;

Folio::path(resource_path('views/pages/guest'))->uri('/');

Folio::path(resource_path('views/pages/admin'))
    ->uri('/admin')
    ->middleware([
        '*' => [
            'auth',
            'verified',

            // ...
        ],
    ]);
```

<a name="subdomain-routing"></a>
### 서브도메인 라우팅

들어오는 요청의 서브도메인에 따라 페이지 디렉터리를 분리하여 라우팅할 수도 있습니다. 예를 들어, `admin.example.com`에서 오는 요청은 다른 Folio 페이지 디렉터리로 라우팅하고 싶을 때가 있습니다. 이 경우에는 `Folio::path` 메서드 뒤에 `domain` 메서드를 체이닝하면 됩니다.

```php
use Laravel\Folio\Folio;

Folio::domain('admin.example.com')
    ->path(resource_path('views/pages/admin'));
```

`domain` 메서드는 도메인이나 서브도메인 일부를 파라미터로 받아올 수도 있습니다. 이 파라미터들은 페이지 템플릿으로 주입됩니다.

```php
use Laravel\Folio\Folio;

Folio::domain('{account}.example.com')
    ->path(resource_path('views/pages/admin'));
```

<a name="creating-routes"></a>
## 라우트 생성

Folio 라우트는 Folio가 마운트한 디렉터리 중 하나에 Blade 템플릿을 추가하는 것만으로 생성할 수 있습니다. 기본적으로 Folio는 `resources/views/pages` 디렉터리를 마운트하지만, 앞서 말한 것처럼 서비스 프로바이더의 `boot` 메서드에서 자유롭게 바꿀 수 있습니다.

이렇게 Folio 디렉터리에 Blade 템플릿을 추가하면 곧바로 브라우저에서 해당 경로로 접근할 수 있습니다. 예를 들어, `pages/schedule.blade.php` 파일을 만들면 브라우저에서 `http://example.com/schedule`로 접근할 수 있습니다.

모든 Folio 페이지/라우트 목록을 빠르게 확인하려면, 다음과 같이 `folio:list` 아티즌 명령어를 실행하면 됩니다.

```bash
php artisan folio:list
```

<a name="nested-routes"></a>
### 중첩 라우트

Folio 디렉터리 안에 하위 디렉터리를 만들어 중첩 라우트를 만들 수도 있습니다. 예를 들어, `/user/profile` 경로로 접근하는 페이지를 만들고 싶다면, `pages/user` 디렉터리 내에 `profile.blade.php` 템플릿을 생성하세요.

```bash
php artisan folio:page user/profile

# pages/user/profile.blade.php → /user/profile
```

<a name="index-routes"></a>
### 인덱스 라우트

특정 디렉터리의 "인덱스" 페이지 역할을 하는 페이지를 만들고 싶을 때가 있습니다. 이 경우, 해당 Folio 디렉터리에 `index.blade.php` 템플릿을 추가하면, 해당 디렉터리의 루트 경로로 들어오는 모든 요청이 이 페이지로 라우팅됩니다.

```bash
php artisan folio:page index
# pages/index.blade.php → /

php artisan folio:page users/index
# pages/users/index.blade.php → /users
```

<a name="route-parameters"></a>
## 라우트 파라미터

실제 개발에서는 URL의 일부를 파라미터로 받아 해당 값에 따라 동적으로 동작해야 할 상황이 자주 있습니다. 예를 들어, 특정 유저의 프로필을 보여주는 페이지에서 "ID" 값을 받아와야 할 수 있습니다. 이를 위해, 페이지 파일명 일부를 대괄호로 감싸면 Folio가 해당 부분을 파라미터로 캡쳐하여 전달해 줍니다.

```bash
php artisan folio:page "users/[id]"

# pages/users/[id].blade.php → /users/1
```

캡쳐된 파라미터는 Blade 템플릿 내에서 변수로 바로 사용할 수 있습니다.

```html
<div>
    User {{ $id }}
</div>
```

여러 개의 경로 세그먼트를 한 번에 캡쳐하려면, 대괄호 앞에 점 세 개(`...`)를 추가합니다.

```bash
php artisan folio:page "users/[...ids]"

# pages/users/[...ids].blade.php → /users/1/2/3
```

여러 세그먼트를 캡쳐하면, 해당 변수는 배열로 페이지에 전달됩니다.

```html
<ul>
    @foreach ($ids as $id)
        <li>User {{ $id }}</li>
    @endforeach
</ul>
```

<a name="route-model-binding"></a>
## 라우트 모델 바인딩

페이지 템플릿 파일명에서 일부를 와일드카드로 사용하고, 그 이름이 애플리케이션의 Eloquent 모델과 일치한다면, Folio는 라라벨의 라우트 모델 바인딩 기능을 활용해 해당 Eloquent 인스턴스를 자동으로 주입해줍니다.

```bash
php artisan folio:page "users/[User]"

# pages/users/[User].blade.php → /users/1
```

바인딩된 모델은 Blade 템플릿 내에서 변수로 사용할 수 있습니다. 이때 모델의 변수명은 "카멜 케이스(camel case)"로 변환됩니다.

```html
<div>
    User {{ $user->id }}
</div>
```

#### 키 값 커스터마이즈

경우에 따라, `id`가 아닌 다른 컬럼 값으로 Eloquent 모델을 조회하고 싶을 수 있습니다. 이런 경우에는 파일명에 모델명 다음에 사용할 컬럼을 `:`로 구분하여 지정하면 됩니다. 예를 들어, `[Post:slug].blade.php` 파일은 `id` 대신 `slug` 컬럼 값을 사용하여 모델을 바인딩합니다.

Windows 환경에서는 `:` 대신 `-`를 쓸 수 있습니다: `[Post-slug].blade.php`.

#### 모델 위치 지정

기본적으로 Folio는 모델을 애플리케이션의 `app/Models` 디렉터리 안에서 찾습니다. 하지만 필요하다면, 템플릿 파일명에 완전한 네임스페이스를 적어줄 수도 있습니다.

```bash
php artisan folio:page "users/[.App.Models.User]"

# pages/users/[.App.Models.User].blade.php → /users/1
```

<a name="soft-deleted-models"></a>
### 소프트 삭제된 모델

기본적으로, 소프트 삭제된 모델은 암묵적 모델 바인딩으로 가져오지 않습니다. 하지만, 원한다면 페이지 템플릿 안에서 `withTrashed` 함수를 호출해 소프트 삭제된 모델도 가져올 수 있습니다.

```php
<?php

use function Laravel\Folio\{withTrashed};

withTrashed();

?>

<div>
    User {{ $user->id }}
</div>
```

<a name="render-hooks"></a>
## 렌더 후크

기본적으로 Folio는 페이지 Blade 템플릿의 내용을 요청에 대한 응답으로 반환합니다. 하지만, 필요하다면 페이지 템플릿 내부에서 `render` 함수를 호출해 응답을 자유롭게 커스터마이즈할 수 있습니다.

`render` 함수는 클로저를 인자로 받으며, 이 클로저에는 Folio가 렌더링한 `View` 인스턴스가 전달됩니다. 또, 라우트 파라미터나 모델 바인딩 값 등도 추가로 함께 인자로 전달됩니다. 이를 활용해 뷰에 추가 데이터를 넘기거나 응답 자체를 수정할 수 있습니다.

```php
<?php

use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

use function Laravel\Folio\render;

render(function (View $view, Post $post) {
    if (! Auth::user()->can('view', $post)) {
        return response('Unauthorized', 403);
    }

    return $view->with('photos', $post->author->photos);
}); ?>

<div>
    {{ $post->content }}
</div>

<div>
    이 작성자는 {{ count($photos) }}장의 사진도 올렸습니다.
</div>
```

<a name="named-routes"></a>
## 네임드 라우트

특정 페이지 라우트에 이름을 부여하고 싶다면, `name` 함수를 사용하면 됩니다.

```php
<?php

use function Laravel\Folio\name;

name('users.index');
```

라라벨의 네임드 라우트와 마찬가지로, `route` 함수를 사용해 이름이 지정된 Folio 페이지로의 URL을 손쉽게 생성할 수 있습니다.

```php
<a href="{{ route('users.index') }}">
    All Users
</a>
```

페이지에 파라미터가 필요하다면, `route` 함수에 그 값을 넘기면 됩니다.

```php
route('users.show', ['user' => $user]);
```

<a name="middleware"></a>
## 미들웨어

특정 페이지에만 미들웨어를 적용하려면, 해당 페이지의 템플릿 내부에서 `middleware` 함수를 호출하세요.

```php
<?php

use function Laravel\Folio\{middleware};

middleware(['auth', 'verified']);

?>

<div>
    Dashboard
</div>
```

또한 다수의 페이지에 미들웨어를 적용하려면, `Folio::path` 메서드 이후에 `middleware` 메서드를 체이닝해서 사용할 수도 있습니다.

어떤 페이지에 어떤 미들웨어를 적용할 지를 URL 패턴별로 배열의 키로 지정할 수 있으며, `*`는 와일드카드로 사용됩니다.

```php
use Laravel\Folio\Folio;

Folio::path(resource_path('views/pages'))->middleware([
    'admin/*' => [
        'auth',
        'verified',

        // ...
    ],
]);
```

미들웨어 배열에 클로저를 포함시켜, 인라인(익명) 미들웨어를 지정할 수도 있습니다.

```php
use Closure;
use Illuminate\Http\Request;
use Laravel\Folio\Folio;

Folio::path(resource_path('views/pages'))->middleware([
    'admin/*' => [
        'auth',
        'verified',

        function (Request $request, Closure $next) {
            // ...

            return $next($request);
        },
    ],
]);
```

<a name="route-caching"></a>
## 라우트 캐싱

Folio를 사용할 때는 [라라벨의 라우트 캐싱 기능](/docs/11.x/routing#route-caching)을 꼭 활용해야 합니다. Folio는 `route:cache` 아티즌 명령어를 감지하여, Folio 페이지 정의와 라우트 이름이 최대한 빠르게 동작할 수 있도록 제대로 캐싱됩니다.