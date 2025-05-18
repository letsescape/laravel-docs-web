# 아티즌 콘솔 (Artisan Console)

- [소개](#introduction)
    - [Tinker (REPL)](#tinker)
- [명령어 작성](#writing-commands)
    - [명령어 생성](#generating-commands)
    - [명령어 구조](#command-structure)
    - [클로저(Closure) 명령어](#closure-commands)
    - [Isolatable 명령어](#isolatable-commands)
- [입력 기대값 정의](#defining-input-expectations)
    - [인수(Arguments)](#arguments)
    - [옵션(Options)](#options)
    - [입력 배열](#input-arrays)
    - [입력 설명](#input-descriptions)
    - [누락된 입력 요청](#prompting-for-missing-input)
- [명령어 I/O](#command-io)
    - [입력값 가져오기](#retrieving-input)
    - [입력 요청](#prompting-for-input)
    - [출력 작성](#writing-output)
- [명령어 등록](#registering-commands)
- [명령어 코드 실행](#programmatically-executing-commands)
    - [다른 명령어에서 명령어 호출](#calling-commands-from-other-commands)
- [시그널 처리](#signal-handling)
- [스텁 커스터마이징](#stub-customization)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

아티즌(Artisan)은 라라벨에 기본 포함된 명령줄 인터페이스입니다. 아티즌은 애플리케이션의 루트 디렉터리에 `artisan` 스크립트 파일로 존재하며, 애플리케이션을 개발할 때 유용하게 활용할 수 있는 여러 가지 명령어를 제공합니다. 사용 가능한 모든 아티즌 명령어 목록을 확인하려면 `list` 명령어를 사용할 수 있습니다.

```shell
php artisan list
```

각 명령어에는 해당 명령어에서 사용할 수 있는 인수와 옵션을 보여주고 설명하는 "도움말" 화면이 포함되어 있습니다. 명령어의 도움말을 확인하려면, 명령어 이름 앞에 `help`를 붙여 실행하면 됩니다.

```shell
php artisan help migrate
```

<a name="laravel-sail"></a>
#### 라라벨 Sail

로컬 개발 환경으로 [라라벨 Sail](/docs/11.x/sail)을 사용하고 있다면, 아티즌 명령어를 실행할 때 `sail` 커맨드 라인을 이용해야 한다는 점을 기억하세요. Sail을 통해 실행하는 경우, 명령어는 애플리케이션의 Docker 컨테이너 내에서 동작합니다.

```shell
./vendor/bin/sail artisan list
```

<a name="tinker"></a>
### Tinker (REPL)

라라벨 Tinker는 라라벨 프레임워크에서 사용할 수 있는 강력한 REPL 환경으로, [PsySH](https://github.com/bobthecow/psysh) 패키지를 기반으로 동작합니다.

<a name="installation"></a>
#### 설치

모든 라라벨 애플리케이션에는 기본적으로 Tinker가 포함되어 있습니다. 만약 Tinker를 제거했다면, Composer를 이용해 다시 설치할 수 있습니다.

```shell
composer require laravel/tinker
```

> [!NOTE]  
> 라라벨 애플리케이션을 조작할 때 핫 리로딩, 여러 줄 코드 편집, 자동 완성 기능이 필요하다면 [Tinkerwell](https://tinkerwell.app)도 참고해 보세요!

<a name="usage"></a>
#### 사용법

Tinker를 이용하면 Eloquent 모델, 잡(jobs), 이벤트 등 라라벨 애플리케이션 전체를 명령줄에서 직접 조작할 수 있습니다. Tinker 환경에 진입하려면 `tinker` 아티즌 명령어를 실행하세요.

```shell
php artisan tinker
```

`vendor:publish` 명령어를 이용해 Tinker의 설정 파일을 공개(publish)할 수도 있습니다.

```shell
php artisan vendor:publish --provider="Laravel\Tinker\TinkerServiceProvider"
```

> [!WARNING]  
> `dispatch` 헬퍼 함수와 `Dispatchable` 클래스의 `dispatch` 메서드는 잡을 큐에 넣기 위해 가비지 컬렉션에 의존합니다. 따라서 Tinker를 사용할 때는 잡을 큐에 추가할 때 `Bus::dispatch` 또는 `Queue::push`를 사용해야 합니다.

<a name="command-allow-list"></a>
#### 명령어 허용 목록

Tinker는 쉘 안에서 어떤 아티즌 명령어를 실행할 수 있는지를 "허용 리스트"로 제한합니다. 기본적으로 `clear-compiled`, `down`, `env`, `inspire`, `migrate`, `migrate:install`, `up`, `optimize` 명령어를 실행할 수 있습니다. 만약 더 많은 명령어를 허용하고 싶다면, `tinker.php` 설정 파일의 `commands` 배열에 추가할 수 있습니다.

```
'commands' => [
    // App\Console\Commands\ExampleCommand::class,
],
```

<a name="classes-that-should-not-be-aliased"></a>
#### 별칭(Alias)하지 않을 클래스

Tinker는 일반적으로 Tinker에서 사용되는 클래스에 자동으로 별칭을 지정합니다. 하지만 일부 클래스는 별칭으로 등록하고 싶지 않을 수 있습니다. 이럴 때는 `tinker.php` 설정 파일의 `dont_alias` 배열에 해당 클래스명을 추가하면 됩니다.

```
'dont_alias' => [
    App\Models\User::class,
],
```

<a name="writing-commands"></a>
## 명령어 작성

아티즌에 기본으로 내장된 명령어 외에도, 직접 커스텀 명령어를 만들어 사용할 수 있습니다. 명령어는 보통 `app/Console/Commands` 디렉터리에 저장하지만, Composer로 로딩할 수 있는 위치라면 어디든 자유롭게 저장할 수 있습니다.

<a name="generating-commands"></a>
### 명령어 생성

새로운 명령어를 만들려면 `make:command` 아티즌 명령어를 사용할 수 있습니다. 이 명령어를 실행하면 `app/Console/Commands` 디렉터리에 새 명령어 클래스가 생성됩니다. 해당 디렉터리가 없는 경우에도, `make:command` 명령어를 처음 실행할 때 자동 생성됩니다.

```shell
php artisan make:command SendEmails
```

<a name="command-structure"></a>
### 명령어 구조

명령어를 생성한 다음에는 클래스의 `signature`와 `description` 속성(property)에 적절한 값을 지정해야 합니다. 이 속성들은 `list` 화면에서 명령어를 표시할 때 활용됩니다. 특히 `signature` 속성은 [명령어 입력 기대값](#defining-input-expectations)도 함께 정의합니다. 명령어가 실행되면 `handle` 메서드가 호출되며, 이 메서드 안에 해당 명령어의 동작 로직을 작성하면 됩니다.

예시 명령어를 함께 살펴보겠습니다. 아래 예제에서는 명령어의 `handle` 메서드를 통해 필요한 의존성을 주입받을 수 있습니다. 라라벨의 [서비스 컨테이너](/docs/11.x/container)가 이 메서드의 시그니처에 타입힌트된 모든 의존성을 자동으로 주입해줍니다.

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
     */
    public function handle(DripEmailer $drip): void
    {
        $drip->send(User::find($this->argument('user')));
    }
}
```

> [!NOTE]  
> 코드의 재사용성을 높이려면, 콘솔 명령어 자체는 되도록 단순하게 유지하고, 실제 작업은 애플리케이션 서비스에 위임하는 것이 좋은 습관입니다. 위 예제에서도 이메일 전송의 실제 처리는 서비스 클래스에 맡기고 있습니다.

<a name="exit-codes"></a>
#### 종료 코드(Exit Codes)

`handle` 메서드에서 아무 값도 반환하지 않고 정상적으로 명령어를 실행하면, 종료 코드 `0`으로 성공을 나타냅니다. 하지만 필요하다면 정수형 값을 반환하여 명령어의 종료 코드를 수동으로 지정할 수도 있습니다.

```
$this->error('Something went wrong.');

return 1;
```

명령어 클래스 내부의 어느 메서드에서든 명령어를 "실패" 상태로 종료하고 싶다면 `fail` 메서드를 사용할 수 있습니다. `fail` 메서드를 실행하면 즉시 명령어 동작을 중단하고, 종료 코드 1을 반환합니다.

```
$this->fail('Something went wrong.');
```

<a name="closure-commands"></a>
### 클로저(Closure) 명령어

클로저 기반 명령어는 클래스로 명령어를 정의하는 대신, 클로저로 콘솔 명령어를 정의할 수 있는 대안을 제공합니다. 마치 라우트의 컨트롤러 대신 라우트 클로저를 사용하는 것처럼, 콘솔 명령어를 클래스 대신 클로저로도 만들 수 있습니다.

`routes/console.php` 파일에서는 HTTP 라우트를 정의하지 않지만, 애플리케이션 진입점 역할을 하는 콘솔 기반 라우트(엔트리)를 정의합니다. 이 파일에서는 `Artisan::command` 메서드를 통해 클로저 기반 콘솔 명령어를 모두 정의할 수 있습니다. `command` 메서드는 두 개의 인자(아규먼트)를 받으며, 첫 번째는 [명령어 signature](#defining-input-expectations), 두 번째는 명령어 인수와 옵션을 받는 클로저입니다.

```
Artisan::command('mail:send {user}', function (string $user) {
    $this->info("Sending email to: {$user}!");
});
```

클로저는 내부적으로 해당 명령어 인스턴스에 바인딩되어, 클래스 기반 명령어에서 접근할 수 있던 헬퍼 메서드를 그대로 사용할 수 있습니다.

<a name="type-hinting-dependencies"></a>
#### 의존성 타입힌트(Dependency Type-Hinting)

명령어 인수와 옵션뿐만 아니라, 클로저로 만든 명령어에서도 추가로 필요한 의존성을 [서비스 컨테이너](/docs/11.x/container)로부터 타입힌트로 받아올 수 있습니다.

```
use App\Models\User;
use App\Support\DripEmailer;

Artisan::command('mail:send {user}', function (DripEmailer $drip, string $user) {
    $drip->send(User::find($user));
});
```

<a name="closure-command-descriptions"></a>
#### 클로저 명령어 설명

클로저 기반 명령어를 정의할 때, `purpose` 메서드를 사용하면 해당 명령어에 대한 설명을 추가할 수 있습니다. 이 설명은 `php artisan list`나 `php artisan help` 명령어를 실행할 때 표시됩니다.

```
Artisan::command('mail:send {user}', function (string $user) {
    // ...
})->purpose('Send a marketing email to a user');
```

<a name="isolatable-commands"></a>
### Isolatable 명령어

> [!WARNING]  
> 이 기능을 사용하려면, 애플리케이션의 기본 캐시 드라이버로 `memcached`, `redis`, `dynamodb`, `database`, `file`, 또는 `array` 드라이버 중 하나를 선택해야 합니다. 또한 모든 서버가 동일한 중앙 캐시 서버와 통신해야 합니다.

동일한 명령어가 한 번에 단 하나만 실행되도록 제한하고 싶을 때가 있습니다. 이럴 때는 명령어 클래스에 `Illuminate\Contracts\Console\Isolatable` 인터페이스를 구현하면 됩니다.

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

명령어에 `Isolatable`이 표시되어 있으면, 라라벨은 해당 명령어에 자동으로 `--isolated` 옵션을 추가합니다. 이 옵션과 함께 명령어를 실행하면, 동일한 명령어가 이미 실행 중인 경우 중복으로 실행되지 않도록 라라벨이 관리합니다. 라라벨은 기본 캐시 드라이버를 사용해 원자적 락(atomic lock)을 시도하여 이를 구현합니다. 만약 이미 실행 중인 명령어가 있으면, 실제 명령어 동작은 실행되지 않지만, 종료 상태 코드는 성공으로 반환됩니다.

```shell
php artisan mail:send 1 --isolated
```

명령어가 실행되지 않았을 때 반환할 종료 상태 코드를 직접 지정하려면, `isolated` 옵션에 원하는 코드를 입력할 수 있습니다.

```shell
php artisan mail:send 1 --isolated=12
```

<a name="lock-id"></a>
#### Lock ID

기본적으로 라라벨은 원자적 락의 문자열 키를 생성할 때 명령어 이름을 사용합니다. 하지만, `isolatableId` 메서드를 아티즌 명령어 클래스에 정의하면, 필요한 경우 명령어 인수나 옵션을 락 키에 추가하는 등 값을 직접 커스터마이즈할 수 있습니다.

```php
/**
 * Get the isolatable ID for the command.
 */
public function isolatableId(): string
{
    return $this->argument('user');
}
```

<a name="lock-expiration-time"></a>
#### 락 만료 시간

기본적으로, 격리 락(isolation lock)은 명령어 실행이 끝나면 바로 만료됩니다. 명령어 실행이 중단되어 끝나지 못했다면, 락은 한 시간 후 자동으로 만료됩니다. 만약 이 만료 시간을 직접 조정하고 싶으면, 명령어 클래스에 `isolationLockExpiresAt` 메서드를 정의할 수 있습니다.

```php
use DateTimeInterface;
use DateInterval;

/**
 * Determine when an isolation lock expires for the command.
 */
public function isolationLockExpiresAt(): DateTimeInterface|DateInterval
{
    return now()->addMinutes(5);
}
```

<a name="defining-input-expectations"></a>
## 입력 기대값 정의

콘솔 명령어를 작성할 때, 사용자로부터 인수 또는 옵션 등의 입력값을 받는 일이 많습니다. 라라벨에서는 명령어의 `signature` 속성을 사용해 입력 기대값을 매우 직관적이고 선언적으로 정의할 수 있습니다. `signature` 속성에서 명령어의 이름, 인수, 옵션을 하나의 명령어 시그니처(라우트처럼 표현)로 정의합니다.

<a name="arguments"></a>
### 인수(Arguments)

사용자로부터 입력받는 모든 인수와 옵션은 중괄호로 감쌉니다. 아래 예제에서 명령어는 `user`라는 이름의 필수 인수를 정의합니다.

```
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user}';
```

인수를 선택적으로 만들거나, 기본값을 정의할 수도 있습니다.

```
// 선택적 인수...
'mail:send {user?}'

// 선택적 인수에 기본값 지정...
'mail:send {user=foo}'
```

<a name="options"></a>
### 옵션(Options)

옵션 역시 인수와 같이 사용자 입력을 받는 또 다른 방식입니다. 옵션은 커맨드 라인에서 두 개의 하이픈(`--`)을 붙여 지정합니다. 옵션에는 값이 필요한 경우와 값이 없는 경우(스위치형)이 있습니다. 값이 없는 옵션은 불리언(boolean) 스위치 역할을 합니다. 아래 예시는 불리언 스위치형 옵션입니다.

```
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue}';
```

이 예에서는 `--queue` 스위치를 아티즌 명령어 실행 시 지정할 수 있고, 해당 옵션이 전달되면 옵션 값은 `true`, 전달되지 않으면 `false`가 됩니다.

```shell
php artisan mail:send 1 --queue
```

<a name="options-with-values"></a>
#### 값을 받는 옵션

이번에는 값이 반드시 필요한 옵션을 살펴보겠습니다. 값을 꼭 지정해야 하는 옵션에는 옵션명 뒤에 `=`(등호)를 붙여 표현합니다.

```
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue=}';
```

이 예제에서, 사용자는 아래와 같이 옵션 값을 넘길 수 있습니다. 만약 옵션 없이 명령어를 실행하면 해당 옵션 값은 `null`입니다.

```shell
php artisan mail:send 1 --queue=default
```

옵션에도 기본값을 지정할 수 있으며, 값을 넘기지 않은 경우에는 기본값이 사용됩니다.

```
'mail:send {user} {--queue=default}'
```

<a name="option-shortcuts"></a>
#### 옵션 단축키

옵션에 단축키를 부여하려면 옵션명 앞에 단축키를 쓰고, `|`(파이프)로 구분하면 됩니다.

```
'mail:send {user} {--Q|queue}'
```

터미널에서 명령어를 실행할 때는 옵션 단축키 앞에 하이픈 하나만 붙이고, 값을 지정할 경우 등호(`=`) 없이 바로 이어 붙이면 됩니다.

```shell
php artisan mail:send 1 -Qdefault
```

<a name="input-arrays"></a>
### 입력 배열

여러 개의 입력값(인수 또는 옵션)을 받고 싶을 때는 `*` 문자로 정의하면 됩니다. 먼저 인수 예시를 보겠습니다.

```
'mail:send {user*}'
```

이 방식으로 명령어를 실행할 때, `user` 인수는 여러 값을 받을 수 있습니다. 아래 명령어를 실행하면, `user`의 값은 `[1, 2]` 배열이 됩니다.

```shell
php artisan mail:send 1 2
```

`*` 문자는 선택적 인수 옵션과 함께 사용해 인수 값을 0개 이상 받을 수도 있습니다.

```
'mail:send {user?*}'
```

<a name="option-arrays"></a>
#### 옵션 배열

옵션도 여러 값이 필요한 경우, 값마다 옵션명을 반복해서 넘기면 됩니다.

```
'mail:send {--id=*}'
```

이렇게 정의하면 명령어 실행 시 여러 `--id` 옵션을 넘길 수 있습니다.

```shell
php artisan mail:send --id=1 --id=2
```

<a name="input-descriptions"></a>
### 입력 설명

명령어 인수와 옵션에 콜론(`:`)을 사용해 설명을 추가할 수 있습니다. 명령어 시그니처가 길어질 경우 여러 줄에 걸쳐 정의해도 괜찮습니다.

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

<a name="prompting-for-missing-input"></a>
### 누락된 입력 요청

명령어에 필수 인수가 있을 때, 사용자가 입력하지 않으면 에러 메시지가 표시됩니다. 대신, 필수 인수가 누락된 경우 사용자에게 입력을 자동으로 요청하도록 설정할 수도 있습니다. 이를 위해 `PromptsForMissingInput` 인터페이스를 구현하면 됩니다.

```
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Contracts\Console\PromptsForMissingInput;

class SendEmails extends Command implements PromptsForMissingInput
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:send {user}';

    // ...
}
```

라라벨이 필수 인수를 입력받아야 하는 상황이라면, 자동으로 인수의 이름이나 설명을 기반으로 적절한 질문을 생성해 사용자에게 입력을 요청합니다. 만약 입력 요청에 사용할 질문을 직접 지정하고 싶으면, `promptForMissingArgumentsUsing` 메서드를 구현해 각 인수 이름별로 질문 배열을 반환하면 됩니다.

```
/**
 * Prompt for missing input arguments using the returned questions.
 *
 * @return array<string, string>
 */
protected function promptForMissingArgumentsUsing(): array
{
    return [
        'user' => 'Which user ID should receive the mail?',
    ];
}
```

질문과 함께 플레이스홀더(placeholder) 텍스트도 튜플 형태로 제공할 수 있습니다.

```
return [
    'user' => ['Which user ID should receive the mail?', 'E.g. 123'],
];
```

프롬프트 전체를 커스터마이징하고 싶다면, 사용자 입력을 요청하고 그 답을 반환하는 클로저를 지정할 수도 있습니다.

```
use App\Models\User;
use function Laravel\Prompts\search;

// ...

return [
    'user' => fn () => search(
        label: 'Search for a user:',
        placeholder: 'E.g. Taylor Otwell',
        options: fn ($value) => strlen($value) > 0
            ? User::where('name', 'like', "%{$value}%")->pluck('name', 'id')->all()
            : []
    ),
];
```

> [!NOTE]  
자세한 프롬프트 활용법은 [라라벨 Prompts](/docs/11.x/prompts) 공식 문서를 참고하세요.

사용자에게 [옵션](#options)을 선택하거나 직접 입력하도록 프롬프트를 띄우고 싶다면, 프롬프트를 명령어의 `handle` 메서드에서 실행하면 됩니다. 하지만 누락된 인수 프롬프트가 자동으로 띄워진 뒤에만 추가로 질의를 하고 싶다면, `afterPromptingForMissingArguments` 메서드를 구현해 활용할 수 있습니다.

```
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use function Laravel\Prompts\confirm;

// ...

/**
 * Perform actions after the user was prompted for missing arguments.
 */
protected function afterPromptingForMissingArguments(InputInterface $input, OutputInterface $output): void
{
    $input->setOption('queue', confirm(
        label: 'Would you like to queue the mail?',
        default: $this->option('queue')
    ));
}
```

<a name="command-io"></a>
## 명령어 I/O

<a name="retrieving-input"></a>
### 입력값 가져오기

명령어가 실행되는 동안, 사용자가 넘긴 인수나 옵션 값을 코드에서 사용할 일이 많습니다. 이럴 때는 `argument`와 `option` 메서드를 사용할 수 있습니다. 해당 인수 또는 옵션이 존재하지 않는 경우 `null`이 반환됩니다.

```
/**
 * Execute the console command.
 */
public function handle(): void
{
    $userId = $this->argument('user');
}
```

모든 인수값을 `array`로 한꺼번에 가져오려면 `arguments` 메서드를 호출하면 됩니다.

```
$arguments = $this->arguments();
```

옵션 역시 `option` 메서드로 쉽게 값을 가져올 수 있으며, 전체 옵션 값을 배열로 가져오려면 `options` 메서드를 사용합니다.

```
// 특정 옵션 하나만 가져오기...
$queueName = $this->option('queue');

// 모든 옵션을 배열로 가져오기...
$options = $this->options();
```

<a name="prompting-for-input"></a>

### 입력 받기

> [!NOTE]  
> [Laravel Prompts](/docs/11.x/prompts)는 커맨드 라인 애플리케이션에 아름답고 사용자 친화적인 폼을 추가할 수 있는 PHP 패키지입니다. 이 패키지는 플레이스홀더 텍스트와 유효성 검증 등 브라우저와 비슷한 기능도 제공합니다.

출력만 하는 것이 아니라, 명령어 실행 중 사용자에게 직접 입력을 요청할 수도 있습니다. `ask` 메서드를 사용하면 사용자가 입력해야 할 질문을 표시하고, 입력 값을 받아 명령어 내부에서 활용할 수 있습니다.

```
/**
 * 콘솔 명령어를 실행합니다.
 */
public function handle(): void
{
    $name = $this->ask('What is your name?');

    // ...
}
```

`ask` 메서드는 두 번째 인수로 기본값도 지정할 수 있습니다. 사용자가 아무 값도 입력하지 않으면 이 값이 반환됩니다.

```
$name = $this->ask('What is your name?', 'Taylor');
```

`secret` 메서드는 `ask`와 유사하지만, 사용자가 콘솔에 입력하는 내용을 화면에 표시하지 않습니다. 비밀번호 등 민감한 정보를 질문할 때 유용합니다.

```
$password = $this->secret('What is the password?');
```

<a name="asking-for-confirmation"></a>
#### 확인(yes/no) 입력 받기

사용자에게 단순한 "예/아니오" 확인을 받고 싶을 때는 `confirm` 메서드를 사용할 수 있습니다. 이 메서드는 기본적으로 `false`를 반환하지만, 사용자가 `y` 혹은 `yes`를 입력하면 `true`를 반환합니다.

```
if ($this->confirm('Do you wish to continue?')) {
    // ...
}
```

필요하다면, `confirm` 메서드의 두 번째 인수로 `true`를 전달해 기본값을 `true`로 설정할 수도 있습니다.

```
if ($this->confirm('Do you wish to continue?', true)) {
    // ...
}
```

<a name="auto-completion"></a>
#### 자동 완성

`anticipate` 메서드는 입력 값에 대한 자동 완성 기능을 제공합니다. 자동 완성 힌트와 관계없이 사용자는 어떤 값을 입력해도 됩니다.

```
$name = $this->anticipate('What is your name?', ['Taylor', 'Dayle']);
```

또는, 자동완성 옵션을 동적으로 제공하고 싶을 때는 두 번째 인수로 클로저를 넘길 수도 있습니다. 이 클로저는 사용자가 문자를 입력할 때마다 호출되며, 입력한 내용을 인수로 받아 자동 완성 옵션의 배열을 반환해야 합니다.

```
$name = $this->anticipate('What is your address?', function (string $input) {
    // 자동 완성 옵션을 반환...
});
```

<a name="multiple-choice-questions"></a>
#### 다중 선택 질문

사용자에게 미리 정해진 여러 선택지 중 하나를 선택하도록 하려면 `choice` 메서드를 사용할 수 있습니다. 세 번째 인수로 기본값에 해당하는 배열의 인덱스를 지정할 수도 있습니다. 사용자가 아무것도 선택하지 않으면 이 인덱스의 값이 반환됩니다.

```
$name = $this->choice(
    'What is your name?',
    ['Taylor', 'Dayle'],
    $defaultIndex
);
```

또한, 네 번째와 다섯 번째 인수로 유효한 값을 선택할 수 있는 최대 시도 횟수와 다중 선택 허용 여부를 설정할 수 있습니다.

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

콘솔로 메시지를 출력하려면 `line`, `info`, `comment`, `question`, `warn`, `error` 등의 메서드를 사용할 수 있습니다. 이 메서드들은 각각에 맞는 ANSI 색상을 사용해 텍스트를 표시합니다. 예를 들어, 일반적인 정보를 사용자에게 보여 주고 싶으면 `info` 메서드를 사용합니다. 이때는 보통 콘솔에 초록색 글자로 출력됩니다.

```
/**
 * 콘솔 명령어를 실행합니다.
 */
public function handle(): void
{
    // ...

    $this->info('The command was successful!');
}
```

오류 메시지를 출력하려면 `error` 메서드를 사용합니다. 오류 메시지는 보통 빨간색으로 표시됩니다.

```
$this->error('Something went wrong!');
```

색상 없이 일반 텍스트를 출력하고 싶을 때는 `line` 메서드를 사용합니다.

```
$this->line('Display this on the screen');
```

빈 줄을 출력하려면 `newLine` 메서드를 사용합니다.

```
// 빈 줄 하나 출력...
$this->newLine();

// 빈 줄 세 개 출력...
$this->newLine(3);
```

<a name="tables"></a>
#### 테이블 출력

`table` 메서드는 여러 행과 컬럼으로 이루어진 데이터를 보기 좋게 테이블 형식으로 출력할 수 있도록 도와줍니다. 컬럼명과 데이터만 넘겨주면, 라라벨이 테이블의 너비와 높이를 자동으로 계산해서 출력해 줍니다.

```
use App\Models\User;

$this->table(
    ['Name', 'Email'],
    User::all(['name', 'email'])->toArray()
);
```

<a name="progress-bars"></a>
#### 진행률 표시줄(Progress Bar)

처리 시간이 오래 걸리는 작업을 할 때, 현재 완료된 정도를 사용자에게 보여주면 좋습니다. `withProgressBar` 메서드를 사용하면, 라라벨이 주어진 반복 가능한 값에 대해 순회할 때 자동으로 진행률 바를 표시하고 진행 상황을 갱신합니다.

```
use App\Models\User;

$users = $this->withProgressBar(User::all(), function (User $user) {
    $this->performTask($user);
});
```

좀 더 세밀하게 진행률 바의 동작을 제어하려면, 먼저 전체 단계 수를 지정해서 진행률 바를 만들고, 각 항목을 처리할 때마다 직접 진행 상황을 갱신하면 됩니다.

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
> 더 많은 고급 옵션이 궁금하다면 [Symfony Progress Bar 컴포넌트 문서](https://symfony.com/doc/7.0/components/console/helpers/progressbar.html)를 참고하십시오.

<a name="registering-commands"></a>
## 명령어 등록하기

기본적으로 라라벨은 `app/Console/Commands` 디렉토리 안에 있는 모든 명령어를 자동으로 등록합니다. 하지만, 애플리케이션의 `bootstrap/app.php` 파일에서 `withCommands` 메서드를 사용해 다른 디렉토리에서 Artisan 명령어를 검색하도록 지시할 수도 있습니다.

```
->withCommands([
    __DIR__.'/../app/Domain/Orders/Commands',
])
```

필요하다면, 명령어 클래스 이름을 직접 지정해서 `withCommands` 메서드로 수동 등록할 수도 있습니다.

```
use App\Domain\Orders\Commands\SendEmails;

->withCommands([
    SendEmails::class,
])
```

Artisan이 부팅될 때, 애플리케이션의 모든 명령어는 [서비스 컨테이너](/docs/11.x/container)에 의해 resolve(해결)되고 Artisan에 등록됩니다.

<a name="programmatically-executing-commands"></a>
## 명령어를 프로그램에서 실행하기

CLI가 아닌 곳에서 Artisan 명령어를 실행하고 싶을 때가 있습니다. 예를 들어, 라우트나 컨트롤러 내부에서 Artisan 명령어를 실행하고자 할 수 있습니다. 이럴 때는 `Artisan` 파사드의 `call` 메서드를 사용하면 됩니다. `call` 메서드의 첫 번째 인수에는 명령어 시그니처 이름이나 클래스 이름을 넣고, 두 번째 인수로는 명령어 파라미터의 배열을 넘깁니다. 반환값은 종료 코드(exit code)입니다.

```
use Illuminate\Support\Facades\Artisan;

Route::post('/user/{user}/mail', function (string $user) {
    $exitCode = Artisan::call('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    // ...
});
```

또는 전체 Artisan 명령어를 문자열로 넘겨 실행할 수도 있습니다.

```
Artisan::call('mail:send 1 --queue=default');
```

<a name="passing-array-values"></a>
#### 배열 값 넘기기

명령어에서 배열을 인수로 받도록 옵션을 정의한 경우, 해당 옵션에 값의 배열을 넘길 수 있습니다.

```
use Illuminate\Support\Facades\Artisan;

Route::post('/mail', function () {
    $exitCode = Artisan::call('mail:send', [
        '--id' => [5, 13]
    ]);
});
```

<a name="passing-boolean-values"></a>
#### 불리언 값 넘기기

`--force`와 같이 문자열이 아닌 값을 받아야 하는 옵션에는 값으로 `true`나 `false`를 지정할 수 있습니다.

```
$exitCode = Artisan::call('migrate:refresh', [
    '--force' => true,
]);
```

<a name="queueing-artisan-commands"></a>
#### Artisan 명령어를 큐잉하기

`Artisan` 파사드의 `queue` 메서드를 사용하면 Artisan 명령어를 큐에 넣어서, [큐 워커](/docs/11.x/queues)가 백그라운드에서 처리하도록 할 수 있습니다. 이 기능을 사용하기 전에 큐 설정을 마치고 큐 리스너가 실행 중인지 확인해야 합니다.

```
use Illuminate\Support\Facades\Artisan;

Route::post('/user/{user}/mail', function (string $user) {
    Artisan::queue('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    // ...
});
```

`onConnection`과 `onQueue` 메서드를 사용하면 해당 Artisan 명령어가 전송될 큐 커넥션이나 큐 이름도 직접 지정할 수 있습니다.

```
Artisan::queue('mail:send', [
    'user' => 1, '--queue' => 'default'
])->onConnection('redis')->onQueue('commands');
```

<a name="calling-commands-from-other-commands"></a>
### 다른 명령어에서 명령어 호출하기

기존 Artisan 명령어 내부에서 또 다른 명령어를 호출해야 할 때가 있습니다. 이럴 때는 `call` 메서드를 사용할 수 있습니다. 이 메서드는 명령어 이름과 인수/옵션 배열을 인수로 받습니다.

```
/**
 * 콘솔 명령어를 실행합니다.
 */
public function handle(): void
{
    $this->call('mail:send', [
        'user' => 1, '--queue' => 'default'
    ]);

    // ...
}
```

기타 콘솔 명령어를 호출하면서 그 명령어의 모든 출력을 숨기고 싶으면, `callSilently` 메서드를 사용하면 됩니다. 이 메서드는 `call`과 동일한 시그니처를 가집니다.

```
$this->callSilently('mail:send', [
    'user' => 1, '--queue' => 'default'
]);
```

<a name="signal-handling"></a>
## 신호(Signal) 처리

운영체제는 프로그램에 신호(signal)를 보낼 수 있습니다. 예를 들어, `SIGTERM` 신호는 운영체제가 프로그램에 종료를 요청할 때 전송합니다. Artisan 콘솔 명령어에서 이러한 신호를 감지해 신호가 도착했을 때 코드를 실행하고 싶다면, `trap` 메서드를 사용하면 됩니다.

```
/**
 * 콘솔 명령어를 실행합니다.
 */
public function handle(): void
{
    $this->trap(SIGTERM, fn () => $this->shouldKeepRunning = false);

    while ($this->shouldKeepRunning) {
        // ...
    }
}
```

여러 개의 신호를 동시에 감지하려면 `trap` 메서드에 신호들의 배열을 넘길 수 있습니다.

```
$this->trap([SIGTERM, SIGQUIT], function (int $signal) {
    $this->shouldKeepRunning = false;

    dump($signal); // SIGTERM / SIGQUIT
});
```

<a name="stub-customization"></a>
## 스텁(Stub) 커스터마이징

Artisan 콘솔의 `make` 명령어는 컨트롤러, 잡, 마이그레이션, 테스트 등 다양한 클래스를 생성합니다. 이 클래스들은 입력 값에 따라 일부 값을 채워넣는 "스텁" 파일을 기반으로 만들어집니다. Artisan이 만들어주는 파일에 소소하게 변경을 가하고 싶다면, `stub:publish` 명령어로 가장 일반적으로 사용하는 스텁 파일을 애플리케이션에 공개한 뒤, 원하는 대로 수정할 수 있습니다.

```shell
php artisan stub:publish
```

공개된 스텁 파일은 애플리케이션 루트의 `stubs` 디렉토리에 위치하게 됩니다. 이 파일을 수정하면, Artisan의 `make` 명령어로 해당 타입의 클래스를 만들 때마다 변경 내용이 반영됩니다.

<a name="events"></a>
## 이벤트

Artisan은 명령어 실행 시 세 가지 이벤트를 발생시킵니다: `Illuminate\Console\Events\ArtisanStarting`, `Illuminate\Console\Events\CommandStarting`, `Illuminate\Console\Events\CommandFinished`입니다. `ArtisanStarting` 이벤트는 Artisan이 실행을 시작할 때 바로 발생하며, 그 다음엔서 각 명령어가 실행되기 직전에 `CommandStarting` 이벤트가 발생합니다. 마지막으로 명령어 실행이 끝나면 `CommandFinished` 이벤트가 발생합니다.