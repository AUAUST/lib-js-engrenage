import type { SyntaxNode } from "#tools/eslint/effects/types/SyntaxNode";

const patternTypes: ReadonlySet<string> = new Set([
  "ArrayPattern",
  "ObjectPattern",
  "RestElement",
]);

/**
 * Whether the last node of `chain`, its ancestors before it, is written: the
 * left side of an assignment or of a `for … of` or `for … in` declaring nothing,
 * a destructuring assignment's leaf, or the operand of `++`, `--` or `delete`.
 */
export function isWritten(chain: readonly SyntaxNode[]): boolean {
  const child = chain.at(-1);
  const parent = chain.at(-2);

  if (child === undefined || parent === undefined) {
    return false;
  }

  switch (parent.type) {
    case "AssignmentExpression":
    case "ForOfStatement":
    case "ForInStatement": {
      return parent.left === child;
    }

    case "UpdateExpression": {
      return true;
    }

    case "UnaryExpression": {
      return parent.operator === "delete";
    }

    case "AssignmentPattern": {
      return parent.left === child && isWritten(chain.slice(0, -1));
    }

    case "Property": {
      return (
        parent.value === child &&
        chain.at(-3)?.type === "ObjectPattern" &&
        isWritten(chain.slice(0, -1))
      );
    }

    default: {
      return patternTypes.has(parent.type) && isWritten(chain.slice(0, -1));
    }
  }
}
