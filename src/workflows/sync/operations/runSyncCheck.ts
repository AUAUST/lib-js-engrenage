import { map } from "@auaust/primitive-kit/arrays";

import { collectChanges, formatSyncResult, runSync } from "#project/sync/index";
import type { LoadedConfig } from "#project/config/index";
import type { GateResult } from "#project/gate/index";

// @debt sync targets warn through `console`, so this check prints their warnings beside the gate's output instead of returning them in its result
export async function runSyncCheck(config: LoadedConfig): Promise<GateResult> {
  const copy = config.context.copy();

  await runSync(copy);

  const outdated = await collectChanges(copy, { check: true });

  return {
    ok: outdated.length === 0,
    output: map(outdated, formatSyncResult).join("\n"),
  };
}
