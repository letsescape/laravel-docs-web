# 콘솔 테스트 (Console Tests)

- [소개](#introduction)
- [성공/실패 기대값](#success-failure-expectations)
- [입력/출력 기대값](#input-output-expectations)
- [콘솔 이벤트](#console-events)

<a name="introduction"></a>
## 소개

HTTP 테스트를 간편하게 해주는 것 외에도, 라라벨은 애플리케이션의 [커스텀 콘솔 명령어](/docs/11.x/artisan)를 테스트할 수 있는 간단한 API도 제공합니다.

<a name="success-failure-expectations"></a>
## 성공/실패 기대값

먼저, Artisan 명령어의 종료 코드(exit code)를 어떻게 검증할 수 있는지 살펴보겠습니다. 테스트에서 `artisan` 메서드를 사용해서 Artisan 명령어를 실행한 뒤, `assertExitCode` 메서드로 해당 명령이 특정 종료 코드로 정상적으로 완료됐는지 확인할 수 있습니다.

```php tab=Pest
test('console command', function () {
    $this->artisan('inspire')->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * Test a console command.
 */
public function test_console_command(): void
{
    $this->artisan('inspire')->assertExitCode(0);
}
```

`assertNotExitCode` 메서드를 사용하면 명령이 특정 종료 코드로 종료되지 않았는지 확인할 수 있습니다.

```
$this->artisan('inspire')->assertNotExitCode(1);
```

일반적으로 터미널 명령어는 성공하면 종료 코드가 `0`이고, 실패하면 `0`이 아닌 값이 반환됩니다. 그래서 더욱 편리하게, `assertSuccessful`과 `assertFailed`라는 assertion을 사용할 수 있습니다. 이 메서드를 활용하면 명령이 성공 또는 실패로 종료됐는지 쉽게 검증할 수 있습니다.

```
$this->artisan('inspire')->assertSuccessful();

$this->artisan('inspire')->assertFailed();
```

<a name="input-output-expectations"></a>
## 입력/출력 기대값

라라벨에서는 `expectsQuestion` 메서드를 사용해 콘솔 명령어의 사용자 입력을 손쉽게 "모킹(mocking)"할 수 있습니다. 또한, `assertExitCode`와 `expectsOutput` 메서드로 콘솔 명령어가 반환하는 종료 코드와 출력되는 텍스트도 검증할 수 있습니다. 예를 들어, 아래와 같은 콘솔 명령어가 있다고 가정해보겠습니다.

```
Artisan::command('question', function () {
    $name = $this->ask('What is your name?');

    $language = $this->choice('Which language do you prefer?', [
        'PHP',
        'Ruby',
        'Python',
    ]);

    $this->line('Your name is '.$name.' and you prefer '.$language.'.');
});
```

위 명령어는 아래의 테스트 코드로 검증할 수 있습니다.

```php tab=Pest
test('console command', function () {
    $this->artisan('question')
        ->expectsQuestion('What is your name?', 'Taylor Otwell')
        ->expectsQuestion('Which language do you prefer?', 'PHP')
        ->expectsOutput('Your name is Taylor Otwell and you prefer PHP.')
        ->doesntExpectOutput('Your name is Taylor Otwell and you prefer Ruby.')
        ->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * Test a console command.
 */
public function test_console_command(): void
{
    $this->artisan('question')
        ->expectsQuestion('What is your name?', 'Taylor Otwell')
        ->expectsQuestion('Which language do you prefer?', 'PHP')
        ->expectsOutput('Your name is Taylor Otwell and you prefer PHP.')
        ->doesntExpectOutput('Your name is Taylor Otwell and you prefer Ruby.')
        ->assertExitCode(0);
}
```

[Laravel Prompts](/docs/11.x/prompts)에서 제공하는 `search` 또는 `multisearch` 기능을 사용하는 경우, `expectsSearch` assertion을 활용해서 사용자의 입력, 검색 결과, 선택지를 모킹할 수 있습니다.

```php tab=Pest
test('console command', function () {
    $this->artisan('example')
        ->expectsSearch('What is your name?', search: 'Tay', answers: [
            'Taylor Otwell',
            'Taylor Swift',
            'Darian Taylor'
        ], answer: 'Taylor Otwell')
        ->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * Test a console command.
 */
public function test_console_command(): void
{
    $this->artisan('example')
        ->expectsSearch('What is your name?', search: 'Tay', answers: [
            'Taylor Otwell',
            'Taylor Swift',
            'Darian Taylor'
        ], answer: 'Taylor Otwell')
        ->assertExitCode(0);
}
```

콘솔 명령어가 어떤 출력도 생성하지 않았는지 확인하고 싶다면, `doesntExpectOutput` 메서드를 사용할 수 있습니다.

```php tab=Pest
test('console command', function () {
    $this->artisan('example')
        ->doesntExpectOutput()
        ->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * Test a console command.
 */
public function test_console_command(): void
{
    $this->artisan('example')
            ->doesntExpectOutput()
            ->assertExitCode(0);
}
```

`expectsOutputToContain` 및 `doesntExpectOutputToContain` 메서드를 사용하면, 출력 결과의 일부 문자열만 포함됐는지 또는 포함되지 않았는지 검증할 수 있습니다.

```php tab=Pest
test('console command', function () {
    $this->artisan('example')
        ->expectsOutputToContain('Taylor')
        ->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * Test a console command.
 */
public function test_console_command(): void
{
    $this->artisan('example')
            ->expectsOutputToContain('Taylor')
            ->assertExitCode(0);
}
```

<a name="confirmation-expectations"></a>
#### 확인(Confirmation) 기대값

명령어에서 "yes" 또는 "no"와 같은 추가 확인을 요구할 때에는, `expectsConfirmation` 메서드를 사용할 수 있습니다.

```
$this->artisan('module:import')
    ->expectsConfirmation('Do you really wish to run this command?', 'no')
    ->assertExitCode(1);
```

<a name="table-expectations"></a>
#### 테이블(Table) 기대값

명령어가 Artisan의 `table` 메서드를 사용해서 정보를 테이블 형태로 출력하는 경우, 전체 테이블의 출력값을 일일이 검증하는 것이 번거로울 수 있습니다. 이런 경우에는 `expectsTable` 메서드를 활용할 수 있습니다. 이 메서드는 첫 번째 인자로 테이블의 헤더를, 두 번째 인자로 테이블의 데이터를 받습니다.

```
$this->artisan('users:all')
    ->expectsTable([
        'ID',
        'Email',
    ], [
        [1, 'taylor@example.com'],
        [2, 'abigail@example.com'],
    ]);
```

<a name="console-events"></a>
## 콘솔 이벤트

기본적으로, 애플리케이션의 테스트를 실행할 때는 `Illuminate\Console\Events\CommandStarting`과 `Illuminate\Console\Events\CommandFinished` 이벤트가 발생하지 않습니다. 그러나, 테스트 클래스에 `Illuminate\Foundation\Testing\WithConsoleEvents` 트레이트(trait)를 추가하면 이러한 이벤트를 활성화할 수 있습니다.

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\WithConsoleEvents;

uses(WithConsoleEvents::class);

// ...
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\WithConsoleEvents;
use Tests\TestCase;

class ConsoleEventTest extends TestCase
{
    use WithConsoleEvents;

    // ...
}
```
