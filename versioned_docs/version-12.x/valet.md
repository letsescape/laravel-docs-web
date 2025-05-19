# 라라벨 발렛 (Laravel Valet)

- [소개](#introduction)
- [설치](#installation)
    - [Valet 업그레이드](#upgrading-valet)
- [사이트 제공](#serving-sites)
    - [`park` 명령어](#the-park-command)
    - [`link` 명령어](#the-link-command)
    - [TLS로 사이트 보안 적용](#securing-sites)
    - [기본 사이트 제공](#serving-a-default-site)
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
> macOS 또는 Windows에서 라라벨 애플리케이션을 더 쉽게 개발하고 싶으신가요? [Laravel Herd](https://herd.laravel.com)를 확인해보세요. Herd는 라라벨 개발에 필요한 모든 것(Valet, PHP, Composer 등)을 포함하고 있어 바로 시작할 수 있습니다.

[Laravel Valet](https://github.com/laravel/valet)는 macOS 사용자를 위한 경량 개발 환경입니다. Valet은 Mac이 부팅될 때 자동으로 [Nginx](https://www.nginx.com/)를 백그라운드에서 실행하도록 설정합니다. 그리고 [DnsMasq](https://en.wikipedia.org/wiki/Dnsmasq)를 활용해 `*.test` 도메인으로 들어오는 모든 요청을 로컬에 설치된 사이트로 프록시해줍니다.

즉, Valet은 약 7MB의 메모리만 사용하는 매우 빠른 라라벨 개발 환경입니다. Valet이 [Sail](/docs/12.x/sail)이나 [Homestead](/docs/12.x/homestead)를 완전히 대체하진 않지만, 더 유연한 기본 환경, 탁월한 속도, 또는 메모리가 부족한 환경에서 작업할 때 훌륭한 대안이 될 수 있습니다.

기본적으로 Valet은 다음과 같은 다양한 프레임워크와 CMS를 지원합니다(※ 아래 목록에만 국한되지 않습니다):


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

또한, [커스텀 드라이버](#custom-valet-drivers)를 만들어 Valet을 확장할 수도 있습니다.

<a name="installation"></a>
## 설치

> [!WARNING]
> Valet은 macOS와 [Homebrew](https://brew.sh/)가 필요합니다. 설치 전, Apache나 Nginx 같은 다른 프로그램이 로컬 머신의 80번 포트를 사용하고 있지 않은지 확인하세요.

먼저, Homebrew가 최신 버전인지 `update` 명령어로 확인해 주세요:

```shell
brew update
```

그 다음, Homebrew를 사용하여 PHP를 설치합니다:

```shell
brew install php
```

PHP 설치가 끝나면 [Composer 패키지 매니저](https://getcomposer.org)를 설치해야 합니다. 그리고 시스템의 "PATH"에 `$HOME/.composer/vendor/bin` 디렉터리가 포함되어 있는지 확인하세요. Composer가 설치된 후에는 라라벨 Valet을 전역 Composer 패키지로 설치할 수 있습니다:

```shell
composer global require laravel/valet
```

마지막으로, Valet의 `install` 명령어를 실행합니다. 이 명령은 Valet과 DnsMasq를 설치 및 설정하며, Valet이 의존하는 데몬들을 시스템 시작 시 자동으로 실행되도록 설정합니다:

```shell
valet install
```

Valet 설치가 완료되면, 터미널에서 `ping foobar.test`와 같이 `*.test` 도메인에 핑을 보내보세요. Valet이 제대로 설치되었다면 `127.0.0.1`에서 응답이 오는 것을 볼 수 있습니다.

Valet은 필요 서비스들을 Mac이 켜질 때마다 자동으로 시작합니다.

<a name="php-versions"></a>
#### PHP 버전

> [!NOTE]
> 전역 PHP 버전을 바꾸지 않고도, Valet의 [`isolate`](#per-site-php-versions) 명령어를 이용해 사이트별 PHP 버전을 지정할 수 있습니다.

Valet은 `valet use php@버전` 명령어로 PHP 버전을 쉽게 전환할 수 있습니다. 지정한 버전의 PHP가 아직 설치되지 않았다면 Homebrew를 통해 자동으로 설치합니다:

```shell
valet use php@8.2

valet use php
```

또한, 프로젝트 루트에 `.valetrc` 파일을 만들어 사이트 별로 사용할 PHP 버전을 지정할 수도 있습니다:

```shell
php=php@8.2
```

이 파일을 만든 뒤, `valet use` 명령어를 실행하면 Valet이 이 파일을 읽어 해당 사이트에 맞는 PHP 버전을 자동으로 선택합니다.

> [!WARNING]
> 여러 PHP 버전을 설치하더라도, Valet은 한 번에 하나의 PHP 버전만 제공합니다.

<a name="database"></a>
#### 데이터베이스

애플리케이션에 데이터베이스가 필요하다면, [DBngin](https://dbngin.com)을 추천합니다. DBngin은 MySQL, PostgreSQL, Redis를 모두 지원하는 무료 데이터베이스 관리 도구입니다. 설치 후에는 `127.0.0.1` 주소와 `root` 사용자 이름, 비밀번호는 빈 문자열로 접속할 수 있습니다.

<a name="resetting-your-installation"></a>
#### 설치 초기화

Valet 설치 중 문제가 발생한다면, `composer global require laravel/valet`을 다시 실행하고 이어서 `valet install`을 실행해 보세요. 이 절차로 설치가 초기화되며 다양한 문제를 해결할 수 있습니다. 드물게, 완전히 초기화가 필요한 경우 `valet uninstall --force` 후 `valet install`을 차례로 실행해주세요.

<a name="upgrading-valet"></a>
### Valet 업그레이드

터미널에서 `composer global require laravel/valet` 명령을 실행해 Valet을 최신 버전으로 업데이트할 수 있습니다. 업그레이드 후에는, 필요시 구성 파일 등도 최신으로 반영되도록 `valet install` 명령어도 함께 실행하는 것이 좋습니다.

<a name="upgrading-to-valet-4"></a>
#### Valet 4로 업그레이드

Valet 3에서 Valet 4로 업그레이드하려면, 아래 단계를 그대로 따라주세요:

<div class="content-list" markdown="1">

- 사이트별 PHP 버전 설정에 사용하던 `.valetphprc` 파일이 있다면, 각 파일명을 `.valetrc`로 바꾸고 파일 내용을 `php=`로 시작하도록 수정하세요.
- 커스텀 드라이버가 있다면, 네임스페이스, 확장자, 타입힌트, 리턴 타입힌트 등이 새로운 드라이버 시스템과 일치하는지 업데이트하세요. 예시는 Valet의 [SampleValetDriver](https://github.com/laravel/valet/blob/d7787c025e60abc24a5195dc7d4c5c6f2d984339/cli/stubs/SampleValetDriver.php)를 참고하세요.
- PHP 7.1~7.4로 사이트를 구동 중이라면, 여전히 Homebrew로 PHP 8.0 이상의 버전도 설치되어 있는지 확인하세요. Valet은 연동된 기본 버전이 아니어도 내부 스크립트 실행에 최신 PHP를 사용합니다.

</div>

<a name="serving-sites"></a>
## 사이트 제공

Valet 설치가 끝나면 이제 라라벨 애플리케이션을 바로 제공할 수 있습니다. Valet에서는 애플리케이션을 제공하기 위해 `park`와 `link` 두 가지 명령어를 사용할 수 있습니다.

<a name="the-park-command"></a>
### `park` 명령어

`park` 명령어는 여러 개의 애플리케이션이 들어있는 디렉터리를 등록해주는 기능입니다. 디렉터리를 "park"하면, 그 안에 있는 각 폴더는 웹 브라우저에서 `http://<디렉터리명>.test` 주소로 접근할 수 있습니다.

```shell
cd ~/Sites

valet park
```

이렇게 하면, "park"된 디렉터리 안에 새 애플리케이션을 만들 때마다 별도 설정 없이 `http://<디렉터리명>.test`로 바로 접속할 수 있습니다. 예를 들어, park된 디렉터리에 "laravel"이라는 폴더가 있으면, 그 안의 애플리케이션은 `http://laravel.test`로 접근할 수 있습니다. 또한, Valet은 와일드카드 서브도메인(`http://foo.laravel.test`)도 자동으로 허용합니다.

<a name="the-link-command"></a>
### `link` 명령어

`link` 명령어는 한 개의 애플리케이션(폴더)만 별도로 제공하고 싶은 경우 유용합니다. 전체 디렉터리가 아니라 특정 폴더만 명시적으로 지정할 수 있습니다.

```shell
cd ~/Sites/laravel

valet link
```

`link` 명령어로 애플리케이션을 등록하면, 해당 폴더 이름으로 사이트를 접근할 수 있습니다. 예시와 같이 등록한 경우 `http://laravel.test`로 접속할 수 있습니다. 역시 와일드카드 서브도메인(`http://foo.laravel.test`)도 지원됩니다.

다른 호스트네임으로 사이트를 제공하고 싶으면, `link` 명령어에 원하는 호스트네임을 인수로 추가할 수 있습니다. 예를 들어, 애플리케이션을 `http://application.test`로 제공하려면 아래와 같이 하면 됩니다.

```shell
cd ~/Sites/laravel

valet link application
```

또한, 아래처럼 서브도메인도 지정 가능합니다.

```shell
valet link api.application
```

현재 등록된 모든 링크 디렉터리 목록을 확인하려면 다음 명령어를 실행하세요.

```shell
valet links
```

사이트의 심볼릭 링크를 삭제하고 싶다면 `unlink` 명령어를 사용하세요.

```shell
cd ~/Sites/laravel

valet unlink
```

<a name="securing-sites"></a>
### TLS로 사이트 보안 적용

기본적으로 Valet은 사이트를 HTTP로 제공하지만, 암호화된 TLS(HTTP/2) 방식으로 제공하고 싶을 때는 `secure` 명령어를 사용할 수 있습니다. 예를 들어, `laravel.test` 도메인으로 제공 중인 사이트에 TLS를 적용하려면 아래 명령어를 실행하세요.

```shell
valet secure laravel
```

반대로, 보안 적용을 해제하고 일반 HTTP로 다시 전환하려면 `unsecure` 명령어를 사용합니다. 이 명령어도 해제하려는 호스트명을 인수로 받습니다.

```shell
valet unsecure laravel
```

<a name="serving-a-default-site"></a>
### 기본 사이트 제공

알 수 없는 `test` 도메인에 접속할 때 `404` 페이지 대신 특정 "기본" 사이트가 나오도록 Valet을 설정하고 싶을 수도 있습니다. 이 경우, `~/.config/valet/config.json` 설정 파일에 기본 사이트로 사용할 경로를 `default` 옵션으로 추가하세요.

```
"default": "/Users/Sally/Sites/example-site",
```

<a name="per-site-php-versions"></a>
### 사이트별 PHP 버전 지정

Valet은 기본적으로 전역 PHP 버전을 사용해 사이트를 제공합니다. 여러 사이트에서 다양한 PHP 버전을 써야 할 경우, `isolate` 명령어로 각 사이트별 PHP 버전을 지정할 수 있습니다. `isolate` 명령어는 현재 작업 중인 디렉터리의 사이트가 지정한 PHP 버전으로 서비스되도록 설정합니다.

```shell
cd ~/Sites/example-site

valet isolate php@8.0
```

사이트 이름이 디렉터리 명과 다를 경우, `--site` 옵션으로 별도 지정할 수도 있습니다.

```shell
valet isolate php@8.0 --site="site-name"
```

편리하게, `valet php`, `composer`, `which-php` 명령어를 활용하면 사이트에 지정된 PHP 버전 기반으로 각각 PHP CLI, Composer, PHP 경로를 사용할 수 있습니다.

```shell
valet php
valet composer
valet which-php
```

현재 분리(isolate)되어 있는 모든 사이트 및 PHP 버전 목록을 보려면 `isolated` 명령어를 사용하세요.

```shell
valet isolated
```

사이트를 다시 전역 PHP 버전으로 돌리고 싶다면, 사이트 루트 디렉터리에서 `unisolate` 명령어를 실행하면 됩니다.

```shell
valet unisolate
```

<a name="sharing-sites"></a>
## 사이트 공유

Valet에는 로컬 사이트를 외부에 공유할 수 있는 기능이 내장되어 있습니다. 이를 통해 모바일 기기에서 사이트 테스트를 하거나, 팀원 및 클라이언트와 쉽게 공유할 수 있습니다.

기본적으로 Valet은 ngrok이나 Expose를 통해 사이트 공유를 지원합니다. 사이트를 공유하기 전에, `share-tool` 명령어로 사용하려는 도구(`ngrok`, `expose`, 또는 `cloudflared`)를 Valet 환경설정에 지정하세요.

```shell
valet share-tool ngrok
```

도구를 선택했는데 Homebrew(ngrok, cloudflared)나 Composer(Expose)를 통해 설치되어 있지 않으면, Valet이 자동으로 설치 안내를 해줍니다. 단, 두 도구 모두 사이트 공유를 시작하기 전에 ngrok 또는 Expose 계정 인증이 필요합니다.

사이트를 공유하려면, 터미널에서 해당 사이트 디렉터리로 이동한 뒤 Valet의 `share` 명령어를 실행하세요. 이렇게 하면 외부에서 접속 가능한 URL이 클립보드에 복사되어, 브라우저에 붙여넣거나 팀원에게 바로 공유할 수 있습니다.

```shell
cd ~/Sites/laravel

valet share
```

공유를 중지하려면, `Control + C`를 누르세요.

> [!WARNING]
> 커스텀 DNS 서버(예: `1.1.1.1`)를 사용 중이라면, ngrok 공유가 제대로 동작하지 않을 수 있습니다. 이럴 때는 Mac 시스템 설정에서 네트워크 > 고급 > DNS 탭으로 가서 `127.0.0.1`을 첫 번째 DNS 서버로 추가해 주세요.

<a name="sharing-sites-via-ngrok"></a>
#### ngrok을 통한 사이트 공유

ngrok을 사용해 사이트를 공유하려면 [ngrok 계정 생성](https://dashboard.ngrok.com/signup)과 [인증 토큰 설정](https://dashboard.ngrok.com/get-started/your-authtoken)이 필요합니다. 인증 토큰이 준비되면, 아래와 같이 Valet 환경설정에 토큰을 입력하세요.

```shell
valet set-ngrok-token YOUR_TOKEN_HERE
```

> [!NOTE]
> 추가적으로 ngrok 파라미터를 명령어에 전달할 수 있습니다. 예: `valet share --region=eu`. 더 많은 정보는 [ngrok 공식 문서](https://ngrok.com/docs)를 참고하세요.

<a name="sharing-sites-via-expose"></a>
#### Expose를 통한 사이트 공유

Expose를 사용해 사이트를 공유하려면 [Expose 계정 생성](https://expose.dev/register) 후, [인증 토큰으로 인증](https://expose.dev/docs/getting-started/getting-your-token)을 진행해야 합니다.

추가로 지원되는 커맨드라인 옵션 등 자세한 정보는 [Expose 공식 문서](https://expose.dev/docs)를 참고하세요.

<a name="sharing-sites-on-your-local-network"></a>
### 로컬 네트워크에서 사이트 공유

기본적으로 Valet은 개발 머신이 인터넷상에서 외부로 노출되지 않도록, 내부 `127.0.0.1` 인터페이스로 들어오는 트래픽만 허용합니다.

만약 같은 로컬 네트워크 내의 다른 디바이스에서 이 Mac의 Valet 사이트에 접근하고 싶으시다면(예: `192.168.1.10/application.test`와 같이), 해당 사이트에 대한 Nginx 설정 파일에서 `listen` 지시어가 가진 `127.0.0.1:` 접두사를 제거해야 합니다. 이 작업은 80번, 443번 포트 모두에 적용해야 합니다.

`valet secure`를 실행하지 않은 HTTP 사이트라면 `/usr/local/etc/nginx/valet/valet.conf` 파일에서, HTTPS로 서비스 중이라면(`valet secure`를 실행했다면) `~/.config/valet/Nginx/app-name.test` 파일에서 수정해야 합니다.

설정 파일을 수정한 후에는 반드시 `valet restart` 명령어로 변경 사항을 적용하세요.

<a name="site-specific-environment-variables"></a>
## 사이트별 환경 변수

일부 프레임워크를 사용하는 애플리케이션은 서버 환경변수에 의존하지만, 프로젝트 내에서 환경변수를 직접 설정할 방법이 없는 경우도 있습니다. 이런 경우, 프로젝트 루트에 `.valet-env.php` 파일을 추가해 Valet이 사이트별 환경변수를 설정할 수 있습니다. 이 파일은 각 사이트 이름과 환경변수(키-값) 쌍의 배열을 반환해야 하며, 각 사이트별로 글로벌 `$_SERVER` 배열에 추가됩니다.

```php
<?php

return [
    // laravel.test 사이트의 $_SERVER['key']를 "value"로 설정
    'laravel' => [
        'key' => 'value',
    ],

    // 모든 사이트에 $_SERVER['key']를 "value"로 설정
    '*' => [
        'key' => 'value',
    ],
];
```

<a name="proxying-services"></a>
## 서비스 프록시

가끔 Valet 도메인을 로컬에서 실행 중인 다른 서비스로 프록시하고 싶을 때가 있습니다. 예를 들어, Valet을 사용하면서 별도의 사이트를 Docker로 띄워야 할 때가 있는데, 이때 Valet과 Docker가 동시에 80번 포트를 사용할 수 없습니다.

이럴 때 `proxy` 명령어를 이용하면 쉽게 해결할 수 있습니다. 예를 들어, `http://elasticsearch.test`로 들어오는 모든 트래픽을 `http://127.0.0.1:9200`으로 프록시하려면 아래처럼 입력하면 됩니다:

```shell
# HTTP 프록시
valet proxy elasticsearch http://127.0.0.1:9200

# TLS + HTTP/2 프록시
valet proxy elasticsearch http://127.0.0.1:9200 --secure
```

프록시를 제거하고 싶으면 `unproxy` 명령어를 사용하세요.

```shell
valet unproxy elasticsearch
```

프록시된 모든 사이트 구성을 확인하려면 `proxies` 명령어를 사용하세요.

```shell
valet proxies
```

<a name="custom-valet-drivers"></a>
## 커스텀 Valet 드라이버

Valet이 기본적으로 지원하지 않는 프레임워크나 CMS를 위한 PHP 애플리케이션을 제공하고 싶다면 직접 Valet "드라이버"를 만들 수 있습니다. Valet을 설치하면 `~/.config/valet/Drivers` 폴더 안에 `SampleValetDriver.php` 샘플 코드가 생성됩니다. 이 파일을 참고하여 직접 드라이버를 작성할 수 있습니다. 드라이버를 구현할 때는 `serves`, `isStaticFile`, `frontControllerPath` 3개의 메서드를 구현해야 합니다.

세 메서드 모두 `$sitePath`, `$siteName`, `$uri` 세 개의 인수를 전달받습니다.  
- `$sitePath`: 해당 사이트의 전체 경로(예: `/Users/Lisa/Sites/my-project`)  
- `$siteName`: 도메인의 사이트 이름 부분(`my-project`)  
- `$uri`: 요청 URI(`'/foo/bar'` 등)

커스텀 Valet 드라이버 작성이 끝나면, `~/.config/valet/Drivers` 디렉터리에 `FrameworkValetDriver.php` 형식의 이름으로 파일을 저장하세요. 예를 들어, 워드프레스 드라이버라면 파일명이 `WordPressValetDriver.php`가 되어야 합니다.

아래는 각 메서드의 샘플 구현 예시입니다.

<a name="the-serves-method"></a>
#### `serves` 메서드

`serves` 메서드는 현재 드라이버가 해당 요청을 처리할지 말지를 결정합니다. 처리해야 한다면 `true`, 그렇지 않으면 `false`를 반환해야 합니다.  
예를 들어, 워드프레스용 드라이버라면 아래와 같이 작성할 수 있습니다:

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

`isStaticFile` 메서드는 요청이 "정적 파일"(이미지, CSS 등)에 대한 것인지 판단합니다. 정적 파일이라면 해당 파일의 전체 경로를 반환해야 하고, 아니라면 `false`를 반환해야 합니다.

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
> `isStaticFile` 메서드는 `serves` 메서드가 `true`를 반환하고, 요청 URI가 `/`가 아닐 때만 실행됩니다.

<a name="the-frontcontrollerpath-method"></a>
#### `frontControllerPath` 메서드

`frontControllerPath` 메서드는 애플리케이션의 "프론트 컨트롤러"(일반적으로 `index.php`)의 전체 경로를 반환해야 합니다.

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

특정 애플리케이션(사이트)에만 적용할 커스텀 Valet 드라이버를 만들고 싶다면, 애플리케이션 루트 디렉터리에 `LocalValetDriver.php` 파일을 생성하면 됩니다.  
이 파일에서 `ValetDriver` 클래스를 상속하거나, 필요에 따라 이미 존재하는 애플리케이션 전용 드라이버(예: `LaravelValetDriver`)를 상속할 수 있습니다.

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
| `valet directory-listing` | 디렉터리 나열 동작 방식을 확인합니다. 기본값은 "off"이며, 디렉터리에 접근하면 404 페이지를 반환합니다. |
| `valet forget` | "park"된 디렉터리에서 이 명령어를 실행하면 해당 디렉터리를 parked 목록에서 제거합니다. |
| `valet log` | Valet 서비스가 기록한 로그 목록을 확인합니다. |
| `valet paths` | 모든 "parked" 경로들을 확인합니다. |
| `valet restart` | Valet 데몬을 재시작합니다. |
| `valet start` | Valet 데몬을 시작합니다. |
| `valet stop` | Valet 데몬을 중지합니다. |
| `valet trust` | sudoer 파일을 추가해 Brew와 Valet 명령어 실행 시 비밀번호 입력 없이 사용 가능하도록 허용합니다. |
| `valet uninstall` | Valet을 제거하고, 수동 제거 방법을 안내합니다. `--force` 옵션을 사용하면 Valet 관련 리소스를 강제로 모두 삭제합니다. |

</div>

<a name="valet-directories-and-files"></a>
## Valet 디렉터리 및 파일

Valet 환경에서 문제가 발생했을 때 아래 디렉터리 및 파일 정보를 알고 있으면 도움이 됩니다.

#### `~/.config/valet`

Valet의 모든 구성 파일이 이 디렉터리에 저장됩니다. 백업을 권장합니다.

#### `~/.config/valet/dnsmasq.d/`

DnsMasq의 설정 파일들이 있는 폴더입니다.

#### `~/.config/valet/Drivers/`

Valet의 드라이버 파일들이 저장된 곳입니다. 각 프레임워크/CMS 유형별로 어떻게 제공할지 결정합니다.

#### `~/.config/valet/Nginx/`

Valet에서 사용하는 모든 Nginx 사이트 설정 파일이 저장된 폴더입니다. `install` 또는 `secure` 명령어 실행 시 재생성됩니다.

#### `~/.config/valet/Sites/`

[link 명령어](#the-link-command)로 연결된 모든 프로젝트의 심볼릭 링크가 저장된 곳입니다.

#### `~/.config/valet/config.json`

Valet의 주요 설정 파일입니다.

#### `~/.config/valet/valet.sock`

Nginx가 사용하는 PHP-FPM 소켓 파일입니다. PHP가 정상 작동하면 이 파일이 존재합니다.

#### `~/.config/valet/Log/fpm-php.www.log`

PHP 오류에 대한 사용자 로그 파일입니다.

#### `~/.config/valet/Log/nginx-error.log`

Nginx 오류에 대한 사용자 로그 파일입니다.

#### `/usr/local/var/log/php-fpm.log`

시스템 PHP-FPM 오류 로그 파일입니다.

#### `/usr/local/var/log/nginx`

Nginx 접근 및 오류 로그가 저장되는 디렉터리입니다.

#### `/usr/local/etc/php/X.X/conf.d`

여러 PHP 설정이 담긴 `*.ini` 파일이 저장됩니다.

#### `/usr/local/etc/php/X.X/php-fpm.d/valet-fpm.conf`

PHP-FPM 풀(pool) 설정 파일입니다.

#### `~/.composer/vendor/laravel/valet/cli/stubs/secure.valet.conf`

사이트의 SSL 인증서 생성을 위해 사용하는 기본 Nginx 설정 파일입니다.

<a name="disk-access"></a>
### 디스크 접근 권한

macOS 10.14 이후부터는 [일부 파일 및 디렉터리에 기본적으로 접근 제한이 적용됩니다](https://manuals.info.apple.com/MANUALS/1000/MA1902/en_US/apple-platform-security-guide.pdf). 데스크탑, 문서, 다운로드 폴더 외에도 네트워크 및 이동식 볼륨도 제한됩니다. 따라서, 사이트 폴더는 이 제한된 위치 외부에 두는 것이 좋습니다.

만약 이런 위치에서 사이트를 서비스해야 한다면, Nginx에 "전체 디스크 접근 권한(Full Disk Access)"을 부여해야 합니다. 그렇지 않으면 정적 리소스 접근 오류 등 예기치 않은 문제가 발생할 수 있습니다. 일반적으로 macOS는 이런 경우 Nginx 접근 권한을 자동으로 요청하지만, 직접 권한을 부여하려면 `시스템 환경설정` > `보안 및 개인정보` > `개인정보 보호` > `전체 디스크 접근 권한` 항목으로 들어가서 Nginx를 수동으로 체크하면 됩니다. 이후 메인 창의 `nginx` 항목도 활성화하세요.