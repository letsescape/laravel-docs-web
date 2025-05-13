# 프롬프트 (Prompts)

- [소개](#introduction)
- [설치](#installation)
- [사용 가능한 프롬프트](#available-prompts)
    - [텍스트](#text)
    - [텍스트 영역](#textarea)
    - [비밀번호](#password)
    - [확인](#confirm)
    - [선택](#select)
    - [다중 선택](#multiselect)
    - [추천](#suggest)
    - [검색](#search)
    - [다중 검색](#multisearch)
    - [일시 정지](#pause)
- [유효성 검증 전 입력값 변환](#transforming-input-before-validation)
- [폼](#forms)
- [정보 메시지](#informational-messages)
- [테이블](#tables)
- [스핀](#spin)
- [진행 바](#progress)
- [터미널 초기화](#clear)
- [터미널 주의사항](#terminal-considerations)
- [지원되지 않는 환경 및 폴백](#fallbacks)

<a name="introduction"></a>
## 소개

[Laravel Prompts](https://github.com/laravel/prompts)는 커맨드라인 애플리케이션에 아름답고 사용자 친화적인 폼을 추가할 수 있도록 해주는 PHP 패키지입니다. 플레이스홀더 텍스트와 유효성 검증 등, 브라우저와 유사한 다양한 기능을 제공합니다.

<img src="https://laravel.com/img/docs/prompts-example.png"/>

Laravel Prompts는 [Artisan 콘솔 명령어](/docs/artisan#writing-commands)에서 사용자 입력을 받을 때 매우 적합하며, 그 외의 어떤 커맨드라인 PHP 프로젝트에서도 활용할 수 있습니다.

> [!NOTE]
> Laravel Prompts는 macOS, Linux, 그리고 WSL이 활성화된 Windows 환경을 지원합니다. 추가 정보는 [지원되지 않는 환경 및 폴백](#fallbacks) 문서를 확인하시기 바랍니다.

<a name="installation"></a>
## 설치

Laravel Prompts는 최신 버전의 Laravel에 기본적으로 포함되어 있습니다.

또한, Composer 패키지 매니저를 사용하여 다른 PHP 프로젝트에도 설치할 수 있습니다.

```shell
composer require laravel/prompts
```

<a name="available-prompts"></a>
## 사용 가능한 프롬프트

<a name="text"></a>
### 텍스트

`text` 함수를 사용하면 지정한 질문을 사용자에게 보여주고, 입력값을 받아 그 값을 반환합니다.

```php
use function Laravel\Prompts\text;

$name = text('What is your name?');
```

플레이스홀더 텍스트, 기본값, 그리고 부가적인 안내 메시지도 함께 표시할 수 있습니다.

```php
$name = text(
    label: 'What is your name?',
    placeholder: 'E.g. Taylor Otwell',
    default: $user?->name,
    hint: 'This will be displayed on your profile.'
);
```

<a name="text-required"></a>
#### 값 필수 입력

값 입력이 필수인 경우, `required` 인수를 전달하면 됩니다.

```php
$name = text(
    label: 'What is your name?',
    required: true
);
```

유효성 검증 메시지를 직접 지정하고 싶다면 문자열로 메시지를 전달할 수도 있습니다.

```php
$name = text(
    label: 'What is your name?',
    required: 'Your name is required.'
);
```

<a name="text-validation"></a>
#### 추가 유효성 검증

추가적인 유효성 검증 로직이 필요하다면, `validate` 인수에 클로저(익명 함수)를 전달할 수 있습니다.

```php
$name = text(
    label: 'What is your name?',
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

클로저에는 사용자가 입력한 값이 전달되며, 에러 메시지를 반환하거나 유효성 검증 통과 시 `null`을 반환하면 됩니다.

또는 Laravel의 [유효성 검증기](/docs/validation)를 활용할 수도 있습니다. 이 방법을 사용하려면, 속성명과 원하는 검증 규칙이 담긴 배열을 `validate` 인수에 전달하면 됩니다.

```php
$name = text(
    label: 'What is your name?',
    validate: ['name' => 'required|max:255|unique:users']
);
```

<a name="textarea"></a>
### 텍스트 영역

`textarea` 함수는 지정한 질문을 다중 줄 입력창으로 표시하고, 입력값을 받아서 반환합니다.

```php
use function Laravel\Prompts\textarea;

$story = textarea('Tell me a story.');
```

플레이스홀더 텍스트, 기본값, 그리고 안내 메시지를 함께 지정할 수도 있습니다.

```php
$story = textarea(
    label: 'Tell me a story.',
    placeholder: 'This is a story about...',
    hint: 'This will be displayed on your profile.'
);
```

<a name="textarea-required"></a>
#### 값 필수 입력

입력이 반드시 필요하다면 `required` 인수를 전달하면 됩니다.

```php
$story = textarea(
    label: 'Tell me a story.',
    required: true
);
```

검증 메시지를 커스터마이즈하고 싶다면 문자열을 사용할 수도 있습니다.

```php
$story = textarea(
    label: 'Tell me a story.',
    required: 'A story is required.'
);
```

<a name="textarea-validation"></a>
#### 추가 유효성 검증

더 복잡한 유효성 검증이 필요하다면, `validate` 인수에 클로저를 전달할 수 있습니다.

```php
$story = textarea(
    label: 'Tell me a story.',
    validate: fn (string $value) => match (true) {
        strlen($value) < 250 => 'The story must be at least 250 characters.',
        strlen($value) > 10000 => 'The story must not exceed 10,000 characters.',
        default => null
    }
);
```

클로저는 입력된 값을 받아서 에러 메시지나, 검증이 통과되면 `null`을 반환해야 합니다.

또는 Laravel의 [유효성 검증기](/docs/validation)를 사용할 수도 있습니다. 속성명과 검증 규칙의 배열을 `validate` 인수에 전달하면 됩니다.

```php
$story = textarea(
    label: 'Tell me a story.',
    validate: ['story' => 'required|max:10000']
);
```

<a name="password"></a>
### 비밀번호

`password` 함수는 `text` 함수와 유사하나, 터미널에 입력값이 표시되는 대신 입력값은 마스킹 처리됩니다. 이 기능은 비밀번호와 같이 민감한 정보를 입력받을 때 유용합니다.

```php
use function Laravel\Prompts\password;

$password = password('What is your password?');
```

플레이스홀더 텍스트와 안내 메시지도 제공할 수 있습니다.

```php
$password = password(
    label: 'What is your password?',
    placeholder: 'password',
    hint: 'Minimum 8 characters.'
);
```

<a name="password-required"></a>
#### 값 필수 입력

입력이 필수인 경우, `required` 인수를 넘겨서 설정할 수 있습니다.

```php
$password = password(
    label: 'What is your password?',
    required: true
);
```

유효성 메시지를 직접 지정하고 싶다면 문자열로 전달할 수도 있습니다.

```php
$password = password(
    label: 'What is your password?',
    required: 'The password is required.'
);
```

<a name="password-validation"></a>
#### 추가 유효성 검증

추가적인 유효성 검증이 필요하다면, `validate` 인수에 클로저를 전달할 수 있습니다.

```php
$password = password(
    label: 'What is your password?',
    validate: fn (string $value) => match (true) {
        strlen($value) < 8 => 'The password must be at least 8 characters.',
        default => null
    }
);
```

클로저에는 입력된 값이 전달되며, 에러 메시지 또는 검증이 통과될 경우 `null`을 반환해야 합니다.

또는 Laravel의 [유효성 검증기](/docs/validation)를 사용할 수도 있습니다. 속성명과 원하는 검증 규칙이 담긴 배열을 `validate` 인수로 전달하세요.

```php
$password = password(
    label: 'What is your password?',
    validate: ['password' => 'min:8']
);
```

<a name="confirm"></a>
### 확인

사용자에게 "예" 또는 "아니오"로 확인을 요청해야 할 때는 `confirm` 함수를 사용할 수 있습니다. 사용자는 방향키나 `y`, `n` 키를 사용해 응답을 선택할 수 있으며, 결과는 `true` 또는 `false`로 반환됩니다.

```php
use function Laravel\Prompts\confirm;

$confirmed = confirm('Do you accept the terms?');
```

기본값 지정, '예/아니오' 라벨 문구 변경, 그리고 안내 메시지도 함께 커스터마이즈할 수 있습니다.

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    default: false,
    yes: 'I accept',
    no: 'I decline',
    hint: 'The terms must be accepted to continue.'
);
```

<a name="confirm-required"></a>
#### "예" 응답 필수

필요하다면 사용자가 반드시 "예"를 선택하도록 `required` 인수를 전달할 수도 있습니다.

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    required: true
);
```

검증 메시지를 직접 입력하려면 문자열을 사용할 수 있습니다.

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    required: 'You must accept the terms to continue.'
);
```

<a name="select"></a>
### 선택

미리 정해진 선택지 중 하나를 사용자에게 고르게 하려면, `select` 함수를 사용할 수 있습니다.

```php
use function Laravel\Prompts\select;

$role = select(
    label: 'What role should the user have?',
    options: ['Member', 'Contributor', 'Owner']
);
```

기본 선택값과 안내 메시지도 지정할 수 있습니다.

```php
$role = select(
    label: 'What role should the user have?',
    options: ['Member', 'Contributor', 'Owner'],
    default: 'Owner',
    hint: 'The role may be changed at any time.'
);
```

선택지 배열에 연관 배열(associative array)을 전달하면, 실제로 반환되는 값은 선택된 키가 됩니다.

```php
$role = select(
    label: 'What role should the user have?',
    options: [
        'member' => 'Member',
        'contributor' => 'Contributor',
        'owner' => 'Owner',
    ],
    default: 'owner'
);
```

기본적으로 최대 5개의 옵션이 표시되고, 그 이상이면 스크롤이 생성됩니다. `scroll` 인수를 통해 이 값을 조정할 수 있습니다.

```php
$role = select(
    label: 'Which category would you like to assign?',
    options: Category::pluck('name', 'id'),
    scroll: 10
);
```

<a name="select-validation"></a>
#### 추가 유효성 검증

다른 프롬프트 함수들과 달리, `select` 함수는 선택하지 않는 것이 불가능하므로 `required` 인수를 지원하지 않습니다. 다만, 특정 옵션을 표시하되 선택하지 못하도록 하고 싶다면, `validate` 인수에 클로저를 사용할 수 있습니다.

```php
$role = select(
    label: 'What role should the user have?',
    options: [
        'member' => 'Member',
        'contributor' => 'Contributor',
        'owner' => 'Owner',
    ],
    validate: fn (string $value) =>
        $value === 'owner' && User::where('role', 'owner')->exists()
            ? 'An owner already exists.'
            : null
);
```

`options` 인자로 연관 배열이 전달된 경우 클로저로 선택된 키가 전달되고, 단순 배열일 경우에는 선택된 값이 전달됩니다. 클로저는 에러 메시지 또는 검증 통과 시 `null`을 반환해야 합니다.

<a name="multiselect"></a>
### 다중 선택

사용자가 여러 옵션을 선택할 수 있도록 하려면, `multiselect` 함수를 사용할 수 있습니다.

```php
use function Laravel\Prompts\multiselect;

$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: ['Read', 'Create', 'Update', 'Delete']
);
```

기본 선택 옵션과 안내 메시지도 함께 지정할 수 있습니다.

```php
use function Laravel\Prompts\multiselect;

$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: ['Read', 'Create', 'Update', 'Delete'],
    default: ['Read', 'Create'],
    hint: 'Permissions may be updated at any time.'
);
```

`options` 인자에 연관 배열을 전달하면, 선택된 옵션의 값 대신 키가 반환됩니다.

```php
$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: [
        'read' => 'Read',
        'create' => 'Create',
        'update' => 'Update',
        'delete' => 'Delete',
    ],
    default: ['read', 'create']
);
```

기본적으로 최대 5개의 옵션이 표시되며, 초과 시 목록에 스크롤이 생깁니다. `scroll` 인수로 이 값을 변경할 수 있습니다.

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    scroll: 10
);
```

<a name="multiselect-required"></a>
#### 값 필수 선택

기본적으로 사용자는 0개 이상의 옵션을 선택할 수 있습니다. 하지만, 1개 이상의 옵션 선택을 강제하려면 `required` 인수를 사용할 수 있습니다.

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    required: true
);
```

유효성 검증 메시지를 커스터마이즈하고 싶다면, 문자열을 `required` 인수로 전달하면 됩니다.

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    required: 'You must select at least one category'
);
```

<a name="multiselect-validation"></a>
#### 추가 유효성 검증

특정 옵션을 표시하되, 선택하지 못하도록 해야 하는 경우라면, `validate` 인수에 클로저를 전달할 수 있습니다.

```php
$permissions = multiselect(
    label: 'What permissions should the user have?',
    options: [
        'read' => 'Read',
        'create' => 'Create',
        'update' => 'Update',
        'delete' => 'Delete',
    ],
    validate: fn (array $values) => ! in_array('read', $values)
        ? 'All users require the read permission.'
        : null
);
```

`options` 인자가 연관 배열이면 클로저로 선택된 키 목록이 전달되고, 단순 배열이면 값 목록이 전달됩니다. 클로저는 에러 메시지 또는 검증이 통과되면 `null`을 반환해야 합니다.

<a name="suggest"></a>
### 추천

`suggest` 함수를 사용하면 자동완성 가능한 옵션 힌트를 제공할 수 있습니다. 사용자는 자동완성 힌트와 관계없이 자유롭게 답변을 입력할 수 있습니다.

```php
use function Laravel\Prompts\suggest;

$name = suggest('What is your name?', ['Taylor', 'Dayle']);
```

또는 두 번째 인수로 클로저를 전달할 수도 있습니다. 이 클로저는 사용자가 입력할 때마다 호출되며, 해당 시점까지의 입력값을 매개변수로 받아 자동완성 옵션의 배열을 반환해야 합니다.

```php
$name = suggest(
    label: 'What is your name?',
    options: fn ($value) => collect(['Taylor', 'Dayle'])
        ->filter(fn ($name) => Str::contains($name, $value, ignoreCase: true))
)
```

플레이스홀더 텍스트, 기본값, 안내 메시지 역시 함께 지정할 수 있습니다.

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    placeholder: 'E.g. Taylor',
    default: $user?->name,
    hint: 'This will be displayed on your profile.'
);
```

<a name="suggest-required"></a>
#### 값 필수 입력

입력을 반드시 요구하고 싶다면 `required` 인수를 전달하면 됩니다.

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    required: true
);
```

유효성 검증 메시지를 커스터마이즈하려면 문자열을 전달하세요.

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    required: 'Your name is required.'
);
```

<a name="suggest-validation"></a>
#### 추가 유효성 검증

추가적인 유효성 검증이 필요하다면 `validate` 인수에 클로저를 사용할 수 있습니다.

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

클로저로 입력값이 전달되어, 에러 메시지나 검증 통과 시 `null`을 반환하면 됩니다.

또는 Laravel의 [유효성 검증기](/docs/validation)를 활용하여, 속성명과 검증 규칙의 배열을 `validate` 인수에 넣어 사용할 수도 있습니다.

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    validate: ['name' => 'required|min:3|max:255']
);
```

<a name="search"></a>
### 검색

선택지 수가 많을 때, `search` 함수를 사용하여 사용자가 원하는 옵션을 검색어로 걸러낸 뒤, 방향키로 선택할 수 있습니다.

```php
use function Laravel\Prompts\search;

$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : []
);
```

클로저에는 사용자가 지금까지 입력한 검색어가 전달되며, 결과 옵션 배열을 반환해야 합니다. 연관 배열을 반환하면 선택 시 키가, 단순 배열을 반환하면 선택된 값이 반환됩니다.

배열에서 값을 반환할 때는, 배열이 연관 배열로 바뀌지 않도록 `array_values` 함수나 컬렉션의 `values` 메서드를 사용하는 것이 좋습니다.

```php
$names = collect(['Taylor', 'Abigail']);

$selected = search(
    label: 'Search for the user that should receive the mail',
    options: fn ($name) => $names
        ->filter(fn ($name) => Str::contains($name, $value, ignoreCase: true))
        ->values()
        ->all(),
);
```

플레이스홀더, 안내 메시지도 설정할 수 있습니다.

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    placeholder: 'E.g. Taylor Otwell',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    hint: 'The user will receive an email immediately.'
);
```

기본적으로 최대 5개의 옵션이 표시되며, 그 이상은 스크롤이 생성됩니다. `scroll` 인수로 조정할 수 있습니다.

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    scroll: 10
);
```

<a name="search-validation"></a>

#### 추가 유효성 검증

추가적인 유효성 검증 로직을 수행하고 싶다면, `validate` 인수에 클로저를 전달할 수 있습니다.

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    validate: function (int|string $value) {
        $user = User::findOrFail($value);

        if ($user->opted_out) {
            return 'This user has opted-out of receiving mail.';
        }
    }
);
```

`options` 클로저가 연관 배열을 반환하는 경우, 위의 클로저에는 선택된 키가 전달되고, 그렇지 않은 경우 선택된 값이 전달됩니다. 클로저는 오류 메시지를 반환하거나, 유효하다면 `null`을 반환할 수 있습니다.

<a name="multisearch"></a>
### 다중 검색(Multi-search)

검색 가능한 옵션이 매우 많아 사용자가 여러 항목을 선택할 수 있어야 한다면, `multisearch` 함수를 사용할 수 있습니다. 이 함수는 사용자가 검색어를 입력해 결과를 필터링한 후, 방향키와 스페이스바로 원하는 옵션을 선택하게 해줍니다.

```php
use function Laravel\Prompts\multisearch;

$ids = multisearch(
    'Search for the users that should receive the mail',
    fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : []
);
```

클로저에는 사용자가 지금까지 입력한 텍스트가 전달되며, 반드시 옵션 배열을 반환해야 합니다. 연관 배열을 반환하면 선택한 항목의 키가 반환되고, 순수 배열을 반환하면 값들이 반환됩니다.

값을 반환할 의도로 배열을 필터링할 때는, 배열이 연관 배열로 바뀌지 않도록 `array_values` 함수나 컬렉션의 `values` 메서드를 사용하는 것이 좋습니다.

```php
$names = collect(['Taylor', 'Abigail']);

$selected = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn ($name) => $names
        ->filter(fn ($name) => Str::contains($name, $value, ignoreCase: true))
        ->values()
        ->all(),
);
```

플레이스홀더 텍스트와 안내 메시지도 포함할 수 있습니다.

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    placeholder: 'E.g. Taylor Otwell',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    hint: 'The user will receive an email immediately.'
);
```

최대 다섯 개의 옵션이 표시되며, 목록이 이보다 많으면 스크롤이 적용됩니다. 이 기본값은 `scroll` 인수를 전달해 변경할 수 있습니다.

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    scroll: 10
);
```

<a name="multisearch-required"></a>
#### 값 선택 필수화

기본적으로 사용자는 옵션을 0개 이상 선택할 수 있습니다. 그러나 `required` 인수를 사용해 최소 한 개 이상 선택하도록 강제할 수 있습니다.

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    required: true
);
```

유효성 메시지를 맞춤화하고 싶다면 `required` 인수에 문자열을 전달할 수도 있습니다.

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    required: 'You must select at least one user.'
);
```

<a name="multisearch-validation"></a>
#### 추가 유효성 검증

추가적인 유효성 검증 로직이 필요하다면, `validate` 인수로 클로저를 전달할 수 있습니다.

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    validate: function (array $values) {
        $optedOut = User::whereLike('name', '%a%')->findMany($values);

        if ($optedOut->isNotEmpty()) {
            return $optedOut->pluck('name')->join(', ', ', and ').' have opted out.';
        }
    }
);
```

`options` 클로저가 연관 배열을 반환하는 경우, 위의 클로저에는 선택된 키 배열이 전달되고, 그렇지 않으면 값 배열이 전달됩니다. 클로저는 오류 메시지를 반환하거나, 유효하다면 `null`을 반환할 수 있습니다.

<a name="pause"></a>
### 일시 정지(Pause)

`pause` 함수는 사용자에게 안내 메시지를 보여주고, Enter(또는 Return) 키를 눌러 계속 진행할 의사가 있는지 확인하는 데 사용할 수 있습니다.

```php
use function Laravel\Prompts\pause;

pause('Press ENTER to continue.');
```

<a name="transforming-input-before-validation"></a>
## 유효성 검증 전 입력값 변형하기

종종 프롬프트로 입력된 값을 유효성 검증 전에 변형하고 싶을 수 있습니다. 예를 들어 문자열에서 공백을 제거하는 경우가 그렇습니다. 이를 위해 대부분의 프롬프트 함수는 `transform` 인수를 제공하며, 클로저를 받을 수 있습니다.

```php
$name = text(
    label: 'What is your name?',
    transform: fn (string $value) => trim($value),
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

<a name="forms"></a>
## 폼(Forms)

여러 개의 프롬프트를 순차적으로 표시하여 사용자로부터 정보를 모은 후 추가적인 작업을 수행해야 하는 경우가 많습니다. 이때 `form` 함수를 사용하여 하나의 폼 안에 여러 프롬프트를 묶어서 사용자에게 입력을 받을 수 있습니다.

```php
use function Laravel\Prompts\form;

$responses = form()
    ->text('What is your name?', required: true)
    ->password('What is your password?', validate: ['password' => 'min:8'])
    ->confirm('Do you accept the terms?')
    ->submit();
```

`submit` 메서드는 폼의 모든 프롬프트 응답을 숫자 인덱스로 된 배열로 반환합니다. 단, 각 프롬프트에 `name` 인수를 지정하면, 해당 이름을 키로 하여 응답에 접근할 수 있습니다.

```php
use App\Models\User;
use function Laravel\Prompts\form;

$responses = form()
    ->text('What is your name?', required: true, name: 'name')
    ->password(
        label: 'What is your password?',
        validate: ['password' => 'min:8'],
        name: 'password'
    )
    ->confirm('Do you accept the terms?')
    ->submit();

User::create([
    'name' => $responses['name'],
    'password' => $responses['password'],
]);
```

`form` 함수를 사용할 때의 주된 이점은 사용자가 `CTRL + U` 키를 이용해 이전 프롬프트로 돌아가서 실수나 선택을 수정할 수 있다는 점입니다. 덕분에 사용자는 전체 폼을 중단하고 처음부터 다시 작성하지 않아도 됩니다.

폼 안의 프롬프트를 더 세밀하게 제어할 필요가 있다면, 프롬프트 함수를 직접 호출하는 대신 `add` 메서드를 사용할 수 있습니다. 이때 `add`에는 지금까지 사용자가 입력한 모든 응답이 전달됩니다.

```php
use function Laravel\Prompts\form;
use function Laravel\Prompts\outro;
use function Laravel\Prompts\text;

$responses = form()
    ->text('What is your name?', required: true, name: 'name')
    ->add(function ($responses) {
        return text("How old are you, {$responses['name']}?");
    }, name: 'age')
    ->submit();

outro("Your name is {$responses['name']} and you are {$responses['age']} years old.");
```

<a name="informational-messages"></a>
## 정보 메시지

`note`, `info`, `warning`, `error`, `alert` 함수들은 사용자에게 정보성 메시지를 표시할 때 사용할 수 있습니다.

```php
use function Laravel\Prompts\info;

info('Package installed successfully.');
```

<a name="tables"></a>
## 테이블(Tables)

`table` 함수를 이용하면 여러 행과 열로 이루어진 데이터를 손쉽게 보여줄 수 있습니다. 컬럼 이름과 테이블 데이터를 전달하기만 하면 됩니다.

```php
use function Laravel\Prompts\table;

table(
    headers: ['Name', 'Email'],
    rows: User::all(['name', 'email'])->toArray()
);
```

<a name="spin"></a>
## 스피너(Spin)

`spin` 함수는 콜백이 실행되는 동안 선택적으로 메시지와 함께 스피너를 표시하여 작업이 진행 중임을 나타냅니다. 작업이 끝나면 콜백의 리턴값이 반환됩니다.

```php
use function Laravel\Prompts\spin;

$response = spin(
    message: 'Fetching response...',
    callback: fn () => Http::get('http://example.com')
);
```

> [!WARNING]
> `spin` 함수를 사용할 때는 스피너 애니메이션을 위해 `pcntl` PHP 확장 기능이 필요합니다. 만약 해당 확장 모듈이 없으면, 정적인 스피너가 대신 표시됩니다.

<a name="progress"></a>
## 진행바(Progress Bars)

오래 걸리는 작업에는 전체 작업이 어느 정도 완료되었는지 보여주면 사용자에게 유용합니다. `progress` 함수를 이용하면, 지정한 iterable 값을 반복할 때마다 진행바(progress bar)가 표시되고, 각 반복마다 진행 상태가 업데이트됩니다.

```php
use function Laravel\Prompts\progress;

$users = progress(
    label: 'Updating users',
    steps: User::all(),
    callback: fn ($user) => $this->performTask($user)
);
```

`progress` 함수는 map처럼 작동하며, 콜백의 각 반복 반환값을 배열로 반환합니다.

콜백은 `Laravel\Prompts\Progress` 인스턴스를 두 번째 인수로 받을 수도 있습니다. 이를 통해 각 반복마다 라벨과 힌트 메시지를 변경할 수 있습니다.

```php
$users = progress(
    label: 'Updating users',
    steps: User::all(),
    callback: function ($user, $progress) {
        $progress
            ->label("Updating {$user->name}")
            ->hint("Created on {$user->created_at}");

        return $this->performTask($user);
    },
    hint: 'This may take some time.'
);
```

진행바를 더 세밀하게 직접 제어해야 할 때도 있습니다. 이 경우, 먼저 반복할 전체 단계 수를 지정한 후, 각 아이템을 처리한 뒤 `advance` 메서드로 진행바를 수동으로 이동시킵니다.

```php
$progress = progress(label: 'Updating users', steps: 10);

$users = User::all();

$progress->start();

foreach ($users as $user) {
    $this->performTask($user);

    $progress->advance();
}

$progress->finish();
```

<a name="clear"></a>
## 터미널 화면 지우기

`clear` 함수를 사용하면 사용자의 터미널 화면을 지울 수 있습니다.

```php
use function Laravel\Prompts\clear;

clear();
```

<a name="terminal-considerations"></a>
## 터미널 관련 주의사항

<a name="terminal-width"></a>
#### 터미널 가로 너비

라벨, 옵션, 검증 메시지의 길이가 사용자의 터미널 열(column) 수를 초과하는 경우, 자동으로 잘려서 표시됩니다. 사용자가 좁은 터미널을 사용한다면 이러한 문자열의 길이를 최소화하는 것이 좋습니다. 일반적으로 80자 터미널을 기준으로 안전한 최대 길이는 74자입니다.

<a name="terminal-height"></a>
#### 터미널 세로 높이

`scroll` 인수를 받는 모든 프롬프트는, 해당 값이 터미널 크기에 맞춰 자동으로 줄어듭니다. 이때 유효성 메시지가 표시될 공간도 함께 고려됩니다.

<a name="fallbacks"></a>
## 지원되지 않는 환경과 폴백(Fallbacks)

Laravel Prompts는 macOS, Linux, Windows(WSL 환경)에서 지원됩니다. 다만, Windows용 PHP의 한계로 인해 WSL 외의 Windows 환경에서는 현재 Laravel Prompts를 사용할 수 없습니다.

이러한 이유로, Laravel Prompts는 [Symfony Console Question Helper](https://symfony.com/doc/current/components/console/helpers/questionhelper.html) 등 대체 구현체로 폴백할 수 있도록 지원합니다.

> [!NOTE]
> Laravel 프레임워크와 함께 Laravel Prompts를 사용하는 경우, 각 프롬프트에 대한 폴백이 미리 구성되어 있으며, 지원되지 않는 환경에서는 자동으로 활성화됩니다.

<a name="fallback-conditions"></a>
#### 폴백 조건

Laravel이 아닌 다른 환경에서 사용하거나, 폴백 동작이 활성화될 조건을 직접 지정하려면, `Prompt` 클래스의 `fallbackWhen` 정적 메서드에 불리언 값을 전달하면 됩니다.

```php
use Laravel\Prompts\Prompt;

Prompt::fallbackWhen(
    ! $input->isInteractive() || windows_os() || app()->runningUnitTests()
);
```

<a name="fallback-behavior"></a>
#### 폴백 동작

Laravel 환경이 아니거나 폴백 동작을 직접 제어해야 한다면, 각 프롬프트 클래스의 `fallbackUsing` 정적 메서드에 클로저를 넘기면 됩니다.

```php
use Laravel\Prompts\TextPrompt;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Console\Style\SymfonyStyle;

TextPrompt::fallbackUsing(function (TextPrompt $prompt) use ($input, $output) {
    $question = (new Question($prompt->label, $prompt->default ?: null))
        ->setValidator(function ($answer) use ($prompt) {
            if ($prompt->required && $answer === null) {
                throw new \RuntimeException(
                    is_string($prompt->required) ? $prompt->required : 'Required.'
                );
            }

            if ($prompt->validate) {
                $error = ($prompt->validate)($answer ?? '');

                if ($error) {
                    throw new \RuntimeException($error);
                }
            }

            return $answer;
        });

    return (new SymfonyStyle($input, $output))
        ->askQuestion($question);
});
```

폴백은 각 프롬프트 클래스별로 개별적으로 설정해야 합니다. 클로저에는 해당 프롬프트 클래스의 인스턴스가 전달되며, 알맞은 타입을 반환해야 합니다.