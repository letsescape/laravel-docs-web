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
    - [Alias(별칭)](#aliases)
- [Homestead 업데이트](#updating-homestead)
- [일상적인 사용](#daily-usage)
    - [SSH로 접속하기](#connecting-via-ssh)
    - [추가 사이트 등록](#adding-additional-sites)
    - [환경 변수](#environment-variables)
    - [포트](#ports)
    - [PHP 버전](#php-versions)
    - [데이터베이스 연결](#connecting-to-databases)
    - [데이터베이스 백업](#database-backups)
    - [크론 스케줄 설정](#configuring-cron-schedules)
    - [Mailpit 설정](#configuring-mailpit)
    - [Minio 설정](#configuring-minio)
    - [라라벨 Dusk](#laravel-dusk)
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

라라벨은 로컬 개발 환경을 포함하여 전체 PHP 개발 경험이 즐거울 수 있도록 노력합니다. [Laravel Homestead](https://github.com/laravel/homestead)는 공식적으로 제공되는 Vagrant 박스이며, 별도의 PHP, 웹 서버 또는 기타 서버 소프트웨어를 여러분의 로컬 컴퓨터에 설치하지 않고도 쾌적한 개발 환경을 제공합니다.

[Vagrant](https://www.vagrantup.com)는 가상 머신을 쉽고 우아하게 관리하고 프로비저닝할 수 있는 도구입니다. Vagrant 박스는 언제든 완전히 폐기하고, 문제가 발생할 경우 몇 분 만에 다시 만들 수 있습니다!

Homestead는 Windows, macOS, Linux 등 어떤 운영체제에서도 동작하며, Nginx, PHP, MySQL, PostgreSQL, Redis, Memcached, Node 등 훌륭한 라라벨 애플리케이션 개발을 위해 필요한 모든 소프트웨어를 포함하고 있습니다.

> [!WARNING]
> Windows를 사용 중이라면 하드웨어 가상화(VT-x) 기능을 활성화해야 할 수 있습니다. 보통 BIOS에서 설정할 수 있습니다. 만약 UEFI 기반 시스템에서 Hyper-V를 사용 중이라면, VT-x에 접근하기 위해 Hyper-V를 비활성화해야 할 수도 있습니다.

<a name="included-software"></a>
### 기본 제공 소프트웨어

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
- Webdriver & Laravel Dusk 유틸리티

</div>

<a name="installation-and-setup"></a>
## 설치 및 설정

<a name="first-steps"></a>
### 시작하기

Homestead 환경을 시작하기 전에, [Vagrant](https://developer.hashicorp.com/vagrant/downloads)를 비롯하여 아래 지원되는 프로바이더 중 하나를 먼저 설치해야 합니다.

- [VirtualBox 6.1.x](https://www.virtualbox.org/wiki/Download_Old_Builds_6_1)
- [Parallels](https://www.parallels.com/products/desktop/)

이 모든 소프트웨어는 주요 운영체제에서 손쉽게 설치할 수 있는 그래픽 설치 프로그램을 제공합니다.

Parallels 프로바이더를 사용하려면, [Parallels Vagrant 플러그인](https://github.com/Parallels/vagrant-parallels)을 설치해야 합니다. 이 플러그인은 무료로 제공됩니다.

<a name="installing-homestead"></a>
#### Homestead 설치

Homestead는 호스트(로컬) 컴퓨터에 Homestead 저장소를 클론하여 설치합니다. Homestead 가상 머신이 여러분의 모든 라라벨 애플리케이션을 호스팅하는 역할을 하므로, 저장소를 사용자의 "홈" 디렉터리 아래 `Homestead` 폴더에 클론하는 것을 권장합니다. 본 문서에서는 이 폴더를 "Homestead 디렉터리"라고 부릅니다.

```shell
git clone https://github.com/laravel/homestead.git ~/Homestead
```

Laravel Homestead 저장소를 클론한 후에는 `release` 브랜치로 체크아웃해야 합니다. 이 브랜치는 항상 안정적인 최신 Homestead 릴리스를 포함합니다.

```shell
cd ~/Homestead

git checkout release
```

다음으로, Homestead 디렉터리에서 `bash init.sh` 명령을 실행하여 `Homestead.yaml` 설정 파일을 생성합니다. 이 파일에서 Homestead 설치를 관리하는 모든 설정을 하게 됩니다. 설정 파일은 Homestead 디렉터리에 생성됩니다.

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

`Homestead.yaml` 파일의 `provider` 키는 어떤 Vagrant 프로바이더를 사용할지 지정합니다: `virtualbox` 또는 `parallels`

```
provider: virtualbox
```

> [!WARNING]
> Apple Silicon(M1, M2 등) 사용자는 Parallels 프로바이더를 반드시 사용해야 합니다.

<a name="configuring-shared-folders"></a>
#### 공유 폴더 설정

`Homestead.yaml` 파일의 `folders` 속성에는 Homestead 환경과 공유할 폴더 목록을 지정합니다. 이 폴더 내의 파일을 변경하면, 로컬 컴퓨터와 Homestead 가상 환경 모두에서 동기화가 유지됩니다. 필요한 만큼 여러 개의 공유 폴더를 등록할 수 있습니다.

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
```

> [!WARNING]
> Windows 사용자라면 `~/` 경로 대신 `C:\Users\user\Code\project1`과 같이 전체 경로를 사용해야 합니다.

각 애플리케이션별로 개별 폴더 매핑을 등록하는 것이 좋습니다. 여러 애플리케이션이 들어있는 대형 폴더 전체를 하나로 매핑하면, 가상 머신이 폴더 내 모든 파일의 디스크 입출력을 추적해야 하므로 성능이 저하될 수 있습니다.

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
    - map: ~/code/project2
      to: /home/vagrant/project2
```

> [!WARNING]
> Homestead를 사용할 때 `.` (현재 디렉터리) 자체를 마운트해서는 안 됩니다. 이렇게 하면 Vagrant가 현재 폴더를 `/vagrant`에 매핑하지 않게 되며, 선택적 기능이 동작하지 않고 예기치 못한 문제가 발생할 수 있습니다.

[NFS](https://developer.hashicorp.com/vagrant/docs/synced-folders/nfs) 기능을 사용하려면 폴더 매핑에 `type` 옵션을 추가하면 됩니다.

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "nfs"
```

> [!WARNING]
> Windows에서 NFS를 쓸 경우 [vagrant-winnfsd](https://github.com/winnfsd/vagrant-winnfsd) 플러그인 설치를 권장합니다. 이 플러그인은 Homestead 가상 머신 내 파일과 디렉터리의 올바른 사용자/그룹 권한을 관리해줍니다.

Vagrant의 [Synced Folders](https://developer.hashicorp.com/vagrant/docs/synced-folders/basic_usage)가 지원하는 각종 옵션을 `options` 키 아래에 추가하여 전달할 수도 있습니다.

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

Nginx에 익숙하지 않아도 걱정하지 마세요! `Homestead.yaml` 파일의 `sites` 속성을 이용하면 Homestead 환경의 특정 폴더에 "도메인"을 간편하게 연결할 수 있습니다. 샘플 사이트 설정이 기본으로 포함되어 있으며, 필요한 만큼 여러 사이트를 추가할 수 있습니다. Homestead는 여러분이 작업하는 모든 라라벨 애플리케이션을 위한 편리한 가상 환경을 제공합니다.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
```

`sites` 속성을 수정한 뒤에는 Homestead 가상 머신에서 Nginx 설정을 반영하려면 터미널에서 `vagrant reload --provision` 명령어를 실행해야 합니다.

> [!WARNING]
> Homestead 스크립트는 가능한 한 결과가 동일하게(멱등하게) 실행되도록 설계되어 있습니다. 그럼에도 프로비저닝 중에 문제가 발생한다면 `vagrant destroy && vagrant up` 명령어로 머신을 삭제하고 다시 만드는 것이 좋습니다.

<a name="hostname-resolution"></a>
#### 호스트네임 자동 설정

Homestead는 `mDNS` 기능을 사용하여 호스트네임을 자동으로 등록합니다. 예를 들어 `Homestead.yaml` 파일에 `hostname: homestead`로 지정하면, 해당 가상 머신은 `homestead.local`로 접근할 수 있습니다. macOS, iOS, 그리고 주요 Linux 데스크톱 배포판은 기본으로 `mDNS`를 지원합니다. Windows 사용자는 [Bonjour Print Services for Windows](https://support.apple.com/kb/DL999?viewlocale=en_US&locale=en_US)를 설치해야 합니다.

자동 호스트네임 기능은 [프로젝트별 Homestead 설치](#per-project-installation) 환경에서 가장 잘 동작합니다. 여러 사이트를 하나의 Homestead 인스턴스에서 제공한다면, 웹 사이트의 "도메인"을 호스트 컴퓨터의 `hosts` 파일에 추가할 수 있습니다. 이 파일은 요청을 Homestead 가상 머신으로 보내줍니다. macOS, Linux에서는 `/etc/hosts`, Windows에서는 `C:\Windows\System32\drivers\etc\hosts` 경로에 있습니다. 파일에 다음과 같이 라인을 추가합니다.

```text
192.168.56.56  homestead.test
```

추가한 IP 주소가 `Homestead.yaml` 파일에서 지정한 IP와 일치하는지 반드시 확인하세요. 도메인을 `hosts` 파일에 등록하고 Vagrant 박스를 실행하면, 웹브라우저에서 해당 사이트에 접근할 수 있습니다.

```shell
http://homestead.test
```

<a name="configuring-services"></a>
### 서비스 설정

Homestead는 여러 서비스를 기본적으로 시작하지만, 필요에 따라 프로비저닝 시점에 어떤 서비스를 활성화(Enable) 또는 비활성화(Disable)할지 직접 지정할 수 있습니다. 예를 들어, PostgreSQL은 활성화하고 MySQL은 비활성화하려면 `Homestead.yaml` 파일에서 `services` 옵션을 다음과 같이 설정합니다.

```yaml
services:
    - enabled:
        - "postgresql"
    - disabled:
        - "mysql"
```

설정한 서비스는 `enabled`, `disabled`에 입력된 순서에 따라 시작 또는 중지됩니다.

<a name="launching-the-vagrant-box"></a>
### Vagrant 박스 실행

`Homestead.yaml` 파일의 설정을 마쳤다면, Homestead 디렉터리에서 `vagrant up` 명령어를 실행하세요. Vagrant가 가상 머신을 부팅하고, 공유 폴더 및 Nginx 사이트를 자동으로 설정합니다.

가상 머신을 중지 및 삭제하려면 `vagrant destroy` 명령어를 사용합니다.

<a name="per-project-installation"></a>
### 프로젝트별 설치

Homestead를 전체적으로(global) 설치해서 모든 프로젝트에서 하나의 Homestead 가상 머신을 공유할 수도 있지만, 각 프로젝트 마다 별도의 Homestead 인스턴스를 설정하는 것도 가능합니다. 이렇게 하면 프로젝트 저장소 내에 `Vagrantfile`을 함께 제공할 수 있고, 협업자가 프로젝트를 클론한 뒤 즉시 `vagrant up`만 실행해 개발 환경을 바로 사용할 수 있습니다.

프로젝트 내에서 Composer 패키지 매니저로 Homestead를 설치하세요.

```shell
composer require laravel/homestead --dev
```

설치 후에는 Homestead의 `make` 명령어를 실행하여 해당 프로젝트를 위한 `Vagrantfile` 및 `Homestead.yaml` 파일을 생성합니다. 두 파일은 프로젝트 루트에 위치하게 되며, `make` 명령어가 `Homestead.yaml` 내 `sites`, `folders` 설정도 자동으로 추가해줍니다.

```shell
# macOS / Linux...
php vendor/bin/homestead make

# Windows...
vendor\\bin\\homestead make
```

이제 터미널에서 `vagrant up` 명령어를 실행하고, 웹브라우저에서 `http://homestead.test` 주소로 프로젝트에 접속할 수 있습니다. 만약 [호스트네임 자동 등록](#hostname-resolution) 기능을 사용하지 않는다면, `homestead.test` 또는 원하는 도메인을 `/etc/hosts` 파일에 직접 등록해야 합니다.

<a name="installing-optional-features"></a>
### 선택적 기능 설치

선택적 소프트웨어는 `Homestead.yaml` 파일의 `features` 옵션으로 관리합니다. 대부분의 기능은 true/false와 같은 불린 값으로 활성/비활성화할 수 있고, 일부 기능은 여러 설정을 지원합니다.

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

지원되는 Elasticsearch 버전(메이저.마이너.패치 형식의 정확한 버전번호)을 지정할 수 있습니다. 기본 설치 시 클러스터 이름은 'homestead'로 생성됩니다. 운영체제 메모리의 절반 이상을 Elasticsearch에 할당해서는 안 되므로, Homestead 가상 머신의 메모리를 Elasticsearch 설정값의 두 배 이상으로 설정해야 합니다.

> [!NOTE]
> 추가 설정 방법은 [Elasticsearch 공식 문서](https://www.elastic.co/guide/en/elasticsearch/reference/current)를 참고하세요.

<a name="mariadb"></a>
#### MariaDB

MariaDB를 활성화하면 MySQL이 제거되고, MariaDB가 설치됩니다. MariaDB는 보통 MySQL과 호환(드롭인 교체)되므로, 애플리케이션의 데이터베이스 설정에서 여전히 `mysql` 데이터베이스 드라이버를 사용할 수 있습니다.

<a name="mongodb"></a>
#### MongoDB

기본 MongoDB 설치 시 데이터베이스 사용자명은 `homestead`, 비밀번호는 `secret`으로 설정됩니다.

<a name="neo4j"></a>
#### Neo4j

Neo4j 역시 기본 설치 시 데이터베이스 사용자명은 `homestead`, 비밀번호는 `secret`으로 지정됩니다. Neo4j 브라우저에 접속하려면 웹브라우저에서 `http://homestead.test:7474`를 방문하면 됩니다. 포트는 `7687`(Bolt), `7474`(HTTP), `7473`(HTTPS)로 각각 Neo4j 클라이언트 연결에 사용됩니다.

<a name="aliases"></a>
### Alias(별칭)

Homestead 디렉터리 내 `aliases` 파일을 수정하면, Homestead 가상 머신에서 사용할 Bash 별칭(alias)을 추가할 수 있습니다.

```shell
alias c='clear'
alias ..='cd ..'
```

`aliases` 파일을 변경한 후에는 `vagrant reload --provision` 명령어로 Homestead 가상 머신을 다시 프로비저닝해야 새로 추가한 별칭이 적용됩니다.

<a name="updating-homestead"></a>
## Homestead 업데이트

Homestead를 업데이트하기 전에 현재 실행 중인 가상 머신을 먼저 종료하고 삭제해야 합니다. Homestead 디렉터리에서 다음 명령어를 실행합니다.

```shell
vagrant destroy
```

그 다음 Homestead 소스 코드를 업데이트합니다. 저장소를 클론했다면, 원래 저장소를 클론했던 위치에서 다음 명령어를 실행합니다.

```shell
git fetch

git pull origin release
```

이 명령어들은 최신 Homestead 코드를 GitHub 저장소로부터 받아오고, 최신 태그와 최종 릴리스 버전을 체크아웃합니다. 최신 안정화 릴리스 버전은 Homestead의 [GitHub 릴리스 페이지](https://github.com/laravel/homestead/releases)에서 확인할 수 있습니다.

프로젝트의 `composer.json` 파일을 통해 Homestead를 설치했다면, `composer.json`에 `"laravel/homestead": "^12"`가 포함되어 있는지 확인하고, 다음과 같이 의존성을 업데이트하세요.

```shell
composer update
```

이후에는 Vagrant 박스를 `vagrant box update` 명령어로 업데이트해야 합니다.

```shell
vagrant box update
```

Vagrant 박스를 업데이트한 뒤, Homestead 디렉터리에서 아래 명령어로 Homestead의 추가 설정 파일을 업데이트해야 합니다. 기존의 `Homestead.yaml`, `after.sh`, `aliases` 파일을 덮어쓸지 물어볼 수 있습니다.

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

마지막으로, 최신 Vagrant 설치를 적용하려면 Homestead 가상 머신을 다시 생성해야 합니다.

```shell
vagrant up
```

<a name="daily-usage"></a>
## 일상적인 사용

<a name="connecting-via-ssh"></a>
### SSH로 접속하기

Homestead 디렉터리에서 `vagrant ssh` 명령어를 실행하면 가상 머신에 SSH로 접속할 수 있습니다.

<a name="adding-additional-sites"></a>
### 추가 사이트 등록

Homestead 환경을 프로비저닝하고 실행한 뒤에는, 다른 라라벨 프로젝트를 위한 추가 Nginx 사이트를 쉽게 등록할 수 있습니다. 하나의 Homestead 환경에서 여러 라라벨 프로젝트를 동시에 구동할 수 있습니다. 추가 사이트를 등록할 때는 `Homestead.yaml` 파일의 `sites`에 사이트를 추가합니다.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
    - map: another.test
      to: /home/vagrant/project2/public
```

> [!WARNING]
> 프로젝트 디렉터리의 [폴더 매핑](#configuring-shared-folders)이 올바르게 설정되어 있는지 반드시 확인하세요.

만약 Vagrant가 "hosts" 파일을 자동으로 관리하지 않는 환경이라면, 새로운 사이트도 해당 파일에 추가해 주어야 합니다. macOS, Linux에서는 `/etc/hosts`, Windows에서는 `C:\Windows\System32\drivers\etc\hosts` 파일을 편집하세요.

```text
192.168.56.56  homestead.test
192.168.56.56  another.test
```

사이트를 추가한 후에는 Homestead 디렉터리에서 `vagrant reload --provision` 명령어를 실행하세요.

<a name="site-types"></a>
#### 사이트 타입

Homestead는 다양한 "타입"의 사이트를 지원하므로, 라라벨 기반이 아닌 프로젝트도 쉽게 실행할 수 있습니다. 예를 들어 Statamic 애플리케이션을 Homestead에 `statamic` 사이트 타입으로 추가할 수 있습니다.

```yaml
sites:
    - map: statamic.test
      to: /home/vagrant/my-symfony-project/web
      type: "statamic"
```

지원되는 사이트 타입은 다음과 같습니다: `apache`, `apache-proxy`, `apigility`, `expressive`, `laravel`(기본값), `proxy`(nginx용), `silverstripe`, `statamic`, `symfony2`, `symfony4`, `zf`

<a name="site-parameters"></a>
#### 사이트 파라미터

사이트 설정에 Nginx의 추가 `fastcgi_param` 값을 직접 지정하고 싶다면, `params` 사이트 옵션을 사용합니다.

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

`Homestead.yaml` 파일에 글로벌 환경 변수를 아래와 같이 등록할 수 있습니다.

```yaml
variables:
    - key: APP_ENV
      value: local
    - key: FOO
      value: bar
```

`Homestead.yaml` 파일 변경 후에는 반드시 `vagrant reload --provision` 명령어로 머신을 다시 프로비저닝해야 합니다. 그러면 모든 PHP 버전의 PHP-FPM 설정과 `vagrant` 사용자 환경에 변경 사항이 반영됩니다.

<a name="ports"></a>
### 포트

기본적으로 다음 포트들이 Homestead 환경으로 포워딩됩니다.

<div class="content-list" markdown="1">

- **HTTP:** 8000 → 80 포트로 포워딩
- **HTTPS:** 44300 → 443 포트로 포워딩

</div>

<a name="forwarding-additional-ports"></a>
#### 추가 포트 포워딩

필요에 따라 `Homestead.yaml` 파일의 `ports` 설정을 통해 Vagrant 박스로 추가 포트 포워딩을 정의할 수 있습니다. 설정 변경 후에는 반드시 `vagrant reload --provision` 명령어로 머신을 다시 프로비저닝하세요.

```yaml
ports:
    - send: 50000
      to: 5000
    - send: 7777
      to: 777
      protocol: udp
```

아래는 호스트에서 Vagrant 박스로 매핑할 수 있는 Homestead 서비스 포트 목록입니다.

<div class="content-list" markdown="1">

- **SSH:** 2222 → 22 포트
- **ngrok UI:** 4040 → 4040 포트
- **MySQL:** 33060 → 3306 포트
- **PostgreSQL:** 54320 → 5432 포트
- **MongoDB:** 27017 → 27017 포트
- **Mailpit:** 8025 → 8025 포트
- **Minio:** 9600 → 9600 포트

</div>

<a name="php-versions"></a>
### PHP 버전

Homestead는 하나의 가상 머신에서 여러 버전의 PHP를 사용할 수 있도록 지원합니다. 각 사이트마다 `Homestead.yaml` 파일에서 사용할 PHP 버전을 개별적으로 지정할 수 있습니다. 사용 가능한 PHP 버전은 "5.6", "7.0", "7.1", "7.2", "7.3", "7.4", "8.0", "8.1", "8.2", "8.3"(기본값)입니다.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      php: "7.1"
```

[Homestead 가상 머신 내](#connecting-via-ssh)에서는 CLI에서 아래와 같은 방식으로 지원하는 PHP 버전을 사용할 수 있습니다.

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

CLI에서 기본으로 사용할 PHP 버전을 변경하려면 가상 머신 내에서 다음 명령어를 사용할 수 있습니다.

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

MySQL과 PostgreSQL 모두에 대해 `homestead` 데이터베이스가 기본으로 설정되어 있습니다. 호스트 머신에서 사용하는 데이터베이스 클라이언트로 MySQL 또는 PostgreSQL 데이터베이스에 접속하려면, 각각 `127.0.0.1`의 포트 `33060`(MySQL) 또는 `54320`(PostgreSQL)으로 연결하셔야 합니다. 두 데이터베이스 모두 사용자 이름과 비밀번호는 `homestead` / `secret`입니다.

> [!WARNING]
> 이러한 비표준 포트는 호스트 머신에서 데이터베이스에 연결할 때만 사용해야 합니다. 라라벨 애플리케이션의 `database` 설정 파일에서는 기본 포트 3306과 5432를 사용해야 하며, 이는 라라벨이 _가상 머신 내에서_ 실행되기 때문입니다.

<a name="database-backups"></a>
### 데이터베이스 백업

Homestead는 Homestead 가상 머신이 제거될 때 자동으로 데이터베이스 백업을 지원합니다. 이 기능을 사용하려면 Vagrant 2.1.0 이상 버전을 사용해야 합니다. 혹시 구버전 Vagrant를 사용 중이라면 `vagrant-triggers` 플러그인을 설치해야 합니다. 자동 데이터베이스 백업을 활성화하려면 다음과 같이 `Homestead.yaml` 파일에 아래 줄을 추가하세요.

```yaml
backup: true
```

설정이 완료되면, `vagrant destroy` 명령어 실행 시 Homestead가 데이터베이스를 `.backup/mysql_backup` 및 `.backup/postgres_backup` 디렉터리에 내보냅니다. 이 디렉터리는 Homestead를 설치한 폴더에서 찾을 수 있으며, [프로젝트별 설치](#per-project-installation) 방식을 사용하는 경우에는 프로젝트 루트에 위치합니다.

<a name="configuring-cron-schedules"></a>
### 크론 스케줄 설정

라라벨은 편리하게 [크론 작업 스케줄링](/docs/12.x/scheduling)을 지원하며, 매 분마다 한 번씩 `schedule:run` 아티즌 명령어를 실행하도록 설정할 수 있습니다. `schedule:run` 명령어는 `routes/console.php` 파일에 정의된 작업 스케줄을 참조해 어떤 예약 작업을 실행할지 판단합니다.

특정 Homestead 사이트에 대해 `schedule:run` 명령어를 실행하려면, 사이트를 정의할 때 `schedule` 옵션을 `true`로 지정하면 됩니다.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      schedule: true
```

이렇게 하면 해당 사이트용 크론 작업이 Homestead 가상 머신의 `/etc/cron.d` 디렉터리에 정의됩니다.

<a name="configuring-mailpit"></a>
### Mailpit 설정

[Mailpit](https://github.com/axllent/mailpit)을 이용하면 애플리케이션에서 발송되는 이메일을 실제 수신자에게 전송하지 않고 가로채서 내용을 확인할 수 있습니다. 먼저 애플리케이션의 `.env` 파일에서 아래와 같이 메일 설정을 변경하세요.

```ini
MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

Mailpit 설정이 완료된 후에는 `http://localhost:8025`에서 Mailpit 대시보드에 접근할 수 있습니다.

<a name="configuring-minio"></a>
### Minio 설정

[Minio](https://github.com/minio/minio)는 Amazon S3와 호환되는 API를 제공하는 오픈 소스 객체 스토리지 서버입니다. Minio를 설치하려면, `Homestead.yaml` 파일의 [features](#installing-optional-features) 섹션에 아래 설정을 추가하세요.

```
minio: true
```

기본적으로 Minio는 포트 9600에서 동작합니다. `http://localhost:9600`에 접속하면 Minio 관리 패널을 사용할 수 있습니다. 기본 액세스 키는 `homestead`이고, 기본 시크릿 키는 `secretkey`입니다. Minio에 접속할 때는 항상 리전(region) `us-east-1`을 사용해야 합니다.

Minio를 사용하려면 `.env` 파일에 다음과 같은 옵션을 추가해야 합니다.

```ini
AWS_USE_PATH_STYLE_ENDPOINT=true
AWS_ENDPOINT=http://localhost:9600
AWS_ACCESS_KEY_ID=homestead
AWS_SECRET_ACCESS_KEY=secretkey
AWS_DEFAULT_REGION=us-east-1
```

Minio 기반의 "S3" 버킷을 생성하려면, `Homestead.yaml` 파일에 `buckets` 지시문을 추가합니다. 버킷을 정의한 후에는 터미널에서 `vagrant reload --provision` 명령어를 실행하세요.

```yaml
buckets:
    - name: your-bucket
      policy: public
    - name: your-private-bucket
      policy: none
```

지원되는 `policy` 값은 `none`, `download`, `upload`, `public`입니다.

<a name="laravel-dusk"></a>
### Laravel Dusk

Homestead 내에서 [Laravel Dusk](/docs/12.x/dusk) 테스트를 실행하려면, Homestead 설정에서 [webdriver 기능](#installing-optional-features)을 활성화해야 합니다.

```yaml
features:
    - webdriver: true
```

`webdriver` 기능을 활성화한 후 터미널에서 `vagrant reload --provision` 명령어를 실행하세요.

<a name="sharing-your-environment"></a>
### 개발 환경 공유하기

현재 작업 중인 내용을 동료나 클라이언트와 공유해야 할 때가 있습니다. Vagrant는 기본적으로 `vagrant share` 명령어를 통해 이를 지원하지만, `Homestead.yaml` 파일에 여러 개의 사이트가 등록되어 있으면 이 기능을 사용할 수 없습니다.

이 문제를 해결하기 위해 Homestead에서는 자체적으로 `share` 명령어를 제공합니다. 먼저 [vagrant ssh를 이용해 Homestead 가상 머신에 접속](#connecting-via-ssh)한 후, `share homestead.test` 명령어를 실행하세요. 이 명령어는 `Homestead.yaml`의 설정 중 `homestead.test` 사이트를 외부로 공유합니다. 다른 등록된 사이트들도 `homestead.test` 대신 지정할 수 있습니다.

```shell
share homestead.test
```

명령어 실행 후에는 Ngrok 화면이 나타나며, 사이트 활동 로그와 공개적으로 접속 가능한 URL이 표시됩니다. 원하는 특정 region, 서브도메인 등 Ngrok의 런타임 옵션도 명령어에 함께 지정할 수 있습니다.

```shell
share homestead.test -region=eu -subdomain=laravel
```

HTTP 대신 HTTPS로 컨텐츠를 공유하려면 `share` 대신 `sshare` 명령어를 사용하시면 됩니다.

> [!WARNING]
> Vagrant는 기본적으로 보안에 취약하므로 `share` 명령어 사용 시 가상 머신이 인터넷에 노출됨을 항상 유의하시기 바랍니다.

<a name="debugging-and-profiling"></a>
## 디버깅 및 프로파일링

<a name="debugging-web-requests"></a>
### Xdebug를 통한 웹 요청 디버깅

Homestead는 [Xdebug](https://xdebug.org)를 통한 단계별(step) 디버깅을 지원합니다. 예를 들어 브라우저에서 페이지에 접근하면 PHP가 IDE와 연결되어 현재 실행 중인 코드를 점검하거나 수정할 수 있습니다.

기본적으로 Xdebug는 이미 활성화되어 있고 연결을 수락할 준비가 되어 있습니다. CLI에서 Xdebug를 활성화해야 할 경우에는 Homestead 가상 머신 내부에서 `sudo phpenmod xdebug` 명령어를 실행하세요. 다음으로, IDE에서 디버깅을 활성화하는 방법에 따라 설정을 마치세요. 마지막으로, 브라우저에서 확장 프로그램이나 [북마클릿](https://www.jetbrains.com/phpstorm/marklets/)을 사용해 Xdebug를 트리거하면 됩니다.

> [!WARNING]
> Xdebug가 활성화되면 PHP 실행 속도가 상당히 느려질 수 있습니다. Xdebug를 비활성화하려면 Homestead 가상 머신 내에서 `sudo phpdismod xdebug`를 실행한 후 FPM 서비스를 재시작하세요.

<a name="autostarting-xdebug"></a>
#### Xdebug 자동 시작(Autostarting)

웹 서버에 요청을 보내는 기능 테스트를 디버깅할 때, 헤더나 쿠키를 추가로 수정하지 않고도 자동으로 디버깅이 시작되도록 하는 것이 더 편리합니다. Xdebug를 강제로 자동 실행하려면, Homestead 가상 머신 내 `/etc/php/7.x/fpm/conf.d/20-xdebug.ini` 파일을 수정하고 다음 설정 값을 추가하세요.

```ini
; Homestead.yaml에서 IP 주소에 다른 서브넷을 사용한 경우 이 주소가 다를 수 있습니다...
xdebug.client_host = 192.168.10.1
xdebug.mode = debug
xdebug.start_with_request = yes
```

<a name="debugging-cli-applications"></a>
### CLI 애플리케이션 디버깅

PHP CLI 애플리케이션을 디버깅하려면 Homestead 가상 머신 내에서 `xphp` 셸 별칭을 사용하세요.

```shell
xphp /path/to/script
```

<a name="profiling-applications-with-blackfire"></a>
### Blackfire를 이용한 애플리케이션 프로파일링

[Blackfire](https://blackfire.io/docs/introduction)는 웹 요청 및 CLI 애플리케이션의 프로파일링을 위한 서비스입니다. 상호작용이 가능한 사용자 인터페이스를 통해 호출 그래프, 타임라인 등 프로파일 데이터를 시각화할 수 있습니다. Blackfire는 개발, 스테이징, 운영 환경 모두에 사용할 수 있으며, 최종 사용자에게 부하가 발생하지 않습니다. 또한 코드와 `php.ini` 설정에 대해 성능, 품질, 보안 점검 기능도 제공합니다.

[Blackfire Player](https://blackfire.io/docs/player/index)는 Web Crawling, Web Testing, Web Scraping을 지원하는 오픈 소스 애플리케이션으로, Blackfire와 연동해 프로파일링 시나리오를 스크립트로 작성할 수 있습니다.

Blackfire를 활성화하려면 Homestead 설정 파일의 "features" 항목에 아래와 같이 기입하십시오.

```yaml
features:
    - blackfire:
        server_id: "server_id"
        server_token: "server_value"
        client_id: "client_id"
        client_token: "client_value"
```

Blackfire 서버 자격 증명과 클라이언트 자격 증명은 [Blackfire 계정](https://blackfire.io/signup)이 있어야 발급받을 수 있습니다. Blackfire에서는 CLI 도구, 브라우저 확장 기능 등 다양한 방법으로 애플리케이션을 프로파일링할 수 있습니다. 자세한 정보는 [Blackfire 공식 문서](https://blackfire.io/docs/php/integrations/laravel/index)를 참고하세요.

<a name="network-interfaces"></a>
## 네트워크 인터페이스

`Homestead.yaml` 파일의 `networks` 속성은 Homestead 가상 머신용 네트워크 인터페이스를 설정합니다. 필요한 만큼 여러 인터페이스를 추가할 수 있습니다.

```yaml
networks:
    - type: "private_network"
      ip: "192.168.10.20"
```

[브릿지(bridged)](https://developer.hashicorp.com/vagrant/docs/networking/public_network) 인터페이스를 사용하려면 네트워크에 `bridge` 설정 추가 후 type을 `public_network`로 변경하세요.

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
```

[DHCP](https://developer.hashicorp.com/vagrant/docs/networking/public_network#dhcp)를 활성화하려면 설정에서 `ip` 옵션을 제거하면 됩니다.

```yaml
networks:
    - type: "public_network"
      bridge: "en1: Wi-Fi (AirPort)"
```

네트워크가 사용할 디바이스를 변경하려면 네트워크 설정에 `dev` 옵션을 추가하세요. 기본값은 `eth0`입니다.

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
      dev: "enp2s0"
```

<a name="extending-homestead"></a>
## Homestead 확장하기

Homestead는 Homestead 디렉터리 최상위에 있는 `after.sh` 스크립트를 통해 확장할 수 있습니다. 이 파일에서 가상 머신을 적절하게 설정하고 커스터마이즈하는데 필요한 모든 셸 명령어를 자유롭게 추가하실 수 있습니다.

Homestead를 커스터마이즈할 때, Ubuntu에서 패키지의 기존 설정 파일을 유지할지 새 설정 파일로 덮어쓸지 묻는 경우가 있습니다. Homestead에서 작성된 설정이 덮어써지지 않도록 하려면 패키지를 설치할 때 아래 명령어를 사용하세요.

```shell
sudo apt-get -y \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" \
    install package-name
```

<a name="user-customizations"></a>
### 사용자 커스터마이징

팀 내에서 Homestead를 사용할 때, 각자의 개발 스타일에 맞게 Homestead를 조정하고 싶을 수 있습니다. 이럴 때는 Homestead 디렉터리(즉, `Homestead.yaml`이 위치한 곳)에 `user-customizations.sh` 파일을 생성한 후, 원하는 커스터마이징 내용을 자유롭게 작성하시면 됩니다. 다만, `user-customizations.sh` 파일은 버전 관리에 포함시키지 않아야 합니다.

<a name="provider-specific-settings"></a>
## 프로바이더별 설정

<a name="provider-specific-virtualbox"></a>
### VirtualBox

<a name="natdnshostresolver"></a>
#### `natdnshostresolver`

기본적으로 Homestead는 `natdnshostresolver` 설정을 `on`으로 지정합니다. 이 옵션은 Homestead가 호스트 운영체제의 DNS 설정을 사용할 수 있게 해줍니다. 이 동작을 변경하고 싶다면, 아래와 같이 `Homestead.yaml` 파일에 설정 옵션을 추가하세요.

```yaml
provider: virtualbox
natdnshostresolver: 'off'
```