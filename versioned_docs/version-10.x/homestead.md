# 라라벨 홈스테드 (Laravel Homestead)

- [소개](#introduction)
- [설치 및 설정](#installation-and-setup)
    - [시작하기](#first-steps)
    - [Homestead 설정](#configuring-homestead)
    - [Nginx 사이트 설정](#configuring-nginx-sites)
    - [서비스 설정](#configuring-services)
    - [Vagrant 박스 실행](#launching-the-vagrant-box)
    - [프로젝트별 설치](#per-project-installation)
    - [선택적 기능 설치](#installing-optional-features)
    - [별칭(Alias) 설정](#aliases)
- [Homestead 업데이트](#updating-homestead)
- [일상적인 사용법](#daily-usage)
    - [SSH 접속](#connecting-via-ssh)
    - [사이트 추가](#adding-additional-sites)
    - [환경 변수](#environment-variables)
    - [포트(Ports)](#ports)
    - [PHP 버전](#php-versions)
    - [데이터베이스 접속](#connecting-to-databases)
    - [데이터베이스 백업](#database-backups)
    - [크론 스케줄 설정](#configuring-cron-schedules)
    - [Mailpit 설정](#configuring-mailpit)
    - [Minio 설정](#configuring-minio)
    - [라라벨 Dusk](#laravel-dusk)
    - [환경 공유하기](#sharing-your-environment)
- [디버깅 및 프로파일링](#debugging-and-profiling)
    - [Xdebug로 웹 요청 디버깅하기](#debugging-web-requests)
    - [CLI 애플리케이션 디버깅](#debugging-cli-applications)
    - [Blackfire로 애플리케이션 프로파일링](#profiling-applications-with-blackfire)
- [네트워크 인터페이스](#network-interfaces)
- [Homestead 확장하기](#extending-homestead)
- [프로바이더별 설정](#provider-specific-settings)
    - [VirtualBox](#provider-specific-virtualbox)

<a name="introduction"></a>
## 소개

라라벨은 여러분의 전체 PHP 개발 경험이 즐거울 수 있도록, 로컬 개발 환경을 포함한 모든 부분을 개선하고자 노력합니다. [Laravel Homestead](https://github.com/laravel/homestead)는 공식적으로 제공되는, 사전 패키징된 Vagrant 박스로서, 여러분의 로컬 컴퓨터에 PHP, 웹 서버, 그 외 기타 서버 소프트웨어를 직접 설치하지 않고도 훌륭한 개발 환경을 즉시 제공해줍니다.

[Vagrant](https://www.vagrantup.com)는 가상 머신(Virtual Machine)을 손쉽게 관리하고 프로비저닝할 수 있는 우아한 방법을 제공합니다. Vagrant 박스는 언제든 손쉽게 폐기할 수 있습니다. 무언가 잘못되어도 몇 분이면 박스를 삭제하고 다시 만들 수 있습니다!

Homestead는 Windows, macOS, Linux 시스템 모두에서 사용할 수 있으며, Nginx, PHP, MySQL, PostgreSQL, Redis, Memcached, Node 등 라라벨 애플리케이션 개발에 필요한 모든 주요 소프트웨어를 포함하고 있습니다.

> [!WARNING]
> Windows 사용자는 하드웨어 가상화(VT-x)를 활성화해야 할 수도 있습니다. VT-x는 보통 BIOS에서 활성화할 수 있습니다. 만약 UEFI 시스템에서 Hyper-V를 사용 중이라면, VT-x에 접근하려면 Hyper-V를 비활성화해야 할 수도 있습니다.

<a name="included-software"></a>
### 기본 포함 소프트웨어

<div id="software-list" markdown="1">

- Ubuntu 22.04
- Git
- PHP 8.3
- PHP 8.2
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
- Node (Yarn, Bower, Grunt, Gulp 포함)
- Redis
- Memcached
- Beanstalkd
- Mailpit
- avahi
- ngrok
- Xdebug
- XHProf / Tideways / XHGui
- wp-cli

</div>

<a name="optional-software"></a>
### 선택적으로 설치 가능한 소프트웨어

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
- InfluxDB
- Logstash
- MariaDB
- Meilisearch
- MinIO
- MongoDB
- Neo4j
- Oh My Zsh
- Open Resty
- PM2
- Python
- R
- RabbitMQ
- Rust
- RVM (Ruby Version Manager)
- Solr
- TimescaleDB
- Trader <small>(PHP 확장)</small>
- Webdriver & Laravel Dusk Utilities

</div>

<a name="installation-and-setup"></a>
## 설치 및 설정

<a name="first-steps"></a>
### 시작하기

Homestead 환경을 실행하기 전에, [Vagrant](https://developer.hashicorp.com/vagrant/downloads)와 아래의 지원되는 프로바이더 중 하나를 설치해야 합니다.

- [VirtualBox 6.1.x](https://www.virtualbox.org/wiki/Download_Old_Builds_6_1)
- [Parallels](https://www.parallels.com/products/desktop/)

위 소프트웨어들은 모두 주요 운영체제에서 쉽게 설치할 수 있는 시각적 설치 프로그램을 제공합니다.

Parallels 프로바이더를 사용하려면, 추가적으로 [Parallels Vagrant 플러그인](https://github.com/Parallels/vagrant-parallels)을 설치해야 합니다. 이 플러그인은 무료입니다.

<a name="installing-homestead"></a>
#### Homestead 설치하기

Homestead는 공식 저장소를 호스트 머신에 클론하여 설치할 수 있습니다. Homestead 가상 머신은 당신이 개발하는 모든 라라벨 애플리케이션의 호스트 역할을 하게 되므로, "홈" 디렉터리 아래에 `Homestead` 폴더를 만들어 해당 위치에 저장소를 클론하는 것이 좋습니다. 이 문서에서 이 폴더를 "Homestead 디렉터리"라고 부르겠습니다.

```shell
git clone https://github.com/laravel/homestead.git ~/Homestead
```

저장소를 클론한 후에는 `release` 브랜치를 체크아웃해야 합니다. 이 브랜치에는 Homestead의 최신 안정 버전이 항상 포함되어 있습니다.

```shell
cd ~/Homestead

git checkout release
```

그 다음, Homestead 디렉터리에서 `bash init.sh` 명령을 실행하여 `Homestead.yaml` 설정 파일을 생성하세요. 이 파일에서 Homestead 설치에 대한 모든 설정을 구성할 수 있습니다. 파일은 Homestead 디렉터리 내부에 생성됩니다.

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

<a name="configuring-homestead"></a>
### Homestead 설정

<a name="setting-your-provider"></a>
#### 프로바이더 지정하기

`Homestead.yaml` 파일의 `provider` 키는 사용할 Vagrant 프로바이더(`virtualbox` 또는 `parallels`)를 지정합니다.

```
provider: virtualbox
```

> [!WARNING]
> Apple Silicon 사용자라면 Parallels 프로바이더를 반드시 사용해야 합니다.

<a name="configuring-shared-folders"></a>
#### 공유 폴더 설정

`Homestead.yaml` 파일의 `folders` 속성에는 Homestead 환경과 공유하고 싶은 폴더 목록을 정의합니다. 이 폴더 내부의 파일이 변경될 때마다, 로컬 컴퓨터와 Homestead 가상 환경 사이에 자동으로 동기화됩니다. 필요한 만큼 여러 개의 공유 폴더를 설정할 수 있습니다.

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
```

> [!WARNING]
> Windows 사용자는 `~/` 경로 문법 대신 전체 경로(예: `C:\Users\user\Code\project1`)를 사용해야 합니다.

반드시 각각의 애플리케이션을 개별 폴더로 매핑하세요. 모든 애플리케이션이 들어 있는 하나의 대형 폴더 전체를 매핑하면, 가상 머신이 해당 폴더 내 모든 파일의 디스크 IO를 추적하게 되어 매우 많은 파일이 있을 경우 성능 저하가 발생할 수 있습니다.

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
    - map: ~/code/project2
      to: /home/vagrant/project2
```

> [!WARNING]
> Homestead 사용 시 `.`(현재 디렉터리)를 마운트해서는 안 됩니다. 이 경우 Vagrant가 현재 폴더를 `/vagrant`로 매핑하지 않게 되며, 추가 기능이 제대로 동작하지 않거나 예기치 못한 문제가 발생할 수 있습니다.

[NFS](https://developer.hashicorp.com/vagrant/docs/synced-folders/nfs)를 활성화하려면, 폴더 매핑 설정에 `type` 옵션을 추가하면 됩니다.

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "nfs"
```

> [!WARNING]
> Windows에서 NFS를 사용할 경우 [vagrant-winnfsd](https://github.com/winnfsd/vagrant-winnfsd) 플러그인을 설치하는 것이 좋습니다. 이 플러그인은 Homestead 가상 머신 내부의 파일과 디렉터리에 대한 올바른 사용자/그룹 권한을 유지해줍니다.

Vagrant의 [Synced Folders](https://developer.hashicorp.com/vagrant/docs/synced-folders/basic_usage)가 지원하는 옵션은 `options` 키 아래에 추가로 지정할 수 있습니다.

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

Nginx에 익숙하지 않아도 문제 없습니다. `Homestead.yaml`의 `sites` 속성으로 도메인과 Homestead 환경 내 폴더를 손쉽게 매핑할 수 있습니다. 기본 예시가 `Homestead.yaml`에 포함되어 있으며, 필요에 따라 여러 개의 사이트를 추가할 수 있습니다. Homestead는 개발 중인 모든 라라벨 애플리케이션에 대해 편리한 가상 환경을 제공합니다.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
```

`sites` 속성을 수정한 후에는 Homestead 가상 머신 내의 Nginx 설정을 업데이트하기 위해 터미널에서 `vagrant reload --provision` 명령을 실행해야 합니다.

> [!WARNING]
> Homestead 스크립트는 가능한 한 idempotent(중복 실행해도 동일한 결과)하도록 설계되어 있지만, 프로비저닝 과정에서 문제가 발생한다면 `vagrant destroy && vagrant up` 명령으로 가상 머신을 삭제 후 재생성하는 것이 좋습니다.

<a name="hostname-resolution"></a>
#### 호스트네임(도메인) 해상

Homestead는 `mDNS`를 이용해 자동으로 호스트네임을 게시합니다. 만약 `Homestead.yaml`에 `hostname: homestead`를 지정하면, `homestead.local`에서 접근할 수 있습니다. macOS, iOS, 대부분의 Linux 데스크톱 배포판에는 기본적으로 `mDNS`가 지원됩니다. Windows 사용자는 [Bonjour Print Services for Windows](https://support.apple.com/kb/DL999?viewlocale=en_US&locale=en_US)를 설치해야 합니다.

자동 호스트네임 기능은 [프로젝트별 Homestead 설치](#per-project-installation)에 가장 적합합니다. 여러 사이트를 하나의 Homestead 인스턴스 내에 호스팅할 경우, 각 사이트의 도메인 이름을 운영 체제의 `hosts` 파일에 직접 추가해야 합니다. 이 파일은 macOS 및 Linux에서는 `/etc/hosts`, Windows에서는 `C:\Windows\System32\drivers\etc\hosts` 경로에 있습니다. 다음과 같이 추가하면 됩니다.

```
192.168.56.56  homestead.test
```

`Homestead.yaml` 파일에 지정한 IP 주소가 위와 일치하는지 반드시 확인해야 합니다. 도메인을 `hosts` 파일에 추가하고 Vagrant 박스를 실행하면 웹 브라우저에서 다음과 같이 접근합니다.

```shell
http://homestead.test
```

<a name="configuring-services"></a>
### 서비스 설정

Homestead는 여러 가지 서비스를 기본으로 실행하지만, 프로비저닝 시 활성화 또는 비활성화할 서비스를 직접 선택할 수도 있습니다. 예를 들어, PostgreSQL만 활성화하고 MySQL은 비활성화하려면 `Homestead.yaml` 파일의 `services` 옵션을 아래와 같이 수정하면 됩니다.

```yaml
services:
    - enabled:
        - "postgresql"
    - disabled:
        - "mysql"
```

여기에 명시한 서비스들은 `enabled`와 `disabled`에 따라 순서대로 시작 또는 중지 처리됩니다.

<a name="launching-the-vagrant-box"></a>
### Vagrant 박스 실행

`Homestead.yaml`을 원하는 대로 수정한 다음, Homestead 디렉터리에서 `vagrant up` 명령을 실행하세요. 그러면 가상 머신이 부팅되고, 공유 폴더와 Nginx 사이트가 자동으로 구성됩니다.

가상 머신을 삭제하려면 `vagrant destroy` 명령을 사용하면 됩니다.

<a name="per-project-installation"></a>
### 프로젝트별 설치

Homestead를 전역(Global)으로 설치하여 모든 프로젝트가 동일한 Homestead 가상 머신을 공유할 수도 있지만, 프로젝트마다 별도의 Homestead 인스턴스를 설정하는 것도 가능합니다. 프로젝트별로 Homestead를 설치하면, 저장소에 `Vagrantfile`을 포함시켜 다른 개발자 역시 해당 프로젝트를 클론한 후 바로 `vagrant up`으로 개발 환경을 실행할 수 있습니다.

Composer 패키지 매니저를 사용해 프로젝트 내에 Homestead를 설치할 수 있습니다.

```shell
composer require laravel/homestead --dev
```

설치 후, Homestead의 `make` 명령을 실행하면 프로젝트를 위한 `Vagrantfile`과 `Homestead.yaml` 파일이 프로젝트 루트에 생성됩니다. 이 때 `Homestead.yaml`의 `sites`, `folders` 등이 자동으로 설정됩니다.

```shell
# macOS / Linux...
php vendor/bin/homestead make

# Windows...
vendor\\bin\\homestead make
```

이제 터미널에서 `vagrant up`을 실행하고 웹 브라우저에서 `http://homestead.test`로 프로젝트에 접근하면 됩니다. 자동 [호스트네임 해상](#hostname-resolution) 기능을 사용하지 않는다면, `homestead.test` 또는 원하는 도메인을 `/etc/hosts` 파일에 직접 추가해주어야 합니다.

<a name="installing-optional-features"></a>
### 선택적 기능 설치

선택적 소프트웨어는 `Homestead.yaml` 파일의 `features` 옵션을 사용해 설치할 수 있습니다. 대부분의 기능은 불린 값으로 활성화/비활성화하며, 일부 기능은 다양한 구성 옵션을 제공합니다.

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
    - dragonflydb: true
    - elasticsearch:
        version: 7.9.0
    - eventstore: true
        version: 21.2.0
    - flyway: true
    - gearman: true
    - golang: true
    - grafana: true
    - influxdb: true
    - logstash: true
    - mariadb: true
    - meilisearch: true
    - minio: true
    - mongodb: true
    - neo4j: true
    - ohmyzsh: true
    - openresty: true
    - pm2: true
    - python: true
    - r-base: true
    - rabbitmq: true
    - rustc: true
    - rvm: true
    - solr: true
    - timescaledb: true
    - trader: true
    - webdriver: true
```

<a name="elasticsearch"></a>
#### Elasticsearch

지원되는 버전의 Elasticsearch를 명확히 지정할 수 있으며, 반드시 `주.부.수` 형식의 정확한 버전이어야 합니다. 기본적으로 'homestead'라는 이름의 클러스터가 생성됩니다. Elasticsearch에 운영체제 메모리의 절반 이상을 할당하면 안 되므로, Homestead 가상 머신의 메모리를 Elasticsearch 할당량의 두 배 이상으로 설정해야 합니다.

> [!NOTE]
> [Elasticsearch 공식 문서](https://www.elastic.co/guide/en/elasticsearch/reference/current)를 참고하여 설정을 자유롭게 커스터마이징할 수 있습니다.

<a name="mariadb"></a>
#### MariaDB

MariaDB를 활성화하면 MySQL이 제거되고 대신 MariaDB가 설치됩니다. MariaDB는 MySQL과 호환(대체)되므로, 애플리케이션의 데이터베이스 설정에서는 여전히 `mysql` 드라이버를 사용하면 됩니다.

<a name="mongodb"></a>
#### MongoDB

기본 MongoDB 설치 시 데이터베이스 사용자명은 `homestead`, 비밀번호는 `secret`으로 지정됩니다.

<a name="neo4j"></a>
#### Neo4j

기본 Neo4j 설치 시 역시 사용자명은 `homestead`, 비밀번호는 `secret`으로 지정됩니다. Neo4j 브라우저는 `http://homestead.test:7474`에서 접근할 수 있습니다. 포트 `7687`(Bolt), `7474`(HTTP), `7473`(HTTPS) 모두 Neo4j 클라이언트의 요청을 서비스할 준비가 되어 있습니다.

<a name="aliases"></a>
### 별칭(Alias) 설정

Homestead 가상 머신에 Bash 별칭을 추가하려면, Homestead 디렉터리의 `aliases` 파일을 수정하면 됩니다.

```shell
alias c='clear'
alias ..='cd ..'
```

`aliases` 파일을 수정한 후에는 `vagrant reload --provision` 명령으로 Homestead 가상 머신을 재프로비저닝해야 새 별칭이 적용됩니다.

<a name="updating-homestead"></a>
## Homestead 업데이트

Homestead를 업데이트하기 전에, 현재 사용 중인 가상 머신을 아래 명령어로 먼저 삭제하세요.

```shell
vagrant destroy
```

이제 Homestead 소스 코드를 갱신해야 합니다. 저장소를 클론한 경우, 원래 해당 디렉터리에서 다음 명령어를 실행하세요.

```shell
git fetch

git pull origin release
```

위 명령들은 최신 Homestead 코드를 GitHub 저장소에서 가져와 최신 태그를 반영합니다. 최신 안정화 버전은 Homestead의 [GitHub 릴리즈 페이지](https://github.com/laravel/homestead/releases)에서 확인할 수 있습니다.

프로젝트의 `composer.json` 파일에 Homestead를 설치한 경우, `"laravel/homestead": "^12"`가 포함되어 있는지 확인하고 의존성을 업데이트해야 합니다.

```shell
composer update
```

이후, `vagrant box update` 명령을 실행하여 Vagrant 박스를 갱신합니다.

```shell
vagrant box update
```

Vagrant 박스를 업데이트한 뒤에는, Homestead 디렉터리에서 `bash init.sh` 명령을 실행하여 Homestead의 추가 설정 파일을 갱신해야 합니다. 이 과정에서 기존의 `Homestead.yaml`, `after.sh`, `aliases` 파일을 덮어쓸지 물어볼 수 있습니다.

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

마지막으로 최신 Vagrant 환경을 적용하려면 Homestead 가상 머신을 다시 생성해야 합니다.

```shell
vagrant up
```

<a name="daily-usage"></a>
## 일상적인 사용법

<a name="connecting-via-ssh"></a>
### SSH 접속

Homestead 디렉터리에서 `vagrant ssh` 명령을 실행하여 가상 머신에 SSH로 접속할 수 있습니다.

<a name="adding-additional-sites"></a>
### 사이트 추가

Homestead 환경을 프로비저닝해 실행한 뒤, 추가로 다른 라라벨 프로젝트의 Nginx 사이트를 더 등록하고 싶을 수 있습니다. Homestead 한 대에서 여러 개의 라라벨 프로젝트를 동시에 운영할 수 있습니다. 새로운 사이트를 추가하려면, `Homestead.yaml` 파일에 해당 사이트 정보를 추가하세요.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
    - map: another.test
      to: /home/vagrant/project2/public
```

> [!WARNING]
> 해당 프로젝트 폴더가 [공유 폴더로 매핑](#configuring-shared-folders)되어 있는지 꼭 확인하세요.

Vagrant가 자동으로 "hosts" 파일을 관리하지 않는 경우, 새 사이트를 직접 등록해야 합니다. macOS, Linux에서는 `/etc/hosts`, Windows에서는 `C:\Windows\System32\drivers\etc\hosts` 경로를 사용합니다.

```
192.168.56.56  homestead.test
192.168.56.56  another.test
```

사이트를 추가한 후에는 Homestead 디렉터리에서 `vagrant reload --provision` 명령을 실행하세요.

<a name="site-types"></a>
#### 사이트 유형

Homestead는 라라벨 기반이 아닌 프로젝트도 손쉽게 운영할 수 있도록 여러 가지 "사이트 유형"을 지원합니다. 예를 들어, Statamic 애플리케이션을 Homestead에 추가할 땐 아래와 같이 `statamic` 타입을 지정할 수 있습니다.

```yaml
sites:
    - map: statamic.test
      to: /home/vagrant/my-symfony-project/web
      type: "statamic"
```

지원하는 사이트 유형은 다음과 같습니다: `apache`, `apache-proxy`, `apigility`, `expressive`, `laravel`(기본값), `proxy`(nginx용), `silverstripe`, `statamic`, `symfony2`, `symfony4`, `zf`.

<a name="site-parameters"></a>
#### 사이트 파라미터

사이트에 추가적인 Nginx `fastcgi_param` 값을 지정하려면 `params` 지시자를 사용할 수 있습니다.

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

`Homestead.yaml` 파일에 글로벌 환경 변수를 정의할 수 있습니다.

```yaml
variables:
    - key: APP_ENV
      value: local
    - key: FOO
      value: bar
```

`Homestead.yaml` 파일을 수정한 후에는 `vagrant reload --provision` 명령을 실행해 머신을 재프로비저닝해야 합니다. 이 과정에서 설치된 모든 PHP 버전에 대해 PHP-FPM 설정이 갱신되며, `vagrant` 사용자 환경도 함께 업데이트됩니다.

<a name="ports"></a>
### 포트(Ports)

기본적으로 아래 포트들이 Homestead 환경에 포워딩됩니다.

<div class="content-list" markdown="1">

- **HTTP:** 8000 &rarr; 80번 포트로 연결됨
- **HTTPS:** 44300 &rarr; 443번 포트로 연결됨

</div>

<a name="forwarding-additional-ports"></a>
#### 추가 포트 포워딩

원한다면 `Homestead.yaml` 파일의 `ports` 설정을 통해 추가적인 포트를 Vagrant 박스에 포워딩할 수 있습니다. 파일을 수정한 후에는 반드시 `vagrant reload --provision` 명령으로 머신을 재프로비저닝해야 적용됩니다.

```yaml
ports:
    - send: 50000
      to: 5000
    - send: 7777
      to: 777
      protocol: udp
```

추가로 포워딩할 수 있는 주요 Homestead 서비스 포트는 다음과 같습니다.

<div class="content-list" markdown="1">

- **SSH:** 2222 &rarr; 22번 포트로
- **ngrok UI:** 4040 &rarr; 4040번 포트로
- **MySQL:** 33060 &rarr; 3306번 포트로
- **PostgreSQL:** 54320 &rarr; 5432번 포트로
- **MongoDB:** 27017 &rarr; 27017번 포트로
- **Mailpit:** 8025 &rarr; 8025번 포트로
- **Minio:** 9600 &rarr; 9600번 포트로

</div>

<a name="php-versions"></a>
### PHP 버전

Homestead는 하나의 가상 머신 안에서 여러 버전의 PHP를 지원합니다. 특정 사이트에 사용할 PHP 버전을 `Homestead.yaml` 파일에서 지정할 수 있습니다. 사용 가능한 PHP 버전은 "5.6", "7.0", "7.1", "7.2", "7.3", "7.4", "8.0", "8.1", "8.2", "8.3"(기본값)입니다.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      php: "7.1"
```

[Homestead 가상 머신 내](#connecting-via-ssh)에서는 다음과 같이 CLI를 통해 지원되는 PHP 버전을 사용할 수 있습니다.

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
php8.3 artisan list
```

CLI에서 기본 PHP 버전을 변경하려면 Homestead 가상 머신에서 아래 명령어를 사용할 수 있습니다.

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
php83
```

<a name="connecting-to-databases"></a>
### 데이터베이스 접속

MySQL과 PostgreSQL 모두에 대해 `homestead`라는 데이터베이스가 기본으로 설정되어 있습니다. 호스트 머신에서 데이터베이스 클라이언트로 접속하려면 `127.0.0.1`의 33060번(MySQL) 또는 54320번(PostgreSQL) 포트로 접속하면 됩니다. 사용자명, 비밀번호 모두 `homestead` / `secret` 입니다.

> [!WARNING]
> 호스트 머신에서 데이터베이스에 접속할 때만 이 비표준 포트를 사용해야 합니다. 라라벨 애플리케이션에서는 기본 포트(3306, 5432)를 사용하세요. 라라벨은 가상 머신 내에서 동작하기 때문입니다.

<a name="database-backups"></a>
### 데이터베이스 백업

Homestead는 가상 머신을 삭제할 때 자동으로 데이터베이스 백업을 생성할 수 있습니다. 이 기능을 사용하려면 Vagrant 2.1.0 이상이 필요합니다. 더 낮은 버전에서는 `vagrant-triggers` 플러그인을 별도로 설치해야 합니다. 자동 백업 기능을 활성화하려면 `Homestead.yaml` 파일에 다음 한 줄을 추가하세요.

```
backup: true
```

구성 후, `vagrant destroy` 명령 실행 시 Homestead가 데이터베이스를 `.backup/mysql_backup` 및 `.backup/postgres_backup` 폴더에 내보냅니다. 이 폴더들은 Homestead를 설치한 위치나, [프로젝트별 설치](#per-project-installation)를 선택한 경우엔 프로젝트 루트에 생성됩니다.

<a name="configuring-cron-schedules"></a>
### 크론 스케줄 설정

라라벨은 [크론 작업 예약](/docs/10.x/scheduling)을 편리하게 제공하며, 매 분마다 `schedule:run` Artisan 명령을 실행해 예약된 작업이 동작하도록 해줍니다. `App\Console\Kernel` 클래스의 스케줄 설정을 토대로 실행할 작업을 결정합니다.

특정 Homestead 사이트에 대해 `schedule:run` 명령을 실행하려면, 사이트 정의 시 `schedule` 옵션을 `true`로 지정하면 됩니다.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      schedule: true
```

해당 사이트에 대한 크론 작업은 Homestead 가상 머신의 `/etc/cron.d` 디렉터리에 등록됩니다.

<a name="configuring-mailpit"></a>
### Mailpit 설정

[Mailpit](https://github.com/axllent/mailpit)은 외부로 실제 메일을 발송하지 않고, 개발 중인 애플리케이션의 메일을 가로채서 내용을 확인할 수 있게 해줍니다. 시작하려면 애플리케이션의 `.env` 파일을 아래와 같이 설정합니다.

```ini
MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

설정이 완료되면, 웹 브라우저에서 `http://localhost:8025`로 Mailpit 대시보드에 접속할 수 있습니다.

<a name="configuring-minio"></a>
### Minio 설정

[Minio](https://github.com/minio/minio)는 Amazon S3와 호환 가능한 오픈소스 객체 저장소 서버입니다. Minio를 설치하려면, [선택적 기능 설치](#installing-optional-features) 섹션에 따라 `Homestead.yaml`의 해당 위치에 아래와 같이 옵션을 추가하세요.

```
minio: true
```

기본적으로 Minio는 9600번 포트에서 사용 가능합니다. `http://localhost:9600`에서 Minio 관리 패널에 접근할 수 있습니다. 기본 접근 키는 `homestead`, 기본 secret 키는 `secretkey`입니다. region은 항상 `us-east-1`을 사용하면 됩니다.

Minio를 사용하려면 애플리케이션의 `config/filesystems.php` 설정 파일에서 S3 디스크 구성을 다음과 같이 수정해야 합니다. `use_path_style_endpoint` 옵션을 추가하고, `url` 키를 `endpoint`로 변경하세요.

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

그리고 `.env` 파일에 아래 옵션들을 반드시 포함해야 합니다.

```ini
AWS_ACCESS_KEY_ID=homestead
AWS_SECRET_ACCESS_KEY=secretkey
AWS_DEFAULT_REGION=us-east-1
AWS_URL=http://localhost:9600
```

Minio 기반 "S3" 버킷을 프로비저닝하려면, `Homestead.yaml` 파일에 `buckets` 지시자를 추가하세요. 버킷 정의 후 터미널에서 `vagrant reload --provision` 명령을 실행해 적용할 수 있습니다.

```yaml
buckets:
    - name: your-bucket
      policy: public
    - name: your-private-bucket
      policy: none
```

지원되는 `policy` 값은 `none`, `download`, `upload`, `public`이 있습니다.

<a name="laravel-dusk"></a>
### 라라벨 Dusk

Homestead 내에서 [라라벨 Dusk](/docs/10.x/dusk) 테스트를 실행하려면, Homestead 설정에서 [`webdriver` 기능](#installing-optional-features)을 활성화해야 합니다.

```yaml
features:
    - webdriver: true
```

`webdriver` 기능을 활성화한 후, 터미널에서 `vagrant reload --provision` 명령을 실행하세요.

<a name="sharing-your-environment"></a>
### 환경 공유하기

간혹 현재 작업 중인 사이트를 동료나 클라이언트에게 공유하고 싶을 수 있습니다. Vagrant는 `vagrant share` 명령을 통해 기본적인 공유 기능을 제공하지만, `Homestead.yaml` 파일에 여러 사이트가 등록되어 있다면 동작하지 않습니다.

이 문제를 해결하기 위해 Homestead에는 자체 `share` 명령이 포함되어 있습니다. 먼저 [`vagrant ssh`로 Homestead 가상 머신에 접속](#connecting-via-ssh)한 뒤, 아래와 같이 `share homestead.test` 명령을 실행하면 됩니다. `Homestead.yaml`에 등록된 다른 사이트 이름으로도 실행할 수 있습니다.

```shell
share homestead.test
```

명령 실행 후, Ngrok 화면에 공유된 사이트의 활동 로그와 외부에서 접근 가능한 URL이 나타납니다. 지역(region), 서브도메인 등의 Ngrok 실행 옵션이 필요하다면 명령어에 추가로 지정할 수 있습니다.

```shell
share homestead.test -region=eu -subdomain=laravel
```

HTTPS로 내용을 공유하고 싶다면, `share` 대신 `sshare` 명령을 사용하면 됩니다.

> [!WARNING]
> 참고로, Vagrant 자체는 안전한 보안 수단이 아니므로, `share` 명령을 실행하면 가상 머신이 인터넷에 노출된다는 점을 꼭 인지하세요.

<a name="debugging-and-profiling"></a>
## 디버깅 및 프로파일링

<a name="debugging-web-requests"></a>
### Xdebug로 웹 요청 디버깅하기

Homestead에는 [Xdebug](https://xdebug.org)를 통한 단계별(스텝) 디버깅 기능이 내장되어 있습니다. 예를 들어 브라우저로 웹 페이지에 접근하면, PHP가 IDE와 연결되어 코드의 동작 과정을 직접 확인하거나 수정할 수 있습니다.

기본적으로 Xdebug는 이미 실행 중이며, 연결을 기다리고 있습니다. CLI(명령줄)에서 Xdebug를 활성화하려면 Homestead 가상 머신 안에서 `sudo phpenmod xdebug` 명령을 실행하면 됩니다. 이후에는 사용하는 IDE 설명서에 따라 디버깅을 사용하면 됩니다. 마지막으로, 브라우저에서 Xdebug를 활성화하려면 브라우저 확장 프로그램이나 [bookmarklet](https://www.jetbrains.com/phpstorm/marklets/)을 사용할 수도 있습니다.

> [!WARNING]
> Xdebug가 활성화되면 PHP의 실행 속도가 매우 느려질 수 있습니다. 비활성화하려면 Homestead 가상 머신에서 `sudo phpdismod xdebug`를 실행하고 FPM 서비스를 재시작하면 됩니다.

<a name="autostarting-xdebug"></a>
#### Xdebug 자동 시작

기능 테스트 등에서 웹 서버로의 요청을 디버깅할 때, 매번 테스트 코드에 헤더나 쿠키를 추가해 트리거하지 않고, 디버깅을 자동 시작하는 방법이 더 편리합니다. Xdebug를 항상 자동 시작하게 하려면, Homestead 가상 머신 내 `/etc/php/7.x/fpm/conf.d/20-xdebug.ini` 파일에 아래 설정을 추가하세요.

```ini
; Homestead.yaml의 IP 주소 서브넷이 다르면 이 주소가 다를 수 있습니다...
xdebug.client_host = 192.168.10.1
xdebug.mode = debug
xdebug.start_with_request = yes
```

<a name="debugging-cli-applications"></a>
### CLI 애플리케이션 디버깅

PHP CLI 애플리케이션을 디버깅하려면, Homestead 가상 머신 안에서 `xphp` 셸 별칭을 사용할 수 있습니다.

```
xphp /path/to/script
```

<a name="profiling-applications-with-blackfire"></a>
### Blackfire로 애플리케이션 프로파일링

[Blackfire](https://blackfire.io/docs/introduction)는 웹 요청과 CLI 애플리케이션의 성능을 분석(프로파일링)할 수 있는 서비스입니다. 인터랙티브한 UI에서 호출 그래프, 실행 타임라인 등 다양한 프로파일 데이터를 확인할 수 있으며, 개발·테스트·운영 환경 모두에서 사용할 수 있습니다. 또한 Blackfire는 코드와 `php.ini` 설정에 대한 성능, 품질, 보안 체크도 제공합니다.

[Blackfire Player](https://blackfire.io/docs/player/index)는 오픈소스 웹 크롤링, 웹 테스트, 웹 스크래핑 도구로 Blackfire와 연계해 프로파일링 시나리오를 스크립트로 자동화할 수 있습니다.

Blackfire를 활성화하려면, Homestead 설정 파일의 "features" 항목을 사용합니다.

```yaml
features:
    - blackfire:
        server_id: "server_id"
        server_token: "server_value"
        client_id: "client_id"
        client_token: "client_value"
```

Blackfire 서버 인증 정보 및 클라이언트 인증 정보는 [Blackfire 계정](https://blackfire.io/signup)이 필요합니다. Blackfire는 CLI 도구, 브라우저 확장 등 다양한 방법으로 애플리케이션 프로파일링을 제공합니다. 더 자세한 내용은 [Blackfire 공식 문서](https://blackfire.io/docs/php/integrations/laravel/index)를 참고하세요.

<a name="network-interfaces"></a>
## 네트워크 인터페이스

`Homestead.yaml` 파일의 `networks` 속성은 Homestead 가상 머신의 네트워크 인터페이스 구성을 담당합니다. 원하는 만큼 여러 개의 인터페이스를 설정할 수 있습니다.

```yaml
networks:
    - type: "private_network"
      ip: "192.168.10.20"
```

[브리지(bridged)](https://developer.hashicorp.com/vagrant/docs/networking/public_network) 네트워크를 활성화하려면, `network`의 `type`을 `public_network`로 지정하고 `bridge` 옵션을 추가하세요.

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
```

[DHCP](https://developer.hashicorp.com/vagrant/docs/networking/public_network#dhcp)를 사용하려면, 설정에서 `ip` 옵션을 제거하면 됩니다.

```yaml
networks:
    - type: "public_network"
      bridge: "en1: Wi-Fi (AirPort)"
```

사용할 디바이스를 변경하려면, 네트워크 설정에 `dev` 옵션을 추가하면 됩니다. 기본 `dev` 값은 `eth0`입니다.

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
      dev: "enp2s0"
```

<a name="extending-homestead"></a>
## Homestead 확장하기

Homestead는 Homestead 디렉터리(루트)에 있는 `after.sh` 스크립트를 이용해 확장할 수 있습니다. 이 파일에 필요한 셸 명령어를 추가하면 가상 머신을 원하는 대로 더 세부적으로 설정, 커스터마이징할 수 있습니다.

Homestead에 패키지를 설치할 때, Ubuntu에서 기존 설정 파일을 유지할지 새 구성 파일로 덮어쓸지 묻기도 합니다. Homestead에서 기존 환경설정을 보존하려면 아래와 같이 패키지 설치 명령어를 사용하면 됩니다.

```shell
sudo apt-get -y \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" \
    install package-name
```

<a name="user-customizations"></a>
### 사용자별 커스터마이징

Homestead를 팀과 함께 사용할 때, 각자 개발 스타일에 맞춰 Homestead를 좀 더 개별적으로 조정하고 싶을 수 있습니다. 이를 위해 Homestead 디렉터리(동일한 위치에 `Homestead.yaml`이 있음)에 `user-customizations.sh` 파일을 만들고, 필요한 내용을 추가하면 됩니다. 단, 이 파일은 버전 관리에 포함하지 않아야 합니다.

<a name="provider-specific-settings"></a>
## 프로바이더별 설정

<a name="provider-specific-virtualbox"></a>
### VirtualBox

<a name="natdnshostresolver"></a>
#### `natdnshostresolver`

기본적으로 Homestead는 `natdnshostresolver` 설정을 `on`으로 지정합니다. 이 설정은 Homestead가 호스트 운영체제의 DNS 설정을 사용할 수 있도록 해줍니다. 이 동작을 바꾸고 싶다면, `Homestead.yaml` 파일에 다음 설정을 추가하면 됩니다.

```yaml
provider: virtualbox
natdnshostresolver: 'off'
```
