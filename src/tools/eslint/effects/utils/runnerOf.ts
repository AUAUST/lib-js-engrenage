import { functionNodeTypes } from "#tools/eslint/effects/constants";
import { isInvokedBy } from "#tools/eslint/effects/utils/isInvokedBy";
import type { SyntaxNode } from "#tools/eslint/effects/types/SyntaxNode";

/**
 * The function or class whose invocation runs the last node of `chain`, its
 * ancestors before it, or `undefined` when it runs while the module evaluates;
 * a constructor and instance fields run when their class is invoked, an IIFE
 * where it is written.
 */
export function runnerOf(chain: readonly SyntaxNode[]): SyntaxNode | undefined {
  for (let index = chain.length - 2; index >= 0; index -= 1) {
    const ancestor = chain[index];
    const child = chain[index + 1];

    if (ancestor === undefined || child === undefined) {
      return;
    }

    const parent = chain[index - 1];

    if (functionNodeTypes.includes(ancestor.type)) {
      if (parent !== undefined && isInvokedBy(parent, ancestor)) {
        continue;
      }

      return parent?.type === "MethodDefinition" &&
        parent.kind === "constructor"
        ? chain[index - 3]
        : ancestor;
    }

    const type: string = ancestor.type;

    if (
      (type === "PropertyDefinition" || type === "AccessorProperty") &&
      "static" in ancestor &&
      !ancestor.static &&
      "value" in ancestor &&
      ancestor.value === child
    ) {
      return chain[index - 2];
    }
  }
}
