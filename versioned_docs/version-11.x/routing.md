---
sidebar_position: 1
---

# 라우팅 (11.x 버전)

## 기본 라우팅

Laravel 11.x에서 가장 기본적인 라우트는 URI와 클로저를 허용하여 매우 간단한 방법으로 경로를 정의할 수 있습니다:

:::note 버전 정보
이 문서는 Laravel 11.x 버전에 대한 내용입니다.
:::

```php
Route::get('/greeting', function () {
    return 'Hello World';
});
```

## 사용 가능한 라우터 메소드

Laravel 11.x 라우터는 다음 HTTP 메소드에 대응하는 라우트를 등록할 수 있습니다:

```php
Route::get($uri, $callback);
Route::post($uri, $callback);
Route::put($uri, $callback);
Route::patch($uri, $callback);
Route::delete($uri, $callback);
Route::options($uri, $callback);
```

## 라우트 파라미터

```php
Route::get('/user/{id}', function ($id) {
    return 'User '.$id;
});
```

## 11.x에서의 변경 사항

Laravel 11.x에서는 라우팅 시스템이 개선되어 더 빠른 라우트 매칭과 새로운 라우트 그룹 기능을 제공합니다.

```php
// 11.x에서 추가된 새로운 라우트 그룹 문법
Route::prefix('admin')->group(function () {
    Route::get('/dashboard', function () {
        // /admin/dashboard에 대한 처리
    });
});
```

추후 더 자세한 내용이 추가될 예정입니다.
