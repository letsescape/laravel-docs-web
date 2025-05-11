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

기본 라라벨 애플리케이션 구조는 대규모, 소규모 모든 애플리케이션 개발에 적합한 출발점을 제공하도록 설계되어 있습니다. 하지만 여러분은 원하는 대로 애플리케이션의 디렉터리 구조를 자유롭게 변경할 수 있습니다. 라라벨은 클래스의 위치에 거의 제한을 두지 않습니다. Composer에서 해당 클래스를 자동 로드할 수 있기만 하면 됩니다.

<a name="the-root-directory"></a>
## 루트 디렉터리

<a name="the-root-app-directory"></a>
### app 디렉터리

`app` 디렉터리에는 애플리케이션의 핵심 코드들이 들어 있습니다. 이 디렉터리에 대해 곧 더 자세히 알아보겠지만, 애플리케이션의 대부분 클래스는 이곳에 위치하게 됩니다.

<a name="the-bootstrap-directory"></a>
### bootstrap 디렉터리

`bootstrap` 디렉터리에는 프레임워크를 부트스트랩(초기화)하는 `app.php` 파일이 들어 있습니다. 또한 이 디렉터리 안에는 프레임워크가 성능 최적화를 위해 생성하는 캐시 파일(예: 라우트 캐시, 서비스 캐시 등)을 저장하는 `cache` 디렉터리가 포함되어 있습니다.

<a name="the-config-directory"></a>
### config 디렉터리

이름에서 알 수 있듯이, `config` 디렉터리에는 애플리케이션의 모든 설정 파일이 포함되어 있습니다. 이 디렉터리에 있는 모든 파일을 한 번 훑어보며 다양한 설정 옵션을 숙지해 두면 좋습니다.

<a name="the-database-directory"></a>
### database 디렉터리

`database` 디렉터리에는 데이터베이스 마이그레이션, 모델 팩토리, 시드(seed) 파일이 저장됩니다. 필요하다면 이 디렉터리에 SQLite 데이터베이스 파일을 둘 수도 있습니다.

<a name="the-public-directory"></a>
### public 디렉터리

`public` 디렉터리에는 모든 요청이 진입하는 진입점이 되는 `index.php` 파일이 위치하며, 오토로딩이 설정됩니다. 또한 이미지, JavaScript, CSS 등 애셋 파일들도 이 디렉터리에 저장됩니다.

<a name="the-resources-directory"></a>
### resources 디렉터리

`resources` 디렉터리에는 [뷰](/docs/views)와, 컴파일되지 않은 원본 CSS, JavaScript 등 다양한 자원이 들어 있습니다.

<a name="the-routes-directory"></a>
### routes 디렉터리

`routes` 디렉터리에는 애플리케이션의 모든 라우트 정의가 포함되어 있습니다. 라라벨에는 기본적으로 두 개의 라우트 파일(`web.php`, `console.php`)이 포함되어 있습니다.

`web.php` 파일에는 라라벨이 `web` 미들웨어 그룹에 포함시키는 라우트가 정의됩니다. 이 그룹은 세션 상태 관리, CSRF 보호, 쿠키 암호화 기능을 제공합니다. 만약 애플리케이션에서 상태가 없는 RESTful API를 제공하지 않는다면, 대체로 모든 라우트는 이 `web.php`에 정의하게 됩니다.

`console.php` 파일에는 클로저(익명 함수) 기반 콘솔 명령어들을 정의할 수 있습니다. 이 파일에 정의된 각 클로저는 명령어 인스턴스에 바인딩되어, 명령어의 입출력(IO) 메서드와 쉽게 상호작용할 수 있습니다. 이 파일은 HTTP 라우트를 정의하지는 않지만, 애플리케이션에 대한 콘솔 기반 진입점(라우트)을 제공합니다. 또한 이 파일에서 [스케줄링](/docs/scheduling) 작업도 정의할 수 있습니다.

선택적으로, `install:api`와 `install:broadcasting` Artisan 명령어를 통해 API 라우트(`api.php`), 브로드캐스팅 채널(`channels.php`) 등 추가 라우트 파일을 설치할 수 있습니다.

`api.php` 파일에는 상태가 없는(stateless) 라우트들이 정의됩니다. 따라서 이 경로로 진입하는 요청은 [토큰 인증](/docs/sanctum)을 거치며, 세션 상태에는 접근할 수 없습니다.

`channels.php` 파일에서는 애플리케이션에서 지원하는 [이벤트 브로드캐스팅](/docs/broadcasting) 채널을 모두 등록할 수 있습니다.

<a name="the-storage-directory"></a>
### storage 디렉터리

`storage` 디렉터리에는 로그 파일, 컴파일된 Blade 템플릿, 파일 기반 세션, 파일 캐시, 그리고 프레임워크가 생성하는 기타 파일들이 저장됩니다. 이 디렉터리는 `app`, `framework`, `logs`로 분리되어 있습니다. `app` 디렉터리는 애플리케이션이 생성하는 파일을 저장하는 데 사용할 수 있습니다. `framework` 디렉터리는 프레임워크가 생성한 파일과 캐시를 저장합니다. 마지막으로, `logs` 디렉터리에는 애플리케이션의 로그 파일이 저장됩니다.

