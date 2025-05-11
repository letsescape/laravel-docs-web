# 테스트: 시작하기 (Testing: Getting Started)

- [소개](#introduction)
- [환경](#environment)
- [테스트 생성](#creating-tests)
- [테스트 실행](#running-tests)
    - [병렬로 테스트 실행](#running-tests-in-parallel)
    - [테스트 커버리지 리포트](#reporting-test-coverage)
    - [테스트 프로파일링](#profiling-tests)

<a name="introduction"></a>
## 소개

라라벨은 테스트를 염두에 두고 설계되었습니다. 실제로, [Pest](https://pestphp.com)와 [PHPUnit](https://phpunit.de)를 이용한 테스트가 기본적으로 지원되며, 애플리케이션에 이미 `phpunit.xml` 파일이 설정되어 있습니다. 또한 프레임워크에는 애플리케이션을 효율적으로 테스트할 수 있는 다양한 편리한 헬퍼 메서드가 함께 제공됩니다.

기본적으로 여러분의 애플리케이션 `tests` 디렉터리에는 `Feature`와 `Unit`이라는 두 개의 하위 디렉터리가 있습니다. 단위 테스트(Unit test)는 코드의 아주 작은, 고립된 부분을 집중적으로 테스트합니다. 대부분의 단위 테스트는 아마 하나의 메서드에 집중되어 있을 것입니다. "Unit" 테스트 디렉터리에 있는 테스트들은 라라벨 애플리케이션을 부트하지 않으므로, 애플리케이션의 데이터베이스나 기타 프레임워크 서비스에 접근할 수 없습니다.

기능 테스트(Feature test)는 여러 객체 간의 상호작용, 혹은 전체 HTTP 요청/JSON 엔드포인트에 대한 테스트 등 보다 넓은 범위의 코드를 검증할 수 있습니다. **일반적으로 대부분의 테스트는 기능 테스트로 작성하는 것이 좋습니다. 이런 종류의 테스트야말로 시스템 전체가 의도한 대로 동작하는지 가장 높은 신뢰를 제공합니다.**

`Feature`와 `Unit` 테스트 디렉터리에는 각각 `ExampleTest.php` 파일이 기본 제공됩니다. 새로운 라라벨 애플리케이션을 설치한 후에는, `vendor/bin/pest`, `vendor/bin/phpunit`, 또는 `php artisan test` 명령어를 실행하여 테스트를 수행할 수 있습니다.

<a name="environment"></a>
## 환경

테스트를 실행하면, 라라벨은 `phpunit.xml` 파일에 정의된 환경 변수 덕분에 [애플리케이션 환경 설정](/docs/configuration#environment-configuration)을 자동으로 `testing`으로 지정합니다. 또한 세션과 캐시 역시 `array` 드라이버로 자동 설정되기 때문에, 테스트 중에는 세션이나 캐시 데이터가 영구적으로 저장되지 않습니다.

필요하다면 테스트 환경에 맞는 다른 환경 설정 값을 마음대로 추가할 수 있습니다. `testing` 환경 변수들은 애플리케이션의 `phpunit.xml` 파일에서 설정할 수 있지만, 테스트를 실행하기 전에 반드시 `config:clear` 아티즌 명령어로 설정 캐시를 비워야 합니다!

<a name="the-env-testing-environment-file"></a>
#### `.env.testing` 환경 파일

추가적으로, 프로젝트 루트 디렉터리에 `.env.testing` 파일을 만들 수도 있습니다. 이 파일은 Pest 및 PHPUnit 테스트를 실행하거나 `--env=testing` 옵션과 함께 아티즌 명령어를 사용할 때 `.env` 파일 대신 사용됩니다.

<a name="creating-tests"></a>
## 테스트 생성

새로운 테스트 케이스를 만들 때는 `make:test` 아티즌 명령어를 사용합니다. 기본적으로 테스트는 `tests/Feature` 디렉터리에 생성됩니다.

```shell
php artisan make:test UserTest
```

`tests/Unit` 디렉터리에 테스트를 생성하려면, `make:test` 명령어를 실행할 때 `--unit` 옵션을 추가하세요.

```shell
php artisan make:test UserTest --unit
```

> [!NOTE]
> 테스트 스텁은 [스텁 퍼블리싱](/docs/artisan#stub-customization)를 통해 사용자 정의가 가능합니다.

테스트가 생성되면, Pest 또는 PHPUnit을 사용하여 일반적으로 테스트 케이스를 작성할 수 있습니다. 테스트를 실행할 때는 터미널에서 `vendor/bin/pest`, `vendor/bin/phpunit`, 또는 `php artisan test` 명령어를 입력하면 됩니다.

```php tab=Pest
<?php

test('basic', function () {
    expect(true)->toBeTrue();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_basic_test(): void
    {
        $this->assertTrue(true);
    }
}
```

> [!WARNING]
> 테스트 클래스 내에서 직접 `setUp`/`tearDown` 메서드를 정의하는 경우, 반드시 상위 클래스의 `parent::setUp()`/`parent::tearDown()`을 각각 호출해야 합니다. 일반적으로는 여러분의 `setUp` 메서드 시작 부분에서 `parent::setUp()`을, `tearDown` 메서드 끝부분에서 `parent::tearDown()`을 호출하면 됩니다.

<a name="running-tests"></a>
## 테스트 실행

앞서 설명한 것처럼, 테스트를 작성한 후에는 `pest` 또는 `phpunit` 명령어를 사용해 실행할 수 있습니다.

```shell tab=Pest
./vendor/bin/pest
```

```shell tab=PHPUnit
./vendor/bin/phpunit
```

`pest` 또는 `phpunit` 명령어 외에도, 아티즌의 `test` 명령어를 사용하여 테스트를 실행할 수 있습니다. 아티즌 테스트 실행기는 개발 및 디버깅을 돕기 위해 상세한 테스트 리포트를 제공합니다.

```shell
php artisan test
```

`pest`나 `phpunit` 명령어에 전달할 수 있는 모든 인수는 아티즌 `test` 명령어에도 똑같이 사용할 수 있습니다.

```shell
php artisan test --testsuite=Feature --stop-on-failure
```

<a name="running-tests-in-parallel"></a>
### 병렬로 테스트 실행

기본적으로 라라벨과 Pest/PHPUnit은 하나의 프로세스에서 테스트를 순차적으로 실행합니다. 하지만 여러 프로세스에서 동시에 테스트를 실행하면 테스트 시간이 대폭 줄어듭니다. 먼저, "dev" 의존성으로 `brianium/paratest` Composer 패키지를 설치해야 합니다. 그 후, 아티즌 `test` 명령어를 실행할 때 `--parallel` 옵션을 추가하세요.

```shell
composer require brianium/paratest --dev

php artisan test --parallel
```

라라벨은 기본적으로 여러분 시스템의 CPU 코어 개수만큼 프로세스를 생성합니다. 프로세스 개수는 `--processes` 옵션으로 조절할 수 있습니다.

```shell
php artisan test --parallel --processes=4
```

> [!WARNING]
> 병렬 테스트 실행 시 일부 Pest/PHPUnit 옵션(예: `--do-not-cache-result`)은 사용할 수 없습니다.

<a name="parallel-testing-and-databases"></a>
#### 병렬 테스트와 데이터베이스

기본 데이터베이스 연결만 설정되어 있다면, 라라벨은 병렬로 실행되는 각 테스트 프로세스마다 테스트용 데이터베이스를 자동으로 생성하고 마이그레이션합니다. 테스트 데이터베이스는 각 프로세스마다 고유한 토큰으로 이름이 구분됩니다. 예를 들어, 두 개의 병렬 테스트 프로세스가 있다면 라라벨은 `your_db_test_1`과 `your_db_test_2`처럼 별도의 데이터베이스를 생성하여 사용합니다.

기본적으로 테스트 데이터베이스는 `test` 아티즌 명령어를 여러 번 실행해도 유지되어 다음 테스트 실행에 재사용할 수 있습니다. 그러나 `--recreate-databases` 옵션을 사용하여 데이터베이스를 매번 새로 생성할 수도 있습니다.

```shell
php artisan test --parallel --recreate-databases
```

<a name="parallel-testing-hooks"></a>
#### 병렬 테스트 훅(Hook) 사용하기

애플리케이션 테스트에 사용되는 일부 리소스를 병렬 테스트 각 프로세스에서 안전하게 사용할 수 있도록 별도의 사전 준비가 필요할 때가 있습니다.

`ParallelTesting` 파사드를 사용하여 프로세스나 테스트 케이스의 `setUp` 또는 `tearDown` 시 실행할 코드를 지정할 수 있습니다. 이때 제공되는 클로저는 각각 프로세스 토큰(`$token`) 및 현재 테스트 케이스(`$testCase`)를 인자로 전달받습니다.

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\ParallelTesting;
use Illuminate\Support\ServiceProvider;
use PHPUnit\Framework\TestCase;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ParallelTesting::setUpProcess(function (int $token) {
            // ...
        });

        ParallelTesting::setUpTestCase(function (int $token, TestCase $testCase) {
            // ...
        });

        // 테스트 데이터베이스가 생성될 때 실행...
        ParallelTesting::setUpTestDatabase(function (string $database, int $token) {
            Artisan::call('db:seed');
        });

        ParallelTesting::tearDownTestCase(function (int $token, TestCase $testCase) {
            // ...
        });

        ParallelTesting::tearDownProcess(function (int $token) {
            // ...
        });
    }
}
```

<a name="accessing-the-parallel-testing-token"></a>
#### 병렬 테스트 토큰 접근하기

애플리케이션 테스트 코드 어디서나 현재 병렬 프로세스의 "토큰"값을 사용하려면, `token` 메서드를 이용하면 됩니다. 이 토큰은 각 병렬 테스트 프로세스를 구분해주는 고유한 문자열 식별자이며, 여러 프로세스 간 리소스를 분리하는 데 활용할 수 있습니다. 예를 들어, 라라벨은 각 병렬 테스트 프로세스가 생성하는 테스트 데이터베이스의 이름 끝에 이 토큰을 추가합니다.

```
$token = ParallelTesting::token();
```

<a name="reporting-test-coverage"></a>
### 테스트 커버리지 리포트

> [!WARNING]
> 이 기능을 사용하려면 [Xdebug](https://xdebug.org) 또는 [PCOV](https://pecl.php.net/package/pcov)가 필요합니다.

애플리케이션 테스트를 실행할 때, 실제로 테스트 케이스가 애플리케이션 코드의 어느 부분을 얼마나 실행(커버)하고 있는지 알고 싶을 수 있습니다. 이를 위해 `test` 명령어를 실행할 때 `--coverage` 옵션을 추가하면 됩니다.

```shell
php artisan test --coverage
```

<a name="enforcing-a-minimum-coverage-threshold"></a>
#### 최소 커버리지 기준 강제하기

`--min` 옵션을 사용하여 애플리케이션 테스트의 최소 커버리지 기준을 설정할 수 있습니다. 커버리지가 이 기준에 미치지 못하면 테스트가 실패합니다.

```shell
php artisan test --coverage --min=80.3
```

<a name="profiling-tests"></a>
### 테스트 프로파일링

아티즌 테스트 실행기는 애플리케이션의 가장 느린 테스트 목록을 간편하게 확인할 수 있도록 지원합니다. `test` 명령어에 `--profile` 옵션을 추가하면, 가장 느린 10개의 테스트 목록이 표시되어 테스트 속도를 개선할 대상을 쉽게 찾을 수 있습니다.

```shell
php artisan test --profile
```
