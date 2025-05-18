# 라라벨 더스크 (Laravel Dusk)

- [소개](#introduction)
- [설치](#installation)
    - [ChromeDriver 설치 관리](#managing-chromedriver-installations)
    - [다른 브라우저 사용하기](#using-other-browsers)
- [시작하기](#getting-started)
    - [테스트 생성](#generating-tests)
    - [각 테스트 후 데이터베이스 초기화](#resetting-the-database-after-each-test)
    - [테스트 실행](#running-tests)
    - [환경 파일 처리](#environment-handling)
- [브라우저 기본 사용법](#browser-basics)
    - [브라우저 생성하기](#creating-browsers)
    - [탐색](#navigation)
    - [브라우저 창 크기 조절](#resizing-browser-windows)
    - [브라우저 매크로](#browser-macros)
    - [인증](#authentication)
    - [쿠키](#cookies)
    - [JavaScript 실행](#executing-javascript)
    - [스크린샷 찍기](#taking-a-screenshot)
    - [콘솔 출력 파일로 저장하기](#storing-console-output-to-disk)
    - [페이지 소스 파일로 저장하기](#storing-page-source-to-disk)
- [엘리먼트와 상호작용](#interacting-with-elements)
    - [Dusk 셀렉터](#dusk-selectors)
    - [텍스트, 값, 속성](#text-values-and-attributes)
    - [폼과 상호작용](#interacting-with-forms)
    - [파일 첨부](#attaching-files)
    - [버튼 클릭](#pressing-buttons)
    - [링크 클릭](#clicking-links)
    - [키보드 사용](#using-the-keyboard)
    - [마우스 사용](#using-the-mouse)
    - [JavaScript 다이얼로그](#javascript-dialogs)
    - [셀렉터 범위 지정](#scoping-selectors)
    - [엘리먼트 대기](#waiting-for-elements)
    - [엘리먼트로 스크롤](#scrolling-an-element-into-view)
- [사용 가능한 어서션](#available-assertions)
- [페이지](#pages)
    - [페이지 생성](#generating-pages)
    - [페이지 설정](#configuring-pages)
    - [페이지로 이동](#navigating-to-pages)
    - [단축 셀렉터](#shorthand-selectors)
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

[Laravel Dusk](https://github.com/laravel/dusk)는 표현력이 뛰어나고 쉽게 사용할 수 있는 브라우저 자동화 및 테스트 API를 제공합니다. 기본적으로, Dusk를 사용하면 JDK나 Selenium을 로컬 컴퓨터에 설치할 필요가 없습니다. 대신, Dusk는 독립 실행형 [ChromeDriver](https://sites.google.com/chromium.org/driver)를 사용합니다. 물론, 원하신다면 Selenium과 호환되는 다른 드라이버도 자유롭게 사용할 수 있습니다.

<a name="installation"></a>
## 설치

먼저 [Google Chrome](https://www.google.com/chrome)을 설치하고, `laravel/dusk` Composer 패키지를 프로젝트에 추가해야 합니다:

```shell
composer require --dev laravel/dusk
```

> [!WARNING]
> Dusk의 서비스 프로바이더를 수동으로 등록하는 경우, **절대로** 운영(프로덕션) 환경에서는 등록하지 마십시오. 이를 등록하면 임의의 사용자가 애플리케이션에 인증 없이 접근할 수 있게 되어 보안에 큰 문제가 발생할 수 있습니다.

Dusk 패키지를 설치한 후, `dusk:install` 아티즌 명령어를 실행합니다. 이 명령어는 `tests/Browser` 디렉토리와 예시 Dusk 테스트, 그리고 현재 운영체제에 맞는 ChromeDriver 바이너리를 생성/설치해줍니다:

```shell
php artisan dusk:install
```

다음으로, 애플리케이션의 `.env` 파일에 `APP_URL` 환경 변수를 설정해야 합니다. 이 값은 브라우저에서 실제로 접속하는 애플리케이션의 URL과 일치해야 합니다.

> [!NOTE]
> 로컬 개발 환경을 [Laravel Sail](/docs/9.x/sail)로 관리하고 있다면, [Dusk 테스트 설정 및 실행](/docs/9.x/sail#laravel-dusk)에 대한 Sail 문서도 참고하십시오.

<a name="managing-chromedriver-installations"></a>
### ChromeDriver 설치 관리

Dusk의 `dusk:install` 명령어로 설치되는 ChromeDriver보다 다른 버전을 설치하고 싶다면, `dusk:chrome-driver` 명령어를 사용할 수 있습니다:

```shell
# 운영체제에 맞는 최신 ChromeDriver 설치...
php artisan dusk:chrome-driver

# 운영체제에 맞는 특정 버전의 ChromeDriver 설치...
php artisan dusk:chrome-driver 86

# 모든 지원 운영체제용 특정 버전의 ChromeDriver 설치...
php artisan dusk:chrome-driver --all

# 운영체제에서 확인된 Chrome / Chromium 버전에 맞는 ChromeDriver 설치...
php artisan dusk:chrome-driver --detect
```

> [!WARNING]
> Dusk에서 사용하는 `chromedriver` 바이너리는 실행 가능해야 합니다. Dusk 실행에 문제가 생긴다면 아래의 커맨드로 바이너리에 실행 권한이 부여되어 있는지 확인하세요: `chmod -R 0755 vendor/laravel/dusk/bin/`.

<a name="using-other-browsers"></a>
### 다른 브라우저 사용하기

기본적으로 Dusk는 Google Chrome과 독립 실행형 [ChromeDriver](https://sites.google.com/chromium.org/driver)로 브라우저 테스트를 실행합니다. 하지만, 직접 Selenium 서버를 실행한 뒤 원하는 브라우저로 테스트를 수행할 수도 있습니다.

시작하려면, 애플리케이션의 기본 Dusk 테스트 케이스 파일인 `tests/DuskTestCase.php`를 엽니다. 이 파일에서 `startChromeDriver` 메서드를 호출하는 부분을 제거하면 Dusk가 ChromeDriver를 자동으로 시작하지 않습니다:

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

그 다음, `driver` 메서드를 수정해서 원하는 URL과 포트로 연결하게 만들 수 있습니다. 추가적으로 WebDriver에 전달할 "desired capabilities"도 여기에서 설정할 수 있습니다:

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

Dusk 테스트를 생성하려면, `dusk:make` 아티즌 명령어를 사용합니다. 생성된 테스트 파일은 `tests/Browser` 디렉토리에 저장됩니다:

```shell
php artisan dusk:make LoginTest
```

<a name="resetting-the-database-after-each-test"></a>
### 각 테스트 후 데이터베이스 초기화

작성하는 대부분의 테스트는 애플리케이션의 데이터베이스에서 데이터를 조회하는 페이지와 상호작용하게 됩니다. 하지만, Dusk 테스트에서는 `RefreshDatabase` 트레잇을 사용하지 않아야 합니다. `RefreshDatabase` 트레잇은 데이터베이스 트랜잭션을 활용하지만, 이 방법은 HTTP 요청 간에 적용되지 않거나 사용할 수 없습니다. 대신, 아래 두 가지 트레잇 중 하나를 선택할 수 있습니다: `DatabaseMigrations` 트레잇과 `DatabaseTruncation` 트레잇입니다.

<a name="reset-migrations"></a>
#### 데이터베이스 마이그레이션 사용

`DatabaseMigrations` 트레잇은 각 테스트 실행 전에 데이터베이스 마이그레이션을 수행합니다. 하지만, 각 테스트마다 데이터베이스 테이블을 삭제하고 다시 생성하면 단순히 테이블만 잘라내는(truncate) 방법보다 속도가 느릴 수 있습니다:

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

> [!WARNING]
> Dusk 테스트 실행 시 SQLite의 인메모리 데이터베이스는 사용할 수 없습니다. 브라우저가 자체 프로세스에서 실행되기 때문에, 다른 프로세스의 인메모리 데이터베이스에 접근할 수 없습니다.

<a name="reset-truncation"></a>
#### 데이터베이스 트렁케이션(Truncation) 사용

`DatabaseTruncation` 트레잇을 사용하기 전에, Composer 패키지 매니저를 통해 `doctrine/dbal` 패키지를 설치해야 합니다:

```shell
composer require --dev doctrine/dbal
```

`DatabaseTruncation` 트레잇은 첫 테스트에서 데이터베이스를 마이그레이션해서, 테스트 테이블이 정상적으로 생성되었는지 확인합니다. 이후의 테스트에서는 데이터베이스 테이블을 간단히 truncate(비우기)만 하여, 모든 마이그레이션을 반복 실행하는 것보다 훨씬 빠르게 테스트를 진행할 수 있습니다:

```
<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Laravel\Dusk\Chrome;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseTruncation;
}
```

기본적으로 이 트레잇은 `migrations` 테이블을 제외한 모든 테이블을 truncate(비움) 합니다. truncate 대상 테이블을 조정하려면, 테스트 클래스에 `$tablesToTruncate` 속성을 정의하면 됩니다:

```
/**
 * Indicates which tables should be truncated.
 *
 * @var array
 */
protected $tablesToTruncate = ['users'];
```

또는, truncate에서 제외할 테이블을 지정하려면 `$exceptTables` 속성을 정의할 수 있습니다:

```
/**
 * Indicates which tables should be excluded from truncation.
 *
 * @var array
 */
protected $exceptTables = ['users'];
```

트렁케이션을 적용할 데이터베이스 연결을 지정하려면, `$connectionsToTruncate` 속성을 설정할 수 있습니다:

```
/**
 * Indicates which connections should have their tables truncated.
 *
 * @var array
 */
protected $connectionsToTruncate = ['mysql'];
```

<a name="running-tests"></a>
### 테스트 실행

브라우저 테스트를 실행하려면, `dusk` 아티즌 명령어를 사용하세요:

```shell
php artisan dusk
```

이전에 `dusk` 명령어 실행 시 테스트가 실패했다면, `dusk:fails` 명령어로 실패한 테스트만 먼저 다시 실행해서 시간을 줄일 수 있습니다:

```shell
php artisan dusk:fails
```

`dusk` 명령어에는 PHPUnit 테스트 러너가 일반적으로 지원하는 다양한 인수를 전달할 수 있습니다. 예를 들어, 특정 [그룹](https://phpunit.readthedocs.io/en/9.5/annotations.html#group)의 테스트만 실행하려면 다음과 같이 입력할 수 있습니다:

```shell
php artisan dusk --group=foo
```

> [!NOTE]
> 로컬 개발 환경을 [Laravel Sail](/docs/9.x/sail)로 관리 중이라면, [Dusk 테스트 설정 및 실행](/docs/9.x/sail#laravel-dusk)에 관한 Sail 문서를 참고하세요.

<a name="manually-starting-chromedriver"></a>
#### ChromeDriver 수동 실행

Dusk는 기본적으로 ChromeDriver를 자동으로 실행하려 시도합니다. 만약 이 방법이 시스템 환경에서 동작하지 않는다면, 직접 ChromeDriver를 실행한 후에 `dusk` 명령어를 사용하셔도 됩니다. ChromeDriver를 직접 실행할 경우, `tests/DuskTestCase.php` 파일에서 아래 줄을 주석 처리해야 합니다:

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

또한, ChromeDriver를 9515번 포트가 아닌 다른 포트에서 실행한다면, 이 파일의 `driver` 메서드도 반드시 실제 포트를 반영하도록 수정해야 합니다:

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
### 환경 파일 처리

Dusk가 테스트 실행 시 자체적으로 환경 파일을 사용하게 강제하려면, 프로젝트 루트에 `.env.dusk.{environment}` 파일을 생성하면 됩니다. 예를 들어, `local` 환경에서 `dusk` 명령어를 실행할 예정이라면 `.env.dusk.local` 파일을 만드세요.

테스트 실행 시, Dusk는 현재의 `.env` 파일을 백업한 뒤 Dusk용 환경 파일을 `.env`로 변경합니다. 테스트가 모두 끝나면 기존 `.env` 파일이 원상 복구됩니다.

<a name="browser-basics"></a>
## 브라우저 기본 사용법

<a name="creating-browsers"></a>
### 브라우저 생성하기

시작 예시로, 애플리케이션에 로그인할 수 있는지 확인하는 테스트를 작성해보겠습니다. 테스트를 생성한 뒤, 로그인 페이지로 이동해 자격증명을 입력하고 "Login" 버튼을 클릭하도록 수정할 수 있습니다. 브라우저 인스턴스는 Dusk 테스트에서 `browse` 메서드를 호출하여 생성할 수 있습니다:

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

위 예시에서 볼 수 있듯, `browse` 메서드는 클로저를 인수로 받습니다. Dusk가 이 클로저에 자동으로 브라우저 인스턴스를 전달해주며, 이 인스턴스는 애플리케이션에 상호작용하고 어서션(assertion)을 수행하는 데 주로 사용됩니다.

<a name="creating-multiple-browsers"></a>
#### 여러 브라우저 생성하기

간혹 하나의 테스트를 제대로 수행하기 위해 여러 브라우저가 필요할 수 있습니다. 예를 들어, 웹소켓을 활용한 채팅 화면을 테스트할 때 그렇습니다. 여러 브라우저를 사용하려면, `browse` 메서드에 넘기는 클로저의 인자 수를 늘리면 됩니다:

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
### 탐색

`visit` 메서드를 사용하면 애플리케이션의 지정한 URI로 이동할 수 있습니다:

```
$browser->visit('/login');
```

[named route](/docs/9.x/routing#named-routes)로 이동하려면 `visitRoute` 메서드를 사용하세요:

```
$browser->visitRoute('login');
```

`back`과 `forward` 메서드를 이용해 "뒤로" 또는 "앞으로" 이동할 수도 있습니다:

```
$browser->back();

$browser->forward();
```

페이지 새로고침은 `refresh` 메서드를 사용합니다:

```
$browser->refresh();
```

<a name="resizing-browser-windows"></a>
### 브라우저 창 크기 조절

`resize` 메서드를 사용하면 브라우저 창의 크기를 조정할 수 있습니다:

```
$browser->resize(1920, 1080);
```

`maximize` 메서드는 브라우저 창을 최대로 확장합니다:

```
$browser->maximize();
```

`fitContent` 메서드는 브라우저 창을 현재 페이지 컨텐츠 크기에 맞게 조절합니다:

```
$browser->fitContent();
```

테스트 실패 시, Dusk는 스크린샷을 찍기 전에 자동으로 브라우저 크기를 내용에 맞게 조정합니다. 이 기능을 비활성화하려면 테스트 내에서 `disableFitOnFailure` 메서드를 호출하면 됩니다:

```
$browser->disableFitOnFailure();
```

`move` 메서드를 사용해 브라우저 창의 위치를 변경할 수도 있습니다:

```
$browser->move($x = 100, $y = 100);
```

<a name="browser-macros"></a>
### 브라우저 매크로

테스트 곳곳에서 재사용할 수 있는 커스텀 브라우저 메서드를 정의하고 싶을 때는, `Browser` 클래스의 `macro` 메서드를 사용할 수 있습니다. 보통, 이 메서드는 [서비스 프로바이더](/docs/9.x/providers)의 `boot` 메서드에서 호출합니다:

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

`macro` 메서드는 첫 번째 인자로 매크로의 이름을, 두 번째 인자로 클로저를 받습니다. 이후에 `Browser` 인스턴스에서 해당 매크로를 메서드처럼 호출하면, 지정한 클로저가 실행됩니다:

```
$this->browse(function ($browser) use ($user) {
    $browser->visit('/pay')
            ->scrollToElement('#credit-card-details')
            ->assertSee('Enter Credit Card Details');
});
```

<a name="authentication"></a>
### 인증

대부분의 경우, 인증이 필요한 페이지를 테스트하게 됩니다. 매번 로그인 화면을 직접 거치지 않으려면, Dusk의 `loginAs` 메서드를 사용할 수 있습니다. 이 메서드는 인증할 모델의 기본 키 또는 모델 인스턴스를 인수로 받습니다:

```
use App\Models\User;

$this->browse(function ($browser) {
    $browser->loginAs(User::find(1))
          ->visit('/home');
});
```

> [!WARNING]
> `loginAs` 메서드를 사용하면, 해당 파일 내 모든 테스트 동안 해당 사용자의 세션이 유지됩니다.

<a name="cookies"></a>
### 쿠키

`cookie` 메서드는 암호화된 쿠키의 값을 가져오거나, 값을 설정할 수 있습니다. 라라벨에서 생성하는 모든 쿠키는 기본적으로 암호화되어 있습니다:

```
$browser->cookie('name');

$browser->cookie('name', 'Taylor');
```

`plainCookie` 메서드는 암호화되지 않은 쿠키 값을 가져오거나, 값을 설정할 때 사용합니다:

```
$browser->plainCookie('name');

$browser->plainCookie('name', 'Taylor');
```

`deleteCookie` 메서드를 이용하면, 지정한 쿠키를 삭제할 수 있습니다:

```
$browser->deleteCookie('name');
```

<a name="executing-javascript"></a>
### JavaScript 실행

`script` 메서드를 사용하면 브라우저 안에서 임의의 JavaScript를 실행할 수 있습니다:

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

`screenshot` 메서드는 현재 브라우저의 화면을 캡처하여 지정한 파일명으로 저장할 수 있습니다. 모든 스크린샷은 `tests/Browser/screenshots` 디렉토리에 저장됩니다:

```
$browser->screenshot('filename');
```

`responsiveScreenshots` 메서드를 사용하면 다양한 반응형 브레이크포인트 사이즈에서 스크린샷을 시리즈로 찍을 수 있습니다:

```
$browser->responsiveScreenshots('filename');
```

<a name="storing-console-output-to-disk"></a>
### 콘솔 출력 파일로 저장하기

`storeConsoleLog` 메서드를 이용하면, 현재 브라우저의 콘솔 출력을 지정된 파일명으로 저장할 수 있습니다. 콘솔 출력은 `tests/Browser/console` 디렉토리에 저장됩니다:

```
$browser->storeConsoleLog('filename');
```

<a name="storing-page-source-to-disk"></a>
### 페이지 소스 파일로 저장하기

`storeSource` 메서드를 사용하면, 현재 페이지의 HTML 소스를 지정한 파일명으로 저장할 수 있습니다. 저장된 페이지 소스는 `tests/Browser/source` 디렉토리에 위치합니다:

```
$browser->storeSource('filename');
```

<a name="interacting-with-elements"></a>

## 요소와 상호작용하기

<a name="dusk-selectors"></a>
### Dusk 셀렉터

Dusk 테스트를 작성할 때, 요소와 상호작용하기 위한 좋은 CSS 셀렉터를 선택하는 일은 매우 어렵습니다. 시간이 지나면서 프런트엔드 구조가 바뀌면, 아래와 같은 CSS 셀렉터가 테스트를 깨뜨릴 수 있습니다.

```
// HTML...

<button>Login</button>

// Test...

$browser->click('.login-page .container div > button');
```

Dusk 셀렉터를 사용하면 CSS 셀렉터를 기억할 필요 없이 효과적인 테스트 작성에 집중할 수 있습니다. 셀렉터를 정의하려면, HTML 요소에 `dusk` 속성을 추가하세요. 그리고 Dusk 브라우저에서 해당 요소와 상호작용할 때, 셀렉터 앞에 `@`를 붙여서 테스트 내에서 연결된 요소를 조작할 수 있습니다.

```
// HTML...

<button dusk="login-button">Login</button>

// Test...

$browser->click('@login-button');
```

<a name="text-values-and-attributes"></a>
### 텍스트, 값, 속성 다루기

<a name="retrieving-setting-values"></a>
#### 값 가져오기 및 설정하기

Dusk는 페이지 내 요소의 현재 값, 표시 텍스트, 속성(attribute)과 상호작용할 수 있는 다양한 메서드를 제공합니다. 예를 들어, 주어진 CSS 또는 Dusk 셀렉터에 일치하는 요소의 "value"를 얻으려면 `value` 메서드를 사용하세요.

```
// 값 가져오기...
$value = $browser->value('selector');

// 값 설정하기...
$browser->value('selector', 'value');
```

특정 필드 이름을 가진 input 요소의 "value" 값을 얻으려면 `inputValue` 메서드를 사용할 수 있습니다.

```
$value = $browser->inputValue('field');
```

<a name="retrieving-text"></a>
#### 텍스트 가져오기

`text` 메서드를 사용하면, 지정된 셀렉터에 일치하는 요소의 표시 텍스트를 가져올 수 있습니다.

```
$text = $browser->text('selector');
```

<a name="retrieving-attributes"></a>
#### 속성(attribute) 값 가져오기

마지막으로, `attribute` 메서드를 사용하면 지정한 셀렉터에 일치하는 요소의 속성 값을 가져올 수 있습니다.

```
$attribute = $browser->attribute('selector', 'value');
```

<a name="interacting-with-forms"></a>
### 폼과 상호작용하기

<a name="typing-values"></a>
#### 값 입력하기

Dusk는 폼과 입력 필드와 상호작용하기 위한 다양한 메서드를 제공합니다. 먼저, 입력 필드에 텍스트를 입력하는 예제를 살펴보겠습니다.

```
$browser->type('email', 'taylor@laravel.com');
```

이 메서드는 필요하면 CSS 셀렉터를 인수로 받을 수 있지만, 반드시 CSS 셀렉터를 전달할 필요는 없습니다. CSS 셀렉터를 전달하지 않으면, Dusk는 해당 `name` 속성을 가진 `input` 또는 `textarea` 필드를 자동으로 찾아 사용합니다.

필드의 기존 내용을 지우지 않고 텍스트를 덧붙이려면 `append` 메서드를 사용할 수 있습니다.

```
$browser->type('tags', 'foo')
        ->append('tags', ', bar, baz');
```

입력 필드의 값을 지우려면 `clear` 메서드를 사용하세요.

```
$browser->clear('email');
```

Dusk가 텍스트를 천천히 입력하게 하려면 `typeSlowly` 메서드를 사용할 수 있습니다. 기본적으로 Dusk는 각 키를 누를 때마다 100밀리초씩 멈춥니다. 입력 속도를 직접 지정하고 싶다면, 세 번째 인수로 밀리초 단위의 값을 전달할 수 있습니다.

```
$browser->typeSlowly('mobile', '+1 (202) 555-5555');

$browser->typeSlowly('mobile', '+1 (202) 555-5555', 300);
```

텍스트를 천천히 추가(append)하려면 `appendSlowly` 메서드를 사용할 수 있습니다.

```
$browser->type('tags', 'foo')
        ->appendSlowly('tags', ', bar, baz');
```

<a name="dropdowns"></a>
#### 드롭다운

`select` 요소에서 값을 선택하려면 `select` 메서드를 사용하세요. `type` 메서드처럼, `select` 메서드도 CSS 셀렉터 전체를 요구하지 않습니다. 이 메서드에 값을 전달할 때는 표시 텍스트가 아니라 실제 옵션 값을 전달해야 합니다.

```
$browser->select('size', 'Large');
```

두 번째 인수를 생략하면, 임의의 옵션을 선택하도록 할 수도 있습니다.

```
$browser->select('size');
```

여러 옵션을 동시에 선택하려면 두 번째 인수로 배열을 전달하세요.

```
$browser->select('categories', ['Art', 'Music']);
```

<a name="checkboxes"></a>
#### 체크박스

체크박스 입력란을 "체크"하려면 `check` 메서드를 사용합니다. 다른 입력 관련 메서드들과 마찬가지로, CSS 셀렉터 전체를 입력하지 않아도 됩니다. 만약 CSS 셀렉터가 일치하지 않는다면, Dusk가 동일한 `name` 속성을 가진 체크박스를 찾아서 사용합니다.

```
$browser->check('terms');
```

`uncheck` 메서드를 사용하면 체크박스의 체크를 해제할 수 있습니다.

```
$browser->uncheck('terms');
```

<a name="radio-buttons"></a>
#### 라디오 버튼

`radio` 입력 옵션을 "선택"하려면 `radio` 메서드를 사용하세요. 다른 입력 메서드들처럼, CSS 셀렉터 없이도 사용할 수 있습니다. CSS 셀렉터로 일치하는 것이 없다면, Dusk가 일치하는 `name`과 `value` 속성을 가진 `radio` 입력을 찾아서 사용합니다.

```
$browser->radio('size', 'large');
```

<a name="attaching-files"></a>
### 파일 첨부하기

`attach` 메서드를 사용하면 `file` 입력 요소에 파일을 첨부할 수 있습니다. 다른 입력 관련 메서드들과 마찬가지로, CSS 셀렉터 전체를 입력하지 않아도 됩니다. 일치하는 CSS 셀렉터가 없을 경우, Dusk가 동일한 `name` 속성의 파일 입력을 자동으로 찾습니다.

```
$browser->attach('photo', __DIR__.'/photos/mountains.png');
```

> [!WARNING]
> attach 기능을 사용하려면 서버에 PHP의 `Zip` 확장 모듈이 설치되어 있고 활성화되어 있어야 합니다.

<a name="pressing-buttons"></a>
### 버튼 클릭하기

`press` 메서드를 사용하면 페이지 내 버튼 요소를 클릭할 수 있습니다. 이 메서드의 인수에는 버튼의 표시 텍스트, 또는 CSS / Dusk 셀렉터를 전달할 수 있습니다.

```
$browser->press('Login');
```

폼 제출 시 많은 애플리케이션에서는, 폼 제출 버튼을 한 번 누른 후 비활성화시켰다가, HTTP 요청이 완료되면 다시 활성화하는 경우가 많습니다. 버튼을 누른 뒤 버튼이 다시 활성화될 때까지 기다리려면 `pressAndWaitFor` 메서드를 사용할 수 있습니다.

```
// 버튼을 누르고, 5초(최대) 동안 버튼이 다시 활성화될 때까지 기다립니다...
$browser->pressAndWaitFor('Save');

// 버튼을 누르고, 1초(최대) 동안 버튼이 다시 활성화될 때까지 기다립니다...
$browser->pressAndWaitFor('Save', 1);
```

<a name="clicking-links"></a>
### 링크 클릭하기

링크를 클릭하려면 브라우저 인스턴스에서 `clickLink` 메서드를 사용할 수 있습니다. `clickLink` 메서드는 지정한 표시 텍스트와 일치하는 링크를 클릭합니다.

```
$browser->clickLink($linkText);
```

페이지에 주어진 표시 텍스트의 링크가 보이는지 확인하려면 `seeLink` 메서드를 사용할 수 있습니다.

```
if ($browser->seeLink($linkText)) {
    // ...
}
```

> [!WARNING]
> 이 메서드들은 jQuery와 상호작용합니다. 페이지에 jQuery가 없다면, Dusk가 테스트 중에 사용할 수 있도록 자동으로 jQuery를 삽입합니다.

<a name="using-the-keyboard"></a>
### 키보드 사용하기

`keys` 메서드를 사용하면, `type` 메서드보다 더 복잡한 입력 시나리오를 처리할 수 있습니다. 예를 들어, 값을 입력할 때 수정자(modifier) 키를 누른 상태에서 입력하도록 할 수 있습니다. 아래 예시에서는 `shift` 키를 누른 채로 `taylor`를 입력하고, 이후 수정자 키 없이 `swift`를 입력합니다.

```
$browser->keys('selector', ['{shift}', 'taylor'], 'swift');
```

또 다른 활용 사례로, 애플리케이션 주요 CSS 셀렉터에 "키보드 단축키" 조합을 전달하는 데 사용할 수도 있습니다.

```
$browser->keys('.app', ['{command}', 'j']);
```

> [!NOTE]
> `{command}`와 같은 모든 수정자 키는 `{}`로 감싸서 표기하며, [`Facebook\WebDriver\WebDriverKeys`](https://github.com/php-webdriver/php-webdriver/blob/master/lib/WebDriverKeys.php) 클래스에 정의된 상수들과 동일하게 동작합니다.

<a name="using-the-mouse"></a>
### 마우스 사용하기

<a name="clicking-on-elements"></a>
#### 요소 클릭하기

`click` 메서드는 지정한 CSS 또는 Dusk 셀렉터와 일치하는 요소를 클릭할 때 사용합니다.

```
$browser->click('.selector');
```

`clickAtXPath` 메서드는 지정한 XPath 표현식에 일치하는 요소를 클릭할 수 있습니다.

```
$browser->clickAtXPath('//div[@class = "selector"]');
```

`clickAtPoint` 메서드를 사용하면 브라우저 화면에서 지정한 좌표 위치에 있는 최상위 요소를 클릭할 수 있습니다.

```
$browser->clickAtPoint($x = 0, $y = 0);
```

`doubleClick` 메서드를 사용하면 마우스의 더블 클릭을 시뮬레이션할 수 있습니다.

```
$browser->doubleClick();
```

`rightClick` 메서드는 마우스의 오른쪽 클릭을 시뮬레이션합니다.

```
$browser->rightClick();

$browser->rightClick('.selector');
```

`clickAndHold` 메서드는 마우스 버튼을 누르고 있는 상태를 시뮬레이션합니다. 이후 `releaseMouse` 메서드를 호출하여 마우스 버튼을 놓을 수 있습니다.

```
$browser->clickAndHold()
        ->pause(1000)
        ->releaseMouse();
```

<a name="mouseover"></a>
#### 마우스오버

`mouseover` 메서드는 지정한 CSS 또는 Dusk 셀렉터와 일치하는 요소 위로 마우스를 이동할 필요가 있을 때 사용할 수 있습니다.

```
$browser->mouseover('.selector');
```

<a name="drag-drop"></a>
#### 드래그 앤 드롭

`drag` 메서드는 셀렉터에 일치하는 요소를 다른 요소로 드래그할 때 사용할 수 있습니다.

```
$browser->drag('.from-selector', '.to-selector');
```

또는, 한 방향으로만 요소를 끌 수도 있습니다.

```
$browser->dragLeft('.selector', $pixels = 10);
$browser->dragRight('.selector', $pixels = 10);
$browser->dragUp('.selector', $pixels = 10);
$browser->dragDown('.selector', $pixels = 10);
```

마지막으로, 지정한 오프셋(거리)만큼 요소를 이동시키는 것도 가능합니다.

```
$browser->dragOffset('.selector', $x = 10, $y = 10);
```

<a name="javascript-dialogs"></a>
### 자바스크립트 다이얼로그

Dusk는 자바스크립트 다이얼로그와 상호작용할 수 있는 다양한 메서드를 제공합니다. 예를 들어, `waitForDialog` 메서드를 사용하면 자바스크립트 다이얼로그가 나타날 때까지 기다릴 수 있습니다. 이 메서드는 다이얼로그가 표시될 때까지 기다릴 최대 초 단위를 선택적으로 지정할 수 있습니다.

```
$browser->waitForDialog($seconds = null);
```

`assertDialogOpened` 메서드는 다이얼로그가 열렸고, 그 안에 특정 메시지가 포함되어 있는지 확인할 때 사용할 수 있습니다.

```
$browser->assertDialogOpened('Dialog message');
```

자바스크립트 다이얼로그에 프롬프트 입력란이 있을 경우, `typeInDialog` 메서드를 사용해 값을 입력할 수 있습니다.

```
$browser->typeInDialog('Hello World');
```

열려 있는 자바스크립트 다이얼로그에서 "확인(OK)" 버튼을 클릭해 닫으려면 `acceptDialog` 메서드를 호출하세요.

```
$browser->acceptDialog();
```

"취소(Cancel)" 버튼을 클릭해 다이얼로그를 닫으려면 `dismissDialog` 메서드를 호출합니다.

```
$browser->dismissDialog();
```

<a name="scoping-selectors"></a>
### 셀렉터 범위 지정

여러 작업을 단일 셀렉터 내부에 한정(스코핑)해서 수행하고 싶을 때가 있습니다. 예를 들어, 특정 테이블 내에만 존재하는 텍스트가 있는지 확인하고, 이어서 그 테이블 안에 있는 버튼을 클릭하고 싶을 수 있습니다. 이런 경우 `with` 메서드를 사용하세요. `with` 메서드에 전달하는 클로저 내의 모든 동작은 원래 지정한 셀렉터 범위 내에서만 작동합니다.

```
$browser->with('.table', function ($table) {
    $table->assertSee('Hello World')
          ->clickLink('Delete');
});
```

가끔은 현재 범위 밖에서 assert(확인) 작업을 수행해야 할 때가 있습니다. 이럴 때는 `elsewhere` 및 `elsewhereWhenAvailable` 메서드를 사용할 수 있습니다.

```
 $browser->with('.table', function ($table) {
    // 현재 범위는 `body .table`...

    $browser->elsewhere('.page-title', function ($title) {
        // 현재 범위는 `body .page-title`...
        $title->assertSee('Hello World');
    });

    $browser->elsewhereWhenAvailable('.page-title', function ($title) {
        // 현재 범위는 `body .page-title`...
        $title->assertSee('Hello World');
    });
 });
```

<a name="waiting-for-elements"></a>
### 요소가 나타날 때까지 기다리기

자바스크립트를 많이 사용하는 애플리케이션을 테스트하다 보면, 테스트를 진행하기 전에 특정 요소나 데이터가 페이지에 표시될 때까지 "기다려야" 하는 경우가 많습니다. Dusk에서는 이를 아주 쉽게 처리할 수 있습니다. 다양한 메서드를 사용해서, 페이지에 요소가 나타날 때까지 기다리거나, 특정 자바스크립트 표현식이 `true`가 될 때까지 대기할 수 있습니다.

<a name="waiting"></a>
#### 대기(pause)하기

테스트를 일정 시간(밀리초)만큼 잠시 멈추고 싶다면 `pause` 메서드를 사용하세요.

```
$browser->pause(1000);
```

특정 조건이 `true`일 때에만 테스트를 잠시 멈추고 싶다면 `pauseIf` 메서드를 사용합니다.

```
$browser->pauseIf(App::environment('production'), 1000);
```

마찬가지로, 특정 조건이 `true`가 아닐 때 멈추고 싶다면 `pauseUnless` 메서드를 사용할 수 있습니다.

```
$browser->pauseUnless(App::environment('testing'), 1000);
```

<a name="waiting-for-selectors"></a>
#### 셀렉터가 나타날 때까지 기다리기

`waitFor` 메서드는, 지정한 CSS 또는 Dusk 셀렉터와 일치하는 요소가 화면에 표시될 때까지 테스트 실행을 일시정지합니다. 기본적으로, 최대 5초 동안 대기하다가 조건이 만족되지 않으면 예외를 발생시킵니다. 필요하다면 두 번째 인수로 타임아웃(초 단위)를 지정할 수 있습니다.

```
// 셀렉터가 나타날 때까지 최대 5초 대기...
$browser->waitFor('.selector');

// 셀렉터가 나타날 때까지 최대 1초 대기...
$browser->waitFor('.selector', 1);
```

또한, 지정한 셀렉터가 지정된 텍스트를 포함할 때까지 기다릴 수도 있습니다.

```
// 주어진 텍스트가 포함될 때까지 최대 5초 대기...
$browser->waitForTextIn('.selector', 'Hello World');

// 최대 1초 대기...
$browser->waitForTextIn('.selector', 'Hello World', 1);
```

또는 지정한 셀렉터가 페이지에서 사라질 때까지도 대기할 수 있습니다.

```
// 셀렉터가 없어질 때까지 최대 5초 대기...
$browser->waitUntilMissing('.selector');

// 최대 1초 대기...
$browser->waitUntilMissing('.selector', 1);
```

셀렉터가 활성화(Enabled) 또는 비활성화(Disabled)될 때까지 기다릴 수도 있습니다.

```
// 셀렉터가 활성화될 때까지 최대 5초 대기...
$browser->waitUntilEnabled('.selector');

// 최대 1초 대기...
$browser->waitUntilEnabled('.selector', 1);

// 셀렉터가 비활성화될 때까지 최대 5초 대기...
$browser->waitUntilDisabled('.selector');

// 최대 1초 대기...
$browser->waitUntilDisabled('.selector', 1);
```

<a name="scoping-selectors-when-available"></a>
#### 셀렉터가 가능해질 때 범위 지정

가끔은 특정 셀렉터에 일치하는 요소가 페이지에 나타날 때까지 기다린 후, 그 요소와 상호작용해야 할 때가 있습니다. 예를 들어, 모달 창이 표시될 때까지 기다렸다가 해당 모달에서 "OK" 버튼을 눌러야 할 수 있습니다. 이런 경우에는 `whenAvailable` 메서드를 사용하세요. 클로저 내에서 수행되는 모든 동작은 원래 셀렉터 범위 내에서 한정됩니다.

```
$browser->whenAvailable('.modal', function ($modal) {
    $modal->assertSee('Hello World')
          ->press('OK');
});
```

<a name="waiting-for-text"></a>
#### 텍스트가 나타날 때까지 기다리기

`waitForText` 메서드는 지정된 텍스트가 페이지에 표시될 때까지 기다리기 위해 사용할 수 있습니다.

```
// 텍스트가 나타날 때까지 최대 5초 대기...
$browser->waitForText('Hello World');

// 최대 1초 대기...
$browser->waitForText('Hello World', 1);
```

`waitUntilMissingText` 메서드를 사용하면, 표시된 텍스트가 페이지에서 사라질 때까지 대기할 수 있습니다.

```
// 텍스트가 사라질 때까지 최대 5초 대기...
$browser->waitUntilMissingText('Hello World');

// 최대 1초 대기...
$browser->waitUntilMissingText('Hello World', 1);
```

<a name="waiting-for-links"></a>
#### 링크가 나타날 때까지 기다리기

`waitForLink` 메서드는 지정한 링크 텍스트가 페이지에 표시될 때까지 기다릴 수 있습니다.

```
// 링크가 표시될 때까지 최대 5초 대기...
$browser->waitForLink('Create');

// 최대 1초 대기...
$browser->waitForLink('Create', 1);
```

<a name="waiting-for-inputs"></a>
#### 입력 필드가 나타날 때까지 기다리기

`waitForInput` 메서드는 지정한 입력 필드가 페이지에 표시될 때까지 기다립니다.

```
// 입력 필드가 나타날 때까지 최대 5초 대기...
$browser->waitForInput($field);

// 최대 1초 대기...
$browser->waitForInput($field, 1);
```

<a name="waiting-on-the-page-location"></a>
#### 페이지 위치가 바뀔 때까지 기다리기

`$browser->assertPathIs('/home')`와 같이 경로를 확인(assert)하는 경우, `window.location.pathname`이 비동기적으로 업데이트되고 있어 실패할 수 있습니다. 이럴 때는 `waitForLocation` 메서드로 특정 위치가 될 때까지 대기할 수 있습니다.

```
$browser->waitForLocation('/secret');
```

`waitForLocation` 메서드는 현재 브라우저 창의 위치가 완전한 URL이 되기를 대기할 때도 사용할 수 있습니다.

```
$browser->waitForLocation('https://example.com/path');
```

[네임드 라우트](/docs/9.x/routing#named-routes)의 위치가 될 때까지 기다릴 수도 있습니다.

```
$browser->waitForRoute($routeName, $parameters);
```

<a name="waiting-for-page-reloads"></a>
#### 페이지가 새로고침될 때까지 기다리기

어떤 동작 후 페이지가 새로고침되기를 기다려야 하는 경우, `waitForReload` 메서드를 사용하세요.

```
use Laravel\Dusk\Browser;

$browser->waitForReload(function (Browser $browser) {
    $browser->press('Submit');
})
->assertSee('Success!');
```

보통 페이지 새로고침 대기는 버튼 클릭 후 일어나는 일이기 때문에, 편리하게 사용할 수 있는 `clickAndWaitForReload` 메서드도 있습니다.

```
$browser->clickAndWaitForReload('.selector')
        ->assertSee('something');
```

<a name="waiting-on-javascript-expressions"></a>
#### 자바스크립트 표현식이 동작할 때까지 기다리기

종종 특정 자바스크립트 표현식이 `true`가 될 때까지 테스트 실행을 일시 중지해야 할 수 있습니다. 이럴 때는 `waitUntil` 메서드를 사용하세요. 이 메서드에 전달하는 표현식에는 `return` 키워드나 세미콜론(;)을 붙일 필요가 없습니다.

```
// 조건식이 true가 될 때까지 최대 5초 대기...
$browser->waitUntil('App.data.servers.length > 0');

// 최대 1초 대기...
$browser->waitUntil('App.data.servers.length > 0', 1);
```

<a name="waiting-on-vue-expressions"></a>
#### Vue 표현식이 달라질 때까지 기다리기

`waitUntilVue` 및 `waitUntilVueIsNot` 메서드를 사용하면, [Vue 컴포넌트](https://vuejs.org)의 속성이 특정 값이 될 때까지 대기할 수 있습니다.

```
// 컴포넌트 속성이 지정한 값을 포함할 때까지 대기...
$browser->waitUntilVue('user.name', 'Taylor', '@user');

// 컴포넌트 속성이 지정한 값이 아닐 때까지 대기...
$browser->waitUntilVueIsNot('user.name', null, '@user');
```

<a name="waiting-for-javascript-events"></a>

#### 자바스크립트 이벤트 대기

`waitForEvent` 메서드를 사용하면 특정 자바스크립트 이벤트가 발생할 때까지 테스트 실행을 일시정지할 수 있습니다.

```
$browser->waitForEvent('load');
```

이벤트 리스너는 현재 스코프에 연결되며, 기본적으로 `body` 요소가 현재 스코프가 됩니다. 스코프 선택자를 사용할 경우, 해당 선택자에 매칭되는 요소에 이벤트 리스너가 등록됩니다.

```
$browser->with('iframe', function ($iframe) {
    // iframe의 load 이벤트가 발생할 때까지 대기...
    $iframe->waitForEvent('load');
});
```

또한, `waitForEvent` 메서드의 두 번째 인자로 선택자를 전달해 특정 요소에 이벤트 리스너를 연결할 수 있습니다.

```
$browser->waitForEvent('load', '.selector');
```

`document`와 `window` 객체에 대해서도 이벤트 대기가 가능합니다.

```
// document가 스크롤될 때까지 대기...
$browser->waitForEvent('scroll', 'document');

// window의 크기 조정이 최대 5초 동안 발생할 때까지 대기...
$browser->waitForEvent('resize', 'window', 5);
```

<a name="waiting-with-a-callback"></a>
#### 콜백을 통한 대기

Dusk의 많은 "대기" 메서드는 내부적으로 `waitUsing` 메서드를 활용합니다. 이 메서드를 직접 사용해, 지정한 클로저가 `true`를 반환할 때까지 대기할 수 있습니다. `waitUsing` 메서드는 대기할 최대 시간(초), 클로저를 평가할 간격, 실제 클로저, 옵션으로 실패 메시지를 인자로 받습니다.

```
$browser->waitUsing(10, 1, function () use ($something) {
    return $something->isReady();
}, "Something wasn't ready in time.");
```

<a name="scrolling-an-element-into-view"></a>
### 요소를 화면에 보이게 스크롤하기

경우에 따라 요소가 브라우저 화면 바깥에 위치해 있어서 클릭할 수 없는 상황이 발생할 수 있습니다. 이럴 때는 `scrollIntoView` 메서드를 사용하면 해당 선택자에 해당하는 요소가 브라우저에 보일 때까지 자동으로 스크롤합니다.

```
$browser->scrollIntoView('.selector')
        ->click('.selector');
```

<a name="available-assertions"></a>
## 사용 가능한 assertion 목록

Dusk는 애플리케이션을 대상으로 수행할 수 있는 다양한 assertion(확인) 기능을 제공합니다. 사용 가능한 assertion 메서드는 아래 리스트에 정리돼 있습니다.



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
[assertIndeterminate](#assert-indeterminate)
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

페이지의 제목이 지정한 텍스트와 일치하는지 확인합니다.

```
$browser->assertTitle($title);
```

<a name="assert-title-contains"></a>
#### assertTitleContains

페이지의 제목에 지정한 텍스트가 포함되어 있는지 확인합니다.

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

현재 URL의 scheme(프로토콜)이 지정한 값과 일치하는지 확인합니다.

```
$browser->assertSchemeIs($scheme);
```

<a name="assert-scheme-is-not"></a>
#### assertSchemeIsNot

현재 URL의 scheme(프로토콜)이 지정한 값과 일치하지 않는지 확인합니다.

```
$browser->assertSchemeIsNot($scheme);
```

<a name="assert-host-is"></a>
#### assertHostIs

현재 URL의 호스트가 지정한 값과 일치하는지 확인합니다.

```
$browser->assertHostIs($host);
```

<a name="assert-host-is-not"></a>
#### assertHostIsNot

현재 URL의 호스트가 지정한 값과 일치하지 않는지 확인합니다.

```
$browser->assertHostIsNot($host);
```

<a name="assert-port-is"></a>
#### assertPortIs

현재 URL의 포트가 지정한 값과 일치하는지 확인합니다.

```
$browser->assertPortIs($port);
```

<a name="assert-port-is-not"></a>
#### assertPortIsNot

현재 URL의 포트가 지정한 값과 일치하지 않는지 확인합니다.

```
$browser->assertPortIsNot($port);
```

<a name="assert-path-begins-with"></a>
#### assertPathBeginsWith

현재 URL의 경로가 지정한 경로로 시작하는지 확인합니다.

```
$browser->assertPathBeginsWith('/home');
```

<a name="assert-path-is"></a>
#### assertPathIs

현재 경로가 지정한 경로와 일치하는지 확인합니다.

```
$browser->assertPathIs('/home');
```

<a name="assert-path-is-not"></a>
#### assertPathIsNot

현재 경로가 지정한 경로와 일치하지 않는지 확인합니다.

```
$browser->assertPathIsNot('/home');
```

<a name="assert-route-is"></a>
#### assertRouteIs

현재 URL이 지정한 [네임드 라우트](/docs/9.x/routing#named-routes)의 URL과 일치하는지 확인합니다.

```
$browser->assertRouteIs($name, $parameters);
```

<a name="assert-query-string-has"></a>
#### assertQueryStringHas

지정한 쿼리 문자열 파라미터가 존재하는지 확인합니다.

```
$browser->assertQueryStringHas($name);
```

지정한 쿼리 문자열 파라미터가 특정 값으로 존재하는지 확인합니다.

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

URL의 현재 해시(fragment)가 지정한 값과 일치하는지 확인합니다.

```
$browser->assertFragmentIs('anchor');
```

<a name="assert-fragment-begins-with"></a>
#### assertFragmentBeginsWith

URL의 현재 해시(fragment)가 지정한 값으로 시작하는지 확인합니다.

```
$browser->assertFragmentBeginsWith('anchor');
```

<a name="assert-fragment-is-not"></a>
#### assertFragmentIsNot

URL의 현재 해시(fragment)가 지정한 값과 일치하지 않는지 확인합니다.

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

지정한 암호화되지 않은 쿠키가 존재하는지 확인합니다.

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

지정한 암호화되지 않은 쿠키가 존재하지 않는지 확인합니다.

```
$browser->assertPlainCookieMissing($name);
```

<a name="assert-cookie-value"></a>
#### assertCookieValue

암호화된 쿠키에 지정한 값이 들어있는지 확인합니다.

```
$browser->assertCookieValue($name, $value);
```

<a name="assert-plain-cookie-value"></a>
#### assertPlainCookieValue

암호화되지 않은 쿠키에 지정한 값이 들어있는지 확인합니다.

```
$browser->assertPlainCookieValue($name, $value);
```

<a name="assert-see"></a>
#### assertSee

페이지에 지정한 텍스트가 표시되어 있는지 확인합니다.

```
$browser->assertSee($text);
```

<a name="assert-dont-see"></a>
#### assertDontSee

페이지에 지정한 텍스트가 표시되지 않는지 확인합니다.

```
$browser->assertDontSee($text);
```

<a name="assert-see-in"></a>
#### assertSeeIn

특정 선택자 안에 지정한 텍스트가 있는지 확인합니다.

```
$browser->assertSeeIn($selector, $text);
```

<a name="assert-dont-see-in"></a>
#### assertDontSeeIn

특정 선택자 안에 지정한 텍스트가 존재하지 않는지 확인합니다.

```
$browser->assertDontSeeIn($selector, $text);
```

<a name="assert-see-anything-in"></a>
#### assertSeeAnythingIn

특정 선택자 안에 아무 텍스트라도 존재하는지 확인합니다.

```
$browser->assertSeeAnythingIn($selector);
```

<a name="assert-see-nothing-in"></a>
#### assertSeeNothingIn

특정 선택자 안에 어떤 텍스트도 존재하지 않는지 확인합니다.

```
$browser->assertSeeNothingIn($selector);
```

<a name="assert-script"></a>
#### assertScript

지정한 자바스크립트 식이 특정 값으로 평가되는지 확인합니다.

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

페이지에 지정한 링크가 존재하는지 확인합니다.

```
$browser->assertSeeLink($linkText);
```

<a name="assert-dont-see-link"></a>
#### assertDontSeeLink

페이지에 지정한 링크가 존재하지 않는지 확인합니다.

```
$browser->assertDontSeeLink($linkText);
```

<a name="assert-input-value"></a>
#### assertInputValue

지정한 input 필드의 값이 기대한 값과 일치하는지 확인합니다.

```
$browser->assertInputValue($field, $value);
```

<a name="assert-input-value-is-not"></a>
#### assertInputValueIsNot

지정한 input 필드의 값이 기대한 값과 다름을 확인합니다.

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

<a name="assert-indeterminate"></a>
#### assertIndeterminate

지정한 체크박스가 불확정(indeterminate) 상태인지 확인합니다.

```
$browser->assertIndeterminate($field);
```

<a name="assert-radio-selected"></a>
#### assertRadioSelected

지정한 라디오 필드에서 특정 값이 선택되어 있는지 확인합니다.

```
$browser->assertRadioSelected($field, $value);
```

<a name="assert-radio-not-selected"></a>
#### assertRadioNotSelected

지정한 라디오 필드에서 특정 값이 선택되어 있지 않은지 확인합니다.

```
$browser->assertRadioNotSelected($field, $value);
```

<a name="assert-selected"></a>
#### assertSelected

지정한 드롭다운에서 특정 값이 선택된 상태인지 확인합니다.

```
$browser->assertSelected($field, $value);
```

<a name="assert-not-selected"></a>
#### assertNotSelected

지정한 드롭다운에서 특정 값이 선택되지 않은 상태인지 확인합니다.

```
$browser->assertNotSelected($field, $value);
```

<a name="assert-select-has-options"></a>
#### assertSelectHasOptions

지정한 값 배열이 드롭다운에서 선택 가능 옵션으로 존재하는지 확인합니다.

```
$browser->assertSelectHasOptions($field, $values);
```

<a name="assert-select-missing-options"></a>
#### assertSelectMissingOptions

지정한 값 배열이 드롭다운에서 선택 가능 옵션으로 존재하지 않는지 확인합니다.

```
$browser->assertSelectMissingOptions($field, $values);
```

<a name="assert-select-has-option"></a>

#### assertSelectHasOption

지정한 필드에서 선택 가능한 값에 주어진 값이 포함되어 있는지 확인합니다.

```
$browser->assertSelectHasOption($field, $value);
```

<a name="assert-select-missing-option"></a>
#### assertSelectMissingOption

지정한 값이 선택 항목에 없는지 확인합니다.

```
$browser->assertSelectMissingOption($field, $value);
```

<a name="assert-value"></a>
#### assertValue

지정한 셀렉터에 해당하는 요소의 값이 주어진 값과 일치하는지 확인합니다.

```
$browser->assertValue($selector, $value);
```

<a name="assert-value-is-not"></a>
#### assertValueIsNot

지정한 셀렉터에 해당하는 요소의 값이 주어진 값과 일치하지 않는지 확인합니다.

```
$browser->assertValueIsNot($selector, $value);
```

<a name="assert-attribute"></a>
#### assertAttribute

지정한 셀렉터에 해당하는 요소의 지정한 속성(attribute)에 주어진 값이 들어 있는지 확인합니다.

```
$browser->assertAttribute($selector, $attribute, $value);
```

<a name="assert-attribute-contains"></a>
#### assertAttributeContains

지정한 셀렉터에 해당하는 요소의 지정한 속성(attribute)이 주어진 값을 포함하고 있는지 확인합니다.

```
$browser->assertAttributeContains($selector, $attribute, $value);
```

<a name="assert-aria-attribute"></a>
#### assertAriaAttribute

지정한 셀렉터에 해당하는 요소의 지정한 aria 속성(attribute)에 주어진 값이 들어 있는지 확인합니다.

```
$browser->assertAriaAttribute($selector, $attribute, $value);
```

예를 들어, `<button aria-label="Add"></button>`라는 마크업이 있을 때, 아래와 같이 `aria-label` 속성에 대해 검증할 수 있습니다.

```
$browser->assertAriaAttribute('button', 'label', 'Add')
```

<a name="assert-data-attribute"></a>
#### assertDataAttribute

지정한 셀렉터에 해당하는 요소의 지정한 data 속성(attribute)에 주어진 값이 들어 있는지 확인합니다.

```
$browser->assertDataAttribute($selector, $attribute, $value);
```

예를 들어, `<tr id="row-1" data-content="attendees"></tr>`라는 마크업이 있을 때 `data-label` 속성에 대해 다음과 같이 검증할 수 있습니다.

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

주어진 name 속성을 가진 input 요소가 존재하는지 확인합니다.

```
$browser->assertInputPresent($name);
```

<a name="assert-input-missing"></a>
#### assertInputMissing

주어진 name 속성을 가진 input 요소가 소스에 존재하지 않는지 확인합니다.

```
$browser->assertInputMissing($name);
```

<a name="assert-dialog-opened"></a>
#### assertDialogOpened

주어진 메시지를 가진 JavaScript 대화상자가 열렸는지 확인합니다.

```
$browser->assertDialogOpened($message);
```

<a name="assert-enabled"></a>
#### assertEnabled

지정한 필드가 활성화(Enabled) 상태인지 확인합니다.

```
$browser->assertEnabled($field);
```

<a name="assert-disabled"></a>
#### assertDisabled

지정한 필드가 비활성(Disabled) 상태인지 확인합니다.

```
$browser->assertDisabled($field);
```

<a name="assert-button-enabled"></a>
#### assertButtonEnabled

주어진 버튼이 활성화(Enabled) 상태인지 확인합니다.

```
$browser->assertButtonEnabled($button);
```

<a name="assert-button-disabled"></a>
#### assertButtonDisabled

주어진 버튼이 비활성(Disabled) 상태인지 확인합니다.

```
$browser->assertButtonDisabled($button);
```

<a name="assert-focused"></a>
#### assertFocused

주어진 필드가 포커스된 상태인지 확인합니다.

```
$browser->assertFocused($field);
```

<a name="assert-not-focused"></a>
#### assertNotFocused

주어진 필드가 포커스되어 있지 않은지 확인합니다.

```
$browser->assertNotFocused($field);
```

<a name="assert-authenticated"></a>
#### assertAuthenticated

사용자가 인증된 상태인지 확인합니다.

```
$browser->assertAuthenticated();
```

<a name="assert-guest"></a>
#### assertGuest

사용자가 인증되지 않은(비로그인) 상태인지 확인합니다.

```
$browser->assertGuest();
```

<a name="assert-authenticated-as"></a>
#### assertAuthenticatedAs

사용자가 주어진 사용자로 인증되어 있는지 확인합니다.

```
$browser->assertAuthenticatedAs($user);
```

<a name="assert-vue"></a>
#### assertVue

Dusk는 [Vue 컴포넌트](https://vuejs.org) 데이터의 상태에 대해서도 검증(assertion)할 수 있습니다. 예를 들어, 애플리케이션에 다음과 같은 Vue 컴포넌트가 있다고 가정해 보겠습니다.

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

아래와 같이 Vue 컴포넌트의 상태에 대해 검증할 수 있습니다.

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

주어진 Vue 컴포넌트의 데이터 속성(property)이 지정한 값과 일치하지 않는지 확인합니다.

```
$browser->assertVueIsNot($property, $value, $componentSelector = null);
```

<a name="assert-vue-contains"></a>
#### assertVueContains

주어진 Vue 컴포넌트의 데이터 속성(property)이 배열이며, 그 배열이 지정한 값을 포함하는지 확인합니다.

```
$browser->assertVueContains($property, $value, $componentSelector = null);
```

<a name="assert-vue-does-not-contain"></a>
#### assertVueDoesNotContain

주어진 Vue 컴포넌트의 데이터 속성(property)이 배열이며, 그 배열이 지정한 값을 포함하지 않는지 확인합니다.

```
$browser->assertVueDoesNotContain($property, $value, $componentSelector = null);
```

<a name="pages"></a>
## 페이지(Pages)

테스트를 작성하다보면 여러 복잡한 동작을 순서대로 수행해야 할 때가 있습니다. 이런 경우 테스트의 가독성과 관리가 어려워질 수 있습니다. Dusk의 Page 기능을 활용하면 개별 페이지에 대해 표현력 있는 여러 동작을 하나의 메서드로 간단히 정의하여 실행할 수 있습니다. 또한 페이지별, 혹은 애플리케이션 전체에서 자주 사용되는 셀렉터에 대한 단축키(쇼트컷)도 정의할 수 있습니다.

<a name="generating-pages"></a>
### 페이지 생성하기

페이지 객체를 생성하려면 `dusk:page` 아티즌 명령어를 실행합니다. 생성된 페이지 객체는 애플리케이션의 `tests/Browser/Pages` 디렉터리에 위치합니다.

```
php artisan dusk:page Login
```

<a name="configuring-pages"></a>
### 페이지 설정하기

기본적으로, 페이지에는 `url`, `assert`, `elements`라는 세 가지 메서드가 존재합니다. 여기서 `url`, `assert` 메서드에 대해 먼저 설명합니다. `elements` 메서드에 대해서는 [아래에서 더 자세히 다룹니다](#shorthand-selectors).

<a name="the-url-method"></a>
#### `url` 메서드

`url` 메서드는 해당 페이지를 나타내는 URL 경로를 반환해야 합니다. Dusk는 이 URL을 이용해서 브라우저를 해당 페이지로 이동시킵니다.

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

`assert` 메서드는 브라우저가 실제로 해당 페이지에 있는지 검증(assertion)하는 로직을 포함할 수 있습니다. 이 메서드에 내용을 반드시 구현할 필요는 없으나, 필요하다면 자유롭게 다양한 검증을 추가할 수 있습니다. 해당 검증들은 페이지로 이동할 때 자동으로 실행됩니다.

```
/**
 * 브라우저가 정확히 이 페이지에 있는지 검증합니다.
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

페이지를 정의한 후에는 `visit` 메서드를 통해 해당 페이지로 이동할 수 있습니다.

```
use Tests\Browser\Pages\Login;

$browser->visit(new Login);
```

어떤 경우에는 이미 특정 페이지에 접속해 있고, 해당 페이지 객체에 정의된 셀렉터 및 메서드를 현재 테스트 컨텍스트에 “적용”만 하고 싶을 수 있습니다. 예를 들어 버튼 클릭 후 리다이렉트로 이동하는 경우가 대표적입니다. 이런 상황에서는 `on` 메서드를 이용합니다.

```
use Tests\Browser\Pages\CreatePlaylist;

$browser->visit('/dashboard')
        ->clickLink('Create Playlist')
        ->on(new CreatePlaylist)
        ->assertSee('@create');
```

<a name="shorthand-selectors"></a>
### 셀렉터 단축키(Shorthand selectors)

페이지 클래스의 `elements` 메서드를 통해, 페이지에서 자주 사용하는 CSS 셀렉터에 대해 쉽고 기억하기 좋은 단축키를 정의할 수 있습니다. 예를 들어, 애플리케이션 로그인 페이지의 "email" 입력 필드에 대해 다음과 같이 단축키를 정의할 수 있습니다.

```
/**
 * 이 페이지에서 사용할 셀렉터 단축키(쇼트컷) 목록을 반환합니다.
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

이렇게 단축키를 정의하면 기존의 CSS 셀렉터 대신 이 단축키를 언제든 사용할 수 있습니다.

```
$browser->type('@email', 'taylor@laravel.com');
```

<a name="global-shorthand-selectors"></a>
#### 글로벌 셀렉터 단축키(Global Shorthand Selectors)

Dusk를 설치하면 기본 `Page` 클래스가 `tests/Browser/Pages` 디렉터리에 생성됩니다. 이 클래스에는 글로벌 단축키를 위한 `siteElements` 메서드가 포함되어 있는데, 애플리케이션 전체에서 모든 페이지가 공유할 수 있는 단축 셀렉터를 정의할 수 있습니다.

```
/**
 * 사이트 전체에서 사용할 글로벌 단축 셀렉터를 반환합니다.
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

페이지에 기본적으로 제공되는 메서드 외에, 테스트에서 재사용할 수 있는 추가적인 메서드를 별도로 정의할 수 있습니다. 예를 들어, 음악 관리 애플리케이션을 개발한다면, 플레이리스트를 만드는 동작이 한 페이지에서 반복해서 사용될 수 있습니다. 이럴 경우, 각각의 테스트에 로직을 반복해서 작성하는 대신 해당 페이지 클래스에 `createPlaylist`와 같은 전용 메서드를 정의해 둘 수 있습니다.

```
<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;

class Dashboard extends Page
{
    // 기타 페이지 메서드...

    /**
     * 새 플레이리스트를 생성합니다.
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

이렇게 정의한 메서드는 해당 페이지를 사용하는 모든 테스트에서 간편하게 호출할 수 있습니다. 커스텀 페이지 메서드를 사용할 때는 브라우저 인스턴스가 첫 번째 인자로 자동 전달됩니다.

```
use Tests\Browser\Pages\Dashboard;

$browser->visit(new Dashboard)
        ->createPlaylist('My Playlist')
        ->assertSee('My Playlist');
```

<a name="components"></a>
## 컴포넌트(Components)

컴포넌트는 Dusk의 "페이지 객체(page objects)"와 비슷하지만, 내비게이션 바, 알림 창 등 애플리케이션 곳곳에서 반복적으로 사용되는 UI 요소나 기능 단위에 중점을 둔 점이 다릅니다. 즉, 컴포넌트는 특정 URL에 한정되지 않습니다.

<a name="generating-components"></a>
### 컴포넌트 생성하기

컴포넌트를 생성하려면 `dusk:component` 아티즌 명령어를 실행하세요. 새 컴포넌트는 `tests/Browser/Components` 디렉터리에 저장됩니다.

```
php artisan dusk:component DatePicker
```

위 예시처럼, "date picker"(날짜 선택기)는 여러 페이지에 걸쳐 사용될 수 있는 컴포넌트의 한 예입니다. 수십 개의 테스트마다 날짜 선택 로직을 일일이 작성하는 것은 번거로울 수 있습니다. 이런 경우 Dusk 컴포넌트로 캡슐화하여 한 번만 정의하면 됩니다.

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
     * 브라우저 페이지에 컴포넌트가 포함되어 있는지 검증합니다.
     *
     * @param  Browser  $browser
     * @return void
     */
    public function assert(Browser $browser)
    {
        $browser->assertVisible($this->selector());
    }

    /**
     * 컴포넌트의 셀렉터 단축키 목록을 반환합니다.
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

컴포넌트를 정의한 후에는, 어느 테스트에서나 손쉽게 날짜를 선택할 수 있습니다. 만약 날짜 선택 로직이 변경된다면 컴포넌트만 수정하면 됩니다.

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

## 지속적 통합 (Continuous Integration)

> [!WARNING]
> 대부분의 Dusk 지속적 통합 환경에서는 라라벨 애플리케이션이 포트 8000번에서 PHP 내장 개발 서버를 통해 제공된다고 가정합니다. 따라서 계속 진행하기 전에, 지속적 통합 환경에서 `APP_URL` 환경 변수의 값이 `http://127.0.0.1:8000`으로 설정되어 있는지 반드시 확인해야 합니다.

<a name="running-tests-on-heroku-ci"></a>
### Heroku CI에서 테스트 실행

[Heroku CI](https://www.heroku.com/continuous-integration)에서 Dusk 테스트를 실행하려면, 아래와 같이 Google Chrome 빌드팩과 스크립트를 Heroku의 `app.json` 파일에 추가합니다.

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
### Travis CI에서 테스트 실행

[Travis CI](https://travis-ci.org)에서 Dusk 테스트를 실행하려면 아래와 같이 `.travis.yml` 설정 파일을 사용하면 됩니다. Travis CI는 그래픽 환경이 아니기 때문에 크롬 브라우저를 실행하기 위해 몇 가지 추가 단계가 필요합니다. 또한, PHP의 내장 웹 서버를 실행하기 위해 `php artisan serve` 명령어를 사용합니다.

```yaml
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
### GitHub Actions에서 테스트 실행

[GitHub Actions](https://github.com/features/actions)를 사용해 Dusk 테스트를 실행하려면, 아래의 설정 파일을 시작점으로 사용할 수 있습니다. Travis CI와 마찬가지로 `php artisan serve` 명령어로 PHP 내장 웹 서버를 실행합니다.

```yaml
name: CI
on: [push]
jobs:

  dusk-php:
    runs-on: ubuntu-latest
    env:
      APP_URL: "http://127.0.0.1:8000"
      DB_USERNAME: root
      DB_PASSWORD: root
      MAIL_MAILER: log
    steps:
      - uses: actions/checkout@v3
      - name: Prepare The Environment
        run: cp .env.example .env
      - name: Create Database
        run: |
          sudo systemctl start mysql
          mysql --user="root" --password="root" -e "CREATE DATABASE \`my-database\` character set UTF8mb4 collate utf8mb4_bin;"
      - name: Install Composer Dependencies
        run: composer install --no-progress --prefer-dist --optimize-autoloader
      - name: Generate Application Key
        run: php artisan key:generate
      - name: Upgrade Chrome Driver
        run: php artisan dusk:chrome-driver --detect
      - name: Start Chrome Driver
        run: ./vendor/laravel/dusk/bin/chromedriver-linux &
      - name: Run Laravel Server
        run: php artisan serve --no-reload &
      - name: Run Dusk Tests
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