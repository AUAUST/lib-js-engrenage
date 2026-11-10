import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";

import { filterMap } from "@auaust/primitive-kit/arrays";

import { collectStatementPairs } from "#tools/prettier/utils/collectStatementPairs";
import { createPaddingEdit } from "#tools/prettier/utils/createPaddingEdit";
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
  return filterMap(collectStatementPairs(program), ({ previous, next }) => {
    if (isMultilineExpression(previous) || isMultilineExpression(next)) {
      return createPaddingEdit(program, text, previous, next);
    }
  });
};

export default paddedMultilineExpressions;
