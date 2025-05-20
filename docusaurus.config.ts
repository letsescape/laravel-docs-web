import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Laravel',
  tagline: '라라벨',
  favicon: 'img/favicon.png',

  // Set the production url of your site here
  url: 'https://laravel.chanhyung.kim',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'letsescape', // Usually your GitHub org/user name.
  projectName: 'laravel-docs-web', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // MDX 파싱 오류를 무시하도록 설정
  markdown: {
    mdx1Compat: {
      comments: false,
      admonitions: false,
      headingIds: false,
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko'],
    // locales: ['ko', 'en'],
  },

  // 테마 설정
  themes: [],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'default',
        path: 'versioned_docs/version-12.x',
        routeBasePath: 'docs',
        sidebarPath: './versioned_sidebars/version-12.x-sidebars.json',
        // 버전 관리 설정
        includeCurrentVersion: false,
        lastVersion: '12.x',
        versions: {
          '12.x': {
            label: '12.x',
            path: '12.x',
          },
          '11.x': {
            label: '11.x',
            path: '11.x',
          },
          '10.x': {
            label: '10.x',
            path: '10.x',
          },
          '9.x': {
            label: '9.x',
            path: '9.x',
          },
          '8.x': {
            label: '8.x',
            path: '8.x',
          },
        },
        // 기타 설정
        editUrl: 'https://github.com/letsescape/laravel-docs-web/tree/main/',
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: false, // 플러그인으로 대체
        blog: false,
        gtag: {
          trackingID: 'G-P3YFWCWEBP',
          anonymizeIP: true,
        },
        googleTagManager: {
          containerId: 'GTM-MDN4L5LV',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/logo.png',

    // 다크 모드 설정
    colorMode: {
      defaultMode: 'dark',     // 기본 모드를 다크로 설정
      disableSwitch: false,    // 테마 전환 스위치 활성화
      respectPrefersColorScheme: true,  // 사용자 시스템 설정 존중
    },

    // SEO 메타데이터
    metadata: [
      {name: 'keywords', content: '라라벨, Laravel, PHP 프레임워크, 웹 개발, 한글 문서, 튜토리얼, 시작하기'},
      {name: 'description', content: '라라벨 프레임워크의 설치 방법, 기본 사용법, 주요 기능들을 한글로 쉽게 배우고 시작하세요.'},
      {property: 'og:type', content: 'website'},
      {property: 'og:title', content: '라라벨 한국어 문서 - PHP 웹 프레임워크'},
      {property: 'og:description', content: '라라벨 프레임워크의 설치 방법, 기본 사용법, 주요 기능들을 한글로 쉽게 배우고 시작하세요.'},
      {property: 'og:image', content: 'https://laravel.chanhyung.kim/img/logo.png'},
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'twitter:title', content: '라라벨 한국어 문서 - PHP 웹 프레임워크'},
      {name: 'twitter:description', content: '라라벨 프레임워크의 설치 방법, 기본 사용법, 주요 기능들을 한글로 쉽게 배우고 시작하세요.'},
      {name: 'twitter:image', content: 'https://laravel.chanhyung.kim/img/logo.png'},
    ],

    // Algolia DocSearch 설정
    algolia: {
      // The application ID provided by Algolia
      appId: 'I09J6O9PPB',
      // Public API key: it is safe to commit it
      apiKey: '9490c4a274419bf3d76145ab91c89b14',
      indexName: 'laravel-chanhyung',
      // 검색 결과 페이지 경로 설정
      searchPagePath: 'search',
      // 사용자 검색 분석 기능 활성화
      insights: true,
    },

    navbar: {
      title: null,
      logo: {
        alt: 'Laravel Logo',
        src: 'img/title_large.svg',
        srcDark: 'img/title_large.svg',
        className: 'navbar-logo',
      },
      items: [
        {
          to: '/docs/12.x',
          position: 'left',
          label: '문서',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
          dropdownItemsAfter: [],
          dropdownActiveClassDisabled: true,
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },

      ],
    },
    footer: {
      style: 'dark',
      logo: {
        alt: 'Laravel Logo',
        src: 'img/title_large.svg',
        href: '/',
        className: 'footer-logo',
      },
      links: [
        {
          title: '문서',
          items: [
            {
              label: '시작하기',
              to: '/docs/12.x/intro',
            },
            {
              label: '아키텍처 개념',
              to: '/docs/12.x/architecture/container',
            },
          ],
        },
        {
          title: '커뮤니티',
          items: [
            {
              label: 'Laravel Korea',
              href: 'https://laravel.kr',
            },
          ],
        },
        {
          title: '더 보기',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/letsescape/laravel-docs-web',
            },
          ],
        },
      ],
      copyright: `Copyright © 2025 kimchanhyung98. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
