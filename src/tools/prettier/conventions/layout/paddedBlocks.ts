import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";

import { collectPaddingEdits } from "#tools/prettier/utils/collectPaddingEdits";
import { unwrapExports } from "#tools/prettier/utils/unwrapExports";
import { unwrapLabels } from "#tools/prettier/utils/unwrapLabels";
import type { LayoutConvention } from "#tools/prettier/types/LayoutConvention";

const blockLevelTypes: ReadonlySet<string> = new Set([
  AST_NODE_TYPES.BlockStatement,
  AST_NODE_TYPES.ClassDeclaration,
  AST_NODE_TYPES.DoWhileStatement,
  AST_NODE_TYPES.ForInStatement,
  AST_NODE_TYPES.ForOfStatement,
  AST_NODE_TYPES.ForStatement,
  AST_NODE_TYPES.FunctionDeclaration,
  AST_NODE_TYPES.IfStatement,
  AST_NODE_TYPES.SwitchStatement,
  AST_NODE_TYPES.TSEnumDeclaration,
  AST_NODE_TYPES.TSInterfaceDeclaration,
  AST_NODE_TYPES.TSModuleDeclaration,
  AST_NODE_TYPES.TSTypeAliasDeclaration,
  AST_NODE_TYPES.TryStatement,
  AST_NODE_TYPES.WhileStatement,
  AST_NODE_TYPES.WithStatement,
]);

const statementType = /(?:Statement|Declaration)$/u;

function isBlockLevel(node: TSESTree.Node): boolean {
  return blockLevelTypes.has(unwrapExports(unwrapLabels(node)).type);
}

function isStatement(node: TSESTree.Node): boolean {
  const { type } = unwrapLabels(node);

  return type === AST_NODE_TYPES.TSDeclareFunction || statementType.test(type);
}

function isOverloadImplementation(
  previous: TSESTree.Node,
  next: TSESTree.Node,
): boolean {
  return (
    unwrapExports(previous).type === AST_NODE_TYPES.TSDeclareFunction &&
    unwrapExports(next).type === AST_NODE_TYPES.FunctionDeclaration
  );
}

const paddedBlocks: LayoutConvention = (program, text) => {
  return collectPaddingEdits(program, text, (previous, next) => {
    return (
      (isStatement(previous) &&
        isBlockLevel(next) &&
        !isOverloadImplementation(previous, next)) ||
      (isBlockLevel(previous) && isStatement(next))
    );
  });
};

export default paddedBlocks;
