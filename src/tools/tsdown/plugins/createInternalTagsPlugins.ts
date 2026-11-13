import { MagicString } from "magic-string";
import {
  createScanner,
  LanguageVariant,
  ScriptTarget,
  SyntaxKind,
} from "typescript";
import type { TsdownPlugin } from "tsdown";

import { isNotEmpty } from "@auaust/primitive-kit/arrays";

import { parseJsdoc, printJsdoc } from "#foundation/jsdoc/index";

const declarationChunk = /\.d\.[cm]?ts$/;

const lineSpacing = /^[\t ]*$/;

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

  output.overwrite(from, end, printJsdoc({ ...block, tags }));
}

export function createInternalTagsPlugins(
  name: string,
  tags: readonly string[],
): TsdownPlugin[] {
  const internal = new Set(tags);

  return [
    {
      name,
      renderChunk(code, { fileName }) {
        if (!declarationChunk.test(fileName)) {
          return null;
        }

        const output = new MagicString(code);

        for (const range of findJsdocRanges(code)) {
          trimTags(code, output, range, internal);
        }

        if (!output.hasChanged()) {
          return null;
        }

        return {
          code: output.toString(),
          map: output.generateMap({ hires: "boundary" }),
        };
      },
    },
  ];
}
