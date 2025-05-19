<div align="center">

# 라라벨 한국어 문서

[![Laravel](https://img.shields.io/badge/Laravel-%23FF2D20.svg?logo=laravel&logoColor=white)](http://laravel.com)
[![Laravel Version](https://img.shields.io/packagist/v/laravel/framework)](https://packagist.org/packages/laravel/framework)
[![Last Updated](https://img.shields.io/github/last-commit/letsescape/laravel-docs-web/main?label=Last%20Updated)](https://github.com/letsescape/laravel-docs-web/commits/main)
[![License](https://img.shields.io/github/license/letsescape/laravel-docs-web)](https://github.com/letsescape/laravel-docs-web/blob/main/LICENSE)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/letsescape/laravel-docs-web?utm_source=oss&utm_medium=github&utm_campaign=letsescape%2Flaravel-docs-web&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

[라라벨 공식 문서](https://laravel.com) | [라라벨 한국어 문서](https://laravel.chanhyung.kim)

</div>

## 소개

라라벨 한국어 문서를 [Docusaurus](https://docusaurus.io) & [GitHub Pages](https://pages.github.com)를 사용하여 배포합니다.

이 프로젝트는 번역된 문서를 웹사이트로 배포하고, 문서 번역은 [laravel-docs-source](https://github.com/kimchanhyung98/laravel-docs-source)에서 처리합니다.

### 문서 필터링

마크다운 번역 문서에 다음과 같은 필터링을 적용합니다.

- 현재는 문서를 직접 수정하여 필터링을 적용했습니다.
- [문서 필터링 이슈](https://github.com/kimchanhyung98/laravel-docs-source/issues/13) 참조

## 실행

```bash
npm install
docusaurus start
```

문서의 목차(사이드바)를 자동으로 생성하려면 다음 명령을 실행합니다.  
이 스크립트는 `versioned_docs/version-{버전}/origin/documentation.md` 파일을 분석하여 각 버전에 대한 사이드바 구조를 생성합니다.

```bash
npm run generate-sidebars
```

## 라이선스

- 문서 웹사이트 코드: MIT License
- 라라벨 문서 : MIT License `(Copyright (c) Taylor Otwell)`
