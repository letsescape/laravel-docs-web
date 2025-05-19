# 테스트: 시작하기 (Testing: Getting Started)

- [소개](#introduction)
- [환경](#environment)
- [테스트 생성](#creating-tests)
- [테스트 실행](#running-tests)
    - [테스트 병렬 실행](#running-tests-in-parallel)
    - [테스트 커버리지 리포트](#reporting-test-coverage)
    - [테스트 프로파일링](#profiling-tests)

<a name="introduction"></a>
## 소개

라라벨은 테스트를 염두에 두고 설계되었습니다. 실제로 [Pest](https://pestphp.com)와 [PHPUnit](https://phpunit.de)을 이용한 테스트가 기본적으로 지원되며, 애플리케이션에는 이미 `phpunit.xml` 파일이 준비되어 있습니다. 또한, 라라벨은 애플리케이션을 보다 표현적으로 테스트할 수 있도록 다양한 헬퍼 메서드도 제공합니다.

기본적으로 여러분의 애플리케이션 `tests` 디렉터리에는 `Feature`와 `Unit`이라는 두 개의 하위 디렉터리가 존재합니다. 유닛 테스트(Unit test)는 코드의 아주 작은, 고립된 부분을 검증하는 테스트입니다. 대부분의 유닛 테스트는 하나의 메서드에 초점을 맞추는 경우가 많습니다. "Unit" 테스트 디렉터리에 있는 테스트들은 라라벨 애플리케이션을 부팅하지 않으므로, 데이터베이스나 프레임워크의 기타 서비스에 접근할 수 없습니다.

피처 테스트(Feature test)는 여러 객체 간의 상호작용이나, JSON 엔드포인트를 포함한 전체 HTTP 요청 등 코드의 더 넓은 영역을 테스트할 수 있습니다. **일반적으로는 대부분의 테스트가 피처 테스트여야 하며, 이와 같은 테스트는 시스템 전체가 의도한 대로 동작하는지 가장 효과적으로 확인할 수 있습니다.**

`ExampleTest.php` 파일이 `Feature`와 `Unit` 테스트 디렉터리 각각에 제공됩니다. 새로 라라벨 애플리케이션을 설치했다면, `vendor/bin/pest`, `vendor/bin/phpunit`, 또는 `php artisan test` 명령어를 실행하여 테스트를 수행할 수 있습니다.

<a name="environment"></a>
## 환경

테스트를 실행할 때, 라라벨은 `phpunit.xml` 파일에 정의된 환경 변수로 인해 [설정 환경](/docs/11.x/configuration#environment-configuration)이 자동으로 `testing`으로 지정됩니다. 라라벨은 세션 및 캐시 드라이버도 자동으로 `array`로 설정하므로, 테스트 중에는 세션이나 캐시 데이터가 실제로 저장되지 않습니다.

필요에 따라 자유롭게 추가적인 테스트 환경 설정값을 지정할 수 있습니다. `testing` 환경 변수는 애플리케이션의 `phpunit.xml` 파일에서 설정할 수 있지만, 테스트를 실행하기 전에 반드시 `config:clear` 아티즌 명령어로 설정 캐시를 비워야 합니다!

<a name="the-env-testing-environment-file"></a>
#### `.env.testing` 환경 파일

추가로, 프로젝트 루트에 `.env.testing` 파일을 생성할 수도 있습니다. 이 파일은 Pest와 PHPUnit 테스트를 실행하거나, `--env=testing` 옵션과 함께 아티즌 명령어를 사용할 때 `.env` 파일 대신 적용됩니다.

<a name="creating-tests"></a>
## 테스트 생성

새로운 테스트 케이스를 만들기 위해서는 `make:test` 아티즌 명령어를 사용하면 됩니다. 기본적으로 테스트는 `tests/Feature` 디렉터리에 생성됩니다.

```shell
php artisan make:test UserTest
```

`tests/Unit` 디렉터리에 테스트를 생성하고 싶다면, `make:test` 명령어 실행 시 `--unit` 옵션을 추가하면 됩니다.

```shell
php artisan make:test UserTest --unit
```

> [!NOTE]  
> 테스트 스텁은 [스텁 퍼블리싱](/docs/11.x/artisan#stub-customization)을 통해 커스터마이즈할 수 있습니다.

테스트가 생성되면, Pest나 PHPUnit을 이용해 일반적으로 테스트를 작성하면 됩니다. 테스트를 실행하려면 터미널에서 `vendor/bin/pest`, `vendor/bin/phpunit`, 또는 `php artisan test` 명령어를 사용하면 됩니다.

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
> 테스트 클래스에서 직접 `setUp` 또는 `tearDown` 메서드를 정의했다면, 반드시 각각의 메서드에서 부모 클래스의 `parent::setUp()` 또는 `parent::tearDown()`을 호출해야 합니다. 일반적으로는 여러분이 작성한 `setUp` 메서드의 시작 부분에서 `parent::setUp()`을, `tearDown` 메서드의 끝 부분에서 `parent::tearDown()`을 호출해야 합니다.

<a name="running-tests"></a>
## 테스트 실행

앞서 설명한 것처럼, 테스트를 작성했다면 `pest` 또는 `phpunit`을 사용할 수 있습니다.

```shell tab=Pest
./vendor/bin/pest
```

```shell tab=PHPUnit
./vendor/bin/phpunit
```

이 외에도, `test` 아티즌 명령어로 테스트를 실행할 수 있습니다. 아티즌 테스트 러너는 개발과 디버깅을 쉽게 할 수 있도록 자세한 테스트 리포트를 제공합니다.

```shell
php artisan test
```

`pest` 또는 `phpunit` 명령어에 전달할 수 있는 모든 인자(argument)는 아티즌 `test` 명령어에도 그대로 사용할 수 있습니다.

```shell
php artisan test --testsuite=Feature --stop-on-failure
```

<a name="running-tests-in-parallel"></a>
### 테스트 병렬 실행

기본적으로 라라벨과 Pest / PHPUnit은 하나의 프로세스에서 테스트를 순차적으로 실행합니다. 하지만 여러 프로세스에서 테스트를 동시에 실행하면 전체 테스트 시간을 크게 줄일 수 있습니다. 이를 위해서는 `brianium/paratest` Composer 패키지를 "dev" 의존성으로 먼저 설치해야 합니다. 그런 다음, 아티즌 `test` 명령어 실행 시 `--parallel` 옵션을 추가하세요.

```shell
composer require brianium/paratest --dev

php artisan test --parallel
```

기본적으로 라라벨은 여러분의 컴퓨터에 있는 CPU 코어 개수만큼 프로세스를 생성합니다. 필요하다면 `--processes` 옵션으로 프로세스 수를 직접 지정할 수도 있습니다.

```shell
php artisan test --parallel --processes=4
```

> [!WARNING]  
> 병렬로 테스트를 실행할 때는 일부 Pest / PHPUnit 옵션(예: `--do-not-cache-result`)을 사용할 수 없을 수 있습니다.

<a name="parallel-testing-and-databases"></a>
#### 병렬 테스트와 데이터베이스

기본 데이터베이스 연결이 구성되어 있다면, 라라벨은 테스트 실행 중 각 병렬 프로세스별로 테스트용 데이터베이스를 생성하고 마이그레이션도 자동으로 수행합니다. 각 테스트 데이터베이스는 프로세스마다 고유한 토큰이 접미사로 붙어 구분됩니다. 예를 들어, 두 개의 병렬 테스트 프로세스가 실행되는 경우 라라벨은 `your_db_test_1` 및 `your_db_test_2`와 같은 테스트 데이터베이스를 생성해 사용합니다.

기본적으로 테스트 데이터베이스는 `test` 아티즌 명령어를 여러 번 실행해도 남아있기 때문에 재사용됩니다. 하지만 `--recreate-databases` 옵션을 사용하면 데이터베이스를 새로 생성할 수 있습니다.

```shell
php artisan test --parallel --recreate-databases
```

<a name="parallel-testing-hooks"></a>
#### 병렬 테스트 훅(Hook)

때때로, 애플리케이션 테스트에서 여러 테스트 프로세스에서 안전하게 사용할 리소스를 미리 준비해야 할 수도 있습니다.

`ParallelTesting` 파사드를 사용하면 프로세스나 테스트 케이스의 `setUp`, `tearDown` 시점에 실행할 코드를 지정할 수 있습니다. 이때 전달되는 클로저는 프로세스 토큰 `$token`과 현재 테스트 케이스 `$testCase`를 인자로 받아 활용할 수 있습니다.

```
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

        // Executed when a test database is created...
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
#### 병렬 테스트 토큰 접근

테스트 코드 내에서 현재 병렬 프로세스의 "토큰"을 사용하고 싶다면, `token` 메서드를 사용하면 됩니다. 이 토큰은 각 테스트 프로세스를 식별하는 고유한 문자열이며, 병렬 테스트 프로세스 간의 리소스를 구분하는 데 사용할 수 있습니다. 예를 들어, 라라벨은 이 토큰을 각 병렬 테스트 프로세스에서 생성된 테스트 데이터베이스명 끝에 자동으로 붙여줍니다.

```
$token = ParallelTesting::token();
```

<a name="reporting-test-coverage"></a>
### 테스트 커버리지 리포트

> [!WARNING]  
> 이 기능을 사용하려면 [Xdebug](https://xdebug.org) 혹은 [PCOV](https://pecl.php.net/package/pcov)가 필요합니다.

애플리케이션 테스트를 실행할 때, 실제로 테스트가 애플리케이션 코드를 얼마나 커버하는지 확인하고 싶을 수 있습니다. 이를 위해서 테스트 실행 시 `--coverage` 옵션을 사용할 수 있습니다.

```shell
php artisan test --coverage
```

<a name="enforcing-a-minimum-coverage-threshold"></a>
#### 최소 커버리지 임계값 지정

애플리케이션에 대해 최소 테스트 커버리지 임계값을 지정하고 싶다면 `--min` 옵션을 사용할 수 있습니다. 임계값을 충족하지 못하면 테스트가 실패합니다.

```shell
php artisan test --coverage --min=80.3
```

<a name="profiling-tests"></a>
### 테스트 프로파일링

아티즌 테스트 러너에는 느린 테스트를 찾기 위한 편리한 기능도 포함되어 있습니다. `--profile` 옵션과 함께 `test` 명령어를 실행하면, 가장 느린 테스트 10개의 목록이 표시되어 전체 테스트 속도를 개선할 수 있는 부분을 손쉽게 찾을 수 있습니다.

```shell
php artisan test --profile
```
