# 에셋 컴파일, Mix (Compiling Assets (Mix))

- [소개](#introduction)
- [설치 및 설정](#installation)
- [Mix 실행하기](#running-mix)
- [스타일시트 작업하기](#working-with-stylesheets)
    - [Tailwind CSS](#tailwindcss)
    - [PostCSS](#postcss)
    - [Sass](#sass)
    - [URL 처리](#url-processing)
    - [소스 맵](#css-source-maps)
- [JavaScript 작업하기](#working-with-scripts)
    - [Vue](#vue)
    - [React](#react)
    - [벤더 추출](#vendor-extraction)
    - [커스텀 Webpack 구성](#custom-webpack-configuration)
- [버전 관리 / 캐시 무효화](#versioning-and-cache-busting)
- [Browsersync 리로딩](#browsersync-reloading)
- [환경 변수](#environment-variables)
- [알림](#notifications)

<a name="introduction"></a>
## 소개

[Laravel Mix](https://github.com/JeffreyWay/laravel-mix)는 [Laracasts](https://laracasts.com)의 창립자인 Jeffrey Way가 개발한 패키지로, Laravel 애플리케이션을 위한 [webpack](https://webpack.js.org) 빌드 작업을 여러 가지 대표적인 CSS 및 JavaScript 전처리기를 사용하여 쉽게 정의할 수 있도록 유연한 API를 제공합니다.

즉, Mix를 활용하면 애플리케이션의 CSS와 JavaScript 파일을 쉽고 빠르게 컴파일하고, 최소화할 수 있습니다. 단순한 메서드 체이닝 방식으로 자산 빌드 파이프라인을 명확하게 정의할 수 있습니다. 예를 들어:

```
mix.js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css', 'public/css');
```

만약 webpack과 에셋 컴파일 환경을 처음 시작할 때 막막하거나 어렵게 느껴지셨다면, Laravel Mix를 정말 반길 것입니다. 다만, Mix 사용은 필수가 아니며, 개발 시 본인에게 맞는 어떤 에셋 파이프라인 도구든 자유롭게 사용할 수 있습니다. 혹은 아예 아무런 빌드 툴도 쓰지 않아도 됩니다.

> [!TIP]
> Laravel과 [Tailwind CSS](https://tailwindcss.com)로 애플리케이션을 빠르게 시작하고 싶다면, [애플리케이션 스타터 키트](/docs/8.x/starter-kits)를 참고해 보시기 바랍니다.

<a name="installation"></a>
## 설치 및 설정

<a name="installing-node"></a>
#### Node 설치하기

Mix를 실행하기 전에 먼저, Node.js와 NPM이 시스템에 설치되어 있어야 합니다:

```
node -v
npm -v
```

가장 간단하게는 [공식 Node 웹사이트](https://nodejs.org/en/download/)에서 그래픽 설치 프로그램을 받아 최신 버전의 Node와 NPM을 설치할 수 있습니다. 또는 [Laravel Sail](/docs/8.x/sail)을 사용하는 경우 Sail을 통해 Node와 NPM에 접근할 수도 있습니다:

```
./sail node -v
./sail npm -v
```

<a name="installing-laravel-mix"></a>
#### Laravel Mix 설치하기

이제 남은 작업은 Laravel Mix를 설치하는 것뿐입니다. Laravel을 새로 설치하면, 디렉터리 구조의 루트에 이미 `package.json` 파일이 포함되어 있습니다. 기본 `package.json`엔 Laravel Mix를 사용하기 위한 모든 의존성이 미리 포함되어 있습니다. 이 파일은 마치 `composer.json`과 비슷하게, PHP 의존성 대신 Node 의존성을 정의합니다. 다음 명령어로 의존성 설치를 시작할 수 있습니다:

```
npm install
```

<a name="running-mix"></a>
## Mix 실행하기

Mix는 [webpack](https://webpack.js.org) 위에서 작동하는 구성 레이어이므로, 기본 Laravel `package.json`에 포함된 NPM 스크립트 중 하나만 실행하면 Mix 태스크를 바로 사용할 수 있습니다. `dev` 또는 `production` 스크립트를 실행하면, 모든 CSS와 JavaScript 에셋이 컴파일되어 애플리케이션의 `public` 디렉터리에 저장됩니다:

```
// 모든 Mix 태스크 실행...
npm run dev

// 모든 Mix 태스크를 실행하고 결과를 최소화...
npm run prod
```

<a name="watching-assets-for-changes"></a>
#### 에셋 변경사항 감시하기

`npm run watch` 명령어는 터미널에서 계속 실행되며, 관련된 CSS와 JavaScript 파일의 변경사항을 모니터링합니다. webpack이 이 파일들 중 하나가 변경되는 것을 감지하면 에셋을 자동으로 다시 컴파일합니다:

```
npm run watch
```

특정 로컬 개발 환경에서는 webpack이 파일 변경을 감지하지 못할 수도 있습니다. 이 경우에는 `watch-poll` 명령어를 사용하는 것을 고려해 보십시오:

```
npm run watch-poll
```

<a name="working-with-stylesheets"></a>
## 스타일시트 작업하기

애플리케이션의 `webpack.mix.js` 파일이 바로 에셋 컴파일의 진입점입니다. 이 파일은 [webpack](https://webpack.js.org)을 가볍게 감싼 설정 파일로 생각하시면 됩니다. Mix 태스크들은 메서드 체이닝 방식으로 연결할 수 있어, 에셋을 어떻게 컴파일할지 명확하게 정의할 수 있습니다.

<a name="tailwindcss"></a>
### Tailwind CSS

[Tailwind CSS](https://tailwindcss.com)는 현대적인 유틸리티 우선 프레임워크로, HTML에서 한눈에 볼 수 있는 멋진 웹사이트를 쉽게 만들 수 있습니다. Laravel 프로젝트에서 Laravel Mix와 함께 Tailwind를 사용하는 시작 방법을 알아보겠습니다. 먼저 NPM을 사용해 Tailwind를 설치하고, Tailwind 설정 파일을 생성해야 합니다:

```
npm install

npm install -D tailwindcss

npx tailwindcss init
```

`init` 명령어를 실행하면 `tailwind.config.js` 파일이 생성됩니다. 이 파일의 `content` 섹션에서 HTML 템플릿, JavaScript 컴포넌트 등 Tailwind 클래스명이 포함된 모든 소스 파일의 경로를 설정할 수 있습니다. 이를 바탕으로 실제로 사용하지 않는 CSS 클래스는 프로덕션 빌드에서 제거됩니다:

```js
content: [
    './storage/framework/views/*.php',
    './resources/**/*.blade.php',
    './resources/**/*.js',
    './resources/**/*.vue',
],
```

이제 Tailwind의 각 "레이어"를 애플리케이션의 `resources/css/app.css` 파일에 추가해 주세요:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

레이어 추가가 완료되면, 이제 `webpack.mix.js`를 수정해 Tailwind가 적용된 CSS를 컴파일할 수 있습니다:

```js
mix.js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css', 'public/css', [
        require('tailwindcss'),
    ]);
```

마지막으로, 반드시 애플리케이션의 주요 레이아웃 템플릿(예: `resources/views/layouts/app.blade.php`)에서 이 스타일시트를 참조해야 합니다. 또한, 반응형 뷰포트(`meta` 태그)가 아직 없다면 추가하는 것도 잊지 마십시오:

```html
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="/css/app.css" rel="stylesheet">
</head>
```

<a name="postcss"></a>
### PostCSS

[PostCSS](https://postcss.org/)는 CSS를 변환하기 위한 강력한 도구로, Laravel Mix에는 기본적으로 포함되어 있습니다. Mix는 대표적인 [Autoprefixer](https://github.com/postcss/autoprefixer) 플러그인을 사용해 필요한 CSS3 벤더 프리픽스를 자동으로 적용합니다. 필요하다면, 프로젝트에 맞는 어떤 추가 플러그인이든 자유롭게 사용할 수 있습니다.

필요한 플러그인을 NPM으로 설치하고, Mix의 `postCss` 메서드를 호출할 때 해당 플러그인을 plugins 배열에 포함해 주세요. `postCss`의 첫 번째 인수는 CSS 파일 경로이며, 두 번째 인수는 컴파일된 파일이 생성될 디렉터리입니다:

```
mix.postCss('resources/css/app.css', 'public/css', [
    require('postcss-custom-properties')
]);
```

혹은, 추가 플러그인 없이 간단히 CSS를 컴파일하고 최소화 목적만 있다면 다음과 같이 작성할 수 있습니다:

```
mix.postCss('resources/css/app.css', 'public/css');
```

<a name="sass"></a>
### Sass

`sass` 메서드를 이용하면 [Sass](https://sass-lang.com/) 파일을 웹 브라우저가 인식 가능한 CSS로 컴파일할 수 있습니다. `sass` 메서드의 첫 번째 인수는 Sass 파일 경로이고, 두 번째 인수는 컴파일된 CSS 파일이 기록될 디렉터리입니다:

```
mix.sass('resources/sass/app.scss', 'public/css');
```

여러 개의 Sass 파일을 각각의 CSS 파일로 컴파일하거나, 결과 CSS의 출력 폴더를 직접 지정할 수도 있습니다. 이때는 `sass` 메서드를 여러 번 호출하면 됩니다:

```
mix.sass('resources/sass/app.sass', 'public/css')
    .sass('resources/sass/admin.sass', 'public/css/admin');
```

<a name="url-processing"></a>
### URL 처리

Laravel Mix는 webpack 위에서 동작하므로, 몇 가지 webpack의 개념을 이해하면 좋습니다. CSS 컴파일 과정에서 webpack은 스타일시트 내의 모든 `url()` 호출을 자동으로 재작성하고 최적화합니다. 이 기능은 약간 낯설게 느껴질 수 있지만, 실제로 매우 강력합니다. 예를 들어, Sass에 상대 경로로 이미지를 추가한다고 가정해봅니다:

```
.example {
    background: url('../images/example.png');
}
```

> [!NOTE]
> 절대경로로 지정된 `url()`은 URL 재작성 대상에서 제외됩니다. 예를 들어, `url('/images/thing.png')` 또는 `url('http://example.com/images/thing.png')`와 같은 형태는 수정되지 않습니다.

기본적으로 Laravel Mix와 webpack은 `example.png` 파일을 찾아 `public/images` 폴더로 복사한 다음, 생성된 스타일시트 내에서 `url()` 경로도 알맞게 재작성합니다. 예를 들어, 결과 CSS는 다음과 같이 나타납니다:

```
.example {
    background: url(/images/example.png?d41d8cd98f00b204e9800998ecf8427e);
}
```

이 기능이 편리할 수도 있지만, 이미 파일 폴더 구조가 알맞게 되어 있는 경우에는 불필요하게 느껴질 수 있습니다. 이럴 때는 아래와 같이 `url()` 재작성을 비활성화할 수 있습니다:

```
mix.sass('resources/sass/app.scss', 'public/css').options({
    processCssUrls: false
});
```

이렇게 `webpack.mix.js`에 옵션을 추가하면 Mix는 더 이상 `url()`을 매칭하거나 에셋을 public 디렉터리로 복사하지 않습니다. 즉, 컴파일된 CSS는 본래 입력한 대로 남아 있게 됩니다:

```
.example {
    background: url("../images/thing.png");
}
```

<a name="css-source-maps"></a>
### 소스 맵

기본적으로 비활성화되어 있지만, `webpack.mix.js`에서 `mix.sourceMaps()` 메서드를 호출하면 소스 맵을 활성화할 수 있습니다. 소스 맵이 켜지면 빌드 및 성능에 약간의 비용이 들 수 있지만, 컴파일된 에셋을 브라우저 개발자 도구에서 디버깅하기 매우 편리해집니다:

```
mix.js('resources/js/app.js', 'public/js')
    .sourceMaps();
```

<a name="style-of-source-mapping"></a>
#### 소스 맵 스타일 설정

Webpack은 다양한 [소스 맵 스타일](https://webpack.js.org/configuration/devtool/#devtool)을 지원합니다. 기본적으로 Mix는 `eval-source-map` 스타일을 사용해 빠른 재빌드를 제공합니다. 만약 소스 맵 스타일을 변경하고 싶다면, `sourceMaps` 메서드로 지정할 수 있습니다:

```
let productionSourceMaps = false;

mix.js('resources/js/app.js', 'public/js')
    .sourceMaps(productionSourceMaps, 'source-map');
```

<a name="working-with-scripts"></a>
## JavaScript 작업하기

Mix는 최신 ECMAScript 문법 지원, 모듈 번들링, 최소화, 순수 JavaScript 파일 병합 등 다양한 기능을 제공합니다. 이러한 기능들은 별도의 복잡한 설정 없이도 자연스럽게 동작합니다:

```
mix.js('resources/js/app.js', 'public/js');
```

단 한 줄의 코드만으로도, 아래의 이점을 누릴 수 있습니다:

<div class="content-list" markdown="1">

- 최신 EcmaScript 문법 지원
- 모듈 사용
- 프로덕션 환경에서의 자바스크립트 코드 최소화

</div>

<a name="vue"></a>
### Vue

`vue` 메서드를 사용할 경우, Mix는 Vue 싱글 파일 컴포넌트 컴파일을 위해 필요한 Babel 플러그인들을 자동으로 설치해줍니다. 별다른 추가 설정은 필요하지 않습니다:

```
mix.js('resources/js/app.js', 'public/js')
   .vue();
```

JavaScript가 컴파일된 후에는 다음과 같이 애플리케이션에서 해당 파일을 참조할 수 있습니다:

```html
<head>
    <!-- ... -->

    <script src="/js/app.js"></script>
</head>
```

<a name="react"></a>
### React

Mix는 React 지원을 위한 Babel 플러그인도 자동으로 설치해줍니다. 시작하려면 `react` 메서드를 추가로 호출해 주세요:

```
mix.js('resources/js/app.jsx', 'public/js')
   .react();
```

이렇게 하면 내부적으로 Mix가 필요한 `babel-preset-react` Babel 플러그인을 다운로드하여 포함합니다. 컴파일이 끝난 뒤에는 다음과 같이 애플리케이션에서 해당 스크립트를 참조할 수 있습니다:

```html
<head>
    <!-- ... -->

    <script src="/js/app.js"></script>
</head>
```

<a name="vendor-extraction"></a>
### 벤더 추출

React, Vue와 같은 벤더 라이브러리를 애플리케이션의 모든 JavaScript와 함께 하나의 파일로 번들링할 경우, 장기 캐싱이 어렵다는 단점이 있습니다. 예를 들어, 애플리케이션 코드가 약간만 변경되어도 브라우저는 벤더 라이브러리 전체를 다시 다운로드해야 할 수 있습니다.

자주 JavaScript 코드를 업데이트할 예정이라면, 벤더 라이브러리를 별도의 파일로 분리하는 것이 좋습니다. 이렇게 하면 애플리케이션 코드가 바뀌더라도 용량이 큰 `vendor.js`는 캐시로 남게 됩니다. Mix의 `extract` 메서드를 사용하면 이 작업을 쉽게 할 수 있습니다:

```
mix.js('resources/js/app.js', 'public/js')
    .extract(['vue'])
```

`extract` 메서드는 벤더 파일로 분리하고 싶은 모든 라이브러리 또는 모듈의 배열을 인수로 받습니다. 위 예시 코드를 기준으로 Mix는 다음과 같은 파일들을 생성합니다:

<div class="content-list" markdown="1">

- `public/js/manifest.js`: *Webpack 매니페스트 런타임*
- `public/js/vendor.js`: *벤더 라이브러리*
- `public/js/app.js`: *애플리케이션 코드*

</div>

JavaScript 오류를 방지하려면 반드시 아래와 같이 파일들을 올바른 순서로 불러와야 합니다:

```
<script src="/js/manifest.js"></script>
<script src="/js/vendor.js"></script>
<script src="/js/app.js"></script>
```

<a name="custom-webpack-configuration"></a>
### 커스텀 Webpack 구성

때로는 직접 Webpack의 하위 설정을 수정해야 할 수도 있습니다. 예를 들어, 커스텀 로더나 플러그인을 추가해야 할 때가 있습니다.

Mix는 `webpackConfig` 메서드를 제공해, 간단한 Webpack 설정을 덮어쓸 수 있게 해줍니다. 이 방식은 별도의 `webpack.config.js` 파일을 복사·유지할 필요 없이 추가적인 설정만 병합할 수 있어서 매우 편리합니다. `webpackConfig`는 객체를 인수로 받아 [Webpack 전용 설정](https://webpack.js.org/configuration/)을 직접 지정할 수 있습니다.

```
mix.webpackConfig({
    resolve: {
        modules: [
            path.resolve(__dirname, 'vendor/laravel/spark/resources/assets/js')
        ]
    }
});
```

<a name="versioning-and-cache-busting"></a>
## 버전 관리 / 캐시 무효화

많은 개발자들은 브라우저가 이전 상태의 에셋을 캐시에 저장하지 않고 항상 최신 에셋을 불러오도록, 컴파일된 파일 이름에 타임스탬프나 고유 토큰을 추가하는 방식을 사용합니다. Mix의 `version` 메서드를 사용하면 이를 자동으로 처리해줍니다.

`version` 메서드는 컴파일된 모든 파일 이름 끝에 고유 해시를 추가하여, 캐시 무효화가 훨씬 쉬워집니다:

```
mix.js('resources/js/app.js', 'public/js')
    .version();
```

이 과정에서 해시가 포함된 실제 파일 이름을 알기 어렵기 때문에, [view](/docs/8.x/views) 내에서 글로벌 `mix` 함수를 사용해 적절한 파일명을 동적으로 로드해야 합니다. `mix` 함수는 해시가 적용된 현재 파일명을 자동으로 찾아줍니다:

```
<script src="{{ mix('/js/app.js') }}"></script>
```

대부분 개발 환경에서는 버전 관리가 필요 없으므로, 버전 관리를 `npm run prod` 시에만 실행하도록 설정할 수 있습니다:

```
mix.js('resources/js/app.js', 'public/js');

if (mix.inProduction()) {
    mix.version();
}
```

<a name="custom-mix-base-urls"></a>
#### 커스텀 Mix 베이스 URL

Mix에서 컴파일된 에셋을 애플리케이션과 별도의 CDN에 배포하는 경우, `mix` 함수가 생성하는 URL의 기본 경로를 변경해야 할 수도 있습니다. 이럴 때는 애플리케이션의 `config/app.php` 설정 파일에 `mix_url` 옵션을 추가하면 됩니다:

```
'mix_url' => env('MIX_ASSET_URL', null)
```

Mix URL 설정이 완료되면, `mix` 함수가 에셋 링크를 생성할 때 해당 URL을 프리픽스로 붙입니다:

```bash
https://cdn.example.com/js/app.js?id=1964becbdd96414518cd
```

<a name="browsersync-reloading"></a>
## Browsersync 리로딩

[BrowserSync](https://browsersync.io/)를 활용하면 파일 변경 시 브라우저를 수동으로 새로고침하지 않아도, 변경사항을 자동으로 감지해 브라우저에 반영할 수 있습니다. 이 기능은 `mix.browserSync()` 메서드로 쉽게 활성화할 수 있습니다.

```js
mix.browserSync('laravel.test');
```

추가로, [BrowserSync 옵션](https://browsersync.io/docs/options)을 JavaScript 객체로 전달해 다양한 설정을 할 수 있습니다:

```js
mix.browserSync({
    proxy: 'laravel.test'
});
```

이후, `npm run watch` 명령어로 webpack의 개발 서버를 시작하세요. 이제 스크립트나 PHP 파일을 수정할 때마다 브라우저가 즉시 새로고침되어 변경된 내용을 바로 확인할 수 있습니다.

<a name="environment-variables"></a>
## 환경 변수

`.env` 파일에서 환경 변수명 앞에 반드시 `MIX_`를 붙이면, 해당 변수를 `webpack.mix.js` 스크립트로 주입할 수 있습니다:

```
MIX_SENTRY_DSN_PUBLIC=http://example.com
```

`.env` 파일에 변수를 정의한 후에는, `process.env` 객체를 통해 접근할 수 있습니다. 단, 태스크 실행 중에 환경 변수 값이 바뀌면 태스크를 재시작해야 변경 사항이 적용됩니다:

```
process.env.MIX_SENTRY_DSN_PUBLIC
```

<a name="notifications"></a>
## 알림

지원되는 환경이라면, Mix는 컴파일 시 자동으로 운영 체제 알림을 표시해 성공 여부를 빠르게 확인할 수 있도록 도와줍니다. 단, 예를 들어 프로덕션 서버에서 Mix를 실행한다면 이런 알림이 불필요할 수 있습니다. 알림을 비활성화하려면 `disableNotifications` 메서드를 사용하면 됩니다:

```
mix.disableNotifications();
```
