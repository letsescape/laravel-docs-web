# 콘솔 테스트 (Console Tests)

- [소개](#introduction)
- [성공 / 실패 기대값](#success-failure-expectations)
- [입력 / 출력 기대값](#input-output-expectations)
- [콘솔 이벤트](#console-events)

<a name="introduction"></a>
## 소개

라라벨은 HTTP 테스트를 간단하게 만들어줄 뿐만 아니라, 애플리케이션의 [커스텀 콘솔 명령어](/docs/artisan)를 테스트할 수 있는 간단한 API도 제공합니다.

<a name="success-failure-expectations"></a>
## 성공 / 실패 기대값

먼저, Artisan 명령어의 종료 코드(exit code)에 대한 assert(확인)를 어떻게 수행하는지 살펴보겠습니다. 테스트에서 `artisan` 메서드를 사용하여 Artisan 명령어를 실행한 후, `assertExitCode` 메서드를 이용해 명령어가 지정한 종료 코드로 정상적으로 끝났는지 확인할 수 있습니다.

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

명령어가 특정 종료 코드로 종료되지 않았음을 확인하려면 `assertNotExitCode` 메서드를 사용할 수 있습니다.

```php
$this->artisan('inspire')->assertNotExitCode(1);
```

일반적으로 터미널 명령어는 성공적으로 실행됐을 때 종료 코드 `0`을 반환하고, 실패하면 0이 아닌 값을 반환합니다. 그래서 좀 더 간단하게 쓸 수 있도록, `assertSuccessful`과 `assertFailed` assert를 통해 명령어가 정상적으로 또는 비정상적으로 종료됐는지 확인할 수 있습니다.

```php
$this->artisan('inspire')->assertSuccessful();

$this->artisan('inspire')->assertFailed();
```

<a name="input-output-expectations"></a>
## 입력 / 출력 기대값

라라벨을 사용하면 `expectsQuestion` 메서드를 활용해 콘솔 명령어 실행 시 사용자 입력을 손쉽게 "모킹(mock)"할 수 있습니다. 또한, `assertExitCode`와 `expectsOutput` 메서드를 이용해 콘솔 명령어의 종료 코드와 출력 텍스트도 지정해서 테스트할 수 있습니다. 아래는 예시 콘솔 명령어입니다.

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

위 명령어를 아래와 같이 테스트할 수 있습니다.

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

[Laravel Prompts](/docs/prompts)가 제공하는 `search` 또는 `multisearch` 함수를 사용할 때는, `expectsSearch` assert를 이용해 사용자의 입력, 검색 결과, 선택한 값을 모킹할 수 있습니다.

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

또한, 콘솔 명령어가 어떠한 출력도 생성하지 않는지 확인하고 싶다면 `doesntExpectOutput` 메서드를 사용할 수 있습니다.

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

출력값 전체가 아니라 일부 값만을 확인하고자 할 때는, `expectsOutputToContain`이나 `doesntExpectOutputToContain` 메서드를 사용할 수 있습니다.

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

"예" 또는 "아니오" 답변을 요구하는 확인 메시지가 있는 커맨드를 테스트할 때는, `expectsConfirmation` 메서드를 활용할 수 있습니다.

```php
$this->artisan('module:import')
    ->expectsConfirmation('Do you really wish to run this command?', 'no')
    ->assertExitCode(1);
```

<a name="table-expectations"></a>
#### 테이블(Table) 기대값

Artisan의 `table` 메서드를 사용해 정보 테이블을 출력하는 명령어의 경우, 테이블 전체를 일일이 출력 기대값으로 작성하기 번거롭습니다. 이때는 `expectsTable` 메서드를 사용할 수 있습니다. 이 메서드는 첫 번째 인자로 테이블 헤더, 두 번째 인자로 테이블의 데이터를 받습니다.

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

기본적으로, 애플리케이션 테스트를 실행할 때는 `Illuminate\Console\Events\CommandStarting` 및 `Illuminate\Console\Events\CommandFinished` 이벤트가 디스패치되지 않습니다. 하지만, 테스트 클래스에 `Illuminate\Foundation\Testing\WithConsoleEvents` 트레이트를 추가하면, 해당 이벤트를 활성화할 수 있습니다.

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
