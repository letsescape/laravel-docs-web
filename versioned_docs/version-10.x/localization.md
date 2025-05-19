# 로컬라이제이션 (Localization)

- [소개](#introduction)
    - [언어 파일 배포하기](#publishing-the-language-files)
    - [로케일 설정하기](#configuring-the-locale)
    - [복수형 언어 지정](#pluralization-language)
- [번역 문자열 정의](#defining-translation-strings)
    - [짧은 키 사용하기](#using-short-keys)
    - [번역 문자열을 키로 사용하기](#using-translation-strings-as-keys)
- [번역 문자열 가져오기](#retrieving-translation-strings)
    - [번역 문자열의 매개변수 치환](#replacing-parameters-in-translation-strings)
    - [복수형 처리](#pluralization)
- [패키지 언어 파일 오버라이드](#overriding-package-language-files)

<a name="introduction"></a>
## 소개

> [!NOTE]
> 기본적으로 라라벨 애플리케이션 스캐폴딩에는 `lang` 디렉터리가 포함되어 있지 않습니다. 라라벨의 언어 파일을 커스터마이즈하고 싶다면 `lang:publish` Artisan 명령어를 통해 언어 파일을 배포할 수 있습니다.

라라벨의 로컬라이제이션(localization, 다국어 지원) 기능을 사용하면, 다양한 언어의 문자열을 쉽게 가져올 수 있습니다. 이를 통해 하나의 애플리케이션에서 여러 언어를 편리하게 지원할 수 있습니다.

라라벨은 번역 문자열을 관리하는 두 가지 방법을 제공합니다. 첫 번째 방법은 애플리케이션의 `lang` 디렉터리 내에 언어 파일을 저장하는 것입니다. 이 디렉터리 안에는 애플리케이션에서 지원하는 언어별로 각각의 하위 디렉터리가 존재할 수 있습니다. 이 방식은 유효성 검증 에러 메시지 등 라라벨의 기본 기능에서 사용하는 번역 문자열을 저장할 때 사용됩니다.

```
/lang
    /en
        messages.php
    /es
        messages.php
```

두 번째 방법은 번역 문자열을 JSON 파일로 정의하고 이 파일들을 `lang` 디렉터리에 두는 것입니다. 이 방법을 사용할 경우, 지원하는 각 언어마다 해당 언어의 JSON 파일을 디렉터리 내에 하나씩 만들어야 합니다. 번역할 문자열의 양이 많은 애플리케이션에는 이 방식을 추천합니다.

```
/lang
    en.json
    es.json
```

이 문서에서는 각각의 번역 문자열 관리 방식에 대해 자세히 설명합니다.

<a name="publishing-the-language-files"></a>
### 언어 파일 배포하기

기본적으로 라라벨 애플리케이션 스캐폴딩에는 `lang` 디렉터리가 포함되어 있지 않습니다. 만약 라라벨의 언어 파일을 커스터마이즈하거나 직접 만들고 싶다면, `lang:publish` Artisan 명령어를 사용해 `lang` 디렉터리를 생성하고 라라벨에서 사용하는 기본 언어 파일들을 배포할 수 있습니다.

```shell
php artisan lang:publish
```

<a name="configuring-the-locale"></a>
### 로케일 설정하기

애플리케이션의 기본 언어(로케일)는 `config/app.php` 설정 파일의 `locale` 옵션에 저장되어 있습니다. 여러분의 애플리케이션에 맞게 이 값을 자유롭게 수정하실 수 있습니다.

실행 중에 한 번의 HTTP 요청에 대해 기본 언어를 변경하고 싶다면, `App` 파사드에서 제공하는 `setLocale` 메서드를 사용할 수 있습니다.

```
use Illuminate\Support\Facades\App;

Route::get('/greeting/{locale}', function (string $locale) {
    if (! in_array($locale, ['en', 'es', 'fr'])) {
        abort(400);
    }

    App::setLocale($locale);

    // ...
});
```

"폴백 언어(fallback language)"도 설정할 수 있습니다. 폴백 언어란 현재 사용 중인 언어 파일에 특정 번역 문자열이 없을 때 대신 사용할 언어를 의미합니다. 폴백 언어 역시 `config/app.php` 파일에서 설정합니다.

```
'fallback_locale' => 'en',
```

<a name="determining-the-current-locale"></a>
#### 현재 로케일 값 확인하기

현재 애플리케이션의 로케일이 무엇인지 확인하거나, 특정 로케일과 일치하는지 확인할 때는 `App` 파사드의 `currentLocale` 및 `isLocale` 메서드를 사용할 수 있습니다.

```
use Illuminate\Support\Facades\App;

$locale = App::currentLocale();

if (App::isLocale('en')) {
    // ...
}
```

<a name="pluralization-language"></a>
### 복수형 언어 지정

Eloquent 등 라라벨의 여러 내부 기능에서 단수 문자열을 복수로 변환할 때 사용하는 "pluralizer(복수형 변환기)"의 언어를 영문이 아닌 다른 언어로 지정할 수 있습니다. 이 작업은 애플리케이션의 서비스 프로바이더 클래스에서 `boot` 메서드 안에서 `useLanguage` 메서드를 호출해 설정합니다. 현재 복수형 변환기에서 지원하는 언어는 `french`, `norwegian-bokmal`, `portuguese`, `spanish`, `turkish`입니다.

```
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

> [!NOTE]
> 복수형 변환기 언어를 커스터마이즈할 경우, Eloquent 모델의 [테이블 이름](/docs/10.x/eloquent#table-names)을 명시적으로 지정하는 것이 좋습니다.

<a name="defining-translation-strings"></a>
## 번역 문자열 정의

<a name="using-short-keys"></a>
### 짧은 키 사용하기

일반적으로 번역 문자열은 `lang` 디렉터리 내의 언어 파일들에 저장합니다. 이 디렉터리 안에는 애플리케이션에서 지원하는 언어별 하위 디렉터리가 있어야 합니다. 이 방법은 라라벨의 내장 기능(예: 유효성 검증 오류 메시지 등)에서 사용하는 번역 문자열을 관리하는 방식입니다.

```
/lang
    /en
        messages.php
    /es
        messages.php
```

모든 언어 파일은 키가 할당된 문자열 배열을 반환해야 합니다. 예를 들면 다음과 같습니다.

```
<?php

// lang/en/messages.php

return [
    'welcome' => 'Welcome to our application!',
];
```

> [!NOTE]
> 지역에 따라 구분되는 언어(예: ‘en_GB’)의 디렉터리 이름은 ISO 15897 규격에 따라 작성해야 합니다. 예를 들어, 영국 영어의 경우 "en-gb" 대신 "en_GB"로 디렉터리명을 지정하세요.

<a name="using-translation-strings-as-keys"></a>
### 번역 문자열을 키로 사용하기

번역할 문자열의 수가 많은 애플리케이션의 경우, 각각의 문자열에 짧은 키(short key)를 지정하는 것이 하드코딩할 때 혼란을 일으키거나, 모든 번역 문자열마다 새로운 키를 만들어야 해서 번거로울 수 있습니다.

이런 이유로, 라라벨에서는 번역 문자열의 "원래 내용" 자체를 키로 사용해서 번역을 정의하는 방식도 지원합니다. 이렇게 번역 문자열을 키로 사용하는 언어 파일은 `lang` 디렉터리 내에 JSON 파일로 저장됩니다. 예를 들어, 스페인어 번역이 필요한 경우 `lang/es.json` 파일을 생성할 수 있습니다.

```json
{
    "I love programming.": "Me encanta programar."
}
```

#### 키 / 파일 충돌

다른 번역 파일 이름과 충돌하는 번역 문자열 키를 절대 정의하지 마십시오. 예를 들어, "NL" 로케일에서 `__('Action')`을 번역하려 할 때 `nl/action.php` 파일이 있는 상태에서 `nl.json` 파일이 없다면, 번역기는 `nl/action.php` 전체 내용을 반환할 수 있습니다.

<a name="retrieving-translation-strings"></a>
## 번역 문자열 가져오기

`__` 헬퍼 함수를 사용해서 언어 파일에서 번역 문자열을 가져올 수 있습니다. 만약 짧은 키(short key) 방식으로 번역 문자열을 정의했다면, 파일명과 키를 "닷(dot)" 문법으로 전달해야 합니다. 예를 들어, `lang/en/messages.php` 파일에 들어 있는 `welcome` 번역 문자열을 가져오려면 다음과 같이 할 수 있습니다.

```
echo __('messages.welcome');
```

만약 요청한 번역 문자열이 존재하지 않을 경우, `__` 함수는 번역 문자열의 키를 그대로 반환합니다. 위 예시에서 번역 문자열이 없으면 `__` 함수는 `messages.welcome`을 반환합니다.

[번역 문자열 자체를 키로 사용하는 방식](#using-translation-strings-as-keys)을 활용하는 경우, 문자열의 기본값(원본 내용)을 `__` 함수에 그대로 전달하면 됩니다.

```
echo __('I love programming.');
```

이 역시 마찬가지로, 번역이 존재하지 않으면 전달한 번역 문자열(즉, 키)을 그대로 반환합니다.

[Blade 템플릿 엔진](/docs/10.x/blade)을 사용할 때는 `{{ }}` 이코(echo) 문법으로 번역 문자열을 화면에 출력할 수 있습니다.

```
{{ __('messages.welcome') }}
```

<a name="replacing-parameters-in-translation-strings"></a>
### 번역 문자열의 매개변수 치환

번역 문자열에서 플레이스홀더(placeholder, 자리 표시자)를 사용할 수 있습니다. 플레이스홀더는 항상 `:` 문자로 시작합니다. 예를 들어, 사용자 이름이 들어갈 환영 메시지는 다음과 같이 작성할 수 있습니다.

```
'welcome' => 'Welcome, :name',
```

번역 문자열을 가져올 때 두 번째 인자로 치환할 값을 배열 형식으로 전달하면, 해당 플레이스홀더가 해당 값으로 치환됩니다.

```
echo __('messages.welcome', ['name' => 'dayle']);
```

플레이스홀더가 모두 대문자이거나 첫 글자만 대문자인 경우, 치환되는 값 역시 해당 형식에 맞춰 집어넣어집니다.

```
'welcome' => 'Welcome, :NAME', // Welcome, DAYLE
'goodbye' => 'Goodbye, :Name', // Goodbye, Dayle
```

<a name="object-replacement-formatting"></a>
#### 객체 치환 포맷팅

플레이스홀더 값으로 객체를 전달하면, 해당 객체의 `__toString` 메서드가 호출됩니다. [`__toString`](https://www.php.net/manual/en/language.oop5.magic.php#object.tostring) 메서드는 PHP의 매직 메서드 중 하나입니다. 하지만 때로는, 사용하는 클래스가 외부 라이브러리 소속 등으로 인해 여러분이 `__toString` 메서드를 직접 제어할 수 없는 경우가 있을 수 있습니다.

이럴 때는 라라벨의 커스텀 포맷팅 핸들러를 등록할 수 있습니다. 이를 위해서는 번역기의 `stringable` 메서드를 사용하면 됩니다. `stringable` 메서드는 클로저(익명 함수)를 인자로 받으며, 이 클로저는 포맷팅할 객체 타입을 타입힌트로 지정해야 합니다. 이 메서드는 보통 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 호출합니다.

```
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

복수형 표현은 언어마다 규칙이 달라 복잡하지만, 라라벨에서는 복수형 규칙에 따라 다른 방식으로 문자열을 번역할 수 있도록 도와줍니다. `|` 기호를 사용해 단수형과 복수형을 구분할 수 있습니다.

```
'apples' => 'There is one apple|There are many apples',
```

[번역 문자열 자체를 키로 사용하는 방식](#using-translation-strings-as-keys)을 사용할 때도 복수형 처리를 지원합니다.

```json
{
    "There is one apple|There are many apples": "Hay una manzana|Hay muchas manzanas"
}
```

또한 복수형 규칙을 더 세밀하게 만들어, 값의 범위별로 여러 개의 번역 문자열을 지정할 수도 있습니다.

```
'apples' => '{0} There are none|[1,19] There are some|[20,*] There are many',
```

복수형 옵션이 포함된 번역 문자열을 정의한 후에는, `trans_choice` 함수를 사용해 원하는 "개수"에 맞는 번역 문자열을 가져올 수 있습니다. 예시에서, 개수가 1보다 크다면 복수형이 반환됩니다.

```
echo trans_choice('messages.apples', 10);
```

복수형 번역문에서 플레이스홀더 속성도 사용할 수 있습니다. 세 번째 인자로 치환할 값의 배열을 넘기면, 해당 플레이스홀더가 값으로 치환됩니다.

```
'minutes_ago' => '{1} :value minute ago|[2,*] :value minutes ago',

echo trans_choice('time.minutes_ago', 5, ['value' => 5]);
```

`trans_choice` 함수에 전달한 정수 값을 번역 결과에 표시하고 싶을 때는 내장 플레이스홀더인 `:count`를 사용할 수 있습니다.

```
'apples' => '{0} There are none|{1} There is one|[2,*] There are :count',
```

<a name="overriding-package-language-files"></a>
## 패키지 언어 파일 오버라이드

일부 패키지는 자체 언어 파일을 함께 제공합니다. 패키지의 기본 파일을 직접 변경하지 않고도 번역 내용을 수정하려면, 여러분의 프로젝트의 `lang/vendor/{package}/{locale}` 경로에 오버라이드할 파일을 추가하면 됩니다.

예를 들어, `skyrim/hearthfire`라는 패키지의 영어(`en`) `messages.php` 번역 문자열을 오버라이드하려면, `lang/vendor/hearthfire/en/messages.php` 파일을 생성하세요. 이 파일에는 오버라이드하고 싶은 문자열만 정의하면 됩니다. 오버라이드하지 않은 번역 문자열은 패키지의 원본 언어 파일에서 계속해서 불러와집니다.