# 라라벨 엔보이 (Laravel Envoy)

- [소개](#introduction)
- [설치](#installation)
- [태스크 작성](#writing-tasks)
    - [태스크 정의](#defining-tasks)
    - [복수 서버 사용](#multiple-servers)
    - [설정 작업](#setup)
    - [변수 사용](#variables)
    - [스토리 사용](#stories)
    - [후크(Hook) 활용](#completion-hooks)
- [태스크 실행](#running-tasks)
    - [태스크 실행 전 확인](#confirming-task-execution)
- [알림 설정](#notifications)
    - [Slack 연동](#slack)
    - [Discord 연동](#discord)
    - [Telegram 연동](#telegram)
    - [Microsoft Teams 연동](#microsoft-teams)

<a name="introduction"></a>
## 소개

[Laravel Envoy](https://github.com/laravel/envoy)는 원격 서버에서 반복적으로 실행하는 태스크를 간편하게 처리하는 도구입니다. [Blade](/docs/11.x/blade) 스타일의 문법을 사용해, 배포 작업, Artisan 명령 실행 등 다양한 작업을 손쉽게 설정할 수 있습니다. 현재 Envoy는 Mac과 Linux 운영체제만 공식 지원합니다. 하지만 [WSL2](https://docs.microsoft.com/en-us/windows/wsl/install-win10)를 활용하면 Windows 환경에서도 사용이 가능합니다.

<a name="installation"></a>
## 설치

먼저, Composer 패키지 매니저를 이용해 프로젝트에 Envoy를 설치합니다:

```shell
composer require laravel/envoy --dev
```

Envoy 설치 이후에는, Envoy 실행 파일이 애플리케이션의 `vendor/bin` 디렉토리에 위치하게 됩니다:

```shell
php vendor/bin/envoy
```

<a name="writing-tasks"></a>
## 태스크 작성

<a name="defining-tasks"></a>
### 태스크 정의

태스크(task)는 Envoy의 가장 기본적인 구성 단위입니다. 태스크는 태스크가 실행될 때 원격 서버에서 실행되어야 할 쉘 명령어들을 정의합니다. 예를 들어, 모든 큐 워커 서버에서 `php artisan queue:restart` 명령어를 실행하는 태스크를 만들 수 있습니다.

모든 Envoy 태스크는 애플리케이션 루트에 위치한 `Envoy.blade.php` 파일에 정의해야 합니다. 아래는 기본적인 예시입니다:

```blade
@servers(['web' => ['user@192.168.1.1'], 'workers' => ['user@192.168.1.2']])

@task('restart-queues', ['on' => 'workers'])
    cd /home/user/example.com
    php artisan queue:restart
@endtask
```

위와 같이, 파일 맨 위에서 `@servers` 배열을 정의하여 각각의 서버를 이름으로 참조할 수 있도록 합니다. 태스크 선언 시 `on` 옵션을 통해 참조한 서버를 지정하며, 해당 태스크가 실행될 서버를 명확하게 지정할 수 있습니다. 참고로, `@servers` 선언은 항상 한 줄로 작성해야 합니다. 각 태스크(`@task`) 블록 내부에는 실행될 쉘 명령을 기재합니다.

<a name="local-tasks"></a>
#### 로컬 태스크

스크립트를 내 컴퓨터(로컬)에서 실행하고 싶다면, 서버 IP를 `127.0.0.1`로 지정하면 됩니다:

```blade
@servers(['localhost' => '127.0.0.1'])
```

<a name="importing-envoy-tasks"></a>
#### Envoy 태스크 가져오기

`@import` 지시어를 사용하면, 다른 Envoy 파일을 불러와 해당 파일의 스토리(story) 및 태스크를 내 Envoy 파일에서 사용할 수 있습니다. 이렇게 가져온 태스크는 직접 정의한 것처럼 동일하게 실행할 수 있습니다:

```blade
@import('vendor/package/Envoy.blade.php')
```

<a name="multiple-servers"></a>
### 복수 서버 사용

Envoy를 사용하면 하나의 태스크를 여러 서버에 걸쳐서 동시에 실행할 수 있습니다. 먼저, `@servers` 선언에 서버를 추가하고, 각 서버에 고유한 이름을 지정합니다. 이후 태스크의 `on` 배열에 실행될 서버의 이름을 나열합니다:

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

기본적으로 태스크는 지정된 서버에서 순차적으로(직렬로) 실행됩니다. 즉, 첫 번째 서버의 태스크가 끝나야 다음 서버에서 실행이 시작됩니다. 만약 복수의 서버에서 태스크를 병렬로 실행하고 싶다면, 태스크 선언에 `parallel` 옵션을 추가하십시오:

```blade
@servers(['web-1' => '192.168.1.1', 'web-2' => '192.168.1.2'])

@task('deploy', ['on' => ['web-1', 'web-2'], 'parallel' => true])
    cd /home/user/example.com
    git pull origin {{ $branch }}
    php artisan migrate --force
@endtask
```

<a name="setup"></a>
### 설정 작업

경우에 따라, Envoy 태스크가 실행되기 전에 임의의 PHP 코드를 실행해야 할 수 있습니다. 이럴 때는 `@setup` 지시어를 사용하면 됩니다. 해당 블록 내부의 코드는 태스크 실행 전에 실행됩니다:

```php
@setup
    $now = new DateTime;
@endsetup
```

태스크 실행 전에 다른 PHP 파일이 필요하다면, Envoy 파일 맨 위에 `@include` 지시어를 추가해 파일을 불러올 수 있습니다:

```blade
@include('vendor/autoload.php')

@task('restart-queues')
    # ...
@endtask
```

<a name="variables"></a>
### 변수 사용

필요하다면, Envoy 태스크를 호출할 때 커맨드라인에서 인수를 넘길 수 있습니다:

```shell
php vendor/bin/envoy run deploy --branch=master
```

이렇게 지정한 옵션 값은 Blade의 "echo" 문법을 이용해 태스크 내에서 사용할 수 있습니다. 또한, Blade의 if문이나 반복문도 자유롭게 사용할 수 있습니다. 아래는 `$branch` 변수가 있을 때에만 `git pull` 명령을 실행하는 코드입니다:

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
### 스토리 사용

스토리(story)는 여러 개의 태스크를 하나의 이름으로 묶어 관리할 수 있게 해줍니다. 예를 들어, `deploy`라는 스토리에 `update-code`와 `install-dependencies`라는 태스크를 등록하면, 한 번의 명령만으로 여러 태스크를 연속 실행할 수 있습니다:

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

스토리를 작성한 뒤에는, 일반 태스크와 동일하게 아래와 같이 실행할 수 있습니다:

```shell
php vendor/bin/envoy run deploy
```

<a name="completion-hooks"></a>
### 후크(Hook) 활용

태스크 및 스토리가 실행될 때 여러 종류의 후크(hook)가 함께 동작합니다. Envoy가 지원하는 후크 종류에는 `@before`, `@after`, `@error`, `@success`, `@finished`가 있습니다. 이 후크 블록 내의 코드는 모두 PHP로 해석되어, 원격 서버가 아닌 로컬에서 실행됩니다.

이러한 각 후크는 원하는 만큼 여러 번 사용할 수 있으며, Envoy 스크립트에서 나타나는 순서대로 실행됩니다.

<a name="hook-before"></a>
#### `@before`

각 태스크 실행 전에 Envoy 스크립트에 등록된 모든 `@before` 후크가 실행됩니다. 이 후크에서는 실행될 태스크의 이름을 사용할 수 있습니다:

```blade
@before
    if ($task === 'deploy') {
        // ...
    }
@endbefore
```

<a name="completion-after"></a>
#### `@after`

태스크 실행이 끝난 후에는, 등록된 모든 `@after` 후크가 실행됩니다. 이 후크에서는 실행된 태스크의 이름을 사용할 수 있습니다:

```blade
@after
    if ($task === 'deploy') {
        // ...
    }
@endafter
```

<a name="completion-error"></a>
#### `@error`

태스크가 실패(상태 코드가 0보다 큰 값으로 종료)하면, 등록된 모든 `@error` 후크가 실행됩니다. 이 후크에서도 실행된 태스크의 이름을 참조할 수 있습니다:

```blade
@error
    if ($task === 'deploy') {
        // ...
    }
@enderror
```

<a name="completion-success"></a>
#### `@success`

모든 태스크가 에러 없이 정상적으로 실행되면, 등록된 모든 `@success` 후크가 실행됩니다:

```blade
@success
    // ...
@endsuccess
```

<a name="completion-finished"></a>
#### `@finished`

모든 태스크가 실행된 후(성공/실패와 관계없이), 모든 `@finished` 후크가 실행됩니다. `@finished` 후크에서는 완료된 태스크의 상태 코드 값을 받아올 수 있으며, 이 값은 `null`이거나 `0` 이상의 정수일 수 있습니다:

```blade
@finished
    if ($exitCode > 0) {
        // 하나 이상의 태스크에서 오류가 발생했습니다...
    }
@endfinished
```

<a name="running-tasks"></a>
## 태스크 실행

애플리케이션의 `Envoy.blade.php` 파일에 정의된 태스크 또는 스토리를 실행하려면, Envoy의 `run` 명령에 실행할 태스크나 스토리의 이름을 인수로 전달하면 됩니다. Envoy는 해당 작업을 실행하고, 실행 중에 원격 서버에서 전달되는 출력을 실시간으로 보여줍니다:

```shell
php vendor/bin/envoy run deploy
```

<a name="confirming-task-execution"></a>
### 태스크 실행 전 확인

지정한 태스크를 서버에서 실행하기 전에 실행 여부를 한번 더 묻는(확인하는) 기능이 필요하다면, 태스크 선언에 `confirm` 지시어를 추가하면 됩니다. 이 옵션은 어떤 작업이 파괴적일(즉, 복구가 어려운 변경이 발생할) 때 매우 유용합니다:

```blade
@task('deploy', ['on' => 'web', 'confirm' => true])
    cd /home/user/example.com
    git pull origin {{ $branch }}
    php artisan migrate
@endtask
```

<a name="notifications"></a>
## 알림 설정

<a name="slack"></a>
### Slack 연동

Envoy는 각 태스크 실행 후 [Slack](https://slack.com)으로 알림을 전송하는 기능을 지원합니다. `@slack` 지시어에는 Slack의 웹후크(webhook) URL과 채널/사용자 이름을 전달해야 합니다. 웹후크 URL은 Slack 관리 화면에서 "Incoming WebHooks" 통합을 생성하여 얻을 수 있습니다.

`@slack` 지시어의 첫 번째 인자로 전체 웹후크 URL을, 두 번째 인자로 채널 이름(`#채널`) 또는 사용자 이름(`@유저`)을 전달합니다:

```blade
@finished
    @slack('webhook-url', '#bots')
@endfinished
```

기본적으로 Envoy 알림은 실행된 태스크 정보를 담아 채널로 전송합니다. 하지만, 세 번째 인자로 직접 메시지를 지정하면, 자신만의 맞춤 메시지를 보낼 수도 있습니다:

```blade
@finished
    @slack('webhook-url', '#bots', 'Hello, Slack.')
@endfinished
```

<a name="discord"></a>
### Discord 연동

Envoy는 [Discord](https://discord.com)에도 태스크 실행 후 알림을 보낼 수 있습니다. `@discord` 지시어는 Discord 웹후크 URL과 메시지를 받습니다. 웹후크 URL은 디스코드 서버의 "Webhook"을 생성해서 얻을 수 있습니다. 해당 URL을 `@discord` 지시어에 그대로 전달하면 됩니다:

```blade
@finished
    @discord('discord-webhook-url')
@endfinished
```

<a name="telegram"></a>
### Telegram 연동

Envoy는 [Telegram](https://telegram.org) 알림도 지원합니다. `@telegram` 지시어는 텔레그램 봇 ID, 채팅 ID를 인자로 받습니다. 봇 ID는 [BotFather](https://t.me/botfather)로 새 봇을 만들어 얻을 수 있고, 채팅 ID는 [@username_to_id_bot](https://t.me/username_to_id_bot) 등으로 확인할 수 있습니다. 두 값을 `@telegram` 지시어에 전달하면 사용 가능합니다:

```blade
@finished
    @telegram('bot-id','chat-id')
@endfinished
```

<a name="microsoft-teams"></a>
### Microsoft Teams 연동

Envoy는 [Microsoft Teams](https://www.microsoft.com/en-us/microsoft-teams) 알림도 지원합니다. `@microsoftTeams` 지시어에는 Teams 웹후크(필수), 메시지, 테마 색상(success, info, warning, error), 옵션 배열을 인자로 전달할 수 있습니다. Teams 웹후크 URL은 [incoming webhook](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook)을 생성해서 가져야 합니다. Teams API에서는 메시지 박스 타이틀, 요약, 섹션 등 다양한 속성도 커스터마이즈할 수 있습니다. 자세한 내용은 [Microsoft Teams 공식 문서](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using?tabs=cURL#example-of-connector-message)를 참고하십시오. 웹후크 URL을 `@microsoftTeams` 지시어에 입력하면 됩니다:

```blade
@finished
    @microsoftTeams('webhook-url')
@endfinished
```