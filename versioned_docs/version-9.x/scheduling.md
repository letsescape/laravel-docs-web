# 작업 스케줄링 (Task Scheduling)

- [소개](#introduction)
- [스케줄 정의](#defining-schedules)
    - [Artisan 명령어 스케줄링](#scheduling-artisan-commands)
    - [큐 작업 스케줄링](#scheduling-queued-jobs)
    - [셸 명령어 스케줄링](#scheduling-shell-commands)
    - [스케줄 빈도 옵션](#schedule-frequency-options)
    - [타임존](#timezones)
    - [작업 중복 방지](#preventing-task-overlaps)
    - [단일 서버에서만 작업 실행](#running-tasks-on-one-server)
    - [백그라운드 작업](#background-tasks)
    - [메인터넌스 모드](#maintenance-mode)
- [스케줄러 실행](#running-the-scheduler)
    - [로컬에서 스케줄러 실행](#running-the-scheduler-locally)
- [작업 출력](#task-output)
- [작업 훅](#task-hooks)
- [이벤트](#events)

<a name="introduction"></a>
## 소개

과거에는 서버에서 예약할 각 작업마다 별개로 cron 설정 항목을 작성하셨을 수 있습니다. 하지만 이 방식은 작업 스케줄이 소스 코드로 관리되지 않으며, 기존 cron 항목을 확인하거나 새로 추가하려면 서버에 SSH로 접속해야 하는 번거로움이 있습니다.

라라벨의 명령 스케줄러는 서버에서 예약된 작업을 효율적으로 관리할 수 있는 새로운 방식을 제공합니다. 스케줄러를 이용하면 라라벨 애플리케이션 내부에서 명확하고 유연하게 명령 스케줄을 정의할 수 있습니다. 이 방식을 쓸 때 서버에는 단 한 개의 cron 항목만 있으면 됩니다. 예약 작업의 스케줄은 `app/Console/Kernel.php` 파일의 `schedule` 메서드에서 정의합니다. 시작을 돕기 위해 이 메서드에는 간단한 예시가 미리 작성되어 있습니다.

<a name="defining-schedules"></a>
## 스케줄 정의

애플리케이션의 `App\Console\Kernel` 클래스 내 `schedule` 메서드에서 모든 예약 작업을 정의할 수 있습니다. 먼저 예시를 살펴봅시다. 아래 예시는 매일 자정마다 실행되는 클로저를 예약하는 방법입니다. 클로저 내부에서는 데이터베이스 쿼리를 사용해 테이블을 비우는 작업을 실행합니다.

```
<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Facades\DB;

class Kernel extends ConsoleKernel
{
    /**
     * 애플리케이션의 명령 스케줄을 정의합니다.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->call(function () {
            DB::table('recent_users')->delete();
        })->daily();
    }
}
```

클로저를 사용한 예약 외에도, [호출 가능한 객체(invokable object)](https://secure.php.net/manual/en/language.oop5.magic.php#object.invoke)를 이용해 스케줄을 등록할 수도 있습니다. 호출 가능한 객체는 `__invoke` 메서드를 가진 간단한 PHP 클래스입니다.

```
$schedule->call(new DeleteRecentUsers)->daily();
```

정의된 예약 작업과 그다음 실행 예정 시점을 한눈에 확인하고 싶다면, `schedule:list` Artisan 명령어를 사용할 수 있습니다.

```bash
php artisan schedule:list
```

<a name="scheduling-artisan-commands"></a>
### Artisan 명령어 스케줄링

클로저 외에도 [Artisan 명령어](/docs/9.x/artisan) 및 시스템 명령어 역시 예약할 수 있습니다. 예를 들어, `command` 메서드를 사용하여 Artisan 명령어를 이름이나 클래스명으로 등록할 수 있습니다.

명령어의 클래스명을 사용해서 Artisan 명령어를 예약할 때는 배열로 명령 줄 인자를 전달할 수 있습니다. 이 인자는 명령어가 실행될 때 함께 전달됩니다.

```
use App\Console\Commands\SendEmailsCommand;

$schedule->command('emails:send Taylor --force')->daily();

$schedule->command(SendEmailsCommand::class, ['Taylor', '--force'])->daily();
```

<a name="scheduling-queued-jobs"></a>
### 큐 작업 스케줄링

`job` 메서드를 이용하면 [큐 작업](/docs/9.x/queues)을 예약할 수 있습니다. 이 방식은 큐 작업을 예약할 때 매번 클로저에서 큐를 호출하는 대신 더 간편하게 사용할 수 있습니다.

```
use App\Jobs\Heartbeat;

$schedule->job(new Heartbeat)->everyFiveMinutes();
```

`job` 메서드의 두 번째, 세 번째 인수로 큐 이름과 연결(커넥션)명을 지정할 수 있습니다.

```
use App\Jobs\Heartbeat;

// "heartbeats" 큐에서 "sqs" 연결을 활용해 작업을 디스패치합니다.
$schedule->job(new Heartbeat, 'heartbeats', 'sqs')->everyFiveMinutes();
```

<a name="scheduling-shell-commands"></a>
### 셸 명령어 스케줄링

`exec` 메서드를 사용하면 운영체제에 직접 명령어를 실행하도록 지시할 수 있습니다.

```
$schedule->exec('node /home/forge/script.js')->daily();
```

<a name="schedule-frequency-options"></a>
### 스케줄 빈도 옵션

지정된 주기로 작업을 실행하는 방법을 이미 몇 가지 살펴봤지만, 더 다양한 예약 주기를 지정할 수도 있습니다.

메서드  | 설명
------------- | -------------
`->cron('* * * * *');`  |  사용자 지정 cron 스케줄로 작업 실행
`->everyMinute();`  |  1분마다 실행
`->everyTwoMinutes();`  |  2분마다 실행
`->everyThreeMinutes();`  |  3분마다 실행
`->everyFourMinutes();`  |  4분마다 실행
`->everyFiveMinutes();`  |  5분마다 실행
`->everyTenMinutes();`  |  10분마다 실행
`->everyFifteenMinutes();`  |  15분마다 실행
`->everyThirtyMinutes();`  |  30분마다 실행
`->hourly();`  |  매시간마다 실행
`->hourlyAt(17);`  |  매시간 17분에 실행
`->everyOddHour();`  |  홀수 시간마다 실행
`->everyTwoHours();`  |  두 시간마다 실행
`->everyThreeHours();`  |  세 시간마다 실행
`->everyFourHours();`  |  네 시간마다 실행
`->everySixHours();`  |  여섯 시간마다 실행
`->daily();`  |  매일 자정(0시) 실행
`->dailyAt('13:00');`  |  매일 13:00에 실행
`->twiceDaily(1, 13);`  |  매일 1:00, 13:00에 두 번 실행
`->twiceDailyAt(1, 13, 15);`  |  매일 1:15, 13:15에 두 번 실행
`->weekly();`  |  매주 일요일 0시에 실행
`->weeklyOn(1, '8:00');`  |  매주 월요일 8:00에 실행
`->monthly();`  |  매월 1일 0시에 실행
`->monthlyOn(4, '15:00');`  |  매월 4일 15:00에 실행
`->twiceMonthly(1, 16, '13:00');`  |  매월 1일과 16일 13:00에 실행
`->lastDayOfMonth('15:00');` | 매월 마지막 날 15:00에 실행
`->quarterly();` |  분기 첫날 0시에 실행
`->quarterlyOn(4, '14:00');` |  분기별 4일 14:00에 실행
`->yearly();`  |  매년 1월 1일 0시에 실행
`->yearlyOn(6, 1, '17:00');`  |  매년 6월 1일 17:00에 실행
`->timezone('America/New_York');` | 작업에 사용할 타임존 설정

이러한 메서드는 추가 제약 조건과 조합하여, 특정 요일에만 실행되는 등 더욱 세밀하게 스케줄을 조정할 수 있습니다. 예를 들어 명령어를 매주 월요일에만 실행하도록 예약할 수 있습니다.

```
// 매주 월요일 13시에 1회 실행
$schedule->call(function () {
    //
})->weekly()->mondays()->at('13:00');

// 평일 오전 8시부터 오후 5시까지 매시간 실행
$schedule->command('foo')
          ->weekdays()
          ->hourly()
          ->timezone('America/Chicago')
          ->between('8:00', '17:00');
```

추가로 사용할 수 있는 스케줄 제약 조건 목록은 다음과 같습니다.

메서드  | 설명
------------- | -------------
`->weekdays();`  |  평일(월~금)만 실행
`->weekends();`  |  주말(토,일)만 실행
`->sundays();`  |  일요일에만 실행
`->mondays();`  |  월요일에만 실행
`->tuesdays();`  |  화요일에만 실행
`->wednesdays();`  |  수요일에만 실행
`->thursdays();`  |  목요일에만 실행
`->fridays();`  |  금요일에만 실행
`->saturdays();`  |  토요일에만 실행
`->days(array\|mixed);`  |  특정 요일만 실행
`->between($startTime, $endTime);`  |  지정 시간 범위 내에만 실행
`->unlessBetween($startTime, $endTime);`  |  지정 시간 범위 외에만 실행
`->when(Closure);`  |  조건식 결과가 true일 때 실행
`->environments($env);`  |  특정 환경에서만 실행

<a name="day-constraints"></a>
#### 요일 제약

`days` 메서드를 사용하면 특정 요일에만 작업이 실행되도록 제약할 수 있습니다. 예를 들어, 매시간 일요일과 수요일에만 명령어를 실행하도록 예약할 수 있습니다.

```
$schedule->command('emails:send')
                ->hourly()
                ->days([0, 3]);
```

또는 `Illuminate\Console\Scheduling\Schedule` 클래스에 정의된 상수를 사용할 수도 있습니다.

```
use Illuminate\Console\Scheduling\Schedule;

$schedule->command('emails:send')
                ->hourly()
                ->days([Schedule::SUNDAY, Schedule::WEDNESDAY]);
```

<a name="between-time-constraints"></a>
#### 시간 범위 제약

`between` 메서드를 사용하면, 지정한 시간대에만 작업이 실행되도록 제한할 수 있습니다.

```
$schedule->command('emails:send')
                    ->hourly()
                    ->between('7:00', '22:00');
```

반대로 `unlessBetween` 메서드를 사용하면 특정 시간대에는 작업이 실행되지 않도록 할 수 있습니다.

```
$schedule->command('emails:send')
                    ->hourly()
                    ->unlessBetween('23:00', '4:00');
```

<a name="truth-test-constraints"></a>
#### 조건식(Truth Test) 제약

`when` 메서드는 주어진 조건(클로저)의 반환값이 `true`일 때만 작업이 실행되도록 제한합니다. 즉, 클로저가 `true`를 반환한다면, 다른 제약조건에 걸리지 않는 한 작업이 실행됩니다.

```
$schedule->command('emails:send')->daily()->when(function () {
    return true;
});
```

`skip` 메서드는 `when`의 반대 역할을 합니다. `skip` 클로저가 `true`를 반환하면, 해당 작업은 실행되지 않습니다.

```
$schedule->command('emails:send')->daily()->skip(function () {
    return true;
});
```

여러 번의 `when` 메서드를 체이닝하면, 모든 조건이 `true`여야 작업이 실행됩니다.

<a name="environment-constraints"></a>
#### 환경 제약

`environments` 메서드를 사용하면 지정한 환경(`APP_ENV` [환경 변수](/docs/9.x/configuration#environment-configuration))에서만 작업이 실행되도록 할 수 있습니다.

```
$schedule->command('emails:send')
            ->daily()
            ->environments(['staging', 'production']);
```

<a name="timezones"></a>
### 타임존

`timezone` 메서드를 사용하면, 예약 작업의 시간이 특정 타임존 기준으로 해석되도록 지정할 수 있습니다.

```
$schedule->command('report:generate')
         ->timezone('America/New_York')
         ->at('2:00')
```

만약 모든 예약 작업에 동일한 타임존을 반복해서 지정한다면, `App\Console\Kernel` 클래스에 `scheduleTimezone` 메서드를 정의해 전체 예약 작업의 기본 타임존을 설정할 수 있습니다.

```
/**
 * 예약 이벤트에 기본적으로 사용할 타임존을 반환합니다.
 *
 * @return \DateTimeZone|string|null
 */
protected function scheduleTimezone()
{
    return 'America/Chicago';
}
```

> [!WARNING]
> 일부 타임존은 서머타임(일광 절약 시간제)이 적용될 수 있습니다. 서머타임 변경 시 예약 작업이 두 번 실행되거나 아예 실행되지 않을 수 있습니다. 따라서, 가능하다면 타임존 기반 스케줄링은 피할 것을 권장합니다.

<a name="preventing-task-overlaps"></a>
### 작업 중복 방지

기본적으로, 예약 작업은 이전 작업이 아직 실행 중이더라도 새 인스턴스가 계속 실행됩니다. 이런 중복 실행을 방지하고 싶을 때는 `withoutOverlapping` 메서드를 사용할 수 있습니다.

```
$schedule->command('emails:send')->withoutOverlapping();
```

이 예시에서는 `emails:send` [Artisan 명령어](/docs/9.x/artisan)가 아직 실행 중이지 않을 때만 1분마다 실행됩니다. `withoutOverlapping`은 작업별로 실행 시간이 크게 다를 때, 실행 소요 시간을 예측할 수 없을 때 매우 유용합니다.

필요하다면 "중복 방지" 잠금이 해제되기까지 대기할 최대 시간을 분 단위로 지정할 수 있습니다. 기본적으로는 24시간 후 잠금이 해제됩니다.

```
$schedule->command('emails:send')->withoutOverlapping(10);
```

내부적으로 `withoutOverlapping`은 애플리케이션의 [캐시](/docs/9.x/cache)를 활용해 잠금을 관리합니다. 문제가 있어 작업이 비정상적으로 오래 걸려 잠금이 풀리지 않을 경우, `schedule:clear-cache` Artisan 명령어를 사용해 캐시 잠금을 해제할 수 있습니다. 일반적으로 예기치 않은 서버 장애가 발생한 경우에만 필요합니다.

<a name="running-tasks-on-one-server"></a>
### 단일 서버에서만 작업 실행

> [!WARNING]
> 이 기능을 사용하려면, 애플리케이션의 기본 캐시 드라이버로 `database`, `memcached`, `dynamodb`, `redis` 중 하나를 사용해야 합니다. 또한 모든 서버가 동일한 중앙 캐시 서버와 통신해야 합니다.

여러 서버에서 스케줄러가 실행될 경우, 예약된 작업을 단 하나의 서버에서만 실행하도록 제한할 수 있습니다. 예를 들어, 매주 금요일 밤에 새로운 리포트를 생성하는 작업이 있다고 가정해 봅시다. 이 작업이 세 대의 워커 서버 각각에서 실행된다면 리포트가 세 번 생성될 것입니다. 이는 바람직하지 않습니다.

이런 문제를 막으려면, 예약 작업을 정의할 때 `onOneServer` 메서드를 사용합니다. 해당 작업에 대해 최초 잠금을 획득한 서버가 그 작업을 실행하며, 동시에 다른 서버가 동일 작업을 실행하지 못하도록 원자적 잠금이 적용됩니다.

```
$schedule->command('report:generate')
                ->fridays()
                ->at('17:00')
                ->onOneServer();
```

<a name="naming-unique-jobs"></a>
#### 단일 서버 작업 이름 지정

같은 작업을 매개변수만 다르게 여러 번 예약하면서도, 각각 하나의 서버에서만 실행되도록 하고 싶을 때가 있습니다. 이때는 `name` 메서드로 각 스케줄 정의에 고유한 이름을 부여할 수 있습니다.

```php
$schedule->job(new CheckUptime('https://laravel.com'))
            ->name('check_uptime:laravel.com')
            ->everyFiveMinutes()
            ->onOneServer();

$schedule->job(new CheckUptime('https://vapor.laravel.com'))
            ->name('check_uptime:vapor.laravel.com')
            ->everyFiveMinutes()
            ->onOneServer();
```

마찬가지로, 단일 서버에서 실행되도록 예약된 클로저도 반드시 이름을 지정해야 합니다.

```php
$schedule->call(fn () => User::resetApiRequestCount())
    ->name('reset-api-request-count')
    ->daily()
    ->onOneServer();
```

<a name="background-tasks"></a>
### 백그라운드 작업

여러 작업이 같은 시각에 예약되어 있으면, 기본적으로 `schedule` 메서드에 정의된 순서대로 순차적으로 실행됩니다. 만약 장시간 실행되는 작업이 있다면, 다음 작업이 예정보다 한참 뒤에 시작될 수 있습니다. 여러 작업을 동시에(병렬로) 실행하고 싶다면, `runInBackground` 메서드를 사용할 수 있습니다.

```
$schedule->command('analytics:report')
         ->daily()
         ->runInBackground();
```

> [!WARNING]
> `runInBackground` 메서드는 `command`와 `exec` 메서드로 예약된 작업에만 사용할 수 있습니다.

<a name="maintenance-mode"></a>
### 메인터넌스 모드

애플리케이션이 [메인터넌스 모드](/docs/9.x/configuration#maintenance-mode)에 있을 때는 예약된 작업이 실행되지 않습니다. 이는 서버 유지보수 중 실행 중인 작업들이 영향을 받지 않도록 하기 위함입니다. 그러나 유지보수 모드 상태에서도 특정 작업을 강제로 실행하고 싶다면, 예약 작업 정의 시 `evenInMaintenanceMode` 메서드를 추가로 호출하면 됩니다.

```
$schedule->command('emails:send')->evenInMaintenanceMode();
```

<a name="running-the-scheduler"></a>
## 스케줄러 실행

이제 예약 작업을 어떻게 정의하는지 배웠으니, 실제로 서버에서 스케줄러를 어떻게 실행하는지 알아봅시다. `schedule:run` Artisan 명령어는 모든 예약 작업을 평가하여 서버의 현재 시간에 따라 실행 여부를 판단합니다.

따라서, 라라벨 스케줄러를 사용할 때는 아래와 같이 1분 간격으로 `schedule:run` 명령어를 실행하는 cron 설정만 하나 추가하면 됩니다. 서버에 cron 항목 추가 방법이 익숙하지 않은 경우, [Laravel Forge](https://forge.laravel.com)와 같이 cron 관리를 지원하는 서비스를 활용하는 것도 고려해 보세요.

```shell
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

<a name="running-the-scheduler-locally"></a>
## 로컬에서 스케줄러 실행

일반적으로 개발 환경(로컬 머신)에는 스케줄러를 위한 cron 항목을 추가하지 않습니다. 대신, `schedule:work` Artisan 명령어를 사용할 수 있습니다. 이 명령어는 포그라운드에서 1분마다 스케줄러를 실행하며, 종료(중단)할 때까지 계속 동작합니다.

```shell
php artisan schedule:work
```

<a name="task-output"></a>
## 작업 출력

라라벨 스케줄러는 예약 작업의 출력 결과를 편리하게 다루는 여러 메서드를 제공합니다. 먼저, `sendOutputTo` 메서드를 사용해 실행 결과를 파일 등에 저장할 수 있습니다.

```
$schedule->command('emails:send')
         ->daily()
         ->sendOutputTo($filePath);
```

출력을 기존 파일에 이어서 기록하고 싶다면, `appendOutputTo` 메서드를 사용할 수 있습니다.

```
$schedule->command('emails:send')
         ->daily()
         ->appendOutputTo($filePath);
```

`emailOutputTo` 메서드를 사용하면, 작업 출력 결과를 지정한 이메일 주소로 보낼 수 있습니다. 이 기능을 사용하려면 먼저 라라벨의 [이메일 서비스](/docs/9.x/mail)를 설정해야 합니다.

```
$schedule->command('report:generate')
         ->daily()
         ->sendOutputTo($filePath)
         ->emailOutputTo('taylor@example.com');
```

Artisan 또는 시스템 명령어가 0이 아닌(exit code가 비정상인) 종료 코드로 끝났을 때만 출력 결과를 이메일로 받고 싶다면, `emailOutputOnFailure` 메서드를 사용하세요.

```
$schedule->command('report:generate')
         ->daily()
         ->emailOutputOnFailure('taylor@example.com');
```

> [!WARNING]
> `emailOutputTo`, `emailOutputOnFailure`, `sendOutputTo`, `appendOutputTo` 메서드는 `command` 및 `exec` 메서드로 예약된 작업에서만 사용할 수 있습니다.

<a name="task-hooks"></a>
## 작업 훅

`before`와 `after` 메서드를 사용하면 예약 작업 실행 전후에 코드를 실행할 수 있습니다.

```
$schedule->command('emails:send')
         ->daily()
         ->before(function () {
             // 작업 실행 직전...
         })
         ->after(function () {
             // 작업 실행 직후...
         });
```

`onSuccess`와 `onFailure` 메서드를 사용하면 예약 작업이 성공했을 때 또는 실패했을 때 실행할 코드를 지정할 수 있습니다. 실패는 Artisan 또는 시스템 명령어가 비정상 종료(exit code가 0이 아님)될 때를 의미합니다.

```
$schedule->command('emails:send')
         ->daily()
         ->onSuccess(function () {
             // 작업이 성공한 경우...
         })
         ->onFailure(function () {
             // 작업이 실패한 경우...
         });
```

명령어의 출력 결과를 사용할 수 있다면, `after`, `onSuccess`, `onFailure` 훅의 클로저에서 `$output` 인자로 `Illuminate\Support\Stringable` 타입을 명시해 바로 활용할 수 있습니다.

```
use Illuminate\Support\Stringable;

$schedule->command('emails:send')
         ->daily()
         ->onSuccess(function (Stringable $output) {
             // 작업이 성공한 경우...
         })
         ->onFailure(function (Stringable $output) {
             // 작업이 실패한 경우...
         });
```

<a name="pinging-urls"></a>
#### URL로 ping 보내기

`pingBefore`와 `thenPing` 메서드를 활용하면 작업 실행 전이나 후에 지정한 URL로 자동으로 ping을 보낼 수 있습니다. 이 기능은 [Envoyer](https://envoyer.io)와 같은 외부 서비스에 작업 시작/종료 알림을 전달하는 데 유용합니다.

```
$schedule->command('emails:send')
         ->daily()
         ->pingBefore($url)
         ->thenPing($url);
```

`pingBeforeIf`, `thenPingIf` 메서드를 사용하면, 주어진 조건이 `true`일 때만 URL로 ping을 보낼 수 있습니다.

```
$schedule->command('emails:send')
         ->daily()
         ->pingBeforeIf($condition, $url)
         ->thenPingIf($condition, $url);
```

`pingOnSuccess`, `pingOnFailure` 메서드는 작업의 성공 또는 실패 시에만 지정한 URL로 ping을 보냅니다. 실패는 Artisan 또는 시스템 명령어가 비정상 종료될 때를 의미합니다.

```
$schedule->command('emails:send')
         ->daily()
         ->pingOnSuccess($successUrl)
         ->pingOnFailure($failureUrl);
```

이러한 ping 관련 메서드는 모두 Guzzle HTTP 라이브러리가 필요합니다. Guzzle은 일반적으로 새로운 라라벨 프로젝트에 기본 포함되어 있지만, 만약 삭제된 경우 Composer 패키지 매니저로 수동 설치할 수 있습니다.

```shell
composer require guzzlehttp/guzzle
```

<a name="events"></a>
## 이벤트

필요하다면, 스케줄러가 디스패치하는 [이벤트](/docs/9.x/events)를 감지해 처리할 수 있습니다. 일반적으로 이벤트 리스너 매핑은 애플리케이션의 `App\Providers\EventServiceProvider` 클래스에 정의합니다.

```
/**
 * 애플리케이션의 이벤트 리스너 매핑
 *
 * @var array
 */
protected $listen = [
    'Illuminate\Console\Events\ScheduledTaskStarting' => [
        'App\Listeners\LogScheduledTaskStarting',
    ],

    'Illuminate\Console\Events\ScheduledTaskFinished' => [
        'App\Listeners\LogScheduledTaskFinished',
    ],

    'Illuminate\Console\Events\ScheduledBackgroundTaskFinished' => [
        'App\Listeners\LogScheduledBackgroundTaskFinished',
    ],

    'Illuminate\Console\Events\ScheduledTaskSkipped' => [
        'App\Listeners\LogScheduledTaskSkipped',
    ],

    'Illuminate\Console\Events\ScheduledTaskFailed' => [
        'App\Listeners\LogScheduledTaskFailed',
    ],
];
```