`storage/app/public` 디렉터리는 프로필 아바타 등 공개적으로 접근 가능한 사용자 생성 파일을 저장하는 용도로 사용할 수 있습니다. 이 디렉터리를 가리키는 심볼릭 링크를 `public/storage`에 생성해야 하며, `php artisan storage:link` Artisan 명령어를 사용해서 쉽게 만들 수 있습니다.

<a name="the-tests-directory"></a>
### tests 디렉터리

`tests` 디렉터리에는 자동화된 테스트 코드가 들어 있습니다. 기본적으로 [Pest](https://pestphp.com)나 [PHPUnit](https://phpunit.de/)을 사용하는 단위 테스트, 기능 테스트 예시가 제공됩니다. 각 테스트 클래스의 이름 뒤에는 반드시 `Test`라는 접미사가 붙어야 합니다. `/vendor/bin/pest`나 `/vendor/bin/phpunit` 명령어로도 테스트를 실행할 수 있고, 좀 더 예쁘고 상세한 테스트 결과 출력을 원한다면 `php artisan test` Artisan 명령어를 사용할 수도 있습니다.

<a name="the-vendor-directory"></a>
### vendor 디렉터리

`vendor` 디렉터리에는 [Composer](https://getcomposer.org)로 설치한 모든 의존 패키지들이 저장됩니다.

<a name="the-app-directory"></a>
## app 디렉터리

애플리케이션의 대부분 코드는 `app` 디렉터리에 위치합니다. 기본적으로 이 디렉터리는 `App` 네임스페이스 하에 있으며, [PSR-4 오토로딩 표준](https://www.php-fig.org/psr/psr-4/)에 따라 Composer에 의해 자동 로드됩니다.

기본 `app` 디렉터리에는 `Http`, `Models`, `Providers` 등의 디렉터리가 포함되어 있습니다. 하지만 Artisan의 make 명령어로 클래스를 생성하다 보면, 다양한 디렉터리가 추가로 생성될 수 있습니다. 예를 들어 명령어 클래스를 생성하는 `make:command` Artisan 명령어를 실행하기 전엔 `app/Console` 디렉터리가 존재하지 않습니다.

`Console`과 `Http` 디렉터리에 대해서는 아래에서 각각 더 자세히 설명하겠지만, 이 두 디렉터리는 애플리케이션의 코어로 진입하는 API 역할을 한다고 생각할 수 있습니다. HTTP 프로토콜과 CLI(명령행 인터페이스)는 모두 애플리케이션과 상호작용하기 위한 수단(application logic과 구분)일 뿐, 코어 로직이 직접 포함되어 있진 않습니다. 즉, 이 두 가지는 모두 애플리케이션에 명령을 전달하는 방법입니다. `Console` 디렉터리에는 모든 Artisan 명령어가, `Http` 디렉터리에는 컨트롤러, 미들웨어, 요청 클래스들이 위치합니다.

> [!NOTE]
> `app` 디렉터리에 있는 많은 클래스는 Artisan 명령어로 자동 생성할 수 있습니다. 사용 가능한 명령어 목록을 확인하려면 터미널에서 `php artisan list make` 명령어를 실행해 보세요.

<a name="the-broadcasting-directory"></a>
### Broadcasting 디렉터리

`Broadcasting` 디렉터리에는 애플리케이션의 브로드캐스트 채널 클래스가 모두 들어 있습니다. 이 디렉터리는 `make:channel` 명령어로 생성됩니다. 기본적으로 존재하지 않다가, 첫 번째 채널을 만들 때 자동으로 생성됩니다. 채널에 대해 더 자세히 알고 싶다면 [이벤트 브로드캐스팅](/docs/broadcasting) 문서를 참고하세요.

<a name="the-console-directory"></a>
### Console 디렉터리

`Console` 디렉터리에는 애플리케이션에 커스텀으로 추가하는 모든 Artisan 명령어 클래스가 들어 있습니다. 이 클래스들은 `make:command` 명령어로 생성할 수 있습니다.

<a name="the-events-directory"></a>
### Events 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `event:generate` 또는 `make:event` Artisan 명령어를 실행하면 생성됩니다. `Events` 디렉터리에는 [이벤트 클래스](/docs/events)가 저장됩니다. 이벤트는 특정 동작이 발생했음을 애플리케이션의 다른 부분에 알리는 역할로, 높은 유연성과 결합도 감소를 제공합니다.

<a name="the-exceptions-directory"></a>
### Exceptions 디렉터리

`Exceptions` 디렉터리에는 애플리케이션에 정의된 커스텀 예외 클래스가 모두 들어 있습니다. 이 예외 클래스들은 `make:exception` 명령어로 생성할 수 있습니다.

<a name="the-http-directory"></a>
### Http 디렉터리

`Http` 디렉터리에는 컨트롤러, 미들웨어, 폼 요청 등 요청을 처리하는 거의 모든 로직이 위치합니다.

<a name="the-jobs-directory"></a>
### Jobs 디렉터리

이 디렉터리도 기본적으로 존재하지 않지만, `make:job` Artisan 명령어를 실행하면 생성됩니다. `Jobs` 디렉터리에는 애플리케이션의 [큐잉이 가능한(job) 작업 클래스](/docs/queues)가 보관됩니다. 이 작업들은 큐에 넣어서 비동기적으로 처리하거나, 현재 요청 라이프사이클 내에서 동기적으로 실행할 수도 있습니다. 동기적으로 실행되는 작업은 [커맨드 패턴](https://en.wikipedia.org/wiki/Command_pattern)을 구현하므로 "커맨드"라고 부르기도 합니다.

<a name="the-listeners-directory"></a>
### Listeners 디렉터리

이 디렉터리 역시 기본적으로 존재하지 않지만, `event:generate` 또는 `make:listener` Artisan 명령어를 사용하면 생성됩니다. `Listeners` 디렉터리에는 [이벤트](/docs/events)를 처리하는 리스너 클래스가 포함됩니다. 이벤트 리스너는 이벤트 인스턴스를 받아서, 그 이벤트가 발생했을 때 필요한 처리를 수행합니다. 예를 들어, `UserRegistered` 이벤트를 `SendWelcomeEmail` 리스너가 받아서 환영 이메일을 보낼 수 있습니다.

<a name="the-mail-directory"></a>
### Mail 디렉터리

이 디렉터리도 기본적으로 존재하지 않지만, `make:mail` Artisan 명령어를 실행하면 생성됩니다. `Mail` 디렉터리에는 애플리케이션에서 발송하는 [이메일을 나타내는 클래스](/docs/mail)가 모두 저장됩니다. 메일 객체는 이메일 빌드 과정을 하나의 단순한 클래스로 캡슐화하며, `Mail::send` 메서드로 발송할 수 있습니다.

<a name="the-models-directory"></a>
### Models 디렉터리

`Models` 디렉터리에는 [Eloquent 모델 클래스](/docs/eloquent)가 모두 위치합니다. 라라벨에 포함된 Eloquent ORM은 데이터베이스 작업을 위한 간편한 ActiveRecord 패턴을 제공합니다. 데이터베이스의 각 테이블에는 대응하는 "모델"이 존재하며, 이 모델을 통해 테이블 조회, 새로운 레코드 삽입 같은 작업을 쉽게 처리할 수 있습니다.

<a name="the-notifications-directory"></a>
### Notifications 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `make:notification` Artisan 명령어를 실행하면 생성됩니다. `Notifications` 디렉터리에는 [트랜잭션성(notification) 알림 클래스](/docs/notifications)가 저장됩니다. 이것은 애플리케이션 내부에서 발생한 이벤트 등을 사용자에게 간단하게 알릴 때 사용할 수 있습니다. 라라벨의 알림 기능은 이메일, Slack, SMS, 데이터베이스 저장 등 다양한 드라이버를 통해 알림 발송을 추상화합니다.

<a name="the-policies-directory"></a>
### Policies 디렉터리

이 디렉터리도 기본적으로 존재하지 않으며, `make:policy` Artisan 명령어를 실행하면 생성됩니다. `Policies` 디렉터리에는 애플리케이션의 [인가 정책 클래스](/docs/authorization)가 저장됩니다. 정책은 사용자가 특정 리소스에 대해 특정 동작을 할 수 있는지 여부를 판별하는 데 사용됩니다.

<a name="the-providers-directory"></a>
### Providers 디렉터리

`Providers` 디렉터리에는 애플리케이션의 [서비스 프로바이더](/docs/providers)들이 모두 포함되어 있습니다. 서비스 프로바이더는 서비스 컨테이너에 서비스 바인딩, 이벤트 등록 등 애플리케이션이 외부 요청을 받을 준비를 하는 모든 부트스트랩 과정을 담당합니다.

새롭게 생성한 라라벨 애플리케이션에는 이미 `AppServiceProvider` 파일이 들어 있습니다. 필요에 따라 직접 만들어 추가해도 됩니다.

<a name="the-rules-directory"></a>
### Rules 디렉터리

이 디렉터리도 기본적으로 존재하지 않고, `make:rule` Artisan 명령어를 실행할 때 생성됩니다. `Rules` 디렉터리에는 애플리케이션에 정의된 커스텀 유효성 검증(validation) 규칙 객체들이 저장됩니다. 복잡한 유효성 검증 로직을 단순한 객체 하나로 캡슐화할 수 있습니다. 자세한 내용은 [유효성 검증 문서](/docs/validation)를 참고하세요.
