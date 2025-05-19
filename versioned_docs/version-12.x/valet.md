# 라라벨 Valet (Laravel Valet)

- [소개](#introduction)
- [설치](#installation)
    - [Valet 업그레이드](#upgrading-valet)
- [사이트 서비스](#serving-sites)
    - [`park` 명령어](#the-park-command)
    - [`link` 명령어](#the-link-command)
    - [TLS로 사이트 보안 적용하기](#securing-sites)
    - [기본 사이트 서비스](#serving-a-default-site)
    - [사이트별 PHP 버전 지정](#per-site-php-versions)
- [사이트 공유](#sharing-sites)
    - [로컬 네트워크에서 사이트 공유](#sharing-sites-on-your-local-network)
- [사이트별 환경 변수](#site-specific-environment-variables)
- [서비스 프록시](#proxying-services)
- [커스텀 Valet 드라이버](#custom-valet-drivers)
    - [로컬 드라이버](#local-drivers)
- [기타 Valet 명령어](#other-valet-commands)
- [Valet 디렉토리 및 파일](#valet-directories-and-files)
    - [디스크 접근](#disk-access)

<a name="introduction"></a>
## 소개

> [!NOTE]
> macOS 또는 Windows에서 라라벨 애플리케이션을 더욱 간편하게 개발하고 싶으신가요? [라라벨 Herd](https://herd.laravel.com)를 확인해 보세요. Herd는 라라벨 개발에 필요한 모든 도구(Valet, PHP, Composer 등)를 모두 포함하고 있습니다.

[라라벨 Valet](https://github.com/laravel/valet)는 macOS에서의 최소한의 개발 환경을 지향합니다. Valet은 Mac이 부팅될 때마다 [Nginx](https://www.nginx.com/)가 백그라운드에서 항상 실행되도록 설정합니다. 그리고 [DnsMasq](https://en.wikipedia.org/wiki/Dnsmasq)를 활용해 `*.test` 도메인으로 들어오는 모든 요청을 여러분의 로컬 머신에 설치된 사이트로 프록시합니다.

즉, Valet은 약 7MB 정도의 작은 메모리만 사용하는, 매우 빠른 라라벨 개발 환경입니다. Valet은 [Sail](/docs/sail)이나 [Homestead](/docs/homestead)를 완전히 대체하진 않지만, 더 유연한 설정, 극한의 속도, 혹은 적은 메모리만 사용하고 싶은 경우에는 훌륭한 대안이 됩니다.

Valet은 기본적으로 다양한 프레임워크/사이트를 지원합니다. 예를 들면 다음과 같습니다.

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

또한 직접 [커스텀 드라이버](#custom-valet-drivers)를 구현해 Valet의 기능을 확장할 수 있습니다.

<a name="installation"></a>
## 설치

> [!WARNING]
> Valet을 사용하려면 macOS와 [Homebrew](https://brew.sh/)가 필요합니다. 설치 전에 Apache나 Nginx 같은 다른 프로그램이 로컬 머신의 80번 포트를 사용하고 있지 않은지 꼭 확인하세요.

먼저 Homebrew가 최신 상태인지 `update` 명령어로 업데이트합니다.

```shell
brew update
```

다음으로 Homebrew를 사용해 PHP를 설치하세요.

```shell
brew install php
```

PHP를 설치한 후에는 [Composer 패키지 매니저](https://getcomposer.org)를 설치하고, 시스템의 "PATH"에 `$HOME/.composer/vendor/bin` 디렉토리가 포함되어 있는지 확인해야 합니다. Composer 설치가 완료되면, 라라벨 Valet을 전역 Composer 패키지로 설치할 수 있습니다.

```shell
composer global require laravel/valet
```

마지막으로 Valet의 `install` 명령어를 실행하세요. 이 작업은 Valet과 DnsMasq를 설정·설치합니다. 동시에, Valet이 의존하는 데몬들이 시스템 시작 시 자동으로 실행되도록 설정됩니다.

```shell
valet install
```

설치가 끝나면, 터미널에서 `ping foobar.test` 같은 명령어로 `*.test` 도메인을 핑 해보세요. 만약 Valet이 정상적으로 설치됐다면 해당 도메인이 `127.0.0.1`로 응답하는 것을 볼 수 있습니다.

Valet이 필요한 서비스들은 컴퓨터가 부팅될 때 자동으로 실행됩니다.

<a name="php-versions"></a>
#### PHP 버전

> [!NOTE]
> 전역 PHP 버전을 바꾸지 않고, 사이트별 PHP 버전을 사용하고 싶다면 `isolate` [명령어](#per-site-php-versions)를 참고하세요.

Valet은 `valet use php@버전` 명령어를 통해 PHP 버전을 쉽게 전환할 수 있습니다. Homebrew에 해당 PHP 버전이 없으면 자동으로 설치해줍니다.

```shell
valet use php@8.2

valet use php
```

프로젝트의 루트에 `.valetrc` 파일을 만들 수도 있습니다. 이 파일에는 해당 사이트가 사용할 PHP 버전을 지정합니다.

```shell
php=php@8.2
```

이 파일을 만든 뒤에는 `valet use` 명령어를 실행해서, 사이트에서 사용할 PHP 버전을 Valet이 자동으로 인식하도록 할 수 있습니다.

> [!WARNING]
> 여러 PHP 버전을 설치해둔 경우라도, Valet은 언제나 한 번에 하나의 PHP 버전만 서비스합니다.

<a name="database"></a>
#### 데이터베이스

애플리케이션에서 데이터베이스가 필요한 경우 [DBngin](https://dbngin.com)을 써보세요. MySQL, PostgreSQL, Redis를 모두 포함한 무료의 데이터베이스 관리 도구입니다. DBngin 설치 후에는 `127.0.0.1` 주소에 `root` 사용자명, 비밀번호는 빈 값으로 접속하시면 됩니다.

<a name="resetting-your-installation"></a>
#### 설치 초기화

Valet이 정상적으로 동작하지 않는다면, `composer global require laravel/valet` 명령어와 이어서 `valet install`을 차례로 실행하세요. 이 과정만으로 여러 문제들이 해결될 수 있습니다. 아주 가끔은, `valet uninstall --force`를 실행하고 다시 `valet install`을 실행해 Valet을 "하드 리셋"해야 할 수 있습니다.

<a name="upgrading-valet"></a>
### Valet 업그레이드

Valet을 업그레이드하려면 터미널에서 `composer global require laravel/valet` 명령어를 다시 실행하면 됩니다. 업그레이드 후에는 `valet install`을 한번 더 실행해, 필요한 경우 설정 파일들도 함께 업데이트해 주는 것이 좋습니다.

<a name="upgrading-to-valet-4"></a>
#### Valet 4로 업그레이드

Valet 3에서 Valet 4로 업그레이드하는 경우, 아래 단계를 참고하세요.

<div class="content-list" markdown="1">

- 사이트별 PHP 버전을 커스터마이즈하기 위해 `.valetphprc` 파일을 사용했다면, 각 파일의 이름을 `.valetrc`로 바꾼 다음, 기존 내용 앞에 `php=`를 추가하세요.
- 커스텀 드라이버를 사용 중이라면, 네임스페이스, 확장자, 타입힌트, 반환타입 등이 새 드라이버 시스템과 일치하도록 코드를 업데이트하세요. 예시는 Valet의 [SampleValetDriver](https://github.com/laravel/valet/blob/d7787c025e60abc24a5195dc7d4c5c6f2d984339/cli/stubs/SampleValetDriver.php)에서 참고할 수 있습니다.
- 사이트를 PHP 7.1~7.4 버전으로 서비스 중이라면, Homebrew를 사용해 PHP 8.0 이상 버전도 반드시 설치해두세요. Valet은 반드시 8.0 이상의 PHP를 내부적으로 사용합니다(메인 PHP 버전과 다를 수 있음).

</div>

<a name="serving-sites"></a>
## 사이트 서비스

Valet 설치를 마쳤다면, 이제 라라벨 애플리케이션을 서비스할 준비가 되었습니다. Valet은 `park`와 `link` 두 가지 명령어로 애플리케이션 서비스를 돕습니다.

<a name="the-park-command"></a>
### `park` 명령어

`park` 명령어는 여러분의 애플리케이션들이 들어 있는 디렉토리를 등록합니다. 해당 디렉토리를 Valet에 "주차(parking)"하면, 그 디렉토리 내부에 있는 모든 디렉토리가 웹 브라우저에서 `http://<디렉토리명>.test` 형태로 접근할 수 있습니다.

```shell
cd ~/Sites

valet park
```

이렇게 하면, "주차"된 디렉토리 내부에 생성하는 애플리케이션은 자동으로 `http://<디렉토리명>.test` 주소로 서비스됩니다. 예를 들어 "laravel"이라는 디렉토리가 있다면 `http://laravel.test`로 접근할 수 있습니다. Valet은 와일드카드 서브도메인(`http://foo.laravel.test`)도 자동으로 지원합니다.

<a name="the-link-command"></a>
### `link` 명령어

`link` 명령어로 라라벨 애플리케이션을 개별적으로 서비스할 수도 있습니다. 전체 디렉토리가 아니라 한 개의 특정 디렉토리만 서비스하고자 할 때 유용합니다.

```shell
cd ~/Sites/laravel

valet link
```

`link` 명령어로 Valet에 연결한 후에는 디렉토리명으로 해당 애플리케이션을 접근할 수 있습니다. 위 예시에서는 `http://laravel.test`로 접속할 수 있습니다. 또한 와일드카드 서브도메인(`http://foo.laravel.test`)도 자동 지원됩니다.

특정 호스트명으로 서비스를 원한다면, `link` 명령어에 호스트명을 직접 전달할 수 있습니다. 예를 들어 아래와 같이 하면 `http://application.test`로 애플리케이션을 접근할 수 있습니다.

```shell
cd ~/Sites/laravel

valet link application
```

물론, `link` 명령어로 서브도메인 서비스도 가능합니다.

```shell
valet link api.application
```

연결된 모든 디렉토리 목록은 `links` 명령어로 확인할 수 있습니다.

```shell
valet links
```

심볼릭 링크를 삭제하려면 `unlink` 명령어를 사용하세요.

```shell
cd ~/Sites/laravel

valet unlink
```

<a name="securing-sites"></a>
### TLS로 사이트 보안 적용하기

기본적으로 Valet은 사이트를 HTTP로 서비스합니다. 하지만 HTTP/2를 지원하는 암호화된 TLS 방식으로 서비스하고 싶다면 `secure` 명령어를 사용하면 됩니다. 예를 들어 `laravel.test` 도메인으로 사이트를 운영할 경우 다음과 같이 TLS를 적용할 수 있습니다.

```shell
valet secure laravel
```

반대로, 사이트를 다시 평문 HTTP로 돌리고 싶을 땐 `unsecure` 명령어를 사용하여 TLS를 해제할 수 있습니다. 역시 호스트명을 인자로 넘겨줍니다.

```shell
valet unsecure laravel
```

<a name="serving-a-default-site"></a>
### 기본 사이트 서비스

알 수 없는 `test` 도메인으로 접속했을 때 404 대신 특정 "기본" 사이트를 서비스하고 싶을 때가 있습니다. 이 경우에는 `~/.config/valet/config.json` 설정 파일에 아래와 같이 기본 사이트의 경로를 `default` 옵션으로 지정하면 됩니다.

```
"default": "/Users/Sally/Sites/example-site",
```

<a name="per-site-php-versions"></a>
### 사이트별 PHP 버전 지정

Valet은 기본적으로 전역 PHP를 사용해 사이트를 서비스합니다. 하지만 서로 다른 버전의 PHP가 필요한 여러 사이트를 운영하려면, `isolate` 명령어로 특정 사이트별 PHP 버전을 지정할 수 있습니다. 이 명령은 현재 디렉토리의 사이트에 대해 지정된 PHP 버전으로 동작하도록 Valet을 설정합니다.

```shell
cd ~/Sites/example-site

valet isolate php@8.0
```

만약 사이트명이 디렉토리명과 다르다면, `--site` 옵션을 사용해서 직접 명시할 수 있습니다.

```shell
valet isolate php@8.0 --site="site-name"
```

편의를 위해서, `valet php`, `composer`, `which-php` 명령어는 사이트의 PHP 버전에 맞는 PHP CLI나 도구를 호출해줍니다.

```shell
valet php
valet composer
valet which-php
```

격리된(분리된) 사이트와 PHP 버전 목록은 `isolated` 명령어로 확인할 수 있습니다.

```shell
valet isolated
```

사이트를 다시 전역 PHP 버전으로 되돌리려면 사이트 루트 디렉토리에서 `unisolate` 명령어를 실행하면 됩니다.

```shell
valet unisolate
```

<a name="sharing-sites"></a>
## 사이트 공유

Valet에는 로컬 사이트를 외부에 공유할 수 있는 명령어가 포함되어 있습니다. 이를 이용해 모바일 기기에서 테스트하거나, 팀원 또는 클라이언트에게 손쉽게 사이트를 보여줄 수 있습니다.

Valet은 기본적으로 ngrok 또는 Expose를 이용한 사이트 공유를 지원합니다. 먼저 `share-tool` 명령어로 `ngrok`, `expose`, `cloudflared` 중 원하는 방식을 지정해 설정을 업데이트하세요.

```shell
valet share-tool ngrok
```

선택한 도구(ngrok, cloudflared)는 Homebrew로, Expose는 Composer로 설치되어 있지 않다면 Valet이 자동으로 설치 안내를 해줍니다. 실제 공유를 시작하기 전에 ngrok 또는 Expose 계정 인증도 필요합니다.

사이트를 공유하려면, 터미널에서 해당 디렉토리로 이동한 후 `share` 명령어를 실행하면 됩니다. 공유용 공개 URL이 클립보드에 복사되며, 바로 브라우저에 붙여넣거나 팀과 공유할 수 있습니다.

```shell
cd ~/Sites/laravel

valet share
```

공유를 중지하려면 `Control + C`를 누르세요.

> [!WARNING]
> 커스텀 DNS 서버(예: `1.1.1.1`)를 사용하는 경우 ngrok 공유가 정상 작동하지 않을 수 있습니다. 이럴 때는 Mac 시스템 설정의 네트워크 > 고급 설정 > DNS 탭에서 DNS 서버에 `127.0.0.1`를 첫 번째로 추가하세요.

<a name="sharing-sites-via-ngrok"></a>
#### ngrok을 이용한 사이트 공유

ngrok으로 사이트를 공유하려면 [ngrok 계정 생성](https://dashboard.ngrok.com/signup)과 [인증 토큰 생성](https://dashboard.ngrok.com/get-started/your-authtoken)이 필요합니다. 인증 토큰을 받은 후 아래와 같이 Valet 설정에 등록하면 됩니다.

```shell
valet set-ngrok-token YOUR_TOKEN_HERE
```

> [!NOTE]
> `valet share --region=eu`처럼 추가 ngrok 파라미터를 지정할 수도 있습니다. 자세한 내용은 [ngrok 공식 문서](https://ngrok.com/docs)를 참고하세요.

<a name="sharing-sites-via-expose"></a>
#### Expose를 이용한 사이트 공유

Expose로 사이트를 공유하려면 [Expose 계정 가입](https://expose.dev/register)과 [인증 토큰 등록](https://expose.dev/docs/getting-started/getting-your-token)이 필요합니다.

지원하는 추가 명령줄 옵션 등은 [Expose 공식 문서](https://expose.dev/docs)를 참고하세요.

<a name="sharing-sites-on-your-local-network"></a>
### 로컬 네트워크에서 사이트 공유

Valet은 개발 머신이 외부 인터넷에 직접 노출되는 보안 위험을 피하기 위해, 기본적으로 내부 `127.0.0.1` 인터페이스에서만 트래픽을 허용합니다.

다른 기기(예: 같은 네트워크의 `192.168.1.10/application.test`)에서 내 Valet 사이트에 접근하려면, 해당 사이트의 Nginx 설정 파일에서 `listen` 지시어의 `127.0.0.1:` 접두어를 직접 삭제해야 합니다(80, 443 포트).

프로젝트에서 `valet secure` 명령을 사용하지 않았다면, `/usr/local/etc/nginx/valet/valet.conf` 파일을 수정해 HTTPS가 아닌 모든 사이트의 네트워크 접근을 열 수 있습니다. 만약 해당 프로젝트에서 HTTPS를 사용하도록 `valet secure`를 실행한 경우라면, `~/.config/valet/Nginx/app-name.test` 파일을 수정해야 합니다.

설정 파일을 수정한 뒤에는 반드시 `valet restart` 명령어로 Nginx 설정을 반영하세요.

<a name="site-specific-environment-variables"></a>
## 사이트별 환경 변수

다른 프레임워크에서 동작하는 일부 애플리케이션은 서버 환경 변수에 의존할 수 있지만, 프로젝트 내부에서 따로 변수값을 설정할 방법을 제공하지 않는 경우도 있습니다. 이때 Valet에서는 프로젝트 루트에 `.valet-env.php` 파일을 추가해 사이트별 환경 변수를 설정할 수 있습니다. 이 파일은 사이트/환경 변수 쌍의 배열을 반환해야 하며, 지정된 각 사이트의 글로벌 `$_SERVER` 배열에 변수가 추가됩니다.

```php
<?php

return [
    // laravel.test 사이트의 $_SERVER['key'] 값을 "value"로 설정...
    'laravel' => [
        'key' => 'value',
    ],

    // 모든 사이트에 $_SERVER['key'] 값을 "value"로 설정...
    '*' => [
        'key' => 'value',
    ],
];
```

<a name="proxying-services"></a>
## 서비스 프록시

때로는 Valet 도메인을 머신 내의 또 다른 서비스로 프록시하고 싶을 수 있습니다. 예를 들어 Valet과 별도로 Docker에서 서비스를 구동시켜야 하지만, Valet과 Docker가 동시에 80번 포트를 사용할 수 없는 경우가 있습니다.

이럴 때 `proxy` 명령어를 사용해서 프록시를 생성할 수 있습니다. 예시로, `http://elasticsearch.test`로 들어온 모든 트래픽을 `http://127.0.0.1:9200`으로 프록시할 수 있습니다.

```shell
# HTTP 프록시...
valet proxy elasticsearch http://127.0.0.1:9200

# TLS + HTTP/2 프록시...
valet proxy elasticsearch http://127.0.0.1:9200 --secure
```

프록시를 삭제하려면 `unproxy` 명령어를 사용합니다.

```shell
valet unproxy elasticsearch
```

모든 프록시된 사이트 구성을 확인하려면 `proxies` 명령어를 실행하세요.

```shell
valet proxies
```

<a name="custom-valet-drivers"></a>
## 커스텀 Valet 드라이버

Valet의 기본 지원 목록에 없는 프레임워크나 CMS용 PHP 애플리케이션을 서비스하고 싶을 때는 직접 Valet "드라이버"를 작성할 수 있습니다. Valet을 설치하면 `~/.config/valet/Drivers` 디렉토리가 생성되고, 그 안에 예시 구현 파일인 `SampleValetDriver.php`가 포함되어 있습니다. 기본적으로 커스텀 드라이버는 `serves`, `isStaticFile`, `frontControllerPath` 세 가지 메서드만 구현하면 됩니다.

이 세 메서드는 모두 `$sitePath`, `$siteName`, `$uri` 인수를 받습니다. `$sitePath`는 서비스 중인 사이트의 전체 경로(예: `/Users/Lisa/Sites/my-project`), `$siteName`은 도메인의 "호스트/사이트명"(예: `my-project`), `$uri`는 들어온 요청의 URI(`/foo/bar`)입니다.

커스텀 드라이버를 완성했다면, 드라이버 파일명을 `FrameworkValetDriver.php` 형태로 하여 `~/.config/valet/Drivers` 디렉토리에 넣어주세요. 예를 들어 WordPress용 커스텀 드라이버라면 `WordPressValetDriver.php`라는 파일명이어야 합니다.

커스텀 Valet 드라이버에 반드시 구현해야 하는 각 메서드의 예시를 확인해 보겠습니다.

<a name="the-serves-method"></a>
#### `serves` 메서드

`serves` 메서드는 이 드라이버가 들어온 요청을 처리해야 한다면 `true`, 아니라면 `false`를 반환해야 합니다. 즉, 이 메서드에서는 전달받은 `$sitePath` 내에 해당 프레임워크/프로젝트가 존재하는지 판단하는 로직을 구현합니다.

예를 들어, WordPress용 드라이버를 만든다면 아래와 같이 작성할 수 있습니다.

```php
/**
 * Determine if the driver serves the request.
 */
public function serves(string $sitePath, string $siteName, string $uri): bool
{
    return is_dir($sitePath.'/wp-admin');
}
```

<a name="the-isstaticfile-method"></a>
#### `isStaticFile` 메서드

`isStaticFile` 메서드는 들어온 요청이 이미지나 스타일시트와 같은 "정적(static)" 파일 요청인지 판단합니다. 요청이 정적 파일이라면, 해당 파일의 전체 경로를 반환하고, 아니라면 `false`를 반환합니다.

```php
/**
 * Determine if the incoming request is for a static file.
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
> `isStaticFile` 메서드는 반드시 `serves` 메서드가 해당 요청에 대해 `true`를 반환하고, 요청 URI가 `/`이 아닐 때만 호출됩니다.

<a name="the-frontcontrollerpath-method"></a>
#### `frontControllerPath` 메서드

`frontControllerPath` 메서드는 애플리케이션의 "프론트 컨트롤러"(보통 `index.php` 등)의 전체 경로를 반환해야 합니다.

```php
/**
 * Get the fully resolved path to the application's front controller.
 */
public function frontControllerPath(string $sitePath, string $siteName, string $uri): string
{
    return $sitePath.'/public/index.php';
}
```

<a name="local-drivers"></a>
### 로컬 드라이버

하나의 애플리케이션에만 적용되는 커스텀 Valet 드라이버를 만들고 싶다면, 해당 애플리케이션의 루트 디렉토리에 `LocalValetDriver.php` 파일을 만들면 됩니다. 이 드라이버는 기본 `ValetDriver` 클래스를 상속하거나, 기존의 라라벨용 드라이버(`LaravelValetDriver`)를 상속해 구현할 수 있습니다.

```php
use Valet\Drivers\LaravelValetDriver;

class LocalValetDriver extends LaravelValetDriver
{
    /**
     * Determine if the driver serves the request.
     */
    public function serves(string $sitePath, string $siteName, string $uri): bool
    {
        return true;
    }

    /**
     * Get the fully resolved path to the application's front controller.
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
| `valet list` | 모든 Valet 명령어 목록을 출력합니다. |
| `valet diagnose` | Valet 디버깅에 도움이 되는 진단 정보를 출력합니다. |
| `valet directory-listing` | 디렉토리 목록 표시 동작을 확인합니다. 기본값은 "off"로, 디렉토리 접근 시 404 페이지가 표시됩니다. |
| `valet forget` | "주차(parked)"한 디렉토리에서 실행하여, 해당 디렉토리를 parked 목록에서 제거합니다. |
| `valet log` | Valet 서비스에서 작성된 로그 목록을 확인합니다. |
| `valet paths` | 모든 "주차(parked)"된 경로 목록을 확인합니다. |
| `valet restart` | Valet 데몬을 재시작합니다. |
| `valet start` | Valet 데몬을 시작합니다. |
| `valet stop` | Valet 데몬을 정지합니다. |
| `valet trust` | Brew 및 Valet 관련 sudoers 파일을 추가해, 비밀번호 입력 없이 Valet 명령어를 실행할 수 있게 합니다. |
| `valet uninstall` | Valet을 제거합니다. 수동 제거 안내 문구가 표시됩니다. `--force` 옵션을 주면 Valet의 모든 리소스를 강제로 삭제합니다. |

</div>

<a name="valet-directories-and-files"></a>
## Valet 디렉토리 및 파일

Valet 환경에서 문제를 해결할 때, 알아두면 좋은 주요 디렉토리/파일은 아래와 같습니다.

#### `~/.config/valet`

Valet의 모든 설정 파일이 들어 있습니다. 이 디렉토리는 백업해두는 것이 좋습니다.

#### `~/.config/valet/dnsmasq.d/`

DNSMasq 설정 파일이 저장되는 디렉토리입니다.

#### `~/.config/valet/Drivers/`

Valet 드라이버가 저장됩니다. 각 프레임워크/CMS가 어떻게 서비스될지 결정합니다.

#### `~/.config/valet/Nginx/`

모든 Valet Nginx 사이트 설정 파일이 저장됩니다. 이 파일들은 `install`, `secure` 명령 실행 시 재생성됩니다.

#### `~/.config/valet/Sites/`

[link 명령어로 연결한 프로젝트](#the-link-command)에 대한 심볼릭 링크들이 저장됩니다.

#### `~/.config/valet/config.json`

Valet의 전체 설정이 저장된 마스터 설정 파일입니다.

#### `~/.config/valet/valet.sock`

PHP-FPM 소켓 파일입니다. PHP가 정상 실행 중일 때만 존재합니다.

#### `~/.config/valet/Log/fpm-php.www.log`

PHP 에러용 유저 로그 파일입니다.

#### `~/.config/valet/Log/nginx-error.log`

Nginx 에러용 유저 로그 파일입니다.

#### `/usr/local/var/log/php-fpm.log`

PHP-FPM 시스템 에러 로그입니다.

#### `/usr/local/var/log/nginx`

Nginx 접근 및 에러 로그 디렉토리입니다.

#### `/usr/local/etc/php/X.X/conf.d`

각 PHP 설정 별 *.ini 파일들이 저장된 디렉토리입니다.

#### `/usr/local/etc/php/X.X/php-fpm.d/valet-fpm.conf`

PHP-FPM 풀 설정 파일입니다.

#### `~/.composer/vendor/laravel/valet/cli/stubs/secure.valet.conf`

SSL 인증서 생성을 위한 Nginx 기본 설정 파일입니다.

<a name="disk-access"></a>
### 디스크 접근

macOS 10.14 버전부터는 [일부 파일 및 디렉토리에 기본으로 접근 제한](https://manuals.info.apple.com/MANUALS/1000/MA1902/en_US/apple-platform-security-guide.pdf)이 적용됩니다. 이 제한에는 바탕화면(Desktop), 문서(Documents), 다운로드 폴더(Downloads)가 포함되며, 네트워크/이동식 볼륨 접근도 제한됩니다. 따라서, Valet에서는 사이트 폴더가 이러한 보호 디렉터리 밖에 위치하는 것을 권장합니다.

하지만 꼭 해당 위치에서 사이트를 서비스해야 한다면, Nginx에 "전체 디스크 접근 권한(Full Disk Access)"을 부여해야 합니다. 그렇지 않으면 Nginx가 정적 파일을 서비스할 때 서버 에러 등 예기치 못한 문제가 발생할 수 있습니다. 보통 macOS는 이러한 위치에 접근이 필요할 때 Nginx에 직접 권한을 요청하는 알림을 띄웁니다. 또는 수동으로 `시스템 환경설정` > `보안 및 개인정보 보호(Security & Privacy)` > `개인정보(Privacy)`에서 '전체 디스크 접근'을 선택한 후, 메인 창에서 nginx 관련 항목에 체크해주시면 됩니다.
