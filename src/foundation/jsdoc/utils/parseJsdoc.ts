import { parse, tokenizers, type Block, type Line } from "comment-parser";

import type { JsdocBlock } from "#foundation/jsdoc/types/JsdocBlock";
import type { JsdocTag } from "#foundation/jsdoc/types/JsdocTag";

const openingPattern = /^[\t ]*\/\*\*(?!\/)/;
const inlineTagPattern = /`[^`]*`|(?<!\S)@[^\s@]/g;

export function parseJsdoc(text: string, offset = 0): JsdocBlock {
  const indent = text.match(openingPattern)?.[0].slice(0, -3);

  if (
    indent == null ||
    text.indexOf("*/", indent.length + 3) !== text.length - 2
  ) {
    throw new Error(`Expected one JSDoc comment, got: ${text}`);
  }

  const blocks = parse(text, {
    spacing: "preserve",
    tokenizers: [tokenizers.tag(), tokenizers.description("preserve")],
  });

  const block = blocks[0];

  if (blocks.length !== 1 || block == null) {
    throw new Error(`Expected one JSDoc comment, got: ${text}`);
  }

  const range = [offset + indent.length, offset + text.length] as const;

  if (block.source.length === 1) {
    return {
      range,
      indent,
      ...splitSingleLine(
        text.slice(indent.length + 3, -2),
        offset + indent.length + 3,
      ),
    };
  }

  return {
    range,
    indent,
    description: block.description.replace(/^(?:[\t ]*\n)+/, "").trimEnd(),
    tags: readTags(block, getLineStarts(text), offset),
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

function readTags(
  block: Block,
  lineStarts: number[],
  offset: number,
): JsdocTag[] {
  return block.tags.map((spec) => {
    const [first] = spec.source;

    const last = spec.source.findLast((line) => {
      return line.tokens.tag !== "" || line.tokens.description.trim() !== "";
    });

    if (first == null || last == null) {
      throw new Error(`JSDoc tag @${spec.tag} has no source line`);
    }

    return {
      name: spec.tag,
      text: spec.description.trimEnd(),
      range: [
        offset + getContentStart(first, lineStarts),
        offset +
          getContentStart(last, lineStarts) +
          `${last.tokens.tag}${last.tokens.postTag}${last.tokens.description}`.trimEnd()
            .length,
      ],
    };
  });
}

function getContentStart(line: Line, lineStarts: number[]): number {
  const { start, delimiter, postDelimiter } = line.tokens;
  const lineStart = lineStarts[line.number];

  if (lineStart == null) {
    throw new Error(`JSDoc line ${line.number} is outside its text`);
  }

  return lineStart + start.length + delimiter.length + postDelimiter.length;
}

// @debt single-line blocks are split into tags by a second tokenizer beside comment-parser's, which reads tags only at line starts
function splitSingleLine(
  content: string,
  contentOffset: number,
): Pick<JsdocBlock, "description" | "tags"> {
  const tagStarts = [...content.matchAll(inlineTagPattern)]
    .filter((match) => match[0].startsWith("@"))
    .map((match) => match.index);

  const tags = tagStarts.map((start, index) => {
    const segment = content.slice(start, tagStarts[index + 1]).trimEnd();
    const [name = ""] = segment.slice(1).split(/\s/, 1);

    return {
      name,
      text: segment.slice(name.length + 1).trimStart(),
      range: [
        contentOffset + start,
        contentOffset + start + segment.length,
      ] as const,
    };
  });

  return {
    description: content.slice(0, tagStarts[0]).trim(),
    tags,
  };
}
