# 라라벨 더스크 (Laravel Dusk)

- [소개](#introduction)
- [설치](#installation)
    - [ChromeDriver 설치 관리](#managing-chromedriver-installations)
    - [다른 브라우저 사용하기](#using-other-browsers)
- [시작하기](#getting-started)
    - [테스트 생성하기](#generating-tests)
    - [각 테스트 후 데이터베이스 초기화](#resetting-the-database-after-each-test)
    - [테스트 실행하기](#running-tests)
    - [환경 설정](#environment-handling)
- [브라우저 기초](#browser-basics)
    - [브라우저 인스턴스 생성하기](#creating-browsers)
    - [네비게이션](#navigation)
    - [브라우저 창 크기 조절](#resizing-browser-windows)
    - [브라우저 매크로](#browser-macros)
    - [인증](#authentication)
    - [쿠키](#cookies)
    - [JavaScript 실행](#executing-javascript)
    - [스크린샷 찍기](#taking-a-screenshot)
    - [콘솔 출력 파일로 저장하기](#storing-console-output-to-disk)
    - [페이지 소스 파일로 저장하기](#storing-page-source-to-disk)
- [요소와 상호작용하기](#interacting-with-elements)
    - [Dusk 셀렉터](#dusk-selectors)
    - [텍스트, 값, 속성](#text-values-and-attributes)
    - [폼과 상호작용하기](#interacting-with-forms)
    - [파일 첨부하기](#attaching-files)
    - [버튼 누르기](#pressing-buttons)
    - [링크 클릭하기](#clicking-links)
    - [키보드 사용하기](#using-the-keyboard)
    - [마우스 사용하기](#using-the-mouse)
    - [JavaScript 다이얼로그](#javascript-dialogs)
    - [인라인 프레임과 상호작용하기](#interacting-with-iframes)
    - [셀렉터 범위 지정](#scoping-selectors)
    - [요소 대기하기](#waiting-for-elements)
    - [요소를 화면에 스크롤하기](#scrolling-an-element-into-view)
- [사용 가능한 Assertion](#available-assertions)
- [페이지](#pages)
    - [페이지 생성하기](#generating-pages)
    - [페이지 설정하기](#configuring-pages)
    - [페이지로 이동하기](#navigating-to-pages)
    - [축약 셀렉터](#shorthand-selectors)
    - [페이지 메서드](#page-methods)
- [컴포넌트](#components)
    - [컴포넌트 생성하기](#generating-components)
    - [컴포넌트 사용하기](#using-components)
- [지속적 통합(Continuous Integration)](#continuous-integration)
    - [Heroku CI](#running-tests-on-heroku-ci)
    - [Travis CI](#running-tests-on-travis-ci)
    - [GitHub Actions](#running-tests-on-github-actions)
    - [Chipper CI](#running-tests-on-chipper-ci)

<a name="introduction"></a>
## 소개

[Laravel Dusk](https://github.com/laravel/dusk)는 직관적이고 사용하기 쉬운 브라우저 자동화 및 테스트 API를 제공합니다. 기본적으로 Dusk는 로컬 컴퓨터에 JDK나 Selenium을 따로 설치할 필요가 없습니다. 대신 Dusk는 독립 실행형 [ChromeDriver](https://sites.google.com/chromium.org/driver)를 사용합니다. 하지만, 원하는 경우 Selenium과 호환되는 다른 드라이버도 자유롭게 사용할 수 있습니다.

<a name="installation"></a>
## 설치

시작하려면 [Google Chrome](https://www.google.com/chrome)을 설치하고, 프로젝트에 `laravel/dusk` Composer 의존성을 추가합니다:

```shell
composer require laravel/dusk --dev
```

> [!WARNING]
> Dusk의 서비스 프로바이더를 직접 등록하는 경우, **절대로** 운영 환경에서는 등록하지 않아야 합니다. 만약 운영 환경에서 등록한다면, 임의의 사용자가 애플리케이션에 인증할 수 있는 보안상 심각한 문제가 발생할 수 있습니다.

Dusk 패키지를 설치한 후에는 `dusk:install` 아티즌 명령어를 실행합니다. `dusk:install` 명령어는 `tests/Browser` 디렉토리와 예제 Dusk 테스트, 그리고 운영 체제에 맞는 Chrome Driver 바이너리를 설치해줍니다:

```shell
php artisan dusk:install
```

다음으로, 애플리케이션의 `.env` 파일에 `APP_URL` 환경 변수를 설정하세요. 이 값은 브라우저에서 애플리케이션에 접근할 때 사용하는 URL과 동일해야 합니다.

> [!NOTE]
> 로컬 개발 환경을 [Laravel Sail](/docs/10.x/sail)로 관리하는 경우, [Dusk 테스트 설정 및 실행에 대한 Sail 문서](/docs/10.x/sail#laravel-dusk)도 참고하시기 바랍니다.

<a name="managing-chromedriver-installations"></a>
### ChromeDriver 설치 관리

`dusk:install` 명령어로 설치되는 ChromeDriver와는 다른 버전을 사용하고 싶다면, `dusk:chrome-driver` 명령어를 사용할 수 있습니다:

```shell
# 운영체제에 맞는 최신 ChromeDriver 설치...
php artisan dusk:chrome-driver

# 운영체제에 맞는 특정 버전의 ChromeDriver 설치...
php artisan dusk:chrome-driver 86

# 지원되는 모든 OS용 특정 버전 ChromeDriver 설치...
php artisan dusk:chrome-driver --all

# 설치된 Chrome/Chromium 버전에 맞는 ChromeDriver 설치...
php artisan dusk:chrome-driver --detect
```

> [!WARNING]
> Dusk는 `chromedriver` 바이너리가 실행 가능해야 제대로 동작합니다. Dusk 실행에 문제가 있다면 다음 명령어로 바이너리에 실행 권한이 부여되어 있는지 확인하십시오: `chmod -R 0755 vendor/laravel/dusk/bin/`.

<a name="using-other-browsers"></a>
### 다른 브라우저 사용하기

기본적으로 Dusk는 Google Chrome과 독립 실행형 [ChromeDriver](https://sites.google.com/chromium.org/driver)를 사용해 브라우저 테스트를 수행합니다. 하지만 원한다면 직접 Selenium 서버를 실행하여 원하는 브라우저로 테스트를 진행할 수 있습니다.

시작하려면 애플리케이션의 기본 Dusk 테스트 케이스인 `tests/DuskTestCase.php` 파일을 엽니다. 이 파일에서 `startChromeDriver` 메서드 호출을 제거하세요. 이렇게 하면 Dusk가 ChromeDriver를 자동으로 시작하는 동작이 중지됩니다:

```
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

그 다음, `driver` 메서드를 원하는 URL과 포트에 맞게 수정할 수 있습니다. 또한 WebDriver에 전달할 "desired capabilities"도 원하는 대로 바꿀 수 있습니다:

```
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

Dusk 테스트를 새로 생성하려면 `dusk:make` 아티즌 명령어를 사용합니다. 생성된 테스트는 `tests/Browser` 디렉토리에 저장됩니다:

```shell
php artisan dusk:make LoginTest
```

<a name="resetting-the-database-after-each-test"></a>
### 각 테스트 후 데이터베이스 초기화

대부분의 테스트는 애플리케이션 데이터베이스에서 데이터를 조회하는 페이지와 상호작용하게 됩니다. 하지만 Dusk 테스트에서는 `RefreshDatabase` 트레이트를 **절대 사용하면 안 됩니다**. `RefreshDatabase` 트레이트는 데이터베이스 트랜잭션을 활용하는데, 이는 HTTP 요청 간에는 적용되거나 사용할 수 없습니다. 대신, 두 가지 옵션이 있습니다: `DatabaseMigrations` 트레이트와 `DatabaseTruncation` 트레이트입니다.

<a name="reset-migrations"></a>
#### 데이터베이스 마이그레이션 사용하기

`DatabaseMigrations` 트레이트는 각 테스트 전에 데이터베이스 마이그레이션을 실행합니다. 하지만, 각 테스트마다 데이터베이스 테이블을 삭제 후 재생성하는 것은 테이블을 단순히 비우는 것보다 보통 느립니다:

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
> SQLite 메모리 데이터베이스는 Dusk 테스트 실행 시 사용할 수 없습니다. 브라우저는 별도의 프로세스에서 실행되기 때문에, 다른 프로세스의 메모리 데이터베이스에 접근할 수 없습니다.

<a name="reset-truncation"></a>
#### 데이터베이스 테이블 Truncate로 초기화하기

`DatabaseTruncation` 트레이트를 사용하기 전에, Composer 패키지 매니저로 `doctrine/dbal` 패키지를 설치해야 합니다:

```shell
composer require --dev doctrine/dbal
```

`DatabaseTruncation` 트레이트는 첫 번째 테스트에서 데이터베이스를 마이그레이션하여 테이블이 제대로 생성되었는지 확인합니다. 이후의 테스트들에서는 데이터베이스 테이블만 단순히 truncate(비우기)하므로, 모든 마이그레이션을 다시 실행할 때보다 더 빠른 속도를 얻을 수 있습니다:

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

기본적으로 이 트레이트는 `migrations` 테이블을 제외한 모든 테이블을 truncate합니다. truncate 대상 테이블을 직접 지정하고 싶다면 테스트 클래스에 `$tablesToTruncate` 속성을 정의할 수 있습니다:

```
/**
 * Indicates which tables should be truncated.
 *
 * @var array
 */
protected $tablesToTruncate = ['users'];
```

반대로, truncate에서 제외할 테이블을 지정하고 싶다면 `$exceptTables` 속성을 사용할 수 있습니다:

```
/**
 * Indicates which tables should be excluded from truncation.
 *
 * @var array
 */
protected $exceptTables = ['users'];
```

Truncate 대상이 될 데이터베이스 커넥션을 지정하려면 `$connectionsToTruncate` 속성을 정의합니다:

```
/**
 * Indicates which connections should have their tables truncated.
 *
 * @var array
 */
protected $connectionsToTruncate = ['mysql'];
```

데이터베이스 truncate 전후에 코드를 실행하고 싶다면, 테스트 클래스에 `beforeTruncatingDatabase` 또는 `afterTruncatingDatabase` 메서드를 정의할 수 있습니다:

```
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

브라우저 테스트를 실행하려면 `dusk` 아티즌 명령어를 사용합니다:

```shell
php artisan dusk
```

마지막으로 `dusk` 명령어를 실행할 때 테스트가 실패했다면, `dusk:fails` 명령어를 이용해 실패한 테스트만 먼저 빠르게 재실행할 수 있습니다:

```shell
php artisan dusk:fails
```

`dusk` 명령어는 PHPUnit 테스트 러너에서 사용하는 모든 인수를 그대로 지원합니다. 예를 들어, [group](https://docs.phpunit.de/en/10.5/annotations.html#group) 옵션을 사용해 특정 그룹의 테스트만 실행할 수 있습니다:

```shell
php artisan dusk --group=foo
```

> [!NOTE]
> 로컬 개발 환경을 [Laravel Sail](/docs/10.x/sail)로 관리하는 경우, [Dusk 테스트 설정 및 실행에 대한 Sail 문서](/docs/10.x/sail#laravel-dusk)를 참고하시기 바랍니다.

<a name="manually-starting-chromedriver"></a>
#### ChromeDriver 수동 시작

기본적으로 Dusk는 ChromeDriver를 자동으로 시작하려고 시도합니다. 하지만 시스템 환경에 따라 이 방식이 동작하지 않는다면, `dusk` 명령어를 실행하기 전에 ChromeDriver를 수동으로 시작할 수 있습니다. ChromeDriver를 직접 시작하는 경우, `tests/DuskTestCase.php` 파일의 해당 라인을 주석 처리해야 합니다:

```
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

또한 ChromeDriver를 9515번이 아닌 다른 포트에서 시작한 경우, 같은 클래스의 `driver` 메서드에서 포트 번호를 정확하게 반영해야 합니다:

```
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
### 환경 설정

Dusk 테스트 실행 시 별도의 환경 파일을 사용하도록 하려면, 프로젝트 루트에 `.env.dusk.{environment}` 형식의 파일을 만드세요. 예를 들어, `local` 환경에서 `dusk` 명령어를 실행한다면 `.env.dusk.local` 파일을 생성해야 합니다.

테스트를 실행하면 Dusk는 기존의 `.env` 파일을 백업하고, Dusk 환경 파일을 `.env` 이름으로 변경합니다. 테스트가 끝나면 원래의 `.env` 파일로 복원됩니다.

<a name="browser-basics"></a>
## 브라우저 기초

<a name="creating-browsers"></a>
### 브라우저 인스턴스 생성하기

애플리케이션에 로그인할 수 있는지 확인하는 테스트를 예시로 작성해보겠습니다. 테스트를 생성한 뒤, 로그인 페이지로 이동하여 계정 정보를 입력하고 "Login" 버튼을 누르는 과정을 테스트할 수 있습니다. 브라우저 인스턴스를 생성하려면 Dusk 테스트 안에서 `browse` 메서드를 호출하면 됩니다:

```
<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Laravel\Dusk\Chrome;
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

위 예시에서 볼 수 있듯이, `browse` 메서드는 클로저(익명 함수)를 인자로 받습니다. Dusk는 브라우저 인스턴스를 이 클로저에 자동으로 전달하며, 이 객체를 사용해 애플리케이션과 상호작용하거나 결과를 검증할 수 있습니다.

<a name="creating-multiple-browsers"></a>
#### 여러 개의 브라우저 인스턴스 생성

테스트를 제대로 수행하려면 여러 대의 브라우저가 필요한 경우도 있습니다. 예를 들어 웹소켓을 활용한 채팅 화면을 테스트하려면 두 개 이상의 브라우저 인스턴스가 필요할 수 있습니다. 여러 브라우저를 생성하려면, `browse` 메서드에서 클로저에 인자의 개수만 늘려주면 됩니다:

```
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
### 네비게이션

`visit` 메서드를 사용하면 애플리케이션 내에서 특정 URI로 이동할 수 있습니다:

```
$browser->visit('/login');
```

[네임드 라우트](/docs/10.x/routing#named-routes)로 이동하려면 `visitRoute` 메서드를 사용하세요:

```
$browser->visitRoute('login');
```

"뒤로 가기"와 "앞으로 가기"는 `back` 및 `forward` 메서드를 사용합니다:

```
$browser->back();

$browser->forward();
```

페이지를 새로고침하려면 `refresh` 메서드를 사용합니다:

```
$browser->refresh();
```

<a name="resizing-browser-windows"></a>
### 브라우저 창 크기 조절

`resize` 메서드로 브라우저 창의 크기를 조절할 수 있습니다:

```
$browser->resize(1920, 1080);
```

창을 최대화하려면 `maximize` 메서드를 사용하세요:

```
$browser->maximize();
```

`fitContent` 메서드는 브라우저 창 크기를 페이지 내용에 맞도록 자동으로 조절합니다:

```
$browser->fitContent();
```

테스트가 실패하면 Dusk는 스크린샷 촬영 전에 브라우저를 자동으로 컨텐츠 크기에 맞게 조절합니다. 이 기능을 비활성화하고 싶다면 테스트 내에서 `disableFitOnFailure` 메서드를 호출하세요:

```
$browser->disableFitOnFailure();
```

`move` 메서드는 브라우저 창을 화면 내 원하는 위치로 옮깁니다:

```
$browser->move($x = 100, $y = 100);
```

<a name="browser-macros"></a>
### 브라우저 매크로

여러 테스트에서 재사용할 수 있는 커스텀 브라우저 메서드를 만들고 싶다면 `Browser` 클래스의 `macro` 메서드를 사용할 수 있습니다. 일반적으로 이 메서드는 [서비스 프로바이더](/docs/10.x/providers)의 `boot` 메서드에서 호출하는 것이 좋습니다:

```
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

`macro` 함수는 첫 번째 인자로 매크로의 이름, 두 번째 인자로 클로저(함수)를 받습니다. 이 매크로는 `Browser` 인스턴스 메서드로 호출될 때 실행됩니다:

```
$this->browse(function (Browser $browser) use ($user) {
    $browser->visit('/pay')
            ->scrollToElement('#credit-card-details')
            ->assertSee('Enter Credit Card Details');
});
```

<a name="authentication"></a>
### 인증

인증이 필요한 여러 페이지를 테스트해야 할 때가 많습니다. 이럴 땐 테스트마다 로그인 화면을 거치지 않고, Dusk의 `loginAs` 메서드로 바로 인증할 수 있습니다. `loginAs` 메서드는 인증 가능한 모델의 기본키나, 해당 모델의 인스턴스를 받을 수 있습니다:

```
use App\Models\User;
use Laravel\Dusk\Browser;

$this->browse(function (Browser $browser) {
    $browser->loginAs(User::find(1))
          ->visit('/home');
});
```

> [!WARNING]
> `loginAs` 메서드를 사용한 뒤에는, 해당 파일 내 모든 테스트에서 같은 사용자 세션이 유지됩니다.

<a name="cookies"></a>
### 쿠키

암호화된 쿠키 값을 가져오거나 설정하려면 `cookie` 메서드를 사용하십시오. 라라벨이 생성한 모든 쿠키는 기본적으로 암호화됩니다:

```
$browser->cookie('name');

$browser->cookie('name', 'Taylor');
```

암호화되지 않은 쿠키 값을 다루려면 `plainCookie` 메서드를 사용할 수 있습니다:

```
$browser->plainCookie('name');

$browser->plainCookie('name', 'Taylor');
```

지정한 쿠키를 삭제하려면 `deleteCookie` 메서드를 사용하세요:

```
$browser->deleteCookie('name');
```

<a name="executing-javascript"></a>
### JavaScript 실행

`script` 메서드를 사용하면 브라우저 내에서 원하는 JavaScript 명령문을 실행할 수 있습니다:

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

`screenshot` 메서드를 사용하면 스크린샷을 찍어 지정한 파일명으로 저장할 수 있습니다. 모든 스크린샷은 `tests/Browser/screenshots` 디렉토리에 저장됩니다:

```
$browser->screenshot('filename');
```

`responsiveScreenshots` 메서드는 다양한 반응형 구간(breakpoint) 크기별로 연속 스크린샷을 찍을 수 있습니다:

```
$browser->responsiveScreenshots('filename');
```

<a name="storing-console-output-to-disk"></a>

### 콘솔 출력 디스크에 저장하기

`storeConsoleLog` 메서드를 사용하면 현재 브라우저의 콘솔 출력을 주어진 파일명으로 디스크에 저장할 수 있습니다. 콘솔 출력 결과는 `tests/Browser/console` 디렉터리에 저장됩니다.

```
$browser->storeConsoleLog('filename');
```

<a name="storing-page-source-to-disk"></a>
### 페이지 소스 디스크에 저장하기

`storeSource` 메서드를 사용하면 현재 페이지의 소스를 주어진 파일명으로 디스크에 저장할 수 있습니다. 페이지 소스는 `tests/Browser/source` 디렉터리에 저장됩니다.

```
$browser->storeSource('filename');
```

<a name="interacting-with-elements"></a>
## 요소와 상호작용하기

<a name="dusk-selectors"></a>
### Dusk 선택자

Dusk 테스트를 작성할 때 요소와 상호작용하기 위한 좋은 CSS 선택자를 결정하는 것은 가장 어려운 부분 중 하나입니다. 시간이 지나면서 프론트엔드가 변경되면 아래와 같은 CSS 선택자로 작성한 테스트가 쉽게 깨질 수 있습니다.

```
// HTML...

<button>Login</button>

// Test...

$browser->click('.login-page .container div > button');
```

Dusk 선택자를 사용하면 CSS 선택자 기억에 신경 쓰기보다 효과적인 테스트 자체에 집중할 수 있습니다. 선택자를 정의하려면 HTML 요소에 `dusk` 속성을 추가하면 됩니다. 그리고 Dusk 브라우저에서 상호작용 시 선택자 앞에 `@`를 붙여 테스트 내에서 해당 요소를 제어할 수 있습니다.

```
// HTML...

<button dusk="login-button">Login</button>

// Test...

$browser->click('@login-button');
```

필요하다면 Dusk에서 사용할 HTML 속성을 `selectorHtmlAttribute` 메서드를 통해 커스터마이즈할 수 있습니다. 이 메서드는 일반적으로 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 호출합니다.

```
use Laravel\Dusk\Dusk;

Dusk::selectorHtmlAttribute('data-dusk');
```

<a name="text-values-and-attributes"></a>
### 텍스트, 값, 속성 다루기

<a name="retrieving-setting-values"></a>
#### 값 조회 및 설정

Dusk에서는 페이지 내 요소의 현재 값, 표시 텍스트, 속성 등에 상호작용할 수 있는 여러 메서드를 제공합니다. 예를 들어, 특정 CSS 또는 Dusk 선택자와 일치하는 요소의 "value"를 얻으려면 `value` 메서드를 사용합니다.

```
// 값 조회...
$value = $browser->value('selector');

// 값 설정...
$browser->value('selector', 'value');
```

입력 요소 중 지정한 필드 네임을 가진 input 요소의 "value"를 얻으려면 `inputValue` 메서드를 사용할 수 있습니다.

```
$value = $browser->inputValue('field');
```

<a name="retrieving-text"></a>
#### 텍스트 조회

`text` 메서드를 사용하면 지정한 선택자와 일치하는 요소의 표시 텍스트를 가져올 수 있습니다.

```
$text = $browser->text('selector');
```

<a name="retrieving-attributes"></a>
#### 속성 조회

마지막으로, `attribute` 메서드를 통해 지정한 선택자와 일치하는 요소의 속성 값을 가져올 수 있습니다.

```
$attribute = $browser->attribute('selector', 'value');
```

<a name="interacting-with-forms"></a>
### 폼과 상호작용하기

<a name="typing-values"></a>
#### 값 입력하기

Dusk는 폼 및 입력 요소를 다루기 위한 다양한 메서드를 제공합니다. 먼저, 입력 필드에 텍스트를 입력하는 간단한 예제를 살펴보겠습니다.

```
$browser->type('email', 'taylor@laravel.com');
```

여기서 주의할 점은, 필요하다면 CSS 선택자를 전달할 수 있지만, 반드시 넘겨줄 필요는 없다는 것입니다. CSS 선택자를 생략하면 Dusk가 해당 `name` 속성을 가지는 `input`이나 `textarea` 필드를 자동으로 찾습니다.

필드의 내용을 지우지 않고 텍스트를 추가하려면 `append` 메서드를 사용할 수 있습니다.

```
$browser->type('tags', 'foo')
        ->append('tags', ', bar, baz');
```

`clear` 메서드를 이용해 입력값을 비울 수도 있습니다.

```
$browser->clear('email');
```

Dusk가 텍스트를 천천히 입력하도록 하려면 `typeSlowly` 메서드를 사용할 수 있습니다. 기본적으로 입력할 때 키를 누를 때마다 100밀리초의 지연이 적용됩니다. 이 시간은 메서드의 세 번째 인자로 원하는 밀리초 단위를 넘겨서 커스터마이즈 할 수 있습니다.

```
$browser->typeSlowly('mobile', '+1 (202) 555-5555');

$browser->typeSlowly('mobile', '+1 (202) 555-5555', 300);
```

`appendSlowly` 메서드를 이용해 텍스트를 천천히 추가할 수도 있습니다.

```
$browser->type('tags', 'foo')
        ->appendSlowly('tags', ', bar, baz');
```

<a name="dropdowns"></a>
#### 드롭다운(선택 상자) 다루기

`select` 요소에서 값을 선택하려면 `select` 메서드를 사용합니다. `type` 메서드와 마찬가지로, 전체 CSS 선택자를 입력하지 않아도 됩니다. 값을 전달할 때는, 표시되는 텍스트가 아니라 실제 `option`의 value 값을 넘겨야 합니다.

```
$browser->select('size', 'Large');
```

두 번째 인자를 생략하면 임의로 하나의 옵션이 선택됩니다.

```
$browser->select('size');
```

배열을 두 번째 인자로 넘기면, 여러 값을 동시에 선택할 수 있습니다.

```
$browser->select('categories', ['Art', 'Music']);
```

<a name="checkboxes"></a>
#### 체크박스

체크박스 입력란을 "체크"하려면 `check` 메서드를 사용합니다. 다른 입력 관련 메서드들과 마찬가지로, 전체 CSS 선택자 입력은 필수가 아닙니다. CSS 선택자와 일치하는 것이 없으면 Dusk는 해당 이름(`name` 속성)을 가진 체크박스를 찾습니다.

```
$browser->check('terms');
```

체크박스의 체크를 해제하려면 `uncheck` 메서드를 사용합니다.

```
$browser->uncheck('terms');
```

<a name="radio-buttons"></a>
#### 라디오 버튼

`radio` 입력 항목을 선택하려면 `radio` 메서드를 사용합니다. 마찬가지로 전체 CSS 선택자를 입력할 필요는 없습니다. 일치하는 CSS 선택자가 없으면 Dusk가 `name`, `value` 속성이 일치하는 radio 입력을 찾아줍니다.

```
$browser->radio('size', 'large');
```

<a name="attaching-files"></a>
### 파일 첨부

`attach` 메서드는 `file` 입력 요소에 파일을 첨부할 때 사용합니다. 다른 입력 관련 메서드들과 마찬가지로 전체 CSS 선택자를 반드시 전달할 필요는 없습니다. CSS 선택자로 일치하는 것이 없으면 Dusk는 해당 이름의 `file` 입력 요소를 찾습니다.

```
$browser->attach('photo', __DIR__.'/photos/mountains.png');
```

> [!WARNING]
> 파일 첨부 기능을 사용하려면 서버에 `Zip` PHP 확장 모듈이 반드시 설치 및 활성화되어 있어야 합니다.

<a name="pressing-buttons"></a>
### 버튼 클릭하기

`press` 메서드를 사용하면 페이지에 있는 버튼 요소를 클릭할 수 있습니다. 인자로 버튼의 표시 텍스트 또는 CSS/Dusk 선택자를 전달할 수 있습니다.

```
$browser->press('Login');
```

폼 전송 시, 많은 애플리케이션에서는 전송 버튼을 눌렀을 때 버튼을 잠시 비활성화했다가, HTTP 전송이 끝나면 다시 활성화하기도 합니다. 버튼을 클릭한 뒤 해당 버튼이 다시 활성화될 때까지 기다리려면 `pressAndWaitFor` 메서드를 사용할 수 있습니다.

```
// 버튼을 누르고, 최대 5초 동안 활성화될 때까지 기다립니다.
$browser->pressAndWaitFor('Save');

// 버튼을 누르고, 최대 1초 동안 활성화될 때까지 기다립니다.
$browser->pressAndWaitFor('Save', 1);
```

<a name="clicking-links"></a>
### 링크 클릭하기

링크를 클릭하려면 브라우저 인스턴스에서 `clickLink` 메서드를 사용할 수 있습니다. 이 메서드는 지정한 표시 텍스트를 가진 링크를 클릭합니다.

```
$browser->clickLink($linkText);
```

지정한 표시 텍스트를 가진 링크가 페이지에 보이는지 확인하려면 `seeLink` 메서드를 사용할 수 있습니다.

```
if ($browser->seeLink($linkText)) {
    // ...
}
```

> [!WARNING]
> 이들 메서드는 jQuery와 함께 동작합니다. 페이지에 jQuery가 없는 경우, Dusk가 테스트 실행 중 jQuery를 자동으로 삽입하여 사용 가능하게 만들어줍니다.

<a name="using-the-keyboard"></a>
### 키보드 사용하기

`keys` 메서드를 사용하면, `type` 메서드보다 더 복잡한 입력 시퀀스를 지정할 수 있습니다. 예를 들어, Dusk에 수정 키(shift, ctrl 등)를 누른 채로 값을 입력하도록 지시할 수 있습니다. 아래 예제에서는 `shift` 키를 누른 채로 `taylor`가 입력되고, 이후에는 아무 수정 키 없이 `swift`가 입력됩니다.

```
$browser->keys('selector', ['{shift}', 'taylor'], 'swift');
```

`keys` 메서드를 사용해서 애플리케이션의 주요 CSS 선택자에 "키보드 단축키" 조합을 전송할 수도 있습니다.

```
$browser->keys('.app', ['{command}', 'j']);
```

> [!NOTE]
> `{command}`와 같은 모든 수정 키는 `{}` 기호로 감싸집니다. 이 값들은 `Facebook\WebDriver\WebDriverKeys` 클래스에 정의되어 있으며, [GitHub에서 확인할 수 있습니다](https://github.com/php-webdriver/php-webdriver/blob/master/lib/WebDriverKeys.php).

<a name="fluent-keyboard-interactions"></a>
#### 유연한(Fluent) 키보드 상호작용

Dusk는 또한 `Laravel\Dusk\Keyboard` 클래스를 통해, `withKeyboard` 메서드를 사용하여 복잡한 키보드 상호작용을 유연하게 수행할 수 있습니다. `Keyboard` 클래스는 `press`, `release`, `type`, `pause` 등의 메서드를 제공합니다.

```
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

테스트 전체에서 쉽게 재사용할 수 있는 사용자 정의 키보드 상호작용을 만들고 싶다면, `Keyboard` 클래스에서 제공하는 `macro` 메서드를 사용할 수 있습니다. 일반적으로 이 메서드는 [서비스 프로바이더](/docs/10.x/providers)의 `boot` 메서드에서 등록합니다.

```
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

`macro` 함수는 첫 번째 인자로 이름을, 두 번째 인자로 클로저(익명 함수)를 받습니다. 이렇게 등록된 매크로는 나중에 `Keyboard` 인스턴스에서 메서드처럼 호출할 수 있습니다.

```
$browser->click('@textarea')
    ->withKeyboard(fn (Keyboard $keyboard) => $keyboard->copy())
    ->click('@another-textarea')
    ->withKeyboard(fn (Keyboard $keyboard) => $keyboard->paste());
```

<a name="using-the-mouse"></a>
### 마우스 사용하기

<a name="clicking-on-elements"></a>
#### 요소 클릭하기

`click` 메서드를 사용하면, 지정한 CSS 또는 Dusk 선택자와 일치하는 요소를 클릭할 수 있습니다.

```
$browser->click('.selector');
```

`clickAtXPath` 메서드는 지정한 XPath 식과 일치하는 요소를 클릭할 때 사용할 수 있습니다.

```
$browser->clickAtXPath('//div[@class = "selector"]');
```

`clickAtPoint` 메서드는 브라우저의 표시 영역에서 주어진 좌표(x, y)에 있는 최상단 요소를 클릭합니다.

```
$browser->clickAtPoint($x = 0, $y = 0);
```

`doubleClick` 메서드는 마우스의 더블 클릭 동작을 시뮬레이션합니다.

```
$browser->doubleClick();

$browser->doubleClick('.selector');
```

`rightClick` 메서드를 사용하면 마우스 우클릭 동작을 흉내낼 수 있습니다.

```
$browser->rightClick();

$browser->rightClick('.selector');
```

`clickAndHold` 메서드는 마우스 버튼을 눌러서 계속 누르고 있는 동작을 시뮬레이션합니다. 이후 `releaseMouse` 메서드를 호출하면 마우스 버튼이 놓이게 됩니다.

```
$browser->clickAndHold('.selector');

$browser->clickAndHold()
        ->pause(1000)
        ->releaseMouse();
```

`controlClick` 메서드는 브라우저에서 `ctrl+click` 이벤트를 시뮬레이션할 수 있습니다.

```
$browser->controlClick();

$browser->controlClick('.selector');
```

<a name="mouseover"></a>
#### 마우스 오버

요소 위로 마우스를 이동해야 할 때는 `mouseover` 메서드를 사용할 수 있습니다.

```
$browser->mouseover('.selector');
```

<a name="drag-drop"></a>
#### 드래그 앤 드롭

`drag` 메서드를 사용하면 한 선택자에 해당하는 요소를 다른 요소 위로 드래그할 수 있습니다.

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

지정한 만큼의 오프셋만큼 드래그하는 것도 가능합니다.

```
$browser->dragOffset('.selector', $x = 10, $y = 10);
```

<a name="javascript-dialogs"></a>
### JavaScript 대화상자 다루기

Dusk는 JavaScript 대화상자와 상호작용할 수 있는 다양한 메서드를 제공합니다. 예를 들어, `waitForDialog` 메서드를 사용하면 JavaScript 대화상자가 나타날 때까지 지정한 시간(초)만큼 대기할 수 있습니다.

```
$browser->waitForDialog($seconds = null);
```

`assertDialogOpened` 메서드는 대화상자가 표시되었고, 지정한 메시지를 포함하고 있는지 검증할 때 사용합니다.

```
$browser->assertDialogOpened('Dialog message');
```

JavaScript 대화상자에 프롬프트가 있다면, `typeInDialog` 메서드로 값을 입력할 수 있습니다.

```
$browser->typeInDialog('Hello World');
```

열려있는 JavaScript 대화상자의 "확인(OK)" 버튼을 클릭해서 닫으려면 `acceptDialog` 메서드를 호출합니다.

```
$browser->acceptDialog();
```

"취소(Cancel)" 버튼을 클릭해서 닫으려면 `dismissDialog` 메서드를 호출합니다.

```
$browser->dismissDialog();
```

<a name="interacting-with-iframes"></a>
### 인라인 프레임(iframe) 요소와 상호작용하기

iframe 내부의 요소와 상호작용이 필요한 경우, `withinFrame` 메서드를 사용할 수 있습니다. 이 메서드에 전달된 클로저 내에서 이루어지는 모든 요소 조작은 지정된 iframe 범위 내에서 실행됩니다.

```
$browser->withinFrame('#credit-card-details', function ($browser) {
    $browser->type('input[name="cardnumber"]', '4242424242424242')
        ->type('input[name="exp-date"]', '12/24')
        ->type('input[name="cvc"]', '123');
    })->press('Pay');
});
```

<a name="scoping-selectors"></a>
### 선택자 범위 지정

때로는 특정 선택자 범위 내에서 여러 작업을 수행하고 싶을 수 있습니다. 예를 들어, 어떤 텍스트가 특정 테이블 내에만 존재하는지 검사하고, 해당 테이블 안의 버튼을 클릭할 수도 있습니다. 이럴 때 `with` 메서드를 사용할 수 있습니다. 이 메서드에 전달되는 클로저 안의 모든 동작은 지정한 선택자 범위 내에서만 실행됩니다.

```
$browser->with('.table', function (Browser $table) {
    $table->assertSee('Hello World')
          ->clickLink('Delete');
});
```

가끔 현재 범위 밖에서 assert 등을 실행할 필요도 있을 수 있는데, 이럴 때는 `elsewhere` 및 `elsewhereWhenAvailable` 메서드를 사용할 수 있습니다.

```
 $browser->with('.table', function (Browser $table) {
    // 현재 범위는 `body .table` 입니다...

    $browser->elsewhere('.page-title', function (Browser $title) {
        // 현재 범위는 `body .page-title` 입니다...
        $title->assertSee('Hello World');
    });

    $browser->elsewhereWhenAvailable('.page-title', function (Browser $title) {
        // 현재 범위는 `body .page-title` 입니다...
        $title->assertSee('Hello World');
    });
 });
```

<a name="waiting-for-elements"></a>
### 요소가 나타날 때까지 대기하기

자바스크립트를 많이 사용하는 애플리케이션을 테스트할 때는, 테스트를 계속 진행하기 전에 특정 요소나 데이터가 나타나기를 "대기"하는 것이 자주 필요합니다. Dusk는 이 작업을 아주 쉽게 만들어줍니다. 다양한 메서드를 이용해, 요소가 페이지에 보이기 전까지 기다리거나, 주어진 자바스크립트 표현식이 `true`가 될 때까지 기다릴 수 있습니다.

<a name="waiting"></a>
#### 일시 정지 (레이팅)

테스트를 지정한 밀리초(ms)만큼 잠깐 멈추고 싶다면, `pause` 메서드를 사용합니다.

```
$browser->pause(1000);
```

특정 조건이 `true`일 때만 테스트를 잠시 멈추려면, `pauseIf` 메서드를 사용합니다.

```
$browser->pauseIf(App::environment('production'), 1000);
```

마찬가지로, 어떤 조건이 `true`가 아닐 때만 테스트를 멈추고 싶다면 `pauseUnless` 메서드를 사용할 수 있습니다.

```
$browser->pauseUnless(App::environment('testing'), 1000);
```

<a name="waiting-for-selectors"></a>
#### 선택자(Selector)가 나타날 때까지 대기

`waitFor` 메서드는 주어진 CSS 또는 Dusk 선택자에 해당하는 요소가 페이지에 표시될 때까지 테스트 실행을 잠시 멈춥니다. 기본적으로 최대 5초까지 대기하며, 시간 내에 요소가 보이지 않으면 예외가 발생합니다. 두 번째 인자로 커스텀 타임아웃(초 단위)을 지정할 수도 있습니다.

```
// 최대 5초 동안 selector가 나타날 때까지 대기...
$browser->waitFor('.selector');

// 최대 1초 동안 selector가 나타날 때까지 대기...
$browser->waitFor('.selector', 1);
```

아래와 같이, 선택자에 해당하는 요소에 특정 텍스트가 나타날 때까지 기다릴 수도 있습니다.

```
// 해당 텍스트가 selector에 나타날 때까지 최대 5초 대기...
$browser->waitForTextIn('.selector', 'Hello World');

// 해당 텍스트가 selector에 나타날 때까지 최대 1초 대기...
$browser->waitForTextIn('.selector', 'Hello World', 1);
```

선택자에 해당하는 요소가 페이지에서 사라질 때까지 기다릴 수도 있습니다.

```
// selector가 사라질 때까지 최대 5초 대기...
$browser->waitUntilMissing('.selector');

// selector가 사라질 때까지 최대 1초 대기...
$browser->waitUntilMissing('.selector', 1);
```

또는 선택자에 해당하는 요소가 활성화 혹은 비활성화될 때까지 대기할 수도 있습니다.

```
// selector가 활성화될 때까지 최대 5초 대기...
$browser->waitUntilEnabled('.selector');

// selector가 활성화될 때까지 최대 1초 대기...
$browser->waitUntilEnabled('.selector', 1);

// selector가 비활성화될 때까지 최대 5초 대기...
$browser->waitUntilDisabled('.selector');

// selector가 비활성화될 때까지 최대 1초 대기...
$browser->waitUntilDisabled('.selector', 1);
```

<a name="scoping-selectors-when-available"></a>

#### 사용 가능한 경우 셀렉터 범위 지정하기

때때로 특정 셀렉터와 일치하는 요소가 나타날 때까지 기다렸다가 그 요소와 상호작용하고 싶을 때가 있습니다. 예를 들어, 모달 창이 나타날 때까지 기다렸다가, 해당 모달 내에서 "OK" 버튼을 누르고 싶을 수 있습니다. 이런 경우 `whenAvailable` 메서드를 사용할 수 있습니다. 해당 클로저 안에서 수행하는 모든 요소 조작은 처음 지정한 셀렉터 범위 내에서만 적용됩니다.

```
$browser->whenAvailable('.modal', function (Browser $modal) {
    $modal->assertSee('Hello World')
          ->press('OK');
});
```

<a name="waiting-for-text"></a>
#### 텍스트가 나타날 때까지 기다리기

`waitForText` 메서드는 지정한 텍스트가 페이지에 표시될 때까지 기다릴 때 사용할 수 있습니다.

```
// 최대 5초 동안 텍스트가 나타나기를 기다립니다...
$browser->waitForText('Hello World');

// 최대 1초 동안 텍스트가 나타나기를 기다립니다...
$browser->waitForText('Hello World', 1);
```

또한 `waitUntilMissingText` 메서드를 사용하면 특정 텍스트가 페이지에서 사라질 때까지 기다릴 수 있습니다.

```
// 최대 5초 동안 텍스트가 사라지기를 기다립니다...
$browser->waitUntilMissingText('Hello World');

// 최대 1초 동안 텍스트가 사라지기를 기다립니다...
$browser->waitUntilMissingText('Hello World', 1);
```

<a name="waiting-for-links"></a>
#### 링크가 나타날 때까지 기다리기

`waitForLink` 메서드는 특정 링크 텍스트가 페이지에 나타날 때까지 기다리는 데 사용합니다.

```
// 최대 5초 동안 링크가 나타나기를 기다립니다...
$browser->waitForLink('Create');

// 최대 1초 동안 링크가 나타나기를 기다립니다...
$browser->waitForLink('Create', 1);
```

<a name="waiting-for-inputs"></a>
#### 입력 필드가 보일 때까지 기다리기

`waitForInput` 메서드는 지정한 입력 필드가 페이지에 표시될 때까지 기다리는 데 사용할 수 있습니다.

```
// 최대 5초 동안 입력 필드가 나타나기를 기다립니다...
$browser->waitForInput($field);

// 최대 1초 동안 입력 필드가 나타나기를 기다립니다...
$browser->waitForInput($field, 1);
```

<a name="waiting-on-the-page-location"></a>
#### 페이지의 위치를 기다리기

`$browser->assertPathIs('/home')`와 같이 경로를 확인(assert)할 때, 만약 `window.location.pathname`이 비동기적으로 변경되고 있다면 검증(assertion)이 실패할 수 있습니다. 이런 경우, `waitForLocation` 메서드를 사용해서 위치가 특정 값이 될 때까지 기다릴 수 있습니다.

```
$browser->waitForLocation('/secret');
```

`waitForLocation` 메서드는 현재 창의 URL이 완전히 지정된(absolute) URL이 될 때까지도 기다릴 수 있습니다.

```
$browser->waitForLocation('https://example.com/path');
```

또한, [이름 있는 라우트](/docs/10.x/routing#named-routes)의 위치를 기다릴 수도 있습니다.

```
$browser->waitForRoute($routeName, $parameters);
```

<a name="waiting-for-page-reloads"></a>
#### 페이지 리로드를 기다리기

어떤 동작을 수행한 후 페이지가 리로드될 때까지 기다릴 필요가 있다면, `waitForReload` 메서드를 사용하면 됩니다.

```
use Laravel\Dusk\Browser;

$browser->waitForReload(function (Browser $browser) {
    $browser->press('Submit');
})
->assertSee('Success!');
```

보통 버튼을 클릭한 후에 페이지 리로드를 기다리는 경우가 많으므로, 더 편리하게 사용할 수 있도록 `clickAndWaitForReload` 메서드도 제공합니다.

```
$browser->clickAndWaitForReload('.selector')
        ->assertSee('something');
```

<a name="waiting-on-javascript-expressions"></a>
#### 자바스크립트 표현식의 결과를 기다리기

특정 자바스크립트 표현식이 `true`가 될 때까지 테스트 실행을 잠시 멈추고 싶을 때가 있습니다. 이럴 때는 `waitUntil` 메서드를 사용하면 쉽습니다. 이 메서드에 표현식을 넘길 때는 `return` 키워드나 세미콜론(;)을 붙일 필요가 없습니다.

```
// 최대 5초 동안 표현식이 true가 되기를 기다립니다...
$browser->waitUntil('App.data.servers.length > 0');

// 최대 1초 동안 표현식이 true가 되기를 기다립니다...
$browser->waitUntil('App.data.servers.length > 0', 1);
```

<a name="waiting-on-vue-expressions"></a>
#### Vue 표현식의 결과를 기다리기

`waitUntilVue`와 `waitUntilVueIsNot` 메서드를 사용하면 [Vue 컴포넌트](https://vuejs.org) 속성에 특정 값이 들어갈 때까지 기다릴 수 있습니다.

```
// 컴포넌트 속성이 특정 값이 될 때까지 기다립니다...
$browser->waitUntilVue('user.name', 'Taylor', '@user');

// 컴포넌트 속성이 특정 값이 아닐 때까지 기다립니다...
$browser->waitUntilVueIsNot('user.name', null, '@user');
```

<a name="waiting-for-javascript-events"></a>
#### 자바스크립트 이벤트를 기다리기

`waitForEvent` 메서드를 사용하면 자바스크립트 이벤트가 발생할 때까지 테스트 실행을 멈출 수 있습니다.

```
$browser->waitForEvent('load');
```

이벤트 리스너는 기본적으로 현재 범위(scope), 즉 `body` 요소에 적용됩니다. 범위가 지정된 셀렉터를 사용할 때는 해당 요소에 이벤트 리스너가 적용됩니다.

```
$browser->with('iframe', function (Browser $iframe) {
    // iframe의 load 이벤트를 기다립니다...
    $iframe->waitForEvent('load');
});
```

또한 `waitForEvent` 메서드의 두 번째 인자에 셀렉터를 전달하면, 해당 요소에 이벤트 리스너를 부착할 수 있습니다.

```
$browser->waitForEvent('load', '.selector');
```

`document`나 `window` 객체의 이벤트를 기다릴 수도 있습니다.

```
// document가 스크롤될 때까지 기다립니다...
$browser->waitForEvent('scroll', 'document');

// window가 리사이즈될 때까지 최대 5초 동안 기다립니다...
$browser->waitForEvent('resize', 'window', 5);
```

<a name="waiting-with-a-callback"></a>
#### 콜백을 사용해 기다리기

Dusk의 많은 "wait" 관련 메서드는 내부적으로 `waitUsing` 메서드를 기반으로 작동합니다. 이 메서드를 직접 사용하면, 주어진 클로저가 `true`를 반환할 때까지 기다릴 수 있습니다. `waitUsing` 메서드는 기다릴 최대 시간(초), 클로저를 평가할 간격(초), 클로저, 그리고 실패 시 표시할 메시지를 인자로 받습니다.

```
$browser->waitUsing(10, 1, function () use ($something) {
    return $something->isReady();
}, "Something wasn't ready in time.");
```

<a name="scrolling-an-element-into-view"></a>
### 요소를 화면에 스크롤해서 보이게 하기

어떤 요소가 브라우저의 보이는 영역 밖에 있어 클릭할 수 없는 경우가 있을 수 있습니다. 이런 경우, `scrollIntoView` 메서드를 사용하면 해당 셀렉터에 해당하는 요소가 화면에 보일 때까지 브라우저 창을 자동으로 스크롤해 줍니다.

```
$browser->scrollIntoView('.selector')
        ->click('.selector');
```

<a name="available-assertions"></a>
## 사용 가능한 Assertion 목록

Dusk는 애플리케이션에 대해 다양한 assertion(어설션, 검증)을 제공합니다. 아래는 사용 가능한 모든 assertion을 정리한 목록입니다.


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

페이지의 제목이 지정한 텍스트와 일치하는지 검증합니다.

```
$browser->assertTitle($title);
```

<a name="assert-title-contains"></a>
#### assertTitleContains

페이지의 제목에 지정한 텍스트가 포함되어 있는지 검증합니다.

```
$browser->assertTitleContains($title);
```

<a name="assert-url-is"></a>
#### assertUrlIs

현재 URL(쿼리 스트링 제외)이 지정한 문자열과 일치하는지 검증합니다.

```
$browser->assertUrlIs($url);
```

<a name="assert-scheme-is"></a>
#### assertSchemeIs

현재 URL의 스킴(scheme)이 지정한 스킴과 일치하는지 검증합니다.

```
$browser->assertSchemeIs($scheme);
```

<a name="assert-scheme-is-not"></a>
#### assertSchemeIsNot

현재 URL의 스킴(scheme)이 지정한 스킴과 일치하지 않는지 검증합니다.

```
$browser->assertSchemeIsNot($scheme);
```

<a name="assert-host-is"></a>
#### assertHostIs

현재 URL의 호스트가 지정한 호스트와 일치하는지 검증합니다.

```
$browser->assertHostIs($host);
```

<a name="assert-host-is-not"></a>
#### assertHostIsNot

현재 URL의 호스트가 지정한 호스트와 일치하지 않는지 검증합니다.

```
$browser->assertHostIsNot($host);
```

<a name="assert-port-is"></a>
#### assertPortIs

현재 URL의 포트가 지정한 포트와 일치하는지 검증합니다.

```
$browser->assertPortIs($port);
```

<a name="assert-port-is-not"></a>
#### assertPortIsNot

현재 URL의 포트가 지정한 포트와 일치하지 않는지 검증합니다.

```
$browser->assertPortIsNot($port);
```

<a name="assert-path-begins-with"></a>
#### assertPathBeginsWith

현재 URL 경로(path)가 지정한 경로로 시작하는지 검증합니다.

```
$browser->assertPathBeginsWith('/home');
```

<a name="assert-path-is"></a>
#### assertPathIs

현재 경로가 지정한 경로와 일치하는지 검증합니다.

```
$browser->assertPathIs('/home');
```

<a name="assert-path-is-not"></a>
#### assertPathIsNot

현재 경로가 지정한 경로와 일치하지 않는지 검증합니다.

```
$browser->assertPathIsNot('/home');
```

<a name="assert-route-is"></a>
#### assertRouteIs

현재 URL이 지정한 [이름 있는 라우트](/docs/10.x/routing#named-routes)의 URL과 일치하는지 검증합니다.

```
$browser->assertRouteIs($name, $parameters);
```

<a name="assert-query-string-has"></a>
#### assertQueryStringHas

지정한 쿼리 스트링 파라미터가 존재하는지 검증합니다.

```
$browser->assertQueryStringHas($name);
```

지정한 쿼리 스트링 파라미터가 존재하며, 지정한 값과 일치하는지 검증할 수도 있습니다.

```
$browser->assertQueryStringHas($name, $value);
```

<a name="assert-query-string-missing"></a>
#### assertQueryStringMissing

지정한 쿼리 스트링 파라미터가 없는지 검증합니다.

```
$browser->assertQueryStringMissing($name);
```

<a name="assert-fragment-is"></a>
#### assertFragmentIs

URL의 현재 해시(fragment)가 지정한 값과 일치하는지 검증합니다.

```
$browser->assertFragmentIs('anchor');
```

<a name="assert-fragment-begins-with"></a>
#### assertFragmentBeginsWith

URL의 현재 해시(fragment)가 지정한 값으로 시작하는지 검증합니다.

```
$browser->assertFragmentBeginsWith('anchor');
```

<a name="assert-fragment-is-not"></a>
#### assertFragmentIsNot

URL의 현재 해시(fragment)가 지정한 값과 일치하지 않는지 검증합니다.

```
$browser->assertFragmentIsNot('anchor');
```

<a name="assert-has-cookie"></a>
#### assertHasCookie

지정한 암호화된(encrypted) 쿠키가 존재하는지 검증합니다.

```
$browser->assertHasCookie($name);
```

<a name="assert-has-plain-cookie"></a>
#### assertHasPlainCookie

지정한 암호화되지 않은 평문(plain) 쿠키가 존재하는지 검증합니다.

```
$browser->assertHasPlainCookie($name);
```

<a name="assert-cookie-missing"></a>
#### assertCookieMissing

지정한 암호화된(encrypted) 쿠키가 없는지 검증합니다.

```
$browser->assertCookieMissing($name);
```

<a name="assert-plain-cookie-missing"></a>
#### assertPlainCookieMissing

지정한 암호화되지 않은 평문(plain) 쿠키가 없는지 검증합니다.

```
$browser->assertPlainCookieMissing($name);
```

<a name="assert-cookie-value"></a>
#### assertCookieValue

암호화된(encrypted) 쿠키의 값이 지정한 값과 일치하는지 검증합니다.

```
$browser->assertCookieValue($name, $value);
```

<a name="assert-plain-cookie-value"></a>
#### assertPlainCookieValue

암호화되지 않은 평문(plain) 쿠키의 값이 지정한 값과 일치하는지 검증합니다.

```
$browser->assertPlainCookieValue($name, $value);
```

<a name="assert-see"></a>
#### assertSee

지정한 텍스트가 페이지에 존재하는지 검증합니다.

```
$browser->assertSee($text);
```

<a name="assert-dont-see"></a>
#### assertDontSee

지정한 텍스트가 페이지에 존재하지 않는지 검증합니다.

```
$browser->assertDontSee($text);
```

<a name="assert-see-in"></a>
#### assertSeeIn

지정한 셀렉터 안에 해당 텍스트가 존재하는지 검증합니다.

```
$browser->assertSeeIn($selector, $text);
```

<a name="assert-dont-see-in"></a>
#### assertDontSeeIn

지정한 셀렉터 안에 해당 텍스트가 존재하지 않는지 검증합니다.

```
$browser->assertDontSeeIn($selector, $text);
```

<a name="assert-see-anything-in"></a>
#### assertSeeAnythingIn

지정한 셀렉터 안에 어떤 텍스트라도 존재하는지 검증합니다.

```
$browser->assertSeeAnythingIn($selector);
```

<a name="assert-see-nothing-in"></a>
#### assertSeeNothingIn

지정한 셀렉터 안에 텍스트가 전혀 존재하지 않는지 검증합니다.

```
$browser->assertSeeNothingIn($selector);
```

<a name="assert-script"></a>
#### assertScript

지정한 자바스크립트 표현식이 지정한 값과 동일하게 평가되는지 검증합니다.

```
$browser->assertScript('window.isLoaded')
        ->assertScript('document.readyState', 'complete');
```

<a name="assert-source-has"></a>
#### assertSourceHas

지정한 소스 코드가 페이지에 존재하는지 검증합니다.

```
$browser->assertSourceHas($code);
```

<a name="assert-source-missing"></a>

#### assertSourceMissing

페이지에 지정한 소스 코드가 존재하지 않는지 확인합니다.

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

지정한 입력 필드에 주어진 값이 있는지 확인합니다.

```
$browser->assertInputValue($field, $value);
```

<a name="assert-input-value-is-not"></a>
#### assertInputValueIsNot

지정한 입력 필드에 주어진 값이 없는지 확인합니다.

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

지정한 라디오 필드에서 주어진 값이 선택되어 있는지 확인합니다.

```
$browser->assertRadioSelected($field, $value);
```

<a name="assert-radio-not-selected"></a>
#### assertRadioNotSelected

지정한 라디오 필드에서 주어진 값이 선택되어 있지 않은지 확인합니다.

```
$browser->assertRadioNotSelected($field, $value);
```

<a name="assert-selected"></a>
#### assertSelected

지정한 드롭다운에서 전달한 값이 선택되어 있는지 확인합니다.

```
$browser->assertSelected($field, $value);
```

<a name="assert-not-selected"></a>
#### assertNotSelected

지정한 드롭다운에서 전달한 값이 선택되어 있지 않은지 확인합니다.

```
$browser->assertNotSelected($field, $value);
```

<a name="assert-select-has-options"></a>
#### assertSelectHasOptions

전달한 값들의 배열이 선택 가능한 옵션으로 존재하는지 확인합니다.

```
$browser->assertSelectHasOptions($field, $values);
```

<a name="assert-select-missing-options"></a>
#### assertSelectMissingOptions

전달한 값들의 배열이 선택 가능한 옵션으로 존재하지 않는지 확인합니다.

```
$browser->assertSelectMissingOptions($field, $values);
```

<a name="assert-select-has-option"></a>
#### assertSelectHasOption

지정한 필드에서 전달한 값이 옵션으로 존재하는지 확인합니다.

```
$browser->assertSelectHasOption($field, $value);
```

<a name="assert-select-missing-option"></a>
#### assertSelectMissingOption

지정한 필드에서 전달한 값이 옵션으로 존재하지 않는지 확인합니다.

```
$browser->assertSelectMissingOption($field, $value);
```

<a name="assert-value"></a>
#### assertValue

지정한 선택자(selector)에 해당하는 엘리먼트가 주어진 값을 가지고 있는지 확인합니다.

```
$browser->assertValue($selector, $value);
```

<a name="assert-value-is-not"></a>
#### assertValueIsNot

지정한 선택자(selector)에 해당하는 엘리먼트가 주어진 값을 가지고 있지 않은지 확인합니다.

```
$browser->assertValueIsNot($selector, $value);
```

<a name="assert-attribute"></a>
#### assertAttribute

지정한 선택자(selector)에 해당하는 엘리먼트가 전달된 속성(attribute)에 주어진 값을 가지고 있는지 확인합니다.

```
$browser->assertAttribute($selector, $attribute, $value);
```

<a name="assert-attribute-contains"></a>
#### assertAttributeContains

지정한 선택자(selector)에 해당하는 엘리먼트의 전달된 속성(attribute) 값에 주어진 값이 포함되어 있는지 확인합니다.

```
$browser->assertAttributeContains($selector, $attribute, $value);
```

<a name="assert-attribute-doesnt-contain"></a>
#### assertAttributeDoesntContain

지정한 선택자(selector)에 해당하는 엘리먼트의 전달된 속성(attribute) 값에 주어진 값이 포함되어 있지 않은지 확인합니다.

```
$browser->assertAttributeDoesntContain($selector, $attribute, $value);
```

<a name="assert-aria-attribute"></a>
#### assertAriaAttribute

지정한 선택자(selector)에 해당하는 엘리먼트의 지정한 aria 속성에 주어진 값이 존재하는지 확인합니다.

```
$browser->assertAriaAttribute($selector, $attribute, $value);
```

예를 들어, `<button aria-label="Add"></button>`와 같은 마크업이 있을 때, `aria-label` 속성에 대해 아래와 같이 assertion 할 수 있습니다.

```
$browser->assertAriaAttribute('button', 'label', 'Add')
```

<a name="assert-data-attribute"></a>
#### assertDataAttribute

지정한 선택자(selector)에 해당하는 엘리먼트의 지정한 data 속성에 주어진 값이 존재하는지 확인합니다.

```
$browser->assertDataAttribute($selector, $attribute, $value);
```

예를 들어, `<tr id="row-1" data-content="attendees"></tr>`와 같은 마크업이 있을 때, `data-label` 속성에 대해 아래와 같이 assertion 할 수 있습니다.

```
$browser->assertDataAttribute('#row-1', 'content', 'attendees')
```

<a name="assert-visible"></a>
#### assertVisible

지정한 선택자(selector)에 해당하는 엘리먼트가 화면에 보이는(visible) 상태인지 확인합니다.

```
$browser->assertVisible($selector);
```

<a name="assert-present"></a>
#### assertPresent

지정한 선택자(selector)에 해당하는 엘리먼트가 소스에 존재하는지 확인합니다.

```
$browser->assertPresent($selector);
```

<a name="assert-not-present"></a>
#### assertNotPresent

지정한 선택자(selector)에 해당하는 엘리먼트가 소스에 존재하지 않는지 확인합니다.

```
$browser->assertNotPresent($selector);
```

<a name="assert-missing"></a>
#### assertMissing

지정한 선택자(selector)에 해당하는 엘리먼트가 화면에 보이지 않는 상태인지 확인합니다.

```
$browser->assertMissing($selector);
```

<a name="assert-input-present"></a>
#### assertInputPresent

지정한 이름(name)의 input 필드가 존재하는지 확인합니다.

```
$browser->assertInputPresent($name);
```

<a name="assert-input-missing"></a>
#### assertInputMissing

지정한 이름(name)의 input 필드가 소스에 존재하지 않는지 확인합니다.

```
$browser->assertInputMissing($name);
```

<a name="assert-dialog-opened"></a>
#### assertDialogOpened

지정한 메시지의 자바스크립트 대화상자가 열렸는지 확인합니다.

```
$browser->assertDialogOpened($message);
```

<a name="assert-enabled"></a>
#### assertEnabled

지정한 필드가 활성화(enabled)되어 있는지 확인합니다.

```
$browser->assertEnabled($field);
```

<a name="assert-disabled"></a>
#### assertDisabled

지정한 필드가 비활성화(disabled)되어 있는지 확인합니다.

```
$browser->assertDisabled($field);
```

<a name="assert-button-enabled"></a>
#### assertButtonEnabled

지정한 버튼이 활성화(enabled)되어 있는지 확인합니다.

```
$browser->assertButtonEnabled($button);
```

<a name="assert-button-disabled"></a>
#### assertButtonDisabled

지정한 버튼이 비활성화(disabled)되어 있는지 확인합니다.

```
$browser->assertButtonDisabled($button);
```

<a name="assert-focused"></a>
#### assertFocused

지정한 필드가 포커스를 받고 있는지 확인합니다.

```
$browser->assertFocused($field);
```

<a name="assert-not-focused"></a>
#### assertNotFocused

지정한 필드가 포커스를 받고 있지 않은지 확인합니다.

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

사용자가 인증되지 않은(게스트) 상태인지 확인합니다.

```
$browser->assertGuest();
```

<a name="assert-authenticated-as"></a>
#### assertAuthenticatedAs

사용자가 지정한 사용자로 인증된 상태인지 확인합니다.

```
$browser->assertAuthenticatedAs($user);
```

<a name="assert-vue"></a>
#### assertVue

Dusk는 [Vue 컴포넌트](https://vuejs.org) 데이터의 상태에 대해서도 assertion을 할 수 있습니다. 예를 들어, 아래와 같은 Vue 컴포넌트가 애플리케이션에 있다고 가정해보겠습니다.

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

아래와 같이 Vue 컴포넌트의 상태를 assertion 할 수 있습니다.

```
/**
 * A basic Vue test example.
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

지정한 Vue 컴포넌트의 데이터 프로퍼티가 주어진 값과 일치하지 않는지 assertion합니다.

```
$browser->assertVueIsNot($property, $value, $componentSelector = null);
```

<a name="assert-vue-contains"></a>
#### assertVueContains

지정한 Vue 컴포넌트의 데이터 프로퍼티가 배열 타입이고, 그 값이 전달된 값을 포함하는지 assertion합니다.

```
$browser->assertVueContains($property, $value, $componentSelector = null);
```

<a name="assert-vue-doesnt-contain"></a>
#### assertVueDoesntContain

지정한 Vue 컴포넌트의 데이터 프로퍼티가 배열 타입이며, 전달한 값이 포함되어 있지 않은지 assertion합니다.

```
$browser->assertVueDoesntContain($property, $value, $componentSelector = null);
```

<a name="pages"></a>
## 페이지 (Pages)

테스트에서는 여러 복잡한 작업을 연속적으로 처리해야 할 때가 있습니다. 이런 경우 테스트 코드를 읽거나 이해하기 어려워질 수 있습니다. Dusk의 페이지(Pages) 기능을 사용하면, 한 페이지에서 수행할 수 있는 동작을 명확하게 정의해서 하나의 메서드로 처리할 수 있습니다. 또한, 페이지별로 또는 애플리케이션 전체에서 자주 사용하는 셀렉터에 대한 단축키를 정의할 수도 있습니다.

<a name="generating-pages"></a>
### 페이지 생성하기

페이지 객체를 생성하려면 `dusk:page` 아티즌 명령어를 실행합니다. 모든 페이지 객체는 애플리케이션의 `tests/Browser/Pages` 디렉터리에 생성됩니다.

```
php artisan dusk:page Login
```

<a name="configuring-pages"></a>
### 페이지 설정하기

기본적으로 페이지에는 `url`, `assert`, `elements`라는 세 개의 메서드가 포함되어 있습니다. 여기서는 `url`과 `assert` 메서드에 대해 먼저 설명하고, `elements` 메서드에 대해서는 [아래에서 더 자세히 다룹니다](#shorthand-selectors).

<a name="the-url-method"></a>
#### `url` 메서드

`url` 메서드는 해당 페이지를 나타내는 URL의 경로를 반환해야 합니다. Dusk는 브라우저에서 이 페이지로 이동할 때 이 URL을 사용합니다.

```
/**
 * Get the URL for the page.
 */
public function url(): string
{
    return '/login';
}
```

<a name="the-assert-method"></a>
#### `assert` 메서드

`assert` 메서드에서는 브라우저가 실제로 해당 페이지에 있는지 확인하는 assertion을 자유롭게 구현할 수 있습니다. 이 메서드는 반드시 무언가를 구현할 필요는 없습니다. 다만 필요한 경우 적절한 assertion을 추가할 수 있습니다. 이 메서드에 작성된 assertion은 페이지로 이동할 때마다 자동으로 실행됩니다.

```
/**
 * Assert that the browser is on the page.
 */
public function assert(Browser $browser): void
{
    $browser->assertPathIs($this->url());
}
```

<a name="navigating-to-pages"></a>
### 페이지로 이동하기

페이지가 정의되었다면 `visit` 메서드를 사용하여 해당 페이지로 이동할 수 있습니다.

```
use Tests\Browser\Pages\Login;

$browser->visit(new Login);
```

이미 특정 페이지에 있는 상태에서 그 페이지의 셀렉터와 메서드를 현재 테스트 컨텍스트에 "불러와야" 할 때가 있습니다. 예를 들어, 버튼을 눌렀을 때 명시적으로 페이지를 방문하는 동작 없이 특정 페이지로 이동되는 경우가 그렇습니다. 이런 상황에서는 `on` 메서드를 사용하여 그 페이지를 로드할 수 있습니다.

```
use Tests\Browser\Pages\CreatePlaylist;

$browser->visit('/dashboard')
        ->clickLink('Create Playlist')
        ->on(new CreatePlaylist)
        ->assertSee('@create');
```

<a name="shorthand-selectors"></a>
### 셀렉터 단축키(Shorthand Selectors)

페이지 클래스의 `elements` 메서드를 사용하면, 페이지에 있는 어떤 CSS 셀렉터든 쉽고 기억하기 쉬운 단축키로 정의할 수 있습니다. 예를 들어, 애플리케이션 로그인 페이지의 "email" 입력 필드에 대해 단축키를 정의할 수 있습니다.

```
/**
 * Get the element shortcuts for the page.
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

이렇게 단축키를 정의한 뒤에는, CSS 셀렉터를 쓸 때마다 전체 셀렉터 대신 단축키를 사용할 수 있습니다.

```
$browser->type('@email', 'taylor@laravel.com');
```

<a name="global-shorthand-selectors"></a>
#### 글로벌 단축 셀렉터(Global Shorthand Selectors)

Dusk를 설치하면 `tests/Browser/Pages` 디렉터리에 기본 `Page` 클래스가 생성됩니다. 이 클래스에는 애플리케이션 전체에서 공통적으로 사용할 글로벌 단축 셀렉터를 정의하는 `siteElements` 메서드가 포함되어 있습니다.

```
/**
 * Get the global element shortcuts for the site.
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

페이지에는 기본 메서드 외에도 테스트 전반에서 사용할 수 있는 추가 메서드를 자유롭게 정의할 수 있습니다. 예를 들어, 음악 관리 애플리케이션을 만든다고 가정해 봅니다. 이 애플리케이션의 한 페이지에서 자주 사용하는 동작이 '플레이리스트 만들기'라면, 각 테스트마다 같은 로직을 반복하지 않고 한 번의 메서드로 처리할 수 있습니다. 다음은 `createPlaylist`라는 메서드를 페이지 클래스에 정의하는 방법입니다.

```
<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;

class Dashboard extends Page
{
    // 기타 페이지 메서드...

    /**
     * Create a new playlist.
     */
    public function createPlaylist(Browser $browser, string $name): void
    {
        $browser->type('name', $name)
                ->check('share')
                ->press('Create Playlist');
    }
}
```

이렇게 메서드를 정의하면, 해당 페이지를 사용하는 모든 테스트에서 이 메서드를 사용할 수 있습니다. 커스텀 페이지 메서드는 첫 번째 인자로 브라우저 인스턴스가 자동으로 전달됩니다.

```
use Tests\Browser\Pages\Dashboard;

$browser->visit(new Dashboard)
        ->createPlaylist('My Playlist')
        ->assertSee('My Playlist');
```

<a name="components"></a>

## 컴포넌트

컴포넌트는 Dusk의 "페이지 오브젝트(page objects)"와 비슷하지만, 내비게이션 바나 알림 창처럼 애플리케이션 전체에서 반복적으로 사용되는 UI 및 기능의 일부를 위해 설계되었습니다. 이러한 특성 때문에, 컴포넌트는 특정 URL에 종속되지 않습니다.

<a name="generating-components"></a>
### 컴포넌트 생성하기

컴포넌트를 생성하려면 `dusk:component` Artisan 명령어를 실행합니다. 새로 생성된 컴포넌트는 `tests/Browser/Components` 디렉터리에 저장됩니다.

```
php artisan dusk:component DatePicker
```

위 예시처럼, "date picker(날짜 선택기)"는 다양한 페이지에서 반복적으로 사용될 수 있는 컴포넌트 예시입니다. 여러 테스트에서 날짜를 선택하는 브라우저 자동화 로직을 매번 직접 작성하는 것은 번거로울 수 있습니다. 이런 경우, Dusk 컴포넌트로 날짜 선택기를 정의하면, 해당 로직을 컴포넌트 내부에 캡슐화하여 재사용할 수 있습니다.

```
<?php

namespace Tests\Browser\Components;

use Laravel\Dusk\Browser;
use Laravel\Dusk\Component as BaseComponent;

class DatePicker extends BaseComponent
{
    /**
     * Get the root selector for the component.
     */
    public function selector(): string
    {
        return '.date-picker';
    }

    /**
     * Assert that the browser page contains the component.
     */
    public function assert(Browser $browser): void
    {
        $browser->assertVisible($this->selector());
    }

    /**
     * Get the element shortcuts for the component.
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
     * Select the given date.
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

컴포넌트를 정의한 후에는, 어떤 테스트에서든 해당 날짜 선택기 내에서 손쉽게 날짜를 선택할 수 있습니다. 그리고 만약 날짜 선택 로직이 변경되더라도, 컴포넌트만 수정하면 모든 테스트에 일괄 적용됩니다.

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
     * A basic component test example.
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
## 지속적 통합(Continuous Integration)

> [!NOTE]
> 대부분의 Dusk 지속적 통합 설정에서는 여러분의 Laravel 애플리케이션이 8000번 포트에서 내장 PHP 개발 서버를 사용하여 서비스되고 있다고 가정합니다. 따라서, 계속 진행하기 전에, 지속적 통합 환경의 `APP_URL` 환경 변수 값이 `http://127.0.0.1:8000`로 설정되어 있는지 반드시 확인해야 합니다.

<a name="running-tests-on-heroku-ci"></a>
### Heroku CI에서 테스트 실행하기

[Heroku CI](https://www.heroku.com/continuous-integration)에서 Dusk 테스트를 실행하려면, 아래 Google Chrome 빌드팩과 스크립트를 Heroku의 `app.json` 파일에 추가하십시오.

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
### Travis CI에서 테스트 실행하기

[Travis CI](https://travis-ci.org)에서 Dusk 테스트를 실행하려면, 아래의 `.travis.yml` 설정을 사용하세요. Travis CI는 그래픽 환경이 아니므로, Chrome 브라우저를 실행하려면 추가적인 단계가 필요합니다. 또한, PHP의 내장 웹 서버를 실행하기 위해 `php artisan serve`를 사용합니다.

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
### GitHub Actions에서 테스트 실행하기

[GitHub Actions](https://github.com/features/actions)를 사용하여 Dusk 테스트를 실행할 경우, 아래 설정 파일을 시작점으로 사용할 수 있습니다. TravisCI와 마찬가지로, PHP의 내장 웹 서버를 실행하기 위해 `php artisan serve` 명령어를 사용합니다.

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

<a name="running-tests-on-chipper-ci"></a>
### Chipper CI에서 테스트 실행하기

[Chipper CI](https://chipperci.com)를 이용하여 Dusk 테스트를 실행하려면, 아래 설정 파일을 시작점으로 삼을 수 있습니다. Laravel을 실행할 때는 PHP의 내장 서버를 사용하여 요청을 수신합니다.

```yaml
# file .chipperci.yml
version: 1

environment:
  php: 8.2
  node: 16

# Include Chrome in the build environment
services:
  - dusk

# Build all commits
on:
   push:
      branches: .*

pipeline:
  - name: Setup
    cmd: |
      cp -v .env.example .env
      composer install --no-interaction --prefer-dist --optimize-autoloader
      php artisan key:generate
      
      # Create a dusk env file, ensuring APP_URL uses BUILD_HOST
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

Chipper CI에서 Dusk 테스트 실행에 관한 더욱 자세한 내용과 데이터베이스 사용 방법 등은 [Chipper CI 공식 문서](https://chipperci.com/docs/testing/laravel-dusk-new/)를 참고하시기 바랍니다.