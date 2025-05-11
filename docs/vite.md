# 에셋 번들링 (Vite) (Asset Bundling (Vite))

- [소개](#introduction)
- [설치 및 설정](#installation)
  - [Node 설치](#installing-node)
  - [Vite와 Laravel 플러그인 설치](#installing-vite-and-laravel-plugin)
  - [Vite 설정](#configuring-vite)
  - [스크립트 및 스타일 불러오기](#loading-your-scripts-and-styles)
- [Vite 실행하기](#running-vite)
- [자바스크립트 작업](#working-with-scripts)
  - [별칭(Aliases)](#aliases)
  - [Vue](#vue)
  - [React](#react)
  - [Inertia](#inertia)
  - [URL 처리](#url-processing)
- [스타일시트 작업](#working-with-stylesheets)
- [Blade 및 라우트와 함께 사용하기](#working-with-blade-and-routes)
  - [Vite로 정적 에셋 처리하기](#blade-processing-static-assets)
  - [저장 시 새로고침](#blade-refreshing-on-save)
  - [별칭](#blade-aliases)
- [에셋 프리페치(Prefetching)](#asset-prefetching)
- [커스텀 Base URL](#custom-base-urls)
- [환경 변수](#environment-variables)
- [테스트에서 Vite 비활성화](#disabling-vite-in-tests)
- [서버사이드 렌더링(SSR)](#ssr)
- [스크립트 및 스타일 태그 속성](#script-and-style-attributes)
  - [Content Security Policy (CSP) nonce](#content-security-policy-csp-nonce)
  - [서브리소스 무결성(Subresource Integrity, SRI)](#subresource-integrity-sri)
  - [임의 속성(Arbitrary Attributes)](#arbitrary-attributes)
- [고급 커스터마이징](#advanced-customization)
  - [개발 서버 CORS 설정](#cors)
  - [개발 서버 URL 바로잡기](#correcting-dev-server-urls)

<a name="introduction"></a>
## 소개

[Vite](https://vitejs.dev)는 최신 프런트엔드 빌드 도구로, 매우 빠른 개발 환경을 제공하며 프로덕션 배포용 코드 번들링도 지원합니다. 라라벨로 애플리케이션을 개발할 때, 일반적으로 Vite를 사용해 애플리케이션의 CSS와 JavaScript 파일을 프로덕션에 적합한 에셋으로 번들링합니다.

라라벨은 공식 플러그인과 Blade 디렉티브를 제공하여, 개발 환경과 프로덕션 환경 모두에서 Vite 에셋을 손쉽게 불러올 수 있도록 지원합니다.

> [!NOTE]
> 혹시 Laravel Mix를 사용하고 계신가요? Vite는 이제 새로운 라라벨 프로젝트에서 Laravel Mix를 대체했습니다. Mix 관련 문서는 [Laravel Mix](https://laravel-mix.com/) 공식 사이트에서 확인하실 수 있습니다. Vite로 전환하고 싶으시면, [마이그레이션 가이드](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-laravel-mix-to-vite)를 참고하세요.

<a name="vite-or-mix"></a>
#### Vite와 Laravel Mix 중 무엇을 선택할까

Vite로 전환되기 전까지, 새로운 라라벨 애플리케이션에서는 에셋 번들링 시 [Mix](https://laravel-mix.com/)를 사용했으며, 이는 [webpack](https://webpack.js.org/) 기반입니다. Vite는 더욱 빠르고 생산적인 자바스크립트 애플리케이션 개발 경험을 목표로 합니다. Inertia 등과 같은 도구로 SPA(Single Page Application)를 개발한다면, Vite가 최적의 선택지입니다.

Vite는 또한, JavaScript "스프링클"이 추가된 전통적인 서버사이드 렌더 애플리케이션(Livewire 등 사용 포함)과도 잘 어울립니다. 다만, Mix가 지원하는 일부 기능(예: JavaScript 애플리케이션에서 직접 참조하지 않는 임의의 에셋을 빌드 결과에 포함시키는 기능 등)은 Vite에는 없습니다.

<a name="migrating-back-to-mix"></a>
#### Mix로 다시 마이그레이션하기

Vite 스캐폴딩을 사용해 새 라라벨 애플리케이션을 시작했지만, 다시 Laravel Mix와 webpack으로 돌아가야 하나요? 문제 없습니다. [Vite에서 Mix로 마이그레이션하는 공식 가이드](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-vite-to-laravel-mix)를 참고해 주세요.

<a name="installation"></a>
## 설치 및 설정

> [!NOTE]
> 아래 문서는 Laravel Vite 플러그인을 수동으로 설치 및 설정하는 방법을 다룹니다. 하지만, 라라벨의 [스타터 키트](/docs/starter-kits)는 이미 모든 스캐폴딩을 포함하고 있으므로, 라라벨과 Vite를 가장 빠르게 시작하려면 스타터 키트 사용을 권장합니다.

<a name="installing-node"></a>
### Node 설치

Vite와 Laravel 플러그인을 실행하기 전에 Node.js(16 이상)와 NPM이 설치되어 있어야 합니다.

```shell
node -v
npm -v
```

Node와 NPM의 최신 버전은 [공식 Node 웹사이트](https://nodejs.org/en/download/)에서 제공하는 그래픽 설치 프로그램으로 간단히 설치할 수 있습니다. 또는 [Laravel Sail](https://laravel.com/docs/sail)을 사용하는 경우, Sail을 통해 Node와 NPM을 실행할 수도 있습니다.

```shell
./vendor/bin/sail node -v
./vendor/bin/sail npm -v
```

<a name="installing-vite-and-laravel-plugin"></a>
### Vite와 Laravel 플러그인 설치

새로 설치한 라라벨 프로젝트의 루트 디렉터리에는 `package.json` 파일이 있습니다. 기본 `package.json` 파일에는 Vite와 Laravel 플러그인을 바로 사용할 수 있도록 필요한 모든 설정이 이미 포함되어 있습니다. 프런트엔드 의존성은 NPM을 통해 설치하실 수 있습니다.

```shell
npm install
```

<a name="configuring-vite"></a>
### Vite 설정

Vite는 프로젝트 루트의 `vite.config.js` 파일을 통해 설정합니다. 이 파일은 필요에 따라 자유롭게 커스터마이즈할 수 있으며, `@vitejs/plugin-vue`, `@vitejs/plugin-react` 등과 같이 필요한 다른 플러그인도 추가로 설치할 수 있습니다.

Laravel Vite 플러그인을 사용할 때는, 애플리케이션의 엔트리 포인트를 반드시 지정해 주어야 합니다. 엔트리 포인트에는 JavaScript나 CSS 파일뿐만 아니라 TypeScript, JSX, TSX, Sass 등과 같은 전처리 언어 파일도 포함될 수 있습니다.

```js
import { defineConfig } from 'vite';
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

Inertia 등으로 만드는 SPA라면, CSS 엔트리 포인트 없이 사용하는 것이 더 좋습니다.

```js
import { defineConfig } from 'vite';
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

대신 CSS는 JavaScript 내에서 직접 임포트해야 합니다. 보통 애플리케이션의 `resources/js/app.js` 파일에서 아래처럼 작성합니다.

```js
import './bootstrap';
import '../css/app.css'; // [tl! add]
```

Laravel 플러그인은 여러 엔트리 포인트 지정, SSR용 엔트리 포인트 등 고급 설정도 지원합니다(자세한 내용은 [SSR 관련 항목](#ssr) 참고).

<a name="working-with-a-secure-development-server"></a>
#### HTTPS 개발 서버 사용하기

로컬 개발 웹 서버가 HTTPS로 애플리케이션을 제공하는 경우, Vite 개발 서버와 연결할 때 문제가 발생할 수 있습니다.

[Laravel Herd](https://herd.laravel.com)를 사용해 사이트에 보안(secure) 처리를 했거나, [Laravel Valet](/docs/valet)에서 [secure 명령어](/docs/valet#securing-sites)를 실행했다면, Laravel Vite 플러그인은 자동으로 생성된 TLS 인증서를 감지해서 사용합니다.

만약 사이트 이름과 애플리케이션 디렉터리명이 일치하지 않는 호스트를 별도로 보안 처리했다면, `vite.config.js` 파일에서 직접 host를 아래와 같이 지정할 수 있습니다.

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            detectTls: 'my-app.test', // [tl! add]
        }),
    ],
});
```

다른 웹 서버를 사용하는 경우에는 신뢰할 수 있는 인증서를 생성하여, 아래와 같이 직접 Vite에 지정해주어야 합니다.

```js
// ...
import fs from 'fs'; // [tl! add]

const host = 'my-app.test'; // [tl! add]

export default defineConfig({
    // ...
    server: { // [tl! add]
        host, // [tl! add]
        hmr: { host }, // [tl! add]
        https: { // [tl! add]
            key: fs.readFileSync(`/path/to/${host}.key`), // [tl! add]
            cert: fs.readFileSync(`/path/to/${host}.crt`), // [tl! add]
        }, // [tl! add]
    }, // [tl! add]
});
```

시스템에 신뢰할 수 있는 인증서를 생성할 수 없다면, [@vitejs/plugin-basic-ssl 플러그인](https://github.com/vitejs/vite-plugin-basic-ssl)을 설치하고 설정할 수 있습니다. 신뢰할 수 없는 인증서를 사용하는 경우, 브라우저에서 Vite 개발 서버에 접속할 때 `npm run dev` 명령 실행 시 콘솔에 표시되는 "Local" 링크를 통해 인증서 경고를 수동으로 허용해야 합니다.

<a name="configuring-hmr-in-sail-on-wsl2"></a>
#### WSL2 기반 Sail에서 개발 서버 실행하기

Windows Subsystem for Linux 2(WSL2)에서 [Laravel Sail](/docs/sail)로 Vite 개발 서버를 실행할 때는, 개발 서버와 브라우저가 통신할 수 있도록 `vite.config.js` 파일에 다음 설정을 추가해야 합니다.

```js
// ...

export default defineConfig({
    // ...
    server: { // [tl! add:start]
        hmr: {
            host: 'localhost',
        },
    }, // [tl! add:end]
});
```

개발 서버 실행 중 파일 변경 사항이 브라우저에 반영되지 않는 경우, Vite의 [server.watch.usePolling 옵션](https://vitejs.dev/config/server-options.html#server-watch)을 추가로 설정해야 할 수 있습니다.

<a name="loading-your-scripts-and-styles"></a>
### 스크립트 및 스타일 불러오기

Vite 엔트리 포인트를 설정했다면, 애플리케이션 루트 템플릿의 `<head>` 영역에 `@vite()` Blade 디렉티브로 해당 엔트리 포인트를 참조할 수 있습니다.

```blade
<!DOCTYPE html>
<head>
    {{-- ... --}}

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
```

CSS를 JavaScript에서 임포트하는 경우에는, JavaScript 엔트리 포인트만 등록하시면 됩니다.

```blade
<!DOCTYPE html>
<head>
    {{-- ... --}}

    @vite('resources/js/app.js')
</head>
```

`@vite` 디렉티브는 개발 환경에서는 Vite 개발 서버를 자동으로 감지해 Hot Module Replacement(HMR)가 가능한 Vite 클라이언트를 주입합니다. 빌드 모드에서는 컴파일되고 버저닝된 에셋(임포트한 CSS 포함)을 로드합니다.

필요하다면, `@vite` 디렉티브를 호출할 때 컴파일된 에셋의 빌드 경로도 직접 지정할 수 있습니다.

```blade
<!doctype html>
<head>
    {{-- 빌드 경로는 public 경로를 기준으로 상대 지정됩니다. --}}

    @vite('resources/js/app.js', 'vendor/courier/build')
</head>
```

<a name="inline-assets"></a>
#### 인라인 에셋

에셋의 버저닝된 URL로 링크를 거는 대신, 에셋의 실제 내용을 페이지에 직접 삽입해야 하는 경우가 있을 수 있습니다. 예를 들어 PDF 생성기 등에 HTML과 함께 자바스크립트 등이 직접 들어가야 하는 경우가 해당됩니다. 이럴 때는 `Vite` 파사드가 제공하는 `content` 메서드를 사용해 Vite 에셋의 내용을 바로 출력할 수 있습니다.

```blade
@use('Illuminate\Support\Facades\Vite')

<!doctype html>
<head>
    {{-- ... --}}

    
    <script>
        {!! Vite::content('resources/js/app.js') !!}
    </script>
</head>
```

<a name="running-vite"></a>
## Vite 실행하기

Vite를 실행하는 방법은 두 가지가 있습니다. 개발을 진행하는 동안에는 `dev` 명령어로 개발 서버를 실행할 수 있습니다. 이 개발 서버는 파일 변경 사항을 자동으로 감지하고, 모든 열린 브라우저 창에 즉시 결과를 반영합니다.

그리고 `build` 명령어는 애플리케이션의 에셋을 버저닝하고 번들링하여, 프로덕션 배포를 위해 준비해줍니다.

```shell
# Vite 개발 서버 실행...
npm run dev

# 프로덕션 배포용 에셋 빌드 및 버저닝...
npm run build
```

[WSL2 기반 Sail](/docs/sail)에서 개발 서버를 실행하는 경우, [추가 설정](#configuring-hmr-in-sail-on-wsl2)이 필요할 수 있습니다.

<a name="working-with-scripts"></a>
## 자바스크립트 작업

<a name="aliases"></a>
### 별칭(Aliases)

기본적으로, Laravel 플러그인은 자주 사용되는 디렉터리로의 임포트를 편리하게 해주는 공통 별칭을 제공합니다.

```js
{
    '@' => '/resources/js'
}
```

`vite.config.js` 설정 파일에서 직접 별칭을 추가해 `'@'` 별칭을 덮어쓸 수도 있습니다.

```js
import { defineConfig } from 'vite';
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

[Vue](https://vuejs.org/) 프레임워크로 프런트엔드를 개발하고 싶다면, `@vitejs/plugin-vue` 플러그인도 설치해야 합니다.

```shell
npm install --save-dev @vitejs/plugin-vue
```

이후, `vite.config.js` 설정 파일에 해당 플러그인을 추가하세요. 라라벨에서 Vue 플러그인을 사용하는 경우, 아래와 같이 몇 가지 옵션도 함께 지정해주어야 합니다.

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [
        laravel(['resources/js/app.js']),
        vue({
            template: {
                transformAssetUrls: {
                    // Vue 플러그인은 SFC(Single File Component) 내 에셋 URL을
                    // 라라벨 웹 서버로 포워딩하도록 재작성합니다.
                    // base를 null로 설정하면 대신 Vite 서버로 URL이 포워딩됩니다.
                    base: null,

                    // Vue 플러그인은 절대 경로 URL을 파일 시스템 상의 절대 경로로 처리합니다.
                    // false로 설정하면 public 디렉터리 내의 리소스를 참조하는 것이 그대로 가능합니다.
                    includeAbsolute: false,
                },
            },
        }),
    ],
});
```

> [!NOTE]
> 라라벨의 [스타터 키트](/docs/starter-kits)에는 적절한 라라벨, Vue, Vite 설정이 이미 포함되어 있습니다. 스타터 키트를 사용하면 라라벨, Vue, Vite를 가장 빠르게 시작할 수 있습니다.

<a name="react"></a>
### React

[React](https://reactjs.org/) 프레임워크로 프런트엔드를 개발하고 싶다면, `@vitejs/plugin-react` 플러그인도 설치해야 합니다.

```shell
npm install --save-dev @vitejs/plugin-react
```

이후, 설정 파일에 해당 플러그인을 아래와 같이 추가하세요.

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel(['resources/js/app.jsx']),
        react(),
    ],
});
```

JSX가 포함된 파일은 확장자를 `.jsx` 또는 `.tsx`로 지정해야 하며, 엔트리 포인트 역시 위 예시처럼 변경되어야 합니다(자세한 내용은 [위 설명](#configuring-vite) 참고).

또한, 기존의 `@vite` 디렉티브와 함께 추가로 `@viteReactRefresh` Blade 디렉티브도 포함해야 합니다.

```blade
@viteReactRefresh
@vite('resources/js/app.jsx')
```

`@viteReactRefresh` 디렉티브는 반드시 `@vite` 디렉티브보다 먼저 호출되어야 합니다.

> [!NOTE]
> 라라벨의 [스타터 키트](/docs/starter-kits)에는 적절한 라라벨, React, Vite 설정이 이미 포함되어 있습니다. 스타터 키트를 사용하면 라라벨, React, Vite를 가장 빠르게 시작할 수 있습니다.

<a name="inertia"></a>
### Inertia

Laravel Vite 플러그인은 Inertia 페이지 컴포넌트 로딩을 돕기 위한 `resolvePageComponent` 함수를 제공합니다. 아래는 Vue 3에서 사용하는 예시이며, React 등 다른 프레임워크에서도 사용할 수 있습니다.

```js
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

createInertiaApp({
  resolve: (name) => resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue')),
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
});
```

Inertia와 함께 Vite의 코드 스플리팅 기능을 사용하는 경우, [에셋 프리페칭](#asset-prefetching) 설정을 권장합니다.

> [!NOTE]
> 라라벨의 [스타터 키트](/docs/starter-kits)에는 Inertia, Vite와 관련된 최적의 설정도 모두 포함되어 있습니다. 이 키트들을 사용하면 훨씬 빠르게 시작할 수 있습니다.

<a name="url-processing"></a>
### URL 처리

Vite를 사용할 때, 애플리케이션의 HTML, CSS, JS에서 에셋을 참조할 때는 몇 가지 주의할 점이 있습니다. 먼저, 에셋을 절대 경로로 참조하면 Vite가 해당 에셋을 빌드 결과에 포함시키지 않으므로, public 디렉터리에 파일이 반드시 존재해야 합니다. [별도의 CSS 엔트리포인트](#configuring-vite)를 사용하는 경우에는 절대 경로 사용을 피해야 합니다. 개발 환경에서는 브라우저가 CSS를 Vite 개발 서버에서 불러오려고 시도하므로, 해당 경로가 public 디렉터리에 없다면 정상적으로 로드되지 않습니다.

상대 경로로 에셋을 참조할 때는, 참조 위치를 기준으로 하는 상대 경로임을 기억하세요. 상대 경로로 참조된 에셋은 Vite가 자동으로 다시 작성해주고, 버저닝 및 번들링해줍니다.

아래와 같은 프로젝트 구조를 예로 들어보겠습니다.

```text
public/
  taylor.png
resources/
  js/
    Pages/
      Welcome.vue
  images/
    abigail.png
```

아래는 Vite가 상대/절대 경로를 각각 어떻게 처리하는지 보여줍니다.

```html
<!-- 이 에셋은 Vite가 처리하지 않으므로, 빌드에 포함되지 않습니다 -->
<img src="/taylor.png"/>

<!-- 이 에셋은 Vite가 경로를 다시 작성하고, 버저닝 및 번들링합니다 -->
<img src="../../images/abigail.png"/>
```

<a name="working-with-stylesheets"></a>
## 스타일시트 작업

> [!NOTE]
> 라라벨의 [스타터 키트](/docs/starter-kits)에는 Tailwind와 Vite가 이미 최적 설정된 상태로 포함되어 있습니다. 스타터 키트 없이 Tailwind와 Laravel을 함께 쓰고 싶으면, [Tailwind의 라라벨 설치 가이드](https://tailwindcss.com/docs/guides/laravel)를 참고하세요.

새로운 모든 라라벨 애플리케이션에는 기본적으로 Tailwind와 적절히 설정된 `vite.config.js`가 포함되어 있습니다. 따라서 Vite 개발 서버를 즉시 실행하거나, 아래처럼 Composer로 `dev` 명령어를 실행하면 라라벨과 Vite 개발 서버가 함께 시작됩니다.

```shell
composer run dev
```

CSS 파일은 보통 `resources/css/app.css` 파일에 작성합니다.

<a name="working-with-blade-and-routes"></a>
## Blade 및 라우트와 함께 사용하기

<a name="blade-processing-static-assets"></a>
### Vite로 정적 에셋 처리하기

JavaScript나 CSS에서 에셋을 참조하면 Vite가 자동으로 해당 에셋을 처리하고 버저닝해줍니다. Blade 기반 애플리케이션을 빌드할 때는, Blade 템플릿에서만 참조되는 정적 에셋도 Vite가 처리(버저닝)할 수 있습니다.

이 기능을 활용하려면, 애플리케이션의 엔트리 포인트 파일에서 정적 에셋을 import 하여 Vite가 에셋들을 인식할 수 있게 해야 합니다. 예를 들어, `resources/images` 디렉터리의 이미지와 `resources/fonts`의 모든 폰트를 빌드에 포함하고 싶다면, `resources/js/app.js` 엔트리 포인트에 아래처럼 추가하세요.

```js
import.meta.glob([
  '../images/**',
  '../fonts/**',
]);
```

이제 `npm run build` 시 Vite가 해당 에셋들을 빌드에 포함합니다. Blade 템플릿에서는 `Vite::asset` 메서드로 버저닝된 URL을 가져와 사용할 수 있습니다.

```blade
<img src="{{ Vite::asset('resources/images/logo.png') }}"/>
```

<a name="blade-refreshing-on-save"></a>
### 저장 시 새로고침

애플리케이션이 Blade 기반의 전통적 서버사이드 렌더링 방식이라면, Vite의 자동 브라우저 새로고침 기능은 개발 워크플로우를 크게 개선해줍니다. 시작하려면 `refresh` 옵션을 `true`로 지정하면 됩니다.

```js
import { defineConfig } from 'vite';
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

`refresh` 옵션이 `true`일 때, 아래 디렉터리 내 파일을 저장하면 개발 서버(`npm run dev` 실행 중)에서 전체 페이지가 자동으로 새로고침 됩니다.

- `app/Livewire/**`
- `app/View/Components/**`
- `lang/**`
- `resources/lang/**`
- `resources/views/**`
- `routes/**`

`routes/**` 디렉터리는 프론트엔드에서 [Ziggy](https://github.com/tighten/ziggy)를 활용해 라우트 링크를 생성하는 경우 유용합니다.

위 기본 경로 대신, 감시(watch)할 경로 목록을 직접 지정할 수도 있습니다.

```js
import { defineConfig } from 'vite';
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

실제로 Laravel Vite 플러그인 내부에서는 [vite-plugin-full-reload](https://github.com/ElMassimo/vite-plugin-full-reload) 패키지를 활용하고 있으며, 이 패키지의 고급 옵션까지 세부적으로 활용하려면 아래와 같이 `config` 정의를 추가로 전달할 수 있습니다.

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            refresh: [{
                paths: ['path/to/watch/**'],
                config: { delay: 300 }
            }],
        }),
    ],
});
```

<a name="blade-aliases"></a>
### 별칭

자바스크립트 프로젝트에서는 자주 참조하는 디렉터리로의 [별칭(Alias)를 만드는 것](#aliases)이 일반적입니다. Blade에서도 `Illuminate\Support\Facades\Vite` 클래스의 `macro` 메서드를 활용해 자체 별칭을 만들 수 있습니다. 일반적으로 "매크로"는 [서비스 프로바이더](/docs/providers)의 `boot` 메서드에서 정의합니다.

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Vite::macro('image', fn (string $asset) => $this->asset("resources/images/{$asset}"));
}
```

매크로를 정의하면, 템플릿에서 해당 매크로를 아래처럼 사용할 수 있습니다. 예를 들어 위에서 정의한 `image` 매크로로 `resources/images/logo.png` 에셋을 참조할 수 있습니다.

```blade
<img src="{{ Vite::image('logo.png') }}" alt="Laravel Logo"/>
```

<a name="asset-prefetching"></a>

## 에셋 프리페치(Asset Prefetching)

Vite의 코드 스플리팅(code splitting) 기능을 활용해 SPA를 구축하면, 각 페이지 이동 시마다 필요한 에셋이 개별적으로 불러와집니다. 이 동작은 사용자 인터페이스(UI) 렌더링 지연 문제로 이어질 수 있습니다. 만약 여러분이 사용하는 프론트엔드 프레임워크에서 이 현상이 문제가 된다면, 라라벨은 최초 페이지 로딩 시 애플리케이션의 JavaScript와 CSS 에셋을 미리 프리페치하도록 지원합니다.

애플리케이션의 [서비스 프로바이더](/docs/providers) 내 `boot` 메서드에서 `Vite::prefetch` 메서드를 호출하면, 에셋을 선제적으로 프리페치할 수 있습니다.

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
```

위 예시에서 에셋은 각 페이지 로드마다 최대 `3`개씩 동시에 프리페치됩니다. `concurrency`(동시 다운로드 수) 값을 조정해 애플리케이션에 맞게 변경하거나, 동시 다운로드 제한 없이 한 번에 전체 에셋을 다운로드하도록 설정할 수도 있습니다.

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Vite::prefetch();
}
```

기본적으로 프리페치는 [page _load_ 이벤트](https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event)가 발생할 때 시작됩니다. 프리페치 시작 시점을 커스터마이즈하고 싶다면, Vite가 대기할 이벤트를 지정할 수 있습니다.

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Vite::prefetch(event: 'vite:prefetch');
}
```

위 코드와 같이 설정하면, `window` 객체에서 `vite:prefetch` 이벤트를 수동으로 디스패치할 때 프리페치가 시작됩니다. 예를 들어, 페이지 로드 후 3초 뒤에 프리페치를 시작하고 싶다면 아래와 같이 할 수 있습니다.

```html
<script>
    addEventListener('load', () => setTimeout(() => {
        dispatchEvent(new Event('vite:prefetch'))
    }, 3000))
</script>
```

<a name="custom-base-urls"></a>
## 커스텀 Base URL

Vite로 빌드된 에셋을 CDN처럼 애플리케이션과 별도의 도메인에 배포하는 경우, 애플리케이션의 `.env` 파일 내 `ASSET_URL` 환경변수를 반드시 지정해야 합니다.

```env
ASSET_URL=https://cdn.example.com
```

에셋 URL을 위와 같이 설정하면, 모든 재작성된 에셋 URL 앞에 지정한 값이 자동으로 붙게 됩니다.

```text
https://cdn.example.com/build/assets/app.9dce8d17.js
```

[Vite는 절대 경로(absolute URL)는 다시 작성하지 않습니다](#url-processing). 따라서 절대 URL은 접두사가 추가되지 않습니다.

<a name="environment-variables"></a>
## 환경 변수

애플리케이션의 `.env` 파일에서 `VITE_` 접두사를 붙여 JavaScript로 환경 변수를 주입할 수 있습니다.

```env
VITE_SENTRY_DSN_PUBLIC=http://example.com
```

주입된 환경 변수는 `import.meta.env` 객체를 통해 접근할 수 있습니다.

```js
import.meta.env.VITE_SENTRY_DSN_PUBLIC
```

<a name="disabling-vite-in-tests"></a>
## 테스트 환경에서 Vite 비활성화

라라벨의 Vite 통합 기능은 테스트 실행 시에도 에셋을 resolve하려고 시도하므로, 테스트 시 Vite 개발 서버를 실행하거나 빌드가 되어 있어야 합니다.

테스트 도중 Vite를 모킹(mock)하고 싶다면, 라라벨의 `TestCase` 클래스를 확장한 테스트에서 `withoutVite` 메서드를 호출하면 됩니다.

```php tab=Pest
test('without vite example', function () {
    $this->withoutVite();

    // ...
});
```

```php tab=PHPUnit
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_without_vite_example(): void
    {
        $this->withoutVite();

        // ...
    }
}
```

모든 테스트에서 Vite를 비활성화하고 싶다면, 기본 `TestCase` 클래스의 `setUp` 메서드에서 `withoutVite`를 호출하면 됩니다.

```php
<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void// [tl! add:start]
    {
        parent::setUp();

        $this->withoutVite();
    }// [tl! add:end]
}
```

<a name="ssr"></a>
## 서버 사이드 렌더링(SSR)

라라벨의 Vite 플러그인을 사용하면 서버 사이드 렌더링(SSR) 환경을 Vite로 손쉽게 구축할 수 있습니다. 먼저 `resources/js/ssr.js` 위치에 SSR 엔트리 포인트를 만들고, Laravel 플러그인에 옵션으로 엔트리 포인트를 지정해줍니다.

```js
import { defineConfig } from 'vite';
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

SSR 엔트리 포인트 빌드를 깜빡하는 일이 없도록, 애플리케이션의 `package.json` 내 "build" 스크립트를 다음과 같이 변경하는 것을 권장합니다.

```json
"scripts": {
     "dev": "vite",
     "build": "vite build" // [tl! remove]
     "build": "vite build && vite build --ssr" // [tl! add]
}
```

그런 뒤 아래와 같이 명령어를 실행하여 SSR 서버를 빌드하고 시작할 수 있습니다.

```shell
npm run build
node bootstrap/ssr/ssr.js
```

[Inertia 기반 SSR](https://inertiajs.com/server-side-rendering)을 사용하는 경우에는 `inertia:start-ssr` 아티즌 명령어로 SSR 서버를 시작할 수 있습니다.

```shell
php artisan inertia:start-ssr
```

> [!NOTE]
> 라라벨의 [스타터 키트](/docs/starter-kits)에는 이미 Laravel, Inertia SSR, Vite가 올바르게 구성되어 있습니다. 이 스타터 키트들은 Laravel, Inertia SSR, Vite를 가장 신속하게 시작할 수 있는 방법을 제공합니다.

<a name="script-and-style-attributes"></a>
## Script 및 Style 태그 속성

<a name="content-security-policy-csp-nonce"></a>
### Content Security Policy (CSP) Nonce

[Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) 구현을 위해 script, style 태그에 [nonce 속성](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce)을 추가하려면, 커스텀 [미들웨어](/docs/middleware)에서 `useCspNonce` 메서드를 사용해 nonce를 생성하거나 지정하면 됩니다.

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

class AddContentSecurityPolicyHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        Vite::useCspNonce();

        return $next($request)->withHeaders([
            'Content-Security-Policy' => "script-src 'nonce-".Vite::cspNonce()."'",
        ]);
    }
}
```

`useCspNonce` 메서드 실행 이후, 라라벨이 생성하는 모든 script 및 style 태그에 `nonce` 속성이 자동으로 부여됩니다.

이 nonce가 다른 곳(예: [Ziggy의 `@route` 디렉티브](https://github.com/tighten/ziggy#using-routes-with-a-content-security-policy), 라라벨 [스타터 키트](/docs/starter-kits) 포함)에서 필요하다면, `cspNonce` 메서드를 통해 가져올 수 있습니다.

```blade
@routes(nonce: Vite::cspNonce())
```

이미 생성한 nonce를 라라벨에게 사용하라고 지정하고 싶다면, `useCspNonce` 메서드에 넘겨주면 됩니다.

```php
Vite::useCspNonce($nonce);
```

<a name="subresource-integrity-sri"></a>
### Subresource Integrity (SRI)

Vite 매니페스트에 `integrity` 해시가 포함되어 있다면, 라라벨은 생성하는 script 및 style 태그에 자동으로 [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)를 보장하는 `integrity` 속성을 추가합니다. 기본적으로 Vite는 매니페스트에 `integrity` 해시를 포함하지 않으나, [vite-plugin-manifest-sri](https://www.npmjs.com/package/vite-plugin-manifest-sri) NPM 플러그인을 설치하여 활성화할 수 있습니다.

```shell
npm install --save-dev vite-plugin-manifest-sri
```

이제 `vite.config.js`에서 해당 플러그인을 활성화할 수 있습니다.

```js
import { defineConfig } from 'vite';
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

필요하다면, integrity 해시가 저장되어 있는 매니페스트 키명을 커스터마이즈할 수도 있습니다.

```php
use Illuminate\Support\Facades\Vite;

Vite::useIntegrityKey('custom-integrity-key');
```

반대로 자동 감지를 완전히 비활성화하려면, `useIntegrityKey` 메서드에 `false`를 넘겨주면 됩니다.

```php
Vite::useIntegrityKey(false);
```

<a name="arbitrary-attributes"></a>
### 임의의 속성 추가

script 및 style 태그에 추가적으로 속성을 부여해야 한다면, [data-turbo-track](https://turbo.hotwired.dev/handbook/drive#reloading-when-assets-change) 속성 등 다양한 속성을 `useScriptTagAttributes`, `useStyleTagAttributes` 메서드로 지정할 수 있습니다. 일반적으로 이런 메서드는 [서비스 프로바이더](/docs/providers)에서 호출합니다.

```php
use Illuminate\Support\Facades\Vite;

Vite::useScriptTagAttributes([
    'data-turbo-track' => 'reload', // 속성 값 지정...
    'async' => true, // 값 없이 속성만 지정...
    'integrity' => false, // 기본적으로 추가될 속성은 제외...
]);

Vite::useStyleTagAttributes([
    'data-turbo-track' => 'reload',
]);
```

조건에 따라 속성을 동적으로 부여하려면, 콜백을 넘겨 asset 소스 경로, URL, 매니페스트 청크, 전체 매니페스트 정보를 받아 속성을 지정할 수도 있습니다.

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
> Vite 개발 서버가 동작 중일 때는 `$chunk`와 `$manifest` 인수가 `null`입니다.

<a name="advanced-customization"></a>
## 고급 커스터마이징

라라벨의 Vite 플러그인은 대부분의 애플리케이션에 잘 맞는 합리적인 기본값으로 동작합니다. 하지만 때로는 Vite 동작을 더 섬세하게 다뤄야 할 때가 있습니다. 아래 옵션과 메서드들은 `@vite` Blade 디렉티브 대신 사용할 수 있는 커스터마이징 API입니다.

```blade
<!doctype html>
<head>
    {{-- ... --}}

    {{
        Vite::useHotFile(storage_path('vite.hot')) // "hot" 파일 경로 지정...
            ->useBuildDirectory('bundle') // 빌드 디렉토리 변경...
            ->useManifestFilename('assets.json') // 매니페스트 파일명 변경...
            ->withEntryPoints(['resources/js/app.js']) // 엔트리 포인트 지정...
            ->createAssetPathsUsing(function (string $path, ?bool $secure) { // 빌드된 에셋의 백엔드 경로 생성 방식 커스터마이즈...
                return "https://cdn.example.com/{$path}";
            })
    }}
</head>
```

그리고 `vite.config.js`에서도 동일한 옵션을 일치시켜야 합니다.

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            hotFile: 'storage/vite.hot', // "hot" 파일 경로 지정...
            buildDirectory: 'bundle', // 빌드 디렉토리 변경...
            input: ['resources/js/app.js'], // 엔트리 포인트 지정...
        }),
    ],
    build: {
      manifest: 'assets.json', // 매니페스트 파일명 변경...
    },
});
```

<a name="cors"></a>
### 개발 서버의 CORS(Cross-Origin Resource Sharing)

Vite 개발 서버에서 에셋을 불러올 때 브라우저에서 CORS 이슈가 발생한다면, 커스텀 origin에 대한 접근 권한을 부여해야 할 수 있습니다. 라라벨과 Vite 플러그인을 함께 쓰는 경우, 아래 origin은 별다른 설정 없이 허용됩니다.

- `::1`
- `127.0.0.1`
- `localhost`
- `*.test`
- `*.localhost`
- 프로젝트 `.env`의 `APP_URL`

프로젝트에서 커스텀 origin을 허용하는 가장 간단한 방법은, 애플리케이션의 `APP_URL` 환경 변수를 여러분이 브라우저에서 접속 중인 origin과 일치시키는 것입니다. 예를 들어, `https://my-app.laravel`로 접속한다면 `.env`를 아래와 같이 수정합니다.

```env
APP_URL=https://my-app.laravel
```

만약 여러 origin 지원 등 더 세밀한 제어가 필요하다면, [Vite의 내장 CORS 설정](https://vite.dev/config/server-options.html#server-cors)을 활용하세요. 예를 들면, 프로젝트의 `vite.config.js`에서 `server.cors.origin` 옵션에 다수의 origin을 지정할 수 있습니다.

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            refresh: true,
        }),
    ],
    server: {  // [tl! add]
        cors: {  // [tl! add]
            origin: [  // [tl! add]
                'https://backend.laravel',  // [tl! add]
                'http://admin.laravel:8566',  // [tl! add]
            ],  // [tl! add]
        },  // [tl! add]
    },  // [tl! add]
});
```

정규식 패턴도 사용할 수 있기 때문에, 예를 들어 `*.laravel`의 모든 origin을 허용하고자 할 때 유용합니다.

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            refresh: true,
        }),
    ],
    server: {  // [tl! add]
        cors: {  // [tl! add]
            origin: [ // [tl! add]
                // 지원: SCHEME://DOMAIN.laravel[:PORT] [tl! add]
                /^https?:\/\/.*\.laravel(:\d+)?$/, //[tl! add]
            ], // [tl! add]
        }, // [tl! add]
    }, // [tl! add]
});
```

<a name="correcting-dev-server-urls"></a>
### 개발 서버 URL 수정

Vite 에코시스템 내 일부 플러그인들은 슬래시(`/`)로 시작하는 모든 URL이 항상 Vite 개발 서버를 향한다고(프록시된다고) 가정합니다. 하지만 라라벨 통합의 특성상 이는 항상 맞는 것이 아닙니다.

예를 들어, `vite-imagetools` 플러그인은 Vite가 에셋을 서비스할 때 아래와 같이 URL을 생성합니다.

```html
<img src="/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520"/>
```

`vite-imagetools` 플러그인은 `/@imagetools`로 시작하는 URL을 Vite가 가로채 처리할 것으로 기대합니다. 만약 이런 동작을 기대하는 플러그인을 사용한다면 직접 URL을 수정해야 합니다. `vite.config.js`에서 `transformOnServe` 옵션을 사용해 해결할 수 있습니다.

이 예시에서는 빌드된 코드 내 `/@imagetools` 부분 앞에 개발 서버 URL을 붙여줍니다.

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            transformOnServe: (code, devServerUrl) => code.replaceAll('/@imagetools', devServerUrl+'/@imagetools'),
        }),
        imagetools(),
    ],
});
```

이제 Vite가 에셋을 서비스하는 동안에는 다음과 같이 개발 서버 주소를 포함한 URL로 출력됩니다.

```html
- <img src="/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520"><!-- [tl! remove] --/>
+ <img src="http://[::1]:5173/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520"><!-- [tl! add] --/>
```