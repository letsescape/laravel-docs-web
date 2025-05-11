# 라라벨 Envoy (Laravel Envoy)

- [소개](#introduction)
- [설치](#installation)
- [작업(Task) 작성](#writing-tasks)
    - [작업 정의](#defining-tasks)
    - [여러 서버](#multiple-servers)
    - [설정](#setup)
    - [변수](#variables)
    - [스토리(Stories)](#stories)
    - [Hooks](#completion-hooks)
- [작업 실행](#running-tasks)
    - [작업 실행 전 확인](#confirming-task-execution)
- [알림](#notifications)
    - [Slack](#slack)
    - [Discord](#discord)
    - [Telegram](#telegram)
    - [Microsoft Teams](#microsoft-teams)

<a name="introduction"></a>
## 소개

[Laravel Envoy](https://github.com/laravel/envoy)는 원격 서버에서 반복적으로 실행하는 작업들을 쉽게 처리할 수 있게 도와주는 도구입니다. [Blade](/docs/blade) 스타일의 문법을 사용하여, 배포(deployment), Artisan 명령어 실행 등 다양한 작업을 손쉽게 정의할 수 있습니다. Envoy는 현재 Mac 및 Linux 운영체제만 공식적으로 지원하지만, [WSL2](https://docs.microsoft.com/en-us/windows/wsl/install-win10)를 활용해 Windows 환경에서도 사용할 수 있습니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 관리자를 이용해 Envoy를 프로젝트에 설치합니다.

```shell
composer require laravel/envoy --dev
```

설치가 완료되면, 애플리케이션의 `vendor/bin` 디렉터리 안에 Envoy 실행 파일이 생성됩니다.

```shell
php vendor/bin/envoy
```

<a name="writing-tasks"></a>
## 작업(Task) 작성

<a name="defining-tasks"></a>
### 작업 정의

작업(Task)은 Envoy의 가장 기본적인 단위입니다. 각 작업은 원격 서버에서 실제로 실행되어야 하는 셸 명령어들을 정의합니다. 예를 들어, 모든 큐 작업자 서버에서 `php artisan queue:restart` 명령어를 실행하는 작업을 만들 수 있습니다.

모든 Envoy 작업은 애플리케이션 루트 경로에 위치한 `Envoy.blade.php` 파일에 정의되어야 합니다. 아래는 참고할 수 있는 예시입니다.

```blade
@servers(['web' => ['user@192.168.1.1'], 'workers' => ['user@192.168.1.2']])

@task('restart-queues', ['on' => 'workers'])
    cd /home/user/example.com
    php artisan queue:restart
@endtask
```

이 예시에서 볼 수 있듯이, 파일 상단에 `@servers` 배열이 정의되어 있습니다. 이를 통해 작업 선언 시 `on` 옵션에서 해당 서버를 참조할 수 있습니다. `@servers` 선언은 항상 한 줄로 작성해야 하며, `@task` 정의 안에는 해당 작업이 실행될 때 실행할 셸 명령어들을 넣어주면 됩니다.

<a name="local-tasks"></a>
#### 로컬 작업

서버의 IP 주소를 `127.0.0.1`로 지정하면, 작업을 자신의 로컬 컴퓨터에서 실행하도록 강제할 수 있습니다.

```blade
@servers(['localhost' => '127.0.0.1'])
```

<a name="importing-envoy-tasks"></a>
#### Envoy 작업 가져오기

`@import` 지시어를 활용하면, 다른 Envoy 파일을 가져와서 그 안에 정의된 스토리와 작업들을 현재 Envoy 파일에 추가할 수 있습니다. 이렇게 가져온 작업들은 본인 Envoy 파일에 선언된 것처럼 실행할 수 있습니다.

```blade
@import('vendor/package/Envoy.blade.php')
```

<a name="multiple-servers"></a>
### 여러 서버

Envoy를 사용하면 하나의 작업(Task)을 여러 서버에 동시에 실행하기가 매우 쉽습니다. 먼저, `@servers` 선언에 실행 대상 서버들을 추가합니다. 각 서버에는 고유한 이름을 부여해야 합니다. 이후, 작업의 `on` 배열에 각 서버 이름을 나열하면 됩니다.

```blade
@servers(['web-1' => '192.168.1.1', 'web-2' => '192.168.1.2'])

@task('deploy', ['on' => ['web-1', 'web-2']])
    cd /home/user/example.com
    git pull origin {{ $branch }}
    php artisan migrate --force
@endtask
```

<a name="parallel-execution"></a>
#### 병렬 실행

기본적으로, 작업은 각 서버에서 순차적으로(직렬로) 실행됩니다. 즉, 첫 번째 서버에서 작업이 끝난 후 두 번째 서버에서 실행을 시작합니다. 여러 서버에 작업을 동시에 병렬로 실행하고 싶다면, 작업 선언의 옵션에 `parallel`을 추가해주면 됩니다.

```blade
@servers(['web-1' => '192.168.1.1', 'web-2' => '192.168.1.2'])

@task('deploy', ['on' => ['web-1', 'web-2'], 'parallel' => true])
    cd /home/user/example.com
    git pull origin {{ $branch }}
    php artisan migrate --force
@endtask
```

<a name="setup"></a>
### 설정

작업 실행 전에 임의의 PHP 코드를 실행하고 싶을 때는 `@setup` 지시어를 사용하면 됩니다. 이 블록 안에 있는 코드는 작업 실행 전에 먼저 실행됩니다.

```php
@setup
    $now = new DateTime;
@endsetup
```

만약 작업 실행 전에 다른 PHP 파일을 로드해야 한다면, `Envoy.blade.php` 파일 상단에 `@include` 지시어를 사용할 수 있습니다.

```blade
@include('vendor/autoload.php')

@task('restart-queues')
    # ...
@endtask
```

<a name="variables"></a>
### 변수

필요하다면, Envoy 작업을 실행할 때 커맨드 라인 인수로 값을 전달할 수 있습니다.

```shell
php vendor/bin/envoy run deploy --branch=master
```

이렇게 전달한 옵션들은 Blade의 `{{ }}` 구문을 통해 각 작업 내에서 사용할 수 있습니다. 또한, 작업 안에서 Blade의 `if`문과 반복문 등도 활용할 수 있습니다. 예를 들어, `$branch` 변수가 있을 때만 `git pull` 명령어를 실행할 수 있습니다.

```blade
@servers(['web' => ['user@192.168.1.1']])

@task('deploy', ['on' => 'web'])
    cd /home/user/example.com

    @if ($branch)
        git pull origin {{ $branch }}
    @endif

    php artisan migrate --force
@endtask
```

<a name="stories"></a>
### 스토리(Stories)

스토리는 여러 개의 작업(Task)을 하나의 이름으로 묶어주는 기능입니다. 예를 들어, `deploy` 스토리 안에 `update-code` 작업과 `install-dependencies` 작업을 나열해두면, 이 스토리 이름만으로 두 작업을 연달아 실행할 수 있습니다.

```blade
@servers(['web' => ['user@192.168.1.1']])

@story('deploy')
    update-code
    install-dependencies
@endstory

@task('update-code')
    cd /home/user/example.com
    git pull origin master
@endtask

@task('install-dependencies')
    cd /home/user/example.com
    composer install
@endtask
```

스토리가 추가되었다면, 작업을 실행하는 것과 동일하게 아래와 같이 명령어로 실행할 수 있습니다.

```shell
php vendor/bin/envoy run deploy
```

<a name="completion-hooks"></a>
### Hooks

작업(Task)과 스토리(Story)가 실행될 때 다양한 "후킹(hook)" 포인트를 활용할 수 있습니다. Envoy에서 지원하는 Hook 종류는 `@before`, `@after`, `@error`, `@success`, `@finished`입니다. 이 Hook 안에 들어가는 코드는 모두 PHP로 해석되어 원격 서버가 아닌 **로컬 환경**에서 실행됩니다.

각각의 Hook은 원하는 만큼 정의할 수 있으며, Envoy 스크립트에서 선언된 순서대로 차례로 실행됩니다.

<a name="hook-before"></a>
#### `@before`

각 작업이 실행되기 전에, Envoy 파일에 등록된 모든 `@before` Hook이 실행됩니다. 이때 Hook 코드에 실행될 작업 이름이 전달됩니다.

```blade
@before
    if ($task === 'deploy') {
        // ...
    }
@endbefore
```

<a name="completion-after"></a>
#### `@after`

각 작업이 실행된 후, Envoy 파일에 등록된 모든 `@after` Hook이 실행됩니다. `@after` Hook에는 실행이 끝난 작업 이름이 전달됩니다.

```blade
@after
    if ($task === 'deploy') {
        // ...
    }
@endafter
```

<a name="completion-error"></a>
#### `@error`

작업이 실패(종료 코드가 0보다 큰 값)할 경우, Envoy 파일에 등록한 모든 `@error` Hook이 실행됩니다. 이때도 마찬가지로 실행된 작업 이름이 전달됩니다.

```blade
@error
    if ($task === 'deploy') {
        // ...
    }
@enderror
```

<a name="completion-success"></a>
#### `@success`

모든 작업이 에러 없이 정상적으로 완료되면, Envoy 파일에 등록된 모든 `@success` Hook이 실행됩니다.

```blade
@success
    // ...
@endsuccess
```

<a name="completion-finished"></a>
#### `@finished`

모든 작업이 종료된 뒤(성공/실패 여부에 관계없이), Envoy에 정의된 모든 `@finished` Hook이 실행됩니다. 이때 완료된 작업의 exit code(종료 코드)가 `null` 혹은 0 이상의 정수값으로 전달됩니다.

```blade
@finished
    if ($exitCode > 0) {
        // 한 작업에서 오류가 있었습니다...
    }
@endfinished
```

<a name="running-tasks"></a>
## 작업 실행

애플리케이션의 `Envoy.blade.php` 파일에 정의된 작업 또는 스토리를 실행하려면, Envoy의 `run` 명령어에 해당 작업 또는 스토리의 이름을 인수로 전달합니다. Envoy는 해당 작업을 실행하면서 원격 서버에서 발생하는 출력을 실시간으로 보여줍니다.

```shell
php vendor/bin/envoy run deploy
```

<a name="confirming-task-execution"></a>
### 작업 실행 전 확인

서버에서 작업을 실행하기 전에 사용자에게 실행 여부를 확인받고 싶을 때, 해당 작업 선언에 `confirm` 옵션을 추가하면 됩니다. 이 옵션은 특히 데이터 삭제 등 파괴적인 작업에 사용할 때 유용합니다.

```blade
@task('deploy', ['on' => 'web', 'confirm' => true])
    cd /home/user/example.com
    git pull origin {{ $branch }}
    php artisan migrate
@endtask
```

<a name="notifications"></a>
## 알림

<a name="slack"></a>
### Slack

Envoy는 각 작업이 실행된 후 [Slack](https://slack.com)으로 알림 메시지를 보낼 수 있습니다. `@slack` 지시어는 Slack의 웹훅 URL과 채널/유저 이름을 인수로 받습니다. Slack 제어판에서 "Incoming WebHooks" 통합을 통해 웹훅 URL을 생성할 수 있습니다.

첫 번째 인수로 전체 웹훅 URL을, 두 번째 인수로는 채널 이름(`#channel`) 또는 사용자 이름(`@user`)을 전달합니다.

```blade
@finished
    @slack('webhook-url', '#bots')
@endfinished
```

기본적으로 Envoy 알림 메시지는 작업이 실행되었음을 설명하는 메시지를 해당 채널에 전송합니다. 하지만, 세 번째 인수로 직접 메시지를 지정해주면 원하는 메시지로 덮어쓸 수 있습니다.

```blade
@finished
    @slack('webhook-url', '#bots', 'Hello, Slack.')
@endfinished
```

<a name="discord"></a>
### Discord

Envoy는 [Discord](https://discord.com)에도 작업 실행 후 알림을 보낼 수 있습니다. `@discord` 지시어는 Discord의 웹훅 URL과 메시지를 인수로 받습니다. Discord 서버 설정에서 "Webhook"을 생성해 사용할 채널에 연결한 뒤, 해당 Webhook URL을 지시어에 전달하면 됩니다.

```blade
@finished
    @discord('discord-webhook-url')
@endfinished
```

<a name="telegram"></a>
### Telegram

Envoy는 [Telegram](https://telegram.org)에도 작업 실행 후 알림 전송이 가능합니다. `@telegram` 지시어는 Telegram의 Bot ID와 Chat ID를 인수로 받습니다. [BotFather](https://t.me/botfather)를 통해 새 봇을 만든 후 Bot ID를 확인할 수 있습니다. [@username_to_id_bot](https://t.me/username_to_id_bot)을 사용해 올바른 Chat ID를 조회할 수 있습니다.

```blade
@finished
    @telegram('bot-id','chat-id')
@endfinished
```

<a name="microsoft-teams"></a>
### Microsoft Teams

Envoy는 [Microsoft Teams](https://www.microsoft.com/en-us/microsoft-teams)와도 연동되어 작업 실행 후 알림을 보낼 수 있습니다. `@microsoftTeams` 지시어는 반드시 Teams Webhook(필수), 메시지, 테마 색상(success, info, warning, error), 그리고 옵션 배열을 인수로 받을 수 있습니다. Teams Webhook은 [incoming webhook](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook)을 생성해 얻을 수 있습니다. Teams API에서는 메시지 상자의 제목, 요약, 섹션 등 다양한 속성으로 커스텀할 수 있으며, 더 자세한 사항은 [Microsoft Teams 공식 문서](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using?tabs=cURL#example-of-connector-message)를 참고해 주세요. Webhook URL 전체를 `@microsoftTeams` 지시어에 인수로 전달하면 됩니다.

```blade
@finished
    @microsoftTeams('webhook-url')
@endfinished
```