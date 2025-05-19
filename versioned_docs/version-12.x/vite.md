# 에셋 번들링, Vite (Asset Bundling (Vite))

- [소개](#introduction)
- [설치 및 환경 설정](#installation)
  - [Node 설치](#installing-node)
  - [Vite 및 라라벨 플러그인 설치](#installing-vite-and-laravel-plugin)
  - [Vite 설정](#configuring-vite)
  - [스크립트 및 스타일 불러오기](#loading-your-scripts-and-styles)
- [Vite 실행](#running-vite)
- [자바스크립트 활용](#working-with-scripts)
  - [별칭(Alias) 사용](#aliases)
  - [Vue](#vue)
  - [React](#react)
  - [Inertia](#inertia)
  - [URL 처리](#url-processing)
- [스타일시트 활용](#working-with-stylesheets)
- [Blade 및 라우트와의 연동](#working-with-blade-and-routes)
  - [Vite로 정적 에셋 처리하기](#blade-processing-static-assets)
  - [저장 시 새로고침](#blade-refreshing-on-save)
  - [별칭(Alias) 사용](#blade-aliases)
- [에셋 사전 로드(prefetching)](#asset-prefetching)
- [커스텀 Base URL](#custom-base-urls)
- [환경 변수](#environment-variables)
- [테스트 환경에서 Vite 비활성화](#disabling-vite-in-tests)
- [서버 사이드 렌더링(SSR)](#ssr)
- [스크립트 및 스타일 태그 속성](#script-and-style-attributes)
  - [Content Security Policy (CSP) Nonce](#content-security-policy-csp-nonce)
  - [Subresource Integrity (SRI)](#subresource-integrity-sri)
  - [임의 속성 추가](#arbitrary-attributes)
- [고급 커스터마이징](#advanced-customization)
  - [개발 서버 CORS 설정](#cors)
  - [개발 서버 URL 수정](#correcting-dev-server-urls)

<a name="introduction"></a>
## 소개

[Vite](https://vitejs.dev)는 매우 빠른 개발 환경을 제공하고, 코드를 프로덕션용으로 번들링해주는 최신 프론트엔드 빌드 도구입니다. 라라벨로 애플리케이션을 개발할 때 일반적으로 Vite를 활용하여 애플리케이션의 CSS, 자바스크립트 파일을 프로덕션 환경에 적합한 에셋으로 번들링합니다.

라라벨은 공식 플러그인과 Blade 디렉티브를 통해 개발 환경과 배포 환경 모두에서 에셋을 로드할 수 있도록 Vite와 완벽하게 통합되어 있습니다.

> [!NOTE]
> 기존에 Laravel Mix를 사용하고 계신가요? 최신 라라벨 설치본에서는 Vite가 Laravel Mix를 대체합니다. Mix 관련 문서는 [Laravel Mix](https://laravel-mix.com/) 웹사이트에서 확인할 수 있습니다. Vite로 전환하고 싶다면 [마이그레이션 가이드](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-laravel-mix-to-vite)를 참고하세요.

<a name="vite-or-mix"></a>
#### Vite와 Laravel Mix 중 선택하기

라라벨의 이전 버전 애플리케이션에서는 에셋 번들링 시 [Mix](https://laravel-mix.com/)를 활용했습니다. Mix는 [webpack](https://webpack.js.org/) 기반으로 동작합니다. Vite는 더욱 빠르고 생산적인 리치 자바스크립트 애플리케이션 개발 경험을 제공합니다. SPA(Single Page Application) 개발, 특히 [Inertia](https://inertiajs.com) 같은 도구를 사용할 때 Vite가 뛰어난 선택이 될 것입니다.

또한, Vite는 [Livewire](https://livewire.laravel.com) 등 자바스크립트가 부분적으로 사용되는 전통적인 서버 사이드 렌더링 애플리케이션에서도 문제없이 동작합니다. 다만, Laravel Mix처럼 자바스크립트에서 직접 참조하지 않는 임의의 에셋 파일을 빌드 결과물에 복사하는 기능 등 일부 기능은 지원하지 않습니다.

<a name="migrating-back-to-mix"></a>
#### Mix로 다시 마이그레이션하기

Vite를 적용하여 새로 구축한 라라벨 애플리케이션을 다시 Laravel Mix와 webpack을 사용하도록 변경해야 하나요? 걱정하지 마세요. [Vite에서 Mix로 이전하는 공식 가이드](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-vite-to-laravel-mix)를 참고하세요.

<a name="installation"></a>
## 설치 및 환경 설정

> [!NOTE]
> 아래 문서는 라라벨 Vite 플러그인을 수동으로 설치 및 설정하는 방법을 안내합니다. 하지만 라라벨의 [스타터 키트](/docs/12.x/starter-kits)에는 이미 이 모든 설정이 포함되어 있어 Vite와 함께 신속하게 시작할 수 있습니다.

<a name="installing-node"></a>
### Node 설치

Vite 및 라라벨 플러그인을 실행하기 위해서는 반드시 Node.js(16 버전 이상)와 NPM이 설치되어 있어야 합니다.

```shell
node -v
npm -v
```

가장 간단하게는 [Node 공식 웹사이트](https://nodejs.org/en/download/)에서 제공하는 그래픽 설치 프로그램을 통해 Node와 NPM 최신 버전을 설치할 수 있습니다. 만약 [Laravel Sail](https://laravel.com/docs/12.x/sail)을 사용하고 있다면, Sail을 이용해 Node와 NPM을 호출할 수 있습니다.

```shell
./vendor/bin/sail node -v
./vendor/bin/sail npm -v
```

<a name="installing-vite-and-laravel-plugin"></a>
### Vite 및 라라벨 플러그인 설치

라라벨을 새로 설치한 경우, 애플리케이션의 루트 디렉터리에 이미 `package.json` 파일이 포함되어 있습니다. 기본 `package.json`에는 Vite와 라라벨 플러그인을 사용하기 위한 모든 설정이 포함되어 있습니다. 프론트엔드 의존성은 NPM을 통해 설치할 수 있습니다.

```shell
npm install
```

<a name="configuring-vite"></a>
### Vite 설정

Vite는 프로젝트 루트의 `vite.config.js` 파일을 통해 설정합니다. 필요에 따라 이 파일을 자유롭게 커스터마이즈할 수 있으며, 예를 들어 `@vitejs/plugin-vue` 또는 `@vitejs/plugin-react` 등 애플리케이션에 필요한 추가 플러그인도 설치할 수 있습니다.

라라벨 Vite 플러그인은 애플리케이션의 진입점(entry point)을 명시해주어야 합니다. 진입점은 JavaScript, CSS 파일 모두 가능하며, TypeScript, JSX, TSX, Sass 등으로 작성된 파일도 사용할 수 있습니다.

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

만약 Inertia 등으로 SPA를 구축한다면, CSS 진입점 없이 Vite를 사용하는 것이 가장 좋습니다.

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

SPA에서는 CSS를 별도의 진입점으로 추가하는 대신, 자바스크립트 파일을 통해 CSS를 임포트해야 합니다. 보통 애플리케이션의 `resources/js/app.js` 파일에서 아래와 같이 작성합니다.

```js
import './bootstrap';
import '../css/app.css'; // [tl! add]
```

라라벨 플러그인은 여러 진입점이나 SSR(서버 사이드 렌더링) 진입점 등 고급 설정도 지원합니다. [SSR 진입점](#ssr)도 참고하세요.

<a name="working-with-a-secure-development-server"></a>
#### HTTPS 개발 서버 사용하기

로컬 개발 웹 서버에서 HTTPS를 통해 애플리케이션을 서비스하는 경우, Vite 개발 서버와의 연결 문제를 만날 수 있습니다.

[Laravel Herd](https://herd.laravel.com)에서 사이트를 HTTPS로 보호하거나, [Laravel Valet](/docs/12.x/valet)에서 [secure 명령어](/docs/12.x/valet#securing-sites)로 사이트를 보호한 경우, 라라벨 Vite 플러그인은 자동으로 생성된 TLS 인증서를 인식하여 사용합니다.

사이트를 애플리케이션 디렉터리명과 일치하지 않는 호스트로 보안 설정한 경우, 애플리케이션의 `vite.config.js`에서 호스트를 직접 지정할 수도 있습니다.

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

이외의 웹 서버를 사용할 경우, 신뢰할 수 있는 인증서를 직접 생성한 뒤, 아래와 같이 Vite에 수동으로 인증서 경로를 지정해야 합니다.

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

만약 시스템에서 신뢰할 수 있는 인증서를 생성할 수 없다면, [@vitejs/plugin-basic-ssl 플러그인](https://github.com/vitejs/vite-plugin-basic-ssl)을 설치해 구성할 수 있습니다. 신뢰되지 않는 인증서로 개발 서버를 실행하면, 브라우저에서 인증서 경고가 표시되며, `npm run dev` 명령 실행 시 콘솔에 등장하는 "Local" 링크를 통해 개발 서버에 직접 접속해 인증서 경고를 허용해야 합니다.

<a name="configuring-hmr-in-sail-on-wsl2"></a>
#### WSL2 환경에서 Sail로 개발 서버 실행하기

[Laravel Sail](/docs/12.x/sail) 환경을 Windows Subsystem for Linux 2(WSL2)에서 사용하여 Vite 개발 서버를 실행하는 경우, 브라우저가 개발 서버에 정상적으로 연결될 수 있도록 `vite.config.js`에 아래 설정을 추가해야 합니다.

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

개발 도중 파일 변경사항이 브라우저에 반영되지 않는다면, Vite의 [server.watch.usePolling 옵션](https://vitejs.dev/config/server-options.html#server-watch)도 추가로 설정이 필요할 수 있습니다.

<a name="loading-your-scripts-and-styles"></a>
### 스크립트 및 스타일 불러오기

Vite의 진입점 설정을 마쳤으면, 이제 애플리케이션의 루트 템플릿 `<head>`에 `@vite()` Blade 디렉티브로 진입점을 참조할 수 있습니다.

```blade
<!DOCTYPE html>
<head>
    {{-- ... --}}

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
```

만약 CSS를 자바스크립트에서 임포트하고 있다면, 자바스크립트 진입점만 포함하면 됩니다.

```blade
<!DOCTYPE html>
<head>
    {{-- ... --}}

    @vite('resources/js/app.js')
</head>
```

`@vite` 디렉티브는 Vite 개발 서버를 자동으로 감지해서 Hot Module Replacement(HMR)가 가능하도록 Vite 클라이언트를 inject합니다. 빌드 모드에서는 컴파일 및 버전이 적용된 에셋, 그리고 JS에서 임포트된 CSS까지 모두 불러옵니다.

필요하다면, `@vite` 디렉티브에 빌드 결과물이 저장된 경로를 직접 지정할 수도 있습니다.

```blade
<!doctype html>
<head>
    {{-- 주어진 빌드 경로는 public 경로를 기준으로 상대적입니다. --}}

    @vite('resources/js/app.js', 'vendor/courier/build')
</head>
```

<a name="inline-assets"></a>
#### 인라인 에셋 포함하기

경우에 따라, 에셋 파일의 버전 URL을 링크로 추가하는 대신 실제 에셋의 내용을 직접 삽입해야 할 수도 있습니다. 예를 들어, PDF 생성기 등에 HTML을 전달할 때 에셋 내용을 페이지 내부에 직접 포함할 수 있습니다. 이때는 `Vite` 파사드의 `content` 메서드를 사용하면 Vite 에셋의 파일 내용을 출력할 수 있습니다.

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

Vite를 실행하는 방법은 두 가지가 있습니다. 개발 중에는 `dev` 명령어로 개발 서버를 실행할 수 있습니다. 이 모드에서는 파일이 변경될 때마다 브라우저에 즉시 반영됩니다.

배포를 준비할 때는 `build` 명령어를 실행하여 에셋을 번들링하고 버전 정보를 추가해 배포 파일을 생성할 수 있습니다.

```shell
# Vite 개발 서버 실행...
npm run dev

# 프로덕션용 에셋 번들 및 버전 적용 빌드...
npm run build
```

[Laravel Sail](/docs/12.x/sail) 환경의 WSL2에서 개발 서버를 실행할 경우, 추가 설정([상세 내용](#configuring-hmr-in-sail-on-wsl2))이 필요할 수 있습니다.

<a name="working-with-scripts"></a>
## 자바스크립트 활용

<a name="aliases"></a>
### 별칭(Alias) 사용

라라벨 플러그인은 자주 사용하는 프로젝트 경로를 쉽고 빠르게 임포트할 수 있도록 기본적인 별칭(alias)을 제공합니다.

```js
{
    '@' => '/resources/js'
}
```

별칭 `'@'`은 프로젝트에 맞도록 `vite.config.js`에서 직접 덮어쓸 수 있습니다.

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

[Vue](https://vuejs.org/) 프레임워크로 프론트엔드를 개발하려면, `@vitejs/plugin-vue` 플러그인을 추가 설치해야 합니다.

```shell
npm install --save-dev @vitejs/plugin-vue
```

설치 후, 아래와 같이 `vite.config.js`에 플러그인을 포함할 수 있습니다. 라라벨과 함께 Vue 플러그인을 사용할 때는 추가적인 옵션도 함께 설정해 주어야 합니다.

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
                    // Vue 플러그인은 싱글 파일 컴포넌트에서 사용하는 에셋 URL을
                    // 라라벨 웹 서버를 가리키도록 재작성합니다. base를 null로 설정하면
                    // Vite 서버가 URL을 재작성하도록 라라벨 플러그인에 일임합니다.
                    base: null,

                    // Vue 플러그인은 절대 경로를 실제 파일의 경로로 인식합니다.
                    // false로 설정하면 public 디렉터리 내부 에셋을 가리키는
                    // 절대 URL이 그대로 유지됩니다.
                    includeAbsolute: false,
                },
            },
        }),
    ],
});
```

> [!NOTE]
> 라라벨의 [스타터 키트](/docs/12.x/starter-kits)에는 라라벨, Vue, Vite가 올바르게 설정되어 있으므로, Vue와 Vite를 가장 빠르게 도입할 수 있습니다.

<a name="react"></a>
### React

[React](https://reactjs.org/) 프레임워크로 프론트엔드를 개발하려면 `@vitejs/plugin-react` 플러그인을 추가 설치해야 합니다.

```shell
npm install --save-dev @vitejs/plugin-react
```

설치 후, `vite.config.js`에서 다음과 같이 플러그인을 불러올 수 있습니다.

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

JSX가 포함된 파일의 확장자가 `.jsx` 또는 `.tsx`임을 확인해야 하며, 진입점 파일 경로도 [위 설정](#configuring-vite)대로 맞게 수정해야 합니다.

또한 기존의 `@vite` Blade 디렉티브와 함께 `@viteReactRefresh` Blade 디렉티브도 추가해야 합니다.

```blade
@viteReactRefresh
@vite('resources/js/app.jsx')
```

`@viteReactRefresh` 디렉티브는 반드시 `@vite` 디렉티브보다 먼저 호출되어야 합니다.

> [!NOTE]
> 라라벨의 [스타터 키트](/docs/12.x/starter-kits)에는 라라벨, React, Vite에 필요한 모든 설정이 포함되어 있어 React와 Vite를 쉽게 도입할 수 있습니다.

<a name="inertia"></a>
### Inertia

라라벨 Vite 플러그인은 Inertia 페이지 컴포넌트를 쉽게 연결할 수 있도록 `resolvePageComponent` 함수를 제공합니다. 아래는 Vue 3과 함께 사용하는 예시이지만, React 등 다른 프레임워크에서도 동일하게 활용할 수 있습니다.

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

Inertia와 함께 Vite의 코드 분할(code splitting) 기능을 사용할 경우, [에셋 사전 로드(prefetching)](#asset-prefetching) 구성을 권장합니다.

> [!NOTE]
> 라라벨의 [스타터 키트](/docs/12.x/starter-kits)에는 라라벨, Inertia, Vite 설정이 모두 포함되어 있으므로, Inertia와 Vite를 가장 빠르게 시작할 수 있습니다.

<a name="url-processing"></a>
### URL 처리

Vite를 사용하면서 애플리케이션의 HTML, CSS, JS 파일에서 에셋을 참조할 때 몇 가지 주의사항이 있습니다. 먼저, 에셋을 절대 경로로 참조하면 Vite는 해당 파일을 빌드 과정에 포함하지 않으므로 반드시 public 디렉터리에 파일이 존재해야 합니다. [별도의 CSS 진입점](#configuring-vite)을 사용하는 경우에는 절대 경로 사용을 피해야 합니다. 개발 중에는 CSS가 Vite 개발 서버에서 서비스되기 때문에, 브라우저가 public 디렉터리 대신 Vite 서버에서 해당 경로를 찾으려고 시도할 수 있습니다.

상대 경로로 에셋을 참조할 때는 참조하는 파일의 위치를 기준으로 경로가 지정된다는 점을 기억하세요. 이런 식으로 임포트된 에셋들은 Vite가 알아서 경로를 재작성하고 버전 정보를 추가해 번들링합니다.

아래는 예시 프로젝트 구조입니다.

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

다음 예제를 통해 Vite가 상대 경로와 절대 경로를 어떻게 처리하는지 살펴볼 수 있습니다.

```html
<!-- 이 에셋은 Vite가 처리하지 않으며 빌드에도 포함되지 않습니다. -->
<img src="/taylor.png" />

<!-- 이 에셋은 Vite가 경로를 재작성, 버전 부여, 번들링합니다. -->
<img src="../../images/abigail.png" />
```

<a name="working-with-stylesheets"></a>
## 스타일시트 활용

> [!NOTE]
> 라라벨의 [스타터 키트](/docs/12.x/starter-kits)에는 Tailwind와 Vite 설정이 포함되어 있습니다. 별도의 스타터 키트를 사용하지 않고 라라벨과 Tailwind를 도입하고 싶다면, [Tailwind의 라라벨 설치 가이드](https://tailwindcss.com/docs/guides/laravel)를 참고하세요.

모든 라라벨 애플리케이션에는 이미 Tailwind와 적절히 구성된 `vite.config.js`가 포함되어 있습니다. 따라서 Vite 개발 서버를 실행하거나, `dev` Composer 명령어로 라라벨 및 Vite 개발 서버를 동시에 시작하면 됩니다.

```shell
composer run dev
```

애플리케이션 CSS 파일은 `resources/css/app.css`에 위치할 수 있습니다.

<a name="working-with-blade-and-routes"></a>
## Blade 및 라우트와의 연동

<a name="blade-processing-static-assets"></a>
### Vite로 정적 에셋 처리하기

자바스크립트나 CSS에서 에셋을 참조할 때, Vite는 해당 에셋 파일을 자동으로 번들링하고 버전 정보를 추가합니다. 또한, Blade 기반 애플리케이션을 빌드할 때도, Blade 템플릿에서만 사용하는 정적 에셋 역시 Vite가 처리할 수 있습니다.

이를 위해서는 Vite가 해당 에셋의 존재를 알아야 하므로, 애플리케이션 진입점 파일에서 정적 에셋을 import 방식으로 불러와야 합니다. 예를 들어, `resources/images`에 저장된 이미지와 `resources/fonts`에 저장된 폰트 파일을 모두 처리하고 싶다면, `resources/js/app.js` 진입점에 아래와 같이 추가하면 됩니다.

```js
import.meta.glob([
  '../images/**',
  '../fonts/**',
]);
```

이제 `npm run build`를 실행할 때 위 경로의 에셋도 Vite가 처리합니다. Blade에서는 `Vite::asset` 메서드를 이용해 가공된 에셋의 버전 URL을 받아올 수 있습니다.

```blade
<img src="{{ Vite::asset('resources/images/logo.png') }}" />
```

<a name="blade-refreshing-on-save"></a>
### 저장 시 새로고침

Blade를 활용한 전통적인 서버 사이드 렌더링 애플리케이션에서는, 개발 중 뷰 파일을 수정하면 Vite가 브라우저를 자동으로 새로고침하여 개발 효율을 높입니다. 이를 사용하려면 `refresh` 옵션을 `true`로 설정하면 됩니다.

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

`refresh` 옵션이 `true`로 설정된 경우, 아래 디렉터리 내의 파일을 저장하면 `npm run dev` 실행 중 브라우저가 전체 새로고침 됩니다.

- `app/Livewire/**`
- `app/View/Components/**`
- `lang/**`
- `resources/lang/**`
- `resources/views/**`
- `routes/**`

[Ziggy](https://github.com/tighten/ziggy) 등으로 프론트엔드에서 라우트 링크를 생성할 경우, `routes/**` 디렉터리도 함께 감시(watch)하면 편리합니다.

기본 감시 경로가 맞지 않는 경우, 직접 감시할 경로 리스트를 지정할 수도 있습니다.

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

실제로 라라벨 Vite 플러그인은 [vite-plugin-full-reload](https://github.com/ElMassimo/vite-plugin-full-reload) 패키지를 내부적으로 사용하며, 고급 커스터마이징이 필요한 경우 다음과 같이 `config` 옵션을 추가할 수도 있습니다.

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
### 별칭(Alias) 사용

자바스크립트 애플리케이션에서 [별칭을 구성](#aliases)하여 자주 참조할 디렉터리를 짧게 사용할 수 있듯, Blade에서도 `Illuminate\Support\Facades\Vite` 클래스의 `macro` 메서드로 별칭을 정의할 수 있습니다. 보통 "매크로"는 [서비스 프로바이더](/docs/12.x/providers)의 `boot` 메서드에서 정의합니다.

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Vite::macro('image', fn (string $asset) => $this->asset("resources/images/{$asset}"));
}
```

매크로를 정의한 후에는, Blade 템플릿에서 아래와 같이 사용할 수 있습니다. 예를 들어 앞서 정의한 `image` 매크로로 `resources/images/logo.png` 경로의 에셋을 참조할 수 있습니다.

```blade
<img src="{{ Vite::image('logo.png') }}" alt="Laravel Logo" />
```

<a name="asset-prefetching"></a>

## 에셋 프리페칭(Asset Prefetching)

Vite의 코드 분할 기능을 활용해 SPA를 구축할 때, 필요한 에셋(자바스크립트, CSS 등)은 페이지를 이동할 때마다 네트워크를 통해 불러오게 됩니다. 이런 동작은 UI 렌더링이 지연되는 현상으로 이어질 수 있습니다. 만약 여러분이 사용하는 프론트엔드 프레임워크에서 이 부분이 문제가 된다면, 라라벨에서는 초기 페이지 로드 시에 애플리케이션의 자바스크립트와 CSS 에셋을 미리(preemptively) 프리페칭할 수 있는 기능을 제공합니다.

에셋을 미리 프리페칭하려면, [서비스 프로바이더](/docs/12.x/providers)의 `boot` 메서드에서 `Vite::prefetch` 메서드를 호출하면 됩니다.

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

위 예시에서는 각 페이지가 로드될 때 에셋이 최대 `3`개의 동시 다운로드로 프리페칭됩니다. 애플리케이션의 상황에 맞게 동시성(concurrency)을 조절할 수도 있고, 만약 모든 에셋을 한 번에 다운로드하고 싶다면 동시성 제한 없이 사용할 수도 있습니다.

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Vite::prefetch();
}
```

기본적으로 프리페칭은 [page _load_ 이벤트](https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event)가 발생할 때 시작합니다. 만약 프리페칭이 시작되는 시점을 직접 제어하고 싶다면, Vite가 감지할 이벤트 이름을 지정할 수도 있습니다.

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Vite::prefetch(event: 'vite:prefetch');
}
```

위와 같이 설정하면, 이제 `window` 객체에서 `vite:prefetch` 이벤트를 수동으로 디스패치할 때 프리페칭이 시작됩니다. 예를 들어, 페이지가 로드된 후 3초 뒤에 프리페칭이 시작되도록 구현할 수도 있습니다.

```html
<script>
    addEventListener('load', () => setTimeout(() => {
        dispatchEvent(new Event('vite:prefetch'))
    }, 3000))
</script>
```

<a name="custom-base-urls"></a>
## 커스텀 베이스 URL(Custom Base URLs)

Vite로 빌드한 에셋을 CDN 등 애플리케이션과 별도의 도메인으로 배포하는 경우에는, 애플리케이션의 `.env` 파일에 `ASSET_URL` 환경 변수를 설정해주어야 합니다.

```env
ASSET_URL=https://cdn.example.com
```

에셋 URL을 설정하고 나면, 모든 에셋의 재작성된 URL 앞에 지정한 값이 접두어로 붙게 됩니다.

```text
https://cdn.example.com/build/assets/app.9dce8d17.js
```

[Vite의 URL 처리 규칙](#url-processing)에 따라, 절대 경로(absolute URL)는 재작성되지 않으므로 접두어가 붙지 않음에 유의하세요.

<a name="environment-variables"></a>
## 환경 변수(Environment Variables)

애플리케이션의 `.env` 파일에서 환경 변수명 앞에 `VITE_`를 붙이면 해당 환경변수를 자바스크립트 내에서 사용할 수 있게 됩니다.

```env
VITE_SENTRY_DSN_PUBLIC=http://example.com
```

자바스크립트에서는 `import.meta.env` 객체를 통해 주입된 환경 변수를 접근할 수 있습니다.

```js
import.meta.env.VITE_SENTRY_DSN_PUBLIC
```

<a name="disabling-vite-in-tests"></a>
## 테스트에서 Vite 비활성화(Disabling Vite in Tests)

라라벨의 Vite 통합은 테스트가 실행되는 동안에도 에셋을 불러오려고 시도합니다. 이때 Vite 개발 서버를 실행하거나 에셋을 빌드해 두어야 합니다.

테스트에서 Vite를 실제로 사용하지 않고 모킹(mocking)하고 싶다면, 라라벨의 `TestCase` 클래스를 상속받는 모든 테스트에서 사용할 수 있는 `withoutVite` 메서드를 호출하면 됩니다.

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
## 서버 사이드 렌더링(SSR, Server-Side Rendering)

라라벨 Vite 플러그인은 Vite 기반의 서버 사이드 렌더링 환경을 매우 쉽게 구성할 수 있도록 지원합니다. 먼저, `resources/js/ssr.js`에 SSR 엔트리 포인트를 생성하고, 아래와 같이 라라벨 플러그인 옵션에 엔트리 포인트를 지정해줍니다.

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

SSR 엔트리 포인트 빌드를 누락하는 일이 없도록, 애플리케이션의 `package.json`의 "build" 스크립트를 아래와 같이 수정하는 것을 권장합니다.

```json
"scripts": {
     "dev": "vite",
     "build": "vite build" // [tl! remove]
     "build": "vite build && vite build --ssr" // [tl! add]
}
```

이제 SSR 서버를 빌드/실행하려면 다음 명령어를 실행하세요.

```shell
npm run build
node bootstrap/ssr/ssr.js
```

[Inertia와 함께하는 SSR](https://inertiajs.com/server-side-rendering)을 사용하는 경우, 다음 Artisan 명령어로 SSR 서버를 실행할 수 있습니다.

```shell
php artisan inertia:start-ssr
```

> [!NOTE]
> 라라벨의 [스타터 킷](/docs/12.x/starter-kits)은 이미 라라벨, Inertia SSR, Vite에 필요한 구성이 포함되어 있습니다. 이 스타터 킷들을 활용하면 라라벨, Inertia SSR, Vite로 가장 빠르게 시작할 수 있습니다.

<a name="script-and-style-attributes"></a>
## Script 및 Style 태그 속성

<a name="content-security-policy-csp-nonce"></a>
### Content Security Policy(CSP) Nonce

[Content Security Policy(CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)의 일환으로 스크립트 및 스타일 태그에 [nonce 속성](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce)을 포함하고 싶다면, 커스텀 [미들웨어](/docs/12.x/middleware) 내에서 `useCspNonce` 메서드를 호출해 nonce 값을 생성하거나 지정할 수 있습니다.

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

`useCspNonce`를 호출하면, 라라벨은 자동으로 생성된 모든 스크립트 및 스타일 태그에 `nonce` 속성을 부여합니다.

다른 곳(예: [Ziggy의 `@route` 디렉티브](https://github.com/tighten/ziggy#using-routes-with-a-content-security-policy) 등)에서 nonce 값을 다시 사용해야 할 경우, `cspNonce` 메서드를 호출해 값을 가져올 수 있습니다.

```blade
@routes(nonce: Vite::cspNonce())
```

이미 존재하는 nonce 값이 있다면, `useCspNonce` 호출 시 해당 값을 직접 전달할 수도 있습니다.

```php
Vite::useCspNonce($nonce);
```

<a name="subresource-integrity-sri"></a>
### 서브리소스 무결성(Subresource Integrity, SRI)

Vite 매니페스트에 에셋의 `integrity` 해시가 포함되어 있다면, 라라벨은 자동으로 생성된 모든 스크립트와 스타일 태그에 [`integrity` 속성](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)을 추가합니다. 보안상 유용한 옵션입니다. 기본적으로 Vite는 매니페스트에 해시 값을 포함하지 않지만, [vite-plugin-manifest-sri](https://www.npmjs.com/package/vite-plugin-manifest-sri) NPM 플러그인을 설치해 활성화할 수 있습니다.

```shell
npm install --save-dev vite-plugin-manifest-sri
```

이제 `vite.config.js` 파일에 플러그인을 다음과 같이 포함합니다.

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

필요하다면 무결성 해시가 저장되는 매니페스트의 키 값을 커스텀 지정할 수도 있습니다.

```php
use Illuminate\Support\Facades\Vite;

Vite::useIntegrityKey('custom-integrity-key');
```

이 자동 감지 기능을 비활성화하고 싶다면, `useIntegrityKey`에 `false`를 지정하면 됩니다.

```php
Vite::useIntegrityKey(false);
```

<a name="arbitrary-attributes"></a>
### 임의의 속성(Arbitrary Attributes)

script와 style 태그에 [data-turbo-track](https://turbo.hotwired.dev/handbook/drive#reloading-when-assets-change) 등 임의의 속성을 추가하고 싶은 경우, `useScriptTagAttributes` 및 `useStyleTagAttributes` 메서드를 이용할 수 있습니다. 보통 이 메서드는 [서비스 프로바이더](/docs/12.x/providers)에서 호출합니다.

```php
use Illuminate\Support\Facades\Vite;

Vite::useScriptTagAttributes([
    'data-turbo-track' => 'reload', // 속성에 값을 지정하는 방식...
    'async' => true, // 값 없는 속성(플래그)을 지정하는 방식...
    'integrity' => false, // 기본적으로 포함되는 속성을 제외하는 방식...
]);

Vite::useStyleTagAttributes([
    'data-turbo-track' => 'reload',
]);
```

조건에 따라 속성을 추가하고 싶다면, 콜백 함수를 지정할 수 있습니다. 콜백에는 에셋 소스 경로, URL, 매니페스트의 청크 정보, 전체 매니페스트가 인자로 전달됩니다.

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
> Vite 개발 서버가 실행 중일 때는 `$chunk`와 `$manifest` 인수가 `null`입니다.

<a name="advanced-customization"></a>
## 고급 커스터마이징(Advanced Customization)

라라벨의 Vite 플러그인은 기본적으로 대부분의 애플리케이션에서 충분한 설정값을 제공합니다. 하지만, 때로는 특정 요구에 맞게 동작을 커스터마이징해야 할 때도 있습니다. `@vite` Blade 디렉티브를 대체할 수 있는 다음 메서드/옵션으로 맞춤 설정이 가능합니다.

```blade
<!doctype html>
<head>
    {{-- ... --}}

    {{
        Vite::useHotFile(storage_path('vite.hot')) // "hot" 파일 경로 커스터마이즈...
            ->useBuildDirectory('bundle') // 빌드 디렉터리 경로 커스터마이즈...
            ->useManifestFilename('assets.json') // 매니페스트 파일명 커스터마이즈...
            ->withEntryPoints(['resources/js/app.js']) // 엔트리 포인트 명시...
            ->createAssetPathsUsing(function (string $path, ?bool $secure) { // 빌드된 에셋의 백엔드 경로 생성 커스터마이즈...
                return "https://cdn.example.com/{$path}";
            })
    }}
</head>
```

그리고 `vite.config.js` 파일에도 동일한 설정을 맞춰주어야 합니다.

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            hotFile: 'storage/vite.hot', // "hot" 파일 경로 커스터마이즈...
            buildDirectory: 'bundle', // 빌드 디렉터리 경로 커스터마이즈...
            input: ['resources/js/app.js'], // 엔트리 포인트 명시...
        }),
    ],
    build: {
      manifest: 'assets.json', // 매니페스트 파일명 커스터마이즈...
    },
});
```

<a name="cors"></a>
### 개발 서버 CORS(Cross-Origin Resource Sharing)

Vite 개발 서버에서 에셋을 불러오는 과정에서 브라우저의 Cross-Origin Resource Sharing(CORS) 이슈가 발생할 수 있습니다. 라라벨 플러그인과 함께 사용할 때, 다음 오리진(origin)은 별도의 설정 없이 자동 허용됩니다.

- `::1`
- `127.0.0.1`
- `localhost`
- `*.test`
- `*.localhost`
- 프로젝트 `.env`의 `APP_URL`

프로젝트별로 커스텀 오리진을 허용하는 가장 쉬운 방법은, 애플리케이션의 `APP_URL` 환경 변수 값을 실제 브라우저에서 접속하는 오리진과 맞추는 것입니다. 예를 들어, 여러분이 `https://my-app.laravel`에서 접속중이라면, `.env`에 다음과 같이 설정해야 합니다.

```env
APP_URL=https://my-app.laravel
```

여러 오리진을 지원하거나 좀 더 세밀한 제어가 필요하다면 [Vite의 CORS 서버 옵션](https://vite.dev/config/server-options.html#server-cors)을 활용하면 됩니다. 예를 들어, 프로젝트의 `vite.config.js`에서 `server.cors.origin` 옵션으로 여러 오리진을 배열로 지정할 수 있습니다.

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

정규식 패턴도 사용할 수 있기 때문에, `*.laravel`과 같이 특정 최상위 도메인 전체를 허용할 때 유용합니다.

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
                // 지원되는 예시: SCHEME://DOMAIN.laravel[:PORT] [tl! add]
                /^https?:\/\/.*\.laravel(:\d+)?$/, //[tl! add]
            ], // [tl! add]
        }, // [tl! add]
    }, // [tl! add]
});
```

<a name="correcting-dev-server-urls"></a>
### 개발 서버 URL 교정(Correcting Dev Server URLs)

Vite 에코시스템의 일부 플러그인은, `/`로 시작하는 URL이 항상 Vite 개발 서버를 가리킨다고 가정합니다. 하지만 라라벨과 통합된 경우, 이런 URL이 항상 개발 서버로 연결되는 것은 아닙니다.

예를 들어, `vite-imagetools` 플러그인은 Vite가 에셋을 제공할 때 아래와 같은 URL을 출력합니다.

```html
<img src="/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520" />
```

`vite-imagetools`는 해당 URL이 Vite 서버에서 가로채어져 `/@imagetools`로 시작하는 경로를 직접 처리하기를 기대합니다. 이런 플러그인과 함께 사용하는 경우, URL을 직접 교정해줄 필요가 있습니다. 이를 위해 `vite.config.js`에서 `transformOnServe` 옵션을 사용할 수 있습니다.

아래 예시에서는, 생성된 코드 내 `/@imagetools`가 항상 개발 서버 쪽 URL로 시작하도록 변환해줍니다.

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

이렇게 하면 Vite가 에셋을 제공할 때 항상 개발 서버를 가리키는 URL로 출력됩니다.

```html
- <img src="/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520" /><!-- [tl! remove] -->
+ <img src="http://[::1]:5173/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520" /><!-- [tl! add] -->
```