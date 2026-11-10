import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";

import { collectPaddingEdits } from "#tools/prettier/utils/collectPaddingEdits";
import { unwrapLabels } from "#tools/prettier/utils/unwrapLabels";
import type { LayoutConvention } from "#tools/prettier/types/LayoutConvention";

const keywords: ReadonlySet<string> = new Set(["const", "let", "var"]);

function getKeyword(node: TSESTree.Node): string | undefined {
  const statement = unwrapLabels(node);

  if (
    statement.type === AST_NODE_TYPES.VariableDeclaration &&
    keywords.has(statement.kind) &&
    !statement.declare
  ) {
    return statement.kind;
  }
}

const paddedVariableDeclarations: LayoutConvention = (program, text) => {
  return collectPaddingEdits(program, text, (previous, next) => {
    const previousKeyword = getKeyword(previous);
    const nextKeyword = getKeyword(next);

    return (
      (previousKeyword !== undefined || nextKeyword !== undefined) &&
      previousKeyword !== nextKeyword
    );
  });
};

export default paddedVariableDeclarations;
