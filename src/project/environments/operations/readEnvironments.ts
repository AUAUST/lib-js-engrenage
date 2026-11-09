import { freeze } from "@auaust/toolkit/object";

import { readEnvironment } from "#project/environments/operations/readEnvironment";
import type { ConfigResolver } from "#project/config/index";
import type { ContributedEnvironment } from "#project/environments/types/ContributedEnvironment";

export async function readEnvironments(
  config: ConfigResolver,
): Promise<readonly ContributedEnvironment[]> {
  const contributions = await config.context.registry.contributions(
    "environments",
    config,
  );

  return freeze(
    await Promise.all(
      contributions.map(async ({ entry }) => {
        return freeze({
          entry,
          environment: await readEnvironment(config, entry.name),
        });
      }),
    ),
  );
}
