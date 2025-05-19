# 콘솔 테스트 (Console Tests)

- [소개](#introduction)
- [성공 / 실패 예상](#success-failure-expectations)
- [입력 / 출력 예상](#input-output-expectations)

<a name="introduction"></a>
## 소개

HTTP 테스트를 간소화하는 기능 외에도, 라라벨은 애플리케이션의 [사용자 정의 콘솔 명령어](/docs/8.x/artisan)를 테스트할 수 있는 간편한 API도 제공합니다.

<a name="success-failure-expectations"></a>
## 성공 / 실패 예상

먼저, Artisan 명령어의 종료 코드(exit code)에 대해 어떻게 assert(확인)할 수 있는지 살펴보겠습니다. 테스트에서 `artisan` 메서드를 사용하여 Artisan 명령어를 실행하고, `assertExitCode` 메서드를 이용해 명령어가 특정 종료 코드로 종료되었는지 검사할 수 있습니다.

```
/**
 * 콘솔 명령어 테스트.
 *
 * @return void
 */
public function test_console_command()
{
    $this->artisan('inspire')->assertExitCode(0);
}
```

반대로, 명령어가 특정 종료 코드로 종료되지 않았음을 확인하고 싶다면 `assertNotExitCode` 메서드를 사용할 수 있습니다.

```
$this->artisan('inspire')->assertNotExitCode(1);
```

일반적으로, 모든 터미널 명령어는 성공하면 종료 코드가 `0`이고, 실패하면 0이 아닌 값을 반환합니다. 이를 좀 더 편리하게 확인할 수 있도록, 라라벨에서는 `assertSuccessful`과 `assertFailed`와 같은 assertion을 제공하여 명령어가 정상적으로 종료되었는지 또는 실패했는지를 간편하게 검사할 수 있습니다.

```
$this->artisan('inspire')->assertSuccessful();

$this->artisan('inspire')->assertFailed();
```

<a name="input-output-expectations"></a>
## 입력 / 출력 예상

라라벨에서는 콘솔 명령어 테스트 시 `expectsQuestion` 메서드를 사용하여 사용자 입력을 손쉽게 "모킹(mock)"할 수 있습니다. 또한, 콘솔 명령어가 출력할 것으로 기대하는 종료 코드와 텍스트를 각각 `assertExitCode`와 `expectsOutput` 메서드로 설정 및 검증할 수 있습니다. 예시로, 아래와 같은 콘솔 명령어가 있다고 가정해 보겠습니다.

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

위 콘솔 명령어는 다음과 같은 테스트로 확인할 수 있습니다. 이 테스트에서는 `expectsQuestion`, `expectsOutput`, `doesntExpectOutput`, `assertExitCode` 메서드를 활용합니다.

```
/**
 * 콘솔 명령어 테스트.
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
         ->assertExitCode(0);
}
```

<a name="confirmation-expectations"></a>
#### 확인(Confirmation) 예상

만약 명령어가 "예" 또는 "아니오" 형식의 확인(confirmation) 입력을 요구한다면, `expectsConfirmation` 메서드를 사용할 수 있습니다.

```
$this->artisan('module:import')
    ->expectsConfirmation('Do you really wish to run this command?', 'no')
    ->assertExitCode(1);
```

<a name="table-expectations"></a>
#### 테이블 출력 예상

명령어에서 Artisan의 `table` 메서드를 사용해 정보 테이블을 출력할 경우, 전체 테이블 출력 결과에 대한 예상 값을 작성하는 것이 번거로울 수 있습니다. 이럴 때는 `expectsTable` 메서드를 활용하면 됩니다. 이 메서드는 첫 번째 인자로 테이블 헤더, 두 번째 인자로 테이블 데이터를 받습니다.

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
