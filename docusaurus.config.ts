import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Laravel 한국어 문서',
  tagline: 'PHP 웹 애플리케이션 프레임워크',
  favicon: 'img/favicon.ico',

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
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/laravel-social-card.jpg',

    // Algolia DocSearch 설정
    algolia: {
      // The application ID provided by Algolia
      appId: 'P3AV656TKT',
      // Public API key: it is safe to commit it
      apiKey: '36cb770af37e1af6373a80778092f985',
      indexName: 'laravel-chanhyung',
      // 검색 결과 페이지 경로 설정
      searchPagePath: 'search',
      // 사용자 검색 분석 기능 활성화
      insights: true,
    },

    navbar: {
      title: 'Laravel 한국어 문서',
      logo: {
        alt: 'Laravel Logo',
        src: 'img/logo.svg',
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
      links: [
        {
          title: '문서',
          items: [
            {
              label: '시작하기',
              to: '/docs/intro',
            },
            {
              label: '아키텍처 개념',
              to: '/docs/architecture/container',
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
      copyright: `Copyright © ${new Date().getFullYear()} Laravel 한국어 문서. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
