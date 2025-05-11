---
sidebar_position: 2
---

# 서비스 컨테이너 (12.x 버전)

## 소개

Laravel 12.x의 서비스 컨테이너는 클래스 의존성을 관리하는 강력한 도구입니다. 의존성 주입은 본질적으로 클래스 의존성이 생성자나 setter 메소드를 통해 "주입"되는 것을 의미합니다.

:::note 버전 정보
이 문서는 Laravel 12.x 버전에 대한 내용입니다.
:::

## 바인딩

Laravel 12.x에서 서비스 컨테이너에 바인딩하는 방법에는 여러 가지가 있습니다.

```php
// 기본 바인딩
$this->app->bind('HelpSpot\API', function ($app) {
    return new \HelpSpot\API($app->make('HttpClient'));
});

// 싱글톤 바인딩
$this->app->singleton('HelpSpot\API', function ($app) {
    return new \HelpSpot\API($app->make('HttpClient'));
});

// 12.x에서 추가된 새로운 바인딩 방법
$this->app->scoped('HelpSpot\API', function ($app) {
    return new \HelpSpot\API($app->make('HttpClient'));
});
```

## 의존성 해결

```php
// 12.x에서는 생성자 프로퍼티 프로모션 기능 지원
public function __construct(
    private readonly UserRepository $users,
    private readonly Logger $logger,
) {}
```

## 12.x에서의 변경 사항

Laravel 12.x에서는 서비스 컨테이너에 다음과 같은 새로운 기능이 추가되었습니다:

- 더 효율적인 의존성 해결 알고리즘
- 개선된 컨테이너 이벤트 시스템
- 타입 힌팅을 활용한 더 정확한 의존성 주입
- 새로운 스코프드 서비스 등록 방식

추후 더 자세한 내용이 추가될 예정입니다.
