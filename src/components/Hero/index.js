import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              생산성을 위해<br />
              만들어진 도구로<br />
              소프트웨어 개발하기
            </h1>
            <p className={styles.heroSubtitle}>
              라라벨은 웹 장인을 위한 완벽한 생태계를 제공합니다. 오픈 소스 PHP
              <br />프레임워크, 제품, 패키지 및 스타터 킷은 웹 애플리케이션을 구축, 배포 및
              <br />모니터링하는 데 필요한 모든 것을 제공합니다.
            </p>
            <div className={styles.heroButtons}>
              <Link
                className={clsx('button button--primary button--lg', styles.heroButton)}
                to="/docs/12.x/installation">
                시작하기
              </Link>
              <Link
                className={clsx('button button--outline button--lg', styles.heroButton)}
                to="/docs/12.x/installation">
                문서 보기
              </Link>
            </div>
            <div className={styles.codeSnippet}>
              <pre className={styles.codeBlock}>
                <code>
                  <span className={styles.codeLine}>1. composer global require laravel/installer</span>
                  <span className={styles.codeLine}>2. laravel new example-app</span>
                  <span className={styles.codeLine}>3. 모든 준비가 완료되었습니다.</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
