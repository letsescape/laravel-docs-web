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
      title={`라라벨 시작하기`}
      description="라라벨(Laravel) 프레임워크의 설치 방법, 기본 사용법, 주요 기능들을 한글로 쉽게 배우고 시작하세요.">
      <Head>
        {/* 기본 메타 태그 */}
        <meta name="keywords" content="라라벨, Laravel, PHP 프레임워크, 웹 개발, 한글 문서, 튜토리얼, 시작하기" />
        <link rel="canonical" href={url} />

        {/* Open Graph 태그 */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="라라벨 한국어 문서 - PHP 웹 프레임워크" />
        <meta property="og:description" content="라라벨(Laravel) 프레임워크의 설치 방법, 기본 사용법, 주요 기능들을 한글로 쉽게 배우고 시작하세요." />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content={siteConfig.title} />
        <meta property="og:image" content={`${url}/img/958072.png`} />
        <meta property="og:image:alt" content="라라벨 한국어 문서 대표 이미지" />

        {/* Twitter 태그 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="라라벨 한국어 문서 - PHP 웹 프레임워크" />
        <meta name="twitter:description" content="라라벨(Laravel) 프레임워크의 설치 방법, 기본 사용법, 주요 기능들을 한글로 쉽게 배우고 시작하세요." />
        <meta name="twitter:image" content={`${url}/img/958072.png`} />
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
