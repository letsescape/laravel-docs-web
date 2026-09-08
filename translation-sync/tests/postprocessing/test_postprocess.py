"""번역 Markdown 후처리 동작과 보호 범위 검증."""

import unittest

from sync import postprocess


class PostprocessTests(unittest.TestCase):
    """형식 정규화·stale 링크·보호 영역 경계 테스트 모음."""

    def test_postprocesses_html_and_title_classes_outside_code_blocks_only(self):
        """fenced code 밖의 ``img``와 heading class만 정규화."""

        text = """# Title {.page-title}

<img src="/docs/example.png">

```blade
#### `after()` {.collection-method}
<img src="{{ $message->embed($pathToImage) }}">
```
"""

        out = postprocess.postprocess(text, "12.x", {})

        self.assertIn("# Title\n", out)
        self.assertIn('<img src="/docs/example.png"/>', out)
        self.assertIn("#### `after()` {.collection-method}", out)
        self.assertIn('<img src="{{ $message->embed($pathToImage) }}">', out)

    def test_strips_trailing_whitespace_from_final_output(self):
        """최종 출력의 불필요한 줄 끝 공백을 제거."""

        text = "# Title   \nPlain text. \n```php\nreturn true;    \n```\n"

        out = postprocess.postprocess(text, "12.x", {})

        self.assertEqual(
            out,
            "# Title\nPlain text.\n```php\nreturn true;\n```\n",
        )

    def test_preserves_explicit_markdown_hard_break_outside_code(self):
        """fenced code 밖의 명시적 Markdown hard break를 보존."""

        text = "First line.  \nSecond line.\n"

        out = postprocess.postprocess(text, "12.x", {})

        self.assertEqual(out, text)

    def test_preserves_quoted_markdown_hard_break_outside_code(self):
        """blockquote 본문의 명시적 Markdown hard break를 보존."""

        text = "> First line.  \n> Second line.\n"

        out = postprocess.postprocess(text, "12.x", {})

        self.assertEqual(out, text)

    def test_escapes_js_comment_closer_inside_html_comments(self):
        """HTML 주석 안의 JavaScript 주석 종료 delimiter를 무력화."""

        text = "<!-- Use `DB::raw(/* ... */)` carefully. -->\n本文です。\n"

        out = postprocess.postprocess(text, "12.x", {})

        self.assertIn("<!-- Use `DB::raw(/* ... *&#47;)` carefully. -->", out)
        self.assertNotIn("*/)` carefully. -->", out)

    def test_normalizes_localized_legacy_admonitions(self):
        """한국어·일본어 legacy admonition을 NOTE 형식으로 정규화."""

        cases = (
            ("> **참고:**\n> 한국어 본문입니다.\n", "> [!NOTE]\n> 한국어 본문입니다.\n"),
            ("> **注意:**\n> 日本語の本文です。\n", "> [!NOTE]\n> 日本語の本文です。\n"),
            ("> **注:**\n> 日本語の本文です。\n", "> [!NOTE]\n> 日本語の本文です。\n"),
        )

        for text, expected in cases:
            with self.subTest(text=text):
                self.assertEqual(
                    postprocess.postprocess(text, "12.x", {}),
                    expected,
                )

    def test_normalizes_every_plain_legacy_admonition_marker(self):
        """지원되는 모든 일반 텍스트 legacy admonition 표식을 정규화."""

        cases = (
            ("Note", "NOTE"),
            ("Tip", "TIP"),
            ("Warning", "WARNING"),
            ("Caution", "CAUTION"),
            ("Important", "IMPORTANT"),
            ("참고", "NOTE"),
            ("注意", "NOTE"),
            ("注", "NOTE"),
            ("注記", "NOTE"),
            ("경고", "WARNING"),
            ("警告", "WARNING"),
        )

        for legacy, canonical in cases:
            with self.subTest(legacy=legacy):
                text = f"> {legacy}\n> Body.\n"
                self.assertEqual(
                    postprocess.postprocess(text, "12.x", {}),
                    f"> [!{canonical}]\n> Body.\n",
                )

    def test_does_not_transform_rendered_markdown_inside_html_comments(self):
        """HTML 주석 내부의 Markdown 예시를 원문 그대로 보존."""

        text = (
            "<!--\n"
            "> **Note:** Keep this literal.\n"
            "> [!WARNING]\n"
            "> Canonical alert syntax is literal here.\n"
            '<img src="example.png"> \n'
            "# Heading {.page-title}\n"
            "[Old](#agents-integration)\n"
            "-->\n"
        )

        self.assertEqual(postprocess.postprocess(text, "12.x", {}), text)

    def test_normalizes_known_stale_links_without_touching_code_or_comments(self):
        """code와 HTML 주석을 보존하면서 알려진 stale 링크를 정규화."""

        text = (
            "[Agents](#agents-integration)\n"
            "`[Code](#agents-integration)`\n"
            "<!-- [Comment](#agents-integration) -->\n"
        )

        out = postprocess.postprocess(text, "12.x", {})

        self.assertEqual(
            out,
            "[Agents](#agent-integration)\n"
            "`[Code](#agents-integration)`\n"
            "<!-- [Comment](#agents-integration) -->\n",
        )
        self.assertEqual(postprocess.postprocess(out, "12.x", {}), out)

    def test_normalizes_confirmed_version_specific_stale_links(self):
        """공식 원문에서 확인된 버전별 오타·이동·폐기 링크를 보정."""

        cases = (
            (
                "10.x",
                "[Controller](#actions-handled-by-resource-controller)\n"
                "[Recursive](#method-array-sort-recursive-desc)\n"
                "[Logger](/docs/10.x/errors#logging)\n"
                "[Stringable](/docs/10.x/helpers#fluent-strings)\n"
                "[Migration](/docs/10.x/migrations#writing-migrations)\n",
                "[Controller](#actions-handled-by-resource-controllers)\n"
                "[Recursive](#method-array-sort-recursive)\n"
                "[Logger](/docs/10.x/logging)\n"
                "[Stringable](/docs/10.x/strings)\n"
                "[Migration](/docs/10.x/migrations#generating-migrations)\n",
            ),
            (
                "8.x",
                "[Factory](/docs/8.x/database-testing#writing-factories)\n"
                "[Date](/docs/8.x/eloquent-mutators##date-casting)\n"
                "[Logger](/docs/8.x/errors#logging)\n"
                "[Migration](/docs/8.x/migrations#writing-migrations)\n"
                "[assertSimilarJson](#assert-similar-json)\n",
                "[Factory](/docs/8.x/database-testing#defining-model-factories)\n"
                "[Date](/docs/8.x/eloquent-mutators#date-casting)\n"
                "[Logger](/docs/8.x/logging)\n"
                "[Migration](/docs/8.x/migrations#generating-migrations)\n"
                "`assertSimilarJson`\n",
            ),
            (
                "9.x",
                "[Logger](/docs/9.x/errors#logging)\n"
                "[Migration](/docs/9.x/migrations#writing-migrations)\n",
                "[Logger](/docs/9.x/logging)\n"
                "[Migration](/docs/9.x/migrations#generating-migrations)\n",
            ),
        )

        for version, text, expected in cases:
            with self.subTest(version=version):
                self.assertEqual(
                    postprocess.postprocess(text, version, {}),
                    expected,
                )

    def test_preserves_core_discussion_links_after_stale_rule_removal(self):
        """원문에서 사라진 규칙이 같은 앵커를 사용하는 유효한 링크를 폐기하지 않는지 검증."""

        for label in ("Core Development Discussion", "코어 개발 논의", "コア開発の議論"):
            link = f"[{label}](#core-development-discussion)"
            protected = (
                f"\n{link}\n\n"
                f"- See {link}\n\n"
                f"`{link}`\n"
                f"<!-- {link} -->\n"
                f"```md\n- {link}\n```\n"
            )
            text = (
                f"- {link}\n" + protected
                + '<a name="core-development-discussion"></a>\n'
                + f"## {label}\n"
            )

            with self.subTest(label=label):
                self.assertEqual(postprocess.postprocess(text, "13.x", {}), text)
                self.assertEqual(postprocess.postprocess(text, "master", {}), text)
                self.assertEqual(postprocess.postprocess(text, "12.x", {}), text)

    def test_replaces_the_stale_v9_shortcode_toc_entry_with_unicode_content(self):
        """9.x의 shortcode 목차를 공식 후속 항목으로 교체."""

        text = (
            "- [Formatting Shortcode Notifications]"
            "(#formatting-shortcode-notifications)\n\n"
            '<a name="unicode-content"></a>\n'
            "#### 유니코드 콘텐츠\n"
        )
        expected = (
            "- [유니코드 콘텐츠](#unicode-content)\n\n"
            '<a name="unicode-content"></a>\n'
            "#### 유니코드 콘텐츠\n"
        )

        self.assertEqual(postprocess.postprocess(text, "9.x", {}), expected)
        self.assertEqual(postprocess.postprocess(expected, "9.x", {}), expected)

    def test_keeps_the_valid_v8_shortcode_link(self):
        """실제 본문 앵커가 있는 8.x shortcode 링크를 보존."""

        text = (
            "- [Formatting Shortcode Notifications]"
            "(#formatting-shortcode-notifications)\n\n"
            '<a name="formatting-shortcode-notifications"></a>\n'
            "### Formatting Shortcode Notifications\n"
        )

        self.assertEqual(postprocess.postprocess(text, "8.x", {}), text)

    def test_keeps_toc_label_without_an_adjacent_target_heading(self):
        """대상 앵커 다음에 heading이 없으면 목차 label을 유지."""

        text = (
            "- [Formatting Shortcode Notifications]"
            "(#formatting-shortcode-notifications)\n\n"
            '<a name="unicode-content"></a>\n'
            "본문입니다.\n\n"
            "#### 다른 제목\n"
        )
        expected = text.replace(
            "#formatting-shortcode-notifications",
            "#unicode-content",
            1,
        )

        self.assertEqual(postprocess.postprocess(text, "9.x", {}), expected)

    def test_normalizes_stale_links_after_fenced_code_without_offset_corruption(self):
        """fenced code 이후의 stale 링크를 정확한 원문 위치에서 정규화."""

        text = (
            "Before.\n\n"
            "```md\n"
            "[Code](#agents-integration)\n"
            "```\n\n"
            "<!-- [Comment](#agents-integration) -->\n"
            "`[Inline](#agents-integration)`\n"
            "[Visible](#agents-integration)\n"
            "After.\n"
        )

        self.assertEqual(
            postprocess.normalize_stale_link_targets(text, "12.x"),
            "Before.\n\n"
            "```md\n"
            "[Code](#agents-integration)\n"
            "```\n\n"
            "<!-- [Comment](#agents-integration) -->\n"
            "`[Inline](#agents-integration)`\n"
            "[Visible](#agent-integration)\n"
            "After.\n",
        )

    def test_stale_link_suffix_requires_a_document_path_boundary(self):
        """stale 링크 suffix 대응 시 문서 경로 경계를 요구."""

        text = (
            "[Unrelated](myerrors#logging)\n"
            "[Relative](errors#logging)\n"
            "[Absolute](/docs/10.x/errors#logging)\n"
        )

        out = postprocess.normalize_stale_link_targets(text, "10.x")

        self.assertEqual(
            out,
            "[Unrelated](myerrors#logging)\n"
            "[Relative](logging)\n"
            "[Absolute](/docs/10.x/logging)\n",
        )

    def test_keeps_existing_gfm_admonition_body_inside_blockquote(self):
        """기존 GFM admonition 본문에 blockquote 경계를 유지."""

        text = """> [!NOTE]
<!-- Original note body. -->
번역된 note 본문입니다.

다음 문단입니다.
"""

        out = postprocess.postprocess(text, "12.x", {})

        self.assertEqual(
            out,
            """> [!NOTE]
> <!-- Original note body. -->
> 번역된 note 본문입니다.

다음 문단입니다.
""",
        )

    def test_keeps_fenced_code_admonition_body_inside_blockquote(self):
        """admonition 안의 fenced code 전체에 blockquote 경계를 적용."""

        text = """> [!NOTE]
```php
return true;
```

다음 문단입니다.
"""

        out = postprocess.postprocess(text, "12.x", {})

        self.assertEqual(
            out,
            """> [!NOTE]
> ```php
> return true;
> ```

다음 문단입니다.
""",
        )

    def test_keeps_literal_alerts_inside_outer_fenced_code(self):
        """바깥 fenced code 안의 literal alert 예시를 보존."""

        for marker in ("NOTE", "TIP", "WARNING", "CAUTION", "IMPORTANT"):
            with self.subTest(marker=marker):
                text = (
                    "```markdown\n"
                    f"> [!{marker}]\n"
                    "> literal alert example\n"
                    "```\n"
                )

                self.assertEqual(postprocess.postprocess(text, "12.x", {}), text)

    def test_does_not_close_outer_fence_at_an_inner_fence_with_info(self):
        """info string이 있는 내부 fence를 바깥 fence 종료로 오인하지 않음."""

        text = (
            "```markdown\n"
            "```php\n"
            "> [!NOTE]\n"
            '<img src="example.png">\n'
            "```\n"
            "After.\n"
            "```\n"
        )

        self.assertEqual(postprocess.postprocess(text, "12.x", {}), text)

    def test_standardizes_bold_note_with_colon_inside_bold_text(self):
        """굵은 글씨 내부에 colon이 있는 legacy note 표식을 정규화."""

        text = "> **Note:** Keep this.\n"

        out = postprocess.postprocess(text, "12.x", {})

        self.assertEqual(out, "> [!NOTE]\n> Keep this.\n")

    def test_self_closes_img_with_greater_than_in_quoted_attribute(self):
        """따옴표 속성의 ``>``를 tag 종료로 오인하지 않고 ``img``를 정규화."""

        text = '<img src="example.png" alt="1 > 0">\n'

        out = postprocess.postprocess(text, "12.x", {})

        self.assertEqual(out, '<img src="example.png" alt="1 > 0"/>\n')

    def test_keeps_img_inside_inline_code_spans(self):
        """여러 구분자 길이의 inline code 안에 있는 ``img`` 예시를 보존."""

        cases = (
            'Use `<img src="inline.png">`.\n<img src="outside.png">\n',
            'Use ``<img src="inline.png">``.\n<img src="outside.png">\n',
            (
                "Use ``\n"
                '<img src="inline.png">\n'
                "end ``.\n"
                '<img src="outside.png">\n'
            ),
        )

        for text in cases:
            with self.subTest(text=text):
                out = postprocess.postprocess(text, "12.x", {})

                self.assertIn('<img src="inline.png">', out)
                self.assertNotIn('<img src="inline.png"/>', out)
                self.assertIn('<img src="outside.png"/>', out)

    def test_keeps_self_closed_img_with_greater_than_in_jsx_expression(self):
        """비교 연산자를 포함한 JSX expression의 self-closing ``img``를 보존."""

        text = "<img hidden={count > 0} />\n"

        out = postprocess.postprocess(text, "12.x", {})

        self.assertEqual(out, text)

    def test_keeps_self_closed_img_with_escaped_template_literal_content(self):
        """이스케이프된 템플릿 리터럴을 포함한 자체 닫힘 ``img``를 보존."""

        text = '<img alt={`say \\`hi\\` } > text`} />\n'

        out = postprocess.postprocess(text, "12.x", {})

        self.assertEqual(out, text)

    def test_keeps_self_closed_img_with_complex_jsx_expression(self):
        """주석과 중첩 template을 포함한 JSX expression의 ``img``를 보존."""

        cases = (
            '<img alt={label /* } > */ + "English"} />\n',
            '<img alt={`outer ${`inner } > English ${label}`}`} />\n',
        )

        for text in cases:
            with self.subTest(text=text):
                self.assertEqual(
                    postprocess.postprocess(text, "12.x", {}),
                    text,
                )

    def test_keeps_long_fenced_code_blocks_unmodified(self):
        """더 긴 구분자로 감싼 fenced code 블록의 원문을 보존."""

        text = (
            "````blade\n"
            "```html\n"
            '<img src="{{ $message->embed($pathToImage) }}">\n'
            "```\n"
            "````\n"
        )

        out = postprocess.postprocess(text, "12.x", {})

        self.assertEqual(out, text)

    def test_replaces_version_placeholders_outside_fenced_code_only(self):
        """fenced code 밖의 version placeholder만 대상 버전으로 치환."""

        text = (
            "Read /docs/{{version}}/cache.\n\n"
            "```text\n"
            "{{version}}\n"
            "```\n"
        )

        out = postprocess.postprocess(text, "12.x", {})

        self.assertEqual(
            out,
            "Read /docs/12.x/cache.\n\n```text\n{{version}}\n```\n",
        )

    def test_preserves_version_placeholder_in_quoted_fence(self):
        """blockquote 안 fenced code의 literal version placeholder를 보존."""

        text = "> ```text\n> {{version}}\n> ```\n"

        out = postprocess.postprocess(text, "12.x", {})

        self.assertEqual(out, text)


if __name__ == "__main__":
    unittest.main()
