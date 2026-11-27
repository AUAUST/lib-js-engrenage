import { classNodeTypes } from "#tools/eslint/effects/constants";
import type { SyntaxNode } from "#tools/eslint/effects/types/SyntaxNode";

/**
 * Whether `parent` invokes `child`: as a callee, a template tag, a decorator or
 * the class a class extends.
 */
export function isInvokedBy(parent: SyntaxNode, child: SyntaxNode): boolean {
  const type: string = parent.type;

  if (type === "CallExpression" || type === "NewExpression") {
    return "callee" in parent && parent.callee === child;
  }

  if (type === "TaggedTemplateExpression") {
    return "tag" in parent && parent.tag === child;
  }

  if (type === "Decorator") {
    return "expression" in parent && parent.expression === child;
  }

  return (
    classNodeTypes.includes(type) &&
    "superClass" in parent &&
    parent.superClass === child
  );
}
