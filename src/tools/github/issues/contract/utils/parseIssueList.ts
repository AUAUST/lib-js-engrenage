import { listCodeRanges } from "#foundation/markdown/index";

const numberedPattern = /^\d+\.\s+(.*)$/;
const bulletPattern = /^[-*]\s+(.*)$/;

export function parseIssueList(content: string): {
  readonly numbered: boolean;
  readonly items: readonly string[];
} {
  const items: string[] = [];

  const blocks = listCodeRanges(content).filter(({ kind }) => {
    return kind === "block";
  });

  let numbered = true;
  let offset = 0;

  for (const line of content.split("\n")) {
    const lineStart = offset;

    offset += line.length + 1;

    const insideFence = blocks.some(({ start, end }) => {
      return lineStart + line.length > start && lineStart < end;
    });

    if (insideFence || line.trim() === "") {
      continue;
    }

    const number = numberedPattern.exec(line);
    const bullet = number === null ? bulletPattern.exec(line) : null;
    const item = number ?? bullet;

    if (item !== null) {
      items.push(item[1] ?? "");
      numbered &&= number !== null;
    } else if (/^\s/.test(line) && items.length > 0) {
      items.push(`${items.pop() ?? ""}\n${line.trim()}`);
    } else {
      numbered = false;
    }
  }

  return {
    numbered: numbered && items.length > 0,
    items,
  };
}
