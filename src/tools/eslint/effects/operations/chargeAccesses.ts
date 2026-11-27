import type { Scope, SourceCode } from "eslint";

import { accessesOf } from "#tools/eslint/effects/utils/accessesOf";
import type { PendingCharge } from "#tools/eslint/effects/types/PendingCharge";
import type { RankedUnit } from "#tools/eslint/effects/types/RankedUnit";
import type { SyntaxNode } from "#tools/eslint/effects/types/SyntaxNode";

/**
 * Passes to `append`, by the function or class running it, what each access to
 * `variables` charges: an invocation or a read of the static members it names,
 * at the rank `rank` gives them, nothing when it gives none.
 */
export function chargeAccesses(
  sourceCode: SourceCode,
  variables: readonly Scope.Variable[],
  append: (runner: SyntaxNode | undefined, pending: PendingCharge) => void,
  rank: (
    members: readonly string[],
    invoked: boolean,
  ) => (RankedUnit & { binding: string }) | undefined,
) {
  for (const access of accessesOf(sourceCode, variables)) {
    const ranked = rank(access.members, access.invoked);

    if (ranked !== undefined) {
      append(access.runner, {
        node: access.site,
        operation: access.invoked ? "invoke" : "read",
        sideEffect: false,
        ...ranked,
      });
    }
  }
}
