# 로컬라이제이션 (Localization)

- [소개](#introduction)
    - [언어 파일 퍼블리싱하기](#publishing-the-language-files)
    - [로케일 설정](#configuring-the-locale)
    - [복수형 처리 언어](#pluralization-language)
- [번역 문자열 정의하기](#defining-translation-strings)
    - [짧은 키 사용하기](#using-short-keys)
    - [번역 문자열을 키로 사용하기](#using-translation-strings-as-keys)
- [번역 문자열 가져오기](#retrieving-translation-strings)
    - [번역 문자열에서 파라미터 치환하기](#replacing-parameters-in-translation-strings)
    - [복수형 처리](#pluralization)
- [패키지 언어 파일 오버라이드](#overriding-package-language-files)

<a name="introduction"></a>
## 소개

> [!NOTE]
> 라라벨 애플리케이션 스캐폴드는 기본적으로 `lang` 디렉터리를 포함하고 있지 않습니다. 라라벨의 언어 파일을 커스터마이즈하려면 `lang:publish` Artisan 명령어를 통해 언어 파일을 퍼블리싱할 수 있습니다.

라라벨의 로컬라이제이션 기능은 다양한 언어로 문자열을 손쉽게 가져올 수 있는 방법을 제공합니다. 이를 통해 애플리케이션에서 여러 언어를 손쉽게 지원할 수 있습니다.

라라벨은 번역 문자열(translation string)을 관리하는 두 가지 방법을 제공합니다. 첫 번째 방법은 애플리케이션의 `lang` 디렉터리 안에 파일 형태로 번역 문자열을 저장하는 것입니다. 이 디렉터리 안에는 애플리케이션이 지원하는 각 언어별로 하위 디렉터리를 둘 수 있습니다. 이 방식은 라라벨 내장 기능(예: 유효성 검증 에러 메시지)의 번역 문자열을 처리하는 데 활용됩니다.

```text
/lang
    /en
        messages.php
    /es
        messages.php
```

또한, 번역 문자열을 `lang` 디렉터리에 위치한 JSON 파일 내에 정의할 수도 있습니다. 이 방식을 사용할 경우, 애플리케이션에서 지원하는 각 언어마다 해당 언어에 대응하는 JSON 파일을 같은 디렉터리에 추가하면 됩니다. 이 방법은 번역해야 할 문자열이 많은 애플리케이션에 권장되는 방식입니다.

```text
/lang
    en.json
    es.json
```

이 문서에서는 각각의 번역 문자열 관리 방법에 대해 자세히 설명합니다.

<a name="publishing-the-language-files"></a>
### 언어 파일 퍼블리싱하기

라라벨 애플리케이션 스캐폴드에는 기본적으로 `lang` 디렉터리가 포함되어 있지 않습니다. 만약 라라벨의 언어 파일을 커스터마이징하거나 직접 작성하고 싶다면, `lang:publish` Artisan 명령어를 사용하여 `lang` 디렉터리를 생성하고 언어 파일을 퍼블리싱할 수 있습니다. `lang:publish` 명령어를 실행하면 애플리케이션 내에 `lang` 디렉터리가 만들어지고, 라라벨에서 사용하는 기본 언어 파일들이 퍼블리시 됩니다.

```shell
php artisan lang:publish
```

<a name="configuring-the-locale"></a>
### 로케일 설정

애플리케이션의 기본 언어 설정은 `config/app.php` 설정 파일의 `locale` 옵션에 저장되어 있습니다. 이 옵션은 일반적으로 `APP_LOCALE` 환경 변수로 지정됩니다. 애플리케이션에 맞게 이 값을 자유롭게 변경할 수 있습니다.

또한 "폴백(fallback) 언어"를 설정할 수 있는데, 지정한 기본 언어에서 특정 번역 문자열이 없을 경우 사용됩니다. 폴백 언어 역시 `config/app.php` 파일에서 설정할 수 있으며, 보통 `APP_FALLBACK_LOCALE` 환경 변수를 통해 지정합니다.

실행 중에 특정 HTTP 요청에 대해 기본 언어를 일시적으로 변경하려면 `App` 파사드의 `setLocale` 메서드를 사용할 수 있습니다.

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

현재 설정된 로케일을 확인하거나, 특정 값과 로케일이 일치하는지 확인하려면 `App` 파사드의 `currentLocale`, `isLocale` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\App;

$locale = App::currentLocale();

if (App::isLocale('en')) {
    // ...
}
```

<a name="pluralization-language"></a>
### 복수형 처리 언어

Eloquent나 프레임워크의 다른 부분에서 단수 문자열을 복수형으로 변환할 때 사용되는 라라벨의 "복수형 변환(pluralizer)" 기능이 있습니다. 이 기능은 기본적으로 영어를 사용하지만, 다른 언어를 사용하도록 변경할 수도 있습니다. 변경하려면 애플리케이션의 서비스 프로바이더 중 하나의 `boot` 메서드에서 `useLanguage` 메서드를 호출하면 됩니다. 현재 복수형 변환에서 지원하는 언어는 다음과 같습니다: `french`, `norwegian-bokmal`, `portuguese`, `spanish`, `turkish`.

```php
use Illuminate\Support\Pluralizer;

/**
 * 애플리케이션 서비스 부트스트랩.
 */
public function boot(): void
{
    Pluralizer::useLanguage('spanish');

    // ...
}
```

> [!WARNING]
> 복수형 변환의 언어를 변경하는 경우, Eloquent 모델의 [테이블명](/docs/eloquent#table-names)을 명시적으로 정의해야 합니다.

<a name="defining-translation-strings"></a>
## 번역 문자열 정의하기

<a name="using-short-keys"></a>
### 짧은 키 사용하기

일반적으로 번역 문자열은 `lang` 디렉터리 안의 파일에 저장됩니다. 이 디렉터리 내에는, 애플리케이션이 지원하는 각 언어별로 하위 디렉터리를 만들어 분리해두는 것이 좋습니다. 이 방식은 라라벨 내장 기능(예: 유효성 검증 에러 메시지)의 번역 문자열을 처리하는 기본 방법과 동일합니다.

```text
/lang
    /en
        messages.php
    /es
        messages.php
```

모든 언어 파일은 "키(key) => 값(value)" 형태의 배열을 반환합니다. 예를 들면 아래와 같습니다.

```php
<?php

// lang/en/messages.php

return [
    'welcome' => 'Welcome to our application!',
];
```

> [!WARNING]
> 국가에 따라 구분되는 언어의 경우, 해당 언어 디렉터리는 ISO 15897 규격에 따라 이름을 지정해야 합니다. 예를 들어, 영국 영어의 경우 "en-gb"가 아닌 "en_GB"를 사용해야 합니다.

<a name="using-translation-strings-as-keys"></a>
### 번역 문자열을 키로 사용하기

번역해야 할 문자열이 매우 많은 애플리케이션의 경우, 번역 문자열마다 "짧은 키(short key)"를 매번 만들어 주는 것이 불편하거나, 뷰에서 키를 참조할 때 헷갈릴 수 있습니다.

이런 이유로 라라벨에서는 번역 문자열 자체를 키로 사용하여 번역을 정의하는 "키=문자열" 방식도 지원합니다. 이 방식의 언어 파일은 `lang` 디렉터리 내의 JSON 파일로 저장됩니다. 예를 들어, 스페인어 번역이 필요하다면 `lang/es.json` 파일을 생성해야 합니다.

```json
{
    "I love programming.": "Me encanta programar."
}
```

#### 키/파일 이름 충돌

번역 키가 다른 번역 파일 이름과 충돌하는 경우, 예상치 못한 결과가 발생할 수 있습니다. 예를 들어 "NL" 로케일에서 `__('Action')`를 번역하려고 시도하는데, `nl/action.php` 파일은 존재하지만 `nl.json` 파일이 없는 경우, 번역기는 `nl/action.php`의 전체 내용을 그대로 반환할 수 있습니다.

<a name="retrieving-translation-strings"></a>
## 번역 문자열 가져오기

언어 파일의 번역 문자열은 `__` 헬퍼 함수를 사용하여 가져올 수 있습니다. "짧은 키" 방식으로 번역 문자열을 정의했다면, 해당 키를 포함하는 파일명.키 형태(닷 문법)로 `__` 함수의 인자로 전달해야 합니다. 예를 들어, `lang/en/messages.php` 파일에서 `welcome` 번역 문자열을 가져오려면 다음과 같이 호출합니다.

```php
echo __('messages.welcome');
```

만약 지정한 번역 문자열이 존재하지 않는다면, `__` 함수는 전달받은 키를 그대로 반환합니다. 즉, 위의 예시에서 `"messages.welcome"` 번역 문자열이 없다면 `__` 함수는 `messages.welcome`이라는 텍스트를 반환합니다.

[번역 문자열 자체를 키로 사용](#using-translation-strings-as-keys)하는 방식을 사용한다면, 기본 번역 문자열을 `__` 함수에 전달하면 됩니다.

```php
echo __('I love programming.');
```

이 경우 역시, 지정한 번역 문자열이 존재하지 않으면 입력된 문자열 자체를 반환합니다.

[Blade 템플릿 엔진](/docs/blade)을 사용할 때에는 `{{ }}` 블레이드 이코 문법을 사용하여 번역 문자열을 출력할 수 있습니다.

```blade
{{ __('messages.welcome') }}
```

<a name="replacing-parameters-in-translation-strings"></a>
### 번역 문자열에서 파라미터 치환하기

필요하다면, 번역 문자열 내에 플레이스홀더(placeholder)를 정의할 수 있습니다. 모든 플레이스홀더는 `:` 기호로 시작해야 합니다. 예를 들어, 이름을 포함하는 환영 메시지를 다음과 같이 정의할 수 있습니다.

```php
'welcome' => 'Welcome, :name',
```

번역 문자열을 가져올 때, 두 번째 인자로 대체할 값을 배열로 전달해서 플레이스홀더를 치환할 수 있습니다.

```php
echo __('messages.welcome', ['name' => 'dayle']);
```

플레이스홀더가 모두 대문자이거나 첫 글자만 대문자인 경우, 전달한 값도 대소문자에 맞춰 변환됩니다.

```php
'welcome' => 'Welcome, :NAME', // Welcome, DAYLE
'goodbye' => 'Goodbye, :Name', // Goodbye, Dayle
```

<a name="object-replacement-formatting"></a>
#### 객체 치환 포맷팅

치환 값을 객체로 전달하면, 객체의 `__toString` 메서드가 호출됩니다. [`__toString`](https://www.php.net/manual/en/language.oop5.magic.php#object.tostring) 메서드는 PHP의 내장 매직 메서드입니다. 하지만, 사용하는 클래스가 외부 라이브러리에서 제공된 경우 등 객체의 `__toString`을 제어할 수 없는 상황이 있을 수 있습니다.

이런 경우 라라벨은 특정 객체 타입을 위한 커스텀 포맷터를 등록할 수 있습니다. 이를 위해 번역기의 `stringable` 메서드를 사용합니다. 이 메서드는 타입 힌트가 지정된 클로저를 인자로 받으며, 보통 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 호출하여 등록합니다.

```php
use Illuminate\Support\Facades\Lang;
use Money\Money;

/**
 * 애플리케이션 서비스 부트스트랩.
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

복수형(pluralization)은 언어별로 다양한 규칙을 가지므로 복잡한 문제입니다. 하지만 라라벨에서는 여러분이 직접 정의한 규칙에 따라 문자열을 복수형으로 번역할 수 있도록 도와줍니다. `|` 문자를 이용해서 단수와 복수 형태의 문자열을 구분할 수 있습니다.

```php
'apples' => 'There is one apple|There are many apples',
```

물론, [번역 문자열 자체를 키로 사용](#using-translation-strings-as-keys)하는 경우에도 복수형 처리가 지원됩니다.

```json
{
    "There is one apple|There are many apples": "Hay una manzana|Hay muchas manzanas"
}
```

또한, 복수형 처리 규칙을 확장해서 값의 범위별로 세분화할 수도 있습니다.

```php
'apples' => '{0} There are none|[1,19] There are some|[20,*] There are many',
```

이렇게 복수형 옵션이 포함된 번역 문자열을 정의한 뒤에는, `trans_choice` 함수를 사용해서 특정 개수에 맞는 문자열을 가져올 수 있습니다. 아래 예시에서는 1보다 큰 값이 전달되므로 복수형 문자열이 반환됩니다.

```php
echo trans_choice('messages.apples', 10);
```

또한, 복수형 번역 문자열 내에 플레이스홀더(placeholder)도 사용할 수 있습니다. 이런 경우 `trans_choice`의 세 번째 인자로 값을 전달하면 됩니다.

```php
'minutes_ago' => '{1} :value minute ago|[2,*] :value minutes ago',

echo trans_choice('time.minutes_ago', 5, ['value' => 5]);
```

`trans_choice` 함수에 넘긴 정수 값을 표시하고 싶다면, 내장 플레이스홀더인 `:count` 를 사용할 수 있습니다.

```php
'apples' => '{0} There are none|{1} There is one|[2,*] There are :count',
```

<a name="overriding-package-language-files"></a>
## 패키지 언어 파일 오버라이드

어떤 패키지들은 자체적으로 언어 파일을 포함하고 있을 수 있습니다. 이 파일의 내용을 변경하려고 패키지의 코어 파일을 직접 수정하지 말고, 애플리케이션 내부의 `lang/vendor/{package}/{locale}` 디렉터리에 동일한 파일을 추가해 오버라이드할 수 있습니다.

예를 들어, `skyrim/hearthfire`라는 패키지에서 제공하는 영어 번역 파일 `messages.php`를 수정하고 싶을 때는, `lang/vendor/hearthfire/en/messages.php` 경로에 오버라이드 파일을 작성하면 됩니다. 이 파일에는 오버라이드하고 싶은 번역 문자열만 정의하면 되며, 정의하지 않은 문자열은 그대로 패키지의 원본 언어 파일에서 로드됩니다.
