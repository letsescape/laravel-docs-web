# 설정 (Configuration)

- [소개](#introduction)
- [환경 설정](#environment-configuration)
    - [환경 변수 타입](#environment-variable-types)
    - [환경 설정 값 가져오기](#retrieving-environment-configuration)
    - [현재 환경 판별하기](#determining-the-current-environment)
    - [환경 파일 암호화](#encrypting-environment-files)
- [설정 값 접근하기](#accessing-configuration-values)
- [설정 캐싱](#configuration-caching)
- [설정 퍼블리싱](#configuration-publishing)
- [디버그 모드](#debug-mode)
- [점검(유지보수) 모드](#maintenance-mode)

<a name="introduction"></a>
## 소개

라라벨 프레임워크의 모든 설정 파일은 `config` 디렉터리에 저장됩니다. 각 옵션에 대한 설명이 포함되어 있으니, 이 파일들을 자유롭게 살펴보고 어떤 옵션을 사용할 수 있는지 익혀보시기 바랍니다.

이 설정 파일들을 통해 데이터베이스 연결 정보, 메일 서버 정보, 애플리케이션 URL, 암호화 키 등의 다양한 핵심 설정 값을 손쉽게 관리할 수 있습니다.

<a name="the-about-command"></a>
#### `about` 명령어

라라벨은 `about` 아티즌 명령어를 통해 애플리케이션의 설정, 드라이버, 환경 요약 정보를 한눈에 보여줍니다.

```shell
php artisan about
```

만약 전체 요약 정보 중 특정 섹션만 보고 싶다면, `--only` 옵션을 사용해 해당 섹션만 필터링할 수 있습니다.

```shell
php artisan about --only=environment
```

또한, 한 설정 파일의 상세 내용을 확인하고 싶다면 `config:show` 아티즌 명령어를 사용할 수 있습니다.

```shell
php artisan config:show database
```

<a name="environment-configuration"></a>
## 환경 설정

애플리케이션이 실행되는 환경(예: 개발, 스테이징, 운영)에 따라 서로 다른 설정 값을 사용하는 것은 매우 유용합니다. 예를 들어, 운영 서버와 로컬 환경에서 서로 다른 캐시 드라이버를 사용하고 싶을 때가 있을 수 있습니다.

라라벨은 이러한 작업을 간편하게 처리하기 위해 [DotEnv](https://github.com/vlucas/phpdotenv) PHP 라이브러리를 활용합니다. 신규 라라벨 프로젝트를 설치하면, 애플리케이션 루트 디렉터리에 `.env.example` 파일이 생성되어 여러 가지 일반적인 환경 변수들을 정의합니다. 라라벨을 설치하는 과정에서 이 파일은 자동으로 `.env` 파일로 복사됩니다.

기본 `.env` 파일에는 로컬 또는 운영 웹서버 등, 애플리케이션이 실행되는 환경에 따라 달라질 수 있는 기본 설정 값 일부가 포함되어 있습니다. 이 값들은 라라벨의 `config` 디렉터리 내 설정 파일들에서 `env` 함수를 통해 읽어들입니다.

팀 단위로 개발할 경우 `.env.example` 파일을 애플리케이션과 함께 공유·관리하는 것이 좋습니다. 예시 설정 파일에 플레이스홀더 값을 입력해 두면, 팀원들은 애플리케이션 실행에 필요한 환경 변수 목록을 명확하게 확인할 수 있습니다.

> [!NOTE]
> `.env` 파일 내의 모든 변수는 서버 또는 시스템 수준의 외부 환경 변수로 덮어쓸 수 있습니다.

<a name="environment-file-security"></a>
#### 환경 파일 보안

각 개발자나 서버는 서로 다른 환경 설정이 필요하므로, 애플리케이션의 `.env` 파일을 소스 컨트롤(버전 관리 시스템)에 커밋해서는 안 됩니다. 또한, 소스 컨트롤 저장소에 악의적인 접근자가 침입할 경우 민감한 정보가 유출될 위험이 있기 때문입니다.

다만, 라라벨의 내장 [환경 파일 암호화](#encrypting-environment-files) 기능을 사용하면 환경 파일을 암호화하여 안전하게 소스 컨트롤에 등록할 수 있습니다.

<a name="additional-environment-files"></a>
#### 추가 환경 파일

애플리케이션의 환경 변수를 불러오기 전에, 라라벨은 외부에서 `APP_ENV` 환경 변수가 제공됐는지, 또는 `--env` CLI 인자가 지정됐는지 먼저 확인합니다. 지정됐다면, 해당 환경 이름에 맞는 `.env.[APP_ENV]` 파일이 존재할 경우 이를 로드합니다. 만약 존재하지 않으면 기본 `.env` 파일을 불러옵니다.

<a name="environment-variable-types"></a>
### 환경 변수 타입

`.env` 파일에 정의하는 모든 변수는 일반적으로 문자열로 파싱되나, `env()` 함수에서 다양한 타입을 사용할 수 있도록 일부 예약어 값이 제공됩니다.

<div class="overflow-auto">

| `.env` 값     | `env()` 반환값     |
| ------------- | ------------------ |
| true          | (bool) true        |
| (true)        | (bool) true        |
| false         | (bool) false       |
| (false)       | (bool) false       |
| empty         | (string) ''        |
| (empty)       | (string) ''        |
| null          | (null) null        |
| (null)        | (null) null        |

</div>

공백이 포함된 환경 변수 값을 정의해야 할 경우, 값을 큰따옴표로 감싸면 됩니다.

```ini
APP_NAME="My Application"
```

<a name="retrieving-environment-configuration"></a>
### 환경 설정 값 가져오기

`.env` 파일에 나열된 모든 변수들은 애플리케이션이 요청을 받을 때 PHP의 전역 변수 `$_ENV`에 로드됩니다. 그러나 설정 파일 내에서는 `env` 함수를 이용해 해당 변수 값을 쉽게 참조할 수 있습니다. 실제로 라라벨의 기본 설정 파일들을 살펴보면 이미 다수의 옵션이 이 함수를 활용해 값을 불러오고 있습니다.

```php
'debug' => env('APP_DEBUG', false),
```

`env` 함수에 전달하는 두 번째 인자는 "기본 값"이며, 해당 키에 대한 환경 변수가 없을 경우 이 기본 값이 반환됩니다.

<a name="determining-the-current-environment"></a>
### 현재 환경 판별하기

현재 애플리케이션의 환경은 `.env` 파일 내의 `APP_ENV` 변수로 결정됩니다. 이 값은 `App` [파사드](/docs/12.x/facades)의 `environment` 메서드를 통해 접근할 수 있습니다.

```php
use Illuminate\Support\Facades\App;

$environment = App::environment();
```

`environment` 메서드에 인자를 전달하여, 환경이 특정 값과 일치하는지 확인할 수 있습니다. 여러 값을 전달할 경우, 환경이 그 중 하나와 일치하면 `true`를 반환합니다.

```php
if (App::environment('local')) {
    // 현재 환경이 local임
}

if (App::environment(['local', 'staging'])) {
    // 현재 환경이 local 또는 staging임
}
```

> [!NOTE]
> 서버에서 `APP_ENV` 환경 변수를 정의하면, 현재 애플리케이션 환경 설정이 해당 값으로 덮어써집니다.

<a name="encrypting-environment-files"></a>
### 환경 파일 암호화

암호화되지 않은 환경 파일은 절대로 소스 컨트롤에 저장하면 안 됩니다. 하지만 라라벨은 환경 파일을 암호화하여 다른 애플리케이션 파일들과 함께 안전하게 소스 컨트롤에 추가할 수 있도록 지원합니다.

<a name="encryption"></a>
#### 암호화

환경 파일을 암호화하려면 `env:encrypt` 명령어를 사용합니다.

```shell
php artisan env:encrypt
```

`env:encrypt` 명령어를 실행하면, `.env` 파일이 암호화되어 그 내용이 `.env.encrypted` 파일에 저장됩니다. 복호화에 필요한 키는 명령어 실행 결과로 출력되며, 반드시 별도의 안전한 비밀번호 관리자 등에 저장해 두어야 합니다. 만약 직접 키 값을 지정하고 싶다면 `--key` 옵션을 사용할 수 있습니다.

```shell
php artisan env:encrypt --key=3UVsEgGVK36XN82KKeyLFMhvosbZN1aF
```

> [!NOTE]
> 지정하는 키의 길이는 사용하는 암호화 알고리즘(cipher)의 요구사항에 맞아야 합니다. 기본적으로 라라벨은 32자 길이의 키를 요구하는 `AES-256-CBC` 알고리즘을 사용합니다. `--cipher` 옵션을 통해 라라벨의 [encrypter](/docs/12.x/encryption)에서 지원하는 다른 암호화 알고리즘을 사용할 수도 있습니다.

여러 개의 환경 파일(예: `.env`, `.env.staging`)을 사용하는 경우, `--env` 옵션을 통해 암호화할 환경 파일을 직접 지정할 수 있습니다.

```shell
php artisan env:encrypt --env=staging
```

<a name="decryption"></a>
#### 복호화

환경 파일을 복호화하려면 `env:decrypt` 명령어를 사용합니다. 이 명령어는 복호화 키가 필요하며, 라라벨은 이 키를 `LARAVEL_ENV_ENCRYPTION_KEY` 환경 변수에서 가져옵니다.

```shell
php artisan env:decrypt
```

또는, 명령 실행 시 `--key` 옵션을 통해 직접 키를 전달할 수도 있습니다.

```shell
php artisan env:decrypt --key=3UVsEgGVK36XN82KKeyLFMhvosbZN1aF
```

`env:decrypt` 명령어를 실행하면 `.env.encrypted` 파일의 내용을 복호화하여 `.env` 파일로 복원합니다.

`env:decrypt` 명령어에도 `--cipher` 옵션을 추가해 원하는 암호화 알고리즘으로 복호화할 수 있습니다.

```shell
php artisan env:decrypt --key=qUWuNRdfuImXcKxZ --cipher=AES-128-CBC
```

여러 개의 환경 파일이 있는 경우, `--env` 옵션을 통해 복호화할 환경 파일을 지정할 수 있습니다.

```shell
php artisan env:decrypt --env=staging
```

기존 환경 파일을 덮어쓸 필요가 있다면, `env:decrypt` 명령어에 `--force` 옵션을 추가하면 됩니다.

```shell
php artisan env:decrypt --force
```

<a name="accessing-configuration-values"></a>
## 설정 값 접근하기

애플리케이션 어디에서든 `Config` 파사드 또는 전역 `config` 함수를 사용해 설정 값을 편리하게 가져올 수 있습니다. 설정 값에 접근할 때는 "점 표기법(dot syntax)"을 사용하며, `파일명.옵션명` 형식으로 조회할 수 있습니다. 해당 설정이 존재하지 않을 경우, 기본값을 지정하여 반환받을 수도 있습니다.

```php
use Illuminate\Support\Facades\Config;

$value = Config::get('app.timezone');

$value = config('app.timezone');

// 설정 값이 존재하지 않을 경우 기본 값 사용
$value = config('app.timezone', 'Asia/Seoul');
```

실행 중에 설정 값을 변경하려면 `Config` 파사드의 `set` 메서드 또는 `config` 함수에 배열을 전달하면 됩니다.

```php
Config::set('app.timezone', 'America/Chicago');

config(['app.timezone' => 'America/Chicago']);
```

정적 분석(Static Analysis)의 정확성을 높이기 위해, `Config` 파사드는 타입이 지정된 설정 값 조회 메서드도 제공합니다. 값의 타입이 예상과 다르면 예외가 발생합니다.

```php
Config::string('config-key');
Config::integer('config-key');
Config::float('config-key');
Config::boolean('config-key');
Config::array('config-key');
```

<a name="configuration-caching"></a>
## 설정 캐싱

애플리케이션의 성능을 높이기 위해, 모든 설정 파일을 하나의 파일로 캐싱할 수 있습니다. 이를 위해 `config:cache` 아티즌 명령어를 사용합니다. 이 명령어는 모든 설정 옵션을 하나로 묶어 프레임워크가 빠르게 불러올 수 있도록 해줍니다.

일반적으로 이 명령어는 운영 배포(프로덕션) 과정의 일부로 실행하는 것이 가장 좋습니다. 로컬 개발 중에는 설정 값의 수시 변경이 필요할 수 있으므로 이 명령어를 사용하지 않는 것이 좋습니다.

설정이 캐싱되면, 더 이상 요청 처리나 아티즌 명령 실행 시 애플리케이션의 `.env` 파일이 로드되지 않습니다. 따라서 이 상태에서는 `env` 함수가 시스템 외부 환경 변수만 반환하게 됩니다.

이러한 이유로, 반드시 라라벨 애플리케이션의 설정(`config`) 파일 내에서만 `env` 함수를 호출해야 합니다. 실제로 라라벨 기본 설정 파일들을 보면 이를 잘 지키고 있음을 확인할 수 있습니다. 애플리케이션 내에서 설정 값은 언제든 위에서 소개한 `config` 함수를 통해 접근할 수 있습니다.

설정 캐시를 비우려면 `config:clear` 명령어를 사용하면 됩니다.

```shell
php artisan config:clear
```

> [!WARNING]
> 배포 과정에서 `config:cache` 명령어를 사용할 경우, 반드시 `env` 함수를 설정 파일 내에서만 호출하도록 해야 합니다. 설정이 캐싱되면, 더 이상 `.env` 파일이 로드되지 않으므로, `env` 함수는 오직 외부 시스템 환경 변수만 반환하게 됩니다.

<a name="configuration-publishing"></a>
## 설정 퍼블리싱

라라벨의 대부분의 설정 파일들은 이미 애플리케이션의 `config` 디렉터리에 퍼블리싱되어 있습니다. 하지만 `cors.php`, `view.php` 등 일부 설정 파일은 대부분의 애플리케이션에서 수정할 필요가 없기 때문에 기본적으로 퍼블리싱되어 있지 않습니다.

이러한 파일들이 필요할 경우 `config:publish` 아티즌 명령어를 사용하여 원하는 설정 파일을 퍼블리싱할 수 있습니다.

```shell
php artisan config:publish

php artisan config:publish --all
```

<a name="debug-mode"></a>
## 디버그 모드

`config/app.php` 설정 파일의 `debug` 옵션은 오류 발생 시 사용자에게 얼마나 많은 정보를 표시할지를 결정합니다. 기본적으로 이 옵션은 `.env` 파일에 저장된 `APP_DEBUG` 환경 변수 값을 따릅니다.

> [!WARNING]
> 개발 환경(로컬)에서는 `APP_DEBUG` 환경 변수를 반드시 `true`로 설정하세요. **운영 환경에서는 반드시 이 값을 `false`로 유지해야 하며, `true`로 설정할 경우 중요한 설정 정보가 최종 사용자에게 노출될 위험이 있습니다.**

<a name="maintenance-mode"></a>
## 점검(유지보수) 모드

점검(유지보수) 모드에서는 모든 요청에 대해 커스텀 뷰가 표시됩니다. 이를 통해 애플리케이션을 쉽고 빠르게 "임시 중단" 상태로 전환할 수 있으며, 업데이트나 유지보수를 진행할 때 유용합니다. 점검 모드 체크는 기본 미들웨어 스택에 포함되어 있습니다. 만약 애플리케이션이 점검 모드로 전환되어 있다면, `Symfony\Component\HttpKernel\Exception\HttpException` 예외가 503 상태 코드와 함께 발생합니다.

점검 모드로 전환하려면, `down` 아티즌 명령어를 실행하세요.

```shell
php artisan down
```

모든 점검 모드 응답에 `Refresh` HTTP 헤더를 추가하려면, `down` 명령을 실행할 때 `refresh` 옵션을 사용할 수 있습니다. `Refresh` 헤더는 브라우저에게 지정된 초 뒤에 자동으로 페이지를 새로 고치도록 지시합니다.

```shell
php artisan down --refresh=15
```

또한 `retry` 옵션을 통해 `Retry-After` HTTP 헤더의 값을 설정할 수 있습니다. 단, 브라우저에서는 이 헤더를 무시하는 경우가 많습니다.

```shell
php artisan down --retry=60
```

<a name="bypassing-maintenance-mode"></a>
#### 점검 모드 우회

비밀 토큰을 이용해 점검 모드를 우회할 수 있도록 하려면, `secret` 옵션으로 우회 토큰을 지정할 수 있습니다.

```shell
php artisan down --secret="1630542a-246b-4b66-afa1-dd72a4c43515"
```

이렇게 애플리케이션을 점검 모드로 전환한 후, 토큰이 포함된 애플리케이션 URL로 접속하면 라라벨이 점검 모드 우회용 쿠키를 브라우저에 발급합니다.

```shell
https://example.com/1630542a-246b-4b66-afa1-dd72a4c43515
```

비밀 토큰을 라라벨이 직접 생성해 주도록 하려면 `with-secret` 옵션을 사용할 수 있습니다. 애플리케이션이 점검 모드로 전환될 때 비밀 토큰이 표시됩니다.

```shell
php artisan down --with-secret
```

이 숨겨진 경로에 접속하면 루트(`/`)로 리다이렉트됩니다. 쿠키가 발급된 이후에는 점검 모드인 상태에서도 정상적으로 애플리케이션을 사용할 수 있습니다.

> [!NOTE]
> 점검 모드 비밀 토큰은 영문자, 숫자, 그리고 선택적으로 대시(-)로 구성하는 것이 일반적이며, URL에서 특수한 의미를 가지는 문자(예: `?`, `&`)는 사용하지 않는 것이 좋습니다.

<a name="maintenance-mode-on-multiple-servers"></a>
#### 다중 서버의 점검 모드

기본적으로 라라벨은 파일 기반 시스템으로 애플리케이션의 점검 모드 상태를 관리합니다. 즉, `php artisan down` 명령어를 각각의 서버에서 실행해줘야 점검 모드가 적용됩니다.

대신 라라벨에서는 캐시 기반 점검 모드 관리 방법도 제공합니다. 이 방법을 사용하면 한 서버에서만 `php artisan down` 명령어를 실행하면 됩니다. 사용을 원한다면 애플리케이션 `.env` 파일의 점검 모드 관련 변수를 아래와 같이 수정하세요. 여러 서버에서 모두 접근 가능한 cache `store`를 지정하는 것이 중요합니다. 이를 통해 전체 서버에서 점검 모드 상태가 일관되게 동기화됩니다.

```ini
APP_MAINTENANCE_DRIVER=cache
APP_MAINTENANCE_STORE=database
```

<a name="pre-rendering-the-maintenance-mode-view"></a>
#### 점검 모드 뷰 미리 렌더링

배포 과정 중에 `php artisan down` 명령어를 사용할 경우, 의존 라이브러리(Composer dependencies)나 인프라가 업데이트되는 순간에 사용자가 애플리케이션에 접근하면 오류를 겪을 수 있습니다. 이는 라라벨 프레임워크의 상당 부분이 부트되는 과정에서 점검 모드 상태를 확인하고, 템플릿 엔진으로 점검 모드 뷰를 렌더링해야 하기 때문입니다.

이 문제를 해결하기 위해, 라라벨은 애플리케이션의 의존성이 모두 로드되기 전에 요청 주기(request cycle) 초기에 반환할 수 있도록 점검 모드 뷰를 미리 렌더링할 수 있습니다. 원하는 템플릿을 `down` 명령어의 `render` 옵션으로 지정하면 됩니다.

```shell
php artisan down --render="errors::503"
```

<a name="redirecting-maintenance-mode-requests"></a>
#### 점검 모드 요청 리디렉션

점검 모드에서는 사용자가 어떤 URL에 접근하더라도 점검 모드 뷰가 표시됩니다. 만약 모든 요청을 특정 URL로 리디렉션하고 싶다면 `redirect` 옵션을 사용할 수 있습니다. 예를 들어, 모든 요청을 `/` 경로로 리디렉션하려면 다음과 같이 사용합니다:

```shell
php artisan down --redirect=/
```

<a name="disabling-maintenance-mode"></a>
#### 점검 모드 해제

점검 모드를 해제하려면 `up` 명령어를 사용하세요.

```shell
php artisan up
```

> [!NOTE]
> 점검 모드의 기본 템플릿은 `resources/views/errors/503.blade.php`에 직접 커스텀하여 사용할 수 있습니다.

<a name="maintenance-mode-queues"></a>
#### 점검 모드와 큐

애플리케이션이 점검 모드에 있는 동안에는 [큐 작업](/docs/12.x/queues)이 처리되지 않습니다. 점검 모드가 해제되면 큐 작업은 다시 정상적으로 처리됩니다.

<a name="alternatives-to-maintenance-mode"></a>
#### 점검 모드의 대안

점검 모드는 몇 초 간의 다운타임이 발생하게 됩니다. 완전 무중단 배포(zero-downtime deployment)가 필요하다면 라라벨 전용 관리형 플랫폼인 [Laravel Cloud](https://cloud.laravel.com)을 활용해 보시기 바랍니다.