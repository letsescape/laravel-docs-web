# 로컬라이제이션 (Localization)

- [소개](#introduction)
    - [로케일 설정하기](#configuring-the-locale)
- [번역 문자열 정의하기](#defining-translation-strings)
    - [짧은 키 사용하기](#using-short-keys)
    - [번역 문자열을 키로 사용하기](#using-translation-strings-as-keys)
- [번역 문자열 가져오기](#retrieving-translation-strings)
    - [번역 문자열 내 매개변수 치환](#replacing-parameters-in-translation-strings)
    - [복수형 처리](#pluralization)
- [패키지 언어 파일 재정의하기](#overriding-package-language-files)

<a name="introduction"></a>
## 소개

라라벨의 로컬라이제이션(localization) 기능을 사용하면 다양한 언어의 문자열을 편리하게 가져올 수 있어, 애플리케이션에서 여러 언어를 쉽게 지원할 수 있습니다.

라라벨에서는 번역 문자열을 관리하는 두 가지 방법을 제공합니다. 첫 번째는 `resources/lang` 디렉터리 내에 파일 형태로 언어 문자열을 저장하는 방식입니다. 이 디렉터리 내에는 애플리케이션이 지원하는 각 언어별로 서브디렉터리가 있을 수 있습니다. 라라벨은 기본적으로 유효성 검사 에러 메시지 등 자체 제공 기능의 번역 문자열을 이 방식으로 관리합니다.

```
/resources
    /lang
        /en
            messages.php
        /es
            messages.php
```

또는, 번역 문자열을 `resources/lang` 디렉터리 내의 JSON 파일에 정의할 수도 있습니다. 이 방법을 사용하면 애플리케이션에서 지원하는 각 언어별로 해당 언어의 JSON 파일이 필요합니다. 다수의 번역 문자열을 지원해야 하는 애플리케이션에는 이 방법을 권장합니다.

```
/resources
    /lang
        en.json
        es.json
```

이 문서에서는 위에서 설명한 각각의 번역 문자열 관리 방식을 다룰 것입니다.

<a name="configuring-the-locale"></a>
### 로케일 설정하기

애플리케이션의 기본 언어(로케일)는 `config/app.php` 설정 파일의 `locale` 항목에 저장되어 있습니다. 이 값은 애플리케이션의 요구에 맞게 자유롭게 수정할 수 있습니다.

실행 시간(runtime) 중 단일 HTTP 요청에 대해 기본 언어를 동적으로 변경하려면, `App` 파사드가 제공하는 `setLocale` 메서드를 사용할 수 있습니다.

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

현재 언어로 제공되지 않은 번역 문자열이 있을 때 사용할 수 있는 "대체 언어(fallback language)"도 설정할 수 있습니다. 이 역시 `config/app.php` 설정 파일에서 지정합니다.

```
'fallback_locale' => 'en',
```

<a name="determining-the-current-locale"></a>
#### 현재 로케일 확인하기

현재 애플리케이션의 로케일을 확인하거나, 지정한 값과 일치하는지 확인하려면 `App` 파사드의 `currentLocale` 및 `isLocale` 메서드를 사용할 수 있습니다.

```
use Illuminate\Support\Facades\App;

$locale = App::currentLocale();

if (App::isLocale('en')) {
    //
}
```

<a name="defining-translation-strings"></a>
## 번역 문자열 정의하기

<a name="using-short-keys"></a>
### 짧은 키 사용하기

일반적으로 번역 문자열은 `resources/lang` 디렉터리 내 파일에 저장합니다. 이 디렉터리 내에는 애플리케이션에서 지원하는 각 언어별로 하위 디렉터리가 필요합니다. 라라벨 자체의 유효성 검사 에러 메시지 등 내장 기능의 번역 문자열 역시 이 방식을 사용합니다.

```
/resources
    /lang
        /en
            messages.php
        /es
            messages.php
```

모든 언어 파일은 키(key)와 문자열로 구성된 배열을 반환합니다. 예시:

```
<?php

// resources/lang/en/messages.php

return [
    'welcome' => 'Welcome to our application!',
];
```

> [!NOTE]
> 지역(territory)별로 분리되는 언어의 경우, 언어 디렉터리 이름은 ISO 15897 표준에 따라 지정해야 합니다. 예를 들어, 영국 영어는 "en_GB"로, "en-gb"가 아닌 "en_GB"를 사용해야 합니다.

<a name="using-translation-strings-as-keys"></a>
### 번역 문자열을 키로 사용하기

번역해야 할 문자열이 많은 애플리케이션에서는 각각의 문자열에 "짧은 키"를 부여하여 관리하는 것이 뷰에서 키를 참조할 때 혼동을 줄 수 있고, 계속해서 새로운 키를 만드는 것이 번거로울 수 있습니다.

이러한 경우를 위해, 라라벨에서는 번역 문자열의 "기본값" 자체를 키로 사용하는 방식을 지원합니다. 이 방법을 사용할 때 번역 파일은 `resources/lang` 디렉터리의 JSON 파일로 저장됩니다. 예를 들어, 스페인어 번역을 위해서는 `resources/lang/es.json` 파일을 생성합니다.

```js
{
    "I love programming.": "Me encanta programar."
}
```

#### 키와 파일 이름의 충돌

다른 번역 파일명과 충돌하는 키를 정의하지 않아야 합니다. 예를 들어, "NL" 로케일에서 `__('Action')`을 번역하고자 할 때, 만약 `nl/action.php` 파일이 존재하고 `nl.json` 파일이 없다면, 트랜스레이터는 `nl/action.php` 내용을 반환하게 됩니다.

<a name="retrieving-translation-strings"></a>
## 번역 문자열 가져오기

번역 문자열은 `__` 헬퍼 함수를 통해 언어 파일에서 가져올 수 있습니다. "짧은 키" 형식으로 번역 문자열을 정의한 경우, 해당 키가 들어 있는 파일과 키를 "점(dot) 문법"으로 `__` 함수에 전달해야 합니다. 예를 들어, `resources/lang/en/messages.php` 파일의 `welcome` 번역 문자열을 가져오려면 다음과 같이 작성합니다.

```
echo __('messages.welcome');
```

지정한 번역 문자열이 존재하지 않을 경우, `__` 함수는 전달받은 키 자체를 반환합니다. 위 예시에서 해당 문자열이 없으면 `messages.welcome`이 반환됩니다.

[번역 문자열을 키로 사용하는 방식](#using-translation-strings-as-keys)을 사용할 때에는 기본 번역 문자열을 그대로 `__` 함수에 전달하면 됩니다.

```
echo __('I love programming.');
```

마찬가지로, 번역 문자열이 없을 때는 전달한 문자열(키)이 그대로 반환됩니다.

[Blade 템플릿 엔진](/docs/8.x/blade)을 사용하는 경우, `{{ }}` 출력 구문을 사용해 번역 문자열을 표시할 수 있습니다.

```
{{ __('messages.welcome') }}
```

<a name="replacing-parameters-in-translation-strings"></a>
### 번역 문자열 내 매개변수 치환

필요에 따라 번역 문자열 안에 플레이스홀더(placeholder)를 정의할 수 있습니다. 모든 플레이스홀더는 앞에 `:`가 붙습니다. 예를 들어, 이름 플레이스홀더를 포함한 환영 메시지는 다음과 같이 작성합니다.

```
'welcome' => 'Welcome, :name',
```

번역 문자열을 가져올 때 플레이스홀더를 실제 값으로 치환하려면, `__` 함수의 두 번째 인자로 치환할 값을 배열로 전달합니다.

```
echo __('messages.welcome', ['name' => 'dayle']);
```

플레이스홀더가 모두 대문자이거나, 첫 글자만 대문자인 경우 주어진 값도 이에 맞게 대문자로 대체됩니다.

```
'welcome' => 'Welcome, :NAME', // Welcome, DAYLE
'goodbye' => 'Goodbye, :Name', // Goodbye, Dayle
```

<a name="pluralization"></a>
### 복수형 처리

복수형 처리(pluralization)는 언어마다 규칙이 다양하기 때문에 복잡할 수 있습니다. 하지만 라라벨을 사용하면 직접 정의한 복수형 규칙에 따라 번역 문자열을 다르게 출력할 수 있습니다. 문자열에 `|` 문자를 사용하여 단수와 복수 형식을 구분할 수 있습니다.

```
'apples' => 'There is one apple|There are many apples',
```

[번역 문자열을 키로 사용하는 방식](#using-translation-strings-as-keys)에서도 복수형 처리가 지원됩니다.

```js
{
    "There is one apple|There are many apples": "Hay una manzana|Hay muchas manzanas"
}
```

또한, 값의 범위에 따라 여러 조건으로 복수형을 처리할 수도 있습니다.

```
'apples' => '{0} There are none|[1,19] There are some|[20,*] There are many',
```

복수형 옵션이 정의된 번역 문자열은 `trans_choice` 함수를 사용해 지정한 "개수(count)"에 맞는 형식으로 가져올 수 있습니다. 아래 예시에서 count가 1보다 크기 때문에 복수형이 반환됩니다.

```
echo trans_choice('messages.apples', 10);
```

복수형 번역 문자열 내부에 플레이스홀더 속성도 정의할 수 있습니다. 이 경우 `trans_choice` 함수의 세 번째 인자로 치환 값을 배열로 전달하면 됩니다.

```
'minutes_ago' => '{1} :value minute ago|[2,*] :value minutes ago',

echo trans_choice('time.minutes_ago', 5, ['value' => 5]);
```

`trans_choice` 함수에 넘긴 정수값을 번역 문자열 내에서 그대로 표시하려면 기본 제공되는 `:count` 플레이스홀더를 사용할 수 있습니다.

```
'apples' => '{0} There are none|{1} There is one|[2,*] There are :count',
```

<a name="overriding-package-language-files"></a>
## 패키지 언어 파일 재정의하기

일부 패키지는 자체 언어 파일을 포함하고 있을 수 있습니다. 이런 경우, 패키지의 핵심 파일을 직접 수정하는 대신, `resources/lang/vendor/{package}/{locale}` 디렉터리 내에 파일을 생성하여 원하는 번역 문자열만 재정의할 수 있습니다.

예를 들어, `skyrim/hearthfire`라는 패키지의 `messages.php` 영어 번역 문자열을 재정의하고 싶은 경우, `resources/lang/vendor/hearthfire/en/messages.php`에 번역 파일을 작성하면 됩니다. 이 파일에는 오버라이드하고 싶은 번역 문자열만 정의하면 됩니다. 정의하지 않은 번역 문자열은 패키지의 원본 언어 파일에서 계속 로드됩니다.
