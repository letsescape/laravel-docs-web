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
- [동시성 프로세스](#concurrent-processes)
    - [풀 프로세스 이름 지정](#naming-pool-processes)
    - [풀 프로세스 ID 및 시그널](#pool-process-ids-and-signals)
- [테스트](#testing)
    - [프로세스 페이크](#faking-processes)
    - [특정 프로세스 페이크](#faking-specific-processes)
    - [프로세스 시퀀스 페이크](#faking-process-sequences)
    - [비동기 프로세스 라이프사이클 페이크](#faking-asynchronous-process-lifecycles)
    - [사용 가능한 assertion](#available-assertions)
    - [불필요한 프로세스 실행 방지](#preventing-stray-processes)

<a name="introduction"></a>
## 소개

라라벨은 [Symfony Process 컴포넌트](https://symfony.com/doc/current/components/process.html)를 기반으로, 간결하고 직관적인 API를 제공합니다. 이를 활용하면 라라벨 애플리케이션에서 외부 프로세스를 편리하게 실행할 수 있습니다. 라라벨의 프로세스 관련 기능은 가장 흔히 사용되는 경우의 수에 초점을 두고, 개발자가 빠르고 쉽게 사용할 수 있도록 최적화되어 있습니다.

<a name="invoking-processes"></a>
## 프로세스 실행

프로세스를 실행하려면 `Process` 파사드에서 제공하는 `run` 및 `start` 메서드를 사용할 수 있습니다. `run` 메서드는 프로세스를 실행하고 해당 프로세스가 종료될 때까지 기다리며, `start` 메서드는 비동기 방식으로 프로세스를 실행할 때 사용합니다. 이 문서에서는 두 가지 접근법을 모두 다룹니다. 먼저, 기본적인 동기 방식의 프로세스를 실행하고 결과를 확인하는 방법을 살펴보겠습니다.

```php
use Illuminate\Support\Facades\Process;

$result = Process::run('ls -la');

return $result->output();
```

물론, `run` 메서드에서 반환되는 `Illuminate\Contracts\Process\ProcessResult` 인스턴스는 실행 결과를 확인할 수 있는 다양한 메서드를 제공합니다.

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

프로세스 실행 결과가 있고, 종료 코드가 0보다 큰(즉, 실패한) 경우 `Illuminate\Process\Exceptions\ProcessFailedException` 예외를 발생시키고 싶다면 `throw` 또는 `throwIf` 메서드를 사용할 수 있습니다. 만약 프로세스가 실패하지 않았다면, 프로세스 결과 인스턴스가 그대로 반환됩니다.

```php
$result = Process::run('ls -la')->throw();

$result = Process::run('ls -la')->throwIf($condition);
```

<a name="process-options"></a>
### 프로세스 옵션

실행하기 전에 프로세스의 동작 방식을 커스터마이징해야 할 때가 있습니다. 라라벨에서는 작업 디렉터리, 타임아웃, 환경 변수 등 다양한 프로세스 옵션을 쉽게 설정할 수 있습니다.

<a name="working-directory-path"></a>
#### 작업 디렉터리 경로

작업 디렉터리를 지정하려면 `path` 메서드를 사용하면 됩니다. 이 메서드를 호출하지 않으면, 현재 실행 중인 PHP 스크립트의 작업 디렉터리를 상속합니다.

```php
$result = Process::path(__DIR__)->run('ls -la');
```

<a name="input"></a>
#### 입력값

`input` 메서드를 이용하여 프로세스의 "표준 입력"으로 데이터를 전달할 수 있습니다.

```php
$result = Process::input('Hello World')->run('cat');
```

<a name="timeouts"></a>
#### 타임아웃

기본적으로, 프로세스가 60초 이상 실행되면 `Illuminate\Process\Exceptions\ProcessTimedOutException` 예외가 발생합니다. `timeout` 메서드를 이용해 이 동작을 변경할 수 있습니다.

```php
$result = Process::timeout(120)->run('bash import.sh');
```

또는 타임아웃을 완전히 비활성화하고 싶다면 `forever` 메서드를 호출할 수 있습니다.

```php
$result = Process::forever()->run('bash import.sh');
```

`idleTimeout` 메서드는 프로세스가 아무런 출력을 내지 않고 실행될 수 있는 최대 시간을(초 단위로) 지정합니다.

```php
$result = Process::timeout(60)->idleTimeout(30)->run('bash import.sh');
```

<a name="environment-variables"></a>
#### 환경 변수

`env` 메서드를 사용해 프로세스에 전달할 환경 변수를 지정할 수 있습니다. 이 때, 시스템에 이미 정의된 모든 환경 변수도 함께 상속됩니다.

```php
$result = Process::forever()
    ->env(['IMPORT_PATH' => __DIR__])
    ->run('bash import.sh');
```

상속된 환경 변수 중에서 특정 값을 제거하고 싶다면 해당 환경 변수를 `false` 값으로 지정하면 됩니다.

```php
$result = Process::forever()
    ->env(['LOAD_PATH' => false])
    ->run('bash import.sh');
```

<a name="tty-mode"></a>
#### TTY 모드

`tty` 메서드를 사용하면 프로세스의 입력과 출력을 프로그램의 입출력과 직접적으로 연결할 수 있습니다. 이를 통해 vim, nano 등 에디터를 프로세스로 열 수도 있습니다.

```php
Process::forever()->tty()->run('vim');
```

<a name="process-output"></a>
### 프로세스 출력

앞서 설명한 것처럼, 프로세스 실행 결과는 `output`(표준 출력)과 `errorOutput`(표준 에러) 메서드로 확인할 수 있습니다.

```php
use Illuminate\Support\Facades\Process;

$result = Process::run('ls -la');

echo $result->output();
echo $result->errorOutput();
```

또한, `run` 메서드의 두 번째 인수로 클로저를 전달하여 실시간으로 출력을 받아볼 수도 있습니다. 이 클로저는 출력의 "타입"(즉, `stdout` 또는 `stderr`)과 실제 출력 문자열을 인수로 받습니다.

```php
$result = Process::run('ls -la', function (string $type, string $output) {
    echo $output;
});
```

라라벨에서는 `seeInOutput`과 `seeInErrorOutput` 메서드도 제공하여, 프로세스 출력에 특정 문자열이 포함되어 있는지 편리하게 확인할 수 있습니다.

```php
if (Process::run('ls -la')->seeInOutput('laravel')) {
    // ...
}
```

<a name="disabling-process-output"></a>
#### 프로세스 출력 비활성화

프로세스가 불필요하게 많은 출력을 남기지만, 해당 내용을 확인할 필요가 없다면, 출력을 완전히 비활성화하여 메모리를 절약할 수 있습니다. 이 경우, 프로세스 빌드 시 `quietly` 메서드를 호출하면 됩니다.

```php
use Illuminate\Support\Facades\Process;

$result = Process::quietly()->run('bash import.sh');
```

<a name="process-pipelines"></a>
### 파이프라인

때로는 한 프로세스의 출력을 다른 프로세스의 입력으로 넘겨주고 싶을 때가 있습니다. 이런 동작을 "파이핑"이라고 하며, `Process` 파사드의 `pipe` 메서드로 쉽게 구현할 수 있습니다. `pipe` 메서드는 파이프라인의 모든 프로세스를 동기적으로 실행한 뒤, 마지막 프로세스의 결과를 반환합니다.

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

파이프라인을 구성하는 각 프로세스를 커스터마이징할 필요가 없다면, 명령어 문자열을 배열로 전달할 수도 있습니다.

```php
$result = Process::pipe([
    'cat example.txt',
    'grep -i "laravel"',
]);
```

파이프라인 실행 도중, 실시간으로 출력을 받고 싶다면 두 번째 인수로 클로저를 전달할 수 있습니다. 이 클로저는 "타입"(stdout, stderr)과 출력 문자열을 인수로 받습니다.

```php
$result = Process::pipe(function (Pipe $pipe) {
    $pipe->command('cat example.txt');
    $pipe->command('grep -i "laravel"');
}, function (string $type, string $output) {
    echo $output;
});
```

라라벨은 각 프로세스에 `as` 메서드로 문자열 키를 등록하고, 이를 통해 해당 출력이 어떤 프로세스에서 발생한 것인지도 알 수 있도록 해줍니다. `pipe` 메서드에서 출력 클로저를 사용할 경우 이 키도 함께 전달받을 수 있습니다.

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

`run` 메서드는 프로세스를 동기적으로 실행하는 반면, `start` 메서드는 비동기 방식으로 프로세스를 실행합니다. 이를 이용하면 프로세스를 백그라운드에서 돌리면서 애플리케이션이 다른 작업을 계속 수행할 수 있습니다. 프로세스가 실행된 후에는 `running` 메서드를 이용해 아직 실행 중인지 확인할 수 있습니다.

```php
$process = Process::timeout(120)->start('bash import.sh');

while ($process->running()) {
    // ...
}

$result = $process->wait();
```

이처럼, 프로세스가 끝날 때까지 기다리려면 `wait` 메서드를 호출하여 결과 인스턴스를 반환받으면 됩니다.

```php
$process = Process::timeout(120)->start('bash import.sh');

// ...

$result = $process->wait();
```

<a name="process-ids-and-signals"></a>
### 프로세스 ID 및 시그널

실행 중인 프로세스의 운영체제 PID(Process ID)를 얻으려면 `id` 메서드를 사용할 수 있습니다.

```php
$process = Process::start('bash import.sh');

return $process->id();
```

`signal` 메서드를 이용하면 실행 중인 프로세스에 시그널을 보낼 수 있습니다. 사용 가능한 시그널 상수 목록은 [PHP 공식 문서](https://www.php.net/manual/en/pcntl.constants.php)에서 확인할 수 있습니다.

```php
$process->signal(SIGUSR2);
```

<a name="asynchronous-process-output"></a>
### 비동기 프로세스 출력

비동기 프로세스가 실행 중일 때, 전체 출력을 `output` 및 `errorOutput` 메서드로 언제든지 확인할 수 있습니다. 또는 `latestOutput`과 `latestErrorOutput`을 사용하면, 마지막으로 출력을 가져온 시점 이후 새로 생성된 출력만 받아올 수도 있습니다.

```php
$process = Process::timeout(120)->start('bash import.sh');

while ($process->running()) {
    echo $process->latestOutput();
    echo $process->latestErrorOutput();

    sleep(1);
}
```

`run` 메서드와 마찬가지로, 비동기 프로세스도 `start` 메서드의 두 번째 인자로 클로저를 전달하면 실시간으로 출력을 받아올 수 있습니다.

```php
$process = Process::start('bash import.sh', function (string $type, string $output) {
    echo $output;
});

$result = $process->wait();
```

프로세스가 끝날 때까지 기다리는 대신, `waitUntil` 메서드를 사용하면 출력값을 기준으로 기다림을 중단할 수도 있습니다. 전달한 클로저가 `true`를 반환하면 라라벨이 추가 출력을 기다리지 않습니다.

```php
$process = Process::start('bash import.sh');

$process->waitUntil(function (string $type, string $output) {
    return $output === 'Ready...';
});
```

<a name="asynchronous-process-timeouts"></a>
### 비동기 프로세스 타임아웃

비동기 프로세스가 실행 중일 때, `ensureNotTimedOut` 메서드를 사용해 타임아웃이 발생하지 않았는지 확인할 수 있습니다. 만약 프로세스가 타임아웃되었다면 [타임아웃 예외](#timeouts)가 발생합니다.

```php
$process = Process::timeout(120)->start('bash import.sh');

while ($process->running()) {
    $process->ensureNotTimedOut();

    // ...

    sleep(1);
}
```

<a name="concurrent-processes"></a>
## 동시성 프로세스

라라벨에서는 복수의 비동기 프로세스 풀을 간편하게 관리할 수 있어 여러 작업을 동시에 실행하는 것도 매우 쉽습니다. 먼저, `pool` 메서드를 호출하여 프로세스 풀을 생성하며, 여기서 `Illuminate\Process\Pool` 인스턴스를 인수로 받는 클로저 내에서 풀에 추가할 프로세스를 정의합니다. 프로세스 풀을 `start`로 실행한 뒤, `running` 메서드를 사용해 현재 실행 중인 프로세스의 [컬렉션](/docs/12.x/collections)에 접근할 수 있습니다.

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

보시는 것처럼, 모든 풀 프로세스의 실행이 끝날 때까지 기다렸다가, `wait` 메서드로 각각의 결과를 받아올 수 있습니다. `wait` 메서드는 배열로 접근 가능한 객체를 반환하며, 각 프로세스의 키를 통해 해당 결과 인스턴스에 접근할 수 있습니다.

```php
$results = $pool->wait();

echo $results[0]->output();
```

또한, 편의상 `concurrently` 메서드를 사용하면 비동기 프로세스 풀을 바로 시작하고 결과를 즉시 기다릴 수 있습니다. PHP의 배열 구조 분해 기능과 조합하면 더욱 직관적인 코드를 작성할 수 있습니다.

```php
[$first, $second, $third] = Process::concurrently(function (Pool $pool) {
    $pool->path(__DIR__)->command('ls -la');
    $pool->path(app_path())->command('ls -la');
    $pool->path(storage_path())->command('ls -la');
});

echo $first->output();
```

<a name="naming-pool-processes"></a>
### 풀 프로세스 이름 지정

숫자 키로 풀의 결과에 접근하는 것은 직관적이지 않을 수 있습니다. 라라벨에서는 `as` 메서드로 각 프로세스에 문자열 키를 부여할 수 있습니다. 이 키는 `start` 메서드에 전달하는 클로저에도 전달되어, 어떤 프로세스에서 출력된 결과인지 쉽게 알 수 있습니다.

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

풀의 `running` 메서드는 현재 실행 중인 모든 프로세스의 컬렉션을 반환하므로, 각 풀 프로세스의 ID에도 쉽게 접근할 수 있습니다.

```php
$processIds = $pool->running()->each->id();
```

또한 편리하게, 프로세스 풀 전체에 `signal` 메서드를 호출하면, 풀 내의 모든 프로세스에 시그널을 일괄 전송할 수 있습니다.

```php
$pool->signal(SIGUSR2);
```

<a name="testing"></a>
## 테스트

라라벨의 여러 서비스들은 손쉽고 직관적으로 테스트를 작성할 수 있는 다양한 기능을 제공합니다. 프로세스 서비스 역시 예외는 아닙니다. `Process` 파사드의 `fake` 메서드를 사용하면, 프로세스 실행 시 실제로 외부에서 실행하지 않고 가짜(더미) 결과를 반환하도록 설정할 수 있습니다.

<a name="faking-processes"></a>
### 프로세스 페이크

라라벨에서 프로세스를 페이크하는 방법을 알아보기 위해, 먼저 아래의 예시처럼 프로세스를 실행하는 간단한 라우트를 가정해보겠습니다.

```php
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Route;

Route::get('/import', function () {
    Process::run('bash import.sh');

    return 'Import complete!';
});
```

테스트 중에 모든 프로세스 호출 결과를 성공한 결과로 페이크하고 싶다면, `Process` 파사드의 `fake` 메서드를 별도 인수 없이 호출하면 됩니다. 또한, [assertion](#available-assertions) 기능을 이용해 특정 프로세스가 정상적으로 실행되었는지도 확인할 수 있습니다.

```php tab=Pest
<?php

use Illuminate\Process\PendingProcess;
use Illuminate\Contracts\Process\ProcessResult;
use Illuminate\Support\Facades\Process;

test('process is invoked', function () {
    Process::fake();

    $response = $this->get('/import');

    // 간단한 프로세스 assertion...
    Process::assertRan('bash import.sh');

    // 또는 프로세스의 설정을 검사하기...
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

        // 간단한 프로세스 assertion...
        Process::assertRan('bash import.sh');

        // 또는 프로세스의 설정을 검사하기...
        Process::assertRan(function (PendingProcess $process, ProcessResult $result) {
            return $process->command === 'bash import.sh' &&
                   $process->timeout === 60;
        });
    }
}
```

위에서 설명한 것처럼, `Process` 파사드의 `fake` 메서드를 호출하면 항상 출력 없이 성공한 프로세스 결과를 반환합니다. 하지만, `Process` 파사드의 `result` 메서드를 사용하면 페이크 프로세스의 출력 및 종료 코드도 쉽게 지정할 수 있습니다.

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

앞선 예시에서 보았듯, `Process` 파사드는 배열을 통해 프로세스별로 다른 페이크 결과를 지정할 수도 있습니다.

이 배열의 키는 실제로 페이크하고자 하는 명령 패턴이 되고, 값은 해당 명령어가 실행될 때 반환할 페이크 결과입니다. `*` 문자(와일드카드)도 사용할 수 있습니다. 배열에 지정되지 않은 프로세스 명령은 실제로 실행됩니다. 각각의 페이크 결과는 `Process` 파사드의 `result` 메서드로 생성할 수 있습니다.

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

종료 코드나 에러 출력을 별도로 지정할 필요가 없다면 간단하게 문자열로 지정할 수도 있습니다.

```php
Process::fake([
    'cat *' => 'Test "cat" output',
    'ls *' => 'Test "ls" output',
]);
```

<a name="faking-process-sequences"></a>
### 프로세스 시퀀스 페이크

테스트하는 코드에서 같은 명령으로 여러 번 프로세스를 실행한다면, 각 실행마다 다른 페이크 결과를 반환하고 싶을 수 있습니다. 이럴 때는 `Process` 파사드의 `sequence` 메서드를 사용해 시퀀스를 정의할 수 있습니다.

```php
Process::fake([
    'ls *' => Process::sequence()
        ->push(Process::result('First invocation'))
        ->push(Process::result('Second invocation')),
]);
```

<a name="faking-asynchronous-process-lifecycles"></a>
### 비동기 프로세스 라이프사이클 페이크

여기까지는 주로 `run` 메서드를 사용하는 동기 프로세스 페이크에 대해 다뤘습니다. 하지만, `start`로 실행한 비동기 프로세스의 동작을 테스트할 때는 더 세밀하게 동작을 정의할 필요가 있습니다.

예를 들어, 아래와 같이 비동기 프로세스와 상호작용하는 라우트가 있다고 가정해보겠습니다.

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

이때는, `running` 메서드가 몇 번 `true`를 반환할지, 여러 번에 걸쳐 어떤 출력이 반환될지 모두 지정해야 합니다. 이럴 때 `Process` 파사드의 `describe` 메서드를 사용할 수 있습니다.

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

위 예시를 조금 더 살펴보면, `output`과 `errorOutput`으로 여러 줄의 출력을 순차적으로 지정할 수 있습니다. `exitCode`는 마지막 종료 코드를, `iterations`는 `running` 메서드가 몇 번 `true`를 반환할지를 의미합니다.

<a name="available-assertions"></a>
### 사용 가능한 assertion

[앞서 설명한 것처럼](#faking-processes), 라라벨에서는 테스트에서 사용할 수 있는 다양한 프로세스 assertion을 제공합니다. 아래에서 각 assertion의 사용법을 살펴봅니다.

<a name="assert-process-ran"></a>
#### assertRan

특정 프로세스가 실행되었는지 확인합니다.

```php
use Illuminate\Support\Facades\Process;

Process::assertRan('ls -la');
```

`assertRan` 메서드는 클로저도 받을 수 있습니다. 이 때 프로세스 인스턴스와 결과 인스턴스를 받아 원하는 설정 값을 검사할 수 있습니다. 클로저가 `true`를 반환하면 assertion이 "성공"으로 간주됩니다.

```php
Process::assertRan(fn ($process, $result) =>
    $process->command === 'ls -la' &&
    $process->path === __DIR__ &&
    $process->timeout === 60
);
```

이때 `$process`는 `Illuminate\Process\PendingProcess` 인스턴스, `$result`는 `Illuminate\Contracts\Process\ProcessResult` 인스턴스입니다.

<a name="assert-process-didnt-run"></a>
#### assertDidntRun

특정 프로세스가 실행되지 않았는지 확인합니다.

```php
use Illuminate\Support\Facades\Process;

Process::assertDidntRun('ls -la');
```

`assertRan`처럼, `assertDidntRun`도 클로저를 받을 수 있으며, 클로저가 `true`를 반환하면 assertion이 "실패"로 간주됩니다.

```php
Process::assertDidntRun(fn (PendingProcess $process, ProcessResult $result) =>
    $process->command === 'ls -la'
);
```

<a name="assert-process-ran-times"></a>
#### assertRanTimes

특정 프로세스가 지정한 횟수만큼 실행되었는지 확인합니다.

```php
use Illuminate\Support\Facades\Process;

Process::assertRanTimes('ls -la', times: 3);
```

`assertRanTimes`도 마찬가지로 클로저를 사용할 수 있습니다. 클로저가 `true`를 반환하고, 프로세스가 지정한 횟수만큼 실행되었다면 assertion이 "성공"입니다.

```php
Process::assertRanTimes(function (PendingProcess $process, ProcessResult $result) {
    return $process->command === 'ls -la';
}, times: 3);
```

<a name="preventing-stray-processes"></a>
### 불필요한 프로세스 실행 방지

모든 프로세스 실행이 반드시 페이크되어야 한다는 것을 확인하고 싶으면, `preventStrayProcesses` 메서드를 사용하면 됩니다. 이 메서드를 호출한 이후에는, 배열에 지정되지 않은 프로세스가 실행되면 실제 프로세스가 실행되지 않고 대신 예외가 발생합니다.

```php
use Illuminate\Support\Facades\Process;

Process::preventStrayProcesses();

Process::fake([
    'ls *' => 'Test output...',
]);

// 페이크 결과 반환...
Process::run('ls -la');

// 예외 발생...
Process::run('bash import.sh');
```
