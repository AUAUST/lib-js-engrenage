import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";

import { filterMap } from "@auaust/primitive-kit/arrays";

import { collectStatementPairs } from "#tools/prettier/utils/collectStatementPairs";
import { createPaddingEdit } from "#tools/prettier/utils/createPaddingEdit";
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
  return filterMap(collectStatementPairs(program), ({ previous, next }) => {
    if (isMultilineDeclaration(previous) || isMultilineDeclaration(next)) {
      return createPaddingEdit(program, text, previous, next);
    }
  });
};

export default paddedMultilineDeclarations;
