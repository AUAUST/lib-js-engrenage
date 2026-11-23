import { freeze } from "@auaust/toolkit/object";

import type { ConfigResolver } from "#project/config/index";
import type { ContributedEnvironmentEntry } from "#project/environments/types/ContributedEnvironmentEntry";

export async function listEnvironmentEntries(
  config: ConfigResolver,
): Promise<readonly ContributedEnvironmentEntry[]> {
  const environments = await config.context.registry.contributions(
    "environments",
    config,
  );

  return freeze(environments.map(({ entry }) => freeze({ entry })));
}
