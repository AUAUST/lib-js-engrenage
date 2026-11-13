import type { TSESTree } from "@typescript-eslint/types";

import { filterMap, sort } from "@auaust/primitive-kit/arrays";

import { parseJsdoc, printJsdoc, type JsdocTag } from "#foundation/jsdoc/index";
import { splitDocTag, type TagDeclaration } from "#project/docs/index";
import { wrapParagraph } from "#tools/prettier/utils/wrapParagraph";
import type { LayoutConvention } from "#tools/prettier/types/LayoutConvention";
import type { LayoutEdit } from "#tools/prettier/types/LayoutEdit";

interface Paragraph {
  prefix: string;
  words: string[];
}

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
function wrapDescription(
  description: string,
  width: number,
  head?: string,
): string {
  const lines: string[] = [];

  let paragraph: Paragraph | undefined;
  let fenced = false;
  let pendingHead = head;

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
      const [first = "", ...rest] = getWords(line);

      paragraph = {
        prefix: "",
        words: lines.length === 0 && pendingHead !== undefined
          ? [`${pendingHead} ${first}`, ...rest]
          : [first, ...rest],
      };

      pendingHead = undefined;
    } else {
      lines.push(line);
    }
  }

  flush();

  return (pendingHead === undefined ? lines : [pendingHead, ...lines]).join(
    "\n",
  );
}

function printTagBody(
  declaration: TagDeclaration,
  text: string,
  head: string,
  body: string,
  width: number,
): string {
  if (body === "") {
    return head;
  }

  if (declaration.body === "inline") {
    return `${head} ${body.replaceAll(/\s+/g, " ")}`;
  }

  if (declaration.body === "text") {
    return wrapDescription(body, width, head);
  }

  // @debt a code body's raw lines are recovered by slicing the tag text, which holds only while `splitDocTag` returns the body as the text's unmodified tail; it could return the body's offset instead
  const headText = text.slice(0, text.length - body.length);
  const lineBreak = headText.lastIndexOf("\n");

  return lineBreak === -1
    ? `${head} ${body}`
    : `${head}\n${text.slice(lineBreak + 1)}`;
}

function formatTag(
  tags: readonly TagDeclaration[],
  tag: JsdocTag,
  width: number,
): JsdocTag {
  const declaration = tags.find(({ name }) => name === tag.name);

  if (declaration === undefined) {
    return tag;
  }

  const split = splitDocTag(declaration, tag.text);

  if (!split.ok) {
    return tag;
  }

  const name = `@${tag.name}`;

  const head = [
    name,
    ...(split.type === undefined ? [] : [`{${split.type}}`]),
    ...(split.subject === undefined ? [] : [split.subject]),
  ].join(" ");

  const printed = printTagBody(
    declaration,
    tag.text,
    split.subject === undefined || split.body === "" ? head : `${head} -`,
    split.body,
    width,
  );

  return {
    ...tag,
    text: printed.slice(name.length).replace(/^ /, ""),
  };
}

function getRank(tags: readonly TagDeclaration[], tag: JsdocTag): number {
  const index = tags.findIndex(({ name }) => name === tag.name);

  return index === -1 ? tags.length : index;
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
  { printWidth, tabWidth, tags },
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
      tags: sort(
        block.tags.map((tag) => formatTag(tags, tag, width)),
        (first, second) => getRank(tags, first) - getRank(tags, second),
      ),
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
