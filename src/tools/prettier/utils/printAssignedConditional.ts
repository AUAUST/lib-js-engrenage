import {
  doc,
  type AstPath,
  type Doc,
  type ParserOptions,
  type Printer,
} from "prettier";

import { isParenthesized } from "#tools/prettier/utils/isParenthesized";
import type { AstNode } from "#tools/prettier/types/AstNode";

const { group, ifBreak, indent, softline } = doc.builders;

export function printAssignedConditional(
  path: AstPath<AstNode>,
  options: ParserOptions<AstNode>,
  print: Parameters<Printer<AstNode>["print"]>[2],
  args: unknown,
  base: Printer<AstNode>,
): Doc {
  return base.print(
    path,
    options,
    (selector, selectorArgs) => {
      const printed = print(selector, selectorArgs);

      return selector !== "test" || isParenthesized(printed)
        ? printed
        : group([
            ifBreak("("),
            indent([softline, printed]),
            softline,
            ifBreak(")"),
          ]);
    },
    args,
  );
}
