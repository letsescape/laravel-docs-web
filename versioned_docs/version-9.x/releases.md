# 릴리즈 노트 (Release Notes)

- [버전 관리 체계](#versioning-scheme)
- [지원 정책](#support-policy)
- [라라벨 9](#laravel-9)

<a name="versioning-scheme"></a>
## 버전 관리 체계

라라벨과 그 외 공식 패키지들은 [시맨틱 버저닝](https://semver.org)을 따릅니다. 주요 프레임워크 릴리즈는 매년(약 2월경) 한 번씩 진행되며, 마이너 또는 패치 릴리즈는 매주 출시될 수 있습니다. 마이너 및 패치 릴리즈에는 **절대** 호환성 문제를 일으키는 변경 사항이 포함되지 않습니다.

애플리케이션이나 패키지에서 라라벨 프레임워크 또는 그 컴포넌트를 참조할 때는 항상 `^9.0` 과 같은 버전 제약을 사용해야 합니다. 이는 라라벨의 주요 버전 업그레이드에서는 호환성 깨짐(breaking changes)이 발생할 수 있기 때문입니다. 하지만, 주요 버전으로 업그레이드할 때도 하루 이내로 마이그레이션할 수 있도록 최대한 노력하고 있습니다.

<a name="named-arguments"></a>
#### 네임드 인수(Named Arguments)

[네임드 인수](https://www.php.net/manual/en/functions.arguments.php#functions.named-arguments)는 라라벨의 하위 호환성 보장 정책에 포함되지 않습니다. 라라벨 코드베이스의 품질 향상을 위해 필요시 함수 인수명을 변경할 수 있습니다. 따라서, 라라벨의 메서드를 호출할 때 네임드 인수를 사용할 경우, 향후 인수명이 변경될 수 있음을 염두에 두고 주의해서 사용해야 합니다.

<a name="support-policy"></a>
## 지원 정책

모든 라라벨 릴리즈는 18개월간 버그 수정, 2년간 보안 패치가 제공됩니다. Lumen을 포함한 모든 추가 라이브러리에서는 최신 주요 버전만이 버그 수정을 받습니다. 또한, 라라벨이 지원하는 데이터베이스 버전도 반드시 [이 문서](/docs/9.x/database#introduction)에서 확인해 주세요.

| 버전 | PHP (*) | 릴리즈 | 버그 수정 지원 종료 | 보안 패치 지원 종료 |
| --- | --- | --- | --- | --- |
| 6 (LTS) | 7.2 - 8.0 | 2019년 9월 3일 | 2022년 1월 25일 | 2022년 9월 6일 |
| 7 | 7.2 - 8.0 | 2020년 3월 3일 | 2020년 10월 6일 | 2021년 3월 3일 |
| 8 | 7.3 - 8.1 | 2020년 9월 8일 | 2022년 7월 26일 | 2023년 1월 24일 |
| 9 | 8.0 - 8.2 | 2022년 2월 8일 | 2023년 8월 8일 | 2024년 2월 6일 |
| 10 | 8.1 - 8.3 | 2023년 2월 14일 | 2024년 8월 6일 | 2025년 2월 4일 |

(*) 지원되는 PHP 버전

<a name="laravel-9"></a>
## 라라벨 9

알고 계시듯, 라라벨은 라라벨 8 릴리즈부터 연 1회 주요 버전 출시 정책으로 전환하였습니다. 이전에는 6개월마다 주요 버전이 출시되었습니다. 이 전환의 목적은 커뮤니티의 유지 보수 부담을 덜고, 개발팀이 기존에 호환성 문제 없이 멋진 신규 기능을 더 자주 추가할 수 있도록 하기 위함입니다. 실제로 라라벨 8에서도 병렬 테스트 지원, Breeze 스타터 킷 개선, HTTP 클라이언트 개선, "has one of many" 등 새로운 Eloquent 연관관계 유형 등 다양한 강력한 기능을 하위 호환성을 깨뜨리지 않고 제공했습니다.

따라서, 이 릴리즈 정책 아래에서는 향후 "주요" 릴리즈가 주로 상위 의존성 업그레이드 등 "유지 보수" 성격의 변경(주로 breaking change와 연관)만을 포함하는 형태가 될 가능성이 높습니다. 바로 이 점이 본 릴리즈 노트에도 반영되어 있습니다.

라라벨 9은 라라벨 8.x에서 도입된 개선 사항을 이어받아, Symfony 6.0 컴포넌트 및 Symfony Mailer 지원, Flysystem 3.0, 향상된 `route:list` 출력, Laravel Scout 데이터베이스 드라이버, 새로운 Eloquent Accessor·Mutator 문법, Enum을 활용한 암묵적(implicit) 라우트 바인딩, 기타 여러 버그 수정과 개발 편의성 개선 등을 제공합니다.

<a name="php-8"></a>
### PHP 8.0

라라벨 9.x를 사용하려면 최소 PHP 8.0 버전이 필요합니다.

<a name="symfony-mailer"></a>
### Symfony Mailer

_Symfony Mailer 지원은 [Dries Vints](https://github.com/driesvints)_, [James Brooks](https://github.com/jbrooksuk), [Julius Kiekbusch](https://github.com/Jubeki)이 기여하였습니다.

기존 라라벨 릴리즈에서는 [Swift Mailer](https://swiftmailer.symfony.com/docs/introduction.html) 라이브러리를 사용해 이메일을 발송했습니다. 하지만 Swift Mailer는 더 이상 유지보수가 되지 않으며, Symfony Mailer로 대체되었습니다.

애플리케이션이 Symfony Mailer와 호환되는지 확인하려면 [업그레이드 가이드](/docs/9.x/upgrade#symfony-mailer)를 참고해 주세요.

<a name="flysystem-3"></a>
### Flysystem 3.x

_Flysystem 3.x 지원은 [Dries Vints](https://github.com/driesvints)가 기여하였습니다._

라라벨 9.x는 Flysystem의 상위 의존성을 Flysystem 3.x로 업그레이드했습니다. Flysystem은 `Storage` 파사드를 통해 제공되는 모든 파일 시스템 기능의 핵심 역할을 합니다.

Flysystem 3.x와 호환되는지 확인하려면 [업그레이드 가이드](/docs/9.x/upgrade#flysystem-3)를 참고하세요.

<a name="eloquent-accessors-and-mutators"></a>
### 개선된 Eloquent Accessor / Mutator

_Eloquent Accessor/Mutator 개선은 [Taylor Otwell](https://github.com/taylorotwell)이 기여하였습니다._

라라벨 9.x는 Eloquent [Accessors와 Mutators](/docs/9.x/eloquent-mutators#accessors-and-mutators)를 정의하는 새로운 방법을 제공합니다. 이전에는 아래와 같이 접두사가 붙은 메서드를 통해서만 Accessor, Mutator를 정의할 수 있었습니다:

```php
public function getNameAttribute($value)
{
    return strtoupper($value);
}

public function setNameAttribute($value)
{
    $this->attributes['name'] = $value;
}
```

라라벨 9.x에서는 반환 타입을 `Illuminate\Database\Eloquent\Casts\Attribute`로 지정한, 접두사가 없는 단일 메서드로 Accessor와 Mutator를 함께 정의할 수 있습니다.

```php
use Illuminate\Database\Eloquent\Casts\Attribute;

public function name(): Attribute
{
    return new Attribute(
        get: fn ($value) => strtoupper($value),
        set: fn ($value) => $value,
    );
}
```

또한, 이 방식으로 정의된 Accessor는 반환된 객체 값이 [커스텀 캐스트 클래스](/docs/9.x/eloquent-mutators#custom-casts)처럼 캐싱됩니다.

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

public function address(): Attribute
{
    return new Attribute(
        get: fn ($value, $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
        set: fn (Address $value) => [
            'address_line_one' => $value->lineOne,
            'address_line_two' => $value->lineTwo,
        ],
    );
}
```

<a name="enum-casting"></a>
### Enum Eloquent 속성 캐스팅

> [!WARNING]
> Enum 캐스팅은 PHP 8.1 이상에서만 지원됩니다.

_Enum 캐스팅은 [Mohamed Said](https://github.com/themsaid)가 기여하였습니다._

이제 Eloquent에서 속성 값을 PHP ["백드(Backed) Enum"](https://www.php.net/manual/en/language.enumerations.backed.php)으로 캐스팅할 수 있도록 지원합니다. 사용하려면, 모델의 `$casts` 속성 배열에 해당 속성과 연결할 Enum 클래스를 지정해주면 됩니다.

```
use App\Enums\ServerStatus;

/**
 * The attributes that should be cast.
 *
 * @var array
 */
protected $casts = [
    'status' => ServerStatus::class,
];
```

캐스트가 지정되면 해당 속성은 Enum 인스턴스로 자동 변환되어 접근·저장할 수 있습니다.

```
if ($server->status == ServerStatus::Provisioned) {
    $server->status = ServerStatus::Ready;

    $server->save();
}
```

<a name="implicit-route-bindings-with-enums"></a>
### Enum을 사용한 암묵적 라우트 바인딩

_암묵적 Enum 바인딩은 [Nuno Maduro](https://github.com/nunomaduro)가 기여하였습니다._

PHP 8.1부터 [Enum](https://www.php.net/manual/en/language.enumerations.backed.php)이 도입되었습니다. 라라벨 9.x에서는 라우트 정의에 type-hint로 Enum을 지정하면, 해당 세그먼트가 Enum의 값 중 하나일 때만 라우트가 정상적으로 실행됩니다. 그렇지 않은 경우에는 자동으로 HTTP 404 응답이 반환됩니다. 예를 들어, 아래와 같은 Enum이 있다고 가정해봅시다:

```php
enum Category: string
{
    case Fruits = 'fruits';
    case People = 'people';
}
```

이 Enum을 사용해 `{category}` 구간이 "fruits" 또는 "people"일 때만 라우트가 실행됩니다. 그 외 값일 경우 자동으로 HTTP 404가 반환됩니다.

```php
Route::get('/categories/{category}', function (Category $category) {
    return $category->value;
});
```

<a name="forced-scoping-of-route-bindings"></a>
### 라우트 바인딩의 강제 스코핑

_강제 스코프 바인딩은 [Claudio Dekker](https://github.com/claudiodekker)가 기여하였습니다._

기존 라라벨에서는 중첩된 라우트 파라미터에서 두 번째 Eloquent 모델이 반드시 첫 번째 모델의 하위(자식)여야 할 때, 즉 특정 사용자의 특정 블로그 포스트를 slug로 조회하는 등의 상황에서 바인딩 스코프를 설정할 수 있었습니다:

```
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
});
```

이렇게 커스텀 키를 사용한 자식 바인딩에서는 부모와의 연관관계를 자동으로 추측해서 쿼리가 제한되었습니다. 하지만, 커스텀 키를 지정하지 않은 경우에는 이전 버전에서는 적용되지 않았습니다.

라라벨 9.x부터는 커스텀 키를 사용하지 않아도 "자식" 바인딩의 스코핑을 강제로 적용할 수 있습니다. 라우트 정의 시 `scopeBindings` 메서드를 호출하면 됩니다.

```
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
    return $post;
})->scopeBindings();
```

또는, 라우트 그룹 전체에 대해 스코프 바인딩을 적용할 수도 있습니다.

```
Route::scopeBindings()->group(function () {
    Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
        return $post;
    });
});
```

<a name="controller-route-groups"></a>
### 컨트롤러 라우트 그룹

_라우트 그룹 개선은 [Luke Downing](https://github.com/lukeraymonddowning)이 기여하였습니다._

이제 `controller` 메서드를 사용해 그룹 내 모든 라우트에 공통 컨트롤러를 지정할 수 있습니다. 각 라우트에서는 호출할 컨트롤러 메서드명만 명시하면 됩니다.

```
use App\Http\Controllers\OrderController;

Route::controller(OrderController::class)->group(function () {
    Route::get('/orders/{id}', 'show');
    Route::post('/orders', 'store');
});
```

<a name="full-text"></a>
### 전체 텍스트 인덱스 및 Where 절 지원

_전체 텍스트 인덱스/where 절 기능은 [Taylor Otwell](https://github.com/taylorotwell), [Dries Vints](https://github.com/driesvints)가 기여하였습니다._

MySQL 또는 PostgreSQL을 사용할 때, 칼럼 정의에 `fullText` 메서드를 추가해 전체 텍스트 인덱스를 생성할 수 있습니다.

```
$table->text('bio')->fullText();
```

또한, `whereFullText`, `orWhereFullText` 메서드를 사용하면 전체 텍스트 인덱스가 설정된 칼럼에 쿼리할 수 있습니다. 이 메서드는 데이터베이스 종류에 맞는 SQL로 자동 변환됩니다. 예를 들어 MySQL에선 아래와 같이 `MATCH AGAINST` 구문이 사용됩니다.

```
$users = DB::table('users')
           ->whereFullText('bio', 'web developer')
           ->get();
```

<a name="laravel-scout-database-engine"></a>
### Laravel Scout 데이터베이스 엔진

_Laravel Scout 데이터베이스 엔진 지원은 [Taylor Otwell](https://github.com/taylorotwell), [Dries Vints](https://github.com/driesvints)가 기여하였습니다._

애플리케이션에서 소규모~중간 규모의 데이터베이스를 사용하거나, 워크로드가 적을 경우, 별도의 검색 엔진(예: Algolia, MeiliSearch) 대신 Scout의 "database" 엔진을 사용할 수 있습니다. 이 엔진은 기존 데이터베이스에서 "where like" 쿼리 및 전체 텍스트 인덱스를 이용해 검색 결과를 필터링합니다.

Scout 데이터베이스 엔진에 대한 자세한 내용은 [공식 문서](/docs/9.x/scout)를 참고하세요.

<a name="rendering-inline-blade-templates"></a>
### 인라인 Blade 템플릿 렌더링

_인라인 Blade 템플릿 렌더링 기능은 [Jason Beggs](https://github.com/jasonlbeggs), 인라인 Blade 컴포넌트 렌더링 기능은 [Toby Zerner](https://github.com/tobyzerner)가 기여하였습니다._

가끔 Blade 템플릿 문자열을 HTML로 변환해야 할 때가 있습니다. `Blade` 파사드의 `render` 메서드를 사용하면 이를 쉽게 구현할 수 있습니다. `render`는 Blade 템플릿 문자열과, 선택적으로 해당 템플릿에 전달할 데이터 배열을 인자로 받습니다.

```php
use Illuminate\Support\Facades\Blade;

return Blade::render('Hello, {{ $name }}', ['name' => 'Julian Bashir']);
```

비슷하게, `renderComponent` 메서드를 사용하면 클래스 컴포넌트 인스턴스를 전달하여 렌더할 수 있습니다.

```php
use App\View\Components\HelloComponent;

return Blade::renderComponent(new HelloComponent('Julian Bashir'));
```

<a name="slot-name-shortcut"></a>
### 슬롯 이름 단축 문법

_슬롯 이름 단축 문법은 [Caleb Porzio](https://github.com/calebporzio)가 기여하였습니다._

이전에는 `x-slot` 태그의 `name` 속성으로 슬롯 이름을 지정해야 했습니다.

```blade
<x-alert>
    <x-slot name="title">
        Server Error
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

라라벨 9.x부터는 아래와 같이 더 간결하게 슬롯 이름을 지정할 수 있습니다.

```xml
<x-slot:title>
    Server Error
</x-slot>
```

<a name="checked-selected-blade-directives"></a>
### @checked / @selected Blade 지시어

_@checked 및 @selected Blade 지시어는 [Ash Allen](https://github.com/ash-jc-allen), [Taylor Otwell](https://github.com/taylorotwell)이 기여하였습니다._

이제 `@checked` 지시어를 사용해, HTML 체크박스 인풋이 체크되어 있는지 쉽게 표현할 수 있습니다. 지정한 조건이 `true`이면 `checked`가 자동으로 출력됩니다.

```blade
<input type="checkbox"
        name="active"
        value="active"
        @checked(old('active', $user->active)) />
```

마찬가지로, `@selected` 지시어는 `<select>` 옵션이 선택되어야 하는지 쉽게 지정할 수 있습니다.

```blade
<select name="version">
    @foreach ($product->versions as $version)
        <option value="{{ $version }}" @selected(old('version') == $version)>
            {{ $version }}
        </option>
    @endforeach
</select>
```

<a name="bootstrap-5-pagination-views"></a>
### Bootstrap 5 페이지네이션 뷰

_Bootstrap 5 페이지네이션 뷰는 [Jared Lewis](https://github.com/jrd-lewis)가 기여하였습니다._

라라벨은 이제 [Bootstrap 5](https://getbootstrap.com/)로 구현된 페이지네이션 뷰도 기본 제공합니다. 기본 Tailwind 뷰 대신 이를 사용하려면 `App\Providers\AppServiceProvider` 클래스의 `boot` 메서드에서 paginator의 `useBootstrapFive` 메서드를 호출하면 됩니다.

```
use Illuminate\Pagination\Paginator;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Paginator::useBootstrapFive();
}
```

<a name="improved-validation-of-nested-array-data"></a>
### 중첩된 배열 데이터의 유효성 검사 향상

_중첩 배열 입력에 대한 유효성 검사 개선은 [Steve Bauman](https://github.com/stevebauman)이 기여하였습니다._

유효성 검사 규칙에서 중첩 배열 요소의 값을 참조해야 할 때가 있습니다. 이제 `Rule::forEach` 메서드를 사용해 이런 유효성 검사를 쉽게 구현할 수 있습니다. `forEach`는 배열 요소마다 클로저를 호출하며, 해당 요소의 값과 완전한 속성명을 인자로 전달합니다. 클로저는 반환된 배열에 해당 요소에 적용할 규칙을 명시합니다.

```
use App\Rules\HasPermission;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

$validator = Validator::make($request->all(), [
    'companies.*.id' => Rule::forEach(function ($value, $attribute) {
        return [
            Rule::exists(Company::class, 'id'),
            new HasPermission('manage-company', $value),
        ];
    }),
]);
```

<a name="laravel-breeze-api"></a>
### Laravel Breeze API & Next.js

_Laravel Breeze API 스캐폴딩과 Next.js 스타터 킷은 [Taylor Otwell](https://github.com/taylorotwell), [Miguel Piedrafita](https://twitter.com/m1guelpf)가 기여하였습니다._

[라라벨 Breeze](/docs/9.x/starter-kits#breeze-and-next) 스타터 킷에 "API" 스캐폴딩 모드가 추가되었으며, 이를 활용한 [Next.js](https://nextjs.org) [프론트엔드 구현체](https://github.com/laravel/breeze-next)도 함께 제공됩니다. 이 스캐폴딩은 자바스크립트 프론트엔드와 Laravel Sanctum 인증 API로 백엔드를 구성하려는 프로젝트의 시작점으로 활용할 수 있습니다.

<a name="exception-page"></a>
### 개선된 Ignition 예외 페이지

_Ignition은 [Spatie](https://spatie.be/)에서 개발한 오픈소스 예외 디버깅 페이지입니다._

Ignition 예외 디버그 페이지가 완전히 새롭게 리디자인되었습니다. 새 버전은 라라벨 9.x에 기본 포함되며, 라이트/다크 테마, "에디터에서 열기" 기능 커스터마이즈 등 다양한 기능이 개선되었습니다.

<p align="center">
<img width="100%" src="https://user-images.githubusercontent.com/483853/149235404-f7caba56-ebdf-499e-9883-cac5d5610369.png"/>
</p>

<a name="improved-route-list"></a>
### 향상된 `route:list` CLI 출력

_향상된 `route:list` CLI 출력은 [Nuno Maduro](https://github.com/nunomaduro)가 기여하였습니다._

라라벨 9.x에서 `route:list` CLI 출력이 크게 개선되어, 라우트 정의를 더 직관적이고 아름답게 확인할 수 있게 되었습니다.

<p align="center">
<img src="https://user-images.githubusercontent.com/5457236/148321982-38c8b869-f188-4f42-a3cc-a03451d5216c.png"/>
</p>

<a name="test-coverage-support-on-artisan-test-Command"></a>
### Artisan `test` 명령어의 테스트 커버리지

_Artisan `test` 명령어의 테스트 커버리지 기능은 [Nuno Maduro](https://github.com/nunomaduro)가 기여하였습니다._

Artisan `test` 명령어에 `--coverage` 옵션이 추가되어, 테스트가 코드의 어느 부분까지 커버하는지 CLI에서 바로 확인할 수 있습니다.

```shell
php artisan test --coverage
```

테스트 커버리지 결과는 CLI 출력에 바로 표시됩니다.

<p align="center">
<img width="100%" src="https://user-images.githubusercontent.com/5457236/150133237-440290c2-3538-4d8e-8eac-4fdd5ec7bd9e.png"/>
</p>

또한, 테스트 커버리지 비율이 지정한 최소값에 미달하면 실패하도록 강제하는 `--min` 옵션도 제공합니다.

```shell
php artisan test --coverage --min=80.3
```

<p align="center">
<img width="100%" src="https://user-images.githubusercontent.com/5457236/149989853-a29a7629-2bfa-4bf3-bbf7-cdba339ec157.png"/>
</p>

<a name="soketi-echo-server"></a>
### Soketi Echo 서버

_Soketi Echo 서버는 [Alex Renoki](https://github.com/rennokki)가 개발하였습니다._

라라벨 9.x 전용 기능은 아니지만, 최근 라라벨에서는 Laravel Echo와 호환되는 Node.js 기반 Web Socket 서버인 Soketi의 문서화 작업에 기여하였습니다. Soketi는 푸셔(Pusher), Ably 등 상용 서비스 대신 자체적으로 Web Socket 서버를 운영하고 싶은 애플리케이션에 적합한 오픈소스 대안입니다.

Soketi 사용 방법은 [브로드캐스팅 공식 문서](/docs/9.x/broadcasting)와 [Soketi 공식 문서](https://docs.soketi.app/)를 참고하세요.

<a name="improved-collections-ide-support"></a>
### 컬렉션 IDE 지원 개선

_컬렉션 IDE 지원 개선은 [Nuno Maduro](https://github.com/nunomaduro)가 기여하였습니다._

라라벨 9.x는 컬렉션 컴포넌트에 "제너릭(Generic)" 스타일의 타입 정의가 추가되어, IDE와 정적 분석 도구에서 컬렉션 코드를 더욱 똑똑하게 지원합니다. [PHPStorm](https://blog.jetbrains.com/phpstorm/2021/12/phpstorm-2021-3-release/#support_for_future_laravel_collections)과 [PHPStan](https://phpstan.org) 같은 도구에서 더 뛰어난 코드 완성, 분석이 가능합니다.

<p align="center">
<img width="100%" src="https://user-images.githubusercontent.com/5457236/151783350-ed301660-1e09-44c1-b549-85c6db3f078d.gif"/>
</p>

<a name="new-helpers"></a>
### 신규 헬퍼 함수

라라벨 9.x에는 개발에 유용한 두 가지 신규 헬퍼 함수가 추가되었습니다.

<a name="new-helpers-str"></a>
#### `str`

`str` 함수는 주어진 문자열을 `Illuminate\Support\Stringable` 인스턴스로 반환합니다. 이는 `Str::of` 메서드와 동일합니다.

```
$string = str('Taylor')->append(' Otwell');

// 'Taylor Otwell'
```

인자를 생략하면 `str` 함수는 `Illuminate\Support\Str` 인스턴스를 반환합니다.

```
$snake = str()->snake('LaravelFramework');

// 'laravel_framework'
```

<a name="new-helpers-to-route"></a>
#### `to_route`

`to_route` 함수는 지정한 이름의 라우트로 리다이렉트하는 HTTP 응답을 생성합니다. 라우트 및 컨트롤러에서 명확하게 리다이렉트할 수 있도록 도와줍니다.

```
return to_route('users.show', ['user' => 1]);
```

필요하다면, 세 번째·네 번째 인자를 통해 리다이렉트 시 사용할 HTTP 상태 코드와 추가 응답 헤더도 지정할 수 있습니다.

```
return to_route('users.show', ['user' => 1], 302, ['X-Framework' => 'Laravel']);
```
