import { fromMarkdown } from "mdast-util-from-markdown";
import { frontmatterFromMarkdown } from "mdast-util-frontmatter";
import { frontmatter } from "micromark-extension-frontmatter";

import type { CodeRange } from "#foundation/markdown/types/CodeRange";

type MarkdownNode = ReturnType<typeof fromMarkdown>["children"][number];

// @debt the four parsing utils of this domain each repeat the parser options, since a shared `parseMarkdown` util would join the public barrel and a `constants.ts` value must be deeply read-only, which the parser's option types reject
/**
 * Lists the code blocks, fenced or indented, and code spans of `content` by
 * source offset, in source order.
 */
export function listCodeRanges(content: string): readonly CodeRange[] {
  const ranges: CodeRange[] = [];

  function visit(node: MarkdownNode) {
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;

    if (
      (node.type === "code" || node.type === "inlineCode") &&
      start !== undefined &&
      end !== undefined
    ) {
      return void ranges.push({
        kind: node.type === "code" ? "block" : "span",
        start,
        end,
      });
    }

    if ("children" in node) {
      for (const child of node.children) {
        visit(child);
      }
    }
  }

  for (const node of fromMarkdown(content, {
    extensions: [frontmatter()],
    mdastExtensions: [frontmatterFromMarkdown()],
  }).children) {
    visit(node);
  }

  return ranges;
}
