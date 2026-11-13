import { MagicString, type SourceMap } from "magic-string";
import {
  createScanner,
  LanguageVariant,
  ScriptTarget,
  SyntaxKind,
} from "typescript";

import { isNotEmpty } from "@auaust/primitive-kit/arrays";

import { parseJsdoc, printJsdoc } from "#foundation/jsdoc/index";

const lineSpacing = /^[\t ]*$/;

// @debt the scanner runs without a parser, so template literal types rely on hand-tracked braces; the declaration emitter or rolldown-plugin-dts should expose the comments it prints
function findJsdocRanges(code: string): [start: number, end: number][] {
  const scanner = createScanner(
    ScriptTarget.Latest,
    false,
    LanguageVariant.Standard,
    code,
  );

  const ranges: [start: number, end: number][] = [];
  const braces: boolean[] = [];

  for (
    let token = scanner.scan();
    token !== SyntaxKind.EndOfFileToken;
    token = scanner.scan()
  ) {
    if (token === SyntaxKind.MultiLineCommentTrivia) {
      const text = scanner.getTokenText();

      if (text.startsWith("/**") && text !== "/**/") {
        ranges.push([scanner.getTokenStart(), scanner.getTokenEnd()]);
      }
    } else if (
      token === SyntaxKind.OpenBraceToken ||
      token === SyntaxKind.TemplateHead
    ) {
      braces.push(token === SyntaxKind.TemplateHead);
    } else if (
      token === SyntaxKind.CloseBraceToken &&
      braces.pop() === true &&
      scanner.reScanTemplateToken(false) === SyntaxKind.TemplateMiddle
    ) {
      braces.push(true);
    }
  }

  return ranges;
}

function findLineStart(code: string, index: number): number {
  return code.lastIndexOf("\n", index - 1) + 1;
}

function findLineEnd(code: string, index: number): number {
  const end = code.indexOf("\n", index);

  return end === -1 ? code.length : end;
}

function findSpacingEnd(code: string, index: number): number {
  let end = index;

  while (end < code.length && lineSpacing.test(code.charAt(end))) {
    end += 1;
  }

  return end;
}

function trimTags(
  code: string,
  output: MagicString,
  [start, end]: [start: number, end: number],
  internal: ReadonlySet<string>,
) {
  const lineStart = findLineStart(code, start);
  const lineEnd = findLineEnd(code, end);

  const alone = (
    lineSpacing.test(code.slice(lineStart, start)) &&
    lineSpacing.test(code.slice(end, lineEnd))
  );

  const from = alone ? lineStart : start;
  const block = parseJsdoc(code.slice(from, end), from);
  const tags = block.tags.filter(({ name }) => !internal.has(name));

  if (tags.length === block.tags.length) {
    return;
  }

  if (block.description === "" && !isNotEmpty(tags)) {
    if (alone) {
      output.remove(lineStart, Math.min(lineEnd + 1, code.length));
    } else {
      output.remove(start, end);
    }

    return;
  }

  if (!alone && !code.slice(start, end).includes("\n")) {
    for (const tag of block.tags) {
      if (!internal.has(tag.name)) {
        continue;
      }

      const [tagStart, tagEnd] = tag.range;

      output.remove(tagStart, findSpacingEnd(code, tagEnd));
    }

    return;
  }

  output.overwrite(from, end, printJsdoc({ ...block, tags }));
}

export function trimInternalTags(
  code: string,
  internal: ReadonlySet<string>,
): { code: string; map: SourceMap } | undefined {
  const output = new MagicString(code);

  for (const range of findJsdocRanges(code)) {
    trimTags(code, output, range, internal);
  }

  if (!output.hasChanged()) {
    return;
  }

  return {
    code: output.toString(),
    map: output.generateMap({ hires: "boundary" }),
  };
}
