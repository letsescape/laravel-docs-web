# 라라벨 Horizon (Laravel Horizon)

- [소개](#introduction)
- [설치](#installation)
    - [설정](#configuration)
    - [부하 분산 전략](#balancing-strategies)
    - [대시보드 접근 권한 관리](#dashboard-authorization)
    - [무시되는 작업(Silenced Jobs)](#silenced-jobs)
- [Horizon 업그레이드](#upgrading-horizon)
- [Horizon 실행](#running-horizon)
    - [Horizon 배포](#deploying-horizon)
- [태그](#tags)
- [알림](#notifications)
- [메트릭](#metrics)
- [실패한 작업 삭제하기](#deleting-failed-jobs)
- [큐에서 작업 비우기](#clearing-jobs-from-queues)

<a name="introduction"></a>
## 소개

> [!NOTE]
> 라라벨 Horizon을 본격적으로 사용하기 전에, 라라벨의 [기본 큐 서비스](/docs/queues)를 먼저 익히는 것이 좋습니다. Horizon은 라라벨의 큐 시스템에 여러 부가 기능을 더해주기 때문에, 라라벨의 기본 큐 기능에 익숙하지 않다면 Horizon의 일부 개념이 다소 혼란스러울 수 있습니다.

[Laravel Horizon](https://github.com/laravel/horizon)은 라라벨 기반의 [Redis 큐](/docs/queues) 시스템을 위한 아름다운 대시보드와 코드 중심 구성 방식을 제공합니다. Horizon을 통해 작업 처리량, 실행 시간, 작업 실패 건수 등 큐 시스템의 핵심 지표들을 손쉽게 모니터링할 수 있습니다.

Horizon을 사용하면 모든 큐 워커(작업자) 설정이 하나의 간단한 구성 파일에 보관됩니다. 애플리케이션의 워커 설정을 버전 관리되는 파일로 정의함으로써, 배포 시 손쉽게 큐 작업자 수를 조절하거나 설정을 수정할 수 있습니다.

<img src="https://laravel.com/img/docs/horizon-example.png"/>

<a name="installation"></a>
## 설치

> [!WARNING]
> 라라벨 Horizon은 큐 백엔드로 [Redis](https://redis.io) 사용을 반드시 요구합니다. 따라서 애플리케이션의 `config/queue.php` 설정 파일에서 큐 연결이 반드시 `redis`로 되어 있는지 확인해야 합니다.

Composer 패키지 관리자를 사용하여 프로젝트에 Horizon을 설치할 수 있습니다:

```shell
composer require laravel/horizon
```

설치가 끝나면, `horizon:install` 아티즌 명령어로 Horizon의 자산 파일을 공개(publish)해 주세요:

```shell
php artisan horizon:install
```

<a name="configuration"></a>
### 설정

자산 파일 공개 후, Horizon의 주요 설정 파일은 `config/horizon.php`에 위치하게 됩니다. 이 파일에서 애플리케이션의 큐 워커(작업자) 관련 옵션을 자유롭게 구성할 수 있습니다. 각 옵션에는 해당 목적에 대한 설명이 포함되어 있으니, 설정 파일을 꼼꼼히 확인하시는 것이 좋습니다.

> [!WARNING]
> Horizon은 내부적으로 `horizon`이라는 이름의 Redis 연결을 사용합니다. 이 이름은 예약되어 있으므로, `database.php` 설정 파일에서 다른 Redis 연결에 `horizon`이라는 이름을 할당하거나, `horizon.php`의 `use` 옵션 값으로 사용하면 안 됩니다.

<a name="environments"></a>
#### 환경 설정

설치가 완료되면, 가장 먼저 살펴봐야 할 중요한 Horizon 설정 옵션이 `environments`입니다. 이 옵션은 애플리케이션이 실행되는 여러 환경별로 워커 프로세스에 대한 옵션을 정의하는 배열입니다. 기본적으로 `production`(운영)과 `local`(로컬) 환경이 포함되어 있지만, 필요에 따라 더 많은 환경을 자유롭게 추가할 수 있습니다:

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

또한, 환경 이름 대신 `*`(와일드카드)을 사용하여, 위에 명시된 환경 외에 일치하는 환경이 없을 때 적용되는 기본 환경 설정을 지정할 수 있습니다:

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

Horizon 실행 시, 현재 애플리케이션이 동작 중인 환경에 맞춰 해당 환경에 지정된 워커 프로세스 설정을 사용합니다. 일반적으로 사용되는 환경은 `APP_ENV` [환경 변수](/docs/configuration#determining-the-current-environment)의 값에 따라 결정됩니다. 예를 들어, 기본적으로 `local` 환경에서는 3개의 워커 프로세스를 시작하고, 각 큐에 적절하게 프로세스를 자동으로 분배합니다. 반면, 기본 `production` 환경에서는 최대 10개의 워커 프로세스가 사용되고, 큐별로 워커가 자동 분산됩니다.

> [!WARNING]
> `horizon` 설정 파일의 `environments` 항목에는 Horizon을 실행하려는 모든 [환경](/docs/configuration#environment-configuration)에 대한 설정 항목이 반드시 포함되어야 합니다.

<a name="supervisors"></a>
#### Supervisor

Horizon의 기본 설정 파일을 보면, 각 환경별로 하나 이상의 "supervisor"를 정의할 수 있습니다. 기본적으로 `supervisor-1`이라는 이름으로 정의되어 있지만, supervisor의 이름은 자유롭게 지정할 수 있습니다. 각 supervisor는 여러 워커 프로세스 그룹을 "감독"하며, 큐 간 워커 프로세스 분배 등 관리를 담당합니다.

특정 환경에서 여러 supervisor를 추가하여, 서로 다른 큐에 대해 별도의 분산 전략이나 워커 수를 지정하고 싶을 때 사용할 수 있습니다.

<a name="maintenance-mode"></a>
#### 유지 보수 모드

애플리케이션이 [유지 보수 모드](/docs/configuration#maintenance-mode)에 들어간 동안에는, Horizon이 작업을 처리하지 않습니다. 만약 유지 보수 모드에서도 큐 작업을 계속 처리하려면, supervisor의 `force` 옵션을 `true`로 설정해야 합니다:

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

Horizon 기본 설정 파일에는 `defaults`라는 옵션도 보실 수 있습니다. 이 옵션은 [supervisor](#supervisors)에 대해 적용할 기본값을 지정합니다. supervisor 별 설정을 한 번에 공통적으로 지정할 수 있으니, 중복되는 설정을 반복 입력하지 않도록 활용하면 편리합니다.

<a name="balancing-strategies"></a>
### 부하 분산 전략

라라벨의 기본 큐 시스템과 달리, Horizon에서는 워커(작업자) 분산 방식을 `simple`, `auto`, `false` 중에서 선택할 수 있습니다. `simple` 전략은 들어오는 작업을 워커 프로세스에 균등하게 분배합니다:

```
'balance' => 'simple',
```

`auto` 전략(설정 파일의 기본값)은 각 큐의 현재 작업량에 따라 큐별 워커 프로세스 수를 자동으로 조절합니다. 예를 들어 `notifications` 큐에 1,000개의 대기 작업이 있고, `render` 큐는 비어 있다면 Horizon은 모든 워커를 일시적으로 `notifications` 큐에 배정하여 작업이 끝날 때까지 집중적으로 처리합니다.

`auto` 전략을 사용할 때는 `minProcesses`와 `maxProcesses` 옵션을 사용해, 큐별 최소 프로세스 수와 전체 워커 프로세스의 최대 개수를 제어할 수 있습니다:

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

`autoScalingStrategy` 옵션에 따라 Horizon이 큐를 비우는 데 걸리는 전체 시간(`time` 전략) 기준으로 워커를 추가할지, 아니면 큐에 남아 있는 작업 개수(`size` 전략) 기준으로 할지 결정합니다.

`balanceMaxShift`와 `balanceCooldown` 옵션으로 워커 수를 얼마나 빠르게 조정할 지를 정할 수 있습니다. 이 예시에서는 최대 1개의 프로세스가 3초마다 생성되거나 제거됩니다. 애플리케이션 특성에 맞게 설정값을 조정할 수 있습니다.

`balance` 옵션을 `false`로 설정하면, 라라벨의 기본 동작과 같이 설정 파일에 나열된 순서대로 큐가 처리됩니다.

<a name="dashboard-authorization"></a>
### 대시보드 접근 권한 관리

Horizon 대시보드에는 `/horizon` 경로를 통해 접근할 수 있습니다. 기본적으로 `local` 환경에서만 접근이 허용되어 있습니다. 그러나 `app/Providers/HorizonServiceProvider.php` 파일에 있는 [인가 게이트(authorization gate)](/docs/authorization#gates) 정의를 통해, **로컬 이외 환경**에서의 접근 제어를 자유롭게 할 수 있습니다. 이 게이트를 필요에 따라 수정하여 Horizon 접근 권한을 제한할 수 있습니다:

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

라라벨은 게이트 클로저에 인증된 사용자 객체를 자동으로 주입합니다. 만약 IP 제한 등 다른 방식으로 Horizon 보안을 적용하고 있어 사용자 로그인이 필요 없는 상황이라면, 위의 예시에서 클로저 시그니처를 `function (User $user = null)`로 바꿔주어야 라라벨이 인증 절차를 요구하지 않습니다.

<a name="silenced-jobs"></a>
### 무시되는 작업(Silenced Jobs)

특정 작업(예: 일부 애플리케이션 또는 외부 패키지에서 발생하는 작업)이 "완료된 작업" 목록에 불필요하게 남는 것을 원하지 않는 경우, 해당 작업을 무시(사일런스)할 수 있습니다. `horizon` 설정 파일의 `silenced` 옵션에 클래스 이름을 추가하면 됩니다:

```php
'silenced' => [
    App\Jobs\ProcessPodcast::class,
],
```

또는, 무시하고 싶은 작업 클래스에 `Laravel\Horizon\Contracts\Silenced` 인터페이스를 구현하면, 설정 배열에 추가하지 않아도 자동으로 무시됩니다:

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

Horizon의 메이저 버전을 업그레이드할 때는, 반드시 [업그레이드 가이드](https://github.com/laravel/horizon/blob/master/UPGRADE.md)를 꼼꼼하게 확인하시기 바랍니다.

<a name="running-horizon"></a>
## Horizon 실행

애플리케이션의 `config/horizon.php` 파일에서 supervisor와 worker 설정을 마쳤다면, `horizon` 아티즌 명령어로 Horizon을 실행할 수 있습니다. 이 명령어 하나만으로 현재 환경에 맞는 모든 워커 프로세스가 한 번에 시작됩니다:

```shell
php artisan horizon
```

Horizon 프로세스를 일시 중지시키거나, 다시 작업 처리를 시작하려면 각각 `horizon:pause` 와 `horizon:continue` 아티즌 명령어를 사용할 수 있습니다:

```shell
php artisan horizon:pause

php artisan horizon:continue
```

특정 Horizon [supervisor](#supervisors)만 일시 중지/재개하려면 `horizon:pause-supervisor`와 `horizon:continue-supervisor` 명령어를 사용할 수 있습니다:

```shell
php artisan horizon:pause-supervisor supervisor-1

php artisan horizon:continue-supervisor supervisor-1
```

현재 Horizon 프로세스의 상태를 확인하려면 `horizon:status` 명령어를 사용합니다:

```shell
php artisan horizon:status
```

특정 Horizon [supervisor](#supervisors)의 상태만 확인하고 싶다면 `horizon:supervisor-status` 명령어를 사용할 수 있습니다:

```shell
php artisan horizon:supervisor-status supervisor-1
```

Horizon 프로세스를 정상적으로 종료(우아하게 종료)하려면 `horizon:terminate` 명령어를 사용하면 됩니다. 이때, 실행 중인 작업들은 모두 처리 완료 후에 Horizon이 멈춥니다:

```shell
php artisan horizon:terminate
```

<a name="deploying-horizon"></a>
### Horizon 배포

애플리케이션을 실제 서버에 운영 환경으로 배포할 때는, `php artisan horizon` 명령어를 모니터링하는 별도의 프로세스 모니터를 함께 설정하는 것이 매우 중요합니다. 만약 Horizon 프로세스가 예기치 않게 종료될 경우 자동으로 재시작되도록 해야 하기 때문입니다. 아래에서 대표적인 프로세스 모니터 설정 방법을 확인할 수 있습니다.

애플리케이션 배포 시에는 코드 변경 사항이 적용될 수 있도록 Horizon 프로세스를 종료하고, 프로세스 모니터가 새로운 프로세스를 자동으로 실행하도록 합니다:

```shell
php artisan horizon:terminate
```

<a name="installing-supervisor"></a>
#### Supervisor 설치

Supervisor는 리눅스 운영체제에서 널리 쓰이는 프로세스 모니터 도구로, `horizon` 프로세스가 중지될 경우 자동으로 재시작시켜 줍니다. Ubuntu에서 Supervisor를 설치하려면 다음과 같은 명령어를 사용할 수 있습니다. 다른 리눅스 배포판을 사용한다면, 운영체제용 패키지 관리자를 이용해 설치하세요.

```shell
sudo apt-get install supervisor
```

> [!NOTE]
> Supervisor 설정에 어려움을 느끼신다면, [Laravel Cloud](https://cloud.laravel.com) 서비스를 사용해서 라라벨 애플리케이션의 백그라운드 프로세스를 쉽게 관리할 수도 있습니다.

<a name="supervisor-configuration"></a>
#### Supervisor 설정

Supervisor 설정 파일은 대개 서버의 `/etc/supervisor/conf.d` 디렉터리에 저장됩니다. 이 디렉터리에 supervisor가 관리해야 할 각 프로세스에 대한 설정 파일을 생성할 수 있습니다. 예를 들어 `horizon.conf` 파일을 만들어 Horizon 프로세스를 시작하고 감시하도록 설정할 수 있습니다:

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

Supervisor 설정 시에는 `stopwaitsecs` 값이 애플리케이션에서 가장 오래 실행되는 작업의 시간(초)보다 반드시 커야 합니다. 그렇지 않으면 Supervisor가 해당 작업을 처리 중에 강제로 종료해버릴 수 있습니다.

> [!WARNING]
> 위 예제는 Ubuntu 기반 서버에 적용할 수 있는 설정 예시이며, Supervisor 설정 파일의 위치나 확장자는 서버 운영체제에 따라 다를 수 있습니다. 사용 중인 서버 환경의 매뉴얼을 참고하세요.

<a name="starting-supervisor"></a>
#### Supervisor 시작

설정 파일을 작성했다면 아래 명령어로 Supervisor의 구성을 갱신하고, Horizon 프로세스를 시작할 수 있습니다:

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start horizon
```

> [!NOTE]
> Supervisor 사용법에 대한 더욱 자세한 내용은 [Supervisor 공식 문서](http://supervisord.org/index.html)를 참고하세요.

<a name="tags"></a>
## 태그

Horizon에서는 작업(메일 발송, 브로드캐스트 이벤트, 알림, 큐 이벤트 리스너 등)에 "태그"(tags)를 부여할 수 있습니다. 실제로 Horizon은 대부분의 작업에 대해 Eloquent 모델이 연관되어 있으면, 이를 자동으로 인식하여 작업에 태그를 붙여줍니다. 예를 들어, 아래의 작업 클래스를 살펴보세요:

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

이 작업이 `id` 속성이 1인 `App\Models\Video` 인스턴스와 함께 큐에 추가된다면, 작업에는 자동으로 `App\Models\Video:1` 라는 태그가 붙게 됩니다. 이는 Horizon이 작업의 속성에서 Eloquent 모델을 찾아, 모델의 클래스명과 기본 키를 사용해 똑똑하게 태그를 지정하기 때문입니다:

```php
use App\Jobs\RenderVideo;
use App\Models\Video;

$video = Video::find(1);

RenderVideo::dispatch($video);
```

<a name="manually-tagging-jobs"></a>
#### 작업에 직접 태그 지정하기

큐에 들어가는 객체에 대해 직접 태그를 지정하고 싶다면, 해당 클래스에 `tags` 메서드를 정의하면 됩니다:

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
#### 이벤트 리스너에 직접 태그 지정하기

이벤트 리스너가 큐에 들어갈 때, Horizon은 이벤트 인스턴스를 `tags` 메서드에 인자로 넘겨줍니다. 이를 활용해 이벤트 데이터 기반으로 태그를 추가할 수 있습니다:

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
> Horizon에서 Slack 또는 SMS 등의 알림 전송 기능을 사용할 때는, 해당 [알림 채널의 사전 준비 조건](/docs/notifications)을 꼭 확인하시기 바랍니다.

큐 대기 시간이 너무 길어지면 알림을 받고 싶을 때, `Horizon::routeMailNotificationsTo`, `Horizon::routeSlackNotificationsTo`, `Horizon::routeSmsNotificationsTo` 메서드를 사용할 수 있습니다. 이러한 메서드는 애플리케이션의 `App\Providers\HorizonServiceProvider`의 `boot` 메서드 안에서 호출하면 됩니다:

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
#### 알림 대기 시간 임계값 설정

"대기 시간이 길다"고 간주하는 기준을 설정하려면, `config/horizon.php` 파일에서 `waits` 옵션을 사용하면 됩니다. 이 옵션을 통해, 연결 및 큐 조합별 알림 임계값(초 단위)을 구체적으로 지정할 수 있습니다. 지정되지 않은 큐 조합은 기본적으로 60초로 간주됩니다:

```php
'waits' => [
    'redis:critical' => 30,
    'redis:default' => 60,
    'redis:batch' => 120,
],
```

<a name="metrics"></a>
## 메트릭

Horizon에는 각 작업 및 큐의 대기 시간과 처리량 정보를 제공하는 메트릭 대시보드가 내장되어 있습니다. 이 정보를 대시보드에 채우려면, 애플리케이션의 `routes/console.php` 파일에서 Horizon의 `snapshot` 아티즌 명령어가 5분마다 실행되도록 예약해주어야 합니다:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('horizon:snapshot')->everyFiveMinutes();
```

<a name="deleting-failed-jobs"></a>
## 실패한 작업 삭제하기

실패한 작업을 삭제하고 싶다면 `horizon:forget` 명령어를 사용할 수 있습니다. 이 명령어는 실패한 작업의 ID 또는 UUID를 인수로 받습니다:

```shell
php artisan horizon:forget 5
```

모든 실패한 작업을 한 번에 삭제하고 싶다면, `--all` 옵션을 명령어에 추가하면 됩니다:

```shell
php artisan horizon:forget --all
```

<a name="clearing-jobs-from-queues"></a>
## 큐에서 작업 비우기

애플리케이션의 기본 큐에 쌓인 모든 작업을 한 번에 지우고 싶을 때는 `horizon:clear` 아티즌 명령어를 사용할 수 있습니다:

```shell
php artisan horizon:clear
```

특정 큐에 쌓인 작업만 삭제하고 싶다면, `queue` 옵션을 사용하여 큐 이름을 명시할 수 있습니다:

```shell
php artisan horizon:clear --queue=emails
```
