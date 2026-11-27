import type { Scope, SourceCode } from "eslint";

import { accessesOf } from "#tools/eslint/effects/utils/accessesOf";
import type { HintedUnit } from "#tools/eslint/effects/types/HintedUnit";
import type { PendingCharge } from "#tools/eslint/effects/types/PendingCharge";
import type { SyntaxNode } from "#tools/eslint/effects/types/SyntaxNode";

/**
 * Passes to `append`, by the function or class running it, what each access to
 * `variables` charges: an invocation or a read of the static members it names,
 * at the rank `rank` gives them, nothing when it gives none; an access `rank`
 * hints as a `pass` charges what invoking it costs.
 */
export function chargeAccesses(
  sourceCode: SourceCode,
  variables: readonly Scope.Variable[],
  append: (runner: SyntaxNode | undefined, pending: PendingCharge) => void,
  rank: (
    members: readonly string[],
    invoked: boolean,
    site: SyntaxNode,
  ) => HintedUnit | undefined,
) {
  for (const access of accessesOf(sourceCode, variables)) {
    const ranked = rank(access.members, access.invoked, access.site);

    if (ranked !== undefined) {
      append(access.runner, {
        node: access.site,
        operation: access.invoked || ranked.hint === "pass" ? "invoke" : "read",
        sideEffect: false,
        ...ranked,
      });
    }
  }
}
