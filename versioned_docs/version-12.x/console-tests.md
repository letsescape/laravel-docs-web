# 콘솔 테스트 (Console Tests)

- [소개](#introduction)
- [성공 / 실패 예상](#success-failure-expectations)
- [입력 / 출력 예상](#input-output-expectations)
- [콘솔 이벤트](#console-events)

<a name="introduction"></a>
## 소개

HTTP 테스트를 간소화하는 것 외에도, 라라벨은 애플리케이션의 [커스텀 콘솔 명령어](/docs/12.x/artisan)를 테스트할 수 있는 간단한 API도 제공합니다.

<a name="success-failure-expectations"></a>
## 성공 / 실패 예상

먼저, Artisan 명령어의 종료 코드(exit code)에 대해 assert(확인)하는 방법을 살펴보겠습니다. 이를 위해 테스트에서 `artisan` 메서드를 사용해 Artisan 명령어를 실행하고, 명령어가 특정 종료 코드로 완료되었는지 `assertExitCode` 메서드로 검증합니다:

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

특정 종료 코드로 명령어가 종료되지 않았는지 확인하려면 `assertNotExitCode` 메서드를 사용할 수 있습니다:

```php
$this->artisan('inspire')->assertNotExitCode(1);
```

일반적으로 터미널 명령어가 정상적으로 실행되면 `0` 상태 코드로 종료되고, 그렇지 않으면 0이 아닌 값을 반환합니다. 따라서, 편의를 위해 `assertSuccessful` 및 `assertFailed` assertion을 활용하여 명령어가 성공적으로 종료되었는지, 실패했는지를 간편하게 확인할 수 있습니다:

```php
$this->artisan('inspire')->assertSuccessful();

$this->artisan('inspire')->assertFailed();
```

<a name="input-output-expectations"></a>
## 입력 / 출력 예상

라라벨에서는 `expectsQuestion` 메서드를 이용해서 콘솔 명령어 테스트 시 사용자 입력을 손쉽게 "모킹(mock)"할 수 있습니다. 또한, `assertExitCode`와 `expectsOutput` 메서드를 통해 콘솔 명령어가 출력하는 텍스트와 종료 코드를 테스트할 수 있습니다. 예를 들어, 다음과 같은 콘솔 명령어가 있다고 가정해봅니다:

```php
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

이 명령어에 대한 테스트 코드는 다음과 같이 작성할 수 있습니다:

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

[Laravel Prompts](/docs/12.x/prompts)에서 제공하는 `search` 또는 `multisearch` 함수를 사용할 경우, 사용자의 입력, 검색 결과, 선택값을 모킹하려면 `expectsSearch` assertion을 사용할 수 있습니다:

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

콘솔 명령어가 아무런 출력을 생성하지 않아야 한다는 것도 `doesntExpectOutput` 메서드로 확인할 수 있습니다:

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

출력된 텍스트의 일부 문자열이 포함(또는 미포함)되어 있는지 검증하려면 `expectsOutputToContain` 및 `doesntExpectOutputToContain` 메서드를 사용할 수 있습니다:

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
#### 확인(Confirmation) 예상

"예" 또는 "아니오"와 같은 답변을 요구하는 확인(confirmation) 질문을 받는 명령어 작성 시, `expectsConfirmation` 메서드를 사용할 수 있습니다:

```php
$this->artisan('module:import')
    ->expectsConfirmation('Do you really wish to run this command?', 'no')
    ->assertExitCode(1);
```

<a name="table-expectations"></a>
#### 테이블(Table) 예상

명령어가 Artisan의 `table` 메서드를 사용해 정보를 테이블 형식으로 출력하는 경우, 전체 테이블 출력값을 일일이 예상하는 것은 번거로울 수 있습니다. 이런 상황에는 `expectsTable` 메서드를 사용할 수 있습니다. 이 메서드는 첫 번째 인수로 테이블의 헤더, 두 번째 인수로 테이블 데이터를 받습니다:

```php
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

기본적으로, 애플리케이션 테스트가 실행될 때는 `Illuminate\Console\Events\CommandStarting` 및 `Illuminate\Console\Events\CommandFinished` 이벤트가 디스패치되지 않습니다. 그러나 테스트 클래스에 `Illuminate\Foundation\Testing\WithConsoleEvents` 트레이트를 추가하면 해당 이벤트를 활성화할 수 있습니다:

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
