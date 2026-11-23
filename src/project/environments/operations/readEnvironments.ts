import { freeze } from "@auaust/toolkit/object";

import { listEnvironmentEntries } from "#project/environments/operations/listEnvironmentEntries";
import { readEnvironment } from "#project/environments/operations/readEnvironment";
import type { ConfigResolver } from "#project/config/index";
import type { ContributedEnvironment } from "#project/environments/types/ContributedEnvironment";

export async function readEnvironments(
  config: ConfigResolver,
): Promise<readonly ContributedEnvironment[]> {
  const entries = await listEnvironmentEntries(config);

  return freeze(
    await Promise.all(
      entries.map(async (contributed) => {
        return freeze({
          ...contributed,
          environment: await readEnvironment(config, contributed.entry.name),
        });
      }),
    ),
  );
}
