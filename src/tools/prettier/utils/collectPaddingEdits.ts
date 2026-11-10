import type { TSESTree } from "@typescript-eslint/types";

import { filterMap } from "@auaust/primitive-kit/arrays";

import { collectStatementPairs } from "#tools/prettier/utils/collectStatementPairs";
import { createPaddingEdit } from "#tools/prettier/utils/createPaddingEdit";
import type { LayoutEdit } from "#tools/prettier/types/LayoutEdit";

export function collectPaddingEdits(
  program: TSESTree.Program,
  text: string,
  isPadded: (previous: TSESTree.Node, next: TSESTree.Node) => boolean,
): readonly LayoutEdit[] {
  return filterMap(collectStatementPairs(program), ({ previous, next }) => {
    if (isPadded(previous, next)) {
      return createPaddingEdit(program, text, previous, next);
    }
  });
}
