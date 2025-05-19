# 라라벨 믹스 (Laravel Mix)

- [소개](#introduction)

<a name="introduction"></a>
## 소개

[Laravel Mix](https://github.com/laravel-mix/laravel-mix)는 [Laracasts](https://laracasts.com)의 제작자인 Jeffrey Way가 개발한 패키지로, 라라벨 애플리케이션에서 여러 가지 일반적인 CSS 및 JavaScript 전처리기를 사용해 [webpack](https://webpack.js.org) 빌드 단계를 정의할 수 있는 직관적인 API를 제공합니다.

즉, Mix를 사용하면 애플리케이션의 CSS와 JavaScript 파일을 컴파일하고, 압축하는 작업을 매우 쉽게 처리할 수 있습니다. 메서드를 체이닝 형식으로 연결해 자산 빌드 파이프라인을 직관적으로 정의할 수 있습니다. 예를 들어:

```js
mix.js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css', 'public/css');
```

만약 webpack이나 자산(asset) 컴파일 도구를 처음 접하거나 사용법이 복잡해 막막했던 경험이 있다면, Laravel Mix는 아주 도움이 될 것입니다. 하지만 Mix를 꼭 사용해야 하는 것은 아니며, 애플리케이션 개발 시 원하는 다른 자산 빌드 도구를 자유롭게 사용하거나 아예 사용하지 않아도 무방합니다.

> [!NOTE]
> 최근 라라벨 신규 설치에서는 Vite가 Laravel Mix를 대체하였습니다. Mix 관련 공식 문서는 [공식 Laravel Mix](https://laravel-mix.com/) 웹사이트에서 확인할 수 있습니다. Vite로 전환하고 싶다면 [Vite 마이그레이션 가이드](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-laravel-mix-to-vite)를 참고하시길 바랍니다.
