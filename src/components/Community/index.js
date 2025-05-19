import React from 'react';
import styles from './styles.module.css';

const testimonials = [
  {
    quote: "라라벨을 10년 가까이 사용해 왔지만, 다른 프레임워크로 전환할 생각을 해본 적이 없습니다.",
    author: "Adam Wathan",
    role: "Tailwind 창시자",
    avatar: "https://via.placeholder.com/80x80",
  },
  {
    quote: "라라벨은 크고 작은 웹 프로젝트를 위한 우리의 스타터이자 만능 도구입니다. 10년이 지난 지금도 여전히 신선하고 유용합니다.",
    author: "Ian Callahan",
    role: "Harvard Art Museums",
    avatar: "https://via.placeholder.com/80x80",
  },
  {
    quote: "라라벨은 현대적이고 확장 가능한 웹 앱을 구축하는 고통을 없애주었습니다.",
    author: "Aaron Francis",
    role: "Try Hard Studios 공동 창업자",
    avatar: "https://via.placeholder.com/80x80",
  },
  {
    quote: "라라벨은 놀라운 활동적인 커뮤니티로 성장했습니다. 라라벨은 단순한 PHP 프레임워크 그 이상입니다.",
    author: "Bobby Bouwmann",
    role: "Enrise 개발자",
    avatar: "https://via.placeholder.com/80x80",
  },
  {
    quote: "라라벨로 앱을 배포한다는 것은 성능, 유연성, 단순함의 균형을 맞추는 것을 의미하며, 동시에 우수한 개발자 경험을 보장합니다.",
    author: "Peter Steenbergen",
    role: "Elastic",
    avatar: "https://via.placeholder.com/80x80",
  },
  {
    quote: "라라벨은 PHP 생태계에 새로운 공기를 불어넣었으며, 주변에는 뛰어난 커뮤니티가 형성되어 있습니다.",
    author: "Erika Heidi",
    role: "Minicli 제작자",
    avatar: "https://via.placeholder.com/80x80",
  },
];

export default function Community() {
  return (
    <section className={styles.community}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>커뮤니티</h2>
          <h3 className={styles.sectionSubtitle}>개발자, 스타트업, 그리고 기업들이 신뢰하는 프레임워크</h3>
          <p className={styles.sectionDescription}>
            전 세계 수천 명의 개발자와 기업이 함께하는 커뮤니티에 참여하세요.
          </p>
        </div>

        <div className={styles.testimonialGrid}>
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className={styles.testimonialCard}>
              <div className={styles.testimonialQuote}>
                <blockquote>{testimonial.quote}</blockquote>
              </div>
              <div className={styles.testimonialAuthor}>
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className={styles.testimonialAvatar}
                />
                <div className={styles.testimonialInfo}>
                  <div className={styles.testimonialName}>{testimonial.author}</div>
                  <div className={styles.testimonialRole}>{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
