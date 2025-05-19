# 로컬라이제이션 (Localization)

- [소개](#introduction)
    - [언어 파일 퍼블리싱하기](#publishing-the-language-files)
    - [로케일 설정하기](#configuring-the-locale)
    - [복수화 언어](#pluralization-language)
- [번역 문자열 정의하기](#defining-translation-strings)
    - [짧은 키 사용하기](#using-short-keys)
    - [번역 문자열 자체를 키로 사용하기](#using-translation-strings-as-keys)
- [번역 문자열 가져오기](#retrieving-translation-strings)
    - [번역 문자열에서 매개변수 치환하기](#replacing-parameters-in-translation-strings)
    - [복수형 처리](#pluralization)
- [패키지 언어 파일 오버라이딩](#overriding-package-language-files)

<a name="introduction"></a>
## 소개

> [!NOTE]
> 기본적으로 라라벨 애플리케이션 스켈레톤에는 `lang` 디렉터리가 포함되어 있지 않습니다. 라라벨의 언어 파일을 커스터마이즈하고 싶다면, `lang:publish` 아티즌 명령어로 언어 파일을 퍼블리시할 수 있습니다.

라라벨의 로컬라이제이션(localization) 기능을 사용하면 다양한 언어로 문자열을 손쉽게 가져올 수 있습니다. 이 기능을 활용하여 애플리케이션이 여러 언어를 지원하도록 쉽게 구현할 수 있습니다.

라라벨에서는 번역 문자열을 관리하는 두 가지 방법을 제공합니다. 첫 번째로, 언어 문자열을 애플리케이션의 `lang` 디렉터리 내부에 파일로 저장하는 방식이 있습니다. 이 디렉터리 안에는 애플리케이션에서 지원하는 각 언어별로 하위 디렉터리를 생성할 수 있습니다. 예를 들어, 라라벨 자체에서 제공하는 유효성 검사 에러 메시지 등도 이런 파일 구조를 사용합니다.

```text
/lang
    /en
        messages.php
    /es
        messages.php
```

또는, 번역 문자열을 `lang` 디렉터리 내부의 JSON 파일로 정의할 수도 있습니다. 이 방식을 사용할 때는, 애플리케이션에서 지원하는 각 언어마다 해당 언어의 JSON 파일을 생성하게 됩니다. 번역해야 할 문자열이 많은 애플리케이션이라면 이 방법을 사용하는 것을 권장합니다.

```text
/lang
    en.json
    es.json
```

이 문서에서는 위에서 소개한 각 번역 문자열 관리 방식을 차례로 살펴봅니다.

<a name="publishing-the-language-files"></a>
### 언어 파일 퍼블리싱하기

기본적으로, 라라벨 애플리케이션 스켈레톤에는 `lang` 디렉터리가 포함되어 있지 않습니다. 라라벨의 언어 파일을 커스터마이즈하거나 새롭게 만들고 싶다면, `lang:publish` 아티즌 명령어를 통해 `lang` 디렉터리 구조를 생성해야 합니다. `lang:publish` 명령어는 애플리케이션 내에 `lang` 디렉터리를 만들고, 라라벨에서 사용하는 기본 언어 파일 세트를 퍼블리시해줍니다.

```shell
php artisan lang:publish
```

<a name="configuring-the-locale"></a>
### 로케일 설정하기

애플리케이션에서 기본적으로 사용할 언어는 `config/app.php` 설정 파일의 `locale` 옵션에 저장되어 있으며, 보통 `APP_LOCALE` 환경 변수로 설정됩니다. 필요에 따라 이 값을 자유롭게 수정할 수 있습니다.

또한, "폴백(fallback) 언어"도 설정할 수 있는데, 기본 언어에서 특정 번역 문자열이 없을 경우 이 폴백 언어가 대신 사용됩니다. 폴백 언어 역시 `config/app.php` 설정 파일에 지정하며, 보통 `APP_FALLBACK_LOCALE` 환경 변수로 값을 설정합니다.

실행 중에 한 번의 HTTP 요청에 대해서만 기본 언어를 변경하고 싶다면, `App` 파사드에서 제공하는 `setLocale` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\App;

Route::get('/greeting/{locale}', function (string $locale) {
    if (! in_array($locale, ['en', 'es', 'fr'])) {
        abort(400);
    }

    App::setLocale($locale);

    // ...
});
```

<a name="determining-the-current-locale"></a>
#### 현재 로케일 확인하기

현재 사용 중인 로케일을 확인하거나, 특정 로케일인지 검사하고 싶을 때는 `App` 파사드의 `currentLocale` 및 `isLocale` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\App;

$locale = App::currentLocale();

if (App::isLocale('en')) {
    // ...
}
```

<a name="pluralization-language"></a>
### 복수화 언어

Eloquent 등 라라벨의 여러 기능에서는 단수 문자열을 복수형으로 변환할 때 "pluralizer(복수형 변환기)"를 사용합니다. 이 때 영어가 아닌 다른 언어를 사용하도록 지정할 수도 있습니다. 복수형 변환 언어를 바꾸려면, 애플리케이션 서비스 프로바이더의 `boot` 메서드에서 `useLanguage` 메서드를 호출하면 됩니다. 현재 지원되는 Pluralizer의 언어는 다음과 같습니다: `french`, `norwegian-bokmal`, `portuguese`, `spanish`, `turkish`.

```php
use Illuminate\Support\Pluralizer;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Pluralizer::useLanguage('spanish');

    // ...
}
```

> [!WARNING]
> 복수형 변환기의 언어를 커스터마이즈한 경우, Eloquent 모델의 [테이블명](/docs/12.x/eloquent#table-names)을 반드시 명시적으로 지정해야 합니다.

<a name="defining-translation-strings"></a>
## 번역 문자열 정의하기

<a name="using-short-keys"></a>
### 짧은 키 사용하기

일반적으로 번역 문자열은 `lang` 디렉터리 내의 파일에 저장합니다. 이 디렉터리 하위에, 애플리케이션에서 지원하는 각 언어별로 하위 디렉터리를 생성하게 됩니다. 라라벨의 기본 제공 언어 리소스(예: 유효성 검사 에러 메시지 등)도 이 구조를 사용하는 방식입니다.

```text
/lang
    /en
        messages.php
    /es
        messages.php
```

모든 언어 파일은 "키(key) - 값(value)" 형태의 배열을 반환해야 합니다. 예시를 보겠습니다.

```php
<?php

// lang/en/messages.php

return [
    'welcome' => 'Welcome to our application!',
];
```

> [!WARNING]
> 영역(territory)이 다른 언어를 지원해야 하는 경우, 언어 디렉터리 이름은 ISO 15897 표준에 따라 지어야 합니다. 예를 들어, 영국 영어는 `en-gb`보다 `en_GB`가 올바른 디렉터리명입니다.

<a name="using-translation-strings-as-keys"></a>
### 번역 문자열 자체를 키로 사용하기

번역해야 할 문자열이 많은 애플리케이션에서는, 모든 문자열마다 "짧은 키"를 지어서 참조하는 것이 오히려 번거롭고 헷갈릴 수 있습니다. 이런 경우에는 번역하려는 문자열의 "기본값" 자체를 키로 사용해서 관리할 수 있습니다. 라라벨은 이런 기능도 지원하며, 이런 방식으로 작성된 언어 파일은 `lang` 디렉터리 아래의 JSON 파일로 저장됩니다. 예를 들어, 스페인어 번역이 필요하다면 `lang/es.json` 파일을 생성하면 됩니다.

```json
{
    "I love programming.": "Me encanta programar."
}
```

#### 키와 파일명 충돌 주의

다른 번역 파일 이름과 충돌하는 키는 정의하지 않아야 합니다. 예를 들어, "NL" 로케일에 대해 `__('Action')`를 번역하려고 할 때, `nl/action.php` 파일은 있지만 `nl.json` 파일이 없는 경우에는, 번역기가 `nl/action.php` 파일 전체 내용을 반환하게 됩니다.

<a name="retrieving-translation-strings"></a>
## 번역 문자열 가져오기

다국어 파일에서 번역 문자열을 가져올 때는 `__` 헬퍼 함수를 사용합니다. 만약 "짧은 키"로 번역 문자열을 정의했다면, 파일명.키 형태의 "도트 문법"을 사용하여 `__` 함수에 전달해야 합니다. 예를 들어, `lang/en/messages.php` 파일의 `welcome` 번역 문자열을 가져오려면 다음과 같이 작성합니다.

```php
echo __('messages.welcome');
```

지정한 번역 문자열이 존재하지 않을 경우, `__` 함수는 키를 그대로 반환합니다. 위의 예시에서, 번역 문자열이 없으면 `__` 함수는 `messages.welcome` 문자열을 그대로 반환합니다.

[번역 문자열 자체를 키로 사용하는 방식](#using-translation-strings-as-keys)을 사용할 때는 기본 번역 문자열을 그대로 `__` 함수에 전달하면 됩니다.

```php
echo __('I love programming.');
```

마찬가지로, 문자열이 존재하지 않으면 넘겨준 번역 문자열 키 그대로 반환됩니다.

[Blade 템플릿 엔진](/docs/12.x/blade)에서도 `{{ }}` 구문으로 번역 문자열을 손쉽게 출력할 수 있습니다.

```blade
{{ __('messages.welcome') }}
```

<a name="replacing-parameters-in-translation-strings"></a>
### 번역 문자열에서 매개변수 치환하기

필요하다면, 번역 문자열 안에 플레이스홀더(치환용 변수)를 정의할 수 있습니다. 모든 플레이스홀더는 `:` 기호로 시작합니다. 예를 들어, 이름을 표시하는 환영 메시지를 정의할 수 있습니다.

```php
'welcome' => 'Welcome, :name',
```

치환할 값을 지정하려면, `__` 함수의 두 번째 인자에 대체할 값을 배열 형태로 넘기면 됩니다.

```php
echo __('messages.welcome', ['name' => 'dayle']);
```

플레이스홀더가 모두 대문자이거나, 첫 글자만 대문자라면, 치환될 값도 동일하게 대문자로 자동 치환됩니다.

```php
'welcome' => 'Welcome, :NAME', // Welcome, DAYLE
'goodbye' => 'Goodbye, :Name', // Goodbye, Dayle
```

<a name="object-replacement-formatting"></a>
#### 객체 치환 포맷팅

플레이스홀더에 객체를 전달하면, 그 객체의 `__toString` 메서드가 자동으로 호출됩니다. [`__toString`](https://www.php.net/manual/en/language.oop5.magic.php#object.tostring) 메서드는 PHP의 내장 "매직 메서드" 중 하나입니다. 하지만, 어떤 클래스의 `__toString` 메서드에 직접 접근할 수 없는 경우도 있습니다(예: 외부 라이브러리의 클래스 등).

이런 상황에서는, 해당 객체 타입만을 위한 커스텀 포맷 handler를 등록할 수 있습니다. 이를 위해서는 트랜슬레이터의 `stringable` 메서드를 호출하면 됩니다. 이 메서드는 클로저를 받으며, 해당 포맷에 대해 type-hint를 지정할 수 있습니다. 보통 이 설정은 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 추가합니다.

```php
use Illuminate\Support\Facades\Lang;
use Money\Money;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Lang::stringable(function (Money $money) {
        return $money->formatTo('en_GB');
    });
}
```

<a name="pluralization"></a>
### 복수형 처리

복수형(pluralization) 처리는 언어마다 규칙이 다양해 복잡할 수 있지만, 라라벨을 사용하면 정의한 복수형 규칙에 따라 문자열 번역을 자동으로 다르게 처리할 수 있습니다. `|` 문자를 사용해서 단수형과 복수형을 구분할 수 있습니다.

```php
'apples' => 'There is one apple|There are many apples',
```

[번역 문자열 자체를 키로 사용하는 방식](#using-translation-strings-as-keys)에서도 복수형 처리가 동일하게 지원됩니다.

```json
{
    "There is one apple|There are many apples": "Hay una manzana|Hay muchas manzanas"
}
```

더 복잡하게, 값의 구간별로 복수형 번역문을 지정할 수도 있습니다.

```php
'apples' => '{0} There are none|[1,19] There are some|[20,*] There are many',
```

복수형 옵션이 있는 번역 문자열을 정의한 후에는, `trans_choice` 함수를 사용하여 주어진 "카운트"(개수)에 맞는 번역문을 가져올 수 있습니다. 아래 예시의 경우, 카운트가 1보다 크므로 복수형 문장이 반환됩니다.

```php
echo trans_choice('messages.apples', 10);
```

복수형 번역문에도 플레이스홀더를 정의할 수 있습니다. 이 때는 대체할 값을 `trans_choice`의 세 번째 인자로 배열 형태로 전달하면 됩니다.

```php
'minutes_ago' => '{1} :value minute ago|[2,*] :value minutes ago',

echo trans_choice('time.minutes_ago', 5, ['value' => 5]);
```

`trans_choice` 함수에 넘긴 정수 값을 그대로 출력하고 싶을 때는, 내장 플레이스홀더인 `:count`를 사용할 수 있습니다.

```php
'apples' => '{0} There are none|{1} There is one|[2,*] There are :count',
```

<a name="overriding-package-language-files"></a>
## 패키지 언어 파일 오버라이딩

일부 패키지들은 자체적인 언어 파일을 포함하고 있을 수 있습니다. 패키지의 코어 파일을 직접 수정해서 번역 문자열을 바꿀 필요 없이, `lang/vendor/{package}/{locale}` 경로에 같은 이름의 파일을 두면 해당 부분만 쉽게 오버라이드할 수 있습니다.

예를 들어, `skyrim/hearthfire`라는 패키지에서 제공하는 영어 번역 문자열(`messages.php`)을 오버라이드하려면 다음 위치에 오버라이드 파일을 두면 됩니다.  
경로: `lang/vendor/hearthfire/en/messages.php`  
이 파일에는 오버라이드하고 싶은 번역 문자열만 정의하면 되고, 나머지 문자열은 그대로 패키지의 원본 언어 파일에서 불러옵니다.