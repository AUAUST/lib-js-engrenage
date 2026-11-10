import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";

export function unwrapExports(node: TSESTree.Node): TSESTree.Node {
  if (
    (node.type === AST_NODE_TYPES.ExportNamedDeclaration ||
      node.type === AST_NODE_TYPES.ExportDefaultDeclaration) &&
    node.declaration != null
  ) {
    return node.declaration;
  }

  return node;
}
