import { fromMarkdown } from "mdast-util-from-markdown";
import { frontmatterFromMarkdown } from "mdast-util-frontmatter";
import { frontmatter } from "micromark-extension-frontmatter";

import type { MarkdownSection } from "#foundation/markdown/types/MarkdownSection";

function trimLineEnding(source: string) {
  if (source.endsWith("\r\n")) {
    return source.slice(0, -2);
  }

  return source.endsWith("\n") ? source.slice(0, -1) : source;
}

/**
 * Splits `content` at its top-level ATX headings of `depth`, the first section
 * holding what precedes them, each section sliced verbatim from the source.
 */
export function splitSections(
  content: string,
  depth: number,
): readonly MarkdownSection[] {
  const headings = fromMarkdown(content, {
    extensions: [frontmatter()],
    mdastExtensions: [frontmatterFromMarkdown()],
  }).children.flatMap((node) => {
    const start = node.position?.start.offset;

    if (
      node.type !== "heading" ||
      node.depth !== depth ||
      start === undefined ||
      content[start] !== "#"
    ) {
      return [];
    }

    const [first] = node.children;
    const last = node.children.at(-1);

    const name = content
      .slice(
        first?.position?.start.offset ?? 0,
        last?.position?.end.offset ?? 0,
      )
      .trim();

    return { name, start };
  });

  const bounds = [{ name: undefined, start: 0 }, ...headings];

  return bounds.map(({ name, start }, index) => {
    const next = bounds[index + 1]?.start;

    return {
      name,
      start,
      source: next === undefined
        ? content.slice(start)
        : trimLineEnding(content.slice(start, next)),
    };
  });
}
