import type {InlineCode, Link, Paragraph, Root, Text} from 'mdast';
import type {Transformer} from 'unified';
import type {VFile} from 'vfile';
import {visit} from 'unist-util-visit';

import {staleLinkResolution} from '../../scripts/stale-links.mjs';

/**
 * 파일 경로에서 버전 세그먼트 추출
 *
 * 예: ".../versioned_docs/version-11.x/mcp.md" → "11.x"
 */
const VERSION_RE =
  /(?:versioned_docs|docusaurus-plugin-content-docs)[/\\]version-([^/\\]+)[/\\]/;

function extractVersion(filePath: string | undefined): string | null {
  if (!filePath) return null;
  const m = VERSION_RE.exec(filePath);
  return m ? m[1] : null;
}

/**
 * 폐기할 링크의 표시 텍스트 추출
 *
 * - 일반 텍스트와 인라인 코드로만 구성된 링크 지원
 * - 이미지 등 다른 자식 노드가 있으면 안전한 변환을 위해 `null` 반환
 */
function linkLabel(node: Link): string | null {
  let label = '';
  for (const child of node.children) {
    if (child.type !== 'text' && child.type !== 'inlineCode') return null;
    label += child.value;
  }
  return label;
}

/**
 * Laravel 공식 문서의 서버 측 템플릿과 관례적 링크 패턴을 Docusaurus 라우팅에 맞게 자동 치환하는 remark 플러그인
 *
 * 치환 규칙:
 * 1. `{{version}}` → 현재 파일이 속한 버전(예: `11.x`)
 * 2. `/docs/<version>/installation[#anchor]` → `/docs/<version>/[#anchor]`(번역본의 `installation.md`가 `slug: /`인 루트 페이지이므로 경로 보정)
 * 3. 버전별 폐기 링크 → 레지스트리에 지정된 대체 링크, 일반 목차 텍스트 또는 링크 없는 인라인 코드
 *
 * - 코드 블록과 인라인 코드의 내용은 플레이스홀더 치환 대상에서 제외
 * - 사용자가 Laravel 코드 예제를 그대로 복사할 수 있도록 원형 보존
 */
export default function replacePlaceholdersPlugin(): Transformer<Root> {
  return (tree, file: VFile) => {
    const version = extractVersion(file.path);
    if (!version) return;

    const applyText = (input: string): string =>
      input.includes('{{version}}')
        ? input.replaceAll('{{version}}', version)
        : input;

    // 링크 URL 보정: {{version}} 치환 + /installation 경로 → 루트
    const applyUrl = (input: string): string => {
      let out = applyText(input);
      // /docs/<ver>/installation(#anchor)? → /docs/<ver>/(#anchor)?
      out = out.replace(
        /^(\/docs\/[^/]+\/)installation(#.*)?$/,
        (_m, base: string, anchor = '') => `${base}${anchor}`,
      );
      return out;
    };

    visit(tree, 'text', (node: Text) => {
      node.value = applyText(node.value);
    });

    const listParagraphs = new Set<Paragraph>();
    visit(tree, 'paragraph', (node, _index, parent) => {
      if (parent?.type === 'listItem') listParagraphs.add(node);
    });

    visit(tree, 'link', (node: Link, index, parent) => {
      if (!node.url) return;
      const normalizedUrl = applyUrl(node.url);
      const resolution = staleLinkResolution(normalizedUrl, version);
      if (resolution === null) {
        node.url = normalizedUrl;
        return;
      }
      if (resolution.target !== null) {
        node.url = resolution.target;
        return;
      }
      const standaloneListLabel = resolution.retireMode === 'standalone-list-label';
      if (
        standaloneListLabel &&
        (parent?.type !== 'paragraph' ||
          parent.children.length !== 1 ||
          !listParagraphs.has(parent))
      ) {
        return;
      }
      if (!standaloneListLabel && resolution.retireMode !== 'bare-inline-code') {
        throw new Error('unsupported stale link retirement');
      }

      const label = linkLabel(node);
      if (index === undefined || parent === undefined || label === null) {
        throw new Error('stale link cannot be retired safely');
      }
      const replacement: InlineCode | Text = {
        type: standaloneListLabel ? 'text' : 'inlineCode',
        value: label,
      };
      parent.children[index] = replacement;
    });
  };
}
