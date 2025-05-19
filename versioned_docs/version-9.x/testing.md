# 테스트: 시작하기 (Testing: Getting Started)

- [소개](#introduction)
- [환경](#environment)
- [테스트 생성](#creating-tests)
- [테스트 실행](#running-tests)
    - [병렬로 테스트 실행](#running-tests-in-parallel)
    - [테스트 커버리지 리포트 생성](#reporting-test-coverage)

<a name="introduction"></a>
## 소개

라라벨은 테스트를 염두에 두고 설계된 프레임워크입니다. 실제로, PHPUnit을 이용한 테스트 지원이 기본으로 내장되어 있으며, 애플리케이션에는 이미 `phpunit.xml` 파일이 준비되어 있습니다. 또한, 라라벨은 애플리케이션 테스트를 더 간결하게 작성할 수 있게 도와주는 다양한 헬퍼 메서드도 함께 제공합니다.

기본적으로, 애플리케이션의 `tests` 디렉터리에는 `Feature`와 `Unit`이라는 두 개의 하위 디렉터리가 포함되어 있습니다. 유닛 테스트(Unit test)는 코드의 아주 작은, 고립된 부분을 집중적으로 테스트하는 데 사용합니다. 대부분의 유닛 테스트는 한 개의 메서드를 검증하는 데 초점을 맞춥니다. "Unit" 폴더에 있는 테스트들은 라라벨 애플리케이션을 부팅하지 않으므로, 데이터베이스나 다른 프레임워크 서비스에 접근할 수 없습니다.

피처 테스트(Feature test)는 여러 객체 사이의 상호작용이나 JSON 엔드포인트를 통한 전체 HTTP 요청 등, 코드의 더 넓은 범위를 테스트할 수 있습니다. **일반적으로 테스트의 대부분은 피처 테스트로 작성하는 것이 좋습니다. 이러한 유형의 테스트가 시스템 전체가 의도대로 동작하는지 가장 확실하게 검증할 수 있기 때문입니다.**

`Feature`와 `Unit` 디렉터리에는 각각 `ExampleTest.php` 파일이 제공됩니다. 새로운 라라벨 애플리케이션을 설치한 후에는, `vendor/bin/phpunit` 또는 `php artisan test` 명령어를 실행하여 테스트를 돌릴 수 있습니다.

<a name="environment"></a>
## 환경

테스트를 실행할 때, 라라벨은 `phpunit.xml` 파일에 정의된 환경 변수 덕분에 자동으로 [설정 환경](/docs/9.x/configuration#environment-configuration)을 `testing`으로 지정합니다. 또한 테스트 환경에서는 세션과 캐시도 자동으로 `array` 드라이버로 설정되어, 테스트 중에는 세션이나 캐시 데이터가 실제로 저장되지 않습니다.

필요에 따라 본인만의 테스트 환경 설정 값을 자유롭게 정의할 수도 있습니다. `testing` 환경 변수들은 애플리케이션의 `phpunit.xml` 파일에서 설정할 수 있습니다. 단, 테스트를 실행하기 전에 반드시 `config:clear` 아티즌 명령어로 설정 캐시를 삭제하시기 바랍니다!

<a name="the-env-testing-environment-file"></a>
#### `.env.testing` 환경 파일

추가적으로, 프로젝트의 루트에 `.env.testing` 파일을 생성할 수도 있습니다. 이 파일은 PHPUnit 테스트를 실행하거나, `--env=testing` 옵션과 함께 아티즌 명령어를 사용할 때 기존의 `.env` 파일 대신 사용됩니다.

<a name="the-creates-application-trait"></a>
#### `CreatesApplication` 트레이트

라라벨은 애플리케이션의 기본 `TestCase` 클래스에 `CreatesApplication` 트레이트를 포함시킵니다. 이 트레이트는 테스트를 실행하기 전에 라라벨 애플리케이션을 부팅하는 `createApplication` 메서드를 가지고 있습니다. 이 트레이트는 라라벨의 병렬 테스트 기능 등 일부 기능의 동작에 꼭 필요하므로, 원래 위치에 그대로 두어야 합니다.

<a name="creating-tests"></a>
## 테스트 생성

새로운 테스트를 생성하려면, `make:test` 아티즌 명령어를 사용하면 됩니다. 기본적으로 생성되는 테스트 파일은 `tests/Feature` 디렉터리에 저장됩니다.

```shell
php artisan make:test UserTest
```

만약 `tests/Unit` 디렉터리 안에 테스트를 만들고 싶다면, `make:test` 명령어에 `--unit` 옵션을 추가하면 됩니다.

```shell
php artisan make:test UserTest --unit
```

[Pest PHP](https://pestphp.com) 스타일의 테스트를 만들고 싶다면, `--pest` 옵션을 추가하면 됩니다.

```shell
php artisan make:test UserTest --pest
php artisan make:test UserTest --unit --pest
```

> [!NOTE]
> 테스트 스텁은 [스텁 퍼블리싱](/docs/9.x/artisan#stub-customization)을 통해 커스터마이징할 수 있습니다.

테스트 파일이 생성된 후, [PHPUnit](https://phpunit.de)에서 사용하는 것과 동일한 방법으로 테스트 메서드를 작성하면 됩니다. 테스트 실행은 아래 중 한 가지 명령어를 사용하세요.

```
<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     *
     * @return void
     */
    public function test_basic_test()
    {
        $this->assertTrue(true);
    }
}
```

> [!WARNING]
> 테스트 클래스 안에 직접 `setUp` / `tearDown` 메서드를 정의할 경우, 반드시 부모 클래스의 `parent::setUp()` / `parent::tearDown()`도 호출해야 합니다.

<a name="running-tests"></a>
## 테스트 실행

앞서 설명한 대로, 테스트 코드를 작성한 뒤에는 `phpunit` 명령어로 실행할 수 있습니다.

```shell
./vendor/bin/phpunit
```

`phpunit` 명령어 외에도, 아티즌의 `test` 명령어로도 테스트를 실행할 수 있습니다. 아티즌 테스트 러너는 개발과 디버깅이 쉬워지도록 상세한 테스트 리포트를 제공합니다.

```shell
php artisan test
```

`phpunit`에 전달할 수 있는 모든 인수는 아티즌 `test` 명령어에도 그대로 사용할 수 있습니다.

```shell
php artisan test --testsuite=Feature --stop-on-failure
```

<a name="running-tests-in-parallel"></a>
### 병렬로 테스트 실행

기본적으로 라라벨과 PHPUnit은 테스트를 한 번에 하나의 프로세스에서 순차적으로 실행합니다. 하지만, 여러 개의 프로세스를 동시에 사용해서 테스트를 병렬로 실행하면 테스트 시간을 크게 단축할 수 있습니다. 먼저, 애플리케이션에 `nunomaduro/collision` 패키지 버전 `^5.3` 이상이 설치되어 있어야 합니다. 그 다음, 아티즌 `test` 명령어에 `--parallel` 옵션을 추가해주세요.

```shell
php artisan test --parallel
```

라라벨은 기본적으로 해당 머신의 CPU 코어 수만큼 프로세스를 만들어 병렬 실행을 합니다. 직접 프로세스 개수를 조정하고 싶으면 `--processes` 옵션을 사용하세요.

```shell
php artisan test --parallel --processes=4
```

> [!WARNING]
> 테스트를 병렬로 실행할 때 일부 PHPUnit 옵션(예: `--do-not-cache-result`)은 사용할 수 없습니다.

<a name="parallel-testing-and-databases"></a>
#### 병렬 테스트와 데이터베이스

기본 데이터베이스 연결이 설정되어 있으면, 라라벨은 병렬로 실행 중인 각 테스트 프로세스 별로 테스트용 데이터베이스를 자동으로 생성 및 마이그레이션합니다. 이때 각 테스트 데이터베이스 이름에는 프로세스별 고유 토큰이 뒤에 붙습니다. 예를 들어, 두 개의 병렬 테스트 프로세스가 있다면, 라라벨은 `your_db_test_1`, `your_db_test_2`와 같은 테스트 데이터베이스를 각각 생성해 사용합니다.

테스트 데이터베이스는 기본적으로 `test` 아티즌 명령이 다시 호출될 때까지 그대로 유지되어, 이후에 재사용됩니다. 데이터베이스를 매번 새로 만들고 싶다면 `--recreate-databases` 옵션을 추가하세요.

```shell
php artisan test --parallel --recreate-databases
```

<a name="parallel-testing-hooks"></a>
#### 병렬 테스트 훅(Hooks)

가끔, 여러 테스트 프로세스가 안전하게 사용할 수 있도록 애플리케이션 테스트용 리소스를 준비해야 할 수도 있습니다.

`ParallelTesting` 파사드를 활용하면, 프로세스 및 테스트 케이스의 `setUp`과 `tearDown` 시점에 실행할 코드를 지정할 수 있습니다. 지정한 클로저는 프로세스 토큰인 `$token`과 현재 테스트 케이스인 `$testCase`를 인자로 받습니다.

```
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\ParallelTesting;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        ParallelTesting::setUpProcess(function ($token) {
            // ...
        });

        ParallelTesting::setUpTestCase(function ($token, $testCase) {
            // ...
        });

        // 테스트 데이터베이스가 생성될 때 실행...
        ParallelTesting::setUpTestDatabase(function ($database, $token) {
            Artisan::call('db:seed');
        });

        ParallelTesting::tearDownTestCase(function ($token, $testCase) {
            // ...
        });

        ParallelTesting::tearDownProcess(function ($token) {
            // ...
        });
    }
}
```

<a name="accessing-the-parallel-testing-token"></a>
#### 병렬 테스트 토큰에 접근하기

애플리케이션의 테스트 코드 내 다른 위치에서 현재 병렬 프로세스의 "토큰"에 접근하고 싶으면, `token` 메서드를 사용할 수 있습니다. 이 토큰은 각 테스트 프로세스별로 유일한 문자열 식별자이며, 병렬 테스트 환경에서 리소스를 분리·구분하는 데 활용됩니다. 예를 들어, 라라벨은 병렬 테스트 데이터베이스 이름 뒤에 이 토큰을 자동으로 붙입니다.

```
$token = ParallelTesting::token();
```

<a name="reporting-test-coverage"></a>
### 테스트 커버리지 리포트 생성

> [!WARNING]
> 이 기능을 사용하려면 [Xdebug](https://xdebug.org) 또는 [PCOV](https://pecl.php.net/package/pcov)가 필요합니다.

애플리케이션 테스트를 실행할 때, 테스트 케이스가 실제로 얼마나 애플리케이션 코드를 실행·커버하는지 확인하고 싶을 수 있습니다. 이를 위해, `test` 명령어 실행 시 `--coverage` 옵션을 추가하면 됩니다.

```shell
php artisan test --coverage
```

<a name="enforcing-a-minimum-coverage-threshold"></a>
#### 최소 커버리지 기준 설정

`--min` 옵션을 이용하면, 애플리케이션 테스트 커버리지의 최소 기준을 지정할 수 있습니다. 설정한 커버리지 기준에 미달하면 테스트가 실패하게 됩니다.

```shell
php artisan test --coverage --min=80.3
```
