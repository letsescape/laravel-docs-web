# 라라벨 엔보이 (Laravel Envoy)

- [소개](#introduction)
- [설치](#installation)
- [태스크 작성하기](#writing-tasks)
    - [태스크 정의하기](#defining-tasks)
    - [여러 서버 사용](#multiple-servers)
    - [셋업](#setup)
    - [변수](#variables)
    - [스토리](#stories)
    - [후크](#completion-hooks)
- [태스크 실행하기](#running-tasks)
    - [태스크 실행 확인](#confirming-task-execution)
- [알림](#notifications)
    - [Slack](#slack)
    - [Discord](#discord)
    - [Telegram](#telegram)
    - [Microsoft Teams](#microsoft-teams)

<a name="introduction"></a>
## 소개

[Laravel Envoy](https://github.com/laravel/envoy)는 원격 서버에서 자주 실행하는 작업을 손쉽게 실행할 수 있도록 도와주는 도구입니다. [Blade](/docs/12.x/blade) 스타일 문법을 사용하여 배포, 아티즌 명령어 실행 등 다양한 작업을 쉽고 간단하게 정의할 수 있습니다. 현재 Envoy는 Mac과 Linux 운영체제만 지원합니다. 하지만 [WSL2](https://docs.microsoft.com/en-us/windows/wsl/install-win10)를 이용하면 Windows에서도 사용할 수 있습니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 관리자를 사용하여 프로젝트에 Envoy를 설치합니다.

```shell
composer require laravel/envoy --dev
```

Envoy가 설치되면 애플리케이션의 `vendor/bin` 디렉터리에 Envoy 바이너리가 생성됩니다.

```shell
php vendor/bin/envoy
```

<a name="writing-tasks"></a>
## 태스크 작성하기

<a name="defining-tasks"></a>
### 태스크 정의하기

태스크는 Envoy의 기본 단위입니다. 태스크는 각 작업이 호출될 때 원격 서버에서 실행할 셸 명령어를 정의합니다. 예를 들어, 애플리케이션의 큐 워커 서버 전체에서 `php artisan queue:restart` 명령어를 실행하는 태스크를 만들 수 있습니다.

모든 Envoy 태스크는 애플리케이션 루트 디렉터리에 위치한 `Envoy.blade.php` 파일에 정의해야 합니다. 아래는 예시입니다.

```blade
@servers(['web' => ['user@192.168.1.1'], 'workers' => ['user@192.168.1.2']])

@task('restart-queues', ['on' => 'workers'])
    cd /home/user/example.com
    php artisan queue:restart
@endtask
```

위에서 볼 수 있듯이, 파일 상단에 `@servers` 배열을 정의하여 태스크 선언에서 `on` 옵션을 통해 이 서버들을 참조할 수 있습니다. `@servers` 선언은 항상 한 줄로 작성해야 합니다. 각 `@task` 선언 내부에는 태스크가 실행될 때 서버에서 수행할 셸 명령어를 작성합니다.

<a name="local-tasks"></a>
#### 로컬 태스크

스크립트를 로컬 컴퓨터에서 강제로 실행하려면 서버 IP 주소를 `127.0.0.1`로 지정하면 됩니다.

```blade
@servers(['localhost' => '127.0.0.1'])
```

<a name="importing-envoy-tasks"></a>
#### Envoy 태스크 가져오기

`@import` 디렉티브를 사용하면 다른 Envoy 파일을 가져와서 해당 파일에 정의된 스토리와 태스크를 내 Envoy 파일에 추가할 수 있습니다. 가져온 파일의 태스크도 내 파일에 정의된 것처럼 바로 실행할 수 있습니다.

```blade
@import('vendor/package/Envoy.blade.php')
```

<a name="multiple-servers"></a>
### 여러 서버 사용

Envoy를 사용하면 여러 서버에 걸쳐 하나의 태스크를 쉽게 실행할 수 있습니다. 먼저, `@servers` 선언에 더 많은 서버를 추가하고 각 서버에 고유한 이름을 지정합니다. 이후, 태스크의 `on` 배열에 각 서버 이름을 나열하면 됩니다.

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

기본적으로 태스크는 각 서버에서 순차적으로 실행됩니다. 즉, 첫 번째 서버에서 실행이 모두 끝나야 두 번째 서버에서 실행이 시작됩니다. 여러 서버에 동시에(병렬로) 태스크를 실행하고 싶다면 태스크 선언에 `parallel` 옵션을 추가하면 됩니다.

```blade
@servers(['web-1' => '192.168.1.1', 'web-2' => '192.168.1.2'])

@task('deploy', ['on' => ['web-1', 'web-2'], 'parallel' => true])
    cd /home/user/example.com
    git pull origin {{ $branch }}
    php artisan migrate --force
@endtask
```

<a name="setup"></a>
### 셋업

Envoy 태스크를 실행하기 전에 임의의 PHP 코드를 먼저 실행해야 할 경우가 있습니다. 이럴 때는 `@setup` 디렉티브를 사용하여 태스크 실행 전에 동작할 PHP 코드를 정의할 수 있습니다.

```php
@setup
    $now = new DateTime;
@endsetup
```

태스크 실행 전에 다른 PHP 파일을 불러와야 한다면, `Envoy.blade.php` 파일 맨 위에 `@include` 디렉티브를 사용할 수 있습니다.

```blade
@include('vendor/autoload.php')

@task('restart-queues')
    # ...
@endtask
```

<a name="variables"></a>
### 변수

필요하다면 Envoy 태스크를 실행할 때 명령줄에서 인수를 지정하여 태스크에 값을 전달할 수 있습니다.

```shell
php vendor/bin/envoy run deploy --branch=master
```

이렇게 전달한 옵션은 태스크 내에서 Blade의 "echo" 구문을 사용하여 접근할 수 있습니다. 또한, 태스크 안에서 Blade의 `if` 조건문이나 반복문도 사용할 수 있습니다. 예를 들어, `$branch` 변수가 존재하는지 확인한 후에만 `git pull` 명령을 실행하도록 할 수 있습니다.

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
### 스토리

스토리는 여러 태스크를 하나의 이름으로 그룹화하여 한 번에 실행할 수 있게 해줍니다. 예를 들어, `deploy` 스토리는 `update-code`와 `install-dependencies` 태스크를 한 번에 실행할 수 있도록 구성할 수 있습니다.

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

스토리를 정의한 후에는 일반 태스크와 같은 방식으로 실행할 수 있습니다.

```shell
php vendor/bin/envoy run deploy
```

<a name="completion-hooks"></a>
### 후크

태스크나 스토리가 실행될 때 다양한 종류의 후크(hook) 코드도 함께 실행할 수 있습니다. Envoy에서 지원하는 후크 종류는 `@before`, `@after`, `@error`, `@success`, `@finished`입니다. 모든 후크의 코드는 PHP로 작성하며, 원격 서버가 아닌 로컬 환경에서 실행됩니다.

각 후크는 원하는 만큼 여러 번 정의할 수 있고, Envoy 스크립트에서 작성된 순서대로 실행됩니다.

<a name="hook-before"></a>
#### `@before`

각 태스크가 실행되기 전에, Envoy 스크립트에 등록된 모든 `@before` 후크가 실행됩니다. `@before` 후크는 곧 실행될 태스크 이름을 인수로 받습니다.

```blade
@before
    if ($task === 'deploy') {
        // ...
    }
@endbefore
```

<a name="completion-after"></a>
#### `@after`

각 태스크 실행이 끝난 후, Envoy 스크립트에 등록된 모든 `@after` 후크가 실행됩니다. `@after` 후크는 방금 실행된 태스크 이름을 인수로 받습니다.

```blade
@after
    if ($task === 'deploy') {
        // ...
    }
@endafter
```

<a name="completion-error"></a>
#### `@error`

태스크 실행이 실패하여(상태 코드가 `0`보다 큰 값으로 종료) 문제가 발생하면, Envoy 스크립트의 모든 `@error` 후크가 실행됩니다. `@error` 후크 역시 실행했던 태스크 이름을 인수로 받습니다.

```blade
@error
    if ($task === 'deploy') {
        // ...
    }
@enderror
```

<a name="completion-success"></a>
#### `@success`

모든 태스크가 에러 없이 정상적으로 실행된 경우, 등록된 모든 `@success` 후크가 실행됩니다.

```blade
@success
    // ...
@endsuccess
```

<a name="completion-finished"></a>
#### `@finished`

모든 태스크 실행이 끝나면(정상 종료든, 오류든 상관없이) 모든 `@finished` 후크가 실행됩니다. `@finished` 후크는 완료된 태스크의 상태 코드(`null` 또는 0 이상의 정수)를 인수로 받습니다.

```blade
@finished
    if ($exitCode > 0) {
        // 하나 이상의 태스크에서 에러가 발생했습니다...
    }
@endfinished
```

<a name="running-tasks"></a>
## 태스크 실행하기

애플리케이션의 `Envoy.blade.php` 파일에 정의된 태스크나 스토리를 실행하려면, Envoy의 `run` 명령어에 실행하려는 태스크 또는 스토리 이름을 전달합니다. Envoy는 해당 태스크를 실행하고, 작업 중에 원격 서버의 출력을 실시간으로 표시합니다.

```shell
php vendor/bin/envoy run deploy
```

<a name="confirming-task-execution"></a>
### 태스크 실행 확인

서버에서 태스크를 실행하기 전에 반드시 사용자 확인을 받고 싶을 때는 태스크 선언에 `confirm` 옵션을 추가하세요. 이 옵션은 파괴적인 작업(삭제, 데이터 변경 등)에 특히 유용합니다.

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

Envoy는 각 태스크 실행 이후 [Slack](https://slack.com)으로 알림을 보낼 수 있습니다. `@slack` 디렉티브는 Slack 후크(URL)와 채널 또는 사용자명을 인수로 받습니다. Webhook URL은 Slack 관리 패널에서 "Incoming WebHooks" 통합을 생성하여 얻을 수 있습니다.

`@slack` 디렉티브의 첫 번째 인수로는 Webhook 전체 URL을 전달하고, 두 번째 인수로는 채널 이름(`#channel`) 또는 사용자명(`@user`)을 입력합니다.

```blade
@finished
    @slack('webhook-url', '#bots')
@endfinished
```

기본적으로 Envoy 알림은 실행된 태스크를 설명하는 메시지를 알림 채널에 전송합니다. 직접 메시지 내용을 지정하고 싶다면, 세 번째 인수로 원하는 메시지를 전달하면 됩니다.

```blade
@finished
    @slack('webhook-url', '#bots', 'Hello, Slack.')
@endfinished
```

<a name="discord"></a>
### Discord

Envoy는 [Discord](https://discord.com)에도 태스크 실행 후 알림을 보낼 수 있습니다. `@discord` 디렉티브는 Discord 후크(URL)와 메시지를 인수로 받습니다. Webhook URL은 서버 설정에서 Webhook을 생성하고 채널을 선택하여 얻을 수 있습니다. Webhook 전체 URL을 `@discord` 디렉티브에 전달하면 됩니다.

```blade
@finished
    @discord('discord-webhook-url')
@endfinished
```

<a name="telegram"></a>
### Telegram

Envoy는 [Telegram](https://telegram.org)으로도 태스크 실행 후 알림을 보낼 수 있습니다. `@telegram` 디렉티브는 Telegram Bot ID와 Chat ID를 인수로 받습니다. Bot ID는 [BotFather](https://t.me/botfather)를 이용해 새로운 봇을 생성하면 얻을 수 있습니다. 유효한 Chat ID는 [@username_to_id_bot](https://t.me/username_to_id_bot)으로 확인할 수 있습니다. `@telegram` 디렉티브에 Bot ID와 Chat ID를 전달하세요.

```blade
@finished
    @telegram('bot-id','chat-id')
@endfinished
```

<a name="microsoft-teams"></a>
### Microsoft Teams

Envoy는 [Microsoft Teams](https://www.microsoft.com/en-us/microsoft-teams)로도 태스크 실행 후 알림을 발송할 수 있습니다. `@microsoftTeams` 디렉티브에는 Teams Webhook(필수), 메시지, 테마 색상(success, info, warning, error), 옵션 배열 등을 인수로 넣을 수 있습니다. Webhook URL은 새로운 [incoming webhook](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook)을 생성해 획득할 수 있습니다. API에서는 메시지 박스를 사용자 정의할 수 있도록 title, summary, sections 등 다양한 속성을 지원합니다. 자세한 내용은 [Microsoft Teams 문서](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using?tabs=cURL#example-of-connector-message)에서 확인할 수 있습니다. Webhook 전체 URL을 `@microsoftTeams` 디렉티브에 전달하면 됩니다.

```blade
@finished
    @microsoftTeams('webhook-url')
@endfinished
```
