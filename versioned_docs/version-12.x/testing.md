# 테스트: 시작하기 (Testing: Getting Started)

- [소개](#introduction)
- [환경](#environment)
- [테스트 생성](#creating-tests)
- [테스트 실행](#running-tests)
    - [병렬로 테스트 실행하기](#running-tests-in-parallel)
    - [테스트 커버리지 리포트](#reporting-test-coverage)
    - [테스트 프로파일링](#profiling-tests)

<a name="introduction"></a>
## 소개

라라벨은 테스트를 염두에 두고 설계된 프레임워크입니다. 실제로, [Pest](https://pestphp.com)와 [PHPUnit](https://phpunit.de)을 활용한 테스트를 기본적으로 지원하며, 여러분의 애플리케이션에는 이미 `phpunit.xml` 파일이 미리 설정되어 있습니다. 또한, 라라벨은 애플리케이션 테스트를 더욱 명확하게 작성할 수 있도록 다양한 헬퍼 메서드를 제공합니다.

기본적으로 여러분의 애플리케이션 `tests` 디렉터리에는 `Feature`와 `Unit` 두 개의 하위 디렉터리가 존재합니다. 유닛 테스트(Unit test)는 코드의 아주 작은 독립적인 부분에 집중하는 테스트입니다. 실제로 대부분의 유닛 테스트는 하나의 메서드에만 집중하는 경우가 많습니다. `Unit` 디렉터리 아래에 위치한 테스트는 라라벨 애플리케이션을 부팅하지 않으므로, 해당 테스트에서는 데이터베이스나 다른 프레임워크 서비스에 접근할 수 없습니다.

피처 테스트(Feature test)는 여러 개의 객체 간의 상호작용을 포함하거나, 심지어 JSON 엔드포인트로의 전체 HTTP 요청 등 더 넓은 범위의 코드를 확인합니다. **일반적으로, 대부분의 테스트는 피처 테스트로 작성하는 것이 좋습니다. 이런 유형의 테스트가 애플리케이션이 전체적으로 의도한 대로 작동하는지 가장 확실하게 검증할 수 있기 때문입니다.**

`Feature`와 `Unit` 테스트 디렉터리에는 각각 `ExampleTest.php` 파일이 기본 제공됩니다. 새로운 라라벨 애플리케이션을 설치했다면, `vendor/bin/pest`, `vendor/bin/phpunit`, 또는 `php artisan test` 명령어를 실행해서 테스트를 실행할 수 있습니다.

<a name="environment"></a>
## 환경

테스트를 실행할 때, 라라벨은 `phpunit.xml` 파일에 정의된 환경 변수 덕분에 [환경 설정](/docs/12.x/configuration#environment-configuration)을 자동으로 `testing`으로 설정합니다. 또한, 라라벨은 세션과 캐시 드라이버를 자동으로 `array`로 설정하여, 테스트 중에는 세션이나 캐시 데이터가 실제로 저장되지 않습니다.

테스트 환경에 필요한 다른 설정값들도 자유롭게 정의할 수 있습니다. `testing` 환경 변수는 애플리케이션의 `phpunit.xml` 파일에서 설정할 수 있지만, 테스트를 실행하기 전에 반드시 `config:clear` 아티즌 명령어로 설정 캐시를 지워야 합니다!

<a name="the-env-testing-environment-file"></a>
#### `.env.testing` 환경 파일

또한, 프로젝트의 루트 디렉터리에 `.env.testing` 파일을 추가할 수도 있습니다. 이 파일은 Pest 및 PHPUnit 테스트를 실행하거나, `--env=testing` 옵션으로 아티즌 명령어를 실행할 때 `.env` 파일 대신 사용됩니다.

<a name="creating-tests"></a>
## 테스트 생성

새로운 테스트 케이스를 만들려면, `make:test` 아티즌 명령어를 사용합니다. 기본적으로 생성되는 테스트는 `tests/Feature` 디렉터리에 위치하게 됩니다.

```shell
php artisan make:test UserTest
```

`tests/Unit` 디렉터리에 테스트를 생성하고 싶다면, `make:test` 명령어 실행 시 `--unit` 옵션을 사용하면 됩니다.

```shell
php artisan make:test UserTest --unit
```

> [!NOTE]
> 테스트 스텁(stub)은 [스텁 커스터마이징](/docs/12.x/artisan#stub-customization)을 통해 변경할 수 있습니다.

테스트가 생성되면, Pest 또는 PHPUnit을 사용해 일반적인 방법으로 테스트 코드를 작성하면 됩니다. 테스트를 실행하려면 터미널에서 `vendor/bin/pest`, `vendor/bin/phpunit`, 또는 `php artisan test` 명령어를 사용하십시오.

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
> 테스트 클래스 내에서 `setUp`/`tearDown` 메서드를 직접 정의하는 경우, 반드시 상위 클래스의 `parent::setUp()`/`parent::tearDown()` 메서드를 각각 호출해야 합니다. 일반적으로 `setUp`은 시작 부분에서 `parent::setUp()`을, `tearDown`은 끝부분에서 `parent::tearDown()`을 호출해야 합니다.

<a name="running-tests"></a>
## 테스트 실행

앞서 설명한 대로, 테스트를 작성한 후에는 `pest` 또는 `phpunit`을 사용해 실행할 수 있습니다.

```shell tab=Pest
./vendor/bin/pest
```

```shell tab=PHPUnit
./vendor/bin/phpunit
```

`pest`나 `phpunit` 명령어 외에도, `test` 아티즌 명령어로 테스트를 실행할 수 있습니다. 아티즌 테스트 러너는 개발 및 디버깅에 도움이 되도록 자세한 테스트 리포트를 제공합니다.

```shell
php artisan test
```

`pest` 또는 `phpunit` 명령어에 전달할 수 있는 모든 인수를 아티즌 `test` 명령에서도 동일하게 사용할 수 있습니다.

```shell
php artisan test --testsuite=Feature --stop-on-failure
```

<a name="running-tests-in-parallel"></a>
### 병렬로 테스트 실행하기

기본적으로 라라벨과 Pest / PHPUnit은 하나의 프로세스에서 순차적으로 테스트를 실행합니다. 하지만 여러 프로세스에서 동시에 테스트를 실행하면 전체 테스트 시간이 크게 단축될 수 있습니다. 이를 시작하려면, `brianium/paratest` Composer 패키지를 "dev" 의존성으로 설치한 뒤, `test` 아티즌 명령 실행 시 `--parallel` 옵션을 추가하세요.

```shell
composer require brianium/paratest --dev

php artisan test --parallel
```

라라벨은 기본적으로 여러분의 PC에 있는 CPU 코어 수만큼 프로세스를 생성합니다. 프로세스의 개수는 `--processes` 옵션으로 조정할 수 있습니다.

```shell
php artisan test --parallel --processes=4
```

> [!WARNING]
> 병렬 테스트 실행 시 일부 Pest / PHPUnit 옵션(`--do-not-cache-result` 등)은 사용할 수 없습니다.

<a name="parallel-testing-and-databases"></a>
#### 병렬 테스트와 데이터베이스

기본 데이터베이스 연결을 설정해두었다면, 라라벨은 병렬 테스트 각 프로세스마다 테스트 데이터베이스를 자동으로 생성하고 마이그레이션합니다. 각각의 테스트 데이터베이스는 프로세스마다 고유한 토큰이 접미사로 붙게 됩니다. 예를 들어 두 개의 병렬 테스트 프로세스가 있다면, 라라벨은 `your_db_test_1`, `your_db_test_2` 데이터베이스를 생성하고 사용합니다.

기본적으로 테스트 데이터베이스는 `test` 아티즌 명령을 여러 번 실행해도 그대로 유지됩니다. 하지만, `--recreate-databases` 옵션을 사용하면 데이터베이스를 새롭게 다시 만들 수 있습니다.

```shell
php artisan test --parallel --recreate-databases
```

<a name="parallel-testing-hooks"></a>
#### 병렬 테스트 훅(Hook)

특정 테스트 작업에서 여러 프로세스에서 안전하게 사용할 수 있도록 자원을 미리 준비해야 할 때가 있습니다.

`ParallelTesting` 파사드를 사용하면, 프로세스 혹은 테스트 케이스의 `setUp`과 `tearDown` 단계에 실행할 코드를 지정할 수 있습니다. 제공되는 클로저에는 프로세스 토큰과 현재 테스트 케이스를 담은 `$token`과 `$testCase` 변수가 전달됩니다.

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
#### 병렬 테스트 토큰에 접근하기

애플리케이션의 테스트 코드 어디에서든 현재 병렬 프로세스의 "토큰"에 접근하고 싶다면, `token` 메서드를 사용할 수 있습니다. 이 토큰은 각 테스트 프로세스를 위한 고유한 문자열 식별자로서, 병렬 테스트 환경에서 자원 분리에 사용할 수 있습니다. 예를 들어, 라라벨은 이 토큰을 병렬 테스트마다 생성되는 데이터베이스 이름 뒤에 자동으로 붙입니다.

```
$token = ParallelTesting::token();
```

<a name="reporting-test-coverage"></a>
### 테스트 커버리지 리포트

> [!WARNING]
> 이 기능을 사용하려면 [Xdebug](https://xdebug.org) 또는 [PCOV](https://pecl.php.net/package/pcov)가 필요합니다.

애플리케이션 테스트를 실행할 때, 실제로 테스트가 코드 전체를 얼마나 커버하는지(테스트 커버리지)를 확인하고 싶을 수 있습니다. 이 기능을 이용하려면 `test` 명령을 실행할 때 `--coverage` 옵션을 추가하세요.

```shell
php artisan test --coverage
```

<a name="enforcing-a-minimum-coverage-threshold"></a>
#### 최소 커버리지 임계값 강제하기

`--min` 옵션을 사용하여 테스트 커버리지의 최소 임계값을 정의할 수 있습니다. 이 임계값에 도달하지 못하면 테스트가 실패 처리됩니다.

```shell
php artisan test --coverage --min=80.3
```

<a name="profiling-tests"></a>
### 테스트 프로파일링

아티즌 테스트 러너에는 애플리케이션의 가장 느린 테스트를 쉽게 파악할 수 있는 편리한 기능도 포함되어 있습니다. `--profile` 옵션을 포함해 `test` 명령을 실행하면, 실행 속도가 가장 느린 10개의 테스트 목록을 보여주어 테스트 속도 개선이 필요한 부분을 손쉽게 찾을 수 있습니다.

```shell
php artisan test --profile
```
