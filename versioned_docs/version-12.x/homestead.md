# 라라벨 Homestead (Laravel Homestead)

- [소개](#introduction)
- [설치와 설정](#installation-and-setup)
    - [시작하기](#first-steps)
    - [Homestead 설정하기](#configuring-homestead)
    - [Nginx 사이트 설정](#configuring-nginx-sites)
    - [서비스 설정](#configuring-services)
    - [Vagrant 박스 실행하기](#launching-the-vagrant-box)
    - [프로젝트별 설치](#per-project-installation)
    - [옵션 기능 설치하기](#installing-optional-features)
    - [별칭(Alias) 설정하기](#aliases)
- [Homestead 업데이트하기](#updating-homestead)
- [일상적인 사용](#daily-usage)
    - [SSH로 접속하기](#connecting-via-ssh)
    - [사이트 추가하기](#adding-additional-sites)
    - [환경 변수](#environment-variables)
    - [포트](#ports)
    - [PHP 버전](#php-versions)
    - [데이터베이스 연결](#connecting-to-databases)
    - [데이터베이스 백업](#database-backups)
    - [Cron 스케줄 설정](#configuring-cron-schedules)
    - [Mailpit 설정](#configuring-mailpit)
    - [Minio 설정](#configuring-minio)
    - [Laravel Dusk](#laravel-dusk)
    - [환경 공유하기](#sharing-your-environment)
- [디버깅과 프로파일링](#debugging-and-profiling)
    - [Xdebug로 웹 요청 디버깅하기](#debugging-web-requests)
    - [CLI 애플리케이션 디버깅하기](#debugging-cli-applications)
    - [Blackfire로 애플리케이션 프로파일링](#profiling-applications-with-blackfire)
- [네트워크 인터페이스](#network-interfaces)
- [Homestead 확장하기](#extending-homestead)
- [프로바이더별 설정](#provider-specific-settings)
    - [VirtualBox](#provider-specific-virtualbox)

<a name="introduction"></a>
## 소개

라라벨은 전체 PHP 개발 경험, 특히 로컬 개발 환경까지도 즐겁게 만들어주기 위해 노력합니다. [Laravel Homestead](https://github.com/laravel/homestead)는 공식적으로 제공되는, 패키지 형태의 Vagrant 박스로, 로컬 머신에 PHP, 웹 서버, 기타 서버 소프트웨어를 직접 설치하지 않고도 훌륭한 개발 환경을 사용할 수 있게 해줍니다.

[Vagrant](https://www.vagrantup.com)는 가상 머신을 관리하고 프로비저닝하는 간편하고 우아한 방법을 제공합니다. Vagrant 박스는 언제든 자유롭게 버릴 수 있습니다. 문제가 생기더라도 박스를 파괴하고, 몇 분 만에 다시 만들 수 있습니다!

Homestead는 Windows, macOS, Linux 시스템 어디서나 동작하며, Nginx, PHP, MySQL, PostgreSQL, Redis, Memcached, Node 등 라라벨 애플리케이션 개발에 필요한 거의 모든 소프트웨어를 포함합니다.

> [!WARNING]
> Windows를 사용한다면 하드웨어 가상화(VT-x)를 활성화해야 할 수 있습니다. 일반적으로 BIOS에서 설정할 수 있습니다. UEFI 시스템에서 Hyper-V를 사용하는 경우 VT-x 접근을 위해 Hyper-V를 비활성화해야 할 수도 있습니다.

<a name="included-software"></a>
### 포함된 소프트웨어

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
### 선택 설치 소프트웨어

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
## 설치와 설정

<a name="first-steps"></a>
### 시작하기

Homestead 환경을 시작하기 전에 [Vagrant](https://developer.hashicorp.com/vagrant/downloads)와 아래 지원되는 프로바이더 중 하나를 먼저 설치해야 합니다.

- [VirtualBox 6.1.x](https://www.virtualbox.org/wiki/Download_Old_Builds_6_1)
- [Parallels](https://www.parallels.com/products/desktop/)

이 소프트웨어들은 모두 주요 운영체제를 위한 쉬운 설치 프로그램을 제공합니다.

Parallels 프로바이더를 이용하려면 [Parallels Vagrant plug-in](https://github.com/Parallels/vagrant-parallels)을 추가로 설치해야 하며, 별도의 비용 없이 사용 가능합니다.

<a name="installing-homestead"></a>
#### Homestead 설치하기

Homestead는 해당 저장소를 호스트 컴퓨터에 클론함으로써 설치할 수 있습니다. Homestead 가상 머신은 모든 라라벨 애플리케이션의 호스트 역할을 하므로, '홈' 디렉터리 아래에 `Homestead` 폴더로 복제하는 것을 권장합니다. 이 문서에서는 이 디렉터리를 "Homestead 디렉터리"라고 부릅니다.

```shell
git clone https://github.com/laravel/homestead.git ~/Homestead
```

Laravel Homestead 저장소를 클론한 후에는, 항상 최신 안정화 버전을 담고 있는 `release` 브랜치로 체크아웃해야 합니다.

```shell
cd ~/Homestead

git checkout release
```

다음으로, Homestead 디렉터리에서 `bash init.sh` 명령어를 실행하면 `Homestead.yaml` 구성 파일이 생성됩니다. 이 파일에서 Homestead 설치와 관련된 모든 설정을 하며, Homestead 디렉터리에 저장됩니다.

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

<a name="configuring-homestead"></a>
### Homestead 설정하기

<a name="setting-your-provider"></a>
#### 프로바이더 지정하기

`Homestead.yaml` 파일의 `provider` 키는 사용할 Vagrant 프로바이더를 지정합니다. 사용할 수 있는 값은 `virtualbox` 또는 `parallels` 입니다.

```
provider: virtualbox
```

> [!WARNING]
> Apple Silicon 칩을 사용한다면 Parallels 프로바이더가 필수입니다.

<a name="configuring-shared-folders"></a>
#### 공유 폴더 구성하기

`Homestead.yaml` 파일의 `folders` 속성에는 Homestead 환경과 공유할 폴더들을 나열합니다. 이 폴더들의 내용이 바뀔 때마다, 로컬 머신과 가상 환경 사이에서 파일이 실시간 동기화됩니다. 원하는 만큼 공유 폴더를 추가할 수 있습니다.

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
```

> [!WARNING]
> Windows 사용자는 `~/` 경로 문법 대신, `C:\Users\user\Code\project1` 와 같이 전체 경로를 사용해야 합니다.

각 라라벨 애플리케이션마다 별도의 폴더 매핑을 사용하는 것이 좋습니다. 하나의 커다란 디렉터리에 모든 프로젝트를 넣고 한 번에 매핑하는 것은 성능 저하의 원인이 될 수 있습니다. 가상 머신은 해당 폴더의 *모든* 파일에 대한 디스크 IO를 추적해야 하기 때문입니다.

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
    - map: ~/code/project2
      to: /home/vagrant/project2
```

> [!WARNING]
> Homestead에서는 `.`(현재 디렉터리)를 마운트하지 않아야 합니다. 이렇게 하면 Vagrant가 현재 폴더를 `/vagrant`에 매핑하지 않아 선택적 기능이 비활성화되거나 예기치 않은 문제가 발생합니다.

[NFS](https://developer.hashicorp.com/vagrant/docs/synced-folders/nfs)를 활성화하려면, 폴더 매핑에 `type` 옵션을 추가할 수 있습니다.

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "nfs"
```

> [!WARNING]
> Windows에서 NFS를 사용할 경우 [vagrant-winnfsd](https://github.com/winnfsd/vagrant-winnfsd) 플러그인 설치를 권장합니다. 이 플러그인은 Homestead 가상 머신 내 파일 및 디렉터리의 사용자 / 그룹 권한을 올바르게 유지해줍니다.

Vagrant의 [Synced Folders](https://developer.hashicorp.com/vagrant/docs/synced-folders/basic_usage)가 지원하는 옵션을 `options` 키 밑에 설정할 수도 있습니다.

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

Nginx가 익숙하지 않아도 괜찮습니다. `Homestead.yaml` 파일의 `sites` 속성으로 "도메인"을 Homestead 환경 내 폴더와 쉽게 연결할 수 있습니다. 예시 사이트 설정이 기본으로 포함되어 있으며, 필요한 만큼 여러 사이트를 추가할 수 있습니다. Homestead를 사용하면 작업 중인 모든 라라벨 애플리케이션에 대해 편리한 가상 환경을 운영할 수 있습니다.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
```

`sites` 속성을 수정(추가/변경)한 후에는, 터미널에서 `vagrant reload --provision` 명령어를 실행하여 가상 머신의 Nginx 설정을 갱신해야 합니다.

> [!WARNING]
> Homestead 스크립트는 최대한 멱등하게(idempotent) 설계되어 있습니다. 하지만 프로비저닝 중에 문제가 생긴다면, `vagrant destroy && vagrant up` 명령어로 머신을 삭제하고 다시 만드세요.

<a name="hostname-resolution"></a>
#### 호스트네임 자동 연결

Homestead는 `mDNS`를 사용해 자동으로 호스트네임을 발행합니다. `Homestead.yaml` 파일에서 `hostname: homestead`로 설정하면, `homestead.local` 주소로 접속할 수 있습니다. macOS, iOS, Linux 데스크톱은 기본적으로 `mDNS`를 지원합니다. Windows 사용자는 [Bonjour Print Services for Windows](https://support.apple.com/kb/DL999?viewlocale=en_US&locale=en_US)를 설치해야 합니다.

자동 호스트네임 기능은 [프로젝트별 설치](#per-project-installation)에서 가장 잘 어울립니다. 하나의 Homestead 인스턴스에 여러 사이트를 운영하는 경우, 웹사이트의 "도메인"을 로컬 머신의 `hosts` 파일에 직접 추가할 수 있습니다. 이 파일을 통해 Homestead 사이트로의 요청을 가상 머신으로 전달하게 됩니다. macOS와 Linux에서 이 파일은 `/etc/hosts`에, Windows에서는 `C:\Windows\System32\drivers\etc\hosts`에 위치합니다. 파일에 추가하는 내용 예시는 다음과 같습니다.

```text
192.168.56.56  homestead.test
```

여기서 IP 주소는 `Homestead.yaml` 파일에서 지정한 값과 일치해야 합니다. 도메인을 `hosts` 파일에 추가하고 Vagrant 박스를 실행한 뒤에는 웹 브라우저에서 해당 사이트에 접속할 수 있습니다.

```shell
http://homestead.test
```

<a name="configuring-services"></a>
### 서비스 설정

Homestead는 몇몇 서비스를 기본으로 활성화합니다. 하지만 프로비저닝 과정에서 활성화/비활성화할 서비스는 직접 지정할 수도 있습니다. 예를 들어, PostgreSQL을 활성화하고 MySQL을 비활성화하려면 `Homestead.yaml` 파일에서 `services` 옵션을 사용합니다.

```yaml
services:
    - enabled:
        - "postgresql"
    - disabled:
        - "mysql"
```

지정된 서비스는 `enabled`, `disabled` 순서에 따라 각각 시작/중지됩니다.

<a name="launching-the-vagrant-box"></a>
### Vagrant 박스 실행하기

`Homestead.yaml` 파일을 원하는 대로 편집한 후, Homestead 디렉터리에서 `vagrant up` 명령어를 실행하세요. Vagrant가 가상 머신을 부팅하고, 자동으로 공유 폴더 및 Nginx 사이트를 설정해줍니다.

머신을 삭제하고 싶을 땐 `vagrant destroy` 명령어를 사용하세요.

<a name="per-project-installation"></a>
### 프로젝트별 설치

Homestead를 전역으로 설치하여 모든 프로젝트에서 공유하는 방식 대신, 각 프로젝트마다 Homestead 인스턴스를 별도로 설정할 수도 있습니다. 프로젝트별 Homestead 설치는 `Vagrantfile`을 프로젝트와 함께 제공하여 동료들이 프로젝트 저장소를 클론한 즉시 `vagrant up`만으로 환경 구성을 할 수 있게 해줍니다.

아래와 같이 Composer 패키지 매니저로 Homestead를 프로젝트에 설치할 수 있습니다.

```shell
composer require laravel/homestead --dev
```

설치가 완료되면, Homestead의 `make` 명령어로 해당 프로젝트에 맞는 `Vagrantfile`과 `Homestead.yaml` 파일을 생성합니다. 이 파일들은 프로젝트 루트에 만들어지며, `make` 명령어가 `Homestead.yaml` 파일의 `sites`와 `folders` 항목을 자동으로 구성합니다.

```shell
# macOS / Linux...
php vendor/bin/homestead make

# Windows...
vendor\\bin\\homestead make
```

그 후 터미널에서 `vagrant up`을 실행하여 브라우저에서 `http://homestead.test`로 프로젝트에 접속할 수 있습니다. 자동 [호스트네임 연결](#hostname-resolution)을 사용하지 않는다면, `homestead.test` 또는 원하는 도메인을 `/etc/hosts` 파일에 추가해야 합니다.

<a name="installing-optional-features"></a>
### 옵션 기능 설치하기

옵션 소프트웨어들은 `Homestead.yaml` 파일의 `features` 옵션으로 설치할 수 있습니다. 대부분의 기능은 불린 값으로 on/off 설정이 가능하며, 일부는 다양한 설정 값을 지원합니다.

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

Elasticsearch의 지원 버전(정확한 major.minor.patch 버전)을 지정할 수 있습니다. 기본 설치는 'homestead'라는 클러스터를 생성합니다. Elasticsearch에 할당된 메모리보다 더 많은 양(운영체제 메모리의 절반 이상)을 할당해서는 안되며, Homestead 가상 머신의 메모리는 Elasticsearch 할당 크기보다 두 배 이상이어야 합니다.

> [!NOTE]
> [Elasticsearch 공식 문서](https://www.elastic.co/guide/en/elasticsearch/reference/current)를 참고하여 세부 설정을 커스터마이즈하세요.

<a name="mariadb"></a>
#### MariaDB

MariaDB를 활성화하면 MySQL이 제거되고 MariaDB가 설치됩니다. MariaDB는 대부분 MySQL의 완벽한 대체제이므로, 애플리케이션의 데이터베이스 설정에서 여전히 `mysql` 드라이버를 사용하면 됩니다.

<a name="mongodb"></a>
#### MongoDB

기본 MongoDB 설치 시, 데이터베이스 사용자 이름은 `homestead`, 비밀번호는 `secret`으로 설정됩니다.

<a name="neo4j"></a>
#### Neo4j

Neo4j의 기본 설치 시에도 사용자 이름은 `homestead`, 비밀번호는 `secret`으로 설정됩니다. Neo4j 브라우저에는 웹 브라우저에서 `http://homestead.test:7474`로 접속할 수 있습니다. `7687`(Bolt), `7474`(HTTP), `7473`(HTTPS) 포트가 Neo4j 클라이언트 요청을 처리합니다.

<a name="aliases"></a>
### 별칭(Alias) 설정하기

Homestead 가상 머신에서 사용할 Bash 별칭은 Homestead 디렉터리 내의 `aliases` 파일을 수정하여 추가할 수 있습니다.

```shell
alias c='clear'
alias ..='cd ..'
```

`aliases` 파일을 수정한 후에는, `vagrant reload --provision` 명령어로 가상 머신을 재프로비저닝하여 별칭을 적용하세요.

<a name="updating-homestead"></a>
## Homestead 업데이트하기

업데이트를 시작하기 전, 아래 명령어로 현재 가상 머신을 삭제해야 합니다.

```shell
vagrant destroy
```

다음으로 Homestead 소스 코드를 업데이트합니다. 저장소를 클론했던 위치에서 아래 명령어를 실행하세요.

```shell
git fetch

git pull origin release
```

이 명령어는 최신 Homestead 코드를 받아오고, 최신 태그가 적용된 릴리스를 체크아웃합니다. 최신 안정 버전은 Homestead [GitHub 릴리스 페이지](https://github.com/laravel/homestead/releases)에서 확인할 수 있습니다.

프로젝트의 `composer.json` 파일을 통해 Homestead를 설치했다면, `"laravel/homestead": "^12"` 설정이 되어 있는지 확인하고 다음과 같이 의존성을 업데이트합니다.

```shell
composer update
```

이후 `vagrant box update` 명령어로 Vagrant 박스를 업데이트해야 합니다.

```shell
vagrant box update
```

Vagrant 박스 업데이트가 끝나면, Homestead 디렉터리에서 아래 명령어로 Homestead 설정 파일을 갱신합니다. 기존의 `Homestead.yaml`, `after.sh`, `aliases` 파일을 덮어쓸지 여부를 묻는 안내가 나타납니다.

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

마지막으로, 최신 Vagrant 설치를 사용하려면 Homestead 가상 머신을 다시 생성하세요.

```shell
vagrant up
```

<a name="daily-usage"></a>
## 일상적인 사용

<a name="connecting-via-ssh"></a>
### SSH로 접속하기

Homestead 디렉터리에서 아래처럼 `vagrant ssh` 명령어를 실행하면 가상 머신에 SSH로 접속할 수 있습니다.

<a name="adding-additional-sites"></a>
### 사이트 추가하기

Homestead 환경이 프로비저닝되어 실행 중이라면, 다른 라라벨 프로젝트용 Nginx 사이트를 추가로 등록할 수 있습니다. Homestead 환경 하나에 원하는 만큼 라라벨 프로젝트를 운영할 수 있으며, 새로운 사이트는 `Homestead.yaml` 파일에 추가하십시오.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
    - map: another.test
      to: /home/vagrant/project2/public
```

> [!WARNING]
> 사이트를 추가하기 전에 해당 프로젝트의 디렉터리에 대해 [폴더 매핑](#configuring-shared-folders)이 올바로 설정되어 있는지 확인하세요.

Vagrant가 "hosts" 파일을 자동 관리하지 않는 경우, 새로운 사이트를 hosts 파일에도 직접 추가해야 할 수 있습니다. macOS 및 Linux에서는 `/etc/hosts`, Windows에서는 `C:\Windows\System32\drivers\etc\hosts` 파일에 아래와 같이 입력하세요.

```text
192.168.56.56  homestead.test
192.168.56.56  another.test
```

사이트 추가 후에는 Homestead 디렉터리에서 `vagrant reload --provision` 명령어를 실행하세요.

<a name="site-types"></a>
#### 사이트 타입

Homestead는 라라벨이 아닌 프로젝트도 쉽게 실행할 수 있도록 여러 가지 "사이트 타입"을 지원합니다. 예를 들어, Statamic 애플리케이션은 `statamic` 타입으로 Homestead에 추가할 수 있습니다.

```yaml
sites:
    - map: statamic.test
      to: /home/vagrant/my-symfony-project/web
      type: "statamic"
```

지원하는 사이트 타입은 다음과 같습니다: `apache`, `apache-proxy`, `apigility`, `expressive`, 기본값인 `laravel`, `proxy`(nginx용), `silverstripe`, `statamic`, `symfony2`, `symfony4`, `zf`.

<a name="site-parameters"></a>
#### 사이트 파라미터

사이트에 대해 별도 Nginx `fastcgi_param` 값을 추가하려면 `params` 디렉티브를 사용할 수 있습니다.

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

`Homestead.yaml` 파일을 수정한 뒤에는, 반드시 `vagrant reload --provision` 명령어로 머신을 재프로비저닝해야 합니다. 이 명령어는 모든 PHP 버전에 대한 PHP-FPM 설정과 `vagrant` 사용자 환경을 함께 갱신합니다.

<a name="ports"></a>
### 포트

기본적으로, 아래 포트들이 Homestead 환경으로 포워딩되어 있습니다.

<div class="content-list" markdown="1">

- **HTTP:** 8000 &rarr; 80으로 포워딩
- **HTTPS:** 44300 &rarr; 443으로 포워딩

</div>

<a name="forwarding-additional-ports"></a>
#### 추가 포트 포워딩

원한다면, `Homestead.yaml` 파일에 `ports` 항목을 추가해 Vagrant 박스로 더 많은 포트를 포워드 할 수 있습니다. 파일 수정 후에는 `vagrant reload --provision` 명령어를 실행해야 합니다.

```yaml
ports:
    - send: 50000
      to: 5000
    - send: 7777
      to: 777
      protocol: udp
```

아래는 호스트 머신에서 Vagrant 박스로 매핑할 수 있는 Homestead 서비스의 추가 포트 목록입니다.

<div class="content-list" markdown="1">

- **SSH:** 2222 &rarr; 22
- **ngrok UI:** 4040 &rarr; 4040
- **MySQL:** 33060 &rarr; 3306
- **PostgreSQL:** 54320 &rarr; 5432
- **MongoDB:** 27017 &rarr; 27017
- **Mailpit:** 8025 &rarr; 8025
- **Minio:** 9600 &rarr; 9600

</div>

<a name="php-versions"></a>
### PHP 버전

Homestead는 하나의 가상 머신에서 여러 PHP 버전을 동시에 사용할 수 있습니다. 사이트별로 사용하고자 하는 PHP 버전을 `Homestead.yaml` 파일에서 지정할 수 있습니다. 사용 가능한 PHP 버전은 "5.6", "7.0", "7.1", "7.2", "7.3", "7.4", "8.0", "8.1", "8.2", "8.3"(기본값)입니다.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      php: "7.1"
```

[Homestead 가상 머신](#connecting-via-ssh) 내부에서는 CLI로 원하는 PHP 버전을 사용할 수 있습니다.

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

CLI에서 기본으로 사용할 PHP 버전은 Homestead 내에서 아래 명령어들을 실행하여 변경할 수 있습니다.

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
### 데이터베이스 연결

MySQL과 PostgreSQL 모두에 대해 `homestead` 데이터베이스가 기본 구성되어 있습니다. 호스트 머신의 DB 클라이언트에서 접속하려면, `127.0.0.1`의 `33060`(MySQL) 또는 `54320`(PostgreSQL) 포트로 연결하면 됩니다. 사용자명과 비밀번호는 모두 `homestead` / `secret`입니다.

> [!WARNING]
> 호스트 머신에서 데이터베이스에 접속할 때만 이런 비표준 포트를 사용해야 합니다. 라라벨 애플리케이션 내에서 데이터베이스 설정은 기본 포트 3306, 5432를 사용해야 합니다. 왜냐하면 라라벨이 가상 머신 내부에서 실행되기 때문입니다.

<a name="database-backups"></a>
### 데이터베이스 백업

Homestead는 가상 머신을 파괴할 때 데이터베이스를 자동으로 백업할 수 있습니다. 이 기능을 사용하려면 Vagrant 2.1.0 이상이 필요하며, 오래된 버전일 경우 `vagrant-triggers` 플러그인을 설치해야 합니다. 자동 DB 백업을 활성화하려면 `Homestead.yaml`에 다음과 같이 작성하세요.

```yaml
backup: true
```

설정 후에는, `vagrant destroy` 명령어를 실행할 때 데이터베이스가 `.backup/mysql_backup`과 `.backup/postgres_backup` 디렉터리에 저장됩니다. 이 폴더는 Homestead를 설치한 위치 또는 [프로젝트별 설치](#per-project-installation)를 사용했다면 프로젝트 루트에 생성됩니다.

<a name="configuring-cron-schedules"></a>
### Cron 스케줄 설정

라라벨은 [cron 작업 스케줄](/docs/scheduling)을 편리하게 지원합니다. 1분마다 `schedule:run` 아티즌 명령어만 실행하면 됩니다. 이 명령어가 `routes/console.php`에 정의된 작업 목록을 확인하여 해당 작업들을 실행합니다.

특정 Homestead 사이트에 대해 `schedule:run` 명령을 자동으로 실행하려면, 사이트 정의에서 `schedule` 옵션을 `true`로 설정하세요.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      schedule: true
```

여기서 설정된 cron 작업은 Homestead 가상 머신의 `/etc/cron.d` 디렉터리에 생성됩니다.

<a name="configuring-mailpit"></a>
### Mailpit 설정

[Mailpit](https://github.com/axllent/mailpit)은 발송되는 메일이 실제 수신자에게 전송되지 않고, 중간에서 가로채어 확인할 수 있게 해주는 도구입니다. 사용하려면, 애플리케이션의 `.env` 파일에서 아래와 같이 메일 설정을 바꿔주세요.

```ini
MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

Mailpit 설정이 끝나면, `http://localhost:8025`에서 Mailpit 대시보드에 접속할 수 있습니다.

<a name="configuring-minio"></a>
### Minio 설정

[Minio](https://github.com/minio/minio)는 Amazon S3와 호환 가능한 오픈 소스 오브젝트 스토리지 서버입니다. Minio를 설치하려면 [features](#installing-optional-features) 항목에 다음 설정을 추가하세요.

```
minio: true
```

기본적으로 Minio는 9600 포트에서 동작합니다. `http://localhost:9600`으로 접속해 Minio 컨트롤 패널을 사용할 수 있습니다. 기본 접근 키는 `homestead`, 기본 비밀 키는 `secretkey`입니다. Minio에 접속할 때는 항상 `us-east-1` 리전을 사용해야 합니다.

Minio를 사용하려면 `.env` 파일에 아래 옵션이 반드시 포함되어야 합니다.

```ini
AWS_USE_PATH_STYLE_ENDPOINT=true
AWS_ENDPOINT=http://localhost:9600
AWS_ACCESS_KEY_ID=homestead
AWS_SECRET_ACCESS_KEY=secretkey
AWS_DEFAULT_REGION=us-east-1
```

Minio 기반 "S3" 버킷을 구성하려면 `Homestead.yaml` 파일에 `buckets` 항목을 추가하세요. 버킷을 정의한 후에는 반드시 `vagrant reload --provision` 명령어를 실행해야 합니다.

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

Homestead 내에서 [Laravel Dusk](/docs/dusk) 테스트를 실행하려면, Homestead 설정에서 [webdriver 기능](#installing-optional-features)을 활성화해야 합니다.

```yaml
features:
    - webdriver: true
```

`webdriver` 기능을 켠 후, 터미널에서 `vagrant reload --provision` 명령어를 실행해야 합니다.

<a name="sharing-your-environment"></a>
### 환경 공유하기

때로는 동료나 클라이언트와 현재 작업 중인 내용을 공유하고 싶을 수 있습니다. Vagrant에는 이를 위한 `vagrant share` 명령어 기능이 내장되어 있지만, `Homestead.yaml` 파일에 여러 사이트가 구성되어 있다면 동작하지 않습니다.

이 경우, Homestead에는 자체적으로 `share` 명령어가 포함되어 있습니다. [Homestead 가상 머신에 SSH](#connecting-via-ssh) 접속 후, 아래처럼 `share homestead.test` 명령어를 실행하세요. 이 명령어는 `Homestead.yaml`에 정의된 `homestead.test` 사이트를 외부로 공유합니다. 원하는 사이트로 `homestead.test` 대신 다른 사이트 명을 입력할 수 있습니다.

```shell
share homestead.test
```

명령을 실행하면 Ngrok 화면이 나타나며, 활동 로그와 외부에서 접속 가능한 공개 URL 목록이 표시됩니다. 커스텀 리전, 서브도메인 등 Ngrok 런타임 옵션을 추가하려면 아래처럼 작성합니다.

```shell
share homestead.test -region=eu -subdomain=laravel
```

HTTPS로 콘텐츠를 공유하고 싶을 땐, `share` 대신 `sshare` 명령어를 사용할 수 있습니다.

> [!WARNING]
> Vagrant는 기본적으로 보안이 강하지 않으므로, `share` 명령어를 사용하는 동안 가상 머신이 인터넷상에 노출된다는 점을 꼭 유의하세요.

<a name="debugging-and-profiling"></a>
## 디버깅과 프로파일링

<a name="debugging-web-requests"></a>
### Xdebug로 웹 요청 디버깅하기

Homestead는 [Xdebug](https://xdebug.org)를 이용한 단계별 디버깅을 지원합니다. 예를 들어, 브라우저에서 페이지에 접근하면 PHP가 IDE와 연결되어 실행 중인 코드를 확인 및 수정할 수 있습니다.

기본적으로 Xdebug가 활성화되어 연결을 수락할 준비가 되어 있습니다. CLI에서 Xdebug를 사용하려면, Homestead 가상 머신 내부에서 `sudo phpenmod xdebug` 명령어를 실행하세요. 그런 다음, IDE의 지침대로 디버깅을 활성화하고, 브라우저에서는 확장 프로그램이나 [북마클릿](https://www.jetbrains.com/phpstorm/marklets/)으로 Xdebug 트리거를 설정하세요.

> [!WARNING]
> Xdebug는 PHP의 속도를 상당히 느리게 만듭니다. Xdebug를 비활성화하려면, Homestead 가상 머신 내에서 `sudo phpdismod xdebug` 명령어를 실행하고, FPM 서비스를 재시작하세요.

<a name="autostarting-xdebug"></a>
#### Xdebug 자동 시작

웹 서버에 대한 기능 테스트를 디버깅할 때, 테스트 코드를 커스텀 헤더나 쿠키로 수정하는 대신에 Xdebug를 자동으로 시작하는 것이 더욱 편리합니다. 자동 시작을 위해서는 Homestead 가상 머신 내 `/etc/php/7.x/fpm/conf.d/20-xdebug.ini` 파일에 다음 설정을 추가하세요.

```ini
; Homestead.yaml의 IP 주소가 다를 경우, 이 주소 역시 다를 수 있습니다...
xdebug.client_host = 192.168.10.1
xdebug.mode = debug
xdebug.start_with_request = yes
```

<a name="debugging-cli-applications"></a>
### CLI 애플리케이션 디버깅하기

PHP CLI 애플리케이션을 디버깅하려면, Homestead 가상 머신에서 `xphp` 셸 별칭을 사용하세요.

```shell
xphp /path/to/script
```

<a name="profiling-applications-with-blackfire"></a>
### Blackfire로 애플리케이션 프로파일링

[Blackfire](https://blackfire.io/docs/introduction)는 웹 요청과 CLI 애플리케이션을 프로파일링해주는 서비스입니다. Blackfire는 UI를 통해 호출 그래프와 타임라인 등 프로파일 데이터 분석을 위한 인터페이스를 제공합니다. 개발, 스테이징, 프로덕션 환경 모두 사용 가능하며, 엔드유저에게는 별도의 부하가 발생하지 않습니다. 또한, 코드 및 `php.ini` 설정에 대한 성능, 품질, 보안 검사를 제공합니다.

[Blackfire Player](https://blackfire.io/docs/player/index)는 오픈소스 웹 크롤링/테스트/스크래핑 앱으로, Blackfire와 결합하여 프로파일 시나리오를 스크립트로 실행할 수 있습니다.

Blackfire를 사용하려면, Homestead 설정 파일의 "features" 항목에 아래처럼 설정합니다.

```yaml
features:
    - blackfire:
        server_id: "server_id"
        server_token: "server_value"
        client_id: "client_id"
        client_token: "client_value"
```

Blackfire 서버 및 클라이언트 자격 증명을 입력해야 하며, [Blackfire 계정](https://blackfire.io/signup)이 필요합니다. CLI 도구, 브라우저 확장 등 다양한 프로파일 옵션을 제공하므로 [Blackfire 공식 문서](https://blackfire.io/docs/php/integrations/laravel/index)를 참고하세요.

<a name="network-interfaces"></a>
## 네트워크 인터페이스

`Homestead.yaml`의 `networks` 속성으로 가상 머신의 네트워크 인터페이스를 설정할 수 있습니다. 원하는 만큼 인터페이스를 추가할 수 있습니다.

```yaml
networks:
    - type: "private_network"
      ip: "192.168.10.20"
```

[브릿지 네트워크](https://developer.hashicorp.com/vagrant/docs/networking/public_network)를 활성화하려면, network의 `type`을 `public_network`로 바꾸고 `bridge` 속성을 추가하세요.

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
```

[DHCP](https://developer.hashicorp.com/vagrant/docs/networking/public_network#dhcp)를 사용하려면 `ip` 옵션만 제거하면 됩니다.

```yaml
networks:
    - type: "public_network"
      bridge: "en1: Wi-Fi (AirPort)"
```

네트워크가 사용할 디바이스를 변경하고 싶으면, 구성에 `dev` 옵션을 추가할 수 있습니다. 기본값은 `eth0`입니다.

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
      dev: "enp2s0"
```

<a name="extending-homestead"></a>
## Homestead 확장하기

Homestead는 Homestead 디렉터리 루트의 `after.sh` 스크립트로 확장할 수 있습니다. 여기에 가상 머신 추가 설정 및 커스터마이징을 위한 셸 명령어를 자유롭게 추가할 수 있습니다.

Homestead를 커스터마이징할 때, Ubuntu가 패키지의 기존 설정 파일 유지 여부를 물어올 수 있습니다. 기존 Homestead 설정이 덮어쓰여지는 것을 방지하려면, 아래처럼 패키지 설치 명령어를 사용하세요.

```shell
sudo apt-get -y \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" \
    install package-name
```

<a name="user-customizations"></a>
### 사용자별 커스터마이징

Homestead를 팀과 함께 사용할 경우, 개인 개발 스타일에 맞게 추가적인 커스터마이징을 원할 수 있습니다. 이럴 때는 Homestead 디렉터리 루트(즉, `Homestead.yaml` 파일과 동일한 위치)에 `user-customizations.sh` 파일을 만들고, 필요한 내용을 자유롭게 추가하세요. 단, `user-customizations.sh` 파일은 버전 관리에 포함하지 않는 것이 좋습니다.

<a name="provider-specific-settings"></a>
## 프로바이더별 설정

<a name="provider-specific-virtualbox"></a>
### VirtualBox

<a name="natdnshostresolver"></a>
#### `natdnshostresolver`

기본적으로 Homestead는 `natdnshostresolver` 설정을 `on`으로 지정하여 호스트 운영체제의 DNS 설정을 사용할 수 있습니다. 이 동작을 변경하려면, `Homestead.yaml` 파일에 아래 항목을 추가하세요.

```yaml
provider: virtualbox
natdnshostresolver: 'off'
```
