import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export default function CallToAction() {
  return (
    <section className={styles.callToAction}>
      <div className="container">
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>다음 대박 아이디어를 만들 준비가 되셨나요?</h2>
          <p className={styles.ctaDescription}>지금 바로 시작하고 놀라운 무언가를 만들어보세요.</p>

          <div className={styles.ctaButtons}>
            <Link
              className="button button--primary button--lg"
              to="/docs/시작하기">
              문서 읽기
            </Link>
            <Link
              className="button button--outline button--lg"
              to="/docs/배포">
              지금 배포하기
            </Link>
          </div>
        </div>

        <div className={styles.ctaFooter}>
          <p className={styles.ctaFooterText}>
            라라벨은 소프트웨어를 구축, 배포 및<br />
            모니터링하는 가장 생산적인 방법입니다.
          </p>
        </div>
      </div>
    </section>
  );
}
