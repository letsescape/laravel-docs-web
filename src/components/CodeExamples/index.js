import React, { useState } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const codeExamples = [
  {
    id: 'authentication',
    title: '인증',
    description: '라라벨은 기본적으로 간단하고 안전한 인증 시스템을 제공합니다.',
    code: [
      {
        title: '라라벨 라우트에 인증 미들웨어 추가하기',
        language: 'php',
        code: `Route::get('/profile', ProfileController::class)
    ->middleware('auth');`,
      },
      {
        title: 'Auth 패사드를 통해 인증된 사용자에 접근할 수 있습니다',
        language: 'php',
        code: `use Illuminate\\Support\\Facades\\Auth;

$user = Auth::user();`,
      },
    ],
    link: {
      text: '인증 문서 읽기',
      url: '/docs/12.x/인증',
    },
  },
  {
    id: 'eloquent',
    title: 'Eloquent',
    description: '라라벨의 우아한 ORM은 데이터베이스 작업을 매우 쉽게 만듭니다.',
    code: [
      {
        title: '데이터베이스 테이블을 위한 모델 정의하기',
        language: 'php',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;

class Flight extends Model
{
    // ...
}`,
      },
      {
        title: 'Eloquent를 사용하여 데이터베이스에서 레코드 가져오기',
        language: 'php',
        code: `use App\\Models\\Flight;

foreach (Flight::all() as $flight) {
    echo $flight->name;
}`,
      },
    ],
    link: {
      text: 'Eloquent 문서 읽기',
      url: '/docs/12.x/eloquent',
    },
  },
  {
    id: 'validation',
    title: '유효성 검사',
    description: '라라벨은 기본적으로 강력한 유효성 검사 기능을 포함합니다.',
    code: [
      {
        title: '컨트롤러에서 유효성 검사 규칙 정의하기',
        language: 'php',
        code: `public function store(Request $request)
{
    $validated = $request->validate([
        'title' => 'required|max:255',
        'content' => 'required',
        'email' => 'required|email',
    ]);
}`,
      },
      {
        title: '뷰에서 유효성 검사 오류 처리하기',
        language: 'blade',
        code: `@if ($errors->any())
    <div class="alert alert-danger">
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif`,
      },
    ],
    link: {
      text: '유효성 검사 문서 읽기',
      url: '/docs/12.x/유효성-검사',
    },
  },
  {
    id: 'testing',
    title: '테스팅',
    description: '라라벨은 테스팅을 고려하여 설계되었습니다. 사실, PHPUnit을 사용한 테스팅 지원이 기본적으로 포함되어 있습니다.',
    code: [
      {
        title: 'Pest를 사용하여 테스트 작성하기',
        language: 'php',
        code: `it('can create a post', function () {
    $response = $this->post('/posts', [
        'title' => 'Test Post',
        'content' => 'This is a test post content.',
    ]);

    $response->assertStatus(302);

    $this->assertDatabaseHas('posts', [
        'title' => 'Test Post',
    ]);
});`,
      },
      {
        title: '커맨드 라인에서 테스트 실행하기',
        language: 'bash',
        code: `php artisan test`,
      },
    ],
    link: {
      text: '테스팅 문서 읽기',
      url: '/docs/12.x/테스팅',
    },
  },
];

export default function CodeExamples() {
  const [activeTab, setActiveTab] = useState(codeExamples[0].id);

  const activeExample = codeExamples.find(example => example.id === activeTab);

  return (
    <section className={styles.codeExamples}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>백엔드</h2>
          <h3 className={styles.sectionSubtitle}>코드가 스스로 말합니다</h3>
          <p className={styles.sectionDescription}>
            간결하고 우아한 문법이 놀라운 기능을 제공합니다. 모든 기능은 사용자를 배려한 일관된 개발 경험을 제공하기 위해 신중하게 고려되었습니다.
          </p>
        </div>

        <div className={styles.codeExamplesContainer}>
          <div className={styles.tabs}>
            {codeExamples.map(example => (
              <button
                key={example.id}
                className={clsx(styles.tabButton, activeTab === example.id && styles.activeTab)}
                onClick={() => setActiveTab(example.id)}
              >
                {example.title}
              </button>
            ))}
          </div>

          <div className={styles.codeContent}>
            <h3 className={styles.codeTitle}>{activeExample.title}</h3>
            <p className={styles.codeDescription}>{activeExample.description}</p>

            {activeExample.code.map((codeBlock, idx) => (
              <div key={idx} className={styles.codeBlock}>
                <div className={styles.codeHeader}>
                  <span className={styles.codeNumber}>{idx + 1}</span>
                  <span className={styles.codeBlockTitle}>{codeBlock.title}</span>
                </div>
                <pre className={styles.pre}>
                  <code className={styles.code}>
                    {codeBlock.code}
                  </code>
                </pre>
              </div>
            ))}

            <Link to={activeExample.link.url} className={styles.docsLink}>
              {activeExample.link.text}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
