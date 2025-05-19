# 에셋 번들링, Vite (Asset Bundling (Vite))

- [소개](#introduction)
- [설치 및 설정](#installation)
  - [Node 설치](#installing-node)
  - [Vite 및 Laravel 플러그인 설치](#installing-vite-and-laravel-plugin)
  - [Vite 설정](#configuring-vite)
  - [스크립트와 스타일 불러오기](#loading-your-scripts-and-styles)
- [Vite 실행하기](#running-vite)
- [JavaScript 다루기](#working-with-scripts)
  - [별칭(Alias) 활용](#aliases)
  - [Vue](#vue)
  - [React](#react)
  - [Inertia](#inertia)
  - [URL 처리](#url-processing)
- [스타일시트 다루기](#working-with-stylesheets)
- [Blade 및 라우트와 함께 사용하기](#working-with-blade-and-routes)
  - [Vite로 정적 에셋 처리하기](#blade-processing-static-assets)
  - [저장 시 자동 새로고침](#blade-refreshing-on-save)
  - [별칭(Alias) 활용](#blade-aliases)
- [커스텀 Base URL](#custom-base-urls)
- [환경 변수](#environment-variables)
- [테스트에서 Vite 비활성화](#disabling-vite-in-tests)
- [서버 사이드 렌더링(SSR)](#ssr)
- [스크립트 및 스타일 태그 속성](#script-and-style-attributes)
  - [콘텐츠 보안 정책(CSP) Nonce](#content-security-policy-csp-nonce)
  - [서브리소스 무결성(SRI)](#subresource-integrity-sri)
  - [임의의 속성](#arbitrary-attributes)
- [고급 커스터마이징](#advanced-customization)
  - [Dev 서버 URL 수정하기](#correcting-dev-server-urls)

<a name="introduction"></a>
## 소개

[Vite](https://vitejs.dev)는 매우 빠른 개발 환경을 제공하고 프로덕션용 코드 번들링을 지원하는 최신 프론트엔드 빌드 도구입니다. 라라벨로 애플리케이션을 개발할 때, 일반적으로 Vite를 사용해 앱의 CSS 및 JavaScript 파일을 프로덕션에 배포 가능한 자산(asset)으로 번들링하게 됩니다.

라라벨은 공식 Vite 플러그인과 Blade 디렉티브를 제공하여, 개발 및 프로덕션 모두에서 에셋을 불러오는 과정을 자연스럽게 통합합니다.

> [!NOTE]
> 이전에 Laravel Mix를 사용하고 계시나요? 이제 새로운 라라벨 프로젝트에서는 Vite가 기본이며, Mix는 더 이상 사용되지 않습니다. Mix 문서는 [Laravel Mix](https://laravel-mix.com/) 공식 사이트에서 확인할 수 있습니다. Vite로 전환하려면 [마이그레이션 가이드](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-laravel-mix-to-vite)를 참고하세요.

<a name="vite-or-mix"></a>
#### Vite와 Laravel Mix 중 선택하기

Vite로 전환되기 전까지, 라라벨의 신규 애플리케이션은 에셋 번들링 시 [Mix](https://laravel-mix.com/)를 기본으로 사용했으며, Mix는 [webpack](https://webpack.js.org/)을 기반으로 동작합니다. Vite는 더욱 빠르고 생산적인 JavaScript 애플리케이션 개발 환경을 추구합니다. [Inertia](https://inertiajs.com) 같은 도구로 SPA(Single Page Application)를 개발할 때, Vite는 특히 잘 어울립니다.

Vite는 [Livewire](https://livewire.laravel.com)처럼 JavaScript가 "스프링클(점진적 적용)"된 기존 서버 사이드 렌더링 환경과도 잘 호환됩니다. 다만, JavaScript 애플리케이션에서 직접 참조하지 않는 임의의 에셋을 빌드에 복사하는 등, 일부 Mix에서 제공하던 기능은 지원하지 않습니다.

<a name="migrating-back-to-mix"></a>
#### Mix로 다시 전환하기

Vite 스캐폴딩을 사용해 새 라라벨 애플리케이션을 시작했지만, Mix(webpack)로 다시 이동해야 하는 경우도 있을 수 있습니다. 문제 없습니다. [Vite에서 Mix로 마이그레이션하는 공식 가이드](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-vite-to-laravel-mix)를 참고하세요.

<a name="installation"></a>
## 설치 및 설정

> [!NOTE]
> 이 문서에서는 Laravel Vite 플러그인을 수동으로 설치하고 설정하는 방법을 다룹니다. 하지만 라라벨의 [스타터 키트](/docs/10.x/starter-kits)는 이미 필요한 구성이 포함되어 있어, 라라벨과 Vite를 가장 빠르게 시작할 수 있는 방법입니다.

<a name="installing-node"></a>
### Node 설치

Vite와 라라벨 플러그인을 실행하려면 Node.js(16버전 이상)와 NPM이 반드시 설치되어 있어야 합니다:

```sh
node -v
npm -v
```

Node 및 NPM은 [공식 Node 웹사이트](https://nodejs.org/en/download/)에서 제공되는 간편한 설치 프로그램을 통해 쉽게 설치할 수 있습니다. [Laravel Sail](https://laravel.com/docs/10.x/sail)을 사용할 경우, Sail 명령어로 Node와 NPM의 버전을 확인할 수도 있습니다:

```sh
./vendor/bin/sail node -v
./vendor/bin/sail npm -v
```

<a name="installing-vite-and-laravel-plugin"></a>
### Vite 및 Laravel 플러그인 설치

새로 설치된 라라벨 프로젝트의 루트 디렉터리에는 `package.json` 파일이 존재합니다. 기본 `package.json`에는 이미 Vite와 Laravel 플러그인을 사용하는 데 필요한 설정이 모두 포함되어 있습니다. NPM 명령어로 프런트엔드 의존성을 설치하세요:

```sh
npm install
```

<a name="configuring-vite"></a>
### Vite 설정

Vite의 설정은 프로젝트 루트의 `vite.config.js` 파일을 통해 이루어집니다. 이 파일은 프로젝트 요구 사항에 맞게 자유롭게 커스터마이즈할 수 있으며, `@vitejs/plugin-vue`나 `@vitejs/plugin-react`처럼 추가 플러그인을 설치해 사용할 수 있습니다.

Laravel Vite 플러그인을 사용할 때는 애플리케이션의 엔트리 포인트를 지정해야 합니다. 이 엔트리 포인트는 JavaScript나 CSS 파일일 수 있고, TypeScript, JSX, TSX, Sass 등 전처리 언어도 지원됩니다.

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

SPA(특히 Inertia를 사용하는 앱 등)를 개발할 경우, Vite는 CSS 엔트리 포인트 없이 사용하는 것이 가장 좋습니다:

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

대신, CSS를 JavaScript 파일에서 직접 import해야 합니다. 일반적으로 애플리케이션의 `resources/js/app.js` 파일에서 이 작업을 수행합니다:

```js
import './bootstrap';
import '../css/app.css'; // [tl! add]
```

Laravel 플러그인은 여러 엔트리 포인트 및 [SSR 엔트리 포인트](#ssr)처럼 고급 설정도 지원합니다.

<a name="working-with-a-secure-development-server"></a>
#### 보안 개발 서버 사용하기

로컬 개발 웹서버가 HTTPS로 애플리케이션을 서비스하는 경우, Vite 개발 서버와의 연결에 문제가 발생할 수 있습니다.

[Laravel Herd](https://herd.laravel.com)에서 사이트를 보안 처리했거나, [Laravel Valet](/docs/10.x/valet)에서 [`secure` 커맨드](/docs/10.x/valet#securing-sites)를 실행했다면, Laravel Vite 플러그인이 자동으로 TLS 인증서를 인식해 사용합니다.

만약 사이트를 애플리케이션 디렉터리명과 일치하지 않는 호스트로 보안 처리했다면, 애플리케이션의 `vite.config.js` 파일에 호스트를 직접 지정할 수 있습니다:

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

별도의 웹 서버를 사용하는 경우, 신뢰할 수 있는 인증서를 생성한 후, 직접 Vite에 해당 인증서를 사용하도록 설정해야 합니다:

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

시스템에 신뢰할 수 있는 인증서를 생성할 수 없다면, [`@vitejs/plugin-basic-ssl` 플러그인](https://github.com/vitejs/vite-plugin-basic-ssl)을 설치해 설정할 수 있습니다. 신뢰되지 않는 인증서로 개발할 경우, 브라우저에서 Vite 개발 서버의 "Local" 링크에 직접 접속해 인증서 경고를 수락해야 합니다. (예: `npm run dev` 실행 후)

<a name="configuring-hmr-in-sail-on-wsl2"></a>
#### WSL2의 Sail 환경에서 개발 서버 실행

[Laravel Sail](/docs/10.x/sail)을 Windows Subsystem for Linux 2(WSL2)에서 사용한다면, 브라우저가 개발 서버와 정상적으로 통신할 수 있도록 `vite.config.js`에 아래와 같은 설정을 추가해야 합니다:

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

개발 서버 실행 중 파일 변경 사항이 브라우저에 반영되지 않는다면, Vite의 [`server.watch.usePolling` 옵션](https://vitejs.dev/config/server-options.html#server-watch) 설정도 고려해보세요.

<a name="loading-your-scripts-and-styles"></a>
### 스크립트와 스타일 불러오기

Vite 엔트리 포인트를 설정했다면, 이제 블레이드 템플릿의 `<head>` 태그 내부에서 `@vite()` 디렉티브로 에셋을 참조할 수 있습니다:

```blade
<!doctype html>
<head>
    {{-- ... --}}

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
```

CSS를 JavaScript 파일을 통해 import하는 경우에는 JavaScript 엔트리 포인트만 지정해도 충분합니다:

```blade
<!doctype html>
<head>
    {{-- ... --}}

    @vite('resources/js/app.js')
</head>
```

`@vite` 디렉티브는 개발 모드에서 Vite 개발 서버를 자동으로 감지하여 Hot Module Replacement를 위해 Vite 클라이언트를 주입합니다. 빌드 모드에서는 컴파일되고 버전이 적용된 에셋(및 import된 CSS)을 불러옵니다.

빌드 된 에셋의 경로가 기본이 아닌 경우, `@vite` 디렉티브에 빌드 경로를 추가로 지정할 수 있습니다:

```blade
<!doctype html>
<head>
    {{-- 지정한 빌드 경로는 public 디렉터리 기준입니다. --}}

    @vite('resources/js/app.js', 'vendor/courier/build')
</head>
```

<a name="inline-assets"></a>
#### 인라인 에셋

경우에 따라 에셋을 외부에서 링크하지 않고, 자산의 실제 내용을 직접 포함해야 할 때가 있습니다. 예를 들어, HTML 내용을 PDF 생성기에 전달할 때 페이지에 직접 자산 내용을 삽입할 수도 있습니다. Vite에서 제공하는 `content` 메서드를 사용해 에셋의 내용을 출력할 수 있습니다:

```blade
@php
use Illuminate\Support\Facades\Vite;
@endphp

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

Vite를 실행하는 방법은 두 가지가 있습니다. 로컬 개발 시에는 `dev` 명령어로 개발 서버를 실행하면 됩니다. 개발 서버는 파일 변경을 자동으로 감지해, 열린 브라우저 창에 즉시 반영합니다.

또는, `build` 명령어로 자산을 버전 관리하며 번들링하여, 프로덕션 배포용으로 준비할 수 있습니다:

```shell
# Vite 개발 서버 실행
npm run dev

# 프로덕션 배포용 빌드 및 버전 지정
npm run build
```

[Laravel Sail](/docs/10.x/sail)을 WSL2 환경에서 개발 서버를 실행하는 경우 [추가 설정](#configuring-hmr-in-sail-on-wsl2)이 필요할 수 있습니다.

<a name="working-with-scripts"></a>
## JavaScript 다루기

<a name="aliases"></a>
### 별칭(Alias) 활용

기본적으로 라라벨 플러그인은, 여러분이 바로 생산성을 낼 수 있도록 자주 사용하는 경로에 대한 일반적인 별칭을 제공합니다:

```js
{
    '@' => '/resources/js'
}
```

이 `'@'` 별칭은 `vite.config.js` 파일에서 직접 덮어써 원하는 경로로 변경할 수 있습니다:

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

[Vue](https://vuejs.org/) 프레임워크로 프론트엔드를 개발하려면, `@vitejs/plugin-vue` 플러그인을 추가로 설치해야 합니다:

```sh
npm install --save-dev @vitejs/plugin-vue
```

그 후, 해당 플러그인을 `vite.config.js` 파일에 아래와 같이 적용합니다. 라라벨과 함께 Vue 플러그인을 사용할 때에는 몇 가지 추가 옵션 지정이 필요합니다:

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
                    // Vue 플러그인이 싱글 파일 컴포넌트(SFC) 내에서 참조된 에셋 URL을
                    // 라라벨 웹서버 기준으로 재작성합니다.
                    // base를 null로 두면, Laravel 플러그인이 대신 Vite 서버 URL로 재작성합니다.
                    base: null,

                    // Vue 플러그인은 절대 경로 URL을 실제 파일 시스템 경로로 처리하지만,
                    // false로 하면 public 디렉터리 내의 자산을 그대로 참조하게 할 수 있습니다.
                    includeAbsolute: false,
                },
            },
        }),
    ],
});
```

> [!NOTE]
> 라라벨의 [스타터 키트](/docs/10.x/starter-kits)에는 이미 Laravel, Vue, Vite가 올바르게 구성되어 있습니다. Laravel, Vue, Vite를 가장 빠르게 시작하려면 [Laravel Breeze](/docs/10.x/starter-kits#breeze-and-inertia)를 확인하세요.

<a name="react"></a>
### React

[React](https://reactjs.org/) 프레임워크로 프론트엔드를 개발하려면, `@vitejs/plugin-react` 플러그인을 추가로 설치해야 합니다:

```sh
npm install --save-dev @vitejs/plugin-react
```

그 후, 해당 플러그인을 `vite.config.js` 파일에 아래와 같이 적용합니다:

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

JSX가 포함된 파일은 `.jsx` 또는 `.tsx` 확장자로 저장해야 하며, 필요하다면 엔트리 포인트도 [위에서 안내한 대로](#configuring-vite) 수정해야 합니다.

또한, 기존의 `@vite` 디렉티브와 함께 추가로 `@viteReactRefresh` Blade 디렉티브를 포함해야 합니다.

```blade
@viteReactRefresh
@vite('resources/js/app.jsx')
```

`@viteReactRefresh` 디렉티브는 반드시 `@vite` 디렉티브 이전에 호출해야 합니다.

> [!NOTE]
> 라라벨의 [스타터 키트](/docs/10.x/starter-kits)에는 이미 Laravel, React, Vite가 올바르게 구성되어 있습니다. Laravel, React, Vite를 가장 빠르게 시작하려면 [Laravel Breeze](/docs/10.x/starter-kits#breeze-and-inertia)를 확인하세요.

<a name="inertia"></a>
### Inertia

라라벨 Vite 플러그인은 Inertia 페이지 컴포넌트 로딩을 쉽게 해주는 `resolvePageComponent` 함수를 제공합니다. 아래는 Vue 3에서의 사용 예시이지만 React 등 다른 프레임워크에서도 동일하게 활용할 수 있습니다:

```js
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

createInertiaApp({
  resolve: (name) => resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue')),
  setup({ el, App, props, plugin }) {
    return createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
});
```

> [!NOTE]
> 라라벨의 [스타터 키트](/docs/10.x/starter-kits)에는 이미 Laravel, Inertia, Vite가 올바르게 구성되어 있습니다. Laravel, Inertia, Vite를 가장 빠르게 시작하려면 [Laravel Breeze](/docs/10.x/starter-kits#breeze-and-inertia)를 확인하세요.

<a name="url-processing"></a>
### URL 처리

Vite를 사용할 때, HTML, CSS, JS에서 에셋을 참조하는 방법에는 몇 가지 주의사항이 있습니다. 첫째, **절대 경로**로 자산을 참조하면 Vite가 해당 에셋을 빌드에 포함하지 않습니다. 따라서 public 디렉터리에 해당 에셋이 존재해야 합니다.

반면, **상대 경로**로 자산을 참조하면, Vite가 경로를 다시 작성하여 버전 및 번들링 처리해줍니다. 경로는 파일 위치 기준임에 유의해야 합니다.

다음은 예시 프로젝트 구조입니다:

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

그리고, Vite가 상대/절대 경로를 처리하는 예시는 다음과 같습니다:

```html
<!-- 이 에셋은 Vite가 처리하지 않으며 빌드에 포함되지 않습니다 -->
<img src="/taylor.png" />

<!-- 이 에셋은 Vite가 재작성, 버전 관리, 번들링 처리합니다 -->
<img src="../../images/abigail.png" />
```

<a name="working-with-stylesheets"></a>
## 스타일시트 다루기

Vite의 CSS 지원에 대한 좀 더 상세한 내용은 [Vite 공식 문서](https://vitejs.dev/guide/features.html#css)에서 확인할 수 있습니다. [Tailwind](https://tailwindcss.com)처럼 PostCSS 플러그인을 사용할 경우, 프로젝트 루트에 `postcss.config.js` 파일을 생성하세요. Vite가 자동으로 적용합니다:

```js
export default {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
};
```

> [!NOTE]
> 라라벨의 [스타터 키트](/docs/10.x/starter-kits)에는 Tailwind, PostCSS, Vite 설정이 이미 모두 포함되어 있습니다. 별도의 스타터 키트 없이 Tailwind + Laravel을 사용하고 싶다면 [Tailwind의 라라벨 설치 가이드](https://tailwindcss.com/docs/guides/laravel)를 참고하세요.

<a name="working-with-blade-and-routes"></a>
## Blade 및 라우트와 함께 사용하기

<a name="blade-processing-static-assets"></a>
### Vite로 정적 에셋 처리하기

JS나 CSS에서 에셋을 참조할 때 Vite가 자산을 자동으로 처리하고, 버전까지 부여합니다. Blade 기반 애플리케이션을 빌드할 때, Blade 템플릿에서만 참조되는 정적 자산도 Vite로 처리 및 버전 관리할 수 있습니다.

이를 위해서는 해당 에셋들을 애플리케이션의 엔트리 포인트에서 import해 Vite가 인식할 수 있게 해야 합니다. 예를 들어, `resources/images` 폴더의 모든 이미지와 `resources/fonts`의 모든 폰트를 처리하려면, `resources/js/app.js` 파일에 다음을 추가하세요:

```js
import.meta.glob([
  '../images/**',
  '../fonts/**',
]);
```

이제 위 자산들은 `npm run build` 시 Vite가 모두 처리하게 됩니다. Blade 템플릿에서는 `Vite::asset` 메서드로 버전 URL을 쉽게 참조할 수 있습니다:

```blade
<img src="{{ Vite::asset('resources/images/logo.png') }}" />
```

<a name="blade-refreshing-on-save"></a>
### 저장 시 자동 새로고침

Blade 기반의 전통적인 서버 사이드 렌더링 애플리케이션에서도, 개발 중 뷰 파일을 수정하면 Vite가 자동으로 브라우저 새로고침을 수행할 수 있습니다. 가장 간단한 방법은 `refresh` 옵션을 `true`로 지정하는 것입니다.

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

`refresh` 옵션이 `true`인 경우, 아래 경로 내 파일 저장 시 개발 서버 실행 중 자동으로 전체 페이지가 새로고침됩니다:

- `app/View/Components/**`
- `lang/**`
- `resources/lang/**`
- `resources/views/**`
- `routes/**`

`routes/**` 디렉터리도 감시하는데, [Ziggy](https://github.com/tighten/ziggy)로 프론트엔드 라우트 링크 생성을 활용할 때 유용합니다.

기본 경로 이외에 다른 경로를 감시하고 싶다면, 경로 배열을 직접 지정할 수 있습니다:

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

실제로는 [vite-plugin-full-reload](https://github.com/ElMassimo/vite-plugin-full-reload) 패키지를 사용하므로, 고급 옵션이 필요하다면 config 오브젝트로 세부 설정이 가능합니다:

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
### 별칭(Alias) 활용

JavaScript에서는 자주 참조하는 디렉터리에 [별칭(alias)](#aliases)을 만드는 일이 흔합니다. Blade에서도 `Illuminate\Support\Facades\Vite` 클래스의 `macro` 메서드를 이용해 별칭을 정의할 수 있습니다. 일반적으로 "매크로"는 [서비스 프로바이더](/docs/10.x/providers)의 `boot` 메서드 내에 정의합니다:

```
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Vite::macro('image', fn (string $asset) => $this->asset("resources/images/{$asset}"));
}
```

매크로가 정의된 후에는, Blade 템플릿에서 사용할 수 있습니다. 예를 들어, 위의 `image` 매크로를 사용하면 `resources/images/logo.png` 경로의 에셋을 다음과 같이 참조할 수 있습니다:

```blade
<img src="{{ Vite::image('logo.png') }}" alt="Laravel Logo" />
```

<a name="custom-base-urls"></a>
## 커스텀 Base URL

Vite로 빌드된 에셋을 별도의 도메인(예: CDN)에서 서비스하는 경우, 애플리케이션의 `.env` 파일에 `ASSET_URL` 환경 변수를 지정해야 합니다:

```env
ASSET_URL=https://cdn.example.com
```

설정 후, 에셋의 경로는 지정한 값으로 자동으로 접두어가 붙어 출력됩니다:

```nothing
https://cdn.example.com/build/assets/app.9dce8d17.js
```

[절대 URL은 Vite가 다시 작성하지 않습니다](#url-processing). 즉, 이러한 경로에는 접두어가 적용되지 않습니다.

<a name="environment-variables"></a>
## 환경 변수

`.env` 파일에서 `VITE_`로 시작하는 환경 변수는 JavaScript 코드에 주입할 수 있습니다:

```env
VITE_SENTRY_DSN_PUBLIC=http://example.com
```

주입된 변수는 `import.meta.env` 오브젝트에서 접근할 수 있습니다:

```js
import.meta.env.VITE_SENTRY_DSN_PUBLIC
```

<a name="disabling-vite-in-tests"></a>
## 테스트에서 Vite 비활성화

테스트 실행 중에도 라라벨의 Vite 통합이 자산을 해결하려고 시도하며, 이때 Vite 개발 서버를 실행하거나 빌드된 에셋이 존재해야 합니다.

테스트에서 Vite 관련 처리를 mock(생략)하고 싶다면, 라라벨의 `TestCase` 클래스를 확장한 테스트에서 제공되는 `withoutVite` 메서드를 호출하면 됩니다:

```php
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

모든 테스트에서 항상 Vite를 비활성화하려면, 베이스 `TestCase` 클래스의 `setUp` 메서드에서 `withoutVite`를 호출하세요:

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

라라벨 Vite 플러그인을 사용하면 Vite 기반의 서버 사이드 렌더링도 손쉽게 설정 가능합니다. 먼저 `resources/js/ssr.js` 위치에 SSR 엔트리 포인트 파일을 생성한 뒤, 플러그인 설정에 해당 엔트리 포인트를 명시합니다:

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

SSR 엔트리 포인트 빌드를 잊지 않기 위해, 애플리케이션의 `package.json`의 "build" 스크립트를 다음과 같이 보강하는 방법을 권장합니다:

```json
"scripts": {
     "dev": "vite",
     "build": "vite build" // [tl! remove]
     "build": "vite build && vite build --ssr" // [tl! add]
}
```

이제 SSR 서버를 빌드 및 실행하려면 아래 명령어를 사용하세요:

```sh
npm run build
node bootstrap/ssr/ssr.js
```

[SSR을 Inertia와 함께 사용하는 경우](https://inertiajs.com/server-side-rendering), `inertia:start-ssr` Artisan 명령어로도 SSR 서버를 시작할 수 있습니다:

```sh
php artisan inertia:start-ssr
```

> [!NOTE]
> 라라벨의 [스타터 키트](/docs/10.x/starter-kits)에는 Inertia SSR 및 Vite가 올바르게 구성되어 있습니다. Laravel, Inertia SSR, Vite를 가장 빠르게 시작하려면 [Laravel Breeze](/docs/10.x/starter-kits#breeze-and-inertia)를 참고하세요.

<a name="script-and-style-attributes"></a>
## 스크립트 및 스타일 태그 속성

<a name="content-security-policy-csp-nonce"></a>
### 콘텐츠 보안 정책(CSP) Nonce

[콘텐츠 보안 정책](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)의 일부로서, 스크립트와 스타일 태그에 [`nonce` 속성](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce)을 포함하고 싶다면, 커스텀 [미들웨어](/docs/10.x/middleware)에서 `useCspNonce` 메서드로 nonce를 생성 또는 지정할 수 있습니다:

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

`useCspNonce` 메서드 호출 이후에는, 생성되는 모든 스크립트 및 스타일 태그에 자동으로 `nonce` 속성이 추가됩니다.

[Ziggy `@route` 디렉티브](https://github.com/tighten/ziggy#using-routes-with-a-content-security-policy) 등 별도의 위치에서 nonce 지정이 필요하다면, `cspNonce` 메서드로 값을 가져올 수 있습니다:

```blade
@routes(nonce: Vite::cspNonce())
```

이미 보유 중인 nonce 값을 라라벨에 지정하려면, `useCspNonce` 메서드에 해당 값을 전달하세요:

```php
Vite::useCspNonce($nonce);
```

<a name="subresource-integrity-sri"></a>
### 서브리소스 무결성(SRI)

Vite 매니페스트에 에셋별 `integrity` 해시가 포함되어 있다면, 라라벨은 자동으로 생성되는 모든 스크립트 및 스타일 태그에 `integrity` 속성을 추가하여 [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)를 적용합니다. 기본적으로 Vite는 manifest에 `integrity` 해시를 포함하지 않으나, [`vite-plugin-manifest-sri`](https://www.npmjs.com/package/vite-plugin-manifest-sri) 플러그인을 설치해 활성화할 수 있습니다:

```shell
npm install --save-dev vite-plugin-manifest-sri
```

그 후, `vite.config.js` 파일에서 해당 플러그인을 아래와 같이 적용합니다:

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

필요하다면 매니페스트에서 무결성 해시가 저장된 키명을 커스텀할 수도 있습니다:

```php
use Illuminate\Support\Facades\Vite;

Vite::useIntegrityKey('custom-integrity-key');
```

자동 감지를 완전히 비활성화하고 싶다면, `useIntegrityKey`에 `false`를 전달하세요:

```php
Vite::useIntegrityKey(false);
```

<a name="arbitrary-attributes"></a>
### 임의의 속성

`data-turbo-track` 등 추가 속성을 스크립트, 스타일 태그에 지정하고 싶을 때는, `useScriptTagAttributes`, `useStyleTagAttributes` 메서드로 지정할 수 있습니다. 보통 이런 설정은 [서비스 프로바이더](/docs/10.x/providers)에서 수행합니다:

```php
use Illuminate\Support\Facades\Vite;

Vite::useScriptTagAttributes([
    'data-turbo-track' => 'reload', // 속성에 값을 지정
    'async' => true, // 값 없는 속성 지정
    'integrity' => false, // 자동 추가될 속성은 제외
]);

Vite::useStyleTagAttributes([
    'data-turbo-track' => 'reload',
]);
```

조건부로 속성 값을 지정하고 싶다면, 콜백을 넘겨서 asset 소스 경로, URL, 매니페스트 청크 및 전체 매니페스트를 기준으로 처리할 수 있습니다:

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
> Vite 개발 서버가 동작하는 동안에는 `$chunk`, `$manifest` 인자가 `null` 값이 될 수 있습니다.

<a name="advanced-customization"></a>
## 고급 커스터마이징

기본적으로 라라벨의 Vite 플러그인은 대부분의 프로젝트에 적합하도록 합리적인 기본 설정을 제공합니다. 하지만 Vite의 동작을 추가로 조정해야 할 경우, `@vite` Blade 디렉티브 대신 다음과 같은 메서드 및 옵션으로 세밀하게 설정할 수 있습니다:

```blade
<!doctype html>
<head>
    {{-- ... --}}

    {{
        Vite::useHotFile(storage_path('vite.hot')) // "hot" 파일 경로 커스터마이즈
            ->useBuildDirectory('bundle') // 빌드 디렉터리 커스터마이즈
            ->useManifestFilename('assets.json') // 매니페스트 파일명 커스터마이즈
            ->withEntryPoints(['resources/js/app.js']) // 엔트리 포인트 지정
            ->createAssetPathsUsing(function (string $path, ?bool $secure) { // 빌드 에셋 백엔드 경로 생성 커스터마이즈
                return "https://cdn.example.com/{$path}";
            })
    }}
</head>
```

또한 `vite.config.js`에서도 동일한 커스터마이즈로 동작을 일치시켜야 합니다:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            hotFile: 'storage/vite.hot', // "hot" 파일 경로 커스터마이즈
            buildDirectory: 'bundle', // 빌드 디렉터리 커스터마이즈
            input: ['resources/js/app.js'], // 엔트리 포인트 지정
        }),
    ],
    build: {
      manifest: 'assets.json', // 매니페스트 파일명 커스터마이즈
    },
});
```

<a name="correcting-dev-server-urls"></a>
### Dev 서버 URL 수정하기

Vite 에코시스템 내 일부 플러그인들은 슬래시(`/`)로 시작하는 URL이면 Vite 개발 서버를 향한다고 가정합니다. 그러나 라라벨 통합 환경에서는 항상 그렇지 않을 수 있습니다.

예를 들어, `vite-imagetools` 플러그인은 에셋을 Vite가 서비스할 때 다음과 같은 URL을 출력합니다:

```html
<img src="/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520" />
```

이 때 플러그인은 `/@imagetools`로 시작하는 URL이 Vite에 의해 가로채진다고 기대합니다. 이러한 플러그인과 함께 사용할 때는 URL을 수동으로 수정해야 할 수 있습니다. `vite.config.js`의 `transformOnServe` 옵션을 사용하면 해결할 수 있습니다.

아래 예시처럼, 생성된 코드 내의 `/@imagetools` 부분을 dev 서버 URL로 교체할 수 있습니다:

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

이제 Vite가 에셋을 서비스하면, 아래처럼 개발 서버 주소가 붙어 출력됩니다:

```html
- <img src="/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520" /><!-- [tl! remove] -->
+ <img src="http://[::1]:5173/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520" /><!-- [tl! add] -->
```
