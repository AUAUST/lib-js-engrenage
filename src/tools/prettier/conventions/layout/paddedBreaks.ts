import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";

import { collectPaddingEdits } from "#tools/prettier/utils/collectPaddingEdits";
import { unwrapLabels } from "#tools/prettier/utils/unwrapLabels";
import type { LayoutConvention } from "#tools/prettier/types/LayoutConvention";

function isBreak(node: TSESTree.Node): boolean {
  return unwrapLabels(node).type === AST_NODE_TYPES.BreakStatement;
}

const paddedBreaks: LayoutConvention = (program, text) => {
  return collectPaddingEdits(program, text, (previous, next) => {
    return isBreak(previous) || isBreak(next);
  });
};

export default paddedBreaks;
