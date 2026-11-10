import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";

import { collectPaddingEdits } from "#tools/prettier/utils/collectPaddingEdits";
import { isExpressionStatementOf } from "#tools/prettier/utils/isExpressionStatementOf";
import type { LayoutConvention } from "#tools/prettier/types/LayoutConvention";

function isAwait(node: TSESTree.Node): boolean {
  return isExpressionStatementOf(node, AST_NODE_TYPES.AwaitExpression);
}

const paddedAwaits: LayoutConvention = (program, text) => {
  return collectPaddingEdits(program, text, (previous, next) => {
    return isAwait(previous) || isAwait(next);
  });
};

export default paddedAwaits;
