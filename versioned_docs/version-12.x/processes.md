# 프로세스 (Processes)

- [소개](#introduction)
- [프로세스 실행](#invoking-processes)
    - [프로세스 옵션](#process-options)
    - [프로세스 출력](#process-output)
    - [파이프라인](#process-pipelines)
- [비동기 프로세스](#asynchronous-processes)
    - [프로세스 ID 및 시그널](#process-ids-and-signals)
    - [비동기 프로세스 출력](#asynchronous-process-output)
    - [비동기 프로세스 타임아웃](#asynchronous-process-timeouts)
- [동시 프로세스](#concurrent-processes)
    - [풀 프로세스에 이름 지정](#naming-pool-processes)
    - [풀 프로세스 ID 및 시그널](#pool-process-ids-and-signals)
- [테스트](#testing)
    - [프로세스 페이크](#faking-processes)
    - [특정 프로세스 페이크](#faking-specific-processes)
    - [프로세스 시퀀스 페이크](#faking-process-sequences)
    - [비동기 프로세스 라이프사이클 페이크](#faking-asynchronous-process-lifecycles)
    - [사용 가능한 Assertion](#available-assertions)
    - [예상치 못한 프로세스 방지](#preventing-stray-processes)

<a name="introduction"></a>
## 소개

라라벨은 [Symfony Process 컴포넌트](https://symfony.com/doc/current/components/process.html)를 기반으로, 외부 프로세스를 라라벨 애플리케이션에서 편리하게 실행할 수 있도록 표현력 있고 간결한 API를 제공합니다. 라라벨의 프로세스 기능은 가장 일반적인 사용 사례에 집중되어 있으며, 개발자가 뛰어난 경험을 할 수 있도록 설계되어 있습니다.

<a name="invoking-processes"></a>
## 프로세스 실행

프로세스를 실행하려면 `Process` 파사드가 제공하는 `run` 및 `start` 메서드를 사용할 수 있습니다. `run` 메서드는 프로세스를 실행하고, 프로세스가 종료될 때까지 기다립니다. 반면, `start` 메서드는 프로세스를 비동기적으로 실행할 때 사용합니다. 이 문서에서는 두 방법 모두 살펴보겠습니다. 먼저, 기본적인 동기 프로세스를 실행하고, 그 결과를 확인하는 예시입니다:

```php
use Illuminate\Support\Facades\Process;

$result = Process::run('ls -la');

return $result->output();
```

`run` 메서드가 반환하는 `Illuminate\Contracts\Process\ProcessResult` 인스턴스는 프로세스 결과를 다양한 방식으로 확인할 수 있도록 여러 편리한 메서드를 제공합니다:

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

프로세스 실행 결과에서, 종료 코드가 0보다 크면(즉, 프로세스가 실패한 경우) `Illuminate\Process\Exceptions\ProcessFailedException` 예외를 발생시키고 싶을 때는 `throw` 또는 `throwIf` 메서드를 사용할 수 있습니다. 만약 프로세스가 실패하지 않았다면, 해당 프로세스 결과 인스턴스가 그대로 반환됩니다:

```php
$result = Process::run('ls -la')->throw();

$result = Process::run('ls -la')->throwIf($condition);
```

<a name="process-options"></a>
### 프로세스 옵션

상황에 따라 프로세스를 실행하기 전에 다양한 설정을 조정해야 할 수 있습니다. 라라벨에서는 작업 디렉터리, 타임아웃, 환경 변수 등 여러 프로세스 관련 옵션을 손쉽게 지정할 수 있습니다.

<a name="working-directory-path"></a>
#### 작업 디렉터리(Working Directory) 지정

`path` 메서드를 사용하면 프로세스의 작업 디렉터리를 지정할 수 있습니다. 이 메서드를 호출하지 않으면, 프로세스는 현재 실행 중인 PHP 스크립트의 작업 디렉터리를 따릅니다:

```php
$result = Process::path(__DIR__)->run('ls -la');
```

<a name="input"></a>
#### 입력(Input)

`input` 메서드를 사용하면 프로세스의 표준 입력(standard input)으로 값을 전달할 수 있습니다:

```php
$result = Process::input('Hello World')->run('cat');
```

<a name="timeouts"></a>
#### 타임아웃(Timeouts)

기본적으로 프로세스는 60초 이상 실행되면 `Illuminate\Process\Exceptions\ProcessTimedOutException` 예외를 던집니다. 만약 이 시간을 변경하고 싶다면 `timeout` 메서드를 사용할 수 있습니다:

```php
$result = Process::timeout(120)->run('bash import.sh');
```

프로세스의 타임아웃을 아예 비활성화하고 싶다면, `forever` 메서드를 호출하면 됩니다:

```php
$result = Process::forever()->run('bash import.sh');
```

또한 `idleTimeout` 메서드는 일정 시간 동안 출력이 없을 때 프로세스를 종료하도록 설정할 수 있습니다:

```php
$result = Process::timeout(60)->idleTimeout(30)->run('bash import.sh');
```

<a name="environment-variables"></a>
#### 환경 변수(Environment Variables)

`env` 메서드를 사용하여 프로세스에 전달할 환경 변수를 지정할 수 있습니다. 추가로, 해당 프로세스는 시스템에 정의된 모든 환경 변수를 기본으로 상속받습니다:

```php
$result = Process::forever()
    ->env(['IMPORT_PATH' => __DIR__])
    ->run('bash import.sh');
```

상속받는 환경 변수 중 삭제하고 싶은 것이 있다면, 해당 변수에 `false` 값을 지정하여 제거할 수 있습니다:

```php
$result = Process::forever()
    ->env(['LOAD_PATH' => false])
    ->run('bash import.sh');
```

<a name="tty-mode"></a>
#### TTY 모드

`tty` 메서드는 프로세스에 TTY 모드를 활성화합니다. TTY 모드를 사용하면, 프로세스의 입력과 출력을 프로그램의 입출력에 직접 연결할 수 있어, Vim이나 Nano와 같은 편집기를 프로세스로 실행할 수 있습니다:

```php
Process::forever()->tty()->run('vim');
```

<a name="process-output"></a>
### 프로세스 출력

앞에서 설명했듯이, 프로세스의 출력은 프로세스 결과의 `output`(표준 출력)과 `errorOutput`(에러 출력) 메서드를 통해 확인할 수 있습니다:

```php
use Illuminate\Support\Facades\Process;

$result = Process::run('ls -la');

echo $result->output();
echo $result->errorOutput();
```

또한, `run` 메서드의 두 번째 인수로 클로저를 전달하면 실시간으로 프로세스 출력을 수집할 수 있습니다. 이 클로저는 두 개의 인수(`stdout` 또는 `stderr` 타입, 그리고 출력 문자열)를 받습니다:

```php
$result = Process::run('ls -la', function (string $type, string $output) {
    echo $output;
});
```

또한, `seeInOutput` 및 `seeInErrorOutput` 메서드를 사용하여 특정 문자열이 프로세스 출력에 포함되어 있는지 간편하게 확인할 수 있습니다:

```php
if (Process::run('ls -la')->seeInOutput('laravel')) {
    // ...
}
```

<a name="disabling-process-output"></a>
#### 프로세스 출력 비활성화

프로세스가 많은 양의 출력을 발생하지만 해당 결과가 필요하지 않을 때는, 출력 수집을 아예 비활성화하여 메모리 사용량을 줄일 수 있습니다. 이때는 `quietly` 메서드를 사용하면 됩니다:

```php
use Illuminate\Support\Facades\Process;

$result = Process::quietly()->run('bash import.sh');
```

<a name="process-pipelines"></a>
### 파이프라인(Pipelines)

때때로 한 프로세스의 출력을 다음 프로세스의 입력으로 사용하고 싶을 때가 있습니다. 이를 파이핑(piping)이라고 하며, `Process` 파사드의 `pipe` 메서드를 통해 쉽게 구현할 수 있습니다. `pipe` 메서드는 파이프라인에 정의된 프로세스들을 동기적으로 실행하고, 마지막 프로세스의 결과를 반환합니다:

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

파이프라인을 구성하는 개별 프로세스를 커스터마이즈할 필요가 없다면, 명령어 문자열의 배열을 `pipe` 메서드에 전달해서 더욱 간단하게 사용할 수 있습니다:

```php
$result = Process::pipe([
    'cat example.txt',
    'grep -i "laravel"',
]);
```

실시간으로 파이프라인 프로세스의 출력을 수집하고 싶다면, 두 번째 인수로 클로저를 전달할 수 있습니다. 이 클로저는 두 개의 인수(`stdout` 또는 `stderr` 타입, 그리고 출력 문자열)를 받습니다:

```php
$result = Process::pipe(function (Pipe $pipe) {
    $pipe->command('cat example.txt');
    $pipe->command('grep -i "laravel"');
}, function (string $type, string $output) {
    echo $output;
});
```

라라벨에서는 파이프라인의 각 프로세스에 `as` 메서드로 문자열 키를 지정할 수도 있습니다. 이 키는 파이프라인의 출력 클로저에 세 번째 인수로 전달되어, 어떤 프로세스의 출력인지 구분할 수 있게 해줍니다:

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

`run` 메서드는 동기적으로 프로세스를 실행하지만, `start` 메서드를 사용하면 프로세스를 비동기적으로 실행할 수 있습니다. 이를 통해 애플리케이션이 프로세스 실행 중에도 다른 작업을 계속 진행할 수 있습니다. 프로세스를 실행한 후에는 `running` 메서드로 아직 실행 중인지 확인할 수 있습니다:

```php
$process = Process::timeout(120)->start('bash import.sh');

while ($process->running()) {
    // ...
}

$result = $process->wait();
```

보시다시피, `wait` 메서드를 사용하면 프로세스가 종료될 때까지 기다리고, 프로세스 결과 인스턴스를 가져올 수 있습니다:

```php
$process = Process::timeout(120)->start('bash import.sh');

// ...

$result = $process->wait();
```

<a name="process-ids-and-signals"></a>
### 프로세스 ID 및 시그널

`id` 메서드를 사용하면 실행 중인 프로세스의 운영체제에서 할당된 프로세스 ID를 조회할 수 있습니다:

```php
$process = Process::start('bash import.sh');

return $process->id();
```

실행 중인 프로세스에 시그널(signal)을 보내고 싶다면, `signal` 메서드를 사용할 수 있습니다. 사용할 수 있는 시그널 상수 목록은 [PHP 공식 문서](https://www.php.net/manual/en/pcntl.constants.php)를 참고하세요.

```php
$process->signal(SIGUSR2);
```

<a name="asynchronous-process-output"></a>
### 비동기 프로세스 출력

비동기 프로세스가 실행되는 동안, `output` 및 `errorOutput` 메서드로 전체 출력을 즉시 조회할 수 있습니다. 또한 `latestOutput` 및 `latestErrorOutput` 메서드를 사용하면, 마지막으로 읽은 이후의 새로운 출력만 받아올 수도 있습니다:

```php
$process = Process::timeout(120)->start('bash import.sh');

while ($process->running()) {
    echo $process->latestOutput();
    echo $process->latestErrorOutput();

    sleep(1);
}
```

`run` 메서드와 마찬가지로, 비동기 프로세스에서도 `start` 메서드의 두 번째 인수로 클로저를 전달하면 실시간으로 출력을 수집할 수 있습니다. 이 클로저는 두 개의 인수(출력 타입과 출력 내용)를 받습니다:

```php
$process = Process::start('bash import.sh', function (string $type, string $output) {
    echo $output;
});

$result = $process->wait();
```

프로세스가 모두 종료될 때까지 기다리는 대신, 특정 출력이 나타날 때까지 대기하려면 `waitUntil` 메서드를 사용할 수 있습니다. 이때 전달한 클로저가 `true`를 반환하면 대기가 종료됩니다:

```php
$process = Process::start('bash import.sh');

$process->waitUntil(function (string $type, string $output) {
    return $output === 'Ready...';
});
```

<a name="asynchronous-process-timeouts"></a>
### 비동기 프로세스 타임아웃

비동기 프로세스가 실행 중일 때, `ensureNotTimedOut` 메서드를 사용해 해당 프로세스가 타임아웃이 발생하지 않았는지 확인할 수 있습니다. 만약 타임아웃되었다면 [타임아웃 예외](#timeouts)가 발생합니다:

```php
$process = Process::timeout(120)->start('bash import.sh');

while ($process->running()) {
    $process->ensureNotTimedOut();

    // ...

    sleep(1);
}
```

<a name="concurrent-processes"></a>
## 동시 프로세스

라라벨에서는 여러 비동기 프로세스를 풀(pool)로 구성하여 동시에 손쉽게 실행하고 관리할 수 있습니다. 먼저 `pool` 메서드를 호출하면, 이 메서드는 `Illuminate\Process\Pool` 인스턴스를 클로저로 전달해줍니다.

이 클로저 내부에서 풀에 포함될 프로세스를 정의할 수 있습니다. 풀을 `start` 메서드로 시작하면, `running` 메서드로 현재 실행 중인 프로세스의 [컬렉션](/docs/collections)을 조회할 수 있습니다:

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

위 예시와 같이, `wait` 메서드를 호출하면 풀에 포함된 모든 프로세스가 종료될 때까지 기다리고 각각의 결과를 받아올 수 있습니다. `wait`의 반환값은 배열처럼 접근이 가능한 객체로, 각각의 프로세스 결과 인스턴스를 해당 키로 가져올 수 있습니다:

```php
$results = $pool->wait();

echo $results[0]->output();
```

더 간편하게 풀을 실행하고 바로 결과를 받아오고 싶다면, `concurrently` 메서드를 사용할 수 있습니다. 이 메서드는 비동기 프로세스 풀을 시작하고 곧바로 결과를 반환합니다. PHP의 배열 구조 분해(Destructuring) 문법과 함께 사용할 때 매우 직관적으로 코드를 작성할 수 있습니다:

```php
[$first, $second, $third] = Process::concurrently(function (Pool $pool) {
    $pool->path(__DIR__)->command('ls -la');
    $pool->path(app_path())->command('ls -la');
    $pool->path(storage_path())->command('ls -la');
});

echo $first->output();
```

<a name="naming-pool-processes"></a>
### 풀 프로세스에 이름 지정

숫자 인덱스로 풀 결과에 접근하는 대신, 각 프로세스에 의미 있는 문자열 키를 `as` 메서드로 지정할 수 있습니다. 이 키는 `start`의 출력 클로저에도 전달되어, 각 출력이 어떤 프로세스에 해당하는지 쉽게 알 수 있습니다:

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

풀의 `running` 메서드는 풀 내에서 실행된 모든 프로세스의 컬렉션을 반환하므로, 각각의 프로세스 ID도 쉽게 조회할 수 있습니다:

```php
$processIds = $pool->running()->each->id();
```

또한, 풀 전체에 시그널을 보내고 싶을 때는, 풀 인스턴스의 `signal` 메서드를 사용하면 모든 프로세스에 동시에 시그널을 보낼 수 있습니다:

```php
$pool->signal(SIGUSR2);
```

<a name="testing"></a>
## 테스트

라라벨의 다양한 서비스들은 테스트를 쉽고 직관적으로 작성할 수 있는 여러 기능을 제공합니다. 프로세스 서비스 역시 예외가 아닙니다. `Process` 파사드의 `fake` 메서드를 사용하면, 프로세스 실행 시 미리 정의된(가짜) 결과를 반환하도록 라라벨을 설정할 수 있습니다.

<a name="faking-processes"></a>
### 프로세스 페이크

라라벨의 프로세스 페이크 기능을 살펴보기 위해, 프로세스를 호출하는 다음과 같은 라우트를 생각해봅시다:

```php
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Route;

Route::get('/import', function () {
    Process::run('bash import.sh');

    return 'Import complete!';
});
```

이 라우트를 테스트할 때, `Process` 파사드에서 아무 인수 없이 `fake`를 호출하면, 모든 프로세스 호출에 대해 항상 성공한 가짜 결과를 반환하도록 설정할 수 있습니다. 또한, 해당 프로세스가 실행되었는지 [assert](#available-assertions)로 검증할 수도 있습니다:

```php tab=Pest
<?php

use Illuminate\Process\PendingProcess;
use Illuminate\Contracts\Process\ProcessResult;
use Illuminate\Support\Facades\Process;

test('process is invoked', function () {
    Process::fake();

    $response = $this->get('/import');

    // 간단하게 프로세스 실행 여부 확인...
    Process::assertRan('bash import.sh');

    // 또는, 프로세스 옵션을 상세히 확인...
    Process::assertRan(function (PendingProcess $process, ProcessResult $result) {
        return $process->command === 'bash import.sh' &&
               $process->timeout === 60;
    });
});
```

```php tab=PHPUnit
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

        // 간단하게 프로세스 실행 여부 확인...
        Process::assertRan('bash import.sh');

        // 또는, 프로세스 옵션을 상세히 확인...
        Process::assertRan(function (PendingProcess $process, ProcessResult $result) {
            return $process->command === 'bash import.sh' &&
                   $process->timeout === 60;
        });
    }
}
```

앞서 설명한 것처럼, `Process` 파사드에서 `fake`를 호출하면 항상 출력이 없는 성공 결과를 반환합니다. 그러나, `Process` 파사드의 `result` 메서드로 가짜 프로세스의 출력 및 종료 코드를 쉽게 지정할 수 있습니다:

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
### 특정 프로세스 페이크

앞서 본 예시처럼, `Process` 파사드는 명령어 패턴별로 서로 다른 가짜 결과를 배열로 지정할 수 있습니다.

이 배열의 키는 페이크를 적용할 명령어 패턴이고, 값은 해당 명령에 대한 결과입니다. `*` 문자는 와일드카드로 사용할 수 있습니다. 페이크가 설정되지 않은 모든 명령은 실제로 실행됩니다. 가짜 결과를 만들 때는 `Process` 파사드의 `result` 메서드를 활용할 수 있습니다:

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

만약 종료 코드나 에러 출력 등을 따로 설정할 필요가 없다면, 결과 문자열만 간단히 지정해도 됩니다:

```php
Process::fake([
    'cat *' => 'Test "cat" output',
    'ls *' => 'Test "ls" output',
]);
```

<a name="faking-process-sequences"></a>
### 프로세스 시퀀스 페이크

테스트 대상 코드가 동일한 명령을 여러 번 호출한다면, 호출마다 다른 결과를 반환해야 할 수 있습니다. 이럴 때는 `Process` 파사드의 `sequence` 메서드를 사용할 수 있습니다:

```php
Process::fake([
    'ls *' => Process::sequence()
        ->push(Process::result('First invocation'))
        ->push(Process::result('Second invocation')),
]);
```

<a name="faking-asynchronous-process-lifecycles"></a>
### 비동기 프로세스 라이프사이클 페이크

지금까지 주로 동기 방식(`run` 메서드)으로 호출된 프로세스의 페이크에 대해서만 살펴보았습니다. 비동기 방식(`start` 메서드)으로 호출된 코드를 테스트할 때는 더 세밀하고 복잡한 페이크 설정이 필요할 수 있습니다.

예를 들어, 아래와 같이 비동기 프로세스와 상호작용하는 라우트가 있다고 가정해 봅시다:

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

이런 비동기 프로세스를 제대로 페이크하기 위해서는, `running` 메서드가 몇 번이나 `true`를 반환해야 하는지 지정할 수 있어야 하고, 여러 줄의 출력 결과도 순차적으로 지정할 수 있어야 합니다. 이를 위해 `Process` 파사드의 `describe` 메서드를 사용할 수 있습니다:

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

위 예시에서 `output` 및 `errorOutput` 메서드를 사용하면 여러 줄의 출력을 순차적으로 반환하도록 설정할 수 있습니다. 마지막 종료 코드는 `exitCode`로 지정하고, `iterations` 메서드로 `running` 메서드가 몇 번 `true`를 반환할지도 지정할 수 있습니다.

<a name="available-assertions"></a>
### 사용 가능한 Assertion

[앞서 설명한 것처럼](#faking-processes), 라라벨은 기능 테스트를 위해 다양한 프로세스 assertion 메서드를 제공합니다. 아래에서 각 assertion을 살펴보겠습니다.

<a name="assert-process-ran"></a>
#### assertRan

특정 프로세스가 실행되었음을 검증합니다:

```php
use Illuminate\Support\Facades\Process;

Process::assertRan('ls -la');
```

`assertRan` 메서드는 클로저도 인수로 받을 수 있습니다. 이 클로저에는 프로세스 인스턴스와 프로세스 결과가 전달되며, 클로저가 `true`를 반환하면 assertion이 "성공" 처리됩니다:

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

특정 프로세스가 실행되지 않았음을 검증합니다:

```php
use Illuminate\Support\Facades\Process;

Process::assertDidntRun('ls -la');
```

`assertRan`과 마찬가지로, `assertDidntRun` 메서드도 클로저를 인수로 받아, 프로세스 옵션을 조건으로 assertion을 "실패"시킬 수 있습니다:

```php
Process::assertDidntRun(fn (PendingProcess $process, ProcessResult $result) =>
    $process->command === 'ls -la'
);
```

<a name="assert-process-ran-times"></a>
#### assertRanTimes

특정 프로세스가 지정된 횟수만큼 실행되었는지 확인합니다:

```php
use Illuminate\Support\Facades\Process;

Process::assertRanTimes('ls -la', times: 3);
```

이 메서드 역시 클로저를 인수로 받아, 조건을 만족하고 프로세스가 지정 횟수만큼 실행됐는지 확인할 수 있습니다:

```php
Process::assertRanTimes(function (PendingProcess $process, ProcessResult $result) {
    return $process->command === 'ls -la';
}, times: 3);
```

<a name="preventing-stray-processes"></a>
### 예상치 못한 프로세스 방지

테스트 환경에서 모든 프로세스 실행을 반드시 페이크하도록 보장하고 싶을 때는 `preventStrayProcesses` 메서드를 사용할 수 있습니다. 이 메서드를 호출한 이후, 페이크가 지정되지 않은 모든 프로세스 호출은 실제로 실행되지 않고 예외가 발생합니다:

```php
use Illuminate\Support\Facades\Process;

Process::preventStrayProcesses();

Process::fake([
    'ls *' => 'Test output...',
]);

// 페이크 결과가 반환됩니다...
Process::run('ls -la');

// 예외가 발생합니다...
Process::run('bash import.sh');
```
