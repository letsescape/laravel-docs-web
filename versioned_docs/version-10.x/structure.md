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
- [App 디렉터리](#the-app-directory)
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

라라벨의 기본 애플리케이션 구조는 크고 작은 다양한 프로젝트에서 모두 훌륭한 출발점을 제공하기 위해 설계되었습니다. 하지만 여러분은 원한다면 애플리케이션을 자유롭게 원하는 방식으로 구성할 수 있습니다. 라라벨은 Composer가 클래스를 자동 로드할 수 있기만 하면, 어떤 클래스를 어디에 위치시켜야 하는지에 거의 제한을 두지 않습니다.

> [!NOTE]
> 라라벨이 처음이신가요? [라라벨 부트캠프](https://bootcamp.laravel.com)를 참고해 보세요. 실습을 통해 라라벨 애플리케이션을 처음부터 만드는 과정을 안내해 드립니다.

<a name="the-root-directory"></a>
## 루트 디렉터리

<a name="the-root-app-directory"></a>
#### app 디렉터리

`app` 디렉터리에는 애플리케이션의 핵심 코드가 들어 있습니다. 이 디렉터리에 대해 자세히는 아래에서 살펴보겠지만, 애플리케이션의 거의 모든 클래스는 이 디렉터리에 위치하게 됩니다.

<a name="the-bootstrap-directory"></a>
#### bootstrap 디렉터리

`bootstrap` 디렉터리에는 프레임워크를 부트스트랩하는 `app.php` 파일이 위치합니다. 이 디렉터리에는 또한 성능 최적화를 위한 프레임워크 생성 파일(예: 라우트 캐시, 서비스 캐시 파일 등)을 담는 `cache` 디렉터리도 포함되어 있습니다. 일반적으로 이 디렉터리 안의 파일을 수정할 일은 거의 없습니다.

<a name="the-config-directory"></a>
#### config 디렉터리

이름에서 알 수 있듯이, `config` 디렉터리에는 애플리케이션의 모든 설정 파일이 위치합니다. 이 디렉터리 내의 파일을 모두 읽어보며, 제공되는 다양한 옵션에 익숙해지는 것이 좋습니다.

<a name="the-database-directory"></a>
#### database 디렉터리

`database` 디렉터리에는 데이터베이스 마이그레이션, 모델 팩토리, 시드(seed)가 들어 있습니다. 필요하다면 이 디렉터리에 SQLite 데이터베이스 파일을 추가하여 사용할 수도 있습니다.

<a name="the-public-directory"></a>
#### public 디렉터리

`public` 디렉터리에는 모든 요청이 처음 진입하는 진입점인 `index.php` 파일이 위치해 있으며, 오토로딩 설정도 수행합니다. 또한 이 디렉터리에는 이미지, JavaScript, CSS 등 애플리케이션의 각종 에셋 파일도 포함됩니다.

<a name="the-resources-directory"></a>
#### resources 디렉터리

`resources` 디렉터리에는 [뷰 파일](/docs/10.x/views)과, 컴파일되지 않은 CSS나 JavaScript처럼 원본 형태의 에셋이 담겨 있습니다.

<a name="the-routes-directory"></a>
#### routes 디렉터리

`routes` 디렉터리에는 애플리케이션의 모든 라우트 정의 파일이 위치합니다. 라라벨에는 기본적으로 여러 개의 라우트 파일(`web.php`, `api.php`, `console.php`, `channels.php`)이 제공됩니다.

`web.php` 파일에는 세션 상태, CSRF 보호, 쿠키 암호화 등 `RouteServiceProvider`가 `web` 미들웨어 그룹에 포함시키는 라우트가 정의되어 있습니다. 만약 애플리케이션이 상태 비저장(Stateless) RESTful API를 제공하지 않는다면, 모든 라우트는 대부분 `web.php`에 정의하게 됩니다.

`api.php` 파일에는 `RouteServiceProvider`가 `api` 미들웨어 그룹에 포함하는 라우트가 정의되어 있습니다. 이 라우트들은 상태 비저장 API용으로 설계되었으므로, 이 경로로 들어오는 요청은 [토큰 인증](/docs/10.x/sanctum) 방식으로 인증되며 세션 상태에는 접근할 수 없습니다.

`console.php` 파일에서는 클로저 기반의 콘솔 명령어를 모두 정의할 수 있습니다. 각 클로저는 명령어 인스턴스에 바인딩되어, 각 명령어의 IO 메서드와 쉽게 상호작용할 수 있습니다. 이 파일은 HTTP 라우트를 정의하지 않지만, 콘솔을 통한 진입점(라우트)을 정의한다는 점에서 마찬가지로 중요한 역할을 합니다.

`channels.php` 파일에서는 애플리케이션이 지원하는 [이벤트 브로드캐스팅](/docs/10.x/broadcasting) 채널을 등록할 수 있습니다.

<a name="the-storage-directory"></a>
#### storage 디렉터리

`storage` 디렉터리에는 로그, 컴파일된 Blade 템플릿, 파일 기반 세션, 파일 캐시, 그 외 프레임워크에서 생성하는 각종 파일이 저장됩니다. 이 디렉터리는 `app`, `framework`, `logs`로 분리되어 있습니다. `app` 디렉터리는 애플리케이션 실행 중 생성되는 파일을 저장하는 데 사용할 수 있습니다. `framework` 디렉터리는 프레임워크에서 생성하는 파일 및 캐시가 저장됩니다. 마지막으로 `logs` 디렉터리에는 애플리케이션의 로그 파일이 들어 있습니다.

`storage/app/public` 디렉터리는 프로필 아바타와 같이 사용자가 업로드한 파일 등, 외부에 공개해야 할 파일을 저장하는 데 사용할 수 있습니다. 이러한 파일에 접근할 수 있도록, `public/storage`에 심볼릭 링크를 만들어야 합니다. `php artisan storage:link` 아티즌 명령어를 사용해 이 심볼릭 링크를 생성할 수 있습니다.

`storage` 디렉터리의 위치는 `LARAVEL_STORAGE_PATH` 환경 변수를 통해 변경할 수 있습니다.

<a name="the-tests-directory"></a>
#### tests 디렉터리

`tests` 디렉터리에는 자동화 테스트가 저장됩니다. 기본적으로 [PHPUnit](https://phpunit.de/)을 이용한 유닛 테스트와 기능 테스트 예제가 제공됩니다. 각 테스트 클래스의 클래스명 끝에는 반드시 `Test`가 붙어야 합니다. 테스트는 `phpunit`이나 `php vendor/bin/phpunit` 명령어로 실행할 수 있습니다. 좀 더 상세하고 아름다운 결과 출력을 원한다면, `php artisan test` 아티즌 명령어를 사용할 수도 있습니다.

<a name="the-vendor-directory"></a>
#### vendor 디렉터리

`vendor` 디렉터리에는 [Composer](https://getcomposer.org)로 관리되는 외부 패키지 의존성이 포함되어 있습니다.

<a name="the-app-directory"></a>
## App 디렉터리

애플리케이션의 대부분은 `app` 디렉터리에 위치합니다. 기본적으로 이 디렉터리는 `App` 네임스페이스로 설정되어 있으며, [PSR-4 오토로딩 표준](https://www.php-fig.org/psr/psr-4/)을 따르는 Composer의 자동 로딩 기능으로 관리됩니다.

`app` 디렉터리에는 `Console`, `Http`, `Providers` 등 다양한 하위 디렉터리가 존재합니다. `Console`과 `Http` 디렉터리는 애플리케이션의 핵심과 상호작용하는 API를 제공하는 개념이라고 볼 수 있습니다. HTTP 프로토콜과 CLI 모두 애플리케이션과 상호작용하는 수단일 뿐이며, 실제 비즈니스 로직은 여기에는 없습니다. 즉, 이 두 곳은 애플리케이션에 명령을 전달하는 두 가지 방법이라고 생각하면 됩니다. `Console` 디렉터리에는 모든 아티즌 명령어가, `Http` 디렉터리에는 컨트롤러, 미들웨어, 폼 요청이 각각 위치합니다.

`make` 아티즌 명령어를 통해 클래스를 생성하면, `app` 디렉터리에 다양한 하위 디렉터리가 자동으로 추가됩니다. 예를 들어, `make:job` 아티즌 명령어로 작업(잡) 클래스를 생성하면 `app/Jobs` 디렉터리가 새로 생성됩니다.

> [!NOTE]
> `app` 디렉터리에 있는 많은 클래스들은 아티즌 명령어로 생성할 수 있습니다. 사용 가능한 명령어 목록은 터미널에서 `php artisan list make` 명령어로 확인할 수 있습니다.

<a name="the-broadcasting-directory"></a>
#### Broadcasting 디렉터리

`Broadcasting` 디렉터리에는 애플리케이션의 모든 브로드캐스트 채널 클래스가 포함됩니다. 이 클래스들은 `make:channel` 명령어로 생성됩니다. 이 디렉터리는 기본적으로 존재하지 않으며, 첫 번째 채널을 생성할 때 자동으로 만들어집니다. 채널에 대한 자세한 내용은 [이벤트 브로드캐스팅](/docs/10.x/broadcasting) 문서를 참고하세요.

<a name="the-console-directory"></a>
#### Console 디렉터리

`Console` 디렉터리에는 애플리케이션에서 사용하는 커스텀 아티즌 명령어가 모두 담겨 있습니다. 이러한 명령어는 `make:command` 명령어로 생성할 수 있습니다. 또한 여기에는 자신만의 아티즌 명령어 등록과 [예약 작업](/docs/10.x/scheduling) 정의를 담당하는 콘솔 커널도 포함되어 있습니다.

<a name="the-events-directory"></a>
#### Events 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `event:generate` 또는 `make:event` 아티즌 명령어를 실행하면 자동으로 생성됩니다. `Events` 디렉터리에는 [이벤트 클래스](/docs/10.x/events)가 들어있습니다. 이벤트는 애플리케이션 내의 다른 부분에 특정 동작이 발생했음을 알리는 용도로 사용되며, 높은 유연성과 결합도 감소에 도움을 줍니다.

<a name="the-exceptions-directory"></a>
#### Exceptions 디렉터리

`Exceptions` 디렉터리에는 애플리케이션의 예외(Exception) 핸들러가 포함되어 있으며, 애플리케이션에서 발생시키는 커스텀 예외 클래스를 추가할 장소로도 적합합니다. 예외를 어떻게 기록(Log)하거나 렌더링할지 동작을 변경하고 싶다면 이 디렉터리의 `Handler` 클래스를 수정하면 됩니다.

<a name="the-http-directory"></a>
#### Http 디렉터리

`Http` 디렉터리에는 컨트롤러, 미들웨어, 폼 요청 등이 담겨 있습니다. 애플리케이션으로 들어오는 요청을 처리하는 로직의 대부분은 이 디렉터리에 위치하게 됩니다.

<a name="the-jobs-directory"></a>
#### Jobs 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `make:job` 아티즌 명령어를 실행하면 자동으로 생성됩니다. `Jobs` 디렉터리에는 애플리케이션의 [큐 작업](/docs/10.x/queues) 클래스가 저장됩니다. 작업(잡)은 큐에 저장되어 비동기로 실행되거나, 현재 요청의 처리 흐름 내에서 동기적으로 실행될 수 있습니다. 동기적으로 실행되는 작업은 가끔 '커맨드'라고도 부르는데, 이는 [커맨드 패턴](https://en.wikipedia.org/wiki/Command_pattern)의 구현이기 때문입니다.

<a name="the-listeners-directory"></a>
#### Listeners 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `event:generate` 또는 `make:listener` 아티즌 명령어를 실행하면 자동으로 생성됩니다. `Listeners` 디렉터리에는 [이벤트](/docs/10.x/events)를 처리하는 클래스들이 포함됩니다. 이벤트 리스너는 이벤트 인스턴스를 전달받아 해당 이벤트가 발생했을 때 실행할 로직을 처리합니다. 예를 들어, `UserRegistered` 이벤트가 발생하면 `SendWelcomeEmail` 리스너가 이를 처리할 수 있습니다.

<a name="the-mail-directory"></a>
#### Mail 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `make:mail` 아티즌 명령어를 실행하면 자동으로 생성됩니다. `Mail` 디렉터리에는 애플리케이션에서 발송하는 [이메일을 나타내는 클래스](/docs/10.x/mail)가 담겨 있습니다. 메일 객체는 이메일 생성에 필요한 모든 로직을 한 클래스에 캡슐화하여 `Mail::send` 메서드를 통해 쉽게 보낼 수 있도록 도와줍니다.

<a name="the-models-directory"></a>
#### Models 디렉터리

`Models` 디렉터리에는 [Eloquent 모델 클래스](/docs/10.x/eloquent)가 모두 저장됩니다. 라라벨의 Eloquent ORM은 데이터베이스 작업을 쉽고 아름답게 해주는 액티브 레코드 패턴 구현체입니다. 데이터베이스의 각 테이블에는 하나의 "모델"이 대응되며, 이 모델을 사용해 해당 테이블에 저장된 데이터를 조회하거나 새 레코드를 추가할 수 있습니다.

<a name="the-notifications-directory"></a>
#### Notifications 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `make:notification` 아티즌 명령어를 실행하면 자동으로 생성됩니다. `Notifications` 디렉터리에는 애플리케이션이 보내는 "트랜잭션(거래성) 알림", 즉 애플리케이션 내에서 발생하는 각종 이벤트에 대한 간단한 알림 등이 들어 있습니다. 라라벨의 알림 기능은 이메일, 슬랙, SMS, 데이터베이스 저장 등 다양한 드라이버를 이용해 알림을 보낼 수 있도록 추상화해줍니다.

<a name="the-policies-directory"></a>
#### Policies 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `make:policy` 아티즌 명령어를 실행하면 자동으로 생성됩니다. `Policies` 디렉터리에는 애플리케이션의 [인가(Authorization) 정책 클래스](/docs/10.x/authorization)가 들어 있습니다. 정책(Policy)은 사용자가 특정 리소스에 대해 주어진 동작을 수행할 수 있는지 여부를 결정하는 규칙을 정의합니다.

<a name="the-providers-directory"></a>
#### Providers 디렉터리

`Providers` 디렉터리에는 애플리케이션의 모든 [서비스 프로바이더](/docs/10.x/providers)가 들어 있습니다. 서비스 프로바이더는 애플리케이션을 부트스트랩하며, 서비스 컨테이너에 서비스 바인딩, 이벤트 등록, 기타 요청을 처리하기 위한 준비 작업 등을 담당합니다.

새로운 라라벨 애플리케이션을 생성하면 이 디렉터리에 몇 가지 기본 제공 프로바이더가 이미 포함되어 있습니다. 필요에 따라 자신만의 프로바이더를 추가할 수도 있습니다.

<a name="the-rules-directory"></a>
#### Rules 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `make:rule` 아티즌 명령어를 실행하면 자동으로 생성됩니다. `Rules` 디렉터리에는 애플리케이션에서 사용하는 커스텀 유효성 검증 규칙 객체가 저장됩니다. 규칙 객체는 복잡한 유효성 검증 로직도 하나의 객체로 깔끔하게 캡슐화할 수 있게 도와줍니다. 관련 내용은 [유효성 검증 문서](/docs/10.x/validation)를 참고하세요.
