# 라라벨 믹스 (Laravel Mix)

- [소개](#introduction)

<a name="introduction"></a>
## 소개

[Laravel Mix](https://github.com/laravel-mix/laravel-mix)는 [Laracasts](https://laracasts.com)의 창립자인 Jeffrey Way가 개발한 패키지로, 라라벨 애플리케이션에서 자주 사용되는 다양한 CSS 및 JavaScript 전처리기를 활용해 [webpack](https://webpack.js.org) 빌드 단계를 정의할 수 있도록 유연한 API를 제공합니다.

즉, Mix를 사용하면 애플리케이션의 CSS와 JavaScript 파일을 손쉽게 컴파일하고, 용량을 줄여 배포할 수 있습니다. 간단한 메서드 체이닝만으로 자산(asset) 파이프라인을 직관적으로 설정할 수 있습니다. 예를 들어 아래와 같이 작성할 수 있습니다.

```js
mix.js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css', 'public/css');
```

webpack이나 자산 컴파일을 처음 접할 때 복잡하고 어렵게 느꼈던 분이라면, Laravel Mix를 반드시 좋아하게 될 것입니다. 물론, 애플리케이션을 개발할 때 Mix를 반드시 사용할 필요는 없습니다. 원하는 다른 자산 파이프라인 도구를 자유롭게 사용할 수도 있고, 아예 사용하지 않아도 무방합니다.

> [!NOTE]
> 최신 라라벨 프로젝트에서는 Vite가 Laravel Mix를 대체하여 기본 제공되고 있습니다. Mix 관련 공식 문서는 [Laravel Mix 공식 웹사이트](https://laravel-mix.com/)에서 확인하실 수 있습니다. Mix에서 Vite로 전환하고 싶으시다면 [Vite 마이그레이션 가이드](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-laravel-mix-to-vite)를 참고하시기 바랍니다.
