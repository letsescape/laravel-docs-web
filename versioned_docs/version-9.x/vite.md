# 에셋 번들링, Vite (Asset Bundling (Vite))

- [소개](#introduction)
- [설치 및 설정](#installation)
    - [Node 설치](#installing-node)
    - [Vite 및 라라벨 플러그인 설치](#installing-vite-and-laravel-plugin)
    - [Vite 설정](#configuring-vite)
    - [스크립트와 스타일 불러오기](#loading-your-scripts-and-styles)
- [Vite 실행](#running-vite)
- [자바스크립트 활용하기](#working-with-scripts)
    - [별칭(Alias) 사용](#aliases)
    - [Vue](#vue)
    - [React](#react)
    - [Inertia](#inertia)
    - [URL 처리](#url-processing)
- [스타일시트 활용하기](#working-with-stylesheets)
- [Blade 및 라우트와 함께 사용하기](#working-with-blade-and-routes)
    - [Blade에서 정적 에셋 처리하기](#blade-processing-static-assets)
    - [저장 시 새로고침](#blade-refreshing-on-save)
    - [별칭(Alias)](#blade-aliases)
- [커스텀 베이스 URL](#custom-base-urls)
- [환경 변수](#environment-variables)
- [테스트에서 Vite 비활성화](#disabling-vite-in-tests)
- [서버 사이드 렌더링(SSR)](#ssr)
- [스크립트 및 스타일 태그 속성](#script-and-style-attributes)
    - [콘텐츠 보안 정책(CSP) nonce](#content-security-policy-csp-nonce)
    - [서브리소스 무결성(SRI)](#subresource-integrity-sri)
    - [임의의 속성 추가](#arbitrary-attributes)
- [고급 커스터마이징](#advanced-customization)
    - [개발 서버 URL 교정](#correcting-dev-server-urls)

<a name="introduction"></a>

## 소개

[Vite](https://vitejs.dev)는 최신 프론트엔드 빌드 도구로, 매우 빠른 개발 환경을 제공하며 코드를 프로덕션용으로 번들링할 수 있게 해줍니다. 라라벨로 애플리케이션을 개발할 때, 보통 Vite를
사용하여 애플리케이션의 CSS와 자바스크립트 파일을 프로덕션에 배포할 수 있는 에셋으로 번들링합니다.

라라벨은 공식 플러그인과 Blade 디렉티브를 제공하여 개발 및 프로덕션 환경 모두에서 Vite와의 통합을 매우 쉽게 지원합니다.

> [!NOTE]
> 라라벨 Mix를 사용하고 계신가요? 이제 Vite가 새로운 라라벨 설치의 기본 빌드 도구가 되었습니다. Mix 관련 문서는 [Laravel Mix](https://laravel-mix.com/) 공식 사이트에서
> 확인하실 수 있습니다. Vite로
> 전환하려면 [마이그레이션 가이드](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-laravel-mix-to-vite)를 참고해
> 주세요.

<a name="vite-or-mix"></a>

#### Vite와 Laravel Mix 중 선택하기

이전에는 새로 만든 라라벨 애플리케이션에서 에셋 번들링에 [Mix](https://laravel-mix.com/)를 사용했습니다. Mix는 [webpack](https://webpack.js.org/) 기반입니다.
Vite는 리치 자바스크립트 애플리케이션 개발 시 훨씬 빠르고 생산적인 개발 경험을 제공하는 것을 목표로 하고 있습니다. [Inertia](https://inertiajs.com) 등과 같은 도구를 활용한 싱글
페이지 애플리케이션(SPA)을 개발한다면 Vite가 매우 잘 맞습니다.

Vite는 [Livewire](https://laravel-livewire.com)와 같이 전통적인 서버 사이드 렌더링 방식의 애플리케이션에서도 자바스크립트 "스프링클"이 필요한 부분에 무리 없이 사용할 수
있습니다. 다만, 라라벨 Mix가 지원하는 임의의 에셋을 번들에 포함하는 기능 등 몇몇 기능은 제공하지 않습니다. 즉, 자바스크립트에서 직접 참조되지 않는 파일을 복사하는 기능 등은 Mix만 지원합니다.

<a name="migrating-back-to-mix"></a>

#### 다시 Mix로 전환하기

Vite 구조로 새 라라벨 애플리케이션을 시작했지만, 다시 라라벨 Mix와 webpack으로 돌아가야 할 필요가 생겼나요? 문제
없습니다. [Vite에서 Mix로 마이그레이션하는 공식 가이드](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-vite-to-laravel-mix)
를 참고해 주세요.

<a name="installation"></a>

## 설치 및 설정

> [!NOTE]
> 여기의 문서는 라라벨 Vite 플러그인을 직접 설치하고 설정하는 방법에 대해 설명합니다. 하지만 라라벨의 [스타터 키트](/docs/9.x/starter-kits)는 이 모든 설정을 포함하고 있으니, 라라벨과
> Vite를 빠르게 시작하고 싶다면 스타터 키트를 활용하는 것이 가장 쉽습니다.

<a name="installing-node"></a>

### Node 설치

Vite와 라라벨 플러그인을 실행하려면 반드시 Node.js(16 이상)와 NPM이 설치되어 있어야 합니다.

```sh
node -v
npm -v
```

최신 버전의 Node와 NPM은 [공식 Node 웹사이트](https://nodejs.org/en/download/)의 그래픽 설치 프로그램을 통해 쉽게 설치할 수 있습니다.
또는 [Laravel Sail](https://laravel.com/docs/9.x/sail)을 사용 중이라면 아래와 같이 Sail 명령어를 통해 Node와 NPM을 실행할 수도 있습니다.

```sh
./vendor/bin/sail node -v
./vendor/bin/sail npm -v
```

<a name="installing-vite-and-laravel-plugin"></a>

### Vite 및 라라벨 플러그인 설치

새로 설치한 라라벨 프로젝트의 루트 디렉터리에는 `package.json` 파일이 있습니다. 이 기본 `package.json` 파일 안에는 Vite 및 라라벨 플러그인을 사용하는 데 필요한 설정이 이미 포함되어
있습니다. NPM을 사용해 프론트엔드 의존성을 설치할 수 있습니다.

```sh
npm install
```

<a name="configuring-vite"></a>

### Vite 설정

Vite는 프로젝트 루트의 `vite.config.js` 파일을 통해 설정할 수 있습니다. 이 파일을 자신의 필요에 맞게 자유롭게 수정할 수 있으며, `@vitejs/plugin-vue`,
`@vitejs/plugin-react`와 같은 추가 플러그인도 설치할 수 있습니다.

라라벨 Vite 플러그인에서는 애플리케이션의 엔트리 포인트를 명시해야 합니다. 이 엔트리 포인트는 자바스크립트 또는 CSS 파일일 수 있으며, TypeScript, JSX, TSX, Sass와 같은 사전처리 언어도
사용할 수 있습니다.

```js
import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel([
            'resources/css/app.css',
            'resources/js/app.js',
        ]),
    ],
});
```

SPA(싱글 페이지 애플리케이션), 특히 Inertia 등으로 개발하는 경우에는 CSS 엔트리 포인트를 제외하는 것이 Vite와 가장 잘 맞습니다.

```js
import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel([
            'resources/css/app.css', // [tl! remove]
            'resources/js/app.js',
        ]),
    ],
});
```

이 경우 CSS는 자바스크립트 내부에서 임포트해야 합니다. 보통 `resources/js/app.js` 파일에서 아래와 같이 작성합니다.

```js
import './bootstrap';
import '../css/app.css'; // [tl! add]
```

라라벨 플러그인은 여러 엔트리 포인트 및 [SSR용 엔트리 포인트](#ssr)와 같은 고급 설정도 지원합니다.

<a name="working-with-a-secure-development-server"></a>

#### 보안 개발 서버에서의 작업

로컬 개발용 웹 서버가 HTTPS로 애플리케이션을 서빙하는 경우, Vite 개발 서버와의 연결에서 문제가 발생할 수 있습니다.

[Laravel Valet](/docs/9.x/valet)를 사용해 로컬 개발을 진행하며 [보안 명령어](/docs/9.x/valet#securing-sites)를 실행한 경우, 아래처럼 Valet가 생성한 TLS
인증서를 Vite 개발 서버에서 자동으로 사용하도록 설정할 수 있습니다.

```js
import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            valetTls: 'my-app.test', // [tl! add]
        }),
    ],
});
```

다른 웹 서버를 사용하는 경우에는 직접 신뢰할 수 있는 인증서를 생성하고, Vite에 해당 인증서 경로를 지정해야 합니다.

```js
// ...
import fs from 'fs'; // [tl! add]

const host = 'my-app.test'; // [tl! add]

export default defineConfig({
    // ...
    server: { // [tl! add]
        host, // [tl! add]
        hmr: {host}, // [tl! add]
        https: { // [tl! add]
            key: fs.readFileSync(`/path/to/${host}.key`), // [tl! add]
            cert: fs.readFileSync(`/path/to/${host}.crt`), // [tl! add]
        }, // [tl! add]
    }, // [tl! add]
});
```

시스템에 신뢰할 수 있는 인증서를 발급할 수 없는 경우, [`@vitejs/plugin-basic-ssl` 플러그인](https://github.com/vitejs/vite-plugin-basic-ssl)을 설치해
사용할 수 있습니다. 신뢰되지 않은 인증서를 사용할 때는 브라우저에서 인증서 경고를 수락해야 하며, `npm run dev` 명령어 실행 후 콘솔에 보이는 "Local" 링크를 클릭해서 접속하면 됩니다.

<a name="loading-your-scripts-and-styles"></a>

### 스크립트와 스타일 불러오기

Vite의 엔트리 포인트를 지정했다면, 이제 `@vite()` Blade 디렉티브를 애플리케이션의 루트 템플릿 `<head>` 부분에 추가하면 됩니다.

```blade
<!doctype html>
<head>
    {{-- ... --}}

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
```

자바스크립트에서 CSS를 직접 임포트하는 경우, 자바스크립트 엔트리 포인트만 지정하면 됩니다.

```blade
<!doctype html>
<head>
    {{-- ... --}}

    @vite('resources/js/app.js')
</head>
```

`@vite` 디렉티브는 Vite 개발 서버를 자동으로 감지하여 Hot Module Replacement를 위한 Vite 클라이언트를 주입해 줍니다. 빌드 모드에서는 번들링되고 버전이 적용된 에셋(임포트된 CSS
포함)을 자동으로 불러옵니다.

필요하다면, `@vite` 디렉티브에서 빌드된 에셋의 경로를 직접 지정할 수도 있습니다.

```blade
<!doctype html>
<head>
    {{-- 지정된 빌드 경로는 public 경로를 기준으로 상대 경로입니다. --}}

    @vite('resources/js/app.js', 'vendor/courier/build')
</head>
```

<a name="running-vite"></a>

## Vite 실행

Vite를 실행하는 방법은 두 가지가 있습니다. 개발 과정에서는 `dev` 명령어로 개발 서버를 실행할 수 있습니다. 개발 서버는 파일 변경을 자동으로 감지하고, 열린 브라우저 창에서 바로 반영됩니다.

또는, `build` 명령어를 사용하면 애플리케이션의 에셋이 번들링되고 버전이 적용되어 프로덕션 배포를 위해 준비됩니다.

```shell
# Vite 개발 서버 실행
npm run dev

# 프로덕션용 에셋 빌드 및 버전 적용
npm run build
```

<a name="working-with-scripts"></a>

## 자바스크립트 활용하기

<a name="aliases"></a>

### 별칭(Alias) 사용

기본적으로 라라벨 플러그인은 애플리케이션 에셋을 더 쉽게 임포트할 수 있도록 아래와 같은 공통 별칭을 제공합니다.

```js
{
    '@'
=>
    '/resources/js'
}
```

직접 `vite.config.js` 설정 파일에서 `'@'` 별칭을 덮어쓸 수도 있습니다.

```js
import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel(['resources/ts/app.tsx']),
    ],
    resolve: {
        alias: {
            '@': '/resources/ts',
        },
    },
});
```

<a name="vue"></a>

### Vue

[Vue](https://vuejs.org/) 프레임워크로 프론트엔드를 개발하고자 한다면, `@vitejs/plugin-vue` 플러그인을 추가로 설치해야 합니다.

```sh
npm install --save-dev @vitejs/plugin-vue
```

이후 `vite.config.js` 설정 파일에 해당 플러그인을 포함하면 됩니다. 또한, 라라벨과 함께 Vue 플러그인을 사용할 때 몇 가지 옵션을 추가로 지정해주는 것이 좋습니다.

```js
import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [
        laravel(['resources/js/app.js']),
        vue({
            template: {
                transformAssetUrls: {
                    // Single File Components에서 에셋 URL을 재작성합니다.
                    // base를 null로 설정하면 Vite 서버로 이동합니다.
                    base: null,

                    // 절대 URL을 파일 경로가 아닌 public 디렉터리에 있는 정적 에셋으로 취급하게 합니다.
                    includeAbsolute: false,
                },
            },
        }),
    ],
});
```

> [!NOTE]
> 라라벨의 [스타터 키트](/docs/9.x/starter-kits)에는 이미 올바른 라라벨, Vue, Vite 설정이 모두 포함되어 있습니다. 라라벨, Vue, Vite를 빠르게 시작하고
> 싶다면 [Laravel Breeze](/docs/9.x/starter-kits#breeze-and-inertia)를 추천합니다.

<a name="react"></a>

### React

[React](https://reactjs.org/) 프레임워크를 사용할 때는 `@vitejs/plugin-react` 플러그인을 추가로 설치해야 합니다.

```sh
npm install --save-dev @vitejs/plugin-react
```

이 플러그인 역시 `vite.config.js` 설정 파일에 추가해줍니다.

```js
import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel(['resources/js/app.jsx']),
        react(),
    ],
});
```

JSX를 포함하는 파일은 `.jsx` 또는 `.tsx` 확장자를 사용해야 하며, 필요하다면 엔트리 포인트 역시 [위에서 설명한 대로](#configuring-vite) 변경해야 합니다.

그리고 기존의 `@vite` 디렉티브와 함께 추가로 `@viteReactRefresh` Blade 디렉티브를 포함해야 합니다.

```blade
@viteReactRefresh
@vite('resources/js/app.jsx')
```

`@viteReactRefresh`는 반드시 `@vite`보다 먼저 호출되어야 합니다.

> [!NOTE]
> 라라벨의 [스타터 키트](/docs/9.x/starter-kits)는 이미 라라벨, React, Vite의 적절한 설정을
> 제공합니다. [Laravel Breeze](/docs/9.x/starter-kits#breeze-and-inertia)로 시작하면 빠르고 편하게 React와 Vite를 사용할 수 있습니다.

<a name="inertia"></a>

### Inertia

라라벨 Vite 플러그인은 Inertia 페이지 컴포넌트를 편리하게 불러오는 `resolvePageComponent` 함수를 제공합니다. 아래는 Vue 3용 예제이지만, React 등 다른 프레임워크에서도 동일하게
활용할 수 있습니다.

```js
import {createApp, h} from 'vue';
import {createInertiaApp} from '@inertiajs/vue3';
import {resolvePageComponent} from 'laravel-vite-plugin/inertia-helpers';

createInertiaApp({
    resolve: (name) => resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue')),
    setup({el, App, props, plugin}) {
        return createApp({render: () => h(App, props)})
            .use(plugin)
            .mount(el)
    },
});
```

> [!NOTE]
> 라라벨 [스타터 키트](/docs/9.x/starter-kits)에는 이미 Inertia와 관련된 적절한 설정이 되어
> 있습니다. [Laravel Breeze](/docs/9.x/starter-kits#breeze-and-inertia)를 활용하면 라라벨, Inertia, Vite를 가장 쉽게 시작할 수 있습니다.

<a name="url-processing"></a>

### URL 처리

Vite와 함께 애플리케이션의 HTML, CSS, JS 등에서 에셋을 참조할 때는 몇 가지 주의해야 할 점이 있습니다. 먼저, 절대 경로(`/`로 시작하는 경로)로 에셋을 참조하면, Vite는 해당 파일을 빌드에
포함하지 않습니다. 그러므로 이 경우 해당 에셋이 public 디렉터리에 있어야 합니다.

상대 경로로 에셋을 참조하는 경우, 그 경로는 해당 파일(자바스크립트, CSS 등) 위치를 기준으로 합니다. 상대 경로를 사용한 에셋은 Vite가 자동으로 재작성, 버전 적용, 번들링을 해줍니다.

다음은 프로젝트 구조 예시입니다.

```nothing
public/
  taylor.png
resources/
  js/
    Pages/
      Welcome.vue
  images/
    abigail.png
```

아래 예시는 Vite가 상대/절대 경로를 어떻게 처리하는지 보여줍니다.

```html
<!-- 이 에셋은 Vite에서 처리하지 않으며 빌드에 포함되지 않습니다. -->
<img src="/taylor.png"/>

<!-- 이 에셋은 Vite에서 재작성, 버전 적용, 번들링됩니다. -->
<img src="../../images/abigail.png"/>
```

<a name="working-with-stylesheets"></a>

## 스타일시트 활용하기

Vite의 CSS 지원에 대한 자세한 내용은 [Vite 문서](https://vitejs.dev/guide/features.html#css)에서 확인할 수
있습니다. [Tailwind](https://tailwindcss.com)와 같은 PostCSS 플러그인을 사용한다면, 프로젝트 루트에 `postcss.config.js` 파일을 생성하면 Vite가 이를 자동으로
적용해줍니다.

```js
module.exports = {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
};
```

<a name="working-with-blade-and-routes"></a>

## Blade 및 라우트와 함께 사용하기

<a name="blade-processing-static-assets"></a>

### Blade에서 정적 에셋 처리하기

자바스크립트나 CSS에서 에셋을 참조할 경우, Vite가 자동으로 해당 에셋을 처리(버전 관리 및 빌드)해줍니다. 그리고 Blade 기반 애플리케이션의 경우, Blade 템플릿에서만 참조하는 정적 에셋도 Vite가
처리할 수 있습니다.

이를 위해서는 반드시 해당 에셋을 애플리케이션의 엔트리 포인트에 임포트하여 Vite가 인식할 수 있도록 해야 합니다. 예를 들어, `resources/images`에 있는 모든 이미지와,
`resources/fonts`에 있는 모든 폰트 파일을 처리하고 싶다면, `resources/js/app.js` 엔트리 포인트에 아래와 같이 추가해야 합니다.

```js
import.meta.glob([
    '../images/**',
    '../fonts/**',
]);
```

이제 `npm run build`를 실행하면 해당 에셋들도 Vite에 의해 빌드됩니다. Blade 템플릿에서 해당 에셋을 참조할 때는 `Vite::asset` 메서드를 사용하면 버전이 포함된 URL이 반환됩니다.

```blade
<img src="{{ Vite::asset('resources/images/logo.png') }}" />
```

<a name="blade-refreshing-on-save"></a>

### 저장 시 새로고침

Blade를 이용한 전통적인 서버 사이드 렌더링 애플리케이션이라면, Vite를 활용해 view 파일 저장 시 브라우저를 자동으로 새로고침할 수 있습니다. `refresh` 옵션을 `true`로 지정하면 바로 사용할
수 있습니다.

```js
import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            refresh: true,
        }),
    ],
});
```

`refresh` 옵션을 `true`로 설정하면 아래 경로의 파일을 저장할 때, `npm run dev`로 실행 중인 브라우저에서 전체 페이지가 새로고침됩니다.

- `app/View/Components/**`
- `lang/**`
- `resources/lang/**`
- `resources/views/**`
- `routes/**`

`routes/**` 디렉터리를 감시하는 것은 [Ziggy](https://github.com/tighten/ziggy)를 사용해 프론트엔드에서 라우트 링크를 생성하는 경우 유용합니다.

기본 경로가 필요에 맞지 않는 경우, 감시할 경로 목록을 직접 지정할 수도 있습니다.

```js
import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            refresh: ['resources/views/**'],
        }),
    ],
});
```

내부적으로 라라벨 Vite 플러그인은 [`vite-plugin-full-reload`](https://github.com/ElMassimo/vite-plugin-full-reload) 패키지를 사용하며, 고급 설정
옵션도 지원합니다. 좀 더 세밀하게 제어하고 싶다면 다음과 같이 `config` 옵션을 줄 수 있습니다.

```js
import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            refresh: [{
                paths: ['path/to/watch/**'],
                config: {delay: 300}
            }],
        }),
    ],
});
```

<a name="blade-aliases"></a>

### 별칭(Alias)

자바스크립트에서는 [별칭을 만들어](#aliases) 자주 접근하는 경로를 편리하게 사용할 수 있습니다. 이와 비슷하게, Blade에서도 별칭을 사용할 수 있습니다. 이를 위해서는
`Illuminate\Support\Facades\Vite` 클래스의 `macro` 메서드를 활용하면 됩니다. 보통 서비스 프로바이더의 `boot` 메서드에서 "매크로"를 등록합니다.

```
/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Vite::macro('image', fn ($asset) => $this->asset("resources/images/{$asset}"));
}
```

매크로가 정의되면, 템플릿에서 다음과 같이 사용할 수 있습니다. 예를 들어, 위에서 정의한 `image` 매크로로 `resources/images/logo.png`에 있는 에셋을 참조할 수 있습니다.

```blade
<img src="{{ Vite::image('logo.png') }}" alt="Laravel Logo" />
```

<a name="custom-base-urls"></a>

## 커스텀 베이스 URL

Vite로 빌드된 에셋을 애플리케이션과 다른 도메인(예: CDN)에 배포하는 경우, `.env` 파일에서 `ASSET_URL` 환경 변수를 반드시 설정해 주세요.

```env
ASSET_URL=https://cdn.example.com
```

이렇게 설정한 후에는 모든 에셋 URL이 해당 값으로 프리픽스되어 사용됩니다.

```nothing
https://cdn.example.com/build/assets/app.9dce8d17.js
```

[절대 경로 URL은 Vite에서 재작성되지 않으므로](#url-processing), 프리픽스가 적용되지 않는다는 점을 기억해야 합니다.

<a name="environment-variables"></a>

## 환경 변수

애플리케이션의 `.env` 파일에서 환경 변수명을 `VITE_`로 시작하도록 지정하면, 해당 변수를 자바스크립트 코드에서 사용할 수 있습니다.

```env
VITE_SENTRY_DSN_PUBLIC=http://example.com
```

주입된 환경 변수는 `import.meta.env` 객체를 통해 접근할 수 있습니다.

```js
import.meta.env.VITE_SENTRY_DSN_PUBLIC
```

<a name="disabling-vite-in-tests"></a>

## 테스트에서 Vite 비활성화

라라벨의 Vite 통합 기능은 테스트 실행 시에도 에셋을 자동으로 처리하려고 시도합니다. 이 때에는 Vite 개발 서버를 실행 중이거나 미리 에셋 빌드가 필요합니다.

테스트 중에 Vite를 모킹(mock)하고 싶다면, `TestCase` 클래스를 확장한 모든 테스트에서 사용할 수 있는 `withoutVite` 메서드를 호출하면 됩니다.

```php
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_without_vite_example()
    {
        $this->withoutVite();

        // ...
    }
}
```

모든 테스트에서 기본적으로 Vite를 비활성화하는 것이 필요하다면, 베이스 `TestCase` 클래스의 `setUp` 메서드에서 `withoutVite` 메서드를 호출하세요.

```php
<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    protected function setUp(): void// [tl! add:start]
    {
        parent::setUp();

        $this->withoutVite();
    }// [tl! add:end]
}
```

<a name="ssr"></a>

## 서버 사이드 렌더링(SSR)

라라벨 Vite 플러그인을 이용하면 서버 사이드 렌더링(SSR)도 간단하게 구축할 수 있습니다. 먼저 `resources/js/ssr.js` 경로에 SSR 엔트리 포인트 파일을 생성하고, 라라벨 플러그인에 해당
경로를 옵션으로 지정합니다.

```js
import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            ssr: 'resources/js/ssr.js',
        }),
    ],
});
```

SSR 엔트리 포인트 빌드를 잊지 않도록, 애플리케이션의 `package.json` 내 "build" 스크립트를 아래와 같이 보강할 것을 권장합니다.

```json
"scripts": {
"dev": "vite",
"build": "vite build" // [tl! remove]
"build": "vite build && vite build --ssr" // [tl! add]
}
```

이제 SSR 서버를 빌드하고 시작하려면 아래 명령어를 실행합니다.

```sh
npm run build
node bootstrap/ssr/ssr.mjs
```

> [!NOTE]
> 라라벨 [스타터 키트](/docs/9.x/starter-kits)에는 이미 Inertia SSR 및 Vite의 적절한 설정이 포함되어
> 있습니다. [Laravel Breeze](/docs/9.x/starter-kits#breeze-and-inertia)로 시작하면, Inertia SSR 및 Vite 환경을 바로 구축할 수 있습니다.

<a name="script-and-style-attributes"></a>

## 스크립트 및 스타일 태그 속성

<a name="content-security-policy-csp-nonce"></a>

### 콘텐츠 보안 정책(CSP) nonce

[콘텐츠 보안 정책(CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)의 일환으로, 스크립트 및 스타일 태그에 [
`nonce` 속성](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce)을 포함하고 싶다면,
커스텀 [미들웨어](/docs/9.x/middleware)에서 `useCspNonce` 메서드를 호출해 nonce를 생성하거나 지정할 수 있습니다.

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Vite;

class AddContentSecurityPolicyHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        Vite::useCspNonce();

        return $next($request)->withHeaders([
            'Content-Security-Policy' => "script-src 'nonce-".Vite::cspNonce()."'",
        ]);
    }
}
```

`useCspNonce` 메서드를 호출하면 라라벨은 생성하는 모든 스크립트 및 스타일 태그에 자동으로 nonce 속성을 추가해 줍니다.

Ziggy의 [@route 디렉티브](https://github.com/tighten/ziggy#using-routes-with-a-content-security-policy) 등, 다른 곳에서도 nonce가
필요하다면 `cspNonce` 메서드로 값을 받아올 수 있습니다.

```blade
@routes(nonce: Vite::cspNonce())
```

이미 가지고 있는 nonce 값을 라라벨에 사용하도록 지정하려면, `useCspNonce`에 nonce 값을 인자로 전달하면 됩니다.

```php
Vite::useCspNonce($nonce);
```

<a name="subresource-integrity-sri"></a>

### 서브리소스 무결성(SRI)

Vite 매니페스트에 에셋의 `integrity` 해시가 포함된 경우, 라라벨은 자동으로 생성된 스크립트 및 스타일 태그에 `integrity` 속성을
추가하여 [서브리소스 무결성(Subresource Integrity)](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)을
보장합니다. 기본적으로 Vite는 매니페스트에 `integrity` 값을 포함하지 않지만, [
`vite-plugin-manifest-sri`](https://www.npmjs.com/package/vite-plugin-manifest-sri) NPM 플러그인을 설치하면 이를 활성화할 수 있습니다.

```shell
npm install --save-dev vite-plugin-manifest-sri
```

설치 후 `vite.config.js` 파일에 플러그인을 추가하면 됩니다.

```js
import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';
import manifestSRI from 'vite-plugin-manifest-sri';// [tl! add]

export default defineConfig({
    plugins: [
        laravel({
            // ...
        }),
        manifestSRI(),// [tl! add]
    ],
});
```

필요하다면, 무결성 해시가 저장되는 매니페스트의 키 이름을 커스텀할 수도 있습니다.

```php
use Illuminate\Support\Facades\Vite;

Vite::useIntegrityKey('custom-integrity-key');
```

이 기능의 자동 감지를 완전히 비활성화하려면, `useIntegrityKey`에 `false`를 전달하면 됩니다.

```php
Vite::useIntegrityKey(false);
```

<a name="arbitrary-attributes"></a>

### 임의의 속성 추가

스크립트 혹은 스타일 태그에 [`data-turbo-track`](https://turbo.hotwired.dev/handbook/drive#reloading-when-assets-change) 등과 같은 추가
속성이 필요하다면, `useScriptTagAttributes`와 `useStyleTagAttributes` 메서드를 사용해 지정할 수 있습니다. 일반적으로 이
메서드는 [서비스 프로바이더](/docs/9.x/providers)에서 호출합니다.

```php
use Illuminate\Support\Facades\Vite;

Vite::useScriptTagAttributes([
    'data-turbo-track' => 'reload', // 속성에 값을 지정
    'async' => true, // 값 없는 속성 정의
    'integrity' => false, // 기본적으로 포함될 속성 제외
]);

Vite::useStyleTagAttributes([
    'data-turbo-track' => 'reload',
]);
```

속성을 조건부로 추가해야 한다면, 에셋의 소스 경로, URL, 매니페스트 청크, 전체 매니페스트를 인자로 받는 콜백을 전달할 수 있습니다.

```php
use Illuminate\Support\Facades\Vite;

Vite::useScriptTagAttributes(fn (string $src, string $url, array|null $chunk, array|null $manifest) => [
    'data-turbo-track' => $src === 'resources/js/app.js' ? 'reload' : false,
]);

Vite::useStyleTagAttributes(fn (string $src, string $url, array|null $chunk, array|null $manifest) => [
    'data-turbo-track' => $chunk && $chunk['isEntry'] ? 'reload' : false,
]);
```

> [!WARNING]
> Vite 개발 서버가 실행 중일 때는 `$chunk`와 `$manifest` 인자가 `null`이 됩니다.

<a name="advanced-customization"></a>

## 고급 커스터마이징

기본적으로 라라벨의 Vite 플러그인은 대부분의 애플리케이션에서 바로 사용할 수 있도록 합리적인 설정을 제공합니다. 하지만 특별히 Vite의 동작 방식을 수정하고 싶을 때는, `@vite` Blade 디렉티브 대신
아래와 같이 여러 메서드와 옵션을 조합해 사용할 수 있습니다.

```blade
<!doctype html>
<head>
    {{-- ... --}}

    {{
        Vite::useHotFile(storage_path('vite.hot')) // "hot" 파일 경로 지정
            ->useBuildDirectory('bundle') // 빌드 디렉터리 지정
            ->useManifestFilename('assets.json') // 매니페스트 파일 이름 설정
            ->withEntryPoints(['resources/js/app.js']) // 엔트리 포인트 직접 지정
    }}
</head>
```

동일한 설정을 `vite.config.js` 파일에도 맞춰 작성해야 합니다.

```js
import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            hotFile: 'storage/vite.hot', // "hot" 파일 경로 지정
            buildDirectory: 'bundle', // 빌드 디렉터리 지정
            input: ['resources/js/app.js'], // 엔트리 포인트 직접 지정
        }),
    ],
    build: {
        manifest: 'assets.json', // 매니페스트 파일 이름 지정
    },
});
```

<a name="correcting-dev-server-urls"></a>

### 개발 서버 URL 교정

Vite 생태계의 일부 플러그인은 `/` 로 시작하는 URL이 항상 Vite 개발 서버를 가리킨다고 가정합니다. 하지만 라라벨과 통합된 경우에는 항상 그렇지 않을 수 있습니다.

예를 들어, `vite-imagetools` 플러그인은 아래와 같이 개발 서버에서 에셋을 제공할 때 다음과 같은 URL을 출력합니다.

```html
<img src="/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520"/>
```

이 플러그인은 `/@imagetools`로 시작하는 URL을 Vite가 가로채서 해당 플러그인이 처리하기를 기대합니다. 이런 동작을 원하는 플러그인을 사용할 때는 URL을 수동으로 교정해야 할 수 있습니다. 이 때는
`vite.config.js`의 `transformOnServe` 옵션을 활용하면 됩니다.

아래 예시에서는, 생성된 코드 내 모든 `/@imagetools` 경로에 개발 서버 URL을 자동으로 앞에 붙여줍니다.

```js
import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';
import {imagetools} from 'vite-imagetools';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            transformOnServe: (code, devServerUrl) => code.replaceAll('/@imagetools', devServerUrl + '/@imagetools'),
        }),
        imagetools(),
    ],
});
```

이제 Vite가 에셋을 서빙할 때, 생성된 URL이 아래와 같이 개발 서버 주소를 포함하게 됩니다.

```html
- <img src="/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520"/><!-- [tl! remove] -->
+ <img src="http://[::1]:5173/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520"/><!-- [tl! add] -->
```
