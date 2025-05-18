# 프롬프트 (Prompts)

- [소개](#introduction)
- [설치](#installation)
- [사용 가능한 프롬프트](#available-prompts)
    - [텍스트](#text)
    - [텍스트에어리어](#textarea)
    - [패스워드](#password)
    - [확인](#confirm)
    - [선택](#select)
    - [멀티 선택](#multiselect)
    - [추천 자동완성](#suggest)
    - [검색](#search)
    - [멀티 검색](#multisearch)
    - [일시 정지](#pause)
- [유효성 검증 전 입력값 변환](#transforming-input-before-validation)
- [폼](#forms)
- [정보 메시지](#informational-messages)
- [테이블](#tables)
- [로딩 스핀](#spin)
- [진행 바](#progress)
- [터미널 초기화](#clear)
- [터미널 고려사항](#terminal-considerations)
- [지원되지 않는 환경과 대체 동작](#fallbacks)

<a name="introduction"></a>
## 소개

[Laravel Prompts](https://github.com/laravel/prompts)는 명령줄 애플리케이션에 아름답고 사용자 친화적인 폼을 추가할 수 있는 PHP 패키지입니다. 브라우저와 유사하게 플레이스홀더 텍스트, 유효성 검증 등 다양한 기능을 제공합니다.

<img src="https://laravel.com/img/docs/prompts-example.png" />

Laravel Prompts는 [Artisan 콘솔 명령어](/docs/11.x/artisan#writing-commands)에서 사용자 입력을 받을 때 가장 적합하지만, 모든 명령줄 기반 PHP 프로젝트에서 사용할 수도 있습니다.

> [!NOTE]  
> Laravel Prompts는 macOS, Linux, 그리고 WSL이 설치된 Windows를 지원합니다. 보다 자세한 내용은 [지원되지 않는 환경과 대체 동작](#fallbacks) 문서를 참고하시기 바랍니다.

<a name="installation"></a>
## 설치

Laravel의 최신 릴리스에는 Laravel Prompts가 이미 포함되어 있습니다.

기타 PHP 프로젝트에서도 Composer 패키지 매니저를 이용해 별도로 설치할 수 있습니다.

```shell
composer require laravel/prompts
```

<a name="available-prompts"></a>
## 사용 가능한 프롬프트

<a name="text"></a>
### 텍스트

`text` 함수를 사용하면, 지정한 질문을 사용자에게 표시하고 입력값을 받아 반환할 수 있습니다.

```php
use function Laravel\Prompts\text;

$name = text('What is your name?');
```

플레이스홀더 텍스트, 기본값, 추가 설명(힌트)을 함께 제공할 수도 있습니다.

```php
$name = text(
    label: 'What is your name?',
    placeholder: 'E.g. Taylor Otwell',
    default: $user?->name,
    hint: 'This will be displayed on your profile.'
);
```

<a name="text-required"></a>
#### 필수 입력값 지정

입력값을 반드시 받아야 한다면, `required` 인수를 사용할 수 있습니다.

```php
$name = text(
    label: 'What is your name?',
    required: true
);
```

유효성 검증 메시지를 직접 지정하고 싶다면 문자열로 전달할 수도 있습니다.

```php
$name = text(
    label: 'What is your name?',
    required: 'Your name is required.'
);
```

<a name="text-validation"></a>
#### 추가 유효성 검증

추가적인 유효성 검증 로직이 필요하다면, `validate` 인수로 클로저를 전달할 수 있습니다.

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

클로저는 사용자가 입력한 값을 받아서, 오류 메시지(문자열)를 반환하거나 검증에 통과하면 `null`을 반환해야 합니다.

또는 Laravel의 강력한 [validator](/docs/11.x/validation) 기능을 사용할 수도 있습니다. 이 경우 `validate` 인수에 속성명과 검증 규칙을 담은 배열을 전달하면 됩니다.

```php
$name = text(
    label: 'What is your name?',
    validate: ['name' => 'required|max:255|unique:users']
);
```

<a name="textarea"></a>
### 텍스트에어리어

`textarea` 함수는 지정한 질문을 사용자에게 표시하고, 여러 줄 입력을 받아 반환합니다.

```php
use function Laravel\Prompts\textarea;

$story = textarea('Tell me a story.');
```

플레이스홀더 텍스트, 기본값, 설명(힌트)도 함께 지정할 수 있습니다.

```php
$story = textarea(
    label: 'Tell me a story.',
    placeholder: 'This is a story about...',
    hint: 'This will be displayed on your profile.'
);
```

<a name="textarea-required"></a>
#### 필수 입력값 지정

입력값이 꼭 필요하다면 `required` 인수를 추가하면 됩니다.

```php
$story = textarea(
    label: 'Tell me a story.',
    required: true
);
```

유효성 메시지를 직접 지정할 수도 있습니다.

```php
$story = textarea(
    label: 'Tell me a story.',
    required: 'A story is required.'
);
```

<a name="textarea-validation"></a>
#### 추가 유효성 검증

추가적인 유효성 검증이 필요하다면, 클로저를 `validate` 인수로 전달할 수 있습니다.

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

클로저는 입력값을 받아 오류 메시지(문자열) 또는 검증 통과 시에는 `null`을 반환하면 됩니다.

또는 Laravel의 [validator](/docs/11.x/validation) 기능을 사용할 수도 있습니다. 속성명과 유효성 규칙이 담긴 배열을 `validate` 인수에 전달하면 됩니다.

```php
$story = textarea(
    label: 'Tell me a story.',
    validate: ['story' => 'required|max:10000']
);
```

<a name="password"></a>
### 패스워드

`password` 함수는 `text` 함수와 비슷하지만, 사용자가 입력하는 값이 콘솔에서 보이지 않도록 마스킹됩니다. 비밀번호와 같은 민감한 정보를 입력받을 때 유용합니다.

```php
use function Laravel\Prompts\password;

$password = password('What is your password?');
```

플레이스홀더 텍스트와 설명 힌트도 함께 쓸 수 있습니다.

```php
$password = password(
    label: 'What is your password?',
    placeholder: 'password',
    hint: 'Minimum 8 characters.'
);
```

<a name="password-required"></a>
#### 필수 입력값 지정

입력값을 필수로 받아야 한다면 `required` 인수를 추가합니다.

```php
$password = password(
    label: 'What is your password?',
    required: true
);
```

직접 유효성 메시지를 지정하고 싶다면 문자열로 전달할 수도 있습니다.

```php
$password = password(
    label: 'What is your password?',
    required: 'The password is required.'
);
```

<a name="password-validation"></a>
#### 추가 유효성 검증

추가적인 유효성 검증이 필요하다면, 클로저를 `validate` 인수로 전달할 수 있습니다.

```php
$password = password(
    label: 'What is your password?',
    validate: fn (string $value) => match (true) {
        strlen($value) < 8 => 'The password must be at least 8 characters.',
        default => null
    }
);
```

클로저는 입력값을 받아 오류 메시지(문자열) 또는 검증 통과 시에는 `null`을 반환해야 합니다.

또는 Laravel의 [validator](/docs/11.x/validation) 기능을 사용할 수도 있습니다. 속성명과 검증 규칙을 배열에 담아 `validate` 인수로 전달하면 됩니다.

```php
$password = password(
    label: 'What is your password?',
    validate: ['password' => 'min:8']
);
```

<a name="confirm"></a>
### 확인

사용자에게 "예/아니오"와 같은 단순 확인값이 필요할 때는 `confirm` 함수를 사용할 수 있습니다. 사용자는 방향키 또는 `y`, `n` 키로 응답을 선택할 수 있습니다. 반환값은 `true` 또는 `false`입니다.

```php
use function Laravel\Prompts\confirm;

$confirmed = confirm('Do you accept the terms?');
```

기본 선택값이나 "예", "아니오"에 들어가는 라벨 텍스트, 설명(힌트)도 직접 지정할 수 있습니다.

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
#### "예" 필수 선택

필요하다면 사용자가 반드시 "예"를 선택하도록 `required` 인수를 설정할 수 있습니다.

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    required: true
);
```

유효성 메시지도 직접 지정할 수 있습니다.

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    required: 'You must accept the terms to continue.'
);
```

<a name="select"></a>
### 선택

사용자가 정해진 선택지 중에서 고르도록 하려면, `select` 함수를 사용할 수 있습니다.

```php
use function Laravel\Prompts\select;

$role = select(
    label: 'What role should the user have?',
    options: ['Member', 'Contributor', 'Owner']
);
```

기본 선택값과 설명(힌트)도 설정할 수 있습니다.

```php
$role = select(
    label: 'What role should the user have?',
    options: ['Member', 'Contributor', 'Owner'],
    default: 'Owner',
    hint: 'The role may be changed at any time.'
);
```

`options` 인수에 연관 배열을 전달하면, 선택된 값 대신 해당 키가 반환됩니다.

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

기본적으로 최대 다섯 개의 선택지가 표시되며, 그 이상은 스크롤이 필요합니다. `scroll` 인수로 표시 개수를 조절할 수 있습니다.

```php
$role = select(
    label: 'Which category would you like to assign?',
    options: Category::pluck('name', 'id'),
    scroll: 10
);
```

<a name="select-validation"></a>
#### 추가 유효성 검증

다른 프롬프트 함수들과 달리 `select` 함수에서는 선택지를 반드시 골라야 하므로 `required` 인수를 지원하지 않습니다. 그러나 특정 선택지를 사용할 수 없도록 제한하고 싶을 땐, `validate` 인수에 클로저를 전달할 수 있습니다.

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

`options` 인수에 연관 배열이 전달되었으면, 클로저에는 선택된 키가 전달되고, 일반 배열인 경우에는 선택된 값이 전달됩니다. 검증 실패 시 오류 메시지를, 통과 시에는 `null`을 반환하면 됩니다.

<a name="multiselect"></a>
### 멀티 선택

한 번에 여러 개의 값을 선택할 수 있도록 하려면, `multiselect` 함수를 사용할 수 있습니다.

```php
use function Laravel\Prompts\multiselect;

$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: ['Read', 'Create', 'Update', 'Delete']
);
```

기본 선택값과 설명(힌트)도 지정할 수 있습니다.

```php
use function Laravel\Prompts\multiselect;

$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: ['Read', 'Create', 'Update', 'Delete'],
    default: ['Read', 'Create'],
    hint: 'Permissions may be updated at any time.'
);
```

`options` 인수에 연관 배열을 사용하면, 선택된 옵션의 키가 반환됩니다.

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

기본적으로 5개의 선택지가 표시되고, 그 이상은 스크롤을 통해 볼 수 있습니다. `scroll` 인수로 표시 개수를 조절할 수 있습니다.

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    scroll: 10
);
```

<a name="multiselect-required"></a>
#### 필수 선택값 지정

기본적으로 사용자는 아무것도 선택하지 않거나 여러 항목을 모두 선택할 수도 있습니다. 반드시 1개 이상의 항목을 선택하도록 하려면 `required` 인수를 추가해야 합니다.

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    required: true
);
```

유효성 메시지를 직접 지정할 수도 있습니다.

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    required: 'You must select at least one category'
);
```

<a name="multiselect-validation"></a>
#### 추가 유효성 검증

특정 선택지는 사용하지 못하도록 하고 싶다면, `validate` 인수에 클로저를 전달할 수 있습니다.

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

`options` 인수에 연관 배열이 전달되면 클로저에는 선택된 키들의 배열이, 일반 배열인 경우에는 선택된 값들이 배열로 전달됩니다. 클로저는 오류 메시지(문자열) 또는 검증 통과 시 `null`을 반환해야 합니다.

<a name="suggest"></a>
### 추천 자동완성

`suggest` 함수는 사용자가 입력할 때 자동완성 후보를 보여줄 수 있습니다. 자동완성 힌트와는 별개로, 사용자는 원하는 값을 자유롭게 입력할 수도 있습니다.

```php
use function Laravel\Prompts\suggest;

$name = suggest('What is your name?', ['Taylor', 'Dayle']);
```

또한 두 번째 인수로 클로저를 전달하면, 사용자가 입력할 때마다 그 값이 갱신되어 자동완성 후보 목록을 동적으로 제시할 수 있습니다. 클로저는 사용자가 지금까지 입력한 문자열을 파라미터로 받아, 자동완성 후보 배열을 반환해야 합니다.

```php
$name = suggest(
    label: 'What is your name?',
    options: fn ($value) => collect(['Taylor', 'Dayle'])
        ->filter(fn ($name) => Str::contains($name, $value, ignoreCase: true))
)
```

플레이스홀더, 기본값, 설명(힌트)도 사용할 수 있습니다.

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
#### 필수 입력값 지정

입력값을 필수로 받아야 한다면, `required` 인수를 사용할 수 있습니다.

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    required: true
);
```

유효성 메시지는 문자열로 직접 지정할 수도 있습니다.

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    required: 'Your name is required.'
);
```

<a name="suggest-validation"></a>
#### 추가 유효성 검증

추가적인 유효성 검증이 필요하다면, `validate` 인수로 클로저를 전달할 수 있습니다.

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

클로저는 입력값을 받아, 오류 메시지(문자열) 또는 검증 통과 시에는 `null`을 반환하도록 작성합니다.

또는 Laravel의 [validator](/docs/11.x/validation) 기능을 그대로 사용할 수도 있습니다. 이 경우, 속성명과 검증 규칙이 담긴 배열을 `validate` 인수에 전달하세요.

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    validate: ['name' => 'required|min:3|max:255']
);
```

<a name="search"></a>
### 검색

선택지가 많은 경우 사용자가 검색어를 입력해 후보를 필터링한 뒤, 방향키로 선택할 수 있도록 하고 싶다면 `search` 함수를 사용합니다.

```php
use function Laravel\Prompts\search;

$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : []
);
```

클로저는 사용자가 지금까지 입력한 문자열을 받아서, 후보 목록(배열)을 반환해야 합니다. 연관 배열을 반환할 경우 선택된 옵션의 키가, 일반 배열을 반환할 경우 값 자체가 반환됩니다.

값을 반환하는 형태의 배열을 필터링할 때는, `array_values` 함수나 컬렉션의 `values` 메서드를 이용해 배열이 연관 배열로 변하지 않도록 주의해야 합니다.

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

플레이스홀더 텍스트나 설명(힌트)도 함께 지정할 수 있습니다.

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

기본적으로 최대 다섯 개의 선택지가 표시되지만, `scroll` 인수로 표시할 개수를 변경할 수도 있습니다.

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

`options` 클로저가 연관 배열(associative array)을 반환한다면, 해당 클로저는 선택된 키를 인수로 받게 됩니다. 그렇지 않을 경우에는 선택된 값을 인수로 받습니다. 클로저는 에러 메시지를 반환하거나, 유효성 검증을 통과할 경우 `null`을 반환할 수 있습니다.

<a name="multisearch"></a>
### 멀티서치

검색할 옵션이 매우 많고, 사용자가 여러 항목을 선택할 수 있도록 하고 싶다면 `multisearch` 함수를 사용할 수 있습니다. 이 함수는 사용자가 검색어를 입력하여 결과를 필터링한 뒤, 방향키와 스페이스 바로 여러 옵션을 선택하도록 도와줍니다.

```php
use function Laravel\Prompts\multisearch;

$ids = multisearch(
    'Search for the users that should receive the mail',
    fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : []
);
```

여기서 클로저는 사용자가 지금까지 입력한 문자열을 받아 옵션 배열을 반환해야 합니다. 연관 배열을 반환하면 선택된 옵션의 키가 반환되고, 단순 배열의 경우 값이 반환됩니다.

배열을 필터링해서 값을 그대로 반환하려는 경우에는, 배열이 연관 배열이 되지 않도록 `array_values` 함수 또는 컬렉션의 `values` 메서드를 사용해야 합니다.

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

플레이스홀더 텍스트와 설명 문구(hint)를 추가할 수도 있습니다.

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

기본적으로 최대 다섯 개의 옵션이 표시되며, 이후에는 목록이 스크롤됩니다. 표시 개수를 조정하고자 한다면 `scroll` 인수를 지정할 수 있습니다.

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

기본적으로 사용자는 0개 이상의 항목을 선택할 수 있습니다. 1개 이상의 항목 선택을 반드시 요구하려면 `required` 인수를 전달하면 됩니다.

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    required: true
);
```

유효성 검증 메시지를 사용자 정의하고 싶다면, `required` 인수에 문자열로 메시지를 직접 넘길 수도 있습니다.

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

추가적인 유효성 검증이 필요하다면, `validate` 인수에 클로저를 전달하세요.

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

`options` 클로저가 연관 배열을 반환한다면, 이 클로저는 선택된 키 배열을 인수로 받게 되며, 그렇지 않다면 선택된 값 배열을 인수로 받습니다. 이 클로저는 에러 메시지를 반환하거나, 유효성 검증이 통과될 경우 `null`을 반환할 수 있습니다.

<a name="pause"></a>
### 일시 정지(Pause)

`pause` 함수는 사용자에게 정보를 표시한 후, 사용자가 Enter / Return 키를 눌러 계속 진행하기를 기다릴 때 사용할 수 있습니다.

```php
use function Laravel\Prompts\pause;

pause('Press ENTER to continue.');
```

<a name="transforming-input-before-validation"></a>
## 유효성 검증 전 입력값 변환

유효성 검증 전에 프롬프트의 입력값을 변환하고 싶은 경우가 있습니다. 예를 들어, 입력된 문자열의 공백을 제거하고 싶을 수 있습니다. 이를 위해 많은 프롬프트 함수들은 클로저를 받는 `transform` 인수를 제공합니다.

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

여러 개의 프롬프트를 연달아 표시하여 필요한 정보를 모두 수집한 뒤 추가 작업을 하려는 경우가 흔히 있습니다. `form` 함수를 이용하면 사용자가 순차적으로 작성할 수 있는 프롬프트 묶음을 만들 수 있습니다.

```php
use function Laravel\Prompts\form;

$responses = form()
    ->text('What is your name?', required: true)
    ->password('What is your password?', validate: ['password' => 'min:8'])
    ->confirm('Do you accept the terms?')
    ->submit();
```

`submit` 메서드는 폼 내의 각 프롬프트에 입력한 모든 값이 담긴 숫자 인덱스 배열을 반환합니다. 만약 각 프롬프트에 `name` 인수를 지정하면, 해당 이름을 통해 응답값에 접근할 수 있습니다.

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

`form` 함수를 사용하면 사용자가 `CTRL + U` 단축키로 이전 프롬프트로 쉽게 돌아갈 수 있습니다. 이를 통해 실수나 선택을 쉽게 수정할 수 있고, 전체 폼을 취소하지 않고도 진행할 수 있습니다.

폼 내에서 좀 더 세밀하게 프롬프트를 제어하고자 한다면, 프롬프트 함수를 직접 호출하는 대신 `add` 메서드를 사용할 수 있습니다. `add` 메서드는 이전에 입력된 응답 전체를 인수로 전달받습니다.

```php
use function Laravel\Prompts\form;
use function Laravel\Prompts\outro;

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

`note`, `info`, `warning`, `error`, `alert` 함수들을 사용하여 각종 정보 메시지를 보여줄 수 있습니다.

```php
use function Laravel\Prompts\info;

info('Package installed successfully.');
```

<a name="tables"></a>
## 테이블

`table` 함수는 여러 행과 열로 이루어진 데이터를 간단히 표시할 수 있도록 해줍니다. 컬럼 이름과 테이블 데이터를 넘겨주기만 하면 됩니다.

```php
use function Laravel\Prompts\table;

table(
    headers: ['Name', 'Email'],
    rows: User::all(['name', 'email'])->toArray()
);
```

<a name="spin"></a>
## 스핀(Spin)

`spin` 함수는 선택적으로 메시지와 함께 스피너를 표시하며, 지정한 콜백을 실행하는 동안 사용자에게 작업이 진행 중임을 보여줍니다. 작업이 완료되면 콜백의 결과값을 반환합니다.

```php
use function Laravel\Prompts\spin;

$response = spin(
    message: 'Fetching response...',
    callback: fn () => Http::get('http://example.com')
);
```

> [!WARNING]  
> `spin` 함수는 스피너 애니메이션을 위해 `pcntl` PHP 확장 모듈이 필요합니다. 이 확장 모듈이 없으면, 정적인 스피너가 대신 표시됩니다.

<a name="progress"></a>
## 진행률 표시줄(Progress Bars)

오래 걸리는 작업의 경우, 진행률 표시줄을 통해 작업이 얼마나 진행되었는지 사용자에게 안내할 수 있습니다. `progress` 함수를 사용하면, 주어진 이터러블 항목을 반복(iteration)할 때마다 라라벨이 진행 상황을 보여주는 진행률 표시줄을 자동으로 표시합니다.

```php
use function Laravel\Prompts\progress;

$users = progress(
    label: 'Updating users',
    steps: User::all(),
    callback: fn ($user) => $this->performTask($user)
);
```

`progress` 함수는 일반적인 map 함수처럼 동작하며, 콜백의 반환값을 배열로 반환합니다.

콜백에서 `Laravel\Prompts\Progress` 인스턴스를 받아, 각 반복마다 라벨이나 힌트(hint)를 동적으로 변경할 수도 있습니다.

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

진행률 표시줄의 동작을 보다 수동으로 제어하고 싶을 때는, 먼저 전체 스텝 수를 정의합니다. 그런 후 각 항목 처리 후 `advance` 메서드를 호출하여 표시줄을 직접 전진시키면 됩니다.

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

```
use function Laravel\Prompts\clear;

clear();
```

<a name="terminal-considerations"></a>
## 터미널 환경 관련 주의사항

<a name="terminal-width"></a>
#### 터미널 너비

라벨, 옵션, 유효성 검증 메시지 등의 길이가 사용자의 터미널 칼럼 수를 초과할 경우, 해당 문자열은 자동으로 잘려서 표시됩니다. 사용자의 터미널 너비가 좁을 수 있으니, 이러한 문자열의 길이를 최소화하는 것이 좋습니다. 80자 너비의 터미널 환경을 고려하면 최대 74자 정도가 안전합니다.

<a name="terminal-height"></a>
#### 터미널 높이

`scroll` 인수가 사용되는 프롬프트의 경우, 설정된 값은 사용자의 터미널 높이에 맞춰 자동으로 조정되며, 유효성 메시지 표시 공간도 포함합니다.

<a name="fallbacks"></a>
## 지원되지 않는 환경과 대체 동작(Fallbacks)

Laravel Prompts는 macOS, Linux, Windows + WSL 환경을 지원합니다. Windows용 PHP의 한계로 인해, 현재 WSL을 제외한 Windows에서는 Laravel Prompts를 직접 사용할 수 없습니다.

이러한 이유로 Laravel Prompts는 [Symfony Console Question Helper](https://symfony.com/doc/7.0/components/console/helpers/questionhelper.html)와 같은 대체 구현체로 자동 전환(fallback)을 지원합니다.

> [!NOTE]  
> Laravel 프레임워크와 함께 Laravel Prompts를 사용하는 경우, 각 프롬프트의 대체 동작이 이미 구성되어 있으며, 지원되지 않는 환경에서는 자동으로 활성화됩니다.

<a name="fallback-conditions"></a>
#### 대체 동작 조건

Laravel을 사용하지 않거나, 대체 동작이 활성화되는 조건을 직접 지정하고 싶은 경우, `Prompt` 클래스의 `fallbackWhen` 정적 메서드에 불리언 값을 전달할 수 있습니다.

```php
use Laravel\Prompts\Prompt;

Prompt::fallbackWhen(
    ! $input->isInteractive() || windows_os() || app()->runningUnitTests()
);
```

<a name="fallback-behavior"></a>
#### 대체 동작 내용

Laravel을 사용하지 않거나, 대체 동작의 세부 동작을 직접 지정하고자 한다면, 각 프롬프트 클래스의 `fallbackUsing` 정적 메서드에 클로저를 전달하면 됩니다.

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

대체 동작은 각 프롬프트 클래스마다 개별적으로 설정해야 하며, 클로저는 해당 프롬프트 클래스의 인스턴스를 받아 적절한 타입의 결과를 반환해야 합니다.