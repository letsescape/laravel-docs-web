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
- [app 디렉터리](#the-app-directory)
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

기본 라라벨 애플리케이션 구조는 대규모든 소규모든 다양한 프로젝트에 적합한 출발점을 제공하도록 설계되어 있습니다. 하지만, 여러분은 필요에 따라 애플리케이션을 원하는 방식으로 자유롭게 구성할 수 있습니다. 라라벨은 클래스가 어디에 위치해야 하는지에 대해 거의 제한을 두지 않으며, Composer가 해당 클래스를 오토로드할 수만 있다면 어디든 둘 수 있습니다.

<a name="the-root-directory"></a>
## 루트 디렉터리

<a name="the-root-app-directory"></a>
#### app 디렉터리

`app` 디렉터리에는 애플리케이션의 핵심 코드가 들어 있습니다. 이 디렉터리에 대해서는 아래에서 더 자세히 소개하겠지만, 여러분이 작성하는 대부분의 클래스는 이곳에 위치하게 됩니다.

<a name="the-bootstrap-directory"></a>
#### bootstrap 디렉터리

`bootstrap` 디렉터리에는 프레임워크를 부트스트랩하는 `app.php` 파일이 들어 있습니다. 이 디렉터리에는 또한 프레임워크가 성능 최적화를 위해 생성하는 라우트 및 서비스 캐시 파일 등 다양한 캐시 파일이 저장되는 `cache` 디렉터리가 있습니다. 일반적으로 이 디렉터리 내의 파일을 직접 수정할 필요는 없습니다.

<a name="the-config-directory"></a>
#### config 디렉터리

`config` 디렉터리는 이름에서 알 수 있듯이 애플리케이션의 모든 설정 파일이 들어 있습니다. 이 디렉터리의 모든 파일을 한 번씩 읽어보고, 다양한 옵션들을 숙지하는 것이 좋습니다.

<a name="the-database-directory"></a>
#### database 디렉터리

`database` 디렉터리에는 데이터베이스 마이그레이션, 모델 팩토리, 시드 파일이 들어 있습니다. 원한다면 이 디렉터리에 SQLite 데이터베이스 파일을 저장할 수도 있습니다.

<a name="the-public-directory"></a>
#### public 디렉터리

`public` 디렉터리에는 모든 요청이 애플리케이션으로 진입할 때 사용되는 엔트리 포인트인 `index.php` 파일이 있으며, 오토로딩을 설정합니다. 이 외에도 이미지, 자바스크립트, CSS와 같은 리소스 파일(에셋)이 함께 들어 있습니다.

<a name="the-resources-directory"></a>
#### resources 디렉터리

`resources` 디렉터리에는 [뷰](/docs/8.x/views)를 비롯해 CSS, 자바스크립트 등 컴파일되지 않은 원본 자산 파일이 들어 있습니다. 또한, 모든 언어 파일도 이 디렉터리에 위치합니다.

<a name="the-routes-directory"></a>
#### routes 디렉터리

`routes` 디렉터리에는 애플리케이션의 모든 라우트 정의가 들어 있습니다. 기본적으로 라라벨에는 여러 라우트 파일이 제공됩니다: `web.php`, `api.php`, `console.php`, `channels.php`가 있습니다.

`web.php` 파일에는 세션 상태 관리, CSRF 보호, 쿠키 암호화 등을 제공하는 `web` 미들웨어 그룹의 라우트가 들어 있습니다. 만약 여러분의 애플리케이션이 상태 없는 RESTful API가 아니라면, 대부분의 라우트를 `web.php`에 정의하게 될 것입니다.

`api.php` 파일에는 `RouteServiceProvider`가 `api` 미들웨어 그룹으로 분류하는 라우트가 있습니다. 이 라우트들은 상태를 저장하지 않으며, 토큰 기반 인증을 통해 요청을 처리합니다([토큰 인증 관련 문서 보기](/docs/8.x/sanctum)). 세션 상태에는 접근할 수 없습니다.

`console.php` 파일에서는 클로저 방식의 콘솔 명령어를 정의할 수 있습니다. 각 클로저는 명령어 인스턴스에 바인딩되어, 각 명령어의 IO 메서드와 쉽게 상호작용할 수 있습니다. 이 파일은 HTTP 라우트를 정의하지 않지만, 콘솔 진입점(라우트)을 정의합니다.

`channels.php` 파일에서는 애플리케이션에서 지원하는 [이벤트 브로드캐스팅](/docs/8.x/broadcasting) 채널을 등록할 수 있습니다.

<a name="the-storage-directory"></a>
#### storage 디렉터리

`storage` 디렉터리에는 로그, 컴파일된 Blade 템플릿, 파일 기반 세션, 파일 캐시, 그 외 프레임워크에 의해 생성되는 여러 파일이 저장됩니다. 이 디렉터리는 `app`, `framework`, `logs` 하위 디렉터리로 나뉩니다. `app` 디렉터리는 애플리케이션에서 생성하는 파일을 저장할 때 사용할 수 있습니다. `framework` 디렉터리는 프레임워크가 생성하는 파일과 캐시가 저장됩니다. 마지막으로 `logs` 디렉터리에는 애플리케이션의 로그 파일이 위치합니다.

`storage/app/public` 디렉터리는 프로필 아바타 등과 같은 사용자 생성 파일 등 공개적으로 접근 가능한 파일을 저장할 때 사용할 수 있습니다. 이 디렉터리에 연결된 심볼릭 링크를 `public/storage` 경로에 생성해야 하며, `php artisan storage:link` 아티즌 명령어를 사용해 쉽게 만들 수 있습니다.

<a name="the-tests-directory"></a>
#### tests 디렉터리

`tests` 디렉터리에는 자동화 테스트가 들어 있습니다. 예시용 [PHPUnit](https://phpunit.de/) 단위 테스트와 기능 테스트가 기본적으로 제공됩니다. 각 테스트 클래스명은 반드시 `Test`로 끝나야 합니다. 테스트는 `phpunit` 또는 `php vendor/bin/phpunit` 명령어로 실행할 수 있으며, 테스트 결과를 좀 더 보기 좋고 상세하게 확인하고 싶다면 `php artisan test` 아티즌 명령어를 사용하면 됩니다.

<a name="the-vendor-directory"></a>
#### vendor 디렉터리

`vendor` 디렉터리에는 [Composer](https://getcomposer.org) 의존성이 저장됩니다.

<a name="the-app-directory"></a>
## app 디렉터리

애플리케이션의 대부분은 `app` 디렉터리에 들어 있습니다. 기본적으로 이 디렉터리는 `App` 네임스페이스 아래에 위치하며, [PSR-4 오토로딩 표준](https://www.php-fig.org/psr/psr-4/)을 통해 Composer에 의해 자동으로 로드됩니다.

`app` 디렉터리에는 `Console`, `Http`, `Providers` 등 다양한 서브 디렉터리가 존재합니다. 이 중 `Console` 과 `Http` 디렉터리는 애플리케이션의 핵심에 접근하는 API 역할을 수행한다고 생각하면 이해하기 쉽습니다. HTTP 프로토콜과 CLI는 모두 애플리케이션과 상호작용하는 수단이지만, 실제 애플리케이션 로직이 포함되어 있지는 않습니다. 즉, 이들은 모두 애플리케이션에 명령을 전달하는 통로입니다. `Console` 디렉터리에는 모든 아티즌 명령어가 저장되며, `Http` 디렉터리에는 컨트롤러, 미들웨어, 폼 리퀘스트가 위치합니다.

또한, 다양한 서브 디렉터리는 필요에 따라 `make` 아티즌 명령어로 클래스를 생성할 때 자동으로 생성됩니다. 예를 들어, `app/Jobs` 디렉터리는 `make:job` 아티즌 명령어를 실행하여 잡 클래스를 생성하기 전에는 존재하지 않습니다.

> [!TIP]
> `app` 디렉터리의 많은 클래스들은 아티즌 명령어를 통해 쉽게 생성할 수 있습니다. 사용 가능한 명령어 목록은 터미널에서 `php artisan list make` 명령어로 확인할 수 있습니다.

<a name="the-broadcasting-directory"></a>
#### Broadcasting 디렉터리

`Broadcasting` 디렉터리에는 애플리케이션의 모든 브로드캐스트 채널 클래스가 저장됩니다. 이 클래스들은 `make:channel` 명령어로 생성합니다. 이 디렉터리는 기본적으로 존재하지 않으며, 첫 채널을 생성하면 자동으로 만들어집니다. 채널에 대한 더 자세한 정보는 [이벤트 브로드캐스팅 문서](/docs/8.x/broadcasting)를 참고해 보세요.

<a name="the-console-directory"></a>
#### Console 디렉터리

`Console` 디렉터리에는 애플리케이션의 모든 커스텀 아티즌 명령어가 저장됩니다. 이 명령어들은 `make:command` 명령어로 생성할 수 있습니다. 또한 이 디렉터리에는 커스텀 아티즌 명령어를 등록하거나 [예약 작업](/docs/8.x/scheduling)을 정의할 때 사용하는 콘솔 커널도 함께 포함되어 있습니다.

<a name="the-events-directory"></a>
#### Events 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `event:generate` 또는 `make:event` 아티즌 명령어를 실행하면 자동으로 생성됩니다. `Events` 디렉터리에는 [이벤트 클래스](/docs/8.x/events)가 저장됩니다. 이벤트는 특정 행동이 발생했음을 애플리케이션의 다른 부분에 알릴 때 사용되며, 유연성과 결합도를 낮추는 데 매우 유용합니다.

<a name="the-exceptions-directory"></a>
#### Exceptions 디렉터리

`Exceptions` 디렉터리에는 애플리케이션의 예외 처리기가 들어 있으며, 애플리케이션에서 발생하는 예외를 정의하는 것도 좋은 위치입니다. 예외가 기록되거나 렌더링되는 방식을 커스터마이즈하려면 이 디렉터리 내의 `Handler` 클래스를 수정하면 됩니다.

<a name="the-http-directory"></a>
#### Http 디렉터리

`Http` 디렉터리에는 컨트롤러, 미들웨어, 폼 리퀘스트가 저장됩니다. 애플리케이션으로 들어오는 요청을 처리하는 로직의 대부분은 이 디렉터리에 위치하게 됩니다.

<a name="the-jobs-directory"></a>
#### Jobs 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `make:job` 아티즌 명령어를 실행하면 생성됩니다. `Jobs` 디렉터리에는 애플리케이션에서 사용하는 [큐 작업 클래스](/docs/8.x/queues)가 담겨 있습니다. 잡은 애플리케이션에서 큐에 의해 처리되거나, 현재 요청의 실행 흐름 내에서 동기적으로 실행될 수도 있습니다. 요청 흐름 내에서 동기적으로 실행되는 잡은 종종 "커맨드 패턴"([Command Pattern](https://en.wikipedia.org/wiki/Command_pattern))의 구현체로서 "커맨드"라고 불리기도 합니다.

<a name="the-listeners-directory"></a>
#### Listeners 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `event:generate` 또는 `make:listener` 아티즌 명령어를 실행하면 생성됩니다. `Listeners` 디렉터리에는 [이벤트](/docs/8.x/events)를 처리하는 클래스가 포함됩니다. 이벤트 리스너는 이벤트 인스턴스를 받아 해당 이벤트가 발생했을 때 처리해야 할 로직을 실행합니다. 예를 들어, `UserRegistered` 이벤트가 발생하면 `SendWelcomeEmail` 리스너가 해당 이벤트를 처리할 수 있습니다.

<a name="the-mail-directory"></a>
#### Mail 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `make:mail` 아티즌 명령어를 실행하면 생성됩니다. `Mail` 디렉터리에는 애플리케이션에서 전송하는 [이메일 클래스](/docs/8.x/mail)가 모두 저장됩니다. Mail 객체를 이용하면 이메일 작성에 필요한 모든 로직을 하나의 간단한 클래스로 캡슐화할 수 있으며, `Mail::send` 메서드를 사용해 전송할 수 있습니다.

<a name="the-models-directory"></a>
#### Models 디렉터리

`Models` 디렉터리에는 모든 [Eloquent 모델 클래스](/docs/8.x/eloquent)가 들어 있습니다. 라라벨에 포함된 Eloquent ORM은 데이터베이스 작업을 위한 간단하면서도 강력한 액티브 레코드 방식의 구현체를 제공합니다. 각 데이터베이스 테이블에는 해당 테이블과 상호작용하는 "모델"이 대응되며, 모델을 사용하면 테이블에서 데이터를 조회하거나 새로운 레코드를 삽입할 수 있습니다.

<a name="the-notifications-directory"></a>
#### Notifications 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `make:notification` 아티즌 명령어를 실행하면 생성됩니다. `Notifications` 디렉터리에는 애플리케이션에서 전송하는 "트랜잭셔널" [알림](/docs/8.x/notifications) 클래스가 모두 들어 있습니다. 예를 들어, 애플리케이션 내에서 발생하는 이벤트에 대한 간단한 알림 등이 여기에 포함됩니다. 라라벨의 알림 기능은 이메일, Slack, SMS, 데이터베이스 저장 등 다양한 드라이버를 통한 알림 발송을 추상화해줍니다.

<a name="the-policies-directory"></a>
#### Policies 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `make:policy` 아티즌 명령어를 실행하면 생성됩니다. `Policies` 디렉터리에는 애플리케이션의 [인가(authorization) 정책 클래스](/docs/8.x/authorization)가 들어 있습니다. 정책은 사용자가 특정 리소스에 대해 특정 동작을 수행할 수 있는지 판단하는 데 사용됩니다.

<a name="the-providers-directory"></a>
#### Providers 디렉터리

`Providers` 디렉터리에는 애플리케이션의 [서비스 프로바이더](/docs/8.x/providers)가 모두 저장됩니다. 서비스 프로바이더는 서비스 컨테이너에 서비스 바인딩, 이벤트 등록, 그 외 애플리케이션이 요청을 받을 준비를 하는 데 필요한 작업을 수행해 애플리케이션을 부트스트랩합니다.

새로운 라라벨 애플리케이션을 생성하면 이 디렉터리에는 여러 기본 프로바이더가 이미 들어 있습니다. 필요하다면 이곳에 직접 프로바이더를 추가해 사용할 수 있습니다.

<a name="the-rules-directory"></a>
#### Rules 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `make:rule` 아티즌 명령어를 실행하면 생성됩니다. `Rules` 디렉터리에는 애플리케이션의 커스텀 유효성 검증 룰 객체들이 들어 있습니다. 룰 객체는 복잡한 유효성 검증 로직을 단순한 객체로 캡슐화하는 데 사용됩니다. 더 자세한 내용은 [유효성 검증 문서](/docs/8.x/validation)를 참고해주세요.
