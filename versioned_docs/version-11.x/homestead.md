# 라라벨 Homestead (Laravel Homestead)

- [소개](#introduction)
- [설치 및 설정](#installation-and-setup)
    - [시작하기](#first-steps)
    - [Homestead 설정하기](#configuring-homestead)
    - [Nginx 사이트 설정하기](#configuring-nginx-sites)
    - [서비스 설정하기](#configuring-services)
    - [Vagrant 박스 실행하기](#launching-the-vagrant-box)
    - [프로젝트별 설치](#per-project-installation)
    - [선택적 기능 설치](#installing-optional-features)
    - [Alias(별칭)](#aliases)
- [Homestead 업데이트하기](#updating-homestead)
- [일상적인 사용](#daily-usage)
    - [SSH를 통한 접속](#connecting-via-ssh)
    - [추가 사이트 등록](#adding-additional-sites)
    - [환경 변수](#environment-variables)
    - [포트](#ports)
    - [PHP 버전](#php-versions)
    - [데이터베이스 접속](#connecting-to-databases)
    - [데이터베이스 백업](#database-backups)
    - [크론 스케줄 설정](#configuring-cron-schedules)
    - [Mailpit 설정](#configuring-mailpit)
    - [Minio 설정](#configuring-minio)
    - [라라벨 Dusk](#laravel-dusk)
    - [환경 공유](#sharing-your-environment)
- [디버깅 및 프로파일링](#debugging-and-profiling)
    - [Xdebug로 웹 요청 디버깅](#debugging-web-requests)
    - [CLI 애플리케이션 디버깅](#debugging-cli-applications)
    - [Blackfire로 애플리케이션 프로파일링](#profiling-applications-with-blackfire)
- [네트워크 인터페이스](#network-interfaces)
- [Homestead 확장하기](#extending-homestead)
- [공급자별 설정](#provider-specific-settings)
    - [VirtualBox](#provider-specific-virtualbox)

<a name="introduction"></a>
## 소개

라라벨은 전체 PHP 개발 경험이 즐거울 수 있도록, 로컬 개발 환경까지 포함해 모두를 쉽게 만들어 주고자 합니다. [Laravel Homestead](https://github.com/laravel/homestead)는 공식적으로 제공되는, 미리 구성된 Vagrant 박스로, 여러분의 로컬 컴퓨터에 PHP, 웹 서버, 또는 그 외 서버용 소프트웨어를 직접 설치하지 않고도 쾌적한 개발 환경을 사용할 수 있도록 도와줍니다.

[Vagrant](https://www.vagrantup.com)는 가상 머신을 쉽게 관리하고 구성할 수 있는 간단하고 우아한 방식을 제공합니다. Vagrant 박스는 완전히 재사용이 가능합니다. 무언가 잘못되더라도 박스를 삭제하고 몇 분 만에 다시 생성할 수 있습니다!

Homestead는 Windows, macOS, Linux 등 어떤 운영체제에서도 실행 가능하며, Nginx, PHP, MySQL, PostgreSQL, Redis, Memcached, Node 등 다양한 소프트웨어를 함께 포함하고 있어서 라라벨 프로젝트 개발에 필요한 모든 환경을 제공합니다.

> [!WARNING]  
> Windows를 사용하는 경우에는 하드웨어 가상화(VT-x) 기능을 활성화해야 할 수 있습니다. 이 기능은 주로 BIOS에서 켤 수 있습니다. UEFI 시스템에서 Hyper-V를 사용 중이라면, VT-x 사용을 위해 Hyper-V를 비활성화해야 할 수도 있습니다.

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

Homestead 환경을 실행하기 전에 [Vagrant](https://developer.hashicorp.com/vagrant/downloads)와 아래 지원되는 공급자(provider) 중 하나를 먼저 설치해야 합니다:

- [VirtualBox 6.1.x](https://www.virtualbox.org/wiki/Download_Old_Builds_6_1)
- [Parallels](https://www.parallels.com/products/desktop/)

이 소프트웨어들은 모두 주요 운영체제에서 손쉽게 설치할 수 있도록 시각적인 설치 프로그램을 제공합니다.

Parallels 공급자를 사용하려면 [Parallels Vagrant 플러그인](https://github.com/Parallels/vagrant-parallels)을 추가로 설치해야 하며, 무료로 사용할 수 있습니다.

<a name="installing-homestead"></a>
#### Homestead 설치

Homestead는 해당 저장소를 호스트 머신에 클론하여 설치할 수 있습니다. Homestead 가상머신이 라라벨 애플리케이션 전체의 호스트 역할을 하게 되므로, 저장소를 "홈" 디렉터리 아래의 `Homestead` 폴더로 클론하는 것을 권장합니다. 이 문서 전반에서는 이 폴더를 “Homestead 디렉터리”라고 부릅니다:

```shell
git clone https://github.com/laravel/homestead.git ~/Homestead
```

Laravel Homestead 저장소를 클론한 후에는, 반드시 `release` 브랜치를 체크아웃하세요. 이 브랜치에는 항상 Homestead의 최신 안정 릴리스가 포함되어 있습니다:

```shell
cd ~/Homestead

git checkout release
```

그 다음, Homestead 디렉터리에서 `bash init.sh` 명령어를 실행하여 `Homestead.yaml` 설정 파일을 생성합니다. `Homestead.yaml`은 Homestead의 모든 설정을 지정하는 파일로, Homestead 디렉터리 내부에 생성됩니다:

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

<a name="configuring-homestead"></a>
### Homestead 설정하기

<a name="setting-your-provider"></a>
#### 공급자 지정

`Homestead.yaml` 파일의 `provider` 키를 통해 사용할 Vagrant 공급자(예: `virtualbox` 또는 `parallels`)를 지정할 수 있습니다:

```
provider: virtualbox
```

> [!WARNING]  
> Apple 실리콘(M1/M2) 칩을 사용하는 경우 Parallels 공급자를 반드시 사용해야 합니다.

<a name="configuring-shared-folders"></a>
#### 공유 폴더 설정

`Homestead.yaml` 파일의 `folders` 속성에는 Homestead 환경과 공유할 폴더 목록을 지정할 수 있습니다. 이 폴더에 있는 파일이 변경되면, 로컬 머신과 Homestead 가상환경 간에 동기화됩니다. 필요한 만큼 여러 개의 공유 폴더를 지정할 수 있습니다:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
```

> [!WARNING]  
> Windows 사용자는 `~/` 경로 문법 대신 프로젝트의 전체 경로(예: `C:\Users\user\Code\project1`)를 사용해야 합니다.

각 애플리케이션은 개별 폴더 매핑을 통해 연결하는 것이 좋습니다. 단일 대용량 디렉터리를 통째로 매핑하면, 가상머신이 해당 폴더 내부 '모든' 파일의 디스크 IO를 추적해야 하므로, 파일 개수가 많을 경우 성능이 저하될 수 있습니다:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
    - map: ~/code/project2
      to: /home/vagrant/project2
```

> [!WARNING]  
> Homestead 사용 시 절대로 `.`(현재 디렉터리)를 마운트하지 마십시오. 이렇게 하면 Vagrant가 현재 폴더를 `/vagrant`에 매핑하지 않고, 선택적 기능들이 손상되거나 예기치 않은 현상이 발생할 수 있습니다.

[NFS](https://developer.hashicorp.com/vagrant/docs/synced-folders/nfs) 기능을 활성화하고 싶다면 폴더 매핑에 `type` 옵션을 추가하면 됩니다:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "nfs"
```

> [!WARNING]  
> Windows에서 NFS를 사용할 경우, [vagrant-winnfsd](https://github.com/winnfsd/vagrant-winnfsd) 플러그인 설치를 권장합니다. 해당 플러그인은 가상머신 내 폴더와 파일의 사용자/그룹 권한 문제를 올바르게 관리해 줍니다.

Vagrant의 [Synced Folders](https://developer.hashicorp.com/vagrant/docs/synced-folders/basic_usage)에서 지원하는 다양한 옵션을 `options` 키를 통해 전달할 수도 있습니다:

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
### Nginx 사이트 설정하기

Nginx가 익숙하지 않더라도 걱정하지 마세요. `Homestead.yaml` 파일의 `sites` 속성을 사용하면, Homestead 내 "도메인"을 간단히 원하는 폴더에 매핑할 수 있습니다. 예제 사이트 구성도 기본 포함되어 있습니다. 여러 개의 사이트를 추가해도 무방하며, Homestead는 작업 중인 모든 라라벨 애플리케이션에 대해 편리한 가상 환경 역할을 할 수 있습니다:

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
```

Homestead 가상머신을 프로비저닝한 뒤에 `sites` 속성을 수정했다면, 변경 내용을 적용하려면 터미널에서 `vagrant reload --provision` 명령어를 실행해야 합니다. 이 명령어는 가상머신 내 Nginx 설정을 자동으로 갱신합니다.

> [!WARNING]  
> Homestead 스크립트는 최대한 idempotent(여러 번 반복 실행해도 결과가 같은)하게 동작하도록 만들어졌으나, 프로비저닝 중 문제가 발생하면 `vagrant destroy && vagrant up` 명령어를 사용하여 머신을 완전히 삭제 후 재생성하는 것이 좋습니다.

<a name="hostname-resolution"></a>
#### 호스트명(도메인) 해석

Homestead는 자동 호스트명 해석을 위해 `mDNS`를 사용하여 호스트명을 퍼블리시합니다. 예를 들어, `Homestead.yaml` 파일에 `hostname: homestead`를 설정했다면, `homestead.local` 주소로 접속할 수 있습니다. macOS, iOS, 그리고 대부분의 Linux 데스크톱 배포판에는 `mDNS` 지원이 기본 내장되어 있습니다. Windows 사용자의 경우, [Bonjour Print Services for Windows](https://support.apple.com/kb/DL999?viewlocale=en_US&locale=en_US)를 추가로 설치해야 합니다.

프로젝트별 Homestead 설치에서 자동 호스트명을 사용하는 것이 가장 편리합니다. 하나의 Homestead 인스턴스에 여러 사이트를 운영하는 경우, 웹사이트의 "도메인"을 자신의 컴퓨터 `hosts` 파일에 추가해야 합니다. 이 파일은 브라우저의 해당 도메인 접근 요청을 Homestead 가상머신으로 라우팅해 줍니다. macOS나 Linux는 `/etc/hosts` 위치에, Windows는 `C:\Windows\System32\drivers\etc\hosts`에 해당 파일이 있습니다. 다음과 같은 형식으로 추가하면 됩니다:

```
192.168.56.56  homestead.test
```

입력한 IP 주소가 `Homestead.yaml` 파일에 지정한 값과 일치하는지 반드시 확인하세요. hosts 파일 편집과 Vagrant 박스 실행이 완료되면, 브라우저에서 다음과 같이 사이트를 접근할 수 있습니다:

```shell
http://homestead.test
```

<a name="configuring-services"></a>
### 서비스 설정하기

Homestead는 여러 서비스를 기본으로 시작하지만, 프로비저닝 시점에 활성화하거나 비활성화할 서비스를 직접 지정할 수도 있습니다. 예를 들어, PostgreSQL을 활성화하고 MySQL은 비활성화하려면 `Homestead.yaml` 파일의 `services` 옵션을 아래와 같이 수정합니다:

```yaml
services:
    - enabled:
        - "postgresql"
    - disabled:
        - "mysql"
```

여기서 지정한 서비스는 `enabled` 및 `disabled` 지시어의 순서에 따라 시작되거나 중지됩니다.

<a name="launching-the-vagrant-box"></a>
### Vagrant 박스 실행하기

`Homestead.yaml` 파일의 설정을 완료했다면, Homestead 디렉터리에서 `vagrant up` 명령어를 실행하세요. 그러면 Vagrant가 가상머신을 부팅하고, 공유 폴더와 Nginx 사이트 역시 자동으로 구성합니다.

머신을 삭제하고 싶을 때는 `vagrant destroy` 명령어를 사용할 수 있습니다.

<a name="per-project-installation"></a>
### 프로젝트별 설치

Homestead를 전역(global)으로 설치하여 여러 프로젝트에서 같은 가상머신을 공유하는 대신, 각 프로젝트마다 개별 Homestead 인스턴스를 구성할 수도 있습니다. 만약 프로젝트와 함께 `Vagrantfile`을 포함해 전달하고 싶거나, 저장소를 복제한 팀원들도 바로 `vagrant up`만으로 환경을 띄우게 하려면 프로젝트별 Homestead 설치가 매우 유용합니다.

Composer 패키지 매니저를 사용해 프로젝트에 Homestead를 설치하세요:

```shell
composer require laravel/homestead --dev
```

설치가 완료되면, Homestead의 `make` 명령어를 실행해 프로젝트를 위한 `Vagrantfile`과 `Homestead.yaml` 파일을 생성합니다. 두 파일 모두 프로젝트의 루트에 위치하게 되며, `make` 명령어는 `Homestead.yaml`의 `sites` 및 `folders` 설정을 자동으로 구성해 줍니다:

```shell
# macOS / Linux...
php vendor/bin/homestead make

# Windows...
vendor\\bin\\homestead make
```

이제 터미널에서 `vagrant up` 명령어를 실행한 뒤, 브라우저에서 `http://homestead.test` 주소로 프로젝트에 접속할 수 있습니다. 단, 자동 [호스트명 해석](#hostname-resolution)을 사용하지 않을 경우, `homestead.test`(또는 원하는 도메인명)를 `/etc/hosts` 파일에 등록해야 함을 잊지 마세요.

<a name="installing-optional-features"></a>
### 선택적 기능 설치

선택적인 소프트웨어는 `Homestead.yaml` 파일의 `features` 옵션을 통해 설치할 수 있습니다. 대부분의 기능은 true/false 값으로 간단히 활성화 또는 비활성화할 수 있으며, 일부는 여러 옵션을 설정할 수도 있습니다:

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

Elasticsearch의 지원되는 버전(정확한 major.minor.patch 형태의 버전 번호)을 지정할 수 있습니다. 기본 설치 시 클러스터 이름은 'homestead'로 생성됩니다. Elasticsearch는 운영체제 메모리의 절반 이상을 할당하면 안 되므로, Homestead 가상머신의 메모리가 할당량의 두 배 이상이 되도록 조정하세요.

> [!NOTE]  
> [Elasticsearch 공식 문서](https://www.elastic.co/guide/en/elasticsearch/reference/current)를 참고하여 환경 설정을 커스터마이즈하는 방법을 확인할 수 있습니다.

<a name="mariadb"></a>
#### MariaDB

MariaDB를 활성화하면 MySQL은 제거되고 MariaDB가 설치됩니다. MariaDB는 MySQL의 대체재로 사용할 수 있으니, 애플리케이션의 데이터베이스 설정에서 여전히 `mysql` 데이터베이스 드라이버를 사용해야 합니다.

<a name="mongodb"></a>
#### MongoDB

MongoDB를 기본 설치할 경우 기본 데이터베이스의 사용자명은 `homestead`, 비밀번호는 `secret`으로 지정됩니다.

<a name="neo4j"></a>
#### Neo4j

Neo4j를 기본 설치할 경우, 데이터베이스의 사용자명은 `homestead`, 비밀번호는 `secret`으로 설정됩니다. Neo4j 브라우저에 접속하려면 웹 브라우저에서 `http://homestead.test:7474`로 접속하세요. 포트 `7687`(Bolt), `7474`(HTTP), `7473`(HTTPS)이 Neo4j 클라이언트 요청을 처리하도록 준비되어 있습니다.

<a name="aliases"></a>
### Alias(별칭)

Homestead 가상머신 내에서 Bash 별칭을 사용하려면, Homestead 디렉터리 안의 `aliases` 파일을 수정하세요:

```shell
alias c='clear'
alias ..='cd ..'
```

`aliases` 파일을 수정한 후에는 반드시 `vagrant reload --provision` 명령어로 Homestead 가상머신을 다시 프로비저닝해야 새로운 별칭이 적용됩니다.

<a name="updating-homestead"></a>
## Homestead 업데이트하기

Homestead를 업데이트하기 전에, 먼저 Homestead 디렉터리 내에서 아래 명령어로 기존 가상머신을 삭제해야 합니다:

```shell
vagrant destroy
```

그 다음, Homestead 소스 코드를 업데이트해야 합니다. 저장소를 직접 클론해서 설치했다면, 저장소 경로에서 다음 명령어를 차례로 실행하면 됩니다:

```shell
git fetch

git pull origin release
```

위 명령들은 GitHub 저장소에서 최신 Homestead 코드를 가져오고, 최신 태그를 설치한 뒤 최신 릴리즈 버전을 체크아웃합니다. Homestead의 안정화된 최신 릴리즈 버전은 [GitHub 릴리즈 페이지](https://github.com/laravel/homestead/releases)에서 확인할 수 있습니다.

만약 프로젝트의 `composer.json` 파일을 통해 Homestead를 설치한 경우, `composer.json` 파일이 `"laravel/homestead": "^12"`를 포함하는지 확인한 뒤 아래와 같이 의존성을 업데이트하세요:

```shell
composer update
```

그리고 나서, Vagrant 박스를 `vagrant box update` 명령어로 업데이트해야 합니다:

```shell
vagrant box update
```

Vagrant 박스를 업데이트한 후, Homestead 디렉터리에서 `bash init.sh` 명령어로 추가 설정 파일을 업데이트하세요. 이 과정에서 기존 `Homestead.yaml`, `after.sh`, `aliases` 파일을 덮어쓸 것인지 묻는 안내가 나타납니다:

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

마지막으로, 최신 Vagrant 설치 내용을 적용하려면 Homestead 가상머신을 재생성해야 합니다:

```shell
vagrant up
```

<a name="daily-usage"></a>
## 일상적인 사용

<a name="connecting-via-ssh"></a>
### SSH를 통한 접속

Homestead 디렉터리 내에서 터미널로 `vagrant ssh` 명령어를 실행하면 가상머신에 SSH로 접속할 수 있습니다.

<a name="adding-additional-sites"></a>
### 추가 사이트 등록

Homestead 환경이 프로비저닝되어 실행 중이라면, 다른 라라벨 프로젝트를 위한 추가 Nginx 사이트도 편리하게 등록할 수 있습니다. 하나의 Homestead 환경에서 여러 라라벨 프로젝트를 동시에 운영할 수 있습니다. 추가 사이트를 등록하려면, 해당 사이트 정보를 `Homestead.yaml` 파일에 추가하십시오.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
    - map: another.test
      to: /home/vagrant/project2/public
```

> [!WARNING]  
> 사이트 추가 시 반드시 먼저 해당 프로젝트의 [폴더 매핑](#configuring-shared-folders)이 설정되어 있는지 확인하세요.

만약 Vagrant가 자동으로 "hosts" 파일을 관리하지 않는다면, 새 사이트 정보도 추가로 hosts 파일에 등록해야 합니다. macOS나 Linux의 경우 `/etc/hosts`, Windows의 경우 `C:\Windows\System32\drivers\etc\hosts`에 다음과 같이 입력하세요:

```
192.168.56.56  homestead.test
192.168.56.56  another.test
```

사이트를 추가했다면, Homestead 디렉터리에서 터미널로 `vagrant reload --provision` 명령어를 실행하여 변경 사항을 적용하세요.

<a name="site-types"></a>
#### 사이트 타입

Homestead는 다양한 "타입(type)"의 사이트를 지원합니다. 이를 이용하면 라라벨 기반이 아닌 프로젝트도 쉽게 실행할 수 있습니다. 예를 들어, `statamic` 사이트 타입을 활용하여 Statamic 애플리케이션을 Homestead에 추가할 수 있습니다:

```yaml
sites:
    - map: statamic.test
      to: /home/vagrant/my-symfony-project/web
      type: "statamic"
```

지원되는 사이트 타입은 `apache`, `apache-proxy`, `apigility`, `expressive`, `laravel`(기본값), `proxy`(nginx용), `silverstripe`, `statamic`, `symfony2`, `symfony4`, `zf` 등이 있습니다.

<a name="site-parameters"></a>
#### 사이트 파라미터

`params` 사이트 지시어를 사용하면, 사이트별로 추가 Nginx `fastcgi_param` 값을 지정할 수 있습니다:

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

글로벌 환경 변수는 `Homestead.yaml` 파일에 추가하여 지정할 수 있습니다:

```yaml
variables:
    - key: APP_ENV
      value: local
    - key: FOO
      value: bar
```

`Homestead.yaml` 파일 변경 후 반드시 `vagrant reload --provision` 명령어로 머신을 다시 프로비저닝해야 합니다. 이렇게 하면 모든 PHP 버전의 PHP-FPM 설정과 `vagrant` 사용자 환경 변수도 함께 업데이트됩니다.

<a name="ports"></a>
### 포트

기본적으로 아래 포트들은 Homestead 환경으로 포워딩됩니다:

<div class="content-list" markdown="1">

- **HTTP:** 8000 → 80 포트로 포워딩
- **HTTPS:** 44300 → 443 포트로 포워딩

</div>

<a name="forwarding-additional-ports"></a>
#### 추가 포트 포워딩

필요하다면 `Homestead.yaml` 파일의 `ports` 항목에 포트 포워딩 설정을 추가할 수 있습니다. 파일을 수정한 후에는 반드시 `vagrant reload --provision` 명령어로 머신을 다시 프로비저닝해야 합니다:

```yaml
ports:
    - send: 50000
      to: 5000
    - send: 7777
      to: 777
      protocol: udp
```

아래는 호스트 머신에서 Vagrant 박스로 매핑할 수 있는 Homestead 서비스 포트 목록입니다:

<div class="content-list" markdown="1">

- **SSH:** 2222 → 22 포트로
- **ngrok UI:** 4040 → 4040 포트로
- **MySQL:** 33060 → 3306 포트로
- **PostgreSQL:** 54320 → 5432 포트로
- **MongoDB:** 27017 → 27017 포트로
- **Mailpit:** 8025 → 8025 포트로
- **Minio:** 9600 → 9600 포트로

</div>

<a name="php-versions"></a>
### PHP 버전

Homestead는 한 대의 가상머신에서 여러 PHP 버전을 지원합니다. `Homestead.yaml` 파일에서 사이트별로 사용할 PHP 버전을 지정할 수 있습니다. 지원되는 PHP 버전은 "5.6", "7.0", "7.1", "7.2", "7.3", "7.4", "8.0", "8.1", "8.2", "8.3"(기본값)입니다:

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      php: "7.1"
```

[Homestead 가상머신 내부](#connecting-via-ssh)에서는 CLI 환경에서 아래처럼 지원되는 PHP 버전을 사용할 수 있습니다:

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

CLI에서 기본적으로 사용할 PHP 버전을 변경하고 싶다면, Homestead 가상머신 내에서 아래 명령어들을 실행하면 됩니다:

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

### 데이터베이스에 연결하기

MySQL과 PostgreSQL 모두에서 `homestead` 데이터베이스가 기본적으로 구성되어 있습니다. 호스트 머신의 데이터베이스 클라이언트에서 MySQL 또는 PostgreSQL 데이터베이스에 연결하려면 `127.0.0.1`의 `33060` 포트(MySQL) 또는 `54320` 포트(PostgreSQL)로 접속해야 합니다. 두 데이터베이스의 사용자명과 비밀번호는 각각 `homestead` / `secret`입니다.

> [!WARNING]  
> 이러한 비표준 포트는 오직 호스트 머신에서 데이터베이스에 접속할 때만 사용해야 합니다. 라라벨 애플리케이션의 `database` 설정 파일에서는 기본 포트인 3306과 5432를 사용해야 합니다. 라라벨 애플리케이션은 가상 머신 _내부_ 에서 실행되기 때문입니다.

<a name="database-backups"></a>
### 데이터베이스 백업

Homestead는 Homestead 가상 머신이 삭제될 때 데이터베이스를 자동으로 백업해줄 수 있습니다. 이 기능을 사용하려면 Vagrant 2.1.0 이상이 필요합니다. 만약 더 이전 버전의 Vagrant를 사용한다면, `vagrant-triggers` 플러그인을 설치해야 합니다. 데이터베이스 자동 백업 기능을 활성화하려면, `Homestead.yaml` 파일에 다음과 같이 추가합니다.

```
backup: true
```

이렇게 설정한 후에는 `vagrant destroy` 명령어가 실행될 때 Homestead가 데이터베이스를 `.backup/mysql_backup`과 `.backup/postgres_backup` 디렉터리에 내보냅니다. 이 디렉터리들은 Homestead를 설치한 폴더 안에 생성되며, [프로젝트별 설치](#per-project-installation) 방식을 사용할 경우 프로젝트 루트에서 확인할 수 있습니다.

<a name="configuring-cron-schedules"></a>
### 크론 스케줄 설정하기

라라벨은 [크론 작업 스케줄링](/docs/11.x/scheduling)을 편리하게 제공하며, `schedule:run` 아티즌 명령어를 1분마다 실행하도록 스케줄만 등록하면 됩니다. `schedule:run` 명령어는 `routes/console.php` 파일에 정의된 작업 스케줄을 확인해 어떤 예약 작업을 실행할지 결정합니다.

Homestead 사이트에서 `schedule:run` 명령어가 실행되도록 하고 싶다면, 사이트를 설정할 때 `schedule` 옵션을 `true`로 지정하면 됩니다.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      schedule: true
```

해당 사이트의 크론 작업은 Homestead 가상 머신의 `/etc/cron.d` 디렉터리에 생성됩니다.

<a name="configuring-mailpit"></a>
### Mailpit 설정하기

[Mailpit](https://github.com/axllent/mailpit)은 메일을 실제 수신자에게 전송하지 않고도, 발송되는 이메일을 가로채어 내용을 직접 확인할 수 있도록 도와줍니다. 사용을 시작하려면 애플리케이션의 `.env` 파일을 아래와 같이 수정하세요.

```ini
MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

Mailpit 설정을 마치면, 브라우저에서 `http://localhost:8025`로 접속하여 Mailpit 대시보드에 접근할 수 있습니다.

<a name="configuring-minio"></a>
### Minio 설정하기

[Minio](https://github.com/minio/minio)는 Amazon S3와 호환되는 API를 갖춘 오픈 소스 객체 스토리지 서버입니다. Minio를 설치하려면 [features](#installing-optional-features) 섹션에 아래와 같이 `Homestead.yaml` 파일을 수정하세요.

```
minio: true
```

기본적으로 Minio는 9600 포트에서 사용할 수 있습니다. `http://localhost:9600`으로 접속하면 Minio 관리 패널에 접근할 수 있습니다. 기본 access key는 `homestead`, secret key는 `secretkey`입니다. Minio에 접근할 때는 반드시 `us-east-1` 지역(region)을 사용해야 합니다.

Minio를 제대로 사용하려면 아래처럼 `.env` 파일을 설정해야 합니다.

```ini
AWS_USE_PATH_STYLE_ENDPOINT=true
AWS_ENDPOINT=http://localhost:9600
AWS_ACCESS_KEY_ID=homestead
AWS_SECRET_ACCESS_KEY=secretkey
AWS_DEFAULT_REGION=us-east-1
```

Minio를 이용한 "S3" 버킷을 생성하려면, `Homestead.yaml` 파일에 `buckets` 항목을 추가하세요. 버킷을 정의한 후, 터미널에서 `vagrant reload --provision` 명령어를 실행해야 합니다.

```yaml
buckets:
    - name: your-bucket
      policy: public
    - name: your-private-bucket
      policy: none
```

지정 가능한 `policy` 값에는 `none`, `download`, `upload`, `public`이 있습니다.

<a name="laravel-dusk"></a>
### Laravel Dusk

[Laravel Dusk](/docs/11.x/dusk) 테스트를 Homestead 내부에서 실행하고 싶다면, Homestead 설정에서 [`webdriver` 기능](#installing-optional-features)을 활성화해야 합니다.

```yaml
features:
    - webdriver: true
```

`webdriver` 기능을 활성화한 후 터미널에서 `vagrant reload --provision` 명령어를 실행하세요.

<a name="sharing-your-environment"></a>
### 환경 공유하기

동료나 클라이언트와 현재 작업하고 있는 내용을 공유하고 싶을 때가 있습니다. Vagrant는 `vagrant share` 명령어를 통해 이런 기능을 제공합니다. 하지만 Homestead에서 여러 사이트를 `Homestead.yaml` 파일에 동시에 설정할 경우, `vagrant share` 명령어는 정상적으로 작동하지 않습니다.

이 문제를 해결하기 위해 Homestead에는 자체적으로 `share` 명령어가 제공됩니다. 먼저 [SSH로 Homestead 가상 머신에 접속](#connecting-via-ssh)한 뒤, `share homestead.test` 명령어를 실행합니다. 이 명령어는 `Homestead.yaml`에 정의된 `homestead.test` 사이트를 공유합니다. 필요에 따라 원하는 사이트 이름으로 대체할 수 있습니다.

```shell
share homestead.test
```

명령어를 실행하면 Ngrok 화면이 열리며, 활동 로그와 공유 사이트에 접근할 수 있는 공개 URL이 나타납니다. 별도의 region(지역), subdomain(서브도메인), 또는 기타 Ngrok 런타임 옵션을 지정하고 싶다면 아래와 같이 명령어에 추가할 수 있습니다.

```shell
share homestead.test -region=eu -subdomain=laravel
```

HTTP 대신 HTTPS로 콘텐츠를 공유해야 한다면, `share` 대신 `sshare` 명령어를 사용하면 됩니다.

> [!WARNING]  
> Vagrant는 본질적으로 안전하지 않으므로, `share` 명령어를 사용하는 동안에는 가상 머신이 인터넷에 노출된다는 점을 반드시 유념하세요.

<a name="debugging-and-profiling"></a>
## 디버깅 및 프로파일링

<a name="debugging-web-requests"></a>
### Xdebug로 웹 요청 디버깅하기

Homestead는 [Xdebug](https://xdebug.org)를 이용한 단계별(step) 디버깅을 지원합니다. 예를 들어, 브라우저에서 어떤 페이지에 접근하면 PHP가 IDE와 연결되어 동작 중인 코드를 확인하거나 수정할 수 있습니다.

기본적으로 Xdebug는 이미 활성화되어 있으며 연결할 준비가 되어 있습니다. CLI에서 Xdebug를 활성화해야 할 경우, Homestead 가상 머신 내에서 `sudo phpenmod xdebug` 명령어를 실행하세요. IDE의 안내에 따라 디버깅을 적용하고, 브라우저에는 확장 프로그램이나 [북마클릿(bookmarklet)](https://www.jetbrains.com/phpstorm/marklets/)을 추가해 Xdebug가 동작하도록 설정합니다.

> [!WARNING]  
> Xdebug를 활성화하면 PHP 실행 속도가 현저히 느려집니다. Xdebug를 비활성화하고 싶다면 Homestead 가상 머신 내에서 `sudo phpdismod xdebug` 명령어를 실행한 뒤 FPM 서비스를 재시작하세요.

<a name="autostarting-xdebug"></a>
#### Xdebug 자동 시작(Autostart) 설정

웹 서버에 요청을 보내는 기능 테스트를 디버깅할 때, 디버깅을 수동으로 트리거하지 않고 자동으로 시작되게 하는 것이 더 편리합니다. Xdebug를 자동 실행하도록 강제하려면, Homestead 가상 머신 내부의 `/etc/php/7.x/fpm/conf.d/20-xdebug.ini` 파일을 수정하고 아래 설정을 추가하세요.

```ini
; Homestead.yaml에서 다른 서브넷을 사용하는 경우, 이 주소는 다를 수 있습니다...
xdebug.client_host = 192.168.10.1
xdebug.mode = debug
xdebug.start_with_request = yes
```

<a name="debugging-cli-applications"></a>
### CLI 애플리케이션 디버깅

PHP CLI 애플리케이션을 디버깅하려면 Homestead 가상 머신에서 `xphp` 셸 별칭을 사용하세요.

```
xphp /path/to/script
```

<a name="profiling-applications-with-blackfire"></a>
### Blackfire로 애플리케이션 프로파일링

[Blackfire](https://blackfire.io/docs/introduction)는 웹 요청과 CLI 애플리케이션의 실행 프로파일링을 위한 서비스입니다. 프로파일 데이터를 호출 그래프 및 타임라인으로 보여주는 인터랙티브한 사용자 인터페이스를 제공합니다. 개발 환경뿐 아니라 스테이징, 프로덕션 환경에서도 사용할 수 있으며, 최종 사용자에겐 오버헤드가 없습니다. 추가로, Blackfire는 코드 및 `php.ini` 설정에 대해 성능, 품질, 보안 점검 기능을 제공합니다.

[Blackfire Player](https://blackfire.io/docs/player/index)는 오픈소스 웹 크롤링, 웹 테스트, 웹 스크래핑 애플리케이션으로, Blackfire와 연동하여 프로파일링 시나리오를 스크립트로 작성할 수 있습니다.

Blackfire를 활성화하려면 Homestead 설정 파일의 "features" 항목에 아래와 같이 추가합니다.

```yaml
features:
    - blackfire:
        server_id: "server_id"
        server_token: "server_value"
        client_id: "client_id"
        client_token: "client_value"
```

Blackfire 서버 및 클라이언트 인증 정보는 [Blackfire 계정](https://blackfire.io/signup)이 필요합니다. Blackfire는 CLI 도구, 브라우저 확장 등 다양한 방법으로 애플리케이션을 프로파일링할 수 있습니다. 자세한 내용은 [Blackfire 공식 문서](https://blackfire.io/docs/php/integrations/laravel/index)를 참고하세요.

<a name="network-interfaces"></a>
## 네트워크 인터페이스

`Homestead.yaml` 파일의 `networks` 속성은 Homestead 가상 머신의 네트워크 인터페이스를 설정합니다. 필요한 만큼 여러 개의 인터페이스를 구성할 수 있습니다.

```yaml
networks:
    - type: "private_network"
      ip: "192.168.10.20"
```

[브리지(bridged)](https://developer.hashicorp.com/vagrant/docs/networking/public_network) 인터페이스를 활성화하려면 네트워크의 설정에 `bridge`를 추가하고, network 타입을 `public_network`로 변경하세요.

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
```

[DHCP](https://developer.hashicorp.com/vagrant/docs/networking/public_network#dhcp)를 사용하려면, 설정에서 `ip` 옵션만 제거하면 됩니다.

```yaml
networks:
    - type: "public_network"
      bridge: "en1: Wi-Fi (AirPort)"
```

네트워크가 사용하는 디바이스를 변경하려면, network 설정에 `dev` 옵션을 추가할 수 있습니다. 기본 `dev` 값은 `eth0`입니다.

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
      dev: "enp2s0"
```

<a name="extending-homestead"></a>
## Homestead 확장하기

Homestead는 Homestead 디렉터리의 루트에 있는 `after.sh` 스크립트를 이용해 확장할 수 있습니다. 이 파일에서 가상 머신을 적절하게 구성, 커스터마이즈하는 데 필요한 모든 셸 명령어를 추가할 수 있습니다.

Homestead를 커스터마이즈할 때, 우분투가 패키지의 원본 설정을 유지할지 아니면 새 설정 파일로 덮어쓸지 물어볼 수 있습니다. 이를 방지하려면 패키지 설치 시, 기존에 Homestead에서 작성했던 설정을 보존하는 다음 명령어를 사용하세요.

```shell
sudo apt-get -y \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" \
    install package-name
```

<a name="user-customizations"></a>
### 사용자 정의 설정

팀과 함께 Homestead를 사용하다 보면 개인의 개발 스타일에 맞게 Homestead를 조정하고 싶을 수 있습니다. 이럴 때를 위해 `Homestead.yaml` 파일과 같은 위치(루트)에 `user-customizations.sh` 파일을 만들 수 있습니다. 여기에는 원하는 모든 커스터마이징 내용을 적용하면 되지만, `user-customizations.sh` 파일은 버전 관리 대상에 포함시키지 않아야 합니다.

<a name="provider-specific-settings"></a>
## 공급자(Provider)별 설정

<a name="provider-specific-virtualbox"></a>
### VirtualBox

<a name="natdnshostresolver"></a>
#### `natdnshostresolver`

기본적으로 Homestead는 `natdnshostresolver` 설정을 `on`으로 구성합니다. 이로 인해 Homestead는 호스트 운영 체제의 DNS 설정을 사용할 수 있습니다. 이 동작을 직접 제어하고 싶다면, `Homestead.yaml` 파일에 아래와 같이 설정 옵션을 추가하세요.

```yaml
provider: virtualbox
natdnshostresolver: 'off'
```