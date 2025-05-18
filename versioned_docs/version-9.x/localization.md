# 로컬라이제이션 (Localization)

- [소개](#introduction)
    - [로케일 설정](#configuring-the-locale)
    - [복수형 처리 언어](#pluralization-language)
- [번역 문자열 정의](#defining-translation-strings)
    - [짧은 키 사용](#using-short-keys)
    - [번역 문자열을 키로 사용](#using-translation-strings-as-keys)
- [번역 문자열 가져오기](#retrieving-translation-strings)
    - [번역 문자열에서 매개변수 치환](#replacing-parameters-in-translation-strings)
    - [복수형 처리](#pluralization)
- [패키지 언어 파일 오버라이드](#overriding-package-language-files)

<a name="introduction"></a>
## 소개

라라벨의 로컬라이제이션(Localization) 기능을 사용하면 다양한 언어로 문자열을 가져올 수 있어, 애플리케이션에서 여러 언어를 손쉽게 지원할 수 있습니다.

라라벨에서는 번역 문자열을 관리하는 두 가지 방법을 제공합니다. 첫 번째는 `lang` 디렉터리 내에 파일로 번역 문자열을 저장하는 방식입니다. 이 디렉터리 안에는 애플리케이션에서 지원하는 각 언어별로 서브디렉터리를 만들 수 있습니다. 라라벨의 기본 기능(예: 유효성 검증 에러 메시지)도 이런 방법을 사용합니다.

```
/lang
    /en
        messages.php
    /es
        messages.php
```

또는, 번역 문자열을 `lang` 디렉터리 내의 JSON 파일에 정의할 수도 있습니다. 이 때는 애플리케이션에서 지원하는 각 언어마다 해당하는 JSON 파일을 이 디렉터리에 둡니다. 번역해야 할 문자열이 많은 애플리케이션에는 이 방식을 권장합니다.

```
/lang
    en.json
    es.json
```

이 문서에서는 이 두 방식 각각에 대해 자세히 설명합니다.

<a name="configuring-the-locale"></a>
### 로케일 설정

애플리케이션의 기본 언어는 `config/app.php` 설정 파일의 `locale` 옵션에 저장되어 있습니다. 애플리케이션의 필요에 따라 이 값을 자유롭게 변경할 수 있습니다.

또한, `App` 파사드에서 제공하는 `setLocale` 메서드를 사용하면 런타임 중, 특정 HTTP 요청에 대해서 기본 언어를 변경할 수 있습니다.

```
use Illuminate\Support\Facades\App;

Route::get('/greeting/{locale}', function ($locale) {
    if (! in_array($locale, ['en', 'es', 'fr'])) {
        abort(400);
    }

    App::setLocale($locale);

    //
});
```

"대체 언어(fallback language)"도 설정할 수 있습니다. 대체 언어는 현재 활성화된 언어에 특정 번역 문자열이 없을 때 사용됩니다. 기본 언어와 마찬가지로 `config/app.php` 설정 파일에서 지정합니다.

```
'fallback_locale' => 'en',
```

<a name="determining-the-current-locale"></a>
#### 현재 로케일 확인

`App` 파사드의 `currentLocale` 및 `isLocale` 메서드를 사용해 현재 로케일을 확인하거나, 특정 값과 일치하는지 체크할 수 있습니다.

```
use Illuminate\Support\Facades\App;

$locale = App::currentLocale();

if (App::isLocale('en')) {
    //
}
```

<a name="pluralization-language"></a>
### 복수형 처리 언어

Eloquent 등 프레임워크 내부에서는 단어를 단수에서 복수로 변환할 때 "pluralizer(복수형 변환기)"를 사용하는데, 이 언어를 영어가 아닌 다른 언어로 변경할 수 있습니다. 이를 위해 애플리케이션의 서비스 프로바이더 중 하나의 `boot` 메서드에서 `useLanguage` 메서드를 호출하세요. 현재 pluralizer가 지원하는 언어는: `french`, `norwegian-bokmal`, `portuguese`, `spanish`, `turkish`입니다.

```
use Illuminate\Support\Pluralizer;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Pluralizer::useLanguage('spanish');     

    // ...     
}
```

> [!WARNING]
> 복수형 변환기의 언어를 커스터마이즈한 경우, Eloquent 모델의 [테이블명](/docs/9.x/eloquent#table-names)은 반드시 직접 명시적으로 지정해야 합니다.

<a name="defining-translation-strings"></a>
## 번역 문자열 정의

<a name="using-short-keys"></a>
### 짧은 키 사용

일반적으로 번역 문자열은 `lang` 디렉터리 내의 파일에 저장합니다. 이 디렉터리에는 애플리케이션이 지원하는 각 언어별로 서브디렉터리가 있어야 합니다. 라라벨의 기본 기능(예: 유효성 검증 에러 메시지)에서도 이 방식을 사용합니다.

```
/lang
    /en
        messages.php
    /es
        messages.php
```

모든 언어 파일은 키가 붙은 문자열 배열을 반환해야 합니다. 예시:

```
<?php

// lang/en/messages.php

return [
    'welcome' => 'Welcome to our application!',
];
```

> [!WARNING]
> 국가·지역에 따라 구분해야 하는 언어는, 디렉터리 이름을 반드시 ISO 15897 규격에 맞춰 지정해야 합니다. 예를 들어 영국 영어는 `en-gb`가 아니라 `en_GB`로 디렉터리를 만들어야 합니다.

<a name="using-translation-strings-as-keys"></a>
### 번역 문자열을 키로 사용

번역 가능 문자열이 많은 애플리케이션에서는, 모든 번역 문자열에 대해 일일이 "짧은 키"를 만들어 관리하다 보면 뷰에서 참조하기 어렵고, 키 이름을 계속 새로 만드는 작업이 번거롭게 느껴질 수 있습니다.

이런 경우를 위해, 라라벨은 번역 문자열의 "기본" 텍스트 자체를 키로 사용하는 방식을 지원합니다. 이 방식의 번역 파일은 `lang` 디렉터리 내의 JSON 파일로 저장합니다. 예를 들어, 애플리케이션에 스페인어 번역이 있다면 `lang/es.json` 파일을 생성합니다.

```json
{
    "I love programming.": "Me encanta programar."
}
```

#### 키 / 파일 이름 충돌

번역 문자열의 키가 다른 번역 파일명과 충돌하지 않도록 주의해야 합니다. 예를 들어 "NL" 로케일에서 `__('Action')`을 사용했을 때, `nl/action.php` 파일이 존재하지만 `nl.json` 파일이 없다면 번역기는 `nl/action.php`의 내용을 반환합니다.

<a name="retrieving-translation-strings"></a>
## 번역 문자열 가져오기

번역 문자열은 `__` 헬퍼 함수를 사용해 언어 파일에서 손쉽게 가져올 수 있습니다. "짧은 키" 방식으로 번역 문자열을 정의했다면, 해당 키가 위치한 파일명과 키를 "도트(.)" 표기법으로 묶어서 `__` 함수에 전달해야 합니다. 예를 들어, `lang/en/messages.php` 언어 파일에서 `welcome` 번역 문자열을 가져오려면 다음과 같이 사용합니다.

```
echo __('messages.welcome');
```

만약 지정한 번역 문자열이 존재하지 않을 경우, `__` 함수는 전달받은 키 자체를 그대로 반환합니다. 즉 위 예시에서 번역 문자열이 없으면 `messages.welcome`이 반환됩니다.

[번역 문자열 자체를 키로 사용하는 방식](#using-translation-strings-as-keys)을 사용할 때에는, 문자열의 기본 번역값을 그대로 `__` 함수에 전달하면 됩니다.

```
echo __('I love programming.');
```

마찬가지로, 번역 문자열이 없을 경우 `__` 함수에는 넘긴 문자열 그 자체가 반환됩니다.

[Blade 템플릿 엔진](/docs/9.x/blade)을 사용할 때는, `{{ }}` 구문 안에 `__` 함수를 사용해 번역 문자열을 화면에 출력할 수 있습니다.

```
{{ __('messages.welcome') }}
```

<a name="replacing-parameters-in-translation-strings"></a>
### 번역 문자열에서 매개변수 치환

원하는 경우, 번역 문자열 안에 플레이스홀더(치환될 자리)를 정의할 수 있습니다. 플레이스홀더는 모두 `:`가 앞에 붙습니다. 예를 들어, 사용자 이름이 들어가는 환영 메시지에 사용할 수 있습니다.

```
'welcome' => 'Welcome, :name',
```

번역 문자열에서 플레이스홀더를 실제 값으로 치환하려면, 두 번째 인자로 치환할 배열을 `__` 함수에 전달하면 됩니다.

```
echo __('messages.welcome', ['name' => 'dayle']);
```

만약 플레이스홀더 이름이 모두 대문자이거나 첫 글자만 대문자인 경우, 치환된 값도 대소문자가 맞게 표시됩니다.

```
'welcome' => 'Welcome, :NAME', // Welcome, DAYLE
'goodbye' => 'Goodbye, :Name', // Goodbye, Dayle
```

<a name="object-replacement-formatting"></a>
#### 객체 치환 포맷팅

번역 문자열의 플레이스홀더에 객체를 전달하면, 객체의 `__toString` 메서드가 호출됩니다. [`__toString`](https://www.php.net/manual/en/language.oop5.magic.php#object.tostring) 메서드는 PHP에 내장된 "매직 메서드" 중 하나입니다. 하지만 타사 라이브러리에서 제공하는 클래스 등, 직접 `__toString` 메서드를 제어할 수 없는 경우도 있습니다.

이럴 때는, 해당 객체 타입만을 위한 커스텀 포매팅 핸들러를 등록할 수 있습니다. 이를 위해 번역기의 `stringable` 메서드를 사용하면 됩니다. 이 메서드는 클로저를 받아, 포매팅할 객체의 타입을 타입힌트로 명시합니다. 일반적으로 `AppServiceProvider` 클래스의 `boot` 메서드에서 호출하면 됩니다.

```
use Illuminate\Support\Facades\Lang;
use Money\Money;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Lang::stringable(function (Money $money) {
        return $money->formatTo('en_GB');
    });
}
```

<a name="pluralization"></a>
### 복수형 처리

언어마다 복수형 규칙이 복잡하게 다르기 때문에, 복수형 처리(Pluralization)는 쉽지 않은 문제입니다. 하지만 라라벨을 사용하면, 직접 정의한 복수형 규칙에 따라 번역 문자열을 다르게 표시할 수 있습니다. 문자열에서 `|` 문자로 단수와 복수 형태를 구분해서 작성할 수 있습니다.

```
'apples' => 'There is one apple|There are many apples',
```

물론, [번역 문자열을 키로 사용하는 경우](#using-translation-strings-as-keys)에도 복수형 처리를 지원합니다.

```json
{
    "There is one apple|There are many apples": "Hay una manzana|Hay muchas manzanas"
}
```

또한, 다음과 같이 여러 값의 구간별로 번역 문자열을 다르게 정의할 수도 있습니다.

```
'apples' => '{0} There are none|[1,19] There are some|[20,*] There are many',
```

이처럼 복수형 옵션이 있는 번역 문자열을 만든 뒤에는, 특정 "개수"에 따라 번역 문자열을 선택할 수 있는 `trans_choice` 함수를 사용합니다. 아래 예시에서는 개수가 1보다 크므로, 복수형에 해당하는 문자열이 반환됩니다.

```
echo trans_choice('messages.apples', 10);
```

복수형 번역 문자열에도 플레이스홀더를 추가할 수 있습니다. 이때는 `trans_choice` 함수 세 번째 인자로 배열을 전달해 치환합니다.

```
'minutes_ago' => '{1} :value minute ago|[2,*] :value minutes ago',

echo trans_choice('time.minutes_ago', 5, ['value' => 5]);
```

`trans_choice` 함수에 넘긴 숫자 값을 표시하고 싶다면, 내장된 `:count` 플레이스홀더를 활용할 수 있습니다.

```
'apples' => '{0} There are none|{1} There is one|[2,*] There are :count',
```

<a name="overriding-package-language-files"></a>
## 패키지 언어 파일 오버라이드

일부 패키지는 자체 언어 파일을 제공합니다. 만약 패키지의 소스 파일을 직접 수정하지 않고, 일부 번역 문자열만 수정하고 싶다면 `lang/vendor/{package}/{locale}` 디렉터리에 직접 언어 파일을 배치해 오버라이드할 수 있습니다.

예를 들어, `skyrim/hearthfire`라는 패키지의 `messages.php` 파일에서 영어 번역 문자열을 오버라이드하고 싶다면, `lang/vendor/hearthfire/en/messages.php` 파일을 만들어 해당 파일에 원하는 번역 문자열만 정의하세요. 변경하지 않은 문자열은 패키지의 원본 언어 파일에서 계속 불러옵니다.