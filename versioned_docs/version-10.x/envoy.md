# 라라벨 Envoy (Laravel Envoy)

- [소개](#introduction)
- [설치](#installation)
- [태스크 작성](#writing-tasks)
    - [태스크 정의](#defining-tasks)
    - [여러 서버](#multiple-servers)
    - [셋업(Setup)](#setup)
    - [변수](#variables)
    - [스토리](#stories)
    - [훅(Hook)](#completion-hooks)
- [태스크 실행](#running-tasks)
    - [태스크 실행 확인](#confirming-task-execution)
- [알림](#notifications)
    - [Slack](#slack)
    - [Discord](#discord)
    - [Telegram](#telegram)
    - [Microsoft Teams](#microsoft-teams)

<a name="introduction"></a>
## 소개

[Laravel Envoy](https://github.com/laravel/envoy)는 원격 서버에서 자주 실행하는 작업들을 손쉽게 자동화할 수 있게 해주는 도구입니다. [Blade](/docs/10.x/blade) 스타일의 문법을 통해 배포, Artisan 명령 실행 등 다양한 작업을 손쉽게 작성할 수 있습니다. 현재 Envoy는 Mac과 Linux 운영체제만 공식 지원합니다. 단, [WSL2](https://docs.microsoft.com/en-us/windows/wsl/install-win10)를 이용하면 Windows 환경에서도 사용할 수 있습니다.

<a name="installation"></a>
## 설치

먼저 Composer 패키지 매니저를 사용하여 프로젝트에 Envoy를 설치합니다.

```shell
composer require laravel/envoy --dev
```

설치가 완료되면, Envoy 실행 파일이 애플리케이션의 `vendor/bin` 디렉터리 안에 생성됩니다.

```shell
php vendor/bin/envoy
```

<a name="writing-tasks"></a>
## 태스크 작성

<a name="defining-tasks"></a>
### 태스크 정의

태스크는 Envoy의 기본적인 구성 단위입니다. 태스크는 해당 태스크가 실행될 때 원격 서버에서 실행될 쉘 명령어들을 정의합니다. 예를 들어, 모든 큐 워커 서버에서 `php artisan queue:restart` 명령을 실행하는 태스크를 만들 수 있습니다.

모든 Envoy 태스크는 애플리케이션 루트에 있는 `Envoy.blade.php` 파일에 정의해야 합니다. 아래는 기본 예시입니다.

```blade
@servers(['web' => ['user@192.168.1.1'], 'workers' => ['user@192.168.1.2']])

@task('restart-queues', ['on' => 'workers'])
    cd /home/user/example.com
    php artisan queue:restart
@endtask
```

보시다시피, 파일 맨 위에는 `@servers` 배열이 정의되어 있습니다. 이를 통해 태스크 선언의 `on` 옵션에서 서버를 참조할 수 있습니다. `@servers` 선언은 반드시 한 줄로 작성해야 합니다. 각 `@task` 선언 안에는 태스크 실행 시 서버에서 실행할 쉘 명령어를 작성합니다.

<a name="local-tasks"></a>
#### 로컬 태스크

스크립트를 본인 컴퓨터에서 실행하려면, 서버의 IP 주소로 `127.0.0.1`을 지정하세요.

```blade
@servers(['localhost' => '127.0.0.1'])
```

<a name="importing-envoy-tasks"></a>
#### Envoy 태스크 가져오기

`@import` 디렉티브를 사용하면 다른 Envoy 파일을 임포트하여 해당 스토리와 태스크를 내 파일에 추가할 수 있습니다. 임포트된 파일에 정의된 태스크는 본인의 Envoy 파일에 작성된 것처럼 사용할 수 있습니다.

```blade
@import('vendor/package/Envoy.blade.php')
```

<a name="multiple-servers"></a>
### 여러 서버

Envoy를 사용하면 한 번에 여러 서버에 태스크를 쉽게 실행할 수 있습니다. 우선 `@servers` 선언에 추가 서버를 정의하고, 각 서버에 고유한 이름을 지정합니다. 추가한 서버들은 태스크의 `on` 배열에 나열하면 됩니다.

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

기본적으로 태스크는 각 서버에서 순차적으로 실행됩니다. 즉, 첫 번째 서버에서 완료된 후 두 번째 서버에서 실행이 시작됩니다. 여러 서버에서 동시에 태스크를 실행하려면, 태스크 선언에 `parallel` 옵션을 추가하면 됩니다.

```blade
@servers(['web-1' => '192.168.1.1', 'web-2' => '192.168.1.2'])

@task('deploy', ['on' => ['web-1', 'web-2'], 'parallel' => true])
    cd /home/user/example.com
    git pull origin {{ $branch }}
    php artisan migrate --force
@endtask
```

<a name="setup"></a>
### 셋업(Setup)

가끔 Envoy 태스크를 실행하기 전에 임의의 PHP 코드를 실행해야 할 때가 있습니다. 이럴 때는 `@setup` 디렉티브를 사용해 태스크 실행 전에 동작할 PHP 코드를 정의할 수 있습니다.

```php
@setup
    $now = new DateTime;
@endsetup
```

태스크 실행 전 추가적으로 PHP 파일을 읽어와야 한다면, `Envoy.blade.php` 파일 상단에 `@include` 디렉티브를 사용할 수 있습니다.

```blade
@include('vendor/autoload.php')

@task('restart-queues')
    # ...
@endtask
```

<a name="variables"></a>
### 변수

필요하다면 Envoy 태스크를 실행할 때 명령줄에서 인수를 전달할 수 있습니다.

```shell
php vendor/bin/envoy run deploy --branch=master
```

태스크 내에서는 Blade의 "echo" 문법을 이용해 옵션 값을 가져올 수 있습니다. 또한, 태스크 안에서 Blade의 `if` 문이나 반복문도 사용할 수 있습니다. 예를 들어, `git pull` 명령을 실행하기 전에 `$branch` 변수가 존재하는지 확인할 수 있습니다.

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

스토리는 여러 태스크를 하나의 이름으로 그룹화해서 한 번에 실행할 수 있게 해줍니다. 예를 들어, `deploy` 스토리는 `update-code`, `install-dependencies` 태스크를 묶어서 한 번에 실행할 수 있습니다.

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

스토리가 작성되면 아래와 같이 태스크를 실행할 때와 마찬가지로 사용할 수 있습니다.

```shell
php vendor/bin/envoy run deploy
```

<a name="completion-hooks"></a>
### 훅(Hook)

태스크와 스토리가 실행될 때, 다양한 훅이 함께 동작합니다. Envoy에서 지원하는 훅 타입은 `@before`, `@after`, `@error`, `@success`, `@finished`입니다. 이 훅 안의 코드는 모두 PHP로 해석되어 원격 서버가 아닌, 로컬 환경에서 실행됩니다.

각 훅 타입은 동일한 타입의 훅을 여러 개 정의할 수 있으며, Envoy 스크립트 상에서 정의한 순서대로 실행됩니다.

<a name="hook-before"></a>
#### `@before`

각 태스크 실행 전에, Envoy 스크립트에 등록된 모든 `@before` 훅이 실행됩니다. 이때 실행될 태스크 이름을 받을 수 있습니다.

```blade
@before
    if ($task === 'deploy') {
        // ...
    }
@endbefore
```

<a name="completion-after"></a>
#### `@after`

각 태스크 실행이 끝난 뒤 Envoy 스크립트 내 모든 `@after` 훅이 실행됩니다. 이때 완료된 태스크의 이름을 받을 수 있습니다.

```blade
@after
    if ($task === 'deploy') {
        // ...
    }
@endafter
```

<a name="completion-error"></a>
#### `@error`

태스크가 실패(종료 코드가 0보다 클 때)하면, Envoy 스크립트 내 모든 `@error` 훅이 실행됩니다. 이때 실패한 태스크의 이름을 받을 수 있습니다.

```blade
@error
    if ($task === 'deploy') {
        // ...
    }
@enderror
```

<a name="completion-success"></a>
#### `@success`

모든 태스크가 에러 없이 완료된 경우, 등록된 모든 `@success` 훅이 실행됩니다.

```blade
@success
    // ...
@endsuccess
```

<a name="completion-finished"></a>
#### `@finished`

모든 태스크가 실행된 뒤(성공/실패와 관계 없이) 모든 `@finished` 훅이 실행됩니다. 이 훅에서는 완료된 태스크의 종료 코드(정수값 또는 null)를 받을 수 있습니다.

```blade
@finished
    if ($exitCode > 0) {
        // 하나 이상의 태스크에서 에러가 발생했습니다...
    }
@endfinished
```

<a name="running-tasks"></a>
## 태스크 실행

애플리케이션의 `Envoy.blade.php` 파일에 정의된 태스크나 스토리를 실행하려면, Envoy의 `run` 명령어에 실행하고자 하는 태스크 또는 스토리의 이름을 인자로 전달하면 됩니다. Envoy는 태스크를 실행하는 동안 원격 서버의 출력 결과를 실시간으로 보여줍니다.

```shell
php vendor/bin/envoy run deploy
```

<a name="confirming-task-execution"></a>
### 태스크 실행 확인

특정 태스크를 서버에서 실행하기 전에 확인을 요구하고 싶을 때는, 태스크 선언에 `confirm` 옵션을 추가하세요. 이 옵션은 파괴적 작업 등에서 실수로 실행하는 것을 예방하는 데 유용합니다.

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

Envoy는 각 태스크 실행 후 [Slack](https://slack.com)으로 알림 메시지를 보낼 수 있습니다. `@slack` 디렉티브에는 Slack 훅 URL과 채널 또는 사용자명을 지정합니다. 웹훅 URL은 Slack 관리 패널에서 "Incoming WebHooks" 통합을 생성하여 얻을 수 있습니다.

`@slack` 디렉티브의 첫 번째 인자로 전체 웹훅 URL을, 두 번째 인자로 채널명(`#channel`) 또는 사용자명(`@user`)을 전달해야 합니다.

```blade
@finished
    @slack('webhook-url', '#bots')
@endfinished
```

기본적으로 Envoy 알림은 해당 태스크의 실행 내역을 채널에 알려주지만, 원하는 메시지로 덮어쓰고 싶다면 세 번째 인자로 커스텀 메시지를 넘길 수 있습니다.

```blade
@finished
    @slack('webhook-url', '#bots', 'Hello, Slack.')
@endfinished
```

<a name="discord"></a>
### Discord

Envoy는 [Discord](https://discord.com)로도 태스크 마다 알림을 보낼 수 있습니다. `@discord` 디렉티브에는 Discord 웹훅 URL과 메시지를 입력해야 합니다. 웹훅 URL은 Discord 서버의 "서버 설정 > 웹훅"에서 새로 만들고, 원하는 채널을 선택하면 얻을 수 있습니다. 전체 웹훅 URL을 `@discord` 디렉티브에 전달하면 됩니다.

```blade
@finished
    @discord('discord-webhook-url')
@endfinished
```

<a name="telegram"></a>
### Telegram

Envoy는 [Telegram](https://telegram.org)으로도 태스크 실행 후 알림을 보낼 수 있습니다. `@telegram` 디렉티브에는 Telegram Bot ID와 Chat ID가 필요합니다. Bot ID는 [BotFather](https://t.me/botfather)로 새 봇을 생성하여 얻을 수 있고, 유효한 Chat ID는 [@username_to_id_bot](https://t.me/username_to_id_bot)을 이용해 확인할 수 있습니다. 이 둘을 `@telegram`에 넘깁니다.

```blade
@finished
    @telegram('bot-id','chat-id')
@endfinished
```

<a name="microsoft-teams"></a>
### Microsoft Teams

Envoy는 [Microsoft Teams](https://www.microsoft.com/en-us/microsoft-teams)로도 태스크 실행 후 알림을 보낼 수 있습니다. `@microsoftTeams` 디렉티브에는 Teams Webhook(필수), 메시지, 테마 색상(success, info, warning, error), 옵션 배열을 인자로 받습니다. Teams Webhook은 [새 인커밍 웹훅 생성](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook)을 통해 얻을 수 있습니다. Teams API에서는 제목, 설명, 섹션 등 메시지 박스를 커스터마이징할 수 있는 다양한 속성을 제공하므로, 자세한 내용은 [Microsoft Teams 문서](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using?tabs=cURL#example-of-connector-message)를 참고하세요. 전체 Webhook URL을 `@microsoftTeams` 디렉티브에 전달합니다.

```blade
@finished
    @microsoftTeams('webhook-url')
@endfinished
```