import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";

import { unwrapLabels } from "#tools/prettier/utils/unwrapLabels";

function initializes(
  node: TSESTree.Node | null,
  type: AST_NODE_TYPES,
): boolean {
  return (
    node?.type === AST_NODE_TYPES.VariableDeclaration &&
    node.declarations.some((declarator) => {
      return declarator.init?.type === type;
    })
  );
}

export function isExpressionStatementOf(
  node: TSESTree.Node,
  type: AST_NODE_TYPES,
): boolean {
  const statement = unwrapLabels(node);

  switch (statement.type) {
    case AST_NODE_TYPES.ExpressionStatement: {
      const { expression } = statement;

      return (
        expression.type === type ||
        (expression.type === AST_NODE_TYPES.AssignmentExpression &&
          expression.right.type === type)
      );
    }

    case AST_NODE_TYPES.ExportNamedDeclaration: {
      return initializes(statement.declaration, type);
    }

    default: {
      return initializes(statement, type);
    }
  }
}
