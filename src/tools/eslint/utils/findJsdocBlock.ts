import type { TSESTree } from "@typescript-eslint/types";
import type { SourceCode } from "eslint";

import { isJsdocBlock } from "#tools/eslint/utils/isJsdocBlock";

export function findJsdocBlock(
  sourceCode: SourceCode,
  node: TSESTree.Node,
): ReturnType<SourceCode["getAllComments"]>[number] | undefined {
  // @debt ESLint types its AST as ESTree, without the TypeScript nodes the parser produces
  return sourceCode.getCommentsBefore(node as never).findLast(isJsdocBlock);
}
