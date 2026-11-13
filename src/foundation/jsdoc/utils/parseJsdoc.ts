import { parse, tokenizers, type Block, type Line } from "comment-parser";

import { isJsdocComment } from "#foundation/jsdoc/utils/isJsdocComment";
import type { JsdocBlock } from "#foundation/jsdoc/types/JsdocBlock";

const indentPattern = /^[\t ]*/;
const tagStartPattern = /`[^`]*`|(?<!\S)@[^\s@]/g;

interface SplitTag {
  name: string;
  lines: string[];
  start: number;
  end: number;
}

export function parseJsdoc(text: string, offset = 0): JsdocBlock {
  const indent = text.match(indentPattern)?.[0] ?? "";

  if (
    !isJsdocComment(text.slice(indent.length)) ||
    text.indexOf("*/", indent.length + 3) !== text.length - 2
  ) {
    throw new Error(`Expected one JSDoc comment, got: ${text}`);
  }

  // @debt comment-parser now only splits lines while its tokenizers' tags are discarded and splitTags re-tokenizes every line; a plain line splitter could replace the dependency.
  const blocks = parse(text, {
    spacing: "preserve",
    tokenizers: [tokenizers.tag(), tokenizers.description("preserve")],
  });

  const block = blocks[0];

  if (blocks.length !== 1 || block == null) {
    throw new Error(`Expected one JSDoc comment, got: ${text}`);
  }

  return {
    range: [offset + indent.length, offset + text.length],
    indent,
    ...splitTags(block, getLineStarts(text), offset),
  };
}

function getLineStarts(text: string): number[] {
  const starts = [0];

  for (
    let index = text.indexOf("\n");
    index !== -1;
    index = text.indexOf("\n", index + 1)
  ) {
    starts.push(index + 1);
  }

  return starts;
}

function splitTags(
  block: Block,
  lineStarts: number[],
  offset: number,
): Pick<JsdocBlock, "description" | "tags"> {
  const descriptionLines: string[] = [];
  const tags: SplitTag[] = [];

  let fenced = false;

  for (const line of block.source) {
    const contentStart = offset + getContentStart(line, lineStarts);
    const content = getContent(line);
    // @debt fences indented by up to three spaces, valid in Markdown, are not recognized, so an `@` inside them starts a tag
    const isFence = content.startsWith("```");

    const tagStarts = fenced || isFence
      ? []
      : [...content.matchAll(tagStartPattern)]
          .filter((match) => match[0].startsWith("@"))
          .map((match) => match.index);

    if (isFence) {
      fenced = !fenced;
    }

    if (tagStarts[0] !== 0) {
      const piece = content.slice(0, tagStarts[0]);
      const owner = tags.at(-1);

      if (owner == null) {
        descriptionLines.push(piece);
      } else {
        owner.lines.push(piece);
        owner.end = getPieceEnd(piece, contentStart) ?? owner.end;
      }
    }

    for (const [index, start] of tagStarts.entries()) {
      const piece = content.slice(start, tagStarts[index + 1]);
      const [name = ""] = piece.slice(1).split(/\s/, 1);

      tags.push({
        name,
        lines: [piece.slice(name.length + 1).trimStart()],
        start: contentStart + start,
        end: contentStart + start + piece.trimEnd().length,
      });
    }
  }

  return {
    description: descriptionLines
      .join("\n")
      .replace(/^(?:[\t ]*\n)+/, "")
      .trimEnd(),
    tags: tags.map(({ name, lines, start, end }) => {
      return {
        name,
        text: lines.join("\n").trimEnd(),
        range: [start, end],
      };
    }),
  };
}

function getContentStart(line: Line, lineStarts: number[]): number {
  const { start, delimiter, postDelimiter } = line.tokens;
  const lineStart = lineStarts[line.number];

  if (lineStart == null) {
    throw new Error(`JSDoc line ${line.number} is outside its text`);
  }

  return (
    lineStart +
    start.length +
    delimiter.length +
    Math.min(postDelimiter.length, 1)
  );
}

function getContent(line: Line): string {
  const { postDelimiter, tag, postTag, description } = line.tokens;

  return `${postDelimiter.slice(1)}${tag}${postTag}${description}`;
}

function getPieceEnd(piece: string, pieceStart: number): number | undefined {
  const trimmed = piece.trimEnd();

  return trimmed === "" ? undefined : pieceStart + trimmed.length;
}
