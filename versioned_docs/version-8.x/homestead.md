# 라라벨 홈스테드 (Laravel Homestead)

- [소개](#introduction)
- [설치 및 설정](#installation-and-setup)
    - [시작하기](#first-steps)
    - [Homestead 설정](#configuring-homestead)
    - [Nginx 사이트 설정](#configuring-nginx-sites)
    - [서비스 설정](#configuring-services)
    - [Vagrant 박스 실행하기](#launching-the-vagrant-box)
    - [프로젝트별 설치](#per-project-installation)
    - [옵션 기능 설치하기](#installing-optional-features)
    - [별칭(Alias) 관리](#aliases)
- [Homestead 업데이트](#updating-homestead)
- [일상적인 사용 방법](#daily-usage)
    - [SSH로 접속하기](#connecting-via-ssh)
    - [추가 사이트 등록](#adding-additional-sites)
    - [환경 변수](#environment-variables)
    - [포트 설정](#ports)
    - [PHP 버전 관리](#php-versions)
    - [데이터베이스 연결](#connecting-to-databases)
    - [데이터베이스 백업](#database-backups)
    - [크론 일정 설정](#configuring-cron-schedules)
    - [MailHog 설정](#configuring-mailhog)
    - [Minio 설정](#configuring-minio)
    - [라라벨 더스크](#laravel-dusk)
    - [환경 공유하기](#sharing-your-environment)
- [디버깅 및 프로파일링](#debugging-and-profiling)
    - [Xdebug로 웹 요청 디버깅](#debugging-web-requests)
    - [CLI 애플리케이션 디버깅](#debugging-cli-applications)
    - [Blackfire를 이용한 애플리케이션 프로파일링](#profiling-applications-with-blackfire)
- [네트워크 인터페이스](#network-interfaces)
- [Homestead 확장하기](#extending-homestead)
- [프로바이더별 설정](#provider-specific-settings)
    - [VirtualBox](#provider-specific-virtualbox)

<a name="introduction"></a>
## 소개

라라벨은 개발자가 더욱 즐겁게 PHP 개발을 할 수 있도록, 로컬 개발 환경까지 포함하여 전체 개발 경험을 향상시키는 것을 목표로 합니다. [라라벨 홈스테드](https://github.com/laravel/homestead)는 PHP, 웹 서버, 기타 서버 관련 소프트웨어들을 별도로 설치하지 않아도 바로 사용할 수 있는, 공식적으로 제공되는 사전 구성된 Vagrant 박스입니다. 이로써 여러분은 훌륭한 개발 환경을 간단하게 구축할 수 있습니다.

[Vagrant](https://www.vagrantup.com)는 가상 머신을 관리하고 프로비저닝하는 매우 간단하고 우아한 방법을 제공합니다. Vagrant 박스는 언제든지 손쉽게 삭제할 수 있어, 문제가 생기더라도 몇 분만에 새로운 박스를 다시 만들 수 있습니다.

Homestead는 Windows, macOS, Linux 등 모든 운영체제에서 동작하며, Nginx, PHP, MySQL, PostgreSQL, Redis, Memcached, Node 등 라라벨 개발에 필요한 대부분의 소프트웨어가 포함되어 있습니다.

> [!NOTE]
> Windows를 사용하는 경우, 하드웨어 가상화(VT-x) 기능을 BIOS에서 활성화해야 할 수 있습니다. UEFI 시스템에서 Hyper-V를 사용 중이라면, VT-x 사용을 위해 Hyper-V를 비활성화해야 할 수도 있습니다.

<a name="included-software"></a>
### 기본 포함 소프트웨어

<div id="software-list" markdown="1">

- Ubuntu 20.04
- Git
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
- PostgreSQL 13
- Composer
- Node (Yarn, Bower, Grunt, Gulp 포함)
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
### 선택적 소프트웨어

<div id="software-list" markdown="1">

- Apache
- Blackfire
- Cassandra
- Chronograf
- CouchDB
- Crystal & Lucky Framework
- Docker
- Elasticsearch
- EventStoreDB
- Gearman
- Go
- Grafana
- InfluxDB
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

Homestead 환경을 실행하기 전에 [Vagrant](https://www.vagrantup.com/downloads.html)와 아래 지원되는 프로바이더 중 하나를 반드시 설치해야 합니다.

- [VirtualBox 6.1.x](https://www.virtualbox.org/wiki/Downloads)
- [Parallels](https://www.parallels.com/products/desktop/)

위 소프트웨어들은 주요 운영체제에서 사용할 수 있는 간편한 설치 프로그램을 제공합니다.

Parallels 프로바이더를 사용하려면 [Parallels Vagrant 플러그인](https://github.com/Parallels/vagrant-parallels)을 별도로 설치해야 하며, 해당 플러그인은 무료입니다.

<a name="installing-homestead"></a>
#### Homestead 설치하기

Homestead를 설치하려면, Homestead 저장소를 호스트 머신(내 컴퓨터)에 클론해 주세요. Homestead 박스는 여러 라라벨 애플리케이션의 호스트 역할을 하므로, 홈 디렉터리 내에 `Homestead` 폴더를 만들고 여기에 클론하는 것을 추천합니다. 이 문서에서는 해당 폴더를 "Homestead 디렉터리"라고 부릅니다.

```bash
git clone https://github.com/laravel/homestead.git ~/Homestead
```

저장소를 클론한 후, 항상 최신 안정 버전이 존재하는 `release` 브랜치를 체크아웃해야 합니다.

```
cd ~/Homestead

git checkout release
```

이제 Homestead 디렉터리에서 `bash init.sh` 명령을 실행하면, Homestead 설정을 위한 `Homestead.yaml` 파일이 생성됩니다. 이 파일에서 Homestead의 모든 설정을 구성할 수 있으며, 생성된 파일은 Homestead 디렉터리에 위치하게 됩니다.

```
// macOS / Linux...
bash init.sh

// Windows...
init.bat
```

<a name="configuring-homestead"></a>
### Homestead 설정

<a name="setting-your-provider"></a>
#### 프로바이더 지정

`Homestead.yaml` 파일의 `provider` 항목은 사용할 Vagrant 프로바이더를 지정합니다. 예를 들어 `virtualbox` 또는 `parallels` 중 하나를 설정할 수 있습니다.

```
provider: virtualbox
```

> [!NOTE]
> Apple Silicon(M1, M2 등)을 사용하는 경우, `Homestead.yaml` 파일에 `box: laravel/homestead-arm`을 추가해야 하며, 반드시 Parallels 프로바이더를 사용해야 합니다.

<a name="configuring-shared-folders"></a>
#### 공유 폴더 설정

`Homestead.yaml`의 `folders` 항목에서는 Homestead 환경과 공유할 폴더를 지정합니다. 이 목록에 포함된 폴더들은 변경 시, 로컬 환경과 가상 머신 환경 간에 자동으로 동기화됩니다. 여러 폴더를 자유롭게 공유 설정할 수 있습니다.

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
```

> [!NOTE]
> Windows 사용자는 `~/` 형태 대신 전체 경로를 사용해야 합니다. 예: `C:\Users\user\Code\project1`

여러 애플리케이션을 한 폴더에 몰아서 매핑하기보다, 각 애플리케이션마다 별도의 폴더 매핑을 사용하는 것이 좋습니다. 매핑한 폴더의 파일 개수가 많을수록 디스크 IO 부하 때문에 성능이 저하될 수 있습니다.

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
    - map: ~/code/project2
      to: /home/vagrant/project2
```

> [!NOTE]
> Homestead를 사용할 때에는 `.`(현재 디렉터리)를 절대로 마운트하지 마십시오. 이 경우 Vagrant가 현재 폴더를 `/vagrant`로 매핑하지 않으므로, 다양한 옵션 기능이 정상 동작하지 않을 수 있습니다.

[NFS](https://www.vagrantup.com/docs/synced-folders/nfs.html) 방식을 사용하려면, 폴더 매핑에 `type` 옵션을 추가하면 됩니다.

```
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "nfs"
```

> [!NOTE]
> Windows 환경에서 NFS를 사용하려면 [vagrant-winnfsd](https://github.com/winnfsd/vagrant-winnfsd) 플러그인을 설치하는 것을 권장합니다. 이 플러그인은 Homestead 가상머신 안의 파일 및 디렉터리 권한을 적절히 유지시켜줍니다.

또한 Vagrant의 [Synced Folders](https://www.vagrantup.com/docs/synced-folders/basic_usage.html)에서 지원하는 옵션들도 `options` 항목 아래에 추가해서 사용할 수 있습니다.

```
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

Nginx가 낯설어도 걱정하지 마십시오. `Homestead.yaml` 파일에서 `sites` 항목을 활용하면, 원하는 "도메인"을 Homestead 환경 내의 특정 폴더에 쉽게 매핑할 수 있습니다. 기본적으로 예제 설정이 추가되어 있으며, 여러 사이트를 자유롭게 추가할 수 있습니다. 이처럼 Homestead는 여러분이 작업하는 모든 라라벨 애플리케이션의 가상 실행 환경이 될 수 있습니다.

```
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
```

만약 Homestead 가상머신을 프로비저닝(세팅)한 후에 `sites` 항목을 변경했다면, Nginx 설정을 적용하려면 터미널에서 `vagrant reload --provision` 명령을 실행해야 합니다.

> [!NOTE]
> Homestead의 프로비저닝 스크립트는 가능하면 항상 동일한 결과가 나오도록(idempotent) 설계되어 있습니다. 하지만 프로비저닝 중 오류가 발생한다면, `vagrant destroy && vagrant up`으로 가상머신을 삭제 후 재생성하는 것이 가장 확실한 방법입니다.

<a name="hostname-resolution"></a>
#### 호스트네임(도메인) 자동 해석

Homestead는 `mDNS`를 사용해 호스트네임을 자동으로 등록합니다. 예를 들어, `Homestead.yaml` 파일에 `hostname: homestead`를 지정하면, `homestead.local`로 접속이 가능합니다. macOS, iOS, 대부분의 리눅스 데스크탑은 기본적으로 `mDNS`를 지원하지만, Windows 사용자는 [Bonjour Print Services for Windows](https://support.apple.com/kb/DL999?viewlocale=en_US&locale=en_US)를 별도 설치해야 합니다.

자동 호스트네임 기능은 [프로젝트별 설치](#per-project-installation) 방식에서 특히 잘 동작합니다. 한 Homestead 인스턴스에 여러 사이트를 호스팅하는 경우, 각 웹사이트의 "도메인"을 자신의 `hosts` 파일에 직접 추가해주면 됩니다. 이 파일은 macOS, Linux에서는 `/etc/hosts`, Windows에서는 `C:\Windows\System32\drivers\etc\hosts` 경로에 위치합니다. 다음과 같이 추가합니다.

```
192.168.56.56  homestead.test
```

`Homestead.yaml`에 설정된 IP 주소를 추가한 뒤, 박스를 실행하면 이제 브라우저에서 해당 사이트로 접근할 수 있습니다.

```bash
http://homestead.test
```

<a name="configuring-services"></a>
### 서비스 설정

Homestead는 기본적으로 여러 서비스들을 자동으로 실행합니다. 하지만, 프로비저닝 시 어떤 서비스를 활성화하거나 비활성화할지는 자유롭게 지정할 수 있습니다. 예를 들어 PostgreSQL만 활성화하고 MySQL은 비활성화하고 싶다면 아래와 같이 `Homestead.yaml` 파일의 `services` 옵션을 수정하면 됩니다.

```yaml
services:
    - enabled:
        - "postgresql"
    - disabled:
        - "mysql"
```

`enabled`, `disabled` 하위에 나열된 항목 순서와 관계없이, 해당 서비스가 실행 또는 중단됩니다.

<a name="launching-the-vagrant-box"></a>
### Vagrant 박스 실행하기

`Homestead.yaml` 파일의 설정을 마쳤다면, Homestead 디렉터리에서 `vagrant up` 명령을 실행하면 됩니다. Vagrant가 가상머신을 부팅하고 자동으로 공유 폴더와 Nginx 사이트 설정도 함께 완료합니다.

가상머신을 삭제하려면 `vagrant destroy` 명령을 사용할 수 있습니다.

<a name="per-project-installation"></a>
### 프로젝트별 설치

Homestead를 전역(global)으로 설치해서 모든 프로젝트에서 하나의 Homestead 인스턴스를 공유할 수도 있지만, 각 프로젝트별로 Homestead 인스턴스를 따로 사용할 수도 있습니다. 프로젝트 단위로 Homestead를 설치하면, `Vagrantfile`을 프로젝트에 함께 제공할 수 있으므로, 다른 협업자가 프로젝트 저장소를 클론(clone) 받은 뒤 즉시 `vagrant up`으로 동일한 개발 환경을 구축할 수 있습니다.

Composer 패키지 매니저로 프로젝트에 Homestead를 추가할 수 있습니다.

```bash
composer require laravel/homestead --dev
```

설치가 끝나면, Homestead의 `make` 명령어로 프로젝트 전용 `Vagrantfile`과 `Homestead.yaml` 파일을 생성합니다. 두 파일 모두 프로젝트 루트에 생성되며, `make` 명령이 `Homestead.yaml`에서 `sites`와 `folders` 항목도 자동으로 설정해줍니다.

```
// macOS / Linux...
php vendor/bin/homestead make

// Windows...
vendor\\bin\\homestead make
```

이제 터미널에서 `vagrant up`을 실행하고, 브라우저에서 `http://homestead.test`로 프로젝트에 접근하면 됩니다. 자동 [호스트네임 해석](#hostname-resolution) 기능을 사용하지 않는다면, `homestead.test` 혹은 원하는 도메인을 반드시 `/etc/hosts` 파일에 등록해야 정상적으로 접속 가능합니다.

<a name="installing-optional-features"></a>
### 옵션 기능 설치하기

옵션 소프트웨어는 `Homestead.yaml` 파일의 `features` 옵션을 통해 설치할 수 있습니다. 대부분의 기능은 true/false 값으로 활성화 또는 비활성화를 결정하며, 일부 기능은 추가 구성 옵션이 필요합니다.

```
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
    - docker: true
    - elasticsearch:
        version: 7.9.0
    - eventstore: true
        version: 21.2.0
    - gearman: true
    - golang: true
    - grafana: true
    - influxdb: true
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
    - rvm: true
    - solr: true
    - timescaledb: true
    - trader: true
    - webdriver: true
```

<a name="elasticsearch"></a>
#### Elasticsearch

지원되는 Elasticsearch 버전을 정확하게 지정하여 설치할 수 있습니다(예: major.minor.patch 형식). 기본적으로 'homestead'라는 이름의 클러스터가 생성됩니다. Elasticsearch는 OS 메모리의 절반 이상을 할당하면 안 되므로, Homestead 가상머신 메모리는 Elasticsearch에서 필요한 용량의 두 배 이상이 필요합니다.

> [!TIP]
> [Elasticsearch 공식 문서](https://www.elastic.co/guide/en/elasticsearch/reference/current)에서 상세한 설정 방법을 확인할 수 있습니다.

<a name="mariadb"></a>
#### MariaDB

MariaDB 활성화 시 MySQL을 제거하고 MariaDB를 설치합니다. MariaDB는 대체로 MySQL과 호환되므로, 애플리케이션의 데이터베이스 설정에서는 그대로 `mysql` 드라이버를 사용하면 됩니다.

<a name="mongodb"></a>
#### MongoDB

기본 MongoDB 설치의 데이터베이스 사용자명은 `homestead`, 비밀번호는 `secret`으로 설정됩니다.

<a name="neo4j"></a>
#### Neo4j

Neo4j도 기본적으로 사용자명 `homestead`, 비밀번호 `secret`으로 구성됩니다. Neo4j 브라우저를 사용하려면 브라우저에서 `http://homestead.test:7474`로 접속하면 됩니다. 포트 번호는 Bolt(7687), HTTP(7474), HTTPS(7473)가 준비되어 있습니다.

<a name="aliases"></a>
### 별칭(Alias) 관리

Homestead 가상머신에서 bash 별칭을 추가하려면, Homestead 디렉터리의 `aliases` 파일을 수정하면 됩니다.

```
alias c='clear'
alias ..='cd ..'
```

`aliases` 파일을 수정한 후, 반드시 `vagrant reload --provision` 명령으로 가상머신을 다시 프로비저닝해주어야 별칭이 적용됩니다.

<a name="updating-homestead"></a>
## Homestead 업데이트

Homestead를 업데이트하기 전에는, 먼저 현재 사용 중인 가상머신을 반드시 종료 및 삭제해야 합니다. Homestead 디렉터리에서 아래 명령어를 실행하여 삭제합니다.

```
vagrant destroy
```

다음으로 Homestead 소스코드를 업데이트합니다. 저장소를 클론해서 설치했다면, 저장소를 클론했던 위치에서 아래 명령어를 차례로 실행하세요.

```
git fetch

git pull origin release
```

위 명령어는 최신 Homestead 코드를 GitHub 저장소에서 받아와 최신 안정 릴리즈 브랜치를 체크아웃합니다. 최신 안정 버전은 Homestead의 [GitHub 릴리즈 페이지](https://github.com/laravel/homestead/releases)에서 확인할 수 있습니다.

만약 프로젝트의 `composer.json` 파일을 통해 Homestead를 설치했다면, `composer.json`에 `"laravel/homestead": "^12"`가 포함되어 있는지 확인하고 아래처럼 패키지 업데이트를 진행해야 합니다.

```
composer update
```

그 다음, `vagrant box update` 명령으로 Vagrant 박스를 최신 버전으로 갱신합니다.

```
vagrant box update
```

Vagrant 박스를 갱신한 후에는, Homestead 디렉터리에서 `bash init.sh`를 실행하여 추가 설정 파일도 함께 업데이트해야 합니다. 진행 과정에서 기존의 `Homestead.yaml`, `after.sh`, `aliases` 파일을 덮어쓸지 여부를 물어봅니다.

```
// macOS / Linux...
bash init.sh

// Windows...
init.bat
```

마지막으로, 아래 명령어로 Homestead 가상머신을 재생성하여 최신 Vagrant 설정을 적용하세요.

```
vagrant up
```

<a name="daily-usage"></a>
## 일상적인 사용 방법

<a name="connecting-via-ssh"></a>
### SSH로 접속하기

Homestead 디렉터리에서 터미널에 `vagrant ssh` 명령을 입력하여 가상머신에 SSH로 접속할 수 있습니다.

<a name="adding-additional-sites"></a>
### 추가 사이트 등록

Homestead 환경을 실행한 이후에도, 다른 라라벨 프로젝트를 위한 Nginx 사이트를 추가로 등록할 수 있습니다. 하나의 Homestead 환경에서 여러 라라벨 프로젝트를 얼마든지 실행할 수 있으며, 각 사이트는 `Homestead.yaml` 파일에 추가하여 관리합니다.

```
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
    - map: another.test
      to: /home/vagrant/project2/public
```

> [!NOTE]
> 해당 프로젝트 폴더에 대한 [폴더 매핑](#configuring-shared-folders)이 먼저 설정되어 있어야 합니다.

"hosts" 파일을 Vagrant가 자동으로 관리하지 않는 경우, 새로 추가하는 사이트의 주소도 직접 등록해야 할 수 있습니다. macOS 및 Linux에서는 `/etc/hosts`, Windows에서는 `C:\Windows\System32\drivers\etc\hosts` 파일을 사용합니다.

```
192.168.56.56  homestead.test
192.168.56.56  another.test
```

사이트 추가가 끝나면, Homestead 디렉터리에서 `vagrant reload --provision` 명령을 실행하여 변경 내용을 반영해야 합니다.

<a name="site-types"></a>
#### 사이트 타입

Homestead는 다양한 "사이트 타입"을 지원하여, 라라벨 기반이 아닌 다른 프레임워크/프로젝트도 손쉽게 실행할 수 있습니다. 예를 들어 Statamic 애플리케이션을 `statamic` 타입으로 다음과 같이 추가할 수 있습니다.

```yaml
sites:
    - map: statamic.test
      to: /home/vagrant/my-symfony-project/web
      type: "statamic"
```

지원되는 사이트 타입은: `apache`, `apigility`, `expressive`, `laravel`(기본값), `proxy`, `silverstripe`, `statamic`, `symfony2`, `symfony4`, `zf` 등입니다.

<a name="site-parameters"></a>
#### 사이트 파라미터

사이트 설정에서 추가적인 Nginx `fastcgi_param` 값을 지정하고 싶다면, `params` 옵션을 사용할 수 있습니다.

```
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      params:
          - key: FOO
            value: BAR
```

<a name="environment-variables"></a>
### 환경 변수

글로벌 환경 변수는 `Homestead.yaml` 파일에 아래처럼 정의할 수 있습니다.

```
variables:
    - key: APP_ENV
      value: local
    - key: FOO
      value: bar
```

`Homestead.yaml` 파일을 수정한 후에는 반드시 `vagrant reload --provision`을 실행해주어야 합니다. 이로써 설치된 모든 PHP 버전의 PHP-FPM 구성과 `vagrant` 계정의 환경 변수까지 자동으로 갱신됩니다.

<a name="ports"></a>
### 포트 설정

기본적으로, 아래와 같은 포트가 Homestead 환경에 포워딩되어 있습니다.

<div class="content-list" markdown="1">

- **HTTP:** 8000 &rarr; 80으로 포워딩
- **HTTPS:** 44300 &rarr; 443으로 포워딩

</div>

<a name="forwarding-additional-ports"></a>
#### 추가 포트 포워딩

필요하다면, `Homestead.yaml` 파일의 `ports` 항목에 추가로 포트를 포워딩할 수 있습니다. 포트 설정을 바꾼 뒤에는 역시 `vagrant reload --provision` 명령을 실행해야 적용됩니다.

```
ports:
    - send: 50000
      to: 5000
    - send: 7777
      to: 777
      protocol: udp
```

아래는 호스트 머신과 Vagrant 박스 간에 맵핑이 필요한 주요 Homestead 서비스 포트 목록입니다.

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
### PHP 버전 관리

Homestead 6부터는 하나의 가상머신에서 여러 PHP 버전을 동시에 사용할 수 있게 되었습니다. 각 사이트별로 사용할 PHP 버전을 `Homestead.yaml`에서 직접 지정할 수 있습니다. 지원 버전: "5.6", "7.0", "7.1", "7.2", "7.3", "7.4", "8.0"(기본값), "8.1".

```
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      php: "7.1"
```

[Homestead 가상머신 내](#connecting-via-ssh)에서는 CLI에서 아래와 같이 각 PHP 버전으로 Artisan 명령어를 실행할 수 있습니다.

```
php5.6 artisan list
php7.0 artisan list
php7.1 artisan list
php7.2 artisan list
php7.3 artisan list
php7.4 artisan list
php8.0 artisan list
php8.1 artisan list
```

CLI에서 기본 PHP 버전을 바꾸려면 아래 명령 중 하나를 Homestead 가상머신 내에서 실행하면 됩니다.

```
php56
php70
php71
php72
php73
php74
php80
php81
```

<a name="connecting-to-databases"></a>
### 데이터베이스 연결

MySQL과 PostgreSQL 모두 `homestead`라는 이름의 데이터베이스가 기본 생성되어 있습니다. 로컬 머신의 DB 클라이언트에서 MySQL 또는 PostgreSQL에 연결하려면, MySQL의 경우 `127.0.0.1`의 33060 포트, PostgreSQL은 54320 포트로 접속해야 합니다. 사용자명과 비밀번호는 각각 `homestead` / `secret` 입니다.

> [!NOTE]
> 이 포트는 *호스트 머신*에서 데이터베이스에 접속할 때만 사용합니다. Homestead 가상머신 내에서, 즉 라라벨 애플리케이션에서 DB에 접근할 때는 MySQL 3306, PostgreSQL 5432의 기본 포트를 그대로 사용해야 합니다.

<a name="database-backups"></a>
### 데이터베이스 백업

Homestead는 가상머신 삭제 시, 데이터베이스 자동 백업 기능을 지원합니다. 이 기능은 Vagrant 2.1.0 이상 버전에서 사용할 수 있으며, 구버전이라면 `vagrant-triggers` 플러그인을 설치하면 됩니다. 자동 백업을 활성화하려면 아래 설정을 `Homestead.yaml`에 추가하세요.

```
backup: true
```

설정 후, `vagrant destroy` 명령을 실행할 때마다 `mysql_backup` 및 `postgres_backup` 디렉터리에 각 데이터베이스가 백업됩니다. 이 폴더들은 Homestead를 설치한 디렉터리(혹은 [프로젝트별 설치](#per-project-installation)를 했다면 프로젝트 루트)에 생성됩니다.

<a name="configuring-cron-schedules"></a>
### 크론 일정 설정

라라벨은 [크론 작업 예약](/docs/8.x/scheduling)을 매우 간편하게 할 수 있도록, 매 분마다 `schedule:run` 아티즌 명령만 실행하면 됩니다. 이 명령은 `App\Console\Kernel` 클래스에 정의된 예약 작업을 검사하여 실행할 작업이 있으면 실행합니다.

특정 Homestead 사이트에서 `schedule:run` 명령을 매 분마다 실행하려면, 사이트 정의 시 `schedule` 옵션을 `true`로 지정하면 됩니다.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      schedule: true
```

해당 사이트의 크론 작업은 Homestead 가상머신의 `/etc/cron.d` 디렉터리에 정의됩니다.

<a name="configuring-mailhog"></a>
### MailHog 설정

[MailHog](https://github.com/mailhog/MailHog)는 실제 수신자에게 메일을 발송하지 않고, 애플리케이션에서 보내는 메일을 가로채어 확인할 수 있도록 해주는 도구입니다. 다음과 같이 애플리케이션의 `.env` 파일을 수정해서 사용할 수 있습니다.

```
MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

MailHog 설정을 완료하면, 브라우저에서 `http://localhost:8025`로 MailHog 대시보드에 접속할 수 있습니다.

<a name="configuring-minio"></a>
### Minio 설정

[Minio](https://github.com/minio/minio)는 Amazon S3와 호환되는 API를 가진 오픈 소스 객체 저장소 서버입니다. Minio 설치를 위해서는 `Homestead.yaml` 파일의 [features](#installing-optional-features) 항목에 아래와 같이 추가해야 합니다.

```
minio: true
```

Minio는 기본적으로 9600번 포트에서 사용 가능합니다. 브라우저에서 `http://localhost:9600`로 Minio 제어판에 접속할 수 있으며, 기본 access key는 `homestead`, secret key는 `secretkey`입니다. Minio를 사용할 때는 항상 region `us-east-1`을 지정해야 합니다.

Minio를 제대로 사용하려면 애플리케이션의 `config/filesystems.php` 파일에서 S3 디스크 설정을 아래처럼 수정해야 합니다. `use_path_style_endpoint` 옵션을 추가하고, `url` 대신 `endpoint`를 써야 합니다.

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

그리고 `.env` 파일에는 다음 값을 추가해야 합니다.

```bash
AWS_ACCESS_KEY_ID=homestead
AWS_SECRET_ACCESS_KEY=secretkey
AWS_DEFAULT_REGION=us-east-1
AWS_URL=http://localhost:9600
```

Minio 기반의 "S3" 버킷 생성을 위해, `Homestead.yaml` 파일에 `buckets` 항목을 추가하고 버킷 정의를 완료한 뒤 `vagrant reload --provision` 명령을 실행하세요.

```yaml
buckets:
    - name: your-bucket
      policy: public
    - name: your-private-bucket
      policy: none
```

정책(`policy`) 값으로는 `none`, `download`, `upload`, `public`을 사용할 수 있습니다.

<a name="laravel-dusk"></a>
### 라라벨 더스크

[라라벨 더스크](/docs/8.x/dusk) 테스트를 Homestead에서 실행하려면 [`webdriver` 옵션 기능](#installing-optional-features)을 Homestead 설정에서 반드시 활성화해야 합니다.

```yaml
features:
    - webdriver: true
```

`webdriver` 기능을 활성화했다면, `vagrant reload --provision` 명령을 터미널에서 실행해야 합니다.

<a name="sharing-your-environment"></a>
### 환경 공유하기

동료나 클라이언트와 현재 개발 중인 사이트를 임시로 공유하고 싶을 때가 있습니다. Vagrant의 기본 `vagrant share` 명령을 이용할 수 있지만, Homestead에 여러 사이트가 등록된 경우에는 제대로 동작하지 않을 수 있습니다.

이 문제를 해결하기 위해, Homestead는 자체적인 `share` 명령을 제공합니다. 먼저 [Homestead 가상머신에 SSH로 접속](#connecting-via-ssh)한 뒤, 다음 명령을 실행하세요.

```
share homestead.test
```

이 명령어는 `Homestead.yaml` 파일에 등록된 `homestead.test` 사이트(또는 원하는 사이트)를 외부에 공유합니다.

커스텀 region, 서브도메인 등 Ngrok 실행 옵션도 함께 지정할 수 있습니다.

```
share homestead.test -region=eu -subdomain=laravel
```

> [!NOTE]
> 주의: Vagrant 자체는 보안이 강력하지 않으므로, `share` 명령 실행 시 여러분의 가상머신은 인터넷에 노출된다는 사실을 꼭 명심해야 합니다.

<a name="debugging-and-profiling"></a>
## 디버깅 및 프로파일링

<a name="debugging-web-requests"></a>
### Xdebug로 웹 요청 디버깅

Homestead에는 [Xdebug](https://xdebug.org) 기반의 스텝 디버깅 기능이 내장되어 있습니다. 브라우저에서 페이지를 열면, PHP가 IDE로 연결되어 코드 실행 중 값을 점검, 수정할 수 있습니다.

기본적으로 Xdebug는 이미 실행 중이며, 언제든 연결을 대기합니다. CLI에서 Xdebug를 사용하려면, Homestead 가상머신 내에서 `sudo phpenmod xdebug` 명령을 실행하세요. 이후 IDE에서 디버깅을 활성화하면 됩니다. 브라우저 확장이나 [북마클릿](https://www.jetbrains.com/phpstorm/marklets/)을 사용해 Xdebug 트리거도 가능합니다.

> [!NOTE]
> Xdebug가 활성화되면 PHP 실행 속도가 크게 느려질 수 있습니다. 사용을 중지하려면 `sudo phpdismod xdebug` 명령으로 비활성화하고, FPM 서비스를 재시작하세요.

<a name="autostarting-xdebug"></a>
#### Xdebug 자동 시작

웹서버를 통한 통합 테스트(퍼스트널 테스트)에서 디버깅을 좀 더 쉽게 하려면, Xdebug를 자동 시작하도록 설정할 수 있습니다. Homestead 가상머신 내부의 `/etc/php/7.x/fpm/conf.d/20-xdebug.ini` 파일을 수정하여 아래 설정을 추가합니다.

```ini
; Homestead.yaml의 IP 범위가 다르다면 이 값도 변경해야 합니다...
xdebug.remote_host = 192.168.10.1
xdebug.remote_autostart = 1
```

<a name="debugging-cli-applications"></a>
### CLI 애플리케이션 디버깅

PHP CLI 애플리케이션 디버깅은 Homestead 가상머신 내에서 `xphp` 쉘 별칭을 사용해 실행하면 됩니다.

```
xphp /path/to/script
```

<a name="profiling-applications-with-blackfire"></a>
### Blackfire를 이용한 애플리케이션 프로파일링

[Blackfire](https://blackfire.io/docs/introduction)는 웹 요청과 CLI 애플리케이션의 프로파일링을 위한 서비스입니다. 호출 그래프와 타임라인 형태로 프로파일링 데이터를 직관적으로 보여주며, 개발·스테이징·운영 환경을 모두 지원(엔드 유저에게는 오버헤드 없음)합니다. 또한 `php.ini`와 코드 품질, 성능, 보안을 자동으로 점검해줍니다.

[Blackfire Player](https://blackfire.io/docs/player/index)는 웹 크롤링, 웹 테스트, 웹 스크래핑을 위한 오픈소스 도구로, Blackfire와 연동해 시나리오 기반 프로파일링을 할 수 있습니다.

Blackfire를 활성화하려면 Homestead 설정 파일의 `features` 항목에 아래처럼 추가하세요.

```yaml
features:
    - blackfire:
        server_id: "server_id"
        server_token: "server_value"
        client_id: "client_id"
        client_token: "client_value"
```

Blackfire 서버 및 클라이언트 인증 정보는 [Blackfire 계정](https://blackfire.io/signup)이 필요합니다. CLI 도구, 브라우저 확장 등 다양한 방법으로 프로파일링이 가능합니다. 보다 상세한 정보는 [Blackfire 공식 문서](https://blackfire.io/docs/cookbooks/index)를 확인하세요.

<a name="network-interfaces"></a>
## 네트워크 인터페이스

`Homestead.yaml` 파일의 `networks` 항목에서는 Homestead 가상머신의 네트워크 인터페이스를 설정할 수 있습니다. 여러 인터페이스도 자유롭게 구성 가능합니다.

```yaml
networks:
    - type: "private_network"
      ip: "192.168.10.20"
```

[브리징](https://www.vagrantup.com/docs/networking/public_network.html) 인터페이스를 활성화하려면, 네트워크 타입을 `public_network`로 변경하고 `bridge` 값을 설정합니다.

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
```

[DHCP](https://www.vagrantup.com/docs/networking/public_network.html)를 사용하려면, `ip` 항목을 생략하면 됩니다.

```yaml
networks:
    - type: "public_network"
      bridge: "en1: Wi-Fi (AirPort)"
```

<a name="extending-homestead"></a>
## Homestead 확장하기

Homestead는 Homestead 디렉터리 루트에 위치한 `after.sh` 스크립트를 통해 확장할 수 있습니다. 이 파일에는 가상머신을 사용자 맞춤으로 추가 설정하거나, 필요한 쉘 명령을 자유롭게 추가할 수 있습니다.

패키지 설치 등으로 Homestead에서 이미 작성한 설정 파일이 덮어써지는 것을 방지하려면 Homestead에서 아래와 같이 설치 명령어를 사용하는 것이 안전합니다.

```
sudo apt-get -y \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" \
    install package-name
```

<a name="user-customizations"></a>
### 사용자 개별 맞춤화

팀에서 Homestead를 사용할 경우, 각 개발자의 개발 스타일에 맞는 사용자 맞춤 설정을 추가하고 싶을 수 있습니다. 이를 위해 Homestead 디렉터리(=Homestead.yaml이 있는 위치)에 `user-customizations.sh` 파일을 생성해서 원하는 모든 커스텀 설정을 진행할 수 있습니다. 단, 해당 파일은 버전관리에는 포함하지 않는 것이 좋습니다.

<a name="provider-specific-settings"></a>
## 프로바이더별 설정

<a name="provider-specific-virtualbox"></a>
### VirtualBox

<a name="natdnshostresolver"></a>
#### `natdnshostresolver` 설정

기본적으로 Homestead는 `natdnshostresolver` 옵션을 `on`으로 설정하여, 호스트 운영체제의 DNS 정보를 사용할 수 있습니다. 만약 이 값을 직접 제어하고 싶다면, `Homestead.yaml`에 아래처럼 옵션을 추가하면 됩니다.

```yaml
provider: virtualbox
natdnshostresolver: 'off'
```

<a name="symbolic-links-on-windows"></a>
#### Windows에서 심볼릭 링크 문제 해결

Windows 환경에서 심볼릭 링크가 제대로 동작하지 않는다면, `Vagrantfile`에 아래 코드를 추가해야 할 수 있습니다.

```ruby
config.vm.provider "virtualbox" do |v|
    v.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
end
```