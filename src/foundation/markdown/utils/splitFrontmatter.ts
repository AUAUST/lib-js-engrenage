import { fromMarkdown } from "mdast-util-from-markdown";
import { frontmatterFromMarkdown } from "mdast-util-frontmatter";
import { frontmatter } from "micromark-extension-frontmatter";

import type { MarkdownFrontmatter } from "#foundation/markdown/types/MarkdownFrontmatter";

const fence = "---";

function skipLineEnding(content: string, offset: number) {
  if (content.startsWith("\r\n", offset)) {
    return offset + 2;
  }

  return content.startsWith("\n", offset) ? offset + 1 : offset;
}

function parseFirstNode(content: string) {
  return fromMarkdown(content, {
    extensions: [frontmatter()],
    mdastExtensions: [frontmatterFromMarkdown()],
  }).children.at(0);
}

function sliceThroughFirstFenceLine(content: string) {
  const fenceLine = content.indexOf(`\n${fence}`);

  if (fenceLine === -1) {
    return content;
  }

  const lineEnd = content.indexOf("\n", fenceLine + 1);

  return lineEnd === -1 ? content : content.slice(0, lineEnd + 1);
}

function parseLeadingNode(content: string) {
  const prefix = sliceThroughFirstFenceLine(content);

  const first = parseFirstNode(prefix);

  return first?.type === "yaml" || prefix === content
    ? first
    : parseFirstNode(content);
}

export function splitFrontmatter(content: string): MarkdownFrontmatter {
  const first = parseLeadingNode(content);

  const end = first?.position?.end.offset;

  if (first === undefined || end === undefined) {
    return { kind: "none", body: content };
  }

  if (first.type === "yaml") {
    const source = content.slice(0, skipLineEnding(content, end));

    return {
      kind: "closed",
      source,
      yaml: first.value,
      body: content.slice(source.length),
    };
  }

  const opensFence = (
    first.type === "thematicBreak" &&
    first.position?.start.offset === 0 &&
    content.slice(0, end).trimEnd() === fence
  );

  return { kind: opensFence ? "unclosed" : "none", body: content };
}
