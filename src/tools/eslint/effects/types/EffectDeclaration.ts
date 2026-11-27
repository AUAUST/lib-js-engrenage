import type { SyntaxNode } from "#tools/eslint/effects/types/SyntaxNode";

/**
 * A function or class whose effect doc tag declares its invocation `level`.
 */
export interface EffectDeclaration {
  node: SyntaxNode;
  level: string;
}
