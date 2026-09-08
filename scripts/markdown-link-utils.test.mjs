import assert from 'node:assert/strict';
import {join} from 'node:path';

import {unified} from 'unified';
import remarkParse from 'remark-parse';

import replacePlaceholdersPlugin from '../src/remark/replace-placeholders.ts';
import {extractMarkdownLinks} from './markdown-link-utils.mjs';
import {
  docsVersionFromUrl,
  fragmentTarget,
  relativeTargetPath,
  sourceUrl,
} from './anchor-routes.mjs';
import {staleLinkResolution} from './stale-links.mjs';

assert.deepEqual(
  extractMarkdownLinks('<!-- [Hidden](/docs/13.x/mcp#client) -->\n[Visible](#ok)'),
  [{text: 'Visible', url: '#ok'}],
);

assert.deepEqual(
  extractMarkdownLinks('<!-- outer <!-- [Hidden](#bad) --> -->\n[Visible](#ok)'),
  [{text: 'Visible', url: '#ok'}],
);

const repo = '/repo';
assert.equal(
  sourceUrl(
    join(repo, 'versioned_docs', 'version-13.x', 'cache.md'),
    join(repo, 'versioned_docs'),
  ),
  '/docs/13.x/cache/',
);
assert.equal(
  sourceUrl(
    join(repo, 'i18n', 'ja', 'docs', 'version-13.x', 'installation.md'),
    join(repo, 'i18n', 'ja', 'docs'),
    '/ja',
  ),
  '/ja/docs/13.x/',
);
assert.equal(docsVersionFromUrl('/ja/docs/13.x/cache/'), '13.x');
assert.equal(
  relativeTargetPath('routing', '/ja/docs/13.x/cache/', '13.x'),
  '/ja/docs/13.x/routing',
);
assert.equal(
  relativeTargetPath('/docs/13.x/routing', '/ja/docs/13.x/cache/', '13.x'),
  '/ja/docs/13.x/routing',
);
assert.equal(
  relativeTargetPath('/ja/docs/13.x/routing', '/ja/docs/13.x/cache/', '13.x'),
  '/ja/docs/13.x/routing',
);
assert.deepEqual(
  fragmentTarget(
    '/docs/13.x/routing?source=cache#signed%20urls',
    '/ja/docs/13.x/cache/',
    '13.x',
  ),
  {targetUrl: '/ja/docs/13.x/routing/', anchor: 'signed urls'},
);
assert.deepEqual(
  fragmentTarget('#same-page', '/docs/13.x/cache/', '13.x'),
  {targetUrl: '/docs/13.x/cache/', anchor: 'same-page'},
);
assert.equal(
  fragmentTarget('//example.com/docs#external', '/docs/13.x/cache/', '13.x'),
  null,
);
assert.equal(
  fragmentTarget('custom:resource#external', '/docs/13.x/cache/', '13.x'),
  null,
);
assert.deepEqual(
  fragmentTarget('/docs/13.x/routing#%E0%A4%A', '/docs/13.x/cache/', '13.x'),
  {
    targetUrl: '/docs/13.x/routing/',
    anchor: '%E0%A4%A',
    error: 'invalid fragment encoding',
  },
);
assert.deepEqual(
  staleLinkResolution(
    '/docs/10.x/migrations#writing-migrations',
    '10.x',
  ),
  {
    target: '/docs/10.x/migrations#generating-migrations',
    retireMode: null,
  },
);
assert.deepEqual(staleLinkResolution('#assert-similar-json', '8.x'), {
  target: null,
  retireMode: 'bare-inline-code',
});
assert.equal(staleLinkResolution('#unknown', '10.x'), null);
assert.equal(
  staleLinkResolution('https://example.com/docs#writing-migrations', '10.x'),
  null,
);
assert.equal(
  staleLinkResolution('//example.com/docs/migrations#writing-migrations', '10.x'),
  null,
);
assert.equal(
  staleLinkResolution('mailto:migrations#writing-migrations', '10.x'),
  null,
);
assert.deepEqual(
  staleLinkResolution(
    'https://laravel.com/docs/10.x/migrations#writing-migrations',
    '10.x',
  ),
  {
    target: 'https://laravel.com/docs/10.x/migrations#generating-migrations',
    retireMode: null,
  },
);

const processor = unified().use(remarkParse).use(replacePlaceholdersPlugin);
for (const version of ['13.x', 'master', '12.x']) {
  for (const label of ['Core Development Discussion', '코어 개발 논의', 'コア開発の議論']) {
    const link = `[${label}](#core-development-discussion)`;
    const markdown = [
      `- ${link}`,
      link,
      `- See ${link}`,
      `\`${link}\``,
      `<!-- ${link} -->`,
      `\`\`\`md\n- ${link}\n\`\`\`\n`,
      `<a name="core-development-discussion"></a>\n## ${label}`,
    ].join('\n\n');
    const original = processor.parse(markdown);
    const tree = await processor.run(processor.parse(markdown), {
      path: `/repo/versioned_docs/version-${version}/contributions.md`,
    });
    assert.deepEqual(tree, original);
  }
}

console.log('markdown-link-utils tests passed');
