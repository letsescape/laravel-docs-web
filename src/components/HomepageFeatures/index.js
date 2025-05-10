import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '쉬운 사용법',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Laravel은 개발자 경험을 최우선으로 생각하여 설계되었습니다. 
        직관적인 API와 강력한 기능으로 웹 개발을 더 쉽게 만들어 줍니다.
      </>
    ),
  },
  {
    title: '강력한 기능',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Laravel은 라우팅, 캐싱, 큐, 이벤트 등 현대적인 웹 애플리케이션 개발에 
        필요한 모든 도구를 제공합니다.
      </>
    ),
  },
  {
    title: '확장성',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Laravel 에코시스템은 다양한 패키지와 확장 기능을 제공하여 
        어떤 규모의 프로젝트에도 적합합니다.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
