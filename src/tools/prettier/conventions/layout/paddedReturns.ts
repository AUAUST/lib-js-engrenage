import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";

import { collectPaddingEdits } from "#tools/prettier/utils/collectPaddingEdits";
import { unwrapLabels } from "#tools/prettier/utils/unwrapLabels";
import type { LayoutConvention } from "#tools/prettier/types/LayoutConvention";

function isReturn(node: TSESTree.Node): boolean {
  return unwrapLabels(node).type === AST_NODE_TYPES.ReturnStatement;
}

const paddedReturns: LayoutConvention = (program, text) => {
  return collectPaddingEdits(program, text, (previous, next) => {
    return isReturn(next);
  });
};

export default paddedReturns;
