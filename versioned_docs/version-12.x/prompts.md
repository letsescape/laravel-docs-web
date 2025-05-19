# 프롬프트 (Prompts)

- [소개](#introduction)
- [설치](#installation)
- [사용 가능한 프롬프트](#available-prompts)
    - [텍스트](#text)
    - [텍스트에어리어](#textarea)
    - [비밀번호](#password)
    - [확인](#confirm)
    - [선택](#select)
    - [멀티 선택](#multiselect)
    - [자동완성 제안](#suggest)
    - [검색](#search)
    - [멀티 검색](#multisearch)
    - [일시정지](#pause)
- [유효성 검증 전 입력값 변환](#transforming-input-before-validation)
- [폼](#forms)
- [정보성 메시지](#informational-messages)
- [테이블](#tables)
- [스핀](#spin)
- [진행 표시줄](#progress)
- [터미널 지우기](#clear)
- [터미널 관련 주의사항](#terminal-considerations)
- [지원되지 않는 환경 및 대체 동작](#fallbacks)

<a name="introduction"></a>
## 소개

[Laravel Prompts](https://github.com/laravel/prompts)는 명령줄 애플리케이션에서 아름답고 사용자 친화적인 폼을 손쉽게 추가할 수 있게 해주는 PHP 패키지입니다. 브라우저에서 흔히 볼 수 있는 플레이스홀더 텍스트, 유효성 검증과 같은 기능도 지원합니다.

<img src="https://laravel.com/img/docs/prompts-example.png" />

Laravel Prompts는 [아티즌 콘솔 명령어](/docs/12.x/artisan#writing-commands)에서 사용자 입력을 받을 때 특히 유용하지만, 모든 종류의 커맨드라인 PHP 프로젝트에서도 사용할 수 있습니다.

> [!NOTE]
> Laravel Prompts는 macOS, Linux, 그리고 Windows(WSL 포함)를 지원합니다. 추가 정보는 [지원되지 않는 환경 및 대체 동작](#fallbacks) 문서를 참고하시기 바랍니다.

<a name="installation"></a>
## 설치

Laravel Prompts는 최신 라라벨 릴리즈에 이미 포함되어 있습니다.

또한, Composer 패키지 매니저를 사용해 다른 PHP 프로젝트에서도 별도로 설치할 수 있습니다.

```shell
composer require laravel/prompts
```

<a name="available-prompts"></a>
## 사용 가능한 프롬프트

<a name="text"></a>
### 텍스트

`text` 함수를 사용하면 질문을 표시하고 사용자의 입력을 받아 그 값을 반환합니다.

```php
use function Laravel\Prompts\text;

$name = text('What is your name?');
```

플레이스홀더 텍스트, 기본값, 추가 안내문도 함께 제공할 수 있습니다.

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

입력이 반드시 필요한 경우, `required` 인수를 전달하면 됩니다.

```php
$name = text(
    label: 'What is your name?',
    required: true
);
```

유효성 검증 메시지를 직접 지정하고 싶다면 문자열을 전달할 수도 있습니다.

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

이 클로저는 사용자가 입력한 값을 전달받으며, 에러 메시지를 반환하거나 유효성 검증이 통과되면 `null`을 반환해야 합니다.

또 다른 방법으로, Laravel의 강력한 [validator](/docs/12.x/validation)를 사용할 수도 있습니다. 이를 위해서는 속성명과 원하는 유효성 규칙이 들어 있는 배열을 `validate` 인수로 제공하면 됩니다.

```php
$name = text(
    label: 'What is your name?',
    validate: ['name' => 'required|max:255|unique:users']
);
```

<a name="textarea"></a>
### 텍스트에어리어

`textarea` 함수는 질문을 표시하고, 멀티라인 텍스트 입력 창을 통해 사용자의 입력을 받은 뒤 그 값을 반환합니다.

```php
use function Laravel\Prompts\textarea;

$story = textarea('Tell me a story.');
```

플레이스홀더 텍스트, 기본값, 추가 안내문도 포함할 수 있습니다.

```php
$story = textarea(
    label: 'Tell me a story.',
    placeholder: 'This is a story about...',
    hint: 'This will be displayed on your profile.'
);
```

<a name="textarea-required"></a>
#### 값 필수 입력

입력이 반드시 필요한 경우, `required` 인수를 전달하면 됩니다.

```php
$story = textarea(
    label: 'Tell me a story.',
    required: true
);
```

유효성 검증 메시지를 직접 지정하고 싶다면 문자열을 전달할 수도 있습니다.

```php
$story = textarea(
    label: 'Tell me a story.',
    required: 'A story is required.'
);
```

<a name="textarea-validation"></a>
#### 추가 유효성 검증

추가적인 유효성 검증 로직이 필요하다면, `validate` 인수에 클로저를 전달할 수 있습니다.

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

이 클로저는 입력된 값을 전달받으며, 에러 메시지를 반환하거나 유효하면 `null`을 반환합니다.

또 다른 방법으로, Laravel의 [validator](/docs/12.x/validation)를 사용할 수도 있습니다. 배열 형식으로 속성명과 유효성 규칙을 전달하면 됩니다.

```php
$story = textarea(
    label: 'Tell me a story.',
    validate: ['story' => 'required|max:10000']
);
```

<a name="password"></a>
### 비밀번호

`password` 함수는 `text` 함수와 비슷하지만, 사용자가 입력하는 내용이 콘솔에 표시되지 않고 마스킹(masking) 처리됩니다. 비밀번호와 같이 민감한 정보를 입력받을 때 유용합니다.

```php
use function Laravel\Prompts\password;

$password = password('What is your password?');
```

플레이스홀더 텍스트, 추가 안내문도 지정할 수 있습니다.

```php
$password = password(
    label: 'What is your password?',
    placeholder: 'password',
    hint: 'Minimum 8 characters.'
);
```

<a name="password-required"></a>
#### 값 필수 입력

입력이 반드시 필요하다면, `required` 인수를 전달하면 됩니다.

```php
$password = password(
    label: 'What is your password?',
    required: true
);
```

유효성 검증 메시지를 커스터마이즈하고 싶다면 문자열도 전달할 수 있습니다.

```php
$password = password(
    label: 'What is your password?',
    required: 'The password is required.'
);
```

<a name="password-validation"></a>
#### 추가 유효성 검증

추가적으로 유효성 검증이 필요하다면, `validate` 인수에 클로저를 전달하면 됩니다.

```php
$password = password(
    label: 'What is your password?',
    validate: fn (string $value) => match (true) {
        strlen($value) < 8 => 'The password must be at least 8 characters.',
        default => null
    }
);
```

클로저는 입력받은 값을 인수로 받아, 유효하지 않으면 에러 메시지를, 유효할 땐 `null`을 반환해야 합니다.

또는 Laravel의 [validator](/docs/12.x/validation)를 사용할 수도 있습니다. 배열로 속성명과 유효성 규칙을 전달하세요.

```php
$password = password(
    label: 'What is your password?',
    validate: ['password' => 'min:8']
);
```

<a name="confirm"></a>
### 확인

사용자에게 "예/아니오"로 대답하는 확인 질문을 하고 싶을 때는 `confirm` 함수를 사용하면 됩니다. 사용자는 화살표 키 또는 `y`, `n` 키로 답을 선택할 수 있습니다. 이 함수는 `true` 또는 `false`를 반환합니다.

```php
use function Laravel\Prompts\confirm;

$confirmed = confirm('Do you accept the terms?');
```

기본 선택값, "예"/"아니오" 표시 텍스트, 추가 안내문도 지정할 수 있습니다.

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
#### "예" 선택 요구

필요하다면, 사용자가 반드시 "예"를 선택하도록 `required` 인수를 전달할 수 있습니다.

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    required: true
);
```

유효성 검증 메시지를 커스터마이즈하고 싶다면 문자열로 전달할 수도 있습니다.

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    required: 'You must accept the terms to continue.'
);
```

<a name="select"></a>
### 선택

미리 정의된 여러 항목 중 하나를 사용자가 선택하도록 해야 한다면, `select` 함수를 사용하면 됩니다.

```php
use function Laravel\Prompts\select;

$role = select(
    label: 'What role should the user have?',
    options: ['Member', 'Contributor', 'Owner']
);
```

기본 선택값, 추가 안내문도 지정할 수 있습니다.

```php
$role = select(
    label: 'What role should the user have?',
    options: ['Member', 'Contributor', 'Owner'],
    default: 'Owner',
    hint: 'The role may be changed at any time.'
);
```

`options` 인수에 연관 배열(associative array)을 전달하면 선택한 항목의 키가 반환됩니다.

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

5개 이상의 옵션이 있을 경우 스크롤이 생기며, `scroll` 인수를 통해 보이는 옵션의 개수를 조절할 수 있습니다.

```php
$role = select(
    label: 'Which category would you like to assign?',
    options: Category::pluck('name', 'id'),
    scroll: 10
);
```

<a name="select-validation"></a>
#### 추가 유효성 검증

다른 프롬프트 함수들과 달리, `select` 함수는 아무것도 선택하지 않는 상황이 없으므로 `required` 인수를 지원하지 않습니다. 하지만 특정 옵션은 선택하지 못하도록 하고 싶다면, `validate` 인수에 클로저를 전달할 수 있습니다.

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

`options`가 연관 배열이면 클로저에는 선택된 키가, 일반 배열이면 값이 전달됩니다. 유효하지 않은 경우 에러 메시지를, 유효하면 `null`을 반환합니다.

<a name="multiselect"></a>
### 멀티 선택

여러 옵션을 동시에 선택할 수 있도록 하려면, `multiselect` 함수를 사용하면 됩니다.

```php
use function Laravel\Prompts\multiselect;

$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: ['Read', 'Create', 'Update', 'Delete']
);
```

기본 선택값, 추가 안내문도 함께 지정할 수 있습니다.

```php
use function Laravel\Prompts\multiselect;

$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: ['Read', 'Create', 'Update', 'Delete'],
    default: ['Read', 'Create'],
    hint: 'Permissions may be updated at any time.'
);
```

`options`에 연관 배열을 전달하면 값이 아닌 선택한 옵션의 키가 반환됩니다.

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

5개 이상의 옵션에서 스크롤이 활성화되며, `scroll` 인수를 통해 표시 개수를 조정할 수 있습니다.

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    scroll: 10
);
```

<a name="multiselect-required"></a>
#### 값 입력 필수 요구

기본적으로 사용자는 0개 이상의 옵션을 선택할 수 있습니다. 하지만 한 개 이상 꼭 선택하도록 하려면, `required` 인수를 추가하면 됩니다.

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    required: true
);
```

유효성 검증 메시지를 직접 지정하고 싶다면, `required` 인수에 문자열을 전달할 수 있습니다.

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    required: 'You must select at least one category'
);
```

<a name="multiselect-validation"></a>
#### 추가 유효성 검증

특정 옵션을 선택하지 못하도록 제한하고 싶다면, `validate` 인수에 클로저를 전달할 수 있습니다.

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

`options`가 연관 배열이면 클로저로 선택된 키 배열이 전달되고, 일반 배열이면 값 배열이 전달됩니다. 검증 실패 시 에러 메시지, 통과 시 `null`을 반환합니다.

<a name="suggest"></a>
### 자동완성 제안

`suggest` 함수는 가능한 선택지를 자동완성으로 미리 보여줄 수 있습니다. 자동완성 힌트와 관계없이, 사용자는 원하는 모든 값을 직접 입력할 수 있습니다.

```php
use function Laravel\Prompts\suggest;

$name = suggest('What is your name?', ['Taylor', 'Dayle']);
```

또는 두 번째 인수로 클로저를 전달할 수 있습니다. 이 클로저는 사용자가 문자를 입력할 때마다 호출되며, 현재까지 입력된 값을 받아 자동완성으로 보여줄 옵션 배열을 반환해야 합니다.

```php
$name = suggest(
    label: 'What is your name?',
    options: fn ($value) => collect(['Taylor', 'Dayle'])
        ->filter(fn ($name) => Str::contains($name, $value, ignoreCase: true))
)
```

플레이스홀더 텍스트, 기본값, 추가 안내문도 지정할 수 있습니다.

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

입력값이 필수라면, `required` 인수를 전달하세요.

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    required: true
);
```

유효성 검증 메시지를 커스터마이즈하고 싶다면 문자열을 전달할 수도 있습니다.

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    required: 'Your name is required.'
);
```

<a name="suggest-validation"></a>
#### 추가 유효성 검증

추가 유효성 검증이 필요하다면, `validate` 인수에 클로저를 전달하세요.

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

클로저는 사용자의 입력값을 받고, 에러 메시지를 반환하거나 검증 통과 시 `null`을 반환합니다.

또 다른 방법으로 Laravel의 [validator](/docs/12.x/validation)를 쓸 수 있습니다. 속성명과 검증 규칙이 담긴 배열을 넣으세요.

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    validate: ['name' => 'required|min:3|max:255']
);
```

<a name="search"></a>
### 검색

사용자가 선택할 수 있는 항목이 많은 경우, `search` 함수는 사용자가 직접 검색어를 입력해 결과를 필터링한 후, 화살표 키로 원하는 항목을 선택할 수 있게 해줍니다.

```php
use function Laravel\Prompts\search;

$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : []
);
```

이 클로저는 사용자가 지금까지 입력한 텍스트를 받으며, 옵션 배열을 반환해야 합니다. 연관 배열로 값을 반환하면 선택된 옵션의 키를, 그렇지 않으면 값을 반환합니다.

값 자체를 반환하도록 필터링할 때는, 배열이 연관 배열이 되지 않도록 `array_values` 함수나 Collection의 `values` 메서드를 사용하는 것이 좋습니다.

```php
$names = collect(['Taylor', 'Abigail']);

$selected = search(
    label: 'Search for the user that should receive the mail',
    options: fn ($value) => $names
        ->filter(fn ($name) => Str::contains($name, $value, ignoreCase: true))
        ->values()
        ->all(),
);
```

플레이스홀더 텍스트, 추가 안내문도 제공할 수 있습니다.

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

5개의 옵션까지는 스크롤이 보이지 않으며, `scroll` 인수로 표시 개수를 조정할 수 있습니다.

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

추가적인 유효성 검증 로직을 수행하고 싶다면, `validate` 인수에 클로저를 전달하면 됩니다.

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

`options` 클로저가 연관 배열(associative array)을 반환하는 경우, 해당 클로저는 선택된 키(key)를 인수로 받습니다. 그렇지 않다면 값(value)을 받게 됩니다. 클로저는 에러 메시지를 반환하거나, 검증이 통과한 경우에는 `null`을 반환할 수 있습니다.

<a name="multisearch"></a>
### 멀티서치(Multi-search)

검색 가능한 옵션이 많고, 사용자가 여러 항목을 선택해야 하는 경우, `multisearch` 함수를 통해 사용자가 검색어를 입력해 결과를 필터링하고, 방향키와 스페이스바로 여러 옵션을 선택할 수 있습니다.

```php
use function Laravel\Prompts\multisearch;

$ids = multisearch(
    'Search for the users that should receive the mail',
    fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : []
);
```

클로저는 사용자가 지금까지 입력한 텍스트를 받아서, 옵션 배열을 반환해야 합니다. 연관 배열을 반환하면 선택된 옵션의 키(key)가 반환되고, 그 외에는 값(value)들이 반환됩니다.

값을 반환하는 배열을 필터링하는 경우 `array_values` 함수나 컬렉션의 `values` 메서드를 사용해 배열이 연관 배열이 되지 않도록 해야 합니다.

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

플레이스홀더(placeholder) 텍스트나 안내(hint) 문구도 추가할 수 있습니다.

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

최대 5개의 옵션이 스크롤 없이 표시되며, 옵션이 더 많아지면 리스트가 스크롤됩니다. 표시되는 옵션 수를 `scroll` 인수로 지정하여 변경할 수 있습니다.

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
#### 값 필수 지정

기본적으로 사용자는 0개 이상의 옵션을 선택할 수 있습니다. 필수로 하나 이상 선택하게 하려면 `required` 인수를 사용하면 됩니다.

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    required: true
);
```

유효성 메시지를 사용자가 원하는 문구로 변경하고 싶다면, `required`에 문자열을 전달할 수도 있습니다.

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

추가적인 유효성 검증 로직이 필요하다면, `validate` 인수에 클로저를 전달할 수 있습니다.

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

`options` 클로저가 연관 배열을 반환하면, 선택된 키(key)들이 전달되고, 그렇지 않은 경우 선택된 값(value)들이 전달됩니다. 클로저는 에러 메시지를 반환하거나, 검증이 통과하면 `null`을 반환할 수 있습니다.

<a name="pause"></a>
### 일시정지(Pause)

`pause` 함수는 사용자에게 정보를 보여준 뒤 ENTER(엔터) 또는 RETURN 키를 눌러 진행을 확인할 때 사용할 수 있습니다.

```php
use function Laravel\Prompts\pause;

pause('Press ENTER to continue.');
```

<a name="transforming-input-before-validation"></a>
## 유효성 검증 전 입력 값 변환

때로는 프롬프트 입력 값을 유효성 검증 전에 가공하고 싶을 수 있습니다. 예를 들어, 입력받은 문자열의 공백을 제거하려 할 때가 있습니다. 이를 위해 다수의 프롬프트 함수에서는 `transform` 인수를 제공하며, 클로저를 받을 수 있습니다.

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

여러 개의 프롬프트를 순차적으로 표시하여 정보를 수집한 후 추가 작업이 필요한 경우가 자주 있습니다. `form` 함수를 활용하면 사용자가 차례로 입력을 진행할 수 있는 프롬프트 그룹을 만들 수 있습니다.

```php
use function Laravel\Prompts\form;

$responses = form()
    ->text('What is your name?', required: true)
    ->password('What is your password?', validate: ['password' => 'min:8'])
    ->confirm('Do you accept the terms?')
    ->submit();
```

`submit` 메서드는 폼 내 모든 프롬프트의 응답을 숫자 인덱스 배열로 반환합니다. 각 프롬프트에 `name` 인수를 지정하면 해당 이름으로 응답 값을 가져올 수 있습니다.

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

`form` 함수를 사용하는 가장 큰 장점은 사용자가 `CTRL + U` 단축키를 이용해 이전 프롬프트로 돌아갈 수 있다는 점입니다. 덕분에 사용자는 입력을 취소하지 않아도 실수를 바로잡거나 선택을 변경할 수 있습니다.

폼 내에서 프롬프트를 더 세부적으로 제어하고 싶다면, 프롬프트 함수를 직접 호출하는 대신 `add` 메서드를 사용할 수 있습니다. `add` 메서드는 사용자가 입력한 이전 응답값을 모두 인수로 전달합니다.

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

`note`, `info`, `warning`, `error`, `alert` 함수들을 사용해 다양한 정보 메시지를 사용자에게 보여줄 수 있습니다.

```php
use function Laravel\Prompts\info;

info('Package installed successfully.');
```

<a name="tables"></a>
## 테이블 표시

`table` 함수를 사용하면 여러 행과 열의 데이터를 손쉽게 표 형태로 표시할 수 있습니다. 컬럼(헤더) 이름과 데이터만 넘겨주면 됩니다.

```php
use function Laravel\Prompts\table;

table(
    headers: ['Name', 'Email'],
    rows: User::all(['name', 'email'])->toArray()
);
```

<a name="spin"></a>
## 스핀(Spin)

`spin` 함수는 지정된 콜백이 실행되는 동안 진행 중임을 나타내는 스피너와 옵션 메시지를 함께 표시합니다. 완료 후 콜백의 결과를 반환합니다.

```php
use function Laravel\Prompts\spin;

$response = spin(
    message: 'Fetching response...',
    callback: fn () => Http::get('http://example.com')
);
```

> [!WARNING]
> `spin` 기능에서 스피너 애니메이션을 제대로 표시하려면 `pcntl` PHP 확장이 필요합니다. 이 확장이 없으면 스피너는 정적인 형태로 나타납니다.

<a name="progress"></a>
## 진행률 표시줄(Progress Bars)

작업을 오래 실행할 경우, 현재 작업의 진행 상태를 사용자에게 안내하기 위해 진행률 표시줄(progress bar)을 사용하는 것이 유용합니다. `progress` 함수를 사용하면 주어진 이터러블 값을 반복할 때마다 진행률 바가 표시되고, 반복마다 자동으로 진척도를 갱신합니다.

```php
use function Laravel\Prompts\progress;

$users = progress(
    label: 'Updating users',
    steps: User::all(),
    callback: fn ($user) => $this->performTask($user)
);
```

`progress` 함수는 map 함수처럼 동작하며, 각 반복에서 콜백이 반환한 값을 담은 배열을 반환합니다.

콜백 함수에서 `Laravel\Prompts\Progress` 인스턴스를 받을 수도 있으며, 이를 통해 각 반복마다 레이블이나 힌트 메시지를 동적으로 변경할 수 있습니다.

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

진행률 표시를 더 세밀하게 제어할 필요가 있다면, 우선 전체 반복 횟수를 지정하고, 각 항목 처리 후 `advance` 메서드로 직접 진행률을 올릴 수 있습니다.

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
## 터미널 관련 참고 사항

<a name="terminal-width"></a>
#### 터미널 너비

라벨, 옵션, 검증 메시지 등 문자열의 길이가 사용자의 터미널 "열(column)" 수를 초과하면 자동으로 잘려서 표시됩니다. 사용자들이 좁은 터미널을 사용한다면 이 문자열들의 길이를 최소화하는 것이 좋습니다. 일반적으로 80자 터미널을 고려해 74자 이하가 안전한 최대 길이입니다.

<a name="terminal-height"></a>
#### 터미널 높이

`scroll` 인수를 받는 프롬프트의 경우, 터미널 높이와 유효성 메시지 표시 공간을 감안해 옵션 목록의 길이가 자동으로 조정됩니다.

<a name="fallbacks"></a>
## 지원되지 않는 환경과 대체 구현(Fallbacks)

Laravel Prompts는 macOS, Linux, Windows(WSL 환경)를 지원합니다. 하지만 Windows의 PHP에서는 기술적 한계로 WSL 환경이 아니면 Laravel Prompts를 사용할 수 없습니다.

이런 이유로 Laravel Prompts는 [Symfony Console Question Helper](https://symfony.com/doc/current/components/console/helpers/questionhelper.html)와 같은 대체 구현(Fallback)을 지원합니다.

> [!NOTE]
> 라라벨 프레임워크와 함께 Laravel Prompts를 사용할 때는, 각 프롬프트별 대체 구현이 이미 사전 설정되어 있으므로, 지원되지 않는 환경에서 자동으로 적용됩니다.

<a name="fallback-conditions"></a>
#### Fallback 사용 조건

라라벨을 사용하지 않거나, fallback 동작의 발동 조건을 직접 제어해야 할 경우, `Prompt` 클래스의 `fallbackWhen` 정적 메서드에 불리언 값을 전달하면 됩니다.

```php
use Laravel\Prompts\Prompt;

Prompt::fallbackWhen(
    ! $input->isInteractive() || windows_os() || app()->runningUnitTests()
);
```

<a name="fallback-behavior"></a>
#### Fallback 동작 정의

라라벨을 사용하지 않거나, 개별 프롬프트 클래스의 fallback 동작을 직접 변경하고 싶을 때는 `fallbackUsing` 정적 메서드에 클로저를 전달할 수 있습니다.

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

각 프롬프트 클래스별로 fallback을 개별적으로 설정해야 하며, 클로저는 해당 프롬프트 클래스 인스턴스를 전달받고, 그에 맞는 적절한 값을 반환해야 합니다.