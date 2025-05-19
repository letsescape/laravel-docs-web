# 아티즌 콘솔 (Artisan Console)

- [소개](#introduction)
    - [Tinker (REPL)](#tinker)
- [명령어 작성](#writing-commands)
    - [명령어 생성](#generating-commands)
    - [명령어 구조](#command-structure)
    - [클로저 기반 명령어](#closure-commands)
- [입력 기대값 정의](#defining-input-expectations)
    - [인수(Arguments)](#arguments)
    - [옵션(Options)](#options)
    - [입력 배열](#input-arrays)
    - [입력 설명](#input-descriptions)
- [명령어 I/O](#command-io)
    - [입력값 가져오기](#retrieving-input)
    - [입력 요청하기](#prompting-for-input)
    - [출력 작성하기](#writing-output)
- [명령어 등록](#registering-commands)
- [코드로 명령어 실행하기](#programmatically-executing-commands)
    - [다른 명령어에서 명령어 호출](#calling-commands-from-other-commands)
- [시그널 처리](#signal-handling)
- [스텁(stub) 커스터마이즈](#stub-customization)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

아티즌(Artisan)은 라라벨에 기본 포함된 명령줄 인터페이스입니다. 아티즌은 애플리케이션 루트에 `artisan` 스크립트로 존재하며, 애플리케이션을 개발할 때 도움이 되는 여러 유용한 명령어를 제공합니다. 사용 가능한 모든 아티즌 명령어 목록을 확인하려면 `list` 명령어를 실행하십시오.

```
php artisan list
```

각 명령어는 해당 명령어에서 사용할 수 있는 인수와 옵션을 표시하고 설명하는 "도움말(help)" 화면도 제공합니다. 도움말 화면을 확인하려면 명령어 이름 앞에 `help`를 붙여 실행하면 됩니다.

```
php artisan help migrate
```

<a name="laravel-sail"></a>
#### Laravel Sail

[Laravel Sail](/docs/8.x/sail)을 로컬 개발 환경으로 사용 중이라면, 아티즌 명령어를 실행할 때 `sail` 커맨드라인을 사용해야 합니다. Sail은 아티즌 명령어를 애플리케이션의 Docker 컨테이너 내부에서 실행합니다.

```
./sail artisan list
```

<a name="tinker"></a>
### Tinker (REPL)

Laravel Tinker는 라라벨 프레임워크를 위한 강력한 REPL(Read-Eval-Print Loop) 도구로, [PsySH](https://github.com/bobthecow/psysh) 패키지를 기반으로 동작합니다.

<a name="installation"></a>
#### 설치

모든 라라벨 애플리케이션에는 기본적으로 Tinker가 포함되어 있습니다. 만약 이전에 Tinker를 제거했다면, Composer를 통해 다시 설치할 수 있습니다.

```
composer require laravel/tinker
```

> [!TIP]
> 라라벨 애플리케이션과 상호작용할 수 있는 그래픽 UI가 필요하다면 [Tinkerwell](https://tinkerwell.app)을 확인해 보세요!

<a name="usage"></a>
#### 사용 방법

Tinker를 사용하면 Eloquent 모델, 작업(Job), 이벤트 등 애플리케이션 전체를 명령줄에서 직접 다룰 수 있습니다. Tinker 환경에 진입하려면 `tinker` 아티즌 명령어를 실행하세요.

```
php artisan tinker
```

Tinker의 설정 파일을 배포하려면 `vendor:publish` 명령어를 사용할 수 있습니다.

```
php artisan vendor:publish --provider="Laravel\Tinker\TinkerServiceProvider"
```

> [!NOTE]
> `dispatch` 헬퍼 함수와 `Dispatchable` 클래스의 `dispatch` 메서드는 작업을 큐(Queue)에 넣기 위해 가비지 컬렉션에 의존합니다. 따라서 tinker에서는 작업을 디스패치(dispatch)할 때 `Bus::dispatch` 또는 `Queue::push`를 사용하는 것이 좋습니다.

<a name="command-allow-list"></a>
#### 명령어 허용 목록

Tinker는 내부적으로 "허용(allow) 목록"을 사용하여 어떤 아티즌 명령어를 Tinker 셸에서 실행할 수 있는지 결정합니다. 기본적으로 `clear-compiled`, `down`, `env`, `inspire`, `migrate`, `optimize`, `up` 명령어만 실행할 수 있습니다. 추가로 허용하고 싶은 명령어가 있다면 `tinker.php` 설정 파일의 `commands` 배열에 추가하면 됩니다.

```
'commands' => [
    // App\Console\Commands\ExampleCommand::class,
],
```

<a name="classes-that-should-not-be-aliased"></a>
#### 자동 별칭이 생성되지 않아야 할 클래스

보통 Tinker에서는 셸에서 상호작용할 때 클래스가 자동으로 별칭(alias) 처리됩니다. 하지만 일부 클래스는 자동으로 별칭이 지정되지 않게 할 수 있습니다. 이를 위해 `tinker.php` 설정 파일의 `dont_alias` 배열에 해당 클래스를 추가하면 됩니다.

```
'dont_alias' => [
    App\Models\User::class,
],
```

<a name="writing-commands"></a>
## 명령어 작성

기본 제공되는 아티즌 명령어 외에도, 직접 새로운 커스텀 명령어를 만들 수 있습니다. 명령어 클래스는 일반적으로 `app/Console/Commands` 디렉터리에 저장되지만, Composer가 불러올 수 있는 위치라면 원하는 디렉터리를 자유롭게 사용할 수 있습니다.

<a name="generating-commands"></a>
### 명령어 생성

새 명령어를 만들려면 `make:command` 아티즌 명령어를 사용하면 됩니다. 이 명령어는 `app/Console/Commands` 디렉터리에 새로운 커맨드 클래스를 생성합니다. 해당 디렉터리가 아직 없다면, 처음 실행 시 자동으로 생성됩니다.

```
php artisan make:command SendEmails
```

<a name="command-structure"></a>
### 명령어 구조

명령어를 생성한 후에는 클래스의 `signature`와 `description` 속성에 적절한 값을 지정해야 합니다. 이 속성들은 `list` 화면에 명령어를 표시할 때 사용됩니다. 또한, `signature` 속성에서는 [명령어 입력값 기대치](#defining-input-expectations)도 정의할 수 있습니다. 명령어가 실제로 실행될 때는 `handle` 메서드가 호출되며, 여기에 명령어의 주요 로직을 작성하면 됩니다.

예시 명령어를 살펴보겠습니다. 아래 예시에서는 필요한 의존성을 `handle` 메서드에서 타입힌트로 직접 주입받고 있습니다. 라라벨 [서비스 컨테이너](/docs/8.x/container)는 메서드에 타입힌트된 모든 의존성을 자동으로 주입해줍니다.

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
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

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

> [!TIP]
> 코드 재사용성을 높이기 위해, 콘솔 명령어 내부에서는 가능한 한 로직을 최소화하고, 실제 처리 작업은 애플리케이션 서비스 클래스로 위임하는 것이 좋은 습관입니다. 위 예시처럼 서비스 클래스를 주입하여 이메일 전송과 같은 "핵심 작업"을 담당하도록 하는 방식을 추천합니다.

<a name="closure-commands"></a>
### 클로저 기반 명령어

클로저(Closure) 기반 명령어는 클래스 형태로 명령어를 작성하는 대신 클로저로 정의하는 또 다른 방법을 제공합니다. 라우트에서 클로저를 사용할 수 있듯, 명령어도 클로저로 정의할 수 있습니다. `app/Console/Kernel.php` 파일의 `commands` 메서드 안에서, 라라벨은 `routes/console.php` 파일을 로드합니다.

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

이 파일에서는 HTTP 라우트를 정의하지는 않지만, 애플리케이션의 콘솔 진입점(일종의 라우트)을 정의하게 됩니다. 이 파일 내에서 `Artisan::command` 메서드를 사용해 클로저 기반의 콘솔 명령어를 만들 수 있습니다. `command` 메서드는 [명령어 시그니처](#defining-input-expectations)와, 명령어의 인수와 옵션을 전달받는 클로저를 인자로 받습니다.

```
Artisan::command('mail:send {user}', function ($user) {
    $this->info("Sending email to: {$user}!");
});
```

클로저는 기반이 되는 명령어 인스턴스에 바인딩되기 때문에, 일반 커맨드 클래스에서 사용 가능한 헬퍼 메서드를 모두 사용할 수 있습니다.

<a name="type-hinting-dependencies"></a>
#### 의존성 타입힌트

명령어의 인수나 옵션뿐 아니라, 클로저에서 서비스 컨테이너를 통해 추가 의존성을 타입힌트로 받아올 수도 있습니다.

```
use App\Models\User;
use App\Support\DripEmailer;

Artisan::command('mail:send {user}', function (DripEmailer $drip, $user) {
    $drip->send(User::find($user));
});
```

<a name="closure-command-descriptions"></a>
#### 클로저 명령어 설명 추가

클로저 기반 명령어를 정의할 때, `purpose` 메서드를 사용해 명령어에 대한 설명을 추가할 수 있습니다. 이 설명은 `php artisan list`나 `php artisan help` 명령어 실행 시 출력됩니다.

```
Artisan::command('mail:send {user}', function ($user) {
    // ...
})->purpose('Send a marketing email to a user');
```

<a name="defining-input-expectations"></a>
## 입력 기대값 정의

콘솔 명령어를 작성할 때, 사용자로부터 인수(argument)나 옵션(option) 형태로 입력값을 전달받는 일이 흔합니다. 라라벨에서는 명령어의 `signature` 속성을 사용해 입력값의 종류를 간편하게 지정할 수 있습니다. `signature` 속성 하나만으로 명령어 이름, 인수, 옵션을 직관적이고 읽기 쉬운 형태로 정의할 수 있습니다.

<a name="arguments"></a>
### 인수(Arguments)

사용자가 입력하는 모든 인수와 옵션은 중괄호로 감쌉니다. 아래 예시에서 명령어는 필수 인수 `user`를 정의하고 있습니다.

```
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user}';
```

인수를 선택적으로 만들거나 기본값을 지정할 수도 있습니다.

```
// 선택적 인수...
mail:send {user?}

// 기본값이 있는 선택적 인수...
mail:send {user=foo}
```

<a name="options"></a>
### 옵션(Options)

옵션도 인수와 마찬가지로 사용자 입력을 전달받는 방법 중 하나입니다. 옵션은 커맨드라인에서 두 개의 하이픈(`--`)을 붙여 전달합니다. 옵션에는 값을 필요로 하지 않는 스위치형 옵션과, 값을 전달받는 옵션 두 가지가 있습니다. 먼저 값이 없는(스위치) 옵션 예시를 확인해보세요.

```
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue}';
```

위 예시에서 `--queue` 옵션은 아티즌 명령어 실행 시 함께 지정할 수 있습니다. 만약 `--queue`가 전달되면 옵션의 값은 `true`가 되고, 전달하지 않으면 `false`가 됩니다.

```
php artisan mail:send 1 --queue
```

<a name="options-with-values"></a>
#### 값이 필요한 옵션

다음으로, 값을 받아야 하는 옵션 예시를 살펴보겠습니다. 옵션 값이 꼭 필요하다면 옵션 이름 뒤에 `=` 기호를 붙여서 정의합니다.

```
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue=}';
```

이렇게 정의하면, 사용자는 아래와 같이 옵션에 값을 넘길 수 있습니다. 옵션을 생략하면 값은 `null`이 됩니다.

```
php artisan mail:send 1 --queue=default
```

기본값이 있는 옵션을 정의하고 싶다면 옵션명 뒤에 기본값을 할당해줍니다. 사용자가 옵션 값을 주지 않으면 이 기본값이 사용됩니다.

```
mail:send {user} {--queue=default}
```

<a name="option-shortcuts"></a>
#### 옵션 단축키

옵션에 단축키(짧은 이름)를 지정하고 싶다면, 단축키를 먼저 쓰고 `|` 기호로 구분한 뒤 전체 이름을 작성합니다.

```
mail:send {user} {--Q|queue}
```

터미널에서 명령어를 실행할 때는 단축 옵션은 한 개의 하이픈과 함께 사용합니다.

```
php artisan mail:send 1 -Q
```

<a name="input-arrays"></a>
### 입력 배열

인수나 옵션으로 여러 값을 입력받고 싶다면, 별표(`*`) 문자를 사용할 수 있습니다. 먼저, 다중 값을 받는 인수 예시를 살펴보세요.

```
mail:send {user*}
```

이 명령어를 실행할 때, `user` 인수에 여러 값을 전달할 수 있습니다. 아래와 같이 입력하면 `user`의 값은 `foo`, `bar`가 들어있는 배열이 됩니다.

```
php artisan mail:send foo bar
```

별표(`*`) 문자는 선택적 인수와도 조합할 수 있어, 0개 이상의 값을 허용할 수 있습니다.

```
mail:send {user?*}
```

<a name="option-arrays"></a>
#### 옵션 배열

여러 값을 받는 옵션을 정의할 때는 각 값 앞에 옵션명을 반복해 적으면 됩니다.

```
mail:send {user} {--id=*}

php artisan mail:send --id=1 --id=2
```

<a name="input-descriptions"></a>
### 입력 설명

인수나 옵션에 설명을 추가하려면, 이름과 설명 사이에 콜론을 사용합니다. 명령어 정의가 길어진다면 여러 줄로 나누어 작성하셔도 됩니다.

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
## 명령어 I/O

<a name="retrieving-input"></a>
### 입력값 가져오기

명령어 실행 도중, 입력받은 인수나 옵션 값을 코드에서 활용할 일도 많습니다. 이때는 `argument`와 `option` 메서드를 사용하면 됩니다. 만약 해당 인수나 옵션이 없으면 `null`이 반환됩니다.

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

모든 인수 값을 배열로 한 번에 가져오려면 `arguments` 메서드를 사용합니다.

```
$arguments = $this->arguments();
```

각 옵션 값 역시 `option` 메서드로 쉽게 얻을 수 있습니다. 모든 옵션 값을 배열로 받고 싶다면 `options` 메서드를 호출하면 됩니다.

```
// 특정 옵션만 가져오기...
$queueName = $this->option('queue');

// 모든 옵션을 배열로 가져오기...
$options = $this->options();
```

<a name="prompting-for-input"></a>
### 입력 요청하기

출력 결과를 보여주는 것뿐 아니라, 명령어 실행 도중 사용자에게 추가 입력을 요청할 수도 있습니다. `ask` 메서드는 질문을 보여주고, 사용자의 입력값을 받아 반환합니다.

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

`secret` 메서드는 `ask`와 비슷하지만, 입력한 내용이 콘솔에 표시되지 않습니다. 비밀번호 등 민감한 정보를 입력받을 때 적합합니다.

```
$password = $this->secret('What is the password?');
```

<a name="asking-for-confirmation"></a>
#### "예/아니오" 확인 받기

사용자에게 간단히 "예/아니오"로 답할 수 있게 하고 싶을 때는 `confirm` 메서드를 사용하세요. 기본적으로 이 메서드는 `false`를 반환하지만, 사용자 입력이 `y` 또는 `yes`라면 `true`를 반환합니다.

```
if ($this->confirm('Do you wish to continue?')) {
    //
}
```

필요하다면, `confirm` 메서드의 두 번째 인자로 `true`를 전달하여 기본값이 `true`가 되도록 할 수 있습니다.

```
if ($this->confirm('Do you wish to continue?', true)) {
    //
}
```

<a name="auto-completion"></a>
#### 자동 완성

`anticipate` 메서드를 이용하면 입력 가능한 선택지를 자동 완성으로 보여줄 수 있습니다. 사용자는 자동완성 힌트를 참고하되, 힌트에 없는 값도 입력할 수 있습니다.

```
$name = $this->anticipate('What is your name?', ['Taylor', 'Dayle']);
```

또는 두 번째 인자로 클로저를 넘겨, 사용자가 입력할 때마다 동적으로 자동완성 옵션을 제공할 수도 있습니다. 이 클로저는 사용자가 입력한 문자열을 인자로 받아, 자동 완성용 배열을 반환해야 합니다.

```
$name = $this->anticipate('What is your address?', function ($input) {
    // 자동완성 옵션 반환...
});
```

<a name="multiple-choice-questions"></a>
#### 다중 선택 질문

미리 정의된 선택지 중에서 사용자가 하나(또는 여러 개)를 고르도록 하려면 `choice` 메서드를 사용하면 됩니다. 세 번째 인수로 기본값의 배열 인덱스를 넘길 수 있으며, 네 번째와 다섯 번째 인수에서는 유효 응답 선택 시도 횟수와 복수 선택 허용 여부를 지정할 수 있습니다.

```
$name = $this->choice(
    'What is your name?',
    ['Taylor', 'Dayle'],
    $defaultIndex
);
```

추가 인수를 넘겨 더 구체적으로 제어할 수도 있습니다.

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

콘솔에 결과를 출력하려면 `line`, `info`, `comment`, `question`, `warn`, `error` 등의 메서드를 사용할 수 있습니다. 각 메서드는 용도에 맞는 ANSI 색상을 사용해서 표시됩니다. 예를 들어, 일반적인 안내 메시지는 `info` 메서드를 사용하며, 보통 초록색으로 출력됩니다.

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

오류 메시지를 출력하려면 `error` 메서드를 사용합니다. 오류 메시지는 레드 컬러로 표시됩니다.

```
$this->error('Something went wrong!');
```

컬러 없이 평범한 텍스트로 출력하고 싶으면 `line` 메서드를 사용하세요.

```
$this->line('Display this on the screen');
```

빈 줄을 삽입하려면 `newLine` 메서드를 사용할 수 있습니다.

```
// 한 줄 띄우기...
$this->newLine();

// 세 줄 띄우기...
$this->newLine(3);
```

<a name="tables"></a>
#### 테이블 출력

`table` 메서드를 사용하면 여러 줄/여러 컬럼의 데이터를 손쉽게 표 형태로 깔끔하게 출력할 수 있습니다. 컬럼 이름과 데이터 배열만 넘기면 라라벨이 적당한 너비와 높이도 자동으로 맞춰줍니다.

```
use App\Models\User;

$this->table(
    ['Name', 'Email'],
    User::all(['name', 'email'])->toArray()
);
```

<a name="progress-bars"></a>
#### 진행률(progress bar)

처리 시간이 오래 걸리는 작업일 때, 사용자에게 완료 진행 상태를 보여주고 싶으면 진행률 표시줄(progress bar)을 사용할 수 있습니다. `withProgressBar` 메서드를 사용하면, 주어진 이터러블 값을 순회하며 진행률이 표시됩니다.

```
use App\Models\User;

$users = $this->withProgressBar(User::all(), function ($user) {
    $this->performTask($user);
});
```

진행률 표시줄을 좀 더 세밀하게 제어하고 싶다면, 전체 단계 수를 먼저 지정하고, 값마다 직접 진행도를 증가시키는 방법도 있습니다.

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

> [!TIP]
> 더 고급 기능이 필요하면 [Symfony Progress Bar 컴포넌트 공식 문서](https://symfony.com/doc/current/components/console/helpers/progressbar.html)를 참고하세요.

<a name="registering-commands"></a>
## 명령어 등록

모든 콘솔 명령어는 애플리케이션의 "콘솔 커널(Kernel)" 클래스인 `App\Console\Kernel`에서 등록됩니다. 이 클래스의 `commands` 메서드에서 커널의 `load` 메서드를 호출하는 것을 볼 수 있습니다. `load` 메서드는 `app/Console/Commands` 디렉터리에 있는 명령어 클래스를 자동으로 찾아서 아티즌에 등록합니다. 필요하다면 다른 디렉터리도 추가로 스캔할 수 있습니다.

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

특정 명령어를 수동으로 등록해야 할 경우, `App\Console\Kernel` 클래스 안에 `$commands` 속성(배열)을 만들어 등록하면 됩니다. 이 속성이 없으면 직접 정의하면 되며, 아티즌이 부팅할 때 이 배열에 있는 모든 명령어가 [서비스 컨테이너](/docs/8.x/container)를 통해 불러와집니다.

```
protected $commands = [
    Commands\SendEmails::class
];
```

<a name="programmatically-executing-commands"></a>
## 코드로 명령어 실행하기

CLI(명령줄)가 아닌 코드에서 아티즌 명령어를 실행하고 싶을 때도 있습니다. 예를 들어, 라우트나 컨트롤러에서 아티즌 명령어를 실행할 수 있습니다. 이때는 `Artisan` 파사드의 `call` 메서드를 사용하면 됩니다. `call` 메서드의 첫 번째 인수로 명령어 시그니처(이름)나 클래스명을 넘기고, 두 번째 인수로 명령어의 파라미터 배열을 전달합니다. 이 때, 명령어 실행 결과는 종료 코드로 반환됩니다.

```
use Illuminate\Support\Facades\Artisan;

Route::post('/user/{user}/mail', function ($user) {
    $exitCode = Artisan::call('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    //
});
```

명령어 전체를 문자열로 통째로 넘겨도 사용할 수 있습니다.

```
Artisan::call('mail:send 1 --queue=default');
```

<a name="passing-array-values"></a>
#### 배열 값 전달하기

옵션이 배열 입력을 허용하는 경우, 값을 배열로 전달하면 됩니다.

```
use Illuminate\Support\Facades\Artisan;

Route::post('/mail', function () {
    $exitCode = Artisan::call('mail:send', [
        '--id' => [5, 13]
    ]);
});
```

<a name="passing-boolean-values"></a>
#### 불리언 옵션 값 전달

문자열이 아니라 불리언 값만 허용하는 옵션(예: `migrate:refresh` 명령어의 `--force` 플래그)을 지정하고 싶을 때는 값으로 `true`나 `false`를 넘기면 됩니다.

```
$exitCode = Artisan::call('migrate:refresh', [
    '--force' => true,
]);
```

<a name="queueing-artisan-commands"></a>
#### 아티즌 명령어 큐에 넣기

`Artisan` 파사드의 `queue` 메서드를 사용하면 아티즌 명령어를 큐(queue)에 넣을 수 있습니다. 이렇게 하면 명령어가 [큐 워커](/docs/8.x/queues)에 의해 백그라운드에서 처리됩니다. 이 메서드를 사용하기 전에 큐 설정이 되어 있고 큐 리스너가 실행 중이어야 합니다.

```
use Illuminate\Support\Facades\Artisan;

Route::post('/user/{user}/mail', function ($user) {
    Artisan::queue('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    //
});
```

추가로, `onConnection` 및 `onQueue` 메서드를 사용하면 명령어가 어느 연결(connection)과 큐(queue)에서 실행될지 직접 지정할 수 있습니다.

```
Artisan::queue('mail:send', [
    'user' => 1, '--queue' => 'default'
])->onConnection('redis')->onQueue('commands');
```

<a name="calling-commands-from-other-commands"></a>
### 다른 명령어에서 명령어 호출

기존 아티즌 명령어 안에서 다른 명령어를 호출하고 싶을 수도 있습니다. 이때는 `call` 메서드를 사용하면 됩니다. 명령어 이름과 인수/옵션 배열을 전달할 수 있습니다.

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

다른 콘솔 명령어를 호출할 때 출력이 모두 숨겨지길 원하면 `callSilently` 메서드를 사용할 수 있습니다. 사용법은 `call` 메서드와 동일합니다.

```
$this->callSilently('mail:send', [
    'user' => 1, '--queue' => 'default'
]);
```

<a name="signal-handling"></a>
## 시그널 처리

아티즌 콘솔의 기반이 되는 Symfony Console 컴포넌트를 사용하면, 명령어가 어떤 프로세스 시그널(Signal)을 처리할 수 있는지도 선언할 수 있습니다. 예를 들어, `SIGINT`나 `SIGTERM` 시그널을 명령어가 직접 처리하도록 지정할 수 있습니다.

시작하려면, Artisan 명령어 클래스에서 `Symfony\Component\Console\Command\SignalableCommandInterface` 인터페이스를 구현해야 합니다. 이 인터페이스를 구현하면 `getSubscribedSignals`와 `handleSignal` 두 가지 메서드를 반드시 정의해야 합니다.

```php
<?php

use Symfony\Component\Console\Command\SignalableCommandInterface;

class StartServer extends Command implements SignalableCommandInterface
{
    // ...

    /**
     * Get the list of signals handled by the command.
     *
     * @return array
     */
    public function getSubscribedSignals(): array
    {
        return [SIGINT, SIGTERM];
    }

    /**
     * Handle an incoming signal.
     *
     * @param  int  $signal
     * @return void
     */
    public function handleSignal(int $signal): void
    {
        if ($signal === SIGINT) {
            $this->stopServer();

            return;
        }
    }
}
```

예상할 수 있듯, `getSubscribedSignals` 메서드는 명령어에서 처리할 수 있는 시그널의 배열을 반환하며, `handleSignal` 메서드는 실제로 시그널이 발생했을 때 필요한 동작을 수행합니다.

<a name="stub-customization"></a>
## 스텁(stub) 커스터마이즈

아티즌 콘솔의 `make` 관련 명령어는 컨트롤러, 작업(Job), 마이그레이션, 테스트 등 다양한 클래스를 생성할 때 사용됩니다. 이러한 클래스들은 "스텁(stub)" 파일을 템플릿 삼아 생성되며, 입력값에 따라 자동으로 일부 내용이 채워집니다. 하지만, 생성되는 파일의 일부를 자신만의 방식으로 수정하고 싶을 때도 있죠. 이럴 때는 `stub:publish` 명령어로 주요 스텁 파일을 애플리케이션에 복사해 원하는 대로 커스터마이즈할 수 있습니다.

```
php artisan stub:publish
```

배포된 스텁 파일들은 애플리케이션 루트의 `stubs` 디렉터리에 생깁니다. 이 파일을 직접 수정하면, 이후 아티즌의 `make` 관련 명령어로 생성되는 클래스에 반영됩니다.

<a name="events"></a>
## 이벤트

아티즌이 명령어를 실행할 때, 세 가지 이벤트가 발생합니다: `Illuminate\Console\Events\ArtisanStarting`, `Illuminate\Console\Events\CommandStarting`, `Illuminate\Console\Events\CommandFinished`. `ArtisanStarting` 이벤트는 아티즌 실행이 시작되자마자 발생합니다. 이어서, 각 명령어가 실행되기 직전에 `CommandStarting` 이벤트가, 명령어 실행이 끝나면 `CommandFinished` 이벤트가 트리거됩니다.
