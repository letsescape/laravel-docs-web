# 라라벨 발렛 (Laravel Valet)

- [소개](#introduction)
- [설치](#installation)
    - [Valet 업그레이드](#upgrading-valet)
- [사이트 서비스](#serving-sites)
    - [`park` 명령어](#the-park-command)
    - [`link` 명령어](#the-link-command)
    - [TLS를 통한 사이트 보안 적용](#securing-sites)
    - [기본 사이트 서비스](#serving-a-default-site)
    - [사이트별 PHP 버전 지정](#per-site-php-versions)
- [사이트 공유](#sharing-sites)
    - [로컬 네트워크에서 사이트 공유](#sharing-sites-on-your-local-network)
- [사이트별 환경 변수](#site-specific-environment-variables)
- [서비스 프록시](#proxying-services)
- [커스텀 Valet 드라이버](#custom-valet-drivers)
    - [로컬 드라이버](#local-drivers)
- [기타 Valet 명령어](#other-valet-commands)
- [Valet 디렉터리 및 파일](#valet-directories-and-files)
    - [디스크 접근 권한](#disk-access)

<a name="introduction"></a>
## 소개

> [!NOTE]
> macOS에서 라라벨 애플리케이션을 더욱 쉽게 개발할 수 있는 방법을 찾고 계신가요? [Laravel Herd](https://herd.laravel.com)를 확인해 보세요. Herd에는 Valet, PHP, Composer 등 라라벨 개발을 시작하는 데 필요한 모든 요소가 포함되어 있습니다.

[Laravel Valet](https://github.com/laravel/valet)은 macOS 미니멀리스트를 위한 개발 환경입니다. Laravel Valet은 사용자의 Mac이 부팅될 때마다 백그라운드에서 항상 [Nginx](https://www.nginx.com/)가 실행되도록 설정합니다. 그리고 [DnsMasq](https://en.wikipedia.org/wiki/Dnsmasq)를 이용해, `*.test` 도메인으로 들어오는 모든 요청을 로컬 머신에 설치된 사이트로 프록시합니다.

즉, Valet은 약 7MB의 RAM만으로 동작하는 매우 빠른 라라벨 개발 환경입니다. Valet이 [Sail](/docs/10.x/sail)이나 [Homestead](/docs/10.x/homestead)를 완전히 대체하는 것은 아니지만, 최소한의 기능만 필요하거나 빠른 속도를 원하거나, 메모리가 부족한 환경에서 작업하는 경우에 뛰어난 대안이 됩니다.

Valet은 기본적으로 다음과 같은 다양한 프로젝트를 지원합니다:



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
- Static HTML
- [Symfony](https://symfony.com)
- [WordPress](https://wordpress.org)
- [Zend](https://framework.zend.com)

</div>

또한, [커스텀 드라이버](#custom-valet-drivers)를 직접 추가하여 Valet을 확장할 수도 있습니다.

<a name="installation"></a>
## 설치

> [!WARNING]
> Valet은 macOS와 [Homebrew](https://brew.sh/)를 필요로 합니다. 설치 전에 Apache나 Nginx와 같은 다른 프로그램이 로컬 머신의 80번 포트를 사용하고 있지 않은지 반드시 확인하세요.

먼저, Homebrew가 최신 버전인지 `update` 명령어로 확인해야 합니다:

```shell
brew update
```

다음으로 Homebrew를 통해 PHP를 설치합니다:

```shell
brew install php
```

PHP가 설치되면, [Composer 패키지 매니저](https://getcomposer.org)를 설치할 차례입니다. 그리고 시스템의 "PATH"에 `$HOME/.composer/vendor/bin` 디렉터리가 등록되어 있는지 확인하세요. Composer 설치가 완료되면, Laravel Valet을 글로벌 Composer 패키지로 설치할 수 있습니다:

```shell
composer global require laravel/valet
```

마지막으로, Valet의 `install` 명령어를 실행합니다. 이 명령어는 Valet과 DnsMasq를 설치 및 설정하며, Valet이 필요로 하는 데몬들이 시스템 시작 시 자동으로 실행되도록 구성합니다:

```shell
valet install
```

Valet 설치가 완료되면, 터미널에서 `ping foobar.test`와 같이 임의의 `*.test` 도메인에 핑을 시도해 보세요. 정상적으로 설치되었다면 해당 도메인이 `127.0.0.1`로 응답하는 것을 확인할 수 있습니다.

Valet은 컴퓨터가 부팅될 때마다 필요한 서비스가 자동으로 시작됩니다.

<a name="php-versions"></a>
#### PHP 버전

> [!NOTE]
> 글로벌 PHP 버전을 변경하는 대신, 각 사이트별로 PHP 버전을 지정하고 싶다면 `isolate` [명령어](#per-site-php-versions)를 사용할 수 있습니다.

Valet에서는 `valet use php@version` 명령어를 통해 PHP 버전을 전환할 수 있습니다. 지정한 PHP 버전이 Homebrew에 설치되어 있지 않다면, 자동으로 설치가 진행됩니다:

```shell
valet use php@8.1

valet use php
```

또한, 프로젝트 루트에 `.valetrc` 파일을 생성하여 사이트에서 사용할 PHP 버전을 지정할 수도 있습니다:

```shell
php=php@8.1
```

이 파일이 생성된 후에는 `valet use` 명령어만 실행해도 Valet이 해당 파일을 읽어 사이트에 알맞은 PHP 버전을 사용하도록 설정합니다.

> [!WARNING]
> Valet은 여러 PHP 버전이 설치되어 있더라도, 한 번에 한 버전의 PHP만 운영할 수 있습니다.

<a name="database"></a>
#### 데이터베이스

애플리케이션에서 데이터베이스가 필요하다면, [DBngin](https://dbngin.com)을 확인해 보세요. DBngin은 MySQL, PostgreSQL, Redis를 지원하는 무료 통합 데이터베이스 관리 도구입니다. DBngin 설치 후에는 `127.0.0.1` 주소, `root` 사용자명, 비밀번호는 빈 문자열로 데이터베이스에 연결할 수 있습니다.

<a name="resetting-your-installation"></a>
#### 설치 초기화

Valet이 제대로 실행되지 않거나 문제를 겪고 있다면, `composer global require laravel/valet` 명령어와 이어지는 `valet install` 명령어를 실행하면 설치가 초기화되어 다양한 문제가 해결될 수 있습니다. 극히 드문 경우, `valet uninstall --force`와 `valet install`을 차례로 실행하여 “하드 리셋”이 필요할 수도 있습니다.

<a name="upgrading-valet"></a>
### Valet 업그레이드

터미널에서 `composer global require laravel/valet` 명령어를 실행하면 Valet 설치를 최신 버전으로 업그레이드할 수 있습니다. 업그레이드 후, 추가적인 설정 파일 업데이트가 필요한 경우를 위해 `valet install` 명령어를 실행하는 것이 좋습니다.

<a name="upgrading-to-valet-4"></a>
#### Valet 4로 업그레이드

Valet 3에서 Valet 4로 업그레이드하는 경우, 아래 단계를 따라 올바르게 업그레이드하세요:

<div class="content-list" markdown="1">

- 사이트별 PHP 버전을 커스터마이즈하기 위해 `.valetphprc` 파일을 사용했다면, 각 파일명을 `.valetrc`로 변경하고 파일 내용의 앞에 `php=`를 추가하세요.
- 커스텀 드라이버를 사용하는 경우, 네임스페이스, 확장자, 타입 힌트, 반환값 등 새로운 드라이버 시스템에 맞게 드라이버를 업데이트하세요. Valet의 [SampleValetDriver](https://github.com/laravel/valet/blob/d7787c025e60abc24a5195dc7d4c5c6f2d984339/cli/stubs/SampleValetDriver.php)를 참고할 수 있습니다.
- PHP 7.1~7.4로 사이트를 운영 중이라면, 여전히 Homebrew를 통해 PHP 8.0 이상 버전을 설치해야 합니다. Valet은 주 연결 버전이 아니더라도, 일부 스크립트 실행에 이 버전을 사용합니다.

</div>

<a name="serving-sites"></a>
## 사이트 서비스

Valet 설치가 끝나면, 라라벨 애플리케이션을 서비스할 준비가 완료됩니다. Valet에서는 애플리케이션을 서비스하기 위해 `park`와 `link` 두 가지 명령어를 제공합니다.

<a name="the-park-command"></a>
### `park` 명령어

`park` 명령어는 사용자의 컴퓨터에 위치한 애플리케이션이 포함된 디렉터리를 등록합니다. Valet에 디렉터리를 “파킹”하면, 해당 디렉터리 내의 모든 하위 디렉터리가 웹 브라우저에서 `http://<directory-name>.test`로 접근 가능해집니다:

```shell
cd ~/Sites

valet park
```

이렇게 하면 "파킹"된 디렉터리 내에서 생성하는 모든 애플리케이션이 자동으로 `http://<directory-name>.test` 규칙에 따라 서비스됩니다. 예를 들어, 해당 디렉터리 내에 "laravel"이라는 하위 폴더가 있으면, 이 애플리케이션은 `http://laravel.test` 주소로 접근할 수 있습니다. 또한, Valet은 와일드카드 서브도메인(`http://foo.laravel.test`)을 자동으로 지원합니다.

<a name="the-link-command"></a>
### `link` 명령어

`link` 명령어도 라라벨 애플리케이션을 서비스하는 데 사용할 수 있습니다. 이 명령어는 전체 디렉터리가 아닌, 단일 사이트만 서비스하고 싶을 때 유용합니다:

```shell
cd ~/Sites/laravel

valet link
```

한 번 `link` 명령어로 애플리케이션을 등록하면, 해당 디렉터리명으로 애플리케이션에 접근할 수 있습니다. 위 예시처럼 링크된 사이트는 `http://laravel.test`로 접근 가능합니다. 마찬가지로 와일드카드 서브도메인(`http://foo.laravel.test`)도 자동으로 지원됩니다.

다른 호스트명으로 애플리케이션을 서비스하고 싶다면, `link` 명령어에 호스트명을 추가로 입력하세요. 예를 들어, `http://application.test`로 사용하려면 다음 명령어를 실행하면 됩니다:

```shell
cd ~/Sites/laravel

valet link application
```

또한, 서브도메인 형태로도 서비스를 할 수 있습니다:

```shell
valet link api.application
```

등록된 모든 링크 디렉터리는 `links` 명령어로 확인할 수 있습니다:

```shell
valet links
```

사이트의 심볼릭 링크를 제거하려면 `unlink` 명령어를 사용할 수 있습니다:

```shell
cd ~/Sites/laravel

valet unlink
```

<a name="securing-sites"></a>
### TLS를 통한 사이트 보안 적용

Valet은 기본적으로 HTTP를 통해 사이트를 서비스합니다. 그러나, 암호화된 TLS를 통한 HTTP/2 서비스를 원한다면 `secure` 명령어를 사용할 수 있습니다. 예를 들어, `laravel.test` 도메인에서 사이트를 서비스하는 경우, 다음과 같이 명령어를 실행하세요:

```shell
valet secure laravel
```

사이트의 보안 설정을 해제해 일반 HTTP로 다시 전환하려면, `unsecure` 명령어를 사용할 수 있습니다. 이 명령어에도 원하는 호스트명을 입력합니다:

```shell
valet unsecure laravel
```

<a name="serving-a-default-site"></a>
### 기본 사이트 서비스

가끔은 알 수 없는 `test` 도메인에 접속했을 때 `404` 페이지 대신 "기본" 사이트를 서비스하고 싶을 때가 있습니다. 이를 위해, `~/.config/valet/config.json` 설정 파일에 기본 사이트로 사용할 경로를 담은 `default` 옵션을 추가하면 됩니다:

```
"default": "/Users/Sally/Sites/example-site",
```

<a name="per-site-php-versions"></a>
### 사이트별 PHP 버전 지정

Valet은 기본적으로 글로벌 PHP 설정을 사용해 사이트를 서비스합니다. 그러나 다양한 사이트에서 각각 다른 PHP 버전을 사용해야 할 경우, `isolate` 명령어로 특정 사이트에 사용할 PHP 버전을 지정할 수 있습니다. 이 명령어는 현재 작업 디렉터리 내 사이트에 대해 Valet이 지정한 PHP 버전을 사용하도록 설정합니다:

```shell
cd ~/Sites/example-site

valet isolate php@8.0
```

사이트 이름이 실제 디렉터리명과 다르다면, `--site` 옵션으로 직접 사이트명을 지정할 수 있습니다:

```shell
valet isolate php@8.0 --site="site-name"
```

편의를 위해, 사이트에서 지정한 PHP 버전에 맞는 PHP CLI 도구나 툴을 프록시하는 `valet php`, `composer`, `which-php` 명령어도 활용할 수 있습니다:

```shell
valet php
valet composer
valet which-php
```

모든 격리된 사이트와 해당 PHP 버전 목록은 `isolated` 명령어로 확인할 수 있습니다:

```shell
valet isolated
```

사이트를 다시 Valet의 글로벌 PHP 버전으로 되돌리려면, 사이트 루트 디렉터리에서 `unisolate` 명령어를 실행하세요:

```shell
valet unisolate
```

<a name="sharing-sites"></a>
## 사이트 공유

Valet에는 로컬 사이트를 외부에도 쉽게 공유할 수 있는 기능이 내장되어 있습니다. 이 기능을 활용하면 모바일 기기에서 사이트를 테스트하거나 팀원, 클라이언트와 사이트를 손쉽게 공유할 수 있습니다.

Valet 기본 설정만으로도 ngrok 또는 Expose를 이용해 사이트 공유가 가능합니다. 사이트를 공유하기 전에, `share-tool` 명령어로 `ngrok` 또는 `expose` 중 원하는 도구를 지정해 Valet 설정을 갱신하세요:

```shell
valet share-tool ngrok
```

선택한 툴이 Homebrew(ngrok)나 Composer(Expose)로 설치되어 있지 않으면, Valet이 자동으로 설치하라고 안내합니다. 또한, 두 도구 모두 사이트 공유를 시작하기 전에 ngrok 또는 Expose 계정 인증이 필요합니다.

공유할 사이트의 디렉터리로 이동한 뒤, Valet의 `share` 명령어를 실행합니다. 이렇게 하면 공유용 공용 URL이 클립보드에 복사되며, 바로 브라우저나 팀원에게 전달할 수 있습니다:

```shell
cd ~/Sites/laravel

valet share
```

사이트 공유를 중단하려면 `Control + C`를 누르세요.

> [!WARNING]
> 커스텀 DNS 서버(예: `1.1.1.1`)를 사용 중이라면 ngrok 공유가 제대로 동작하지 않을 수 있습니다. 이런 경우, Mac 시스템 설정 > 네트워크 설정 > 고급 > DNS 탭에서 `127.0.0.1`을 첫 번째 DNS 서버로 추가하세요.

<a name="sharing-sites-via-ngrok"></a>
#### Ngrok을 통한 사이트 공유

ngrok으로 사이트를 공유하려면, 먼저 [ngrok 계정 생성](https://dashboard.ngrok.com/signup) 후 [인증 토큰 설정](https://dashboard.ngrok.com/get-started/your-authtoken)을 해야 합니다. 인증 토큰을 얻었다면 아래와 같이 Valet 설정에 토큰을 입력하세요:

```shell
valet set-ngrok-token YOUR_TOKEN_HERE
```

> [!NOTE]
> `valet share --region=eu` 등과 같은 추가 ngrok 파라미터를 share 명령어에 전달할 수 있습니다. 더 자세한 정보는 [ngrok 공식 문서](https://ngrok.com/docs)를 참고하세요.

<a name="sharing-sites-via-expose"></a>
#### Expose를 통한 사이트 공유

Expose로 사이트를 공유하려면, [Expose 계정 생성](https://expose.dev/register) 후 [인증 토큰으로 Expose에 인증](https://expose.dev/docs/getting-started/getting-your-token)을 해야 합니다.

또한, Expose에서 지원하는 기타 커맨드라인 파라미터 등 자세한 내용은 [Expose 공식 문서](https://expose.dev/docs)를 참고하세요.

<a name="sharing-sites-on-your-local-network"></a>
### 로컬 네트워크에서 사이트 공유

Valet은 기본적으로 외부 인터넷으로부터 개발 머신이 노출되는 보안 위험을 피하기 위해 `127.0.0.1` 인터페이스에서만 트래픽을 허용합니다.

로컬 네트워크 내 다른 기기가 해당 머신의 Valet 사이트에 직접(IP 주소를 통해서, 예: `192.168.1.10/application.test`) 접속할 수 있게 하려면, 각 사이트의 Nginx 설정 파일을 수동으로 수정해야 합니다. 80번, 443번 포트의 `listen` 설정에서 `127.0.0.1:` 프리픽스를 제거하세요.

프로젝트에서 HTTPS를 사용하지 않았다면 `/usr/local/etc/nginx/valet/valet.conf` 파일을 수정해서 네트워크 접근을 열 수 있습니다. 만약 `valet secure`로 사이트를 HTTPS로 서비스 중이라면 `~/.config/valet/Nginx/app-name.test` 파일을 수정해야 합니다.

Nginx 설정을 저장한 후에는 `valet restart` 명령어를 실행해 변경사항을 적용합니다.

<a name="site-specific-environment-variables"></a>
## 사이트별 환경 변수

다른 프레임워크를 사용하는 일부 애플리케이션에서는 서버 환경 변수에 의존하지만, 이러한 변수를 프로젝트 내에서 직접 지정할 방법을 제공하지 않을 수 있습니다. Valet에서는 프로젝트 루트에 `.valet-env.php` 파일을 만들어 사이트별 환경 변수를 지정할 수 있습니다. 이 파일은 사이트/환경 변수 쌍을 가진 배열을 리턴해야 하며, 각 사이트에 대해 글로벌 `$_SERVER` 배열에 항목이 추가됩니다:

```
<?php

return [
    // laravel.test 사이트에는 $_SERVER['key']가 "value"로 설정됩니다...
    'laravel' => [
        'key' => 'value',
    ],

    // 모든 사이트에 $_SERVER['key']를 "value"로 설정...
    '*' => [
        'key' => 'value',
    ],
];
```

<a name="proxying-services"></a>
## 서비스 프록시

때때로 Valet 도메인을 로컬 머신의 다른 서비스로 프록시하고 싶을 때가 있습니다. 예를 들어, Docker를 실행하면서 Valet도 함께 사용하려는 경우, Valet과 Docker 모두 80번 포트를 사용할 수 없어 충돌이 발생할 수 있습니다.

이럴 때 `proxy` 명령어를 활용해 프록시를 생성할 수 있습니다. 예를 들어, `http://elasticsearch.test`로 들어오는 모든 트래픽을 `http://127.0.0.1:9200`으로 프록시할 수 있습니다:

```shell
# HTTP로 프록시...
valet proxy elasticsearch http://127.0.0.1:9200

# TLS + HTTP/2 프록시...
valet proxy elasticsearch http://127.0.0.1:9200 --secure
```

프록시를 제거하려면 `unproxy` 명령어를 사용하세요:

```shell
valet unproxy elasticsearch
```

모든 프록시 사이트 구성을 확인하려면 `proxies` 명령어를 사용합니다:

```shell
valet proxies
```

<a name="custom-valet-drivers"></a>
## 커스텀 Valet 드라이버

Valet이 기본적으로 지원하지 않는 프레임워크나 CMS의 PHP 애플리케이션을 서비스하고자 한다면, 직접 Valet “드라이버”를 작성할 수 있습니다. Valet이 설치되면 `~/.config/valet/Drivers` 디렉터리가 생성되고, 그 안에 `SampleValetDriver.php` 파일이 포함되어 있습니다. 이 파일에는 커스텀 드라이버를 작성하는 기본 예제가 들어 있습니다. 드라이버를 작성하려면 다음 세 가지 메서드만 구현하면 됩니다: `serves`, `isStaticFile`, `frontControllerPath`.

이 세 메서드는 모두 `$sitePath`, `$siteName`, `$uri` 인수를 전달받습니다. `$sitePath`는 현재 서비스 중인 사이트의 전체 경로(예: `/Users/Lisa/Sites/my-project`)이고, `$siteName`은 도메인의 "호스트"/"사이트명" 부분(`my-project`), `$uri`는 요청 URI(`/foo/bar`)입니다.

커스텀 Valet 드라이버 작성이 끝나면, 파일명을 `FrameworkValetDriver.php` 형태로 하여 `~/.config/valet/Drivers` 디렉터리에 추가하면 됩니다. 예를 들어 WordPress용 커스텀 드라이버를 만들 경우, 파일명은 `WordPressValetDriver.php`여야 합니다.

이제 각 메서드의 샘플 구현을 살펴보겠습니다.

<a name="the-serves-method"></a>
#### `serves` 메서드

`serves` 메서드에서는 해당 드라이버가 요청을 처리해야 하는지 여부를 `true` 또는 `false`로 반환해야 합니다. 따라서 이 메서드에서는 주어진 `$sitePath`에 목표 프로젝트 유형이 포함되어 있는지 확인해야 합니다.

예를 들어, 만약 `WordPressValetDriver`를 작성중이라면 `serves` 메서드는 다음과 같이 작성할 수 있습니다:

```
/**
 * 드라이버가 요청을 처리하는지 여부를 판별합니다.
 */
public function serves(string $sitePath, string $siteName, string $uri): bool
{
    return is_dir($sitePath.'/wp-admin');
}
```

<a name="the-isstaticfile-method"></a>
#### `isStaticFile` 메서드

`isStaticFile`은 요청이 이미지, 스타일시트 등 "정적" 파일을 대상으로 하는지 판별해야 합니다. 정적 파일일 경우, 디스크 상의 정적 파일 전체 경로를 반환하고, 그렇지 않으면 `false`를 반환합니다:

```
/**
 * 요청이 정적 파일에 대한 것인지 판별합니다.
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
> `serves` 메서드가 요청에 대해 `true`를 반환하고 URI가 `/`가 아닐 때만 `isStaticFile` 메서드가 호출됩니다.

<a name="the-frontcontrollerpath-method"></a>
#### `frontControllerPath` 메서드

`frontControllerPath` 메서드는 애플리케이션의 "프론트 컨트롤러"(보통 "index.php" 등)의 전체 경로를 반환해야 합니다:

```
/**
 * 애플리케이션의 프론트 컨트롤러(엔트리 포인트 파일)의 전체 경로를 반환합니다.
 */
public function frontControllerPath(string $sitePath, string $siteName, string $uri): string
{
    return $sitePath.'/public/index.php';
}
```

<a name="local-drivers"></a>
### 로컬 드라이버

단일 애플리케이션에 대해 커스텀 Valet 드라이버를 정의하고 싶다면, 애플리케이션 루트 디렉터리에 `LocalValetDriver.php` 파일을 생성하세요. 이 드라이버는 기본 `ValetDriver` 클래스를 상속받거나, `LaravelValetDriver` 등 기존 애플리케이션별 드라이버를 상속받을 수 있습니다:

```
use Valet\Drivers\LaravelValetDriver;

class LocalValetDriver extends LaravelValetDriver
{
    /**
     * 드라이버가 요청을 처리하는지 여부를 반환합니다.
     */
    public function serves(string $sitePath, string $siteName, string $uri): bool
    {
        return true;
    }

    /**
     * 애플리케이션 프론트 컨트롤러의 전체 경로를 반환합니다.
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

명령어  | 설명
------------- | -------------
`valet list` | 모든 Valet 명령어 목록을 표시합니다.
`valet diagnose` | Valet 디버깅을 위한 진단 정보를 출력합니다.
`valet directory-listing` | 디렉터리 리스트 동작 방식 확인 혹은 변경. 기본값은 "off"로, 디렉터리 접근 시 404 페이지를 반환합니다.
`valet forget` | "파킹"된 디렉터리 내에서 실행 시, 해당 디렉터리를 파킹 목록에서 제거합니다.
`valet log` | Valet 서비스가 작성한 로그 목록을 확인할 수 있습니다.
`valet paths` | 모든 "파킹"된 경로를 확인합니다.
`valet restart` | Valet 데몬을 재시작합니다.
`valet start` | Valet 데몬을 시작합니다.
`valet stop` | Valet 데몬을 중지합니다.
`valet trust` | Brew 및 Valet에 대해 sudoers 파일을 추가, 비밀번호 입력 없이 Valet 명령어를 실행할 수 있게 합니다.
`valet uninstall` | Valet을 제거합니다. 강제 삭제를 원하면 `--force` 옵션을 사용해 모든 리소스도 함께 삭제합니다.

</div>

<a name="valet-directories-and-files"></a>
## Valet 디렉터리 및 파일

Valet 환경에서 문제를 해결하려 할 때, 아래의 디렉터리 및 파일 정보를 참고할 수 있습니다:

#### `~/.config/valet`

Valet의 모든 설정 파일이 들어 있습니다. 이 디렉터리는 백업해 두는 것이 좋습니다.

#### `~/.config/valet/dnsmasq.d/`

DNSMasq의 설정 파일이 저장되어 있습니다.

#### `~/.config/valet/Drivers/`

Valet 드라이버가 저장됩니다. 드라이버는 각 프레임워크/CMS를 어떻게 서비스할지 정의합니다.

#### `~/.config/valet/Nginx/`

Valet의 모든 Nginx 사이트 설정 파일이 저장됩니다. 이 파일들은 `install` 및 `secure` 명령어 실행 시 재생성됩니다.

#### `~/.config/valet/Sites/`

[링크된 프로젝트](#the-link-command)의 모든 심볼릭 링크가 저장됩니다.

#### `~/.config/valet/config.json`

Valet의 마스터 설정 파일입니다.

#### `~/.config/valet/valet.sock`

Valet의 Nginx 설치에서 사용하는 PHP-FPM 소켓 파일입니다. PHP가 정상적으로 실행 중일 때만 존재합니다.

#### `~/.config/valet/Log/fpm-php.www.log`

PHP 에러 관련 사용자 로그입니다.

#### `~/.config/valet/Log/nginx-error.log`

Nginx 에러 관련 사용자 로그입니다.

#### `/usr/local/var/log/php-fpm.log`

PHP-FPM 시스템 에러 로그입니다.

#### `/usr/local/var/log/nginx`

Nginx의 접근 및 에러 로그가 들어 있는 디렉터리입니다.

#### `/usr/local/etc/php/X.X/conf.d`

여러 PHP 설정 값이 담긴 `*.ini` 파일이 있는 디렉터리입니다.

#### `/usr/local/etc/php/X.X/php-fpm.d/valet-fpm.conf`

PHP-FPM 풀 설정 파일입니다.

#### `~/.composer/vendor/laravel/valet/cli/stubs/secure.valet.conf`

사이트의 SSL 인증서 생성에 사용되는 기본 Nginx 설정 파일입니다.

<a name="disk-access"></a>
### 디스크 접근 권한

macOS 10.14부터는 [일부 파일 및 디렉터리에 대한 접근이 기본적으로 제한](https://manuals.info.apple.com/MANUALS/1000/MA1902/en_US/apple-platform-security-guide.pdf)됩니다. 예를 들어, 데스크탑, Documents, Downloads 디렉터리와 네트워크/이동식 볼륨에도 제한이 적용됩니다. 따라서 Valet에서는 사이트 폴더를 이러한 보호된 위치 밖에 두는 것을 권장합니다.

하지만, 반드시 위 폴더 내에서 사이트를 서비스해야 한다면, Nginx에 “전체 디스크 접근 권한(Full Disk Access)”을 부여해야 하며, 그렇지 않으면 정적 자산 서비스 등에서 서버 오류를 겪을 수 있습니다. 일반적으로 macOS에서는 이러한 권한 필요 시 자동으로 Nginx에 접근 권한 부여를 요청하지만, 수동으로 부여하려면 `시스템 환경설정` > `보안 및 개인정보 보호` > `개인정보 보호` 탭에서 `Full Disk Access(전체 디스크 접근)`을 선택하고, 메인 창에서 `nginx` 항목에 체크하세요.