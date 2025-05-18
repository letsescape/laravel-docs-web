# 라라벨 Valet (Laravel Valet)

- [소개](#introduction)
- [설치](#installation)
    - [Valet 업그레이드](#upgrading-valet)
- [사이트 서비스하기](#serving-sites)
    - [`park` 명령어](#the-park-command)
    - [`link` 명령어](#the-link-command)
    - [TLS로 사이트 보안 적용하기](#securing-sites)
    - [기본 사이트 서비스하기](#serving-a-default-site)
    - [사이트별 PHP 버전 설정](#per-site-php-versions)
- [사이트 공유하기](#sharing-sites)
    - [Ngrok을 통한 사이트 공유](#sharing-sites-via-ngrok)
    - [Expose를 통한 사이트 공유](#sharing-sites-via-expose)
    - [로컬 네트워크에서 사이트 공유하기](#sharing-sites-on-your-local-network)
- [사이트별 환경 변수](#site-specific-environment-variables)
- [서비스 프록시 설정](#proxying-services)
- [커스텀 Valet 드라이버](#custom-valet-drivers)
    - [로컬 드라이버](#local-drivers)
- [기타 Valet 명령어](#other-valet-commands)
- [Valet 디렉터리 및 파일](#valet-directories-and-files)
    - [디스크 접근 권한](#disk-access)

<a name="introduction"></a>
## 소개

[라라벨 Valet](https://github.com/laravel/valet)은 macOS 환경에서 소규모, 미니멀리스트 개발자들을 위한 개발 환경입니다. 라라벨 Valet은 여러분의 Mac에서 항상 [Nginx](https://www.nginx.com/)를 백그라운드에서 실행하도록 설정합니다. 그리고 [DnsMasq](https://en.wikipedia.org/wiki/Dnsmasq)를 활용해 `*.test` 도메인으로 들어오는 모든 요청을 로컬 컴퓨터에 설치된 사이트로 프록시 처리해줍니다.

즉, Valet은 약 7MB의 RAM만 사용하는 매우 빠른 라라벨 개발 환경입니다. Valet은 [Sail](/docs/9.x/sail)이나 [Homestead](/docs/9.x/homestead)의 완벽한 대체재는 아니지만, 기본 기능만 필요하거나 극도의 속도를 원하거나, 또는 메모리가 제한된 환경에서 작업할 때 훌륭한 대안이 될 수 있습니다.

Valet은 기본적으로 아래와 같은 다양한 프레임워크와 CMS를 지원합니다(이에 국한되지 않습니다):

<div id="valet-support" markdown="1">

- [라라벨](https://laravel.com)
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

또한, 여러분만의 [커스텀 드라이버](#custom-valet-drivers)를 추가하여 Valet을 확장할 수도 있습니다.

<a name="installation"></a>
## 설치

> [!WARNING]
> Valet은 macOS와 [Homebrew](https://brew.sh/)가 필요합니다. 설치 전에 Apache나 Nginx처럼 로컬 머신의 80번 포트를 점유하고 있는 다른 프로그램들이 없는지 확인해야 합니다.

먼저, Homebrew가 최신 버전인지 확인하기 위해 아래 명령어로 업데이트 해주세요:

```shell
brew update
```

다음으로, Homebrew를 이용해 PHP를 설치합니다:

```shell
brew install php
```

PHP를 설치했다면, 이제 [Composer 패키지 매니저](https://getcomposer.org)를 설치할 수 있습니다. 또한, `~/.composer/vendor/bin` 디렉터리가 시스템 "PATH"에 포함되어 있는지 확인해야 합니다. Composer 설치가 끝난 후, 전역 Composer 패키지로 Laravel Valet을 설치할 수 있습니다:

```shell
composer global require laravel/valet
```

끝으로, Valet의 `install` 명령어를 실행하면 Valet과 DnsMasq가 자동으로 설정 및 설치됩니다. 또한, Valet이 필요로 하는 데몬들이 시스템 부팅 시 자동으로 실행되도록 설정됩니다:

```shell
valet install
```

Valet이 설치된 후에는 터미널에서 `ping foobar.test`와 같은 명령어로 `*.test` 도메인에 핑을 보내보세요. Valet이 정상적으로 설치되었다면 해당 도메인이 `127.0.0.1`로 응답하는 것을 확인할 수 있습니다.

Valet에서 필요한 서비스들은 컴퓨터를 부팅할 때마다 자동으로 시작됩니다.

<a name="php-versions"></a>
#### PHP 버전

Valet에서는 `valet use php@version` 명령어로 PHP 버전을 손쉽게 변경할 수 있습니다. 지정한 버전의 PHP가 설치되어 있지 않다면, Valet이 Homebrew를 통해 해당 버전을 설치해줍니다:

```shell
valet use php@7.2

valet use php
```

또한, 프로젝트 루트에 `.valetphprc` 파일을 추가해 사이트별 PHP 버전을 지정할 수도 있습니다. `.valetphprc` 파일에는 해당 사이트에서 사용할 PHP 버전을 적어주면 됩니다:

```shell
php@7.2
```

이 파일을 만들고 나서 `valet use` 명령어를 실행하면, Valet이 해당 파일을 읽고 사이트에 적용할 PHP 버전을 자동으로 설정합니다.

> [!WARNING]
> 여러 PHP 버전을 설치했더라도, Valet은 동시에 한 가지 PHP 버전만 서비스할 수 있습니다.

<a name="database"></a>
#### 데이터베이스

애플리케이션에서 데이터베이스가 필요하다면, [DBngin](https://dbngin.com) 같은 툴을 이용할 수 있습니다. DBngin은 MySQL, PostgreSQL, Redis 등을 포함한 무료 통합 데이터베이스 관리 도구입니다. DBngin 설치 후에는 `127.0.0.1` 호스트, `root` 사용자명, 비밀번호는 빈 문자열로 데이터베이스에 접속할 수 있습니다.

<a name="resetting-your-installation"></a>
#### 설치 초기화(재설정)하기

Valet이 제대로 실행되지 않는 문제가 발생한다면, `composer global require laravel/valet` 명령어 실행 후 `valet install`을 다시 입력하여 설치 상태를 초기화할 수 있습니다. 이는 다양한 문제를 해결하는 데 도움이 됩니다. 아주 드물게, `valet uninstall --force` 실행 후 `valet install`을 다시 수행하는 "강제 초기화"가 필요할 수도 있습니다.

<a name="upgrading-valet"></a>
### Valet 업그레이드

Valet을 업그레이드하려면 터미널에서 `composer global require laravel/valet` 명령어를 실행하면 됩니다. 업그레이드 후에는, Valet이 필요할 경우 추가적인 설정 파일 업그레이드를 진행할 수 있도록 `valet install` 명령어를 함께 실행하는 것이 좋습니다.

<a name="serving-sites"></a>
## 사이트 서비스하기

Valet 설치가 완료되면, 이제 라라벨 애플리케이션의 서비스를 시작할 수 있습니다. Valet에서는 애플리케이션 서비스를 위해 `park`와 `link` 두 가지 명령어를 제공합니다.

<a name="the-park-command"></a>
### `park` 명령어

`park` 명령어는 여러분의 컴퓨터에서 여러 애플리케이션이 들어있는 디렉터리를 등록할 때 사용합니다. 한번 디렉터리를 "파킹"하면, 그 하위에 있는 모든 애플리케이션 디렉터리에 대해 `http://<디렉터리명>.test` 형식으로 웹 브라우저에서 접속할 수 있게 됩니다.

```shell
cd ~/Sites

valet park
```

이것만으로 끝입니다. 이제 파킹된 디렉터리 내에 새 애플리케이션을 만들면 추가 설정 없이 자동으로 `http://<디렉터리명>.test` 형식으로 서비스됩니다. 예를 들어 파킹된 디렉터리 안에 "laravel" 폴더가 있다면, 그 내부의 애플리케이션은 `http://laravel.test`에서 접속할 수 있습니다. 또한, Valet은 와일드카드 서브도메인(`http://foo.laravel.test`)도 자동으로 지원해줍니다.

<a name="the-link-command"></a>
### `link` 명령어

`link` 명령어는 한 개의 디렉터리에 있는 단일 사이트만 서비스하고 싶은 경우에 사용합니다. 전체 디렉터리를 서비스하지 않고, 특정 디렉터리의 한 사이트만 연결할 때 유용합니다.

```shell
cd ~/Sites/laravel

valet link
```

`link` 명령어로 애플리케이션을 Valet에 연결하면, 해당 디렉터리명으로 사이트에 접속할 수 있습니다. 즉, 위의 예시에서 링크된 애플리케이션은 `http://laravel.test`에서 접근 가능합니다. 마찬가지로, 와일드카드 서브도메인(`http://foo.laravel.test`)도 자동으로 지원합니다.

다른 호스트명으로 애플리케이션을 서비스하고 싶다면, `link` 명령어에 원하는 호스트명을 인수로 전달하면 됩니다. 예를 들어, 아래와 같이 실행하면 `http://application.test`에서 해당 애플리케이션에 접속할 수 있습니다:

```shell
cd ~/Sites/laravel

valet link application
```

서브도메인도 지원합니다:

```shell
valet link api.application
```

등록된 모든 링크 목록을 확인하려면 `links` 명령어를 사용하세요:

```shell
valet links
```

사이트의 심볼릭 링크를 제거하려면 `unlink` 명령어를 사용할 수 있습니다:

```shell
cd ~/Sites/laravel

valet unlink
```

<a name="securing-sites"></a>
### TLS로 사이트 보안 적용하기

기본적으로 Valet은 HTTP를 통해 사이트를 서비스합니다. 하지만 암호화된 TLS와 HTTP/2로 사이트를 제공하고 싶다면 `secure` 명령어를 사용할 수 있습니다. 예를 들어, Valet이 `laravel.test` 도메인에서 서비스를 하고 있다면 다음과 같이 명령어를 실행하세요.

```shell
valet secure laravel
```

사이트를 다시 HTTP(비암호화)로 전환하려면 `unsecure` 명령어를 사용하면 됩니다. 이 명령어 역시 호스트명을 인수로 받습니다:

```shell
valet unsecure laravel
```

<a name="serving-a-default-site"></a>
### 기본 사이트 서비스하기

가끔씩 알 수 없는 `test` 도메인에 접속할 때 `404` 대신 특정 사이트를 기본 사이트로 서비스하고 싶을 수 있습니다. 이럴 땐, `~/.config/valet/config.json` 설정 파일에 아래와 같이 `default` 옵션을 추가하고 기본 사이트로 지정할 경로를 입력하면 됩니다:

```
"default": "/Users/Sally/Sites/example-site",
```

<a name="per-site-php-versions"></a>
### 사이트별 PHP 버전 설정

Valet은 기본적으로 시스템에 설치된 전역 PHP를 사용해 사이트를 서비스합니다. 하지만 여러 사이트에서 서로 다른 PHP 버전을 사용해야 한다면, `isolate` 명령어로 특정 디렉터리에 대해 PHP 버전을 지정할 수 있습니다. 이 명령어는 현재 작업 중인 디렉터리의 사이트에 대해 원하는 PHP 버전을 설정합니다.

```shell
cd ~/Sites/example-site

valet isolate php@8.0
```

사이트명이 디렉터리명과 다를 경우, `--site` 옵션으로 명시할 수 있습니다:

```shell
valet isolate php@8.0 --site="site-name"
```

편의상, `valet php`, `composer`, `which-php` 명령어를 이용해 해당 사이트별로 지정된 PHP 버전의 CLI나 도구로 프록시 호출할 수 있습니다:

```shell
valet php
valet composer
valet which-php
```

모든 분리된 사이트와 각각의 PHP 버전 목록을 보고 싶다면 `isolated` 명령어를 실행하세요:

```shell
valet isolated
```

사이트를 다시 Valet의 기본 PHP로 되돌리려면 사이트 루트 디렉터리에서 `unisolate` 명령어를 실행하면 됩니다:

```shell
valet unisolate
```

<a name="sharing-sites"></a>
## 사이트 공유하기

Valet에는 로컬 사이트를 외부에 간편하게 공개할 수 있는 명령어도 내장되어 있어, 모바일 기기 테스트나 팀, 고객과의 공유가 쉽습니다.

<a name="sharing-sites-via-ngrok"></a>
### Ngrok을 통한 사이트 공유

사이트를 공유하려면, 터미널에서 해당 사이트 디렉터리로 이동해 Valet의 `share` 명령어를 실행하세요. 공개 가능한 URL이 자동으로 클립보드에 복사되어 바로 브라우저에 붙여넣거나 팀원에게 공유할 수 있습니다:

```shell
cd ~/Sites/laravel

valet share
```

사이트 공유를 중단하려면 `Control + C`를 누르면 됩니다. Ngrok을 이용해 공유하려면 먼저 [Ngrok 계정 생성](https://dashboard.ngrok.com/signup) 및 [인증 토큰 설정](https://dashboard.ngrok.com/get-started/your-authtoken)이 필요합니다.

> [!NOTE]
> `valet share --region=eu`과 같이 추가 Ngrok 파라미터를 전달할 수 있습니다. 자세한 내용은 [ngrok 공식 문서](https://ngrok.com/docs)를 참고하세요.

<a name="sharing-sites-via-expose"></a>
### Expose를 통한 사이트 공유

[Expose](https://expose.dev)가 설치되어 있다면, 해당 사이트 디렉터리로 이동 후 `expose` 명령어로 사이트를 공유할 수 있습니다. 추가 커맨드 라인 옵션에 대해서는 [Expose 공식 문서](https://expose.dev/docs)를 참고하세요. 공유가 시작되면, 다른 기기나 팀원과 함께 사용할 수 있는 URL이 표시됩니다:

```shell
cd ~/Sites/laravel

expose
```

공유를 중단하려면 `Control + C`를 누르세요.

<a name="sharing-sites-on-your-local-network"></a>
### 로컬 네트워크에서 사이트 공유하기

기본적으로 Valet은 보안을 위해 내부 `127.0.0.1`(로컬 인터페이스)로만 외부 트래픽을 허용합니다.

만약 같은 네트워크에 있는 다른 기기에서 Valet 사이트에 접속하고 싶다면(예: `192.168.1.10/application.test`), 해당 사이트의 Nginx 설정 파일에서 `listen` 항목의 `127.0.0.1:` 부분을 제거해야 합니다. 이때 포트 80, 443 모두 해당됩니다.

프로젝트에 대해 `valet secure` 명령어를 실행하지 않은 경우, `/usr/local/etc/nginx/valet/valet.conf` 파일에서 네트워크 접근 제한을 해제할 수 있습니다. 반면, HTTPS로 서비스를 하고 있다면(`valet secure`를 사용한 경우) `~/.config/valet/Nginx/app-name.test` 파일을 수정해야 합니다.

Nginx 설정을 업데이트한 후에는 `valet restart` 명령어로 변경 사항을 적용하세요.

<a name="site-specific-environment-variables"></a>
## 사이트별 환경 변수

일부 프레임워크에서는 서버 환경 변수에 의존하지만, 프로젝트 내부에서 이를 쉽게 조정할 방법을 제공하지 않을 수도 있습니다. Valet은 프로젝트 루트에 `.valet-env.php` 파일을 추가함으로써 사이트별 환경 변수를 설정할 수 있도록 지원합니다. 이 파일에서는 각각의 사이트와 그에 대응하는 환경 변수 정보를 배열로 반환해야 하며, 설정한 변수들은 해당 사이트 운용 시 글로벌 `$_SERVER` 배열에 자동으로 추가됩니다:

```
<?php

return [
    // 'laravel.test' 사이트에서 $_SERVER['key']를 "value"로 설정
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

때때로, Valet 도메인을 같은 로컬 머신 내 다른 서비스에 프록시하고 싶을 수 있습니다. 예를 들어, Docker로 별도의 서비스를 실행해야 하는데, Valet과 Docker가 동시에 80번 포트를 사용할 수 없는 상황이 있을 수 있습니다.

이런 경우, `proxy` 명령어로 프록시를 생성할 수 있습니다. 예를 들어 `http://elasticsearch.test`의 모든 트래픽을 `http://127.0.0.1:9200`으로 프록시 처리하려면 다음과 같이 실행하세요:

```shell
# HTTP 프록시
valet proxy elasticsearch http://127.0.0.1:9200

# TLS + HTTP/2 프록시
valet proxy elasticsearch http://127.0.0.1:9200 --secure
```

프록시를 삭제하려면 `unproxy` 명령어를 사용합니다:

```shell
valet unproxy elasticsearch
```

프록시된 모든 사이트 구성을 확인하려면 `proxies` 명령어를 이용하세요:

```shell
valet proxies
```

<a name="custom-valet-drivers"></a>
## 커스텀 Valet 드라이버

Valet이 기본적으로 지원하지 않는 프레임워크나 CMS의 PHP 애플리케이션도 직접 "드라이버"를 작성하여 서비스할 수 있습니다. Valet 설치 시 `~/.config/valet/Drivers` 디렉터리가 생성되며, 그 안에 `SampleValetDriver.php` 예제 파일이 함께 제공됩니다. 커스텀 드라이버 작성은 단 세 가지 메서드, 즉 `serves`, `isStaticFile`, `frontControllerPath` 구현만으로 충분합니다.

이 세 메서드 모두 `$sitePath`, `$siteName`, `$uri` 값을 인수로 받습니다. `$sitePath`는 해당 사이트의 전체 경로(`/Users/Lisa/Sites/my-project` 등), `$siteName`은 도메인의 호스트/사이트명 부분(`my-project`), `$uri`는 들어온 요청의 URI(`/foo/bar`)입니다.

커스텀 드라이버 완성 후, `~/.config/valet/Drivers` 디렉터리에 `FrameworkValetDriver.php`와 같은 네이밍 규칙으로 파일을 저장합니다. 예를 들어 WordPress용 커스텀 드라이버라면 파일명을 `WordPressValetDriver.php`로 지정해야 합니다.

각 메서드별 예제 구현을 살펴보겠습니다.

<a name="the-serves-method"></a>
#### `serves` 메서드

`serves` 메서드는 현재 요청을 해당 드라이버가 처리할지 여부를 `true`/`false`로 반환합니다. 여기서 `$sitePath`가 해당 프레임워크(예: WordPress) 프로젝트인지 판별하는 로직을 작성합니다.

예를 들어, WordPress용 드라이버의 경우 아래와 같이 구현할 수 있습니다:

```
/**
 * 드라이버가 이 요청을 처리할지 여부 반환
 *
 * @param  string  $sitePath
 * @param  string  $siteName
 * @param  string  $uri
 * @return bool
 */
public function serves($sitePath, $siteName, $uri)
{
    return is_dir($sitePath.'/wp-admin');
}
```

<a name="the-isstaticfile-method"></a>
#### `isStaticFile` 메서드

`isStaticFile`은 요청이 이미지, 스타일시트 등 "정적 파일"에 대한 것인지 판별합니다. 정적 파일이면 해당 파일의 전체 경로를 반환하고, 아니면 `false`를 반환합니다:

```
/**
 * 요청이 정적 파일에 대한 것인지 판별
 *
 * @param  string  $sitePath
 * @param  string  $siteName
 * @param  string  $uri
 * @return string|false
 */
public function isStaticFile($sitePath, $siteName, $uri)
{
    if (file_exists($staticFilePath = $sitePath.'/public/'.$uri)) {
        return $staticFilePath;
    }

    return false;
}
```

> [!WARNING]
> `isStaticFile` 메서드는 `serves`가 `true`를 반환하고, URI가 `/`가 아니어야만 호출됩니다.

<a name="the-frontcontrollerpath-method"></a>
#### `frontControllerPath` 메서드

`frontControllerPath` 메서드는 애플리케이션의 "프론트 컨트롤러"(일반적으로 `index.php` 파일)의 전체 경로를 반환해야 합니다:

```
/**
 * 애플리케이션 프론트 컨트롤러의 전체 경로 반환
 *
 * @param  string  $sitePath
 * @param  string  $siteName
 * @param  string  $uri
 * @return string
 */
public function frontControllerPath($sitePath, $siteName, $uri)
{
    return $sitePath.'/public/index.php';
}
```

<a name="local-drivers"></a>
### 로컬 드라이버

단일 애플리케이션에만 해당하는 커스텀 Valet 드라이버를 만들고 싶다면, 애플리케이션 루트 디렉터리에 `LocalValetDriver.php` 파일을 생성하면 됩니다. 이때 베이스 `ValetDriver` 클래스나 기존 프레임워크 전용 드라이버(예: `LaravelValetDriver`)를 확장할 수 있습니다:

```
use Valet\Drivers\LaravelValetDriver;

class LocalValetDriver extends LaravelValetDriver
{
    /**
     * 드라이버가 이 요청을 처리할지 여부 반환
     *
     * @param  string  $sitePath
     * @param  string  $siteName
     * @param  string  $uri
     * @return bool
     */
    public function serves($sitePath, $siteName, $uri)
    {
        return true;
    }

    /**
     * 애플리케이션 프론트 컨트롤러의 전체 경로 반환
     *
     * @param  string  $sitePath
     * @param  string  $siteName
     * @param  string  $uri
     * @return string
     */
    public function frontControllerPath($sitePath, $siteName, $uri)
    {
        return $sitePath.'/public_html/index.php';
    }
}
```

<a name="other-valet-commands"></a>
## 기타 Valet 명령어

Command  | 설명
------------- | -------------
`valet list` | 모든 Valet 명령어의 목록을 출력합니다.
`valet forget` | "파킹"된 디렉터리에서 실행하여 파킹 목록에서 해당 디렉터리를 제거할 수 있습니다.
`valet log` | Valet의 서비스들이 기록한 로그 목록을 확인합니다.
`valet paths` | 전체 "파킹"된 경로를 확인할 수 있습니다.
`valet restart` | Valet 데몬을 재시작합니다.
`valet start` | Valet 데몬을 시작합니다.
`valet stop` | Valet 데몬을 중단합니다.
`valet trust` | Brew와 Valet에 대한 sudoers 파일을 추가하여, Valet 명령어 실행 시 비밀번호 입력을 생략할 수 있게 합니다.
`valet uninstall` | Valet을 제거합니다: 수동 삭제 방법을 안내하며, `--force` 옵션 사용 시 Valet의 모든 리소스를 강제로 삭제합니다.

<a name="valet-directories-and-files"></a>
## Valet 디렉터리 및 파일

Valet 환경에서 문제가 생겼을 때 아래 경로나 파일 정보를 참고하면 도움이 될 수 있습니다:

#### `~/.config/valet`

Valet의 전체 설정이 저장된 디렉터리입니다. 이 폴더의 백업을 별도로 보관해두는 것도 좋습니다.

#### `~/.config/valet/dnsmasq.d/`

이 디렉터리에는 DNSMasq의 설정 파일들이 들어있습니다.

#### `~/.config/valet/Drivers/`

Valet의 드라이버가 저장된 디렉터리입니다. 각 프레임워크/CMS를 어떻게 서비스할 지 결정합니다.

#### `~/.config/valet/Extensions/`

여기에는 커스텀 Valet 확장/명령어가 저장됩니다.

#### `~/.config/valet/Nginx/`

Valet이 관리하는 모든 Nginx 사이트 설정 파일이 들어있습니다. `install` 및 `secure` 명령어 실행 시 이 파일들이 재생성됩니다.

#### `~/.config/valet/Sites/`

[링크된 프로젝트](#the-link-command)에 대한 모든 심볼릭 링크가 저장된 폴더입니다.

#### `~/.config/valet/config.json`

Valet의 마스터 설정 파일입니다.

#### `~/.config/valet/valet.sock`

Valet의 Nginx가 사용하는 PHP-FPM 소켓입니다. PHP가 제대로 동작하고 있을 때만 존재합니다.

#### `~/.config/valet/Log/fpm-php.www.log`

PHP 에러 로그가 기록되는 파일입니다.

#### `~/.config/valet/Log/nginx-error.log`

Nginx 에러 로그가 기록됩니다.

#### `/usr/local/var/log/php-fpm.log`

시스템 PHP-FPM 에러 로그 파일입니다.

#### `/usr/local/var/log/nginx`

Nginx의 접근 및 에러 로그가 저장되는 디렉터리입니다.

#### `/usr/local/etc/php/X.X/conf.d`

여기에는 다양한 PHP 설정 값을 담은 `*.ini` 파일이 저장됩니다.

#### `/usr/local/etc/php/X.X/php-fpm.d/valet-fpm.conf`

PHP-FPM 풀 설정 파일입니다.

#### `~/.composer/vendor/laravel/valet/cli/stubs/secure.valet.conf`

SSL 인증서 생성을 위한 기본 Nginx 설정 파일입니다.

<a name="disk-access"></a>
### 디스크 접근 권한

macOS 10.14 이후로는 [일부 파일 및 디렉터리에 대한 접근이 기본적으로 제한](https://manuals.info.apple.com/MANUALS/1000/MA1902/en_US/apple-platform-security-guide.pdf)됩니다. 데스크탑, 문서, 다운로드 폴더를 비롯해, 네트워크 및 이동식 볼륨 접근도 제한을 받습니다. 따라서 Valet에서 사이트 폴더는 이런 보호된 위치가 아닌 곳에 두는 것이 좋습니다.

하지만 이 경로 내에서 서비스를 진행해야 한다면, Nginx에게 "전체 디스크 접근 권한(Full Disk Access)"을 부여해야 합니다. 그렇지 않으면 서버 에러나 정적 에셋 관련 예기치 않은 문제가 발생할 수 있습니다. 일반적으로 macOS가 자동으로 접근 권한 요청 알림을 띄워주지만, 직접 설정하려면 `시스템 환경설정` > `보안 및 개인 정보 보호` > `개인 정보` 메뉴의 `전체 디스크 접근`에서 Nginx를 추가로 선택해주면 됩니다. 이후 메인 창에서 `nginx` 항목을 활성화하세요.