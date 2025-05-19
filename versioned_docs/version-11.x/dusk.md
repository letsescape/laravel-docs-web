# 라라벨 더스크 (Laravel Dusk)

- [소개](#introduction)
- [설치하기](#installation)
    - [ChromeDriver 설치 관리](#managing-chromedriver-installations)
    - [다른 브라우저 사용](#using-other-browsers)
- [시작하기](#getting-started)
    - [테스트 생성하기](#generating-tests)
    - [각 테스트 후 데이터베이스 초기화](#resetting-the-database-after-each-test)
    - [테스트 실행하기](#running-tests)
    - [환경 파일 관리](#environment-handling)
- [브라우저 기본 사용법](#browser-basics)
    - [브라우저 인스턴스 생성](#creating-browsers)
    - [페이지 이동](#navigation)
    - [브라우저 창 크기 조절](#resizing-browser-windows)
    - [브라우저 매크로](#browser-macros)
    - [인증 처리](#authentication)
    - [쿠키](#cookies)
    - [자바스크립트 실행](#executing-javascript)
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
    - [키보드 사용](#using-the-keyboard)
    - [마우스 사용](#using-the-mouse)
    - [자바스크립트 대화상자](#javascript-dialogs)
    - [인라인 프레임과 상호작용](#interacting-with-iframes)
    - [셀렉터 범위 지정하기](#scoping-selectors)
    - [요소를 기다리기](#waiting-for-elements)
    - [요소를 화면에 스크롤하기](#scrolling-an-element-into-view)
- [사용 가능한 어서션](#available-assertions)
- [페이지 객체](#pages)
    - [페이지 객체 생성](#generating-pages)
    - [페이지 객체 설정](#configuring-pages)
    - [페이지로 이동](#navigating-to-pages)
    - [간편 셀렉터](#shorthand-selectors)
    - [페이지 메서드](#page-methods)
- [컴포넌트](#components)
    - [컴포넌트 생성하기](#generating-components)
    - [컴포넌트 사용하기](#using-components)
- [지속적인 통합(CI)](#continuous-integration)
    - [Heroku CI](#running-tests-on-heroku-ci)
    - [Travis CI](#running-tests-on-travis-ci)
    - [GitHub Actions](#running-tests-on-github-actions)
    - [Chipper CI](#running-tests-on-chipper-ci)

<a name="introduction"></a>
## 소개

[Laravel Dusk](https://github.com/laravel/dusk)는 직관적이고 사용하기 쉬운 브라우저 자동화 및 테스트 API를 제공합니다. 기본적으로 Dusk를 사용하면 로컬 컴퓨터에 JDK나 Selenium을 따로 설치할 필요가 없습니다. 대신, Dusk는 독립 실행형 [ChromeDriver](https://sites.google.com/chromium.org/driver)를 사용합니다. 물론, 필요하다면 Selenium과 호환되는 다른 드라이버도 자유롭게 사용할 수 있습니다.

<a name="installation"></a>
## 설치하기

먼저 [Google Chrome](https://www.google.com/chrome)을 설치한 뒤, 프로젝트에 `laravel/dusk` Composer 의존성을 추가해 주세요:

```shell
composer require laravel/dusk --dev
```

> [!WARNING]  
> Dusk 서비스 프로바이더를 수동으로 등록하는 경우, 프로덕션 환경에서는 절대 등록해서는 안 됩니다. 이렇게 하면 임의의 사용자가 애플리케이션에 인증할 수 있는 심각한 보안 이슈가 발생할 수 있습니다.

Dusk 패키지를 설치한 후, `dusk:install` 아티즌 명령어를 실행합니다. 이 명령어는 `tests/Browser` 디렉터리와 예제 Dusk 테스트 파일을 생성하고, 운영체제에 맞는 Chrome Driver 바이너리를 설치해 줍니다:

```shell
php artisan dusk:install
```

다음으로, 애플리케이션의 `.env` 파일에 `APP_URL` 환경 변수를 설정해야 합니다. 이 값은 브라우저에서 애플리케이션에 접근할 때 사용하는 URL과 일치해야 합니다.

> [!NOTE]  
> [Laravel Sail](/docs/11.x/sail)로 개발 환경을 관리하는 경우, [Dusk 테스트 설정 및 실행](#laravel-dusk)에 관한 Sail 공식 문서도 참고하시기 바랍니다.

<a name="managing-chromedriver-installations"></a>
### ChromeDriver 설치 관리

Laravel Dusk에서 `dusk:install` 명령어로 설치되는 ChromeDriver와 다른 버전을 사용하고 싶다면, `dusk:chrome-driver` 명령어를 활용할 수 있습니다:

```shell
# 운영체제에 맞는 최신 ChromeDriver 설치...
php artisan dusk:chrome-driver

# 원하는 버전의 ChromeDriver 설치...
php artisan dusk:chrome-driver 86

# 지원되는 모든 운영체제용 ChromeDriver 설치...
php artisan dusk:chrome-driver --all

# 현재 설치된 Chrome/Chromium 버전에 맞는 ChromeDriver 자동 설치...
php artisan dusk:chrome-driver --detect
```

> [!WARNING]  
> Dusk를 사용하려면 `chromedriver` 바이너리에 실행 권한이 필요합니다. Dusk 실행에 문제가 있다면 아래 명령어로 실행 권한이 올바른지 확인하세요: `chmod -R 0755 vendor/laravel/dusk/bin/`.

<a name="using-other-browsers"></a>
### 다른 브라우저 사용

기본적으로 Dusk는 Google Chrome과 독립 실행형 [ChromeDriver](https://sites.google.com/chromium.org/driver)를 이용해 브라우저 테스트를 실행합니다. 하지만 원한다면 Selenium 서버를 직접 띄우고, 원하는 브라우저로 테스트를 실행할 수도 있습니다.

먼저, 애플리케이션의 기본 Dusk 테스트 케이스 파일인 `tests/DuskTestCase.php`를 엽니다. 이 파일에서 `startChromeDriver` 메서드 호출을 주석 처리하거나 제거합니다. 이렇게 하면 Dusk가 자동으로 ChromeDriver를 시작하지 않습니다:

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

그리고 나서, 원하는 URL과 포트로 접속하도록 `driver` 메서드를 수정할 수 있습니다. 아울러 WebDriver에 전달할 "desired capabilities"도 변경할 수 있습니다:

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

Dusk 테스트를 새로 생성하려면 `dusk:make` 아티즌 명령어를 사용하십시오. 생성된 테스트는 `tests/Browser` 디렉터리에 저장됩니다:

```shell
php artisan dusk:make LoginTest
```

<a name="resetting-the-database-after-each-test"></a>
### 각 테스트 후 데이터베이스 초기화

작성하는 대부분의 테스트는 애플리케이션의 데이터베이스에서 데이터를 조회하는 페이지와 상호작용하게 됩니다. 하지만 Dusk 테스트에서는 `RefreshDatabase` 트레이트를 사용해서는 안 됩니다. `RefreshDatabase` 트레이트는 데이터베이스 트랜잭션을 활용하는데, 이는 HTTP 요청 간에 적용할 수 없거나 동작하지 않습니다. 대신 데이터를 초기화하려면 `DatabaseMigrations` 트레이트 혹은 `DatabaseTruncation` 트레이트 중 하나를 사용할 수 있습니다.

<a name="reset-migrations"></a>
#### 데이터베이스 마이그레이션 사용하기

`DatabaseMigrations` 트레이트는 각 테스트 실행 전에 데이터베이스 마이그레이션을 수행합니다. 하지만 매 테스트마다 테이블을 삭제하고 재생성하기 때문에, 단순히 테이블을 비우는 방법보다는 일반적으로 느릴 수 있습니다:

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
> Dusk 테스트를 실행할 때 SQLite 메모리 데이터베이스는 사용할 수 없습니다. 브라우저가 별도의 프로세스에서 동작하기 때문에, 다른 프로세스의 메모리 내 데이터베이스에 접근할 수 없기 때문입니다.

<a name="reset-truncation"></a>
#### 데이터베이스 트렁케이션 사용하기

`DatabaseTruncation` 트레이트는 첫 번째 테스트 실행 시 데이터베이스 마이그레이션을 실행하여 테이블이 제대로 생성됐는지 확인합니다. 이후 테스트부터는 테이블들을 단순히 비우는(트렁케이트하는) 방식으로, 모든 마이그레이션을 다시 실행하는 것보다 속도가 빠릅니다:

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

기본적으로 이 트레이트는 `migrations` 테이블을 제외한 모든 테이블을 비웁니다. 비울 테이블을 직접 지정하려면, 테스트 클래스에 `$tablesToTruncate` 프로퍼티를 정의할 수 있습니다:

> [!NOTE]  
> Pest를 사용하는 경우, 프로퍼티나 메서드는 기본 `DuskTestCase` 클래스나 테스트 파일이 상속받은 다른 클래스에 정의해야 합니다.

```
/**
 * 트렁케이트(비우기)할 테이블을 지정합니다.
 *
 * @var array
 */
protected $tablesToTruncate = ['users'];
```

또는, 트렁케이트에서 제외할 테이블을 지정하려면 `$exceptTables` 프로퍼티를 사용할 수 있습니다:

```
/**
 * 트렁케이트 대상에서 제외할 테이블을 지정합니다.
 *
 * @var array
 */
protected $exceptTables = ['users'];
```

트렁케이트를 수행할 데이터베이스 커넥션을 지정하려면 `$connectionsToTruncate` 프로퍼티를 사용할 수 있습니다:

```
/**
 * 이 커넥션의 테이블을 트렁케이트합니다.
 *
 * @var array
 */
protected $connectionsToTruncate = ['mysql'];
```

데이터베이스 트렁케이트가 실행되기 전 또는 후에 특정 코드를 실행하고 싶다면, 테스트 클래스에 `beforeTruncatingDatabase` 또는 `afterTruncatingDatabase` 메서드를 정의하면 됩니다:

```
/**
 * 데이터베이스를 트렁케이트하기 전에 실행할 작업입니다.
 */
protected function beforeTruncatingDatabase(): void
{
    //
}

/**
 * 데이터베이스를 트렁케이트한 후에 실행할 작업입니다.
 */
protected function afterTruncatingDatabase(): void
{
    //
}
```

<a name="running-tests"></a>
### 테스트 실행하기

브라우저 테스트를 실행하려면 아래와 같이 `dusk` 아티즌 명령어를 실행하십시오:

```shell
php artisan dusk
```

이전에 `dusk` 명령어를 실행했을 때 테스트 실패 이력이 있다면, `dusk:fails` 명령어로 실패한 테스트만 먼저 실행하여 시간을 절약할 수 있습니다:

```shell
php artisan dusk:fails
```

`dusk` 명령어는 보통 Pest / PHPUnit 테스트 러너에서 사용하는 인수도 그대로 사용할 수 있습니다. 예를 들어, [테스트 그룹](https://docs.phpunit.de/en/10.5/annotations.html#group) 별로 원하는 테스트만 실행할 수도 있습니다:

```shell
php artisan dusk --group=foo
```

> [!NOTE]  
> [Laravel Sail](/docs/11.x/sail)로 개발 환경을 관리한다면, [Dusk 테스트 설정 및 실행](#laravel-dusk) 문서를 꼭 참고하세요.

<a name="manually-starting-chromedriver"></a>
#### ChromeDriver 수동 실행

기본적으로 Dusk는 ChromeDriver를 자동으로 실행하려 시도합니다. 만약 시스템 환경에 따라 자동 실행이 정상 동작하지 않는다면, `dusk` 명령어 실행 전에 ChromeDriver를 직접 수동으로 실행할 수 있습니다. 이때 ChromeDriver를 수동으로 시작한다면, `tests/DuskTestCase.php` 파일의 아래 부분은 주석 처리해야 합니다:

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

또한, ChromeDriver를 9515번 이외의 포트에서 실행했다면, 같은 클래스의 `driver` 메서드에서 해당 포트로 URL을 수정해 주어야 합니다:

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
### 환경 파일 관리

Dusk가 테스트 실행 시 자체 환경 파일을 사용하도록 하려면, 프로젝트 루트에 `.env.dusk.{environment}` 파일을 만드세요. 예를 들어, `local` 환경에서 `dusk` 명령어를 실행할 예정이라면, `.env.dusk.local` 파일을 생성하면 됩니다.

테스트를 실행할 때 Dusk는 기존 `.env` 파일을 백업한 뒤, Dusk 전용 환경 파일명을 `.env`로 변경합니다. 테스트가 모두 끝나면 원래의 `.env` 파일이 복원됩니다.

<a name="browser-basics"></a>
## 브라우저 기본 사용법

<a name="creating-browsers"></a>
### 브라우저 인스턴스 생성

먼저, 애플리케이션에 로그인할 수 있는지 확인하는 테스트를 작성해 보겠습니다. 테스트 생성을 마친 뒤, 로그인 페이지로 이동하여 정보를 입력하고 "Login" 버튼을 클릭하도록 코드를 추가합니다. Dusk 테스트에서는 `browse` 메서드를 호출해 브라우저 인스턴스를 생성할 수 있습니다:

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

위 예시에서 볼 수 있듯이, `browse` 메서드에는 클로저를 인수로 전달합니다. Dusk는 이 클로저에 브라우저 인스턴스를 자동으로 넘겨 주며, 이 인스턴스를 통해 애플리케이션과 상호작용하고 어서션도 수행할 수 있습니다.

<a name="creating-multiple-browsers"></a>
#### 브라우저 여러 개 생성하기

테스트를 제대로 작성하려면 여러 브라우저 인스턴스가 필요한 경우도 있습니다. 예를 들어, 웹소켓과 상호작용하는 채팅 화면을 테스트하려면 두 개 이상의 브라우저가 필요할 수 있습니다. 이럴 때는 `browse` 메서드에 전달하는 클로저의 인자에 브라우저를 여러 개 추가하면 됩니다:

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
### 페이지 이동

`visit` 메서드를 사용해 애플리케이션 내의 특정 URI로 이동할 수 있습니다:

```
$browser->visit('/login');
```

`visitRoute` 메서드를 사용하면 [네임드 라우트](/docs/11.x/routing#named-routes)로 바로 이동할 수도 있습니다:

```
$browser->visitRoute($routeName, $parameters);
```

브라우저의 "뒤로 가기", "앞으로 가기"는 각각 `back`, `forward` 메서드로 이동할 수 있습니다:

```
$browser->back();

$browser->forward();
```

현재 페이지를 새로고침하려면 `refresh` 메서드를 사용하세요:

```
$browser->refresh();
```

<a name="resizing-browser-windows"></a>
### 브라우저 창 크기 조절

브라우저 창 크기를 변경하려면 `resize` 메서드를 사용합니다:

```
$browser->resize(1920, 1080);
```

창을 최대화하려면 `maximize` 메서드를 호출하면 됩니다:

```
$browser->maximize();
```

`fitContent` 메서드는 브라우저 창을 해당 페이지 콘텐츠 크기에 맞게 조절합니다:

```
$browser->fitContent();
```

테스트가 실패하면 Dusk는 스크린샷을 찍기 전에 자동으로 창 크기를 콘텐츠에 맞게 조절합니다. 이 기능을 비활성화하려면, 테스트 내에서 `disableFitOnFailure` 메서드를 호출하세요:

```
$browser->disableFitOnFailure();
```

`move` 메서드는 브라우저 창을 화면 내 원하는 위치로 이동할 때 사용합니다:

```
$browser->move($x = 100, $y = 100);
```

<a name="browser-macros"></a>
### 브라우저 매크로

공통적으로 자주 사용하는 동작을 별도의 브라우저 메서드로 정의해서 여러 테스트에서 재사용하고 싶다면, `Browser` 클래스의 `macro` 메서드를 사용할 수 있습니다. 이 메서드는 대체로 [서비스 프로바이더](/docs/11.x/providers)의 `boot` 메서드에서 호출하는 것이 좋습니다:

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

`macro` 함수의 첫 번째 인자는 매크로 이름, 두 번째 인자는 클로저(익명 함수)입니다. 매크로로 등록한 후에는 `Browser` 인스턴스에서 해당 이름으로 바로 사용할 수 있습니다:

```
$this->browse(function (Browser $browser) use ($user) {
    $browser->visit('/pay')
        ->scrollToElement('#credit-card-details')
        ->assertSee('Enter Credit Card Details');
});
```

<a name="authentication"></a>
### 인증 처리

인증이 필요한 페이지를 테스트할 일이 많습니다. 테스트할 때마다 로그인 화면을 거치지 않고 빠르게 인증할 수 있도록, Dusk의 `loginAs` 메서드를 활용할 수 있습니다. 이 메서드는 인증 가능한 모델의 기본 키(primary key) 값이나, 해당 모델 인스턴스를 인자로 받습니다:

```
use App\Models\User;
use Laravel\Dusk\Browser;

$this->browse(function (Browser $browser) {
    $browser->loginAs(User::find(1))
        ->visit('/home');
});
```

> [!WARNING]  
> `loginAs` 메서드를 사용하면, 해당 파일 전체에서 사용자의 세션이 계속 유지됩니다.

<a name="cookies"></a>
### 쿠키

`cookie` 메서드를 사용하면 암호화된 쿠키 값을 가져오거나 직접 설정할 수 있습니다. 라라벨에서 생성하는 모든 쿠키는 기본적으로 암호화되어 있습니다:

```
$browser->cookie('name');

$browser->cookie('name', 'Taylor');
```

암호화되지 않은 쿠키 값을 다루고 싶다면 `plainCookie` 메서드를 사용할 수 있습니다:

```
$browser->plainCookie('name');

$browser->plainCookie('name', 'Taylor');
```

지정한 쿠키를 삭제하려면 `deleteCookie` 메서드를 사용하세요:

```
$browser->deleteCookie('name');
```

<a name="executing-javascript"></a>

### 자바스크립트 실행하기

`script` 메서드를 사용하면 브라우저 내에서 임의의 자바스크립트 문장을 실행할 수 있습니다.

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

`screenshot` 메서드를 사용하면 스크린샷을 찍고 지정한 파일명으로 저장할 수 있습니다. 모든 스크린샷은 `tests/Browser/screenshots` 디렉터리에 저장됩니다.

```
$browser->screenshot('filename');
```

`responsiveScreenshots` 메서드를 사용하면 다양한 브레이크포인트에서 여러 장의 스크린샷을 찍을 수 있습니다.

```
$browser->responsiveScreenshots('filename');
```

`screenshotElement` 메서드를 사용하면 페이지의 특정 요소만 스크린샷으로 저장할 수 있습니다.

```
$browser->screenshotElement('#selector', 'filename');
```

<a name="storing-console-output-to-disk"></a>
### 콘솔 출력 결과를 디스크에 저장하기

`storeConsoleLog` 메서드를 사용하면 현재 브라우저의 콘솔 출력을 지정한 파일명으로 디스크에 저장할 수 있습니다. 저장된 콘솔 출력은 `tests/Browser/console` 디렉터리에서 확인할 수 있습니다.

```
$browser->storeConsoleLog('filename');
```

<a name="storing-page-source-to-disk"></a>
### 페이지 소스코드를 디스크에 저장하기

`storeSource` 메서드를 사용하면 현재 페이지의 소스코드를 지정한 파일명으로 디스크에 저장할 수 있습니다. 저장된 페이지 소스는 `tests/Browser/source` 디렉터리에 저장됩니다.

```
$browser->storeSource('filename');
```

<a name="interacting-with-elements"></a>
## 요소와 상호작용하기

<a name="dusk-selectors"></a>
### Dusk 셀렉터

요소와 상호작용할 때 좋은 CSS 셀렉터를 선택하는 것은 Dusk 테스트를 작성할 때 가장 어려운 부분 중 하나입니다. 시간이 지나면서 프론트엔드 코드가 변경되면, 다음과 같이 CSS 셀렉터가 더 이상 유효하지 않아 테스트가 실패할 수 있습니다.

```
// HTML...

<button>Login</button>

// Test...

$browser->click('.login-page .container div > button');
```

Dusk 셀렉터를 사용하면 CSS 셀렉터를 기억하지 않아도 효과적인 테스트 코드를 작성할 수 있습니다. 셀렉터를 정의하려면 HTML 요소에 `dusk` 속성을 추가하세요. 테스트에서는 Dusk 브라우저에서 셀렉터 앞에 `@`를 붙여 해당 요소와 상호작용할 수 있습니다.

```
// HTML...

<button dusk="login-button">Login</button>

// Test...

$browser->click('@login-button');
```

원한다면, Dusk가 사용할 HTML 속성을 `selectorHtmlAttribute` 메서드를 통해 커스터마이즈할 수 있습니다. 일반적으로 이 메서드는 애플리케이션의 `AppServiceProvider`의 `boot` 메서드에서 호출해야 합니다.

```
use Laravel\Dusk\Dusk;

Dusk::selectorHtmlAttribute('data-dusk');
```

<a name="text-values-and-attributes"></a>
### 텍스트, 값, 속성 다루기

<a name="retrieving-setting-values"></a>
#### 값 가져오기 및 설정하기

Dusk는 페이지의 요소에 대해 현재 값, 표시되는 텍스트, 속성 등을 쉽게 다룰 수 있는 여러 메서드를 제공합니다. 예를 들어, 주어진 CSS나 Dusk 셀렉터에 해당하는 요소의 "value" 값을 가져오려면 `value` 메서드를 사용합니다.

```
// 값 가져오기...
$value = $browser->value('selector');

// 값 설정하기...
$browser->value('selector', 'value');
```

주어진 필드명을 가진 input 요소의 "value" 값을 가져오려면 `inputValue` 메서드를 사용할 수 있습니다.

```
$value = $browser->inputValue('field');
```

<a name="retrieving-text"></a>
#### 텍스트 가져오기

`text` 메서드를 사용하면 지정한 셀렉터와 일치하는 요소의 표시 텍스트를 가져올 수 있습니다.

```
$text = $browser->text('selector');
```

<a name="retrieving-attributes"></a>
#### 속성값 가져오기

`attribute` 메서드를 사용하면 지정한 셀렉터와 일치하는 요소의 특정 속성값을 가져올 수 있습니다.

```
$attribute = $browser->attribute('selector', 'value');
```

<a name="interacting-with-forms"></a>
### 폼과 상호작용하기

<a name="typing-values"></a>
#### 값 입력하기

Dusk는 폼 및 입력 요소와 상호작용하기 위한 다양한 메서드를 제공합니다. 먼저 인풋 필드에 텍스트를 입력하는 기본 예제를 살펴봅니다.

```
$browser->type('email', 'taylor@laravel.com');
```

참고로, 필요하다면 CSS 셀렉터를 넘길 수도 있지만, 보통 `type` 메서드에는 CSS 셀렉터를 필수로 전달하지 않아도 됩니다. 셀렉터가 제공되지 않으면 Dusk가 주어진 `name` 속성의 `input` 또는 `textarea` 필드를 찾아 입력하게 됩니다.

필드의 기존 값은 지우지 않고 텍스트를 추가하려면, `append` 메서드를 사용하세요.

```
$browser->type('tags', 'foo')
    ->append('tags', ', bar, baz');
```

인풋의 값을 지우려면 `clear` 메서드를 사용할 수 있습니다.

```
$browser->clear('email');
```

Dusk가 천천히 입력하게 하려면 `typeSlowly` 메서드를 사용하세요. 기본적으로 Dusk는 키를 한 번 누를 때마다 100 밀리초를 일시정지합니다. 키 입력 간 시간 간격을 직접 지정하려면 세 번째 인자로 밀리초 단위 값을 전달합니다.

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

`select` 요소에 있는 값을 선택하려면 `select` 메서드를 사용하세요. `type` 메서드와 마찬가지로, `select` 메서드도 CSS 셀렉터를 필수로 요구하지 않습니다. 값을 선택할 때는 display 텍스트가 아닌 실제 옵션의 값을 전달해야 합니다.

```
$browser->select('size', 'Large');
```

두 번째 인자를 생략하면 무작위로 옵션이 선택됩니다.

```
$browser->select('size');
```

두 번째 인자로 배열을 전달하면 여러 개의 옵션을 동시에 선택할 수 있습니다.

```
$browser->select('categories', ['Art', 'Music']);
```

<a name="checkboxes"></a>
#### 체크박스

체크박스 입력을 "체크"하려면 `check` 메서드를 사용하세요. 다른 여러 입력 관련 메서드처럼, CSS 셀렉터 전체를 넘길 필요가 없습니다. 일치하는 셀렉터가 없다면 동일한 `name` 속성을 가진 체크박스를 자동으로 찾습니다.

```
$browser->check('terms');
```

`uncheck` 메서드를 사용하면 체크박스의 체크를 해제할 수 있습니다.

```
$browser->uncheck('terms');
```

<a name="radio-buttons"></a>
#### 라디오 버튼

라디오 버튼 입력 옵션을 "선택"하려면 `radio` 메서드를 사용합니다. 역시, CSS 셀렉터를 모두 지정하지 않아도 되고, 일치하는 셀렉터가 없으면 해당 `name`과 `value` 속성이 일치하는 라디오 버튼을 찾아내 동작합니다.

```
$browser->radio('size', 'large');
```

<a name="attaching-files"></a>
### 파일 첨부하기

`attach` 메서드를 사용하면 `file` input 요소에 파일을 첨부할 수 있습니다. 역시, 전체 CSS 셀렉터 없이 `name` 속성이 일치하는 파일 입력을 자동으로 찾습니다.

```
$browser->attach('photo', __DIR__.'/photos/mountains.png');
```

> [!WARNING]  
> 파일 첨부 기능(`attach`)을 사용하려면 PHP의 `Zip` 확장 모듈이 서버에 설치되어 있어야 하며, 활성화되어 있어야 합니다.

<a name="pressing-buttons"></a>
### 버튼 클릭하기

`press` 메서드를 사용하면 페이지 내 버튼 요소를 클릭할 수 있습니다. `press` 메서드의 인자로는 버튼의 표시 텍스트 혹은 CSS/Dusk 셀렉터를 전달할 수 있습니다.

```
$browser->press('Login');
```

폼을 제출할 때, 많은 애플리케이션이 폼 제출 버튼을 눌렀을 때 비활성화시키고, HTTP 요청이 완료된 후 다시 활성화시키는 경우가 많습니다. 버튼을 클릭하고 버튼이 다시 활성화될 때까지 기다리려면 `pressAndWaitFor` 메서드를 사용할 수 있습니다.

```
// 버튼 클릭 후 최대 5초 동안 활성화를 기다립니다...
$browser->pressAndWaitFor('Save');

// 버튼 클릭 후 최대 1초 동안 활성화를 기다립니다...
$browser->pressAndWaitFor('Save', 1);
```

<a name="clicking-links"></a>
### 링크 클릭하기

링크를 클릭하려면 브라우저 인스턴스에서 `clickLink` 메서드를 사용하세요. `clickLink` 메서드는 주어진 표시 텍스트를 가진 링크를 클릭합니다.

```
$browser->clickLink($linkText);
```

`seeLink` 메서드를 사용하면 특정 표시 텍스트를 가진 링크가 페이지에 보이는지 확인할 수 있습니다.

```
if ($browser->seeLink($linkText)) {
    // ...
}
```

> [!WARNING]  
> 이들 메서드는 jQuery와 상호작용합니다. 만약 페이지에 jQuery가 없다면, Dusk가 테스트 실행 동안 사용할 수 있도록 자동으로 jQuery를 주입합니다.

<a name="using-the-keyboard"></a>
### 키보드 사용

`keys` 메서드를 사용하면 `type` 메서드보다 더 복잡한 입력 시퀀스를 요소에 전달할 수 있습니다. 예를 들어, modifier 키를 누른 채 값을 입력하도록 Dusk에 지시할 수 있습니다. 아래 예제에서, `{shift}` 키를 누른 상태에서 `taylor`가 입력되고, 이어서 modifier 키 없이 `swift`가 입력됩니다.

```
$browser->keys('selector', ['{shift}', 'taylor'], 'swift');
```

`keys` 메서드는 키보드 단축키 조합을 애플리케이션의 대표 CSS 셀렉터에 전달할 때도 유용합니다.

```
$browser->keys('.app', ['{command}', 'j']);
```

> [!NOTE]  
> `{command}`와 같은 modifier 키는 모두 `{}`로 감싸며, 이는 `Facebook\WebDriver\WebDriverKeys` 클래스에 정의된 상수와 일치합니다. 해당 상수 목록은 [GitHub에서 확인할 수 있습니다](https://github.com/php-webdriver/php-webdriver/blob/master/lib/WebDriverKeys.php).

<a name="fluent-keyboard-interactions"></a>
#### 유연한 키보드 상호작용

Dusk는 `withKeyboard` 메서드를 제공하여, `Laravel\Dusk\Keyboard` 클래스를 통해 좀 더 유연하게 복잡한 키보드 상호작용을 할 수 있습니다. `Keyboard` 클래스에서는 `press`, `release`, `type`, `pause` 등의 메서드를 사용할 수 있습니다.

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

테스트 전체에서 쉽게 재사용할 수 있는 커스텀 키보드 상호작용을 정의하려면, `Keyboard` 클래스의 `macro` 메서드를 사용하세요. 일반적으로 이 메서드는 [서비스 프로바이더](/docs/11.x/providers)의 `boot` 메서드에서 호출합니다.

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

`macro` 함수는 첫 번째 인자로 이름, 두 번째 인자로 클로저를 받습니다. 이후 `Keyboard` 인스턴스에서 해당 이름의 메서드처럼 호출하면 클로저가 실행됩니다.

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

`click` 메서드를 사용하면 주어진 CSS 또는 Dusk 셀렉터와 일치하는 요소를 클릭할 수 있습니다.

```
$browser->click('.selector');
```

`clickAtXPath` 메서드는 지정한 XPath 표현식과 일치하는 요소를 클릭할 때 사용할 수 있습니다.

```
$browser->clickAtXPath('//div[@class = "selector"]');
```

`clickAtPoint` 메서드는 브라우저에서 보이는 영역 내의 지정한 좌표(픽셀 위치)에 가장 가까운 요소를 클릭합니다.

```
$browser->clickAtPoint($x = 0, $y = 0);
```

`doubleClick` 메서드는 마우스 더블 클릭을 시뮬레이션합니다.

```
$browser->doubleClick();

$browser->doubleClick('.selector');
```

`rightClick` 메서드는 마우스 오른쪽 버튼 클릭을 시뮬레이션합니다.

```
$browser->rightClick();

$browser->rightClick('.selector');
```

`clickAndHold` 메서드는 마우스 버튼을 클릭한 상태로 유지하는 동작을 시뮬레이션할 수 있습니다. 이후 `releaseMouse` 메서드를 호출하면 마우스 버튼이 해제됩니다.

```
$browser->clickAndHold('.selector');

$browser->clickAndHold()
    ->pause(1000)
    ->releaseMouse();
```

`controlClick` 메서드를 사용하면 브라우저에서 `ctrl+클릭` 이벤트를 시뮬레이션할 수 있습니다.

```
$browser->controlClick();

$browser->controlClick('.selector');
```

<a name="mouseover"></a>
#### 마우스오버

`mouseover` 메서드는 지정한 CSS 또는 Dusk 셀렉터와 일치하는 요소 위로 마우스를 이동시키는 동작을 구현할 때 사용할 수 있습니다.

```
$browser->mouseover('.selector');
```

<a name="drag-drop"></a>
#### 드래그 & 드롭

`drag` 메서드를 사용하면 특정 셀렉터에 해당하는 요소를 다른 요소 위치로 드래그할 수 있습니다.

```
$browser->drag('.from-selector', '.to-selector');
```

또는 한 방향으로만 요소를 드래그할 수도 있습니다.

```
$browser->dragLeft('.selector', $pixels = 10);
$browser->dragRight('.selector', $pixels = 10);
$browser->dragUp('.selector', $pixels = 10);
$browser->dragDown('.selector', $pixels = 10);
```

마지막으로, 지정한 만큼 좌표(오프셋)만큼 요소를 드래그할 수도 있습니다.

```
$browser->dragOffset('.selector', $x = 10, $y = 10);
```

<a name="javascript-dialogs"></a>
### 자바스크립트 대화상자 처리

Dusk는 자바스크립트 대화상자와 상호작용할 수 있는 여러 메서드를 제공합니다. 예를 들어, `waitForDialog` 메서드를 사용하면 자바스크립트 대화상자가 나타날 때까지 대기할 수 있습니다. 이 메서드는 몇 초 동안 기다릴지 선택적으로 인수로 받을 수 있습니다.

```
$browser->waitForDialog($seconds = null);
```

`assertDialogOpened` 메서드는 대화상자가 실제로 열리고, 특정 메시지를 포함하고 있는지 확인할 때 사용합니다.

```
$browser->assertDialogOpened('Dialog message');
```

자바스크립트 대화상자에 프롬프트가 있다면, `typeInDialog` 메서드를 사용해 값을 입력할 수 있습니다.

```
$browser->typeInDialog('Hello World');
```

열려 있는 자바스크립트 대화상자를 "확인" 버튼으로 닫으려면 `acceptDialog` 메서드를 호출하세요.

```
$browser->acceptDialog();
```

"취소" 버튼을 클릭해 대화상자를 닫고 싶다면 `dismissDialog` 메서드를 사용하세요.

```
$browser->dismissDialog();
```

<a name="interacting-with-iframes"></a>
### 인라인 프레임(iframe)과 상호작용하기

iframe 안의 요소와 상호작용해야 할 때는 `withinFrame` 메서드를 사용합니다. `withinFrame` 메서드에 전달하는 클로저 내에서 실행하는 모든 요소 관련 작업은 지정한 iframe 내부에서만 동작하게 됩니다.

```
$browser->withinFrame('#credit-card-details', function ($browser) {
    $browser->type('input[name="cardnumber"]', '4242424242424242')
        ->type('input[name="exp-date"]', '1224')
        ->type('input[name="cvc"]', '123')
        ->press('Pay');
});
```

<a name="scoping-selectors"></a>
### 셀렉터에 범위 지정하기

여러 작업을 동일한 셀렉터 범위 내에서 실행하고 싶을 때가 있습니다. 예를 들어, 특정 텍스트가 테이블 내에만 있는지 확인한 뒤, 그 테이블 내 버튼을 클릭하고 싶을 수 있습니다. 이럴 때 `with` 메서드를 활용할 수 있습니다. 전달된 클로저 안에서의 모든 작업은 처음 정의한 셀렉터 범위 안에서만 실행됩니다.

```
$browser->with('.table', function (Browser $table) {
    $table->assertSee('Hello World')
        ->clickLink('Delete');
});
```

현재 범위 밖에서 검증(assertion) 등을 실행해야 할 경우도 있는데, 이때는 `elsewhere`와 `elsewhereWhenAvailable` 메서드를 사용할 수 있습니다.

```
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

자바스크립트를 많이 사용하는 애플리케이션을 테스트하다 보면, 어떤 요소나 데이터가 나타날 때까지 테스트 진행을 잠시 대기(기다림)해야 할 때가 많습니다. Dusk에서는 이런 상황을 아주 쉽게 처리할 수 있습니다. 다양한 메서드를 이용해 특정 요소가 페이지에 나타나거나, 자바스크립트 식이 `true`가 될 때까지 기다릴 수 있습니다.

<a name="waiting"></a>
#### 대기(Pause, Waiting)

단순히 주어진 밀리초(ms) 만큼 테스트를 일시정지하고 싶다면, `pause` 메서드를 사용하세요.

```
$browser->pause(1000);
```

특정 조건이 `true`인 경우에만 대기하려면 `pauseIf` 메서드를 사용합니다.

```
$browser->pauseIf(App::environment('production'), 1000);
```

반대로, 특정 조건이 `true`가 아니라면 대기하려면 `pauseUnless` 메서드를 사용할 수 있습니다.

```
$browser->pauseUnless(App::environment('testing'), 1000);
```

<a name="waiting-for-selectors"></a>
#### 셀렉터 등장 대기

`waitFor` 메서드는 주어진 CSS 또는 Dusk 셀렉터가 페이지에 표시될 때까지 테스트 실행을 멈춥니다. 기본적으로 최대 5초 동안 대기하며, 그 후에도 나타나지 않으면 예외가 발생합니다. 필요하다면 두 번째 인자로 타임아웃(초)를 지정할 수 있습니다.

```
// 셀렉터가 나타날 때 최대 5초 대기...
$browser->waitFor('.selector');

// 셀렉터가 나타날 때 최대 1초 대기...
$browser->waitFor('.selector', 1);
```

지정한 셀렉터 요소에 특정 텍스트가 나타날 때까지 기다릴 수도 있습니다.

```
// 셀렉터에 지정한 텍스트가 등장할 때까지 최대 5초 대기...
$browser->waitForTextIn('.selector', 'Hello World');

// 셀렉터에 지정한 텍스트가 등장할 때까지 최대 1초 대기...
$browser->waitForTextIn('.selector', 'Hello World', 1);
```

특정 셀렉터 요소가 페이지에서 사라질 때까지 기다릴 수도 있습니다.

```
// 셀렉터가 사라질 때까지 최대 5초 대기...
$browser->waitUntilMissing('.selector');

// 셀렉터가 사라질 때까지 최대 1초 대기...
$browser->waitUntilMissing('.selector', 1);
```

또는 셀렉터에 해당하는 요소가 활성화(활성, enabled)되거나 비활성화(disabled)될 때까지 기다릴 수도 있습니다.

```
// 셀렉터가 활성화될 때까지 최대 5초 대기...
$browser->waitUntilEnabled('.selector');

// 셀렉터가 활성화될 때까지 최대 1초 대기...
$browser->waitUntilEnabled('.selector', 1);

// 셀렉터가 비활성화될 때까지 최대 5초 대기...
$browser->waitUntilDisabled('.selector');

// 셀렉터가 비활성화될 때까지 최대 1초 대기...
$browser->waitUntilDisabled('.selector', 1);
```

<a name="scoping-selectors-when-available"></a>

#### 선택자 범위 지정 사용하기

가끔 특정 셀렉터에 해당하는 요소가 나타날 때까지 기다렸다가 해당 요소와 상호작용하고 싶은 경우가 있습니다. 예를 들어, 모달 창이 나타날 때까지 기다렸다가 모달 안의 "OK" 버튼을 클릭하려는 경우가 있습니다. 이러한 상황에서는 `whenAvailable` 메서드를 사용하면 됩니다. 이 메서드에 전달한 클로저 내부에서 이루어지는 모든 요소 작업은 원래 지정한 셀렉터로 범위가 한정됩니다.

```
$browser->whenAvailable('.modal', function (Browser $modal) {
    $modal->assertSee('Hello World')
        ->press('OK');
});
```

<a name="waiting-for-text"></a>
#### 텍스트가 나타날 때까지 대기

`waitForText` 메서드는 지정한 텍스트가 페이지에 표시될 때까지 기다릴 때 사용할 수 있습니다.

```
// 최대 5초 동안 텍스트가 나타날 때까지 대기...
$browser->waitForText('Hello World');

// 최대 1초 동안 텍스트가 나타날 때까지 대기...
$browser->waitForText('Hello World', 1);
```

페이지에 표시된 텍스트가 사라질 때까지 기다리고 싶다면 `waitUntilMissingText` 메서드를 사용할 수 있습니다.

```
// 최대 5초 동안 텍스트가 사라질 때까지 대기...
$browser->waitUntilMissingText('Hello World');

// 최대 1초 동안 텍스트가 사라질 때까지 대기...
$browser->waitUntilMissingText('Hello World', 1);
```

<a name="waiting-for-links"></a>
#### 링크가 나타날 때까지 대기

`waitForLink` 메서드는 지정한 링크 텍스트가 페이지에 보일 때까지 기다릴 때 사용할 수 있습니다.

```
// 최대 5초 동안 링크가 나타날 때까지 대기...
$browser->waitForLink('Create');

// 최대 1초 동안 링크가 나타날 때까지 대기...
$browser->waitForLink('Create', 1);
```

<a name="waiting-for-inputs"></a>
#### 입력 필드가 나타날 때까지 대기

`waitForInput` 메서드를 사용하면 지정한 입력 필드가 페이지에 보일 때까지 기다릴 수 있습니다.

```
// 최대 5초 동안 입력 필드가 나타날 때까지 대기...
$browser->waitForInput($field);

// 최대 1초 동안 입력 필드가 나타날 때까지 대기...
$browser->waitForInput($field, 1);
```

<a name="waiting-on-the-page-location"></a>
#### 페이지 위치가 변경될 때까지 대기

`$browser->assertPathIs('/home')`와 같이 경로를 검증하는 경우, `window.location.pathname`이 비동기적으로 업데이트되면 검증이 실패할 수 있습니다. 이럴 때는 `waitForLocation` 메서드로 특정 경로로 변경될 때까지 대기할 수 있습니다.

```
$browser->waitForLocation('/secret');
```

`waitForLocation` 메서드는 현재 창의 위치가 전체 URL로 바뀔 때까지 대기할 수도 있습니다.

```
$browser->waitForLocation('https://example.com/path');
```

또한, [네임드 라우트](/docs/11.x/routing#named-routes)의 위치로 변경될 때까지 대기할 수도 있습니다.

```
$browser->waitForRoute($routeName, $parameters);
```

<a name="waiting-for-page-reloads"></a>
#### 페이지가 새로고침될 때까지 대기

페이지에서 어떤 작업을 한 뒤 새로고침이 일어나는 경우, `waitForReload` 메서드로 새로고침이 완료될 때까지 기다릴 수 있습니다.

```
use Laravel\Dusk\Browser;

$browser->waitForReload(function (Browser $browser) {
    $browser->press('Submit');
})
->assertSee('Success!');
```

일반적으로 버튼 클릭 후 새로고침을 기다리는 경우가 많으므로, 더 간단하게 `clickAndWaitForReload` 메서드를 사용할 수도 있습니다.

```
$browser->clickAndWaitForReload('.selector')
    ->assertSee('something');
```

<a name="waiting-on-javascript-expressions"></a>
#### 자바스크립트 표현식이 true가 될 때까지 대기

특정 자바스크립트 표현식의 결과가 `true`가 될 때까지 테스트 실행을 잠시 멈추고 싶을 때가 있습니다. 이럴 때는 `waitUntil` 메서드를 사용하면 쉽게 처리할 수 있습니다. 이 메서드에 전달하는 표현식에는 `return` 키워드나 맨 끝의 세미콜론이 필요하지 않습니다.

```
// 최대 5초 동안 표현식이 true가 될 때까지 대기...
$browser->waitUntil('App.data.servers.length > 0');

// 최대 1초 동안 표현식이 true가 될 때까지 대기...
$browser->waitUntil('App.data.servers.length > 0', 1);
```

<a name="waiting-on-vue-expressions"></a>
#### Vue 표현식이 특정 값이 될 때까지 대기

`waitUntilVue`와 `waitUntilVueIsNot` 메서드는 [Vue 컴포넌트](https://vuejs.org) 속성이 특정 값이 될 때까지 기다리는 데 사용할 수 있습니다.

```
// 컴포넌트 속성이 지정한 값을 가질 때까지 대기...
$browser->waitUntilVue('user.name', 'Taylor', '@user');

// 컴포넌트 속성이 지정한 값을 갖지 않을 때까지 대기...
$browser->waitUntilVueIsNot('user.name', null, '@user');
```

<a name="waiting-for-javascript-events"></a>
#### 자바스크립트 이벤트가 발생할 때까지 대기

`waitForEvent` 메서드는 자바스크립트 이벤트가 발생할 때까지 테스트 실행을 일시 중지하는 데 사용할 수 있습니다.

```
$browser->waitForEvent('load');
```

이벤트 리스너는 기본적으로 현재 범위인 `body` 요소에 연결됩니다. 범위가 지정된 셀렉터를 사용할 경우 이벤트 리스너는 해당 일치하는 요소에 연결됩니다.

```
$browser->with('iframe', function (Browser $iframe) {
    // iframe의 load 이벤트가 발생할 때까지 대기...
    $iframe->waitForEvent('load');
});
```

또한 `waitForEvent`의 두 번째 인자로 셀렉터를 지정해 특정 요소에 이벤트 리스너를 붙일 수도 있습니다.

```
$browser->waitForEvent('load', '.selector');
```

`document`와 `window` 객체의 이벤트도 대기할 수 있습니다.

```
// document가 스크롤 될 때까지 대기...
$browser->waitForEvent('scroll', 'document');

// 최대 5초 동안 window 사이즈가 변경될 때까지 대기...
$browser->waitForEvent('resize', 'window', 5);
```

<a name="waiting-with-a-callback"></a>
#### 콜백으로 대기 조건 정의하기

Dusk의 다양한 "wait" 계열 메서드는 내부적으로 `waitUsing` 메서드를 사용합니다. 이 메서드를 직접 활용하여, 특정 클로저가 `true`를 반환할 때까지 기다릴 수 있습니다. `waitUsing`에는 대기할 최대 초, 클로저 평가 간격(초), 클로저, 그리고 실패 시 표시할 메시지를 전달합니다.

```
$browser->waitUsing(10, 1, function () use ($something) {
    return $something->isReady();
}, "Something wasn't ready in time.");
```

<a name="scrolling-an-element-into-view"></a>
### 요소가 화면에 보이도록 스크롤하기

간혹 요소가 브라우저의 보이는 영역 밖에 있어서 클릭할 수 없는 경우가 있습니다. 이럴 때는 `scrollIntoView` 메서드를 사용하여 해당 셀렉터의 요소가 화면에 표시되도록 자동으로 스크롤할 수 있습니다.

```
$browser->scrollIntoView('.selector')
    ->click('.selector');
```

<a name="available-assertions"></a>
## 사용 가능한 Assertion(검증) 메서드

Dusk에서는 애플리케이션을 대상으로 다양한 assertion(검증)을 수행할 수 있습니다. 아래는 Dusk에서 사용할 수 있는 assertion 메서드 목록입니다.

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

페이지의 제목(title)이 지정한 텍스트와 일치하는지 검증합니다.

```
$browser->assertTitle($title);
```

<a name="assert-title-contains"></a>
#### assertTitleContains

페이지의 제목(title)에 지정한 텍스트가 포함되어 있는지 검증합니다.

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

현재 URL의 scheme(프로토콜)이 지정한 scheme과 일치하는지 검증합니다.

```
$browser->assertSchemeIs($scheme);
```

<a name="assert-scheme-is-not"></a>
#### assertSchemeIsNot

현재 URL의 scheme(프로토콜)이 지정한 scheme과 다름을 검증합니다.

```
$browser->assertSchemeIsNot($scheme);
```

<a name="assert-host-is"></a>
#### assertHostIs

현재 URL의 host가 지정한 host와 일치하는지 검증합니다.

```
$browser->assertHostIs($host);
```

<a name="assert-host-is-not"></a>
#### assertHostIsNot

현재 URL의 host가 지정한 host와 다름을 검증합니다.

```
$browser->assertHostIsNot($host);
```

<a name="assert-port-is"></a>
#### assertPortIs

현재 URL의 포트(port)가 지정한 값과 일치하는지 검증합니다.

```
$browser->assertPortIs($port);
```

<a name="assert-port-is-not"></a>
#### assertPortIsNot

현재 URL의 포트(port)가 지정한 값과 다름을 검증합니다.

```
$browser->assertPortIsNot($port);
```

<a name="assert-path-begins-with"></a>
#### assertPathBeginsWith

현재 URL의 경로가 지정한 문자열로 시작하는지 검증합니다.

```
$browser->assertPathBeginsWith('/home');
```

<a name="assert-path-ends-with"></a>
#### assertPathEndsWith

현재 URL의 경로가 지정한 문자열로 끝나는지 검증합니다.

```
$browser->assertPathEndsWith('/home');
```

<a name="assert-path-contains"></a>
#### assertPathContains

현재 URL의 경로가 지정한 문자열을 포함하는지 검증합니다.

```
$browser->assertPathContains('/home');
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

현재 URL이 지정한 [네임드 라우트](/docs/11.x/routing#named-routes)의 URL과 일치하는지 검증합니다.

```
$browser->assertRouteIs($name, $parameters);
```

<a name="assert-query-string-has"></a>
#### assertQueryStringHas

지정한 쿼리 스트링 파라미터가 존재하는지 검증합니다.

```
$browser->assertQueryStringHas($name);
```

지정한 쿼리 스트링 파라미터가 지정한 값을 가지고 있는지도 검증할 수 있습니다.

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

URL의 현재 해시 파편(fragment)이 지정한 값과 일치하는지 검증합니다.

```
$browser->assertFragmentIs('anchor');
```

<a name="assert-fragment-begins-with"></a>
#### assertFragmentBeginsWith

URL의 현재 해시 파편(fragment)이 지정한 값으로 시작하는지 검증합니다.

```
$browser->assertFragmentBeginsWith('anchor');
```

<a name="assert-fragment-is-not"></a>
#### assertFragmentIsNot

URL의 현재 해시 파편(fragment)이 지정한 값과 다름을 검증합니다.

```
$browser->assertFragmentIsNot('anchor');
```

<a name="assert-has-cookie"></a>
#### assertHasCookie

지정한 암호화된 쿠키가 존재하는지 검증합니다.

```
$browser->assertHasCookie($name);
```

<a name="assert-has-plain-cookie"></a>
#### assertHasPlainCookie

지정한 암호화되지 않은(plain) 쿠키가 존재하는지 검증합니다.

```
$browser->assertHasPlainCookie($name);
```

<a name="assert-cookie-missing"></a>
#### assertCookieMissing

지정한 암호화된 쿠키가 없는지 검증합니다.

```
$browser->assertCookieMissing($name);
```

<a name="assert-plain-cookie-missing"></a>
#### assertPlainCookieMissing

지정한 암호화되지 않은(plain) 쿠키가 없는지 검증합니다.

```
$browser->assertPlainCookieMissing($name);
```

<a name="assert-cookie-value"></a>
#### assertCookieValue

암호화된 쿠키가 지정한 값을 가지고 있는지 검증합니다.

```
$browser->assertCookieValue($name, $value);
```

<a name="assert-plain-cookie-value"></a>
#### assertPlainCookieValue

암호화되지 않은(plain) 쿠키가 지정한 값을 가지고 있는지 검증합니다.

```
$browser->assertPlainCookieValue($name, $value);
```

<a name="assert-see"></a>
#### assertSee

페이지에 지정한 텍스트가 보이는지 검증합니다.

```
$browser->assertSee($text);
```

<a name="assert-dont-see"></a>
#### assertDontSee

페이지에 지정한 텍스트가 보이지 않는지 검증합니다.

```
$browser->assertDontSee($text);
```

<a name="assert-see-in"></a>
#### assertSeeIn

지정한 셀렉터 내부에 주어진 텍스트가 존재하는지 검증합니다.

```
$browser->assertSeeIn($selector, $text);
```

<a name="assert-dont-see-in"></a>
#### assertDontSeeIn

지정한 셀렉터 내부에 주어진 텍스트가 존재하지 않는지 검증합니다.

```
$browser->assertDontSeeIn($selector, $text);
```

<a name="assert-see-anything-in"></a>
#### assertSeeAnythingIn

지정한 셀렉터 내부에 어떤 텍스트든 존재하는지 검증합니다.

```
$browser->assertSeeAnythingIn($selector);
```

<a name="assert-see-nothing-in"></a>
#### assertSeeNothingIn

지정한 셀렉터 내부에 어떠한 텍스트도 존재하지 않는지 검증합니다.

```
$browser->assertSeeNothingIn($selector);
```

<a name="assert-script"></a>

#### assertScript

주어진 자바스크립트 표현식이 기대하는 값으로 평가되는지 확인합니다.

```
$browser->assertScript('window.isLoaded')
        ->assertScript('document.readyState', 'complete');
```

<a name="assert-source-has"></a>
#### assertSourceHas

페이지에 특정 소스 코드가 포함되어 있는지 확인합니다.

```
$browser->assertSourceHas($code);
```

<a name="assert-source-missing"></a>
#### assertSourceMissing

페이지에 특정 소스 코드가 포함되어 있지 않은지 확인합니다.

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

지정한 입력 필드에 특정 값이 들어 있는지 확인합니다.

```
$browser->assertInputValue($field, $value);
```

<a name="assert-input-value-is-not"></a>
#### assertInputValueIsNot

지정한 입력 필드에 특정 값이 들어 있지 않은지 확인합니다.

```
$browser->assertInputValueIsNot($field, $value);
```

<a name="assert-checked"></a>
#### assertChecked

지정한 체크박스가 체크된 상태인지 확인합니다.

```
$browser->assertChecked($field);
```

<a name="assert-not-checked"></a>
#### assertNotChecked

지정한 체크박스가 체크되지 않은 상태인지 확인합니다.

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

지정한 드롭다운(선택상자)에서 특정 값이 선택되어 있는지 확인합니다.

```
$browser->assertSelected($field, $value);
```

<a name="assert-not-selected"></a>
#### assertNotSelected

지정한 드롭다운(선택상자)에 특정 값이 선택되어 있지 않은지 확인합니다.

```
$browser->assertNotSelected($field, $value);
```

<a name="assert-select-has-options"></a>
#### assertSelectHasOptions

지정한 값 배열이 선택 가능 옵션으로 존재하는지 확인합니다.

```
$browser->assertSelectHasOptions($field, $values);
```

<a name="assert-select-missing-options"></a>
#### assertSelectMissingOptions

지정한 값 배열이 선택 가능 옵션으로 존재하지 않는지 확인합니다.

```
$browser->assertSelectMissingOptions($field, $values);
```

<a name="assert-select-has-option"></a>
#### assertSelectHasOption

지정한 필드에서 특정 값이 선택 옵션에 존재하는지 확인합니다.

```
$browser->assertSelectHasOption($field, $value);
```

<a name="assert-select-missing-option"></a>
#### assertSelectMissingOption

특정 값이 선택 옵션으로 존재하지 않는지 확인합니다.

```
$browser->assertSelectMissingOption($field, $value);
```

<a name="assert-value"></a>
#### assertValue

지정한 선택자에 해당하는 요소가 특정 값을 가지고 있는지 확인합니다.

```
$browser->assertValue($selector, $value);
```

<a name="assert-value-is-not"></a>
#### assertValueIsNot

지정한 선택자에 해당하는 요소가 특정 값을 가지고 있지 않은지 확인합니다.

```
$browser->assertValueIsNot($selector, $value);
```

<a name="assert-attribute"></a>
#### assertAttribute

지정한 선택자에 해당하는 요소가 특정 속성(attribute)에 주어진 값을 가지고 있는지 확인합니다.

```
$browser->assertAttribute($selector, $attribute, $value);
```

<a name="assert-attribute-missing"></a>
#### assertAttributeMissing

지정한 선택자에 해당하는 요소가 주어진 속성을 가지고 있지 않은지 확인합니다.

```
$browser->assertAttributeMissing($selector, $attribute);
```

<a name="assert-attribute-contains"></a>
#### assertAttributeContains

지정한 선택자에 해당하는 요소의 주어진 속성에 특정 값이 포함되어 있는지 확인합니다.

```
$browser->assertAttributeContains($selector, $attribute, $value);
```

<a name="assert-attribute-doesnt-contain"></a>
#### assertAttributeDoesntContain

지정한 선택자에 해당하는 요소의 주어진 속성에 특정 값이 포함되어 있지 않은지 확인합니다.

```
$browser->assertAttributeDoesntContain($selector, $attribute, $value);
```

<a name="assert-aria-attribute"></a>
#### assertAriaAttribute

지정한 선택자에 해당하는 요소의 주어진 aria 속성에 특정 값이 들어 있는지 확인합니다.

```
$browser->assertAriaAttribute($selector, $attribute, $value);
```

예를 들어, `<button aria-label="Add"></button>`이라는 마크업이 있다면, 다음과 같이 `aria-label` 속성에 대해 assert를 수행할 수 있습니다.

```
$browser->assertAriaAttribute('button', 'label', 'Add')
```

<a name="assert-data-attribute"></a>
#### assertDataAttribute

지정한 선택자에 해당하는 요소의 주어진 data 속성에 특정 값이 들어 있는지 확인합니다.

```
$browser->assertDataAttribute($selector, $attribute, $value);
```

예를 들어, `<tr id="row-1" data-content="attendees"></tr>`라는 마크업이 있다면, 다음과 같이 `data-label` 속성에 대해 assert를 수행할 수 있습니다.

```
$browser->assertDataAttribute('#row-1', 'content', 'attendees')
```

<a name="assert-visible"></a>
#### assertVisible

선택자에 해당하는 요소가 화면에 표시되고 있는지 확인합니다.

```
$browser->assertVisible($selector);
```

<a name="assert-present"></a>
#### assertPresent

선택자에 해당하는 요소가 페이지 소스에 존재하는지 확인합니다.

```
$browser->assertPresent($selector);
```

<a name="assert-not-present"></a>
#### assertNotPresent

선택자에 해당하는 요소가 페이지 소스에 존재하지 않는지 확인합니다.

```
$browser->assertNotPresent($selector);
```

<a name="assert-missing"></a>
#### assertMissing

선택자에 해당하는 요소가 화면에 표시되고 있지 않은지 확인합니다.

```
$browser->assertMissing($selector);
```

<a name="assert-input-present"></a>
#### assertInputPresent

지정한 이름을 가진 input 요소가 존재하는지 확인합니다.

```
$browser->assertInputPresent($name);
```

<a name="assert-input-missing"></a>
#### assertInputMissing

지정한 이름을 가진 input 요소가 페이지 소스에 존재하지 않는지 확인합니다.

```
$browser->assertInputMissing($name);
```

<a name="assert-dialog-opened"></a>
#### assertDialogOpened

지정한 메시지를 가진 자바스크립트 다이얼로그가 열렸는지 확인합니다.

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

지정한 필드가 비활성화되어 있는지 확인합니다.

```
$browser->assertDisabled($field);
```

<a name="assert-button-enabled"></a>
#### assertButtonEnabled

지정한 버튼이 활성화되어 있는지 확인합니다.

```
$browser->assertButtonEnabled($button);
```

<a name="assert-button-disabled"></a>
#### assertButtonDisabled

지정한 버튼이 비활성화되어 있는지 확인합니다.

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

사용자가 지정한 사용자로 인증되었는지 확인합니다.

```
$browser->assertAuthenticatedAs($user);
```

<a name="assert-vue"></a>
#### assertVue

Dusk는 [Vue 컴포넌트](https://vuejs.org) 데이터의 상태에 대해서도 assert(확인)할 수 있습니다. 예를 들어, 애플리케이션에 다음과 같은 Vue 컴포넌트가 있다고 가정해봅시다.

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

아래와 같이, Vue 컴포넌트의 상태를 assert 할 수 있습니다.

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

지정한 Vue 컴포넌트 데이터 속성이 기대값과 일치하지 않는지 확인합니다.

```
$browser->assertVueIsNot($property, $value, $componentSelector = null);
```

<a name="assert-vue-contains"></a>
#### assertVueContains

지정한 Vue 컴포넌트 데이터 속성이 배열일 때, 해당 배열에 특정 값이 포함되어 있는지 확인합니다.

```
$browser->assertVueContains($property, $value, $componentSelector = null);
```

<a name="assert-vue-doesnt-contain"></a>
#### assertVueDoesntContain

지정한 Vue 컴포넌트 데이터 속성이 배열일 때, 해당 배열에 특정 값이 포함되어 있지 않은지 확인합니다.

```
$browser->assertVueDoesntContain($property, $value, $componentSelector = null);
```

<a name="pages"></a>
## 페이지 (Pages)

때로는 테스트에서 여러 복잡한 작업을 연속적으로 수행해야 할 때가 있습니다. 이렇게 하면 테스트가 점점 읽기 어렵고 이해하기 어려워집니다. Dusk의 "페이지(Page)" 기능을 이용하면, 하나의 메서드를 통해 특정 페이지에서 실행되어야 하는 동작들을 명확하게 정의할 수 있습니다. 또한, 페이지별로 또는 전체 애플리케이션에 공통적으로 사용할 수 있는 선택자(selector)에 대한 단축 표현(숏컷)도 정의할 수 있습니다.

<a name="generating-pages"></a>
### 페이지 생성하기

페이지 오브젝트를 생성하려면 `dusk:page` Artisan 명령어를 실행하면 됩니다. 모든 페이지 오브젝트는 애플리케이션의 `tests/Browser/Pages` 디렉토리에 생성됩니다.

```
php artisan dusk:page Login
```

<a name="configuring-pages"></a>
### 페이지 설정하기

기본적으로, 각 페이지는 `url`, `assert`, `elements`라는 세 가지 메서드를 가집니다. 여기에서는 `url`과 `assert` 메서드를 먼저 살펴보고, `elements` 메서드는 [아래에서 더 자세히 설명합니다](#shorthand-selectors).

<a name="the-url-method"></a>
#### `url` 메서드

`url` 메서드는 해당 페이지를 나타내는 URL 경로(path)를 반환해야 합니다. Dusk는 브라우저에서 해당 페이지로 이동할 때 이 URL을 사용합니다.

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

`assert` 메서드는 브라우저가 실제로 지정한 페이지에 있는지 확인하기 위해 필요한 assert(확인) 코드를 작성할 수 있습니다. 이 메서드는 비워 둬도 되지만, 확인이 필요하다면 원하는 내용을 자유롭게 작성할 수 있습니다. 이 assert들은 해당 페이지로 이동할 때 자동으로 실행됩니다.

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

페이지를 정의했다면, `visit` 메서드를 사용하여 해당 페이지로 이동할 수 있습니다.

```
use Tests\Browser\Pages\Login;

$browser->visit(new Login);
```

이미 특정 페이지에 있고, 명시적으로 이동하지 않아도 페이지의 선택자(selector) 및 메서드를 현재 테스트 컨텍스트에 "불러와야" 하는 경우가 있습니다. 예를 들어, 버튼을 클릭한 후 리다이렉트되어 새로운 페이지로 이동했을 때 이러한 상황이 자주 발생합니다. 이 때는 `on` 메서드를 사용하여 페이지를 "불러올(on)" 수 있습니다.

```
use Tests\Browser\Pages\CreatePlaylist;

$browser->visit('/dashboard')
        ->clickLink('Create Playlist')
        ->on(new CreatePlaylist)
        ->assertSee('@create');
```

<a name="shorthand-selectors"></a>
### 단축 선택자(Shorthand Selectors)

페이지 클래스의 `elements` 메서드를 사용하면, 페이지 내에서 자주 사용하는 CSS 선택자에 대해 빠르고 기억하기 쉬운 단축키(별칭)를 정의할 수 있습니다. 예를 들어, 로그인 페이지의 "이메일" 입력 필드에 대한 단축키를 다음과 같이 정의할 수 있습니다.

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

단축키가 정의된 후에는, 평소 전체 CSS 선택자를 사용하는 곳 어디에서든 이 단축 선택자를 사용할 수 있습니다.

```
$browser->type('@email', 'taylor@laravel.com');
```

<a name="global-shorthand-selectors"></a>

#### 전역 단축 셀렉터

Dusk를 설치하면, 기본 `Page` 클래스가 `tests/Browser/Pages` 디렉터리에 생성됩니다. 이 클래스에는 `siteElements` 메서드가 포함되어 있으며, 이 메서드를 사용하여 애플리케이션 내 모든 페이지에서 사용할 수 있는 전역 단축 셀렉터를 정의할 수 있습니다.

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

페이지에 기본으로 정의된 메서드 외에도, 테스트 전반에서 사용할 수 있도록 추가 메서드를 자유롭게 정의할 수 있습니다. 예를 들어, 음악 관리 애플리케이션을 만든다고 가정해 봅시다. 이 중 한 페이지에서 자주 사용하는 동작이 '플레이리스트 생성'이라면, 매 테스트마다 플레이리스트 생성 로직을 반복해서 작성하기보다는, 해당 페이지 클래스에 `createPlaylist` 메서드를 추가할 수 있습니다.

```
<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;
use Laravel\Dusk\Page;

class Dashboard extends Page
{
    // 기타 페이지 메서드...

    /**
     * 새 플레이리스트를 생성합니다.
     */
    public function createPlaylist(Browser $browser, string $name): void
    {
        $browser->type('name', $name)
            ->check('share')
            ->press('Create Playlist');
    }
}
```

이렇게 메서드를 정의하면 해당 페이지를 사용하는 모든 테스트에서 쉽게 활용할 수 있습니다. 이때, 커스텀 페이지 메서드로 브라우저 인스턴스가 자동으로 첫 번째 인수로 전달됩니다.

```
use Tests\Browser\Pages\Dashboard;

$browser->visit(new Dashboard)
        ->createPlaylist('My Playlist')
        ->assertSee('My Playlist');
```

<a name="components"></a>
## 컴포넌트

컴포넌트는 Dusk의 '페이지 오브젝트(page object)'와 비슷하지만, 네비게이션 바나 알림 창처럼 애플리케이션 여러 곳에서 공통으로 사용되는 UI 및 기능 조각에 적합합니다. 이러한 이유로 컴포넌트는 특정 URL에 묶여 있지 않습니다.

<a name="generating-components"></a>
### 컴포넌트 생성하기

컴포넌트를 생성하려면 `dusk:component` Artisan 명령어를 실행하세요. 새로 생성된 컴포넌트는 `tests/Browser/Components` 디렉터리에 위치하게 됩니다.

```
php artisan dusk:component DatePicker
```

위 예시에서 볼 수 있듯이, 다양한 페이지에서 자주 활용되는 "날짜 선택기"는 컴포넌트로 분리하기에 좋은 예입니다. 만약 테스트 전체에서 날짜 선택 로직을 매번 반복해서 작성한다면 불편할 수 있습니다. 그런 대신 Dusk 컴포넌트를 정의하여 해당 로직을 컴포넌트에 캡슐화할 수 있습니다.

```
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
     * 브라우저 페이지에 컴포넌트가 포함되어 있는지 확인합니다.
     */
    public function assert(Browser $browser): void
    {
        $browser->assertVisible($this->selector());
    }

    /**
     * 컴포넌트의 엘리먼트 단축 셀렉터를 반환합니다.
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

컴포넌트를 정의한 이후에는, 모든 테스트에서 해당 날짜 선택기를 손쉽게 활용할 수 있습니다. 만약 날짜 선택 방식에 대한 로직이 변경되어도 컴포넌트만 수정하면 되어, 유지보수가 쉬워집니다.

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
     * 기본 컴포넌트 테스트 예시입니다.
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

> [!WARNING]  
> 대부분의 Dusk 지속적 통합 환경에서는 라라벨 애플리케이션이 포트 8000번에서 PHP 내장 개발 서버로 제공된다고 가정합니다. 따라서 계속 진행하기 전에, CI 환경에서 `APP_URL` 환경 변수의 값이 반드시 `http://127.0.0.1:8000` 으로 설정되어 있는지 확인해야 합니다.

<a name="running-tests-on-heroku-ci"></a>
### Heroku CI

[Heroku CI](https://www.heroku.com/continuous-integration)에서 Dusk 테스트를 실행하려면, 다음과 같이 Heroku `app.json` 파일에 Google Chrome 빌드팩과 스크립트를 추가해야 합니다.

```
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

[Travis CI](https://travis-ci.org)에서 Dusk 테스트를 실행하려면, 다음 `.travis.yml` 설정을 사용하십시오. Travis CI는 그래픽 환경이 아니기 때문에 크롬 브라우저를 실행하기 위한 추가 설정이 필요합니다. 또한, PHP의 내장 웹 서버를 실행하기 위해 `php artisan serve`를 사용합니다.

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

[GitHub Actions](https://github.com/features/actions)에서 Dusk 테스트를 실행하려는 경우, 아래 예시 설정 파일을 시작점으로 사용할 수 있습니다. TravisCI와 마찬가지로, `php artisan serve` 명령어를 사용하여 PHP 내장 웹 서버를 실행합니다.

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

[Chipper CI](https://chipperci.com)에서 Dusk 테스트를 실행하려는 경우, 아래 설정 파일을 참고하여 시작할 수 있습니다. 라라벨을 실행하기 위해 PHP의 내장 서버를 사용하여 요청을 처리합니다.

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

Chipper CI에서 Dusk 테스트 실행과 데이터베이스 활용 등, 더 자세한 내용은 [공식 Chipper CI 문서](https://chipperci.com/docs/testing/laravel-dusk-new/)를 참고하세요.