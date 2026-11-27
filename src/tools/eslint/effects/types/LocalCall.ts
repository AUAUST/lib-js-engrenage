import type { SyntaxNode } from "#tools/eslint/effects/types/SyntaxNode";

/**
 * A call to the local function or class `callee`, named `name`, at `node`.
 */
export interface LocalCall {
  callee: SyntaxNode;
  node: SyntaxNode;
  name: string;
}
