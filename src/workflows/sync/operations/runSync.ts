import { includes } from "@auaust/primitive-kit/arrays";
import { keys } from "@auaust/toolkit/object";

import { reportAgentChecks } from "#tools/agents/index";
import { syncTargets } from "#workflows/sync/operations/syncTargets";
import type { LoadedConfig } from "#project/config/index";
import type { SyncTargetFlags } from "#workflows/sync/types/SyncTargetFlags";
import type { SyncTargetName } from "#workflows/sync/types/SyncTargetName";

export async function runSync(
  config: LoadedConfig,
  {
    names = keys(syncTargets),
    flags = {},
  }: {
    names?: readonly SyncTargetName[];
    flags?: SyncTargetFlags;
  } = {},
) {
  for (const name of keys(syncTargets)) {
    if (includes(names, name)) {
      await syncTargets[name].sync(config, flags[name] ?? {});
    }
  }

  if (
    names.some((name) => {
      return name === "agents" || name === "claude" || name === "codex";
    })
  ) {
    await reportAgentChecks(config);
  }
}
