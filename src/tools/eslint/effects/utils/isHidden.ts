import type { Scope } from "eslint";

import { freshTypes, reassignableKinds } from "#tools/eslint/effects/constants";
import { unwrapExpression } from "#tools/eslint/effects/utils/unwrapExpression";
import type { SyntaxNode } from "#tools/eslint/effects/types/SyntaxNode";

function isFresh(expression: SyntaxNode | null | undefined): boolean {
  const node = unwrapExpression(expression);

  return node != null && freshTypes.has(node.type);
}

/**
 * Whether the value `variable` holds is one a call result or a reassignment
 * hides: a `const` initialized, or a `let` or `var` assigned, with anything
 * but a fresh value.
 */
export function isHidden(variable: Scope.Variable): boolean {
  const [definition] = variable.defs;

  if (definition?.type !== "Variable") {
    return false;
  }

  return reassignableKinds.has(definition.parent.kind)
    ? variable.references.some(({ writeExpr }) => {
        return writeExpr != null && !isFresh(writeExpr);
      })
    : !isFresh(definition.node.init);
}
