import { doc, type Doc, type ParserOptions } from "prettier";

import type { AstNode } from "#tools/prettier/types/AstNode";

// @debt sub-docs are printed to text while the doc is built, to measure widths `fits` cannot reach
export function printLines(
  target: Doc,
  options: ParserOptions<AstNode>,
  printWidth: number,
): readonly string[] {
  return doc.printer
    .printDocToString(target, { ...options, printWidth })
    .formatted.split("\n");
}
