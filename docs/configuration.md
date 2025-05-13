# 설정 (Configuration)

- [소개](#introduction)
- [환경 설정](#environment-configuration)
    - [환경 변수의 타입](#environment-variable-types)
    - [환경 설정 값 가져오기](#retrieving-environment-configuration)
    - [현재 환경 판별하기](#determining-the-current-environment)
    - [환경 파일 암호화](#encrypting-environment-files)
- [설정 값 접근](#accessing-configuration-values)
- [설정 캐싱](#configuration-caching)
- [설정 파일 퍼블리싱](#configuration-publishing)
- [디버그 모드](#debug-mode)
- [점검(유지보수) 모드](#maintenance-mode)

<a name="introduction"></a>
## 소개

라라벨 프레임워크의 모든 설정 파일은 `config` 디렉터리에 보관되어 있습니다. 각 옵션에는 설명이 함께 작성되어 있으니, 파일을 열어 사용 가능한 옵션들을 자유롭게 살펴보시기 바랍니다.

이 설정 파일들을 이용하여 데이터베이스 연결 정보, 메일 서버 정보는 물론, 애플리케이션의 URL이나 암호화 키 등 다양한 핵심 설정 값을 지정할 수 있습니다.

<a name="the-about-command"></a>
#### `about` 명령어

라라벨은 `about` Artisan 명령어를 통해 애플리케이션의 전반적인 설정, 드라이버, 환경 정보를 요약해서 보여줄 수 있습니다.

```shell
php artisan about
```

애플리케이션 요약 정보 중에서 특정 섹션만 보고 싶다면, `--only` 옵션으로 필터링할 수 있습니다.

```shell
php artisan about --only=environment
```

또한, 특정 설정 파일의 값을 자세히 확인하고 싶을 때는 `config:show` Artisan 명령어를 사용하면 됩니다.

```shell
php artisan config:show database
```

<a name="environment-configuration"></a>
## 환경 설정

애플리케이션이 실행되는 환경에 따라 서로 다른 설정 값을 사용하는 것이 유용한 경우가 많습니다. 예를 들어, 로컬에서는 프로덕션 서버에서 사용하는 것과 다른 캐시 드라이버를 지정할 수도 있습니다.

라라벨에서는 이런 환경 기반 설정을 쉽게 관리할 수 있도록 [DotEnv](https://github.com/vlucas/phpdotenv) PHP 라이브러리를 사용합니다. 라라벨을 새로 설치하면, 애플리케이션의 루트 디렉터리에 `.env.example` 파일이 생성되는데, 이 파일에는 자주 사용되는 여러 환경 변수들이 정의되어 있습니다. 라라벨 설치 과정에서 이 파일이 자동으로 `.env` 파일로 복사됩니다.

라라벨의 기본 `.env` 파일에는 애플리케이션이 로컬 환경에서 실행 중인지, 프로덕션 웹 서버에서 동작 중인지에 따라 값이 달라질 수 있는 주요 설정 항목 일부가 포함되어 있습니다. 이 값들은 라라벨의 `env` 함수를 이용해 `config` 디렉터리 내의 설정 파일에서 읽어들입니다.

여러 명이 팀으로 개발하는 경우, `.env.example` 파일을 포함하고 적절히 갱신하는 것을 권장합니다. 예시 설정 파일에 플레이스홀더 값을 추가해두면, 팀원들이 애플리케이션을 실행하는 데 필요한 환경 변수를 쉽게 파악할 수 있습니다.

> [!NOTE]
> `.env` 파일에 정의된 모든 변수는 서버나 시스템 환경 변수 등 외부 환경 변수로 덮어쓸 수 있습니다.

<a name="environment-file-security"></a>
#### 환경 파일 보안

`.env` 파일은 프로젝트의 소스 컨트롤(버전 관리)에 커밋하면 안 됩니다. 각각의 개발자나 서버 별로 서로 다른 환경 설정이 필요할 수도 있고, 만약 소스 컨트롤 저장소에 접근하는 침입자가 발생할 경우 중요한 정보(자격 증명 등)가 노출되는 위험이 있기 때문입니다.

하지만, 라라벨의 내장 [환경 파일 암호화](#encrypting-environment-files) 기능을 통해 환경 파일을 암호화하면 소스 컨트롤에 안전하게 저장할 수 있습니다.

<a name="additional-environment-files"></a>
#### 추가 환경 파일

애플리케이션의 환경 변수를 불러오기 전에, 라라벨은 `APP_ENV` 환경 변수가 외부에서 제공됐는지 또는 `--env` CLI 인자가 지정됐는지를 우선 확인합니다. 해당하는 경우, 라라벨은 존재한다면 `.env.[APP_ENV]` 파일을 먼저 불러옵니다. 만약 파일이 없다면 기본 `.env` 파일이 사용됩니다.

<a name="environment-variable-types"></a>
### 환경 변수의 타입

`.env` 파일 내의 모든 변수 값은 보통 문자열로 해석됩니다. 하지만, `env()` 함수를 통해 더 다양한 타입의 값을 반환할 수 있도록 특별한 예약어 값이 있습니다.

<div class="overflow-auto">

| `.env` 값     | `env()` 반환 값   |
| ------------- | ---------------- |
| true          | (bool) true      |
| (true)        | (bool) true      |
| false         | (bool) false     |
| (false)       | (bool) false     |
| empty         | (string) ''      |
| (empty)       | (string) ''      |
| null          | (null) null      |
| (null)        | (null) null      |

</div>

값에 공백이 포함돼야 하는 경우, 큰따옴표로 감싸서 지정할 수 있습니다.

```ini
APP_NAME="My Application"
```

<a name="retrieving-environment-configuration"></a>
### 환경 설정 값 가져오기

`.env` 파일에 명시된 모든 변수는 애플리케이션이 요청을 받을 때 PHP의 `$_ENV` 슈퍼글로벌에 자동으로 로드됩니다. 하지만, 설정 파일에서는 `env` 함수를 통해 이러한 값들을 가져오는 것이 일반적입니다. 실제로 라라벨의 설정 파일을 살펴보면 많은 옵션들이 이미 이 함수를 사용하고 있습니다.

```php
'debug' => env('APP_DEBUG', false),
```

`env` 함수의 두 번째 인자는 "기본값"입니다. 해당 키에 대한 환경 변수가 없을 경우 대신 반환됩니다.

<a name="determining-the-current-environment"></a>
### 현재 환경 판별하기

현재 애플리케이션 환경은 `.env` 파일의 `APP_ENV` 변수로 결정됩니다. 이 값은 `App` [파사드](/docs/facades)의 `environment` 메서드를 통해 가져올 수 있습니다.

```php
use Illuminate\Support\Facades\App;

$environment = App::environment();
```

또한, `environment` 메서드에 인수를 전달하여 환경이 특정 값과 일치하는지도 판별할 수 있습니다. 환경이 지정한 값 중 하나와 일치하면 `true`를 반환합니다.

```php
if (App::environment('local')) {
    // 현재 환경이 local인 경우
}

if (App::environment(['local', 'staging'])) {
    // 환경이 local이거나 staging인 경우...
}
```

> [!NOTE]
> 현재 애플리케이션 환경 판별은 서버 레벨의 `APP_ENV` 환경 변수로 덮어쓸 수 있습니다.

<a name="encrypting-environment-files"></a>
### 환경 파일 암호화

암호화되지 않은 환경 파일은 소스 컨트롤에 절대 저장하면 안 됩니다. 그러나, 라라벨에서는 환경 파일을 암호화하여 애플리케이션과 함께 소스 컨트롤에 안전하게 추가할 수 있습니다.

<a name="encryption"></a>
#### 암호화

환경 파일을 암호화하려면 `env:encrypt` 명령어를 사용합니다.

```shell
php artisan env:encrypt
```

`env:encrypt` 명령어를 실행하면 `.env` 파일이 암호화되어 `.env.encrypted` 파일로 생성됩니다. 암호화에 사용된 키는 명령어의 출력에 표시되며, 반드시 안전한 비밀번호 관리 도구에 보관해야 합니다. 직접 암호화 키를 지정하고 싶다면, 명령어 실행 시 `--key` 옵션을 사용할 수 있습니다.

```shell
php artisan env:encrypt --key=3UVsEgGVK36XN82KKeyLFMhvosbZN1aF
```

> [!NOTE]
> 입력하는 키의 길이는 사용 중인 암호화 알고리즘이 요구하는 길이와 일치해야 합니다. 기본적으로 라라벨은 `AES-256-CBC` 알고리즘을 사용하며, 32자의 키가 필요합니다. 필요하면 `--cipher` 옵션을 추가하여 라라벨 [암호화기](/docs/encryption)가 지원하는 임의의 암호 기법을 사용할 수 있습니다.

애플리케이션에 `.env`와 `.env.staging` 처럼 여러 환경 파일이 있다면, `--env` 옵션으로 암호화 대상 환경 파일을 지정할 수 있습니다.

```shell
php artisan env:encrypt --env=staging
```

<a name="decryption"></a>
#### 복호화

환경 파일을 복호화하려면 `env:decrypt` 명령어를 사용하세요. 이 명령어는 복호화 키가 필요하며, 라라벨은 `LARAVEL_ENV_ENCRYPTION_KEY` 환경 변수에서 해당 키를 찾습니다.

```shell
php artisan env:decrypt
```

또는, `--key` 옵션을 통해 복호화 키를 직접 명령어에 지정할 수도 있습니다.

```shell
php artisan env:decrypt --key=3UVsEgGVK36XN82KKeyLFMhvosbZN1aF
```

`env:decrypt` 명령어가 실행되면, `.env.encrypted` 파일의 내용이 복호화되어 `.env` 파일로 저장됩니다.

`--cipher` 옵션을 사용하면, 커스텀 암호화 알고리즘을 이용해 복호화할 수 있습니다.

```shell
php artisan env:decrypt --key=qUWuNRdfuImXcKxZ --cipher=AES-128-CBC
```

애플리케이션에 여러 환경 파일이 있는 경우, `--env` 옵션을 이용해 특정 환경 파일만 복호화할 수 있습니다.

```shell
php artisan env:decrypt --env=staging
```

기존 환경 파일을 덮어쓰려면, `env:decrypt` 명령어에 `--force` 옵션을 추가하면 됩니다.

```shell
php artisan env:decrypt --force
```

<a name="accessing-configuration-values"></a>
## 설정 값 접근

애플리케이션 어디에서든 `Config` 파사드나 전역 `config` 함수를 사용해 설정 값을 쉽게 확인할 수 있습니다. 설정 값은 "점 표기법(dot syntax)"으로 접근할 수 있는데, 여기에는 파일명과 설정 항목 이름을 함께 사용합니다. 또한, 기본값을 지정해 둘 수도 있습니다. 해당 설정 값이 없을 경우 이 기본값이 반환됩니다.

```php
use Illuminate\Support\Facades\Config;

$value = Config::get('app.timezone');

$value = config('app.timezone');

// 만약 설정 값이 존재하지 않는 경우, 기본값을 반환합니다...
$value = config('app.timezone', 'Asia/Seoul');
```

런타임에 설정 값을 지정하려면, `Config` 파사드의 `set` 메서드를 호출하거나 `config` 함수에 배열을 전달할 수 있습니다.

```php
Config::set('app.timezone', 'America/Chicago');

config(['app.timezone' => 'America/Chicago']);
```

정적 분석(static analysis)을 지원하기 위해, `Config` 파사드는 타입이 명확한 설정 값 조회 메서드도 제공합니다. 만약 조회한 값의 타입이 기대한 타입과 다르면, 예외가 발생합니다.

```php
Config::string('config-key');
Config::integer('config-key');
Config::float('config-key');
Config::boolean('config-key');
Config::array('config-key');
```

<a name="configuration-caching"></a>
## 설정 캐싱

애플리케이션의 성능을 높이려면 `config:cache` Artisan 명령어를 사용해 모든 설정 파일을 하나의 파일로 캐싱하는 것이 좋습니다. 이 명령어는 애플리케이션 전체에 필요한 모든 설정 값을 하나로 합쳐, 프레임워크가 빠르게 로드할 수 있게 해줍니다.

보통 프로덕션 서버에 배포할 때는 `php artisan config:cache` 명령어를 실행하는 것이 좋습니다. 단, 로컬 개발 환경에서는 애플리케이션 개발 중에 설정 값이 자주 바뀌기 때문에 이 명령어를 실행하면 안 됩니다.

설정이 캐싱된 이후에는, 애플리케이션의 `.env` 파일은 프레임워크가 요청이나 Artisan 명령을 받을 때 더 이상 로드하지 않습니다. 따라서, `env` 함수는 시스템 수준의 외부 환경 변수만 반환하게 됩니다.

이런 이유 때문에, 반드시 `env` 함수는 애플리케이션의 설정 파일(`config` 디렉터리 내 파일)에서만 호출해야 합니다. 라라벨의 기본 설정 파일을 살펴보면 이러한 사용 사례를 쉽게 찾을 수 있습니다. 애플리케이션 내 어디서든 설정 값을 읽고 싶을 때는 앞서 설명한 `config` 함수를 사용하면 됩니다.

설정 캐시를 초기화하려면, `config:clear` 명령어를 사용할 수 있습니다.

```shell
php artisan config:clear
```

> [!WARNING]
> 배포 과정에서 `config:cache` 명령어를 실행했다면, 반드시 `env` 함수를 설정 파일 내에서만 사용하고 있는지 확인해야 합니다. 이렇게 하지 않으면, 캐싱 이후 `.env` 파일이 더 이상 로드되지 않아 `env` 함수가 외부(시스템 수준)의 환경 변수만 반환합니다.

<a name="configuration-publishing"></a>
## 설정 파일 퍼블리싱

라라벨의 대부분의 설정 파일은 이미 애플리케이션의 `config` 디렉터리에 존재하지만, `cors.php`·`view.php`와 같이 기본적으로 퍼블리싱되지 않은 설정 파일도 있습니다. 이는 대다수 애플리케이션에서 이러한 파일을 직접 수정할 필요가 없기 때문입니다.

하지만 필요하다면, `config:publish` Artisan 명령어를 활용하여 이러한 설정 파일들도 퍼블리싱할 수 있습니다.

```shell
php artisan config:publish

php artisan config:publish --all
```

<a name="debug-mode"></a>
## 디버그 모드

`config/app.php` 설정 파일의 `debug` 옵션을 통해 사용자에게 표시되는 에러 정보의 상세 수준을 제어할 수 있습니다. 이 옵션은 기본적으로 `.env` 파일의 `APP_DEBUG` 환경 변수의 값을 따릅니다.

> [!WARNING]
> 로컬 개발 환경에서는 `APP_DEBUG` 환경 변수를 `true`로 설정해야 합니다. **하지만 프로덕션 환경에서는 반드시 `false`로 설정해야 합니다. 프로덕션 환경에서 이 값이 `true`로 되어 있으면, 애플리케이션의 민감한 설정 값이 최종 사용자에게 노출될 위험이 있습니다.**

<a name="maintenance-mode"></a>
## 점검(유지보수) 모드

애플리케이션이 점검(유지보수) 모드일 때는, 들어오는 모든 요청에 대해 커스텀 뷰가 표시됩니다. 이를 이용하면 업데이트나 점검 작업 중에 애플리케이션을 쉽게 "일시 비활성화"할 수 있습니다. 점검 모드는 애플리케이션의 기본 미들웨어 스택에 포함되어 있습니다. 만약 애플리케이션이 점검(유지보수) 모드에 돌입하면, `Symfony\Component\HttpKernel\Exception\HttpException` 예외가 503 상태 코드와 함께 발생합니다.

점검 모드를 활성화하려면 다음과 같이 `down` Artisan 명령어를 실행하세요.

```shell
php artisan down
```

모든 점검 모드 응답에 `Refresh` HTTP 헤더를 포함하고 싶다면, `down` 명령어 실행 시 `refresh` 옵션을 지정할 수 있습니다. 이 헤더는 브라우저에게 지정한 초(seconds) 후 페이지를 자동으로 새로고침하도록 안내합니다.

```shell
php artisan down --refresh=15
```

또한, `down` 명령어에 `retry` 옵션을 추가하면 `Retry-After` HTTP 헤더 값을 설정할 수 있습니다. 다만, 대부분의 브라우저는 이 헤더를 무시합니다.

```shell
php artisan down --retry=60
```

<a name="bypassing-maintenance-mode"></a>
#### 점검 모드 우회

비밀 토큰을 이용해 점검 모드를 우회할 수 있도록 하려면, `secret` 옵션으로 점검 모드 우회 토큰을 지정할 수 있습니다.

```shell
php artisan down --secret="1630542a-246b-4b66-afa1-dd72a4c43515"
```

점검 모드 진입 후, 해당 토큰과 일치하는 URL로 접속하면 라라벨이 점검 모드 우회 쿠키를 브라우저로 발급합니다.

```shell
https://example.com/1630542a-246b-4b66-afa1-dd72a4c43515
```

비밀 토큰을 직접 생성하지 않고 라라벨이 자동으로 만들어주길 원한다면, `with-secret` 옵션을 사용하면 됩니다. 점검 모드가 활성화되면 비밀 토큰이 표시됩니다.

```shell
php artisan down --with-secret
```

이 비공개 경로로 접속하면, 애플리케이션의 `/` 경로로 리디렉션됩니다. 우회 쿠키가 브라우저에 발급되고 나면, 마치 점검 모드가 아닌 것처럼 애플리케이션을 정상적으로 이용할 수 있습니다.

> [!NOTE]
> 점검 모드의 비밀 토큰은 보통 영문자, 숫자, 하이픈(-)으로 구성하는 것이 좋습니다. URL에서 특별한 의미를 가지는 `?`, `&` 같은 문자는 가급적 사용하지 않아야 합니다.

<a name="maintenance-mode-on-multiple-servers"></a>
#### 여러 서버에서의 점검 모드

기본적으로 라라벨은 파일 기반 방식으로 점검(유지보수) 모드 여부를 판단합니다. 즉, 점검 모드를 활성화할 때마다, 애플리케이션을 호스팅하는 각 서버에서 `php artisan down` 명령어를 실행해야 합니다.

대신, 라라벨은 캐시 기반의 점검 모드 방식을 제공합니다. 이 방법을 사용하면 한 대의 서버에서만 `php artisan down` 명령어를 실행해도 모든 서버에 점검 모드를 적용할 수 있습니다. 이를 위해서는 애플리케이션의 `.env` 파일 내 점검 모드 관련 변수를 수정해야 합니다. 모든 서버가 접근할 수 있는 캐시 `store`를 지정하면, 점검 모드 상태가 서버 전체에 일관되게 적용됩니다.

```ini
APP_MAINTENANCE_DRIVER=cache
APP_MAINTENANCE_STORE=database
```

<a name="pre-rendering-the-maintenance-mode-view"></a>
#### 점검 모드 뷰 미리 렌더링

배포 과정에서 `php artisan down` 명령어를 사용하는 경우, 사용자가 애플리케이션에 접근하는 시점에 Composer 의존성이나 인프라 구성요소가 업데이트 중이라면 간혹 에러를 마주칠 수 있습니다. 라라벨이 점검 모드 여부를 판별하고 점검 모드 뷰를 렌더링하려면 프레임워크의 많은 부분이 부팅되기 때문입니다.

이를 예방하기 위해, 라라벨은 점검 모드 진입 시점에 미리 뷰를 렌더링해 둘 수 있도록 지원합니다. 이렇게 하면, 의존성이 로드되기 이전 요청의 가장 초기에 바로 뷰가 반환됩니다. `down` 명령어의 `render` 옵션으로 원하는 템플릿을 미리 렌더링할 수 있습니다.

```shell
php artisan down --render="errors::503"
```

<a name="redirecting-maintenance-mode-requests"></a>
#### 점검 모드 요청 리다이렉트

점검 모드에서는 사용자가 접속하려는 모든 URL에서 점검 모드 뷰가 노출되지만, 필요하다면 모든 요청을 특정 URL로 리다이렉트할 수도 있습니다. `redirect` 옵션을 이용해 지정하면 됩니다. 예를 들어, 모든 요청을 `/`로 리다이렉트하고 싶다면 다음과 같이 할 수 있습니다.

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
> 기본 점검 모드 템플릿을 커스터마이즈하고 싶을 때는, `resources/views/errors/503.blade.php` 경로에 직접 템플릿 파일을 만들어 두면 됩니다.

<a name="maintenance-mode-queues"></a>
#### 점검 모드와 큐 작업

애플리케이션이 점검 모드에 진입해 있는 동안에는 [큐 작업](/docs/queues)이 처리되지 않습니다. 점검 모드가 해제되면 큐 작업이 정상적으로 재개됩니다.

<a name="alternatives-to-maintenance-mode"></a>
#### 점검 모드의 대안

점검 모드를 사용하면 애플리케이션이 수 초 동안 동작을 멈추는 다운타임이 불가피하므로, 만약 무중단(Zero-downtime) 배포를 원한다면 [Laravel Cloud](https://cloud.laravel.com)와 같은 완전 관리형 플랫폼을 이용하는 것도 추천할 만합니다.
