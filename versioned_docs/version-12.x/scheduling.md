# 작업 스케줄링 (Task Scheduling)

- [소개](#introduction)
- [스케줄 정의하기](#defining-schedules)
    - [Artisan 명령어 스케줄링](#scheduling-artisan-commands)
    - [큐 작업 스케줄링](#scheduling-queued-jobs)
    - [셸 명령어 스케줄링](#scheduling-shell-commands)
    - [스케줄 주기 옵션](#schedule-frequency-options)
    - [타임존 설정](#timezones)
    - [작업 중복 실행 방지](#preventing-task-overlaps)
    - [한 서버에서만 작업 실행하기](#running-tasks-on-one-server)
    - [백그라운드 작업](#background-tasks)
    - [유지보수 모드](#maintenance-mode)
    - [스케줄 그룹](#schedule-groups)
- [스케줄러 실행하기](#running-the-scheduler)
    - [1분 미만 간격의 스케줄 작업](#sub-minute-scheduled-tasks)
    - [로컬에서 스케줄러 실행하기](#running-the-scheduler-locally)
- [작업 출력 처리](#task-output)
- [작업 후크(Hook)](#task-hooks)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

과거에는 서버에서 스케줄링해야 하는 각 작업마다 크론(cron) 설정을 직접 추가해야 했습니다. 하지만 이 방식을 사용하면 스케줄 정보가 소스 제어에 포함되지 않아 관리가 번거롭고, 기존 크론 엔트리를 확인하거나 새로운 엔트리를 추가하려면 SSH로 서버에 직접 접속해야 합니다.

라라벨의 명령어 스케줄러는 서버에서 반복적으로 실행되는 작업을 효과적으로 관리할 수 있는 새로운 방법을 제공합니다. 스케줄러를 통해 명령어 실행 일정을 라라벨 애플리케이션 안에서 직관적이고 선언적으로 정의할 수 있습니다. 스케줄러를 사용할 때 서버에는 단 하나의 크론 엔트리만 필요합니다. 실제 작업 일정은 애플리케이션의 `routes/console.php` 파일에 정의하는 것이 일반적입니다.

<a name="defining-schedules"></a>
## 스케줄 정의하기

애플리케이션의 `routes/console.php` 파일에서 모든 스케줄 작업을 정의할 수 있습니다. 먼저, 예제를 통해 시작해 보겠습니다. 다음 예제에서는 매일 자정에 호출되는 클로저를 스케줄링하고, 이 클로저 안에서 데이터베이스 쿼리를 실행하여 특정 테이블을 비웁니다:

```php
<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    DB::table('recent_users')->delete();
})->daily();
```

클로저를 사용하는 방식 외에도, [인보커블 객체](https://secure.php.net/manual/en/language.oop5.magic.php#object.invoke)도 스케줄링할 수 있습니다. 인보커블 객체란 `__invoke` 메서드를 가진 간단한 PHP 클래스를 의미합니다:

```php
Schedule::call(new DeleteRecentUsers)->daily();
```

만약 `routes/console.php` 파일을 명령어 정의에만 사용하고 싶다면, 애플리케이션의 `bootstrap/app.php` 파일에서 `withSchedule` 메서드를 통해 스케줄 작업을 정의할 수 있습니다. 이 메서드는 스케줄러 인스턴스를 전달받는 클로저를 인자로 받습니다:

```php
use Illuminate\Console\Scheduling\Schedule;

->withSchedule(function (Schedule $schedule) {
    $schedule->call(new DeleteRecentUsers)->daily();
})
```

정의된 스케줄 작업과 다음 실행 시간을 한눈에 보고 싶다면, 다음과 같이 `schedule:list` Artisan 명령어를 이용할 수 있습니다:

```shell
php artisan schedule:list
```

<a name="scheduling-artisan-commands"></a>
### Artisan 명령어 스케줄링

클로저뿐 아니라, [Artisan 명령어](/docs/12.x/artisan)와 시스템 명령어 역시 스케줄링할 수 있습니다. 예를 들어, `command` 메서드에 명령어의 이름 또는 클래스명을 전달하여 Artisan 명령어를 예약할 수 있습니다.

명령어 클래스명을 사용할 경우, 명령어가 실행될 때 함께 전달할 추가 커맨드라인 인수를 배열로 전달할 수 있습니다:

```php
use App\Console\Commands\SendEmailsCommand;
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send Taylor --force')->daily();

Schedule::command(SendEmailsCommand::class, ['Taylor', '--force'])->daily();
```

<a name="scheduling-artisan-closure-commands"></a>
#### 클로저 기반 Artisan 명령어 스케줄링

클로저로 정의된 Artisan 명령어 역시 스케줄 관련 메서드를 정의 뒤에 체이닝하여 적용할 수 있습니다:

```php
Artisan::command('delete:recent-users', function () {
    DB::table('recent_users')->delete();
})->purpose('Delete recent users')->daily();
```

이런 클로저 명령어에 인수를 전달해야 한다면 `schedule` 메서드에 배열로 전달할 수 있습니다:

```php
Artisan::command('emails:send {user} {--force}', function ($user) {
    // ...
})->purpose('Send emails to the specified user')->schedule(['Taylor', '--force'])->daily();
```

<a name="scheduling-queued-jobs"></a>
### 큐 작업 스케줄링

`job` 메서드를 사용하여 [큐 작업](/docs/12.x/queues)을 스케줄링할 수 있습니다. 이 방법은 `call` 메서드를 사용해 큐 작업을 정의하는 것보다 간단하게 큐 작업을 예약할 수 있습니다:

```php
use App\Jobs\Heartbeat;
use Illuminate\Support\Facades\Schedule;

Schedule::job(new Heartbeat)->everyFiveMinutes();
```

`job` 메서드의 두 번째와 세 번째 인자로 큐 이름과 큐 커넥션을 지정할 수도 있습니다:

```php
use App\Jobs\Heartbeat;
use Illuminate\Support\Facades\Schedule;

// "heartbeats" 큐, "sqs" 커넥션에 작업을 디스패치.
Schedule::job(new Heartbeat, 'heartbeats', 'sqs')->everyFiveMinutes();
```

<a name="scheduling-shell-commands"></a>
### 셸 명령어 스케줄링

`exec` 메서드는 운영체제 명령어를 실행할 때 사용합니다:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::exec('node /home/forge/script.js')->daily();
```

<a name="schedule-frequency-options"></a>
### 스케줄 주기 옵션

작업을 원하는 주기로 실행하도록 예약하는 다양한 방법이 있습니다. 아래는 다양한 작업 주기 메서드의 예시입니다:

<div class="overflow-auto">

| 메서드                             | 설명                                                     |
| ---------------------------------- | -------------------------------------------------------- |
| `->cron('* * * * *');`             | 특정 cron 구문에 따라 작업 실행                          |
| `->everySecond();`                 | 매초 작업 실행                                           |
| `->everyTwoSeconds();`             | 2초마다 작업 실행                                        |
| `->everyFiveSeconds();`            | 5초마다 작업 실행                                        |
| `->everyTenSeconds();`             | 10초마다 작업 실행                                       |
| `->everyFifteenSeconds();`         | 15초마다 작업 실행                                       |
| `->everyTwentySeconds();`          | 20초마다 작업 실행                                       |
| `->everyThirtySeconds();`          | 30초마다 작업 실행                                       |
| `->everyMinute();`                 | 매분 작업 실행                                           |
| `->everyTwoMinutes();`             | 2분마다 작업 실행                                        |
| `->everyThreeMinutes();`           | 3분마다 작업 실행                                        |
| `->everyFourMinutes();`            | 4분마다 작업 실행                                        |
| `->everyFiveMinutes();`            | 5분마다 작업 실행                                        |
| `->everyTenMinutes();`             | 10분마다 작업 실행                                       |
| `->everyFifteenMinutes();`         | 15분마다 작업 실행                                       |
| `->everyThirtyMinutes();`          | 30분마다 작업 실행                                       |
| `->hourly();`                      | 매시간 작업 실행                                         |
| `->hourlyAt(17);`                  | 매시간 17분에 작업 실행                                  |
| `->everyOddHour($minutes = 0);`    | 홀수 시간마다 작업 실행                                  |
| `->everyTwoHours($minutes = 0);`   | 2시간마다 작업 실행                                      |
| `->everyThreeHours($minutes = 0);` | 3시간마다 작업 실행                                      |
| `->everyFourHours($minutes = 0);`  | 4시간마다 작업 실행                                      |
| `->everySixHours($minutes = 0);`   | 6시간마다 작업 실행                                      |
| `->daily();`                       | 매일 자정 작업 실행                                      |
| `->dailyAt('13:00');`              | 매일 13:00에 작업 실행                                   |
| `->twiceDaily(1, 13);`             | 매일 1:00, 13:00에 작업 실행                             |
| `->twiceDailyAt(1, 13, 15);`       | 매일 1:15, 13:15에 작업 실행                             |
| `->weekly();`                      | 매주 일요일 00:00에 작업 실행                            |
| `->weeklyOn(1, '8:00');`           | 매주 월요일 8:00에 작업 실행                             |
| `->monthly();`                     | 매월 1일 00:00에 작업 실행                               |
| `->monthlyOn(4, '15:00');`         | 매월 4일 15:00에 작업 실행                               |
| `->twiceMonthly(1, 16, '13:00');`  | 매월 1일, 16일 13:00에 작업 실행                         |
| `->lastDayOfMonth('15:00');`       | 매월 마지막 날 15:00에 작업 실행                         |
| `->quarterly();`                   | 매 분기 첫째 날 00:00에 작업 실행                        |
| `->quarterlyOn(4, '14:00');`       | 매 분기 4일 14:00에 작업 실행                            |
| `->yearly();`                      | 매년 1월 1일 00:00에 작업 실행                           |
| `->yearlyOn(6, 1, '17:00');`       | 매년 6월 1일 17:00에 작업 실행                           |
| `->timezone('America/New_York');`  | 해당 작업의 타임존을 지정                                |

</div>

이러한 메서드들은 특정 요일에만 실행되도록 조건을 추가해 더 세밀하게 스케줄링할 수도 있습니다. 예를 들어, 다음과 같이 월요일에만 명령어가 실행되도록 예약할 수 있습니다:

```php
use Illuminate\Support\Facades\Schedule;

// 매주 월요일 오후 1시에 한 번만 실행
Schedule::call(function () {
    // ...
})->weekly()->mondays()->at('13:00');

// 평일 오전 8시부터 오후 5시까지 매시 실행
Schedule::command('foo')
    ->weekdays()
    ->hourly()
    ->timezone('America/Chicago')
    ->between('8:00', '17:00');
```

추가로 사용할 수 있는 스케줄 조건 메서드는 아래와 같습니다:

<div class="overflow-auto">

| 메서드                                   | 설명                                             |
| ---------------------------------------- | ------------------------------------------------ |
| `->weekdays();`                          | 평일(월~금)에만 실행                             |
| `->weekends();`                          | 주말(토,일)에만 실행                             |
| `->sundays();`                           | 일요일에만 실행                                  |
| `->mondays();`                           | 월요일에만 실행                                  |
| `->tuesdays();`                          | 화요일에만 실행                                  |
| `->wednesdays();`                        | 수요일에만 실행                                  |
| `->thursdays();`                         | 목요일에만 실행                                  |
| `->fridays();`                           | 금요일에만 실행                                  |
| `->saturdays();`                         | 토요일에만 실행                                  |
| `->days(array\|mixed);`                  | 지정된 요일에만 실행                             |
| `->between($startTime, $endTime);`       | 지정한 시간대만 실행                             |
| `->unlessBetween($startTime, $endTime);` | 지정한 시간대에는 실행하지 않음                  |
| `->when(Closure);`                       | 특정 조건(클로저)이 true일 때만 실행             |
| `->environments($env);`                  | 지정한 환경에서만 실행(예: 스테이징, 프로덕션)   |

</div>

<a name="day-constraints"></a>
#### 요일 제한 (Day Constraints)

`days` 메서드를 사용하면, 특정 요일에만 작업을 실행하도록 제한할 수 있습니다. 예를 들어, 일요일과 수요일마다 매시간 명령어를 실행하고 싶다면 다음과 같이 작성합니다:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send')
    ->hourly()
    ->days([0, 3]);
```

또는, `Illuminate\Console\Scheduling\Schedule` 클래스에 정의된 상수를 사용할 수도 있습니다:

```php
use Illuminate\Support\Facades;
use Illuminate\Console\Scheduling\Schedule;

Facades\Schedule::command('emails:send')
    ->hourly()
    ->days([Schedule::SUNDAY, Schedule::WEDNESDAY]);
```

<a name="between-time-constraints"></a>
#### 시간대 제한 (Between Time Constraints)

`between` 메서드를 사용하면, 작업 실행을 특정 시간대로 제한할 수 있습니다:

```php
Schedule::command('emails:send')
    ->hourly()
    ->between('7:00', '22:00');
```

반대로, `unlessBetween` 메서드는 지정한 시간대에는 작업이 실행되지 않도록 합니다:

```php
Schedule::command('emails:send')
    ->hourly()
    ->unlessBetween('23:00', '4:00');
```

<a name="truth-test-constraints"></a>
#### 조건부 실행 (Truth Test Constraints)

`when` 메서드는 주어진 클로저가 `true`를 반환할 때만 작업을 실행합니다. 즉, 추가적인 조건을 붙이고 싶을 때 사용할 수 있습니다:

```php
Schedule::command('emails:send')->daily()->when(function () {
    return true;
});
```

`skip` 메서드는 `when`의 반대로, 클로저가 `true`를 반환하면 해당 작업이 실행되지 않습니다:

```php
Schedule::command('emails:send')->daily()->skip(function () {
    return true;
});
```

여러 개의 `when` 메서드를 체이닝할 경우, 모든 조건이 `true`여야 작업이 실행됩니다.

<a name="environment-constraints"></a>
#### 환경 제한 (Environment Constraints)

`environments` 메서드를 사용하면, 작업이 특정 환경(예: 스테이징, 프로덕션 등 `APP_ENV` [환경 변수](/docs/12.x/configuration#environment-configuration)로 정해진)에만 실행되도록 할 수 있습니다:

```php
Schedule::command('emails:send')
    ->daily()
    ->environments(['staging', 'production']);
```

<a name="timezones"></a>
### 타임존 설정

`timezone` 메서드를 사용하면, 예약된 작업의 시간이 특정 타임존 기준으로 해석되도록 지정할 수 있습니다:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('report:generate')
    ->timezone('America/New_York')
    ->at('2:00')
```

모든 작업에 동일한 타임존을 반복 지정해야 한다면, 애플리케이션의 `app` 설정 파일에 `schedule_timezone` 옵션을 지정할 수 있습니다:

```php
'timezone' => 'UTC',

'schedule_timezone' => 'America/Chicago',
```

> [!WARNING]
> 일부 타임존은 서머타임(일광 절약 시간제)을 사용합니다. 서머타임이 적용되는 시기에 작업이 두 번 실행되거나 아예 실행되지 않을 수 있으므로, 가능한 한 타임존 스케줄링은 피하는 것을 권장합니다.

<a name="preventing-task-overlaps"></a>
### 작업 중복 실행 방지

기본적으로 스케줄된 작업은 이전 인스턴스가 아직 실행 중이더라도 새로 실행됩니다. 이전 작업이 끝나기 전 새 작업이 실행되지 않도록 하려면 `withoutOverlapping` 메서드를 사용합니다:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send')->withoutOverlapping();
```

위의 예시처럼 설정하면, `emails:send` [Artisan 명령어](/docs/12.x/artisan)는 이전 실행이 아직 끝나지 않은 경우 실행되지 않습니다. `withoutOverlapping`은 실행 시간이 불규칙해서 정확한 종료 시점을 예측하기 어려운 작업에 특히 유용합니다.

필요하다면, "중복 방지" 락(lock)이 해제되기까지의 시간을 지정할 수도 있습니다. 기본으로는 24시간 후 락이 해제됩니다:

```php
Schedule::command('emails:send')->withoutOverlapping(10);
```

내부적으로 `withoutOverlapping`은 애플리케이션의 [캐시](/docs/12.x/cache)를 이용해 락을 관리합니다. 만약 예기치 않은 서버 문제 등으로 작업이 중단되어 락이 계속 남아 있다면, `schedule:clear-cache` Artisan 명령어로 해당 락을 해제할 수 있습니다. 이 상황은 드물게 발생합니다.

<a name="running-tasks-on-one-server"></a>
### 한 서버에서만 작업 실행하기

> [!WARNING]
> 이 기능을 사용하려면, 애플리케이션의 기본 캐시 드라이버가 `database`, `memcached`, `dynamodb`, `redis` 중 하나여야 하며, 모든 서버가 동일한 중앙 캐시 서버와 통신하고 있어야 합니다.

스케줄러가 여러 서버에서 동시에 실행되는 환경에서는, 특정 작업이 한 서버에서만 실행되도록 제한할 수 있습니다. 예를 들어, 매주 금요일 밤에 리포트를 생성하는 작업이 있을 때, 작업 스케줄러가 3대의 워커 서버에서 실행되고 있다면, 모든 서버에서 작업이 실행되어 리포트가 3개 생성될 수 있습니다. 이는 원하지 않는 결과입니다.

이럴 때, 스케줄을 정의할 때 `onOneServer` 메서드를 사용하면 첫 번째로 락을 획득한 서버만 작업을 실행하고 나머지는 실행하지 않게 됩니다:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('report:generate')
    ->fridays()
    ->at('17:00')
    ->onOneServer();
```

단일 서버 작업에 필요한 락을 얻기 위해 사용되는 캐시 저장소를 직접 지정하고 싶다면, `useCache` 메서드를 사용할 수 있습니다:

```php
Schedule::useCache('database');
```

<a name="naming-unique-jobs"></a>
#### 단일 서버 작업에 고유 이름 지정

같은 작업을 다양한 매개변수로 여러 번 스케줄링해야 하면서, 각각의 작업이 한 서버에서만 실행되도록 하려면 `name` 메서드로 각 작업에 고유 이름을 부여해야 합니다:

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

같은 방식으로, 한 서버에서만 실행할 클로저 작업에도 반드시 이름을 지정해야 합니다:

```php
Schedule::call(fn () => User::resetApiRequestCount())
    ->name('reset-api-request-count')
    ->daily()
    ->onOneServer();
```

<a name="background-tasks"></a>
### 백그라운드 작업

기본적으로, 같은 시간에 스케줄된 여러 작업은 `schedule` 메서드에서 정의된 순서대로 순차적으로 실행됩니다. 실행 시간이 긴 작업이 있으면 이후 작업이 예정 시간보다 늦게 시작될 수 있습니다. 여러 작업을 동시에 백그라운드에서 실행하고 싶다면 `runInBackground` 메서드를 사용할 수 있습니다:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('analytics:report')
    ->daily()
    ->runInBackground();
```

> [!WARNING]
> `runInBackground` 메서드는 `command`와 `exec` 메서드를 사용할 때만 지원합니다.

<a name="maintenance-mode"></a>
### 유지보수 모드

애플리케이션이 [유지보수 모드](/docs/12.x/configuration#maintenance-mode)일 때는 예약된 모든 작업이 실행되지 않습니다. 이는 작업이 현재 서버에서 수행 중인 미완료 유지보수 작업에 영향을 주지 않도록 하기 위함입니다. 단, 유지보수 모드 중에도 실행이 필요한 작업이 있다면 스케줄 정의 시 `evenInMaintenanceMode` 메서드로 강제로 실행할 수 있습니다:

```php
Schedule::command('emails:send')->evenInMaintenanceMode();
```

<a name="schedule-groups"></a>
### 스케줄 그룹

비슷한 설정이 반복되는 여러 작업을 정의할 때, 라라벨의 작업 그룹화 기능을 사용하면, 중복 코드를 줄이고 관련 작업 간 설정의 일관성을 쉽게 지킬 수 있습니다.

스케줄 그룹을 만들고자 할 때는, 원하는 설정 메서드들을 먼저 체이닝한 후 `group` 메서드를 호출하고, 그 안에서 공유 설정을 가지는 작업을 클로저로 정의합니다:

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

스케줄 작업을 정의했다면, 이제 서버에서 실제로 어떻게 실행하는지 살펴봅니다. `schedule:run` Artisan 명령어는, 현재 서버 시간 기준으로 모든 예약된 작업들을 검사해서 실행이 필요한 작업만 실행합니다.

즉, 라라벨 스케줄러를 사용할 때는, 서버 크론탭에 매 분마다 `schedule:run` 명령어를 실행하도록 단 한 줄만 추가하면 됩니다. 크론 엔트리 추가 방법을 잘 모르는 경우, [Laravel Cloud](https://cloud.laravel.com)와 같이 예약 작업 실행을 자동으로 관리해주는 플랫폼을 이용하는 것도 좋습니다:

```shell
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

<a name="sub-minute-scheduled-tasks"></a>
### 1분 미만 간격의 스케줄 작업

대부분의 운영체제에서 크론 작업(크론잡)은 최소 1분에 한 번만 실행할 수 있습니다. 하지만 라라벨의 스케줄러는 초 단위로 더 짧은 주기로도 작업을 예약할 수 있습니다:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    DB::table('recent_users')->delete();
})->everySecond();
```

애플리케이션 내에 1분 미만 간격의 작업이 존재하는 경우, `schedule:run` 명령어는 기존처럼 바로 종료되지 않고, 현재 분이 끝날 때까지 계속 실행되면서 해당 분 내 필요한 모든 작업을 호출합니다.

이러한 작업이 예상보다 오래 걸릴 경우, 이후의 초 단위 작업들이 지연될 수 있으므로, 가능한 모든 1분 미만 작업은 큐 작업 또는 백그라운드 명령어로 처리하는 것을 권장합니다:

```php
use App\Jobs\DeleteRecentUsers;

Schedule::job(new DeleteRecentUsers)->everyTenSeconds();

Schedule::command('users:delete')->everyTenSeconds()->runInBackground();
```

<a name="interrupting-sub-minute-tasks"></a>
#### 1분 미만 실행 중 작업 강제 중단

1분 미만의 작업이 정의된 경우, `schedule:run` 명령어는 해당 분이 끝날 때까지 계속 실행됩니다. 이로 인해 배포(Deploy) 도중 오래 실행 중인 작업이 이전 코드로 계속 실행될 수 있습니다.

이런 경우, 배포 스크립트에서 `schedule:interrupt` 명령어를 추가해, 이미 실행 중인 `schedule:run`를 강제로 중단시킬 수 있습니다. 이 명령어는 애플리케이션 배포가 끝난 뒤에 실행하세요:

```shell
php artisan schedule:interrupt
```

<a name="running-the-scheduler-locally"></a>
### 로컬에서 스케줄러 실행하기

일반적으로 개발 환경(로컬 PC 등)에서는 크론 엔트리를 직접 추가하지 않습니다. 대신 `schedule:work` Artisan 명령어를 사용하면 됩니다. 이 명령어는 터미널(Foreground)에서 실행되며, 종료할 때까지 매 분마다 스케줄러를 호출합니다. 1분 미만 간격의 작업이 있을 경우, 그 분이 끝날 때까지 반복해서 해당 작업을 실행합니다:

```shell
php artisan schedule:work
```

<a name="task-output"></a>
## 작업 출력 처리

라라벨 스케줄러는 예약 작업의 출력 결과를 관리할 수 있는 다양한 메서드를 제공합니다. 먼저, `sendOutputTo` 메서드로 작업 출력을 파일에 저장할 수 있습니다:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send')
    ->daily()
    ->sendOutputTo($filePath);
```

출력을 파일에 덮어쓰는 대신, 기존 파일에 이어서 기록하려면 `appendOutputTo` 메서드를 사용합니다:

```php
Schedule::command('emails:send')
    ->daily()
    ->appendOutputTo($filePath);
```

`emailOutputTo` 메서드를 사용하면, 작업 출력을 원하는 이메일 주소로 전송할 수 있습니다. 이 기능을 사용하기 전에 라라벨의 [메일 서비스](/docs/12.x/mail)를 반드시 설정하세요:

```php
Schedule::command('report:generate')
    ->daily()
    ->sendOutputTo($filePath)
    ->emailOutputTo('taylor@example.com');
```

만약 예약된 Artisan 또는 시스템 명령어가 비정상적으로 종료(비 0 종료 코드)된 경우에만 출력을 이메일로 받고 싶다면, `emailOutputOnFailure` 메서드를 사용하세요:

```php
Schedule::command('report:generate')
    ->daily()
    ->emailOutputOnFailure('taylor@example.com');
```

> [!WARNING]
> `emailOutputTo`, `emailOutputOnFailure`, `sendOutputTo`, `appendOutputTo` 메서드는 `command` 또는 `exec` 메서드에서 예약한 작업에서만 사용할 수 있습니다.

<a name="task-hooks"></a>
## 작업 후크(Hook)

`before`와 `after` 메서드를 이용해, 예약 작업이 실행되기 전과 후에 추가 코드를 실행할 수 있습니다:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send')
    ->daily()
    ->before(function () {
        // 작업 실행 직전...
    })
    ->after(function () {
        // 작업 실행 후...
    });
```

`onSuccess`와 `onFailure` 메서드를 사용하면, 작업이 성공(0으로 정상 종료)하거나 실패(0이 아닌 코드로 비정상 종료)했을 때 실행할 코드를 지정할 수 있습니다:

```php
Schedule::command('emails:send')
    ->daily()
    ->onSuccess(function () {
        // 작업이 성공했을 때...
    })
    ->onFailure(function () {
        // 작업이 실패했을 때...
    });
```

명령어의 출력 결과를 후크에서 사용하고 싶다면, 후크 클로저의 인자로 `Illuminate\Support\Stringable` 타입의 `$output`을 지정하면 됩니다:

```php
use Illuminate\Support\Stringable;

Schedule::command('emails:send')
    ->daily()
    ->onSuccess(function (Stringable $output) {
        // 작업 성공 시 출력값 사용
    })
    ->onFailure(function (Stringable $output) {
        // 작업 실패 시 출력값 사용
    });
```

<a name="pinging-urls"></a>
#### URL 핑(Ping) 전송

`pingBefore`와 `thenPing` 메서드를 사용하면, 작업 실행 전후에 지정한 URL로 HTTP 요청(핑)을 자동으로 보낼 수 있습니다. 외부 서비스(예: [Envoyer](https://envoyer.io))에 스케줄 작업 시작/종료를 알리고 싶을 때 유용합니다:

```php
Schedule::command('emails:send')
    ->daily()
    ->pingBefore($url)
    ->thenPing($url);
```

`pingOnSuccess`와 `pingOnFailure`는 작업 성공 또는 실패시에만 URL로 핑을 전송합니다(명령어가 0이 아닌 종료 코드로 실패할 때):

```php
Schedule::command('emails:send')
    ->daily()
    ->pingOnSuccess($successUrl)
    ->pingOnFailure($failureUrl);
```

`pingBeforeIf`, `thenPingIf`, `pingOnSuccessIf`, `pingOnFailureIf` 메서드를 이용하면, 특정 조건이 `true`일 때만 핑을 전송할 수도 있습니다:

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

라라벨은 스케줄링 과정에서 다양한 [이벤트](/docs/12.x/events)를 발생시킵니다. 아래 이벤트에 대한 [리스너를 정의](/docs/12.x/events)할 수 있습니다:

<div class="overflow-auto">

| 이벤트 이름 |
| --- |
| `Illuminate\Console\Events\ScheduledTaskStarting` |
| `Illuminate\Console\Events\ScheduledTaskFinished` |
| `Illuminate\Console\Events\ScheduledBackgroundTaskFinished` |
| `Illuminate\Console\Events\ScheduledTaskSkipped` |
| `Illuminate\Console\Events\ScheduledTaskFailed` |

</div>
