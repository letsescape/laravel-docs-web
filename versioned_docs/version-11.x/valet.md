# 라라벨 발렛 (Laravel Valet)

- [소개](#introduction)
- [설치](#installation)
    - [Valet 업그레이드](#upgrading-valet)
- [사이트 제공하기](#serving-sites)
    - [`park` 명령어](#the-park-command)
    - [`link` 명령어](#the-link-command)
    - [TLS로 사이트 보안 적용하기](#securing-sites)
    - [기본 사이트 제공](#serving-a-default-site)
    - [사이트별 PHP 버전 지정](#per-site-php-versions)
- [사이트 공유하기](#sharing-sites)
    - [로컬 네트워크에서 사이트 공유](#sharing-sites-on-your-local-network)
- [사이트별 환경 변수](#site-specific-environment-variables)
- [서비스 프록시 설정](#proxying-services)
- [사용자 정의 Valet 드라이버](#custom-valet-drivers)
    - [로컬 드라이버](#local-drivers)
- [기타 Valet 명령어](#other-valet-commands)
- [Valet 디렉터리 및 파일](#valet-directories-and-files)
    - [디스크 접근 권한](#disk-access)

<a name="introduction"></a>
## 소개

> [!NOTE]  
> macOS나 Windows에서 라라벨 애플리케이션을 더 쉽게 개발하고 싶으신가요? [Laravel Herd](https://herd.laravel.com)를 확인해보세요. Herd는 Valet, PHP, Composer 등 라라벨 개발에 필요한 모든 것을 한 번에 제공합니다.

[Laravel Valet](https://github.com/laravel/valet)은 macOS 환경에서 최소한의 설정만으로 사용할 수 있는 개발 환경입니다. 라라벨 Valet는 Mac이 부팅될 때마다 백그라운드에서 [Nginx](https://www.nginx.com/)가 항상 실행되도록 설정합니다. 그리고, [DnsMasq](https://en.wikipedia.org/wiki/Dnsmasq)를 이용해 `*.test` 도메인으로 오는 모든 요청을 로컬에 설치된 사이트로 프록시합니다.

즉, Valet는 약 7MB의 RAM만 사용하는 매우 빠른 라라벨 개발 환경입니다. Valet는 [Sail](/docs/11.x/sail)이나 [Homestead](/docs/11.x/homestead)의 완전한 대체품은 아니지만, 기본 기능이 유연하고, 매우 빠른 속도가 필요하거나 램이 제한된 컴퓨터에서 개발하고자 할 때 훌륭한 대안이 될 수 있습니다.

Valet는 기본적으로 다음과 같은 다양한 프레임워크와 CMS를 지원합니다. 이 목록에 국한되지 않고 추가로 확장할 수 있습니다.



<div id="valet-support" markdown="1">

- [Laravel](https://laravel.com)
- [Bedrock](https://roots.io/bedrock/)
- [CakePHP 3](https://cakephp.org)
- [ConcreteCMS](https://www.concretecms.com/)
- [Contao](https://contao.org/en/)
- [Craft](https://craftcms.com)
- [Drupal](https://www.drupal.org/)
- [ExpressionEngine](https://www.expressionengine.com/)
- [Jigsaw](https://jigsaw.tighten.co)
- [Joomla](https://www.joomla.org/)
- [Katana](https://github.com/themsaid/katana)
- [Kirby](https://getkirby.com/)
- [Magento](https://magento.com/)
- [OctoberCMS](https://octobercms.com/)
- [Sculpin](https://sculpin.io/)
- [Slim](https://www.slimframework.com)
- [Statamic](https://statamic.com)
- 정적 HTML
- [Symfony](https://symfony.com)
- [WordPress](https://wordpress.org)
- [Zend](https://framework.zend.com)

</div>

또한, [사용자 정의 드라이버](#custom-valet-drivers)를 직접 만들어 Valet를 확장할 수도 있습니다.

<a name="installation"></a>
## 설치

> [!WARNING]  
> Valet는 macOS와 [Homebrew](https://brew.sh/)가 필요합니다. 설치 전에 Apache나 Nginx와 같이 80번 포트를 사용하는 다른 프로그램이 실행되고 있지 않은지 반드시 확인하세요.

먼저 Homebrew의 최신 상태를 `update` 명령어로 확인합니다.

```shell
brew update
```

그다음 Homebrew를 사용해 PHP를 설치합니다.

```shell
brew install php
```

PHP 설치가 끝났다면, 이제 [Composer 패키지 매니저](https://getcomposer.org)를 설치할 준비가 된 것입니다. 추가로, `$HOME/.composer/vendor/bin` 디렉터리가 시스템 "PATH"에 포함되어 있는지 확인해야 합니다. Composer를 설치한 후에는, Laravel Valet를 전역 Composer 패키지로 설치할 수 있습니다.

```shell
composer global require laravel/valet
```

마지막으로, Valet의 `install` 명령어를 실행하세요. 이 명령어는 Valet와 DnsMasq의 설정과 설치를 자동으로 진행해줍니다. 또한, Valet가 의존하는 데몬들이 시스템 부팅 시 자동으로 실행될 수 있도록 설정해줍니다.

```shell
valet install
```

설치가 완료되면, 터미널에서 `ping foobar.test` 같은 명령어로 `*.test` 도메인이 응답하는지 확인해보세요. Valet가 올바르게 설치되었다면, 해당 도메인이 `127.0.0.1`로 응답하는 것을 볼 수 있습니다.

Valet는 매번 부팅될 때마다 필요한 서비스들을 자동으로 시작합니다.

<a name="php-versions"></a>
#### PHP 버전

> [!NOTE]  
> PHP의 전체 글로벌 버전을 바꾸지 않고, [명령어](#per-site-php-versions) `isolate`를 통해 사이트별 PHP 버전을 지정할 수 있습니다.

Valet는 `valet use php@version` 명령어로 PHP 버전을 전환할 수 있습니다. 아직 설치되지 않은 특정 PHP 버전은 Homebrew를 통해 자동으로 설치됩니다.

```shell
valet use php@8.2

valet use php
```

프로젝트 루트에 `.valetrc` 파일을 생성해, 해당 사이트에서 사용할 PHP 버전을 명시할 수도 있습니다.

```shell
php=php@8.2
```

이 파일이 만들어지면, `valet use` 명령어를 실행하면 Valet가 파일을 읽어 최적의 PHP 버전을 자동으로 적용해줍니다.

> [!WARNING]  
> 여러 PHP 버전이 설치되어 있더라도 Valet는 한 번에 하나의 PHP 버전만 제공합니다.

<a name="database"></a>
#### 데이터베이스

애플리케이션에서 데이터베이스가 필요하다면 [DBngin](https://dbngin.com)을 추천합니다. MySQL, PostgreSQL, Redis 등 여러 데이터베이스를 포함한 무료 통합 데이터베이스 관리 도구입니다. DBngin 설치 후에는 `127.0.0.1`에서 접속할 수 있고, 사용자명은 `root`, 비밀번호는 빈 문자열을 사용하면 됩니다.

<a name="resetting-your-installation"></a>
#### 설치 재설정

Valet 설치가 제대로 동작하지 않을 때는, `composer global require laravel/valet` 명령어를 실행한 뒤, `valet install`을 다시 실행해 설치를 초기화하세요. 간혹 문제가 계속된다면, `valet uninstall --force` 명령어로 완전히 제거한 뒤, `valet install`을 다시 실행하는 것이 필요할 수 있습니다.

<a name="upgrading-valet"></a>
### Valet 업그레이드

터미널에서 `composer global require laravel/valet` 명령어를 실행하여 Valet를 최신 버전으로 업데이트할 수 있습니다. 업그레이드 후에는, 필요한 경우 설정 파일 추가 업그레이드를 적용하기 위해 `valet install` 명령어를 실행하는 것이 좋습니다.

<a name="upgrading-to-valet-4"></a>
#### Valet 4로 업그레이드

Valet 3에서 Valet 4로 업그레이드하려면 아래 단계를 순서대로 진행하세요.

<div class="content-list" markdown="1">

- 사이트별 PHP 버전을 커스터마이즈하기 위해 `.valetphprc` 파일을 사용했다면, 이 파일의 이름을 `.valetrc`로 변경합니다. 그리고 `.valetrc` 파일의 기존 내용 앞에 `php=`를 붙여줍니다.
- 기존 커스텀 드라이버가 있다면 새로운 드라이버 시스템의 네임스페이스, 확장자, 타입힌트, 반환 타입힌트 방식에 맞게 업데이트해야 합니다. 예시는 Valet의 [SampleValetDriver](https://github.com/laravel/valet/blob/d7787c025e60abc24a5195dc7d4c5c6f2d984339/cli/stubs/SampleValetDriver.php)에서 참고할 수 있습니다.
- PHP 7.1~7.4 버전으로 사이트를 운영 중이라면, 여전히 Homebrew를 통해 PHP 8.0 이상의 버전을 설치해야 합니다. Valet는 본인의 주요 PHP 버전이 아니더라도 이 버전을 사용해 일부 스크립트를 실행하니 꼭 설치해두어야 합니다.

</div>

<a name="serving-sites"></a>
## 사이트 제공하기

Valet를 설치했다면 라라벨 애플리케이션 제공을 바로 시작할 수 있습니다. Valet는 애플리케이션 제공을 돕기 위해 `park`와 `link` 두 가지 명령어를 제공합니다.

<a name="the-park-command"></a>
### `park` 명령어

`park` 명령어는 여러분의 애플리케이션이 포함된 디렉터리를 등록합니다. 해당 디렉터리를 Valet에 "park"하면, 그 디렉터리 안에 있는 모든 하위 디렉터리가 웹 브라우저에서 `http://<디렉터리이름>.test` 형식으로 접근할 수 있습니다.

```shell
cd ~/Sites

valet park
```

이제 "park"된 디렉터리 내부에 애플리케이션을 새로 만들면, 해당 애플리케이션은 자동으로 `http://<디렉터리이름>.test` 규칙을 따라 제공됩니다. 예를 들어, park 디렉터리에 "laravel"이라는 폴더가 있으면, 그 안의 애플리케이션은 `http://laravel.test`에서 접근할 수 있습니다. 추가로, Valet는 와일드카드 서브도메인(`http://foo.laravel.test`)으로도 사이트 접근을 허용합니다.

<a name="the-link-command"></a>
### `link` 명령어

`link` 명령어는 라라벨 애플리케이션을 제공하는 또 다른 방법으로, 특정 디렉터리 내 단일 사이트만 제공할 때 유용합니다.

```shell
cd ~/Sites/laravel

valet link
```

`link` 명령어로 애플리케이션을 등록하면, 해당 디렉터리 이름을 사용해 접속할 수 있습니다. 위의 예시에서는 `http://laravel.test` 주소로 접속할 수 있습니다. 역시 Valet는 와일드카드 서브 도메인(`http://foo.laravel.test`)도 지원합니다.

다른 호스트명으로 사이트를 제공하고 싶다면, `link` 명령어에 원하는 호스트명을 함께 지정하면 됩니다. 예를 들어, `http://application.test`로 제공하려면 다음과 같이 실행합니다.

```shell
cd ~/Sites/laravel

valet link application
```

물론, `link` 명령어를 이용해 서브도메인 형태로 사이트를 제공할 수도 있습니다.

```shell
valet link api.application
```

`links` 명령어를 실행하면 현재 링크된 모든 디렉터리 목록을 확인할 수 있습니다.

```shell
valet links
```

특정 사이트의 심볼릭 링크를 삭제하려면 `unlink` 명령어를 사용하세요.

```shell
cd ~/Sites/laravel

valet unlink
```

<a name="securing-sites"></a>
### TLS로 사이트 보안 적용하기

Valet는 기본적으로 사이트를 HTTP로 제공합니다. 그러나, HTTPS(HTTP/2로 암호화된 TLS)를 적용하고 싶다면 `secure` 명령어를 사용하면 됩니다. 예를 들어, `laravel.test` 도메인을 Valet에서 제공 중이라면 다음과 같이 실행해 보안 설정을 적용할 수 있습니다.

```shell
valet secure laravel
```

사이트에 적용된 보안을 해제하고 일반 HTTP로 다시 제공하려면 `unsecure` 명령어를 사용합니다. 이 명령어 역시 보안을 해제할 도메인명을 인자로 받습니다.

```shell
valet unsecure laravel
```

<a name="serving-a-default-site"></a>
### 기본 사이트 제공

알 수 없는 `test` 도메인에 접속할 때 `404` 대신 특정 "기본 사이트"를 제공하고 싶을 때가 있습니다. 이럴 경우, `~/.config/valet/config.json` 설정 파일의 `default` 옵션에 기본 사이트로 사용할 경로를 추가하면 됩니다.

```
"default": "/Users/Sally/Sites/example-site",
```

<a name="per-site-php-versions"></a>
### 사이트별 PHP 버전 지정

Valet는 디폴트로 시스템 전체에 설치된 글로벌 PHP를 사용하지만, 여러 사이트마다 서로 다른 PHP 버전을 사용해야 할 경우 `isolate` 명령어로 사이트별 PHP 버전을 지정할 수 있습니다. 이 명령어는 현재 디렉터리에 위치한 사이트에 대해 원하는 PHP 버전을 설정해줍니다.

```shell
cd ~/Sites/example-site

valet isolate php@8.0
```

사이트 이름이 디렉터리 이름과 다를 경우, `--site` 옵션으로 명시할 수 있습니다.

```shell
valet isolate php@8.0 --site="site-name"
```

편의상 `valet php`, `composer`, `which-php` 명령어를 사용하면, 사이트에 설정된 PHP 버전에 맞춰 CLI 명령을 프록시해줍니다.

```shell
valet php
valet composer
valet which-php
```

`isolated` 명령어를 실행하면 PHP 버전이 격리(isolate)된 모든 사이트 목록과 설정된 PHP 버전을 확인할 수 있습니다.

```shell
valet isolated
```

사이트를 다시 Valet의 글로벌 PHP 버전으로 되돌리려면, 사이트 루트에서 `unisolate` 명령어를 실행하면 됩니다.

```shell
valet unisolate
```

<a name="sharing-sites"></a>
## 사이트 공유하기

Valet는 여러분의 로컬 사이트를 외부에 손쉽게 공유할 수 있도록 도와주는 명령어를 제공합니다. 이를 통해 모바일 기기에서 테스트하거나, 팀원 또는 클라이언트에게 쉽게 사이트를 공유할 수 있습니다.

Valet는 기본적으로 ngrok 또는 Expose를 통해 사이트 공유를 지원합니다. 공유를 시작하기 전, `share-tool` 명령어로 사용할 도구를 `ngrok` 또는 `expose`로 지정해야 합니다.

```shell
valet share-tool ngrok
```

선택한 도구가 (ngrok은 Homebrew로, Expose는 Composer로) 설치되지 않았다면 Valet가 자동으로 설치 안내를 합니다. 두 도구 모두 사이트 공유를 시작하기 전에 자신의 계정 인증이 필요합니다.

사이트를 공유하려면, 터미널에서 사이트 디렉터리로 이동한 다음 Valet의 `share` 명령어를 실행하세요. 그러면 손쉽게 사용할 수 있는 공개 URL이 클립보드에 복사되며, 브라우저에 붙여넣거나 팀원에게 제공할 수 있습니다.

```shell
cd ~/Sites/laravel

valet share
```

사이트 공유를 중지하려면 `Control + C`를 누르면 됩니다.

> [!WARNING]  
> 커스텀 DNS 서버(`1.1.1.1` 등)를 사용 중이면 ngrok 공유가 제대로 작동하지 않을 수 있습니다. 이 경우, Mac 시스템 설정의 네트워크 > 고급 설정 > DNS 탭에서 DNS 서버 1순위로 `127.0.0.1`을 추가해 주세요.

<a name="sharing-sites-via-ngrok"></a>
#### ngrok을 통한 사이트 공유

ngrok로 사이트를 공유하려면 [ngrok 계정 생성](https://dashboard.ngrok.com/signup) 및 [인증 토큰 설정](https://dashboard.ngrok.com/get-started/your-authtoken)이 필요합니다. 토큰을 발급받았다면, 아래와 같이 Valet 설정에 토큰을 적용하세요.

```shell
valet set-ngrok-token YOUR_TOKEN_HERE
```

> [!NOTE]  
> `valet share --region=eu` 등과 같이 추가적인 ngrok 파라미터를 전달할 수도 있습니다. 자세한 내용은 [ngrok 공식 문서](https://ngrok.com/docs)를 참조하세요.

<a name="sharing-sites-via-expose"></a>
#### Expose를 통한 사이트 공유

Expose로 사이트를 공유하려면 [Expose 계정 생성](https://expose.dev/register) 및 [인증 토큰 등록 절차](https://expose.dev/docs/getting-started/getting-your-token)가 필요합니다.

추가 명령행 옵션 등 자세한 정보는 [Expose 공식 문서](https://expose.dev/docs)를 참고하세요.

<a name="sharing-sites-on-your-local-network"></a>
### 로컬 네트워크에서 사이트 공유

Valet는 개발 머신이 인터넷으로부터 보안 위험에 노출되지 않도록, 기본적으로 `127.0.0.1` 내부 인터페이스로 들어오는 트래픽만 허용합니다.

그러나, 같은 로컬 네트워크에 연결된 다른 기기(예: `192.168.1.10/application.test`)에서 Valet 사이트에 접근하게 하려면, 해당 사이트의 Nginx 설정 파일에서 `listen` 디렉티브에 있는 `127.0.0.1:` 접두어를 제거해야 합니다. 이는 80과 443 포트 모두에 적용됩니다.

`valet secure`를 실행하지 않은 일반 HTTP 기반 사이트의 경우 `/usr/local/etc/nginx/valet/valet.conf` 파일에서 설정을 수정하세요. 만약 특정 사이트에 `valet secure`를 적용하여 HTTPS로 제공 중이라면, `~/.config/valet/Nginx/app-name.test` 파일을 수정해야 합니다.

Nginx 설정을 변경한 뒤에는 `valet restart` 명령어로 변경사항을 적용합니다.

<a name="site-specific-environment-variables"></a>
## 사이트별 환경 변수

다른 프레임워크를 사용하는 일부 애플리케이션은 서버 환경 변수에 의존하지만, 프로젝트 내에서 환경 변수를 직접 설정하기 어려운 경우가 있습니다. 이럴 때, 프로젝트 루트에 `.valet-env.php` 파일을 추가하면 사이트별 환경 변수를 직접 지정할 수 있습니다. 이 파일은 각 사이트/환경 변수 쌍을 배열 형태로 반환해야 하며, 지정한 값들은 사이트별로 글로벌 `$_SERVER` 배열에 추가됩니다.

```
<?php

return [
    // laravel.test 사이트에 대해 $_SERVER['key']를 "value"로 설정
    'laravel' => [
        'key' => 'value',
    ],

    // 모든 사이트에 대해 $_SERVER['key']를 "value"로 설정
    '*' => [
        'key' => 'value',
    ],
];
```

<a name="proxying-services"></a>
## 서비스 프록시 설정

가끔 Valet 도메인을 로컬의 다른 서비스로 프록시하고 싶을 때가 있습니다. 예를 들어, Docker에서 별도 사이트를 실행하는 등 Valet와 Docker가 동시에 80번 포트를 사용할 수 없을 때가 해당됩니다.

이럴 땐, `proxy` 명령어를 사용해 프록시를 생성할 수 있습니다. 예를 들면, `http://elasticsearch.test`로 오는 모든 트래픽을 `http://127.0.0.1:9200`으로 프록시할 수 있습니다.

```shell
# HTTP로 프록시
valet proxy elasticsearch http://127.0.0.1:9200

# TLS + HTTP/2로 프록시
valet proxy elasticsearch http://127.0.0.1:9200 --secure
```

프록시를 삭제하려면 `unproxy` 명령어를 사용합니다.

```shell
valet unproxy elasticsearch
```

`proxies` 명령어를 실행하면 현재 프록시 설정된 모든 사이트 목록을 볼 수 있습니다.

```shell
valet proxies
```

<a name="custom-valet-drivers"></a>
## 사용자 정의 Valet 드라이버

Valet에서 기본적으로 지원하지 않는 프레임워크나 CMS(콘텐츠 관리 시스템)용 PHP 애플리케이션을 제공하고자 할 때, 직접 Valet "드라이버"를 만들 수 있습니다. Valet를 설치하면 `~/.config/valet/Drivers` 디렉터리가 생성되며, 여기에 예시 구현이 담긴 `SampleValetDriver.php` 파일이 있습니다. 사용자 정의 드라이버는 크게 세 가지 메서드만 구현하면 됩니다: `serves`, `isStaticFile`, `frontControllerPath`.

이 세 메서드 모두 `$sitePath`, `$siteName`, `$uri` 값을 인수로 받습니다. `$sitePath`는 시스템 내 제공될 사이트의 전체 경로(예: `/Users/Lisa/Sites/my-project`), `$siteName`은 도메인의 "호스트"/"사이트명" 부분(`my-project`), `$uri`는 요청 URI(`/foo/bar`)입니다.

커스텀 드라이버를 완성했다면 해당 PHP 파일을 `~/.config/valet/Drivers` 디렉터리에 `FrameworkValetDriver.php` 형식의 파일명으로 저장하세요. 예를 들어, 워드프레스를 위한 드라이버라면 `WordPressValetDriver.php`로 저장해야 합니다.

이제 각 메서드별로 어떻게 구현할 수 있는지 살펴보겠습니다.

<a name="the-serves-method"></a>
#### `serves` 메서드

`serves` 메서드는 드라이버가 해당 요청을 직접 처리할지 여부를 판단해 `true` 또는 `false`를 반환합니다. 즉, 이 메서드에서 주어진 `$sitePath`가 해당 타입의 프로젝트를 포함하고 있는지를 판별해야 합니다.

예시로, `WordPressValetDriver`를 만든다고 가정할 때, `serves` 메서드는 다음과 같이 작성할 수 있습니다.

```
/**
 * 드라이버가 해당 요청을 처리하는지 여부를 결정합니다.
 */
public function serves(string $sitePath, string $siteName, string $uri): bool
{
    return is_dir($sitePath.'/wp-admin');
}
```

<a name="the-isstaticfile-method"></a>
#### `isStaticFile` 메서드

`isStaticFile`은 요청이 이미지나 스타일시트 같은 "정적" 파일인지 확인해야 합니다. 정적 파일이라면 디스크 상의 전체 파일 경로를 반환하고, 아니라면 `false`를 반환합니다.

```
/**
 * 요청이 정적 파일을 위한 것인지 판단합니다.
 *
 * @return string|false
 */
public function isStaticFile(string $sitePath, string $siteName, string $uri)
{
    if (file_exists($staticFilePath = $sitePath.'/public/'.$uri)) {
        return $staticFilePath;
    }

    return false;
}
```

> [!WARNING]  
> `isStaticFile` 메서드는 반드시 `serves` 메서드가 `true`를 반환하고, 요청 URI가 `/`가 아닐 경우에만 호출됩니다.

<a name="the-frontcontrollerpath-method"></a>
#### `frontControllerPath` 메서드

`frontControllerPath` 메서드는 애플리케이션의 "front controller"(일반적으로 "index.php" 파일)의 전체 경로를 반환해야 합니다.

```
/**
 * 애플리케이션의 front controller의 전체 경로를 반환합니다.
 */
public function frontControllerPath(string $sitePath, string $siteName, string $uri): string
{
    return $sitePath.'/public/index.php';
}
```

<a name="local-drivers"></a>
### 로컬 드라이버

특정 애플리케이션에만 사용할 커스텀 Valet 드라이버를 정의하고 싶다면, 애플리케이션 루트 디렉터리에 `LocalValetDriver.php` 파일을 만들면 됩니다. 이 커스텀 드라이버는 기본 `ValetDriver` 클래스를 상속하거나, `LaravelValetDriver` 등 기존 애플리케이션용 드라이버를 확장할 수 있습니다.

```
use Valet\Drivers\LaravelValetDriver;

class LocalValetDriver extends LaravelValetDriver
{
    /**
     * 드라이버가 해당 요청을 처리하는지 여부를 결정합니다.
     */
    public function serves(string $sitePath, string $siteName, string $uri): bool
    {
        return true;
    }

    /**
     * 애플리케이션의 front controller의 전체 경로를 반환합니다.
     */
    public function frontControllerPath(string $sitePath, string $siteName, string $uri): string
    {
        return $sitePath.'/public_html/index.php';
    }
}
```

<a name="other-valet-commands"></a>
## 기타 Valet 명령어

<div class="overflow-auto">

| 명령어 | 설명 |
| --- | --- |
| `valet list` | 모든 Valet 명령어 목록을 표시합니다. |
| `valet diagnose` | Valet 문제 해결을 위한 진단 정보를 출력합니다. |
| `valet directory-listing` | 디렉터리 listing 동작 방식을 결정합니다. 기본값은 "off"이며, 디렉터리에 접근시 404 페이지가 표시됩니다. |
| `valet forget` | "park"된 디렉터리 내에서 실행하면 해당 경로를 park 목록에서 제거합니다. |
| `valet log` | Valet 서비스에서 기록한 로그들을 조회합니다. |
| `valet paths` | 등록된 모든 "park" 경로를 조회합니다. |
| `valet restart` | Valet 데몬을 재시작합니다. |
| `valet start` | Valet 데몬을 시작합니다. |
| `valet stop` | Valet 데몬을 중지합니다. |
| `valet trust` | Brew와 Valet를 위한 sudoers 파일을 추가해 Valet 명령 실행 시 비밀번호 입력을 요구하지 않도록 합니다. |
| `valet uninstall` | Valet를 제거합니다. (수동 제거 방법 안내 제공) `--force` 옵션을 전달하면 Valet의 모든 리소스를 강제 삭제합니다. |

</div>

<a name="valet-directories-and-files"></a>
## Valet 디렉터리 및 파일

Valet 환경에서 문제가 발생했을 때 아래 주요 디렉터리와 파일 정보를 참고하면 도움이 됩니다.

#### `~/.config/valet`

Valet의 모든 설정 파일이 이 디렉터리에 있습니다. 중요한 설정이므로 백업을 권장합니다.

#### `~/.config/valet/dnsmasq.d/`

DnsMasq의 설정 파일이 저장되어 있습니다.

#### `~/.config/valet/Drivers/`

Valet에서 사용하는 드라이버가 담겨있는 디렉터리입니다. 각 프레임워크/CMS 제공 방식을 이곳에서 정의합니다.

#### `~/.config/valet/Nginx/`

모든 Valet Nginx 사이트 설정이 여기에 저장됩니다. `install`이나 `secure` 명령을 실행할 때마다 이 파일들이 새로 생성됩니다.

#### `~/.config/valet/Sites/`

[링크한 프로젝트](#the-link-command)에 대한 심볼릭 링크가 여기에 저장됩니다.

#### `~/.config/valet/config.json`

Valet의 주요 설정이 담긴 마스터 설정 파일입니다.

#### `~/.config/valet/valet.sock`

Valet의 Nginx 설치에서 사용하는 PHP-FPM 소켓 파일입니다. PHP가 정상 실행 중일 때만 존재합니다.

#### `~/.config/valet/Log/fpm-php.www.log`

PHP 오류에 대한 사용자 로그 파일입니다.

#### `~/.config/valet/Log/nginx-error.log`

Nginx 오류에 대한 사용자 로그 파일입니다.

#### `/usr/local/var/log/php-fpm.log`

시스템 전체 PHP-FPM 오류 로그 파일입니다.

#### `/usr/local/var/log/nginx`

Nginx의 접근 로그 및 오류 로그가 저장됩니다.

#### `/usr/local/etc/php/X.X/conf.d`

여러 PHP 설정을 위한 `*.ini` 파일이 위치한 디렉터리입니다.

#### `/usr/local/etc/php/X.X/php-fpm.d/valet-fpm.conf`

PHP-FPM 풀 설정 파일입니다.

#### `~/.composer/vendor/laravel/valet/cli/stubs/secure.valet.conf`

사이트의 SSL 인증서 생성을 위한 기본 Nginx 설정 파일입니다.

<a name="disk-access"></a>
### 디스크 접근 권한

macOS 10.14부터는 [일부 파일 및 디렉터리에 대한 접근이 기본적으로 제한됩니다](https://manuals.info.apple.com/MANUALS/1000/MA1902/en_US/apple-platform-security-guide.pdf). 데스크톱, 문서, 다운로드 폴더 등이 이에 해당하며, 네트워크 및 이동식 볼륨 접근도 제한됩니다. 따라서 Valet에서는 사이트 폴더를 이러한 보호된 위치 밖에 두는 것을 권장합니다.

만약 해당 위치에서 사이트를 제공하려면, Nginx에 "전체 디스크 접근 권한(Full Disk Access)"을 부여해야 합니다. 그렇지 않으면 Nginx가 정적 리소스를 제공하지 못하거나 서버 오류 등 예기치 못한 문제가 발생할 수 있습니다. 일반적으로 macOS에서 해당 폴더에 처음 접근할 때 권한 승인을 요청하지만, 수동으로도 설정할 수 있습니다. `시스템 환경설정` > `보안 및 개인정보 보호` > `개인정보 보호`에서 `전체 디스크 접근 권한`을 선택한 뒤, 메인 목록에서 `nginx` 항목을 활성화하세요.

