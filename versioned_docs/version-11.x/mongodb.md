# 몽고DB (MongoDB)

- [소개](#introduction)
- [설치](#installation)
    - [MongoDB 드라이버](#mongodb-driver)
    - [MongoDB 서버 시작하기](#starting-a-mongodb-server)
    - [Laravel MongoDB 패키지 설치](#install-the-laravel-mongodb-package)
- [설정](#configuration)
- [주요 기능](#features)

<a name="introduction"></a>
## 소개

[MongoDB](https://www.mongodb.com/resources/products/fundamentals/why-use-mongodb)는 가장 널리 사용되는 NoSQL 문서 지향 데이터베이스 중 하나입니다. 주로 높은 쓰기 부하(분석이나 IoT에 유용) 처리와 높은 가용성(자동 장애 조치 기능이 있는 복제 세트 설정이 쉬움)을 위해 사용됩니다. 또한 데이터베이스 샤딩을 간단히 설정해 수평 확장성과 뛰어난 확장성을 제공하며, 집계, 텍스트 검색, 지리적 쿼리 등 다양한 용도의 강력한 쿼리 언어도 지원합니다.

MongoDB는 SQL 데이터베이스처럼 행(row)과 열(column)로 구성된 테이블에 데이터를 저장하는 대신, 각 레코드를 BSON이라는 이진 형식으로 표현된 문서(document)로 저장합니다. 애플리케이션에서는 이 정보를 JSON 형식으로 조회할 수 있습니다. 문서, 배열, 중첩(임베디드) 문서, 이진 데이터 등 다양한 데이터 타입을 지원합니다.

라라벨에서 MongoDB를 사용하려면 Composer를 통해 `mongodb/laravel-mongodb` 패키지 설치 및 사용을 권장합니다. `laravel-mongodb` 패키지는 MongoDB에서 공식적으로 관리하며, PHP가 기본적으로 MongoDB 드라이버를 지원하긴 하지만, [Laravel MongoDB](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/) 패키지는 Eloquent 및 다양한 라라벨 기능과의 통합을 더욱 풍부하게 제공합니다:

```shell
composer require mongodb/laravel-mongodb
```

<a name="installation"></a>
## 설치

<a name="mongodb-driver"></a>
### MongoDB 드라이버

MongoDB 데이터베이스와 연결하려면 `mongodb` PHP 확장이 필요합니다. [Laravel Herd](https://herd.laravel.com)를 사용하거나, `php.new`를 통해 PHP를 설치한 경우 이 확장이 이미 설치되어 있을 수 있습니다. 만약 직접 확장을 설치해야 한다면, PECL을 통해 손쉽게 설치할 수 있습니다:

```shell
pecl install mongodb
```

MongoDB PHP 확장 설치에 대한 더 자세한 정보는 [MongoDB PHP 확장 설치 가이드](https://www.php.net/manual/en/mongodb.installation.php)를 참고하시기 바랍니다.

<a name="starting-a-mongodb-server"></a>
### MongoDB 서버 시작하기

MongoDB Community Server는 로컬에서 MongoDB를 실행할 때 사용할 수 있으며, Windows, macOS, Linux 등 다양한 플랫폼이나 Docker 컨테이너로도 설치가 가능합니다. 설치 방법에 대해서는 [공식 MongoDB Community 설치 가이드](https://docs.mongodb.com/manual/administration/install-community/)를 참고하시기 바랍니다.

MongoDB 서버 연결 문자열은 프로젝트의 `.env` 파일에서 설정할 수 있습니다:

```ini
MONGODB_URI="mongodb://localhost:27017"
MONGODB_DATABASE="laravel_app"
```

클라우드 환경에서 MongoDB를 사용하려는 경우 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 서비스를 고려해볼 수 있습니다.
애플리케이션에서 MongoDB Atlas 클러스터에 로컬 환경에서 접근하려면, 먼저 [클러스터의 네트워크 설정에 자신의 IP 주소를 추가](https://www.mongodb.com/docs/atlas/security/add-ip-address-to-list/)해야 합니다.

MongoDB Atlas의 연결 문자열도 `.env` 파일에서 설정할 수 있습니다:

```ini
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority"
MONGODB_DATABASE="laravel_app"
```

<a name="install-the-laravel-mongodb-package"></a>
### Laravel MongoDB 패키지 설치

마지막으로 Composer를 사용해 Laravel MongoDB 패키지를 설치합니다:

```shell
composer require mongodb/laravel-mongodb
```

> [!NOTE]  
> `mongodb` PHP 확장이 설치되어 있지 않으면 이 패키지 설치가 실패합니다. PHP 설정은 CLI와 웹 서버 환경 간에 다를 수 있으니, 두 환경 모두에서 확장이 활성화되어 있는지 반드시 확인해야 합니다.

<a name="configuration"></a>
## 설정

애플리케이션의 `config/database.php` 설정 파일을 통해 MongoDB 연결을 구성할 수 있습니다. 이 파일에서, `mongodb` 드라이버를 사용하는 `mongodb` 연결을 추가해 주세요:

```php
'connections' => [
    'mongodb' => [
        'driver' => 'mongodb',
        'dsn' => env('MONGODB_URI', 'mongodb://localhost:27017'),
        'database' => env('MONGODB_DATABASE', 'laravel_app'),
    ],
],
```

<a name="features"></a>
## 주요 기능

설정이 완료되면, 애플리케이션에서 `mongodb` 패키지 및 데이터베이스 연결을 활용해 다양한 강력한 기능을 사용할 수 있습니다.

- [Eloquent 사용](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/eloquent-models/) 시, 모델을 MongoDB 컬렉션에 저장할 수 있습니다. 기본 Eloquent의 기능 외에도, Laravel MongoDB 패키지는 임베디드(embedded) 관계 등 추가적인 기능을 제공하며, MongoDB 드라이버에 직접 접근해 원시 쿼리나 집계 파이프라인 같은 작업도 수행할 수 있습니다.
- 쿼리 빌더를 사용하여 [복잡한 쿼리 작성](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/query-builder/)이 가능합니다.
- `mongodb` [캐시 드라이버](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/cache/)는 만료된 캐시 항목을 자동으로 삭제하는 TTL 인덱스 등 MongoDB의 기능을 적극적으로 활용하도록 최적화되어 있습니다.
- `mongodb` 큐 드라이버로 [큐잉된 작업을 디스패치하고 처리](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/queues/)할 수 있습니다.
- [GridFS 어댑터 for Flysystem](https://flysystem.thephpleague.com/docs/adapter/gridfs/)를 이용해 [GridFS에 파일 저장](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/gridfs/)이 가능합니다.
- 데이터베이스 연결이나 Eloquent를 사용하는 대부분의 서드파티 패키지를 MongoDB와 함께 사용할 수 있습니다.

MongoDB 및 라라벨 연동법을 계속 학습하려면, MongoDB의 [빠른 시작 가이드(Quick Start guide)](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/quick-start/)를 참고하세요.