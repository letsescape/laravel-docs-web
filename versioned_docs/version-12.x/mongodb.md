# 몽고DB (MongoDB)

- [소개](#introduction)
- [설치](#installation)
    - [MongoDB 드라이버](#mongodb-driver)
    - [MongoDB 서버 시작하기](#starting-a-mongodb-server)
    - [Laravel MongoDB 패키지 설치](#install-the-laravel-mongodb-package)
- [설정](#configuration)
- [기능](#features)

<a name="introduction"></a>
## 소개

[MongoDB](https://www.mongodb.com/resources/products/fundamentals/why-use-mongodb)는 가장 널리 사용되는 NoSQL 문서 지향 데이터베이스 중 하나로, 높은 쓰기 부하(분석 작업이나 IoT에 유용)와 높은 가용성(자동 장애 조치가 가능한 복제 세트를 쉽게 설정)에서 강점을 가집니다. 또한 데이터베이스를 수평적으로 쉽게 샤딩할 수 있어 확장성이 우수하며, 집계, 텍스트 검색, 지리 공간 쿼리 등을 위한 강력한 쿼리 언어를 제공합니다.

MongoDB는 SQL 데이터베이스처럼 행과 열로 구성된 테이블 형식이 아니라, 각 레코드가 BSON이라는 이진 표현으로 기술된 문서(document)로 저장됩니다. 애플리케이션에서는 이를 JSON 형식으로 받아올 수 있습니다. 문서, 배열, 중첩 문서, 바이너리 데이터 등 매우 다양한 데이터 타입을 지원합니다.

라라벨에서 MongoDB를 사용하기 전에 Composer를 통해 `mongodb/laravel-mongodb` 패키지 설치 및 사용을 권장합니다. `laravel-mongodb` 패키지는 MongoDB에서 공식적으로 관리하며, PHP에서 MongoDB 드라이버를 통해 기본적으로 지원되지만 [Laravel MongoDB](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/) 패키지는 Eloquent나 라라벨의 다른 기능들과의 더 풍부한 통합을 제공합니다.

```shell
composer require mongodb/laravel-mongodb
```

<a name="installation"></a>
## 설치

<a name="mongodb-driver"></a>
### MongoDB 드라이버

MongoDB 데이터베이스에 연결하려면 `mongodb` PHP 확장(extension)이 필요합니다. [Laravel Herd](https://herd.laravel.com)를 사용하거나 `php.new`를 통해 PHP를 설치했다면 이미 이 확장이 시스템에 설치되어 있을 가능성이 높습니다. 하지만 수동으로 이 확장을 설치해야 하는 경우에는 PECL을 통해 아래와 같이 설치할 수 있습니다.

```shell
pecl install mongodb
```

MongoDB PHP 확장 설치에 대한 더 자세한 내용은 [MongoDB PHP 확장 설치 안내](https://www.php.net/manual/en/mongodb.installation.php)를 참고하시기 바랍니다.

<a name="starting-a-mongodb-server"></a>
### MongoDB 서버 시작하기

MongoDB Community Server를 사용하면 Windows, macOS, Linux에서 또는 Docker 컨테이너로 로컬에 MongoDB를 실행할 수 있습니다. MongoDB 설치 방법은 [공식 MongoDB Community 설치 가이드](https://docs.mongodb.com/manual/administration/install-community/)를 참고하세요.

MongoDB 서버의 연결 문자열(connection string)은 `.env` 파일에 아래와 같이 설정할 수 있습니다.

```ini
MONGODB_URI="mongodb://localhost:27017"
MONGODB_DATABASE="laravel_app"
```

클라우드 환경에서 MongoDB를 호스팅하려면 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)를 사용하는 것도 고려해볼 수 있습니다.
애플리케이션에서 로컬에서 MongoDB Atlas 클러스터에 접근하려면, [클러스터의 네트워크 설정에서 자신의 IP 주소를 IP 접근 허용 목록에 추가](https://www.mongodb.com/docs/atlas/security/add-ip-address-to-list/)해야 합니다.

MongoDB Atlas의 연결 문자열 역시 `.env` 파일에 다음과 같이 설정할 수 있습니다.

```ini
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority"
MONGODB_DATABASE="laravel_app"
```

<a name="install-the-laravel-mongodb-package"></a>
### Laravel MongoDB 패키지 설치

마지막으로 Composer를 이용해 Laravel MongoDB 패키지를 설치합니다.

```shell
composer require mongodb/laravel-mongodb
```

> [!NOTE]
> 이 패키지를 설치하려면 반드시 `mongodb` PHP 확장이 설치되어 있어야 합니다. CLI와 웹 서버의 PHP 설정이 다를 수 있으므로, 두 환경 모두에서 해당 확장이 활성화되어 있는지 반드시 확인하세요.

<a name="configuration"></a>
## 설정

애플리케이션의 `config/database.php` 설정 파일에서 MongoDB 연결을 구성할 수 있습니다. 이 파일에서 `mongodb` 드라이버를 사용하는 연결을 추가하면 됩니다.

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
## 기능

설정이 완료되면 애플리케이션에서 `mongodb` 패키지와 데이터베이스 연결을 활용하여 다양한 강력한 기능을 사용할 수 있습니다.

- [Eloquent 사용](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/eloquent-models/): 모델을 MongoDB 컬렉션에 저장할 수 있으며, 표준 Eloquent 기능 외에도 내장 연관관계(embedded relationships)와 같은 추가 기능을 제공합니다. 패키지를 통해 MongoDB 드라이버에 직접 접근할 수 있어, 원본 쿼리나 집계 파이프라인과 같은 다양한 작업도 실행할 수 있습니다.
- [복잡한 쿼리](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/query-builder/)를 쿼리 빌더로 작성할 수 있습니다.
- `mongodb` [캐시 드라이버](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/cache/)는 TTL 인덱스 등 MongoDB의 기능을 활용하여 만료된 캐시 항목을 자동으로 정리할 수 있도록 최적화되어 있습니다.
- `mongodb` 큐 드라이버로 [큐잉된 작업을 디스패치하고 처리](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/queues/)할 수 있습니다.
- [GridFS에 파일 저장](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/filesystems/): [Flysystem의 GridFS 어댑터](https://flysystem.thephpleague.com/docs/adapter/gridfs/)를 이용해 파일 시스템에 파일을 저장할 수 있습니다.
- 데이터베이스 연결이나 Eloquent를 사용하는 대부분의 서드파티 패키지들도 MongoDB와 함께 사용할 수 있습니다.

MongoDB와 라라벨의 연동 사용법에 대해 자세히 알고 싶다면 MongoDB의 [퀵 스타트 가이드](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/quick-start/)를 참고하시기 바랍니다.