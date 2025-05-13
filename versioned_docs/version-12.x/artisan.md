# 아티즌 콘솔 (Artisan Console)

- [소개](#introduction)
    - [Tinker (REPL)](#tinker)
- [명령어 작성](#writing-commands)
    - [명령어 생성](#generating-commands)
    - [명령어 구조](#command-structure)
    - [클로저 명령어](#closure-commands)
    - [Isolatable 명령어](#isolatable-commands)
- [입력값 정의](#defining-input-expectations)
    - [인수](#arguments)
    - [옵션](#options)
    - [입력 배열](#input-arrays)
    - [입력 설명](#input-descriptions)
    - [누락된 입력값 프롬프트](#prompting-for-missing-input)
- [명령어 입출력](#command-io)
    - [입력값 조회](#retrieving-input)
    - [입력값 프롬프트](#prompting-for-input)
    - [출력 작성](#writing-output)
- [명령어 등록](#registering-commands)
- [프로그램적으로 명령어 실행](#programmatically-executing-commands)
    - [다른 명령어에서 명령어 호출](#calling-commands-from-other-commands)
- [시그널 핸들링](#signal-handling)
- [스텁 커스터마이즈](#stub-customization)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

아티즌(Artisan)은 라라벨에 기본 포함된 명령줄 인터페이스입니다. 아티즌은 애플리케이션 루트 경로에 `artisan` 스크립트로 존재하며, 애플리케이션을 개발할 때 유용하게 사용할 수 있는 다양한 명령어를 제공합니다. 사용 가능한 모든 아티즌 명령어 목록을 확인하려면 `list` 명령어를 사용할 수 있습니다.

```shell
php artisan list
```

모든 명령어에는 명령어가 받을 수 있는 인수와 옵션을 보여주는 "도움말(help)" 화면이 있습니다. 도움말 화면을 보려면, 명령어 이름 앞에 `help`를 붙여 실행하면 됩니다.

```shell
php artisan help migrate
```

<a name="laravel-sail"></a>
#### Laravel Sail

로컬 개발 환경으로 [Laravel Sail](/docs/sail)을 사용하는 경우, 아티즌 명령어를 실행할 때는 반드시 `sail` 커맨드를 통해 실행해야 합니다. Sail을 사용하면, 애플리케이션의 Docker 컨테이너 안에서 아티즌 명령어가 실행됩니다.

```shell
./vendor/bin/sail artisan list
```

<a name="tinker"></a>
### Tinker (REPL)

[Laravel Tinker](https://github.com/laravel/tinker)는 라라벨 프레임워크를 위한 강력한 REPL(대화형 셸) 도구입니다. [PsySH](https://github.com/bobthecow/psysh) 패키지를 기반으로 동작합니다.

<a name="installation"></a>
#### 설치

라라벨 애플리케이션에는 기본적으로 Tinker가 포함되어 있습니다. 만약 Tinker를 이전에 제거했다면, Composer를 통해 다시 설치할 수 있습니다.

```shell
composer require laravel/tinker
```

> [!NOTE]
> 라라벨 애플리케이션에서 핫 리로딩, 여러 줄 코드 편집, 자동완성 기능을 찾고 계신가요? [Tinkerwell](https://tinkerwell.app)을 확인해보세요!

<a name="usage"></a>
#### 사용법

Tinker를 사용하면 명령줄에서 애플리케이션 전체에 직접 접근할 수 있으며, Eloquent 모델, 잡, 이벤트 등 다양한 라라벨 기능을 실시간으로 다루는 것이 가능합니다. Tinker 환경에 진입하려면 `tinker` 아티즌 명령어를 실행하세요.

```shell
php artisan tinker
```

Tinker의 설정 파일은 `vendor:publish` 명령어로 배포할 수 있습니다.

```shell
php artisan vendor:publish --provider="Laravel\Tinker\TinkerServiceProvider"
```

> [!WARNING]
> `dispatch` 헬퍼 함수와 `Dispatchable` 클래스의 `dispatch` 메서드는 잡을 큐에 올릴 때 가비지 컬렉션에 의존합니다. 따라서 Tinker를 사용할 때는 잡(dispatch)을 위해 `Bus::dispatch`나 `Queue::push`를 사용해야 합니다.

<a name="command-allow-list"></a>
#### 허용 명령어 목록

Tinker는, Tinker 셸에서 실행 가능한 아티즌 명령어를 판단하기 위해 "허용(allow) 리스트"를 사용합니다. 기본적으로 `clear-compiled`, `down`, `env`, `inspire`, `migrate`, `migrate:install`, `up`, `optimize` 명령어가 실행 가능하도록 허용되어 있습니다. 더 많은 명령어를 허용하고 싶다면, `tinker.php` 설정 파일의 `commands` 배열에 해당 명령어를 추가하면 됩니다.

```php
'commands' => [
    // App\Console\Commands\ExampleCommand::class,
],
```

<a name="classes-that-should-not-be-aliased"></a>
#### 별칭을 자동으로 생성하지 않을 클래스

일반적으로, Tinker는 Tinker에서 상호작용할 때 클래스의 별칭(alias)을 자동으로 생성합니다. 그러나 일부 클래스는 별칭을 생성하지 않도록 설정할 수 있습니다. 이를 위해 `tinker.php` 설정 파일의 `dont_alias` 배열에 해당 클래스를 추가하면 됩니다.

```php
'dont_alias' => [
    App\Models\User::class,
],
```

<a name="writing-commands"></a>
## 명령어 작성

아티즌이 제공하는 명령어 외에, 사용자 정의 명령어를 직접 만들 수도 있습니다. 명령어 클래스는 일반적으로 `app/Console/Commands` 디렉터리에 저장하며, Composer에서 오토로드할 수 있다면 다른 경로를 사용해도 무방합니다.

<a name="generating-commands"></a>
### 명령어 생성

새로운 명령어를 만들 때는 `make:command` 아티즌 명령어를 사용합니다. 이 명령어를 실행하면 `app/Console/Commands` 디렉터리에 새 명령어 클래스가 생성됩니다. 만약 해당 디렉터리가 없다면, 명령어 실행 시 자동으로 생성됩니다.

```shell
php artisan make:command SendEmails
```

<a name="command-structure"></a>
### 명령어 구조

명령어를 생성한 후에는, 클래스의 `signature`와 `description` 속성에 적절한 값을 지정해야 합니다. 이 속성들은 `list` 화면에 명령어를 표시할 때 사용됩니다. 또한 `signature` 속성을 통해 [명령어의 입력값 정의](#defining-input-expectations)도 할 수 있습니다. 명령어가 실행되면 `handle` 메서드가 호출되며, 실제 명령어 로직을 이 메서드에 작성하면 됩니다.

예제 명령어를 살펴보겠습니다. 여기서는 필요한 의존성을 명령어의 `handle` 메서드로 요청할 수 있다는 것에 주목하세요. 라라벨의 [서비스 컨테이너](/docs/container)는 이 메서드의 시그니처에 타입힌트된 모든 의존성을 자동으로 주입해줍니다.

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
> 코드 재사용성을 높이려면, 콘솔 명령어 클래스 자체를 최대한 가볍게 작성하고, 실제 작업 수행은 애플리케이션 서비스에 위임하는 것이 좋습니다. 위의 예제에서도 이메일 전송의 "실질적인 로직"은 서비스 클래스로 분리해서 주입하고 있습니다.

<a name="exit-codes"></a>
#### 종료 코드(Exit Codes)

`handle` 메서드가 아무 것도 반환하지 않으면서 명령어가 정상적으로 실행될 경우, 종료 코드로 `0`이 반환되어 성공을 나타냅니다. 하지만 필요하다면 `handle` 메서드에서 정수(integer)를 반환해 명령어의 종료 코드를 직접 지정할 수도 있습니다.

```php
$this->error('Something went wrong.');

return 1;
```

명령어의 어떤 메서드에서든 "실패" 상태로 즉시 종료시키고 싶다면, `fail` 메서드를 사용할 수 있습니다. 이 메서드는 즉시 실행을 중단하고 종료 코드 1을 반환합니다.

```php
$this->fail('Something went wrong.');
```

<a name="closure-commands"></a>
### 클로저 명령어

클래스 기반으로 명령어를 정의하는 대신, 클로저 기반으로 명령어를 정의할 수도 있습니다. 라우터에서 컨트롤러 대신 클로저를 사용할 수 있는 것과 비슷하게, 명령어도 클로저를 대안으로 활용할 수 있습니다.

`routes/console.php` 파일은 HTTP 라우트를 정의하진 않지만, 애플리케이션 내에서 콘솔용 엔트리 포인트(라우트)를 정의합니다. 이 파일에서 `Artisan::command` 메서드를 사용해 클로저 기반 콘솔 명령어를 정의할 수 있습니다. `command` 메서드는 두 개의 인수, 즉 [명령어 시그니처](#defining-input-expectations)와 명령어의 인수와 옵션을 받는 클로저를 입력받습니다.

```php
Artisan::command('mail:send {user}', function (string $user) {
    $this->info("Sending email to: {$user}!");
});
```

클로저는 내부적으로 명령어 인스턴스에 바인딩되어 있으므로, 일반적인 명령어 클래스에서 사용할 수 있는 헬퍼 메서드에 모두 접근할 수 있습니다.

<a name="type-hinting-dependencies"></a>
#### 의존성 타입힌트

명령어의 인수와 옵션 외에도, 클로저에서 추가적인 의존성을 타입힌트하여 [서비스 컨테이너](/docs/container)에서 주입받을 수 있습니다.

```php
use App\Models\User;
use App\Support\DripEmailer;

Artisan::command('mail:send {user}', function (DripEmailer $drip, string $user) {
    $drip->send(User::find($user));
});
```

<a name="closure-command-descriptions"></a>
#### 클로저 명령어 설명

클로저 기반 명령어를 정의할 때는, `purpose` 메서드를 사용해 해당 명령어의 설명을 추가할 수 있습니다. 이 설명은 `php artisan list` 또는 `php artisan help` 명령어 실행 시 표시됩니다.

```php
Artisan::command('mail:send {user}', function (string $user) {
    // ...
})->purpose('Send a marketing email to a user');
```

<a name="isolatable-commands"></a>
### Isolatable 명령어

> [!WARNING]
> 이 기능을 사용하려면, 애플리케이션의 기본 캐시 드라이버로 `memcached`, `redis`, `dynamodb`, `database`, `file`, 또는 `array` 캐시 드라이버 중 하나를 사용해야 합니다. 또한, 모든 서버가 동일한 중앙 캐시 서버와 통신해야 합니다.

하나의 명령어 인스턴스만 동시에 실행되도록 제한하고 싶을 때가 있습니다. 이를 위해, 명령어 클래스에서 `Illuminate\Contracts\Console\Isolatable` 인터페이스를 구현하면 됩니다.

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

명령어가 `Isolatable`로 마크되면, 라라벨은 해당 명령어에 자동으로 `--isolated` 옵션을 추가합니다. 명령어 실행 시 해당 옵션을 붙이면, 이미 실행 중인 인스턴스가 존재하지 않는지 라라벨이 검사합니다. 이 과정에서 애플리케이션의 기본 캐시 드라이버를 이용해 원자적(atomic) 락을 획득하려 시도하며, 만약 이미 실행 중인 인스턴스가 있다면 명령어는 실행되지 않고 성공 상태 코드로 종료됩니다.

```shell
php artisan mail:send 1 --isolated
```

명령어 실행이 거부될 때 반환할 종료 코드(status code)를 직접 지정하고 싶다면, `--isolated` 옵션에 원하는 코드값을 지정할 수 있습니다.

```shell
php artisan mail:send 1 --isolated=12
```

<a name="lock-id"></a>
#### Lock ID

기본적으로 라라벨은 명령어 이름을 사용하여 캐시에서 원자적 락에 사용될 문자열 키를 생성합니다. 하지만 명령어의 인수나 옵션을 포함하여 이 키를 직접 커스터마이즈하고 싶으면, 명령어 클래스에 `isolatableId` 메서드를 정의하면 됩니다.

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
#### 락 만료 시각 조정

기본적으로, 격리(isolation) 락은 명령어가 실행을 마침과 동시에 해제되며, 실행이 중단되었을 경우에도 한 시간 후 자동 만료됩니다. 만약 락의 만료 시점을 조정하고 싶다면, `isolationLockExpiresAt` 메서드를 정의해 반환하면 됩니다.

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
## 입력값 정의

콘솔 명령어를 작성할 때, 사용자로부터 인수나 옵션으로 입력값을 받아야 할 일이 많습니다. 라라벨은 명령어 클래스의 `signature` 속성을 이용해, 명령어가 기대하는 입력값(이름, 인수, 옵션 등)을 간단하고 명확하게 한 줄로 정의할 수 있도록 지원합니다.

<a name="arguments"></a>
### 인수

사용자로부터 입력받는 모든 인수와 옵션은 중괄호로 감쌉니다. 예를 들어, 아래 명령어는 필수 인수로 `user`를 받도록 정의되어 있습니다.

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user}';
```

인수를 선택사항으로 지정하거나, 기본값을 부여할 수도 있습니다.

```php
// 인수를 선택값으로 지정...
'mail:send {user?}'

// 선택 인수에 기본값 지정...
'mail:send {user=foo}'
```

<a name="options"></a>
### 옵션

옵션 역시 인수와 유사하게 사용자 입력값의 한 형태입니다. 옵션은 명령줄에서 두 개의 하이픈(`--`)으로 시작해서 전달합니다. 옵션에는 값을 받는 경우와, 값을 받지 않고 단순히 켜고끄는(boolean) "스위치"처럼 동작하는 경우가 있습니다. 아래는 후자의 예입니다.

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue}';
```

여기서 `--queue` 옵션을 명령어 실행 시 지정할 수 있으며, 지정되었다면 값은 `true`, 없으면 `false`가 됩니다.

```shell
php artisan mail:send 1 --queue
```

<a name="options-with-values"></a>
#### 값을 받는 옵션

이번에는 값을 받아야 하는 옵션 예제를 살펴보겠습니다. 만약 사용자가 반드시 옵션에 값을 지정해야 한다면, 옵션명 뒤에 `=` 기호를 붙여서 정의합니다.

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue=}';
```

이 예제에서 사용자는 아래처럼 값을 넘길 수 있습니다. 만약 옵션이 지정되지 않으면 그 값은 `null`이 됩니다.

```shell
php artisan mail:send 1 --queue=default
```

옵션에 기본값을 지정하려면, 옵션명 뒤에 값을 바로 입력하면 됩니다. 사용자가 옵션 값을 넘기지 않으면, 이 기본값이 사용됩니다.

```php
'mail:send {user} {--queue=default}'
```

<a name="option-shortcuts"></a>
#### 옵션 단축키

옵션 정의 시, 단축키를 부여하고 싶다면 옵션명 앞에 단축키를 쓰고, `|` 기호로 구분합니다.

```php
'mail:send {user} {--Q|queue}'
```

명령어 실행 시 단축키 옵션은 한 개의 하이픈으로 시작하며, 옵션값에는 `=` 없이 바로 이어 붙입니다.

```shell
php artisan mail:send 1 -Qdefault
```

<a name="input-arrays"></a>
### 입력 배열

여러 입력값을 받아야 하는 인수나 옵션을 정의하고 싶다면, `*` 문자를 사용할 수 있습니다. 우선 인수의 예제를 보겠습니다.

```php
'mail:send {user*}'
```

이렇게 정의하고 명령어를 실행하면, `user` 인수에는 전달한 값들이 배열로 저장됩니다. 예를 들어 아래처럼 입력하면 `user`에는 `[1, 2]`가 들어가게 됩니다.

```shell
php artisan mail:send 1 2
```

또한 `*` 문자를 선택 인수와 결합해, 0개 이상 값을 받을 수 있도록 할 수도 있습니다.

```php
'mail:send {user?*}'
```

<a name="option-arrays"></a>
#### 옵션 배열

여러 값을 받는 옵션을 정의하려면 각 옵션 값마다 옵션명을 붙여 전달해야 합니다.

```php
'mail:send {--id=*}'
```

이 명령어를 실행할 때는 아래처럼 여러 개의 `--id` 옵션을 전달하면 됩니다.

```shell
php artisan mail:send --id=1 --id=2
```

<a name="input-descriptions"></a>
### 입력값 설명

입력값(인수, 옵션)에 대한 설명을 추가하려면 이름과 설명 사이에 콜론을 넣으면 됩니다. 명령어 정의가 길어질 경우 여러 줄로 나누어 작성해도 됩니다.

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

명령어에 필수 인수가 포함되어 있는데 사용자가 입력하지 않을 경우, 기본적으로 에러 메시지가 표시됩니다. 대신, 필수 인수가 없을 때 자동으로 입력을 요청하도록 하려면, 명령어에 `PromptsForMissingInput` 인터페이스를 구현하면 됩니다.

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

라라벨은 누락된 입력값을 사용자에게 요청할 때, 인수명 또는 설명을 참고해 질문을 자동으로 만들어 물어봅니다. 질문 문구를 직접 지정하고 싶다면, `promptForMissingArgumentsUsing` 메서드를 구현하여, 인수명으로 키를 가지는 질문 배열을 반환하면 됩니다.

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

예시 입력값(placeholder)이 필요하다면, 질문-예시값 쌍의 튜플도 사용할 수 있습니다.

```php
return [
    'user' => ['Which user ID should receive the mail?', 'E.g. 123'],
];
```

입력 요청 프롬프트를 완전히 제어하고 싶을 땐, 사용자의 입력을 안내하고 그 결과를 반환하는 클로저를 지정할 수도 있습니다.

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
> 보다 다양한 프롬프트 기능 및 사용법은 [Laravel Prompts](/docs/prompts) 문서를 참고하세요.

[옵션](#options)과 같이 선택지를 입력받는 프롬프트가 필요하다면, `handle` 메서드 안에서 직접 프롬프트를 사용할 수도 있습니다. 하지만 사용자에게 누락된 인수를 자동 프롬프트한 이후에만 옵션 프롬프트를 추가로 띄우고 싶을 때는, `afterPromptingForMissingArguments` 메서드를 구현하면 됩니다.

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
### 입력값 조회

명령어 실행 중에, 사용자가 입력한 인수와 옵션의 값을 조회해야 할 때가 많습니다. 각각 `argument`와 `option` 메서드를 사용하면 됩니다. 인수나 옵션이 존재하지 않으면 `null`이 반환됩니다.

```php
/**
 * Execute the console command.
 */
public function handle(): void
{
    $userId = $this->argument('user');
}
```

모든 인수 값을 배열로 한번에 가져오려면 `arguments` 메서드를 사용하면 됩니다.

```php
$arguments = $this->arguments();
```

옵션 역시 `option` 메서드로 조회할 수 있습니다. 배열 전체를 조회하려면 `options` 메서드를 사용합니다.

```php
// 특정 옵션값 조회...
$queueName = $this->option('queue');

// 모든 옵션값을 배열로 조회...
$options = $this->options();
```

<a name="prompting-for-input"></a>
### 입력값 프롬프트

> [!NOTE]
> [Laravel Prompts](/docs/prompts)는 명령줄 애플리케이션에 아름답고 사용자 친화적인 폼을 추가할 수 있도록 해주는 PHP 패키지입니다. 플레이스홀더, 유효성 검사 등 브라우저 유사 기능도 제공합니다.

출력만 할 수 있는 것이 아니라, 명령어 실행 중에 사용자에게 직접 입력값을 요청할 수도 있습니다. `ask` 메서드를 사용하면 지정한 질문을 사용자에게 보여주고, 사용자가 입력한 값을 반환합니다.

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

`ask` 메서드는 사용자가 값을 입력하지 않았을 때 대신 반환할 기본값(두 번째 인자)도 받을 수 있습니다.

```php
$name = $this->ask('What is your name?', 'Taylor');
```

민감한 정보(비밀번호 등)를 입력받을 때는 입력값이 화면에 보이지 않도록 `secret` 메서드를 사용할 수 있습니다.

```php
$password = $this->secret('What is the password?');
```

<a name="asking-for-confirmation"></a>
#### 확인(yes/no) 질문

간단히 "예/아니오" 확인 입력을 받고 싶다면, `confirm` 메서드를 사용하면 됩니다. 기본적으로 이 메서드는 `false`를 반환하며, 사용자가 `y` 또는 `yes`라고 입력하면 `true`를 반환합니다.

```php
if ($this->confirm('Do you wish to continue?')) {
    // ...
}
```

필요하다면, 두 번째 인자로 `true`를 넘겨 질문의 기본값을 `true`로 설정할 수 있습니다.

```php
if ($this->confirm('Do you wish to continue?', true)) {
    // ...
}
```

<a name="auto-completion"></a>
#### 자동 완성

사용자에게 입력값을 받을 때, 가능한 선택지를 자동완성 제안으로 보여주고 싶다면 `anticipate` 메서드를 사용할 수 있습니다. 사용자는 자동완성 제안 외의 값도 입력할 수 있습니다.

```php
$name = $this->anticipate('What is your name?', ['Taylor', 'Dayle']);
```

또는 두 번째 인자에 클로저를 넘기면, 사용자가 문자를 입력할 때마다 클로저가 호출되어 동적으로 자동완성 제안 목록을 반환할 수 있습니다.

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
#### 다중 선택 질문

사전에 정의된 선택지 배열에서 값을 고르도록 하려면, `choice` 메서드를 사용할 수 있습니다. 사용자가 아무 옵션도 선택하지 않았을 때 반환될 기본값의 배열 인덱스를 세 번째 인자로 넘겨줄 수 있습니다.

```php
$name = $this->choice(
    'What is your name?',
    ['Taylor', 'Dayle'],
    $defaultIndex
);
```

또한, `choice` 메서드는 네 번째, 다섯 번째 인자로 최대 시도 횟수와 다중 선택 허용 여부도 지정할 수 있습니다.

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
### 출력 작성

콘솔에 출력을 보낼 땐 `line`, `info`, `comment`, `question`, `warn`, `error` 등의 메서드를 사용할 수 있습니다. 각 메서드는 출력 목적에 따라 적절한 ANSI 색상으로 메시지를 보여줍니다. 예를 들어, 일반적인 정보 출력에는 `info` 메서드를 쓸 수 있으며, 보통 녹색으로 표시됩니다.

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

오류 메시지를 출력하고 싶다면 `error` 메서드를 사용합니다. 이때 메시지는 빨간색으로 표시됩니다.

```php
$this->error('Something went wrong!');
```

색상 없이 평범한 텍스트를 출력하려면 `line` 메서드를 사용하면 됩니다.

```php
$this->line('Display this on the screen');
```

빈 줄을 출력하고 싶다면 `newLine` 메서드를 사용할 수 있습니다.

```php
// 빈 줄 하나 출력...
$this->newLine();

// 빈 줄 3개 출력...
$this->newLine(3);
```

<a name="tables"></a>
#### 표 출력

`table` 메서드를 사용하면, 여러 행/열을 가진 데이터를 표 형태로 보기 좋게 출력할 수 있습니다. 컬럼명과 데이터만 넘기면, 라라벨이 자동으로 표의 크기와 너비를 계산해줍니다.

```php
use App\Models\User;

$this->table(
    ['Name', 'Email'],
    User::all(['name', 'email'])->toArray()
);
```

<a name="progress-bars"></a>
#### 진행 바

실행 시간이 긴 작업에서, 현재 처리 진행 상황을 사용자가 볼 수 있도록 "진행 바(progress bar)"를 표시하는 것이 유용합니다. `withProgressBar` 메서드를 사용하면, 전달한 반복 가능한 값의 각 항목 처리마다 라라벨이 자동으로 진행 바를 갱신합니다.

```php
use App\Models\User;

$users = $this->withProgressBar(User::all(), function (User $user) {
    $this->performTask($user);
});
```

진행 바를 수동으로 제어하고 싶으면, 먼저 처리할 항목 개수로 총 스텝을 지정한 뒤, 각 항목 처리 후에 `advance` 메서드로 진행 바를 움직일 수 있습니다.

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
> 더 고급 진행 바 옵션이 필요하다면 [Symfony Progress Bar 컴포넌트 문서](https://symfony.com/doc/current/components/console/helpers/progressbar.html)를 참고하세요.

<a name="registering-commands"></a>
## 명령어 등록

라라벨은 기본적으로 `app/Console/Commands` 디렉터리 내의 모든 명령어를 자동으로 등록합니다. 이 외의 디렉터리도 아티즌 명령어로 스캔하고 싶을 때는, 애플리케이션의 `bootstrap/app.php`에서 `withCommands` 메서드를 사용할 수 있습니다.

```php
->withCommands([
    __DIR__.'/../app/Domain/Orders/Commands',
])
```

직접 명령어 클래스를 등록하고 싶다면, `withCommands` 메서드에 클래스명을 전달합니다.

```php
use App\Domain\Orders\Commands\SendEmails;

->withCommands([
    SendEmails::class,
])
```

아티즌(Artisan)이 시작될 때, 애플리케이션의 모든 명령어는 [서비스 컨테이너](/docs/container)에서 해결되고 아티즌에 등록됩니다.

<a name="programmatically-executing-commands"></a>
## 프로그램적으로 명령어 실행

CLI에서 직접 실행하지 않고, 라우트나 컨트롤러 등 다른 코드에서 아티즌 명령어를 실행하고 싶은 상황이 있을 수 있습니다. 이때는 `Artisan` 파사드의 `call` 메서드를 사용할 수 있습니다. `call`은 첫 번째 인자로 명령어의 시그니처 이름이나 클래스명을, 두 번째 인자로 명령어에 전달할 매개변수 배열을 받으며, 종료 코드를 반환합니다.

```php
use Illuminate\Support\Facades\Artisan;

Route::post('/user/{user}/mail', function (string $user) {
    $exitCode = Artisan::call('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    // ...
});
```

또는, 아티즌 명령어 전체를 문자열로 한 번에 전달할 수도 있습니다.

```php
Artisan::call('mail:send 1 --queue=default');
```

<a name="passing-array-values"></a>
#### 배열값 전달

만약 명령어에 배열 형태의 옵션을 전달해야 한다면, 값 배열을 해당 옵션에 넘기면 됩니다.

```php
use Illuminate\Support\Facades\Artisan;

Route::post('/mail', function () {
    $exitCode = Artisan::call('mail:send', [
        '--id' => [5, 13]
    ]);
});
```

<a name="passing-boolean-values"></a>
#### 불리언 값 전달

문자열 값을 받지 않는 옵션(예: `migrate:refresh` 명령어의 `--force` 플래그 등)에 값을 지정하고 싶다면, 해당 옵션에 `true` 또는 `false` 값을 넘기면 됩니다.

```php
$exitCode = Artisan::call('migrate:refresh', [
    '--force' => true,
]);
```

<a name="queueing-artisan-commands"></a>
#### 아티즌 명령어 큐 처리

`Artisan` 파사드의 `queue` 메서드를 이용하면, 아티즌 명령어를 큐로 넣어 비동기적으로 [큐 워커](/docs/queues)들이 처리할 수 있게 만들 수도 있습니다. 이 기능을 사용하기 전에 큐 설정을 마치고, 큐 리스너도 실행 중이어야 합니다.

```php
use Illuminate\Support\Facades\Artisan;

Route::post('/user/{user}/mail', function (string $user) {
    Artisan::queue('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    // ...
});
```

또한 `onConnection`, `onQueue` 메서드로 명령어를 전송할 연결(connection)이나 큐(queue)를 지정할 수 있습니다.

```php
Artisan::queue('mail:send', [
    'user' => 1, '--queue' => 'default'
])->onConnection('redis')->onQueue('commands');
```

<a name="calling-commands-from-other-commands"></a>
### 다른 명령어에서 명령어 호출

기존 아티즌 명령어(클래스) 내부에서, 다른 명령어를 호출하고 싶다면 `call` 메서드를 사용할 수 있습니다. 이 메서드는 명령어 이름과 매개변수 배열을 받습니다.

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

다른 콘솔 명령어를 호출하되, 모든 출력 결과를 숨기려면 `callSilently` 메서드를 사용할 수 있습니다. 사용법은 `call` 메서드와 동일합니다.

```php
$this->callSilently('mail:send', [
    'user' => 1, '--queue' => 'default'
]);
```

<a name="signal-handling"></a>
## 시그널 핸들링

운영체제는 실행 중인 프로세스에 계속해서 시그널(신호)를 보낼 수 있습니다. 예를 들어, `SIGTERM` 시그널은 운영체제가 프로그램에 "종료 요청"을 보내는 데 사용됩니다. 아티즌 콘솔 명령어에서 이런 시그널을 감지하고 발생 시 코드를 실행하고 싶다면, `trap` 메서드를 사용할 수 있습니다.

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

여러 개의 시그널을 동시에 감지하고 싶으면, `trap` 메서드에 배열로 전달하면 됩니다.

```php
$this->trap([SIGTERM, SIGQUIT], function (int $signal) {
    $this->shouldKeepRunning = false;

    dump($signal); // SIGTERM / SIGQUIT
});
```

<a name="stub-customization"></a>
## 스텁 커스터마이즈

아티즌 콘솔의 `make` 계열 명령어는 컨트롤러, 잡, 마이그레이션, 테스트 등 다양한 클래스를 생성합니다. 이때 사용하는 "스텁(stub)" 파일은 입력값에 따라 내용이 채워진 상태로 파일을 생성합니다. 필요한 경우, Artisan이 생성하는 파일의 내용을 직접 수정하고 싶을 수 있습니다. 이럴 땐 `stub:publish` 명령어로 애플리케이션에 자주 쓰이는 스텁 파일을 내보낸 후 수정하여 사용할 수 있습니다.

```shell
php artisan stub:publish
```

배포된 스텁 파일은 애플리케이션 루트 디렉터리의 `stubs` 폴더에 저장됩니다. 해당 스텁 파일을 수정하면, Artisan의 `make` 계열 명령어를 실행할 때마다 반영됩니다.

<a name="events"></a>
## 이벤트

아티즌은 명령어가 실행될 때 세 가지 이벤트를 발생시킵니다: `Illuminate\Console\Events\ArtisanStarting`, `Illuminate\Console\Events\CommandStarting`, `Illuminate\Console\Events\CommandFinished`. 가장 먼저, 아티즌이 실행되면 `ArtisanStarting` 이벤트가 발생합니다. 다음으로, 개별 명령어 실행 직전에 `CommandStarting` 이벤트가 발생하고, 명령어가 모두 실행을 마치면 `CommandFinished` 이벤트가 발생합니다.
