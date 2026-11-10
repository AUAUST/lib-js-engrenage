import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";

import { collectPaddingEdits } from "#tools/prettier/utils/collectPaddingEdits";
import { isMultiline } from "#tools/prettier/utils/isMultiline";
import { unwrapLabels } from "#tools/prettier/utils/unwrapLabels";
import type { LayoutConvention } from "#tools/prettier/types/LayoutConvention";

const keywords: ReadonlySet<string> = new Set(["const", "let", "var"]);

function isDeclaration(node: TSESTree.Node): boolean {
  if (node.type === AST_NODE_TYPES.VariableDeclaration) {
    return keywords.has(node.kind) && !node.declare;
  }

  return (
    node.type === AST_NODE_TYPES.ExportNamedDeclaration &&
    node.declaration?.type === AST_NODE_TYPES.VariableDeclaration
  );
}

function isMultilineDeclaration(node: TSESTree.Node): boolean {
  const statement = unwrapLabels(node);

  return isDeclaration(statement) && isMultiline(statement);
}

const paddedMultilineDeclarations: LayoutConvention = (program, text) => {
  return collectPaddingEdits(program, text, (previous, next) => {
    return isMultilineDeclaration(previous) || isMultilineDeclaration(next);
  });
};

export default paddedMultilineDeclarations;
