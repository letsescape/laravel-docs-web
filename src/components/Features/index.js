import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const packages = [
  { name: 'Scout', description: 'Eloquent 모델 검색', free: true, link: '/docs/12.x/scout' },
  { name: 'Octane', description: '고성능 앱 서버', free: true, link: '/docs/12.x/octane' },
  { name: 'Reverb', description: '빠르고 확장 가능한 웹소켓', free: true, link: '/docs/12.x/reverb' },
  { name: 'Echo', description: '웹소켓 이벤트 수신', free: true, link: '/docs/12.x/broadcasting' },
  { name: 'Pennant', description: '기능 플래그 관리', free: true, link: '/docs/12.x/pennant' },
  { name: 'Cashier', description: '결제 및 구독', free: true, link: '/docs/12.x/cashier' },
  { name: 'Socialite', description: '소셜 인증', free: true, link: '/docs/12.x/socialite' },
  { name: 'Sanctum', description: 'API 인증', free: true, link: '/docs/12.x/sanctum' },
  { name: 'Sail', description: '로컬 Docker 개발', free: true, link: '/docs/12.x/sail' },
  { name: 'Pint', description: '미니멀리스트를 위한 코드 스타일러', free: true, link: '/docs/12.x/pint' },
  { name: 'Horizon', description: 'Redis 큐 모니터링', free: true, link: '/docs/12.x/horizon' },
  { name: 'Dusk', description: '자동화된 브라우저 테스팅', free: true, link: '/docs/12.x/dusk' },
  { name: 'Telescope', description: '로컬 디버깅 및 인사이트', free: true, link: '/docs/12.x/telescope' },
  { name: 'Pulse', description: '성능 인사이트', free: true, link: '/docs/12.x/pulse' },
];

const starterKits = [
  {
    title: 'React 스타터 킷',
    description: 'Laravel, Inertia, React로 애플리케이션을 만드는 데 필요한 모든 것을 제공합니다.',
    free: true,
    links: [
      { text: '시작하기', url: 'https://github.com/laravel/react-starter-kit' },
      { text: '라이브 미리보기', url: 'https://react-starter-kit-main-trfk6v.laravel.cloud' },
    ],
  },
  {
    title: 'Vue 스타터 킷',
    description: 'Laravel, Inertia, Vue로 애플리케이션을 만드는 데 필요한 모든 것을 제공합니다.',
    free: true,
    links: [
      { text: '시작하기', url: 'https://github.com/laravel/vue-starter-kit' },
      { text: '라이브 미리보기', url: 'https://vue-starter-kit-main-jvxppc.laravel.cloud' },
    ],
  },
  {
    title: 'Livewire 스타터 킷',
    description: 'Laravel과 Livewire로 애플리케이션을 만드는 데 필요한 모든 것을 제공합니다.',
    free: true,
    links: [
      { text: '시작하기', url: 'https://github.com/laravel/livewire-starter-kit' },
      { text: '라이브 미리보기', url: 'https://livewire-starter-kit-main-spxvec.laravel.cloud' },
    ],
  },
];

const products = [
  {
    title: 'Cloud',
    description: 'PHP 애플리케이션 배포 및 호스팅을 위한 완전 관리형 인프라 플랫폼.',
    pricing: '월 $0.00부터 시작하는 요금제',
    isNew: true,
    link: { text: '지금 배포하기', url: 'https://cloud.laravel.com' },
  },
  {
    title: 'Forge',
    description: 'DigitalOcean, Vultr, Amazon, Hetzner 등에서 앱을 위한 서버 관리.',
    pricing: '월 $12.00부터 시작하는 요금제',
    isNew: false,
    link: { text: '시작하기', url: 'https://forge.laravel.com' },
  },
  {
    title: 'Nightwatch',
    description: '라라벨 애플리케이션 성능에 대한 타의 추종을 불허하는 모니터링 및 인사이트.',
    pricing: '곧 가격 공개 예정',
    isNew: false,
    isSoon: true,
    link: { text: '대기자 명단 참여', url: 'https://nightwatch.laravel.com' },
  },
  {
    title: 'Nova',
    description: '라라벨을 사용하여 프로덕션 수준의 관리자 패널을 구축하는 가장 간단하고 빠른 방법.',
    pricing: '$99.00부터 시작하는 라이센스',
    isNew: false,
    link: { text: '라이센스 구매', url: 'https://nova.laravel.com' },
  },
];

export default function Features() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>생태계</h2>
          <h3 className={styles.sectionSubtitle}>강력한 생태계를 갖춘 PHP 프레임워크</h3>
          <p className={styles.sectionDescription}>
            라라벨은 모든 현대적인 웹 애플리케이션에 필요한 공통 기능에 대한 우아한 솔루션을 기본 제공합니다.
            자체 패키지는 특정 문제에 대한 의견이 담긴 솔루션을 제공하므로 바퀴를 다시 발명할 필요가 없습니다.
          </p>
        </div>

        <div className={styles.packagesGrid}>
          {packages.map((pkg, idx) => (
            <Link key={idx} to={pkg.link} className={styles.packageItem}>
              <span className={styles.packageName}>
                {pkg.name} {pkg.free && <span className={styles.freeTag}>무료</span>}
              </span>
              <span className={styles.packageDescription}>{pkg.description}</span>
            </Link>
          ))}
        </div>

        <div className={styles.starterKitsSection}>
          <div className={styles.starterKitsGrid}>
            {starterKits.map((kit, idx) => (
              <div key={idx} className={styles.starterKitCard}>
                <h4 className={styles.starterKitTitle}>
                  {kit.title} {kit.free && <span className={styles.freeTag}>무료</span>}
                </h4>
                <p className={styles.starterKitDescription}>{kit.description}</p>
                <div className={styles.starterKitLinks}>
                  {kit.links.map((link, linkIdx) => (
                    <a
                      key={linkIdx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkIdx === 0 ? styles.primaryLink : styles.secondaryLink}
                    >
                      {link.text}
                    </a>
                  ))}
                </div>
              </div>
            ))}
            <div className={styles.starterKitInfo}>
              <p>
                모든 스타터 킷에는 사용자 인증에 필요한 라우트, 컨트롤러 및 뷰가 포함되어 있습니다.
              </p>
              <p>
                회원가입, 로그인, 비밀번호 재설정, 이메일 인증, 프로필 설정, 대시보드,
                라이트 및 다크 모드, 그리고 선택적 WorkOS AuthKit 지원이 포함되어 있습니다.
              </p>
              <Link to="/docs/스타터-킷" className={styles.learnMoreLink}>
                스타터 킷에 대해 더 알아보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
