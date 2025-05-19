# 설정 (Configuration)

- [소개](#introduction)
- [환경 설정](#environment-configuration)
    - [환경 변수 타입](#environment-variable-types)
    - [환경 설정 값 가져오기](#retrieving-environment-configuration)
    - [현재 환경 결정하기](#determining-the-current-environment)
    - [환경 파일 암호화](#encrypting-environment-files)
- [설정 값 접근하기](#accessing-configuration-values)
- [설정 캐싱](#configuration-caching)
- [디버그 모드](#debug-mode)
- [점검 모드(메인테넌스 모드)](#maintenance-mode)

<a name="introduction"></a>
## 소개

라라벨 프레임워크의 모든 설정 파일은 `config` 디렉터리에 저장되어 있습니다. 각 옵션에는 설명이 달려 있으니, 파일들을 살펴보면서 어떤 설정 값들이 있는지 익숙해지시길 권장합니다.

이 설정 파일들은 데이터베이스 연결 정보, 메일 서버 정보와 같은 주요 환경 구성 값뿐만 아니라, 애플리케이션의 기본 타임존이나 암호화 키 등 다양한 핵심 설정 값들을 구성할 수 있도록 해줍니다.

<a name="application-overview"></a>
#### 애플리케이션 개요

빠르게 확인하실 필요가 있다면, `about` 아티즌 명령어를 통해 애플리케이션의 환경, 드라이버, 설정 등의 정보를 한눈에 확인할 수 있습니다.

```shell
php artisan about
```

애플리케이션 개요 출력 중 특정 섹션만 보고 싶다면, `--only` 옵션을 사용해 해당 부분만 필터링할 수 있습니다.

```shell
php artisan about --only=environment
```

또한, 특정 설정 파일의 상세 내용을 확인하고 싶다면 `config:show` 아티즌 명령어를 사용하실 수 있습니다.

```shell
php artisan config:show database
```

<a name="environment-configuration"></a>
## 환경 설정

애플리케이션이 실행되는 환경에 따라 서로 다른 설정 값을 사용하는 것이 유용할 때가 많습니다. 예를 들어, 로컬에서는 캐시 드라이버를 다르게 하거나, 운영 서버에서는 또 다른 값을 주고 싶을 수 있습니다.

이러한 작업을 쉽게 해주기 위해 라라벨은 [DotEnv](https://github.com/vlucas/phpdotenv) PHP 라이브러리를 사용합니다. 새로운 라라벨 프로젝트를 설치하면, 애플리케이션의 루트 디렉터리에 `.env.example` 파일이 생성되며, 여기에는 자주 쓰는 환경 변수들이 정의되어 있습니다. 라라벨 설치 과정에서 이 파일이 `.env`로 자동 복사됩니다.

라라벨의 기본 `.env` 파일에는 로컬 개발 환경과 운영 서버 환경에서 서로 달라질 수 있는 일반적인 설정 값들이 담겨 있습니다. 이 값들은 라라벨의 여러 설정 파일에서 `env` 함수를 통해 불러오게 됩니다.

여러분이 팀 개발을 하고 있다면, `.env.example` 파일을 계속 소스 코드에 포함해두는 것이 좋습니다. 예시 파일에 플레이스홀더 값들을 미리 넣어두면, 동료 개발자들도 어떤 환경 변수가 필요한지 쉽게 파악할 수 있습니다.

> [!NOTE]
> `.env` 파일에 정의한 변수들은 서버 환경 변수나 시스템 환경 변수 등 외부 환경 변수로 언제든지 덮어쓸 수 있습니다.

<a name="environment-file-security"></a>
#### 환경 파일 보안

`.env` 파일은 각 개발자나 서버 별로 환경 설정이 다를 수 있으므로 소스 저장소에 커밋하면 안 됩니다. 또한, 만약 소스 저장소가 침해당하면 민감한 인증 정보가 유출될 위험도 있습니다.

하지만, 라라벨의 [환경 파일 암호화](#encrypting-environment-files) 기능을 사용하면 환경 파일을 암호화하여 안전하게 소스 저장소에 보관할 수도 있습니다.

<a name="additional-environment-files"></a>
#### 추가 환경 파일

라라벨이 애플리케이션의 환경 변수를 로드하기 전에, `APP_ENV` 환경 변수가 외부에서 지정되어 있거나, 또는 명령줄의 `--env` 인자가 제공되어 있는지 확인합니다. 해당하는 경우, 라라벨은 `.env.[APP_ENV]` 파일이 존재하면 그것을 먼저 로드합니다. 해당 파일이 없다면 기본 `.env` 파일을 사용합니다.

<a name="environment-variable-types"></a>
### 환경 변수 타입

`.env` 파일에 있는 모든 변수는 기본적으로 문자열로 처리됩니다. 하지만 `env()` 함수에서 더욱 다양한 타입의 값을 사용할 수 있도록 다음과 같이 예약된 값들이 있습니다.

| `.env` 값    | `env()` 반환값    |
|--------------|------------------|
| true         | (bool) true      |
| (true)       | (bool) true      |
| false        | (bool) false     |
| (false)      | (bool) false     |
| empty        | (string) ''      |
| (empty)      | (string) ''      |
| null         | (null) null      |
| (null)       | (null) null      |

값에 공백이 포함돼야 한다면 큰따옴표로 감싸서 정의할 수 있습니다.

```ini
APP_NAME="My Application"
```

<a name="retrieving-environment-configuration"></a>
### 환경 설정 값 가져오기

`.env` 파일에 정의된 변수들은 애플리케이션이 요청을 받으면 `$_ENV` PHP 전역 변수로 모두 불러와집니다. 하지만, 설정 파일 안에서는 주로 `env` 함수를 사용해 해당 변수 값을 가져옵니다. 실제로 라라벨의 설정 파일을 살펴보면 이 함수가 널리 사용되고 있음을 알 수 있습니다.

```
'debug' => env('APP_DEBUG', false),
```

`env` 함수에 두 번째 인수를 넘기면 "기본 값"이 됩니다. 즉, 해당 환경 변수 값이 존재하지 않을 때 이 기본 값이 반환됩니다.

<a name="determining-the-current-environment"></a>
### 현재 환경 결정하기

애플리케이션의 현재 환경은 `.env` 파일에 적힌 `APP_ENV` 변수로 결정됩니다. 이 값은 `App` [파사드](/docs/10.x/facades)의 `environment` 메서드를 통해 확인할 수 있습니다.

```
use Illuminate\Support\Facades\App;

$environment = App::environment();
```

또한, `environment` 메서드에 인수를 넘기면, 환경 값이 주어진 값과 일치하는지 확인할 수 있습니다. 하나라도 일치하면 `true`를 반환합니다.

```
if (App::environment('local')) {
    // 현재 환경이 local임
}

if (App::environment(['local', 'staging'])) {
    // 현재 환경이 local 또는 staging임...
}
```

> [!NOTE]
> 서버 환경 변수로 `APP_ENV`를 지정하면, 현재 환경 감지는 그 값으로 덮어써집니다.

<a name="encrypting-environment-files"></a>
### 환경 파일 암호화

암호화되지 않은 환경 파일은 소스 저장소에 절대 보관해서는 안 됩니다. 하지만, 라라벨에서는 환경 파일을 암호화하여 애플리케이션 소스와 함께 안전하게 저장할 수 있습니다.

<a name="encryption"></a>
#### 암호화

환경 파일을 암호화하려면, `env:encrypt` 명령어를 사용합니다.

```shell
php artisan env:encrypt
```

`env:encrypt` 명령어를 실행하면 `.env` 파일이 암호화되어 `.env.encrypted` 파일에 저장됩니다. 암호화 키는 명령어 실행 결과에 출력되며, 반드시 안전한 비밀번호 관리자 등에 잘 보관해야 합니다. 만약 직접 키를 지정하고 싶다면 `--key` 옵션을 사용할 수 있습니다.

```shell
php artisan env:encrypt --key=3UVsEgGVK36XN82KKeyLFMhvosbZN1aF
```

> [!NOTE]
> 사용하려는 암호화 키의 길이는 사용하는 암호화 cipher가 요구하는 길이와 일치해야 합니다. 라라벨은 기본적으로 `AES-256-CBC` cipher를 사용하며, 32자의 키를 필요로 합니다. `--cipher` 옵션을 통해 라라벨의 [encrypter](/docs/10.x/encryption)가 지원하는 다른 cipher도 사용할 수 있습니다.

애플리케이션에 여러 환경 파일(예: `.env`, `.env.staging`)이 있다면, `--env` 옵션을 이용해 암호화할 환경 파일을 지정할 수 있습니다.

```shell
php artisan env:encrypt --env=staging
```

<a name="decryption"></a>
#### 복호화

암호화된 환경 파일을 복호화하려면, `env:decrypt` 명령어를 사용하세요. 이 명령어에는 복호화 키가 필요하며, 라라벨은 이를 `LARAVEL_ENV_ENCRYPTION_KEY` 환경 변수에서 찾습니다.

```shell
php artisan env:decrypt
```

또는, `--key` 옵션을 이용해 직접 키를 명령어에 전달할 수도 있습니다.

```shell
php artisan env:decrypt --key=3UVsEgGVK36XN82KKeyLFMhvosbZN1aF
```

`env:decrypt` 명령어가 실행되면, `.env.encrypted` 파일이 복호화되어 그 결과가 `.env` 파일에 저장됩니다.

커스텀 암호화 cipher를 사용하려면 `--cipher` 옵션을 추가할 수 있습니다.

```shell
php artisan env:decrypt --key=qUWuNRdfuImXcKxZ --cipher=AES-128-CBC
```

여러 환경 파일이 있을 때는, `--env` 옵션을 통해 복호화할 파일을 지정하세요.

```shell
php artisan env:decrypt --env=staging
```

기존 환경 파일을 덮어쓰려면, `--force` 옵션을 추가하면 됩니다.

```shell
php artisan env:decrypt --force
```

<a name="accessing-configuration-values"></a>
## 설정 값 접근하기

애플리케이션 어디에서나 `Config` 파사드나 전역 함수인 `config`를 이용해 손쉽게 설정 값을 가져올 수 있습니다. 설정 값은 "점 표기법(dot syntax)"을 사용하여, 파일 이름과 옵션 이름을 함께 지정합니다. 옵션이 존재하지 않을 때 사용할 기본 값도 설정할 수 있습니다.

```
use Illuminate\Support\Facades\Config;

$value = Config::get('app.timezone');

$value = config('app.timezone');

// 설정 값이 없을 때 기본 값 사용 가능...
$value = config('app.timezone', 'Asia/Seoul');
```

실행 중에 설정 값을 변경하려면, `Config` 파사드의 `set` 메서드를 호출하거나, `config` 함수에 배열을 전달하면 됩니다.

```
Config::set('app.timezone', 'America/Chicago');

config(['app.timezone' => 'America/Chicago']);
```

<a name="configuration-caching"></a>
## 설정 캐싱

애플리케이션의 성능을 높이기 위해, 모든 설정 파일을 하나의 파일로 캐싱할 수 있습니다. 이를 위해 `config:cache` 아티즌 명령어를 사용합니다. 이 명령어를 실행하면 모든 설정 옵션이 하나의 파일로 합쳐지며, 프레임워크가 빠르게 로드할 수 있습니다.

이 명령어는 운영 환경(프로덕션) 배포 과정에서 실행하는 것이 일반적입니다. 개발 단계(로컬)에서는 설정 값이 자주 바뀌므로, 이 명령어를 실행하지 않는 것이 좋습니다.

설정이 캐싱되면, 애플리케이션 요청이나 아티즌 명령어 실행 시 `.env` 파일이 더 이상 불러와지지 않습니다. 따라서 `env` 함수는 외부(시스템 레벨)의 환경 변수만 반환합니다.

이런 이유로, 반드시 **애플리케이션의 설정 파일(`config` 디렉터리 내부)에서만** `env` 함수를 호출해야 합니다. 라라벨 기본 설정 파일들을 보면 이런 방식을 따르고 있음을 확인할 수 있습니다. 설정 값은 언제든 위에서 설명한 `config` 함수를 통해 접근할 수 있습니다.

설정 캐시를 삭제하려면 `config:clear` 명령어를 사용해 캐시를 비울 수 있습니다.

```shell
php artisan config:clear
```

> [!NOTE]
> 배포 과정에서 `config:cache` 명령어를 실행했다면, 항상 **설정 파일 안에서만** `env` 함수를 사용하고 있다는 점을 꼭 확인하세요. 일단 설정이 캐싱되면 `.env` 파일은 더 이상 로드되지 않으니, `env` 함수는 시스템 레벨 환경 변수만 반환하게 됩니다.

<a name="debug-mode"></a>
## 디버그 모드

`config/app.php` 설정 파일의 `debug` 옵션은 에러 발생 시 사용자에게 얼마나 많은 정보가 표시될지 결정합니다. 기본적으로 이 옵션은 `.env` 파일의 `APP_DEBUG` 환경 변수 값을 따라갑니다.

> [!NOTE]
> 로컬 개발 환경에서는 `APP_DEBUG` 값을 `true`로 두는 것이 좋습니다. **운영 환경(프로덕션)에서는 반드시 `false`로 설정해야 합니다. 운영 환경에서 이 값이 `true`로 되어 있으면, 민감한 설정 정보가 사용자에게 노출될 위험이 있습니다.**

<a name="maintenance-mode"></a>
## 점검 모드(메인테넌스 모드)

애플리케이션이 점검 모드에 들어가면, 모든 요청에 대해 커스텀 뷰가 표시됩니다. 이를 통해 애플리케이션의 업데이트나 유지보수 중에 접근을 일시적으로 "막는" 것이 가능합니다. 점검 모드 체크는 애플리케이션의 기본 미들웨어 스택에 포함되어 있습니다. 점검 모드일 경우, `Symfony\Component\HttpKernel\Exception\HttpException` 인스턴스가 503 상태 코드로 던져집니다.

점검 모드를 활성화하려면, `down` 아티즌 명령어를 실행하세요.

```shell
php artisan down
```

모든 점검 모드 응답에 `Refresh` HTTP 헤더를 함께 보내고 싶다면, `down` 명령어에 `refresh` 옵션을 추가하면 됩니다. 이 헤더는 브라우저가 지정된 초(second) 만큼 대기한 뒤 자동으로 페이지를 새로고침 하도록 안내합니다.

```shell
php artisan down --refresh=15
```

`retry` 옵션을 사용하면, `Retry-After` HTTP 헤더 값을 정할 수 있습니다. 다만, 브라우저들은 이 헤더를 거의 무시합니다.

```shell
php artisan down --retry=60
```

<a name="bypassing-maintenance-mode"></a>
#### 점검 모드 우회

점검 모드를 비밀 토큰으로 우회할 수 있도록 하려면, `secret` 옵션을 사용해 우회 토큰을 지정할 수 있습니다.

```shell
php artisan down --secret="1630542a-246b-4b66-afa1-dd72a4c43515"
```

애플리케이션을 점검 모드로 전환한 후, 이 토큰과 일치하는 URL로 접속하면 라라벨이 브라우저에 점검 모드 우회 쿠키를 발급하게 됩니다.

```shell
https://example.com/1630542a-246b-4b66-afa1-dd72a4c43515
```

비밀 토큰을 라라벨이 자동으로 생성해주길 원하면, `with-secret` 옵션을 사용하세요. 애플리케이션이 점검 모드에 들어가면 비밀 토큰이 콘솔에 표시됩니다.

```shell
php artisan down --with-secret
```

이 숨겨진 라우트에 접근하면 이후 `/` 경로로 자동 리다이렉트됩니다. 쿠키가 발급된 브라우저는 점검 모드임에도 평소처럼 애플리케이션 이용이 가능합니다.

> [!NOTE]
> 점검 모드 비밀 토큰은 영문자, 숫자, 그리고 선택적으로 대시(-) 등만 사용하는 것이 일반적입니다. URL 내 특수 의미를 가지는 `?`, `&` 등의 문자는 가급적 피해야 합니다.

<a name="pre-rendering-the-maintenance-mode-view"></a>
#### 점검 모드 화면 미리 렌더링

배포 과정에서 `php artisan down` 명령어를 사용할 경우, 사용자들이 의도치 않게 에러 화면을 볼 수 있습니다. 이는 라라벨 프레임워크의 상당 부분이 부팅되어야 점검 모드 여부를 감지하고, 뷰 엔진을 통해 점검 모드 화면을 렌더링하기 때문입니다.

이런 현상을 방지하기 위해, 라라벨은 점검 모드 화면을 요청 루프의 가장 초기에 "미리 렌더"해서 반환하는 기능을 지원합니다. 원하는 템플릿을 `down` 명령어의 `render` 옵션으로 지정하여 미리 렌더할 수 있습니다.

```shell
php artisan down --render="errors::503"
```

<a name="redirecting-maintenance-mode-requests"></a>
#### 점검 모드에서 요청 리다이렉트

점검 모드 동안에는, 사용자가 접속하는 모든 애플리케이션 URL에 점검 모드 화면이 표시됩니다. 하지만 모든 요청을 특정 URL로 리다이렉트할 수도 있습니다. 이를 위해 `redirect` 옵션을 사용할 수 있습니다. 예를 들어, 모든 요청을 `/` 경로로 보낼 수 있습니다.

```shell
php artisan down --redirect=/
```

<a name="disabling-maintenance-mode"></a>
#### 점검 모드 해제

점검 모드를 해제하려면, `up` 명령어를 실행하세요.

```shell
php artisan up
```

> [!NOTE]
> 기본 점검 모드 템플릿은 `resources/views/errors/503.blade.php`에 직접 정의하여 원하는 대로 커스터마이징할 수 있습니다.

<a name="maintenance-mode-queues"></a>
#### 점검 모드와 큐

애플리케이션이 점검 모드인 동안에는 [큐에 등록된 작업들](/docs/10.x/queues)이 처리되지 않습니다. 점검 모드가 해제되면, 대기 중이던 작업들이 정상적으로 처리되기 시작합니다.

<a name="alternatives-to-maintenance-mode"></a>
#### 점검 모드의 대안

점검 모드는 몇 초 동안이라도 애플리케이션의 다운타임(접속 불가 시간)을 반드시 수반합니다. 그렇기 때문에 라라벨로 무중단 배포(zero-downtime deployment)를 구현하고 싶다면 [Laravel Vapor](https://vapor.laravel.com)나 [Envoyer](https://envoyer.io) 같은 대안을 고려해 보시길 추천합니다.
