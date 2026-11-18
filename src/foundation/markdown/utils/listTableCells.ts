import { fromMarkdown } from "mdast-util-from-markdown";
import { frontmatterFromMarkdown } from "mdast-util-frontmatter";
import { gfmTableFromMarkdown } from "mdast-util-gfm-table";
import { frontmatter } from "micromark-extension-frontmatter";
import { gfmTable } from "micromark-extension-gfm-table";

import type { TableCell } from "#foundation/markdown/types/TableCell";

type MarkdownNode = ReturnType<typeof fromMarkdown>["children"][number];

/**
 * Lists every GFM table cell of `content`, at any depth and header rows
 * included, in source order.
 */
export function listTableCells(content: string): readonly TableCell[] {
  const cells: TableCell[] = [];

  function visit(node: MarkdownNode) {
    if (node.type === "tableCell") {
      const line = node.position?.start.line;

      if (line === undefined) {
        return;
      }

      const start = node.children.at(0)?.position?.start.offset;
      const end = node.children.at(-1)?.position?.end.offset;

      return void cells.push({
        line,
        text: start === undefined || end === undefined
          ? ""
          : content.slice(start, end),
      });
    }

    if ("children" in node) {
      for (const child of node.children) {
        visit(child);
      }
    }
  }

  for (const node of fromMarkdown(content, {
    extensions: [frontmatter(), gfmTable()],
    mdastExtensions: [frontmatterFromMarkdown(), gfmTableFromMarkdown()],
  }).children) {
    visit(node);
  }

  return cells;
}
