/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // Laravel 문서를 위한 사이드바 설정
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: '소개',
    },
    {
      type: 'category',
      label: '아키텍처 개념',
      collapsed: false,
      items: [
        'architecture/lifecycle',
        'architecture/container',
        // 아래 항목들은 해당 파일이 생성되면 주석 해제
        // 'architecture/providers',
        // 'architecture/facades',
        // 'architecture/contracts',
      ],
    },
    {
      type: 'category',
      label: '기본 개념',
      collapsed: false,
      items: [
        'basics/routing',
        // 아래 항목들은 해당 파일이 생성되면 주석 해제
        // 'basics/middleware',
        // 'basics/controllers',
        // 'basics/requests',
        // 'basics/responses',
        // 'basics/views',
        // 'basics/blade',
        // 'basics/session',
        // 'basics/validation',
        // 'basics/errors',
      ],
    },
    // 아래 카테고리들은 해당 파일이 생성되면 주석 해제
    /*
    {
      type: 'category',
      label: '프론트엔드',
      collapsed: true,
      items: [
        'frontend/vite',
        'frontend/frontend',
      ],
    },
    {
      type: 'category',
      label: '데이터베이스',
      collapsed: true,
      items: [
        'database/database',
        'database/queries',
        'database/migrations',
        'database/seeding',
        'database/eloquent',
      ],
    },
    {
      type: 'category',
      label: '테스팅',
      collapsed: true,
      items: [
        'testing/testing',
        'testing/console-tests',
        'testing/dusk',
        'testing/mocking',
      ],
    },
    {
      type: 'category',
      label: '보안',
      collapsed: true,
      items: [
        'security/authentication',
        'security/authorization',
        'security/verification',
        'security/encryption',
        'security/hashing',
        'security/passwords',
      ],
    },
    {
      type: 'category',
      label: '고급 주제',
      collapsed: true,
      items: [
        'advanced/artisan',
        'advanced/broadcasting',
        'advanced/cache',
        'advanced/events',
        'advanced/filesystem',
        'advanced/http-client',
        'advanced/localization',
        'advanced/mail',
        'advanced/packages',
        'advanced/queues',
        'advanced/rate-limiting',
        'advanced/scheduling',
      ],
    },
    {
      type: 'category',
      label: '배포',
      collapsed: true,
      items: [
        'deployment/deployment',
        'deployment/envoy',
      ],
    },
    */
  ],
};

module.exports = sidebars;
