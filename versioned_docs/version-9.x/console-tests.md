# 콘솔 테스트 (Console Tests)

- [소개](#introduction)
- [성공 / 실패 기대값](#success-failure-expectations)
- [입력 / 출력 기대값](#input-output-expectations)

<a name="introduction"></a>
## 소개

라라벨은 HTTP 테스트를 간편하게 할 수 있도록 도와줄 뿐만 아니라, 여러분이 작성한 [커스텀 콘솔 명령어](/docs/9.x/artisan)를 테스트할 수 있는 간단한 API도 제공합니다.

<a name="success-failure-expectations"></a>
## 성공 / 실패 기대값

먼저, Artisan 명령어의 종료 코드(Exit Code)에 대해 어떻게 assert(확인)할 수 있는지 살펴보겠습니다. 이를 위해 테스트에서 `artisan` 메서드를 사용해 Artisan 명령어를 호출한 뒤, `assertExitCode` 메서드를 사용해 명령어가 원하는 종료 코드로 완전히 실행되었는지 확인할 수 있습니다.

```
/**
 * Test a console command.
 *
 * @return void
 */
public function test_console_command()
{
    $this->artisan('inspire')->assertExitCode(0);
}
```

명령어가 특정 종료 코드로 종료되지 않았는지 확인하려면 `assertNotExitCode` 메서드를 사용할 수 있습니다.

```
$this->artisan('inspire')->assertNotExitCode(1);
```

보통 모든 터미널 명령어는 성공적으로 실행되면 `0` 상태 코드로 종료되고, 실패했을 때는 0이 아닌 다른 종료 코드를 반환합니다. 그래서 편의상, 명령어가 성공적으로, 또는 실패 상태로 종료되었는지 확인하는 데에는 `assertSuccessful`, `assertFailed` assertion을 사용할 수 있습니다.

```
$this->artisan('inspire')->assertSuccessful();

$this->artisan('inspire')->assertFailed();
```

<a name="input-output-expectations"></a>
## 입력 / 출력 기대값

라라벨에서는 콘솔 명령어 테스트 시 `expectsQuestion` 메서드를 이용해 사용자 입력을 손쉽게 "모킹(mock)"할 수 있습니다. 또한, 콘솔 명령어의 종료 코드와 출력되어야 하는 텍스트를 `assertExitCode`와 `expectsOutput` 메서드로 지정할 수 있습니다. 예를 들어, 아래와 같은 콘솔 명령어가 있다고 가정해보겠습니다.

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

이 명령어는 아래와 같이 테스트할 수 있습니다. 테스트에서는 `expectsQuestion`, `expectsOutput`, `doesntExpectOutput`, `expectsOutputToContain`, `doesntExpectOutputToContain`, `assertExitCode` 등의 메서드를 사용할 수 있습니다.

```
/**
 * Test a console command.
 *
 * @return void
 */
public function test_console_command()
{
    $this->artisan('question')
         ->expectsQuestion('What is your name?', 'Taylor Otwell')
         ->expectsQuestion('Which language do you prefer?', 'PHP')
         ->expectsOutput('Your name is Taylor Otwell and you prefer PHP.')
         ->doesntExpectOutput('Your name is Taylor Otwell and you prefer Ruby.')
         ->expectsOutputToContain('Taylor Otwell')
         ->doesntExpectOutputToContain('you prefer Ruby')
         ->assertExitCode(0);
}
```

<a name="confirmation-expectations"></a>
#### 확인(Confirmation) 기대값

명령어에서 "yes" 또는 "no"로 답을 받는 확인 질문을 사용할 경우, `expectsConfirmation` 메서드를 활용할 수 있습니다.

```
$this->artisan('module:import')
    ->expectsConfirmation('Do you really wish to run this command?', 'no')
    ->assertExitCode(1);
```

<a name="table-expectations"></a>
#### 테이블 출력 기대값

만약 여러분의 명령어가 Artisan의 `table` 메서드를 사용해서 정보 테이블을 출력한다면, 전체 테이블 전체를 대상으로 출력 결과를 검사하는 코드를 작성하는 것은 다소 번거로울 수 있습니다. 이런 경우, `expectsTable` 메서드를 사용할 수 있습니다. 이 메서드는 첫 번째 인자로 테이블의 헤더, 두 번째 인자로 테이블 데이터를 받습니다.

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