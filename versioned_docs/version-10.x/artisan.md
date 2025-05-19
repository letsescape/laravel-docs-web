# 아티즌 콘솔 (Artisan Console)

- [소개](#introduction)
    - [Tinker (REPL)](#tinker)
- [명령어 작성하기](#writing-commands)
    - [명령어 생성하기](#generating-commands)
    - [명령어 구조](#command-structure)
    - [클로저 명령어](#closure-commands)
    - [Isolatable 명령어](#isolatable-commands)
- [입력 기대 정의하기](#defining-input-expectations)
    - [인수](#arguments)
    - [옵션](#options)
    - [입력 배열](#input-arrays)
    - [입력 설명](#input-descriptions)
    - [누락된 입력 프롬프트](#prompting-for-missing-input)
- [명령어 I/O](#command-io)
    - [입력값 가져오기](#retrieving-input)
    - [입력값 프롬프트](#prompting-for-input)
    - [출력 작성](#writing-output)
- [명령어 등록하기](#registering-commands)
- [명령어 프로그래밍 방식 실행](#programmatically-executing-commands)
    - [다른 명령어 호출하기](#calling-commands-from-other-commands)
- [시그널 처리](#signal-handling)
- [Stub(스텁) 커스터마이징](#stub-customization)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

아티즌(Artisan)은 라라벨에 기본 포함된 명령줄 인터페이스입니다. 아티즌은 애플리케이션 최상위 디렉터리에 `artisan` 스크립트로 위치하며, 개발 중에 유용한 다양한 명령어를 제공합니다. 사용 가능한 모든 아티즌 명령어를 보려면 `list` 명령어를 실행하면 됩니다.

```shell
php artisan list
```

각 명령어에는 해당 명령어의 인수와 옵션을 보여주고 설명하는 "도움말" 화면이 포함되어 있습니다. 도움말을 보려면 명령어 이름 앞에 `help`를 붙여 실행하세요.

```shell
php artisan help migrate
```

<a name="laravel-sail"></a>
#### Laravel Sail

로컬 개발 환경으로 [Laravel Sail](/docs/10.x/sail)을 사용한다면, 아티즌 명령어를 실행할 때 `sail` 커맨드 라인을 활용해야 합니다. Sail은 애플리케이션의 Docker 컨테이너 내부에서 아티즌 명령어를 실행해줍니다.

```shell
./vendor/bin/sail artisan list
```

<a name="tinker"></a>
### Tinker (REPL)

라라벨 Tinker는 라라벨 프레임워크를 위한 강력한 REPL을 제공합니다. 이 기능은 [PsySH](https://github.com/bobthecow/psysh) 패키지로 구동됩니다.

<a name="installation"></a>
#### 설치

모든 라라벨 애플리케이션에는 Tinker가 기본적으로 포함되어 있습니다. 만약 애플리케이션에서 Tinker를 제거했다면, Composer로 다시 설치할 수 있습니다.

```shell
composer require laravel/tinker
```

> [!NOTE]
> 라라벨 애플리케이션을 사용하면서 핫 리로딩, 여러 줄 코드 편집, 자동 완성 기능이 필요하다면 [Tinkerwell](https://tinkerwell.app)을 참고하세요!

<a name="usage"></a>
#### 사용법

Tinker를 이용하면 Eloquent 모델, 작업(jobs), 이벤트 등 전체 라라벨 애플리케이션을 커맨드라인에서 직접 다룰 수 있습니다. Tinker 환경에 진입하려면 `tinker` 아티즌 명령어를 실행하세요.

```shell
php artisan tinker
```

또한 `vendor:publish` 명령어로 Tinker의 설정 파일을 공개(publish)할 수 있습니다.

```shell
php artisan vendor:publish --provider="Laravel\Tinker\TinkerServiceProvider"
```

> [!WARNING]
> `dispatch` 헬퍼 함수 및 `Dispatchable` 클래스의 `dispatch` 메서드는 가비지 컬렉션에 의존해 작업을 큐에 올립니다. 따라서 tinker 사용 시에는 `Bus::dispatch`나 `Queue::push`를 활용해 작업을 큐로 전달해야 합니다.

<a name="command-allow-list"></a>
#### 명령어 허용 목록

Tinker는 "허용(allow)" 목록을 사용해, 쉘에서 실행할 수 있는 아티즌 명령어를 결정합니다. 기본적으로는 `clear-compiled`, `down`, `env`, `inspire`, `migrate`, `optimize`, `up` 명령어만 실행할 수 있습니다. 더 많은 명령어를 허용하고 싶다면, `tinker.php` 설정 파일의 `commands` 배열에 추가하면 됩니다.

```
'commands' => [
    // App\Console\Commands\ExampleCommand::class,
],
```

<a name="classes-that-should-not-be-aliased"></a>
#### 자동 별칭(alias) 금지 클래스 지정

보통 Tinker는 상호작용 시점에 클래스를 자동으로 별칭(alias) 처리합니다. 하지만 절대로 별칭을 만들고 싶지 않은 클래스가 있다면, `tinker.php` 설정 파일의 `dont_alias` 배열에 해당 클래스를 지정하면 됩니다.

```
'dont_alias' => [
    App\Models\User::class,
],
```

<a name="writing-commands"></a>
## 명령어 작성하기

아티즌이 기본 제공하는 명령어 외에도, 직접 커스텀 명령어를 만들 수 있습니다. 명령어 클래스는 보통 `app/Console/Commands` 디렉터리에 저장되지만, Composer가 로드 가능한 위치라면 자유롭게 저장 경로를 지정해도 됩니다.

<a name="generating-commands"></a>
### 명령어 생성하기

새 명령어를 생성하려면, `make:command` 아티즌 명령어를 사용하세요. 이 명령어는 `app/Console/Commands` 디렉터리에 새 명령어 클래스를 만들어줍니다. 만약 이 디렉터리가 없다면, 최초 실행 시 자동으로 생성됩니다.

```shell
php artisan make:command SendEmails
```

<a name="command-structure"></a>
### 명령어 구조

명령어를 생성했다면, 클래스의 `signature`와 `description` 속성(property)에 알맞은 값을 지정해야 합니다. 이 속성 값들은 `list` 화면에 명령어를 표시할 때 사용됩니다. 또한, `signature` 속성에서는 [명령어 입력값 규칙](#defining-input-expectations)도 정의할 수 있습니다. 명령어가 실행되면 `handle` 메서드가 호출되므로, 이 안에 명령어의 주요 로직을 작성하면 됩니다.

예시 명령어를 살펴보겠습니다. 여기서는 의존성이 필요한 경우 `handle` 메서드의 파라미터로 자유롭게 의존성 주입(Dependency Injection)이 가능함을 보여주고 있습니다. 라라벨 [서비스 컨테이너](/docs/10.x/container)는 타입 힌트가 지정된 모든 의존성을 자동으로 주입해줍니다.

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
> 코드의 재사용성을 높이려면, 콘솔 명령어 클래스 자체는 가볍게 유지하고 실제 작업은 애플리케이션 서비스로 위임하는 것이 좋습니다. 위의 예시처럼 "이메일 발송"과 같은 주요 로직을 서비스 클래스로 분리하는 방식을 권장합니다.

<a name="closure-commands"></a>
### 클로저 명령어

클로저(Closure) 기반 명령어는 클래스 대신 클로저 형태로 콘솔 명령어를 정의하는 또 다른 방법입니다. 마치 라우트 클로저(route closure)가 컨트롤러를 대체하는 것과 비슷하게, 명령어 클로저는 명령어 클래스를 대체할 수 있습니다. `app/Console/Kernel.php` 파일의 `commands` 메서드 안에서 라라벨은 `routes/console.php` 파일을 불러들입니다.

```
/**
 * Register the closure based commands for the application.
 */
protected function commands(): void
{
    require base_path('routes/console.php');
}
```

이 파일은 HTTP 라우트를 정의하지 않지만, 애플리케이션에 콘솔 진입점(명령어 루트)을 정의합니다. 이 안에서 `Artisan::command` 메서드를 사용해 클로저 기반 콘솔 명령어를 등록할 수 있습니다. `command` 메서드는 [명령어 시그니처](#defining-input-expectations)와 명령어의 인수, 옵션을 받는 클로저를 전달받습니다.

```
Artisan::command('mail:send {user}', function (string $user) {
    $this->info("Sending email to: {$user}!");
});
```

이 클로저는 내부적으로 실제 명령어 인스턴스에 바인딩 되므로, 일반 명령어 클래스에서 사용할 수 있는 모든 헬퍼 메서드에도 접근할 수 있습니다.

<a name="type-hinting-dependencies"></a>
#### 의존성 타입힌트 지정하기

명령어의 인수와 옵션 외에도, 클로저 명령어에서는 [서비스 컨테이너](/docs/10.x/container)에서 해결 가능한 추가 의존성도 타입 힌트로 주입받을 수 있습니다.

```
use App\Models\User;
use App\Support\DripEmailer;

Artisan::command('mail:send {user}', function (DripEmailer $drip, string $user) {
    $drip->send(User::find($user));
});
```

<a name="closure-command-descriptions"></a>
#### 클로저 명령어 설명 추가

클로저 기반 명령어를 정의할 때, `purpose` 메서드를 이용해 명령어에 설명을 추가할 수 있습니다. 이 설명은 `php artisan list` 또는 `php artisan help` 실행 시 표시됩니다.

```
Artisan::command('mail:send {user}', function (string $user) {
    // ...
})->purpose('Send a marketing email to a user');
```

<a name="isolatable-commands"></a>
### Isolatable 명령어

> [!NOTE]
> 이 기능을 사용하려면 애플리케이션의 기본 캐시 드라이버가 `memcached`, `redis`, `dynamodb`, `database`, `file`, `array` 중 하나여야 합니다. 또한 모든 서버가 같은 중앙 캐시 서버에 연결되어 있어야 합니다.

어떤 경우에는 특정 명령어의 인스턴스가 한 번에 하나만 실행되도록 제한하고 싶을 수 있습니다. 이를 위해, 명령어 클래스에서 `Illuminate\Contracts\Console\Isolatable` 인터페이스를 구현하면 됩니다.

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

명령어가 `Isolatable`로 표시되면 라라벨은 자동으로 명령어에 `--isolated` 옵션을 추가합니다. 이 옵션과 함께 명령어를 실행하면, 동일 명령어의 다른 인스턴스가 실행 중이지 않은지 확인한 후 실행합니다. 이를 위해 애플리케이션의 기본 캐시 드라이버로 원자적 잠금(atomic lock)을 시도합니다. 만약 다른 명령어 인스턴스가 이미 실행 중이라면, 새 명령어는 실행되지 않고 성공(exit code 0) 상태로 종료됩니다.

```shell
php artisan mail:send 1 --isolated
```

명령어 실행이 불가능할 경우 반환할 종료 코드를 지정하고 싶다면, `isolated` 옵션에 원하는 상태 코드를 전달하면 됩니다.

```shell
php artisan mail:send 1 --isolated=12
```

<a name="lock-id"></a>
#### Lock ID

기본적으로 라라벨은 명령어의 이름을 이용해 캐시에 원자적 잠금에 사용할 문자열 키를 생성합니다. 하지만 명령어 클래스에 `isolatableId` 메서드를 정의해, 인수나 옵션 등을 통합한 커스텀 키를 지정할 수도 있습니다.

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
#### 잠금 만료 시간

기본적으로는 명령어가 끝나면 isolation lock이 해제됩니다. 또는 명령어가 중단(interrupt)되어 종료에 실패한 경우, 1시간 후에 lock이 만료됩니다. 만료 시간을 커스터마이징 하려면, 명령어 클래스에 `isolationLockExpiresAt` 메서드를 정의하면 됩니다.

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
## 입력 기대 정의하기

콘솔 명령어를 만들 때, 사용자로부터 인수(argument)나 옵션(option) 등 입력값을 받아야 하는 경우가 흔합니다. 라라벨에서는 명령어 클래스의 `signature` 속성을 사용해, 입력값 규칙을 매우 직관적이고 간결하게 정의할 수 있습니다. 이름, 인수, 옵션을 한 번에 "라우트 문법"처럼 표현할 수 있습니다.

<a name="arguments"></a>
### 인수

사용자가 입력하는 모든 인수와 옵션은 중괄호로 감쌉니다. 아래 예시에서는 `user`라는 필수 인수 하나를 정의합니다.

```
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user}';
```

또한 인수를 선택적으로 만들거나, 기본값도 지정할 수 있습니다.

```
// 선택적 인수...
'mail:send {user?}'

// 기본값이 지정된 선택적 인수...
'mail:send {user=foo}'
```

<a name="options"></a>
### 옵션

옵션은 인수와 같이 사용자 입력의 또 다른 형태입니다. 명령줄에서는 두 개의 하이픈(`--`)으로 옵션을 구분합니다. 옵션에는 값을 받지 않는(불리언 스위치 역할), 받는 두 가지 타입이 있습니다. 먼저 값이 없는 옵션(불리언 스위치) 예시를 보겠습니다.

```
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue}';
```

이 예시에서 `--queue` 스위치를 전달하면 옵션 값이 `true`가 됩니다. 전달하지 않으면 `false`가 됩니다.

```shell
php artisan mail:send 1 --queue
```

<a name="options-with-values"></a>
#### 값이 있는 옵션

값을 받아야 하는 옵션 예시를 봅시다. 값이 필요하다면 옵션명 뒤에 `=` 기호를 붙입니다.

```
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue=}';
```

이 경우, 아래와 같이 옵션에 값을 전달할 수 있습니다. 옵션이 전달되지 않으면 기본값은 `null`입니다.

```shell
php artisan mail:send 1 --queue=default
```

옵션에 기본값을 설정하려면, 옵션명 다음에 해당 값을 지정합니다. 사용자가 옵션값을 입력하지 않으면 기본값이 사용됩니다.

```
'mail:send {user} {--queue=default}'
```

<a name="option-shortcuts"></a>
#### 옵션 단축키

옵션 정의 시, `|` 기호를 이용해 단축키(shortcut)를 명시할 수 있습니다.

```
'mail:send {user} {--Q|queue}'
```

터미널에서 명령어를 실행할 때, 단축키는 한 개의 하이픈과 함께 값에는 `=` 기호를 사용하지 않고 바로 붙입니다.

```shell
php artisan mail:send 1 -Qdefault
```

<a name="input-arrays"></a>
### 입력 배열

인수나 옵션에서 복수의 입력값을 받을 필요가 있다면, `*` 문자를 사용합니다. 먼저 인수에 대해 예시를 봅니다.

```
'mail:send {user*}'
```

이와 같이 설정하면, 명령어 호출 시 `user` 인수로 여러 개 값을 연달아 넘길 수 있습니다. 예를 들어 아래 커맨드는 `user` 인수에 `[1, 2]`가 배열로 담기게 됩니다.

```shell
php artisan mail:send 1 2
```

`*` 문자와 선택적 인수(물음표)를 함께 쓰면 0개 이상의 입력값도 허용할 수 있습니다.

```
'mail:send {user?*}'
```

<a name="option-arrays"></a>
#### 옵션 배열

여러 입력값이 필요한 옵션을 정의할 땐, 각각의 옵션값에 옵션명을 붙여 전달해야 합니다.

```
'mail:send {--id=*}'
```

다음과 같이 여러 개의 `--id` 옵션을 전달할 수 있습니다.

```shell
php artisan mail:send --id=1 --id=2
```

<a name="input-descriptions"></a>
### 입력 설명

인수나 옵션에 콜론(:)으로 설명을 붙일 수 있습니다. 명령어 정의가 길어질 경우, 여러 줄로 나누어 작성해도 무방합니다.

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
### 누락된 입력 프롬프트

필수 인수가 누락된 경우, 사용자는 에러 메시지를 보게 됩니다. 대신, 명령어에서 `PromptsForMissingInput` 인터페이스를 구현하면, 누락된 필수 인수에 대해 라라벨이 자동으로 프롬프트를 띄워 입력을 요청할 수 있습니다.

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

라라벨은 필수 인수 입력이 필요할 때, 인수명 또는 설명을 토대로 적절히 질문(프롬프트)을 만들어 사용자의 입력을 받습니다. 만약 질문 문구를 직접 지정하고 싶다면, `promptForMissingArgumentsUsing` 메서드를 구현해서 인수명을 key로, 질문을 value로 하여 배열을 반환하면 됩니다.

```
/**
 * Prompt for missing input arguments using the returned questions.
 *
 * @return array
 */
protected function promptForMissingArgumentsUsing()
{
    return [
        'user' => 'Which user ID should receive the mail?',
    ];
}
```

질문과 함께 플레이스홀더도 지정하려면, 튜플(배열)로 반환하면 됩니다.

```
return [
    'user' => ['Which user ID should receive the mail?', 'E.g. 123'],
];
```

프롬프트 전체 로직을 직접 제어하고 싶다면, 사용자의 입력을 받고 반환하는 클로저를 사용할 수도 있습니다.

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
> [Laravel Prompts](/docs/10.x/prompts) 공식 문서에서는 지원하는 다양한 프롬프트와 상세 사용 방법을 확인할 수 있습니다.

사용자에게 [옵션](#options)값 입력을 받도록 프롬프트를 실행하고 싶다면, 명령어의 `handle` 메서드에서 프롬프트를 직접 호출할 수 있습니다. 하지만 누락된 인수에 대한 프롬프트가 자동으로 동작할 때만 옵션 프롬프트도 동작시키고 싶다면, `afterPromptingForMissingArguments` 메서드를 구현하면 됩니다.

```
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use function Laravel\Prompts\confirm;

// ...

/**
 * Perform actions after the user was prompted for missing arguments.
 *
 * @param  \Symfony\Component\Console\Input\InputInterface  $input
 * @param  \Symfony\Component\Console\Output\OutputInterface  $output
 * @return void
 */
protected function afterPromptingForMissingArguments(InputInterface $input, OutputInterface $output)
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

명령어 실행 중, 명령어에서 받은 인수와 옵션값을 조회해야 할 때가 많습니다. 이 경우, `argument` 및 `option` 메서드를 사용하면 됩니다. 만약 해당 인수나 옵션이 없으면 `null`이 반환됩니다.

```
/**
 * Execute the console command.
 */
public function handle(): void
{
    $userId = $this->argument('user');
}
```

모든 인수를 배열(`array`)로 받으려면 `arguments` 메서드를 이용하세요.

```
$arguments = $this->arguments();
```

옵션도 동일하게 `option` 메서드로 조회할 수 있으며, 전체 옵션 값을 배열로 받으려면 `options` 메서드를 사용하면 됩니다.

```
// 특정 옵션 받아오기
$queueName = $this->option('queue');

// 전체 옵션 배열로 받아오기
$options = $this->options();
```

<a name="prompting-for-input"></a>
### 입력값 프롬프트

> [!NOTE]
> [Laravel Prompts](/docs/10.x/prompts)는 브라우저처럼 플레이스홀더 텍스트, 유효성 검사 등을 지원하는, 아름답고 사용자 친화적인 폼 입력을 콘솔 애플리케이션에 제공하는 PHP 패키지입니다.

출력만 제공하는 것이 아니라, 명령어 실행 중에 사용자로부터 입력값을 입력받을 수도 있습니다. `ask` 메서드는 지정한 질문을 통해 사용자의 입력을 받아 반환합니다.

```
/**
 * Execute the console command.
 */
public function handle(): void
{
    $name = $this->ask('What is your name?');

    // ...
}
```

`ask` 메서드는 두 번째 인수로, 사용자가 입력하지 않았을 때 반환할 기본값을 지정할 수 있습니다.

```
$name = $this->ask('What is your name?', 'Taylor');
```

`secret` 메서드는 `ask`와 비슷하지만, 입력하는 값이 콘솔 화면에 보이지 않습니다. 비밀번호 등 민감한 값을 묻고 싶을 때 유용합니다.

```
$password = $this->secret('What is the password?');
```

<a name="asking-for-confirmation"></a>
#### 확인 질문(yes/no) 하기

사용자에게 예/아니오(yes/no)와 같이 단순히 확인하도록 요청하고 싶다면, `confirm` 메서드를 사용할 수 있습니다. 기본적으로 사용자가 프롬프트에 `y` 또는 `yes`라고 입력해야만 true를 반환합니다.

```
if ($this->confirm('Do you wish to continue?')) {
    // ...
}
```

필요하다면 두 번째 인수로 true를 전달해, 확인 프롬프트의 기본값을 true로 지정할 수도 있습니다.

```
if ($this->confirm('Do you wish to continue?', true)) {
    // ...
}
```

<a name="auto-completion"></a>
#### 자동 완성

`anticipate` 메서드를 사용하면 사용자 입력에 따라 선택지 자동 완성을 지원할 수 있습니다. 자동 완성 목록이 표시되지만, 사용자는 그 외 값도 자유롭게 입력할 수 있습니다.

```
$name = $this->anticipate('What is your name?', ['Taylor', 'Dayle']);
```

또는, 두 번째 인수로 클로저를 전달하면 사용자가 입력할 때마다 호출되어 자동 완성 옵션을 동적으로 반환할 수 있습니다.

```
$name = $this->anticipate('What is your address?', function (string $input) {
    // 자동 완성 옵션 반환...
});
```

<a name="multiple-choice-questions"></a>
#### 선택지 질문(복수/단일) 하기

사용자에게 미리 정의된 선택지를 제시하여 질문하고 싶다면, `choice` 메서드를 사용하면 됩니다. 세 번째 인수로 배열에서 기본 선택값의 index를 전달할 수 있습니다(입력하지 않을 경우 반환될 값).

```
$name = $this->choice(
    'What is your name?',
    ['Taylor', 'Dayle'],
    $defaultIndex
);
```

또한 4번째, 5번째 인수로 유효 응답 최대 시도 횟수, 그리고 복수 선택 허용 여부(true/false)도 지정할 수 있습니다.

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
### 출력 작성

콘솔에 메시지를 출력하려면, `line`, `info`, `comment`, `question`, `warn`, `error` 등의 메서드를 사용할 수 있습니다. 각각의 메서드는 목적에 맞는 ANSI 색상으로 메시지를 표시해줍니다. 예를 들어, 일반 정보를 출력하고 싶다면 `info` 메서드를 사용하세요. (보통 초록색으로 표시됨)

```
/**
 * Execute the console command.
 */
public function handle(): void
{
    // ...

    $this->info('The command was successful!');
}
```

에러 메시지를 표시하려면 `error` 메서드를 이용하세요. 빨간색 텍스트로 출력됩니다.

```
$this->error('Something went wrong!');
```

색상 없는 일반(Plain) 텍스트를 보여주고 싶다면 `line` 메서드를 씁니다.

```
$this->line('Display this on the screen');
```

빈 줄을 추가하려면 `newLine` 메서드를 사용하세요.

```
// 빈 줄 한 개 출력
$this->newLine();

// 빈 줄 세 개 출력
$this->newLine(3);
```

<a name="tables"></a>
#### 테이블

`table` 메서드를 사용하면 여러 행/열로 구성된 데이터를 보기 좋게 콘솔에 표시할 수 있습니다. 컬럼 이름과 데이터 배열만 넘기면, 라라벨이 적절한 크기와 정렬로 출력해줍니다.

```
use App\Models\User;

$this->table(
    ['Name', 'Email'],
    User::all(['name', 'email'])->toArray()
);
```

<a name="progress-bars"></a>
#### 진행 상태 표시(Progress Bar)

실행 시간이 오래 걸리는 작업이라면, 진행 상태를 보여주는 프로그레스 바를 표시하는 것이 좋습니다. `withProgressBar` 메서드는 전달받은 반복 가능한 데이터(Iterable)에 대해 반복할 때마다 진행 상태를 콘솔에 표시해줍니다.

```
use App\Models\User;

$users = $this->withProgressBar(User::all(), function (User $user) {
    $this->performTask($user);
});
```

더 세밀한 제어가 필요하다면, 먼저 전체 단계 수를 지정하고, 각 단계마다 프로그레스 바를 수동으로 갱신할 수도 있습니다.

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
> 좀 더 고급 옵션이 필요하다면, [Symfony Progress Bar 컴포넌트 문서](https://symfony.com/doc/current/components/console/helpers/progressbar.html)를 참고하세요.

<a name="registering-commands"></a>
## 명령어 등록하기

모든 콘솔 명령어는 애플리케이션의 `App\Console\Kernel` 클래스(즉, 콘솔 커널)에서 등록됩니다. 이 클래스의 `commands` 메서드에서 커널의 `load` 메서드를 호출합니다. `load` 메서드는 `app/Console/Commands` 디렉터리를 스캔하여, 해당 폴더의 모든 클래스를 자동으로 아티즌에 등록합니다. 필요하다면 여러 디렉터리를 추가로 스캔하도록 `load` 메서드를 여러 번 호출할 수도 있습니다.

```
/**
 * Register the commands for the application.
 */
protected function commands(): void
{
    $this->load(__DIR__.'/Commands');
    $this->load(__DIR__.'/../Domain/Orders/Commands');

    // ...
}
```

필요하다면, `App\Console\Kernel` 클래스 내의 `$commands` 속성(property)에 명령어 클래스를 직접 명시적으로 추가하여 수동으로 등록할 수도 있습니다. 이 속성이 이미 없다면, 직접 선언해야 합니다. 아티즌이 부팅될 때 이 속성의 모든 명령어가 [서비스 컨테이너](/docs/10.x/container)를 통해 resolve되고 아티즌에 자동 등록됩니다.

```
protected $commands = [
    Commands\SendEmails::class
];
```

<a name="programmatically-executing-commands"></a>
## 명령어 프로그래밍 방식 실행

CLI 이외의 곳에서 아티즌 명령어를 실행해야 할 때가 있습니다. 예를 들어, 라우트나 컨트롤러에서 아티즌 명령어를 실행하고 싶을 수 있습니다. 이 때는 `Artisan` 파사드의 `call` 메서드를 사용하면 됩니다. 첫 번째 인수는 명령어의 시그니처(이름) 또는 클래스 이름, 두 번째 인수는 명령어의 파라미터 배열입니다. 리턴값은 종료 코드(exit code)입니다.

```
use Illuminate\Support\Facades\Artisan;

Route::post('/user/{user}/mail', function (string $user) {
    $exitCode = Artisan::call('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    // ...
});
```

또는 전체 아티즌 명령어를 문자열로 통째로 넘길 수도 있습니다.

```
Artisan::call('mail:send 1 --queue=default');
```

<a name="passing-array-values"></a>
#### 배열 값 넘기기

만약 어떤 옵션이 배열을 받을 수 있으면, 해당 옵션에 배열로 값을 전달하면 됩니다.

```
use Illuminate\Support\Facades\Artisan;

Route::post('/mail', function () {
    $exitCode = Artisan::call('mail:send', [
        '--id' => [5, 13]
    ]);
});
```

<a name="passing-boolean-values"></a>
#### 불린 값 넘기기

문자열 값을 받지 않는 옵션(예: `migrate:refresh`의 `--force` 플래그 등)에는 `true` 또는 `false`를 넘기면 됩니다.

```
$exitCode = Artisan::call('migrate:refresh', [
    '--force' => true,
]);
```

<a name="queueing-artisan-commands"></a>
#### 아티즌 명령어 큐잉(Queue)

`Artisan` 파사드의 `queue` 메서드를 사용하면, 아티즌 명령어를 큐에 등록해서 백그라운드의 [queue worker](/docs/10.x/queues)에서 실행할 수도 있습니다. 사용하려면 먼저 큐 설정 후 queue 리스너를 실행하고 있어야 합니다.

```
use Illuminate\Support\Facades\Artisan;

Route::post('/user/{user}/mail', function (string $user) {
    Artisan::queue('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    // ...
});
```

`onConnection`, `onQueue` 메서드를 체이닝하면, 커맨드를 어떤 연결(connection)이나 큐(queue)에 전달할지 지정할 수 있습니다.

```
Artisan::queue('mail:send', [
    'user' => 1, '--queue' => 'default'
])->onConnection('redis')->onQueue('commands');
```

<a name="calling-commands-from-other-commands"></a>
### 다른 명령어 호출하기

기존 아티즌 명령어에서 다른 명령어를 불러 실행하고 싶을 때가 있습니다. 이럴 때는 `call` 메서드를 활용하면 됩니다. 첫 번째 인수에 명령어 이름, 두 번째 인수에 인수/옵션 배열을 넘깁니다.

```
/**
 * Execute the console command.
 */
public function handle(): void
{
    $this->call('mail:send', [
        'user' => 1, '--queue' => 'default'
    ]);

    // ...
}
```

만약, 다른 콘솔 명령어를 호출하되 모든 출력까지 숨기고 싶다면, `callSilently` 메서드를 사용하세요. 시그니처는 `call` 메서드와 동일합니다.

```
$this->callSilently('mail:send', [
    'user' => 1, '--queue' => 'default'
]);
```

<a name="signal-handling"></a>
## 시그널 처리

운영체제에서는 실행 중인 프로세스에 시그널을 보낼 수 있습니다. 예를 들어, `SIGTERM` 시그널은 운영체제가 프로그램에 "종료하라"는 신호를 보내는 방식입니다. 아티즌 콘솔 명령어에서 이런 시그널을 감지해 특정 코드가 실행되도록 하려면, `trap` 메서드를 사용하면 됩니다.

```
/**
 * Execute the console command.
 */
public function handle(): void
{
    $this->trap(SIGTERM, fn () => $this->shouldKeepRunning = false);

    while ($this->shouldKeepRunning) {
        // ...
    }
}
```

한 번에 여러 시그널을 감지하고 싶다면, `trap` 메서드에 시그널 배열을 넘기세요.

```
$this->trap([SIGTERM, SIGQUIT], function (int $signal) {
    $this->shouldKeepRunning = false;

    dump($signal); // SIGTERM / SIGQUIT
});
```

<a name="stub-customization"></a>
## Stub(스텁) 커스터마이징

아티즌 콘솔의 `make` 계열 명령어들은 컨트롤러, 작업, 마이그레이션, 테스트 등 다양한 클래스를 만들어줍니다. 이 때 생성되는 클래스 파일은 "스텁(stub)" 파일을 기반으로 하며, 입력값에 따라 알맞은 값으로 채워져서 생성됩니다. 그러나 때로는 stub 파일을 수정하고 싶을 때가 있습니다. 그럴 땐 `stub:publish` 명령어로 대표적인 스텁 파일들을 애플리케이션에 공개(publish)할 수 있습니다.

```shell
php artisan stub:publish
```

공개된 스텁 파일들은 애플리케이션 루트의 `stubs` 디렉터리에 저장됩니다. 그리고 이 파일을 수정하면, 이후 아티즌의 `make` 명령어로 생성하는 클래스에 해당 내용이 반영됩니다.

<a name="events"></a>
## 이벤트

아티즌 명령어가 실행될 때는 세 가지 이벤트가 발생합니다: `Illuminate\Console\Events\ArtisanStarting`, `Illuminate\Console\Events\CommandStarting`, `Illuminate\Console\Events\CommandFinished`입니다. `ArtisanStarting` 이벤트는 아티즌이 실제로 실행을 시작할 때 즉시 발생하고, `CommandStarting` 이벤트는 각 명령어가 실행 직전에, 마지막으로 `CommandFinished` 이벤트는 명령어 실행이 종료된 직후 발생합니다.
