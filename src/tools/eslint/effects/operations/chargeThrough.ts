import type { EffectCharge } from "#tools/eslint/effects/types/EffectCharge";
import type { LocalCall } from "#tools/eslint/effects/types/LocalCall";
import type { PendingCharge } from "#tools/eslint/effects/types/PendingCharge";
import type { SyntaxNode } from "#tools/eslint/effects/types/SyntaxNode";

/**
 * Charges at evaluation, at `call`'s site, what the local function or class it
 * calls runs, through the local calls that one makes in turn.
 */
export function chargeThrough({
  call: { callee, node, name },
  runs,
  calls,
  charge,
}: {
  call: LocalCall;
  runs: ReadonlyMap<SyntaxNode | undefined, readonly PendingCharge[]>;
  calls: ReadonlyMap<SyntaxNode | undefined, readonly LocalCall[]>;
  charge(found: EffectCharge): void;
}) {
  const visited = new Set<SyntaxNode>();
  const pending = [callee];

  for (
    let runner = pending.pop();
    runner !== undefined;
    runner = pending.pop()
  ) {
    if (visited.has(runner)) {
      continue;
    }

    visited.add(runner);

    for (const ran of runs.get(runner) ?? []) {
      charge({
        ...ran,
        node,
        position: "evaluation",
        through: name,
        declared: undefined,
      });
    }

    for (const call of calls.get(runner) ?? []) {
      pending.push(call.callee);
    }
  }
}
