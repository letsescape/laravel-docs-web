# 아티즌 콘솔 (Artisan Console)

- [소개](#introduction)
    - [Tinker (REPL)](#tinker)
- [명령어 작성하기](#writing-commands)
    - [명령어 생성](#generating-commands)
    - [명령어 구조](#command-structure)
    - [클로저 명령어](#closure-commands)
    - [Isolatable 명령어](#isolatable-commands)
- [입력값 정의하기](#defining-input-expectations)
    - [인수(Arguments)](#arguments)
    - [옵션(Options)](#options)
    - [입력 배열(Input Arrays)](#input-arrays)
    - [입력 설명(Input Descriptions)](#input-descriptions)
- [명령어 입출력](#command-io)
    - [입력값 가져오기](#retrieving-input)
    - [입력 요청하기](#prompting-for-input)
    - [출력 작성하기](#writing-output)
- [명령어 등록하기](#registering-commands)
- [프로그램적으로 명령어 실행하기](#programmatically-executing-commands)
    - [다른 명령어에서 명령어 호출하기](#calling-commands-from-other-commands)
- [신호 처리](#signal-handling)
- [스텁(stub) 커스터마이징](#stub-customization)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

Artisan은 라라벨에 기본 포함된 명령줄 인터페이스입니다. Artisan은 애플리케이션의 루트 디렉터리에 `artisan` 스크립트로 위치하며, 애플리케이션을 개발할 때 유용하게 사용할 수 있는 다양한 명령어를 제공합니다. 사용 가능한 모든 Artisan 명령어를 확인하려면 `list` 명령어를 사용하십시오.

```shell
php artisan list
```

각 명령어에는 해당 명령어에서 사용할 수 있는 인수와 옵션을 보여주는 "도움말" 화면이 함께 제공됩니다. 도움말 화면을 확인하려면 명령어 이름 앞에 `help`를 붙여 실행하면 됩니다.

```shell
php artisan help migrate
```

<a name="laravel-sail"></a>
#### Laravel Sail

[Laravel Sail](/docs/9.x/sail)을 로컬 개발 환경으로 사용 중이라면, Artisan 명령어를 실행할 때 반드시 `sail` 커맨드라인을 사용해야 합니다. Sail은 해당 Artisan 명령어를 애플리케이션의 Docker 컨테이너 안에서 실행합니다.

```shell
./vendor/bin/sail artisan list
```

<a name="tinker"></a>
### Tinker (REPL)

Laravel Tinker는 라라벨 프레임워크에서 강력한 REPL 환경을 제공하며, [PsySH](https://github.com/bobthecow/psysh) 패키지로 구동됩니다.

<a name="installation"></a>
#### 설치

Tinker는 모든 라라벨 애플리케이션에 기본 포함되어 있습니다. 하지만, 이전에 Tinker를 애플리케이션에서 제거했다면 Composer를 사용해 다시 설치할 수 있습니다.

```shell
composer require laravel/tinker
```

> [!NOTE]
> 라라벨 애플리케이션과 상호작용할 수 있는 그래픽 UI가 필요하신가요? [Tinkerwell](https://tinkerwell.app)을 확인해 보세요!

<a name="usage"></a>
#### 사용법

Tinker를 사용하면 명령줄에서 라라벨 애플리케이션 전체와, Eloquent 모델, 잡(jobs), 이벤트 등 다양한 부분과 상호작용할 수 있습니다. Tinker 환경에 진입하려면 아래와 같이 Artisan 명령어를 실행합니다.

```shell
php artisan tinker
```

Tinker의 설정 파일은 `vendor:publish` 명령어로 배포할 수 있습니다.

```shell
php artisan vendor:publish --provider="Laravel\Tinker\TinkerServiceProvider"
```

> [!WARNING]
> `dispatch` 헬퍼 함수나 `Dispatchable` 클래스의 `dispatch` 메서드는 잡을 큐에 넣을 때 가비지 컬렉션에 의존합니다. 따라서 Tinker를 사용할 때는 `Bus::dispatch` 또는 `Queue::push`를 이용해 잡을 디스패치해야 합니다.

<a name="command-allow-list"></a>
#### 명령어 허용 리스트

Tinker는 쉘 안에서 어떤 Artisan 명령어를 실행할 수 있는지 "허용(allow)" 리스트를 사용해 결정합니다. 기본적으로 `clear-compiled`, `down`, `env`, `inspire`, `migrate`, `optimize`, `up` 명령어는 실행할 수 있습니다. 허용할 명령어를 추가하고 싶다면 `tinker.php` 설정 파일의 `commands` 배열에 추가하세요.

```
'commands' => [
    // App\Console\Commands\ExampleCommand::class,
],
```

<a name="classes-that-should-not-be-aliased"></a>
#### Alias로 지정하지 않을 클래스

대부분의 경우 Tinker는 클래스와 상호작용할 때 자동으로 alias를 생성해줍니다. 하지만 일부 클래스는 alias를 생성하지 않도록 예외를 둘 수 있습니다. 이때는 `tinker.php` 설정 파일의 `dont_alias` 배열에 해당 클래스를 추가하면 됩니다.

```
'dont_alias' => [
    App\Models\User::class,
],
```

<a name="writing-commands"></a>
## 명령어 작성하기

Artisan이 기본 제공하는 명령어 외에도 직접 커스텀 명령어를 개발할 수 있습니다. 명령어 클래스는 보통 `app/Console/Commands` 디렉터리에 저장합니다. 하지만 Composer로 로드될 수 있다면 다른 위치에 자유롭게 저장해도 무방합니다.

<a name="generating-commands"></a>
### 명령어 생성

새 명령어를 만들 때는 `make:command` Artisan 명령어를 사용하면 됩니다. 이 명령어를 실행하면 `app/Console/Commands` 디렉터리에 새로운 명령어 클래스가 생성됩니다. 이 디렉터리가 애플리케이션에 없다면, 처음 명령어를 생성할 때 자동으로 만들어집니다.

```shell
php artisan make:command SendEmails
```

<a name="command-structure"></a>
### 명령어 구조

명령어를 생성했다면, 해당 클래스의 `signature`와 `description` 속성(property)에 적절한 값을 정의해야 합니다. 이 값들은 명령어를 `list` 화면에서 표시할 때 사용됩니다. 또한 `signature` 속성을 활용해 [명령어 입력값 기대치](#defining-input-expectations)도 함께 정의할 수 있습니다. `handle` 메서드는 명령어가 실제 실행될 때 호출됩니다. 이 메서드 안에서 명령어의 실행 로직을 작성하면 됩니다.

예시 명령어를 살펴보겠습니다. `handle` 메서드에서 의존성이 필요한 경우, 라라벨 [서비스 컨테이너](/docs/9.x/container)가 타입힌트로 지정된 의존성을 자동으로 주입해줍니다.

```
<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Support\DripEmailer;
use Illuminate\Console\Command;

class SendEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:send {user}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a marketing email to a user';

    /**
     * Execute the console command.
     *
     * @param  \App\Support\DripEmailer  $drip
     * @return mixed
     */
    public function handle(DripEmailer $drip)
    {
        $drip->send(User::find($this->argument('user')));
    }
}
```

> [!NOTE]
> 코드 재사용성을 높이기 위해, 콘솔 명령어의 본문은 최대한 가볍게 유지하고 실제 주요 로직은 애플리케이션 서비스에 위임하는 것이 좋습니다. 위 예시에서도 이메일 발송의 "주요 작업"을 별도의 서비스 클래스에 맡기고 있습니다.

<a name="closure-commands"></a>
### 클로저 명령어

클래스로 명령어를 정의하지 않고, 클로저(익명함수) 기반으로 명령어를 정의할 수도 있습니다. 라우트에서 클로저가 컨트롤러의 대안인 것처럼, 클로저 명령어도 클래스 기반 명령어의 다른 방식으로 활용할 수 있습니다. `app/Console/Kernel.php` 파일의 `commands` 메서드에서는 `routes/console.php` 파일을 로드하게 되어 있습니다.

```
/**
 * Register the closure based commands for the application.
 *
 * @return void
 */
protected function commands()
{
    require base_path('routes/console.php');
}
```

이 파일은 HTTP 라우트를 정의하는 것이 아니라, 애플리케이션으로 진입할 수 있는 콘솔 기반의 "엔트리 포인트(라우트)"를 정의하는 파일입니다. 이곳에서 `Artisan::command` 메서드를 사용해 클로저 기반 명령어를 정의할 수 있습니다. `command` 메서드는 [명령어 시그니처](#defining-input-expectations)와 인수, 옵션을 받을 클로저를 받습니다.

```
Artisan::command('mail:send {user}', function ($user) {
    $this->info("Sending email to: {$user}!");
});
```

클로저는 해당 명령어 인스턴스에 바인딩되어 있으므로, 명령어 클래스에서 사용 가능한 모든 헬퍼 메서드를 그대로 사용할 수 있습니다.

<a name="type-hinting-dependencies"></a>
#### 의존성 타입힌트

명령어 시그니처에 정의된 인수와 옵션뿐만 아니라, [서비스 컨테이너](/docs/9.x/container)에서 자동으로 해결되는 다른 의존성도 클로저에서 타입힌트로 지정할 수 있습니다.

```
use App\Models\User;
use App\Support\DripEmailer;

Artisan::command('mail:send {user}', function (DripEmailer $drip, $user) {
    $drip->send(User::find($user));
});
```

<a name="closure-command-descriptions"></a>
#### 클로저 명령어 설명

클로저 기반 명령어를 정의할 때, `purpose` 메서드를 이용해 명령어 설명을 추가할 수 있습니다. 이 설명은 `php artisan list`나 `php artisan help` 실행 시 표시됩니다.

```
Artisan::command('mail:send {user}', function ($user) {
    // ...
})->purpose('Send a marketing email to a user');
```

<a name="isolatable-commands"></a>
### Isolatable 명령어

> [!WARNING]
> 이 기능을 사용하려면, 애플리케이션의 기본 캐시 드라이버로 `memcached`, `redis`, `dynamodb`, `database`, `file`, 또는 `array` 중 하나를 사용해야 합니다. 그리고 모든 서버가 동일한 중앙 캐시 서버와 통신하고 있어야 합니다.

하나의 명령어 인스턴스만 동시에 실행되도록 제한해야 할 상황이 있을 수 있습니다. 이 기능이 필요하다면 명령어 클래스에서 `Illuminate\Contracts\Console\Isolatable` 인터페이스를 구현하면 됩니다.

```
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Contracts\Console\Isolatable;

class SendEmails extends Command implements Isolatable
{
    // ...
}
```

명령어가 `Isolatable`로 마크되면, 라라벨은 자동으로 해당 명령어에 `--isolated` 옵션을 추가해줍니다. 옵션을 포함해 명령어를 실행하면, 라라벨은 동일한 명령어가 이미 실행 중인지 확인하여 중복 실행을 막아줍니다. 이 기능은 애플리케이션에서 기본 캐시 드라이버를 사용해 원자적(atomic) 락을 획득하는 방식으로 동작합니다. 만약 이미 명령어 인스턴스가 실행 중이라면, 명령어는 실행되지 않고, 정상 종료 상태(ex: 0)로 종료됩니다.

```shell
php artisan mail:send 1 --isolated
```

명령어가 실행되지 못했을 때 반환할 종료 상태 코드를 지정하고 싶다면 `isolated` 옵션에 원하는 값을 전달할 수 있습니다.

```shell
php artisan mail:send 1 --isolated=12
```

<a name="lock-expiration-time"></a>
#### 락 만료 시간

기본적으로, isolation 락은 명령어 실행이 끝나면 바로 해제됩니다. 만약 명령어가 중단(interrupt)되어 정상적으로 종료되지 못할 경우, 락은 1시간 후에 만료됩니다. 락의 만료 시간을 변경하려면 명령어 클래스에 `isolationLockExpiresAt` 메서드를 정의하면 됩니다.

```php
/**
 * Determine when an isolation lock expires for the command.
 *
 * @return \DateTimeInterface|\DateInterval
 */
public function isolationLockExpiresAt()
{
    return now()->addMinutes(5);
}
```

<a name="defining-input-expectations"></a>
## 입력값 정의하기

콘솔 명령어를 작성할 때 사용자의 입력을 인수 또는 옵션 형태로 받는 일이 많습니다. 라라벨은 각 명령어 클래스의 `signature` 속성을 통해 입력값의 이름, 인수, 옵션 등을 한 번에 간편한 라우트 시그니처와 유사한 형태로 정의할 수 있도록 도와줍니다.

<a name="arguments"></a>
### 인수(Arguments)

명령어에서 사용자 입력값(인수, 옵션)을 정의할 때는 중괄호로 감싸 표현합니다. 아래 예시에서는 필수 인수인 `user` 하나가 정의되어 있습니다.

```
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user}';
```

인수를 선택적으로 만들거나, 기본값을 정해줄 수도 있습니다.

```
// 선택적(옵셔널) 인수...
'mail:send {user?}'

// 기본값이 지정된 선택적 인수...
'mail:send {user=foo}'
```

<a name="options"></a>
### 옵션(Options)

옵션도 인수처럼 사용자 입력값의 일종입니다. 옵션은 커맨드라인에서 두 개의 하이픈(`--`)으로 시작합니다. 옵션에는 값을 받는 옵션과 받지 않는 옵션(불리언 "스위치")이 있습니다. 불리언 "스위치" 옵션의 예는 다음과 같습니다.

```
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue}';
```

이 예시에서는 Artisan 명령어를 실행할 때 `--queue` 스위치를 지정할 수 있습니다. `--queue` 스위치를 지정하면 옵션의 값은 `true`가 되고, 지정하지 않으면 `false`가 됩니다.

```shell
php artisan mail:send 1 --queue
```

<a name="options-with-values"></a>
#### 값이 있는 옵션

값을 기대하는 옵션의 경우, 옵션 이름 뒤에 `=` 기호를 추가해야 합니다. 아래 예시처럼 사용할 수 있습니다.

```
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue=}';
```

이 경우, 사용자는 아래와 같이 옵션에 값을 넘길 수 있고, 옵션이 생략되면 값은 `null`이 됩니다.

```shell
php artisan mail:send 1 --queue=default
```

옵션에 기본값을 정해주고 싶다면, 옵션 이름 뒤에 기본값을 추가합니다. 사용자가 값을 입력하지 않으면 기본값이 적용됩니다.

```
'mail:send {user} {--queue=default}'
```

<a name="option-shortcuts"></a>
#### 옵션 단축키

옵션에 단축키를 지정하고 싶다면, 옵션 이름 앞에 | 기호를 사용해 구분하여 등록할 수 있습니다.

```
'mail:send {user} {--Q|queue}'
```

명령어를 터미널에서 실행할 때는 단축키 옵션에 한 개의 하이픈을 붙여 씁니다.

```shell
php artisan mail:send 1 -Q
```

<a name="input-arrays"></a>
### 입력 배열(Input Arrays)

인수 또는 옵션에서 여러 개의 값을 받을 수 있도록 하려면 `*` 기호를 사용할 수 있습니다. 먼저 인수에 적용한 예를 살펴봅니다.

```
'mail:send {user*}'
```

이렇게 정의하면 명령줄에서 `user` 인수를 여러 개 순서대로 입력할 수 있습니다. 예를 들면 아래 명령은 `user` 인수 값이 `[1,2]`로 배열로 전달됩니다.

```shell
php artisan mail:send 1 2
```

`*` 문자를 선택적 인수와 조합하면 인수를 0개 이상 받아들일 수도 있습니다.

```
'mail:send {user?*}'
```

<a name="option-arrays"></a>
#### 옵션 배열

여러 입력값을 받는 옵션을 정의할 때는 각각의 옵션 값 앞에 옵션 이름을 붙여 사용해야 합니다.

```
'mail:send {--id=*}'
```

명령어를 실행할 때 여러 옵션 값을 전달하면 됩니다.

```shell
php artisan mail:send --id=1 --id=2
```

<a name="input-descriptions"></a>
### 입력 설명

인수 또는 옵션에 설명을 추가하려면, 이름 뒤에 콜론과 설명을 적어 구분할 수 있습니다. 좀 더 명확한 정의가 필요하다면 여러 줄에 걸쳐 나누어 쓸 수도 있습니다.

```
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send
                        {user : The ID of the user}
                        {--queue : Whether the job should be queued}';
```

<a name="command-io"></a>
## 명령어 입출력

<a name="retrieving-input"></a>
### 입력값 가져오기

명령어가 실행되는 동안, 전달받은 인수와 옵션의 값을 가져와야 할 때가 있습니다. 이때는 `argument` 및 `option` 메서드를 사용할 수 있습니다. 인수 또는 옵션이 존재하지 않으면 `null`이 반환됩니다.

```
/**
 * Execute the console command.
 *
 * @return int
 */
public function handle()
{
    $userId = $this->argument('user');

    //
}
```

인수 전체를 배열 형태로 한 번에 가져오려면 `arguments` 메서드를 사용합니다.

```
$arguments = $this->arguments();
```

옵션도 마찬가지로, `option` 메서드로 개별 옵션을, `options` 메서드로 전체 옵션 배열을 받아올 수 있습니다.

```
// 특정 옵션 값 가져오기...
$queueName = $this->option('queue');

// 모든 옵션을 배열로 가져오기...
$options = $this->options();
```

<a name="prompting-for-input"></a>
### 입력 요청하기

출력만 하는 것 외에도, 명령어 실행 도중 사용자에게 입력을 요청할 수도 있습니다. `ask` 메서드는 사용자가 입력한 값을 받아 반환하며, 원하는 질문을 함께 표시할 수 있습니다.

```
/**
 * Execute the console command.
 *
 * @return mixed
 */
public function handle()
{
    $name = $this->ask('What is your name?');
}
```

`secret` 메서드는 `ask`와 비슷하지만, 입력값이 콘솔에 노출되지 않습니다. 비밀번호 등 민감한 정보를 받을 때 유용합니다.

```
$password = $this->secret('What is the password?');
```

<a name="asking-for-confirmation"></a>
#### 확인(Yes/No) 질문

사용자에게 간단하게 "예/아니오"로 확인을 받고 싶다면 `confirm` 메서드를 사용할 수 있습니다. 이 메서드는 기본적으로 `false`를 반환하지만, 사용자가 프롬프트에서 `y` 또는 `yes`를 입력하면 `true`를 반환합니다.

```
if ($this->confirm('Do you wish to continue?')) {
    //
}
```

필요하다면 `confirm` 메서드의 두 번째 인자로 `true`를 넘겨, 기본값을 "예"로 설정할 수도 있습니다.

```
if ($this->confirm('Do you wish to continue?', true)) {
    //
}
```

<a name="auto-completion"></a>
#### 자동완성(Auto-Completion)

사용자 입력에 자동완성 힌트를 제공하고 싶다면 `anticipate` 메서드를 사용할 수 있습니다. 자동완성 힌트가 있어도 사용자는 임의의 값을 입력할 수 있습니다.

```
$name = $this->anticipate('What is your name?', ['Taylor', 'Dayle']);
```

혹은 두 번째 인자로 클로저를 넘기면, 사용자가 문자를 입력할 때마다 해당 클로저가 호출됩니다. 클로저는 지금까지 입력한 내용을 받아, 자동완성 후보를 배열로 반환해야 합니다.

```
$name = $this->anticipate('What is your address?', function ($input) {
    // 자동완성 후보 반환...
});
```

<a name="multiple-choice-questions"></a>
#### 다중 선택(Multiple Choice) 질문

사용자에게 미리 정해진 값 중에서 선택하게 하려면 `choice` 메서드를 사용할 수 있습니다. 선택지가 없으면 반환할 기본값의 배열 인덱스를 세 번째 인자로 넘길 수 있습니다.

```
$name = $this->choice(
    'What is your name?',
    ['Taylor', 'Dayle'],
    $defaultIndex
);
```

또한 네 번째, 다섯 번째 인자로 응답 유효성 검사 시도 횟수 및 다중 선택 허용 여부도 지정할 수 있습니다.

```
$name = $this->choice(
    'What is your name?',
    ['Taylor', 'Dayle'],
    $defaultIndex,
    $maxAttempts = null,
    $allowMultipleSelections = false
);
```

<a name="writing-output"></a>
### 출력 작성하기

콘솔로 출력 메시지를 보낼 때는 `line`, `info`, `comment`, `question`, `warn`, `error` 등의 메서드를 사용할 수 있습니다. 이 메서드들은 각각 목적에 맞는 ANSI 컬러가 적용됩니다. 예를 들어, 사용자에게 일반 정보를 표시할 때는 `info` 메서드를 쓰면 콘솔에 녹색 텍스트로 출력됩니다.

```
/**
 * Execute the console command.
 *
 * @return mixed
 */
public function handle()
{
    // ...

    $this->info('The command was successful!');
}
```

에러 메시지는 `error` 메서드를 사용하면 됩니다. 에러 메시지는 보통 빨간색으로 표시됩니다.

```
$this->error('Something went wrong!');
```

색이 없는 평범한 텍스트를 출력하려면 `line` 메서드를 사용할 수 있습니다.

```
$this->line('Display this on the screen');
```

빈 줄을 출력하려면 `newLine` 메서드를 사용하면 됩니다.

```
// 한 줄 출력...
$this->newLine();

// 세 줄 출력...
$this->newLine(3);
```

<a name="tables"></a>
#### 테이블(Table) 출력

`table` 메서드를 사용하면 여러 행/열로 구성된 데이터를 보기 좋게 자동으로 정렬해서 출력할 수 있습니다. 컬럼 이름과 테이블 데이터를 넘기기만 하면, 라라벨이 알맞은 크기로 테이블을 그려줍니다.

```
use App\Models\User;

$this->table(
    ['Name', 'Email'],
    User::all(['name', 'email'])->toArray()
);
```

<a name="progress-bars"></a>
#### 진행바(Progress Bar)

실행 시간이 오래 걸리는 작업에는, 사용자가 진행 상태를 시각적으로 알 수 있도록 진행바를 표시할 수 있습니다. `withProgressBar` 메서드를 사용하면, 반복 처리되는 이터러블 입력값 수만큼 진행바를 표시할 수 있습니다.

```
use App\Models\User;

$users = $this->withProgressBar(User::all(), function ($user) {
    $this->performTask($user);
});
```

진행바의 이동을 수동으로 제어하려면, 총 스텝 수를 미리 지정하고 각 아이템 처리 뒤 명시적으로 진행바를 이동시킬 수 있습니다.

```
$users = App\Models\User::all();

$bar = $this->output->createProgressBar(count($users));

$bar->start();

foreach ($users as $user) {
    $this->performTask($user);

    $bar->advance();
}

$bar->finish();
```

> [!NOTE]
> 더 다양한 옵션이 궁금하다면 [Symfony Progress Bar 컴포넌트 문서](https://symfony.com/doc/current/components/console/helpers/progressbar.html)를 참고하세요.

<a name="registering-commands"></a>
## 명령어 등록하기

모든 콘솔 명령어는 애플리케이션의 "콘솔 커널"인 `App\Console\Kernel` 클래스 안에서 등록됩니다. 이 클래스의 `commands` 메서드에서는 `load` 메서드를 호출하고 있습니다. `load` 메서드는 `app/Console/Commands` 디렉터리를 스캔하여 그 안의 모든 명령어를 Artisan에 자동 등록합니다. 필요하다면 `load` 메서드를 추가로 호출해 다른 디렉터리의 명령어도 Artisan에 등록할 수 있습니다.

```
/**
 * Register the commands for the application.
 *
 * @return void
 */
protected function commands()
{
    $this->load(__DIR__.'/Commands');
    $this->load(__DIR__.'/../Domain/Orders/Commands');

    // ...
}
```

필요에 따라 직접 명령어를 수동 등록하려면, `App\Console\Kernel` 클래스의 `$commands` 프로퍼티에 명령어 클래스 이름을 추가하면 됩니다. 해당 프로퍼티가 정의되어 있지 않다면 직접 추가해주십시오. Artisan이 부팅되면 이 배열에 명시된 명령어들이 [서비스 컨테이너](/docs/9.x/container)를 통해 자동으로 해석(resolved)되어 Artisan에 등록됩니다.

```
protected $commands = [
    Commands\SendEmails::class
];
```

<a name="programmatically-executing-commands"></a>
## 프로그램적으로 명령어 실행하기

CLI 환경이 아닌 곳에서도 Artisan 명령어를 실행하고 싶을 때가 있습니다. 예를 들어, 라우트나 컨트롤러에서 Artisan 명령어를 호출하고 싶을 때는 `Artisan` 파사드의 `call` 메서드를 사용하면 됩니다. `call` 메서드는 첫 번째 인자로 "명령어 시그니처 이름" 또는 "클래스명", 두 번째 인자로 명령어 파라미터 배열을 받으며, 종료 코드를 반환합니다.

```
use Illuminate\Support\Facades\Artisan;

Route::post('/user/{user}/mail', function ($user) {
    $exitCode = Artisan::call('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    //
});
```

명령 전체를 문자열로 만들어 `call` 메서드에 그대로 넘길 수도 있습니다.

```
Artisan::call('mail:send 1 --queue=default');
```

<a name="passing-array-values"></a>
#### 배열 값 전달

명령어에서 배열 입력값을 받도록 옵션을 설정했다면, 해당 옵션에 값의 배열을 그대로 넘기면 됩니다.

```
use Illuminate\Support\Facades\Artisan;

Route::post('/mail', function () {
    $exitCode = Artisan::call('mail:send', [
        '--id' => [5, 13]
    ]);
});
```

<a name="passing-boolean-values"></a>
#### 불리언 값 전달

문자열 값이 아닌 불리언 플래그(예: `--force`)와 같은 옵션에 값을 주고 싶다면, 옵션의 값으로 `true` 또는 `false`를 넘기면 됩니다.

```
$exitCode = Artisan::call('migrate:refresh', [
    '--force' => true,
]);
```

<a name="queueing-artisan-commands"></a>
#### Artisan 명령어 큐잉

`Artisan` 파사드의 `queue` 메서드를 사용하면, Artisan 명령어도 큐잉하여 백그라운드에서 [큐 워커](/docs/9.x/queues)가 처리할 수 있게 만들 수 있습니다. 이 기능을 사용하기 전에 큐 설정을 완료하고 큐 리스너도 실행 중이어야 합니다.

```
use Illuminate\Support\Facades\Artisan;

Route::post('/user/{user}/mail', function ($user) {
    Artisan::queue('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    //
});
```

`onConnection`과 `onQueue` 메서드를 이용하면, Artisan 명령어가 특정 커넥션이나 큐로 디스패치되도록 지정할 수 있습니다.

```
Artisan::queue('mail:send', [
    'user' => 1, '--queue' => 'default'
])->onConnection('redis')->onQueue('commands');
```

<a name="calling-commands-from-other-commands"></a>
### 다른 명령어에서 명령어 호출하기

기존 Artisan 명령어에서 다른 명령어를 호출하고 싶을 때는 `call` 메서드를 사용할 수 있습니다. 이 메서드는 명령어 이름과 인수/옵션 배열을 받습니다.

```
/**
 * Execute the console command.
 *
 * @return mixed
 */
public function handle()
{
    $this->call('mail:send', [
        'user' => 1, '--queue' => 'default'
    ]);

    //
}
```

다른 콘솔 명령어를 호출하면서, 그 명령어의 출력을 모두 숨기고 싶다면 `callSilently` 메서드를 사용하세요. 이 메서드의 사용법은 `call`과 동일합니다.

```
$this->callSilently('mail:send', [
    'user' => 1, '--queue' => 'default'
]);
```

<a name="signal-handling"></a>
## 신호 처리

운영체제(OS)는 실행중인 프로세스에 신호(signal)를 보낼 수 있습니다. 예를 들어 `SIGTERM` 신호를 보내 프로세스가 종료되도록 할 수 있습니다. Artisan 콘솔 명령어에서 이런 신호를 감지하여 특정 코드가 실행되게 하려면 `trap` 메서드를 이용하면 됩니다.

```
/**
 * Execute the console command.
 *
 * @return mixed
 */
public function handle()
{
    $this->trap(SIGTERM, fn () => $this->shouldKeepRunning = false);

    while ($this->shouldKeepRunning) {
        // ...
    }
}
```

한 번에 여러 신호를 감지하고 싶다면, 신호 배열을 `trap` 메서드에 넘길 수 있습니다.

```
$this->trap([SIGTERM, SIGQUIT], function ($signal) {
    $this->shouldKeepRunning = false;

    dump($signal); // SIGTERM / SIGQUIT
});
```

<a name="stub-customization"></a>
## 스텁(stub) 커스터마이징

Artisan 콘솔의 `make` 계열 명령어는 컨트롤러, 잡, 마이그레이션, 테스트 등 다양한 클래스를 생성합니다. 이 클래스들은 "스텁(stub)" 파일을 기반으로, 입력값에 따라 일부 값이 자동으로 치환되어 생성됩니다. 만약 Artisan이 생성하는 파일의 형태를 약간 수정하고 싶다면, `stub:publish` 명령어로 가장 많이 쓰이는 스텁 파일들을 애플리케이션에 퍼블리시하여 직접 원하는 대로 수정할 수 있습니다.

```shell
php artisan stub:publish
```

퍼블리시된 스텁 파일은 애플리케이션의 루트 `stubs` 디렉터리에 위치합니다. 이 파일들을 변경하면 해당 클래스 유형을 Artisan의 `make` 명령어로 생성할 때 변경점이 반영됩니다.

<a name="events"></a>
## 이벤트

Artisan 명령어를 실행할 때 세 가지 이벤트가 발생합니다. `Illuminate\Console\Events\ArtisanStarting`, `Illuminate\Console\Events\CommandStarting`, `Illuminate\Console\Events\CommandFinished`입니다. `ArtisanStarting` 이벤트는 Artisan 실행이 시작될 때 즉시 발생하고, `CommandStarting` 이벤트는 각 명령어가 실행되기 직전에, `CommandFinished` 이벤트는 명령어 실행이 완료된 뒤에 발생합니다.
