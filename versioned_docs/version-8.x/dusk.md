# 라라벨 Dusk (Laravel Dusk)

- [소개](#introduction)
- [설치](#installation)
    - [ChromeDriver 설치 관리](#managing-chromedriver-installations)
    - [다른 브라우저 사용](#using-other-browsers)
- [시작하기](#getting-started)
    - [테스트 생성](#generating-tests)
    - [데이터베이스 마이그레이션](#migrations)
    - [테스트 실행](#running-tests)
    - [환경 파일 다루기](#environment-handling)
- [브라우저 기본 사용법](#browser-basics)
    - [브라우저 생성](#creating-browsers)
    - [네비게이션](#navigation)
    - [브라우저 창 크기 조정](#resizing-browser-windows)
    - [브라우저 매크로](#browser-macros)
    - [인증](#authentication)
    - [쿠키](#cookies)
    - [자바스크립트 실행](#executing-javascript)
    - [스크린샷 찍기](#taking-a-screenshot)
    - [콘솔 출력 디스크에 저장](#storing-console-output-to-disk)
    - [페이지 소스 디스크에 저장](#storing-page-source-to-disk)
- [엘리먼트와 상호작용하기](#interacting-with-elements)
    - [Dusk 셀렉터](#dusk-selectors)
    - [텍스트, 값, 속성](#text-values-and-attributes)
    - [폼과 상호작용](#interacting-with-forms)
    - [파일 첨부](#attaching-files)
    - [버튼 누르기](#pressing-buttons)
    - [링크 클릭](#clicking-links)
    - [키보드 사용](#using-the-keyboard)
    - [마우스 사용](#using-the-mouse)
    - [자바스크립트 대화상자](#javascript-dialogs)
    - [셀렉터 범위 한정하기](#scoping-selectors)
    - [엘리먼트 대기](#waiting-for-elements)
    - [엘리먼트 화면 내로 스크롤](#scrolling-an-element-into-view)
- [사용 가능한 assertion](#available-assertions)
- [페이지](#pages)
    - [페이지 생성](#generating-pages)
    - [페이지 설정](#configuring-pages)
    - [페이지로 이동](#navigating-to-pages)
    - [약식 셀렉터](#shorthand-selectors)
    - [페이지 메서드](#page-methods)
- [컴포넌트](#components)
    - [컴포넌트 생성](#generating-components)
    - [컴포넌트 사용](#using-components)
- [지속적 통합(CI)](#continuous-integration)
    - [Heroku CI](#running-tests-on-heroku-ci)
    - [Travis CI](#running-tests-on-travis-ci)
    - [GitHub Actions](#running-tests-on-github-actions)

<a name="introduction"></a>
## 소개

[Laravel Dusk](https://github.com/laravel/dusk)는 표현력이 풍부하고 사용하기 쉬운 브라우저 자동화 및 테스트 API를 제공합니다. 기본적으로 Dusk를 사용하기 위해 로컬 컴퓨터에 JDK나 Selenium을 설치할 필요가 없습니다. 대신, Dusk는 독립 실행형 [ChromeDriver](https://sites.google.com/chromium.org/driver) 설치 파일을 사용합니다. 물론, 원한다면 Selenium을 지원하는 다른 드라이버도 사용할 수 있습니다.

<a name="installation"></a>
## 설치

먼저 [Google Chrome](https://www.google.com/chrome)을 설치한 후, `laravel/dusk` Composer 의존성을 프로젝트에 추가해야 합니다:

```
composer require --dev laravel/dusk
```

> [!NOTE]
> Dusk의 서비스 프로바이더를 수동으로 등록하는 경우, **절대로** 운영(production) 환경에는 등록해서는 안 됩니다. 그렇게 할 경우 임의의 사용자가 애플리케이션에 인증할 수 있게 되어 보안 문제가 발생할 수 있습니다.

Dusk 패키지를 설치한 후에는 `dusk:install` 아티즌 명령어를 실행합니다. `dusk:install` 명령어는 `tests/Browser` 디렉터리와 예제 Dusk 테스트 파일을 생성합니다.

```
php artisan dusk:install
```

그 다음 애플리케이션의 `.env` 파일에서 `APP_URL` 환경 변수를 설정합니다. 이 값은 브라우저에서 애플리케이션에 접근하는 URL과 일치해야 합니다.

> [!TIP]
> 로컬 개발 환경 관리를 위해 [Laravel Sail](/docs/8.x/sail)을 사용하고 있다면, [Dusk 테스트 구성 및 실행](/docs/8.x/sail#laravel-dusk)에 관한 Sail 공식 문서도 참고해주시기 바랍니다.

<a name="managing-chromedriver-installations"></a>
### ChromeDriver 설치 관리

Laravel Dusk에서 바로 제공되는 ChromeDriver가 아닌 다른 버전을 설치하고 싶다면, `dusk:chrome-driver` 명령어를 사용할 수 있습니다:

```
# 운영 체제에 맞는 최신 버전의 ChromeDriver 설치...
php artisan dusk:chrome-driver

# 특정 버전의 ChromeDriver 설치...
php artisan dusk:chrome-driver 86

# 지원되는 모든 운영 체제에 대해 특정 버전 설치...
php artisan dusk:chrome-driver --all

# 설치된 Chrome/Chromium의 버전에 맞는 ChromeDriver 자동 감지 및 설치...
php artisan dusk:chrome-driver --detect
```

> [!NOTE]
> Dusk를 사용하기 위해서는 `chromedriver` 바이너리 파일에 실행 권한이 있어야 합니다. Dusk 실행에 문제가 있다면, 다음 명령어를 통해 실행 권한을 부여해주시기 바랍니다: `chmod -R 0755 vendor/laravel/dusk/bin/`.

<a name="using-other-browsers"></a>
### 다른 브라우저 사용

기본적으로 Dusk는 Google Chrome과 독립 실행형 [ChromeDriver](https://sites.google.com/chromium.org/driver) 설치 파일을 사용해서 브라우저 테스트를 실행합니다. 하지만, 직접 Selenium 서버를 띄우고 원하는 브라우저를 대상으로 테스트를 실행할 수도 있습니다.

시작하려면, 애플리케이션의 기본 Dusk 테스트 케이스인 `tests/DuskTestCase.php` 파일을 엽니다. 이 파일에서 `startChromeDriver` 메서드를 호출하는 부분을 삭제하면 Dusk가 ChromeDriver를 자동으로 실행하지 않습니다.

```
/**
 * Prepare for Dusk test execution.
 *
 * @beforeClass
 * @return void
 */
public static function prepare()
{
    // static::startChromeDriver();
}
```

그리고 나서, `driver` 메서드를 수정하여 원하는 URL과 포트에 연결하도록 할 수 있습니다. 또한 원하는 WebDriver의 "desired capabilities" 설정도 조정할 수 있습니다.

```
/**
 * Create the RemoteWebDriver instance.
 *
 * @return \Facebook\WebDriver\Remote\RemoteWebDriver
 */
protected function driver()
{
    return RemoteWebDriver::create(
        'http://localhost:4444/wd/hub', DesiredCapabilities::phantomjs()
    );
}
```

<a name="getting-started"></a>
## 시작하기

<a name="generating-tests"></a>
### 테스트 생성

Dusk 테스트 파일을 생성하려면 `dusk:make` 아티즌 명령어를 사용합니다. 생성된 테스트는 `tests/Browser` 디렉터리에 저장됩니다:

```
php artisan dusk:make LoginTest
```

<a name="migrations"></a>
### 데이터베이스 마이그레이션

대부분의 테스트는 애플리케이션 데이터베이스에서 데이터를 조회하는 페이지와 상호작용합니다. 하지만, Dusk 테스트에서는 `RefreshDatabase` 트레이트를 사용해서는 안 됩니다. `RefreshDatabase` 트레이트는 데이터베이스 트랜잭션을 활용하는데, 이는 HTTP 요청 간에 적용되거나 사용될 수 없습니다. 대신, 각 테스트마다 데이터베이스를 다시 마이그레이션하는 `DatabaseMigrations` 트레이트를 사용해야 합니다.

```
<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Chrome;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseMigrations;
}
```

> [!NOTE]
> Dusk 테스트 실행 시 SQLite 메모리 데이터베이스는 사용할 수 없습니다. 브라우저가 별도의 프로세스에서 동작하기 때문에, 그 외 프로세스의 메모리 데이터베이스에 접근할 수 없습니다.

<a name="running-tests"></a>
### 테스트 실행

브라우저 테스트를 실행하려면 `dusk` 아티즌 명령어를 사용하면 됩니다.

```
php artisan dusk
```

직전 `dusk` 명령어 실행에서 테스트에 실패한 경우, 먼저 실패한 테스트만 다시 실행해 시간을 절약할 수 있습니다. 이때는 `dusk:fails` 명령어를 사용합니다:

```
php artisan dusk:fails
```

`dusk` 명령어는 [group](https://phpunit.de/manual/current/en/appendixes.annotations.html#appendixes.annotations.group)으로 특정 테스트 그룹만 실행하는 것과 같이 PHPUnit 테스트 러너에서 일반적으로 사용하는 인수를 그대로 사용할 수 있습니다.

```
php artisan dusk --group=foo
```

> [!TIP]
> 로컬 개발 환경에서 [Laravel Sail](/docs/8.x/sail)을 사용 중이라면, [Dusk 테스트 구성 및 실행](/docs/8.x/sail#laravel-dusk)에 관한 Sail 공식 문서도 꼭 참고해 주세요.

<a name="manually-starting-chromedriver"></a>
#### ChromeDriver 수동 실행

기본적으로 Dusk는 ChromeDriver를 자동으로 시작하려 시도합니다. 만약 이 자동 실행이 정상적으로 작동하지 않는 경우, `dusk` 명령어를 실행하기 전에 ChromeDriver를 직접 수동으로 실행할 수 있습니다. 이 경우, `tests/DuskTestCase.php` 파일에서 다음 라인을 주석 처리해야 합니다.

```
/**
 * Prepare for Dusk test execution.
 *
 * @beforeClass
 * @return void
 */
public static function prepare()
{
    // static::startChromeDriver();
}
```

그리고 만약 ChromeDriver를 9515번이 아닌 다른 포트에서 실행 중이라면, 해당 클래스의 `driver` 메서드도 올바른 포트로 수정해야 합니다.

```
/**
 * Create the RemoteWebDriver instance.
 *
 * @return \Facebook\WebDriver\Remote\RemoteWebDriver
 */
protected function driver()
{
    return RemoteWebDriver::create(
        'http://localhost:9515', DesiredCapabilities::chrome()
    );
}
```

<a name="environment-handling"></a>
### 환경 파일 다루기

Dusk가 테스트 실행 시 별도의 환경 파일을 사용하도록 하려면, 프로젝트 루트에 `.env.dusk.{environment}` 파일을 생성합니다. 예를 들어 `local` 환경으로 `dusk` 명령어를 실행할 경우, `.env.dusk.local` 파일을 만들어야 합니다.

테스트가 실행될 때 Dusk는 기존 `.env` 파일을 백업하고, Dusk 환경 파일을 `.env`로 이름을 변경해 사용합니다. 테스트가 끝나면 원래의 `.env` 파일이 다시 복원됩니다.

<a name="browser-basics"></a>
## 브라우저 기본 사용법

<a name="creating-browsers"></a>
### 브라우저 생성

먼저, 애플리케이션에 로그인할 수 있는지 검증하는 테스트를 작성해보겠습니다. 테스트를 생성한 후, 로그인 페이지로 이동하고, 자격 증명을 입력한 뒤 "Login" 버튼을 클릭하도록 수정합니다. 브라우저 인스턴스를 생성하려면 Dusk 테스트 내부에서 `browse` 메서드를 호출하면 됩니다.

```
<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Chrome;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseMigrations;

    /**
     * A basic browser test example.
     *
     * @return void
     */
    public function test_basic_example()
    {
        $user = User::factory()->create([
            'email' => 'taylor@laravel.com',
        ]);

        $this->browse(function ($browser) use ($user) {
            $browser->visit('/login')
                    ->type('email', $user->email)
                    ->type('password', 'password')
                    ->press('Login')
                    ->assertPathIs('/home');
        });
    }
}
```

위 예제에서 볼 수 있듯이, `browse` 메서드는 클로저를 인자로 받습니다. Dusk는 이 클로저로 브라우저 인스턴스를 자동으로 전달하고, 이 브라우저 인스턴스를 사용해서 여러분의 애플리케이션과 상호작용하거나, assertion을 실행할 수 있습니다.

<a name="creating-multiple-browsers"></a>
#### 여러 브라우저 생성

경우에 따라 하나의 테스트를 위해 여러 브라우저가 필요할 수도 있습니다. 예를 들어, 웹소켓으로 상호작용하는 채팅 화면을 테스트할 때 여러 브라우저가 필요할 수 있습니다. 여러 브라우저를 생성하려면, `browse` 메서드에 넘기는 클로저의 인자 개수를 늘려주면 됩니다.

```
$this->browse(function ($first, $second) {
    $first->loginAs(User::find(1))
          ->visit('/home')
          ->waitForText('Message');

    $second->loginAs(User::find(2))
           ->visit('/home')
           ->waitForText('Message')
           ->type('message', 'Hey Taylor')
           ->press('Send');

    $first->waitForText('Hey Taylor')
          ->assertSee('Jeffrey Way');
});
```

<a name="navigation"></a>
### 네비게이션

애플리케이션 내에서 특정 URI로 이동하려면 `visit` 메서드를 사용할 수 있습니다.

```
$browser->visit('/login');
```

[named route](/docs/8.x/routing#named-routes)로 이동하려면 `visitRoute` 메서드를 사용할 수 있습니다.

```
$browser->visitRoute('login');
```

`back`과 `forward` 메서드를 사용해 브라우저의 "뒤로 가기", "앞으로 가기" 기능도 사용할 수 있습니다.

```
$browser->back();

$browser->forward();
```

현재 페이지를 새로고침하려면 `refresh` 메서드를 사용합니다.

```
$browser->refresh();
```

<a name="resizing-browser-windows"></a>
### 브라우저 창 크기 조정

브라우저 창의 크기를 조절하려면 `resize` 메서드를 사용합니다.

```
$browser->resize(1920, 1080);
```

브라우저 창을 최대화하려면 `maximize` 메서드를 사용할 수 있습니다.

```
$browser->maximize();
```

창 크기를 콘텐츠 크기에 맞게 맞추려면 `fitContent` 메서드를 사용합니다.

```
$browser->fitContent();
```

테스트가 실패할 때, Dusk는 스크린샷을 찍기 전에 자동으로 브라우저 크기를 콘텐츠에 맞게 조정합니다. 이 기능을 끄고 싶다면 테스트 내부에서 `disableFitOnFailure` 메서드를 호출하세요.

```
$browser->disableFitOnFailure();
```

브라우저 창을 화면 내의 다른 위치로 이동하려면 `move` 메서드를 사용할 수 있습니다.

```
$browser->move($x = 100, $y = 100);
```

<a name="browser-macros"></a>
### 브라우저 매크로

테스트에서 재사용할 수 있는 커스텀 브라우저 메서드를 정의하고 싶다면, `Browser` 클래스의 `macro` 메서드를 사용할 수 있습니다. 일반적으로 [서비스 프로바이더](/docs/8.x/providers)의 `boot` 메서드에서 이 메서드를 호출하는 것이 좋습니다.

```
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Dusk\Browser;

class DuskServiceProvider extends ServiceProvider
{
    /**
     * Register Dusk's browser macros.
     *
     * @return void
     */
    public function boot()
    {
        Browser::macro('scrollToElement', function ($element = null) {
            $this->script("$('html, body').animate({ scrollTop: $('$element').offset().top }, 0);");

            return $this;
        });
    }
}
```

`macro` 함수는 첫 번째 인자로 이름, 두 번째 인자로 클로저를 받습니다. 이렇게 등록한 매크로는 `Browser` 인스턴스에서 메서드처럼 호출할 수 있습니다.

```
$this->browse(function ($browser) use ($user) {
    $browser->visit('/pay')
            ->scrollToElement('#credit-card-details')
            ->assertSee('Enter Credit Card Details');
});
```

<a name="authentication"></a>
### 인증

인증이 필요한 페이지를 테스트할 때, 매번 로그인 화면을 거치지 않고도 Dusk의 `loginAs` 메서드를 이용해 바로 인증할 수 있습니다. `loginAs` 메서드에는 인증 대상 모델의 기본 키 또는 모델 인스턴스를 전달하면 됩니다.

```
use App\Models\User;

$this->browse(function ($browser) {
    $browser->loginAs(User::find(1))
          ->visit('/home');
});
```

> [!NOTE]
> `loginAs` 메서드를 한 번 사용하면, 해당 파일 내의 모든 테스트 동안 해당 사용자 세션이 유지됩니다.

<a name="cookies"></a>
### 쿠키

암호화된 쿠키 값을 가져오거나 설정하려면 `cookie` 메서드를 사용합니다. 라라벨이 생성하는 모든 쿠키는 기본적으로 암호화되어 있습니다.

```
$browser->cookie('name');

$browser->cookie('name', 'Taylor');
```

암호화되지 않은 쿠키 값을 다루려면 `plainCookie` 메서드를 사용합니다.

```
$browser->plainCookie('name');

$browser->plainCookie('name', 'Taylor');
```

쿠키를 삭제하려면 `deleteCookie` 메서드를 사용하세요.

```
$browser->deleteCookie('name');
```

<a name="executing-javascript"></a>
### 자바스크립트 실행

브라우저 내에서 임의의 자바스크립트 구문을 실행하려면 `script` 메서드를 사용하면 됩니다.

```
$browser->script('document.documentElement.scrollTop = 0');

$browser->script([
    'document.body.scrollTop = 0',
    'document.documentElement.scrollTop = 0',
]);

$output = $browser->script('return window.location.pathname');
```

<a name="taking-a-screenshot"></a>
### 스크린샷 찍기

`screenshot` 메서드를 사용하면 입력한 파일명으로 스크린샷을 찍어 저장할 수 있습니다. 모든 스크린샷은 `tests/Browser/screenshots` 디렉터리에 저장됩니다.

```
$browser->screenshot('filename');
```

<a name="storing-console-output-to-disk"></a>
### 콘솔 출력 디스크에 저장

`storeConsoleLog` 메서드를 사용하면, 현재 브라우저의 콘솔 출력을 지정한 파일명으로 디스크에 저장할 수 있습니다. 로그 파일은 `tests/Browser/console` 디렉터리에 저장됩니다.

```
$browser->storeConsoleLog('filename');
```

<a name="storing-page-source-to-disk"></a>
### 페이지 소스 디스크에 저장

`storeSource` 메서드를 이용하면 현재 페이지의 소스를 입력한 파일명으로 저장할 수 있습니다. 페이지 소스는 `tests/Browser/source` 디렉터리에 저장됩니다.

```
$browser->storeSource('filename');
```

<a name="interacting-with-elements"></a>
## 엘리먼트와 상호작용하기

<a name="dusk-selectors"></a>
### Dusk 셀렉터

테스트에서 사용할 엘리먼트를 선택하는 CSS 셀렉터를 잘 고르는 것은 Dusk 테스트 작성의 가장 어려운 부분 중 하나입니다. 시간이 지남에 따라 아래와 같은 CSS 셀렉터는 프론트엔드 변경으로 인해 테스트를 깨뜨릴 수 있습니다.

```
// HTML...

<button>Login</button>

// Test...

$browser->click('.login-page .container div > button');
```

Dusk 셀렉터를 이용하면 CSS 셀렉터를 일일이 기억하는 대신 의미에 집중하여 효과적인 테스트를 작성할 수 있습니다. 셀렉터를 정의하려면, HTML 엘리먼트에 `dusk` 속성을 추가하세요. 이후, Dusk 브라우저에서는 테스트 코드에서 `@` 접두어를 붙여 해당 엘리먼트를 직접 지정할 수 있습니다.

```
// HTML...

<button dusk="login-button">Login</button>

// Test...

$browser->click('@login-button');
```

<a name="text-values-and-attributes"></a>
### 텍스트, 값, 속성

<a name="retrieving-setting-values"></a>
#### 값 가져오기와 설정하기

Dusk는 페이지 내의 엘리먼트의 현재 값, 표시 텍스트, 속성과 상호작용할 수 있는 여러 메서드를 제공합니다. 특정 CSS 또는 Dusk 셀렉터와 일치하는 엘리먼트의 "value"를 얻으려면 `value` 메서드를 사용합니다.

```
// 값 조회...
$value = $browser->value('selector');

// 값 설정...
$browser->value('selector', 'value');
```

특정 필드 이름을 가진 입력 엘리먼트의 "value"를 가져오려면 `inputValue` 메서드를 사용할 수 있습니다.

```
$value = $browser->inputValue('field');
```

<a name="retrieving-text"></a>
#### 텍스트 값 가져오기

`text` 메서드를 사용하면 주어진 셀렉터와 일치하는 엘리먼트의 표시 텍스트를 조회할 수 있습니다.

```
$text = $browser->text('selector');
```

<a name="retrieving-attributes"></a>
#### 속성 값 가져오기

마지막으로, `attribute` 메서드를 사용해서 주어진 셀렉터와 일치하는 엘리먼트의 특정 속성 값을 가져올 수 있습니다.

```
$attribute = $browser->attribute('selector', 'value');
```

<a name="interacting-with-forms"></a>

### 폼과 상호작용하기

<a name="typing-values"></a>
#### 값 입력하기

Dusk는 폼 및 입력 요소와 상호작용할 수 있는 다양한 메서드를 제공합니다. 먼저, 입력 필드에 텍스트를 입력하는 예시를 살펴보겠습니다.

```
$browser->type('email', 'taylor@laravel.com');
```

이 메서드는 필요하다면 CSS 선택자를 인수로 받을 수 있지만, 반드시 전달해야 하는 것은 아닙니다. CSS 선택자를 전달하지 않으면, Dusk는 지정한 `name` 속성을 가진 `input` 또는 `textarea` 필드를 찾아 입력을 시도합니다.

필드의 기존 내용을 지우지 않고 텍스트를 추가하고 싶다면, `append` 메서드를 사용할 수 있습니다.

```
$browser->type('tags', 'foo')
        ->append('tags', ', bar, baz');
```

입력 요소의 값을 지우고 싶을 때는 `clear` 메서드를 사용할 수 있습니다.

```
$browser->clear('email');
```

입력 속도를 천천히 하고 싶다면, `typeSlowly` 메서드를 사용할 수 있습니다. 기본적으로 Dusk는 키 입력 사이에 100밀리초씩 대기합니다. 대기 시간(밀리초 단위)을 세 번째 인수로 사용해 조절할 수 있습니다.

```
$browser->typeSlowly('mobile', '+1 (202) 555-5555');

$browser->typeSlowly('mobile', '+1 (202) 555-5555', 300);
```

`appendSlowly` 메서드를 사용하면 텍스트를 천천히 추가할 수도 있습니다.

```
$browser->type('tags', 'foo')
        ->appendSlowly('tags', ', bar, baz');
```

<a name="dropdowns"></a>
#### 드롭다운

`select` 요소의 값을 선택하려면 `select` 메서드를 사용합니다. `type` 메서드와 마찬가지로, 전체 CSS 선택자를 전달할 필요가 없습니다. `select` 메서드에 값을 전달할 때는 실제 option의 표시 텍스트가 아니라 value 속성값을 전달해야 합니다.

```
$browser->select('size', 'Large');
```

두 번째 인수를 생략하면 임의의 옵션이 선택됩니다.

```
$browser->select('size');
```

두 번째 인수로 배열을 전달하면 여러 옵션을 한 번에 선택하도록 지정할 수 있습니다.

```
$browser->select('categories', ['Art', 'Music']);
```

<a name="checkboxes"></a>
#### 체크박스

체크박스 입력 값을 "체크"하려면 `check` 메서드를 사용할 수 있습니다. 대부분의 입력 관련 메서드처럼 전체 CSS 선택자는 필수가 아닙니다. 선택자와 일치하는 요소를 찾지 못하면, Dusk는 같은 `name` 속성을 가진 체크박스가 있는지 검색합니다.

```
$browser->check('terms');
```

`uncheck` 메서드를 사용하면 체크박스 선택을 해제할 수 있습니다.

```
$browser->uncheck('terms');
```

<a name="radio-buttons"></a>
#### 라디오 버튼

`radio` 입력 옵션을 "선택"하려면 `radio` 메서드를 사용하세요. 다른 입력 처리 메서드와 마찬가지로 전체 CSS 선택자는 필요하지 않습니다. 선택자와 일치하는 요소를 찾지 못하면, Dusk는 일치하는 `name`과 `value` 속성을 갖는 `radio` 입력을 검색합니다.

```
$browser->radio('size', 'large');
```

<a name="attaching-files"></a>
### 파일 첨부하기

`attach` 메서드는 `file` 입력 요소에 파일을 첨부할 때 사용합니다. 다른 입력 처리 메서드와 마찬가지로 전체 CSS 선택자가 반드시 필요한 것은 아닙니다. 선택자와 일치하는 요소를 찾지 못하면, Dusk는 일치하는 `name` 속성의 `file` 입력을 검색합니다.

```
$browser->attach('photo', __DIR__.'/photos/mountains.png');
```

> [!NOTE]
> 파일 첨부 기능을 사용하려면 서버에 PHP의 `Zip` 확장 모듈이 설치 및 활성화되어 있어야 합니다.

<a name="pressing-buttons"></a>
### 버튼 클릭하기

`press` 메서드는 페이지 상의 버튼 요소를 클릭할 때 사용합니다. `press` 메서드의 첫 번째 인수로는 버튼의 표시 텍스트, CSS 선택자, 또는 Dusk 선택자를 지정할 수 있습니다.

```
$browser->press('Login');
```

일부 애플리케이션에서는 폼 제출 시 버튼을 비활성화했다가 HTTP 요청이 완료되면 다시 활성화하는 경우가 많습니다. 버튼을 클릭한 뒤, 해당 버튼이 다시 활성화될 때까지 기다리려면 `pressAndWaitFor` 메서드를 사용합니다.

```
// 버튼을 클릭하고, 최대 5초간 활성화되기를 기다립니다...
$browser->pressAndWaitFor('Save');

// 버튼을 클릭하고, 최대 1초간 활성화되기를 기다립니다...
$browser->pressAndWaitFor('Save', 1);
```

<a name="clicking-links"></a>
### 링크 클릭하기

링크를 클릭하려면 브라우저 인스턴스에서 `clickLink` 메서드를 사용할 수 있습니다. 이 메서드는 지정한 표시 텍스트를 가진 링크를 클릭합니다.

```
$browser->clickLink($linkText);
```

지정한 텍스트의 링크가 페이지에 보이는지 확인하려면 `seeLink` 메서드를 사용할 수 있습니다.

```
if ($browser->seeLink($linkText)) {
    // ...
}
```

> [!NOTE]
> 이 메서드들은 jQuery와 상호작용합니다. 페이지에 jQuery가 없는 경우, Dusk가 자동으로 jQuery를 주입하여 테스트가 진행되는 동안 사용할 수 있도록 합니다.

<a name="using-the-keyboard"></a>
### 키보드 사용하기

`keys` 메서드를 사용하면, `type` 메서드보다 더 복잡한 입력 시나리오를 구현할 수 있습니다. 예를 들어, Dusk에게 modifier 키(조합 키)를 누른 상태로 값을 입력하라고 지시할 수 있습니다. 아래 예시는 `shift` 키를 누른 상태에서 `taylor`를 입력하고, 이어서 modifier 키 없이 `swift`를 입력합니다.

```
$browser->keys('selector', ['{shift}', 'taylor'], 'swift');
```

또한, `keys` 메서드는 CSS 선택자를 기준으로 애플리케이션에 "키보드 단축키" 조합을 전송할 때 유용하게 사용할 수 있습니다.

```
$browser->keys('.app', ['{command}', 'j']);
```

> [!TIP]
> `{command}`와 같이 modifier 키는 `{}` 로 감싸며, 이는 `Facebook\WebDriver\WebDriverKeys` 클래스에 정의된 상수들과 일치합니다. 관련 내용은 [GitHub에서 확인하실 수 있습니다](https://github.com/php-webdriver/php-webdriver/blob/master/lib/WebDriverKeys.php).

<a name="using-the-mouse"></a>
### 마우스 사용하기

<a name="clicking-on-elements"></a>
#### 요소 클릭

`click` 메서드는 지정한 CSS 또는 Dusk 선택자에 해당하는 요소를 클릭합니다.

```
$browser->click('.selector');
```

`clickAtXPath` 메서드는 지정한 XPath 표현식에 해당하는 요소를 클릭합니다.

```
$browser->clickAtXPath('//div[@class = "selector"]');
```

`clickAtPoint` 메서드를 사용하면 브라우저의 보이는 영역 내에서, 지정한 좌표에 위치한 최상단 요소를 클릭할 수 있습니다.

```
$browser->clickAtPoint($x = 0, $y = 0);
```

`doubleClick` 메서드는 마우스 더블클릭을 시뮬레이션합니다.

```
$browser->doubleClick();
```

`rightClick` 메서드는 마우스 우클릭을 시뮬레이션합니다.

```
$browser->rightClick();

$browser->rightClick('.selector');
```

`clickAndHold` 메서드는 마우스 버튼을 눌렀다가 떼지 않고 유지하는 동작을 시뮬레이션합니다. 이어서 `releaseMouse` 메서드를 호출하면 눌러져 있던 마우스 버튼이 해제됩니다.

```
$browser->clickAndHold()
        ->pause(1000)
        ->releaseMouse();
```

<a name="mouseover"></a>
#### 마우스오버

`mouseover` 메서드는 지정한 CSS 또는 Dusk 선택자에 해당하는 요소 위로 마우스를 이동시킬 때 사용합니다.

```
$browser->mouseover('.selector');
```

<a name="drag-drop"></a>
#### 드래그 & 드롭

`drag` 메서드를 사용하면, 지정한 선택자로 대상 요소를 다른 요소로 드래그할 수 있습니다.

```
$browser->drag('.from-selector', '.to-selector');
```

또한, 한 방향으로만 요소를 드래그할 수도 있습니다.

```
$browser->dragLeft('.selector', $pixels = 10);
$browser->dragRight('.selector', $pixels = 10);
$browser->dragUp('.selector', $pixels = 10);
$browser->dragDown('.selector', $pixels = 10);
```

마지막으로, 지정한 offset만큼 요소를 드래그할 수도 있습니다.

```
$browser->dragOffset('.selector', $x = 10, $y = 10);
```

<a name="javascript-dialogs"></a>
### 자바스크립트 대화상자

Dusk는 자바스크립트 다이얼로그(알림창, confirm, prompt 등)와 상호작용할 수 있는 다양한 메서드를 제공합니다. 예를 들어, `waitForDialog` 메서드를 사용해 자바스크립트 다이얼로그가 나타날 때까지 대기할 수 있습니다. 인수로 대기 시간(초)을 전달할 수 있습니다.

```
$browser->waitForDialog($seconds = null);
```

`assertDialogOpened` 메서드는 다이얼로그가 표시되어 있고 지정한 메시지가 포함되어 있는지 확인합니다.

```
$browser->assertDialogOpened('Dialog message');
```

JavaScript 프롬프트를 사용하는 경우, `typeInDialog` 메서드로 프롬프트 입력란에 값을 입력할 수 있습니다.

```
$browser->typeInDialog('Hello World');
```

열려 있는 자바스크립트 다이얼로그에서 "확인" 버튼을 클릭하려면 `acceptDialog` 메서드를 사용합니다.

```
$browser->acceptDialog();
```

"취소" 버튼을 클릭해 대화상자를 닫으려면 `dismissDialog` 메서드를 사용합니다.

```
$browser->dismissDialog();
```

<a name="scoping-selectors"></a>
### 선택자 범위 지정하기

특정 선택자 내에서 여러 동작을 한꺼번에 수행하고 싶을 수 있습니다. 예를 들어, 어떤 텍스트가 테이블 안에만 존재하는지 확인한 후, 해당 테이블 안에서 버튼을 클릭하는 경우입니다. 이럴 때는 `with` 메서드를 사용할 수 있습니다. `with` 메서드에 전달한 클로저 내에서 수행되는 모든 동작은 원래 지정한 선택자 범위 내에서 동작하게 됩니다.

```
$browser->with('.table', function ($table) {
    $table->assertSee('Hello World')
          ->clickLink('Delete');
});
```

때로는 현재 범위에서 벗어나 다른 범위에서 assert를 실행해야 할 수도 있습니다. 이럴 때는 `elsewhere` 또는 `elsewhereWhenAvailable` 메서드를 사용할 수 있습니다.

```
 $browser->with('.table', function ($table) {
    // 현재 범위는 `body .table`입니다...

    $browser->elsewhere('.page-title', function ($title) {
        // 현재 범위는 `body .page-title`입니다...
        $title->assertSee('Hello World');
    });

    $browser->elsewhereWhenAvailable('.page-title', function ($title) {
        // 현재 범위는 `body .page-title`입니다...
        $title->assertSee('Hello World');
    });
 });
```

<a name="waiting-for-elements"></a>
### 요소 대기(Waiting For Elements)

JavaScript를 많이 사용하는 애플리케이션을 테스트할 때는, 특정 요소나 데이터가 화면에 표시될 때까지 "기다렸다가" 이후 테스트를 진행해야 할 수 있습니다. Dusk는 이런 상황을 매우 쉽게 처리할 수 있도록 다양한 대기(wait) 메서드를 제공합니다. 특정 요소가 페이지에 나타날 때까지, 또는 특정 JavaScript 표현식이 `true`로 평가될 때까지 대기할 수 있습니다.

<a name="waiting"></a>
#### 일시 정지하기

단순히 지정한 시간(밀리초 단위)만큼 테스트를 일시 정지하려면 `pause` 메서드를 사용하세요.

```
$browser->pause(1000);
```

<a name="waiting-for-selectors"></a>
#### 선택자 대기

`waitFor` 메서드는 지정한 CSS 또는 Dusk 선택자에 해당하는 요소가 페이지에 표시될 때까지 테스트 실행을 중단합니다. 기본적으로 최대 5초 동안 대기하다가 요소가 없으면 예외를 발생시킵니다. 필요한 경우 두 번째 인수로 타임아웃(초)을 지정할 수 있습니다.

```
// 최대 5초 동안 선택자를 기다립니다...
$browser->waitFor('.selector');

// 최대 1초 동안 선택자를 기다립니다...
$browser->waitFor('.selector', 1);
```

선택자에 해당하는 요소가 특정 텍스트를 포함할 때까지 대기할 수도 있습니다.

```
// 주어진 텍스트가 포함될 때까지, 최대 5초 대기...
$browser->waitForTextIn('.selector', 'Hello World');

// 최대 1초까지 대기...
$browser->waitForTextIn('.selector', 'Hello World', 1);
```

선택자에 해당하는 요소가 페이지에서 사라질 때까지 대기할 수도 있습니다.

```
// 선택자가 사라질 때까지 최대 5초 대기...
$browser->waitUntilMissing('.selector');

// 최대 1초까지 대기...
$browser->waitUntilMissing('.selector', 1);
```

또한, 요소가 활성화 또는 비활성화될 때까지 대기할 수도 있습니다.

```
// 선택자가 활성화될 때까지 최대 5초 대기...
$browser->waitUntilEnabled('.selector');

// 최대 1초까지 대기...
$browser->waitUntilEnabled('.selector', 1);

// 선택자가 비활성화될 때까지 최대 5초 대기...
$browser->waitUntilDisabled('.selector');

// 최대 1초까지 대기...
$browser->waitUntilDisabled('.selector', 1);
```

<a name="scoping-selectors-when-available"></a>
#### 요소가 나타날 때까지 범위 지정

때로는 특정 선택자에 해당하는 요소가 화면에 나타날 때까지 기다렸다가, 해당 요소와 상호작용하고 싶을 수 있습니다. 예를 들어, 모달 창이 나타나기를 기다린 후, 그 안에서 "OK" 버튼을 클릭하는 경우가 있습니다. 이럴 때는 `whenAvailable` 메서드를 사용할 수 있습니다. 클로저 안의 모든 동작은 원래 선택자 범위 내에서 동작하게 됩니다.

```
$browser->whenAvailable('.modal', function ($modal) {
    $modal->assertSee('Hello World')
          ->press('OK');
});
```

<a name="waiting-for-text"></a>
#### 텍스트가 나타날 때까지 대기

`waitForText` 메서드는 지정한 텍스트가 페이지에 표시될 때까지 대기합니다.

```
// 최대 5초 동안 텍스트가 표시되기를 대기...
$browser->waitForText('Hello World');

// 최대 1초 동안 대기...
$browser->waitForText('Hello World', 1);
```

`waitUntilMissingText` 메서드는 텍스트가 페이지에서 사라질 때까지 대기합니다.

```
// 텍스트가 사라질 때까지 최대 5초 대기...
$browser->waitUntilMissingText('Hello World');

// 최대 1초까지 대기...
$browser->waitUntilMissingText('Hello World', 1);
```

<a name="waiting-for-links"></a>
#### 링크가 나타날 때까지 대기

`waitForLink` 메서드는 지정한 링크 텍스트가 페이지에 표시될 때까지 대기합니다.

```
// 링크가 표시될 때까지 최대 5초 대기...
$browser->waitForLink('Create');

// 최대 1초까지 대기...
$browser->waitForLink('Create', 1);
```

<a name="waiting-on-the-page-location"></a>
#### 페이지 위치가 바뀔 때까지 대기

`$browser->assertPathIs('/home')`처럼 경로를 확인하는 assert는, 비동기로 `window.location.pathname`이 바뀔 경우 실패할 수 있습니다. 경로가 특정 값이 될 때까지 기다리고 싶다면 `waitForLocation` 메서드를 사용하세요.

```
$browser->waitForLocation('/secret');
```

`waitForLocation` 메서드는 현재 창의 전체 URL이 특정 값이 될 때까지 대기할 때도 사용할 수 있습니다.

```
$browser->waitForLocation('https://example.com/path');
```

또한, [이름이 지정된 라우트](/docs/8.x/routing#named-routes)의 위치가 될 때까지 대기할 수도 있습니다.

```
$browser->waitForRoute($routeName, $parameters);
```

<a name="waiting-for-page-reloads"></a>
#### 페이지 새로고침 대기

어떤 동작 후에 페이지가 새로고침되기를 기다려야 할 때는 `waitForReload` 메서드를 사용할 수 있습니다.

```
use Laravel\Dusk\Browser;

$browser->waitForReload(function (Browser $browser) {
    $browser->press('Submit');
})
->assertSee('Success!');
```

페이지 새로고침을 대기해야 하는 경우는 주로 버튼 클릭 뒤에 발생하므로, 좀 더 간단하게는 `clickAndWaitForReload` 메서드를 사용할 수 있습니다.

```
$browser->clickAndWaitForReload('.selector')
        ->assertSee('something');
```

<a name="waiting-on-javascript-expressions"></a>
#### JavaScript 표현식이 참이 될 때까지 대기

가끔 특정 JavaScript 표현식이 `true`로 평가될 때까지 테스트를 일시 중지하고 싶을 수 있습니다. 이럴 때는 `waitUntil` 메서드를 사용하면 됩니다. 이 메서드에 표현식을 전달할 때, `return` 키워드나 세미콜론(;)은 쓸 필요가 없습니다.

```
// 표현식이 true가 될 때까지, 최대 5초 대기...
$browser->waitUntil('App.data.servers.length > 0');

// 최대 1초까지 대기...
$browser->waitUntil('App.data.servers.length > 0', 1);
```

<a name="waiting-on-vue-expressions"></a>
#### Vue 표현식이 참이 될 때까지 대기

`waitUntilVue`와 `waitUntilVueIsNot` 메서드는 [Vue 컴포넌트](https://vuejs.org)의 특정 속성(attribute)이 지정한 값이 될 때까지(또는 아닐 때까지) 대기합니다.

```
// 컴포넌트 속성에 지정한 값이 포함될 때까지 대기...
$browser->waitUntilVue('user.name', 'Taylor', '@user');

// 지정한 값이 포함되지 않을 때까지 대기...
$browser->waitUntilVueIsNot('user.name', null, '@user');
```

<a name="waiting-with-a-callback"></a>
#### 콜백을 이용해 대기하기

Dusk의 "wait" 계열 메서드 대부분은 내부적으로 `waitUsing` 메서드를 사용합니다. 이 메서드를 직접 이용해, 전달한 클로저가 `true`를 반환할 때까지 기다릴 수 있습니다. 이때 최대 대기 시간(초), 체크 주기(초), 클로저, 그리고 실패 시 보여줄 메시지를 인수로 전달합니다.

```
$browser->waitUsing(10, 1, function () use ($something) {
    return $something->isReady();
}, "Something wasn't ready in time.");
```

<a name="scrolling-an-element-into-view"></a>
### 요소를 화면에 스크롤하기

간혹, 클릭하려는 요소가 브라우저의 보이는 영역 밖에 있어서 클릭이 불가능할 때가 있습니다. 이럴 때는 `scrollIntoView` 메서드로 해당 선택자의 요소가 화면에 보이도록 스크롤할 수 있습니다.

```
$browser->scrollIntoView('.selector')
        ->click('.selector');
```

<a name="available-assertions"></a>
## 사용 가능한 Assertion 목록

Dusk에서는 애플리케이션에 대해 다양한 assertion(검증)을 수행할 수 있습니다. 아래 목록에서 지원되는 모든 assertion을 확인하실 수 있습니다.


<div class="collection-method-list" markdown="1">

[assertTitle](#assert-title)
[assertTitleContains](#assert-title-contains)
[assertUrlIs](#assert-url-is)
[assertSchemeIs](#assert-scheme-is)
[assertSchemeIsNot](#assert-scheme-is-not)
[assertHostIs](#assert-host-is)
[assertHostIsNot](#assert-host-is-not)
[assertPortIs](#assert-port-is)
[assertPortIsNot](#assert-port-is-not)
[assertPathBeginsWith](#assert-path-begins-with)
[assertPathIs](#assert-path-is)
[assertPathIsNot](#assert-path-is-not)
[assertRouteIs](#assert-route-is)
[assertQueryStringHas](#assert-query-string-has)
[assertQueryStringMissing](#assert-query-string-missing)
[assertFragmentIs](#assert-fragment-is)
[assertFragmentBeginsWith](#assert-fragment-begins-with)
[assertFragmentIsNot](#assert-fragment-is-not)
[assertHasCookie](#assert-has-cookie)
[assertHasPlainCookie](#assert-has-plain-cookie)
[assertCookieMissing](#assert-cookie-missing)
[assertPlainCookieMissing](#assert-plain-cookie-missing)
[assertCookieValue](#assert-cookie-value)
[assertPlainCookieValue](#assert-plain-cookie-value)
[assertSee](#assert-see)
[assertDontSee](#assert-dont-see)
[assertSeeIn](#assert-see-in)
[assertDontSeeIn](#assert-dont-see-in)
[assertSeeAnythingIn](#assert-see-anything-in)
[assertSeeNothingIn](#assert-see-nothing-in)
[assertScript](#assert-script)
[assertSourceHas](#assert-source-has)
[assertSourceMissing](#assert-source-missing)
[assertSeeLink](#assert-see-link)
[assertDontSeeLink](#assert-dont-see-link)
[assertInputValue](#assert-input-value)
[assertInputValueIsNot](#assert-input-value-is-not)
[assertChecked](#assert-checked)
[assertNotChecked](#assert-not-checked)
[assertRadioSelected](#assert-radio-selected)
[assertRadioNotSelected](#assert-radio-not-selected)
[assertSelected](#assert-selected)
[assertNotSelected](#assert-not-selected)
[assertSelectHasOptions](#assert-select-has-options)
[assertSelectMissingOptions](#assert-select-missing-options)
[assertSelectHasOption](#assert-select-has-option)
[assertSelectMissingOption](#assert-select-missing-option)
[assertValue](#assert-value)
[assertValueIsNot](#assert-value-is-not)
[assertAttribute](#assert-attribute)
[assertAttributeContains](#assert-attribute-contains)
[assertAriaAttribute](#assert-aria-attribute)
[assertDataAttribute](#assert-data-attribute)
[assertVisible](#assert-visible)
[assertPresent](#assert-present)
[assertNotPresent](#assert-not-present)
[assertMissing](#assert-missing)
[assertInputPresent](#assert-input-present)
[assertInputMissing](#assert-input-missing)
[assertDialogOpened](#assert-dialog-opened)
[assertEnabled](#assert-enabled)
[assertDisabled](#assert-disabled)
[assertButtonEnabled](#assert-button-enabled)
[assertButtonDisabled](#assert-button-disabled)
[assertFocused](#assert-focused)
[assertNotFocused](#assert-not-focused)
[assertAuthenticated](#assert-authenticated)
[assertGuest](#assert-guest)
[assertAuthenticatedAs](#assert-authenticated-as)
[assertVue](#assert-vue)
[assertVueIsNot](#assert-vue-is-not)
[assertVueContains](#assert-vue-contains)
[assertVueDoesNotContain](#assert-vue-does-not-contain)

</div>

<a name="assert-title"></a>

#### assertTitle

페이지의 타이틀이 지정한 텍스트와 일치하는지 확인합니다.

```
$browser->assertTitle($title);
```

<a name="assert-title-contains"></a>
#### assertTitleContains

페이지의 타이틀에 지정한 텍스트가 포함되어 있는지 확인합니다.

```
$browser->assertTitleContains($title);
```

<a name="assert-url-is"></a>
#### assertUrlIs

현재 URL(쿼리 문자열 제외)이 지정한 문자열과 일치하는지 확인합니다.

```
$browser->assertUrlIs($url);
```

<a name="assert-scheme-is"></a>
#### assertSchemeIs

현재 URL의 스킴(scheme)이 지정한 스킴과 일치하는지 확인합니다.

```
$browser->assertSchemeIs($scheme);
```

<a name="assert-scheme-is-not"></a>
#### assertSchemeIsNot

현재 URL의 스킴(scheme)이 지정한 스킴과 일치하지 않는지 확인합니다.

```
$browser->assertSchemeIsNot($scheme);
```

<a name="assert-host-is"></a>
#### assertHostIs

현재 URL의 호스트(host)가 지정한 호스트와 일치하는지 확인합니다.

```
$browser->assertHostIs($host);
```

<a name="assert-host-is-not"></a>
#### assertHostIsNot

현재 URL의 호스트(host)가 지정한 호스트와 일치하지 않는지 확인합니다.

```
$browser->assertHostIsNot($host);
```

<a name="assert-port-is"></a>
#### assertPortIs

현재 URL의 포트(port)가 지정한 포트와 일치하는지 확인합니다.

```
$browser->assertPortIs($port);
```

<a name="assert-port-is-not"></a>
#### assertPortIsNot

현재 URL의 포트(port)가 지정한 포트와 일치하지 않는지 확인합니다.

```
$browser->assertPortIsNot($port);
```

<a name="assert-path-begins-with"></a>
#### assertPathBeginsWith

현재 URL의 경로(path)가 지정한 경로로 시작하는지 확인합니다.

```
$browser->assertPathBeginsWith('/home');
```

<a name="assert-path-is"></a>
#### assertPathIs

현재 경로(path)가 지정한 경로와 일치하는지 확인합니다.

```
$browser->assertPathIs('/home');
```

<a name="assert-path-is-not"></a>
#### assertPathIsNot

현재 경로(path)가 지정한 경로와 일치하지 않는지 확인합니다.

```
$browser->assertPathIsNot('/home');
```

<a name="assert-route-is"></a>
#### assertRouteIs

현재 URL이 [명명된 라우트](/docs/8.x/routing#named-routes)의 URL과 일치하는지 확인합니다.

```
$browser->assertRouteIs($name, $parameters);
```

<a name="assert-query-string-has"></a>
#### assertQueryStringHas

지정한 쿼리 문자열 파라미터가 존재하는지 확인합니다.

```
$browser->assertQueryStringHas($name);
```

쿼리 문자열 파라미터가 지정한 값으로 존재하는지 확인합니다.

```
$browser->assertQueryStringHas($name, $value);
```

<a name="assert-query-string-missing"></a>
#### assertQueryStringMissing

지정한 쿼리 문자열 파라미터가 존재하지 않는지 확인합니다.

```
$browser->assertQueryStringMissing($name);
```

<a name="assert-fragment-is"></a>
#### assertFragmentIs

URL의 해시 프래그먼트(fragment)가 지정한 값과 일치하는지 확인합니다.

```
$browser->assertFragmentIs('anchor');
```

<a name="assert-fragment-begins-with"></a>
#### assertFragmentBeginsWith

URL의 해시 프래그먼트(fragment)가 지정한 값으로 시작하는지 확인합니다.

```
$browser->assertFragmentBeginsWith('anchor');
```

<a name="assert-fragment-is-not"></a>
#### assertFragmentIsNot

URL의 해시 프래그먼트가 지정한 값과 일치하지 않는지 확인합니다.

```
$browser->assertFragmentIsNot('anchor');
```

<a name="assert-has-cookie"></a>
#### assertHasCookie

지정한 암호화된 쿠키가 존재하는지 확인합니다.

```
$browser->assertHasCookie($name);
```

<a name="assert-has-plain-cookie"></a>
#### assertHasPlainCookie

지정한 암호화되지 않은(plain) 쿠키가 존재하는지 확인합니다.

```
$browser->assertHasPlainCookie($name);
```

<a name="assert-cookie-missing"></a>
#### assertCookieMissing

지정한 암호화된 쿠키가 존재하지 않는지 확인합니다.

```
$browser->assertCookieMissing($name);
```

<a name="assert-plain-cookie-missing"></a>
#### assertPlainCookieMissing

지정한 암호화되지 않은(plain) 쿠키가 존재하지 않는지 확인합니다.

```
$browser->assertPlainCookieMissing($name);
```

<a name="assert-cookie-value"></a>
#### assertCookieValue

암호화된 쿠키가 지정한 값을 가지는지 확인합니다.

```
$browser->assertCookieValue($name, $value);
```

<a name="assert-plain-cookie-value"></a>
#### assertPlainCookieValue

암호화되지 않은 쿠키가 지정한 값을 가지는지 확인합니다.

```
$browser->assertPlainCookieValue($name, $value);
```

<a name="assert-see"></a>
#### assertSee

지정한 텍스트가 페이지에 나타나는지 확인합니다.

```
$browser->assertSee($text);
```

<a name="assert-dont-see"></a>
#### assertDontSee

지정한 텍스트가 페이지에 나타나지 않는지 확인합니다.

```
$browser->assertDontSee($text);
```

<a name="assert-see-in"></a>
#### assertSeeIn

지정한 셀렉터 내부에 지정한 텍스트가 있는지 확인합니다.

```
$browser->assertSeeIn($selector, $text);
```

<a name="assert-dont-see-in"></a>
#### assertDontSeeIn

지정한 셀렉터 내부에 지정한 텍스트가 없는지 확인합니다.

```
$browser->assertDontSeeIn($selector, $text);
```

<a name="assert-see-anything-in"></a>
#### assertSeeAnythingIn

지정한 셀렉터 내부에 어떤 텍스트든 존재하는지 확인합니다.

```
$browser->assertSeeAnythingIn($selector);
```

<a name="assert-see-nothing-in"></a>
#### assertSeeNothingIn

지정한 셀렉터 내부에 어떤 텍스트도 존재하지 않는지 확인합니다.

```
$browser->assertSeeNothingIn($selector);
```

<a name="assert-script"></a>
#### assertScript

지정한 JavaScript 표현식이 원하는 값으로 평가되는지 확인합니다.

```
$browser->assertScript('window.isLoaded')
        ->assertScript('document.readyState', 'complete');
```

<a name="assert-source-has"></a>
#### assertSourceHas

페이지의 소스에 지정한 코드가 존재하는지 확인합니다.

```
$browser->assertSourceHas($code);
```

<a name="assert-source-missing"></a>
#### assertSourceMissing

페이지의 소스에 지정한 코드가 존재하지 않는지 확인합니다.

```
$browser->assertSourceMissing($code);
```

<a name="assert-see-link"></a>
#### assertSeeLink

페이지에 지정한 텍스트의 링크가 존재하는지 확인합니다.

```
$browser->assertSeeLink($linkText);
```

<a name="assert-dont-see-link"></a>
#### assertDontSeeLink

페이지에 지정한 텍스트의 링크가 존재하지 않는지 확인합니다.

```
$browser->assertDontSeeLink($linkText);
```

<a name="assert-input-value"></a>
#### assertInputValue

지정한 입력 필드(input)가 지정한 값을 가지는지 확인합니다.

```
$browser->assertInputValue($field, $value);
```

<a name="assert-input-value-is-not"></a>
#### assertInputValueIsNot

지정한 입력 필드(input)가 지정한 값을 가지지 않는지 확인합니다.

```
$browser->assertInputValueIsNot($field, $value);
```

<a name="assert-checked"></a>
#### assertChecked

지정한 체크박스가 체크되어 있는지 확인합니다.

```
$browser->assertChecked($field);
```

<a name="assert-not-checked"></a>
#### assertNotChecked

지정한 체크박스가 체크되어 있지 않은지 확인합니다.

```
$browser->assertNotChecked($field);
```

<a name="assert-radio-selected"></a>
#### assertRadioSelected

지정한 라디오 필드가 선택되어 있는지 확인합니다.

```
$browser->assertRadioSelected($field, $value);
```

<a name="assert-radio-not-selected"></a>
#### assertRadioNotSelected

지정한 라디오 필드가 선택되어 있지 않은지 확인합니다.

```
$browser->assertRadioNotSelected($field, $value);
```

<a name="assert-selected"></a>
#### assertSelected

지정한 드롭다운에서 지정한 값이 선택되어 있는지 확인합니다.

```
$browser->assertSelected($field, $value);
```

<a name="assert-not-selected"></a>
#### assertNotSelected

지정한 드롭다운에서 지정한 값이 선택되어 있지 않은지 확인합니다.

```
$browser->assertNotSelected($field, $value);
```

<a name="assert-select-has-options"></a>
#### assertSelectHasOptions

지정한 값 배열의 값들이 선택지로 존재하는지 확인합니다.

```
$browser->assertSelectHasOptions($field, $values);
```

<a name="assert-select-missing-options"></a>
#### assertSelectMissingOptions

지정한 값 배열의 값들이 선택지로 존재하지 않는지 확인합니다.

```
$browser->assertSelectMissingOptions($field, $values);
```

<a name="assert-select-has-option"></a>
#### assertSelectHasOption

지정한 필드에 지정한 값이 선택지로 존재하는지 확인합니다.

```
$browser->assertSelectHasOption($field, $value);
```

<a name="assert-select-missing-option"></a>
#### assertSelectMissingOption

지정한 값이 선택지로 존재하지 않는지 확인합니다.

```
$browser->assertSelectMissingOption($field, $value);
```

<a name="assert-value"></a>
#### assertValue

지정한 셀렉터에 해당하는 요소가 지정한 값을 가지는지 확인합니다.

```
$browser->assertValue($selector, $value);
```

<a name="assert-value-is-not"></a>
#### assertValueIsNot

지정한 셀렉터에 해당하는 요소가 지정한 값을 가지지 않는지 확인합니다.

```
$browser->assertValueIsNot($selector, $value);
```

<a name="assert-attribute"></a>
#### assertAttribute

지정한 셀렉터에 해당하는 요소가 지정한 속성(attribute)에 해당 값을 가지는지 확인합니다.

```
$browser->assertAttribute($selector, $attribute, $value);
```

<a name="assert-attribute-contains"></a>
#### assertAttributeContains

지정한 셀렉터에 해당하는 요소가 지정한 속성(attribute)에 지정한 값을 포함하는지 확인합니다.

```
$browser->assertAttributeContains($selector, $attribute, $value);
```

<a name="assert-aria-attribute"></a>
#### assertAriaAttribute

지정한 셀렉터에 해당하는 요소가 주어진 aria 속성(attribute)에 지정한 값을 가지는지 확인합니다.

```
$browser->assertAriaAttribute($selector, $attribute, $value);
```

예를 들어, `<button aria-label="Add"></button>` 마크업이 있을 경우, 아래와 같이 `aria-label` 속성을 검사할 수 있습니다.

```
$browser->assertAriaAttribute('button', 'label', 'Add')
```

<a name="assert-data-attribute"></a>
#### assertDataAttribute

지정한 셀렉터에 해당하는 요소가 주어진 data 속성(attribute)에 지정한 값을 가지는지 확인합니다.

```
$browser->assertDataAttribute($selector, $attribute, $value);
```

예를 들어, `<tr id="row-1" data-content="attendees"></tr>` 마크업이 있다면, 아래와 같이 `data-label` 속성을 검사할 수 있습니다.

```
$browser->assertDataAttribute('#row-1', 'content', 'attendees')
```

<a name="assert-visible"></a>
#### assertVisible

지정한 셀렉터에 해당하는 요소가 화면에 보이는지 확인합니다.

```
$browser->assertVisible($selector);
```

<a name="assert-present"></a>
#### assertPresent

지정한 셀렉터에 해당하는 요소가 소스에 존재하는지 확인합니다.

```
$browser->assertPresent($selector);
```

<a name="assert-not-present"></a>
#### assertNotPresent

지정한 셀렉터에 해당하는 요소가 소스에 존재하지 않는지 확인합니다.

```
$browser->assertNotPresent($selector);
```

<a name="assert-missing"></a>
#### assertMissing

지정한 셀렉터에 해당하는 요소가 화면에 보이지 않는지 확인합니다.

```
$browser->assertMissing($selector);
```

<a name="assert-input-present"></a>
#### assertInputPresent

지정한 이름을 가진 input 필드가 존재하는지 확인합니다.

```
$browser->assertInputPresent($name);
```

<a name="assert-input-missing"></a>
#### assertInputMissing

지정한 이름을 가진 input 필드가 소스에 존재하지 않는지 확인합니다.

```
$browser->assertInputMissing($name);
```

<a name="assert-dialog-opened"></a>
#### assertDialogOpened

JavaScript 다이얼로그에 지정한 메시지가 표시되어 열려 있는지 확인합니다.

```
$browser->assertDialogOpened($message);
```

<a name="assert-enabled"></a>
#### assertEnabled

지정한 필드가 활성화되어 있는지 확인합니다.

```
$browser->assertEnabled($field);
```

<a name="assert-disabled"></a>

#### assertDisabled

주어진 필드가 비활성화(disabled)되어 있는지 확인합니다.

```
$browser->assertDisabled($field);
```

<a name="assert-button-enabled"></a>
#### assertButtonEnabled

주어진 버튼이 활성화(enabled)되어 있는지 확인합니다.

```
$browser->assertButtonEnabled($button);
```

<a name="assert-button-disabled"></a>
#### assertButtonDisabled

주어진 버튼이 비활성화(disabled)되어 있는지 확인합니다.

```
$browser->assertButtonDisabled($button);
```

<a name="assert-focused"></a>
#### assertFocused

주어진 필드에 포커스가 되어 있는지 확인합니다.

```
$browser->assertFocused($field);
```

<a name="assert-not-focused"></a>
#### assertNotFocused

주어진 필드에 포커스가 되어 있지 않은지 확인합니다.

```
$browser->assertNotFocused($field);
```

<a name="assert-authenticated"></a>
#### assertAuthenticated

사용자가 인증(authenticated)된 상태인지 확인합니다.

```
$browser->assertAuthenticated();
```

<a name="assert-guest"></a>
#### assertGuest

사용자가 인증되지 않은(게스트) 상태인지 확인합니다.

```
$browser->assertGuest();
```

<a name="assert-authenticated-as"></a>
#### assertAuthenticatedAs

지정한 사용자로 인증되었는지 확인합니다.

```
$browser->assertAuthenticatedAs($user);
```

<a name="assert-vue"></a>
#### assertVue

Dusk를 사용하면 [Vue 컴포넌트](https://vuejs.org)의 데이터 상태까지도 검증할 수 있습니다. 예를 들어, 다음과 같은 Vue 컴포넌트가 애플리케이션에 있다고 가정해봅니다.

```
// HTML...

<profile dusk="profile-component"></profile>

// Component Definition...

Vue.component('profile', {
    template: '<div>{{ user.name }}</div>',

    data: function () {
        return {
            user: {
                name: 'Taylor'
            }
        };
    }
});
```

Vue 컴포넌트의 상태를 다음과 같이 검증할 수 있습니다.

```
/**
 * 기본적인 Vue 테스트 예시.
 *
 * @return void
 */
public function testVue()
{
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
                ->assertVue('user.name', 'Taylor', '@profile-component');
    });
}
```

<a name="assert-vue-is-not"></a>
#### assertVueIsNot

특정 Vue 컴포넌트의 데이터 속성이 지정한 값과 일치하지 않는지 확인합니다.

```
$browser->assertVueIsNot($property, $value, $componentSelector = null);
```

<a name="assert-vue-contains"></a>
#### assertVueContains

특정 Vue 컴포넌트의 데이터 속성이 배열이며, 해당 배열에 지정한 값을 포함하는지 확인합니다.

```
$browser->assertVueContains($property, $value, $componentSelector = null);
```

<a name="assert-vue-does-not-contain"></a>
#### assertVueDoesNotContain

특정 Vue 컴포넌트의 데이터 속성이 배열이며, 해당 배열에 지정한 값을 포함하지 않는지 확인합니다.

```
$browser->assertVueDoesNotContain($property, $value, $componentSelector = null);
```

<a name="pages"></a>
## 페이지(Pages)

때時로 테스트에서는 여러 복잡한 동작을 순차적으로 수행해야 할 때가 있습니다. 이런 경우 테스트가 읽기 어렵고 이해하기 힘들어질 수 있습니다. Dusk의 페이지(Page) 기능을 사용하면 각 페이지에서 수행해야 할 동작을 명확하게 하나의 메서드로 정의할 수 있습니다. 또한 페이지 단위로 애플리케이션 전체 또는 특정 페이지에서 자주 사용하는 셀렉터의 단축키(Shorthand Selector)도 정의할 수 있습니다.

<a name="generating-pages"></a>
### 페이지 생성하기

페이지 객체를 생성하려면 `dusk:page` 아티즌 명령어를 실행합니다. 생성된 페이지 객체는 애플리케이션의 `tests/Browser/Pages` 디렉토리에 저장됩니다.

```
php artisan dusk:page Login
```

<a name="configuring-pages"></a>
### 페이지 설정하기

기본적으로 페이지에는 `url`, `assert`, `elements` 세 가지 메서드가 존재합니다. 여기서는 `url`과 `assert` 메서드에 대해 설명합니다. `elements` 메서드는 [아래에서 더 자세히 다룹니다](#shorthand-selectors).

<a name="the-url-method"></a>
#### `url` 메서드

`url` 메서드는 해당 페이지를 나타내는 URL 경로를 반환해야 합니다. Dusk는 브라우저에서 이 URL로 이동할 때 이 값을 사용합니다.

```
/**
 * 페이지의 URL을 반환합니다.
 *
 * @return string
 */
public function url()
{
    return '/login';
}
```

<a name="the-assert-method"></a>
#### `assert` 메서드

`assert` 메서드에서는 브라우저가 실제로 올바른 페이지에 있는지 확인할 수 있습니다. 이 메서드에 반드시 무언가를 작성해야 하는 것은 아니지만, 원한다면 필요한 검증 로직을 추가할 수 있습니다. 이 검증들은 해당 페이지로 이동할 때 자동으로 실행됩니다.

```
/**
 * 브라우저가 현재 이 페이지에 있는지 검증합니다.
 *
 * @return void
 */
public function assert(Browser $browser)
{
    $browser->assertPathIs($this->url());
}
```

<a name="navigating-to-pages"></a>
### 페이지로 이동하기

페이지가 정의된 후에는 `visit` 메서드를 사용해 해당 페이지로 이동할 수 있습니다.

```
use Tests\Browser\Pages\Login;

$browser->visit(new Login);
```

이미 특정 페이지에 진입한 뒤에 해당 페이지의 셀렉터와 메서드를 현재 테스트에서 활용하고 싶은 경우가 있습니다. 예를 들어 버튼을 클릭하여 리다이렉션된 경우 명시적으로 새로 페이지에 접근하지 않아도, `on` 메서드를 호출해 해당 페이지 객체를 불러올 수 있습니다.

```
use Tests\Browser\Pages\CreatePlaylist;

$browser->visit('/dashboard')
        ->clickLink('Create Playlist')
        ->on(new CreatePlaylist)
        ->assertSee('@create');
```

<a name="shorthand-selectors"></a>
### 셀렉터 단축키(Shorthand Selectors)

페이지 클래스의 `elements` 메서드를 활용하면 CSS 셀렉터에 짧고 기억하기 쉬운 별칭(Shortcut)을 정의할 수 있습니다. 예를 들어, 로그인 페이지의 "email" 입력 필드에 대한 단축키를 다음과 같이 정의할 수 있습니다.

```
/**
 * 페이지에서 사용할 셀렉터 단축키를 반환합니다.
 *
 * @return array
 */
public function elements()
{
    return [
        '@email' => 'input[name=email]',
    ];
}
```

이렇게 Shortcut을 정의하면, 전체 CSS 셀렉터 대신 어느 곳에서나 단축키를 사용할 수 있습니다.

```
$browser->type('@email', 'taylor@laravel.com');
```

<a name="global-shorthand-selectors"></a>
#### 전역 셀렉터 단축키

Dusk를 설치한 후에는 기본 `Page` 클래스가 `tests/Browser/Pages` 디렉토리에 생성됩니다. 이 클래스의 `siteElements` 메서드를 활용하면, 애플리케이션 전체 모든 페이지에서 사용할 수 있는 전역 셀렉터 단축키를 지정할 수 있습니다.

```
/**
 * 사이트 전체에서 사용할 전역 셀렉터 단축키를 반환합니다.
 *
 * @return array
 */
public static function siteElements()
{
    return [
        '@element' => '#selector',
    ];
}
```

<a name="page-methods"></a>
### 페이지 메서드

기본 제공되는 메서드 외에도, 테스트 전반에서 사용할 추가적인 메서드를 페이지 클래스에 자유롭게 정의할 수 있습니다. 예를 들어, 음악 관리 애플리케이션을 만든다고 가정합니다. 여러 테스트에서 항상 "플레이리스트 만들기" 기능이 쓰인다면, 각 테스트마다 같은 코드를 작성하지 않고 아래처럼 `createPlaylist`라는 페이지 메서드를 정의할 수 있습니다.

```
<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;

class Dashboard extends Page
{
    // 다른 페이지 메서드...

    /**
     * 새로운 플레이리스트를 생성합니다.
     *
     * @param  \Laravel\Dusk\Browser  $browser
     * @param  string  $name
     * @return void
     */
    public function createPlaylist(Browser $browser, $name)
    {
        $browser->type('name', $name)
                ->check('share')
                ->press('Create Playlist');
    }
}
```

메서드를 정의한 후에는, 해당 페이지를 사용하는 어떤 테스트에서든 아래처럼 쉽게 사용할 수 있습니다. 커스텀 페이지 메서드에는 브라우저 인스턴스가 자동으로 첫 번째 인자로 전달됩니다.

```
use Tests\Browser\Pages\Dashboard;

$browser->visit(new Dashboard)
        ->createPlaylist('My Playlist')
        ->assertSee('My Playlist');
```

<a name="components"></a>
## 컴포넌트(Components)

컴포넌트는 Dusk의 "페이지 객체"와 유사하지만, 네비게이션 바나 알림 창처럼 애플리케이션의 여러 곳에서 재사용되는 UI 요소나 기능을 위한 개념입니다. 이러한 컴포넌트는 하나의 특정 URL에만 종속되지 않습니다.

<a name="generating-components"></a>
### 컴포넌트 생성하기

컴포넌트를 생성하려면 `dusk:component` 아티즌 명령어를 실행하십시오. 새 컴포넌트는 `tests/Browser/Components` 디렉토리에 생성됩니다.

```
php artisan dusk:component DatePicker
```

앞서 보았듯, "데이트 피커"와 같은 컴포넌트는 애플리케이션의 다양한 페이지에서 공통적으로 존재할 수 있습니다. 만약 테스트마다 날짜 선택 로직을 직접 작성한다면 매우 번거로울 것입니다. 대신, Dusk 컴포넌트 하나로 캡슐화하면, 해당 로직을 컴포넌트 안에서만 관리할 수 있습니다.

```
<?php

namespace Tests\Browser\Components;

use Laravel\Dusk\Browser;
use Laravel\Dusk\Component as BaseComponent;

class DatePicker extends BaseComponent
{
    /**
     * 컴포넌트의 루트 셀렉터를 반환합니다.
     *
     * @return string
     */
    public function selector()
    {
        return '.date-picker';
    }

    /**
     * 브라우저 페이지에 컴포넌트가 존재하는지 확인합니다.
     *
     * @param  Browser  $browser
     * @return void
     */
    public function assert(Browser $browser)
    {
        $browser->assertVisible($this->selector());
    }

    /**
     * 컴포넌트에서 사용할 셀렉터 단축키를 반환합니다.
     *
     * @return array
     */
    public function elements()
    {
        return [
            '@date-field' => 'input.datepicker-input',
            '@year-list' => 'div > div.datepicker-years',
            '@month-list' => 'div > div.datepicker-months',
            '@day-list' => 'div > div.datepicker-days',
        ];
    }

    /**
     * 지정한 날짜를 선택합니다.
     *
     * @param  \Laravel\Dusk\Browser  $browser
     * @param  int  $year
     * @param  int  $month
     * @param  int  $day
     * @return void
     */
    public function selectDate(Browser $browser, $year, $month, $day)
    {
        $browser->click('@date-field')
                ->within('@year-list', function ($browser) use ($year) {
                    $browser->click($year);
                })
                ->within('@month-list', function ($browser) use ($month) {
                    $browser->click($month);
                })
                ->within('@day-list', function ($browser) use ($day) {
                    $browser->click($day);
                });
    }
}
```

<a name="using-components"></a>
### 컴포넌트 사용하기

컴포넌트를 한 번 정의하면, 이제 어떤 테스트에서든 손쉽게 데이트 피커에서 날짜를 선택할 수 있습니다. 또한, 날짜 선택 로직이 변경될 경우 컴포넌트 내부만 수정하면 되므로 유지보수도 매우 편리해집니다.

```
<?php

namespace Tests\Browser;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\Browser\Components\DatePicker;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    /**
     * 기본적인 컴포넌트 테스트 예시.
     *
     * @return void
     */
    public function testBasicExample()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/')
                    ->within(new DatePicker, function ($browser) {
                        $browser->selectDate(2019, 1, 30);
                    })
                    ->assertSee('January');
        });
    }
}
```

<a name="continuous-integration"></a>
## 지속적 통합(Continuous Integration)

> [!NOTE]
> 대부분의 Dusk 지속적 통합 환경에서는 라라벨 애플리케이션을 포트 8000번에서 PHP 개발 서버로 구동하는 것을 전제로 합니다. 따라서, 진행 전 CI 환경의 `APP_URL` 환경 변수 값이 `http://127.0.0.1:8000`으로 되어 있는지 꼭 확인해야 합니다.

<a name="running-tests-on-heroku-ci"></a>
### Heroku CI

[Heroku CI](https://www.heroku.com/continuous-integration)에서 Dusk 테스트를 실행하려면 Heroku `app.json` 파일에 아래와 같이 Google Chrome 빌드팩과 스크립트를 추가합니다.

```
{
  "environments": {
    "test": {
      "buildpacks": [
        { "url": "heroku/php" },
        { "url": "https://github.com/heroku/heroku-buildpack-google-chrome" }
      ],
      "scripts": {
        "test-setup": "cp .env.testing .env",
        "test": "nohup bash -c './vendor/laravel/dusk/bin/chromedriver-linux > /dev/null 2>&1 &' && nohup bash -c 'php artisan serve --no-reload > /dev/null 2>&1 &' && php artisan dusk"
      }
    }
  }
}
```

<a name="running-tests-on-travis-ci"></a>
### Travis CI

[Travis CI](https://travis-ci.org)에서 Dusk 테스트를 실행하려면 다음과 같은 `.travis.yml` 구성을 사용합니다. Travis CI는 그래픽 환경이 아니기 때문에 Chrome 브라우저를 실행하기 위해 몇 가지 추가 설정이 필요합니다. 또한 PHP 내장 웹 서버 구동에는 `php artisan serve` 명령어를 사용합니다.

```
language: php

php:
  - 7.3

addons:
  chrome: stable

install:
  - cp .env.testing .env
  - travis_retry composer install --no-interaction --prefer-dist
  - php artisan key:generate
  - php artisan dusk:chrome-driver

before_script:
  - google-chrome-stable --headless --disable-gpu --remote-debugging-port=9222 http://localhost &
  - php artisan serve --no-reload &

script:
  - php artisan dusk
```

<a name="running-tests-on-github-actions"></a>
### GitHub Actions

[Dusk 테스트를 GitHub Actions](https://github.com/features/actions)에서 실행하려면, 아래 예제 설정 파일을 참고하여 시작할 수 있습니다. Travis CI에서와 마찬가지로 `php artisan serve` 명령어로 PHP 내장 웹 서버를 실행합니다.

```
name: CI
on: [push]
jobs:

  dusk-php:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Prepare The Environment
        run: cp .env.example .env
      - name: Create Database
        run: |
          sudo systemctl start mysql
          mysql --user="root" --password="root" -e "CREATE DATABASE 'my-database' character set UTF8mb4 collate utf8mb4_bin;"
      - name: Install Composer Dependencies
        run: composer install --no-progress --prefer-dist --optimize-autoloader
      - name: Generate Application Key
        run: php artisan key:generate
      - name: Upgrade Chrome Driver
        run: php artisan dusk:chrome-driver `/opt/google/chrome/chrome --version | cut -d " " -f3 | cut -d "." -f1`
      - name: Start Chrome Driver
        run: ./vendor/laravel/dusk/bin/chromedriver-linux &
      - name: Run Laravel Server
        run: php artisan serve --no-reload &
      - name: Run Dusk Tests
        env:
          APP_URL: "http://127.0.0.1:8000"
        run: php artisan dusk
      - name: Upload Screenshots
        if: failure()
        uses: actions/upload-artifact@v2
        with:
          name: screenshots
          path: tests/Browser/screenshots
      - name: Upload Console Logs
        if: failure()
        uses: actions/upload-artifact@v2
        with:
          name: console
          path: tests/Browser/console
```