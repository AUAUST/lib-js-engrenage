import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";

import { collectPaddingEdits } from "#tools/prettier/utils/collectPaddingEdits";
import { isExpressionStatementOf } from "#tools/prettier/utils/isExpressionStatementOf";
import type { LayoutConvention } from "#tools/prettier/types/LayoutConvention";

function isYield(node: TSESTree.Node): boolean {
  return isExpressionStatementOf(node, AST_NODE_TYPES.YieldExpression);
}

const paddedYields: LayoutConvention = (program, text) => {
  return collectPaddingEdits(program, text, (previous, next) => {
    return isYield(previous) || isYield(next);
  });
};

export default paddedYields;
