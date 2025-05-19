# 디렉터리 구조 (Directory Structure)

- [소개](#introduction)
- [루트 디렉터리](#the-root-directory)
    - [`app` 디렉터리](#the-root-app-directory)
    - [`bootstrap` 디렉터리](#the-bootstrap-directory)
    - [`config` 디렉터리](#the-config-directory)
    - [`database` 디렉터리](#the-database-directory)
    - [`public` 디렉터리](#the-public-directory)
    - [`resources` 디렉터리](#the-resources-directory)
    - [`routes` 디렉터리](#the-routes-directory)
    - [`storage` 디렉터리](#the-storage-directory)
    - [`tests` 디렉터리](#the-tests-directory)
    - [`vendor` 디렉터리](#the-vendor-directory)
- [`app` 디렉터리](#the-app-directory)
    - [`Broadcasting` 디렉터리](#the-broadcasting-directory)
    - [`Console` 디렉터리](#the-console-directory)
    - [`Events` 디렉터리](#the-events-directory)
    - [`Exceptions` 디렉터리](#the-exceptions-directory)
    - [`Http` 디렉터리](#the-http-directory)
    - [`Jobs` 디렉터리](#the-jobs-directory)
    - [`Listeners` 디렉터리](#the-listeners-directory)
    - [`Mail` 디렉터리](#the-mail-directory)
    - [`Models` 디렉터리](#the-models-directory)
    - [`Notifications` 디렉터리](#the-notifications-directory)
    - [`Policies` 디렉터리](#the-policies-directory)
    - [`Providers` 디렉터리](#the-providers-directory)
    - [`Rules` 디렉터리](#the-rules-directory)

<a name="introduction"></a>
## 소개

라라벨의 기본 애플리케이션 구조는 대규모 또는 소규모 애플리케이션 모두에 이상적인 출발점을 제공하도록 설계되어 있습니다. 하지만 원하는 대로 자유롭게 애플리케이션 구조를 변경하셔도 됩니다. 라라벨은 특정 클래스를 어디에 배치해야 한다는 강제성을 거의 두지 않으므로, Composer가 해당 클래스를 자동 로드할 수 있기만 하면 됩니다.

<a name="the-root-directory"></a>
## 루트 디렉터리

<a name="the-root-app-directory"></a>
### app 디렉터리

`app` 디렉터리에는 애플리케이션의 핵심 코드가 들어 있습니다. 이 디렉터리에 대해서는 곧 더 자세히 살펴보겠습니다. 하지만 대부분의 클래스는 이 디렉터리에 위치하게 됩니다.

<a name="the-bootstrap-directory"></a>
### bootstrap 디렉터리

`bootstrap` 디렉터리에는 프레임워크를 부트스트랩하는 `app.php` 파일이 들어 있습니다. 이 디렉터리에는 또한 성능 최적화를 위해 프레임워크가 생성한 파일들(예: 라우트 및 서비스 캐시 파일 등)을 저장하는 `cache` 디렉터리도 포함되어 있습니다.

<a name="the-config-directory"></a>
### config 디렉터리

`config` 디렉터리는 이름에서 알 수 있듯이 애플리케이션의 모든 설정 파일을 보관합니다. 이 파일들을 모두 읽어보고 어떤 옵션들이 제공되는지 익혀 두는 것이 좋습니다.

<a name="the-database-directory"></a>
### database 디렉터리

`database` 디렉터리에는 데이터베이스 마이그레이션, 모델 팩토리, 시드(seed) 파일이 들어 있습니다. 필요하다면 이 디렉터리에 SQLite 데이터베이스 파일을 저장할 수도 있습니다.

<a name="the-public-directory"></a>
### public 디렉터리

`public` 디렉터리에는 모든 요청이 진입하는 진입점인 `index.php` 파일이 포함되어 있으며, 오토로딩도 여기에서 설정됩니다. 또한, 이 디렉터리에는 이미지, JavaScript, CSS와 같은 애셋 파일도 보관됩니다.

<a name="the-resources-directory"></a>
### resources 디렉터리

`resources` 디렉터리에는 [뷰](/docs/12.x/views)는 물론, 컴파일되지 않은 원본 CSS, JavaScript 등 각종 자원이 들어 있습니다.

<a name="the-routes-directory"></a>
### routes 디렉터리

`routes` 디렉터리에는 애플리케이션의 모든 라우트 정의 파일이 들어 있습니다. 기본적으로 라라벨에는 `web.php`와 `console.php`, 두 개의 라우트 파일이 포함되어 있습니다.

`web.php` 파일에는 라라벨의 `web` 미들웨어 그룹에 포함되는 라우트들이 정의되며, 이 그룹은 세션 상태, CSRF 보호, 쿠키 암호화 기능을 제공합니다. 만약 애플리케이션이 상태 비저장(stateless) RESTful API를 제공하지 않는 경우, 대부분의 라우트는 이 `web.php` 파일에 정의하게 됩니다.

`console.php` 파일에서는 클로저 기반 콘솔 명령어를 정의할 수 있습니다. 각 클로저는 명령어 인스턴스에 바인딩되어 간단하게 명령어의 IO 메서드와 상호작용할 수 있습니다. 비록 이 파일이 HTTP 라우트를 정의하지는 않지만, 콘솔 기반의 진입점(라우트) 역할을 합니다. 또한 `console.php` 파일에서 [스케줄링](/docs/12.x/scheduling) 작업도 정의할 수 있습니다.

선택적으로, `install:api` 및 `install:broadcasting` Artisan 명령어를 통해 API 라우트(`api.php`), 브로드캐스팅 채널(`channels.php`)용 추가 라우트 파일을 설치할 수도 있습니다.

`api.php` 파일에는 상태 비저장을 염두에 둔 라우트들이 정의되어 있습니다. 이 라우트로 들어오는 요청은 [토큰을 통한 인증](/docs/12.x/sanctum)을 사용하며, 세션 상태에는 접근하지 못합니다.

`channels.php` 파일에서는 애플리케이션이 지원하는 모든 [이벤트 브로드캐스팅](/docs/12.x/broadcasting) 채널을 등록할 수 있습니다.

<a name="the-storage-directory"></a>
### storage 디렉터리

`storage` 디렉터리에는 로그, 컴파일된 Blade 템플릿, 파일 기반 세션, 파일 캐시, 그리고 그 외 프레임워크에서 생성하는 각종 파일들이 저장됩니다. 이 디렉터리는 `app`, `framework`, `logs`처럼 나누어져 있습니다. `app` 디렉터리는 애플리케이션에서 자체적으로 생성하는 파일을 저장하는 용도로 사용할 수 있습니다. `framework` 디렉터리는 프레임워크가 생성한 파일들과 캐시를 보관하며, `logs` 디렉터리에는 애플리케이션 로그 파일이 기록됩니다.

`storage/app/public` 디렉터리는 프로필 아바타처럼 사용자가 생성한 파일 중 외부에서 직접 접근이 필요한 파일을 저장하는 데 사용할 수 있습니다. 이 디렉터리를 가리키는 심볼릭 링크를 `public/storage` 경로에 생성해야 하며, 이를 위해 `php artisan storage:link` Artisan 명령어를 사용할 수 있습니다.

<a name="the-tests-directory"></a>
### tests 디렉터리

`tests` 디렉터리에는 자동화된 테스트 코드가 들어 있습니다. [Pest](https://pestphp.com) 혹은 [PHPUnit](https://phpunit.de/)을 이용한 기본 단위 테스트 및 기능 테스트 예제가 기본 제공됩니다. 각각의 테스트 클래스는 반드시 `Test`라는 접미사로 끝나야 합니다. 테스트는 `/vendor/bin/pest` 또는 `/vendor/bin/phpunit` 명령어로 실행할 수 있습니다. 테스트 결과를 좀 더 보기 좋고 상세하게 확인하고 싶다면 `php artisan test` Artisan 명령어를 사용해 실행할 수도 있습니다.

<a name="the-vendor-directory"></a>
### vendor 디렉터리

`vendor` 디렉터리에는 [Composer](https://getcomposer.org) 의존성이 저장되어 있습니다.

<a name="the-app-directory"></a>
## app 디렉터리

애플리케이션의 대부분은 `app` 디렉터리에 위치합니다. 이 디렉터리는 기본적으로 `App` 네임스페이스 아래에 있고, [PSR-4 오토로딩 표준](https://www.php-fig.org/psr/psr-4/)을 통해 Composer로 자동 로드됩니다.

기본적으로 `app` 디렉터리는 `Http`, `Models`, `Providers` 세 개의 디렉터리를 포함합니다. 하지만 시간이 지나면서, Artisan의 make 명령어를 사용해 클래스를 생성할 경우 다양한 하위 디렉터리들이 동적으로 생기게 됩니다. 예를 들어 `app/Console` 디렉터리는 `make:command` Artisan 명령어를 사용해 명령어 클래스를 생성할 때 비로소 만들어집니다.

`Console`, `Http` 디렉터리에 대해서는 아래에서 각각 더 자세히 설명하겠지만, 이 두 디렉터리는 각각 애플리케이션의 코어로 진입하는 API 역할을 한다고 볼 수 있습니다. HTTP 프로토콜과 커맨드 라인은 모두 애플리케이션과 상호작용하는 방식일 뿐, 직접 애플리케이션의 로직을 포함하지는 않습니다. 즉, 이 디렉터리들은 애플리케이션에 명령을 내리는(요청하는) 두 가지 방법입니다. `Console` 디렉터리에는 모든 Artisan 명령어가, `Http` 디렉터리에는 컨트롤러, 미들웨어, 요청(Request) 들이 위치합니다.

> [!NOTE]
> `app` 디렉터리에 있는 클래스들 중 상당수는 Artisan 명령어를 사용해 자동으로 생성할 수 있습니다. 사용할 수 있는 명령어 목록을 확인하려면 터미널에서 `php artisan list make` 명령어를 실행하세요.

<a name="the-broadcasting-directory"></a>
### Broadcasting 디렉터리

`Broadcasting` 디렉터리에는 애플리케이션의 브로드캐스트 채널 클래스가 들어 있습니다. 이 클래스들은 `make:channel` 명령어로 생성됩니다. 이 디렉터리는 기본적으로 존재하지 않으며, 최초로 채널을 만들 때 자동으로 생성됩니다. 채널에 대해 더 알고 싶다면 [이벤트 브로드캐스팅](/docs/12.x/broadcasting) 문서를 참고하세요.

<a name="the-console-directory"></a>
### Console 디렉터리

`Console` 디렉터리에는 애플리케이션의 커스텀 Artisan 명령어 클래스가 모두 들어 있습니다. 이런 명령어들은 `make:command` 명령어로 생성할 수 있습니다.

<a name="the-events-directory"></a>
### Events 디렉터리

이 디렉터리는 기본적으로 존재하지 않으며, `event:generate` 또는 `make:event` Artisan 명령어를 실행할 때 자동으로 생성됩니다. `Events` 디렉터리에는 [이벤트 클래스](/docs/12.x/events)가 담기며, 이벤트는 특정 동작이 발생했음을 애플리케이션의 다른 부분에 알리는 역할을 해주어, 유연성과 구조 분리를 가능하게 합니다.

<a name="the-exceptions-directory"></a>
### Exceptions 디렉터리

`Exceptions` 디렉터리에는 애플리케이션의 커스텀 예외 클래스가 들어 있습니다. 이 예외들은 `make:exception` 명령어로 생성할 수 있습니다.

<a name="the-http-directory"></a>
### Http 디렉터리

`Http` 디렉터리에는 컨트롤러, 미들웨어, 폼 요청 클래스가 들어 있습니다. 애플리케이션으로 들어오는 요청을 처리하기 위한 거의 모든 로직은 이 디렉터리에 위치하게 됩니다.

<a name="the-jobs-directory"></a>
### Jobs 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `make:job` Artisan 명령어를 실행하면 자동으로 생성됩니다. `Jobs` 디렉터리는 애플리케이션의 [큐잉 가능한 작업](/docs/12.x/queues)을 보관합니다. 작업(Job)은 애플리케이션에서 큐에 넣어 비동기로 처리하거나, 현재 요청 라이프사이클 내에서 동기적으로 실행할 수도 있습니다. 이렇게 동기로 실행되는 작업을 때로는 "커맨드 패턴"([command pattern](https://en.wikipedia.org/wiki/Command_pattern))의 개념에서 "커맨드"라고 부르기도 합니다.

<a name="the-listeners-directory"></a>
### Listeners 디렉터리

이 디렉터리는 기본적으로 존재하지 않으나, `event:generate` 또는 `make:listener` Artisan 명령어를 실행하면 자동으로 생성됩니다. `Listeners` 디렉터리에는 [이벤트](/docs/12.x/events)를 처리하는 클래스들이 모여 있습니다. 이벤트 리스너는 이벤트 인스턴스를 받아, 해당 이벤트가 발생했을 때 대응하는 로직을 수행합니다. 예를 들어, `UserRegistered` 이벤트가 발생하면 `SendWelcomeEmail` 리스너가 해당 이벤트를 처리할 수 있습니다.

<a name="the-mail-directory"></a>
### Mail 디렉터리

이 디렉터리는 기본적으로 존재하지 않으며, `make:mail` Artisan 명령어를 실행하면 자동으로 생성됩니다. `Mail` 디렉터리에는 애플리케이션에서 발송하는 [이메일 클래스](/docs/12.x/mail)가 들어 있습니다. 메일 객체를 이용해 이메일 작성에 필요한 모든 로직을 하나의 클래스로 캡슐화할 수 있으며, `Mail::send` 메서드로 발송할 수 있습니다.

<a name="the-models-directory"></a>
### Models 디렉터리

`Models` 디렉터리에는 [Eloquent 모델 클래스](/docs/12.x/eloquent)가 전부 들어 있습니다. 라라벨에 내장된 Eloquent ORM은 데이터베이스를 다루기 위한 간결하고 아름다운 액티브레코드(ActiveRecord) 구현을 제공합니다. 데이터베이스의 각 테이블마다 해당 테이블과 연동하는 "모델"이 존재합니다. 모델을 사용하면 테이블에서 데이터를 조회하거나, 새 레코드를 삽입할 수 있습니다.

<a name="the-notifications-directory"></a>
### Notifications 디렉터리

이 디렉터리는 기본적으로 존재하지 않으나, `make:notification` Artisan 명령어를 실행하면 자동으로 생성됩니다. `Notifications` 디렉터리에는 애플리케이션에서 발생하는 일에 대한 간단한 알림 등, 모든 "트랜잭셔널" [알림](/docs/12.x/notifications)이 저장됩니다. 라라벨의 알림 기능은 이메일, Slack, SMS, 데이터베이스 등 다양한 드라이버를 통해 알림을 송신하는 과정을 추상화해 줍니다.

<a name="the-policies-directory"></a>
### Policies 디렉터리

이 디렉터리는 기본적으로 존재하지 않으며, `make:policy` Artisan 명령어를 실행하면 자동으로 생성됩니다. `Policies` 디렉터리에는 애플리케이션의 [인가 정책 클래스](/docs/12.x/authorization)가 들어 있습니다. 정책(Policy)은 사용자가 리소스에 대해 특정 작업을 할 수 있는지를 판단하는 역할을 맡습니다.

<a name="the-providers-directory"></a>
### Providers 디렉터리

`Providers` 디렉터리에는 애플리케이션의 모든 [서비스 프로바이더](/docs/12.x/providers)가 들어 있습니다. 서비스 프로바이더는 서비스 컨테이너에 서비스 바인딩, 이벤트 등록, 그 외 다양한 초기 작업을 실행해 애플리케이션이 들어오는 요청을 처리할 준비를 하도록 합니다.

새로 설치한 라라벨 애플리케이션에는 이 디렉터리에 이미 `AppServiceProvider`가 포함되어 있습니다. 필요에 따라 여기에 직접 프로바이더를 추가하실 수 있습니다.

<a name="the-rules-directory"></a>
### Rules 디렉터리

이 디렉터리는 기본적으로 존재하지 않으나, `make:rule` Artisan 명령어를 실행하면 자동으로 생성됩니다. `Rules` 디렉터리에는 애플리케이션에서 사용하는 커스텀 유효성 검증 룰 객체들이 들어 있습니다. 룰 객체는 복잡한 유효성 검증 로직을 간결한 객체로 캡슐화할 수 있게 해줍니다. 더 자세한 내용은 [유효성 검증 문서](/docs/12.x/validation)를 참고하세요.
