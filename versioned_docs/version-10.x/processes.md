# 프로세스 (Processes)

- [소개](#introduction)
- [프로세스 호출하기](#invoking-processes)
    - [프로세스 옵션](#process-options)
    - [프로세스 출력](#process-output)
    - [파이프라인](#process-pipelines)
- [비동기 프로세스](#asynchronous-processes)
    - [프로세스 ID 및 시그널](#process-ids-and-signals)
    - [비동기 프로세스 출력](#asynchronous-process-output)
- [동시(Concurrent) 프로세스](#concurrent-processes)
    - [풀(Pool) 프로세스 명명하기](#naming-pool-processes)
    - [풀 프로세스 ID 및 시그널](#pool-process-ids-and-signals)
- [테스트](#testing)
    - [프로세스 페이킹](#faking-processes)
    - [특정 프로세스 페이킹](#faking-specific-processes)
    - [프로세스 시퀀스 페이킹](#faking-process-sequences)
    - [비동기 프로세스 수명주기 페이킹](#faking-asynchronous-process-lifecycles)
    - [사용 가능한 assertion](#available-assertions)
    - [의도치 않은 프로세스 실행 방지](#preventing-stray-processes)

<a name="introduction"></a>
## 소개

라라벨은 [Symfony Process 컴포넌트](https://symfony.com/doc/current/components/process.html)를 감싸는 간결하고 명확한 API를 제공합니다. 이를 통해 라라벨 애플리케이션에서 외부 프로세스를 손쉽게 호출할 수 있습니다. 라라벨의 프로세스 기능은 가장 일반적으로 사용되는 사례에 중점을 두며, 뛰어난 개발자 경험을 제공합니다.

<a name="invoking-processes"></a>
## 프로세스 호출하기

프로세스를 실행하려면 `Process` 파사드에서 제공하는 `run` 및 `start` 메서드를 사용할 수 있습니다. `run` 메서드는 프로세스를 실행하고 해당 프로세스가 끝날 때까지 기다립니다. 반면, `start` 메서드는 비동기적으로 프로세스를 실행할 때 사용합니다. 이 문서에서는 두 가지 접근 방식을 모두 살펴봅니다. 먼저, 가장 기본적인 동기 프로세스를 호출하고 그 결과를 확인하는 방법을 예시로 보겠습니다.

```php
use Illuminate\Support\Facades\Process;

$result = Process::run('ls -la');

return $result->output();
```

물론 `run` 메서드가 반환하는 `Illuminate\Contracts\Process\ProcessResult` 인스턴스는 프로세스 결과를 확인하는 데 사용할 수 있는 다양한 유용한 메서드를 제공합니다.

```php
$result = Process::run('ls -la');

$result->successful();
$result->failed();
$result->exitCode();
$result->output();
$result->errorOutput();
```

<a name="throwing-exceptions"></a>
#### 예외 발생시키기

프로세스 실행 결과 인스턴스가 있을 때, 종료 코드가 0보다 클 경우(즉, 실패 시) `Illuminate\Process\Exceptions\ProcessFailedException` 예외를 던지고 싶다면 `throw` 및 `throwIf` 메서드를 사용할 수 있습니다. 프로세스가 실패하지 않은 경우에는 결과 인스턴스를 그대로 반환합니다.

```php
$result = Process::run('ls -la')->throw();

$result = Process::run('ls -la')->throwIf($condition);
```

<a name="process-options"></a>
### 프로세스 옵션

프로세스를 실행하기 전에 동작을 세부적으로 조정하고 싶을 때가 있습니다. 라라벨은 작업 디렉터리, 타임아웃, 환경 변수 등 다양한 프로세스 속성을 손쉽게 설정할 수 있도록 지원합니다.

<a name="working-directory-path"></a>
#### 작업 디렉터리 경로

`path` 메서드를 사용해 프로세스의 작업 디렉터리를 지정할 수 있습니다. 이 메서드를 호출하지 않으면 현재 실행 중인 PHP 스크립트의 작업 디렉터리를 상속하게 됩니다.

```php
$result = Process::path(__DIR__)->run('ls -la');
```

<a name="input"></a>
#### 입력값(standard input)

`input` 메서드를 사용해 프로세스의 표준 입력(standard input)으로 값을 전달할 수 있습니다.

```php
$result = Process::input('Hello World')->run('cat');
```

<a name="timeouts"></a>
#### 타임아웃

기본적으로 프로세스는 60초 이상 실행될 경우 `Illuminate\Process\Exceptions\ProcessTimedOutException` 예외를 던집니다. 이 동작은 `timeout` 메서드로 변경할 수 있습니다.

```php
$result = Process::timeout(120)->run('bash import.sh');
```

또한, 프로세스 타임아웃을 완전히 비활성화하고 싶다면 `forever` 메서드를 사용할 수 있습니다.

```php
$result = Process::forever()->run('bash import.sh');
```

`idleTimeout` 메서드는 프로세스가 아무 출력도 하지 않은 채로 동작할 수 있는 최대 시간을(초 단위로) 지정합니다.

```php
$result = Process::timeout(60)->idleTimeout(30)->run('bash import.sh');
```

<a name="environment-variables"></a>
#### 환경 변수

`env` 메서드를 통해, 프로세스에 환경 변수를 설정할 수 있습니다. 호출된 프로세스는 시스템에 정의된 모든 환경 변수도 함께 상속받게 됩니다.

```php
$result = Process::forever()
            ->env(['IMPORT_PATH' => __DIR__])
            ->run('bash import.sh');
```

상속된 환경 변수 중 특정 값을 제거하고 싶다면 환경 변수의 값을 `false`로 지정하면 됩니다.

```php
$result = Process::forever()
            ->env(['LOAD_PATH' => false])
            ->run('bash import.sh');
```

<a name="tty-mode"></a>
#### TTY 모드

`tty` 메서드를 사용하면 프로세스에 TTY 모드를 활성화할 수 있습니다. TTY 모드는 프로세스의 입력과 출력을 현재 프로그램의 입력 및 출력과 직접 연결하기 때문에, Vim, Nano와 같은 에디터를 서브 프로세스로 열 수 있습니다.

```php
Process::forever()->tty()->run('vim');
```

<a name="process-output"></a>
### 프로세스 출력

이미 설명한 것처럼, 프로세스 실행 결과 인스턴스에서는 `output`(표준 출력, stdout), `errorOutput`(표준 에러 출력, stderr) 메서드로 출력을 확인할 수 있습니다.

```php
use Illuminate\Support\Facades\Process;

$result = Process::run('ls -la');

echo $result->output();
echo $result->errorOutput();
```

하지만, `run` 메서드의 두 번째 인자로 클로저를 전달해서 실시간으로 프로세스 출력을 수집할 수도 있습니다. 이 클로저는 "type"(`stdout` 또는 `stderr`)과 출력 문자열 두 개의 인자를 받습니다.

```php
$result = Process::run('ls -la', function (string $type, string $output) {
    echo $output;
});
```

라라벨은 또한 `seeInOutput`, `seeInErrorOutput` 메서드를 제공하여, 특정 문자열이 프로세스 출력에 포함되어 있는지 쉽게 확인할 수 있습니다.

```php
if (Process::run('ls -la')->seeInOutput('laravel')) {
    // ...
}
```

<a name="disabling-process-output"></a>
#### 프로세스 출력 비활성화

프로세스가 매우 많은 출력을 하며, 해당 출력이 필요 없는 경우, 출력을 완전히 비활성화하여 메모리를 아낄 수 있습니다. 이를 위해 프로세스를 구성할 때 `quietly` 메서드를 호출해 주세요.

```php
use Illuminate\Support\Facades\Process;

$result = Process::quietly()->run('bash import.sh');
```

<a name="process-pipelines"></a>
### 파이프라인

특정 상황에서는 한 프로세스의 출력을 다른 프로세스의 입력으로 전달하고 싶을 수 있습니다. 보통 이를 "파이핑"이라고 부릅니다. `Process` 파사드에서 제공하는 `pipe` 메서드를 사용하면 파이프라인을 쉽게 구현할 수 있습니다. `pipe` 메서드는 파이프에 연결된 모든 프로세스를 동기적으로 실행하며, 파이프라인에서 마지막 프로세스의 결과를 반환합니다.

```php
use Illuminate\Process\Pipe;
use Illuminate\Support\Facades\Process;

$result = Process::pipe(function (Pipe $pipe) {
    $pipe->command('cat example.txt');
    $pipe->command('grep -i "laravel"');
});

if ($result->successful()) {
    // ...
}
```

파이프라인을 구성하는 각 프로세스를 별도로 설정할 필요가 없다면, 명령어 문자열 배열을 `pipe` 메서드에 바로 전달할 수 있습니다.

```php
$result = Process::pipe([
    'cat example.txt',
    'grep -i "laravel"',
]);
```

파이프라인 프로세스의 출력을 실시간으로 수집하려면 두 번째 인자로 클로저를 전달하면 됩니다. 이 클로저는 "type"(`stdout` 또는 `stderr`)과 출력 문자열을 인자로 받습니다.

```php
$result = Process::pipe(function (Pipe $pipe) {
    $pipe->command('cat example.txt');
    $pipe->command('grep -i "laravel"');
}, function (string $type, string $output) {
    echo $output;
});
```

또한, `as` 메서드를 사용해 파이프라인 내 각 프로세스에 문자열 키를 할당할 수 있습니다. 이 키는 `pipe` 메서드에 전달하는 클로저에도 전달되어 어떤 프로세스의 출력인지 구분하는 데 사용할 수 있습니다.

```php
$result = Process::pipe(function (Pipe $pipe) {
    $pipe->as('first')->command('cat example.txt');
    $pipe->as('second')->command('grep -i "laravel"');
})->start(function (string $type, string $output, string $key) {
    // ...
});
```

<a name="asynchronous-processes"></a>
## 비동기 프로세스

`run` 메서드는 프로세스를 동기적으로 호출하지만, `start` 메서드를 사용하면 비동기적으로 프로세스를 실행할 수 있습니다. 이를 통해 프로세스가 백그라운드에서 동작하는 동안 애플리케이션의 다른 작업을 계속 수행할 수 있습니다. 프로세스를 시작한 뒤에는 `running` 메서드를 활용하여 현재 프로세스가 수행 중인지 확인할 수 있습니다.

```php
$process = Process::timeout(120)->start('bash import.sh');

while ($process->running()) {
    // ...
}

$result = $process->wait();
```

보시는 것처럼, 프로세스가 완료될 때까지 대기하려면 `wait` 메서드를 호출하여 결과 인스턴스를 받을 수 있습니다.

```php
$process = Process::timeout(120)->start('bash import.sh');

// ...

$result = $process->wait();
```

<a name="process-ids-and-signals"></a>
### 프로세스 ID 및 시그널

`id` 메서드를 사용하면 현재 실행 중인 프로세스에 할당된 운영체제의 프로세스 ID를 확인할 수 있습니다.

```php
$process = Process::start('bash import.sh');

return $process->id();
```

실행 중인 프로세스에 "시그널"을 보낼 때는 `signal` 메서드를 사용하면 됩니다. 사용할 수 있는 시그널 상수 목록은 [PHP 공식 문서](https://www.php.net/manual/en/pcntl.constants.php)에서 확인할 수 있습니다.

```php
$process->signal(SIGUSR2);
```

<a name="asynchronous-process-output"></a>
### 비동기 프로세스 출력

비동기 프로세스가 실행 중일 때는, `output`, `errorOutput` 메서드로 전체 출력을 확인할 수 있습니다. 또한, `latestOutput`, `latestErrorOutput` 메서드를 사용해 마지막 조회 이후 새롭게 발생한 출력만 볼 수도 있습니다.

```php
$process = Process::timeout(120)->start('bash import.sh');

while ($process->running()) {
    echo $process->latestOutput();
    echo $process->latestErrorOutput();

    sleep(1);
}
```

동기 실행과 마찬가지로, `start` 메서드의 두 번째 인자로 클로저를 넘기면 비동기 프로세스의 출력을 실시간으로 수집할 수 있습니다(클로저 인자는 "type"과 출력 문자열입니다).

```php
$process = Process::start('bash import.sh', function (string $type, string $output) {
    echo $output;
});

$result = $process->wait();
```

<a name="concurrent-processes"></a>
## 동시(Concurrent) 프로세스

라라벨은 여러 개의 비동기 프로세스 풀(pool)을 손쉽게 관리할 수 있도록 지원합니다. 즉, 동시에 여러 작업을 병렬로 실행할 수 있습니다. 시작하려면, `Illuminate\Process\Pool` 인스턴스를 인자로 받는 클로저를 `pool` 메서드에 전달하세요.

이 클로저 내부에서 풀에 포함시킬 프로세스들을 정의합니다. 풀을 `start` 메서드로 실행하면, `running` 메서드를 통해 실행 중인 모든 프로세스 [컬렉션](/docs/10.x/collections)에 접근할 수 있습니다.

```php
use Illuminate\Process\Pool;
use Illuminate\Support\Facades\Process;

$pool = Process::pool(function (Pool $pool) {
    $pool->path(__DIR__)->command('bash import-1.sh');
    $pool->path(__DIR__)->command('bash import-2.sh');
    $pool->path(__DIR__)->command('bash import-3.sh');
})->start(function (string $type, string $output, int $key) {
    // ...
});

while ($pool->running()->isNotEmpty()) {
    // ...
}

$results = $pool->wait();
```

위 예시처럼, 풀의 모든 프로세스가 완료될 때까지 대기하고, 각각의 결과를 `wait` 메서드로 받을 수 있습니다. `wait` 메서드는 배열처럼 접근 가능한 객체를 반환하며, 개별 프로세스의 결과 인스턴스도 키로 접근할 수 있습니다.

```php
$results = $pool->wait();

echo $results[0]->output();
```

더 간단하게, `concurrently` 메서드를 사용하면 비동기 프로세스 풀을 시작하고, 즉시 모든 결과를 기다릴 수 있습니다. 이 방법은 PHP의 배열 구조 분해(Destructuring)와 함께 사용하면 특히 문법이 간결해집니다.

```php
[$first, $second, $third] = Process::concurrently(function (Pool $pool) {
    $pool->path(__DIR__)->command('ls -la');
    $pool->path(app_path())->command('ls -la');
    $pool->path(storage_path())->command('ls -la');
});

echo $first->output();
```

<a name="naming-pool-processes"></a>
### 풀(Pool) 프로세스 명명하기

숫자 키로 풀의 결과에 접근하는 것은 다소 직관적이지 않습니다. 그래서 라라벨은 `as` 메서드로 풀 내 각 프로세스에 문자열 키를 지정할 수 있게 지원합니다. 이 키는 `start` 메서드에 전달된 클로저에도 전달되어서, 어떤 프로세스에서 나온 출력인지 구분할 수 있습니다.

```php
$pool = Process::pool(function (Pool $pool) {
    $pool->as('first')->command('bash import-1.sh');
    $pool->as('second')->command('bash import-2.sh');
    $pool->as('third')->command('bash import-3.sh');
})->start(function (string $type, string $output, string $key) {
    // ...
});

$results = $pool->wait();

return $results['first']->output();
```

<a name="pool-process-ids-and-signals"></a>
### 풀 프로세스 ID 및 시그널

풀의 `running` 메서드는 풀 내에서 실행 중인 모든 프로세스의 컬렉션을 제공하므로, 각각의 프로세스 ID에도 쉽게 접근할 수 있습니다.

```php
$processIds = $pool->running()->each->id();
```

또한 편의상, 프로세스 풀에 대해 `signal` 메서드를 호출하면 풀에 포함된 모든 프로세스에 동시에 시그널을 보낼 수 있습니다.

```php
$pool->signal(SIGUSR2);
```

<a name="testing"></a>
## 테스트

라라벨은 다양한 서비스에서 테스트를 쉽게 작성할 수 있는 기능을 제공하며, 프로세스 서비스도 예외가 아닙니다. `Process` 파사드의 `fake` 메서드를 사용하면 프로세스 실행을 가짜로(stub/dummy) 대체할 수 있습니다.

<a name="faking-processes"></a>
### 프로세스 페이킹

라라벨의 프로세스 페이킹 기능을 알아보기 위해, 프로세스를 호출하는 라우트 예시로 시작해봅니다.

```php
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Route;

Route::get('/import', function () {
    Process::run('bash import.sh');

    return 'Import complete!';
});
```

이 라우트를 테스트할 때, `Process` 파사드의 `fake` 메서드를 인자 없이 호출하면 모든 프로세스 호출에 대해 성공한 가짜 결과가 반환됩니다. 또한, 특정 프로세스가 실제로 실행되었는지 [assert](#available-assertions)로 검증할 수도 있습니다.

```php
<?php

namespace Tests\Feature;

use Illuminate\Process\PendingProcess;
use Illuminate\Contracts\Process\ProcessResult;
use Illuminate\Support\Facades\Process;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_process_is_invoked(): void
    {
        Process::fake();

        $response = $this->get('/import');

        // 단순히 프로세스 호출을 검증
        Process::assertRan('bash import.sh');

        // 혹은 프로세스 설정까지 검증 가능
        Process::assertRan(function (PendingProcess $process, ProcessResult $result) {
            return $process->command === 'bash import.sh' &&
                   $process->timeout === 60;
        });
    }
}
```

설명했듯이, `Process` 파사드의 `fake` 메서드는 항상 출력이 없는, 성공한 결과만 반환합니다. 하지만, 꼭 필요하다면 `Process` 파사드의 `result` 메서드를 사용해, 가짜 프로세스들이 반환할 출력과 종료 코드를 손쉽게 지정할 수 있습니다.

```php
Process::fake([
    '*' => Process::result(
        output: 'Test output',
        errorOutput: 'Test error output',
        exitCode: 1,
    ),
]);
```

<a name="faking-specific-processes"></a>
### 특정 프로세스 페이킹

앞선 예시에서처럼, `Process` 파사드의 `fake` 메서드에 배열을 전달하면 각 프로세스 패턴 별로 별도의 가짜 결과를 정의할 수 있습니다.

배열의 키는 페이크 결과를 지정하고 싶은 명령 패턴이 되고, 값은 해당 명령에 대한 결과입니다. `*` 문자는 와일드카드로 사용 가능하며, 페이킹(가짜)이 지정되지 않은 모든 명령은 실제로 실행됩니다. 이때 `Process` 파사드의 `result` 메서드를 사용해, stub/가짜 결과를 만들 수도 있습니다.

```php
Process::fake([
    'cat *' => Process::result(
        output: 'Test "cat" output',
    ),
    'ls *' => Process::result(
        output: 'Test "ls" output',
    ),
]);
```

입출력, 종료 코드를 별도로 정의할 필요가 없다면, 결과값을 간단히 문자열로 지정할 수도 있습니다.

```php
Process::fake([
    'cat *' => 'Test "cat" output',
    'ls *' => 'Test "ls" output',
]);
```

<a name="faking-process-sequences"></a>
### 프로세스 시퀀스 페이킹

테스트에서 동일한 명령어가 여러 번 실행되는 경우, 프로세스 실행 시마다 서로 다른 페이크 결과를 반환하고 싶을 때가 있습니다. 이럴 때는 `Process` 파사드의 `sequence` 메서드를 사용합니다.

```php
Process::fake([
    'ls *' => Process::sequence()
                ->push(Process::result('First invocation'))
                ->push(Process::result('Second invocation')),
]);
```

<a name="faking-asynchronous-process-lifecycles"></a>
### 비동기 프로세스 수명주기 페이킹

지금까지는 주로 `run` 메서드로 동기 호출한 프로세스의 페이킹을 다루었습니다. 그러나 테스트 코드에서 `start`로 호출한 비동기 프로세스와 상호작용해야 한다면, 보다 정교한 페이크 패턴이 필요할 수 있습니다.

예를 들어, 다음과 같이 비동기 프로세스를 다루는 라우트가 있다고 가정해보겠습니다.

```php
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

Route::get('/import', function () {
    $process = Process::start('bash import.sh');

    while ($process->running()) {
        Log::info($process->latestOutput());
        Log::info($process->latestErrorOutput());
    }

    return 'Done';
});
```

이런 프로세스를 제대로 페이킹하려면, `running` 메서드가 몇 번 `true`를 반환할지 정의할 수 있어야 합니다. 또한, 출력이 순차적으로 여러 줄 발생하는 것도 지정할 수 있어야 합니다. 이럴 땐 `Process` 파사드의 `describe` 메서드를 사용합니다.

```php
Process::fake([
    'bash import.sh' => Process::describe()
            ->output('First line of standard output')
            ->errorOutput('First line of error output')
            ->output('Second line of standard output')
            ->exitCode(0)
            ->iterations(3),
]);
```

위 코드에서 `output`, `errorOutput` 메서드로 여러 줄의 출력을 정의할 수 있고, `exitCode`로 종료 코드, `iterations`로 `running`이 몇 번 반복될지 지정할 수 있습니다.

<a name="available-assertions"></a>
### 사용 가능한 assertion

[이전 섹션](#faking-processes)에서 언급했던 것처럼, 라라벨은 기능 테스트에서 프로세스 호출을 검증할 수 있는 다양한 assertion 메서드를 제공합니다. 각 메서드의 사용법은 아래와 같습니다.

<a name="assert-process-ran"></a>
#### assertRan

특정 프로세스가 호출되었는지 검증합니다.

```php
use Illuminate\Support\Facades\Process;

Process::assertRan('ls -la');
```

`assertRan` 메서드는 클로저를 인자로 받을 수도 있습니다. 이 클로저에는 프로세스 인스턴스와 결과 인스턴스가 전달되어, 구체적인 설정 값을 점검할 수 있습니다. 클로저가 `true`를 반환하면 assertion이 통과합니다.

```php
Process::assertRan(fn ($process, $result) =>
    $process->command === 'ls -la' &&
    $process->path === __DIR__ &&
    $process->timeout === 60
);
```

여기서 `$process`는 `Illuminate\Process\PendingProcess`, `$result`는 `Illuminate\Contracts\Process\ProcessResult` 인스턴스입니다.

<a name="assert-process-didnt-run"></a>
#### assertDidntRun

특정 프로세스가 실행되지 않았는지 검증합니다.

```php
use Illuminate\Support\Facades\Process;

Process::assertDidntRun('ls -la');
```

`assertDidntRun` 역시 클로저로 특정 조건의 실행을 추가적으로 점검할 수 있습니다. 클로저가 `true`를 반환할 경우 assertion이 실패합니다.

```php
Process::assertDidntRun(fn (PendingProcess $process, ProcessResult $result) =>
    $process->command === 'ls -la'
);
```

<a name="assert-process-ran-times"></a>
#### assertRanTimes

특정 프로세스가 주어진 횟수만큼 호출되었는지 검증합니다.

```php
use Illuminate\Support\Facades\Process;

Process::assertRanTimes('ls -la', times: 3);
```

`assertRanTimes` 메서드 또한 클로저를 인자로 받아, 각 실행이 원하는 조건을 만족하는지 세부적으로 점검할 수 있습니다. 클로저가 `true`를 반환하고 지정한 횟수만큼 해당 프로세스가 실행되었다면 assertion이 통과합니다.

```php
Process::assertRanTimes(function (PendingProcess $process, ProcessResult $result) {
    return $process->command === 'ls -la';
}, times: 3);
```

<a name="preventing-stray-processes"></a>
### 의도치 않은 프로세스 실행 방지

개별 테스트 또는 전체 테스트 스위트에서 호출된 모든 프로세스가 반드시 페이킹(가짜 처리)되었는지 강제하고 싶다면 `preventStrayProcesses` 메서드를 호출하세요. 이 메서드 호출 후에는 페이크가 정의되지 않은 프로세스 실행 시 예외가 발생하며, 실제 프로세스가 동작하지 않습니다.

```
use Illuminate\Support\Facades\Process;

Process::preventStrayProcesses();

Process::fake([
    'ls *' => 'Test output...',
]);

// 여기서는 가짜 결과가 반환됩니다.
Process::run('ls -la');

// 하지만, 다음 호출에서는 예외가 발생합니다.
Process::run('bash import.sh');
```
