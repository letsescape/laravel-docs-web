# 라라벨 더스크 (Laravel Dusk)

- [소개](#introduction)
- [설치](#installation)
    - [ChromeDriver 설치 관리](#managing-chromedriver-installations)
    - [다른 브라우저 사용하기](#using-other-browsers)
- [시작하기](#getting-started)
    - [테스트 생성하기](#generating-tests)
    - [각 테스트 후 데이터베이스 초기화](#resetting-the-database-after-each-test)
    - [테스트 실행하기](#running-tests)
    - [환경 파일 처리](#environment-handling)
- [브라우저 기본 사용법](#browser-basics)
    - [브라우저 인스턴스 생성](#creating-browsers)
    - [페이지 이동](#navigation)
    - [브라우저 창 크기 조절](#resizing-browser-windows)
    - [브라우저 매크로](#browser-macros)
    - [인증](#authentication)
    - [쿠키](#cookies)
    - [JavaScript 실행](#executing-javascript)
    - [스크린샷 저장](#taking-a-screenshot)
    - [콘솔 출력 파일로 저장](#storing-console-output-to-disk)
    - [페이지 소스 파일로 저장](#storing-page-source-to-disk)
- [엘리먼트와 상호작용하기](#interacting-with-elements)
    - [Dusk 셀렉터](#dusk-selectors)
    - [텍스트, 값, 속성](#text-values-and-attributes)
    - [폼과 상호작용](#interacting-with-forms)
    - [파일 첨부](#attaching-files)
    - [버튼 클릭](#pressing-buttons)
    - [링크 클릭](#clicking-links)
    - [키보드 사용](#using-the-keyboard)
    - [마우스 사용](#using-the-mouse)
    - [JavaScript 대화상자](#javascript-dialogs)
    - [iframe과 상호작용](#interacting-with-iframes)
    - [셀렉터 범위 지정](#scoping-selectors)
    - [엘리먼트 대기](#waiting-for-elements)
    - [엘리먼트 화면 진입 스크롤](#scrolling-an-element-into-view)
- [사용 가능한 assertion](#available-assertions)
- [페이지](#pages)
    - [페이지 생성](#generating-pages)
    - [페이지 설정](#configuring-pages)
    - [페이지로 이동](#navigating-to-pages)
    - [셸렉터 단축 표기](#shorthand-selectors)
    - [페이지 메서드](#page-methods)
- [컴포넌트](#components)
    - [컴포넌트 생성](#generating-components)
    - [컴포넌트 사용법](#using-components)
- [지속적 통합 (CI)](#continuous-integration)
    - [Heroku CI](#running-tests-on-heroku-ci)
    - [Travis CI](#running-tests-on-travis-ci)
    - [GitHub Actions](#running-tests-on-github-actions)
    - [Chipper CI](#running-tests-on-chipper-ci)

<a name="introduction"></a>
## 소개

[Laravel Dusk](https://github.com/laravel/dusk)는 표현력 있고 사용하기 쉬운 브라우저 자동화 및 테스트 API를 제공합니다. 기본적으로 Dusk는 여러분의 로컬 컴퓨터에 JDK나 Selenium을 설치할 필요가 없습니다. 대신, Dusk는 독립형 [ChromeDriver](https://sites.google.com/chromium.org/driver) 설치를 활용합니다. 물론, 원한다면 다른 Selenium 호환 드라이버를 사용할 수도 있습니다.

<a name="installation"></a>
## 설치

먼저 [Google Chrome](https://www.google.com/chrome)을 설치하고, `laravel/dusk` Composer 패키지를 프로젝트에 추가합니다:

```shell
composer require laravel/dusk --dev
```

> [!WARNING]
> Dusk의 서비스 프로바이더를 수동으로 등록하는 경우, 반드시 프로덕션 환경에서는 **절대로** 등록하지 않아야 합니다. 등록할 경우 임의의 사용자가 애플리케이션에 인증할 수 있는 보안 문제가 발생할 수 있습니다.

Dusk 패키지 설치 후에는 `dusk:install` Artisan 명령어를 실행합니다. 이 명령어는 `tests/Browser` 디렉토리, Dusk 테스트 예제 파일, 그리고 운영체제에 맞는 Chrome Driver 바이너리를 생성 및 설치합니다:

```shell
php artisan dusk:install
```

다음으로, 애플리케이션의 `.env` 파일에서 `APP_URL` 환경 변수를 설정해야 합니다. 이 값은 브라우저에서 애플리케이션에 접근할 때 사용하는 URL과 일치해야 합니다.

> [!NOTE]
> 로컬 개발 환경 관리에 [Laravel Sail](/docs/12.x/sail)을 사용 중이라면, Dusk 테스트 사용 방법에 관한 [Sail 공식 문서](/docs/12.x/sail#laravel-dusk)도 꼭 참고해 주시기 바랍니다.

<a name="managing-chromedriver-installations"></a>
### ChromeDriver 설치 관리

Laravel Dusk의 `dusk:install` 명령어로 설치되는 ChromeDriver와 다른 버전을 설치하려면, `dusk:chrome-driver` 명령어를 사용할 수 있습니다:

```shell
# 운영체제에 맞는 최신 ChromeDriver 설치...
php artisan dusk:chrome-driver

# 지정된 ChromeDriver 버전 설치...
php artisan dusk:chrome-driver 86

# 지원되는 모든 운영체제용으로 지정된 버전 설치...
php artisan dusk:chrome-driver --all

# 현재 Chrome 또는 Chromium의 감지된 버전에 맞는 ChromeDriver 설치...
php artisan dusk:chrome-driver --detect
```

> [!WARNING]
> Dusk를 사용하려면 `chromedriver` 바이너리에 실행 권한이 있어야 합니다. Dusk 실행에 문제가 발생한다면, 다음 명령어를 사용하여 바이너리가 실행 가능하도록 설정해야 합니다: `chmod -R 0755 vendor/laravel/dusk/bin/`.

<a name="using-other-browsers"></a>
### 다른 브라우저 사용하기

기본적으로 Dusk는 Google Chrome과 독립적으로 설치된 [ChromeDriver](https://sites.google.com/chromium.org/driver)를 이용해 브라우저 테스트를 실행합니다. 하지만 자체적으로 Selenium 서버를 구동해 원하는 브라우저에서 테스트를 진행할 수도 있습니다.

먼저, 애플리케이션의 기본 Dusk 테스트 케이스 파일인 `tests/DuskTestCase.php`를 엽니다. 이 파일에서 `startChromeDriver` 메서드 호출 부분을 제거하세요. 이렇게 하면 Dusk가 ChromeDriver를 자동으로 시작하지 않습니다:

```php
/**
 * Prepare for Dusk test execution.
 *
 * @beforeClass
 */
public static function prepare(): void
{
    // static::startChromeDriver();
}
```

다음으로, `driver` 메서드를 수정하여 원하는 URL 및 포트에 연결할 수 있습니다. 또한 WebDriver에 전달해야 할 "desired capabilities"도 변경할 수 있습니다:

```php
use Facebook\WebDriver\Remote\RemoteWebDriver;

/**
 * Create the RemoteWebDriver instance.
 */
protected function driver(): RemoteWebDriver
{
    return RemoteWebDriver::create(
        'http://localhost:4444/wd/hub', DesiredCapabilities::phantomjs()
    );
}
```

<a name="getting-started"></a>
## 시작하기

<a name="generating-tests"></a>
### 테스트 생성하기

Dusk 테스트를 생성하려면, `dusk:make` Artisan 명령어를 사용하세요. 생성된 테스트 파일은 `tests/Browser` 디렉토리에 위치하게 됩니다:

```shell
php artisan dusk:make LoginTest
```

<a name="resetting-the-database-after-each-test"></a>
### 각 테스트 후 데이터베이스 초기화

대부분의 테스트는 애플리케이션의 데이터베이스에서 데이터를 가져오는 페이지와 상호작용합니다. 하지만 Dusk 테스트에서는 `RefreshDatabase` 트레이트를 사용해서는 안 됩니다. `RefreshDatabase` 트레이트는 데이터베이스 트랜잭션을 활용하므로, HTTP 요청 간에는 동작하지 않거나 적용되지 않습니다. 대신, 두 가지 방법인 `DatabaseMigrations` 트레이트와 `DatabaseTruncation` 트레이트를 사용할 수 있습니다.

<a name="reset-migrations"></a>
#### 데이터베이스 마이그레이션 사용

`DatabaseMigrations` 트레이트는 각 테스트 전에 데이터베이스 마이그레이션을 실행합니다. 하지만, 매 테스트마다 테이블을 드롭하고 다시 생성하기 때문에, 테이블을 단순히 비우는 방법보다 일반적으로 느립니다:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;

uses(DatabaseMigrations::class);

//
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseMigrations;

    //
}
```

> [!WARNING]
> SQLite 메모리 데이터베이스는 Dusk 테스트 실행 시 사용할 수 없습니다. 브라우저가 독립된 프로세스에서 실행되므로, 다른 프로세스에서 사용되는 메모리 내 데이터베이스에 접근할 수 없습니다.

<a name="reset-truncation"></a>
#### 데이터베이스 Truncation 사용

`DatabaseTruncation` 트레이트는 첫 번째 테스트 실행 시 데이터베이스 마이그레이션을 실행하여 테이블이 제대로 생성되어 있는지 확인합니다. 이후 테스트에서는 복수의 마이그레이션을 다시 실행하는 대신, 데이터베이스 테이블만 비워서(Truncate) 속도를 크게 높일 수 있습니다:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\DatabaseTruncation;
use Laravel\Dusk\Browser;

uses(DatabaseTruncation::class);

//
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseTruncation;

    //
}
```

기본적으로, 이 트레이트는 `migrations` 테이블을 제외한 모든 테이블을 Truncate 처리합니다. Truncate할 테이블을 커스터마이즈하려면 테스트 클래스에 `$tablesToTruncate` 속성을 정의할 수 있습니다:

> [!NOTE]
> Pest를 사용 중인 경우, 속성이나 메서드는 기본 `DuskTestCase` 클래스 또는 테스트 파일이 확장하는 클래스에 정의해야 합니다.

```php
/**
 * Indicates which tables should be truncated.
 *
 * @var array
 */
protected $tablesToTruncate = ['users'];
```

또는, Truncate에서 제외할 테이블을 지정하려면 `$exceptTables` 속성을 사용할 수 있습니다:

```php
/**
 * Indicates which tables should be excluded from truncation.
 *
 * @var array
 */
protected $exceptTables = ['users'];
```

Truncate 처리가 이루어질 데이터베이스 연결을 지정하려면, `$connectionsToTruncate` 속성을 정의할 수 있습니다:

```php
/**
 * Indicates which connections should have their tables truncated.
 *
 * @var array
 */
protected $connectionsToTruncate = ['mysql'];
```

데이터베이스 Truncate 직전 혹은 이후에 특정 코드를 실행하고 싶다면, 테스트 클래스에 `beforeTruncatingDatabase` 또는 `afterTruncatingDatabase` 메서드를 정의할 수 있습니다:

```php
/**
 * Perform any work that should take place before the database has started truncating.
 */
protected function beforeTruncatingDatabase(): void
{
    //
}

/**
 * Perform any work that should take place after the database has finished truncating.
 */
protected function afterTruncatingDatabase(): void
{
    //
}
```

<a name="running-tests"></a>
### 테스트 실행하기

브라우저 테스트를 실행하려면, `dusk` Artisan 명령어를 사용하세요:

```shell
php artisan dusk
```

이전 `dusk` 명령 실행에서 실패한 테스트가 있었다면, `dusk:fails` 명령어를 사용해 실패한 테스트만 우선적으로 다시 실행할 수 있습니다:

```shell
php artisan dusk:fails
```

`dusk` 명령어는 Pest 또는 PHPUnit 테스트 러너에서 일반적으로 지원되는 모든 인수도 사용할 수 있습니다. 예를 들어, [그룹](https://docs.phpunit.de/en/10.5/annotations.html#group) 단위로 특정 테스트만 실행할 수 있습니다:

```shell
php artisan dusk --group=foo
```

> [!NOTE]
> [Laravel Sail](/docs/12.x/sail)로 로컬 개발 환경을 관리하고 있다면, Dusk 테스트 설정과 실행 방식에 관한 [Sail 공식 문서](/docs/12.x/sail#laravel-dusk)도 참고하세요.

<a name="manually-starting-chromedriver"></a>
#### ChromeDriver 수동 실행

기본적으로 Dusk는 ChromeDriver를 자동으로 구동합니다. 만약 특정 환경에서 자동 실행이 동작하지 않는다면, `dusk` 명령어 실행 전에 ChromeDriver를 직접 수동으로 먼저 실행할 수 있습니다. 이 경우, `tests/DuskTestCase.php` 파일의 아래 줄을 주석 처리하여 자동 실행을 비활성화하세요:

```php
/**
 * Prepare for Dusk test execution.
 *
 * @beforeClass
 */
public static function prepare(): void
{
    // static::startChromeDriver();
}
```

또한, ChromeDriver를 기본 포트(9515)가 아닌 다른 포트에서 실행했다면, 동일 파일의 `driver` 메서드에서 포트 정보도 올바르게 수정해야 합니다:

```php
use Facebook\WebDriver\Remote\RemoteWebDriver;

/**
 * Create the RemoteWebDriver instance.
 */
protected function driver(): RemoteWebDriver
{
    return RemoteWebDriver::create(
        'http://localhost:9515', DesiredCapabilities::chrome()
    );
}
```

<a name="environment-handling"></a>
### 환경 파일 처리

테스트 실행 시 별도의 환경 파일을 사용하도록 강제로 지정하려면, 프로젝트 루트에 `.env.dusk.{environment}` 파일을 생성하면 됩니다. 예를 들어, `local` 환경에서 `dusk` 명령어를 실행할 예정이라면, `.env.dusk.local` 파일을 생성하십시오.

테스트 실행 중, Dusk는 기존의 `.env` 파일을 백업한 후, Dusk 환경 파일을 `.env`로 리네임하여 사용합니다. 테스트가 종료되면 원래의 `.env` 파일로 복구됩니다.

<a name="browser-basics"></a>
## 브라우저 기본 사용법

<a name="creating-browsers"></a>
### 브라우저 인스턴스 생성

우선, 우리의 애플리케이션에 로그인할 수 있는지 확인하는 테스트를 작성해보겠습니다. 테스트 파일을 생성한 후, 로그인 페이지로 이동하여, 자격 증명을 입력한 뒤 "Login" 버튼을 클릭하는 흐름으로 수정할 수 있습니다. 브라우저 인스턴스를 생성하려면 Dusk 테스트 내부에서 `browse` 메서드를 호출하면 됩니다:

```php tab=Pest
<?php

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;

uses(DatabaseMigrations::class);

test('basic example', function () {
    $user = User::factory()->create([
        'email' => 'taylor@laravel.com',
    ]);

    $this->browse(function (Browser $browser) use ($user) {
        $browser->visit('/login')
            ->type('email', $user->email)
            ->type('password', 'password')
            ->press('Login')
            ->assertPathIs('/home');
    });
});
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseMigrations;

    /**
     * A basic browser test example.
     */
    public function test_basic_example(): void
    {
        $user = User::factory()->create([
            'email' => 'taylor@laravel.com',
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->visit('/login')
                ->type('email', $user->email)
                ->type('password', 'password')
                ->press('Login')
                ->assertPathIs('/home');
        });
    }
}
```

위 예시에서 보듯이, `browse` 메서드는 클로저(익명 함수)를 인수로 받습니다. 이 클로저에는 브라우저 인스턴스가 자동으로 전달되며, 이는 애플리케이션과 상호작용하거나 assertion을 수행할 때 주로 사용하는 객체입니다.

<a name="creating-multiple-browsers"></a>
#### 여러 브라우저 인스턴스 생성

때로는 여러 브라우저 인스턴스가 있어야 테스트를 제대로 할 수 있습니다. 예를 들어, 웹소켓이 연동된 채팅 화면 테스트 등에서는 여러 브라우저가 필요할 수 있습니다. 이 경우, `browse` 메서드에 전달하는 클로저의 매개변수를 복수로 선언하면 됩니다:

```php
$this->browse(function (Browser $first, Browser $second) {
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
### 페이지 이동

`visit` 메서드는 애플리케이션 내에서 지정된 URI로 이동합니다:

```php
$browser->visit('/login');
```

[named route](/docs/12.x/routing#named-routes)로 이동하려면 `visitRoute` 메서드를 사용할 수 있습니다:

```php
$browser->visitRoute($routeName, $parameters);
```

`back`과 `forward` 메서드로 브라우저의 뒤로가기, 앞으로가기를 할 수 있습니다:

```php
$browser->back();

$browser->forward();
```

`refresh` 메서드로 해당 페이지를 새로고침할 수 있습니다:

```php
$browser->refresh();
```

<a name="resizing-browser-windows"></a>
### 브라우저 창 크기 조절

`resize` 메서드를 사용하면 브라우저 창의 크기를 조절할 수 있습니다:

```php
$browser->resize(1920, 1080);
```

브라우저 창을 최대화하려면 `maximize` 메서드를 사용합니다:

```php
$browser->maximize();
```

`fitContent` 메서드는 브라우저 창의 크기를 컨텐츠에 딱 맞게 조정합니다:

```php
$browser->fitContent();
```

테스트가 실패하면, Dusk는 자동으로 스크린샷을 찍기 전에 브라우저 크기를 컨텐츠에 맞게 재조정합니다. 이 기능을 비활성화하려면 테스트 내에서 `disableFitOnFailure` 메서드를 호출하세요:

```php
$browser->disableFitOnFailure();
```

`move` 메서드를 사용하면 브라우저 창을 화면의 원하는 위치로 이동시킬 수 있습니다:

```php
$browser->move($x = 100, $y = 100);
```

<a name="browser-macros"></a>
### 브라우저 매크로

반복적으로 여러 테스트에서 사용할 커스텀 브라우저 메서드를 정의하고 싶다면, `Browser` 클래스의 `macro` 메서드를 사용할 수 있습니다. 일반적으로는 [서비스 프로바이더](/docs/12.x/providers)의 `boot` 메서드에서 이 메서드를 호출하는 것이 좋습니다:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Dusk\Browser;

class DuskServiceProvider extends ServiceProvider
{
    /**
     * Register Dusk's browser macros.
     */
    public function boot(): void
    {
        Browser::macro('scrollToElement', function (string $element = null) {
            $this->script("$('html, body').animate({ scrollTop: $('$element').offset().top }, 0);");

            return $this;
        });
    }
}
```

`macro` 함수는 첫 번째 인수로 매크로 이름, 두 번째 인수로 클로저를 받습니다. 등록된 매크로는 `Browser` 인스턴스에서 마치 메서드처럼 호출할 수 있습니다:

```php
$this->browse(function (Browser $browser) use ($user) {
    $browser->visit('/pay')
        ->scrollToElement('#credit-card-details')
        ->assertSee('Enter Credit Card Details');
});
```

<a name="authentication"></a>
### 인증

테스트하려는 페이지가 인증을 요구하는 경우가 많습니다. 매번 로그인 화면을 거치지 않기 위해, Dusk의 `loginAs` 메서드를 사용할 수 있습니다. 이 메서드에는 인증 가능한 모델의 기본 키 값이나 모델 인스턴스를 인수로 전달합니다:

```php
use App\Models\User;
use Laravel\Dusk\Browser;

$this->browse(function (Browser $browser) {
    $browser->loginAs(User::find(1))
        ->visit('/home');
});
```

> [!WARNING]
> `loginAs` 메서드 사용 후, 해당 파일 내 모든 테스트에서 사용자의 세션이 유지됩니다.

<a name="cookies"></a>
### 쿠키

`cookie` 메서드를 사용하면 암호화된 쿠키 값을 조회하거나 설정할 수 있습니다. 기본적으로 라라벨이 생성하는 모든 쿠키는 암호화되어 있습니다:

```php
$browser->cookie('name');

$browser->cookie('name', 'Taylor');
```

암호화되지 않은 쿠키 값을 다루고 싶다면 `plainCookie` 메서드를 사용하세요:

```php
$browser->plainCookie('name');

$browser->plainCookie('name', 'Taylor');
```

주어진 쿠키를 삭제하려면 `deleteCookie` 메서드를 사용할 수 있습니다:

```php
$browser->deleteCookie('name');
```

<a name="executing-javascript"></a>

### 자바스크립트 실행

브라우저 내에서 임의의 자바스크립트 구문을 실행하려면 `script` 메서드를 사용할 수 있습니다.

```php
$browser->script('document.documentElement.scrollTop = 0');

$browser->script([
    'document.body.scrollTop = 0',
    'document.documentElement.scrollTop = 0',
]);

$output = $browser->script('return window.location.pathname');
```

<a name="taking-a-screenshot"></a>
### 스크린샷 찍기

`screenshot` 메서드를 사용하여 스크린샷을 찍고 지정한 파일명으로 저장할 수 있습니다. 모든 스크린샷 파일은 `tests/Browser/screenshots` 디렉터리에 저장됩니다.

```php
$browser->screenshot('filename');
```

`responsiveScreenshots` 메서드를 사용하면 다양한 브레이크포인트에서 여러 개의 스크린샷을 찍을 수 있습니다.

```php
$browser->responsiveScreenshots('filename');
```

`screenshotElement` 메서드를 사용하면 페이지 내 특정 요소에 대한 스크린샷을 찍을 수 있습니다.

```php
$browser->screenshotElement('#selector', 'filename');
```

<a name="storing-console-output-to-disk"></a>
### 콘솔 출력 결과 저장

`storeConsoleLog` 메서드를 사용하면 현재 브라우저의 콘솔 출력을 지정한 파일명으로 디스크에 저장할 수 있습니다. 콘솔 출력 결과는 `tests/Browser/console` 디렉터리에 저장됩니다.

```php
$browser->storeConsoleLog('filename');
```

<a name="storing-page-source-to-disk"></a>
### 페이지 소스 저장

`storeSource` 메서드를 사용하면 현재 페이지의 소스 코드를 지정한 파일명으로 디스크에 저장할 수 있습니다. 저장된 파일은 `tests/Browser/source` 디렉터리에 위치합니다.

```php
$browser->storeSource('filename');
```

<a name="interacting-with-elements"></a>
## 요소와 상호작용하기

<a name="dusk-selectors"></a>
### Dusk 셀렉터

효과적으로 요소와 상호작용할 수 있는 CSS 셀렉터를 선택하는 것은 Dusk 테스트를 작성할 때 가장 어려운 부분 중 하나입니다. 시간이 지나면서 프론트엔드가 변경되면 아래와 같은 CSS 셀렉터 작성이 테스트 실패의 원인이 될 수 있습니다.

```html
// HTML...

<button>Login</button>
```

```php
// Test...

$browser->click('.login-page .container div > button');
```

Dusk 셀렉터를 사용하면 CSS 셀렉터를 기억하는 대신 테스트 작성에 더욱 집중할 수 있습니다. 셀렉터를 정의하려면 HTML 요소에 `dusk` 속성을 추가하십시오. 그런 다음 Dusk 브라우저에서 해당 셀렉터를 `@`로 접두사하여 테스트 내에서 해당 요소를 조작할 수 있습니다.

```html
// HTML...

<button dusk="login-button">Login</button>
```

```php
// Test...

$browser->click('@login-button');
```

원한다면, `selectorHtmlAttribute` 메서드를 통해 Dusk가 사용하는 HTML 속성명을 직접 커스터마이즈할 수도 있습니다. 일반적으로 이 메서드는 애플리케이션의 `AppServiceProvider` 클래스의 `boot` 메서드에서 호출합니다.

```php
use Laravel\Dusk\Dusk;

Dusk::selectorHtmlAttribute('data-dusk');
```

<a name="text-values-and-attributes"></a>
### 텍스트, 값, 속성 다루기

<a name="retrieving-setting-values"></a>
#### 값 가져오기 및 설정하기

Dusk는 페이지 내 요소의 현재 값, 표시 텍스트, 속성 등에 대해 다양한 상호작용 메서드를 제공합니다. 예를 들어, 특정 CSS 또는 Dusk 셀렉터에 매칭되는 요소의 "value"를 가져오려면 `value` 메서드를 사용합니다.

```php
// 값 가져오기...
$value = $browser->value('selector');

// 값 설정하기...
$browser->value('selector', 'value');
```

`inputValue` 메서드를 사용하면 주어진 필드 이름을 가진 input 요소의 "value" 값을 가져올 수 있습니다.

```php
$value = $browser->inputValue('field');
```

<a name="retrieving-text"></a>
#### 텍스트 가져오기

`text` 메서드를 사용하면, 주어진 셀렉터에 매칭되는 요소의 표시 텍스트를 가져올 수 있습니다.

```php
$text = $browser->text('selector');
```

<a name="retrieving-attributes"></a>
#### 속성 값 가져오기

마지막으로, `attribute` 메서드를 사용하면 주어진 셀렉터에 매칭되는 요소의 속성 값을 가져올 수 있습니다.

```php
$attribute = $browser->attribute('selector', 'value');
```

<a name="interacting-with-forms"></a>
### 폼(Form)과의 상호작용

<a name="typing-values"></a>
#### 값 입력하기

Dusk는 다양한 폼 입력 요소와 상호작용할 수 있는 여러 메서드를 제공합니다. 먼저, 입력 필드에 텍스트를 입력하는 예시를 살펴봅니다.

```php
$browser->type('email', 'taylor@laravel.com');
```

참고로, 이 메서드는 필요할 경우 CSS 셀렉터를 받을 수 있지만, `type` 메서드에 CSS 셀렉터를 꼭 전달해야 할 필요는 없습니다. CSS 셀렉터가 주어지지 않으면, Dusk는 해당 이름을 가진 `input` 또는 `textarea` 필드를 찾아서 자동으로 지정합니다.

필드의 내용을 지우지 않고 텍스트를 이어서 입력하려면 `append` 메서드를 사용할 수 있습니다.

```php
$browser->type('tags', 'foo')
    ->append('tags', ', bar, baz');
```

입력값을 지우고 싶을 때는 `clear` 메서드를 사용합니다.

```php
$browser->clear('email');
```

입력을 천천히 입력하도록 Dusk에게 지시하려면 `typeSlowly` 메서드를 사용합니다. 기본적으로 Dusk는 각 키 사이에 100밀리초 동안 대기합니다. 키 입력 간 지연 시간을 변경하려면 세 번째 인자로 원하는 밀리초 값을 전달하면 됩니다.

```php
$browser->typeSlowly('mobile', '+1 (202) 555-5555');

$browser->typeSlowly('mobile', '+1 (202) 555-5555', 300);
```

`appendSlowly` 메서드를 사용하면 텍스트를 이어서 천천히 입력할 수 있습니다.

```php
$browser->type('tags', 'foo')
    ->appendSlowly('tags', ', bar, baz');
```

<a name="dropdowns"></a>
#### 드롭다운

`select` 요소에서 사용할 옵션을 선택하려면 `select` 메서드를 사용합니다. `type` 메서드와 마찬가지로, 이 메서드 역시 CSS 셀렉터 전체를 전달할 필요가 없습니다. 값 전달 시 실제 표시 텍스트가 아니라 옵션의 값을 전달해야 합니다.

```php
$browser->select('size', 'Large');
```

두 번째 인자를 생략하면, 임의의 옵션이 선택됩니다.

```php
$browser->select('size');
```

배열을 두 번째 인자로 전달하면 여러 옵션을 선택할 수도 있습니다.

```php
$browser->select('categories', ['Art', 'Music']);
```

<a name="checkboxes"></a>
#### 체크박스

체크박스 input을 "선택(체크)"하려면 `check` 메서드를 사용합니다. 다른 입력 관련 메서드와 마찬가지로 CSS 셀렉터를 꼭 전달하지 않아도 됩니다. 만약 CSS 셀렉터와 일치하는 요소를 찾지 못하면, Dusk는 일치하는 `name` 속성을 가진 체크박스를 자동으로 찾습니다.

```php
$browser->check('terms');
```

`uncheck` 메서드는 체크박스 선택을 해제할 때 사용합니다.

```php
$browser->uncheck('terms');
```

<a name="radio-buttons"></a>
#### 라디오 버튼

`radio` 입력 옵션을 "선택"하려면 `radio` 메서드를 사용할 수 있습니다. 다른 입력 관련 메서드와 마찬가지로 CSS 셀렉터를 꼭 명시하지 않아도 됩니다. CSS 셀렉터로 일치하는 요소를 찾지 못할 경우, Dusk는 일치하는 `name` 및 `value` 속성을 가진 라디오 버튼을 자동으로 찾습니다.

```php
$browser->radio('size', 'large');
```

<a name="attaching-files"></a>
### 파일 첨부

`attach` 메서드는 `file` input 요소에 파일을 첨부할 때 사용합니다. 다른 입력 관련 메서드와 마찬가지로 CSS 셀렉터를 지정하지 않아도 되며, 일치하는 `name` 속성을 찾아 자동으로 동작합니다.

```php
$browser->attach('photo', __DIR__.'/photos/mountains.png');
```

> [!WARNING]
> 파일 첨부 기능을 사용하려면 서버에 `Zip` PHP 확장 모듈이 설치되어 있어야 하며 활성화되어 있어야 합니다.

<a name="pressing-buttons"></a>
### 버튼 클릭하기

`press` 메서드는 페이지 내 버튼 요소를 클릭할 때 사용합니다. 이 메서드에 전달하는 인자는 버튼 내 표시 텍스트, CSS 셀렉터, 또는 Dusk 셀렉터를 사용할 수 있습니다.

```php
$browser->press('Login');
```

폼 제출 시, 많은 애플리케이션은 제출 버튼을 누르면 해당 버튼을 비활성화했다가, HTTP 요청이 완료되면 다시 활성화하는 방식을 사용합니다. 버튼을 누르고 재활성화될 때까지 기다리려면 `pressAndWaitFor` 메서드를 사용할 수 있습니다.

```php
// 버튼을 누르고, 최대 5초 동안 다시 활성화될 때까지 기다립니다...
$browser->pressAndWaitFor('Save');

// 버튼을 누르고, 최대 1초 동안 다시 활성화될 때까지 기다립니다...
$browser->pressAndWaitFor('Save', 1);
```

<a name="clicking-links"></a>
### 링크 클릭

링크를 클릭하려면 브라우저 인스턴스에서 `clickLink` 메서드를 사용합니다. 이 메서드는 전달한 표시 텍스트를 가진 링크를 클릭합니다.

```php
$browser->clickLink($linkText);
```

`seeLink` 메서드를 사용하면 특정 표시 텍스트를 가진 링크가 페이지에 보이는지 확인할 수 있습니다.

```php
if ($browser->seeLink($linkText)) {
    // ...
}
```

> [!WARNING]
> 이들 메서드는 jQuery와 상호작용합니다. 만약 페이지에 jQuery가 없으면 Dusk가 테스트 중 사용할 수 있도록 자동으로 jQuery를 삽입합니다.

<a name="using-the-keyboard"></a>
### 키보드 사용하기

`keys` 메서드를 사용하면 `type` 메서드보다 복잡한 입력 시퀀스를 특정 요소에 전달할 수 있습니다. 예를 들어, 입력 값에 대해 수정 키(Shift, Ctrl 등)를 눌러야 하는 상황을 만들 수 있습니다. 이 예시에서는, `shift` 키를 누른 채로 `taylor`를 입력한 뒤, 수정 키 없이 `swift`를 입력합니다.

```php
$browser->keys('selector', ['{shift}', 'taylor'], 'swift');
```

또한, `keys` 메서드를 활용해 애플리케이션의 주요 CSS 셀렉터에 "키보드 단축키" 조합을 보낼 수도 있습니다.

```php
$browser->keys('.app', ['{command}', 'j']);
```

> [!NOTE]
> `{command}`와 같은 모든 수정 키는 `{}` 문자로 감싸서 전달하며, 이는 `Facebook\WebDriver\WebDriverKeys` 클래스에 정의된 상수와 일치합니다. [GitHub에서 확인할 수 있습니다.](https://github.com/php-webdriver/php-webdriver/blob/master/lib/WebDriverKeys.php)

<a name="fluent-keyboard-interactions"></a>
#### 유창한 키보드 상호작용

Dusk는 또한 `withKeyboard` 메서드를 제공하여, `Laravel\Dusk\Keyboard` 클래스를 통해 복잡한 키보드 상호작용을 유창하게 수행할 수 있습니다. `Keyboard` 클래스는 `press`, `release`, `type`, `pause` 메서드를 제공합니다.

```php
use Laravel\Dusk\Keyboard;

$browser->withKeyboard(function (Keyboard $keyboard) {
    $keyboard->press('c')
        ->pause(1000)
        ->release('c')
        ->type(['c', 'e', 'o']);
});
```

<a name="keyboard-macros"></a>
#### 키보드 매크로

테스트 전체에서 쉽게 재사용할 수 있는 맞춤형 키보드 상호작용을 정의하고 싶다면, `Keyboard` 클래스에서 제공하는 `macro` 메서드를 사용할 수 있습니다. 일반적으로 이 메서드는 [서비스 프로바이더](/docs/12.x/providers)의 `boot` 메서드에서 호출해야 합니다.

```php
<?php

namespace App\Providers;

use Facebook\WebDriver\WebDriverKeys;
use Illuminate\Support\ServiceProvider;
use Laravel\Dusk\Keyboard;
use Laravel\Dusk\OperatingSystem;

class DuskServiceProvider extends ServiceProvider
{
    /**
     * Register Dusk's browser macros.
     */
    public function boot(): void
    {
        Keyboard::macro('copy', function (string $element = null) {
            $this->type([
                OperatingSystem::onMac() ? WebDriverKeys::META : WebDriverKeys::CONTROL, 'c',
            ]);

            return $this;
        });

        Keyboard::macro('paste', function (string $element = null) {
            $this->type([
                OperatingSystem::onMac() ? WebDriverKeys::META : WebDriverKeys::CONTROL, 'v',
            ]);

            return $this;
        });
    }
}
```

`macro` 함수는 첫 번째 인자로 매크로의 이름, 두 번째 인자로는 클로저를 받습니다. 매크로는 `Keyboard` 인스턴스의 메서드처럼 호출할 수 있습니다.

```php
$browser->click('@textarea')
    ->withKeyboard(fn (Keyboard $keyboard) => $keyboard->copy())
    ->click('@another-textarea')
    ->withKeyboard(fn (Keyboard $keyboard) => $keyboard->paste());
```

<a name="using-the-mouse"></a>
### 마우스 사용하기

<a name="clicking-on-elements"></a>
#### 요소 클릭

`click` 메서드는 주어진 CSS 또는 Dusk 셀렉터에 매칭되는 요소를 클릭할 때 사용할 수 있습니다.

```php
$browser->click('.selector');
```

`clickAtXPath` 메서드는 주어진 XPath 표현식에 매칭되는 요소를 클릭할 때 사용합니다.

```php
$browser->clickAtXPath('//div[@class = "selector"]');
```

`clickAtPoint` 메서드는 브라우저의 보이는 영역에서 주어진 좌표에 위치한 최상단의 요소를 클릭합니다.

```php
$browser->clickAtPoint($x = 0, $y = 0);
```

`doubleClick` 메서드는 마우스의 더블 클릭 동작을 시뮬레이션합니다.

```php
$browser->doubleClick();

$browser->doubleClick('.selector');
```

`rightClick` 메서드는 마우스 오른쪽 클릭 동작을 시뮬레이션할 수 있습니다.

```php
$browser->rightClick();

$browser->rightClick('.selector');
```

`clickAndHold` 메서드는 마우스 버튼을 클릭한 채로 누르고 있는 동작을 시뮬레이션합니다. 이후 `releaseMouse` 메서드를 호출하면 마우스 클릭 상태가 해제됩니다.

```php
$browser->clickAndHold('.selector');

$browser->clickAndHold()
    ->pause(1000)
    ->releaseMouse();
```

`controlClick` 메서드는 브라우저 내에서 `ctrl+클릭` 이벤트를 시뮬레이션합니다.

```php
$browser->controlClick();

$browser->controlClick('.selector');
```

<a name="mouseover"></a>
#### 마우스오버

`mouseover` 메서드는 주어진 CSS 또는 Dusk 셀렉터에 매칭되는 요소로 마우스를 이동시킬 때 사용합니다.

```php
$browser->mouseover('.selector');
```

<a name="drag-drop"></a>
#### 드래그 앤 드롭

`drag` 메서드는 하나의 요소를 선택해 다른 요소로 드래그할 때 사용합니다.

```php
$browser->drag('.from-selector', '.to-selector');
```

또는, 한 방향으로만 요소를 드래그할 수 있습니다.

```php
$browser->dragLeft('.selector', $pixels = 10);
$browser->dragRight('.selector', $pixels = 10);
$browser->dragUp('.selector', $pixels = 10);
$browser->dragDown('.selector', $pixels = 10);
```

또한, 지정한 좌표만큼 요소를 이동(드래그)할 수도 있습니다.

```php
$browser->dragOffset('.selector', $x = 10, $y = 10);
```

<a name="javascript-dialogs"></a>
### 자바스크립트 다이얼로그 상호작용

Dusk에서는 자바스크립트 다이얼로그와 상호작용할 수 있는 다양한 메서드를 제공합니다. 예를 들어, `waitForDialog` 메서드를 사용하면 자바스크립트 다이얼로그가 나타날 때까지 기다릴 수 있습니다. 이 메서드는 다이얼로그가 뜰 때까지 최대 몇 초 동안 대기할지 선택적으로 지정할 수 있습니다.

```php
$browser->waitForDialog($seconds = null);
```

`assertDialogOpened` 메서드는 다이얼로그가 표시되었고 지정한 메시지를 포함하고 있는지 확인합니다.

```php
$browser->assertDialogOpened('Dialog message');
```

자바스크립트 다이얼로그에 프롬프트가 포함되어 있다면, `typeInDialog` 메서드를 사용해 프롬프트란에 값을 입력할 수 있습니다.

```php
$browser->typeInDialog('Hello World');
```

열려 있는 자바스크립트 다이얼로그에서 "확인(OK)" 버튼을 누르려면 `acceptDialog` 메서드를 호출하면 됩니다.

```php
$browser->acceptDialog();
```

"취소(Cancel)" 버튼을 클릭하려면 `dismissDialog` 메서드를 호출합니다.

```php
$browser->dismissDialog();
```

<a name="interacting-with-iframes"></a>
### 인라인 프레임과 상호작용하기

iframe 내부의 요소와 상호작용해야 하는 경우, `withinFrame` 메서드를 사용할 수 있습니다. `withinFrame`에 제공하는 클로저 내부에서 이루어지는 모든 요소의 조작은 지정한 프레임의 범위 내에서만 제한적으로 동작합니다.

```php
$browser->withinFrame('#credit-card-details', function ($browser) {
    $browser->type('input[name="cardnumber"]', '4242424242424242')
        ->type('input[name="exp-date"]', '1224')
        ->type('input[name="cvc"]', '123')
        ->press('Pay');
});
```

<a name="scoping-selectors"></a>
### 셀렉터 범위 제한하기

때로는 특정 셀렉터 범위 내에서 여러 작업을 수행하고 싶을 때가 있습니다. 예를 들어, 어떤 텍스트가 테이블 영역 안에만 있는지 확인한 다음 해당 테이블 안의 버튼을 클릭하고 싶은 경우입니다. `with` 메서드를 사용하면 이처럼 특정 셀렉터 내에서만 동작을 한정할 수 있습니다. 클로저 내부에서 수행되는 모든 작업은 처음 지정한 셀렉터 범위 내에서만 실행됩니다.

```php
$browser->with('.table', function (Browser $table) {
    $table->assertSee('Hello World')
        ->clickLink('Delete');
});
```

가끔은 현재 범위 밖에서 assertion을 실행해야 할 수도 있습니다. 이럴 때는 `elsewhere`와 `elsewhereWhenAvailable` 메서드를 사용할 수 있습니다.

```php
$browser->with('.table', function (Browser $table) {
    // 현재 범위는 `body .table`입니다...

    $browser->elsewhere('.page-title', function (Browser $title) {
        // 현재 범위는 `body .page-title`입니다...
        $title->assertSee('Hello World');
    });

    $browser->elsewhereWhenAvailable('.page-title', function (Browser $title) {
        // 현재 범위는 `body .page-title`입니다...
        $title->assertSee('Hello World');
    });
});
```

<a name="waiting-for-elements"></a>
### 요소 대기(Waiting for Elements)

자바스크립트를 많이 사용하는 애플리케이션을 테스트할 때는, 테스트를 계속 진행하기 전 특정 요소 또는 데이터가 준비될 때까지 "기다리는" 일이 자주 필요합니다. Dusk에서는 이를 아주 손쉽게 처리할 수 있도록 다양한 대기(wait) 메서드를 제공합니다. 이 메서드를 활용하면, 페이지에서 특정 요소가 보이게 될 때까지 또는 주어진 자바스크립트 표현식이 `true`가 될 때까지 기다릴 수 있습니다.

<a name="waiting"></a>
#### 대기

테스트를 단순히 지정된 밀리초만큼 중지하고 싶다면 `pause` 메서드를 사용하십시오.

```php
$browser->pause(1000);
```

특정 조건이 `true`일 때만 테스트를 일시 중단하려면 `pauseIf` 메서드를 이용합니다.

```php
$browser->pauseIf(App::environment('production'), 1000);
```

반대로, 조건이 `true`가 아니면 테스트를 일시 중단하고 싶다면 `pauseUnless` 메서드를 사용할 수 있습니다.

```php
$browser->pauseUnless(App::environment('testing'), 1000);
```

<a name="waiting-for-selectors"></a>
#### 셀렉터 대기

`waitFor` 메서드를 사용하면, 지정한 CSS 또는 Dusk 셀렉터에 해당하는 요소가 페이지에 표시될 때까지 테스트의 실행을 일시 중단할 수 있습니다. 기본적으로 이 메서드는 최대 5초 동안 대기한 뒤, 요소가 보이지 않으면 예외를 발생시킵니다. 필요하다면 두 번째 인자로 커스텀 대기 시간을 전달할 수 있습니다.

```php
// 최대 5초 동안 셀렉터가 표시될 때까지 대기합니다...
$browser->waitFor('.selector');

// 최대 1초 동안 셀렉터가 표시될 때까지 대기합니다...
$browser->waitFor('.selector', 1);
```

지정된 셀렉터에 해당하는 요소가 특정 텍스트를 포함할 때까지 대기하고 싶을 때는 다음과 같이 작성합니다.

```php
// 최대 5초 동안 셀렉터가 지정한 텍스트를 포함할 때까지 대기합니다...
$browser->waitForTextIn('.selector', 'Hello World');

// 최대 1초 동안 셀렉터가 지정한 텍스트를 포함할 때까지 대기합니다...
$browser->waitForTextIn('.selector', 'Hello World', 1);
```

셀렉터와 일치하는 요소가 페이지에서 사라질 때까지 대기하고 싶을 때는 다음과 같이 사용합니다.

```php
// 최대 5초 동안 셀렉터가 사라질 때까지 대기합니다...
$browser->waitUntilMissing('.selector');

// 최대 1초 동안 셀렉터가 사라질 때까지 대기합니다...
$browser->waitUntilMissing('.selector', 1);
```

또는, 셀렉터와 일치하는 요소가 "활성화" 또는 "비활성화"될 때까지 대기할 수도 있습니다.

```php
// 최대 5초 동안 셀렉터가 활성화될 때까지 대기합니다...
$browser->waitUntilEnabled('.selector');

// 최대 1초 동안 셀렉터가 활성화될 때까지 대기합니다...
$browser->waitUntilEnabled('.selector', 1);

// 최대 5초 동안 셀렉터가 비활성화될 때까지 대기합니다...
$browser->waitUntilDisabled('.selector');

// 최대 1초 동안 셀렉터가 비활성화될 때까지 대기합니다...
$browser->waitUntilDisabled('.selector', 1);
```

<a name="scoping-selectors-when-available"></a>

#### 셀렉터 기준 범위 지정하여 대기하기

특정 셀렉터와 일치하는 요소가 나타날 때까지 기다린 뒤 그 요소를 제어하고 싶을 때가 있습니다. 예를 들어, 모달 창이 나타난 뒤 그 안의 "OK" 버튼을 클릭하고 싶은 경우입니다. 이를 위해 `whenAvailable` 메서드를 사용할 수 있습니다. 해당 클로저 안에서 수행하는 모든 요소 조작은 처음 지정한 셀렉터 기준으로 범위가 지정됩니다.

```php
$browser->whenAvailable('.modal', function (Browser $modal) {
    $modal->assertSee('Hello World')
        ->press('OK');
});
```

<a name="waiting-for-text"></a>
#### 텍스트 대기

`waitForText` 메서드를 사용하면, 지정한 텍스트가 페이지에 표시될 때까지 기다릴 수 있습니다.

```php
// 최대 5초 동안 해당 텍스트가 나타날 때까지 대기...
$browser->waitForText('Hello World');

// 최대 1초 동안 해당 텍스트가 나타날 때까지 대기...
$browser->waitForText('Hello World', 1);
```

페이지에서 표시된 텍스트가 사라질 때까지 기다릴 때는 `waitUntilMissingText` 메서드를 사용할 수 있습니다.

```php
// 최대 5초 동안 해당 텍스트가 사라질 때까지 대기...
$browser->waitUntilMissingText('Hello World');

// 최대 1초 동안 해당 텍스트가 사라질 때까지 대기...
$browser->waitUntilMissingText('Hello World', 1);
```

<a name="waiting-for-links"></a>
#### 링크 대기

`waitForLink` 메서드를 사용하면, 지정한 링크 텍스트가 페이지에 표시될 때까지 기다릴 수 있습니다.

```php
// 최대 5초 동안 해당 링크가 나타날 때까지 대기...
$browser->waitForLink('Create');

// 최대 1초 동안 해당 링크가 나타날 때까지 대기...
$browser->waitForLink('Create', 1);
```

<a name="waiting-for-inputs"></a>
#### 입력 필드 대기

`waitForInput` 메서드는 지정한 입력 필드가 페이지에 표시될 때까지 기다릴 때 사용할 수 있습니다.

```php
// 최대 5초 동안 해당 입력 필드가 나타날 때까지 대기...
$browser->waitForInput($field);

// 최대 1초 동안 해당 입력 필드가 나타날 때까지 대기...
$browser->waitForInput($field, 1);
```

<a name="waiting-on-the-page-location"></a>
#### 페이지 위치 대기

`$browser->assertPathIs('/home')`와 같은 경로(패스) 어서션(assertion)은 `window.location.pathname`이 비동기로 업데이트되는 경우 실패할 수 있습니다. 이럴 때는 `waitForLocation` 메서드를 사용해서 위치가 특정 값이 되는 것을 기다릴 수 있습니다.

```php
$browser->waitForLocation('/secret');
```

`waitForLocation` 메서드는 현재 창의 위치가 완전한 URL이 될 때까지 기다릴 수도 있습니다.

```php
$browser->waitForLocation('https://example.com/path');
```

[named route](/docs/12.x/routing#named-routes)의 위치가 될 때까지 대기할 수도 있습니다.

```php
$browser->waitForRoute($routeName, $parameters);
```

<a name="waiting-for-page-reloads"></a>
#### 페이지 새로고침 대기

특정 동작 후 페이지가 새로고침되기를 기다려야 할 경우 `waitForReload` 메서드를 사용합니다.

```php
use Laravel\Dusk\Browser;

$browser->waitForReload(function (Browser $browser) {
    $browser->press('Submit');
})
->assertSee('Success!');
```

주로 버튼 클릭 후 페이지를 새로고침해야 할 때가 많으므로, 더 편리하게 사용할 수 있도록 `clickAndWaitForReload` 메서드가 제공됩니다.

```php
$browser->clickAndWaitForReload('.selector')
    ->assertSee('something');
```

<a name="waiting-on-javascript-expressions"></a>
#### 자바스크립트 표현식 대기

테스트 실행을 중지하고, 특정 자바스크립트 표현식이 `true`가 될 때까지 기다려야 할 경우가 있습니다. 이럴 때는 `waitUntil` 메서드를 활용할 수 있습니다. 이 메서드에 식을 넘길 때는, `return` 키워드나 세미콜론(;)을 붙일 필요가 없습니다.

```php
// 해당 식이 true가 될 때까지 최대 5초 대기...
$browser->waitUntil('App.data.servers.length > 0');

// 해당 식이 true가 될 때까지 최대 1초 대기...
$browser->waitUntil('App.data.servers.length > 0', 1);
```

<a name="waiting-on-vue-expressions"></a>
#### Vue 표현식 대기

`waitUntilVue`, `waitUntilVueIsNot` 메서드는 [Vue 컴포넌트](https://vuejs.org)의 속성이 특정 값을 가질 때까지 기다릴 수 있습니다.

```php
// 컴포넌트 속성이 해당 값을 포함할 때까지 대기...
$browser->waitUntilVue('user.name', 'Taylor', '@user');

// 컴포넌트 속성이 해당 값을 포함하지 않을 때까지 대기...
$browser->waitUntilVueIsNot('user.name', null, '@user');
```

<a name="waiting-for-javascript-events"></a>
#### 자바스크립트 이벤트 대기

`waitForEvent` 메서드를 이용하면 특정 자바스크립트 이벤트가 발생할 때까지 테스트 실행을 일시 정지할 수 있습니다.

```php
$browser->waitForEvent('load');
```

이벤트 리스너는 기본적으로 `body` 요소(현재 범위)에 연결됩니다. 범위가 지정된 셀렉터를 사용할 경우, 해당 요소에 이벤트 리스너가 연결됩니다.

```php
$browser->with('iframe', function (Browser $iframe) {
    // iframe의 load 이벤트를 대기
    $iframe->waitForEvent('load');
});
```

또한, `waitForEvent` 메서드의 두 번째 인자로 셀렉터를 넘기면, 원하는 요소에 이벤트 리스너를 연결할 수 있습니다.

```php
$browser->waitForEvent('load', '.selector');
```

`document` 및 `window` 객체에서의 이벤트도 대기할 수 있습니다.

```php
// document가 스크롤될 때까지 대기...
$browser->waitForEvent('scroll', 'document');

// window 크기가 조정될 때까지 최대 5초 대기...
$browser->waitForEvent('resize', 'window', 5);
```

<a name="waiting-with-a-callback"></a>
#### 콜백과 함께 대기

Dusk의 많은 "대기(wait)" 메서드는 내부적으로 `waitUsing` 메서드에 의존합니다. 이 메서드를 직접 사용하여, 지정한 클로저가 `true`를 반환할 때까지 기다릴 수 있습니다. `waitUsing` 메서드는 대기할 최대 초(second), 클로저를 평가할 간격(초), 클로저, 실패했을 때 사용할 메시지(옵션)를 인자로 받습니다.

```php
$browser->waitUsing(10, 1, function () use ($something) {
    return $something->isReady();
}, "Something wasn't ready in time.");
```

<a name="scrolling-an-element-into-view"></a>
### 요소를 화면에 스크롤해서 보이게 하기

어떤 요소가 브라우저의 보이는 영역 밖에 있어서 클릭이 불가능할 때가 있습니다. 이럴 때는 `scrollIntoView` 메서드를 사용하여, 해당 셀렉터에 위치한 요소가 화면에 나타날 때까지 스크롤할 수 있습니다.

```php
$browser->scrollIntoView('.selector')
    ->click('.selector');
```

<a name="available-assertions"></a>
## 사용 가능한 어서션

Dusk는 애플리케이션에 대해 사용할 수 있는 다양한 어서션(assertion)을 제공합니다. 모든 어서션 목록은 아래에 정리되어 있습니다.



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
[assertPathEndsWith](#assert-path-ends-with)
[assertPathContains](#assert-path-contains)
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
[assertAttributeMissing](#assert-attribute-missing)
[assertAttributeContains](#assert-attribute-contains)
[assertAttributeDoesntContain](#assert-attribute-doesnt-contain)
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
[assertVueDoesntContain](#assert-vue-doesnt-contain)

</div>

<a name="assert-title"></a>
#### assertTitle

페이지의 제목(title)이 지정한 텍스트와 일치하는지 확인합니다.

```php
$browser->assertTitle($title);
```

<a name="assert-title-contains"></a>
#### assertTitleContains

페이지의 제목(title)에 지정한 텍스트가 포함되어 있는지 확인합니다.

```php
$browser->assertTitleContains($title);
```

<a name="assert-url-is"></a>
#### assertUrlIs

현재 URL(쿼리 문자열 제외)이 지정한 문자열과 일치하는지 확인합니다.

```php
$browser->assertUrlIs($url);
```

<a name="assert-scheme-is"></a>
#### assertSchemeIs

현재 URL의 스킴(scheme)이 지정한 스킴과 일치하는지 확인합니다.

```php
$browser->assertSchemeIs($scheme);
```

<a name="assert-scheme-is-not"></a>
#### assertSchemeIsNot

현재 URL의 스킴(scheme)이 지정한 스킴과 일치하지 않는지 확인합니다.

```php
$browser->assertSchemeIsNot($scheme);
```

<a name="assert-host-is"></a>
#### assertHostIs

현재 URL의 호스트(host)가 지정한 호스트와 일치하는지 확인합니다.

```php
$browser->assertHostIs($host);
```

<a name="assert-host-is-not"></a>
#### assertHostIsNot

현재 URL의 호스트(host)가 지정한 호스트와 일치하지 않는지 확인합니다.

```php
$browser->assertHostIsNot($host);
```

<a name="assert-port-is"></a>
#### assertPortIs

현재 URL의 포트(port)가 지정한 포트와 일치하는지 확인합니다.

```php
$browser->assertPortIs($port);
```

<a name="assert-port-is-not"></a>
#### assertPortIsNot

현재 URL의 포트(port)가 지정한 포트와 일치하지 않는지 확인합니다.

```php
$browser->assertPortIsNot($port);
```

<a name="assert-path-begins-with"></a>
#### assertPathBeginsWith

현재 URL 경로(path)가 지정한 경로로 시작하는지 확인합니다.

```php
$browser->assertPathBeginsWith('/home');
```

<a name="assert-path-ends-with"></a>
#### assertPathEndsWith

현재 URL 경로(path)가 지정한 경로로 끝나는지 확인합니다.

```php
$browser->assertPathEndsWith('/home');
```

<a name="assert-path-contains"></a>
#### assertPathContains

현재 URL 경로(path)에 지정한 경로가 포함되어 있는지 확인합니다.

```php
$browser->assertPathContains('/home');
```

<a name="assert-path-is"></a>
#### assertPathIs

현재 경로가 지정한 경로와 일치하는지 확인합니다.

```php
$browser->assertPathIs('/home');
```

<a name="assert-path-is-not"></a>
#### assertPathIsNot

현재 경로가 지정한 경로와 일치하지 않는지 확인합니다.

```php
$browser->assertPathIsNot('/home');
```

<a name="assert-route-is"></a>
#### assertRouteIs

현재 URL이 지정한 [네임드 라우트](/docs/12.x/routing#named-routes)의 URL과 일치하는지 확인합니다.

```php
$browser->assertRouteIs($name, $parameters);
```

<a name="assert-query-string-has"></a>
#### assertQueryStringHas

지정한 쿼리 문자열 파라미터가 존재하는지 확인합니다.

```php
$browser->assertQueryStringHas($name);
```

지정한 쿼리 문자열 파라미터가 특정 값을 가지는지 확인합니다.

```php
$browser->assertQueryStringHas($name, $value);
```

<a name="assert-query-string-missing"></a>
#### assertQueryStringMissing

지정한 쿼리 문자열 파라미터가 존재하지 않는지 확인합니다.

```php
$browser->assertQueryStringMissing($name);
```

<a name="assert-fragment-is"></a>
#### assertFragmentIs

URL의 현재 해시(fragment)가 지정한 값과 일치하는지 확인합니다.

```php
$browser->assertFragmentIs('anchor');
```

<a name="assert-fragment-begins-with"></a>
#### assertFragmentBeginsWith

URL의 현재 해시(fragment)가 지정한 값으로 시작하는지 확인합니다.

```php
$browser->assertFragmentBeginsWith('anchor');
```

<a name="assert-fragment-is-not"></a>
#### assertFragmentIsNot

URL의 현재 해시(fragment)가 지정한 값과 일치하지 않는지 확인합니다.

```php
$browser->assertFragmentIsNot('anchor');
```

<a name="assert-has-cookie"></a>
#### assertHasCookie

지정한 암호화된 쿠키가 존재하는지 확인합니다.

```php
$browser->assertHasCookie($name);
```

<a name="assert-has-plain-cookie"></a>
#### assertHasPlainCookie

지정한 암호화되지 않은(plain) 쿠키가 존재하는지 확인합니다.

```php
$browser->assertHasPlainCookie($name);
```

<a name="assert-cookie-missing"></a>
#### assertCookieMissing

지정한 암호화된 쿠키가 존재하지 않는지 확인합니다.

```php
$browser->assertCookieMissing($name);
```

<a name="assert-plain-cookie-missing"></a>
#### assertPlainCookieMissing

지정한 암호화되지 않은(plain) 쿠키가 존재하지 않는지 확인합니다.

```php
$browser->assertPlainCookieMissing($name);
```

<a name="assert-cookie-value"></a>
#### assertCookieValue

암호화된 쿠키가 지정한 값을 가지는지 확인합니다.

```php
$browser->assertCookieValue($name, $value);
```

<a name="assert-plain-cookie-value"></a>
#### assertPlainCookieValue

암호화되지 않은(plain) 쿠키가 지정한 값을 가지는지 확인합니다.

```php
$browser->assertPlainCookieValue($name, $value);
```

<a name="assert-see"></a>
#### assertSee

지정한 텍스트가 페이지에 표시되어 있는지 확인합니다.

```php
$browser->assertSee($text);
```

<a name="assert-dont-see"></a>
#### assertDontSee

지정한 텍스트가 페이지에 표시되어 있지 않은지 확인합니다.

```php
$browser->assertDontSee($text);
```

<a name="assert-see-in"></a>
#### assertSeeIn

지정한 셀렉터 내에 해당 텍스트가 표시되어 있는지 확인합니다.

```php
$browser->assertSeeIn($selector, $text);
```

<a name="assert-dont-see-in"></a>
#### assertDontSeeIn

지정한 셀렉터 내에 해당 텍스트가 표시되어 있지 않은지 확인합니다.

```php
$browser->assertDontSeeIn($selector, $text);
```

<a name="assert-see-anything-in"></a>
#### assertSeeAnythingIn

지정한 셀렉터 내에 어떤 텍스트라도 표시되어 있는지 확인합니다.

```php
$browser->assertSeeAnythingIn($selector);
```

<a name="assert-see-nothing-in"></a>
#### assertSeeNothingIn

지정한 셀렉터 내에 아무 텍스트도 표시되어 있지 않은지 확인합니다.

```php
$browser->assertSeeNothingIn($selector);
```

<a name="assert-script"></a>

#### assertScript

지정한 JavaScript 표현식이 주어진 값으로 평가되는지 확인합니다.

```php
$browser->assertScript('window.isLoaded')
    ->assertScript('document.readyState', 'complete');
```

<a name="assert-source-has"></a>
#### assertSourceHas

주어진 소스 코드가 페이지에 존재하는지 확인합니다.

```php
$browser->assertSourceHas($code);
```

<a name="assert-source-missing"></a>
#### assertSourceMissing

주어진 소스 코드가 페이지에 존재하지 않는지 확인합니다.

```php
$browser->assertSourceMissing($code);
```

<a name="assert-see-link"></a>
#### assertSeeLink

지정한 링크가 페이지에 표시되어 있는지 확인합니다.

```php
$browser->assertSeeLink($linkText);
```

<a name="assert-dont-see-link"></a>
#### assertDontSeeLink

지정한 링크가 페이지에 표시되어 있지 않은지 확인합니다.

```php
$browser->assertDontSeeLink($linkText);
```

<a name="assert-input-value"></a>
#### assertInputValue

지정한 입력 필드에 해당 값이 입력되어 있는지 확인합니다.

```php
$browser->assertInputValue($field, $value);
```

<a name="assert-input-value-is-not"></a>
#### assertInputValueIsNot

지정한 입력 필드에 해당 값이 입력되어 있지 않은지 확인합니다.

```php
$browser->assertInputValueIsNot($field, $value);
```

<a name="assert-checked"></a>
#### assertChecked

지정한 체크박스가 체크되어 있는지 확인합니다.

```php
$browser->assertChecked($field);
```

<a name="assert-not-checked"></a>
#### assertNotChecked

지정한 체크박스가 체크되어 있지 않은지 확인합니다.

```php
$browser->assertNotChecked($field);
```

<a name="assert-indeterminate"></a>
#### assertIndeterminate

지정한 체크박스가 'indeterminate' 상태(불확정 상태)인지 확인합니다.

```php
$browser->assertIndeterminate($field);
```

<a name="assert-radio-selected"></a>
#### assertRadioSelected

지정한 라디오 필드가 선택되어 있는지 확인합니다.

```php
$browser->assertRadioSelected($field, $value);
```

<a name="assert-radio-not-selected"></a>
#### assertRadioNotSelected

지정한 라디오 필드가 선택되어 있지 않은지 확인합니다.

```php
$browser->assertRadioNotSelected($field, $value);
```

<a name="assert-selected"></a>
#### assertSelected

지정한 드롭다운에서 특정 값이 선택되어 있는지 확인합니다.

```php
$browser->assertSelected($field, $value);
```

<a name="assert-not-selected"></a>
#### assertNotSelected

지정한 드롭다운에서 특정 값이 선택되어 있지 않은지 확인합니다.

```php
$browser->assertNotSelected($field, $value);
```

<a name="assert-select-has-options"></a>
#### assertSelectHasOptions

지정한 값들의 배열이 드롭다운에서 선택 가능한 옵션으로 존재하는지 확인합니다.

```php
$browser->assertSelectHasOptions($field, $values);
```

<a name="assert-select-missing-options"></a>
#### assertSelectMissingOptions

지정한 값들의 배열이 드롭다운에서 선택 가능한 옵션으로 존재하지 않는지 확인합니다.

```php
$browser->assertSelectMissingOptions($field, $values);
```

<a name="assert-select-has-option"></a>
#### assertSelectHasOption

지정한 값이 해당 필드의 선택 옵션으로 존재하는지 확인합니다.

```php
$browser->assertSelectHasOption($field, $value);
```

<a name="assert-select-missing-option"></a>
#### assertSelectMissingOption

지정한 값이 선택 옵션에 없는지 확인합니다.

```php
$browser->assertSelectMissingOption($field, $value);
```

<a name="assert-value"></a>
#### assertValue

지정한 셀렉터에 해당하는 요소가 주어진 값을 가지고 있는지 확인합니다.

```php
$browser->assertValue($selector, $value);
```

<a name="assert-value-is-not"></a>
#### assertValueIsNot

지정한 셀렉터에 해당하는 요소가 주어진 값을 가지고 있지 않은지 확인합니다.

```php
$browser->assertValueIsNot($selector, $value);
```

<a name="assert-attribute"></a>
#### assertAttribute

지정한 셀렉터에 해당하는 요소의 특정 속성(attribute)이 주어진 값을 가지는지 확인합니다.

```php
$browser->assertAttribute($selector, $attribute, $value);
```

<a name="assert-attribute-missing"></a>
#### assertAttributeMissing

지정한 셀렉터에 해당하는 요소에 특정 속성(attribute)이 없는지 확인합니다.

```php
$browser->assertAttributeMissing($selector, $attribute);
```

<a name="assert-attribute-contains"></a>
#### assertAttributeContains

지정한 셀렉터에 해당하는 요소의 특정 속성(attribute)이 주어진 값을 포함하는지 확인합니다.

```php
$browser->assertAttributeContains($selector, $attribute, $value);
```

<a name="assert-attribute-doesnt-contain"></a>
#### assertAttributeDoesntContain

지정한 셀렉터에 해당하는 요소의 특정 속성(attribute)이 주어진 값을 포함하지 않는지 확인합니다.

```php
$browser->assertAttributeDoesntContain($selector, $attribute, $value);
```

<a name="assert-aria-attribute"></a>
#### assertAriaAttribute

지정한 셀렉터에 해당하는 요소의 aria 속성이 주어진 값을 가지는지 확인합니다.

```php
$browser->assertAriaAttribute($selector, $attribute, $value);
```

예를 들어, `<button aria-label="Add"></button>` 마크업이 있다면, 아래와 같이 `aria-label` 속성을 확인할 수 있습니다.

```php
$browser->assertAriaAttribute('button', 'label', 'Add')
```

<a name="assert-data-attribute"></a>
#### assertDataAttribute

지정한 셀렉터에 해당하는 요소의 data 속성이 주어진 값을 가지는지 확인합니다.

```php
$browser->assertDataAttribute($selector, $attribute, $value);
```

예를 들어, `<tr id="row-1" data-content="attendees"></tr>` 마크업에서 `data-label` 속성을 아래와 같이 확인할 수 있습니다.

```php
$browser->assertDataAttribute('#row-1', 'content', 'attendees')
```

<a name="assert-visible"></a>
#### assertVisible

지정한 셀렉터에 해당하는 요소가 보이는지(visible) 확인합니다.

```php
$browser->assertVisible($selector);
```

<a name="assert-present"></a>
#### assertPresent

지정한 셀렉터에 해당하는 요소가 소스에 존재하는지 확인합니다.

```php
$browser->assertPresent($selector);
```

<a name="assert-not-present"></a>
#### assertNotPresent

지정한 셀렉터에 해당하는 요소가 소스에 존재하지 않는지 확인합니다.

```php
$browser->assertNotPresent($selector);
```

<a name="assert-missing"></a>
#### assertMissing

지정한 셀렉터에 해당하는 요소가 화면에 보이지 않는지 확인합니다.

```php
$browser->assertMissing($selector);
```

<a name="assert-input-present"></a>
#### assertInputPresent

지정한 이름을 가진 input이 존재하는지 확인합니다.

```php
$browser->assertInputPresent($name);
```

<a name="assert-input-missing"></a>
#### assertInputMissing

지정한 이름을 가진 input이 소스에 존재하지 않는지 확인합니다.

```php
$browser->assertInputMissing($name);
```

<a name="assert-dialog-opened"></a>
#### assertDialogOpened

지정한 메시지를 가진 JavaScript 다이얼로그가 열렸는지 확인합니다.

```php
$browser->assertDialogOpened($message);
```

<a name="assert-enabled"></a>
#### assertEnabled

지정한 필드가 활성화되어 있는지(enabled) 확인합니다.

```php
$browser->assertEnabled($field);
```

<a name="assert-disabled"></a>
#### assertDisabled

지정한 필드가 비활성화되어 있는지(disabled) 확인합니다.

```php
$browser->assertDisabled($field);
```

<a name="assert-button-enabled"></a>
#### assertButtonEnabled

지정한 버튼이 활성화되어 있는지 확인합니다.

```php
$browser->assertButtonEnabled($button);
```

<a name="assert-button-disabled"></a>
#### assertButtonDisabled

지정한 버튼이 비활성화되어 있는지 확인합니다.

```php
$browser->assertButtonDisabled($button);
```

<a name="assert-focused"></a>
#### assertFocused

지정한 필드에 포커스가 있는지 확인합니다.

```php
$browser->assertFocused($field);
```

<a name="assert-not-focused"></a>
#### assertNotFocused

지정한 필드에 포커스가 없는지 확인합니다.

```php
$browser->assertNotFocused($field);
```

<a name="assert-authenticated"></a>
#### assertAuthenticated

사용자가 인증(authenticated)되어 있는지 확인합니다.

```php
$browser->assertAuthenticated();
```

<a name="assert-guest"></a>
#### assertGuest

사용자가 인증되어 있지 않은 상태(guest)인지 확인합니다.

```php
$browser->assertGuest();
```

<a name="assert-authenticated-as"></a>
#### assertAuthenticatedAs

지정한 사용자로 인증되어 있는지 확인합니다.

```php
$browser->assertAuthenticatedAs($user);
```

<a name="assert-vue"></a>
#### assertVue

Dusk는 [Vue 컴포넌트](https://vuejs.org) 데이터의 상태에 대해서도 assert할 수 있습니다. 예를 들어, 여러분의 애플리케이션에 아래와 같은 Vue 컴포넌트가 있다고 가정해봅니다.

```
// HTML...

<profile dusk="profile-component"></profile>

// 컴포넌트 정의...

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

이렇게 정의된 Vue 컴포넌트에 대해 아래와 같이 상태를 확인할 수 있습니다.

```php tab=Pest
test('vue', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
            ->assertVue('user.name', 'Taylor', '@profile-component');
    });
});
```

```php tab=PHPUnit
/**
 * 기본적인 Vue 테스트 예시입니다.
 */
public function test_vue(): void
{
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
            ->assertVue('user.name', 'Taylor', '@profile-component');
    });
}
```

<a name="assert-vue-is-not"></a>
#### assertVueIsNot

지정한 Vue 컴포넌트의 데이터 속성이 특정 값과 일치하지 않는지 확인합니다.

```php
$browser->assertVueIsNot($property, $value, $componentSelector = null);
```

<a name="assert-vue-contains"></a>
#### assertVueContains

지정한 Vue 컴포넌트 데이터 속성이 배열이고 주어진 값이 포함되어 있는지 확인합니다.

```php
$browser->assertVueContains($property, $value, $componentSelector = null);
```

<a name="assert-vue-doesnt-contain"></a>
#### assertVueDoesntContain

지정한 Vue 컴포넌트 데이터 속성이 배열이고 주어진 값이 포함되어 있지 않은지 확인합니다.

```php
$browser->assertVueDoesntContain($property, $value, $componentSelector = null);
```

<a name="pages"></a>
## 페이지(Pages)

때로는 테스트에서 여러 복잡한 동작을 순서대로 수행해야 할 수도 있습니다. 이런 경우 테스트가 난해해지고 읽기 어려워질 수 있습니다. Dusk의 페이지(Page) 기능을 사용하면, 각 페이지에 대해 표현력 있는 동작을 정의해두고, 이를 단일 메서드 호출로 수행할 수 있습니다. 또한 페이지별로 애플리케이션에서 자주 사용하는, 또는 특정 페이지에만 해당되는 셀렉터의 단축키도 정의할 수 있습니다.

<a name="generating-pages"></a>
### 페이지 오브젝트 생성

페이지 오브젝트를 생성하려면, `dusk:page` 아티즌 명령어를 실행하십시오. 모든 페이지 오브젝트는 애플리케이션의 `tests/Browser/Pages` 디렉토리에 저장됩니다.

```shell
php artisan dusk:page Login
```

<a name="configuring-pages"></a>
### 페이지 설정

기본적으로 페이지에는 `url`, `assert`, `elements` 세 가지 메서드가 존재합니다. 여기서는 우선 `url`과 `assert` 메서드를 살펴보겠습니다. `elements` 메서드는 아래의 [단축 셀렉터 설명](#shorthand-selectors)에서 더 자세히 다룹니다.

<a name="the-url-method"></a>
#### `url` 메서드

`url` 메서드는 해당 페이지를 나타내는 URL의 경로(path)를 반환해야 합니다. Dusk는 브라우저에서 해당 페이지로 이동할 때 이 경로를 사용합니다.

```php
/**
 * 이 페이지의 URL을 반환합니다.
 */
public function url(): string
{
    return '/login';
}
```

<a name="the-assert-method"></a>
#### `assert` 메서드

`assert` 메서드에서는 현재 브라우저가 정말로 이 페이지에 있는지 확인하는 데 필요한 assert 문을 자유롭게 작성할 수 있습니다. 반드시 이 메서드를 구현해야 하는 것은 아니지만, 필요하다면 원하는 assert를 추가할 수 있습니다. 이 assert들은 페이지로 이동할 때 자동으로 실행됩니다.

```php
/**
 * 브라우저가 이 페이지에 있는지 확인합니다.
 */
public function assert(Browser $browser): void
{
    $browser->assertPathIs($this->url());
}
```

<a name="navigating-to-pages"></a>
### 페이지로 이동하기

페이지를 정의한 후에는, `visit` 메서드를 사용하여 해당 페이지로 이동할 수 있습니다.

```php
use Tests\Browser\Pages\Login;

$browser->visit(new Login);
```

때로는 이미 어떤 페이지에 접근한 이후에, 특정 페이지 오브젝트의 셀렉터와 메서드를 현재 테스트 컨텍스트에 "로드"해야 할 때가 있습니다. 예를 들어, 버튼을 클릭하고 리다이렉트된 후 명시적으로 `visit` 하지 않아도 특정 페이지의 동작을 쓸 수 있어야 할 때가 있습니다. 이런 상황에서는 `on` 메서드를 사용해 페이지 오브젝트를 로드할 수 있습니다.

```php
use Tests\Browser\Pages\CreatePlaylist;

$browser->visit('/dashboard')
    ->clickLink('Create Playlist')
    ->on(new CreatePlaylist)
    ->assertSee('@create');
```

<a name="shorthand-selectors"></a>
### 단축 셀렉터(Shorthand Selectors)

페이지 클래스의 `elements` 메서드를 사용하면, 페이지 내의 특정 CSS 셀렉터에 대해 기억하기 쉽고 빠르게 사용할 수 있는 단축키를 정의할 수 있습니다. 예를 들어, 로그인 페이지의 "email" 입력 필드에 대한 단축키를 다음과 같이 정의할 수 있습니다.

```php
/**
 * 이 페이지의 요소(Element) 단축키들을 반환합니다.
 *
 * @return array<string, string>
 */
public function elements(): array
{
    return [
        '@email' => 'input[name=email]',
    ];
}
```

이렇게 단축키를 정의한 이후에는, 평소 CSS 셀렉터를 사용할 수 있는 곳 어디서든 이 단축 셀렉터를 사용할 수 있습니다.

```php
$browser->type('@email', 'taylor@laravel.com');
```

<a name="global-shorthand-selectors"></a>

#### 글로벌 단축 셀렉터

Dusk를 설치하면, 기본 `Page` 클래스가 `tests/Browser/Pages` 디렉터리에 생성됩니다. 이 클래스는 `siteElements` 메서드를 포함하고 있으며, 이를 사용하여 애플리케이션 내 모든 페이지에서 사용할 수 있는 글로벌 단축 셀렉터를 정의할 수 있습니다.

```php
/**
 * 사이트의 글로벌 엘리먼트 단축키를 반환합니다.
 *
 * @return array<string, string>
 */
public static function siteElements(): array
{
    return [
        '@element' => '#selector',
    ];
}
```

<a name="page-methods"></a>
### 페이지 메서드

페이지에 기본적으로 정의된 메서드 외에도, 테스트 전반에서 사용할 추가 메서드를 직접 정의할 수 있습니다. 예를 들어, 음악 관리 애플리케이션을 구축한다고 가정해봅시다. 이 애플리케이션의 한 페이지에서 자주 사용되는 동작으로 플레이리스트를 생성하는 작업이 있을 수 있습니다. 테스트마다 반복해서 플레이리스트 생성 로직을 작성하는 대신, 페이지 클래스에 `createPlaylist` 메서드를 정의할 수 있습니다.

```php
<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;
use Laravel\Dusk\Page;

class Dashboard extends Page
{
    // 다른 페이지 메서드...

    /**
     * 새로운 플레이리스트를 생성합니다.
     */
    public function createPlaylist(Browser $browser, string $name): void
    {
        $browser->type('name', $name)
            ->check('share')
            ->press('Create Playlist');
    }
}
```

이렇게 메서드를 정의한 뒤에는 해당 페이지를 사용하는 모든 테스트에서 쉽게 활용할 수 있습니다. 커스텀 페이지 메서드를 사용하면 브라우저 인스턴스가 첫 번째 인수로 자동 전달됩니다.

```php
use Tests\Browser\Pages\Dashboard;

$browser->visit(new Dashboard)
    ->createPlaylist('My Playlist')
    ->assertSee('My Playlist');
```

<a name="components"></a>
## 컴포넌트

컴포넌트는 Dusk의 “페이지 오브젝트”와 유사하지만, 네비게이션 바나 알림 창 같은 UI 및 기능을 여러 곳에서 재사용할 수 있도록 설계되었습니다. 따라서 컴포넌트는 특정 URL에 종속되지 않습니다.

<a name="generating-components"></a>
### 컴포넌트 생성하기

컴포넌트를 생성하려면 `dusk:component` Artisan 명령어를 실행합니다. 새로 생성된 컴포넌트 클래스는 `tests/Browser/Components` 디렉터리에 저장됩니다.

```shell
php artisan dusk:component DatePicker
```

위 예시와 같이 “데이트 피커”는 애플리케이션의 다양한 페이지에서 반복적으로 사용될 수 있는 컴포넌트입니다. 여러 테스트에서 날짜를 선택하는 자동화 로직을 매번 작성하는 것은 번거로울 수 있습니다. 대신, 해당 로직을 Dusk 컴포넌트로 정의해두면 컴포넌트 내부에 한 번만 캡슐화해둘 수 있습니다.

```php
<?php

namespace Tests\Browser\Components;

use Laravel\Dusk\Browser;
use Laravel\Dusk\Component as BaseComponent;

class DatePicker extends BaseComponent
{
    /**
     * 컴포넌트의 루트 셀렉터를 반환합니다.
     */
    public function selector(): string
    {
        return '.date-picker';
    }

    /**
     * 브라우저 페이지에 컴포넌트가 있는지 확인합니다.
     */
    public function assert(Browser $browser): void
    {
        $browser->assertVisible($this->selector());
    }

    /**
     * 컴포넌트의 엘리먼트 단축키를 반환합니다.
     *
     * @return array<string, string>
     */
    public function elements(): array
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
     */
    public function selectDate(Browser $browser, int $year, int $month, int $day): void
    {
        $browser->click('@date-field')
            ->within('@year-list', function (Browser $browser) use ($year) {
                $browser->click($year);
            })
            ->within('@month-list', function (Browser $browser) use ($month) {
                $browser->click($month);
            })
            ->within('@day-list', function (Browser $browser) use ($day) {
                $browser->click($day);
            });
    }
}
```

<a name="using-components"></a>
### 컴포넌트 사용하기

컴포넌트를 정의한 뒤에는, 어떤 테스트에서든 데이트 피커에서 날짜를 쉽게 선택할 수 있습니다. 또한, 날짜 선택에 필요한 로직이 변경되어도 컴포넌트만 수정하면 되므로 유지관리가 매우 수월합니다.

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\Browser\Components\DatePicker;

uses(DatabaseMigrations::class);

test('basic example', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
            ->within(new DatePicker, function (Browser $browser) {
                $browser->selectDate(2019, 1, 30);
            })
            ->assertSee('January');
    });
});
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\Browser\Components\DatePicker;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    /**
     * 기본 컴포넌트 테스트 예제입니다.
     */
    public function test_basic_example(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/')
                ->within(new DatePicker, function (Browser $browser) {
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
> 대부분의 Dusk 지속적 통합 환경 설정은 라라벨 애플리케이션이 8000번 포트에서 내장 PHP 개발 서버로 서비스될 것을 예상합니다. 따라서, 계속 진행하기 전에 지속적 통합 환경의 `APP_URL` 환경 변수 값이 `http://127.0.0.1:8000` 으로 설정되어 있는지 반드시 확인해야 합니다.

<a name="running-tests-on-heroku-ci"></a>
### Heroku CI

[Heroku CI](https://www.heroku.com/continuous-integration)에서 Dusk 테스트를 실행하려면, 다음과 같이 Google Chrome 빌드팩과 스크립트를 Heroku `app.json` 파일에 추가합니다.

```json
{
  "environments": {
    "test": {
      "buildpacks": [
        { "url": "heroku/php" },
        { "url": "https://github.com/heroku/heroku-buildpack-chrome-for-testing" }
      ],
      "scripts": {
        "test-setup": "cp .env.testing .env",
        "test": "nohup bash -c './vendor/laravel/dusk/bin/chromedriver-linux --port=9515 > /dev/null 2>&1 &' && nohup bash -c 'php artisan serve --no-reload > /dev/null 2>&1 &' && php artisan dusk"
      }
    }
  }
}
```

<a name="running-tests-on-travis-ci"></a>
### Travis CI

[Travis CI](https://travis-ci.org)에서 Dusk 테스트를 실행하려면, 아래와 같은 `.travis.yml` 설정을 사용하면 됩니다. Travis CI는 그래픽 환경이 아니기 때문에 Chrome 브라우저를 실행하기 위해 몇 가지 추가 작업이 필요합니다. 또한, PHP 내장 웹서버를 실행하려면 `php artisan serve` 명령어를 사용합니다.

```yaml
language: php

php:
  - 8.2

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

[GitHub Actions](https://github.com/features/actions)를 사용하여 Dusk 테스트를 실행하려면, 아래의 설정 파일을 참고하여 시작할 수 있습니다. TravisCI와 마찬가지로, PHP 내장 웹서버를 실행하기 위해 `php artisan serve` 명령어를 사용할 것입니다.

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
      - uses: actions/checkout@v4
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
        run: ./vendor/laravel/dusk/bin/chromedriver-linux --port=9515 &
      - name: Run Laravel Server
        run: php artisan serve --no-reload &
      - name: Run Dusk Tests
        run: php artisan dusk
      - name: Upload Screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: screenshots
          path: tests/Browser/screenshots
      - name: Upload Console Logs
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: console
          path: tests/Browser/console
```

<a name="running-tests-on-chipper-ci"></a>
### Chipper CI

[Chipper CI](https://chipperci.com)에서 Dusk 테스트를 실행하려면, 아래 예시처럼 설정 파일을 참고할 수 있습니다. 라라벨을 실행하기 위해 PHP 내장 서버를 사용합니다.

```yaml
# file .chipperci.yml
version: 1

environment:
  php: 8.2
  node: 16

# 빌드 환경에 Chrome 포함
services:
  - dusk

# 모든 커밋 빌드
on:
   push:
      branches: .*

pipeline:
  - name: Setup
    cmd: |
      cp -v .env.example .env
      composer install --no-interaction --prefer-dist --optimize-autoloader
      php artisan key:generate

      # Dusk 전용 환경파일 생성 및 APP_URL에 BUILD_HOST 반영
      cp -v .env .env.dusk.ci
      sed -i "s@APP_URL=.*@APP_URL=http://$BUILD_HOST:8000@g" .env.dusk.ci

  - name: Compile Assets
    cmd: |
      npm ci --no-audit
      npm run build

  - name: Browser Tests
    cmd: |
      php -S [::0]:8000 -t public 2>server.log &
      sleep 2
      php artisan dusk:chrome-driver $CHROME_DRIVER
      php artisan dusk --env=ci
```

Chipper CI에서 Dusk 테스트 실행과 데이터베이스 사용 방법 등 자세한 사항은 [공식 Chipper CI 문서](https://chipperci.com/docs/testing/laravel-dusk-new/)를 참고하시기 바랍니다.