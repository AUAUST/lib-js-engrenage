import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";

import { visitNodes } from "#tools/prettier/utils/visitNodes";

interface StatementPair {
  previous: TSESTree.Node;
  next: TSESTree.Node;
}

function listStatements(node: TSESTree.Node): readonly TSESTree.Node[] {
  switch (node.type) {
    case AST_NODE_TYPES.Program:
    case AST_NODE_TYPES.BlockStatement:
    case AST_NODE_TYPES.StaticBlock:
    case AST_NODE_TYPES.TSModuleBlock: {
      return node.body;
    }

    case AST_NODE_TYPES.SwitchCase: {
      return node.consequent;
    }

    default: {
      return [];
    }
  }
}

export function collectStatementPairs(
  program: TSESTree.Program,
): readonly StatementPair[] {
  const pairs: StatementPair[] = [];

  visitNodes(program, (node) => {
    const statements = listStatements(node);

    for (const [index, next] of statements.entries()) {
      const previous = statements[index - 1];

      if (previous !== undefined) {
        pairs.push({
          previous,
          next,
        });
      }
    }
  });

  return pairs;
}
