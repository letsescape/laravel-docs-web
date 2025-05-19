# 라라벨 홈스테드 (Laravel Homestead)

- [소개](#introduction)
- [설치 및 설정](#installation-and-setup)
    - [첫 단계](#first-steps)
    - [Homestead 설정](#configuring-homestead)
    - [Nginx 사이트 설정](#configuring-nginx-sites)
    - [서비스 설정](#configuring-services)
    - [Vagrant 박스 실행](#launching-the-vagrant-box)
    - [프로젝트별 설치](#per-project-installation)
    - [옵션 기능 설치](#installing-optional-features)
    - [별칭(Alias) 설정](#aliases)
- [Homestead 업데이트](#updating-homestead)
- [일상적인 사용](#daily-usage)
    - [SSH로 접속하기](#connecting-via-ssh)
    - [추가 사이트 등록](#adding-additional-sites)
    - [환경 변수](#environment-variables)
    - [포트 설정](#ports)
    - [PHP 버전 사용하기](#php-versions)
    - [데이터베이스 연결](#connecting-to-databases)
    - [데이터베이스 생성](#creating-databases)
    - [데이터베이스 백업](#database-backups)
    - [크론 스케줄 설정](#configuring-cron-schedules)
    - [MailHog 설정](#configuring-mailhog)
    - [Minio 설정](#configuring-minio)
    - [Laravel Dusk 사용](#laravel-dusk)
    - [환경 공유하기](#sharing-your-environment)
- [디버깅 및 프로파일링](#debugging-and-profiling)
    - [Xdebug로 웹 요청 디버깅](#debugging-web-requests)
    - [CLI 애플리케이션 디버깅](#debugging-cli-applications)
    - [Blackfire로 애플리케이션 프로파일링](#profiling-applications-with-blackfire)
- [네트워크 인터페이스](#network-interfaces)
- [Homestead 확장](#extending-homestead)
- [프로바이더별 설정](#provider-specific-settings)
    - [VirtualBox](#provider-specific-virtualbox)

<a name="introduction"></a>
## 소개

라라벨은 PHP 개발 환경 전반을 더욱 즐겁고 편리하게 만들고자 합니다. [Laravel Homestead](https://github.com/laravel/homestead)는 공식적으로 제공되는 사전 패키지화된 Vagrant 박스로, 로컬 컴퓨터에 PHP, 웹 서버, 기타 서버 소프트웨어를 직접 설치하지 않고도 훌륭한 개발 환경을 제공합니다.

[Vagrant](https://www.vagrantup.com)는 가상 머신을 쉽게 관리하고 프로비저닝할 수 있는 간편하고 세련된 방식을 제공합니다. Vagrant 박스는 언제든지 쉽게 초기화가 가능합니다. 문제가 발생하면 가상 머신을 몇 분 만에 삭제하고 다시 만들 수 있습니다!

Homestead는 Windows, macOS, Linux 환경 모두에서 동작하며, Nginx, PHP, MySQL, PostgreSQL, Redis, Memcached, Node 등 라라벨 애플리케이션 개발에 필요한 모든 소프트웨어가 기본 내장되어 있습니다.

> [!WARNING]
> Windows를 사용 중이라면 하드웨어 가상화(VT-x)를 활성화해야 할 수도 있습니다. 보통 BIOS에서 설정할 수 있습니다. 만약 UEFI 시스템에서 Hyper-V를 사용하고 있다면 VT-x 접속을 위해 Hyper-V를 비활성화해야 할 수도 있습니다.

<a name="included-software"></a>
### 기본 포함 소프트웨어

<div id="software-list" markdown="1">

- Ubuntu 20.04
- Git
- PHP 8.2 (기본값)
- PHP 8.1
- PHP 8.0
- PHP 7.4
- PHP 7.3
- PHP 7.2
- PHP 7.1
- PHP 7.0
- PHP 5.6
- Nginx
- MySQL 8.0
- lmm
- Sqlite3
- PostgreSQL 15
- Composer
- Docker
- Node 18 (Yarn, Bower, Grunt, Gulp 포함)
- Redis
- Memcached
- Beanstalkd
- Mailhog
- avahi
- ngrok
- Xdebug
- XHProf / Tideways / XHGui
- wp-cli

</div>

<a name="optional-software"></a>
### 옵션 소프트웨어

<div id="software-list" markdown="1">

- Apache
- Blackfire
- Cassandra
- Chronograf
- CouchDB
- Crystal & Lucky Framework
- Elasticsearch
- EventStoreDB
- Flyway
- Gearman
- Go
- Grafana
- Heroku CLI
- InfluxDB
- MariaDB
- Meilisearch
- MinIO
- MongoDB
- Neo4j
- Oh My Zsh
- Open Resty
- PM2
- Python 3
- R
- RabbitMQ
- RVM (Ruby Version Manager)
- Solr
- TimescaleDB
- Trader <small>(PHP 확장)</small>
- Webdriver & Laravel Dusk 유틸리티

</div>

<a name="installation-and-setup"></a>
## 설치 및 설정

<a name="first-steps"></a>
### 첫 단계

Homestead 환경을 시작하기 전에 [Vagrant](https://developer.hashicorp.com/vagrant/downloads)와 아래 지원되는 프로바이더 중 하나를 설치해야 합니다.

- [VirtualBox 6.1.x](https://www.virtualbox.org/wiki/Downloads)
- [Parallels](https://www.parallels.com/products/desktop/)

위 소프트웨어들은 대부분 운영체제에 맞는 간편한 설치 프로그램을 제공합니다.

Parallels 프로바이더를 사용하려면 [Parallels Vagrant 플러그인](https://github.com/Parallels/vagrant-parallels)을 추가로 설치해야 합니다. 해당 플러그인은 무료입니다.

<a name="installing-homestead"></a>
#### Homestead 설치

Homestead 저장소를 호스트 컴퓨터로 클론(clone)하여 Homestead를 설치할 수 있습니다. Homestead 가상 머신이 모든 라라벨 애플리케이션의 호스트 역할을 하므로, 홈 디렉터리 내에 `Homestead` 폴더로 클론하는 것을 권장합니다. 본 문서에서는 해당 디렉터리를 "Homestead 디렉터리"라 칭합니다.

```shell
git clone https://github.com/laravel/homestead.git ~/Homestead
```

저장소를 클론한 후에는 `release` 브랜치로 체크아웃해야 합니다. 이 브랜치에는 항상 Homestead의 최신 안정 버전이 포함되어 있습니다.

```shell
cd ~/Homestead

git checkout release
```

그 다음, Homestead 디렉터리에서 `bash init.sh` 명령어를 실행하여 `Homestead.yaml` 설정 파일을 생성합니다. 이 파일에서 Homestead 설치에 필요한 모든 설정을 하게 됩니다. 설정 파일은 Homestead 디렉터리에 생성됩니다.

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

<a name="configuring-homestead"></a>
### Homestead 설정

<a name="setting-your-provider"></a>
#### 프로바이더 설정

`Homestead.yaml` 파일의 `provider` 키는 어떤 Vagrant 프로바이더를 사용할지 지정합니다. 사용할 수 있는 값은 `virtualbox` 또는 `parallels`입니다.

```
provider: virtualbox
```

> [!WARNING]
> Apple Silicon을 사용하는 경우, `Homestead.yaml` 파일에 `box: laravel/homestead-arm`을 추가해야 합니다. Apple Silicon에서는 Parallels 프로바이더가 필요합니다.

<a name="configuring-shared-folders"></a>
#### 공유 폴더 설정

`Homestead.yaml` 파일의 `folders` 속성에는 Homestead 환경과 공유할 로컬 폴더들을 나열합니다. 해당 폴더 내 파일이 변경되면 로컬과 가상 머신 간에 동기화가 자동으로 이루어집니다. 필요에 따라 여러 개의 폴더를 공유할 수 있습니다.

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
```

> [!WARNING]
> Windows 사용자는 `~/` 경로 대신 프로젝트의 전체 경로(예: `C:\Users\user\Code\project1`)를 사용해야 합니다.

각 애플리케이션별로 폴더 매핑을 개별적으로 지정하는 것이 좋습니다. 하나의 큰 폴더에 모든 프로젝트를 모아 매핑한다고 해서 효율적이지 않습니다. 폴더를 하나 매핑하면 가상 머신이 해당 폴더 내 모든 파일의 디스크 IO를 추적해야 하므로, 파일 수가 많을수록 성능 저하가 발생할 수 있습니다.

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
    - map: ~/code/project2
      to: /home/vagrant/project2
```

> [!WARNING]
> Homestead 사용 시 `.`(현재 디렉터리)를 절대로 마운트해서는 안 됩니다. 그렇게 하면 Vagrant가 현재 폴더를 `/vagrant`로 매핑하지 않아, 선택적 기능들이 제대로 동작하지 않거나 예기치 않은 문제가 발생할 수 있습니다.

[NFS](https://www.vagrantup.com/docs/synced-folders/nfs.html) 공유 기능을 활성화하려면 매핑에 `type` 옵션을 추가할 수 있습니다.

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "nfs"
```

> [!WARNING]
> Windows에서 NFS를 사용할 경우, [vagrant-winnfsd](https://github.com/winnfsd/vagrant-winnfsd) 플러그인 설치를 권장합니다. 이 플러그인은 Homestead 가상 머신 내 파일 및 디렉터리의 사용자/그룹 권한을 올바르게 유지합니다.

또한, Vagrant의 [Synced Folders](https://www.vagrantup.com/docs/synced-folders/basic_usage.html)에서 지원하는 추가 옵션들을 `options` 키 아래에 지정할 수 있습니다.

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "rsync"
      options:
          rsync__args: ["--verbose", "--archive", "--delete", "-zz"]
          rsync__exclude: ["node_modules"]
```

<a name="configuring-nginx-sites"></a>
### Nginx 사이트 설정

Nginx에 익숙하지 않으셔도 괜찮습니다. `Homestead.yaml` 파일의 `sites` 속성을 이용하면 도메인과 Homestead 환경 내부의 폴더를 쉽게 매핑할 수 있습니다. 예시 사이트 설정이 기본으로 포함되어 있습니다. 상황에 따라 여러 개의 사이트를 추가할 수 있습니다. Homestead는 여러분이 작업하는 모든 라라벨 애플리케이션을 위한 편리한 가상 환경이 될 수 있습니다.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
```

`sites` 속성을 변경한 경우에는 Homestead 가상 머신에서 `vagrant reload --provision` 명령어를 실행해야 Nginx 설정이 갱신됩니다.

> [!WARNING]
> Homestead 스크립트는 최대한 멱등성(idempotency)을 지키도록 설계되었습니다. 하지만 프로비저닝 중 문제가 발생한다면 `vagrant destroy && vagrant up` 명령어로 가상 머신을 삭제 후 재생성하면 문제를 해결할 수 있습니다.

<a name="hostname-resolution"></a>
#### 호스트네임(Hostname) 해석

Homestead는 자동 호스트네임 해석을 위해 `mDNS`를 이용해 호스트네임을 게시합니다. 만약 `Homestead.yaml` 파일에서 `hostname: homestead`로 설정하면, 해당 호스트는 `homestead.local` 주소로 접근할 수 있습니다. macOS, iOS, Linux 데스크톱에는 기본적으로 `mDNS` 지원이 내장되어 있습니다. Windows를 사용하는 경우 [Bonjour Print Services for Windows](https://support.apple.com/kb/DL999?viewlocale=en_US&locale=en_US)를 추가로 설치해야 합니다.

자동 호스트네임 기능은 [프로젝트별 Homestead 설치](#per-project-installation)에서 가장 효과적으로 동작합니다. 하나의 Homestead 인스턴스에서 여러 사이트를 운영한다면, 웹 사이트별 "domains"를 로컬 컴퓨터의 `hosts` 파일에 추가해야 합니다. `hosts` 파일은 Homestead 사이트로의 요청을 가상 머신으로 연결해 줍니다. macOS 및 Linux에서는 `/etc/hosts`, Windows에서는 `C:\Windows\System32\drivers\etc\hosts`에 위치해 있습니다. 아래와 같이 추가하면 됩니다.

```
192.168.56.56  homestead.test
```

여기서 IP 주소는 `Homestead.yaml`에 지정된 값과 동일해야 합니다. 도메인을 `hosts` 파일에 추가하고 Vagrant 박스를 실행하면 웹 브라우저를 통해 사이트에 접속할 수 있습니다.

```shell
http://homestead.test
```

<a name="configuring-services"></a>
### 서비스 설정

Homestead는 여러 가지 서비스를 기본으로 시작합니다. 다만, 프로비저닝 과정에서 어떤 서비스를 활성화 혹은 비활성화할지 직접 설정할 수도 있습니다. 예를 들어, PostgreSQL을 활성화하고 MySQL을 비활성화하려면 `Homestead.yaml` 파일의 `services` 옵션을 다음과 같이 수정합니다.

```yaml
services:
    - enabled:
        - "postgresql"
    - disabled:
        - "mysql"
```

`enabled` 및 `disabled`에 지정한 순서에 따라, 해당 서비스가 시작 혹은 중지됩니다.

<a name="launching-the-vagrant-box"></a>
### Vagrant 박스 실행

`Homestead.yaml` 파일을 원하는 대로 수정한 후, Homestead 디렉터리에서 `vagrant up` 명령어를 실행합니다. Vagrant가 가상 머신을 부팅하고, 자동으로 공유 폴더와 Nginx 사이트를 설정해 줍니다.

가상 머신을 삭제하려면 `vagrant destroy` 명령어를 사용합니다.

<a name="per-project-installation"></a>
### 프로젝트별 설치

Homestead를 전역으로 설치하여 모든 프로젝트에서 공유하는 대신, 각 프로젝트에 Homestead 인스턴스를 별도로 구성할 수도 있습니다. 프로젝트별 설치는 프로젝트에 `Vagrantfile`을 포함해 동료들이 프로젝트를 클론한 후 바로 `vagrant up`만으로 개발 환경을 실행할 수 있으므로 편리합니다.

프로젝트에 Homestead를 설치하려면 Composer 패키지 매니저를 이용합니다.

```shell
composer require laravel/homestead --dev
```

설치가 끝나면, Homestead의 `make` 명령어를 실행하여 해당 프로젝트에 맞는 `Vagrantfile`과 `Homestead.yaml` 파일을 생성하세요. 두 파일은 프로젝트 루트에 위치하게 됩니다. `make` 명령어가 `Homestead.yaml` 내 `sites`와 `folders` 지시문도 자동으로 설정해 줍니다.

```shell
# macOS / Linux...
php vendor/bin/homestead make

# Windows...
vendor\\bin\\homestead make
```

그 다음 터미널에서 `vagrant up` 명령어를 실행하고, 브라우저에서 `http://homestead.test`로 접속하면 됩니다. 자동 [호스트네임 해석](#hostname-resolution)을 사용하지 않는다면, `/etc/hosts` 파일에 `homestead.test`나 원하는 도메인을 추가해야 합니다.

<a name="installing-optional-features"></a>
### 옵션 기능 설치

추가 소프트웨어(옵션 기능)는 `Homestead.yaml` 파일 내 `features` 옵션을 통해 설치할 수 있습니다. 대부분의 기능은 불리언 값으로 활성화/비활성화하나, 일부 기능은 다양한 세부 설정 옵션을 지원합니다.

```yaml
features:
    - blackfire:
        server_id: "server_id"
        server_token: "server_value"
        client_id: "client_id"
        client_token: "client_value"
    - cassandra: true
    - chronograf: true
    - couchdb: true
    - crystal: true
    - elasticsearch:
        version: 7.9.0
    - eventstore: true
        version: 21.2.0
    - flyway: true
    - gearman: true
    - golang: true
    - grafana: true
    - heroku: true
    - influxdb: true
    - mariadb: true
    - meilisearch: true
    - minio: true
    - mongodb: true
    - mysql: true
    - neo4j: true
    - ohmyzsh: true
    - openresty: true
    - pm2: true
    - python: true
    - r-base: true
    - rabbitmq: true
    - rvm: true
    - solr: true
    - timescaledb: true
    - trader: true
    - webdriver: true
```

<a name="elasticsearch"></a>
#### Elasticsearch

지원되는 Elasticsearch 버전을 명확하게(major.minor.patch) 지정할 수 있습니다. 기본 설치는 클러스터 이름으로 'homestead'를 할당합니다. Elasticsearch에는 운영체제 메모리의 반 이상을 할당하면 안 되므로, Homestead 가상 머신의 메모리 용량이 Elasticsearch 할당량의 두 배 이상이 되도록 해야 합니다.

> [!NOTE]
> [Elasticsearch 공식 문서](https://www.elastic.co/guide/en/elasticsearch/reference/current)를 참고하면 다양한 구성 방법을 확인할 수 있습니다.

<a name="mariadb"></a>
#### MariaDB

MariaDB를 활성화하면 MySQL이 삭제되고 MariaDB가 설치됩니다. MariaDB는 일반적으로 MySQL과 호환되어 대체 가능하므로, 애플리케이션의 데이터베이스 설정에서 여전히 `mysql` 드라이버를 사용해야 합니다.

```yaml
features:
  - mariadb: true
```

<a name="mongodb"></a>
#### MongoDB

MongoDB를 기본으로 설치할 경우, 데이터베이스 사용자 이름은 `homestead`, 비밀번호는 `secret`으로 설정됩니다.

<a name="neo4j"></a>
#### Neo4j

Neo4j를 기본으로 설치하면 데이터베이스 사용자 이름은 `homestead`, 비밀번호는 `secret`이 설정됩니다. Neo4j 브라우저는 웹 브라우저로 `http://homestead.test:7474`에 접속하여 사용할 수 있습니다. 포트 `7687`(Bolt), `7474`(HTTP), `7473`(HTTPS)가 Neo4j 클라이언트용으로 오픈되어 있습니다.

<a name="aliases"></a>
### 별칭(Alias) 설정

Homestead 가상 머신에 Bash 별칭을 추가하려면 Homestead 디렉터리 내 `aliases` 파일을 수정하세요.

```shell
alias c='clear'
alias ..='cd ..'
```

별칭을 수정한 이후에는 `vagrant reload --provision` 명령어로 Homestead 가상 머신을 다시 프로비저닝해야 새로운 별칭이 적용됩니다.

<a name="updating-homestead"></a>
## Homestead 업데이트

Homestead를 업데이트하기 전에, 현재 가상 머신을 제거해야 합니다. Homestead 디렉터리에서 다음 명령어를 실행하세요.

```shell
vagrant destroy
```

그런 다음 Homestead 소스 코드를 갱신해야 합니다. 저장소를 클론한 상태라면, 처음 클론한 위치에서 다음 명령어를 입력합니다.

```shell
git fetch

git pull origin release
```

이 명령들은 Homestead의 최신 코드를 GitHub 저장소에서 받아오고, 최신 태그를 가져와 최신 릴리즈로 체크아웃합니다. 최신 안정 버전은 Homestead의 [GitHub 릴리즈 페이지](https://github.com/laravel/homestead/releases)에서 확인할 수 있습니다.

만약 프로젝트의 `composer.json` 파일로 Homestead를 설치한 경우, `composer.json`에 `"laravel/homestead": "^12"`가 포함되어 있는지 확인하고 다음과 같이 의존성을 업데이트해야 합니다.

```shell
composer update
```

이어 `vagrant box update` 명령어로 Vagrant 박스를 갱신합니다.

```shell
vagrant box update
```

박스가 갱신된 뒤, Homestead 디렉터리에서 `bash init.sh` 명령어를 실행하여 Homestead의 추가 설정 파일도 갱신하세요. 이 과정에서 기존 `Homestead.yaml`, `after.sh`, `aliases` 파일을 덮어쓸 것인지 질문할 수 있습니다.

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

마지막으로, 업그레이드된 환경을 사용하려면 Homestead 가상 머신을 재생성해야 합니다.

```shell
vagrant up
```

<a name="daily-usage"></a>
## 일상적인 사용

<a name="connecting-via-ssh"></a>
### SSH로 접속하기

Homestead 디렉터리에서 `vagrant ssh` 명령어를 실행하면 가상 머신에 SSH 접속할 수 있습니다.

<a name="adding-additional-sites"></a>
### 추가 사이트 등록

Homestead 환경이 프로비저닝되고 실행 중이라면, 새로운 라라벨 프로젝트를 위한 추가 Nginx 사이트를 등록하고 싶을 수 있습니다. Homestead 환경에서는 원하는 만큼 여러 라라벨 프로젝트를 동시 실행할 수 있습니다. 추가 사이트를 등록하려면 `Homestead.yaml`에 사이트를 추가하세요.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
    - map: another.test
      to: /home/vagrant/project2/public
```

> [!WARNING]
> [공유 폴더 설정](#configuring-shared-folders)을 통해 프로젝트 폴더 매핑이 선행되어 있어야 합니다.

Vagrant가 "hosts" 파일을 자동으로 관리하지 않는 경우, 추가한 새 사이트도 hosts 파일에 등록해야 합니다. macOS, Linux에서는 `/etc/hosts`, Windows에서는 `C:\Windows\System32\drivers\etc\hosts`입니다.

```
192.168.56.56  homestead.test
192.168.56.56  another.test
```

사이트를 추가한 후 `vagrant reload --provision` 명령어를 Homestead 디렉터리에서 실행합니다.

<a name="site-types"></a>
#### 사이트 타입

Homestead에서는 여러 유형의 "사이트 타입"을 지원하므로 라라벨 기반이 아닌 다른 프로젝트도 쉽게 실행할 수 있습니다. 예를 들어, `statamic` 타입을 이용해 Statamic 애플리케이션도 Homestead에서 바로 추가할 수 있습니다.

```yaml
sites:
    - map: statamic.test
      to: /home/vagrant/my-symfony-project/web
      type: "statamic"
```

지원되는 사이트 타입은 다음과 같습니다: `apache`, `apigility`, `expressive`, `laravel`(기본값), `proxy`, `silverstripe`, `statamic`, `symfony2`, `symfony4`, `zf`.

<a name="site-parameters"></a>
#### 사이트 파라미터

사이트에 추가로 Nginx `fastcgi_param` 값을 지정하려면 `params` 항목을 활용할 수 있습니다.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      params:
          - key: FOO
            value: BAR
```

<a name="environment-variables"></a>
### 환경 변수

전역 환경 변수를 모두 `Homestead.yaml` 파일에 정의할 수 있습니다.

```yaml
variables:
    - key: APP_ENV
      value: local
    - key: FOO
      value: bar
```

`Homestead.yaml` 파일을 수정한 뒤에는 `vagrant reload --provision` 명령어로 가상 머신을 다시 프로비저닝하세요. 이 명령은 모든 설치된 PHP 버전의 PHP-FPM 설정과 `vagrant` 사용자의 환경 변수도 갱신합니다.

<a name="ports"></a>
### 포트 설정

기본적으로 아래 포트가 Homestead 환경으로 포워딩됩니다.

<div class="content-list" markdown="1">

- **HTTP:** 8000 &rarr; 80으로 포워딩
- **HTTPS:** 44300 &rarr; 443으로 포워딩

</div>

<a name="forwarding-additional-ports"></a>
#### 추가 포트 포워딩

필요할 경우, `Homestead.yaml` 파일의 `ports` 항목에 추가 포트 포워딩 설정을 할 수 있습니다. 파일 수정 후 `vagrant reload --provision` 명령어로 프로비저닝을 다시 해주세요.

```yaml
ports:
    - send: 50000
      to: 5000
    - send: 7777
      to: 777
      protocol: udp
```

아래는 가상 머신과 연결할 수 있는 Homestead 서비스의 추가 포트 목록입니다.

<div class="content-list" markdown="1">

- **SSH:** 2222 &rarr; 22
- **ngrok UI:** 4040 &rarr; 4040
- **MySQL:** 33060 &rarr; 3306
- **PostgreSQL:** 54320 &rarr; 5432
- **MongoDB:** 27017 &rarr; 27017
- **Mailhog:** 8025 &rarr; 8025
- **Minio:** 9600 &rarr; 9600

</div>

<a name="php-versions"></a>
### PHP 버전 사용하기

Homestead는 하나의 가상 머신에서 여러 버전의 PHP를 동시에 실행할 수 있습니다. 각 사이트별로 사용할 PHP 버전을 `Homestead.yaml` 파일에서 지정할 수 있습니다. 지원하는 PHP 버전은 "5.6", "7.0", "7.1", "7.2", "7.3", "7.4", "8.0", "8.1", "8.2"(기본값)입니다.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      php: "7.4"
```

[Homestead 가상 머신 내부](#connecting-via-ssh)에서는 CLI로 각 PHP 버전을 아래처럼 사용할 수 있습니다.

```shell
php5.6 artisan list
php7.0 artisan list
php7.1 artisan list
php7.2 artisan list
php7.3 artisan list
php7.4 artisan list
php8.0 artisan list
php8.1 artisan list
php8.2 artisan list
```

CLI에서 기본적으로 사용할 PHP 버전도 `Homestead.yaml`에서 지정할 수 있습니다.

```yaml
php: 8.0
```

또는 가상 머신 내부에서 다음 명령어로 수동 전환도 가능합니다.

```shell
php56
php70
php71
php72
php73
php74
php80
php81
php82
```

<a name="connecting-to-databases"></a>
### 데이터베이스 연결

초기 설정에서 MySQL과 PostgreSQL 모두에 `homestead`라는 기본 데이터베이스가 만들어집니다. 로컬 컴퓨터에서 데이터베이스 클라이언트로 접속하려면 `127.0.0.1`의 포트 `33060`(MySQL) 또는 `54320`(PostgreSQL)으로 접속해야 합니다. 사용자명과 비밀번호는 모두 `homestead` / `secret`입니다.

> [!WARNING]
> 호스트(로컬) 컴퓨터에서 데이터베이스에 접속할 때만 위 포트를 사용해야 합니다. Homestead 가상 머신 내부(즉, 라라벨 애플리케이션 환경)에서는 기본 포트인 3306과 5432를 데이터베이스 설정에서 사용합니다.

<a name="creating-databases"></a>
### 데이터베이스 생성

Homestead는 여러분의 애플리케이션에서 필요로 하는 데이터베이스를 자동으로 생성할 수 있습니다. 데이터베이스 서비스가 실행 중이라면, `Homestead.yaml`에 등록된 모든 데이터베이스가(존재하지 않는 경우) 자동으로 생성됩니다.

```yaml
databases:
  - database_1
  - database_2
```

<a name="database-backups"></a>
### 데이터베이스 백업

Homestead는 가상 머신이 삭제될 때 데이터베이스를 자동으로 백업할 수 있습니다. 해당 기능을 사용하려면 Vagrant 2.1.0 이상이 설치되어 있어야 하며, 이전 버전에서 사용하려면 `vagrant-triggers` 플러그인이 필요합니다. 자동 백업을 활성화하려면 `Homestead.yaml` 파일에 아래 한 줄을 추가하세요.

```
backup: true
```

설정 후, `vagrant destroy` 명령어로 가상 머신을 삭제하면 Homestead가 데이터베이스를 `.backup/mysql_backup` 및 `.backup/postgres_backup` 디렉터리로 내보냅니다. 이 디렉터리는 Homestead를 설치한 폴더나, [프로젝트별 설치](#per-project-installation)를 사용 중이라면 프로젝트 루트에 생성됩니다.

<a name="configuring-cron-schedules"></a>
### 크론 스케줄 설정

라라벨은 [크론 작업 예약](/docs/9.x/scheduling)을 싱글 `schedule:run` 아티즌 명령어로 자동화하는 편리한 방법을 제공합니다. 이 명령은 `App\Console\Kernel`에 정의된 스케줄을 확인해 예약된 작업을 실행합니다.

Homestead 사이트에서 `schedule:run` 명령어를 매 분 실행하고 싶다면, 사이트 정의 시 `schedule` 옵션을 `true`로 설정하세요.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      schedule: true
```

사이트의 크론 작업은 Homestead 가상 머신의 `/etc/cron.d` 디렉터리에 정의됩니다.

<a name="configuring-mailhog"></a>
### MailHog 설정

[MailHog](https://github.com/mailhog/MailHog)는 실제 수신자에게 메일을 전송하지 않고도 메일 내용을 확인할 수 있게 해주는 도구입니다. 시작하려면 애플리케이션의 `.env` 파일에 다음과 같이 메일 설정을 추가하세요.

```ini
MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

설정 후에는 `http://localhost:8025`에서 MailHog 대시보드에 접속할 수 있습니다.

<a name="configuring-minio"></a>
### Minio 설정

[Minio](https://github.com/minio/minio)는 Amazon S3와 호환되는 API를 제공하는 오픈소스 객체 스토리지 서버입니다. Minio를 설치하려면 [옵션 기능](#installing-optional-features) 설정에 다음 항목을 추가하세요.

```
minio: true
```

기본적으로 Minio는 포트 9600에서 사용할 수 있습니다. 컨트롤 패널은 `http://localhost:9600`에서 접근할 수 있으며, 기본 액세스 키는 `homestead`, 비밀 키는 `secretkey`입니다. Minio 사용 시에는 항상 `us-east-1` 리전을 사용해야 합니다.

Minio 사용을 위해서는 애플리케이션의 `config/filesystems.php` 파일 내 S3 디스크 설정을 변경해야 합니다. `use_path_style_endpoint` 옵션을 추가하고, `url` 키는 `endpoint`로 변경합니다.

```
's3' => [
    'driver' => 's3',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION'),
    'bucket' => env('AWS_BUCKET'),
    'endpoint' => env('AWS_URL'),
    'use_path_style_endpoint' => true,
]
```

.env 파일에도 아래와 같이 추가해야 합니다.

```ini
AWS_ACCESS_KEY_ID=homestead
AWS_SECRET_ACCESS_KEY=secretkey
AWS_DEFAULT_REGION=us-east-1
AWS_URL=http://localhost:9600
```

Minio 기반의 "S3" 버킷을 사용하려면, `Homestead.yaml` 파일에 `buckets` 항목을 추가하세요. 버킷을 정의한 뒤에는 반드시 `vagrant reload --provision` 명령어로 반영해야 합니다.

```yaml
buckets:
    - name: your-bucket
      policy: public
    - name: your-private-bucket
      policy: none
```

`policy`에는 `none`, `download`, `upload`, `public` 중 하나를 지정할 수 있습니다.

<a name="laravel-dusk"></a>
### Laravel Dusk 사용

Homestead 내에서 [Laravel Dusk](/docs/9.x/dusk) 테스트를 실행하려면, [옵션 기능 설치](#installing-optional-features)에서 `webdriver` 기능을 활성화하세요.

```yaml
features:
    - webdriver: true
```

`webdriver` 기능을 활성화한 후에는 `vagrant reload --provision` 명령어를 실행해야 합니다.

<a name="sharing-your-environment"></a>
### 환경 공유하기

동료나 고객과 현재 작업 중인 내용을 공유하고 싶을 때가 있습니다. Vagrant는 `vagrant share` 명령어를 통해 기본 공유 기능을 제공합니다. 단, `Homestead.yaml` 파일에 여러 사이트가 등록되어 있을 경우 이 기능이 동작하지 않을 수 있습니다.

이 문제를 해결하기 위해 Homestead는 별도의 `share` 명령어를 제공합니다. [Homestead 가상 머신에 SSH로 접속](#connecting-via-ssh)한 다음, 아래와 같이 `share homestead.test` 명령을 실행하세요. 이때 `Homestead.yaml`에 설정된 사이트명을 입력합니다. 원하는 사이트명으로 대체할 수 있습니다.

```shell
share homestead.test
```

명령이 실행되면 Ngrok 화면이 나타나고, 여기서 공유 사이트의 활동 로그와 외부에서 접근 가능한 URL을 확인할 수 있습니다. 공유 영역, 서브도메인 등 Ngrok 런타임 옵션을 직접 지정하고 싶으면 다음과 같이 사용할 수 있습니다.

```shell
share homestead.test -region=eu -subdomain=laravel
```

> [!WARNING]
> Vagrant는 보안적으로 안전하지 않으므로 `share` 명령어 실행 시 가상 머신이 인터넷에 직접 노출된다는 점을 반드시 인지하세요.

<a name="debugging-and-profiling"></a>
## 디버깅 및 프로파일링

<a name="debugging-web-requests"></a>
### Xdebug로 웹 요청 디버깅

Homestead는 [Xdebug](https://xdebug.org)를 사용한 단계별 디버깅을 지원합니다. 예를 들어, 브라우저에서 페이지를 여는 순간 PHP가 IDE와 연결되어 실행 중인 코드를 직접 확인하거나 수정할 수 있습니다.

기본적으로 Xdebug는 실행 중이며 연결을 대기합니다. CLI에서 Xdebug를 활성화 또는 비활성화하려면 가상 머신 내부에서 `sudo phpenmod xdebug`나 `sudo phpdismod xdebug` 명령어를 실행하세요.

IDE별로 디버깅 활성화 안내를 따라야 하며, 브라우저를 Xdebug가 인식할 수 있도록 확장 프로그램이나 [북마클릿](https://www.jetbrains.com/phpstorm/marklets/)으로 설정해야 합니다.

> [!WARNING]
> Xdebug가 활성화되면 PHP 실행이 크게 느려질 수 있습니다. Xdebug를 비활성화하려면 `sudo phpdismod xdebug`를 실행한 후 FPM 서비스를 재시작하세요.

<a name="autostarting-xdebug"></a>
#### Xdebug 자동 시작

웹 서버로 요청이 오갈 때 테스트 자동화 디버깅이 필요하다면, 헤더나 쿠키 등을 수정하지 않아도 바로 디버깅을 시작할 수 있도록 Autostart 기능을 사용하는 것이 편리합니다. Homestead 가상 머신 내부의 `/etc/php/7.x/fpm/conf.d/20-xdebug.ini` 파일을 수정하고 아래 내용을 추가하세요.

```ini
; 만약 Homestead.yaml에서 다른 서브넷을 사용한다면 이 IP는 다를 수 있습니다.
xdebug.client_host = 192.168.10.1
xdebug.mode = debug
xdebug.start_with_request = yes
```

<a name="debugging-cli-applications"></a>
### CLI 애플리케이션 디버깅

PHP CLI 애플리케이션을 디버깅하려면 가상 머신 내부에서 `xphp` 별칭을 사용하세요.

```
xphp /path/to/script
```

<a name="profiling-applications-with-blackfire"></a>
### Blackfire로 애플리케이션 프로파일링

[Blackfire](https://blackfire.io/docs/introduction)은 웹 요청과 CLI 애플리케이션의 성능 프로파일링을 위한 서비스입니다. 인터랙티브 UI를 제공해 호출 그래프, 타임라인 등으로 프로파일 정보를 시각화해줍니다. 개발/스테이징/운영 환경 모두에서 추가 부하 없이 사용할 수 있습니다. 또한 코드 품질, 보안, 성능 관련 점검 기능도 제공합니다.

[Blackfire Player](https://blackfire.io/docs/player/index)는 크롤링, 테스트, 스크레이핑용 오픈소스 도구로, Blackfire와 함께 시나리오 기반의 프로파일링도 가능합니다.

Blackfire 활성화는 `Homestead.yaml`의 "features" 란에 아래와 같이 설정하세요.

```yaml
features:
    - blackfire:
        server_id: "server_id"
        server_token: "server_value"
        client_id: "client_id"
        client_token: "client_value"
```

Blackfire 서버와 클라이언트 자격 증명은 [Blackfire 계정](https://blackfire.io/signup)이 필요합니다. Blackfire로 애플리케이션을 프로파일링하는 방법은 CLI 도구, 브라우저 확장 등 다양한 방법이 있습니다. 자세한 사항은 [Blackfire 공식 문서](https://blackfire.io/docs/php/integrations/laravel/index)를 참고하시기 바랍니다.

<a name="network-interfaces"></a>
## 네트워크 인터페이스

`Homestead.yaml` 파일의 `networks` 속성은 Homestead 가상 머신의 네트워크 인터페이스를 설정합니다. 필요한 만큼 인터페이스를 추가할 수 있습니다.

```yaml
networks:
    - type: "private_network"
      ip: "192.168.10.20"
```

[브릿지 네트워크](https://www.vagrantup.com/docs/networking/public_network.html)를 활성화하려면 `bridge`를 지정하고 `type`을 `public_network`로 변경합니다.

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
```

[DHCP](https://www.vagrantup.com/docs/networking/public_network.html) 사용을 원할 경우, `ip` 옵션을 생략하면 됩니다.

```yaml
networks:
    - type: "public_network"
      bridge: "en1: Wi-Fi (AirPort)"
```

<a name="extending-homestead"></a>
## Homestead 확장

Homestead는 Homestead 디렉터리 루트에 위치한 `after.sh` 스크립트를 이용해 확장할 수 있습니다. 이 파일에 가상 머신을 추가적으로 구성하거나 세부 조정이 필요한 쉘 명령어를 추가할 수 있습니다.

Homestead를 커스터마이즈할 때, Ubuntu가 패키지 설치 중 기존 설정 파일을 유지할지 또는 새 파일로 덮어쓸지 물어올 수 있습니다. Homestead가 작성한 기존 설정을 유지하려면 아래와 같이 명령어를 작성하세요.

```shell
sudo apt-get -y \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" \
    install package-name
```

<a name="user-customizations"></a>
### 사용자 커스터마이징

팀에서 Homestead를 사용할 때 각자의 개발 스타일에 맞게 Homestead를 조금씩 맞추고 싶다면, Homestead 디렉터리 루트(즉, `Homestead.yaml`이 위치한 곳)에 `user-customizations.sh` 파일을 생성하세요. 여기에 원하는 설정이나 스크립트를 자유롭게 추가할 수 있습니다. 단, `user-customizations.sh` 파일은 버전 관리에 포함하지 않아야 합니다.

<a name="provider-specific-settings"></a>
## 프로바이더별 설정

<a name="provider-specific-virtualbox"></a>
### VirtualBox

<a name="natdnshostresolver"></a>
#### `natdnshostresolver` 설정

기본적으로 Homestead는 `natdnshostresolver` 옵션을 `on`으로 설정합니다. 이로써 Homestead가 호스트 운영체제의 DNS 설정을 이용할 수 있습니다. 이 동작을 변경하려면, 아래와 같이 `Homestead.yaml` 파일에 옵션을 추가하세요.

```yaml
provider: virtualbox
natdnshostresolver: 'off'
```

<a name="symbolic-links-on-windows"></a>
#### Windows에서 심볼릭 링크 문제 해결

Windows 환경에서 심볼릭 링크가 제대로 작동하지 않는다면, `Vagrantfile`에 다음 블록을 추가해보세요.

```ruby
config.vm.provider "virtualbox" do |v|
    v.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
end
```