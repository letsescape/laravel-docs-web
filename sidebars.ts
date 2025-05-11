import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

const sidebars: SidebarsConfig = {
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
        'lifecycle',
        'container',
        // 아래 항목들은 해당 파일이 생성되면 주석 해제
        // 'providers',
        // 'facades',
        // 'contracts',
      ],
    },
    {
      type: 'category',
      label: '기본 개념',
      collapsed: false,
      items: [
        'routing',
        // 아래 항목들은 해당 파일이 생성되면 주석 해제
        // 'middleware',
        // 'controllers',
        // 'requests',
        // 'responses',
        // 'views',
        // 'blade',
        // 'session',
        // 'validation',
        // 'errors',
      ],
    },
    // 아래 카테고리들은 해당 파일이 생성되면 주석 해제
    /*
    {
      type: 'category',
      label: '프론트엔드',
      collapsed: true,
      items: [
        'vite',
        'frontend',
      ],
    },
    {
      type: 'category',
      label: '데이터베이스',
      collapsed: true,
      items: [
        'database',
        'queries',
        'migrations',
        'seeding',
        'eloquent',
      ],
    },
    {
      type: 'category',
      label: '테스팅',
      collapsed: true,
      items: [
        'testing',
        'console-tests',
        'dusk',
        'mocking',
      ],
    },
    {
      type: 'category',
      label: '보안',
      collapsed: true,
      items: [
        'authentication',
        'authorization',
        'verification',
        'encryption',
        'hashing',
        'passwords',
      ],
    },
    {
      type: 'category',
      label: '고급 주제',
      collapsed: true,
      items: [
        'artisan',
        'broadcasting',
        'cache',
        'events',
        'filesystem',
        'http-client',
        'localization',
        'mail',
        'packages',
        'queues',
        'rate-limiting',
        'scheduling',
      ],
    },
    {
      type: 'category',
      label: '배포',
      collapsed: true,
      items: [
        'deployment',
        'envoy',
      ],
    },
    */
  ],
};

export default sidebars;
