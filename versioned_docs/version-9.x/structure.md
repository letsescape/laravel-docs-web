# 디렉터리 구조 (Directory Structure)

- [소개](#introduction)
- [루트 디렉터리](#the-root-directory)
    - [`app` 디렉터리](#the-root-app-directory)
    - [`bootstrap` 디렉터리](#the-bootstrap-directory)
    - [`config` 디렉터리](#the-config-directory)
    - [`database` 디렉터리](#the-database-directory)
    - [`lang` 디렉터리](#the-lang-directory)
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

기본적으로 제공되는 라라벨 애플리케이션 구조는 크든 작든 다양한 프로젝트에 유용하게 활용할 수 있도록 설계되어 있습니다. 물론, 여러분이 원하는 대로 애플리케이션 구조를 자유롭게 변경해도 무방합니다. 라라벨은 클래스가 어디에 위치해야 하는지에 대해 거의 제한을 두지 않습니다. 단, Composer가 해당 클래스를 자동 로드할 수 있기만 하면 됩니다.

> [!NOTE]
> 라라벨이 처음이신가요? [Laravel 부트캠프](https://bootcamp.laravel.com)에서 직접 프레임워크를 다뤄보며 첫 라라벨 애플리케이션을 만들어보세요.

<a name="the-root-directory"></a>
## 루트 디렉터리

<a name="the-root-app-directory"></a>
#### app 디렉터리

`app` 디렉터리에는 애플리케이션의 핵심 코드가 들어 있습니다. 이 디렉터리에 대해 곧 더 자세히 살펴보겠지만, 애플리케이션 내 거의 모든 클래스는 이곳에 위치하게 됩니다.

<a name="the-bootstrap-directory"></a>
#### bootstrap 디렉터리

`bootstrap` 디렉터리에는 프레임워크를 부트스트랩(초기화)하는 `app.php` 파일이 들어 있습니다. 또한, 이 디렉터리에는 프레임워크가 생성하는 다양한 캐시 파일(예: 라우트 및 서비스 관련 캐시 파일 등)을 저장하는 `cache` 디렉터리도 포함되어 있습니다. 성능 최적화를 위한 용도이기 때문에, 일반적으로 이 디렉터리 내 파일을 직접 수정할 필요는 없습니다.

<a name="the-config-directory"></a>
#### config 디렉터리

`config` 디렉터리에는 이름에서 알 수 있듯이 애플리케이션의 모든 설정 파일이 모여 있습니다. 이 설정 파일들을 한 번쯤 쭉 읽어보고 어떤 옵션들이 있는지 파악해두는 게 좋습니다.

<a name="the-database-directory"></a>
#### database 디렉터리

`database` 디렉터리에는 데이터베이스 마이그레이션, 모델 팩토리, 시드 파일이 들어 있습니다. 또한, 필요하다면 이 디렉터리에 SQLite 데이터베이스 파일을 저장해서 사용할 수도 있습니다.

<a name="the-lang-directory"></a>
#### lang 디렉터리

`lang` 디렉터리는 애플리케이션의 모든 다국어(언어) 파일을 담고 있습니다.

<a name="the-public-directory"></a>
#### public 디렉터리

`public` 디렉터리에는 모든 요청이 들어오는 진입점인 `index.php` 파일이 존재하며, 자동 로딩을 설정해줍니다. 또한 이 디렉터리에는 이미지, JavaScript, CSS 등 정적 리소스 파일들이 함께 위치합니다.

<a name="the-resources-directory"></a>
#### resources 디렉터리

`resources` 디렉터리에는 [뷰 파일](/docs/9.x/views)과 CSS, JavaScript 등 컴파일되지 않은 원본 에셋이 들어 있습니다.

<a name="the-routes-directory"></a>
#### routes 디렉터리

`routes` 디렉터리에는 애플리케이션의 모든 라우트 정의 파일들이 들어 있습니다. 라라벨에서는 기본적으로 `web.php`, `api.php`, `console.php`, `channels.php` 등 여러 라우트 파일이 제공됩니다.

`web.php` 파일에는 `RouteServiceProvider`가 `web` 미들웨어 그룹에 포함시키는 라우트들이 정의되어 있습니다. 이 그룹은 세션 상태, CSRF 보호, 쿠키 암호화 기능을 제공합니다. 애플리케이션에서 stateless RESTful API를 제공하지 않는다면, 대부분의 라우트는 이 `web.php` 파일에 정의하게 됩니다.

`api.php` 파일에는 `RouteServiceProvider`가 `api` 미들웨어 그룹에 배치하는 라우트가 들어 있습니다. 이 라우트들은 상태를 저장하지 않는 용도로 설계되어 있기 때문에, 토큰을 통한 [인증](/docs/9.x/sanctum)이 필요하며 세션 상태에는 접근할 수 없습니다.

`console.php` 파일에서는 클로저(익명 함수) 형태의 콘솔 명령어들을 정의할 수 있습니다. 각 클로저는 명령어 인스턴스에 바인딩되므로, 명령어의 IO 관련 메서드와 쉽게 상호작용할 수 있습니다. 이 파일은 HTTP 라우트가 아니라 애플리케이션에 대한 콘솔 기반의 진입점(라우트) 역할을 합니다.

`channels.php` 파일에서는 애플리케이션이 지원하는 [이벤트 브로드캐스팅](/docs/9.x/broadcasting) 채널들을 등록할 수 있습니다.

<a name="the-storage-directory"></a>
#### storage 디렉터리

`storage` 디렉터리에는 로그, 컴파일된 Blade 템플릿, 파일 기반 세션, 파일 캐시, 기타 프레임워크에서 생성되는 여러 파일이 저장됩니다. 이 디렉터리는 `app`, `framework`, `logs` 3가지 하위 디렉터리로 구분됩니다. `app` 폴더에는 애플리케이션에서 자체적으로 생성한 파일을 저장할 수 있습니다. `framework` 폴더는 프레임워크에서 생성한 파일 및 캐시 용도입니다. 마지막으로 `logs` 폴더에는 애플리케이션의 로그 파일이 저장됩니다.

`storage/app/public` 디렉터리에는 프로필 아바타와 같이 사용자들이 직접 업로드한 공개 파일을 저장할 수 있습니다. 이 디렉터리에 접근할 수 있도록 `public/storage`에 심볼릭 링크를 생성해야 합니다. 해당 링크는 `php artisan storage:link` Artisan 명령어로 만들 수 있습니다.

<a name="the-tests-directory"></a>
#### tests 디렉터리

`tests` 디렉터리에는 자동화 테스트가 들어 있습니다. [PHPUnit](https://phpunit.de/)의 단위 테스트와 기능 테스트 예제가 기본적으로 제공됩니다. 각 테스트 클래스는 반드시 `Test`로 끝나는 이름을 사용해야 합니다. 테스트는 `phpunit` 또는 `php vendor/bin/phpunit` 명령어로 실행할 수도 있고, 좀 더 아름답고 자세한 테스트 결과를 보려면 `php artisan test` Artisan 명령어를 사용할 수도 있습니다.

<a name="the-vendor-directory"></a>
#### vendor 디렉터리

`vendor` 디렉터리에는 [Composer](https://getcomposer.org)로 설치한 모든 의존성 패키지들이 저장됩니다.

<a name="the-app-directory"></a>
## App 디렉터리

애플리케이션의 대부분은 `app` 디렉터리 안에 구현되어 있습니다. 기본적으로 이 디렉터리는 `App` 네임스페이스로 묶여 있으며, [PSR-4 자동 로딩 표준](https://www.php-fig.org/psr/psr-4/)을 통해 Composer에서 자동으로 로드됩니다.

`app` 디렉터리에는 `Console`, `Http`, `Providers` 등 다양한 하위 디렉터리가 포함되어 있습니다. 이 중 `Console`과 `Http` 디렉터리는 각각 애플리케이션의 핵심과 상호작용할 수 있도록 API를 제공하는 역할을 합니다. HTTP 프로토콜과 CLI는 모두 애플리케이션과 상호작용할 수 있는 방식일 뿐, 실제 비즈니스 로직을 포함하고 있지는 않습니다. 정리하자면, 이 두 개는 애플리케이션에 명령을 전달하는 서로 다른 방법일 뿐입니다. `Console` 디렉터리에는 모든 Artisan 명령어가, `Http` 디렉터리에는 컨트롤러, 미들웨어, 요청(Request) 관련 클래스가 들어 있습니다.

또한, `make` Artisan 명령어로 클래스를 생성할 때마다 `app` 안에 다양한 하위 디렉터리가 추가로 만들어집니다. 예를 들면, `app/Jobs` 디렉터리는 실제로 `make:job` Artisan 명령어로 Job 클래스를 생성하기 전까지는 존재하지 않습니다.

> [!NOTE]
> `app` 디렉터리 내의 많은 클래스들은 Artisan 명령어로 자동 생성할 수 있습니다. 사용 가능한 명령어 목록은 터미널에서 `php artisan list make` 명령어를 실행하여 확인해보세요.

<a name="the-broadcasting-directory"></a>
#### Broadcasting 디렉터리

`Broadcasting` 디렉터리에는 애플리케이션의 모든 브로드캐스트 채널 클래스가 들어 있습니다. 이 클래스들은 `make:channel` 명령어로 생성됩니다. 이 디렉터리는 기본적으로 존재하지 않으며, 첫 채널을 만들 때 자동으로 생성됩니다. 채널에 관한 더 많은 내용은 [이벤트 브로드캐스팅](/docs/9.x/broadcasting) 문서를 참고하세요.

<a name="the-console-directory"></a>
#### Console 디렉터리

`Console` 디렉터리에는 애플리케이션의 커스텀 Artisan 명령어가 모두 들어 있습니다. 이러한 명령어는 `make:command` 명령어로 생성할 수 있습니다. 또한 이 디렉터리에는 콘솔 커널이 포함되어 있는데, 콘솔 커널에서는 커스텀 Artisan 명령어를 등록하거나 [스케줄 작업](/docs/9.x/scheduling)을 정의하게 됩니다.

<a name="the-events-directory"></a>
#### Events 디렉터리

이 디렉터리는 기본적으로 존재하지 않으며, `event:generate` 또는 `make:event` Artisan 명령어를 실행하면 생성됩니다. `Events` 디렉터리에는 [이벤트 클래스](/docs/9.x/events)가 들어 있습니다. 이벤트는 특정 동작이 발생했음을 애플리케이션의 다른 부분에 알리는 역할을 하며, 유연하고 결합도가 낮은 구조를 만들 수 있도록 도와줍니다.

<a name="the-exceptions-directory"></a>
#### Exceptions 디렉터리

`Exceptions` 디렉터리에는 애플리케이션의 예외(Exception) 핸들러가 저장되어 있으며, 애플리케이션에서 발생하는 예외 클래스도 이곳에 두는 것이 좋습니다. 예외가 로깅되거나 렌더링되는 방식을 커스터마이징하고 싶을 때는 이 디렉터리의 `Handler` 클래스를 수정하면 됩니다.

<a name="the-http-directory"></a>
#### Http 디렉터리

`Http` 디렉터리에는 컨트롤러, 미들웨어, 폼 요청(Request) 클래스가 들어 있습니다. 들어오는 요청을 처리하는 주요 로직은 대부분 이 디렉터리에 작성하게 됩니다.

<a name="the-jobs-directory"></a>
#### Jobs 디렉터리

이 디렉터리는 기본적으로 존재하지 않으며, `make:job` Artisan 명령어를 실행해야 생성됩니다. `Jobs` 디렉터리에는 애플리케이션의 [큐잉이 가능한 Job 클래스](/docs/9.x/queues)가 들어 있습니다. Job은 애플리케이션에서 큐에 등록해서 비동기로 실행하거나, 현재 요청의 라이프사이클 내에서 동기적으로 실행할 수 있습니다. 이렇게 동기적으로 실행되는 Job을 "커맨드"(command, 명령 패턴 구현)라고도 부르기도 합니다. ([커맨드 패턴 참고](https://en.wikipedia.org/wiki/Command_pattern))

<a name="the-listeners-directory"></a>
#### Listeners 디렉터리

이 디렉터리는 기본적으로 존재하지 않으며, `event:generate` 또는 `make:listener` Artisan 명령어를 실행하면 생성됩니다. `Listeners` 디렉터리에는 [이벤트](/docs/9.x/events)를 처리하는 클래스들이 들어 있습니다. 이벤트 리스너는 이벤트 인스턴스를 받아서, 해당 이벤트가 발생했을 때 수행할 로직을 실행합니다. 예를 들어, `UserRegistered` 이벤트가 발생하면 `SendWelcomeEmail` 리스너에서 환영 이메일을 보내는 식으로 동작할 수 있습니다.

<a name="the-mail-directory"></a>
#### Mail 디렉터리

이 디렉터리는 기본적으로 존재하지 않으며, `make:mail` Artisan 명령어를 실행하면 생성됩니다. `Mail` 디렉터리에는 애플리케이션에서 전송하는 [메일 클래스](/docs/9.x/mail)가 들어 있습니다. 메일 객체를 사용하면 복잡한 이메일 전송 로직을 하나의 단순한 클래스로 캡슐화할 수 있으며, `Mail::send` 메서드를 통해 보낼 수 있습니다.

<a name="the-models-directory"></a>
#### Models 디렉터리

`Models` 디렉터리에는 [Eloquent 모델 클래스](/docs/9.x/eloquent)가 들어 있습니다. 라라벨에 포함된 Eloquent ORM은 데이터베이스 작업을 위한 간단하면서도 강력한 ActiveRecord 구현체를 제공합니다. 각 데이터베이스 테이블마다 연관된 "모델" 클래스가 있으며, 이 모델을 통해 해당 테이블의 데이터를 조회하거나 새로운 레코드를 추가할 수 있습니다.

<a name="the-notifications-directory"></a>
#### Notifications 디렉터리

이 디렉터리는 기본적으로 존재하지 않으며, `make:notification` Artisan 명령어를 실행하면 생성됩니다. `Notifications` 디렉터리에는 애플리케이션에서 발생한 여러 이벤트에 대한 간단한 알림 등 "트랜잭션성" [알림](/docs/9.x/notifications) 클래스들이 들어 있습니다. 라라벨의 알림 기능은 이메일, Slack, SMS, 데이터베이스 저장 등 다양한 드라이버를 추상화하여, 여러 방식으로 알림을 보낼 수 있도록 도와줍니다.

<a name="the-policies-directory"></a>
#### Policies 디렉터리

이 디렉터리는 기본적으로 존재하지 않으며, `make:policy` Artisan 명령어를 실행하면 생성됩니다. `Policies` 디렉터리에는 애플리케이션의 [인가 정책 클래스](/docs/9.x/authorization)가 들어 있습니다. 정책(Policy)은 사용자가 특정 리소스에 대해 어떤 액션을 할 수 있는지 판단하는 데 사용합니다.

<a name="the-providers-directory"></a>
#### Providers 디렉터리

`Providers` 디렉터리에는 애플리케이션의 모든 [서비스 프로바이더](/docs/9.x/providers)가 모여 있습니다. 서비스 프로바이더는 서비스 컨테이너에 서비스 바인딩, 이벤트 등록, 그 외 다양한 방식으로 애플리케이션을 부트스트랩(초기화)합니다.

새로운 라라벨 애플리케이션을 만들면 이 디렉터리에 이미 몇 가지 서비스 프로바이더가 포함되어 있습니다. 여러분도 필요에 따라 이 디렉터리에 직접 프로바이더를 추가할 수 있습니다.

<a name="the-rules-directory"></a>
#### Rules 디렉터리

이 디렉터리는 기본적으로 존재하지 않으며, `make:rule` Artisan 명령어를 실행하면 생성됩니다. `Rules` 디렉터리에는 애플리케이션에서 사용하는 커스텀 유효성 검증 규칙 객체가 들어 있습니다. 규칙 클래스는 복잡한 유효성 검증 로직을 하나의 간단한 객체로 분리하여 구현할 수 있습니다. 자세한 내용은 [유효성 검증 문서](/docs/9.x/validation)를 참고하세요.
