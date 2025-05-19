# 문자열 (Strings)

- [소개](#introduction)
- [사용 가능한 메서드](#available-methods)

<a name="introduction"></a>
## 소개

라라벨은 문자열 값을 조작할 수 있는 다양한 함수를 제공합니다. 이 함수들 중 상당수는 프레임워크 내부적으로도 사용되고 있지만, 여러분이 필요하다고 생각한다면 언제든지 자신의 애플리케이션에서도 자유롭게 활용할 수 있습니다.

<a name="available-methods"></a>
## 사용 가능한 메서드

<a name="strings-method-list"></a>
### 문자열 메서드

<div class="collection-method-list" markdown="1">

[\__](#method-__)
[class_basename](#method-class-basename)
[e](#method-e)
[preg_replace_array](#method-preg-replace-array)
[Str::after](#method-str-after)
[Str::afterLast](#method-str-after-last)
[Str::apa](#method-str-apa)
[Str::ascii](#method-str-ascii)
[Str::before](#method-str-before)
[Str::beforeLast](#method-str-before-last)
[Str::between](#method-str-between)
[Str::betweenFirst](#method-str-between-first)
[Str::camel](#method-camel-case)
[Str::charAt](#method-char-at)
[Str::contains](#method-str-contains)
[Str::containsAll](#method-str-contains-all)
[Str::endsWith](#method-ends-with)
[Str::excerpt](#method-excerpt)
[Str::finish](#method-str-finish)
[Str::headline](#method-str-headline)
[Str::inlineMarkdown](#method-str-inline-markdown)
[Str::is](#method-str-is)
[Str::isAscii](#method-str-is-ascii)
[Str::isJson](#method-str-is-json)
[Str::isUlid](#method-str-is-ulid)
[Str::isUrl](#method-str-is-url)
[Str::isUuid](#method-str-is-uuid)
[Str::kebab](#method-kebab-case)
[Str::lcfirst](#method-str-lcfirst)
[Str::length](#method-str-length)
[Str::limit](#method-str-limit)
[Str::lower](#method-str-lower)
[Str::markdown](#method-str-markdown)
[Str::mask](#method-str-mask)
[Str::orderedUuid](#method-str-ordered-uuid)
[Str::padBoth](#method-str-padboth)
[Str::padLeft](#method-str-padleft)
[Str::padRight](#method-str-padright)
[Str::password](#method-str-password)
[Str::plural](#method-str-plural)
[Str::pluralStudly](#method-str-plural-studly)
[Str::position](#method-str-position)
[Str::random](#method-str-random)
[Str::remove](#method-str-remove)
[Str::repeat](#method-str-repeat)
[Str::replace](#method-str-replace)
[Str::replaceArray](#method-str-replace-array)
[Str::replaceFirst](#method-str-replace-first)
[Str::replaceLast](#method-str-replace-last)
[Str::replaceMatches](#method-str-replace-matches)
[Str::replaceStart](#method-str-replace-start)
[Str::replaceEnd](#method-str-replace-end)
[Str::reverse](#method-str-reverse)
[Str::singular](#method-str-singular)
[Str::slug](#method-str-slug)
[Str::snake](#method-snake-case)
[Str::squish](#method-str-squish)
[Str::start](#method-str-start)
[Str::startsWith](#method-starts-with)
[Str::studly](#method-studly-case)
[Str::substr](#method-str-substr)
[Str::substrCount](#method-str-substrcount)
[Str::substrReplace](#method-str-substrreplace)
[Str::swap](#method-str-swap)
[Str::take](#method-take)
[Str::title](#method-title-case)
[Str::toBase64](#method-str-to-base64)
[Str::toHtmlString](#method-str-to-html-string)
[Str::ucfirst](#method-str-ucfirst)
[Str::ucsplit](#method-str-ucsplit)
[Str::upper](#method-str-upper)
[Str::ulid](#method-str-ulid)
[Str::unwrap](#method-str-unwrap)
[Str::uuid](#method-str-uuid)
[Str::wordCount](#method-str-word-count)
[Str::wordWrap](#method-str-word-wrap)
[Str::words](#method-str-words)
[Str::wrap](#method-str-wrap)
[str](#method-str)
[trans](#method-trans)
[trans_choice](#method-trans-choice)

</div>

<a name="fluent-strings-method-list"></a>
### 유연한 문자열(Fluent Strings)

<div class="collection-method-list" markdown="1">

[after](#method-fluent-str-after)
[afterLast](#method-fluent-str-after-last)
[apa](#method-fluent-str-apa)
[append](#method-fluent-str-append)
[ascii](#method-fluent-str-ascii)
[basename](#method-fluent-str-basename)
[before](#method-fluent-str-before)
[beforeLast](#method-fluent-str-before-last)
[between](#method-fluent-str-between)
[betweenFirst](#method-fluent-str-between-first)
[camel](#method-fluent-str-camel)
[charAt](#method-fluent-str-char-at)
[classBasename](#method-fluent-str-class-basename)
[contains](#method-fluent-str-contains)
[containsAll](#method-fluent-str-contains-all)
[dirname](#method-fluent-str-dirname)
[endsWith](#method-fluent-str-ends-with)
[excerpt](#method-fluent-str-excerpt)
[exactly](#method-fluent-str-exactly)
[explode](#method-fluent-str-explode)
[finish](#method-fluent-str-finish)
[headline](#method-fluent-str-headline)
[inlineMarkdown](#method-fluent-str-inline-markdown)
[is](#method-fluent-str-is)
[isAscii](#method-fluent-str-is-ascii)
[isEmpty](#method-fluent-str-is-empty)
[isNotEmpty](#method-fluent-str-is-not-empty)
[isJson](#method-fluent-str-is-json)
[isUlid](#method-fluent-str-is-ulid)
[isUrl](#method-fluent-str-is-url)
[isUuid](#method-fluent-str-is-uuid)
[kebab](#method-fluent-str-kebab)
[lcfirst](#method-fluent-str-lcfirst)
[length](#method-fluent-str-length)
[limit](#method-fluent-str-limit)
[lower](#method-fluent-str-lower)
[ltrim](#method-fluent-str-ltrim)
[markdown](#method-fluent-str-markdown)
[mask](#method-fluent-str-mask)
[match](#method-fluent-str-match)
[matchAll](#method-fluent-str-match-all)
[isMatch](#method-fluent-str-is-match)
[newLine](#method-fluent-str-new-line)
[padBoth](#method-fluent-str-padboth)
[padLeft](#method-fluent-str-padleft)
[padRight](#method-fluent-str-padright)
[pipe](#method-fluent-str-pipe)
[plural](#method-fluent-str-plural)
[position](#method-fluent-str-position)
[prepend](#method-fluent-str-prepend)
[remove](#method-fluent-str-remove)
[repeat](#method-fluent-str-repeat)
[replace](#method-fluent-str-replace)
[replaceArray](#method-fluent-str-replace-array)
[replaceFirst](#method-fluent-str-replace-first)
[replaceLast](#method-fluent-str-replace-last)
[replaceMatches](#method-fluent-str-replace-matches)
[replaceStart](#method-fluent-str-replace-start)
[replaceEnd](#method-fluent-str-replace-end)
[rtrim](#method-fluent-str-rtrim)
[scan](#method-fluent-str-scan)
[singular](#method-fluent-str-singular)
[slug](#method-fluent-str-slug)
[snake](#method-fluent-str-snake)
[split](#method-fluent-str-split)
[squish](#method-fluent-str-squish)
[start](#method-fluent-str-start)
[startsWith](#method-fluent-str-starts-with)
[stripTags](#method-fluent-str-strip-tags)
[studly](#method-fluent-str-studly)
[substr](#method-fluent-str-substr)
[substrReplace](#method-fluent-str-substrreplace)
[swap](#method-fluent-str-swap)
[take](#method-fluent-str-take)
[tap](#method-fluent-str-tap)
[test](#method-fluent-str-test)
[title](#method-fluent-str-title)
[toBase64](#method-fluent-str-to-base64)
[trim](#method-fluent-str-trim)
[ucfirst](#method-fluent-str-ucfirst)
[ucsplit](#method-fluent-str-ucsplit)
[unwrap](#method-fluent-str-unwrap)
[upper](#method-fluent-str-upper)
[when](#method-fluent-str-when)
[whenContains](#method-fluent-str-when-contains)
[whenContainsAll](#method-fluent-str-when-contains-all)
[whenEmpty](#method-fluent-str-when-empty)
[whenNotEmpty](#method-fluent-str-when-not-empty)
[whenStartsWith](#method-fluent-str-when-starts-with)
[whenEndsWith](#method-fluent-str-when-ends-with)
[whenExactly](#method-fluent-str-when-exactly)
[whenNotExactly](#method-fluent-str-when-not-exactly)
[whenIs](#method-fluent-str-when-is)
[whenIsAscii](#method-fluent-str-when-is-ascii)
[whenIsUlid](#method-fluent-str-when-is-ulid)
[whenIsUuid](#method-fluent-str-when-is-uuid)
[whenTest](#method-fluent-str-when-test)
[wordCount](#method-fluent-str-word-count)
[words](#method-fluent-str-words)

</div>

<a name="strings"></a>
## 문자열

<a name="method-__"></a>
#### `__()`

`__` 함수는 주어진 번역 문자열 또는 번역 키를 [언어 파일](/docs/10.x/localization)을 사용해 번역합니다.

```
echo __('Welcome to our application');

echo __('messages.welcome');
```

만약 지정한 번역 문자열이나 키가 존재하지 않는 경우, `__` 함수는 전달된 값을 그대로 반환합니다. 즉, 위의 예시에서 `messages.welcome`이라는 번역 키가 존재하지 않으면 `__` 함수는 `messages.welcome`을 그대로 반환합니다.

<a name="method-class-basename"></a>
#### `class_basename()`

`class_basename` 함수는 넘겨준 클래스에서 네임스페이스를 제외한 클래스명만 반환합니다.

```
$class = class_basename('Foo\Bar\Baz');

// Baz
```

<a name="method-e"></a>
#### `e()`

`e` 함수는 PHP의 `htmlspecialchars` 함수에 `double_encode` 옵션을 기본값 `true`로 하여 실행합니다.

```
echo e('<html>foo</html>');

// &lt;html&gt;foo&lt;/html&gt;
```

<a name="method-preg-replace-array"></a>
#### `preg_replace_array()`

`preg_replace_array` 함수는 문자열 내에서 지정한 패턴에 일치하는 부분을 주어진 배열의 값들로 순차적으로 치환합니다.

```
$string = 'The event will take place between :start and :end';

$replaced = preg_replace_array('/:[a-z_]+/', ['8:30', '9:00'], $string);

// The event will take place between 8:30 and 9:00
```

<a name="method-str-after"></a>
#### `Str::after()`

`Str::after` 메서드는 문자열에서 지정한 값 이후의 모든 값을 반환합니다. 만약 해당 값이 문자열에 존재하지 않으면 전체 문자열이 반환됩니다.

```
use Illuminate\Support\Str;

$slice = Str::after('This is my name', 'This is');

// ' my name'
```

<a name="method-str-after-last"></a>
#### `Str::afterLast()`

`Str::afterLast` 메서드는 문자열에서 지정한 값이 마지막으로 나온 이후의 모든 값을 반환합니다. 만약 지정한 값이 문자열에 없다면 전체 문자열이 반환됩니다.

```
use Illuminate\Support\Str;

$slice = Str::afterLast('App\Http\Controllers\Controller', '\\');

// 'Controller'
```

<a name="method-str-apa"></a>
#### `Str::apa()`

`Str::apa` 메서드는 [APA 가이드라인](https://apastyle.apa.org/style-grammar-guidelines/capitalization/title-case)에 따라 문자열을 타이틀 케이스로 변환합니다.

```
use Illuminate\Support\Str;

$title = Str::apa('Creating A Project');

// 'Creating a Project'
```

<a name="method-str-ascii"></a>
#### `Str::ascii()`

`Str::ascii` 메서드는 주어진 문자열을 ASCII 값으로 변환(전환)하려 시도합니다.

```
use Illuminate\Support\Str;

$slice = Str::ascii('û');

// 'u'
```

<a name="method-str-before"></a>
#### `Str::before()`

`Str::before` 메서드는 문자열에서 지정한 값 이전의 모든 내용을 반환합니다.

```
use Illuminate\Support\Str;

$slice = Str::before('This is my name', 'my name');

// 'This is '
```

<a name="method-str-before-last"></a>
#### `Str::beforeLast()`

`Str::beforeLast` 메서드는 문자열에서 지정한 값이 마지막으로 등장하기 전까지의 모든 내용을 반환합니다.

```
use Illuminate\Support\Str;

$slice = Str::beforeLast('This is my name', 'is');

// 'This '
```

<a name="method-str-between"></a>
#### `Str::between()`

`Str::between` 메서드는 두 값 사이에 있는 문자열 일부를 반환합니다.

```
use Illuminate\Support\Str;

$slice = Str::between('This is my name', 'This', 'name');

// ' is my '
```

<a name="method-str-between-first"></a>
#### `Str::betweenFirst()`

`Str::betweenFirst` 메서드는 두 값 사이에서 가장 짧게 포함하는 부분(최소의 범위)을 반환합니다.

```
use Illuminate\Support\Str;

$slice = Str::betweenFirst('[a] bc [d]', '[', ']');

// 'a'
```

<a name="method-camel-case"></a>
#### `Str::camel()`

`Str::camel` 메서드는 주어진 문자열을 `camelCase` 형태로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::camel('foo_bar');

// 'fooBar'
```

<a name="method-char-at"></a>
#### `Str::charAt()`

`Str::charAt` 메서드는 지정한 인덱스 위치에 있는 문자를 반환합니다. 만약 인덱스가 범위를 벗어난 경우 `false`를 반환합니다.

```
use Illuminate\Support\Str;

$character = Str::charAt('This is my name.', 6);

// 's'
```

<a name="method-str-contains"></a>
#### `Str::contains()`

`Str::contains` 메서드는 주어진 문자열이 지정한 값을 포함하고 있는지 여부를 판별합니다. 이 메서드는 대소문자를 구분합니다.

```
use Illuminate\Support\Str;

$contains = Str::contains('This is my name', 'my');

// true
```

배열 형태로 여러 값을 전달하면, 주어진 문자열이 그 중 하나라도 포함하는지 확인할 수 있습니다.

```
use Illuminate\Support\Str;

$contains = Str::contains('This is my name', ['my', 'foo']);

// true
```

<a name="method-str-contains-all"></a>
#### `Str::containsAll()`

`Str::containsAll` 메서드는 주어진 문자열에 배열로 전달된 모든 값이 포함되어 있는지 판별합니다.

```
use Illuminate\Support\Str;

$containsAll = Str::containsAll('This is my name', ['my', 'name']);

// true
```

<a name="method-ends-with"></a>
#### `Str::endsWith()`

`Str::endsWith` 메서드는 주어진 문자열이 특정 값으로 끝나는지 여부를 판별합니다.

```
use Illuminate\Support\Str;

$result = Str::endsWith('This is my name', 'name');

// true
```

여러 값을 배열로 전달하면, 그 값들 중 하나로 끝나는지 확인할 수도 있습니다.

```
use Illuminate\Support\Str;

$result = Str::endsWith('This is my name', ['name', 'foo']);

// true

$result = Str::endsWith('This is my name', ['this', 'foo']);

// false
```

<a name="method-excerpt"></a>
#### `Str::excerpt()`

`Str::excerpt` 메서드는 주어진 문자열에서 특정 문구가 처음 나타나는 부분을 중심으로 발췌(부분 추출)한 내용을 반환합니다.

```
use Illuminate\Support\Str;

$excerpt = Str::excerpt('This is my name', 'my', [
    'radius' => 3
]);

// '...is my na...'
```

`radius` 옵션(기본값: 100)을 사용해, 발췌한 문구를 중심으로 좌우에 몇 글자를 표시할지 정할 수 있습니다.

또한, `omission` 옵션으로 앞뒤에 붙일 생략 문자열을 직접 지정할 수도 있습니다.

```
use Illuminate\Support\Str;

$excerpt = Str::excerpt('This is my name', 'name', [
    'radius' => 3,
    'omission' => '(...) '
]);

// '(...) my name'
```

<a name="method-str-finish"></a>
#### `Str::finish()`

`Str::finish` 메서드는 주어진 값으로 끝나지 않는 경우에 한해, 문자열의 끝에 해당 값을 한 번만 덧붙입니다.

```
use Illuminate\Support\Str;

$adjusted = Str::finish('this/string', '/');

// this/string/

$adjusted = Str::finish('this/string/', '/');

// this/string/
```

<a name="method-str-headline"></a>
#### `Str::headline()`

`Str::headline` 메서드는 대/소문자, 하이픈(-) 또는 언더스코어(_)로 구분된 문자열을 띄어쓰기로 나누고, 각 단어의 첫 글자를 대문자로 변환합니다.

```
use Illuminate\Support\Str;

$headline = Str::headline('steve_jobs');

// Steve Jobs

$headline = Str::headline('EmailNotificationSent');

// Email Notification Sent
```

<a name="method-str-inline-markdown"></a>
#### `Str::inlineMarkdown()`

`Str::inlineMarkdown` 메서드는 GitHub 스타일의 마크다운을 [CommonMark](https://commonmark.thephpleague.com/)를 이용해 인라인 HTML로 변환합니다. 단, `markdown` 메서드와 달리 생성된 HTML 전체를 블록 레벨 요소로 감싸지 않습니다.

```
use Illuminate\Support\Str;

$html = Str::inlineMarkdown('**Laravel**');

// <strong>Laravel</strong>
```

#### 마크다운 보안

기본적으로 마크다운은 순수 HTML을 지원합니다. 그러나 사용자 입력을 그대로 사용할 경우, 이는 교차 사이트 스크립팅(XSS) 취약점에 노출될 수 있습니다. [CommonMark 보안 문서](https://commonmark.thephpleague.com/security/)에 따르면, `html_input` 옵션을 사용해 순수 HTML을 이스케이프하거나 제거(stript)할 수 있고, `allow_unsafe_links` 옵션으로 위험한 링크 허용 여부를 지정할 수 있습니다. 만약 일부 순수 HTML만 허용해야 한다면, 마크다운이 변환된 결과를 HTML Purifier에 통과시키는 것이 좋습니다.

```
use Illuminate\Support\Str;

Str::inlineMarkdown('Inject: <script>alert("Hello XSS!");</script>', [
    'html_input' => 'strip',
    'allow_unsafe_links' => false,
]);

// Inject: alert(&quot;Hello XSS!&quot;);
```

<a name="method-str-is"></a>
#### `Str::is()`

`Str::is` 메서드는 주어진 문자열이 지정한 패턴과 일치하는지 확인합니다. 와일드카드 값으로 별표(*)를 사용할 수 있습니다.

```
use Illuminate\Support\Str;

$matches = Str::is('foo*', 'foobar');

// true

$matches = Str::is('baz*', 'foobar');

// false
```

<a name="method-str-is-ascii"></a>

#### `Str::isAscii()`

`Str::isAscii` 메서드는 주어진 문자열이 7비트 ASCII인지 여부를 판단합니다.

```
use Illuminate\Support\Str;

$isAscii = Str::isAscii('Taylor');

// true

$isAscii = Str::isAscii('ü');

// false
```

<a name="method-str-is-json"></a>
#### `Str::isJson()`

`Str::isJson` 메서드는 주어진 문자열이 올바른 JSON 형식인지 확인합니다.

```
use Illuminate\Support\Str;

$result = Str::isJson('[1,2,3]');

// true

$result = Str::isJson('{"first": "John", "last": "Doe"}');

// true

$result = Str::isJson('{first: "John", last: "Doe"}');

// false
```

<a name="method-str-is-url"></a>
#### `Str::isUrl()`

`Str::isUrl` 메서드는 주어진 문자열이 유효한 URL인지 검사합니다.

```
use Illuminate\Support\Str;

$isUrl = Str::isUrl('http://example.com');

// true

$isUrl = Str::isUrl('laravel');

// false
```

`isUrl` 메서드는 다양한 프로토콜을 유효하다고 인식합니다. 하지만, 특정 프로토콜만 유효하도록 제한하고 싶다면 두 번째 인수로 허용할 프로토콜을 전달할 수 있습니다.

```
$isUrl = Str::isUrl('http://example.com', ['http', 'https']);
```

<a name="method-str-is-ulid"></a>
#### `Str::isUlid()`

`Str::isUlid` 메서드는 주어진 문자열이 올바른 ULID인지 여부를 확인합니다.

```
use Illuminate\Support\Str;

$isUlid = Str::isUlid('01gd6r360bp37zj17nxb55yv40');

// true

$isUlid = Str::isUlid('laravel');

// false
```

<a name="method-str-is-uuid"></a>
#### `Str::isUuid()`

`Str::isUuid` 메서드는 주어진 문자열이 올바른 UUID인지 확인합니다.

```
use Illuminate\Support\Str;

$isUuid = Str::isUuid('a0a2a2d2-0b87-4a18-83f2-2529882be2de');

// true

$isUuid = Str::isUuid('laravel');

// false
```

<a name="method-kebab-case"></a>
#### `Str::kebab()`

`Str::kebab` 메서드는 주어진 문자열을 `kebab-case`로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::kebab('fooBar');

// foo-bar
```

<a name="method-str-lcfirst"></a>
#### `Str::lcfirst()`

`Str::lcfirst` 메서드는 문자열의 첫 번째 문자를 소문자로 변환하여 반환합니다.

```
use Illuminate\Support\Str;

$string = Str::lcfirst('Foo Bar');

// foo Bar
```

<a name="method-str-length"></a>
#### `Str::length()`

`Str::length` 메서드는 주어진 문자열의 길이를 반환합니다.

```
use Illuminate\Support\Str;

$length = Str::length('Laravel');

// 7
```

<a name="method-str-limit"></a>
#### `Str::limit()`

`Str::limit` 메서드는 주어진 문자열을 지정한 길이로 잘라줍니다.

```
use Illuminate\Support\Str;

$truncated = Str::limit('The quick brown fox jumps over the lazy dog', 20);

// The quick brown fox...
```

문자열이 잘렸을 때 끝에 추가할 문자열을 세 번째 인수로 지정할 수 있습니다.

```
use Illuminate\Support\Str;

$truncated = Str::limit('The quick brown fox jumps over the lazy dog', 20, ' (...)');

// The quick brown fox (...)
```

<a name="method-str-lower"></a>
#### `Str::lower()`

`Str::lower` 메서드는 주어진 문자열을 모두 소문자로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::lower('LARAVEL');

// laravel
```

<a name="method-str-markdown"></a>
#### `Str::markdown()`

`Str::markdown` 메서드는 GitHub 스타일의 Markdown을 [CommonMark](https://commonmark.thephpleague.com/)를 사용하여 HTML로 변환합니다.

```
use Illuminate\Support\Str;

$html = Str::markdown('# Laravel');

// <h1>Laravel</h1>

$html = Str::markdown('# Taylor <b>Otwell</b>', [
    'html_input' => 'strip',
]);

// <h1>Taylor Otwell</h1>
```

#### 마크다운 보안

기본적으로 Markdown은 원시 HTML을 지원하기 때문에, 사용자 입력값에 직접 사용할 경우 교차 사이트 스크립팅(XSS) 취약점이 발생할 수 있습니다. [CommonMark의 보안 문서](https://commonmark.thephpleague.com/security/)에 따르면, `html_input` 옵션을 사용해 원시 HTML을 이스케이프하거나 제거할 수 있고, `allow_unsafe_links` 옵션을 사용해 안전하지 않은 링크의 허용 여부를 지정할 수 있습니다. 반드시 일부의 원시 HTML만 허용해야 한다면, 컴파일된 마크다운을 HTML Purifier로 한 번 더 필터링하는 것이 좋습니다.

```
use Illuminate\Support\Str;

Str::markdown('Inject: <script>alert("Hello XSS!");</script>', [
    'html_input' => 'strip',
    'allow_unsafe_links' => false,
]);

// <p>Inject: alert(&quot;Hello XSS!&quot;);</p>
```

<a name="method-str-mask"></a>
#### `Str::mask()`

`Str::mask` 메서드는 문자열의 일부를 지정한 문자로 마스킹 처리합니다. 이 기능은 이메일 주소나 전화번호 등 일부 정보를 가려 표현할 때 유용하게 사용할 수 있습니다.

```
use Illuminate\Support\Str;

$string = Str::mask('taylor@example.com', '*', 3);

// tay***************
```

세 번째 인수로 음수를 전달하면, 문자열 끝에서부터 마스킹이 시작됩니다.

```
$string = Str::mask('taylor@example.com', '*', -15, 3);

// tay***@example.com
```

<a name="method-str-ordered-uuid"></a>
#### `Str::orderedUuid()`

`Str::orderedUuid` 메서드는 "타임스탬프 우선" UUID를 생성합니다. 이 UUID는 인덱스된 데이터베이스 컬럼에 저장할 때 효율적으로 정렬될 수 있습니다. 이 메서드로 생성되는 UUID는 이전에 생성된 UUID보다 뒤에 정렬됩니다.

```
use Illuminate\Support\Str;

return (string) Str::orderedUuid();
```

<a name="method-str-padboth"></a>
#### `Str::padBoth()`

`Str::padBoth` 메서드는 PHP의 `str_pad` 함수를 감싸서, 문자열의 양쪽을 지정한 문자로 채워 최종적으로 원하는 길이가 되도록 만들어줍니다.

```
use Illuminate\Support\Str;

$padded = Str::padBoth('James', 10, '_');

// '__James___'

$padded = Str::padBoth('James', 10);

// '  James   '
```

<a name="method-str-padleft"></a>
#### `Str::padLeft()`

`Str::padLeft` 메서드는 PHP의 `str_pad` 함수를 감싸서, 문자열의 왼쪽을 지정한 문자로 채워 최종적으로 원하는 길이가 되도록 만들어줍니다.

```
use Illuminate\Support\Str;

$padded = Str::padLeft('James', 10, '-=');

// '-=-=-James'

$padded = Str::padLeft('James', 10);

// '     James'
```

<a name="method-str-padright"></a>
#### `Str::padRight()`

`Str::padRight` 메서드는 PHP의 `str_pad` 함수를 감싸서, 문자열의 오른쪽을 지정한 문자로 채워 최종적으로 원하는 길이가 되도록 만들어줍니다.

```
use Illuminate\Support\Str;

$padded = Str::padRight('James', 10, '-');

// 'James-----'

$padded = Str::padRight('James', 10);

// 'James     '
```

<a name="method-str-password"></a>
#### `Str::password()`

`Str::password` 메서드는 지정된 길이만큼의 보안성이 높은 랜덤 비밀번호를 생성할 수 있습니다. 비밀번호는 영문, 숫자, 특수문자, 공백이 조합된 형태로 만들어집니다. 기본값은 32자입니다.

```
use Illuminate\Support\Str;

$password = Str::password();

// 'EbJo2vE-AS:U,$%_gkrV4n,q~1xy/-_4'

$password = Str::password(12);

// 'qwuar>#V|i]N'
```

<a name="method-str-plural"></a>
#### `Str::plural()`

`Str::plural` 메서드는 단수형 단어를 복수형으로 변환합니다. 이 함수는 [라라벨의 복수화 도구가 지원하는 언어](https://laravel.com/docs/10.x/localization#pluralization-language) 모두에서 동작합니다.

```
use Illuminate\Support\Str;

$plural = Str::plural('car');

// cars

$plural = Str::plural('child');

// children
```

두 번째 인수로 정수를 전달하면, 단수 또는 복수형 중 올바른 형태를 반환합니다.

```
use Illuminate\Support\Str;

$plural = Str::plural('child', 2);

// children

$singular = Str::plural('child', 1);

// child
```

<a name="method-str-plural-studly"></a>
#### `Str::pluralStudly()`

`Str::pluralStudly` 메서드는 StudlyCaps(첫 글자가 대문자인 형태)의 단어를 복수형으로 변환합니다. 이 함수 역시 [라라벨의 복수화 도구가 지원하는 언어](https://laravel.com/docs/10.x/localization#pluralization-language) 모두에서 사용할 수 있습니다.

```
use Illuminate\Support\Str;

$plural = Str::pluralStudly('VerifiedHuman');

// VerifiedHumans

$plural = Str::pluralStudly('UserFeedback');

// UserFeedback
```

두 번째 인수로 정수를 전달하면, 단수 또는 복수형 중 올바른 형태를 반환합니다.

```
use Illuminate\Support\Str;

$plural = Str::pluralStudly('VerifiedHuman', 2);

// VerifiedHumans

$singular = Str::pluralStudly('VerifiedHuman', 1);

// VerifiedHuman
```

<a name="method-str-position"></a>
#### `Str::position()`

`Str::position` 메서드는 문자열에서 특정 부분 문자열이 처음으로 등장하는 위치(인덱스)를 반환합니다. 해당 부분 문자열이 존재하지 않으면 `false`를 반환합니다.

```
use Illuminate\Support\Str;

$position = Str::position('Hello, World!', 'Hello');

// 0

$position = Str::position('Hello, World!', 'W');

// 7
```

<a name="method-str-random"></a>
#### `Str::random()`

`Str::random` 메서드는 지정한 길이만큼의 랜덤 문자열을 생성합니다. 이 함수는 PHP의 `random_bytes` 함수를 사용합니다.

```
use Illuminate\Support\Str;

$random = Str::random(40);
```

테스트 시에는 `Str::random` 메서드가 반환하는 값을 "임의로 지정된 값"으로 대체할 수도 있습니다. 이를 위해 `createRandomStringsUsing` 메서드를 사용합니다.

```
Str::createRandomStringsUsing(function () {
    return 'fake-random-string';
});
```

다시 원래처럼 무작위 문자열을 생성하도록 하려면, `createRandomStringsNormally` 메서드를 사용할 수 있습니다.

```
Str::createRandomStringsNormally();
```

<a name="method-str-remove"></a>
#### `Str::remove()`

`Str::remove` 메서드는 문자열에서 지정한 값 또는 값 배열에 해당하는 부분을 삭제합니다.

```
use Illuminate\Support\Str;

$string = 'Peter Piper picked a peck of pickled peppers.';

$removed = Str::remove('e', $string);

// Ptr Pipr pickd a pck of pickld ppprs.
```

세 번째 인수로 `false`를 전달하면, 대소문자를 구분하지 않고 문자열을 제거할 수 있습니다.

<a name="method-str-repeat"></a>
#### `Str::repeat()`

`Str::repeat` 메서드는 지정한 문자열을 원하는 횟수만큼 반복하여 반환합니다.

```php
use Illuminate\Support\Str;

$string = 'a';

$repeat = Str::repeat($string, 5);

// aaaaa
```

<a name="method-str-replace"></a>
#### `Str::replace()`

`Str::replace` 메서드는 문자열 내에서 특정 문자열을 다른 문자열로 교체합니다.

```
use Illuminate\Support\Str;

$string = 'Laravel 8.x';

$replaced = Str::replace('8.x', '9.x', $string);

// Laravel 9.x
```

이 메서드는 `caseSensitive` 인수도 지원합니다. 기본적으로 `replace` 메서드는 대소문자를 구분합니다.

```
Str::replace('Framework', 'Laravel', caseSensitive: false);
```

<a name="method-str-replace-array"></a>
#### `Str::replaceArray()`

`Str::replaceArray` 메서드는 배열을 이용해 문자열 내의 지정한 값을 순서대로 교체합니다.

```
use Illuminate\Support\Str;

$string = 'The event will take place between ? and ?';

$replaced = Str::replaceArray('?', ['8:30', '9:00'], $string);

// The event will take place between 8:30 and 9:00
```

<a name="method-str-replace-first"></a>
#### `Str::replaceFirst()`

`Str::replaceFirst` 메서드는 문자열에서 지정한 값이 처음 등장하는 부분만 교체합니다.

```
use Illuminate\Support\Str;

$replaced = Str::replaceFirst('the', 'a', 'the quick brown fox jumps over the lazy dog');

// a quick brown fox jumps over the lazy dog
```

<a name="method-str-replace-last"></a>
#### `Str::replaceLast()`

`Str::replaceLast` 메서드는 문자열에서 지정한 값이 마지막으로 등장하는 부분만 교체합니다.

```
use Illuminate\Support\Str;

$replaced = Str::replaceLast('the', 'a', 'the quick brown fox jumps over the lazy dog');

// the quick brown fox jumps over a lazy dog
```

<a name="method-str-replace-matches"></a>
#### `Str::replaceMatches()`

`Str::replaceMatches` 메서드는 패턴에 일치하는 문자열의 모든 부분을 주어진 문자열로 대체합니다.

```
use Illuminate\Support\Str;

$replaced = Str::replaceMatches(
    pattern: '/[^A-Za-z0-9]++/',
    replace: '',
    subject: '(+1) 501-555-1000'
)

// '15015551000'
```

`replaceMatches` 메서드는 클로저(익명 함수)를 인수로 받을 수 있으며, 패턴에 일치하는 각 부분을 처리한 결과로 대체할 수 있습니다.

```
use Illuminate\Support\Str;

$replaced = Str::replaceMatches('/\d/', function (array $matches) {
    return '['.$matches[0].']';
}, '123');

// '[1][2][3]'
```

<a name="method-str-replace-start"></a>
#### `Str::replaceStart()`

`Str::replaceStart` 메서드는 문자열의 시작 부분에만 지정한 값이 있을 때에만 이 값을 교체합니다.

```
use Illuminate\Support\Str;

$replaced = Str::replaceStart('Hello', 'Laravel', 'Hello World');

// Laravel World

$replaced = Str::replaceStart('World', 'Laravel', 'Hello World');

// Hello World
```

<a name="method-str-replace-end"></a>
#### `Str::replaceEnd()`

`Str::replaceEnd` 메서드는 문자열의 끝 부분에만 지정한 값이 있을 때에만 이 값을 교체합니다.

```
use Illuminate\Support\Str;

$replaced = Str::replaceEnd('World', 'Laravel', 'Hello World');

// Hello Laravel

$replaced = Str::replaceEnd('Hello', 'Laravel', 'Hello World');

// Hello World
```

<a name="method-str-reverse"></a>

#### `Str::reverse()`

`Str::reverse` 메서드는 주어진 문자열을 거꾸로 뒤집어 반환합니다.

```
use Illuminate\Support\Str;

$reversed = Str::reverse('Hello World');

// dlroW olleH
```

<a name="method-str-singular"></a>
#### `Str::singular()`

`Str::singular` 메서드는 문자열을 단수형으로 변환합니다. 이 함수는 [라라벨의 복수화 기능에서 지원하는 모든 언어](/docs/10.x/localization#pluralization-language)를 지원합니다.

```
use Illuminate\Support\Str;

$singular = Str::singular('cars');

// car

$singular = Str::singular('children');

// child
```

<a name="method-str-slug"></a>
#### `Str::slug()`

`Str::slug` 메서드는 주어진 문자열로부터 URL에 적합한 "슬러그(slug)" 문자열을 생성합니다.

```
use Illuminate\Support\Str;

$slug = Str::slug('Laravel 5 Framework', '-');

// laravel-5-framework
```

<a name="method-snake-case"></a>
#### `Str::snake()`

`Str::snake` 메서드는 주어진 문자열을 `snake_case` 형식으로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::snake('fooBar');

// foo_bar

$converted = Str::snake('fooBar', '-');

// foo-bar
```

<a name="method-str-squish"></a>
#### `Str::squish()`

`Str::squish` 메서드는 문자열에서 단어 사이를 포함한 모든 불필요한 공백을 제거합니다.

```
use Illuminate\Support\Str;

$string = Str::squish('    laravel    framework    ');

// laravel framework
```

<a name="method-str-start"></a>
#### `Str::start()`

`Str::start` 메서드는 주어진 값으로 시작하지 않는다면 해당 값을 문자열 앞에 한 번만 추가합니다.

```
use Illuminate\Support\Str;

$adjusted = Str::start('this/string', '/');

// /this/string

$adjusted = Str::start('/this/string', '/');

// /this/string
```

<a name="method-starts-with"></a>
#### `Str::startsWith()`

`Str::startsWith` 메서드는 주어진 문자열이 특정 값으로 시작하는지 확인합니다.

```
use Illuminate\Support\Str;

$result = Str::startsWith('This is my name', 'This');

// true
```

만약 여러 값이 담긴 배열을 전달하면, 해당 배열 중 어느 값으로 시작하더라도 `startsWith` 메서드는 `true`를 반환합니다.

```
$result = Str::startsWith('This is my name', ['This', 'That', 'There']);

// true
```

<a name="method-studly-case"></a>
#### `Str::studly()`

`Str::studly` 메서드는 주어진 문자열을 `StudlyCase`로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::studly('foo_bar');

// FooBar
```

<a name="method-str-substr"></a>
#### `Str::substr()`

`Str::substr` 메서드는 지정한 시작 위치와 길이에 따라 해당 부분 문자열을 반환합니다.

```
use Illuminate\Support\Str;

$converted = Str::substr('The Laravel Framework', 4, 7);

// Laravel
```

<a name="method-str-substrcount"></a>
#### `Str::substrCount()`

`Str::substrCount` 메서드는 주어진 문자열 내에서 특정 값이 등장하는 횟수를 반환합니다.

```
use Illuminate\Support\Str;

$count = Str::substrCount('If you like ice cream, you will like snow cones.', 'like');

// 2
```

<a name="method-str-substrreplace"></a>
#### `Str::substrReplace()`

`Str::substrReplace` 메서드는 지정한 위치(세 번째 인자)에서부터 주어진 길이(네 번째 인자)만큼 문자열을 대체합니다. 네 번째 인자에 `0`을 넘기면, 기존 문자를 대체하지 않고 해당 위치에 새 문자열을 삽입하게 됩니다.

```
use Illuminate\Support\Str;

$result = Str::substrReplace('1300', ':', 2);
// 13:

$result = Str::substrReplace('1300', ':', 2, 0);
// 13:00
```

<a name="method-str-swap"></a>
#### `Str::swap()`

`Str::swap` 메서드는 PHP의 `strtr` 함수를 사용해 주어진 문자열에서 여러 값을 한 번에 치환합니다.

```
use Illuminate\Support\Str;

$string = Str::swap([
    'Tacos' => 'Burritos',
    'great' => 'fantastic',
], 'Tacos are great!');

// Burritos are fantastic!
```

<a name="method-take"></a>
#### `Str::take()`

`Str::take` 메서드는 문자열의 앞에서부터 지정한 개수만큼의 문자를 반환합니다.

```
use Illuminate\Support\Str;

$taken = Str::take('Build something amazing!', 5);

// Build
```

<a name="method-title-case"></a>
#### `Str::title()`

`Str::title` 메서드는 주어진 문자열을 `Title Case`(각 단어의 첫 글자를 대문자로)로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::title('a nice title uses the correct case');

// A Nice Title Uses The Correct Case
```

<a name="method-str-to-base64"></a>
#### `Str::toBase64()`

`Str::toBase64` 메서드는 주어진 문자열을 Base64로 인코딩합니다.

```
use Illuminate\Support\Str;

$base64 = Str::toBase64('Laravel');

// TGFyYXZlbA==
```

<a name="method-str-to-html-string"></a>
#### `Str::toHtmlString()`

`Str::toHtmlString` 메서드는 문자열 인스턴스를 `Illuminate\Support\HtmlString` 인스턴스로 변환하여, Blade 템플릿 등에서 표시할 수 있게 합니다.

```
use Illuminate\Support\Str;

$htmlString = Str::of('Nuno Maduro')->toHtmlString();
```

<a name="method-str-ucfirst"></a>
#### `Str::ucfirst()`

`Str::ucfirst` 메서드는 주어진 문자열의 첫 글자를 대문자로 변환합니다.

```
use Illuminate\Support\Str;

$string = Str::ucfirst('foo bar');

// Foo bar
```

<a name="method-str-ucsplit"></a>
#### `Str::ucsplit()`

`Str::ucsplit` 메서드는 문자열을 대문자를 기준으로 잘라 배열로 반환합니다.

```
use Illuminate\Support\Str;

$segments = Str::ucsplit('FooBar');

// [0 => 'Foo', 1 => 'Bar']
```

<a name="method-str-upper"></a>
#### `Str::upper()`

`Str::upper` 메서드는 주어진 문자열을 모두 대문자로 변환합니다.

```
use Illuminate\Support\Str;

$string = Str::upper('laravel');

// LARAVEL
```

<a name="method-str-ulid"></a>
#### `Str::ulid()`

`Str::ulid` 메서드는 ULID(Compact, 시간 순서가 보장되는 고유 식별자)를 생성합니다.

```
use Illuminate\Support\Str;

return (string) Str::ulid();

// 01gd6r360bp37zj17nxb55yv40
```

생성된 ULID의 생성 일시를 나타내는 `Illuminate\Support\Carbon` 날짜 인스턴스를 얻으려면, 라라벨의 Carbon 통합에서 제공하는 `createFromId` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

$date = Carbon::createFromId((string) Str::ulid());
```

테스트 시, `Str::ulid` 메서드가 반환하는 값을 임의로 지정해야 할 경우, `createUlidsUsing` 메서드를 활용할 수 있습니다.

```
use Symfony\Component\Uid\Ulid;

Str::createUlidsUsing(function () {
    return new Ulid('01HRDBNHHCKNW2AK4Z29SN82T9');
});
```

ULID 값 생성 방식을 원래대로 되돌리고 싶다면, `createUlidsNormally` 메서드를 호출하면 됩니다.

```
Str::createUlidsNormally();
```

<a name="method-str-unwrap"></a>
#### `Str::unwrap()`

`Str::unwrap` 메서드는 주어진 문자열의 시작과 끝에서 지정한 문자열을 제거합니다.

```
use Illuminate\Support\Str;

Str::unwrap('-Laravel-', '-');

// Laravel

Str::unwrap('{framework: "Laravel"}', '{', '}');

// framework: "Laravel"
```

<a name="method-str-uuid"></a>
#### `Str::uuid()`

`Str::uuid` 메서드는 UUID(버전 4)를 생성합니다.

```
use Illuminate\Support\Str;

return (string) Str::uuid();
```

테스트 시, `Str::uuid` 메서드가 반환하는 값을 임의로 지정하려면 `createUuidsUsing` 메서드를 활용할 수 있습니다.

```
use Ramsey\Uuid\Uuid;

Str::createUuidsUsing(function () {
    return Uuid::fromString('eadbfeac-5258-45c2-bab7-ccb9b5ef74f9');
});
```

UUID 값 생성 방식을 일반적인 방식으로 되돌리고 싶다면 `createUuidsNormally` 메서드를 호출하세요.

```
Str::createUuidsNormally();
```

<a name="method-str-word-count"></a>
#### `Str::wordCount()`

`Str::wordCount` 메서드는 문자열 안에 단어가 몇 개인지 반환합니다.

```php
use Illuminate\Support\Str;

Str::wordCount('Hello, world!'); // 2
```

<a name="method-str-word-wrap"></a>
#### `Str::wordWrap()`

`Str::wordWrap` 메서드는 문자열을 지정한 개수의 문자 단위로 줄 바꿈 처리합니다.

```
use Illuminate\Support\Str;

$text = "The quick brown fox jumped over the lazy dog."

Str::wordWrap($text, characters: 20, break: "<br />\n");

/*
The quick brown fox<br />
jumped over the lazy<br />
dog.
*/
```

<a name="method-str-words"></a>
#### `Str::words()`

`Str::words` 메서드는 문자열의 단어 개수를 제한합니다. 세 번째 인자에 추가 문자열을 지정하여, 잘려진 끝에 덧붙일 문자열을 설정할 수 있습니다.

```
use Illuminate\Support\Str;

return Str::words('Perfectly balanced, as all things should be.', 3, ' >>>');

// Perfectly balanced, as >>>
```

<a name="method-str-wrap"></a>
#### `Str::wrap()`

`Str::wrap` 메서드는 지정한 단일 문자열 또는 한 쌍의 문자열로 주어진 문자열을 감쌉니다.

```
use Illuminate\Support\Str;

Str::wrap('Laravel', '"');

// "Laravel"

Str::wrap('is', before: 'This ', after: ' Laravel!');

// This is Laravel!
```

<a name="method-str"></a>
#### `str()`

`str` 함수는 주어진 문자열에 대해 새로운 `Illuminate\Support\Stringable` 인스턴스를 반환합니다. 이 함수는 `Str::of` 메서드와 동일합니다.

```
$string = str('Taylor')->append(' Otwell');

// 'Taylor Otwell'
```

인자를 전달하지 않으면, 이 함수는 `Illuminate\Support\Str` 인스턴스를 반환합니다.

```
$snake = str()->snake('FooBar');

// 'foo_bar'
```

<a name="method-trans"></a>
#### `trans()`

`trans` 함수는 지정한 번역 키를 사용하여 [언어 파일](/docs/10.x/localization)에서 해당 텍스트를 번역해 반환합니다.

```
echo trans('messages.welcome');
```

지정한 번역 키가 존재하지 않으면, `trans` 함수는 전달한 키 자체를 반환합니다. 즉, 위 예시에서 해당 키가 없다면 `messages.welcome`을 그대로 반환합니다.

<a name="method-trans-choice"></a>
#### `trans_choice()`

`trans_choice` 함수는 변환 키에 맞게 복수/단수 등 어형을 적용하여 번역합니다.

```
echo trans_choice('messages.notifications', $unreadCount);
```

지정한 키가 없다면, `trans_choice` 함수도 전달된 키 자체를 반환합니다. 따라서 예시의 경우 키가 존재하지 않으면 `messages.notifications`가 반환됩니다.

<a name="fluent-strings"></a>
## 플루언트(Fluent) 문자열

플루언트 문자열은 좀 더 객체지향적이고 유연한 방식으로 문자열 값을 다룰 수 있는 인터페이스를 제공합니다. 이를 통해 기존의 문자열 함수보다 가독성 높고 체이닝이 가능한 구문으로 여러 문자열 처리를 연속 실행할 수 있습니다.

<a name="method-fluent-str-after"></a>
#### `after`

`after` 메서드는 문자열에서 주어진 값 이후의 모든 내용을 반환합니다. 해당 값이 문자열 내에 존재하지 않으면 전체 문자열이 반환됩니다.

```
use Illuminate\Support\Str;

$slice = Str::of('This is my name')->after('This is');

// ' my name'
```

<a name="method-fluent-str-after-last"></a>
#### `afterLast`

`afterLast` 메서드는 문자열 안에서 주어진 값이 마지막으로 나타난 이후의 모든 내용을 반환합니다. 해당 값이 존재하지 않을 경우 전체 문자열을 반환합니다.

```
use Illuminate\Support\Str;

$slice = Str::of('App\Http\Controllers\Controller')->afterLast('\\');

// 'Controller'
```

<a name="method-fluent-str-apa"></a>
#### `apa`

`apa` 메서드는 [APA 스타일 가이드라인](https://apastyle.apa.org/style-grammar-guidelines/capitalization/title-case)에 따라 주어진 문자열을 타이틀 케이스로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::of('a nice title uses the correct case')->apa();

// A Nice Title Uses the Correct Case
```

<a name="method-fluent-str-append"></a>
#### `append`

`append` 메서드는 지정한 값을 문자열 끝에 추가합니다.

```
use Illuminate\Support\Str;

$string = Str::of('Taylor')->append(' Otwell');

// 'Taylor Otwell'
```

<a name="method-fluent-str-ascii"></a>
#### `ascii`

`ascii` 메서드는 주어진 문자열을 가능한 한 ASCII 문자열로 변환합니다.

```
use Illuminate\Support\Str;

$string = Str::of('ü')->ascii();

// 'u'
```

<a name="method-fluent-str-basename"></a>
#### `basename`

`basename` 메서드는 주어진 문자열에서 마지막 경로 컴포넌트(파일명 등)만 반환합니다.

```
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz')->basename();

// 'baz'
```

필요하다면 확장자(예: `.jpg`)를 인자로 전달하여 마지막 컴포넌트에서 확장자를 제거할 수도 있습니다.

```
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz.jpg')->basename('.jpg');

// 'baz'
```

<a name="method-fluent-str-before"></a>
#### `before`

`before` 메서드는 주어진 값이 등장하기 전까지의 부분 문자열을 반환합니다.

```
use Illuminate\Support\Str;

$slice = Str::of('This is my name')->before('my name');

// 'This is '
```

<a name="method-fluent-str-before-last"></a>
#### `beforeLast`

`beforeLast` 메서드는 문자열 안에서 지정한 값이 마지막으로 등장하기 전까지의 모든 내용을 반환합니다.

```
use Illuminate\Support\Str;

$slice = Str::of('This is my name')->beforeLast('is');

// 'This '
```

<a name="method-fluent-str-between"></a>

#### `between`

`between` 메서드는 두 값 사이에 위치한 문자열의 일부를 반환합니다.

```
use Illuminate\Support\Str;

$converted = Str::of('This is my name')->between('This', 'name');

// ' is my '
```

<a name="method-fluent-str-between-first"></a>
#### `betweenFirst`

`betweenFirst` 메서드는 두 값 사이에 위치한 가장 짧은(최소 범위의) 문자열 일부를 반환합니다.

```
use Illuminate\Support\Str;

$converted = Str::of('[a] bc [d]')->betweenFirst('[', ']');

// 'a'
```

<a name="method-fluent-str-camel"></a>
#### `camel`

`camel` 메서드는 주어진 문자열을 `camelCase` 형태로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::of('foo_bar')->camel();

// 'fooBar'
```

<a name="method-fluent-str-char-at"></a>
#### `charAt`

`charAt` 메서드는 지정한 인덱스 위치의 문자를 반환합니다. 만약 인덱스가 범위를 벗어난 경우 `false`를 반환합니다.

```
use Illuminate\Support\Str;

$character = Str::of('This is my name.')->charAt(6);

// 's'
```

<a name="method-fluent-str-class-basename"></a>
#### `classBasename`

`classBasename` 메서드는 주어진 클래스에서 네임스페이스를 제거한 뒤, 클래스명만을 반환합니다.

```
use Illuminate\Support\Str;

$class = Str::of('Foo\Bar\Baz')->classBasename();

// 'Baz'
```

<a name="method-fluent-str-contains"></a>
#### `contains`

`contains` 메서드는 주어진 문자열이 특정 값을 포함하는지 판별합니다. 이 메서드는 대소문자를 구분합니다.

```
use Illuminate\Support\Str;

$contains = Str::of('This is my name')->contains('my');

// true
```

값의 배열을 전달하면, 해당 배열 중 하나라도 문자열에 포함되어 있는지 확인할 수 있습니다.

```
use Illuminate\Support\Str;

$contains = Str::of('This is my name')->contains(['my', 'foo']);

// true
```

<a name="method-fluent-str-contains-all"></a>
#### `containsAll`

`containsAll` 메서드는 주어진 문자열이, 전달된 배열 내 모든 값을 포함하는지 판별합니다.

```
use Illuminate\Support\Str;

$containsAll = Str::of('This is my name')->containsAll(['my', 'name']);

// true
```

<a name="method-fluent-str-dirname"></a>
#### `dirname`

`dirname` 메서드는 주어진 문자열에서 상위 디렉터리 부분을 반환합니다.

```
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz')->dirname();

// '/foo/bar'
```

필요하다면, 몇 단계의 디렉터리 상위 경로까지 제거(자르기)할지 지정할 수 있습니다.

```
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz')->dirname(2);

// '/foo'
```

<a name="method-fluent-str-excerpt"></a>
#### `excerpt`

`excerpt` 메서드는 문자열에서 지정한 구를 처음으로 찾은 위치를 기준으로, 해당 부분을 중심으로 발췌된 문자열 일부를 추출합니다.

```
use Illuminate\Support\Str;

$excerpt = Str::of('This is my name')->excerpt('my', [
    'radius' => 3
]);

// '...is my na...'
```

`radius` 옵션은 발췌된 문자열에서 각 측면(앞뒤)에 몇 글자까지 포함할지를 지정하며, 기본값은 `100`입니다.

또한, 발췌된(잘린) 문자열 앞뒤에 붙는 문자열을 `omission` 옵션으로 지정할 수 있습니다.

```
use Illuminate\Support\Str;

$excerpt = Str::of('This is my name')->excerpt('name', [
    'radius' => 3,
    'omission' => '(...) '
]);

// '(...) my name'
```

<a name="method-fluent-str-ends-with"></a>
#### `endsWith`

`endsWith` 메서드는 지정한 문자열로 끝나는지 여부를 판별합니다.

```
use Illuminate\Support\Str;

$result = Str::of('This is my name')->endsWith('name');

// true
```

배열로 여러 값을 전달하여, 전달된 값 중 하나라도 해당 문자열로 끝나는지 확인할 수도 있습니다.

```
use Illuminate\Support\Str;

$result = Str::of('This is my name')->endsWith(['name', 'foo']);

// true

$result = Str::of('This is my name')->endsWith(['this', 'foo']);

// false
```

<a name="method-fluent-str-exactly"></a>
#### `exactly`

`exactly` 메서드는 두 문자열이 완전히 일치하는지 판별합니다.

```
use Illuminate\Support\Str;

$result = Str::of('Laravel')->exactly('Laravel');

// true
```

<a name="method-fluent-str-explode"></a>
#### `explode`

`explode` 메서드는 주어진 구분자로 문자열을 나누어, 분리된 각 부분들을 컬렉션으로 반환합니다.

```
use Illuminate\Support\Str;

$collection = Str::of('foo bar baz')->explode(' ');

// collect(['foo', 'bar', 'baz'])
```

<a name="method-fluent-str-finish"></a>
#### `finish`

`finish` 메서드는 주어진 값으로 끝나지 않는 경우, 해당 값을 문자열 끝에 한 번만 추가합니다.

```
use Illuminate\Support\Str;

$adjusted = Str::of('this/string')->finish('/');

// this/string/

$adjusted = Str::of('this/string/')->finish('/');

// this/string/
```

<a name="method-fluent-str-headline"></a>
#### `headline`

`headline` 메서드는 대소문자 구분, 하이픈(-), 언더스코어(_) 등으로 구분되어 있는 문자열을 띄어쓰기 기반의 문자열로 변환하고, 각 단어의 첫 글자를 대문자로 만듭니다.

```
use Illuminate\Support\Str;

$headline = Str::of('taylor_otwell')->headline();

// Taylor Otwell

$headline = Str::of('EmailNotificationSent')->headline();

// Email Notification Sent
```

<a name="method-fluent-str-inline-markdown"></a>
#### `inlineMarkdown`

`inlineMarkdown` 메서드는 GitHub 스타일의 마크다운(Markdown)을 [CommonMark](https://commonmark.thephpleague.com/)를 이용해 인라인 HTML로 변환합니다. 하지만 `markdown` 메서드와 달리, 변환된 HTML을 블록 레벨 요소로 래핑하지는 않습니다.

```
use Illuminate\Support\Str;

$html = Str::of('**Laravel**')->inlineMarkdown();

// <strong>Laravel</strong>
```

#### 마크다운 보안

기본적으로 마크다운은 원시 HTML을 지원하므로, 사용자로부터 입력받은 원본에 대해 사용할 경우 Cross-Site Scripting(XSS) 취약점을 노출할 수 있습니다. [CommonMark의 보안 문서](https://commonmark.thephpleague.com/security/)에서는 `html_input` 옵션을 사용해 원시 HTML을 escaping 또는 제거하도록, 그리고 `allow_unsafe_links` 옵션을 통해 안전하지 않은 링크의 허용 여부를 지정할 수 있다고 명시하고 있습니다. 일부 원시 HTML만 허용해야 한다면, 변환된 마크다운을 반드시 HTML Purifier로 한 번 더 처리해야 합니다.

```
use Illuminate\Support\Str;

Str::of('Inject: <script>alert("Hello XSS!");</script>')->inlineMarkdown([
    'html_input' => 'strip',
    'allow_unsafe_links' => false,
]);

// Inject: alert(&quot;Hello XSS!&quot;);
```

<a name="method-fluent-str-is"></a>
#### `is`

`is` 메서드는 주어진 문자열이 특정 패턴과 일치하는지 판별합니다. 패턴에는 와일드카드로 별표(*)를 사용할 수 있습니다.

```
use Illuminate\Support\Str;

$matches = Str::of('foobar')->is('foo*');

// true

$matches = Str::of('foobar')->is('baz*');

// false
```

<a name="method-fluent-str-is-ascii"></a>
#### `isAscii`

`isAscii` 메서드는 주어진 문자열이 ASCII 문자열인지 판별합니다.

```
use Illuminate\Support\Str;

$result = Str::of('Taylor')->isAscii();

// true

$result = Str::of('ü')->isAscii();

// false
```

<a name="method-fluent-str-is-empty"></a>
#### `isEmpty`

`isEmpty` 메서드는 주어진 문자열이 비어있는지(공백만 포함하는지) 판별합니다.

```
use Illuminate\Support\Str;

$result = Str::of('  ')->trim()->isEmpty();

// true

$result = Str::of('Laravel')->trim()->isEmpty();

// false
```

<a name="method-fluent-str-is-not-empty"></a>
#### `isNotEmpty`

`isNotEmpty` 메서드는 주어진 문자열이 비어있지 않은지 판별합니다.

```
use Illuminate\Support\Str;

$result = Str::of('  ')->trim()->isNotEmpty();

// false

$result = Str::of('Laravel')->trim()->isNotEmpty();

// true
```

<a name="method-fluent-str-is-json"></a>
#### `isJson`

`isJson` 메서드는 주어진 문자열이 올바른 JSON 형식인지 판별합니다.

```
use Illuminate\Support\Str;

$result = Str::of('[1,2,3]')->isJson();

// true

$result = Str::of('{"first": "John", "last": "Doe"}')->isJson();

// true

$result = Str::of('{first: "John", last: "Doe"}')->isJson();

// false
```

<a name="method-fluent-str-is-ulid"></a>
#### `isUlid`

`isUlid` 메서드는 주어진 문자열이 ULID인지 여부를 판별합니다.

```
use Illuminate\Support\Str;

$result = Str::of('01gd6r360bp37zj17nxb55yv40')->isUlid();

// true

$result = Str::of('Taylor')->isUlid();

// false
```

<a name="method-fluent-str-is-url"></a>
#### `isUrl`

`isUrl` 메서드는 주어진 문자열이 URL인지 판별합니다.

```
use Illuminate\Support\Str;

$result = Str::of('http://example.com')->isUrl();

// true

$result = Str::of('Taylor')->isUrl();

// false
```

`isUrl` 메서드는 다양한 종류의 프로토콜을 허용합니다. 하지만, 인자로 허용할 프로토콜 목록을 전달하여 제한할 수도 있습니다.

```
$result = Str::of('http://example.com')->isUrl(['http', 'https']);
```

<a name="method-fluent-str-is-uuid"></a>
#### `isUuid`

`isUuid` 메서드는 주어진 문자열이 UUID인지 판별합니다.

```
use Illuminate\Support\Str;

$result = Str::of('5ace9ab9-e9cf-4ec6-a19d-5881212a452c')->isUuid();

// true

$result = Str::of('Taylor')->isUuid();

// false
```

<a name="method-fluent-str-kebab"></a>
#### `kebab`

`kebab` 메서드는 주어진 문자열을 `kebab-case` 형태로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::of('fooBar')->kebab();

// foo-bar
```

<a name="method-fluent-str-lcfirst"></a>
#### `lcfirst`

`lcfirst` 메서드는 주어진 문자열의 첫 글자를 소문자로 변환하여 반환합니다.

```
use Illuminate\Support\Str;

$string = Str::of('Foo Bar')->lcfirst();

// foo Bar
```

<a name="method-fluent-str-length"></a>
#### `length`

`length` 메서드는 주어진 문자열의 길이를 반환합니다.

```
use Illuminate\Support\Str;

$length = Str::of('Laravel')->length();

// 7
```

<a name="method-fluent-str-limit"></a>
#### `limit`

`limit` 메서드는 문자열을 지정한 길이만큼만 잘라서 반환합니다.

```
use Illuminate\Support\Str;

$truncated = Str::of('The quick brown fox jumps over the lazy dog')->limit(20);

// The quick brown fox...
```

잘린 문자열 끝에 추가될 문자열을 두 번째 인자로 지정할 수도 있습니다.

```
use Illuminate\Support\Str;

$truncated = Str::of('The quick brown fox jumps over the lazy dog')->limit(20, ' (...)');

// The quick brown fox (...)
```

<a name="method-fluent-str-lower"></a>
#### `lower`

`lower` 메서드는 주어진 문자열을 모두 소문자로 변환합니다.

```
use Illuminate\Support\Str;

$result = Str::of('LARAVEL')->lower();

// 'laravel'
```

<a name="method-fluent-str-ltrim"></a>
#### `ltrim`

`ltrim` 메서드는 문자열 왼쪽(앞) 부분의 공백이나 지정한 문자를 제거합니다.

```
use Illuminate\Support\Str;

$string = Str::of('  Laravel  ')->ltrim();

// 'Laravel  '

$string = Str::of('/Laravel/')->ltrim('/');

// 'Laravel/'
```

<a name="method-fluent-str-markdown"></a>
#### `markdown`

`markdown` 메서드는 GitHub 스타일의 마크다운을 HTML로 변환합니다.

```
use Illuminate\Support\Str;

$html = Str::of('# Laravel')->markdown();

// <h1>Laravel</h1>

$html = Str::of('# Taylor <b>Otwell</b>')->markdown([
    'html_input' => 'strip',
]);

// <h1>Taylor Otwell</h1>
```

#### 마크다운 보안

기본적으로 마크다운은 원시 HTML을 지원하므로, 사용자로부터 입력받은 원본에 대해 사용할 경우 Cross-Site Scripting(XSS) 취약점을 노출할 수 있습니다. [CommonMark의 보안 문서](https://commonmark.thephpleague.com/security/)에서는 `html_input` 옵션을 사용해 원시 HTML을 escaping 또는 제거하도록, 그리고 `allow_unsafe_links` 옵션을 통해 안전하지 않은 링크의 허용 여부를 지정할 수 있다고 명시하고 있습니다. 일부 원시 HTML만 허용해야 한다면, 변환된 마크다운을 반드시 HTML Purifier로 한 번 더 처리해야 합니다.

```
use Illuminate\Support\Str;

Str::of('Inject: <script>alert("Hello XSS!");</script>')->markdown([
    'html_input' => 'strip',
    'allow_unsafe_links' => false,
]);

// <p>Inject: alert(&quot;Hello XSS!&quot;);</p>
```

<a name="method-fluent-str-mask"></a>
#### `mask`

`mask` 메서드는 문자열 일부를 반복 문자로 마스킹(가림)하여, 이메일 주소나 전화번호 등 민감한 정보의 일부를 가릴 때 사용할 수 있습니다.

```
use Illuminate\Support\Str;

$string = Str::of('taylor@example.com')->mask('*', 3);

// tay***************
```

필요하다면, 세 번째 또는 네 번째 인자에 음수 값을 지정하여, 문자열 끝에서부터 거리를 기준으로 마스킹을 시작하도록 할 수 있습니다.

```
$string = Str::of('taylor@example.com')->mask('*', -15, 3);

// tay***@example.com

$string = Str::of('taylor@example.com')->mask('*', 4, -4);

// tayl**********.com
```

<a name="method-fluent-str-match"></a>

#### `match`

`match` 메서드는 주어진 정규 표현식 패턴과 일치하는 문자열의 일부를 반환합니다.

```
use Illuminate\Support\Str;

$result = Str::of('foo bar')->match('/bar/');

// 'bar'

$result = Str::of('foo bar')->match('/foo (.*)/');

// 'bar'
```

<a name="method-fluent-str-match-all"></a>
#### `matchAll`

`matchAll` 메서드는 정규 표현식 패턴과 일치하는 문자열의 부분들을 포함하는 컬렉션을 반환합니다.

```
use Illuminate\Support\Str;

$result = Str::of('bar foo bar')->matchAll('/bar/');

// collect(['bar', 'bar'])
```

표현식 내에 매칭 그룹을 지정하면, 라라벨은 해당 그룹에 대응되는 모든 값을 컬렉션으로 반환합니다.

```
use Illuminate\Support\Str;

$result = Str::of('bar fun bar fly')->matchAll('/f(\w*)/');

// collect(['un', 'ly']);
```

일치하는 항목이 없으면 빈 컬렉션이 반환됩니다.

<a name="method-fluent-str-is-match"></a>
#### `isMatch`

`isMatch` 메서드는 문자열이 주어진 정규 표현식과 일치하면 `true`를 반환합니다.

```
use Illuminate\Support\Str;

$result = Str::of('foo bar')->isMatch('/foo (.*)/');

// true

$result = Str::of('laravel')->isMatch('/foo (.*)/');

// false
```

<a name="method-fluent-str-new-line"></a>
#### `newLine`

`newLine` 메서드는 문자열 끝에 "줄 바꿈" 문자를 추가합니다.

```
use Illuminate\Support\Str;

$padded = Str::of('Laravel')->newLine()->append('Framework');

// 'Laravel
//  Framework'
```

<a name="method-fluent-str-padboth"></a>
#### `padBoth`

`padBoth` 메서드는 PHP의 `str_pad` 함수를 감싸 양쪽에서 문자열을 지정한 길이만큼 다른 문자열로 채웁니다.

```
use Illuminate\Support\Str;

$padded = Str::of('James')->padBoth(10, '_');

// '__James___'

$padded = Str::of('James')->padBoth(10);

// '  James   '
```

<a name="method-fluent-str-padleft"></a>
#### `padLeft`

`padLeft` 메서드는 PHP의 `str_pad` 함수를 감싸 왼쪽에서 문자열을 지정한 길이만큼 다른 문자열로 채웁니다.

```
use Illuminate\Support\Str;

$padded = Str::of('James')->padLeft(10, '-=');

// '-=-=-James'

$padded = Str::of('James')->padLeft(10);

// '     James'
```

<a name="method-fluent-str-padright"></a>
#### `padRight`

`padRight` 메서드는 PHP의 `str_pad` 함수를 감싸 오른쪽에서 문자열을 지정한 길이만큼 다른 문자열로 채웁니다.

```
use Illuminate\Support\Str;

$padded = Str::of('James')->padRight(10, '-');

// 'James-----'

$padded = Str::of('James')->padRight(10);

// 'James     '
```

<a name="method-fluent-str-pipe"></a>
#### `pipe`

`pipe` 메서드는 현재 문자열 값을 주어진 콜러블에 전달하여 문자열을 원하는 대로 변환할 수 있습니다.

```
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$hash = Str::of('Laravel')->pipe('md5')->prepend('Checksum: ');

// 'Checksum: a5c95b86291ea299fcbe64458ed12702'

$closure = Str::of('foo')->pipe(function (Stringable $str) {
    return 'bar';
});

// 'bar'
```

<a name="method-fluent-str-plural"></a>
#### `plural`

`plural` 메서드는 단수 형태의 단어를 복수 형태로 변환합니다. 이 함수는 [라라벨의 복수화 지원 언어](/docs/10.x/localization#pluralization-language)에서도 사용할 수 있습니다.

```
use Illuminate\Support\Str;

$plural = Str::of('car')->plural();

// cars

$plural = Str::of('child')->plural();

// children
```

함수의 두 번째 인수로 정수를 전달하면, 해당 정수에 따라 문자열의 단수 또는 복수 형태를 얻을 수 있습니다.

```
use Illuminate\Support\Str;

$plural = Str::of('child')->plural(2);

// children

$plural = Str::of('child')->plural(1);

// child
```

<a name="method-fluent-str-position"></a>
#### `position`

`position` 메서드는 문자열에서 지정한 부분 문자열이 처음 나타나는 위치를 반환합니다. 만약 부분 문자열이 존재하지 않으면 `false`를 반환합니다.

```
use Illuminate\Support\Str;

$position = Str::of('Hello, World!')->position('Hello');

// 0

$position = Str::of('Hello, World!')->position('W');

// 7
```

<a name="method-fluent-str-prepend"></a>
#### `prepend`

`prepend` 메서드는 지정한 값을 문자열 앞에 붙입니다.

```
use Illuminate\Support\Str;

$string = Str::of('Framework')->prepend('Laravel ');

// Laravel Framework
```

<a name="method-fluent-str-remove"></a>
#### `remove`

`remove` 메서드는 지정한 값 또는 값들의 배열을 문자열에서 제거합니다.

```
use Illuminate\Support\Str;

$string = Str::of('Arkansas is quite beautiful!')->remove('quite');

// Arkansas is beautiful!
```

문자열 제거 시 대소문자 구분을 무시하려면 두 번째 파라미터로 `false`를 전달할 수 있습니다.

<a name="method-fluent-str-repeat"></a>
#### `repeat`

`repeat` 메서드는 지정된 문자열을 여러 번 반복합니다.

```php
use Illuminate\Support\Str;

$repeated = Str::of('a')->repeat(5);

// aaaaa
```

<a name="method-fluent-str-replace"></a>
#### `replace`

`replace` 메서드는 문자열 내에서 지정한 값을 대체합니다.

```
use Illuminate\Support\Str;

$replaced = Str::of('Laravel 6.x')->replace('6.x', '7.x');

// Laravel 7.x
```

`replace` 메서드는 `caseSensitive` 옵션도 지원합니다. 기본적으로는 대소문자를 구분하여 치환합니다.

```
$replaced = Str::of('macOS 13.x')->replace(
    'macOS', 'iOS', caseSensitive: false
);
```

<a name="method-fluent-str-replace-array"></a>
#### `replaceArray`

`replaceArray` 메서드는 문자열에 지정한 값을 배열에 있는 값들로 순차적으로 치환합니다.

```
use Illuminate\Support\Str;

$string = 'The event will take place between ? and ?';

$replaced = Str::of($string)->replaceArray('?', ['8:30', '9:00']);

// The event will take place between 8:30 and 9:00
```

<a name="method-fluent-str-replace-first"></a>
#### `replaceFirst`

`replaceFirst` 메서드는 지정된 값이 처음 나타나는 위치를 다른 값으로 교체합니다.

```
use Illuminate\Support\Str;

$replaced = Str::of('the quick brown fox jumps over the lazy dog')->replaceFirst('the', 'a');

// a quick brown fox jumps over the lazy dog
```

<a name="method-fluent-str-replace-last"></a>
#### `replaceLast`

`replaceLast` 메서드는 지정된 값이 마지막으로 나타나는 위치를 다른 값으로 교체합니다.

```
use Illuminate\Support\Str;

$replaced = Str::of('the quick brown fox jumps over the lazy dog')->replaceLast('the', 'a');

// the quick brown fox jumps over a lazy dog
```

<a name="method-fluent-str-replace-matches"></a>
#### `replaceMatches`

`replaceMatches` 메서드는 패턴과 일치하는 문자열 부분을 지정한 값으로 모두 변경합니다.

```
use Illuminate\Support\Str;

$replaced = Str::of('(+1) 501-555-1000')->replaceMatches('/[^A-Za-z0-9]++/', '')

// '15015551000'
```

또한 `replaceMatches` 메서드는 각 일치 항목마다 호출되는 클로저를 전달할 수 있습니다. 이를 통해 치환 로직을 직접 구현하고 반환할 값을 지정할 수 있습니다.

```
use Illuminate\Support\Str;

$replaced = Str::of('123')->replaceMatches('/\d/', function (array $matches) {
    return '['.$matches[0].']';
});

// '[1][2][3]'
```

<a name="method-fluent-str-replace-start"></a>
#### `replaceStart`

`replaceStart` 메서드는 지정한 값이 문자열의 시작 부분에 있을 때만 그 첫 번째 값을 변경합니다.

```
use Illuminate\Support\Str;

$replaced = Str::of('Hello World')->replaceStart('Hello', 'Laravel');

// Laravel World

$replaced = Str::of('Hello World')->replaceStart('World', 'Laravel');

// Hello World
```

<a name="method-fluent-str-replace-end"></a>
#### `replaceEnd`

`replaceEnd` 메서드는 지정한 값이 문자열의 끝 부분에 있을 때만 그 마지막 값을 바꿉니다.

```
use Illuminate\Support\Str;

$replaced = Str::of('Hello World')->replaceEnd('World', 'Laravel');

// Hello Laravel

$replaced = Str::of('Hello World')->replaceEnd('Hello', 'Laravel');

// Hello World
```

<a name="method-fluent-str-rtrim"></a>
#### `rtrim`

`rtrim` 메서드는 문자열의 오른쪽 끝에 있는 공백(또는 지정된 문자를) 제거합니다.

```
use Illuminate\Support\Str;

$string = Str::of('  Laravel  ')->rtrim();

// '  Laravel'

$string = Str::of('/Laravel/')->rtrim('/');

// '/Laravel'
```

<a name="method-fluent-str-scan"></a>
#### `scan`

`scan` 메서드는 [`sscanf` PHP 함수](https://www.php.net/manual/en/function.sscanf.php)에서 지원하는 형식에 따라 입력 문자열을 파싱해서 컬렉션으로 반환합니다.

```
use Illuminate\Support\Str;

$collection = Str::of('filename.jpg')->scan('%[^.].%s');

// collect(['filename', 'jpg'])
```

<a name="method-fluent-str-singular"></a>
#### `singular`

`singular` 메서드는 문자열을 단수 형태로 변환합니다. 이 함수는 [라라벨의 복수화 지원 언어](/docs/10.x/localization#pluralization-language)에서도 사용할 수 있습니다.

```
use Illuminate\Support\Str;

$singular = Str::of('cars')->singular();

// car

$singular = Str::of('children')->singular();

// child
```

<a name="method-fluent-str-slug"></a>
#### `slug`

`slug` 메서드는 주어진 문자열을 URL에 친화적인 "슬러그(slug)"로 생성합니다.

```
use Illuminate\Support\Str;

$slug = Str::of('Laravel Framework')->slug('-');

// laravel-framework
```

<a name="method-fluent-str-snake"></a>
#### `snake`

`snake` 메서드는 주어진 문자열을 `snake_case` 형식으로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::of('fooBar')->snake();

// foo_bar
```

<a name="method-fluent-str-split"></a>
#### `split`

`split` 메서드는 정규 표현식을 이용해 문자열을 컬렉션으로 분할합니다.

```
use Illuminate\Support\Str;

$segments = Str::of('one, two, three')->split('/[\s,]+/');

// collect(["one", "two", "three"])
```

<a name="method-fluent-str-squish"></a>
#### `squish`

`squish` 메서드는 문자열 내에 불필요하게 많은 공백(단어 사이 공백 포함)을 모두 제거합니다.

```
use Illuminate\Support\Str;

$string = Str::of('    laravel    framework    ')->squish();

// laravel framework
```

<a name="method-fluent-str-start"></a>
#### `start`

`start` 메서드는 만약 문자열이 지정한 값으로 시작하지 않는 경우, 해당 값을 맨 앞에 한 번만 붙여줍니다.

```
use Illuminate\Support\Str;

$adjusted = Str::of('this/string')->start('/');

// /this/string

$adjusted = Str::of('/this/string')->start('/');

// /this/string
```

<a name="method-fluent-str-starts-with"></a>
#### `startsWith`

`startsWith` 메서드는 문자열이 지정한 값으로 시작하는지 여부를 판단합니다.

```
use Illuminate\Support\Str;

$result = Str::of('This is my name')->startsWith('This');

// true
```

<a name="method-fluent-str-strip-tags"></a>
#### `stripTags`

`stripTags` 메서드는 문자열에서 모든 HTML, PHP 태그를 제거합니다.

```
use Illuminate\Support\Str;

$result = Str::of('<a href="https://laravel.com">Taylor <b>Otwell</b></a>')->stripTags();

// Taylor Otwell

$result = Str::of('<a href="https://laravel.com">Taylor <b>Otwell</b></a>')->stripTags('<b>');

// Taylor <b>Otwell</b>
```

<a name="method-fluent-str-studly"></a>
#### `studly`

`studly` 메서드는 주어진 문자열을 `StudlyCase` 형식으로 변환합니다.

```
use Illuminate\Support\Str;

$converted = Str::of('foo_bar')->studly();

// FooBar
```

<a name="method-fluent-str-substr"></a>
#### `substr`

`substr` 메서드는 시작 위치와 길이 파라미터에 따라 문자열의 일부를 반환합니다.

```
use Illuminate\Support\Str;

$string = Str::of('Laravel Framework')->substr(8);

// Framework

$string = Str::of('Laravel Framework')->substr(8, 5);

// Frame
```

<a name="method-fluent-str-substrreplace"></a>
#### `substrReplace`

`substrReplace` 메서드는 두 번째 인수로 지정한 위치부터 시작해서, 세 번째 인수만큼의 문자를 치환합니다. 세 번째 인수에 `0`을 전달하면 해당 위치에 문자열을 삽입만 하고 기존 문자는 삭제하지 않습니다.

```
use Illuminate\Support\Str;

$string = Str::of('1300')->substrReplace(':', 2);

// 13:

$string = Str::of('The Framework')->substrReplace(' Laravel', 3, 0);

// The Laravel Framework
```

<a name="method-fluent-str-swap"></a>
#### `swap`

`swap` 메서드는 PHP의 `strtr` 함수를 이용하여 문자열 내 여러 값을 한 번에 교체합니다.

```
use Illuminate\Support\Str;

$string = Str::of('Tacos are great!')
    ->swap([
        'Tacos' => 'Burritos',
        'great' => 'fantastic',
    ]);

// Burritos are fantastic!
```

<a name="method-fluent-str-take"></a>

#### `take`

`take` 메서드는 문자열의 시작 부분에서 지정한 개수만큼의 문자를 반환합니다:

```
use Illuminate\Support\Str;

$taken = Str::of('Build something amazing!')->take(5);

// Build
```

<a name="method-fluent-str-tap"></a>
#### `tap`

`tap` 메서드는 문자열을 주어진 클로저에 전달하여, 문자열 자체에는 아무런 영향을 주지 않으면서 문자열을 확인하거나 조작할 수 있도록 해줍니다. 클로저에서 무엇을 반환하든 관계없이, `tap` 메서드는 원본 문자열을 그대로 반환합니다:

```
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('Laravel')
    ->append(' Framework')
    ->tap(function (Stringable $string) {
        dump('String after append: '.$string);
    })
    ->upper();

// LARAVEL FRAMEWORK
```

<a name="method-fluent-str-test"></a>
#### `test`

`test` 메서드는 문자열이 주어진 정규 표현식 패턴과 일치하는지 확인합니다:

```
use Illuminate\Support\Str;

$result = Str::of('Laravel Framework')->test('/Laravel/');

// true
```

<a name="method-fluent-str-title"></a>
#### `title`

`title` 메서드는 주어진 문자열을 `Title Case`(각 단어의 첫 글자를 대문자로 변환)로 변환합니다:

```
use Illuminate\Support\Str;

$converted = Str::of('a nice title uses the correct case')->title();

// A Nice Title Uses The Correct Case
```

<a name="method-fluent-str-to-base64"></a>
#### `toBase64()`

`toBase64` 메서드는 주어진 문자열을 Base64로 인코딩합니다:

```
use Illuminate\Support\Str;

$base64 = Str::of('Laravel')->toBase64();

// TGFyYXZlbA==
```

<a name="method-fluent-str-trim"></a>
#### `trim`

`trim` 메서드는 주어진 문자열의 양쪽 끝에 있는 공백이나 지정한 문자를 제거합니다:

```
use Illuminate\Support\Str;

$string = Str::of('  Laravel  ')->trim();

// 'Laravel'

$string = Str::of('/Laravel/')->trim('/');

// 'Laravel'
```

<a name="method-fluent-str-ucfirst"></a>
#### `ucfirst`

`ucfirst` 메서드는 문자열의 첫 번째 문자를 대문자로 변환하여 반환합니다:

```
use Illuminate\Support\Str;

$string = Str::of('foo bar')->ucfirst();

// Foo bar
```

<a name="method-fluent-str-ucsplit"></a>
#### `ucsplit`

`ucsplit` 메서드는 문자열에서 대문자 문자를 기준으로 분리하여 컬렉션으로 반환합니다:

```
use Illuminate\Support\Str;

$string = Str::of('Foo Bar')->ucsplit();

// collect(['Foo', 'Bar'])
```

<a name="method-fluent-str-unwrap"></a>
#### `unwrap`

`unwrap` 메서드는 문자열의 시작과 끝에서 지정한 문자를 제거합니다:

```
use Illuminate\Support\Str;

Str::of('-Laravel-')->unwrap('-');

// Laravel

Str::of('{framework: "Laravel"}')->unwrap('{', '}');

// framework: "Laravel"
```

<a name="method-fluent-str-upper"></a>
#### `upper`

`upper` 메서드는 주어진 문자열을 모두 대문자로 변환합니다:

```
use Illuminate\Support\Str;

$adjusted = Str::of('laravel')->upper();

// LARAVEL
```

<a name="method-fluent-str-when"></a>
#### `when`

`when` 메서드는 지정한 조건이 `true`일 때 주어진 클로저를 실행합니다. 이 클로저는 fluent string 인스턴스를 인수로 받습니다:

```
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('Taylor')
                ->when(true, function (Stringable $string) {
                    return $string->append(' Otwell');
                });

// 'Taylor Otwell'
```

필요하다면, `when` 메서드의 세 번째 인자로 또 다른 클로저를 전달할 수 있습니다. 이 클로저는 조건이 `false`로 평가될 때 실행됩니다.

<a name="method-fluent-str-when-contains"></a>
#### `whenContains`

`whenContains` 메서드는 문자열이 지정한 값을 포함하는 경우, 주어진 클로저를 실행합니다. 이 클로저는 fluent string 인스턴스를 인수로 받습니다:

```
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('tony stark')
            ->whenContains('tony', function (Stringable $string) {
                return $string->title();
            });

// 'Tony Stark'
```

필요하다면, `when` 메서드의 세 번째 인자로 또 다른 클로저를 전달할 수 있습니다. 이 클로저는 문자열에 지정한 값이 포함되지 않을 때 실행됩니다.

또한 문자열이 배열 내의 값 중 하나라도 포함하는지 확인할 때, 값의 배열을 전달할 수도 있습니다:

```
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('tony stark')
            ->whenContains(['tony', 'hulk'], function (Stringable $string) {
                return $string->title();
            });

// Tony Stark
```

<a name="method-fluent-str-when-contains-all"></a>
#### `whenContainsAll`

`whenContainsAll` 메서드는 문자열이 지정한 모든 하위 문자열을 포함하고 있을 때 주어진 클로저를 실행합니다. 이 클로저는 fluent string 인스턴스를 인수로 받습니다:

```
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('tony stark')
                ->whenContainsAll(['tony', 'stark'], function (Stringable $string) {
                    return $string->title();
                });

// 'Tony Stark'
```

필요하다면, `when` 메서드의 세 번째 인자로 또 다른 클로저를 전달할 수 있습니다. 이 클로저는 조건이 `false`로 평가될 때 실행됩니다.

<a name="method-fluent-str-when-empty"></a>
#### `whenEmpty`

`whenEmpty` 메서드는 문자열이 비어 있을 때 주어진 클로저를 실행합니다. 클로저가 값을 반환하면, 그 값이 `whenEmpty`의 반환값이 됩니다. 클로저가 값을 반환하지 않을 경우, fluent string 인스턴스가 반환됩니다:

```
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('  ')->whenEmpty(function (Stringable $string) {
    return $string->trim()->prepend('Laravel');
});

// 'Laravel'
```

<a name="method-fluent-str-when-not-empty"></a>
#### `whenNotEmpty`

`whenNotEmpty` 메서드는 문자열이 비어 있지 않을 때 주어진 클로저를 실행합니다. 클로저가 값을 반환하면, 그 값이 `whenNotEmpty`의 반환값이 됩니다. 클로저가 값을 반환하지 않을 경우, fluent string 인스턴스가 반환됩니다:

```
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('Framework')->whenNotEmpty(function (Stringable $string) {
    return $string->prepend('Laravel ');
});

// 'Laravel Framework'
```

<a name="method-fluent-str-when-starts-with"></a>
#### `whenStartsWith`

`whenStartsWith` 메서드는 문자열이 지정한 하위 문자열로 시작할 때 주어진 클로저를 실행합니다. 이 클로저는 fluent string 인스턴스를 인수로 받습니다:

```
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('disney world')->whenStartsWith('disney', function (Stringable $string) {
    return $string->title();
});

// 'Disney World'
```

<a name="method-fluent-str-when-ends-with"></a>
#### `whenEndsWith`

`whenEndsWith` 메서드는 문자열이 지정한 하위 문자열로 끝날 때 주어진 클로저를 실행합니다. 이 클로저는 fluent string 인스턴스를 인수로 받습니다:

```
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('disney world')->whenEndsWith('world', function (Stringable $string) {
    return $string->title();
});

// 'Disney World'
```

<a name="method-fluent-str-when-exactly"></a>
#### `whenExactly`

`whenExactly` 메서드는 문자열이 지정한 문자열과 정확하게 일치할 때 주어진 클로저를 실행합니다. 이 클로저는 fluent string 인스턴스를 인수로 받습니다:

```
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('laravel')->whenExactly('laravel', function (Stringable $string) {
    return $string->title();
});

// 'Laravel'
```

<a name="method-fluent-str-when-not-exactly"></a>
#### `whenNotExactly`

`whenNotExactly` 메서드는 문자열이 지정한 문자열과 정확히 일치하지 않을 때 주어진 클로저를 실행합니다. 이 클로저는 fluent string 인스턴스를 인수로 받습니다:

```
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('framework')->whenNotExactly('laravel', function (Stringable $string) {
    return $string->title();
});

// 'Framework'
```

<a name="method-fluent-str-when-is"></a>
#### `whenIs`

`whenIs` 메서드는 문자열이 지정한 패턴과 일치할 때 주어진 클로저를 실행합니다. 별표(*)는 와일드카드 값으로 사용할 수 있습니다. 이 클로저는 fluent string 인스턴스를 인수로 받습니다:

```
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('foo/bar')->whenIs('foo/*', function (Stringable $string) {
    return $string->append('/baz');
});

// 'foo/bar/baz'
```

<a name="method-fluent-str-when-is-ascii"></a>
#### `whenIsAscii`

`whenIsAscii` 메서드는 문자열이 7비트 ASCII 문자로만 이루어져 있을 때 주어진 클로저를 실행합니다. 이 클로저는 fluent string 인스턴스를 인수로 받습니다:

```
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('laravel')->whenIsAscii(function (Stringable $string) {
    return $string->title();
});

// 'Laravel'
```

<a name="method-fluent-str-when-is-ulid"></a>
#### `whenIsUlid`

`whenIsUlid` 메서드는 문자열이 올바른 ULID 형식일 때 주어진 클로저를 실행합니다. 이 클로저는 fluent string 인스턴스를 인수로 받습니다:

```
use Illuminate\Support\Str;

$string = Str::of('01gd6r360bp37zj17nxb55yv40')->whenIsUlid(function (Stringable $string) {
    return $string->substr(0, 8);
});

// '01gd6r36'
```

<a name="method-fluent-str-when-is-uuid"></a>
#### `whenIsUuid`

`whenIsUuid` 메서드는 문자열이 올바른 UUID 형식일 때 주어진 클로저를 실행합니다. 이 클로저는 fluent string 인스턴스를 인수로 받습니다:

```
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('a0a2a2d2-0b87-4a18-83f2-2529882be2de')->whenIsUuid(function (Stringable $string) {
    return $string->substr(0, 8);
});

// 'a0a2a2d2'
```

<a name="method-fluent-str-when-test"></a>
#### `whenTest`

`whenTest` 메서드는 문자열이 주어진 정규 표현식과 일치할 때 주어진 클로저를 실행합니다. 이 클로저는 fluent string 인스턴스를 인수로 받습니다:

```
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('laravel framework')->whenTest('/laravel/', function (Stringable $string) {
    return $string->title();
});

// 'Laravel Framework'
```

<a name="method-fluent-str-word-count"></a>
#### `wordCount`

`wordCount` 메서드는 문자열에 포함된 단어의 개수를 반환합니다:

```php
use Illuminate\Support\Str;

Str::of('Hello, world!')->wordCount(); // 2
```

<a name="method-fluent-str-words"></a>
#### `words`

`words` 메서드는 문자열의 단어 수를 제한합니다. 필요하다면, 잘린 문자열 끝에 추가할 문자열을 두 번째 인자로 지정할 수 있습니다:

```
use Illuminate\Support\Str;

$string = Str::of('Perfectly balanced, as all things should be.')->words(3, ' >>>');

// Perfectly balanced, as >>>
```