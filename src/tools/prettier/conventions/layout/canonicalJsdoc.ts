import type { TSESTree } from "@typescript-eslint/types";

import { filterMap, sort } from "@auaust/primitive-kit/arrays";

import { parseJsdoc, printJsdoc, type JsdocTag } from "#foundation/jsdoc/index";
import { wrapParagraph } from "#tools/prettier/utils/wrapParagraph";
import type { LayoutConvention } from "#tools/prettier/types/LayoutConvention";
import type { LayoutEdit } from "#tools/prettier/types/LayoutEdit";

interface Paragraph {
  prefix: string;
  words: string[];
}

const descriptionTags: ReadonlySet<string> = new Set([
  "description",
  "desc",
  "classdesc",
]);

const prefixWidth = " * ".length;
const listItemPattern = /^(\s*(?:[-*+]|\d+[.)])\s+)(.*)$/;
const verbatimPattern = /^(?:\||#{1,6}(?:\s|$)|>)/;
const lineStartPattern = /^(?:[-*+]|\d+[.)]|#{1,6}|[|>].*|```.*)$/;

function isBlank(text: string): boolean {
  return text.trim() === "";
}

function getColumns(indent: string, tabWidth: number): number {
  return indent.split("").reduce((columns, character) => {
    return columns + (character === "\t" ? tabWidth : 1);
  }, 0);
}

function getWords(text: string): string[] {
  const words: string[] = [];

  for (const word of text.split(/\s+/)) {
    if (word === "") {
      continue;
    }

    const previous = words.at(-1);

    if (previous != null && lineStartPattern.test(word)) {
      words[words.length - 1] = `${previous} ${word}`;
    } else {
      words.push(word);
    }
  }

  return words;
}

function printParagraph({ prefix, words }: Paragraph, width: number): string[] {
  const continuation = " ".repeat(prefix.length);

  return wrapParagraph(words, width - prefix.length).map((line, index) => {
    return `${index === 0 ? prefix : continuation}${line}`;
  });
}

// @debt list items, verbatim lines and paragraphs are told apart by line prefixes instead of a Markdown parser, so nested structures such as indented code blocks or lazy continuation lines are approximated
function wrapDescription(description: string, width: number): string {
  const lines: string[] = [];

  let paragraph: Paragraph | undefined;
  let fenced = false;

  function flush(): void {
    if (paragraph == null) {
      return;
    }

    lines.push(...printParagraph(paragraph, width));
    paragraph = undefined;
  }

  for (const line of description.split("\n")) {
    const content = line.trimStart();

    if (fenced || content.startsWith("```")) {
      flush();
      lines.push(line);

      if (content.startsWith("```")) {
        fenced = !fenced;
      }

      continue;
    }

    if (isBlank(line) || verbatimPattern.test(content)) {
      flush();
      lines.push(line);

      continue;
    }

    const listItem = listItemPattern.exec(line);

    if (listItem != null) {
      flush();

      paragraph = {
        prefix: listItem[1] ?? "",
        words: getWords(listItem[2] ?? ""),
      };

      continue;
    }

    if (paragraph != null) {
      paragraph.words.push(...getWords(line));
    } else if (content === line) {
      paragraph = {
        prefix: "",
        words: getWords(line),
      };
    } else {
      lines.push(line);
    }
  }

  flush();

  return lines.join("\n");
}

function getRank(tag: JsdocTag): number {
  return descriptionTags.has(tag.name) ? 0 : 1;
}

function isAloneOnItsLines(
  text: string,
  lineStart: number,
  comment: TSESTree.Comment,
): boolean {
  const lineEnd = text.indexOf("\n", comment.range[1]);

  return (
    isBlank(text.slice(lineStart, comment.range[0])) &&
    isBlank(text.slice(comment.range[1], lineEnd === -1 ? undefined : lineEnd))
  );
}

const canonicalJsdoc: LayoutConvention = (
  program,
  text,
  { printWidth, tabWidth },
) => {
  const comments: readonly TSESTree.Comment[] = program.comments ?? [];

  return filterMap(comments, (comment): LayoutEdit | undefined => {
    const lineStart = text.lastIndexOf("\n", comment.range[0] - 1) + 1;

    if (
      comment.type !== "Block" ||
      !comment.value.startsWith("*") ||
      !isAloneOnItsLines(text, lineStart, comment)
    ) {
      return;
    }

    const source = text.slice(lineStart, comment.range[1]);
    const block = parseJsdoc(source, lineStart);
    const width = printWidth - getColumns(block.indent, tabWidth) - prefixWidth;

    const printed = printJsdoc({
      ...block,
      description: wrapDescription(block.description, width),
      tags: sort([...block.tags], (first, second) => {
        return getRank(first) - getRank(second);
      }),
    });

    if (printed === source) {
      return;
    }

    return {
      kind: "replace",
      start: lineStart,
      end: comment.range[1],
      text: printed,
    };
  });
};

export default canonicalJsdoc;
