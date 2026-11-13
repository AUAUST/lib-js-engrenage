import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";

export function readOverload(
  holder: TSESTree.Node,
): { readonly key: string; readonly implementation: boolean } | undefined {
  const node = (
    (holder.type === AST_NODE_TYPES.ExportNamedDeclaration ||
      holder.type === AST_NODE_TYPES.ExportDefaultDeclaration) &&
    holder.declaration != null
  )
    ? holder.declaration
    : holder;

  if (
    (node.type === AST_NODE_TYPES.FunctionDeclaration ||
      node.type === AST_NODE_TYPES.TSDeclareFunction) &&
    node.id != null
  ) {
    return {
      key: `function ${node.id.name}`,
      implementation: node.type === AST_NODE_TYPES.FunctionDeclaration,
    };
  }

  if (
    (node.type === AST_NODE_TYPES.MethodDefinition ||
      node.type === AST_NODE_TYPES.TSAbstractMethodDefinition) &&
    !node.computed &&
    node.key.type === AST_NODE_TYPES.Identifier
  ) {
    return {
      key: `${node.static ? "static " : ""}${node.kind} ${node.key.name}`,
      implementation: node.value.type === AST_NODE_TYPES.FunctionExpression,
    };
  }
}
