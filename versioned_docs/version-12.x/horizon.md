# 라라벨 호라이즌 (Laravel Horizon)

- [소개](#introduction)
- [설치](#installation)
    - [구성](#configuration)
    - [밸런싱 전략](#balancing-strategies)
    - [대시보드 접근 권한](#dashboard-authorization)
    - [무시되는(조용한) 작업](#silenced-jobs)
- [Horizon 업그레이드](#upgrading-horizon)
- [Horizon 실행하기](#running-horizon)
    - [Horizon 배포](#deploying-horizon)
- [태그](#tags)
- [알림](#notifications)
- [메트릭](#metrics)
- [실패한 작업 삭제](#deleting-failed-jobs)
- [큐에서 작업 비우기](#clearing-jobs-from-queues)

<a name="introduction"></a>
## 소개

> [!NOTE]
> 라라벨 Horizon을 본격적으로 학습하시기 전에, 라라벨의 기본 [큐 서비스](/docs/12.x/queues)에 대해 먼저 익혀두시기 바랍니다. Horizon은 라라벨의 큐 시스템을 확장하여 추가적인 기능을 제공하며, 기본 큐 기능을 잘 모른다면 혼란스러울 수 있습니다.

[Laravel Horizon](https://github.com/laravel/horizon)은 라라벨 기반의 [Redis 큐](/docs/12.x/queues) 시스템에서 사용할 수 있는 아름다운 대시보드와 코드 기반의 구성을 제공합니다. Horizon을 통해 작업 처리량, 실행 시간, 작업 실패 등 큐 시스템의 주요 지표를 직관적으로 모니터링할 수 있습니다.

Horizon을 사용하면 모든 큐 워커 구성이 하나의 간단한 설정 파일에 저장됩니다. 애플리케이션의 워커 구성을 버전 관리되는 파일로 정의하면, 배포 시 손쉽게 큐 워커를 확장하거나 수정할 수 있습니다.

<img src="https://laravel.com/img/docs/horizon-example.png" />

<a name="installation"></a>
## 설치

> [!WARNING]
> 라라벨 Horizon은 [Redis](https://redis.io)를 기반으로 동작합니다. 따라서 애플리케이션의 `config/queue.php` 설정 파일에서 큐 연결이 `redis`로 설정되어 있는지 반드시 확인해야 합니다.

Composer 패키지 관리자를 사용해 프로젝트에 Horizon을 설치할 수 있습니다.

```shell
composer require laravel/horizon
```

설치가 완료되면, `horizon:install` 아티즌 명령어를 실행해 Horizon의 에셋을 게시합니다.

```shell
php artisan horizon:install
```

<a name="configuration"></a>
### 구성

Horizon의 에셋을 게시한 후, 주요 설정 파일은 `config/horizon.php` 경로에 생성됩니다. 이 설정 파일에서는 애플리케이션의 큐 워커와 관련된 다양한 옵션을 구성할 수 있습니다. 각 옵션에는 역할에 대한 설명이 포함되어 있으므로, 반드시 이 파일을 꼼꼼히 살펴보시기 바랍니다.

> [!WARNING]
> Horizon은 내장적으로 `horizon`이라는 이름의 Redis 연결을 사용합니다. 이 연결 이름은 예약어이므로, `database.php` 설정 파일에서 또는 `horizon.php`의 `use` 옵션 값으로 다른 Redis 연결에 이 이름을 사용해서는 안 됩니다.

<a name="environments"></a>
#### 환경 설정

설치 후 가장 먼저 익혀야 할 주요 Horizon 설정 옵션은 `environments` 항목입니다. 이 설정은 애플리케이션이 실행되는 각 환경에 대해 워커 프로세스의 옵션을 배열 형태로 정의합니다. 기본적으로 `production`과 `local` 환경이 들어 있으나, 필요에 따라 더 많은 환경을 자유롭게 추가할 수 있습니다.

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            'maxProcesses' => 10,
            'balanceMaxShift' => 1,
            'balanceCooldown' => 3,
        ],
    ],

    'local' => [
        'supervisor-1' => [
            'maxProcesses' => 3,
        ],
    ],
],
```

또한 와일드카드 환경(`*`)을 정의할 수도 있습니다. 이 환경은 지정된 환경이 없을 때 사용됩니다.

```php
'environments' => [
    // ...

    '*' => [
        'supervisor-1' => [
            'maxProcesses' => 3,
        ],
    ],
],
```

Horizon을 실행하면 애플리케이션이 동작 중인 환경에 맞게 워커 프로세스 설정을 적용하게 됩니다. 일반적으로 환경은 `APP_ENV` [환경 변수](/docs/12.x/configuration#determining-the-current-environment)의 값에 따라 결정됩니다. 예를 들어, 기본적으로 `local` 환경에서는 워커 프로세스 3개가 시작되고, 각 큐에 할당된 워커 프로세스 수도 자동으로 조절됩니다. `production` 환경의 경우 최대 10개의 워커 프로세스가 실행되며, 역시 각 큐의 워커가 자동으로 밸런싱됩니다.

> [!WARNING]
> `horizon` 설정 파일의 `environments` 항목에는 Horizon을 실행할 계획인 [각 환경](/docs/12.x/configuration#environment-configuration)에 대한 정의가 포함되어야 합니다.

<a name="supervisors"></a>
#### 슈퍼바이저

Horizon의 기본 설정 파일을 보면, 각 환경은 하나 이상의 "슈퍼바이저(supervisor)"를 가질 수 있습니다. 기본적으로 이 슈퍼바이저의 이름은 `supervisor-1`로 정의되어 있지만, 원하는 대로 자유롭게 이름을 변경할 수 있습니다. 각 슈퍼바이저는 워커 프로세스 그룹을 "감시(supervise)"하는 역할을 하며, 큐 전반에 걸쳐 워커 프로세스의 균형을 맞추는 역할을 합니다.

특정 환경에 새로운 워커 프로세스 그룹이 필요하다면 해당 환경에 슈퍼바이저를 추가할 수 있습니다. 이는 애플리케이션 내 큐마다 서로 다른 워커 수나 밸런싱 전략을 적용하고 싶을 때 유용합니다.

<a name="maintenance-mode"></a>
#### 유지보수 모드

애플리케이션이 [유지보수 모드](/docs/12.x/configuration#maintenance-mode)일 때는 Horizon이 큐 작업을 처리하지 않습니다. 이때에도 작업 처리를 계속하려면, 슈퍼바이저의 `force` 옵션을 Horizon 설정 파일 내에서 `true`로 지정해야 합니다.

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'force' => true,
        ],
    ],
],
```

<a name="default-values"></a>
#### 기본값

Horizon 기본 설정 파일에는 `defaults` 항목이 있습니다. 이 설정은 [슈퍼바이저](#supervisors)의 기본값을 지정합니다. 각 환경별 슈퍼바이저 설정에서 중복을 줄일 수 있도록, 이 기본값이 각 슈퍼바이저 설정에 병합됩니다.

<a name="balancing-strategies"></a>
### 밸런싱 전략

라라벨의 기본 큐 시스템과 달리, Horizon은 세 가지 워커 밸런싱 전략 중에서 선택할 수 있습니다: `simple`, `auto`, `false`. `simple` 전략은 들어오는 작업을 워커 프로세스에 고르게 분배합니다.

```
'balance' => 'simple',
```

`auto` 전략(설정 파일의 기본값)은 각 큐의 현재 작업량을 기반으로 워커 프로세스 수를 자동으로 조정합니다. 예를 들어, `notifications` 큐에 1,000개의 작업이 대기 중이고 `render` 큐에는 아무 작업이 없다면, `notifications` 큐에 더 많은 워커가 할당되어 큐를 빠르게 비웁니다.

`auto` 전략 사용 시에는 `minProcesses`와 `maxProcesses`를 지정하여 큐마다 최소와 최대 워커 프로세스 수를 조절할 수 있습니다.

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            'connection' => 'redis',
            'queue' => ['default'],
            'balance' => 'auto',
            'autoScalingStrategy' => 'time',
            'minProcesses' => 1,
            'maxProcesses' => 10,
            'balanceMaxShift' => 1,
            'balanceCooldown' => 3,
            'tries' => 3,
        ],
    ],
],
```

`autoScalingStrategy` 옵션은 Horizon이 워커를 추가로 할당할 때 기준이 되는 방식에 영향을 줍니다. 대기 중인 작업을 모두 처리하는 데 걸리는 총 시간(`time` 전략) 기준으로 할지, 큐에 쌓인 작업 개수(`size` 전략) 기준으로 할지 선택할 수 있습니다.

`balanceMaxShift`와 `balanceCooldown` 옵션은 Horizon이 얼마나 빠르게 워커 수를 조정할지 결정합니다. 위의 예시에서, 3초마다 최대 한 개의 프로세스가 추가되거나 종료됩니다. 애플리케이션 상황에 따라 이 값들은 변경할 수 있습니다.

만약 `balance` 옵션을 `false`로 설정하면, 큐는 설정 파일에 정의된 순서대로 처리되며, 라라벨 기본 동작과 동일하게 동작합니다.

<a name="dashboard-authorization"></a>
### 대시보드 접근 권한

Horizon 대시보드는 `/horizon` 경로로 접근할 수 있습니다. 기본적으로는 `local` 환경에서만 접근할 수 있습니다. 하지만, `app/Providers/HorizonServiceProvider.php` 파일에는 [인가 게이트](/docs/12.x/authorization#gates)가 정의되어 있어서, 이 게이트를 변경해 **로컬이 아닌 환경**에서의 Horizon 접근 권한을 조정할 수 있습니다.

```php
/**
 * Register the Horizon gate.
 *
 * This gate determines who can access Horizon in non-local environments.
 */
protected function gate(): void
{
    Gate::define('viewHorizon', function (User $user) {
        return in_array($user->email, [
            'taylor@laravel.com',
        ]);
    });
}
```

<a name="alternative-authentication-strategies"></a>
#### 대체 인증 방식

라라벨은 게이트 클로저에 자동으로 인증된 사용자를 주입합니다. 만약 Horizon 접근을 IP 제한 등 다른 방식으로 보안 처리한다면, Horizon 사용자에게 "로그인"을 요구하지 않을 수도 있습니다. 이 경우, 위의 `function (User $user)` 시그니처를 `function (User $user = null)`로 변경해, 인증이 필수가 아니게 강제할 수 있습니다.

<a name="silenced-jobs"></a>
### 무시되는(조용한) 작업

때때로, 애플리케이션이나 외부 패키지에서 발생하는 일부 작업에 대해 대시보드에서 확인하고 싶지 않을 때가 있습니다. 이런 작업이 "완료된 작업" 목록에 쌓이는 것을 원하지 않으면, 해당 작업을 조용하게 처리(무시)할 수 있습니다. `horizon` 설정 파일의 `silenced` 옵션에 작업의 클래스명을 등록하면 됩니다.

```php
'silenced' => [
    App\Jobs\ProcessPodcast::class,
],
```

또는, 무시하고 싶은 작업 클래스가 `Laravel\Horizon\Contracts\Silenced` 인터페이스를 구현하도록 하면, 설정 배열에 추가하지 않아도 자동으로 무시됩니다.

```php
use Laravel\Horizon\Contracts\Silenced;

class ProcessPodcast implements ShouldQueue, Silenced
{
    use Queueable;

    // ...
}
```

<a name="upgrading-horizon"></a>
## Horizon 업그레이드

Horizon을 새로운 주요 버전으로 업그레이드할 때는, [업그레이드 가이드](https://github.com/laravel/horizon/blob/master/UPGRADE.md)를 꼼꼼히 확인해야 합니다.

<a name="running-horizon"></a>
## Horizon 실행하기

애플리케이션의 `config/horizon.php` 파일에서 슈퍼바이저와 워커 구성을 완료한 후에는, `horizon` 아티즌 명령어로 Horizon을 실행할 수 있습니다. 이 명령어 하나로 현재 환경의 모든 워커 프로세스가 함께 시작됩니다.

```shell
php artisan horizon
```

Horizon 프로세스를 일시 중지하거나 다시 시작하려면 각각 `horizon:pause`, `horizon:continue` 아티즌 명령어를 사용할 수 있습니다.

```shell
php artisan horizon:pause

php artisan horizon:continue
```

특정 Horizon [슈퍼바이저](#supervisors)만 따로 일시 중지/재개하고 싶다면 `horizon:pause-supervisor`, `horizon:continue-supervisor` 명령어를 사용할 수 있습니다.

```shell
php artisan horizon:pause-supervisor supervisor-1

php artisan horizon:continue-supervisor supervisor-1
```

현재 Horizon 프로세스의 상태를 확인하려면 `horizon:status` 명령어를 사용할 수 있습니다.

```shell
php artisan horizon:status
```

특정 Horizon [슈퍼바이저](#supervisors)의 상태를 확인할 때는 `horizon:supervisor-status` 명령어를 이용합니다.

```shell
php artisan horizon:supervisor-status supervisor-1
```

Horizon 프로세스를 정상적으로 종료하고 싶을 때는 `horizon:terminate` 명령어를 사용하세요. 현재 처리 중인 작업이 모두 끝나면, Horizon이 실행을 중단합니다.

```shell
php artisan horizon:terminate
```

<a name="deploying-horizon"></a>
### Horizon 배포

애플리케이션을 실제 서버 환경에 배포할 때는, `php artisan horizon` 명령어가 비정상 종료되는 상황을 대비해 프로세스 모니터를 설정해야 합니다. 프로세스가 중단될 경우 자동으로 재시작되도록 해야 합니다. 아래에서 프로세스 모니터 설치 방법을 자세히 다룹니다.

배포 과정에서 코드 변경사항을 적용하려면, Horizon 프로세스에 종료 신호를 보내 프로세스 모니터가 자동으로 재시작하도록 해야 합니다.

```shell
php artisan horizon:terminate
```

<a name="installing-supervisor"></a>
#### Supervisor 설치하기

Supervisor는 리눅스 운영체제에서 사용할 수 있는 프로세스 모니터로, `horizon` 프로세스가 중단되었을 때 자동으로 다시 시작해줍니다. Ubuntu에서는 아래 명령어로 Supervisor를 설치할 수 있습니다. Ubuntu가 아니라면 사용 중인 운영체제의 패키지 관리자를 이용해 설치하면 됩니다.

```shell
sudo apt-get install supervisor
```

> [!NOTE]
> Supervisor를 직접 설정하는 것이 부담스럽다면, [Laravel Cloud](https://cloud.laravel.com) 서비스를 이용하여 라라벨 애플리케이션의 백그라운드 프로세스 관리를 맡기는 것도 고려해볼 수 있습니다.

<a name="supervisor-configuration"></a>
#### Supervisor 설정

Supervisor 설정 파일은 일반적으로 서버의 `/etc/supervisor/conf.d` 디렉토리에 저장합니다. 이 디렉토리 안에 여러 개의 설정 파일을 생성하여 어떤 프로세스를 어떻게 관리할지 Supervisor에 알려줄 수 있습니다. 예를 들어, 아래처럼 `horizon.conf` 파일을 생성해 `horizon` 프로세스를 관리할 수 있습니다.

```ini
[program:horizon]
process_name=%(program_name)s
command=php /home/forge/example.com/artisan horizon
autostart=true
autorestart=true
user=forge
redirect_stderr=true
stdout_logfile=/home/forge/example.com/horizon.log
stopwaitsecs=3600
```

Supervisor 설정 시에는 `stopwaitsecs` 값이 가장 오래 걸리는 작업 처리 시간보다 충분히 커야 합니다. 그렇지 않으면 Supervisor가 작업 처리가 끝나기 전에 강제로 프로세스를 종료할 수 있습니다.

> [!WARNING]
> 위의 예시는 Ubuntu 서버용으로 유효하나, OS 별로 Supervisor 설정 파일의 위치나 확장자가 다를 수 있습니다. 자세한 내용은 사용하는 서버의 공식 문서를 항상 참고하시기 바랍니다.

<a name="starting-supervisor"></a>
#### Supervisor 시작하기

설정 파일을 생성한 후에는 아래 명령어로 Supervisor 설정을 갱신하고, 모니터링 프로세스를 시작할 수 있습니다.

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start horizon
```

> [!NOTE]
> Supervisor 사용에 대한 더 자세한 정보는 [Supervisor 공식 문서](http://supervisord.org/index.html)를 참고해주시기 바랍니다.

<a name="tags"></a>
## 태그

Horizon을 사용하면 각 작업에 "태그"를 부여할 수 있습니다. 여기에는 메일 발송, 브로드캐스트 이벤트, 알림, 큐를 사용하는 이벤트 리스너 등이 포함됩니다. 실제로 Horizon은 대부분의 작업에 대해, 작업에 연결된 Eloquent 모델에 따라 태그를 자동으로 지정해줍니다. 예를 들어, 다음과 같은 작업이 있다고 가정해봅시다.

```php
<?php

namespace App\Jobs;

use App\Models\Video;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class RenderVideo implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Video $video,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // ...
    }
}
```

이 작업이 `id`가 1인 `App\Models\Video` 인스턴스로 큐에 추가되었다면, 자동으로 `App\Models\Video:1`과 같은 태그를 부여받게 됩니다. Horizon은 작업의 프로퍼티를 검사해 Eloquent 모델이 있는 경우, 모델의 클래스명과 기본 키를 조합해 자동으로 태그를 달아줍니다.

```php
use App\Jobs\RenderVideo;
use App\Models\Video;

$video = Video::find(1);

RenderVideo::dispatch($video);
```

<a name="manually-tagging-jobs"></a>
#### 작업에 태그 직접 지정하기

큐에 추가하는 객체에 대해 직접 태그를 지정하고 싶다면, 클래스에 `tags` 메서드를 정의하면 됩니다.

```php
class RenderVideo implements ShouldQueue
{
    /**
     * Get the tags that should be assigned to the job.
     *
     * @return array<int, string>
     */
    public function tags(): array
    {
        return ['render', 'video:'.$this->video->id];
    }
}
```

<a name="manually-tagging-event-listeners"></a>
#### 이벤트 리스너에 태그 직접 지정하기

큐를 사용하는 이벤트 리스너에서 태그를 정의할 때에도, Horizon은 이벤트 인스턴스를 `tags` 메서드에 자동으로 전달합니다. 이를 활용해 이벤트 데이터를 태그에 추가할 수 있습니다.

```php
class SendRenderNotifications implements ShouldQueue
{
    /**
     * Get the tags that should be assigned to the listener.
     *
     * @return array<int, string>
     */
    public function tags(VideoRendered $event): array
    {
        return ['video:'.$event->video->id];
    }
}
```

<a name="notifications"></a>
## 알림

> [!WARNING]
> Horizon에서 Slack 또는 SMS 알림을 설정할 때는, [각 알림 채널별 사전 요구 사항](/docs/12.x/notifications)을 반드시 확인해야 합니다.

특정 큐의 대기 시간이 길어지면 알림을 받고 싶을 때, `Horizon::routeMailNotificationsTo`, `Horizon::routeSlackNotificationsTo`, `Horizon::routeSmsNotificationsTo` 메서드를 사용할 수 있습니다. 이러한 메서드는 애플리케이션의 `App\Providers\HorizonServiceProvider` 클래스의 `boot` 메서드에서 호출하면 됩니다.

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    parent::boot();

    Horizon::routeSmsNotificationsTo('15556667777');
    Horizon::routeMailNotificationsTo('example@example.com');
    Horizon::routeSlackNotificationsTo('slack-webhook-url', '#channel');
}
```

<a name="configuring-notification-wait-time-thresholds"></a>
#### 알림 대기 시간 임계값 설정하기

"오랜 대기"로 간주되는 시간을 얼마나 길게 잡을지, 애플리케이션의 `config/horizon.php` 설정 파일의 `waits` 옵션으로 지정할 수 있습니다. 이 옵션에는 연결/큐 조합별로 대기 시간(초)을 설정할 수 있습니다. 설정되지 않은 조합의 경우 기본적으로 60초가 적용됩니다.

```php
'waits' => [
    'redis:critical' => 30,
    'redis:default' => 60,
    'redis:batch' => 120,
],
```

<a name="metrics"></a>
## 메트릭

Horizon에는 작업과 큐의 대기 시간, 처리량 등을 확인할 수 있는 메트릭 대시보드가 내장되어 있습니다. 이 대시보드 데이터를 수집하려면, `routes/console.php` 파일 내에서 Horizon의 `snapshot` 아티즌 명령어가 5분마다 실행되도록 스케줄을 설정해야 합니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('horizon:snapshot')->everyFiveMinutes();
```

<a name="deleting-failed-jobs"></a>
## 실패한 작업 삭제

실패한 작업을 삭제하고 싶다면 `horizon:forget` 명령어를 사용할 수 있습니다. 이 명령어의 유일한 인수로 실패한 작업의 ID나 UUID를 입력하면 됩니다.

```shell
php artisan horizon:forget 5
```

모든 실패한 작업을 한 번에 삭제할 때는 `--all` 옵션을 사용할 수 있습니다.

```shell
php artisan horizon:forget --all
```

<a name="clearing-jobs-from-queues"></a>
## 큐에서 작업 비우기

애플리케이션의 기본 큐에 쌓인 모든 작업을 삭제하려면 `horizon:clear` 아티즌 명령어를 사용하세요.

```shell
php artisan horizon:clear
```

특정 큐의 작업만 비우고 싶으면 `queue` 옵션을 지정할 수 있습니다.

```shell
php artisan horizon:clear --queue=emails
```
