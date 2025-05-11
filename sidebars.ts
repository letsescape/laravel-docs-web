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
      type: 'category',
      label: 'Prologue',
      collapsed: true,
      items: [
        'releases',
        'upgrade',
        'contributions',
      ],
    },
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'installation',
        'configuration',
        'structure',
        'frontend',
        'starter-kits',
        'deployment',
      ],
    },
    {
      type: 'category',
      label: 'Architecture Concepts',
      collapsed: true,
      items: [
        'lifecycle',
        'container',
        'providers',
        'facades',
      ],
    },
    {
      type: 'category',
      label: 'The Basics',
      collapsed: true,
      items: [
        'routing',
        'middleware',
        'csrf',
        'controllers',
        'requests',
        'responses',
        'views',
        'blade',
        'vite',
        'urls',
        'session',
        'validation',
        'errors',
        'logging',
      ],
    },
    {
      type: 'category',
      label: 'Digging Deeper',
      collapsed: true,
      items: [
        'artisan',
        'broadcasting',
        'cache',
        'collections',
        'concurrency',
        'context',
        'contracts',
        'events',
        'filesystem',
        'helpers',
        'http-client',
        'localization',
        'mail',
        'notifications',
        'packages',
        'processes',
        'queues',
        'rate-limiting',
        'strings',
        'scheduling',
      ],
    },
    {
      type: 'category',
      label: 'Security',
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
      label: 'Database',
      collapsed: true,
      items: [
        'database',
        'queries',
        'pagination',
        'migrations',
        'seeding',
        'redis',
        'mongodb',
      ],
    },
    {
      type: 'category',
      label: 'Eloquent ORM',
      collapsed: true,
      items: [
        'eloquent',
        'eloquent-relationships',
        'eloquent-collections',
        'eloquent-mutators',
        'eloquent-resources',
        'eloquent-serialization',
        'eloquent-factories',
      ],
    },
    {
      type: 'category',
      label: 'Testing',
      collapsed: true,
      items: [
        'testing',
        'http-tests',
        'console-tests',
        'dusk',
        'database-testing',
        'mocking',
      ],
    },
    {
      type: 'category',
      label: 'Packages',
      collapsed: true,
      items: [
        'billing',
        'cashier-paddle',
        'dusk',
        'envoy',
        'fortify',
        'folio',
        'homestead',
        'horizon',
        'mix',
        'octane',
        'passport',
        'pennant',
        'pint',
        'precognition',
        'prompts',
        'pulse',
        'reverb',
        'sail',
        'sanctum',
        'scout',
        'socialite',
        'telescope',
        'valet',
      ],
    },
    {
      type: 'link',
      label: 'API Documentation',
      href: 'https://api.laravel.com/docs/12.x',
    },
  ],
};

export default sidebars;
