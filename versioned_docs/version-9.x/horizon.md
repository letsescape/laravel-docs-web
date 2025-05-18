# 라라벨 Horizon (Laravel Horizon)

- [소개](#introduction)
- [설치](#installation)
    - [설정](#configuration)
    - [부하 분산 전략](#balancing-strategies)
    - [대시보드 인증](#dashboard-authorization)
    - [음소거된 작업](#silenced-jobs)
- [Horizon 업그레이드](#upgrading-horizon)
- [Horizon 실행](#running-horizon)
    - [Horizon 배포](#deploying-horizon)
- [태그](#tags)
- [알림](#notifications)
- [메트릭](#metrics)
- [실패한 작업 삭제](#deleting-failed-jobs)
- [큐에서 작업 비우기](#clearing-jobs-from-queues)

<a name="introduction"></a>
## 소개

> [!NOTE]
> 라라벨 Horizon을 학습하기 전에, 라라벨의 기본 [큐 서비스](/docs/9.x/queues)를 먼저 익히는 것이 좋습니다. Horizon은 라라벨의 큐 기능을 확장하는 추가 기능을 제공하므로, 기본 큐 기능에 익숙하지 않으면 다소 혼란스러울 수 있습니다.

[Laravel Horizon](https://github.com/laravel/horizon)은 라라벨에서 사용하는 [Redis 큐](/docs/9.x/queues)를 위한 아름다운 대시보드와 코드 기반 설정 기능을 제공합니다. Horizon을 사용하면 큐 시스템의 주요 지표들, 예를 들어 작업 처리량, 실행 시간, 실패한 작업 등을 쉽게 모니터링할 수 있습니다.

Horizon을 사용할 때는 모든 큐 워커 설정이 하나의 간단한 설정 파일에 저장됩니다. 애플리케이션의 워커 구성을 버전 관리되는 파일로 정의함으로써, 애플리케이션을 배포할 때 워커를 손쉽게 확장하거나 수정할 수 있습니다.

<img src="https://laravel.com/img/docs/horizon-example.png" />

<a name="installation"></a>
## 설치

> [!WARNING]
> 라라벨 Horizon은 [Redis](https://redis.io)를 큐 드라이버로 사용해야만 동작합니다. 따라서, 애플리케이션의 `config/queue.php` 설정 파일에서 큐 연결이 반드시 `redis`로 지정되어 있는지 확인해야 합니다.

Composer 패키지 관리자를 사용해서 Horizon을 프로젝트에 설치할 수 있습니다.

```shell
composer require laravel/horizon
```

Horizon을 설치한 후에는 `horizon:install` 아티즌 명령어로 관련 에셋을 배포해야 합니다.

```shell
php artisan horizon:install
```

<a name="configuration"></a>
### 설정

Horizon의 에셋을 배포한 뒤에는 주요 설정 파일이 `config/horizon.php`에 위치하게 됩니다. 이 설정 파일에서는 애플리케이션의 큐 워커 옵션을 구성할 수 있습니다. 각 설정 항목에는 목적에 대한 설명이 함께 제공되니, 이 파일을 꼼꼼하게 살펴보시기 바랍니다.

> [!WARNING]
> Horizon은 내부적으로 `horizon`이라는 이름의 Redis 연결을 사용합니다. 이 Redis 연결 이름은 예약되어 있으므로, `database.php` 설정 파일이나 `horizon.php` 설정 파일의 `use` 옵션에 이 이름을 사용해서는 안 됩니다.

<a name="environments"></a>
#### 환경 설정

설치 후 가장 먼저 익숙해져야 할 설정 옵션은 `environments` 항목입니다. 이 설정은 애플리케이션이 동작하는 여러 환경별로 워커 프로세스 옵션을 정의할 수 있게 하는 배열입니다. 기본적으로는 `production`과 `local` 환경이 포함되어 있지만, 필요에 따라 더 많은 환경을 자유롭게 추가할 수 있습니다.

```
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

Horizon을 실행하면, 해당 애플리케이션 환경(예: `local`, `production`)에 맞는 워커 프로세스 설정이 적용됩니다. 환경은 보통 `APP_ENV` [환경 변수](/docs/9.x/configuration#determining-the-current-environment) 값에 따라 결정됩니다. 예를 들어, 기본 `local` 환경에서는 워커 프로세스가 3개로 시작되고, 각 큐에 할당된 워커 수를 자동으로 조절하도록 설정되어 있습니다. 반면, 기본 `production` 환경에서는 최대 10개의 워커 프로세스가 시작되고, 마찬가지로 각 큐에 할당된 워커 수를 자동으로 조절합니다.

> [!WARNING]
> `horizon` 설정 파일의 `environments` 항목에는 Horizon을 실행할 모든 [환경](/docs/9.x/configuration#environment-configuration)에 대한 항목이 반드시 포함되어야 합니다.

<a name="supervisors"></a>
#### Supervisor

Horizon의 기본 설정 파일을 보면, 각 환경에 하나 이상의 "supervisor"를 포함할 수 있습니다. 기본적으로는 `supervisor-1`이라는 이름으로 정의되어 있지만, supervisor 이름은 원하는 대로 정할 수 있습니다. supervisor는 여러 워커 프로세스 그룹을 "감독"하며, 각각의 큐에 워커가 균등하게 할당되도록 관리합니다.

특정 환경에서 워커 프로세스 그룹을 새로 정의하고 싶다면 supervisor를 추가해 사용할 수 있습니다. 예를 들어 큐마다 서로 다른 부하 분산 전략이나, 워커 프로세스 수를 설정하고 싶을 때 유용합니다.

<a name="default-values"></a>
#### 기본값

Horizon의 기본 설정 파일에는 `defaults` 설정 항목이 있습니다. 이 옵션은 각 [supervisor](#supervisors)에 적용되는 기본값을 지정합니다. supervisor의 기본 설정값은 각 환경의 supervisor 설정에 병합되어, 중복되는 내용을 한 번에 정의할 수 있게 해줍니다.

<a name="balancing-strategies"></a>
### 부하 분산 전략

라라벨의 기본 큐 시스템과 달리, Horizon에서는 세 가지 워커 부하 분산 전략을 선택할 수 있습니다: `simple`, `auto`, `false`입니다. 기본값인 `simple`은 들어오는 작업들을 워커 프로세스에 고르게 분배합니다.

```
'balance' => 'simple',
```

`auto` 전략은 각 큐의 현재 작업량에 따라 워커 프로세스 수를 동적으로 조절합니다. 예를 들어, `notifications` 큐에 1,000개의 대기 작업이 있는 반면 `render` 큐는 비어 있다면, Horizon은 워커를 `notifications` 큐에 더 많이 할당해서 효율적으로 작업을 처리합니다.

`auto` 전략을 사용할 때는, Horizon이 워커 프로세스를 얼마나 최소/최대 몇 개까지 확장/축소할 것인지를 `minProcesses`와 `maxProcesses` 설정 옵션으로 지정할 수 있습니다.

```
'environments' => [
    'production' => [
        'supervisor-1' => [
            'connection' => 'redis',
            'queue' => ['default'],
            'balance' => 'auto',
            'minProcesses' => 1,
            'maxProcesses' => 10,
            'balanceMaxShift' => 1,
            'balanceCooldown' => 3,
            'tries' => 3,
        ],
    ],
],
```

`balanceMaxShift`와 `balanceCooldown` 값은 Horizon이 워커 수를 얼마나 빠르게 스케일링할지 결정합니다. 위 예시에서는, 매 3초마다 최대 1개의 프로세스만 생성되거나 종료됩니다. 필요에 따라 이 값을 조정해 쓸 수 있습니다.

만약 `balance` 옵션을 `false`로 지정할 경우, 큐들은 설정 파일에 나열된 순서대로 워커가 처리하게 됩니다. 즉, 라라벨의 기본 큐 처리 방식과 동일합니다.

<a name="dashboard-authorization"></a>
### 대시보드 인증

Horizon은 `/horizon` 경로에서 대시보드를 제공합니다. 기본적으로는 `local` 환경에서만 이 대시보드에 접근할 수 있습니다. 하지만 `app/Providers/HorizonServiceProvider.php` 파일에는 [인가 Gate](/docs/9.x/authorization#gates)가 정의되어 있습니다. 이 인가 Gate는 **비로컬 환경**에서 Horizon 접근 권한을 제어합니다. 필요에 따라 이 Gate를 수정해서, Horizon 접속 허용 대상을 원하는 대로 제한할 수 있습니다.

```
/**
 * Register the Horizon gate.
 *
 * This gate determines who can access Horizon in non-local environments.
 *
 * @return void
 */
protected function gate()
{
    Gate::define('viewHorizon', function ($user) {
        return in_array($user->email, [
            'taylor@laravel.com',
        ]);
    });
}
```

<a name="alternative-authentication-strategies"></a>
#### 대체 인증 전략

라라벨은 Gate 클로저에 인증된 사용자를 자동으로 주입합니다. 만약 Horizon 보안을 IP 제한 등 다른 방식으로 하고 있다면, 사용자들이 "로그인"할 필요가 없을 수 있습니다. 이럴 경우 위의 Gate 클로저 시그니처를 `function ($user = null)`로 바꿔주면, 인증이 필수로 요구되지 않게 됩니다.

<a name="silenced-jobs"></a>
### 음소거된 작업

애플리케이션이나 서드파티 패키지에서 발생하는 일부 작업은, 굳이 "완료된 작업" 목록에 보이지 않아도 될 수 있습니다. 이런 작업들은 음소거 처리가 가능합니다. 시작하려면 음소거하고 싶은 작업의 클래스명을 애플리케이션의 `horizon` 설정 파일의 `silenced` 옵션에 추가하면 됩니다.

```
'silenced' => [
    App\Jobs\ProcessPodcast::class,
],
```

또는, 음소거하고자 하는 작업이 `Laravel\Horizon\Contracts\Silenced` 인터페이스를 구현하면, `silenced` 배열에 별도로 명시하지 않아도 해당 작업이 자동으로 음소거됩니다.

```
use Laravel\Horizon\Contracts\Silenced;

class ProcessPodcast implements ShouldQueue, Silenced
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // ...
}
```

<a name="upgrading-horizon"></a>
## Horizon 업그레이드

Horizon의 새로운 주 버전으로 업그레이드할 때는 반드시 [업그레이드 가이드](https://github.com/laravel/horizon/blob/master/UPGRADE.md)를 꼼꼼하게 확인해야 합니다. 또한, 새로운 Horizon 버전으로 업그레이드할 때마다 Horizon의 에셋을 다시 배포하는 것이 좋습니다.

```shell
php artisan horizon:publish
```

에셋을 항상 최신 상태로 유지하고, 차후 업데이트에서의 문제를 방지하려면, 애플리케이션의 `composer.json` 파일 내 `post-update-cmd` 스크립트에 `vendor:publish --tag=laravel-assets` 명령어를 추가하는 것이 좋습니다.

```json
{
    "scripts": {
        "post-update-cmd": [
            "@php artisan vendor:publish --tag=laravel-assets --ansi --force"
        ]
    }
}
```

<a name="running-horizon"></a>
## Horizon 실행

`config/horizon.php`에서 supervisor와 워커를 설정한 후, `horizon` 아티즌 명령어로 Horizon을 실행할 수 있습니다. 이 명령어 하나로 현재 환경에 맞게 설정된 모든 워커 프로세스가 시작됩니다.

```shell
php artisan horizon
```

Horizon 프로세스를 일시정지하거나 다시 동작하도록 하려면, `horizon:pause`와 `horizon:continue` 아티즌 명령어를 사용할 수 있습니다.

```shell
php artisan horizon:pause

php artisan horizon:continue
```

특정 Horizon [supervisor](#supervisors)별로 일시정지/계속 동작을 조정하고 싶다면, `horizon:pause-supervisor`와 `horizon:continue-supervisor` 명령어를 사용할 수 있습니다.

```shell
php artisan horizon:pause-supervisor supervisor-1

php artisan horizon:continue-supervisor supervisor-1
```

현재 Horizon 프로세스의 상태는 `horizon:status` 아티즌 명령어로 확인할 수 있습니다.

```shell
php artisan horizon:status
```

Horizon 프로세스를 정상적으로 종료하려면 `horizon:terminate` 명령어를 사용하세요. 이 명령어를 실행하면, 현재 처리 중인 작업은 모두 완료된 후에 프로세스가 종료됩니다.

```shell
php artisan horizon:terminate
```

<a name="deploying-horizon"></a>
### Horizon 배포

애플리케이션 서버에 Horizon을 실제로 배포할 때는, `php artisan horizon` 명령어를 모니터링하고 갑작스럽게 종료될 경우 자동으로 재시작해주는 프로세스 모니터를 구성하는 것이 좋습니다. 걱정하지 마세요. 아래에서 프로세스 모니터 설치 방법을 자세히 설명합니다.

애플리케이션 배포 과정에서는, Horizon 프로세스를 종료해주어야 합니다. 그러면 프로세스 모니터가 이를 감지하고, 코드 변경사항이 반영된 상태로 다시 실행하게 됩니다.

```shell
php artisan horizon:terminate
```

<a name="installing-supervisor"></a>
#### Supervisor 설치

Supervisor는 리눅스 운영체제용 프로세스 모니터로, `horizon` 프로세스가 실행 중단될 때 자동으로 다시 시작할 수 있게 해줍니다. Ubuntu에서 Supervisor를 설치하려면 아래 명령어를 사용하면 됩니다. Ubuntu가 아니라면, 사용하는 운영체제의 패키지 관리자에서 Supervisor를 설치하십시오.

```shell
sudo apt-get install supervisor
```

> [!NOTE]
> Supervisor 직접 설정이 부담스럽게 느껴진다면, [Laravel Forge](https://forge.laravel.com)를 이용해보세요. 이 서비스는 Supervisor를 자동으로 설치하고 설정까지 해줍니다.

<a name="supervisor-configuration"></a>
#### Supervisor 설정

Supervisor의 설정 파일은 서버의 `/etc/supervisor/conf.d` 디렉터리에 보관됩니다. 이 디렉터리 안에 원하는 만큼의 설정 파일을 만들어서, 각 프로세스를 어떻게 모니터링할지 지정할 수 있습니다. 예를 들어 `horizon.conf` 파일을 만들어 아래와 같이 Horizon 프로세스를 시작하고 모니터링하도록 할 수 있습니다.

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

Supervisor 설정 시, `stopwaitsecs`의 값은 가장 오래 걸리는 작업의 실행 시간(초)보다 커야 합니다. 그렇지 않으면 Supervisor가 작업이 끝나기 전에 해당 작업을 강제 종료시킬 수 있습니다.

> [!WARNING]
> 위 예제들은 Ubuntu 계열 서버에서 유효합니다. 하지만 Supervisor 설정 파일의 위치나 확장자는 사용하는 운영체제에 따라 다를 수 있습니다. 정확한 정보는 서버의 공식 문서를 참고하세요.

<a name="starting-supervisor"></a>
#### Supervisor 시작

설정 파일을 만든 후에는 아래와 같은 명령어로 Supervisor 설정을 업데이트하고, 모니터링되는 프로세스를 시작할 수 있습니다.

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start horizon
```

> [!NOTE]
> Supervisor 사용에 대한 자세한 내용은 [Supervisor 공식 문서](http://supervisord.org/index.html)를 참고하세요.

<a name="tags"></a>
## 태그

Horizon을 사용하면 작업, 메일 전송 객체, 브로드캐스트 이벤트, 알림, 큐에 저장된 이벤트 리스너 등에 “태그”를 지정할 수 있습니다. 실제로 Horizon은 대부분의 작업에 대해 Eloquent 모델이 연결되어 있으면 자동으로 지능적으로 태그를 생성합니다. 예를 들어, 다음과 같은 작업 코드를 살펴보세요.

```
<?php

namespace App\Jobs;

use App\Models\Video;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RenderVideo implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The video instance.
     *
     * @var \App\Models\Video
     */
    public $video;

    /**
     * Create a new job instance.
     *
     * @param  \App\Models\Video  $video
     * @return void
     */
    public function __construct(Video $video)
    {
        $this->video = $video;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        //
    }
}
```

이 작업이 `id` 속성이 `1`인 `App\Models\Video` 인스턴스와 함께 큐에 들어가면, 자동으로 `App\Models\Video:1`과 같은 태그가 지정됩니다. Horizon은 작업의 속성들에서 Eloquent 모델이 있는지 확인한 후, 모델 클래스명과 기본 키를 조합해 태그를 생성합니다.

```
use App\Jobs\RenderVideo;
use App\Models\Video;

$video = Video::find(1);

RenderVideo::dispatch($video);
```

<a name="manually-tagging-jobs"></a>
#### 작업에 직접 태그 지정하기

큐 작업 객체에 직접 태그를 지정하고 싶다면, 클래스에 `tags` 메서드를 정의하면 됩니다.

```
class RenderVideo implements ShouldQueue
{
    /**
     * 작업에 지정할 태그를 반환합니다.
     *
     * @return array
     */
    public function tags()
    {
        return ['render', 'video:'.$this->video->id];
    }
}
```

<a name="notifications"></a>
## 알림

> [!WARNING]
> Horizon에서 Slack 또는 SMS 알림을 설정할 때는, 해당 알림 채널의 [사전 조건](/docs/9.x/notifications)을 반드시 확인하세요.

특정 큐에서 대기 시간이 너무 길어지면 알림을 받고 싶을 때는 `Horizon::routeMailNotificationsTo`, `Horizon::routeSlackNotificationsTo`, `Horizon::routeSmsNotificationsTo` 메서드를 사용할 수 있습니다. 이 메서드들은 애플리케이션의 `App\Providers\HorizonServiceProvider`의 `boot` 메서드에서 호출할 수 있습니다.

```
/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    parent::boot();

    Horizon::routeSmsNotificationsTo('15556667777');
    Horizon::routeMailNotificationsTo('example@example.com');
    Horizon::routeSlackNotificationsTo('slack-webhook-url', '#channel');
}
```

<a name="configuring-notification-wait-time-thresholds"></a>
#### 알림 대기 시간 임계값 설정

얼마나 오래 대기해야 "대기 시간 초과(long wait)"로 간주할지 설정하려면, 애플리케이션의 `config/horizon.php` 파일의 `waits` 설정 옵션을 이용하면 됩니다. 이 옵션에서는 연결/큐 조합별로 임계값을 초 단위로 지정할 수 있습니다.

```
'waits' => [
    'redis:default' => 60,
    'redis:critical,high' => 90,
],
```

<a name="metrics"></a>
## 메트릭

Horizon에는 작업, 큐의 대기 시간과 처리량 정보를 제공하는 메트릭 대시보드가 포함되어 있습니다. 이 대시보드 데이터를 계속 쌓으려면, 애플리케이션의 [스케줄러](/docs/9.x/scheduling)를 통해 5분마다 Horizon의 `snapshot` 아티즌 명령어가 실행되도록 설정해야 합니다.

```
/**
 * 애플리케이션의 명령어 스케줄을 정의합니다.
 *
 * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
 * @return void
 */
protected function schedule(Schedule $schedule)
{
    $schedule->command('horizon:snapshot')->everyFiveMinutes();
}
```

<a name="deleting-failed-jobs"></a>
## 실패한 작업 삭제

실패한 작업을 삭제하려면 `horizon:forget` 명령어를 사용하면 됩니다. 이 명령어는 삭제할 실패한 작업의 ID 또는 UUID를 인수로 받습니다.

```shell
php artisan horizon:forget 5
```

<a name="clearing-jobs-from-queues"></a>
## 큐에서 작업 비우기

애플리케이션의 기본 큐에서 모든 작업을 삭제하려면 `horizon:clear` 아티즌 명령어를 사용할 수 있습니다.

```shell
php artisan horizon:clear
```

특정 큐의 작업만 비우고 싶다면 `queue` 옵션을 지정하세요.

```shell
php artisan horizon:clear --queue=emails
```
