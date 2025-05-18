# 라라벨 Horizon (Laravel Horizon)

- [소개](#introduction)
- [설치](#installation)
    - [설정](#configuration)
    - [밸런싱 전략](#balancing-strategies)
    - [대시보드 접근 권한 설정](#dashboard-authorization)
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

> [!TIP]
> 라라벨 Horizon을 사용하기 전에, 라라벨의 기본 [큐 서비스](/docs/8.x/queues)에 먼저 익숙해지시는 것이 좋습니다. Horizon은 라라벨 큐의 추가 기능을 제공하므로, 큐의 기본 개념을 이해하지 못한 상태에서는 혼란스러울 수 있습니다.

[Laravel Horizon](https://github.com/laravel/horizon)은 라라벨 기반 [Redis 큐](/docs/8.x/queues)용으로 아름다운 대시보드와 코드 기반 설정 방식을 제공합니다. Horizon을 활용하면, 큐 시스템의 주요 지표(작업 처리량, 실행 시간, 작업 실패 발생 등)를 손쉽게 모니터링할 수 있습니다.

Horizon을 사용하면 모든 큐 워커 설정이 하나의 단순한 설정 파일에 저장됩니다. 워커 설정을 버전 관리되는 파일에 정의하면, 애플리케이션을 배포할 때 쉽게 큐 워커의 수를 조정하거나 설정을 변경할 수 있습니다.

<img src="https://laravel.com/img/docs/horizon-example.png" />

<a name="installation"></a>
## 설치

> [!NOTE]
> 라라벨 Horizon은 큐 시스템을 사용할 때 반드시 [Redis](https://redis.io)를 필요로 합니다. 따라서, 애플리케이션의 `config/queue.php` 설정 파일에서 큐 연결을 `redis`로 설정했는지 반드시 확인하세요.

Composer 패키지 매니저를 사용하여 프로젝트에 Horizon을 설치할 수 있습니다.

```
composer require laravel/horizon
```

설치가 완료되면, `horizon:install` Artisan 명령어로 Horizon의 에셋을 배포합니다:

```
php artisan horizon:install
```

<a name="configuration"></a>
### 설정

Horizon의 에셋을 배포한 후에는, 기본 설정 파일이 `config/horizon.php`에 위치하게 됩니다. 이 설정 파일에서는 애플리케이션의 큐 워커 옵션을 상세히 설정할 수 있습니다. 각 설정 옵션에는 해당 옵션의 목적이 잘 설명되어 있으니, 반드시 파일을 꼼꼼히 살펴보시기 바랍니다.

> [!NOTE]
> Horizon은 내부적으로 `horizon`이라는 이름의 Redis 연결을 사용합니다. 이 Redis 연결 이름은 예약어이므로, `database.php` 설정 파일이나 `horizon.php` 설정 파일의 `use` 옵션 값 등, 다른 Redis 연결에 할당해서는 안 됩니다.

<a name="environments"></a>
#### 환경 설정

설치 후 가장 먼저 익숙해져야 할 Horizon 설정 옵션은 `environments` 설정입니다. 이 설정은 애플리케이션이 실행되는 각각의 환경과, 해당 환경에서의 워커 프로세스 옵션을 정의하는 배열입니다. 기본적으로 `production`과 `local` 환경이 포함되어 있으나, 필요에 따라 원하는 만큼 환경을 추가할 수 있습니다.

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

Horizon을 실행하면, 현재 애플리케이션이 동작하는 환경에 맞는 워커 프로세스 설정 옵션이 적용됩니다. 일반적으로 환경은 `APP_ENV` [환경 변수](/docs/8.x/configuration#determining-the-current-environment)의 값으로 결정됩니다. 예를 들어, 기본값인 `local` 환경에서는 3개의 워커 프로세스가 실행되며, 각 큐에 할당된 워커의 개수를 자동으로 조정합니다. 기본 `production` 환경에서는 최대 10개의 워커 프로세스가 실행되며, 각 큐별 워커 개수도 자동으로 밸런싱됩니다.

> [!NOTE]
> Horizon을 사용하려는 각각의 [환경](/docs/8.x/configuration#environment-configuration)에 대해 `horizon` 설정 파일의 `environments` 항목에 반드시 엔트리를 추가해야 합니다.

<a name="supervisors"></a>
#### Supervisor

Horizon의 기본 설정 파일을 살펴보면, 각 환경에 하나 이상의 "supervisor"를 둘 수 있습니다. 기본적으로 설정 파일에는 `supervisor-1`이라는 이름이 정의되어 있지만, supervisor의 이름은 자유롭게 사용할 수 있습니다. 역할로 보면, supervisor는 일정한 워커 프로세스 묶음을 "감독"하며, 여러 큐에 워커 프로세스를 얼마나 할당할지 균형을 맞추는 역할을 합니다.

해당 환경에 새로운 워커 프로세스 그룹을 추가하고 싶다면, supervisor를 추가로 정의할 수 있습니다. 예를 들어, 특정 큐에만 적용할 밸런싱 전략이나 워커 숫자를 다르게 하고 싶을 때 supervisor를 추가하면 됩니다.

<a name="default-values"></a>
#### 기본값 설정

Horizon의 기본 설정 파일에는 `defaults`라는 설정 옵션이 제공됩니다. 이 옵션을 통해, [supervisor](#supervisors) 각각에 적용되는 기본값을 한 번에 지정할 수 있습니다. supervisor 구성 시 중복되는 값을 피할 수 있어, 보다 효율적으로 설정할 수 있습니다.

<a name="balancing-strategies"></a>
### 밸런싱 전략

라라벨의 기본 큐 시스템과 다르게, Horizon에서는 워커 밸런싱 전략을 세 가지 중에서 선택할 수 있습니다: `simple`, `auto`, `false`.  
`simple` 전략(기본값)은 들어오는 작업을 워커 프로세스에 균등하게 분배합니다.

```
'balance' => 'simple',
```

`auto` 전략을 선택하면, 각 큐의 현재 대기 작업 수에 따라 워커 프로세스 수가 자동으로 조절됩니다. 예를 들어, `notifications` 큐에 1,000개의 대기 작업이 있고 `render` 큐는 비어 있다면, Horizon은 필요한 만큼 더 많은 워커 프로세스를 `notifications` 큐에 할당해 해당 큐가 비워질 때까지 작업합니다.

`auto` 전략을 사용할 때는, Horizon이 얼마만큼 워커 수를 늘이거나 줄일지 결정하는 `minProcesses`와 `maxProcesses` 옵션을 설정할 수 있습니다.

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

`balanceMaxShift`와 `balanceCooldown`은 Horizon이 얼마나 빠르게 워커 수요 변화에 대응할지 조절하는 값입니다. 예를 들어 위 설정에서는 3초마다 최대 한 개의 프로세스를 새로 만들거나 종료합니다. 애플리케이션 특성에 맞게 자유롭게 조정하세요.

`balance` 옵션이 `false`로 설정되면 기본 라라벨 동작대로 큐가 설정에 나열된 순서대로 처리됩니다.

<a name="dashboard-authorization"></a>
### 대시보드 접근 권한 설정

Horizon은 `/horizon` 경로에서 대시보드를 제공합니다. 기본적으로 이 대시보드는 `local` 환경에서만 접근할 수 있습니다. 하지만 `app/Providers/HorizonServiceProvider.php` 파일에서 [허가 게이트(authorization gate)](/docs/8.x/authorization#gates)를 정의하여, **로컬이 아닌 환경**에서도 대시보드 접근 권한을 제어할 수 있습니다. 이 게이트를 필요에 따라 수정하면, Horizon 대시보드 접근을 원하는 대로 제한할 수 있습니다.

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

라라벨은 게이트 클로저에 인증된 사용자를 자동으로 주입합니다. 만약 IP 제한 등 다른 방식으로 Horizon 접근을 제한한다면, 사용자에게 "로그인"이 필요하지 않을 수도 있습니다. 이 경우, 위 예시의 클로저 시그니처를 `function ($user)`에서 `function ($user = null)`로 변경하여, 인증이 필수가 아니도록 설정해야 합니다.

<a name="upgrading-horizon"></a>
## Horizon 업그레이드

Horizon의 주요 버전으로 업그레이드할 때는 [업그레이드 가이드](https://github.com/laravel/horizon/blob/master/UPGRADE.md)를 반드시 꼼꼼히 읽고 확인해야 합니다. 그리고 Horizon을 어떤 버전으로 업그레이드하든, Horizon 에셋을 다시 배포해 주어야 합니다.

```
php artisan horizon:publish
```

에셋을 항상 최신 상태로 유지하고, 향후 업데이트 시 문제를 예방하려면, `composer.json` 파일의 `post-update-cmd` 스크립트에 `horizon:publish` 명령을 추가하는 것이 좋습니다.

```
{
    "scripts": {
        "post-update-cmd": [
            "@php artisan horizon:publish --ansi"
        ]
    }
}
```

<a name="running-horizon"></a>
## Horizon 실행

애플리케이션의 `config/horizon.php`에서 supervisor와 워커를 설정한 다음, `horizon` Artisan 명령어로 Horizon을 실행할 수 있습니다. 이 명령어 한 번으로 현재 환경에 맞는 모든 워커 프로세스가 시작됩니다.

```
php artisan horizon
```

Horizon 프로세스를 일시 정지했다가, 다시 작업을 처리하도록 명령할 수 있습니다. 이 경우 `horizon:pause` 및 `horizon:continue` Artisan 명령어를 사용합니다.

```
php artisan horizon:pause

php artisan horizon:continue
```

특정 Horizon [supervisor](#supervisors)만 선택적으로 일시 중지 혹은 재시작할 수도 있습니다. 이때는 `horizon:pause-supervisor`, `horizon:continue-supervisor` 명령을 사용합니다.

```
php artisan horizon:pause-supervisor supervisor-1

php artisan horizon:continue-supervisor supervisor-1
```

Horizon 프로세스의 현재 상태는 `horizon:status` Artisan 명령어로 확인할 수 있습니다.

```
php artisan horizon:status
```

`horizon:terminate` Artisan 명령어를 사용하면 Horizon 프로세스를 안전하게 종료할 수 있습니다. 이때 이미 처리 중인 작업들은 완료된 뒤 Horizon이 멈추게 됩니다.

```
php artisan horizon:terminate
```

<a name="deploying-horizon"></a>
### Horizon 배포

실제 서버에 Horizon을 배포할 때는, 반드시 프로세스 모니터를 설정하여 `php artisan horizon` 명령을 지속적으로 감시하고, 갑자기 종료될 경우 다시 시작하도록 해야 합니다. 아래에서 프로세스 모니터 설치 방법을 안내하겠습니다.

애플리케이션을 배포할 때마다, Horizon 프로세스를 먼저 종료하도록 하고, 프로세스 모니터가 새로운 코드 변경을 반영하여 다시 시작하도록 하는 것이 좋습니다.

```
php artisan horizon:terminate
```

<a name="installing-supervisor"></a>
#### Supervisor 설치

Supervisor는 리눅스 운영체제용 프로세스 모니터입니다. 만약 `horizon` 프로세스가 중지되면 자동으로 재시작해줍니다. Ubuntu 환경에서 Supervisor를 설치하려면 아래 명령을 사용합니다. Ubuntu가 아닌 경우, 해당 운영체제의 패키지 매니저를 활용하면 됩니다.

```
sudo apt-get install supervisor
```

> [!TIP]
> Supervisor 직접 설정이 부담스럽다면, [Laravel Forge](https://forge.laravel.com) 서비스를 이용하면 Supervisor를 자동으로 설치하고 설정해줍니다.

<a name="supervisor-configuration"></a>
#### Supervisor 설정

Supervisor 설정 파일은 보통 서버의 `/etc/supervisor/conf.d` 디렉터리에 위치합니다. 이 디렉터리 내에 프로세스 감시 방법을 지정할 수 있는 설정 파일을 원하는 만큼 만들 수 있습니다. 예를 들어, `horizon.conf` 파일을 생성해 `horizon` 프로세스의 감시 및 시작을 지정할 수 있습니다.

```
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

> [!NOTE]
> `stopwaitsecs` 값이, 가장 오래 실행되는 작업의 실행 시간(초)보다 커야 합니다. 그렇지 않으면 Supervisor가 작업이 끝나기 전에 강제로 종료시킬 수 있습니다.

<a name="starting-supervisor"></a>
#### Supervisor 시작

설정 파일 생성이 끝나면, 다음 명령어들을 통해 Supervisor 설정을 갱신하고 감시 프로세스를 시작할 수 있습니다.

```
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start horizon
```

> [!TIP]
> Supervisor 실행법에 대한 자세한 내용은 [Supervisor 공식 문서](http://supervisord.org/index.html)를 참고하세요.

<a name="tags"></a>
## 태그

Horizon에서는 작업, 메일 발송 객체, 방송 이벤트, 알림, 큐에 등록된 이벤트 리스너 등에 “태그”를 할당할 수 있습니다. 실제로 Horizon은 작업에 연결된 Eloquent 모델을 기준으로 대부분의 작업들을 자동으로 똑똑하게 태깅합니다. 예를 들어, 아래와 같은 작업을 살펴보겠습니다.

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

이 작업이 `id` 속성이 1인 `App\Models\Video` 인스턴스와 함께 큐에 등록되면, 자동으로 `App\Models\Video:1`이라는 태그를 부여받게 됩니다. Horizon은 작업 객체의 속성들에서 Eloquent 모델을 찾아 해당 클래스명과 기본 키(primary key)를 조합해 자동 태깅을 수행합니다.

```
use App\Jobs\RenderVideo;
use App\Models\Video;

$video = Video::find(1);

RenderVideo::dispatch($video);
```

<a name="manually-tagging-jobs"></a>
#### 작업에 태그를 수동으로 지정하기

큐에 들어가는 객체에 직접 태그를 지정하고 싶다면, 해당 클래스에 `tags` 메서드를 정의하면 됩니다.

```
class RenderVideo implements ShouldQueue
{
    /**
     * Get the tags that should be assigned to the job.
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

> [!NOTE]
> Horizon에서 Slack 또는 SMS 알림을 설정하려면, [해당 알림 채널의 요구 사항](/docs/8.x/notifications)을 반드시 먼저 확인하세요.

큐 중 하나에서 대기 시간이 길어지는 상황을 감지해 알림을 받고 싶을 경우, `Horizon::routeMailNotificationsTo`, `Horizon::routeSlackNotificationsTo`, `Horizon::routeSmsNotificationsTo` 메서드를 사용할 수 있습니다. 이 메서드들은 애플리케이션의 `App\Providers\HorizonServiceProvider` 내부의 `boot` 메서드에서 호출하면 됩니다.

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
#### 알림 대기시간 임계값 설정

얼마나 오랫동안 대기해야 "대기시간 과다"로 판단하는지, 그 기준을 `config/horizon.php` 파일에서 직접 설정할 수 있습니다. 이 파일 내 `waits` 옵션에서 각 연결:큐 조합별로 임계값(초 단위)을 지정할 수 있습니다.

```
'waits' => [
    'redis:default' => 60,
    'redis:critical,high' => 90,
],
```

<a name="metrics"></a>
## 메트릭

Horizon에는 작업, 큐의 대기 시간 및 처리량 등에 대한 정보를 보여주는 메트릭 대시보드가 포함되어 있습니다. 이 대시보드에 데이터를 표시하려면, Horizon의 `snapshot` Artisan 명령어를 애플리케이션의 [스케줄러](/docs/8.x/scheduling)를 활용해 5분마다 실행하도록 등록해야 합니다.

```
/**
 * Define the application's command schedule.
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

실패 처리된 작업을 삭제하려면 `horizon:forget` 명령어를 사용합니다. 이 명령어는 실패한 작업의 ID나 UUID 값을 인수로 받습니다.

```
php artisan horizon:forget 5
```

<a name="clearing-jobs-from-queues"></a>
## 큐에서 작업 비우기

애플리케이션의 기본 큐에 쌓인 작업을 전부 삭제하려면, `horizon:clear` Artisan 명령어를 사용할 수 있습니다.

```
php artisan horizon:clear
```

특정 큐만 비우고 싶다면, `queue` 옵션을 함께 지정합니다.

```
php artisan horizon:clear --queue=emails
```
