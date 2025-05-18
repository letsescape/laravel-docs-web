# 에셋 번들링, Vite (Asset Bundling (Vite))

- [소개](#introduction)
- [설치 및 설정](#installation)
  - [Node 설치](#installing-node)
  - [Vite 및 라라벨 플러그인 설치](#installing-vite-and-laravel-plugin)
  - [Vite 구성](#configuring-vite)
  - [스크립트 및 스타일 불러오기](#loading-your-scripts-and-styles)
- [Vite 실행](#running-vite)
- [자바스크립트 활용](#working-with-scripts)
  - [별칭(Alias) 설정](#aliases)
  - [Vue](#vue)
  - [React](#react)
  - [Inertia](#inertia)
  - [URL 처리](#url-processing)
- [스타일시트 활용](#working-with-stylesheets)
- [Blade 및 라우트와 연동](#working-with-blade-and-routes)
  - [정적 에셋 Vite로 처리하기](#blade-processing-static-assets)
  - [저장 시 자동 새로고침](#blade-refreshing-on-save)
  - [별칭(Alias) 설정](#blade-aliases)
- [에셋 프리페치](#asset-prefetching)
- [커스텀 Base URL](#custom-base-urls)
- [환경 변수](#environment-variables)
- [테스트 시 Vite 비활성화](#disabling-vite-in-tests)
- [서버 사이드 렌더링(SSR)](#ssr)
- [스크립트와 스타일 태그 속성](#script-and-style-attributes)
  - [Content Security Policy (CSP) Nonce](#content-security-csp-nonce)
  - [Subresource Integrity (SRI)](#subresource-integrity-sri)
  - [임의 속성](#arbitrary-attributes)
- [고급 커스터마이징](#advanced-customization)
  - [개발 서버 CORS 설정](#cors)
  - [개발 서버 URL 보정](#correcting-dev-server-urls)

<a name="introduction"></a>
## 소개

[Vite](https://vitejs.dev)는 매우 빠른 개발 환경을 제공하고, 운영 환경 배포를 위한 코드 번들링을 지원하는 최신 프론트엔드 빌드 도구입니다. 라라벨로 애플리케이션을 개발할 때는 주로 Vite를 사용해 애플리케이션의 CSS와 자바스크립트 파일을 운영 환경에 적합한 에셋으로 번들링합니다.

라라벨은 공식 Vite 플러그인과 Blade 디렉티브를 제공하여, 개발 및 운영 환경 모두에서 에셋 로딩이 원활히 통합되도록 지원합니다.

> [!NOTE]  
> 혹시 Laravel Mix를 사용하고 계신가요? Vite는 최신 라라벨 설치에서 기존 Laravel Mix를 대체합니다. Mix 관련 문서는 [Laravel Mix](https://laravel-mix.com/) 웹사이트에서 확인할 수 있습니다. Vite로 전환하고 싶다면 [마이그레이션 가이드](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-laravel-mix-to-vite)를 참고하세요.

<a name="vite-or-mix"></a>
#### Vite와 Laravel Mix 중 선택하기

Vite가 도입되기 전까지, 새로운 라라벨 애플리케이션은 에셋 번들링 시 [webpack](https://webpack.js.org/)을 기반으로 하는 [Mix](https://laravel-mix.com/)를 사용했습니다. Vite는 풍부한 자바스크립트 애플리케이션을 개발할 때 훨씬 빠르고 생산적인 경험을 제공합니다. [Inertia](https://inertiajs.com)와 같은 도구를 사용해 SPA(Single Page Application)을 개발하는 경우, Vite가 최적의 선택입니다.

또한, Vite는 [Livewire](https://livewire.laravel.com) 등 자바스크립트 "스프링클"이 적용된 전통적인 서버 사이드 렌더링 방식의 애플리케이션에서도 잘 동작합니다. 다만, 운영 환경에 포함되지 않는 파일을 별도로 빌드 디렉터리로 복사하는 기능 등 일부 Laravel Mix의 기능은 지원하지 않습니다.

<a name="migrating-back-to-mix"></a>
#### Mix로 되돌아가기

Vite 스캐폴딩을 기반으로 새 라라벨 애플리케이션을 시작했지만, 다시 Laravel Mix와 webpack으로 전환해야 한다면 문제 없습니다. [Vite에서 Mix로 마이그레이션하는 공식 가이드](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-vite-to-laravel-mix)를 참고하세요.

<a name="installation"></a>
## 설치 및 설정

> [!NOTE]  
> 아래 내용은 Laravel Vite 플러그인을 수동으로 설치하고 설정하는 방법을 설명합니다. 하지만 라라벨의 [스타터 키트](/docs/11.x/starter-kits)에는 이미 모든 설정이 포함되어 있어 가장 빠르게 라라벨과 Vite를 시작할 수 있는 방법입니다.

<a name="installing-node"></a>
### Node 설치

Vite와 라라벨 플러그인을 실행하기 전에 Node.js(16 이상)와 NPM이 설치되어 있어야 합니다.

```sh
node -v
npm -v
```

최신 Node와 NPM은 [공식 Node 웹사이트](https://nodejs.org/en/download/)에서 제공하는 그래픽 설치 프로그램으로 손쉽게 설치할 수 있습니다. 또는 [Laravel Sail](https://laravel.com/docs/11.x/sail)을 사용하는 경우, Sail을 통해 Node와 NPM을 실행할 수도 있습니다.

```sh
./vendor/bin/sail node -v
./vendor/bin/sail npm -v
```

<a name="installing-vite-and-laravel-plugin"></a>
### Vite 및 라라벨 플러그인 설치

라라벨을 새로 설치하면 애플리케이션 루트 디렉터리에 `package.json` 파일이 이미 생성되어 있습니다. 기본 `package.json`에는 Vite와 라라벨 플러그인을 바로 사용할 수 있도록 필요한 항목이 모두 포함되어 있습니다. NPM을 이용해 프론트엔드 의존성을 설치하세요.

```sh
npm install
```

<a name="configuring-vite"></a>
### Vite 구성

Vite는 프로젝트 루트의 `vite.config.js` 파일을 통해 설정합니다. 이 파일은 필요에 따라 자유롭게 커스터마이징할 수 있으며, `@vitejs/plugin-vue`, `@vitejs/plugin-react` 등 애플리케이션에서 필요한 추가 플러그인도 설치해 사용할 수 있습니다.

라라벨 Vite 플러그인에서는 애플리케이션의 진입점을 지정해야 합니다. 진입점은 자바스크립트나 CSS 파일일 수 있고, TypeScript, JSX, TSX, Sass 등 프리프로세서를 사용하는 파일도 가능합니다.

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

SPA(싱글 페이지 애플리케이션), Inertia를 기반으로 한 애플리케이션 등을 구축하는 경우에는 CSS 진입점을 포함하지 않고 Vite를 사용하는 것이 더 효과적입니다.

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

이 경우 자바스크립트를 통해 CSS를 불러와야 하며, 보통 애플리케이션의 `resources/js/app.js` 파일 내에서 다음과 같이 CSS를 import합니다.

```js
import './bootstrap';
import '../css/app.css'; // [tl! add]
```

라라벨 Vite 플러그인은 여러 개의 진입점 및 [SSR 진입점](#ssr)과 같은 고급 설정 옵션도 지원합니다.

<a name="working-with-a-secure-development-server"></a>
#### 보안 개발 서버에서 작업하기

로컬 개발 웹서버가 HTTPS로 애플리케이션을 서비스 중인 경우, Vite 개발 서버와의 연결에 문제가 발생할 수 있습니다.

[Laravel Herd](https://herd.laravel.com)를 사용하여 사이트를 보안 설정했거나, [Laravel Valet](/docs/11.x/valet)를 사용해 [secure 명령어](/docs/11.x/valet#securing-sites)로 애플리케이션을 보안 설정한 경우, 라라벨 Vite 플러그인은 자동으로 생성된 TLS 인증서를 감지해 적용합니다.

만약 애플리케이션 디렉터리 명칭과 다른 호스트로 사이트를 보안 설정했다면, 애플리케이션의 `vite.config.js` 파일에서 수동으로 호스트를 지정할 수 있습니다.

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

다른 웹 서버를 사용하는 경우, 신뢰할 수 있는 인증서를 직접 생성하고, Vite에 수동으로 인증서를 지정해야 합니다.

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

시스템에 신뢰할 수 있는 인증서를 생성하지 못한다면, [`@vitejs/plugin-basic-ssl` 플러그인](https://github.com/vitejs/vite-plugin-basic-ssl)을 설치 후 설정할 수 있습니다. 신뢰할 수 없는(자체 서명된) 인증서를 사용하는 경우에는 `npm run dev` 명령어를 실행할 때 콘솔에 표시되는 "Local" 링크를 클릭해 브라우저에서 인증서 경고를 직접 수락해야 Vite 개발 서버에 접근할 수 있습니다.

<a name="configuring-hmr-in-sail-on-wsl2"></a>
#### WSL2에서 Sail로 개발 서버 실행 시

Windows Subsystem for Linux 2(WSL2) 환경에서 [Laravel Sail](/docs/11.x/sail)로 Vite 개발 서버를 실행하는 경우, 브라우저가 개발 서버와 제대로 통신할 수 있도록 `vite.config.js`에 다음 설정을 추가해야 합니다.

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

개발 서버가 실행 중인데도 파일 변경이 브라우저에 반영되지 않는 경우, Vite의 [`server.watch.usePolling` 옵션](https://vitejs.dev/config/server-options.html#server-watch)도 추가로 설정해야 할 수 있습니다.

<a name="loading-your-scripts-and-styles"></a>
### 스크립트 및 스타일 불러오기

Vite 진입점을 설정했다면, 이제 애플리케이션의 루트 템플릿(`<head>` 부분)에 `@vite()` Blade 디렉티브를 추가해 에셋을 불러올 수 있습니다.

```blade
<!DOCTYPE html>
<head>
    {{-- ... --}}

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
```

자바스크립트에서 CSS를 import하는 경우라면, 자바스크립트 진입점만 지정하면 됩니다.

```blade
<!DOCTYPE html>
<head>
    {{-- ... --}}

    @vite('resources/js/app.js')
</head>
```

`@vite` 디렉티브는 Vite 개발 서버를 자동으로 감지하고, Hot Module Replacement(HMR)를 위한 Vite 클라이언트를 삽입합니다. 운영(build) 모드에서는 컴파일되고 버전이 적용된 에셋(및 import된 CSS 포함)을 불러옵니다.

필요하다면, `@vite` 디렉티브를 호출할 때 컴파일된 에셋의 빌드 경로를 지정할 수도 있습니다.

```blade
<!doctype html>
<head>
    {{-- 빌드 경로는 public 경로 기준으로 입력합니다. --}}

    @vite('resources/js/app.js', 'vendor/courier/build')
</head>
```

<a name="inline-assets"></a>
#### 인라인 에셋

에셋의 버전 URL을 링크로 제공하는 대신, 에셋의 실제 내용을 그대로 포함해야 할 때도 있습니다. 예를 들어 HTML 콘텐츠를 PDF 생성기로 전달할 때, 파일 대신 에셋 내용을 직접 페이지에 포함해야 할 수 있습니다. 이때는 `Vite` 파사드가 제공하는 `content` 메서드를 활용합니다.

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
## Vite 실행

Vite를 실행하는 방법은 두 가지입니다. 로컬 개발 중에는 `dev` 명령어로 개발 서버를 실행할 수 있습니다. 개발 서버는 파일 변경을 자동으로 감지해, 열려있는 브라우저 창에 즉시 반영합니다.

운영 배포용 에셋 번들링 및 버전 적용이 필요하다면 `build` 명령어를 실행하세요.

```shell
# Vite 개발 서버 실행...
npm run dev

# 운영 환경 배포용 에셋 번들 및 버전 적용...
npm run build
```

WSL2 환경의 [Sail](/docs/11.x/sail)에서 개발 서버를 사용한다면 [추가 설정](#configuring-hmr-in-sail-on-wsl2)이 필요할 수 있습니다.

<a name="working-with-scripts"></a>
## 자바스크립트 활용

<a name="aliases"></a>
### 별칭(Alias) 설정

기본적으로 라라벨 플러그인은 자주 사용하는 디렉터리를 쉽게 import할 수 있도록 다음과 같이 공통 별칭을 제공합니다.

```js
{
    '@' => '/resources/js'
}
```

`'@'` 별칭은 `vite.config.js` 파일에서 직접 원하는 값으로 덮어쓸 수 있습니다.

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

[Vue](https://vuejs.org/) 프레임워크로 프론트엔드를 개발하려면 `@vitejs/plugin-vue` 플러그인을 추가로 설치해야 합니다.

```sh
npm install --save-dev @vitejs/plugin-vue
```

설치 후, 해당 플러그인을 `vite.config.js` 파일에 포함하세요. 라라벨에서 Vue 플러그인을 사용할 땐 몇 가지 추가 옵션을 함께 지정해야 합니다.

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
                    // Vue 플러그인은 SFC 내 에셋 URL을 라라벨 웹 서버 기준으로 재작성합니다.
                    // base를 null로 설정하면 라라벨 플러그인이 대신 Vite 서버 기준으로 URL을 재작성합니다.
                    base: null,

                    // 절대 경로로 된 URL은 디스크 상의 파일 경로로 인식합니다.
                    // false로 설정하면 public 디렉터리의 에셋을 참조하도록 URL을 그대로 둡니다.
                    includeAbsolute: false,
                },
            },
        }),
    ],
});
```

> [!NOTE]  
> 라라벨의 [스타터 키트](/docs/11.x/starter-kits)에는 이미 Vue 및 Vite 설정이 올바르게 포함되어 있습니다. 라라벨, Vue, Vite를 가장 빠르게 시작하려면 [Laravel Breeze](/docs/11.x/starter-kits#breeze-and-inertia)를 확인해 보세요.

<a name="react"></a>
### React

[React](https://reactjs.org/) 프레임워크로 프론트엔드를 개발하려면 `@vitejs/plugin-react` 플러그인을 추가로 설치해야 합니다.

```sh
npm install --save-dev @vitejs/plugin-react
```

설치 후, 해당 플러그인을 `vite.config.js`에 추가하세요.

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

JSX가 포함된 모든 파일의 확장자는 `.jsx` 또는 `.tsx`로 지정해야 하며, 진입점 역시 필요하다면 [위 예제](#configuring-vite)처럼 변경해야 합니다.

또한, 기존의 `@vite` 디렉티브와 함께 추가로 `@viteReactRefresh` Blade 디렉티브를 포함해야 합니다.

```blade
@viteReactRefresh
@vite('resources/js/app.jsx')
```

`@viteReactRefresh` 디렉티브는 반드시 `@vite`보다 먼저 호출되어야 합니다.

> [!NOTE]  
> 라라벨의 [스타터 키트](/docs/11.x/starter-kits)에는 이미 React 및 Vite 설정이 올바르게 포함되어 있습니다. 라라벨, React, Vite를 가장 빠르게 시작하려면 [Laravel Breeze](/docs/11.x/starter-kits#breeze-and-inertia)를 참고하세요.

<a name="inertia"></a>
### Inertia

라라벨 Vite 플러그인은 Inertia 페이지 컴포넌트를 쉽게 로드할 수 있도록 `resolvePageComponent` 함수를 제공합니다. 아래는 Vue 3에서 활용하는 예시이며, React 등 다른 프레임워크에서도 활용 가능합니다.

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

Inertia에서 Vite의 코드 분할(feature)을 사용하는 경우, [에셋 프리페치](#asset-prefetching) 옵션을 함께 설정하는 것이 좋습니다.

> [!NOTE]  
> 라라벨의 [스타터 키트](/docs/11.x/starter-kits)에는 Inertia 및 Vite 설정도 이미 포함되어 있습니다. 라라벨, Inertia, Vite를 가장 빠르게 시작하려면 [Laravel Breeze](/docs/11.x/starter-kits#breeze-and-inertia)를 참고하세요.

<a name="url-processing"></a>
### URL 처리

Vite를 사용하면서 HTML, CSS, JS 내에서 에셋을 참조할 때 주의해야 할 점이 몇 가지 있습니다. 먼저, 에셋을 절대 경로로 참조하면 Vite는 해당 에셋을 번들에 포함하지 않습니다. 따라서 절대 경로로 참조되는 에셋은 반드시 public 디렉터리에 존재해야 합니다. 특히 [별도의 CSS 진입점](#configuring-vite)을 사용하는 경우, 개발 중 브라우저는 CSS가 호스팅되는 Vite 개발 서버에서 해당 경로의 파일을 찾으려 하므로 절대 경로 사용을 피해야 합니다.

상대 경로로 에셋을 참조할 때는, 참조 위치 기준 상대 경로임을 잊지 마세요. 상대 경로로 참조된 모든 에셋은 Vite가 재작성, 버전 적용, 번들링을 수행합니다.

프로젝트 구조 예시는 다음과 같습니다.

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

아래 예시는 Vite가 상대 URL과 절대 URL을 어떻게 처리하는지 보여줍니다.

```html
<!-- 이 에셋은 Vite가 처리하지 않으며, 빌드에 포함되지 않습니다. -->
<img src="/taylor.png" />

<!-- 이 에셋은 Vite가 재작성, 버전 적용, 번들링을 수행합니다. -->
<img src="../../images/abigail.png" />
```

<a name="working-with-stylesheets"></a>
## 스타일시트 활용

Vite의 CSS 지원에 대해서는 [Vite 공식 문서](https://vitejs.dev/guide/features.html#css)에서 더 자세히 확인할 수 있습니다. [Tailwind](https://tailwindcss.com) 등 PostCSS 플러그인을 사용하는 경우, 프로젝트 루트에 `postcss.config.js` 파일을 생성하면 Vite가 자동으로 적용해줍니다.

```js
export default {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
};
```

> [!NOTE]  
> 라라벨의 [스타터 키트](/docs/11.x/starter-kits)에는 이미 Tailwind, PostCSS, Vite 관련 설정이 모두 포함되어 있습니다. 혹시 스타터 키트 없이 Tailwind와 라라벨을 사용하고 싶다면 [Tailwind의 라라벨 가이드](https://tailwindcss.com/docs/guides/laravel)를 참고하세요.

<a name="working-with-blade-and-routes"></a>
## Blade 및 라우트와 연동

<a name="blade-processing-static-assets"></a>
### 정적 에셋 Vite로 처리하기

자바스크립트 또는 CSS에서 에셋을 참조할 경우, Vite는 자동으로 해당 에셋의 번들링과 버전 적용을 처리합니다. Blade 기반 애플리케이션을 빌드할 때도, Blade 템플릿에서만 참조되는 정적 에셋을 Vite가 번들링 및 버전 적용하도록 처리할 수 있습니다.

이를 위해서는 엔트리포인트 파일을 통해 Vite가 해당 에셋을 인식할 수 있도록 import해야 합니다. 예를 들어, `resources/images`에 저장된 이미지와 `resources/fonts`에 저장된 폰트를 모두 처리하려면, 다음과 같이 애플리케이션의 `resources/js/app.js` 엔트리포인트에서 import합니다.

```js
import.meta.glob([
  '../images/**',
  '../fonts/**',
]);
```

이렇게 설정하면 `npm run build` 실행 시 Vite가 이 에셋들을 처리합니다. 이후 Blade 템플릿에서 해당 에셋의 버전 URL이 필요하다면 `Vite::asset` 메서드를 사용할 수 있습니다.

```blade
<img src="{{ Vite::asset('resources/images/logo.png') }}" />
```

<a name="blade-refreshing-on-save"></a>
### 저장 시 자동 새로고침

Blade를 활용한 전통적인 서버사이드 렌더링 애플리케이션을 개발할 때, Vite는 뷰 파일을 변경하면 브라우저를 자동으로 새로고침해 개발 효율을 높여줍니다. 이 기능을 사용하려면 `refresh` 옵션을 `true`로 지정하면 됩니다.

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

`refresh` 옵션이 `true`일 때, 아래 디렉터리 내에서 파일을 저장하면 `npm run dev` 실행 중, 브라우저에서 전체 페이지 새로고침이 자동 동작합니다.

- `app/Livewire/**`
- `app/View/Components/**`
- `lang/**`
- `resources/lang/**`
- `resources/views/**`
- `routes/**`

`routes/**` 디렉터리를 감시하는 것은 [Ziggy](https://github.com/tighten/ziggy)를 이용해 프론트엔드에서 라우트 링크를 생성하는 경우에 유용합니다.

기본 감시 경로가 필요에 맞지 않다면, 감시할 경로 목록을 직접 지정할 수도 있습니다.

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

내부적으로 라라벨 Vite 플러그인은 [`vite-plugin-full-reload`](https://github.com/ElMassimo/vite-plugin-full-reload) 패키지를 사용하며, 이 패키지의 고급 옵션을 활용해 새로고침 동작을 세부적으로 조정할 수도 있습니다. 예를 들어, 아래처럼 `config` 정의를 전달할 수 있습니다.

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
### 별칭(Alias) 설정

자바스크립트 애플리케이션에서 자주 사용하는 디렉터리에 [별칭을 지정](#aliases)하는 것처럼, Blade 내에서도 `Illuminate\Support\Facades\Vite` 클래스의 `macro` 메서드를 이용해 Blade용 별칭을 만들 수 있습니다. 일반적으로 "매크로"는 [서비스 프로바이더](/docs/11.x/providers)의 `boot` 메서드에서 정의합니다.

```
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Vite::macro('image', fn (string $asset) => $this->asset("resources/images/{$asset}"));
}
```

매크로를 정의하면, Blade 템플릿 내에서 이를 사용할 수 있습니다. 예를 들어 위에서 만든 `image` 매크로를 활용해 `resources/images/logo.png`에 위치한 에셋을 참조할 수 있습니다.

```blade
<img src="{{ Vite::image('logo.png') }}" alt="Laravel Logo" />
```

<a name="asset-prefetching"></a>

## 에셋 프리페치(Asset Prefetching)

Vite의 코드 분할 기능을 활용해 SPA를 구축할 때, 각 페이지 이동 시마다 필요한 에셋이 동적으로 불러와집니다. 이러한 동작은 UI 렌더링이 지연되는 문제를 초래할 수 있습니다. 만약 여러분이 사용하는 프론트엔드 프레임워크에서 이 부분이 문제라면, 라라벨은 애플리케이션의 JavaScript 및 CSS 에셋을 최초 페이지 로드 시 미리 프리페치(prefetch)할 수 있도록 지원합니다.

라라벨에서 프리페치 기능을 사용하려면, [서비스 프로바이더](/docs/11.x/providers)의 `boot` 메서드에서 `Vite::prefetch` 메서드를 호출하면 됩니다.

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

위 예시에서는 각 페이지 로드 시 최대 `3`개의 에셋이 동시에 프리페치됩니다. 애플리케이션의 필요에 따라 동시 다운로드 개수를 조정할 수 있으며, 제한 없이 모든 에셋을 한 번에 프리페치하고 싶다면 아래와 같이 사용할 수 있습니다.

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Vite::prefetch();
}
```

기본적으로 프리페치는 [page _load_ 이벤트](https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event)가 발생하면 시작됩니다. 프리페치가 시작되는 시점을 커스터마이즈하고 싶다면, Vite가 대기할 이벤트를 직접 지정할 수 있습니다.

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Vite::prefetch(event: 'vite:prefetch');
}
```

위와 같이 설정하면 여러분이 `window` 객체에 `vite:prefetch` 이벤트를 직접 디스패치할 때 프리페치가 시작됩니다. 예를 들어, 페이지가 로드되고 3초 후에 프리페치를 시작하려면 아래와 같은 코드를 사용할 수 있습니다.

```html
<script>
    addEventListener('load', () => setTimeout(() => {
        dispatchEvent(new Event('vite:prefetch'))
    }, 3000))
</script>
```

<a name="custom-base-urls"></a>
## 커스텀 베이스 URL(Custom Base URLs)

만약 사용 중인 Vite로 빌드한 에셋이 애플리케이션과는 다른 도메인(예: CDN)을 통해 배포되는 경우, 애플리케이션의 `.env` 파일 내에 `ASSET_URL` 환경 변수를 반드시 지정해야 합니다.

```env
ASSET_URL=https://cdn.example.com
```

에셋 URL을 설정하면, 모든 재작성된 에셋 경로 앞에 입력한 값이 자동으로 붙게 됩니다.

```nothing
https://cdn.example.com/build/assets/app.9dce8d17.js
```

[Vite는 절대 URL은 재작성하지 않습니다](#url-processing). 따라서 절대 URL에는 프리픽스가 추가되지 않습니다.

<a name="environment-variables"></a>
## 환경 변수(Environment Variables)

자바스크립트 코드 안에서 환경 변수를 사용하려면, 애플리케이션의 `.env` 파일에서 환경 변수 이름 앞에 `VITE_` 접두어를 붙이면 됩니다.

```env
VITE_SENTRY_DSN_PUBLIC=http://example.com
```

이렇게 주입된 환경 변수는 `import.meta.env` 객체를 통해 접근할 수 있습니다.

```js
import.meta.env.VITE_SENTRY_DSN_PUBLIC
```

<a name="disabling-vite-in-tests"></a>
## 테스트 시 Vite 비활성화(Disabling Vite in Tests)

라라벨의 Vite 연동 기능은 테스트 실행 시에도 에셋의 경로를 자동으로 해결하려고 시도합니다. 따라서 Vite 개발 서버를 실행하거나, 에셋을 미리 빌드해 두어야 합니다.

테스트 중에 Vite의 동작을 모킹(mock)하고 싶을 경우, 라라벨의 `TestCase` 클래스를 상속하는 테스트에서 `withoutVite` 메서드를 호출할 수 있습니다.

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

모든 테스트에서 Vite를 비활성화하고 싶거나, 기본적으로 해당 동작을 적용하고 싶다면, 베이스 `TestCase` 클래스의 `setUp` 메서드에서 `withoutVite`를 호출하면 됩니다.

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
## 서버 사이드 렌더링(SSR, Server-Side Rendering)

라라벨 Vite 플러그인을 사용하면 Vite 기반의 서버 사이드 렌더링(SSR) 환경도 손쉽게 구축할 수 있습니다. 먼저 `resources/js/ssr.js` 위치에 SSR용 엔트리 포인트 파일을 만들고, 라라벨 플러그인 옵션의 `ssr` 키에 해당 경로를 지정하세요.

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

SSR 엔트리 포인트 빌드를 누락하지 않도록 하기 위하여, 애플리케이션의 `package.json` 파일 내 "build" 스크립트를 다음과 같이 수정하세요.

```json
"scripts": {
     "dev": "vite",
     "build": "vite build" // [tl! remove]
     "build": "vite build && vite build --ssr" // [tl! add]
}
```

이제 SSR 서버의 빌드 및 실행은 아래 명령어로 수행할 수 있습니다.

```sh
npm run build
node bootstrap/ssr/ssr.js
```

[Inertia 기반 SSR](https://inertiajs.com/server-side-rendering)을 사용하는 경우, SSR 서버는 `inertia:start-ssr` 아티즌 명령어로 구동할 수도 있습니다.

```sh
php artisan inertia:start-ssr
```

> [!NOTE]  
> 라라벨의 [스타터 키트](/docs/11.x/starter-kits)에는 이미 라라벨, Inertia SSR, Vite의 적절한 설정이 포함되어 있습니다. 라라벨, Inertia SSR, Vite의 가장 빠른 시작 방법으로 [Laravel Breeze](/docs/11.x/starter-kits#breeze-and-inertia)를 참고하실 수 있습니다.

<a name="script-and-style-attributes"></a>
## Script 및 Style 태그 속성

<a name="content-security-policy-csp-nonce"></a>
### 콘텐츠 보안 정책(CSP) Nonce

[콘텐츠 보안 정책](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)의 일환으로, script 및 style 태그에 [`nonce` 속성](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce)을 포함시키고 싶다면, 커스텀 [미들웨어](/docs/11.x/middleware)에서 `useCspNonce` 메서드로 nonce 값을 생성 또는 지정할 수 있습니다.

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

`useCspNonce` 메서드를 호출하면, 라라벨은 자동으로 생성되는 모든 script 및 style 태그에 `nonce` 속성을 포함시켜줍니다.

이미 할당된 nonce 값을 다른 곳에서도 사용해야 하거나, 라라벨 [스타터 키트](/docs/11.x/starter-kits)에 포함된 [Ziggy의 `@route` 디렉티브](https://github.com/tighten/ziggy#using-routes-with-a-content-security-policy)에서 nonce를 명시해야 한다면, `cspNonce` 메서드를 통해 값을 가져올 수 있습니다.

```blade
@routes(nonce: Vite::cspNonce())
```

미리 가지고 있는 nonce로 라라벨이 해당 값을 사용하도록 지정하려면, 아래와 같이 사용할 수 있습니다.

```php
Vite::useCspNonce($nonce);
```

<a name="subresource-integrity-sri"></a>
### 하위 리소스 무결성(SRI, Subresource Integrity)

Vite 매니페스트에 에셋의 `integrity` 해시가 포함되어 있다면, 라라벨은 생성되는 script, style 태그에 자동으로 `integrity` 속성을 추가하여 [하위 리소스 무결성(Subresource Integrity)](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)을 보장합니다. 기본적으로 Vite는 매니페스트에 무결성 해시를 포함하지 않으며, [`vite-plugin-manifest-sri`](https://www.npmjs.com/package/vite-plugin-manifest-sri) NPM 플러그인을 설치해 활성화해야 합니다.

```shell
npm install --save-dev vite-plugin-manifest-sri
```

설치 후 `vite.config.js` 파일에서 아래와 같이 플러그인을 활성화하세요.

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

필요하다면, 무결성 해시가 기록된 매니페스트의 키 이름도 변경할 수 있습니다.

```php
use Illuminate\Support\Facades\Vite;

Vite::useIntegrityKey('custom-integrity-key');
```

자동 감지를 완전히 비활성화하려면 `useIntegrityKey` 메서드에 `false`를 전달하세요.

```php
Vite::useIntegrityKey(false);
```

<a name="arbitrary-attributes"></a>
### 임의 속성 추가(Arbitrary Attributes)

script, style 태그에 [`data-turbo-track`](https://turbo.hotwired.dev/handbook/drive#reloading-when-assets-change)과 같은 속성을 추가해야 한다면, `useScriptTagAttributes` 및 `useStyleTagAttributes` 메서드를 이용해 지정할 수 있습니다. 주로 [서비스 프로바이더](/docs/11.x/providers)에서 호출하는 것이 일반적입니다.

```php
use Illuminate\Support\Facades\Vite;

Vite::useScriptTagAttributes([
    'data-turbo-track' => 'reload', // 속성 값 지정
    'async' => true, // 값이 없는 속성 지정
    'integrity' => false, // 자동으로 추가될 속성을 명시적으로 제외
]);

Vite::useStyleTagAttributes([
    'data-turbo-track' => 'reload',
]);
```

상황에 따라 조건부로 속성을 추가해야 한다면 콜백 함수를 넘겨, 자원 경로, URL, 매니페스트 청크, 전체 매니페스트 등의 정보를 활용할 수 있습니다.

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
> Vite 개발 서버가 실행 중일 때에는 `$chunk`와 `$manifest` 인수에 `null`이 전달됩니다.

<a name="advanced-customization"></a>
## 고급 커스터마이징(Advanced Customization)

기본적으로 라라벨 Vite 플러그인은 대부분의 애플리케이션에 적합한 기본값을 사용하지만, 때로는 Vite의 동작을 상세히 조정해야 할 수도 있습니다. 그런 경우, `@vite` Blade 디렉티브 대신 다음과 같은 메서드와 옵션을 활용해 커스터마이징할 수 있습니다.

```blade
<!doctype html>
<head>
    {{-- ... --}}

    {{
        Vite::useHotFile(storage_path('vite.hot')) // "hot" 파일 경로 직접 설정
            ->useBuildDirectory('bundle') // 빌드 디렉터리 지정
            ->useManifestFilename('assets.json') // 매니페스트 파일명 지정
            ->withEntryPoints(['resources/js/app.js']) // 엔트리 포인트 지정
            ->createAssetPathsUsing(function (string $path, ?bool $secure) { // 빌드된 에셋의 경로 생성 방식 커스터마이즈
                return "https://cdn.example.com/{$path}";
            })
    }}
</head>
```

동일한 설정을 `vite.config.js` 파일에도 똑같이 반영해야 합니다.

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            hotFile: 'storage/vite.hot', // "hot" 파일 경로 직접 설정
            buildDirectory: 'bundle', // 빌드 디렉터리 지정
            input: ['resources/js/app.js'], // 엔트리 포인트 지정
        }),
    ],
    build: {
      manifest: 'assets.json', // 매니페스트 파일명 지정
    },
});
```

<a name="cors"></a>
### 개발 서버 CORS 문제 해결(Dev Server Cross-Origin Resource Sharing)

Vite 개발 서버에서 에셋을 가져올 때 브라우저에서 CORS(Cross-Origin Resource Sharing) 오류가 발생한다면, 여러분이 이용 중인 출처(origin)가 개발 서버에 접근할 수 있도록 허용해야 합니다. 라라벨 플러그인과 함께 사용할 때는 아래의 오리진이 별도 설정 없이 자동 허용됩니다.

- `::1`
- `127.0.0.1`
- `localhost`
- `*.test`
- `*.localhost`
- 프로젝트의 `.env`에 지정된 `APP_URL`

프로젝트별 맞춤 오리진을 가장 쉽게 허용하는 방법은 애플리케이션의 `APP_URL` 환경 변수를 실제 브라우저에서 방문하는 주소와 일치시키는 것입니다. 예를 들어, `https://my-app.laravel` 주소로 접속한다면, `.env`를 다음과 같이 맞춰야 합니다.

```env
APP_URL=https://my-app.laravel
```

더 정교하게 여러 오리진을 허용하거나, 커스텀 CORS 정책이 필요하다면 [Vite의 서버 CORS 옵션](https://vite.dev/config/server-options.html#server-cors)을 활용하세요. 예를 들어, 여러 오리진을 `server.cors.origin` 옵션에 배열로 지정할 수 있습니다.

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

특정 최상위 도메인 전체를 허용하기 위해 정규표현식을 사용하는 것도 가능합니다. 예를 들어, `*.laravel` 도메인에 모두 대응하려면 다음과 같이 코드를 작성할 수 있습니다.

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
                // 지원 형식: SCHEME://DOMAIN.laravel[:PORT] [tl! add]
                /^https?:\/\/.*\.laravel(:\d+)?$/, //[tl! add]
            ], // [tl! add]
        }, // [tl! add]
    }, // [tl! add]
});
```

<a name="correcting-dev-server-urls"></a>
### 개발 서버 URL 보정(Correcting Dev Server URLs)

Vite 생태계의 일부 플러그인은 슬래시(`/`)로 시작하는 URL이 항상 Vite 개발 서버를 가리킨다고 간주합니다. 하지만 라라벨과 통합된 환경에서는 해당 규칙이 항상 성립하지는 않습니다.

예를 들어, `vite-imagetools` 플러그인은 Vite가 에셋을 서비스할 때 아래와 같이 URL을 출력합니다.

```html
<img src="/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520" />
```

`vite-imagetools`에서는 URL이 `/@imagetools`로 시작하면 해당 URL을 Vite가 가로채어 처리한다고 가정합니다. 이런 동작을 기대하는 플러그인을 사용할 경우 직접 URL을 보정해주어야 합니다. 이때 `vite.config.js`의 `transformOnServe` 옵션을 사용할 수 있습니다.

아래 예시에서는 `/@imagetools` 경로를 개발 서버의 실제 URL로 치환하는 방식입니다.

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

이 설정을 하면 Vite가 에셋을 서비스할 때 아래와 같이 개발 서버의 정확한 URL로 경로가 치환되어 출력됩니다.

```html
- <img src="/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520" /><!-- [tl! remove] -->
+ <img src="http://[::1]:5173/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520" /><!-- [tl! add] -->
```