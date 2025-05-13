# 작업 스케줄링 (Task Scheduling)

- [소개](#introduction)
- [스케줄 정의하기](#defining-schedules)
    - [Artisan 명령어 스케줄링](#scheduling-artisan-commands)
    - [큐 작업 스케줄링](#scheduling-queued-jobs)
    - [셸 명령어 스케줄링](#scheduling-shell-commands)
    - [스케줄 빈도 옵션](#schedule-frequency-options)
    - [타임존 설정](#timezones)
    - [작업 중복 실행 방지](#preventing-task-overlaps)
    - [단일 서버에서만 작업 실행하기](#running-tasks-on-one-server)
    - [백그라운드 작업 실행](#background-tasks)
    - [유지보수 모드](#maintenance-mode)
    - [스케줄 그룹](#schedule-groups)
- [스케줄러 실행하기](#running-the-scheduler)
    - [분 단위 미만 주기로 작업 실행하기](#sub-minute-scheduled-tasks)
    - [로컬 개발 환경에서 스케줄러 실행하기](#running-the-scheduler-locally)
- [작업 출력 관리](#task-output)
- [작업 후크(Hook) 사용](#task-hooks)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

예전에는 서버에서 스케줄링할 작업마다 직접 cron 설정을 추가해서 관리하는 경우가 많았습니다. 하지만 이는 시간과 관리의 불편함을 유발할 수 있습니다. 예를 들어, 작업 스케줄이 소스 코드로 관리되지 않아서 현재 어떤 작업이 등록되어 있는지 확인하거나 새로운 작업을 추가할 때마다 서버에 SSH로 접속해야 합니다.

라라벨의 명령어 스케줄러는 이러한 문제를 완전히 새로운 방식으로 해결합니다. 스케줄러를 사용하면, 여러분의 라라벨 애플리케이션에서 직접 명확하고 유연하게 명령어 스케줄을 정의할 수 있습니다. 또한, 서버에는 오직 하나의 cron 엔트리만 등록하면 되고, 실제 작업 스케줄은 애플리케이션의 `routes/console.php` 파일에 보통 정의합니다.

<a name="defining-schedules"></a>
## 스케줄 정의하기

모든 예약 작업은 애플리케이션의 `routes/console.php` 파일에 정의할 수 있습니다. 사용 방법을 간단히 예시로 알아보겠습니다. 아래 예제에서는 매일 자정에 호출될 클로저(익명 함수)를 예약하고, 그 안에서 데이터베이스 쿼리를 실행하여 테이블을 비우는 작업을 정의합니다.

```php
<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    DB::table('recent_users')->delete();
})->daily();
```

클로저 외에도, [호출 가능한 객체(invokable object)](https://secure.php.net/manual/en/language.oop5.magic.php#object.invoke) 를 예약할 수도 있습니다. 호출 가능한 객체는 `__invoke` 메서드를 가진 간단한 PHP 클래스입니다.

```php
Schedule::call(new DeleteRecentUsers)->daily();
```

`routes/console.php` 파일을 명령어 정의만 사용하는 용도로 따로 관리하고 싶다면, `bootstrap/app.php` 파일에서 `withSchedule` 메서드를 사용하여 예약 작업을 정의할 수도 있습니다. 이 메서드는 스케줄러 인스턴스를 받는 클로저를 인자로 받습니다.

```php
use Illuminate\Console\Scheduling\Schedule;

->withSchedule(function (Schedule $schedule) {
    $schedule->call(new DeleteRecentUsers)->daily();
})
```

정의된 예약 작업들의 전체 목록과 다음 실행 예정 시간을 확인하려면, `schedule:list` Artisan 명령어를 사용할 수 있습니다.

```shell
php artisan schedule:list
```

<a name="scheduling-artisan-commands"></a>
### Artisan 명령어 스케줄링

클로저 뿐만 아니라, [Artisan 명령어](/docs/artisan)나 시스템 명령어도 예약할 수 있습니다. 예를 들어, `command` 메서드를 사용해서 Artisan 명령어를 이름이나 클래스 명으로 스케줄링할 수 있습니다.

명령어 클래스를 사용할 때는 추가 인수(옵션 포함)를 배열 형태로 전달할 수 있습니다.

```php
use App\Console\Commands\SendEmailsCommand;
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send Taylor --force')->daily();

Schedule::command(SendEmailsCommand::class, ['Taylor', '--force'])->daily();
```

<a name="scheduling-artisan-closure-commands"></a>
#### 클로저로 정의한 Artisan 명령어 스케줄링

클로저로 정의된 Artisan 명령어를 예약하려면, 명령어 정의 뒤에 스케줄 관련 메서드를 체이닝할 수 있습니다.

```php
Artisan::command('delete:recent-users', function () {
    DB::table('recent_users')->delete();
})->purpose('Delete recent users')->daily();
```

클로저 명령어에 인수를 넘겨야 할 경우에는, `schedule` 메서드에 해당 인자들을 전달할 수 있습니다.

```php
Artisan::command('emails:send {user} {--force}', function ($user) {
    // ...
})->purpose('Send emails to the specified user')->schedule(['Taylor', '--force'])->daily();
```

<a name="scheduling-queued-jobs"></a>
### 큐 작업 스케줄링

`job` 메서드를 사용하면 [큐 작업](/docs/queues)을 예약할 수 있습니다. 이 방법을 쓰면, 클로저로 큐를 등록하는 대신 더 간편하게 사용하는 것이 가능합니다.

```php
use App\Jobs\Heartbeat;
use Illuminate\Support\Facades\Schedule;

Schedule::job(new Heartbeat)->everyFiveMinutes();
```

`job` 메서드에 두 번째와 세 번째 인자를 추가로 전달해서, 작업을 어떤 큐 이름과 큐 연결(Connection)으로 보낼지 지정할 수 있습니다.

```php
use App\Jobs\Heartbeat;
use Illuminate\Support\Facades\Schedule;

// "heartbeats" 큐와 "sqs" 연결을 사용해 작업 실행...
Schedule::job(new Heartbeat, 'heartbeats', 'sqs')->everyFiveMinutes();
```

<a name="scheduling-shell-commands"></a>
### 셸 명령어 스케줄링

`exec` 메서드를 사용하면 운영체제에서 명령어를 직접 실행할 수 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::exec('node /home/forge/script.js')->daily();
```

<a name="schedule-frequency-options"></a>
### 스케줄 빈도 옵션

이미 몇 가지 예제에서, 특정 주기로 작업을 실행하는 방법을 알아보았습니다. 라라벨에서는 이외에도 다양한 주기(빈도) 옵션을 사용할 수 있습니다.

<div class="overflow-auto">

| 메서드                             | 설명                                                      |
| ---------------------------------- | -------------------------------------------------------- |
| `->cron('* * * * *');`             | 사용자 지정 cron 스케줄로 작업 실행                        |
| `->everySecond();`                 | 매초마다 작업 실행                                        |
| `->everyTwoSeconds();`             | 2초마다 작업 실행                                         |
| `->everyFiveSeconds();`            | 5초마다 작업 실행                                         |
| `->everyTenSeconds();`             | 10초마다 작업 실행                                        |
| `->everyFifteenSeconds();`         | 15초마다 작업 실행                                        |
| `->everyTwentySeconds();`          | 20초마다 작업 실행                                        |
| `->everyThirtySeconds();`          | 30초마다 작업 실행                                        |
| `->everyMinute();`                 | 매 분마다 작업 실행                                       |
| `->everyTwoMinutes();`             | 2분마다 작업 실행                                         |
| `->everyThreeMinutes();`           | 3분마다 작업 실행                                         |
| `->everyFourMinutes();`            | 4분마다 작업 실행                                         |
| `->everyFiveMinutes();`            | 5분마다 작업 실행                                         |
| `->everyTenMinutes();`             | 10분마다 작업 실행                                        |
| `->everyFifteenMinutes();`         | 15분마다 작업 실행                                        |
| `->everyThirtyMinutes();`          | 30분마다 작업 실행                                        |
| `->hourly();`                      | 매 시간마다 실행                                          |
| `->hourlyAt(17);`                  | 매 시간 17분에 실행                                       |
| `->everyOddHour($minutes = 0);`    | 홀수 시(ex. 1시, 3시)마다 실행                            |
| `->everyTwoHours($minutes = 0);`   | 두 시간마다 실행                                          |
| `->everyThreeHours($minutes = 0);` | 세 시간마다 실행                                          |
| `->everyFourHours($minutes = 0);`  | 네 시간마다 실행                                          |
| `->everySixHours($minutes = 0);`   | 여섯 시간마다 실행                                        |
| `->daily();`                       | 매일 자정에 실행                                          |
| `->dailyAt('13:00');`              | 매일 13:00(오후 1시)에 실행                               |
| `->twiceDaily(1, 13);`             | 매일 1시, 13시에 실행                                     |
| `->twiceDailyAt(1, 13, 15);`       | 매일 1:15, 13:15에 실행                                   |
| `->weekly();`                      | 매주 일요일 00:00에 실행                                  |
| `->weeklyOn(1, '8:00');`           | 매주 월요일 8:00에 실행                                   |
| `->monthly();`                     | 매월 1일 00:00에 실행                                     |
| `->monthlyOn(4, '15:00');`         | 매월 4일 15:00에 실행                                     |
| `->twiceMonthly(1, 16, '13:00');`  | 매월 1일, 16일 13:00에 실행                               |
| `->lastDayOfMonth('15:00');`       | 매월 마지막 날 15:00에 실행                               |
| `->quarterly();`                   | 분기별로 1일 00:00에 실행                                 |
| `->quarterlyOn(4, '14:00');`       | 분기별로 4일 14:00에 실행                                 |
| `->yearly();`                      | 매년 1월 1일 00:00에 실행                                 |
| `->yearlyOn(6, 1, '17:00');`       | 매년 6월 1일 17:00에 실행                                 |
| `->timezone('America/New_York');`  | 작업 시간에 사용할 타임존 지정                             |

</div>

이러한 메서드들은 요일 등 다른 조건과 함께 결합하여, 더욱 세밀하게 스케줄을 제어할 수 있습니다. 예를 들어, 특정 명령어를 매주 월요일에 실행하고 싶다면 아래와 같이 작성할 수 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

// 매주 월요일 오후 1시에 한 번 실행
Schedule::call(function () {
    // ...
})->weekly()->mondays()->at('13:00');

// 평일 08:00~17:00 사이에 매시간 실행
Schedule::command('foo')
    ->weekdays()
    ->hourly()
    ->timezone('America/Chicago')
    ->between('8:00', '17:00');
```

아래는 추가적인 스케줄 제약 조건(조건부 실행)에 대한 목록입니다.

<div class="overflow-auto">

| 메서드                                   | 설명                                     |
| ---------------------------------------- | ---------------------------------------- |
| `->weekdays();`                          | 평일에만 작업 실행                       |
| `->weekends();`                          | 주말에만 작업 실행                       |
| `->sundays();`                           | 일요일에만 작업 실행                     |
| `->mondays();`                           | 월요일에만 작업 실행                     |
| `->tuesdays();`                          | 화요일에만 작업 실행                     |
| `->wednesdays();`                        | 수요일에만 작업 실행                     |
| `->thursdays();`                         | 목요일에만 작업 실행                     |
| `->fridays();`                           | 금요일에만 작업 실행                     |
| `->saturdays();`                         | 토요일에만 작업 실행                     |
| `->days(array\|mixed);`                  | 지정한 요일에만 작업 실행                |
| `->between($startTime, $endTime);`       | 특정 시간 범위 내에서만 작업 실행        |
| `->unlessBetween($startTime, $endTime);` | 특정 시간 범위 외에서만 작업 실행        |
| `->when(Closure);`                       | 지정한 조건이 true일 때만 작업 실행      |
| `->environments($env);`                  | 지정한 환경에서만 작업 실행              |

</div>

<a name="day-constraints"></a>
#### 요일 제약 조건

`days` 메서드를 사용하면 작업이 실행될 요일을 직접 지정할 수 있습니다. 예를 들어, 매주 일요일과 수요일에 매시간 명령어를 실행하려면 다음과 같이 작성합니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send')
    ->hourly()
    ->days([0, 3]);
```

또는, 어떤 요일에 실행할지 지정할 때 `Illuminate\Console\Scheduling\Schedule` 클래스에 정의된 상수를 사용할 수도 있습니다.

```php
use Illuminate\Support\Facades;
use Illuminate\Console\Scheduling\Schedule;

Facades\Schedule::command('emails:send')
    ->hourly()
    ->days([Schedule::SUNDAY, Schedule::WEDNESDAY]);
```

<a name="between-time-constraints"></a>
#### 시간대 제약 조건

`between` 메서드는 작업이 특정 시간 범위 내에서만 실행되도록 제한합니다.

```php
Schedule::command('emails:send')
    ->hourly()
    ->between('7:00', '22:00');
```

반대로, `unlessBetween` 메서드는 지정한 시간 범위에는 작업이 실행되지 않도록 제외할 수 있습니다.

```php
Schedule::command('emails:send')
    ->hourly()
    ->unlessBetween('23:00', '4:00');
```

<a name="truth-test-constraints"></a>
#### 진리값(조건) 기반 제약 조건

`when` 메서드는 주어진 클로저가 `true`를 반환할 경우에만 작업이 실행되도록 제한합니다. 즉, 별도의 조건 검사를 통해 작업 실행 여부를 제어할 수 있습니다.

```php
Schedule::command('emails:send')->daily()->when(function () {
    return true;
});
```

반대로 `skip` 메서드는 반환값이 `true`인 경우 작업이 실행되지 않습니다.

```php
Schedule::command('emails:send')->daily()->skip(function () {
    return true;
});
```

`when` 메서드를 여러 번 체이닝하면, 모든 조건이 `true`일 때만 스케줄된 명령어가 실행됩니다.

<a name="environment-constraints"></a>
#### 환경(Environment) 제약 조건

`environments` 메서드를 사용하면, 지정된 환경(`APP_ENV` [환경 변수](/docs/configuration#environment-configuration))에서만 작업을 실행하도록 제한할 수 있습니다.

```php
Schedule::command('emails:send')
    ->daily()
    ->environments(['staging', 'production']);
```

<a name="timezones"></a>
### 타임존 설정

`timezone` 메서드를 사용하면, 예약 작업의 실행 시간을 지정한 타임존으로 해석하도록 할 수 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('report:generate')
    ->timezone('America/New_York')
    ->at('2:00')
```

모든 예약 작업에 동일한 타임존을 반복적으로 지정한다면, 애플리케이션의 `app` 설정 파일에 `schedule_timezone` 옵션을 정의하여 전체 스케줄의 기본 타임존을 적용할 수 있습니다.

```php
'timezone' => 'UTC',

'schedule_timezone' => 'America/Chicago',
```

> [!WARNING]
> 일부 타임존은 서머타임(일광 절약 시간제)을 적용합니다. 이로 인해 서머타임 전환 시, 예약 작업이 두 번 실행되거나 아예 실행되지 않을 수도 있습니다. 이런 문제를 피하려면, 가능하다면 타임존 스케줄링을 사용하지 않는 것이 좋습니다.

<a name="preventing-task-overlaps"></a>
### 작업 중복 실행 방지

기본적으로 예약된 작업은, 이전 작업이 아직 실행 중이어도 계속 새로 실행됩니다. 이런 중복 실행을 방지하려면, `withoutOverlapping` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send')->withoutOverlapping();
```

이 예제에서 `emails:send` [Artisan 명령어](/docs/artisan)는 이미 실행 중이 아니라면 매 분마다 실행됩니다. 이 기능은 각 작업의 실행 시간 차이가 커서, 작업이 끝나는 시간을 예측할 수 없는 경우에 특히 유용합니다.

필요하다면 "중복 방지" 락이 만료되기까지 기다려야 하는 시간을 분 단위로 지정할 수 있습니다. 기본값은 24시간입니다.

```php
Schedule::command('emails:send')->withoutOverlapping(10);
```

내부적으로, `withoutOverlapping` 메서드는 애플리케이션의 [캐시](/docs/cache) 기능을 사용해 락을 관리합니다. 만약 예기치 않은 서버 문제로 인해 작업이 중단되어 락이 남아있다면, `schedule:clear-cache` Artisan 명령어로 락을 수동으로 해제할 수 있습니다. 보통 이런 경우에만 필요합니다.

<a name="running-tasks-on-one-server"></a>
### 단일 서버에서만 작업 실행하기

> [!WARNING]
> 이 기능을 사용하려면, 애플리케이션의 기본 캐시 드라이버가 `database`, `memcached`, `dynamodb`, `redis` 중 하나여야 하며, 모든 서버가 동일한 중앙 캐시 서버와 통신해야 합니다.

애플리케이션의 스케줄러가 여러 서버에서 동시 실행되는 환경이라면, 예약 작업을 하나의 서버에서만 실행하도록 제한할 수 있습니다. 예를 들어, 금요일 밤마다 새로운 리포트를 생성하는 작업이 있다고 가정해보겠습니다. 워커 서버가 3대라면, 같은 예약 작업이 세 서버 모두에서 실행되어 리포트가 3번 생성될 수 있습니다. 이는 바람직하지 않은 상황입니다.

이럴 때 `onOneServer` 메서드를 예약 작업에 지정하면, 최초로 작업을 획득한 서버가 원자적(atomic) 락을 만들어, 다른 서버에서는 동일 작업이 중복 실행되지 못하도록 막아줍니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('report:generate')
    ->fridays()
    ->at('17:00')
    ->onOneServer();
```

어떤 캐시 스토어를 사용할 것인지 커스터마이즈하려면 `useCache` 메서드를 쓸 수 있습니다.

```php
Schedule::useCache('database');
```

<a name="naming-unique-jobs"></a>
#### 단일 서버 작업에 이름 지정하기

때로는 같은 작업이더라도 인자가 다르게 여러 번 예약되어 있는데, 각각의 작업이 단일 서버에서만 실행되기를 원할 수 있습니다. 이 경우 `name` 메서드를 사용해 각 예약 작업에 고유한 이름을 지정하면 됩니다.

```php
Schedule::job(new CheckUptime('https://laravel.com'))
    ->name('check_uptime:laravel.com')
    ->everyFiveMinutes()
    ->onOneServer();

Schedule::job(new CheckUptime('https://vapor.laravel.com'))
    ->name('check_uptime:vapor.laravel.com')
    ->everyFiveMinutes()
    ->onOneServer();
```

마찬가지로, 클로저(익명 함수)로 예약된 작업도 단일 서버 실행을 원한다면 반드시 이름을 지정해야 합니다.

```php
Schedule::call(fn () => User::resetApiRequestCount())
    ->name('reset-api-request-count')
    ->daily()
    ->onOneServer();
```

<a name="background-tasks"></a>
### 백그라운드 작업 실행

기본적으로, 같은 시간에 예약된 여러 작업들은 `schedule` 메서드에 정의된 순서대로 차례차례 실행됩니다. 시간이 오래 걸리는 작업이 있다면, 그 뒤의 작업이 예상보다 훨씬 늦게 시작될 수 있습니다. 모든 예약 작업을 동시에 백그라운드에서 실행하고 싶다면 `runInBackground` 메서드를 사용하면 됩니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('analytics:report')
    ->daily()
    ->runInBackground();
```

> [!WARNING]
> `runInBackground` 메서드는 `command`와 `exec` 메서드를 사용해서 예약한 작업에서만 사용할 수 있습니다.

<a name="maintenance-mode"></a>
### 유지보수 모드

애플리케이션이 [유지보수 모드](/docs/configuration#maintenance-mode)인 경우에는, 예약 작업이 자동으로 실행되지 않습니다. 이는 서버에서 진행 중인 유지보수 작업에 예약 작업이 방해가 되지 않도록 하기 위함입니다. 그러나, 특정 작업만은 유지보수 모드에서도 강제로 실행하고 싶다면, 작업 정의 시 `evenInMaintenanceMode` 메서드를 사용할 수 있습니다.

```php
Schedule::command('emails:send')->evenInMaintenanceMode();
```

<a name="schedule-groups"></a>
### 스케줄 그룹

여러 개의 예약 작업이 비슷한 설정(공통 옵션 등)을 공유한다면, 라라벨의 작업 그룹화(Group) 기능을 통해 중복 코드를 줄이고, 관련 작업 간의 일관성을 쉽게 유지할 수 있습니다.

스케줄 그룹을 만들려면, 먼저 원하는 설정 메서드를 호출한 다음 `group` 메서드를 사용하고, 그룹 내에서 공유 설정을 적용받는 예약 작업들을 클로저로 정의합니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::daily()
    ->onOneServer()
    ->timezone('America/New_York')
    ->group(function () {
        Schedule::command('emails:send --force');
        Schedule::command('emails:prune');
    });
```

<a name="running-the-scheduler"></a>
## 스케줄러 실행하기

예약 작업을 정의했다면, 실제로 서버에서 이 작업들을 실행하는 방법을 알아보겠습니다. `schedule:run` Artisan 명령어를 사용하면, 현재 서버 시간을 기준으로 모든 예약 작업의 실행 여부를 판단해서 필요한 작업만 실행합니다.

즉, 라라벨의 스케줄러를 사용할 때는 서버에 단 하나의 cron 엔트리만 등록해서, 매분마다 `schedule:run` 명령어를 실행하면 됩니다. 서버에 cron 엔트리를 추가하는 방법을 잘 모르는 경우, [Laravel Cloud](https://cloud.laravel.com) 같은 관리형 플랫폼을 활용하면 자동으로 예약 작업 실행을 관리해줍니다.

```shell
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

<a name="sub-minute-scheduled-tasks"></a>
### 분 단위 미만 주기로 작업 실행하기

대부분의 운영체제에서 cron 작업은 최대로 1분에 한 번만 실행할 수 있습니다. 그러나 라라벨은 분 단위보다 더 짧은 간격(최소 1초 마다)으로 작업을 예약할 수 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    DB::table('recent_users')->delete();
})->everySecond();
```

분 단위 미만 스케줄 작업이 정의되어 있으면, `schedule:run` 명령어는 즉시 종료되지 않고 현재 분이 끝날 때까지 계속 실행됩니다. 이를 통해 해당 분 동안 모든 필요한 하위 단위 작업들을 호출할 수 있습니다.

실행 시간이 긴 분 단위 미만 작업은 이후 작업들의 실행에 지연을 유발할 수 있으므로, 이런 작업은 큐 작업이나 백그라운드 명령어로 실제 처리를 위임하는 것이 권장됩니다.

```php
use App\Jobs\DeleteRecentUsers;

Schedule::job(new DeleteRecentUsers)->everyTenSeconds();

Schedule::command('users:delete')->everyTenSeconds()->runInBackground();
```

<a name="interrupting-sub-minute-tasks"></a>
#### 분 단위 미만 작업 중단하기

분 단위 미만 작업이 정의된 경우, `schedule:run` 명령어는 전체 1분 동안 계속 실행됩니다. 그렇기 때문에 애플리케이션을 배포할 때 실행 중이던 schedule:run 명령어 인스턴스가 배포 이전의 코드로 작업을 계속 처리할 수 있습니다.

실행 중인 `schedule:run`을 강제로 중단하려면, 배포 스크립트에서 `schedule:interrupt` 명령어를 추가하면 됩니다. 이 명령어는 배포가 모두 끝난 뒤 실행해야 합니다.

```shell
php artisan schedule:interrupt
```

<a name="running-the-scheduler-locally"></a>
### 로컬 개발 환경에서 스케줄러 실행하기

개발용 로컬 환경에서는 보통 스케줄러 cron 엔트리를 추가하지 않습니다. 대신, `schedule:work` Artisan 명령어를 사용하면 됩니다. 이 명령어는 포그라운드에서 실행되며, 사용자가 종료할 때까지 스케줄러를 매분마다 실행합니다. 분 단위 미만 작업이 포함되어 있다면, 스케줄러가 각 분 동안 계속 실행해서 해당 작업을 처리합니다.

```shell
php artisan schedule:work
```

<a name="task-output"></a>
## 작업 출력 관리

라라벨 스케줄러는 예약 작업이 만들어내는 출력 결과를 다루기 위한 여러 가지 편리한 메서드를 제공합니다. 먼저, `sendOutputTo` 메서드를 사용하면 작업의 출력을 파일로 저장해서 나중에 확인할 수 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send')
    ->daily()
    ->sendOutputTo($filePath);
```

출력을 파일에 덮어쓰지 않고 이어서 기록하고 싶다면, `appendOutputTo` 메서드를 사용합니다.

```php
Schedule::command('emails:send')
    ->daily()
    ->appendOutputTo($filePath);
```

`emailOutputTo` 메서드를 사용하면 예약 작업의 출력 결과를 원하는 이메일 주소로 전송할 수 있습니다. 이 기능을 사용하기 전에 라라벨의 [메일 서비스](/docs/mail)를 구성해야 합니다.

```php
Schedule::command('report:generate')
    ->daily()
    ->sendOutputTo($filePath)
    ->emailOutputTo('taylor@example.com');
```

예약된 Artisan 명령어나 시스템 명령어가 0이 아닌 종료 코드(실패)를 반환했을 때만 결과를 이메일로 받고 싶다면, `emailOutputOnFailure` 메서드를 사용할 수 있습니다.

```php
Schedule::command('report:generate')
    ->daily()
    ->emailOutputOnFailure('taylor@example.com');
```

> [!WARNING]
> `emailOutputTo`, `emailOutputOnFailure`, `sendOutputTo`, `appendOutputTo` 메서드는 `command`와 `exec` 메서드를 통해 예약한 작업에서만 사용할 수 있습니다.

<a name="task-hooks"></a>
## 작업 후크(Hook) 사용

`before`, `after` 메서드를 사용하면 예약 작업의 실행 전후에 별도 코드를 실행할 수 있습니다.

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send')
    ->daily()
    ->before(function () {
        // 이 작업은 곧 실행됩니다...
    })
    ->after(function () {
        // 이 작업이 실행되었습니다...
    });
```

`onSuccess`와 `onFailure` 메서드는 예약 작업이 성공하거나 실패(명령어의 종료 코드가 0이 아님)할 때 실행할 코드를 지정할 수 있습니다.

```php
Schedule::command('emails:send')
    ->daily()
    ->onSuccess(function () {
        // 작업 성공 시 실행...
    })
    ->onFailure(function () {
        // 작업 실패 시 실행...
    });
```

명령어의 출력 결과를 후크에서 사용하려면, 후크 클로저에서 `Illuminate\Support\Stringable` 타입의 `$output` 인자를 추가로 선언하면 됩니다.

```php
use Illuminate\Support\Stringable;

Schedule::command('emails:send')
    ->daily()
    ->onSuccess(function (Stringable $output) {
        // 작업 성공 결과에 대한 처리...
    })
    ->onFailure(function (Stringable $output) {
        // 작업 실패 결과에 대한 처리...
    });
```

<a name="pinging-urls"></a>
#### URL 핑(ping) 보내기

`pingBefore`와 `thenPing` 메서드를 사용하면 작업 실행 전과 후에 지정한 URL로 자동으로 핑(ping) 요청을 보낼 수 있습니다. 이는 [Envoyer](https://envoyer.io) 같은 외부 서비스에 작업의 시작과 종료를 자동으로 알릴 때 유용합니다.

```php
Schedule::command('emails:send')
    ->daily()
    ->pingBefore($url)
    ->thenPing($url);
```

`pingOnSuccess`와 `pingOnFailure` 메서드는 작업이 성공하거나(0 반환) 실패(0이 아님)할 때에만 지정한 URL로 핑을 전송합니다.

```php
Schedule::command('emails:send')
    ->daily()
    ->pingOnSuccess($successUrl)
    ->pingOnFailure($failureUrl);
```

`pingBeforeIf`, `thenPingIf`, `pingOnSuccessIf`, `pingOnFailureIf` 메서드를 사용하면, 지정한 조건이 `true`일 때에만 해당 URL로 핑을 보낼 수 있습니다.

```php
Schedule::command('emails:send')
    ->daily()
    ->pingBeforeIf($condition, $url)
    ->thenPingIf($condition, $url);

Schedule::command('emails:send')
    ->daily()
    ->pingOnSuccessIf($condition, $successUrl)
    ->pingOnFailureIf($condition, $failureUrl);
```

<a name="events"></a>
## 이벤트

라라벨은 예약 작업 실행 과정에서 다양한 [이벤트](/docs/events)를 발생시킵니다. 아래 이벤트들에 대해 [리스너](/docs/events)를 직접 정의해서 사용할 수 있습니다.

<div class="overflow-auto">

| 이벤트 이름 |
| --- |
| `Illuminate\Console\Events\ScheduledTaskStarting` |
| `Illuminate\Console\Events\ScheduledTaskFinished` |
| `Illuminate\Console\Events\ScheduledBackgroundTaskFinished` |
| `Illuminate\Console\Events\ScheduledTaskSkipped` |
| `Illuminate\Console\Events\ScheduledTaskFailed` |

</div>
