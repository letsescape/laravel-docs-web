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

기본적으로 제공되는 라라벨 애플리케이션 구조는 소규모부터 대규모 애플리케이션까지 모두에 적합한 훌륭한 출발점을 제공합니다. 하지만, 여러분은 마음대로 애플리케이션의 구조를 변경해서 사용할 수 있습니다. 라라벨은 클래스가 어떤 위치에 있든지 거의 제한을 두지 않습니다. Composer가 그 클래스를 자동 로딩할 수만 있다면 어디에 있어도 괜찮습니다.

> [!NOTE]  
> 라라벨이 처음이신가요? [라라벨 부트캠프](https://bootcamp.laravel.com)를 참고하여 실제로 애플리케이션을 만들어 보며 프레임워크의 핵심을 배워보시기 바랍니다.

<a name="the-root-directory"></a>
## 루트 디렉터리

<a name="the-root-app-directory"></a>
### app 디렉터리

`app` 디렉터리에는 애플리케이션의 핵심 코드가 포함되어 있습니다. 이 디렉터리에 대해 곧 더 자세히 살펴보겠습니다. 거의 모든 클래스가 이 디렉터리 안에 위치하게 됩니다.

<a name="the-bootstrap-directory"></a>
### bootstrap 디렉터리

`bootstrap` 디렉터리에는 프레임워크를 부트스트랩하는 `app.php` 파일이 들어 있습니다. 또한 이 디렉터리에는 프레임워크가 생성한 파일(예: 라우트 캐시, 서비스 캐시 등)로 성능을 향상시키는 `cache` 디렉터리가 존재합니다.

<a name="the-config-directory"></a>
### config 디렉터리

이름에서 알 수 있듯이, `config` 디렉터리에는 애플리케이션의 모든 설정 파일이 들어 있습니다. 꼭 이 디렉터리 안의 파일들을 따라가며 읽어보고, 사용할 수 있는 다양한 옵션에 익숙해지길 권장합니다.

<a name="the-database-directory"></a>
### database 디렉터리

`database` 디렉터리에는 데이터베이스 마이그레이션, 모델 팩토리, 시드 파일이 들어 있습니다. 필요하다면 이 디렉터리에 SQLite 데이터베이스 파일을 함께 넣어 사용할 수도 있습니다.

<a name="the-public-directory"></a>
### public 디렉터리

`public` 디렉터리에는 모든 요청이 들어오는 진입점 역할을 하는 `index.php` 파일이 있습니다. 이곳에서 오토로딩 설정도 이루어집니다. 또한 이미지, JavaScript, CSS와 같은 애플리케이션의 자산(assets) 파일도 여기에 둡니다.

<a name="the-resources-directory"></a>
### resources 디렉터리

`resources` 디렉터리에는 [뷰(views)](/docs/11.x/views)와 CSS/JavaScript 등 아직 컴파일되지 않은 원본 자산 파일이 들어 있습니다.

<a name="the-routes-directory"></a>
### routes 디렉터리

`routes` 디렉터리에는 애플리케이션의 모든 라우트 정의가 들어 있습니다. 기본적으로 라라벨에는 `web.php`와 `console.php` 두 개의 라우트 파일이 포함되어 있습니다.

`web.php` 파일에는 세션 상태, CSRF 보호, 쿠키 암호화 등을 제공하는 `web` 미들웨어 그룹에 속하는 라우트가 정의됩니다. 애플리케이션이 별도의 RESTful API를 제공하지 않는다면, 대부분의 라우트는 `web.php` 파일에 작성하게 됩니다.

`console.php` 파일은 클로저(익명 함수) 기반의 콘솔 명령어를 정의하는 곳입니다. 각 클로저는 명령어 인스턴스에 바인딩되어, 각 명령어의 IO 메서드와 쉽게 상호작용할 수 있습니다. 이 파일은 HTTP 라우트를 정의하지는 않지만, 애플리케이션으로 진입하는 콘솔 엔트리포인트(라우트) 역할을 합니다. 또한, `console.php` 파일에 [작업 스케줄링](/docs/11.x/scheduling)도 설정할 수 있습니다.

추가로, `install:api`, `install:broadcasting` 아티즌 명령어를 사용하면 API 라우트(`api.php`), 브로드캐스팅 채널(`channels.php`) 등 추가적인 라우트 파일을 설치할 수 있습니다.

`api.php` 파일에는 상태 비저장(stateless) 방식의 API 라우트가 정의되어 있으며, 이 라우트를 통하는 요청은 보통 [토큰](/docs/11.x/sanctum) 인증을 거치고 세션 상태에 접근할 수 없습니다.

`channels.php` 파일은 애플리케이션이 지원하는 모든 [이벤트 브로드캐스팅](/docs/11.x/broadcasting) 채널을 등록하는 곳입니다.

<a name="the-storage-directory"></a>
### storage 디렉터리

`storage` 디렉터리에는 로그, 컴파일된 Blade 템플릿, 파일 기반 세션, 파일 캐시, 프레임워크가 생성하는 기타 파일들이 저장됩니다. 디렉터리는 `app`, `framework`, `logs`로 나뉩니다. `app` 디렉터리에는 애플리케이션에서 생성하는 임시 파일들을 저장할 수 있습니다. `framework` 디렉터리는 프레임워크가 생성한 파일이나 캐시 데이터를 저장합니다. 마지막으로 `logs` 디렉터리에는 애플리케이션의 로그 파일이 저장됩니다.

`storage/app/public` 디렉터리는 프로필 아바타 등 사용자 생성 파일 중에서 공개적으로 접근이 가능한 파일을 저장할 수 있습니다. 이 디렉터리에 접근하려면 `public/storage`에 심볼릭 링크를 만들어주어야 하며, `php artisan storage:link` 아티즌 명령어로 쉽게 생성할 수 있습니다.

<a name="the-tests-directory"></a>
### tests 디렉터리

`tests` 디렉터리에는 자동화 테스트가 들어 있습니다. 예시로 [Pest](https://pestphp.com) 또는 [PHPUnit](https://phpunit.de/)를 이용한 유닛 테스트와 기능 테스트가 기본 제공됩니다. 각 테스트 클래스의 이름은 반드시 `Test`로 끝나야 합니다. `/vendor/bin/pest` 또는 `/vendor/bin/phpunit` 명령어로 테스트를 실행할 수 있습니다. 또한, 더 보기 쉽고 상세한 테스트 결과를 원한다면 `php artisan test` 아티즌 명령어로 실행하는 것도 가능합니다.

<a name="the-vendor-directory"></a>
### vendor 디렉터리

`vendor` 디렉터리에는 [Composer](https://getcomposer.org)로 설치된 의존 패키지들이 들어 있습니다.

<a name="the-app-directory"></a>
## App 디렉터리

애플리케이션의 거의 모든 코드는 `app` 디렉터리 안에 들어 있습니다. 이 디렉터리는 기본적으로 `App` 네임스페이스 하위에 있으며, [PSR-4 오토로딩 표준](https://www.php-fig.org/psr/psr-4/)에 따라 Composer에 의해 자동 로드됩니다.

기본적으로 `app` 디렉터리에는 `Http`, `Models`, `Providers` 디렉터리가 있습니다. 하지만, `make` 관련 아티즌 명령어를 통해 클래스를 생성해 나가면 다양한 추가 디렉터리가 생성됩니다. 예를 들어, `app/Console` 디렉터리는 `make:command` 아티즌 명령어로 명령어 클래스를 생성하기 전까지는 존재하지 않습니다.

`Console` 디렉터리와 `Http` 디렉터리에 관해서는 아래에서 좀 더 자세히 다루겠습니다. 이 두 디렉터리는 애플리케이션의 핵심에 접근하는 API라고 생각하면 쉽습니다. HTTP 프로토콜과 CLI(명령줄)는 모두 애플리케이션과 상호작용하는 수단이며, 실제 비즈니스 로직을 담고 있지는 않습니다. 즉, 두 가지 모두 애플리케이션에 명령을 전달하는 방법입니다. `Console` 디렉터리에는 모든 아티즌 명령어가, `Http` 디렉터리에는 컨트롤러, 미들웨어, 폼 요청이 포함되어 있습니다.

> [!NOTE]  
> `app` 디렉터리의 많은 클래스들은 아티즌 명령어로 자동 생성할 수 있습니다. 사용 가능한 명령어를 확인하려면 터미널에서 `php artisan list make` 명령어를 실행해 보세요.

<a name="the-broadcasting-directory"></a>
### Broadcasting 디렉터리

`Broadcasting` 디렉터리에는 애플리케이션의 브로드캐스트 채널 클래스가 모두 담깁니다. 이 클래스들은 `make:channel` 명령어로 생성할 수 있습니다. 기본적으로 존재하지 않으며, 첫 브로드캐스트 채널을 만들 때 생성됩니다. 관련된 내용은 [이벤트 브로드캐스팅](/docs/11.x/broadcasting) 문서를 참고하세요.

<a name="the-console-directory"></a>
### Console 디렉터리

`Console` 디렉터리에는 애플리케이션에서 사용하는 모든 커스텀 아티즌 명령어가 저장됩니다. 이 명령어들은 `make:command` 명령어로 생성할 수 있습니다.

<a name="the-events-directory"></a>
### Events 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `event:generate` 또는 `make:event` 아티즌 명령어를 실행하면 생성됩니다. `Events` 디렉터리에는 [이벤트 클래스](/docs/11.x/events)가 들어 있습니다. 이벤트는 애플리케이션의 여러 부분에 특정 동작이 발생했음을 알리는 용도로 사용하며, 높은 유연성과 결합도를 낮추는 설계에 도움이 됩니다.

<a name="the-exceptions-directory"></a>
### Exceptions 디렉터리

`Exceptions` 디렉터리에는 애플리케이션의 커스텀 예외 클래스가 모두 들어 있습니다. 이 예외 클래스들은 `make:exception` 명령어로 생성할 수 있습니다.

<a name="the-http-directory"></a>
### Http 디렉터리

`Http` 디렉터리에는 컨트롤러, 미들웨어, 그리고 폼 요청 클래스가 포함됩니다. 요청을 받아 처리하는 거의 모든 로직이 이곳에 작성됩니다.

<a name="the-jobs-directory"></a>
### Jobs 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `make:job` 아티즌 명령어를 실행하면 생성됩니다. `Jobs` 디렉터리에는 애플리케이션의 [큐에 저장 가능한 작업 클래스](/docs/11.x/queues)가 들어 있습니다. 작업은 큐를 통해 비동기로 또는 현재 요청의 라이프사이클 내에서 동기적으로 실행할 수 있습니다. 현재 요청에서 바로 수행되는 작업은 가끔 "커맨드"라고도 부르는데, 이는 [커맨드 패턴](https://en.wikipedia.org/wiki/Command_pattern)의 구현 방식이기 때문입니다.

<a name="the-listeners-directory"></a>
### Listeners 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `event:generate` 또는 `make:listener` 아티즌 명령어를 실행하면 생성됩니다. `Listeners` 디렉터리에는 [이벤트](/docs/11.x/events)를 처리하는 클래스가 담겨 있습니다. 이벤트 리스너는 이벤트 인스턴스를 전달받아, 해당 이벤트가 발생했을 때 필요한 로직을 수행합니다. 예를 들어, `UserRegistered` 이벤트가 발생하면 `SendWelcomeEmail` 리스너가 환영 이메일을 보내 처리할 수 있습니다.

<a name="the-mail-directory"></a>
### Mail 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `make:mail` 아티즌 명령어를 실행하면 생성됩니다. `Mail` 디렉터리에는 애플리케이션에서 발송하는 [이메일 클래스](/docs/11.x/mail)가 들어 있습니다. 메일 오브젝트는 이메일을 구성하는 모든 로직을 단순한 하나의 클래스로 캡슐화하며, `Mail::send` 메서드로 발송할 수 있습니다.

<a name="the-models-directory"></a>
### Models 디렉터리

`Models` 디렉터리에는 [Eloquent 모델 클래스](/docs/11.x/eloquent)가 모두 들어 있습니다. 라라벨에 내장된 Eloquent ORM은 데이터베이스와 상호작용할 수 있도록 간단하고 직관적인 액티브 레코드(Active Record) 방식을 제공합니다. 각 데이터베이스 테이블에는 그에 대응하는 "모델"이 있어, 이 모델을 통해 데이터를 조회하거나 신규 레코드를 추가할 수 있습니다.

<a name="the-notifications-directory"></a>
### Notifications 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `make:notification` 아티즌 명령어를 실행하면 생성됩니다. `Notifications` 디렉터리에는 애플리케이션에서 발송하는 "트랜잭션성" [알림 클래스](/docs/11.x/notifications)가 들어 있습니다. 예를 들어, 애플리케이션 내부의 특정 이벤트 발생시 전송되는 간단한 알림 등이 여기에 해당합니다. 라라벨의 알림 기능은 이메일, Slack, SMS, 데이터베이스 저장 등 다양한 방법으로 알림을 추상화하여 전송할 수 있습니다.

<a name="the-policies-directory"></a>
### Policies 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `make:policy` 아티즌 명령어를 실행하면 생성됩니다. `Policies` 디렉터리에는 애플리케이션의 [인가 정책 클래스](/docs/11.x/authorization)가 포함됩니다. 정책(Policy)은 사용자가 특정 리소스에 대해 주어진 동작을 수행할 수 있는지 여부를 판별하는 데 사용됩니다.

<a name="the-providers-directory"></a>
### Providers 디렉터리

`Providers` 디렉터리에는 애플리케이션의 모든 [서비스 프로바이더](/docs/11.x/providers)가 들어 있습니다. 서비스 프로바이더는 서비스 컨테이너에 서비스를 바인딩 하거나, 이벤트를 등록하거나, 애플리케이션이 요청을 처리할 수 있도록 준비하는 등 애플리케이션을 부트스트랩하는 역할을 합니다.

새로운 라라벨 애플리케이션을 설치하면 이 디렉터리에는 이미 `AppServiceProvider`가 포함되어 있습니다. 필요에 따라 직접 프로바이더를 추가해서 사용할 수 있습니다.

<a name="the-rules-directory"></a>
### Rules 디렉터리

이 디렉터리는 기본적으로 존재하지 않지만, `make:rule` 아티즌 명령어를 실행하면 생성됩니다. `Rules` 디렉터리에는 애플리케이션에서 사용하는 커스텀 유효성 검증 Rule 객체가 포함됩니다. Rule을 사용하면 복잡한 검증 로직을 단순한 객체에 캡슐화할 수 있습니다. 더 자세한 내용은 [유효성 검증 문서](/docs/11.x/validation)를 참고하세요.
