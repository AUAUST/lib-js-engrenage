import { isObject } from "@auaust/toolkit";

import { wrapperTypes } from "#tools/eslint/effects/constants";
import type { SyntaxNode } from "#tools/eslint/effects/types/SyntaxNode";

/**
 * The expression `expression` wraps in optional chains, non-null and type
 * assertions, or `expression` itself.
 */
export function unwrapExpression<Node extends SyntaxNode | null | undefined>(
  expression: Node,
): Node | SyntaxNode {
  let node: Node | SyntaxNode = expression;

  while (
    node != null &&
    wrapperTypes.has(node.type) &&
    "expression" in node &&
    isObject(node.expression)
  ) {
    node = node.expression;
  }

  return node;
}
