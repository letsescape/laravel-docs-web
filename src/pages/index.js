import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';

// Import custom components
import Hero from '@site/src/components/Hero';
import Features from '@site/src/components/Features';
import CodeExamples from '@site/src/components/CodeExamples';
import Community from '@site/src/components/Community';
import CallToAction from '@site/src/components/CallToAction';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const {url} = siteConfig;

  return (
    <Layout
      title={`라라벨 - 웹 장인을 위한 PHP 프레임워크`}
      description="라라벨은 표현력이 풍부하고 우아한 문법을 갖춘 PHP 웹 애플리케이션 프레임워크입니다. 사소한 부분에 얽매이지 않고 창작에만 집중할 수 있습니다.">
      <Head>
        {/* 기본 메타 태그 */}
        <meta name="keywords" content="라라벨, Laravel, PHP 프레임워크, PHP artisan, PHP, 웹 개발, 한글 문서, 튜토리얼, 시작하기" />
        <link rel="canonical" href={url} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="라라벨 - 웹 장인을 위한 PHP 프레임워크" />
        <meta property="og:description" content="라라벨은 표현력이 풍부하고 우아한 문법을 갖춘 PHP 웹 애플리케이션 프레임워크입니다. 사소한 부분에 얽매이지 않고 창작에만 집중할 수 있습니다." />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content={siteConfig.title} />
        <meta property="og:image" content={`${url}/img/laravel-home.png`} />
        <meta property="og:image:alt" content="라라벨 - 웹 장인을 위한 PHP 프레임워크" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="라라벨 - 웹 장인을 위한 PHP 프레임워크" />
        <meta name="twitter:description" content="라라벨은 표현력이 풍부하고 우아한 문법을 갖춘 PHP 웹 애플리케이션 프레임워크입니다. 사소한 부분에 얽매이지 않고 창작에만 집중할 수 있습니다." />
        <meta name="twitter:image" content={`${url}/img/laravel-home.png`} />
      </Head>
      <main>
        <Hero />
        <Features />
        <CodeExamples />
        {/*<Community />*/}
        {/*<CallToAction />*/}
      </main>
    </Layout>
  );
}
