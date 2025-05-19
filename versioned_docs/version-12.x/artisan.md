# 아티즌 콘솔 (Artisan Console)

- [소개](#introduction)
    - [Tinker (REPL)](#tinker)
- [명령어 작성](#writing-commands)
    - [명령어 생성](#generating-commands)
    - [명령어 구조](#command-structure)
    - [클로저 명령어](#closure-commands)
    - [Isolatable 명령어](#isolatable-commands)
- [입력 기대값 정의](#defining-input-expectations)
    - [인수](#arguments)
    - [옵션](#options)
    - [입력 배열](#input-arrays)
    - [입력 설명](#input-descriptions)
    - [누락된 입력값 프롬프트](#prompting-for-missing-input)
- [명령어 입출력](#command-io)
    - [입력값 가져오기](#retrieving-input)
    - [입력값 프롬프트](#prompting-for-input)
    - [출력 작성](#writing-output)
- [명령어 등록](#registering-commands)
- [명령어 프로그래밍 실행](#programmatically-executing-commands)
    - [다른 명령어에서 호출하기](#calling-commands-from-other-commands)
- [시그널 핸들링](#signal-handling)
- [스타브 커스터마이즈](#stub-customization)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

아티즌(Artisan)은 라라벨에 기본 포함된 명령줄 인터페이스입니다. 아티즌은 애플리케이션 루트 디렉터리에 `artisan` 스크립트로 존재하며, 애플리케이션을 개발하는 동안 유용하게 사용할 수 있는 다양한 명령어를 제공합니다. 사용 가능한 모든 아티즌 명령어 목록을 확인하려면 `list` 명령어를 사용할 수 있습니다.

```shell
php artisan list
```

모든 명령어는 해당 명령어의 사용 가능한 인수와 옵션을 표시하고 설명하는 "도움말" 화면을 제공합니다. 도움말 화면을 보려면 명령어 이름 앞에 `help`를 붙여 실행합니다.

```shell
php artisan help migrate
```

<a name="laravel-sail"></a>
#### 라라벨 세일

[라라벨 세일](/docs/12.x/sail)을 로컬 개발 환경으로 사용 중이라면, 아티즌 명령어를 실행할 때 반드시 `sail` 명령줄을 사용해야 합니다. 세일은 여러분의 애플리케이션 도커 컨테이너 내부에서 아티즌 명령어를 실행합니다.

```shell
./vendor/bin/sail artisan list
```

<a name="tinker"></a>
### Tinker (REPL)

[라라벨 Tinker](https://github.com/laravel/tinker)는 라라벨 프레임워크를 위한 강력한 REPL(대화형 코드 실행 환경)로, [PsySH](https://github.com/bobthecow/psysh) 패키지로 동작합니다.

<a name="installation"></a>
#### 설치

라라벨 애플리케이션에는 기본적으로 Tinker가 포함되어 있습니다. 하지만 Tinker를 삭제한 적이 있다면 Composer로 다시 설치할 수 있습니다.

```shell
composer require laravel/tinker
```

> [!NOTE]
> 라라벨 애플리케이션을 다루면서 핫 리로딩, 여러 줄 코드 편집, 자동완성 같은 기능이 필요하다면 [Tinkerwell](https://tinkerwell.app)을 살펴보세요!

<a name="usage"></a>
#### 사용법

Tinker를 이용하면 Eloquent 모델, 잡, 이벤트 등 라라벨 애플리케이션 전체와 명령줄에서 상호작용할 수 있습니다. Tinker 환경에 진입하려면 `tinker` 아티즌 명령어를 실행합니다.

```shell
php artisan tinker
```

Tinker의 설정 파일은 `vendor:publish` 명령어를 통해 발행할 수 있습니다.

```shell
php artisan vendor:publish --provider="Laravel\Tinker\TinkerServiceProvider"
```

> [!WARNING]
> `dispatch` 헬퍼 함수 및 `Dispatchable` 클래스의 `dispatch` 메서드는 작업을 큐에 추가할 때 가비지 컬렉션에 의존합니다. 따라서 Tinker에서 작업(job)을 디스패치할 때는 `Bus::dispatch` 또는 `Queue::push`를 사용하는 것이 안전합니다.

<a name="command-allow-list"></a>
#### 허용 명령어 목록

Tinker는 내부에서 실행할 수 있는 아티즌 명령어를 "허용" 목록으로 관리합니다. 기본적으로는 `clear-compiled`, `down`, `env`, `inspire`, `migrate`, `migrate:install`, `up`, `optimize` 명령어만 사용할 수 있습니다. 추가로 허용하고 싶은 명령어가 있다면 `tinker.php` 설정 파일의 `commands` 배열에 추가하면 됩니다.

```php
'commands' => [
    // App\Console\Commands\ExampleCommand::class,
],
```

<a name="classes-that-should-not-be-aliased"></a>
#### 자동 별칭을 적용하지 않을 클래스

Tinker는 기본적으로 Tinker 환경 내에서 상호작용하는 클래스에 대해 자동으로 별칭(alias)을 생성합니다. 하지만, 특정 클래스는 절대 별칭을 만들지 않도록 설정할 수 있습니다. 이를 위해 `tinker.php` 설정 파일의 `dont_alias` 배열에 해당 클래스를 추가하면 됩니다.

```php
'dont_alias' => [
    App\Models\User::class,
],
```

<a name="writing-commands"></a>
## 명령어 작성

아티즌이 제공하는 기본 명령어 외에도, 여러분이 직접 커스텀 명령어를 만들어 사용할 수도 있습니다. 명령어 클래스는 보통 `app/Console/Commands` 디렉터리에 저장하지만, Composer로 로드할 수만 있다면 다른 위치를 사용해도 괜찮습니다.

<a name="generating-commands"></a>
### 명령어 생성

새로운 명령어를 만들려면 `make:command` 아티즌 명령어를 사용할 수 있습니다. 이 명령어를 실행하면 `app/Console/Commands` 디렉터리에 새 명령어 클래스가 생성됩니다. 만약 이 디렉터리가 프로젝트에 없다면, 처음 명령어 생성을 시도할 때 자동으로 만들어집니다.

```shell
php artisan make:command SendEmails
```

<a name="command-structure"></a>
### 명령어 구조

명령어를 생성한 후에는 클래스의 `signature`와 `description` 속성(property) 값을 적절하게 정의해야 합니다. 이 속성들은 `list` 화면에 명령어를 표시할 때 사용됩니다. 또한 `signature` 속성에서는 [명령어의 입력 기대값](#defining-input-expectations)을 정의할 수도 있습니다. 명령어가 실행되면 `handle` 메서드가 호출되며, 여기에 명령어의 구체적인 로직을 작성하면 됩니다.

예시 명령어를 살펴봅시다. 아래와 같이 명령어의 `handle` 메서드에서 필요한 의존성을 직접 주입받을 수 있습니다. 라라벨의 [서비스 컨테이너](/docs/12.x/container)가 이 메서드의 시그니처에 타입힌트된 모든 의존성을 자동으로 주입해줍니다.

```php
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
> 코드 재사용성을 높이기 위해, 콘솔 명령어 자체는 최대한 단순하게 작성하고 실제 작업은 별도의 애플리케이션 서비스 클래스에 위임하는 것이 좋습니다. 위 예시에서도 이메일 발송의 "실제 작업"은 서비스 클래스를 주입하여 처리합니다.

<a name="exit-codes"></a>
#### 종료 코드

`handle` 메서드에서 아무것도 반환하지 않고 명령어가 정상적으로 실행되면, 명령어는 성공을 의미하는 `0` 종료 코드로 종료됩니다. 만약 직접 종료 코드를 지정하고 싶다면 `handle` 메서드에서 정수값을 반환하면 됩니다.

```php
$this->error('Something went wrong.');

return 1;
```

명령어 내 어디에서든 명령어를 "실패" 상태로 즉시 종료하려면 `fail` 메서드를 사용할 수 있습니다. 이 메서드는 명령어 실행을 즉시 중단하고 종료 코드로 `1`을 반환합니다.

```php
$this->fail('Something went wrong.');
```

<a name="closure-commands"></a>
### 클로저 명령어

클로저(closre) 기반 명령어는 명령어 클래스를 별도로 정의하지 않고 명령어를 작성할 수 있는 또 다른 방법입니다. 라우트 클로저가 컨트롤러의 대안인 것처럼, 명령어 클로저도 명령어 클래스의 대안이라 생각하시면 됩니다.

`routes/console.php` 파일은 HTTP 라우트가 아니라 콘솔 기반의 진입점(엔트리 라우트)을 정의하는 역할을 합니다. 이 파일 안에서 `Artisan::command` 메서드를 활용해 클로저 기반 콘솔 명령어를 정의할 수 있습니다. `command` 메서드는 [명령어 시그니처](#defining-input-expectations)와 클로저(함수) 두 개의 인수를 받습니다. 이 클로저에서는 명령어 인수와 옵션을 사용할 수 있습니다.

```php
Artisan::command('mail:send {user}', function (string $user) {
    $this->info("Sending email to: {$user}!");
});
```

클로저 내부의 `$this`는 실제 명령어 인스턴스에 바인딩돼 있으므로, 명령어 클래스에서 사용 가능한 모든 헬퍼 메서드에 접근할 수 있습니다.

<a name="type-hinting-dependencies"></a>
#### 의존성 타입힌트

명령어 클로저에서는 명령의 인수나 옵션뿐 아니라, 추가적으로 서비스 컨테이너에서 자동 주입받을 의존성도 타입힌트로 선언할 수 있습니다.

```php
use App\Models\User;
use App\Support\DripEmailer;

Artisan::command('mail:send {user}', function (DripEmailer $drip, string $user) {
    $drip->send(User::find($user));
});
```

<a name="closure-command-descriptions"></a>
#### 클로저 명령어 설명 추가

클로저 기반 명령어를 작성할 때는 `purpose` 메서드를 이용하여 명령어의 설명을 추가할 수 있습니다. 이 설명은 `php artisan list` 또는 `php artisan help` 명령 실행 시 표시됩니다.

```php
Artisan::command('mail:send {user}', function (string $user) {
    // ...
})->purpose('Send a marketing email to a user');
```

<a name="isolatable-commands"></a>
### Isolatable 명령어

> [!WARNING]
> 이 기능을 사용하려면 애플리케이션의 기본 캐시 드라이버가 `memcached`, `redis`, `dynamodb`, `database`, `file`, `array` 중 하나여야 합니다. 또한, 모든 서버가 동일한 중앙 캐시 서버와 통신해야 합니다.

특정 명령어가 한 번에 하나의 인스턴스만 실행되도록 제한하고 싶을 때가 있습니다. 이를 위해 명령어 클래스에 `Illuminate\Contracts\Console\Isolatable` 인터페이스를 구현하면 됩니다.

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Contracts\Console\Isolatable;

class SendEmails extends Command implements Isolatable
{
    // ...
}
```

명령어가 `Isolatable`로 표시되면 라라벨이 자동으로 해당 명령어에 `--isolated` 옵션을 추가해줍니다. 이 옵션을 사용해 명령어를 실행하면, 같은 명령어가 다른 인스턴스로 이미 실행 중이라면 실행되지 않게 됩니다. 라라벨은 기본 캐시 드라이버를 이용해 원자적 락(atomic lock)을 획득하는 방식으로 이를 구현합니다. 만약 다른 인스턴스가 이미 실행 중이라면, 명령어는 실행되지 않고 성공(exit code 0)으로 종료됩니다.

```shell
php artisan mail:send 1 --isolated
```

명령어가 이미 실행 중일 때 종료 코드(status code)를 직접 지정하려면 `isolated` 옵션에 값을 지정할 수 있습니다.

```shell
php artisan mail:send 1 --isolated=12
```

<a name="lock-id"></a>
#### 락 ID

기본적으로 라라벨은 명령어 이름을 사용해 캐시에서 원자적 락을 얻기 위한 문자열 키를 생성합니다. 하지만, 명령어 클래스에 `isolatableId` 메서드를 정의하여 명령어 인수나 옵션을 이 키에 포함하도록 커스터마이즈할 수 있습니다.

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

기본적으로 격리 락(isolation lock)은 명령어가 끝나면 소멸하고, 명령어가 중단되어 완료되지 못한 경우 한 시간 후 만료됩니다. `isolationLockExpiresAt` 메서드를 정의해 락 만료 시간을 직접 조정할 수 있습니다.

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

콘솔 명령어 작성 시, 사용자로부터 인수(argument) 또는 옵션(option)을 입력받는 것이 일반적입니다. 라라벨에서는 명령어의 `signature` 속성을 이용해, 사용자가 입력해야 할 정보를 쉽고 명확하게 정의할 수 있습니다. 이 속성을 통해 명령어 이름, 인수, 옵션을 한 번에 선언할 수 있으며, 선언 방식은 라우트와 비슷한 형태로 직관적입니다.

<a name="arguments"></a>
### 인수

사용자가 직접 입력하는 인수와 옵션은 모두 중괄호로 감쌉니다. 아래 예시에서는 필수 인수인 `user`만을 요구합니다.

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user}';
```

인수를 선택적으로 만들거나, 기본 값을 부여할 수도 있습니다.

```php
// 선택적 인수...
'mail:send {user?}'

// 선택적 인수 + 기본값...
'mail:send {user=foo}'
```

<a name="options"></a>
### 옵션

옵션 역시 인수와 비슷한 방식으로 사용자로부터 입력받는 값입니다. 옵션은 명령줄에서 두 개의 하이픈(`--`)을 붙여 표기합니다. 옵션에는 값을 받는 타입과 값을 받지 않는, 즉 "스위치" 역할을 하는 타입이 있습니다. 먼저 값을 받지 않는(=불리언 스위치) 옵션 예시를 보겠습니다.

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue}';
```

위 예시에서 `--queue` 스위치는 아티즌 명령어 실행 시 지정할 수 있습니다. 이 스위치를 넘기면 옵션의 값은 `true`, 그렇지 않으면 `false`가 됩니다.

```shell
php artisan mail:send 1 --queue
```

<a name="options-with-values"></a>
#### 값을 받는 옵션

다음은 값을 반드시 입력받는 옵션의 예시입니다. 사용자로부터 옵션의 값을 입력받으려면 옵션 이름 끝에 `=` 기호를 붙여야 합니다.

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue=}';
```

사용자는 아래와 같이 옵션에 값을 입력할 수 있습니다. 만약 옵션이 명령 호출 시 지정되지 않으면 해당 옵션 값은 `null`이 됩니다.

```shell
php artisan mail:send 1 --queue=default
```

옵션에도 기본값을 지정할 수 있으며, 사용자가 값을 입력하지 않으면 기본값이 적용됩니다.

```php
'mail:send {user} {--queue=default}'
```

<a name="option-shortcuts"></a>
#### 옵션 단축키

옵션에 단축키(짧은 옵션)를 지정할 수도 있습니다. 단축키는 옵션 이름 앞에 `|`(파이프 문자)를 구분자로 사용해 정의합니다.

```php
'mail:send {user} {--Q|queue}'
```

터미널에서 명령을 실행할 때 옵션 단축키는 한 개의 하이픈만 붙이고, 값을 표시할 때는 `=` 기호 없이 바로 이어붙입니다.

```shell
php artisan mail:send 1 -Qdefault
```

<a name="input-arrays"></a>
### 입력 배열

인수나 옵션에 여러 개의 값을 입력받고 싶다면 `*`(별표) 문자를 사용할 수 있습니다. 먼저 인수에 적용하는 예시입니다.

```php
'mail:send {user*}'
```

이렇게 선언된 명령어에 아래와 같이 여러 값을 넣으면, `user` 인수에는 `1`, `2`가 담긴 배열이 전달됩니다.

```shell
php artisan mail:send 1 2
```

`*` 문자는 선택적 인수와 조합해, 0개 이상의 값을 입력받을 수 있도록 선언할 수도 있습니다.

```php
'mail:send {user?*}'
```

<a name="option-arrays"></a>
#### 옵션 배열

여러 개의 옵션 값을 입력받고 싶다면, 각 옵션 값마다 옵션 이름을 반복해서 넘길 수 있습니다.

```php
'mail:send {--id=*}'
```

이 명령어를 실행할 때는 아래와 같이 옵션을 여러 번 넘깁니다.

```shell
php artisan mail:send --id=1 --id=2
```

<a name="input-descriptions"></a>
### 입력 설명

인수와 옵션에 대해 설명을 추가하고 싶다면 이름 뒤에 콜론(`:`)을 사용해 구분하면 됩니다. 명령어 시그니처가 길거나 내용이 많으면 여러 줄로 나눠서 작성해도 괜찮습니다.

```php
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
### 누락된 입력값 프롬프트

필수 인수가 빠졌을 경우, 사용자는 에러 메시지를 받게 됩니다. 또는 콘솔 명령어에 `PromptsForMissingInput` 인터페이스를 구현해서 필수 인수가 누락될 때 자동으로 사용자에게 해당 값을 입력하도록 프롬프트를 띄울 수도 있습니다.

```php
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

라라벨은 필수 인수가 누락되면, 인수의 이름이나 설명을 바탕으로 적절하게 질문을 만들어서 자동으로 프롬프트를 띄워줍니다. 만약 프롬프트에서 사용자에게 보여줄 질문을 직접 지정하고 싶다면, `promptForMissingArgumentsUsing` 메서드를 구현하고, 인수 이름을 키로 하는 질문 배열을 반환하면 됩니다.

```php
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

질문 뒤에 플레이스홀더(예시 텍스트)도 추가하고 싶다면 튜플 형태로 사용할 수 있습니다.

```php
return [
    'user' => ['Which user ID should receive the mail?', 'E.g. 123'],
];
```

프롬프트 동작 전체를 커스터마이즈하고 싶다면, 사용자의 입력을 받아 반환하는 클로저를 사용할 수도 있습니다.

```php
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
> 더 다양한 프롬프트 유형과 사용법에 대해서는 공식 [라라벨 프롬프트](/docs/12.x/prompts) 문서를 참고하세요.

[옵션](#options) 값을 직접 선택하거나 입력받기 위한 프롬프트가 필요하다면 명령어의 `handle` 메서드 안에서 프롬프트를 사용할 수 있습니다. 하지만 필수 인수가 자동 프롬프트된 상황에서만 추가 프롬프트를 띄우고 싶다면 `afterPromptingForMissingArguments` 메서드를 구현하면 됩니다.

```php
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
## 명령어 입출력

<a name="retrieving-input"></a>
### 입력값 가져오기

명령어가 실행되는 도중, 명령어에 전달된 인수와 옵션의 값을 접근해야 하는 경우가 많습니다. 이런 경우 `argument`와 `option` 메서드를 사용할 수 있습니다. 만약 해당 인수나 옵션이 존재하지 않으면 `null`이 반환됩니다.

```php
/**
 * Execute the console command.
 */
public function handle(): void
{
    $userId = $this->argument('user');
}
```

모든 인수를 `array`로 받아오고 싶을 땐 `arguments` 메서드를 호출하면 됩니다.

```php
$arguments = $this->arguments();
```

옵션도 인수와 마찬가지로 `option` 메서드로 접근합니다. 모든 옵션을 배열로 받으려면 `options` 메서드를 사용할 수 있습니다.

```php
// 특정 옵션 가져오기...
$queueName = $this->option('queue');

// 모든 옵션을 배열로 가져오기...
$options = $this->options();
```

<a name="prompting-for-input"></a>

### 입력 요청하기

> [!NOTE]
> [Laravel Prompts](/docs/12.x/prompts)는 명령줄 애플리케이션에 브라우저와 유사한 자리 표시자 텍스트, 유효성 검증 등 아름답고 사용자 친화적인 폼을 추가할 수 있게 해주는 PHP 패키지입니다.

출력만 제공하는 것 외에도, 명령어 실행 중에 사용자로부터 입력을 받을 수도 있습니다. `ask` 메서드는 지정한 질문을 사용자에게 보여주고, 사용자의 입력을 받아, 그 입력 값을 다시 명령어 내에서 사용할 수 있도록 반환합니다.

```php
/**
 * Execute the console command.
 */
public function handle(): void
{
    $name = $this->ask('What is your name?');

    // ...
}
```

`ask` 메서드는 선택적으로 두 번째 인수를 받을 수 있으며, 사용자가 아무런 입력을 하지 않았을 때 반환될 기본값을 지정할 수 있습니다.

```php
$name = $this->ask('What is your name?', 'Taylor');
```

`secret` 메서드는 `ask`와 유사하지만, 사용자가 입력하는 내용이 콘솔에 표시되지 않습니다. 이 메서드는 비밀번호와 같은 민감한 정보를 입력받을 때 유용합니다.

```php
$password = $this->secret('What is the password?');
```

<a name="asking-for-confirmation"></a>
#### 확인 요청하기

사용자에게 단순한 "예/아니오" 형태의 확인을 받고 싶다면, `confirm` 메서드를 사용할 수 있습니다. 기본적으로 이 메서드는 `false`를 반환합니다. 하지만, 사용자가 프롬프트에 `y` 또는 `yes`라고 답하면, 이 메서드는 `true`를 반환합니다.

```php
if ($this->confirm('Do you wish to continue?')) {
    // ...
}
```

필요하다면, `confirm` 메서드의 두 번째 인수로 `true`를 전달하여, 기본 선택값이 `true`가 되도록 지정할 수도 있습니다.

```php
if ($this->confirm('Do you wish to continue?', true)) {
    // ...
}
```

<a name="auto-completion"></a>
#### 자동 완성

`anticipate` 메서드를 이용하면 입력값에 대해 자동 완성 힌트를 제공할 수 있습니다. 사용자는 자동 완성 힌트와 상관없이 원하는 값을 직접 입력할 수도 있습니다.

```php
$name = $this->anticipate('What is your name?', ['Taylor', 'Dayle']);
```

또는, `anticipate` 메서드의 두 번째 인수로 클로저를 전달할 수도 있습니다. 이 클로저는 사용자가 입력할 때마다 호출됩니다. 클로저는 지금까지 사용자가 입력한 문자열을 인수로 받아, 자동 완성을 위한 옵션 배열을 반환해야 합니다.

```php
use App\Models\Address;

$name = $this->anticipate('What is your address?', function (string $input) {
    return Address::whereLike('name', "{$input}%")
        ->limit(5)
        ->pluck('name')
        ->all();
});
```

<a name="multiple-choice-questions"></a>
#### 다중 선택 질의

사용자에게 미리 정해진 여러 선택지 중 하나를 고르도록 할 경우, `choice` 메서드를 사용할 수 있습니다. 세 번째 인수로 사용자가 아무 것도 선택하지 않았을 때 반환될 기본값의 배열 인덱스를 지정할 수 있습니다.

```php
$name = $this->choice(
    'What is your name?',
    ['Taylor', 'Dayle'],
    $defaultIndex
);
```

또한, 네 번째와 다섯 번째 인수로 각각 유효한 응답을 선택할 수 있는 최대 시도 횟수와 여러 개의 선택이 허용되는지 여부를 지정할 수 있습니다.

```php
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

콘솔로 출력을 보낼 때는 `line`, `info`, `comment`, `question`, `warn`, `error` 메서드를 사용할 수 있습니다. 각 메서드는 목적에 맞게 적절한 ANSI 색상을 적용해 메시지를 표시합니다. 예를 들어, 일반적인 정보를 사용자에게 안내하고 싶다면 `info` 메서드를 사용하면 되며, 이 메시지는 일반적으로 콘솔에서 초록색으로 표시됩니다.

```php
/**
 * Execute the console command.
 */
public function handle(): void
{
    // ...

    $this->info('The command was successful!');
}
```

오류 메시지를 표시하려면 `error` 메서드를 사용하세요. 오류 메시지는 일반적으로 빨간색으로 표시됩니다.

```php
$this->error('Something went wrong!');
```

`line` 메서드를 이용하면 색상이 없는 일반 텍스트를 출력할 수 있습니다.

```php
$this->line('Display this on the screen');
```

`newLine` 메서드를 사용하면 빈 줄을 출력할 수 있습니다.

```php
// 공백 한 줄 출력
$this->newLine();

// 공백 세 줄 출력
$this->newLine(3);
```

<a name="tables"></a>
#### 테이블

`table` 메서드를 사용하면 여러 행과 열로 구성된 데이터를 손쉽게 올바른 형태로 보여줄 수 있습니다. 열 이름과 데이터 배열만 전달하면, Laravel이 적절한 테이블 가로·세로 크기를 자동으로 계산해서 출력합니다.

```php
use App\Models\User;

$this->table(
    ['Name', 'Email'],
    User::all(['name', 'email'])->toArray()
);
```

<a name="progress-bars"></a>
#### 진행률 표시줄

실행 시간이 긴 작업을 진행할 때는, 진행 상황을 사용자에게 보여주는 진행률 표시줄이 유용할 수 있습니다. `withProgressBar` 메서드를 이용해 반복적으로 처리되는 값마다 진행률을 표시할 수 있습니다.

```php
use App\Models\User;

$users = $this->withProgressBar(User::all(), function (User $user) {
    $this->performTask($user);
});
```

좀 더 세밀하게 진행률 표시를 제어하고 싶다면, 먼저 전체 반복 횟수를 지정한 뒤 각 작업이 끝날 때마다 표시줄을 직접 진행시킬 수 있습니다.

```php
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
> 더 다양한 고급 옵션을 원한다면 [Symfony Progress Bar 컴포넌트 문서](https://symfony.com/doc/current/components/console/helpers/progressbar.html)를 참고하세요.

<a name="registering-commands"></a>
## 명령어 등록하기

기본적으로 라라벨은 `app/Console/Commands` 디렉토리 내의 모든 명령어를 자동으로 등록합니다. 그러나, 애플리케이션의 `bootstrap/app.php` 파일에서 `withCommands` 메서드를 사용해 Artisan 명령어를 검색할 다른 디렉토리를 지정할 수도 있습니다.

```php
->withCommands([
    __DIR__.'/../app/Domain/Orders/Commands',
])
```

필요하다면, `withCommands` 메서드에 명령어 클래스명을 직접 지정해서 수동으로 명령어를 등록할 수도 있습니다.

```php
use App\Domain\Orders\Commands\SendEmails;

->withCommands([
    SendEmails::class,
])
```

Artisan이 부팅될 때, 애플리케이션의 모든 명령어는 [서비스 컨테이너](/docs/12.x/container)를 통해 해결(resolved)되어 Artisan에 등록됩니다.

<a name="programmatically-executing-commands"></a>
## 코드에서 프로그램적으로 명령어 실행하기

때때로, CLI 외부에서 Artisan 명령어를 실행해야 할 수도 있습니다. 예를 들어, 라우트나 컨트롤러에서 Artisan 명령어를 실행하고자 할 때가 있습니다. 이럴 때는 `Artisan` 파사드의 `call` 메서드를 사용할 수 있습니다. `call` 메서드는 첫 번째 인수에 명령어의 시그니처 이름이나 클래스명을, 두 번째 인수에 명령어의 매개변수가 담긴 배열을 전달받으며, 종료 코드를 반환합니다.

```php
use Illuminate\Support\Facades\Artisan;

Route::post('/user/{user}/mail', function (string $user) {
    $exitCode = Artisan::call('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    // ...
});
```

또는, 전체 Artisan 명령어를 문자열로 `call` 메서드에 전달할 수도 있습니다.

```php
Artisan::call('mail:send 1 --queue=default');
```

<a name="passing-array-values"></a>
#### 배열 값 전달하기

만약 명령어에서 배열을 받을 수 있는 옵션을 정의한 경우, 해당 옵션에 배열 값을 전달할 수 있습니다.

```php
use Illuminate\Support\Facades\Artisan;

Route::post('/mail', function () {
    $exitCode = Artisan::call('mail:send', [
        '--id' => [5, 13]
    ]);
});
```

<a name="passing-boolean-values"></a>
#### 불리언 값 전달하기

문자열이 아닌 값을 받는 옵션(예: `migrate:refresh` 명령어의 `--force` 플래그)에는 `true` 또는 `false` 값을 전달해야 합니다.

```php
$exitCode = Artisan::call('migrate:refresh', [
    '--force' => true,
]);
```

<a name="queueing-artisan-commands"></a>
#### Artisan 명령어 큐잉

`Artisan` 파사드의 `queue` 메서드를 이용하면, Artisan 명령어를 큐에 넣어 [큐 워커](/docs/12.x/queues)가 백그라운드에서 처리하도록 할 수도 있습니다. 이 메서드를 사용하기 전에, 큐 설정을 완료하고 큐 리스너가 실행 중인지 확인하세요.

```php
use Illuminate\Support\Facades\Artisan;

Route::post('/user/{user}/mail', function (string $user) {
    Artisan::queue('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    // ...
});
```

`onConnection` 및 `onQueue` 메서드를 사용하면, 해당 Artisan 명령어를 보낼 커넥션과 큐를 직접 지정할 수 있습니다.

```php
Artisan::queue('mail:send', [
    'user' => 1, '--queue' => 'default'
])->onConnection('redis')->onQueue('commands');
```

<a name="calling-commands-from-other-commands"></a>
### 다른 명령어에서 명령어 호출하기

기존 Artisan 명령어 안에서 다른 명령어를 호출해야 할 때가 있습니다. 이 경우 `call` 메서드를 사용할 수 있습니다. 이 메서드는 명령어 이름과, 명령어 인수 및 옵션이 담긴 배열을 인수로 받습니다.

```php
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

다른 콘솔 명령어를 호출하되, 해당 명령어의 모든 출력을 숨기고 싶다면 `callSilently` 메서드를 사용할 수 있습니다. 이 메서드의 시그니처는 `call` 메서드와 동일합니다.

```php
$this->callSilently('mail:send', [
    'user' => 1, '--queue' => 'default'
]);
```

<a name="signal-handling"></a>
## 시그널 처리

운영체제에서는 실행 중인 프로세스에 시그널을 보낼 수 있습니다. 예를 들어, `SIGTERM` 시그널은 운영체제가 프로그램에게 종료를 요청하는 방식입니다. Artisan 콘솔 명령어에서 이러한 시그널을 감지하고 특정 코드를 실행하고자 할 때는 `trap` 메서드를 사용할 수 있습니다.

```php
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

여러 개의 시그널을 동시에 감지하고자 한다면, 배열로 전달하면 됩니다.

```php
$this->trap([SIGTERM, SIGQUIT], function (int $signal) {
    $this->shouldKeepRunning = false;

    dump($signal); // SIGTERM / SIGQUIT
});
```

<a name="stub-customization"></a>
## 스텁(stub) 커스터마이징

Artisan 콘솔의 `make` 명령어들은 컨트롤러, 잡(job), 마이그레이션, 테스트 등 다양한 클래스를 생성할 때 사용됩니다. 이러한 클래스들은 여러분의 입력값을 토대로 값이 채워지는 "스텁(stub)" 파일을 기반으로 생성됩니다. 하지만, Artisan이 생성하는 파일을 조금이라도 다르게 만들고 싶을 때가 있을 수 있습니다. 이럴 때는 `stub:publish` 명령어를 이용해 대표적인 스텁 파일들을 애플리케이션에 공개(publish) 후 직접 수정할 수 있습니다.

```shell
php artisan stub:publish
```

공개된 스텁 파일들은 애플리케이션의 루트 경로에 `stubs` 디렉토리로 생성됩니다. 여기서 수정된 내용은 이후 Artisan의 `make` 명령어로 해당 클래스를 생성할 때 반영됩니다.

<a name="events"></a>
## 이벤트

Artisan은 명령어 실행 시 다음과 같이 세 가지 이벤트를 디스패치(dispatch)합니다: `Illuminate\Console\Events\ArtisanStarting`, `Illuminate\Console\Events\CommandStarting`, 그리고 `Illuminate\Console\Events\CommandFinished`입니다. `ArtisanStarting` 이벤트는 Artisan이 실행되자마자 가장 먼저 발생합니다. 그 다음, 각 명령어가 실행되기 직전에 `CommandStarting` 이벤트가 발생합니다. 마지막으로 한 명령어의 실행이 끝나면 `CommandFinished` 이벤트가 발생합니다.