# 릴리스 노트 (Release Notes)

- [버전 체계](#versioning-scheme)
- [지원 정책](#support-policy)
- [라라벨 10](#laravel-10)

<a name="versioning-scheme"></a>
## 버전 체계

라라벨과 라라벨의 공식 1차 제공 패키지는 [시맨틱 버저닝(Semantic Versioning)](https://semver.org)을 따릅니다. 프레임워크의 주요(메이저) 버전은 매년(대략 1분기) 한 번씩 발표되며, 마이너 및 패치 버전은 필요에 따라 매주 출시될 수 있습니다. 마이너 및 패치 릴리스에는 **절대로** 호환성을 깨뜨리는 변경사항이 포함되어선 안 됩니다.

애플리케이션이나 패키지에서 라라벨 프레임워크 또는 그것의 구성 요소를 참조할 때, 항상 `^10.0`과 같은 버전 제약 조건을 사용하는 것이 좋습니다. 라라벨의 주요 버전에서는 호환성에 영향을 주는 변경이 있을 수 있기 때문입니다. 하지만 라라벨 팀은 새로운 메이저 버전으로 하루 이내에 업데이트할 수 있도록 최선을 다해 노력합니다.

<a name="named-arguments"></a>
#### 명명된 인수(Named Arguments)

[명명된 인수](https://www.php.net/manual/en/functions.arguments.php#functions.named-arguments)는 라라벨의 하위 호환성(Backwards Compatibility) 정책에 포함되지 않습니다. 코드 베이스 품질을 높이기 위해 필요하다면 함수 인수명이 변경될 수 있습니다. 따라서 라라벨의 메서드를 호출할 때 명명된 인수를 사용할 경우, 앞으로 인수명이 변경될 수 있음을 인지하고 신중하게 사용해야 합니다.

<a name="support-policy"></a>
## 지원 정책

모든 라라벨 릴리스는 출시 후 18개월 동안 버그 수정이 제공되며, 2년 동안 보안 수정이 제공됩니다. Lumen을 포함한 기타 추가 라이브러리는 최신 메이저 릴리스에만 버그 수정이 제공됩니다. 또한, 라라벨이 지원하는 데이터베이스 버전도 [여기](/docs/10.x/database#introduction)에서 반드시 확인해 주세요.

<div class="overflow-auto">

| 버전 | PHP (*) | 출시일 | 버그 수정 지원 종료 | 보안 수정 지원 종료 |
| --- | --- | --- | --- | --- |
| 8 | 7.3 - 8.1 | 2020년 9월 8일 | 2022년 7월 26일 | 2023년 1월 24일 |
| 9 | 8.0 - 8.2 | 2022년 2월 8일 | 2023년 8월 8일 | 2024년 2월 6일 |
| 10 | 8.1 - 8.3 | 2023년 2월 14일 | 2024년 8월 6일 | 2025년 2월 4일 |
| 11 | 8.2 - 8.3 | 2024년 3월 12일 | 2025년 8월 5일 | 2026년 2월 3일 |

</div>

(*) 지원되는 PHP 버전

<a name="laravel-10"></a>
## 라라벨 10

이미 알고 계신 분도 있겠지만, 라라벨은 8 버전 출시부터 연 1회 주기로 메이저 릴리스를 도입하였습니다. 과거에는 주기적으로 6개월마다 메이저 버전이 출시되었습니다. 이러한 주기 변경은 커뮤니티의 유지 보수 부담을 줄이고, 개발팀이 호환성 문제가 없는 범위 내에서 강력하고 혁신적인 기능을 추가하는 데 집중할 수 있도록 하기 위함입니다. 실제로, 라라벨 9에서는 하위 호환성을 깨트리지 않으면서도 여러 강력한 기능들이 추가되었습니다.

따라서, 앞으로의 "메이저" 버전은 주로 상위 종속성을 업그레이드하는 등 "유지보수" 작업에 중점을 두게 될 가능성이 높다고 할 수 있습니다. 이번 릴리스 노트에서도 그 흐름을 확인할 수 있습니다.

라라벨 10은 라라벨 9.x에서 이루어진 개선을 이어받아, 애플리케이션 스캐폴드(템플릿) 내 모든 메서드와 프레임워크 전역에서 클래스 생성에 활용되는 스텁 파일 전반에 인수 타입과 반환 타입을 도입했습니다. 또한 외부 프로세스의 실행 및 상호작용을 위한 개발자 친화적인 추상화 계층이 새롭게 추가되었습니다. 추가로, 애플리케이션의 "기능 플래그" 관리를 쉽게 도와주는 신규 패키지인 Laravel Pennant가 도입되었습니다.

<a name="php-8"></a>
### PHP 8.1

라라벨 10.x는 최소 PHP 8.1 이상의 버전을 필요로 합니다.

<a name="types"></a>
### 타입(Type) 명시

_애플리케이션 스캐폴드 및 스텁 파일의 타입 힌트는 [Nuno Maduro](https://github.com/nunomaduro)가 기여하였습니다._

초기 버전의 라라벨은 그 당시 PHP에서 지원하는 모든 타입 힌트 기능을 최대한 활용했습니다. 이후 수년 간 PHP에는 다양한 프리미티브 타입 힌트, 반환 타입, 유니언 타입 등 여러 새로운 기능이 추가되었습니다.

라라벨 10.x는 애플리케이션 템플릿과 프레임워크에서 사용하는 모든 스텁 파일을 철저하게 개선하여, 모든 메서드 시그니처에 인수 및 반환 타입을 도입했습니다. 또한 불필요한 "doc block" 형태의 타입 힌트 정보는 삭제되었습니다.

이 변경은 기존 애플리케이션과 완전히 하위 호환성을 유지합니다. 즉, 기존 애플리케이션에서 이러한 타입 힌트가 없는 경우라도 정상적으로 작동합니다.

<a name="laravel-pennant"></a>
### 라라벨 페넌트(Laravel Pennant)

_Laravel Pennant는 [Tim MacDonald](https://github.com/timacdonald)가 개발하였습니다._

공식 신규 패키지인 Laravel Pennant가 출시되었습니다. Pennant는 애플리케이션의 기능 플래그를 간단하고 효율적으로 관리할 수 있도록 도와주는 경량 솔루션입니다. Pennant에는 기본적으로 메모리 내 `array` 드라이버와, 영구 저장을 위한 `database` 드라이버가 포함되어 있습니다.

다음과 같이 `Feature::define` 메서드로 기능을 쉽게 정의할 수 있습니다:

```php
use Laravel\Pennant\Feature;
use Illuminate\Support\Lottery;

Feature::define('new-onboarding-flow', function () {
    return Lottery::odds(1, 10);
});
```

기능이 정의된 후에는, 현재 사용자가 해당 기능에 접근할 수 있는지 간단하게 확인할 수 있습니다:

```php
if (Feature::active('new-onboarding-flow')) {
    // ...
}
```

물론, 더 편리하게 사용할 수 있도록 Blade 지시어도 제공됩니다:

```blade
@feature('new-onboarding-flow')
    <div>
        <!-- ... -->
    </div>
@endfeature
```

Pennant는 이 외에도 다양한 고급 기능과 API를 제공합니다. 자세한 정보는 [Pennant 공식 문서](/docs/10.x/pennant)를 참고해 주세요.

<a name="process"></a>
### 프로세스 상호작용(Process Interaction)

_이 프로세스 추상화 계층은 [Nuno Maduro](https://github.com/nunomaduro)와 [Taylor Otwell](https://github.com/taylorotwell)이 기여하였습니다._

라라벨 10.x에서는 외부 프로세스의 실행과 상호작용을 위해 새로운 `Process` 퍼사드를 통한 강력한 추상화 계층이 추가되었습니다:

```php
use Illuminate\Support\Facades\Process;

$result = Process::run('ls -la');

return $result->output();
```

프로세스는 '풀(pool)'로도 실행할 수 있어, 여러 개의 프로세스를 병렬로 실행하고 쉽게 관리할 수 있습니다:

```php
use Illuminate\Process\Pool;
use Illuminate\Support\Facades\Process;

[$first, $second, $third] = Process::concurrently(function (Pool $pool) {
    $pool->command('cat first.txt');
    $pool->command('cat second.txt');
    $pool->command('cat third.txt');
});

return $first->output();
```

또한 테스트를 편리하게 할 수 있도록 프로세스 동작을 쉽게 '가짜(Fake)'로 만들 수도 있습니다:

```php
Process::fake();

// ...

Process::assertRan('ls -la');
```

프로세스와의 상호작용에 대한 더 자세한 내용은 [프로세스 공식 문서](/docs/10.x/processes)를 참고해 주세요.

<a name="test-profiling"></a>
### 테스트 프로파일링(Test Profiling)

_테스트 프로파일링은 [Nuno Maduro](https://github.com/nunomaduro)가 기여하였습니다._

Artisan `test` 명령어에 새로운 `--profile` 옵션이 추가되어, 애플리케이션 내에서 가장 느린 테스트를 쉽게 확인할 수 있습니다:

```shell
php artisan test --profile
```

이 옵션을 활용하면 CLI 출력 상에서 가장 느리게 실행된 테스트가 바로 표시되어, 빠르게 원인을 파악할 수 있습니다:

<p align="center">
```
<img width="100%" src="https://user-images.githubusercontent.com/5457236/217328439-d8d983ec-d0fc-4cde-93d9-ae5bccf5df14.png"/>
```
</p>

<a name="pest-scaffolding"></a>
### Pest 스캐폴딩

이제 새로운 라라벨 프로젝트를 생성할 때 기본적으로 Pest 테스트 스캐폴딩을 포함할 수 있습니다. 이 기능을 활성화하려면 라라벨 인스톨러 사용 시 `--pest` 플래그를 추가하면 됩니다:

```shell
laravel new example-application --pest
```

<a name="generator-cli-prompts"></a>
### 생성기 명령 프롬프트 개선

_생성기 CLI 프롬프트 개선은 [Jess Archer](https://github.com/jessarcher)가 기여하였습니다._

개발자 경험을 더욱 향상시키기 위해, 라라벨에 내장된 모든 `make` 명령어는 이제 별도의 인수가 없어도 동작하게 되었습니다. 명령어를 인수 없이 실행하면, 필요한 인수를 차례로 입력하도록 프롬프트가 표시됩니다:

```shell
php artisan make:controller
```

<a name="horizon-telescope-facelift"></a>
### Horizon/Telescope UI 리뉴얼

[Horizon](/docs/10.x/horizon)과 [Telescope](/docs/10.x/telescope)가 더 현대적이고 세련된 디자인으로 새롭게 리뉴얼되었습니다. 타이포그래피, 공간, 전반적인 디자인이 개선되었습니다:

<img src="https://laravel.com/img/docs/horizon-example.png" />