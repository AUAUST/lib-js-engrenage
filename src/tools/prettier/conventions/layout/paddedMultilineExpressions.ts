import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";

import { collectPaddingEdits } from "#tools/prettier/utils/collectPaddingEdits";
import { isMultiline } from "#tools/prettier/utils/isMultiline";
import { unwrapLabels } from "#tools/prettier/utils/unwrapLabels";
import type { LayoutConvention } from "#tools/prettier/types/LayoutConvention";

function isMultilineExpression(node: TSESTree.Node): boolean {
  const statement = unwrapLabels(node);

  return (
    statement.type === AST_NODE_TYPES.ExpressionStatement &&
    statement.directive === undefined &&
    isMultiline(statement)
  );
}

const paddedMultilineExpressions: LayoutConvention = (program, text) => {
  return collectPaddingEdits(program, text, (previous, next) => {
    return isMultilineExpression(previous) || isMultilineExpression(next);
  });
};

export default paddedMultilineExpressions;
