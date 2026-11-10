import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";

export function unwrapLabels(node: TSESTree.Node): TSESTree.Node {
  return node.type === AST_NODE_TYPES.LabeledStatement
    ? unwrapLabels(node.body)
    : node;
}
