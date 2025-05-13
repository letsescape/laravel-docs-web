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
      label: 'index',
      collapsed: false,
      items: [
        'index',
      ],
    },
  ],
};

export default sidebars;
